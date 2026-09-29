#!/usr/bin/env node
/**
 * instructions-loaded.js
 * Claude Code InstructionsLoaded Hook
 *
 * 세션 시작 시 이 설치본이 기대하는 rules/ 파일(매니페스트·CLAUDE.md import 기준)이 존재하는지 검증한다.
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

// 기대 규칙 산정 (설치본마다 규칙 구성이 다르다 — 작성도구 옵션 규칙 4종은 기본 설치에 없음):
//   1) 설치 매니페스트 .claude/.install-manifest.json 의 rules (설치기가 실제로 깐 규칙)
//   2) CLAUDE.md(루트 또는 .claude/) 가 @.claude/rules/*.md 로 import 하는 규칙 (원본 레포·수동 설치)
//   → 1·2 합집합. 둘 다 없으면 기대 근거가 없으므로 경고하지 않는다 (고정 목록 하드코딩 금지 — 거짓 경고 원인)
const CAP = 9000 // 문서 상한 10,000자 여유
const MAX_READ = 1024 * 1024
const MAX_NAME = 200
// rules/ 하위 상대 .md 경로만 — 절대경로·../·역슬래시·개행·제어문자 차단(존재 탐침·컨텍스트 주입 방지)
const SAFE_NAME = /^[\p{L}\p{N}_.-]+(\/[\p{L}\p{N}_.-]+)*\.md$/u
function isSafeRuleName(n) {
  if (typeof n !== 'string' || n.length === 0 || n.length > MAX_NAME) return false
  if (!SAFE_NAME.test(n)) return false
  return n.split('/').every(seg => seg !== '.' && seg !== '..')
}

function readSmall(p) {
  try {
    const st = fs.statSync(p)
    if (!st.isFile() || st.size > MAX_READ) return null
    return fs.readFileSync(p, 'utf8')
  } catch { return null }
}

function manifestRules(projectDir) {
  const raw = readSmall(path.join(projectDir, '.claude', '.install-manifest.json'))
  if (raw === null) return []
  try {
    const m = JSON.parse(raw)
    return m && Array.isArray(m.rules) ? m.rules.filter(isSafeRuleName) : []
  } catch { return [] }
}

function claudeMdImports(projectDir) {
  const out = []
  for (const p of [path.join(projectDir, 'CLAUDE.md'), path.join(projectDir, '.claude', 'CLAUDE.md')]) {
    const txt = readSmall(p)
    if (txt === null) continue
    for (const m of txt.matchAll(/@\.claude\/rules\/([^\s)`'"|<>\]]+?\.md)(?![\w.-])/g)) {
      if (isSafeRuleName(m[1])) out.push(m[1])
    }
  }
  return out
}

function expectedRules(projectDir) {
  return [...new Set([...manifestRules(projectDir), ...claudeMdImports(projectDir)])].sort()
}

const clip = (s) => (s.length > CAP ? s.slice(0, CAP - 20) + '\n  ... (생략)' : s)

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd()
  const rulesDir = path.resolve(projectDir, '.claude', 'rules')

  // rules/ 디렉토리가 없으면 무시 (다른 프로젝트일 수 있음)
  if (!fs.existsSync(rulesDir)) return process.exit(0)

  // compact·resume·fork 는 같은 대화의 연장 — 이미 startup/clear 에서 안내됐으므로 반복 출력 금지
  const isSessionStart = !!input && input.hook_event_name === 'SessionStart'
  if (isSessionStart && ['compact', 'resume', 'fork'].includes(input.source)) return process.exit(0)

  const missing = expectedRules(projectDir).filter(f => {
    const full = path.resolve(rulesDir, f)
    if (!full.startsWith(rulesDir + path.sep)) return false // 이중 방어
    return !fs.existsSync(full)
  })

  if (missing.length > 0) {
    const lines = [
      `⚠️  누락된 rules/ 파일 감지 (${missing.length}개)`,
      ...missing.map(f => `  · .claude/rules/${f}`),
      '   → 파일이 삭제됐거나 경로가 변경됐을 수 있습니다',
    ]
    // 이벤트명은 정확 일치(문자열·대소문자)만 인정 — 위장 입력은 레거시 경로
    if (isSessionStart) {
      // SessionStart 모드: 문서상 stdout JSON 만 Claude(additionalContext)·사용자(systemMessage)에게 전달된다
      const text = clip(lines.join('\n'))
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
