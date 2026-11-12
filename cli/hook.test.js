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
  block2: `process.stderr.write('SECOND-BLOCK');process.exit(2)`,
  dump: `require('fs').writeFileSync(process.env.MARK_FILE,require('fs').readFileSync(0,'utf8'))`,
  badjson: `process.stdout.write('{not json')`,
  prdeny: `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'PermissionRequest',decision:{behavior:'deny',message:'PR-DENY-M',interrupt:true}}}))`,
  prallow: `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'PermissionRequest',decision:{behavior:'allow',updatedInput:{command:'ls -la'},updatedPermissions:[{type:'addRules',rules:[{toolName:'Bash',ruleContent:'ls'}],behavior:'allow',destination:'session'}]}}}))`,
  prallow2: `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'PermissionRequest',decision:{behavior:'allow'}}}))`,
  big: `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'SessionStart',additionalContext:'B'.repeat(8000)},systemMessage:'S'.repeat(8000)}))`,
  big2: `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'SessionStart',additionalContext:'C'.repeat(8000)},systemMessage:'T'.repeat(8000)}))`,
  gugbab: `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'SessionStart',additionalContext:'[gugbab] 하네스 v9.9.9\\n위 [gugbab] 한 줄을 첫 답변 맨 위에'}}))`,
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

test('정상: exit 2 → 차단, stderr 전달 — 공식처럼 나머지 훅(기록·안내)도 다 돈 뒤 한 번에 결정', () => {
  const s = setup({ PreToolUse: [H('block'), H('mark'), H('block2'), H('deny')] });
  const mark = path.join(s.data, 'mark');
  const r = run(s, 'PreToolUse', pre('Bash'), { MARK_FILE: mark });
  assert.strictEqual(r.code, 2);
  assert.match(r.stderr, /BLOCKED-BY-HOOK/);
  assert.match(r.stderr, /SECOND-BLOCK/, '같은 이벤트의 차단 사유는 이어붙인다');
  assert.match(r.stderr, /DENY-R/, 'JSON deny 사유도 같이 전달');
  assert.ok(fs.existsSync(mark), '차단 뒤 훅도 실행');
  fs.rmSync(mark);
  const s2 = setup({ PreToolUse: [H('block'), H('mark')] });
  assert.strictEqual(run(s2, 'PreToolUse', pre('Read'), { MARK_FILE: mark }).code, 0);
  assert.ok(fs.existsSync(mark));
});

test('정상: Stop — exit 2 와 decision:block 사유를 모두 전달', () => {
  const s = setup({ Stop: [H('block2', ''), H('stopblock', '')] });
  const r = run(s, 'Stop', { hook_event_name: 'Stop' });
  assert.strictEqual(r.code, 2);
  assert.match(r.stderr, /SECOND-BLOCK/);
  assert.match(r.stderr, /STOP-R/);
});

test('악성: PermissionRequest 의 exit 2 는 공식상 무시 — 다른 훅의 결정이 그대로 전달된다', () => {
  const s = setup({ PermissionRequest: [H('block2'), H('prallow2')] });
  const r = run(s, 'PermissionRequest', { hook_event_name: 'PermissionRequest', tool_name: 'Bash', tool_input: { command: 'ls' } });
  assert.strictEqual(r.code, 0);
  assert.strictEqual(r.json.hookSpecificOutput.decision.behavior, 'allow');
});

test('정상: PermissionRequest 결정의 message·interrupt·updatedInput·updatedPermissions 전달', () => {
  const inp = { hook_event_name: 'PermissionRequest', tool_name: 'Bash', tool_input: { command: 'ls' } };
  const a = run(setup({ PermissionRequest: [H('prallow')] }), 'PermissionRequest', inp).json.hookSpecificOutput;
  assert.strictEqual(a.hookEventName, 'PermissionRequest');
  assert.deepStrictEqual(a.decision.updatedInput, { command: 'ls -la' });
  assert.strictEqual(a.decision.updatedPermissions[0].type, 'addRules');
  const d = run(setup({ PermissionRequest: [H('prallow'), H('prdeny')] }), 'PermissionRequest', inp).json.hookSpecificOutput;
  assert.strictEqual(d.decision.behavior, 'deny', 'deny 가 이긴다');
  assert.strictEqual(d.decision.message, 'PR-DENY-M');
  assert.strictEqual(d.decision.interrupt, true);
  assert.strictEqual(d.decision.updatedInput, undefined, 'deny 에는 allow 쪽 updatedInput 을 붙이지 않는다');
  assert.strictEqual(d.decision.updatedPermissions, undefined);
});

test('정상: Monitor — PreToolUse·PermissionRequest 에서 Bash matcher 훅이 Monitor 에도 돌고 원래 입력을 받는다', () => {
  for (const ev of ['PreToolUse', 'PermissionRequest']) {
    for (const m of ['Bash', 'Bash|PowerShell']) {
      const s = setup({ [ev]: [H('dump', m)] });
      const mark = path.join(s.data, 'mark');
      const input = { hook_event_name: ev, tool_name: 'Monitor', tool_input: { command: 'tail -f x.log' } };
      run(s, ev, input, { MARK_FILE: mark });
      assert.ok(fs.existsSync(mark), `${ev} ${m}`);
      const got = JSON.parse(fs.readFileSync(mark, 'utf8'));
      assert.strictEqual(got.tool_name, 'Monitor');
      assert.strictEqual(got.tool_input.command, 'tail -f x.log');
    }
  }
});

// 공식(2.1.314): Bash matcher 로 Monitor 에 걸린 훅은 막기·묻기만 되고 허용·명령 바꾸기는 무시 (2026-11-11)
test('악성: Monitor — Bash matcher 훅의 allow·updatedInput 은 버리고, deny·ask 는 살린다', () => {
  const mon = (ev) => ({ hook_event_name: ev, tool_name: 'Monitor', tool_input: { command: 'rm -rf ~' } });
  const pd = (r) => r.json && r.json.hookSpecificOutput && r.json.hookSpecificOutput.permissionDecision;
  // PreToolUse: Bash matcher 의 allow 는 Monitor 에서 무시 → 결정 없음
  for (const m of ['Bash', 'Bash|PowerShell', 'Ba.*']) {
    const r = run(setup({ PreToolUse: [H('allow', m)] }), 'PreToolUse', mon('PreToolUse'));
    assert.notStrictEqual(pd(r), 'allow', `Bash matcher(${m}) allow 가 Monitor 에 적용되면 안 됨`);
  }
  // 같은 훅이라도 Monitor 를 직접 겨냥한 matcher·'*' 이면 allow 는 공식대로 적용
  for (const m of ['Bash|Monitor', 'Monitor', '*']) {
    assert.strictEqual(pd(run(setup({ PreToolUse: [H('allow', m)] }), 'PreToolUse', mon('PreToolUse'))), 'allow', m);
  }
  // deny·ask 는 Bash matcher 로도 Monitor 에 그대로 걸린다
  const d = run(setup({ PreToolUse: [H('deny', 'Bash')] }), 'PreToolUse', mon('PreToolUse'));
  assert.ok(d.code === 2 || pd(d) === 'deny', 'Bash matcher deny 는 Monitor 를 막는다');
  assert.strictEqual(pd(run(setup({ PreToolUse: [H('ask', 'Bash')] }), 'PreToolUse', mon('PreToolUse'))), 'ask');
  // allow 가 버려져도 deny 가 함께 오면 deny
  const mix = run(setup({ PreToolUse: [H('allow', 'Bash'), H('deny', 'Bash')] }), 'PreToolUse', mon('PreToolUse'));
  assert.ok(mix.code === 2 || pd(mix) === 'deny');
  // PermissionRequest: Bash matcher 의 allow(+updatedInput 명령 바꾸기)는 버리고 deny 는 살린다
  const pr = (r) => r.json && r.json.hookSpecificOutput && r.json.hookSpecificOutput.decision;
  const a = pr(run(setup({ PermissionRequest: [H('prallow', 'Bash')] }), 'PermissionRequest', mon('PermissionRequest')));
  assert.ok(!a || a.behavior !== 'allow', 'Monitor 에 Bash matcher allow 적용 금지');
  assert.ok(!a || a.updatedInput === undefined, 'Monitor 명령 바꾸기 금지');
  assert.strictEqual(pr(run(setup({ PermissionRequest: [H('prdeny', 'Bash')] }), 'PermissionRequest', mon('PermissionRequest'))).behavior, 'deny');
  assert.strictEqual(pr(run(setup({ PermissionRequest: [H('prallow', '*')] }), 'PermissionRequest', mon('PermissionRequest'))).behavior, 'allow', "'*' 는 공식대로 allow");
  // 경계: Bash 도구 자체에서는 Bash matcher allow 가 그대로 (회귀 방지)
  assert.strictEqual(pd(run(setup({ PreToolUse: [H('allow', 'Bash')] }), 'PreToolUse', pre('Bash'))), 'allow');
});

test('경계: Monitor — PostToolUse 의 Bash matcher·다른 도구 matcher 는 Monitor 에 안 돈다', () => {
  const s = setup({ PostToolUse: [H('mark', 'Bash')], PreToolUse: [H('mark', 'Write|Edit')] });
  const mark = path.join(s.data, 'mark');
  run(s, 'PostToolUse', { hook_event_name: 'PostToolUse', tool_name: 'Monitor', tool_input: { command: 'ls' } }, { MARK_FILE: mark });
  run(s, 'PreToolUse', { hook_event_name: 'PreToolUse', tool_name: 'Monitor', tool_input: { command: 'ls' } }, { MARK_FILE: mark });
  assert.ok(!fs.existsSync(mark));
  // 이름을 흉내 낸 도구(MonitorX)는 Bash matcher 에 안 걸린다
  const s2 = setup({ PreToolUse: [H('mark', 'Bash')] });
  run(s2, 'PreToolUse', pre('MonitorX'), { MARK_FILE: mark });
  assert.ok(!fs.existsSync(mark));
});

// 고정 보안 훅 — 테스트 manifest 에서 bash-guard 등 이름으로 크래시·느린 훅을 연결
const SEC = (id, file, extra = {}) => ({ [`hook:${id}`]: { type: 'hook', state: 'lock', path: `.claude/hooks/${file}.js`, ...extra } });

test('악성: 고정 보안 훅이 크래시·시간 초과·잘못된 JSON·파일 없음이면 PreToolUse 는 차단(exit 2)', () => {
  const cases = [
    [SEC('bash-guard', 'crash'), {}],
    [SEC('protect-secrets', 'slow'), { timeout: 1 }],
    [SEC('parry', 'badjson'), {}],
    [{ 'hook:branch-protection': { type: 'hook', state: 'on', path: '.claude/hooks/nope.js' } }, {}],
  ];
  for (const [items, extra] of cases) {
    const id = Object.keys(items)[0].slice(5);
    const s = setup({ PreToolUse: [H(id, '*', extra), H('allow')] }, items);
    const r = run(s, 'PreToolUse', pre('Bash'));
    assert.strictEqual(r.code, 2, id);
    assert.match(r.stderr, new RegExp(id), id);
  }
});

test('악성: 고정 보안 훅이 PermissionRequest 에서 크래시 → deny (공식 onFailure:block 과 같은 동작)', () => {
  const s = setup({ PermissionRequest: [H('bash-guard'), H('prallow2')] }, SEC('bash-guard', 'crash'));
  const r = run(s, 'PermissionRequest', { hook_event_name: 'PermissionRequest', tool_name: 'Bash', tool_input: { command: 'ls' } });
  assert.strictEqual(r.code, 0);
  assert.strictEqual(r.json.hookSpecificOutput.decision.behavior, 'deny');
  assert.match(r.json.hookSpecificOutput.decision.message, /bash-guard/);
});

test('경계: 보안 훅이라도 PostToolUse 크래시는 기록만 / manifest failClosed 로 켜고 끌 수 있다', () => {
  const s = setup({ PostToolUse: [H('bash-guard', 'Bash')] }, SEC('bash-guard', 'crash'));
  assert.strictEqual(run(s, 'PostToolUse', { hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: {} }).code, 0);
  const off = setup({ PreToolUse: [H('bash-guard')] }, SEC('bash-guard', 'crash', { failClosed: false }));
  assert.strictEqual(run(off, 'PreToolUse', pre('Bash')).code, 0, 'failClosed:false 면 비차단');
  const on = setup({ PreToolUse: [H('crash')] }, SEC('crash', 'crash', { failClosed: true }));
  assert.strictEqual(run(on, 'PreToolUse', pre('Bash')).code, 2, 'failClosed:true 면 다른 훅도 차단형');
});

test('경계: SessionStart additionalContext·systemMessage 합계 9,000자 안 — [gugbab] 안내가 맨 앞, 잘린 몫은 "자 생략" 표시', () => {
  const s = setup({ SessionStart: [H('big', ''), H('big2', ''), H('wrapper-version-check', '')] }, SEC('wrapper-version-check', 'gugbab'));
  const r = run(s, 'SessionStart', { hook_event_name: 'SessionStart', source: 'startup' });
  const ctx = r.json.hookSpecificOutput.additionalContext;
  assert.ok(ctx.length <= 9000, String(ctx.length));
  assert.ok(ctx.startsWith('[gugbab] 하네스 v9.9.9'), ctx.slice(0, 50));
  assert.match(ctx, /B{100}/); assert.match(ctx, /C{100}/);
  assert.match(ctx, /\d+자 생략/);
  assert.ok(r.json.systemMessage.length <= 9000);
  assert.match(r.json.systemMessage, /S{100}[\s\S]*T{100}/);
  // 작으면 그대로 (생략 표시 없음)
  const s2 = setup({ SessionStart: [H('ctx1', ''), H('wrapper-version-check', '')] }, SEC('wrapper-version-check', 'gugbab'));
  const c2 = run(s2, 'SessionStart', { hook_event_name: 'SessionStart', source: 'startup' }).json.hookSpecificOutput.additionalContext;
  assert.ok(c2.startsWith('[gugbab]') && c2.includes('CTX-ONE') && !/생략/.test(c2), c2);
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

test('악성·경계: 도구 이벤트 입력이 깨지면 — PreToolUse 는 차단, PermissionRequest 는 결정 없음, 그 밖은 통과', () => {
  const s = setup({ PreToolUse: [H('allow')], PermissionRequest: [H('prallow2')], PostToolUse: [H('allow')], Stop: [H('plain', '')] });
  // 도구별 훅이 하나도 못 도는 입력(빈 값·깨진 JSON·배열·tool_name 없음/문자열 아님)
  for (const bad of ['', '{broken', '[]', 'null', '{"hook_event_name":"PreToolUse"}', '{"tool_name":42}']) {
    const r = run(s, 'PreToolUse', bad);
    assert.strictEqual(r.code, 2, `PreToolUse ${bad}`);
    assert.match(r.stderr, /입력/);
    const p = run(s, 'PermissionRequest', bad);
    assert.strictEqual(p.code, 0, `PermissionRequest ${bad}`);
    assert.strictEqual(p.stdout, '', 'allow 같은 결정을 내지 않는다');
    assert.strictEqual(run(s, 'PostToolUse', bad).code, 0);
  }
  assert.strictEqual(run(s, 'Stop', '{broken').code, 0);
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
