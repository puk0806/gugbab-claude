#!/usr/bin/env node
/**
 * readme-guard.js
 * Claude Code PreToolUse (Bash) + Stop Hook
 *
 * 목적: 스킬/에이전트 파일 추가·수정 후 README.md 미업데이트 감지
 *
 * 동작:
 *   PreToolUse Bash — git commit / git push 직전 체크
 *     → SKILL.md 또는 agents/ .md 수정 시 README.md 미업데이트 → permissionDecision: deny (차단)
 *   Stop — 경고만 (exit 0 + stderr): commit 없이 세션 종료 시 보조 안내
 *
 * 설계 의도:
 *   - 커밋/푸시 직전에 차단해야 실질적 강제력이 생김
 *   - Stop은 보조 안내 역할 (README 안 고쳤는데 세션만 끝내는 경우 대비)
 */

const readline = require('readline')
const fs = require('fs')
const os = require('os')
const path = require('path')

function sessionFilePath(sessionId) {
  return path.join(os.tmpdir(), `claude-session-${sessionId}.json`)
}

function loadSession(sessionId) {
  const fp = sessionFilePath(sessionId)
  if (!fs.existsSync(fp)) return { files: [] }
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')) } catch { return { files: [] } }
}

const SKILL_PATTERN = /\.claude\/skills\/.+\/SKILL\.md$/
const AGENT_PATTERN = /\.claude\/agents\/.+\.md$/
const README_PATTERN = /README\.md$/

function getUnupdatedAssets(sessionId) {
  const session = loadSession(sessionId)
  const files = session.files || []
  const changedAssets = files.filter(f => SKILL_PATTERN.test(f) || AGENT_PATTERN.test(f))
  if (changedAssets.length === 0) return null
  if (files.some(f => README_PATTERN.test(f))) return null
  return changedAssets
}

function shortPath(fp) {
  const parts = fp.split('/')
  for (const anchor of ['.claude', 'docs']) {
    const idx = parts.indexOf(anchor)
    if (idx !== -1) return parts.slice(idx).join('/')
  }
  return parts.slice(-3).join('/')
}

function buildAssetList(assets) {
  const list = assets.slice(0, 5).map(f => `  · ${shortPath(f)}`).join('\n')
  const overflow = assets.length > 5 ? `\n  ... 외 ${assets.length - 5}개` : ''
  return list + overflow
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const { hook_event_name, hookEventName, session_id, tool_name, tool_input = {} } = input
  const eventName = hook_event_name || hookEventName

  if (!session_id) return process.exit(0)

  // ── PreToolUse Bash: git commit / git push 직전 차단 ──────────────────
  if (eventName === 'PreToolUse') {
    if (tool_name !== 'Bash') return process.exit(0)
    const cmd = (tool_input.command || '').trim()
    if (!/\bgit\s+(commit|push)\b/.test(cmd)) return process.exit(0)

    const assets = getUnupdatedAssets(session_id)
    if (!assets) return process.exit(0)

    const reason = [
      `[readme-guard] README.md 미업데이트 — ${cmd.includes('push') ? '푸시' : '커밋'} 차단`,
      '',
      `스킬/에이전트 파일 ${assets.length}개가 수정됐지만 README.md가 업데이트되지 않았습니다.`,
      '',
      '수정된 파일:',
      buildAssetList(assets),
      '',
      '조치: README.md의 해당 섹션(목록·스킬 수·업데이트 로그)을 업데이트한 뒤 다시 시도하세요.',
      '참고: @.claude/rules/readme-update.md',
    ].join('\n')

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }) + '\n')
    return process.exit(0)
  }

  // ── Stop: 보조 경고 (차단 아님) ───────────────────────────────────────
  if (eventName === 'Stop') {
    const assets = getUnupdatedAssets(session_id)
    if (!assets) return process.exit(0)

    process.stdout.write([
      '[readme-guard] README.md 미업데이트 — 세션 종료 차단',
      '',
      `이번 세션에서 스킬/에이전트 파일 ${assets.length}개가 수정됐지만 README.md는 변경되지 않았습니다.`,
      '',
      '수정된 파일:',
      buildAssetList(assets),
      '',
      '즉시 README.md를 업데이트한 뒤 세션 종료를 재시도하세요.',
      '참고: @.claude/rules/readme-update.md',
    ].join('\n'))
    return process.exit(2)
  }

  process.exit(0)
}

main().catch(() => process.exit(0))
