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
// 2026-10-20 윈도우 — Git Bash 의 git.exe·대문자·\ 경로도 같은 git 으로 본다
test('git.exe push origin main', 'git.exe push origin main', 2, repo)
test('GIT.EXE push origin main', 'GIT.EXE push origin main', 2, repo)
test('"C:\\Git\\bin\\git.exe" push origin main', '"C:\\Git\\bin\\git.exe" push origin main', 2, repo)
test('git.exe switch -c another (피처에서 분기 금지)', 'git.exe switch -c feature/another', 2, repo)
test('git.exe push origin feature/test (정상)', 'git.exe push origin feature/test', 0, repo)
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
  // 보안 훅은 입력을 못 읽으면 막는다 (2026-10-20 — 예전엔 통과, 윈도우에서 '/dev/stdin' 이 없어 모든 push 가 무검사로 통과했다)
  for (const [label, input] of [['깨진 JSON', '{broken'], ['빈 stdin', ''], ['JSON null', 'null'], ['JSON 배열', '[]'], ['숫자', '42']]) {
    const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000, cwd: repo })
    const ok = r.status === 2 && r.stderr.includes('입력(JSON)을 읽지 못해')
    console.log(`  ${ok ? '✅' : '❌'} ${label} stdin → exit 2 차단 → ${ok ? 'PASS' : `FAIL (exit ${r.status})`}`)
    ok ? passed++ : failed++
  }
  {
    // 정상: 다른 도구·빈 명령은 예전처럼 통과 (입력은 읽혔으므로)
    const r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Read', tool_input: {} }), encoding: 'utf8', timeout: 5000, cwd: repo })
    const ok = r.status === 0
    console.log(`  ${ok ? '✅' : '❌'} Bash 가 아닌 도구 → exit 0 → ${ok ? 'PASS' : `FAIL (exit ${r.status})`}`)
    ok ? passed++ : failed++
  }
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

// ── 2026-11-06 감사 — 분석 불가한 셸 넘김·--repo·브랜치 생성 변형·실제 레포 기준 판정 ──
// testIn: 훅 프로세스 cwd(spawnCwd)와 훅 입력 cwd(inputCwd)를 따로 준다 — Claude Code 는 세션 cwd 를 input.cwd 로 넘긴다
function testIn(desc, command, expectedExit, spawnCwd, inputCwd) {
  const payload = { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } }
  if (inputCwd !== undefined) payload.cwd = inputCwd
  const r = spawnSync('node', [HOOK], { input: JSON.stringify(payload), encoding: 'utf8', timeout: 5000, cwd: spawnCwd })
  const TAG = '[branch-protection]', out = r.stdout || '', err = r.stderr || ''
  const chanErr = expectedExit === 2
    ? (!err.includes(TAG) ? 'stderr 에 차단 사유 없음' : out.includes(TAG) ? 'stdout 에 차단 사유가 섞임' : '')
    : ((out + err).includes(TAG) ? '통과인데 차단 사유 출력' : '')
  const pass = r.status === expectedExit && !chanErr
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status}${chanErr ? ', ' + chanErr : ''})`}`)
  pass ? passed++ : failed++
}

git('checkout feature/test')
console.log('\n── 피처 브랜치 — 분석 불가한 셸 넘김 + push (악성, 전부 exit 2) ──')
test("echo 'git push origin main' | sh", `echo '${P} origin main' | sh`, 2, repo)
test("cat <<'EOF' | bash (따옴표 heredoc 본문을 셸로)", `cat <<'EOF' | bash\n${P} origin main\nEOF`, 2, repo)
test("bash <<<'git push origin main' (here-string)", `bash <<<'${P} origin main'`, 2, repo)
test('bash -s < 파이프 입력', `printf '${P} origin main' | bash -s`, 2, repo)
test('echo origin main | xargs git push', `echo origin main | xargs ${P}`, 2, repo)
test('$(echo git) push origin main (동적 명령 이름)', '$(echo git) push origin main', 2, repo)
test('$G push origin main (변수 명령 이름)', 'G=git; $G push origin main', 2, repo)
test('sh -c "$(printf …)" (동적 스크립트)', `sh -c "$(printf '${P} origin main')"`, 2, repo)
test('eval "$CMD" + push 문자열', `CMD='${P} origin main'; eval "$CMD"`, 2, repo)
test('source <(echo git push origin main)', `source <(echo ${P} origin main)`, 2, repo)
test('python3 -c os.system(git push)', `python3 -c "import os;os.system('${P} origin main')"`, 2, repo)
test('node -e execSync(git push)', `node -e "require('child_process').execSync('${P} origin main')"`, 2, repo)
// 2026-11-09 — git·push 를 배열로 쪼갠 형태도 막고, push 가 JS 배열 메서드일 뿐이면 통과
test("python3 -c subprocess.run(['git','push',…])", `python3 -c "import subprocess;subprocess.run(['git', 'pu' 'sh', 'origin', 'main'])"`.replace("'pu' 'sh'", "'" + 'pu' + "sh'"), 2, repo)
test('node -e spawnSync("git", ["push"])', `node -e "require('child_process').spawnSync('git', ['${'pu'}sh', 'origin', 'main'])"`, 2, repo)
test('python heredoc: 다른 줄의 git 과 arr.push(x) → 통과', `python3 - <<'EOF'\ns = "git: (v) => true"\ncode = "pos.${'pu'}sh(x)"\nEOF`, 0, repo)
test('node -e arr.push + git 문자열 → 통과', `node -e "const a=[];a.${'pu'}sh('git');console.log(a)"`, 0, repo)
test('git push --repo=origin main', `${P} --repo=origin main`, 2, repo)
test('git push --repo origin main', `${P} --repo origin main`, 2, repo)
test('GIT_DIR=… git push (다른 레포 지정)', `GIT_DIR=/tmp/x/.git ${P} origin feature/test`, 2, repo)
test('git --git-dir=… push (다른 레포 지정)', `git --git-dir=/tmp/x/.git push origin feature/test`, 2, repo)

console.log('\n── 피처 브랜치 — 셸 넘김 오탐 금지 (exit 0) ──')
test('echo hi | sh (push 없음)', 'echo hi | sh', 0, repo)
test("cat <<'EOF' | bash (npm run build)", "cat <<'EOF' | bash\nnpm run build\nEOF", 0, repo)
test('node -e "a.push(1)" (JS 배열 push — git 없음)', 'node -e "const a=[];a.push(1);console.log(a)"', 0, repo)
test("cat <<'EOF' > notes.md (heredoc 을 파일로 — 셸 아님)", `cat <<'EOF' > notes.md\n${P} origin main\nEOF`, 0, repo)
test('git push --repo=origin feature/test', `${P} --repo=origin feature/test`, 0, repo)
test('git commit -m "git push origin main 차단 추가" (인용 텍스트)', `git commit -m "${P} origin main 차단 추가"`, 0, repo)

// 2026-11-13 오탐 — 인터프리터가 스크립트 파일을 돌리면 인자 속 "git push" 글자는 코드가 아니라 값이다.
// 스크립트 내용을 읽어 판정: 내용에 git push 가 있거나, 명령을 띄우는 코드 + 인자에 push 면 막는다
const scr = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-scr-'))
fs.writeFileSync(path.join(scr, 'scan.js'), "const fs=require('fs');console.log(fs.readFileSync(process.argv[2],'utf8').split('\\n').filter(l=>new RegExp(process.argv[3]).test(l)).length)\n")
fs.writeFileSync(path.join(scr, 'scan.py'), "import sys,re\nprint(len([l for l in open(sys.argv[1]) if re.search(sys.argv[2], l)]))\n")
fs.writeFileSync(path.join(scr, 'run.js'), "require('child_process').execSync(process.argv.slice(2).join(' '))\n")
fs.writeFileSync(path.join(scr, 'tpl.js'), "const a=process.argv[2];console.log(`found ${a}`)\n")
fs.writeFileSync(path.join(scr, 'dynreq.js'), "const m='child_'+'process';require(m).execSync(process.argv[2])\n")
fs.writeFileSync(path.join(scr, 'bt.pl'), 'my $c = $ARGV[0]; print `$c`;\n')
fs.writeFileSync(path.join(scr, 'ev.py'), "import sys\nexec(sys.argv[1])\n")
const fwd = (p) => (process.platform === 'win32' ? p.replace(/\\/g, '/') : p)
const js = (f) => fwd(path.join(scr, f))
test('정상: node <읽기 스크립트> <파일> "git push|config" (인자 속 글자) → 통과', `node ${js('scan.js')} log.jsonl '${P}|config user'`, 0, repo)
test('정상: cd <폴더> && node scan.js … "git push" → 통과', `cd ${fwd(scr)} && node scan.js log.jsonl '${P}'`, 0, repo)
test('정상: python3 <읽기 스크립트> … "git push" → 통과', `python3 ${js('scan.py')} log.txt '${P} origin main'`, 0, repo)
test('악성: node <인자를 실행하는 스크립트> git push origin main → 2', `node ${js('run.js')} ${P} origin main`, 2, repo)
test('정상: node <템플릿 문자열만 쓰는 스크립트> "git push" → 통과', `node ${js('tpl.js')} '${P} origin main'`, 0, repo)
test('악성: node <동적 require 로 child_process> git push → 2', `node ${js('dynreq.js')} '${P} origin main'`, 2, repo)
test('악성: perl <백틱 실행 스크립트> git push → 2', `perl ${js('bt.pl')} '${P} origin main'`, 2, repo)
test('악성: python3 <exec(argv) 스크립트> git push → 2', `python3 ${js('ev.py')} "import os;os.system('${P} origin main')"`, 2, repo)
test('악성: 읽기 스크립트 뒤 체인으로 진짜 main push → 2', `node ${js('scan.js')} a '${P}'; ${P} origin main`, 2, repo)
test('악성: 읽기 스크립트 + 같은 줄 node -e 로 push → 2', `node ${js('scan.js')} a b && node -e "require('child_process').execSync('${P} origin main')"`, 2, repo)
test('악성: 서브셸 cd 뒤 상대 경로 스크립트 + push 인자 → 경로 확인 불가 2', `(cd ${fwd(scr)}) && node run.js '${P} origin main'`, 2, repo)
test('악성: 변수 경로 스크립트 + push 인자 → 2', `S=$(mktemp); node "$S" '${P} origin main'`, 2, repo)
test('악성: node <없는 스크립트> "git push origin main" → 내용 확인 불가 2', `node ${js('nope.js')} '${P} origin main'`, 2, repo)
test('악성: node -e 인라인 + 인자 git push (스크립트 파일 아님) → 2', `node -e "require('child_process').execSync(process.argv[1])" '${P} origin main'`, 2, repo)
test('악성: node - (표준입력) + git push → 2', `echo "require('child_process').execSync('${P} origin main')" | node -`, 2, repo)
test('악성: python3 -m 모듈 + git push 인자 → 2', `python3 -m runpy_like '${P} origin main'`, 2, repo)

console.log('\n── 피처 브랜치 — 새 브랜치 생성 변형 (악성, 전부 exit 2) ──')
test('git branch feature/new', 'git branch feature/new', 2, repo)
test('git branch -f feature/new (강제 생성)', 'git branch -f feature/new', 2, repo)
test('git branch -c feature/test feature/copy (복사 = 새 브랜치)', 'git branch -c feature/test feature/copy', 2, repo)
test('git worktree add -b x ../w', 'git worktree add -b x ../w', 2, repo)
test('git worktree add ../w2 (이름 자동 생성)', 'git worktree add ../w2', 2, repo)
test('git checkout -bx (붙여 쓴 -b)', 'git checkout -bx', 2, repo)
test('git checkout -qb x (짧은 옵션 묶음)', 'git checkout -qb x', 2, repo)
test('git switch -cx (붙여 쓴 -c)', 'git switch -cx', 2, repo)
test('git switch --create=x', 'git switch --create=x', 2, repo)
test('git checkout --orphan x', 'git checkout --orphan x', 2, repo)

console.log('\n── 피처 브랜치 — 브랜치 조회·정리 오탐 금지 (exit 0) ──')
test('git branch (목록)', 'git branch', 0, repo)
test('git branch -a', 'git branch -a', 0, repo)
test('git branch -vv', 'git branch -vv', 0, repo)
test('git branch -d old', 'git branch -d old', 0, repo)
test('git branch -D old', 'git branch -D old', 0, repo)
test('git branch -m new-name (이름 변경)', 'git branch -m new-name', 0, repo)
test("git branch --list 'feat*'", "git branch --list 'feat*'", 0, repo)
test('git branch --show-current', 'git branch --show-current', 0, repo)
test('git branch --contains abc123', 'git branch --contains abc123', 0, repo)
test('git branch -u origin/feature/test (업스트림 설정)', 'git branch -u origin/feature/test', 0, repo)
test('git worktree list', 'git worktree list', 0, repo)
test('git worktree add ../w3 feature/test (기존 브랜치)', 'git worktree add ../w3 feature/test', 0, repo)
test('git worktree add -d ../w4 (detach)', 'git worktree add -d ../w4', 0, repo)
test('git checkout feature/other (전환만)', 'git checkout feature/other', 0, repo)

console.log('\n── main 브랜치 — 브랜치 생성 변형 허용 (exit 0) ──')
git('checkout main')
test('git branch feature/z (main 에서)', 'git branch feature/z', 0, repo)
test('git worktree add -b z ../wz (main 에서)', 'git worktree add -b z ../wz', 0, repo)
test('git checkout -bz (main 에서)', 'git checkout -bz', 0, repo)
git('checkout feature/test')

console.log('\n── 실제 레포 기준 판정 — input.cwd · cd · -C ──')
const noRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-norepo-'))
const mainRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-main-'))
execSync('git -c user.email=t@t -c user.name=t init -q -b main && git -c user.email=t@t -c user.name=t commit -q --allow-empty -m init', { cwd: mainRepo, stdio: 'pipe' })
const detRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-det-'))
execSync('git -c user.email=t@t -c user.name=t init -q -b main && git -c user.email=t@t -c user.name=t commit -q --allow-empty -m init && git checkout -q -b feat && git checkout -q --detach', { cwd: detRepo, stdio: 'pipe' })

// detached HEAD — 브랜치를 못 읽으면 push 는 막는다 (fail-closed)
testIn('detached: push origin HEAD:main', `${P} origin HEAD:main`, 2, detRepo)
testIn('detached: push origin main', `${P} origin main`, 2, detRepo)
testIn('detached: push (인자 없음)', P, 2, detRepo)
testIn('detached: push origin HEAD', `${P} origin HEAD`, 2, detRepo)
testIn('detached: git status → 0', 'git status', 0, detRepo)
testIn('detached: git checkout -b x → 0 (분기 규칙은 브랜치를 알 때만)', 'git checkout -b x', 0, detRepo)
testIn('detached: push origin --delete feature/old → 0 (보호 아닌 원격 삭제)', `${P} origin --delete feature/old`, 0, detRepo)

// 명령 문자열에 넣는 경로 — 윈도우 `C:\x` 를 따옴표 없이 넣으면 bash 가 `\` 를 지워 다른 경로가 되고 훅은 판정 불가로 막는다.
// Claude 가 Git Bash 에 쓰는 `C:/x` 형태로 넣는다 (2026-11-12 윈도우 CI 에서 시험이 잘못된 명령을 만들던 것을 발견)
const shp = (p) => (process.platform === 'win32' ? p.replace(/\\/g, '/') : p)

// 레포 아닌 cwd 에서 다른 레포로
testIn('레포 아님: git -C <피처레포> push origin HEAD:main', `git -C ${shp(repo)} ${'push'} origin HEAD:main`, 2, noRepo)
testIn('레포 아님: cd <피처레포> && git push origin HEAD:main', `cd ${shp(repo)} && ${P} origin HEAD:main`, 2, noRepo)
testIn('레포 아님: git push origin main (대상 main)', `${P} origin main`, 2, noRepo)
testIn('레포 아님: git push (브랜치 확인 불가)', P, 2, noRepo)
testIn('레포 아님: git status → 0', 'git status', 0, noRepo)
testIn('레포 아님: git -C <피처레포> push origin feature/test → 0', `git -C ${shp(repo)} push origin feature/test`, 0, noRepo)
testIn('레포 아님: cd <피처레포> && git push origin feature/test → 0', `cd ${shp(repo)} && ${P} origin feature/test`, 0, noRepo)
if (process.platform === 'win32') {
  // 따옴표 밖 `C:\x` 는 bash 가 `\` 를 지워 엉뚱한 폴더가 된다 → 어느 레포인지 모르므로 막아야 한다 (fail-closed)
  testIn('윈도우: 따옴표 밖 역슬래시 경로 git -C C:\\x push → 판정 불가 차단', `git -C ${repo} push origin feature/test`, 2, noRepo)
  testIn("윈도우: 작은따옴표 안 역슬래시 경로 git -C 'C:\\x' push → 피처 판정", `git -C '${repo}' push origin feature/test`, 0, noRepo)
}

// main 위 레포를 다른 cwd 에서
testIn('다른 cwd: git -C <main레포> push origin feat', `git -C ${shp(mainRepo)} push origin feat`, 2, noRepo)
testIn('다른 cwd: cd <main레포> && git push origin feat', `cd ${shp(mainRepo)} && ${P} origin feat`, 2, noRepo)
testIn('피처레포 cwd: git -C <main레포> push origin feat', `git -C ${shp(mainRepo)} push origin feat`, 2, repo)
testIn('input.cwd=<main레포> (훅 프로세스는 피처레포): push origin feat', `${P} origin feat`, 2, repo, mainRepo)
testIn('input.cwd=<피처레포> (훅 프로세스는 레포 아님): checkout -b x', 'git checkout -b x', 2, noRepo, repo)
testIn('input.cwd=<피처레포>: push origin feature/test → 0', `${P} origin feature/test`, 0, noRepo, repo)
testIn('cd <main레포> 후 git -C <피처레포> push origin feature/test → 0', `cd ${shp(mainRepo)} && git -C ${shp(repo)} push origin feature/test`, 0, noRepo)
testIn('git -C <피처레포> 상대경로 -C . → 피처 판정', `cd ${shp(repo)} && git -C . push origin feature/test`, 0, noRepo)

// 경로를 정적으로 알 수 없으면 push 는 막는다
testIn('cd "$X" && git push origin feature/test (동적 cd)', `cd "$X" && ${P} origin feature/test`, 2, repo)
testIn('git -C "$X" push origin feature/test (동적 -C)', `git -C "$X" push origin feature/test`, 2, repo)
testIn('(cd <main레포> && git push origin feat) 서브셸 cd', `(cd ${shp(mainRepo)} && ${P} origin feat)`, 2, repo)
testIn('cd /없는/경로 && git push origin feature/test', `cd /nonexistent-bp-dir && ${P} origin feature/test`, 2, repo)

// 이상 입력: cwd 가 문자열이 아니거나 없는 경로
testIn('input.cwd 숫자 → 훅 프로세스 cwd 로 판정 (피처, 대상 main) → 2', `${P} origin main`, 2, repo, 42)
testIn('input.cwd 없는 경로 → 브랜치 확인 불가 → push 2', `${P} origin feature/test`, 2, repo, '/nonexistent-bp-dir')

// 2026-11-16 사용자 결정 — 원격이 완전히 빈 레포에 main 을 처음 만드는 push 하나만 허용
console.log('\n── 빈 원격에 main 첫 push (예외) ──')
{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-first-'))
  const g = (cwd, a) => execSync(`git -c user.email=t@t -c user.name=t ${a}`, { cwd, stdio: 'pipe' })
  const mkLocal = (name) => { const d = path.join(root, name); fs.mkdirSync(d); g(d, 'init -q -b main'); g(d, 'commit -q --allow-empty -m init'); return d }
  const mkBare = (name) => { const d = path.join(root, name); fs.mkdirSync(d); g(d, 'init -q --bare'); return fwd(d) }
  const PSH = 'git ' + 'pu' + 'sh'
  // 정상: 빈 bare 원격 + main 에서 첫 push
  const a = mkLocal('a'); g(a, `remote add origin ${mkBare('a.git')}`)
  test('정상: 빈 원격 + git push -u origin main → 0', `${PSH} -u origin main`, 0, a)
  test('정상: 빈 원격 + git push --set-upstream origin HEAD:main → 0', `${PSH} --set-upstream origin HEAD:main`, 0, a)
  test('정상: 빈 원격 + git push origin (refspec 없음, 현재 main) → 0', `${PSH} origin`, 0, a)
  test('정상: 빈 원격 + -q -u → 0', `${PSH} -q -u origin main`, 0, a)
  // 악성·우회
  const b = mkLocal('b'); const bRemote = mkBare('b.git'); g(b, `remote add origin ${bRemote}`); g(b, `push -q origin main`)
  test('악성: 원격에 이미 main 있음 → 2', `${PSH} -u origin main`, 2, b)
  const c = mkLocal('c'); const cRemote = mkBare('c.git'); g(c, `remote add origin ${cRemote}`); g(c, 'tag v0'); g(c, 'push -q origin v0')
  test('악성: 원격에 태그만 있음(빈 레포 아님) → 2', `${PSH} -u origin main`, 2, c)
  const d = mkLocal('d'); g(d, `remote add origin ${mkBare('d.git')}`)
  test('악성: 빈 원격이라도 --force → 2', `${PSH} --force -u origin main`, 2, d)
  test('악성: 빈 원격이라도 --all → 2', `${PSH} --all origin`, 2, d)
  test('악성: 빈 원격이라도 --tags → 2', `${PSH} --tags -u origin main`, 2, d)
  test('악성: 빈 원격이라도 +main(강제 refspec) → 2', `${PSH} origin +main`, 2, d)
  test('악성: 빈 원격이라도 :main(삭제) → 2', `${PSH} origin :main`, 2, d)
  test('악성: 한 명령에 push 두 번(첫 push 뒤 main 계속) → 2', `${PSH} -u origin main && git commit --allow-empty -m x && ${PSH} origin main`, 2, d)
  test('악성: 변수 원격 이름 → 2', `R=origin; ${PSH} -u $R main`, 2, d)
  test('악성: 없는 원격 이름 → 2', `${PSH} -u nope main`, 2, d)
  test('악성: URL 을 바로 원격으로 → 2', `${PSH} -u ${mkBare('d2.git')} main`, 2, d)
  // 설정으로 확인 대상만 빈 레포로 돌리기
  const e = mkLocal('e'); g(e, `remote add origin ${bRemote}`); g(e, `config remote.origin.pushurl ${bRemote}`); g(e, `config remote.origin.url ${mkBare('e-empty.git')}`)
  test('악성: pushurl 따로 (확인은 빈 레포, push 는 진짜) → 2', `${PSH} -u origin main`, 2, e)
  const f = mkLocal('f'); g(f, `remote add origin ${mkBare('f.git')}`); g(f, `config url.${bRemote}.pushInsteadOf ${fwd(path.join(root, 'f.git'))}`)
  test('악성: pushInsteadOf 로 push 대상 바꾸기 → 2', `${PSH} -u origin main`, 2, f)
  const h = mkLocal('h'); g(h, `remote add origin ${mkBare('h.git')}`); g(h, 'config remote.origin.uploadpack /bin/false')
  test('악성: uploadpack 바꿔 확인 결과 조작 → 2', `${PSH} -u origin main`, 2, h)
  const k = mkLocal('k'); g(k, 'remote add origin "ext::sh -c true"')
  test('악성: ext:: 명령 실행형 원격 → 2', `${PSH} -u origin main`, 2, k)
  const m = mkLocal('m'); g(m, `remote add origin ${mkBare('m.git')}`); g(m, `config --add remote.origin.url ${bRemote}`)
  test('악성: 원격 URL 여러 개(하나는 진짜) → 2', `${PSH} -u origin main`, 2, m)
  // 이상·경계
  const n = mkLocal('n'); g(n, 'remote add origin ../rel.git')
  test('경계: 상대 경로 원격 → 2', `${PSH} -u origin main`, 2, n)
  const o = mkLocal('o'); g(o, `remote add origin ${fwd(path.join(root, 'nothing-here.git'))}`)
  test('경계: 없는 원격 경로(ls-remote 실패) → 2', `${PSH} -u origin main`, 2, o)
  const q = mkLocal('q'); g(q, 'checkout -q -b feature/x'); g(q, `remote add origin ${mkBare('q.git')}`)
  test('경계: 피처 브랜치 push 는 예전 그대로 → 0', `${PSH} -u origin feature/x`, 0, q)
  test('경계: 피처 브랜치에서 빈 원격 main 으로(HEAD:main) → 0', `${PSH} origin HEAD:main`, 0, q)
  fs.rmSync(root, { recursive: true, force: true })
}

fs.rmSync(scr, { recursive: true, force: true })
fs.rmSync(mainRepo, { recursive: true, force: true })
fs.rmSync(detRepo, { recursive: true, force: true })
fs.rmSync(repo, { recursive: true, force: true })
fs.rmSync(noRepo, { recursive: true, force: true })

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
