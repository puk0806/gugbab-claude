#!/usr/bin/env node
/**
 * claude-version-check.js — SessionStart: Claude Code 버전 확인 (비차단, 안내만)
 *
 *   ① 지난 세션 이후 Claude Code 버전이 바뀌었으면 알린다 — 래퍼(gugbab-claude)는 문서에 없는 내부 변수
 *      CLAUDE_SECURESTORAGE_CONFIG_DIR 로 로그인을 공유하므로, 버전이 바뀐 날 "Not logged in" 을 바로 의심할 수 있게
 *   ② npm 레지스트리의 최신 버전을 하루에 한 번만(3초 제한) 확인해 더 높으면 `claude update` 를 알린다.
 *      실패·오프라인·이상 응답은 조용히 건너뛰고, 조회 결과는 캐시해 같은 날 다시 조회하지 않는다
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
const { execFileSync } = require('child_process')

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

function defaultExec() {
  const bin = process.env.GUGBAB_CLAUDE_BIN || 'claude'
  return execFileSync(bin, ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 2500, maxBuffer: 64 * 1024 })
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

async function checkClaudeVersion({ stateDir = defaultStateDir(), now = Date.now(), exec = defaultExec, fetchLatest = defaultFetchLatest } = {}) {
  const res = { current: null, latest: null, lastSeen: null, changed: false, newer: false, messages: [] }
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
  if (latest && cmpVer(latest, current) > 0) {
    res.newer = true
    res.messages.push(`Claude Code 새 버전 ${latest} 이 있습니다 (지금 ${current}) — \`claude update\` 로 올릴 수 있습니다.`)
  }
  writeState(stateDir, { lastSeen: current, latest: latest || null, latestCheckedAt: checkedAt })
  return res
}

module.exports = { checkClaudeVersion, readClaudeVersionState, parseVersion, cmpVer, REGISTRY_URL }

if (require.main === module) {
  const hardStop = setTimeout(() => process.exit(0), 4000) // SessionStart 지연 상한
  hardStop.unref()
  let raw = ''
  try { raw = fs.readFileSync(0, 'utf8') } catch { process.exit(0) }
  let input
  try { input = JSON.parse(raw) } catch { process.exit(0) }
  const event = input && (input.hook_event_name || input.hookEventName)
  if (event !== 'SessionStart') process.exit(0)
  checkClaudeVersion().then((r) => {
    if (r.messages.length) {
      const text = `[claude-version-check] ${r.messages.join('\n')}`
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text } }) + '\n')
    }
    process.exit(0)
  }).catch(() => process.exit(0))
}
