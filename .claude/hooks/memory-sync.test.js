#!/usr/bin/env node
/**
 * memory-sync.test.js — memory-sync.js(PostToolUse Write|Edit) 미러 복사 테스트
 * 실행: node .claude/hooks/memory-sync.test.js
 *
 * 격리 원칙: 실제 ~/.claude/projects/*, 레포 memory/ 는 절대 건드리지 않는다.
 * 모든 테스트는 HOME·CLAUDE_PROJECT_DIR 을 mktemp 임시 디렉토리로 바꿔 실행한다.
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'memory-sync.js')

let passed = 0, failed = 0

function assert(desc, actual, expected) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${JSON.stringify(expected)}, 실제: ${JSON.stringify(actual)})`}`)
  pass ? passed++ : failed++
}

function section(title) { console.log(`\n── ${title} ──`) }

// 훅과 동일한 인코딩 규칙 (/ 와 _ 를 모두 - 로 치환)
function encode(projectDir) { return projectDir.replace(/[/_]/g, '-') }

function globalMemoryOf(tmpHome, repoDir) {
  return path.join(tmpHome, '.claude', 'projects', encode(repoDir), 'memory')
}

function runHook(toolInput, { home, repoDir, toolName = 'Write' } = {}) {
  const input = JSON.stringify({
    hook_event_name: 'PostToolUse', tool_name: toolName, tool_input: toolInput,
  })
  const env = { ...process.env }
  if (home) env.HOME = home
  if (repoDir) env.CLAUDE_PROJECT_DIR = repoDir
  else delete env.CLAUDE_PROJECT_DIR
  return spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, env })
}

function mkFixture() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'msync-home-'))
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'msync-repo-'))
  return { home, repo, globalMemory: globalMemoryOf(home, repo), repoMemory: path.join(repo, 'memory') }
}

function cleanup(...dirs) {
  for (const d of dirs) fs.rmSync(d, { recursive: true, force: true })
}

console.log('🔍 memory-sync 테스트 시작')

// ─── 정상 흐름 ────────────────────────────────────────────────
section('정상 — 전역 쓰기 → 레포 복사')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  fs.mkdirSync(repoMemory, { recursive: true }) // Y 프로젝트: 레포 memory/ 이미 존재
  const filePath = path.join(globalMemory, 'foo.md')
  fs.writeFileSync(filePath, 'global-v1')

  const r = runHook({ file_path: filePath }, { home, repoDir: repo })
  assert('exit 0', r.status, 0)
  assert('레포 memory/foo.md 생성됨', fs.existsSync(path.join(repoMemory, 'foo.md')), true)
  assert('내용 동일하게 복사됨', fs.readFileSync(path.join(repoMemory, 'foo.md'), 'utf8'), 'global-v1')

  cleanup(home, repo)
}

section('정상 — 레포 쓰기 → 전역 복사')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  fs.mkdirSync(repoMemory, { recursive: true })
  const filePath = path.join(repoMemory, 'bar.md')
  fs.writeFileSync(filePath, 'repo-v1')

  const r = runHook({ file_path: filePath }, { home, repoDir: repo, toolName: 'Edit' })
  assert('exit 0', r.status, 0)
  assert('전역 memory/bar.md 생성됨', fs.existsSync(path.join(globalMemory, 'bar.md')), true)
  assert('내용 동일하게 복사됨', fs.readFileSync(path.join(globalMemory, 'bar.md'), 'utf8'), 'repo-v1')

  cleanup(home, repo)
}

section('비대상 경로 무시')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  fs.mkdirSync(repoMemory, { recursive: true })
  const outsidePath = path.join(repo, 'README.md')
  fs.writeFileSync(outsidePath, 'not memory content')

  const r = runHook({ file_path: outsidePath }, { home, repoDir: repo })
  assert('exit 0', r.status, 0)
  assert('전역 memory/ 비어있음(미동작)', fs.readdirSync(globalMemory).length, 0)
  assert('레포 memory/ 비어있음(미동작)', fs.readdirSync(repoMemory).length, 0)

  cleanup(home, repo)
}

// ─── 악성/경계 ────────────────────────────────────────────────
section('악성 — ../ 경로 조작으로 memory 밖 쓰기 유도')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  fs.mkdirSync(repoMemory, { recursive: true })
  // 문자열에는 '/memory/' 가 포함되지만 실제로는 memory 밖을 가리킴
  const outsideSecret = path.join(repo, 'secret.txt')
  fs.writeFileSync(outsideSecret, 'top-secret')
  // path.join은 '..'를 정규화해버려 '/memory/' 문자열이 사라지므로, 문자열을 직접 이어붙여
  // "게이트(문자열에 '/memory/' 포함)는 통과하지만 실제로는 memory 밖을 가리키는" 상황을 재현한다
  const traversalPath = `${repoMemory}/../secret.txt`
  assert('문자열 표현에 /memory/ 포함 (게이트 통과 확인용)', traversalPath.includes('/memory/'), true)

  const r = runHook({ file_path: traversalPath }, { home, repoDir: repo })
  assert('exit 0 (조용히 무시)', r.status, 0)
  assert('전역 memory/ 로 secret.txt 유출되지 않음', fs.existsSync(path.join(globalMemory, 'secret.txt')), false)
  assert('전역 memory/ 자체가 비어있음', fs.readdirSync(globalMemory).length, 0)

  cleanup(home, repo)
}

section('악성 — 심볼릭 링크로 memory 밖 파일 유출 시도')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  fs.mkdirSync(repoMemory, { recursive: true })
  const outsideSecret = path.join(home, 'outside-secret.txt')
  fs.writeFileSync(outsideSecret, 'top-secret-via-symlink')
  const linkPath = path.join(globalMemory, 'link.md')
  fs.symlinkSync(outsideSecret, linkPath)

  const r = runHook({ file_path: linkPath }, { home, repoDir: repo })
  assert('exit 0 (조용히 무시)', r.status, 0)
  assert('레포 memory/ 로 심볼릭 링크 대상이 복사되지 않음', fs.readdirSync(repoMemory).length, 0)

  cleanup(home, repo)
}

section('경계 — 레포 memory/ 없음(N 프로젝트) 시 무동작')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  // repoMemory 는 만들지 않음 (N 프로젝트)
  const filePath = path.join(globalMemory, 'foo.md')
  fs.writeFileSync(filePath, 'global-only')

  const r = runHook({ file_path: filePath }, { home, repoDir: repo })
  assert('exit 0', r.status, 0)
  assert('레포에 memory/ 디렉토리를 새로 만들지 않음', fs.existsSync(repoMemory), false)

  cleanup(home, repo)
}

section('경계 — 깨진 stdin JSON')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  fs.mkdirSync(repoMemory, { recursive: true })

  const r = spawnSync('node', [HOOK], {
    input: '{not-json', encoding: 'utf8', timeout: 5000,
    env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: repo },
  })
  assert('exit 0 (안전장치)', r.status, 0)
  assert('아무 것도 복사 안 됨', fs.readdirSync(globalMemory).length === 0 && fs.readdirSync(repoMemory).length === 0, true)

  cleanup(home, repo)
}

section('경계 — 빈 file_path')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  fs.mkdirSync(repoMemory, { recursive: true })

  const r = runHook({ file_path: '' }, { home, repoDir: repo })
  assert('exit 0', r.status, 0)
  assert('아무 것도 복사 안 됨', fs.readdirSync(globalMemory).length === 0 && fs.readdirSync(repoMemory).length === 0, true)

  const r2 = runHook({}, { home, repoDir: repo }) // file_path 필드 자체 없음
  assert('file_path 필드 없어도 exit 0', r2.status, 0)

  cleanup(home, repo)
}

section('경계 — CLAUDE_PROJECT_DIR 없음')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  fs.mkdirSync(repoMemory, { recursive: true })
  const filePath = path.join(globalMemory, 'foo.md')
  fs.writeFileSync(filePath, 'v1')

  const r = runHook({ file_path: filePath }, { home }) // repoDir 미지정 → env 에서 삭제됨
  assert('exit 0', r.status, 0)
  assert('레포 쪽 미동작', fs.readdirSync(repoMemory).length, 0)

  cleanup(home, repo)
}

section('git 조작을 절대 하지 않음 확인')
{
  const { home, repo, globalMemory, repoMemory } = mkFixture()
  fs.mkdirSync(globalMemory, { recursive: true })
  fs.mkdirSync(repoMemory, { recursive: true })
  const git = (args) => spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8' })
  git(['init', '-q'])
  git(['config', 'user.email', 't@t.local'])
  git(['config', 'user.name', 't'])
  fs.writeFileSync(path.join(repoMemory, 'tracked.md'), 'v1')
  git(['add', '.'])
  git(['commit', '-qm', 'init'])
  const logBefore = git(['log', '--oneline']).stdout

  const filePath = path.join(globalMemory, 'newfile.md')
  fs.writeFileSync(filePath, 'from-global')
  const r = runHook({ file_path: filePath }, { home, repoDir: repo })
  assert('exit 0', r.status, 0)
  assert('레포에 파일이 미러 복사됨(파일시스템 변경은 발생)', fs.existsSync(path.join(repoMemory, 'newfile.md')), true)

  const logAfter = git(['log', '--oneline']).stdout
  assert('커밋 로그 변화 없음 (훅이 git commit 하지 않음)', logAfter, logBefore)
  const status = git(['status', '--porcelain']).stdout
  assert('새 파일이 미커밋 상태로 남아있음(자동 add/commit 안 함)', status.includes('newfile.md'), true)

  cleanup(home, repo)
}

// ─── 경로 인코딩 · transcript_path (2026-09-26) ──────────────────────────
section('인코딩 — 점·공백·한글 경로의 전역 쓰기가 레포로 미러된다 (구 규칙이면 매칭 실패)')
{
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'msync-home-'))
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'msync-repo-'))
  const repo = path.join(base, 'my.app v2 한글')
  fs.mkdirSync(path.join(repo, 'memory'), { recursive: true })
  const gm = path.join(home, '.claude', 'projects', repo.replace(/[^A-Za-z0-9]/g, '-'), 'memory')
  fs.mkdirSync(gm, { recursive: true })
  fs.writeFileSync(path.join(gm, 'n.md'), 'N')
  const r = runHook({ file_path: path.join(gm, 'n.md') }, { home, repoDir: repo })
  assert('exit 0', r.status, 0)
  assert('레포 memory/ 로 복사', fs.existsSync(path.join(repo, 'memory', 'n.md')) && fs.readFileSync(path.join(repo, 'memory', 'n.md'), 'utf8'), 'N')
  cleanup(home, base)
}
section('transcript_path 우선 / 악성 transcript_path 무시')
{
  const { home, repo, repoMemory, globalMemory } = mkFixture()
  fs.mkdirSync(repoMemory, { recursive: true })
  const realStore = path.join(home, '.claude', 'projects', '-actual-store-dir')
  fs.mkdirSync(path.join(realStore, 'memory'), { recursive: true })
  fs.writeFileSync(path.join(realStore, 'memory', 't.md'), 'T')
  const mk = (tp, fp) => spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Write',
    tool_input: { file_path: fp }, transcript_path: tp }), encoding: 'utf8', timeout: 5000,
    env: { ...process.env, HOME: home, CLAUDE_PROJECT_DIR: repo } })
  mk(path.join(realStore, 's.jsonl'), path.join(realStore, 'memory', 't.md'))
  assert('transcript_path 저장소의 memory 쓰기 → 레포 미러', fs.existsSync(path.join(repoMemory, 't.md')), true)
  // 악성: 공격자 디렉토리를 transcript 로 위장해 그 안의 memory 파일을 레포로 끌어오려는 시도
  const evil = fs.mkdtempSync(path.join(os.tmpdir(), 'msync-evil-'))
  fs.mkdirSync(path.join(evil, 'memory'))
  fs.writeFileSync(path.join(evil, 'memory', 'evil.md'), 'EVIL')
  const r = mk(path.join(evil, 'x.jsonl'), path.join(evil, 'memory', 'evil.md'))
  assert('악성 transcript_path: exit 0', r.status, 0)
  assert('악성 경로 파일은 레포로 복사되지 않음', fs.existsSync(path.join(repoMemory, 'evil.md')), false)
  assert('악성 경로 기준으로 전역 디렉토리 생성 안 함', fs.existsSync(globalMemory) && fs.readdirSync(globalMemory).includes('evil.md'), false)
  cleanup(home, repo, evil)
}

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
