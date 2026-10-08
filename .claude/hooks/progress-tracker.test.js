#!/usr/bin/env node
/**
 * progress-tracker.test.js
 * 실행: node .claude/hooks/progress-tracker.test.js
 *
 * 3계층: 정상(승인 → 계획 저장 → 파일 기록 → 새 세션·요약 후 안내) / 악성·우회(미승인·거절은 기록 안 함, 세션 id 경로 조작,
 *        서브에이전트 답변 위장) / 이상·경계(오래된 기록·한 번만 안내·깨진 기록 파일·깨진 입력)
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'progress-tracker.js')
const { extractPlan } = require('./progress-tracker.js')

let passed = 0, failed = 0
const check = (desc, cond, detail) => {
  console.log(`  ${cond ? '✅' : '❌'} ${desc}${cond ? '' : ` → FAIL ${detail !== undefined ? JSON.stringify(detail).slice(0, 400) : ''}`}`)
  cond ? passed++ : failed++
}

const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ptr-'))
const proj = path.join(base, 'proj'); fs.mkdirSync(proj)
const tdir = path.join(base, 'transcripts'); fs.mkdirSync(tdir)
const PLAN = '이렇게 이해했습니다: 로그인 기능을 추가합니다.\n\n작업 목록:\n1. API 라우트 작성\n2. **폼 컴포넌트** 작성\n3. 테스트 실행\n\n진행할까요?'

function transcript(id, assistantText, { sidechain = false } = {}) {
  const p = path.join(tdir, `${id}.jsonl`)
  fs.writeFileSync(p, [
    { type: 'user', message: { content: '로그인 만들어줘' } },
    { type: 'assistant', isSidechain: sidechain, message: { content: [{ type: 'text', text: assistantText }] } },
  ].map(x => JSON.stringify(x)).join('\n') + '\n')
  return p
}
function run(input) {
  const r = spawnSync('node', [HOOK], { input: typeof input === 'string' ? input : JSON.stringify(input), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: proj }, timeout: 5000 })
  let ctx = null
  try { ctx = JSON.parse(r.stdout).hookSpecificOutput.additionalContext } catch { /* 없음 */ }
  return { code: r.status, ctx, stdout: (r.stdout || '').trim() }
}
const rec = (id) => { try { return JSON.parse(fs.readFileSync(path.join(tdir, 'progress', `${id}.json`), 'utf8')) } catch { return null } }
const prompt = (id, text, tPath) => run({ hook_event_name: 'UserPromptSubmit', session_id: id, prompt: text, transcript_path: tPath, cwd: proj })
const edit = (id, file, tool = 'Write') => run({ hook_event_name: 'PostToolUse', session_id: id, tool_name: tool, tool_input: { file_path: file }, transcript_path: path.join(tdir, `${id}.jsonl`), cwd: proj })
const start = (id, source) => run({ hook_event_name: 'SessionStart', session_id: id, source, transcript_path: path.join(tdir, `${id}.jsonl`), cwd: proj })

console.log('🔍 progress-tracker 테스트 시작')

console.log('\n── 계획 추출 ──')
{
  const p = extractPlan(PLAN)
  check('이해 요약 추출', p.understanding === '로그인 기능을 추가합니다.', p)
  check('작업 목록 3개 추출·굵은 표시 제거', p.tasks.length === 3 && p.tasks[1] === '폼 컴포넌트 작성', p)
  const q = extractPlan('이렇게 이해했습니다:\n다음 줄에 요약\n\n작업 목록:\n1) 하나\n2) 둘\n\n그 외 설명 문단\n\n진행할까요?')
  check('요약이 다음 줄에 있어도·"1)" 형식도 추출, 목록 뒤 문단은 제외', q.understanding === '다음 줄에 요약' && q.tasks.length === 2, q)
  check('계획 없는 답변 → 빈 계획', extractPlan('완료했습니다.').tasks.length === 0)
}

console.log('\n── 정상 경로 ──')
{
  const A = 'sess-a'
  prompt(A, '응 진행해', transcript(A, PLAN))
  const r = rec(A)
  check('승인 → 계획 저장', r && r.plan.tasks.length === 3 && r.files.length === 0, r)
  edit(A, path.join(proj, 'src/api/login.ts')); edit(A, 'src/ui/Form.tsx', 'Edit'); edit(A, 'src/api/login.ts')
  check('수정 파일 기록 (상대경로·중복 제거)', JSON.stringify(rec(A).files) === JSON.stringify(['src/ui/Form.tsx', 'src/api/login.ts']), rec(A).files)
  const c = start(A, 'compact')
  check('요약(compact) 직후 → 이 세션 계획·파일 안내', c.ctx && c.ctx.includes('요약 직후') && c.ctx.includes('API 라우트 작성') && c.ctx.includes('src/api/login.ts'), c)
  const b = start('sess-b', 'startup')
  check('새 세션 시작 → 직전 작업 안내', b.ctx && b.ctx.includes('직전 세션') && b.ctx.includes('폼 컴포넌트 작성'), b)
  const b2 = start('sess-b', 'startup')
  check('같은 새 세션에는 한 번만 안내', b2.ctx === null, b2)
  const c2 = start('sess-c', 'clear')
  check('/clear 로 시작한 다른 세션에도 안내', c2.ctx && c2.ctx.includes('직전 세션'), c2)
}
{
  const D = 'sess-d'
  prompt(D, '로그인 바로 진행해', transcript(D, '안녕하세요'))
  const r = rec(D)
  check('"바로 진행" 생략 승인 → 요청 문장을 목표로 기록', r && r.goal.includes('로그인') && r.plan.tasks.length === 0, r)
}

{
  const N = 'sess-notify'
  prompt(N, '응', transcript(N, PLAN)); edit(N, 'a.ts')
  prompt(N, '<task-notification>\n<status>completed</status>\n</task-notification>', transcript(N, PLAN))
  check('백그라운드 알림이 와도 진행 중 계획·파일 기록을 덮어쓰지 않음', rec(N) && rec(N).files.length === 1 && rec(N).files[0] === 'a.ts', rec(N))
}

console.log('\n── 기록하지 않아야 하는 경우·우회 ──')
{
  const E = 'sess-e'
  prompt(E, '아니 그거 말고', transcript(E, PLAN))
  check('거절·수정 요청 → 기록 안 함', rec(E) === null)
  prompt('sess-f', '응', transcript('sess-f', '완료했습니다.'))
  check('확인 질문 없는 답변 뒤 "응" → 기록 안 함', rec('sess-f') === null)
  prompt('sess-g', '응', transcript('sess-g', PLAN, { sidechain: true }))
  check('서브에이전트 답변의 계획 → 기록 안 함', rec('sess-g') === null)
  edit('sess-h', 'a.ts')
  check('계획 없는 세션의 파일 수정 → 기록 파일 만들지 않음', rec('sess-h') === null)
  const r = run({ hook_event_name: 'UserPromptSubmit', session_id: '../../evil', prompt: '응', transcript_path: transcript('x', PLAN), cwd: proj })
  check('세션 id 경로 조작 → 저장 안 함·밖으로 안 샘', r.code === 0 && !fs.existsSync(path.join(base, 'evil.json')) && !fs.existsSync(path.join(tdir, 'evil.json')))
}

console.log('\n── 이상·경계 경로 ──')
{
  const O = 'sess-old'
  prompt(O, '응', transcript(O, PLAN))
  const r = rec(O); r.lastActivity = new Date(Date.now() - 100 * 3600 * 1000).toISOString()
  fs.writeFileSync(path.join(tdir, 'progress', `${O}.json`), JSON.stringify(r))
  // 다른 최근 기록들은 이미 안내됐으므로, 새 세션에서 72시간 지난 기록만 남은 상황
  const n = start('sess-new-old', 'startup')
  check('72시간 지난 기록만 남음 → 안내 안 함', n.ctx === null || !n.ctx.includes('sess-old'), n)
}
{
  fs.writeFileSync(path.join(tdir, 'progress', 'broken.json'), '{broken')
  const n = start('sess-z', 'startup')
  check('깨진 기록 파일이 섞여 있어도 크래시 없음', n.code === 0)
}
{
  const n = run({ hook_event_name: 'SessionStart', session_id: 'q', source: 'startup', transcript_path: path.join(base, 'none', 'q.jsonl'), cwd: proj })
  check('기록 폴더 없음 → 출력 없음', n.code === 0 && n.ctx === null)
  const m = start('never-recorded', 'compact')
  check('기록 없는 세션의 compact → 출력 없음', m.code === 0 && m.ctx === null)
}
{
  const L = 'sess-long'
  prompt(L, '응', transcript(L, PLAN))
  for (let i = 0; i < 230; i++) edit(L, `f${i}.ts`)
  check('수정 파일 기록 상한 200개 유지', rec(L).files.length === 200 && rec(L).files[199] === 'f229.ts', rec(L).files.length)
}
for (const [desc, stdin] of [['깨진 JSON', '{x'], ['빈 입력', ''], ['null', 'null'], ['Stop 이벤트', JSON.stringify({ hook_event_name: 'Stop', session_id: 'a' })],
  ['session_id 누락 UserPromptSubmit', JSON.stringify({ hook_event_name: 'UserPromptSubmit', prompt: '응' })]]) {
  const r = run(stdin)
  check(`${desc} → exit 0, 출력 없음`, r.code === 0 && !r.stdout)
}

fs.rmSync(base, { recursive: true, force: true })
console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
