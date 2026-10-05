#!/usr/bin/env node
// prune-option-excluded.js 테스트 — 정상 / 악성 방어 / 경계 3계층
// 실행: node scripts/prune-option-excluded.test.js
'use strict';
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SCRIPT = path.join(__dirname, 'prune-option-excluded.js');
let pass = 0, fail = 0;
const assert = (d, a, e) => { const ok = a === e; console.log(`  ${ok ? '✅' : '❌'} ${d}${ok ? '' : ` (기대 ${e}, 실제 ${a})`}`); ok ? pass++ : fail++; };
const tmp = (n) => fs.mkdtempSync(path.join(os.tmpdir(), `prune-${n}-`));
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const run = (target, lines, sourceDir) => {
  const lf = path.join(tmp('list'), 'list.txt');
  fs.writeFileSync(lf, lines.join('\n') + '\n');
  const r = spawnSync('node', [SCRIPT, target, lf, ...(sourceDir ? [sourceDir] : [])], { encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout}\n${r.stderr}` };
};
// <root>/docs/<rel> 작성 (대상·소스 공용)
const putDoc = (root, rel, body) => {
  const f = path.join(root, 'docs', rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, body);
  return f;
};
const ex = (f) => fs.existsSync(f);
const put = (target, kind, rel, body) => {
  const f = path.join(target, '.claude', kind, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, body);
  return f;
};
const manifest = (target, m) => {
  fs.mkdirSync(path.join(target, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(target, '.claude', '.install-manifest.json'), JSON.stringify(m));
};

console.log('[정상] 매니페스트 소유 + 해시 일치 → 삭제, 빈 디렉토리 정리');
{
  const t = tmp('tgt');
  const body = '# seo\n';
  put(t, 'skills', 'frontend/seo-nextjs/SKILL.md', body);
  put(t, 'skills', 'frontend/nextjs/SKILL.md', '# keep\n');
  put(t, 'agents', 'validation/seo-auditor.md', '# agent\n');
  manifest(t, { agents: ['validation/seo-auditor.md'], skills: ['frontend/seo-nextjs/SKILL.md', 'frontend/nextjs/SKILL.md'],
    hashes: { agents: { 'validation/seo-auditor.md': sha('# agent\n') }, skills: { 'frontend/seo-nextjs/SKILL.md': sha(body), 'frontend/nextjs/SKILL.md': sha('# keep\n') } } });
  const { code } = run(t, ['skills|frontend/seo-nextjs/SKILL.md', 'agents|validation/seo-auditor.md']);
  assert('exit 0', code, 0);
  assert('SEO 스킬 삭제', fs.existsSync(path.join(t, '.claude/skills/frontend/seo-nextjs/SKILL.md')), false);
  assert('빈 스킬 디렉토리 제거', fs.existsSync(path.join(t, '.claude/skills/frontend/seo-nextjs')), false);
  assert('frontend/ 디렉토리는 유지(다른 스킬 있음)', fs.existsSync(path.join(t, '.claude/skills/frontend/nextjs/SKILL.md')), true);
  assert('SEO 에이전트 삭제', fs.existsSync(path.join(t, '.claude/agents/validation/seo-auditor.md')), false);
}

console.log('\n[악성 방어] 커스텀·수정본·매니페스트 부재는 절대 삭제하지 않음');
{
  const t = tmp('tgt');
  put(t, 'skills', 'frontend/custom/SKILL.md', '# mine\n');                 // 매니페스트 밖
  put(t, 'skills', 'frontend/seo-nextjs/SKILL.md', '# edited locally\n');  // 해시 불일치
  put(t, 'skills', 'frontend/x/SKILL.md', '# no hash\n');                   // 기록만 있고 해시 없음
  manifest(t, { skills: ['frontend/seo-nextjs/SKILL.md', 'frontend/x/SKILL.md'], hashes: { skills: { 'frontend/seo-nextjs/SKILL.md': sha('# original\n') } } });
  const { out } = run(t, ['skills|frontend/custom/SKILL.md', 'skills|frontend/seo-nextjs/SKILL.md', 'skills|frontend/x/SKILL.md']);
  assert('커스텀 보존', fs.existsSync(path.join(t, '.claude/skills/frontend/custom/SKILL.md')), true);
  assert('로컬 수정본 보존', fs.existsSync(path.join(t, '.claude/skills/frontend/seo-nextjs/SKILL.md')), true);
  assert('해시 미기록 보존', fs.existsSync(path.join(t, '.claude/skills/frontend/x/SKILL.md')), true);
  assert('보존 경고 출력', /보존/.test(out), true);
}
{
  const t = tmp('tgt');
  put(t, 'skills', 'frontend/seo-nextjs/SKILL.md', '# seo\n');
  const { code } = run(t, ['skills|frontend/seo-nextjs/SKILL.md']); // 매니페스트 없음
  assert('매니페스트 없음 → 삭제 없음', fs.existsSync(path.join(t, '.claude/skills/frontend/seo-nextjs/SKILL.md')), true);
  assert('매니페스트 없음 → exit 0', code, 0);
}
{
  const t = tmp('tgt');
  put(t, 'skills', 'frontend/seo-nextjs/SKILL.md', '# seo\n');
  fs.writeFileSync(path.join(t, '.claude', '.install-manifest.json'), '{broken');
  run(t, ['skills|frontend/seo-nextjs/SKILL.md']);
  assert('손상된 매니페스트 → 삭제 없음', fs.existsSync(path.join(t, '.claude/skills/frontend/seo-nextjs/SKILL.md')), true);
}
{
  // 경로 조작: ../ 나 절대경로, 알 수 없는 kind 는 무시
  const t = tmp('tgt');
  const outside = path.join(t, 'outside.txt'); fs.writeFileSync(outside, 'x');
  put(t, 'skills', 'a/SKILL.md', '# a\n');
  manifest(t, { skills: ['a/SKILL.md', '../../outside.txt'], hashes: { skills: { 'a/SKILL.md': sha('# a\n'), '../../outside.txt': sha('x') } } });
  const { code } = run(t, ['skills|../../outside.txt', `skills|${outside}`, 'hooks|bash-guard.js', 'garbage-line', '|', 'skills|']);
  assert('../ 경로 무시 → 밖의 파일 보존', fs.existsSync(outside), true);
  assert('알 수 없는 kind(hooks)·깨진 줄 무시, exit 0', code, 0);
  assert('정상 항목 아닌 것은 건드리지 않음', fs.existsSync(path.join(t, '.claude/skills/a/SKILL.md')), true);
}

// ── 짝 단위 처리 (2026-09-25): 스킬 디렉토리 + 짝 docs, 에이전트 + 짝 docs 는 한 단위 ─────────────
// 버그: docs 섹션 없는 구버전 매니페스트 재설치에서 SKILL.md 는 수정본이라 보존됐는데 짝 verification.md 는
// "소스 동일" 폴백으로 삭제돼 "검증 문서 없는 스킬" 31종이 생겼다. 단위 중 하나라도 보존되면 단위 전체 보존.
// 2026-10-05 평탄화: 스킬 본체는 1단 .claude/skills/<name>/, 짝 docs 는 docs/skills/<cat>/<name>/.
// SKP = 설치본 스킬 폴더(현행 1단 기본), SK = 짝 docs prefix. 구 2단 레이아웃 회귀는 아래 [마이그레이션] 블록.
const SK = 'health/meal-plan';                   // 짝 docs prefix (docs/skills/<cat>/<name>)
let SKP = 'meal-plan';                           // 설치본 스킬 폴더 (.claude/skills/<name>)
const skLines = (extra = []) => [
  `skills|${SKP}/SKILL.md`,
  `skills|${SKP}/references/REF.md`,
  `docs|skills/${SK}/verification.md`,
  ...extra,
];
const skFixture = ({ skillBody = '# skill\n', refBody = '# ref\n', docBody = '# verif\n', docsInManifest = false } = {}) => {
  const t = tmp('tgt'); const src = tmp('src');
  const skill = put(t, 'skills', `${SKP}/SKILL.md`, skillBody);
  const ref = put(t, 'skills', `${SKP}/references/REF.md`, refBody);
  const doc = putDoc(t, `skills/${SK}/verification.md`, docBody);
  putDoc(src, `skills/${SK}/verification.md`, '# verif\n');   // 레포 원본
  const m = { skills: [`${SKP}/SKILL.md`, `${SKP}/references/REF.md`],
    hashes: { skills: { [`${SKP}/SKILL.md`]: sha('# skill\n'), [`${SKP}/references/REF.md`]: sha('# ref\n') } } };
  if (docsInManifest) { m.docs = [`skills/${SK}/verification.md`]; m.hashes.docs = { [`skills/${SK}/verification.md`]: sha('# verif\n') }; }
  manifest(t, m);                                              // docsInManifest=false = docs 섹션 없는 구버전 매니페스트
  return { t, src, skill, ref, doc };
};

console.log('\n[악성 방어] 짝 단위 — 스킬 수정본이면 소스 동일 docs 도 보존 (보고된 버그)');
{
  const { t, src, skill, ref, doc } = skFixture({ skillBody: '# skill edited locally\n' });
  const { out } = run(t, skLines(), src);
  assert('(a) 수정된 SKILL.md 보존', ex(skill), true);
  assert('(a) 짝 verification.md 도 보존 (소스 동일이어도)', ex(doc), true);
  assert('(a) 같은 스킬의 references 도 보존', ex(ref), true);
  assert('(a) 짝 단위 보존 경고 출력', /짝/.test(out), true);
}
{
  // SKILL.md 가 매니페스트 밖(커스텀·해시 미기록) → 스킬 보존 → 짝 docs 보존
  const { t, src, skill, doc } = skFixture();
  manifest(t, { skills: [], hashes: { skills: {} } });
  run(t, skLines(), src);
  assert('(a2) 매니페스트 밖 SKILL.md 보존', ex(skill), true);
  assert('(a2) 짝 docs 도 보존', ex(doc), true);
}
{
  // references 만 수정 → 스킬 단위 전체 보존 (SKILL.md 만 지워 references 가 고아가 되는 것도 방지)
  const { t, src, skill, ref, doc } = skFixture({ refBody: '# ref edited\n' });
  run(t, skLines(), src);
  assert('(a3) references 수정 → SKILL.md 보존', ex(skill), true);
  assert('(a3) references 수정본 보존', ex(ref), true);
  assert('(a3) references 수정 → 짝 docs 보존', ex(doc), true);
}

console.log('\n[정상] 짝 단위 — 전부 원본이면 전부 삭제');
{
  const { t, src, skill, ref, doc } = skFixture();
  run(t, skLines(), src);
  assert('(b) SKILL.md 삭제', ex(skill), false);
  assert('(b) references 삭제', ex(ref), false);
  assert('(b) 소스 동일 docs 삭제', ex(doc), false);
  assert('(b) 빈 docs 디렉토리 정리', ex(path.dirname(doc)), false);
}

console.log('\n[악성 방어] 짝 단위 — docs 만 수정돼도 스킬까지 보존');
{
  const { t, src, skill, ref, doc } = skFixture({ docBody: '# verif — 프로젝트 실사용 기록 추가\n' });
  run(t, skLines(), src);
  assert('(c) 원본 SKILL.md 도 보존', ex(skill), true);
  assert('(c) 원본 references 도 보존', ex(ref), true);
  assert('(c) 수정된 docs 보존', ex(doc), true);
}

console.log('\n[회귀] 매니페스트 docs 섹션 있는 설치 — 해시 증명 경로도 단위 적용');
{
  const { t, src, skill, doc } = skFixture({ docsInManifest: true });
  run(t, skLines(), src);
  assert('(d) 둘 다 해시 일치 → SKILL.md 삭제', ex(skill), false);
  assert('(d) 둘 다 해시 일치 → docs 삭제', ex(doc), false);
}
{
  const { t, src, skill, doc } = skFixture({ docsInManifest: true, skillBody: '# edited\n' });
  run(t, skLines(), src);
  assert('(d2) SKILL.md 수정 → 해시 일치 docs 도 보존', ex(skill) && ex(doc), true);
}
{
  const { t, src, skill, doc } = skFixture({ docsInManifest: true, docBody: '# edited doc\n' });
  run(t, skLines(), src);
  assert('(d3) docs 해시 불일치 → SKILL.md 도 보존', ex(skill) && ex(doc), true);
}
{
  // 단위 격리: 다른 스킬의 수정본이 무관한 스킬 삭제를 막지 않는다
  const { t, src, skill, doc } = skFixture();
  const other = put(t, 'skills', 'other/SKILL.md', '# other edited\n');
  const m = JSON.parse(fs.readFileSync(path.join(t, '.claude', '.install-manifest.json'), 'utf8'));
  m.skills.push('other/SKILL.md'); m.hashes.skills['other/SKILL.md'] = sha('# other\n');
  manifest(t, m);
  run(t, [...skLines(), 'skills|other/SKILL.md'], src);
  assert('(d4) 수정된 다른 스킬 보존', ex(other), true);
  assert('(d4) 무관한 원본 스킬·docs 는 삭제', `${ex(skill)},${ex(doc)}`, 'false,false');
}

console.log('\n[마이그레이션] 평탄화 이전 2단 설치본(.claude/skills/<cat>/<name>/) — 같은 이름 단위로 수렴');
{
  // 구 레이아웃: 스킬 폴더가 health/meal-plan — 단위 키는 이름(meal-plan)이라 짝 docs 와 묶인다
  SKP = 'health/meal-plan';
  try {
    const a = skFixture();
    run(a.t, skLines(), a.src);
    assert('(m1) 구 2단 전부 원본 → SKILL.md·references·docs 삭제', `${ex(a.skill)},${ex(a.ref)},${ex(a.doc)}`, 'false,false,false');
    const b = skFixture({ skillBody: '# legacy edited\n' });
    run(b.t, skLines(), b.src);
    assert('(m2) 구 2단 SKILL.md 수정본 → 짝 docs 까지 단위 보존', `${ex(b.skill)},${ex(b.doc)}`, 'true,true');
  } finally { SKP = 'meal-plan'; }
}
{
  // 구 2단 잔재와 현행 1단 사본이 함께 있을 때 — 구 잔재(해시 일치)만 지우고 현행 사본은 목록에 없으니 건드리지 않음
  const t = tmp('tgt'); const src = tmp('src');
  const legacy = put(t, 'skills', 'frontend/react-query/SKILL.md', '# rq\n');
  const flat = put(t, 'skills', 'react-query/SKILL.md', '# rq\n');
  manifest(t, { skills: ['frontend/react-query/SKILL.md'], hashes: { skills: { 'frontend/react-query/SKILL.md': sha('# rq\n') } } });
  run(t, ['skills|frontend/react-query/SKILL.md'], src);
  assert('(m3) 구 2단 잔재 삭제 + 현행 1단 사본 유지', `${ex(legacy)},${ex(flat)}`, 'false,true');
}
{
  const { skillDir, skillUnit, unitOf } = require('./prune-option-excluded.js');
  assert('(m4) 단위 키 — 현행 1단', `${skillDir('react-query/references/x.md')}|${skillUnit('react-query/SKILL.md')}`, 'react-query|react-query');
  assert('(m4) 단위 키 — 구 2단', `${skillDir('frontend/react-query/SKILL.md')}|${skillUnit('frontend/react-query/references/x.md')}`, 'frontend/react-query|react-query');
  assert('(m4) 단위 키 — 현행 1단 references 3세그먼트는 구 2단으로 오인하지 않음', skillDir('react-query/references/REF.md'), 'react-query');
  assert('(m4) 스킬·짝 docs 같은 단위', `${unitOf('skills', 'react-query/SKILL.md')}|${unitOf('docs', 'skills/frontend/react-query/verification.md')}`, 'skill:react-query|skill:react-query');
}

console.log('\n[악성 방어·정상] 짝 단위 — 에이전트 + 짝 docs(문서·verification)');
const AG = 'health/nutrition-tester.md';
const agLines = [`agents|${AG}`, `docs|agents/${AG}`, `docs|agents/health/nutrition-tester-verification.md`];
const agFixture = ({ agentBody = '# agent\n', verifBody = '# av\n' } = {}) => {
  const t = tmp('tgt'); const src = tmp('src');
  const agent = put(t, 'agents', AG, agentBody);
  const doc = putDoc(t, `agents/${AG}`, '# adoc\n');
  const verif = putDoc(t, 'agents/health/nutrition-tester-verification.md', verifBody);
  putDoc(src, `agents/${AG}`, '# adoc\n');
  putDoc(src, 'agents/health/nutrition-tester-verification.md', '# av\n');
  manifest(t, { agents: [AG], hashes: { agents: { [AG]: sha('# agent\n') } } });
  return { t, src, agent, doc, verif };
};
{
  const { t, src, agent, doc, verif } = agFixture({ agentBody: '# agent + 커스텀 평가 축\n' });
  run(t, agLines, src);
  assert('(e) 수정된 에이전트 보존', ex(agent), true);
  assert('(e) 짝 문서 보존', ex(doc), true);
  assert('(e) 짝 -verification.md 보존', ex(verif), true);
}
{
  const { t, src, agent, doc, verif } = agFixture();
  run(t, agLines, src);
  assert('(e2) 전부 원본 → 에이전트·문서·verification 모두 삭제', `${ex(agent)},${ex(doc)},${ex(verif)}`, 'false,false,false');
}
{
  const { t, src, agent, doc, verif } = agFixture({ verifBody: '# av edited\n' });
  run(t, agLines, src);
  assert('(e3) verification 만 수정 → 에이전트·문서도 보존', `${ex(agent)},${ex(doc)},${ex(verif)}`, 'true,true,true');
}

console.log('\n[경계] 짝 단위 — 고아 docs·공백 경로·커스텀 docs·중복 줄·단위 라벨 조작');
{
  // SKILL.md 가 이미 없는 고아 docs — 막을 스킬이 없으므로 증명되면 삭제
  const t = tmp('tgt'); const src = tmp('src');
  const doc = putDoc(t, `skills/${SK}/verification.md`, '# verif\n');
  putDoc(src, `skills/${SK}/verification.md`, '# verif\n');
  manifest(t, { skills: [], hashes: {} });
  const { code } = run(t, [`skills|${SK}/SKILL.md`, `docs|skills/${SK}/verification.md`], src);
  assert('고아 docs(스킬 부재) → 소스 동일이면 삭제', ex(doc), false);
  assert('고아 docs → exit 0', code, 0);
}
{
  // 경로에 공백 — 단위 매칭·삭제가 깨지지 않아야 함
  const P = 'my cat/my skill';   // 짝 docs prefix
  const N = 'my skill';          // 설치본 스킬 폴더 (1단)
  const t = tmp('tgt'); const src = tmp('src');
  const skill = put(t, 'skills', `${N}/SKILL.md`, '# s\n');
  const doc = putDoc(t, `skills/${P}/verification.md`, '# v\n');
  putDoc(src, `skills/${P}/verification.md`, '# v\n');
  manifest(t, { skills: [`${N}/SKILL.md`], hashes: { skills: { [`${N}/SKILL.md`]: sha('# s\n') } } });
  run(t, [`skills|${N}/SKILL.md`, `docs|skills/${P}/verification.md`], src);
  assert('공백 경로 — 전부 원본 → 둘 다 삭제', `${ex(skill)},${ex(doc)}`, 'false,false');
  const skill2 = put(t, 'skills', `${N}/SKILL.md`, '# s edited\n');
  const doc2 = putDoc(t, `skills/${P}/verification.md`, '# v\n');
  run(t, [`skills|${N}/SKILL.md`, `docs|skills/${P}/verification.md`], src);
  assert('공백 경로 — 수정본이면 둘 다 보존', `${ex(skill2)},${ex(doc2)}`, 'true,true');
}
{
  // 같은 폴더의 커스텀 docs(소스에도 매니페스트에도 없음)는 보존하되 단위 삭제를 막지 않는다 (기존 E2E 계약)
  const { t, src, skill, doc } = skFixture();
  const custom = putDoc(t, `skills/${SK}/my-notes.md`, '# 사용자 메모\n');
  run(t, skLines([`docs|skills/${SK}/my-notes.md`]), src);
  assert('커스텀 docs 보존', ex(custom), true);
  assert('커스텀 docs 가 있어도 원본 스킬·docs 는 삭제', `${ex(skill)},${ex(doc)}`, 'false,false');
}
{
  // 중복 줄(여러 분기가 같은 스킬을 기록) — 삭제 실패 경고 없이 1회 처리
  const { t, src, skill } = skFixture();
  const { out } = run(t, [...skLines(), ...skLines()], src);
  assert('중복 줄 → 삭제', ex(skill), false);
  assert('중복 줄 → 삭제 실패 경고 없음', /삭제 실패/.test(out), false);
}
{
  // 접두어 충돌(x vs xy)·경로 조작 줄이 단위 판정을 오염시키지 않는다
  const t = tmp('tgt'); const src = tmp('src');
  const edited = put(t, 'skills', 'x/SKILL.md', '# edited\n');
  const other = put(t, 'skills', 'xy/SKILL.md', '# y\n');
  const otherDoc = putDoc(t, 'skills/a/xy/verification.md', '# yv\n');
  putDoc(src, 'skills/a/xy/verification.md', '# yv\n');
  const outside = path.join(t, 'outside.md'); fs.writeFileSync(outside, 'x');
  manifest(t, { skills: ['x/SKILL.md', 'xy/SKILL.md'], hashes: { skills: { 'x/SKILL.md': sha('# x\n'), 'xy/SKILL.md': sha('# y\n') } } });
  run(t, ['skills|x/SKILL.md', 'skills|xy/SKILL.md', 'docs|skills/a/xy/verification.md', 'docs|skills/a/x/../../../outside.md'], src);
  assert('접두어 충돌 → 수정본 a/x 보존', ex(edited), true);
  assert('접두어 충돌 → 원본 a/xy 스킬·docs 는 삭제', `${ex(other)},${ex(otherDoc)}`, 'false,false');
  assert('../ 줄 무시 → 밖의 파일 보존', ex(outside), true);
}

// ── 매니페스트 이전(구버전) 설치본의 템플릿 외 자산 — 레포 원본 바이트 동일 폴백 (2026-09-26 감사 A) ──
// 매니페스트가 없거나 항목 기록이 없으면 docs 에만 쓰던 "레포 원본과 바이트 동일" 증명을 스킬(폴더 단위)·
// 에이전트(+짝 docs 단위)에도 적용한다. 하나라도 다르면(수정본 또는 레포 원본이 그 사이 바뀜) 단위 전체 보존.
const legacyUnit = (opts = {}) => {
  const t = tmp('tgt'); const src = tmp('src');
  const files = {
    skill: ['skills', 'frontend/dream-x/SKILL.md', '# dream\n'],
    ref: ['skills', 'frontend/dream-x/references/R.md', '# ref\n'],
    agent: ['agents', 'validation/dream-y.md', '# agent\n'],
  };
  const f = {};
  for (const [k, [kind, rel, body]] of Object.entries(files)) {
    // 설치본은 구버전(평탄화 이전) 2단 사본, 레포 원본은 현행 1단 <name>/ (2026-10-05) — 폴백 증명이 이 차이를 건너야 한다
    f[k] = put(t, kind, rel, body);
    const srcRel = kind === 'skills' ? rel.split('/').slice(1).join('/') : rel;
    if (!(opts.notInSource || []).includes(k)) put(src, kind, srcRel, body);
  }
  f.sdoc = putDoc(t, 'skills/frontend/dream-x/verification.md', '# sv\n'); putDoc(src, 'skills/frontend/dream-x/verification.md', '# sv\n');
  f.adoc = putDoc(t, 'agents/validation/dream-y.md', '# ad\n'); putDoc(src, 'agents/validation/dream-y.md', '# ad\n');
  f.aver = putDoc(t, 'agents/validation/dream-y-verification.md', '# av\n'); putDoc(src, 'agents/validation/dream-y-verification.md', '# av\n');
  if (opts.manifest) manifest(t, opts.manifest);
  for (const k of opts.edit || []) fs.appendFileSync(f[k], '<!-- local -->\n');
  const lines = ['skills|frontend/dream-x/SKILL.md', 'skills|frontend/dream-x/references/R.md', 'docs|skills/frontend/dream-x/verification.md',
    'agents|validation/dream-y.md', 'docs|agents/validation/dream-y.md', 'docs|agents/validation/dream-y-verification.md', ...(opts.extraLines || [])];
  return { t, src, f, lines };
};
const exAll = (...ps) => ps.map(ex).join(',');

console.log('\n[정상] 매니페스트 없음(구버전 설치) + 레포 원본과 동일 → 스킬 폴더·에이전트 단위(짝 docs 포함) 삭제');
{
  const { t, src, f, lines } = legacyUnit();
  const { code, out } = run(t, lines, src);
  assert('exit 0', code, 0);
  assert('스킬 SKILL.md·references·docs 삭제', exAll(f.skill, f.ref, f.sdoc), 'false,false,false');
  assert('스킬 빈 폴더 정리', ex(path.join(t, '.claude/skills/frontend/dream-x')), false);
  assert('에이전트 + 짝 docs + verification 삭제', exAll(f.agent, f.adoc, f.aver), 'false,false,false');
  assert('소스 동일 증명 로그', /소스 동일 증명/.test(out), true);
}
{
  // 매니페스트는 있으나(신버전 재설치 이후) 해당 항목 기록이 없는 경우도 같은 폴백
  const { t, src, f, lines } = legacyUnit({ manifest: { skills: [], agents: [], docs: [] } });
  run(t, lines, src);
  assert('매니페스트 무기록 항목 → 원본 동일이면 삭제', exAll(f.skill, f.ref, f.agent, f.aver), 'false,false,false,false');
}

console.log('\n[악성 방어] 폴백 증명 단위 — 한 파일이라도 다르면 단위 전체 보존 + 수동 확인 안내');
{
  const { t, src, f, lines } = legacyUnit({ edit: ['ref'] });
  const { out } = run(t, lines, src);
  assert('references 수정 → SKILL.md·references·docs 전부 보존', exAll(f.skill, f.ref, f.sdoc), 'true,true,true');
  assert('보존 경고에 수동 확인 안내', /수동 확인/.test(out), true);
  assert('다른 단위(에이전트)는 원본이라 삭제', ex(f.agent), false);
}
{
  const { t, src, f, lines } = legacyUnit({ edit: ['aver'] });
  run(t, lines, src);
  assert('에이전트 verification 수정 → 에이전트·짝 docs 전부 보존', exAll(f.agent, f.adoc, f.aver), 'true,true,true');
}
{
  // 레포 원본이 그 사이 바뀐 경우 = 설치본과 불일치 → 안전 쪽(보존)
  const { t, src, f, lines } = legacyUnit();
  fs.appendFileSync(path.join(src, '.claude/skills/dream-x/SKILL.md'), '\n## 레포 갱신\n');   // 레포 원본은 1단
  run(t, lines, src);
  assert('레포 원본 변경 → 구버전 사본 단위 보존', exAll(f.skill, f.ref, f.sdoc), 'true,true,true');
}
{
  // 레포에 없는 사용자 자산 → 증명 불가 → 보존
  const { t, src, f, lines } = legacyUnit({ notInSource: ['skill', 'ref', 'agent'] });
  run(t, lines, src);
  assert('레포에 없는 스킬·에이전트 보존', exAll(f.skill, f.ref, f.agent), 'true,true,true');
  assert('본체가 보존되면 원본 동일 docs 도 보존(짝 단위)', exAll(f.sdoc, f.adoc, f.aver), 'true,true,true');
}
{
  // 폴더 안에 레포에 없는 사용자 파일이 섞이면 "폴더 전체가 원본" 이 아니므로 단위 보존
  const { t, src, f, lines } = legacyUnit({ extraLines: ['skills|frontend/dream-x/my-notes.md'] });
  const notes = put(t, 'skills', 'frontend/dream-x/my-notes.md', '# mine\n');
  run(t, lines, src);
  assert('사용자 파일 섞인 폴백 스킬 폴더 → 전체 보존', exAll(f.skill, f.ref, notes), 'true,true,true');
}
{
  // 손상 매니페스트는 폴백도 금지 (조작 가능성)
  const { t, src, f, lines } = legacyUnit();
  fs.mkdirSync(path.join(t, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(t, '.claude', '.install-manifest.json'), '{ broken');
  run(t, lines, src);
  assert('손상 매니페스트 → 원본 동일이어도 삭제 없음', exAll(f.skill, f.agent, f.sdoc), 'true,true,true');
}
{
  // 소스 인자 없이 매니페스트 없음 → 종전대로 삭제 없음
  const { t, f, lines } = legacyUnit();
  run(t, lines);
  assert('sourceDir 없음 + 매니페스트 없음 → 삭제 없음', exAll(f.skill, f.agent), 'true,true');
}
{
  // symlink 스킬 파일(레포 원본을 가리켜 내용 동일) → 따라가 해시·삭제하지 않음
  const t = tmp('tgt'); const src = tmp('src');
  const real = put(src, 'skills', 'frontend/dream-z/SKILL.md', '# z\n');
  const link = path.join(t, '.claude/skills/frontend/dream-z/SKILL.md');
  fs.mkdirSync(path.dirname(link), { recursive: true });
  fs.symlinkSync(real, link);
  run(t, ['skills|frontend/dream-z/SKILL.md'], src);
  assert('symlink 스킬 파일 보존', !!fs.lstatSync(link, { throwIfNoEntry: false }), true);
  assert('symlink 대상(레포 원본) 보존', ex(real), true);
}
{
  // 경로 조작 줄은 폴백 경로에서도 무시
  const { t, src, lines } = legacyUnit();
  const outside = path.join(t, 'outside.md'); fs.writeFileSync(outside, '# o\n');
  fs.writeFileSync(path.join(src, 'outside.md'), '# o\n');
  run(t, [...lines, 'skills|../../outside.md', `skills|${outside}`], src);
  assert('../·절대경로 줄 → 대상 밖 파일 보존', ex(outside), true);
}

console.log('\n[경계] 빈 목록·없는 파일·목록 파일 없음');
{
  const t = tmp('tgt');
  manifest(t, { skills: ['gone/SKILL.md'], hashes: { skills: { 'gone/SKILL.md': sha('') } } });
  assert('이미 없는 파일 → exit 0', run(t, ['skills|gone/SKILL.md']).code, 0);
  assert('빈 목록 → exit 0', run(t, []).code, 0);
  const r = spawnSync('node', [SCRIPT, t, path.join(t, 'nope.txt')], { encoding: 'utf8' });
  assert('목록 파일 없음 → exit 0', r.status, 0);
  const r2 = spawnSync('node', [SCRIPT], { encoding: 'utf8' });
  assert('인자 없음 → exit 1', r2.status, 1);
}

console.log(`\n═══ 결과: ${pass} PASS / ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
