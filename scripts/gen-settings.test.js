#!/usr/bin/env node
/**
 * gen-settings.test.js
 * 실행: node scripts/gen-settings.test.js
 */

const { execSync } = require('child_process')
const path = require('path')
const GEN = path.join(__dirname, 'gen-settings.js')

let passed = 0, failed = 0

function generate(...flags) {
  const output = execSync(`node "${GEN}" ${flags.join(' ')}`, { encoding: 'utf8' })
  return JSON.parse(output)
}

function assert(desc, actual, expected) {
  const pass = actual === expected
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${expected}, 실제: ${actual})`}`)
  pass ? passed++ : failed++
}

// ── superpowers 조건부 ───────────────────────────────────────────────────
console.log('\n[enabledPlugins] superpowers 조건부 포함')
{
  const s = generate()
  assert('플래그 없음 → enabledPlugins 없음', s.enabledPlugins, undefined)
}
{
  const s = generate('--superpowers')
  assert('--superpowers → superpowers 포함', s.enabledPlugins?.['superpowers@superpowers-marketplace'], true)
  assert('--superpowers만 → codex 미포함', s.enabledPlugins?.['codex@openai-codex'], undefined)
}
{
  const s = generate('--codex')
  assert('--codex만 → codex 포함', s.enabledPlugins?.['codex@openai-codex'], true)
  assert('--codex만 → superpowers 미포함', s.enabledPlugins?.['superpowers@superpowers-marketplace'], undefined)
}
{
  const s = generate('--superpowers', '--codex')
  assert('--superpowers --codex → 둘 다 포함 (superpowers)', s.enabledPlugins?.['superpowers@superpowers-marketplace'], true)
  assert('--superpowers --codex → 둘 다 포함 (codex)', s.enabledPlugins?.['codex@openai-codex'], true)
}

// ── 다른 플래그와 조합 ───────────────────────────────────────────────────
console.log('\n[enabledPlugins] 다른 플래그 조합')
{
  const s = generate('--superpowers', '--dev', '--typescript', '--memory')
  assert('--superpowers + dev flags → superpowers 포함', s.enabledPlugins?.['superpowers@superpowers-marketplace'], true)
  assert('codex 미포함 유지', s.enabledPlugins?.['codex@openai-codex'], undefined)
}
{
  const s = generate('--superpowers', '--codex', '--dev', '--memory', '--readme-guard')
  assert('전체 플래그 → superpowers 포함', s.enabledPlugins?.['superpowers@superpowers-marketplace'], true)
  assert('전체 플래그 → codex 포함', s.enabledPlugins?.['codex@openai-codex'], true)
}

// ── 기본 구조 검증 ───────────────────────────────────────────────────────
console.log('\n[구조] 필수 필드')
{
  const s = generate()
  assert('defaultMode = acceptEdits', s.defaultMode, 'acceptEdits')
  assert('permissions.allow 존재', Array.isArray(s.permissions?.allow), true)
  assert('permissions.deny 존재', Array.isArray(s.permissions?.deny), true)
  assert('hooks.Stop 존재', Array.isArray(s.hooks?.Stop), true)
  assert('statusLine 존재', typeof s.statusLine, 'object')
  assert('플러그인 없으면 enabledPlugins 필드 자체 없음', 'enabledPlugins' in s, false)
}

// ── 훅 다이어트 (2026-07) 배선 검증 ─────────────────────────────────────
console.log('\n[훅 다이어트] deliverable-guard 통합 · 제거 훅 미참조')
{
  const flat = (s) => JSON.stringify(s.hooks)
  const s = generate('--dev', '--memory', '--readme-guard', '--codex')
  assert('Stop에 deliverable-guard 포함', flat(s).includes('deliverable-guard.js') , true)
  assert('제거된 훅 미참조 (pending-test/readme/session-summary/handoff/task-plan/confirmation-gate/verification-gate/careful-with-judge/memory-stop)',
    /pending-test-guard|readme-guard\.js|session-summary|session-handoff|task-plan-guard|confirmation-gate|verification-gate|careful-with-judge|memory-stop-guard/.test(flat(s)), false)
  assert('UserPromptSubmit 이벤트 제거됨', 'UserPromptSubmit' in s.hooks, false)
  const stopCmds = s.hooks.Stop[0].hooks.map(h => h.command)
  assert('Stop 훅 4개 이하 (deliverable+codex+export+notify — memory-stop 제거)', stopCmds.length <= 4, true)
  assert('Stop에 session-export 포함 (강제 보존)', stopCmds.some(c => c.includes('session-export.js')), true)
}
{
  const s = generate('--util')
  assert('util 모드 Stop에 session-export+cc-notify만 (opt-in 미선택)', s.hooks.Stop[0].hooks.length, 2)
  assert('util 모드 Stop에도 session-export 포함 (강제 보존)',
    JSON.stringify(s.hooks.Stop).includes('session-export.js'), true)
  const utilPreWrite = s.hooks.PreToolUse.find(b => b.matcher === 'Write').hooks.map(h => h.command).join(' ')
  assert('util 모드 PreToolUse Write에 구조 검증 3종 미포함 (최소 구성)',
    ['verification-guard', 'skill-md-guard', 'agent-md-guard'].some(n => utilPreWrite.includes(n)), false)
}
{
  const s = generate('--util', '--readme-guard', '--branch-protection')
  const flatPre = JSON.stringify(s.hooks.PreToolUse)
  const flatStop = JSON.stringify(s.hooks.Stop)
  const flatPost = JSON.stringify(s.hooks.PostToolUse)
  assert('util + --readme-guard → PreToolUse Bash에 deliverable-guard 보존', flatPre.includes('deliverable-guard'), true)
  assert('util + --readme-guard → Stop에 deliverable-guard 보존', flatStop.includes('deliverable-guard'), true)
  assert('util + --readme-guard → PostToolUse 세션 추적 배선', flatPost.includes('deliverable-guard'), true)
  assert('util + --branch-protection → PreToolUse Bash에 branch-protection 보존', flatPre.includes('branch-protection'), true)
}
{
  const s = generate('--dev')
  const stopDeliverable = s.hooks.Stop[0].hooks.find(h => h.command.includes('deliverable-guard'))
  assert('--readme-guard 미선택 → Stop deliverable에 --no-readme 전달', stopDeliverable.command.includes('--no-readme'), true)
}
{
  const s = generate('--dev', '--readme-guard')
  const stopDeliverable = s.hooks.Stop[0].hooks.find(h => h.command.includes('deliverable-guard'))
  assert('--readme-guard 선택 → Stop deliverable README 검사 활성 (--no-readme 없음)', stopDeliverable.command.includes('--no-readme'), false)
}

// ── memory push 가드 배선 (2026-07-10) ──────────────────────────────────
console.log('\n[memory 가드] --memory 시 PreToolUse Bash에 deliverable-guard 배선')
{
  const preBashCmds = (s) => (s.hooks.PreToolUse.filter(b => b.matcher === 'Bash')
    .flatMap(b => b.hooks.map(h => h.command))).join(' | ')
  const m = generate('--dev', '--memory')
  assert('--memory(readme-guard 없이) → PreToolUse Bash에 deliverable --no-readme 배선',
    preBashCmds(m).includes('deliverable-guard.js --no-readme'), true)
  const r = generate('--dev', '--memory', '--readme-guard')
  assert('--memory + --readme-guard → 플래그 없는 deliverable 배선 (중복 없음)',
    preBashCmds(r).includes('deliverable-guard.js') && !preBashCmds(r).includes('--no-readme'), true)
  const neither = generate('--dev')
  assert('memory·readme-guard 둘 다 없으면 PreToolUse Bash에 deliverable 미배선',
    preBashCmds(neither).includes('deliverable-guard'), false)
  const u = generate('--util', '--memory')
  assert('util + --memory → PreToolUse Bash에 deliverable --no-readme 배선',
    preBashCmds(u).includes('deliverable-guard.js --no-readme'), true)
}

// ── 구조 검증 3종 사전 차단 격상 (2026-07) ──────────────────────────────
console.log('\n[사전 차단] verification/skill-md/agent-md — PreToolUse Write')
{
  const s = generate('--dev')
  const preWrite = s.hooks.PreToolUse.find(b => b.matcher === 'Write').hooks.map(h => h.command).join(' ')
  const postWrite = s.hooks.PostToolUse.find(b => b.matcher === 'Write').hooks.map(h => h.command).join(' ')
  const postEdit = s.hooks.PostToolUse.find(b => b.matcher === 'Edit').hooks.map(h => h.command).join(' ')
  assert('PreToolUse Write에 구조 검증 3종 배선',
    ['verification-guard', 'skill-md-guard', 'agent-md-guard'].every(n => preWrite.includes(n)), true)
  assert('PostToolUse Write에서 구조 검증 3종 제거',
    ['verification-guard', 'skill-md-guard', 'agent-md-guard'].some(n => postWrite.includes(n)), false)
  assert('PostToolUse Edit에 구조 검증 3종 배선 (디스크 재읽기)',
    ['verification-guard', 'skill-md-guard', 'agent-md-guard'].every(n => postEdit.includes(n)), true)
  const editCmds = s.hooks.PostToolUse.find(b => b.matcher === 'Edit').hooks.map(h => h.command)
  const writeCmds = s.hooks.PostToolUse.find(b => b.matcher === 'Write').hooks.map(h => h.command)
  assert('PostToolUse Edit 선두 = deliverable-guard (추적이 차단 훅보다 먼저)',
    editCmds[0].includes('deliverable-guard'), true)
  assert('PostToolUse Write 선두 = deliverable-guard',
    writeCmds[0].includes('deliverable-guard'), true)
}

// ── 최종 ────────────────────────────────────────────────────────────────
console.log(`\n결과: ${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
