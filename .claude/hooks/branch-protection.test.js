#!/usr/bin/env node
/**
 * branch-protection.test.js — main 직접 push·피처 브랜치 분기 차단 테스트
 * 실행: node .claude/hooks/branch-protection.test.js
 * 임시 git 레포를 만들어 브랜치 상태별로 검증한다.
 */

const { spawnSync, execSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'branch-protection.js')

let passed = 0, failed = 0

function test(desc, command, expectedExit, cwd) {
  const input = JSON.stringify({
    hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command },
  })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, cwd })
  // 메시지 채널 단언 — PreToolUse exit 2 는 stderr 가 차단 사유로 Claude 에게 전달된다
  const TAG = '[branch-protection]', out = r.stdout || '', err = r.stderr || ''
  const chanErr = expectedExit === 2
    ? (!err.includes(TAG) ? 'stderr 에 차단 사유 없음' : out.includes(TAG) ? 'stdout 에 차단 사유가 섞임' : '')
    : ((out + err).includes(TAG) ? '통과인데 차단 사유 출력' : '')
  const pass = r.status === expectedExit && !chanErr
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status}${chanErr ? ', ' + chanErr : ''})`}`)
  pass ? passed++ : failed++
}

console.log('🔍 branch-protection 테스트 시작')

// 임시 git 레포 준비
const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-test-'))
const git = (cmd) => execSync(`git -c user.email=t@t -c user.name=t ${cmd}`, { cwd: repo, stdio: 'pipe' })
git('init -b main')
git('commit --allow-empty -m init')

console.log('\n── main 브랜치에서 ──')
test('git push → exit 2 (main 직접 push 금지)', 'git push origin main', 2, repo)
test('git push (타겟 생략) → exit 2', 'git push', 2, repo)
test('git status → exit 0', 'git status', 0, repo)
test('git checkout -b feature → exit 0 (main에서 분기 허용)', 'git checkout -b feature/from-main-dry', 0, repo)
test('git 없는 명령 → exit 0', 'ls -al', 0, repo)

console.log('\n── 피처 브랜치에서 ──')
git('checkout -b feature/test')
test('git push origin feature → exit 0', 'git push origin feature/test', 0, repo)
test('git push origin main → exit 2 (명시적 main 타겟)', 'git push origin main', 2, repo)
test('git push origin HEAD:main → exit 2 (refspec)', 'git push origin HEAD:main', 2, repo)
test('git checkout -b another → exit 2 (피처에서 분기 금지)', 'git checkout -b feature/another', 2, repo)
test('git switch -c another → exit 2', 'git switch -c feature/another', 2, repo)
test('복합 명령 내 push main → exit 2', 'git add . && git push origin main', 2, repo)

// ── 2026-09-26 사각지대 감사(C2) — main/master 대상 push 우회 벡터 ──
const P = 'git ' + 'push'
console.log('\n── 피처 브랜치 — main 대상 push 우회 벡터 (전부 exit 2) ──')
test('push -u origin main', `${P} -u origin main`, 2, repo)
test('push --set-upstream origin main', `${P} --set-upstream origin main`, 2, repo)
test('git -C . push origin main', 'git -C . push origin main', 2, repo)
test('git --no-pager push origin main', 'git --no-pager push origin main', 2, repo)
test('push origin +main (강제 refspec)', `${P} origin +main`, 2, repo)
test('push origin refs/heads/main', `${P} origin refs/heads/main`, 2, repo)
test('push origin HEAD:refs/heads/main', `${P} origin HEAD:refs/heads/main`, 2, repo)
test('push --force origin main', `${P} --force origin main`, 2, repo)
test('push origin main --force (뒤쪽 옵션)', `${P} origin main --force`, 2, repo)
test('push -o ci.skip origin main (값 받는 옵션)', `${P} -o ci.skip origin main`, 2, repo)
test('push origin master', `${P} origin master`, 2, repo)
test('push origin feature/x main (다중 refspec 중 main)', `${P} origin feature/x main`, 2, repo)
test('push --all origin (main 포함 전체)', `${P} --all origin`, 2, repo)
test('push --mirror origin', `${P} --mirror origin`, 2, repo)
test('push origin :main (main 삭제)', `${P} origin :main`, 2, repo)
test('push origin --delete main', `${P} origin --delete main`, 2, repo)
test('true | git push origin main (파이프 선행)', `true | ${P} origin main`, 2, repo)
test('echo x; git push origin main (;)', `echo x; ${P} origin main`, 2, repo)
test('ls\\ngit push origin main (개행)', `ls\n${P} origin main`, 2, repo)
test('(git push origin main) 서브셸', `(${P} origin main)`, 2, repo)
test('echo $(git push origin main) 치환', `echo $(${P} origin main)`, 2, repo)
test('bash -c "git push origin main"', `bash -c "${P} origin main"`, 2, repo)
test('env X=1 git push origin main', `env X=1 ${P} origin main`, 2, repo)
test('command git push origin main', `command ${P} origin main`, 2, repo)
test('gi"t" push origin main (따옴표 분할)', 'gi"t" push origin main', 2, repo)
test('git<TAB>push origin main', 'git\tpush origin main', 2, repo)
test('GIT PUSH origin MAIN (대소문자)', 'GIT PUSH origin MAIN', 2, repo)
test('push origin "$(echo main)" (동적 refspec)', `${P} origin "$(echo main)"`, 2, repo)
test('git -C . checkout -b x (피처→피처 분기, 전치 옵션)', 'git -C . checkout -b feature/x2', 2, repo)
test('true | git switch -c x (파이프 선행 분기)', 'true | git switch -c feature/x3', 2, repo)

console.log('\n── 피처 브랜치 — 오탐 금지 (전부 exit 0) ──')
test('push origin feature/main-fix (브랜치명에 main 포함)', `${P} origin feature/main-fix`, 0, repo)
test('push origin main-backup', `${P} origin main-backup`, 0, repo)
test('push origin mainline', `${P} origin mainline`, 0, repo)
test('push -u origin feature/test', `${P} -u origin feature/test`, 0, repo)
test('push origin --delete feature/old', `${P} origin --delete feature/old`, 0, repo)
test('push origin main:feature/x (로컬 main → 원격 feature)', `${P} origin main:feature/x`, 0, repo)
test('push (인자 없음, 피처 브랜치)', P, 0, repo)
test('echo "git push origin main" (인용 텍스트)', `echo "${P} origin main"`, 0, repo)
test('git log --grep main', 'git log --grep main', 0, repo)
test('빈 명령', '', 0, repo)
{
  const r = spawnSync('node', [HOOK], { input: '{broken', encoding: 'utf8', timeout: 5000, cwd: repo })
  const ok = r.status === 0 && !(r.stdout + r.stderr).includes('[branch-protection]')
  console.log(`  ${ok ? '✅' : '❌'} 깨진 JSON stdin → exit 0 → ${ok ? 'PASS' : `FAIL (exit ${r.status})`}`)
  ok ? passed++ : failed++
  const long = 'echo a && '.repeat(20000) + `${P} origin main`
  const r2 = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: long } }), encoding: 'utf8', timeout: 10000, cwd: repo })
  const ok2 = r2.status === 2
  console.log(`  ${ok2 ? '✅' : '❌'} 200KB 명령 끝의 push origin main → exit 2 → ${ok2 ? 'PASS' : `FAIL (exit ${r2.status})`}`)
  ok2 ? passed++ : failed++
}

console.log('\n── main 브랜치 — 인자 없는 push 기존 동작 유지 ──')
git('checkout main')
test('git push (main, 인자 없음) → exit 2', P, 2, repo)
test('git push -u origin (main, 암시적) → exit 2', `${P} -u origin`, 2, repo)
test('git -C . push (main) → exit 2', 'git -C . push', 2, repo)
test('true | git push (main) → exit 2', `true | ${P}`, 2, repo)
test('git push origin HEAD (main) → exit 2', `${P} origin HEAD`, 2, repo)
test('git push origin --delete feature/old (main에서 삭제) → exit 0', `${P} origin --delete feature/old`, 0, repo)

console.log('\n── master 브랜치 ──')
git('checkout -b master')
test('git push (master, 인자 없음) → exit 2', P, 2, repo)
test('git checkout -b feature/y (master에서 분기 허용) → exit 0', 'git checkout -b feature/y-dry', 0, repo)

console.log('\n── 폴백: bash-guard.js 없이 단독 설치된 경우 (정규식 판정) ──')
{
  const solo = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-solo-'))
  const soloHook = path.join(solo, 'branch-protection.js')
  fs.copyFileSync(HOOK, soloHook)
  git('checkout feature/test')
  const run = (desc, command, expectedExit) => {
    const r = spawnSync('node', [soloHook], { input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } }), encoding: 'utf8', timeout: 5000, cwd: repo })
    const ok = r.status === expectedExit
    console.log(`  ${ok ? '✅' : '❌'} [폴백] ${desc} → ${ok ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status})`}`)
    ok ? passed++ : failed++
  }
  run('push origin main → exit 2', `${P} origin main`, 2)
  run('push -u origin main → exit 2', `${P} -u origin main`, 2)
  run('true | git push origin HEAD:main → exit 2', `true | ${P} origin HEAD:main`, 2)
  run('push origin feature/main-fix → exit 0', `${P} origin feature/main-fix`, 0)
  run('echo 없음·git 없음 → exit 0', 'ls -al', 0)
  fs.rmSync(solo, { recursive: true, force: true })
}

console.log('\n── git 레포 밖에서 ──')
const noRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-norepo-'))
test('레포 아님 → exit 0', 'git push origin main', 0, noRepo)

fs.rmSync(repo, { recursive: true, force: true })
fs.rmSync(noRepo, { recursive: true, force: true })

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
