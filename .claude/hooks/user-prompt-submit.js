#!/usr/bin/env node
/**
 * user-prompt-submit.js
 * Claude Code UserPromptSubmit Hook
 *
 * 사용자 입력에서 스킬을 써야 하는 신호가 있는데 스킬 미사용 패턴이 감지되면
 * 힌트를 출력해 Claude가 관련 스킬을 로드하도록 유도한다.
 *
 * 감지 패턴:
 * - 스킬/에이전트 생성 요청 → skill-creator / agent-creator 스킬 사용 상기
 * - 버그/에러 수정 요청     → systematic-debugging 스킬 사용 상기
 * - 새 기능 구현 요청       → brainstorming 스킬 사용 상기
 * - Git 커밋 요청           → git rules 준수 상기
 */

const readline = require('readline')

// 패턴 → 힌트 매핑
const PATTERNS = [
  {
    regex: /스킬\s*(만들어|생성|추가|작성)|skill\s*(create|make|add)/i,
    hint: '💡 skill-creator 에이전트 또는 superpowers:writing-skills 스킬을 사용하세요.',
  },
  {
    regex: /에이전트\s*(만들어|생성|추가|작성)|agent\s*(create|make|add)/i,
    hint: '💡 agent-creator 에이전트를 사용하세요.',
  },
  {
    regex: /버그|에러|오류|error|bug|fix|수정해|고쳐/i,
    hint: '💡 superpowers:systematic-debugging 스킬을 먼저 사용하세요.',
  },
  {
    regex: /기능\s*(추가|구현|만들어)|feature|implement|새로\s*만들/i,
    hint: '💡 superpowers:brainstorming 스킬로 요구사항을 먼저 정리하세요.',
  },
  {
    regex: /커밋|commit/i,
    hint: '💡 .claude/rules/git.md 커밋 컨벤션을 따르세요 — [category] Type: Subject 형식.',
  },
]

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const prompt = (input.prompt || input.user_message || '').trim()
  if (!prompt) return process.exit(0)

  const matched = PATTERNS.filter(p => p.regex.test(prompt))
  if (matched.length === 0) return process.exit(0)

  const hints = matched.map(p => `  ${p.hint}`).join('\n')
  const msg = `\n${hints}\n`
  process.stderr.write(msg)

  process.exit(0)
}

main().catch(() => process.exit(0))
