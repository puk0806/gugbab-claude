// bin/gugbab-claude — 실행 래퍼 (가짜 claude 를 PATH 에 두고 시험)
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.resolve(__dirname, '..');
const BIN = path.join(REPO, 'bin', 'gugbab-claude');
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
const NEW_WRAPPER = '#!/bin/sh\necho "new-wrapper reexec=[$GUGBAB_REEXEC] dev=[$GUGBAB_DEV]" >> "$LOG"\nfor a in "$@"; do echo "[$a]" >> "$LOG"; done\n';
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
  for (const k of ['GUGBAB_HOME', 'GUGBAB_DEV', 'GUGBAB_REEXEC', 'GUGBAB_WRAPPER_REV', 'CLAUDE_CONFIG_DIR']) if (!(k in extra)) delete env[k];
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
