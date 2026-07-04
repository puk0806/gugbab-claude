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
  const pass = r.status === expectedExit
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status})`}`)
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

console.log('\n── git 레포 밖에서 ──')
const noRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-norepo-'))
test('레포 아님 → exit 0', 'git push origin main', 0, noRepo)

fs.rmSync(repo, { recursive: true, force: true })
fs.rmSync(noRepo, { recursive: true, force: true })

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
