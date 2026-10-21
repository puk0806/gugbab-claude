#!/usr/bin/env node
// gugbab-claude 윈도우 래퍼 — bin/gugbab-claude(sh)와 같은 순서를 Node 로 (계획서 2026-10-20-windows-support 5장 3단계, 결정 41-③)
//   ① 업데이트 확인(갱신되면 새 버전 래퍼로 다시 실행) ② 첫 실행 프리셋 ③ 조립(prepare) → ④ CLAUDE_CONFIG_DIR=<프로젝트별 설정 폴더> 로 claude 실행
//   claude 가 끝났을 때 재시작 표시(.gugbab-restart)가 있으면 지금 설치된 래퍼로 claude --continue 를 다시 띄운다 (대화 유지)
//   개발 모드: GUGBAB_HOME=<작업 트리> → 그 작업 트리를 바로 쓰고 자동 업데이트 끔
// 부르는 곳: bin/gugbab-claude.cmd (PowerShell·cmd), bin/gugbab-claude (Git Bash 에서 실행되면 이리로 넘김)
// macOS·리눅스는 sh 래퍼를 그대로 쓴다(comux 작업 제어 때문) — 이 파일은 플랫폼과 무관하게 동작하지만 거기서는 쓰지 않는다
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync, execFileSync } = require('child_process');
const { resolveClaude, fromMsys, IS_WIN } = require('./winfs');

const SUBCOMMANDS = new Set(['status', 'doctor', 'update', 'on', 'off', 'preset', 'harness', 'compose', 'help', '--help']);
const say = (m) => process.stderr.write(`[gugbab] ${m}\n`);

// cmd 셸로 .cmd 를 부를 때 넘겨도 안전한 인자 — cmd 가 해석하는 글자(" % ^ & | < > ! 줄바꿈)가 있으면 거부
const CMD_UNSAFE = /["%^&|<>!\r\n]/;
const cmdQuote = (s) => (s === '' || /[\s,;=()]/.test(s) ? `"${s}"` : s);

// claude 실행 대상 — GUGBAB_CLAUDE_BIN 이 있으면 그것(.js 면 node 로), 없으면 PATH 에서 (winfs.resolveClaude)
function claudeTarget(env) {
  const forced = env.GUGBAB_CLAUDE_BIN;
  if (forced) {
    if (!path.isAbsolute(forced) || !fs.existsSync(forced)) return null;
    return /\.c?js$/i.test(forced) ? { file: process.execPath, pre: [forced], viaShell: false } : { file: forced, pre: [], viaShell: false };
  }
  const r = resolveClaude({ env });
  return r ? { ...r, pre: [] } : null;
}

// 동기 실행 (하위 명령·prepare·self-update) — 표준 입출력 물려줌
function runNode(main, args, env, opts = {}) {
  return spawnSync(process.execPath, [main, ...args], { env, stdio: opts.stdio || 'inherit', encoding: opts.encoding, windowsHide: false });
}

// claude 를 띄우고 끝날 때까지 기다림 — Ctrl+C 는 claude 가 처리하므로 래퍼는 죽지 않고 기다린다
function runClaude(target, args, env) {
  return new Promise((resolve) => {
    let child;
    if (target.viaShell) {
      const bad = args.find(a => CMD_UNSAFE.test(a));
      if (bad !== undefined) { say(`claude.cmd 로는 이 인자를 안전하게 넘길 수 없습니다: ${bad} — claude 네이티브 설치(claude.exe)를 쓰세요`); resolve(2); return; }
      child = spawn(`"${target.file}" ${args.map(cmdQuote).join(' ')}`, { env, stdio: 'inherit', shell: true });
    } else {
      child = spawn(target.file, [...target.pre, ...args], { env, stdio: 'inherit' });
    }
    const ignore = () => {};
    process.on('SIGINT', ignore);
    if (process.platform === 'win32') process.on('SIGBREAK', ignore);
    child.on('error', (e) => { say(`claude 를 실행하지 못했습니다: ${e.message}`); cleanup(); resolve(127); });
    child.on('exit', (code, signal) => { cleanup(); resolve(code === null ? (signal ? 1 : 0) : code); });
    function cleanup() { process.removeListener('SIGINT', ignore); if (process.platform === 'win32') process.removeListener('SIGBREAK', ignore); }
  });
}

async function main(argv, baseEnv) {
  const env = { ...baseEnv };
  const self = path.resolve(__dirname, '..');
  // 배포 모드는 GUGBAB_DEV=0 — 세션 안에서 다시 부를 때 넘겨받은 GUGBAB_HOME 때문에 개발 모드로 잘못 판정되지 않게 (sh 래퍼와 같음)
  if (env.GUGBAB_DEV === '0') env.GUGBAB_HOME = self;
  else if (env.GUGBAB_HOME) { env.GUGBAB_HOME = path.resolve(fromMsys(env.GUGBAB_HOME)); env.GUGBAB_DEV = '1'; }
  else { env.GUGBAB_HOME = self; env.GUGBAB_DEV = '0'; }
  const home = env.GUGBAB_HOME;
  const mainJs = path.join(home, 'cli', 'main.js');
  const launchJs = path.join(home, 'cli', 'launch.js');
  if (!fs.existsSync(mainJs)) { say(`하네스를 찾지 못했습니다: ${mainJs}`); return 1; }

  const first = argv[0] || '';
  if (SUBCOMMANDS.has(first)) return runNode(mainJs, argv, env).status ?? 1;

  const target = claudeTarget(env);
  if (first === '--raw') {
    if (!target) { say('claude 를 찾지 못했습니다 — Claude Code 를 먼저 설치하세요'); return 127; }
    return runClaude(target, argv.slice(1), env);
  }
  if (!target) { say('claude 를 찾지 못했습니다 — Claude Code 를 먼저 설치하세요'); return 127; }

  // 자동 업데이트 — 갱신됐으면(exit 10) 새 버전의 래퍼로 다시 실행. 다시 실행된 쪽(GUGBAB_REEXEC=1)은 건너뜀
  if (env.GUGBAB_REEXEC !== '1') {
    env.GUGBAB_LAUNCH = `${process.pid}-${Math.floor(Date.now() / 1000)}`;
    const u = runNode(mainJs, ['self-update'], env);
    if (u.status === 10 && fs.existsSync(launchJs)) {
      const r = spawnSync(process.execPath, [launchJs, ...argv], { env: { ...env, GUGBAB_REEXEC: '1' }, stdio: 'inherit' });
      return r.status ?? 1;
    }
  }
  delete env.GUGBAB_REEXEC;

  // 처음 실행이면 기본 프리셋 고르기 (실패해도 계속)
  runNode(mainJs, ['first-run', ...argv], env);

  const prepare = () => {
    const r = runNode(mainJs, ['prepare', '--no-update'], env, { stdio: ['inherit', 'pipe', 'inherit'], encoding: 'utf8' });
    const cfg = r.status === 0 ? String(r.stdout || '').trim() : '';
    if (!cfg) { say('조립 실패 — gugbab-claude doctor 로 확인하세요 (하네스 없이: gugbab-claude --raw)'); return null; }
    if (!fs.existsSync(cfg) || !fs.statSync(cfg).isDirectory()) { say(`설정 폴더를 만들지 못했습니다: ${cfg}`); return null; }
    return cfg;
  };
  let cfg = prepare();
  if (!cfg) return 1;
  const restartMark = () => path.join(cfg, '.gugbab-restart');
  try { fs.rmSync(restartMark(), { force: true }); } catch { /* 없음 */ }

  // 세션 안(/harness·Bash)에서 이 하네스의 gugbab-claude 가 먼저 잡히게
  const pathKey = Object.keys(env).find(k => k.toUpperCase() === 'PATH') || 'PATH';
  env[pathKey] = `${path.join(home, 'bin')}${path.delimiter}${env[pathKey] || ''}`;
  try { env.GUGBAB_WRAPPER_REV = execFileSync('git', ['-C', home, 'rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim() || 'unknown'; }
  catch { env.GUGBAB_WRAPPER_REV = 'unknown'; }

  // -p/--print 는 다시 띄우지 않는다 (--continue 로 바꾸면 대화형이 떠 버림)
  const oneshot = argv.some(a => a === '-p' || a === '--print');
  let args = argv;
  for (;;) {
    // CLAUDE_SECURESTORAGE_CONFIG_DIR= (빈 값) — 설정 폴더가 달라도 기본 로그인(%USERPROFILE%\.claude\.credentials.json)을 쓴다
    //   (문서에 없는 내부 변수 — 2026-10-20 윈도우 PoC 로 동작 확인. PowerShell 은 빈 값 환경변수를 못 만들어 Node 가 넘긴다)
    const rc = await runClaude(target, args, { ...env, CLAUDE_CONFIG_DIR: cfg, CLAUDE_SECURESTORAGE_CONFIG_DIR: '' });
    if (!fs.existsSync(restartMark())) return rc;
    try { fs.rmSync(restartMark(), { force: true }); } catch { /* 없음 */ }
    if (oneshot) { say('하네스가 바뀌었습니다 — 다음 실행부터 반영됩니다'); return rc; }
    say('바뀐 하네스로 다시 시작합니다 (대화 이어서)');
    // 세션 도중 하네스가 업데이트됐을 수 있으니 지금 설치된 래퍼로 다시 실행 (업데이트는 건너뜀)
    //   같은 경로여도 새 프로세스로 — 이 프로세스는 업데이트 전 코드를 메모리에 들고 있다
    if (fs.existsSync(launchJs)) {
      const r = spawnSync(process.execPath, [launchJs, '--continue'], { env: { ...env, GUGBAB_REEXEC: '1' }, stdio: 'inherit' });
      return r.status ?? 1;
    }
    cfg = prepare();
    if (!cfg) return 1;
    args = ['--continue'];
  }
}

if (require.main === module) {
  main(process.argv.slice(2), process.env).then((code) => process.exit(typeof code === 'number' ? code : 1), (e) => { say(`래퍼 오류: ${e && e.message}`); process.exit(1); });
} else {
  module.exports = { main, claudeTarget, cmdQuote, CMD_UNSAFE, IS_WIN };
}
