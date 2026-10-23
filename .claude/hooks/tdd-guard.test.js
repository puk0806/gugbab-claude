#!/usr/bin/env node
/**
 * tdd-guard.test.js — 소스 수정 시 대응 테스트 파일 존재 검사 테스트
 * 실행: node .claude/hooks/tdd-guard.test.js
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'tdd-guard.js')

let passed = 0, failed = 0

// 기본은 tmp 픽스처 디렉토리를 프로젝트 루트로 지정한다(CLAUDE_PROJECT_DIR) — 훅의 "프로젝트 밖 스킵"
// 로직이 tmp 픽스처 자체를 프로젝트 밖으로 오인해 기존 차단 판정 테스트를 무력화하지 않도록 하기 위함.
function test(desc, filePath, expectedExit, opts = {}) {
  const { projectDir = tmp, cwd } = opts
  const input = JSON.stringify({
    hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: filePath }, cwd,
  })
  const env = { ...process.env }
  if (projectDir === null) delete env.CLAUDE_PROJECT_DIR
  else env.CLAUDE_PROJECT_DIR = projectDir
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, env })
  const pass = r.status === expectedExit
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status})`}`)
  pass ? passed++ : failed++
}

console.log('🔍 tdd-guard 테스트 시작')

const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'tdd-test-')))
fs.mkdirSync(path.join(tmp, 'src'), { recursive: true })

console.log('\n── 테스트 파일 없는 소스 → exit 2 ──')
fs.writeFileSync(path.join(tmp, 'src', 'orphan.ts'), 'export const x = 1')
test('테스트 없는 .ts', path.join(tmp, 'src', 'orphan.ts'), 2)

console.log('\n── 테스트 파일 있는 소스 → exit 0 ──')
fs.writeFileSync(path.join(tmp, 'src', 'covered.ts'), 'export const y = 2')
fs.writeFileSync(path.join(tmp, 'src', 'covered.test.ts'), 'test')
test('같은 디렉토리 .test.ts 존재', path.join(tmp, 'src', 'covered.ts'), 0)

fs.mkdirSync(path.join(tmp, 'src', '__tests__'), { recursive: true })
fs.writeFileSync(path.join(tmp, 'src', 'nested.ts'), 'export const z = 3')
fs.writeFileSync(path.join(tmp, 'src', '__tests__', 'nested.test.ts'), 'test')
test('__tests__ 하위 테스트 존재', path.join(tmp, 'src', 'nested.ts'), 0)

console.log('\n── 교차 확장자 테스트 인식 → exit 0 ──')
fs.writeFileSync(path.join(tmp, 'src', 'use-hook.ts'), 'export const h = 1')
fs.writeFileSync(path.join(tmp, 'src', 'use-hook.test.tsx'), 'test')
test('.ts 소스 + .test.tsx 테스트', path.join(tmp, 'src', 'use-hook.ts'), 0)

fs.writeFileSync(path.join(tmp, 'src', 'Widget.tsx'), 'export const W = 1')
fs.writeFileSync(path.join(tmp, 'src', 'Widget.test.ts'), 'test')
test('.tsx 소스 + .test.ts 테스트', path.join(tmp, 'src', 'Widget.tsx'), 0)

fs.writeFileSync(path.join(tmp, 'src', 'legacy.js'), 'module.exports = 1')
fs.writeFileSync(path.join(tmp, 'src', '__tests__', 'legacy.test.jsx'), 'test')
test('.js 소스 + __tests__/.test.jsx 테스트', path.join(tmp, 'src', 'legacy.js'), 0)

console.log('\n── 차단 사유는 stderr로 전달 ──')
fs.writeFileSync(path.join(tmp, 'src', 'orphan2.ts'), 'export const q = 1')
{
  const input = JSON.stringify({
    hook_event_name: 'PostToolUse', tool_name: 'Edit',
    tool_input: { file_path: path.join(tmp, 'src', 'orphan2.ts') },
  })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, env: { ...process.env, CLAUDE_PROJECT_DIR: tmp } })
  const pass = r.status === 2 && r.stderr.includes('[tdd-guard]') && r.stderr.includes('테스트 파일 없음')
    && !(r.stdout || '').includes('[tdd-guard]')
  console.log(`  ${pass ? '✅' : '❌'} 차단 시 stderr에 사유 포함 + stdout에 사유 없음 →${pass ? 'PASS' : `FAIL (exit ${r.status}, stderr: ${JSON.stringify(r.stderr)})`}`)
  pass ? passed++ : failed++
}

console.log('\n── 검사 제외 대상 → exit 0 ──')
test('테스트 파일 자체', path.join(tmp, 'src', 'covered.test.ts'), 0)
test('.claude/hooks 파일', '/proj/.claude/hooks/some-hook.js', 0)
test('scripts/ 파일', '/proj/scripts/gen-settings.js', 0)
test('설정 파일 (*.config.ts)', path.join(tmp, 'vite.config.ts'), 0)
// 2026-10-22: 제외는 프로젝트 *최상위* .claude/hooks·.claude/commands 만 — 경로 중간의 같은 글자는 제품 코드
test('정상: 프로젝트 최상위 .claude/hooks 훅 → 제외', path.join(tmp, '.claude', 'hooks', 'my-hook.js'), 0)
test('정상: 프로젝트 최상위 .claude/commands → 제외', path.join(tmp, '.claude', 'commands', 'x.js'), 0)
test('악성: src/.claude/hooks/ 아래 소스로 위장 → 차단', path.join(tmp, 'src', '.claude', 'hooks', 'pay.ts'), 2)
test('악성: .claude/hooksX/ (접두만 같은 폴더) → 차단', path.join(tmp, '.claude', 'hooksX', 'pay.ts'), 2)
test('악성: app/.claude/commands/ 아래 소스 → 차단', path.join(tmp, 'app', '.claude', 'commands', 'pay.js'), 2)
if (process.platform === 'darwin') test('경계(맥): 대소문자만 다른 .CLAUDE/HOOKS 최상위 → 제외(같은 폴더)', path.join(tmp, '.CLAUDE', 'HOOKS', 'h.js'), 0)
test('마크다운 (소스 아님)', path.join(tmp, 'README.md'), 0)
test('file_path 없음', '', 0)

console.log('\n── 프로젝트 밖 파일은 통과(스킵) — 경로 정규화 적대적 테스트 ──')

// CLAUDE_PROJECT_DIR = tmp/proj-root. 테스트 없는 orphan.ts 가 있으면 원래 exit 2 여야 하지만,
// 아래는 전부 "그 파일이 실제로는 프로젝트 밖(또는 안)"인 케이스라 판정이 뒤집혀야 한다.
const root = path.join(tmp, 'proj-root')
fs.mkdirSync(path.join(root, 'src'), { recursive: true })
fs.writeFileSync(path.join(root, 'src', 'orphan.ts'), 'export const x = 1')

const outside = path.join(tmp, 'outside-dir')
fs.mkdirSync(path.join(outside, 'src'), { recursive: true })
fs.writeFileSync(path.join(outside, 'src', 'orphan.ts'), 'export const x = 1')

test('완전히 다른 디렉토리(테스트 없음, 원래는 차단) → 프로젝트 밖이라 exit 0',
  path.join(outside, 'src', 'orphan.ts'), 0, { projectDir: root })

test('..로 프로젝트 루트를 벗어나는 경로(테스트 없음) → exit 0',
  path.join(root, '..', 'outside-dir', 'src', 'orphan.ts'), 0, { projectDir: root })

// 루트 접두 충돌: /tmp/.../proj-root 와 /tmp/.../proj-root-evil 은 문자열 접두가 같지만 다른 디렉토리다.
const rootEvil = root + '-evil'
fs.mkdirSync(path.join(rootEvil, 'src'), { recursive: true })
fs.writeFileSync(path.join(rootEvil, 'src', 'orphan.ts'), 'export const x = 1')
test('프로젝트 루트 접두 충돌(proj-root vs proj-root-evil, 테스트 없음) → exit 0',
  path.join(rootEvil, 'src', 'orphan.ts'), 0, { projectDir: root })

// symlink: 프로젝트 밖 실제 파일을 프로젝트 안으로 심볼릭 링크 — realpath 로 풀면 밖이어야 한다.
const linkPath = path.join(root, 'src', 'linked-orphan.ts')
try {
  fs.symlinkSync(path.join(outside, 'src', 'orphan.ts'), linkPath)
  test('심볼릭 링크로 프로젝트 안에 들어온 밖의 파일(테스트 없음) → realpath 기준 exit 0',
    linkPath, 0, { projectDir: root })
} catch (e) {
  console.log(`  ⚠️  symlink 생성 실패로 스킵: ${e.message}`)
}

// 상대경로: 훅 입력의 cwd 필드를 기준으로 해석 — 프로젝트 밖 cwd에서의 상대경로도 밖으로 판정.
fs.mkdirSync(path.join(outside, 'src2'), { recursive: true })
fs.writeFileSync(path.join(outside, 'src2', 'rel-orphan.ts'), 'export const x = 1')
test('상대경로 + 프로젝트 밖 cwd(테스트 없음) → exit 0',
  path.join('src2', 'rel-orphan.ts'), 0, { projectDir: root, cwd: outside })

fs.writeFileSync(path.join(root, 'src', 'rel-orphan.ts'), 'export const x = 1')
test('상대경로 + 프로젝트 안 cwd(테스트 없음) → 원래대로 exit 2 (차단 유지)',
  path.join('src', 'rel-orphan.ts'), 2, { projectDir: root, cwd: root })

// 대소문자(macOS 케이스 무시 파일시스템): CLAUDE_PROJECT_DIR을 실제와 다른 대소문자로 지정해도
// realpath가 온디스크 표기로 정규화하므로 여전히 "프로젝트 안"으로 판정돼야 한다(차단 유지).
// realpath는 symlink만 풀 뿐 대소문자를 정규화하지 않으므로(실측), 이 파일시스템이 대소문자를
// 구분하지 않는지는 existsSync로 직접 판별한다(대소문자 다른 경로로도 같은 항목이 보이는가).
const rootUpper = root.toUpperCase() === root ? null : root.toUpperCase()
if (rootUpper && fs.existsSync(rootUpper)) {
  test('대소문자만 다른 CLAUDE_PROJECT_DIR(실제로는 같은 디렉토리, 테스트 없음) → 여전히 exit 2',
    path.join(root, 'src', 'orphan.ts'), 2, { projectDir: rootUpper })
} else {
  console.log('  ⚠️  이 파일시스템은 대소문자 구분(case-sensitive) — 대소문자 정규화 테스트 스킵')
}

if (process.platform === 'win32') {
  // 회귀: 윈도우 file_path 는 백슬래시 — 슬래시 기준 예외 판정이 안 걸려 훅·scripts 수정마다 오탐 차단되던 버그 (2026-10-20)
  console.log('\n── 윈도우 백슬래시 경로 — 예외 판정 회귀 + 위장 우회 ──')
  const W = path.join(tmp, 'win')
  const mk = (...seg) => { const f = path.join(W, ...seg); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, 'export const a = 1'); return f }
  // 정상: 인프라·설정 폴더는 테스트 없이도 통과 (전부 테스트 파일 없음)
  test('[윈도우] .claude\\hooks\\h.js → 제외 exit 0', mk('.claude', 'hooks', 'h.js'), 0, { projectDir: W })
  test('[윈도우] .claude\\commands\\c.js → 제외 exit 0', mk('.claude', 'commands', 'c.js'), 0, { projectDir: W })
  test('[윈도우] scripts\\gen.js → 제외 exit 0', mk('scripts', 'gen.js'), 0, { projectDir: W })
  test('[윈도우] src\\lib\\db\\conn.ts → 제외 exit 0', mk('src', 'lib', 'db', 'conn.ts'), 0, { projectDir: W })
  test('[윈도우] src\\__tests__\\helper.ts → 제외 exit 0', mk('src', '__tests__', 'helper.ts'), 0, { projectDir: W })
  // 악성·우회: 이름만 비슷한 폴더로 예외를 노림 → 제외되지 않고 차단
  test('[윈도우] myscripts\\evil.ts (접미 위장) → 차단 exit 2', mk('myscripts', 'evil.ts'), 2, { projectDir: W })
  test('[윈도우] src\\lib\\dbx\\evil.ts (db 위장) → 차단 exit 2', mk('src', 'lib', 'dbx', 'evil.ts'), 2, { projectDir: W })
  test('[윈도우] src\\claude\\hooks\\evil.ts (점 없는 위장) → 차단 exit 2', mk('src', 'claude', 'hooks', 'evil.ts'), 2, { projectDir: W })
  // 이상·경계: 드라이브 소문자·공백·한글 경로도 정상 판정
  const orphanW = mk('src', 'orphan.ts')
  test('[윈도우] 드라이브 소문자 c:\\… 의 테스트 없는 소스 → 차단 exit 2', orphanW[0].toLowerCase() + orphanW.slice(1), 2, { projectDir: W })
  test('[윈도우] 공백·한글 폴더의 테스트 없는 소스 → 차단 exit 2', mk('공백 폴더', '한글.ts'), 2, { projectDir: W })
  const coveredW = mk('공백 폴더', 'ok.ts'); fs.writeFileSync(path.join(W, '공백 폴더', 'ok.test.ts'), 'test')
  test('[윈도우] 공백·한글 폴더 + 테스트 있음 → exit 0', coveredW, 0, { projectDir: W })
  // 악성·우회: CLAUDE_PROJECT_DIR 가 Git Bash 표기(/c/…)여도 "프로젝트 밖"으로 빠져 검사가 꺼지지 않음
  const msysW = '/' + W[0].toLowerCase() + W.slice(2).replace(/\\/g, '/')
  test('[윈도우] CLAUDE_PROJECT_DIR=/c/… + 테스트 없는 소스 → 차단 exit 2', mk('src', 'msys.ts'), 2, { projectDir: msysW })
}

fs.rmSync(tmp, { recursive: true, force: true })

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
