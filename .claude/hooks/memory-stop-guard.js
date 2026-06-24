'use strict';
// Stop: 세션 종료 직전 미커밋 memory 변경 커밋 (push는 사용자가 직접)
const path = require('path');
const { spawnSync } = require('child_process');

const projectDir = process.env.CLAUDE_PROJECT_DIR;
if (!projectDir) process.exit(0);

// 미커밋 memory 변경 확인 → 커밋만 수행
const uncommitted = spawnSync('git', ['-C', projectDir, 'status', '--porcelain', 'memory/'], {
  encoding: 'utf8', stdio: 'pipe',
});

if (uncommitted.stdout?.trim()) {
  spawnSync('git', ['-C', projectDir, 'add', 'memory/'], { stdio: 'pipe' });
  // memory/ 경로만 커밋 (staged 다른 파일에 영향 없음)
  spawnSync('git', ['-C', projectDir, 'commit', '-m', '[memory] auto-sync on stop', '--', 'memory/'], { stdio: 'pipe' });
}

process.exit(0);
