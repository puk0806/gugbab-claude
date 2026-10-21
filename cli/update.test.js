// update.js — 실행 때 원격 하네스 최신화 (1시간에 한 번, 3초 제한, fast-forward 만)
// 정상 / 악성·우회 / 경계 3계층 — 진짜 git 저장소 두 개(원격·설치본)로 시험
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const { checkUpdate, latestTag, versionInfo, readChannel } = require('./update');

const tmp = (p) => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), p)));
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' } }).trim();

function setup() {
  const origin = tmp('up-origin-');
  sh('git init -q -b main && echo 1 > f && git add f && git commit -q -m one && git tag v1.0.0', origin);
  const home = path.join(tmp('up-home-'), 'gugbab');
  sh(`git clone -q --branch v1.0.0 "${origin}" "${home}" 2>/dev/null || git clone -q "${origin}" "${home}"`, os.tmpdir());
  sh('git checkout -q v1.0.0', home);
  const state = tmp('up-state-');
  return { origin, home, state };
}
const head = (dir) => sh('git rev-parse HEAD', dir);
const now = () => Date.parse('2026-10-16T00:00:00Z');

test('정상: stable — 새 태그가 있으면 그 태그로, 한 줄 안내', () => {
  const s = setup();
  sh('echo 2 > f && git commit -qam two && git tag v1.1.0', s.origin);
  const r = checkUpdate({ codeHome: s.home, stateDir: s.state, channel: 'stable', now: now() });
  assert.strictEqual(r.updated, true);
  assert.match(r.message, /v1\.0\.0 → v1\.1\.0/);
  assert.strictEqual(head(s.home), sh('git rev-parse v1.1.0', s.origin));
});

test('정상: 1시간 안에 다시 실행하면 확인하지 않음', () => {
  const s = setup();
  checkUpdate({ codeHome: s.home, stateDir: s.state, channel: 'stable', now: now() });
  sh('echo 3 > f && git commit -qam three && git tag v1.2.0', s.origin);
  const r = checkUpdate({ codeHome: s.home, stateDir: s.state, channel: 'stable', now: now() + 30 * 60 * 1000 });
  assert.strictEqual(r.skipped, 'recent');
  const r2 = checkUpdate({ codeHome: s.home, stateDir: s.state, channel: 'stable', now: now() + 61 * 60 * 1000 });
  assert.strictEqual(r2.updated, true);
});

test('정상: 개발 모드·버전 고정이면 갱신하지 않음', () => {
  const s = setup();
  sh('echo 2 > f && git commit -qam two && git tag v1.1.0', s.origin);
  assert.strictEqual(checkUpdate({ codeHome: s.home, stateDir: s.state, dev: true, now: now() }).skipped, 'dev');
  assert.strictEqual(checkUpdate({ codeHome: s.home, stateDir: s.state, pin: 'v1.0.0', now: now() }).skipped, 'pinned');
});

test('악성: 로컬에서 고친 파일이 있으면 덮어쓰지 않고 경고', () => {
  const s = setup();
  sh('echo 2 > f && git commit -qam two && git tag v1.1.0', s.origin);
  fs.writeFileSync(path.join(s.home, 'f'), 'local edit');
  const before = head(s.home);
  const r = checkUpdate({ codeHome: s.home, stateDir: s.state, channel: 'stable', now: now() });
  assert.strictEqual(r.updated, false);
  assert.match(r.message, /로컬 변경/);
  assert.strictEqual(head(s.home), before);
  assert.strictEqual(fs.readFileSync(path.join(s.home, 'f'), 'utf8'), 'local edit');
});

test('악성: 원격 이력이 갈라졌으면(fast-forward 불가) 갱신 거부', () => {
  const s = setup();
  sh('git checkout -q -b side v1.0.0~0 && git reset -q --hard v1.0.0', s.origin);
  sh('git checkout -q --orphan rewrite && echo x > f && git add f && git commit -q -m rewritten && git tag v2.0.0', s.origin);
  const before = head(s.home);
  const r = checkUpdate({ codeHome: s.home, stateDir: s.state, channel: 'stable', now: now() });
  assert.strictEqual(r.updated, false);
  assert.match(r.message, /fast-forward/);
  assert.strictEqual(head(s.home), before);
});

test('악성: 태그 이름에 옵션·이상한 문자 → 후보에서 제외', () => {
  assert.strictEqual(latestTag(['v1.0.0', '--upload-pack=x', 'v1.2.0', 'v1.10.0', 'v2.0.0-rc1', 'vx']), 'v1.10.0');
});

test('경계: 원격이 없거나(오프라인) git 저장소가 아니면 조용히 건너뜀', () => {
  const s = setup();
  fs.rmSync(s.origin, { recursive: true, force: true });
  const r = checkUpdate({ codeHome: s.home, stateDir: s.state, channel: 'stable', now: now() });
  assert.strictEqual(r.updated, false);
  assert.ok(r.skipped === 'fetch-failed', JSON.stringify(r));
  const notRepo = tmp('up-not-');
  assert.strictEqual(checkUpdate({ codeHome: notRepo, stateDir: s.state, channel: 'stable', now: now() + 1e8 }).skipped, 'not-git');
});

test('경계: main 채널 — origin/main 으로 fast-forward', () => {
  const s = setup();
  sh('git checkout -q main', s.home);
  sh('echo 4 > f && git commit -qam four', s.origin);
  const r = checkUpdate({ codeHome: s.home, stateDir: s.state, channel: 'main', now: now() });
  assert.strictEqual(r.updated, true);
  assert.strictEqual(head(s.home), sh('git rev-parse main', s.origin));
});

test('정상: branch 채널 — 설치할 때 고른 브랜치(origin/<브랜치>)를 따라 fast-forward (PR 머지 전 시험용)', () => {
  const s = setup();
  sh('git checkout -q -b feat/x && echo 5 > f && git commit -qam five', s.origin);
  sh('git fetch -q origin && git checkout -q -b feat/x origin/feat/x', s.home);
  sh('echo 6 > f && git commit -qam six', s.origin);
  const r = checkUpdate({ codeHome: s.home, stateDir: s.state, channel: 'branch', branch: 'feat/x', now: now() });
  assert.strictEqual(r.updated, true, JSON.stringify(r));
  assert.strictEqual(head(s.home), sh('git rev-parse feat/x', s.origin));
  assert.match(r.message, /feat\/x/);
});

test('악성: branch 채널에 이상한 브랜치 이름(옵션·경로 조작·빈 값) → 갱신하지 않음', () => {
  const s = setup();
  for (const bad of ['--upload-pack=x', '../main', '', null, 'a b', 'x;rm']) {
    const r = checkUpdate({ codeHome: s.home, stateDir: path.join(s.state, String(Math.random())), channel: 'branch', branch: bad, now: now() });
    assert.strictEqual(r.updated, false, String(bad));
    assert.strictEqual(r.skipped, 'bad-branch', String(bad));
  }
});

// ── versionInfo — status·doctor 가 보여 줄 지금 버전과 채널 (1.0.0 → 1.0.1 업데이트 시험 때 확인용) ──
const writeChannel = (s, obj) => { fs.mkdirSync(s.state, { recursive: true }); fs.writeFileSync(path.join(s.state, 'channel.json'), JSON.stringify(obj)); };

test('정상: stable 채널 + 태그 위 → "v1.0.0 (stable …)", 업데이트하면 새 태그로 바뀜', () => {
  const s = setup();
  writeChannel(s, { channel: 'stable' });
  let v = versionInfo({ codeHome: s.home, stateDir: s.state });
  assert.deepStrictEqual([v.version, v.channel], ['v1.0.0', 'stable']);
  assert.match(v.text, /^v1\.0\.0 \(stable/);
  sh('echo 2 > f && git commit -qam two && git tag v1.0.1', s.origin);
  checkUpdate({ codeHome: s.home, stateDir: s.state, channel: 'stable', now: now() });
  v = versionInfo({ codeHome: s.home, stateDir: s.state });
  assert.strictEqual(v.version, 'v1.0.1');
});

test('정상: 고정(pin)·main·branch·개발 모드 표시', () => {
  const s = setup();
  writeChannel(s, { channel: 'stable', pin: 'v1.0.0' });
  assert.match(versionInfo({ codeHome: s.home, stateDir: s.state }).text, /v1\.0\.0 \(고정/);
  sh('git checkout -q main', s.home);
  writeChannel(s, { channel: 'main' });
  const m = versionInfo({ codeHome: s.home, stateDir: s.state });
  assert.strictEqual(m.channel, 'main');
  assert.match(m.text, /main 채널/);
  writeChannel(s, { channel: 'branch', branch: 'feat/x' });
  assert.match(versionInfo({ codeHome: s.home, stateDir: s.state }).text, /feat\/x .*브랜치/);
  assert.match(versionInfo({ codeHome: s.home, stateDir: s.state, dev: true }).text, /개발 모드/);
});

test('정상: main 채널인데 안정 버전 태그가 있으면 stable 로 바꾸는 법을 알려 줌', () => {
  const s = setup();
  sh('git checkout -q main', s.home);
  writeChannel(s, { channel: 'main' });
  const v = versionInfo({ codeHome: s.home, stateDir: s.state });
  assert.match(v.hint, /v1\.0\.0.*설치 명령을 다시/);
});

test('악성: channel.json 의 이상한 값(모르는 채널·명령 같은 브랜치 이름)은 그대로 출력하지 않음', () => {
  const s = setup();
  writeChannel(s, { channel: 'evil', branch: '$(rm -rf ~)' });
  const v = versionInfo({ codeHome: s.home, stateDir: s.state });
  assert.strictEqual(v.channel, 'stable');
  writeChannel(s, { channel: 'branch', branch: '$(rm -rf ~)\u001b[2J' });
  const b = versionInfo({ codeHome: s.home, stateDir: s.state });
  assert.ok(!b.text.includes('$(') && !b.text.includes('\u001b'), b.text);
});

test('경계: git 저장소가 아니거나 channel.json 이 없거나 깨져도 죽지 않음', () => {
  const d = tmp('up-nogit-');
  assert.strictEqual(versionInfo({ codeHome: d, stateDir: d }).version, '?');
  const s = setup();
  fs.mkdirSync(s.state, { recursive: true });
  fs.writeFileSync(path.join(s.state, 'channel.json'), '{broken');
  assert.strictEqual(versionInfo({ codeHome: s.home, stateDir: s.state }).channel, 'stable');
});

test('정상·경계: 채널 기록은 설치 폴더(<코드>/state) 것을 먼저 읽음 — 데이터 폴더를 따로 둬도(GUGBAB_DATA) 맞게 표시', () => {
  const s = setup();
  sh('git checkout -q main', s.home);
  fs.mkdirSync(path.join(s.home, 'state'), { recursive: true });
  fs.writeFileSync(path.join(s.home, 'state', 'channel.json'), JSON.stringify({ channel: 'main' }));
  const otherData = tmp('up-data-');
  assert.strictEqual(versionInfo({ codeHome: s.home, stateDir: otherData }).channel, 'main');
  assert.deepStrictEqual(readChannel({ codeHome: s.home, stateDir: otherData }), { channel: 'main' });
  // 설치 폴더에 없으면 데이터 폴더 것, 둘 다 없으면 빈 값(stable)
  fs.rmSync(path.join(s.home, 'state'), { recursive: true });
  writeChannel(s, { channel: 'branch', branch: 'feat/x' });
  assert.strictEqual(readChannel({ codeHome: s.home, stateDir: s.state }).branch, 'feat/x');
  assert.deepStrictEqual(readChannel({ codeHome: tmp('up-x-'), stateDir: tmp('up-y-') }), {});
});

test('악성: 설치 폴더의 channel.json 이 깨졌거나 배열·링크로 밖을 가리키면 무시', () => {
  const s = setup();
  fs.mkdirSync(path.join(s.home, 'state'), { recursive: true });
  fs.writeFileSync(path.join(s.home, 'state', 'channel.json'), '[1,2]');
  writeChannel(s, { channel: 'main' });
  assert.deepStrictEqual(readChannel({ codeHome: s.home, stateDir: s.state }), { channel: 'main' });
  const outside = path.join(tmp('up-out-'), 'c.json');
  fs.writeFileSync(outside, JSON.stringify({ channel: 'branch', branch: 'evil' }));
  fs.rmSync(path.join(s.home, 'state', 'channel.json'));
  // 윈도우 권한 없으면(EPERM) 링크 시험만 건너뜀 — 깨진 값·배열 시험은 위에서 이미 확인
  if (require('../.claude/hooks/lib/testfs').trySymlink(outside, path.join(s.home, 'state', 'channel.json')) !== null) assert.deepStrictEqual(readChannel({ codeHome: s.home, stateDir: s.state }), { channel: 'main' });
});

// ── 확인 결과 기록 (state/last-check.json — 세션 시작 때 wrapper-version-check 훅이 화면에 보여 줌, 2026-10-19) ──
const { writeLastCheck } = require('./update');
const L = '12345-1792370048';
const readLast = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'last-check.json'), 'utf8'));

test('정상: 갱신·최신·1시간 안 결과가 사유 코드와 버전(이전→새, 지금)을 돌려줌', () => {
  const s = setup();
  sh('echo 2 > f && git commit -qam two && git tag v1.1.0', s.origin);
  const r = checkUpdate({ codeHome: s.home, stateDir: s.state, channel: 'stable', now: now() });
  assert.deepStrictEqual([r.updated, r.from, r.to], [true, 'v1.0.0', 'v1.1.0']);
  const t = setup();
  const r2 = checkUpdate({ codeHome: t.home, stateDir: t.state, channel: 'stable', now: now() });
  assert.deepStrictEqual([r2.skipped, r2.version], ['up-to-date', 'v1.0.0']);
  const r3 = checkUpdate({ codeHome: t.home, stateDir: t.state, channel: 'stable', now: now() + 60000 });
  assert.deepStrictEqual([r3.skipped, r3.lastCheckAt], ['recent', now()]);
});

test('정상: 실행 값이 있으면 결과를 기록 — 갱신은 이전·새 버전, 1시간 안은 마지막 확인 시각', () => {
  const d = tmp('up-last-');
  assert.strictEqual(writeLastCheck({ stateDir: d, launch: L, result: { updated: true, from: 'v1.0.4', to: 'v1.0.5' }, now: 7 }), true);
  assert.deepStrictEqual(readLast(d), { launch: L, at: 7, result: 'updated', from: 'v1.0.4', to: 'v1.0.5' });
  writeLastCheck({ stateDir: d, launch: L, result: { updated: false, skipped: 'recent', lastCheckAt: 3 }, now: 8 });
  assert.deepStrictEqual(readLast(d), { launch: L, at: 8, result: 'recent', lastCheckAt: 3 });
  writeLastCheck({ stateDir: d, launch: L, result: { updated: false, skipped: 'local-changes', message: 'x' }, now: 9 });
  assert.deepStrictEqual(readLast(d), { launch: L, at: 9, result: 'local-changes' }, '메시지(경로 포함)는 기록하지 않음');
  assert.deepStrictEqual(fs.readdirSync(d), ['last-check.json'], '임시 파일이 남지 않음');
});

test('악성: 조작된 실행 값·모르는 결과는 기록하지 않음', () => {
  const d = tmp('up-last-');
  for (const launch of [undefined, '', '$(id)', `${L}\n`, '../1-2', '1'.repeat(40), 12345]) {
    assert.strictEqual(writeLastCheck({ stateDir: d, launch, result: { updated: false, skipped: 'up-to-date' } }), false, String(launch));
  }
  assert.strictEqual(writeLastCheck({ stateDir: d, launch: L, result: { updated: false, skipped: 'rm -rf' } }), false);
  assert.strictEqual(writeLastCheck({ stateDir: d, launch: L, result: null }), false);
  assert.deepStrictEqual(fs.readdirSync(d), []);
});

test('악성: 기록 자리에 심은 링크·폴더는 따라가 쓰지 않음', () => {
  const d = tmp('up-last-');
  const victim = path.join(tmp('up-victim-'), 'v.txt'); fs.writeFileSync(victim, 'keep');
  if (require('../.claude/hooks/lib/testfs').trySymlink(victim, path.join(d, 'last-check.json')) !== null) { // 윈도우 권한 없으면 폴더 시험만
    assert.strictEqual(writeLastCheck({ stateDir: d, launch: L, result: { updated: false, skipped: 'up-to-date' } }), false);
    assert.strictEqual(fs.readFileSync(victim, 'utf8'), 'keep');
  }
  const e = tmp('up-last-'); fs.mkdirSync(path.join(e, 'last-check.json'));
  assert.strictEqual(writeLastCheck({ stateDir: e, launch: L, result: { updated: false, skipped: 'up-to-date' } }), false);
});

test('경계: 개발 모드는 기록하지 않고, 상태 폴더가 없으면 만들고, 못 쓰는 곳이면 false (죽지 않음)', () => {
  const d = tmp('up-last-');
  assert.strictEqual(writeLastCheck({ stateDir: d, launch: L, result: { updated: false, skipped: 'dev' } }), false);
  const nested = path.join(tmp('up-last-'), 'a', 'state');
  assert.strictEqual(writeLastCheck({ stateDir: nested, launch: L, result: { updated: false, skipped: 'fetch-failed' } }), true);
  assert.strictEqual(readLast(nested).result, 'fetch-failed');
  const file = path.join(tmp('up-last-'), 'plain'); fs.writeFileSync(file, 'x');
  assert.strictEqual(writeLastCheck({ stateDir: path.join(file, 'state'), launch: L, result: { updated: false, skipped: 'up-to-date' } }), false);
});
