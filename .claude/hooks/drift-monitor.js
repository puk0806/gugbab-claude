#!/usr/bin/env node
/**
 * drift-monitor.js
 * Claude Code PostToolUse Hook (Write | Edit)
 *
 * 목적: 작업 중 *원래 의도(spec)*에서 의미적 이탈 감지
 *
 * Ouroboros Agent OS의 drift-monitor 컨셉을 우리 프로젝트에 맞게 단순화한 버전.
 *
 * 동작:
 *   1. 프로젝트 루트에 .claude/spec.md (또는 SPEC.md)가 존재하면 읽음
 *   2. 방금 변경된 파일이 spec.md의 *명시 범위* 안인지 확인
 *   3. 다음 패턴 감지 시 경고 출력 (block 아님 — 사용자 인지용):
 *      - spec.md의 "범위 외(Out of Scope)" 섹션에 해당하는 경로/주제로 변경
 *      - spec.md의 "금지(Do Not)" 섹션에 해당하는 패턴 발견
 *      - 짧은 시간 내 동일 파일 5회 이상 반복 수정 (빙빙 도는 신호)
 *   4. spec.md가 없으면 동작 안 함 (silent pass)
 *
 * 비파괴 원칙:
 *   - exit 0 = 통과 (정상)
 *   - exit 0 + reason 출력 = 경고만 (Claude 인지)
 *   - exit 2 = 차단 (이 훅은 차단하지 않음)
 *
 * 사용법:
 *   1. 프로젝트 루트에 .claude/spec.md 작성
 *   2. .claude/settings.json의 PostToolUse Write|Edit matcher에 본 훅 등록
 *
 * spec.md 형식 (예시):
 *   # 작업 명세
 *
 *   ## 목표
 *   - akrasia 학위논문 작성
 *
 *   ## 범위 (In Scope)
 *   - akrasia-thesis-draft.md 본문
 *   - 6장 목차 (1장 서론 ~ 7장 결론)
 *
 *   ## 범위 외 (Out of Scope)
 *   - 다른 학술 분야
 *   - 학교 행정 문서
 *
 *   ## 금지 (Do Not)
 *   - "지도교수 AI 사용" 표기
 *   - 본 연구 주제 변경
 */

const readline = require('readline')
const fs = require('fs')
const path = require('path')

const STATE_DIR = '.claude/state'
const STATE_FILE = path.join(STATE_DIR, 'drift-monitor-history.json')
const REPEAT_THRESHOLD = 5 // 5회 이상 반복 수정 = 빙빙 도는 신호
const REPEAT_WINDOW_MS = 10 * 60 * 1000 // 10분 윈도

function findProjectRoot(startDir) {
  let dir = startDir
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.claude'))) return dir
    if (fs.existsSync(path.join(dir, '.git'))) return dir
    dir = path.dirname(dir)
  }
  return startDir
}

function loadSpec(projectRoot) {
  const candidates = [
    path.join(projectRoot, '.claude/spec.md'),
    path.join(projectRoot, 'SPEC.md'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        return { content: fs.readFileSync(p, 'utf8'), path: p }
      } catch {
        return null
      }
    }
  }
  return null
}

function extractSection(spec, sectionName) {
  const re = new RegExp(`##+\\s*${sectionName}([\\s\\S]*?)(?=\\n##+\\s|$)`, 'i')
  const m = spec.match(re)
  return m ? m[1].trim() : ''
}

function checkOutOfScope(spec, filePath) {
  const oos = extractSection(spec, '범위\\s*외|Out\\s*of\\s*Scope')
  if (!oos) return null
  const lines = oos.split('\n').map(l => l.trim()).filter(l => l.startsWith('-'))
  for (const line of lines) {
    const item = line.replace(/^-\s*/, '').trim()
    if (!item) continue
    if (filePath.includes(item) || filePath.toLowerCase().includes(item.toLowerCase())) {
      return item
    }
  }
  return null
}

function checkForbidden(spec, content) {
  const forbidden = extractSection(spec, '금지|Do\\s*Not|Forbidden')
  if (!forbidden || !content) return null
  const lines = forbidden.split('\n').map(l => l.trim()).filter(l => l.startsWith('-'))
  for (const line of lines) {
    const pattern = line.replace(/^-\s*/, '').replace(/^["'`]|["'`]$/g, '').trim()
    if (!pattern) continue
    if (content.includes(pattern)) {
      return pattern
    }
  }
  return null
}

function loadHistory(projectRoot) {
  const file = path.join(projectRoot, STATE_FILE)
  try {
    if (!fs.existsSync(file)) return {}
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return {}
  }
}

function saveHistory(projectRoot, history) {
  try {
    const dir = path.join(projectRoot, STATE_DIR)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(projectRoot, STATE_FILE), JSON.stringify(history, null, 2))
  } catch {
    // ignore
  }
}

function checkRepeat(projectRoot, filePath) {
  const history = loadHistory(projectRoot)
  const now = Date.now()
  const cutoff = now - REPEAT_WINDOW_MS

  const entries = (history[filePath] || []).filter(t => t > cutoff)
  entries.push(now)
  history[filePath] = entries

  // Cleanup: remove old entries from other files
  for (const k of Object.keys(history)) {
    history[k] = (history[k] || []).filter(t => t > cutoff)
    if (history[k].length === 0) delete history[k]
  }

  saveHistory(projectRoot, history)

  return entries.length >= REPEAT_THRESHOLD ? entries.length : null
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()
  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const { hook_event_name, hookEventName, tool_name, tool_input = {} } = input
  const eventName = hook_event_name || hookEventName

  if (eventName !== 'PostToolUse') return process.exit(0)
  if (tool_name !== 'Write' && tool_name !== 'Edit') return process.exit(0)

  const filePath = (tool_input.file_path || '').replace(/\\/g, '/')
  if (!filePath) return process.exit(0)

  const projectRoot = findProjectRoot(input.cwd || process.cwd())
  const spec = loadSpec(projectRoot)
  if (!spec) return process.exit(0) // spec.md 없음 — silent pass

  const warnings = []

  // 1. 범위 외 감지
  const oos = checkOutOfScope(spec.content, filePath)
  if (oos) {
    warnings.push(
      `[범위 외 감지] ${path.relative(projectRoot, filePath)} 파일이 spec.md의 *범위 외* 항목 "${oos}"에 해당할 수 있습니다.`
    )
  }

  // 2. 금지 패턴 감지 (Write의 content만 가능, Edit은 불가)
  if (tool_name === 'Write') {
    const content = tool_input.content || ''
    const forbidden = checkForbidden(spec.content, content)
    if (forbidden) {
      warnings.push(
        `[금지 패턴 감지] 작성된 내용에 spec.md의 *금지* 항목 "${forbidden}"이 포함되어 있습니다.`
      )
    }
  }

  // 3. 반복 수정 감지
  const repeatCount = checkRepeat(projectRoot, filePath)
  if (repeatCount) {
    warnings.push(
      `[반복 수정 감지] ${path.relative(projectRoot, filePath)} 파일을 최근 10분 내 ${repeatCount}회 수정했습니다. 같은 곳을 빙빙 도는 신호일 수 있습니다 — 잠시 멈추고 접근 방식을 다시 검토해 보세요.`
    )
  }

  if (warnings.length === 0) return process.exit(0)

  const message = [
    `[drift-monitor] spec.md 기준 잠재적 드리프트 감지`,
    `(spec: ${path.relative(projectRoot, spec.path)})`,
    '',
    ...warnings,
    '',
    '※ 이 메시지는 *경고만*입니다. 차단하지 않습니다. 의도된 변경이면 무시하세요.',
  ].join('\n')

  process.stdout.write(JSON.stringify({ reason: message }) + '\n')
  process.exit(0) // 차단하지 않음 (경고만)
}

main().catch(() => process.exit(0))
