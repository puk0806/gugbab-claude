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

// ── superpowers 항상 포함 ────────────────────────────────────────────────
console.log('\n[enabledPlugins] superpowers 항상 포함')
{
  const s = generate()
  assert('플래그 없음 → superpowers 포함', s.enabledPlugins?.['superpowers@superpowers-marketplace'], true)
  assert('플래그 없음 → codex 미포함', s.enabledPlugins?.['codex@openai-codex'], undefined)
}
{
  const s = generate('--codex')
  assert('--codex → superpowers 포함', s.enabledPlugins?.['superpowers@superpowers-marketplace'], true)
  assert('--codex → codex 포함', s.enabledPlugins?.['codex@openai-codex'], true)
}
{
  const s = generate('--dev', '--typescript', '--memory')
  assert('--dev --typescript --memory → superpowers 포함', s.enabledPlugins?.['superpowers@superpowers-marketplace'], true)
  assert('--dev --typescript --memory → codex 미포함', s.enabledPlugins?.['codex@openai-codex'], undefined)
}
{
  const s = generate('--codex', '--dev', '--memory', '--readme-guard')
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
}

// ── 최종 ────────────────────────────────────────────────────────────────
console.log(`\n결과: ${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
