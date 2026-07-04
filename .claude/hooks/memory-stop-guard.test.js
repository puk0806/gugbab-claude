#!/usr/bin/env node
/**
 * memory-stop-guard.test.js — 세션 종료 시 memory 자동 커밋 테스트
 * 실행: node .claude/hooks/memory-stop-guard.test.js
 * 임시 git 레포에서만 동작을 검증한다 (실제 프로젝트 레포는 건드리지 않음).
 */

const { spawnSync, execSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'memory-stop-guard.js')

let passed = 0, failed = 0

function assert(desc, actual, expected) {
  const pass = actual === expected
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${expected}, 실제: ${actual})`}`)
  pass ? passed++ : failed++
}

function runHook(env) {
  return spawnSync('node', [HOOK], {
    input: JSON.stringify({ hook_event_name: 'Stop' }),
    encoding: 'utf8', timeout: 10000, env,
  })
}

console.log('🔍 memory-stop-guard 테스트 시작')

// CLAUDE_PROJECT_DIR 미설정 → 즉시 통과
const envWithout = { ...process.env }
delete envWithout.CLAUDE_PROJECT_DIR
assert('CLAUDE_PROJECT_DIR 미설정 → exit 0', runHook(envWithout).status, 0)

// 임시 git 레포 — memory 변경 없음 → 커밋 없음
const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'msg-test-'))
const git = (cmd) => execSync(`git -c user.email=t@t -c user.name=t ${cmd}`, { cwd: repo, stdio: 'pipe', encoding: 'utf8' })
git('init -b main')
git('commit --allow-empty -m init')

const envRepo = { ...process.env, CLAUDE_PROJECT_DIR: repo }
assert('memory 변경 없음 → exit 0', runHook(envRepo).status, 0)
assert('커밋 1개 유지 (auto-sync 커밋 없음)',
  git('rev-list --count HEAD').trim(), '1')

// memory/ 파일 추가 → 자동 커밋 발생
fs.mkdirSync(path.join(repo, 'memory'), { recursive: true })
fs.writeFileSync(path.join(repo, 'memory', 'note.md'), '# note')
assert('memory 변경 있음 → exit 0', runHook(envRepo).status, 0)
assert('auto-sync 커밋 생성됨',
  git('log -1 --pretty=%s').trim(), '[memory] auto-sync on stop')
assert('워킹트리 클린', git('status --porcelain').trim(), '')

fs.rmSync(repo, { recursive: true, force: true })

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
