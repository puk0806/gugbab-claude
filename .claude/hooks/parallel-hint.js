#!/usr/bin/env node
/**
 * parallel-hint.js — 병렬로 할 수 있는 작업을 병렬로 하도록 안내 (비차단, 안내만)
 *
 * UserPromptSubmit : 요청에 서로 다른 작업이 여럿 보이면(번호 목록 2개 이상 · "병렬" 언급 · 작업 동사 3개 이상,
 *                    또는 2개 + 연결어) 병렬 실행 요령을 additionalContext 로 넣는다. 단일 작업·짧은 질문은 조용히 통과.
 * PostToolUse      : 트랜스크립트 끝부분만 읽어, 최근 assistant 응답 3개가 연속으로 "읽기 전용 도구 1개씩"이면
 *                    "독립 조회는 한 응답에 묶어라" 를 안내. 같은 연속 구간에서는 한 번만(세션별 상태 파일).
 *
 * 절대 막지 않는다(exit 0). 입력이 깨졌거나 트랜스크립트가 이상하면 조용히 통과.
 * 상태 파일 위치: 트랜스크립트 폴더/parallel-hint/<session>.json (progress-tracker 와 같은 관례)
 */
'use strict'
const fs = require('fs')
const os = require('os')
const path = require('path')

const TAIL_BYTES = 256 * 1024 // 트랜스크립트는 끝부분만
const STREAK = 3 // 연속 읽기 전용 단일 호출 응답 수 (실제 트랜스크립트 15개 2,675 응답 기준 6회 — 소음 적음)
const MAX_PROMPT_SCAN = 4000

const PROMPT_MSG = [
  '[parallel-hint] 이 요청에는 서로 다른 작업이 여럿 보입니다. 병렬로 처리할 수 있는지 먼저 나눠 보세요:',
  '- 서로 의존하지 않는 도구 호출(파일 읽기·검색·조회)은 한 응답에 여러 개를 함께 보낸다',
  '- 오래 걸리는 테스트·빌드는 run_in_background 로 돌리고 그동안 다른 작업을 한다',
  '- 독립된 조사·작업은 Agent(서브에이전트)로 동시에 맡긴다',
  '- 단, 앞 단계 결과가 필요한 작업 · 같은 파일 수정 · git 커밋→푸시 순서 · 사용자 확인 대기는 병렬로 하지 않는다',
].join('\n')
const POST_MSG = '[parallel-hint] 최근 응답마다 읽기 전용 도구를 하나씩만 호출했습니다. 서로 의존하지 않는 조회(Read·Grep·Glob·읽기 명령)는 한 응답에 묶어 병렬로 보내세요.'

const ACTION_RE = /(만들|작성|수정|고치|고쳐|고처|추가|삭제|제거|지워|정리|수립|적용|설정|옮기|옮겨|이동|합치|합쳐|나누|나눠|확인|조사|테스트|돌리|돌려|실행|업데이트|갱신|커밋|푸시|푸쉬|설치|배포|리뷰|검토|분석|비교|구현|개선|리팩터|마이그레이션|생성|반영|빌드|검증)/g
const CONNECT_RE = /그리고|하고\s|하고$|및|랑\s|이랑|,|면서|다음에|한\s?뒤|후에|또한|\s또\s/

function out(event, text) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }))
}

// ── UserPromptSubmit ──────────────────────────────────────────────
function looksMultiTask(prompt) {
  if (typeof prompt !== 'string') return false
  let p = prompt.slice(0, MAX_PROMPT_SCAN)
  if (/<task-notification>|<system-reminder>|^\s*\[SYSTEM|^\s*(?:Stop|PreToolUse|PostToolUse|UserPromptSubmit)[^\n]{0,20}hook (?:feedback|error)/i.test(p)) return false // 시스템 알림·훅 메시지는 사용자 요청이 아님
  p = p.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ').replace(/https?:\/\/\S+/g, ' ') // 코드·URL 은 빼고
  if (p.replace(/\s/g, '').length < 12) return false
  if (/병렬|동시에|한꺼번에/.test(p)) return true
  const listItems = p.split('\n').filter(l => /^\s*(?:\d+[.)]|[-*•])\s+\S/.test(l)).length
  if (listItems >= 2) return true
  const actions = new Set((p.match(ACTION_RE) || []).map(a => a.replace(/고쳐|고처/, '고치').replace('옮겨', '옮기').replace('합쳐', '합치').replace('나눠', '나누').replace('돌려', '돌리').replace('푸쉬', '푸시')))
  if (actions.size >= 3) return true
  return actions.size >= 2 && CONNECT_RE.test(p)
}

// ── PostToolUse ───────────────────────────────────────────────────
const READ_TOOLS = new Set(['Read', 'Grep', 'Glob', 'WebFetch', 'WebSearch', 'LS', 'NotebookRead'])
const READ_CMDS = new Set(['ls', 'cat', 'grep', 'rg', 'find', 'head', 'tail', 'wc', 'pwd', 'tree', 'du', 'stat', 'file', 'which', 'diff', 'echo', 'jq', 'sort', 'uniq', 'cut', 'tr', 'awk', 'sed'])
const GIT_READ = new Set(['status', 'log', 'diff', 'show', 'branch', 'rev-parse', 'ls-files', 'blame', 'remote'])

function isReadOnlyBash(cmd) {
  if (typeof cmd !== 'string' || !cmd.trim() || cmd.length > 4000) return false
  cmd = cmd.replace(/\s\d?>&\d\b/g, ' ').replace(/\s(?:\d|&)?>>?\s*\/dev\/null\b/g, ' ') // 출력 버리기(2>&1 · >/dev/null)는 쓰기 아님
  if (/[>]|\$\(|`|\bsed\s+(?:-[a-zA-Z]*i|--in-place)|\bawk\b[^|]*\bsystem\s*\(|\bfind\b[^|]*-(?:delete|exec)/.test(cmd)) return false
  const segs = cmd.split(/\|\||&&|[|;\n]/).map(s => s.trim()).filter(Boolean)
  if (!segs.length) return false
  return segs.every(seg => {
    const words = seg.split(/\s+/).filter(w => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(w)) // 앞의 VAR=값 은 건너뜀
    const w0 = words[0] || ''
    if (w0 === 'cd') return true
    if (w0 === 'git') return GIT_READ.has(words.find((w, i) => i > 0 && !w.startsWith('-')) || '')
    return READ_CMDS.has(path.basename(w0))
  })
}

function isReadOnlyTool(t) {
  if (!t || typeof t.name !== 'string') return false
  if (READ_TOOLS.has(t.name)) return true
  if (t.name === 'Bash') return isReadOnlyBash(t.input && t.input.command)
  return false
}

// 트랜스크립트 경로 검사 — 절대경로 · .jsonl · 일반 파일(링크면 실제 파일도 .jsonl)
function safeTranscript(p) {
  if (typeof p !== 'string' || !p || p.length > 4096 || p.includes('\0') || !path.isAbsolute(p) || !p.endsWith('.jsonl')) return null
  try {
    const real = fs.realpathSync(p)
    if (!real.endsWith('.jsonl')) return null
    const st = fs.statSync(real)
    return st.isFile() ? { real, size: st.size } : null
  } catch { return null }
}

function readTail(file, size) {
  const len = Math.min(size, TAIL_BYTES)
  const buf = Buffer.alloc(len)
  const fd = fs.openSync(file, 'r')
  try { fs.readSync(fd, buf, 0, len, size - len) } finally { fs.closeSync(fd) }
  const lines = buf.toString('utf8').split('\n')
  if (size > len) lines.shift() // 잘린 첫 줄
  return lines
}

// assistant 줄을 message.id 로 묶어 응답 단위로 — 한 응답의 병렬 호출은 여러 줄로 기록된다
function assistantTurns(lines) {
  const turns = []
  for (const line of lines) {
    if (!line.trim()) continue
    let e
    try { e = JSON.parse(line) } catch { continue }
    if (!e || e.type !== 'assistant' || e.isSidechain) continue
    const msg = e.message || {}
    const id = typeof msg.id === 'string' ? msg.id : `line-${turns.length}`
    let turn = turns.length && turns[turns.length - 1].id === id ? turns[turns.length - 1] : null
    if (!turn) { turn = { id, tools: [] }; turns.push(turn) }
    for (const c of Array.isArray(msg.content) ? msg.content : []) if (c && c.type === 'tool_use') turn.tools.push(c)
  }
  return turns.filter(t => t.tools.length > 0)
}

// 지금 이어지는 "읽기 전용 단일 호출" 구간의 시작 응답 id (구간 길이가 STREAK 미만이면 null)
function readOnlyStreakStart(turns) {
  let i = turns.length - 1
  let n = 0
  while (i >= 0 && turns[i].tools.length === 1 && isReadOnlyTool(turns[i].tools[0])) { n++; i-- }
  return n >= STREAK ? turns[i + 1].id : null
}

function sessionId(input) {
  return typeof input.session_id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(input.session_id) ? input.session_id : null
}

function stateFile(transcriptReal, sid) {
  return path.join(path.dirname(transcriptReal), 'parallel-hint', `${sid}.json`)
}

function handlePost(input) {
  const sid = sessionId(input)
  const t = safeTranscript(input.transcript_path)
  if (!sid || !t || t.size === 0) return
  const start = readOnlyStreakStart(assistantTurns(readTail(t.real, t.size)))
  if (!start) return
  const sf = stateFile(t.real, sid)
  let st = {}
  try { st = JSON.parse(fs.readFileSync(sf, 'utf8')) || {} } catch { /* 처음 */ }
  if (st.notifiedStreak === start) return // 같은 구간엔 한 번만
  try {
    fs.mkdirSync(path.dirname(sf), { recursive: true })
    fs.writeFileSync(sf, JSON.stringify({ notifiedStreak: start, at: new Date().toISOString() }))
  } catch { return } // 상태를 못 남기면 반복 안내가 될 수 있으니 안내하지 않음
  out('PostToolUse', POST_MSG)
}

function main() {
  let raw = ''
  try { raw = fs.readFileSync(0, 'utf8') } catch { return }
  if (raw.length > 4 * 1024 * 1024) return
  let input
  try { input = JSON.parse(raw) } catch { return }
  if (!input || typeof input !== 'object') return
  const event = input.hook_event_name
  if (event === 'UserPromptSubmit') {
    if (looksMultiTask(input.prompt)) out('UserPromptSubmit', PROMPT_MSG)
  } else if (event === 'PostToolUse') {
    try { handlePost(input) } catch { /* 조용히 통과 */ }
  }
}

if (require.main === module) {
  try { main() } catch { /* 비차단 */ }
  process.exit(0)
}

module.exports = { looksMultiTask, isReadOnlyBash, isReadOnlyTool, assistantTurns, readOnlyStreakStart, safeTranscript, STREAK }
