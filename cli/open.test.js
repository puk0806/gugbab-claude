// open.js — /harness 가 TUI 를 띄울 곳 고르기 (comux 옆 창 · tmux 팝업 · macOS 새 터미널 창 · 안내)
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { shq, sessionCommand, planLaunch, describePlan, launch, rootFromConfigDir } = require('./open');

const base = { bin: '/home/u/gugbab/bin/gugbab-claude', root: '/work/my-ui' };
const roundTrip = (s) => spawnSync('sh', ['-c', `printf %s ${shq(s)}`], { encoding: 'utf8' }).stdout;

test('정상: comux 안이면 내 창을 나누고 그 창에 TUI 명령을 보냄', () => {
  const p = planLaunch({ ...base, env: { COPAD_MUX: '1', COPAD_MUX_PANE: 'abc-1' }, platform: 'darwin' });
  assert.strictEqual(p.kind, 'comux');
  assert.deepStrictEqual(p.split, ['comux', 'split', '--from', 'abc-1']);
  assert.match(p.cmd, /harness --session/);
  assert.match(describePlan(p), /comux split --from abc-1/);
});

test('정상: tmux 안이면 팝업, macOS 면 새 터미널 창, 그 밖엔 안내', () => {
  assert.strictEqual(planLaunch({ ...base, env: { TMUX: '/tmp/t,1,0' }, platform: 'linux' }).kind, 'tmux');
  const mac = planLaunch({ ...base, env: {}, platform: 'darwin' });
  assert.strictEqual(mac.kind, 'terminal');
  assert.strictEqual(mac.argv[0], 'osascript');
  const other = planLaunch({ ...base, env: {}, platform: 'linux' });
  assert.strictEqual(other.kind, 'manual');
  assert.match(other.message, /다른 터미널에서/);
});

test('정상: 개발 모드면 GUGBAB_HOME·GUGBAB_DATA 를 넘겨 같은 하네스·데이터로 엶', () => {
  const c = sessionCommand({ ...base, env: { GUGBAB_DEV: '1', GUGBAB_HOME: '/src/repo', GUGBAB_DATA: '/d' } });
  assert.match(c, /GUGBAB_HOME='\/src\/repo'/);
  assert.match(c, /GUGBAB_DATA='\/d'/);
  assert.ok(!/GUGBAB_HOME/.test(sessionCommand({ ...base, env: { GUGBAB_HOME: '/x' } })), '배포 모드는 bin 위치로 충분');
});

test('정상: launch(comux) — 나눈 창 토큰으로 명령과 엔터를 보냄', () => {
  const calls = [];
  const exec = (cmd, args) => { calls.push([cmd, ...args]); return args[0] === 'split' ? 'new-7\n' : ''; };
  const p = planLaunch({ ...base, env: { COPAD_MUX: '1', COPAD_MUX_PANE: 'abc-1' }, platform: 'darwin' });
  const msg = launch(p, { exec });
  assert.deepStrictEqual(calls[1].slice(0, 3), ['comux', 'send', 'new-7']);
  assert.match(calls[1][3], /; exit$/);
  assert.deepStrictEqual(calls[2], ['comux', 'send', 'new-7', '\n']);
  assert.match(msg, /옆 창/);
});

test('정상: rootFromConfigDir — 래퍼 설정 폴더의 기록에서 프로젝트 위치를 읽음', () => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'op-')));
  const cfg = path.join(d, 'projects', 'p', '.claude');
  fs.mkdirSync(cfg, { recursive: true });
  fs.writeFileSync(path.join(cfg, '.gugbab-state.json'), JSON.stringify({ projectRoot: '/work/p' }));
  assert.strictEqual(rootFromConfigDir({ CLAUDE_CONFIG_DIR: cfg }, path.join(d, 'projects')), '/work/p');
  assert.strictEqual(rootFromConfigDir({ CLAUDE_CONFIG_DIR: path.join(d, 'other') }, path.join(d, 'projects')), null);
});

test('악성: 경로에 따옴표·세미콜론·$() 가 있어도 셸에서 글자 그대로', () => {
  for (const s of ["a'b", "x'; rm -rf ~; echo '", '$(touch /tmp/pwn)', '`id`', 'sp ace', '"q"\\']) assert.strictEqual(roundTrip(s), s);
  const c = sessionCommand({ bin: base.bin, root: "/w/x'; touch /tmp/pwn; '", env: {} });
  assert.ok(c.startsWith("clear; cd '/w/x'\\''; touch /tmp/pwn; '\\'''"), c);
});

test('악성: 줄바꿈이 든 경로 → 거부 (comux send 가 엔터로 해석)', () => {
  assert.throws(() => sessionCommand({ ...base, root: '/w/a\nrm -rf ~', env: {} }), /줄바꿈/);
  assert.throws(() => sessionCommand({ ...base, env: { GUGBAB_DATA: '/d\r' } }), /줄바꿈/);
});

test('악성: comux 창 토큰이 이상하면 쓰지 않음 (계획·나눈 결과 모두)', () => {
  const p = planLaunch({ ...base, env: { COPAD_MUX: '1', COPAD_MUX_PANE: 'a b;rm' }, platform: 'linux' });
  assert.strictEqual(p.kind, 'manual');
  const good = planLaunch({ ...base, env: { COPAD_MUX: '1', COPAD_MUX_PANE: 'abc-1' }, platform: 'linux' });
  for (const out of ['', 'bad token\n', '$(x)']) {
    assert.throws(() => launch(good, { exec: (c, a) => (a[0] === 'split' ? out : '') }), /창을 나누지 못했/, JSON.stringify(out));
  }
});

test('악성: AppleScript 문자열 안 따옴표·역슬래시는 이스케이프', () => {
  const p = planLaunch({ bin: base.bin, root: '/w/"x"\\y', env: {}, platform: 'darwin' });
  const script = p.argv[2];
  assert.ok(!/[^\\]"x/.test(script.replace(/^tell application "Terminal" to do script /, '').slice(1)), script);
  assert.match(script, /\\"x\\"\\\\y/);
});

test('경계: 기록 파일이 없거나 깨졌거나 CLAUDE_CONFIG_DIR 가 없으면 null', () => {
  assert.strictEqual(rootFromConfigDir({}, '/nope'), null);
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'op-')));
  const cfg = path.join(d, 'projects', 'p', '.claude');
  fs.mkdirSync(cfg, { recursive: true });
  fs.writeFileSync(path.join(cfg, '.gugbab-state.json'), '{broken');
  assert.strictEqual(rootFromConfigDir({ CLAUDE_CONFIG_DIR: cfg }, path.join(d, 'projects')), null);
  assert.strictEqual(rootFromConfigDir({ CLAUDE_CONFIG_DIR: 'relative/.claude' }, path.join(d, 'projects')), null);
});

test('경계: 띄우기 명령이 실패하면 안내 문구와 함께 오류', () => {
  const p = planLaunch({ ...base, env: {}, platform: 'darwin' });
  assert.throws(() => launch(p, { exec: () => { throw new Error('osascript 없음'); } }), /띄우지 못했습니다.*다른 터미널/s);
  assert.match(launch(planLaunch({ ...base, env: {}, platform: 'linux' }), { exec: () => '' }), /다른 터미널에서/);
});
