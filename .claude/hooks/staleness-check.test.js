#!/usr/bin/env node
/**
 * staleness-check.test.js
 * 실행: node .claude/hooks/staleness-check.test.js
 *
 * 대상: staleness-check.js (InstructionsLoaded 훅, --strict 옵션)
 *   docs/skills/**\/verification.md 의 "> 검증일: YYYY-MM-DD" 를 스캔해
 *   30일 초과(재검증 권고) / 60일 초과(필수 질문 주입)를 안내한다.
 *
 * 중요 동작 특성(실제 훅 소스 기준, 이 파일 전체가 이를 전제로 테스트를 짠다):
 *   - stdin을 전혀 읽지 않는다 (process.argv만 사용) → 잘못된 JSON stdin도 영향 없어야 함
 *   - 모든 경로에서 process.exit(0) — InstructionsLoaded는 비차단, stdout이 컨텍스트에 주입되는 방식
 *   - docsDir = path.join(CLAUDE_PROJECT_DIR || process.cwd(), 'docs', 'skills')
 *   - scan()은 entry.isDirectory()일 때만 재귀 — 심볼릭 링크는 디렉토리로 판정되지 않아 순회하지 않음
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'staleness-check.js')

let passed = 0, failed = 0
const tmpRoots = []

function ok(desc, cond) {
  console.log(`  ${cond ? '✅' : '❌'} ${desc}`)
  cond ? passed++ : failed++
}
function section(title) { console.log(`\n── ${title} ──`) }

function mkRoot(prefix) {
  const r = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
  tmpRoots.push(r)
  return r
}

// UTC 자정 기준 상대일 — 로컬 타임존/DST 영향 없이 정확한 경계값(30/31/60/61일) 테스트 가능
function isoDaysAgo(n) {
  const now = new Date()
  const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return new Date(utcMidnight - n * 86400000).toISOString().slice(0, 10)
}

function verifDoc(dateStr, extra = '') {
  return `# 검증 문서\n\n> 검증일: ${dateStr}\n\n## 5. 테스트 진행 기록\n내용${extra}\n`
}

// docsDir(=<root>/docs/skills) 아래 category/name/verification.md 생성
function mkSkill(root, category, name, content) {
  const dir = path.join(root, 'docs', 'skills', category, name)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'verification.md'), content)
  return dir
}

function runHook(root, args = [], opts = {}) {
  return spawnSync('node', [HOOK, ...args], {
    cwd: root,
    input: opts.input ?? '',
    encoding: 'utf8',
    timeout: 5000,
    env: { ...process.env, ...(opts.noEnv ? {} : { CLAUDE_PROJECT_DIR: root }) },
  })
}

console.log('🔍 staleness-check 테스트 시작')

// ── 정상(신선) ──────────────────────────────────────────────────────
section('정상(신선) — 출력·차단 없어야 함')
{
  const root = mkRoot('sc-fresh-')
  mkSkill(root, 'backend', 'fresh-skill', verifDoc(isoDaysAgo(10)))
  const r = runHook(root, ['--strict'])
  ok('exit 0', r.status === 0)
  ok('stdout 비어있음', r.stdout.trim() === '')
  ok('stderr 비어있음', r.stderr.trim() === '')
}

// ── 파일 없음 ────────────────────────────────────────────────────────
section('파일 없음 — docs/skills 자체가 없거나, verification.md가 없는 경우')
{
  const root = mkRoot('sc-nodocs-')
  const r = runHook(root, ['--strict'])
  ok('docs/skills 없음 → exit 0', r.status === 0)
  ok('docs/skills 없음 → stdout 비어있음', r.stdout.trim() === '')
  ok('docs/skills 없음 → stderr 비어있음', r.stderr.trim() === '')
}
{
  const root = mkRoot('sc-noverif-')
  const dir = path.join(root, 'docs', 'skills', 'backend', 'no-verif-skill')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'SKILL.md'), '# SKILL만 있고 verification.md 없음')
  const r = runHook(root, ['--strict'])
  ok('verification.md 없는 스킬 디렉토리 → exit 0', r.status === 0)
  ok('verification.md 없는 스킬 디렉토리 → 출력 없음', r.stdout.trim() === '' && r.stderr.trim() === '')
}

// ── 경계: WARN_DAYS(30) 경계 ────────────────────────────────────────
section('경계 — WARN_DAYS(30일) 경계값')
{
  const root = mkRoot('sc-warn30-')
  mkSkill(root, 'backend', 'exactly-30', verifDoc(isoDaysAgo(30)))
  const r = runHook(root, ['--strict'])
  ok('정확히 30일 경과 → 아직 경고 대상 아님(> 30만 포함)', r.stdout.trim() === '' && r.stderr.trim() === '')
}
{
  const root = mkRoot('sc-warn31-')
  mkSkill(root, 'backend', 'exactly-31', verifDoc(isoDaysAgo(31)))
  const r = runHook(root, ['--strict'])
  ok('31일 경과 → stderr 재검증 권고 포함', r.stderr.includes('재검증 권고'))
  ok('31일 경과 → 스킬 경로가 stderr에 포함', r.stderr.includes(path.join('backend', 'exactly-31')))
  ok('31일 경과 → strict여도 stdout(필수 질문)은 비어있음(60일 미만)', r.stdout.trim() === '')
}

// ── 경계: STALE_DAYS(60) 경계 ───────────────────────────────────────
section('경계 — STALE_DAYS(60일) 경계값')
{
  const root = mkRoot('sc-stale60-')
  mkSkill(root, 'backend', 'exactly-60', verifDoc(isoDaysAgo(60)))
  const r = runHook(root, ['--strict'])
  ok('정확히 60일 경과 → 여전히 WARN(재검증 권고) 구간', r.stderr.includes('재검증 권고'))
  ok('정확히 60일 경과 → STRICT 필수 질문(stdout)은 발생하지 않음', r.stdout.trim() === '')
}
{
  const root = mkRoot('sc-stale61-')
  mkSkill(root, 'backend', 'exactly-61', verifDoc(isoDaysAgo(61)))
  const rStrict = runHook(root, ['--strict'])
  ok('61일 경과 + --strict → exit 0', rStrict.status === 0)
  ok('61일 경과 + --strict → stdout에 60일 초과 감지 문구', rStrict.stdout.includes('60일 초과 스킬 1종 감지'))
  ok('61일 경과 + --strict → stdout에 필수 질문 지시', rStrict.stdout.includes('필수 질문'))
  ok('61일 경과 + --strict → 단일 stale뿐이라 stderr(warn 블록)는 비어있음', rStrict.stderr.trim() === '')

  const rNormal = runHook(root, [])
  ok('61일 경과 + 일반 모드 → stdout은 비어있음(stderr로만 안내)', rNormal.stdout.trim() === '')
  ok('61일 경과 + 일반 모드 → stderr에 60일 초과 감지 문구', rNormal.stderr.includes('60일 초과 스킬 1종 감지'))
  ok('61일 경과 + 일반 모드 → stderr에도 Claude 지시 문구', rNormal.stderr.includes('Claude 지시'))
}

// ── 미래 날짜 ────────────────────────────────────────────────────────
section('미래 날짜 — 음수 경과일, 크래시/오탐 없어야 함')
{
  const root = mkRoot('sc-future-')
  mkSkill(root, 'backend', 'future-skill', verifDoc(isoDaysAgo(-10)))
  const r = runHook(root, ['--strict'])
  ok('미래 날짜 → exit 0', r.status === 0)
  ok('미래 날짜 → 출력 없음(음수 days는 임계값 미달)', r.stdout.trim() === '' && r.stderr.trim() === '')
}

// ── 날짜 형식 깨짐 ───────────────────────────────────────────────────
section('날짜 형식 깨짐 — 정규식 불일치, 조용히 스킵되어야 함')
{
  const root = mkRoot('sc-badfmt-')
  mkSkill(root, 'backend', 'slash-date', '# 문서\n\n> 검증일: 2026/01/01\n')
  mkSkill(root, 'backend', 'text-date', '# 문서\n\n> 검증일: 작년 언젠가\n')
  mkSkill(root, 'backend', 'no-marker', '# 문서\n\n검증일 표기가 아예 없음\n')
  const r = runHook(root, ['--strict'])
  ok('날짜 형식 깨짐 전부 → exit 0', r.status === 0)
  ok('날짜 형식 깨짐 전부 → 매칭 실패로 조용히 스킵(출력 없음)', r.stdout.trim() === '' && r.stderr.trim() === '')
}

// ── 빈 파일 ──────────────────────────────────────────────────────────
section('빈 파일 — 크래시 없이 스킵')
{
  const root = mkRoot('sc-empty-')
  mkSkill(root, 'backend', 'empty-verif', '')
  const r = runHook(root, ['--strict'])
  ok('빈 verification.md → exit 0', r.status === 0)
  ok('빈 verification.md → 출력 없음', r.stdout.trim() === '' && r.stderr.trim() === '')
}

// ── 잘못된 JSON stdin ────────────────────────────────────────────────
section('잘못된 JSON stdin — 훅은 stdin을 읽지 않으므로 영향 없어야 함')
{
  const root = mkRoot('sc-badstdin-')
  mkSkill(root, 'backend', 'stale-with-bad-stdin', verifDoc(isoDaysAgo(90)))
  const r = runHook(root, ['--strict'], { input: '{not-valid-json::::' })
  ok('깨진 JSON stdin에도 exit 0', r.status === 0)
  ok('깨진 JSON stdin에도 정상적으로 stale 감지 동작', r.stdout.includes('60일 초과 스킬 1종 감지'))

  const rEmpty = runHook(root, ['--strict'], { input: '' })
  ok('빈 stdin에도 동일하게 정상 동작', rEmpty.stdout.includes('60일 초과 스킬 1종 감지'))
}

// ── 경로 조작 (심볼릭 링크로 docs/skills 밖 디렉토리 스캔 시도) ──────
section('경로 조작 — 심볼릭 링크로 docsDir 밖을 가리켜도 순회하지 않아야 함')
{
  const root = mkRoot('sc-symlink-')
  const outsideDir = mkRoot('sc-outside-')
  // docsDir 밖(별도 임시 루트)에 심하게 오래된(stale) verification.md 배치
  const outsideSkill = path.join(outsideDir, 'secret-skill')
  fs.mkdirSync(outsideSkill, { recursive: true })
  fs.writeFileSync(path.join(outsideSkill, 'verification.md'), verifDoc(isoDaysAgo(999)))

  const skillsDir = path.join(root, 'docs', 'skills')
  fs.mkdirSync(skillsDir, { recursive: true })
  // docs/skills 안에 "밖"을 가리키는 심볼릭 링크 생성
  fs.symlinkSync(outsideDir, path.join(skillsDir, 'linked-outside'))
  // 진짜 docs/skills 내부에는 신선한 스킬만 존재 — stale은 오직 심볼릭 링크 너머에만 있음
  mkSkill(root, 'backend', 'real-fresh', verifDoc(isoDaysAgo(5)))

  const r = runHook(root, ['--strict'])
  ok('심볼릭 링크 밖의 999일 stale 파일은 보고되지 않음(경로 이탈 차단)', r.stdout.trim() === '' && r.stderr.trim() === '')
  ok('exit 0 유지', r.status === 0)
}

// ── 이상 입력: 동일 파일에 검증일 마커 중복(첫 매치만 사용) ──────────
section('이상 입력 — 검증일 마커가 중복되어도 첫 매치만 결정적으로 사용')
{
  const root = mkRoot('sc-dupmarker-')
  const content = `# 문서\n\n> 검증일: ${isoDaysAgo(90)}\n\n(공격 시도) 두 번째 마커:\n> 검증일: ${isoDaysAgo(1)}\n`
  mkSkill(root, 'backend', 'dup-marker', content)
  const r = runHook(root, ['--strict'])
  ok('중복 마커 → 첫 번째(90일 경과) 기준으로 stale 판정', r.stdout.includes('60일 초과 스킬 1종 감지'))
}

// ── 이상 입력: 대용량 파일 (ReDoS/성능 방어 확인) ─────────────────────
section('이상 입력 — 대용량 verification.md에서도 빠르게 종료')
{
  const root = mkRoot('sc-huge-')
  const padding = 'x'.repeat(2_000_000)
  mkSkill(root, 'backend', 'huge-file', verifDoc(isoDaysAgo(90), `\n${padding}`))
  const start = Date.now()
  const r = runHook(root, ['--strict'])
  const elapsed = Date.now() - start
  ok('대용량 파일에도 exit 0', r.status === 0)
  ok('대용량 파일에도 5초 타임아웃 내 완료(hang/ReDoS 없음)', r.status !== null)
  ok('대용량 파일에도 정상적으로 stale 감지', r.stdout.includes('60일 초과 스킬 1종 감지'))
  void elapsed
}

// ── CLAUDE_PROJECT_DIR 미설정 → process.cwd() 폴백 ───────────────────
section('CLAUDE_PROJECT_DIR 미설정 — process.cwd() 폴백 확인')
{
  const root = mkRoot('sc-noenv-')
  mkSkill(root, 'backend', 'cwd-fallback-stale', verifDoc(isoDaysAgo(90)))
  const r = runHook(root, ['--strict'], { noEnv: true })
  ok('CLAUDE_PROJECT_DIR 없어도 cwd 기준으로 정상 스캔', r.stdout.includes('60일 초과 스킬 1종 감지'))
}

// ── 존재하지 않는 CLAUDE_PROJECT_DIR ─────────────────────────────────
section('CLAUDE_PROJECT_DIR가 존재하지 않는 경로를 가리키는 경우')
{
  const root = mkRoot('sc-ghost-')
  const ghost = path.join(root, 'does-not-exist')
  const r = spawnSync('node', [HOOK, '--strict'], {
    cwd: root, input: '', encoding: 'utf8', timeout: 5000,
    env: { ...process.env, CLAUDE_PROJECT_DIR: ghost },
  })
  ok('존재하지 않는 경로 → exit 0(크래시 없음)', r.status === 0)
  ok('존재하지 않는 경로 → 출력 없음', r.stdout.trim() === '' && r.stderr.trim() === '')
}

// ── formatList 10개 초과 시 "외 N종" 요약 ─────────────────────────────
section('목록 절단 — 10개 초과 시 "외 N종" 요약 표기')
{
  const root = mkRoot('sc-many-')
  for (let i = 0; i < 12; i++) {
    mkSkill(root, 'backend', `stale-${i}`, verifDoc(isoDaysAgo(61 + i)))
  }
  const r = runHook(root, ['--strict'])
  ok('12종 stale → 감지 수 12종 표기', r.stdout.includes('60일 초과 스킬 12종 감지'))
  ok('12종 stale → "외 2종" 요약 표기(10개 초과분)', r.stdout.includes('외 2종'))
}

// ── warn + stale 동시 존재 시 채널 분리(strict 모드) ──────────────────
section('warn + stale 동시 존재 — strict 모드에서도 채널이 분리되어야 함')
{
  const root = mkRoot('sc-mixed-')
  mkSkill(root, 'backend', 'mixed-warn', verifDoc(isoDaysAgo(40)))
  mkSkill(root, 'backend', 'mixed-stale', verifDoc(isoDaysAgo(90)))
  const r = runHook(root, ['--strict'])
  ok('stale은 stdout(필수 질문 채널)에', r.stdout.includes('60일 초과 스킬 1종 감지'))
  ok('warn은 stderr(권고 채널)에 별도로', r.stderr.includes('재검증 권고'))
  ok('warn 스킬 경로가 stale 블록(stdout)에는 섞이지 않음', !r.stdout.includes('mixed-warn'))
  ok('stale 스킬 경로가 warn 블록(stderr)에는 섞이지 않음', !r.stderr.includes('mixed-stale'))
}

// ── 정리 ──────────────────────────────────────────────────────────────
for (const r of tmpRoots) { try { fs.rmSync(r, { recursive: true, force: true }) } catch {} }

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
