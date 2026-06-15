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

// ── 최종 ────────────────────────────────────────────────────────────────
console.log(`\n결과: ${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
