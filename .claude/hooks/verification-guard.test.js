#!/usr/bin/env node
/**
 * verification-guard.test.js
 * 실행: node .claude/hooks/verification-guard.test.js
 */

const { spawnSync } = require('child_process')
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

function runHook(toolName, filePath, content, eventName = 'PreToolUse') {
  const input = JSON.stringify({
    hook_event_name: eventName,
    tool_name: toolName,
    tool_input: { file_path: filePath, content },
  })
  // 임시 파일로 입력 — 이모지·한글·줄바꿈이 포함된 콘텐츠도 안전하게 전달
  fs.writeFileSync(TMP, input, 'utf8')
  const r = spawnSync('node', [HOOK], { input: fs.readFileSync(TMP), encoding: 'utf8', timeout: 5000 })
  return { stdout: r.stdout || '', stderr: r.stderr || '', exitCode: r.status }
}

// 메시지 채널 단언 — PreToolUse·PostToolUse 모두 exit 2 시 Claude 에게 가는 것은 stderr.
// (PostToolUse 에서 stdout JSON 은 decision:"block" 이 있어야만 reason 이 쓰이므로 {reason} 단독은 유실)
// 차단: exit 2 + stderr 에 태그 + stdout 에 태그 없음 / 통과: exit 0 + 양 채널 모두 태그 없음
const TAG = '[verification-guard]'
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

console.log('🔍 verification-guard 테스트 시작')

section('정상 케이스 → 통과 (exit 0, 출력 없음)')
test('유효한 verification.md', 'Write', 'docs/skills/frontend/test/verification.md', VALID_CONTENT, true)

section('"내장 지식" 구문 감지 → 실패 (exit 2)')
test('"내장 지식" 구문 포함', 'Write', 'docs/skills/frontend/test/verification.md', CONTENT_WITH_NAEJANG, false)

section('"내장" 단독 (정당한 문맥) → 통과 — 오탐 방지')
const CONTENT_NAEJANG_LEGIT = VALID_CONTENT.replace(
  '| 조사 | deep-researcher | test-skill 공식 문서 | 3개 소스 수집 |',
  '| 조사 | deep-researcher | Python 내장 자료형 공식 문서 | 3개 소스 수집 |'
)
test('"Python 내장 자료형" 문맥', 'Write', 'docs/skills/backend/python-builtins/verification.md', CONTENT_NAEJANG_LEGIT, true)

section('frontmatter status 누락 → 실패')
test('status 필드 없음', 'Write', 'docs/skills/frontend/test/verification.md', CONTENT_WITHOUT_STATUS, false)

section('필수 섹션 누락 → 실패')
test('섹션 1,3,5,6,7,8 누락', 'Write', 'docs/skills/frontend/test/verification.md', CONTENT_MISSING_SECTIONS, false)

section('체크박스 전부 [❌] → 실패')
test('모든 체크박스 미완성', 'Write', 'docs/skills/frontend/test/verification.md', CONTENT_ALL_UNCHECKED, false)

section('대상 아닌 경로 → 무시 (통과)')
test('다른 경로 Write', 'Write', 'README.md', VALID_CONTENT, true)
test('docs/skills 외 경로', 'Write', 'docs/agents/test.md', VALID_CONTENT, true)

section('대상 외 이벤트/도구 조합 → 무시 (통과)')
test('PostToolUse Write (사전 차단으로 이동됨)', 'Write', 'docs/skills/frontend/test/verification.md', VALID_CONTENT, true, 'PostToolUse')
test('PreToolUse Edit (사후 검증 담당)', 'Edit', 'docs/skills/frontend/test/verification.md', VALID_CONTENT, true, 'PreToolUse')

section('PostToolUse Edit → 디스크 전체 재읽기 검증')
{
  const os = require('os')
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vg-edit-'))
  const vDir = path.join(tmpRoot, 'docs', 'skills', 'frontend', 'edit-test')
  fs.mkdirSync(vDir, { recursive: true })
  const onDisk = path.join(vDir, 'verification.md')
  fs.writeFileSync(onDisk, VALID_CONTENT)
  test('Edit — 디스크 파일 유효 → 통과', 'Edit', onDisk, undefined, true, 'PostToolUse')
  fs.writeFileSync(onDisk, CONTENT_WITHOUT_STATUS)
  test('Edit — 디스크 파일 status 누락 → 실패', 'Edit', onDisk, undefined, false, 'PostToolUse')
  fs.rmSync(tmpRoot, { recursive: true, force: true })
}

section('날짜 불일치 비차단 경고 (PostToolUse) — frontmatter date · 메타 표 · SKILL.md')
{
  const os = require('os')
  const mkProj = () => fs.mkdtempSync(path.join(os.tmpdir(), 'vg-drift-'))
  const put = (root, fm, meta, skillDate) => {
    const vDir = path.join(root, 'docs', 'skills', 'frontend', 'drift-test')
    const sDir = path.join(root, '.claude', 'skills', 'frontend', 'drift-test')
    fs.mkdirSync(vDir, { recursive: true }); fs.mkdirSync(sDir, { recursive: true })
    const v = path.join(vDir, 'verification.md')
    fs.writeFileSync(v, VALID_CONTENT.replace('date: 2026-04-17', `date: ${fm}`).replace('# 테스트 스킬 검증 문서', `# 테스트 스킬 검증 문서\n\n| 항목 | 내용 |\n|---|---|\n| 검증일 | ${meta} |`))
    if (skillDate) fs.writeFileSync(path.join(sDir, 'SKILL.md'), `# s\n\n> 검증일: ${skillDate}\n`)
    return v
  }
  const call = (tool, file, event = 'PostToolUse') => {
    const r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: event, tool_name: tool, tool_input: { file_path: file } }), encoding: 'utf8', timeout: 5000 })
    let j = null; try { j = JSON.parse(r.stdout) } catch {}
    return { code: r.status, out: r.stdout, err: r.stderr, ctx: j?.hookSpecificOutput?.additionalContext || '' }
  }
  const check = (desc, cond) => { console.log(`  ${cond ? '✅' : '❌'} ${desc}`); cond ? passed++ : failed++ }

  // 정상 — 세 곳 일치 → 조용히 통과
  let root = mkProj()
  let v = put(root, '2026-09-01', '2026-09-01', '2026-09-01')
  let r = call('Edit', v)
  check('정상: 세 곳 일치 → exit 0, 출력 없음', r.code === 0 && r.out === '' && r.err === '')
  fs.rmSync(root, { recursive: true, force: true })

  // 불일치 — 경고만(exit 0), additionalContext 로 전달, 차단 없음
  root = mkProj()
  v = put(root, '2026-09-26', '2026-09-26', '2026-04-23')
  r = call('Edit', v)
  check('불일치: exit 0(차단 아님) + stderr 없음', r.code === 0 && r.err === '')
  check('불일치: additionalContext 에 스킬 경로·불일치·각 날짜 포함', r.ctx.includes('frontend/drift-test') && r.ctx.includes('불일치') && r.ctx.includes('2026-04-23') && r.ctx.includes('2026-09-26'))
  r = call('Write', v)
  check('불일치: PostToolUse Write 도 경고만(exit 0)', r.code === 0 && r.ctx.includes('불일치'))
  r = call('Edit', v, 'PreToolUse')
  check('불일치: PreToolUse Edit 는 무시(경고 없음)', r.code === 0 && r.out === '')
  fs.rmSync(root, { recursive: true, force: true })

  // 파싱 불가 — 주석 붙은 frontmatter date → 판독 불가 경고, 크래시 없음
  root = mkProj()
  v = put(root, '2026-09-01 (최초: 2026-04-01)', '2026-09-01', '2026-09-01')
  r = call('Edit', v)
  check('파싱 불가: 주석 붙은 frontmatter date → exit 0 + 판독 불가 경고', r.code === 0 && r.ctx.includes('판독 불가'))
  fs.rmSync(root, { recursive: true, force: true })

  // 경계 — SKILL.md 없음(설치 타깃 부분 설치): 소음 없음
  root = mkProj()
  v = put(root, '2026-09-01', '2026-09-01', null)
  r = call('Edit', v)
  check('경계: 짝 SKILL.md 없음 → 경고 없음(부재는 레포 회귀 테스트 담당)', r.code === 0 && r.out === '')
  fs.rmSync(root, { recursive: true, force: true })

  // 악성 — 형식 오류로 이미 차단 대상인 파일은 기존 exit 2 유지(날짜 경고가 이를 가리지 않음)
  root = mkProj()
  v = put(root, '2026-09-26', '2026-09-26', '2026-04-23')
  fs.writeFileSync(v, fs.readFileSync(v, 'utf8').replace('status: PENDING_TEST\n', ''))
  r = call('Edit', v)
  check('악성/이상: status 누락 + 날짜 불일치 → 기존대로 exit 2(경고로 대체되지 않음)', r.code === 2 && r.err.includes('status'))
  fs.rmSync(root, { recursive: true, force: true })
}

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
