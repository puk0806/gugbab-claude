// /harness 가 TUI 를 띄울 곳 (계획서 5.1) — 화면 출력을 읽지 않고 각 도구의 공식 명령만 쓴다
//   comux 안($COPAD_MUX·$COPAD_MUX_PANE)  내 창을 나눠(split --from) 그 창에 `gugbab-claude harness --session; exit` 를 보냄
//   tmux 안($TMUX)                        display-popup (run-shell -b 로 띄워 claude 쪽 명령이 기다리지 않게)
//   macOS                                 새 터미널 창 (osascript)
//   그 밖                                 다른 터미널에서 실행할 명령 안내
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, spawn } = require('child_process');
const { realOrNull } = require('./winfs');

const TOKEN_RE = /^[A-Za-z0-9._-]{1,80}$/;
const shq = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;
const asq = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`; // AppleScript 문자열
const show = (s) => (/^[A-Za-z0-9_./:=@%+,-]+$/.test(s) ? s : shq(s));

// closeTerminal — macOS 새 터미널 창으로 띄울 때만: 끝나면 그 창을 닫는다(아래 scheduleTerminalClose)
function sessionCommand({ bin, root, env, closeTerminal = false }) {
  const vars = [];
  if (env.GUGBAB_DEV === '1' && env.GUGBAB_HOME) vars.push(['GUGBAB_HOME', env.GUGBAB_HOME]);
  if (env.GUGBAB_DATA) vars.push(['GUGBAB_DATA', env.GUGBAB_DATA]);
  for (const v of [bin, root, ...vars.map(x => x[1])]) {
    if (/[\n\r\0]/.test(String(v))) throw new Error('경로에 줄바꿈이 있어 화면을 띄울 수 없습니다');
  }
  const prefix = vars.length ? `env ${vars.map(([k, v]) => `${k}=${shq(v)}`).join(' ')} ` : '';
  return `clear; cd ${shq(root)} && ${prefix}${shq(bin)} harness --session${closeTerminal ? ' --close-terminal' : ''}`; // clear — 창에 찍힌 긴 실행 명령을 지움
}

// macOS 터미널 창 닫기 — `do script "…; exit"` 로 연 창은 셸이 끝나도 터미널 설정("셸이 종료되면: 창 닫지 않음")이면 남는다.
// TUI 가 도는 동안(busy) 그 tty 의 창을 찾아 **창 id** 로 기억하고, 셸이 끝나 한가해지면(busy=false) 그 창만 닫는다.
// tty 이름만으로 고르면 이미 끝나 남아 있는 다른 창이 같은 tty 이름을 가질 수 있어(2026-10-20 실측) 실행 중인 창으로 고른다.
// 탭이 여럿인 창(사용자가 합친 창)은 건드리지 않는다. 최대 waitSec 기다림
const TTY_RE = /^\/dev\/ttys\d{1,4}$/;
function terminalCloseScript(tty, waitSec = 1800) {
  if (!TTY_RE.test(String(tty))) throw new Error(`터미널 tty 형식이 아닙니다: ${tty}`); // AppleScript 에 그대로 들어가므로 형식만 받는다
  const loops = Math.max(1, Math.min(7200, Math.round(Number(waitSec) * 2) || 1));
  return [
    'set target to missing value',
    'repeat 20 times',
    '  tell application "Terminal"',
    '    repeat with w in windows',
    '      try',
    `        if (count of tabs of w) is 1 and tty of tab 1 of w is "${tty}" and busy of tab 1 of w then`,
    '          set target to id of w',
    '          exit repeat',
    '        end if',
    '      end try',
    '    end repeat',
    '  end tell',
    '  if target is not missing value then exit repeat',
    '  delay 0.25',
    'end repeat',
    'if target is missing value then return',
    `repeat ${loops} times`,
    '  delay 0.5',
    '  tell application "Terminal"',
    '    try',
    '      if busy of tab 1 of window id target is false then',
    '        close window id target',
    '        return',
    '      end if',
    '    on error',
    '      return',
    '    end try',
    '  end tell',
    'end repeat',
  ].join('\n');
}
// 창과 무관한 새 세션(detached)으로 띄운다 — 이 창의 프로세스로 잡히면 터미널이 "실행 중인 프로세스를 종료할까요?" 를 묻는다
function scheduleTerminalClose({ tty, spawn = require('child_process').spawn }) {
  const child = spawn('osascript', ['-e', terminalCloseScript(tty)], { detached: true, stdio: 'ignore' });
  if (child && typeof child.unref === 'function') child.unref();
  return child;
}
function currentTty({ exec = (cmd, args, o) => execFileSync(cmd, args, o) } = {}) {
  try {
    const t = String(exec('tty', [], { encoding: 'utf8', stdio: ['inherit', 'pipe', 'ignore'] })).trim();
    return TTY_RE.test(t) ? t : null;
  } catch { return null; }
}

function planLaunch({ env, platform, bin, root }) {
  const cmd = sessionCommand({ bin, root, env });
  const manual = { kind: 'manual', cmd, message: `다른 터미널에서 실행하세요: ${cmd}` };
  if (env.COPAD_MUX) {
    if (!TOKEN_RE.test(env.COPAD_MUX_PANE || '')) return manual;
    return { kind: 'comux', cmd, split: ['comux', 'split', '--from', env.COPAD_MUX_PANE] };
  }
  if (env.TMUX) return { kind: 'tmux', cmd, argv: ['tmux', 'run-shell', '-b', `tmux display-popup -E -w 90% -h 85% ${shq(cmd)}`] };
  if (platform === 'darwin') {
    const tcmd = sessionCommand({ bin, root, env, closeTerminal: true });
    return { kind: 'terminal', cmd: tcmd, argv: ['osascript', '-e', `tell application "Terminal" to do script ${asq(`${tcmd}; exit`)}`, '-e', 'tell application "Terminal" to activate'] };
  }
  if (platform === 'win32') return planWindows({ bin, root, node: process.execPath });
  return manual;
}

// 윈도우(2026-10-20) — `start` 로 새 콘솔 창에 `node <main.js> harness --session` (환경변수는 창이 물려받는다)
//   cmd 줄은 /s /c "…" 로 통째로 감싸 넘기고(windowsVerbatimArguments), 큰따옴표 안에서도 해석되는 글자(" % ! 줄바꿈)는 거부
const CMD_BAD = /["%!\r\n\0]/;
function planWindows({ bin, root, node }) {
  const main = path.win32.join(path.win32.dirname(bin), '..', 'cli', 'main.js');
  const manualCmd = `cd /d "${root}" && gugbab-claude harness --session`;
  const manual = { kind: 'manual', cmd: manualCmd, message: `다른 터미널(PowerShell·cmd)에서 실행하세요: ${manualCmd}` };
  if ([root, node, main].some(v => CMD_BAD.test(String(v)))) return manual;
  const line = `start "gugbab harness" /D "${root}" "${node}" "${main}" harness --session`;
  return { kind: 'console', cmd: line, argv: ['cmd.exe', ['/d', '/s', '/c', `"${line}"`]] };
}

function describePlan(p) {
  if (p.kind === 'comux') return [p.split.map(show).join(' '), `comux send <새 창> ${shq(`${p.cmd}; exit`)}`, 'comux send <새 창> <엔터>'].join('\n');
  if (p.kind === 'manual') return p.message;
  if (p.kind === 'console') return `cmd.exe /d /s /c "${p.cmd}"`;
  return p.argv.map(show).join(' ');
}

const defaultDetached = (file, args) => {
  const child = spawn(file, args, { detached: true, stdio: 'ignore', windowsVerbatimArguments: true });
  child.on('error', () => { /* 창을 못 띄움 — 아래 메시지로 안내 */ });
  child.unref();
};

function launch(p, { exec = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', timeout: 10000, stdio: ['ignore', 'pipe', 'pipe'] }), detached = defaultDetached } = {}) {
  if (p.kind === 'manual') return p.message;
  if (p.kind === 'console') {
    try { detached(p.argv[0], p.argv[1]); } catch (e) { throw new Error(`화면을 띄우지 못했습니다 (${e.message})\n다른 터미널에서 실행하세요: ${p.cmd}`); }
    // start 로 연 콘솔은 그 안의 node 가 끝나면 창도 닫힌다 — macOS 의 --close-terminal 같은 처리가 필요 없다
    return '새 창에 하네스 화면을 띄웠습니다 — Enter 로 저장하면 결과를 2초 보여 주고 창이 닫힙니다';
  }
  try {
    if (p.kind === 'comux') {
      let pane = '';
      try { pane = String(exec(p.split[0], p.split.slice(1)) || '').trim(); } catch { /* 아래에서 처리 */ }
      if (!TOKEN_RE.test(pane)) throw new Error('comux 창을 나누지 못했습니다');
      exec('comux', ['send', pane, `${p.cmd}; exit`]);
      exec('comux', ['send', pane, '\n']);
      return `comux 옆 창에 하네스 화면을 띄웠습니다 (창 ${pane}) — Enter 로 저장하면 결과를 2초 보여 주고 창이 닫힙니다`;
    }
    exec(p.argv[0], p.argv.slice(1));
    return p.kind === 'tmux' ? 'tmux 팝업으로 하네스 화면을 띄웠습니다 — Enter 로 저장하면 결과를 2초 보여 주고 닫힙니다' : '새 터미널 창에 하네스 화면을 띄웠습니다 — Enter 로 저장하면 결과를 2초 보여 주고 창이 닫힙니다';
  } catch (e) {
    throw new Error(`화면을 띄우지 못했습니다 (${e.message})\n다른 터미널에서 실행하세요: ${p.cmd}`);
  }
}

// 래퍼 설정 폴더(<data>/projects/<이름>/.claude)의 .gugbab-state.json 에서 프로젝트 위치 — 다른 곳이면 null
function rootFromConfigDir(env, projectsDir) {
  const cfg = env.CLAUDE_CONFIG_DIR;
  if (!cfg || !path.isAbsolute(cfg)) return null;
  try {
    const real = realOrNull(cfg);
    if (!real || path.basename(real) !== '.claude' || path.dirname(path.dirname(real)) !== realOrNull(projectsDir)) return null;
    const st = JSON.parse(fs.readFileSync(path.join(real, '.gugbab-state.json'), 'utf8'));
    return st && typeof st.projectRoot === 'string' && path.isAbsolute(st.projectRoot) ? st.projectRoot : null;
  } catch { return null; }
}

module.exports = { shq, sessionCommand, planLaunch, planWindows, describePlan, launch, rootFromConfigDir, terminalCloseScript, scheduleTerminalClose, currentTty };
