#!/usr/bin/env node
/**
 * pending-test-guard.js
 * Claude Code Stop Hook
 *
 * 목적: 세션 내에서 오늘 생성·수정된 PENDING_TEST 스킬의 2단계 테스트 미수행 차단
 *
 * 동작:
 *   1. docs/skills/**\/verification.md 스캔
 *   2. 오늘 날짜에 mtime 기록된 파일 중 status: PENDING_TEST 추출
 *   3. 섹션 5 "테스트 진행 기록"에 *진짜* 수행 기록이 있는지 검사
 *      → "수행일: YYYY-MM-DD" 라인 + 실제 테스트 흔적 키워드 동시 충족 필요
 *      → "skill-tester 호출 미수행" 등 자백 키워드 발견 시 차단
 *   4. stderr로 skill-tester 호출 지시 + exit 2 (Stop 차단)
 *
 * 블로킹 정책:
 *   - PENDING_TEST이고 진짜 수행 기록이 없으면 → 차단 (exit 2)
 *   - PENDING_TEST이지만 진짜 수행 기록이 있으면 → 통과 (섹션 7 cleanup-only 허용)
 *   - APPROVED이거나 수정이 오늘이 아니면 → 통과
 *
 * "진짜 수행 기록" 정의:
 *   - 섹션 5 안에 "수행일: YYYY-MM-DD" 라인 존재 AND
 *   - 같은 섹션 안에 실제 테스트 흔적 키워드 1개 이상 존재
 *     (PASS / FAIL / Q1 / Q2 / Q3 / skill-tester 정식 / agent content test / 답변 / 근거)
 *   - 그리고 명시적 미수행 자백 키워드가 *하나도 없을 것*
 *     (skill-tester 호출 미수행 / skill-tester 미수행 / agent content test 미수행)
 *
 * 자백 키워드가 있더라도 *나중 날짜의 진짜 수행 기록*이 추가되면 통과
 * (예: 2026-05-07 셀프 검증 자백 + 2026-05-08 정식 skill-tester 기록 = 통과)
 *
 * 안전장치: 에러 발생 시 exit 0 (차단 않음)
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

function todayStr() {
  // 로컬 날짜 기준 (Asia/Seoul 등 사용자 TZ)
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function findVerificationFiles(rootDir) {
  const results = []
  if (!fs.existsSync(rootDir)) return results
  const walk = (dir) => {
    let entries
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name === 'verification.md') results.push(full)
    }
  }
  walk(rootDir)
  return results
}

function extractStatus(content) {
  // frontmatter 블록을 먼저 추출한 뒤 그 안에서 status 라인 검색
  // (단순한 `---\nstatus:VAL\n---` 형태와 다중 필드 형태 모두 지원)
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---/m)
  if (!fm) return null
  const sm = fm[1].match(/^\s*status\s*:\s*([A-Z_]+)\s*$/m)
  return sm ? sm[1].trim() : null
}

// 진짜 테스트 수행 흔적 키워드 (1개 이상 매치되어야 함)
// 셀프 검증·자백 라인만 있을 때를 차단하기 위해 "실제 결과" 단서를 요구
const GENUINE_TEST_KEYWORDS = [
  /\bPASS\b/,
  /\bFAIL\b/,
  /\bPARTIAL\b/,
  /\bQ\d+\./,                              // Q1. / Q2. 형식 질문 라벨
  /skill-tester\s+(정식\s+)?호출/,         // skill-tester 정식 호출 / skill-tester 호출
  /agent\s+content\s+test/i,
  /수행자\s*[:：]\s*skill-tester/,
  /\d+\/\d+\s*(PASS|FAIL)/,                // 3/3 PASS 형식
]

// 명시적 *미수행 자백* 키워드 — 검출되면 그 라인 자체는 진짜 수행으로 간주 안 함
const NEGATION_KEYWORDS = [
  /skill-tester\s+호출\s+미수행/,
  /skill-tester\s+미수행/,
  /agent\s+content\s+test\s+미수행/i,
  /셀프\s+검증\s*\(skill-tester\s+호출\s+미수행\)/,
]

function extractSection5(content) {
  const m = content.match(
    /##\s+5\.\s+테스트\s+진행\s+기록([\s\S]*?)(?=\n##\s+\d|\n---\s*$|$)/i
  )
  return m ? m[1] : null
}

function hasAnyDateLine(body) {
  return /수행일[\s*:：]+\d{4}-\d{2}-\d{2}/.test(body)
}

function hasGenuineTestEvidence(body) {
  // NEGATION 매치되는 라인은 먼저 제거한 뒤 GENUINE 검사
  // → "skill-tester 호출 미수행" 의 "skill-tester 호출" 부분이
  //   GENUINE("skill-tester 호출")으로 오판 매치되는 것 방지
  const cleaned = body
    .split(/\r?\n/)
    .filter(line => !NEGATION_KEYWORDS.some(re => re.test(line)))
    .join('\n')
  return GENUINE_TEST_KEYWORDS.some(re => re.test(cleaned))
}

function hasOnlyNegationConfession(body) {
  // 자백 키워드는 있는데 (자백 라인 제외 후) 진짜 수행 흔적은 없는 상태
  const hasNegation = NEGATION_KEYWORDS.some(re => re.test(body))
  return hasNegation && !hasGenuineTestEvidence(body)
}

// 오늘 진짜 수행 기록이 있는지 (오늘 날짜 라인 + 진짜 흔적 동시 충족)
function hasTodayTestRecord(content, today) {
  const body = extractSection5(content)
  if (!body) return false
  const todayRe = new RegExp(`수행일[\\s*:：]+${today}`)
  if (!todayRe.test(body)) return false
  // 오늘 날짜 라인은 있지만 진짜 흔적이 없으면 셀프 검증 자백으로 간주
  return hasGenuineTestEvidence(body)
}

// 진짜 수행 기록이 한 번이라도 있는지 (cleanup-only 허용 판정용)
// 자백 라인만 있는 셀프 검증은 진짜 수행으로 간주 안 함
function hasAnyTestRecord(content) {
  const body = extractSection5(content)
  if (!body) return false
  if (!hasAnyDateLine(body)) return false
  if (hasOnlyNegationConfession(body)) return false
  return hasGenuineTestEvidence(body)
}

async function readStdin() {
  const rl = readline.createInterface({ input: process.stdin, terminal: false })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  return raw.trim()
}

async function main() {
  const raw = await readStdin()
  if (!raw) return process.exit(0)

  let payload
  try { payload = JSON.parse(raw) } catch { return process.exit(0) }

  const event = payload.hook_event_name || payload.event
  if (event && event !== 'Stop') return process.exit(0)

  const today = todayStr()
  const cwd = payload.cwd || process.cwd()
  const docsDir = path.join(cwd, 'docs', 'skills')
  if (!fs.existsSync(docsDir)) return process.exit(0)

  const files = findVerificationFiles(docsDir)
  const missing = []

  for (const f of files) {
    let stat
    try { stat = fs.statSync(f) } catch { continue }
    const mtimeLocal = new Date(stat.mtime.getTime() - stat.mtime.getTimezoneOffset() * 60000)
    const mtimeStr = mtimeLocal.toISOString().slice(0, 10)
    if (mtimeStr !== today) continue

    let content
    try { content = fs.readFileSync(f, 'utf8') } catch { continue }

    const status = extractStatus(content)
    if (status !== 'PENDING_TEST') continue

    // 과거 수행 기록도 없고 오늘 수행 기록도 없는 경우에만 차단
    // → 섹션 7/8 cleanup-only 수정은 과거 수행 기록이 있으면 통과
    if (!hasAnyTestRecord(content) && !hasTodayTestRecord(content, today)) {
      const rel = path.relative(cwd, f)
      missing.push(rel)
    }
  }

  if (missing.length === 0) return process.exit(0)

  const msg = [
    '',
    '═══════════════════════════════════════════════════════════════',
    '❌ 세션 종료 차단 — PENDING_TEST 스킬의 2단계 테스트 미수행',
    '═══════════════════════════════════════════════════════════════',
    '',
    `다음 ${missing.length}개 스킬이 오늘(${today}) 생성/수정됐지만`,
    '섹션 5 "테스트 진행 기록"에 *진짜* 수행 기록이 없습니다.',
    '',
    '판정 기준:',
    '  • "수행일: YYYY-MM-DD" 라인 + 실제 테스트 흔적 키워드 동시 필요',
    '    (PASS / FAIL / Q1·Q2 / skill-tester 호출 / agent content test / N/N PASS)',
    '  • "skill-tester 호출 미수행", "셀프 검증" 같은 자백 라인만 있으면 차단',
    '    (셀프 검증은 skill-tester 정식 수행을 대체하지 않음)',
    '',
    ...missing.map(f => `  • ${f}`),
    '',
    '조치 (하나 선택):',
    '',
    '  A. skill-tester 에이전트 호출 (권장)',
    '     → 각 스킬마다 SKILL.md Read + 2 테스트 질문 생성 + general-purpose로',
    '       답변 확인 + verification.md 업데이트까지 자동 수행',
    '',
    '  B. 수동으로 section 5에 테스트 기록 작성',
    '     → "**수행일**: ' + today + '" 라인 + 테스트 결과(PASS/FAIL) 기록',
    '',
    '  C. 해당 스킬이 verification-policy의 "실사용 필수 스킬" 카테고리면',
    '     section 5에 agent content test 기록만 있어도 PENDING_TEST 유지 가능',
    '     (빌드 설정·워크플로우·설정+실행 카테고리)',
    '',
    '참고: @.claude/rules/verification-policy.md, @.claude/rules/creation-workflow.md',
    '═══════════════════════════════════════════════════════════════',
    '',
  ].join('\n')

  process.stderr.write(msg)
  process.exit(2)  // Stop 차단
}

if (require.main === module) {
  main().catch(err => {
    process.stderr.write(`pending-test-guard error (non-blocking): ${err.message}\n`)
    process.exit(0)
  })
}

module.exports = {
  extractStatus,
  extractSection5,
  hasAnyDateLine,
  hasGenuineTestEvidence,
  hasOnlyNegationConfession,
  hasTodayTestRecord,
  hasAnyTestRecord,
  GENUINE_TEST_KEYWORDS,
  NEGATION_KEYWORDS,
}
