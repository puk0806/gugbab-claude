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
  runBlock('코드 변경 + 미로그인 → 로그인 요구 사유는 stderr', 'no', '로그인 필요')

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

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
