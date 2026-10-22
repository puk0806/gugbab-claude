#!/usr/bin/env node
// bash-guard — 하네스 설치 폴더(GUGBAB_HOME) Bash 쓰기 보호 (결정 39)
// 정상 / 악성·우회 / 경계 3계층
// 실행: node --test .claude/hooks/bash-guard-harness.test.js
const test = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')
const { classifyShell, handlePreToolUse } = require('./bash-guard.js')
const { IS_WIN, toSlash } = require('./lib/winpath')
const { linkDir } = require('./lib/testfs')

const HOOK = path.join(__dirname, 'bash-guard.js')

// 임시 폴더는 원래 쓰기 허용이라 하네스·프로젝트를 홈 아래 임시 폴더에 둔다 (실제 ~/gugbab 와 같은 조건)
// 윈도우(2026-10-20): bash 명령에 넣는 경로는 Git Bash 가 쓰는 슬래시 형태(C:/x) — 따옴표 밖 `\` 는 bash 가 지운다.
// fs 함수는 슬래시 경로도 받으므로 같은 문자열을 그대로 쓴다. 맥은 toSlash 가 그대로 돌려준다
const base = toSlash(fs.realpathSync(fs.mkdtempSync(path.join(os.homedir(), '.bg-harness-test-'))))
process.on('exit', () => { try { fs.rmSync(base, { recursive: true, force: true }) } catch { /* 무시 */ } })
const J = (...a) => toSlash(path.join(...a))
const harness = J(base, 'gugbab')
const proj = J(base, 'proj')
const memDir = J(harness, 'projects', 'proj', '.claude', 'projects', '-enc-proj')
const otherMem = J(harness, 'projects', 'other', '.claude', 'projects', '-enc-other')
for (const d of [J(harness, 'cli'), J(proj, '.git'), memDir, otherMem]) fs.mkdirSync(d, { recursive: true })
fs.writeFileSync(J(harness, 'cli', 'main.js'), '')
const link = J(base, 'link-to-harness')
linkDir(harness, link) // 윈도우는 junction (개발자 모드 없이 만들 수 있는 링크 — 공격자도 같은 조건)

function withEnv(env, fn) {
  const keys = ['GUGBAB_HOME', 'CLAUDE_BASH_GUARD_ALLOWED_DIRS', 'CLAUDE_PROJECT_DIR', 'CLAUDE_CONFIG_DIR']
  const saved = Object.fromEntries(keys.map(k => [k, process.env[k]]))
  for (const k of keys) delete process.env[k]
  Object.assign(process.env, env)
  try { return fn() } finally { for (const k of keys) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k] } }
}
const level = (cmd, { cwd = proj, env = { GUGBAB_HOME: harness, CLAUDE_BASH_GUARD_ALLOWED_DIRS: memDir } } = {}) =>
  withEnv(env, () => classifyShell(cmd, { cwd }).level)

// ── 정상: 하네스 폴더 쓰기는 확인, 읽기는 그대로 ──
test('정상: 하네스 폴더에 touch·mkdir·ln·chmod·tee·sed -i 는 ask', () => {
  for (const c of [`touch ${harness}/x`, `mkdir ${harness}/d`, `ln -s /etc/hosts ${harness}/h`, `chmod 644 ${harness}/cli/main.js`,
    `echo hi | tee ${harness}/t`, `sed -i '' s/a/b/ ${harness}/cli/main.js`, `perl -pi -e s/a/b/ ${harness}/cli/main.js`, `truncate -s 0 ${harness}/cli/main.js`]) {
    assert.strictEqual(level(c), 'ask', c)
  }
})

test('정상: 하네스 폴더로 출력 리다이렉트(> >> &>)는 ask', () => {
  for (const c of [`echo x > ${harness}/a.txt`, `echo x >> ${harness}/a.txt`, `ls &> ${harness}/a.txt`, `ls 2> ${harness}/err.txt`]) {
    assert.strictEqual(level(c), 'ask', c)
  }
})

test('정상: cp·mv·install 은 목적지가 하네스면 ask, mv 는 원본이 하네스여도 ask(원본이 지워짐)', () => {
  assert.strictEqual(level(`cp ./a ${harness}/b`), 'ask')
  assert.strictEqual(level(`cp -r ./a ${harness}/`), 'ask')
  assert.strictEqual(level(`install -m 644 ./a ${harness}/b`), 'ask')
  assert.strictEqual(level(`mv ${harness}/cli/main.js ./main.js`), 'ask')
  assert.strictEqual(level(`mv ./a ${harness}/b`), 'ask')
})

test('정상: 하네스 폴더 읽기는 판정 없음(null) — cat·grep·ls·git log·하네스에서 복사해 오기·입력 리다이렉트', () => {
  for (const c of [`cat ${harness}/cli/main.js`, `grep -rn foo ${harness}/cli`, `ls -la ${harness}`, `git -C ${harness} log -1 --oneline`,
    `cp ${harness}/cli/main.js ./copy.js`, `cat < ${harness}/cli/main.js`, `ls ${harness} > ./out.txt`, `wc -l ${harness}/cli/main.js | head -1`]) {
    assert.strictEqual(level(c), null, c)
  }
})

test('정상: cd 로 하네스에 들어가 상대경로로 쓰면 ask, 읽기는 null', () => {
  assert.strictEqual(level(`cd ${harness} && touch x`), 'ask')
  assert.strictEqual(level(`cd ${harness} && echo y > cli/new.js`), 'ask')
  assert.strictEqual(level(`cd ${harness} && git log -1 --oneline 2>&1`), null)
  assert.strictEqual(level(`cd ${harness} && cat cli/main.js >&2`), null)
})

test('정상: 이 프로젝트의 메모리·대화 폴더(허용 폴더 환경변수)는 하네스 안이어도 쓰기 허용', () => {
  assert.strictEqual(level(`touch ${memDir}/tool-results/x.txt`), null)
  assert.strictEqual(level(`cp ./a ${memDir}/b.txt`), null)
  assert.strictEqual(level(`echo x > ${memDir}/notes.txt`), null)
})

test('정상: 하네스 폴더 자체에서 작업 중이면(프로젝트 = 하네스) 보호하지 않음', () => {
  fs.mkdirSync(path.join(harness, '.git'), { recursive: true })
  try {
    assert.strictEqual(level(`touch ${harness}/x`, { cwd: harness }), null)
    assert.strictEqual(level('echo y > cli/new.js', { cwd: harness }), null)
  } finally { fs.rmSync(path.join(harness, '.git'), { recursive: true, force: true }) }
})

test('정상: 훅 실행(PreToolUse 출력)도 ask + 이유에 하네스 폴더 언급', () => {
  const input = JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: `touch ${harness}/x` }, cwd: proj })
  const env = { ...process.env, GUGBAB_HOME: harness, CLAUDE_BASH_GUARD_ALLOWED_DIRS: memDir }
  delete env.CLAUDE_CONFIG_DIR; delete env.CLAUDE_PROJECT_DIR
  const r = spawnSync(process.execPath, [HOOK], { input, env, encoding: 'utf8', timeout: 10000 })
  const out = JSON.parse(r.stdout.trim())
  assert.strictEqual(out.hookSpecificOutput.permissionDecision, 'ask')
  assert.match(out.hookSpecificOutput.permissionDecisionReason, /하네스/)
})

// ── 악성·우회 ──
test('악성: ../ 경로·심볼릭 링크·-- 뒤 인자·cp -t 로 돌아서 써도 ask', () => {
  assert.strictEqual(level(`touch ${proj}/../gugbab/x`), 'ask')
  assert.strictEqual(level(`touch ${link}/x`), 'ask')
  assert.strictEqual(level(`echo x > ${link}/cli/main.js`), 'ask')
  assert.strictEqual(level(`touch -- ${harness}/x`), 'ask')
  assert.strictEqual(level(`cp -t ${harness} ./a`), 'ask')
  assert.strictEqual(level(`cp --target-directory=${harness} ./a`), 'ask')
})

test('악성: sh -c·서브셸·파이프 뒤에 숨겨도 ask', () => {
  assert.strictEqual(level(`sh -c "touch ${harness}/x"`), 'ask')
  assert.strictEqual(level(`(cd /tmp && touch ${harness}/x)`), 'ask')
  assert.strictEqual(level(`ls | tee ${harness}/x`), 'ask')
  assert.strictEqual(level(`true && echo x > ${harness}/x`), 'ask')
})

test('악성: 다른 프로젝트의 메모리 폴더는 허용 폴더가 아니라 ask', () => {
  assert.strictEqual(level(`touch ${otherMem}/x`), 'ask')
  assert.strictEqual(level(`echo x > ${otherMem}/a.txt`), 'ask')
})

test('악성: 허용 폴더 이름만 앞부분이 같은 형제 폴더(memDir-evil)는 허용되지 않음', () => {
  assert.strictEqual(level(`touch ${memDir}-evil/x`), 'ask')
})

// ── 경계 ──
test('경계: GUGBAB_HOME 이 없으면(래퍼 밖 세션) 보호 안 함', () => {
  assert.strictEqual(level(`touch ${harness}/x`, { env: {} }), null)
})

test('경계: GUGBAB_HOME 이 상대경로·빈 값·루트·홈(또는 그 상위)이면 보호 안 함 (홈 전체 확인 창 방지)', () => {
  for (const h of ['gugbab', '', '/', os.homedir(), path.dirname(os.homedir())]) {
    assert.strictEqual(level(`touch ${proj}/x`, { env: { GUGBAB_HOME: h } }), null, `GUGBAB_HOME=${h}`)
  }
})

test('경계: 변수로 만든 대상은 정적 해석 불가 → 이 검사는 판정 안 함(기존 흐름)', () => {
  assert.strictEqual(level('D=/x; touch "$D/y"'), null)
})

test('경계: fd 복제(2>&1, >&2, <&0)는 경로가 아님 — cd 하네스 안에서도 오탐 없음', () => {
  assert.strictEqual(level(`cd ${harness} && ls 2>&1 1>&2 <&0`), null)
})

test('경계: 하네스 폴더 판정 캐시가 GUGBAB_HOME 변경을 따라감', () => {
  assert.strictEqual(level(`touch ${harness}/x`), 'ask')
  assert.strictEqual(level(`touch ${harness}/x`, { env: {} }), null)
  assert.strictEqual(level(`touch ${harness}/x`), 'ask')
})

test('경계: Bash 가 아닌 도구는 이 훅이 판정 안 함 (Edit·Write 는 auto-approve 담당)', () => {
  withEnv({ GUGBAB_HOME: harness }, () => {
    assert.strictEqual(handlePreToolUse('Read', { file_path: `${harness}/x` }, proj), null)
    assert.strictEqual(handlePreToolUse('Write', { file_path: `${harness}/x` }, proj), null)
  })
})
