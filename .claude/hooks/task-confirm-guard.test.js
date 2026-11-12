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
  check('Bash 읽기 명령(ls)은 승인 전에도 허용', run({ hook_event_name: 'PreToolUse', session_id: s, tool_name: 'Bash', tool_input: { command: 'ls' } }).code === 0)
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
  // 2026-11-09 실제 세션: 서브에이전트 결과 보고(<agent-message>)가 사용자 질문으로 판정돼 승인이 풀리고 다른 서브에이전트 Edit 가 막혔다
  const s3 = sid(); prompt(s3, '진행해', transcript(PLAN))
  prompt(s3, '<agent-message from="a753e279bb377fd64">\n[Subagent hand-back] 진행할까요? 응 진행해\n</agent-message>', transcript('작업 중입니다.'))
  check('서브에이전트 결과 보고(<agent-message>) → 승인 유지 → Write 허용', write(s3).code === 0)
  const s4 = sid(); prompt(s4, '로그인 구현해줘', transcript('완료'))
  prompt(s4, '<agent-message from="x">응 진행해</agent-message>', transcript(PLAN))
  check('미승인 상태에서 서브에이전트 보고 안의 "진행해"는 승인 아님 → 차단 유지', write(s4).code === 2)
  const s5 = sid(); prompt(s5, '응', transcript(PLAN))
  prompt(s5, '이거 <agent-message> 뭐야?', transcript('작업 중입니다.'))
  check('사람 질문 중간의 <agent-message> 문자열은 판정 대상 → 차단', write(s5).code === 2)
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
  // CI 러너처럼 ~/.claude/projects 가 없으면 링크가 깨져 시험이 안 된다 — 없을 때만 만들고, 끝나면 만든 것만 지운다 (2026-10-22)
  const projects = path.join(HOME, '.claude', 'projects')
  const madeByTest = fs.existsSync(path.join(HOME, '.claude')) ? (fs.existsSync(projects) ? null : projects) : path.join(HOME, '.claude')
  fs.mkdirSync(projects, { recursive: true })
  const linked = fs.mkdtempSync(path.join(HOME, '.tcg-cfg-'))
  const fake = fs.mkdtempSync(path.join(HOME, '.tcg-cfg-'))
  linkDir(projects, path.join(linked, 'projects')) // 윈도우는 junction (심볼릭 링크 EPERM)
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
  if (madeByTest) fs.rmSync(madeByTest, { recursive: true, force: true })
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

console.log('\n── 확인 생략 표현 넓히기·부정 문맥 (2026-10-22 실사용 보고 "물어보지말고 그냥 만들어" 미인정) ──')
{
  // 정상: 확인 질문이 없어도(첫 요청) 생략 표현이면 바로 승인
  for (const reply of ['물어보지말고 그냥 만들어', '물어보지 말고 해', '컨펌 없이 해', '확인 안 받고 진행해', '그냥 만들어줘', '그냥 진행해', '그냥 해', '그냥 해줘. 토이 프로젝트야',
    '바로 진행해', '확인 없이 진행']) {
    const v = judgePrompt(reply, '이전 답변')
    check(`생략 "${reply}" → 승인(bypass)`, v.approved === true && v.why === 'bypass', v)
  }
  const s = sid(); prompt(s, '물어보지말고 그냥 만들어', transcript('이전 답변'))
  check('보고된 문장으로 생략 → Write 허용 (훅 경유)', write(s).code === 0)
  // 악성·우회: 생략 표현 바로 뒤 부정, 생략처럼 보이는 다른 뜻
  for (const reply of ['바로 진행하지 마', '그냥 진행하지 말고 물어봐', '그냥 만들지 마', '바로 진행하면 안 돼', '그냥 두고 물어봐', '그냥 해서 문제가 생겼어',
    '그냥 궁금해서', '그냥 해봤어', '물어보고 해']) {
    const v = judgePrompt(reply, '이전 답변')
    check(`생략 아님 "${reply}" → 미승인`, v.approved === false, v)
  }
  // 확인 질문 뒤의 거절 일반형 — 예전엔 승인으로 판정되던 것
  for (const reply of ['그냥 만들지 마', '바로 진행하면 안 돼', '그건 건드리지마', '지금은 수정하지 마세요']) {
    const v = judgePrompt(reply, PLAN)
    check(`확인 질문 뒤 거절 "${reply}" → 거절`, v.approved === false && v.why === 'rejected', v)
  }
  for (const reply of ['응 근데 테스트 파일은 지우면 안 돼', '네 진행해 main 에 푸시하면 안 됩니다']) {
    const v = judgePrompt(reply, PLAN)
    check(`승인 + 금지 부가 조건 "${reply}" → 승인`, v.approved === true, v)
  }
  // 이상·경계: 초장문·반복·특수문자에서도 시간 안에 판정
  const t0 = Date.now()
  check('경계: 초장문 "그냥 " 반복 → 크래시 없이 판정', typeof judgePrompt('그냥 '.repeat(20000) + '하지 마', '이전 답변').approved === 'boolean')
  check('경계: 판정 시간 1초 이내', Date.now() - t0 < 1000)
  check('경계: 비문자열 입력 → 미승인(생략 아님)', judgePrompt(null, '이전 답변').approved === false)
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

// ─── 자기 승인 — 승인 상태 파일은 임시 폴더 안이지만 예외가 아니다 (2026-10-22: 맥 분기엔 검사가 없어 승인 전 Write 로 approved:true 를 써 넣을 수 있었다) ───
console.log('\n[자기 승인 — 승인 상태 폴더 쓰기]')
{
  const s = sid()
  prompt(s, '이거 해줘', transcript('안녕하세요'))
  const own = stateFile(s)
  // 악성: 승인 전 Write/Edit 로 내 상태 파일·다른 세션 상태 파일·폴더 자체
  check('악성: 승인 전 Write 로 내 승인 상태 파일 → 차단', write(s, own).code === 2)
  check('악성: 승인 전 Edit 로 내 승인 상태 파일 → 차단', write(s, own, 'Edit').code === 2)
  check('악성: 다른 세션 상태 파일 → 차단', write(s, stateFile('other-session')).code === 2)
  const dir = path.dirname(own)
  check('악성: 상태 폴더 아래 새 이름 → 차단', write(s, path.join(dir, 'x', 'y.json')).code === 2)
  check('악성: `..` 로 상태 폴더에 돌아 들어감 → 차단', write(s, path.join(os.tmpdir(), 'tcg-x', '..', 'claude-task-confirm-guard', 's.json')).code === 2)
  if (process.platform === 'darwin') {
    // 맥 기본 파일 시스템은 대소문자 무시 — 대문자 폴더 이름도 같은 상태 폴더
    check('악성(맥): 대문자로 쓴 상태 폴더 → 차단', write(s, path.join(os.tmpdir(), 'CLAUDE-TASK-CONFIRM-GUARD', `${s}.json`)).code === 2)
    // /var ↔ /private/var — 실제 위치 표기로 써도 같은 폴더
    let realTmp = null; try { realTmp = fs.realpathSync(os.tmpdir()) } catch {}
    if (realTmp) check('악성(맥): 임시 폴더 실제 경로(/private/var/…)로 쓴 상태 파일 → 차단', write(s, path.join(realTmp, 'claude-task-confirm-guard', `${s}.json`)).code === 2)
  }
  // 정상·경계: 임시 폴더의 다른 파일, 접두만 같은 형제 폴더는 그대로 예외
  check('정상: 승인 전 임시 폴더 다른 파일 → 허용', write(s, path.join(os.tmpdir(), 'tcg-scratch', 'a.txt')).code === 0)
  check('경계: 접두만 같은 형제 폴더(claude-task-confirm-guard2) → 허용', write(s, path.join(os.tmpdir(), 'claude-task-confirm-guard2', 'a.json')).code === 0)
  // 승인 뒤엔 일반 규칙대로(승인 = 허용) — 상태 폴더도 다른 파일처럼 승인을 따른다
  prompt(s, '응', transcript(PLAN))
  check('경계: 승인 뒤 상태 파일 쓰기는 일반 파일처럼 승인 상태를 따름', write(s, own).code === 0)
}

// ─── 2026-11-10 사용자 결정 2 — 승인 전 셸로 파일 바꾸기 차단 · 승인 중 띄운 서브에이전트 유지 · 목표 기준 시험 ───
const proj = fs.mkdtempSync(path.join(os.homedir(), '.tcg-proj-')) // 임시 폴더 밖(= 예외 아님)의 가짜 프로젝트
fs.writeFileSync(path.join(proj, 'README.md'), '# p\n')
fs.writeFileSync(path.join(proj, 'package.json'), JSON.stringify({ scripts: { test: 'node --test', gen: 'node gen.js', build: 'node gen.js' } }))
fs.writeFileSync(path.join(proj, 'gen.js'), "require('fs').writeFileSync('out.txt', 'x')\n")
fs.writeFileSync(path.join(proj, 'read.js'), "console.log(require('fs').readFileSync('README.md', 'utf8'))\n")
fs.writeFileSync(path.join(proj, 'w.sh'), 'echo x > README.md\n')
const sh = (session, command, tool = 'Bash', extra = {}) =>
  run({ hook_event_name: 'PreToolUse', session_id: session, tool_name: tool, tool_input: { command }, cwd: proj, ...extra })
const tmpOut = IS_WIN ? path.join(os.tmpdir(), 'tcg-o.txt') : '/tmp/tcg-o.txt'

console.log('\n[승인 전 셸 쓰기 — 정상: 읽기·테스트·임시 폴더 쓰기는 그대로]')
{
  const s = sid(); prompt(s, '이 코드 설명해줘', transcript('안녕하세요'))
  for (const c of ['ls -la && git status', 'cat README.md | head -3', 'grep -rn x . | wc -l', 'node --test', 'npm test', `echo x > ${tmpOut}`,
    'node read.js', "python3 - <<'EOF'\nprint(open('README.md').read())\nEOF", 'git diff HEAD', 'git log --oneline -3', `cp README.md ${tmpOut}`])
    check(`정상: 승인 전 \`${c.split('\n')[0]}\` → 허용`, sh(s, c).code === 0, sh(s, c))
}
console.log('\n[승인 전 셸 쓰기 — 악성: 셸로 프로젝트 파일을 바꾸면 차단]')
{
  const s = sid(); prompt(s, '로그인 기능 만들어줘', transcript('안녕하세요'))
  const attacks = [
    ['리다이렉트', 'echo x > README.md'], ['추가 리다이렉트', 'echo x >> README.md'], ['cp 로 훅 덮기', 'cp /tmp/x .claude/hooks/bash-guard.js'],
    ['sed -i', "sed -i '' 's/p/q/' README.md"], ['mv', 'mv README.md R.md'], ['rm', 'rm README.md'], ['touch', 'touch new.ts'], ['tee', 'echo x | tee README.md'],
    ['python heredoc 쓰기', "python3 - <<'EOF'\nopen('README.md','w').write('x')\nEOF"], ['python -c 삭제', "python3 -c 'import os; os.remove(\"README.md\")'"],
    ['node -e 쓰기', "node -e \"require('fs').writeFileSync('README.md','x')\""], ['쓰는 스크립트 실행', 'node gen.js'],
    ['package.json 스크립트가 쓰기', 'npm run gen'], ['쓰는 셸 스크립트', 'sh w.sh'], ['bash -c 안 쓰기', 'bash -c "echo x > README.md"'],
    ['echo | bash', 'echo "rm README.md" | bash'], ['git checkout', 'git checkout -- README.md'], ['git stash', 'git stash'], ['git reset --hard', 'git reset --hard'],
    ['npm install', 'npm install left-pad'], ['prettier --write', 'npx prettier --write .'], ['eval', 'eval "rm README.md"'], ['변수 명령 이름', 'X=rm; $X README.md'],
    ['변수 대상(값 모름)', 'echo x > "$OUT"'], ['cd 뒤 상대 경로', `cd ${proj} && echo x > a.md`], ['하네스 설정 바꾸기', 'gugbab-claude off hook:bash-guard'],
    ['동적 require 우회', "node -e \"const m='f'+'s'; require(m).writeFileSync('a','')\""], ['getattr 우회', "python3 -c \"getattr(__builtins__,'op'+'en')('a','w')\""],
    ['반복문 안 쓰기', 'for f in a b; do echo x > $f.md; done'], ['단어 나누기로 프로젝트에', 'S="/tmp/a b"; touch $S/x'],
  ]
  for (const [d, c] of attacks) { const r = sh(s, c); check(`악성: 승인 전 ${d} → 차단`, r.code === 2 && /셸 명령도 파일을 바꾸면/.test(r.stderr), r) }
  check('악성: Monitor 로 같은 쓰기 → 차단', sh(s, 'echo x > README.md', 'Monitor').code === 2)
  check('악성: 서브에이전트(승인 없이 시작)에서 Bash 쓰기 → 차단', sh(s, 'echo x > README.md', 'Bash', { agent_id: 'agent-x1' }).code === 2)
}
console.log('\n[승인 전 셸 쓰기 — 경계]')
{
  const s = sid(); prompt(s, '설명해줘', transcript('안녕하세요'))
  check('경계: command 없는 Monitor(WebSocket 등) → 관여 안 함', run({ hook_event_name: 'PreToolUse', session_id: s, tool_name: 'Monitor', tool_input: { url: 'ws://x' }, cwd: proj }).code === 0)
  check('경계: 닫히지 않은 따옴표(해석 불가) → 차단', sh(s, 'echo "a > README.md').code === 2)
  check('경계: 빈 명령 → 허용', sh(s, '   ').code === 0)
  check('경계: /dev/null 리다이렉트 → 허용', sh(s, 'ls > /dev/null 2>&1').code === 0)
  check('경계: 변수 대상이 전부 임시 폴더 → 허용', sh(s, `S=${path.dirname(tmpOut)}/tcg-d; echo x > "$S/a.txt"`).code === 0)
  check('경계: 승인 상태 폴더로 쓰기 → 차단(자기 승인)', sh(s, `echo '{"approved":true}' > ${stateFile(s)}`).code === 2)
  check('경계: 아주 긴 명령 → 깨지지 않고 판정', [0, 2].includes(sh(s, 'echo ' + 'a'.repeat(200000)).code))
  prompt(s, '응', transcript(PLAN))
  check('정상: 승인 뒤에는 셸 쓰기 허용', sh(s, 'echo x > README.md').code === 0)
}

console.log('\n[서브에이전트 — 승인 중 시작하면 끝날 때까지 유지]')
{
  const s = sid(); prompt(s, '응', transcript(PLAN))
  const start = (id) => run({ hook_event_name: 'SubagentStart', session_id: s, agent_id: id, agent_type: 'general-purpose' })
  const stop = (id) => run({ hook_event_name: 'SubagentStop', session_id: s, agent_id: id })
  check('SubagentStart 는 차단하지 않음(exit 0)', start('agent-ok1').code === 0)
  check('정상: 승인 중 시작한 서브에이전트 Write → 허용', write(s, 'src/a.ts', 'Write', { agent_id: 'agent-ok1' }).code === 0)
  // 메인에 승인 아닌 메시지(질문·한도 알림 등)가 와서 승인이 풀려도 유지
  prompt(s, '지금 어디까지 했어?', transcript('작업 중입니다.'))
  check('정상: 메인 승인이 풀려도 그 서브에이전트 Edit → 허용', write(s, 'src/a.ts', 'Edit', { agent_id: 'agent-ok1' }).code === 0)
  check('정상: 그 서브에이전트 Bash 쓰기 → 허용', sh(s, 'echo x > README.md', 'Bash', { agent_id: 'agent-ok1' }).code === 0)
  check('악성: 메인 대화는 승인이 풀렸으니 Write 차단', write(s).code === 2)
  check('악성: 승인 풀린 뒤 시작한 서브에이전트 → 기록 안 됨·차단', start('agent-late').code === 0 && write(s, 'src/a.ts', 'Write', { agent_id: 'agent-late' }).code === 2)
  check('악성: 기록에 없는 agent_id 위장 → 차단', write(s, 'src/a.ts', 'Write', { agent_id: 'agent-forged' }).code === 2)
  check('악성: 이상한 agent_id(경로 문자) → 차단', write(s, 'src/a.ts', 'Write', { agent_id: '../agent-ok1' }).code === 2)
  check('경계: 빈 agent_id 는 메인 대화로 봄 → 차단', write(s, 'src/a.ts', 'Write', { agent_id: '' }).code === 2)
  stop('agent-ok1')
  check('경계: SubagentStop 뒤에는 같은 id 로 쓰기 차단', write(s, 'src/a.ts', 'Write', { agent_id: 'agent-ok1' }).code === 2)
}
{
  const s = sid(); prompt(s, '응', transcript(PLAN))
  run({ hook_event_name: 'SubagentStart', session_id: s, agent_id: 'agent-rj' })
  prompt(s, '아니 멈춰', transcript('작업 중입니다.\n\n진행할까요?'))
  check('악성: 사용자가 거절·중단하면 실행 중 서브에이전트 승인도 풀림', write(s, 'src/a.ts', 'Write', { agent_id: 'agent-rj' }).code === 2)
}
{
  const s = sid(); prompt(s, '설명해줘', transcript('안녕'))
  run({ hook_event_name: 'SubagentStart', session_id: s, agent_id: 'agent-pre' })
  prompt(s, '응', transcript(PLAN))
  check('악성: 승인 전에 띄운 서브에이전트는 나중에 메인이 승인돼도 차단', write(s, 'src/a.ts', 'Write', { agent_id: 'agent-pre' }).code === 2)
  check('경계: 깨진 SubagentStart 입력 → exit 0', run('{"hook_event_name":"SubagentStart"').code === 0 && run({ hook_event_name: 'SubagentStart', session_id: s, agent_id: 42 }).code === 0)
}

// 목표 기준 시험(결정 2-c) — "승인 전에는 어떤 방법으로도 파일이 바뀌지 않는다". 훅 판정이 아니라 실제 파일이 그대로인지 본다
console.log('\n[목표 시험 — 승인 전 모든 경로로 파일 바꾸기 시도 → 파일이 그대로]')
{
  const s = sid(); prompt(s, '이 파일 고쳐줘', transcript('안녕하세요'))
  const target = path.join(proj, 'README.md')
  fs.writeFileSync(target, 'ORIGINAL\n')
  const tries = [
    ['Write', { hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: target, content: 'HACK' } }, () => fs.writeFileSync(target, 'HACK')],
    ['Edit', { hook_event_name: 'PreToolUse', tool_name: 'Edit', tool_input: { file_path: target, old_string: 'ORIGINAL', new_string: 'HACK' } }, () => fs.writeFileSync(target, 'HACK')],
    ['NotebookEdit', { hook_event_name: 'PreToolUse', tool_name: 'NotebookEdit', tool_input: { notebook_path: target, new_source: 'HACK' } }, () => fs.writeFileSync(target, 'HACK')],
    ...['echo HACK > README.md', "sed -i.bak 's/ORIGINAL/HACK/' README.md", 'cp /dev/null README.md', "python3 - <<'EOF'\nopen('README.md','w').write('HACK')\nEOF",
      "node -e \"require('fs').writeFileSync('README.md','HACK')\"", 'bash -c "echo HACK > README.md"', 'echo "echo HACK > README.md" | sh', 'npm run gen', 'sh w.sh']
      .flatMap(c => [['Bash', c], ['Monitor', c]]).map(([tool, c]) => [`${tool} \`${c.split('\n')[0]}\``, { hook_event_name: 'PreToolUse', tool_name: tool, tool_input: { command: c } }, () => spawnSync('sh', ['-c', c], { cwd: proj, timeout: 5000 })]),
    ['서브에이전트(승인 없이 시작) Write', { hook_event_name: 'PreToolUse', tool_name: 'Write', agent_id: 'agent-goal', tool_input: { file_path: target, content: 'HACK' } }, () => fs.writeFileSync(target, 'HACK')],
  ]
  // 훅이 허용(exit 0)하면 실제로 실행해 본다 — 막았다면 실행하지 않는다(Claude Code 와 같다)
  for (const [d, inp, exec] of tries) {
    fs.writeFileSync(target, 'ORIGINAL\n')
    const r = run({ ...inp, session_id: s, cwd: proj })
    if (r.code === 0) exec()
    const now = fs.readFileSync(target, 'utf8')
    check(`목표: 승인 전 ${d} → 파일 그대로`, now === 'ORIGINAL\n', { code: r.code, now })
  }
  check('목표: npm run gen 의 출력 파일도 생기지 않음', !fs.existsSync(path.join(proj, 'out.txt')))
}
fs.rmSync(proj, { recursive: true, force: true })

fs.rmSync(tmp, { recursive: true, force: true })
for (const f of fs.readdirSync(path.join(os.tmpdir(), 'claude-task-confirm-guard'))) {
  if (f.startsWith(`tcg-test-${process.pid}-`)) fs.rmSync(path.join(os.tmpdir(), 'claude-task-confirm-guard', f), { force: true })
}

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
