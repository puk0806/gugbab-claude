// UserPromptSubmit — 복잡한 작업 요청 감지 시 확인 절차 강제
// 플래그 파일(.claude/.awaiting-confirmation)로 Write/Edit 차단 연동
const fs = require('fs')
const path = require('path')

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd()
const FLAG_FILE = path.join(PROJECT_DIR, '.claude', '.awaiting-confirmation')

// 즉시 실행 가능 (확인 절차 생략)
const QUICK_PATTERNS = [
  /^커밋|커밋해/,
  /^푸시|푸시해/,
  /git\s*(commit|push|add|status|diff|log)/i,
  /요약해|정리해줘|summarize/i,
  /설명해줘|설명해|explain/i,
  /알려줘|뭐야|뭔가요|무엇인가/,
  /보여줘|읽어줘|show me|read/i,
  /찾아줘|검색해줘|search|find/i,
  /어떻게.*돼|어떻게.*해|how does/i,
]

// 사용자 확인 패턴 → 플래그 해제
const CONFIRM_PATTERNS = [
  /^진행해$|^진행할게$|^진행$/,
  /^yes$|^ok$|^계속$|^응$|^어$|^네$|^예$/i,
  /진행해줘|진행할게요|진행하자|계속해줘|계속 진행/,
  /진행하고|진행할게|진행 해줘/,
  /^응\s|^어\s|^네\s|^예\s/,
  /네[,\s]?진행|좋아요|좋습니다|알겠습니다|알겠어요|알겠어|ㅇㅇ|ㄱㄱ/,
  /승인|approve|proceed/i,
]

// 복잡한 작업 (확인 절차 필요)
const COMPLEX_PATTERNS = [
  /만들어|구현해|implement|create|build/i,
  /설계해|design/i,
  /추가해|add/i,
  /변경해|수정해|바꿔|고쳐|modify|update|change/i,
  /개편|리팩터|리팩토링|refactor/i,
  /반영해|적용해|넣어줘|apply/i,
  /삭제해|제거해|delete|remove/i,
  /작성해줘|작성해|write/i,
  /이식해|export|install/i,
  /마이그레이션|migration/i,
]

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'))
  const prompt = (input.prompt || '').trim()

  // 확인 패턴 감지 → 플래그가 있을 때만 해제 (없으면 일반 복잡도 검사 계속)
  if (fs.existsSync(FLAG_FILE)) {
    for (const p of CONFIRM_PATTERNS) {
      if (p.test(prompt)) {
        try { fs.unlinkSync(FLAG_FILE) } catch {}
        process.exit(0)
      }
    }
  }

  // 즉시 실행 가능 패턴
  for (const p of QUICK_PATTERNS) {
    if (p.test(prompt)) process.exit(0)
  }

  // 복잡한 작업 패턴 감지
  let isComplex = false
  for (const p of COMPLEX_PATTERNS) {
    if (p.test(prompt)) { isComplex = true; break }
  }

  if (!isComplex) process.exit(0)

  // 플래그 설정
  try { fs.writeFileSync(FLAG_FILE, new Date().toISOString()) } catch {}

  // 강한 지시 — confirmation-gate가 Write/Edit를 차단함을 명시
  process.stdout.write(
    `[task-plan-guard] 복잡한 작업 감지 — 사용자 확인 전 파일 수정 차단됨\n` +
    `지금 당장 아래를 수행하세요 (파일 수정 전 필수):\n` +
    `  1. "이렇게 이해했습니다:" — 요청 내용 요약\n` +
    `  2. "작업 목록:" — 번호 있는 단계 리스트\n` +
    `  3. "진행할까요?" — 사용자 확인 대기\n` +
    `사용자가 "진행해"라고 응답하기 전까지 Write/Edit 도구가 차단됩니다.\n`
  )
} catch {}

process.exit(0)
