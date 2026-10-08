#!/usr/bin/env node
// task-confirm-guard.js — UserPromptSubmit + PreToolUse(Write·Edit·NotebookEdit) Hook (공통, 모든 템플릿)
//
// 목적: task-workflow.md 의 "이렇게 이해했습니다 → 작업 목록 → 진행할까요?" 절차를 훅으로 강제한다
//       (2026-10-06 사용자 요청 — 규칙만으로는 약해 확인 없이 수정에 착수하는 일이 반복됨)
//
// 판정 방식: 질문 단어로 "복잡한 작업"을 추측하지 않는다 (과거 task-plan-guard 오탐의 원인).
//   직전 Claude 답변에 "진행할까요"가 있었고 이번 질문이 거절·수정 요청이 아니면 = 승인.
//   UserPromptSubmit: 승인 여부를 세션별 상태 파일에 기록 (+ 미승인이면 절차 지시 주입)
//   PreToolUse Write/Edit/NotebookEdit: 미승인이면 수정 차단 (exit 2)
//
// 예외 (항상 허용): 메모리(~/.claude/projects/*/memory)·계획(~/.claude/plans)·임시 폴더 쓰기,
//                  질문에 "바로 진행"·"확인 없이" 등 명시 생략 요청
// 한계: 작업 중간에 보낸 메시지는 UserPromptSubmit 이 발생하지 않아 승인 상태를 바꾸지 못한다.
//       Bash 로 파일을 바꾸는 명령은 판정하지 않는다(정확한 구분 불가).

const fs = require('fs')
const os = require('os')
const path = require('path')

const CONFIRM_RE = /진행할까요/
const CONFIRM_TAIL_CHARS = 200
const BYPASS_RE = /바로\s*(?:진행|작업|수정|해)|확인\s*없이|묻지\s*말고|승인\s*없이|확인\s*생략/
// 거절·수정 요청 — 문장 첫머리의 거절어, 또는 방향을 바꾸는 표현
const REJECT_START_RE = /^[\s"'“‘(]*(?:아니|아뇨|아냐|잠깐|잠시만|멈춰|중단|취소|보류|그만|no\b|stop\b|wait\b)/i
const REJECT_ANY_RE = /말고|하지\s*마|하지\s*말|대신에?\s|다시\s*(?:정리|짜|생각|가져)|수정해서\s*다시|이해\s*못|잘못\s*이해/

const APPROVE_WORD_RE = /진행|^\s*(?:응|네|넹|예|ㅇㅇ|ㅇㅋ|좋아|오케이|그래|콜)|해\s*줘|하자|ok\b|okay\b|go\b|yes\b/i
const QUESTION_RE = /\?\s*$|뭐야|뭐지|뭔데|왜\s|어떻게|무슨|무엇|맞아\??\s*$|건가|는가\??\s*$/

const TRANSCRIPT_TAIL_BYTES = 512 * 1024
const TRANSCRIPT_MAX_BYTES = 32 * 1024 * 1024
const HOME = (() => { try { return path.resolve(os.homedir()) } catch { return null } })()
const STATE_DIR = path.join(os.tmpdir(), 'claude-task-confirm-guard')

function stateFile(sessionId) {
  const id = typeof sessionId === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(sessionId) ? sessionId : 'unknown'
  return path.join(STATE_DIR, `${id}.json`)
}

function readState(sessionId) {
  try {
    const st = JSON.parse(fs.readFileSync(stateFile(sessionId), 'utf8'))
    return st && typeof st === 'object' ? st : null
  } catch { return null }
}

function writeState(sessionId, state) {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true })
    fs.writeFileSync(stateFile(sessionId), JSON.stringify(state))
  } catch { /* 기록 실패 → 다음 PreToolUse 에서 상태 없음 = 미승인으로 차단 (보수) */ }
}

// 대화 기록에서 마지막 메인 대화(서브에이전트 제외) Claude 답변 텍스트
function lastAssistantText(transcriptPath) {
  if (typeof transcriptPath !== 'string' || !transcriptPath) return ''
  let fd
  try {
    fd = fs.openSync(transcriptPath, 'r')
    const size = fs.fstatSync(fd).size
    // 끝에서부터 읽되, 한 줄이 범위보다 길어 잘리면(파싱 실패) 범위를 넓혀 다시 읽는다 (최대 MAX)
    for (let want = TRANSCRIPT_TAIL_BYTES; ; want *= 4) {
      const len = Math.min(size, want)
      const buf = Buffer.alloc(len)
      fs.readSync(fd, buf, 0, len, size - len)
      const lines = buf.toString('utf8').split('\n')
      for (let i = lines.length - 1; i >= 0; i--) {
        let e
        try { e = JSON.parse(lines[i]) } catch { continue }
        if (!e || e.type !== 'assistant' || e.isSidechain || !e.message || !Array.isArray(e.message.content)) continue
        const text = e.message.content.filter(p => p && p.type === 'text' && typeof p.text === 'string').map(p => p.text).join('\n')
        if (text.trim()) return text
      }
      if (len >= size || want >= TRANSCRIPT_MAX_BYTES) break
    }
  } catch { /* 읽기 실패 → 직전 확인 질문 없음으로 간주 */ } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* ignore */ }
  }
  return ''
}

// 사람이 아닌 시스템이 대화에 넣는 메시지 — 태그로 시작한다
const SYSTEM_PROMPT_RE = /^\s*(?:<(?:task-notification|system-reminder|cross-session-message|local-command-stdout|local-command-caveat|bash-notification|command-name)\b|Stop hook feedback:|Another Claude session sent a message)/
function isSystemPrompt(prompt) {
  return typeof prompt === 'string' && SYSTEM_PROMPT_RE.test(prompt)
}

function judgePrompt(prompt, prevAssistant) {
  const p = typeof prompt === 'string' ? prompt : ''
  if (BYPASS_RE.test(p)) return { approved: true, why: 'bypass' }
  // 답변 끝부분의 확인 질문만 인정 — 본문에서 절차를 설명하며 인용한 "진행할까요?"는 승인 근거가 아니다
  // (실제 세션 검증 2026-10-06: 인용만으로 승인 처리되는 오탐 확인)
  // 기준 = 마지막 줄 (끝부분 200자 기준도 결정 목록 속 인용을 승인으로 잡아 재차 좁힘)
  const lines = String(prevAssistant || '').trimEnd().split('\n').map(l => l.trim()).filter(Boolean)
  const lastLine = (lines[lines.length - 1] || '').slice(-CONFIRM_TAIL_CHARS)
  if (!CONFIRM_RE.test(lastLine) || /["“'‘「]진행할까요/.test(lastLine)) return { approved: false, why: 'no-confirm-question' }
  if (REJECT_START_RE.test(p) || REJECT_ANY_RE.test(p)) return { approved: false, why: 'rejected' }
  // 승인 표현 없이 되묻는 질문("이건 뭐야??")은 승인이 아니라 확인 질문 (실제 세션 검증으로 추가)
  if (!APPROVE_WORD_RE.test(p) && QUESTION_RE.test(p)) return { approved: false, why: 'question' }
  return { approved: true, why: 'approved' }
}

function isExemptPath(filePath, cwd) {
  if (typeof filePath !== 'string' || !filePath) return false
  let v = filePath
  if (HOME && (v === '~' || v.startsWith('~/'))) v = HOME + v.slice(1)
  let abs
  try { abs = path.resolve(cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd(), v) } catch { return false }
  if (/^\/(?:private\/)?(?:tmp|var\/folders)\//.test(abs)) return true
  if (HOME) {
    const projects = path.join(HOME, '.claude', 'projects') + path.sep
    if (abs.startsWith(projects) && abs.slice(projects.length).split(path.sep)[1] === 'memory') return true
    if (abs.startsWith(path.join(HOME, '.claude', 'plans') + path.sep)) return true
  }
  return false
}

const PRE_CONTEXT = '[task-confirm-guard] 이번 요청에 파일 수정이 필요하면 먼저 "이렇게 이해했습니다:"(요약) → "작업 목록:"(번호 목록) → "진행할까요?"를 제시하고 답변을 끝낸다. 승인 전 Write/Edit 는 훅이 차단한다. 설명·조회·보고 요청이면 파일을 수정하지 않는다.'
const BLOCK_MSG = [
  '[task-confirm-guard] 사용자 승인 전이라 파일 수정을 차단했습니다.',
  '  → 먼저 "이렇게 이해했습니다:" / "작업 목록:" / "진행할까요?" 를 제시하고 답변을 끝내세요.',
  '  → 사용자가 승인하면 다음 차례에 수정할 수 있습니다. (사용자가 "바로 진행"이라고 하면 생략 가능)',
].join('\n')

function handle(input) {
  if (!input || typeof input !== 'object') return { code: 0 }
  const event = input.hook_event_name || input.hookEventName
  const sessionId = input.session_id

  if (event === 'UserPromptSubmit') {
    // 시스템이 보낸 알림(백그라운드 작업 완료 등)은 사용자 답이 아니다 — 승인 상태를 바꾸지 않는다
    // (실제 세션 2026-10-06: <task-notification> 이 UserPromptSubmit 으로 들어와 승인이 풀린 사례)
    if (isSystemPrompt(input.prompt)) return { code: 0 }
    const verdict = judgePrompt(input.prompt, lastAssistantText(input.transcript_path))
    writeState(sessionId, { approved: verdict.approved, why: verdict.why, at: new Date().toISOString() })
    if (verdict.approved) return { code: 0 }
    return { code: 0, stdout: JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: PRE_CONTEXT } }) }
  }

  if (event === 'PreToolUse') {
    const tool = input.tool_name
    if (tool !== 'Write' && tool !== 'Edit' && tool !== 'NotebookEdit') return { code: 0 }
    const ti = input.tool_input && typeof input.tool_input === 'object' ? input.tool_input : {}
    const target = ti.file_path || ti.notebook_path || ti.path
    if (isExemptPath(target, typeof input.cwd === 'string' ? input.cwd : undefined)) return { code: 0 }
    const st = readState(sessionId)
    if (st && st.approved === true) return { code: 0 }
    return { code: 2, stderr: BLOCK_MSG }
  }
  return { code: 0 }
}

if (require.main === module) {
  let input = null
  try { input = JSON.parse(fs.readFileSync(0, 'utf8')) } catch { process.exit(0) }
  const r = handle(input)
  if (r.stdout) process.stdout.write(r.stdout + '\n')
  if (r.stderr) process.stderr.write(r.stderr + '\n')
  process.exit(r.code)
} else {
  module.exports = { handle, judgePrompt, isSystemPrompt, isExemptPath, lastAssistantText, stateFile }
}
