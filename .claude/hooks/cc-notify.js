// Stop — 작업 완료 시 macOS 데스크톱 알림 (macOS 전용, 타 플랫폼 silent)
const { execSync } = require('child_process');
const fs = require('fs');

if (process.platform !== 'darwin') process.exit(0);

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const reason = input.stop_reason || '';

  const message = reason === 'error'
    ? '오류가 발생했어요'
    : '작업이 완료됐어요';

  execSync(
    `osascript -e 'display notification "${message}" with title "Claude Code" sound name "Glass"'`,
    { timeout: 3000 }
  );
} catch {}

process.exit(0);
