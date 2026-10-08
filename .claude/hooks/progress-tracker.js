#!/usr/bin/env node
// progress-tracker.js — UserPromptSubmit + PostToolUse(Write·Edit·NotebookEdit) + SessionStart Hook (공통, 모든 템플릿)
//
// 목적: 작업이 중간에 끊겨도(토큰 소진·종료·/clear·자동 요약) 어디까지 했는지 이어서 알 수 있게 한다 (2026-10-06 사용자 요청)
//
// 기록 (Claude 가 신경 쓰지 않아도 자동):
//   UserPromptSubmit: 사용자가 "진행할까요?"에 승인하면 직전 답변의 "이렇게 이해했습니다:"·"작업 목록:"을 계획으로 저장
//                     (승인 판정은 task-confirm-guard 와 같은 함수를 공유 — 두 훅이 다르게 판단하지 않도록)
//   PostToolUse Write/Edit/NotebookEdit: 계획이 있으면 수정한 파일을 덧붙인다
// 안내:
//   SessionStart compact·resume → 이 세션의 계획·수정 파일을 다시 알려준다 (요약으로 빠진 세부 복구)
//   SessionStart startup·clear  → 72시간 안에 활동한 직전 작업이 있으면 "여기까지 진행됨"을 알려준다 (한 번만)
// 저장 위치: 대화 기록 폴더(~/.claude/projects/<해시>/progress/<세션>.json) — 레포 워킹트리를 더럽히지 않는다

const fs = require('fs')
const os = require('os')
const path = require('path')

let judgePrompt = null, lastAssistantText = null, isSystemPrompt = () => false
try { ({ judgePrompt, lastAssistantText, isSystemPrompt } = require('./task-confirm-guard.js')) } catch { /* 미설치 → 계획 기록 생략 */ }

const RECENT_MS = 72 * 60 * 60 * 1000
const MAX_FILES = 200

function dirOf(input) {
  const t = input && typeof input.transcript_path === 'string' ? input.transcript_path : ''
  return t && path.isAbsolute(t) ? path.join(path.dirname(t), 'progress') : path.join(os.tmpdir(), 'claude-progress-tracker')
}
function sid(input) {
  return input && typeof input.session_id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(input.session_id) ? input.session_id : null
}
function fileOf(input, id) { return path.join(dirOf(input), `${id}.json`) }
function load(p) { try { const v = JSON.parse(fs.readFileSync(p, 'utf8')); return v && typeof v === 'object' ? v : null } catch { return null } }
function save(p, v) { try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2)) } catch { /* ignore */ } }

// 직전 답변에서 계획 추출: "이렇게 이해했습니다:" 다음 내용 + "작업 목록:" 아래 번호 항목
function extractPlan(text) {
  const t = String(text || '')
  const lines = t.split('\n')
  let understanding = ''
  const ui = lines.findIndex(l => /이렇게 이해했습니다\s*:/.test(l))
  if (ui >= 0) {
    const rest = lines[ui].split(/이렇게 이해했습니다\s*:/)[1].trim()
    understanding = rest || (lines.slice(ui + 1).find(l => l.trim()) || '').trim()
  }
  const tasks = []
  const ti = lines.findIndex(l => /작업 목록\s*:/.test(l))
  if (ti >= 0) {
    for (const l of lines.slice(ti + 1)) {
      if (/진행할까요/.test(l)) break
      const m = /^\s*(\d+)[.)]\s+(.+)$/.exec(l)
      if (m) tasks.push(m[2].replace(/\*\*/g, '').trim())
      else if (tasks.length && l.trim() && !/^\s{2,}|^\s*[-*]/.test(l)) break
    }
  }
  return { understanding: understanding.replace(/\*\*/g, '').slice(0, 500), tasks: tasks.slice(0, 30).map(x => x.slice(0, 300)) }
}

function relPath(p, cwd) {
  const root = path.resolve(process.env.CLAUDE_PROJECT_DIR || cwd || process.cwd())
  const abs = path.resolve(root, p)
  return abs.startsWith(root + path.sep) ? path.relative(root, abs) : abs
}

function render(rec, header) {
  const lines = [header]
  if (rec.plan && rec.plan.understanding) lines.push(`- 목표: ${rec.plan.understanding}`)
  if (rec.plan && rec.plan.tasks && rec.plan.tasks.length) {
    lines.push('- 승인된 작업 목록:')
    rec.plan.tasks.forEach((t, i) => lines.push(`  ${i + 1}. ${t}`))
  } else if (rec.goal) lines.push(`- 요청: ${rec.goal}`)
  const files = Array.isArray(rec.files) ? rec.files : []
  if (files.length) lines.push(`- 수정한 파일 ${files.length}개 (최근 10개): ${files.slice(-10).join(', ')}`)
  else lines.push('- 수정한 파일: 아직 없음')
  lines.push(`- 마지막 활동: ${rec.lastActivity || rec.approvedAt}`)
  lines.push('→ 어디까지 끝났는지 수정 파일·git 상태로 확인한 뒤, 이미 끝난 작업이면 무시하고 아니면 사용자에게 이어서 할지 확인한다.')
  return lines.join('\n')
}

function handle(input) {
  if (!input || typeof input !== 'object') return null
  const event = input.hook_event_name || input.hookEventName
  const id = sid(input)

  if (event === 'UserPromptSubmit') {
    if (!id || !judgePrompt) return null
    if (isSystemPrompt(input.prompt)) return null // 백그라운드 알림 등 — 진행 중인 계획을 덮어쓰지 않는다
    const prev = lastAssistantText ? lastAssistantText(input.transcript_path) : ''
    const v = judgePrompt(input.prompt, prev)
    if (!v.approved) return null
    const now = new Date().toISOString()
    const plan = v.why === 'approved' ? extractPlan(prev) : { understanding: '', tasks: [] }
    const rec = { session: id, approvedAt: now, lastActivity: now, plan, goal: String(input.prompt || '').slice(0, 300), files: [], announced: [] }
    save(fileOf(input, id), rec)
    return null
  }

  if (event === 'PostToolUse') {
    if (!id || !['Write', 'Edit', 'NotebookEdit'].includes(input.tool_name)) return null
    const ti = input.tool_input && typeof input.tool_input === 'object' ? input.tool_input : {}
    const target = ti.file_path || ti.notebook_path
    if (typeof target !== 'string' || !target) return null
    const p = fileOf(input, id)
    const rec = load(p)
    if (!rec) return null
    const rel = relPath(target, input.cwd)
    rec.files = (Array.isArray(rec.files) ? rec.files : []).filter(f => f !== rel).concat(rel).slice(-MAX_FILES)
    rec.lastActivity = new Date().toISOString()
    save(p, rec)
    return null
  }

  if (event === 'SessionStart') {
    const source = input.source
    if ((source === 'compact' || source === 'resume') && id) {
      const rec = load(fileOf(input, id))
      if (!rec) return null
      return ctx(render(rec, `[progress-tracker] 이 세션에서 진행 중인 작업 (${source === 'compact' ? '요약 직후' : '이어하기'}):`))
    }
    if (source === 'startup' || source === 'clear') {
      let best = null, bestPath = null
      let entries = []
      try { entries = fs.readdirSync(dirOf(input)).filter(f => f.endsWith('.json')) } catch { return null }
      for (const f of entries) {
        const p = path.join(dirOf(input), f)
        const rec = load(p)
        if (!rec || !rec.lastActivity) continue
        const at = Date.parse(rec.lastActivity)
        if (!Number.isFinite(at) || Date.now() - at > RECENT_MS) continue
        if (id && Array.isArray(rec.announced) && rec.announced.includes(id)) continue
        if (!best || at > Date.parse(best.lastActivity)) { best = rec; bestPath = p }
      }
      if (!best) return null
      if (id) { best.announced = (Array.isArray(best.announced) ? best.announced : []).concat(id).slice(-20); save(bestPath, best) }
      return ctx(render(best, '[progress-tracker] 직전 세션에서 승인된 작업이 있습니다 — 중간에 끊겼을 수 있습니다:'))
    }
  }
  return null
}

function ctx(text) {
  return { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text.slice(0, 9000) } }
}

if (require.main === module) {
  let input = null
  try { input = JSON.parse(fs.readFileSync(0, 'utf8')) } catch { process.exit(0) }
  let r = null
  try { r = handle(input) } catch { r = null }
  if (r) process.stdout.write(JSON.stringify(r) + '\n')
  process.exit(0)
} else {
  module.exports = { handle, extractPlan, render }
}
