'use strict';
// install-ps1.test.js — install.ps1 (윈도우 설치)을 임시 폴더에 실제로 설치·재설치·제거해 시험 (윈도우 전용)
// 원격은 임시 폴더의 진짜 git 저장소(GUGBAB_REPO_URL). 사용자 PATH 는 테스트 전용 레지스트리 키(GUGBAB_PATH_REGKEY)라 실제 PATH 는 그대로
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync, execSync, execFileSync } = require('child_process');

const WIN = process.platform === 'win32';
const opts = { skip: !WIN && '윈도우 전용 (PowerShell 설치 스크립트)' };
const INSTALL = path.resolve(__dirname, '..', 'install.ps1');
const tmp = (p) => fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), p)));
const GIT_ENV = { GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...GIT_ENV } }).trim();

// 가짜 원격: main(윈도우 래퍼 있음) + v1.0.0 태그 + feat/x 브랜치 + 래퍼 없는 브랜치. doctor 는 인자를 찍는 가짜 .cmd
function origin() {
  const o = tmp('ip-origin-');
  fs.mkdirSync(path.join(o, 'bin')); fs.mkdirSync(path.join(o, 'cli'));
  fs.writeFileSync(path.join(o, 'bin', 'gugbab-claude.cmd'), '@echo fake-gugbab %*\r\n');
  fs.writeFileSync(path.join(o, 'cli', 'main.js'), '');
  fs.writeFileSync(path.join(o, '.gitignore'), '/state/\n/projects/\n/profile.json\n');
  sh('git init -q -b main && git add -A && git commit -q -m one && git tag v1.0.0', o);
  sh('git checkout -q -b feat/x && echo x > x && git add x && git commit -q -m feat && git checkout -q main', o);
  sh('git checkout -q -b no-wrapper && git rm -q -r bin cli && git commit -q -m bare && git checkout -q main', o);
  return o;
}
function setup() {
  const base = tmp('ip-');
  const key = `HKCU:\\Software\\gugbab-test-${crypto.randomBytes(4).toString('hex')}`;
  return { base, origin: origin(), dir: path.join(base, 'gugbab'), key };
}
function run(s, args, env = {}) {
  return spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', INSTALL, ...args], {
    encoding: 'utf8', timeout: 120000, input: '',
    env: { ...process.env, ...GIT_ENV, GUGBAB_REPO_URL: s.origin, GUGBAB_PATH_REGKEY: s.key, ...env } });
}
const out = (r) => (r.stdout || '') + (r.stderr || '');
const channel = (s) => JSON.parse(fs.readFileSync(path.join(s.dir, 'state', 'channel.json'), 'utf8'));
const regPath = (s) => { try { return execFileSync('powershell.exe', ['-NoProfile', '-Command', `(Get-Item '${s.key}' -ErrorAction Stop).GetValue('Path','', 'DoNotExpandEnvironmentNames')`], { encoding: 'utf8' }).trim(); } catch { return null; } };
const setReg = (s, v) => execFileSync('powershell.exe', ['-NoProfile', '-Command', `New-Item -Path '${s.key}' -Force | Out-Null; Set-ItemProperty -Path '${s.key}' -Name Path -Value '${v}' -Type ExpandString`]);
const dropReg = (s) => { try { execFileSync('powershell.exe', ['-NoProfile', '-Command', `Remove-Item -Path '${s.key}' -Recurse -Force -ErrorAction SilentlyContinue`]); } catch { /* 없음 */ } };

test('정상: 기본 설치 — 최신 v* 태그, 채널 stable(BOM 없는 JSON), bin 을 사용자 PATH 에, 끝에 doctor', opts, () => {
  const s = setup();
  try {
    const r = run(s, ['-Dir', s.dir]);
    assert.strictEqual(r.status, 0, out(r));
    assert.deepStrictEqual(channel(s), { channel: 'stable' }, 'BOM 이 있으면 JSON.parse 가 실패');
    assert.strictEqual(sh('git rev-parse HEAD', s.dir), sh('git rev-parse v1.0.0', s.origin));
    assert.strictEqual(regPath(s), path.join(s.dir, 'bin'));
    assert.match(out(r), /installed: stable v1\.0\.0/);
    assert.match(out(r), /fake-gugbab doctor/);
  } finally { dropReg(s); }
});

test('정상: -Ref 브랜치면 그 브랜치를 따라감, 재설치는 갱신(PATH 중복 없음), 기존 PATH 의 %변수% 는 풀리지 않고 그대로', opts, () => {
  const s = setup();
  try {
    setReg(s, '%USERPROFILE%\\tools;C:\\x');
    assert.strictEqual(run(s, ['-Dir', s.dir, '-Ref', 'feat/x']).status, 0);
    assert.deepStrictEqual(channel(s), { channel: 'branch', branch: 'feat/x' });
    const r2 = run(s, ['-Dir', s.dir, '-Ref', 'feat/x']);
    assert.strictEqual(r2.status, 0, out(r2));
    assert.match(out(r2), /already installed - updating/);
    assert.strictEqual(regPath(s), `%USERPROFILE%\\tools;C:\\x;${path.join(s.dir, 'bin')}`);
  } finally { dropReg(s); }
});

test('정상: 제거 — PATH 에서 우리 항목만 빼고, 설치 폴더 안 junction 이 가리키는 ~/.claude 쪽 내용은 그대로', opts, () => {
  const s = setup();
  try {
    setReg(s, 'C:\\keep');
    assert.strictEqual(run(s, ['-Dir', s.dir]).status, 0);
    // 조립이 만드는 것처럼 projects\p\.claude\projects → (대화 기록 흉내) junction
    const history = tmp('ip-history-'); fs.writeFileSync(path.join(history, 'chat.jsonl'), 'keep');
    fs.mkdirSync(path.join(s.dir, 'projects', 'p', '.claude'), { recursive: true });
    fs.symlinkSync(history, path.join(s.dir, 'projects', 'p', '.claude', 'projects'), 'junction');
    const r = run(s, ['-Dir', s.dir, '-Uninstall', '-Yes']);
    assert.strictEqual(r.status, 0, out(r));
    assert.ok(!fs.existsSync(s.dir));
    assert.strictEqual(fs.readFileSync(path.join(history, 'chat.jsonl'), 'utf8'), 'keep', 'junction 을 따라 들어가 지우면 안 됨');
    assert.strictEqual(regPath(s), 'C:\\keep');
  } finally { dropReg(s); }
});

test('악성: 우리 설치본이 아닌 폴더는 설치·제거 모두 거부 (지우지 않음)', opts, () => {
  const s = setup();
  try {
    fs.mkdirSync(s.dir); fs.writeFileSync(path.join(s.dir, 'mine.txt'), 'm');
    const r = run(s, ['-Dir', s.dir]);
    assert.notStrictEqual(r.status, 0);
    assert.match(out(r), /not a gugbab install/);
    const u = run(s, ['-Dir', s.dir, '-Uninstall', '-Yes']);
    assert.notStrictEqual(u.status, 0);
    assert.ok(fs.existsSync(path.join(s.dir, 'mine.txt')));
  } finally { dropReg(s); }
});

test('악성: 홈·드라이브 루트·상대 경로·PATH 를 깨는 글자(; " %) 가 든 설치 위치는 거부', opts, () => {
  const s = setup();
  try {
    for (const d of [os.homedir(), 'C:\\', 'rel\\dir', path.join(s.base, 'a;b'), path.join(s.base, 'a%PATH%b')]) {
      const r = run(s, ['-Dir', d]);
      assert.notStrictEqual(r.status, 0, `${d}: ${out(r)}`);
    }
    assert.strictEqual(regPath(s), null, 'PATH 를 건드리지 않음');
  } finally { dropReg(s); }
});

test('악성: 옵션처럼 보이거나 .. 이 든 브랜치 이름·잘못된 버전·채널은 거부', opts, () => {
  const s = setup();
  try {
    for (const a of [['-Ref', '-x'], ['-Ref', 'a/../b'], ['-Ref', 'a b'], ['-Version', '1.0.0'], ['-Version', 'v1.0'], ['-Channel', 'beta']]) {
      const r = run(s, ['-Dir', s.dir, ...a]);
      assert.notStrictEqual(r.status, 0, `${a.join(' ')}: ${out(r)}`);
    }
    assert.ok(!fs.existsSync(path.join(s.dir, 'state')), '아무것도 꺼내지 않음');
  } finally { dropReg(s); }
});

test('경계: 래퍼(gugbab-claude.cmd) 없는 브랜치를 고르면 안내하고 실패, 없는 브랜치도 실패', opts, () => {
  const s = setup();
  try {
    const r = run(s, ['-Dir', s.dir, '-Ref', 'no-wrapper']);
    assert.notStrictEqual(r.status, 0);
    assert.match(out(r), /no Windows wrapper/);
    const r2 = run(s, ['-Dir', path.join(s.base, 'other'), '-Ref', 'nope']);
    assert.notStrictEqual(r2.status, 0);
    assert.match(out(r2), /no such branch/);
  } finally { dropReg(s); }
});

test('경계: -NoModifyPath 면 PATH 를 건드리지 않고 안내, 설치 폴더에 로컬 변경이 있으면 갱신 거부', opts, () => {
  const s = setup();
  try {
    const r = run(s, ['-Dir', s.dir, '-NoModifyPath']);
    assert.strictEqual(r.status, 0, out(r));
    assert.strictEqual(regPath(s), null);
    assert.match(out(r), /NoModifyPath/);
    fs.appendFileSync(path.join(s.dir, 'cli', 'main.js'), '// local edit\n');
    const r2 = run(s, ['-Dir', s.dir, '-NoModifyPath']);
    assert.notStrictEqual(r2.status, 0);
    assert.match(out(r2), /local changes/);
  } finally { dropReg(s); }
});
