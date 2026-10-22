// 테스트 전용 링크 헬퍼 — 윈도우는 개발자 모드·관리자가 아니면 심볼릭 링크를 만들 수 없다(EPERM, 2026-10-20 윈도우 PC 실측)
//   폴더 링크 → 윈도우는 junction(권한 불필요, 실제 공격자도 만들 수 있는 링크라 같은 시험이 된다)
//   파일 링크 → 시도하고 EPERM 이면 null — 호출한 테스트가 "건너뜀" 으로 표시한다 (그 PC 에선 공격자도 못 만드는 링크)
'use strict';
const fs = require('fs');

const IS_WIN = process.platform === 'win32';

// 폴더 링크 — 성공하면 종류('symlink'|'junction'), 실패하면 오류를 던진다
function linkDir(target, linkPath) {
  if (IS_WIN) { fs.symlinkSync(target, linkPath, 'junction'); return 'junction'; }
  fs.symlinkSync(target, linkPath, 'dir');
  return 'symlink';
}

// 파일(또는 종류 모를) 심볼릭 링크 — 윈도우 권한 부족이면 null, 그 밖의 오류는 던진다
function trySymlink(target, linkPath, type) {
  try {
    fs.symlinkSync(target, linkPath, type);
    return true;
  } catch (e) {
    if (IS_WIN && (e.code === 'EPERM' || e.code === 'EACCES')) return null;
    throw e;
  }
}

// 윈도우 파일명에 쓸 수 없는 글자(" < > | ? * :) — 그런 이름을 만드는 테스트는 윈도우에서 건너뛴다
const WIN_BAD_NAME = /["<>|?*]|:(?!\\)/;
function nameAllowed(name) { return !IS_WIN || !WIN_BAD_NAME.test(name); }

module.exports = { IS_WIN, linkDir, trySymlink, nameAllowed };
