'use strict';
// install-sh.test.js — install.sh (래퍼 한 줄 설치, 계획서 3장) 를 임시 HOME 에 실제로 설치·재설치·제거해 시험
// 원격은 임시 폴더의 진짜 git 저장소(GUGBAB_REPO_URL). 정상 / 악성·우회 / 경계 3계층
// 윈도우는 install.ps1(install-ps1.test.js) — install.sh 는 맥·리눅스 전용(심볼릭 링크·셸 설정 파일)이라 건너뜀
const nodeTest = require('node:test');
const test = process.platform === 'win32' ? (name) => nodeTest(name, { skip: 'install.sh 는 맥·리눅스 전용 — 윈도우는 install-ps1.test.js' }, () => {}) : nodeTest;
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
// detached = 새 세션이라 제어 터미널(/dev/tty)이 없다 — 터미널에서 테스트를 돌려도 질문에 걸려 멈추지 않는다
function run(s, args, env = {}) {
  return spawnSync('bash', [INSTALL, ...args], { encoding: 'utf8', timeout: 60000, input: '', detached: true,
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

test('정상: 링크 폴더가 PATH 에 없으면 묻지 않고 셸 설정에 넣고 알림', () => {
  const s = setup();
  const r = run(s, [], { PATH: process.env.PATH, SHELL: '/bin/zsh' });
  assert.strictEqual(r.status, 0, out(r));
  assert.match(out(r), /PATH 추가: .*\.zshrc 끝에 export PATH=/);
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

// ── PATH 자동 추가 (셸 설정 파일 끝에 표시 블록) ──────────────────────────
const NOPATH = { PATH: process.env.PATH }; // 링크 폴더가 PATH 에 없는 상태
const BEGIN = '# >>> gugbab-claude PATH >>>';
const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null);
const count = (s, sub) => (s || '').split(sub).length - 1;

test('정상: zsh — --yes 면 ~/.zshrc 끝에 $HOME 형식 한 줄, 기존 줄은 그대로, 새 셸에서 gugbab-claude 가 잡힘', () => {
  const s = setup();
  const rc = path.join(s.home, '.zshrc');
  fs.writeFileSync(rc, 'export FOO=1\nalias ll="ls -l"\n');
  const r = run(s, ['--yes'], { ...NOPATH, SHELL: '/bin/zsh' });
  assert.strictEqual(r.status, 0, out(r));
  const t = read(rc);
  assert.ok(t.startsWith('export FOO=1\nalias ll="ls -l"\n'), t);
  assert.ok(t.includes(`${BEGIN}\nexport PATH="$HOME/.local/bin:$PATH"\n# <<< gugbab-claude PATH <<<\n`), t);
  assert.match(out(r), /PATH 추가: .*\.zshrc[\s\S]*source/);
  // 실제로 그 파일을 읽은 셸에서 링크가 잡히는지 (PATH 에서 링크 폴더를 뺀 상태로 시작)
  const which = spawnSync('bash', ['-c', `. "${rc}" && command -v gugbab-claude`], { encoding: 'utf8', env: { HOME: s.home, PATH: '/usr/bin:/bin' } });
  assert.strictEqual(which.stdout.trim(), s.link, which.stderr);
});

test('정상: 다시 설치해도 블록은 한 번만, 이미 PATH 에 있으면 설정 파일을 만들지 않음', () => {
  const s = setup();
  const rc = path.join(s.home, '.zshrc');
  run(s, ['--yes'], { ...NOPATH, SHELL: '/bin/zsh' });
  const r = run(s, ['--yes'], { ...NOPATH, SHELL: '/bin/zsh' });
  assert.strictEqual(r.status, 0, out(r));
  assert.strictEqual(count(read(rc), BEGIN), 1);
  assert.match(out(r), /이미 .*\.zshrc 에 들어 있습니다/);
  const s2 = setup();
  const r2 = run(s2, ['--yes'], { SHELL: '/bin/zsh' }); // run() 기본 PATH 에 링크 폴더 있음
  assert.strictEqual(r2.status, 0, out(r2));
  assert.strictEqual(read(path.join(s2.home, '.zshrc')), null);
});

test('정상: bash 는 macOS ~/.bash_profile·그 밖 ~/.bashrc, fish 는 config.fish(폴더 생성), ZDOTDIR 존중', () => {
  const s = setup();
  run(s, ['--yes'], { ...NOPATH, SHELL: '/bin/bash' });
  const bashRc = path.join(s.home, process.platform === 'darwin' ? '.bash_profile' : '.bashrc');
  assert.ok(read(bashRc) && read(bashRc).includes('export PATH="$HOME/.local/bin:$PATH"'), bashRc);
  const f = setup();
  run(f, ['--yes'], { ...NOPATH, SHELL: '/usr/local/bin/fish' });
  const fishRc = path.join(f.home, '.config', 'fish', 'config.fish');
  assert.ok((read(fishRc) || '').includes('set -gx PATH "$HOME/.local/bin" $PATH'), read(fishRc));
  const z = setup();
  const zd = path.join(z.home, 'zdot'); fs.mkdirSync(zd);
  run(z, ['--yes'], { ...NOPATH, SHELL: '/bin/zsh', ZDOTDIR: zd });
  assert.ok(read(path.join(zd, '.zshrc')).includes(BEGIN));
  assert.strictEqual(read(path.join(z.home, '.zshrc')), null);
});

test('정상: --uninstall 은 설치가 넣은 블록만 지우고 앞뒤 사용자 줄은 남김', () => {
  const s = setup();
  const rc = path.join(s.home, '.zshrc');
  fs.writeFileSync(rc, 'export A=1\n');
  run(s, ['--yes'], { ...NOPATH, SHELL: '/bin/zsh' });
  fs.appendFileSync(rc, 'export B=2\n');
  const r = run(s, ['--uninstall', '--yes'], { ...NOPATH, SHELL: '/bin/zsh' });
  assert.strictEqual(r.status, 0, out(r));
  assert.strictEqual(read(rc), 'export A=1\nexport B=2\n');
  assert.match(out(r), /PATH 블록 제거/);
});

test('악성: --bin-dir 에 $(…)·따옴표·백틱이 든 경로 — 셸 설정에 쓰지 않고, 명령도 실행되지 않음', () => {
  for (const bad of ['b$(touch PWNED)', 'b"q', 'b`touch PWNED`']) {
    const s = setup();
    const binDir = path.join(s.home, bad);
    const r = run(s, ['--yes', '--bin-dir', binDir], { ...NOPATH, SHELL: '/bin/zsh' });
    assert.strictEqual(r.status, 0, out(r));
    assert.strictEqual(read(path.join(s.home, '.zshrc')), null, bad);
    assert.match(out(r), /해석하는 문자가 있어 .*자동으로 넣지 않습니다/);
    assert.ok(!fs.existsSync(path.join(s.home, 'PWNED')) && !fs.existsSync('PWNED'), bad);
  }
});

test('악성: 표시를 손으로 망가뜨린 설정 파일(끝 표시 없음)은 제거 때 한 글자도 바꾸지 않음', () => {
  const s = setup();
  const rc = path.join(s.home, '.zshrc');
  run(s, ['--yes'], { ...NOPATH, SHELL: '/bin/zsh' });
  const broken = `${BEGIN}\nexport PATH="$HOME/.local/bin:$PATH"\nexport IMPORTANT=1\n`;
  fs.writeFileSync(rc, broken);
  const r = run(s, ['--uninstall', '--yes'], { ...NOPATH, SHELL: '/bin/zsh' });
  assert.strictEqual(r.status, 0, out(r));
  assert.strictEqual(read(rc), broken);
  assert.match(out(r), /짝이 맞지 않아 그대로 둡니다/);
});

test('악성: 설정 파일이 없는 곳을 가리키는 링크면 만들지 않음, 정상 링크(dotfiles)는 링크 그대로 대상에 추가', () => {
  const s = setup();
  const rc = path.join(s.home, '.zshrc');
  fs.symlinkSync(path.join(s.home, 'nowhere', 'zshrc'), rc);
  const r = run(s, ['--yes'], { ...NOPATH, SHELL: '/bin/zsh' });
  assert.strictEqual(r.status, 0, out(r));
  assert.ok(!fs.existsSync(path.join(s.home, 'nowhere')));
  assert.match(out(r), /없는 곳을 가리키는 링크/);
  const d = setup();
  const real = path.join(d.home, 'dotfiles-zshrc'); fs.writeFileSync(real, 'export X=1\n');
  fs.symlinkSync(real, path.join(d.home, '.zshrc'));
  run(d, ['--yes'], { ...NOPATH, SHELL: '/bin/zsh' });
  assert.ok(fs.lstatSync(path.join(d.home, '.zshrc')).isSymbolicLink());
  assert.ok(read(real).startsWith('export X=1\n') && read(real).includes(BEGIN));
});

test('경계: 묻지 않음 — 터미널 없고 --yes 도 없어도(CI) 자동으로 넣고, 제거도 묻지 않고 블록만 지움', () => {
  const s = setup();
  const rc = path.join(s.home, '.zshrc');
  const r = run(s, [], { ...NOPATH, SHELL: '/bin/zsh' });
  assert.strictEqual(r.status, 0, out(r));
  assert.ok((read(rc) || '').includes(`${BEGIN}\nexport PATH="$HOME/.local/bin:$PATH"\n`), read(rc));
  assert.doesNotMatch(out(r), /\[Y\/n\]|넣을까요/);
  const u = run(s, ['--uninstall'], { ...NOPATH, SHELL: '/bin/zsh' }); // 설치 폴더 삭제는 여전히 묻는다(기본 n)
  assert.strictEqual(u.status, 0, out(u));
  assert.strictEqual(read(rc), '');
  assert.ok(fs.existsSync(s.dir), '설치 폴더는 묻는 기본값(n)대로 남음');
});

test('경계: --no-modify-path 면 셸 설정을 만들지도 고치지도 않고 한 줄만 안내', () => {
  const s = setup();
  const rc = path.join(s.home, '.zshrc');
  const r = run(s, ['--no-modify-path'], { ...NOPATH, SHELL: '/bin/zsh' });
  assert.strictEqual(r.status, 0, out(r));
  assert.strictEqual(read(rc), null);
  assert.match(out(r), /--no-modify-path[\s\S]*export PATH="\$HOME\/\.local\/bin:\$PATH"/);
});

test('경계: 끝에 줄바꿈 없는 설정 파일은 줄을 바꾼 뒤 추가, 쓸 수 없는 파일이면 경고만 하고 설치는 성공', () => {
  const s = setup();
  const rc = path.join(s.home, '.zshrc');
  fs.writeFileSync(rc, 'export LAST=1');
  run(s, ['--yes'], { ...NOPATH, SHELL: '/bin/zsh' });
  assert.ok(read(rc).startsWith(`export LAST=1\n${BEGIN}\n`), read(rc));
  if (process.getuid && process.getuid() === 0) return; // root 는 권한을 무시하므로 아래 검사 불가
  const ro = setup();
  const roRc = path.join(ro.home, '.zshrc');
  fs.writeFileSync(roRc, 'export R=1\n'); fs.chmodSync(roRc, 0o444);
  const r = run(ro, ['--yes'], { ...NOPATH, SHELL: '/bin/zsh' });
  assert.strictEqual(r.status, 0, out(r));
  assert.strictEqual(read(roRc), 'export R=1\n');
  assert.match(out(r), /쓸 수 없습니다/);
});
