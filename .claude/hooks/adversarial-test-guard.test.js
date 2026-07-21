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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'adv-test-'))

function run(desc, { file, content }, expectedExit) {
  const filePath = path.join(tmp, file)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  if (content !== undefined) fs.writeFileSync(filePath, content)
  const input = JSON.stringify({
    hook_event_name: 'PostToolUse', tool_name: 'Write',
    tool_input: { file_path: filePath, content },
  })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000 })
  const pass = r.status === expectedExit
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 ${expectedExit}, 실제 ${r.status})`}`)
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

fs.rmSync(tmp, { recursive: true, force: true })

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
