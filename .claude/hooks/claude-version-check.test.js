#!/usr/bin/env node
/**
 * claude-version-check.test.js
 * 실행: node .claude/hooks/claude-version-check.test.js
 *
 * 3계층: 정상(첫 기록은 조용히 저장, 버전 바뀌면 안내, 더 높은 최신이면 안내, 하루 한 번만 조회·캐시로 안내 유지,
 *          실제 훅 프로세스 출력 형식) / 악성·우회(기록 파일 링크·배열·깨진 JSON·초대용량, 버전 문자열에 셸·제어문자·초장문,
 *          레지스트리 HTML·거대 응답·이상한 version, 상태 폴더 위치 조작) / 이상·경계(claude 실행 실패, 오프라인·느린 응답
 *          타임아웃, 상태 폴더 쓰기 불가, 시계가 과거로, SessionStart 아닌 이벤트·깨진 stdin, 4초 상한, 절대 exit 2 없음)
 */
const { spawn } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const http = require('http')
const HOOK = path.join(__dirname, 'claude-version-check.js')
const { checkClaudeVersion, readClaudeVersionState, parseVersion, cmpVer } = require('./claude-version-check.js')

let passed = 0, failed = 0
const check = (desc, cond, detail) => {
  console.log(`  ${cond ? '✅' : '❌'} ${desc}${cond ? '' : ` → FAIL ${detail !== undefined ? JSON.stringify(detail).slice(0, 400) : ''}`}`)
  cond ? passed++ : failed++
}
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'cvc-'))
let n = 0
const dir = () => { const d = path.join(base, `s${++n}`); fs.mkdirSync(d, { recursive: true }); return d }
const exec = (v) => () => `${v} (Claude Code)\n`
const fetchOf = (v) => async () => v
const DAY = 24 * 60 * 60 * 1000
const T0 = Date.parse('2026-10-17T00:00:00Z')

// 가짜 claude 실행 파일
function fakeClaude(out, code = 0) {
  const f = path.join(base, `claude-${++n}.sh`)
  fs.writeFileSync(f, `#!/bin/sh\nprintf '%s\\n' '${out.replace(/'/g, "'\\''")}'\nexit ${code}\n`)
  fs.chmodSync(f, 0o755)
  return f
}
// 훅 프로세스 실행 (비동기 — 같은 프로세스의 로컬 http 서버가 응답할 수 있게)
function runHook(input, env = {}) {
  return new Promise((resolve) => {
    const started = Date.now()
    const p = spawn('node', [HOOK], { env: { ...process.env, ...env } })
    let out = '', err = ''
    p.stdout.on('data', (d) => { out += d }); p.stderr.on('data', (d) => { err += d })
    const killer = setTimeout(() => p.kill('SIGKILL'), 10000)
    p.on('close', (code) => {
      clearTimeout(killer)
      let ctx = null, ev = null
      try { const j = JSON.parse(out); ctx = j.hookSpecificOutput.additionalContext; ev = j.hookSpecificOutput.hookEventName } catch { /* 없음 */ }
      resolve({ code, ctx, ev, out: out.trim(), err, ms: Date.now() - started })
    })
    p.stdin.end(typeof input === 'string' ? input : JSON.stringify(input))
  })
}
function server(handler) {
  return new Promise((resolve) => {
    const s = http.createServer(handler)
    s.listen(0, '127.0.0.1', () => resolve({ s, url: `http://127.0.0.1:${s.address().port}/latest` }))
  })
}

;(async () => {
  console.log('\n[정상] 모듈 — 기록·변경 안내·최신 안내·하루 한 번 조회')
  {
    const d = dir()
    let r = await checkClaudeVersion({ stateDir: d, now: T0, exec: exec('2.1.296'), fetchLatest: fetchOf('2.1.296') })
    check('첫 실행: 안내 없음, 지금 버전 기록', r.messages.length === 0 && r.current === '2.1.296' && readClaudeVersionState(d).lastSeen === '2.1.296', r)
    r = await checkClaudeVersion({ stateDir: d, now: T0 + 1000, exec: exec('2.1.300'), fetchLatest: async () => { throw new Error('하루 안에는 조회하면 안 됨') } })
    check('버전이 바뀌면 "A → B" 안내 + doctor 안내', r.changed && /2\.1\.296 → 2\.1\.300/.test(r.messages[0]) && /gugbab-claude doctor/.test(r.messages[0]), r)
    check('하루 안에는 레지스트리를 다시 조회하지 않음(예외 없이 통과)', r.current === '2.1.300', r)
    r = await checkClaudeVersion({ stateDir: d, now: T0 + 2000, exec: exec('2.1.300'), fetchLatest: fetchOf('9.9.9') })
    check('같은 버전이면 변경 안내 없음', !r.changed && r.messages.length === 0, r)
  }
  {
    const d = dir()
    let calls = 0
    const f = async () => { calls++; return '2.2.0' }
    let r = await checkClaudeVersion({ stateDir: d, now: T0, exec: exec('2.1.296'), fetchLatest: f })
    check('더 높은 최신이 있으면 claude update 안내', r.newer && /새 버전 2\.2\.0 .*지금 2\.1\.296.*claude update/.test(r.messages.join('\n')), r)
    r = await checkClaudeVersion({ stateDir: d, now: T0 + 3 * 60 * 60 * 1000, exec: exec('2.1.296'), fetchLatest: f })
    check('같은 날엔 캐시된 최신으로 안내 계속, 조회는 1번만', r.newer && calls === 1, { calls, r })
    r = await checkClaudeVersion({ stateDir: d, now: T0 + DAY + 1, exec: exec('2.1.296'), fetchLatest: f })
    check('하루가 지나면 다시 조회', calls === 2, calls)
    const st = readClaudeVersionState(d)
    check('readClaudeVersionState summary 에 최신 있음 표시', /Claude Code 2\.1\.296 \(최신 2\.2\.0 있음/.test(st.summary), st)
    r = await checkClaudeVersion({ stateDir: d, now: T0 + DAY + 2, exec: exec('2.2.0'), fetchLatest: f })
    check('업데이트해서 최신과 같아지면 최신 안내는 없음', !r.newer && r.changed, r)
    check('summary "(최신)"', /\(최신\)$/.test(readClaudeVersionState(d).summary), readClaudeVersionState(d))
  }
  check('parseVersion 정상', parseVersion('2.1.296 (Claude Code)') === '2.1.296' && parseVersion('2.1.296') === '2.1.296')
  check('cmpVer 숫자 비교(2.10.0 > 2.9.9)', cmpVer('2.10.0', '2.9.9') > 0 && cmpVer('1.0.0', '1.0.0') === 0)

  console.log('\n[정상] 훅 프로세스 — 가짜 claude + 로컬 레지스트리')
  {
    const { s, url } = await server((req, res) => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ version: '2.3.0' })) })
    const d = dir()
    const env = { GUGBAB_STATE_DIR: d, GUGBAB_CLAUDE_BIN: fakeClaude('2.1.296 (Claude Code)'), GUGBAB_TEST_NPM_LATEST_URL: url }
    let r = await runHook({ hook_event_name: 'SessionStart', source: 'startup' }, env)
    check('SessionStart: exit 0 + hookSpecificOutput(SessionStart) 로 최신 안내', r.code === 0 && r.ev === 'SessionStart' && /\[claude-version-check\].*새 버전 2\.3\.0/.test(r.ctx), r)
    fs.writeFileSync(path.join(d, 'claude-version.json'), JSON.stringify({ lastSeen: '2.0.0', latest: '2.3.0', latestCheckedAt: Date.now() }))
    r = await runHook({ hook_event_name: 'SessionStart' }, env)
    check('기록이 옛 버전이면 변경 안내', /2\.0\.0 → 2\.1\.296/.test(r.ctx || ''), r)
    s.close()
  }

  console.log('\n[악성] 기록 파일·버전 문자열·응답 조작')
  {
    const d = dir()
    const outside = path.join(base, 'outside.json')
    fs.writeFileSync(outside, JSON.stringify({ lastSeen: '1.0.0' }))
    fs.symlinkSync(outside, path.join(d, 'claude-version.json'))
    const r = await checkClaudeVersion({ stateDir: d, now: T0, exec: exec('2.1.296'), fetchLatest: fetchOf(null) })
    check('기록 파일이 링크면 읽지 않음(변경 안내 없음)', !r.changed, r)
    check('링크를 덮어쓰지 않음(밖 파일 그대로)', JSON.parse(fs.readFileSync(outside, 'utf8')).lastSeen === '1.0.0')
  }
  for (const [name, content] of [['배열', '[1,2]'], ['깨진 JSON', '{broken'], ['초대용량', JSON.stringify({ lastSeen: '1.0.0', pad: 'x'.repeat(200000) })], ['이상한 lastSeen', JSON.stringify({ lastSeen: '1.0.0; rm -rf ~', latest: '<script>' })]]) {
    const d = dir()
    fs.writeFileSync(path.join(d, 'claude-version.json'), content)
    const r = await checkClaudeVersion({ stateDir: d, now: T0, exec: exec('2.1.296'), fetchLatest: fetchOf(null) })
    check(`기록 파일 ${name} → 무시하고 정상 기록`, !r.changed && readClaudeVersionState(d).lastSeen === '2.1.296', r)
  }
  for (const [name, out] of [['셸 문자', '$(touch /tmp/pwn) (Claude Code)'], ['제어문자', '\u001b[2J2.1.296'], ['초장문', '2.1.296 ' + 'x'.repeat(500)], ['프리릴리스', '2.1.296-beta.1'], ['빈 출력', '']]) {
    const d = dir()
    const r = await checkClaudeVersion({ stateDir: d, now: T0, exec: () => out, fetchLatest: fetchOf('9.9.9') })
    check(`claude --version 출력이 ${name} → 조용히 끝(기록 안 함)`, r.current === null && r.messages.length === 0 && !fs.existsSync(path.join(d, 'claude-version.json')), r)
  }
  for (const [name, v] of [['HTML 문자열', '<html>'], ['프리릴리스', '3.0.0-rc.1'], ['숫자 아님', 'latest'], ['객체', { a: 1 }]]) {
    const d = dir()
    const r = await checkClaudeVersion({ stateDir: d, now: T0, exec: exec('2.1.296'), fetchLatest: fetchOf(v) })
    check(`레지스트리 version 이 ${name} → 최신 안내 없음`, !r.newer && r.latest === null, r)
  }
  {
    const big = await server((req, res) => { res.setHeader('content-type', 'application/json'); res.write('{"version":"9.9.9","pad":"'); for (let i = 0; i < 1200; i++) res.write('x'.repeat(1024)); res.end('"}') })
    const html = await server((req, res) => { res.statusCode = 200; res.end('<html>not json</html>') })
    for (const [name, srv] of [['1MB 초과 응답', big], ['HTML 응답', html]]) {
      const d = dir()
      const r = await runHook({ hook_event_name: 'SessionStart' }, { GUGBAB_STATE_DIR: d, GUGBAB_CLAUDE_BIN: fakeClaude('2.1.296 (Claude Code)'), GUGBAB_TEST_NPM_LATEST_URL: srv.url })
      check(`훅: ${name} → exit 0, 최신 안내 없음`, r.code === 0 && !r.ctx, r)
    }
    big.s.close(); html.s.close()
  }
  {
    const d = dir()
    const r = await runHook({ hook_event_name: 'SessionStart' }, { GUGBAB_STATE_DIR: 'relative/dir', GUGBAB_CLAUDE_BIN: fakeClaude('2.1.296 (Claude Code)'), GUGBAB_TEST_NPM_LATEST_URL: 'http://127.0.0.1:1/x' })
    check('상태 폴더가 상대경로면 쓰지 않고 기본 위치 사용(현재 폴더에 파일 안 만듦)', r.code === 0 && !fs.existsSync(path.join(process.cwd(), 'relative')), r)
    void d
  }

  console.log('\n[경계] 실패·오프라인·타임아웃·시계·이벤트')
  {
    const d = dir()
    const r = await checkClaudeVersion({ stateDir: d, now: T0, exec: () => { throw new Error('claude 없음') }, fetchLatest: fetchOf('9.9.9') })
    check('claude 실행 실패 → 조용히 끝', r.current === null && r.messages.length === 0, r)
  }
  {
    const d = dir()
    let calls = 0
    await checkClaudeVersion({ stateDir: d, now: T0, exec: exec('2.1.296'), fetchLatest: async () => { calls++; return null } })
    await checkClaudeVersion({ stateDir: d, now: T0 + 1000, exec: exec('2.1.296'), fetchLatest: async () => { calls++; return null } })
    check('오프라인(조회 실패)이어도 같은 날 다시 조회하지 않음 — 매 세션 지연 방지', calls === 1, calls)
    const r = await checkClaudeVersion({ stateDir: d, now: T0 - DAY, exec: exec('2.1.296'), fetchLatest: async () => { calls++; return '2.5.0' } })
    check('시계가 과거로 가면(now < 기록 시각) 다시 조회', calls === 2 && r.newer, { calls, r })
  }
  {
    const slow = await server((req, res) => { setTimeout(() => { try { res.end(JSON.stringify({ version: '9.9.9' })) } catch { /* 닫힘 */ } }, 8000) })
    const d = dir()
    const r = await runHook({ hook_event_name: 'SessionStart' }, { GUGBAB_STATE_DIR: d, GUGBAB_CLAUDE_BIN: fakeClaude('2.1.296 (Claude Code)'), GUGBAB_TEST_NPM_LATEST_URL: slow.url })
    check('느린 레지스트리 → 4초 안에 exit 0, 안내 없음', r.code === 0 && r.ms < 4500 && !r.ctx, { ms: r.ms, ctx: r.ctx })
    slow.s.closeAllConnections && slow.s.closeAllConnections(); slow.s.close()
  }
  {
    const ro = dir()
    fs.chmodSync(ro, 0o500)
    const r = await checkClaudeVersion({ stateDir: path.join(ro, 'sub'), now: T0, exec: exec('2.1.296'), fetchLatest: fetchOf('2.2.0') })
    check('상태 폴더 쓰기 불가 → 예외 없이 결과만 돌려줌', r.current === '2.1.296' && r.newer, r)
    fs.chmodSync(ro, 0o700)
  }
  {
    const env = { GUGBAB_STATE_DIR: dir(), GUGBAB_CLAUDE_BIN: fakeClaude('2.1.296 (Claude Code)'), GUGBAB_TEST_NPM_LATEST_URL: 'http://127.0.0.1:1/x' }
    let r = await runHook({ hook_event_name: 'UserPromptSubmit', prompt: 'x' }, env)
    check('SessionStart 아닌 이벤트 → 출력 없음 exit 0', r.code === 0 && r.out === '', r)
    r = await runHook('{broken', env)
    check('깨진 stdin → exit 0', r.code === 0 && r.out === '', r)
    r = await runHook({ hook_event_name: 'SessionStart' }, { ...env, GUGBAB_CLAUDE_BIN: fakeClaude('x', 1) })
    check('claude 가 실패 종료 → exit 0 출력 없음', r.code === 0 && r.out === '', r)
  }

  console.log(`\n결과: ${passed} 통과 / ${failed} 실패`)
  try { fs.rmSync(base, { recursive: true, force: true }) } catch { /* 무시 */ }
  process.exit(failed ? 1 : 0)
})()
