'use strict';
// PostToolUse (Write|Edit): memory 파일 변경 감지 → 즉시 git commit + push
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
    spawnSync('git', ['-C', repoRoot, 'commit', '-m', `[memory] sync: ${fileName}`], { stdio: 'pipe' });

    const push = spawnSync('git', ['-C', repoRoot, 'push'], { encoding: 'utf8', stdio: 'pipe', timeout: 15000 });
    if (push.status !== 0) {
      process.stdout.write(
        `[memory-sync] ⚠️  push 실패 — 나중에 수동으로 git push하세요.\n${push.stderr || ''}\n`
      );
    }
  } catch {
    // Claude 작업 절대 차단 금지
  }
  process.exit(0);
});
