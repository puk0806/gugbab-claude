// SessionStart — 세션 시작 시 현재 브랜치·미커밋 파일·최근 커밋 요약 출력
const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

try {
  const branch = run('git branch --show-current') || 'unknown';
  const status = run('git status --porcelain');
  const changed = status ? status.split('\n').filter(Boolean).length : 0;
  const log = run('git log --oneline -3');

  const lines = [
    '─────────────────────────────────────────',
    `[Session Start] 브랜치: ${branch}`,
  ];

  if (changed > 0) {
    lines.push(`미커밋 파일: ${changed}개`);
  }

  if (log) {
    lines.push('최근 커밋:');
    log.split('\n').forEach(l => lines.push(`  ${l}`));
  }

  lines.push('─────────────────────────────────────────');

  process.stderr.write(lines.join('\n') + '\n');
} catch {}

process.exit(0);
