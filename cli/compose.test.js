// compose.js — 프로젝트별 설정 폴더 조립
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { compose } = require('./compose');

const tmp = (p) => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), p)));
const w = (f, s = '') => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const isLink = (p) => { try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; } };
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

function setup() {
  const code = tmp('cp-code-');
  for (const f of ['.claude/hooks/bash-guard.js', '.claude/hooks/cc-notify.js', '.claude/hooks/statusline.sh', '.claude/rules/git.md', '.claude/rules/java.md',
    '.claude/commands/commit.md', '.claude/agents/meta/agent-creator.md', '.claude/skills/react-core/SKILL.md', '.claude/skills/vue-core/SKILL.md',
    '.claude/CLAUDE.common.md', 'cli/hook.js']) w(path.join(code, f));
  const home = tmp('cp-home-');
  for (const d of ['projects', 'plugins', 'plans']) fs.mkdirSync(path.join(home, '.claude', d), { recursive: true });
  const projRoot = tmp('cp-proj-');
  w(path.join(home, '.claude.json'), JSON.stringify({ hasCompletedOnboarding: true, lastOnboardingVersion: '2.1.0', theme: 'dark', oauthAccount: { secret: 'x' },
    projects: { [projRoot]: { hasTrustDialogAccepted: true, allowedTools: ['Bash'] } } }));
  const data = tmp('cp-data-');
  const project = { root: projRoot, id: 'p', dir: path.join(data, 'projects', 'p'), configDir: path.join(data, 'projects', 'p', '.claude') };
  const paths = { codeHome: code, harnessRoot: path.join(code, '.claude'), home, claudeHome: path.join(home, '.claude') };
  const item = (type, p, extra = {}) => ({ type, path: p, ...extra });
  const manifest = {
    items: {
      'hook:bash-guard': item('hook', '.claude/hooks/bash-guard.js', { hooks: [{ event: 'PreToolUse', matcher: '*', args: [] }] }),
      'hook:cc-notify': item('hook', '.claude/hooks/cc-notify.js', { hooks: [{ event: 'Stop', matcher: '', args: [] }] }),
      'rule:git.md': item('rule', '.claude/rules/git.md'),
      'rule:java.md': item('rule', '.claude/rules/java.md'),
      'command:commit': item('command', '.claude/commands/commit.md'),
      'agent:agent-creator': item('agent', '.claude/agents/meta/agent-creator.md'),
      'skill:react-core': item('skill', '.claude/skills/react-core'),
      'skill:vue-core': item('skill', '.claude/skills/vue-core'),
      'setting:deny': { type: 'setting', key: 'permissions.deny' },
      'setting:allow': { type: 'setting', key: 'permissions.allow' },
      'setting:superpowers': { type: 'setting', key: 'plugin:superpowers@superpowers-marketplace' },
      'setting:statusline': { type: 'setting', key: 'statusLine', path: '.claude/hooks/statusline.sh' },
      'setting:claude-md': { type: 'setting', key: 'claudeMd', path: '.claude/CLAUDE.common.md' },
      'hook:codex-review-guard': item('hook', '.claude/hooks/bash-guard.js', { hooks: [] }),
    },
    hookOrder: { PreToolUse: [{ id: 'hook:bash-guard', matcher: '*', args: [] }], Stop: [{ id: 'hook:cc-notify', matcher: '', args: [], timeout: 5 }] },
    pluginBundles: { 'codex@openai-codex': 'codex-review' },
    relations: { bundles: { 'codex-review': { items: ['hook:codex-review-guard'] } } },
    base: {
      permissions: { defaultMode: 'acceptEdits', allow: ['Bash(ls:*)'], deny: ['Bash(rm -rf /:*)'] },
      statusLine: { type: 'command', command: 'bash "${GUGBAB_ROOT}"/hooks/statusline.sh' },
      enabledPlugins: { 'superpowers@superpowers-marketplace': true, 'codex@openai-codex': true },
    },
  };
  const on = ['hook:bash-guard', 'hook:cc-notify', 'rule:git.md', 'command:commit', 'skill:react-core', 'setting:deny', 'setting:allow', 'setting:superpowers', 'setting:statusline', 'setting:claude-md'];
  const resolved = { enabled: new Set(on), locked: new Set(['hook:bash-guard']) };
  return { code, home, data, project, paths, manifest, resolved };
}

test('정상: 켜진 항목만 링크, 공유 폴더 링크, CLAUDE.md', () => {
  const s = setup();
  const r = compose(s);
  const c = s.project.configDir;
  assert.strictEqual(fs.readlinkSync(path.join(c, 'rules', 'git.md')), path.join(s.code, '.claude/rules/git.md'));
  assert.ok(!fs.existsSync(path.join(c, 'rules', 'java.md')));
  assert.ok(isLink(path.join(c, 'skills', 'react-core')) && !fs.existsSync(path.join(c, 'skills', 'vue-core')));
  assert.ok(isLink(path.join(c, 'commands', 'commit.md')));
  assert.ok(!fs.existsSync(path.join(c, 'agents', 'agent-creator.md')));
  assert.strictEqual(fs.readlinkSync(path.join(c, 'CLAUDE.md')), path.join(s.code, '.claude/CLAUDE.common.md'));
  for (const d of ['projects', 'plugins', 'plans']) assert.strictEqual(fs.readlinkSync(path.join(c, d)), path.join(s.home, '.claude', d));
  assert.ok(r.changed);
});

test('정상: settings.json — 이벤트마다 디스패처 하나, 권한·상태줄·플러그인', () => {
  const s = setup();
  compose(s);
  const st = readJson(path.join(s.project.configDir, 'settings.json'));
  assert.ok(!fs.lstatSync(path.join(s.project.configDir, 'settings.json')).isSymbolicLink(), '일반 파일 (PoC 3)');
  assert.deepStrictEqual(Object.keys(st.hooks).sort(), ['PreToolUse', 'Stop']);
  assert.strictEqual(st.hooks.PreToolUse[0].matcher, '*');
  assert.strictEqual(st.hooks.PreToolUse[0].hooks[0].command, `node "${s.code}/cli/hook.js" PreToolUse`);
  assert.strictEqual(st.hooks.Stop[0].matcher, undefined);
  assert.strictEqual(st.statusLine.command, `bash "${s.code}/.claude"/hooks/statusline.sh`);
  assert.deepStrictEqual(st.permissions.deny, ['Bash(rm -rf /:*)']);
  assert.strictEqual(st.permissions.defaultMode, undefined, '설정 항목이 꺼져 있으면(목록에 없음) 넣지 않음');
  assert.strictEqual(st.enabledPlugins['superpowers@superpowers-marketplace'], true);
  assert.strictEqual(st.enabledPlugins['codex@openai-codex'], false, 'codex-review 묶음이 꺼져 있으면 플러그인도 끔');
});

test('정상: 첫 실행 화면 — 온보딩 완료 표시와 그 폴더의 신뢰 기록만 옮김', () => {
  const s = setup();
  compose(s);
  const cj = readJson(path.join(s.project.configDir, '.claude.json'));
  assert.strictEqual(cj.hasCompletedOnboarding, true);
  assert.strictEqual(cj.theme, 'dark');
  assert.strictEqual(cj.projects[s.project.root].hasTrustDialogAccepted, true);
  assert.strictEqual(cj.oauthAccount, undefined, '계정 정보는 옮기지 않음');
  assert.strictEqual(cj.projects[s.project.root].allowedTools, undefined);
  assert.strictEqual((fs.statSync(path.join(s.project.configDir, '.claude.json')).mode & 0o777), 0o600);
});

test('정상: 끈 항목의 링크는 지우고, 다시 조립해도 바뀐 게 없으면 changed=false', () => {
  const s = setup();
  compose(s);
  s.resolved.enabled.delete('rule:git.md');
  assert.ok(compose(s).changed);
  assert.ok(!fs.existsSync(path.join(s.project.configDir, 'rules', 'git.md')));
  assert.strictEqual(compose(s).changed, false);
});

test('정상: 프로젝트가 이미 가진 항목(.claude/skills·settings 훅)은 건너뜀 — 중복 방지', () => {
  const s = setup();
  w(path.join(s.project.root, '.claude/skills/react-core/SKILL.md'));
  w(path.join(s.project.root, '.claude/settings.json'), JSON.stringify({ hooks: { Stop: [{ hooks: [{ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/cc-notify.js' }] }] } }));
  const r = compose(s);
  assert.ok(!fs.existsSync(path.join(s.project.configDir, 'skills', 'react-core')));
  assert.deepStrictEqual(r.skippedHooks, ['hook:cc-notify']);
  const st = readJson(path.join(s.project.configDir, 'settings.json'));
  assert.deepStrictEqual(Object.keys(st.hooks), ['PreToolUse'], '건너뛴 훅만 있는 이벤트는 연결하지 않음');
  assert.deepStrictEqual(readJson(path.join(s.project.configDir, '.gugbab-state.json')).skippedHooks, ['hook:cc-notify']);
});

test('정상: 사용자가 settings.json 에 넣은 값은 다시 조립해도 남음 (allow 추가·다른 키)', () => {
  const s = setup();
  compose(s);
  const f = path.join(s.project.configDir, 'settings.json');
  const st = readJson(f);
  st.permissions.allow.push('Bash(make:*)');
  st.model = 'opus';
  fs.writeFileSync(f, JSON.stringify(st));
  compose(s);
  const st2 = readJson(f);
  assert.ok(st2.permissions.allow.includes('Bash(make:*)') && st2.permissions.allow.includes('Bash(ls:*)'));
  assert.strictEqual(st2.model, 'opus');
});

test('정상: 하네스 레포 자신을 열면 공통 CLAUDE.md 는 넣지 않음 (레포 CLAUDE.md 가 상위 집합)', () => {
  const s = setup();
  s.project.root = s.code;
  compose(s);
  assert.ok(!fs.existsSync(path.join(s.project.configDir, 'CLAUDE.md')));
});

test('악성: manifest 경로가 코드 폴더 밖(../../)이면 링크하지 않고 경고', () => {
  const s = setup();
  s.manifest.items['rule:git.md'].path = '../../../../etc/hosts';
  const r = compose(s);
  assert.ok(!fs.existsSync(path.join(s.project.configDir, 'rules', 'hosts')));
  assert.ok(r.warnings.some(x => x.includes('rule:git.md')));
});

test('악성: 코드 폴더 안 링크가 밖을 가리켜도(심볼릭 링크 탈출) 거부', () => {
  const s = setup();
  const outside = tmp('cp-out-');
  w(path.join(outside, 'evil.md'), 'evil');
  fs.rmSync(path.join(s.code, '.claude/rules/git.md'));
  fs.symlinkSync(path.join(outside, 'evil.md'), path.join(s.code, '.claude/rules/git.md'));
  const r = compose(s);
  assert.ok(!fs.existsSync(path.join(s.project.configDir, 'rules', 'git.md')));
  assert.ok(r.warnings.some(x => x.includes('rule:git.md')));
});

test('악성: 사용자가 설정 폴더에 직접 만든 파일·폴더는 덮어쓰거나 지우지 않음', () => {
  const s = setup();
  w(path.join(s.project.configDir, 'skills', 'react-core', 'SKILL.md'), 'mine');
  w(path.join(s.project.configDir, 'skills', 'my-own', 'SKILL.md'), 'mine');
  fs.mkdirSync(path.join(s.project.configDir, 'projects'), { recursive: true });
  const r = compose(s);
  assert.strictEqual(fs.readFileSync(path.join(s.project.configDir, 'skills', 'react-core', 'SKILL.md'), 'utf8'), 'mine');
  assert.ok(fs.existsSync(path.join(s.project.configDir, 'skills', 'my-own', 'SKILL.md')));
  assert.ok(!isLink(path.join(s.project.configDir, 'projects')));
  assert.ok(r.warnings.some(x => x.includes('projects')));
});

test('악성: 코드 폴더 경로에 따옴표·$·백틱이 있으면 명령 조립 거부 (셸 주입)', () => {
  for (const bad of ['/tmp/a"b', '/tmp/a$(x)', '/tmp/a`x`']) {
    const s = setup();
    s.paths.codeHome = bad;
    assert.throws(() => compose(s), /쓸 수 없는 문자/, bad);
  }
});

test('경계: 공유 대상 폴더(~/.claude/plugins)가 없으면 링크를 건너뛰고 경고', () => {
  const s = setup();
  fs.rmSync(path.join(s.home, '.claude', 'plugins'), { recursive: true });
  const r = compose(s);
  assert.ok(!fs.existsSync(path.join(s.project.configDir, 'plugins')));
  assert.ok(r.warnings.some(x => x.includes('plugins')));
});

test('경계: ~/.claude/plans 가 없으면 만들고 링크 (없으면 claude 가 설정 폴더에 진짜 폴더를 만들어 공유가 끊김)', () => {
  const s = setup();
  fs.rmSync(path.join(s.home, '.claude', 'plans'), { recursive: true });
  const r = compose(s);
  assert.ok(fs.statSync(path.join(s.home, '.claude', 'plans')).isDirectory());
  assert.ok(isLink(path.join(s.project.configDir, 'plans')));
  assert.ok(!r.warnings.some(x => x.includes('plans')));
});

// ── sessions/ 공유 (2026-10-19 결정 38 — 설정 폴더마다 따로면 ListAgents·SendMessage 가 다른 세션을 못 찾음) ──
const KEY = (pid) => `${pid}.${'ab'.repeat(32)}.key`;
const touchAt = (f, s, ms) => { w(f, s); const t = new Date(ms); fs.utimesSync(f, t, t); };

test('정상: sessions/ 를 ~/.claude/sessions 로 링크 (없으면 만들어서, 0700)', () => {
  const s = setup();
  const r = compose(s);
  const shared = path.join(s.home, '.claude', 'sessions');
  assert.strictEqual(fs.readlinkSync(path.join(s.project.configDir, 'sessions')), shared);
  assert.strictEqual(fs.statSync(shared).mode & 0o777, 0o700);
  assert.ok(!r.warnings.some(x => x.includes('sessions')), r.warnings.join('|'));
});

test('정상: 예전 실행이 만든 진짜 sessions/ 폴더는 세션 기록을 공유 폴더로 옮기고 링크로 바꿈', () => {
  const s = setup();
  const own = path.join(s.project.configDir, 'sessions');
  w(path.join(own, '123.json'), '{"pid":123}');
  w(path.join(own, KEY(123)), 'k');
  const r = compose(s);
  const shared = path.join(s.home, '.claude', 'sessions');
  assert.ok(isLink(own));
  assert.strictEqual(fs.readFileSync(path.join(shared, '123.json'), 'utf8'), '{"pid":123}');
  assert.ok(fs.existsSync(path.join(shared, KEY(123))));
  assert.ok(r.changed);
  assert.ok(!r.warnings.some(x => x.includes('sessions')), r.warnings.join('|'));
});

test('정상: 같은 pid 기록이 양쪽에 있으면 더 최근 것을 남김', () => {
  const s = setup();
  const own = path.join(s.project.configDir, 'sessions');
  const shared = path.join(s.home, '.claude', 'sessions');
  touchAt(path.join(own, '7.json'), 'own-new', Date.now());
  touchAt(path.join(shared, '7.json'), 'shared-old', Date.now() - 60000);
  touchAt(path.join(own, '8.json'), 'own-old', Date.now() - 60000);
  touchAt(path.join(shared, '8.json'), 'shared-new', Date.now());
  compose(s);
  assert.strictEqual(fs.readFileSync(path.join(shared, '7.json'), 'utf8'), 'own-new');
  assert.strictEqual(fs.readFileSync(path.join(shared, '8.json'), 'utf8'), 'shared-new');
  assert.ok(isLink(own));
});

test('악성: sessions/ 안의 링크·낯선 파일·폴더는 옮기지 않고, 링크도 걸지 않고 경고 (밖의 파일을 끌어오지 않음)', () => {
  const s = setup();
  const own = path.join(s.project.configDir, 'sessions');
  const secret = path.join(s.data, 'secret.txt');
  w(secret, 'S');
  w(path.join(own, '1.json'), 'ok');
  fs.symlinkSync(secret, path.join(own, '2.json'));
  w(path.join(own, 'evil.json'), 'x'); // 이름이 세션 기록 형식 밖
  fs.mkdirSync(path.join(own, '3.json'));
  const r = compose(s);
  const shared = path.join(s.home, '.claude', 'sessions');
  assert.ok(!isLink(own) && fs.statSync(own).isDirectory(), '진짜 폴더 그대로');
  assert.ok(fs.existsSync(path.join(shared, '1.json')), '형식 맞는 일반 파일은 옮김');
  assert.ok(!fs.existsSync(path.join(shared, '2.json')), '링크는 안 옮김');
  assert.ok(!fs.existsSync(path.join(shared, 'evil.json')));
  assert.ok(!fs.existsSync(path.join(shared, '3.json')));
  assert.strictEqual(fs.readFileSync(secret, 'utf8'), 'S');
  assert.ok(r.warnings.some(x => x.startsWith('sessions:')), r.warnings.join('|'));
});

test('악성: 공유 폴더 쪽 같은 이름이 링크·폴더면 덮어쓰지 않음', () => {
  const s = setup();
  const own = path.join(s.project.configDir, 'sessions');
  const shared = path.join(s.home, '.claude', 'sessions');
  const victim = path.join(s.data, 'victim');
  w(victim, 'V');
  fs.mkdirSync(shared, { recursive: true });
  fs.symlinkSync(victim, path.join(shared, '5.json'));
  touchAt(path.join(own, '5.json'), 'own', Date.now() + 60000);
  const r = compose(s);
  assert.strictEqual(fs.readFileSync(victim, 'utf8'), 'V');
  assert.ok(isLink(path.join(shared, '5.json')));
  assert.ok(!isLink(own));
  assert.ok(r.warnings.some(x => x.startsWith('sessions:')));
});

test('악성: 설정 폴더 sessions 가 다른 곳을 가리키는 링크면(우리가 만든 것 아님) 그대로 두고 경고', () => {
  const s = setup();
  const elsewhere = tmp('cp-else-');
  fs.mkdirSync(s.project.configDir, { recursive: true });
  fs.symlinkSync(elsewhere, path.join(s.project.configDir, 'sessions'));
  const r = compose(s);
  assert.strictEqual(fs.readlinkSync(path.join(s.project.configDir, 'sessions')), elsewhere);
  assert.ok(r.warnings.some(x => x.includes('sessions')));
});

test('경계: 설정 폴더에 sessions 가 파일이면 지우지 않고 경고', () => {
  const s = setup();
  w(path.join(s.project.configDir, 'sessions'), 'file');
  const r = compose(s);
  assert.strictEqual(fs.readFileSync(path.join(s.project.configDir, 'sessions'), 'utf8'), 'file');
  assert.ok(r.warnings.some(x => x.startsWith('sessions:')));
});

test('경계: 빈 sessions/ 폴더는 지우고 링크, 두 번 조립해도 그대로 (변경 없음)', () => {
  const s = setup();
  fs.mkdirSync(path.join(s.project.configDir, 'sessions'), { recursive: true });
  compose(s);
  assert.ok(isLink(path.join(s.project.configDir, 'sessions')));
  const r2 = compose(s);
  assert.ok(!r2.changed);
});

test('경계: settings.json·.claude.json 이 깨져 있어도 조립 (깨진 파일은 새로)', () => {
  const s = setup();
  w(path.join(s.project.configDir, 'settings.json'), '{broken');
  w(path.join(s.project.configDir, '.claude.json'), '[]');
  assert.doesNotThrow(() => compose(s));
  assert.ok(readJson(path.join(s.project.configDir, 'settings.json')).hooks);
});

test('경계: 켜진 훅이 하나도 없으면 hooks 칸 없음', () => {
  const s = setup();
  s.resolved.enabled = new Set(['setting:deny']);
  compose(s);
  assert.strictEqual(readJson(path.join(s.project.configDir, 'settings.json')).hooks, undefined);
});

// ── 이 프로젝트 메모리·대화 폴더를 훅 허용 폴더로 (결정 39) ──
const enc = (root) => root.replace(/[^A-Za-z0-9]/g, '-');

test('정상: env.CLAUDE_BASH_GUARD_ALLOWED_DIRS = 이 프로젝트 메모리·대화 폴더(설정 폴더 쪽 + 실제 위치) 둘만', () => {
  const s = setup();
  compose(s);
  const st = readJson(path.join(s.project.configDir, 'settings.json'));
  assert.deepStrictEqual(st.env.CLAUDE_BASH_GUARD_ALLOWED_DIRS.split(':'), [
    path.join(s.project.configDir, 'projects', enc(s.project.root)),
    path.join(s.home, '.claude', 'projects', enc(s.project.root)),
  ]);
});

test('정상: 사용자가 env 에 넣은 다른 값은 다시 조립해도 남고, 우리 키는 우리 값으로', () => {
  const s = setup();
  compose(s);
  const f = path.join(s.project.configDir, 'settings.json');
  const st = readJson(f);
  st.env.MY_VAR = '1';
  st.env.CLAUDE_BASH_GUARD_ALLOWED_DIRS = '/';
  fs.writeFileSync(f, JSON.stringify(st));
  const r = compose(s);
  const st2 = readJson(f);
  assert.strictEqual(st2.env.MY_VAR, '1');
  assert.ok(!st2.env.CLAUDE_BASH_GUARD_ALLOWED_DIRS.split(':').includes('/'), '사용자가 넓힌 값(/)은 우리 값으로 덮음');
  assert.strictEqual(r.changed, true);
  assert.strictEqual(compose(s).changed, false, '다시 조립해도 바뀐 게 없음');
});

test('악성: 다른 프로젝트 폴더·상위 폴더·projects 전체는 허용 폴더에 넣지 않음', () => {
  const s = setup();
  compose(s);
  const dirs = readJson(path.join(s.project.configDir, 'settings.json')).env.CLAUDE_BASH_GUARD_ALLOWED_DIRS.split(':');
  for (const d of dirs) {
    assert.ok(path.basename(d) === enc(s.project.root), d);
    assert.notStrictEqual(d, path.join(s.home, '.claude', 'projects'));
    assert.notStrictEqual(d, s.project.configDir);
  }
});

test('악성: 프로젝트 경로에 : 이 있으면(목록 구분자 주입) env 를 넣지 않음', () => {
  const s = setup();
  const odd = path.join(path.dirname(s.project.root), 'a:b');
  fs.mkdirSync(odd, { recursive: true });
  s.project.root = odd;
  compose(s);
  const st = readJson(path.join(s.project.configDir, 'settings.json'));
  assert.strictEqual((st.env || {}).CLAUDE_BASH_GUARD_ALLOWED_DIRS, undefined);
});

test('경계: 인코딩 이름이 200자를 넘으면(Claude Code 가 잘라 해시를 붙임) 넣지 않음', () => {
  const s = setup();
  s.project.root = path.join(s.project.root, 'x'.repeat(220));
  compose(s);
  const st = readJson(path.join(s.project.configDir, 'settings.json'));
  assert.strictEqual((st.env || {}).CLAUDE_BASH_GUARD_ALLOWED_DIRS, undefined);
});

test('경계: projects 공유 링크가 없으면(~/.claude/projects 없음) env 를 넣지 않고, 예전에 넣은 우리 키만 걷어냄', () => {
  const s = setup();
  compose(s);
  const f = path.join(s.project.configDir, 'settings.json');
  const st = readJson(f);
  st.env.MY_VAR = '1';
  fs.writeFileSync(f, JSON.stringify(st));
  fs.rmSync(path.join(s.home, '.claude', 'projects'), { recursive: true });
  compose(s);
  const st2 = readJson(f);
  assert.deepStrictEqual(st2.env, { MY_VAR: '1' });
});

test('경계: env 가 객체가 아니면(깨진 값) 버리고 우리 값만', () => {
  const s = setup();
  compose(s);
  const f = path.join(s.project.configDir, 'settings.json');
  const st = readJson(f);
  st.env = ['x'];
  fs.writeFileSync(f, JSON.stringify(st));
  compose(s);
  assert.deepStrictEqual(Object.keys(readJson(f).env), ['CLAUDE_BASH_GUARD_ALLOWED_DIRS']);
});
