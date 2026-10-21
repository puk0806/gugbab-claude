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

function sessionCommand({ bin, root, env }) {
  const vars = [];
  if (env.GUGBAB_DEV === '1' && env.GUGBAB_HOME) vars.push(['GUGBAB_HOME', env.GUGBAB_HOME]);
  if (env.GUGBAB_DATA) vars.push(['GUGBAB_DATA', env.GUGBAB_DATA]);
  for (const v of [bin, root, ...vars.map(x => x[1])]) {
    if (/[\n\r\0]/.test(String(v))) throw new Error('경로에 줄바꿈이 있어 화면을 띄울 수 없습니다');
  }
  const prefix = vars.length ? `env ${vars.map(([k, v]) => `${k}=${shq(v)}`).join(' ')} ` : '';
  return `clear; cd ${shq(root)} && ${prefix}${shq(bin)} harness --session`; // clear — 창에 찍힌 긴 실행 명령을 지움
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
    return { kind: 'terminal', cmd, argv: ['osascript', '-e', `tell application "Terminal" to do script ${asq(`${cmd}; exit`)}`, '-e', 'tell application "Terminal" to activate'] };
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
    return '새 창에 하네스 화면을 띄웠습니다 — 저장하거나 닫으면 창도 닫힙니다';
  }
  try {
    if (p.kind === 'comux') {
      let pane = '';
      try { pane = String(exec(p.split[0], p.split.slice(1)) || '').trim(); } catch { /* 아래에서 처리 */ }
      if (!TOKEN_RE.test(pane)) throw new Error('comux 창을 나누지 못했습니다');
      exec('comux', ['send', pane, `${p.cmd}; exit`]);
      exec('comux', ['send', pane, '\n']);
      return `comux 옆 창에 하네스 화면을 띄웠습니다 (창 ${pane}) — 저장하거나 닫으면 창도 닫힙니다`;
    }
    exec(p.argv[0], p.argv.slice(1));
    return p.kind === 'tmux' ? 'tmux 팝업으로 하네스 화면을 띄웠습니다' : '새 터미널 창에 하네스 화면을 띄웠습니다';
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

module.exports = { shq, sessionCommand, planLaunch, planWindows, describePlan, launch, rootFromConfigDir };
