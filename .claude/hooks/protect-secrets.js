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

// 홈의 셸·git 설정 파일 — 한 번 바뀌면 모든 터미널·인증에 영향 (쓰기 차단)
const HOME_CONFIG_FILES = ['.zshrc', '.zprofile', '.zshenv', '.zlogin', '.bashrc', '.bash_profile', '.bash_login', '.profile', '.gitconfig']

// 개인키 (.pub 공개키 제외) · 키 파일 확장자
const PRIVATE_KEY_NAME = /^id_(?:rsa|ed25519|ecdsa|dsa)(?:_[\w-]+)?$/
const PRIVATE_KEY_EXT = /\.(?:pem|key|p12|pfx)$/i
// 홈 기준 클라우드 인증 파일
const HOME_CREDENTIAL_FILES = ['.aws/credentials', '.config/gcloud/application_default_credentials.json', '.docker/config.json', '.kube/config', '.netrc']

function expandPath(p, cwd) {
  if (typeof p !== 'string' || !p) return null
  let v = p
  if (HOME && (v === '~' || v.startsWith('~/'))) v = HOME + v.slice(1)
  try {
    return path.resolve(cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd(), v)
  } catch { return null }
}

function isUnder(abs, dir) { return abs === dir || abs.startsWith(dir + path.sep) }

// 쓰기 차단 대상인가
function isProtectedWritePath(filePath, cwd) {
  if (typeof filePath !== 'string' || !filePath) return false
  const name = path.basename(filePath)
  const isProtected = SENSITIVE_PATTERNS.some(re => re.test(name) || re.test(filePath))
  const isSafe = SAFE_PATTERNS.some(re => re.test(name) || re.test(filePath))
  if (isProtected && !isSafe) return true
  const abs = expandPath(filePath, cwd)
  if (!abs || !HOME) return false
  if (HOME_CONFIG_FILES.some(f => abs === path.join(HOME, f))) return true
  if (isUnder(abs, path.join(HOME, '.ssh'))) return true
  return false
}

// 읽기 차단 대상인가 (개인키·클라우드 인증) — 디렉토리 자체(~/.ssh)도 포함 (grep -r 대비)
function isSecretReadPath(filePath, cwd) {
  const abs = expandPath(filePath, cwd)
  if (!abs) return false
  const name = path.basename(abs)
  if (PRIVATE_KEY_NAME.test(name) || PRIVATE_KEY_EXT.test(name)) return true
  if (!HOME) return false
  const ssh = path.join(HOME, '.ssh')
  if (isUnder(abs, ssh) && !/\.pub$/.test(name) && name !== 'known_hosts') return true
  if (HOME_CREDENTIAL_FILES.some(f => isUnder(abs, path.join(HOME, f)))) return true
  return false
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
