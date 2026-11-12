#!/usr/bin/env node
// pre-approval-write.test.js — 승인 전 셸 명령의 파일 변경 판정 (node .claude/hooks/lib/pre-approval-write.test.js)
// 3계층: 정상(읽기·테스트·임시 폴더 쓰기 통과) / 악성(셸·인터프리터·스크립트·패키지 매니저·git 으로 파일 바꾸기, 난독화·변수 우회) /
//        이상·경계(해석 불가·빈 명령·단어 나누기·변수 대상·cd 추적·초장문)
'use strict'
const fs = require('fs')
const os = require('os')
const path = require('path')
const { preApprovalWriteReason, codeWrites } = require('./pre-approval-write')
const { isExemptPath } = require('../task-confirm-guard.js')

let passed = 0, failed = 0
const proj = fs.mkdtempSync(path.join(os.homedir(), '.paw-proj-'))
fs.writeFileSync(path.join(proj, 'package.json'), JSON.stringify({ scripts: { test: 'node --test', gen: 'node gen.js', lint: 'eslint .', fix: 'eslint --fix .', prebuild: 'node gen.js', build: 'tsc --noEmit' } }))
fs.writeFileSync(path.join(proj, 'gen.js'), "require('fs').writeFileSync('o.txt','x')\n")
fs.writeFileSync(path.join(proj, 'read.js'), "console.log(require('fs').readFileSync('package.json','utf8'))\n")
fs.writeFileSync(path.join(proj, 'w.sh'), 'echo x > a.md\n')
fs.writeFileSync(path.join(proj, 'r.sh'), 'ls -la\ncat package.json\n')
const R = (c) => preApprovalWriteReason(c, proj, { isExemptPath: (a) => isExemptPath(a, proj) })
const t = (desc, cmd, block) => {
  const r = R(cmd)
  const ok = !!r === block
  console.log(`  ${ok ? '✅' : '❌'} ${desc} → ${ok ? 'PASS' : `FAIL (기대 ${block ? '차단' : '통과'}, 실제 ${JSON.stringify(r)})`}`)
  ok ? passed++ : failed++
}
const TMP = process.platform === 'win32' ? os.tmpdir().replace(/\\/g, '/') : '/tmp'

console.log('🔍 pre-approval-write 테스트 시작')
console.log('\n── 정상: 읽기·테스트·임시 폴더 쓰기는 통과 ──')
for (const c of ['ls -la; git status', 'cat package.json | head', 'node --test', 'npm test', 'npm run lint', 'node read.js', 'sh r.sh',
  `echo hi > ${TMP}/paw-a.txt`, `cp package.json ${TMP}/paw-r.json`, 'sed -n 1p package.json', 'git diff && git log -3', 'git add -A && git commit -m x', 'git reset HEAD a',
  'git stash list', 'git worktree list', 'git clean -n', 'npx tsc --noEmit', 'pnpm --filter x exec vitest run', 'gugbab-claude status', 'curl -s http://x',
  `curl -o ${TMP}/paw-o http://x`, 'curl -s -D - -o /dev/null http://x', 'tar tzf a.tgz', 'unzip -l a.zip', './gradlew test', 'cargo test', 'uv run pytest', 'python3 -m pytest',
  "python3 - <<'EOF'\nprint(open('package.json').read())\nEOF", "python3 -c 'import sys; sys.stdout.write(\"x\")'", 'node -e "console.log(1)"',
  `git clone https://x ${TMP}/paw-c`, 'ls > /dev/null 2>&1', `cd ${TMP} && touch paw-t`, `S=${TMP}/paw-d; cat > "$S/a.js" <<EOF\nhi\nEOF`])
  t(`정상: \`${c.split('\n')[0]}\``, c, false)

console.log('\n── 악성: 셸로 프로젝트 파일 바꾸기 → 차단 ──')
for (const [d, c] of [
  ['리다이렉트', 'echo hi > README.md'], ['추가 리다이렉트', 'echo x >> docs/CHANGELOG.md'], ['cp 로 훅 덮기', 'cp x .claude/hooks/a.js'], ['sed -i', 'sed -i "" s/a/b/ f.md'],
  ['mv', 'mv a b'], ['rm', 'rm -rf tmpdir'], ['touch', 'touch new.md'], ['tee', 'tee a.md < x'], ['ln', 'ln -s a b'], ['chmod', 'chmod +x a.sh'], ['dd of=', 'dd if=/dev/zero of=a.img'],
  ['tar 풀기', 'tar xzf a.tgz'], ['curl -o 프로젝트', 'curl -o out.json http://x'], ['wget', 'wget http://x/a'],
  ['python heredoc 쓰기', "python3 - <<'EOF'\nopen('a','w').write('x')\nEOF"], ['python os.remove', "python3 -c 'import os; os.remove(\"a\")'"],
  ['python subprocess', "python3 - <<'EOF'\nimport subprocess\nsubprocess.run(['rm','a'])\nEOF"], ['python getattr 난독화', "python3 - <<'EOF'\ngetattr(__builtins__,'op'+'en')('a','w')\nEOF"],
  ['node writeFileSync', `node -e "require('fs').writeFileSync('a',1)"`], ['node 동적 require 난독화', `node -e "const m='f'+'s'; require(m).writeFileSync('a','')"`],
  ['쓰는 node 스크립트', 'node gen.js'], ['쓰는 셸 스크립트', 'sh w.sh'], ['bash -c', 'bash -c "echo x > a.md"'], ['echo | bash', 'echo "rm a" | bash'],
  ['npm 스크립트가 쓰기', 'npm run gen'], ['npm 스크립트 --fix', 'npm run fix'], ['pre 스크립트가 쓰기', 'npm run prebuild'], ['build 앞 prebuild 가 쓰기(pre 훅 추적)', 'npm run build'], ['npm install', 'npm install'], ['uv add', 'uv add x'],
  ['pip install', 'python3 -m pip install x'], ['prettier --write', 'npx prettier --write .'], ['tsc 출력', 'npx tsc'], ['cargo fmt', 'cargo fmt'], ['gradle spotlessApply', './gradlew spotlessApply'],
  ['git checkout', 'git checkout -- a'], ['git stash', 'git stash'], ['git reset --hard', 'git reset --hard'], ['git clean -fd', 'git clean -fd'], ['git -C checkout', 'git -C /tmp/x checkout .'],
  ['git clone 프로젝트 안', 'git clone https://x c'], ['하네스 끄기', 'gugbab-claude off hook:x'], ['eval', 'eval "rm a"'], ['변수 명령', '$CMD a'], ['make', 'make'],
  ['반복문 쓰기', 'for f in a b; do echo $f > $f.md; done'], ['cd 변수 뒤 쓰기', 'cd $X && touch a'],
]) t(`악성: ${d}`, c, true)

console.log('\n── 이상·경계 ──')
t('경계: 닫히지 않은 따옴표 → 해석 불가 차단', 'echo "a > b', true)
t('경계: 빈 명령 → 통과', '   ', false)
t('경계: 모르는 변수 대상 → 차단', 'echo x > "$OUT"', true)
t('경계: 변수 대상이 두 번 대입되고 하나가 프로젝트 → 차단', `S=${TMP}/x; S=.; echo 1 > $S/a`, true)
t('경계: $(…) 대입 → 차단', 'S=$(pwd); echo 1 > $S/a', true)
t('경계: read 로 바뀌는 변수 → 차단', 'read S; echo 1 > $S/a', true)
t('경계: 따옴표 없는 공백 값 → 단어 나누기로 프로젝트에 → 차단', `S="${TMP}/a b"; touch $S/x`, true)
t('경계: 따옴표로 감싼 공백 값 → 통과', `S="${TMP}/a b"; touch "$S/x"`, false)
t('경계: .. 로 임시 폴더 탈출 → 차단', `echo x > ${TMP}/../Users/paw/x`, true)
t('경계: 없는 스크립트 파일 → 판정 불가 차단', 'node no-such.js', true)
t('경계: 초장문 → 예외 없이 판정', 'echo ' + 'a'.repeat(300000), R('echo ' + 'a'.repeat(300000)) !== null)
t('경계: 비문자열 → 통과(판정 대상 아님)', null, false)
// 2026-11-11 /harness preset 오탐 — 이름 없는 preset 은 목록만 보여 준다(cli/main.js). 이름이 있으면 켜기라 차단
t('정상: gugbab-claude preset (목록) → 통과', 'gugbab-claude preset', false)
t('정상: gugbab-claude preset --all (이름 없음 = 목록) → 통과', 'gugbab-claude preset --all', false)
t('악성: gugbab-claude preset nextjs (켜기) → 차단', 'gugbab-claude preset nextjs', true)
t('악성: gugbab-claude preset nextjs --all → 차단', 'gugbab-claude preset nextjs --all', true)
t('악성: 변수 이름 preset → 차단', 'gugbab-claude preset "$P"', true)
t('악성: 목록 뒤 체인으로 켜기 → 차단', 'gugbab-claude preset; gugbab-claude preset rust', true)
t('경계: lfmall-claude preset (목록) → 통과', 'lfmall-claude preset', false)
const okCode = [codeWrites('print(1)'), codeWrites("open('a','w')"), codeWrites('process.stdout.write("x")'), codeWrites('fs.rmSync("a")')]
const pass = JSON.stringify(okCode) === JSON.stringify([false, true, false, true])
console.log(`  ${pass ? '✅' : '❌'} codeWrites: 출력만은 통과, 쓰기·삭제는 감지 → ${pass ? 'PASS' : 'FAIL ' + JSON.stringify(okCode)}`)
pass ? passed++ : failed++

fs.rmSync(proj, { recursive: true, force: true })
console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
