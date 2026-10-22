// bin/gugbab-claude — 실행 래퍼 (가짜 claude 를 PATH 에 두고 시험)
// 정상 / 악성·우회 / 경계 3계층
// 윈도우: 이 sh 래퍼는 Git Bash 에서 실행되면 바로 cli/launch.js 로 넘긴다(2026-10-20) — 여기 시험(가짜 sh claude·dash 작업 제어)은
//   맥·리눅스 전용이라 건너뛰고, 같은 동작의 윈도우판은 launch.test.js 가 맡는다. 넘기는 것 자체는 맨 아래 윈도우 시험
const nodeTest = require('node:test');
const IS_WIN = process.platform === 'win32';
const test = IS_WIN ? (name) => nodeTest(name, { skip: 'sh 래퍼 전용 — 윈도우는 launch.test.js' }, () => {}) : nodeTest;
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.resolve(__dirname, '..');
const BIN = path.join(REPO, 'bin', 'gugbab-claude');

nodeTest('정상(윈도우): Git Bash 에서 sh 래퍼를 부르면 launch.js 로 넘김 — 하위 명령·가짜 claude 인자 그대로', { skip: !IS_WIN && '윈도우 전용' }, () => {
  const home = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'bn-home-')));
  for (const d of ['projects', 'plugins', 'plans']) fs.mkdirSync(path.join(home, '.claude', d), { recursive: true });
  const data = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'bn-data-')));
  const proj = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'bn-proj-')));
  const log = path.join(data, 'calls.jsonl');
  const fake = path.join(data, 'fake.js');
  fs.writeFileSync(fake, `require('fs').appendFileSync(process.env.LOG, JSON.stringify(process.argv.slice(2))+'\\n')`);
  const env = { ...process.env, HOME: home, USERPROFILE: home, GUGBAB_HOME: REPO, GUGBAB_DATA: data, GUGBAB_CLAUDE_BIN: fake, LOG: log };
  delete env.CLAUDE_CONFIG_DIR;
  const st = spawnSync('sh', [BIN, 'status'], { cwd: proj, env, encoding: 'utf8', timeout: 60000 });
  assert.strictEqual(st.status, 0, st.stderr);
  const r = spawnSync('sh', [BIN, '-p', 'a b', '$(x)'], { cwd: proj, env, encoding: 'utf8', timeout: 60000 });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(log, 'utf8').trim()), ['-p', 'a b', '$(x)']);
  // 악성·경계: Git Bash 는 / 로 시작하는 인자를 윈도우 경로로 바꾼다("/harness preset" → "C:/Program Files/Git/harness preset", 2026-10-21 실측)
  //   — 래퍼가 변환을 꺼서 슬래시 커맨드·POSIX 경로·윈도우 경로·한글·셸 문자 모두 받은 그대로
  fs.rmSync(log, { force: true });
  const odd = ['/harness preset', '/tmp/x', 'C:\\a b', '//server/share', '한글 인자', '--opt=/etc/x'];
  const r2 = spawnSync('sh', [BIN, '--raw', '-p', ...odd], { cwd: proj, env, encoding: 'utf8', timeout: 60000 });
  assert.strictEqual(r2.status, 0, r2.stderr);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(log, 'utf8').trim()), ['-p', ...odd]);
});
const tmp = (p) => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), p)));

function setup(fakeClaude) {
  const home = tmp('bn-home-');
  for (const d of ['projects', 'plugins', 'plans']) fs.mkdirSync(path.join(home, '.claude', d), { recursive: true });
  const data = tmp('bn-data-');
  const proj = tmp('bn-proj-');
  const fakeBin = tmp('bn-bin-');
  const log = path.join(fakeBin, 'calls.log');
  fs.writeFileSync(path.join(fakeBin, 'claude'), `#!/bin/sh\n${fakeClaude}\n`);
  fs.chmodSync(path.join(fakeBin, 'claude'), 0o755);
  return { home, data, proj, fakeBin, log };
}
function run(s, args, env = {}) {
  return spawnSync('sh', [BIN, ...args], { cwd: s.proj, encoding: 'utf8', timeout: 60000,
    env: { ...process.env, HOME: s.home, GUGBAB_HOME: REPO, GUGBAB_DATA: s.data, PATH: `${s.fakeBin}:${process.env.PATH}`, LOG: path.join(s.fakeBin, 'calls.log'), ...env } });
}
const calls = (s) => fs.existsSync(s.log) ? fs.readFileSync(s.log, 'utf8').trim().split('\n') : [];

test('정상: 프로젝트별 설정 폴더 + 로그인 공유 변수로 claude 실행, 인자 그대로 전달', () => {
  const s = setup('echo "cfg=$CLAUDE_CONFIG_DIR sec=[${CLAUDE_SECURESTORAGE_CONFIG_DIR-unset}] args=$*" >> "$LOG"');
  const r = run(s, ['-p', 'hello world']);
  assert.strictEqual(r.status, 0, r.stderr);
  const [line] = calls(s);
  assert.ok(line.includes(`cfg=${path.join(s.data, 'projects', path.basename(s.proj), '.claude')}`), line);
  assert.ok(line.includes('sec=[]'), '빈 값으로 설정 (unset 아님)');
  assert.ok(line.endsWith('args=-p hello world'), line);
});

test('정상: claude 세션 안에서 gugbab-claude 가 PATH 로 보임 (/harness 가 중괄호 변수 없이 부를 수 있게)', () => {
  const s = setup('echo "which=$(command -v gugbab-claude)" >> "$LOG"');
  const r = run(s, ['-p', 'x']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(calls(s)[0], `which=${BIN}`);
});

test('정상: preset·harness 하위 명령은 claude 없이 동작', () => {
  const s = setup('echo called >> "$LOG"');
  const r = run(s, ['preset']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /nextjs/);
  const h = run(s, ['harness', '--open', '--dry-run'], { COPAD_MUX: '', TMUX: '' });
  assert.strictEqual(h.status, 0, h.stderr);
  assert.deepStrictEqual(calls(s), []);
});

test('정상: 재시작 표시가 있으면 --continue 로 한 번 더, 없으면 끝', () => {
  const s = setup([
    'echo "args=$*" >> "$LOG"',
    'if [ ! -f "$LOG.once" ]; then touch "$LOG.once"; touch "$CLAUDE_CONFIG_DIR/.gugbab-restart"; fi',
  ].join('\n'));
  const r = run(s, ['--model', 'opus']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.deepStrictEqual(calls(s), ['args=--model opus', 'args=--continue']);
  assert.match(r.stderr, /다시 시작/);
});

test('정상: -p(한 번 실행)에서는 재시작 표시가 있어도 다시 띄우지 않고 안내만 (대화형으로 바뀌지 않게)', () => {
  const s = setup('echo "args=$*" >> "$LOG"; touch "$CLAUDE_CONFIG_DIR/.gugbab-restart"');
  for (const flag of ['-p', '--print']) {
    fs.rmSync(s.log, { force: true });
    const r = run(s, [flag, 'x']);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.deepStrictEqual(calls(s), [`args=${flag} x`]);
    assert.match(r.stderr, /다음 실행부터 반영/);
  }
});

test('정상: claude 종료 코드를 그대로 돌려줌', () => {
  const s = setup('exit 7');
  assert.strictEqual(run(s, []).status, 7);
});

test('정상: --raw 는 하네스 없이 그냥 claude', () => {
  const s = setup('echo "cfg=${CLAUDE_CONFIG_DIR-unset} args=$*" >> "$LOG"');
  run(s, ['--raw', '--version']);
  assert.deepStrictEqual(calls(s), ['cfg=unset args=--version']);
});

test('악성: 지난 세션에 남은 재시작 표시로 엉뚱하게 다시 띄우지 않음', () => {
  const s = setup('echo "args=$*" >> "$LOG"');
  run(s, ['-p', 'a']);
  const cfg = path.join(s.data, 'projects', path.basename(s.proj), '.claude');
  fs.writeFileSync(path.join(cfg, '.gugbab-restart'), 'stale');
  fs.rmSync(s.log);
  run(s, ['-p', 'b']);
  assert.deepStrictEqual(calls(s), ['args=-p b']);
});

test('악성: 인자에 셸 문자가 있어도 그대로 한 인자로 전달 (해석하지 않음)', () => {
  const s = setup('for a in "$@"; do echo "[$a]" >> "$LOG"; done');
  run(s, ['-p', '$(touch /tmp/gugbab-pwned) ; rm -rf ~', '"q"']);
  assert.deepStrictEqual(calls(s), ['[-p]', '[$(touch /tmp/gugbab-pwned) ; rm -rf ~]', '["q"]']);
  assert.ok(!fs.existsSync('/tmp/gugbab-pwned'));
});

test('악성: PATH 앞에 둔 가짜 gugbab-claude 보다 하네스 자신의 것이 먼저 잡힘', () => {
  const s = setup('echo "which=$(command -v gugbab-claude)" >> "$LOG"');
  fs.writeFileSync(path.join(s.fakeBin, 'gugbab-claude'), '#!/bin/sh\necho evil\n');
  fs.chmodSync(path.join(s.fakeBin, 'gugbab-claude'), 0o755);
  run(s, ['-p', 'x']);
  assert.strictEqual(calls(s)[0], `which=${BIN}`);
});

test('경계: claude 가 PATH 에 없으면 안내 + 127', () => {
  const s = setup('exit 0');
  fs.rmSync(path.join(s.fakeBin, 'claude'));
  // node 만 있는 PATH (nvm 이면 claude 가 node 와 같은 폴더에 있어 node 폴더를 통째로 넣으면 안 됨)
  fs.symlinkSync(process.execPath, path.join(s.fakeBin, 'node'));
  const r = spawnSync('sh', [BIN], { cwd: s.proj, encoding: 'utf8', env: { HOME: s.home, GUGBAB_HOME: REPO, GUGBAB_DATA: s.data, PATH: `${s.fakeBin}:/usr/bin:/bin` } });
  assert.strictEqual(r.status, 127);
  assert.match(r.stderr, /claude 를 찾지 못했습니다/);
});

test('경계: 하위 명령(status)은 claude 없이 동작, 심볼릭 링크로 불러도 자기 위치를 찾음', () => {
  const s = setup('exit 0');
  const link = path.join(s.fakeBin, 'gugbab-claude');
  fs.symlinkSync(BIN, link);
  const r = spawnSync('sh', [link, 'status'], { cwd: s.proj, encoding: 'utf8', env: { ...process.env, HOME: s.home, GUGBAB_DATA: s.data, GUGBAB_HOME: '' } });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /gugbab 하네스/);
});

test('경계: 처음 실행 프리셋 질문은 터미널이 아니면(스크립트·-p) 나오지 않고 바로 claude 실행', () => {
  const s = setup('echo "ran $*" >> "$LOG"');
  const r = run(s, ['-p', 'hi']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(!/처음 실행합니다/.test(r.stdout + r.stderr));
  assert.deepStrictEqual(calls(s), ['ran -p hi']);
});

// ── 세션 안에서 다시 부른 gugbab-claude 의 모드 (2026-10-17 — 배포 모드 세션 안 status 가 "개발 모드 — 자동 최신화 끔" 으로 나오던 버그) ──
// 배포 모드 = GUGBAB_HOME 없이 실행. 시험이 이 레포를 자동 업데이트하지 않게 "방금 확인함" 기록을 데이터 폴더에 둔다
function deployedEnv(s, extra = {}) {
  fs.mkdirSync(path.join(s.data, 'state'), { recursive: true });
  fs.writeFileSync(path.join(s.data, 'state', 'update-check.json'), JSON.stringify({ at: Date.now() }));
  const env = { ...process.env, HOME: s.home, GUGBAB_DATA: s.data, PATH: `${s.fakeBin}:${process.env.PATH}`, LOG: s.log, ...extra };
  for (const k of ['GUGBAB_HOME', 'GUGBAB_DEV']) if (!(k in extra)) delete env[k];
  return env;
}
const runEnv = (s, args, env) => spawnSync('sh', [BIN, ...args], { cwd: s.proj, encoding: 'utf8', timeout: 60000, env });
const NESTED = 'echo "dev=[$GUGBAB_DEV] home=$GUGBAB_HOME" >> "$LOG"; gugbab-claude status | grep "버전" >> "$LOG"';

test('정상: 배포 모드로 띄운 세션 안에서 다시 부른 gugbab-claude 는 배포 모드 (개발 모드·자동 최신화 끔으로 나오지 않음)', () => {
  const s = setup(NESTED);
  const r = runEnv(s, ['-p', 'x'], deployedEnv(s));
  assert.strictEqual(r.status, 0, r.stderr);
  const [env, ver] = calls(s);
  assert.strictEqual(env, `dev=[0] home=${REPO}`, '배포 모드는 GUGBAB_DEV=0 을 넘김');
  assert.ok(ver && !/개발 모드|자동 최신화 끔/.test(ver), ver);
});

test('정상: 개발 모드로 띄운 세션 안에서 다시 부르면 개발 모드 그대로', () => {
  const s = setup(NESTED);
  const r = run(s, ['-p', 'x']);
  assert.strictEqual(r.status, 0, r.stderr);
  const [env, ver] = calls(s);
  assert.strictEqual(env, `dev=[1] home=${REPO}`);
  assert.match(ver, /개발 모드/);
});

test('악성: GUGBAB_DEV=0 과 함께 엉뚱한 GUGBAB_HOME 이 넘어와도 그 경로를 쓰지 않고 자기 위치를 씀', () => {
  const s = setup('echo "dev=[$GUGBAB_DEV] home=$GUGBAB_HOME" >> "$LOG"');
  const evil = tmp('bn-evil-');
  const r = runEnv(s, ['-p', 'x'], deployedEnv(s, { GUGBAB_DEV: '0', GUGBAB_HOME: evil }));
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(calls(s)[0], `dev=[0] home=${REPO}`);
});

test('경계: GUGBAB_DEV 가 0·1 이 아닌 값이면 예전처럼 GUGBAB_HOME 유무로 판정', () => {
  const s = setup('echo "dev=[$GUGBAB_DEV]" >> "$LOG"');
  assert.strictEqual(run(s, ['-p', 'x'], { GUGBAB_DEV: 'yes' }).status, 0);
  assert.strictEqual(calls(s)[0], 'dev=[1]', 'GUGBAB_HOME 이 있으면 개발 모드');
  const t = setup('echo "dev=[$GUGBAB_DEV]" >> "$LOG"');
  assert.strictEqual(runEnv(t, ['-p', 'x'], deployedEnv(t, { GUGBAB_DEV: '' })).status, 0);
  assert.strictEqual(calls(t)[0], 'dev=[0]', '빈 값 + GUGBAB_HOME 없음 → 배포 모드');
});

// ── 업데이트 직후 새 래퍼로 다시 실행 (2026-10-19 — 업데이트한 그 실행은 예전 래퍼 코드로 돌아 래퍼 수정이 한 번 늦게 반영되던 문제) ──
// 가짜 하네스 폴더: bin/gugbab-claude(시험 대상 복사본) + cli/main.js(가짜 — self-update 는 FAKE_UPDATE 대로, prepare 는 설정 폴더 출력)
const FAKE_MAIN = `
const fs = require('fs'), path = require('path');
const [cmd, ...rest] = process.argv.slice(2);
const a = (s) => fs.appendFileSync(process.env.LOG, s + '\\n');
const H = path.resolve(__dirname, '..'), nb = path.join(H, 'bin', 'gugbab-claude');
// git checkout 처럼 새 파일로 바꿔치기 (tmp → rename) — 도는 셸은 예전 파일을 끝까지 읽는다
const swap = () => { fs.writeFileSync(nb + '.tmp', fs.readFileSync(path.join(H, 'new-wrapper'))); fs.renameSync(nb + '.tmp', nb); };
if (cmd === 'self-update') {
  a('self-update');
  if (process.env.LAUNCH_LOG) fs.appendFileSync(process.env.LAUNCH_LOG, 'update ' + (process.env.GUGBAB_LAUNCH || 'unset') + '\\n');
  const m = process.env.FAKE_UPDATE || 'none';
  if (m === 'crash') throw new Error('boom');
  if (m === 'update') { swap(); process.exit(10); }
  if (m === 'update-no-bin') { fs.rmSync(nb); process.exit(10); }
  if (m === 'always') process.exit(10);
  process.exit(0);
}
if (cmd === 'first-run') process.exit(0);
if (cmd === 'prepare') {
  a('prepare ' + rest.join(' '));
  const cfg = path.join(process.env.GUGBAB_DATA, 'cfg', '.claude');
  fs.mkdirSync(cfg, { recursive: true });
  process.stdout.write(cfg + '\\n');
}
`;
const NEW_WRAPPER = '#!/bin/sh\necho "new-wrapper reexec=[$GUGBAB_REEXEC] dev=[$GUGBAB_DEV]" >> "$LOG"\nfor a in "$@"; do echo "[$a]" >> "$LOG"; done\n[ -n "${LAUNCH_LOG:-}" ] && echo "new-wrapper ${GUGBAB_LAUNCH:-unset}" >> "$LAUNCH_LOG"\nexit 0\n';
function fakeHarness(fakeClaude) {
  const s = setup(fakeClaude);
  const h = tmp('bn-harness-');
  fs.mkdirSync(path.join(h, 'bin')); fs.mkdirSync(path.join(h, 'cli'));
  fs.copyFileSync(BIN, path.join(h, 'bin', 'gugbab-claude'));
  fs.writeFileSync(path.join(h, 'cli', 'main.js'), FAKE_MAIN);
  fs.writeFileSync(path.join(h, 'new-wrapper'), NEW_WRAPPER);
  return { ...s, h, hbin: path.join(h, 'bin', 'gugbab-claude') };
}
function runHarness(s, args, extra = {}) {
  const env = { ...process.env, HOME: s.home, GUGBAB_DATA: s.data, PATH: `${s.fakeBin}:${process.env.PATH}`, LOG: s.log, ...extra };
  for (const k of ['GUGBAB_HOME', 'GUGBAB_DEV', 'GUGBAB_REEXEC', 'GUGBAB_WRAPPER_REV', 'CLAUDE_CONFIG_DIR', 'GUGBAB_LAUNCH']) if (!(k in extra)) delete env[k];
  return spawnSync('sh', [s.hbin, ...args], { cwd: s.proj, encoding: 'utf8', timeout: 60000, env });
}
const CLAUDE_ENV = 'echo "claude reexec=[${GUGBAB_REEXEC-unset}] rev=[${GUGBAB_WRAPPER_REV-unset}] args=$*" >> "$LOG"';

test('정상: 업데이트되면 새 래퍼로 다시 실행 — 인자 그대로, 예전 래퍼는 claude 를 띄우지 않음', () => {
  const s = fakeHarness(CLAUDE_ENV);
  const r = runHarness(s, ['--model', 'opus'], { FAKE_UPDATE: 'update' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.deepStrictEqual(calls(s), ['self-update', 'new-wrapper reexec=[1] dev=[0]', '[--model]', '[opus]']);
});

test('정상: 업데이트가 없으면 다시 실행하지 않고 조립은 --no-update, claude 에는 다시 실행 표시가 새지 않음', () => {
  const s = fakeHarness(CLAUDE_ENV);
  const r = runHarness(s, ['-p', 'x']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.deepStrictEqual(calls(s), ['self-update', 'prepare --no-update', 'claude reexec=[unset] rev=[unknown] args=-p x']);
});

test('정상: claude 에 이 래퍼의 하네스 커밋을 GUGBAB_WRAPPER_REV 로 넘김 (git 저장소면 HEAD)', () => {
  const s = setup(CLAUDE_ENV);
  const r = run(s, ['-p', 'x']);
  assert.strictEqual(r.status, 0, r.stderr);
  const head = spawnSync('git', ['-C', REPO, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
  assert.match(head, /^[0-9a-f]{40}$/);
  assert.strictEqual(calls(s)[0], `claude reexec=[unset] rev=[${head}] args=-p x`);
});

test('정상: 재시작 표시로 다시 띄울 때도 지금 설치된 래퍼로 --continue (세션 도중 업데이트 반영)', () => {
  // 가짜 claude: 세션 도중 하네스가 업데이트됨(래퍼 바꿔치기) + 재시작 표시
  const t = fakeHarness([CLAUDE_ENV,
    `node -e 'const fs=require("fs");const h=process.argv[1];fs.writeFileSync(h+"/bin/gugbab-claude.tmp",fs.readFileSync(h+"/new-wrapper"));fs.renameSync(h+"/bin/gugbab-claude.tmp",h+"/bin/gugbab-claude")' "$HARNESS"`,
    'touch "$CLAUDE_CONFIG_DIR/.gugbab-restart"'].join('\n'));
  const r2 = runHarness(t, ['--model', 'opus'], { HARNESS: t.h });
  assert.strictEqual(r2.status, 0, r2.stderr);
  assert.deepStrictEqual(calls(t), ['self-update', 'prepare --no-update', 'claude reexec=[unset] rev=[unknown] args=--model opus', 'new-wrapper reexec=[1] dev=[0]', '[--continue]']);
  assert.match(r2.stderr, /다시 시작/);
});

test('악성: 업데이트가 계속 "갱신됨" 이어도 다시 실행은 한 번만 (무한 반복 없음)', () => {
  const s = fakeHarness(CLAUDE_ENV);
  const r = runHarness(s, ['-p', 'x'], { FAKE_UPDATE: 'always' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.deepStrictEqual(calls(s), ['self-update', 'prepare --no-update', 'claude reexec=[unset] rev=[unknown] args=-p x']);
});

test('악성: 다시 실행해도 셸 문자가 든 인자를 해석하지 않고 그대로 넘김', () => {
  const s = fakeHarness(CLAUDE_ENV);
  const evil = '$(touch /tmp/gugbab-reexec-pwned) ; rm -rf ~';
  runHarness(s, ['-p', evil, '"q"', ''], { FAKE_UPDATE: 'update' });
  assert.deepStrictEqual(calls(s), ['self-update', 'new-wrapper reexec=[1] dev=[0]', '[-p]', `[${evil}]`, '["q"]', '[]']);
  assert.ok(!fs.existsSync('/tmp/gugbab-reexec-pwned'));
});

test('악성: 밖에서 넘어온 GUGBAB_REEXEC 는 claude 세션으로 새지 않고, 1 이 아닌 값이면 업데이트를 그대로 확인', () => {
  const s = fakeHarness(CLAUDE_ENV);
  runHarness(s, ['-p', 'x'], { GUGBAB_REEXEC: '1' });
  assert.deepStrictEqual(calls(s), ['prepare --no-update', 'claude reexec=[unset] rev=[unknown] args=-p x'], '1 이면 업데이트만 건너뜀');
  const t = fakeHarness(CLAUDE_ENV);
  runHarness(t, ['-p', 'x'], { GUGBAB_REEXEC: 'yes' });
  assert.strictEqual(calls(t)[0], 'self-update');
});

test('경계: 업데이트 뒤 새 래퍼 파일이 없으면 지금 프로세스로 계속', () => {
  const s = fakeHarness(CLAUDE_ENV);
  const r = runHarness(s, ['-p', 'x'], { FAKE_UPDATE: 'update-no-bin' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.deepStrictEqual(calls(s), ['self-update', 'prepare --no-update', 'claude reexec=[unset] rev=[unknown] args=-p x']);
});

test('경계: 업데이트 확인이 죽어도(node 오류) 세션은 그대로 뜸', () => {
  const s = fakeHarness(CLAUDE_ENV);
  const r = runHarness(s, ['-p', 'x'], { FAKE_UPDATE: 'crash' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.deepStrictEqual(calls(s), ['self-update', 'prepare --no-update', 'claude reexec=[unset] rev=[unknown] args=-p x']);
});

test('경계: 하위 명령(status 등)과 --raw 는 업데이트·다시 실행을 하지 않음', () => {
  const s = fakeHarness(CLAUDE_ENV);
  runHarness(s, ['status'], { FAKE_UPDATE: 'update' });
  runHarness(s, ['--raw', '-p', 'x'], { FAKE_UPDATE: 'update' });
  assert.deepStrictEqual(calls(s), ['claude reexec=[unset] rev=[unset] args=-p x']);
});

test('경계: 개발 모드(실제 main.js)의 self-update 는 건너뛰고 0 — 다시 실행 없음', () => {
  const r = spawnSync(process.execPath, [path.join(REPO, 'cli', 'main.js'), 'self-update'], { encoding: 'utf8', env: { ...process.env, GUGBAB_HOME: REPO, GUGBAB_DEV: '1', GUGBAB_DATA: tmp('bn-su-') } });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(r.stdout, '', 'stdout 은 비어 있어야 함');
});

// ── 실행 값 GUGBAB_LAUNCH (2026-10-19 — self-update 가 확인 결과를 이 값과 함께 남기고 세션 시작 훅이 같은 실행 것만 보여 줌) ──
const launches = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n') : []);
const LAUNCH_CLAUDE = 'echo "claude ${GUGBAB_LAUNCH-unset}" >> "$LAUNCH_LOG"';

test('정상: 실행마다 새 실행 값을 만들어 self-update 와 claude 에 같은 값을 넘김', () => {
  const s = fakeHarness(LAUNCH_CLAUDE);
  const f = path.join(s.data, 'launch.log');
  runHarness(s, ['-p', 'x'], { LAUNCH_LOG: f });
  runHarness(s, ['-p', 'x'], { LAUNCH_LOG: f });
  const l = launches(f);
  assert.strictEqual(l.length, 4, l.join('|'));
  const v1 = l[0].split(' ')[1], v2 = l[2].split(' ')[1];
  assert.match(v1, /^\d{1,10}-\d{1,13}$/);
  assert.deepStrictEqual([l[0], l[1]], [`update ${v1}`, `claude ${v1}`]);
  assert.deepStrictEqual([l[2], l[3]], [`update ${v2}`, `claude ${v2}`]);
  assert.notStrictEqual(v1, v2, '실행마다 다른 값');
});

test('정상: 업데이트 후 새 래퍼로 다시 실행해도 같은 실행 값을 이어받음 (안내가 그 실행 것으로 맞음)', () => {
  const s = fakeHarness(LAUNCH_CLAUDE);
  const f = path.join(s.data, 'launch.log');
  runHarness(s, ['-p', 'x'], { LAUNCH_LOG: f, FAKE_UPDATE: 'update' });
  const l = launches(f);
  const v = l[0].split(' ')[1];
  assert.deepStrictEqual(l, [`update ${v}`, `new-wrapper ${v}`]);
});

test('악성: 밖에서 넘어온 GUGBAB_LAUNCH 는 쓰지 않고 새로 만듦 (다른 실행의 기록을 가로채지 않음)', () => {
  const s = fakeHarness(LAUNCH_CLAUDE);
  const f = path.join(s.data, 'launch.log');
  runHarness(s, ['-p', 'x'], { LAUNCH_LOG: f, GUGBAB_LAUNCH: '1-1' });
  const l = launches(f);
  assert.ok(!l.some(x => x.endsWith(' 1-1')), l.join('|'));
});

test('경계: 하위 명령(status 등)은 실행 값을 만들지 않음', () => {
  const s = fakeHarness(LAUNCH_CLAUDE);
  const f = path.join(s.data, 'launch.log');
  runHarness(s, ['status'], { LAUNCH_LOG: f });
  assert.deepStrictEqual(launches(f), []);
});

// ── 터미널에서는 claude 가 자기 프로세스 그룹으로 앞에 선다 (2026-10-19 결정 38 — comux·tmux 에이전트 감지) ──
// 가상 터미널(python3 pty)에서 래퍼를 띄운다. 래퍼가 멈추면(Ctrl+Z) 부모 셸처럼 SIGCONT 로 깨운다(= fg)
const DASH = ['/bin/dash', '/usr/bin/dash'].find((d) => { try { fs.accessSync(d, fs.constants.X_OK); return true; } catch { return false; } });
const PY = spawnSync('python3', ['-c', 'import pty'], { encoding: 'utf8' }).status === 0;
const ptyOpts = { skip: !(DASH && PY) && 'python3 pty 또는 dash 없음' };
const PTY_RUN = `
import os, pty, sys, time, signal, select, json
cwd = sys.argv[1]; cmd = sys.argv[2:]
pid, fd = pty.fork()
if pid == 0:
    os.chdir(cwd); os.execvp(cmd[0], cmd)
stopped = 0; out = b''; status = None; deadline = time.time() + 30
def drain():
    global out
    while True:
        r, _, _ = select.select([fd], [], [], 0.05)
        if not r: return
        try:
            b = os.read(fd, 65536)
        except OSError:
            return
        if not b: return
        out += b
while True:
    drain()
    w, st = os.waitpid(pid, os.WUNTRACED | os.WNOHANG)
    if w:
        if os.WIFSTOPPED(st):
            stopped += 1
            if stopped > 3:
                os.killpg(pid, 9); status = 'stuck'; break
            time.sleep(0.1); os.killpg(pid, signal.SIGCONT); continue
        status = os.WEXITSTATUS(st) if os.WIFEXITED(st) else -os.WTERMSIG(st); break
    if time.time() > deadline:
        os.killpg(pid, 9); status = 'timeout'; break
drain()
print(json.dumps({'stopped': stopped, 'status': status, 'out': out.decode('utf8', 'replace')}))
`;
function runTty(s, args, env = {}) {
  const r = spawnSync('python3', ['-I', '-c', PTY_RUN, s.proj, 'sh', BIN, ...args], { encoding: 'utf8', timeout: 60000,
    env: { ...process.env, HOME: s.home, GUGBAB_HOME: REPO, GUGBAB_DATA: s.data, GUGBAB_NO_FIRST_RUN: '1', PATH: `${s.fakeBin}:${process.env.PATH}`, LOG: s.log, ...env } });
  assert.strictEqual(r.status, 0, r.stderr);
  return JSON.parse(r.stdout.trim().split('\n').pop());
}
// 가짜 claude: 자기 pid·프로세스 그룹·터미널 앞 그룹을 남긴다
const PG_CLAUDE = 'echo "pid=$$ pgid=$(ps -o pgid= -p $$ | tr -d " ") tpgid=$(ps -o tpgid= -p $$ | tr -d " ")" >> "$LOG"';
const pg = (line) => Object.fromEntries(line.split(' ').map((kv) => kv.split('=')));

test('정상: 터미널에서는 claude 가 자기 프로세스 그룹 대표로 터미널 앞에 섬 (멀티플렉서가 claude 로 감지)', ptyOpts, () => {
  const s = setup(`${PG_CLAUDE}; exit 3`);
  const r = runTty(s, ['--model', 'opus']);
  assert.strictEqual(r.status, 3, r.out);
  const p = pg(calls(s)[0]);
  assert.strictEqual(p.pgid, p.pid, calls(s)[0]);
  assert.strictEqual(p.tpgid, p.pid, calls(s)[0]);
});

test('정상: claude 가 Ctrl+Z 로 멈추면 래퍼도 멈추고, fg 로 깨우면 claude 가 이어서 돎', ptyOpts, () => {
  const s = setup('if [ ! -f "$LOG.s" ]; then : > "$LOG.s"; kill -TSTP 0; fi; echo resumed >> "$LOG"; exit 7');
  const r = runTty(s, []);
  assert.strictEqual(r.stopped, 1, '래퍼가 한 번 멈춰 부모 셸로 돌아감');
  assert.strictEqual(r.status, 7, r.out);
  assert.deepStrictEqual(calls(s), ['resumed']);
});

test('정상: 터미널에서도 재시작 표시가 있으면 --continue 로 한 번 더', ptyOpts, () => {
  const s = setup([
    'echo "args=$*" >> "$LOG"',
    'if [ ! -f "$LOG.once" ]; then touch "$LOG.once"; touch "$CLAUDE_CONFIG_DIR/.gugbab-restart"; fi',
  ].join('\n'));
  const r = runTty(s, ['--model', 'opus']);
  assert.strictEqual(r.status, 0, r.out);
  assert.deepStrictEqual(calls(s), ['args=--model opus', 'args=--continue']);
});

test('악성: 터미널 경로에서도 셸 문자가 든 인자를 해석하지 않고 그대로 넘김', ptyOpts, () => {
  const s = setup('for a in "$@"; do echo "[$a]" >> "$LOG"; done');
  const pwn = path.join(s.data, 'pwned');
  runTty(s, [`$(touch ${pwn})`, '"q" ; x', '`id`']);
  assert.deepStrictEqual(calls(s), [`[$(touch ${pwn})]`, '["q" ; x]', '[`id`]']);
  assert.ok(!fs.existsSync(pwn));
});

test('악성: PATH 앞의 가짜 dash 는 쓰지 않음 (고정 경로만)', ptyOpts, () => {
  const s = setup(`${PG_CLAUDE}`);
  fs.writeFileSync(path.join(s.fakeBin, 'dash'), '#!/bin/sh\necho fake-dash >> "$LOG"\nexit 99\n');
  fs.chmodSync(path.join(s.fakeBin, 'dash'), 0o755);
  const r = runTty(s, []);
  assert.strictEqual(r.status, 0, r.out);
  assert.ok(!calls(s).includes('fake-dash'), calls(s).join('|'));
  assert.strictEqual(calls(s).length, 1);
});

test('악성: 밖에서 넘어온 GUGBAB_JC 로 작업 제어 경로를 흉내 내지 못하고 claude 에도 새지 않음', ptyOpts, () => {
  const s = setup('echo "jc=[${GUGBAB_JC-unset}]" >> "$LOG"; exit 146');
  const r = run(s, [], { GUGBAB_JC: '1' }); // 터미널 아님 → sh 경로
  assert.strictEqual(r.status, 146);
  assert.deepStrictEqual(calls(s), ['jc=[unset]']);
  fs.rmSync(s.log);
  const t = runTty(s, [], { GUGBAB_JC: '1' });
  assert.strictEqual(t.status, 146, t.out);
  assert.deepStrictEqual(calls(s), ['jc=[unset]']);
});

test('경계: claude 가 진짜로 146(정지 신호 번호)으로 끝나도 정지로 오해해 멈추지 않음', ptyOpts, () => {
  const s = setup('exit 146');
  const r = runTty(s, []);
  assert.strictEqual(r.stopped, 0);
  assert.strictEqual(r.status, 146);
});

test('경계: GUGBAB_JOBCTL=0 이면 예전처럼 래퍼와 같은 그룹 (탈출구)', ptyOpts, () => {
  const s = setup(PG_CLAUDE);
  const r = runTty(s, [], { GUGBAB_JOBCTL: '0' });
  assert.strictEqual(r.status, 0, r.out);
  const p = pg(calls(s)[0]);
  assert.notStrictEqual(p.pgid, p.pid, calls(s)[0]);
});

test('경계: -p(한 번 실행)는 터미널이어도 작업 제어 없이 (파이프·스크립트 동작 그대로)', ptyOpts, () => {
  const s = setup(PG_CLAUDE);
  const r = runTty(s, ['-p', 'x']);
  assert.strictEqual(r.status, 0, r.out);
  const p = pg(calls(s)[0]);
  assert.notStrictEqual(p.pgid, p.pid, calls(s)[0]);
});

test('경계: 터미널이 아니면(파이프) 작업 제어 없이 — 경고 문구 없이 예전처럼', () => {
  const s = setup(PG_CLAUDE);
  const r = run(s, []);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(!/job control|tty/i.test(r.stderr), r.stderr);
  const p = pg(calls(s)[0]);
  assert.notStrictEqual(p.pgid, p.pid, calls(s)[0]);
});
