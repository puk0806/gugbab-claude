#!/usr/bin/env node
// task-confirm-guard.js — UserPromptSubmit + PreToolUse(Write·Edit·NotebookEdit·Bash·Monitor) + SubagentStart·SubagentStop Hook (공통)
//
// 목적: task-workflow.md 의 "이렇게 이해했습니다 → 작업 목록 → 진행할까요?" 절차를 훅으로 강제한다
//       (2026-10-06 사용자 요청 — 규칙만으로는 약해 확인 없이 수정에 착수하는 일이 반복됨)
//
// 판정 방식: 질문 단어로 "복잡한 작업"을 추측하지 않는다 (과거 task-plan-guard 오탐의 원인).
//   직전 Claude 답변에 "진행할까요"가 있었고 이번 질문이 거절·수정 요청이 아니면 = 승인.
//   UserPromptSubmit: 승인 여부를 세션별 상태 파일에 기록 (+ 미승인이면 절차 지시 주입)
//   PreToolUse Write/Edit/NotebookEdit: 미승인이면 수정 차단 (exit 2)
//   PreToolUse Bash/Monitor: 미승인이면 파일을 바꾸는 셸 명령만 차단 — 판정은 lib/pre-approval-write.js (2026-11-10 결정 2-a)
//   SubagentStart/Stop: 승인된 동안 시작한 서브에이전트(agent_id)를 기록 → 끝날 때까지 승인 유지 (결정 2-b)
//
// 예외 (항상 허용): 메모리(~/.claude/projects/*/memory)·계획(~/.claude/plans)·임시 폴더 쓰기,
//                  질문에 "바로 진행"·"확인 없이" 등 명시 생략 요청
// 한계: 작업 중간에 보낸 메시지는 UserPromptSubmit 이 발생하지 않아 승인 상태를 바꾸지 못한다.
//       셸 명령 판정은 이름·옵션·코드 내용 기준이라, 알려지지 않은 프로그램이 스스로 파일을 쓰는 것은 막지 못한다
//       (2026-11-09 까지는 Bash 를 아예 보지 않아 python heredoc·cp 로 승인 전 수정이 가능했다)

const fs = require('fs')
const os = require('os')
const path = require('path')

const CONFIRM_RE = /진행할까요/
const CONFIRM_TAIL_CHARS = 200
// 2026-10-22 실사용 보고: "물어보지말고 그냥 만들어" 를 못 알아들어 한 번 더 "바로 진행" 을 받아야 했다 →
// 물어보지 말고·컨펌 없이·그냥 진행/만들어/해 줘 추가. 바로 뒤에 부정이 오면("바로 진행하지 마") 생략이 아니다
const BYPASS_RE = /바로\s*(?:진행|작업|수정|해)|확인\s*없이|묻지\s*말고|승인\s*없이|확인\s*생략|물어\s*보지\s*(?:말고|마)|컨펌\s*(?:없이|생략|안\s*받고)|확인\s*안\s*받고|그냥\s*(?:진행|만들|작업|수정|구현|해\s*줘|해\s*$|해\s*[,.!~])/g
const BYPASS_NEGATED_AFTER_RE = /^[가-힣]{0,3}\s*(?:하지\s*(?:마|말)|하진|하면\s*안|말고|마(?:세요|요)?(?:$|[\s,.!~])|않)/

function isBypass(p) {
  for (const m of p.matchAll(BYPASS_RE)) {
    if (!BYPASS_NEGATED_AFTER_RE.test(p.slice(m.index + m[0].length, m.index + m[0].length + 12))) return true
  }
  return false
}
// 거절·수정 요청 — 문장 첫머리의 거절어, 또는 방향을 바꾸는 표현
const REJECT_START_RE = /^[\s"'“‘(]*(?:아니|아뇨|아냐|잠깐|잠시만|멈춰|중단|취소|보류|그만|no\b|stop\b|wait\b)/i
// 2026-10-22: "그냥 만들지 마"·"바로 진행하면 안 돼" 가 승인으로 판정되던 것 — "-지 마"·"-면 안 돼" 일반형 추가
const REJECT_ANY_RE = /말고|하지\s*마|하지\s*말|[가-힣]지\s*마(?:$|[\s,.!~]|세요|요|라)|[가-힣]면\s*안\s*(?:돼|되|됩)|대신에?\s|다시\s*(?:정리|짜|생각|가져)|수정해서\s*다시|이해\s*못|잘못\s*이해/
// 승인어로 시작하는 답 — "응 … 커밋 푸쉬는 하지 말고 …" 처럼 *다른 행동*을 금지하는 부가 조건은 거절이 아니다
// (2026-10-20 실사용 오탐: 승인했는데 "하지 말" 에 걸려 거절로 판정). 승인어 뒤는 공백·문장부호·끝이어야 한다
// ("예전처럼"·"네가" 같은 다른 낱말의 첫 글자는 승인어가 아님)
const APPROVE_START_RE = /^[\s"'“‘(]*(?:응|네|넹|예|ㅇㅇ|ㅇㅋ|좋아요?|오케이|그래|진행(?:해(?:줘|주세요|요)?|하자|하세요|시켜)?)(?=$|[\s,.!~…])/
// 위 관대 처리에서 지우는 "-지 말고 / -지 마" 금지 절(하지·건드리지·푸시하지 …). 대체 요청("A 말고 B로")은 "-지" 가 없어
// 지우지 않는다 → 계속 거절
const PROHIBIT_CLAUSE_RE = /지\s*(?:말(?:고|아(?:줘|요|주세요)?|기|구)?|마(?:세요|요)?)|면\s*안\s*(?:돼|되|됩)/g
// 승인어로 시작해도 중간에 거절어가 낱말로 끼면("응 아니 그거 하지 말고") 관대 처리하지 않는다
const MID_REJECT_RE = /(?:^|[\s,.!~…])(?:아니|아뇨|아냐|잠깐|잠시만|멈춰|중단|취소|보류|그만)(?=$|[\s,.!~…]|야|요|해)/

// 계획 전체를 실행하라는 지시 — 금지 절("-지 말고")이 섞여 있어도 승인으로 본다 (judgePrompt 의 관대 처리)
const PROHIBITED_WORD_RE = /[가-힣]+지\s*(?:말(?:고|아(?:줘|요|주세요)?|기|구)?|마(?:세요|요)?)|[가-힣]+면\s*안\s*(?:돼|되|됩)/g
// 낱말 시작에서만 찾고("했다 하고" 의 '다' 는 아님), 소망·서술("다 하고 싶지만"·"다 하고 있는")은 지시가 아니다
const PROCEED_ALL_RE = /(?:^|[\s,.!~…])(?:(?:다|전부|모두|싹\s*다|끝까지|마저)\s*(?:진행(?!\s*(?:해[야도서]|하면|할지|할까))|하고(?!\s*(?:싶|있))|해(?:줘|라|$|[\s,.!~])|끝내|마무리)|진행\s*(?:해(?![야도서])|하고(?!\s*(?:싶|있))|하자|시켜))/
const OTHER_NEGATION_RE = /안\s*(?:하|해|할)|않(?:고|아|을|는|았|게)|못\s*(?:하|해)/
const APPROVE_WORD_RE = /진행|^\s*(?:응|네|넹|예|ㅇㅇ|ㅇㅋ|좋아|오케이|그래|콜)|해\s*줘|하자|ok\b|okay\b|go\b|yes\b/i
const QUESTION_RE = /\?\s*$|뭐야|뭐지|뭔데|왜\s|어떻게|무슨|무엇|맞아\??\s*$|건가|는가\??\s*$/

const TRANSCRIPT_TAIL_BYTES = 512 * 1024
const TRANSCRIPT_MAX_BYTES = 32 * 1024 * 1024
const HOME = (() => { try { return path.resolve(os.homedir()) } catch { return null } })()
const STATE_DIR = path.join(os.tmpdir(), 'claude-task-confirm-guard')

function stateFile(sessionId) {
  const id = typeof sessionId === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(sessionId) ? sessionId : 'unknown'
  return path.join(STATE_DIR, `${id}.json`)
}

function readState(sessionId) {
  try {
    const st = JSON.parse(fs.readFileSync(stateFile(sessionId), 'utf8'))
    return st && typeof st === 'object' ? st : null
  } catch { return null }
}

function writeState(sessionId, state) {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true })
    fs.writeFileSync(stateFile(sessionId), JSON.stringify(state))
  } catch { /* 기록 실패 → 다음 PreToolUse 에서 상태 없음 = 미승인으로 차단 (보수) */ }
}

// 대화 기록에서 마지막 메인 대화(서브에이전트 제외) Claude 답변 텍스트
function lastAssistantText(transcriptPath) {
  if (typeof transcriptPath !== 'string' || !transcriptPath) return ''
  let fd
  try {
    fd = fs.openSync(transcriptPath, 'r')
    const size = fs.fstatSync(fd).size
    // 끝에서부터 읽되, 한 줄이 범위보다 길어 잘리면(파싱 실패) 범위를 넓혀 다시 읽는다 (최대 MAX)
    for (let want = TRANSCRIPT_TAIL_BYTES; ; want *= 4) {
      const len = Math.min(size, want)
      const buf = Buffer.alloc(len)
      fs.readSync(fd, buf, 0, len, size - len)
      const lines = buf.toString('utf8').split('\n')
      for (let i = lines.length - 1; i >= 0; i--) {
        let e
        try { e = JSON.parse(lines[i]) } catch { continue }
        if (!e || e.type !== 'assistant' || e.isSidechain || !e.message || !Array.isArray(e.message.content)) continue
        const text = e.message.content.filter(p => p && p.type === 'text' && typeof p.text === 'string').map(p => p.text).join('\n')
        if (text.trim()) return text
      }
      if (len >= size || want >= TRANSCRIPT_MAX_BYTES) break
    }
  } catch { /* 읽기 실패 → 직전 확인 질문 없음으로 간주 */ } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* ignore */ }
  }
  return ''
}

// 사람이 아닌 시스템이 대화에 넣는 메시지 — 태그로 시작한다
// agent-message: 서브에이전트 결과 보고(SubagentHandback) — 2026-11-09 이게 빠져 서브에이전트가 끝날 때마다 승인이 풀렸다
const SYSTEM_PROMPT_RE = /^\s*(?:<(?:task-notification|agent-message|system-reminder|cross-session-message|local-command-stdout|local-command-caveat|bash-notification|command-name)\b|Stop hook feedback:|Another Claude session sent a message)/
function isSystemPrompt(prompt) {
  return typeof prompt === 'string' && SYSTEM_PROMPT_RE.test(prompt)
}

function judgePrompt(prompt, prevAssistant) {
  const p = typeof prompt === 'string' ? prompt : ''
  if (isBypass(p)) return { approved: true, why: 'bypass' }
  // 답변 끝부분의 확인 질문만 인정 — 본문에서 절차를 설명하며 인용한 "진행할까요?"는 승인 근거가 아니다
  // (실제 세션 검증 2026-10-06: 인용만으로 승인 처리되는 오탐 확인)
  // 기준 = 마지막 줄 (끝부분 200자 기준도 결정 목록 속 인용을 승인으로 잡아 재차 좁힘)
  const lines = String(prevAssistant || '').trimEnd().split('\n').map(l => l.trim()).filter(Boolean)
  const lastLine = (lines[lines.length - 1] || '').slice(-CONFIRM_TAIL_CHARS)
  if (!CONFIRM_RE.test(lastLine) || /["“'‘「]진행할까요/.test(lastLine)) return { approved: false, why: 'no-confirm-question' }
  // 승인어로 시작 + 중간 거절어 없음 → "하지 말고/하지 마" 금지 절만 빼고 거절 표현을 본다
  // 승인어로 시작하지 않아도, 금지 절을 뺀 나머지에 "다 하고·전부 진행·진행해" 같은 전체 실행 지시가 있으면 같은 관대 처리
  // (2026-11-23 실사용 오탐: "다른 프로젝트 신경쓰지말고 … 잔존 작업 다하고 … 보고해" 가 "말고" 에 걸려 거절로 판정).
  // "A 말고 B로"(‑지 없음)·"다시 정리"·중간 거절어는 그대로 거절이다
  const stripped = p.replace(PROHIBIT_CLAUSE_RE, ' ')
  // 실행 지시는 금지된 낱말째 지운 글에서 찾는다 — "전부 진행하지 말고 기다려" 의 "전부 진행" 은 금지 대상이지 지시가 아니다
  const withoutProhibited = p.replace(PROHIBITED_WORD_RE, ' ')
  // "-지 말고" 가 아닌 부정("진행 안 하고"·"진행하지 않고")이 있으면 실행 지시로 보지 않는다
  const proceedAll = PROCEED_ALL_RE.test(withoutProhibited) && !OTHER_NEGATION_RE.test(p)
  const lenient = !MID_REJECT_RE.test(p) && (APPROVE_START_RE.test(p) || proceedAll)
  const rejectTarget = lenient ? stripped : p
  if (REJECT_START_RE.test(p) || REJECT_ANY_RE.test(rejectTarget)) return { approved: false, why: 'rejected' }
  // 승인 표현 없이 되묻는 질문("이건 뭐야??")은 승인이 아니라 확인 질문 (실제 세션 검증으로 추가)
  if (!APPROVE_WORD_RE.test(p) && QUESTION_RE.test(p)) return { approved: false, why: 'question' }
  return { approved: true, why: 'approved' }
}

const IS_WIN = process.platform === 'win32'

// 윈도우 판정 (2026-10-20 윈도우 PC 실측: 임시 폴더 = os.tmpdir() = `C:\Users\…\AppData\Local\Temp`, Claude scratchpad 도 그 아래.
// `/tmp`·`/var/folders` 고정식은 윈도우에서 한 번도 맞지 않아 임시 폴더 쓰기까지 막혔다).
// 경로 단위·대소문자 무시 비교(lib/winpath) — 접두만 같은 형제(`Temp2`)·`..` 탈출은 예외 아님.
// 판정은 링크(junction)를 따라간 *실제 위치* 기준 — 임시 폴더 안 junction 이 레포를 가리키면 실제로는 레포에 쓰게 되므로 예외 아님.
// 실경로는 realpathSync.native(junction·8.3 짧은 이름·대소문자까지 정규화)로 구한다.
// lib 로드 실패 등 예외는 false(=예외 아님 → 승인 상태에 따름, 보수)
function isExemptPathWin(filePath, cwd) {
  try {
    const w = require('./lib/winpath')
    const real = (p) => { try { return fs.realpathSync.native(p) } catch { return null } }
    const realLoc = (abs) => { // 가장 가까운 실제 존재하는 상위 폴더의 실경로 + 나머지
      let cur = abs
      const rest = []
      for (let i = 0; i < 256; i++) {
        const r = real(cur)
        if (r) return path.win32.join(r, ...rest.reverse())
        const up = path.win32.dirname(cur)
        if (up === cur) return null
        rest.push(path.win32.basename(cur))
        cur = up
      }
      return null
    }
    let v = w.msysToWin(filePath, true)
    if (HOME && (v === '~' || /^~[\\/]/.test(v))) v = HOME + v.slice(1)
    const abs = path.win32.resolve(w.msysToWin(cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd(), true), v)
    const p = realLoc(abs) || abs
    const under = (x, base) => base && w.isUnder(x, base, true) && !w.samePath(x, base, true)
    const both = (base) => [base, real(base)].filter(Boolean)
    // 이 훅의 승인 상태 파일 폴더는 임시 폴더 안이지만 예외가 아니다 — Write 로 approved:true 를 써 넣는 자기 승인 차단
    if ([abs, p].some(x => both(STATE_DIR).some(b => w.isUnder(x, b, true)))) return false
    if (both(os.tmpdir()).some(t => under(p, t))) return true
    if (HOME) {
      const np = w.normPath(p, true)
      for (const base of both(path.win32.join(HOME, '.claude'))) {
        const projects = w.normPath(path.win32.join(base, 'projects'), true) + '/'
        if (np.startsWith(projects) && np.slice(projects.length).split('/')[1] === 'memory') return true
        if (np.startsWith(w.normPath(path.win32.join(base, 'plans'), true) + '/')) return true
      }
    }
  } catch { /* 판정 불가 → 예외 아님 */ }
  return false
}

// 레포 memory/ 미러 — 전역 메모리 폴더와 같은 내용을 memory-sync 가 양방향으로 맞추는 곳이라 전역과 같게 승인 없이 쓸 수 있다
// (2026-11-23 다른 세션 보고: 전역 메모리는 되는데 레포 미러 Edit 만 승인 전에 막힘).
// 조건: git 최상위에 memory/MEMORY.md 가 실제 파일로 있고, 대상이 그 memory/ 안의 .md 이며, 링크를 따라간 실제 위치도 그 안일 것
function isRepoMemoryMirror(filePath, cwd) {
  try {
    if (/^~/.test(filePath)) return false
    const abs = path.resolve(cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd(), filePath)
    if (!/\.md$/i.test(abs)) return false
    let root = path.dirname(abs)
    for (let i = 0; i < 64; i++) {
      if (fs.existsSync(path.join(root, '.git'))) break
      const up = path.dirname(root)
      if (up === root) return false
      root = up
    }
    // 지금 프로젝트의 git 최상위여야 한다 — 안쪽에 따로 있는 .git(서브모듈·벤더 폴더)의 memory/ 는 미러가 아니다
    let proj = path.resolve(cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd())
    for (let i = 0; i < 64; i++) {
      if (fs.existsSync(path.join(proj, '.git'))) break
      const up = path.dirname(proj)
      if (up === proj) return false
      proj = up
    }
    if (fs.realpathSync(proj) !== fs.realpathSync(root)) return false
    // 메모리 공유를 쓰는 프로젝트여야 한다 — 래퍼는 켜진 항목(GUGBAB_ENABLED), 레포 직접 실행은 프로젝트의 memory-sync 훅 파일로 본다
    const en = process.env.GUGBAB_ENABLED
    const shared = typeof en === 'string' ? en.split(',').includes('hook:memory-sync') : fs.existsSync(path.join(root, '.claude', 'hooks', 'memory-sync.js'))
    if (!shared) return false
    const mem = path.join(root, 'memory')
    if (!fs.lstatSync(mem).isDirectory() || !fs.lstatSync(path.join(mem, 'MEMORY.md')).isFile()) return false
    const realMem = fs.realpathSync(mem)
    let dir = path.dirname(abs)
    while (!fs.existsSync(dir)) dir = path.dirname(dir)
    const realTarget = path.join(fs.realpathSync(dir), path.relative(dir, abs))
    try { if (fs.lstatSync(abs).isSymbolicLink()) return false } catch { /* 새 파일 */ }
    const rel = path.relative(realMem, realTarget)
    return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel)
  } catch { return false }
}

function isExemptPath(filePath, cwd) {
  if (typeof filePath !== 'string' || !filePath) return false
  if (isRepoMemoryMirror(filePath, cwd)) return true
  if (IS_WIN) return isExemptPathWin(filePath, cwd)
  let v = filePath
  if (HOME && (v === '~' || v.startsWith('~/'))) v = HOME + v.slice(1)
  let abs
  try { abs = path.resolve(cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd(), v) } catch { return false }
  // 이 훅의 승인 상태 폴더는 임시 폴더 안이지만 예외가 아니다 — Write 로 approved:true 를 써 넣는 자기 승인 차단 (2026-10-22, 윈도우 분기와 같게)
  if (inStateDir(abs)) return false
  if (/^\/(?:private\/)?(?:tmp|var\/folders)\//.test(abs)) return true
  if (HOME) {
    // 래퍼 설정 폴더의 projects/·plans/ 는 ~/.claude 쪽 링크 — 실제 위치로도 한 번 더 본다
    for (const p of [abs, realLocation(abs)]) {
      if (!p) continue
      for (const base of claudeBases()) {
        const projects = path.join(base, 'projects') + path.sep
        if (p.startsWith(projects) && p.slice(projects.length).split(path.sep)[1] === 'memory') return true
        if (p.startsWith(path.join(base, 'plans') + path.sep)) return true
      }
    }
  }
  return false
}

// 경로가 승인 상태 폴더(또는 그 폴더 자체) 안인가 — `/var` ↔ `/private/var` 링크, 맥 기본 파일 시스템의 대소문자 무시까지
// 실제 위치(realpath.native)로 비교한다. 상태 폴더가 아직 없으면 그 부모(임시 폴더)의 실경로 + 이름으로
function inStateDir(abs) {
  const nat = (p) => { try { return fs.realpathSync.native(p) } catch { return null } }
  const locate = (p) => { // 가장 가까운 실제 존재하는 상위 폴더의 실표기 + 나머지
    let cur = p
    const rest = []
    for (let i = 0; i < 256; i++) {
      const r = nat(cur)
      if (r) return path.join(r, ...rest.reverse())
      const up = path.dirname(cur)
      if (up === cur) return null
      rest.push(path.basename(cur))
      cur = up
    }
    return null
  }
  const fold = (p) => (process.platform === 'darwin' ? p.toLowerCase() : p)
  const bases = [STATE_DIR, locate(STATE_DIR)].filter(Boolean).map(fold)
  return [abs, locate(abs)].filter(Boolean).map(fold).some(x => bases.some(b => x === b || x.startsWith(b + path.sep)))
}

// ~/.claude 와 그 실경로 (홈 아래가 링크인 환경 대비)
function claudeBases() {
  const b = path.join(HOME, '.claude')
  let real = b
  try { real = fs.realpathSync(b) } catch { /* 없음 */ }
  return real === b ? [b] : [b, real]
}

// 가장 가까운 실제 존재하는 상위 폴더의 실경로 + 나머지 (없으면 null)
function realLocation(abs) {
  let cur = abs
  const rest = []
  for (let i = 0; i < 256; i++) {
    try { return path.join(fs.realpathSync(cur), ...rest.reverse()) } catch { /* 한 단계 위로 */ }
    const up = path.dirname(cur)
    if (up === cur) return null
    rest.push(path.basename(cur))
    cur = up
  }
  return null
}

const PRE_CONTEXT = '[task-confirm-guard] 이번 요청에 파일 수정이 필요하면 먼저 "이렇게 이해했습니다:"(요약) → "작업 목록:"(번호 목록) → "진행할까요?"를 제시하고 답변을 끝낸다. 승인 전 Write/Edit 와 파일을 바꾸는 셸 명령은 훅이 차단한다. 설명·조회·보고 요청이면 파일을 수정하지 않는다.'
const BLOCK_MSG = [
  '[task-confirm-guard] 사용자 승인 전이라 파일 수정을 차단했습니다.',
  '  → 먼저 "이렇게 이해했습니다:" / "작업 목록:" / "진행할까요?" 를 제시하고 답변을 끝내세요.',
  '  → 사용자가 승인하면 다음 차례에 수정할 수 있습니다. (사용자가 "바로 진행"이라고 하면 생략 가능)',
].join('\n')

function handle(input) {
  if (!input || typeof input !== 'object') return { code: 0 }
  const event = input.hook_event_name || input.hookEventName
  const sessionId = input.session_id

  if (event === 'UserPromptSubmit') {
    // 사용자가 친 슬래시 커맨드(/commit·/create-pr)는 커밋·푸시 요청이다 — 승인 상태는 그대로 두고 요청 동작만 새로 기록 (2026-11-13)
    if (typeof input.prompt === 'string' && /^\s*<command-name>/.test(input.prompt)) {
      const prev = readState(sessionId)
      writeState(sessionId, { ...(prev || { approved: false, why: 'slash-command', agents: [] }), vcs: vcsRequested(input.prompt), at: new Date().toISOString() })
      return { code: 0 }
    }
    // 시스템이 보낸 알림(백그라운드 작업 완료 등)은 사용자 답이 아니다 — 승인 상태를 바꾸지 않는다
    // (실제 세션 2026-10-06: <task-notification> 이 UserPromptSubmit 으로 들어와 승인이 풀린 사례)
    // 다른 세션 메시지도 마찬가지 — 그 안의 "커밋·머지" 글자가 커밋 허락이 되면 안 된다(요청 동작도 그대로 둔다)
    if (isSystemPrompt(input.prompt)) return { code: 0 }
    const verdict = judgePrompt(input.prompt, lastAssistantText(input.transcript_path))
    // 승인된 동안 시작한 서브에이전트는 새 메시지가 와도 끝날 때까지 유지 — 사용자가 거절·중단하면("멈춰"·"아니") 함께 푼다
    const prev = readState(sessionId)
    const agents = verdict.why === 'rejected' ? [] : (prev && Array.isArray(prev.agents) ? prev.agents.filter(validAgentId).slice(-MAX_AGENTS) : [])
    // 커밋·푸시·PR·머지 요청은 이번 메시지 글자로만 정한다 — 계획 승인("진행해")은 허락이 아니다 (2026-11-13 사고, 사용자 결정 B)
    writeState(sessionId, { approved: verdict.approved, why: verdict.why, at: new Date().toISOString(), agents, vcs: vcsRequested(input.prompt) })
    if (verdict.approved) return { code: 0 }
    return { code: 0, stdout: JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: PRE_CONTEXT } }) }
  }

  // 승인된 동안 띄운 서브에이전트 — 끝날 때까지 승인을 유지한다 (2026-11-10 사용자 결정 2-b)
  // SubagentStart 는 차단할 수 없어(공식) 기록만 한다. agent_id 는 Claude Code 가 넣는 값이고, 상태 파일은 Write·Bash 로 못 쓴다
  if (event === 'SubagentStart') {
    const id = validAgentId(input.agent_id)
    const st = readState(sessionId)
    if (!id || !st || st.approved !== true) return { code: 0 }
    const agents = Array.isArray(st.agents) ? st.agents.filter(validAgentId) : []
    if (!agents.includes(id)) agents.push(id)
    writeState(sessionId, { ...st, agents: agents.slice(-MAX_AGENTS) })
    return { code: 0 }
  }
  if (event === 'SubagentStop') {
    const id = validAgentId(input.agent_id)
    const st = readState(sessionId)
    if (!id || !st || !Array.isArray(st.agents) || !st.agents.includes(id)) return { code: 0 }
    writeState(sessionId, { ...st, agents: st.agents.filter(a => a !== id) })
    return { code: 0 }
  }

  if (event === 'PreToolUse') {
    const tool = input.tool_name
    const ti = input.tool_input && typeof input.tool_input === 'object' ? input.tool_input : {}
    const cwd = typeof input.cwd === 'string' ? input.cwd : undefined
    let reason = null
    if (tool === 'Write' || tool === 'Edit' || tool === 'NotebookEdit') {
      const target = ti.file_path || ti.notebook_path || ti.path
      if (isExemptPath(target, cwd)) return { code: 0 }
      reason = 'file'
    } else if (tool === 'Bash' || tool === 'Monitor') {
      // 셸로 파일을 바꾸는 명령도 승인 전에는 막는다 (2026-11-10 사용자 결정 2-a) — 읽기·테스트·임시 폴더 쓰기는 통과
      if (typeof ti.command !== 'string') return { code: 0 } // command 없는 Monitor(WebSocket 등)
      // 커밋·푸시·PR·머지는 승인 여부와 따로 — 가장 최근 사용자 메시지가 그 동작을 요청했을 때만 (2026-11-13, 서브에이전트 포함)
      const missing = vcsMissing(ti.command, readState(sessionId))
      if (missing) return { code: 2, stderr: missing }
      // 커밋·푸시를 요청받은 차례의 세션 요약 갱신은 커밋 절차의 일부라 막지 않는다 (2026-11-24 — 막혀서 exports 가 두 번 밀렸다)
      if (isSessionExportRefresh(ti.command, cwd, readState(sessionId))) return { code: 0 }
      reason = shellWriteReason(ti.command, cwd)
      if (!reason) return { code: 0 }
    } else {
      return { code: 0 }
    }
    if (isApproved(readState(sessionId), input.agent_id)) return { code: 0 }
    return { code: 2, stderr: reason === 'file' ? BLOCK_MSG : `${BLOCK_MSG}\n  → 셸 명령도 파일을 바꾸면 막습니다: ${reason}` }
  }
  return { code: 0 }
}

const MAX_AGENTS = 64
function validAgentId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9_.:-]{1,128}$/.test(id) ? id : null
}
// 메인 대화 = 현재 승인 상태. 서브에이전트 = 승인된 동안 시작해 기록된 경우만(이후 메인 승인이 풀려도 끝날 때까지 유지)
// — 승인 없이 시작한 서브에이전트는 메인이 나중에 승인돼도 막는다(승인 전 띄운 에이전트가 승인을 빌려 쓰지 않게)
function isApproved(st, agentId) {
  if (!st) return false
  if (agentId === undefined || agentId === null || agentId === '') return st.approved === true
  const id = validAgentId(agentId)
  return !!id && Array.isArray(st.agents) && st.agents.includes(id)
}

// 커밋·푸시·PR·머지 요청 판정 (lib/vcs-request.js). 모듈을 못 불러오면 요청 기록은 비우고, 판정은 글자 기준으로 막는다(보수)
function vcsLib() { try { return require('./lib/vcs-request') } catch { return null } }
function vcsRequested(prompt) {
  const lib = vcsLib()
  return lib ? lib.requestedActions(prompt) : { commit: false, push: false, pr: false, merge: false }
}
function vcsMissing(cmd, st) {
  const lib = vcsLib()
  if (!lib) {
    return /\b(?:git\b[^\n]{0,80}?\b(?:commit|push)|gh\b[^\n]{0,40}?\bpr\b[^\n]{0,20}?\b(?:create|merge))\b/i.test(cmd)
      ? '[task-confirm-guard] 판정 모듈(lib/vcs-request.js)을 불러오지 못해 커밋·푸시·PR·머지를 막았습니다.' : null
  }
  const missing = lib.missingActions(cmd, st && st.vcs)
  return missing.length ? lib.blockMessage(missing) : null
}

// 세션 요약 갱신 명령(.claude/rules/memory-sync.md 3단계) — 이번 사용자 메시지가 커밋·푸시·PR·머지를 요청했고,
// 명령이 정해진 꼴 그대로이며, 실행되는 스크립트가 이 프로젝트의 .claude/hooks/session-export.js(링크 아님)일 때만 참.
// 다른 명령을 덧붙이거나(; && |) 다른 폴더의 같은 이름 스크립트를 가리키면 거짓 → 평소 판정으로
const EXPORT_REFRESH_RE = /^(?:cd\s+("[^"$`\\]+"|[\w.\/~-]+)\s*&&\s*)?(R="\$\(git rev-parse --show-toplevel\)"\s*&&\s*)?CLAUDE_PROJECT_DIR=("\$R"|"[^"$`\\]+"|[\w.\/~-]+)\s+node\s+("\$R\/\.claude\/hooks\/session-export\.js"|\.claude\/hooks\/session-export\.js)\s+--refresh(?:\s+2>&1)?(?:\s*\|\s*tail\s+-(?:n\s*)?\d+)?\s*$/
function isSessionExportRefresh(cmd, cwd, st) {
  const v = st && st.vcs
  if (!v || !(v.commit || v.push || v.pr || v.merge)) return false
  const text = String(cmd).trim()
  // 줄바꿈이 끼면 셸은 여러 명령으로 실행한다 — 한 줄 명령만 인정
  if (/[\r\n]/.test(text)) return false
  const m = EXPORT_REFRESH_RE.exec(text)
  if (!m) return false
  // 셸은 따옴표 안의 ~ 를 풀지 않는다 — 따옴표 없는 값에서만 홈으로 푼다 (훅이 본 경로와 실제 경로가 어긋나지 않게)
  const unq = (s) => (/^".*"$/.test(s) ? s.slice(1, -1) : s.replace(/^~(?=\/|$)/, os.homedir()))
  const base = cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd()
  const runDir = m[1] ? path.resolve(base, unq(m[1])) : base
  const usesR = !!m[2]
  if ((m[3] === '"$R"' || m[4].startsWith('"$R')) && !usesR) return false
  let root = runDir
  if (usesR) {
    try { root = require('child_process').execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: runDir, encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }).trim() } catch { return false }
  }
  // 스크립트는 이 세션 프로젝트의 것이어야 한다
  const projRoot = gitRootOf(base)
  if (!projRoot || !sameReal(root, projRoot)) return false
  if (m[3] !== '"$R"' && !sameReal(path.resolve(runDir, unq(m[3])), projRoot)) return false
  // 셸이 실제로 실행할 파일 — 상대 경로 꼴은 실행 폴더(runDir) 기준이다. 하위 폴더에서 돌리면 그쪽의 같은 이름 파일이 실행되므로
  // 프로젝트 최상위의 스크립트와 같은 파일인지 확인한다 (2026-11-24 깨끗한 리뷰 지적)
  const REL = path.join('.claude', 'hooks', 'session-export.js')
  const script = path.join(projRoot, REL)
  const executed = m[4].startsWith('"$R') ? path.join(root, REL) : path.join(runDir, REL)
  try { const s = fs.lstatSync(executed); if (!s.isFile() || s.isSymbolicLink()) return false } catch { return false }
  if (!sameReal(executed, script)) return false
  // 커밋된 내용 그대로일 때만 — 이번 차례에 바뀌었거나 git 이 모르는 스크립트는 평소 판정으로
  //   스크립트가 불러오는 공용 모듈(.claude/hooks/lib/)도 함께 본다 — 거기에 쓰기 코드를 넣고 갱신 명령으로 돌리는 우회 방지
  const git = (args) => { try { return require('child_process').execFileSync('git', args, { cwd: projRoot, encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }) } catch { return null } }
  const WATCH = ['.claude/hooks/session-export.js', '.claude/hooks/lib']
  // lib(또는 그 위 폴더)가 링크면 git 은 링크가 가리키는 곳의 내용 변경을 보지 못한다 → 링크면 허용하지 않는다
  for (const rel of ['.claude', path.join('.claude', 'hooks'), path.join('.claude', 'hooks', 'lib')]) {
    // lib 는 없어도 된다(ENOENT). 그 밖의 오류는 확인할 수 없으니 허용하지 않는다
    try { if (fs.lstatSync(path.join(projRoot, rel)).isSymbolicLink()) return false } catch (err) { if (!(err && err.code === 'ENOENT' && rel === path.join('.claude', 'hooks', 'lib'))) return false }
  }
  // 감시 대상 안의 파일 하나가 링크여도 같은 문제 — git 이 링크로 기록한 항목(모드 120000)이 있으면 허용하지 않는다
  const staged = git(['ls-files', '-s', '--', ...WATCH])
  if (staged === null || /^120000 /m.test(staged)) return false
  if (git(['ls-files', '--error-unmatch', '--', '.claude/hooks/session-export.js']) === null) return false
  if (git(['diff', '--quiet', 'HEAD', '--', ...WATCH]) === null) return false
  const untracked = git(['ls-files', '--others', '--', '.claude/hooks/lib'])
  return untracked !== null && untracked.trim() === ''
}
function gitRootOf(dir) {
  try { return require('child_process').execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: dir, encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }).trim() } catch { return null }
}
function sameReal(a, b) {
  // native — 윈도우의 짧은 이름(RUNNER~1)·대소문자·구분자를 실제 경로로 맞춘다
  const real = (p) => (fs.realpathSync.native || fs.realpathSync)(p)
  try { const x = real(a), y = real(b); return process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y } catch { return false }
}

function shellWriteReason(cmd, cwd) {
  let lib
  try { lib = require('./lib/pre-approval-write') } catch { return '판정 모듈(lib/pre-approval-write.js)을 불러오지 못했습니다' }
  return lib.preApprovalWriteReason(cmd, cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd(), { isExemptPath: (abs) => isExemptPath(abs, cwd) })
}

if (require.main === module) {
  let input = null
  try { input = JSON.parse(fs.readFileSync(0, 'utf8')) } catch { process.exit(0) }
  const r = handle(input)
  if (r.stdout) process.stdout.write(r.stdout + '\n')
  if (r.stderr) process.stderr.write(r.stderr + '\n')
  process.exit(r.code)
} else {
  module.exports = { handle, judgePrompt, isSystemPrompt, isExemptPath, lastAssistantText, stateFile, STATE_DIR }
}
