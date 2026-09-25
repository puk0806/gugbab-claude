#!/usr/bin/env node
/**
 * instructions-loaded.test.js — InstructionsLoaded 훅(누락 rules/ 파일 경고) 테스트
 * 실행: node .claude/hooks/instructions-loaded.test.js
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'instructions-loaded.js')

let passed = 0, failed = 0

const REQUIRED_RULES = [
  'agent-design.md', 'creation-workflow.md', 'git.md',
  'info-verification.md', 'readme-update.md', 'verification-policy.md',
]

function makeProjectDir(rulesToCreate) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'instr-loaded-test-'))
  const rulesDir = path.join(dir, '.claude', 'rules')
  fs.mkdirSync(rulesDir, { recursive: true })
  for (const f of rulesToCreate) fs.writeFileSync(path.join(rulesDir, f), '# rule\n')
  return dir
}

function runHook(stdinRaw, projectDir) {
  const env = { ...process.env }
  if (projectDir === undefined) delete env.CLAUDE_PROJECT_DIR
  else env.CLAUDE_PROJECT_DIR = projectDir
  return spawnSync('node', [HOOK], { input: stdinRaw, encoding: 'utf8', timeout: 5000, env })
}

function test(desc, stdinRaw, projectDir, expectedExit, opts = {}) {
  const r = runHook(stdinRaw, projectDir)
  let pass = r.status === expectedExit
  if (pass && opts.stderrIncludes) pass = r.stderr.includes(opts.stderrIncludes)
  if (pass && opts.stderrExcludes) pass = !r.stderr.includes(opts.stderrExcludes)
  if (pass && opts.stderrEmpty) pass = r.stderr.trim() === ''
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (exit ${r.status}, stderr: ${JSON.stringify(r.stderr).slice(0, 200)})`}`)
  pass ? passed++ : failed++
}

console.log('🔍 instructions-loaded 테스트 시작')

const fullDir = makeProjectDir(REQUIRED_RULES)
const partialDir = makeProjectDir(REQUIRED_RULES.slice(0, 3)) // 3개 누락
const emptyRulesDir = makeProjectDir([]) // rules/ 있지만 전부 없음
const noRulesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'instr-loaded-norules-'))

const validStdin = JSON.stringify({ hook_event_name: 'InstructionsLoaded', cwd: '/proj' })

console.log('\n── 정상 흐름 ──')
test('모든 rules 파일 존재 → exit 0, 경고 없음', validStdin, fullDir, 0, { stderrEmpty: true })
test('일부 rules 파일 누락(3개) → exit 0, 경고에 누락 파일 나열', validStdin, partialDir, 0, {
  stderrIncludes: '누락된 rules/ 파일 감지 (3개)',
})
test('rules/ 파일 전부 없음(6개) → exit 0, 경고에 6개 표기', validStdin, emptyRulesDir, 0, {
  stderrIncludes: '누락된 rules/ 파일 감지 (6개)',
})
test('rules/ 디렉토리 자체가 없음 → exit 0, 조용히 통과(다른 프로젝트일 수 있음)', validStdin, noRulesDir, 0, { stderrEmpty: true })

console.log('\n── 악성/경계 — 입력 조작 ──')
test('빈 stdin → exit 0 (조기 리턴)', '', fullDir, 0, { stderrEmpty: true })
test('깨진 JSON stdin → exit 0 (parse 실패 시 조용히 통과)', '{broken json,,,', fullDir, 0, { stderrEmpty: true })
test('공백만 있는 stdin → exit 0', '   \n\t  ', fullDir, 0, { stderrEmpty: true })
test('JSON이지만 최상위가 배열 → exit 0 (필드 접근 안 함, 크래시 없음)', '[1,2,3]', fullDir, 0)
test('JSON이지만 null → exit 0', 'null', fullDir, 0)
test('필수 필드 전부 누락(빈 객체) → exit 0 (필드 의존 없이 rules/만 검사)', '{}', fullDir, 0, { stderrEmpty: true })

console.log('\n── 악성/경계 — 거대 입력 ──')
const hugeValidJson = JSON.stringify({ hook_event_name: 'X', padding: 'a'.repeat(2_000_000) })
test('거대 유효 JSON(2MB 문자열 필드) → exit 0, 정상 처리', hugeValidJson, fullDir, 0, { stderrEmpty: true })
const hugeBrokenJson = 'a'.repeat(2_000_000) + '{not json'
test('거대 깨진 입력(2MB) → exit 0, 멈추지 않고 조용히 통과', hugeBrokenJson, fullDir, 0, { stderrEmpty: true })

console.log('\n── 악성/경계 — CLAUDE_PROJECT_DIR 경로 조작 ──')
test('CLAUDE_PROJECT_DIR 경로 순회 문자열(존재하지 않는 경로) → exit 0, 크래시 없음',
  validStdin, path.join(fullDir, '..', '..', '..', '..', 'nonexistent-xyz'), 0)
test('CLAUDE_PROJECT_DIR 없음(env 미설정) → exit 0, cwd 기준으로 동작(크래시 없음)', validStdin, undefined, 0)

// 셸 메타문자가 섞인 프로젝트 경로 — fs 계열만 사용하므로 셸로 전달되지 않아야 함(인젝션 불가 확인)
const injectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'instr-loaded-inject-; touch pwned;-'))
const injectRulesDir = path.join(injectDir, '.claude', 'rules')
fs.mkdirSync(injectRulesDir, { recursive: true })
const markerPath = path.join(os.tmpdir(), `instr-loaded-marker-${Date.now()}`)
test('경로에 셸 메타문자(; ` $()) 포함 → exit 0, 셸 실행되지 않음(마커 파일 미생성)',
  validStdin, injectDir, 0)
if (fs.existsSync(markerPath)) {
  console.log('  ❌ 인젝션 마커 파일이 생성됨 — 셸 인젝션 의심')
  failed++
} else {
  console.log('  ✅ 인젝션 마커 파일 없음 — 셸로 전달되지 않음 확인')
  passed++
}

// cleanup
for (const d of [fullDir, partialDir, emptyRulesDir, noRulesDir, injectDir]) {
  try { fs.rmSync(d, { recursive: true, force: true }) } catch {}
}

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
