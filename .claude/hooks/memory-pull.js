'use strict';
// SessionStart: symlink 자동 설정 + 원격 최신 memory pull
// setup-memory-link.sh 없이 clone 직후 바로 동작
const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectDir = process.env.CLAUDE_PROJECT_DIR;
if (!projectDir) process.exit(0);

const repoMemory = path.join(projectDir, 'memory');

// Claude 인코딩: / 와 _ 를 모두 - 로 치환
const encoded = projectDir.replace(/[/\_]/g, '-');
const claudeMemory = path.join(os.homedir(), '.claude', 'projects', encoded, 'memory');

// ── 1단계: symlink 자동 설정 ──────────────────────────────────────
(function setupSymlink() {
  try {
    // repo/memory/ 없으면 생성 (fresh clone 대비)
    if (!fs.existsSync(repoMemory)) {
      fs.mkdirSync(repoMemory, { recursive: true });
    }

    let stat;
    try {
      stat = fs.lstatSync(claudeMemory);
    } catch {
      // 아직 없음 → 부모 디렉토리 생성 후 symlink
      fs.mkdirSync(path.dirname(claudeMemory), { recursive: true });
      fs.symlinkSync(repoMemory, claudeMemory);
      return;
    }

    if (stat.isSymbolicLink()) {
      // 이미 symlink → 올바른 대상인지 확인
      if (path.resolve(fs.readlinkSync(claudeMemory)) === path.resolve(repoMemory)) return;
      // 잘못된 대상 → 교체
      fs.unlinkSync(claudeMemory);
      fs.symlinkSync(repoMemory, claudeMemory);
      return;
    }

    if (stat.isDirectory()) {
      // 기존 로컬 디렉토리 → repo로 병합 후 symlink 교체
      try {
        for (const file of fs.readdirSync(claudeMemory)) {
          const dst = path.join(repoMemory, file);
          if (!fs.existsSync(dst)) {
            fs.copyFileSync(path.join(claudeMemory, file), dst);
          }
        }
      } catch {}
      fs.rmSync(claudeMemory, { recursive: true, force: true });
      fs.symlinkSync(repoMemory, claudeMemory);
    }
  } catch {
    // 세션 시작 절대 차단 금지
  }
})();

// ── 2단계: 원격 최신 memory pull ─────────────────────────────────
const localDirty = spawnSync('git', ['-C', projectDir, 'status', '--porcelain', 'memory/'], {
  encoding: 'utf8', stdio: 'pipe',
});
if (localDirty.stdout?.trim()) process.exit(0);

spawnSync('git', ['-C', projectDir, 'fetch', 'origin'], { stdio: 'pipe', timeout: 10000 });

const behind = spawnSync(
  'git', ['-C', projectDir, 'log', '--oneline', 'HEAD..origin/main', '--', 'memory/'],
  { encoding: 'utf8', stdio: 'pipe' }
);
if (!behind.stdout?.trim()) process.exit(0);

spawnSync('git', ['-C', projectDir, 'checkout', 'origin/main', '--', 'memory/'], { stdio: 'pipe' });

const afterStatus = spawnSync('git', ['-C', projectDir, 'status', '--porcelain', 'memory/'], {
  encoding: 'utf8', stdio: 'pipe',
});
if (afterStatus.stdout?.trim()) {
  spawnSync('git', ['-C', projectDir, 'commit', '-m', '[memory] pull: sync from remote'], { stdio: 'pipe' });
}

process.exit(0);
