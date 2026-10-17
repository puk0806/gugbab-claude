#!/usr/bin/env node
// statusline.sh — 브랜치 · 미커밋 수 · PENDING_TEST 스킬 수
// 정상 / 악성·우회(본문 예시 글자로 숫자 부풀리기) / 경계(레포 아님·빈 값) 3계층
const { spawnSync, execSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const SH = path.join(__dirname, 'statusline.sh')

let passed = 0, failed = 0
const check = (desc, actual, expected) => {
  const pass = actual === expected
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${JSON.stringify(expected)}, 실제: ${JSON.stringify(actual)})`}`)
  pass ? passed++ : failed++
}
const run = (cwd) => spawnSync('bash', [SH], { cwd, encoding: 'utf8', input: '{}' }).stdout.trim()

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'sl-'))
execSync('git init -q -b main && git -c user.email=t@t -c user.name=t commit -q --allow-empty -m init', { cwd: repo })
const w = (p, s) => { fs.mkdirSync(path.dirname(path.join(repo, p)), { recursive: true }); fs.writeFileSync(path.join(repo, p), s) }

console.log('── 정상 ──')
check('깨끗한 레포 → 브랜치만', run(repo), 'main')
w('docs/skills/frontend/a/verification.md', '---\nskill: a\nstatus: PENDING_TEST\n---\n본문\n')
w('docs/skills/frontend/b/verification.md', '---\nskill: b\nstatus: APPROVED\n---\n본문\n')
w('docs/skills/backend/c/verification.md', '---\nskill: c\nstatus: PENDING_TEST\n---\n')
execSync('git add -A && git -c user.email=t@t -c user.name=t commit -q -m s', { cwd: repo })
check('verification.md frontmatter 기준 PENDING_TEST 2개', run(repo), 'main | 2 pending')
w('x.txt', 'x')
check('미커밋 1개 + pending 2 → 구분자 " | "', run(repo), 'main | 1 uncommitted | 2 pending')

console.log('── 악성·우회 ──')
w('.claude/skills/demo/SKILL.md', '예시: `status: PENDING_TEST` 를 frontmatter 에 쓴다\nstatus: PENDING_TEST\n')
w('docs/skills/frontend/d/verification.md', '---\nskill: d\nstatus: APPROVED\n---\n예전 기록: status: PENDING_TEST 였음\n')
execSync('git add -A && git -c user.email=t@t -c user.name=t commit -q -m e', { cwd: repo })
check('스킬 본문·frontmatter 밖 예시 글자는 세지 않음', run(repo), 'main | 2 pending')

console.log('── 이상·경계 ──')
const notRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'sl-no-'))
check('git 레포 아님 → 출력 없음', run(notRepo), '')
w('docs/skills/frontend/e/verification.md', '')
w('docs/skills/frontend/f/verification.md', '---\nstatus: PENDING_TEST')
execSync('git add -A && git -c user.email=t@t -c user.name=t commit -q -m f', { cwd: repo })
check('빈 파일·닫히지 않은 frontmatter 도 크래시 없이 계산', run(repo), 'main | 3 pending')
const spaced = fs.mkdtempSync(path.join(os.tmpdir(), 'sl 공백 '))
execSync('git init -q -b feat/x && git -c user.email=t@t -c user.name=t commit -q --allow-empty -m i', { cwd: spaced })
check('공백·한글 경로 + 슬래시 브랜치', run(spaced), 'feat/x')

for (const d of [repo, notRepo, spaced]) fs.rmSync(d, { recursive: true, force: true })
console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed) process.exit(1)
