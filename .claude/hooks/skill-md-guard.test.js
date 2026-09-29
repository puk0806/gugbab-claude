#!/usr/bin/env node
/**
 * skill-md-guard.test.js
 * 실행: node .claude/hooks/skill-md-guard.test.js
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const HOOK = path.join(__dirname, 'skill-md-guard.js')
const TMP = '/tmp/skill-md-guard-test.json'

let passed = 0, failed = 0

const VALID_CONTENT = `---
name: test-skill
description: 테스트 스킬 한 줄 설명
---

# Test Skill

> 소스: https://example.com/docs
> 검증일: 2026-04-17

---

## 핵심 개념

검증된 내용입니다.
`

const NO_FRONTMATTER = `# Test Skill

> 소스: https://example.com/docs
> 검증일: 2026-04-17

## 핵심 개념

내용입니다.
`

const NO_NAME = `---
description: 테스트 스킬 한 줄 설명
---

# Test Skill

> 소스: https://example.com/docs
> 검증일: 2026-04-17

## 핵심 개념

내용입니다.
`

const NO_DESCRIPTION = `---
name: test-skill
---

# Test Skill

> 소스: https://example.com/docs
> 검증일: 2026-04-17

## 핵심 개념

내용입니다.
`

const NO_SOURCE = `---
name: test-skill
description: 테스트 스킬 한 줄 설명
---

# Test Skill

> 검증일: 2026-04-17

## 핵심 개념

내용입니다.
`

const NO_VERIFIED_DATE = `---
name: test-skill
description: 테스트 스킬 한 줄 설명
---

# Test Skill

> 소스: https://example.com/docs

## 핵심 개념

내용입니다.
`

function runHook(toolName, filePath, content, eventName = 'PreToolUse') {
  const input = JSON.stringify({
    hook_event_name: eventName,
    tool_name: toolName,
    tool_input: { file_path: filePath, content },
  })
  fs.writeFileSync(TMP, input, 'utf8')
  const r = spawnSync('node', [HOOK], { input: fs.readFileSync(TMP), encoding: 'utf8', timeout: 5000 })
  return { stdout: r.stdout || '', stderr: r.stderr || '', exitCode: r.status }
}

// 메시지 채널 단언 — PreToolUse·PostToolUse 모두 exit 2 시 Claude 에게 가는 것은 stderr.
// (PostToolUse 에서 stdout JSON 은 decision:"block" 이 있어야만 reason 이 쓰이므로 {reason} 단독은 유실)
// 차단: exit 2 + stderr 에 태그 + stdout 에 태그 없음 / 통과: exit 0 + 양 채널 모두 태그 없음
const TAG = '[skill-md-guard]'
function test(desc, toolName, filePath, content, expectedPass, eventName = 'PreToolUse') {
  const { stdout, stderr, exitCode } = runHook(toolName, filePath, content, eventName)
  let why = ''
  if (expectedPass) {
    if (exitCode !== 0) why = `exitCode: ${exitCode}`
    else if (stdout.trim() || stderr.includes(TAG)) why = '통과인데 사유 출력'
  } else {
    if (exitCode !== 2) why = `exitCode: ${exitCode} (기대 2)`
    else if (!stderr.includes(TAG)) why = 'stderr 에 차단 사유 없음'
    else if (stdout.includes(TAG)) why = 'stdout 에 차단 사유가 섞임'
  }
  const pass = !why
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (${why})`}`)
  pass ? passed++ : failed++
}

function section(title) { console.log(`\n── ${title} ──`) }

const SKILL_PATH = '.claude/skills/frontend/test-skill/SKILL.md'

console.log('🔍 skill-md-guard 테스트 시작 (Write = PreToolUse 사전 차단)')

section('정상 케이스 → 통과')
test('유효한 SKILL.md', 'Write', SKILL_PATH, VALID_CONTENT, true)

section('frontmatter 누락 → 실패')
test('frontmatter 없음', 'Write', SKILL_PATH, NO_FRONTMATTER, false)

section('frontmatter 필드 누락 → 실패')
test('name: 없음', 'Write', SKILL_PATH, NO_NAME, false)
test('description: 없음', 'Write', SKILL_PATH, NO_DESCRIPTION, false)

section('소스·검증일 누락 → 실패')
test('> 소스: 없음', 'Write', SKILL_PATH, NO_SOURCE, false)
test('> 검증일: 없음', 'Write', SKILL_PATH, NO_VERIFIED_DATE, false)

section('대상 아닌 경로 → 무시 (통과)')
test('다른 경로', 'Write', 'README.md', VALID_CONTENT, true)
test('.claude/skills 외 경로', 'Write', 'docs/skills/frontend/test/SKILL.md', VALID_CONTENT, true)

section('대상 외 이벤트/도구 조합 → 무시 (통과)')
test('PostToolUse Write (사전 차단으로 이동됨)', 'Write', SKILL_PATH, VALID_CONTENT, true, 'PostToolUse')
test('PreToolUse Edit (사후 검증 담당)', 'Edit', SKILL_PATH, VALID_CONTENT, true, 'PreToolUse')

section('PostToolUse Edit → 디스크 전체 재읽기 검증')
{
  const os = require('os')
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'smg-edit-'))
  const skillDir = path.join(tmpRoot, '.claude', 'skills', 'frontend', 'edit-skill')
  fs.mkdirSync(skillDir, { recursive: true })
  const validOnDisk = path.join(skillDir, 'SKILL.md')
  fs.writeFileSync(validOnDisk, VALID_CONTENT)
  test('Edit — 디스크 파일 유효 → 통과', 'Edit', validOnDisk, undefined, true, 'PostToolUse')
  fs.writeFileSync(validOnDisk, NO_SOURCE)
  test('Edit — 디스크 파일 소스 누락 → 실패', 'Edit', validOnDisk, undefined, false, 'PostToolUse')
  fs.rmSync(tmpRoot, { recursive: true, force: true })
}

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
