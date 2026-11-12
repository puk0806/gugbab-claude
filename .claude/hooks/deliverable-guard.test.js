#!/usr/bin/env node
/**
 * deliverable-guard.test.js
 * 실행: node .claude/hooks/deliverable-guard.test.js
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'deliverable-guard.js')
const {
  isExcludedPath,
  extractStatus,
  extractSection5,
  hasGenuineTestEvidence,
  hasOnlyNegationConfession,
  hasAnyTestRecord,
  getPendingTestViolations,
  recordModifiedFile,
  loadSession,
  sessionFilePath,
} = require('./deliverable-guard.js')

let passed = 0, failed = 0

function assert(desc, actual, expected) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${JSON.stringify(expected)}, 실제: ${JSON.stringify(actual)})`}`)
  pass ? passed++ : failed++
}

function section(title) { console.log(`\n── ${title} ──`) }

function runHook(input, opts = {}) {
  return spawnSync('node', [HOOK], {
    input: JSON.stringify(input), encoding: 'utf8', timeout: 5000, ...opts,
  })
}

console.log('🔍 deliverable-guard 테스트 시작')

// ─── isExcludedPath — worktrees/node_modules 스캔 제외 ───────────
section('isExcludedPath — 스캔 제외 경로')
assert('.claude/worktrees/ 하위 → true',
  isExcludedPath('/proj/.claude/worktrees/x/docs/skills/a/verification.md'), true)
assert('node_modules 하위 → true',
  isExcludedPath('/proj/node_modules/pkg/verification.md'), true)
assert('일반 docs/skills 경로 → false',
  isExcludedPath('/proj/docs/skills/backend/dayjs/verification.md'), false)
// 윈도우 규칙(win=true) — 맥에서도 도는 순수 검사
assert('윈도우: `C:\\proj\\.claude\\worktrees\\…` → true', isExcludedPath('C:\\proj\\.claude\\worktrees\\x\\verification.md', true), true)
assert('윈도우: 대소문자 다른 `Node_Modules` → true', isExcludedPath('C:\\proj\\Node_Modules\\pkg\\verification.md', true), true)
assert('윈도우: 슬래시·백슬래시 섞임 → true', isExcludedPath('C:/proj\\node_modules/pkg\\v.md', true), true)
assert('윈도우 악성: 접두만 같은 `node_modules2` → false (스캔 대상 유지)', isExcludedPath('C:\\proj\\node_modules2\\verification.md', true), false)
assert('윈도우 악성: 이름 일부 `my.claude\\worktrees` → false', isExcludedPath('C:\\proj\\my.claude\\worktrees\\v.md', true), false)
assert('윈도우 경계: 빈 문자열 → false', isExcludedPath('', true), false)
assert('맥 고정: win=false 면 `\\` 경로는 제외 판정 안 함 (기존 동작)', isExcludedPath('C:\\proj\\node_modules\\v.md', false), path.sep === '\\')

// ─── frontmatter status 추출 ─────────────────────────────────────
section('extractStatus')
assert('PENDING_TEST 추출',
  extractStatus('---\nstatus: PENDING_TEST\n---\n# 본문'), 'PENDING_TEST')
assert('APPROVED 추출',
  extractStatus('---\nname: x\nstatus: APPROVED\ndate: 2026-07-04\n---\n'), 'APPROVED')
assert('frontmatter 없음 → null', extractStatus('# 제목뿐'), null)

// ─── 섹션 5 테스트 흔적 판정 ─────────────────────────────────────
section('테스트 흔적 판정 (자백 라인 필터링)')
const genuineBody = '\n**수행일**: 2026-07-04\n**수행자**: skill-tester → general-purpose\nQ1. 질문 — PASS\nQ2. 질문 — PASS\nagent content test: 2/2 PASS\n'
const confessionBody = '\n**수행일**: 2026-07-04\n**수행 방법**: SKILL.md 작성 직후 셀프 검증 (skill-tester 호출 미수행)\n'
assert('진짜 수행 기록 → true', hasGenuineTestEvidence(genuineBody), true)
assert('자백 라인만 → false', hasGenuineTestEvidence(confessionBody), false)
assert('자백만 있는 상태 판정 → true', hasOnlyNegationConfession(confessionBody), true)
assert('진짜 기록엔 자백 판정 → false', hasOnlyNegationConfession(genuineBody), false)

const fullDoc = (status, section5Body) =>
  `---\nstatus: ${status}\n---\n\n## 5. 테스트 진행 기록\n${section5Body}\n\n## 6. 검증 결과 요약\n요약\n`
assert('섹션 5 추출', extractSection5(fullDoc('PENDING_TEST', 'BODY')).includes('BODY'), true)
assert('진짜 기록 문서 → hasAnyTestRecord true', hasAnyTestRecord(fullDoc('PENDING_TEST', genuineBody)), true)
assert('자백 문서 → hasAnyTestRecord false', hasAnyTestRecord(fullDoc('PENDING_TEST', confessionBody)), false)

// ─── getPendingTestViolations — 파일시스템 픽스처 ────────────────
section('getPendingTestViolations — 오늘 mtime 픽스처')
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dg-test-'))
const mk = (rel, content) => {
  const fp = path.join(tmpRoot, rel)
  fs.mkdirSync(path.dirname(fp), { recursive: true })
  fs.writeFileSync(fp, content)
}
mk('docs/skills/backend/no-record/verification.md', fullDoc('PENDING_TEST', '\n(기록 없음)\n'))
mk('docs/skills/backend/genuine/verification.md', fullDoc('PENDING_TEST', genuineBody))
mk('docs/skills/backend/confession/verification.md', fullDoc('PENDING_TEST', confessionBody))
mk('docs/skills/backend/approved/verification.md', fullDoc('APPROVED', '\n(기록 없음)\n'))
mk('docs/skills/.claude/worktrees/left-over/verification.md', fullDoc('PENDING_TEST', '\n(워크트리 잔재)\n'))

const violations = getPendingTestViolations(tmpRoot).sort()
assert('위반 2건 (no-record + confession)', violations.length, 2)
assert('no-record 포함', violations.some(v => v.includes('no-record')), true)
assert('confession 포함', violations.some(v => v.includes('confession')), true)
assert('genuine 미포함', violations.some(v => v.includes('genuine')), false)
assert('approved 미포함', violations.some(v => v.includes('approved')), false)
assert('워크트리 잔재 미포함 (오탐 수정)', violations.some(v => v.includes('worktrees')), false)

// ─── 세션 파일 추적 (구 session-summary 역할) ────────────────────
section('세션 파일 추적')
const SID = `dg-test-${process.pid}`
try { fs.unlinkSync(sessionFilePath(SID)) } catch {}
recordModifiedFile(SID, 'Write', { file_path: '/proj/.claude/skills/a/b/SKILL.md' })
recordModifiedFile(SID, 'Edit', { file_path: '/proj/README.md' })
recordModifiedFile(SID, 'Bash', { command: 'ls' })  // 무시되어야 함
recordModifiedFile(SID, 'Write', { file_path: '/proj/.claude/skills/a/b/SKILL.md' })  // 중복 무시
const sess = loadSession(SID)
assert('파일 2개 기록 (Bash 무시·중복 제거)', sess.files.length, 2)
assert('SKILL.md 기록됨', sess.files.includes('/proj/.claude/skills/a/b/SKILL.md'), true)
try { fs.unlinkSync(sessionFilePath(SID)) } catch {}

// ─── Stop 이벤트 통합 (서브프로세스) ─────────────────────────────
section('Stop 이벤트 — 서브프로세스 통합')
const stopViolation = runHook(
  { hook_event_name: 'Stop', session_id: 'dg-nosession', cwd: tmpRoot },
  { cwd: tmpRoot, env: { ...process.env, CLAUDE_PROJECT_DIR: tmpRoot } },
)
assert('PENDING_TEST 위반 → exit 2', stopViolation.status, 2)
assert('차단 메시지에 스킬 경로 포함', stopViolation.stderr.includes('no-record'), true)
// 메시지 채널: Stop exit 2 는 stderr 가 "계속해야 하는 이유"로 전달 — stdout 에 사유가 새면 안 됨
assert('Stop 차단 사유는 stderr 전용 (stdout 비어 있음)', stopViolation.stdout.trim(), '')

const cleanRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dg-clean-'))
const stopClean = runHook(
  { hook_event_name: 'Stop', session_id: 'dg-nosession', cwd: cleanRoot },
  { cwd: cleanRoot, env: { ...process.env, CLAUDE_PROJECT_DIR: cleanRoot } },
)
assert('위반 없음 → exit 0', stopClean.status, 0)

// ─── Stop 루프 방지 (stop_hook_active) ───────────────────────────
// 공식: stop_hook_active=true 는 "이미 Stop 훅 때문에 계속 진행 중" — 해소 불가 조건으로 반복 차단 금지(8회 캡).
// 설계: 연쇄(사용자 턴)마다 같은 사유는 1회만 차단, 재시도 시 사용자 systemMessage 경고 후 통과.
section('Stop 루프 방지 — stop_hook_active')
{
  const stTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dg-loop-tmp-')) // 상태 파일 격리
  // 윈도우 os.tmpdir() 는 TMPDIR 이 아니라 TEMP/TMP 를 본다 — 셋 다 바꿔야 상태 파일이 격리된다
  // (격리 안 되면 이전 실행이 남긴 실제 %TEMP% 상태 파일로 'L2 1회 차단'·'손상 → 차단' 이 거꾸로 판정됐다, 2026-10-20 윈도우 실측)
  const envL = { ...process.env, CLAUDE_PROJECT_DIR: tmpRoot, TMPDIR: stTmp, TEMP: stTmp, TMP: stTmp }
  const stopL = (extra, root = tmpRoot) => {
    const r = spawnSync('node', [HOOK, '--no-readme'], {
      input: JSON.stringify({ hook_event_name: 'Stop', cwd: root, ...extra }), encoding: 'utf8', timeout: 5000, cwd: root, env: { ...envL, CLAUDE_PROJECT_DIR: root },
    })
    let j = null; try { j = r.stdout.trim() ? JSON.parse(r.stdout) : null } catch { j = 'INVALID' }
    return { ...r, j }
  }
  let r = stopL({ session_id: 'L1', stop_hook_active: false })
  assert('1차 Stop(active=false) + PENDING_TEST 미완 → exit 2', r.status, 2)
  r = stopL({ session_id: 'L1', stop_hook_active: true })
  assert('계속 진행 중(active=true) + 같은 사유 → 재차단 없이 exit 0', r.status, 0)
  assert('  └ 사용자 systemMessage 로 미완결 경고(스킬 경로 포함)', !!(r.j && typeof r.j.systemMessage === 'string' && r.j.systemMessage.includes('no-record')), true)
  assert('  └ 차단 필드(decision) 없음', !!(r.j && !('decision' in r.j)), true)
  r = stopL({ session_id: 'L1', stop_hook_active: false })
  assert('새 사용자 턴(active=false) → 다시 1회 차단', r.status, 2)
  r = stopL({ session_id: 'L2', stop_hook_active: true })
  assert('다른 훅이 계속시킨 연쇄(이 훅 미차단 상태) → 1회 차단', r.status, 2)
  // 사유가 바뀌면(새 위반 추가) 같은 연쇄라도 1회 더 차단 — 진전/신규 문제는 알려야 함
  const extra = path.join(tmpRoot, 'docs/skills/backend/new-one/verification.md')
  r = stopL({ session_id: 'L3', stop_hook_active: false })
  fs.mkdirSync(path.dirname(extra), { recursive: true })
  fs.writeFileSync(extra, fullDoc('PENDING_TEST', '\n(없음)\n'))
  r = stopL({ session_id: 'L3', stop_hook_active: true })
  assert('같은 연쇄에서 새 위반 추가(사유 변경) → 1회 더 차단', r.status, 2)
  r = stopL({ session_id: 'L3', stop_hook_active: true })
  assert('  └ 그 사유로 재시도 → 경고 후 통과', r.status, 0)
  fs.rmSync(path.dirname(extra), { recursive: true, force: true })
  r = stopL({ session_id: 'L4', stop_hook_active: 'true' })
  assert('stop_hook_active 문자열 "true"(타입 위장) → 새 연쇄로 취급, 차단', r.status, 2)
  r = stopL({ stop_hook_active: true })
  assert('session_id 없음 + active=true → 추적 불가, 루프 방지 우선(exit 0 + systemMessage)', r.status === 0 && !!(r.j && r.j.systemMessage), true)
  r = stopL({ stop_hook_active: false })
  assert('session_id 없음 + active=false → 차단', r.status, 2)
  r = stopL({ session_id: '../../../../dg-escape', stop_hook_active: false })
  assert('session_id 경로 순회 → 상태 파일이 TMPDIR 밖에 생기지 않음',
    r.status === 2 && !fs.readdirSync(path.dirname(stTmp)).some(f => f.includes('dg-escape')), true)
  for (const f of fs.readdirSync(stTmp)) { try { fs.writeFileSync(path.join(stTmp, f), '{corrupt') } catch {} }
  r = stopL({ session_id: 'L1', stop_hook_active: true })
  assert('상태 파일 손상 → 크래시 없이 차단 쪽(exit 2)', r.status, 2)
  // 위반 해소 후 새 턴에서 상태 초기화 → 이후 다른 훅 연쇄에서 새로 생긴 위반은 1회 차단
  const cleanR = stopL({ session_id: 'L5', stop_hook_active: false }, cleanRoot)
  r = stopL({ session_id: 'L5', stop_hook_active: true })
  assert('위반 없는 턴 뒤 다른 훅 연쇄에서 위반 → 1회 차단', cleanR.status === 0 && r.status === 2, true)
  fs.rmSync(stTmp, { recursive: true, force: true })
}

const postToolUse = runHook(
  { hook_event_name: 'PostToolUse', session_id: SID, tool_name: 'Write', tool_input: { file_path: '/tmp/x.md' } },
)
assert('PostToolUse → exit 0', postToolUse.status, 0)
try { fs.unlinkSync(sessionFilePath(SID)) } catch {}

const preToolNonGit = runHook(
  { hook_event_name: 'PreToolUse', session_id: 'dg-x', tool_name: 'Bash', tool_input: { command: 'ls -al' } },
)
assert('PreToolUse 비 git-commit 명령 → exit 0, 출력 없음', preToolNonGit.status === 0 && !preToolNonGit.stdout.trim(), true)

const emptyStdin = spawnSync('node', [HOOK], { input: '', encoding: 'utf8', timeout: 5000 })
assert('빈 stdin → exit 0 (안전장치)', emptyStdin.status, 0)

const badJson = spawnSync('node', [HOOK], { input: '{not-json', encoding: 'utf8', timeout: 5000 })
assert('잘못된 JSON → exit 0 (안전장치)', badJson.status, 0)

// --no-readme 옵션: README 검사만 끄고 PENDING_TEST 검사는 유지
const noReadmeStop = spawnSync('node', [HOOK, '--no-readme'], {
  input: JSON.stringify({ hook_event_name: 'Stop', session_id: 'dg-nr', cwd: tmpRoot }),
  encoding: 'utf8', timeout: 5000, cwd: tmpRoot, env: { ...process.env, CLAUDE_PROJECT_DIR: tmpRoot },
})
assert('--no-readme여도 PENDING_TEST 위반은 차단 (exit 2)', noReadmeStop.status, 2)
const noReadmePre = spawnSync('node', [HOOK, '--no-readme'], {
  input: JSON.stringify({ hook_event_name: 'PreToolUse', session_id: 'dg-nr', tool_name: 'Bash', tool_input: { command: 'git commit -m x' } }),
  encoding: 'utf8', timeout: 5000,
})
assert('--no-readme면 commit 직전 README 검사 생략 (exit 0, 출력 없음)',
  noReadmePre.status === 0 && !noReadmePre.stdout.trim(), true)

// ─── README 미갱신 commit 차단 — 메시지 채널 ──────────────────────
section('README 미갱신 commit → JSON deny (메시지 채널)')
{
  const RSID = 'dg-readme-chan'
  try { fs.unlinkSync(sessionFilePath(RSID)) } catch {}
  recordModifiedFile(RSID, 'Write', { file_path: '/proj/.claude/skills/x/y/SKILL.md' })
  const rRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dg-readme-'))
  spawnSync('git', ['-C', rRoot, 'init', '-q'])
  const pre = (command, sid = RSID) => runHook(
    { hook_event_name: 'PreToolUse', session_id: sid, tool_name: 'Bash', tool_input: { command } },
    { cwd: rRoot, env: { ...process.env, CLAUDE_PROJECT_DIR: rRoot } },
  )
  const r = pre('git commit -m x')
  let j = null
  try { j = JSON.parse(r.stdout) } catch {}
  assert('README 미갱신 commit → exit 0 + permissionDecision deny',
    r.status === 0 && j?.hookSpecificOutput?.permissionDecision === 'deny', true)
  assert('사유는 permissionDecisionReason 에 (SKILL 경로 포함)',
    (j?.hookSpecificOutput?.permissionDecisionReason || '').includes('SKILL.md'), true)
  assert('README deny: stderr 에 사유 없음', r.stderr.trim(), '')
  // 경계: 세션에 README 도 기록되면 통과 (출력 없음)
  recordModifiedFile(RSID, 'Edit', { file_path: path.join(rRoot, 'README.md') })
  const ok = pre('git commit -m x')
  assert('README 함께 수정 → 통과 (출력 없음)', ok.status === 0 && !ok.stdout.trim(), true)
  // 이상 입력: 기록 없는 세션 → 통과
  const none = pre('git commit -m x', 'dg-readme-none')
  assert('기록 없는 세션 → 통과 (출력 없음)', none.status === 0 && !none.stdout.trim(), true)
  try { fs.unlinkSync(sessionFilePath(RSID)) } catch {}
  fs.rmSync(rRoot, { recursive: true, force: true })
}

// ─── 2026-11-06 README 개편 규칙 반영 — 수정만이면 docs/CHANGELOG.md 로 통과, 추가·삭제는 루트 README(수) 필수 ───
section('README 검사 — 수정은 CHANGELOG, 추가·삭제는 루트 README')
{
  let n = 0
  const mkRepo = () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'dg-cl-'))
    const g = (...a) => spawnSync('git', ['-C', d, '-c', 'user.email=t@t', '-c', 'user.name=t', ...a], { encoding: 'utf8' })
    g('init', '-q')
    const w = (rel, c) => { fs.mkdirSync(path.dirname(path.join(d, rel)), { recursive: true }); fs.writeFileSync(path.join(d, rel), c) }
    w('.claude/skills/a/SKILL.md', 'v1'); w('.claude/agents/x.md', 'v1'); w('README.md', 'r1')
    w('docs/CHANGELOG.md', 'c1'); w('docs/skills/README.md', 'l1'); w('sub/docs/CHANGELOG.md', 's1')
    g('add', '.'); g('commit', '-qm', 'init')
    const sid = `dg-cl-${process.pid}-${n++}`
    try { fs.unlinkSync(sessionFilePath(sid)) } catch {}
    // 편집 = 디스크 수정 + 세션 기록(PostToolUse) + 스테이지
    const edit = (rel, c = 'v2') => { w(rel, c); recordModifiedFile(sid, 'Edit', { file_path: path.join(d, rel) }); g('add', '--', rel) }
    const pre = () => runHook({ hook_event_name: 'PreToolUse', session_id: sid, tool_name: 'Bash', tool_input: { command: 'git commit -m x' } }, { cwd: d, env: { ...process.env, CLAUDE_PROJECT_DIR: d } })
    const reason = (r) => { try { return JSON.parse(r.stdout).hookSpecificOutput.permissionDecisionReason || '' } catch { return '' } }
    const done = () => { try { fs.unlinkSync(sessionFilePath(sid)) } catch {}; fs.rmSync(d, { recursive: true, force: true }) }
    return { d, g, w, sid, edit, pre, reason, done }
  }
  const denied = (r) => r.stdout.includes('"permissionDecision":"deny"')

  // 정상
  { const t = mkRepo(); t.edit('.claude/skills/a/SKILL.md'); t.edit('docs/CHANGELOG.md')
    assert('스킬 내용 수정 + docs/CHANGELOG.md → 통과 (루트 README 불필요)', denied(t.pre()), false); t.done() }
  { const t = mkRepo(); t.edit('.claude/agents/x.md'); t.edit('docs/CHANGELOG.md')
    assert('에이전트 내용 수정 + CHANGELOG → 통과', denied(t.pre()), false); t.done() }
  { const t = mkRepo(); t.edit('.claude/skills/a/SKILL.md'); t.edit('README.md')
    assert('스킬 수정 + 루트 README (예전 방식) → 통과', denied(t.pre()), false); t.done() }
  { const t = mkRepo(); t.edit('.claude/skills/new/SKILL.md', 'n'); t.edit('README.md'); t.edit('docs/CHANGELOG.md')
    assert('새 스킬 + 루트 README + CHANGELOG → 통과', denied(t.pre()), false); t.done() }
  { const t = mkRepo(); t.g('rm', '-q', '.claude/agents/x.md'); t.edit('README.md')
    assert('에이전트 삭제(git rm) + 루트 README → 통과', denied(t.pre()), false); t.done() }

  // 악성 — 다른 문서로 때우기
  { const t = mkRepo(); t.edit('.claude/skills/a/SKILL.md')
    const r = t.pre()
    assert('스킬 수정 + 아무 문서도 안 고침 → deny', denied(r), true)
    assert('  └ 수정만이면 안내가 docs/CHANGELOG.md 를 가리킴', t.reason(r).includes('docs/CHANGELOG.md'), true); t.done() }
  { const t = mkRepo(); t.edit('.claude/skills/a/SKILL.md'); t.edit('docs/skills/README.md')
    assert('스킬 수정 + docs/skills/README.md 만 (CHANGELOG 아님) → deny', denied(t.pre()), true); t.done() }
  { const t = mkRepo(); t.edit('.claude/skills/a/SKILL.md'); t.edit('sub/docs/CHANGELOG.md')
    assert('스킬 수정 + 하위 폴더 sub/docs/CHANGELOG.md → deny', denied(t.pre()), true); t.done() }
  { const t = mkRepo(); t.edit('.claude/skills/a/SKILL.md'); t.edit('docs/CHANGELOG.md.bak')
    assert('스킬 수정 + docs/CHANGELOG.md.bak → deny', denied(t.pre()), true); t.done() }
  { const t = mkRepo(); t.edit('.claude/skills/new/SKILL.md', 'n'); t.edit('docs/CHANGELOG.md')
    const r = t.pre()
    assert('새 스킬 추가 + CHANGELOG 만 (루트 README 수 안 고침) → deny', denied(r), true)
    assert('  └ 추가·삭제 안내가 루트 README 수를 가리킴', /README\.md/.test(t.reason(r)) && /수/.test(t.reason(r)), true); t.done() }
  { const t = mkRepo(); t.g('rm', '-q', '.claude/agents/x.md'); t.edit('docs/CHANGELOG.md')
    assert('에이전트 삭제(git rm) + CHANGELOG 만 → deny', denied(t.pre()), true); t.done() }
  { const t = mkRepo(); t.edit('.claude/agents/new.md', 'n')
    t.edit('.claude/skills/a/SKILL.md'); t.edit('docs/CHANGELOG.md')
    assert('수정 1 + 새 에이전트 1 + CHANGELOG 만 → deny (추가가 섞이면 README 필요)', denied(t.pre()), true); t.done() }

  // 경계
  { const t = mkRepo(); t.edit('.claude/skills/a/SKILL.md'); t.w('docs/CHANGELOG.md', 'c2')
    assert('CHANGELOG 를 디스크만 고치고 스테이지 안 함(commit 직전) → deny', denied(t.pre()), true); t.done() }
  { const t = mkRepo(); t.w('.claude/skills/a/SKILL.md', 'v2'); recordModifiedFile(t.sid, 'Edit', { file_path: path.join(t.d, '.claude/skills/a/SKILL.md') }); t.w('docs/CHANGELOG.md', 'c2')
    const stop = runHook({ hook_event_name: 'Stop', session_id: t.sid, cwd: t.d }, { cwd: t.d, env: { ...process.env, CLAUDE_PROJECT_DIR: t.d } })
    assert('Stop: 미스테이지 스킬 수정 + 미스테이지 CHANGELOG → exit 0', stop.status, 0); t.done() }
  { const t = mkRepo(); t.w('.claude/skills/a/SKILL.md', 'v2'); recordModifiedFile(t.sid, 'Edit', { file_path: path.join(t.d, '.claude/skills/a/SKILL.md') })
    const stTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dg-cl-st-'))
    const stop = runHook({ hook_event_name: 'Stop', session_id: t.sid, cwd: t.d }, { cwd: t.d, env: { ...process.env, CLAUDE_PROJECT_DIR: t.d } })
    assert('Stop: 스킬 수정 + 문서 없음 → exit 2', stop.status, 2)
    assert('  └ Stop 사유에 docs/CHANGELOG.md', stop.stderr.includes('docs/CHANGELOG.md'), true)
    fs.rmSync(stTmp, { recursive: true, force: true }); t.done() }
  { const t = mkRepo(); t.w('.claude/skills/b/SKILL.md', 'n'); recordModifiedFile(t.sid, 'Write', { file_path: path.join(t.d, '.claude/skills/b/SKILL.md') }); t.w('docs/CHANGELOG.md', 'c2')
    const stTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dg-cl-st-'))
    const stop = runHook({ hook_event_name: 'Stop', session_id: t.sid, cwd: t.d }, { cwd: t.d, env: { ...process.env, CLAUDE_PROJECT_DIR: t.d } })
    assert('Stop: 미추적(untracked) 새 스킬 + CHANGELOG 만 → exit 2', stop.status, 2)
    fs.rmSync(stTmp, { recursive: true, force: true }); t.done() }
  { const t = mkRepo(); fs.rmSync(path.join(t.d, '.git'), { recursive: true, force: true }); t.edit('.claude/skills/a/SKILL.md'); recordModifiedFile(t.sid, 'Edit', { file_path: path.join(t.d, 'docs/CHANGELOG.md') })
    assert('git 레포 아님 + 스킬 수정 + CHANGELOG(세션 기록) → 크래시 없이 통과', t.pre().status === 0 && !denied(t.pre()), true); t.done() }
}

// ─── 윈도우 — 네이티브 `\` 경로의 스킬 수정도 README 검사 대상 (2026-10-20 실측: 패턴이 `/` 라 통째로 꺼져 있었다) ───
section('윈도우 — 백슬래시 SKILL 경로·대소문자 다른 README')
if (process.platform !== 'win32') {
  console.log('  ⚠️ 건너뜀: 윈도우 README 검사 4종 — 윈도우 전용 (Write/Edit file_path 가 `\\` 로 오는 플랫폼)')
} else {
  const WSID = `dg-win-${process.pid}`
  const wRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dg-win-'))
  spawnSync('git', ['-C', wRoot, 'init', '-q'])
  const preW = (sid, env = {}) => runHook(
    { hook_event_name: 'PreToolUse', session_id: sid, tool_name: 'Bash', tool_input: { command: 'git commit -m x' } },
    { cwd: wRoot, env: { ...process.env, CLAUDE_PROJECT_DIR: wRoot.replace(/\\/g, '/'), ...env } },
  )
  const denied = (r) => { try { return JSON.parse(r.stdout).hookSpecificOutput.permissionDecision === 'deny' } catch { return false } }
  try { fs.unlinkSync(sessionFilePath(WSID)) } catch {}
  recordModifiedFile(WSID, 'Write', { file_path: path.join(wRoot, '.claude', 'skills', 'x', 'SKILL.md') })
  const r1 = preW(WSID)
  assert('윈도우: `C:\\…\\.claude\\skills\\x\\SKILL.md` 수정 + README 미갱신 → deny', denied(r1), true)
  assert('  └ 사유의 파일 목록이 `/` 로 짧게 표시', (JSON.parse(r1.stdout).hookSpecificOutput.permissionDecisionReason || '').includes('.claude/skills/x/SKILL.md'), true)
  // 경계: README 를 드라이브 소문자로 기록해도 루트 README 로 인정 → 통과
  recordModifiedFile(WSID, 'Edit', { file_path: wRoot[0].toLowerCase() + wRoot.slice(1) + '\\README.md' })
  assert('윈도우: 대소문자·구분자 다른 루트 README → 통과', denied(preW(WSID)), false)
  try { fs.unlinkSync(sessionFilePath(WSID)) } catch {}
  // 악성: 하위 폴더의 README(루트 아님)로 우회 시도 → 계속 deny
  const ESID = `dg-win-evil-${process.pid}`
  try { fs.unlinkSync(sessionFilePath(ESID)) } catch {}
  recordModifiedFile(ESID, 'Write', { file_path: path.join(wRoot, '.claude', 'agents', 'a.md') })
  recordModifiedFile(ESID, 'Edit', { file_path: path.join(wRoot, 'sub', 'README.md') })
  assert('윈도우 악성: 하위 폴더 README 로 우회 → deny 유지', denied(preW(ESID)), true)
  recordModifiedFile(ESID, 'Edit', { file_path: path.join(wRoot + '2', 'README.md') })
  assert('윈도우 악성: 접두만 같은 형제 폴더 README → deny 유지', denied(preW(ESID)), true)
  try { fs.unlinkSync(sessionFilePath(ESID)) } catch {}
  fs.rmSync(wRoot, { recursive: true, force: true })
}

// ─── memory·exports 클린 검사 — push/PR 차단 ─────────────────────
section('memory·exports 클린 검사 — push / gh pr create 차단')
const memRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dg-mem-'))
const git = (args) => spawnSync('git', ['-C', memRoot, ...args], { encoding: 'utf8' })
git(['init', '-q'])
git(['config', 'user.email', 't@t.local'])
git(['config', 'user.name', 't'])
fs.mkdirSync(path.join(memRoot, 'memory'))
fs.writeFileSync(path.join(memRoot, 'memory', 'fact.md'), 'v1')
git(['add', '.'])
git(['commit', '-qm', 'init'])

const memEnv = { cwd: memRoot, env: { ...process.env, CLAUDE_PROJECT_DIR: memRoot } }
const preBash = (command, opts = memEnv) => runHook(
  { hook_event_name: 'PreToolUse', session_id: 'dg-mem', tool_name: 'Bash', tool_input: { command } }, opts,
)

// 클린 상태 → push 허용
assert('클린 상태 push → 통과 (출력 없음)', !preBash('git push origin main').stdout.trim(), true)

// memory 미커밋 → push/PR 차단
fs.writeFileSync(path.join(memRoot, 'memory', 'fact.md'), 'v2 (미커밋)')
assert('memory 미커밋 push → deny', preBash('git push origin main').stdout.includes('"permissionDecision":"deny"'), true)
assert('memory 미커밋 gh pr create → deny', preBash('gh pr create --title x').stdout.includes('"permissionDecision":"deny"'), true)
{
  // 안내 명령은 Bash 도구에서 그대로 실행 가능해야 한다 — CLAUDE_PROJECT_DIR 미설정 환경이므로 git 최상위로 명시
  const msg = JSON.parse(preBash('git push').stdout).hookSpecificOutput?.permissionDecisionReason || ''
  assert('차단 메시지에 refresh 조치 포함', msg.includes('session-export.js') && msg.includes('--refresh'), true)
  assert('refresh 안내가 git 최상위 기준(env 미의존)', msg.includes('git rev-parse --show-toplevel'), true)
  assert('refresh 안내에 따옴표 없는 $CLAUDE_PROJECT_DIR 경로 없음', msg.includes('node $CLAUDE_PROJECT_DIR'), false)
}
{
  // 메시지 채널: PreToolUse JSON deny 는 exit 0 + stdout JSON(hookSpecificOutput.permissionDecisionReason) 이어야 한다.
  // exit 2 와 섞으면 JSON 이 무시될 수 있고, stderr 에 사유를 쓰면 이중 전달된다.
  const r = preBash('git push origin main')
  let j = null
  try { j = JSON.parse(r.stdout) } catch {}
  assert('push deny: exit 0 + stdout 이 유효 JSON', r.status === 0 && j !== null, true)
  assert('push deny: hookEventName=PreToolUse', j?.hookSpecificOutput?.hookEventName, 'PreToolUse')
  assert('push deny: permissionDecisionReason 비어있지 않음',
    typeof j?.hookSpecificOutput?.permissionDecisionReason === 'string' && j.hookSpecificOutput.permissionDecisionReason.length > 0, true)
  assert('push deny: stderr 에 사유 없음', r.stderr.trim(), '')
}
assert('--no-readme여도 memory 검사는 동작', spawnSync('node', [HOOK, '--no-readme'], {
  input: JSON.stringify({ hook_event_name: 'PreToolUse', session_id: 'dg-mem', tool_name: 'Bash', tool_input: { command: 'git push' } }),
  encoding: 'utf8', timeout: 5000, ...memEnv,
}).stdout.includes('"permissionDecision":"deny"'), true)

// ── 2026-11-06 감사: push·PR 감지를 문자열 분할 → 셸 분석기로 (heredoc·인용 오탐, -C·개행·bash -c 누락) ──
{
  const isDeny = (r) => r.stdout.includes('"permissionDecision":"deny"')
  // 악성·변형: 실제로 실행되는 push / PR 생성 → deny
  assert('git -C <레포> push → deny', isDeny(preBash(`git -C ${memRoot} push origin x`)), true)
  assert('개행 뒤 git push → deny', isDeny(preBash('ls\ngit push origin x')), true)
  assert('bash -c "git push" → deny', isDeny(preBash('bash -c "git push origin x"')), true)
  assert('env X=1 git push → deny', isDeny(preBash('env X=1 git push')), true)
  assert('(git push) 서브셸 → deny', isDeny(preBash('(git push)')), true)
  assert('true | gh pr create → deny', isDeny(preBash('true | gh pr create --fill')), true)
  assert('gh --repo a/b pr create → deny', isDeny(preBash('gh --repo a/b pr create --fill')), true)
  assert('git.exe push → deny', isDeny(preBash('git.exe push')), true)
  // 오탐 금지: 인용·heredoc 본문 속 텍스트
  assert("cat <<'EOF' > notes.md (본문에 git push) → 통과", isDeny(preBash("cat <<'EOF' > notes.md\ngit push origin main\nEOF")), false)
  assert('echo "git push" → 통과', isDeny(preBash('echo "git push origin main"')), false)
  assert("git log --grep 'gh pr create' → 통과", isDeny(preBash("git log --grep 'gh pr create'")), false)
  assert("printf 'x; git push' → 통과", isDeny(preBash("printf 'x; git push'")), false)
  assert('gh pr list → 통과', isDeny(preBash('gh pr list')), false)
  // 이상·경계
  assert('닫히지 않은 따옴표 + push 단어 → 크래시 없이 exit 0', preBash('echo "git push').status, 0)
  assert('command 가 문자열 아님 → 통과', runHook({ hook_event_name: 'PreToolUse', session_id: 'dg-mem', tool_name: 'Bash', tool_input: { command: ['git', 'push'] } }, memEnv).status, 0)
}

// exports 미커밋도 차단
git(['add', '.']); git(['commit', '-qm', 'memory v2'])
fs.mkdirSync(path.join(memRoot, 'exports'))
fs.writeFileSync(path.join(memRoot, 'exports', 'x.md'), '요약')
assert('exports 미커밋(untracked) push → deny', preBash('git push').stdout.includes('"permissionDecision":"deny"'), true)
git(['add', '.']); git(['commit', '-qm', 'exports'])
assert('전부 커밋 후 push → 통과', !preBash('git push origin main').stdout.trim(), true)

// commit 자체는 차단 안 함 (커밋으로 해소하는 절차이므로)
fs.writeFileSync(path.join(memRoot, 'memory', 'fact.md'), 'v3 (미커밋)')
assert('memory 미커밋이어도 git commit은 통과', !preBash('git commit -m x').stdout.trim(), true)
assert('커밋 메시지에 "git push/gh pr create" 인용돼도 통과 (세그먼트 선두 앵커)',
  !preBash('git commit -m "deliverable-guard: git push/gh pr create 직전 차단 추가"').stdout.trim(), true)
assert('세그먼트 선두의 진짜 push는 여전히 차단', preBash('git add . && git push origin main').stdout.includes('"permissionDecision":"deny"'), true)

// N 프로젝트(memory/ 없음)는 검사 대상 아님
const nRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dg-nmode-'))
spawnSync('git', ['-C', nRoot, 'init', '-q'])
assert('N 프로젝트 push → 통과 (memory/ 없음)', !preBash('git push', {
  cwd: nRoot, env: { ...process.env, CLAUDE_PROJECT_DIR: nRoot },
}).stdout.trim(), true)

// 정리
fs.rmSync(tmpRoot, { recursive: true, force: true })
fs.rmSync(cleanRoot, { recursive: true, force: true })
fs.rmSync(memRoot, { recursive: true, force: true })
fs.rmSync(nRoot, { recursive: true, force: true })

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
