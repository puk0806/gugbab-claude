// 켜기·끄기 기록 — CLI(on·off·preset)와 TUI 가 같은 규칙으로 층 파일을 고친다
//   applyToggle  한 층(enable·disable)에 켬/끔 기록. resolve 는 같은 층에서 끔을 켬보다 나중에 적용하므로
//                켤 때는 그 항목을 덮는 끔 기록을 걷어낸다 (묶음 끔이면 나머지 구성원 끔으로 풂)
//   applyPreset  프리셋(블록·묶음 조합)을 한 번에 켬
//   explainUnchanged  눌렀는데 안 바뀐 이유 — 고정 / 위쪽 층이 덮음 / 의존·충돌 / 이미 그 상태
//   commitLayer  층 파일 저장 → 다시 계산 → 조립 → (룰·에이전트·설정이 바뀌면) 재시작 표시
'use strict';
const fs = require('fs');
const path = require('path');
const { resolve, expand } = require('./resolve');
const { loadLayers, readJsonObject, writeJson } = require('./layers');

// 이름 검사 — 기본 형태만 보고, 실제 판정은 "manifest 에 있는 이름인지"(허용 목록)로 한다.
// 설정 항목은 이름에 공백·한글·백틱이 있다(예: `setting:superpowers 플러그인`) — 패턴으로 막으면 켜고 끌 수 없었다(2026-10-17 실측 버그)
const CTRL_RE = /[\u0000-\u001f\u007f-\u009f]/;
const GROUP_RE = /^(?:block|bundle):/;
const RESTART_TYPES = new Set(['rule', 'agent', 'setting']); // 세션 시작 때만 읽히는 것 (PoC 6: 스킬·커맨드는 바로 반영)
const LAYER_ORDER = ['profile', 'project', '.gugbab.json']; // loadLayers 순서 — 뒤가 이김
const LAYER_NAME = { profile: '모든 프로젝트 설정', project: '이 프로젝트 설정', '.gugbab.json': '.gugbab.json' };

const arr = (v) => (Array.isArray(v) ? v.filter(x => typeof x === 'string') : []);
const uniq = (a) => [...new Set(a)];
const layerIndex = (scope) => LAYER_ORDER.indexOf(scope);

function members(id, manifest) {
  if (typeof id !== 'string' || !id || id.length > 200 || CTRL_RE.test(id) || id.includes('..') || id !== id.trim()) throw new Error(`항목 이름이 올바르지 않습니다: ${JSON.stringify(id)}`);
  const ids = expand(id, manifest);
  if (!ids) throw new Error(`모르는 항목입니다: ${id}`);
  return ids;
}

function applyToggle(layer, action, id, manifest) {
  if (action !== 'on' && action !== 'off') throw new Error('동작은 on 또는 off 여야 합니다');
  const mine = new Set(members(id, manifest));
  const base = layer && typeof layer === 'object' && !Array.isArray(layer) ? layer : {};
  let enable = arr(base.enable).filter(x => x !== id);
  let disable = arr(base.disable).filter(x => x !== id);
  if (action === 'on') {
    const kept = [];
    for (const d of disable) {
      const ds = expand(d, manifest) || [];
      if (!ds.some(x => mine.has(x))) { kept.push(d); continue; }
      if (GROUP_RE.test(d)) kept.push(...ds.filter(x => !mine.has(x))); // 묶음 끔 → 겹치지 않는 구성원만 끔으로 남김
    }
    disable = uniq(kept);
    enable.push(id);
  } else {
    if (GROUP_RE.test(id)) enable = enable.filter(e => GROUP_RE.test(e) || !mine.has(e)); // 끄는 묶음 구성원의 개별 켬은 정리
    disable.push(id);
  }
  return { ...base, enable: uniq(enable), disable: uniq(disable) };
}

function applyPreset(layer, name, manifest) {
  const presets = (manifest.relations || {}).presets || {};
  if (typeof name !== 'string' || !Object.prototype.hasOwnProperty.call(presets, name)) throw new Error(`모르는 프리셋입니다: ${name}`);
  let l = layer;
  for (const g of arr(presets[name].enable)) l = applyToggle(l, 'on', g, manifest);
  return l;
}

function mentions(layer, key, id, manifest) {
  return arr(layer && layer[key]).some(raw => (expand(raw, manifest) || []).includes(id));
}

function explainUnchanged(ids, action, layers, resolved, idx, manifest) {
  const want = action === 'on';
  const reasons = [];
  for (const id of ids) {
    if (resolved.enabled.has(id) === want) continue;
    if (!want && resolved.locked.has(id)) {
      if ((manifest.items[id] || {}).state === 'lock') reasons.push(`${id}: 🔒 체크리스트 고정`);
      else if (layers.some(l => mentions(l, 'lock', id, manifest))) reasons.push(`${id}: 🔒 ${layers.find(l => mentions(l, 'lock', id, manifest)).source} 에서 고정`); // 파생 하네스는 자기 파일 이름
      else reasons.push(`${id}: 🔒 고정 항목이 필요로 해서 같이 고정`);
      continue;
    }
    const opposite = want ? 'disable' : 'enable';
    const over = layers.slice(idx + 1).find(l => mentions(l, opposite, id, manifest));
    if (over) reasons.push(`${id}: ${LAYER_NAME[over.source] || over.source} 이(가) ${want ? '끔' : '켬'}으로 덮고 있음`);
    else reasons.push(`${id}: 필수 의존·충돌 규칙 때문에 유지 (gugbab-claude status 의 ⚠ 참고)`);
  }
  return reasons.length ? reasons : ['이미 그 상태입니다'];
}

function commitLayer({ manifest, paths, project, scope, mutate, composeFn }) {
  const idx = layerIndex(scope);
  if (idx < 0 || idx > 1) throw new Error(`기록할 수 없는 범위입니다: ${scope}`);
  const before = resolve(manifest, loadLayers(paths, project));
  const file = scope === 'profile' ? paths.profilePath : project.settingsPath;
  writeJson(file, mutate(readJsonObject(file)));
  const layers = loadLayers(paths, project);
  const after = resolve(manifest, layers);
  const turnedOn = [...after.enabled].filter(i => !before.enabled.has(i));
  const turnedOff = [...before.enabled].filter(i => !after.enabled.has(i));
  (composeFn || require('./compose').compose)({ manifest, paths, project, resolved: after });
  const needRestart = [...turnedOn, ...turnedOff].some(i => RESTART_TYPES.has((manifest.items[i] || {}).type));
  if (needRestart) {
    fs.mkdirSync(project.configDir, { recursive: true });
    fs.writeFileSync(path.join(project.configDir, '.gugbab-restart'), new Date().toISOString());
  }
  return { file, layers, before, after, turnedOn, turnedOff, needRestart };
}

module.exports = { applyToggle, applyPreset, explainUnchanged, commitLayer, layerIndex, RESTART_TYPES, LAYER_ORDER };
