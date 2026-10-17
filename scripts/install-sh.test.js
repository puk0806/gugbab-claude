'use strict';
// install-sh.test.js — install.sh (래퍼 한 줄 설치, 계획서 3장) 를 임시 HOME 에 실제로 설치·재설치·제거해 시험
// 원격은 임시 폴더의 진짜 git 저장소(GUGBAB_REPO_URL). 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

const INSTALL = path.resolve(__dirname, '..', 'install.sh');
const tmp = (p) => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), p)));
const GIT_ENV = { GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...GIT_ENV } }).trim();

// 가짜 원격: main(래퍼 있음) + 태그 선택 + feat/x 브랜치. doctor 는 인자를 찍는 가짜
function origin({ tag = true } = {}) {
  const o = tmp('is-origin-');
  fs.mkdirSync(path.join(o, 'bin')); fs.mkdirSync(path.join(o, 'cli'));
  fs.writeFileSync(path.join(o, 'bin', 'gugbab-claude'), '#!/bin/sh\necho "fake-gugbab $*"\n');
  fs.chmodSync(path.join(o, 'bin', 'gugbab-claude'), 0o755);
  fs.writeFileSync(path.join(o, 'cli', 'main.js'), '');
  fs.writeFileSync(path.join(o, '.gitignore'), '/state/\n/projects/\n/profile.json\n');
  sh('git init -q -b main && git add -A && git commit -q -m one', o);
  if (tag) sh('git tag v1.0.0', o);
  sh('git checkout -q -b feat/x && echo x > x && git add x && git commit -q -m feat && git checkout -q main', o);
  sh('git checkout -q -b no-wrapper && git rm -q -r bin cli && git commit -q -m bare && git checkout -q main', o);
  return o;
}
function setup(opts) {
  const home = tmp('is-home-');
  return { home, origin: origin(opts), dir: path.join(home, 'gugbab'), link: path.join(home, '.local', 'bin', 'gugbab-claude') };
}
function run(s, args, env = {}) {
  return spawnSync('bash', [INSTALL, ...args], { encoding: 'utf8', timeout: 60000, input: '',
    env: { ...process.env, ...GIT_ENV, HOME: s.home, GUGBAB_REPO_URL: s.origin, PATH: `${path.join(s.home, '.local', 'bin')}:${process.env.PATH}`, ...env } });
}
const out = (r) => r.stdout + r.stderr;
const channel = (s) => JSON.parse(fs.readFileSync(path.join(s.dir, 'state', 'channel.json'), 'utf8'));

test('정상: 기본 설치 — 최신 v* 태그를 받아 링크·채널(stable) 기록, 끝에 doctor 실행', () => {
  const s = setup();
  const r = run(s, []);
  assert.strictEqual(r.status, 0, out(r));
  assert.strictEqual(fs.readlinkSync(s.link), path.join(s.dir, 'bin', 'gugbab-claude'));
  assert.deepStrictEqual(channel(s), { channel: 'stable' });
  assert.strictEqual(sh('git rev-parse HEAD', s.dir), sh('git rev-parse v1.0.0', s.origin));
  assert.match(out(r), /설치 완료: stable v1\.0\.0/);
  assert.match(out(r), /fake-gugbab doctor/);
});

test('정상: 태그가 아직 없으면 main 을 받고 main 채널', () => {
  const s = setup({ tag: false });
  const r = run(s, ['--yes']);
  assert.strictEqual(r.status, 0, out(r));
  assert.deepStrictEqual(channel(s), { channel: 'main' });
  assert.match(out(r), /태그\(v\*\)가 없어 main/);
});

test('정상: --ref 브랜치 — 그 브랜치를 꺼내고 branch 채널로 기록 (PR 머지 전 시험)', () => {
  const s = setup();
  const r = run(s, ['--ref', 'feat/x']);
  assert.strictEqual(r.status, 0, out(r));
  assert.deepStrictEqual(channel(s), { channel: 'branch', branch: 'feat/x' });
  assert.strictEqual(sh('git rev-parse HEAD', s.dir), sh('git rev-parse feat/x', s.origin));
  assert.strictEqual(sh('git rev-parse --abbrev-ref HEAD', s.dir), 'feat/x');
});

test('정상: --version 은 태그 고정(pin), 다시 실행하면 갱신 (원격의 새 커밋 반영)', () => {
  const s = setup();
  assert.strictEqual(run(s, ['--version', 'v1.0.0']).status, 0);
  assert.deepStrictEqual(channel(s), { channel: 'stable', pin: 'v1.0.0' });
  sh('git checkout -q feat/x && echo y > y && git add y && git commit -q -m more && git checkout -q main', s.origin);
  const r = run(s, ['--ref', 'feat/x']);
  assert.strictEqual(r.status, 0, out(r));
  assert.match(out(r), /이미 설치되어 있어 갱신/);
  assert.strictEqual(sh('git rev-parse HEAD', s.dir), sh('git rev-parse feat/x', s.origin));
});

test('정상: --uninstall --yes — 우리 링크와 설치 폴더만 제거', () => {
  const s = setup();
  run(s, []);
  const r = run(s, ['--uninstall', '--yes']);
  assert.strictEqual(r.status, 0, out(r));
  assert.ok(!fs.existsSync(s.link) && !fs.existsSync(s.dir));
});

test('정상: 링크 폴더가 PATH 에 없으면 넣을 한 줄을 안내', () => {
  const s = setup();
  const r = run(s, [], { PATH: process.env.PATH });
  assert.strictEqual(r.status, 0, out(r));
  assert.match(out(r), /PATH 에 없습니다[\s\S]*export PATH=/);
});

test('악성: 옵션처럼 보이는·경로 조작·셸 문자 브랜치 이름 → 거부, 아무것도 받지 않음', () => {
  for (const bad of ['--upload-pack=touch /tmp/pwn', '../main', 'a;rm -rf ~', 'a b', '-x', 'x/../../y']) {
    const s = setup();
    const r = run(s, ['--ref', bad]);
    assert.strictEqual(r.status, 1, bad);
    assert.match(out(r), /올바르지 않습니다/, bad);
    assert.ok(!fs.existsSync(s.dir), bad);
  }
});

test('악성: 설치 위치가 홈·루트·상대경로 → 거부', () => {
  const s = setup();
  for (const d of [s.home, '/', 'relative/dir', `${s.home}/`]) {
    const r = run(s, ['--dir', d]);
    assert.strictEqual(r.status, 1, d);
    assert.match(out(r), /쓸 수 없는|절대경로/, d);
  }
});

test('악성: 이미 있는 남의 폴더 — 설치도 제거도 거부하고 내용 보존', () => {
  const s = setup();
  fs.mkdirSync(s.dir); fs.writeFileSync(path.join(s.dir, 'mine.txt'), 'keep');
  let r = run(s, []);
  assert.strictEqual(r.status, 1);
  assert.match(out(r), /gugbab 설치본이 아닙니다/);
  r = run(s, ['--uninstall', '--yes']);
  assert.strictEqual(r.status, 1);
  assert.strictEqual(fs.readFileSync(path.join(s.dir, 'mine.txt'), 'utf8'), 'keep');
});

test('악성: 링크 자리에 일반 파일이 있으면 덮어쓰지 않음, 남의 링크는 제거 때 지우지 않음', () => {
  const s = setup();
  fs.mkdirSync(path.dirname(s.link), { recursive: true });
  fs.writeFileSync(s.link, 'user script');
  let r = run(s, []);
  assert.strictEqual(r.status, 1);
  assert.strictEqual(fs.readFileSync(s.link, 'utf8'), 'user script');
  fs.rmSync(s.link);
  fs.symlinkSync('/usr/bin/true', s.link);
  run(s, ['--uninstall', '--yes']);
  assert.strictEqual(fs.readlinkSync(s.link), '/usr/bin/true');
});

test('악성: 설치 폴더를 직접 고쳐 두었으면 갱신하지 않음 (덮어쓰기 방지)', () => {
  const s = setup();
  run(s, []);
  fs.appendFileSync(path.join(s.dir, 'bin', 'gugbab-claude'), '# local edit\n');
  const r = run(s, []);
  assert.strictEqual(r.status, 1);
  assert.match(out(r), /로컬 변경/);
});

test('경계: 모르는 옵션·값 빠진 옵션·없는 브랜치·잘못된 버전 형식·채널 → 안내 후 실패', () => {
  const s = setup();
  for (const [args, re] of [[['--wat'], /모르는 옵션/], [['--ref'], /이름이 필요/], [['--ref', 'nope'], /그런 브랜치·태그가 없습니다/],
    [['--version', '1.0'], /vX\.Y\.Z/], [['--version', 'v9.9.9'], /태그가 없습니다/], [['--channel', 'beta'], /stable 또는 main/]]) {
    const r = run(s, args);
    assert.strictEqual(r.status, 1, args.join(' '));
    assert.match(out(r), re, args.join(' '));
  }
});

test('경계: 원격에 닿지 않으면 받기 실패 안내, 래퍼 없는 브랜치를 고르면 안내', () => {
  const s = setup();
  const r = run(s, [], { GUGBAB_REPO_URL: path.join(s.home, 'no-such-repo') });
  assert.strictEqual(r.status, 1);
  assert.match(out(r), /받기 실패/);
  const r2 = run(s, ['--ref', 'no-wrapper']);
  assert.strictEqual(r2.status, 1);
  assert.match(out(r2), /래퍼\(bin\/gugbab-claude\)가 없습니다/);
});

test('경계: 제거할 게 없어도 정상 종료', () => {
  const s = setup();
  const r = run(s, ['--uninstall', '--yes']);
  assert.strictEqual(r.status, 0, out(r));
});
