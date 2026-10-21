// protect-secrets.js — PreToolUse Write / Edit / NotebookEdit / Read / Grep
// ① 쓰기(Write·Edit·NotebookEdit): 민감 파일(.env, *.pem, *.key, credentials 등) + 홈 셸·SSH·git 설정 파일 수정 차단
// ② 읽기(Read·Grep): 개인키·클라우드 인증 파일 읽기 차단 (2026-10-06 사용자 결정 — 읽은 뒤 외부 유출 경로 차단)
//    .env 읽기는 디버깅에 필요해 허용 (같은 결정)
// bash-guard 가 같은 판정(isSecretReadPath)을 Bash 인자에도 적용한다 — require 로 공유
const fs = require('fs')
const os = require('os')
const path = require('path')

const SENSITIVE_PATTERNS = [
  /^\.env(\.|$)/,
  /^\.env\.(?!example|sample|template|test).*$/,
  /credentials(\.json|\.yaml|\.yml)?$/i,
  /secrets?(\.json|\.yaml|\.yml)?$/i,
  /\.(pem|key|p12|pfx|crt|cer)$/i,
  /^(id_rsa|id_ed25519|id_ecdsa|id_dsa)(\.pub)?$/,
  /service[_-]?account.*\.json$/i,
  /keystore\.(jks|p12)$/i,
  /\.kubeconfig$/i,
  /docker[_-]?config\.json$/i,
]

const SAFE_PATTERNS = [
  /\.env\.example$/i,
  /\.env\.sample$/i,
  /\.env\.template$/i,
  /\.env\.test$/i,
  /\.env\.local\.example$/i,
]

const HOME = (() => { try { return path.resolve(os.homedir()) } catch { return null } })()
// 윈도우(2026-10-20 윈도우 2단계): NTFS 는 대소문자를 가리지 않고, 경로가 `C:\`·`C:/`·`/c/`·`~\` 로 온다.
// 윈도우 분기는 모두 IS_WIN 안에서만 — 맥 판정은 기존 코드 그대로
const W = require('./lib/winpath')
const IS_WIN = W.IS_WIN

// 홈의 셸·git 설정 파일 — 한 번 바뀌면 모든 터미널·인증에 영향 (쓰기 차단)
const HOME_CONFIG_FILES = ['.zshrc', '.zprofile', '.zshenv', '.zlogin', '.bashrc', '.bash_profile', '.bash_login', '.profile', '.gitconfig']

// 개인키 (.pub 공개키 제외) · 키 파일 확장자
const PRIVATE_KEY_NAME = /^id_(?:rsa|ed25519|ecdsa|dsa)(?:_[\w-]+)?$/
const PRIVATE_KEY_EXT = /\.(?:pem|key|p12|pfx)$/i
// 홈 기준 클라우드 인증 파일
const HOME_CREDENTIAL_FILES = ['.aws/credentials', '.config/gcloud/application_default_credentials.json', '.docker/config.json', '.kube/config', '.netrc']

// 윈도우 전용 — 홈 기준 인증 파일(_netrc 는 윈도우 curl·git 이 쓰는 이름)과 %APPDATA% 아래 gcloud 인증
const WIN_HOME_CREDENTIAL_FILES = ['_netrc']
function winAppDataCredentials() {
  const a = process.env.APPDATA
  if (!a || !path.win32.isAbsolute(a)) return []
  return ['application_default_credentials.json', 'credentials.db', 'access_tokens.db', 'legacy_credentials'].map(f => path.join(a, 'gcloud', f))
}
// 윈도우 전용 — 쓰면 셸·로그인 때 실행되는 위치 (PowerShell 프로필·시작프로그램 폴더)
function winAutorunDirs() {
  const out = []
  const docs = [HOME && path.join(HOME, 'Documents'), process.env.OneDrive && path.join(process.env.OneDrive, 'Documents')]
  for (const d of docs) if (d) out.push(path.join(d, 'WindowsPowerShell'), path.join(d, 'PowerShell'))
  const startup = path.join('Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup')
  if (process.env.APPDATA) out.push(path.join(process.env.APPDATA, startup))
  if (process.env.ProgramData) out.push(path.join(process.env.ProgramData, startup))
  return out
}

function expandPath(p, cwd) {
  if (typeof p !== 'string' || !p) return null
  let v = p
  if (IS_WIN) {
    // `~\x`·`~/x`, `%USERPROFILE%\x` 같은 미확장 변수, Git Bash `/c/x` 를 드라이브 경로로
    v = v.replace(/\\/g, '/')
    const m = /^%(USERPROFILE|APPDATA|LOCALAPPDATA)%(?=\/|$)/i.exec(v)
    if (m) { const val = m[1].toUpperCase() === 'USERPROFILE' ? HOME : process.env[m[1].toUpperCase()]; if (!val) return null; v = val + v.slice(m[0].length) }
    if (HOME && (v === '~' || v.startsWith('~/'))) v = HOME + v.slice(1)
    v = W.msysToWin(v, true)
  } else if (HOME && (v === '~' || v.startsWith('~/'))) v = HOME + v.slice(1)
  try {
    return path.resolve(cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd(), v)
  } catch { return null }
}

function isUnder(abs, dir) {
  if (IS_WIN) return W.isUnder(abs, dir, true) // 대소문자·구분자 무시, 경로 단위(C:/a/bc 는 C:/a/b 아래 아님)
  return abs === dir || abs.startsWith(dir + path.sep)
}
function samePath(a, b) { return IS_WIN ? W.samePath(a, b, true) : a === b }

// 쓰기 차단 대상인가
function isProtectedWritePath(filePath, cwd) {
  if (typeof filePath !== 'string' || !filePath) return false
  // 윈도우: 파일 이름 판정도 대소문자 무시 (.ENV·ID_RSA 는 같은 파일)
  const name = IS_WIN ? path.basename(filePath).toLowerCase() : path.basename(filePath)
  const isProtected = SENSITIVE_PATTERNS.some(re => re.test(name) || re.test(filePath))
  const isSafe = SAFE_PATTERNS.some(re => re.test(name) || re.test(filePath))
  if (isProtected && !isSafe) return true
  const abs = expandPath(filePath, cwd)
  if (!abs || !HOME) return false
  if (HOME_CONFIG_FILES.some(f => samePath(abs, path.join(HOME, f)))) return true
  if (isUnder(abs, path.join(HOME, '.ssh'))) return true
  if (IS_WIN && winAutorunDirs().some(d => isUnder(abs, d))) return true
  return false
}

// 읽기 차단 대상인가 (개인키·클라우드 인증) — 디렉토리 자체(~/.ssh)도 포함 (grep -r 대비)
function isSecretReadPath(filePath, cwd) {
  const abs = expandPath(filePath, cwd)
  if (!abs) return false
  if (IS_WIN) return isSecretReadPathWin(abs)
  const name = path.basename(abs)
  if (PRIVATE_KEY_NAME.test(name) || PRIVATE_KEY_EXT.test(name)) return true
  if (!HOME) return false
  const ssh = path.join(HOME, '.ssh')
  if (isUnder(abs, ssh) && !/\.pub$/.test(name) && name !== 'known_hosts') return true
  if (HOME_CREDENTIAL_FILES.some(f => isUnder(abs, path.join(HOME, f)))) return true
  return false
}

// 윈도우판 — 대소문자 무시. bash-guard 가 Bash 인자마다 부르므로(명령 하나에 수만 번 가능) 비교 대상은 한 번만 정규화해 둔다
let _winSecret = null
function winSecretTargets() {
  if (_winSecret) return _winSecret
  const n = (p) => W.normPath(p, true)
  return (_winSecret = {
    ssh: HOME ? n(path.join(HOME, '.ssh')) : null,
    files: [
      ...(HOME ? [...HOME_CREDENTIAL_FILES, ...WIN_HOME_CREDENTIAL_FILES].map(f => n(path.join(HOME, f))) : []),
      ...winAppDataCredentials().map(n),
    ],
  })
}
function underNorm(c, p) { return c === p || c.startsWith(p.endsWith('/') ? p : p + '/') }
function isSecretReadPathWin(abs) {
  const c = W.normPath(abs, true)
  const name = c.slice(c.lastIndexOf('/') + 1)
  if (PRIVATE_KEY_NAME.test(name) || PRIVATE_KEY_EXT.test(name)) return true
  const t = winSecretTargets()
  if (t.ssh && underNorm(c, t.ssh) && !/\.pub$/.test(name) && name !== 'known_hosts') return true
  return t.files.some(f => underNorm(c, f))
}

// 반환: 차단 사유 문자열 | null
function check(input) {
  if (!input || typeof input !== 'object') return null
  const toolName = input.tool_name
  const ti = input.tool_input && typeof input.tool_input === 'object' ? input.tool_input : {}
  const cwd = typeof input.cwd === 'string' ? input.cwd : undefined

  if (toolName === 'Write' || toolName === 'Edit' || toolName === 'NotebookEdit') {
    const filePath = ti.file_path || ti.notebook_path || ti.path || ''
    if (isProtectedWritePath(filePath, cwd)) {
      return [
        `[protect-secrets] 민감 파일 수정 차단: ${filePath}`,
        '  .env, *.pem, *.key, credentials 파일은 직접 편집할 수 없습니다.',
        '  환경변수 예시는 .env.example에, 실제 값은 수동으로 관리하세요. 홈 셸·SSH·git 설정 파일도 사용자가 직접 수정합니다.',
      ].join('\n')
    }
    return null
  }

  if (toolName === 'Read' || toolName === 'Grep') {
    const filePath = toolName === 'Read' ? ti.file_path : ti.path
    if (isSecretReadPath(filePath, cwd)) {
      return [
        `[protect-secrets] 개인키·인증 파일 읽기 차단: ${filePath}`,
        '  ~/.ssh 개인키, *.pem·*.key, ~/.aws/credentials 등은 읽을 수 없습니다. 필요하면 사용자가 직접 확인하세요.',
      ].join('\n')
    }
  }
  return null
}

if (require.main === module) {
  try {
    const raw = fs.readFileSync(0, 'utf8')
    const reason = check(JSON.parse(raw || '{}'))
    if (reason) {
      process.stderr.write(reason + '\n')
      process.exit(2)
    }
  } catch {}
  process.exit(0)
} else {
  module.exports = { check, isProtectedWritePath, isSecretReadPath, expandPath }
}
