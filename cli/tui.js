// /harness 화면 (계획서 5.2, 4단계) — 묶음·블록·개별 항목을 보고 Space 로 켜고 끈다
//   상태 계산(createState·handleKey)과 그리기(render)는 순수 함수, 터미널 입출력은 runTui
//   의존성 없이 Node 기본 readline 만 쓴다 (결정 24 — @inquirer 체크박스로는 Tab 범위 전환·검색·묶음 일부 켬 표시가 안 됨)
//   저장할 때는 화면에서 한 동작(ops)을 그때의 파일 내용 위에 다시 적용한다 — 화면을 연 뒤 다른 세션이 바꾼 것을 지우지 않게
'use strict';
const readline = require('readline');
const { resolve, expand } = require('./resolve');
const { loadLayers, readSkipped } = require('./layers');
const { applyToggle, applyPreset, explainUnchanged, commitLayer, layerIndex, RESTART_TYPES } = require('./apply');

const TYPES = [['setting', '설정'], ['hook', '훅'], ['rule', '룰'], ['command', '커맨드'], ['agent', '에이전트'], ['skill', '스킬']];
const SCOPE_NAME = { project: '이 프로젝트', profile: '모든 프로젝트' };
const KEYS_HELP = '↑↓ 이동 · Space 켜기/끄기 · Tab 범위 · / 검색 · p 프리셋 · Enter 저장 · q 닫기';
const CTRL_RE = /[\u0000-\u001f\u007f-\u009f]/;
const clean = (s) => String(s == null ? '' : s).replace(/\u001b\][^\u0007\u001b]*(?:\u0007|\u001b\\)?/g, '').replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '').replace(/[\u0000-\u001f\u007f-\u009f]/g, '');
const own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);

// 화면 폭 — 한글·전각·이모지는 2칸
function charWidth(cp) {
  if (cp >= 0x1100 && cp <= 0x115f) return 2;
  if ((cp >= 0x2e80 && cp <= 0xa4cf) || (cp >= 0xac00 && cp <= 0xd7a3) || (cp >= 0xf900 && cp <= 0xfaff)) return 2;
  if ((cp >= 0xfe30 && cp <= 0xfe4f) || (cp >= 0xff00 && cp <= 0xff60) || (cp >= 0xffe0 && cp <= 0xffe6)) return 2;
  if (cp >= 0x1f300 && cp <= 0x1faff) return 2;
  if (cp === 0x2705 || cp === 0x274c || cp === 0x2b1b || cp === 0x2b1c) return 2; // ✅ ❌ ⬛ ⬜ — 기본이 그림 글자(2칸)
  return 1;
}
function strWidth(s) { let w = 0; for (const ch of String(s)) w += charWidth(ch.codePointAt(0)); return w; }
function fit(s, width) {
  if (width <= 0) return '';
  let out = ''; let w = 0;
  for (const ch of String(s)) {
    const cw = charWidth(ch.codePointAt(0));
    if (w + cw > width) break;
    out += ch; w += cw;
  }
  return out;
}
const pad = (s, width) => { const f = fit(s, width); return f + ' '.repeat(Math.max(0, width - strWidth(f))); };

function stripSource(l) { const { source, ...rest } = l || {}; return JSON.parse(JSON.stringify(rest)); }

function createState({ manifest, layers, projectName, scope = 'project', skipped = new Set() }) {
  const groupsOf = {};
  const rel = manifest.relations || {};
  for (const [kind, key] of [['bundles', 'bundle'], ['blocks', 'block']]) {
    for (const [k, g] of Object.entries(rel[kind] || {})) for (const id of g.items || []) (groupsOf[id] = groupsOf[id] || []).push(clean(g.title || `${key}:${k}`));
  }
  const st = {
    manifest, projectName: clean(projectName), groupsOf, skipped,
    gugbab: layers[2] || { source: '.gugbab.json' },
    initial: { profile: stripSource(layers[0]), project: stripSource(layers[1]) },
    drafts: { profile: stripSource(layers[0]), project: stripSource(layers[1]) },
    ops: { profile: [], project: [] },
    scope, cursor: 0, top: 0, filter: '', mode: 'list', presetCursor: 0, message: '', confirmQuit: false,
    _rows: null,
  };
  st.cursor = firstEntry(rowsOf(st));
  return st;
}

const layersOf = (st, which = 'drafts') => [{ source: 'profile', ...st[which].profile }, { source: 'project', ...st[which].project }, st.gugbab];
const effective = (st) => resolve(st.manifest, layersOf(st));
const dirty = (st) => st.ops.profile.length + st.ops.project.length > 0;

function rowsOf(st) {
  if (st._rows && st._rows.filter === st.filter) return st._rows.rows;
  const m = st.manifest;
  const rel = m.relations || {};
  const q = st.filter.toLowerCase();
  const hit = (id, label) => !q || id.toLowerCase().includes(q) || String(label).toLowerCase().includes(q);
  const rows = [];
  const section = (title, entries) => {
    const shown = entries.filter(e => hit(e.id, e.label));
    if (!shown.length) return;
    rows.push({ kind: 'header', text: `${title} (${shown.length})` });
    for (const e of shown) rows.push({ kind: 'entry', ...e });
  };
  section('묶음 — 훅·룰·커맨드를 기능별로', Object.entries(rel.bundles || {}).map(([k, g]) => ({ id: `bundle:${k}`, label: clean(g.title || k), group: true })));
  section('스택 블록 — 스킬·에이전트', Object.entries(rel.blocks || {}).map(([k, g]) => ({ id: `block:${k}`, label: clean(g.title || k), group: true })));
  for (const [type, label] of TYPES) {
    section(label, Object.entries(m.items || {}).filter(([, it]) => it.type === type).map(([id]) => ({ id, label: clean(id.replace(/^[a-z]+:/, '')), group: false })));
  }
  st._rows = { filter: st.filter, rows };
  return rows;
}

function entryState(st, row, res) {
  const ids = row.group ? (expand(row.id, st.manifest) || []) : [row.id];
  const on = ids.filter(i => res.enabled.has(i)).length;
  const lockedAll = ids.length > 0 && ids.every(i => res.locked.has(i));
  // docs 표기와 같은 아이콘 (2026-10-17 사용자 요청) — ✅ 켬 · ⬜ 끔 · 🟨 일부 켬 · 🔒 고정. 모두 화면 2칸
  const mark = lockedAll ? '🔒' : on === ids.length && ids.length ? '✅' : on === 0 ? '⬜' : '🟨';
  return { ids, on, total: ids.length, lockedAll, mark };
}

function firstEntry(rows) { const i = rows.findIndex(r => r.kind === 'entry'); return i < 0 ? 0 : i; }
function move(st, delta) {
  const rows = rowsOf(st);
  if (!rows.length) return st;
  let i = st.cursor;
  const step = delta > 0 ? 1 : -1;
  let left = Math.abs(delta);
  while (left > 0) {
    let j = i + step;
    while (j >= 0 && j < rows.length && rows[j].kind !== 'entry') j += step;
    if (j < 0 || j >= rows.length) break;
    i = j; left--;
  }
  return { ...st, cursor: i };
}

function toggleAt(st) {
  const rows = rowsOf(st);
  const row = rows[st.cursor];
  if (!row || row.kind !== 'entry') return st;
  const m = st.manifest;
  const before = effective(st);
  const es = entryState(st, row, before);
  const scopeNote = st.scope === 'profile' ? ' (모든 프로젝트)' : '';
  if (es.lockedAll) {
    return { ...st, message: explainUnchanged(es.ids, 'off', layersOf(st), before, layerIndex(st.scope), m).slice(0, 2).join(' · ') };
  }
  const action = es.on === es.total ? 'off' : 'on';
  const drafts = { ...st.drafts, [st.scope]: applyToggle(st.drafts[st.scope], action, row.id, m) };
  const next = { ...st, drafts };
  const after = effective(next);
  const changed = es.ids.filter(i => before.enabled.has(i) !== after.enabled.has(i));
  // 이 프로젝트에선 위쪽 층이 덮어 안 바뀌어도 기록은 한다 — 모든 프로젝트 범위면 다른 프로젝트에 적용되고,
  // 덮던 설정을 나중에 지우면 이 기록이 살아난다 (CLI on/off 와 같은 동작)
  const ops = { ...st.ops, [st.scope]: [...st.ops[st.scope], [action, row.id]] };
  if (!changed.length) {
    const why = explainUnchanged(es.ids, action, layersOf(next), after, layerIndex(st.scope), m).slice(0, 2).join(' · ');
    return { ...next, ops, message: clean(`${action === 'on' ? '켬' : '끔'} 기록${scopeNote} — 이 프로젝트는 그대로: ${why}`) };
  }
  const extra = after.warnings.filter(w => !before.warnings.includes(w));
  const ownNote = es.ids.some(id => st.skipped.has(id)) ? ' — ↷ 이 프로젝트는 자체 .claude 의 것을 써서 여기엔 적용 안 됨' : '';
  return { ...next, ops, message: clean(`${action === 'on' ? '켬' : '끔'}: ${row.id}${scopeNote}${ownNote}${extra.length ? ` — ⚠ ${extra[0]}` : ''}`) };
}

function presetNames(m) { return Object.keys((m.relations || {}).presets || {}); }

function handleKey(st0, key) {
  const st = { ...st0 };
  const name = key && key.name;
  const ch = key && typeof key.ch === 'string' ? key.ch : '';
  if (name !== 'q' && name !== 'escape' && ch !== 'q') st.confirmQuit = false;

  if (st.mode === 'search') {
    if (name === 'return') return { state: { ...st, mode: 'list' }, action: null };
    if (name === 'escape') { const s = { ...st, mode: 'list', filter: '' }; return { state: { ...s, cursor: firstEntry(rowsOf(s)) }, action: null }; }
    if (name === 'backspace') { const s = { ...st, filter: st.filter.slice(0, -1) }; return { state: { ...s, cursor: firstEntry(rowsOf(s)) }, action: null }; }
    if (ch && !CTRL_RE.test(ch) && st.filter.length + ch.length <= 60) { const s = { ...st, filter: st.filter + ch }; return { state: { ...s, cursor: firstEntry(rowsOf(s)) }, action: null }; }
    return { state: st, action: null };
  }

  if (st.mode === 'preset') {
    const names = presetNames(st.manifest);
    if (name === 'escape' || name === 'q') return { state: { ...st, mode: 'list', message: '' }, action: null };
    if (name === 'up' || ch === 'k') return { state: { ...st, presetCursor: Math.max(0, st.presetCursor - 1) }, action: null };
    if (name === 'down' || ch === 'j') return { state: { ...st, presetCursor: Math.min(names.length - 1, st.presetCursor + 1) }, action: null };
    if (name === 'return' && names.length) {
      const p = names[st.presetCursor];
      const drafts = { ...st.drafts, [st.scope]: applyPreset(st.drafts[st.scope], p, st.manifest) };
      const ops = { ...st.ops, [st.scope]: [...st.ops[st.scope], ['preset', p]] };
      return { state: { ...st, drafts, ops, mode: 'list', message: clean(`프리셋 적용: ${p}${st.scope === 'profile' ? ' (모든 프로젝트)' : ''} — Enter 로 저장`) }, action: null };
    }
    return { state: st, action: null };
  }

  const rows = rowsOf(st);
  if (rows[st.cursor] && rows[st.cursor].kind !== 'entry') st.cursor = firstEntry(rows);
  switch (name) {
    case 'up': return { state: move(st, -1), action: null };
    case 'down': return { state: move(st, 1), action: null };
    case 'pageup': return { state: move(st, -10), action: null };
    case 'pagedown': return { state: move(st, 10), action: null };
    case 'home': return { state: { ...st, cursor: firstEntry(rows) }, action: null };
    case 'end': return { state: { ...st, cursor: Math.max(0, rows.length - 1) }, action: null };
    case 'space': return { state: toggleAt(st), action: null };
    case 'tab': {
      const scope = st.scope === 'project' ? 'profile' : 'project';
      return { state: { ...st, scope, message: scope === 'profile' ? '범위: 모든 프로젝트 — 여기서 바꾸면 모든 프로젝트에 적용 (프로젝트별 설정이 있으면 그쪽이 우선)' : '범위: 이 프로젝트' }, action: null };
    }
    case 'return': return { state: st, action: 'save' };
    case 'escape': break;
    default:
      if (ch === 'j') return { state: move(st, 1), action: null };
      if (ch === 'k') return { state: move(st, -1), action: null };
      if (ch === '/') return { state: { ...st, mode: 'search', message: '' }, action: null };
      if (ch === 'p') return { state: presetNames(st.manifest).length ? { ...st, mode: 'preset', presetCursor: 0, message: '' } : { ...st, message: '프리셋이 없습니다' }, action: null };
      if (ch !== 'q') return { state: st, action: null };
  }
  // q · Esc — 바뀐 게 있으면 한 번은 확인
  if (dirty(st) && !st0.confirmQuit) return { state: { ...st, confirmQuit: true, message: '저장하지 않은 변경이 있습니다 — q·Esc 를 한 번 더 누르면 버리고 닫습니다 (Enter 는 저장)' }, action: null };
  return { state: st, action: 'quit' };
}

function render(st, { cols = 80, rows: height = 24 } = {}) {
  const res = effective(st);
  const saved = resolve(st.manifest, layersOf(st, 'initial'));
  const items = st.manifest.items || {};
  const out = [];
  const scopes = ['project', 'profile'].map(s => (s === st.scope ? `[${SCOPE_NAME[s]}]` : ` ${SCOPE_NAME[s]} `)).join(' ');
  out.push(fit(` gugbab 하네스 · ${st.projectName}   범위: ${scopes}`, cols));
  const counts = TYPES.map(([t, label]) => {
    const all = Object.keys(items).filter(id => items[id].type === t);
    return `${label} ${all.filter(id => res.enabled.has(id)).length}/${all.length}`;
  });
  out.push(fit(` ${counts.join(' · ')} · 🔒 ${res.locked.size}${dirty(st) ? ' · ● 저장 안 됨' : ''}`, cols));
  out.push('─'.repeat(Math.max(0, cols)));
  const bodyH = Math.max(0, height - 5);

  if (st.mode === 'preset') {
    const presets = (st.manifest.relations || {}).presets || {};
    const names = presetNames(st.manifest);
    const top = Math.max(0, Math.min(st.presetCursor - Math.floor(bodyH / 2), names.length - bodyH));
    for (const [i, n] of names.slice(top, top + bodyH).entries()) {
      const p = presets[n];
      const line = `${top + i === st.presetCursor ? '›' : ' '} ${pad(clean(n), 16)} ${clean(p.title || '')}  (${(p.enable || []).map(clean).join(', ')})`;
      out.push(top + i === st.presetCursor ? `\x1b[7m${fit(line, cols)}\x1b[0m` : fit(line, cols));
    }
    out.push(...Array(Math.max(0, bodyH - Math.min(bodyH, names.length))).fill(''));
    out.push(fit(` 프리셋을 ${SCOPE_NAME[st.scope]}에 적용 — Enter 적용 · Esc 돌아가기`, cols));
    out.push(fit(' ↑↓ 이동 · Enter 적용 · Esc 취소', cols));
    return out.slice(0, height).join('\n');
  }

  const rows = rowsOf(st);
  if (!rows.length) {
    out.push(fit('   맞는 항목이 없습니다 — / 로 검색어를 바꾸거나 Esc 로 지우세요', cols));
    out.push(...Array(Math.max(0, bodyH - 1)).fill(''));
  } else {
    let top = st.top || 0;
    if (st.cursor < top) top = st.cursor;
    if (st.cursor >= top + bodyH) top = st.cursor - bodyH + 1;
    top = Math.max(0, Math.min(top, Math.max(0, rows.length - bodyH)));
    st.top = top; // 다음 그리기의 스크롤 위치 (화면 상태만)
    const labelW = Math.max(8, Math.min(30, Math.floor(cols * 0.35)));
    for (let i = top; i < Math.min(rows.length, top + bodyH); i++) {
      const r = rows[i];
      if (r.kind === 'header') { out.push(fit(` ── ${r.text} ${'─'.repeat(cols)}`, cols)); continue; }
      const es = entryState(st, r, res);
      const was = entryState(st, r, saved);
      const changed = es.ids.some(id => res.enabled.has(id) !== saved.enabled.has(id)) || was.on !== es.on;
      const own = es.ids.filter(id => st.skipped.has(id)).length;
      const ownNote = own ? ` · ↷ 자체 .claude 우선${r.group ? ` ${own}` : ''}` : '';
      const detail = (r.group ? `${es.on}/${es.total} · ${r.id}` : (st.groupsOf[r.id] || []).join(', ')) + ownNote;
      const line = `${i === st.cursor ? '›' : ' '} ${changed ? '*' : ' '} ${es.mark} ${pad(r.label, labelW)}  ${detail}`;
      out.push(i === st.cursor ? `\x1b[7m${fit(line, cols)}\x1b[0m` : fit(line, cols));
    }
    out.push(...Array(Math.max(0, bodyH - Math.min(bodyH, rows.length - top))).fill(''));
  }
  const msg = st.mode === 'search' ? `검색: ${clean(st.filter)}▏ (Enter 확정 · Esc 지우기)` : clean(st.message);
  out.push(fit(` ${msg}`, cols));
  out.push(fit(` ${KEYS_HELP}`, cols));
  return out.slice(0, height).join('\n');
}

function replayOps(layer, ops, manifest) {
  let l = layer;
  for (const [action, id] of ops) l = action === 'preset' ? applyPreset(l, id, manifest) : applyToggle(l, action, id, manifest);
  return l;
}

// 터미널에서 실행 — 저장하면 { saved, turnedOn, turnedOff, needRestart, warnings }
function runTui({ manifest, paths, project, input = process.stdin, output = process.stdout, composeFn, holdOnExit = false }) {
  if (!input.isTTY || typeof input.setRawMode !== 'function') return Promise.reject(new Error('터미널에서만 화면을 띄울 수 있습니다'));
  let st = createState({ manifest, layers: loadLayers(paths, project), projectName: project.id, skipped: project.configDir ? readSkipped(project.configDir) : new Set() });
  return new Promise((resolveP, rejectP) => {
    const size = () => ({ cols: output.columns || 80, rows: output.rows || 24 });
    const draw = () => output.write(`\x1b[H\x1b[2J${render(st, size())}`);
    const restore = () => { output.write('\x1b[?25h\x1b[?1049l'); try { input.setRawMode(false); } catch { /* 이미 닫힘 */ } };
    const finish = (save) => {
      input.removeListener('keypress', onKey);
      if (typeof output.removeListener === 'function') output.removeListener('resize', draw);
      restore();
      let result = { saved: false, nothing: save, turnedOn: [], turnedOff: [], needRestart: false, warnings: [] };
      if (save && dirty(st)) {
        try {
          const before = resolve(manifest, loadLayers(paths, project));
          let last = null;
          for (const scope of ['profile', 'project']) {
            if (!st.ops[scope].length) continue;
            last = commitLayer({ manifest, paths, project, scope, mutate: (cur) => replayOps(cur, st.ops[scope], manifest), composeFn });
          }
          const after = last.after;
          const turnedOn = [...after.enabled].filter(i => !before.enabled.has(i));
          const turnedOff = [...before.enabled].filter(i => !after.enabled.has(i));
          const needRestart = [...turnedOn, ...turnedOff].some(i => RESTART_TYPES.has((manifest.items[i] || {}).type));
          result = { saved: true, turnedOn, turnedOff, needRestart, warnings: after.warnings, scopes: ['profile', 'project'].filter(s => st.ops[s].length) };
        } catch (e) { rejectP(e); return; }
      }
      const done = () => { input.pause(); resolveP(result); };
      if (!holdOnExit) return done();
      output.write(`${summaryLines(result).join('\n')}\n\n아무 키나 누르면 이 창을 닫습니다\n`);
      try { input.setRawMode(true); } catch { /* 무시 */ }
      input.resume();
      input.once('keypress', () => { try { input.setRawMode(false); } catch { /* 무시 */ } done(); });
    };
    const onKey = (str, key = {}) => {
      if (key.ctrl && key.name === 'c') return finish(false);
      let r;
      try { r = handleKey(st, { name: key.name || str, ch: str || '' }); } catch (e) { st = { ...st, message: clean(e.message) }; return draw(); }
      st = r.state;
      if (r.action === 'save') return finish(true);
      if (r.action === 'quit') return finish(false);
      return draw();
    };
    readline.emitKeypressEvents(input);
    input.setRawMode(true);
    input.resume();
    output.write('\x1b[?1049h\x1b[?25l');
    input.on('keypress', onKey);
    if (typeof output.on === 'function') output.on('resize', draw);
    draw();
  });
}

function summaryLines(r) {
  if (!r.saved) return [r.nothing ? '[gugbab] 바꾼 것이 없어 그대로 닫았습니다' : '[gugbab] 저장하지 않고 닫았습니다'];
  const lines = [`[gugbab] 저장했습니다 (${(r.scopes || []).map(s => SCOPE_NAME[s]).join(' · ')})`];
  if (r.turnedOn.length) lines.push(`  켬: ${r.turnedOn.join(', ')}`);
  if (r.turnedOff.length) lines.push(`  끔: ${r.turnedOff.join(', ')}`);
  if (!r.turnedOn.length && !r.turnedOff.length) lines.push((r.scopes || []).includes('profile') ? '  이 프로젝트에서는 바뀐 항목 없음 (다른 설정이 덮고 있음 — 다른 프로젝트에는 적용)' : '  실제로 바뀐 항목 없음');
  lines.push(r.needRestart ? '  룰·에이전트·설정이 바뀌었습니다 — claude 쪽에서 /exit 하면 대화를 이어서 다시 시작합니다' : '  훅·스킬·커맨드는 바로 반영됩니다');
  return lines;
}

module.exports = { createState, handleKey, render, rowsOf, strWidth, replayOps, runTui, summaryLines };
