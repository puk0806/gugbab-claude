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
 *   3. 섹션 5 "테스트 진행 기록"에 "수행일: YYYY-MM-DD" 라인이 **하나도 없으면** 차단
 *      → 과거 수행 기록이 있으면 섹션 7/8 cleanup-only 수정은 통과 (cleanup 허용 완화)
 *      → 신규 스킬(섹션 5 빈 상태)은 여전히 차단되어 skill-tester 호출 유도
 *   4. stderr로 skill-tester 호출 지시 + exit 2 (Stop 차단)
 *
 * 블로킹 정책:
 *   - PENDING_TEST이고 섹션 5에 어떤 수행일 라인도 없으면 → 차단 (exit 2)
 *   - PENDING_TEST이지만 섹션 5에 과거 수행 기록이 있으면 → 통과 (섹션 7 cleanup-only 허용)
 *   - APPROVED이거나 수정이 오늘이 아니면 → 통과
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
  const m = content.match(/^---[\s\S]+?\n\s*status:\s*([A-Z_]+)\s*\n[\s\S]+?---/m)
  return m ? m[1].trim() : null
}

function hasTodayTestRecord(content, today) {
  const section5Match = content.match(
    /##\s+5\.\s+테스트\s+진행\s+기록([\s\S]*?)(?=\n##\s+\d|\n---\s*$|$)/i
  )
  if (!section5Match) return false
  const body = section5Match[1]
  const re = new RegExp(`수행일[\\s*:：]+${today}`)
  return re.test(body)
}

// 섹션 5에 어떤 형식이든 "수행일: YYYY-MM-DD" 라인이 존재하는지
// 존재하면 과거 수행 기록이 있다고 간주해 섹션 7 cleanup-only 수정을 허용
function hasAnyTestRecord(content) {
  const section5Match = content.match(
    /##\s+5\.\s+테스트\s+진행\s+기록([\s\S]*?)(?=\n##\s+\d|\n---\s*$|$)/i
  )
  if (!section5Match) return false
  const body = section5Match[1]
  return /수행일[\s*:：]+\d{4}-\d{2}-\d{2}/.test(body)
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
    '섹션 5 "테스트 진행 기록"에 어떤 "수행일" 라인도 없습니다:',
    '(과거 수행 기록이라도 있으면 섹션 7 cleanup은 통과합니다)',
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

main().catch(err => {
  process.stderr.write(`pending-test-guard error (non-blocking): ${err.message}\n`)
  process.exit(0)
})
