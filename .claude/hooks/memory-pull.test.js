#!/usr/bin/env node
/**
 * memory-pull.test.js — memory-pull.js(SessionStart) 전역 보장·레포→전역 반영 테스트
 * 실행: node .claude/hooks/memory-pull.test.js
 *
 * 격리 원칙: 실제 ~/.claude/projects/*, 레포 memory/ 는 절대 건드리지 않는다.
 * 모든 테스트는 HOME·CLAUDE_PROJECT_DIR 을 mktemp 임시 디렉토리로 바꿔 실행한다.
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'memory-pull.js')

let passed = 0, failed = 0

function assert(desc, actual, expected) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${JSON.stringify(expected)}, 실제: ${JSON.stringify(actual)})`}`)
  pass ? passed++ : failed++
}

function section(title) { console.log(`\n── ${title} ──`) }

function encode(projectDir) { return projectDir.replace(/[/_]/g, '-') }
function globalMemoryOf(tmpHome, repoDir) {
  return path.join(tmpHome, '.claude', 'projects', encode(repoDir), 'memory')
}

function runHook({ home, repoDir } = {}) {
  const env = { ...process.env }
  if (home) env.HOME = home
  if (repoDir) env.CLAUDE_PROJECT_DIR = repoDir
  else delete env.CLAUDE_PROJECT_DIR
  return spawnSync('node', [HOOK], { input: '', encoding: 'utf8', timeout: 5000, env })
}

function mkFixture() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'mpull-home-'))
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'mpull-repo-'))
  return { home, repo, globalMemory: globalMemoryOf(home, repo), repoMemory: path.join(repo, 'memory') }
}

function cleanup(...dirs) {
  for (const d of dirs) fs.rmSync(d, { recursive: true, force: true })
}

function touch(filePath, ms) { fs.utimesSync(filePath, new Date(ms), new Date(ms)) }

console.log('🔍 memory-pull 테스트 시작')

// ─── 정상 흐름 ────────────────────────────────────────────────
section('정상 — 전역 디렉토리 보장')
{
  const { home, repo, globalMemory } = mkFixture()
  // globalMemory 자체를 만들지 않음 (최초 실행 시나리오)
  const r = runHook({ home, repoDir: repo })
  assert('exit 0', r.status, 0)
  assert('전역 memory 디렉토리 생성됨', fs.existsSync(globalMemory), true)
  assert('디렉토리 타입(파일 아님)', fs.statSync(globalMemory).isDirectory(), true)

  cleanup(home, repo)
}

section('정상 — 과거 symlink 자동 마이그레이션')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(repoMemory, { recursive: true })
  fs.writeFileSync(path.join(repoMemory, 'shared.md'), 'repo-content')
  const migrateTargetParent = path.dirname(globalMemory)
  fs.mkdirSync(migrateTargetParent, { recursive: true })
  // 구 구조: 전역 memory 가 레포 memory 를 가리키는 symlink
  fs.symlinkSync(repoMemory, globalMemory)
  assert('사전 조건: symlink 상태', fs.lstatSync(globalMemory).isSymbolicLink(), true)

  const r = runHook({ home, repoDir: repo })
  assert('exit 0', r.status, 0)
  assert('symlink → 실제 디렉토리로 마이그레이션됨', fs.lstatSync(globalMemory).isSymbolicLink(), false)
  assert('마이그레이션 후 디렉토리 타입', fs.statSync(globalMemory).isDirectory(), true)
  assert('레포 내용이 새 디렉토리로 반영됨', fs.readFileSync(path.join(globalMemory, 'shared.md'), 'utf8'), 'repo-content')

  cleanup(home, repo)
}

section('정상 — 레포가 더 최신·내용 다르면 전역 덮어씀')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  fs.mkdirSync(repoMemory, { recursive: true })
  const g = path.join(globalMemory, 'shared.md')
  const rp = path.join(repoMemory, 'shared.md')
  fs.writeFileSync(g, 'old-global'); touch(g, Date.now() - 60_000)
  fs.writeFileSync(rp, 'new-repo'); touch(rp, Date.now())

  const r = runHook({ home, repoDir: repo })
  assert('exit 0', r.status, 0)
  assert('전역이 레포 최신 내용으로 갱신됨', fs.readFileSync(g, 'utf8'), 'new-repo')

  cleanup(home, repo)
}

section('정상 — 전역이 더 최신이면 보존')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  fs.mkdirSync(repoMemory, { recursive: true })
  const g = path.join(globalMemory, 'shared.md')
  const rp = path.join(repoMemory, 'shared.md')
  fs.writeFileSync(rp, 'old-repo'); touch(rp, Date.now() - 60_000)
  fs.writeFileSync(g, 'new-global'); touch(g, Date.now())

  const r = runHook({ home, repoDir: repo })
  assert('exit 0', r.status, 0)
  assert('전역 내용 보존됨(레포로 덮어쓰지 않음)', fs.readFileSync(g, 'utf8'), 'new-global')

  cleanup(home, repo)
}

section('정상 — 동일 내용 무동작')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  fs.mkdirSync(repoMemory, { recursive: true })
  const g = path.join(globalMemory, 'shared.md')
  const rp = path.join(repoMemory, 'shared.md')
  fs.writeFileSync(rp, 'same-content'); touch(rp, Date.now())
  fs.writeFileSync(g, 'same-content'); touch(g, Date.now() - 60_000)
  const mtimeBefore = fs.statSync(g).mtimeMs

  const r = runHook({ home, repoDir: repo })
  assert('exit 0', r.status, 0)
  const mtimeAfter = fs.statSync(g).mtimeMs
  assert('내용 동일 → 복사(mtime 갱신) 발생 안 함', mtimeAfter, mtimeBefore)

  cleanup(home, repo)
}

// ─── 경계 ────────────────────────────────────────────────────
section('경계 — 빈 memory/ (레포 memory 디렉토리는 있지만 파일 없음)')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(repoMemory, { recursive: true }) // 빈 디렉토리

  const r = runHook({ home, repoDir: repo })
  assert('exit 0', r.status, 0)
  assert('전역 디렉토리는 그래도 생성됨', fs.existsSync(globalMemory), true)
  assert('복사할 파일 없어 전역도 비어있음', fs.readdirSync(globalMemory).length, 0)

  cleanup(home, repo)
}

section('경계 — 권한 없음(레포 memory/ 읽기 불가)')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(repoMemory, { recursive: true })
  fs.writeFileSync(path.join(repoMemory, 'shared.md'), 'content')
  fs.chmodSync(repoMemory, 0o000)

  let r
  try {
    r = runHook({ home, repoDir: repo })
    assert('exit 0 (안전장치 — 크래시 없음)', r.status, 0)
    // 1단계(전역 디렉토리 보장)는 2단계 실패와 무관하게 선행 완료되어야 함
    assert('전역 디렉토리는 생성됨(1단계는 2단계 실패에 영향받지 않음)', fs.existsSync(globalMemory), true)
  } finally {
    fs.chmodSync(repoMemory, 0o755) // cleanup을 위해 권한 복구
  }

  cleanup(home, repo)
}

section('경계 — 깨진 symlink (한 항목이 나머지 동기화를 막지 않음)')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(repoMemory, { recursive: true })
  fs.symlinkSync('/nonexistent/target/path.md', path.join(repoMemory, 'a-broken.md'))
  fs.writeFileSync(path.join(repoMemory, 'b-valid.md'), 'valid content')

  const r = runHook({ home, repoDir: repo })
  assert('exit 0 (깨진 symlink에도 크래시 없음)', r.status, 0)
  assert('정상 파일은 그래도 전역에 복사됨', fs.readFileSync(path.join(globalMemory, 'b-valid.md'), 'utf8'), 'valid content')
  assert('깨진 symlink 자체는 복사되지 않음', fs.existsSync(path.join(globalMemory, 'a-broken.md')), false)

  cleanup(home, repo)
}

section('경계 — CLAUDE_PROJECT_DIR 없음')
{
  const r = spawnSync('node', [HOOK], { input: '', encoding: 'utf8', timeout: 5000, env: (() => {
    const e = { ...process.env }; delete e.CLAUDE_PROJECT_DIR; return e
  })() })
  assert('exit 0 (아무 동작 안 함)', r.status, 0)
}

// ─── 경로 인코딩 (2026-09-26 실측: 영숫자 외 모든 문자 → '-') ─────────────
function runHookInput({ home, repoDir, input }) {
  const env = { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: repoDir }
  return spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, env })
}
section('인코딩 — 점·공백·한글이 있는 프로젝트 경로는 Claude Code 실제 디렉토리명으로 매핑')
{
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'mpull-home-'))
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'mpull-repo-'))
  const repo = path.join(base, 'my.app v2 한글')
  fs.mkdirSync(path.join(repo, 'memory'), { recursive: true })
  fs.writeFileSync(path.join(repo, 'memory', 'MEMORY.md'), 'idx')
  const r = runHookInput({ home, repoDir: repo, input: '' })
  assert('exit 0', r.status, 0)
  const measured = path.join(home, '.claude', 'projects', repo.replace(/[^A-Za-z0-9]/g, '-'), 'memory')
  const legacy = path.join(home, '.claude', 'projects', repo.replace(/[/_]/g, '-'), 'memory')
  assert('실측 규칙 디렉토리에 반영', fs.existsSync(path.join(measured, 'MEMORY.md')), true)
  assert('구 규칙(/ _ 만 치환) 디렉토리는 만들지 않음', fs.existsSync(legacy), false)
  cleanup(home, base)
}
section('transcript_path 우선 — 훅 입력의 실제 저장소 디렉토리를 사용')
{
  const { home, repo, repoMemory } = mkFixture()
  fs.mkdirSync(repoMemory, { recursive: true })
  fs.writeFileSync(path.join(repoMemory, 'a.md'), 'A')
  const realStore = path.join(home, '.claude', 'projects', '-actual-store-dir')
  fs.mkdirSync(realStore, { recursive: true })
  const input = JSON.stringify({ hook_event_name: 'SessionStart', source: 'startup', transcript_path: path.join(realStore, 's.jsonl') })
  runHookInput({ home, repoDir: repo, input })
  assert('transcript_path 디렉토리의 memory/ 로 반영', fs.readFileSync(path.join(realStore, 'memory', 'a.md'), 'utf8'), 'A')
  cleanup(home, repo)
}
section('악성 — projects 밖·상위 탈출 transcript_path 는 무시 (임의 경로에 memory 생성 금지)')
{
  const { home, repo, repoMemory, globalMemory } = mkFixture()
  fs.mkdirSync(repoMemory, { recursive: true })
  fs.writeFileSync(path.join(repoMemory, 'a.md'), 'A')
  const evil = fs.mkdtempSync(path.join(os.tmpdir(), 'mpull-evil-'))
  for (const tp of [path.join(evil, 'x.jsonl'), path.join(home, '.claude', 'projects', '..', '..', path.basename(evil), 'x.jsonl')]) {
    const r = runHookInput({ home, repoDir: repo, input: JSON.stringify({ transcript_path: tp }) })
    assert(`exit 0 (${path.basename(tp)})`, r.status, 0)
  }
  assert('악성 경로에 memory/ 미생성', fs.existsSync(path.join(evil, 'memory')), false)
  assert('인코딩 폴백 경로로 반영', fs.readFileSync(path.join(globalMemory, 'a.md'), 'utf8'), 'A')
  const r2 = runHookInput({ home, repoDir: repo, input: '{not json' })
  assert('깨진 stdin JSON 에도 exit 0', r2.status, 0)
  cleanup(home, repo, evil)
}

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
