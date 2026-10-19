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

// ── ⓪ 버전 안내 (state/last-check.json) ──
const L = '12345-1792370048'
const recFile = (s) => path.join(s.home, 'state', 'last-check.json')
function writeRec(s, rec) { fs.mkdirSync(path.join(s.home, 'state'), { recursive: true }); fs.writeFileSync(recFile(s), typeof rec === 'string' ? rec : JSON.stringify(rec)) }
const readRec = (s) => JSON.parse(fs.readFileSync(recFile(s), 'utf8'))
const NOW = Date.parse('2026-10-19T01:10:00Z')
const notice = (s, extra = {}, opts = {}) => checkWrapperVersion({ env: envOf(s, { GUGBAB_LAUNCH: L, ...extra }), headOf: headIs(A), now: NOW, ...opts }).notice

console.log('\n[버전 안내 — 정상]')
{
  const s = setup()
  writeRec(s, { launch: L, at: NOW, result: 'updated', from: 'v1.0.4', to: 'v1.0.5' })
  check('이번 실행에 갱신됨 → "v1.0.4 → v1.0.5 로 업데이트"', notice(s) === '하네스 v1.0.4 → v1.0.5 로 업데이트됐습니다', notice)
  check('  한 번 보여 주면 shown 표시', readRec(s).shown === true)
  check('  같은 실행에서 다시(/clear·재시작) → 반복하지 않음', notice(s, {}, { source: 'clear' }) === null && notice(s, {}, { source: 'resume' }) === null)
}
{
  const s = setup()
  writeRec(s, { launch: L, at: NOW, result: 'up-to-date' })
  check('최신 확인 → "v1.0.5 — 최신입니다"', notice(s) === '하네스 v1.0.5 — 최신입니다 (방금 확인)')
}
{
  const s = setup()
  const last = NOW - 30 * 60 * 1000
  writeRec(s, { launch: L, at: NOW, result: 'recent', lastCheckAt: last })
  const n = notice(s)
  const d = new Date(last), hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  check('1시간 안 → 건너뜀 + 마지막 확인 시각 + update 안내', n && n.includes(`마지막 확인 ${hm}`) && /gugbab-claude update/.test(n) && n.startsWith('하네스 v1.0.5'), n)
}
{
  const s = setup()
  for (const [result, re] of [['fetch-failed', /연결 못 함/], ['pinned', /버전 고정/], ['local-changes', /로컬 변경/], ['not-ff', /원격 이력/], ['failed', /오류/], ['error', /오류/], ['no-tag', /확인하지 못했습니다 \(no-tag/]]) {
    writeRec(s, { launch: L, at: NOW, result })
    const n = notice(s)
    check(`결과 ${result} → 지금 버전 + 사유`, n && n.startsWith('하네스 v1.0.5') && re.test(n), n)
  }
}
{
  const s = setup()
  writeRec(s, { launch: L, at: NOW, result: 'updated', from: 'main abc1234', to: 'main def5678' })
  check('main 채널 표기(공백 포함 라벨)도 그대로', notice(s) === '하네스 main abc1234 → main def5678 로 업데이트됐습니다', notice(s))
}
{
  const s = setup()
  check('기록 없음 + 새 세션 → 지금 버전만', notice(s) === '하네스 v1.0.5')
  check('기록 없음 + /clear·compact → 조용히', notice(s, {}, { source: 'clear' }) === null && notice(s, {}, { source: 'compact' }) === null)
  const data = path.join(s.d, 'data'); fs.mkdirSync(path.join(data, 'state'), { recursive: true })
  fs.writeFileSync(path.join(data, 'state', 'last-check.json'), JSON.stringify({ launch: L, at: NOW, result: 'up-to-date' }))
  check('데이터 폴더를 따로 두면(GUGBAB_DATA) 거기 기록을 읽음', notice(s, { GUGBAB_DATA: data }) === '하네스 v1.0.5 — 최신입니다 (방금 확인)')
}
{
  const s = setup()
  writeRec(s, { launch: L, at: NOW, result: 'updated', from: 'v1.0.4', to: 'v1.0.5' })
  const r = checkWrapperVersion({ env: envOf(s, { GUGBAB_LAUNCH: L }), headOf: headIs(B), now: NOW })
  check('버전 안내와 세션 도중 업데이트 안내가 함께 나옴', r.notice && r.kind === 'updated-during-session' && r.message, r)
  const s2 = setup()
  const r2 = checkWrapperVersion({ env: envOf(s2), headOf: () => { throw new Error('git 없음') }, now: NOW })
  check('git 실패여도 버전 안내는 나옴', r2.notice === '하네스 v1.0.5' && r2.message === null, r2)
}

console.log('\n[버전 안내 — 악성·우회]')
{
  const s = setup()
  writeRec(s, { launch: '99999-1792370048', at: NOW, result: 'updated', from: 'v1.0.4', to: 'v1.0.5' })
  check('다른 실행(다른 세션)의 기록 → 남의 업데이트 안내를 가져오지 않고 버전만', notice(s) === '하네스 v1.0.5' && readRec(s).shown === undefined, notice(s))
}
{
  const s = setup()
  writeRec(s, { launch: L, at: NOW, result: 'updated', from: 'v1.0.4', to: 'v1.0.5' })
  for (const launch of ['$(touch /tmp/wvc-launch-pwned)', `${L}\n`, '1'.repeat(30), '', '12345-abc', '../12345-1']) {
    check(`조작된 GUGBAB_LAUNCH(${JSON.stringify(launch.slice(0, 20))}) → 기록 무시`, notice(s, { GUGBAB_LAUNCH: launch }) === '하네스 v1.0.5')
  }
  check('  기록은 그대로 (shown 안 붙음)', readRec(s).shown === undefined)
  check('  셸 문자가 실행되지 않음', !fs.existsSync('/tmp/wvc-launch-pwned'))
}
{
  const s = setup()
  for (const [desc, from] of [['제어문자', 'v1.0.4\u001b[2J'], ['줄바꿈', 'v1\nrm -rf ~'], ['초장문', 'v'.repeat(500)], ['셸 문자', '$(id)'], ['객체', { x: 1 }]]) {
    writeRec(s, { launch: L, at: NOW, result: 'updated', from, to: 'v1.0.5' })
    const n = notice(s)
    check(`조작된 버전 라벨(${desc}) → 그 값을 출력하지 않고 지금 버전으로`, n === '하네스가 v1.0.5 로 업데이트됐습니다', n)
  }
}
{
  const s = setup()
  writeRec(s, { launch: L, at: NOW, result: 'rm -rf' })
  check('모르는 결과 값 → 기록 무시, 버전만', notice(s) === '하네스 v1.0.5')
}
{
  const s = setup()
  const victim = path.join(s.d, 'victim.json'); fs.writeFileSync(victim, JSON.stringify({ launch: L, at: NOW, result: 'up-to-date' }))
  fs.mkdirSync(path.join(s.home, 'state'), { recursive: true }); fs.symlinkSync(victim, recFile(s))
  const n = notice(s)
  check('기록 자리에 심은 링크 → 따라가 읽거나 쓰지 않음', n === '하네스 v1.0.5' && !JSON.parse(fs.readFileSync(victim, 'utf8')).shown && fs.lstatSync(recFile(s)).isSymbolicLink(), n)
}
{
  const s = setup()
  writeRec(s, { launch: L, at: NOW, result: 'up-to-date' })
  for (const data of ['relative/data', '']) {
    check(`상대·빈 GUGBAB_DATA(${JSON.stringify(data)}) → 하네스 폴더 기록 사용`, notice(s, { GUGBAB_DATA: data }) === '하네스 v1.0.5 — 최신입니다 (방금 확인)')
    writeRec(s, { launch: L, at: NOW, result: 'up-to-date' })
  }
}

console.log('\n[버전 안내 — 이상·경계]')
{
  const s = setup()
  for (const [desc, body] of [['깨진 JSON', '{not json'], ['배열', '[1,2]'], ['null', 'null'], ['빈 파일', ''], ['초대용량', JSON.stringify({ launch: L, result: 'up-to-date', junk: 'x'.repeat(10000) })]]) {
    writeRec(s, body)
    check(`기록이 ${desc} → 죽지 않고 버전만`, notice(s) === '하네스 v1.0.5', notice(s))
  }
}
{
  const s = setup()
  for (const lastCheckAt of [NOW + 3600 * 1000, -5, 'abc', null]) {
    writeRec(s, { launch: L, at: NOW, result: 'recent', lastCheckAt })
    const n = notice(s)
    check(`마지막 확인 시각 이상(${JSON.stringify(lastCheckAt)}) → 시각 없이 안내`, n && !/마지막 확인/.test(n) && /1시간마다/.test(n), n)
  }
}
{
  const s = setup({ version: null })
  writeRec(s, { launch: L, at: NOW, result: 'up-to-date' })
  check('VERSION 없음 → "(버전 모름)" 으로 안내', notice(s) === '하네스 (버전 모름) — 최신입니다 (방금 확인)', notice(s))
  const s2 = setup({ version: null })
  check('VERSION 없음 + 기록 없음 → 조용히', notice(s2) === null)
}
{
  const s = setup()
  writeRec(s, { launch: L, at: NOW, result: 'up-to-date' })
  for (const dev of ['1', undefined]) {
    const env = envOf(s, { GUGBAB_LAUNCH: L, GUGBAB_DEV: dev }); if (dev === undefined) delete env.GUGBAB_DEV
    check(`개발 모드·래퍼 밖(GUGBAB_DEV=${JSON.stringify(dev)}) → 버전 안내도 없음`, checkWrapperVersion({ env, headOf: headIs(A), now: NOW }).notice === null)
  }
  check('  기록은 그대로', readRec(s).shown === undefined)
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
  check('실제 git: 같은 커밋 → exit 0 · 래퍼 안내 없이 버전만 화면에', same.code === 0 && same.j && same.j.systemMessage === '[gugbab] 하네스 v1.0.5' &&
    !/wrapper-version-check/.test(same.out) && !/사용자에게 한 번 알려/.test(same.j.hookSpecificOutput.additionalContext), same)
  writeRec(s, { launch: L, at: Date.now(), result: 'updated', from: 'v1.0.4', to: 'v1.0.5' })
  const upd = runHook({ hook_event_name: 'SessionStart', source: 'startup' }, envOf(s, { GUGBAB_WRAPPER_REV: head, GUGBAB_LAUNCH: L }))
  check('실제 훅: 이번 실행에 갱신됨 → 화면에 "[gugbab] 하네스 v1.0.4 → v1.0.5 로 업데이트됐습니다"', upd.code === 0 && upd.j && upd.j.systemMessage === '[gugbab] 하네스 v1.0.4 → v1.0.5 로 업데이트됐습니다', upd)
  const again = runHook({ hook_event_name: 'SessionStart', source: 'resume' }, envOf(s, { GUGBAB_WRAPPER_REV: head, GUGBAB_LAUNCH: L }))
  check('실제 훅: 같은 실행의 재시작(resume) → 다시 보여 주지 않음', again.code === 0 && again.out === '', again)
  const cleared = runHook({ hook_event_name: 'SessionStart', source: 'clear' }, envOf(s, { GUGBAB_WRAPPER_REV: head }))
  check('실제 git: /clear(같은 커밋) → exit 0 · 출력 없음', cleared.code === 0 && cleared.out === '', cleared)
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
