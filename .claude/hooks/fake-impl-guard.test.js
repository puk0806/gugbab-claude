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
const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'fake-impl-')))
let seq = 0

/**
 * @param src   소스 파일 내용 (검사 대상)
 * @param test  대응 테스트 파일 내용 (없으면 미생성)
 * @param srcName / testName  파일명 (기본 자동)
 * @param projectDir  CLAUDE_PROJECT_DIR (기본 tmp — 모든 c<n> 하위 디렉토리를 포함)
 * @param cwd         훅 입력 cwd 필드 (상대경로 해석 기준)
 */
function run(desc, { src, test, srcName, testName, dir: dirOverride, projectDir = tmp, cwd }, expectedExit) {
  const dir = dirOverride || path.join(tmp, 'c' + seq++)
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
    tool_input: { file_path: srcPath, content: src }, cwd,
  })
  const env = { ...process.env }
  if (projectDir === null) delete env.CLAUDE_PROJECT_DIR
  else env.CLAUDE_PROJECT_DIR = projectDir
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, env })
  // 메시지 채널 단언 — PostToolUse exit 2 는 stderr 만 Claude 에게 전달된다 (stdout 은 debug log 행)
  // 차단 시: stderr 에 사유 태그 필수 + stdout 에 사유 없음 / 통과 시: 어느 채널에도 사유 없음
  const TAG = '[fake-impl-guard]'
  const out = r.stdout || '', err = r.stderr || ''
  let chanErr = ''
  if (expectedExit === 2) {
    if (!err.includes(TAG)) chanErr = 'stderr 에 차단 사유 없음'
    else if (out.includes(TAG)) chanErr = 'stdout 에 차단 사유가 섞임'
  } else if (out.includes(TAG) || err.includes(TAG)) {
    chanErr = '통과인데 차단 사유 출력'
  }
  const pass = r.status === expectedExit && !chanErr
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 ${expectedExit}, 실제 ${r.status}${chanErr ? ', ' + chanErr : ''})`}`)
  if (!pass && err) console.log('     stderr:', err.split('\n')[0])
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

console.log('\n── 프로젝트 밖 파일은 통과(스킵) — 경로 정규화 적대적 테스트 ──')
const FAKE_SRC = `export function calcDiscount(price, rate) {\n  return 900;\n}`
const FAKE_TEST = `test('discount', () => { expect(calcDiscount(1000, 0.1)).toBe(900) })`
const root = path.join(tmp, 'proj-root')
fs.mkdirSync(root, { recursive: true })
const outside = path.join(tmp, 'outside-dir')
fs.mkdirSync(outside, { recursive: true })

run('완전히 다른 디렉토리(가짜 구현, 원래는 차단) → 프로젝트 밖이라 exit 0',
  { src: FAKE_SRC, test: FAKE_TEST, dir: outside, projectDir: root }, 0)

run('..로 프로젝트 루트를 벗어나는 경로(가짜 구현) → exit 0',
  { src: FAKE_SRC, test: FAKE_TEST, dir: path.join(root, '..', 'outside-dir2'), projectDir: root }, 0)

const rootEvil = root + '-evil'
run('프로젝트 루트 접두 충돌(proj-root vs proj-root-evil, 가짜 구현) → exit 0',
  { src: FAKE_SRC, test: FAKE_TEST, dir: rootEvil, projectDir: root }, 0)

// symlink: 프로젝트 밖 실제 소스 파일을 프로젝트 안으로 심볼릭 링크 — realpath로 풀면 밖이어야 한다.
{
  const outSrcDir = path.join(tmp, 'sym-src')
  fs.mkdirSync(outSrcDir, { recursive: true })
  const outSrcPath = path.join(outSrcDir, 'mod.ts')
  fs.writeFileSync(outSrcPath, FAKE_SRC)
  fs.writeFileSync(path.join(outSrcDir, 'mod.test.ts'), FAKE_TEST)
  const linkDir = path.join(root, 'sym-link')
  fs.mkdirSync(linkDir, { recursive: true })
  const linkSrcPath = path.join(linkDir, 'mod.ts')
  try {
    fs.symlinkSync(outSrcPath, linkSrcPath)
    fs.writeFileSync(path.join(linkDir, 'mod.test.ts'), FAKE_TEST)
    const input = JSON.stringify({
      hook_event_name: 'PostToolUse', tool_name: 'Write',
      tool_input: { file_path: linkSrcPath },
    })
    const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, env: { ...process.env, CLAUDE_PROJECT_DIR: root } })
    const pass = r.status === 0
    console.log(`  ${pass ? '✅' : '❌'} 심볼릭 링크로 프로젝트 안에 들어온 밖의 파일(가짜 구현) → realpath 기준 exit 0 → ${pass ? 'PASS' : `FAIL (${r.status})`}`)
    pass ? passed++ : failed++
  } catch (e) {
    console.log(`  ⚠️  symlink 생성 실패로 스킵: ${e.message}`)
  }
}

{
  // 상대경로 file_path를 훅 입력의 cwd 필드(프로젝트 밖) 기준으로 해석 → 밖으로 판정돼야 한다.
  const relDir = path.join(outside, 'rel')
  fs.mkdirSync(relDir, { recursive: true })
  fs.writeFileSync(path.join(relDir, 'mod.ts'), FAKE_SRC)
  fs.writeFileSync(path.join(relDir, 'mod.test.ts'), FAKE_TEST)
  const input = JSON.stringify({
    hook_event_name: 'PostToolUse', tool_name: 'Write',
    tool_input: { file_path: 'mod.ts', content: FAKE_SRC }, cwd: relDir,
  })
  // 실제 하네스는 도구 실행 cwd와 훅 프로세스의 실제 cwd를 일치시켜 기동한다 — 상대경로 기반의
  // 다른 내부 로직(findTestFile 등)도 실제 상황과 같은 조건에서 검증되도록 spawn cwd도 맞춘다.
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, cwd: relDir, env: { ...process.env, CLAUDE_PROJECT_DIR: root } })
  const pass = r.status === 0
  console.log(`  ${pass ? '✅' : '❌'} 상대경로 file_path + 프로젝트 밖 cwd(가짜 구현) → exit 0 → ${pass ? 'PASS' : `FAIL (${r.status})`}`)
  pass ? passed++ : failed++
}

{
  // 같은 상대경로라도 cwd가 프로젝트 안이면 원래대로 차단돼야 한다.
  const inDir = path.join(root, 'rel-in')
  fs.mkdirSync(inDir, { recursive: true })
  fs.writeFileSync(path.join(inDir, 'mod.ts'), FAKE_SRC)
  fs.writeFileSync(path.join(inDir, 'mod.test.ts'), FAKE_TEST)
  const input = JSON.stringify({
    hook_event_name: 'PostToolUse', tool_name: 'Write',
    tool_input: { file_path: 'mod.ts', content: FAKE_SRC }, cwd: inDir,
  })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, cwd: inDir, env: { ...process.env, CLAUDE_PROJECT_DIR: root } })
  const pass = r.status === 2
  console.log(`  ${pass ? '✅' : '❌'} 상대경로 + 프로젝트 안 cwd(가짜 구현) → 원래대로 exit 2 (차단 유지) → ${pass ? 'PASS' : `FAIL (${r.status})`}`)
  pass ? passed++ : failed++
}

const rootUpper = root.toUpperCase() === root ? null : root.toUpperCase()
if (rootUpper && fs.existsSync(rootUpper)) {
  run('대소문자만 다른 CLAUDE_PROJECT_DIR(실제로는 같은 디렉토리, 가짜 구현) → 여전히 exit 2',
    { src: FAKE_SRC, test: FAKE_TEST, dir: path.join(root, 'case-check'), projectDir: rootUpper }, 2)
} else {
  console.log('  ⚠️  이 파일시스템은 대소문자 구분(case-sensitive) — 대소문자 정규화 테스트 스킵')
}

fs.rmSync(tmp, { recursive: true, force: true })

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
