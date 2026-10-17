// main.js — gugbab-claude 의 하위 명령 (prepare·status·doctor·on·off)
// 정상 / 악성·우회 / 경계 3계층 — 실제 프로세스로 띄워 임시 HOME·데이터 폴더에서 시험
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const MAIN = path.join(__dirname, 'main.js');
const tmp = (p) => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), p)));
const w = (f, s = '') => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

function setup() {
  const code = tmp('mn-code-');
  for (const f of ['.claude/hooks/cc-notify.js', '.claude/rules/git.md', '.claude/skills/react-core/SKILL.md', '.claude/CLAUDE.common.md']) w(path.join(code, f));
  w(path.join(code, 'manifest.json'), JSON.stringify({
    items: {
      'hook:bash-guard': { type: 'hook', state: 'lock', path: '.claude/hooks/cc-notify.js', hooks: [] },
      'hook:cc-notify': { type: 'hook', state: 'on', path: '.claude/hooks/cc-notify.js', hooks: [{ event: 'Stop', matcher: '', args: [] }] },
      'rule:git.md': { type: 'rule', state: 'on', path: '.claude/rules/git.md' },
      'skill:react-core': { type: 'skill', state: 'off', path: '.claude/skills/react-core' },
      'setting:claude-md': { type: 'setting', state: 'lock', key: 'claudeMd', path: '.claude/CLAUDE.common.md' },
      'setting:superpowers 플러그인': { type: 'setting', state: 'on', key: 'plugin:superpowers@m' },
    },
    hookOrder: { Stop: [{ id: 'hook:cc-notify', matcher: '', args: [] }] },
    relations: { bundles: { b: { title: '묶음 B', items: ['hook:cc-notify', 'rule:git.md'] } }, presets: { p1: { title: '프리셋 하나', enable: ['bundle:b'] } } },
    base: {},
  }));
  const home = tmp('mn-home-');
  for (const d of ['projects', 'plugins', 'plans']) fs.mkdirSync(path.join(home, '.claude', d), { recursive: true });
  const data = tmp('mn-data-');
  const proj = tmp('mn-proj-');
  return { code, home, data, proj };
}
function run(s, args, extraEnv = {}) {
  return spawnSync(process.execPath, [MAIN, ...args], { cwd: s.proj, encoding: 'utf8', timeout: 30000,
    env: { ...process.env, HOME: s.home, GUGBAB_HOME: s.code, GUGBAB_DATA: s.data, GUGBAB_DEV: '1', ...extraEnv } });
}

test('정상: prepare — 설정 폴더를 조립하고 그 경로를 출력', () => {
  const s = setup();
  const r = run(s, ['prepare']);
  assert.strictEqual(r.status, 0, r.stderr);
  const cfg = r.stdout.trim();
  assert.strictEqual(cfg, path.join(s.data, 'projects', path.basename(s.proj), '.claude'));
  assert.ok(fs.lstatSync(path.join(cfg, 'rules', 'git.md')).isSymbolicLink());
  assert.ok(JSON.parse(fs.readFileSync(path.join(cfg, 'settings.json'), 'utf8')).hooks.Stop);
});

test('정상: off → 링크가 바로 빠지고, 룰이 바뀌면 재시작 표시', () => {
  const s = setup();
  const cfg = run(s, ['prepare']).stdout.trim();
  const r = run(s, ['off', 'rule:git.md']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /끔: rule:git\.md/);
  assert.ok(!fs.existsSync(path.join(cfg, 'rules', 'git.md')));
  assert.ok(fs.existsSync(path.join(cfg, '.gugbab-restart')));
  assert.match(r.stdout, /\/exit/);
});

test('정상: on bundle — 묶음 전체, --all 이면 모든 프로젝트(profile.json)', () => {
  const s = setup();
  run(s, ['prepare']);
  const r = run(s, ['on', 'skill:react-core', '--all']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(s.data, 'profile.json'), 'utf8')).enable, ['skill:react-core']);
  const r2 = run(s, ['off', 'bundle:b']);
  assert.match(r2.stdout, /끔: .*hook:cc-notify/);
  assert.match(r2.stdout, /rule:git\.md/);
  const st = JSON.parse(fs.readFileSync(path.join(s.data, 'projects', path.basename(s.proj), '.claude', 'settings.json'), 'utf8'));
  assert.strictEqual(st.hooks, undefined, '묶음을 끄면 그 훅만 있던 Stop 연결도 빠짐');
});

test('정상: status 는 프로젝트 이름과 켜진 수를 보여 줌', () => {
  const s = setup();
  const r = run(s, ['status']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes(path.basename(s.proj)) && r.stdout.includes('룰 1/1'));
});

test('악성: 고정 항목 끄기 → 거부(exit 1), 설정 파일에 남기지 않음', () => {
  const s = setup();
  const r = run(s, ['off', 'hook:bash-guard']);
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /고정/);
  assert.ok(!fs.existsSync(path.join(s.data, 'projects', path.basename(s.proj), 'settings.json')));
});

test('악성: 모르는 이름·경로 조작 → 거부(exit 1)', () => {
  const s = setup();
  for (const bad of ['hook:nope', '../../etc/passwd', 'bundle:zz']) {
    const r = run(s, ['off', bad]);
    assert.strictEqual(r.status, 1, bad);
    assert.match(r.stderr, /모르는 항목|항목 이름/, bad);
  }
});

test('경계: manifest 가 깨지면 prepare 는 exit 1 + 안내', () => {
  const s = setup();
  fs.writeFileSync(path.join(s.code, 'manifest.json'), '{broken');
  const r = run(s, ['prepare']);
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /manifest/);
});

test('경계: 인자 없음·모르는 명령 → 사용법, on 에 항목 없음 → exit 1', () => {
  const s = setup();
  assert.match(run(s, []).stdout, /사용법/);
  assert.strictEqual(run(s, ['wat']).status, 1);
  assert.strictEqual(run(s, ['on']).status, 1);
});

test('정상: preset — 목록, 적용(--all 이면 profile)', () => {
  const s = setup();
  const list = run(s, ['preset']);
  assert.strictEqual(list.status, 0, list.stderr);
  assert.match(list.stdout, /p1 +프리셋 하나/);
  run(s, ['off', 'bundle:b', '--all']);
  const r = run(s, ['preset', 'p1', '--all']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /켬: .*hook:cc-notify/);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(s.data, 'profile.json'), 'utf8')), { enable: ['bundle:b'], disable: [] });
});

test('정상: 안 바뀌면 이유를 보여 줌 — 이 프로젝트 설정이 프로필을 덮고 있음', () => {
  const s = setup();
  run(s, ['on', 'hook:cc-notify']);
  const r = run(s, ['off', 'hook:cc-notify', '--all']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /hook:cc-notify: 이 프로젝트 설정 이\(가\) 켬으로 덮고 있음/);
});

test('정상: 묶음을 끈 뒤 그 안 항목만 다시 켜면 실제로 켜짐', () => {
  const s = setup();
  run(s, ['off', 'bundle:b']);
  const r = run(s, ['on', 'hook:cc-notify']);
  assert.match(r.stdout, /켬: hook:cc-notify/);
});

test('정상: harness --open --dry-run — comux 안이면 옆 창 나누기 계획을 보여 줌', () => {
  const s = setup();
  const r = run(s, ['harness', '--open', '--dry-run'], { COPAD_MUX: '1', COPAD_MUX_PANE: 'abc-1', TMUX: '' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /comux split --from abc-1/);
  assert.match(r.stdout, /harness --session/);
});

test('악성: 모르는 프리셋·프리셋 이름 조작 → 거부(exit 1)', () => {
  const s = setup();
  for (const bad of ['nope', '__proto__', '../p1']) {
    const r = run(s, ['preset', bad]);
    assert.strictEqual(r.status, 1, bad);
    assert.match(r.stderr, /모르는 프리셋/, bad);
  }
});

test('경계: harness 를 터미널 없이 부르면 화면을 못 띄운다고 안내(exit 1)', () => {
  const s = setup();
  const r = run(s, ['harness']);
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /터미널/);
  assert.match(r.stderr, /--open/);
});

test('정상: 이름에 공백·한글이 있는 설정 항목(플러그인)을 끄면 조립된 settings.json 의 enabledPlugins 가 false', () => {
  const s = setup();
  const cfg = run(s, ['prepare']).stdout.trim();
  const r = run(s, ['off', 'setting:superpowers 플러그인']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /끔: setting:superpowers 플러그인/);
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(cfg, 'settings.json'), 'utf8')).enabledPlugins['superpowers@m'], false);
});

test('경계: first-run 은 터미널이 아니면 묻지 않고 조용히 끝(exit 0), 설정 파일도 만들지 않음', () => {
  const s = setup();
  const r = run(s, ['first-run']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(r.stdout, '');
  assert.ok(!fs.existsSync(path.join(s.data, 'projects', path.basename(s.proj), 'settings.json')));
});

test('악성: first-run 이 깨진 manifest 를 만나도 세션을 막지 않음(exit 0)', () => {
  const s = setup();
  fs.writeFileSync(path.join(s.code, 'manifest.json'), '{broken');
  const r = run(s, ['first-run', '-p', 'x']);
  assert.strictEqual(r.status, 0);
});
