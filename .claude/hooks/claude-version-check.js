#!/usr/bin/env node
/**
 * claude-version-check.js — SessionStart·UserPromptSubmit: Claude Code 버전 확인 + 자동 업데이트 (비차단)
 *
 *   ① 지난 세션 이후 Claude Code 버전이 바뀌었으면 알린다 — 래퍼(gugbab-claude)는 문서에 없는 내부 변수
 *      CLAUDE_SECURESTORAGE_CONFIG_DIR 로 로그인을 공유하므로, 버전이 바뀐 날 "Not logged in" 을 바로 의심할 수 있게
 *   ② npm 레지스트리의 최신 버전을 하루에 한 번만(3초 제한) 확인해 더 높으면 `claude update` 를 뒤에서 실행한다(2026-11-11).
 *      실패·오프라인·이상 응답은 조용히 건너뛰고, 조회 결과는 캐시해 같은 날 다시 조회하지 않는다.
 *      DISABLE_UPDATES·DISABLE_AUTOUPDATER·윈도우·Homebrew 면 실행하지 않고 알리기만. 같은 목표 버전은 24시간에 한 번만 시도,
 *      잠금(claude-update.lock, 30분)으로 동시 실행 방지. 결과(claude-update.json)는 다음 SessionStart·질문 때 한 번 알림
 *   ③ UserPromptSubmit — 켜 둔 세션은 기록만 읽고, 마지막 확인에서 24시간이 지났으면 확인·업데이트를 뒤에서 띄움(질문은 기다리지 않음)
 *
 *   기록: <상태 폴더>/claude-version.json  { lastSeen, latest, latestCheckedAt }
 *         상태 폴더 = $GUGBAB_STATE_DIR (래퍼 디스패처가 넘김) 또는 os.tmpdir()/gugbab-claude-state
 *         일반 파일만 읽고 쓴다(링크면 무시·덮어쓰지 않음), 원자적 쓰기(tmp → rename)
 *   출력: hookSpecificOutput.additionalContext (SessionStart). 항상 exit 0
 *   모듈: checkClaudeVersion({ stateDir, now, exec, fetchLatest }) · readClaudeVersionState(stateDir) — status·doctor 가 씀
 *   시험용 환경변수: GUGBAB_CLAUDE_BIN (claude 대신 실행할 파일), GUGBAB_TEST_NPM_LATEST_URL (레지스트리 대신 조회할 http(s) 주소)
 */
'use strict'
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync, execSync } = require('child_process')

const REGISTRY_URL = 'https://registry.npmjs.org/@anthropic-ai/claude-code/latest'
const DAY_MS = 24 * 60 * 60 * 1000
const FETCH_TIMEOUT_MS = 3000
const MAX_BODY = 1024 * 1024
const MAX_STATE = 64 * 1024
const VER_RE = /^\d{1,6}\.\d{1,6}\.\d{1,6}$/

const defaultStateDir = () => process.env.GUGBAB_STATE_DIR && path.isAbsolute(process.env.GUGBAB_STATE_DIR)
  ? process.env.GUGBAB_STATE_DIR : path.join(os.tmpdir(), 'gugbab-claude-state')

// "2.1.296 (Claude Code)" → "2.1.296". 숫자 x.y.z 가 아니면 null
function parseVersion(out) {
  if (typeof out !== 'string' || out.length > 200) return null
  const m = out.trim().match(/^(\d{1,6}\.\d{1,6}\.\d{1,6})(?:\s|$)/)
  return m ? m[1] : null
}
const validVer = (v) => typeof v === 'string' && VER_RE.test(v)
function cmpVer(a, b) {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i]
  return 0
}

function stateFile(stateDir) { return path.join(stateDir, 'claude-version.json') }

function readClaudeVersionState(stateDir = defaultStateDir()) {
  const out = { lastSeen: null, latest: null, latestCheckedAt: 0, summary: null }
  try {
    const f = stateFile(stateDir)
    const st = fs.lstatSync(f)
    if (st.isFile() && st.size <= MAX_STATE) {
      const v = JSON.parse(fs.readFileSync(f, 'utf8'))
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        if (validVer(v.lastSeen)) out.lastSeen = v.lastSeen
        if (validVer(v.latest)) out.latest = v.latest
        if (Number.isFinite(v.latestCheckedAt) && v.latestCheckedAt > 0) out.latestCheckedAt = v.latestCheckedAt
      }
    }
  } catch { /* 없음·깨짐 */ }
  if (out.lastSeen) {
    out.summary = `Claude Code ${out.lastSeen}` + (out.latest && cmpVer(out.latest, out.lastSeen) > 0 ? ` (최신 ${out.latest} 있음 — claude update)` : out.latest ? ' (최신)' : '')
  }
  return out
}

function writeState(stateDir, obj) {
  const f = stateFile(stateDir)
  try { if (!fs.lstatSync(f).isFile()) return false } catch { /* 없음 → 새로 */ }
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    const tmp = `${f}.${process.pid}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(obj) + '\n')
    fs.renameSync(tmp, f)
    return true
  } catch { return false }
}

// 윈도우: npm 전역 설치는 확장자 없는 sh(`claude` — spawn ENOENT)·claude.cmd·claude.ps1, 네이티브 설치는 claude.exe.
// PATHEXT 순서로 실행 가능한 파일(.exe·.com·.cmd·.bat 만 — .js·.vbs 등 스크립트 호스트 실행은 제외)의 절대 경로를 찾는다.
// 경로가 주어지면(GUGBAB_CLAUDE_BIN) 그 파일 또는 그 이름 + 확장자를 본다
const WIN_RUNNABLE = /\.(exe|com|cmd|bat)$/i
function winResolve(name) {
  const isFile = (p) => { try { return fs.statSync(p).isFile() } catch { return false } }
  const exts = (process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD').split(';').filter((e) => WIN_RUNNABLE.test(e))
  const cands = (p) => (WIN_RUNNABLE.test(p) ? [p] : exts.map((e) => p + e))
  if (/[\\/]/.test(name)) return cands(name).find(isFile) || null
  for (const d of String(process.env.PATH || '').split(path.delimiter)) {
    if (!d) continue
    const hit = cands(path.join(d, name)).find(isFile)
    if (hit) return hit
  }
  return null
}

// 윈도우 npm 설치 — claude.cmd 가 부르는 node_modules\@anthropic-ai\claude-code 의 package.json 에서 버전을 바로 읽는다
//   claude.exe --version 은 윈도우에서 수 초~십수 초(2026-10-20 실측 13초 — 백신 검사) 걸려 2.5초 제한에 늘 걸린다
//   이름이 정확히 @anthropic-ai/claude-code 이고 버전이 x.y.z 일 때만 인정 (그 밖이면 null → 실행으로)
function npmPackageVersion(cmdPath) {
  try {
    const pkg = path.join(path.dirname(cmdPath), 'node_modules', '@anthropic-ai', 'claude-code', 'package.json')
    const st = fs.lstatSync(pkg)
    if (!st.isFile() || st.size > 256 * 1024) return null
    const j = JSON.parse(fs.readFileSync(pkg, 'utf8'))
    return j && j.name === '@anthropic-ai/claude-code' && typeof j.version === 'string' && /^\d+\.\d+\.\d+$/.test(j.version) ? `${j.version} (Claude Code)` : null
  } catch { return null }
}

function defaultExec() {
  const bin = process.env.GUGBAB_CLAUDE_BIN || 'claude'
  const opts = { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 2500, maxBuffer: 64 * 1024, windowsHide: true }
  if (process.platform === 'win32') {
    const f = winResolve(bin)
    if (!f) throw new Error('claude 실행 파일 없음')
    if (/\.(cmd|bat)$/i.test(f)) { const v = npmPackageVersion(f); if (v) return v }
    if (/\.(cmd|bat)$/i.test(f)) {
      // .cmd 는 셸 없이 spawn 하면 EINVAL(Node 보안 수정) → cmd 경유. 인자는 고정 상수, 경로는 따옴표로 감싸고 % · " 가 든 경로는 거부(따옴표 안에서도 확장됨)
      if (/["%]/.test(f)) throw new Error('실행할 수 없는 경로')
      return execSync(`"${f}" --version`, opts)
    }
    return execFileSync(f, ['--version'], opts)
  }
  return execFileSync(bin, ['--version'], opts)
}

// 레지스트리 조회 — 실패하면 null (오프라인·타임아웃·이상 응답·초대용량)
function defaultFetchLatest() {
  const url = process.env.GUGBAB_TEST_NPM_LATEST_URL || REGISTRY_URL
  return new Promise((resolve) => {
    let done = false
    const finish = (v) => { if (!done) { done = true; resolve(v) } }
    let mod
    try { mod = url.startsWith('http://') ? require('http') : require('https') } catch { return finish(null) }
    let req
    try {
      req = mod.get(url, { timeout: FETCH_TIMEOUT_MS, headers: { accept: 'application/json' } }, (res) => {
        if (res.statusCode !== 200) { res.resume(); return finish(null) }
        let size = 0; const chunks = []
        res.on('data', (c) => { size += c.length; if (size > MAX_BODY) { req.destroy(); return finish(null) } chunks.push(c) })
        res.on('end', () => {
          try { const v = JSON.parse(Buffer.concat(chunks).toString('utf8')); finish(v && validVer(v.version) ? v.version : null) } catch { finish(null) }
        })
        res.on('error', () => finish(null))
      })
    } catch { return finish(null) }
    req.on('timeout', () => { req.destroy(); finish(null) })
    req.on('error', () => finish(null))
    setTimeout(() => { try { req.destroy() } catch { /* 무시 */ } finish(null) }, FETCH_TIMEOUT_MS + 200).unref()
  })
}

// ── 자동 업데이트 (2026-11-11 사용자 요청: "최신 버전 올라왔다면 최신 버전으로 업데이트") ──
// Claude Code 는 native·npm 설치에서 스스로도 뒤에서 업데이트한다(공식 setup 문서). 이 훅은 그것이 실패했거나 늦을 때를 메우려고
// 새 버전을 보면 `claude update` 를 뒤에서 따로 띄운다(세션은 기다리지 않음). 결과는 claude-update.json 에 남기고 다음 안내 때 한 번 알린다.
// 자동 실행 안 함(알리기만): DISABLE_UPDATES·DISABLE_AUTOUPDATER(사용자가 끈 것), 윈도우(실행 중 exe 잠금 — 구버전으로 뒤바뀐 사고), Homebrew(공식 변수 안내)
const UPDATE_FILE = 'claude-update.json'
const LOCK_FILE = 'claude-update.lock'
const LOCK_STALE_MS = 30 * 60 * 1000
const UPDATE_TIMEOUT_MS = 10 * 60 * 1000
const truthy = (v) => typeof v === 'string' && /^(1|true|yes|on)$/i.test(v.trim())

// PATH 에서 실행 파일의 실제 경로 (맥·리눅스). 못 찾으면 null
function posixResolve(name) {
  const ok = (p) => { try { fs.accessSync(p, fs.constants.X_OK); return fs.statSync(p).isFile() } catch { return false } }
  const real = (p) => { try { return fs.realpathSync(p) } catch { return null } }
  if (name.includes('/')) return ok(name) ? real(name) : null
  for (const d of String(process.env.PATH || '').split(path.delimiter)) {
    if (d && path.isAbsolute(d) && ok(path.join(d, name))) return real(path.join(d, name))
  }
  return null
}

function autoUpdateBlocked({ env = process.env, platform = process.platform, binPath = null } = {}) {
  if (truthy(env.DISABLE_UPDATES)) return 'DISABLE_UPDATES'
  if (truthy(env.DISABLE_AUTOUPDATER)) return 'DISABLE_AUTOUPDATER'
  if (platform === 'win32') return 'windows'
  if (!binPath) return 'no-claude'
  if (/\/(Cellar|Caskroom)\//.test(binPath)) return 'homebrew'
  return null
}

function readJson(f, max = MAX_STATE) {
  try {
    const st = fs.lstatSync(f)
    if (!st.isFile() || st.size > max) return null
    const v = JSON.parse(fs.readFileSync(f, 'utf8'))
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null
  } catch { return null }
}
function writeJson(f, obj) {
  try { if (!fs.lstatSync(f).isFile()) return false } catch { /* 없음 → 새로 */ }
  try {
    fs.mkdirSync(path.dirname(f), { recursive: true })
    const tmp = `${f}.${process.pid}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(obj) + '\n')
    fs.renameSync(tmp, f)
    return true
  } catch { return false }
}
function readUpdateRecord(stateDir) {
  const v = readJson(path.join(stateDir, UPDATE_FILE))
  if (!v || !Number.isFinite(v.at) || !validVer(v.from) || !validVer(v.target)) return null
  return { at: v.at, from: v.from, target: v.target, to: validVer(v.to) ? v.to : null, ok: v.ok === true, out: typeof v.out === 'string' ? v.out.slice(0, 300) : '', bin: typeof v.bin === 'string' ? clean(v.bin).slice(0, 200) : '', reported: v.reported === true }
}

// 잠금 — 세션 여러 개가 동시에 claude update 를 돌리지 않게. 링크·폴더면 잡지 않음, 30분 지난 잠금은 버린 것으로 본다
function acquireLock(stateDir, now) {
  const f = path.join(stateDir, LOCK_FILE)
  try {
    const st = fs.lstatSync(f)
    if (!st.isFile()) return false
    const v = readJson(f, 4096)
    const at = v && Number(v.at)
    if (Number.isFinite(at) && at <= now && now - at < LOCK_STALE_MS) return false
    fs.rmSync(f, { force: true })
  } catch { /* 없음 */ }
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    const fd = fs.openSync(f, 'wx')
    fs.writeSync(fd, JSON.stringify({ at: now, pid: process.pid }))
    fs.closeSync(fd)
    return true
  } catch { return false }
}
function releaseLock(stateDir) { try { const f = path.join(stateDir, LOCK_FILE); if (fs.lstatSync(f).isFile()) fs.rmSync(f, { force: true }) } catch { /* 없음 */ } }

const clean = (s) => String(s || '').replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 300)

function defaultRunUpdateCmd() {
  const bin = process.env.GUGBAB_CLAUDE_BIN || 'claude'
  try {
    return { ok: true, out: execFileSync(bin, ['update'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: UPDATE_TIMEOUT_MS, maxBuffer: 1024 * 1024, windowsHide: true }) }
  } catch (e) { return { ok: false, out: `${e.stdout || ''} ${e.stderr || ''} ${e.code === 'ETIMEDOUT' ? '시간 초과' : e.message || ''}` } }
}

// 뒤에서 도는 실제 업데이트 — node claude-version-check.js --run-update [check]
// check 모드(세션 중 24시간마다): 최신 버전을 다시 조회한 뒤 더 높을 때만 업데이트
async function runUpdate({ stateDir = defaultStateDir(), now = Date.now(), mode = 'update', exec = defaultExec, fetchLatest = defaultFetchLatest, runUpdateCmd = defaultRunUpdateCmd, env = process.env, platform = process.platform, binPath } = {}) {
  let out = ''
  try { out = exec() } catch { return 'no-claude' }
  const from = parseVersion(String(out || ''))
  if (!from) return 'no-version'
  const st = readClaudeVersionState(stateDir)
  let latest = st.latest
  if (mode === 'check') {
    let v = null
    try { v = await fetchLatest() } catch { v = null }
    if (validVer(v)) latest = v
    writeState(stateDir, { lastSeen: st.lastSeen || from, latest: latest || null, latestCheckedAt: now })
  }
  if (!latest || cmpVer(latest, from) <= 0) return 'up-to-date'
  const resolvedBin = binPath === undefined ? (platform === 'win32' ? null : posixResolve(env.GUGBAB_CLAUDE_BIN || 'claude')) : binPath
  const blocked = autoUpdateBlocked({ env, platform, binPath: resolvedBin })
  if (blocked) return `blocked:${blocked}`
  if (!acquireLock(stateDir, now)) return 'locked'
  // 2026-11-12: 실패 원인을 바로 알 수 있게 실제로 쓴 실행 파일 경로를 기록한다 (시험의 가짜 claude 가 실제 기록을 더럽힌 사례)
  const binUsed = resolvedBin || (env.GUGBAB_CLAUDE_BIN || 'claude')
  try {
    const r = runUpdateCmd()
    let to = null
    try { to = parseVersion(String(exec() || '')) } catch { to = null }
    const ok = !!(r && r.ok) && !!to && cmpVer(to, from) > 0
    writeJson(path.join(stateDir, UPDATE_FILE), { at: now, from, target: latest, to, ok, out: clean(r && r.out), bin: clean(binUsed).slice(0, 200), reported: false })
    return ok ? 'updated' : 'failed'
  } finally { releaseLock(stateDir) }
}

function defaultSpawnRunner(stateDir, mode) {
  const { spawn } = require('child_process')
  const child = spawn(process.execPath, [__filename, '--run-update', mode], { env: { ...process.env, GUGBAB_STATE_DIR: stateDir }, detached: true, stdio: 'ignore', windowsHide: true })
  child.on('error', () => {})
  child.unref()
}

// 지난 자동 업데이트 결과를 한 번만 알린다 (알린 뒤 reported 표시)
function takeUpdateReport(stateDir) {
  const rec = readUpdateRecord(stateDir)
  if (!rec || rec.reported) return null
  writeJson(path.join(stateDir, UPDATE_FILE), { ...rec, reported: true })
  return rec.ok
    ? `Claude Code 를 ${rec.from} → ${rec.to} 로 자동 업데이트했습니다(하네스 claude-version-check). 새로 시작하는 세션부터 반영됩니다 — 지금 세션은 \`/exit\` 후 다시 실행하면 됩니다.`
    : `Claude Code 자동 업데이트(${rec.from} → ${rec.target})가 실패했습니다${rec.out ? `: ${rec.out}` : ''}${rec.bin ? ` (실행 파일: ${rec.bin})` : ''}. 터미널에서 \`claude update\` 를 직접 실행해 보세요(npm 설치면 \`npm install -g @anthropic-ai/claude-code@latest\`, 권한·인증서 오류면 \`claude doctor\`).`
}

function blockedHint(reason) {
  if (reason === 'homebrew') return ' Homebrew 설치는 `brew upgrade claude-code` 로 올리거나, 공식 변수 `CLAUDE_CODE_PACKAGE_MANAGER_AUTO_UPDATE=1` 을 켜면 Claude Code 가 직접 올립니다.'
  if (reason === 'DISABLE_UPDATES' || reason === 'DISABLE_AUTOUPDATER') return ` 업데이트를 꺼 두셔서(${reason}) 자동으로 실행하지 않았습니다.`
  if (reason === 'windows') return ' 윈도우는 실행 중 파일 잠금 때문에 자동으로 실행하지 않습니다.'
  return ''
}

async function checkClaudeVersion({ stateDir = defaultStateDir(), now = Date.now(), exec = defaultExec, fetchLatest = defaultFetchLatest, autoUpdate = false, spawnRunner = defaultSpawnRunner, env = process.env, platform = process.platform, binPath } = {}) {
  const res = { current: null, latest: null, lastSeen: null, changed: false, newer: false, spawned: false, messages: [] }
  let out = ''
  try { out = exec() } catch { return res }
  const current = parseVersion(String(out || ''))
  if (!current) return res
  res.current = current
  const prev = readClaudeVersionState(stateDir)
  res.lastSeen = prev.lastSeen
  let latest = prev.latest
  let checkedAt = prev.latestCheckedAt
  // 하루가 지났거나, 시계가 과거로 갔으면(now < checkedAt) 다시 조회
  if (!checkedAt || now - checkedAt >= DAY_MS || now < checkedAt) {
    let v = null
    try { v = await fetchLatest() } catch { v = null }
    if (validVer(v)) latest = v
    checkedAt = now // 실패해도 오늘은 다시 시도하지 않음 (오프라인에서 매 세션 3초 지연 방지)
  }
  res.latest = latest
  if (prev.lastSeen && prev.lastSeen !== current) {
    res.changed = true
    res.messages.push(`Claude Code 가 ${prev.lastSeen} → ${current} 로 바뀌었습니다. 래퍼는 문서에 없는 내부 변수(CLAUDE_SECURESTORAGE_CONFIG_DIR)로 로그인을 공유하므로 "Not logged in" 이면 \`gugbab-claude doctor\` 로 확인하세요.`)
  }
  // 기록을 먼저 남긴다 — 뒤에서 띄우는 업데이트 프로세스가 이 latest 를 읽는다
  writeState(stateDir, { lastSeen: current, latest: latest || null, latestCheckedAt: checkedAt })
  if (autoUpdate) { const rep = takeUpdateReport(stateDir); if (rep) res.messages.push(rep) }
  if (latest && cmpVer(latest, current) > 0) {
    res.newer = true
    const blocked = autoUpdate ? autoUpdateBlocked({ env, platform, binPath: binPath === undefined ? (platform === 'win32' ? null : posixResolve(env.GUGBAB_CLAUDE_BIN || 'claude')) : binPath }) : 'off'
    const last = readUpdateRecord(stateDir)
    // 같은 목표 버전을 24시간 안에 이미 시도했으면 다시 띄우지 않는다(실패 반복 방지 — 결과는 위에서 이미 알림)
    const triedRecently = last && last.target === latest && last.at <= now && now - last.at < DAY_MS
    if (!blocked && !triedRecently) {
      try { spawnRunner(stateDir, 'update'); res.spawned = true } catch { res.spawned = false }
    }
    if (res.spawned) res.messages.push(`Claude Code 새 버전 ${latest} 이 있어 (지금 ${current}) 뒤에서 \`claude update\` 를 실행했습니다 — 끝나면 새로 시작하는 세션부터 반영되고, 결과는 다음 안내 때 알립니다.`)
    else if (!triedRecently) res.messages.push(`Claude Code 새 버전 ${latest} 이 있습니다 (지금 ${current}) — \`claude update\` 로 올릴 수 있습니다.${autoUpdate ? blockedHint(blocked) : ''}`)
  }
  return res
}

// 세션 중(UserPromptSubmit): 기록만 읽어 빠르게 — 지난 결과를 알리고, 마지막 확인에서 24시간이 지났으면 확인·업데이트를 뒤에서 띄운다
function maybeSessionCheck({ stateDir = defaultStateDir(), now = Date.now(), spawnRunner = defaultSpawnRunner, env = process.env, platform = process.platform } = {}) {
  const messages = []
  const rep = takeUpdateReport(stateDir)
  if (rep) messages.push(rep)
  const st = readClaudeVersionState(stateDir)
  const fresh = st.latestCheckedAt && st.latestCheckedAt <= now && now - st.latestCheckedAt < DAY_MS
  let spawned = false
  if (!fresh && !truthy(env.DISABLE_UPDATES) && !truthy(env.DISABLE_AUTOUPDATER) && platform !== 'win32') {
    // 먼저 확인 시각을 남겨 같은 세션의 다음 질문이 또 띄우지 않게 (실제 조회·업데이트는 뒤에서)
    writeState(stateDir, { lastSeen: st.lastSeen, latest: st.latest, latestCheckedAt: now })
    try { spawnRunner(stateDir, 'check'); spawned = true } catch { spawned = false }
  }
  return { messages, spawned }
}

module.exports = { checkClaudeVersion, readClaudeVersionState, parseVersion, cmpVer, REGISTRY_URL, winResolve, npmPackageVersion, runUpdate, maybeSessionCheck, autoUpdateBlocked, acquireLock, readUpdateRecord, takeUpdateReport }

if (require.main === module && process.argv[2] === '--run-update') {
  // 뒤에서 도는 업데이트 프로세스 — 훅이 detached 로 띄운다. 출력·종료 코드는 아무도 보지 않으니 결과는 기록 파일로만
  const mode = process.argv[3] === 'check' ? 'check' : 'update'
  runUpdate({ mode }).catch(() => {}).finally(() => process.exit(0))
} else if (require.main === module) {
  const hardStop = setTimeout(() => process.exit(0), 4000) // SessionStart 지연 상한
  hardStop.unref()
  let raw = ''
  try { raw = fs.readFileSync(0, 'utf8') } catch { process.exit(0) }
  let input
  try { input = JSON.parse(raw) } catch { process.exit(0) }
  const event = input && (input.hook_event_name || input.hookEventName)
  if (event === 'UserPromptSubmit') {
    let r = { messages: [] }
    try { r = maybeSessionCheck() } catch { /* 무시 */ }
    if (r.messages.length) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: `[claude-version-check] ${r.messages.join('\n')}` } }) + '\n')
    process.exit(0)
  }
  if (event !== 'SessionStart') process.exit(0)
  checkClaudeVersion({ autoUpdate: true }).then((r) => {
    if (r.messages.length) {
      const text = `[claude-version-check] ${r.messages.join('\n')}`
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text } }) + '\n')
    }
    process.exit(0)
  }).catch(() => process.exit(0))
}
