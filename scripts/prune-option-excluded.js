#!/usr/bin/env node
// 옵션으로 제외된 관리 파일 정리 — project-install.sh가 복사 직후·매니페스트 갱신 직전에 호출한다.
// 사용법: node prune-option-excluded.js <target> <listFile>
//   listFile 각 줄: "<kind>|<rel>"  (kind = skills | agents | commands | docs)
//   rel 은 .claude/<kind>/ 이하 상대경로. 단 docs kind만 <target>/docs/ 이하 상대경로
//   (2026-08-31 Codex 리뷰: 자산 prune 시 짝 docs가 남아 스테일 문서가 되던 문제)
//
// 배경 (2026-08-26): 같은 템플릿을 다시 설치하면서 옵션을 바꾸면(SEO y→n, 작성 도구 y→n) 이전 설치가
// 복사해 둔 파일이 그대로 남았다. install-cleanup.js의 고아 판정은 "소스에 없는 파일"만 보므로 소스에
// 멀쩡히 있는 SEO 스킬은 절대 정리되지 않는다. 반대로 "이번 설치가 안 고른 파일 전부"를 지우면
// 다른 템플릿(backend 등)을 추가 설치해 둔 프로젝트의 자산을 파괴한다(템플릿은 가산적).
// 그래서 설치 스크립트가 **이번 템플릿 범위 안에서 옵션 때문에 제외된 것만** 명시 목록으로 넘기고,
// 여기서는 그 목록을 매니페스트 소유 증명(기록 + 설치 시점 해시 일치)이 있을 때만 삭제한다.
//  - 매니페스트에 없음 = 커스텀 → 보존 + 경고
//  - 해시 불일치 = 로컬 수정본 → 보존 + 경고
//  - 매니페스트 없음/손상 = 증명 불가 → 아무것도 삭제하지 않음
//
// 짝 단위 판정 함수(unitOf·classifyFile·blockUnits 등)는 module.exports 로 공개한다 —
// install-cleanup.js 의 폐기 자산 정리(2026-09-26)가 같은 규칙을 재사용한다(중복 구현 금지).
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KINDS = new Set(['skills', 'agents', 'commands', 'docs']);
// docs kind만 루트가 <target>/docs — write-install-manifest.js의 rootFor와 동일 규칙
const rootFor = (target, kind) => (kind === 'docs' ? path.join(target, 'docs') : path.join(target, '.claude', kind));
const dispFor = (kind, rel) => (kind === 'docs' ? `docs/${rel}` : `.claude/${kind}/${rel}`);

const sha = (f) => { try { return crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'); } catch { return null; } };
const rmEmptyDirs = (dir, stopAt) => {
  let d = dir;
  while (d.startsWith(stopAt) && d !== stopAt) {
    try { if (fs.readdirSync(d).length > 0) break; fs.rmdirSync(d); } catch { break; }
    d = path.dirname(d);
  }
};
const realOrNull = (p) => { try { return fs.realpathSync(p); } catch { return null; } };
// 삭제 안전성: 일반 파일(symlink 아님) + 실제 상위 경로가 base(실경로) 내부 (2026-09-26)
// — symlink 파일·symlink 디렉토리를 따라가 대상 밖을 해시·삭제하는 경로를 차단한다.
const safeRegularFile = (full, base) => {
  let st;
  try { st = fs.lstatSync(full); } catch { return false; }
  if (!st.isFile()) return false;
  const realBase = realOrNull(base);
  const realDir = realOrNull(path.dirname(full));
  return !!(realBase && realDir && (realDir === realBase || realDir.startsWith(realBase + path.sep)));
};

// ── 짝 단위(unit) 판정 (2026-09-25) ──────────────────────────────────────
// 스킬 디렉토리(SKILL.md + references/ 등) + 짝 docs/skills/<prefix>/**, 에이전트 .md + 짝
// docs/agents/<rel> · <name>-verification.md 는 한 단위다. 파일 단위로 따로 판정하면 docs 섹션 없는
// 구버전 매니페스트 재설치에서 수정본 SKILL.md 는 보존되고 짝 verification.md 는 "소스 동일" 폴백으로
// 지워져 "검증 문서 없는 스킬"이 생긴다(실보고 31종). 단위 키는 레포 레이아웃(skills/<cat>/<name>/)에서
// 결정적으로 도출한다 — 설치 스크립트 목록 형식을 바꾸지 않아 구 목록과도 호환된다.
// 단위 묶음은 **보존 쪽으로만** 작동한다(삭제 가능 파일을 보존으로 돌릴 뿐, 삭제를 늘리지 않음).
//
// 2026-10-05 스킬 평탄화: 스킬 본체는 Claude Code 가 인식하는 1단 경로 `.claude/skills/<name>/` 로 옮겼고
// 짝 검증 문서는 `docs/skills/<cat>/<name>/` 에 그대로 둔다. 그래서 단위 키는 카테고리 없는 **스킬 이름**이다.
// 평탄화 이전 설치본의 2단 경로(`<cat>/<name>/...`)도 같은 이름 단위로 묶어야 재설치 한 번에 수렴한다 —
// 첫 세그먼트가 아래 옛 카테고리면 2단(구 레이아웃), 아니면 1단(현행)으로 해석한다. 스킬 이름이 옛 카테고리와
// 같아지면 이 판별이 깨지므로 template-separation 테스트가 그런 이름을 금지한다.
const LEGACY_SKILL_CATEGORIES = new Set([
  'academic', 'architecture', 'backend', 'devops', 'frontend', 'game', 'health',
  'humanities', 'meta', 'philosophy', 'writing',
]);
const isLegacySkillRel = (s) => s.length >= 3 && LEGACY_SKILL_CATEGORIES.has(s[0]);
// 설치본 .claude/skills 기준 상대경로 → 스킬 폴더 경로 (현행 `<name>`, 구 `<cat>/<name>`)
const skillDir = (p) => { const s = p.split('/'); return isLegacySkillRel(s) ? s.slice(0, 2).join('/') : s[0]; };
// 설치본 .claude/skills 기준 상대경로 → 스킬 이름 (단위 키)
const skillUnit = (p) => { const s = p.split('/'); return isLegacySkillRel(s) ? s[1] : s[0]; };
const unitOf = (kind, rel) => {
  if (kind === 'skills') return `skill:${skillUnit(rel)}`;
  if (kind === 'agents') return `agent:${rel}`;
  // docs/skills/<cat>/<name>/** → 스킬 이름
  if (kind === 'docs' && rel.startsWith('skills/')) return `skill:${rel.split('/')[2]}`;
  if (kind === 'docs' && rel.startsWith('agents/')) return `agent:${rel.slice('agents/'.length).replace(/-verification\.md$/, '.md')}`;
  return `${kind}|${rel}`;
};
// 단위의 기준 파일(anchor) — 이것이 보존되면 단위 전체 보존
const isAnchor = (kind, rel) => (kind === 'agents') || (kind === 'skills' && path.posix.basename(rel) === 'SKILL.md');
// docs rel 이 스킬·에이전트의 짝 문서인가 — 카테고리 README·VERIFICATION_TEMPLATE 등 공용 문서는 제외
// (docs/skills/<cat>/<name>/** 또는 docs/agents/<cat>/<name>[-verification].md)
const isPairDoc = (rel) => {
  const s = rel.split('/');
  if (s[0] === 'skills') return s.length >= 4;
  if (s[0] === 'agents') return s.length >= 3 && s[s.length - 1] !== 'README.md' && s[s.length - 1].endsWith('.md');
  return false;
};

// 파일별 판정 — delete(소유 증명) / modified(관리 파일의 수정본·증명 불가 → 단위 차단) / custom(보존, 단위 차단 안 함)
//  mk: { set:Set, hashes:{} } — 해당 kind 의 매니페스트 기록 (없으면 빈 집합)
//  sourceDir: docs kind 한정 소유 증명 폴백 (2026-08-31 Codex R3) — docs 매니페스트 도입 이전 설치의
//    매니페스트에는 docs 섹션이 없어 짝 docs를 영원히 정리할 수 없다. 매니페스트 증명이 없는 docs 항목은
//    <sourceDir>/docs/<rel>과 바이트 동일할 때만(= 레포 원본의 미수정 사본) 삭제한다.
//    2026-09-26 감사 A: 매니페스트 이전 설치본의 템플릿 외 스킬·에이전트(dream·n8n 등)는 어떤 매니페스트에도
//    소유 기록이 없어 영원히 보존됐다 → 같은 폴백을 skills(폴더 단위)·agents(+짝 docs 단위)에도 적용한다.
//    레포 원본과 다르면(로컬 수정 또는 그 사이 레포 갱신) modified 로 단위 전체 보존(안전 쪽). commands 는 제외.
const FALLBACK_KINDS = new Set(['docs', 'skills', 'agents']);
const classifyFile = ({ target, kind, rel, mk, sourceDir }) => {
  const root = rootFor(target, kind);
  const full = path.join(root, rel);
  const d = { kind, rel, root, full, unit: unitOf(kind, rel), anchor: isAnchor(kind, rel) };
  if (!safeRegularFile(full, target)) { d.state = 'custom'; d.unsafe = true; return d; }
  if (!mk.set.has(rel)) {
    if (FALLBACK_KINDS.has(kind) && sourceDir) {
      // 구 2단 스킬 사본(<cat>/<name>/...)의 원본은 레포의 1단 <name>/... 이다 (2026-10-05 평탄화)
      const srcRel = kind === 'skills' && isLegacySkillRel(rel.split('/')) ? rel.split('/').slice(1).join('/') : rel;
      const srcFull = path.join(rootFor(sourceDir, kind), srcRel);
      if (fs.existsSync(srcFull)) {
        const cur = sha(full);
        d.state = (cur !== null && cur === sha(srcFull)) ? 'delete' : 'modified';
        d.viaSource = true;
        return d;
      }
    }
    d.state = 'custom';
    return d;
  }
  const recorded = mk.hashes[rel];
  d.state = (typeof recorded === 'string' && sha(full) === recorded) ? 'delete' : 'modified';
  return d;
};

// 단위 차단 — anchor 가 보존되거나 단위 안에 관리 파일 수정본이 있으면 단위 전체 보존
// 반환: Map<unit, 차단 원인 파일 표시경로>
// 폴백 증명(소스 동일) 스킬 폴더는 "폴더 내 모든 파일이 레포 원본" 이어야 한다 — 레포에 없는 파일(custom)이
// 섞여 있으면 사용자가 손댄 폴더로 보고 단위 전체 보존(2026-09-26 감사 A). 매니페스트 증명 단위는 종전대로
// custom 을 보존만 하고 단위를 막지 않는다.
const blockUnits = (decisions) => {
  const blockedBy = new Map();
  const fallbackUnits = new Set(decisions.filter((d) => d.viaSource && d.kind !== 'docs').map((d) => d.unit));
  for (const d of decisions) {
    if (blockedBy.has(d.unit)) continue;
    if (d.state === 'modified' || (d.anchor && d.state !== 'delete') ||
        (d.state === 'custom' && d.kind !== 'docs' && fallbackUnits.has(d.unit))) blockedBy.set(d.unit, dispFor(d.kind, d.rel));
  }
  return blockedBy;
};

module.exports = { KINDS, rootFor, dispFor, sha, rmEmptyDirs, safeRegularFile, LEGACY_SKILL_CATEGORIES, skillDir, skillUnit, unitOf, isAnchor, isPairDoc, classifyFile, blockUnits };

function main() {
  // 3번째 인자 sourceDir(선택) — docs kind 한정 소유 증명 폴백 (classifyFile 주석 참조)
  const [target, listFile, sourceDir] = process.argv.slice(2);
  if (!target || !listFile) {
    console.error('사용법: prune-option-excluded.js <target> <listFile> [sourceDir]');
    process.exit(1);
  }
  const log = (m) => console.log(`  [prune] ${m}`);
  const warn = (m) => console.log(`  [prune] ⚠ ${m}`);

  let entries = [];
  try {
    entries = fs.readFileSync(listFile, 'utf8').split('\n').filter(Boolean).map((l) => {
      const i = l.indexOf('|');
      return i > 0 ? { kind: l.slice(0, i), rel: l.slice(i + 1) } : null;
    }).filter((e) => e && KINDS.has(e.kind) && e.rel && !e.rel.includes('..') && !path.isAbsolute(e.rel));
  } catch { process.exit(0); }
  if (entries.length === 0) process.exit(0);

  // 매니페스트 없음(구버전 설치) + sourceDir → 빈 매니페스트로 진행: 레포 원본 바이트 동일 폴백만 증명으로 인정.
  // 매니페스트 손상(존재하나 파싱 불가·비객체) → 조작 가능성 → 어떤 삭제도 하지 않는다.
  const manifestFile = path.join(target, '.claude', '.install-manifest.json');
  let m = null;
  if (fs.existsSync(manifestFile)) {
    try { m = JSON.parse(fs.readFileSync(manifestFile, 'utf8')); } catch { m = null; }
    if (!m || typeof m !== 'object' || Array.isArray(m)) {
      warn('매니페스트가 손상돼 옵션 제외 파일을 정리하지 않습니다 (삭제 없음)');
      process.exit(0);
    }
  } else if (sourceDir) {
    m = {};
    log('매니페스트 없음(구버전 설치) — 레포 원본과 바이트 동일한 사본만 정리합니다');
  } else {
    warn('매니페스트가 없어 옵션 제외 파일을 정리하지 않습니다 (삭제 없음)');
    process.exit(0);
  }
  const hs = (m.hashes && typeof m.hashes === 'object') ? m.hashes : {};
  const manifest = {};
  for (const k of KINDS) {
    manifest[k] = { set: new Set(Array.isArray(m[k]) ? m[k] : []), hashes: (hs[k] && typeof hs[k] === 'object') ? hs[k] : {} };
  }

  // 1단계: 파일별 판정
  const seen = new Set();
  const decisions = [];
  for (const { kind, rel } of entries) {
    const key = `${kind}|${rel}`;
    if (seen.has(key)) continue;           // 여러 분기가 같은 항목을 중복 기록해도 1회만 처리
    seen.add(key);
    if (!fs.lstatSync(path.join(rootFor(target, kind), rel), { throwIfNoEntry: false })) continue;
    decisions.push(classifyFile({ target, kind, rel, mk: manifest[kind], sourceDir }));
  }

  // 2단계: 단위 차단
  const blockedBy = blockUnits(decisions);

  // 3단계: 실행
  let removed = 0;
  for (const d of decisions) {
    const disp = dispFor(d.kind, d.rel);
    if (d.unsafe) { warn(`symlink 이거나 대상 밖 경로 → 보존: ${disp}`); continue; }
    if (d.state === 'custom') { warn(`옵션 제외 대상이지만 매니페스트 밖(커스텀?) → 보존: ${disp}`); continue; }
    if (d.state === 'modified' && d.viaSource) { warn(`옵션 제외 대상이지만 레포 원본과 다름(로컬 수정 또는 레포 갱신) → 보존 — 수동 확인 후 불필요하면 삭제하세요: ${disp}`); continue; }
    if (d.state === 'modified') { warn(`옵션 제외 대상이지만 설치 후 수정됨 → 보존: ${disp}`); continue; }
    if (blockedBy.has(d.unit)) { warn(`짝 단위 보존(같은 단위의 ${blockedBy.get(d.unit)} 보존) → 보존: ${disp}`); continue; }
    try {
      fs.unlinkSync(d.full);
      removed++;
      log(`옵션 제외로 삭제${d.viaSource ? '(소스 동일 증명)' : ''}: ${disp}`);
      rmEmptyDirs(path.dirname(d.full), d.root);
    } catch { warn(`${disp} 삭제 실패 — 직접 확인하세요`); }
  }
  if (removed > 0) log(`옵션 제외 파일 ${removed}건 정리`);
  process.exit(0);
}

if (require.main === module) main();
