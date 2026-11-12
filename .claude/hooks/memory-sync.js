'use strict';
// PostToolUse (Write|Edit): memory 파일 변경 감지 → 전역↔레포 미러 복사 (git 커밋 없음)
//
// 저장 구조 (memory 공유 = Y 프로젝트):
//   1차 저장소: ~/.claude/projects/<인코딩된-경로>/memory  ← Claude 전역 메모리 (항상 저장, 영숫자 외 문자 → '-')
//   2차 미러:   <레포>/memory/                              ← 워킹트리 복사만, 커밋·푸시는 사용자가 직접
// 어느 쪽 파일이 수정되든 반대쪽으로 복사해 양쪽을 같은 내용으로 유지한다.
// (N 프로젝트는 이 훅이 설치되지 않으므로 전역 메모리에만 저장되는 기본 동작)
const os = require('os');
const fs = require('fs');
const path = require('path');

const norm = (p) => {
  try { return fs.realpathSync(p); } catch { return path.resolve(p); }
};

// 윈도우(2026-10-20 실측): file_path 가 `C:\repo\memory\x.md` — `/memory/` 문자열 검사에 안 걸려 미러가 통째로 꺼져 있었다.
// 윈도우 분기에서만 lib/winpath 를 로드한다(맥·리눅스는 기존 판정 그대로).
const IS_WIN = process.platform === 'win32';
const winpath = () => require('./lib/winpath');
// 문자열 게이트: 윈도우는 `\` → `/`·소문자(NTFS 대소문자 무시)로 바꾼 뒤 본다
const looksLikeMemory = (p) => (IS_WIN ? winpath().toSlash(p, true).toLowerCase() : p).includes('/memory/');
// 폴더 비교: 윈도우는 드라이브·폴더 대소문자와 구분자를 가리지 않는다
const same = (a, b) => (IS_WIN ? winpath().samePath(a, b, true) : a === b);

let input = '';
process.stdin.on('data', d => (input += d));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const rawPath = data?.tool_input?.file_path || '';
    // Git Bash MSYS 표기(`/c/…`)가 오면 드라이브 표기로 — path.resolve 가 `C:\c\…` 로 잘못 붙이지 않게
    const filePath = IS_WIN && typeof rawPath === 'string' ? winpath().msysToWin(rawPath, true) : rawPath;
    if (!looksLikeMemory(filePath)) process.exit(0);

    const projectDir = process.env.CLAUDE_PROJECT_DIR;
    if (!projectDir) process.exit(0);

    const repoMemory = norm(path.join(projectDir, 'memory'));
    // 전역 저장소: transcript_path 디렉토리(실제 저장소) 우선, 없으면 Claude Code 인코딩 규칙
    // (session-export.js 공통 함수 — 2026-09-26 실측 규칙으로 통일, projects 밖 transcript_path 는 무시)
    const { projectStoreDir } = require('./session-export.js');
    const storeDir = projectStoreDir(os.homedir(), projectDir, data?.transcript_path);
    if (!storeDir) process.exit(0);
    const globalMemory = norm(path.join(storeDir, 'memory'));

    const written = norm(filePath);
    if (!fs.existsSync(written)) process.exit(0);
    const dir = path.dirname(written);

    // 수정된 쪽 판별 → 반대쪽으로 복사
    let dstDir = null;
    if (same(dir, globalMemory)) dstDir = repoMemory;
    else if (same(dir, repoMemory)) dstDir = globalMemory;
    if (!dstDir || same(dstDir, dir)) process.exit(0);

    // N 프로젝트 방어: 레포 memory/ 가 애초에 없으면(= Y 프로젝트로 설정된 적 없음)
    // 이 훅이 잘못 실행되더라도 레포에 memory/ 를 새로 만들지 않는다
    if (same(dstDir, repoMemory) && !fs.existsSync(repoMemory)) process.exit(0);

    fs.mkdirSync(dstDir, { recursive: true });
    // 원자적 복사(2026-11-11): 임시 파일에 다 쓴 뒤 이름만 바꾼다. 중단된 호출의 PostToolUse 는 10초 뒤 강제 종료되므로(2.1.319)
    // 복사 도중 죽어도 반쪽 파일이 남지 않게 — 반쪽 파일의 mtime 이 더 최신이면 memory-pull 이 그것으로 원본을 덮을 수 있었다
    const dst = path.join(dstDir, path.basename(written));
    const tmp = path.join(dstDir, `.${path.basename(written)}.${process.pid}.tmp`);
    try {
      fs.copyFileSync(written, tmp);
      fs.renameSync(tmp, dst);
    } catch (e) {
      try { fs.rmSync(tmp, { force: true }); } catch { /* 정리 실패는 무시 */ }
      throw e;
    }
  } catch {
    // Claude 작업 절대 차단 금지
  }
  process.exit(0);
});
