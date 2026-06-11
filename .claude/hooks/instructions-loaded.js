#!/usr/bin/env node
/**
 * instructions-loaded.js
 * Claude Code InstructionsLoaded Hook
 *
 * CLAUDE.md가 로드될 때마다 핵심 rules/ 파일이 존재하는지 검증한다.
 * 누락된 규칙 파일이 있으면 경고를 출력해 사용자에게 알린다.
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
    const msg = [
      '',
      `⚠️  InstructionsLoaded: 누락된 rules/ 파일 감지 (${missing.length}개)`,
      ...missing.map(f => `  · .claude/rules/${f}`),
      '   → 파일이 삭제됐거나 경로가 변경됐을 수 있습니다',
      '',
    ].join('\n')
    process.stderr.write(msg)
  }

  process.exit(0)
}

main().catch(() => process.exit(0))
