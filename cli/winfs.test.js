// winfs.js — 윈도우 링크·쓰기·실행 파일 찾기
// 정상 / 악성·우회 / 경계 3계층. 플랫폼 인자(win)를 넘겨 맥·윈도우 어디서나 판정 로직을 본다.
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

test('정상: findExecutable — 윈도우는 PATHEXT 확장자 있는 것만, 확장자 없는 sh 스크립트는 건너뜀', () => {
  const d = tmp('wf-');
  try {
    fs.writeFileSync(path.join(d, 'tool'), '#!/bin/sh\n');
    fs.writeFileSync(path.join(d, 'tool.cmd'), '@echo off\n');
    const env = { PATH: d, PATHEXT: '.COM;.EXE;.BAT;.CMD' };
    assert.strictEqual(w.findExecutable('tool', { env, win: true }), path.win32.join(d, 'tool.cmd'));
    // .exe 가 PATHEXT 순서상 .cmd 보다 앞
    fs.writeFileSync(path.join(d, 'tool.exe'), '');
    assert.strictEqual(w.findExecutable('tool', { env, win: true }), path.win32.join(d, 'tool.exe'));
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('정상: npm .cmd 껍데기 → 그 안의 claude.exe 를 직접 실행 대상으로', () => {
  const d = tmp('wf-');
  try {
    const exeDir = path.join(d, 'node_modules', '@anthropic-ai', 'claude-code', 'bin'); fs.mkdirSync(exeDir, { recursive: true });
    fs.writeFileSync(path.join(exeDir, 'claude.exe'), '');
    fs.writeFileSync(path.join(d, 'claude'), '#!/bin/sh\n');
    fs.writeFileSync(path.join(d, 'claude.cmd'), '@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n"%dp0%\\node_modules\\@anthropic-ai\\claude-code\\bin\\claude.exe"   %*\r\n');
    const r = w.resolveClaude({ env: { PATH: d, PATHEXT: '.EXE;.CMD' }, win: true });
    assert.deepStrictEqual(r, { file: path.win32.join(exeDir, 'claude.exe'), viaShell: false });
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('악성: .cmd 껍데기가 폴더 밖(..)의 exe 를 가리키면 따르지 않고 셸 실행으로 둠', () => {
  const d = tmp('wf-');
  try {
    const inner = path.join(d, 'bin'); fs.mkdirSync(inner);
    fs.writeFileSync(path.join(d, 'evil.exe'), '');
    fs.writeFileSync(path.join(inner, 'claude.cmd'), '"%dp0%\\..\\evil.exe" %*\r\n');
    assert.strictEqual(w.exeFromCmdShim(path.join(inner, 'claude.cmd')), null);
    const r = w.resolveClaude({ env: { PATH: inner, PATHEXT: '.CMD' }, win: true });
    assert.deepStrictEqual(r, { file: path.win32.join(inner, 'claude.cmd'), viaShell: true });
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('악성: PATH 에 같은 이름 폴더만 있으면 실행 파일 아님', () => {
  const d = tmp('wf-');
  try {
    fs.mkdirSync(path.join(d, 'claude.exe'));
    assert.strictEqual(w.findExecutable('claude', { env: { PATH: d, PATHEXT: '.EXE' }, win: true }), null);
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
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
    assert.strictEqual(w.compareToOrigin(path.join(d, 'dir.md'), o), w.IS_WIN ? 'unknown' : 'unknown');
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
