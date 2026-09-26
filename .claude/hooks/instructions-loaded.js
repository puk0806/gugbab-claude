#!/usr/bin/env node
/**
 * instructions-loaded.js
 * Claude Code InstructionsLoaded Hook
 *
 * CLAUDE.md가 로드될 때마다 핵심 rules/ 파일이 존재하는지 검증한다.
 * 누락된 규칙 파일이 있으면 경고를 출력해 사용자에게 알린다.
 *
 * 출력 채널 (공식 문서 code.claude.com/docs/en/hooks):
 *   - InstructionsLoaded: "Claude Code discards their JSON output fields" + exit 0 stderr 는
 *     "debug log only, never the transcript, and Claude never sees it" → 경고가 아무에게도 안 보인다
 *   - SessionStart(stdin hook_event_name === 'SessionStart'): stdout JSON
 *     hookSpecificOutput.additionalContext(Claude) + systemMessage(사용자) 로 전달 → settings 에서 SessionStart 배선 필요
 */

const readline = require('readline')
const fs = require('fs')
const path = require('path')

const REQUIRED_RULES = [
  'agent-design.md',
  'creation-workflow.md',
  'git.md',
  'info-verification.md',
  'readme-update.md',
  'verification-policy.md',
]

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd()
  const rulesDir = path.join(projectDir, '.claude', 'rules')

  // rules/ 디렉토리가 없으면 무시 (다른 프로젝트일 수 있음)
  if (!fs.existsSync(rulesDir)) return process.exit(0)

  const missing = REQUIRED_RULES.filter(f => !fs.existsSync(path.join(rulesDir, f)))

  if (missing.length > 0) {
    const lines = [
      `⚠️  누락된 rules/ 파일 감지 (${missing.length}개)`,
      ...missing.map(f => `  · .claude/rules/${f}`),
      '   → 파일이 삭제됐거나 경로가 변경됐을 수 있습니다',
    ]
    // 이벤트명은 정확 일치(문자열·대소문자)만 인정 — 위장 입력은 레거시 경로
    if (input && input.hook_event_name === 'SessionStart') {
      // SessionStart 모드: 문서상 stdout JSON 만 Claude(additionalContext)·사용자(systemMessage)에게 전달된다
      const text = lines.join('\n')
      process.stdout.write(JSON.stringify({
        systemMessage: text,
        hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text },
      }))
    } else {
      // 레거시(InstructionsLoaded) 경로: 문서상 출력이 폐기되고 stderr 는 debug log 전용 — 관측용으로만 유지
      process.stderr.write(['', lines[0].replace('⚠️  ', '⚠️  InstructionsLoaded: '), ...lines.slice(1), ''].join('\n'))
    }
  }

  process.exit(0)
}

main().catch(() => process.exit(0))
