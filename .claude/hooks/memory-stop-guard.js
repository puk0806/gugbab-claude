'use strict';
// Stop: 세션 종료 직전 미동기 memory 변경 재시도 — 강제 동기화 보장
const path = require('path');
const { spawnSync } = require('child_process');

const projectDir = process.env.CLAUDE_PROJECT_DIR;
if (!projectDir) process.exit(0);

// 1. 미커밋 변경 확인
const uncommitted = spawnSync('git', ['-C', projectDir, 'status', '--porcelain', 'memory/'], {
  encoding: 'utf8', stdio: 'pipe',
});

if (uncommitted.stdout?.trim()) {
  spawnSync('git', ['-C', projectDir, 'add', 'memory/'], { stdio: 'pipe' });
  spawnSync('git', ['-C', projectDir, 'commit', '-m', '[memory] auto-sync on stop'], { stdio: 'pipe' });
}

// 2. 원격보다 앞선 커밋 확인
const ahead = spawnSync(
  'git', ['-C', projectDir, 'log', '--oneline', '@{u}..HEAD', '--', 'memory/'],
  { encoding: 'utf8', stdio: 'pipe' }
);

if (!ahead.stdout?.trim()) process.exit(0);

// 3. push 시도
const push = spawnSync('git', ['-C', projectDir, 'push'], {
  encoding: 'utf8', stdio: 'pipe', timeout: 15000,
});

if (push.status !== 0) {
  // 경고 출력 (네트워크 오류 등 - 차단하지 않음)
  process.stdout.write(
    `[memory-stop-guard] ⚠️  메모리 원격 동기화 실패.\n다음 세션 시작 전 수동으로 git push하세요.\n`
  );
}

process.exit(0);
