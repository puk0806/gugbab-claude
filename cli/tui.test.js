// tui.js — /harness 화면 (기본 트리: 종류 → 용도 → 항목 / v 키: 큰 갈래 → 묶음·블록 → 항목, 일괄 켜기·끄기, 설명칸)
// 아래 앞부분 테스트는 블록·묶음 보기(view: 'stack'), 뒤의 "종류별 보기" 테스트는 기본 보기
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
const fresh = (l = layers()) => createState({ manifest, layers: l, projectName: 'p', view: 'stack' });
const ids = (st) => rowsOf(st).map((r) => r.id);
const nodeOf = (id) => ({ ...buildTree(manifest, 'stack').flatMap((s) => [s, ...s.children, ...s.children.flatMap((g) => g.children)]).find((n) => n.id === id), depth: 2 });

// ── 정상 ─────────────────────────────────────────────────────────────
test('정상: 처음엔 큰 갈래만 펼쳐 블록·묶음·종류 목록이 보이고 항목은 접혀 있음', () => {
  const st = fresh();
  assert.deepStrictEqual(ids(st), ['sec:blocks', 'block:st', 'sec:bundles', 'bundle:q', 'bundle:core', 'sec:standalone', 'type:setting', 'type:hook']);
  assert.deepStrictEqual(rowsOf(st).map((r) => r.depth), [0, 1, 0, 1, 1, 0, 1, 1]);
  assert.deepStrictEqual(buildTree(manifest, 'stack').find((s) => s.id === 'sec:standalone').ids.sort(), ['hook:solo', 'setting:plug x'], '묶음·블록에 안 속한 것만 단독');
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
  assert.match(screen, /✅ 켬 · ⬜ 끔 · 🟨 일부만 켬\(그룹 안 일부\) · 🔒 고정\(끌 수 없음\)/);
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
  input.write('v');      // 블록·묶음 보기로
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

// ── /harness 창 자동 닫기 (2026-10-20 — 예전엔 저장 뒤 "아무 키나" 를 기다려 창이 남았다) ──
function tuiRig(opts = {}) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'tui-close-'));
  const paths = { profilePath: path.join(d, 'profile.json') };
  const project = { root: d, id: 'p', configDir: path.join(d, 'cfg'), settingsPath: path.join(d, 'projects', 'p', 'settings.json') };
  const input = new PassThrough(); input.isTTY = true;
  const raw = []; input.setRawMode = (v) => { raw.push(v); return input; };
  const output = new PassThrough(); output.columns = 120; output.rows = 30;
  let screen = ''; output.on('data', (c) => { screen += c; });
  const t0 = Date.now();
  const done = runTui({ manifest, paths, project, input, output, composeFn: () => {}, ...opts });
  return { input, raw, done, project, screen: () => screen, elapsed: () => Date.now() - t0 };
}
const CHANGE_AND_SAVE = ['v', '\x1b[B', ' ', '\r']; // 블록 보기 → block:st 일괄 켬 → 저장

test('정상: /harness 창(holdOnExit) — 저장하면 요약을 보여 주고 키를 더 누르지 않아도 저절로 끝남', async () => {
  const r = tuiRig({ holdOnExit: true, closeDelayMs: 30 });
  for (const k of CHANGE_AND_SAVE) r.input.write(k);
  const res = await r.done; // 추가 키 입력 없음
  assert.strictEqual(res.saved, true);
  assert.match(r.screen(), /저장했습니다[\s\S]*0초 뒤 이 창을 닫습니다 \(아무 키나 누르면 바로\)/);
  assert.ok(!/아무 키나 누르면 이 창을 닫습니다/.test(r.screen()), '예전 문구(키를 기다림)는 없어야');
  assert.strictEqual(r.raw[r.raw.length - 1], false, '끝나면 raw 모드를 풀어 터미널을 돌려놓음');
  assert.strictEqual(r.input.listenerCount('keypress'), 0, '키 리스너가 남지 않음');
});

test('경계: 기다리는 동안 키를 누르면 타이머를 기다리지 않고 바로 끝남 · 키와 타이머가 겹쳐도 한 번만', async () => {
  const r = tuiRig({ holdOnExit: true, closeDelayMs: 60000 });
  for (const k of CHANGE_AND_SAVE) r.input.write(k);
  await new Promise((ok) => setImmediate(ok));
  r.input.write('x'); r.input.write('y'); r.input.write('\r'); // 여러 번 눌러도
  const res = await r.done;
  assert.strictEqual(res.saved, true);
  assert.ok(r.elapsed() < 5000, `60초 타이머를 기다리면 안 됨 (${r.elapsed()}ms)`);
  assert.strictEqual(r.input.listenerCount('keypress'), 0);
  // 60초 타이머가 남아 있으면 node:test 가 이 파일을 끝내지 못한다 — clearTimeout 확인은 테스트가 끝나는 것 자체
});

test('경계: 바꾼 것 없이 Enter·q·Ctrl+C 는 기다리지 않고 바로 끝남 (요약·대기 문구 없음)', async () => {
  for (const keys of [['\r'], ['q'], ['\x03']]) {
    const r = tuiRig({ holdOnExit: true, closeDelayMs: 60000 });
    for (const k of keys) r.input.write(k);
    const res = await r.done;
    assert.strictEqual(res.saved, false, JSON.stringify(keys));
    assert.ok(r.elapsed() < 5000);
    assert.ok(!/초 뒤 이 창을 닫습니다/.test(r.screen()), JSON.stringify(keys));
  }
});

test('경계: 바꾼 뒤 q 두 번(버리고 닫기)도 바로 끝나고 파일에 쓰지 않음', async () => {
  const r = tuiRig({ holdOnExit: true, closeDelayMs: 60000 });
  for (const k of ['v', '\x1b[B', ' ', 'q', 'q']) r.input.write(k);
  const res = await r.done;
  assert.strictEqual(res.saved, false);
  assert.ok(!fs.existsSync(r.project.settingsPath), '버린 변경은 기록 안 됨');
  assert.ok(r.elapsed() < 5000);
});

test('정상·경계: 세션 밖(holdOnExit 없음)은 저장해도 기다리지 않음 · 음수 대기 시간은 0 으로', async () => {
  const a = tuiRig({ closeDelayMs: 60000 });
  for (const k of CHANGE_AND_SAVE) a.input.write(k);
  assert.strictEqual((await a.done).saved, true);
  assert.ok(a.elapsed() < 5000 && !/초 뒤 이 창을 닫습니다/.test(a.screen()));
  const b = tuiRig({ holdOnExit: true, closeDelayMs: -5000 });
  for (const k of CHANGE_AND_SAVE) b.input.write(k);
  assert.strictEqual((await b.done).saved, true);
  assert.ok(b.elapsed() < 5000);
});

test('정상: 프로젝트 자체 .claude 가 가진 항목은 ↷ 표시, 바꿔도 적용 안 된다고 알림', () => {
  let st = createState({ manifest, layers: layers(), projectName: 'p', skipped: new Set(['hook:solo']), view: 'stack' });
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
  let st = createState({ manifest: m2, layers: layers(), projectName: 'p\x1b[2J', view: 'stack' });
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
  const st = createState({ manifest: m3, layers: layers(), projectName: 'p', view: 'stack' });
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
  const st = press(createState({ manifest, layers: layers(), projectName: '아주긴한글프로젝트이름입니다', view: 'stack' }), K('a', 'a')).st;
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

// ── 종류별 보기 (기본, 결정 33) — 종류 → 용도(체크리스트 절) → 항목 ─────────────
const typed = {
  ...manifest,
  layout: [
    { type: 'setting', groups: [{ title: '', items: ['setting:plug x'] }] },
    { type: 'hook', groups: [{ title: '안전', items: ['hook:lock', 'hook:solo'] }, { title: '개발 품질', items: ['hook:a', 'hook:b'] }] },
    { type: 'rule', groups: [{ title: '', items: ['rule:r.md'] }] },
    { type: 'agent', groups: [{ title: '메타', items: ['agent:shared'] }] },
    { type: 'skill', groups: [{ title: '프론트엔드', items: ['skill:s1', 'skill:s2'] }] },
  ],
};
const tfresh = (l = layers(), m = typed) => createState({ manifest: m, layers: l, projectName: 'p' });
const teff = (st, m = typed) => resolve(m, [{ source: 'profile', ...st.drafts.profile }, { source: 'project', ...st.drafts.project }, st.gugbab]);

test('종류별 보기(정상): 기본 화면은 종류 → 용도, 절 없는 종류(설정·룰)는 처음엔 접혀 있고 펼치면 항목이 바로, 체크리스트 순서 그대로', () => {
  let st = tfresh();
  assert.strictEqual(st.view, 'type');
  assert.deepStrictEqual(ids(st), ['type:setting', 'type:hook', 'grp:hook:0', 'grp:hook:1', 'type:rule', 'type:agent', 'grp:agent:0', 'type:skill', 'grp:skill:0']);
  assert.deepStrictEqual(rowsOf(st).map((r) => r.label).slice(1, 4), ['훅', '안전', '개발 품질']);
  st = press(goto(st, 'type:rule'), 'right').st;
  assert.deepStrictEqual(ids(st).slice(4, 6), ['type:rule', 'rule:r.md'], '룰은 용도 없이 항목이 바로');
  st.expanded.add('grp:hook:0'); st._rows = null;
  assert.deepStrictEqual(ids(st).slice(2, 5), ['grp:hook:0', 'hook:lock', 'hook:solo'], '용도 안 항목은 체크리스트 순서(이름순 아님)');
});

test('종류별 보기(정상): 용도 그룹에서 Space = 안의 항목 하나씩 일괄 켜기·끄기, 종류에서 Space = 그 종류 전체', () => {
  let st = goto(tfresh(), 'grp:skill:0');
  st = press(st, 'space').st;
  assert.ok(teff(st).enabled.has('skill:s1') && teff(st).enabled.has('skill:s2'));
  assert.deepStrictEqual(st.drafts.project.enable.sort(), ['skill:s1', 'skill:s2'], '용도는 이름 있는 묶음이 아니라 항목 단위로 기록');
  st = press(st, 'space').st;
  assert.ok(!teff(st).enabled.has('skill:s1') && !teff(st).enabled.has('skill:s2'));
  st = goto(st, 'type:hook');
  st = press(st, 'space').st; // 훅 전부 켜져 있음(lock·a·b·solo) → 끄기, 🔒 는 건너뜀
  assert.ok(!teff(st).enabled.has('hook:a') && !teff(st).enabled.has('hook:solo'));
  assert.ok(teff(st).enabled.has('hook:lock'), '🔒 고정은 종류 일괄에서도 그대로');
});

test('종류별 보기(정상): 설명칸 — 용도 설명, 항목은 속한 블록·묶음과 연관 관계를 그대로 보여 줌', () => {
  let st = goto(tfresh(), 'grp:hook:1');
  const r = relationLines(st, rowsOf(st)[st.cursor], teff(st));
  assert.match(r[0], /\[개발 품질\] 2개 중 2개 켜짐/);
  assert.match(r[1], /용도 = 계획서 체크리스트의 분류/);
  st = goto(press(st, 'right').st, 'hook:b');
  const ri = relationLines(st, rowsOf(st)[st.cursor], teff(st));
  assert.match(ri[0], /속한 곳: 품질 검사/);
  assert.match(ri[1], /필요로 함: rule:r\.md/);
  assert.match(render(st, { cols: 120, rows: 30 }), /p 프리셋 · v 보기/);
});

test('종류별 보기(정상): v 로 블록·묶음 보기 ↔ 종류별 보기, 저장 안 한 변경은 유지', () => {
  let st = press(goto(tfresh(), 'grp:skill:0'), 'space').st;
  st = press(st, K('v', 'v')).st;
  assert.strictEqual(st.view, 'stack');
  assert.ok(ids(st).includes('block:st') && ids(st).includes('sec:bundles'));
  assert.match(st.message, /블록·묶음/);
  assert.ok(teff(st).enabled.has('skill:s1'), '보기를 바꿔도 변경은 그대로');
  st = press(st, K('v', 'v')).st;
  assert.strictEqual(st.view, 'type');
  assert.strictEqual(ids(st)[0], 'type:setting');
  assert.ok(!ids(st).includes('setting:plug x'), '돌아오면 처음처럼 접힘');
});

test('종류별 보기(정상): 검색은 종류·용도를 펼쳐 맞는 항목을 보여 주고, 용도 이름이면 그 안 전체', () => {
  let st = press(tfresh(), K('/', '/'), ...'solo'.split('').map((c) => K(c, c))).st;
  assert.deepStrictEqual(ids(st), ['type:hook', 'grp:hook:0', 'hook:solo']);
  assert.strictEqual(rowsOf(st)[st.cursor].id, 'hook:solo');
  st = press(tfresh(), K('/', '/'), ...'개발'.split('').map((c) => K(c, c)), 'return').st;
  assert.deepStrictEqual(ids(st), ['type:hook', 'grp:hook:1', 'hook:a', 'hook:b']);
});

test('종류별 보기(악성): 전부 🔒 인 용도는 Space 로 안 꺼지고, 용도 이름의 이스케이프·제어문자는 지워서 그림', () => {
  const m = JSON.parse(JSON.stringify(typed));
  m.layout[1].groups.unshift({ title: '필수\x1b[2J\u0007', items: ['hook:lock'] });
  m.layout[1].groups[1].items = ['hook:solo'];
  let st = goto(tfresh(layers(), m), 'grp:hook:0');
  const screen = render(st, { cols: 100, rows: 30 });
  assert.ok(!screen.includes('\x1b[2J') && !screen.includes('\u0007'));
  assert.match(screen, /필수/);
  st = press(st, 'space').st;
  assert.match(st.message, /🔒/);
  assert.deepStrictEqual(st.ops.project, []);
});

test('종류별 보기(악성): layout 이 없는 항목·다른 종류 항목·중복·이상한 값을 가리켜도 항목이 빠지거나 두 번 나오지 않음', () => {
  const m = JSON.parse(JSON.stringify(typed));
  m.layout[1].groups[0].items.push('skill:s1', 'hook:ghost', 'hook:a', 42, null); // 다른 종류·없는 항목·뒤 그룹과 중복·이상한 값
  m.layout.push('broken', { type: 'hook', groups: 'x' });
  const tree = buildTree(m);
  const all = tree.flatMap((s) => s.ids);
  assert.deepStrictEqual([...all].sort(), Object.keys(m.items).sort(), '모든 항목이 정확히 한 번');
  const hook = tree.find((s) => s.id === 'type:hook');
  assert.ok(!hook.ids.includes('skill:s1') && !hook.ids.includes('hook:ghost'));
});

test('종류별 보기(경계): layout 이 없는 옛 manifest 는 종류 아래 항목을 바로, 일부만 빠지면 그 종류 끝 "기타" 로', () => {
  const st = tfresh(layers(), manifest);
  assert.deepStrictEqual(ids(st).filter((x) => x.startsWith('type:')), ['type:setting', 'type:hook', 'type:rule', 'type:agent', 'type:skill']);
  assert.ok(buildTree(manifest).find((x) => x.id === 'type:hook').children.every((c) => c.kind === 'item'), '절이 없으면 항목이 바로');
  assert.ok(ids(press(goto(st, 'type:hook'), 'right').st).includes('hook:a'), '펼치면 보임');
  const m = JSON.parse(JSON.stringify(typed));
  m.layout[1].groups = [{ title: '안전', items: ['hook:lock'] }];
  const hook = buildTree(m).find((s) => s.id === 'type:hook');
  assert.deepStrictEqual(hook.children.map((c) => c.label), ['안전', '기타']);
  assert.deepStrictEqual(hook.children[1].ids.sort(), ['hook:a', 'hook:b', 'hook:solo']);
});

test('종류별 보기(경계): a = 모두 펼치기 / 다시 a = 종류만 남기고 접기 (항목이 바로 달린 종류도 깨지지 않음)', () => {
  let st = press(tfresh(), K('a', 'a')).st;
  assert.ok(ids(st).includes('hook:a') && ids(st).includes('skill:s2'));
  st = press(st, K('a', 'a')).st;
  assert.ok(!ids(st).includes('hook:a'));
  assert.ok(ids(st).includes('type:rule') && !ids(st).includes('rule:r.md'), '다시 접으면 처음 화면처럼(항목만 달린 종류는 접힘)');
  assert.ok(ids(st).includes('grp:hook:0'), '용도 목록은 보임');
});

test('경계: 화면 높이를 꽉 채워도 맨 아래 키 도움말 줄이 잘리지 않음 (본문 높이 = 전체 - 9)', () => {
  for (const rows of [12, 24, 40]) {
    const out = render(tfresh(), { cols: 120, rows }).split('\n');
    assert.strictEqual(out.length, rows, `${rows}줄`);
    assert.match(out[out.length - 1], /Enter 저장 · q 닫기/, `${rows}줄 화면의 마지막 줄`);
    const p = render(press(tfresh(), K('p', 'p')).st, { cols: 120, rows }).split('\n');
    assert.match(p[p.length - 1], /Esc 취소/, `프리셋 화면 ${rows}줄`);
  }
});

test('종류별 보기(정상): 긴 용도 이름은 목록엔 괄호 앞만, 설명칸엔 체크리스트 제목 전체', () => {
  const m = JSON.parse(JSON.stringify(typed));
  m.layout[1].groups[1].title = '메모리 공유 (레포에 `memory/` 를 두고 git 으로 여러 PC 공유하는 프로젝트용)';
  const st = goto(tfresh(layers(), m), 'grp:hook:1');
  const row = rowsOf(st)[st.cursor];
  assert.strictEqual(row.label, '메모리 공유');
  assert.match(relationLines(st, row, teff(st, m))[0], /^\[메모리 공유 \(레포에 `memory\/` 를 두고 git 으로 여러 PC 공유하는 프로젝트용\)\]/);
  const only = JSON.parse(JSON.stringify(typed)); only.layout[1].groups[0].title = '(괄호만)';
  assert.strictEqual(buildTree(only).find((x) => x.id === 'type:hook').children[0].label, '(괄호만)', '괄호뿐인 제목은 그대로');
});
