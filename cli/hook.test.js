// hook.js — 훅 디스패처 (이벤트마다 하나만 연결, 켜진 훅을 순서대로 실행하고 결과를 합친다)
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const HOOK = path.join(__dirname, 'hook.js');
const tmp = (p) => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), p)));
const w = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

const HOOKS = {
  allow: `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'PreToolUse',permissionDecision:'allow'}}))`,
  ask: `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'PreToolUse',permissionDecision:'ask',permissionDecisionReason:'ASK-R'}}))`,
  deny: `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'PreToolUse',permissionDecision:'deny',permissionDecisionReason:'DENY-R'}}))`,
  block: `const d=JSON.parse(require('fs').readFileSync(0,'utf8'));if(d.tool_name==='Bash'){process.stderr.write('BLOCKED-BY-HOOK');process.exit(2)}`,
  mark: `require('fs').writeFileSync(process.env.MARK_FILE,'ran')`,
  ctx1: `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'UserPromptSubmit',additionalContext:'CTX-ONE'}}))`,
  ctx2: `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'UserPromptSubmit',additionalContext:'CTX-TWO'}}))`,
  plain: `process.stdout.write('PLAIN-TEXT')`,
  crash: `throw new Error('boom')`,
  slow: `setTimeout(()=>{},5000)`,
  env: `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'UserPromptSubmit',additionalContext:'ENABLED='+process.env.GUGBAB_ENABLED+' STATE='+process.env.GUGBAB_STATE_DIR}}))`,
  stopblock: `process.stdout.write(JSON.stringify({decision:'block',reason:'STOP-R'}))`,
};

function setup(order, extraItems = {}) {
  const code = tmp('hk-code-');
  for (const [n, src] of Object.entries(HOOKS)) w(path.join(code, '.claude/hooks', `${n}.js`), src);
  const items = {};
  for (const n of Object.keys(HOOKS)) items[`hook:${n}`] = { type: 'hook', state: 'on', path: `.claude/hooks/${n}.js` };
  Object.assign(items, extraItems);
  w(path.join(code, 'manifest.json'), JSON.stringify({ items, hookOrder: order, relations: {} }));
  const data = tmp('hk-data-');
  const cfg = path.join(data, 'projects', 'p', '.claude');
  fs.mkdirSync(cfg, { recursive: true });
  const proj = tmp('hk-proj-');
  w(path.join(cfg, '.gugbab-state.json'), JSON.stringify({ projectRoot: proj, skippedHooks: [] }));
  return { code, data, cfg, proj };
}
function run(s, event, input, env = {}) {
  const r = spawnSync(process.execPath, [HOOK, event], {
    input: typeof input === 'string' ? input : JSON.stringify(input), encoding: 'utf8', timeout: 20000,
    env: { ...process.env, GUGBAB_HOME: s.code, GUGBAB_DATA: s.data, CLAUDE_CONFIG_DIR: s.cfg, CLAUDE_PROJECT_DIR: s.proj, ...env },
  });
  let json = null; try { json = JSON.parse(r.stdout); } catch { /* 일반 텍스트 */ }
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, json };
}
const H = (id, matcher = '*', extra = {}) => ({ id: `hook:${id}`, matcher, args: [], ...extra });
const pre = (tool = 'Read') => ({ hook_event_name: 'PreToolUse', tool_name: tool, tool_input: {} });

test('정상: 결정 합치기 deny > ask > allow, 이유는 이긴 쪽', () => {
  const s = setup({ PreToolUse: [H('allow'), H('ask'), H('deny')] });
  const r = run(s, 'PreToolUse', pre());
  assert.strictEqual(r.code, 0);
  assert.strictEqual(r.json.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(r.json.hookSpecificOutput.permissionDecisionReason, /DENY-R/);
  const s2 = setup({ PreToolUse: [H('allow'), H('ask')] });
  assert.strictEqual(run(s2, 'PreToolUse', pre()).json.hookSpecificOutput.permissionDecision, 'ask');
});

test('정상: exit 2 → 즉시 차단, stderr 전달, 뒤 훅은 실행 안 함', () => {
  const s = setup({ PreToolUse: [H('block'), H('mark')] });
  const mark = path.join(s.data, 'mark');
  const r = run(s, 'PreToolUse', pre('Bash'), { MARK_FILE: mark });
  assert.strictEqual(r.code, 2);
  assert.match(r.stderr, /BLOCKED-BY-HOOK/);
  assert.ok(!fs.existsSync(mark));
  assert.strictEqual(run(s, 'PreToolUse', pre('Read'), { MARK_FILE: mark }).code, 0);
  assert.ok(fs.existsSync(mark));
});

test('정상: 안내(additionalContext)·일반 출력은 이어붙인다', () => {
  const s = setup({ UserPromptSubmit: [H('ctx1', ''), H('plain', ''), H('ctx2', '')] });
  const r = run(s, 'UserPromptSubmit', { hook_event_name: 'UserPromptSubmit', prompt: 'hi' });
  const ctx = r.json.hookSpecificOutput.additionalContext;
  assert.ok(ctx.includes('CTX-ONE') && ctx.includes('CTX-TWO') && ctx.includes('PLAIN-TEXT'), ctx);
  assert.strictEqual(r.json.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
});

test('정상: Stop 의 decision:block 전달', () => {
  const s = setup({ Stop: [H('plain', ''), H('stopblock', '')] });
  const r = run(s, 'Stop', { hook_event_name: 'Stop' });
  assert.strictEqual(r.json.decision, 'block');
  assert.match(r.json.reason, /STOP-R/);
});

test('정상: matcher — Write|Edit 훅은 Bash 에서 안 돈다', () => {
  const s = setup({ PreToolUse: [H('mark', 'Write|Edit')] });
  const mark = path.join(s.data, 'mark');
  run(s, 'PreToolUse', pre('Bash'), { MARK_FILE: mark });
  assert.ok(!fs.existsSync(mark));
  run(s, 'PreToolUse', pre('Edit'), { MARK_FILE: mark });
  assert.ok(fs.existsSync(mark));
});

test('정상: /harness 로 끈 훅은 바로 안 돈다, 고정 훅은 꺼도 돈다', () => {
  const s = setup({ PreToolUse: [H('mark')] });
  const mark = path.join(s.data, 'mark');
  w(path.join(s.data, 'projects', 'p', 'settings.json'), JSON.stringify({ disable: ['hook:mark'] }));
  run(s, 'PreToolUse', pre(), { MARK_FILE: mark });
  assert.ok(!fs.existsSync(mark), '끈 훅');
  const m = JSON.parse(fs.readFileSync(path.join(s.code, 'manifest.json'), 'utf8'));
  m.items['hook:mark'].state = 'lock';
  fs.writeFileSync(path.join(s.code, 'manifest.json'), JSON.stringify(m));
  run(s, 'PreToolUse', pre(), { MARK_FILE: mark });
  assert.ok(fs.existsSync(mark), '고정 훅');
});

test('정상: 켜진 목록을 GUGBAB_ENABLED 로 넘기고, 프로젝트가 직접 연결한 훅(skippedHooks)은 건너뜀', () => {
  const s = setup({ UserPromptSubmit: [H('env', ''), H('ctx1', '')] });
  w(path.join(s.cfg, '.gugbab-state.json'), JSON.stringify({ projectRoot: s.proj, skippedHooks: ['hook:ctx1'] }));
  const ctx = run(s, 'UserPromptSubmit', { hook_event_name: 'UserPromptSubmit' }).json.hookSpecificOutput.additionalContext;
  assert.match(ctx, /ENABLED=.*hook:env/);
  assert.ok(!ctx.includes('CTX-ONE'));
  // 상태 폴더(<데이터>/state)도 넘긴다 — claude-version-check 가 버전 기록을 래퍼 데이터 폴더에 둠
  assert.ok(ctx.includes(`STATE=${path.join(s.data, 'state')}`), ctx);
});

test('악성: manifest 경로가 hooks 폴더 밖이면 실행하지 않고 기록', () => {
  const s = setup({ PreToolUse: [H('evil')] }, { 'hook:evil': { type: 'hook', state: 'on', path: '../../../tmp/evil.js' } });
  const evil = path.join(os.tmpdir(), 'evil.js');
  fs.writeFileSync(evil, `require('fs').writeFileSync(process.env.MARK_FILE,'ran')`);
  const mark = path.join(s.data, 'mark');
  const r = run(s, 'PreToolUse', pre(), { MARK_FILE: mark });
  assert.ok(!fs.existsSync(mark));
  assert.match(fs.readFileSync(path.join(s.data, 'logs', 'hook-errors.log'), 'utf8'), /hook:evil/);
  assert.strictEqual(r.code, 0);
  fs.rmSync(evil, { force: true });
});

test('악성: hooks 폴더 안 링크가 밖을 가리켜도 실행하지 않음', (t) => {
  const s = setup({ PreToolUse: [H('mark')] });
  const out = tmp('hk-out-');
  fs.writeFileSync(path.join(out, 'x.js'), `require('fs').writeFileSync(process.env.MARK_FILE,'ran')`);
  fs.rmSync(path.join(s.code, '.claude/hooks/mark.js'));
  if (require('../.claude/hooks/lib/testfs').trySymlink(path.join(out, 'x.js'), path.join(s.code, '.claude/hooks/mark.js')) === null) return t.skip('윈도우 심볼릭 링크 권한 없음');
  const mark = path.join(s.data, 'mark');
  run(s, 'PreToolUse', pre(), { MARK_FILE: mark });
  assert.ok(!fs.existsSync(mark));
});

test('악성: 래퍼 데이터 폴더 밖 CLAUDE_CONFIG_DIR 의 설정으로 훅을 끌 수 없다 (기본값 사용)', () => {
  const s = setup({ PreToolUse: [H('mark')] });
  // 데이터 폴더 구조(<x>/settings.json + <x>/.claude)를 흉내 낸 다른 곳
  const fakeProj = tmp('hk-fake-');
  w(path.join(fakeProj, 'settings.json'), JSON.stringify({ disable: ['hook:mark'] }));
  const fake = path.join(fakeProj, '.claude');
  fs.mkdirSync(fake);
  const mark = path.join(s.data, 'mark');
  run(s, 'PreToolUse', pre(), { MARK_FILE: mark, CLAUDE_CONFIG_DIR: fake });
  assert.ok(fs.existsSync(mark));
});

test('경계: 훅 크래시·시간 초과는 기록만 하고 다음 훅은 계속 (차단 아님)', () => {
  const s = setup({ PreToolUse: [H('crash'), H('slow', '*', { timeout: 1 }), H('deny')] });
  const r = run(s, 'PreToolUse', pre());
  assert.strictEqual(r.code, 0);
  assert.strictEqual(r.json.hookSpecificOutput.permissionDecision, 'deny');
  const log = fs.readFileSync(path.join(s.data, 'logs', 'hook-errors.log'), 'utf8');
  assert.match(log, /hook:crash/);
  assert.match(log, /hook:slow.*시간 초과/);
});

test('경계: 빈 stdin·깨진 JSON 이어도 크래시 없이 동작', () => {
  const s = setup({ PreToolUse: [H('allow')] });
  assert.strictEqual(run(s, 'PreToolUse', '').code, 0);
  assert.strictEqual(run(s, 'PreToolUse', '{broken').code, 0);
});

test('경계: manifest 를 못 읽으면 도구 이벤트는 막고(안전), 그 밖은 통과', () => {
  const s = setup({ PreToolUse: [H('allow')] });
  fs.writeFileSync(path.join(s.code, 'manifest.json'), '{broken');
  const r = run(s, 'PreToolUse', pre());
  assert.strictEqual(r.code, 2);
  assert.match(r.stderr, /manifest/);
  assert.strictEqual(run(s, 'Stop', { hook_event_name: 'Stop' }).code, 0);
});

test('경계: 이벤트 인자가 없거나 이상하면 아무것도 안 하고 통과', () => {
  const s = setup({ PreToolUse: [H('allow')] });
  for (const ev of ['', '../x', 'Pre ToolUse']) {
    const r = spawnSync(process.execPath, [HOOK, ev], { input: '{}', encoding: 'utf8', env: { ...process.env, GUGBAB_HOME: s.code, GUGBAB_DATA: s.data } });
    assert.strictEqual(r.status, 0, ev);
    assert.strictEqual(r.stdout, '');
  }
});
