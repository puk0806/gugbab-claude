// doctor — 설치·조립 상태 점검 (계획서 4장 부가 명령)
// 외부 명령(claude·security·comux)은 exec 로 주입해 시험한다
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { resolveClaude, realOrNull } = require('./winfs');

// 윈도우는 `claude` 가 확장자 없는 sh 스크립트·.cmd 라 그대로 execFile 하면 ENOENT/EINVAL — 실제 .exe 를 찾아 실행 (2026-10-20)
//   claude.exe --version 은 윈도우에서 십수 초 걸리기도 해(2026-10-20 실측 13초 — 백신 검사) npm 설치면 package.json 버전을 먼저 읽고, 실행은 30초까지
const defaultExec = (cmd, args) => {
  let file = cmd;
  const win = process.platform === 'win32';
  if (cmd === 'claude' && win) {
    const c = resolveClaude();
    if (!c || c.viaShell) throw new Error('claude.exe 없음');
    if (args.length === 1 && args[0] === '--version') {
      try {
        const j = JSON.parse(fs.readFileSync(path.join(path.dirname(c.file), '..', 'package.json'), 'utf8'));
        if (j && j.name === '@anthropic-ai/claude-code' && /^\d+\.\d+\.\d+$/.test(j.version)) return `${j.version} (Claude Code)`;
      } catch { /* npm 설치 아님 → 실행 */ }
    }
    file = c.file;
  }
  return execFileSync(file, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: win ? 30000 : 10000 }).trim();
};
const realOr = (p) => realOrNull(p);

// Git for Windows 의 bash.exe — 훅·상태줄·Bash 도구가 이것으로 돈다(공식 문서). 없으면 훅이 PowerShell 로 떨어져 전부 실패
function findGitBash(env, exists = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } }) {
  const cands = [];
  if (env.CLAUDE_CODE_GIT_BASH_PATH) cands.push(env.CLAUDE_CODE_GIT_BASH_PATH);
  for (const base of [env.ProgramFiles, env['ProgramFiles(x86)'], env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, 'Programs')]) if (base) cands.push(path.join(base, 'Git', 'bin', 'bash.exe'));
  for (const d of String(env.PATH || env.Path || '').split(';')) if (/[\\/]git[\\/](cmd|bin|mingw64[\\/]bin)$/i.test(d)) cands.push(path.join(d.replace(/[\\/](cmd|bin|mingw64[\\/]bin)$/i, ''), 'bin', 'bash.exe'));
  return cands.find(exists) || null;
}

function runDoctor({ paths, project, exec = defaultExec, env = process.env, platform = process.platform, nodeVersion = process.version }) {
  const out = [];
  const add = (key, level, msg) => out.push({ key, level, msg });

  const major = Number(String(nodeVersion).replace(/^v/, '').split('.')[0]);
  add('node', major >= 18 ? 'ok' : 'fail', `node ${nodeVersion}${major >= 18 ? '' : ' — 18 이상이 필요합니다'}`);

  try { add('claude', 'ok', `claude ${exec('claude', ['--version'])}`); } catch { add('claude', 'fail', 'claude 를 찾지 못했습니다 — Claude Code 설치 필요'); }
  // 최신 버전 여부 — claude-version-check 훅의 기록(하루 한 번 npm 확인)
  if (paths.harnessRoot && paths.stateDir) {
    try {
      const sum = require(path.join(paths.harnessRoot, 'hooks', 'claude-version-check.js')).readClaudeVersionState(paths.stateDir).summary;
      if (sum) add('claudeLatest', /있음/.test(sum) ? 'warn' : 'ok', sum);
    } catch { /* 훅 없음 */ }
  }

  // 하네스 버전·채널 (main 채널인데 안정 버전 태그가 생겼으면 stable 로 바꾸는 법 안내)
  if (paths.stateDir) {
    const v = require('./update').versionInfo({ codeHome: paths.codeHome, stateDir: paths.stateDir, dev: paths.dev });
    add('version', v.hint ? 'warn' : 'ok', `하네스 ${v.text}${v.hint ? ` — ${v.hint}` : ''}`);
  }

  let manifest = null;
  try { manifest = JSON.parse(fs.readFileSync(paths.manifestPath, 'utf8')); } catch { add('manifest', 'fail', `manifest.json 을 읽지 못했습니다 (${paths.manifestPath})`); }
  if (manifest) {
    const missing = Object.entries(manifest.items || {}).filter(([, it]) => {
      if (!it.path) return false;
      const p = path.join(paths.codeHome, it.path, it.type === 'skill' ? 'SKILL.md' : '');
      return !fs.existsSync(p);
    }).map(([id]) => id);
    add('manifest', missing.length ? 'fail' : 'ok', missing.length ? `없는 파일을 가리키는 항목 ${missing.length}개: ${missing.slice(0, 10).join(', ')}` : `manifest 항목 ${Object.keys(manifest.items || {}).length}개`);
  }

  // 로그인 공유 — 기본 키체인 항목을 쓰게 하는 CLAUDE_SECURESTORAGE_CONFIG_DIR= 는 문서에 없는 내부 변수 (PoC 1)
  if (platform === 'darwin') {
    try {
      exec('security', ['find-generic-password', '-s', 'Claude Code-credentials']);
      add('login', 'ok', '기본 키체인 로그인 항목 있음 — 래퍼는 CLAUDE_SECURESTORAGE_CONFIG_DIR=(빈 값)으로 이 항목을 씁니다 (문서에 없는 내부 변수 — claude 업데이트 뒤 "Not logged in" 이면 이것부터 확인)');
    } catch { add('login', 'warn', '기본 키체인에 Claude Code 로그인 항목이 없습니다 — 먼저 `claude` 로 한 번 로그인하세요 (래퍼는 CLAUDE_SECURESTORAGE_CONFIG_DIR= 로 그 항목을 공유)'); }
  } else if (platform === 'win32') {
    // 윈도우 로그인 = %USERPROFILE%\.claude\.credentials.json (공식 문서). 래퍼는 빈 CLAUDE_SECURESTORAGE_CONFIG_DIR 로 이 파일을 공유 (2026-10-20 PoC)
    const cred = path.join(paths.home || '', '.claude', '.credentials.json');
    if (fs.existsSync(cred)) add('login', 'ok', `로그인 파일 있음 (${cred}) — 래퍼는 CLAUDE_SECURESTORAGE_CONFIG_DIR=(빈 값)으로 이 로그인을 씁니다 (문서에 없는 내부 변수 — claude 업데이트 뒤 "Not logged in" 이면 이것부터 확인)`);
    else add('login', 'warn', `로그인 파일이 없습니다 (${cred}) — 먼저 \`claude\` 로 한 번 로그인하세요`);
    const bash = findGitBash(env);
    add('gitBash', bash ? 'ok' : 'fail', bash ? `Git Bash ${bash} (훅·상태줄이 이것으로 돕니다)` : 'Git Bash(Git for Windows)를 찾지 못했습니다 — 훅이 PowerShell 로 떨어져 안전 가드가 동작하지 않습니다. https://git-scm.com 설치 또는 CLAUDE_CODE_GIT_BASH_PATH 지정');
  } else {
    add('login', 'info', `${platform}: 키체인 점검 건너뜀 — 로그인이 안 되면 CLAUDE_SECURESTORAGE_CONFIG_DIR 동작을 확인하세요`);
  }

  if (env.COPAD_MUX) add('mux', 'ok', 'comux 안에서 실행 중 (/harness 화면은 옆 창에 뜸)');
  else if (env.TMUX) add('mux', 'ok', 'tmux 안에서 실행 중 (/harness 화면은 팝업으로 뜸)');
  else if (platform === 'win32') add('mux', 'info', '윈도우 터미널 (/harness 화면은 새 창에 뜸)');
  else add('mux', 'info', '일반 터미널 (/harness 화면은 macOS 면 새 터미널 창, 그 밖엔 실행할 명령 안내)');

  // 설정 폴더 링크 — 하네스 원본·~/.claude 밖이나 없는 곳을 가리키면 경고
  if (project && project.configDir && fs.existsSync(project.configDir)) {
    const realCode = realOr(paths.codeHome);
    const realClaude = realOr(path.join(paths.home || '', '.claude'));
    const bad = [];
    const scan = (dir, depth) => {
      let entries = [];
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isSymbolicLink()) {
          const real = realOr(p);
          const fold = (s) => (platform === 'win32' ? s.toLowerCase() : s);
          const okHome = (base) => base && real && (fold(real) === fold(base) || fold(real).startsWith(fold(base) + path.sep));
          if (!real || !(okHome(realCode) || okHome(realClaude))) bad.push(path.relative(project.configDir, p));
        } else if (e.isDirectory() && depth < 1 && !['projects', 'plugins', 'plans'].includes(e.name)) scan(p, depth + 1);
      }
    };
    scan(project.configDir, 0);
    add('links', bad.length ? 'warn' : 'ok', bad.length ? `깨졌거나 밖을 가리키는 링크 ${bad.length}개: ${bad.join(', ')}` : `설정 폴더 링크 정상 (${project.configDir})`);
  }

  try { fs.mkdirSync(paths.dataDir, { recursive: true }); fs.accessSync(paths.dataDir, fs.constants.W_OK); add('data', 'ok', `데이터 폴더 ${paths.dataDir}`); }
  catch { add('data', 'fail', `데이터 폴더에 쓸 수 없습니다: ${paths.dataDir}`); }
  return out;
}

module.exports = { runDoctor, findGitBash };
