// tui.js — /harness 화면 (트리: 큰 갈래 → 묶음·블록 → 항목, 일괄 켜기·끄기, 설명칸)
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { PassThrough } = require('stream');
const { createState, handleKey, render, rowsOf, strWidth, replayOps, runTui, buildTree, relationLines, summaryLines } = require('./tui');
const { resolve } = require('./resolve');

const manifest = {
  items: {
    'hook:a': { type: 'hook', state: 'on' },
    'hook:b': { type: 'hook', state: 'on' },
    'hook:lock': { type: 'hook', state: 'lock' },
    'hook:solo': { type: 'hook', state: 'on' },
    'rule:r.md': { type: 'rule', state: 'on' },
    'skill:s1': { type: 'skill', state: 'off' },
    'skill:s2': { type: 'skill', state: 'off' },
    'agent:shared': { type: 'agent', state: 'on' },
    'setting:plug x': { type: 'setting', state: 'on', key: 'plugin:x' },
  },
  relations: {
    bundles: { q: { title: '품질 검사', items: ['hook:a', 'hook:b', 'rule:r.md', 'agent:shared'] }, core: { title: '필수', items: ['hook:lock'] } },
    blocks: { st: { title: '스택', items: ['skill:s1', 'skill:s2', 'agent:shared'] } },
    requires: { 'hook:b': ['rule:r.md'] },
    conflicts: [['block:st', 'hook:solo']],
    presets: { web: { title: '웹 개발', enable: ['block:st'] } },
  },
};
const layers = (p = {}, j = {}, g = {}) => [{ source: 'profile', ...p }, { source: 'project', ...j }, { source: '.gugbab.json', ...g }];
const K = (name, ch) => ({ name, ch: ch === undefined ? (name.length === 1 ? name : '') : ch });
function press(st, ...keys) { let s = st; let action = null; for (const k of keys) { const r = handleKey(s, typeof k === 'string' ? K(k) : k); s = r.state; action = r.action; } return { st: s, action }; }
function goto(st, id) { const i = rowsOf(st).findIndex((r) => r.id === id); assert.ok(i >= 0, `${id} 가 보이지 않음`); return { ...st, cursor: i }; }
const eff = (st) => resolve(manifest, [{ source: 'profile', ...st.drafts.profile }, { source: 'project', ...st.drafts.project }, st.gugbab]);
const fresh = (l = layers()) => createState({ manifest, layers: l, projectName: 'p' });
const ids = (st) => rowsOf(st).map((r) => r.id);
const nodeOf = (id) => ({ ...buildTree(manifest).flatMap((s) => [s, ...s.children, ...s.children.flatMap((g) => g.children)]).find((n) => n.id === id), depth: 2 });

// ── 정상 ─────────────────────────────────────────────────────────────
test('정상: 처음엔 큰 갈래만 펼쳐 블록·묶음·종류 목록이 보이고 항목은 접혀 있음', () => {
  const st = fresh();
  assert.deepStrictEqual(ids(st), ['sec:blocks', 'block:st', 'sec:bundles', 'bundle:q', 'bundle:core', 'sec:standalone', 'type:setting', 'type:hook']);
  assert.deepStrictEqual(rowsOf(st).map((r) => r.depth), [0, 1, 0, 1, 1, 0, 1, 1]);
  assert.deepStrictEqual(buildTree(manifest).find((s) => s.id === 'sec:standalone').ids.sort(), ['hook:solo', 'setting:plug x'], '묶음·블록에 안 속한 것만 단독');
});

test('정상: → 로 펼치면 항목이 보이고(다시 → 는 첫 자식으로), 항목에서 ← 는 부모로, 그룹에서 ← 는 접기', () => {
  let st = goto(fresh(), 'block:st');
  st = press(st, 'right').st;
  assert.deepStrictEqual(ids(st).slice(0, 5), ['sec:blocks', 'block:st', 'skill:s1', 'skill:s2', 'agent:shared']);
  st = press(st, 'right').st;
  assert.strictEqual(rowsOf(st)[st.cursor].id, 'skill:s1');
  st = press(st, 'left').st;
  assert.strictEqual(rowsOf(st)[st.cursor].id, 'block:st');
  st = press(st, 'left').st;
  assert.ok(!ids(st).includes('skill:s1'));
});

test('정상: 블록에서 Space = 안의 항목 일괄 켜기, 다시 Space = 일괄 끄기', () => {
  let st = goto(fresh(), 'block:st');
  st = press(st, 'space').st;
  assert.ok(eff(st).enabled.has('skill:s1') && eff(st).enabled.has('skill:s2'));
  assert.deepStrictEqual(st.drafts.project.enable, ['block:st']);
  st = press(st, 'space').st;
  assert.ok(!eff(st).enabled.has('skill:s1') && !eff(st).enabled.has('agent:shared'));
});

test('정상: 큰 갈래에서 Space = 그 아래 묶음 전체 일괄 (🔒 고정만 있는 묶음은 건너뜀)', () => {
  let st = goto(fresh(), 'sec:bundles');
  st = press(st, 'space').st;
  assert.deepStrictEqual(st.ops.project, [['off', 'bundle:q']], '고정 묶음 core 는 기록하지 않음');
  assert.ok(!eff(st).enabled.has('hook:a') && eff(st).enabled.has('hook:lock'));
  assert.match(st.message, /끔: 묶음 — 훅·룰·커맨드 기능 단위 \(\d+개\)/);
});

test('정상: 종류 그룹(단독 항목)에서 Space = 그 종류 항목 하나씩 일괄', () => {
  let st = goto(fresh(), 'type:hook');
  st = press(st, 'space').st;
  assert.deepStrictEqual(st.ops.project, [['off', 'hook:solo']]);
  assert.ok(!eff(st).enabled.has('hook:solo'));
});

test('정상: 범례 줄 · 🟨(일부만 켬) 표시 · 설명칸 "N개 중 M개 켜짐" · 바꾼 줄은 *', () => {
  let st = goto(press(goto(fresh(), 'block:st'), 'right').st, 'skill:s1');
  st = press(st, 'space').st;
  let screen = render(st, { cols: 140, rows: 40 });
  assert.match(screen, /\*.*✅ s1/, '바꾼 줄은 *');
  st = goto(st, 'block:st');
  screen = render(st, { cols: 140, rows: 40 });
  assert.match(screen, /✅ 켬 · ⬜ 끔 · 🟨 일부만 켬\(묶음 안 일부\) · 🔒 고정\(끌 수 없음\)/);
  assert.match(screen, /▾ 🟨 스택 +2\/3 · block:st/, 'agent:shared 는 원래 켬이라 3개 중 2개');
  assert.match(screen, /\[스택\] 3개 중 2개 켜짐/);
});

test('정상: 설명칸 — 필요로 함 / 이걸 필요로 함 / 충돌 / 여러 묶음 소속 / 고정 이유', () => {
  const st = fresh();
  const res = eff(st);
  assert.match(relationLines(st, nodeOf('hook:b'), res).join('\n'), /필요로 함: rule:r\.md \(켜면 같이 켜짐\)/);
  assert.match(relationLines(st, nodeOf('rule:r.md'), res).join('\n'), /이걸 필요로 함: hook:b \(끄면 같이 꺼짐\)/);
  assert.match(relationLines(st, nodeOf('hook:solo'), res).join('\n'), /충돌: block:st 을\(를\) 켜면 이게 꺼짐/);
  assert.match(relationLines(st, nodeOf('block:st'), res).join('\n'), /충돌: 이것을 켜면 hook:solo 이\(가\) 꺼진다/);
  assert.match(relationLines(st, nodeOf('agent:shared'), res).join('\n'), /속한 곳: 스택, 품질 검사[\s\S]*여러 묶음에 속함/);
  assert.match(relationLines(st, nodeOf('hook:a'), res).join('\n'), /연관 없음/);
  assert.match(relationLines(st, nodeOf('hook:lock'), res).join('\n'), /🔒 체크리스트 고정/);
});

test('정상: 여러 묶음에 속한 항목은 목록에서도 "다른 묶음에도 속함"', () => {
  const st = goto(press(goto(fresh(), 'block:st'), 'right').st, 'agent:shared');
  assert.match(render(st, { cols: 140, rows: 40 }), /shared +에이전트 · 다른 묶음에도 속함/);
});

test('정상: / 검색은 맞는 항목과 그 위 그룹을 자동으로 펼치고 커서를 첫 항목에, Esc 면 원래 트리', () => {
  let st = press(fresh(), K('/', '/'), K('s', 's'), K('2', '2'), 'return').st;
  assert.deepStrictEqual(ids(st), ['sec:blocks', 'block:st', 'skill:s2']);
  assert.strictEqual(rowsOf(st)[st.cursor].id, 'skill:s2');
  st = press(st, K('/', '/'), 'escape').st;
  assert.ok(ids(st).includes('bundle:q') && !ids(st).includes('skill:s2'));
});

test('정상: 검색어가 그룹 이름이면 그 그룹 항목 전체', () => {
  const st = press(fresh(), K('/', '/'), ...'품질'.split('').map((c) => K(c, c)), 'return').st;
  assert.deepStrictEqual(ids(st), ['sec:bundles', 'bundle:q', 'hook:a', 'hook:b', 'rule:r.md', 'agent:shared']);
});

test('정상: p 프리셋 적용 · Enter 저장 요청 · replayOps 로 다시 적용', () => {
  let st = press(fresh(), K('p', 'p')).st;
  assert.match(render(st, { cols: 90, rows: 24 }), /web +웹 개발/);
  st = press(st, 'return').st;
  assert.ok(eff(st).enabled.has('skill:s1'));
  assert.strictEqual(press(st, 'return').action, 'save');
  const out = replayOps({ enable: ['hook:b'], disable: [] }, [['off', 'bundle:q'], ['on', 'hook:a'], ['preset', 'web']], manifest);
  const res = resolve(manifest, [{ source: 'project', ...out }]);
  assert.ok(res.enabled.has('hook:a') && !res.enabled.has('hook:b') && res.enabled.has('skill:s1'));
});

test('정상: runTui — 가짜 터미널로 블록 일괄 켜고 저장하면 파일에 기록·조립', async () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'tui-'));
  const paths = { profilePath: path.join(d, 'profile.json') };
  const project = { root: d, id: 'p', configDir: path.join(d, 'cfg'), settingsPath: path.join(d, 'projects', 'p', 'settings.json') };
  const input = new PassThrough(); input.isTTY = true; input.setRawMode = () => input;
  const output = new PassThrough(); output.columns = 120; output.rows = 30;
  let screen = ''; output.on('data', (c) => { screen += c; });
  const composed = [];
  const done = runTui({ manifest, paths, project, input, output, composeFn: (x) => composed.push(x) });
  input.write('\x1b[B'); // ↓ block:st
  input.write(' ');      // 일괄 켜기
  input.write('\r');     // 저장
  const res = await done;
  assert.strictEqual(res.saved, true);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(project.settingsPath, 'utf8')).enable, ['block:st']);
  assert.ok(res.turnedOn.includes('skill:s1'));
  assert.strictEqual(composed.length, 1);
  assert.match(screen, /gugbab 하네스 · p/);
  assert.ok(screen.includes('\x1b[?1049l'), '끝나면 원래 화면으로 돌아옴');
});

test('정상: 프로젝트 자체 .claude 가 가진 항목은 ↷ 표시, 바꿔도 적용 안 된다고 알림', () => {
  let st = createState({ manifest, layers: layers(), projectName: 'p', skipped: new Set(['hook:solo']) });
  st = goto(press(goto(st, 'type:hook'), 'right').st, 'hook:solo');
  assert.match(render(st, { cols: 140, rows: 40 }), /solo .*자체 \.claude 우선/);
  st = press(st, 'space').st;
  assert.match(st.message, /자체 \.claude/);
});

// ── 악성·우회 ────────────────────────────────────────────────────────
test('악성: 🔒 고정 항목·전부 고정인 묶음은 Space 로 안 꺼지고 이유를 보여 줌', () => {
  let st = goto(fresh(), 'bundle:core');
  st = press(st, 'space').st;
  assert.match(st.message, /🔒.*체크리스트 고정/);
  assert.deepStrictEqual(st.drafts.project, {});
  st = goto(press(st, 'right').st, 'hook:lock');
  st = press(st, 'space').st;
  assert.deepStrictEqual(st.ops.project, []);
});

test('악성: .gugbab.json lock 은 이 프로젝트 범위에서 꺼도 그대로 + 이유', () => {
  let st = fresh(layers({}, {}, { lock: ['hook:a'] }));
  st = goto(press(goto(st, 'bundle:q'), 'right').st, 'hook:a');
  st = press(st, 'space').st;
  assert.match(st.message, /\.gugbab\.json/);
  assert.ok(eff(st).enabled.has('hook:a'));
});

test('악성: 모든 프로젝트에서 꺼도 이 프로젝트 설정이 켜 두었으면 그대로 + 기록은 남김', () => {
  let st = fresh(layers({}, { enable: ['hook:solo'] }));
  st = goto(press(goto(st, 'type:hook'), 'right').st, 'hook:solo');
  st = press(st, 'tab', 'space').st;
  assert.match(st.message, /끔 기록 \(모든 프로젝트\) — 이 프로젝트는 그대로: .*이 프로젝트 설정 이\(가\) 켬으로 덮고 있음/);
  assert.deepStrictEqual(st.ops.profile, [['off', 'hook:solo']]);
});

test('악성: 검색창·프로젝트 이름·프리셋 제목에 제어문자·이스케이프를 넣어도 화면에 그대로 나가지 않음', () => {
  const m2 = { ...manifest, relations: { ...manifest.relations, presets: { web: { title: '\x1b]0;hack\u0007웹', enable: ['block:st'] } } } };
  let st = createState({ manifest: m2, layers: layers(), projectName: 'p\x1b[2J' });
  st = press(st, K('/', '/'), K('x', '\x1b[2J'), K('y', '\u0007'), K('s', 's')).st;
  assert.strictEqual(st.filter, 's');
  let screen = render(st, { cols: 80, rows: 20 });
  assert.ok(!screen.includes('\x1b[2J') && !screen.includes('\u0007'));
  st = press(st, 'escape', K('p', 'p')).st;
  screen = render(st, { cols: 80, rows: 20 });
  assert.ok(!screen.includes('\x1b]0;'));
});

test('악성: 묶음 이름·항목 이름에 이스케이프가 섞인 manifest 도 지워서 그림', () => {
  const m3 = { items: { 'hook:x': { type: 'hook', state: 'on' } }, relations: { bundles: { b: { title: '\x1b[31m빨강\x1b[0m', items: ['hook:x'] } } } };
  const st = createState({ manifest: m3, layers: layers(), projectName: 'p' });
  const screen = render(st, { cols: 80, rows: 20 });
  assert.ok(!screen.includes('\x1b[31m'));
  assert.match(screen, /빨강/);
});

// ── 경계 ─────────────────────────────────────────────────────────────
test('경계: 바뀐 게 있으면 q 한 번은 확인만, 두 번이면 버리고 닫기. 바뀐 게 없으면 바로 닫기', () => {
  let st = fresh();
  assert.strictEqual(press(st, K('q', 'q')).action, 'quit');
  st = press(goto(st, 'block:st'), 'space').st;
  let r = press(st, K('q', 'q'));
  assert.strictEqual(r.action, null);
  assert.match(r.st.message, /한 번 더/);
  r = press(r.st, 'escape');
  assert.strictEqual(r.action, 'quit');
});

test('경계: a = 모두 펼치기 / 다시 a = 큰 갈래만 남기고 접기, 커서는 같은 노드를 따라감', () => {
  let st = goto(fresh(), 'bundle:q');
  st = press(st, K('a', 'a')).st;
  assert.ok(ids(st).includes('skill:s1') && ids(st).includes('hook:solo'));
  assert.strictEqual(rowsOf(st)[st.cursor].id, 'bundle:q');
  st = press(st, K('a', 'a')).st;
  assert.ok(!ids(st).includes('skill:s1'));
});

test('경계: 아주 작은 터미널·한글 폭에서도 줄이 화면 폭·높이를 넘지 않음', () => {
  const st = press(createState({ manifest, layers: layers(), projectName: '아주긴한글프로젝트이름입니다' }), K('a', 'a')).st;
  for (const [cols, rows] of [[20, 5], [40, 9], [120, 40]]) {
    const lines = render(st, { cols, rows }).split('\n');
    assert.ok(lines.length <= rows, `${cols}x${rows} 줄 수 ${lines.length}`);
    for (const l of lines) assert.ok(strWidth(l.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')) <= cols, `${cols}: ${l}`);
  }
  assert.strictEqual(strWidth('✅⬜🟨🔒'), 8);
});

test('경계: 검색 결과가 없으면 안내 · Space·→ 는 아무 일 없음 · 커서는 범위 안', () => {
  let st = press(fresh(), K('/', '/'), K('z', 'z'), K('z', 'z'), 'return').st;
  assert.match(render(st, { cols: 80, rows: 20 }), /맞는 항목이 없습니다/);
  st = press(st, 'space', 'right', 'down', 'end').st;
  assert.deepStrictEqual(st.ops.project, []);
  st = press(fresh(), 'up', 'up').st;
  assert.strictEqual(st.cursor, 0);
  st = press(st, 'end', 'down', 'down').st;
  assert.strictEqual(st.cursor, rowsOf(st).length - 1);
});

test('경계: summaryLines — 바꾼 것 없이 Enter / 저장 안 하고 닫기 / 저장 구분', () => {
  assert.match(summaryLines({ saved: false, nothing: true })[0], /바꾼 것이 없어/);
  assert.match(summaryLines({ saved: false })[0], /저장하지 않고/);
  const l = summaryLines({ saved: true, scopes: ['profile'], turnedOn: ['hook:a'], turnedOff: [], needRestart: false });
  assert.match(l.join('\n'), /모든 프로젝트[\s\S]*켬: hook:a[\s\S]*바로 반영/);
});

test('경계: 터미널이 아니면 runTui 는 거부', async () => {
  const input = new PassThrough(); const output = new PassThrough();
  await assert.rejects(runTui({ manifest, paths: {}, project: {}, input, output }), /터미널/);
});
