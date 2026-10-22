// winfs.js — 윈도우 링크·쓰기·실행 파일 찾기
// 정상 / 악성·우회 / 경계 3계층. 플랫폼 인자(win)를 넘겨 맥·윈도우 어디서나 판정 로직을 본다.
// 실행 파일 찾기는 윈도우 경로로 된 가짜 fs(fakeWinFs)로 — 맥에서 윈도우 경로를 진짜 fs 로 찾으면 언제나 없음이라 시험이 안 된다
// 실제 링크를 만드는 시험은 지금 플랫폼 방식으로(윈도우 junction·하드링크, 맥 심볼릭 링크)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const w = require('./winfs');

const tmp = (p) => fs.mkdtempSync(path.join(os.tmpdir(), p));

test('정상: 폴더 링크 — 윈도우 junction·맥 심볼릭, 링크로 읽히고 linkPointsTo 가 참', () => {
  const d = tmp('wf-');
  try {
    const src = path.join(d, 'src'); fs.mkdirSync(src); fs.writeFileSync(path.join(src, 'SKILL.md'), 'x');
    const kind = w.makeLink(src, path.join(d, 'ln'));
    assert.strictEqual(kind, w.IS_WIN ? 'junction' : 'symlink');
    assert.strictEqual(fs.readFileSync(path.join(d, 'ln', 'SKILL.md'), 'utf8'), 'x');
    assert.ok(w.linkPointsTo(path.join(d, 'ln'), src));
    w.removeLink(path.join(d, 'ln'));
    assert.ok(!fs.existsSync(path.join(d, 'ln')));
    assert.ok(fs.existsSync(path.join(src, 'SKILL.md')), '링크를 지워도 원본은 그대로');
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('정상: 파일 링크 — 윈도우 하드링크(같은 파일), 맥 심볼릭', () => {
  const d = tmp('wf-');
  try {
    const src = path.join(d, 'a.md'); fs.writeFileSync(src, 'A');
    const kind = w.makeLink(src, path.join(d, 'b.md'));
    if (w.IS_WIN) { assert.ok(kind === 'hard' || kind === 'copy'); if (kind === 'hard') assert.ok(w.sameFile(src, path.join(d, 'b.md'))); }
    else assert.strictEqual(kind, 'symlink');
    assert.strictEqual(fs.readFileSync(path.join(d, 'b.md'), 'utf8'), 'A');
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('정상: atomicWrite 로 쓰고 덮어쓰기, 임시 파일이 남지 않음', () => {
  const d = tmp('wf-');
  try {
    const f = path.join(d, 'x.json');
    w.atomicWrite(f, '1'); w.atomicWrite(f, '2');
    assert.strictEqual(fs.readFileSync(f, 'utf8'), '2');
    assert.deepStrictEqual(fs.readdirSync(d), ['x.json']);
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('정상: samePath — 윈도우는 대소문자·구분자 무시, 맥은 구분', () => {
  assert.ok(w.samePath('C:\\Users\\X', 'c:/users/x/', true));
  assert.ok(w.samePath('\\\\?\\C:\\a', 'C:\\a', true));
  assert.ok(!w.samePath('/a/B', '/a/b', false));
  assert.ok(w.samePath('/a/b/', '/a/b', false));
});

test('정상: fromMsys — 윈도우만 /c/x → C:\\x', () => {
  assert.strictEqual(w.fromMsys('/c/Users/x', true), 'C:\\Users\\x');
  assert.strictEqual(w.fromMsys('/d', true), 'D:\\');
  assert.strictEqual(w.fromMsys('/c/Users/x', false), '/c/Users/x');
  assert.strictEqual(w.fromMsys('C:\\a', true), 'C:\\a');
});

// 윈도우 경로(C:\…)로 된 가짜 파일 시스템 — 맥에서도 PATHEXT·.cmd 껍데기 판정을 실제 윈도우 경로 모양으로 본다 (2026-10-22)
//   예전에는 맥 임시 폴더를 path.win32 로 이어 붙인 `\var\folders\…` 를 진짜 fs 로 찾다가 맥에서 실패했다. 대소문자 무시는 NTFS 와 같게
function fakeWinFs(tree) {
  const key = (p) => path.win32.resolve(p).toLowerCase();
  const files = new Map(), dirs = new Set();
  for (const [p, v] of Object.entries(tree)) {
    if (v === null) dirs.add(key(p)); else files.set(key(p), v);
    for (let d = path.win32.dirname(p); d !== path.win32.dirname(d); d = path.win32.dirname(d)) dirs.add(key(d));
  }
  const nf = (p) => Object.assign(new Error(`ENOENT: ${p}`), { code: 'ENOENT' });
  return {
    statSync(p) {
      const k = key(p);
      if (files.has(k)) return { isFile: () => true, isDirectory: () => false };
      if (dirs.has(k)) return { isFile: () => false, isDirectory: () => true };
      throw nf(p);
    },
    readFileSync(p) { const k = key(p); if (!files.has(k)) throw nf(p); return files.get(k); },
    accessSync() { /* 윈도우는 실행 권한 비트가 없다 */ },
  };
}
const NPM_SHIM = '@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n"%dp0%\\node_modules\\@anthropic-ai\\claude-code\\bin\\claude.exe"   %*\r\n';

test('정상: findExecutable — 윈도우는 PATHEXT 확장자 있는 것만, 확장자 없는 sh 스크립트는 건너뜀', () => {
  const env = { PATH: 'C:\\tools', PATHEXT: '.COM;.EXE;.BAT;.CMD' };
  let fsys = fakeWinFs({ 'C:\\tools\\tool': '#!/bin/sh\n', 'C:\\tools\\tool.cmd': '@echo off\n' });
  assert.strictEqual(w.findExecutable('tool', { env, win: true, fsys }), 'C:\\tools\\tool.cmd');
  // .exe 가 PATHEXT 순서상 .cmd 보다 앞
  fsys = fakeWinFs({ 'C:\\tools\\tool': '', 'C:\\tools\\tool.cmd': '', 'C:\\tools\\tool.exe': '' });
  assert.strictEqual(w.findExecutable('tool', { env, win: true, fsys }), 'C:\\tools\\tool.exe');
  // 확장자 없는 것만 있으면 못 찾음 (spawn 할 수 없는 sh 스크립트)
  fsys = fakeWinFs({ 'C:\\tools\\tool': '#!/bin/sh\n' });
  assert.strictEqual(w.findExecutable('tool', { env, win: true, fsys }), null);
  // PATH 앞 폴더가 이김, 따옴표로 감싼 폴더도 읽음, 이름에 확장자를 붙이면 그대로
  fsys = fakeWinFs({ 'C:\\a b\\tool.cmd': '', 'D:\\z\\tool.exe': '' });
  assert.strictEqual(w.findExecutable('tool', { env: { PATH: '"C:\\a b";D:\\z', PATHEXT: '.EXE;.CMD' }, win: true, fsys }), 'C:\\a b\\tool.cmd');
  assert.strictEqual(w.findExecutable('tool.exe', { env: { PATH: 'C:\\a b;D:\\z', PATHEXT: '.EXE;.CMD' }, win: true, fsys }), 'D:\\z\\tool.exe');
});

test('정상: npm .cmd 껍데기 → 그 안의 claude.exe 를 직접 실행 대상으로', () => {
  const npm = 'C:\\Users\\x\\AppData\\Roaming\\npm';
  const exe = `${npm}\\node_modules\\@anthropic-ai\\claude-code\\bin\\claude.exe`;
  const fsys = fakeWinFs({ [exe]: '', [`${npm}\\claude`]: '#!/bin/sh\n', [`${npm}\\claude.cmd`]: NPM_SHIM });
  assert.deepStrictEqual(w.resolveClaude({ env: { PATH: npm, PATHEXT: '.EXE;.CMD' }, win: true, fsys }), { file: exe, viaShell: false });
  // 껍데기는 있는데 그 안의 exe 가 없으면 .cmd 를 셸로
  const noExe = fakeWinFs({ [`${npm}\\claude.cmd`]: NPM_SHIM });
  assert.deepStrictEqual(w.resolveClaude({ env: { PATH: npm, PATHEXT: '.EXE;.CMD' }, win: true, fsys: noExe }), { file: `${npm}\\claude.cmd`, viaShell: true });
  // claude.exe 가 PATH 에 바로 있으면 그것
  const direct = fakeWinFs({ 'C:\\bin\\claude.exe': '' });
  assert.deepStrictEqual(w.resolveClaude({ env: { PATH: 'C:\\bin', PATHEXT: '.EXE;.CMD' }, win: true, fsys: direct }), { file: 'C:\\bin\\claude.exe', viaShell: false });
});

test('악성: .cmd 껍데기가 폴더 밖(..)의 exe 를 가리키면 따르지 않고 셸 실행으로 둠', () => {
  const fsys = fakeWinFs({ 'C:\\p\\evil.exe': '', 'C:\\p\\bin\\claude.cmd': '"%dp0%\\..\\evil.exe" %*\r\n' });
  assert.strictEqual(w.exeFromCmdShim('C:\\p\\bin\\claude.cmd', { fsys }), null);
  assert.deepStrictEqual(w.resolveClaude({ env: { PATH: 'C:\\p\\bin', PATHEXT: '.CMD' }, win: true, fsys }), { file: 'C:\\p\\bin\\claude.cmd', viaShell: true });
  // 접두만 같은 형제 폴더(bin-evil)도 밖
  const sib = fakeWinFs({ 'C:\\p\\bin-evil\\x.exe': '', 'C:\\p\\bin\\claude.cmd': '"%dp0%\\..\\bin-evil\\x.exe" %*\r\n' });
  assert.strictEqual(w.exeFromCmdShim('C:\\p\\bin\\claude.cmd', { fsys: sib }), null);
  // 정해진 형식이 아닌 껍데기(다른 명령을 섞음)는 따르지 않음
  const odd = fakeWinFs({ 'C:\\p\\bin\\a.exe': '', 'C:\\p\\bin\\claude.cmd': 'calc.exe & "%dp0%\\a.exe|x" %*\r\n' });
  assert.strictEqual(w.exeFromCmdShim('C:\\p\\bin\\claude.cmd', { fsys: odd }), null);
});

test('악성: PATH 에 같은 이름 폴더만 있으면 실행 파일 아님', () => {
  const fsys = fakeWinFs({ 'C:\\tools\\claude.exe': null });
  assert.strictEqual(fsys.statSync('C:\\tools\\claude.exe').isDirectory(), true, '가짜 fs 가 폴더로 보고 있어야 시험이 의미 있음');
  assert.strictEqual(w.findExecutable('claude', { env: { PATH: 'C:\\tools', PATHEXT: '.EXE' }, win: true, fsys }), null);
});

// 진짜 파일 시스템으로 한 번 더 — 그 플랫폼 경로 모양에서만 의미가 있다
test('정상(윈도우 실제 fs): PATHEXT·npm 껍데기·같은 이름 폴더', { skip: !w.IS_WIN && '윈도우 실제 파일 시스템 시험 — 판정 로직은 위 가짜 fs 시험이 맥에서도 본다' }, () => {
  const d = tmp('wf-');
  try {
    fs.writeFileSync(path.join(d, 'tool'), '#!/bin/sh\n');
    fs.writeFileSync(path.join(d, 'tool.cmd'), '@echo off\n');
    assert.strictEqual(w.findExecutable('tool', { env: { PATH: d, PATHEXT: '.EXE;.CMD' }, win: true }), path.win32.join(d, 'tool.cmd'));
    const exeDir = path.join(d, 'node_modules', '@anthropic-ai', 'claude-code', 'bin'); fs.mkdirSync(exeDir, { recursive: true });
    fs.writeFileSync(path.join(exeDir, 'claude.exe'), '');
    fs.writeFileSync(path.join(d, 'claude.cmd'), NPM_SHIM);
    assert.deepStrictEqual(w.resolveClaude({ env: { PATH: d, PATHEXT: '.EXE;.CMD' }, win: true }), { file: path.win32.join(exeDir, 'claude.exe'), viaShell: false });
    fs.mkdirSync(path.join(d, 'dir.exe'));
    assert.strictEqual(w.findExecutable('dir', { env: { PATH: d, PATHEXT: '.EXE' }, win: true }), null);
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('정상(맥·리눅스 실제 fs): 실행 권한 있는 파일만, 권한 없는 같은 이름은 건너뜀', { skip: w.IS_WIN && '맥·리눅스 실행 권한 비트 시험' }, () => {
  const a = tmp('wf-'), b = tmp('wf-');
  try {
    fs.writeFileSync(path.join(a, 'claude'), '#!/bin/sh\n', { mode: 0o644 });
    fs.writeFileSync(path.join(b, 'claude'), '#!/bin/sh\n', { mode: 0o755 });
    assert.deepStrictEqual(w.resolveClaude({ env: { PATH: `${a}:${b}` }, win: false }), { file: path.join(b, 'claude'), viaShell: false });
    assert.strictEqual(w.findExecutable('claude', { env: { PATH: a }, win: false }), null);
  } finally { fs.rmSync(a, { recursive: true, force: true }); fs.rmSync(b, { recursive: true, force: true }); }
});

test('악성: 다른 폴더를 가리키는 링크는 linkPointsTo 가 거짓, 접두만 같은 형제도 거짓', () => {
  const d = tmp('wf-');
  try {
    const a = path.join(d, 'proj'); const b = path.join(d, 'proj-evil'); fs.mkdirSync(a); fs.mkdirSync(b);
    w.makeLink(b, path.join(d, 'ln'));
    assert.ok(!w.linkPointsTo(path.join(d, 'ln'), a));
    assert.ok(!w.samePath('C:\\proj', 'C:\\proj-evil', true));
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('악성: junction 을 지워도 대상 폴더 안 파일은 남는다 (재귀 삭제 금지)', () => {
  const d = tmp('wf-');
  try {
    const victim = path.join(d, 'victim'); fs.mkdirSync(victim); fs.writeFileSync(path.join(victim, 'keep.txt'), 'k');
    w.makeLink(victim, path.join(d, 'ln'));
    w.removeLink(path.join(d, 'ln'));
    assert.strictEqual(fs.readFileSync(path.join(victim, 'keep.txt'), 'utf8'), 'k');
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('경계: renameRetry — 윈도우 일시 잠금(EBUSY)은 재시도해 성공, 맥은 한 번에 던짐, 다른 오류는 즉시', () => {
  let n = 0;
  const flaky = () => { n++; if (n < 3) { const e = new Error('busy'); e.code = 'EBUSY'; throw e; } };
  w.renameRetry('a', 'b', { win: true, rename: flaky });
  assert.strictEqual(n, 3);
  n = 0;
  assert.throws(() => w.renameRetry('a', 'b', { win: false, rename: flaky }), /busy/);
  assert.strictEqual(n, 1);
  const enoent = () => { const e = new Error('nope'); e.code = 'ENOENT'; throw e; };
  assert.throws(() => w.renameRetry('a', 'b', { win: true, rename: enoent }), /nope/);
  const always = () => { const e = new Error('locked'); e.code = 'EPERM'; throw e; };
  assert.throws(() => w.renameRetry('a', 'b', { win: true, rename: always, tries: 3 }), /locked/);
});

test('경계: unlinkRetry — 윈도우 잠김(EBUSY)은 재시도, 끝내 실패면 false(던지지 않음), 없는 파일은 성공, 맥·다른 오류는 던짐', () => {
  let n = 0;
  const flaky = () => { n++; if (n < 3) { const e = new Error('busy'); e.code = 'EBUSY'; throw e; } };
  assert.strictEqual(w.unlinkRetry('x', { win: true, unlink: flaky }), true);
  const locked = () => { const e = new Error('locked'); e.code = 'EPERM'; throw e; };
  assert.strictEqual(w.unlinkRetry('x', { win: true, unlink: locked, tries: 2 }), false);
  const gone = () => { const e = new Error('gone'); e.code = 'ENOENT'; throw e; };
  assert.strictEqual(w.unlinkRetry('x', { win: true, unlink: gone }), true);
  assert.throws(() => w.unlinkRetry('x', { win: false, unlink: locked }), /locked/);
  const isdir = () => { const e = new Error('dir'); e.code = 'EISDIR'; throw e; };
  assert.throws(() => w.unlinkRetry('x', { win: true, unlink: isdir }), /dir/);
});

test('정상·악성: compareToOrigin — 하드링크·같은 내용은 same, 사용자가 고쳤거나 없으면 differs, 읽기 실패(폴더 자리)는 unknown', () => {
  const d = tmp('wf-');
  try {
    const o = path.join(d, 'o.md'); fs.writeFileSync(o, 'A');
    const c = path.join(d, 'c.md'); fs.writeFileSync(c, 'A');
    assert.strictEqual(w.compareToOrigin(c, o), 'same');
    fs.writeFileSync(c, 'mine');
    assert.strictEqual(w.compareToOrigin(c, o), 'differs');
    assert.strictEqual(w.compareToOrigin(c, path.join(d, 'gone.md')), 'differs');
    fs.mkdirSync(path.join(d, 'dir.md'));
    assert.strictEqual(w.compareToOrigin(path.join(d, 'dir.md'), o), 'unknown');
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('경계: atomicWrite 실패 시 임시 파일을 남기지 않음 (대상 자리가 폴더)', () => {
  const d = tmp('wf-');
  try {
    fs.mkdirSync(path.join(d, 'x.json'));
    assert.throws(() => w.atomicWrite(path.join(d, 'x.json'), '1'));
    assert.deepStrictEqual(fs.readdirSync(d), ['x.json']);
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('경계: 빈 PATH·없는 이름·비문자열', () => {
  assert.strictEqual(w.findExecutable('claude', { env: { PATH: '' }, win: true }), null);
  assert.strictEqual(w.resolveClaude({ env: { PATH: '' }, win: true }), null);
  assert.ok(!w.samePath(null, 'C:\\', true));
  assert.ok(!w.samePath('', '', false));
  assert.strictEqual(w.exeFromCmdShim(path.join(os.tmpdir(), 'no-such-shim.cmd')), null);
  assert.ok(!w.sameFile('no-such-a', 'no-such-b'));
});
