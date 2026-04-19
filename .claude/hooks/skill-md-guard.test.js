#!/usr/bin/env node
/**
 * skill-md-guard.test.js
 * 실행: node .claude/hooks/skill-md-guard.test.js
 */

const { execSync } = require('child_process')
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

function runHook(toolName, filePath, content, eventName = 'PostToolUse') {
  const input = JSON.stringify({
    hook_event_name: eventName,
    tool_name: toolName,
    tool_input: { file_path: filePath, content },
  })
  fs.writeFileSync(TMP, input, 'utf8')
  try {
    const output = execSync(`node "${HOOK}" < "${TMP}"`, {
      encoding: 'utf8', timeout: 5000,
    }).trim()
    return { output: output ? JSON.parse(output) : null, exitCode: 0 }
  } catch (e) {
    let output = null
    try { output = e.stdout?.trim() ? JSON.parse(e.stdout.trim()) : null } catch {}
    return { output, exitCode: e.status ?? 1 }
  }
}

function test(desc, toolName, filePath, content, expectedPass, eventName = 'PostToolUse') {
  const { output, exitCode } = runHook(toolName, filePath, content, eventName)
  const didPass = exitCode === 0 && output === null
  const pass = didPass === expectedPass
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (exitCode: ${exitCode})`}`)
  pass ? passed++ : failed++
}

function section(title) { console.log(`\n── ${title} ──`) }

const SKILL_PATH = '.claude/skills/frontend/test-skill/SKILL.md'

console.log('🔍 skill-md-guard 테스트 시작')

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

section('Write 외 도구 → 무시 (통과)')
test('Edit 도구', 'Edit', SKILL_PATH, VALID_CONTENT, true)

section('PreToolUse 이벤트 → 무시 (통과)')
test('PreToolUse 이벤트', 'Write', SKILL_PATH, VALID_CONTENT, true, 'PreToolUse')

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
