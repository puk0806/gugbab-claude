#!/usr/bin/env node
// build-defaults-doc.js — manifest.json → docs/DEFAULTS.md (기본값·고정 목록·블록·묶음·프리셋별 구성)
//   node scripts/build-defaults-doc.js           문서를 쓴다
//   node scripts/build-defaults-doc.js --check   지금 문서가 최신인지만 본다 (다르면 exit 1)
// 프리셋 결과는 cli/resolve.js 로 "기본값만" 과 "프리셋 적용" 을 비교해 필수 의존·충돌까지 실제 동작과 같게 계산한다.
// 출력은 결정적이다 — 날짜·시간 같은 변하는 값을 넣지 않는다.
'use strict';
const fs = require('fs');
const path = require('path');
const { resolve, expand } = require('../cli/resolve');

const TYPES = [['setting', '설정'], ['hook', '훅'], ['rule', '룰'], ['command', '커맨드'], ['agent', '에이전트'], ['skill', '스킬']];
const TYPE_NAME = Object.fromEntries(TYPES);
const own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);

// 표 칸·목록에 넣을 글자 — 줄바꿈은 공백, 제어문자 제거, | 는 \|, < > 는 엔티티 (표가 깨지거나 HTML 로 해석되지 않게)
function mdCell(s) {
  return String(s == null ? '' : s)
    .replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '')
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
    .replace(/\|/g, '\\|')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
const label = (id) => mdCell(String(id).replace(/^[a-z]+:/, ''));
const list = (ids) => (ids.length ? ids.map(label).join(' · ') : '—');
const byType = (ids, items) => TYPES.map(([t, name]) => [t, name, ids.filter((id) => (items[id] || {}).type === t)]).filter(([, , xs]) => xs.length);
const countLine = (ids, items) => byType(ids, items).map(([, name, xs]) => `${name} ${xs.length}`).join(' · ');

function buildDefaultsDoc(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('manifest 가 올바르지 않습니다 (객체가 아님)');
  const items = manifest.items && typeof manifest.items === 'object' ? manifest.items : {};
  const rel = manifest.relations && typeof manifest.relations === 'object' ? manifest.relations : {};
  const blocks = rel.blocks || {};
  const bundles = rel.bundles || {};
  const presets = rel.presets || {};
  const ids = Object.keys(items);
  const stateOf = (st) => ids.filter((id) => items[id].state === st);

  // 프리셋 검사 — 블록·묶음 이름만, 실제로 있는 것만
  for (const [name, p] of Object.entries(presets)) {
    if (!p || !Array.isArray(p.enable)) throw new Error(`프리셋 ${name} 의 enable 이 목록이 아닙니다`);
    const bad = p.enable.filter((g) => typeof g !== 'string' || !/^(?:block|bundle):/.test(g) || !expand(g, manifest));
    if (bad.length) throw new Error(`프리셋 ${name} 이 없는 블록·묶음을 가리킵니다: ${bad.map(String).join(', ')}`);
  }

  const out = [];
  out.push('<!-- 생성 파일 — 손으로 고치지 말고 node scripts/build-defaults-doc.js 로 다시 만든다 (재료: manifest.json) -->');
  out.push('');
  out.push('# 기본값·고정 목록 — gugbab-claude');
  out.push('');
  out.push('새 프로젝트에서 `gugbab-claude` 를 처음 열 때 무엇이 켜지고, 무엇이 고정(끌 수 없음)이며, 기본·프리셋마다 모든 항목이 🔒 고정·✅ 켜짐·⬜ 꺼짐 중 무엇인지 정리한 문서입니다.');
  out.push('기본값의 원본은 [항목 체크리스트](plans/2026-10-15-harness-item-checklist.md) 이고, 프로젝트마다 바꾸는 법은 세션 안 `/harness` — [사용 안내](USAGE.md) 를 보세요.');
  out.push('');
  out.push('적용 순서: 🔒 고정 > 프로젝트 `.gugbab.json` > 이 프로젝트 설정 > 모든 프로젝트 설정 > 기본값 (이 문서)');
  out.push('');

  // 요약
  out.push('## 요약');
  out.push('');
  out.push('| 종류 | 🔒 고정 | ✅ 기본 켬 | ⬜ 기본 끔 | 합계 |');
  out.push('|---|---:|---:|---:|---:|');
  const tot = { lock: 0, on: 0, off: 0 };
  for (const [t, name] of TYPES) {
    const c = { lock: 0, on: 0, off: 0 };
    for (const id of ids) if (items[id].type === t && own(c, items[id].state)) c[items[id].state]++;
    tot.lock += c.lock; tot.on += c.on; tot.off += c.off;
    out.push(`| ${name} | ${c.lock} | ${c.on} | ${c.off} | ${c.lock + c.on + c.off} |`);
  }
  out.push(`| **합계** | **${tot.lock}** | **${tot.on}** | **${tot.off}** | **${tot.lock + tot.on + tot.off}** |`);
  out.push('');

  const typeSection = (title, note, st) => {
    const xs = stateOf(st);
    out.push(`## ${title} — ${xs.length}개`);
    out.push('');
    if (note) { out.push(note); out.push(''); }
    if (!xs.length) { out.push('없음'); out.push(''); return; }
    for (const [, name, ys] of byType(xs, items)) out.push(`- **${name}** (${ys.length}): ${list(ys)}`);
    out.push('');
  };
  typeSection('🔒 고정', '어느 프로젝트에서도 끌 수 없습니다. 고정 항목이 필요로 하는 것도 같이 고정됩니다.', 'lock');
  typeSection('✅ 기본으로 켜짐', '처음부터 켜져 있고, 프로젝트마다 끌 수 있습니다.', 'on');

  // 꺼짐 — 스킬·에이전트는 블록별로, 나머지는 종류별로
  const off = stateOf('off');
  out.push(`## ⬜ 기본으로 꺼짐 — ${off.length}개`);
  out.push('');
  out.push('처음에는 꺼져 있습니다. 스택에 맞는 블록·프리셋을 켜면 들어옵니다.');
  out.push('');
  if (!off.length) out.push('없음');
  const offSA = new Set(off.filter((id) => ['skill', 'agent'].includes(items[id].type)));
  const shown = new Set();
  for (const [k, b] of Object.entries(blocks)) {
    const xs = (b.items || []).filter((id) => offSA.has(id));
    if (!xs.length) continue;
    xs.forEach((id) => shown.add(id));
    out.push(`<details><summary>${mdCell(b.title || k)} — 꺼진 항목 ${xs.length}개</summary>`);
    out.push('');
    for (const [, name, ys] of byType(xs, items)) out.push(`- **${name}**: ${list(ys)}`);
    out.push('');
    out.push('</details>');
    out.push('');
  }
  const loose = [...offSA].filter((id) => !shown.has(id));
  if (loose.length) out.push(`- **블록에 없는 꺼진 스킬·에이전트** (${loose.length}): ${list(loose)}`);
  for (const [, name, ys] of byType(off.filter((id) => !offSA.has(id)), items)) out.push(`- **${name}** (${ys.length}): ${list(ys)}`);
  out.push('');

  // 블록
  out.push('## 블록 구성');
  out.push('');
  out.push('블록 = 한 스택의 스킬·에이전트·언어 룰 묶음. `/harness` 에서 블록을 켜고 끄면 안의 항목이 한 번에 바뀝니다.');
  out.push('');
  const blockEntries = Object.entries(blocks);
  if (!blockEntries.length) out.push('없음');
  else {
    out.push('| 블록 | 제목 | 항목 수 | 기본 켬 |');
    out.push('|---|---|---:|---:|');
    for (const [k, b] of blockEntries) {
      const xs = (b.items || []).filter((id) => own(items, id));
      out.push(`| \`block:${mdCell(k)}\` | ${mdCell(b.title || k)} | ${xs.length} | ${xs.filter((id) => items[id].state !== 'off').length} |`);
    }
  }
  out.push('');

  // 묶음
  out.push('## 묶음 구성');
  out.push('');
  out.push('묶음 = 한 기능을 이루는 훅·룰·커맨드(·에이전트). 같이 켜고 끕니다.');
  out.push('');
  const bundleEntries = Object.entries(bundles);
  if (!bundleEntries.length) out.push('없음');
  else {
    out.push('| 묶음 | 제목 | 구성 |');
    out.push('|---|---|---|');
    for (const [k, b] of bundleEntries) out.push(`| \`bundle:${mdCell(k)}\` | ${mdCell(b.title || k)} | ${list((b.items || []).filter((id) => own(items, id)))} |`);
  }
  out.push('');

  // 프리셋 — "기본"(프리셋 없음) + 각 프리셋 하나만 적용했을 때의 실제 상태(resolve: 필수 의존·충돌 반영)
  const presetEntries = Object.entries(presets);
  const base = resolve(manifest, []);
  const views = [{ name: '기본', title: '프리셋 없음 (처음 상태)', enable: [], r: base, isBase: true }]
    .concat(presetEntries.map(([name, p]) => ({ name, title: p.title || name, enable: p.enable, r: resolve(manifest, [{ source: 'project', enable: p.enable }]) })));
  const cellOf = (v, id) => (v.r.locked.has(id) ? '🔒' : v.r.enabled.has(id) ? '✅' : '⬜');
  const colName = (v) => (v.isBase ? '기본' : `\`${mdCell(v.name)}\``);
  const blockOf = {};
  for (const [k, b] of Object.entries(blocks)) for (const id of (b.items || [])) (blockOf[id] = blockOf[id] || []).push(mdCell(b.title || k));

  out.push('## 기본 프리셋 설정');
  out.push('');
  out.push('프리셋 = 스택에 맞는 블록 여러 개를 한 번에 켜는 것. 프로젝트마다 따로 정합니다.');
  out.push('');
  out.push('- **처음 실행할 때 고름** — 프로젝트(git 최상위 폴더)에서 `gugbab-claude` 를 처음 띄우면 프로젝트 파일을 보고 추천한 뒤 번호로 고릅니다(여러 개는 쉼표, Enter = 추천, 0 = 고르지 않음 → 아래 "기본" 상태). 프로젝트마다 한 번만 묻습니다.');
  out.push('- **나중에 바꿈** — 세션 안 `/harness` 화면의 `p`, 또는 `gugbab-claude preset <이름>`. 프리셋은 블록을 켜기만 하므로, 다른 프리셋을 더하면 합쳐집니다(애드온은 이렇게 더해 쓰는 것).');
  out.push('- **범위** — 기본은 이 프로젝트만. `--all`(화면에서는 범위 전환)이면 모든 프로젝트 설정에 들어가고, 프로젝트 자기 설정이 있으면 그쪽이 이깁니다.');
  out.push('- **git 으로 공유** — 프로젝트 루트 `.gugbab.json` 의 `enable`(켤 것)·`lock`(못 끄게)을 팀이 함께 씁니다. 이 파일이 있으면 처음 실행 때 묻지 않습니다.');
  out.push('- **우선순위** — 🔒 고정 > `.gugbab.json` > 이 프로젝트 설정 > 모든 프로젝트 설정 > 기본값. 고정 항목은 어느 프리셋에서도 켜져 있습니다.');
  out.push('');

  out.push('## 프리셋 한눈 표');
  out.push('');
  out.push('기본값에 그 프리셋 **하나만** 적용했을 때의 실제 상태입니다(필수 의존·충돌 반영). 종류 칸은 `켜짐(🔒 포함)/전체`.');
  out.push('');
  if (!presetEntries.length) { out.push('프리셋 없음 — 아래는 기본 상태만'); out.push(''); }
  out.push(`| 프리셋 | 설명 | 🔒 고정 | ✅ 켜짐 | ⬜ 꺼짐 | ${TYPES.map(([, n]) => n).join(' | ')} |`);
  out.push(`|---|---|---:|---:|---:|${TYPES.map(() => '---:').join('|')}|`);
  for (const v of views) {
    const lk = ids.filter((id) => v.r.locked.has(id)).length;
    const on = ids.filter((id) => v.r.enabled.has(id) && !v.r.locked.has(id)).length;
    const perType = TYPES.map(([t]) => { const xs = ids.filter((id) => items[id].type === t); return `${xs.filter((id) => v.r.enabled.has(id)).length}/${xs.length}`; });
    out.push(`| ${colName(v)} | ${mdCell(v.title)} | ${lk} | ${on} | ${ids.length - lk - on} | ${perType.join(' | ')} |`);
  }
  out.push('');

  out.push('## 항목 × 프리셋 표');
  out.push('');
  out.push('🔒 고정 · ✅ 켜짐 · ⬜ 꺼짐. 칸마다 기본값에 그 프리셋 하나만 적용한 상태입니다. 종류별로 펼쳐 보세요.');
  out.push('');
  for (const [t, tn] of TYPES) {
    const xs = ids.filter((id) => items[id].type === t);
    if (!xs.length) continue;
    const withBlock = t === 'skill' || t === 'agent';
    out.push(`<details><summary>${tn} — ${xs.length}개</summary>`);
    out.push('');
    out.push(`| 항목 |${withBlock ? ' 블록 |' : ''} ${views.map(colName).join(' | ')} |`);
    out.push(`|---|${withBlock ? '---|' : ''}${views.map(() => ':-:').join('|')}|`);
    for (const id of xs) out.push(`| ${label(id)} |${withBlock ? ` ${(blockOf[id] || ['—']).join(' · ')} |` : ''} ${views.map((v) => cellOf(v, id)).join(' | ')} |`);
    out.push('');
    out.push('</details>');
    out.push('');
  }

  out.push('## 프리셋별 상세');
  out.push('');
  out.push('🔒 고정 항목은 모든 프리셋에서 같습니다(위 "🔒 고정" 목록).');
  out.push('');
  for (const v of views) {
    const onIds = ids.filter((id) => v.r.enabled.has(id) && !v.r.locked.has(id));
    const offIds = ids.filter((id) => !v.r.enabled.has(id));
    const lk = ids.filter((id) => v.r.locked.has(id)).length;
    out.push(`### ${colName(v)} — ${mdCell(v.title)}`);
    out.push('');
    if (!v.isBase && /^애드온/.test(String(v.title))) out.push('- 애드온 — 다른 프리셋에 더해 씀');
    if (!v.isBase) out.push(`- 켜는 블록: ${v.enable.map((g) => `\`${mdCell(g.replace(/^(?:block|bundle):/, ''))}\``).join(' · ')}`);
    out.push(`- 🔒 고정 ${lk} · ✅ 켜짐 ${onIds.length} · ⬜ 꺼짐 ${offIds.length}`);
    if (!v.isBase) {
      const turnedOn = ids.filter((id) => v.r.enabled.has(id) && !base.enabled.has(id));
      const turnedOff = ids.filter((id) => base.enabled.has(id) && !v.r.enabled.has(id));
      out.push(`- 기본과 비교: 새로 켜짐 ${turnedOn.length}개${turnedOn.length ? ` (${countLine(turnedOn, items)})` : ''}${turnedOff.length ? ` · 충돌로 꺼짐 ${turnedOff.length}개: ${list(turnedOff)}` : ''}`);
      if (turnedOn.length) {
        out.push('');
        out.push(`<details><summary>새로 켜지는 항목 ${turnedOn.length}개</summary>`);
        out.push('');
        for (const [, tn, ys] of byType(turnedOn, items)) out.push(`- **${tn}**: ${list(ys)}`);
        out.push('');
        out.push('</details>');
      }
    }
    out.push('');
    out.push(`<details><summary>✅ 켜짐 ${onIds.length}개 (🔒 고정 제외)</summary>`);
    out.push('');
    if (!onIds.length) out.push('없음');
    for (const [, tn, ys] of byType(onIds, items)) out.push(`- **${tn}** (${ys.length}): ${list(ys)}`);
    out.push('');
    out.push('</details>');
    out.push('');
    out.push(`<details><summary>⬜ 꺼짐 ${offIds.length}개</summary>`);
    out.push('');
    if (!offIds.length) out.push('없음');
    for (const [, tn, ys] of byType(offIds, items)) out.push(`- **${tn}** (${ys.length}): ${list(ys)}`);
    out.push('');
    out.push('</details>');
    out.push('');
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '\n');
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8')); } catch (e) { console.error(`manifest.json 을 읽지 못했습니다: ${e.message}`); process.exit(1); }
  const out = buildDefaultsDoc(manifest);
  const target = path.join(root, 'docs', 'DEFAULTS.md');
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    if (cur !== out) { console.error('docs/DEFAULTS.md 가 최신이 아닙니다 — node scripts/build-defaults-doc.js'); process.exit(1); }
    console.log('docs/DEFAULTS.md 최신');
  } else {
    fs.writeFileSync(target, out);
    console.log(`docs/DEFAULTS.md 생성: 항목 ${Object.keys(manifest.items || {}).length}, 프리셋 ${Object.keys((manifest.relations || {}).presets || {}).length}`);
  }
}

module.exports = { buildDefaultsDoc, mdCell, TYPES, TYPE_NAME };
