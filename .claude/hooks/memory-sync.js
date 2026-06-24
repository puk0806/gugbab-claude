'use strict';
// PostToolUse (Write|Edit): memory 파일 변경 감지 → git commit (push는 사용자가 직접)
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', d => (input += d));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data?.tool_input?.file_path || '';

    if (!filePath.includes('/memory/')) process.exit(0);

    // symlink → 실제 경로
    let realPath;
    try { realPath = fs.realpathSync(filePath); } catch { process.exit(0); }

    const memDir = path.dirname(realPath);
    if (path.basename(memDir) !== 'memory') process.exit(0);

    const repoRoot = path.dirname(memDir);

    const check = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--git-dir'], { stdio: 'pipe' });
    if (check.status !== 0) process.exit(0);

    spawnSync('git', ['-C', repoRoot, 'add', 'memory/'], { stdio: 'pipe' });

    const status = spawnSync('git', ['-C', repoRoot, 'status', '--porcelain', 'memory/'], {
      encoding: 'utf8', stdio: 'pipe',
    });
    if (!status.stdout?.trim()) process.exit(0);

    const fileName = path.basename(filePath);
    // memory/ 경로만 커밋 (staged 다른 파일에 영향 없음)
    spawnSync('git', ['-C', repoRoot, 'commit', '-m', `[memory] sync: ${fileName}`, '--', 'memory/'], { stdio: 'pipe' });
  } catch {
    // Claude 작업 절대 차단 금지
  }
  process.exit(0);
});
