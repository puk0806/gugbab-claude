#!/usr/bin/env node
/**
 * clean-review-guard.js
 * Stop Hook — 코드를 바꾼 턴이 끝날 때, Codex 리뷰가 돌지 않으면 깨끗한 Claude 리뷰어(clean-reviewer)로 적대적 리뷰 강제
 *
 * 2026-11-23 사용자 결정: Codex 리뷰를 안 할 때(묶음 꺼짐·skipReview·CLI 없음·미로그인·계정 400) 자동으로
 * 대화 맥락 없는 Claude 리뷰어가 대신 리뷰한다. 코드를 바꾼 턴마다, 모든 프로젝트에서 기본 켬.
 * 참고: Google Elephant-Goldfish Model — 맥락을 다 아는 작성자(코끼리) 대신 맥락 없는 리뷰어(금붕어)가 검토.
 *
 * 판정 (모두 이번 턴 = 마지막 사람 메시지 이후 기준):
 *   1. git 레포 아님 / Stop 아님 / 리뷰어 에이전트가 꺼져 있음 → 통과
 *   2. Codex 가 실제로 리뷰할 상황(codex 묶음 켬 + skipReview 아님 + CLI + 플러그인 + 로그인 + 사용 불가 표시 없음) → 통과(Codex 가 맡음)
 *   3. 이번 턴에 바뀐 코드 파일 없음(커밋 안 된 코드 파일 중 수정 시각이 턴 시작 뒤인 것) → 통과
 *   4. 마지막 코드 변경 뒤에 시작해 끝까지 돈(completed) clean-reviewer 호출이 있고, 그 prompt 가 이 훅이 낸
 *      리뷰 요청문과 같으면 → 통과. 백그라운드 실행은 Claude Code 의 완료 알림(task-notification completed)이 있어야 끝난 것으로 본다
 *      (아직 도는 중이면 막지 않고 알림 뒤 판정). 표시 파일·다른 에이전트·문구를 바꾼 호출·완료 기록 없는 결과는 인정하지 않는다
 *   5. 이번 턴 리뷰가 3번 끝났는데 또 고쳤으면 → 경고 후 통과(라운드 상한)
 *   6. 그 밖 → exit 2 로 리뷰 요청문을 주고 계속시킴. 같은 사유로는 한 번만(stop_hook_active 루프 방지)
 */

const { execSync, spawnSync } = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const path = require('path')

const REVIEWER = 'clean-reviewer'
const MAX_ROUNDS = 3
const TRANSCRIPT_TAIL_BYTES = 8 * 1024 * 1024
const MAX_FILES_LISTED = 40
const MAX_PROMPT_CHARS = 1500
// codex-review-guard 와 같은 목록 (2026-11-23 셸·SQL·뷰 계열 추가 — 설치·시험 스크립트만 바꾼 턴이 빠지던 것)
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|rs|java|py|go|rb|c|cpp|h|hpp|cs|swift|kt|sh|ps1|sql|vue|svelte|php)$/
// 사람이 쓴 질문이 아닌 user 기록 (task-confirm-guard 와 같은 기준)
const SYSTEM_PROMPT_RE = /^\s*(?:<(?:task-notification|agent-message|system-reminder|cross-session-message|local-command-stdout|local-command-caveat|bash-notification|command-name)\b|Stop hook feedback:|Another Claude session sent a message)/
const IS_WIN = process.platform === 'win32'

let stopInput = null

function skip(reason) {
  if (stopInput && stopInput.stop_hook_active !== true && sessionIdOf(stopInput)) saveState(sessionIdOf(stopInput), { ...loadState(sessionIdOf(stopInput)), sig: null })
  process.stderr.write(`[clean-review-guard] 건너뜀: ${reason}\n`)
  process.exit(0)
}
function passWithWarning(text) {
  process.stdout.write(JSON.stringify({ systemMessage: text }))
  process.exit(0)
}
const sessionIdOf = (input) => (input && typeof input.session_id === 'string' && input.session_id ? input.session_id : null)

// ── 상태 파일 (세션별) — 낸 리뷰 요청문 목록과 마지막 차단 사유 ──────────────
function stateFile(sessionId) {
  const h = crypto.createHash('sha256').update(String(sessionId)).digest('hex').slice(0, 32)
  return path.join(os.tmpdir(), `claude-cleanreview-${h}.json`)
}
function loadState(sessionId) {
  try {
    const f = stateFile(sessionId)
    if (!fs.lstatSync(f).isFile()) return { sig: null, issued: [] }
    const j = JSON.parse(fs.readFileSync(f, 'utf8'))
    return {
      sig: typeof j.sig === 'string' ? j.sig : null,
      issued: Array.isArray(j.issued) ? j.issued.filter(x => x && typeof x.prompt === 'string' && typeof x.at === 'number').slice(-20) : [],
    }
  } catch { return { sig: null, issued: [] } }
}
function saveState(sessionId, st) {
  try {
    const f = stateFile(sessionId)
    try { if (!fs.lstatSync(f).isFile()) return } catch { /* 없음 → 새로 */ }
    fs.writeFileSync(f, JSON.stringify(st))
  } catch { /* 기록 실패 → 다음 판정에서 요청문 불일치로 다시 요청 */ }
}

// ── git ──────────────────────────────────────────────────────────────
function getRepoRoot() {
  try { return execSync('git rev-parse --show-toplevel', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim() } catch { return null }
}
function gitStatus(repoRoot, args) {
  try {
    return execSync(`git status --porcelain -z${args}`, { cwd: repoRoot, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024, timeout: 30000 })
  } catch { return null }
}
// 커밋 안 된 코드 파일 { file, deleted, mtime } — 확인 불가면 null
function changedCodeFiles(repoRoot) {
  const out = gitStatus(repoRoot, ' -uall') ?? gitStatus(repoRoot, '')
  if (out === null) return null
  const tokens = out.split('\0')
  const res = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.length < 4) continue
    const x = t[0], y = t[1], file = t.slice(3)
    if (x === 'R' || x === 'C') i++
    const untrackedDir = x === '?' && file.endsWith('/')
    if (!CODE_EXT.test(file) && !untrackedDir) continue
    // 이름만 바꾼 것(R·C)도 건너뛰지 않는다 — 스테이징된 "고친 뒤 git mv" 는 Y 가 비어도 내용이 바뀌었다. 그대로 옮긴 파일은 수정 시각이 옛날이라 아래 턴 판정에서 빠진다
    const deleted = x === 'D' || y === 'D'
    let mtime = 0
    if (deleted) {
      // 지운 파일은 남아 있는 가장 가까운 상위 폴더의 수정 시각으로 — 폴더째 지웠으면(rm -rf src/old) 그 위 폴더가 바뀐다
      let d = path.dirname(path.join(repoRoot, file))
      for (;;) {
        try { mtime = fs.statSync(d).mtime.getTime(); break } catch { /* 없음 → 위로 */ }
        const up = path.dirname(d)
        if (up === d || !(up + path.sep).startsWith(repoRoot + path.sep) && up !== repoRoot) { mtime = Date.now(); break } // 확인 불가 → 이번 턴 변경으로
        d = up
      }
    } else {
      try { mtime = fs.statSync(path.join(repoRoot, file)).mtime.getTime() } catch { continue }
    }
    res.push({ file, deleted, mtime })
  }
  return res
}

// ── Codex 가 리뷰할 상황인가 (codex-review-guard 판정과 같은 조건) ──────────
function codexHookEnabled(repoRoot) {
  const en = process.env.GUGBAB_ENABLED
  if (typeof en === 'string') return en.split(',').includes('hook:codex-review-guard')
  try {
    const s = JSON.parse(fs.readFileSync(path.join(repoRoot, '.claude', 'settings.json'), 'utf8'))
    return JSON.stringify((s.hooks && s.hooks.Stop) || []).includes('codex-review-guard')
  } catch { return false }
}
function findCodex() {
  const exts = IS_WIN ? (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';').filter(Boolean) : ['']
  for (const d of (process.env.PATH || '').split(path.delimiter)) {
    if (!d) continue
    for (const e of exts) {
      const f = path.join(d, 'codex' + e)
      try { fs.accessSync(f, fs.constants.X_OK); if (fs.statSync(f).isFile()) return f } catch { /* 다음 */ }
    }
  }
  return null
}
function runCodex(args) {
  const bin = findCodex()
  if (!bin) return null
  let r
  if (IS_WIN && /\.(cmd|bat)$/i.test(bin)) {
    if (/["%]/.test(bin)) return null
    r = spawnSync(`"${bin}" ${args.join(' ')}`, { shell: true, encoding: 'utf8', timeout: 15000, windowsHide: true })
  } else {
    r = spawnSync(bin, args, { encoding: 'utf8', timeout: 15000, windowsHide: true })
  }
  if (r.error) return null
  return { status: r.status, out: `${r.stdout || ''}${r.stderr || ''}`, stdout: r.stdout || '' }
}
function codexPluginEnabled(repoRoot) {
  const files = [path.join(repoRoot, '.claude', 'settings.json')]
  const cfg = process.env.CLAUDE_CONFIG_DIR
  if (cfg && path.isAbsolute(cfg)) files.push(path.join(cfg, 'settings.json'))
  return files.some(f => { try { return !!JSON.parse(fs.readFileSync(f, 'utf8')).enabledPlugins?.['codex@openai-codex'] } catch { return false } })
}
function codexUnavailableMarked(repoRoot) {
  const marker = path.join(repoRoot, '.claude', '.codex-unavailable')
  try { if (!fs.lstatSync(marker).isFile()) return false } catch { return false }
  let data
  try { data = JSON.parse(fs.readFileSync(marker, 'utf8')) } catch { return false }
  if (!data || typeof data.configHash !== 'string' || typeof data.codexVersion !== 'string') return false
  const v = runCodex(['--version'])
  if (!v || v.status !== 0) return false
  let hash = 'MISSING'
  try { hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'config.toml'), 'utf8')).digest('hex') } catch { /* MISSING */ }
  return data.configHash === hash && data.codexVersion === v.stdout.trim()
}
function codexWillReview(repoRoot) {
  if (!codexHookEnabled(repoRoot)) return false
  try { if (execSync('git config codex.skipReview', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim() === 'true') return false } catch { /* 설정 없음 */ }
  if (!findCodex() || !codexPluginEnabled(repoRoot)) return false
  const st = runCodex(['login', 'status'])
  if (!st || st.status !== 0 || /not[\s-]+logged[\s-]*in/i.test(st.out) || !/logged[\s-]*in/i.test(st.out)) return false
  return !codexUnavailableMarked(repoRoot)
}

// ── 대화 기록 — 이번 턴 시작 시각·사람 질문·리뷰어 호출 ─────────────────────
function readTail(file) {
  let fd
  try {
    fd = fs.openSync(file, 'r')
    const size = fs.fstatSync(fd).size
    const len = Math.min(size, TRANSCRIPT_TAIL_BYTES)
    const buf = Buffer.alloc(len)
    fs.readSync(fd, buf, 0, len, size - len)
    const lines = buf.toString('utf8').split('\n')
    if (len < size) lines.shift() // 잘린 첫 줄
    return lines
  } catch { return null } finally { if (fd !== undefined) try { fs.closeSync(fd) } catch { /* 무시 */ } }
}
const tsOf = (e) => { const t = Date.parse(e && e.timestamp); return Number.isFinite(t) ? t : null }
function humanText(e) {
  if (!e || e.type !== 'user' || e.isMeta || e.isSidechain || e.isCompactSummary || !e.message) return null
  const c = e.message.content
  const text = typeof c === 'string' ? c
    : Array.isArray(c) && !c.some(p => p && p.type === 'tool_result') ? c.filter(p => p && p.type === 'text' && typeof p.text === 'string').map(p => p.text).join('\n') : null
  if (typeof text !== 'string' || !text.trim() || SYSTEM_PROMPT_RE.test(text)) return null
  return text
}
// 반환: null(읽기 실패) | { turnStart, prompt, reviews: [{ at, prompt }] }
function readTurn(transcriptPath) {
  if (typeof transcriptPath !== 'string' || !transcriptPath) return null
  const lines = readTail(transcriptPath)
  if (!lines) return null
  const entries = []
  for (const l of lines) { if (!l) continue; try { const e = JSON.parse(l); if (e && typeof e === 'object') entries.push(e) } catch { /* 깨진 줄 무시 */ } }
  let start = -1
  for (let i = entries.length - 1; i >= 0; i--) if (humanText(entries[i]) !== null) { start = i; break }
  // 사람 질문을 못 찾음(기록 꼬리 8MB 밖으로 잘림 등) → 시작 시각 0 = 커밋 안 된 코드 전체를 대상으로(fail-closed).
  // 읽은 구간의 가장 이른 시각으로 잡으면 구간 밖에서 고친 코드가 빠진다(3라운드 리뷰 지적)
  let turnStart = start >= 0 ? tsOf(entries[start]) : 0
  if (turnStart === null) return null
  if (start < 0 && !entries.some(e => tsOf(e) !== null)) return null // 시각 있는 기록이 하나도 없음 → 대화 기록으로 볼 수 없음
  const prompt = start >= 0 ? humanText(entries[start]) : ''
  const uses = new Map()     // 결과를 기다리는 호출
  const pending = new Map()  // 백그라운드로 띄워져 완료 알림을 기다리는 호출 (대화형 세션은 서브에이전트가 기본 백그라운드 — 2026-11-23 실측)
  const reviews = []
  let notLoaded = false
  for (let i = Math.max(0, start); i < entries.length; i++) {
    const e = entries[i]
    if (e.isSidechain || !e.message) continue
    // 백그라운드 완료 알림 — Claude Code 가 쓰는 user 기록(origin.kind = task-notification). 도구 결과 글 안의 같은 글자는 여기 오지 않는다
    if (e.type === 'user' && typeof e.message.content === 'string' && pending.size) {
      const t = e.message.content
      // origin 은 Claude Code 가 붙인다(2.1.330 실측). 없으면 인정하지 않는다 — 그때 리뷰는 "도는 중" 으로 남아 막지 않을 뿐이다
      const fromHarness = !!(e.origin && typeof e.origin === 'object' && e.origin.kind === 'task-notification')
      if (fromHarness && /^\s*<task-notification>/.test(t)) {
        const id = (t.match(/<tool-use-id>([^<\s]+)<\/tool-use-id>/) || [])[1]
        const status = (t.match(/<status>([a-z_]+)<\/status>/) || [])[1]
        if (id && pending.has(id) && status === 'completed') { reviews.push(pending.get(id)); pending.delete(id) }
        else if (id && pending.has(id) && status) pending.delete(id) // failed·killed 등 — 리뷰 아님
      }
      continue
    }
    if (!Array.isArray(e.message.content)) continue
    for (const p of e.message.content) {
      if (!p || typeof p !== 'object') continue
      if (e.type === 'assistant' && p.type === 'tool_use' && (p.name === 'Agent' || p.name === 'Task') && p.input && typeof p.input === 'object'
        && p.input.subagent_type === REVIEWER && typeof p.input.prompt === 'string' && typeof p.id === 'string') {
        const at = tsOf(e)
        if (at !== null) uses.set(p.id, { at, prompt: p.input.prompt })
      }
      if (e.type !== 'user' || p.type !== 'tool_result' || !uses.has(p.tool_use_id)) continue
      const call = uses.get(p.tool_use_id)
      uses.delete(p.tool_use_id)
      // 이 세션에 리뷰어 에이전트가 없음(세션 중 업데이트로 훅만 먼저 바뀜 — 에이전트는 재시작해야 읽힘). 오류 글은 Claude Code 가 쓴다
      if (p.is_error === true) {
        const txt = typeof p.content === 'string' ? p.content : JSON.stringify(p.content || '')
        if (/Agent type '?clean-reviewer'? not found/i.test(txt)) notLoaded = true
        continue
      }
      // 완료 여부는 Claude Code 가 남긴 toolUseResult 로만 판단 — 없으면 인정하지 않는다(fail-closed)
      const r = e.toolUseResult
      if (!r || typeof r !== 'object' || (r.agentType !== undefined && r.agentType !== REVIEWER)) continue
      // 리뷰어가 실제로 떴으면 앞선 "not found" 는 더 이상 이유가 안 된다(세션에 에이전트가 생김)
      if (r.status === 'completed') { reviews.push(call); notLoaded = false }
      else if (r.status === 'async_launched') { pending.set(p.tool_use_id, call); notLoaded = false }
    }
  }
  return { turnStart, prompt, reviews, running: [...pending.values()], notLoaded }
}

const norm = (s) => String(s).replace(/\s+/g, ' ').trim()

function buildRequest(userPrompt, files) {
  const id = crypto.randomBytes(4).toString('hex')
  const req = String(userPrompt || '(사용자 질문을 찾지 못함)').trim()
  const shown = req.length > MAX_PROMPT_CHARS ? req.slice(0, MAX_PROMPT_CHARS) + ' …(뒤 생략)' : req
  const list = files.slice(0, MAX_FILES_LISTED).map(f => `- ${f.file}${f.deleted ? ' (삭제)' : ''}`)
  if (files.length > MAX_FILES_LISTED) list.push(`- …외 ${files.length - MAX_FILES_LISTED}개 (git status 로 확인)`)
  return [
    `[clean-review 요청 ${id}]`,
    '사용자 요청 (원문):',
    '<<<',
    shown,
    '>>>',
    '이번 턴에 바뀐 코드 파일 (커밋 안 됨):',
    ...list,
    '이 파일들의 변경을 git diff (새 파일은 Read) 로 직접 읽고, 에이전트 지침의 3단계 순서로 적대적으로 검토하세요.',
  ].join('\n')
}

// ── 본문 ─────────────────────────────────────────────────────────────
function main() {
  let raw = ''
  try { raw = fs.readFileSync(0, 'utf8').trim() } catch { raw = '' }
  if (!raw) skip('stdin 비어있음')
  let input
  try { input = JSON.parse(raw) } catch { skip('JSON 파싱 실패') }
  if (!input || typeof input !== 'object' || Array.isArray(input)) skip('입력이 객체 아님')
  const event = input.hook_event_name || input.hookEventName || input.event
  if (event && event !== 'Stop') skip(`이벤트 아님 (${event})`)
  stopInput = input

  const en = process.env.GUGBAB_ENABLED
  if (typeof en === 'string' && !en.split(',').includes(`agent:${REVIEWER}`)) skip(`${REVIEWER} 에이전트가 꺼져 있음 — /harness 에서 깨끗한 리뷰 묶음을 함께 켜세요`)

  const repoRoot = getRepoRoot()
  if (!repoRoot) skip('git 레포 아님')

  const turn = readTurn(input.transcript_path)
  const files = changedCodeFiles(repoRoot)
  if (files === null) skip('git status 확인 실패')
  // 대화 기록을 못 읽으면 이번 턴 판단 불가 → 막지 않고 알림(대화 기록 없이 돌리는 비대화형 실행 등)
  if (!turn) {
    if (files.length) process.stderr.write('[clean-review-guard] 대화 기록을 읽지 못해 이번 턴 리뷰 여부를 판단하지 않습니다\n')
    process.exit(0)
  }
  const changed = files.filter(f => f.mtime > turn.turnStart)
  if (!changed.length) skip('이번 턴에 바뀐 코드 없음')
  const latest = Math.max(...changed.map(f => f.mtime))

  if (codexWillReview(repoRoot)) skip('Codex 리뷰가 맡음')

  const sid = sessionIdOf(input)
  const st = sid ? loadState(sid) : { sig: null, issued: [] }
  const issued = st.issued.filter(x => x.at >= turn.turnStart).map(x => norm(x.prompt))
  const valid = turn.reviews.filter(r => issued.includes(norm(r.prompt)))
  if (valid.some(r => r.at > latest)) skip('마지막 코드 변경 뒤 깨끗한 리뷰 완료')
  // 요청문 그대로 띄운 리뷰가 백그라운드에서 도는 중 — 다시 막지 않는다. 완료 알림이 오면 그 턴 끝에서 판정한다
  if (turn.running.some(r => r.at > latest && issued.includes(norm(r.prompt)))) skip('깨끗한 리뷰가 백그라운드에서 도는 중 — 완료 알림 뒤 판정')
  if (valid.length >= MAX_ROUNDS) {
    passWithWarning(`⚠ clean-review-guard: 깨끗한 리뷰를 ${MAX_ROUNDS}라운드 마쳤습니다. 마지막 리뷰 뒤에 고친 코드는 리뷰하지 않고 끝냅니다.`)
  }
  if (turn.notLoaded) {
    passWithWarning([
      `⚠ clean-review-guard: 이 세션에는 ${REVIEWER} 에이전트가 아직 없어 깨끗한 리뷰를 건너뜁니다.`,
      '  (세션 중 업데이트로 훅만 먼저 바뀐 경우 — 에이전트는 세션을 다시 시작해야 읽힙니다)',
      '  /exit 하면 래퍼가 대화를 이어서 다시 시작하고, 그다음 코드를 바꾼 턴부터 리뷰합니다.',
    ].join('\n'))
  }
  const mismatch = turn.reviews.length > valid.length || turn.running.some(r => !issued.includes(norm(r.prompt)))

  const sig = `review:${valid.length}:${crypto.createHash('sha256').update(changed.map(f => f.file).sort().join('\0')).digest('hex').slice(0, 16)}`
  const active = input.stop_hook_active === true
  if (active && (!sid || st.sig === sig)) {
    passWithWarning([
      '⚠ clean-review-guard: 깨끗한 리뷰가 끝나지 않은 채 종료합니다.',
      '  같은 사유로 이미 한 번 요청했으므로 반복해서 막지 않습니다(stop_hook_active 루프 방지).',
      '  /harness 에서 "깨끗한 리뷰" 묶음을 끄면 이 리뷰를 하지 않습니다.',
    ].join('\n'))
  }

  const request = buildRequest(turn.prompt, changed)
  const rid = request.match(/^\[clean-review 요청 ([0-9a-f]+)\]/)[1]
  if (sid) saveState(sid, { sig, issued: [...st.issued, { prompt: request, at: Date.now() }].slice(-20) })

  process.stderr.write([
    '✗ clean-review-guard: 깨끗한 Claude 리뷰 필요 (Codex 리뷰가 돌지 않는 프로젝트)',
    ...(mismatch ? ['  (앞서 부른 clean-reviewer 는 이 훅이 준 요청문과 달라 인정하지 않았습니다 — 아래 요청문을 그대로 쓰세요)'] : []),
    '',
    '사용자에게 묻지 말고 지금 실행하세요 (.claude/rules/clean-review.md):',
    `  1. Agent 도구: subagent_type "${REVIEWER}", prompt 는 아래 "===== ${rid} 시작" 과 "===== ${rid} 끝" 사이 글을 한 글자도 바꾸지 말고 그대로`,
    '     (설명·의도·"괜찮다" 같은 말을 덧붙이지 마세요 — 리뷰어는 대화를 모르는 상태여야 합니다)',
    '     백그라운드로 돌면 완료 알림이 올 때까지 기다렸다가 결과로 판정합니다',
    '  2. 지적마다 ACCEPT / REJECT / PARTIAL 판정 → ACCEPT 는 고치고, REJECT 는 근거를 남긴다',
    `  3. 고쳤으면 다시 끝내기 → 이 훅이 다음 라운드를 요청합니다 (최대 ${MAX_ROUNDS}라운드)`,
    '  4. 끝나면 사용자에게 "깨끗한 리뷰 요약" (ACCEPTED / REJECTED / 잔존 이슈) 을 보고',
    `===== ${rid} 시작`,
    request,
    `===== ${rid} 끝`,
  ].join('\n') + '\n')
  process.exit(2)
}

if (require.main === module) main()
module.exports = { readTurn, buildRequest, changedCodeFiles, norm }
