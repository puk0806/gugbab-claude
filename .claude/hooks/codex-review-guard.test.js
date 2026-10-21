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
const IS_WIN = process.platform === 'win32'
const { nameAllowed, trySymlink } = require('./lib/testfs')
let skipped = 0
const skipNote = (desc, why) => { console.log(`  ⚠️ 건너뜀: ${desc} — ${why}`); skipped++ }
// 윈도우 파일명 불가: " < > | ? * 와 제어문자(개행 등)
const nameOk = (n) => nameAllowed(n) && !(IS_WIN && /[\x00-\x1f]/.test(n))
// 가짜 codex — 맥은 확장자 없는 sh, 윈도우는 PATHEXT 로 찾히는 codex.cmd 도 함께 만든다 (sh 스크립트는 윈도우에서 실행 불가)
function writeStub(dir, sh, cmd, name = 'codex') {
  fs.writeFileSync(path.join(dir, name), sh)
  fs.chmodSync(path.join(dir, name), 0o755)
  if (IS_WIN) fs.writeFileSync(path.join(dir, name + '.cmd'), '@echo off\r\n' + cmd.trim().split('\n').join('\r\n') + '\r\n')
}
const findExe = (n) => {
  for (const d of (process.env.PATH || '').split(path.delimiter)) {
    const f = path.join(d, n + (IS_WIN ? '.exe' : ''))
    try { if (d && fs.statSync(f).isFile()) return f } catch { /* 다음 */ }
  }
  return null
}
const CMD_LOGGED_IN ='echo Logged in using ChatGPT\nexit /b 0'
// 상태 파일 격리 — 맥 os.tmpdir() 는 TMPDIR, 윈도우는 TEMP/TMP 를 본다
const tmpEnv = (dir) => ({ TMPDIR: dir, TEMP: dir, TMP: dir })

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
  const env = (login) => ({ ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, STUB_LOGIN: login })
  writeStub(bin, '#!/bin/sh\nif [ "$STUB_LOGIN" = "yes" ]; then echo "Logged in using ChatGPT"; else echo "Not logged in"; exit 1; fi\n',
    'if "%STUB_LOGIN%"=="yes" (echo Logged in using ChatGPT& exit /b 0)\necho Not logged in\nexit /b 1')

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
    writeStub(stub2, '#!/bin/sh\necho "Not logged in"\nexit 0\n', 'echo Not logged in\nexit /b 0')
    const r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'Stop' }), encoding: 'utf8', timeout: 20000, cwd: repo,
      env: { ...process.env, PATH: `${stub2}${path.delimiter}${process.env.PATH}` } })
    const pass = r.status === 0 && !r.stderr.includes('리뷰 필요')
    console.log(`  ${pass ? '✅' : '❌'} "Not logged in" + exit 0 → 미로그인으로 판정(부분 매치 오판 금지) → ${pass ? 'PASS' : `FAIL (exit ${r.status})`}`)
    pass ? passed++ : failed++
    fs.rmSync(stub2, { recursive: true, force: true })
  }
  {
    // 2026-10-20 — 'which codex' 대신 PATH 를 직접 찾는다. 실행 파일이 아닌 것(폴더·실행 권한 없는 파일)은 설치로 치지 않는다
    const stub3 = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-bin-fake-'))
    const stub4 = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-bin-noexec-'))
    fs.mkdirSync(path.join(stub3, 'codex'))
    fs.writeFileSync(path.join(stub4, 'codex'), '#!/bin/sh\necho "Logged in using ChatGPT"\n') // 0644 — 실행 불가
    // 윈도우: PATHEXT 이름의 폴더(codex.cmd·codex.exe) + PATHEXT 에 없는 확장자 파일(codex.txt)·확장자 없는 sh — 모두 실행 불가
    if (IS_WIN) {
      fs.mkdirSync(path.join(stub3, 'codex.cmd')); fs.mkdirSync(path.join(stub3, 'codex.exe'))
      fs.writeFileSync(path.join(stub4, 'codex.txt'), 'echo Logged in using ChatGPT\r\n')
    }
    // 빈 항목(::)도 섞음, 진짜 codex 가 없는 PATH — git 은 있어야 레포 판정이 된다(윈도우는 git.exe 폴더)
    const tail = IS_WIN ? [path.dirname(findExe('git')), path.dirname(process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe')] : ['/usr/bin', '/bin']
    const r = spawnSync(process.execPath, [HOOK], { input: JSON.stringify({ hook_event_name: 'Stop' }), encoding: 'utf8', timeout: 20000, cwd: repo,
      env: { ...process.env, PATH: [stub3, stub4, '', ...tail].join(path.delimiter) } })
    const pass = r.status === 0 && r.stderr.includes('건너뜀: codex CLI 없음') // 로그인 실패로 우연히 통과한 것과 구분
    console.log(`  ${pass ? '✅' : '❌'} PATH 에 codex 폴더·실행 불가 파일만 → 미설치로 조용히 통과 → ${pass ? 'PASS' : `FAIL (exit ${r.status}, ${r.stderr.slice(0, 80)})`}`)
    pass ? passed++ : failed++
    fs.rmSync(stub3, { recursive: true, force: true }); fs.rmSync(stub4, { recursive: true, force: true })
  }
  {
    // 래퍼(gugbab-claude) 실행: 프로젝트에 .claude/settings.json 이 없고 플러그인은 설정 폴더(CLAUDE_CONFIG_DIR)에서 켜진다 (2026-10-16)
    const bare = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-bare-'))
    execSync('git init -q', { cwd: bare })
    fs.writeFileSync(path.join(bare, 'app.js'), 'module.exports = 2\n')
    const cfgOn = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-cfg-'))
    fs.writeFileSync(path.join(cfgOn, 'settings.json'), JSON.stringify({ enabledPlugins: { 'codex@openai-codex': true } }))
    const cfgOff = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-cfg-'))
    fs.writeFileSync(path.join(cfgOff, 'settings.json'), JSON.stringify({ enabledPlugins: { 'codex@openai-codex': false } }))
    const run = (cfg) => spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'Stop' }), encoding: 'utf8', timeout: 20000, cwd: bare,
      env: { ...env('yes'), CLAUDE_CONFIG_DIR: cfg } })
    const on = run(cfgOn)
    const p1 = on.status === 2 && on.stderr.includes('적대적 리뷰 필요')
    console.log(`  ${p1 ? '✅' : '❌'} 설정 폴더에서 플러그인 켜짐 → 리뷰 요구 → ${p1 ? 'PASS' : `FAIL (exit ${on.status})`}`)
    p1 ? passed++ : failed++
    const off = run(cfgOff)
    const p2 = off.status === 0 && !off.stderr.includes('리뷰 필요')
    console.log(`  ${p2 ? '✅' : '❌'} 설정 폴더에서 플러그인 꺼짐 → 통과 → ${p2 ? 'PASS' : `FAIL (exit ${off.status})`}`)
    p2 ? passed++ : failed++
    const bad = run(path.join(cfgOn, 'no-such-dir'))
    const p3 = bad.status === 0
    console.log(`  ${p3 ? '✅' : '❌'} 설정 폴더 경로가 없음 → 플러그인 꺼짐으로 보고 통과 → ${p3 ? 'PASS' : `FAIL (exit ${bad.status})`}`)
    p3 ? passed++ : failed++
    for (const d of [bare, cfgOn, cfgOff]) fs.rmSync(d, { recursive: true, force: true })
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
  writeStub(bin, '#!/bin/sh\necho "Logged in using ChatGPT"\n', CMD_LOGGED_IN)
  const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}` }
  const git = (repo, args) => spawnSync('git', args, { cwd: repo, encoding: 'utf8' })

  // setup(repo): 커밋 전 상태 준비 / change(repo): 커밋 이후 변경 / marker: 'old'|'new'|undefined
  const scenario = (desc, { committed = [], change, marker, expect, names = [] }) => {
    if (!names.every(nameOk)) return skipNote(desc, '윈도우에서 만들 수 없는 파일 이름')
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
  scenario('따옴표 포함 파일명 a"b.py → 리뷰 요구', { change: write('a"b.py'), expect: 2, names: ['a"b.py'] })
  scenario('개행 포함 파일명 "a\\nb.go" → 리뷰 요구', { change: write('a\nb.go'), expect: 2, names: ['a\nb.go'] })
  scenario('rename 문서→공백 코드 "notes.txt -> new name.js" (staged) → 리뷰 요구', {
    committed: ['notes.txt'], change: (repo, g) => { g(repo, ['mv', 'notes.txt', 'new name.js']) }, expect: 2,
  })
  scenario('파일명에 " -> " 리터럴 포함 "x -> y.rs" → 리뷰 요구', { change: write('x -> y.rs'), expect: 2, names: ['x -> y.rs'] })
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
  writeStub(bin, '#!/bin/sh\necho "Logged in using ChatGPT"\n', CMD_LOGGED_IN)
  const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, ...tmpEnv(tmp) }
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
  // 윈도우 cmd 에는 `command -v` 가 없다 → PATH 에서 git.exe 를 직접 찾는다
  const realGit = IS_WIN ? findExe('git') : execSync('command -v git', { encoding: 'utf8' }).trim()
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-gitfail-bin-'))
  writeStub(bin, '#!/bin/sh\necho "Logged in using ChatGPT"\n', CMD_LOGGED_IN)
  writeStub(bin, `#!/bin/sh\nfor a in "$@"; do case "$a" in status) [ "$FAIL_MODE" = all ] && exit 128;; -uall) [ "$FAIL_MODE" = uall ] && exit 128;; esac; done\nexec "${realGit}" "$@"\n`,
    `setlocal\nset S=\nset U=\nfor %%a in (%*) do (\n  if "%%~a"=="status" set S=1\n  if "%%~a"=="-uall" set U=1\n)\nif defined S if "%FAIL_MODE%"=="all" exit /b 128\nif defined U if "%FAIL_MODE%"=="uall" exit /b 128\n"${realGit}" %*\nexit /b %ERRORLEVEL%`, 'git')
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
      env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, ...tmpEnv(tmp), FAIL_MODE: mode } })
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

console.log('\n── codex 사용 불가 마커 (.claude/.codex-unavailable) — 계정/모델 400 등 환경 오류 ──')
{
  const { execSync } = require('child_process')
  const crypto = require('crypto')

  // codex 스텁: login status / --version 을 인자별로 구분 응답
  const makeCodexBin = (version) => {
    const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-unavail-bin-'))
    writeStub(bin,
      '#!/bin/sh\n' +
      'if [ "$1" = "login" ] && [ "$2" = "status" ]; then echo "Logged in using ChatGPT"; exit 0; fi\n' +
      `if [ "$1" = "--version" ]; then echo "${version}"; exit 0; fi\n`,
      `if "%1"=="login" if "%2"=="status" (echo Logged in using ChatGPT& exit /b 0)\nif "%1"=="--version" (echo ${version}& exit /b 0)`)
    return bin
  }
  const VERSION = 'codex-cli 0.146.0'
  const bin = makeCodexBin(VERSION)

  const mkCodexHome = (configBody) => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-codexhome-'))
    fs.writeFileSync(path.join(home, 'config.toml'), configBody)
    return home
  }
  const configHashOf = (body) => crypto.createHash('sha256').update(body).digest('hex')
  const CONFIG_A = 'model = "gpt-5.4"\n'
  const CONFIG_B = 'model = "gpt-5.4-turbo"\n'

  const mkRepo = () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-unavail-repo-'))
    execSync('git init -q', { cwd: repo })
    fs.mkdirSync(path.join(repo, '.claude'), { recursive: true })
    fs.writeFileSync(path.join(repo, '.claude', 'settings.json'), JSON.stringify({ enabledPlugins: { 'codex@openai-codex': true } }))
    fs.writeFileSync(path.join(repo, 'app.js'), 'x\n')
    return repo
  }
  const writeMarker = (repo, { configHash, codexVersion } = {}) => {
    fs.writeFileSync(path.join(repo, '.claude', '.codex-unavailable'), JSON.stringify({
      detectedAt: new Date().toISOString(),
      configHash: configHash === undefined ? configHashOf(CONFIG_A) : configHash,
      codexVersion: codexVersion === undefined ? VERSION : codexVersion,
    }))
  }
  const runStop = (repo, home, extra, tmp) => {
    const r = spawnSync('node', [HOOK], {
      input: JSON.stringify({ hook_event_name: 'Stop', ...extra }), encoding: 'utf8', timeout: 20000, cwd: repo,
      env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, CODEX_HOME: home, ...tmpEnv(tmp || fs.mkdtempSync(path.join(os.tmpdir(), 'crg-unavail-tmp-'))) },
    })
    let j = null; try { j = r.stdout.trim() ? JSON.parse(r.stdout) : null } catch { j = 'INVALID' }
    return { ...r, j }
  }
  const check = (desc, cond, r) => {
    console.log(`  ${cond ? '✅' : '❌'} ${desc} → ${cond ? 'PASS' : `FAIL (exit ${r.status}, stdout: ${(r.stdout || '').slice(0, 120)}, stderr: ${r.stderr.slice(0, 100)})`}`)
    cond ? passed++ : failed++
  }

  // 1) 마커 + config·버전 일치 → 세션 첫 Stop: exit 0 + systemMessage 안내(차단 아님)
  {
    const repo = mkRepo(); const home = mkCodexHome(CONFIG_A)
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-unavail-tmp-')) // 세션 상태 파일을 두 호출이 공유해야 dedup 검증 가능
    writeMarker(repo)
    const r = runStop(repo, home, { session_id: 'u1', stop_hook_active: false }, tmp)
    check('마커 유효(config·버전 일치) → exit 0 + systemMessage 안내(차단 없음)',
      r.status === 0 && r.j && typeof r.j.systemMessage === 'string' && r.j.systemMessage.includes('codex-review-guard') && !('decision' in r.j), r)
    // 2) 같은 세션 재호출 → 조용히 통과(중복 안내 금지)
    const r2 = runStop(repo, home, { session_id: 'u1', stop_hook_active: false }, tmp)
    check('같은 세션 재호출 → 조용히 통과(exit 0, 안내 반복 없음)', r2.status === 0 && (!r2.j || typeof r2.j.systemMessage !== 'string'), r2)
    fs.rmSync(repo, { recursive: true, force: true }); fs.rmSync(home, { recursive: true, force: true }); fs.rmSync(tmp, { recursive: true, force: true })
  }

  // 3) config 변경(모델 값 변경) → 마커 무효화 → 다시 차단
  {
    const repo = mkRepo(); const home = mkCodexHome(CONFIG_B) // 마커는 CONFIG_A 해시로 기록됨
    writeMarker(repo)
    const r = runStop(repo, home, { session_id: 'u2', stop_hook_active: false })
    check('config.toml 변경 → 마커 무효 → 다시 차단(exit 2)', r.status === 2 && r.stderr.includes('적대적 리뷰 필요'), r)
    fs.rmSync(repo, { recursive: true, force: true }); fs.rmSync(home, { recursive: true, force: true })
  }

  // 4) codex 버전 변경 → 마커 무효화 → 다시 차단
  {
    const repo = mkRepo(); const home = mkCodexHome(CONFIG_A)
    writeMarker(repo, { codexVersion: 'codex-cli 0.999.0' })
    const r = runStop(repo, home, { session_id: 'u3', stop_hook_active: false })
    check('codex 버전 변경 → 마커 무효 → 다시 차단(exit 2)', r.status === 2 && r.stderr.includes('적대적 리뷰 필요'), r)
    fs.rmSync(repo, { recursive: true, force: true }); fs.rmSync(home, { recursive: true, force: true })
  }

  // 5) 마커 형식 깨짐(JSON 파싱 실패) → 무시하고 기존 차단 동작
  {
    const repo = mkRepo(); const home = mkCodexHome(CONFIG_A)
    fs.writeFileSync(path.join(repo, '.claude', '.codex-unavailable'), '{not valid json')
    const r = runStop(repo, home, { session_id: 'u4', stop_hook_active: false })
    check('마커 JSON 파싱 실패 → 무시 → 기존 차단(exit 2)', r.status === 2 && r.stderr.includes('적대적 리뷰 필요'), r)
    fs.rmSync(repo, { recursive: true, force: true }); fs.rmSync(home, { recursive: true, force: true })
  }

  // 6) 마커 필드 누락(configHash 없음) → 무시하고 기존 차단 동작
  {
    const repo = mkRepo(); const home = mkCodexHome(CONFIG_A)
    fs.writeFileSync(path.join(repo, '.claude', '.codex-unavailable'), JSON.stringify({ detectedAt: 'x' }))
    const r = runStop(repo, home, { session_id: 'u5', stop_hook_active: false })
    check('마커 필드 누락 → 무시 → 기존 차단(exit 2)', r.status === 2 && r.stderr.includes('적대적 리뷰 필요'), r)
    fs.rmSync(repo, { recursive: true, force: true }); fs.rmSync(home, { recursive: true, force: true })
  }

  // 7) 마커가 심볼릭 링크로 위장(다른 경로의 유효한 마커를 가리킴) → 무시하고 기존 차단 동작
  {
    const repo = mkRepo(); const home = mkCodexHome(CONFIG_A)
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-unavail-outside-'))
    const realMarker = path.join(outside, 'real-marker.json')
    fs.writeFileSync(realMarker, JSON.stringify({ configHash: configHashOf(CONFIG_A), codexVersion: VERSION }))
    if (trySymlink(realMarker, path.join(repo, '.claude', '.codex-unavailable'), 'file') === null) {
      skipNote('마커 심볼릭 링크 위장', '윈도우 개발자 모드 꺼짐 — 파일 심볼릭 링크 생성 불가(EPERM), 공격자도 못 만듦')
    } else {
      const r = runStop(repo, home, { session_id: 'u6', stop_hook_active: false })
      check('마커 심볼릭 링크 위장 → 무시(lstat.isFile()===false) → 기존 차단(exit 2)', r.status === 2 && r.stderr.includes('적대적 리뷰 필요'), r)
    }
    fs.rmSync(repo, { recursive: true, force: true }); fs.rmSync(home, { recursive: true, force: true }); fs.rmSync(outside, { recursive: true, force: true })
  }

  // 8) 마커 없음(기본 상태) → 기존 차단 동작 그대로
  {
    const repo = mkRepo(); const home = mkCodexHome(CONFIG_A)
    const r = runStop(repo, home, { session_id: 'u7', stop_hook_active: false })
    check('마커 없음 → 기존 차단 동작(exit 2)', r.status === 2 && r.stderr.includes('적대적 리뷰 필요'), r)
    fs.rmSync(repo, { recursive: true, force: true }); fs.rmSync(home, { recursive: true, force: true })
  }

  // 9) 미로그인 + 마커 유효 → 미로그인 경로가 우선(조용히 통과, 마커 관련 안내 없음)
  {
    const repo = mkRepo(); const home = mkCodexHome(CONFIG_A)
    writeMarker(repo)
    const noLoginBin = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-unavail-nologin-'))
    writeStub(noLoginBin, '#!/bin/sh\necho "Not logged in"\nexit 1\n', 'echo Not logged in\nexit /b 1')
    const r = spawnSync('node', [HOOK], {
      input: JSON.stringify({ hook_event_name: 'Stop', session_id: 'u8', stop_hook_active: false }), encoding: 'utf8', timeout: 20000, cwd: repo,
      env: { ...process.env, PATH: `${noLoginBin}${path.delimiter}${process.env.PATH}`, CODEX_HOME: home },
    })
    const pass = r.status === 0 && (r.stdout || '').trim() === '' && !r.stderr.includes('사용 불가')
    console.log(`  ${pass ? '✅' : '❌'} 미로그인 + 마커 유효 → 미로그인 경로 우선(조용히 통과, 마커 안내 없음) → ${pass ? 'PASS' : `FAIL (exit ${r.status}, stdout: ${(r.stdout || '').slice(0, 80)})`}`)
    pass ? passed++ : failed++
    fs.rmSync(repo, { recursive: true, force: true }); fs.rmSync(home, { recursive: true, force: true }); fs.rmSync(noLoginBin, { recursive: true, force: true })
  }

  // 10) codex --version 자체가 실패(구버전 등) → 판단 불가 → 마커 무효 취급 → 기존 차단
  {
    const repo = mkRepo(); const home = mkCodexHome(CONFIG_A)
    writeMarker(repo)
    const noVersionBin = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-unavail-noversion-'))
    writeStub(noVersionBin,
      '#!/bin/sh\nif [ "$1" = "login" ] && [ "$2" = "status" ]; then echo "Logged in using ChatGPT"; exit 0; fi\nexit 1\n',
      'if "%1"=="login" if "%2"=="status" (echo Logged in using ChatGPT& exit /b 0)\nexit /b 1')
    const r = spawnSync('node', [HOOK], {
      input: JSON.stringify({ hook_event_name: 'Stop', session_id: 'u9', stop_hook_active: false }), encoding: 'utf8', timeout: 20000, cwd: repo,
      env: { ...process.env, PATH: `${noVersionBin}${path.delimiter}${process.env.PATH}`, CODEX_HOME: home },
    })
    const pass = r.status === 2 && r.stderr.includes('적대적 리뷰 필요')
    console.log(`  ${pass ? '✅' : '❌'} codex --version 실패 → 판단 불가 → 마커 무효 → 기존 차단(exit 2) → ${pass ? 'PASS' : `FAIL (exit ${r.status})`}`)
    pass ? passed++ : failed++
    fs.rmSync(repo, { recursive: true, force: true }); fs.rmSync(home, { recursive: true, force: true }); fs.rmSync(noVersionBin, { recursive: true, force: true })
  }

  fs.rmSync(bin, { recursive: true, force: true })
}

if (IS_WIN) {
  console.log('\n── 윈도우 전용 — codex.cmd 절대 경로 실행·레포 안 위장 codex·안내 경로 형식 ──')
  const { execSync } = require('child_process')
  const check = (desc, cond, r) => {
    console.log(`  ${cond ? '✅' : '❌'} ${desc} → ${cond ? 'PASS' : `FAIL (exit ${r.status}, stdout: ${(r.stdout || '').slice(0, 100)}, stderr: ${(r.stderr || '').slice(0, 200)})`}`)
    cond ? passed++ : failed++
  }
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-win-'))
  execSync('git init -q', { cwd: repo })
  fs.mkdirSync(path.join(repo, '.claude'), { recursive: true })
  fs.writeFileSync(path.join(repo, '.claude', 'settings.json'), JSON.stringify({ enabledPlugins: { 'codex@openai-codex': true } }))
  fs.writeFileSync(path.join(repo, 'app.js'), 'x\n')
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-win-tmp-'))
  // 정상·경계: 공백·한글 폴더의 codex.cmd → 셸 경유 절대 경로 실행으로 로그인 판정 → 리뷰 요구
  const spaced = path.join(os.tmpdir(), `crg 공백 한글 ${process.pid}`); fs.mkdirSync(spaced, { recursive: true })
  writeStub(spaced, '#!/bin/sh\n', CMD_LOGGED_IN)
  let r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'Stop', session_id: 'w1' }), encoding: 'utf8', timeout: 20000, cwd: repo,
    env: { ...process.env, PATH: `${spaced}${path.delimiter}${process.env.PATH}`, ...tmpEnv(tmp) } })
  check('[윈도우] 공백·한글 폴더의 codex.cmd → 로그인 판정 후 리뷰 요구(exit 2)', r.status === 2 && r.stderr.includes('적대적 리뷰 필요'), r)
  // 안내 문구: Git Bash 에서 그대로 쓸 수 있는 슬래시·따옴표 경로 (백슬래시면 touch 가 엉뚱한 파일을 만든다)
  const mk = path.join(repo, '.claude', '.codex-review-done').replace(/\\/g, '/')
  check('[윈도우] 마커 touch 안내가 따옴표 + 슬래시 경로', r.stderr.includes(`touch "${mk}"`) && !/touch [A-Za-z]:\\/.test(r.stderr), r)
  check('[윈도우] 라운드 출력 경로가 os.tmpdir() (Git Bash /tmp 와 Read 도구 C:\\tmp 불일치 방지)', r.stderr.includes(`tee "${tmp.replace(/\\/g, '/')}/codex-r{N}.txt"`), r) // 훅의 os.tmpdir() = 위에서 넘긴 TEMP
  // 악성: 레포(현재 폴더)에 "로그인됨" codex.cmd 를 심고, PATH 의 진짜 codex 는 미로그인.
  //   NoDefaultCurrentDirectoryInExePath 를 지운 환경에서 cmd 가 현재 폴더 codex.cmd 를 먼저 실행하면 우회된다 → 절대 경로 실행으로 방어
  const realBin = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-win-real-'))
  writeStub(realBin, '#!/bin/sh\n', 'echo Not logged in\nexit /b 1')
  fs.writeFileSync(path.join(repo, 'codex.cmd'), '@echo off\r\necho Logged in using ChatGPT\r\n')
  const env2 = { ...process.env, PATH: `${realBin}${path.delimiter}${process.env.PATH}`, ...tmpEnv(tmp) }
  delete env2.NoDefaultCurrentDirectoryInExePath
  r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'Stop', session_id: 'w2' }), encoding: 'utf8', timeout: 20000, cwd: repo, env: env2 })
  check('[윈도우] 레포 안 위장 codex.cmd(로그인됨)는 무시, PATH 의 codex(미로그인) 기준 → 조용히 통과', r.status === 0 && !r.stderr.includes('리뷰 필요'), r)
  // 악성: PATH 에 codex 없음 + 레포 안 codex.cmd 만 → 미설치
  const env3 = { ...env2, PATH: [path.dirname(findExe('git')), path.dirname(process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe')].join(path.delimiter) }
  r = spawnSync(process.execPath, [HOOK], { input: JSON.stringify({ hook_event_name: 'Stop', session_id: 'w3' }), encoding: 'utf8', timeout: 20000, cwd: repo, env: env3 })
  check('[윈도우] PATH 에 없고 레포 안 codex.cmd 만 → "codex CLI 없음" 으로 건너뜀', r.status === 0 && r.stderr.includes('codex CLI 없음'), r)
  for (const d of [repo, tmp, spaced, realBin]) fs.rmSync(d, { recursive: true, force: true })
}

console.log(`\n결과: ${passed}/${passed + failed} 통과${skipped ? ` (건너뜀 ${skipped})` : ''}`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
