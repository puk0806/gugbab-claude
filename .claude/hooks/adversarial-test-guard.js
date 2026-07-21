#!/usr/bin/env node
/**
 * adversarial-test-guard.js
 * Claude Code PostToolUse Hook (Write | Edit) — 개발 전용
 *
 * 목적: 테스트 파일이 정상(happy path) 케이스만 담고 악성 유저 방어·이상 경로
 *       테스트를 누락하면 차단한다. (@.claude/rules/adversarial-testing.md 강제)
 *
 * 차단 조건:
 *   - 대상이 테스트 파일이고 (*.test.* / *.spec.* / *_test.* / __tests__/)
 *   - 테스트 케이스가 2개 이상인데
 *   - 적대적 커버리지(에러/보안/경계) 카테고리가 2개 미만
 *
 * 통과 조건:
 *   - 테스트 케이스 1개 이하 (TDD RED 초기 단계 — 아직 증분 중)
 *   - 적대적 커버리지 2개 카테고리 이상 존재
 *   - waiver 주석 존재: `adversarial-test-guard: allow — <이유>`
 *
 * TDD RED 단계(첫 실패 테스트 1개)를 방해하지 않도록, 스위트가 2케이스 이상으로
 * 자라난 시점에만 적대적 breadth를 요구한다.
 */

const fs = require('fs')
const path = require('path')

const SOURCE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.go', '.java', '.rb']

// 테스트 파일 판별
function isTestFile(filePath) {
  const base = path.basename(filePath)
  return (
    /\.(test|spec)\./.test(base) ||
    /_test\.[a-z]+$/.test(base) ||
    /(?:^|\/)__tests__\//.test(filePath) ||
    /Test\.(java|kt)$/.test(base) ||       // Java/Kotlin: FooTest.java
    /test_.*\.py$/.test(base)              // Python: test_foo.py
  )
}

// 테스트 케이스 카운트 (러너 무관 근사)
const TEST_CASE_PATTERNS = [
  /\b(?:it|test)\s*\(/g,            // jest/vitest/playwright/mocha
  /\btest\.(?:each|only|skip)\s*\(/g,
  /\bdef\s+test_\w+\s*\(/g,         // pytest/unittest
  /#\[\s*test\s*\]/g,               // rust
  /@Test\b/g,                        // junit
  /\bit\s+['"]/g,                    // rspec: it "..."
]

function countTestCases(text) {
  let n = 0
  for (const p of TEST_CASE_PATTERNS) {
    const m = text.match(p)
    if (m) n += m.length
  }
  return n
}

// 적대적 커버리지 카테고리 마커 (영어 + 한국어)
const ADVERSARIAL_CATEGORIES = {
  // 에러·부정 경로: 예외·거부·실패가 검증되는가
  negative: [
    /\btoThrow\b/i, /\brejects\b/i, /\.rejects\./i, /\bassertRaises\b/i,
    /\bexpect(?:ed)?\s*[_-]?(?:err|error|panic)\b/i, /#\[should_panic/i,
    /\binvalid\b/i, /\bmalformed\b/i, /\bfail(?:ure|s|ed)?\b/i,
    /실패|에러|예외|거부|오류/,
  ],
  // 보안·인가: 공격·권한이 차단되는가
  security: [
    /\b40[13]\b/, /\bunauthorized\b/i, /\bforbidden\b/i, /\binjection\b/i,
    /\bxss\b/i, /\bcsrf\b/i, /\bmalicious\b/i, /\bsanitiz/i, /\bescape[sd]?\b/i,
    /\bsql\b/i, /\btamper/i, /\bspoof/i, /\breplay\b/i, /\bidor\b/i,
    /\bprivilege\b/i, /\brate[_-]?limit/i, /\bbrute[_-]?force/i,
    /악성|공격|권한|우회|인젝션|위조|탈취/,
  ],
  // 경계·비정상 입력: 극단·빈 값에서 안 깨지는가
  boundary: [
    /\bempty\b/i, /\bnull\b/i, /\bundefined\b/i, /\bNaN\b/, /\bboundary\b/i,
    /\bedge\s*case/i, /\boverflow\b/i, /\bwhitespace\b/i, /\bspecial\s*char/i,
    /\btoo\s*(?:long|large|many)\b/i, /\bmax(?:imum)?\b/i, /\bmin(?:imum)?\b/i,
    /\bnegative\b/i, /\bzero\b/i, /\brace\b/i, /\bconcurren/i, /\btimeout\b/i,
    /경계|빈\s|빈값|최대|최소|음수|특수\s*문자|동시|중복|초과/,
  ],
}

function countAdversarialCategories(text) {
  let n = 0
  for (const patterns of Object.values(ADVERSARIAL_CATEGORIES)) {
    if (patterns.some(p => p.test(text))) n++
  }
  return n
}

const WAIVER = /adversarial-test-guard:\s*allow\s*[—\-:]/i

function readContent(input, filePath) {
  // Write: tool_input.content 이 전체 내용. Edit: 디스크에서 재읽기(사후 반영본).
  const ti = input.tool_input || {}
  if (typeof ti.content === 'string' && ti.content.length) return ti.content
  try { return fs.readFileSync(filePath, 'utf8') } catch { return '' }
}

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'))
  const filePath = input.tool_input?.file_path || input.tool_input?.path
  if (!filePath) process.exit(0)

  // 레포 인프라(훅·커맨드·스크립트)는 제품 코드가 아니므로 제외 (tdd-guard와 동일 철학)
  if (/\.claude\/(?:hooks|commands)\//.test(filePath) || /(?:^|\/)scripts\//.test(filePath)) process.exit(0)

  const ext = path.extname(filePath)
  if (!SOURCE_EXTS.includes(ext)) process.exit(0)
  if (!isTestFile(filePath)) process.exit(0)

  const text = readContent(input, filePath)
  if (!text.trim()) process.exit(0)

  if (WAIVER.test(text)) process.exit(0)

  const cases = countTestCases(text)
  if (cases < 2) process.exit(0)   // TDD RED 초기 — 증분 중이므로 허용

  const categories = countAdversarialCategories(text)
  if (categories >= 2) process.exit(0)

  const rel = path.relative(process.cwd(), filePath)
  process.stdout.write([
    `[adversarial-test-guard] ❌ 적대적 테스트 커버리지 부족: ${rel}`,
    '',
    `  테스트 케이스 ${cases}개 중 적대적 커버리지 카테고리가 ${categories}개뿐입니다 (2개 이상 필요).`,
    '  정상(happy path)만이 아니라 아래 3계층 중 최소 2개를 담아야 합니다:',
    '',
    '    • 에러·부정 경로  — toThrow / rejects / invalid 입력 거부 / 예외',
    '    • 보안·인가       — 401·403 / 인젝션·XSS·CSRF 차단 / 권한 우회 거부',
    '    • 경계·비정상     — 빈 값·null·최대/최소·특수문자·동시요청·타임아웃',
    '',
    '  근거: @.claude/rules/adversarial-testing.md',
    '  정당한 예외라면 파일에 waiver 주석: `adversarial-test-guard: allow — <이유>`',
    '',
  ].join('\n'))
  process.exit(2)
} catch {
  process.exit(0)
}
