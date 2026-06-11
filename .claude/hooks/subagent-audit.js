#!/usr/bin/env node
/**
 * subagent-audit.js
 * Claude Code SubagentStart + SubagentStop Hook
 *
 * 어떤 서브에이전트가 언제 실행됐는지 감사 로그 기록
 * 로그: /tmp/claude-subagent-audit-{YYYY-MM-DD}.log
 *
 * SubagentStart: 에이전트 실행 시작 시점 기록
 * SubagentStop: 에이전트 종료 + 소요 시간 계산
 */

const readline = require('readline')
const fs = require('fs')
const os = require('os')
const path = require('path')

function logFile() {
  const date = new Date().toISOString().slice(0, 10)
  return path.join(os.tmpdir(), `claude-subagent-audit-${date}.log`)
}

function startTimerFile(subagentId) {
  return path.join(os.tmpdir(), `claude-subagent-start-${subagentId}.txt`)
}

function appendLog(line) {
  try { fs.appendFileSync(logFile(), line + '\n') } catch {}
}

function handleStart(input) {
  const {
    session_id = 'unknown',
    subagent_id = 'unknown',
    tool_input = {},
  } = input

  const agentType = tool_input.subagent_type || tool_input.agent_type || tool_input.type || 'general-purpose'
  const desc = (tool_input.description || '').slice(0, 60)
  const ts = new Date().toISOString()

  // 시작 시각 저장 (Stop 시 소요 시간 계산용)
  try {
    fs.writeFileSync(startTimerFile(subagent_id), String(Date.now()))
  } catch {}

  appendLog(`[${ts}] START | session=${session_id} | subagent=${subagent_id} | type=${agentType} | desc="${desc}"`)
}

function handleStop(input) {
  const {
    session_id = 'unknown',
    subagent_id = 'unknown',
    tool_result = {},
  } = input

  const ts = new Date().toISOString()
  const timerFile = startTimerFile(subagent_id)

  let elapsed = '?'
  if (fs.existsSync(timerFile)) {
    try {
      const startMs = parseInt(fs.readFileSync(timerFile, 'utf8'), 10)
      elapsed = `${((Date.now() - startMs) / 1000).toFixed(1)}s`
      fs.unlinkSync(timerFile)
    } catch {}
  }

  // tool_result가 문자열이면 길이만, 객체면 간단히 요약
  let resultSummary = ''
  if (typeof tool_result === 'string') {
    resultSummary = `len=${tool_result.length}`
  } else if (tool_result && typeof tool_result === 'object') {
    resultSummary = `keys=[${Object.keys(tool_result).join(',')}]`
  }

  appendLog(`[${ts}] STOP  | session=${session_id} | subagent=${subagent_id} | elapsed=${elapsed} | result=${resultSummary}`)
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const eventName = input.hook_event_name || input.hookEventName

  if (eventName === 'SubagentStart') handleStart(input)
  else if (eventName === 'SubagentStop') handleStop(input)

  process.exit(0)
}

main().catch(() => process.exit(0))
