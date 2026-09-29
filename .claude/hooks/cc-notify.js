// Stop — 작업 완료 시 macOS 데스크톱 알림 (macOS 전용, 타 플랫폼 silent)
//
// 입력 필드 (공식 문서 code.claude.com/docs/en/hooks — Stop input):
//   stop_hook_active, last_assistant_message, background_tasks, session_crons  (stop_reason 필드는 없음)
//   - stop_hook_active === true : 다른 Stop 훅이 종료를 막아 Claude 가 계속 진행 중인 연쇄 → "완료" 알림 금지
//     (연쇄마다 알림이 반복되는 것도 방지. 오류 구분은 별도 이벤트 StopFailure 의 몫)
//   - background_tasks 비어있지 않음 : 세션이 백그라운드 작업을 기다리는 중 → "완료" 대신 대기 안내
// 알림 문구는 고정 리터럴만 사용 — 입력 문자열을 osascript 명령에 절대 넣지 않는다(셸 인젝션 차단)
const { execSync } = require('child_process');
const fs = require('fs');

if (process.platform !== 'darwin') process.exit(0);

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  if (input === null || typeof input !== 'object') process.exit(0);

  if (input.stop_hook_active === true) process.exit(0);

  const waiting = Array.isArray(input.background_tasks) && input.background_tasks.length > 0;
  const message = waiting ? '백그라운드 작업을 기다리는 중이에요' : '작업이 완료됐어요';

  execSync(
    `osascript -e 'display notification "${message}" with title "Claude Code" sound name "Glass"'`,
    { timeout: 3000 }
  );
} catch {}

process.exit(0);
