'use strict';
// SessionStart: 전역 memory 디렉토리 보장 + 레포 → 전역 반영 (git 조작 없음)
//
// 1) 과거 symlink 구조(전역 → 레포)를 발견하면 실제 디렉토리로 마이그레이션
// 2) 레포 memory/ 파일이 전역에 없거나 내용이 다르면서 더 최신이면 전역으로 복사
//    (다른 데스크탑에서 push한 내용을 git pull 받은 뒤 세션을 시작하면 전역에 반영됨)
// 커밋·푸시·pull은 전부 사용자가 직접 수행한다.
const os = require('os');
const fs = require('fs');
const path = require('path');

const projectDir = process.env.CLAUDE_PROJECT_DIR;
if (!projectDir) process.exit(0);

const repoMemory = path.join(projectDir, 'memory');
// Claude 인코딩: / 와 _ 를 모두 - 로 치환
const encoded = projectDir.replace(/[/\_]/g, '-');
const globalMemory = path.join(os.homedir(), '.claude', 'projects', encoded, 'memory');

try {
  // ── 1단계: 전역 memory를 실제 디렉토리로 보장 (symlink 마이그레이션) ──
  let stat = null;
  try { stat = fs.lstatSync(globalMemory); } catch {}

  if (stat && stat.isSymbolicLink()) {
    fs.unlinkSync(globalMemory);
    stat = null;
  }
  if (!stat) fs.mkdirSync(globalMemory, { recursive: true });

  // ── 2단계: 레포 memory/ → 전역 반영 ──
  if (fs.existsSync(repoMemory)) {
    for (const name of fs.readdirSync(repoMemory)) {
      const src = path.join(repoMemory, name);
      const dst = path.join(globalMemory, name);
      if (!fs.statSync(src).isFile()) continue;

      let copy = false;
      if (!fs.existsSync(dst)) {
        copy = true; // 전역에 없음 (fresh clone / 새 파일)
      } else {
        const differs = fs.readFileSync(src, 'utf8') !== fs.readFileSync(dst, 'utf8');
        // 내용이 다르고 레포 쪽이 최신이면 (git pull 직후) 전역 갱신
        copy = differs && fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs;
      }
      if (copy) fs.copyFileSync(src, dst);
    }
  }
} catch {
  // 세션 시작 절대 차단 금지
}
process.exit(0);
