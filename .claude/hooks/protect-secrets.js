// protect-secrets.js — PreToolUse Write / Edit
// 민감 파일(.env, *.pem, *.key, credentials 등) 수정 시도를 차단한다
const fs = require('fs')
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

try {
  const raw = fs.readFileSync('/dev/stdin', 'utf8')
  const input = JSON.parse(raw || '{}')
  const toolName = input.tool_name || ''

  if (toolName !== 'Write' && toolName !== 'Edit') process.exit(0)

  const filePath = input.tool_input?.file_path || input.tool_input?.path || ''
  const name = path.basename(filePath)

  const isProtected = SENSITIVE_PATTERNS.some(re => re.test(name) || re.test(filePath))
  const isSafe = SAFE_PATTERNS.some(re => re.test(name) || re.test(filePath))

  if (isProtected && !isSafe) {
    process.stderr.write(`[protect-secrets] 민감 파일 수정 차단: ${filePath}\n`)
    process.stderr.write('  .env, *.pem, *.key, credentials 파일은 직접 편집할 수 없습니다.\n')
    process.stderr.write('  환경변수 예시는 .env.example에, 실제 값은 수동으로 관리하세요.\n')
    process.exit(2)
  }
} catch {}

process.exit(0)
