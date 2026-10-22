// open.js — /harness 가 TUI 를 띄울 곳 고르기 (comux 옆 창 · tmux 팝업 · macOS 새 터미널 창 · 안내)
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { shq, sessionCommand, planLaunch, describePlan, launch, rootFromConfigDir, terminalCloseScript, scheduleTerminalClose, currentTty } = require('./open');

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

// ── 윈도우 (2026-10-20) — start 로 새 콘솔 창 ──
const { planWindows } = require('./open');
test('정상: 윈도우 — start 로 새 창에 node <main.js> harness --session (작업 폴더 = 프로젝트)', () => {
  const p = planWindows({ bin: 'C:\\gugbab\\bin\\gugbab-claude', root: 'C:\\회사\\my proj', node: 'C:\\Program Files\\nodejs\\node.exe' });
  assert.strictEqual(p.kind, 'console');
  assert.strictEqual(p.argv[0], 'cmd.exe');
  assert.deepStrictEqual(p.argv[1].slice(0, 3), ['/d', '/s', '/c']);
  assert.strictEqual(p.cmd, 'start "gugbab harness" /D "C:\\회사\\my proj" "C:\\Program Files\\nodejs\\node.exe" "C:\\gugbab\\cli\\main.js" harness --session');
  assert.strictEqual(p.argv[1][3], `"${p.cmd}"`, '/s 는 바깥 따옴표 한 쌍만 벗긴다');
  let called = null;
  assert.match(launch(p, { detached: (f, a) => { called = [f, a]; } }), /새 창/);
  assert.deepStrictEqual(called, p.argv);
  assert.match(describePlan(p), /^cmd\.exe \/d \/s \/c "start /);
});

test('악성: 윈도우 — 경로에 cmd 가 따옴표 안에서도 해석하는 글자(" % !)가 있으면 띄우지 않고 안내', () => {
  for (const root of ['C:\\a"b', 'C:\\%PATH%', 'C:\\a!b!', 'C:\\a\nb']) {
    const p = planWindows({ bin: 'C:\\g\\bin\\gugbab-claude', root, node: 'C:\\node.exe' });
    assert.strictEqual(p.kind, 'manual', JSON.stringify(root));
  }
  // & ^ | 는 큰따옴표 안에서 글자 그대로라 허용
  assert.strictEqual(planWindows({ bin: 'C:\\g\\bin\\gugbab-claude', root: 'C:\\a & b ^ c | d', node: 'C:\\node.exe' }).kind, 'console');
});

test('경계: 윈도우 — 창 띄우기 실패면 안내 문구와 함께 오류', () => {
  const p = planWindows({ bin: 'C:\\g\\bin\\gugbab-claude', root: 'C:\\p', node: 'C:\\node.exe' });
  assert.throws(() => launch(p, { detached: () => { throw new Error('cmd 없음'); } }), /띄우지 못했습니다.*다른 터미널/s);
});

test('정상: 윈도우 새 창은 --close-terminal 을 붙이지 않음 (start 로 연 콘솔은 node 가 끝나면 닫힘)', () => {
  const p = planLaunch({ bin: 'C:\\g\\bin\\gugbab-claude', root: 'C:\\p', env: {}, platform: 'win32' });
  assert.strictEqual(p.kind, 'console');
  assert.ok(!p.cmd.includes('--close-terminal'), p.cmd);
  assert.match(launch(p, { detached: () => {} }), /2초 보여 주고 창이 닫힙니다/);
});

// ── 끝나면 창 닫기 (2026-10-20) — comux 는 `; exit`, tmux 는 display-popup -E, macOS 터미널은 --close-terminal ──
test('정상: macOS 새 창만 --close-terminal 을 붙이고, comux·tmux 는 붙이지 않음 (그쪽은 명령이 끝나면 닫힘)', () => {
  const mac = planLaunch({ ...base, env: {}, platform: 'darwin' });
  assert.match(mac.cmd, /harness --session --close-terminal$/);
  assert.ok(mac.argv[2].includes('--close-terminal; exit'), mac.argv[2]);
  const cx = planLaunch({ ...base, env: { COPAD_MUX: '1', COPAD_MUX_PANE: 'abc-1' }, platform: 'darwin' });
  assert.ok(!cx.cmd.includes('--close-terminal'));
  const tm = planLaunch({ ...base, env: { TMUX: '/tmp/t,1,0' }, platform: 'darwin' });
  assert.ok(!tm.cmd.includes('--close-terminal'));
  assert.match(tm.argv[3], /display-popup -E /, 'tmux 팝업은 -E 라 명령이 끝나면 닫힌다');
});

test('정상: 닫기 스크립트 — 그 tty 에서 실행 중인 창을 id 로 기억했다가, 셸이 끝나 한가해진 뒤 그 창만 닫음', () => {
  const s = terminalCloseScript('/dev/ttys003');
  assert.match(s, /tty of tab 1 of w is "\/dev\/ttys003" and busy of tab 1 of w then[\s\S]*set target to id of w/,
    '이미 끝나 남은 창(같은 tty 이름, busy=false)이 아니라 실행 중인 창을 고름');
  assert.match(s, /\(count of tabs of w\) is 1/, '탭이 여럿인 창은 건드리지 않음');
  assert.match(s, /if target is missing value then return/, '못 찾으면 아무 창도 닫지 않음');
  assert.match(s, /busy of tab 1 of window id target is false[\s\S]*close window id target/, '실행 중이면 닫지 않음(종료 확인 창 방지)');
  assert.ok(!/close w\b/.test(s), 'tty 로 다시 찾아 닫지 않음 — 기억한 id 로만');
  assert.match(s, /repeat 3600 times[\s\S]*delay 0\.5/, '기본 최대 30분 기다림');
  assert.match(terminalCloseScript('/dev/ttys003', 1e9), /repeat 7200 times/, '대기 상한');
  assert.match(terminalCloseScript('/dev/ttys003', 'x'), /repeat 1 times/, '이상한 값은 최소');
});

test('악성: tty 자리에 AppleScript·셸 주입 문자열 → 스크립트를 만들지 않고 osascript 도 띄우지 않음', () => {
  const bad = ['/dev/ttys1" then do shell script "rm -rf ~" --', '/dev/ttys001\nclose every window', '/dev/tty', 'ttys001', '/dev/ttys', '/dev/ttys12345', '/dev/../dev/ttys001', '', null, undefined, 42];
  for (const t of bad) {
    assert.throws(() => terminalCloseScript(t), /tty 형식/, String(t));
    let spawned = false;
    assert.throws(() => scheduleTerminalClose({ tty: t, spawn: () => { spawned = true; return {}; } }), /tty 형식/);
    assert.strictEqual(spawned, false, String(t));
  }
});

test('정상: 닫기는 창과 무관한 새 세션(detached·입출력 없음)으로 띄우고 기다리지 않음(unref)', () => {
  const calls = []; let unref = 0;
  scheduleTerminalClose({ tty: '/dev/ttys012', spawn: (cmd, args, o) => { calls.push({ cmd, args, o }); return { unref: () => { unref++; } }; } });
  assert.strictEqual(calls.length, 1);
  assert.strictEqual(calls[0].cmd, 'osascript');
  assert.strictEqual(calls[0].args[0], '-e');
  assert.match(calls[0].args[1], /ttys012/);
  assert.strictEqual(calls[0].o.detached, true);
  assert.strictEqual(calls[0].o.stdio, 'ignore');
  assert.strictEqual(unref, 1);
});

test('경계: currentTty — tty 명령 결과가 형식에 맞을 때만, 실패·이상한 값이면 null(창은 남고 저장은 그대로)', () => {
  assert.strictEqual(currentTty({ exec: () => '/dev/ttys007\n' }), '/dev/ttys007');
  assert.strictEqual(currentTty({ exec: () => 'not a tty\n' }), null);
  assert.strictEqual(currentTty({ exec: () => '/dev/ttys007"; rm -rf ~\n' }), null);
  assert.strictEqual(currentTty({ exec: () => { throw new Error('no tty'); } }), null);
});

test('경계: 띄우기 명령이 실패하면 안내 문구와 함께 오류', () => {
  const p = planLaunch({ ...base, env: {}, platform: 'darwin' });
  assert.throws(() => launch(p, { exec: () => { throw new Error('osascript 없음'); } }), /띄우지 못했습니다.*다른 터미널/s);
  assert.match(launch(planLaunch({ ...base, env: {}, platform: 'linux' }), { exec: () => '' }), /다른 터미널에서/);
});
