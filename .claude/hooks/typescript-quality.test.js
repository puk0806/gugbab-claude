#!/usr/bin/env node
/**
 * typescript-quality.test.js — tsc 실행 조건 판정 + --changed-only 차단 판정 테스트
 * 실행: node .claude/hooks/typescript-quality.test.js
 *
 * 실제 tsc(느림·네트워크)는 쓰지 않는다. 임시 프로젝트의 node_modules/.bin/tsc 에 셸 스텁을 두어
 * npx 가 그것을 집도록 하고, 스텁이 내는 출력·종료 코드를 제어해 훅의 판정만 검증한다.
 *
 * 3계층: 정상(에러 없음→통과) / 악성·오남용(무관 에러로 차단 유도, 경로 조작) / 경계(빈 출력·타임아웃·공백 경로)
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'typescript-quality.js')
// 상태 파일(베이스라인·카운터)은 실사용 시 ~/.claude/typescript-quality/ 에 남는다 — 테스트는 격리 디렉토리로 돌린다
const STATE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'tsq-state-'))
process.env.TSQ_STATE_DIR = STATE_DIR

let passed = 0, failed = 0

function run(filePath, hookArgs = [], env = {}) {
  const input = JSON.stringify({
    hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: filePath },
  })
  return spawnSync('node', [HOOK, ...hookArgs], {
    input, encoding: 'utf8', timeout: 20000, env: { ...process.env, ...env },
  })
}

function test(desc, filePath, expectedExit, hookArgs = [], env = {}, stderrCheck = null) {
  const r = run(filePath, hookArgs, env)
  let pass = r.status === expectedExit
  if (pass && stderrCheck) pass = stderrCheck(r.stderr || '')
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status})\n     stderr: ${(r.stderr || '').trim().slice(0, 200)}`}`)
  pass ? passed++ : failed++
}

// 임시 프로젝트 + tsc 스텁 생성. 스텁은 TSC_STUB_OUT 환경변수의 내용을 출력하고 TSC_STUB_EXIT 로 종료.
function makeProject(name) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `tsq-${name}-`))
  fs.writeFileSync(path.join(root, 'tsconfig.json'), '{"compilerOptions":{"strict":true}}')
  fs.mkdirSync(path.join(root, 'src', 'domain a'), { recursive: true })
  fs.writeFileSync(path.join(root, 'src', 'edited.ts'), 'export const a = 1')
  fs.writeFileSync(path.join(root, 'src', 'other.ts'), 'export const b = 2')
  fs.writeFileSync(path.join(root, 'src', 'domain a', 'sp ace.ts'), 'export const c = 3')
  const bin = path.join(root, 'node_modules', '.bin')
  fs.mkdirSync(bin, { recursive: true })
  const stub = path.join(bin, 'tsc')
  fs.writeFileSync(stub, [
    '#!/bin/sh',
    'if [ -n "$TSC_STUB_SLEEP" ]; then sleep "$TSC_STUB_SLEEP"; fi',
    'printf "%b" "$TSC_STUB_OUT"',
    'exit "${TSC_STUB_EXIT:-0}"',
  ].join('\n'))
  fs.chmodSync(stub, 0o755)
  // npx --yes tsc 는 로컬 node_modules/.bin 을 우선 사용한다. package.json 이 있어야 프로젝트로 인식.
  fs.writeFileSync(path.join(root, 'package.json'), '{"name":"tsq-fixture","private":true}')
  return root
}


// --changed-only 는 프로젝트별 베이스라인(직전 통과 시점의 에러 집합)을 OS tmp 에 남긴다.
// 베이스라인 없음(첫 실행)을 전제하는 테스트는 실행 전에 지운다.
const crypto = require('crypto')
function baselinePath(projRoot) {
  const key = crypto.createHash('sha1').update(projRoot).digest('hex').slice(0, 12)
  return path.join(STATE_DIR, `claude-tsq-${key}.baseline.json`)
}
function resetBaseline(projRoot) { try { fs.unlinkSync(baselinePath(projRoot)) } catch {} }
function resetTimeouts(projRoot) { try { fs.unlinkSync(baselinePath(projRoot).replace('.baseline.json', '.timeouts')) } catch {} }

console.log('🔍 typescript-quality 테스트 시작')

// ── 실행 조건 (tsc 실행 안 함) ───────────────────────────────────────────
console.log('\n── 검사 제외 → exit 0 ──')
const noTs = fs.mkdtempSync(path.join(os.tmpdir(), 'tsq-nots-'))
fs.mkdirSync(path.join(noTs, 'deep', 'nested'), { recursive: true })
fs.writeFileSync(path.join(noTs, 'deep', 'nested', 'file.ts'), 'const x: number = 1')
test('.js 파일 (대상 아님)', '/proj/src/app.js', 0)
test('.md 파일 (대상 아님)', '/proj/README.md', 0)
test('file_path 없음', '', 0)
test('tsconfig 없는 .ts (상위 5단계 내 미존재)', path.join(noTs, 'deep', 'nested', 'file.ts'), 0)
fs.rmSync(noTs, { recursive: true, force: true })

// ── 스텁 tsc 기반 판정 ───────────────────────────────────────────────────
const proj = makeProject('proj')
const edited = path.join(proj, 'src', 'edited.ts')
const spaced = path.join(proj, 'src', 'domain a', 'sp ace.ts')
const errIn = (rel) => `${rel}(3,7): error TS2322: Type 'string' is not assignable to type 'number'.\n`

console.log('\n── 정상 경로 ──')
test('기본 모드: tsc 통과 → exit 0', edited, 0, [], { TSC_STUB_OUT: '', TSC_STUB_EXIT: '0' })
resetBaseline(proj)
test('--changed-only: tsc 통과 → exit 0', edited, 0, ['--changed-only'], { TSC_STUB_OUT: '', TSC_STUB_EXIT: '0' })
resetBaseline(proj)
test('--changed-only: 저장한 파일의 에러 → exit 2 (차단)', edited, 2, ['--changed-only'],
  { TSC_STUB_OUT: errIn('src/edited.ts'), TSC_STUB_EXIT: '2' },
  (se) => se.includes('src/edited.ts') && se.includes('이번 저장'))
test('기본 모드: 어떤 파일이든 에러 → exit 2 (기존 동작 유지)', edited, 2, [],
  { TSC_STUB_OUT: errIn('src/other.ts'), TSC_STUB_EXIT: '2' })

console.log('\n── 악성·오남용 방어 ──')
resetBaseline(proj)
test('--changed-only: 무관한 파일의 기존 에러만 → 차단하지 않음 (exit 0) + 참고 안내', edited, 0, ['--changed-only'],
  { TSC_STUB_OUT: errIn('src/other.ts') + errIn('src/legacy.ts'), TSC_STUB_EXIT: '2' },
  (se) => se.includes('기존 TS 에러 2건'))
resetBaseline(proj)
test('--changed-only: 내 에러 + 남의 에러 혼재 → 내 것만 이유로 차단, 남의 것은 제외 표기', edited, 2, ['--changed-only'],
  { TSC_STUB_OUT: errIn('src/other.ts') + errIn('src/edited.ts'), TSC_STUB_EXIT: '2' },
  (se) => se.includes('제외') && !se.split('\n').some(l => l.trim().startsWith('src/other.ts')))
resetBaseline(proj)
test('--changed-only: 접두어만 같은 다른 파일(edited.tsx / edited.test.ts)의 에러는 내 에러로 오인하지 않음', edited, 0, ['--changed-only'],
  { TSC_STUB_OUT: errIn('src/edited.tsx') + errIn('src/edited.test.ts') + errIn('src/edited.ts.bak'), TSC_STUB_EXIT: '2' })
resetBaseline(proj)
test('--changed-only: 출력에 셸 메타문자·ANSI 가 섞여도 매칭·차단 판정 유지', edited, 2, ['--changed-only'],
  { TSC_STUB_OUT: '\\x1b[31m' + errIn('src/edited.ts') + '$(rm -rf /) `x`\n', TSC_STUB_EXIT: '2' })

console.log('\n── 베이스라인 비교 (Codex R1 지적: 편집 파일 밖 소비자 회귀) ──')
{
  const projB = makeProject('baseline')
  const editedB = path.join(projB, 'src', 'edited.ts')
  const baselineFile = baselinePath(projB)
  const readBaseline = () => { try { const o = JSON.parse(fs.readFileSync(baselineFile, 'utf8')); return Object.keys(o) } catch { return null } }
  try { fs.unlinkSync(baselineFile) } catch {}

  // 1) 첫 실행: 베이스라인 없음 → 편집 파일 에러만 판정. 남의 기존 에러 2건 → 통과 + 베이스라인 생성
  test('첫 실행(베이스라인 없음): 남의 기존 에러만 → exit 0', editedB, 0, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/other.ts') + errIn('src/legacy.ts'), TSC_STUB_EXIT: '2' })
  const b1 = readBaseline()
  console.log(`  ${b1 && b1.length === 2 ? '✅' : '❌'} 통과 후 베이스라인 2건 기록 → ${b1 && b1.length === 2 ? 'PASS' : `FAIL (${JSON.stringify(b1)})`}`)
  b1 && b1.length === 2 ? passed++ : failed++

  // 2) 악성 핵심: 편집 파일은 깨끗한데 *소비자 파일*에 새 에러 → 차단해야 함
  test('베이스라인 있음: 다른 파일(consumer.ts)에 새 에러 → exit 2 (소비자 회귀 차단)', editedB, 2, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/other.ts') + errIn('src/legacy.ts') + errIn('src/consumer.ts'), TSC_STUB_EXIT: '2' },
    (se) => se.includes('consumer.ts') && se.includes('다른 파일에서 새로 깨진'))
  // 3) 차단된 실행의 에러는 베이스라인에 흡수되면 안 됨 (다음 저장이 그냥 통과하는 구멍)
  const b2 = readBaseline()
  console.log(`  ${b2 && b2.length === 2 ? '✅' : '❌'} 차단 시 베이스라인 미갱신(여전히 2건) → ${b2 && b2.length === 2 ? 'PASS' : `FAIL (${JSON.stringify(b2)})`}`)
  b2 && b2.length === 2 ? passed++ : failed++
  // 4) 같은 상태로 재저장해도 여전히 차단 (베이스라인 흡수 안 됐으므로)
  test('재저장(동일 회귀 잔존) → 여전히 exit 2', editedB, 2, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/other.ts') + errIn('src/legacy.ts') + errIn('src/consumer.ts'), TSC_STUB_EXIT: '2' })

  // 5) 경계: 기존 에러의 줄 번호만 밀린 경우 → 새 에러 아님 (키에서 줄 번호 제외)
  test('기존 에러의 줄 번호만 변경(3→40) → 새 에러로 오인하지 않음 exit 0', editedB, 0, ['--changed-only'],
    { TSC_STUB_OUT: `src/other.ts(40,7): error TS2322: Type 'string' is not assignable to type 'number'.\n` + errIn('src/legacy.ts'), TSC_STUB_EXIT: '2' })

  // 6) 기존 에러를 고쳐 줄어든 경우 → 베이스라인 축소
  test('기존 에러 1건 해소 → exit 0', editedB, 0, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/legacy.ts'), TSC_STUB_EXIT: '2' })
  const b3 = readBaseline()
  console.log(`  ${b3 && b3.length === 1 ? '✅' : '❌'} 베이스라인 1건으로 축소 → ${b3 && b3.length === 1 ? 'PASS' : `FAIL (${JSON.stringify(b3)})`}`)
  b3 && b3.length === 1 ? passed++ : failed++

  // 6.5) Codex R2: 같은 파일·같은 메시지의 에러가 하나 *더* 생기면 새 에러 (집합이면 놓침)
  test('동일 메시지 에러 개수 증가(legacy.ts 1→2) → exit 2 (multiset 차집합)', editedB, 2, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/legacy.ts') + `src/legacy.ts(90,1): error TS2322: Type 'string' is not assignable to type 'number'.\n`, TSC_STUB_EXIT: '2' },
    (se) => se.includes('1건'))
  test('동일 메시지 에러 개수 동일(줄만 이동) → exit 0', editedB, 0, ['--changed-only'],
    { TSC_STUB_OUT: `src/legacy.ts(77,1): error TS2322: Type 'string' is not assignable to type 'number'.\n`, TSC_STUB_EXIT: '2' })
  // 구형(배열) 베이스라인 호환: 배열은 각 키 count 1
  fs.writeFileSync(baselineFile, JSON.stringify(['src/legacy.ts|TS2322|Type \'string\' is not assignable to type \'number\'.']))
  test('구형 배열 베이스라인 → count 1로 해석, 동일 상태 exit 0', editedB, 0, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/legacy.ts'), TSC_STUB_EXIT: '2' })
  test('구형 배열 베이스라인 → 개수 증가 시 exit 2', editedB, 2, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/legacy.ts') + errIn('src/legacy.ts'), TSC_STUB_EXIT: '2' })
  // 악성: 베이스라인 count 가 음수·비정수·문자열이면 무시(0 취급) → 크래시 없이 판정
  fs.writeFileSync(baselineFile, JSON.stringify({ 'src/legacy.ts|TS2322|Type \'string\' is not assignable to type \'number\'.': -5, 'x|TS1|y': 'many', 'z|TS2|w': 1.5 }))
  test('오염된 count(-5·문자열·소수) → 0 취급, 기존 에러가 새 에러로 판정 exit 2 (보수적)', editedB, 2, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/legacy.ts'), TSC_STUB_EXIT: '2' })
  try { fs.unlinkSync(baselineFile) } catch {}
  test('(복구) 첫 실행으로 베이스라인 재생성 exit 0', editedB, 0, ['--changed-only'], { TSC_STUB_OUT: errIn('src/legacy.ts'), TSC_STUB_EXIT: '2' })

  // 7) 편집 파일 자체의 새 에러도 여전히 차단
  test('베이스라인 있음: 편집 파일의 새 에러 → exit 2', editedB, 2, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/legacy.ts') + errIn('src/edited.ts'), TSC_STUB_EXIT: '2' })

  // 8) 전역 에러(파일 접두어 없음, 예: TS2688 타입 정의 누락) — 첫 실행이면 '내 파일' 아님 → 통과 + 베이스라인 기록
  try { fs.unlinkSync(baselineFile) } catch {}
  test('전역 에러(TS2688, 파일 없음) 기존 → exit 0', editedB, 0, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/legacy.ts') + `error TS2688: Cannot find type definition file for 'exhibition'.\n`, TSC_STUB_EXIT: '2' })
  test('전역 에러가 베이스라인에 들어간 뒤 동일 상태 → exit 0', editedB, 0, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/legacy.ts') + `error TS2688: Cannot find type definition file for 'exhibition'.\n`, TSC_STUB_EXIT: '2' })

  // 9) 악성: 베이스라인 파일이 손상(JSON 아님) → 크래시 없이 첫 실행 규칙으로 폴백
  fs.writeFileSync(baselineFile, '{not json')
  test('손상된 베이스라인 → 폴백(편집 파일 규칙), 남의 에러만이면 exit 0', editedB, 0, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/other.ts'), TSC_STUB_EXIT: '2' })
  // 10) 악성: 베이스라인이 배열이지만 문자열 아닌 값 섞임 → 무시하고 동작
  fs.writeFileSync(baselineFile, JSON.stringify([{ evil: 1 }, 42, 'src/other.ts|TS2322|Type \'string\' is not assignable to type \'number\'.']))
  test('오염된 베이스라인 항목은 무시, 정상 항목만 사용 → exit 0', editedB, 0, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/other.ts'), TSC_STUB_EXIT: '2' })

  // 11) pretty 포맷(`file:line:col - error TSxxxx`)도 파싱
  try { fs.unlinkSync(baselineFile) } catch {}
  test('pretty 포맷 진단 줄도 편집 파일 에러로 인식 → exit 2', editedB, 2, ['--changed-only'],
    { TSC_STUB_OUT: `src/edited.ts:3:7 - error TS2322: Type 'string' is not assignable to type 'number'.\n`, TSC_STUB_EXIT: '2' })

  try { fs.unlinkSync(baselineFile) } catch {}
  fs.rmSync(projB, { recursive: true, force: true })
}

console.log('\n── --seed / 타임아웃 정책 (Codex R2) ──')
{
  const projS = makeProject('seed')
  const editedS = path.join(projS, 'src', 'edited.ts')
  const baselineFile = baselinePath(projS)
  const timeoutsFile = baselineFile.replace('.baseline.json', '.timeouts')
  const readBaseline = () => { try { const o = JSON.parse(fs.readFileSync(baselineFile, 'utf8')); return Object.keys(o) } catch { return null } }
  try { fs.unlinkSync(baselineFile) } catch {}
  try { fs.unlinkSync(timeoutsFile) } catch {}

  // --seed: stdin 없이 실행, 베이스라인 생성, 차단 없음
  const seed = spawnSync('node', [HOOK, '--seed', '--project', projS], {
    encoding: 'utf8', timeout: 20000, env: { ...process.env, TSC_STUB_OUT: errIn('src/other.ts') + `error TS2688: Cannot find type definition file for 'exhibition'.\n`, TSC_STUB_EXIT: '2' },
  })
  const okSeed = seed.status === 0 && (readBaseline() || []).length === 2 && /2건/.test(seed.stdout)
  console.log(`  ${okSeed ? '✅' : '❌'} --seed → exit 0 + 베이스라인 2건(파일 에러 + 전역 에러) → ${okSeed ? 'PASS' : `FAIL (status ${seed.status}, ${seed.stdout} ${seed.stderr})`}`)
  okSeed ? passed++ : failed++
  // 시드 직후 첫 저장: 다른 파일 회귀 → 차단 (첫 실행 공백 없음)
  test('시드 후 첫 저장: consumer.ts 새 에러 → exit 2', editedS, 2, ['--changed-only'],
    { TSC_STUB_OUT: errIn('src/other.ts') + `error TS2688: Cannot find type definition file for 'exhibition'.\n` + errIn('src/consumer.ts'), TSC_STUB_EXIT: '2' })
  // --seed 경계: tsconfig 없는 디렉토리 → exit 1, 크래시 없음
  const noTsq = fs.mkdtempSync(path.join(os.tmpdir(), 'tsq-noseed-'))
  const seed2 = spawnSync('node', [HOOK, '--seed', '--project', noTsq], { encoding: 'utf8', timeout: 20000 })
  console.log(`  ${seed2.status === 1 ? '✅' : '❌'} --seed tsconfig 없음 → exit 1 → ${seed2.status === 1 ? 'PASS' : `FAIL (${seed2.status})`}`)
  seed2.status === 1 ? passed++ : failed++
  fs.rmSync(noTsq, { recursive: true, force: true })
  // 악성: --seed 가 성공해도 tsc 통과면 베이스라인 빈 배열
  const seed3 = spawnSync('node', [HOOK, '--seed', '--project', projS], { encoding: 'utf8', timeout: 20000, env: { ...process.env, TSC_STUB_OUT: '', TSC_STUB_EXIT: '0' } })
  const okSeed3 = seed3.status === 0 && JSON.stringify(readBaseline()) === '[]'
  console.log(`  ${okSeed3 ? '✅' : '❌'} --seed tsc 통과 → 빈 베이스라인 → ${okSeed3 ? 'PASS' : 'FAIL'}`)
  okSeed3 ? passed++ : failed++

  // 타임아웃 정책: 1회 경고(exit 0) → 연속 2회째 차단(exit 2) → 정상 완료 시 리셋
  const slow = { TSC_STUB_SLEEP: '2', TSC_STUB_OUT: '', TSC_STUB_EXIT: '0' }
  try { fs.unlinkSync(timeoutsFile) } catch {}
  test('타임아웃 1회 → 경고만 exit 0', editedS, 0, ['--changed-only', '--timeout-ms=500'], slow,
    (se) => se.includes('1회 경고'))
  test('타임아웃 연속 2회 → exit 2 (무검사 통과 차단)', editedS, 2, ['--changed-only', '--timeout-ms=500'], slow,
    (se) => se.includes('2회 연속'))
  test('타임아웃 연속 3회 → 계속 exit 2', editedS, 2, ['--changed-only', '--timeout-ms=500'], slow)
  test('정상 완료 → 카운터 리셋 exit 0', editedS, 0, ['--changed-only'], { TSC_STUB_OUT: '', TSC_STUB_EXIT: '0' })
  test('리셋 후 타임아웃 1회 → 다시 경고만 exit 0', editedS, 0, ['--changed-only', '--timeout-ms=500'], slow)
  // 기본 모드도 동일 정책
  try { fs.unlinkSync(timeoutsFile) } catch {}
  test('기본 모드 타임아웃 1회 → exit 0', editedS, 0, ['--timeout-ms=500'], slow)
  test('기본 모드 타임아웃 2회 → exit 2', editedS, 2, ['--timeout-ms=500'], slow)
  // 악성: 카운터 파일 오염(숫자 아님) → 0으로 취급, 크래시 없음
  fs.writeFileSync(timeoutsFile, 'NaN garbage')
  test('오염된 카운터 파일 → 1회 경고로 시작 exit 0', editedS, 0, ['--timeout-ms=500'], slow)

  // 도구 장애 (Codex R3): 진단 없는 비정상 종료를 통과로 취급하면 게이트가 조용히 꺼진다
  try { fs.unlinkSync(timeoutsFile) } catch {}
  const toolFail = { TSC_STUB_OUT: 'sh: tsc: command not found\n', TSC_STUB_EXIT: '127' }
  test('--changed-only: tsc 바이너리 없음(진단 0건, exit 127) 1회 → 경고 exit 0', editedS, 0, ['--changed-only'], toolFail,
    (se) => se.includes('도구') || se.includes('비정상 종료'))
  test('--changed-only: 도구 장애 연속 2회 → exit 2', editedS, 2, ['--changed-only'], toolFail)
  test('--changed-only: 출력 없는 exit 1 도 도구 장애 → 연속 3회 exit 2', editedS, 2, ['--changed-only'], { TSC_STUB_OUT: '', TSC_STUB_EXIT: '1' })
  try { fs.unlinkSync(baselineFile) } catch {}
  test('진단 있는 정상 결과 → 카운터 리셋(첫 실행, 기존 에러만이면 exit 0)', editedS, 0, ['--changed-only'], { TSC_STUB_OUT: errIn('src/other.ts'), TSC_STUB_EXIT: '2' })
  test('리셋 후 도구 장애 1회 → 다시 경고만 exit 0', editedS, 0, ['--changed-only'], toolFail)
  // 도구 장애와 타임아웃은 같은 카운터를 공유 — 번갈아 나도 2회째면 차단
  test('타임아웃(2회째, 도구장애 뒤) → exit 2', editedS, 2, ['--changed-only', '--timeout-ms=500'], slow)
  // --seed 도 도구 장애면 베이스라인을 만들지 않고 exit 1
  try { fs.unlinkSync(baselineFile) } catch {}
  const seedFail = spawnSync('node', [HOOK, '--seed', '--project', projS], { encoding: 'utf8', timeout: 20000, env: { ...process.env, ...toolFail } })
  const okSeedFail = seedFail.status === 1 && !fs.existsSync(baselineFile)
  console.log(`  ${okSeedFail ? '✅' : '❌'} --seed 도구 장애 → exit 1 + 베이스라인 미생성 → ${okSeedFail ? 'PASS' : `FAIL (${seedFail.status})`}`)
  okSeedFail ? passed++ : failed++

  // Codex R3: 로컬 typescript 없음 → npx --no-install 이 실패 → 도구 장애(레지스트리에서 받아 실행하지 않음)
  try { fs.unlinkSync(timeoutsFile) } catch {}
  fs.rmSync(path.join(projS, 'node_modules'), { recursive: true, force: true })
  test('로컬 tsc 없음 → 1회 경고 exit 0 (네트워크 해석 없음)', editedS, 0, ['--changed-only'], { TSC_STUB_OUT: '', TSC_STUB_EXIT: '0' },
    (se) => se.includes('비정상 종료') || se.includes('도구'))
  test('로컬 tsc 없음 연속 2회 → exit 2 + devDependency 설치 안내', editedS, 2, ['--changed-only'], {},
    (se) => se.includes('typescript') && se.includes('devDependency'))
  // 상태 디렉토리: 환경변수 미지정 시 홈 하위(~/.claude/typescript-quality, tmp 아님) — 재부팅 후에도 베이스라인 유지.
  // 실제 홈에 파일을 하나 만들었다가 정리한다.
  {
    const projH = makeProject('home')
    const editedH = path.join(projH, 'src', 'edited.ts')
    const key = crypto.createHash('sha1').update(projH).digest('hex').slice(0, 12)
    const homeDir = path.join(os.homedir(), '.claude', 'typescript-quality')
    const homeBaseline = path.join(homeDir, `claude-tsq-${key}.baseline.json`)
    const env = { ...process.env, TSC_STUB_OUT: errIn('src/other.ts'), TSC_STUB_EXIT: '2' }
    delete env.TSQ_STATE_DIR
    const r = spawnSync('node', [HOOK, '--changed-only'], { input: JSON.stringify({ tool_input: { file_path: editedH } }), encoding: 'utf8', timeout: 20000, env })
    const ok = r.status === 0 && fs.existsSync(homeBaseline)
    console.log(`  ${ok ? '✅' : '❌'} 기본 상태 디렉토리 = ~/.claude/typescript-quality 에 베이스라인 생성 → ${ok ? 'PASS' : `FAIL (status ${r.status}, exists ${fs.existsSync(homeBaseline)})`}`)
    ok ? passed++ : failed++
    for (const f of fs.existsSync(homeDir) ? fs.readdirSync(homeDir) : []) if (f.includes(key)) fs.unlinkSync(path.join(homeDir, f))
    fs.rmSync(projH, { recursive: true, force: true })
  }

  try { fs.unlinkSync(baselineFile) } catch {}
  try { fs.unlinkSync(timeoutsFile) } catch {}
  fs.rmSync(projS, { recursive: true, force: true })
}

console.log('\n── 경계 경로 ──')
resetBaseline(proj)
test('경로에 공백 포함 파일의 에러 → --changed-only 에서 정확히 매칭·차단', spaced, 2, ['--changed-only'],
  { TSC_STUB_OUT: errIn('src/domain a/sp ace.ts'), TSC_STUB_EXIT: '2' })
resetTimeouts(proj)
test('tsc 비정상 종료·출력 없음 → 도구 장애 1회 경고 (exit 0)', edited, 0, [],
  { TSC_STUB_OUT: '', TSC_STUB_EXIT: '1' }, (se) => se.includes('1회 경고'))
resetBaseline(proj)
resetTimeouts(proj)
test('--changed-only: tsc 가 "error TS" 없이 잡담만 출력(exit≠0) → 도구 장애 1회 경고 exit 0', edited, 0, ['--changed-only'],
  { TSC_STUB_OUT: 'Some informational line\n', TSC_STUB_EXIT: '2' }, (se) => se.includes('1회 경고'))
resetBaseline(proj)
test('--changed-only: 파일이 tsconfig 루트 밖(../)을 가리켜도 크래시 없이 처리', path.join(proj, '..', 'outside.ts'), 0, ['--changed-only'],
  { TSC_STUB_OUT: errIn('src/edited.ts'), TSC_STUB_EXIT: '2' })

fs.rmSync(proj, { recursive: true, force: true })

fs.rmSync(STATE_DIR, { recursive: true, force: true })
console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
