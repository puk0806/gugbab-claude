#!/usr/bin/env node
/**
 * task-confirm-guard.test.js
 * 실행: node .claude/hooks/task-confirm-guard.test.js
 *
 * 3계층: 정상(확인 질문 → 승인 → 수정 허용) / 악성·우회(승인 없이 수정, 거절·수정 요청, 서브에이전트 기록 위장,
 *        세션 id 경로 조작) / 이상·경계(상태 없음·깨진 입력·대화 기록 손상·예외 경로 위장)
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'task-confirm-guard.js')
const { stateFile, judgePrompt } = require('./task-confirm-guard.js')
const { IS_WIN, linkDir } = require('./lib/testfs')

let passed = 0, failed = 0
const check = (desc, cond, detail) => {
  console.log(`  ${cond ? '✅' : '❌'} ${desc}${cond ? '' : ` → FAIL ${detail !== undefined ? JSON.stringify(detail) : ''}`}`)
  cond ? passed++ : failed++
}

function run(input) {
  const r = spawnSync('node', [HOOK], { input: typeof input === 'string' ? input : JSON.stringify(input), encoding: 'utf8', timeout: 5000 })
  return { code: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-'))
let n = 0
function transcript(lastAssistant, { sidechainAfter = null } = {}) {
  const f = path.join(tmp, `t${n++}.jsonl`)
  const lines = [
    { type: 'user', message: { role: 'user', content: '이거 구현해줘' } },
    { type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: lastAssistant }] } },
  ]
  if (sidechainAfter) lines.push({ type: 'assistant', isSidechain: true, message: { role: 'assistant', content: [{ type: 'text', text: sidechainAfter }] } })
  fs.writeFileSync(f, lines.map(l => JSON.stringify(l)).join('\n') + '\n')
  return f
}
const sid = () => `tcg-test-${process.pid}-${n++}`
const PLAN = '이렇게 이해했습니다: ...\n\n작업 목록:\n1. a\n2. b\n\n진행할까요?'
const prompt = (session, text, tPath) => run({ hook_event_name: 'UserPromptSubmit', session_id: session, prompt: text, transcript_path: tPath })
const write = (session, file = 'src/app.ts', tool = 'Write', extra = {}) =>
  run({ hook_event_name: 'PreToolUse', session_id: session, tool_name: tool, tool_input: { file_path: file, content: 'x' }, cwd: process.cwd(), ...extra })

console.log('🔍 task-confirm-guard 테스트 시작')

console.log('\n── 정상 경로 ──')
{
  const s = sid(); prompt(s, '응 진행해', transcript(PLAN))
  check('"진행할까요?" 뒤 "응 진행해" → Write 허용', write(s).code === 0)
  check('같은 차례의 Edit 도 허용', write(s, 'src/a.ts', 'Edit').code === 0)
  check('NotebookEdit 도 허용', write(s, 'n.ipynb', 'NotebookEdit').code === 0)
}
{
  const s = sid(); prompt(s, '네', transcript(PLAN))
  check('짧은 승인 "네" → 허용', write(s).code === 0)
}
{
  const s = sid(); prompt(s, '로그인 기능 바로 진행해', transcript('안녕하세요'))
  check('"바로 진행" 명시 → 확인 질문 없이도 허용', write(s).code === 0)
}
{
  const s = sid(); const r = prompt(s, '이거 설명해줘', transcript('완료했습니다.'))
  check('미승인 질문 → 절차 지시 주입', /진행할까요/.test(r.stdout) && JSON.parse(r.stdout).hookSpecificOutput.hookEventName === 'UserPromptSubmit', r.stdout)
  check('미승인이어도 메모리 폴더 쓰기는 허용', write(s, path.join(os.homedir(), '.claude/projects/-x/memory/a.md')).code === 0)
  // 윈도우 임시 폴더 = os.tmpdir() (`C:\Users\…\AppData\Local\Temp`, scratchpad 도 그 아래). 맥은 기존 경로 그대로
  const tmpFile = IS_WIN ? path.join(os.tmpdir(), 'claude', 'scratchpad', 'a.txt') : '/private/tmp/claude-1/scratchpad/a.txt'
  check('미승인이어도 임시 폴더 쓰기는 허용', write(s, tmpFile).code === 0)
  check('미승인이어도 계획 폴더 쓰기는 허용', write(s, path.join(os.homedir(), '.claude/plans/p.md')).code === 0)
  check('Read 등 다른 도구는 관여 안 함', run({ hook_event_name: 'PreToolUse', session_id: s, tool_name: 'Read', tool_input: { file_path: 'a' } }).code === 0)
  check('Bash 는 관여 안 함', run({ hook_event_name: 'PreToolUse', session_id: s, tool_name: 'Bash', tool_input: { command: 'ls' } }).code === 0)
}

console.log('\n── 차단·우회 시도 ──')
{
  const s = sid(); prompt(s, '로그인 기능 구현해줘', transcript('완료했습니다.'))
  const r = write(s)
  check('확인 질문 없이 바로 구현 요청 → Write 차단', r.code === 2 && r.stderr.includes('[task-confirm-guard]'), r)
  check('차단 사유가 stderr 로만 (stdout 오염 없음)', r.stdout === '')
  check('Edit 도 차단', write(s, 'src/a.ts', 'Edit').code === 2)
}
for (const reply of ['아니 그게 아니라 정리해서 가져와', '잠깐 그 전에 이거 먼저', 'A 말고 B로 해줘', '그건 하지 마', '다시 정리해서 가져와', '취소', 'no, wait'] ) {
  const s = sid(); prompt(s, reply, transcript(PLAN))
  check(`"진행할까요?" 뒤 거절·수정 요청 "${reply}" → 차단`, write(s).code === 2)
}
{
  const s = sid(); prompt(s, '응', transcript('완료했습니다.', { sidechainAfter: '진행할까요?' }))
  check('서브에이전트(사이드체인) 답변의 "진행할까요?"는 승인 근거 아님 → 차단', write(s).code === 2)
}
{
  const s = sid()
  prompt(s, '응 진행해', transcript('절차는 "이해했습니다 → 작업 목록 → 진행할까요?" 순서입니다.\n' + '설명 문단입니다. '.repeat(40) + '\n\n정해주시면 알려드리겠습니다.'))
  check('본문에서 인용한 "진행할까요?"(끝부분 아님)는 승인 근거 아님 → 차단', write(s).code === 2)
}
{
  const s = sid()
  prompt(s, '응', transcript('## 정해주실 것\n1. 계획 승인: 유지 / 자동 ("진행할까요?"가 이미 있으니 자동도 괜찮습니다)'))
  check('마지막 줄 속 따옴표 인용 "진행할까요?" → 승인 근거 아님 → 차단', write(s).code === 2)
}
{
  const s = sid(); prompt(s, '응', transcript('작업 목록:\n1. a\n\n**진행할까요?**'))
  check('굵게 표시한 마지막 줄 **진행할까요?** → 승인', write(s).code === 0)
}
{
  const s = sid(); prompt(s, '응', transcript(PLAN))
  const other = sid() // 다른 세션의 승인은 공유되지 않음
  check('다른 세션의 승인 상태로 수정 불가 → 차단', write(other).code === 2)
}
{
  const evil = '../../../../tmp/tcg-evil'
  const f = stateFile(evil)
  check('세션 id 경로 조작은 상태 파일 경로로 쓰이지 않음', path.dirname(f) === path.join(os.tmpdir(), 'claude-task-confirm-guard') && !f.includes('..'), f)
}
for (const q of ['이건 뭐야??', '왜 그렇게 해야 해?', '3번은 어떻게 동작하는 거지']) {
  const s = sid(); prompt(s, q, transcript(PLAN))
  check(`"진행할까요?" 뒤 승인 없는 되묻기 "${q}" → 차단`, write(s).code === 2)
}
{
  const s = sid(); prompt(s, '응 진행해 근데 테스트도 돌려줄래?', transcript(PLAN))
  check('승인 표현 + 덧붙인 질문 → 승인', write(s).code === 0)
}
{
  const s = sid(); prompt(s, '응', transcript(PLAN))
  prompt(s, '완료됐어?', transcript('네, 작업 중입니다.'))
  check('승인 후 다음 질문(확인 질문 없음)이 오면 승인 해제 → 차단', write(s).code === 2)
}
{
  // 실제 세션 버그 재현: 승인 뒤 백그라운드 작업 알림이 UserPromptSubmit 으로 들어와도 승인이 유지돼야 한다
  const s = sid(); prompt(s, '응 진행해', transcript(PLAN))
  prompt(s, '<task-notification>\n<task-id>abc</task-id>\n<status>completed</status>\n</task-notification>', transcript('작업 중입니다.'))
  check('백그라운드 작업 알림(<task-notification>) → 승인 유지 → Write 허용', write(s).code === 0)
  prompt(s, 'Stop hook feedback: [node x] blocked', transcript('작업 중입니다.'))
  check('Stop 훅 피드백 → 승인 유지', write(s).code === 0)
  const r = prompt(s, '<system-reminder>x</system-reminder>', transcript('x'))
  check('시스템 알림에는 절차 지시도 주입하지 않음', r.stdout === '', r.stdout)
}
{
  const s = sid(); prompt(s, '로그인 구현해줘', transcript('완료'))
  prompt(s, '<task-notification>…</task-notification>', transcript(PLAN))
  check('미승인 상태에서 알림이 와도 승인으로 바뀌지 않음 → 차단 유지', write(s).code === 2)
  const s2 = sid(); prompt(s2, '응', transcript(PLAN))
  prompt(s2, '잠깐 <task-notification> 이거 뭐야?', transcript('작업 중입니다.'))
  check('사람이 쓴 질문 중간의 태그 문자열은 알림으로 보지 않음 → 판정 대상 → 차단', write(s2).code === 2)
}
check('예외 경로 위장: /tmpx/a (임시 폴더 아님) → 차단', (() => { const s = sid(); prompt(s, '해줘', transcript('x')); return write(s, '/tmpx/a').code === 2 })())
check('예외 경로 위장: ~/.claude/projects/x/notmemory/a → 차단', (() => { const s = sid(); prompt(s, '해줘', transcript('x')); return write(s, path.join(os.homedir(), '.claude/projects/x/notmemory/a')).code === 2 })())
check('예외 경로 위장: memory/../../settings.json (상위 이동) → 차단', (() => { const s = sid(); prompt(s, '해줘', transcript('x')); return write(s, path.join(os.homedir(), '.claude/projects/x/memory/../../../settings.json')).code === 2 })())
// 래퍼(gugbab-claude) 설정 폴더: projects/·plans/ 가 ~/.claude 쪽 링크 — 링크를 따라간 실제 위치로 예외 판정 (2026-10-16)
{
  const HOME = os.homedir()
  const linked = fs.mkdtempSync(path.join(HOME, '.tcg-cfg-'))
  const fake = fs.mkdtempSync(path.join(HOME, '.tcg-cfg-'))
  linkDir(path.join(HOME, '.claude', 'projects'), path.join(linked, 'projects')) // 윈도우는 junction (심볼릭 링크 EPERM)
  fs.mkdirSync(path.join(fake, 'projects', 'x', 'memory'), { recursive: true })
  const s1 = sid(); prompt(s1, '해줘', transcript('x'))
  check('설정 폴더 projects 링크 안 메모리 → 미승인이어도 허용', write(s1, path.join(linked, 'projects', '-x', 'memory', 'a.md')).code === 0)
  const s2 = sid(); prompt(s2, '해줘', transcript('x'))
  check('예외 경로 위장: 링크 아닌 진짜 projects/x/memory 폴더 → 차단', write(s2, path.join(fake, 'projects', 'x', 'memory', 'a.md')).code === 2)
  const s3 = sid(); prompt(s3, '해줘', transcript('x'))
  check('예외 경로 위장: 링크 projects 안 notmemory → 차단', write(s3, path.join(linked, 'projects', '-x', 'notmemory', 'a.md')).code === 2)
  fs.unlinkSync(path.join(linked, 'projects')) // 링크만 먼저 제거 — rm 이 링크 너머 실제 ~/.claude/projects 로 들어가지 않게
  fs.rmSync(linked, { recursive: true, force: true })
  fs.rmSync(fake, { recursive: true, force: true })
}

console.log('\n── 승인 + 다른 행동 금지 부가 조건 (2026-10-20 실사용 오탐) ──')
{
  // 정상: 승인어로 시작하고 "하지 말고/하지 마" 가 *다른 행동*을 금지 → 승인
  for (const reply of ['응 진행해 커밋 푸쉬는 하지 말고 테스트까지만', '응 … 커밋 푸쉬는 하지 말고 …', '네 그렇게 해줘. 다만 main 에는 푸시하지 마', '진행해, README 는 건드리지 말고',
    'ㅇㅇ 근데 문서는 수정하지 말아줘', '좋아 진행하자 커밋은 하지마']) {
    const v = judgePrompt(reply, PLAN)
    check(`승인 + 금지 부가 조건 "${reply}" → 승인`, v.approved === true, v)
  }
  const s = sid(); prompt(s, '응 … 커밋 푸쉬는 하지 말고 …', transcript(PLAN))
  check('실사용 문장으로 승인 → Write 허용 (훅 경유)', write(s).code === 0)
  // 악성·우회: 승인어로 시작해도 진짜 거절·대체 요청이면 계속 거절
  for (const reply of ['아니 그거 하지 말고 다시', '응 아니 그거 하지 말고 다시 정리해', '네 잠깐 그거 하지 마', '응 근데 A 말고 B로 해줘', '응 다시 정리해서 가져와',
    '예전처럼 하지 말고 새로 짜', '네가 하지 말고 내가 할게', '그거 하지 마', '응 그만해 하지 마', '응 그 방식 말고 다른 방식']) {
    const v = judgePrompt(reply, PLAN)
    check(`진짜 거절·대체 "${reply}" → 거절`, v.approved === false, v)
  }
  // 이상·경계: 승인어만·빈 값·초장문·특수문자
  check('경계: "응" 단독 → 승인', judgePrompt('응', PLAN).approved === true)
  check('경계: 빈 문자열 → 승인(기존 동작: 확인 질문 뒤 거절 표현 없음)', judgePrompt('', PLAN).approved === true)
  check('경계: 초장문 금지 절 반복 → 크래시 없이 승인', judgePrompt('응 ' + '커밋 하지 말고 '.repeat(5000), PLAN).approved === true)
  check('경계: 확인 질문 없는 답 뒤의 승인+금지 → 미승인', judgePrompt('응 커밋은 하지 말고', '완료했습니다.').approved === false)
}

console.log('\n── 윈도우 임시 폴더·메모리 예외 (윈도우 전용 경로 모양) ──')
if (!IS_WIN) {
  console.log('  ⚠️ 건너뜀: 윈도우 예외 경로 6종 — 윈도우 전용 (맥은 /tmp·/var/folders 규칙 그대로)')
} else {
  const T = os.tmpdir()
  const mk = () => { const s = sid(); prompt(s, '해줘', transcript('x')); return s }
  check('윈도우: 임시 폴더 드라이브 소문자·슬래시 표기 → 허용', write(mk(), (T[0].toLowerCase() + T.slice(1)).replace(/\\/g, '/') + '/x/a.txt').code === 0)
  check('윈도우: 메모리 폴더 대소문자 다르게(`MEMORY`) → 허용', write(mk(), path.join(os.homedir(), '.Claude', 'Projects', '-x', 'MEMORY', 'a.md')).code === 0)
  check('윈도우 악성: 접두만 같은 형제 `Temp2` → 차단', write(mk(), T + '2\\a.txt').code === 2)
  check('윈도우 악성: 임시 폴더에서 `..` 로 탈출 → 차단', write(mk(), path.join(T, 'x') + '\\..\\..\\evil.txt').code === 2)
  check('윈도우 악성: 승인 상태 파일 직접 쓰기(자기 승인) → 차단', write(mk(), path.join(T, 'claude-task-confirm-guard', 'x.json')).code === 2)
  check('윈도우 악성: C:\\tmp (Node 의 /tmp — 진짜 임시 폴더 아님) → 차단', write(mk(), '/tmp/a.txt').code === 2)
  const j = fs.mkdtempSync(path.join(T, 'tcg-j-'))
  linkDir(process.cwd(), path.join(j, 'repo')) // 임시 폴더 안 junction → 레포 (공격자도 만들 수 있는 링크)
  check('윈도우 악성: 임시 폴더 안 junction 너머 레포 파일 → 차단', write(mk(), path.join(j, 'repo', 'src', 'app.ts')).code === 2)
  fs.unlinkSync(path.join(j, 'repo'))
  fs.rmSync(j, { recursive: true, force: true })
}

console.log('\n── 이상·경계 경로 ──')
check('상태 파일 없는 세션 → 차단 (보수)', write(sid()).code === 2)
check('session_id 누락 → 크래시 없이 판정', [0, 2].includes(run({ hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: 'a' } }).code))
check('깨진 JSON → 통과(판정 불가)', run('{not json').code === 0)
check('빈 stdin → 통과', run('').code === 0)
check('JSON null → 통과', run('null').code === 0)
{
  const s = sid(); prompt(s, '응', '/nonexistent/tcg/x.jsonl')
  check('대화 기록 파일 없음 → 확인 질문 없음으로 간주 → 차단', write(s).code === 2)
}
{
  const s = sid(); const f = path.join(tmp, 'broken.jsonl'); fs.writeFileSync(f, '{broken\n\u0000\u0001garbage\n')
  prompt(s, '응', f)
  check('깨진 대화 기록 → 크래시 없이 차단', write(s).code === 2)
}
{
  const s = sid(); prompt(s, 12345, transcript(PLAN))
  check('prompt 비문자열 → 크래시 없이 판정(확인 질문 있음 = 승인)', write(s).code === 0)
}
{
  const s = sid(); const big = 'x'.repeat(600 * 1024) + '\n진행할까요?'
  prompt(s, '응', transcript(big))
  check('초장문 답변 끝의 "진행할까요?" → 승인', write(s).code === 0)
}
{
  const s = sid(); prompt(s, '응', transcript(PLAN))
  check('file_path 누락된 Write → 승인 상태면 허용', run({ hook_event_name: 'PreToolUse', session_id: s, tool_name: 'Write', tool_input: {} }).code === 0)
}

fs.rmSync(tmp, { recursive: true, force: true })
for (const f of fs.readdirSync(path.join(os.tmpdir(), 'claude-task-confirm-guard'))) {
  if (f.startsWith(`tcg-test-${process.pid}-`)) fs.rmSync(path.join(os.tmpdir(), 'claude-task-confirm-guard', f), { force: true })
}

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
