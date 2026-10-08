#!/usr/bin/env node
/**
 * package-manager-guard.test.js
 * 실행: node .claude/hooks/package-manager-guard.test.js
 *
 * 3계층: 정상(맞는 매니저·실행 명령 통과) / 악성·우회(다른 매니저 설치, 체인·치환·python -m pip 우회)
 *        / 이상·경계(lock 없음·여러 개·모노레포 하위·깨진 입력)
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'package-manager-guard.js')

let passed = 0, failed = 0
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'pmg-'))
function project(name, files) {
  const dir = path.join(base, name)
  fs.mkdirSync(path.join(dir, '.git'), { recursive: true })
  for (const [f, c] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true })
    fs.writeFileSync(path.join(dir, f), c)
  }
  return dir
}
function decide(cmd, cwd) {
  const input = typeof cmd === 'string'
    ? JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: cmd }, cwd })
    : cmd
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000 })
  if (r.status !== 0) return `EXIT${r.status}`
  const out = (r.stdout || '').trim()
  if (!out) return 'pass'
  try { return JSON.parse(out).hookSpecificOutput.permissionDecision } catch { return 'BADJSON' }
}
function t(desc, cmd, cwd, expected) {
  const a = decide(cmd, cwd)
  const ok = a === expected
  console.log(`  ${ok ? '✅' : '❌'} ${desc} → ${ok ? 'PASS' : `FAIL (기대 ${expected}, 실제 ${a})`}`)
  ok ? passed++ : failed++
}

const PNPM = project('pnpm', { 'pnpm-lock.yaml': '', 'package.json': '{}' })
const YARN = project('yarn', { 'yarn.lock': '', 'package.json': '{}' })
const NPM = project('npm', { 'package-lock.json': '{}', 'package.json': '{}' })
const BUN = project('bun', { 'bun.lock': '', 'package.json': '{}' })
const UV = project('uv', { 'uv.lock': '', 'pyproject.toml': '' })
const POETRY = project('poetry', { 'poetry.lock': '', 'pyproject.toml': '' })
const NONE = project('none', { 'package.json': '{}' })
const BOTH = project('both', { 'pnpm-lock.yaml': '', 'package-lock.json': '{}' })
const MONO = project('mono', { 'pnpm-lock.yaml': '', 'packages/web/package.json': '{}' })
const MIXED = project('mixed', { 'pnpm-lock.yaml': '', 'uv.lock': '' })

console.log('🔍 package-manager-guard 테스트 시작')

console.log('\n── 정상 경로 (맞는 매니저·실행 명령 통과) ──')
t('pnpm 프로젝트에서 pnpm add', 'pnpm add zod', PNPM, 'pass')
t('pnpm 프로젝트에서 pnpm install', 'pnpm install', PNPM, 'pass')
t('pnpm 프로젝트에서 npm run test (실행만)', 'npm run test', PNPM, 'pass')
t('pnpm 프로젝트에서 npm test', 'npm test', PNPM, 'pass')
t('pnpm 프로젝트에서 npx tsc', 'npx tsc --noEmit', PNPM, 'pass')
t('pnpm 프로젝트에서 npm view (조회)', 'npm view react version', PNPM, 'pass')
t('yarn 프로젝트에서 yarn (인자 없음 = 설치)', 'yarn', YARN, 'pass')
t('npm 프로젝트에서 npm ci', 'npm ci', NPM, 'pass')
t('bun 프로젝트에서 bun add', 'bun add hono', BUN, 'pass')
t('uv 프로젝트에서 uv add', 'uv add fastapi', UV, 'pass')
t('uv 프로젝트에서 uv run pytest', 'uv run pytest', UV, 'pass')
t('uv 프로젝트에서 pip list (조회)', 'pip list', UV, 'pass')
t('poetry 프로젝트에서 poetry add', 'poetry add httpx', POETRY, 'pass')

console.log('\n── 다른 매니저·우회 시도 → 차단 ──')
t('pnpm 프로젝트에서 npm install', 'npm install', PNPM, 'deny')
t('pnpm 프로젝트에서 npm i react', 'npm i react', PNPM, 'deny')
t('pnpm 프로젝트에서 yarn add', 'yarn add react', PNPM, 'deny')
t('pnpm 프로젝트에서 bun add', 'bun add react', PNPM, 'deny')
t('pnpm 프로젝트에서 npm uninstall', 'npm uninstall react', PNPM, 'deny')
t('pnpm 프로젝트에서 npm --save-dev install x (옵션 전치)', 'npm --save-dev install x', PNPM, 'deny')
t('yarn 프로젝트에서 npm install', 'npm install', YARN, 'deny')
t('yarn 프로젝트에서 pnpm install', 'pnpm install', YARN, 'deny')
t('npm 프로젝트에서 pnpm add', 'pnpm add x', NPM, 'deny')
t('npm 프로젝트에서 yarn (인자 없음)', 'yarn', NPM, 'deny')
t('bun 프로젝트에서 npm install', 'npm install', BUN, 'deny')
t('체인 우회: ls && npm install', 'ls && npm install x', PNPM, 'deny')
t('파이프 우회: echo y | npm i', 'echo y | npm i x', PNPM, 'deny')
t('치환 우회: echo $(npm install x)', 'echo $(npm install x)', PNPM, 'deny')
t('bash -c 우회', 'bash -c "npm install x"', PNPM, 'deny')
t('uv 프로젝트에서 pip install', 'pip install requests', UV, 'deny')
t('uv 프로젝트에서 pip3 install', 'pip3 install requests', UV, 'deny')
t('uv 프로젝트에서 python -m pip install', 'python3 -m pip install requests', UV, 'deny')
t('uv 프로젝트에서 uv pip install (lock 우회)', 'uv pip install requests', UV, 'deny')
t('uv 프로젝트에서 poetry add', 'poetry add x', UV, 'deny')
t('poetry 프로젝트에서 uv add', 'uv add x', POETRY, 'deny')
t('poetry 프로젝트에서 pip install', 'pip install x', POETRY, 'deny')
t('JS+Python 혼합: pnpm 쪽 npm install 차단', 'npm install', MIXED, 'deny')
t('JS+Python 혼합: uv 쪽 pip install 차단', 'pip install x', MIXED, 'deny')
t('모노레포 하위 폴더에서 npm install → 루트 lock 기준 차단', 'npm install', path.join(MONO, 'packages/web'), 'deny')
{
  const r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'npm install' }, cwd: PNPM }), encoding: 'utf8' })
  const reason = JSON.parse(r.stdout).hookSpecificOutput.permissionDecisionReason
  const ok = reason.includes('pnpm') && reason.includes('pnpm add')
  console.log(`  ${ok ? '✅' : '❌'} 차단 사유에 올바른 명령 안내 포함 → ${ok ? 'PASS' : `FAIL (${reason})`}`)
  ok ? passed++ : failed++
}

console.log('\n── 이상·경계 경로 → 통과 (판단 불가·크래시 없음) ──')
t('lock 파일 없는 프로젝트에서 npm install', 'npm install', NONE, 'pass')
t('lock 파일이 둘 (pnpm+npm) → 판단 불가', 'yarn add x', BOTH, 'pass')
t('JS lock 만 있는 곳에서 pip install', 'pip install x', PNPM, 'pass')
t('따옴표 속 텍스트 "npm install"', 'echo "npm install"', PNPM, 'pass')
t('주석 속 npm install', 'ls # npm install', PNPM, 'pass')
t('빈 명령', '', PNPM, 'pass')
t('존재하지 않는 cwd', 'npm install', '/nonexistent/pmg/x', 'pass')
t('Bash 가 아닌 도구', JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { command: 'npm install' }, cwd: PNPM }), PNPM, 'pass')
t('PostToolUse 이벤트', JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'npm install' }, cwd: PNPM }), PNPM, 'pass')
t('깨진 JSON', '{broken', PNPM, 'pass')
t('command 비문자열', JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 42 }, cwd: PNPM }), PNPM, 'pass')
t('초장문 명령', 'echo ' + 'a'.repeat(200000), PNPM, 'pass')

fs.rmSync(base, { recursive: true, force: true })
console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
