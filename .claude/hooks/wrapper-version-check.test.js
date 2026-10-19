#!/usr/bin/env node
/**
 * wrapper-version-check.test.js
 * 실행: node .claude/hooks/wrapper-version-check.test.js
 *
 * 3계층: 정상(같은 커밋이면 조용히, 예전 래퍼면 다시 실행 안내만, 세션 도중 업데이트면 재시작 표시 + 안내, 실제 훅 프로세스 출력 형식)
 *        / 악성·우회(조작된 커밋 값 — 셸 문자·초장문·대문자, 상대·조작 경로, 래퍼 설정 폴더가 아닌 곳·링크로 위장한 상태 파일,
 *          재시작 표시 자리에 링크를 심어 다른 파일 덮어쓰기 시도)
 *        / 이상·경계(개발 모드·모드 없음, git 실패·이상 출력, VERSION 없음·깨짐, 이미 있는 재시작 표시, SessionStart 아닌 이벤트·깨진 stdin, 절대 exit 2 없음)
 */
const { spawnSync, execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'wrapper-version-check.js')
const { checkWrapperVersion } = require('./wrapper-version-check.js')

let passed = 0, failed = 0
const check = (desc, cond, detail) => {
  console.log(`  ${cond ? '✅' : '❌'} ${desc}${cond ? '' : ` → FAIL ${detail !== undefined ? JSON.stringify(detail).slice(0, 400) : ''}`}`)
  cond ? passed++ : failed++
}
const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'wvc-')))
let n = 0
const A = 'a'.repeat(40), B = 'b'.repeat(40)

// 하네스 폴더(VERSION) + 래퍼 설정 폴더(.claude/.gugbab-state.json)
function setup({ version = '1.0.5', state = true } = {}) {
  const d = path.join(base, `s${++n}`)
  const home = path.join(d, 'gugbab')
  const cfg = path.join(d, 'projects', 'p', '.claude')
  fs.mkdirSync(home, { recursive: true }); fs.mkdirSync(cfg, { recursive: true })
  if (version !== null) fs.writeFileSync(path.join(home, 'VERSION'), version + '\n')
  if (state) fs.writeFileSync(path.join(cfg, '.gugbab-state.json'), '{}')
  return { d, home, cfg, marker: path.join(cfg, '.gugbab-restart') }
}
const envOf = (s, extra = {}) => ({ GUGBAB_DEV: '0', GUGBAB_HOME: s.home, CLAUDE_CONFIG_DIR: s.cfg, GUGBAB_WRAPPER_REV: A, ...extra })
const headIs = (v) => () => v
const noRev = (env) => { const e = { ...env }; delete e.GUGBAB_WRAPPER_REV; return e }

console.log('\n[정상]')
{
  const s = setup()
  const r = checkWrapperVersion({ env: envOf(s), headOf: headIs(A) })
  check('같은 커밋 → 안내 없음 · 재시작 표시 없음', r.message === null && !fs.existsSync(s.marker), r)
}
{
  const s = setup()
  const r = checkWrapperVersion({ env: envOf(s), headOf: headIs(B) })
  check('세션 도중 업데이트 → 재시작 표시 남김', r.kind === 'updated-during-session' && r.marked && fs.existsSync(s.marker), r)
  check('  안내에 버전·짧은 커밋·/exit 재시작 안내', /하네스 v1\.0\.5/.test(r.message) && /aaaaaaa → bbbbbbb/.test(r.message) && /--continue/.test(r.message), r.message)
}
{
  const s = setup()
  const r = checkWrapperVersion({ env: noRev(envOf(s)), headOf: headIs(A) })
  check('커밋 값 없음(예전 래퍼) → 다시 실행 안내', r.kind === 'old-wrapper' && /gugbab-claude -c/.test(r.message), r)
  check('  예전 래퍼에는 재시작 표시를 남기지 않음 (매번 다시 시작하는 반복 방지)', !r.marked && !fs.existsSync(s.marker))
}
{
  const s = setup()
  const r = checkWrapperVersion({ env: envOf(s, { GUGBAB_WRAPPER_REV: 'unknown' }), headOf: headIs(B) })
  check('커밋을 모름(unknown — git 없는 설치) → 조용히', r.message === null && !fs.existsSync(s.marker), r)
}

console.log('\n[악성·우회]')
{
  const s = setup()
  for (const rev of ['$(touch /tmp/wvc-pwned)', `${A}; rm -rf ~`, 'A'.repeat(40), 'a'.repeat(41), 'a'.repeat(100000), '', ' ' + A]) {
    const r = checkWrapperVersion({ env: envOf(s, { GUGBAB_WRAPPER_REV: rev }), headOf: headIs(B) })
    check(`조작된 커밋 값(${JSON.stringify(rev.slice(0, 24))}) → 무시, 표시 없음`, r.message === null && !fs.existsSync(s.marker), r)
  }
  check('  셸 문자가 실행되지 않음', !fs.existsSync('/tmp/wvc-pwned'))
}
{
  const s = setup()
  for (const home of ['gugbab', '../gugbab', '']) {
    const r = checkWrapperVersion({ env: envOf(s, { GUGBAB_HOME: home }), headOf: () => { throw new Error('불리면 안 됨') } })
    check(`상대·빈 하네스 경로(${JSON.stringify(home)}) → 무시`, r.message === null, r)
  }
  for (const cfg of ['.claude', `${s.cfg}/../../p/.claude/..`, path.join(s.d, 'projects')]) {
    const r = checkWrapperVersion({ env: envOf(s, { CLAUDE_CONFIG_DIR: cfg }), headOf: headIs(B) })
    check(`래퍼 설정 폴더가 아닌 곳(${JSON.stringify(cfg.slice(-30))}) → 무시`, r.message === null, r)
  }
}
{
  const s = setup({ state: false })
  const r = checkWrapperVersion({ env: envOf(s), headOf: headIs(B) })
  check('상태 파일 없는 .claude (래퍼가 조립하지 않은 폴더) → 무시', r.message === null && !fs.existsSync(s.marker), r)
  const target = path.join(s.d, 'elsewhere.json'); fs.writeFileSync(target, '{}')
  fs.symlinkSync(target, path.join(s.cfg, '.gugbab-state.json'))
  const r2 = checkWrapperVersion({ env: envOf(s), headOf: headIs(B) })
  check('상태 파일이 링크(위장) → 무시', r2.message === null && !fs.existsSync(s.marker), r2)
}
{
  const s = setup()
  const victim = path.join(s.d, 'victim.txt'); fs.writeFileSync(victim, 'keep')
  fs.symlinkSync(victim, s.marker)
  const r = checkWrapperVersion({ env: envOf(s), headOf: headIs(B) })
  check('재시작 표시 자리에 심은 링크 → 따라가 쓰지 않음', fs.readFileSync(victim, 'utf8') === 'keep' && fs.lstatSync(s.marker).isSymbolicLink(), r)
  check('  표시를 못 남기면 터미널에서 다시 실행하라고 안내', !r.marked && /gugbab-claude -c/.test(r.message), r)
}
{
  const s = setup()
  const link = path.join(s.d, 'cfg-link')
  const fake = path.join(s.d, 'fake'); fs.mkdirSync(fake)
  fs.symlinkSync(fake, link)
  const r = checkWrapperVersion({ env: envOf(s, { CLAUDE_CONFIG_DIR: link }), headOf: headIs(B) })
  check('설정 폴더를 다른 폴더 링크로 바꿔치기 → 무시', r.message === null && !fs.existsSync(path.join(fake, '.gugbab-restart')), r)
}

console.log('\n[이상·경계]')
{
  const s = setup()
  for (const dev of ['1', '', undefined, 'yes']) {
    const env = envOf(s, { GUGBAB_DEV: dev }); if (dev === undefined) delete env.GUGBAB_DEV
    const r = checkWrapperVersion({ env: noRev(env), headOf: headIs(B) })
    check(`개발 모드·래퍼 밖(GUGBAB_DEV=${JSON.stringify(dev)}) → 조용히`, r.message === null, r)
  }
}
{
  const s = setup()
  const r = checkWrapperVersion({ env: envOf(s), headOf: () => { throw new Error('git 없음') } })
  check('git 실패 → 조용히', r.message === null && !fs.existsSync(s.marker), r)
  for (const out of ['', 'fatal: not a git repository', `${B}\n${A}`, 'z'.repeat(40)]) {
    const r2 = checkWrapperVersion({ env: envOf(s), headOf: headIs(out) })
    check(`git 이상 출력(${JSON.stringify(out.slice(0, 20))}) → 조용히`, r2.message === null, r2)
  }
}
{
  for (const v of [null, 'garbage', '1.0']) {
    const s = setup({ version: v })
    const r = checkWrapperVersion({ env: envOf(s), headOf: headIs(B) })
    check(`VERSION ${v === null ? '없음' : JSON.stringify(v)} → 버전 없이 안내`, /^이 세션이 열린 뒤 하네스가 업데이트/.test(r.message || ''), r.message)
  }
}
{
  const s = setup()
  fs.writeFileSync(s.marker, 'toggle')
  const r = checkWrapperVersion({ env: envOf(s), headOf: headIs(B) })
  check('이미 재시작 표시가 있으면 그대로 두고 재시작 안내', r.marked && fs.readFileSync(s.marker, 'utf8') === 'toggle', r)
}

console.log('\n[훅 프로세스]')
function runHook(input, env) {
  const r = spawnSync('node', [HOOK], { input: typeof input === 'string' ? input : JSON.stringify(input), encoding: 'utf8', timeout: 10000, env: { PATH: process.env.PATH, HOME: process.env.HOME, ...env } })
  let j = null; try { j = JSON.parse(r.stdout) } catch { /* 없음 */ }
  return { code: r.status, out: r.stdout.trim(), j }
}
{
  // 실제 git 저장소로 HEAD 비교
  const s = setup()
  const git = (...a) => execFileSync('git', ['-C', s.home, ...a], { encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' } }).trim()
  git('init', '-q'); git('add', 'VERSION'); git('commit', '-qm', 'v')
  const head = git('rev-parse', 'HEAD')
  const same = runHook({ hook_event_name: 'SessionStart', source: 'startup' }, envOf(s, { GUGBAB_WRAPPER_REV: head }))
  check('실제 git: 같은 커밋 → exit 0 · 출력 없음', same.code === 0 && same.out === '', same)
  const diff = runHook({ hook_event_name: 'SessionStart', source: 'resume' }, envOf(s, { GUGBAB_WRAPPER_REV: A }))
  const hs = diff.j && diff.j.hookSpecificOutput
  check('실제 git: 다른 커밋 → exit 0 + SessionStart additionalContext + systemMessage', diff.code === 0 && hs && hs.hookEventName === 'SessionStart' &&
    /\[wrapper-version-check\]/.test(hs.additionalContext) && /\[wrapper-version-check\]/.test(diff.j.systemMessage), diff)
  check('  재시작 표시 생김', fs.existsSync(s.marker))
  for (const [desc, input] of [['SessionStart 아닌 이벤트', { hook_event_name: 'Stop' }], ['깨진 stdin', '{not json'], ['빈 stdin', '']]) {
    const r = runHook(input, envOf(s, { GUGBAB_WRAPPER_REV: B }))
    check(`${desc} → exit 0 · 출력 없음`, r.code === 0 && r.out === '', r)
  }
  const big = runHook({ hook_event_name: 'SessionStart', junk: 'x'.repeat(2 * 1024 * 1024) }, envOf(s, { GUGBAB_WRAPPER_REV: head }))
  check('초대용량 stdin → exit 0 (차단 없음)', big.code === 0, big.code)
}

fs.rmSync(base, { recursive: true, force: true })
console.log(`\n결과: ${passed} 통과 / ${failed} 실패`)
process.exit(failed ? 1 : 0)
