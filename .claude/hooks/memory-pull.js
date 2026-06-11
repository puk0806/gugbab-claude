'use strict';
// SessionStart: 원격 최신 memory pull — 다른 데스크탑 변경 사항 자동 반영
const path = require('path');
const { spawnSync } = require('child_process');

const projectDir = process.env.CLAUDE_PROJECT_DIR;
if (!projectDir) process.exit(0);

// 로컬 memory/ 변경이 있으면 pull 스킵 (덮어쓰기 방지)
const localDirty = spawnSync('git', ['-C', projectDir, 'status', '--porcelain', 'memory/'], {
  encoding: 'utf8', stdio: 'pipe',
});
if (localDirty.stdout?.trim()) process.exit(0);

// fetch
spawnSync('git', ['-C', projectDir, 'fetch', 'origin'], { stdio: 'pipe', timeout: 10000 });

// 원격에 새 memory 커밋이 있는지 확인
const behind = spawnSync(
  'git', ['-C', projectDir, 'log', '--oneline', 'HEAD..origin/main', '--', 'memory/'],
  { encoding: 'utf8', stdio: 'pipe' }
);
if (!behind.stdout?.trim()) process.exit(0);

// memory/ 만 원격 기준으로 업데이트 (repo 나머지 영향 없음)
spawnSync('git', ['-C', projectDir, 'checkout', 'origin/main', '--', 'memory/'], { stdio: 'pipe' });

const afterStatus = spawnSync('git', ['-C', projectDir, 'status', '--porcelain', 'memory/'], {
  encoding: 'utf8', stdio: 'pipe',
});
if (afterStatus.stdout?.trim()) {
  spawnSync('git', ['-C', projectDir, 'commit', '-m', '[memory] pull: sync from remote'], { stdio: 'pipe' });
}

process.exit(0);
