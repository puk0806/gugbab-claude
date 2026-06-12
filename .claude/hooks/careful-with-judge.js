// careful-with-judge.js — PreToolUse Bash (개발 전용)
// rm -rf 명령의 위험도를 분석해 고위험은 차단, 중위험은 경고 출력
const fs = require('fs')

const DANGEROUS_PATTERNS = [
  { re: /rm\s+-[a-z]*rf?\s+\/\s*$|rm\s+-[a-z]*rf?\s+\/[^a-zA-Z]/, msg: '루트 디렉터리 삭제' },
  { re: /rm\s+-[a-z]*rf?\s+~\s*$|rm\s+-[a-z]*rf?\s+~\//, msg: '홈 디렉터리 삭제' },
  { re: /rm\s+-[a-z]*rf?\s+\$HOME\s*$/, msg: '$HOME 삭제' },
  { re: /rm\s+-[a-z]*rf?\s+\.\s*$/, msg: '현재 디렉터리 전체 삭제' },
  { re: /rm\s+-[a-z]*rf?\s+\.\./, msg: '상위 디렉터리 삭제' },
  { re: /rm\s+-[a-z]*rf?\s+.*\/\.git\s*$/, msg: '.git 디렉터리 삭제' },
  { re: /rm\s+-[a-z]*rf?\s+.*\/\.claude\s*$/, msg: '.claude 디렉터리 삭제' },
  { re: /rm\s+-[a-z]*rf?\s+.*\/\.ssh\s*$/, msg: '.ssh 디렉터리 삭제' },
  { re: /rm\s+-[a-z]*rf?\s+\/(usr|etc|var|bin|sbin|lib|sys|proc|dev|home|root)/, msg: '시스템 디렉터리 삭제' },
]

// 빌드 아티팩트 — 명시적으로 안전
const SAFE_PATTERNS = [
  /rm\s+-[a-z]*rf?\s+.*node_modules/,
  /rm\s+-[a-z]*rf?\s+.*\/dist\b/,
  /rm\s+-[a-z]*rf?\s+.*\/build\b/,
  /rm\s+-[a-z]*rf?\s+.*\/target\b/,
  /rm\s+-[a-z]*rf?\s+.*\/\.next\b/,
  /rm\s+-[a-z]*rf?\s+.*\/coverage\b/,
  /rm\s+-[a-z]*rf?\s+.*\/\.nuxt\b/,
  /rm\s+-[a-z]*rf?\s+.*\/out\b/,
  /rm\s+-[a-z]*rf?\s+\/tmp\//,
  /rm\s+-[a-z]*rf?\s+\/private\/tmp\//,
  /rm\s+-[a-z]*rf?\s+.*\/\.cache\b/,
]

try {
  const raw = fs.readFileSync('/dev/stdin', 'utf8')
  const input = JSON.parse(raw || '{}')
  const cmd = input.tool_input?.command || ''

  // rm -rf 패턴이 없으면 통과
  if (!/rm\s+.*-[a-z]*r[a-z]*f|rm\s+.*-f[a-z]*r/.test(cmd)) process.exit(0)

  // 명시적 안전 패턴 먼저 확인
  if (SAFE_PATTERNS.some(re => re.test(cmd))) process.exit(0)

  // 위험 패턴 검사 — 차단
  for (const { re, msg } of DANGEROUS_PATTERNS) {
    if (re.test(cmd)) {
      process.stderr.write(`[careful-with-judge] rm -rf 차단: ${msg}\n`)
      process.stderr.write(`  명령: ${cmd.trim()}\n`)
      process.exit(2)
    }
  }

  // 그 외 rm -rf — 경고만 (차단 안 함)
  process.stderr.write(`[careful-with-judge] rm -rf 감지: ${cmd.trim()}\n`)
  process.stderr.write('  경로를 한 번 더 확인하세요\n')
} catch {}

process.exit(0)
