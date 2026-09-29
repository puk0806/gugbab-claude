#!/usr/bin/env node
/**
 * test-fake-guard.test.js — 가짜 테스트 실행 차단 테스트
 * 실행: node .claude/hooks/test-fake-guard.test.js
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'test-fake-guard.js')

let passed = 0, failed = 0

function test(desc, command, expectedExit, opts = {}) {
  const { cwd, projectDir } = opts
  const input = JSON.stringify({
    hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command }, cwd,
  })
  const env = { ...process.env }
  if (projectDir !== undefined) {
    if (projectDir === null) delete env.CLAUDE_PROJECT_DIR
    else env.CLAUDE_PROJECT_DIR = projectDir
  }
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, env })
  // 메시지 채널 단언 — PreToolUse exit 2 는 stderr 가 차단 사유로 Claude 에게 전달된다
  const TAG = '[test-fake-guard]', out = r.stdout || '', err = r.stderr || ''
  const chanErr = expectedExit === 2
    ? (!err.includes(TAG) ? 'stderr 에 차단 사유 없음' : out.includes(TAG) ? 'stdout 에 차단 사유가 섞임' : '')
    : ((out + err).includes(TAG) ? '통과인데 차단 사유 출력' : '')
  const pass = r.status === expectedExit && !chanErr
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status}${chanErr ? ', ' + chanErr : ''})`}`)
  pass ? passed++ : failed++
}

console.log('🔍 test-fake-guard 테스트 시작')

console.log('\n── 가짜 테스트 결과 위장 → exit 2 ──')
test('echo 전체 통과 위장', 'echo "All tests passed"', 2)
test('echo 숫자 통과 위장', 'echo "10/10 tests passed"', 2)
test('printf PASS 위장', 'printf "PASS: auth module"', 2)
test('echo 체크마크+숫자', 'echo "✅ 12 cases"', 2)
test('단독 true', 'true', 2)
test('단독 exit 0', 'exit 0', 2)

console.log('\n── 실제 테스트 러너 포함 → exit 0 ──')
test('pnpm test', 'pnpm test', 0)
test('vitest run', 'npx vitest run src/x.test.ts', 0)
test('cargo test', 'cargo test --workspace', 0)
test('러너 + 결과 echo 조합', 'pnpm test && echo "tests passed"', 0)
test('gradlew test', './gradlew test', 0)

console.log('\n── 무해한 echo → exit 0 ──')
test('echo Building', 'echo "Building..."', 0)
test('echo Done', 'echo "Done"', 0)
test('일반 명령', 'ls -al', 0)

console.log('\n── 대상 외 → exit 0 ──')
{
  const input = JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'echo "tests passed"' } })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000 })
  const pass = r.status === 0
  console.log(`  ${pass ? '✅' : '❌'} PostToolUse 이벤트는 검사 안 함 → ${pass ? 'PASS' : 'FAIL'}`)
  pass ? passed++ : failed++
}

console.log('\n── 프로젝트 밖 cwd는 통과(스킵) — 경로 정규화 적대적 테스트 ──')
{
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'tfg-scope-')))
  const root = path.join(tmp, 'proj-root')
  fs.mkdirSync(root, { recursive: true })
  const outside = path.join(tmp, 'outside-dir')
  fs.mkdirSync(outside, { recursive: true })

  test('완전히 다른 cwd(가짜 통과 위장, 원래는 차단) → 프로젝트 밖이라 exit 0',
    'echo "All tests passed"', 0, { cwd: outside, projectDir: root })

  test('..로 프로젝트 루트를 벗어나는 cwd(가짜 통과 위장) → exit 0',
    'echo "All tests passed"', 0, { cwd: path.join(root, '..', 'outside-dir'), projectDir: root })

  const rootEvil = root + '-evil'
  fs.mkdirSync(rootEvil, { recursive: true })
  test('프로젝트 루트 접두 충돌(proj-root vs proj-root-evil, 가짜 통과 위장) → exit 0',
    'echo "All tests passed"', 0, { cwd: rootEvil, projectDir: root })

  const outSideReal = path.join(outside, 'real')
  fs.mkdirSync(outSideReal, { recursive: true })
  const linkCwd = path.join(root, 'linked-cwd')
  try {
    fs.symlinkSync(outSideReal, linkCwd)
    test('심볼릭 링크로 프로젝트 안에 들어온 밖의 디렉토리(가짜 통과 위장) → realpath 기준 exit 0',
      'echo "All tests passed"', 0, { cwd: linkCwd, projectDir: root })
  } catch (e) {
    console.log(`  ⚠️  symlink 생성 실패로 스킵: ${e.message}`)
  }

  test('프로젝트 안 cwd(가짜 통과 위장) → 원래대로 exit 2 (차단 유지)',
    'echo "All tests passed"', 2, { cwd: root, projectDir: root })

  const rootUpper = root.toUpperCase() === root ? null : root.toUpperCase()
  if (rootUpper && fs.existsSync(rootUpper)) {
    test('대소문자만 다른 CLAUDE_PROJECT_DIR(실제로는 같은 디렉토리, 가짜 통과 위장) → 여전히 exit 2',
      'echo "All tests passed"', 2, { cwd: root, projectDir: rootUpper })
  } else {
    console.log('  ⚠️  이 파일시스템은 대소문자 구분(case-sensitive) — 대소문자 정규화 테스트 스킵')
  }

  fs.rmSync(tmp, { recursive: true, force: true })
}

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
