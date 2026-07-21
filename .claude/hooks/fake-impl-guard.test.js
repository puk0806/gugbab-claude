#!/usr/bin/env node
/**
 * fake-impl-guard.test.js
 * 실행: node .claude/hooks/fake-impl-guard.test.js
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'fake-impl-guard.js')

let passed = 0, failed = 0
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fake-impl-'))
let seq = 0

/**
 * @param src   소스 파일 내용 (검사 대상)
 * @param test  대응 테스트 파일 내용 (없으면 미생성)
 * @param srcName / testName  파일명 (기본 자동)
 */
function run(desc, { src, test, srcName, testName }, expectedExit) {
  const dir = path.join(tmp, 'c' + seq++)
  fs.mkdirSync(dir, { recursive: true })
  const sName = srcName || 'mod.ts'
  const ext = path.extname(sName)
  const tName = testName || (ext === '.py'
    ? 'test_' + path.basename(sName)
    : path.basename(sName, ext) + '.test' + ext)
  const srcPath = path.join(dir, sName)
  fs.mkdirSync(path.dirname(srcPath), { recursive: true })
  fs.writeFileSync(srcPath, src)
  if (test !== undefined) fs.writeFileSync(path.join(dir, tName), test)

  const input = JSON.stringify({
    hook_event_name: 'PostToolUse', tool_name: 'Write',
    tool_input: { file_path: srcPath, content: src },
  })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000 })
  const pass = r.status === expectedExit
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 ${expectedExit}, 실제 ${r.status})`}`)
  if (!pass && r.stdout) console.log('     stdout:', r.stdout.split('\n')[0])
  pass ? passed++ : failed++
}

console.log('🔍 fake-impl-guard 테스트 시작')

console.log('\n── 가짜 구현 → exit 2 (차단) ──')
run('숫자 리터럴 박아넣기 (function)', {
  src: `export function calcDiscount(price, rate) {\n  return 900;\n}`,
  test: `import { calcDiscount } from './mod'\ntest('discount', () => { expect(calcDiscount(1000, 0.1)).toBe(900) })`,
}, 2)

run('화살표 즉시반환 박아넣기', {
  src: `export const answer = (x) => 42`,
  test: `test('answer', () => { expect(answer(7)).toBe(42) })`,
}, 2)

run('문자열 리터럴 박아넣기', {
  src: `export function greet(name) {\n  return "hello world";\n}`,
  test: `test('greet', () => { expect(greet('Kim')).toEqual("hello world") })`,
}, 2)

run('python def 박아넣기', {
  src: `def calc(price, rate):\n    return 900`,
  srcName: 'calc.py',
  test: `from calc import calc\n\ndef test_calc():\n    assert calc(1000, 0.1) == 900`,
}, 2)

console.log('\n── 정상 구현 → exit 0 (통과) ──')
run('파라미터로 계산 (function)', {
  src: `export function calcDiscount(price, rate) {\n  return Math.round(price * (1 - rate));\n}`,
  test: `test('discount', () => { expect(calcDiscount(1000, 0.1)).toBe(900) })`,
}, 0)

run('파라미터 사용 화살표', {
  src: `export const inc = (x) => x + 1`,
  test: `test('inc', () => { expect(inc(41)).toBe(42) })`,
}, 0)

run('파라미터 없는 상수 getter', {
  src: `export function version() {\n  return "1.2.0";\n}`,
  test: `test('version', () => { expect(version()).toBe("1.2.0") })`,
}, 0)

run('리터럴이 테스트 기대값과 불일치', {
  src: `export function f(x) {\n  return 7;\n}`,
  test: `test('f', () => { expect(f(1)).toBe(3) })`,
}, 0)

run('boolean 반환은 제외 (오탐 방지)', {
  src: `export function can(x) {\n  return true;\n}`,
  test: `test('can', () => { expect(can(1)).toBe(true) })`,
}, 0)

console.log('\n── waiver / 예외 → exit 0 ──')
run('waiver 주석', {
  src: `// fake-impl-guard: allow — 고정 설정값 반환이 사양임\nexport function port(env) {\n  return 8080;\n}`,
  test: `test('port', () => { expect(port('prod')).toBe(8080) })`,
}, 0)

run('대응 테스트 파일 없음 (tdd-guard 담당)', {
  src: `export function calcDiscount(price, rate) {\n  return 900;\n}`,
  test: undefined,
}, 0)

run('테스트 파일 자체는 검사 안 함', {
  src: `test('x', () => { function calc(price) { return 900 }; expect(calc(1)).toBe(900) })`,
  srcName: 'mod.test.ts',
  test: undefined,
}, 0)

run('.claude/hooks/ 인프라 제외', {
  src: `function calc(price, rate) { return 900 }`,
  srcName: path.join('.claude', 'hooks', 'calc.js'),
  test: `test('c', () => { expect(calc(1,1)).toBe(900) })`,
}, 0)

fs.rmSync(tmp, { recursive: true, force: true })

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
