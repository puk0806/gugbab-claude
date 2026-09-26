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
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 3번째 인자 sourceDir(선택) — docs kind 한정 소유 증명 폴백 (2026-08-31 Codex R3):
// docs 매니페스트 도입(2026-08-31) 이전 설치의 매니페스트에는 docs 섹션이 없어 짝 docs를 영원히
// 정리할 수 없다. 매니페스트 증명이 없는 docs 항목은 <sourceDir>/docs/<rel>과 바이트 동일할 때만
// (= 레포 원본의 미수정 사본) 삭제한다 — skills/CLAUDE.md 정리의 cmp 소유 증명과 같은 패턴.
// 다른 kind에는 적용하지 않는다 (skills/agents 레거시는 --delete-orphans 확인 절차가 담당).
const [target, listFile, sourceDir] = process.argv.slice(2);
if (!target || !listFile) {
  console.error('사용법: prune-option-excluded.js <target> <listFile> [sourceDir]');
  process.exit(1);
}

const KINDS = new Set(['skills', 'agents', 'commands', 'docs']);
// docs kind만 루트가 <target>/docs — write-install-manifest.js의 rootFor와 동일 규칙
const rootFor = (kind) => (kind === 'docs' ? path.join(target, 'docs') : path.join(target, '.claude', kind));
const dispFor = (kind, rel) => (kind === 'docs' ? `docs/${rel}` : `.claude/${kind}/${rel}`);
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

let manifest = null;
try {
  const m = JSON.parse(fs.readFileSync(path.join(target, '.claude', '.install-manifest.json'), 'utf8'));
  const hs = (m.hashes && typeof m.hashes === 'object') ? m.hashes : {};
  manifest = {};
  for (const k of KINDS) {
    manifest[k] = { set: new Set(Array.isArray(m[k]) ? m[k] : []), hashes: (hs[k] && typeof hs[k] === 'object') ? hs[k] : {} };
  }
} catch {
  warn('매니페스트가 없거나 손상돼 옵션 제외 파일을 정리하지 않습니다 (삭제 없음)');
  process.exit(0);
}

const sha = (f) => { try { return crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'); } catch { return null; } };
const rmEmptyDirs = (dir, stopAt) => {
  let d = dir;
  while (d.startsWith(stopAt) && d !== stopAt) {
    try { if (fs.readdirSync(d).length > 0) break; fs.rmdirSync(d); } catch { break; }
    d = path.dirname(d);
  }
};

// ── 짝 단위(unit) 판정 (2026-09-25) ──────────────────────────────────────
// 스킬 디렉토리(SKILL.md + references/ 등) + 짝 docs/skills/<prefix>/**, 에이전트 .md + 짝
// docs/agents/<rel> · <name>-verification.md 는 한 단위다. 파일 단위로 따로 판정하면 docs 섹션 없는
// 구버전 매니페스트 재설치에서 수정본 SKILL.md 는 보존되고 짝 verification.md 는 "소스 동일" 폴백으로
// 지워져 "검증 문서 없는 스킬"이 생긴다(실보고 31종). 단위 키는 레포 레이아웃(skills/<cat>/<name>/)에서
// 결정적으로 도출한다 — 설치 스크립트 목록 형식을 바꾸지 않아 구 목록과도 호환된다.
// 단위 묶음은 **보존 쪽으로만** 작동한다(삭제 가능 파일을 보존으로 돌릴 뿐, 삭제를 늘리지 않음).
const skillUnit = (p) => { const s = p.split('/'); return s.length >= 3 ? s.slice(0, 2).join('/') : path.posix.dirname(p); };
const unitOf = (kind, rel) => {
  if (kind === 'skills') return `skill:${skillUnit(rel)}`;
  if (kind === 'agents') return `agent:${rel}`;
  if (kind === 'docs' && rel.startsWith('skills/')) return `skill:${skillUnit(rel.slice('skills/'.length))}`;
  if (kind === 'docs' && rel.startsWith('agents/')) return `agent:${rel.slice('agents/'.length).replace(/-verification\.md$/, '.md')}`;
  return `${kind}|${rel}`;
};
// 단위의 기준 파일(anchor) — 이것이 보존되면 단위 전체 보존
const isAnchor = (kind, rel) => (kind === 'agents') || (kind === 'skills' && path.posix.basename(rel) === 'SKILL.md');

// 1단계: 파일별 판정 — delete(소유 증명) / modified(관리 파일의 수정본·증명 불가 → 단위 차단) / custom(보존, 단위 차단 안 함)
const seen = new Set();
const decisions = [];
for (const { kind, rel } of entries) {
  const key = `${kind}|${rel}`;
  if (seen.has(key)) continue;           // 여러 분기가 같은 항목을 중복 기록해도 1회만 처리
  seen.add(key);
  const root = rootFor(kind);
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  const d = { kind, rel, root, full, unit: unitOf(kind, rel), anchor: isAnchor(kind, rel) };
  if (!manifest[kind].set.has(rel)) {
    // docs 한정 폴백: 구버전(docs 매니페스트 이전) 설치의 짝 docs — 레포 원본과 바이트 동일하면
    // 미수정 관리 사본으로 본다 (2026-08-31 Codex R3). 소스와 다르면 관리 문서의 수정본(단위 차단),
    // 소스에 없으면 사용자 커스텀(보존만, 단위 차단 안 함).
    if (kind === 'docs' && sourceDir) {
      const srcFull = path.join(sourceDir, 'docs', rel);
      if (fs.existsSync(srcFull)) {
        const cur = sha(full);
        d.state = (cur !== null && cur === sha(srcFull)) ? 'delete' : 'modified';
        d.viaSource = true;
        decisions.push(d);
        continue;
      }
    }
    d.state = 'custom';
    decisions.push(d);
    continue;
  }
  const recorded = manifest[kind].hashes[rel];
  d.state = (typeof recorded === 'string' && sha(full) === recorded) ? 'delete' : 'modified';
  decisions.push(d);
}

// 2단계: 단위 차단 — anchor 가 보존되거나 단위 안에 관리 파일 수정본이 있으면 단위 전체 보존
const blockedBy = new Map();
for (const d of decisions) {
  if (blockedBy.has(d.unit)) continue;
  if (d.state === 'modified' || (d.anchor && d.state !== 'delete')) blockedBy.set(d.unit, dispFor(d.kind, d.rel));
}

// 3단계: 실행
let removed = 0;
for (const d of decisions) {
  const disp = dispFor(d.kind, d.rel);
  if (d.state === 'custom') { warn(`옵션 제외 대상이지만 매니페스트 밖(커스텀?) → 보존: ${disp}`); continue; }
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
