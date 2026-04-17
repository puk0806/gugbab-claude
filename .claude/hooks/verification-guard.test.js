#!/usr/bin/env node
/**
 * verification-guard.test.js
 * 실행: node .claude/hooks/verification-guard.test.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const HOOK = path.join(__dirname, 'verification-guard.js')
const TMP = '/tmp/verification-guard-test.json'

let passed = 0, failed = 0

// VERIFICATION_TEMPLATE.md 기준 8개 섹션을 모두 포함한 정상 verification.md
const VALID_CONTENT = `---
skill: test-skill
category: frontend
version: v1
date: 2026-04-17
status: PENDING_TEST
---

# 테스트 스킬 검증 문서

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인
- [✅] 공식 GitHub 2순위 소스 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [❌] Claude Code에서 실제 활용 테스트 (PENDING)

## 2. 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 조사 | deep-researcher | test-skill 공식 문서 | 3개 소스 수집 |
| 검증 | fact-checker | 5개 클레임 | VERIFIED 4, DISPUTED 1, UNVERIFIED 0 |

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 공식 문서 | https://example.com | ⭐⭐⭐ High | 2026-04-17 | 공식 |

## 4. 검증 체크리스트 (Test List)

### 3-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음

### 3-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)

### 3-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준

### 3-4. Claude Code 에이전트 활용 테스트
- [❌] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행

## 5. 테스트 진행 기록

### 테스트 케이스 1: PENDING

**입력:** PENDING

**기대 결과:** PENDING

**실제 결과:** PENDING

**판정:** PENDING

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| **최종 판정** | **PENDING_TEST** |

## 7. 개선 필요 사항

- [❌] 실제 에이전트 테스트 수행

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-17 | v1 | 최초 작성 | skill-creator |
`

const CONTENT_WITH_NAEJANG = VALID_CONTENT.replace(
  '| 조사 | deep-researcher | test-skill 공식 문서 | 3개 소스 수집 |',
  '| 조사 | skill-creator 내장 지식 | test-skill 9개 주제 | 내장 지식 기반 정리 |'
)

const CONTENT_WITHOUT_STATUS = VALID_CONTENT.replace('status: PENDING_TEST\n', '')

const CONTENT_MISSING_SECTIONS = `---
skill: test-skill
category: frontend
version: v1
date: 2026-04-17
status: PENDING_TEST
---

## 2. 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 조사 | deep-researcher | 조사 | 결과 |

## 4. 검증 체크리스트 (Test List)

- [✅] 확인됨
`

const CONTENT_ALL_UNCHECKED = VALID_CONTENT
  .replace(/\[✅\]/g, '[❌]')

function runHook(toolName, filePath, content, eventName = 'PostToolUse') {
  const input = JSON.stringify({
    hook_event_name: eventName,
    tool_name: toolName,
    tool_input: { file_path: filePath, content },
  })
  // 임시 파일로 입력 — 이모지·한글·줄바꿈이 포함된 콘텐츠도 안전하게 전달
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
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (exitCode: ${exitCode}, output: ${JSON.stringify(output)})`}`)
  pass ? passed++ : failed++
}

function section(title) { console.log(`\n── ${title} ──`) }

console.log('🔍 verification-guard 테스트 시작')

section('정상 케이스 → 통과 (exit 0, 출력 없음)')
test('유효한 verification.md', 'Write', 'docs/skills/frontend/test/verification.md', VALID_CONTENT, true)

section('"내장" 키워드 감지 → 실패 (exit 2)')
test('"내장" 키워드 포함', 'Write', 'docs/skills/frontend/test/verification.md', CONTENT_WITH_NAEJANG, false)

section('frontmatter status 누락 → 실패')
test('status 필드 없음', 'Write', 'docs/skills/frontend/test/verification.md', CONTENT_WITHOUT_STATUS, false)

section('필수 섹션 누락 → 실패')
test('섹션 1,3,5,6,7,8 누락', 'Write', 'docs/skills/frontend/test/verification.md', CONTENT_MISSING_SECTIONS, false)

section('체크박스 전부 [❌] → 실패')
test('모든 체크박스 미완성', 'Write', 'docs/skills/frontend/test/verification.md', CONTENT_ALL_UNCHECKED, false)

section('대상 아닌 경로 → 무시 (통과)')
test('다른 경로 Write', 'Write', 'README.md', VALID_CONTENT, true)
test('docs/skills 외 경로', 'Write', 'docs/agents/test.md', VALID_CONTENT, true)

section('Write 외 도구 → 무시 (통과)')
test('Edit 도구', 'Edit', 'docs/skills/frontend/test/verification.md', VALID_CONTENT, true)

section('PreToolUse 이벤트 → 무시 (통과)')
test('PreToolUse 이벤트', 'Write', 'docs/skills/frontend/test/verification.md', VALID_CONTENT, true, 'PreToolUse')

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
