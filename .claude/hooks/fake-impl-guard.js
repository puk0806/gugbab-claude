#!/usr/bin/env node
/**
 * fake-impl-guard.js
 * Claude Code PostToolUse Hook (Write | Edit) — 개발 전용
 *
 * 목적: "테스트를 통과시키려고 기대값을 그대로 박아넣은 가짜 구현"을 차단한다.
 *       (@.claude/rules/adversarial-testing.md §3 — A안: hard block)
 *
 * 차단 조건 (모두 충족 — 오탐 최소화):
 *   1. 대상이 소스 파일이고, 대응 테스트 파일이 존재한다
 *   2. 함수에 파라미터가 1개 이상 있는데
 *   3. 그 함수가 파라미터를 하나도 사용하지 않고
 *   4. 문자열/숫자 리터럴을 return 하며
 *   5. 그 리터럴이 테스트 파일의 기대값(toBe/toEqual/assertEquals 등)과 일치한다
 *
 * → 입력을 무시하고 정답 리터럴만 돌려주는 전형적 gaming. 실제 로직이 아니다.
 *
 * 통과 조건:
 *   - 파라미터 없는 함수(상수·버전 getter 등)
 *   - 파라미터를 실제로 사용하는 함수
 *   - boolean/null 반환(정상 스텁과 구분 불가 — 오탐 방지 위해 제외)
 *   - waiver 주석: `fake-impl-guard: allow — <이유>`
 */

const fs = require('fs')
const path = require('path')

const SOURCE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.py']

const WAIVER = /fake-impl-guard:\s*allow\s*[—\-:]/i

// 리터럴: 문자열 또는 숫자 (boolean/null 제외 — 오탐 방지)
const LIT = `('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*"|-?\\d+(?:\\.\\d+)?)`

function isTestFile(filePath) {
  const base = path.basename(filePath)
  return (
    /\.(test|spec)\./.test(base) ||
    /_test\.[a-z]+$/.test(base) ||
    /(?:^|\/)__tests__\//.test(filePath) ||
    /^test_.*\.py$/.test(base)
  )
}

// 대응 테스트 파일 경로 후보 (tdd-guard와 동일 규칙)
function findTestFile(filePath) {
  const ext = path.extname(filePath)
  const basename = path.basename(filePath, ext)
  const dir = path.dirname(filePath)
  const candidates = [
    path.join(dir, `${basename}.test${ext}`),
    path.join(dir, `${basename}.spec${ext}`),
    path.join(dir, '__tests__', `${basename}.test${ext}`),
    path.join(dir, '__tests__', `${basename}.spec${ext}`),
    path.join(path.dirname(dir), '__tests__', `${basename}.test${ext}`),
    path.join(path.dirname(dir), '__tests__', `${basename}.spec${ext}`),
  ]
  if (ext === '.py') candidates.push(path.join(dir, `test_${basename}.py`))
  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c } catch {}
  }
  return null
}

function normLit(raw) {
  const s = raw.trim()
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    return 's:' + s.slice(1, -1)
  }
  return 'n:' + String(Number(s))
}

// 테스트 파일에서 "기대값" 리터럴만 수집 (assertion 위치 한정 — 오탐 방지)
function collectExpected(testText) {
  const set = new Set()
  const patterns = [
    new RegExp(`\\.(?:toBe|toEqual|toStrictEqual|toReturnWith|toHaveReturnedWith)\\(\\s*${LIT}\\s*\\)`, 'g'),
    new RegExp(`\\.(?:to\\.equal|to\\.eql|equals?)\\(\\s*${LIT}\\s*\\)`, 'g'),
    new RegExp(`assertEquals?\\(\\s*[^,()]+,\\s*${LIT}\\s*\\)`, 'g'),
    new RegExp(`assertEquals?\\(\\s*${LIT}\\s*,`, 'g'),
    new RegExp(`assert\\s+[^\\n=]+==\\s*${LIT}`, 'g'),          // python
    new RegExp(`assert_eq!\\(\\s*[^,]+,\\s*${LIT}\\s*\\)`, 'g'), // rust (참고)
  ]
  for (const re of patterns) {
    let m
    while ((m = re.exec(testText))) set.add(normLit(m[1]))
  }
  return set
}

// 소스에서 (파라미터, 본문) 함수 단위 추출 — function / 화살표 형태
function extractFunctions(src) {
  const fns = []

  // 1) function name(params) { ...block... }  및  name = (params) => { ...block... }
  const blockHeader = /(?:function\s+[A-Za-z0-9_$]*\s*\(([^)]*)\)|\(([^)]*)\)\s*=>)\s*\{/g
  let m
  while ((m = blockHeader.exec(src))) {
    const params = (m[1] || m[2] || '').trim()
    // 여는 중괄호 위치에서 균형 매칭으로 본문 추출
    const openIdx = src.indexOf('{', m.index + m[0].length - 1)
    if (openIdx === -1) continue
    let depth = 0, i = openIdx, end = -1
    for (; i < src.length; i++) {
      const ch = src[i]
      if (ch === '{') depth++
      else if (ch === '}') { depth--; if (depth === 0) { end = i; break } }
    }
    if (end === -1) continue
    fns.push({ params, body: src.slice(openIdx + 1, end) })
  }

  // 2) 화살표 즉시반환: name = (params) => <expr>
  const implicit = /\(([^)]*)\)\s*=>\s*([^;\n{][^;\n]*)/g
  while ((m = implicit.exec(src))) {
    fns.push({ params: (m[1] || '').trim(), body: 'return ' + m[2] })
  }

  // 3) python: def name(params): return <expr>
  const py = /def\s+[A-Za-z0-9_]+\s*\(([^)]*)\)\s*(?:->[^:]+)?:\s*(?:\n\s*)?(?:#[^\n]*\n\s*)?return\s+([^\n]+)/g
  while ((m = py.exec(src))) {
    fns.push({ params: (m[1] || '').trim(), body: 'return ' + m[2] })
  }

  return fns
}

function paramIdentifiers(paramStr) {
  if (!paramStr.trim()) return []
  // self/cls(python), this 제외
  const ids = paramStr.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) || []
  return ids.filter(id => id !== 'self' && id !== 'cls')
}

// 함수가 파라미터를 하나라도 본문에서 사용하는가
function usesAnyParam(body, ids) {
  if (ids.length === 0) return true // 파라미터 없음 → 검사 대상 아님(사용한 것으로 간주)
  for (const id of ids) {
    if (new RegExp(`\\b${id.replace(/[$]/g, '\\$')}\\b`).test(body)) return true
  }
  return false
}

// 본문에서 return 하는 문자열/숫자 리터럴 수집
function returnedLiterals(body) {
  const set = new Set()
  const re = new RegExp(`return\\s+${LIT}\\s*(?:;|$|\\n)`, 'g')
  let m
  while ((m = re.exec(body))) set.add(normLit(m[1]))
  return set
}

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'))
  const filePath = input.tool_input?.file_path || input.tool_input?.path
  if (!filePath) process.exit(0)

  // 레포 인프라(훅·커맨드·스크립트)는 제품 코드가 아니므로 제외 (tdd-guard와 동일 철학)
  if (/\.claude\/(?:hooks|commands)\//.test(filePath) || /(?:^|\/)scripts\//.test(filePath)) process.exit(0)

  const ext = path.extname(filePath)
  if (!SOURCE_EXTS.includes(ext)) process.exit(0)
  if (isTestFile(filePath)) process.exit(0)

  // 소스 내용
  let src = input.tool_input?.content
  if (typeof src !== 'string' || !src.length) {
    try { src = fs.readFileSync(filePath, 'utf8') } catch { process.exit(0) }
  }
  if (!src.trim()) process.exit(0)
  if (WAIVER.test(src)) process.exit(0)

  const testPath = findTestFile(filePath)
  if (!testPath) process.exit(0) // 테스트 없으면 tdd-guard가 담당

  let testText = ''
  try { testText = fs.readFileSync(testPath, 'utf8') } catch { process.exit(0) }
  const expected = collectExpected(testText)
  if (expected.size === 0) process.exit(0)

  const offenders = []
  for (const fn of extractFunctions(src)) {
    const ids = paramIdentifiers(fn.params)
    if (ids.length === 0) continue          // 파라미터 없음 → 제외(상수 getter 등)
    if (usesAnyParam(fn.body, ids)) continue // 파라미터 사용 → 정상
    for (const lit of returnedLiterals(fn.body)) {
      if (expected.has(lit)) {
        offenders.push(lit.replace(/^s:/, '"').replace(/^n:/, ''))
      }
    }
  }

  if (offenders.length === 0) process.exit(0)

  const rel = path.relative(process.cwd(), filePath)
  process.stdout.write([
    `[fake-impl-guard] ❌ 테스트 통과용 가짜 구현 감지: ${rel}`,
    '',
    `  파라미터를 무시하고 테스트 기대값을 그대로 반환하는 함수가 있습니다.`,
    `  일치한 리터럴: ${[...new Set(offenders)].join(', ')}`,
    '',
    '  → 입력(파라미터)으로 결과를 계산하는 실제 로직으로 구현하세요.',
    '  → 테스트 자체가 잘못됐다면, 테스트를 다시 짜고 그에 맞는 실제 구현을 하세요.',
    '  → 파라미터 없는 상수 반환이 정당하다면: `fake-impl-guard: allow — <이유>`',
    '',
    '  근거: @.claude/rules/adversarial-testing.md §3',
    '',
  ].join('\n'))
  process.exit(2)
} catch {
  process.exit(0)
}
