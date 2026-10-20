#!/usr/bin/env node
// gugbab 하네스 윈도우 지원 PoC — 윈도우 PC 에서 실행해 결과를 JSON 으로 남긴다.
//
// 사용 (PowerShell):
//   node poc-windows.js                 # 기본 — 환경·링크·셸·훅·Node 동작 + claude 시험 (claude -p 몇 번, haiku)
//   node poc-windows.js --no-claude     # claude 를 부르지 않는 검사만
//   node poc-windows.js --repo C:\src\00_gugbab-claude   # 그 클론에서 테스트 스위트까지 돌려 실패 수 집계
//   node poc-windows.js --link-creds    # 로그인 파일 링크 방식(하드링크·심볼릭)도 시험 — 실제 ~/.claude/.credentials.json 을 가리킴, 끝나면 원상 확인
//
// 안전: 실제 ~/.claude 는 읽기만 한다(--link-creds 때만 링크로 가리킴, 시작 전 해시를 남기고 끝나면 비교·복구).
//       로그인 토큰 값은 어디에도 기록하지 않는다(파일 존재·크기·최상위 키 이름만).
//       모든 시험 파일은 %TEMP%\gugbab-poc-<시각>\ 아래에 만들고 끝나면 지운다(--keep 이면 남김).
// 결과: 현재 폴더에 poc-windows-result.json (요약은 화면에도 출력)
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const cp = require('child_process');

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const NO_CLAUDE = flag('--no-claude');
const LINK_CREDS = flag('--link-creds');
const KEEP = flag('--keep');
const REPO = opt('--repo');
const MODEL = opt('--model') || 'haiku';
const OUT = path.resolve(opt('--out') || 'poc-windows-result.json');

const R = { startedAt: new Date().toISOString(), args: argv, checks: {} };
const IS_WIN = process.platform === 'win32';
const HOME = os.homedir();
const CLAUDE_HOME = path.join(HOME, '.claude');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'gugbab-poc-'));
R.work = WORK;

function log(...a) { console.log('[poc]', ...a); }
function rec(id, data) { R.checks[id] = data; const s = data && data.verdict ? ` → ${data.verdict}` : ''; log(id + s); }
function safe(fn) { try { return fn(); } catch (e) { return { error: String(e && e.code || ''), message: String(e && e.message || e).slice(0, 400) }; } }
function run(cmd, args, o = {}) {
  const r = cp.spawnSync(cmd, args, { encoding: 'utf8', timeout: o.timeout || 30000, windowsHide: true, ...o });
  return { status: r.status, signal: r.signal, error: r.error ? String(r.error.code || r.error.message) : null, stdout: (r.stdout || '').slice(0, o.keepOut || 4000), stderr: (r.stderr || '').slice(0, 2000) };
}
const sha = (f) => { try { return crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'); } catch { return null; } };
const exists = (p) => { try { fs.lstatSync(p); return true; } catch { return false; } };

// ─── 1. 환경 ────────────────────────────────────────────────────────────
function whereAll(name) {
  if (!IS_WIN) { const r = run('sh', ['-c', `command -v ${name}`]); return r.stdout.trim() ? [r.stdout.trim()] : []; }
  const r = run('where.exe', [name]);
  return r.status === 0 ? r.stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : [];
}
function regQuery(key, val) {
  if (!IS_WIN) return null;
  const r = run('reg.exe', ['query', key, '/v', val]);
  const m = /REG_\w+\s+(\S+)/.exec(r.stdout); return m ? m[1] : null;
}
const gitBashCandidates = [process.env.CLAUDE_CODE_GIT_BASH_PATH, 'C:\\Program Files\\Git\\bin\\bash.exe', 'C:\\Program Files (x86)\\Git\\bin\\bash.exe', path.join(HOME, 'AppData', 'Local', 'Programs', 'Git', 'bin', 'bash.exe')].filter(Boolean);
const GIT_BASH = gitBashCandidates.find(exists) || null;
const claudePaths = whereAll('claude');
rec('env', {
  platform: process.platform, release: os.release(), arch: process.arch, node: process.version,
  shellEnv: { ComSpec: process.env.ComSpec || null, SHELL: process.env.SHELL || null, PSModulePath: !!process.env.PSModulePath, HOME: process.env.HOME || null, USERPROFILE: process.env.USERPROFILE || null, TEMP: os.tmpdir() },
  homedir: HOME, pathDelimiter: path.delimiter, PATHEXT: process.env.PATHEXT || null,
  claude: claudePaths, claudeVersion: claudePaths.length ? safe(() => runClaudeRaw(['--version'], {}).stdout.trim()) : null,
  node_where: whereAll('node'), git: whereAll('git'), gitVersion: safe(() => run('git', ['--version']).stdout.trim()),
  gitBash: GIT_BASH, gitBashCandidates, dashInGitBash: GIT_BASH ? run(GIT_BASH, ['-lc', 'command -v dash || echo none']).stdout.trim() : null,
  bashOnPath: whereAll('bash'), // C:\Windows\System32\bash.exe(WSL) 가 먼저 잡히는지
  pwsh: whereAll('pwsh'), powershell: whereAll('powershell'), wt: whereAll('wt'), comux: whereAll('comux'), tmux: whereAll('tmux'),
  developerMode: regQuery('HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AppModelUnlock', 'AllowDevelopmentWithoutDevLicense'),
  longPaths: regQuery('HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem', 'LongPathsEnabled'),
  gitAutocrlf: run('git', ['config', '--get', 'core.autocrlf']).stdout.trim() || null,
  gitSymlinks: run('git', ['config', '--get', 'core.symlinks']).stdout.trim() || null,
  fromPowerShell: safe(() => process.env.GUGBAB_POC_PS ? JSON.parse(process.env.GUGBAB_POC_PS) : null), // poc-windows.ps1 이 넘긴 값
  stdinIsTTY: !!process.stdin.isTTY, stdoutIsTTY: !!process.stdout.isTTY, // mintty(Git Bash 창)면 false — 첫 실행 질문·TUI 가 꺼짐
  envVars: Object.fromEntries(['CLAUDE_CONFIG_DIR', 'CLAUDE_CODE_USE_POWERSHELL_TOOL', 'CLAUDE_CODE_GIT_BASH_PATH', 'CLAUDE_CODE_OAUTH_TOKEN', 'ANTHROPIC_API_KEY', 'CLAUDE_SECURESTORAGE_CONFIG_DIR'].map(k => [k, process.env[k] === undefined ? null : (/TOKEN|KEY/.test(k) ? '(set)' : process.env[k])])),
});

// ─── 2. 링크 만들기 (조립 compose.js 대체 수단) ─────────────────────────
(function links() {
  const d = path.join(WORK, 'links'); fs.mkdirSync(d);
  const srcDir = path.join(d, 'src-dir'); fs.mkdirSync(srcDir); fs.writeFileSync(path.join(srcDir, 'a.txt'), 'x');
  const srcFile = path.join(d, 'src.txt'); fs.writeFileSync(srcFile, 'hello');
  const t = (name, fn, check) => { const p = path.join(d, name); const r = safe(() => { fn(p); return { ok: true }; }); if (r.ok) Object.assign(r, safe(() => check(p))); return r; };
  const res = {
    fileSymlink: t('f-sym.txt', p => fs.symlinkSync(srcFile, p, 'file'), p => ({ reads: fs.readFileSync(p, 'utf8') === 'hello', isLink: fs.lstatSync(p).isSymbolicLink(), readlink: fs.readlinkSync(p) })),
    dirSymlink: t('d-sym', p => fs.symlinkSync(srcDir, p, 'dir'), p => ({ reads: exists(path.join(p, 'a.txt')), isLink: fs.lstatSync(p).isSymbolicLink(), readlink: fs.readlinkSync(p) })),
    junction: t('d-junc', p => fs.symlinkSync(srcDir, p, 'junction'), p => ({ reads: exists(path.join(p, 'a.txt')), isLink: fs.lstatSync(p).isSymbolicLink(), readlink: fs.readlinkSync(p), readlinkEqualsTarget: fs.readlinkSync(p) === srcDir })),
    junctionRelative: t('d-junc-rel', p => fs.symlinkSync('src-dir', p, 'junction'), p => ({ reads: exists(path.join(p, 'a.txt')), readlink: fs.readlinkSync(p) })),
    hardlink: t('f-hard.txt', p => fs.linkSync(srcFile, p), p => ({ reads: fs.readFileSync(p, 'utf8') === 'hello', isLink: fs.lstatSync(p).isSymbolicLink(), nlink: fs.statSync(p).nlink })),
    defaultTypeDirSymlink: t('d-default', p => fs.symlinkSync(srcDir, p), p => ({ reads: exists(path.join(p, 'a.txt')) })), // compose.js:151 처럼 type 생략
  };
  // 하드링크 원본을 "임시 파일 → rename" 으로 갱신하면 링크가 끊기는지 (토큰 갱신 방식 흉내)
  res.hardlinkAfterRenameWrite = safe(() => { const h = path.join(d, 'f-hard.txt'); if (!exists(h)) return { skipped: true }; const tmp = srcFile + '.tmp'; fs.writeFileSync(tmp, 'new'); fs.renameSync(tmp, srcFile); return { linkSeesNew: fs.readFileSync(h, 'utf8') === 'new' }; });
  // 링크 삭제가 원본을 건드리지 않는지
  res.unlinkJunctionKeepsTarget = safe(() => { const j = path.join(d, 'd-junc'); if (!exists(j)) return { skipped: true }; fs.unlinkSync(j); return { targetIntact: exists(path.join(srcDir, 'a.txt')) }; });
  res.verdict = res.junction.ok ? (res.dirSymlink.ok ? 'symlink+junction 가능' : 'junction 만 (개발자 모드 꺼짐)') : '폴더 링크 불가';
  rec('links', res);
})();

// ─── 3. Node 동작 (훅·조립 코드가 기대는 것) ─────────────────────────────
(function nodeBehaviors() {
  const d = path.join(WORK, 'node'); fs.mkdirSync(d);
  const probe = path.join(d, 'stdin.js');
  fs.writeFileSync(probe, `const fs=require('fs');const o={};try{o.devStdin=fs.readFileSync('/dev/stdin','utf8')}catch(e){o.devStdinErr=e.code}try{o.fd0=fs.readFileSync(0,'utf8')}catch(e){o.fd0Err=e.code}process.stdout.write(JSON.stringify(o))`);
  const stdin = run(process.execPath, [probe], { input: '{"a":1}' });
  const stdin2 = run(process.execPath, ['-e', `const fs=require('fs');let o={};try{o.fd0=fs.readFileSync(0,'utf8')}catch(e){o.fd0Err=e.code}process.stdout.write(JSON.stringify(o))`], { input: '{"b":2}' });
  // 열려 있는 파일 위로 rename (atomicWrite 대상 — 윈도우 EPERM/EBUSY)
  const renameOverOpen = safe(() => { const f = path.join(d, 'r.json'); fs.writeFileSync(f, '1'); const fd = fs.openSync(f, 'r'); try { fs.writeFileSync(f + '.tmp', '2'); fs.renameSync(f + '.tmp', f); return { ok: true }; } finally { fs.closeSync(fd); } });
  const chmod = safe(() => { const f = path.join(d, 'm'); fs.writeFileSync(f, ''); fs.chmodSync(f, 0o600); return { modeAfter600: (fs.statSync(f).mode & 0o777).toString(8) }; });
  const execRedirect = safe(() => { cp.execSync('git rev-parse --show-toplevel 2>/dev/null', { cwd: d, stdio: 'pipe' }); return { ok: true }; });
  const execShell = safe(() => ({ shell: cp.execSync(IS_WIN ? 'echo %ComSpec%' : 'echo $0', { encoding: 'utf8' }).trim() }));
  const spawnCmdNoShell = claudePaths.find(p => /\.cmd$/i.test(p)) ? safe(() => { const r = cp.spawnSync(claudePaths.find(p => /\.cmd$/i.test(p)), ['--version'], { encoding: 'utf8' }); return { status: r.status, error: r.error && r.error.code }; }) : { skipped: 'claude.cmd 없음' };
  const pathCase = IS_WIN ? safe(() => ({ realpathNative: fs.realpathSync.native(HOME.toLowerCase()), realpathJs: fs.realpathSync(HOME.toLowerCase()), home: HOME })) : null;
  const longName = safe(() => { const p = path.join(d, 'x'.repeat(120), 'y'.repeat(120), 'z'.repeat(40)); fs.mkdirSync(p, { recursive: true }); fs.writeFileSync(path.join(p, 'f.txt'), 'ok'); return { ok: true, len: p.length }; });
  rec('node', {
    stdinViaDevStdin: safe(() => JSON.parse(stdin.stdout)), stdinViaFd0Only: safe(() => JSON.parse(stdin2.stdout)),
    renameOverOpenFile: renameOverOpen, chmod600: chmod, execSyncDevNull: execRedirect, execSyncShell: execShell, spawnCmdWithoutShell: spawnCmdNoShell,
    pathCase, longPath260: longName, tmpdir: os.tmpdir(), sep: path.sep,
    verdict: (safe(() => JSON.parse(stdin.stdout)) || {}).devStdinErr ? '/dev/stdin 실패 → 훅 8개 fail-open 확인' : '/dev/stdin 동작',
  });
})();

// ─── 4. git 줄바꿈 (.gitattributes 필요성) ──────────────────────────────
(function gitEol() {
  const d = path.join(WORK, 'git'); fs.mkdirSync(d);
  const src = path.join(d, 'src');
  const g = (cwd, ...a) => run('git', a, { cwd });
  fs.mkdirSync(src); g(src, 'init', '-q'); g(src, 'config', 'user.email', 'poc@example.invalid'); g(src, 'config', 'user.name', 'poc');
  fs.writeFileSync(path.join(src, 'a.sh'), '#!/bin/sh\necho hi\n'); fs.writeFileSync(path.join(src, 'SKILL.md'), '---\nname: x\n---\nbody\n');
  g(src, 'add', '.'); g(src, 'commit', '-qm', 'a');
  const clone = (name, extra) => { const c = path.join(d, name); run('git', ['-c', 'core.autocrlf=true', 'clone', '-q', ...extra, src, c]); const b = safe(() => fs.readFileSync(path.join(c, 'SKILL.md'))); return Buffer.isBuffer(b) ? { crlf: b.includes(Buffer.from('\r\n')) } : b; };
  const withoutAttr = clone('c1', []);
  fs.writeFileSync(path.join(src, '.gitattributes'), '* text=auto eol=lf\n'); g(src, 'add', '.'); g(src, 'commit', '-qm', 'attr');
  const withAttr = clone('c2', []);
  rec('gitEol', { autocrlfTrueWithoutAttributes: withoutAttr, autocrlfTrueWithAttributes: withAttr, verdict: withoutAttr.crlf && withAttr.crlf === false ? '.gitattributes 로 해결됨' : 'CRLF 문제 없음 또는 판정 불가' });
})();

// ─── 5. Git Bash 동작 (훅이 Bash 로 돌 때 가정) ───────────────────────────
if (GIT_BASH) {
  const b = (s) => run(GIT_BASH, ['-c', s]).stdout.trim();
  rec('gitBash', {
    ostype: b('echo $OSTYPE'), uname: b('uname -s'), home: b('echo $HOME'), tmp: b('echo $TMPDIR:$TMP'), pwdOfTemp: run(GIT_BASH, ['-c', 'pwd'], { cwd: WORK }).stdout.trim(),
    devStdinInNodeUnderBash: run(GIT_BASH, ['-c', `echo '{"x":1}' | "${process.execPath.replace(/\\/g, '/')}" -e "try{console.log(require('fs').readFileSync('/dev/stdin','utf8').trim())}catch(e){console.log('ERR',e.code)}"`]).stdout.trim(),
    setM: b('set -m && echo ok'),
    lnS: (() => { const r = run(GIT_BASH, ['-c', 'mkdir -p a && ln -s a b && test -L b && echo symlink || echo copied'], { cwd: WORK }); return r.stdout.trim() || r.stderr.trim(); })(),
  });
} else rec('gitBash', { skipped: 'Git Bash 없음 — Claude Code 윈도우 요구사항 확인 필요', verdict: 'Git for Windows 없음' });

// ─── 6. claude 시험 ───────────────────────────────────────────────────
function runClaudeRaw(args, env, o = {}) {
  const exe = claudePaths[0];
  if (!exe) return { error: 'claude 없음' };
  const fullEnv = { ...process.env, ...env };
  for (const [k, v] of Object.entries(env)) if (v === null) delete fullEnv[k];
  if (/\.(cmd|bat)$/i.test(exe)) {
    // .cmd 는 셸 없이 못 띄운다(Node 보안 수정) — 인자는 알파벳·숫자·공백·-:,. 만 쓰므로 큰따옴표로 감싸 넘긴다
    const q = (s) => /^[\w\-:.,=/ \\]*$/.test(s) ? `"${s}"` : (() => { throw new Error('인자에 특수문자: ' + s); })();
    return run(`"${exe}" ${args.map(q).join(' ')}`, [], { shell: true, env: fullEnv, timeout: o.timeout || 180000, cwd: o.cwd, keepOut: 200000, input: o.input });
  }
  return run(exe, args, { env: fullEnv, timeout: o.timeout || 180000, cwd: o.cwd, keepOut: 200000, input: o.input });
}
function claudeP(cfg, prompt, extraEnv = {}, extraArgs = []) {
  const cwd = path.join(WORK, 'proj'); fs.mkdirSync(cwd, { recursive: true });
  // 밖에서 물려받은 인증 변수가 결과를 흐리지 않게 기본으로 지운다(래퍼 세션 안에서 돌리면 CLAUDE_SECURESTORAGE_CONFIG_DIR= 가 새어 들어옴 — 맥에서 확인)
  const env = { CLAUDE_SECURESTORAGE_CONFIG_DIR: null, CLAUDE_CODE_OAUTH_TOKEN: null, ANTHROPIC_API_KEY: null, ANTHROPIC_AUTH_TOKEN: null, CLAUDE_CODE_USE_POWERSHELL_TOOL: null, CLAUDE_CONFIG_DIR: cfg, ...extraEnv };
  // 프롬프트는 stdin 으로 — claude.cmd(npm 설치)일 때 $·" 가 cmd 인용에서 깨지지 않게
  const r = runClaudeRaw(['-p', '--model', MODEL, '--output-format', 'stream-json', '--verbose', '--max-turns', '3', ...extraArgs], env, { cwd, input: prompt });
  const lines = (r.stdout || '').split(/\r?\n/).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const init = lines.find(l => l.type === 'system' && l.subtype === 'init') || null;
  const result = lines.find(l => l.type === 'result') || null;
  const text = result && typeof result.result === 'string' ? result.result : '';
  const all = (r.stdout || '') + (r.stderr || '');
  return {
    status: r.status, error: r.error, loggedIn: !!result && !result.is_error && !/not logged in|please run \/login/i.test(text + (r.stderr || '')),
    blockedByPocHook: /blocked by poc/i.test(all),
    resultText: text.slice(0, 300), isError: result ? !!result.is_error : null,
    init: init ? { tools: init.tools, slash_commands: init.slash_commands, agents: init.agents, skills: init.skills, plugins: init.plugins, apiKeySource: init.apiKeySource, cwd: init.cwd, model: init.model } : null,
    stderrHead: (r.stderr || '').slice(0, 500), lines: lines.length,
  };
}
function newCfg(name) { const c = path.join(WORK, 'cfg-' + name); fs.mkdirSync(c, { recursive: true }); return c; }

if (NO_CLAUDE || !claudePaths.length) {
  rec('claude', { skipped: NO_CLAUDE ? '--no-claude' : 'claude 없음' });
} else {
  const credFile = path.join(CLAUDE_HOME, '.credentials.json');
  const credBefore = sha(credFile);
  rec('credentialsFile', { path: credFile, exists: exists(credFile), bytes: safe(() => fs.statSync(credFile).size), topKeys: safe(() => Object.keys(JSON.parse(fs.readFileSync(credFile, 'utf8')))), claudeJsonExists: exists(path.join(HOME, '.claude.json')) });
  const PING = 'Reply with exactly the word POCOK and nothing else';

  // 6-1 로그인 공유 방식
  const login = {};
  login.baseline_noConfigDir = claudeP(CLAUDE_HOME, PING, { CLAUDE_CONFIG_DIR: null }); // 기준 — 이게 안 되면 이 PC 는 먼저 claude 로그인 필요
  login.newConfigDir = claudeP(newCfg('plain'), PING);
  login.newConfigDir_secureStorageEmpty = claudeP(newCfg('ss-empty'), PING, { CLAUDE_SECURESTORAGE_CONFIG_DIR: '' }); // macOS 래퍼 방식
  login.newConfigDir_secureStorageHome = claudeP(newCfg('ss-home'), PING, { CLAUDE_SECURESTORAGE_CONFIG_DIR: CLAUDE_HOME });
  if (exists(credFile)) {
    const cCopy = newCfg('copy'); fs.copyFileSync(credFile, path.join(cCopy, '.credentials.json'));
    login.copyCredentials = claudeP(cCopy, PING);
    safe(() => fs.rmSync(path.join(cCopy, '.credentials.json'), { force: true }));
    if (LINK_CREDS) {
      const backup = path.join(WORK, 'cred-backup.json'); fs.copyFileSync(credFile, backup);
      const cHard = newCfg('hard'); const hl = safe(() => { fs.linkSync(credFile, path.join(cHard, '.credentials.json')); return { ok: true }; });
      login.hardlinkCredentials = hl.ok ? { ...claudeP(cHard, PING), stillHardlinked: safe(() => fs.statSync(path.join(cHard, '.credentials.json')).nlink) } : hl;
      const cSym = newCfg('sym'); const sl = safe(() => { fs.symlinkSync(credFile, path.join(cSym, '.credentials.json'), 'file'); return { ok: true }; });
      login.symlinkCredentials = sl.ok ? { ...claudeP(cSym, PING), stillSymlink: safe(() => fs.lstatSync(path.join(cSym, '.credentials.json')).isSymbolicLink()) } : sl;
      // 원상 확인 — 실제 파일이 사라지거나 깨졌으면 백업으로 복구
      const okJson = safe(() => { JSON.parse(fs.readFileSync(credFile, 'utf8')); return true; }) === true;
      if (!okJson) { fs.copyFileSync(backup, credFile); login.restoredCredentials = true; }
      fs.rmSync(backup, { force: true });
    }
  } else login.copyCredentials = { skipped: '~/.claude/.credentials.json 없음 — 로그인 저장 위치가 다름(키체인/자격 증명 관리자?)' };
  if (process.env.CLAUDE_CODE_OAUTH_TOKEN) login.oauthTokenEnv = claudeP(newCfg('oauth'), PING, { CLAUDE_CODE_OAUTH_TOKEN: process.env.CLAUDE_CODE_OAUTH_TOKEN });
  login.credentialsChangedDuringPoc = sha(credFile) !== credBefore;
  const works = Object.entries(login).filter(([, v]) => v && v.loggedIn).map(([k]) => k);
  login.verdict = works.length ? '로그인 되는 방식: ' + works.join(', ') : '어느 방식도 로그인 안 됨';
  rec('login', login);

  // 이후 시험은 로그인 되는 방식으로 (없으면 init 목록만 본다)
  const authMode = works.find(k => k !== 'baseline_noConfigDir') || null;
  function prepCfg(name) {
    const c = newCfg(name);
    if (authMode === 'copyCredentials' && exists(credFile)) fs.copyFileSync(credFile, path.join(c, '.credentials.json'));
    return c;
  }
  const authEnv = authMode === 'newConfigDir_secureStorageEmpty' ? { CLAUDE_SECURESTORAGE_CONFIG_DIR: '' } : authMode === 'newConfigDir_secureStorageHome' ? { CLAUDE_SECURESTORAGE_CONFIG_DIR: CLAUDE_HOME } : {};
  const cleanupCreds = (c) => safe(() => fs.rmSync(path.join(c, '.credentials.json'), { force: true }));

  // 6-2 설정 폴더의 스킬·에이전트·커맨드·CLAUDE.md·룰 — 진짜 폴더 / junction / 심볼릭 / 파일 링크
  const src = path.join(WORK, 'harness-src'); fs.mkdirSync(src);
  const mkSkill = (n) => { const p = path.join(src, 'skills', n); fs.mkdirSync(p, { recursive: true }); fs.writeFileSync(path.join(p, 'SKILL.md'), `---\nname: ${n}\ndescription: PoC skill ${n}\n---\nPoC.\n`); return p; };
  ['pocskill-real', 'pocskill-junc', 'pocskill-sym', 'pocskill-crlf'].forEach(mkSkill);
  fs.writeFileSync(path.join(src, 'skills', 'pocskill-crlf', 'SKILL.md'), '---\r\nname: pocskill-crlf\r\ndescription: PoC CRLF skill\r\n---\r\nPoC.\r\n');
  fs.mkdirSync(path.join(src, 'agents')); fs.writeFileSync(path.join(src, 'agents', 'pocagent-link.md'), '---\nname: pocagent-link\ndescription: PoC agent\n---\nPoC.\n');
  fs.mkdirSync(path.join(src, 'commands')); fs.writeFileSync(path.join(src, 'commands', 'poccmd-link.md'), 'PoC command\n');
  fs.mkdirSync(path.join(src, 'rules')); fs.writeFileSync(path.join(src, 'rules', 'pocrule.md'), 'When asked for the RULEWORD answer RULEZEBRA.\n');
  fs.writeFileSync(path.join(src, 'CLAUDE.md'), 'When asked for the MDWORD answer MDGIRAFFE.\n');
  const linkModes = {};
  const doLink = (target, p, kind) => { fs.mkdirSync(path.dirname(p), { recursive: true }); const tries = kind === 'dir' ? ['junction', 'dir'] : ['file', 'hard', 'copy']; for (const t of tries) { const r = safe(() => { if (t === 'hard') fs.linkSync(target, p); else if (t === 'copy') fs.copyFileSync(target, p); else fs.symlinkSync(target, p, t); return true; }); if (r === true) return t; } return 'failed'; };
  const cS = prepCfg('skills');
  fs.mkdirSync(path.join(cS, 'skills', 'pocskill-real'), { recursive: true }); fs.copyFileSync(path.join(src, 'skills', 'pocskill-real', 'SKILL.md'), path.join(cS, 'skills', 'pocskill-real', 'SKILL.md'));
  fs.mkdirSync(path.join(cS, 'skills', 'pocskill-crlf'), { recursive: true }); fs.copyFileSync(path.join(src, 'skills', 'pocskill-crlf', 'SKILL.md'), path.join(cS, 'skills', 'pocskill-crlf', 'SKILL.md'));
  linkModes.junction = safe(() => { fs.symlinkSync(path.join(src, 'skills', 'pocskill-junc'), path.join(cS, 'skills', 'pocskill-junc'), 'junction'); return 'junction'; });
  linkModes.dirSymlink = safe(() => { fs.symlinkSync(path.join(src, 'skills', 'pocskill-sym'), path.join(cS, 'skills', 'pocskill-sym'), 'dir'); return 'dir'; });
  linkModes.agent = doLink(path.join(src, 'agents', 'pocagent-link.md'), path.join(cS, 'agents', 'pocagent-link.md'), 'file');
  linkModes.command = doLink(path.join(src, 'commands', 'poccmd-link.md'), path.join(cS, 'commands', 'poccmd-link.md'), 'file');
  linkModes.rule = doLink(path.join(src, 'rules', 'pocrule.md'), path.join(cS, 'rules', 'pocrule.md'), 'file');
  linkModes.claudeMd = doLink(path.join(src, 'CLAUDE.md'), path.join(cS, 'CLAUDE.md'), 'file');
  const sk = claudeP(cS, 'Answer two things in one line separated by a space: the MDWORD and the RULEWORD from your instructions. If unknown write NONE for each', authEnv);
  const names = (arr) => (Array.isArray(arr) ? arr : []).map(x => typeof x === 'string' ? x : (x && (x.name || x.id)) || '').filter(Boolean);
  const listed = (arr, n) => names(arr).some(x => x === n || x.endsWith(':' + n) || x.includes(n));
  rec('configDirContent', {
    linkModes, run: { loggedIn: sk.loggedIn, resultText: sk.resultText, isError: sk.isError, stderrHead: sk.stderrHead },
    seen: sk.init ? {
      skillReal: listed(sk.init.skills, 'pocskill-real') || listed(sk.init.slash_commands, 'pocskill-real'),
      skillCrlf: listed(sk.init.skills, 'pocskill-crlf') || listed(sk.init.slash_commands, 'pocskill-crlf'),
      skillJunction: listed(sk.init.skills, 'pocskill-junc') || listed(sk.init.slash_commands, 'pocskill-junc'),
      skillDirSymlink: listed(sk.init.skills, 'pocskill-sym') || listed(sk.init.slash_commands, 'pocskill-sym'),
      agentLink: listed(sk.init.agents, 'pocagent-link'), commandLink: listed(sk.init.slash_commands, 'poccmd-link'),
      claudeMd: /MDGIRAFFE/.test(sk.resultText), rule: /RULEZEBRA/.test(sk.resultText),
    } : null,
    initLists: sk.init ? { skills: names(sk.init.skills), agents: names(sk.init.agents).slice(0, 40), slash_commands: names(sk.init.slash_commands).slice(0, 80) } : null,
    verdict: !sk.init ? 'init 정보 없음 — 판정 불가' : undefined,
  });
  cleanupCreds(cS);

  // 6-3 훅 — 어떤 셸로 도는지, stdin, 경로 형식, exit 2 차단, settings env 전달
  const cH = prepCfg('hooks');
  const hookOut = path.join(WORK, 'hook-out'); fs.mkdirSync(hookOut);
  const probeJs = path.join(WORK, 'hook-probe.js');
  fs.writeFileSync(probeJs, `const fs=require('fs'),path=require('path');const ev=process.argv[2];const o={ev,argv:process.argv.slice(2),cwd:process.cwd(),env:{SHELL:process.env.SHELL||null,ComSpec:process.env.ComSpec||null,MSYSTEM:process.env.MSYSTEM||null,CLAUDE_PROJECT_DIR:process.env.CLAUDE_PROJECT_DIR||null,CLAUDE_CONFIG_DIR:process.env.CLAUDE_CONFIG_DIR||null,POC_ENV:process.env.POC_ENV||null,HOME:process.env.HOME||null}};o.devStdinExists=fs.existsSync('/dev/stdin');try{const s=fs.readFileSync(0,'utf8');o.fd0Len=s.length;const j=JSON.parse(s);o.input={keys:Object.keys(j),cwd:j.cwd,transcript_path:j.transcript_path,tool_name:j.tool_name,tool_input:j.tool_input}}catch(e){o.fd0Err=e.code||String(e)}fs.writeFileSync(path.join(${JSON.stringify(hookOut)},ev+'-'+Date.now()+'.json'),JSON.stringify(o));if(ev==='PreToolUse'&&o.input&&o.input.tool_input&&/POCBLOCK/.test(JSON.stringify(o.input.tool_input))){process.stderr.write('blocked by poc');process.exit(2)}`);
  const fwd = (p) => p.replace(/\\/g, '/');
  const shellMark = path.join(hookOut, 'shell.txt');
  const settings = {
    env: { POC_ENV: 'from-settings' },
    hooks: {
      SessionStart: [{ hooks: [{ type: 'command', command: `node "${probeJs}" SessionStart` }] }],
      UserPromptSubmit: [{ hooks: [
        { type: 'command', command: `node "${fwd(probeJs)}" UserPromptSubmit` },
        { type: 'command', command: `echo "zero=$0 bash=$BASH_VERSION comspec=%ComSpec%" > "${fwd(shellMark)}"` },
      ] }],
      PreToolUse: [{ matcher: '*', hooks: [{ type: 'command', command: `node "${fwd(probeJs)}" PreToolUse` }] }],
    },
  };
  fs.writeFileSync(path.join(cH, 'settings.json'), JSON.stringify(settings, null, 2));
  const hk = claudeP(cH, 'Use the Bash tool to run exactly this command: echo POCBLOCK. Then use the Bash tool to run: echo "bash=$BASH_VERSION ostype=$OSTYPE". Report both outputs in one line.', authEnv, ['--allowedTools', 'Bash']);
  const outs = safe(() => fs.readdirSync(hookOut).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(hookOut, f), 'utf8'))));
  rec('hooks', {
    run: { loggedIn: hk.loggedIn, resultText: hk.resultText, tools: hk.init && hk.init.tools, stderrHead: hk.stderrHead },
    shellMarker: safe(() => fs.readFileSync(shellMark, 'utf8').trim()), // zero=/usr/bin/bash → Git Bash, zero=$0 → cmd, zero= → PowerShell
    probes: outs,
    backslashPathCommandRan: Array.isArray(outs) && outs.some(o => o.ev === 'SessionStart'),
    forwardSlashPathCommandRan: Array.isArray(outs) && outs.some(o => o.ev === 'UserPromptSubmit'),
    exit2Blocked: hk.blockedByPocHook,
    verdict: `훅 셸: ${(() => { const s = safe(() => fs.readFileSync(shellMark, 'utf8')) || ''; return typeof s !== 'string' ? '판정 불가' : /zero=\S*(bash|sh)\b/.test(s) ? 'bash 계열' : /zero=\$0/.test(s) ? 'cmd' : /zero=\s/.test(s) ? 'PowerShell' : '판정 불가'; })()} · exit 2 차단 ${hk.blockedByPocHook ? '됨' : '안 됨'}`,
  });
  cleanupCreds(cH);

  // 6-3b 훅 exec 형식(args) — 셸을 거치지 않고 node 를 바로 띄우는지 (설정 스키마가 틀리면 settings 전체가 무시될 수 있어 따로 시험)
  const cA = prepCfg('hooks-args');
  const argsOut = path.join(WORK, 'hook-out-args'); fs.mkdirSync(argsOut);
  const argsProbe = path.join(WORK, 'hook-probe-args.js');
  fs.writeFileSync(argsProbe, `const fs=require('fs');let s='';try{s=fs.readFileSync(0,'utf8')}catch(e){s='ERR '+e.code}fs.writeFileSync(${JSON.stringify(path.join(argsOut, 'args.json'))},JSON.stringify({argv:process.argv.slice(2),stdinLen:s.length,SHELL:process.env.SHELL||null,MSYSTEM:process.env.MSYSTEM||null}))`);
  fs.writeFileSync(path.join(cA, 'settings.json'), JSON.stringify({ hooks: { UserPromptSubmit: [{ hooks: [{ type: 'command', command: process.execPath, args: [argsProbe, 'with space', 'C:\\back\\slash'] }] }] } }, null, 2));
  const ha = claudeP(cA, PING, authEnv);
  rec('hooksArgsForm', { loggedIn: ha.loggedIn, stderrHead: ha.stderrHead, probe: safe(() => JSON.parse(fs.readFileSync(path.join(argsOut, 'args.json'), 'utf8'))), verdict: exists(path.join(argsOut, 'args.json')) ? 'args 형식 동작 — 경로 인용 문제 없이 훅 실행 가능' : 'args 형식 안 됨 또는 미지원 버전' });
  cleanupCreds(cA);

  // 6-4 PowerShell 도구 기본값·끄는 변수·Bash deny 규칙이 있을 때 (공식 문서: Git Bash 가 있으면 Bash deny 가 PowerShell 도구를 끔)
  const cP1 = prepCfg('ps-default'); const ps1 = claudeP(cP1, PING, authEnv); cleanupCreds(cP1);
  const cP2 = prepCfg('ps-off'); const ps2 = claudeP(cP2, PING, { ...authEnv, CLAUDE_CODE_USE_POWERSHELL_TOOL: '0' }); cleanupCreds(cP2);
  const cP3 = prepCfg('ps-deny'); fs.writeFileSync(path.join(cP3, 'settings.json'), JSON.stringify({ permissions: { deny: ['Bash(git push --force*)'] } }, null, 2)); const ps3 = claudeP(cP3, PING, authEnv); cleanupCreds(cP3);
  const hasPs = (r) => r.init ? (r.init.tools || []).some(t => /powershell/i.test(String(t))) : null;
  const hasBash = (r) => r.init ? (r.init.tools || []).includes('Bash') : null;
  rec('powershellTool', { defaultHasPowerShell: hasPs(ps1), defaultHasBash: hasBash(ps1), withEnv0HasPowerShell: hasPs(ps2), withBashDenyHasPowerShell: hasPs(ps3), toolsDefault: ps1.init && ps1.init.tools, verdict: hasPs(ps1) === null ? '판정 불가' : `기본 ${hasPs(ps1) ? '켜짐' : '꺼짐'} · 변수 0 → ${hasPs(ps2) ? '켜짐' : '꺼짐'} · Bash deny → ${hasPs(ps3) ? '켜짐' : '꺼짐'}` });

  // 6-5 .claude.json 신뢰 기록·projects 폴더 이름 형식
  const cfgsWithCj = fs.readdirSync(WORK).filter(n => n.startsWith('cfg-')).map(n => path.join(WORK, n));
  const cjKeys = cfgsWithCj.map(c => safe(() => Object.keys((JSON.parse(fs.readFileSync(path.join(c, '.claude.json'), 'utf8')).projects) || {}))).find(k => Array.isArray(k) && k.length) || null;
  const projDirs = cfgsWithCj.map(c => safe(() => fs.readdirSync(path.join(c, 'projects')))).find(k => Array.isArray(k) && k.length) || null;
  rec('pathFormats', { claudeJsonProjectKeys: cjKeys, projectsDirNames: projDirs, workDirAsGiven: path.join(WORK, 'proj'), homeClaudeJsonKeySample: safe(() => Object.keys(JSON.parse(fs.readFileSync(path.join(HOME, '.claude.json'), 'utf8')).projects || {}).slice(0, 3)) });

  // 6-6 실행 중 세션 목록 위치 (세션 간 메시지)
  rec('sessions', { homeSessionsDir: exists(path.join(CLAUDE_HOME, 'sessions')), homeSessionsCount: safe(() => fs.readdirSync(path.join(CLAUDE_HOME, 'sessions')).length), note: '대화형 세션 2개를 서로 다른 CLAUDE_CONFIG_DIR 로 띄워 ListAgents 로 서로 보이는지는 수동 확인(체크리스트 M3)' });
  rec('credentialsAfter', { changed: sha(credFile) !== credBefore, stillValidJson: safe(() => { JSON.parse(fs.readFileSync(credFile, 'utf8')); return true; }) });
}

// ─── 7. 하네스 테스트 스위트 (--repo) ────────────────────────────────────
if (REPO) {
  // 래퍼 세션 안에서 돌리면 GUGBAB_*·CLAUDE_CONFIG_DIR 가 테스트에 새어 실패한다(맥에서 확인) — 지우고 돌린다
  const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^GUGBAB_|^CLAUDE_CONFIG_DIR$|^CLAUDE_PROJECT_DIR$|^CLAUDE_BASH_GUARD_ALLOWED_DIRS$/.test(k)));
  const suites = {};
  for (const dir of ['cli', '.claude/hooks', 'scripts', 'docs/plans/page']) {
    const abs = path.join(REPO, dir);
    if (!exists(abs)) { suites[dir] = { skipped: '없음' }; continue; }
    const files = fs.readdirSync(abs).filter(f => /\.test\.js$/.test(f));
    const per = {};
    for (const f of files) {
      // cli·scripts 는 node:test(TAP), 훅 테스트는 자체 러너("결과: N/M 통과") — 종료 코드가 최종 판정
      const r = run(process.execPath, ['--test', path.join(abs, f)], { cwd: REPO, timeout: 300000, keepOut: 400000, env: cleanEnv });
      const all = r.stdout + r.stderr;
      const own = /결과:\s*(\d+)\s*\/\s*(\d+)/.exec(all);
      const pass = own ? +own[1] : +((/^# pass (\d+)/m.exec(all) || [])[1] || 0);
      const fail = own ? +own[2] - +own[1] : +((/^# fail (\d+)/m.exec(all) || [])[1] || 0);
      const firstFail = (/not ok \d+ - (.+)/.exec(all) || /❌\s*(.+)/.exec(all) || [])[1] || null;
      per[f] = { pass, fail, status: r.status, timedOut: r.signal === 'SIGTERM' || r.error === 'ETIMEDOUT', firstFail: firstFail && firstFail.slice(0, 160) };
    }
    suites[dir] = per;
  }
  // 7b 훅에 윈도우식 입력을 직접 넣어 방어가 살아 있는지 (fail-open 실측). stdin 은 파이프로 넘김 — 실제 claude 와 같은 방식
  const hookDir = path.join(REPO, '.claude', 'hooks');
  const projRoot = REPO;
  const hk = (file, input) => {
    const r = run(process.execPath, [path.join(hookDir, file)], { input: JSON.stringify(input), cwd: projRoot, env: { ...cleanEnv, CLAUDE_PROJECT_DIR: projRoot }, timeout: 20000 });
    let decision = null; try { const j = JSON.parse(r.stdout); decision = (j.hookSpecificOutput && (j.hookSpecificOutput.permissionDecision || (j.hookSpecificOutput.decision && j.hookSpecificOutput.decision.behavior))) || j.decision || null; } catch { /* 출력 없음 */ }
    return { exit: r.status, decision, stderr: r.stderr.slice(0, 160) };
  };
  const bash = (command) => ({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command }, cwd: projRoot });
  const permReq = (command) => ({ hook_event_name: 'PermissionRequest', tool_name: 'Bash', tool_input: { command }, cwd: projRoot });
  const home = HOME.replace(/\\/g, '/');
  const msysHome = IS_WIN ? '/' + home[0].toLowerCase() + home.slice(2) : home; // C:/Users/x → /c/Users/x
  // 기대값: deny = 막아야 함, ask = 확인, allow = 자동. 윈도우에서 기대와 다르면 그 항목이 고칠 곳
  const cases = [
    ['bash-guard.js', bash('git push --force origin main'), 'deny'],
    ['bash-guard.js', bash('git.exe push --force origin main'), 'deny'],
    ['bash-guard.js', permReq('git.exe push --force origin main'), 'not-allow'],
    ['bash-guard.js', bash('rm -rf "$HOME"'), 'deny'],
    ['bash-guard.js', bash(`rm -rf ${msysHome}`), 'deny'],
    ['bash-guard.js', bash(`rm -rf ${home}`), 'deny'],
    ['bash-guard.js', bash('rm.exe -rf ~'), 'deny'],
    ['bash-guard.js', permReq('cmd //c "rd /s /q C:\\Users"'), 'not-allow'],
    ['bash-guard.js', permReq('powershell.exe -c Remove-Item -Recurse -Force C:\\Users'), 'not-allow'],
    ['bash-guard.js', bash(`cat ${home}/.ssh/id_rsa`), 'deny'],
    ['bash-guard.js', bash('ls -la'), 'not-deny'],
    ['branch-protection.js', bash('git push origin main'), 'exit2'],
    ['protect-secrets.js', { hook_event_name: 'PreToolUse', tool_name: 'Read', tool_input: { file_path: path.join(HOME, '.ssh', 'id_rsa') }, cwd: projRoot }, 'exit2'],
    ['protect-secrets.js', { hook_event_name: 'PreToolUse', tool_name: 'Read', tool_input: { file_path: path.join(HOME, '.SSH', 'id_rsa').toLowerCase() }, cwd: projRoot }, 'exit2'],
    ['auto-approve.js', { hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: path.join(projRoot, 'poc-tmp.txt'), content: 'x' }, cwd: projRoot }, 'allow'],
    ['auto-approve.js', { hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: path.join(os.tmpdir(), 'poc-tmp.txt'), content: 'x' }, cwd: projRoot }, 'allow'],
    ['parry.js', { hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: path.join(projRoot, 'poc-cfg.js'), content: 'const k = "AKIA' + 'IOSFODNN7EXAMPLE"' }, cwd: projRoot }, 'exit2-or-deny'],
  ];
  // 2026-10-20 맥에서도 기대와 다르게 나온 것(.exe·cmd·powershell 이름) — 윈도우에서만 실제로 실행되는 이름이라 거기서 위험. 고친 뒤엔 ok 로 바뀌어야 한다
  const KNOWN_GAP = /git\.exe|rm\.exe|cmd \/\/c|powershell\.exe/;
  const probes = cases.filter(([f]) => exists(path.join(hookDir, f))).map(([f, input, expect]) => {
    const got = hk(f, input);
    const blocked = got.exit === 2 || got.decision === 'deny';
    const ok = expect === 'deny' ? blocked : expect === 'exit2' ? got.exit === 2 : expect === 'exit2-or-deny' ? blocked : expect === 'not-allow' ? got.decision !== 'allow' : expect === 'not-deny' ? !blocked : got.decision === expect;
    return { hook: f, input: input.tool_input, expect, got, ok, knownGapAllPlatforms: KNOWN_GAP.test(JSON.stringify(input.tool_input)) };
  });
  rec('hookDefenses', { probes, failing: probes.filter(p => !p.ok).map(p => `${p.hook} ${JSON.stringify(p.input).slice(0, 80)} 기대 ${p.expect} → ${p.got.decision || 'exit ' + p.got.exit}`), verdict: `${probes.filter(p => p.ok).length}/${probes.length} 기대대로` });

  const flat = Object.values(suites).flatMap(s => Object.entries(s).filter(([, v]) => v && typeof v.fail === 'number'));
  rec('repoTests', { repo: REPO, suites, filesFailing: flat.filter(([, v]) => v.fail > 0 || v.status !== 0).map(([k]) => k), totals: flat.reduce((a, [, v]) => ({ pass: a.pass + v.pass, fail: a.fail + v.fail }), { pass: 0, fail: 0 }), gitattributes: exists(path.join(REPO, '.gitattributes')), crlfInRepoSkill: safe(() => fs.readFileSync(path.join(REPO, 'CLAUDE.md')).includes(Buffer.from('\r\n'))) });
}

// ─── 마무리 ────────────────────────────────────────────────────────────
R.finishedAt = new Date().toISOString();
fs.writeFileSync(OUT, JSON.stringify(R, null, 2));
if (!KEEP) safe(() => fs.rmSync(WORK, { recursive: true, force: true }));
log('결과 저장:', OUT);
log('요약:');
for (const [k, v] of Object.entries(R.checks)) if (v && v.verdict) log('  -', k, ':', v.verdict);
