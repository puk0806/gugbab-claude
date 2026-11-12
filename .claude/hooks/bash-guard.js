#!/usr/bin/env node
/**
 * bash-guard.js
 * Claude Code PreToolUse + PermissionRequest Hook
 *
 * 목적: Bash 명령어 안전 관리
 *
 * PreToolUse:
 *   - 위험한 Bash 패턴 → deny (정규식 + classifyShell 명령 단위 분류)
 *   - 사용자 확인 대상(commit/push/publish, 프로젝트 밖 rm, sudo, dd …) → ask
 *   - git reset --hard: 미푸시 커밋·커밋 안 한 작업만 지우면 자동, 푸시된 커밋을 지우면 deny (2026-10-06)
 *   - 정적 판정 불가(동적 명령명·파싱 실패) → null (allow 하지 않음)
 *   - 안전한 cd+git / heredoc / compound / script 패턴 → allow (Claude Code 하드코딩 휴리스틱 우회)
 *   - 그 외 → null (다른 훅에 위임)
 *   ※ 파이프·체인·$()·서브셸·bash -c·env/command 전치·git -C 등 우회 형태도 일반 형태와 동일 판정
 *
 * PermissionRequest:
 *   - PreToolUse 와 같은 분류기로 위험(deny/ask)·판정 불가 → null (사용자 확인)
 *   - 그 외 Bash → allow (읽기 전용·일반 개발 명령 프롬프트 마찰 제거)
 *   - Bash 외 도구 → null (auto-approve.js에 위임)
 *
 * 안전 패턴 자동 허용 — 경로 경계는 동적으로 감지:
 *   1. stdin JSON의 cwd 필드 (Claude Code 표준)
 *   2. CLAUDE_PROJECT_DIR 환경변수
 *   3. process.cwd()
 *   위 cwd에서 .git / .claude 상향 탐색해 프로젝트 루트 확정,
 *   추가 경계는 CLAUDE_BASH_GUARD_ALLOWED_DIRS 환경변수(맥 콜론·윈도우 세미콜론 구분)와
 *   .claude/settings.json 의 permissions.additionalDirectories로 지정 가능.
 */

const readline = require('readline')
const path = require('path')
const fs = require('fs')
const os = require('os')
// 윈도우 경로 헬퍼 (2026-10-20 윈도우 2단계) — 윈도우 분기는 모두 IS_WIN 안에서만. 맥 판정은 기존 코드 그대로
const W = require('./lib/winpath')
const IS_WIN = W.IS_WIN

// 보호 파일(verification.md / SKILL.md / memory/)은 Bash *쓰기 연산*만 차단
// 읽기 전용 사용(grep / diff / cat FILE / sed -n / awk 출력)은 허용 — 오탐 방지
// 쓰기 연산 판정: sed -i / perl -i / awk -i inplace / 리다이렉트(> >>) / tee
function buildProtectedWritePatterns() {
  const targets = [
    { re: 'verification\\.md', label: 'verification.md', hint: ' (verification-guard 훅 통과 필수)' },
    { re: 'SKILL\\.md', label: 'SKILL.md', hint: '' },
    { re: '\\bmemory\\/', label: 'memory/ 파일', hint: ' (memory-sync 자동 동기화)' },
  ]
  const patterns = []
  for (const { re, label, hint } of targets) {
    const reason = `${label}은(는) Bash 쓰기 연산으로 수정할 수 없습니다. Write/Edit 도구를 사용하세요${hint}. (읽기 전용 grep/diff/cat은 허용)`
    // in-place 편집: sed -i / perl -i (같은 statement 안에서만 매칭)
    patterns.push({ pattern: new RegExp(`\\bsed\\b[^|;&\\n]*\\s-[a-zA-Z]*i[a-zA-Z]*\\b[^|;&\\n]*${re}`), reason })
    patterns.push({ pattern: new RegExp(`\\bperl\\b[^|;&\\n]*\\s-[a-zA-Z]*i[^|;&\\n]*${re}`), reason })
    patterns.push({ pattern: new RegExp(`\\bawk\\b[^|;&\\n]*-i\\s*inplace[^|;&\\n]*${re}`), reason })
    // 리다이렉트로 덮어쓰기·이어쓰기: echo/cat/printf/sed/awk ... > FILE
    patterns.push({ pattern: new RegExp(`>>?\\s*\\S*${re}`), reason })
    // tee로 쓰기
    patterns.push({ pattern: new RegExp(`\\btee\\b\\s+(?:-a\\s+)?\\S*${re}`), reason })
  }
  return patterns
}

const DENY_PATTERNS = [
  ...buildProtectedWritePatterns(),
  // 위험 명령 패턴
  { pattern: /git\s+push\s+(--force|-f)\b/, reason: 'force push는 히스토리를 덮어씁니다. 직접 실행하세요.' },
  // (구 `git\s+push\s+.*-f\b` 는 `git push origin feature-f` 를 오탐해 제거 — 뒤쪽 -f·+refspec·전치 옵션은 classifyShell 이 토큰 단위로 판정)
  { pattern: /rm\s+-rf\s+\/(bin|boot|dev|etc|lib|lib64|proc|root|sbin|sys|usr|var)(\/|$|\s|$)/, reason: '시스템 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\/$/, reason: '루트 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\/\s/, reason: '루트 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\.\.\//, reason: '상위 디렉토리 삭제는 차단됩니다.' },
  // 구 careful-with-judge.js에서 흡수한 고위험 rm 패턴
  { pattern: /rm\s+-[a-zA-Z]*rf?[a-zA-Z]*\s+(~|\$HOME)\/?\s*$/, reason: '홈 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-[a-zA-Z]*rf?[a-zA-Z]*\s+\.\s*$/, reason: '현재 디렉토리 전체 삭제는 차단됩니다.' },
  { pattern: /rm\s+-[a-zA-Z]*rf?[a-zA-Z]*\s+\S*\.(git|claude|ssh)\/?\s*$/, reason: '.git / .claude / .ssh 디렉토리 삭제는 차단됩니다.' },
  { pattern: /curl\s+.*\|\s*(ba)?sh/, reason: '원격 스크립트 실행(curl|bash)은 차단됩니다.' },
  { pattern: /wget\s+.*\|\s*(ba)?sh/, reason: '원격 스크립트 실행(wget|bash)은 차단됩니다.' },
  { pattern: /chmod\s+777/, reason: '777 권한 설정은 보안 위험입니다.' },
  // (구 `git reset --hard HEAD~[2-9]` 정적 차단은 2026-10-06 제거 — 푸시 여부를 git 으로 확인하는 classifyGit 판정으로 대체)
  { pattern: /:\s*\(\)\s*\{.*:\|:.*\}/, reason: 'Fork bomb 패턴 감지. 차단합니다.' },
]

// 안전 패턴 자동 허용 — heredoc 출력에 허용되는 비실행 확장자
const SAFE_FILE_EXT = /\.(?:tsx?|jsx?|json|md|txt|css|scss|sass|less|html?|ya?ml|toml|env\.sample|gitignore|test\.\w+|spec\.\w+|d\.ts)$/i

// 안전 패턴 자동 허용 — heredoc 출력에 절대 쓰면 안 되는 경로
const HEREDOC_FORBIDDEN_PATHS = [
  /(?:^|\/)\.zshrc$/,
  /(?:^|\/)\.bashrc$/,
  /(?:^|\/)\.bash_profile$/,
  /(?:^|\/)\.profile$/,
  /(?:^|\/)\.envrc$/,
  /\/\.ssh\//,
  /(?:^|\/)crontab$/,
  /(?:^|\/)sudoers$/,
  /(?:^|\/)hosts$/,
  /(?:^|\/)\.npmrc$/,
  /\/\.git\/hooks\//,
  /\/etc\//,
]

// brace expansion 자동 허용 — 첫 단어가 이 목록에 있는 read-only 명령일 때만 허용
const SAFE_READONLY_COMMANDS = new Set([
  // 파일 시스템 조회
  'ls', 'll', 'find', 'stat', 'file', 'tree', 'pwd', 'realpath', 'readlink',
  // 컨텐츠 읽기
  'cat', 'head', 'tail', 'less', 'more',
  // 검색
  'grep', 'egrep', 'fgrep', 'rg', 'ack',
  // 카운팅·측정
  'wc', 'du', 'df',
  // 비교
  'diff', 'cmp',
  // 텍스트 처리 (단, sed -i 는 별도 차단)
  'sort', 'uniq', 'cut', 'tr', 'awk', 'sed',
  // 출력
  'echo', 'printf',
  // 메타
  'which', 'type', 'whoami', 'date', 'hostname', 'env',
  // xargs는 별도 처리 (다음 단어가 안전 명령일 때만 허용)
  'xargs',
])

// cd+git 컴파운드 안에서 위험 신호로 보는 패턴 (있으면 자동 허용 거부)
const CD_COMPOUND_DANGER = [
  /\b(?:bash|sh|zsh|eval|source|exec)\s+/,
  /curl\s.*\|\s*(?:ba)?sh\b/,
  /wget\s.*\|\s*(?:ba)?sh\b/,
  /\bgit\s+(?:push|commit|reset\s+--hard|clean\s+-[fdx]+|checkout\b)/,
  /\brm\s+-rf?\b/,
  /\bchmod\s+\+x\b/,
  />\s*~\/\.\w/,           // 홈 디렉토리 dotfile에 리다이렉트
  />\s*\/etc\//,            // /etc 리다이렉트
]

function existsSync(p) {
  try { fs.accessSync(p); return true } catch { return false }
}

// cwd에서 위로 올라가며 .git 또는 .claude 디렉토리를 찾아 프로젝트 루트로 사용
function findProjectRoot(startCwd) {
  if (!startCwd || typeof startCwd !== 'string') return null
  let dir
  try { dir = path.resolve(startCwd) } catch { return null }
  const root = path.parse(dir).root
  while (dir && dir !== root) {
    if (existsSync(path.join(dir, '.git')) || existsSync(path.join(dir, '.claude'))) {
      return dir
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

// 허용 경계 디렉토리 목록 — 우선순위: stdin.cwd 기반 프로젝트 루트 + env var + settings.json
function getAllowedDirs(stdinCwd) {
  const dirs = new Set()

  const cwd = stdinCwd || process.env.CLAUDE_PROJECT_DIR || process.cwd()
  const projectRoot = findProjectRoot(cwd) || cwd
  if (projectRoot) {
    try { dirs.add(path.resolve(projectRoot)) } catch { /* ignore */ }
  }

  if (process.env.CLAUDE_PROJECT_DIR) {
    try { dirs.add(path.resolve(nativeDir(process.env.CLAUDE_PROJECT_DIR))) } catch { /* ignore */ }
  }

  // 구분자: 맥 `:` / 윈도우 `;`(path.delimiter) — 윈도우에서 `:` 로 나누면 `C:` 드라이브가 잘려 허용 폴더가 깨진다
  const envExtra = process.env.CLAUDE_BASH_GUARD_ALLOWED_DIRS
  if (envExtra) {
    envExtra.split(IS_WIN ? ';' : ':').filter(Boolean).forEach(d => {
      try { dirs.add(path.resolve(nativeDir(d))) } catch { /* ignore */ }
    })
  }

  if (projectRoot) {
    try {
      const settingsPath = path.join(projectRoot, '.claude', 'settings.json')
      if (existsSync(settingsPath)) {
        const raw = fs.readFileSync(settingsPath, 'utf8')
        const settings = JSON.parse(raw)
        const extra = settings?.permissions?.additionalDirectories
        if (Array.isArray(extra)) {
          extra.forEach(d => {
            if (typeof d === 'string') {
              try { dirs.add(path.resolve(d)) } catch { /* ignore */ }
            }
          })
        }
      }
    } catch { /* ignore */ }
  }

  // 래퍼(gugbab-claude) 실행이면 설정 폴더 settings.json 의 additionalDirectories 도 (절대 경로만)
  const cfgDir = process.env.CLAUDE_CONFIG_DIR
  if (cfgDir && path.isAbsolute(cfgDir)) {
    try {
      const extra = JSON.parse(fs.readFileSync(path.join(cfgDir, 'settings.json'), 'utf8'))?.permissions?.additionalDirectories
      if (Array.isArray(extra)) extra.forEach(d => { if (typeof d === 'string' && path.isAbsolute(d)) dirs.add(path.resolve(d)) })
    } catch { /* 없음·깨짐 → 무시 */ }
  }

  return [...dirs]
}

// 윈도우: MSYS `/c/x` 로 온 허용 폴더를 `C:/x` 로 (path.resolve 가 `C:\c\x` 로 잘못 만들지 않게). 맥은 그대로
function nativeDir(d) { return IS_WIN ? W.msysToWin(W.toSlash(d, true), true) : d }

function isUnderAllowed(absPath, allowedDirs) {
  if (IS_WIN) {
    // 윈도우: `..` 를 먼저 풀고(winCanon) 대소문자·구분자 무시로 경로 단위 비교 — 접두만 같은 형제(C:/proj-evil)는 밖
    const c = typeof absPath === 'string' ? winCanon(absPath) : null
    if (!c) return false
    return (allowedDirs || []).some(d => { const dc = winCanon(d); return !!dc && W.isUnder(c, dc, true) })
  }
  if (!absPath || !absPath.startsWith('/')) return false
  const norm = path.resolve(absPath)
  return allowedDirs.some(d => norm === d || norm.startsWith(d + path.sep))
}

function isUnderTempDir(absPath) {
  if (IS_WIN) {
    // 윈도우: 사용자 임시 폴더(os.tmpdir() = Git Bash /tmp) 아래만 — 임시 폴더 자체는 아래가 아님(맥 `/tmp/` 접두와 같은 기준)
    const c = typeof absPath === 'string' ? winCanon(absPath) : null
    return !!c && winTmpDirs().some(t => !W.samePath(c, t, true) && W.isUnder(c, t, true))
  }
  if (!absPath || !absPath.startsWith('/')) return false
  const norm = path.resolve(absPath)
  return norm.startsWith('/tmp/')
    || norm.startsWith('/private/tmp/')
    || norm.startsWith('/var/folders/')
    || norm.startsWith('/private/var/folders/')
}

// ── 윈도우 경로 판정 (2026-10-20 윈도우 2단계) ─────────────────────────────
// Git Bash 명령 안 경로는 `C:/x`·`/c/x`·따옴표 속 `C:\x`·`~`·`$HOME`(=C:\Users\x) 로 온다 (PoC 실측).
// 아래 함수는 윈도우에서만 판정에 쓰인다 (맥은 호출되지 않거나 기존 결과와 같은 값을 돌려준다).

// 비교용 절대 경로 — `\`→`/`, Git Bash `/tmp`→사용자 임시 폴더, MSYS `/c/x`→`C:/x`, `..` 풀기, 드라이브 대문자.
// `C:/x`·UNC(`//srv/share`) 외의 `/usr` 같은 경로는 Git 설치 폴더 기준 POSIX 경로로 남긴다. 상대·드라이브 상대(`C:x`) → null
// 플랫폼과 무관한 순수 함수라 맥에서도 단위 시험된다
function winCanon(p) {
  if (typeof p !== 'string' || !p || p.includes('\0')) return null
  let s = p.replace(/\\/g, '/')
  s = s.replace(/^\/\/[?.]\/(?=[A-Za-z]:\/)/, '').replace(/^\/\/[?.]\/UNC\//i, '//') // \\?\C:\x · \\?\UNC\srv\share
  if (/^\/tmp(?:\/|$)/.test(s)) s = os.tmpdir().replace(/\\/g, '/').replace(/\/+$/, '') + s.slice(4)
  s = W.msysToWin(s, true)
  let r
  const srv = /^\/\/([^/]+)\/*$/.exec(s) // `//srv` 서버 루트 — win32.resolve 는 현재 드라이브 아래로 잘못 푼다
  if (srv) return '//' + srv[1]
  if (/^[A-Za-z]:\//.test(s) || /^\/\/[^/]/.test(s)) {
    try { r = path.win32.resolve(s).replace(/\\/g, '/') } catch { return null }
  } else if (s.startsWith('/')) r = path.posix.normalize(s)
  else return null
  if (/^[a-z]:/.test(r)) r = r[0].toUpperCase() + r.slice(1)
  if (r.length > 1 && !/^[A-Za-z]:\/$/.test(r)) r = r.replace(/\/+$/, '') || '/'
  return r
}

// 드라이브 루트(`C:/`)·UNC 서버·공유 루트(`//srv/share`)
function isWinRoot(r) { return typeof r === 'string' && (/^[A-Za-z]:\/$/.test(r) || /^\/\/[^/]+(?:\/[^/]+)?$/.test(r)) }

let _winTmp = null
function winTmpDirs() {
  if (_winTmp) return _winTmp
  const t = os.tmpdir()
  const all = [t]
  try { all.push(fs.realpathSync(t)) } catch { /* 없음 */ }
  try { all.push(fs.realpathSync.native(t)) } catch { /* 없음 */ } // 8.3 짧은 이름(LF_USE~1) 풀기
  return (_winTmp = [...new Set(all.map(winCanon).filter(Boolean))])
}

// 윈도우 시스템 폴더 — 그 아래 삭제는 맥 SYSTEM_DIRS 와 같은 기준(재귀 deny, 아니면 ask)
let _winSys = null
function winSystemDirs() {
  if (_winSys) return _winSys
  const e = process.env
  const list = [e.SystemRoot, e.windir, e.ProgramFiles, e['ProgramFiles(x86)'], e.ProgramW6432, e.ProgramData,
    'C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)', 'C:\\ProgramData']
  return (_winSys = [...new Set(list.filter(Boolean).map(winCanon).filter(Boolean))])
}
// 그 자체(또는 상위)를 지우면 deny — 사용자 폴더 모음(C:\Users). 그 아래는 다른 사용자 홈·내 프로젝트라 하위는 막지 않는다
function winUsersDirs() {
  const out = ['C:\\Users']
  if (HOME_DIR) out.push(path.win32.dirname(HOME_DIR))
  return [...new Set(out.map(winCanon).filter(Boolean))]
}

// 윈도우에서 쓰면 로그인·셸 시작 시 실행되는 위치 — PowerShell 프로필·시작프로그램 (대소문자 무시)
const WIN_FORBIDDEN_WRITE = [
  /\/documents\/(?:windows)?powershell(?:\/|$)/i,
  /\/start menu\/programs\/startup(?:\/|$)/i,
]
function winForbiddenWrite(p) {
  const s = String(p).replace(/\\/g, '/')
  return WIN_FORBIDDEN_WRITE.some(re => re.test(s)) || HEREDOC_FORBIDDEN_PATHS.some(re => new RegExp(re.source, 'i').test(s))
}

// 안전 패턴(문자열 휴리스틱)의 "절대 경로" — 맥은 기존 `/` 시작 그대로.
// 윈도우는 `C:/x`·`/c/x`·`/tmp/x` 를 인정하되 `\` 가 섞인 경로는 거부: 따옴표 밖 `\` 는 bash 가 지워 다른 경로(C:Usersx)가 된다
function shAbs(p) {
  if (typeof p !== 'string' || !p) return false
  if (!IS_WIN) return p.startsWith('/')
  return !p.includes('\\') && W.isAbs(p, true)
}
// 경로 검사를 반드시 거쳐야 하는 인자인가 — 맥: `/` 시작(기존). 윈도우: + 드라이브·`\`·`~` 시작
function shLooksAbs(p) {
  if (typeof p !== 'string' || !p) return false
  if (!IS_WIN) return p.startsWith('/')
  return p.startsWith('/') || /^[A-Za-z]:/.test(p) || p.startsWith('\\') || p.startsWith('~')
}
function shSafeAbs(p, allowedDirs) { return shAbs(p) && (isUnderAllowed(p, allowedDirs) || isUnderTempDir(p)) }

// 윈도우 전용: 문장 속 모든 드라이브·MSYS 드라이브·UNC·`\`·`~` 경로가 허용·임시 폴더 안이고 쓰기 금지 위치가 아닌가.
// 경로 환경변수($HOME·$APPDATA …)·리다이렉트 대상 변수는 해석 불가라 거부. 따옴표 안 텍스트도 검사(보수적 — 자동 허용만 줄어든다)
const WIN_PATH_VAR_RE = /\$\{?(?:HOME|USERPROFILE|APPDATA|LOCALAPPDATA|PROGRAMDATA|PROGRAMFILES|SYSTEMROOT|WINDIR|TEMP|TMP|PUBLIC|ONEDRIVE|HOMEDRIVE|HOMEPATH)(?![A-Za-z0-9_])/i
function winPathsSafe(s, allowedDirs) {
  if (!IS_WIN) return true
  if (typeof s !== 'string') return false
  if (WIN_PATH_VAR_RE.test(s)) return false
  if (/>\s*["']?\$/.test(s)) return false
  if (/(?:^|[\s=>"'(])\/\/[^\s/]/.test(s)) return false // //srv/share (UNC) · cmd //c
  const B = '[^\\s"\'`|;&<>()]*'
  const toks = []
  for (const m of s.matchAll(new RegExp(`(?<![A-Za-z0-9_])[A-Za-z]:[\\\\/]${B}`, 'g'))) toks.push(m[0])
  for (const m of s.matchAll(new RegExp(`(?:^|[\\s=>"'(])(\\\\${B})`, 'g'))) toks.push(m[1])
  for (const m of s.matchAll(new RegExp(`(?:^|[\\s=>"'(])(\\/[A-Za-z](?:\\/${B})?)(?=[\\s"'\`|;&<>()]|$)`, 'g'))) toks.push(m[1])
  const pushTilde = (t) => {
    if (!HOME_DIR || !(t === '~' || t.startsWith('~/'))) return false
    toks.push(HOME_DIR.replace(/\\/g, '/') + t.slice(1))
    return true
  }
  for (const m of s.matchAll(new RegExp(`(?:^|[\\s=>"'(])(~${B})`, 'g'))) if (!pushTilde(m[1])) return false
  // 따옴표로 감싼 공백 경로("C:/…/Start Menu/Programs/Startup/x.js")는 위 토큰이 공백에서 끊기므로 통째로 한 번 더
  for (const m of s.matchAll(/(["'])([^"']*)\1/g)) {
    const q = m[2]
    if (/^~(?:\/|$)/.test(q)) { if (!pushTilde(q)) return false } else if (/^(?:[A-Za-z]:[\\/]|\/[A-Za-z](?:\/|$)|\\)/.test(q)) toks.push(q)
  }
  for (const t of toks) {
    if (winForbiddenWrite(t)) return false
    if (!shSafeAbs(t, allowedDirs)) return false
  }
  return true
}

// 안전 패턴: cd <abs path under allowed> && <safe rest>
// → Claude Code의 "cd before git" 경고 우회
function isCdGitSafe(cmd, allowedDirs) {
  if (hasNonRmRisk(cmd, allowedDirs)) return false
  const trimmed = cmd.trim()
  // 첫 줄에서 cd 컴파운드 추출
  const firstLine = trimmed.split('\n')[0]
  const m = firstLine.match(/^cd\s+(\S+)\s*&&\s*(.+)$/)
  if (!m) return false

  const target = m[1]
  const rest = m[2]

  if (!shAbs(target)) return false
  if (!isUnderAllowed(target, allowedDirs)) return false

  // 컴파운드 나머지에 위험 신호가 있으면 거부
  if (CD_COMPOUND_DANGER.some(p => p.test(rest))) return false
  if (!winPathsSafe(rest, allowedDirs)) return false // 윈도우만 — 드라이브·~ 경로가 허용 폴더 밖이면 거부

  // 컴파운드 뒤에 추가 줄이 있으면 ( cmd 가 멀티라인 ) 거부 — 의심스러움
  if (trimmed.split('\n').length > 1) return false

  return true
}

// 안전 패턴: cat > <safe path> << 'EOF' (또는 \EOF) ... EOF
// → Claude Code의 "brace+quote obfuscation" 경고 우회
function isHeredocSafe(cmd, allowedDirs) {
  if (hasNonRmRisk(cmd, allowedDirs)) return false
  const firstLine = cmd.split('\n')[0]
  // cat/tee > FILE << 'DELIM'  또는  << \DELIM 만 허용 (확장 차단되는 형태)
  const m = firstLine.match(
    /^\s*(?:cat|tee)\s+>>?\s*(\S+)\s+<<-?\s*(?:'([A-Za-z_][A-Za-z0-9_]*)'|\\([A-Za-z_][A-Za-z0-9_]*))/,
  )
  if (!m) return false

  const outPath = m[1]
  if (!shAbs(outPath)) return false  // 절대경로만 (윈도우: C:/x·/c/x·/tmp/x, `\` 섞이면 거부)

  // 출력 경로 안전성: 허용 디렉토리 또는 임시 디렉토리
  if (!isUnderAllowed(outPath, allowedDirs) && !isUnderTempDir(outPath)) return false

  // 위험 경로(쉘 시작 파일, ssh, git hooks 등) 차단
  if (HEREDOC_FORBIDDEN_PATHS.some(p => p.test(outPath))) return false
  if (IS_WIN) {
    // 윈도우: 대소문자 무시 + PowerShell 프로필·시작프로그램, 본문 뒤 후속 명령의 경로도 허용 폴더 안이어야 함
    if (winForbiddenWrite(winCanon(outPath) || outPath)) return false
    const delim = m[2] || m[3]
    const lines = cmd.split('\n')
    const endIdx = lines.findIndex((l, i) => i > 0 && l.replace(/^\t+/, '') === delim)
    const after = endIdx >= 0 ? lines.slice(endIdx + 1).join('\n') : ''
    if (!winPathsSafe(firstLine, allowedDirs) || !winPathsSafe(after, allowedDirs)) return false
  }

  // 비실행 확장자만
  if (!SAFE_FILE_EXT.test(outPath)) return false

  // 후속 실행 차단:
  // - chmod +x: 파일에 실행 비트 부여는 스크립트 의도, 차단
  // - eval / source / `.` cmd: 동적 코드 평가, 차단 (단순 . 은 false positive 방지)
  // - curl|bash: 원격 스크립트 실행 (DENY에도 있지만 한 번 더)
  // 단, node/python 같은 인터프리터로 heredoc 결과 파일을 직접 실행하는 것은
  // Bash(node*) 등이 이미 permissions.allow 에 있어 동등 공격면이 존재하므로 추가 차단 안 함.
  // 비-셸 확장자(.tsx/.ts/.json 등)만 허용하는 것으로 충분히 좁혀져 있음.
  if (/\bchmod\s+\+x\b/.test(cmd)) return false
  if (/\b(?:eval|source|\.)\s+\S+/.test(cmd) && /\beval\s|\bsource\s|^\s*\.\s/.test(cmd)) return false
  if (/curl\s.*\|\s*(?:ba)?sh\b/.test(cmd)) return false

  return true
}

// 컴파운드 statement 자동 허용 시 첫 단어 화이트리스트
const COMPOUND_SAFE_COMMANDS = new Set([
  // 파일 조작
  'cp', 'mv', 'rm', 'mkdir', 'touch', 'ln',
  // 읽기·검색
  'ls', 'll', 'cat', 'head', 'tail', 'less', 'more',
  'find', 'grep', 'egrep', 'fgrep', 'rg', 'ack',
  'wc', 'du', 'df', 'stat', 'file', 'tree',
  'diff', 'cmp', 'sort', 'uniq', 'cut', 'tr', 'awk', 'sed', 'tee',
  // 출력·메타
  'echo', 'printf', 'pwd', 'which', 'whoami', 'date', 'hostname', 'env', 'realpath',
  // 빌드/테스트 (각 도구의 read-only/일반 사용은 Bash(pnpm*) 등으로 이미 허용됨)
  'pnpm', 'npm', 'yarn', 'npx', 'bunx', 'node', 'tsc', 'eslint', 'biome', 'prettier',
  'vitest', 'jest', 'mocha',
  'cargo', 'rustc',
  'java', 'javac', 'mvn', 'gradle', './gradlew',
  // git (위험 서브커맨드는 별도 차단)
  'git',
  // xargs (다음 명령도 검사)
  'xargs',
])

// rm 인자가 "그대로 읽히는" 경로인가 — 홈(~)·변수·따옴표·치환·상위(..) 는 자동 허용 대상에서 제외
function isPlainRelativeRmArg(a) {
  if (/[~$"'`\\]/.test(a)) return false
  if (/(?:^|\/)\.\.(?:\/|$)/.test(a)) return false
  return true
}

function isStatementSafeForCompound(stmt, allowedDirs) {
  const trimmed = stmt.trim()
  if (!trimmed) return false

  // 첫 단어 안전성
  const firstWord = (trimmed.match(/^(\S+)/) || [])[1]
  if (!firstWord || /[{}'"`\\$]/.test(firstWord)) return false
  if (!COMPOUND_SAFE_COMMANDS.has(firstWord)) return false

  // git: 위험 서브커맨드 차단
  if (firstWord === 'git' && /\bgit\s+(?:push|commit|reset\s+--hard|clean\s+-[fdx]|checkout\b)/.test(trimmed)) {
    return false
  }

  // rm: 시스템·dotfile·forbidden 차단
  if (firstWord === 'rm') {
    if (/^rm\s+(?:-\S+\s+)*\/(?:bin|boot|dev|etc|lib|lib64|proc|root|sbin|sys|usr|var)\b/.test(trimmed)) return false
    if (/^rm\s+(?:-\S+\s+)*\/$/.test(trimmed)) return false
    if (/\.zshrc\b|\.bashrc\b|\.bash_profile\b|\.profile\b|\.envrc\b|\/\.ssh\/|\/\.git\/hooks\//.test(trimmed)) return false
    if (/\s\.\.\//.test(trimmed)) return false  // 상위 디렉토리
  }

  // chmod +x 차단
  if (firstWord === 'chmod' && /\+x\b/.test(trimmed)) return false

  // 위험한 redirect (>file)
  if (/>\s*\/(?:etc|usr|bin|sbin|sys|proc|dev|root)\//.test(trimmed)) return false
  if (/>\s*\S*\.zshrc\b/.test(trimmed)) return false
  if (/>\s*\S*\.bashrc\b/.test(trimmed)) return false
  if (/>\s*\S*\/\.ssh\//.test(trimmed)) return false

  // cp/mv 대상 경로 안전성 — 마지막 인자가 절대경로면 검증
  if (firstWord === 'cp' || firstWord === 'mv') {
    const args = trimmed.split(/\s+/).slice(1).filter(a => !a.startsWith('-'))
    const dest = args[args.length - 1]
    if (dest && shLooksAbs(dest)) {
      if (!shSafeAbs(dest, allowedDirs)) return false
    }
  }

  // rm 대상 절대경로도 안전 영역만
  if (firstWord === 'rm') {
    const args = trimmed.split(/\s+/).slice(1).filter(a => !a.startsWith('-'))
    for (const a of args) {
      if (!isPlainRelativeRmArg(a)) return false // ~ · $VAR · 따옴표 · .. → 경로 해석 불가/밖 가능
      if (shLooksAbs(a)) {
        if (!shSafeAbs(a, allowedDirs)) return false
      }
    }
  }

  // 윈도우: 리다이렉트·인자의 드라이브·~ 경로도 허용 폴더 안이어야 함 (맥 판정엔 영향 없음)
  if (!winPathsSafe(trimmed, allowedDirs)) return false

  // xargs 다음 명령은 read-only 화이트리스트만 허용
  // (xargs rm/mv/cp 같이 여러 파일을 한 번에 변경하는 패턴은 위험)
  if (firstWord === 'xargs') {
    const m = trimmed.match(/^xargs(?:\s+-\S+)*\s+(\S+)/)
    const nextCmd = m ? m[1] : null
    if (!nextCmd) return false
    if (/[{}'"\\]/.test(nextCmd)) return false
    if (!SAFE_READONLY_COMMANDS.has(nextCmd)) return false
    if (nextCmd === 'xargs') return false
  }

  return true
}

// 멀티라인 스크립트에서 추가로 허용하는 명령들
const SCRIPT_EXTRA_SAFE = new Set([
  'cd',
  'sleep', 'wait', 'kill',
  'export', 'unset',
  'curl', 'wget',  // URL은 별도 localhost 검증
  'python', 'python3',
  'jq', 'yq',
  'basename', 'dirname',
  'true', 'false', 'test', '[',
])

const SCRIPT_ALL_SAFE = new Set([...COMPOUND_SAFE_COMMANDS, ...SCRIPT_EXTRA_SAFE])

// 알려진 로컬 개발 서버 패턴 (백그라운드 실행 허용 대상)
const LOCAL_SERVER_PATTERNS = [
  /^python3?\s+(?:-u\s+)?-m\s+http\.server\b/,
  /^npx\s+(?:-y\s+)?(?:serve|http-server|live-server|vite|next\s+dev|wrangler\s+dev)\b/,
  /^(?:pnpm|npm|yarn)\s+(?:run\s+)?(?:dev|start|preview|serve|watch)\b/,
  /^node\s+(?:--\S+\s+)*\S*server\S*\.js\b/,
  /^vite(?:\s+(?:dev|preview))?\b/,
]

function isLocalhostUrl(url) {
  if (!url) return false
  const cleaned = url.replace(/^["']|["']$/g, '')
  return /^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?(?:[/?#]|$)/.test(cleaned)
}

function isReadOnlyPipeChain(stmt, allowedDirs, safeVars) {
  const stages = quoteAwareSplit(stmt, '|')
  for (const stage of stages) {
    const fw = (stage.match(/^(\S+)/) || [])[1]
    if (!fw || /[{}'"`\\$]/.test(fw)) return false
    if (!SAFE_READONLY_COMMANDS.has(fw) && fw !== 'basename' && fw !== 'dirname') return false
    if (!validateLineReferences(stage, allowedDirs, safeVars)) return false
  }
  return true
}

// $VAR 가 모두 safeVars 에 있는지 + 절대경로가 모두 안전 영역인지 + URL 이 localhost 인지
function validateLineReferences(line, allowedDirs, safeVars) {
  // 단일따옴표 영역 제거 (확장 안 됨)
  const noSingleQuotes = removeSingleQuotedSegments(line)

  // $VAR 검증 — 더블쿼트 안에서도 확장되므로 noSingleQuotes 에서 검색
  const varMatches = [...noSingleQuotes.matchAll(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g)]
  for (const v of varMatches) {
    const name = v[1]
    if (!safeVars.has(name)) return false
  }
  // $1, $@, $#, $? 등 positional/special 거부
  if (/\$[0-9@#\?\*]/.test(noSingleQuotes)) return false
  // $! BG PID — 별도 처리 (할당 시점에서만 허용)
  if (/\$!/.test(noSingleQuotes)) return false

  // URL 검증 — 따옴표 안/밖 모두 검사 (URL은 보통 따옴표로 감싸짐)
  const urlMatches = noSingleQuotes.match(/https?:\/\/[^\s"'<>|]+/g) || []
  for (const u of urlMatches) {
    if (!isLocalhostUrl(u)) return false
  }

  // 절대경로 검증 — 더블쿼트 안의 텍스트는 제외 (echo 등의 인자에 들어간 경로는 텍스트일 뿐)
  // 명령에 직접 인자로 전달된 경로(따옴표 밖)만 체크
  let noQuotes = noSingleQuotes.replace(/"[^"]*"/g, '""')
  // 윈도우: `C:/x/y` 의 뒷부분(`/x/y`)을 POSIX 경로로 오인하지 않게 드라이브 경로는 빼고, 아래 winPathsSafe 가 따로 검사
  if (IS_WIN) noQuotes = noQuotes.replace(/(?<![A-Za-z0-9_])[A-Za-z]:\/[^\s"'`|;&<>()]*/g, ' ')
  const pathMatches = noQuotes.match(/(?<![:/])\/(?:[a-zA-Z0-9._-]+\/?)+/g) || []
  for (const p of pathMatches) {
    if (/^\/dev\/(?:null|stdin|stdout|stderr)$/.test(p)) continue
    // URL 의 /path 부분일 수 있음 (URL은 따옴표 밖에 직접 쓰일 때)
    if (urlMatches.some(u => u.includes(p))) continue
    if (isUnderTempDir(p)) continue
    if (isUnderAllowed(p, allowedDirs)) continue
    return false
  }

  // 윈도우: `C:/x`(앞 `:` 때문에 위 정규식이 놓침)·~·`\` 경로도 검사 (맥은 항상 true)
  if (!winPathsSafe(line, allowedDirs)) return false

  return true
}

function removeSingleQuotedSegments(line) {
  // '...' 영역을 빈 문자열로 (이스케이프된 ' 는 sh 에서 일반적으로 안 됨)
  return line.replace(/'[^']*'/g, "''")
}

// quote-aware split — 따옴표 안에 있는 구분자는 무시
function quoteAwareSplit(line, sep) {
  const parts = []
  let buf = ''
  let inSingle = false, inDouble = false
  let i = 0
  while (i < line.length) {
    const ch = line[i]
    if (ch === "'" && !inDouble) { inSingle = !inSingle; buf += ch; i++; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; buf += ch; i++; continue }
    if (!inSingle && !inDouble) {
      // 구분자 매칭
      if (sep === '|') {
        // | 분리 (단, ||는 제외)
        if (ch === '|' && line[i + 1] !== '|' && line[i - 1] !== '|') {
          parts.push(buf.trim())
          buf = ''
          i++
          continue
        }
      } else if (sep === 'compound') {
        // && 또는 || 분리
        if ((ch === '&' && line[i + 1] === '&') || (ch === '|' && line[i + 1] === '|')) {
          parts.push(buf.trim())
          buf = ''
          i += 2
          continue
        }
      }
    }
    buf += ch
    i++
  }
  if (buf.trim()) parts.push(buf.trim())
  return parts.filter(Boolean)
}

function extractCommandSubstitutions(line) {
  // 중첩 미지원 (간단한 $(cmd) 만)
  const matches = []
  const re = /\$\(([^()]+)\)/g
  let m
  while ((m = re.exec(line)) !== null) matches.push(m[1])
  return matches
}

// 안전 패턴: 멀티라인 셸 스크립트 (디버그·빌드 verify·로컬 서버 테스트 등)
// 변수 추적 + $() read-only 검증 + localhost URL + BG 서버 + kill 추적
function isShellScriptSafe(cmd, allowedDirs) {
  const trimmed = cmd.trim()
  if (!trimmed) return false
  if (hasNonRmRisk(trimmed, allowedDirs)) return false

  // 다른 핸들러 영역 양보 — heredoc 은 별도, cd-only 도 별도
  if (/<<-?\s*['\\]?[A-Za-z_]/.test(trimmed)) return false
  if (/`/.test(trimmed)) return false  // 백틱 차단 (정확한 추출 어려움)

  // 멀티라인 / 컴파운드 / 백그라운드 / 변수할당 / $() / pipe 가 있을 때만 적용
  // 단일 단순 명령은 다른 핸들러나 permissions.allow 에 위임
  const hasMultiline = trimmed.includes('\n')
  const hasCompound = /&&|\|\|/.test(trimmed)
  const hasBackground = /&\s*$/m.test(trimmed)
  const hasAssignment = /^[A-Za-z_][A-Za-z0-9_]*=/m.test(trimmed)
  const hasCmdSub = /\$\(/.test(trimmed)
  const hasPipe = /\s\|\s/.test(trimmed)
  const hasVarRef = /\$[A-Za-z_!]/.test(trimmed)
  if (!hasMultiline && !hasCompound && !hasBackground && !hasAssignment && !hasCmdSub && !hasPipe && !hasVarRef) {
    return false
  }

  // 줄별 / && || 으로 분리해서 statement 시퀀스 만들기 (quote-aware)
  const rawLines = trimmed.split('\n')
  const statements = []
  for (const raw of rawLines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const parts = quoteAwareSplit(line, 'compound')
    for (const p of parts) {
      const t = p.trim()
      if (t) statements.push(t)
    }
  }
  if (statements.length === 0) return false

  // 컨텍스트
  const safeVars = new Set()
  let lastWasBgServer = false  // 직전 statement 가 BG 로컬 서버였는가

  for (const rawStmt of statements) {
    let stmt = rawStmt.trim()
    if (!stmt) continue

    // 끝의 & 제거 후 BG 여부 추적
    let isBackground = false
    if (/&\s*$/.test(stmt)) {
      isBackground = true
      stmt = stmt.replace(/&\s*$/, '').trim()
    }

    // 변수 할당 (VAR=value)
    const assign = stmt.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (assign) {
      const name = assign[1]
      const value = assign[2].trim()
      // VAR=$!  — 직전이 안전한 BG 서버일 때만 허용
      if (value === '$!') {
        if (lastWasBgServer) {
          safeVars.add(name)
          lastWasBgServer = false
          continue
        }
        return false
      }
      // VAR=$(safe-readonly-pipe)
      const subMatch = value.match(/^["']?\$\(([^()]+)\)["']?$/)
      if (subMatch) {
        if (isReadOnlyPipeChain(subMatch[1].trim(), allowedDirs, safeVars)) {
          safeVars.add(name)
          lastWasBgServer = false
          continue
        }
        return false
      }
      // VAR=리터럴 (숫자, 따옴표 안 문자열, 단순 단어, 허용 영역의 절대경로)
      if (/^\d+$/.test(value) ||
          /^["'][^$`"'\\]*["']$/.test(value) ||
          /^[\w./:-]+$/.test(value)) {
        safeVars.add(name)
        lastWasBgServer = false
        continue
      }
      return false  // 알 수 없는 할당
    }

    // 일반 statement — 첫 단어 검사
    const firstWord = (stmt.match(/^(\S+)/) || [])[1]
    if (!firstWord || /[{}'"`\\$]/.test(firstWord)) return false
    if (!SCRIPT_ALL_SAFE.has(firstWord)) return false

    // cd <safe>
    if (firstWord === 'cd') {
      const target = stmt.split(/\s+/)[1]
      if (!target || !shAbs(target)) return false
      if (!isUnderAllowed(target, allowedDirs) && !isUnderTempDir(target)) return false
    }

    // git: 위험 서브커맨드 차단
    if (firstWord === 'git' && /\bgit\s+(?:push|commit|reset\s+--hard|clean\s+-[fdx]|checkout\b)/.test(stmt)) {
      return false
    }

    // rm/cp/mv 경로 검사
    if (firstWord === 'rm' || firstWord === 'cp' || firstWord === 'mv') {
      const args = stmt.split(/\s+/).slice(1).filter(a => !a.startsWith('-'))
      for (const a of args) {
        if (firstWord === 'rm' && !isPlainRelativeRmArg(a)) return false
        if (shLooksAbs(a)) {
          if (!shSafeAbs(a, allowedDirs)) return false
        }
      }
    }

    // chmod +x 차단
    if (firstWord === 'chmod' && /\+x\b/.test(stmt)) return false

    // ln -s / ln: 대상이 안전 영역이어야 함
    if (firstWord === 'ln') {
      const args = stmt.split(/\s+/).slice(1).filter(a => !a.startsWith('-'))
      const target = args[args.length - 1]
      if (target && shLooksAbs(target)) {
        if (!shSafeAbs(target, allowedDirs)) return false
      }
    }

    // kill — 안전 변수 PID 만 허용
    if (firstWord === 'kill') {
      // kill $VAR 또는 kill SIGNAL $VAR
      const killVars = [...stmt.matchAll(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g)].map(m => m[1])
      if (killVars.length === 0) return false  // 리터럴 PID 거부 (안전 추적 불가)
      for (const v of killVars) {
        if (!safeVars.has(v)) return false
      }
    }

    // 백그라운드 — 알려진 로컬 서버만
    if (isBackground) {
      const cmdOnly = stmt.replace(/\s*>.*$/, '').replace(/\s*2>.*$/, '').trim()
      if (!LOCAL_SERVER_PATTERNS.some(p => p.test(cmdOnly))) return false
      lastWasBgServer = true
    } else {
      lastWasBgServer = false
    }

    // 파이프 체인 — 모든 단계 검사 (quote-aware split)
    const stages = quoteAwareSplit(stmt, '|')
    for (const stage of stages) {
      const fw = (stage.match(/^(\S+)/) || [])[1]
      if (!fw) return false
      if (!SCRIPT_ALL_SAFE.has(fw)) return false
      // 파이프 각 단계에서도 git 위험 서브커맨드·publish 차단 (구: statement 첫 단어만 검사 → `true | git push` 우회)
      if (fw === 'git' && /\bgit\s+(?:push|commit|reset\s+--hard|clean\s+-[fdx]|checkout\b)/.test(stage)) return false
      if (/^(?:npm|pnpm|yarn|bun)$/.test(fw) && /\bpublish\b/.test(stage)) return false
      // xargs 다음 명령은 read-only
      if (fw === 'xargs') {
        const m = stage.match(/^xargs(?:\s+-\S+)*\s+(\S+)/)
        const next = m ? m[1] : null
        if (!next || /[{}'"`\\$]/.test(next)) return false
        if (!SAFE_READONLY_COMMANDS.has(next)) return false
        if (next === 'xargs') return false
      }
    }

    // $() 내부 검증 — read-only pipe 만
    const cmdSubs = extractCommandSubstitutions(stmt)
    for (const sub of cmdSubs) {
      if (!isReadOnlyPipeChain(sub, allowedDirs, safeVars)) return false
    }

    // 위험한 redirect (단, /dev/null /dev/stdout /dev/stderr 는 허용)
    if (/>\s*\/(?:etc|usr|bin|sbin|sys|proc|root)\//.test(stmt)) return false
    if (/>\s*\/dev\/(?!null|stdout|stderr|stdin\b)/.test(stmt)) return false
    if (/>\s*\S*\.zshrc\b/.test(stmt)) return false
    if (/>\s*\S*\.bashrc\b/.test(stmt)) return false
    if (/>\s*\S*\/\.ssh\//.test(stmt)) return false

    // 기타 변수/경로/URL 참조 검증
    if (!validateLineReferences(stmt, allowedDirs, safeVars)) return false
  }

  return true
}

// 안전 패턴: A && B && C ... 형태의 컴파운드 명령
// → "/tmp access" 권한 트리거나 복합 패턴 휴리스틱 우회
// 모든 statement(파이프 단계 포함)가 화이트리스트 명령 + 경로가 안전 영역일 때만 허용
function isCompoundSafe(cmd, allowedDirs) {
  const trimmed = cmd.trim()
  if (!trimmed || trimmed.includes('\n')) return false
  if (hasNonRmRisk(trimmed, allowedDirs)) return false // `a && b; git push` 처럼 ; 뒤에 숨은 명령 포함

  // 동적 코드 평가 차단
  if (/\$\(/.test(trimmed)) return false
  if (/`/.test(trimmed)) return false

  // 다른 핸들러 영역 양보
  if (/<<-?\s*['\\]?[A-Za-z_]/.test(trimmed)) return false  // heredoc
  if (/^\s*cd\s/.test(trimmed)) return false                // cd compound

  // 컴파운드(&&, ||)가 있어야 적용
  if (!/&&|\|\|/.test(trimmed)) return false

  const statements = trimmed.split(/\s*(?:&&|\|\|)\s*/).filter(Boolean)

  for (const stmt of statements) {
    const stages = stmt.split(/\s*\|\s*/).filter(Boolean)
    for (const stage of stages) {
      if (!isStatementSafeForCompound(stage, allowedDirs)) return false
    }
  }

  return true
}

// 안전 패턴: 첫 단어가 read-only 명령이고 brace expansion이 인자에서만 일어남
// → Claude Code의 "Brace expansion" 경고 우회
// allowedDirs 는 윈도우 리다이렉트 대상 검사에만 쓴다 (맥은 무시 — 기존 판정 그대로)
function isBraceExpansionSafe(cmd, allowedDirs) {
  const trimmed = cmd.trim()
  if (!trimmed) return false
  if (hasNonRmRisk(trimmed, [])) return false

  // 실제로 brace expansion(쉼표 포함)을 쓰지 않으면 적용 대상 아님
  if (!/\{[^{}]*,[^{}]*\}/.test(trimmed)) return false

  // 컴파운드(;, &&, ||, 개행)는 거부 — 다중 명령 조합은 보수적으로 묻기
  if (trimmed.includes(';')) return false
  if (trimmed.includes('&&')) return false
  if (trimmed.includes('||')) return false
  if (trimmed.includes('\n')) return false

  // backtick / $(..) 명령 치환 거부 — 동적 코드 실행
  if (/\$\(/.test(trimmed)) return false
  if (/`/.test(trimmed)) return false

  // 파이프 체인: 모든 단계가 read-only 명령이어야 함
  const stages = trimmed.split(/\s\|\s/).map(s => s.trim()).filter(Boolean)

  for (const stage of stages) {
    const firstWord = (stage.match(/^(\S+)/) || [])[1]
    if (!firstWord) return false

    // 명령어 이름 자체에 brace/quote가 있으면 obfuscation 의심
    if (/[{}'"\\]/.test(firstWord)) return false

    if (!SAFE_READONLY_COMMANDS.has(firstWord)) return false

    // xargs는 다음 단어도 안전 명령이어야 함
    if (firstWord === 'xargs') {
      const m = stage.match(/^xargs(?:\s+-\S+)*\s+(\S+)/)
      const nextCmd = m ? m[1] : null
      if (!nextCmd) return false
      if (/[{}'"\\]/.test(nextCmd)) return false
      if (!SAFE_READONLY_COMMANDS.has(nextCmd)) return false
      if (nextCmd === 'xargs') return false  // xargs xargs 금지
    }
  }

  // sed -i (in-place) 차단 — 파일 수정
  if (/\bsed\s+(?:-\w*i\b|-i\s|-i$)/.test(trimmed)) return false

  // redirect 검사: > /dangerous/path 차단
  // `2>` 같은 fd 지정 redirect도 검출 (앞에 숫자가 있어도 매칭)
  const redirects = [...trimmed.matchAll(/[0-9]?>>?\s*(\S+)/g)]
  for (const r of redirects) {
    const target = r[1]
    if (target === '/dev/null') continue
    if (target.startsWith('&')) continue  // &1, &2 fd 복제
    if (HEREDOC_FORBIDDEN_PATHS.some(p => p.test(target))) return false
    // 윈도우: 드라이브·MSYS·~·`\`·변수 대상은 허용·임시 폴더 안이어야 함 (+ PowerShell 프로필·시작프로그램 금지)
    if (IS_WIN) {
      if (/^["']?\$/.test(target)) return false
      const t = target.replace(/^["']/, '') // 따옴표로 감싼 대상("C:/x y/z")도 같은 검사 — 따옴표 때문에 경로 판정을 빠져나가지 않게
      if (winForbiddenWrite(t)) return false
      if (shLooksAbs(t) && !shSafeAbs(t, allowedDirs || [])) return false
      if (!winPathsSafe(trimmed.slice(r.index), allowedDirs || [])) return false // 공백 든 따옴표 경로 전체
    }
    // 절대경로 redirect가 /tmp 또는 워크스페이스가 아닌 시스템 영역이면 차단
    if (target.startsWith('/') && !target.startsWith('/tmp/') && !target.startsWith('/var/folders/') && !target.startsWith('/private/')) {
      // /Users/x/.zshrc 같은 건 이미 위에서 차단. 그 외 시스템 영역 추가 차단.
      if (/^\/(?:etc|usr|bin|sbin|var|sys|proc|dev|root)\//.test(target)) return false
    }
  }

  return true
}

// ─────────────────────────────────────────────────────────────
// 셸 명령 분석기 (2026-09-26 사각지대 감사 C1·C3·C6 대응)
//
// 정규식 문자열 매칭은 파이프 단계·체인·치환·서브셸·`bash -c`·명령 전치(env/command/…)·
// git 전역 옵션(-C 등)·따옴표 분할(gi"t")을 놓친다. 명령을 셸 문법 수준으로 풀어
// "실제로 실행될 명령(invocation)" 목록을 만든 뒤 명령 단위로 위험을 분류한다.
//
// 보수 원칙: 정적으로 해석할 수 없는 것(동적 명령명·닫히지 않은 따옴표·과도한 중첩)은
// 'unknown' — PreToolUse 에서 allow 하지 않고 PermissionRequest 에서 자동 승인하지 않는다.
// 한계: 셸 문법 완전 구현이 아니다(case 패턴·산술식 등은 근사). 그래서 근사가 틀리면
//       항상 "더 묻는" 쪽으로 틀리도록 설계했다.
// ─────────────────────────────────────────────────────────────
const MAX_ANALYZE_LEN = 1000000
const MAX_DEPTH = 8
const ZERO_WIDTH_RE = /[​-‍⁠﻿­]/g
const HOME_DIR = (() => { try { return path.resolve(os.homedir()) } catch { return null } })()

const SHELL_NAMES = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh', 'mksh', 'ash', 'fish', 'yash', 'tcsh', 'csh'])
const RESERVED_SKIP = new Set(['!', '{', '}', 'if', 'then', 'elif', 'else', 'fi', 'while', 'until', 'do', 'done', 'esac', 'time', 'coproc'])
const FETCHERS = new Set(['curl', 'wget', 'fetch', 'http', 'https', 'aria2c', 'xh'])
const EXEC_SINKS = new Set(['eval', 'source', '.'])
const PUBLISHERS = new Set(['npm', 'pnpm', 'yarn', 'bun', 'cargo'])
// 윈도우 명령 셸·스크립트 호스트 — 넘긴 명령(rd /s /q·Remove-Item 등)을 이 분석기가 해석하지 못한다
const WIN_SHELLS = new Set(['cmd', 'powershell', 'pwsh', 'wsl', 'wscript', 'cscript', 'mshta'])
const SYSTEM_DIRS = ['/bin', '/boot', '/dev', '/etc', '/lib', '/lib64', '/proc', '/root', '/sbin', '/sys', '/usr',
  '/var', '/opt', '/System', '/Library', '/Applications', '/private/etc', '/private/var', '/cores', '/Volumes']
const LEVEL_RANK = { deny: 3, ask: 2, unknown: 1 }

function isInterpreterName(name) {
  return SHELL_NAMES.has(name) || /^python[\d.]*$/.test(name) || /^(?:node|nodejs|perl|ruby|php|lua|pwsh|powershell|osascript|deno|bun|tclsh|Rscript)$/i.test(name)
}

function newWord() { return { value: '', quoted: false, dyn: false, subst: false, tilde: false } }

// "..." 내부 — $ 확장·$(…)·`…` 는 살아 있다
function readDouble(src, i, cur, st) {
  const n = src.length
  while (i < n) {
    const c = src[i]
    if (c === '"') return i + 1
    if (c === '\\' && i + 1 < n) {
      const nx = src[i + 1]
      if ('$`"\\\n'.includes(nx)) { if (nx !== '\n') cur.value += nx; i += 2; continue }
      cur.value += c; i++; continue
    }
    if (c === '$' && src[i + 1] === '(') {
      const r = readBalanced(src, i + 2, st); addSub(st, r.inner, cur); cur.value += '$(…)'; i = r.end; continue
    }
    if (c === '`') { const r = readBacktick(src, i + 1, st); addSub(st, r.inner, cur); cur.value += '`…`'; i = r.end; continue }
    if (c === '$') { cur.dyn = true; cur.value += c; i++; continue }
    cur.value += c; i++
  }
  st.error = st.error || '닫히지 않은 큰따옴표'
  return n
}

// $( … ) / <( … ) 의 짝 괄호 찾기 — 따옴표·이스케이프 인지
function readBalanced(src, i, st) {
  const n = src.length, start = i
  let depth = 1
  const heredocs = [] // $( cat <<'EOF' … EOF ) — 본문의 따옴표·괄호는 짝 계산에서 제외
  while (i < n) {
    const c = src[i]
    if (c === '\\') { i += 2; continue }
    if (c === '<' && src[i + 1] === '<' && src[i + 2] !== '<') {
      const m = /^<<-?[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([A-Za-z_0-9]+))/.exec(src.slice(i, i + 256))
      if (m) { heredocs.push({ delim: m[1] ?? m[2] ?? m[3], strip: m[0].startsWith('<<-') }); i += m[0].length; continue }
    }
    if (c === '\n' && heredocs.length) {
      i++
      for (const hd of heredocs.splice(0)) {
        while (i < n) {
          const nl = src.indexOf('\n', i)
          const line = src.slice(i, nl < 0 ? n : nl)
          i = nl < 0 ? n : nl + 1
          if ((hd.strip ? line.replace(/^\t+/, '') : line) === hd.delim) break
        }
      }
      continue
    }
    if (c === "'") { const j = src.indexOf("'", i + 1); if (j < 0) break; i = j + 1; continue }
    if (c === '"') {
      i++
      while (i < n && src[i] !== '"') i += src[i] === '\\' ? 2 : 1
      i++; continue
    }
    if (c === '(') depth++
    else if (c === ')') { depth--; if (depth === 0) return { inner: src.slice(start, i), end: i + 1 } }
    i++
  }
  st.error = st.error || '닫히지 않은 $( … )'
  return { inner: src.slice(start), end: n }
}

function readBacktick(src, i, st) {
  const n = src.length
  let j = i
  while (j < n) {
    if (src[j] === '\\') { j += 2; continue }
    if (src[j] === '`') return { inner: src.slice(i, j).replace(/\\([`\\$])/g, '$1'), end: j + 1 }
    j++
  }
  st.error = st.error || '닫히지 않은 백틱'
  return { inner: src.slice(i), end: n }
}

// $'…' (ANSI-C 인용) — 이스케이프 해석해 실제 문자열로
function readAnsiC(src, i, st) {
  const n = src.length
  let out = ''
  const simple = { n: '\n', t: '\t', r: '\r', a: '\x07', b: '\b', e: '\x1b', E: '\x1b', f: '\f', v: '\v', '\\': '\\', "'": "'", '"': '"', '?': '?' }
  while (i < n) {
    const c = src[i]
    if (c === "'") return { value: out, end: i + 1 }
    if (c === '\\' && i + 1 < n) {
      const nx = src[i + 1]
      if (simple[nx] !== undefined) { out += simple[nx]; i += 2; continue }
      let m
      if ((m = /^x([0-9a-fA-F]{1,2})/.exec(src.slice(i + 1, i + 4)))) { out += String.fromCharCode(parseInt(m[1], 16)); i += 1 + m[0].length; continue }
      if ((m = /^u([0-9a-fA-F]{1,4})/.exec(src.slice(i + 1, i + 6)))) { out += String.fromCharCode(parseInt(m[1], 16)); i += 1 + m[0].length; continue }
      if ((m = /^U([0-9a-fA-F]{1,8})/.exec(src.slice(i + 1, i + 10)))) { try { out += String.fromCodePoint(parseInt(m[1], 16)) } catch { /* 무효 코드포인트 */ } i += 1 + m[0].length; continue }
      if ((m = /^([0-7]{1,3})/.exec(src.slice(i + 1, i + 4)))) { out += String.fromCharCode(parseInt(m[1], 8)); i += 1 + m[0].length; continue }
      out += nx; i += 2; continue
    }
    out += c; i++
  }
  st.error = st.error || "닫히지 않은 $'…'"
  return { value: out, end: n }
}

function addSub(st, inner, cur) {
  cur.dyn = true
  cur.subst = true
  st.subs.push(inner)
}

// heredoc 본문 건너뛰기 — 따옴표 구분자면 본문은 순수 텍스트, 아니면 본문 속 치환만 분석
function skipHeredocs(src, i, list, st) {
  const n = src.length
  for (const hd of list) {
    let body = ''
    while (i < n) {
      const nl = src.indexOf('\n', i)
      const line = src.slice(i, nl < 0 ? n : nl)
      i = nl < 0 ? n : nl + 1
      if ((hd.strip ? line.replace(/^\t+/, '') : line) === hd.delim) break
      body += line + '\n'
    }
    // 본문 보관 — 셸이 표준입력으로 읽으면(bash <<EOF · cat <<EOF | bash) 본문을 스크립트로 다시 분석한다 (2026-11-06)
    if (st.heredocs) st.heredocs.push(body)
    if (!hd.quoted) {
      for (let k = 0; k < body.length; k++) {
        if (body[k] === '\\') { k++; continue }
        if (body[k] === '$' && body[k + 1] === '(') { const r = readBalanced(body, k + 2, st); st.subs.push(r.inner); k = r.end - 1; continue }
        if (body[k] === '`') { const r = readBacktick(body, k + 1, st); st.subs.push(r.inner); k = r.end - 1 }
      }
    }
  }
  return i
}

// 셸 어휘 분석 — 따옴표 제거된 단어 + 연산자 토큰
function lexShell(src, st) {
  const tokens = []
  const n = src.length
  const pending = []
  let i = 0, cur = null, heredocExpect = null, redirNext = false

  const start = () => { if (!cur) cur = newWord() }
  const end = () => {
    if (!cur) return
    const w = cur; cur = null
    if (heredocExpect) { pending.push({ delim: w.value, strip: heredocExpect.strip, quoted: w.quoted }); heredocExpect = null; return }
    if (redirNext) { const r = redirNext; redirNext = false; tokens.push({ t: 'redir', w, out: r.out, dup: r.dup, here: !!r.here }); return }
    tokens.push({ t: 'word', w })
  }
  const op = (v) => { end(); tokens.push({ t: 'op', v }) }

  while (i < n) {
    const ch = src[i]
    if (ch === '\\') {
      if (src[i + 1] === '\n') { i += 2; continue } // 줄 연속
      start(); cur.quoted = true
      if (i + 1 < n) cur.value += src[i + 1]
      i += 2; continue
    }
    if (ch === "'") {
      start(); cur.quoted = true
      const j = src.indexOf("'", i + 1)
      if (j < 0) { st.error = st.error || '닫히지 않은 작은따옴표'; cur.value += src.slice(i + 1); i = n; continue }
      cur.value += src.slice(i + 1, j); i = j + 1; continue
    }
    if (ch === '$' && src[i + 1] === "'") {
      start(); cur.quoted = true
      const r = readAnsiC(src, i + 2, st); cur.value += r.value; i = r.end; continue
    }
    if (ch === '"') { start(); cur.quoted = true; i = readDouble(src, i + 1, cur, st); continue }
    if (ch === '$' && src[i + 1] === '(') {
      start(); const r = readBalanced(src, i + 2, st); addSub(st, r.inner, cur); cur.value += '$(…)'; i = r.end; continue
    }
    if (ch === '`') { start(); const r = readBacktick(src, i + 1, st); addSub(st, r.inner, cur); cur.value += '`…`'; i = r.end; continue }
    if ((ch === '<' || ch === '>') && src[i + 1] === '(') {
      end(); start(); const r = readBalanced(src, i + 2, st); addSub(st, r.inner, cur); cur.value += ch + '(…)'; i = r.end; continue
    }
    if (ch === '$') { start(); cur.dyn = true; cur.value += '$'; i++; continue }
    if (ch === '\n') {
      op('\n'); i++
      if (pending.length) i = skipHeredocs(src, i, pending.splice(0), st)
      continue
    }
    if (/\s/.test(ch)) { end(); i++; continue } // 유니코드 공백도 구분자로 — 보수적(더 많이 탐지)
    if (ch === '#' && !cur) { while (i < n && src[i] !== '\n') i++; continue }
    if (ch === ';') { op(';'); i++; continue }
    if (ch === '&') {
      if (src[i + 1] === '&') { op('&&'); i += 2; continue }
      if (src[i + 1] === '>') { end(); i += src[i + 2] === '>' ? 3 : 2; redirNext = { out: true, dup: false }; continue }
      op('&'); i++; continue
    }
    if (ch === '|') {
      if (src[i + 1] === '|') { op('||'); i += 2; continue }
      op('|'); i += src[i + 1] === '&' ? 2 : 1; continue
    }
    if (ch === '(' || ch === ')') { op(ch); i++; continue }
    if (ch === '<' || ch === '>') {
      if (cur && !cur.quoted && !cur.dyn && /^\d+$/.test(cur.value)) cur = null // fd 번호 (2>)
      else end()
      let j = i + 1
      if (ch === '<' && src[j] === '<') {
        if (src[j + 1] === '<') { i = j + 2; redirNext = { out: false, dup: false, here: true }; continue } // here-string
        j++
        let strip = false
        if (src[j] === '-') { strip = true; j++ }
        heredocExpect = { strip }; i = j; continue
      }
      const nx = src[j]
      if (nx === '>' || nx === '|' || nx === '&' || (ch === '<' && nx === '>')) j++
      // 방향: > >> >| <> 는 쓰기, < 는 읽기 / >& <& 는 fd 복제(뒤 단어가 숫자·- 면 경로 아님)
      i = j; redirNext = { out: ch === '>' || nx === '>', dup: nx === '&' }; continue
    }
    if (ch === '~' && !cur) { start(); cur.tilde = true; cur.value += '~'; i++; continue }
    start(); cur.value += ch; i++
  }
  end()
  return tokens
}

// {a,b} 중괄호 확장 — 인용·확장 없는 단어만 (bash 는 명령 위치에서도 확장한다: {git,push})
function braceExpand(s, budget) {
  const m = /^([\s\S]*?)\{([^{}]*,[^{}]*)\}([\s\S]*)$/.exec(s)
  if (!m) return [s]
  const out = []
  for (const alt of m[2].split(',')) {
    for (const r of braceExpand(m[1] + alt + m[3], budget)) {
      out.push(r)
      if (out.length >= budget) return out
    }
  }
  return out
}

function expandWord(w) {
  if (w.quoted || w.dyn || !/\{[^{}]*,[^{}]*\}/.test(w.value)) return [w]
  return braceExpand(w.value, 256).map(v => ({ ...w, value: v, tilde: v === '~' || v.startsWith('~/') }))
}

// 토큰 → 단순 명령 목록 (파이프라인·서브셸 문맥 포함)
function splitCommands(tokens) {
  const cmds = []
  let cur = null, pipeline = 0, parenDepth = 0
  const flush = () => { if (cur && cur.words.length) cmds.push(cur); cur = null }
  for (const tk of tokens) {
    if (tk.t === 'op') {
      flush()
      if (tk.v === '(') parenDepth++
      else if (tk.v === ')') parenDepth = Math.max(0, parenDepth - 1)
      else if (tk.v !== '|') pipeline++
      continue
    }
    if (!cur) cur = { words: [], redirs: [], pipeline, inParen: parenDepth > 0 }
    if (tk.t === 'redir') cur.redirs.push({ ...tk.w, out: !!tk.out, dup: !!tk.dup, here: !!tk.here })
    else cur.words.push(...expandWord(tk.w))
  }
  flush()
  const sizes = {}
  for (const c of cmds) sizes[c.pipeline] = (sizes[c.pipeline] || 0) + 1
  for (const c of cmds) c.inPipe = sizes[c.pipeline] > 1
  return cmds
}

function cleanValue(v) { return String(v).replace(ZERO_WIDTH_RE, '') }

// 윈도우 실행 파일 확장자 — Git Bash 에서 git.exe·rm.exe·"C:\Git\bin\git.exe" 로 부르면 이름이 달라 분류를 빠져나갔다
// (2026-10-20 실측: git.exe push --force 가 PermissionRequest 자동 승인). \ 경로와 확장자를 떼고 git·rm 으로 판정
const WIN_EXE_RE = /\.(?:exe|cmd|bat|com|ps1)$/i
function cmdNameOf(w) {
  const v = cleanValue(w.value)
  return v.slice(Math.max(v.lastIndexOf('/'), v.lastIndexOf('\\')) + 1).toLowerCase().replace(WIN_EXE_RE, '')
}

function isAssignmentWord(w) { return /^[A-Za-z_][A-Za-z0-9_]*(?:\[[^\]]*\])?\+?=/.test(w.value) }

// sh -c 'SCRIPT' 의 SCRIPT 단어 (없으면 null)
function shellDashC(args) {
  let hasC = false
  for (let i = 0; i < args.length; i++) {
    const v = args[i].value
    if (v === '--') { return hasC ? args[i + 1] || null : null }
    if (/^--(?:rcfile|init-file)$/.test(v)) { i++; continue }
    if (/^[-+]o$/.test(v)) { i++; continue }
    if (/^[-+][A-Za-z]+$/.test(v)) { if (v[0] === '-' && v.includes('c')) hasC = true; continue }
    if (v.startsWith('--')) continue
    return hasC ? args[i] : null
  }
  return null
}

// 인터프리터가 stdin 에서 코드를 읽는가 (curl … | <이것>)
function readsStdin(inv) {
  const vals = inv.args.map(a => a.value)
  if (SHELL_NAMES.has(inv.name)) {
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i]
      if (v === '--') return vals[i + 1] === undefined || vals[i + 1] === '-'
      if (/^[-+]o$/.test(v)) { i++; continue }
      if (/^-[A-Za-z]+$/.test(v)) { if (v.includes('c')) return false; if (v.includes('s')) return true; continue }
      if (v.startsWith('-') && v !== '-') continue
      return v === '-'
    }
    return true
  }
  for (let i = 0; i < vals.length; i++) {
    const v = vals[i]
    if (/^-(?:c|e|m|p|E|r)$/.test(v) || /^--(?:eval|print|command)$/.test(v)) return false
    if (/^-[WXQ]$/.test(v)) { i++; continue }
    if (v === '-') return true
    if (v.startsWith('-')) continue
    return false // 스크립트 파일 인자
  }
  return true
}

// git 전역 옵션 건너뛰고 서브커맨드 추출 + -c alias.X= 별칭 해석
function parseGitInvocation(args) {
  const aliases = {}
  let dir = null, i = 0
  while (i < args.length) {
    const v = cleanValue(args[i].value)
    if (v === '-C') { dir = args[i + 1] || null; i += 2; continue }
    if (v === '-c') {
      const kv = args[i + 1]
      if (kv) { const m = /^alias\.([^=]+)=([\s\S]*)$/i.exec(kv.value); if (m) aliases[m[1].toLowerCase()] = m[2] }
      i += 2; continue
    }
    if (/^--(?:git-dir|work-tree|namespace|super-prefix|config-env|attr-source)$/.test(v)) { i += 2; continue }
    if (v.startsWith('-')) { i++; continue }
    break
  }
  if (i >= args.length) return { sub: null, subDyn: false, args: [], dir, aliases }
  return { sub: cleanValue(args[i].value).toLowerCase(), subDyn: !!args[i].dyn, args: args.slice(i + 1), dir, aliases }
}

function wordsOf(src) {
  const st = { error: null, subs: [] }
  return lexShell(src, st).filter(t => t.t === 'word').map(t => t.w)
}

// 전치 명령(env/command/sudo/xargs/…)을 벗기고 실제 명령을 invocation 으로 기록
function collectInvocations(words, ctx, acc, meta) {
  let w = words.slice()
  let sudo = false
  for (let guard = 0; guard < 64 && w.length; guard++) {
    while (w.length && isAssignmentWord(w[0])) w.shift()
    if (!w.length) return
    const nm = cmdNameOf(w[0])
    if (w[0].dyn) break
    if (RESERVED_SKIP.has(nm) && !w[0].quoted) { w.shift(); continue }
    if (nm === 'function' && !w[0].quoted) { w.splice(0, 2); continue }
    if (nm === 'command') {
      w.shift()
      while (w.length && /^-[pvV]+$/.test(w[0].value)) { if (/[vV]/.test(w[0].value)) return; w.shift() } // -v/-V 는 조회만
      continue
    }
    if (nm === 'builtin' || nm === 'nohup' || nm === 'noglob' || nm === 'busybox') { w.shift(); continue }
    if (nm === 'exec' || nm === 'nice' || nm === 'stdbuf' || nm === 'caffeinate') {
      w.shift()
      while (w.length && w[0].value.startsWith('-')) {
        const o = w.shift().value
        if (o === '--') break
        if ((nm === 'exec' && o === '-a') || (nm === 'nice' && o === '-n') || (nm === 'stdbuf' && /^-[ioe]$/.test(o)) || (nm === 'caffeinate' && /^-[tw]$/.test(o))) w.shift()
      }
      continue
    }
    if (nm === 'timeout' || nm === 'gtimeout') {
      w.shift()
      while (w.length && w[0].value.startsWith('-')) {
        const o = w.shift().value
        if (o === '--') break
        if (/^(?:-s|-k|--signal|--kill-after)$/.test(o)) w.shift()
      }
      w.shift() // duration
      continue
    }
    if (nm === 'env') {
      w.shift()
      let split = null
      while (w.length) {
        const o = w[0].value
        if (o === '--') { w.shift(); break }
        if (isAssignmentWord(w[0])) { w.shift(); continue }
        if (o === '-') { w.shift(); continue }
        if (!o.startsWith('-')) break
        w.shift()
        if (/^(?:-u|-C|-P|--unset|--chdir)$/.test(o)) w.shift()
        else if (o === '-S' || o === '--split-string') split = w.shift() || null
        else if (/^-S./.test(o)) split = { ...newWord(), value: o.slice(2) }
        else if (o.startsWith('--split-string=')) split = { ...newWord(), value: o.slice(15) }
      }
      if (split) {
        if (split.dyn) { acc.unknown.push('env -S 동적 문자열') }
        w = [...wordsOf(split.value), ...w]
      }
      if (!w.length) return
      continue
    }
    if (nm === 'sudo' || nm === 'doas') {
      sudo = true
      w.shift()
      while (w.length && w[0].value.startsWith('-')) {
        const o = w.shift().value
        if (o === '--') break
        if (/^-[ugpChDrtUT]$/.test(o)) w.shift()
      }
      if (!w.length) { acc.invocations.push({ name: nm, args: [], sudo: true, ...meta }); return }
      continue
    }
    if (nm === 'xargs') {
      w.shift()
      while (w.length && w[0].value.startsWith('-')) {
        const o = w.shift().value
        if (o === '--') break
        if (/^-[IdEsnPLa]$/.test(o)) w.shift()
      }
      if (!w.length) return
      continue
    }
    break
  }
  if (!w.length) return

  const inv = { name: cmdNameOf(w[0]), dynamicName: !!w[0].dyn, args: w.slice(1), sudo, ...meta }
  acc.invocations.push(inv)
  if (inv.dynamicName) return

  const depth = ctx.depth + 1
  if (SHELL_NAMES.has(inv.name)) {
    const script = shellDashC(inv.args)
    if (script) analyzeShellInto(script.value, depth, acc, true)
  } else if (inv.name === 'eval') {
    analyzeShellInto(inv.args.map(a => a.value).join(' '), depth, acc, true)
  } else if (inv.name === 'find') {
    for (let k = 0; k < inv.args.length; k++) {
      if (/^-(?:exec|execdir|ok|okdir)$/.test(inv.args[k].value)) {
        const sub = []
        k++
        while (k < inv.args.length && inv.args[k].value !== ';' && inv.args[k].value !== '+') sub.push(inv.args[k++])
        collectInvocations(sub, ctx, acc, meta)
      }
    }
  } else if (inv.name === 'git') {
    let g = parseGitInvocation(inv.args)
    if (g.sub && !g.subDyn && g.aliases[g.sub] !== undefined) {
      const val = g.aliases[g.sub]
      if (val.startsWith('!')) analyzeShellInto(val.slice(1), depth, acc, true)
      else {
        const aw = wordsOf(val)
        if (aw.length) g = { ...g, sub: cmdNameOf(aw[0]), args: [...aw.slice(1), ...g.args] }
      }
    }
    inv.git = g
  }
}

function analyzeShellInto(src, depth, acc, inSub) {
  if (depth > MAX_DEPTH) { acc.unknown.push('중첩 과다'); return }
  const st = { error: null, subs: [], heredocs: [] }
  const tokens = lexShell(src, st)
  if (st.error) acc.unknown.push(st.error)
  for (const sub of st.subs) analyzeShellInto(sub, depth + 1, acc, true)
  const scope = acc.seq++
  const cmds = splitCommands(tokens)
  let heredocsDone = false
  for (let ci = 0; ci < cmds.length; ci++) {
    const c = cmds[ci]
    const before = acc.invocations.length
    collectInvocations(c.words, { depth }, acc, {
      pipeline: `${scope}:${c.pipeline}`,
      subshell: !!(inSub || c.inParen || c.inPipe),
      fromSub: !!inSub,
      argSubst: c.words.slice(1).some(x => x.subst),
      redirs: c.redirs,
    })
    // 셸이 표준입력에서 스크립트를 읽으면 넘겨준 글자를 스크립트로 다시 분석 (2026-11-06 점검: `echo 'rm -rf ~' | bash`·
    // `bash -s <<< '…'`·`cat <<EOF | bash` 가 위험 판정 없이 지나갔다). 내용을 모르는 입력(cat f | bash 등)은 여기서 판정하지 않고,
    // PermissionRequest 자동 승인 대상에서 빠져(셸은 승인 목록에 없음) 사용자 확인으로 간다
    const sh = acc.invocations.slice(before).find(x => !x.dynamicName && SHELL_NAMES.has(x.name) && readsStdin(x))
    if (!sh) continue
    const feed = (text) => analyzeShellInto(text, depth + 1, acc, true)
    for (const r of c.redirs) if (r.here) feed(r.value)
    if (!heredocsDone) { heredocsDone = true; for (const b of st.heredocs) feed(b) } // 본문이 어느 명령의 것인지 가르지 않는다(보수적)
    const prev = ci > 0 && cmds[ci - 1].pipeline === c.pipeline ? cmds[ci - 1] : null
    if (!prev) continue
    for (const r of prev.redirs) if (r.here) feed(r.value) // cat <<< '…' | bash
    const pw = prev.words
    const pn = pw.length && !pw[0].dyn ? cmdNameOf(pw[0]) : ''
    if (pn === 'echo') {
      const rest = pw.slice(1)
      while (rest.length && /^-[neE]+$/.test(rest[0].value)) rest.shift()
      feed(rest.map(w => w.value).join(' ').replace(/\\n/g, '\n'))
    } else if (pn === 'printf') {
      for (const w of pw.slice(1)) feed(w.value.replace(/%[-+ #0-9.]*[a-zA-Z]/g, ' ').replace(/\\n/g, '\n'))
    }
  }
}

function analyzeShell(cmd) {
  const acc = { invocations: [], unknown: [], seq: 0 }
  if (typeof cmd !== 'string') { acc.unknown.push('비문자열 명령'); return acc }
  if (cmd.length > MAX_ANALYZE_LEN) { acc.unknown.push('명령 길이 초과'); return acc }
  analyzeShellInto(cmd, 0, acc, false)
  return acc
}

// rm 대상 단어 → 절대경로 (해석 불가면 null). glob 이면 glob 이 걸린 디렉토리 + glob:true
function resolveRmTarget(w, vcwd) {
  if (IS_WIN) return resolveRmTargetWin(w, vcwd)
  let v = cleanValue(w.value)
  if (w.tilde) {
    if (!HOME_DIR || !(v === '~' || v.startsWith('~/'))) return null
    v = HOME_DIR + v.slice(1)
  } else if (w.dyn) {
    const h = /^\$(?:\{HOME\}|HOME(?![A-Za-z0-9_]))([\s\S]*)$/.exec(v)
    const p = /^\$(?:\{PWD\}|PWD(?![A-Za-z0-9_]))([\s\S]*)$/.exec(v)
    if (h && HOME_DIR) v = HOME_DIR + h[1]
    else if (p && vcwd) v = vcwd + p[1]
    else return null
    if (v.includes('$') || v.includes('`')) return null
  }
  if (!v) return null
  if (!v.startsWith('/')) { if (!vcwd) return null; v = vcwd + '/' + v }
  const g = v.search(/[*?[]/)
  if (g >= 0) {
    const base = v.slice(0, g)
    const dir = base.endsWith('/') ? base : path.dirname(base)
    return { abs: path.resolve(dir), glob: true }
  }
  return { abs: path.resolve(v), glob: false }
}

// 윈도우판 — 결과 abs 는 winCanon 형태(`C:/Users/x`, 슬래시·드라이브 대문자). 홈은 `~`·`$HOME`·`$USERPROFILE`
// 따옴표 밖 `C:\x` 는 bash 가 `\` 를 지워 `C:x`(드라이브 상대)가 되므로 해석 불가 → null(확인)
function resolveRmTargetWin(w, vcwd) {
  let v = cleanValue(w.value)
  if (w.tilde) {
    if (!HOME_DIR || !(v === '~' || v.startsWith('~/'))) return null
    v = HOME_DIR + v.slice(1)
  } else if (w.dyn) {
    const h = /^\$(?:\{(?:HOME|USERPROFILE)\}|(?:HOME|USERPROFILE)(?![A-Za-z0-9_]))([\s\S]*)$/.exec(v)
    const p = /^\$(?:\{PWD\}|PWD(?![A-Za-z0-9_]))([\s\S]*)$/.exec(v)
    // Git Bash 는 윈도우 환경변수 APPDATA·LOCALAPPDATA 를 그대로 물려받는다 (%APPDATA%\gcloud 인증 파일 등)
    const a = /^\$(?:\{(APPDATA|LOCALAPPDATA)\}|(APPDATA|LOCALAPPDATA)(?![A-Za-z0-9_]))([\s\S]*)$/.exec(v)
    const aVal = a ? process.env[a[1] || a[2]] : null
    if (h && HOME_DIR) v = HOME_DIR + h[1]
    else if (p && vcwd) v = vcwd + p[1]
    else if (a && aVal && path.win32.isAbsolute(aVal)) v = aVal + a[3]
    else return null
    if (v.includes('$') || v.includes('`')) return null
  }
  if (!v) return null
  v = v.replace(/\\/g, '/')
  if (/^[A-Za-z]:(?!\/)/.test(v)) return null // 드라이브 상대 경로(C:x) — 그 드라이브의 현재 폴더를 모름
  if (!W.isAbs(v, true)) { if (!vcwd) return null; v = String(vcwd).replace(/\\/g, '/') + '/' + v }
  const g = v.search(/[*?[]/)
  if (g >= 0) {
    const base = v.slice(0, g)
    let dir = base.endsWith('/') ? base : path.posix.dirname(base)
    if (/^[A-Za-z]:$/.test(dir)) dir += '/' // C:/x* → 드라이브 루트에 걸린 glob
    const abs = winCanon(dir)
    return abs ? { abs, glob: true } : null
  }
  const abs = winCanon(v)
  return abs ? { abs, glob: false } : null
}

// of 가 dir 와 같거나 그 아래인가 — 윈도우는 대소문자·구분자 무시(winpath.isUnder)
function isAncestorOrSame(dir, of) {
  if (IS_WIN) return !!of && !!dir && W.isUnder(winCanon(of) || of, winCanon(dir) || dir, true)
  return !!of && (of === dir || of.startsWith(dir === '/' ? '/' : dir + '/'))
}
function sameDir(a, b) { return IS_WIN ? !!a && !!b && W.samePath(winCanon(a) || a, winCanon(b) || b, true) : a === b }

function classifyRm(inv, ctx, add) {
  let recursive = false, endOpts = false
  const targets = []
  for (const a of inv.args) {
    const v = a.value
    if (!endOpts && v === '--') { endOpts = true; continue }
    if (!endOpts && /^-[A-Za-z]+$/.test(v)) { if (/[rR]/.test(v)) recursive = true; continue }
    if (!endOpts && v.startsWith('--')) { if (v === '--recursive') recursive = true; continue }
    targets.push(a)
  }
  for (const t of targets) {
    const r = resolveRmTarget(t, ctx.vcwd)
    if (!r) { add('ask', `rm 대상 경로를 정적으로 해석할 수 없습니다(${t.value}). 사용자 확인이 필요합니다.`); continue }
    const abs = r.abs
    if (abs === '/') { add('deny', '루트 디렉토리 삭제는 차단됩니다.'); continue }
    if (IS_WIN && isWinRoot(abs)) { add('deny', `드라이브·네트워크 공유 루트(${abs}) 삭제는 차단됩니다.`); continue }
    if (HOME_DIR && isAncestorOrSame(abs, HOME_DIR)) { add('deny', '홈 디렉토리(또는 그 상위) 삭제는 차단됩니다.'); continue }
    if (IS_WIN && winUsersDirs().some(d => isAncestorOrSame(abs, d))) { add('deny', `사용자 폴더 모음(${abs}) 삭제는 차단됩니다.`); continue }
    // 윈도우는 대소문자 무시 (.SSH 도 같은 폴더)
    const base = IS_WIN ? path.posix.basename(abs).toLowerCase() : path.basename(abs)
    if (['.git', '.claude', '.ssh'].includes(base) || (IS_WIN ? /\/\.ssh(?:\/|$)/i : /\/\.ssh(?:\/|$)/).test(abs)) { add('deny', '.git / .claude / .ssh 디렉토리 삭제는 차단됩니다.'); continue }
    if (isUnderTempDir(abs)) continue
    if (SYSTEM_DIRS.some(d => isAncestorOrSame(d, abs)) || (IS_WIN && winSystemDirs().some(d => isAncestorOrSame(d, abs)))) {
      add(recursive ? 'deny' : 'ask', '시스템 디렉토리 삭제는 차단됩니다.'); continue
    }
    if (ctx.root && isAncestorOrSame(abs, ctx.root)) { add(recursive ? 'deny' : 'ask', '프로젝트 루트(또는 그 상위) 전체 삭제는 차단됩니다.'); continue }
    if (ctx.startCwd && sameDir(abs, ctx.startCwd)) { add(recursive ? 'deny' : 'ask', '현재 디렉토리 전체 삭제는 차단됩니다.'); continue }
    if (ctx.allowedDirs.some(d => sameDir(d, abs))) { add('ask', `허용 디렉토리 루트 전체 삭제(${abs})는 사용자 확인이 필요합니다.`); continue }
    if (isUnderAllowed(abs, ctx.allowedDirs)) continue
    add('ask', `프로젝트 루트 밖 경로 삭제(${abs})는 사용자 확인이 필요합니다.`)
  }
}

// ── 하네스 설치 폴더 쓰기 보호 (결정 39, 2026-10-19) ──
// 래퍼(gugbab-claude)가 넘기는 GUGBAB_HOME 아래를 Bash 로 고치면 확인 — 설치본은 업데이트로만 바뀌어야 하고,
// 가드 훅 코드도 여기 있다. 허용 폴더(이 프로젝트 메모리·대화 폴더 등)는 실제 위치가 그 안일 때만 제외.
// 상대경로·루트·홈(또는 그 상위)인 GUGBAB_HOME 은 무시 — 홈 전체에 확인 창이 뜨지 않게
function harnessRoots() {
  const h = process.env.GUGBAB_HOME
  if (!h || !path.isAbsolute(h)) return []
  const abs = path.resolve(nativeDir(h))
  if (abs === '/' || (IS_WIN && isWinRoot(winCanon(abs))) || (HOME_DIR && isAncestorOrSame(abs, HOME_DIR))) return []
  let real = abs
  try { real = fs.realpathSync(abs) } catch { /* 없음 → 글자 그대로 */ }
  return [...new Set([abs, real])]
}

// 가장 가까운 실제 존재하는 상위 폴더의 실경로 + 나머지 — 링크를 따라간 실제 위치
function realLocation(abs) {
  let cur = abs
  const rest = []
  for (let i = 0; i < 256; i++) {
    try { return path.join(fs.realpathSync(cur), ...rest.reverse()) } catch { /* 없음 → 한 단계 위로 */ }
    const up = path.dirname(cur)
    if (up === cur) return null
    rest.push(path.basename(cur))
    cur = up
  }
  return null
}

const HARNESS_WRITE_ALL = new Set(['touch', 'mkdir', 'rmdir', 'ln', 'chmod', 'chown', 'chgrp', 'truncate', 'tee', 'unlink', 'shred', 'mv'])
const HARNESS_WRITE_DEST = new Set(['cp', 'install', 'rsync', 'ditto'])

// 명령이 쓰는 대상 단어 — 전부(touch·mv …) / 목적지만(cp …) / in-place 편집(sed -i·perl -i)의 파일
function harnessWriteTargets(inv) {
  const nm = inv.name
  const nonOpt = []
  let endOpts = false, tdir = null
  for (let k = 0; k < inv.args.length; k++) {
    const a = inv.args[k]
    const v = a.value
    if (!endOpts && v === '--') { endOpts = true; continue }
    if (!endOpts && v.length > 1 && v.startsWith('-')) {
      if (HARNESS_WRITE_DEST.has(nm)) {
        if (v === '-t' && k + 1 < inv.args.length) { tdir = inv.args[++k]; continue }
        if (v.startsWith('--target-directory=')) { tdir = { ...a, value: v.slice(19) }; continue }
      }
      continue
    }
    nonOpt.push(a)
  }
  if (HARNESS_WRITE_ALL.has(nm)) return nonOpt
  if (HARNESS_WRITE_DEST.has(nm)) return tdir ? [tdir] : nonOpt.slice(-1)
  if ((nm === 'sed' || nm === 'perl') && inv.args.some(a => /^-[A-Za-z]*i/.test(a.value) || a.value.startsWith('--in-place'))) return nonOpt
  return []
}

function classifyHarnessWrite(inv, ctx, add) {
  if (!ctx.harness.length) return
  const redirs = (inv.redirs || []).filter(r => r.out && !(r.dup && /^(?:\d+|-)$/.test(r.value)))
  for (const t of [...harnessWriteTargets(inv), ...redirs]) {
    const r = resolveRmTarget(t, ctx.vcwd)
    if (!r) continue // 변수 등 정적 해석 불가 — 이 검사는 판정하지 않음(기존 흐름)
    const real = realLocation(r.abs) || r.abs
    if (isUnderAllowed(real, ctx.allowedDirs)) continue
    const h = ctx.harness.find(d => isAncestorOrSame(d, r.abs) || isAncestorOrSame(d, real))
    if (h) add('ask', `하네스 설치 폴더(${h}) 쓰기(${inv.name || '리다이렉트'})는 사용자 확인이 필요합니다 — 설치본은 업데이트로만 바뀌어야 합니다.`)
  }
}

// ── 프로젝트 소스 파일을 Bash 로 쓰기 차단 (2026-10-22 실사용 보고) ──
// `cat > package.json <<EOF`·`sed … > build.gradle`·`sed -i …` 로 파일을 만들면 Write·Edit 에 걸린 검사 훅과
// 경로 룰 로드를 모두 비켜 간다. 내용을 손으로 쓰는 명령(cat·echo·printf·tee·sed·awk·perl)이
// 프로젝트·허용 폴더 안의 소스·설정 파일에 쓰면 deny — 이유에 "Write·Edit 도구로" 를 남겨 Claude 가 도구로 다시 쓰게 한다.
// 프로그램 출력(node gen.js > docs/x.md, npm test > out.txt)·임시 폴더·.git 안·확장자 없는 파일은 그대로.
const AUTHOR_CMDS = new Set(['cat', 'echo', 'printf', 'tee', 'sed', 'gsed', 'awk', 'gawk', 'perl'])
const SOURCE_EXT_RE = /\.(?:[cm]?[jt]sx?|vue|svelte|java|kts?|gradle|groovy|scala|xml|xfdl|json5?|ya?ml|toml|properties|ini|py|rb|go|rs|php|cs|swift|c|h|cpp|hpp|sql|html?|css|scss|sass|less|mdx?|sh|bash|zsh|ps1|bat|cmd)$/i
const SOURCE_NAME_RE = /^(?:\.env(?:\..+)?|dockerfile|makefile|gemfile|pom\.xml)$/i

function sourceWriteTargets(inv) {
  if (!AUTHOR_CMDS.has(inv.name)) return []
  const redirs = (inv.redirs || []).filter(r => r.out && !(r.dup && /^(?:\d+|-)$/.test(r.value)))
  const inPlace = (inv.name === 'tee' || ((inv.name === 'sed' || inv.name === 'gsed' || inv.name === 'perl')
    && inv.args.some(a => /^-[A-Za-z]*i/.test(a.value) || a.value.startsWith('--in-place')))) ? harnessWriteTargets({ ...inv, name: inv.name === 'tee' ? 'tee' : 'sed' }) : []
  return [...redirs, ...inPlace]
}

function classifySourceWrite(inv, ctx, add) {
  for (const t of sourceWriteTargets(inv)) {
    const r = resolveRmTarget(t, ctx.vcwd)
    if (!r || r.glob) continue // 변수 등 정적 해석 불가 — 이 검사는 판정하지 않음(기존 흐름)
    const abs = r.abs
    const base = IS_WIN ? path.posix.basename(abs) : path.basename(abs)
    if (!SOURCE_EXT_RE.test(base) && !SOURCE_NAME_RE.test(base)) continue
    if (/^\/dev\//.test(abs) || isUnderTempDir(abs)) continue
    const real = realLocation(abs) || abs
    if (isUnderTempDir(real)) continue
    if ((IS_WIN ? /\/\.git(?:\/|$)/i : /\/\.git(?:\/|$)/).test(real)) continue
    const inProject = (ctx.root && (isAncestorOrSame(ctx.root, abs) || isAncestorOrSame(ctx.root, real))) || isUnderAllowed(real, ctx.allowedDirs)
    if (!inProject) continue
    add('deny', `${inv.name} 로 프로젝트 파일(${base})을 직접 쓰면 Write·Edit 검사 훅을 거치지 않습니다. 파일을 만들거나 고칠 때는 Write·Edit 도구를 쓰세요(명령 출력을 파일로 받는 것은 그대로 됩니다).`)
    return
  }
}

// ── Bash 쓰기 대상 위치 판정 (2026-10-22, 다른 프로젝트 보고로 재현) ──
// PermissionRequest 는 classifyShell 판정이 없으면 자동 승인하므로, 쓰기 대상을 보지 않으면 `cp x ~/.zshrc`·
// `cp x ~/.claude/settings.json`(훅 끄기)·`cp x /etc/hosts`·`echo '{"approved":true}' > $TMPDIR/claude-task-confirm-guard/<세션>.json`(자기 승인)이
// 확인 없이 지나갔다. Write 도구 정책(auto-approve: 프로젝트·허용 폴더 밖은 확인, protect-secrets: 보호 파일 차단)과 같게 맞춘다.
//   승인 상태 폴더 → deny · 보호 파일 → 프로젝트·임시 폴더 밖이면 deny, 안이면 ask(`cp .env.example .env` 같은 흔한 작업은 확인만)
//   · 프로젝트·허용 폴더·임시 폴더·/dev 밖 → ask. 대상을 정적으로 해석할 수 없으면(변수 등) 이 검사는 판정하지 않음(기존 흐름)
const TCG_STATE_DIR = path.join(os.tmpdir(), 'claude-task-confirm-guard')
function inTcgStateDir(abs) {
  if (!abs) return false
  if (IS_WIN) {
    const c = winCanon(abs)
    const bases = [TCG_STATE_DIR, realLocation(TCG_STATE_DIR)].filter(Boolean).map(b => winCanon(b)).filter(Boolean)
    return !!c && bases.some(b => W.isUnder(c, b, true))
  }
  // 맥 기본 파일 시스템은 대소문자를 무시한다 — 대문자로 쓴 폴더 이름도 같은 폴더
  const fold = (p) => (process.platform === 'darwin' ? p.toLowerCase() : p)
  const bases = [TCG_STATE_DIR, realLocation(TCG_STATE_DIR)].filter(Boolean).map(fold)
  return [abs, realLocation(abs)].filter(Boolean).map(fold).some(x => bases.some(b => x === b || x.startsWith(b + path.sep)))
}
let _isProtectedWritePath = null
try { _isProtectedWritePath = require('./protect-secrets.js').isProtectedWritePath } catch { /* 미설치 → 보호 파일 검사 생략 */ }
const DEV_PATH_RE = /^\/dev\/(?:null|zero|stdout|stderr|stdin|tty|fd\/\d+)$/

function writeLocationTargets(inv) {
  const redirs = (inv.redirs || []).filter(r => r.out && !(r.dup && /^(?:\d+|-)$/.test(r.value)))
  // ln 은 마지막 인자(만들 링크)만 쓴다 — 링크가 가리킬 대상(`ln -s ~/.zshrc x`)은 바뀌지 않는다
  const own = inv.name === 'ln' ? harnessWriteTargets(inv).slice(-1) : harnessWriteTargets(inv)
  return [...own, ...redirs]
}

function classifyWriteLocation(inv, ctx, add) {
  for (const t of writeLocationTargets(inv)) {
    if (DEV_PATH_RE.test(cleanValue(t.value))) continue
    const r = resolveRmTarget(t, ctx.vcwd)
    if (!r) continue
    const real = realLocation(r.abs) || r.abs
    const label = inv.name || '리다이렉트'
    if (inTcgStateDir(r.abs) || inTcgStateDir(real)) {
      add('deny', `${label} 로 task-confirm-guard 승인 상태 파일을 쓰는 것은 차단됩니다 — 사용자 승인은 대화로만 기록됩니다.`)
      return
    }
    const inProject = !!ctx.root && (isAncestorOrSame(ctx.root, r.abs) || isAncestorOrSame(ctx.root, real))
    const inSafe = inProject || isUnderAllowed(real, ctx.allowedDirs) || isUnderTempDir(r.abs) || isUnderTempDir(real)
    if (_isProtectedWritePath && (_isProtectedWritePath(r.abs) || _isProtectedWritePath(real))) {
      add(inSafe ? 'ask' : 'deny', `${label} 로 보호 파일(${IS_WIN ? path.posix.basename(r.abs) : path.basename(r.abs)})을 쓰는 것은 ${inSafe ? '사용자 확인이 필요합니다' : '차단됩니다'} — Write 도구라면 protect-secrets 가 막는 파일입니다.`)
      continue
    }
    if (!inSafe) add('ask', `${label} 로 프로젝트·허용 폴더 밖(${r.abs})에 쓰는 것은 사용자 확인이 필요합니다.`)
  }
}

// git push 인자 → { remote, refspecs, force, pushAll, deleteMode } (branch-protection 과 공용)
const PUSH_VALUE_OPTS = new Set(['-o', '--push-option', '--repo', '--receive-pack', '--exec'])
function parsePushArgs(args) {
  const positional = []
  let force = false, pushAll = false, deleteMode = false
  for (let i = 0; i < args.length; i++) {
    const v = cleanValue(args[i].value)
    if (v === '--') { positional.push(...args.slice(i + 1)); break }
    if (v.startsWith('-') && v.length > 1) {
      if (PUSH_VALUE_OPTS.has(v)) { i++; continue }
      if (/^--force(?:$|=|-with-lease|-if-includes)/.test(v)) force = true
      else if (/^--(?:all|mirror|branches)$/.test(v)) pushAll = true
      else if (v === '--delete') deleteMode = true
      else if (/^-[A-Za-z0-9]+$/.test(v)) { if (v.includes('f')) force = true; if (v.includes('d')) deleteMode = true }
      continue
    }
    positional.push(args[i])
  }
  return { remote: positional[0] || null, refspecs: positional.slice(1), force, pushAll, deleteMode }
}

// reset --hard 대상 커밋까지 되돌릴 때 지워지는 커밋 중 이미 푸시된(원격 브랜치에 있는) 것의 수
// 반환: 숫자(0 = 전부 미푸시 → 자동 허용) | null(판정 불가 → 사용자 확인)
// execFileSync + 인자 배열 — 셸을 거치지 않으므로 대상 문자열로 명령 주입 불가. 대상은 ref 문자만 허용
const GIT_REF_RE = /^[A-Za-z0-9_.\/@{}^~-]{1,200}$/
function pushedCommitsDiscarded(target, dir) {
  if (!GIT_REF_RE.test(target) || target.startsWith('-')) return null
  const { execFileSync } = require('child_process')
  const run = (args) => execFileSync('git', args, { cwd: dir || undefined, encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  try {
    const total = Number(run(['rev-list', '--count', `${target}..HEAD`]))
    const unpushed = Number(run(['rev-list', '--count', `${target}..HEAD`, '--not', '--remotes']))
    if (!Number.isInteger(total) || !Number.isInteger(unpushed)) return null
    return total - unpushed
  } catch { return null }
}

function classifyGit(g, add, ctx) {
  if (!g || !g.sub) return
  if (g.subDyn) { add('unknown', 'git 서브커맨드를 정적으로 해석할 수 없습니다.'); return }
  const vals = g.args.map(a => cleanValue(a.value))
  if (g.sub === 'push') {
    const p = parsePushArgs(g.args)
    const force = p.force || p.refspecs.some(r => cleanValue(r.value).startsWith('+'))
    if (force) add('deny', 'force push는 히스토리를 덮어씁니다. 직접 실행하세요.')
    else add('ask', 'git push 는 사용자 확인이 필요합니다 (커밋·푸시는 명시적 요청 시에만).')
    return
  }
  if (g.sub === 'commit') { add('ask', 'git commit 은 사용자 확인이 필요합니다 (커밋·푸시는 명시적 요청 시에만).'); return }
  // reset --hard (2026-10-06 사용자 결정): 커밋 안 한 작업·푸시 안 된 커밋만 지우면 자동 허용(의도된 리셋),
  // 이미 푸시된 커밋을 지우면 차단(원격과 어긋나 되돌리기 어려움), 판정 불가(동적 대상·git 실패)면 확인.
  // git clean -f 는 자동 허용으로 전환 (같은 결정 — 이전엔 확인)
  if (g.sub === 'reset' && vals.includes('--hard')) {
    const targetArg = g.args.find(a => !cleanValue(a.value).startsWith('-'))
    if (targetArg && targetArg.dyn) { add('ask', 'git reset --hard 대상이 변수라 푸시 여부를 판정할 수 없습니다. 사용자 확인이 필요합니다.'); return }
    const target = targetArg ? cleanValue(targetArg.value) : 'HEAD'
    if (target === 'HEAD') return // 커밋 안 한 작업만 버림
    let dir = ctx && ctx.vcwd
    if (g.dir) {
      const r = resolveRmTarget(g.dir, dir)
      dir = r && !r.glob ? r.abs : null
      if (!dir) { add('ask', 'git -C 경로를 해석할 수 없어 푸시 여부를 판정할 수 없습니다. 사용자 확인이 필요합니다.'); return }
    }
    if (!dir) { add('ask', '현재 디렉토리를 알 수 없어 reset 대상의 푸시 여부를 판정할 수 없습니다. 사용자 확인이 필요합니다.'); return }
    const pushed = pushedCommitsDiscarded(target, dir)
    if (pushed === null) { add('ask', `git reset --hard ${target} 의 푸시 여부를 판정할 수 없습니다. 사용자 확인이 필요합니다.`); return }
    if (pushed > 0) add('deny', `git reset --hard ${target} 는 이미 푸시된 커밋 ${pushed}개를 지웁니다. 원격과 어긋나므로 차단합니다 — 직접 실행하세요.`)
    return
  }
}

// ── 2026-10-06 사용자 결정 추가 분류 ────────────────────────────────────────
// 개인키·인증 파일 판정은 protect-secrets.js 와 공유 (Read 도구와 Bash 의 판정 일관성)
let _isSecretReadPath = null
try { _isSecretReadPath = require('./protect-secrets.js').isSecretReadPath } catch { /* 미설치 → 검사 생략 */ }

// 인자 중 개인키·인증 파일(또는 ~/.ssh 디렉토리)을 가리키는 것이 있으면 차단 — cat·cp·grep·scp 등 명령 무관
// grep 류의 검색어 인자 — 경로가 아니다 (2026-11-06: `grep -c -- 'id_rsa' file` 이 비밀 파일 접근으로 오탐 차단).
// -e/--regexp 값과, -e·-f 가 없을 때의 첫 위치 인자(단 / 나 ~ 가 든 것은 파일일 수 있어 계속 검사). -f/--file 값은 파일이라 계속 검사
const GREP_LIKE = new Set(['grep', 'egrep', 'fgrep', 'zgrep', 'rg', 'ag', 'ack'])
const GREP_VALUE_OPTS = new Set(['-m', '--max-count', '-A', '-B', '-C', '--context', '--after-context', '--before-context', '-d', '-D',
  '-g', '--glob', '--iglob', '-t', '--type', '-T', '--type-not', '-j', '--threads', '-M', '--max-columns', '--color', '--colors', '--label', '--exclude', '--include', '--exclude-dir'])
function grepPatternArgs(args) {
  const skip = new Set()
  let hasE = false, endOpts = false, firstPos = null
  for (let k = 0; k < args.length; k++) {
    const v = cleanValue(args[k].value)
    if (!endOpts && v === '--') { endOpts = true; continue }
    if (!endOpts && v.length > 1 && v.startsWith('-')) {
      if (v === '-e' || v === '--regexp') { hasE = true; if (args[k + 1]) skip.add(args[k + 1]); k++; continue }
      if (/^--regexp=/.test(v) || /^-e./.test(v)) { hasE = true; skip.add(args[k]); continue }
      if (v === '-f' || v === '--file' || /^--file=/.test(v) || /^-f./.test(v)) { hasE = true; if (v === '-f' || v === '--file') k++; continue }
      if (GREP_VALUE_OPTS.has(v)) k++
      continue
    }
    if (firstPos === null) firstPos = args[k]
  }
  if (!hasE && firstPos && !/[/~]/.test(cleanValue(firstPos.value)) && !firstPos.dyn) skip.add(firstPos)
  return skip
}

function classifySecretArgs(inv, ctx, add) {
  if (!_isSecretReadPath) return
  let skip = null
  if (GREP_LIKE.has(inv.name)) skip = grepPatternArgs(inv.args)
  else if (inv.name === 'git' && inv.git && inv.git.sub === 'grep') skip = grepPatternArgs(inv.git.args)
  // 입력 리다이렉트(cat < ~/.ssh/id_rsa)도 읽기 — here-string 은 글자라 제외
  const inRedirs = (inv.redirs || []).filter(r => !r.out && !r.here && !r.dup)
  for (const a of [...inv.args, ...inRedirs]) {
    if (skip && skip.has(a)) continue
    const raw = cleanValue(a.value)
    if (a.dyn && !/^\$(?:\{HOME\}|HOME)(?![A-Za-z0-9_])/.test(raw)
      && !(IS_WIN && /^\$\{?(?:USERPROFILE|APPDATA|LOCALAPPDATA)(?![A-Za-z0-9_])/.test(raw))) continue
    const v = raw.replace(/^-{1,2}[A-Za-z][\w-]*=/, '') // --file=~/.ssh/id_rsa
    if (!v || v.startsWith('-')) continue
    const r = resolveRmTarget({ ...a, value: v }, ctx.vcwd)
    if (r && _isSecretReadPath(r.abs)) { add('deny', `개인키·인증 파일(${v}) 접근은 차단됩니다. 필요하면 사용자가 직접 확인하세요.`); return }
  }
}

// gh — 조회는 자동, GitHub 에 반영되는 쓰기는 확인, 레포 삭제는 차단
const GH_VALUE_FLAGS = new Set(['-R', '--repo', '--hostname'])
const GH_READONLY_TOP = new Set(['auth', 'config', 'extension', 'alias', 'completion', 'help', 'version', 'status', 'search', 'browse'])
const GH_READONLY_ACTIONS = new Set(['view', 'list', 'ls', 'status', 'diff', 'checks', 'download', 'clone', 'checkout', 'watch', 'browse'])
function classifyGh(vals, add) {
  const pos = []
  for (let i = 0; i < vals.length; i++) {
    const v = vals[i]
    if (GH_VALUE_FLAGS.has(v)) { i++; continue }
    if (v.startsWith('-')) { if (pos.length === 0 && (v === '--version' || v === '--help')) return; continue }
    pos.push(v)
    if (pos.length === 2) break
  }
  const [sub, action] = pos
  if (!sub || GH_READONLY_TOP.has(sub)) return
  if (sub === 'api') {
    let write = false
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i]
      const m = /^(?:-X|--method)(?:=(.*))?$/.exec(v) || /^-X(.+)$/.exec(v)
      if (m) { const method = (m[1] !== undefined ? m[1] : vals[i + 1] || '').toUpperCase(); if (method !== 'GET') write = true }
      if (/^(?:-f|-F|--field|--raw-field|--input)(?:=|$)/.test(v)) write = true
    }
    if (write) add('ask', 'gh api 쓰기 요청(POST·PATCH·DELETE 등)은 GitHub 에 바로 반영돼 사용자 확인이 필요합니다.')
    return
  }
  if (sub === 'repo' && action === 'delete') { add('deny', 'gh repo delete 는 되돌릴 수 없어 차단됩니다. 직접 실행하세요.'); return }
  if (action && GH_READONLY_ACTIONS.has(action)) return
  add('ask', `gh ${sub}${action ? ' ' + action : ''} 는 GitHub 에 반영되는 작업이라 사용자 확인이 필요합니다.`)
}

// curl·wget 파일 업로드 — 데이터 유출 경로
function classifyUpload(nm, vals, add) {
  const reason = `${nm} 로 파일을 외부에 업로드하는 요청은 사용자 확인이 필요합니다.`
  if (nm === 'curl') {
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i]
      if (/^(?:-F|--form|--form-string|-T|--upload-file)(?:=|$)/.test(v) || (/^-[A-Za-z]*[FT]/.test(v) && !v.startsWith('--'))) { add('ask', reason); return }
      const dm = /^(?:-d|--data|--data-binary|--data-urlencode|--data-raw|--json)(?:=(.*))?$/.exec(v) || /^-d(.+)$/.exec(v)
      if (dm) {
        const val = dm[1] !== undefined ? dm[1] : (vals[i + 1] || '')
        if (/(?:^|=)@/.test(val)) { add('ask', reason); return }
      }
    }
  } else if (nm === 'wget') {
    if (vals.some(v => /^--(?:post-file|body-file)(?:=|$)/.test(v))) add('ask', reason)
  }
}

// 프로세스가 이 Claude 세션의 자손인가 — ps 로 부모를 거슬러 올라가 확인
// 세션 PID = 훅 프로세스의 조상 중 이름이 claude 인 가장 가까운 프로세스 (테스트는 BASH_GUARD_TEST_SESSION_PID 로 지정)
let _procTable = null
function procTable() {
  if (_procTable) return _procTable
  _procTable = new Map()
  // 윈도우: `ps -axo` 가 없다(Git Bash ps 는 옵션이 다름) → 빈 표 = 판정 불가 → kill -9 는 항상 확인 (보수적)
  if (IS_WIN) return _procTable
  try {
    const out = require('child_process').execFileSync('ps', ['-axo', 'pid=,ppid=,comm='], { encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] })
    for (const line of out.split('\n')) {
      const m = /^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(line)
      if (m) _procTable.set(Number(m[1]), { ppid: Number(m[2]), comm: m[3].trim() })
    }
  } catch { /* ps 실패 → 빈 표 = 판정 불가 */ }
  return _procTable
}
function sessionPid() {
  const forced = Number(process.env.BASH_GUARD_TEST_SESSION_PID)
  if (Number.isInteger(forced) && forced > 1) return forced
  const t = procTable()
  let pid = process.ppid
  for (let hop = 0; pid > 1 && hop < 64; hop++) {
    const p = t.get(pid)
    if (!p) return null
    if (/(?:^|\/)claude(?:\.exe)?$/i.test(p.comm)) return pid
    pid = p.ppid
  }
  return null
}
function isSessionDescendant(pid, root) {
  if (!root || pid === root) return false
  const t = procTable()
  let cur = pid
  for (let hop = 0; cur > 1 && hop < 64; hop++) {
    const p = t.get(cur)
    if (!p) return false
    if (p.ppid === root) return true
    cur = p.ppid
  }
  return false
}

// docker 정리(prune)·볼륨 삭제, 일괄·강제 종료 — 다른 프로젝트 데이터·사용자 프로세스에 영향
function classifyDockerKill(nm, vals, add) {
  if (nm === 'docker' || nm === 'podman') {
    if (vals.includes('prune') || (vals.includes('volume') && (vals.includes('rm') || vals.includes('remove')))) {
      add('ask', `${nm} 정리·볼륨 삭제는 누가 만들었든 전부 지워 사용자 확인이 필요합니다.`)
    }
    return
  }
  if (nm === 'killall' || nm === 'pkill') { add('ask', `${nm} 는 이름으로 여러 프로세스를 한꺼번에 종료해 사용자 확인이 필요합니다.`); return }
  if (nm !== 'kill') return
  const forceIdx = vals.findIndex((v, i) => /^-(?:9|KILL|SIGKILL)$/i.test(v) || (v === '-s' && /^(?:9|KILL|SIGKILL)$/i.test(vals[i + 1] || '')))
  if (forceIdx < 0) return
  const targets = vals.filter((v, i) => !v.startsWith('-') && !(i > 0 && vals[i - 1] === '-s'))
  const root = sessionPid()
  const mine = targets.length > 0 && root && targets.every(v => /^\d+$/.test(v) && isSessionDescendant(Number(v), root))
  if (!mine) add('ask', 'kill -9 대상이 이 Claude 세션이 띄운 프로세스가 아니거나 확인할 수 없습니다. 사용자 확인이 필요합니다.')
}

// 명령 전체 위험 분류 — PreToolUse·PermissionRequest 공용 (판정 일관성)
// 반환: { level: 'deny'|'ask'|'unknown'|null, reason }
const _classifyCache = new Map()
// ── 보호 파일(SKILL.md·verification.md·memory/) Bash 쓰기 — 명령 단위 판정 (2026-11-06 점검) ──
// DENY_PATTERNS 는 리다이렉트·sed -i·tee 만 봐서 `cp x SKILL.md`·`truncate -s0`·`git checkout HEAD~3 -- SKILL.md`·`patch`·`ex`·
// `node -e writeFileSync(…)`·`rm -rf memory`·글롭 `SKILL.m?` 가 지나갔다. 쓰기 대상 인자를 받는 명령의 대상을 보고 차단한다.
// memory 는 프로젝트 루트의 memory/ 와 Claude 설정 폴더의 projects/<프로젝트>/memory 만 (src/memory-cache 같은 이름은 무관)
const PROTECTED_NAMES = ['skill.md', 'verification.md']
const PROTECTED_RM = new Set(['rm', 'unlink', 'rmdir', 'shred', 'srm', 'trash'])
const EDITOR_CMDS = new Set(['ex', 'vi', 'vim', 'nvim', 'gvim', 'view', 'ed', 'red', 'nano', 'pico', 'emacs', 'joe', 'mcedit', 'patch'])
const EDITOR_VALUE_OPTS = new Set(['-c', '-S', '--cmd', '-u', '-i', '-p', '-r', '-o', '-D', '-F', '-B', '-V', '--eval', '-l', '--load'])
const INLINE_CODE_FLAGS = /^(?:-e|-E|-c|-p|-r|--eval|--print|--command|--exec)$/
const PROTECTED_CODE_NAME_RE = /skill\.md|verification\.md|(?:^|[\s'"`/(,=])memory(?:[\s'"`/),]|$)/i
const WRITE_CODE_RE = /write|append|unlink|\brm|rmdir|rename|copy|truncate|remove|delete|move|shutil|symlink|chmod|open\s*\([^)]*['"][^'"]*[wax+][^'"]*['"]|createWriteStream|>\s*['"]?\S*(?:skill|verification|memory)/i

function globSegRe(seg) {
  let re = ''
  for (let i = 0; i < seg.length; i++) {
    const ch = seg[i]
    if (ch === '*') re += '.*'
    else if (ch === '?') re += '.'
    else if (ch === '[') {
      const j = seg.indexOf(']', i + 1)
      if (j < 0) { re += '\\['; continue }
      re += '[' + seg.slice(i + 1, j).replace(/^!/, '^').replace(/\\/g, '\\\\') + ']'
      i = j
    } else re += ch.replace(/[.+^${}()|\\]/g, '\\$&')
  }
  try { return new RegExp(`^${re}$`, 'i') } catch { return null }
}
function segMatches(seg, name) {
  if (!seg) return false
  if (seg.toLowerCase() === name) return true
  if (!/[*?[]/.test(seg)) return false
  // `*.md`·`*` 같은 넓은 글롭은 이름 앞 3글자가 글자 그대로 들어 있을 때만 보호 이름으로 본다(실제 항목은 protectedLabel 이 폴더를 읽어 판정)
  if (!seg.replace(/\[[^\]]*\]|[*?]/g, '').toLowerCase().includes(name.slice(0, 3))) return false
  const re = globSegRe(seg)
  return !!re && re.test(name)
}

// 단어 → 절대경로 (글롭 글자는 그대로 둔다). 모르는 변수면 null
function protectedAbsOf(w, ctx) {
  let v = cleanValue(w.value)
  if (w.dyn) {
    const m = /^\$(?:\{HOME\}|HOME)(?=\/|$)/.exec(v)
    if (!m || !HOME_DIR) return null
    v = HOME_DIR + v.slice(m[0].length)
  } else if (w.tilde && HOME_DIR && (v === '~' || v.startsWith('~/'))) v = HOME_DIR + v.slice(1)
  if (IS_WIN) v = W.msysToWin(W.toSlash(v, true), true)
  if (!path.isAbsolute(v)) {
    const base = ctx.vcwd || ctx.startCwd
    if (!base) return null
    v = path.join(base, v)
  }
  return path.normalize(v)
}

// 보호 대상이면 사람이 읽을 이름, 아니면 null
function protectedLabel(abs, ctx) {
  if (!abs) return null
  const check = (p) => {
    const segs = p.split(/[\\/]+/).filter(Boolean)
    const last = segs[segs.length - 1]
    for (const n of PROTECTED_NAMES) if (segMatches(last, n)) return n === 'skill.md' ? 'SKILL.md' : 'verification.md'
    if (ctx.root) {
      const rel = path.relative(ctx.root, p)
      if (rel && !rel.startsWith('..') && !path.isAbsolute(rel) && segMatches(rel.split(/[\\/]+/)[0], 'memory')) return 'memory/'
    }
    for (let i = 2; i < segs.length; i++) {
      if (segMatches(segs[i], 'memory') && segMatches(segs[i - 2], 'projects')) return 'memory/'
    }
    return null
  }
  // 마지막 조각만 글롭이고 폴더가 있으면 실제 항목으로 판정 — `rm docs/*.md` 는 통과, `rm skills/x/*` 는 그 안의 SKILL.md 때문에 차단
  const dir = path.dirname(abs)
  const lastSeg = path.basename(abs)
  if (/[*?[]/.test(lastSeg) && !/[*?[]/.test(dir)) {
    let entries = null
    try { entries = fs.readdirSync(dir) } catch { /* 폴더 없음 — 아래 이름 판정 */ }
    if (entries) {
      const re = globSegRe(lastSeg)
      for (const e of entries) {
        if (!re || !re.test(e)) continue
        const h = check(path.join(dir, e))
        if (h) return h
      }
      return check(path.join(dir, '\0'))
    }
  }
  const hit = check(abs)
  if (hit) return hit
  const real = /[*?[]/.test(abs) ? null : realLocation(abs)
  return real && real !== abs ? check(real) : null
}

function nonOptArgs(args, valueOpts) {
  const out = []
  let end = false
  for (let k = 0; k < args.length; k++) {
    const v = cleanValue(args[k].value)
    if (!end && v === '--') { end = true; continue }
    if (!end && v.length > 1 && (v.startsWith('-') || v.startsWith('+'))) {
      if (valueOpts && valueOpts.has(v)) k++
      continue
    }
    out.push(args[k])
  }
  return out
}

function protectedWriteTargets(inv) {
  const nm = inv.name
  const targets = [...writeLocationTargets(inv)]
  if (nm === 'ln') targets.push(...harnessWriteTargets(inv).slice(-1))
  if (PROTECTED_RM.has(nm)) targets.push(...nonOptArgs(inv.args))
  if (EDITOR_CMDS.has(nm)) {
    targets.push(...nonOptArgs(inv.args, EDITOR_VALUE_OPTS))
    for (let k = 0; k < inv.args.length - 1; k++) if (cleanValue(inv.args[k].value) === '-o') targets.push(inv.args[k + 1]) // patch -o
  }
  if (nm === 'dd') for (const a of inv.args) { const v = cleanValue(a.value); if (v.startsWith('of=')) targets.push({ ...a, value: v.slice(3), tilde: v.slice(3).startsWith('~') }) }
  if (nm === 'git' && inv.git && ['checkout', 'restore', 'rm', 'mv'].includes(inv.git.sub)) {
    targets.push(...nonOptArgs(inv.git.args, new Set(['-s', '--source', '-b', '-B', '--orphan', '--conflict'])))
  }
  return targets
}

function classifyProtectedWrite(inv, ctx, add) {
  const nm = inv.name
  const deny = (label) => add('deny', `${label}은(는) Bash 로 쓰거나 지울 수 없습니다(${nm || '리다이렉트'}). Write/Edit 도구를 사용하세요 — Write/Edit 에 걸린 검증·동기화 훅을 거쳐야 합니다. (읽기 전용 cat·grep·diff 는 허용)`)
  for (const t of protectedWriteTargets(inv)) {
    const label = protectedLabel(protectedAbsOf(t, ctx), ctx)
    if (label) { deny(label); return }
  }
  // cp /tmp/SKILL.md .claude/skills/x/ — 목적지가 폴더면 원본 이름으로 생긴다
  if (HARNESS_WRITE_DEST.has(nm)) {
    const pos = nonOptArgs(inv.args, new Set(['-t', '-m', '--mode', '-o', '-g']))
    if (pos.length >= 2) {
      const destAbs = protectedAbsOf(pos[pos.length - 1], ctx)
      let isDir = /[\\/]$/.test(cleanValue(pos[pos.length - 1].value))
      if (!isDir && destAbs) { try { isDir = fs.statSync(destAbs).isDirectory() } catch { /* 없음 */ } }
      if (destAbs && isDir && !isUnderTempDir(destAbs)) {
        for (const s of pos.slice(0, -1)) {
          const sAbs = protectedAbsOf(s, ctx)
          const label = sAbs && protectedLabel(path.join(destAbs, path.basename(sAbs)), ctx)
          if (label) { deny(label); return }
        }
      }
    }
  }
  // node -e "fs.writeFileSync('SKILL.md')" · python3 -c "open('memory/x','w')"
  if (isInterpreterName(nm) && !SHELL_NAMES.has(nm)) {
    for (let k = 0; k < inv.args.length - 1; k++) {
      if (!INLINE_CODE_FLAGS.test(cleanValue(inv.args[k].value))) continue
      const code = cleanValue(inv.args[k + 1].value)
      if (PROTECTED_CODE_NAME_RE.test(code) && WRITE_CODE_RE.test(code)) { deny(/memory/i.test(code) && !/skill|verification/i.test(code) ? 'memory/' : 'SKILL.md·verification.md'); return }
    }
  }
}

// find -delete / find -exec rm … — rm 과 같은 기준으로 시작 경로를 본다. 조건(-name 등)이 있으면 프로젝트·현재 폴더 자체는 허용
const FIND_FILTER_RE = /^-(?:i?name|i?path|i?wholename|i?regex|type|mtime|mmin|atime|amin|ctime|cmin|newer\w*|size|empty|user|group|perm|links|inum|samefile|maxdepth|mindepth|prune)$/
function classifyFindDelete(inv, ctx, add) {
  const vals = inv.args.map(a => cleanValue(a.value))
  let deletes = vals.includes('-delete')
  for (let k = 0; k < vals.length; k++) {
    if (/^-(?:exec|execdir|ok|okdir)$/.test(vals[k]) && PROTECTED_RM.has((vals[k + 1] || '').replace(/^.*\//, ''))) deletes = true
  }
  if (!deletes) return
  const roots = []
  let k = 0
  while (k < inv.args.length && /^-[HLP]$|^-O\d$/.test(vals[k])) k++
  if (vals[k] === '-D') k += 2
  for (; k < inv.args.length; k++) {
    if (/^[-(!)]/.test(vals[k]) || vals[k] === ',') break
    roots.push(inv.args[k])
  }
  if (!roots.length) roots.push({ ...newWord(), value: '.' })
  const filtered = vals.some(v => FIND_FILTER_RE.test(v))
  for (const w of roots) {
    const r = resolveRmTarget(w, ctx.vcwd)
    if (filtered && r && !r.glob && ((ctx.root && sameDir(r.abs, ctx.root)) || (ctx.startCwd && sameDir(r.abs, ctx.startCwd)))) continue
    classifyRm({ args: [{ ...newWord(), value: '-r' }, w] }, ctx, (level, reason) => add(level, `find 삭제: ${reason}`))
  }
}

function classifyShell(cmd, opts = {}) {
  const cwdIn = opts.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd()
  const harness = harnessRoots()
  const key = `${opts.skipRm ? 1 : 0}\0${cwdIn}\0${(opts.allowedDirs || []).join(':')}\0${harness.join(':')}\0${process.env.CLAUDE_BASH_GUARD_ALLOWED_DIRS || ''}\0${cmd}`
  if (_classifyCache.has(key)) return _classifyCache.get(key)

  let best = { level: null, reason: '' }
  const add = (level, reason) => { if ((LEVEL_RANK[level] || 0) > (LEVEL_RANK[best.level] || 0)) best = { level, reason } }

  const acc = analyzeShell(cmd)
  for (const u of acc.unknown) add('unknown', `명령을 정적으로 해석할 수 없습니다(${u}).`)

  let startCwd = null
  try { startCwd = path.resolve(cwdIn) } catch { /* ignore */ }
  const ctx = {
    vcwd: startCwd,
    startCwd,
    root: startCwd ? (findProjectRoot(startCwd) || startCwd) : null,
    allowedDirs: opts.allowedDirs || getAllowedDirs(cwdIn),
    harness,
  }
  // 하네스 폴더 자체에서 작업 중이면(프로젝트 루트가 그 안) 보호하지 않는다
  if (ctx.root && harness.some(d => isAncestorOrSame(d, ctx.root))) ctx.harness = []

  const pipelines = {}
  for (const inv of acc.invocations) {
    (pipelines[inv.pipeline] = pipelines[inv.pipeline] || []).push(inv)
    if (inv.dynamicName) { add('unknown', '명령 이름이 변수·치환이라 정적으로 판정할 수 없습니다.'); continue }
    if (inv.sudo) add('ask', 'sudo/doas 권한 상승 명령은 사용자 확인이 필요합니다.')
    const nm = inv.name
    const vals = inv.args.map(a => cleanValue(a.value))

    if (nm === 'cd' || nm === 'pushd' || nm === 'popd') {
      const t = inv.args.find(a => !/^-[LPe@]$/.test(a.value))
      if (inv.subshell || nm === 'popd') { ctx.vcwd = null; continue } // 서브셸 cd 는 부모에 영향 없음 → 추적 포기(보수)
      if (!t) { ctx.vcwd = HOME_DIR; continue }
      const r = resolveRmTarget(t, ctx.vcwd)
      ctx.vcwd = r && !r.glob && t.value !== '-' ? r.abs : null
      continue
    }
    classifySecretArgs(inv, ctx, add)
    classifyHarnessWrite(inv, ctx, add)
    classifySourceWrite(inv, ctx, add)
    classifyWriteLocation(inv, ctx, add)
    classifyProtectedWrite(inv, ctx, add)
    if (nm === 'find') classifyFindDelete(inv, ctx, add)
    if (WIN_SHELLS.has(nm)) { add('ask', `${nm} 로 넘긴 명령은 판정할 수 없습니다. 사용자 확인이 필요합니다.`); continue }
    if (nm === 'git') { classifyGit(inv.git, add, ctx); continue }
    if (nm === 'gh') { classifyGh(vals, add); continue }
    if (nm === 'curl' || nm === 'wget') { classifyUpload(nm, vals, add); continue }
    if (['docker', 'podman', 'kill', 'killall', 'pkill'].includes(nm)) { classifyDockerKill(nm, vals, add); continue }
    if (PUBLISHERS.has(nm)) {
      const cut = vals.indexOf('--')
      const head = (cut >= 0 ? vals.slice(0, cut) : vals).map(v => v.toLowerCase())
      if (head.includes('publish')) add('ask', '패키지 publish 는 사용자 확인이 필요합니다.')
      continue
    }
    if (nm === 'rm') { if (!opts.skipRm) classifyRm(inv, ctx, add); continue }
    if (nm === 'chmod') {
      if (vals.some(v => /^0?777$/.test(v) || /^(?:a|ugo)[+=]rwx$/.test(v))) add('deny', '777 권한 설정은 보안 위험입니다.')
      continue
    }
    if (nm === 'dd') { add('ask', 'dd 는 디스크·파일을 덮어쓸 수 있습니다. 사용자 확인이 필요합니다.'); continue }
    if (/^(?:mkfs|newfs)/.test(nm) || ['shutdown', 'reboot', 'halt', 'poweroff'].includes(nm)
      || (nm === 'diskutil' && vals.some(v => /^(?:erase|partition|zero|random|secureErase)/i.test(v)))) {
      add('ask', '시스템·디스크 변경 명령은 사용자 확인이 필요합니다.'); continue
    }
    // 원격 코드를 치환으로 받아 실행: bash <(curl …), sh -c "$(curl …)", eval "$(curl …)"
    if ((isInterpreterName(nm) || EXEC_SINKS.has(nm)) && inv.argSubst && acc.invocations.some(x => x.fromSub && FETCHERS.has(x.name))) {
      add('deny', '원격 스크립트 실행(치환으로 받은 코드 실행)은 차단됩니다.')
    }
  }
  // 원격 코드를 파이프로 받아 실행: curl … | sh / python3 / sudo bash
  for (const list of Object.values(pipelines)) {
    const f = list.findIndex(x => FETCHERS.has(x.name))
    if (f < 0) continue
    if (list.slice(f + 1).some(x => (isInterpreterName(x.name) || EXEC_SINKS.has(x.name)) && readsStdin(x))) {
      add('deny', '원격 스크립트 실행(curl|wget → 인터프리터)은 차단됩니다.')
    }
  }

  if (_classifyCache.size > 200) _classifyCache.clear()
  _classifyCache.set(key, best)
  return best
}

// 안전 패턴(allow) 함수들의 공통 게이트 — commit/push/publish/원격실행/동적명령이 섞이면 자동 허용 금지
// rm 경로는 각 함수가 allowedDirs 기준으로 따로 검사하므로 여기선 제외
function hasNonRmRisk(cmd, allowedDirs) {
  return classifyShell(cmd, { skipRm: true, allowedDirs: allowedDirs || [] }).level !== null
}

// ── 같은 명령 안의 고정값 변수 풀기 (2026-10-21 사용자 요청) ───────────────────────────────
// `G=/경로; ls $G` · `GC="git -c core.hooksPath=.githooks"; $GC status` 처럼 같은 명령 안에서 글자 그대로 넣은 값을
// 풀어 실제로 무엇이 실행되는지 본다. 풀어 본 결과는 ① 변수에 숨긴 위험(deny)을 막고 ② **읽기 전용일 때만** 새로
// 자동 허용하는 데만 쓴다 — 쓰기·삭제·실행은 풀어도 지금처럼 확인(사용자 결정: "읽기에 대해서만").
// 값을 확실히 알 수 없으면 풀지 않는다(조건·반복·함수·서브셸 안 대입·치환·read/declare/eval 등) → 지금처럼 판정 불가.
const RESOLVE_BAIL_WORDS = new Set(['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do', 'done', 'case', 'esac',
  'select', 'function', 'read', 'declare', 'typeset', 'local', 'readonly', 'mapfile', 'readarray', 'getopts', 'let',
  'eval', 'source', '.', 'alias', 'set', 'shopt', 'trap', 'exec', '{', '}', '(', ')', '[[', '((', 'coproc', 'time'])
// 값이 바뀌면 다른 프로그램이 실행되거나 단어 나누기가 달라지는 변수 — 대입이 있으면 아예 풀지 않는다
const SENSITIVE_VAR_RE = /^(?:PATH|IFS|CDPATH|ENV|BASH_ENV|SHELLOPTS|BASHOPTS|PROMPT_COMMAND|PS4|HOME|LD_\w+|DYLD_\w+|GIT_\w+|PAGER|LESS\w*|MANPAGER|EDITOR|VISUAL|NODE_OPTIONS|PYTHON\w*|PERL5\w*|RUBY\w*|GCONV_PATH|TMPDIR)$/
const SAFE_VALUE_RE = /^[A-Za-z0-9_.\/:@%+,= -]*$/ // 따옴표·glob·~·셸 기호 없는 값만 (공백은 허용 — 단어 나누기는 bash 와 같다)
const MAX_RESOLVE_LEN = 20000

// 최상위 문장으로 나눈다. 판정을 흐릴 구조가 보이면 null (풀지 않음)
function splitTopLevelStatements(src) {
  const parts = []
  let buf = '', quote = null, depth = 0, pipe = false, atWord = true, prevSep = null
  const push = (sep) => { parts.push({ text: buf, sepBefore: prevSep, sep, pipe }); buf = ''; pipe = false; prevSep = sep; atWord = true }
  for (let i = 0; i < src.length; i++) {
    const c = src[i], nx = src[i + 1]
    if (quote === "'") { buf += c; if (c === "'") quote = null; continue }
    if (c === '\\') { buf += c + (nx || ''); i++; atWord = false; continue }
    if (quote === '"') { buf += c; if (c === '"') quote = null; else if (c === '`') return null; else if (c === '$' && nx === '(') { buf += nx; i++; depth++ } else if (c === ')' && depth > 0) depth--; continue }
    if (c === "'" || c === '"') { quote = c; buf += c; atWord = false; continue }
    if (c === '`') return null
    if (c === '<' && nx === '<') return null // heredoc·here-string
    if (c === '(' || (c === '$' && nx === '(')) { if (c === '$') { buf += c; i++ } buf += '('; depth++; atWord = true; continue }
    if (c === ')') { if (depth === 0) return null; depth--; buf += c; atWord = false; continue }
    if (depth > 0) {
      if (atWord && /^[A-Za-z_][A-Za-z0-9_]*\+?=/.test(src.slice(i))) return null // 서브셸·치환 안 대입 — 바깥 값과 달라짐
      buf += c; atWord = /[\s;&|(]/.test(c); continue
    }
    if (c === ';' || c === '\n') { push(c); continue }
    if (c === '&' && nx === '&') { push('&&'); i++; continue }
    if (c === '|' && nx === '|') { push('||'); i++; continue }
    if (c === '&') { if (nx === '>' || src[i - 1] === '>') { buf += c; continue } push('&'); continue }
    if (c === '|') { pipe = true; buf += c; atWord = true; continue }
    buf += c; atWord = /\s/.test(c)
  }
  if (quote || depth) return null
  push(null)
  return parts
}

// $NAME·${NAME} 를 아는 값으로 바꾼다 (작은따옴표 안·\$ 는 그대로, ${NAME:-…} 같은 연산은 그대로 둔다)
function substituteVars(text, vars) {
  let out = '', quote = null, changed = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quote === "'") { out += c; if (c === "'") quote = null; continue }
    if (c === '\\') { out += c + (text[i + 1] || ''); i++; continue }
    if (c === "'" && quote !== '"') { quote = "'"; out += c; continue }
    if (c === '"') { quote = quote === '"' ? null : '"'; out += c; continue }
    if (c === '$') {
      const m = /^\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))/.exec(text.slice(i))
      const name = m && (m[1] || m[2])
      if (name && vars.has(name) && vars.get(name) !== null) { out += vars.get(name); i += m[0].length - 1; changed = true; continue }
    }
    out += c
  }
  return { text: out, changed }
}

// 대입 오른쪽 값 → 글자 그대로의 값 (모르면 null)
function literalAssignValue(rhs, vars) {
  let v = null
  const sq = /^'([^']*)'$/.exec(rhs)
  if (sq) v = sq[1]
  else {
    const dq = /^"([^"`\\]*)"$/.exec(rhs)
    const body = dq ? dq[1] : rhs
    if (!dq && /["'`\\\s]/.test(body)) return null
    const s = substituteVars(body, vars).text
    if (s.includes('$')) return null
    // bash 는 따옴표 없는 대입값의 맨 앞 ~ 를 펼친다. 윈도우 홈(C:\Users\x)은 \ 때문에 아래 안전값 검사에 걸려 아예 안 풀리고
    //   그러면 `P=~/.ssh; cat $P/id_rsa` 의 개인키 차단이 빠진다(2026-10-21 main 병합 뒤 실측) → 슬래시 표기(C:/Users/x)로 펼친다
    if (!dq && /^~(?:\/|$)/.test(s)) { if (!HOME_DIR) return null; v = (IS_WIN ? HOME_DIR.replace(/\\/g, '/') : HOME_DIR) + s.slice(1) }
    else v = s
  }
  return SAFE_VALUE_RE.test(v) ? v : null
}

// { cmd: 변수를 푼 명령, changed } — 풀 수 없는 구조면 null
function resolveLiteralVars(cmd) {
  if (typeof cmd !== 'string' || cmd.length > MAX_RESOLVE_LEN || !cmd.includes('$')) return null
  const parts = splitTopLevelStatements(cmd)
  if (!parts) return null
  const vars = new Map() // 이름 → 값 (null = 값을 확실히 모름 → 풀지 않음)
  let out = '', changed = false
  for (const p of parts) {
    const raw = p.text
    const t = raw.trim()
    const conditional = p.sepBefore === '&&' || p.sepBefore === '||' || p.sep === '&' || p.pipe
    const first = (t.match(/^\S+/) || [''])[0]
    if (RESOLVE_BAIL_WORDS.has(first) || /^[A-Za-z_][\w-]*\s*\(\s*\)/.test(t) || /\bprintf\s+(?:-\S+\s+)*-v\b/.test(t)) return null
    // 어디에든 위험 변수 대입(접두 대입·env X=… 포함)이 보이면 풀지 않는다
    for (const m of removeSingleQuotedSegments(t).matchAll(/(?:^|[\s;&|(])(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\+?=/g)) if (SENSITIVE_VAR_RE.test(m[1])) return null
    const asg = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(\S*|'[^']*'|"[^"]*")$/.exec(t)
    if (asg) {
      vars.set(asg[1], conditional ? null : literalAssignValue(asg[2], vars))
      out += raw + (p.sep || '') // 대입 문장은 실행하는 것이 없어 그대로 둔다
      continue
    }
    if (/^(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*\+?=/.test(t)) {
      // 대입 여러 개·이어 붙인 값·접두 대입(X=1 cmd) — 값이 확실하지 않거나 남지 않으므로 그 이름은 모름으로
      for (const m of t.matchAll(/(?:^|\s)([A-Za-z_][A-Za-z0-9_]*)\+?=/g)) vars.set(m[1], null)
    }
    if (first === 'unset') {
      for (const n of t.split(/\s+/).slice(1)) if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(n)) vars.set(n, conditional ? null : '')
    }
    const s = substituteVars(raw, vars)
    if (s.changed) changed = true
    out += s.text + (p.sep || '')
  }
  return { cmd: out, changed }
}

// 풀어 본 명령이 확실히 읽기 전용인가 — 이번에 새로 여는 자동 허용 전용의 엄격한 목록
// (SAFE_READONLY_COMMANDS 의 sed·awk·xargs·less 는 w·e·system()·! 로 쓰거나 실행할 수 있어 뺀다)
const hasOpt = (vals, opts) => vals.some(v => opts.some(o => v === o || v.startsWith(o + '=') || (o.length === 2 && v.startsWith(o) && !v.startsWith('--'))))
const noArgs = (vals) => !vals.some(v => !v.startsWith('-'))
const GIT_READ_SUB = new Set(['status', 'log', 'diff', 'show', 'rev-parse', 'ls-files', 'ls-tree', 'cat-file', 'describe',
  'blame', 'shortlog', 'grep', 'branch', 'tag', 'remote', 'config', 'stash', 'worktree', 'reflog', 'rev-list', 'merge-base', 'name-rev', 'whatchanged', 'count-objects'])
const SED_ADDR = '(?:\\d+|\\$|/[^/\\\\]*/)'
const SED_PRINT_RE = new RegExp(`^\\s*(?:${SED_ADDR}(?:\\s*,\\s*${SED_ADDR})?)?\\s*[pq=]\\s*$`)
const READ_ONLY_RESOLVED = {
  ls: () => true, pwd: () => true, stat: () => true, realpath: () => true, readlink: () => true, basename: () => true,
  dirname: () => true, printenv: () => true, whoami: () => true, true: () => true, test: () => true, '[': () => true,
  cat: () => true, head: () => true, tail: () => true, wc: () => true, cmp: () => true, diff: () => true,
  grep: () => true, egrep: () => true, fgrep: () => true, cut: () => true, tr: () => true, du: () => true, df: () => true,
  echo: () => true, printf: (v) => !hasOpt(v, ['-v']), which: () => true, type: () => true, jq: () => true,
  cd: () => true, pushd: () => true, popd: () => true,
  // 값만 정하는 셸 내장 — 위험 변수(PATH·IFS·LD_* 등) 대입은 resolveLiteralVars 가 이미 풀지 않는다
  export: (v) => v.every(x => /^[A-Za-z_][A-Za-z0-9_]*(?:=.*)?$/.test(x) && !SENSITIVE_VAR_RE.test(x.split('=')[0])),
  unset: (v) => v.every(x => /^[A-Za-z_][A-Za-z0-9_]*$/.test(x)),
  rg: (v) => !hasOpt(v, ['--pre', '--pre-glob']),
  sort: (v) => !hasOpt(v, ['-o', '--output']),
  tree: (v) => !hasOpt(v, ['-o']),
  file: (v) => !hasOpt(v, ['-C', '--compile']),
  find: (v) => !v.some(x => /^-(?:exec|execdir|ok|okdir|delete|fprint|fprint0|fprintf|fls)$/.test(x)),
  date: (v) => !hasOpt(v, ['-s', '--set']) && !v.some(x => !x.startsWith('-') && !x.startsWith('+')),
  hostname: (v) => noArgs(v),
  // 2026-11-09 — 출력만 하는 sed(`sed -n 10,20p f`·`sed -n '/re/p' f`·`sed 5q f`)만. 확인 창 재생에서 약 900건이 이것 때문에 묻게 됐다.
  // -i·-f·-e·w·e·r 명령·{…} 묶음은 SED_PRINT_RE 에 안 맞아 그대로 확인
  sed: (v) => {
    const pos = []
    for (const x of v) {
      if (/^-[nErs]+$/.test(x) || x === '--quiet' || x === '--silent' || x === '--regexp-extended') continue
      if (x.startsWith('-')) return false
      pos[pos.length] = x
    }
    return pos.length >= 1 && pos[0].split(';').every(c => SED_PRINT_RE.test(c))
  },
  git: (v, inv) => {
    const g = inv.git
    if (!g || !g.sub || g.subDyn || Object.keys(g.aliases || {}).length || !GIT_READ_SUB.has(g.sub)) return false
    const pre = v.slice(0, v.length - g.args.length - 1)
    if (pre.some(x => /^(?:-c|--config-env|--exec-path)(?:=|$)/.test(x))) return false
    const a = g.args.map(x => cleanValue(x.value))
    if (a.some(x => /^--(?:output|ext-diff|textconv)(?:=|$)/.test(x))) return false
    if (g.sub === 'branch') return a.every(x => /^(?:-a|-r|-v|-vv|-l|--list|--all|--remotes|--show-current|--contains|--merged|--no-merged|--sort=.*|--format=.*)$/.test(x))
    if (g.sub === 'tag') return a.length === 0 || (a.some(x => x === '-l' || x === '--list') && !a.some(x => /^(?:-d|--delete|-a|--annotate|-s|--sign|-f|--force|-m|--message|-F|--file|-u|--local-user)(?:=|$)/.test(x)))
    if (g.sub === 'remote') return a.length === 0 || a[0] === '-v' || a[0] === 'get-url' || a[0] === 'show'
    if (g.sub === 'config') return a.some(x => /^(?:--get|--get-all|--get-regexp|--list|-l)$/.test(x))
    if (g.sub === 'stash' || g.sub === 'worktree') return a[0] === 'list' || (g.sub === 'stash' && a[0] === 'show')
    if (g.sub === 'reflog') return a.length === 0 || a[0] === 'show' || a[0].startsWith('-')
    return true
  },
}
// 2026-11-10 사용자 결정 1("읽는 건 굳이 allow 요청 안 해도 돼") — 읽기 전용으로 확정되는 형태를 더 넓힌다(쓰기·삭제·실행은 그대로 확인).
// ① 출력·조회만 하는 명령 추가 ② 반복문 틀(`for x in …`·`while read x`) ③ 값을 몰라도 읽기만 하는 명령의 변수 인자
// ④ `for` 목록이 글자 그대로면 반복 변수 자리에 값을 하나씩 넣어 판정(git·sed 처럼 옵션에 따라 쓰기가 되는 명령도 정확히 본다)
const positionals = (v) => v.filter(x => !x.startsWith('-'))
Object.assign(READ_ONLY_RESOLVED, {
  uniq: (v) => positionals(v).length <= 1, // 두 번째 위치 인자는 출력 파일
  ps: () => true, pgrep: () => true, lsof: () => true, id: () => true, uname: () => true, sw_vers: () => true,
  nl: () => true, comm: () => true, paste: () => true, column: () => true, seq: () => true, tac: () => true, rev: () => true,
  cksum: () => true, md5: () => true, md5sum: () => true, shasum: () => true, sha1sum: () => true, sha256sum: () => true,
  ':': () => true, break: () => true, continue: () => true,
  read: (v) => v.every(x => /^-[rsae]+$/.test(x) || /^[A-Za-z_][A-Za-z0-9_]*$/.test(x)), // 표준입력 한 줄을 변수에 — -u·-p 등은 확인
  for: (v) => v.length >= 1 && /^[A-Za-z_][A-Za-z0-9_]*$/.test(v[0]) && (v.length === 1 || v[1] === 'in'),
})
// 인자 값이 무엇이든(옵션으로 바뀌어도) 읽기·출력만 하는 명령 — 모르는 변수·치환 인자를 허용한다(치환 속 명령은 따로 판정)
const DYN_ARG_READ_SAFE = new Set(['cat', 'head', 'tail', 'wc', 'ls', 'stat', 'realpath', 'readlink', 'basename', 'dirname',
  'grep', 'egrep', 'fgrep', 'cut', 'tr', 'du', 'df', 'echo', 'test', '[', 'cd', 'pushd', 'for', 'nl', 'tac', 'rev', 'seq',
  'shasum', 'md5', 'md5sum', 'sha1sum', 'sha256sum', 'cksum', ':'])
const FIXED_VAR_RE = /^\$(?:\{(?:HOME|PWD)\}|(?:HOME|PWD)(?![A-Za-z0-9_]))/
const LOOP_VALUE_RE = /^[A-Za-z0-9_.\/:@%+,=-]*$/ // 공백·glob·따옴표 없는 값만 — 단어 나누기가 생기지 않는다
const VAR_REF_RE = /\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))/g
// 반복 변수 → 글자 그대로의 값 목록. 같은 이름을 다른 곳에서 바꾸면(대입·read·declare 등) 쓰지 않는다
function loopValuesOf(cmd, acc) {
  const vals = new Map(), tainted = new Set()
  for (const inv of acc.invocations) {
    const a = inv.args
    if (inv.name === 'for' && a.length >= 2 && a[1].value === 'in') {
      const name = a[0].value
      const words = a.slice(2)
      if (vals.has(name) || words.some(w => w.dyn || w.subst || w.tilde || !LOOP_VALUE_RE.test(cleanValue(w.value)))) { tainted.add(name); continue }
      vals.set(name, words.map(w => cleanValue(w.value)))
    } else if (['read', 'mapfile', 'readarray', 'declare', 'typeset', 'local', 'let', 'export', 'printf', 'getopts', 'unset', 'readonly'].includes(inv.name)) {
      for (const w of a) tainted.add(String(w.value).replace(/[+]?=.*$/, ''))
    }
  }
  for (const name of vals.keys()) {
    if (new RegExp(`(?:^|[^A-Za-z0-9_$])${name}\\+?=`).test(cmd)) tainted.add(name) // 본문 안 재대입
  }
  for (const t of tainted) vals.delete(t)
  return vals
}
// 반복 변수만 쓴 인자는 값을 하나씩 넣은 인자 목록들로 펼친다. 펼칠 수 없으면 null
function expandLoopArgs(inv, loopVals) {
  let combos = [[]]
  for (const a of inv.args) {
    const v = cleanValue(a.value)
    if (!a.dyn || FIXED_VAR_RE.test(a.value)) { combos = combos.map(c => [...c, v]); continue }
    if (a.subst || /`|\$\(/.test(v)) return null
    const names = [...v.matchAll(VAR_REF_RE)].map(m => m[1] || m[2])
    if (!names.length || names.some(n => !loopVals.has(n))) return null
    if (v.replace(VAR_REF_RE, '').includes('$')) return null // $1·$?·${x:-…} 같은 다른 확장이 섞임
    if (!a.quoted && v.replace(VAR_REF_RE, '').match(/[*?[\]]/)) return null
    const next = []
    for (const c of combos) {
      let partial = [v]
      for (const n of new Set(names)) {
        partial = partial.flatMap(p => loopVals.get(n).map(val => p.split(`\${${n}}`).join(val).replace(new RegExp(`\\$${n}(?![A-Za-z0-9_])`, 'g'), val)))
      }
      for (const p of partial) next.push([...c, p])
      if (next.length > 64) return null
    }
    combos = next
  }
  return combos
}
function isReadOnlyResolved(cmd) {
  if (typeof cmd !== 'string') return false
  const acc = analyzeShell(cmd)
  if (acc.unknown.length) return false
  let loopVals = null
  for (const inv of acc.invocations) {
    if (inv.dynamicName || inv.sudo) return false
    if ((inv.redirs || []).some(r => r.out && !r.dup && cleanValue(r.value) !== '/dev/null')) return false // 쓰기 리다이렉트
    const ok = Object.prototype.hasOwnProperty.call(READ_ONLY_RESOLVED, inv.name) && READ_ONLY_RESOLVED[inv.name]
    if (!ok) return false
    const hasDyn = inv.args.some(a => a.dyn && !FIXED_VAR_RE.test(a.value))
    if (!hasDyn) { if (!ok(inv.args.map(a => cleanValue(a.value)), inv)) return false; continue }
    if (DYN_ARG_READ_SAFE.has(inv.name)) {
      // 값을 몰라도 읽기만 — 다만 글자 그대로인 인자만으로도 판정을 통과해야 한다
      if (!ok(inv.args.filter(a => !a.dyn || FIXED_VAR_RE.test(a.value)).map(a => cleanValue(a.value)), inv)) return false
      continue
    }
    if (!loopVals) loopVals = loopValuesOf(cmd, acc)
    const combos = expandLoopArgs(inv, loopVals)
    // 값을 넣은 명령을 처음부터 다시 해석해 판정한다(git 하위 명령처럼 인자 해석이 값에 달린 경우도 정확히)
    const q = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`
    if (!combos || !combos.every(c => isReadOnlyResolved([inv.name, ...c].map(q).join(' ')))) return false
  }
  return true
}

function denyResult(reason) {
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }
}

// 셸 명령을 받는 도구 — Monitor 도 command 로 셸을 실행한다(공식 hooks 문서 "Match Monitor commands": 매처 `*` 훅은
// Monitor 호출의 입력을 그대로 받고 allow 도 적용된다). command 가 없는 Monitor(WebSocket 감시 등)는 판정하지 않는다 (2026-11-06)
const SHELL_TOOLS = new Set(['Bash', 'Monitor'])

function askResult(reason) {
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: `bash-guard: ${reason}` } }
}

function handlePreToolUse(toolName, toolInput, cwd) {
  if (!SHELL_TOOLS.has(toolName)) return null

  const rawCmd = toolInput && typeof toolInput === 'object' ? toolInput.command : undefined
  if (typeof rawCmd !== 'string') {
    if (toolName === 'Monitor' && (rawCmd === undefined || rawCmd === null)) return null
    // 입력이 깨졌다 — 판정할 수 없으니 허용하지 않고 사용자 확인 (fail-closed, 2026-11-06)
    return askResult('명령 입력(tool_input.command)이 없거나 문자열이 아니라 판정할 수 없습니다. 사용자 확인이 필요합니다.')
  }
  const cmd = rawCmd.trim()

  for (const { pattern, reason } of DENY_PATTERNS) {
    if (pattern.test(cmd)) return denyResult(reason)
  }

  // 같은 명령 안의 고정값 변수를 풀어 본 명령 — 변수에 숨긴 위험은 막고, 읽기 전용일 때만 아래에서 자동 허용 (2026-10-21)
  const lit = resolveLiteralVars(cmd)
  const litRisk = lit && lit.changed ? classifyShell(lit.cmd, { cwd }) : null
  if (litRisk) {
    for (const { pattern, reason } of DENY_PATTERNS) {
      if (pattern.test(lit.cmd)) return denyResult(`${reason} (같은 명령 안의 변수 값을 풀어 판정)`)
    }
    if (litRisk.level === 'deny') return denyResult(`${litRisk.reason} (같은 명령 안의 변수 값을 풀어 판정)`)
  }
  const litReadOnly = !!litRisk && litRisk.level === null && isReadOnlyResolved(lit.cmd)
  const litAllow = { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow',
    permissionDecisionReason: 'bash-guard: 같은 명령 안의 고정값 변수를 풀어 보니 읽기 전용 — 자동 허용' } }

  // 명령 단위 위험 분류 — 우회 형태(파이프·체인·치환·래퍼)도 일반 형태와 같은 판정
  const risk = classifyShell(cmd, { cwd })
  if (risk.level === 'deny') return denyResult(risk.reason)
  if (risk.level !== null && litReadOnly) return litAllow // 변수 때문에 판정하지 못했을 뿐, 풀어 보면 읽기
  if (litRisk && litRisk.level === 'ask') {
    return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask',
      permissionDecisionReason: `bash-guard: ${litRisk.reason} (같은 명령 안의 변수 값을 풀어 판정)` } }
  }
  if (risk.level === 'ask') {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `bash-guard: ${risk.reason}`,
      },
    }
  }
  if (risk.level === 'unknown') return null // 정적 판정 불가 — allow 하지 않고 기본 권한 흐름에 맡긴다

  // 안전 패턴 자동 허용 — 휴리스틱 우회 (cd+git, heredoc, brace, compound, multiline shell)
  const allowedDirs = getAllowedDirs(cwd)
  if (isCdGitSafe(cmd, allowedDirs)
   || isHeredocSafe(cmd, allowedDirs)
   || isBraceExpansionSafe(cmd, allowedDirs)
   || isCompoundSafe(cmd, allowedDirs)
   || isShellScriptSafe(cmd, allowedDirs)) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        permissionDecisionReason: 'bash-guard: 안전 패턴 자동 허용 (read-only 명령 + 안전한 경로/redirect + 위험 명령 없음)',
      },
    }
  }

  return null
}

// ── PermissionRequest 자동 승인 범주 (2026-11-06 좁힘) ──
// 예전엔 분류기가 위험으로 못 잡은 명령을 **전부** 확인 창에서 승인해 `echo 'rm -rf ~' | bash`·`find ~ -delete`·`node -e …`·
// `python3 -c …`·`osascript`·`nc host < .env`·`scp`·`security … -w`·`crontab -r`·`make deploy`·`./x.sh` 가 묻지 않고 실행됐다.
// 이제 자동 승인은 ① 읽기 전용으로 확정된 명령(READ_ONLY_RESOLVED) ② PreToolUse 가 이미 자동 허용하던 안전 패턴
// ③ 사용자가 설정 allow 로 정해 둔 개발 명령(node 스크립트·npm/pnpm 스크립트·git·파일 조작 — 인라인 코드·원격 실행 형태 제외)만.
// 그 밖(셸·인터프리터 인라인 코드·받은 스크립트·네트워크·시스템 도구·모르는 프로그램)은 결정 없이 사용자에게 묻는다.
const PKG_SCRIPT_SUBS = new Set(['test', 't', 'tst', 'run', 'run-script', 'start', 'build', 'lint', 'typecheck', 'check', 'format', 'dev',
  'ls', 'list', 'outdated', 'view', 'info', 'why', 'help', '-v', '--version', '-h', '--help'])
const PKG_VALUE_OPTS = new Set(['--filter', '-F', '-C', '--dir', '--prefix', '-w', '--workspace', '--cwd'])
const NODE_INLINE_RE = /^(?:-e|-p|-pe|-i|--eval|--print|--interactive|-)$|^--(?:eval|print)=/
const GIT_EXEC_SUBS = new Set(['submodule', 'bisect', 'filter-branch', 'filter-repo', 'difftool', 'mergetool', 'send-email', 'daemon',
  'instaweb', 'credential', 'hook', 'maintenance', 'p4', 'svn', 'cvsimport', 'cvsserver', 'archimport', 'quiltimport', 'web--browse'])
const GIT_EXEC_ARG_RE = /^(?:--(?:upload-pack|receive-pack|exec|ext-diff|textconv|config-env)|-x)(?:=|$)/
const devTrue = () => true
const PERM_DEV_OK = {
  node: (v) => {
    if (v.some(x => NODE_INLINE_RE.test(x))) return false
    if (v.includes('--test') || v.includes('--version') || v.includes('-v')) return true
    return v.some(x => !x.startsWith('-')) // 스크립트 파일을 실행 (없으면 REPL·표준입력)
  },
  npm: (v) => pkgSub(v), pnpm: (v) => pkgSub(v), yarn: (v) => pkgSub(v), bun: (v) => pkgSub(v),
  git: (v, inv) => {
    const g = inv.git
    if (!g || !g.sub || g.subDyn || Object.keys(g.aliases || {}).length) return false
    const pre = v.slice(0, v.length - g.args.length - 1)
    if (pre.some(x => /^(?:-c|--config-env|--exec-path)(?:=|$)/.test(x))) return false
    if (GIT_EXEC_SUBS.has(g.sub)) return false
    const a = g.args.map(x => cleanValue(x.value))
    if (a.some(x => GIT_EXEC_ARG_RE.test(x))) return false
    if (['fetch', 'pull', 'clone', 'ls-remote'].includes(g.sub) && a.includes('-u')) return false
    if (g.sub === 'config') return READ_ONLY_RESOLVED.git(v, inv) // 설정 쓰기(core.hooksPath·sshCommand 등)는 다음 실행을 바꾼다
    return true // push·commit·푸시된 커밋 reset 은 classifyShell 이 이미 확인·차단으로 걸렀다
  },
  mkdir: devTrue, touch: devTrue, cp: devTrue, mv: devTrue, rm: devTrue, // 쓰기 위치·보호 파일·rm 대상은 classifyShell 이 판정
  sleep: devTrue, false: devTrue, wait: devTrue,
  // 2026-10-06 사용자 결정 — 조회·일반 요청은 자동, 쓰기·업로드·정리·강제 종료는 classifyShell 이 확인·차단으로 거른다
  gh: devTrue, curl: devTrue, wget: devTrue, docker: devTrue, podman: devTrue, kill: devTrue, killall: devTrue, pkill: devTrue,
  python: (v) => v[0] === '-m' && v[1] === 'json.tool', python3: (v) => v[0] === '-m' && v[1] === 'json.tool', // 받은 JSON 보기만
  tsc: devTrue, eslint: devTrue, prettier: devTrue, biome: devTrue, vitest: devTrue, jest: devTrue, mocha: devTrue,
  cargo: (v) => ['build', 'check', 'test', 'fmt', 'clippy', 'doc', 'tree', 'metadata', 'run', 'bench', '--version'].includes(v.find(x => !x.startsWith('-'))),
}
function pkgSub(v) {
  for (let k = 0; k < v.length; k++) {
    if (PKG_VALUE_OPTS.has(v[k])) { k++; continue }
    if (v[k].startsWith('-') && !PKG_SCRIPT_SUBS.has(v[k])) continue
    return PKG_SCRIPT_SUBS.has(v[k])
  }
  return false // 인자 없음(yarn = install)
}
function isDevResolved(cmd) {
  const acc = analyzeShell(cmd)
  if (acc.unknown.length || !acc.invocations.length) return false
  const fixedVar = /^\$(?:\{(?:HOME|PWD)\}|(?:HOME|PWD)(?![A-Za-z0-9_]))/
  for (const inv of acc.invocations) {
    if (inv.dynamicName || inv.sudo) return false
    if (inv.name === 'for' || inv.name === 'read') return false // 반복문은 본문이 읽기뿐일 때만(isReadOnlyResolved) — 개발 명령 반복은 넓히지 않는다 (2026-11-10)
    if ((inv.redirs || []).some(r => r.out && !r.dup && r.dyn)) return false // 쓰기 대상이 변수 — 위치 판정 불가
    // 모르는 변수·치환 인자는 옵션·대상을 바꿀 수 있어 거른다 — echo 는 인자가 무엇이든 출력만 (치환 속 명령은 따로 검사됨)
    if (inv.name !== 'echo' && inv.args.some(a => a.dyn && !fixedVar.test(a.value))) return false
    const vals = inv.args.map(a => cleanValue(a.value))
    const has = (t) => Object.prototype.hasOwnProperty.call(t, inv.name) && t[inv.name]
    const ro = has(READ_ONLY_RESOLVED), dev = has(PERM_DEV_OK)
    if (!(ro && ro(vals, inv)) && !(dev && dev(vals, inv))) return false
  }
  return true
}
function isPermApprovable(cmd, cwd) {
  if (isReadOnlyResolved(cmd) || isDevResolved(cmd)) return true
  const allowedDirs = getAllowedDirs(cwd)
  return isCdGitSafe(cmd, allowedDirs) || isHeredocSafe(cmd, allowedDirs) || isBraceExpansionSafe(cmd, allowedDirs)
    || isCompoundSafe(cmd, allowedDirs) || isShellScriptSafe(cmd, allowedDirs)
}

// PermissionRequest — PreToolUse 와 같은 분류기를 재사용한다 (판정 일관성).
// 위험(deny/ask)·정적 판정 불가(unknown)는 자동 승인하지 않고 사용자 확인으로 넘긴다.
// 위험 판정이 없어도 위 자동 승인 범주(isPermApprovable)에 들 때만 승인 — 나머지는 사용자 확인 (2026-11-06)
function handlePermissionRequest(toolName, toolInput, cwd) {
  if (!SHELL_TOOLS.has(toolName)) return null

  const rawCmd = toolInput && typeof toolInput === 'object' ? toolInput.command : undefined
  if (typeof rawCmd !== 'string') return null // 없거나 깨진 입력 — 결정 없이 사용자 확인
  const cmd = rawCmd.trim()
  if (!cmd) return { hookSpecificOutput: { hookEventName: 'PermissionRequest', decision: { behavior: 'allow' } } } // 빈 명령 — 아무것도 실행하지 않음

  if (DENY_PATTERNS.some(({ pattern }) => pattern.test(cmd))) return null
  // 같은 명령 안의 고정값 변수를 풀어 본 명령이 위험하면 자동 승인하지 않는다.
  // 변수 때문에 판정하지 못하던 명령은 풀어 보니 **읽기 전용일 때만** 자동 승인 (쓰기·삭제·실행은 사용자 확인 — 2026-10-21)
  const lit = resolveLiteralVars(cmd)
  let ok
  if (lit && lit.changed) {
    if (DENY_PATTERNS.some(({ pattern }) => pattern.test(lit.cmd))) return null
    if (classifyShell(lit.cmd, { cwd }).level !== null) return null
    ok = classifyShell(cmd, { cwd }).level !== null ? isReadOnlyResolved(lit.cmd) : isPermApprovable(lit.cmd, cwd)
  } else {
    if (classifyShell(cmd, { cwd }).level !== null) return null // 사용자 확인 필요
    ok = isPermApprovable(cmd, cwd)
  }
  if (!ok) return null

  return {
    hookSpecificOutput: {
      hookEventName: 'PermissionRequest',
      decision: { behavior: 'allow' },
    },
  }
}

// 프로젝트 내부 .claude/ 모니터링 경로 — 삭제·이동 시 README 동기화 필요
// 셸 구문 단위(statement)로 판단 — node -e "..." 등 인수 내부 문자열은 제외
function postToolUseMonitoredPath(cmd) {
  // 세미콜론·&&·||·개행으로 구분된 개별 구문으로 분리
  const statements = cmd.split(/;|&&|\|\||\n/)
  return statements.some(stmt => {
    const s = stmt.trim()
    // 구문이 rm / mv 로 시작하고, 상대 경로 .claude/(hooks|skills|agents)/ 를 포함
    return /^(rm|mv)\s/.test(s) && /\s\.claude\/(hooks|skills|agents)\//.test(s)
  })
}

function handlePostToolUse(toolName, toolInput) {
  if (toolName !== 'Bash') return null

  const cmd = (toolInput.command || '').trim()

  if (postToolUseMonitoredPath(cmd)) {
    return {
      decision: 'block',
      // 2026-11-11 문구 갱신 — README 는 2026-10-17 부터 수만 두고, 목록·관계는 아래 위치에 있다(README 업데이트 룰)
      reason: '문서 동기화 필요: .claude/ 경로 파일이 삭제·이동됐습니다. relations.json(블록·관계)·docs/<종류>/README.md 목록·README 수·docs/CHANGELOG.md 를 맞추세요(검사: node --test scripts/relations.test.js scripts/docs-counts.test.js).',
    }
  }

  return null
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()
  _rawInput = raw

  if (!raw) return failClosed(raw, '훅 입력이 비어 있습니다')

  let input
  try { input = JSON.parse(raw) } catch { return failClosed(raw, '훅 입력 JSON 을 읽을 수 없습니다') }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return failClosed(raw, '훅 입력이 객체가 아닙니다')

  const { hook_event_name, hookEventName, tool_name, tool_input, cwd } = input
  const eventName = hook_event_name || hookEventName

  const result = eventName === 'PermissionRequest'
    ? handlePermissionRequest(tool_name, tool_input, typeof cwd === 'string' ? cwd : undefined)
    : eventName === 'PostToolUse'
      ? handlePostToolUse(tool_name, tool_input && typeof tool_input === 'object' ? tool_input : {})
      : handlePreToolUse(tool_name, tool_input, typeof cwd === 'string' ? cwd : undefined)

  if (result) process.stdout.write(JSON.stringify(result) + '\n')

  process.exit(0)
}

// 입력이 비거나 깨졌거나 처리 중 예외 — 허용하지 않는다 (2026-11-06 fail-closed).
// PreToolUse(또는 이벤트를 알 수 없음) → ask 로 사용자 확인, PermissionRequest → 결정 없음(사용자 확인), PostToolUse 등 → 출력 없음
let _rawInput = ''
function failClosed(raw, reason) {
  const m = /"(?:hook_event_name|hookEventName)"\s*:\s*"([A-Za-z]+)"/.exec(raw || '')
  const ev = m ? m[1] : null
  if (!ev || ev === 'PreToolUse') {
    try { process.stdout.write(JSON.stringify(askResult(`${reason} — 판정할 수 없어 사용자 확인으로 넘깁니다.`)) + '\n') } catch { /* 출력 실패 */ }
  }
  process.exit(0)
}

// 테스트에서 import 가능하도록 export — main 모듈로 직접 실행될 때만 main() 호출
if (require.main === module) {
  main().catch(() => failClosed(_rawInput, 'bash-guard 처리 중 예외가 났습니다'))
}

module.exports = {
  findProjectRoot,
  getAllowedDirs,
  isCdGitSafe,
  isHeredocSafe,
  isBraceExpansionSafe,
  isCompoundSafe,
  isStatementSafeForCompound,
  isShellScriptSafe,
  isLocalhostUrl,
  isReadOnlyPipeChain,
  isUnderAllowed,
  isUnderTempDir,
  handlePreToolUse,
  handlePermissionRequest,
  handlePostToolUse,
  analyzeShell,
  classifyShell,
  resolveLiteralVars,
  isReadOnlyResolved,
  parseGitInvocation,
  parsePushArgs,
  winCanon,
  isWinRoot,
  // task-confirm-guard 승인 전 쓰기 판정(lib/pre-approval-write.js)이 같은 해석을 쓴다 (2026-11-10)
  resolveRmTarget,
  writeLocationTargets,
  cleanValue,
  SHELL_NAMES,
}
