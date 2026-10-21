// launch.js — 윈도우 래퍼(Node). 실제 프로세스로 띄워 임시 HOME·데이터 폴더에서 시험한다 (맥에서도 돈다)
// 정상 / 악성·우회 / 경계 3계층. claude 대신 GUGBAB_CLAUDE_BIN 의 가짜 스크립트가 받은 인자·환경을 기록한다
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { cmdQuote, CMD_UNSAFE } = require('./launch');

const tmp = (p) => fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), p)));
const w = (f, s = '') => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

// 가짜 하네스 코드 폴더 — 실제 cli/*.js 를 복사하고 작은 manifest 를 둔다
function setup() {
  const code = tmp('ln-code-');
  fs.mkdirSync(path.join(code, 'cli'));
  for (const f of fs.readdirSync(__dirname)) if (f.endsWith('.js') && !f.endsWith('.test.js')) fs.copyFileSync(path.join(__dirname, f), path.join(code, 'cli', f));
  for (const f of ['.claude/rules/git.md', '.claude/skills/react-core/SKILL.md', '.claude/CLAUDE.common.md']) w(path.join(code, f), 'x');
  w(path.join(code, 'manifest.json'), JSON.stringify({
    items: {
      'rule:git.md': { type: 'rule', state: 'on', path: '.claude/rules/git.md' },
      'skill:react-core': { type: 'skill', state: 'on', path: '.claude/skills/react-core' },
      'setting:claude-md': { type: 'setting', state: 'lock', key: 'claudeMd', path: '.claude/CLAUDE.common.md' },
    },
    hookOrder: {}, relations: { bundles: {}, presets: {} }, base: {},
  }));
  const home = tmp('ln-home-');
  for (const d of ['projects', 'plugins', 'plans']) fs.mkdirSync(path.join(home, '.claude', d), { recursive: true });
  const data = tmp('ln-data-');
  const proj = tmp('ln-proj-');
  const log = path.join(tmp('ln-log-'), 'calls.jsonl');
  // 가짜 claude — 인자·환경을 한 줄로 기록. RESTART_ONCE 면 첫 호출에 재시작 표시를 남긴다. EXIT 로 종료 코드
  const fake = path.join(tmp('ln-bin-'), 'fake-claude.js');
  w(fake, `const fs=require('fs'),path=require('path');
const e=process.env;
fs.appendFileSync(e.LOG, JSON.stringify({argv:process.argv.slice(2),cfg:e.CLAUDE_CONFIG_DIR,ss:Object.prototype.hasOwnProperty.call(e,'CLAUDE_SECURESTORAGE_CONFIG_DIR')?e.CLAUDE_SECURESTORAGE_CONFIG_DIR:null,rev:e.GUGBAB_WRAPPER_REV||null,dev:e.GUGBAB_DEV,home:e.GUGBAB_HOME,launch:e.GUGBAB_LAUNCH||null,reexec:e.GUGBAB_REEXEC||null,path:e.PATH||e.Path||''})+'\\n');
if(e.RESTART_ONCE&&!fs.existsSync(e.LOG+'.once')){fs.writeFileSync(e.LOG+'.once','');fs.writeFileSync(path.join(e.CLAUDE_CONFIG_DIR,'.gugbab-restart'),'');}
process.exit(Number(e.EXIT||0));`);
  return { code, home, data, proj, log, fake };
}
function run(s, args, extra = {}) {
  const env = { ...process.env, HOME: s.home, USERPROFILE: s.home, GUGBAB_HOME: s.code, GUGBAB_DATA: s.data, GUGBAB_CLAUDE_BIN: s.fake, LOG: s.log, ...extra };
  for (const k of ['CLAUDE_CONFIG_DIR', 'CLAUDE_SECURESTORAGE_CONFIG_DIR', 'GUGBAB_DEV', 'GUGBAB_REEXEC', 'GUGBAB_LAUNCH']) if (!(k in extra)) delete env[k];
  return spawnSync(process.execPath, [path.join(s.code, 'cli', 'launch.js'), ...args], { cwd: s.proj, env, encoding: 'utf8', timeout: 60000 });
}
const calls = (s) => (fs.existsSync(s.log) ? fs.readFileSync(s.log, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : []);

test('정상: 조립한 설정 폴더 + 빈 로그인 공유 변수로 claude 실행, 인자·종료 코드 그대로', () => {
  const s = setup();
  const r = run(s, ['--model', 'haiku', '한글 인자', 'with space'], { EXIT: '7' });
  assert.strictEqual(r.status, 7, r.stderr);
  const c = calls(s);
  assert.strictEqual(c.length, 1);
  assert.deepStrictEqual(c[0].argv, ['--model', 'haiku', '한글 인자', 'with space']);
  assert.strictEqual(c[0].cfg, path.join(s.data, 'projects', path.basename(s.proj), '.claude'));
  assert.strictEqual(c[0].ss, '', '빈 값으로 넘어가야 기본 로그인을 공유');
  assert.strictEqual(c[0].dev, '1');
  assert.ok(c[0].path.startsWith(path.join(s.code, 'bin') + path.delimiter), '하네스 bin 이 PATH 맨 앞');
  assert.ok(c[0].rev, 'GUGBAB_WRAPPER_REV 설정');
  assert.ok(fs.existsSync(path.join(c[0].cfg, 'skills', 'react-core', 'SKILL.md')), '켜진 스킬이 설정 폴더에 연결됨');
});

test('정상: 하위 명령(status)은 claude 없이 main.js 로', () => {
  const s = setup();
  const r = run(s, ['status']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(calls(s).length, 0);
  assert.match(r.stdout, /rule:git\.md|프로젝트|켬/);
});

test('정상: 세션이 재시작 표시를 남기면 --continue 로 다시 띄움', () => {
  const s = setup();
  const r = run(s, ['첫 질문'], { RESTART_ONCE: '1' });
  assert.strictEqual(r.status, 0, r.stderr);
  const c = calls(s);
  assert.strictEqual(c.length, 2);
  assert.deepStrictEqual(c[1].argv, ['--continue']);
  assert.match(r.stderr, /다시 시작/);
  assert.ok(!fs.existsSync(path.join(c[0].cfg, '.gugbab-restart')), '표시는 지워짐');
});

test('경계: -p(한 번 실행)는 재시작 표시가 있어도 다시 띄우지 않음', () => {
  const s = setup();
  const r = run(s, ['-p', 'hi'], { RESTART_ONCE: '1' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(calls(s).length, 1);
  assert.match(r.stderr, /다음 실행부터/);
});

test('악성: cmd 가 해석하는 글자(" % & | ^ !)가 든 인자도 셸 없이 그대로 전달', () => {
  const s = setup();
  const nasty = ['a"b', '%PATH%', 'x & del C:\\', 'a|b', '^c', '!x!', '$(whoami)', '`id`'];
  const r = run(s, ['-p', ...nasty]);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.deepStrictEqual(calls(s)[0].argv, ['-p', ...nasty]);
});

test('악성: GUGBAB_CLAUDE_BIN 이 상대 경로·없는 파일이면 실행하지 않고 127', () => {
  const s = setup();
  for (const v of ['fake-claude.js', path.join(s.proj, 'no-such.exe')]) {
    const r = run(s, ['-p', 'x'], { GUGBAB_CLAUDE_BIN: v, PATH: '', Path: '' });
    assert.strictEqual(r.status, 127, `${v}: ${r.stderr}`);
  }
  assert.strictEqual(calls(s).length, 0);
});

test('악성: 바깥에서 물려받은 CLAUDE_CONFIG_DIR·로그인 변수는 조립한 값으로 덮임', () => {
  const s = setup();
  const r = run(s, ['-p', 'x'], { CLAUDE_CONFIG_DIR: path.join(s.home, 'evil'), CLAUDE_SECURESTORAGE_CONFIG_DIR: path.join(s.home, 'evil') });
  assert.strictEqual(r.status, 0, r.stderr);
  const c = calls(s)[0];
  assert.strictEqual(c.cfg, path.join(s.data, 'projects', path.basename(s.proj), '.claude'));
  assert.strictEqual(c.ss, '');
});

test('악성: cmd 셸로 넘길 때 위험 글자 판정·따옴표', () => {
  for (const a of ['a"b', '%x%', 'a&b', 'a|b', 'a^b', 'a<b', 'a>b', '!x', 'a\nb']) assert.ok(CMD_UNSAFE.test(a), a);
  for (const a of ['--model', 'haiku', 'C:\\x y\\z', '한글']) assert.ok(!CMD_UNSAFE.test(a), a);
  assert.strictEqual(cmdQuote('C:\\x y'), '"C:\\x y"');
  assert.strictEqual(cmdQuote(''), '""');
  assert.strictEqual(cmdQuote('--print'), '--print');
});

test('경계: 조립 실패(깨진 manifest)면 claude 를 띄우지 않고 1', () => {
  const s = setup();
  fs.writeFileSync(path.join(s.code, 'manifest.json'), '{broken');
  const r = run(s, ['-p', 'x']);
  assert.strictEqual(r.status, 1);
  assert.strictEqual(calls(s).length, 0);
  assert.match(r.stderr, /조립 실패|manifest/);
});

test('경계: --raw 는 조립 없이 claude 만 (설정 폴더 변수 없음)', () => {
  const s = setup();
  const r = run(s, ['--raw', '-p', 'x']);
  assert.strictEqual(r.status, 0, r.stderr);
  const c = calls(s)[0];
  assert.deepStrictEqual(c.argv, ['-p', 'x']);
  assert.ok(!c.cfg);
  assert.ok(!fs.existsSync(path.join(s.data, 'projects')), '조립하지 않음');
});

// ── 업데이트 후 다시 실행·실행 값·모드 판정 (bin.test.js 의 sh 래퍼 시험을 옮김) ──
// self-update 만 가짜로 — SU_EXIT 로 종료 코드(10 = 갱신됨), 받은 실행 값을 기록. 나머지 하위 명령은 진짜 main.js
function stubSelfUpdate(s) {
  fs.renameSync(path.join(s.code, 'cli', 'main.js'), path.join(s.code, 'cli', 'main-real.js'));
  w(path.join(s.code, 'cli', 'main.js'), `const fs=require('fs');
if(process.argv[2]==='self-update'){fs.appendFileSync(process.env.LOG,JSON.stringify({su:true,launch:process.env.GUGBAB_LAUNCH||null,reexec:process.env.GUGBAB_REEXEC||null})+'\\n');process.exit(Number(process.env.SU_EXIT||0));}
require('./main-real.js');`);
}
const claudeCalls = (s) => calls(s).filter(c => !c.su);
const suCalls = (s) => calls(s).filter(c => c.su);

test('정상: 업데이트되면(10) 새 래퍼로 한 번 다시 실행 — 인자 그대로, claude 는 한 번, 다시 실행 표시는 claude 로 새지 않음', () => {
  const s = setup(); stubSelfUpdate(s);
  const r = run(s, ['-p', 'a b'], { SU_EXIT: '10' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(suCalls(s).length, 1, '다시 실행된 쪽은 업데이트를 건너뜀 (무한 반복 없음)');
  const c = claudeCalls(s);
  assert.strictEqual(c.length, 1);
  assert.deepStrictEqual(c[0].argv, ['-p', 'a b']);
  assert.strictEqual(c[0].reexec, null);
});

test('정상: 실행마다 새 실행 값 — self-update 와 claude 가 같은 값, 다시 실행해도 이어받음', () => {
  const s = setup(); stubSelfUpdate(s);
  run(s, ['-p', 'x'], { SU_EXIT: '10' });
  const [su] = suCalls(s); const [c] = claudeCalls(s);
  assert.match(su.launch, /^\d+-\d+$/);
  assert.strictEqual(c.launch, su.launch);
  run(s, ['-p', 'y']);
  assert.notStrictEqual(suCalls(s)[1].launch, su.launch, '다음 실행은 새 값');
});

test('악성: 밖에서 넘어온 GUGBAB_LAUNCH 는 쓰지 않고 새로 만듦 (다른 실행의 기록을 가로채지 않음)', () => {
  const s = setup(); stubSelfUpdate(s);
  run(s, ['-p', 'x'], { GUGBAB_LAUNCH: '1-1' });
  assert.notStrictEqual(suCalls(s)[0].launch, '1-1');
  assert.strictEqual(claudeCalls(s)[0].launch, suCalls(s)[0].launch);
});

test('악성: 밖에서 넘어온 GUGBAB_REEXEC 는 claude 로 새지 않고, 1 이 아닌 값이면 업데이트를 그대로 확인', () => {
  const s = setup(); stubSelfUpdate(s);
  run(s, ['-p', 'x'], { GUGBAB_REEXEC: 'yes' });
  assert.strictEqual(suCalls(s).length, 1);
  assert.strictEqual(claudeCalls(s)[0].reexec, null);
});

test('악성: GUGBAB_DEV=0 과 엉뚱한 GUGBAB_HOME 이 같이 와도 그 경로를 쓰지 않고 자기 위치 (배포 모드)', () => {
  const s = setup();
  const r = run(s, ['-p', 'x'], { GUGBAB_DEV: '0', GUGBAB_HOME: path.join(s.proj, 'evil') });
  assert.strictEqual(r.status, 0, r.stderr);
  const c = claudeCalls(s)[0];
  assert.strictEqual(c.home, s.code);
  assert.strictEqual(c.dev, '0');
});

test('정상: 개발 모드로 띄운 세션 안에서 다시 부르면 개발 모드 그대로', () => {
  const s = setup();
  run(s, ['-p', 'x'], { GUGBAB_DEV: '1' });
  assert.strictEqual(claudeCalls(s)[0].dev, '1');
});

test('경계: 업데이트 확인이 죽어도(오류 종료) 세션은 그대로 뜸', () => {
  const s = setup(); stubSelfUpdate(s);
  const r = run(s, ['-p', 'x'], { SU_EXIT: '3' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(claudeCalls(s).length, 1);
});

test('경계: 하위 명령(status)과 --raw 는 업데이트를 확인하지 않음', () => {
  const s = setup(); stubSelfUpdate(s);
  run(s, ['status'], { SU_EXIT: '10' });
  run(s, ['--raw', '-p', 'x'], { SU_EXIT: '10' });
  assert.strictEqual(suCalls(s).length, 0);
});

test('경계: 윈도우 — MSYS 표기 GUGBAB_HOME(/c/…)도 같은 하네스로', { skip: process.platform !== 'win32' && '윈도우 전용' }, () => {
  const s = setup();
  const msys = '/' + s.code[0].toLowerCase() + s.code.slice(2).replace(/\\/g, '/');
  const r = run(s, ['-p', 'x'], { GUGBAB_HOME: msys });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(calls(s)[0].home.toLowerCase(), s.code.toLowerCase());
});
