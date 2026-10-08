#!/usr/bin/env node
/**
 * korean-response-guard.test.js
 * 실행: node .claude/hooks/korean-response-guard.test.js
 *
 * 3계층: 정상(한국어 답변 통과·지시 주입) / 악성·우회(영어 답변 차단, 코드로 위장한 영어 문장)
 *        / 이상·경계(빈 입력·깨진 JSON·비문자열·짧은 답변·루프 방지·대화 기록 손상)
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'korean-response-guard.js')

let passed = 0, failed = 0

function runRaw(stdin) {
  const r = spawnSync('node', [HOOK], { input: stdin, encoding: 'utf8', timeout: 5000 })
  const out = (r.stdout || '').trim()
  let json = null
  try { json = out ? JSON.parse(out) : null } catch { json = 'INVALID_JSON' }
  return { code: r.status, json }
}

function run(input) { return runRaw(JSON.stringify(input)) }

function check(desc, cond, detail) {
  console.log(`  ${cond ? '✅' : '❌'} ${desc}${cond ? '' : ` → FAIL ${detail ? JSON.stringify(detail) : ''}`}`)
  cond ? passed++ : failed++
}

const isBlock = r => r.json && r.json.decision === 'block'
const isPass = r => r.code === 0 && r.json === null

function stop(msg, extra = {}) { return run({ hook_event_name: 'Stop', last_assistant_message: msg, ...extra }) }

function transcriptWith(userText) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'krg-'))
  const f = path.join(dir, 't.jsonl')
  const lines = [
    { type: 'user', message: { role: 'user', content: userText } },
    { type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: 'ok' }] } },
    { type: 'user', message: { role: 'user', content: [{ type: 'tool_result', content: 'tool output' }] } },
  ]
  fs.writeFileSync(f, lines.map(l => JSON.stringify(l)).join('\n') + '\n')
  return f
}

const KOREAN = '전체 테스트를 실행했고 모두 통과했습니다. 설치 스크립트의 공통 훅 목록에 새 훅을 추가했고, 설정 파일에도 연결했습니다. 다음 단계로 문서를 갱신하겠습니다.'
const ENGLISH = 'I ran the full test suite and everything passed. I added the new hook to the common hook list in the installer and wired it into the settings file. Next I will update the documentation.'

console.log('🔍 korean-response-guard 테스트 시작')

console.log('\n── 정상 경로 ──')
check('한국어 답변 → 통과', isPass(stop(KOREAN)))
check('한국어 + 코드 블록(영어 코드) → 통과', isPass(stop(`${KOREAN}\n\n\`\`\`js\nconst result = handle(input) // returns the decision for every event\nconsole.log(result)\n\`\`\``)))
check('한국어 + 경로·도구명·URL 다수 → 통과', isPass(stop(`\`auto-approve.js\`와 .claude/hooks/bash-guard.js 를 수정했고 https://code.claude.com/docs/en/hooks 문서를 확인했습니다. PreToolUse 와 PermissionRequest 이벤트는 그대로 두고 SAFE_TOOLS 목록만 바꿨습니다. 테스트도 모두 통과했습니다.`)))
{
  const r = run({ hook_event_name: 'UserPromptSubmit', prompt: '이거 수정해줘' })
  check('UserPromptSubmit → 한국어 지시 주입', r.json && r.json.hookSpecificOutput && r.json.hookSpecificOutput.hookEventName === 'UserPromptSubmit' && /한국어/.test(r.json.hookSpecificOutput.additionalContext), r.json)
}

console.log('\n── 차단·우회 시도 ──')
check('영어 답변 → 차단', isBlock(stop(ENGLISH)))
check('차단 사유가 한국어로 재작성 지시', (stop(ENGLISH).json || {}).reason?.includes('한국어로 다시'))
check('영어 문장 + 한국어 한 단어 끼워넣기 → 여전히 차단', isBlock(stop(`확인: ${ENGLISH} ${ENGLISH}`)))
check('영어 문장을 인라인 코드 밖 굵은 글씨로 → 차단', isBlock(stop(`**${ENGLISH}**`)))
check('영어 표(markdown table) 답변 → 차단', isBlock(stop(`| Item | Status | Note |\n|---|---|---|\n| hooks | done | all wired into the settings file |\n| tests | done | every suite passes on this machine now |\n| docs | pending | will update the readme next |`)))
check('사용자가 "영어로" 요청한 질문의 영어 답변 → 통과', isPass(stop(ENGLISH, { transcript_path: transcriptWith('이거 영어로 설명해줘') })))
check('사용자 질문이 일반 한국어면 영어 답변 → 차단', isBlock(stop(ENGLISH, { transcript_path: transcriptWith('이거 설명해줘') })))
check('tool_result 안의 "in English" 문자열은 영어 요청으로 보지 않음', (() => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'krg-'))
  const f = path.join(dir, 't.jsonl')
  fs.writeFileSync(f, [
    JSON.stringify({ type: 'user', message: { content: '설명해줘' } }),
    JSON.stringify({ type: 'user', message: { content: [{ type: 'tool_result', content: 'reply in english' }] } }),
  ].join('\n'))
  return isBlock(stop(ENGLISH, { transcript_path: f }))
})())
check('UserPromptSubmit 에서 영어 요청 시 지시 주입 안 함', isPass(run({ hook_event_name: 'UserPromptSubmit', prompt: 'please answer in English' })))

console.log('\n── 이상·경계 경로 ──')
check('stop_hook_active=true (재작성 중) → 통과 (무한 루프 방지)', isPass(stop(ENGLISH, { stop_hook_active: true })))
check('짧은 답변(단어 8개 미만) → 통과', isPass(stop('Done. All tests pass.')))
check('코드 블록만 있는 답변 → 통과', isPass(stop('```bash\nnode --test scripts/*.test.js\ngit status --short\n```')))
check('빈 답변 → 통과', isPass(stop('')))
check('last_assistant_message 누락 → 통과', isPass(run({ hook_event_name: 'Stop' })))
check('last_assistant_message 비문자열(숫자·객체) → 통과', isPass(stop(12345)) && isPass(stop({ text: ENGLISH })))
check('깨진 JSON 입력 → 통과', isPass(runRaw('{not json')))
check('빈 stdin → 통과', isPass(runRaw('')))
check('JSON null 입력 → 통과', isPass(runRaw('null')))
check('알 수 없는 이벤트 → 통과', isPass(run({ hook_event_name: 'PreToolUse', tool_name: 'Read' })))
check('존재하지 않는 transcript_path → 영어 답변 차단 유지', isBlock(stop(ENGLISH, { transcript_path: '/nonexistent/krg/x.jsonl' })))
check('transcript_path 가 디렉토리 → 크래시 없이 차단 유지', isBlock(stop(ENGLISH, { transcript_path: os.tmpdir() })))
check('닫히지 않은 코드 블록 → 크래시 없이 통과', isPass(stop(`${KOREAN}\n\`\`\`\n${ENGLISH}`)))
check('초장문 한국어(200KB) → 통과', isPass(stop(KOREAN.repeat(1500))))
check('제로폭·제어문자 섞인 영어 → 차단', isBlock(stop(ENGLISH.replace(/ /g, ' ​'))))

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
