// update.js — 실행 때 원격 하네스 최신화 (1시간에 한 번, 3초 제한, fast-forward 만)
// 정상 / 악성·우회 / 경계 3계층 — 진짜 git 저장소 두 개(원격·설치본)로 시험
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const { checkUpdate, latestTag } = require('./update');

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
