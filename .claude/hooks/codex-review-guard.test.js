#!/usr/bin/env node
/**
 * codex-review-guard.test.js — Codex 리뷰 강제 훅의 스킵 경로 테스트
 * 실행: node .claude/hooks/codex-review-guard.test.js
 * 주의: codex CLI·로그인 상태에 의존하는 차단 경로는 환경 의존적이라 테스트하지 않고,
 *       결정론적인 스킵(통과) 경로만 검증한다.
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'codex-review-guard.js')

let passed = 0, failed = 0

function test(desc, input, expectedExit, cwd, stderrIncludes) {
  const r = spawnSync('node', [HOOK], {
    input: input === null ? '' : JSON.stringify(input),
    encoding: 'utf8', timeout: 10000, cwd,
  })
  let pass = r.status === expectedExit
  if (pass && stderrIncludes) pass = r.stderr.includes(stderrIncludes)
  // 메시지 채널 단언 — Stop exit 2 는 stderr 가 "계속해야 하는 이유"로 Claude 에게 전달된다
  if (pass && expectedExit === 2) pass = r.stderr.includes('codex-review-guard:') && !(r.stdout || '').includes('codex-review-guard')
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status}, stderr: ${r.stderr.slice(0, 80)})`}`)
  pass ? passed++ : failed++
}

console.log('🔍 codex-review-guard 테스트 시작 (스킵 경로)')

const noRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-test-'))

test('빈 stdin → exit 0 (스킵)', null, 0, noRepo, 'stdin')
test('Stop 아닌 이벤트 → exit 0 (스킵)', { hook_event_name: 'SessionStart' }, 0, noRepo, '이벤트 아님')
for (const raw of ['null', '[1,2]', '"str"', '42']) {
  const r = spawnSync('node', [HOOK], { input: raw, encoding: 'utf8', timeout: 10000, cwd: noRepo })
  const pass = r.status === 0
  console.log(`  ${pass ? '✅' : '❌'} 비객체 JSON 입력 ${raw} → 크래시 없이 exit 0 → ${pass ? 'PASS' : `FAIL (exit ${r.status})`}`)
  pass ? passed++ : failed++
}
test('git 레포 아님 → exit 0 (스킵)', { hook_event_name: 'Stop' }, 0, noRepo, 'git 레포 아님')

fs.rmSync(noRepo, { recursive: true, force: true })

console.log('\n── 차단 경로 (codex 스텁) → exit 2 + stderr 사유 ──')
{
  const { execSync } = require('child_process')
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-block-'))
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-bin-'))
  execSync('git init -q', { cwd: repo })
  fs.mkdirSync(path.join(repo, '.claude'), { recursive: true })
  fs.writeFileSync(path.join(repo, '.claude', 'settings.json'), JSON.stringify({ enabledPlugins: { 'codex@openai-codex': true } }))
  // 공백·한글·따옴표 경로 파싱은 아래 "경로 파싱" 스위트에서 검증 (여기는 메시지 채널 검증 목적)
  fs.writeFileSync(path.join(repo, 'app.js'), 'module.exports = 1\n')
  const stub = path.join(bin, 'codex')
  const env = (login) => ({ ...process.env, PATH: `${bin}:${process.env.PATH}`, STUB_LOGIN: login })
  fs.writeFileSync(stub, '#!/bin/sh\nif [ "$STUB_LOGIN" = "yes" ]; then echo "Logged in using ChatGPT"; else echo "Not logged in"; exit 1; fi\n')
  fs.chmodSync(stub, 0o755)

  const runBlock = (desc, login, needle) => {
    const r = spawnSync('node', [HOOK], {
      input: JSON.stringify({ hook_event_name: 'Stop' }), encoding: 'utf8', timeout: 20000, cwd: repo, env: env(login),
    })
    const pass = r.status === 2 && r.stderr.includes('codex-review-guard:') && r.stderr.includes(needle)
      && !(r.stdout || '').includes('codex-review-guard')
    console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (exit ${r.status}, stderr: ${r.stderr.slice(0, 80)}, stdout: ${(r.stdout || '').slice(0, 80)})`}`)
    pass ? passed++ : failed++
  }
  runBlock('코드 변경 + 로그인 → 리뷰 요구 사유는 stderr', 'yes', '적대적 리뷰 필요')
  // 미로그인은 Claude 가 해소 불가(대화형 브라우저 로그인) → 차단하면 8회 연속 루프. 규칙 codex-review.md
  // "3가지 중 하나라도 실패 → 조용히 건너뜀"과 일치하게 통과(차단·Claude 지시 없음)
  {
    const r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'Stop' }), encoding: 'utf8', timeout: 20000, cwd: repo, env: env('no') })
    const pass = r.status === 0 && !r.stderr.includes('codex login') && (r.stdout || '').trim() === ''
    console.log(`  ${pass ? '✅' : '❌'} 코드 변경 + 미로그인(exit 1 "Not logged in") → 조용히 통과(exit 0, 'codex login' 지시 없음) → ${pass ? 'PASS' : `FAIL (exit ${r.status}, stderr: ${r.stderr.slice(0, 80)})`}`)
    pass ? passed++ : failed++
  }
  {
    // 종료코드 0 인데 "Not logged in" 출력 — /logged in/ 부분 매치로 로그인 판정하면 안 됨
    const stub2 = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-bin-nl-'))
    fs.writeFileSync(path.join(stub2, 'codex'), '#!/bin/sh\necho "Not logged in"\nexit 0\n')
    fs.chmodSync(path.join(stub2, 'codex'), 0o755)
    const r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'Stop' }), encoding: 'utf8', timeout: 20000, cwd: repo,
      env: { ...process.env, PATH: `${stub2}:${process.env.PATH}` } })
    const pass = r.status === 0 && !r.stderr.includes('리뷰 필요')
    console.log(`  ${pass ? '✅' : '❌'} "Not logged in" + exit 0 → 미로그인으로 판정(부분 매치 오판 금지) → ${pass ? 'PASS' : `FAIL (exit ${r.status})`}`)
    pass ? passed++ : failed++
    fs.rmSync(stub2, { recursive: true, force: true })
  }

  // 마커가 변경보다 최신이면 통과 (차단 사유 출력 없음)
  const marker = path.join(repo, '.claude', '.codex-review-done')
  fs.writeFileSync(marker, '')
  const future = new Date(Date.now() + 60000)
  fs.utimesSync(marker, future, future)
  const r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'Stop' }), encoding: 'utf8', timeout: 20000, cwd: repo, env: env('yes') })
  const okMarker = r.status === 0 && !r.stderr.includes('리뷰 필요')
  console.log(`  ${okMarker ? '✅' : '❌'} 마커 최신 → exit 0, 차단 사유 없음 → ${okMarker ? 'PASS' : `FAIL (exit ${r.status})`}`)
  okMarker ? passed++ : failed++

  fs.rmSync(repo, { recursive: true, force: true })
  fs.rmSync(bin, { recursive: true, force: true })
}

console.log('\n── 경로 파싱 (공백·한글·따옴표·개행·rename·untracked 디렉토리) ──')
{
  const { execSync } = require('child_process')
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-bin2-'))
  const stub = path.join(bin, 'codex')
  fs.writeFileSync(stub, '#!/bin/sh\necho "Logged in using ChatGPT"\n')
  fs.chmodSync(stub, 0o755)
  const env = { ...process.env, PATH: `${bin}:${process.env.PATH}` }
  const git = (repo, args) => spawnSync('git', args, { cwd: repo, encoding: 'utf8' })

  // setup(repo): 커밋 전 상태 준비 / change(repo): 커밋 이후 변경 / marker: 'old'|'new'|undefined
  const scenario = (desc, { committed = [], change, marker, expect }) => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-path-'))
    try {
      execSync('git init -q && git config user.email t@t && git config user.name t && git config core.quotePath true', { cwd: repo })
      fs.mkdirSync(path.join(repo, '.claude'), { recursive: true })
      fs.writeFileSync(path.join(repo, '.claude', 'settings.json'), JSON.stringify({ enabledPlugins: { 'codex@openai-codex': true } }))
      fs.writeFileSync(path.join(repo, '.gitignore'), '.claude/\n')
      for (const f of committed) {
        fs.mkdirSync(path.dirname(path.join(repo, f)), { recursive: true })
        fs.writeFileSync(path.join(repo, f), 'x\n')
      }
      git(repo, ['add', '-A']); git(repo, ['commit', '-qm', 'init', '--allow-empty'])
      const past = new Date(Date.now() - 3600_000)
      const future = new Date(Date.now() + 3600_000)
      const markerPath = path.join(repo, '.claude', '.codex-review-done')
      if (marker === 'new') { change(repo, git); fs.writeFileSync(markerPath, ''); fs.utimesSync(markerPath, future, future) }
      else { if (marker === 'old') { fs.writeFileSync(markerPath, ''); fs.utimesSync(markerPath, past, past) } change(repo, git) }
      const r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'Stop' }), encoding: 'utf8', timeout: 20000, cwd: repo, env })
      const pass = r.status === expect && (expect !== 2 || r.stderr.includes('적대적 리뷰 필요'))
      console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 ${expect}, 실제 ${r.status}, stderr: ${r.stderr.slice(0, 80)})`}`)
      pass ? passed++ : failed++
    } finally { fs.rmSync(repo, { recursive: true, force: true }) }
  }
  const write = (rel, body = 'y\n') => (repo) => {
    fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true })
    fs.writeFileSync(path.join(repo, rel), body)
  }

  // 정상/버그 재현
  scenario('untracked 공백 디렉토리 "src dir/app.js" → 리뷰 요구', { change: write('src dir/app.js'), expect: 2 })
  scenario('tracked 공백 파일 "my file.js" 수정 → 리뷰 요구', { committed: ['my file.js'], change: write('my file.js'), expect: 2 })
  scenario('한글 파일명 "한글.ts" (quotePath 기본값) → 리뷰 요구', { change: write('한글.ts'), expect: 2 })
  scenario('따옴표 포함 파일명 a"b.py → 리뷰 요구', { change: write('a"b.py'), expect: 2 })
  scenario('개행 포함 파일명 "a\\nb.go" → 리뷰 요구', { change: write('a\nb.go'), expect: 2 })
  scenario('rename 문서→공백 코드 "notes.txt -> new name.js" (staged) → 리뷰 요구', {
    committed: ['notes.txt'], change: (repo, g) => { g(repo, ['mv', 'notes.txt', 'new name.js']) }, expect: 2,
  })
  scenario('파일명에 " -> " 리터럴 포함 "x -> y.rs" → 리뷰 요구', { change: write('x -> y.rs'), expect: 2 })
  // 마커 경로 — 첫 줄 선행 공백(" M") trim 으로 경로 앞 글자가 잘리던 버그
  scenario('마커(과거) 이후 tracked "app.js" worktree 수정 → 리뷰 재요구', { committed: ['app.js'], change: write('app.js'), marker: 'old', expect: 2 })
  scenario('마커(과거) 이후 공백 경로 "src dir/app.js" 수정 → 리뷰 재요구', { committed: ['src dir/app.js'], change: write('src dir/app.js'), marker: 'old', expect: 2 })
  // 악성·오탐 방어 — 코드가 아닌데 리뷰를 요구하면 안 됨 / 마커 우회 안 됨
  scenario('마커(최신) + 공백 경로 코드 변경은 이전 → 통과', { committed: ['src dir/app.js'], change: write('src dir/app.js'), marker: 'new', expect: 0 })
  scenario('비코드 공백 파일 "my notes.md" 만 변경 → 통과', { change: write('my notes.md'), expect: 0 })
  scenario('확장자 위장 "evil.js.md" / 디렉토리명 "x.js/readme.txt" → 통과', {
    change: (repo) => { write('evil.js.md')(repo); write('x.js/readme.txt')(repo) }, expect: 0,
  })
  scenario('rename 코드→문서 "old.js -> old.txt" (origin 경로로 오탐 금지) → 통과', {
    committed: ['old.js'], change: (repo, g) => { g(repo, ['mv', 'old.js', 'old.txt']) }, expect: 0,
  })
  scenario('변경 없음(빈 상태) → 통과', { change: () => {}, expect: 0 })

  fs.rmSync(bin, { recursive: true, force: true })
}

console.log('\n── stop_hook_active 루프 방지 — 같은 사유 재차단 금지, 사용자 systemMessage 로 경고 후 통과 ──')
{
  const { execSync } = require('child_process')
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-loop-'))
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-loop-bin-'))
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-loop-tmp-')) // 훅 상태 파일 격리(TMPDIR)
  execSync('git init -q', { cwd: repo })
  fs.mkdirSync(path.join(repo, '.claude'), { recursive: true })
  fs.writeFileSync(path.join(repo, '.claude', 'settings.json'), JSON.stringify({ enabledPlugins: { 'codex@openai-codex': true } }))
  fs.writeFileSync(path.join(repo, 'app.js'), 'x\n')
  fs.writeFileSync(path.join(bin, 'codex'), '#!/bin/sh\necho "Logged in using ChatGPT"\n')
  fs.chmodSync(path.join(bin, 'codex'), 0o755)
  const env = { ...process.env, PATH: `${bin}:${process.env.PATH}`, TMPDIR: tmp }
  const stop = (extra) => {
    const r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'Stop', ...extra }), encoding: 'utf8', timeout: 20000, cwd: repo, env })
    let j = null; try { j = r.stdout.trim() ? JSON.parse(r.stdout) : null } catch { j = 'INVALID' }
    return { ...r, j }
  }
  const check = (desc, cond, r) => {
    console.log(`  ${cond ? '✅' : '❌'} ${desc} → ${cond ? 'PASS' : `FAIL (exit ${r.status}, stdout: ${(r.stdout || '').slice(0, 100)}, stderr: ${r.stderr.slice(0, 80)})`}`)
    cond ? passed++ : failed++
  }
  let r = stop({ session_id: 's1', stop_hook_active: false })
  check('1차 Stop(active=false) → 차단 exit 2', r.status === 2 && r.stderr.includes('적대적 리뷰 필요'), r)
  r = stop({ session_id: 's1', stop_hook_active: true })
  check('계속 진행 중(active=true) + 같은 사유 → 재차단 없이 exit 0 + 사용자 systemMessage 경고', r.status === 0 && r.j && typeof r.j.systemMessage === 'string' && r.j.systemMessage.includes('codex-review-guard') && !('decision' in r.j), r)
  r = stop({ session_id: 's1', stop_hook_active: true })
  check('같은 연쇄에서 반복 시도 → 계속 통과(루프 없음)', r.status === 0, r)
  r = stop({ session_id: 's1', stop_hook_active: false })
  check('새 사용자 턴(active=false) → 다시 1회 차단', r.status === 2, r)
  r = stop({ session_id: 's2', stop_hook_active: true })
  check('다른 훅이 계속시킨 연쇄(이 훅은 아직 미차단) → 이 사유로 1회 차단', r.status === 2, r)
  r = stop({ session_id: 's3', stop_hook_active: 'true' })
  check('stop_hook_active 문자열 "true"(타입 위장) → 불리언 true 아님 → 정상 차단', r.status === 2, r)
  r = stop({ session_id: 's3', stop_hook_active: 1 })
  check('stop_hook_active 숫자 1(타입 위장) → 정상 차단', r.status === 2, r)
  r = stop({ session_id: '../../../../escape', stop_hook_active: false })
  const escaped = fs.existsSync(path.join(os.tmpdir(), '..', 'escape')) || fs.readdirSync(path.dirname(tmp)).some(f => f.includes('escape'))
  check('session_id 경로 순회 → 상태 파일이 TMPDIR 밖에 생기지 않음', r.status === 2 && !escaped, r)
  r = stop({ stop_hook_active: true })
  check('session_id 없음 + active=true → 추적 불가라 루프 방지 우선(exit 0 + systemMessage)', r.status === 0 && r.j && typeof r.j.systemMessage === 'string', r)
  // 이전 턴의 서명이 남아 다른 연쇄에서 오판하지 않도록: 위반 없는 새 연쇄(active=false)에서 상태 초기화
  r = stop({ session_id: 's4', stop_hook_active: false })
  const mk = path.join(repo, '.claude', '.codex-review-done')
  fs.writeFileSync(mk, ''); const fut = new Date(Date.now() + 60000); fs.utimesSync(mk, fut, fut)
  const rSkip = stop({ session_id: 's4', stop_hook_active: false })
  fs.rmSync(mk)
  r = stop({ session_id: 's4', stop_hook_active: true })
  check('이전 턴 서명 → 위반 없는 새 턴에서 초기화 → 다른 훅이 계속시킨 연쇄에서 1회 차단', rSkip.status === 0 && r.status === 2, r)
  fs.writeFileSync(path.join(tmp, 'garbage'), 'x')
  for (const f of fs.readdirSync(tmp)) { try { fs.writeFileSync(path.join(tmp, f), '{corrupt') } catch {} }
  r = stop({ session_id: 's1', stop_hook_active: true })
  check('상태 파일 손상 → 크래시 없이 차단 쪽으로(exit 2)', r.status === 2, r)
  for (const d of [repo, bin, tmp]) fs.rmSync(d, { recursive: true, force: true })
}

console.log('\n── git status 실패 — 변경 있음으로 간주(fail-closed), -uall 만 실패 시 일반 status 로 폴백 ──')
{
  const { execSync } = require('child_process')
  const realGit = execSync('command -v git', { encoding: 'utf8' }).trim()
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-gitfail-bin-'))
  fs.writeFileSync(path.join(bin, 'codex'), '#!/bin/sh\necho "Logged in using ChatGPT"\n')
  fs.writeFileSync(path.join(bin, 'git'), `#!/bin/sh\nfor a in "$@"; do case "$a" in status) [ "$FAIL_MODE" = all ] && exit 128;; -uall) [ "$FAIL_MODE" = uall ] && exit 128;; esac; done\nexec "${realGit}" "$@"\n`)
  fs.chmodSync(path.join(bin, 'codex'), 0o755); fs.chmodSync(path.join(bin, 'git'), 0o755)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-gitfail-tmp-'))
  const mkRepo = (setup) => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-gitfail-'))
    execSync('git init -q && git config user.email t@t && git config user.name t', { cwd: repo })
    fs.mkdirSync(path.join(repo, '.claude'), { recursive: true })
    fs.writeFileSync(path.join(repo, '.claude', 'settings.json'), JSON.stringify({ enabledPlugins: { 'codex@openai-codex': true } }))
    fs.writeFileSync(path.join(repo, '.gitignore'), '.claude/\n')
    fs.writeFileSync(path.join(repo, 'notes.md'), 'a\n')
    execSync('git add -A && git commit -qm init', { cwd: repo })
    setup(repo)
    return repo
  }
  const run = (desc, mode, setup, expect, needle) => {
    const repo = mkRepo(setup)
    const r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'Stop', session_id: 'gf-' + Math.random(), stop_hook_active: false }), encoding: 'utf8', timeout: 20000, cwd: repo,
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, TMPDIR: tmp, FAIL_MODE: mode } })
    const pass = r.status === expect && (!needle || r.stderr.includes(needle))
    console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 ${expect}, 실제 ${r.status}, stderr: ${r.stderr.slice(0, 100)})`}`)
    pass ? passed++ : failed++
    fs.rmSync(repo, { recursive: true, force: true })
  }
  run('status 전면 실패 + 비코드 변경만 → 확인 불가라 리뷰 요구(조용한 생략 금지)', 'all', (repo) => fs.writeFileSync(path.join(repo, 'notes.md'), 'b\n'), 2, '변경 목록 확인 실패')
  run('-uall 만 실패(대형 untracked) + tracked 비코드 변경 → 폴백으로 정확 판정 → 통과', 'uall', (repo) => fs.writeFileSync(path.join(repo, 'notes.md'), 'b\n'), 0)
  run('-uall 만 실패 + 새 디렉토리 안 untracked 코드 → 폴백의 "dir/" 항목을 코드 가능성으로 간주 → 리뷰 요구', 'uall', (repo) => { fs.mkdirSync(path.join(repo, 'src')); fs.writeFileSync(path.join(repo, 'src', 'a.js'), 'x\n') }, 2)
  run('-uall 만 실패 + tracked 코드 변경 → 리뷰 요구', 'uall', (repo) => fs.writeFileSync(path.join(repo, 'app.ts'), 'x\n'), 2)
  for (const d of [bin, tmp]) fs.rmSync(d, { recursive: true, force: true })
}

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
