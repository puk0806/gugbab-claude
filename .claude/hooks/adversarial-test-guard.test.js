#!/usr/bin/env node
/**
 * adversarial-test-guard.test.js
 * 실행: node .claude/hooks/adversarial-test-guard.test.js
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'adversarial-test-guard.js')

let passed = 0, failed = 0

const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'adv-test-')))

// 기본은 tmp를 프로젝트 루트로 지정한다(CLAUDE_PROJECT_DIR) — 훅의 "프로젝트 밖 스킵" 로직이
// tmp 픽스처 자체를 프로젝트 밖으로 오인해 기존 차단 판정 테스트를 무력화하지 않도록 하기 위함.
function run(desc, { file, content, absPath, projectDir = tmp, cwd }, expectedExit) {
  const filePath = absPath || path.join(tmp, file)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  if (content !== undefined) fs.writeFileSync(filePath, content)
  const input = JSON.stringify({
    hook_event_name: 'PostToolUse', tool_name: 'Write',
    tool_input: { file_path: filePath, content }, cwd,
  })
  const env = { ...process.env }
  if (projectDir === null) delete env.CLAUDE_PROJECT_DIR
  else env.CLAUDE_PROJECT_DIR = projectDir
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, env })
  // 메시지 채널 단언 — PostToolUse exit 2 는 stderr 만 Claude 에게 전달된다 (stdout 은 debug log 행)
  // 차단 시: stderr 에 사유 태그 필수 + stdout 에 사유 없음 / 통과 시: 어느 채널에도 사유 없음
  const TAG = '[adversarial-test-guard]'
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
  pass ? passed++ : failed++
}

console.log('🔍 adversarial-test-guard 테스트 시작')

console.log('\n── 정상 케이스만 다수 → exit 2 (차단) ──')
run('happy-path 2케이스, 적대적 0', {
  file: 'a.test.ts',
  content: `
    test('adds two numbers', () => { expect(add(1,2)).toBe(3) })
    test('adds three numbers', () => { expect(add(1,2,3)).toBe(6) })
  `,
}, 2)

run('happy-path 3케이스, 에러 카테고리 1개뿐', {
  file: 'b.test.ts',
  content: `
    it('creates user', () => { expect(create()).toBeTruthy() })
    it('lists users', () => { expect(list()).toHaveLength(1) })
    it('throws on bad input', () => { expect(() => create()).toThrow() })
  `,
}, 2)

console.log('\n── 적대적 2카테고리 이상 → exit 0 (통과) ──')
run('에러 + 보안(403)', {
  file: 'c.test.ts',
  content: `
    it('logs in', () => { expect(login()).toBeTruthy() })
    it('rejects invalid password', () => { expect(() => login('x')).toThrow() })
    it('returns 403 for unauthorized user', () => { expect(res.status).toBe(403) })
  `,
}, 0)

run('경계 + 보안(인젝션)', {
  file: 'd.test.ts',
  content: `
    it('searches', () => { expect(search('a')).toHaveLength(1) })
    it('handles empty query', () => { expect(search('')).toEqual([]) })
    it('blocks sql injection payload', () => { expect(search("' OR 1=1")).toEqual([]) })
  `,
}, 0)

run('한국어 마커 (거부 + 권한 우회)', {
  file: 'e.test.ts',
  content: `
    it('정상 주문', () => { expect(order()).toBeTruthy() })
    it('음수 수량 거부', () => { expect(() => order(-1)).toThrow() })
    it('권한 우회 시도 차단', () => { expect(order({role:'guest'})).toBe(false) })
  `,
}, 0)

console.log('\n── TDD RED 초기(1케이스) → exit 0 ──')
run('테스트 1개만', {
  file: 'f.test.ts',
  content: `test('does the thing', () => { expect(thing()).toBe(42) })`,
}, 0)

console.log('\n── waiver 주석 → exit 0 ──')
run('waiver 존재', {
  file: 'g.test.ts',
  content: `
    // adversarial-test-guard: allow — 순수 포맷 상수 매핑, 공격 표면 없음
    test('maps a', () => { expect(m('a')).toBe('A') })
    test('maps b', () => { expect(m('b')).toBe('B') })
  `,
}, 0)

console.log('\n── 검사 제외 → exit 0 ──')
run('테스트 파일 아님 (소스)', {
  file: 'src.ts',
  content: `export const x = 1\nfunction f(){ return 1 }`,
}, 0)
run('소스 확장자 아님 (md)', {
  file: 'notes.test.md',
  content: `# happy only\n일반 문서`,
}, 0)
run('file_path 없음', { file: 'x.test.ts', content: undefined }, 0)
run('.claude/hooks/ 인프라 제외', {
  file: '.claude/hooks/foo.test.js',
  content: `test('a', () => { expect(a()).toBe(1) })\ntest('b', () => { expect(b()).toBe(2) })`,
}, 0)

console.log('\n── 프로젝트 밖 파일은 통과(스킵) — 경로 정규화 적대적 테스트 ──')
// happy-path만 담은(원래는 exit 2) 테스트 파일들 — 아래는 전부 "실제로는 프로젝트 밖(또는 안)"인 케이스.
const HAPPY_ONLY = `
  test('adds two numbers', () => { expect(add(1,2)).toBe(3) })
  test('adds three numbers', () => { expect(add(1,2,3)).toBe(6) })
`
const root = path.join(tmp, 'proj-root')
fs.mkdirSync(root, { recursive: true })
const outside = path.join(tmp, 'outside-dir')
fs.mkdirSync(outside, { recursive: true })

run('완전히 다른 디렉토리(happy만, 원래는 차단) → 프로젝트 밖이라 exit 0',
  { absPath: path.join(outside, 'a.test.ts'), content: HAPPY_ONLY, projectDir: root }, 0)

run('..로 프로젝트 루트를 벗어나는 경로(happy만) → exit 0',
  { absPath: path.join(root, '..', 'outside-dir', 'b.test.ts'), content: HAPPY_ONLY, projectDir: root }, 0)

const rootEvil = root + '-evil'
fs.mkdirSync(rootEvil, { recursive: true })
run('프로젝트 루트 접두 충돌(proj-root vs proj-root-evil, happy만) → exit 0',
  { absPath: path.join(rootEvil, 'c.test.ts'), content: HAPPY_ONLY, projectDir: root }, 0)

const outsideFile = path.join(outside, 'linked.test.ts')
fs.writeFileSync(outsideFile, HAPPY_ONLY)
const linkPath = path.join(root, 'linked.test.ts')
try {
  fs.symlinkSync(outsideFile, linkPath)
  run('심볼릭 링크로 프로젝트 안에 들어온 밖의 파일(happy만) → realpath 기준 exit 0',
    { absPath: linkPath, content: undefined, projectDir: root }, 0)
} catch (e) {
  console.log(`  ⚠️  symlink 생성 실패로 스킵: ${e.message}`)
}

{
  // 상대경로 file_path를 훅 입력의 cwd 필드(프로젝트 밖) 기준으로 해석 → 밖으로 판정돼야 한다.
  const filePath = 'rel.test.ts'
  fs.writeFileSync(path.join(outside, filePath), HAPPY_ONLY)
  const input = JSON.stringify({
    hook_event_name: 'PostToolUse', tool_name: 'Write',
    tool_input: { file_path: filePath, content: HAPPY_ONLY }, cwd: outside,
  })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, env: { ...process.env, CLAUDE_PROJECT_DIR: root } })
  const pass = r.status === 0
  console.log(`  ${pass ? '✅' : '❌'} 상대경로 file_path + 프로젝트 밖 cwd(happy만) → exit 0 → ${pass ? 'PASS' : `FAIL (${r.status})`}`)
  pass ? passed++ : failed++
}

run('상대경로 + 프로젝트 안 cwd(happy만) → 원래대로 exit 2 (차단 유지)',
  { absPath: path.join(root, 'in-rel.test.ts'), content: HAPPY_ONLY, projectDir: root, cwd: root }, 2)

const rootUpper = root.toUpperCase() === root ? null : root.toUpperCase()
if (rootUpper && fs.existsSync(rootUpper)) {
  run('대소문자만 다른 CLAUDE_PROJECT_DIR(실제로는 같은 디렉토리, happy만) → 여전히 exit 2',
    { absPath: path.join(root, 'case.test.ts'), content: HAPPY_ONLY, projectDir: rootUpper }, 2)
} else {
  console.log('  ⚠️  이 파일시스템은 대소문자 구분(case-sensitive) — 대소문자 정규화 테스트 스킵')
}

fs.rmSync(tmp, { recursive: true, force: true })

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
