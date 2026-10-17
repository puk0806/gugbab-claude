// 켜짐·꺼짐 계산 — 계획서 5.2 적용 순서 + 14장 처리 순서
//   적용 순서: 🔒 고정(manifest) > .gugbab.json(lock 포함) > 연 프로젝트 설정 > 모든 프로젝트(profile) > 기본값
//   처리 순서: A 펼치기(bundle:·block: → 항목) → B 채우기(필수 의존) → C 정리(충돌) → B 재검사
// 입력 층(layers)은 앞에서 뒤로 적용한다 — 뒤 층이 이긴다. 고정은 어느 층에서도 끌 수 없다
'use strict';

const MAX_LIST = 2000; // 한 층의 enable/disable 목록 길이 상한 — 비정상 파일로 계산이 늘어지지 않게

const own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);

// bundle:이름 / block:이름 / 항목 id → 항목 id 목록 (모르면 null)
function expand(id, manifest) {
  if (typeof id !== 'string') return null;
  const rel = manifest.relations || {};
  if (id.startsWith('bundle:')) { const b = rel.bundles; const k = id.slice(7); return own(b, k) ? b[k].items.filter(i => own(manifest.items, i)) : null; }
  if (id.startsWith('block:')) { const b = rel.blocks; const k = id.slice(6); return own(b, k) ? b[k].items.filter(i => own(manifest.items, i)) : null; }
  return own(manifest.items, id) ? [id] : null;
}

function listOf(layer, key, warnings) {
  const v = layer[key];
  if (v === undefined) return [];
  if (!Array.isArray(v)) { warnings.push(`${layer.source || '설정'}: ${key} 는 배열이어야 합니다 — 무시`); return []; }
  if (v.length > MAX_LIST) { warnings.push(`${layer.source || '설정'}: ${key} 목록이 너무 깁니다(${v.length}) — 앞 ${MAX_LIST}개만 사용`); return v.slice(0, MAX_LIST); }
  return v;
}

function resolve(manifest, layers) {
  const items = manifest.items || {};
  const rel = manifest.relations || {};
  const requires = rel.requires || {};
  const warnings = [];
  const unknown = [];
  const refused = [];

  const enabled = new Set();
  const locked = new Set();
  for (const [id, it] of Object.entries(items)) {
    if (it.state === 'lock') { locked.add(id); enabled.add(id); } else if (it.state === 'on') enabled.add(id);
  }

  const exp = (raw) => {
    const ids = expand(raw, manifest);
    if (!ids) { unknown.push(String(raw)); return []; }
    return ids;
  };
  const valid = (layers || []).filter(l => l && typeof l === 'object');

  // .gugbab.json 의 lock — 어느 층보다 먼저 고정으로 반영 (적용 순서 2위)
  for (const l of valid) for (const raw of listOf(l, 'lock', warnings)) for (const id of exp(raw)) { locked.add(id); enabled.add(id); }

  // 고정 전파 — 고정 항목이 필요로 하는 것도 고정 (결정 15)
  const lockClosure = () => {
    let grew = true;
    while (grew) {
      grew = false;
      for (const id of [...locked]) for (const raw of (requires[id] || [])) for (const dep of (expand(raw, manifest) || [])) {
        if (!locked.has(dep)) { locked.add(dep); enabled.add(dep); grew = true; }
      }
    }
  };
  lockClosure();

  // 층 적용 (뒤가 이김). 마지막 명시 동작이 끔이면 userOff
  // 묶음·블록 이름으로 켠 것은 groupOn 에 따로 남긴다 — 충돌 판정에서 "그 스택을 골랐다" 는 뜻으로 쓴다
  const lastAction = new Map();
  const groupOn = new Set();
  for (const l of valid) {
    for (const raw of listOf(l, 'enable', warnings)) {
      const ids = exp(raw);
      if (ids.length && /^(?:block|bundle):/.test(raw)) groupOn.add(raw);
      for (const id of ids) { enabled.add(id); lastAction.set(id, 'on'); }
    }
    for (const raw of listOf(l, 'disable', warnings)) {
      if (typeof raw === 'string') groupOn.delete(raw);
      for (const id of exp(raw)) {
        if (locked.has(id)) { refused.push({ id, source: l.source || '설정' }); continue; }
        enabled.delete(id); lastAction.set(id, 'off');
      }
    }
  }
  for (const l of valid) for (const raw of listOf(l, 'lock', [])) if (/^(?:block|bundle):/.test(raw)) groupOn.add(raw);
  const userOff = new Set([...lastAction].filter(([, a]) => a === 'off').map(([id]) => id));

  // B 채우기 — 필요한 것이 꺼져 있으면: 사용자가 끈 것이면 쓰는 쪽을 끄고, 아니면 필요한 쪽을 켠다
  const fill = () => {
    for (let round = 0; round < 1000; round++) {
      let changed = false;
      for (const x of [...enabled]) {
        if (!enabled.has(x)) continue;
        for (const raw of (requires[x] || [])) for (const y of (expand(raw, manifest) || [])) {
          if (enabled.has(y) || !enabled.has(x)) continue;
          if (userOff.has(y) && !locked.has(x) && !locked.has(y)) {
            enabled.delete(x); changed = true;
            warnings.push(`${y} 를 꺼서 그것이 필요한 ${x} 도 끕니다`);
          } else {
            enabled.add(y); changed = true;
            warnings.push(`${x} 가 ${y} 를 필요로 해 같이 켭니다`);
          }
        }
      }
      if (!changed) return;
    }
    warnings.push('필수 의존 계산이 끝나지 않아 중단했습니다 (순환 의심)');
  };
  fill();

  // C 정리 — 충돌 쌍 [a, b] 가 둘 다 켜져 있으면 b 쪽을 끈다 (고정이면 경고만)
  // a 가 블록·묶음이면 "그것을 켰다" = 이름으로 켰거나 구성원이 전부 켜짐. 구성원 일부만 기본 켬인 것은 아님
  const groupActive = (g) => {
    if (!/^(?:block|bundle):/.test(g)) return enabled.has(g);
    if (groupOn.has(g)) return true;
    const members = expand(g, manifest) || [];
    return members.length > 0 && members.every(i => enabled.has(i));
  };
  for (const pair of (rel.conflicts || [])) {
    if (!Array.isArray(pair) || pair.length !== 2) continue;
    const b = expand(pair[1], manifest) || [];
    if (!groupActive(pair[0])) continue;
    for (const id of b) {
      if (!enabled.has(id)) continue;
      if (locked.has(id)) { warnings.push(`충돌: ${pair[0]} 와 ${id} — ${id} 가 고정이라 끄지 못했습니다`); continue; }
      enabled.delete(id); userOff.add(id);
      warnings.push(`충돌: ${pair[0]} 를 켜서 ${id} 를 끕니다`);
    }
  }
  fill(); // B 재검사

  for (const id of locked) enabled.add(id); // 최종 보장 — 고정은 항상 켜짐
  return { enabled, locked, warnings, unknown, refused };
}

module.exports = { resolve, expand, MAX_LIST };
