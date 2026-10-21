// /harness 화면 (계획서 5.2, 4단계 · 2026-10-17 트리) — 종류 → 용도 → 항목을 접고 펼치며 Space 로 켜고 끈다
//   상태 계산(createState·handleKey)과 그리기(render)는 순수 함수, 터미널 입출력은 runTui
//   의존성 없이 Node 기본 readline 만 쓴다 (결정 24 — @inquirer 체크박스로는 Tab 범위 전환·검색·묶음 일부 켬 표시가 안 됨)
//   저장할 때는 화면에서 한 동작(ops)을 그때의 파일 내용 위에 다시 적용한다 — 화면을 연 뒤 다른 세션이 바꾼 것을 지우지 않게
//   트리(결정 33): 종류(설정·훅·룰·커맨드·에이전트·스킬) → 용도(계획서 체크리스트 절) → 항목. 그룹·종류에서 Space = 일괄(🔒 고정은 건너뜀)
//   v 키로 결정 30 의 블록·묶음 보기(스택 블록·묶음·단독 항목 → 블록·묶음 → 항목)로 전환
'use strict';
const readline = require('readline');
const { resolve, expand } = require('./resolve');
const { loadLayers, readSkipped } = require('./layers');
const { applyToggle, applyPreset, explainUnchanged, commitLayer, layerIndex, RESTART_TYPES } = require('./apply');

const TYPES = [['setting', '설정'], ['hook', '훅'], ['rule', '룰'], ['command', '커맨드'], ['agent', '에이전트'], ['skill', '스킬']];
const TYPE_NAME = Object.fromEntries(TYPES);
const SCOPE_NAME = { project: '이 프로젝트', profile: '모든 프로젝트' };
const LEGEND = '✅ 켬 · ⬜ 끔 · 🟨 일부만 켬(그룹 안 일부) · 🔒 고정(끌 수 없음) · 📌 프로젝트 파일이 정함(여기서 못 바꿈) · * 저장 안 한 변경';
const KEYS_HELP = '↑↓ 이동 · →← 펼침 · a 전체 · Space 켬/끔 · Tab 범위 · / 검색 · p 프리셋 · v 보기 · Enter 저장 · q 닫기';
const CTRL_RE = /[\u0000-\u001f\u007f-\u009f]/;
const clean = (s) => String(s == null ? '' : s).replace(/\u001b\][^\u0007\u001b]*(?:\u0007|\u001b\\)?/g, '').replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '').replace(/[\u0000-\u001f\u007f-\u009f]/g, '');

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

// ── 트리 뼈대 (manifest 에서 만든다) ─────────────────────────────────
//   node: { id, kind: 'section'|'group'|'item', label, children: [node], ids: [항목 id], op: 토글 기록에 쓰는 id | null }
//   보기 두 가지: 'type'(기본, 결정 33) = 종류 → 용도 → 항목 (계획서 체크리스트와 같은 구성)
//                'stack' = 스택 블록·묶음·단독 항목 (결정 30, v 키로 전환)
const own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
const itemLabel = (id) => clean(id.replace(/^[a-z]+:/, ''));
const itemNode = (id) => ({ id, kind: 'item', label: itemLabel(id), children: [], ids: [id], op: id });

function buildTree(manifest, view = 'type') {
  return view === 'stack' ? buildStackTree(manifest) : buildTypeTree(manifest);
}

// 종류 → 용도 → 항목. 용도는 manifest.layout(체크리스트 `###` 절, 적힌 순서). 절이 없는 종류(룰·커맨드 등)는 항목이 바로 온다.
// layout 에 없는 항목(옛 manifest 등)은 그 종류 끝 "기타" 로 — 어느 항목도 화면에서 빠지지 않게
function buildTypeTree(manifest) {
  const items = manifest.items || {};
  const layout = Array.isArray(manifest.layout) ? manifest.layout : [];
  const placed = new Set();
  return TYPES.map(([t, name]) => {
    const sec = layout.find((s) => s && s.type === t) || { groups: [] };
    const groups = [];
    for (const g of Array.isArray(sec.groups) ? sec.groups : []) {
      const ids = (Array.isArray(g.items) ? g.items : []).filter((id) => typeof id === 'string' && own(items, id) && items[id].type === t && !placed.has(id));
      ids.forEach((id) => placed.add(id));
      if (ids.length) groups.push({ title: clean(g.title || ''), ids });
    }
    const rest = Object.keys(items).filter((id) => items[id].type === t && !placed.has(id));
    rest.forEach((id) => placed.add(id));
    if (rest.length) groups.push({ title: groups.length ? '기타' : '', ids: rest });
    const titled = groups.filter((g) => g.title);
    // 절 제목이 없는 그룹뿐이면 항목을 바로 단다
    const children = titled.length
      // 목록에는 괄호 앞 이름(예: "메모리 공유"), 설명칸에는 체크리스트 절 제목 전체(full)
      ? groups.map((g, i) => ({ id: `grp:${t}:${i}`, kind: 'group', label: (g.title || '기타').replace(/\s*\([^()]*\)\s*$/, '') || g.title, full: g.title || '기타', children: g.ids.map(itemNode), ids: g.ids, op: null }))
      : groups.flatMap((g) => g.ids.map(itemNode));
    return { id: `type:${t}`, kind: 'section', label: name, children, ids: groups.flatMap((g) => g.ids), op: null };
  }).filter((s) => s.ids.length);
}

// 처음 펼칠 노드 — 용도 그룹이 있는 종류만 펼쳐 용도 목록을 보이고, 항목이 바로 달린 종류(설정·룰·커맨드)는 접어
// 첫 화면에 모든 종류가 한눈에 들어오게 한다. 블록·묶음 보기는 큰 갈래 전부
function initialExpanded(tree) {
  return new Set(tree.filter((s) => s.children.some((c) => c.kind !== 'item')).map((s) => s.id));
}

function buildStackTree(manifest) {
  const rel = manifest.relations || {};
  const items = manifest.items || {};
  const groupNode = (key, prefix, g) => {
    const members = (g.items || []).filter((i) => Object.prototype.hasOwnProperty.call(items, i));
    return { id: `${prefix}:${key}`, kind: 'group', label: clean(g.title || key), children: members.map(itemNode), ids: members, op: `${prefix}:${key}` };
  };
  const blocks = Object.entries(rel.blocks || {}).map(([k, g]) => groupNode(k, 'block', g));
  const bundles = Object.entries(rel.bundles || {}).map(([k, g]) => groupNode(k, 'bundle', g));
  const inGroup = new Set([...blocks, ...bundles].flatMap((n) => n.ids));
  const typeGroups = TYPES.map(([t, name]) => {
    const ids = Object.keys(items).filter((id) => items[id].type === t && !inGroup.has(id));
    return { id: `type:${t}`, kind: 'group', label: name, children: ids.map(itemNode), ids, op: null };
  }).filter((n) => n.ids.length);
  const section = (id, lbl, children) => ({ id, kind: 'section', label: lbl, children, ids: [...new Set(children.flatMap((c) => c.ids))], op: null });
  return [
    section('sec:blocks', '스택 블록 — 스킬·에이전트·언어 룰', blocks),
    section('sec:bundles', '묶음 — 훅·룰·커맨드 기능 단위', bundles),
    section('sec:standalone', '단독 항목 — 묶음·블록에 안 속한 것', typeGroups),
  ].filter((s) => s.ids.length);
}

// 항목 → 속한 블록·묶음 이름들 (보기와 무관하게 relations 에서)
function membershipOf(manifest) {
  const rel = manifest.relations || {};
  const items = manifest.items || {};
  const out = {};
  for (const src of [rel.blocks || {}, rel.bundles || {}]) {
    for (const [k, g] of Object.entries(src)) for (const id of (g && g.items) || []) if (own(items, id)) (out[id] = out[id] || []).push(clean(g.title || k));
  }
  return out;
}

function createState({ manifest, layers, projectName, scope = 'project', skipped = new Set(), view = 'type' }) {
  const v = view === 'stack' ? 'stack' : 'type';
  const tree = buildTree(manifest, v);
  const st = {
    manifest, projectName: clean(projectName), tree, view: v, memberOf: membershipOf(manifest), skipped,
    gugbab: layers[2] || { source: '.gugbab.json' },
    initial: { profile: stripSource(layers[0]), project: stripSource(layers[1]) },
    drafts: { profile: stripSource(layers[0]), project: stripSource(layers[1]) },
    ops: { profile: [], project: [] },
    expanded: initialExpanded(tree), // 용도가 있는 종류만 펼침 → 종류·용도 목록이 한눈에
    scope, cursor: 0, top: 0, filter: '', mode: 'list', presetCursor: 0, message: '', confirmQuit: false,
    _rows: null,
  };
  return st;
}

const layersOf = (st, which = 'drafts') => [{ source: 'profile', ...st[which].profile }, { source: 'project', ...st[which].project }, st.gugbab];
const effective = (st) => resolve(st.manifest, layersOf(st));
const dirty = (st) => st.ops.profile.length + st.ops.project.length > 0;

// 프로젝트 파일(.gugbab.json — 파생 하네스는 그 하네스의 파일 이름)이 정해 둔 항목 📌 — 🔒 처럼 "이 프로젝트에서는 못 바꿈"인데
// 평범한 ✅·⬜ 로 보여 Space 가 고장 난 것처럼 보였다 (2026-10-21 사용자 보고). 실제 결과가 그 파일의 켬/끔과 같을 때만 📌, 🔒 가 우선
const projectFileName = (st) => clean((st.gugbab && st.gugbab.source) || '.gugbab.json');
function pinnedOf(st, res) {
  const g = st.gugbab || {};
  const key = `${JSON.stringify(g.enable || [])}\u0000${JSON.stringify(g.disable || [])}`;
  if (!st._pinSets || st._pinSets.key !== key) {
    const set = (k) => new Set((Array.isArray(g[k]) ? g[k] : []).filter((x) => typeof x === 'string').flatMap((raw) => expand(raw, st.manifest) || []));
    st._pinSets = { key, on: set('enable'), off: set('disable') };
  }
  const { on, off } = st._pinSets;
  return (id) => (res.locked.has(id) ? null : res.enabled.has(id) ? (on.has(id) ? 'on' : null) : (off.has(id) ? 'off' : null));
}

// ── 보이는 줄 (펼침 상태·검색 반영) ──────────────────────────────────
function rowsOf(st) {
  const key = `${st.view}\u0000${st.filter}\u0000${[...st.expanded].sort().join(',')}`;
  if (st._rows && st._rows.key === key) return st._rows.rows;
  const q = st.filter.toLowerCase();
  const rows = [];
  const hit = (n) => n.id.toLowerCase().includes(q) || n.label.toLowerCase().includes(q);
  // 깊이와 무관하게(종류 → 항목, 종류 → 용도 → 항목 모두) 펼친 노드의 자식을 단다
  const walk = (n, depth) => {
    const open = n.kind !== 'item' && st.expanded.has(n.id);
    rows.push({ ...n, depth, open });
    if (open) for (const c of n.children) walk(c, depth + 1);
  };
  // 검색: 맞는 항목과 그 위 그룹·종류를 펼쳐 보여 준다. 그룹 이름이 맞으면 그 안 전체
  const pick = (n) => {
    if (n.kind === 'item') return hit(n) ? n : null;
    if (n.kind !== 'section' && hit(n)) return n;
    const kids = n.children.map(pick).filter(Boolean);
    return kids.length ? { ...n, children: kids } : null;
  };
  const walkAll = (n, depth) => {
    rows.push({ ...n, depth, open: n.kind !== 'item' });
    for (const c of n.children) walkAll(c, depth + 1);
  };
  for (const sec of st.tree) {
    if (!q) { walk(sec, 0); continue; }
    const p = pick(sec);
    if (p) walkAll(p, 0);
  }
  st._rows = { key, rows };
  return rows;
}

function nodeState(row, res) {
  const ids = row.ids;
  const on = ids.filter((i) => res.enabled.has(i)).length;
  const lockedAll = ids.length > 0 && ids.every((i) => res.locked.has(i));
  // docs 표기와 같은 아이콘 — ✅ 켬 · ⬜ 끔 · 🟨 일부 켬 · 🔒 고정. 모두 화면 2칸
  const mark = lockedAll ? '🔒' : on === ids.length && ids.length ? '✅' : on === 0 ? '⬜' : '🟨';
  return { ids, on, total: ids.length, lockedAll, mark };
}

function clampCursor(st) {
  const n = rowsOf(st).length;
  return { ...st, cursor: Math.max(0, Math.min(st.cursor, n - 1)) };
}
function move(st, delta) { return clampCursor({ ...st, cursor: st.cursor + delta }); }

// 펼치기·접기 — 커서가 가리키던 노드를 따라간다
function setOpen(st, id, open) {
  const expanded = new Set(st.expanded);
  if (open) expanded.add(id); else expanded.delete(id);
  const next = { ...st, expanded };
  const i = rowsOf(next).findIndex((r) => r.id === id);
  return clampCursor({ ...next, cursor: i < 0 ? st.cursor : i });
}
function parentIndex(rows, i) {
  for (let j = i - 1; j >= 0; j--) if (rows[j].depth < rows[i].depth) return j;
  return i;
}

// ── 연관 관계 (설명칸) ──────────────────────────────────────────────
function relationLines(st, row, res) {
  const m = st.manifest;
  const rel = m.relations || {};
  const req = rel.requires || {};
  const exp = (raw) => expand(raw, m) || [];
  const name = (id) => clean(id);
  const lines = [];
  if (row.kind !== 'item') {
    const types = {};
    for (const id of row.ids) { const t = (m.items[id] || {}).type; types[t] = (types[t] || 0) + 1; }
    const comp = TYPES.filter(([t]) => types[t]).map(([t, n]) => `${n} ${types[t]}`).join(' · ');
    const ns = nodeState(row, res);
    const locked = row.ids.filter((i) => res.locked.has(i)).length;
    const pin = pinnedOf(st, res);
    const pinned = row.ids.filter((i) => pin(i)).length;
    lines.push(`[${row.full || row.label}] ${ns.total}개 중 ${ns.on}개 켜짐 (${comp})${locked ? ` · 🔒 ${locked}개는 끌 수 없음` : ''}${pinned ? ` · 📌 ${pinned}개는 ${projectFileName(st)} 이 정함` : ''} — Space: 안의 항목 일괄 ${ns.on === ns.total ? '끄기' : '켜기'}`);
    const conf = (rel.conflicts || []).filter((p) => Array.isArray(p) && (p[0] === row.op || row.ids.includes(p[0])));
    if (conf.length) lines.push(`  · 충돌: 이것을 켜면 ${conf.map((p) => exp(p[1]).map(name).join('·')).join(', ')} 이(가) 꺼진다`);
    else if (row.op && row.op.startsWith('bundle:')) lines.push('  · 묶음 = 같이 켜고 끄는 단위. 안의 항목 하나만 끄면 묶음은 🟨(일부만 켬)으로 보인다');
    else if (row.op && row.op.startsWith('block:')) lines.push('  · 블록 = 한 스택의 스킬·에이전트·언어 룰. 프리셋(p)은 블록 여러 개를 한 번에 켠다');
    else if (row.kind === 'group') lines.push('  · 용도 = 계획서 체크리스트의 분류. Space = 안의 항목 일괄 (🔒 고정은 건너뜀) · 스택 단위는 p(프리셋)·v(블록·묶음 보기)');
    else lines.push('  · 종류에서 Space = 그 아래 전체 일괄 (🔒 고정은 건너뜀) · v = 블록·묶음 보기로 전환');
    return lines;
  }
  const id = row.id;
  const it = m.items[id] || {};
  const groups = st.memberOf[id] || [];
  const needs = [...new Set((req[id] || []).flatMap(exp))];
  const neededBy = Object.keys(req).filter((x) => (req[x] || []).some((raw) => exp(raw).includes(id)));
  let lock = '';
  if (res.locked.has(id)) {
    if (it.state === 'lock') lock = '🔒 체크리스트 고정';
    else if ((st.gugbab.lock || []).some((raw) => exp(raw).includes(id))) lock = `🔒 ${projectFileName(st)} 에서 고정`;
    else lock = '🔒 고정 항목이 필요로 해서 같이 고정';
  } else {
    const p = pinnedOf(st, res)(id);
    if (p) lock = `📌 ${projectFileName(st)} 이(가) ${p === 'on' ? '켬' : '끔'}으로 정함 — 여기서 못 바꿈`;
  }
  lines.push(`[${row.label}] ${TYPE_NAME[it.type] || it.type}${groups.length ? ` · 속한 곳: ${groups.join(', ')}` : ' · 단독 항목'}${lock ? ` · ${lock}` : ''}`);
  const rels = [];
  if (needs.length) rels.push(`필요로 함: ${needs.map(name).join(', ')} (켜면 같이 켜짐)`);
  if (neededBy.length) rels.push(`이걸 필요로 함: ${neededBy.map(name).join(', ')} (끄면 같이 꺼짐)`);
  const offBy = (rel.conflicts || []).filter((p) => Array.isArray(p) && exp(p[1]).includes(id)).map((p) => p[0]);
  const offs = (rel.conflicts || []).filter((p) => Array.isArray(p) && p[0] === id).flatMap((p) => exp(p[1]));
  if (offBy.length) rels.push(`충돌: ${offBy.map(name).join(', ')} 을(를) 켜면 이게 꺼짐`);
  if (offs.length) rels.push(`충돌: 이걸 켜면 ${offs.map(name).join(', ')} 이(가) 꺼짐`);
  if (groups.length > 1) rels.push(`여러 묶음에 속함 — 어느 쪽에서 꺼도 꺼짐`);
  lines.push(`  · ${rels.length ? rels.join(' · ') : '연관 없음 — 이 항목만 켜고 끈다'}`);
  return lines;
}

// ── 켜기·끄기 ───────────────────────────────────────────────────────
// 이름 있는 그룹(블록·묶음)은 그 이름 하나로, 종류·용도처럼 이름 없는 그룹은 아래로 내려가며
// 이름 있는 그룹·항목을 하나씩 같은 방향으로 기록 — 🔒 고정만 있는 것은 건너뜀
function opsFor(row, st) {
  if (row.op) return [row.op];
  const res = effective(st);
  const pin = st.scope === 'project' ? pinnedOf(st, res) : () => null; // 이 프로젝트 범위면 📌 도 🔒 처럼 건너뜀
  const out = [];
  const walk = (n) => {
    if (n.ids.length && n.ids.every((i) => res.locked.has(i) || pin(i))) return;
    if (n.op) { out.push(n.op); return; }
    for (const c of n.children || []) walk(c);
  };
  for (const c of row.children || []) walk(c);
  return out;
}

function toggleAt(st) {
  const row = rowsOf(st)[st.cursor];
  if (!row) return st;
  const m = st.manifest;
  const before = effective(st);
  const ns = nodeState(row, before);
  const scopeNote = st.scope === 'profile' ? ' (모든 프로젝트)' : '';
  if (ns.lockedAll) {
    return { ...st, message: explainUnchanged(ns.ids, 'off', layersOf(st), before, layerIndex(st.scope), m).slice(0, 2).join(' · ') };
  }
  // 이 프로젝트 범위: 📌 프로젝트 파일이 정한 것만 남으면 바꾸지도 기록하지도 않는다 (효과 없는 기록이 쌓이던 문제).
  // 모든 프로젝트 범위는 다른 프로젝트에 적용되므로 지금처럼 기록한다(결정 25)
  const pin = pinnedOf(st, before);
  const file = projectFileName(st);
  const pinnedIds = ns.ids.filter((id) => pin(id));
  if (st.scope === 'project' && pinnedIds.length && ns.ids.every((id) => before.locked.has(id) || pin(id))) {
    return { ...st, message: clean(row.kind === 'item'
      ? `📌 ${file} 이(가) ${pin(row.id) === 'on' ? '켬' : '끔'}으로 정해 둔 항목이라 여기서 바꿀 수 없습니다 — 바꾸려면 프로젝트의 ${file} 을(를) 고치세요`
      : `바꿀 수 있는 항목이 없습니다 — 📌 ${file} 이 정함 ${pinnedIds.length}개${ns.ids.length > pinnedIds.length ? ` · 🔒 고정 ${ns.ids.length - pinnedIds.length}개` : ''}`) };
  }
  const pinNote = pinnedIds.length ? ` (📌 ${pinnedIds.length}개는 ${file} 이 정해 그대로)` : '';
  const action = ns.on === ns.total ? 'off' : 'on';
  const targets = opsFor(row, st);
  if (!targets.length) return { ...st, message: '바꿀 수 있는 항목이 없습니다 (모두 🔒 고정)' };
  let layer = st.drafts[st.scope];
  for (const t of targets) layer = applyToggle(layer, action, t, m);
  const next = { ...st, drafts: { ...st.drafts, [st.scope]: layer } };
  const after = effective(next);
  const changed = ns.ids.filter((i) => before.enabled.has(i) !== after.enabled.has(i));
  // 이 프로젝트에선 위쪽 층이 덮어 안 바뀌어도 기록은 한다 — 모든 프로젝트 범위면 다른 프로젝트에 적용되고,
  // 덮던 설정을 나중에 지우면 이 기록이 살아난다 (CLI on/off 와 같은 동작)
  const ops = { ...st.ops, [st.scope]: [...st.ops[st.scope], ...targets.map((t) => [action, t])] };
  const what = row.kind === 'item' ? row.id : `${row.label} (${changed.length}개)`;
  if (!changed.length) {
    const why = explainUnchanged(ns.ids, action, layersOf(next), after, layerIndex(st.scope), m).slice(0, 2).join(' · ');
    return { ...next, ops, message: clean(`${action === 'on' ? '켬' : '끔'} 기록${scopeNote} — 이 프로젝트는 그대로: ${why}`) };
  }
  const extra = after.warnings.filter((w) => !before.warnings.includes(w));
  const ownNote = ns.ids.some((id) => st.skipped.has(id)) ? ' — ↷ 이 프로젝트는 자체 .claude 의 것을 써서 여기엔 적용 안 됨' : '';
  return { ...next, ops, message: clean(`${action === 'on' ? '켬' : '끔'}: ${what}${scopeNote}${pinNote}${ownNote}${extra.length ? ` — ⚠ ${extra[0]}` : ''}`) };
}

function presetNames(m) { return Object.keys((m.relations || {}).presets || {}); }

function handleKey(st0, key) {
  const st = { ...st0 };
  const name = key && key.name;
  const ch = key && typeof key.ch === 'string' ? key.ch : '';
  if (name !== 'q' && name !== 'escape' && ch !== 'q') st.confirmQuit = false;

  if (st.mode === 'search') {
    if (name === 'return') return { state: { ...st, mode: 'list' }, action: null };
    if (name === 'escape') return { state: clampCursor({ ...st, mode: 'list', filter: '', cursor: 0 }), action: null };
    if (name === 'backspace') return { state: clampCursor({ ...st, filter: st.filter.slice(0, -1), cursor: 0 }), action: null };
    if (ch && !CTRL_RE.test(ch) && st.filter.length + ch.length <= 60) return { state: clampCursor(firstItem({ ...st, filter: st.filter + ch })), action: null };
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
  const row = rows[st.cursor];
  switch (name) {
    case 'up': return { state: move(st, -1), action: null };
    case 'down': return { state: move(st, 1), action: null };
    case 'pageup': return { state: move(st, -10), action: null };
    case 'pagedown': return { state: move(st, 10), action: null };
    case 'home': return { state: { ...st, cursor: 0 }, action: null };
    case 'end': return { state: { ...st, cursor: Math.max(0, rows.length - 1) }, action: null };
    case 'right': return { state: expandAt(st, row), action: null };
    case 'left': return { state: collapseAt(st, row, rows), action: null };
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
      if (ch === 'l') return { state: expandAt(st, row), action: null };
      if (ch === 'h') return { state: collapseAt(st, row, rows), action: null };
      if (ch === 'a') return { state: toggleAllOpen(st), action: null };
      if (ch === 'v') return { state: switchView(st), action: null };
      if (ch === '/') return { state: { ...st, mode: 'search', message: '' }, action: null };
      if (ch === 'p') return { state: presetNames(st.manifest).length ? { ...st, mode: 'preset', presetCursor: 0, message: '' } : { ...st, message: '프리셋이 없습니다' }, action: null };
      if (ch !== 'q') return { state: st, action: null };
  }
  // q · Esc — 바뀐 게 있으면 한 번은 확인
  if (dirty(st) && !st0.confirmQuit) return { state: { ...st, confirmQuit: true, message: '저장하지 않은 변경이 있습니다 — q·Esc 를 한 번 더 누르면 버리고 닫습니다 (Enter 는 저장)' }, action: null };
  return { state: st, action: 'quit' };
}

function firstItem(st) {
  const rows = rowsOf(st);
  const i = rows.findIndex((r) => r.kind === 'item');
  return { ...st, cursor: i < 0 ? 0 : i };
}
function expandAt(st, row) {
  if (!row || row.kind === 'item' || st.filter) return st;
  if (!st.expanded.has(row.id)) return setOpen(st, row.id, true);
  return move(st, 1); // 이미 펼쳐져 있으면 첫 자식으로
}
function collapseAt(st, row, rows) {
  if (!row || st.filter) return st;
  if (row.kind !== 'item' && st.expanded.has(row.id)) return setOpen(st, row.id, false);
  return { ...st, cursor: parentIndex(rows, st.cursor) }; // 항목·접힌 그룹이면 부모로
}
// v — 종류별 보기 ↔ 블록·묶음 보기. 저장 안 한 변경(drafts·ops)은 그대로 두고 트리만 바꾼다
function switchView(st) {
  const view = st.view === 'stack' ? 'type' : 'stack';
  const tree = buildTree(st.manifest, view);
  return { ...st, view, tree, expanded: initialExpanded(tree), cursor: 0, top: 0, filter: '', _rows: null,
    message: view === 'stack' ? '보기: 스택 블록·묶음 (v 로 종류별 보기)' : '보기: 종류 → 용도 (v 로 블록·묶음 보기)' };
}

// a — 그룹이 하나라도 접혀 있으면 모두 펼치고, 다 펼쳐져 있으면 종류(큰 갈래)만 남기고 접는다
function toggleAllOpen(st) {
  const groups = st.tree.flatMap((s) => s.children.filter((g) => g.kind !== 'item').map((g) => g.id));
  const allOpen = groups.every((id) => st.expanded.has(id));
  const cur = rowsOf(st)[st.cursor];
  const expanded = allOpen ? initialExpanded(st.tree) : new Set(st.tree.map((s) => s.id));
  if (!allOpen) for (const id of groups) expanded.add(id);
  const next = { ...st, expanded, message: allOpen ? '모두 접음' : '모두 펼침' };
  const i = cur ? rowsOf(next).findIndex((r) => r.id === cur.id) : 0;
  return clampCursor({ ...next, cursor: i < 0 ? 0 : i });
}

function render(st, { cols = 80, rows: height = 24 } = {}) {
  const res = effective(st);
  const saved = resolve(st.manifest, layersOf(st, 'initial'));
  const items = st.manifest.items || {};
  const out = [];
  const scopes = ['project', 'profile'].map((s) => (s === st.scope ? `[${SCOPE_NAME[s]}]` : ` ${SCOPE_NAME[s]} `)).join(' ');
  out.push(fit(` gugbab 하네스 · ${st.projectName}   범위: ${scopes}`, cols));
  const counts = TYPES.map(([t, label]) => {
    const all = Object.keys(items).filter((id) => items[id].type === t);
    return `${label} ${all.filter((id) => res.enabled.has(id)).length}/${all.length}`;
  });
  const pin = pinnedOf(st, res);
  const pinCount = Object.keys(items).filter((id) => pin(id)).length;
  out.push(fit(` ${counts.join(' · ')} · 🔒 ${res.locked.size}${pinCount ? ` · 📌 ${pinCount} (${projectFileName(st)})` : ''}${dirty(st) ? ' · ● 저장 안 됨' : ''}`, cols));
  out.push(fit(` ${LEGEND}`, cols));
  out.push('─'.repeat(Math.max(0, cols)));
  const bodyH = Math.max(0, height - 9); // 머리 4줄(제목·개수·범례·선) + 아래 5줄(선·설명 2·메시지·키 도움말)

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
    out.push('─'.repeat(Math.max(0, cols)));
    out.push(fit(' 프리셋 = 블록 여러 개를 한 번에 켬 (이미 켠 것은 그대로, 끄지는 않음)', cols), '');
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
    for (let i = top; i < Math.min(rows.length, top + bodyH); i++) {
      const r = rows[i];
      const ns = nodeState(r, res);
      const changed = r.ids.some((id) => res.enabled.has(id) !== saved.enabled.has(id));
      const indent = '  '.repeat(r.depth);
      const arrow = r.kind === 'item' ? '  ' : r.open ? '▾ ' : '▸ ';
      const labelW = Math.max(8, Math.min(34, Math.floor(cols * 0.38)) - r.depth * 2);
      const own = r.ids.filter((id) => st.skipped.has(id)).length;
      const ownNote = own ? ` · ↷ 자체 .claude 우선${r.kind === 'item' ? '' : ` ${own}`}` : '';
      const pinned = r.kind === 'item' ? pin(r.id) : r.ids.filter((id) => pin(id)).length;
      const pinNote = !pinned ? '' : r.kind === 'item' ? ` · 📌 ${projectFileName(st)} ${pinned === 'on' ? '켬' : '끔'}` : ` · 📌 ${pinned}`;
      let detail;
      if (r.kind === 'item') {
        const groups = st.memberOf[r.id] || [];
        detail = TYPE_NAME[(items[r.id] || {}).type] || '';
        if (groups.length > 1) detail += ` · 다른 묶음에도 속함`;
      } else detail = `${ns.on}/${ns.total}${r.op ? ` · ${r.op}` : ''}`;
      const line = `${i === st.cursor ? '›' : ' '}${changed ? '*' : ' '}${indent}${arrow}${ns.mark} ${pad(r.label, labelW)}  ${detail}${pinNote}${ownNote}`;
      out.push(i === st.cursor ? `\x1b[7m${fit(line, cols)}\x1b[0m` : fit(line, cols));
    }
    out.push(...Array(Math.max(0, bodyH - Math.min(bodyH, rows.length - top))).fill(''));
  }
  out.push('─'.repeat(Math.max(0, cols)));
  const cur = rows[st.cursor];
  const info = cur ? relationLines(st, cur, res) : [];
  out.push(fit(` ${info[0] || ''}`, cols), fit(` ${info[1] || ''}`, cols));
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
// holdOnExit — /harness 로 띄운 창(comux 옆 창·tmux 팝업·macOS 새 창): 저장했으면 요약을 closeDelayMs 동안 보여 주고 저절로 끝난다
//   (예전엔 "아무 키나 누르면 닫습니다" 로 키를 하나 더 기다려 Enter 저장 뒤에도 창이 남았다 — 2026-10-20 사용자 요청)
function runTui({ manifest, paths, project, input = process.stdin, output = process.stdout, composeFn, holdOnExit = false, closeDelayMs = 2000 }) {
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
          const turnedOn = [...after.enabled].filter((i) => !before.enabled.has(i));
          const turnedOff = [...before.enabled].filter((i) => !after.enabled.has(i));
          const needRestart = [...turnedOn, ...turnedOff].some((i) => RESTART_TYPES.has((manifest.items[i] || {}).type));
          result = { saved: true, turnedOn, turnedOff, needRestart, warnings: after.warnings, scopes: ['profile', 'project'].filter((s) => st.ops[s].length) };
        } catch (e) { rejectP(e); return; }
      }
      const done = () => { input.pause(); resolveP(result); };
      if (!holdOnExit || !result.saved) return done(); // 저장 안 했으면 보여 줄 것이 없어 바로 닫는다
      const secs = Math.max(0, Math.round(closeDelayMs / 1000));
      output.write(`${summaryLines(result).join('\n')}\n\n${secs}초 뒤 이 창을 닫습니다 (아무 키나 누르면 바로)\n`);
      let closed = false, timer = null;
      const close = () => {
        if (closed) return; // 타이머와 키가 겹쳐도 한 번만
        closed = true;
        clearTimeout(timer);
        input.removeListener('keypress', close);
        try { input.setRawMode(false); } catch { /* 무시 */ }
        done();
      };
      try { input.setRawMode(true); } catch { /* 무시 */ }
      input.resume();
      input.on('keypress', close);
      timer = setTimeout(close, Math.max(0, closeDelayMs));
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
  const lines = [`[gugbab] 저장했습니다 (${(r.scopes || []).map((s) => SCOPE_NAME[s]).join(' · ')})`];
  if (r.turnedOn.length) lines.push(`  켬: ${r.turnedOn.join(', ')}`);
  if (r.turnedOff.length) lines.push(`  끔: ${r.turnedOff.join(', ')}`);
  if (!r.turnedOn.length && !r.turnedOff.length) lines.push((r.scopes || []).includes('profile') ? '  이 프로젝트에서는 바뀐 항목 없음 (다른 설정이 덮고 있음 — 다른 프로젝트에는 적용)' : '  실제로 바뀐 항목 없음');
  lines.push(r.needRestart ? '  룰·에이전트·설정이 바뀌었습니다 — claude 쪽에서 /exit 하면 대화를 이어서 다시 시작합니다' : '  훅·스킬·커맨드는 바로 반영됩니다');
  return lines;
}

module.exports = { createState, handleKey, render, rowsOf, strWidth, replayOps, runTui, summaryLines, buildTree, relationLines };
