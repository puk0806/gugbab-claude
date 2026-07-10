'use strict';
// PostToolUse (Write|Edit): memory 파일 변경 감지 → 전역↔레포 미러 복사 (git 커밋 없음)
//
// 저장 구조 (memory 공유 = Y 프로젝트):
//   1차 저장소: ~/.claude/projects/<인코딩된-경로>/memory  ← Claude 전역 메모리 (항상 저장)
//   2차 미러:   <레포>/memory/                              ← 워킹트리 복사만, 커밋·푸시는 사용자가 직접
// 어느 쪽 파일이 수정되든 반대쪽으로 복사해 양쪽을 같은 내용으로 유지한다.
// (N 프로젝트는 이 훅이 설치되지 않으므로 전역 메모리에만 저장되는 기본 동작)
const os = require('os');
const fs = require('fs');
const path = require('path');

const norm = (p) => {
  try { return fs.realpathSync(p); } catch { return path.resolve(p); }
};

let input = '';
process.stdin.on('data', d => (input += d));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data?.tool_input?.file_path || '';
    if (!filePath.includes('/memory/')) process.exit(0);

    const projectDir = process.env.CLAUDE_PROJECT_DIR;
    if (!projectDir) process.exit(0);

    const repoMemory = norm(path.join(projectDir, 'memory'));
    // Claude 인코딩: / 와 _ 를 모두 - 로 치환
    const encoded = projectDir.replace(/[/\_]/g, '-');
    const globalMemory = norm(path.join(os.homedir(), '.claude', 'projects', encoded, 'memory'));

    const written = norm(filePath);
    if (!fs.existsSync(written)) process.exit(0);
    const dir = path.dirname(written);

    // 수정된 쪽 판별 → 반대쪽으로 복사
    let dstDir = null;
    if (dir === globalMemory) dstDir = repoMemory;
    else if (dir === repoMemory) dstDir = globalMemory;
    if (!dstDir || dstDir === dir) process.exit(0);

    fs.mkdirSync(dstDir, { recursive: true });
    fs.copyFileSync(written, path.join(dstDir, path.basename(written)));
  } catch {
    // Claude 작업 절대 차단 금지
  }
  process.exit(0);
});
