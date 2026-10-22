// 윈도우 파일·실행 헬퍼 (계획서 2026-10-20-windows-support 3.1·3.3 — 2026-10-20 윈도우 PC 실측 기준)
//   링크   : 폴더 → junction(권한 불필요), 파일 → 하드링크 → 안 되면 복사. 심볼릭 링크는 개발자 모드·관리자만 돼서 쓰지 않는다
//   쓰기   : 열려 있는 파일 위로 rename 하면 EPERM(백신·다른 세션) → 짧게 재시도
//   실행   : npm 설치는 `claude`(sh 스크립트)·`claude.cmd`·`claude.ps1` 을 같이 깐다. 확장자 없는 것은 spawn ENOENT,
//            .cmd 는 셸 없이 spawn 하면 EINVAL — .cmd 가 부르는 실제 .exe 를 찾아 직접 실행한다
//   realpath: JS realpathSync 는 입력 대소문자를 그대로 둔다(c:\… 와 C:\… 가 다른 문자열) → 윈도우는 .native 로 실제 표기
// 맥·리눅스에서는 기존 동작 그대로(심볼릭 링크·rename 한 번·PATH 그대로)
'use strict';
const fs = require('fs');
const path = require('path');

const IS_WIN = process.platform === 'win32';

function realpath(p, win = IS_WIN) { return win ? fs.realpathSync.native(p) : fs.realpathSync(p); }
function realOrNull(p, win = IS_WIN) { try { return realpath(p, win); } catch { return null; } }

const toSlash = (p) => String(p).replace(/\\/g, '/');
// \\?\C:\x 같은 긴 경로 접두를 떼어 비교한다 (junction readlink 가 붙여 줄 때가 있음)
const stripLong = (p) => String(p).replace(/^\\\\\?\\(?!UNC\\)/, '');

// 같은 경로인가 — 윈도우는 대소문자·구분자 무시
function samePath(a, b, win = IS_WIN) {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || !b) return false;
  if (!win) return path.resolve(a) === path.resolve(b);
  const n = (p) => toSlash(path.win32.resolve(stripLong(p))).replace(/\/+$/, '').toLowerCase();
  return n(a) === n(b);
}

// MSYS 경로(/c/Users/x) → C:\Users\x — Git Bash 에서 넘어온 환경변수 대비. 윈도우만
function fromMsys(p, win = IS_WIN) {
  if (!win || typeof p !== 'string') return p;
  const m = /^\/([a-zA-Z])(?:\/(.*))?$/.exec(p);
  return m ? `${m[1].toUpperCase()}:\\${(m[2] || '').replace(/\//g, '\\')}` : p;
}

function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch { /* 지원 안 함 */ } }
const RETRY_CODES = new Set(['EPERM', 'EBUSY', 'EACCES']);

// rename 재시도 — 윈도우에서 대상이 잠시 열려 있으면 EPERM/EBUSY/EACCES. 맥은 한 번
function renameRetry(from, to, { win = IS_WIN, tries = 6, rename = fs.renameSync } = {}) {
  for (let i = 0; ; i++) {
    try { return rename(from, to); } catch (e) {
      if (!win || !RETRY_CODES.has(e.code) || i >= tries - 1) throw e;
      sleepMs(25 * (i + 1));
    }
  }
}

// 임시 파일에 쓰고 바꿔 넣기. 실패하면 임시 파일을 지운다
function atomicWrite(file, content, { mode, win = IS_WIN } = {}) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now().toString(36)}.tmp`;
  try {
    fs.writeFileSync(tmp, content, mode ? { mode } : undefined);
    if (mode && !win) fs.chmodSync(tmp, mode);
    renameRetry(tmp, file, { win });
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch { /* 없음 */ }
    throw e;
  }
}

// ── 링크 ──────────────────────────────────────────────────────────────
// 만든 방식: 'symlink' | 'junction' | 'hard' | 'copy'
function makeLink(target, linkPath, { win = IS_WIN, isDir } = {}) {
  const dir = isDir === undefined ? fs.statSync(target).isDirectory() : isDir;
  if (!win) { fs.symlinkSync(target, linkPath); return 'symlink'; }
  if (dir) { fs.symlinkSync(target, linkPath, 'junction'); return 'junction'; }
  try { fs.linkSync(target, linkPath); return 'hard'; } catch (e) {
    if (!['EXDEV', 'EPERM', 'EACCES', 'ENOTSUP', 'EMLINK'].includes(e.code)) throw e;
  }
  fs.copyFileSync(target, linkPath);
  return 'copy';
}

// 링크(심볼릭·junction)가 target 을 가리키는가
function linkPointsTo(linkPath, target, win = IS_WIN) {
  let cur;
  try { cur = fs.readlinkSync(linkPath); } catch { return false; }
  if (!win) return cur === target;
  return samePath(path.win32.resolve(path.dirname(linkPath), stripLong(cur)), target, true);
}

// 같은 파일(하드링크)인가 — 장치·inode 번호 비교 (bigint: 윈도우 파일 번호는 2^53 을 넘을 수 있다)
function sameFile(a, b) {
  try {
    const x = fs.statSync(a, { bigint: true }), y = fs.statSync(b, { bigint: true });
    return x.ino !== 0n && x.ino === y.ino && x.dev === y.dev;
  } catch { return false; }
}
function sameContent(a, b) {
  try { return fs.readFileSync(a).equals(fs.readFileSync(b)); } catch { return false; }
}
// 원본과의 관계 — 'same'(하드링크·같은 내용) | 'differs'(사용자가 고침·원본이 바뀜) | 'unknown'(읽지 못함 — 잠김 등, 다음에 다시)
function compareToOrigin(p, orig, win = IS_WIN) {
  if (sameFile(p, orig)) return 'same';
  for (let i = 0; ; i++) {
    try { return fs.readFileSync(p).equals(fs.readFileSync(orig)) ? 'same' : 'differs'; } catch (e) {
      if (e.code === 'ENOENT') return 'differs';
      if (!win || !RETRY_CODES.has(e.code) || i >= 4) return 'unknown';
      sleepMs(40 * (i + 1));
    }
  }
}

// 파일 지우기 재시도 — 윈도우는 다른 프로세스(다른 세션의 claude·백신)가 같은 파일(하드링크 원본)을 열고 있으면
// 이름을 지우는 것도 잠시 실패한다(EPERM·EBUSY). 끝내 실패하면 false (호출한 쪽이 다음 조립에서 다시)
function unlinkRetry(p, { win = IS_WIN, tries = 6, unlink = fs.unlinkSync } = {}) {
  for (let i = 0; ; i++) {
    try { unlink(p); return true; } catch (e) {
      if (e.code === 'ENOENT') return true;
      if (!win || !RETRY_CODES.has(e.code)) throw e;
      if (i >= tries - 1) return false;
      sleepMs(50 * (i + 1));
    }
  }
}

// 링크 지우기 — junction 은 unlink 가 EPERM 이면 rmdir(링크만 지우고 대상은 그대로). 절대 재귀 삭제하지 않는다
function removeLink(p) {
  try { fs.unlinkSync(p); } catch (e) {
    if (!['EPERM', 'EISDIR', 'EACCES'].includes(e.code)) throw e;
    fs.rmdirSync(p);
  }
}

// ── 실행 파일 ──────────────────────────────────────────────────────────
// PATH 에서 name 찾기 — 윈도우는 PATHEXT 확장자가 붙은 일반 파일만(확장자 없는 sh 스크립트는 spawn 불가)
//   fsys: 시험용 파일 시스템(statSync·accessSync·readFileSync) — 맥에서도 윈도우 경로(C:\…)로 판정 로직을 본다 (2026-10-22)
function findExecutable(name, { env = process.env, win = IS_WIN, fsys = fs } = {}) {
  const pathVar = env.PATH || env.Path || '';
  const dirs = pathVar.split(win ? ';' : path.delimiter).filter(Boolean);
  const exts = win ? (env.PATHEXT || '.COM;.EXE;.BAT;.CMD').split(';').filter(Boolean).map(e => e.toLowerCase()) : [''];
  const hasExt = win && exts.includes(path.extname(name).toLowerCase());
  for (const d of dirs) {
    for (const ext of hasExt ? [''] : exts) {
      const p = (win ? path.win32 : path).join(d.replace(/^"(.*)"$/, '$1'), name + ext);
      try {
        const st = fsys.statSync(p);
        if (!st.isFile()) continue;
        if (!win) { fsys.accessSync(p, fs.constants.X_OK); }
        return p;
      } catch { /* 없음·실행 불가 */ }
    }
  }
  return null;
}

// npm 이 만든 .cmd 껍데기에서 실제 .exe — `"%dp0%\node_modules\…\claude.exe"   %*` 형식만 인정 (그 밖이면 null)
function exeFromCmdShim(cmdPath, { fsys = fs } = {}) {
  let text;
  try { text = fsys.readFileSync(cmdPath, 'utf8'); } catch { return null; }
  const m = /"%(?:dp0|~dp0)%?\\([^"%<>|&^]+?\.exe)"/i.exec(text);
  if (!m) return null;
  const exe = path.win32.resolve(path.win32.dirname(cmdPath), m[1]);
  if (!samePath(exe, path.win32.dirname(cmdPath), true) && !exe.toLowerCase().startsWith(path.win32.dirname(cmdPath).toLowerCase() + '\\')) return null; // 껍데기 폴더 밖이면 거부
  try { return fsys.statSync(exe).isFile() ? exe : null; } catch { return null; }
}

// claude 실행 파일 — { file, viaShell }. 윈도우: claude.exe 우선, .cmd 면 그 안의 .exe, 그래도 없으면 .cmd 를 셸로
function resolveClaude({ env = process.env, win = IS_WIN, fsys = fs } = {}) {
  if (!win) { const p = findExecutable('claude', { env, win, fsys }); return p ? { file: p, viaShell: false } : null; }
  const p = findExecutable('claude', { env, win, fsys });
  if (!p) return null;
  if (/\.exe$/i.test(p)) return { file: p, viaShell: false };
  if (/\.(cmd|bat)$/i.test(p)) {
    const exe = exeFromCmdShim(p, { fsys });
    return exe ? { file: exe, viaShell: false } : { file: p, viaShell: true };
  }
  return { file: p, viaShell: true };
}

module.exports = {
  IS_WIN, realpath, realOrNull, samePath, fromMsys, stripLong,
  renameRetry, atomicWrite,
  makeLink, linkPointsTo, sameFile, sameContent, compareToOrigin, unlinkRetry, removeLink,
  findExecutable, exeFromCmdShim, resolveClaude,
};
