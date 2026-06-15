// UserPromptSubmit — 복잡한 작업 요청 감지 시 Claude에게 계획 확인 절차 지시
const fs = require('fs');

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
];

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
];

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const prompt = (input.prompt || '').trim();

  // 너무 짧은 프롬프트는 건너뜀 (단순 yes/no 응답 등)
  if (prompt.length < 10) process.exit(0);

  // 즉시 실행 가능 패턴이면 건너뜀
  for (const p of QUICK_PATTERNS) {
    if (p.test(prompt)) process.exit(0);
  }

  // 복잡한 작업 패턴 감지
  let isComplex = false;
  for (const p of COMPLEX_PATTERNS) {
    if (p.test(prompt)) { isComplex = true; break; }
  }

  if (!isComplex) process.exit(0);

  process.stdout.write(
    `[task-plan-guard] → Claude 지시: 실행 전 아래 순서를 따르세요.\n` +
    `  1. "이렇게 이해했습니다:" — 요청 내용 1-3줄 요약\n` +
    `  2. "작업 목록:" — 번호 있는 구체적 단계 리스트\n` +
    `  3. "진행할까요?" — 사용자 확인 대기\n` +
    `  4. 승인 받은 후에만 코드·파일 수정 실행\n` +
    `  (rules/task-workflow.md 참조)\n`
  );
} catch {}

process.exit(0);
