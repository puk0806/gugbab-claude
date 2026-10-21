// 윈도우 경로 공용 헬퍼 — 훅이 받는 경로는 윈도우에서 세 가지 모양으로 온다 (2026-10-20 윈도우 PC 실측)
//   ① 네이티브 `C:\Users\x\a.js` (Write/Edit 의 file_path, cwd, transcript_path)
//   ② 슬래시 `C:/Users/x/a.js` (CLAUDE_PROJECT_DIR, Git Bash 명령 안 경로)
//   ③ MSYS `/c/Users/x/a.js` (Git Bash 명령 안 경로, $HOME 확장 결과)
// 맥·리눅스에서는 모든 함수가 입력을 그대로(또는 POSIX 규칙으로) 다룬다 — `/c/…` 는 맥에서 진짜 경로라 바꾸지 않는다
'use strict';
const path = require('path');

const IS_WIN = process.platform === 'win32';

// `\` → `/` (윈도우만). 정규식·`includes('/memory/')` 같은 슬래시 기준 판정 앞에 쓴다
function toSlash(p, win = IS_WIN) {
  if (typeof p !== 'string') return '';
  return win ? p.replace(/\\/g, '/') : p;
}

// `/c/Users/x` → `C:/Users/x` (윈도우만, 드라이브 한 글자). `/tmp`·`/usr` 같은 다른 MSYS 경로는 그대로
function msysToWin(p, win = IS_WIN) {
  if (typeof p !== 'string') return '';
  if (!win) return p;
  const m = /^\/([a-zA-Z])(\/|$)(.*)$/.exec(p);
  return m ? `${m[1].toUpperCase()}:/${m[3]}` : p;
}

// 비교용 정규화 — 윈도우: MSYS → 드라이브, 슬래시 통일, 소문자(NTFS 기본 대소문자 무시), 끝 슬래시 제거
function normPath(p, win = IS_WIN) {
  if (typeof p !== 'string' || !p) return '';
  if (!win) return p.length > 1 ? p.replace(/\/+$/, '') : p;
  let s = toSlash(msysToWin(toSlash(p, true), true), true);
  if (/^[a-zA-Z]:$/.test(s)) s += '/';
  s = s.toLowerCase();
  return s.length > 3 ? s.replace(/\/+$/, '') : s;
}

// 절대 경로인가 — 윈도우는 `C:\`·`C:/`·`/c/`·UNC(`\\server`) 도 절대
function isAbs(p, win = IS_WIN) {
  if (typeof p !== 'string' || !p) return false;
  if (!win) return p.startsWith('/');
  return /^[a-zA-Z]:[\\/]/.test(p) || /^[\\/]{2}[^\\/]/.test(p) || /^\/[a-zA-Z](\/|$)/.test(p) || path.win32.isAbsolute(p);
}

// child 가 parent 와 같거나 그 아래인가 — 문자열 접두가 아니라 경로 단위로 (`/a/bc` 는 `/a/b` 아래가 아님)
function isUnder(child, parent, win = IS_WIN) {
  const c = normPath(child, win);
  const p = normPath(parent, win);
  if (!c || !p) return false;
  if (c === p) return true;
  const base = p.endsWith('/') ? p : p + '/';
  return c.startsWith(base);
}

function samePath(a, b, win = IS_WIN) {
  const x = normPath(a, win);
  return !!x && x === normPath(b, win);
}

module.exports = { IS_WIN, toSlash, msysToWin, normPath, isAbs, isUnder, samePath };
