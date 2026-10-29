#!/usr/bin/env node
// 체크리스트(고정·켬·끔) + .claude/settings.json(훅 연결·권한) + relations.json(묶음·의존·충돌) → manifest.json
// 래퍼(cli/)는 이 파일만 읽는다. manifest.json 은 손으로 고치지 않고 이 스크립트로 다시 만든다 (계획서 15.2)
//
// 사용: node scripts/build-manifest.js          → manifest.json 생성
//       node scripts/build-manifest.js --check  → 최신이 아니면 exit 1
const fs = require('fs');
const path = require('path');
const { parseChecklist } = require('../docs/plans/page/parse-checklist');

const HARNESS_DIR = '.claude'; // 결정 19 — harness/ 이동 전까지 하네스 원본 위치
const CHECKLIST = 'docs/plans/2026-10-15-harness-item-checklist.md';

// 체크리스트 1장 문구 → settings 의 어느 칸인지. 문구가 바뀌면 여기서 알아채도록 모르는 이름은 오류
const SETTING_KEYS = {
  '위험 명령 차단 목록 (deny)': 'permissions.deny',
  '자동 허용 목록 (allow)': 'permissions.allow',
  '시작 권한 모드 `acceptEdits`': 'permissions.defaultMode',
  '임시 폴더 접근 허용': 'permissions.additionalDirectories',
  'superpowers 플러그인': 'plugin:superpowers@superpowers-marketplace',
  '상태줄 `statusline.sh`': 'statusLine',
  '전역 CLAUDE.md 공통 부분': 'claudeMd',
};
const SETTING_PATHS = { statusLine: `${HARNESS_DIR}/hooks/statusline.sh`, claudeMd: `${HARNESS_DIR}/CLAUDE.common.md` };
// 체크리스트 항목이 아닌 플러그인은 묶음을 따라 켠다 — 묶음 안 항목이 하나라도 켜지면 켬
const PLUGIN_BUNDLES = { 'codex@openai-codex': 'codex-review' };

// 지금 settings.json 의 훅 명령 형식만 받는다: node|bash "$CLAUDE_PROJECT_DIR"/.claude/hooks/<이름>.<js|sh> [--옵션 …]
// 그 밖(다른 폴더·셸 연결자·경로 조작)은 null — manifest 로 옮기면 안 되는 명령이다
function parseHookCommand(cmd) {
  const m = /^(?:node|bash) "\$CLAUDE_PROJECT_DIR"\/\.claude\/hooks\/([a-z0-9][a-z0-9-]*)\.(js|sh)((?: --?[a-z0-9][a-z0-9-]*)*)$/.exec(String(cmd || '').trim());
  if (!m) return null;
  return { name: m[1], ext: m[2], args: m[3].trim() ? m[3].trim().split(/\s+/) : [] };
}

const exists = (root, rel) => fs.existsSync(path.join(root, rel));

// /harness 오른쪽 설명칸 — 체크리스트의 한 줄 설명(desc)과 상세 줄 중 "무엇을 하는지" 줄만(about).
// 이름 목록(쓰는 스킬·연결 에이전트)·연관 줄은 화면이 relations 로 따로 보여 주므로 넣지 않는다
const ABOUT_KEYS = ['하는 일', '담은 내용', '이럴 때', '이렇게 보여요', '끄면', '예시 요청', '예시 질문', '들어가는 것', '주의'];
const ABOUT_MAX = 400; // 줄 하나 최대 글자 — manifest 는 훅이 매번 읽으므로 크기를 묶어 둔다
const plain = (s) => String(s || '')
  .replace(/\u001b\][^\u0007\u001b]*(?:\u0007|\u001b\\)?/g, '').replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '') // 터미널 제어 시퀀스는 통째로
  .replace(/\*\*/g, '').replace(/`/g, '').replace(/[\u0000-\u001f\u007f-\u009f]/g, '').replace(/\s+/g, ' ').trim();
const cut = (s) => (s.length > ABOUT_MAX ? `${s.slice(0, ABOUT_MAX - 1)}…` : s);
function aboutOf(it) {
  const out = [];
  for (const key of ABOUT_KEYS) {
    const line = (it.rel || []).find(r => r.startsWith(`${key}: `));
    if (line) out.push(cut(plain(line)));
  }
  return out;
}

function findAgent(root, name) {
  const dir = path.join(root, HARNESS_DIR, 'agents');
  const hits = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(dir, e.name, `${name}.md`)))
    .map(e => `${HARNESS_DIR}/agents/${e.name}/${name}.md`);
  if (hits.length > 1) throw new Error(`같은 이름 에이전트가 여러 곳: ${hits.join(', ')}`);
  return hits[0] || null;
}

function itemPath(root, it) {
  switch (it.type) {
    case 'hook': return `${HARNESS_DIR}/hooks/${it.name}.js`;
    case 'rule': return `${HARNESS_DIR}/rules/${it.name}`;
    case 'command': return `${HARNESS_DIR}/commands/${it.name.replace(/^\//, '')}.md`;
    case 'agent': return findAgent(root, it.name);
    case 'skill': return `${HARNESS_DIR}/skills/${it.name}`;
    case 'setting': return SETTING_PATHS[SETTING_KEYS[it.name]] || null;
    default: return null;
  }
}

// /harness 화면 트리 순서 (결정 33) — 체크리스트의 장(종류) → 절(용도, `### 2.1 안전 — …`) → 항목, 체크리스트에 적힌 순서 그대로.
// 절 제목 끝의 개수 표기(" — 78종", " (8)")는 화면에선 실제 개수를 따로 보여 주므로 뺀다
function layoutOf(sections, items) {
  const title = (t) => String(t || '').replace(/\s*(?:—\s*\d+종|\(\d+\))\s*$/, '').trim();
  return sections.map(s => ({
    type: s.type,
    groups: s.groups.map(g => ({ title: title(g.title), items: g.items.map(i => i.id).filter(id => items[id]) })).filter(g => g.items.length),
  })).filter(s => s.groups.length);
}

function sortKeys(o) {
  return Object.fromEntries(Object.keys(o).sort().map(k => [k, o[k]]));
}

function buildManifest({ root, checklistMd, settings, relations }) {
  const { items: list, sections } = parseChecklist(checklistMd);
  const items = {};
  for (const it of list) {
    const entry = { type: it.type, state: it.rec };
    if (it.projHint) entry.projHint = it.projHint;
    const desc = cut(plain(it.desc));
    if (desc) entry.desc = desc;
    const about = aboutOf(it);
    if (about.length) entry.about = about;
    if (it.type === 'setting') {
      if (!SETTING_KEYS[it.name]) throw new Error(`모르는 설정 항목: ${it.name} — build-manifest.js SETTING_KEYS 에 추가하세요`);
      entry.key = SETTING_KEYS[it.name];
    }
    const p = itemPath(root, it);
    if (p) {
      const check = it.type === 'skill' ? `${p}/SKILL.md` : p;
      if (!exists(root, check)) throw new Error(`파일 없음: ${it.id} (${check})`);
      entry.path = p;
    } else if (it.type !== 'setting') {
      throw new Error(`파일 없음: ${it.id}`);
    }
    if (it.type === 'hook') entry.hooks = [];
    items[it.id] = entry;
  }

  // 훅 연결 — settings.json 순서 그대로. 이벤트마다 실행 순서를 hookOrder 에 남긴다
  const hookOrder = {};
  for (const [event, groups] of Object.entries(settings.hooks || {})) {
    for (const g of groups) {
      for (const h of g.hooks || []) {
        const parsed = parseHookCommand(h.command);
        if (!parsed) throw new Error(`훅 명령 형식이 다릅니다 (${event}): ${h.command}`);
        if (parsed.ext !== 'js') throw new Error(`훅은 node 스크립트만 연결합니다: ${h.command}`);
        const id = `hook:${parsed.name}`;
        if (!items[id]) throw new Error(`체크리스트에 없는 훅: ${parsed.name}`);
        const w = { event, matcher: g.matcher || '', args: parsed.args };
        if (h.timeout) w.timeout = h.timeout;
        items[id].hooks.push(w);
        (hookOrder[event] = hookOrder[event] || []).push({ id, matcher: w.matcher, args: w.args, ...(h.timeout ? { timeout: h.timeout } : {}) });
      }
    }
  }

  // relations 가 가리키는 항목이 모두 있는지 (block:이름 은 블록)
  const blocks = relations.blocks || {};
  const known = (id) => items[id] || (id.startsWith('block:') && blocks[id.slice(6)]) || (id.startsWith('bundle:') && (relations.bundles || {})[id.slice(7)]);
  const refs = [
    ...Object.values(relations.bundles || {}).flatMap(b => b.items),
    ...(relations.standalone || []),
    ...Object.values(blocks).flatMap(b => b.items),
    ...Object.entries(relations.requires || {}).flatMap(([k, v]) => [k, ...v]),
    ...(relations.conflicts || []).flat(),
    ...Object.keys(relations.variants || {}),
  ];
  const missing = [...new Set(refs.filter(r => !known(r)))];
  if (missing.length) throw new Error(`relations.json 이 없는 항목을 가리킵니다: ${missing.join(', ')}`);

  // 프리셋 — 지금 템플릿을 블록·묶음 조합으로 (계획서 14.4). 이름은 소문자·숫자·하이픈, 구성은 block:/bundle: 만
  const presets = Object.fromEntries(Object.entries(relations.presets || {}).filter(([k]) => !k.startsWith('$'))); // $comment 는 설명
  for (const [name, p] of Object.entries(presets)) {
    const list = p && p.enable;
    if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(name) || !Array.isArray(list) || !list.length) throw new Error(`프리셋 형식이 틀렸습니다: ${name}`);
    const bad = list.filter(g => typeof g !== 'string' || !/^(?:block|bundle):/.test(g) || !known(g));
    if (bad.length) throw new Error(`프리셋 ${name} 이 블록·묶음이 아닌 것을 가리킵니다: ${bad.map(String).join(', ')}`);
  }

  // base — 훅을 뺀 나머지 설정. 하네스 경로는 ${GUGBAB_ROOT}(= GUGBAB_HOME/.claude) 로 바꿔 둔다
  const toRoot = (s) => s.split('"$CLAUDE_PROJECT_DIR"/.claude/').join('"${GUGBAB_ROOT}"/');
  const base = {};
  if (settings.permissions) base.permissions = settings.permissions;
  if (settings.statusLine) base.statusLine = { ...settings.statusLine, command: toRoot(settings.statusLine.command || '') };
  if (settings.enabledPlugins) base.enabledPlugins = settings.enabledPlugins;

  return {
    $comment: '생성 파일 — 손으로 고치지 말고 node scripts/build-manifest.js 로 다시 만든다. 재료: 체크리스트 · .claude/settings.json · relations.json',
    version: 1,
    root: HARNESS_DIR,
    items: sortKeys(items),
    layout: layoutOf(sections, items),
    hookOrder,
    pluginBundles: PLUGIN_BUNDLES,
    relations: {
      bundles: relations.bundles || {},
      standalone: relations.standalone || [],
      blocks,
      requires: relations.requires || {},
      conflicts: relations.conflicts || [],
      variants: relations.variants || {},
      presets,
    },
    base,
  };
}

function loadInputs(root) {
  return {
    root,
    checklistMd: fs.readFileSync(path.join(root, CHECKLIST), 'utf8'),
    settings: JSON.parse(fs.readFileSync(path.join(root, HARNESS_DIR, 'settings.json'), 'utf8')),
    relations: JSON.parse(fs.readFileSync(path.join(root, 'relations.json'), 'utf8')),
  };
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const out = JSON.stringify(buildManifest(loadInputs(root)), null, 2) + '\n';
  const target = path.join(root, 'manifest.json');
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    if (cur !== out) { console.error('manifest.json 이 최신이 아닙니다 — node scripts/build-manifest.js'); process.exit(1); }
    console.log('manifest.json 최신');
  } else {
    fs.writeFileSync(target, out);
    const m = JSON.parse(out);
    console.log(`manifest.json 생성: 항목 ${Object.keys(m.items).length}, 이벤트 ${Object.keys(m.hookOrder).length}`);
  }
}

module.exports = { buildManifest, parseHookCommand, loadInputs, SETTING_KEYS, HARNESS_DIR };
