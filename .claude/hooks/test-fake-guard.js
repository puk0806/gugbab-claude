#!/usr/bin/env node
/**
 * test-fake-guard.js
 * Claude Code PreToolUse Hook
 *
 * 목적: echo/printf/true 등으로 테스트 결과를 흉내내는 가짜 테스트 실행 차단
 *
 * 차단 조건:
 *   - 실제 테스트 러너 없이 echo/printf로 "tests passed" 계열 가짜 결과 출력
 *   - 실제 테스트 러너 없이 `true` 또는 `exit 0` 만으로 테스트 통과 위장
 *
 * 통과 조건:
 *   - 명령에 실제 테스트 러너(jest/vitest/playwright/pytest/cargo test 등)가 포함된 경우
 *   - pass 언어 없이 단순 echo (echo "Building...", echo "Done" 등)
 */

const readline = require('readline')
const fs = require('fs')
const path = require('path')

// 프로젝트 밖 작업 디렉토리(cwd)에는 발동하지 않는다 — CLAUDE_PROJECT_DIR(없으면 cwd) 하위 산출물에만 적용.
// symlink·`..`·대소문자(macOS)·상대경로·루트 접두 충돌까지 realpath로 정규화한다.
function realCanonical(p) {
  try { return fs.realpathSync(p) } catch {}
  try { return path.join(fs.realpathSync(path.dirname(p)), path.basename(p)) } catch {}
  return path.resolve(p)
}
function resolveProjectRoot(baseCwd) {
  const raw = process.env.CLAUDE_PROJECT_DIR || baseCwd || process.cwd()
  return realCanonical(raw)
}
// realpath는 symlink만 풀 뿐 대소문자를 온디스크 표기로 정규화하지 않는다(실측 확인) —
// macOS(APFS 기본: 대소문자 구분 없음)·Windows 대비 darwin/win32에서는 비교 직전 소문자로 접어
// 대소문자만 다른 CLAUDE_PROJECT_DIR도 같은 디렉토리로 인식하게 한다.
const CASE_INSENSITIVE_FS = process.platform === 'darwin' || process.platform === 'win32'
function isInsideProject(targetPath, baseCwd) {
  if (!targetPath) return false
  const base = baseCwd || process.cwd()
  const abs = path.isAbsolute(targetPath) ? targetPath : path.resolve(base, targetPath)
  const real = realCanonical(abs)
  const root = resolveProjectRoot(baseCwd)
  const foldedReal = CASE_INSENSITIVE_FS ? real.toLowerCase() : real
  const foldedRoot = CASE_INSENSITIVE_FS ? root.toLowerCase() : root
  const rel = path.relative(foldedRoot, foldedReal)
  return rel === '' || (rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel))
}

// 실제 테스트 러너 패턴
const REAL_TEST_RUNNERS = [
  /\bjest\b/,
  /\bvitest\b/,
  /\bmocha\b/,
  /\bjasmine\b/,
  /\bkarma\b/,
  /\bcypress\b/,
  /\bplaywright\b/,
  /\bpuppeteer\b/,
  /\bpytest\b/,
  /\bpy\.test\b/,
  /\bunittest\b/,
  /\bcargo\s+test\b/,
  /\bgo\s+test\b/,
  /\bmvn\s+(?:test|verify)\b/,
  /\bgradle\s+test\b/,
  /\.\/gradlew\s+test\b/,
  /\bnpm\s+(?:run\s+)?test\b/,
  /\bpnpm\s+(?:run\s+)?test\b/,
  /\byarn\s+(?:run\s+)?test\b/,
  /\bbun\s+test\b/,
  /\bnpx\s+(?:--yes\s+)?(?:jest|vitest|playwright|cypress|mocha)\b/,
  /\bdotnet\s+test\b/,
  /\brspec\b/,
  /\bruby\s+.*_test\.rb\b/,
  /\bphpunit\b/,
]

// 가짜 테스트 결과를 나타내는 키워드 패턴
// echo/printf 와 함께 쓰일 때 차단 대상
const FAKE_PASS_KEYWORDS = [
  // 직접적인 pass 선언
  /\btest(?:s)?\s+pass(?:ed)?\b/i,
  /\bpass(?:ed)?\s+test(?:s)?\b/i,
  /\ball\s+test(?:s)?\s+pass/i,
  /\btest\s+suite.*pass/i,
  /\bPASS(?:ED)?\b/,
  // 숫자 + pass 패턴 ("10/10 passed", "5 tests passed")
  /\b\d+\s*\/\s*\d+\s*(?:test(?:s)?\s+)?pass/i,
  /\b\d+\s+(?:test(?:s)?|spec(?:s)?|case(?:s)?)\s+pass/i,
  // 유니코드 체크마크와 숫자
  /[✓✅]\s*\d+/,
  /\d+\s*[✓✅]/,
  // "Tests: N passed" 형태
  /\btest(?:s)?:\s*\d+\s+pass/i,
  /\bpassed:\s*\d+/i,
]

// echo/printf 계열 명령으로 시작하는 패턴
const ECHO_PREFIX = /^\s*(?:echo|printf)\s+/

// 가짜 테스트 위장: 실제 테스트 없이 `true` 또는 `exit 0`만 사용
// 컨텍스트가 test-like 한 경우 (test, spec 경로가 명령에 없어도 위험)
const TRIVIAL_PASS_PATTERNS = [
  // 단독 `true` (복잡한 파이프라인 제외) — 테스트 대역으로 흔히 쓰임
  /^\s*true\s*$/,
  // 단독 `exit 0` — 아무것도 안 하고 성공 반환
  /^\s*exit\s+0\s*$/,
]

function hasRealTestRunner(cmd) {
  return REAL_TEST_RUNNERS.some(p => p.test(cmd))
}

// 한 줄 또는 전체 명령에서 가짜 패스 선언 감지
function hasFakePassDeclaration(text) {
  if (!ECHO_PREFIX.test(text)) return false
  // echo/printf 뒤의 인자 부분만 추출해서 키워드 검사
  const afterEcho = text.replace(ECHO_PREFIX, '')
  return FAKE_PASS_KEYWORDS.some(p => p.test(afterEcho))
}

function isTrivialPass(cmd) {
  return TRIVIAL_PASS_PATTERNS.some(p => p.test(cmd))
}

function detectFake(cmd) {
  // 줄 단위로 분리해서 각 줄 검사
  const lines = cmd.split('\n').map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    if (hasFakePassDeclaration(line)) return { type: 'echo', line }
  }

  // 단독 trivial pass (한 줄 명령)
  if (lines.length === 1 && isTrivialPass(cmd)) {
    return { type: 'trivial', line: cmd.trim() }
  }

  return null
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const { hook_event_name, hookEventName, tool_name, tool_input = {} } = input
  const eventName = hook_event_name || hookEventName

  if (eventName !== 'PreToolUse' || tool_name !== 'Bash') return process.exit(0)

  const cmd = (tool_input.command || '').trim()
  if (!cmd) return process.exit(0)

  const cwd = input.cwd || process.cwd()
  if (!isInsideProject(cwd, input.cwd)) return process.exit(0)

  // 실제 테스트 러너가 있으면 통과
  if (hasRealTestRunner(cmd)) return process.exit(0)

  const detected = detectFake(cmd)
  if (!detected) return process.exit(0)

  const detail = detected.type === 'trivial'
    ? `  감지: \`${detected.line}\` — 아무것도 실행하지 않고 성공을 반환합니다.`
    : `  감지: ${detected.line.slice(0, 100)}`

  process.stderr.write([
    '[test-fake-guard] ❌ 가짜 테스트 실행 차단',
    '',
    '  echo/printf/true 로 테스트 결과를 흉내내는 것은 금지됩니다.',
    '  실제 테스트 러너를 실행하세요:',
    '    jest / vitest / playwright / cypress / pytest / cargo test / npm test ...',
    '',
    detail,
    '',
  ].join('\n'))
  process.exit(2)
}

main().catch(() => process.exit(0))
