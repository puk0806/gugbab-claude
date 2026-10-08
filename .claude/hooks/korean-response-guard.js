#!/usr/bin/env node
// korean-response-guard.js — UserPromptSubmit + Stop Hook (공통, 모든 템플릿)
//
// 목적: Claude 답변을 한국어로 강제한다 (2026-10-06 사용자 요청 — 답변이 영어로 새는 문제)
//
// UserPromptSubmit: 매 질문마다 "한국어로 답변" 지시를 컨텍스트에 주입 (예방)
// Stop: 마지막 답변(last_assistant_message)의 한국어 비율 검사 → 미달이면 decision:block (교정)
//   - 코드 블록·인라인 코드·URL·경로·식별자는 계산에서 제외 (코드·도구명은 원문 유지가 정상)
//   - 판정 단위는 "단어" — 한글 1음절과 영문 1글자를 같은 무게로 세면 한국어 답변도 영어로 오판된다
//   - stop_hook_active === true 면 통과 (재작성 1회만 요구 — 무한 루프 방지)
//   - 사용자가 직전 질문에서 영어를 명시 요청(영어로·in English)하면 통과
//   - 입력 이상(빈 값·깨진 JSON·비문자열)은 통과 (fail-open — 답변 자체를 막는 훅이므로 오탐보다 미탐이 안전)

const fs = require('fs')

const MIN_WORDS = 8        // 판정 대상 단어가 이보다 적으면 검사하지 않음 (짧은 확인 답변 등)
const MIN_KOREAN_RATIO = 0.5 // 한글 단어 / (한글 단어 + 영문 단어)
const TRANSCRIPT_TAIL_BYTES = 256 * 1024

const CONTEXT_MSG = '[korean-response-guard] 답변은 반드시 한국어로 작성한다. 코드·명령어·파일 경로·도구 이름만 원문을 유지하고, 설명 문장은 영어로 쓰지 않는다.'
const BLOCK_MSG = '[korean-response-guard] 직전 답변이 한국어가 아닌 문장 위주로 작성됐습니다. 같은 내용을 한국어로 다시 작성하세요. 코드·명령어·파일 경로·도구 이름만 원문을 유지합니다.'

const ENGLISH_REQUEST_RE = /영어로|영문으로|in english|english please|answer in english|reply in english/i

// 계산에서 제외할 부분을 지운 순수 문장 텍스트
function proseOf(text) {
  return String(text)
    .replace(/```[\s\S]*?(?:```|$)/g, ' ')        // 코드 블록 (닫히지 않은 블록 포함)
    .replace(/~~~[\s\S]*?(?:~~~|$)/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')                   // 인라인 코드
    .replace(/https?:\/\/\S+/g, ' ')              // URL
    .replace(/<[^>\n]{1,200}>/g, ' ')             // HTML·XML 태그
    .replace(/(?:~|\.{1,2})?\/?[\w.@-]+(?:\/[\w.@-]+)+\/?/g, ' ') // 경로 (a/b, ./a, ~/a)
    .replace(/\b[\w-]+\.(?:js|ts|tsx|jsx|json|md|sh|py|java|rs|yml|yaml|toml|html|css)\b/gi, ' ') // 파일명
}

function countWords(text) {
  const prose = proseOf(text)
  let korean = 0
  let english = 0
  for (const token of prose.split(/\s+/)) {
    if (!token) continue
    if (/[가-힣ㄱ-ㆎ]/.test(token)) { korean++; continue }
    // 식별자 형태(camelCase·snake_case·kebab-case·숫자 포함·전부 대문자 약어)는 코드 성격이라 제외
    const word = token.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '')
    if (!/^[A-Za-z]{2,}$/.test(word)) continue
    if (/[a-z][A-Z]/.test(word) || /^[A-Z]+$/.test(word)) continue
    english++
  }
  return { korean, english }
}

function isMostlyKorean(text) {
  if (typeof text !== 'string') return true
  const { korean, english } = countWords(text)
  const total = korean + english
  if (total < MIN_WORDS) return true
  return korean / total >= MIN_KOREAN_RATIO
}

// 대화 기록에서 마지막 "사람이 쓴" 질문 문자열 (tool_result 제외)
function lastUserPrompt(transcriptPath) {
  if (typeof transcriptPath !== 'string' || !transcriptPath) return ''
  let fd
  try {
    fd = fs.openSync(transcriptPath, 'r')
    const size = fs.fstatSync(fd).size
    const len = Math.min(size, TRANSCRIPT_TAIL_BYTES)
    const buf = Buffer.alloc(len)
    fs.readSync(fd, buf, 0, len, size - len)
    const lines = buf.toString('utf8').split('\n')
    for (let i = lines.length - 1; i >= 0; i--) {
      let entry
      try { entry = JSON.parse(lines[i]) } catch { continue }
      if (!entry || entry.type !== 'user' || !entry.message) continue
      const c = entry.message.content
      if (typeof c === 'string') return c
      if (Array.isArray(c)) {
        const texts = c.filter(p => p && p.type === 'text' && typeof p.text === 'string').map(p => p.text)
        if (texts.length > 0) return texts.join('\n')
      }
    }
  } catch { /* 읽기 실패 → 영어 요청 없음으로 간주 */ } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* ignore */ }
  }
  return ''
}

function handle(input) {
  if (!input || typeof input !== 'object') return null
  const event = input.hook_event_name || input.hookEventName

  if (event === 'UserPromptSubmit') {
    if (typeof input.prompt === 'string' && ENGLISH_REQUEST_RE.test(input.prompt)) return null
    return { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: CONTEXT_MSG } }
  }

  if (event === 'Stop') {
    if (input.stop_hook_active === true) return null
    if (isMostlyKorean(input.last_assistant_message)) return null
    if (ENGLISH_REQUEST_RE.test(lastUserPrompt(input.transcript_path))) return null
    return { decision: 'block', reason: BLOCK_MSG }
  }

  return null
}

if (require.main === module) {
  let raw = ''
  try { raw = fs.readFileSync(0, 'utf8') } catch { process.exit(0) }
  let input
  try { input = JSON.parse(raw) } catch { process.exit(0) }
  const result = handle(input)
  if (result) process.stdout.write(JSON.stringify(result) + '\n')
  process.exit(0)
} else {
  module.exports = { handle, isMostlyKorean, countWords, proseOf, lastUserPrompt, MIN_WORDS, MIN_KOREAN_RATIO }
}
