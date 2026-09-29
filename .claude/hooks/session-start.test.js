#!/usr/bin/env node
/**
 * session-start.test.js — SessionStart 훅(브랜치·미커밋 파일·최근 커밋 요약) 테스트
 * 실행: node .claude/hooks/session-start.test.js
 */

const { spawnSync, execSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'session-start.js')

let passed = 0, failed = 0

function sh(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'pipe' })
}

function makeGitRepo({ commits = true, dirty = false, weirdFileName = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'session-start-test-'))
  sh('git init -q -b main', dir)
  sh('git config user.email test@example.com', dir)
  sh('git config user.name test', dir)
  if (commits) {
    fs.writeFileSync(path.join(dir, 'README.md'), '# test\n')
    sh('git add README.md', dir)
    sh('git commit -q -m "init"', dir)
  }
  if (dirty) {
    fs.writeFileSync(path.join(dir, 'dirty.txt'), 'changed\n')
  }
  if (weirdFileName) {
    // 파일명에 셸 메타문자를 넣어 git status --porcelain 출력에 포함시킨다.
    // 훅은 이 출력을 다른 exec에 절대 전달하지 않아야 한다(인젝션 불가 확인용).
    fs.writeFileSync(path.join(dir, '$(touch pwned).txt'), 'x')
    fs.writeFileSync(path.join(dir, '`touch pwned2`.txt'), 'x')
    fs.writeFileSync(path.join(dir, '; touch pwned3 ;.txt'), 'x')
  }
  return dir
}

function runHook(stdinRaw, cwd) {
  return spawnSync('node', [HOOK], { input: stdinRaw, encoding: 'utf8', timeout: 5000, cwd })
}

// 공식 문서(code.claude.com/docs/en/hooks): "Stderr from a hook that exits 0 goes to the debug log only,
// never the transcript, and Claude never sees it." → SessionStart 는 stdout JSON
// hookSpecificOutput.additionalContext(Claude) + systemMessage(사용자) 로 전달해야 한다.
function parseOut(r) {
  try {
    const j = JSON.parse(r.stdout)
    if (j?.hookSpecificOutput?.hookEventName !== 'SessionStart') return null
    const ctx = j.hookSpecificOutput.additionalContext
    if (typeof ctx !== 'string' || typeof j.systemMessage !== 'string') return null
    return { ctx, msg: j.systemMessage }
  } catch { return null }
}

function test(desc, stdinRaw, cwd, opts = {}) {
  const r = runHook(stdinRaw, cwd)
  const out = parseOut(r)
  let pass = r.status === 0 && out !== null && r.stderr === ''
  if (pass && opts.stderrIncludes) {
    for (const s of [].concat(opts.stderrIncludes)) pass = pass && out.ctx.includes(s) && out.msg.includes(s)
  }
  if (pass && opts.stderrExcludes) {
    for (const s of [].concat(opts.stderrExcludes)) pass = pass && !out.ctx.includes(s)
  }
  if (pass && opts.check) pass = opts.check(out)
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (exit ${r.status}, stdout: ${JSON.stringify(r.stdout).slice(0, 200)}, stderr: ${JSON.stringify(r.stderr).slice(0, 120)})`}`)
  pass ? passed++ : failed++
}

console.log('🔍 session-start 테스트 시작')

const cleanRepo = makeGitRepo({ commits: true, dirty: false })
const dirtyRepo = makeGitRepo({ commits: true, dirty: true })
const emptyRepo = makeGitRepo({ commits: false })
const notARepo = fs.mkdtempSync(path.join(os.tmpdir(), 'session-start-norepo-'))
const injectRepo = makeGitRepo({ commits: true, weirdFileName: true })

console.log('\n── 정상 흐름 ──')
test('클린 저장소 → exit 0, 브랜치명 출력, 미커밋 파일 라인 없음',
  '{}', cleanRepo, { stderrIncludes: '브랜치: main', stderrExcludes: '미커밋 파일' })
test('최근 커밋 있는 저장소 → 최근 커밋 라인 출력', '{}', cleanRepo, { stderrIncludes: '최근 커밋:' })
test('미커밋 파일 있는 저장소 → 미커밋 파일 개수 출력', '{}', dirtyRepo, { stderrIncludes: '미커밋 파일: 1개' })
test('커밋 없는 저장소(빈 repo) → exit 0, 크래시 없음(최근 커밋 라인 생략)',
  '{}', emptyRepo, { stderrExcludes: '최근 커밋:' })

console.log('\n── 악성/경계 — stdin 조작 (훅은 stdin을 읽지 않음, 어떤 입력이든 안전해야 함) ──')
test('빈 stdin → exit 0, 정상 출력 유지', '', cleanRepo, { stderrIncludes: '브랜치: main' })
test('깨진 JSON stdin → exit 0, 정상 출력 유지(stdin 파싱 자체를 안 함)', '{not valid json,,,', cleanRepo, { stderrIncludes: '브랜치: main' })
test('필드 누락(완전 빈 객체) → exit 0', '{}', cleanRepo, { stderrIncludes: '브랜치: main' })
const hugeJunk = 'x'.repeat(3_000_000)
test('거대 입력(3MB, 훅이 읽지 않으므로 무시됨) → exit 0, 멈추지 않음', hugeJunk, cleanRepo, { stderrIncludes: '브랜치: main' })
test('경로 조작 문자열이 담긴 stdin(훅이 사용하지 않음) → exit 0', JSON.stringify({ cwd: '../../../../etc/passwd' }), cleanRepo, { stderrIncludes: '브랜치: main' })
test('셸 메타문자가 담긴 stdin(훅이 사용하지 않음) → exit 0, 인젝션 없음', JSON.stringify({ message: '"; rm -rf ~ #' }), cleanRepo, { stderrIncludes: '브랜치: main' })

console.log('\n── 악성/경계 — 저장소 상태 ──')
test('git 저장소가 아닌 디렉토리 → exit 0, 크래시 없이 unknown/빈 값으로 처리', '{}', notARepo, { stderrIncludes: '브랜치: unknown' })
test('파일명에 셸 메타문자($() ` ;) 포함된 상태에서 git status 파싱 → exit 0, 크래시 없음',
  '{}', injectRepo, { stderrIncludes: '미커밋 파일: 3개' })

// 인젝션 마커가 실제로 실행되지 않았는지 확인 (run()이 고정 문자열만 exec하므로 파일명이 명령으로 해석되면 안 됨)
for (const marker of ['pwned', 'pwned2', 'pwned3']) {
  const markerPath = path.join(injectRepo, marker)
  if (fs.existsSync(markerPath)) {
    console.log(`  ❌ 인젝션 마커 파일(${marker}) 생성됨 — 파일명이 명령으로 실행됨`)
    failed++
  } else {
    console.log(`  ✅ 인젝션 마커(${marker}) 미생성 — 파일명이 명령으로 실행되지 않음 확인`)
    passed++
  }
}

console.log('\n── 경계 — 출력 채널·크기 ──')
const nlRepo = makeGitRepo({ commits: true })
fs.writeFileSync(path.join(nlRepo, 'a\nb.txt'), 'x')
test('개행 포함 파일명 1개 → 미커밋 파일 1개 (줄 수로 세지 않음)', '{}', nlRepo, { stderrIncludes: '미커밋 파일: 1개' })
const longRepo = makeGitRepo({ commits: true })
execSync('git commit -q --allow-empty -F -', { cwd: longRepo, input: 'L'.repeat(50_000) + '\n', stdio: ['pipe', 'pipe', 'pipe'] })
test('초장문 커밋 메시지(50KB) → additionalContext 10,000자 상한 이내', '{}', longRepo, {
  check: (o) => o.ctx.length <= 10000 && o.msg.length <= 10000,
})
test('stdout 은 JSON 한 덩어리만 (평문 혼입 없음)', '{}', cleanRepo, { stderrIncludes: '브랜치: main' })

console.log('\n── 경계 — 1글자·공백 파일명 (-z 출력 trim 으로 첫 항목 선행 공백 " M" 이 사라지던 버그) ──')
const extraRepos = []
const repoWith = (setup) => {
  const d = makeGitRepo({ commits: true })
  extraRepos.push(d)
  setup(d)
  return d
}
const commitFiles = (d, files) => {
  for (const f of files) fs.writeFileSync(path.join(d, f), 'orig\n')
  sh('git add -A', d); sh('git commit -q -m files', d)
}
test('tracked 1글자 파일 "a" 수정(첫 항목 " M a") → 미커밋 파일 1개', '{}',
  repoWith((d) => { commitFiles(d, ['a']); fs.writeFileSync(path.join(d, 'a'), 'mod\n') }),
  { stderrIncludes: '미커밋 파일: 1개' })
test('tracked "a"·"b" 수정 → 미커밋 파일 2개', '{}',
  repoWith((d) => { commitFiles(d, ['a', 'b']); fs.writeFileSync(path.join(d, 'a'), 'm\n'); fs.writeFileSync(path.join(d, 'b'), 'm\n') }),
  { stderrIncludes: '미커밋 파일: 2개' })
test('tracked "a" 수정 + untracked "b" → 미커밋 파일 2개', '{}',
  repoWith((d) => { commitFiles(d, ['a']); fs.writeFileSync(path.join(d, 'a'), 'm\n'); fs.writeFileSync(path.join(d, 'b'), 'n\n') }),
  { stderrIncludes: '미커밋 파일: 2개' })
test('공백 파일명 " " 수정 → 미커밋 파일 1개', '{}',
  repoWith((d) => { commitFiles(d, [' ']); fs.writeFileSync(path.join(d, ' '), 'm\n') }),
  { stderrIncludes: '미커밋 파일: 1개' })
test('선행 공백 파일명 " x" + 1글자 "a" 수정 → 미커밋 파일 2개', '{}',
  repoWith((d) => { commitFiles(d, [' x', 'a']); fs.writeFileSync(path.join(d, ' x'), 'm\n'); fs.writeFileSync(path.join(d, 'a'), 'm\n') }),
  { stderrIncludes: '미커밋 파일: 2개' })
test('1글자 rename "a" → "b" (staged, 원경로 토큰 1개 추가) → 미커밋 파일 1개', '{}',
  repoWith((d) => { commitFiles(d, ['a']); sh('git mv a b', d) }),
  { stderrIncludes: '미커밋 파일: 1개' })

// cleanup
for (const d of [cleanRepo, dirtyRepo, emptyRepo, notARepo, injectRepo, nlRepo, longRepo, ...extraRepos]) {
  try { fs.rmSync(d, { recursive: true, force: true }) } catch {}
}

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
