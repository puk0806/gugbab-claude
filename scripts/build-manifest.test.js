// build-manifest.js — 체크리스트·settings.json·relations.json → manifest.json
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildManifest, parseHookCommand, SETTING_KEYS } = require('./build-manifest');

const REPO = path.resolve(__dirname, '..');

// 작은 가짜 레포를 임시 폴더에 만든다
function fakeRepo() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'bm-'));
  const w = (p, s) => { fs.mkdirSync(path.dirname(path.join(d, p)), { recursive: true }); fs.writeFileSync(path.join(d, p), s); };
  w('.claude/hooks/bash-guard.js', '');
  w('.claude/hooks/cc-notify.js', '');
  w('.claude/hooks/statusline.sh', '');
  w('.claude/rules/git.md', '');
  w('.claude/commands/commit.md', '');
  w('.claude/agents/meta/agent-creator.md', '');
  w('.claude/skills/react-core/SKILL.md', '');
  w('.claude/CLAUDE.common.md', '');
  const settings = {
    permissions: { defaultMode: 'acceptEdits', allow: ['Bash(ls:*)'], deny: ['Bash(rm -rf /:*)'], additionalDirectories: ['/tmp'] },
    enabledPlugins: { 'superpowers@superpowers-marketplace': true, 'codex@openai-codex': true },
    statusLine: { type: 'command', command: 'bash "$CLAUDE_PROJECT_DIR"/.claude/hooks/statusline.sh' },
    hooks: {
      PreToolUse: [{ matcher: '*', hooks: [{ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/bash-guard.js' }] }],
      Stop: [{ hooks: [{ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/cc-notify.js --quiet', timeout: 5 }] }],
    },
  };
  const checklist = [
    '## 1. 기본 설정',
    '- [x] **위험 명령 차단 목록 (deny)** — 차단',
    '- [x] **자동 허용 목록 (allow)** — 허용',
    '- [x] **시작 권한 모드 `acceptEdits`** — 모드',
    '- [x] **임시 폴더 접근 허용** — 임시',
    '- [ ] **superpowers 플러그인** (기본 켬) — 플러그인',
    '- [ ] **상태줄 `statusline.sh`** (기본 켬) — 상태줄',
    '- [x] **전역 CLAUDE.md 공통 부분** — 공통',
    '## 2. 훅',
    '- [x] **bash-guard** — 차단',
    '- [ ] **cc-notify** (기본 켬) — 알림',
    '  - 프로젝트 추천: 끔',
    '## 3. 룰',
    '- [ ] **git.md** (기본 켬) — 커밋',
    '## 4. 커맨드',
    '- [ ] **/commit** (기본 켬) — 커밋',
    '## 5. 에이전트',
    '- [ ] **agent-creator** (기본 끔) — 생성',
    '## 6. 스킬',
    '### 6.1 프론트',
    '  - [x] `react-core` — 리액트',
  ].join('\n');
  const relations = { bundles: { b1: { title: 'B', items: ['hook:cc-notify'] } }, standalone: ['hook:bash-guard'], blocks: { core: { title: 'C', items: ['agent:agent-creator'] } }, requires: { 'hook:cc-notify': ['hook:bash-guard'] }, conflicts: [], variants: {}, presets: { web: { title: '웹', enable: ['block:core', 'bundle:b1'] } }, edges: {} };
  return { d, settings, checklist, relations };
}

test('정상: 항목 상태·경로·훅 연결을 만든다', () => {
  const { d, settings, checklist, relations } = fakeRepo();
  const m = buildManifest({ root: d, checklistMd: checklist, settings, relations });
  assert.strictEqual(m.items['hook:bash-guard'].state, 'lock');
  assert.strictEqual(m.items['hook:bash-guard'].path, '.claude/hooks/bash-guard.js');
  assert.deepStrictEqual(m.items['hook:bash-guard'].hooks, [{ event: 'PreToolUse', matcher: '*', args: [] }]);
  assert.deepStrictEqual(m.items['hook:cc-notify'].hooks, [{ event: 'Stop', matcher: '', args: ['--quiet'], timeout: 5 }]);
  assert.strictEqual(m.items['hook:cc-notify'].projHint, 'off');
  assert.strictEqual(m.items['agent:agent-creator'].path, '.claude/agents/meta/agent-creator.md');
  assert.strictEqual(m.items['agent:agent-creator'].state, 'off');
  assert.strictEqual(m.items['skill:react-core'].path, '.claude/skills/react-core');
  assert.strictEqual(m.items['rule:git.md'].path, '.claude/rules/git.md');
  assert.strictEqual(m.items['command:commit'].path, '.claude/commands/commit.md');
  assert.strictEqual(m.items['setting:superpowers 플러그인'].key, 'plugin:superpowers@superpowers-marketplace');
  assert.strictEqual(m.base.statusLine.command, 'bash "${GUGBAB_ROOT}"/hooks/statusline.sh');
  assert.ok(!('hooks' in m.base), '훅은 base 에 남기지 않는다 — 디스패처가 연결');
  assert.deepStrictEqual(m.relations.requires, relations.requires);
  assert.deepStrictEqual(m.relations.presets, relations.presets);
});

test('정상: 같은 입력이면 결과가 같다 (재생성 결정적)', () => {
  const { d, settings, checklist, relations } = fakeRepo();
  const a = JSON.stringify(buildManifest({ root: d, checklistMd: checklist, settings, relations }));
  const b = JSON.stringify(buildManifest({ root: d, checklistMd: checklist, settings, relations }));
  assert.strictEqual(a, b);
});

test('정상: 실제 레포 manifest.json 이 최신이다 (손으로 고치거나 재생성을 빠뜨리지 않았는지)', () => {
  const { loadInputs } = require('./build-manifest');
  const fresh = buildManifest(loadInputs(REPO));
  const onDisk = JSON.parse(fs.readFileSync(path.join(REPO, 'manifest.json'), 'utf8'));
  assert.deepStrictEqual(onDisk, fresh, 'node scripts/build-manifest.js 로 다시 만드세요');
});

test('악성: 연결된 훅 명령이 .claude/hooks 밖 파일을 가리키면 오류', () => {
  const { d, settings, checklist, relations } = fakeRepo();
  settings.hooks.PreToolUse[0].hooks.push({ type: 'command', command: 'node /tmp/evil.js' });
  assert.throws(() => buildManifest({ root: d, checklistMd: checklist, settings, relations }), /훅 명령 형식/);
});

test('악성: 체크리스트에 있지만 파일이 없는 항목은 오류 (없는 파일 링크 방지)', () => {
  const { d, settings, checklist, relations } = fakeRepo();
  fs.rmSync(path.join(d, '.claude/rules/git.md'));
  assert.throws(() => buildManifest({ root: d, checklistMd: checklist, settings, relations }), /파일 없음: rule:git\.md/);
});

test('악성: relations 가 체크리스트에 없는 항목을 가리키면 오류', () => {
  const { d, settings, checklist, relations } = fakeRepo();
  relations.requires['hook:cc-notify'].push('hook:ghost');
  assert.throws(() => buildManifest({ root: d, checklistMd: checklist, settings, relations }), /없는 항목.*hook:ghost/);
});

test('악성: 프리셋이 없는 블록이나 개별 항목·이상한 값을 가리키면 오류', () => {
  for (const bad of [['block:ghost'], ['hook:cc-notify'], 'block:core', [42]]) {
    const { d, settings, checklist, relations } = fakeRepo();
    relations.presets.web.enable = bad;
    assert.throws(() => buildManifest({ root: d, checklistMd: checklist, settings, relations }), /프리셋/, JSON.stringify(bad));
  }
  const { d, settings, checklist, relations } = fakeRepo();
  relations.presets = { '__proto__x': { title: 'x', enable: [] } };
  assert.throws(() => buildManifest({ root: d, checklistMd: checklist, settings, relations }), /프리셋/);
});

test('악성: 연결은 있는데 체크리스트에 없는 훅은 오류 (조용히 빠지지 않게)', () => {
  const { d, settings, checklist, relations } = fakeRepo();
  fs.writeFileSync(path.join(d, '.claude/hooks/sneaky.js'), '');
  settings.hooks.Stop[0].hooks.push({ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/sneaky.js' });
  assert.throws(() => buildManifest({ root: d, checklistMd: checklist, settings, relations }), /체크리스트에 없는 훅: sneaky/);
});

test('경계: 모르는 설정 항목 이름은 오류 (체크리스트 문구 변경을 알아채게)', () => {
  const { d, settings, checklist, relations } = fakeRepo();
  const md = checklist.replace('**임시 폴더 접근 허용**', '**임시 폴더 허용**');
  assert.throws(() => buildManifest({ root: d, checklistMd: md, settings, relations }), /모르는 설정 항목/);
  assert.ok(Object.keys(SETTING_KEYS).length >= 7);
});

test('경계: 훅 명령 해석 — 따옴표·인자·sh', () => {
  assert.deepStrictEqual(parseHookCommand('node "$CLAUDE_PROJECT_DIR"/.claude/hooks/staleness-check.js --strict'), { name: 'staleness-check', ext: 'js', args: ['--strict'] });
  assert.deepStrictEqual(parseHookCommand('bash "$CLAUDE_PROJECT_DIR"/.claude/hooks/statusline.sh'), { name: 'statusline', ext: 'sh', args: [] });
  assert.strictEqual(parseHookCommand('node .claude/hooks/../../x.js'), null);
  assert.strictEqual(parseHookCommand(''), null);
  assert.strictEqual(parseHookCommand('node "$CLAUDE_PROJECT_DIR"/.claude/hooks/a.js; rm -rf ~'), null);
});

test('경계: 훅이 settings 에 연결되지 않았으면 hooks 는 빈 배열', () => {
  const { d, settings, checklist, relations } = fakeRepo();
  delete settings.hooks.Stop;
  const m = buildManifest({ root: d, checklistMd: checklist, settings, relations });
  assert.deepStrictEqual(m.items['hook:cc-notify'].hooks, []);
});

// ── /harness 설명칸용 desc·about (2026-10-28) ────────────────────────
const withDetails = (lines) => {
  const r = fakeRepo();
  r.checklist = r.checklist.replace('- [ ] **cc-notify** (기본 켬) — 알림\n  - 프로젝트 추천: 끔', ['- [ ] **cc-notify** (기본 켬) — 알림 `--quiet` **끝**', ...lines].join('\n'));
  return { ...r, m: buildManifest({ root: r.d, checklistMd: r.checklist, settings: r.settings, relations: r.relations }) };
};

test('정상: 체크리스트 한 줄 설명은 desc, 하는 일·이럴 때·주의 줄은 about 으로 — 마크다운 기호는 뺌', () => {
  const { m } = withDetails(['  - 하는 일: 답변이 끝나면 `소리`로 알림', '  - 이럴 때: 자리를 비울 때', '  - 주의: 맥 전용']);
  assert.strictEqual(m.items['hook:cc-notify'].desc, '알림 --quiet 끝');
  assert.deepStrictEqual(m.items['hook:cc-notify'].about, ['하는 일: 답변이 끝나면 소리로 알림', '이럴 때: 자리를 비울 때', '주의: 맥 전용']);
  assert.strictEqual(m.items['hook:bash-guard'].desc, '차단');
  assert.ok(!('about' in m.items['hook:bash-guard']), '설명 줄이 없으면 about 없음');
});

test('정상: 이름 목록·연관·날짜 같은 줄은 about 에 넣지 않고, 정해진 순서(하는 일 → … → 주의)로', () => {
  const { m } = withDetails(['  - 주의: 마지막', '  - 쓰는 스킬: a, b', '  - 연결 에이전트: x', '  - 연관: bash-guard', '  - 2026-10-15 사용자 결정으로 고정', '  - 하는 일: 처음']);
  assert.deepStrictEqual(m.items['hook:cc-notify'].about, ['하는 일: 처음', '주의: 마지막']);
});

test('악성: 설명 줄의 제어문자(ESC·벨)는 지우고 아주 긴 줄은 400자로 자름 — manifest 크기·화면 보호', () => {
  const { m } = withDetails([`  - 하는 일: \x1b[31m빨강\x07${'가'.repeat(1000)}`]);
  const a = m.items['hook:cc-notify'].about[0];
  assert.ok(!/[\x00-\x1f\x7f]/.test(a));
  assert.ok(a.startsWith('하는 일: 빨강'));
  assert.strictEqual(a.length, 400);
  assert.ok(a.endsWith('…'));
});

test('경계: 실제 체크리스트 — 모든 항목에 desc 가 있고 about 줄은 모두 400자 이하', () => {
  const m = JSON.parse(fs.readFileSync(path.join(REPO, 'manifest.json'), 'utf8'));
  for (const [id, it] of Object.entries(m.items)) {
    assert.ok(typeof it.desc === 'string' && it.desc.length > 0, `${id} desc 없음`);
    for (const a of it.about || []) assert.ok(a.length <= 400, `${id} about 이 너무 김`);
  }
});
