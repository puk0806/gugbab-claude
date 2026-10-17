// tui.js — /harness 화면 (상태 계산·키 처리·그리기는 순수 함수, 터미널 입출력은 runTui)
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { PassThrough } = require('stream');
const { createState, handleKey, render, rowsOf, strWidth, replayOps, runTui } = require('./tui');
const { resolve } = require('./resolve');

const manifest = {
  items: {
    'hook:a': { type: 'hook', state: 'on' },
    'hook:b': { type: 'hook', state: 'on' },
    'hook:lock': { type: 'hook', state: 'lock' },
    'rule:r.md': { type: 'rule', state: 'on' },
    'skill:s1': { type: 'skill', state: 'off' },
    'skill:s2': { type: 'skill', state: 'off' },
  },
  relations: {
    bundles: { q: { title: '품질 검사', items: ['hook:a', 'hook:b', 'rule:r.md'] }, core: { title: '필수', items: ['hook:lock'] } },
    blocks: { st: { title: '스택', items: ['skill:s1', 'skill:s2'] } },
    presets: { web: { title: '웹 개발', enable: ['block:st'] } },
  },
};
const layers = (p = {}, j = {}, g = {}) => [{ source: 'profile', ...p }, { source: 'project', ...j }, { source: '.gugbab.json', ...g }];
const K = (name, ch) => ({ name, ch: ch === undefined ? (name.length === 1 ? name : '') : ch });
function press(st, ...keys) { let s = st; let action = null; for (const k of keys) { const r = handleKey(s, typeof k === 'string' ? K(k) : k); s = r.state; action = r.action; } return { st: s, action }; }
function gotoId(st, id) { const rows = rowsOf(st); const i = rows.findIndex(r => r.id === id); assert.ok(i >= 0, id); return { ...st, cursor: i }; }
const eff = (st) => resolve(manifest, [{ source: 'profile', ...st.drafts.profile }, { source: 'project', ...st.drafts.project }, st.gugbab]);

test('정상: 묶음·블록·종류별 항목이 차례로 나오고 커서는 첫 항목', () => {
  const st = createState({ manifest, layers: layers(), projectName: 'my-ui' });
  const rows = rowsOf(st);
  assert.strictEqual(rows[0].kind, 'header');
  assert.deepStrictEqual(rows.filter(r => r.kind === 'entry').slice(0, 3).map(r => r.id), ['bundle:q', 'bundle:core', 'block:st']);
  assert.strictEqual(rows[st.cursor].id, 'bundle:q');
  assert.ok(rows.some(r => r.id === 'skill:s1'));
});

test('정상: 스페이스로 묶음 끄기 → 구성원 전부 꺼짐, 다시 누르면 켜짐 (이 프로젝트 범위)', () => {
  let st = gotoId(createState({ manifest, layers: layers(), projectName: 'p' }), 'bundle:q');
  st = press(st, 'space').st;
  assert.deepStrictEqual(st.drafts.project.disable, ['bundle:q']);
  assert.ok(!eff(st).enabled.has('hook:a'));
  assert.match(st.message, /끔: bundle:q/);
  st = press(st, 'space').st;
  assert.ok(eff(st).enabled.has('hook:a'));
});

test('정상: Tab 으로 범위를 모든 프로젝트로 바꾸면 profile 쪽에 기록', () => {
  let st = gotoId(createState({ manifest, layers: layers(), projectName: 'p' }), 'block:st');
  st = press(st, 'tab', 'space').st;
  assert.strictEqual(st.scope, 'profile');
  assert.deepStrictEqual(st.drafts.profile.enable, ['block:st']);
  assert.deepStrictEqual(st.drafts.project, {});
  assert.match(render(st, { cols: 100, rows: 30 }), /\[모든 프로젝트\]/);
});

test('정상: 일부만 켠 블록은 🟨 와 개수, 켠 항목은 ✅, 바꾼 줄은 * 표시, 저장 전이면 "저장 안 됨"', () => {
  let st = gotoId(createState({ manifest, layers: layers(), projectName: 'p' }), 'skill:s1');
  st = press(st, 'space').st;
  const screen = render(st, { cols: 100, rows: 30 });
  assert.match(screen, /🟨 스택 +1\/2/);
  assert.match(screen, /\* ✅ s1/);
  assert.match(screen, /⬜ s2/);
  assert.match(screen, /🔒 lock/);
  assert.ok(!/\[x\]|\[-\]|\[ \]/.test(screen), '옛 [x]·[-]·[ ] 표시가 남지 않음');
  assert.match(screen, /저장 안 됨/);
});

test('정상: / 검색으로 거르고 Esc 로 풀기', () => {
  let st = createState({ manifest, layers: layers(), projectName: 'p' });
  st = press(st, K('/', '/'), K('s', 's'), K('2', '2'), 'return').st;
  const ids = rowsOf(st).filter(r => r.kind === 'entry').map(r => r.id);
  assert.deepStrictEqual(ids, ['skill:s2']);
  assert.strictEqual(rowsOf(st)[st.cursor].id, 'skill:s2');
  st = press(st, K('/', '/'), 'escape').st;
  assert.ok(rowsOf(st).length > 3);
});

test('정상: p 로 프리셋 적용, Enter 로 저장 요청 + 기록할 동작 목록', () => {
  let st = createState({ manifest, layers: layers(), projectName: 'p' });
  st = press(st, K('p', 'p')).st;
  assert.strictEqual(st.mode, 'preset');
  assert.match(render(st, { cols: 80, rows: 20 }), /web +웹 개발/);
  st = press(st, 'return').st;
  assert.ok(eff(st).enabled.has('skill:s1') && eff(st).enabled.has('skill:s2'));
  const r = press(st, 'return');
  assert.strictEqual(r.action, 'save');
  assert.deepStrictEqual(r.st.ops.project, [['preset', 'web']]);
});

test('정상: replayOps — 저장 때 지금 파일 내용 위에 동작을 다시 적용 (다른 곳에서 바뀐 것 보존)', () => {
  const now = { enable: ['hook:b'], disable: [] }; // TUI 를 연 뒤 다른 세션이 바꾼 내용
  const out = replayOps(now, [['off', 'bundle:q'], ['on', 'hook:a'], ['preset', 'web']], manifest);
  const r = resolve(manifest, [{ source: 'project', ...out }]);
  assert.ok(r.enabled.has('hook:a') && !r.enabled.has('hook:b') && r.enabled.has('skill:s1'));
});

test('정상: runTui — 가짜 터미널로 키를 넣어 끄고 저장하면 파일에 기록·조립', async () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'tui-'));
  const paths = { profilePath: path.join(d, 'profile.json') };
  const project = { root: d, id: 'p', configDir: path.join(d, 'cfg'), settingsPath: path.join(d, 'projects', 'p', 'settings.json') };
  const input = new PassThrough(); input.isTTY = true; input.setRawMode = () => input;
  const output = new PassThrough(); output.columns = 90; output.rows = 30;
  let screen = ''; output.on('data', (c) => { screen += c; });
  const composed = [];
  const done = runTui({ manifest, paths, project, input, output, composeFn: (x) => composed.push(x) });
  input.write(' ');      // 첫 줄 bundle:q 끄기
  input.write('\r');     // 저장
  const res = await done;
  assert.strictEqual(res.saved, true);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(project.settingsPath, 'utf8')).disable, ['bundle:q']);
  assert.ok(res.turnedOff.includes('hook:a') && res.needRestart);
  assert.strictEqual(composed.length, 1);
  assert.match(screen, /gugbab 하네스 · p/);
  assert.ok(screen.includes('\x1b[?1049l'), '끝나면 원래 화면으로 돌아옴');
});

test('악성: 🔒 고정 항목·전부 고정인 묶음은 눌러도 안 꺼지고 이유를 보여 줌', () => {
  let st = gotoId(createState({ manifest, layers: layers(), projectName: 'p' }), 'hook:lock');
  st = press(st, 'space').st;
  assert.match(st.message, /🔒.*체크리스트 고정/);
  assert.deepStrictEqual(st.drafts.project, {});
  st = gotoId(st, 'bundle:core');
  st = press(st, 'space').st;
  assert.match(st.message, /🔒/);
  assert.deepStrictEqual(st.drafts.project, {});
});

test('악성: .gugbab.json lock 은 프로젝트 범위에서 꺼도 그대로 + 이유', () => {
  let st = gotoId(createState({ manifest, layers: layers({}, {}, { lock: ['hook:a'] }), projectName: 'p' }), 'hook:a');
  st = press(st, 'space').st;
  assert.match(st.message, /\.gugbab\.json/);
  assert.ok(eff(st).enabled.has('hook:a'));
});

test('악성: 모든 프로젝트에서 꺼도 이 프로젝트 설정이 켜 두었으면 그대로 + 이유', () => {
  let st = gotoId(createState({ manifest, layers: layers({}, { enable: ['hook:a'] }), projectName: 'p' }), 'hook:a');
  st = press(st, 'tab', 'space').st;
  assert.match(st.message, /끔 기록 \(모든 프로젝트\) — 이 프로젝트는 그대로: .*이 프로젝트 설정 이\(가\) 켬으로 덮고 있음/);
  assert.deepStrictEqual(st.drafts.profile.disable, ['hook:a'], '다른 프로젝트에 적용되도록 기록은 남김');
  assert.deepStrictEqual(st.ops.profile, [['off', 'hook:a']]);
});

test('악성: 검색창에 제어문자·이스케이프 시퀀스를 넣어도 화면에 그대로 나가지 않음', () => {
  let st = createState({ manifest, layers: layers(), projectName: 'p\x1b[2J' });
  st = press(st, K('/', '/'), K('x', '\x1b[2J'), K('y', '\u0007'), K('s', 's')).st;
  assert.strictEqual(st.filter, 's');
  const screen = render(st, { cols: 80, rows: 20 });
  assert.ok(!screen.includes('\x1b[2J') && !screen.includes('\u0007'));
});

test('악성: 프리셋 이름·제목에 이스케이프가 섞여도 지워서 그림', () => {
  const m2 = { ...manifest, relations: { ...manifest.relations, presets: { web: { title: '\x1b]0;hack\u0007웹', enable: ['block:st'] } } } };
  let st = createState({ manifest: m2, layers: layers(), projectName: 'p' });
  st = press(st, K('p', 'p')).st;
  const screen = render(st, { cols: 80, rows: 20 });
  assert.ok(!screen.includes('\x1b]0;'), screen);
});

test('경계: 바뀐 게 있으면 q 한 번은 확인만, 두 번이면 버리고 닫기. 바뀐 게 없으면 바로 닫기', () => {
  let st = createState({ manifest, layers: layers(), projectName: 'p' });
  assert.strictEqual(press(st, K('q', 'q')).action, 'quit');
  st = press(st, 'space').st;
  let r = press(st, K('q', 'q'));
  assert.strictEqual(r.action, null);
  assert.match(r.st.message, /한 번 더/);
  r = press(r.st, 'escape');
  assert.strictEqual(r.action, 'quit');
});

test('경계: 아주 작은 터미널·한글 폭에서도 줄이 화면 폭을 넘지 않음', () => {
  const st = createState({ manifest, layers: layers(), projectName: '아주긴한글프로젝트이름입니다' });
  for (const [cols, rows] of [[20, 5], [40, 8], [120, 40]]) {
    const lines = render(st, { cols, rows }).split('\n');
    assert.ok(lines.length <= rows, `${cols}x${rows} 줄 수 ${lines.length}`);
    for (const l of lines) assert.ok(strWidth(l.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')) <= cols, `${cols}: ${l}`);
  }
  assert.strictEqual(strWidth('가a🔒'), 5);
  assert.strictEqual(strWidth('✅⬜🟨🔒'), 8, '체크 아이콘은 모두 2칸');
});

test('경계: 검색 결과가 없으면 안내, 커서는 범위 안, 이동 키는 머리줄을 건너뜀', () => {
  let st = createState({ manifest, layers: layers(), projectName: 'p' });
  st = press(st, K('/', '/'), K('z', 'z'), K('z', 'z'), 'return').st;
  assert.match(render(st, { cols: 80, rows: 20 }), /맞는 항목이 없습니다/);
  assert.strictEqual(press(st, 'space').st.drafts.project.disable, undefined);
  st = press(st, K('/', '/'), 'escape').st;
  st = press(st, 'down', 'down', 'down').st;
  assert.strictEqual(rowsOf(st)[st.cursor].kind, 'entry');
  st = press(st, 'end').st;
  assert.strictEqual(st.cursor, rowsOf(st).length - 1);
  st = press(st, 'home', 'up').st;
  assert.strictEqual(rowsOf(st)[st.cursor].id, 'bundle:q');
});

test('정상: 프로젝트 자체 .claude 가 가진 항목은 표시하고, 바꿔도 이 프로젝트엔 적용 안 된다고 알려 줌', () => {
  let st = gotoId(createState({ manifest, layers: layers(), projectName: 'p', skipped: new Set(['hook:a']) }), 'hook:a');
  assert.match(render(st, { cols: 120, rows: 40 }), /a +.*자체 \.claude 우선/);
  st = press(st, 'space').st;
  assert.match(st.message, /자체 \.claude/);
});

test('경계: summaryLines — 바꾼 것 없이 Enter / 저장 안 하고 닫기 / 저장 구분', () => {
  const { summaryLines } = require('./tui');
  assert.match(summaryLines({ saved: false, nothing: true })[0], /바꾼 것이 없어/);
  assert.match(summaryLines({ saved: false })[0], /저장하지 않고/);
  const l = summaryLines({ saved: true, scopes: ['profile'], turnedOn: ['hook:a'], turnedOff: [], needRestart: false });
  assert.match(l.join('\n'), /모든 프로젝트[\s\S]*켬: hook:a[\s\S]*바로 반영/);
});

test('경계: 터미널이 아니면 runTui 는 거부', async () => {
  const input = new PassThrough(); const output = new PassThrough();
  await assert.rejects(runTui({ manifest, paths: {}, project: {}, input, output }), /터미널/);
});
