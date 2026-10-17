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
