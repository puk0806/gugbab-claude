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

let removed = 0;
for (const { kind, rel } of entries) {
  const root = rootFor(kind);
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  if (!manifest[kind].set.has(rel)) {
    // docs 한정 폴백: 구버전(docs 매니페스트 이전) 설치의 짝 docs — 레포 원본과 바이트 동일하면
    // 미수정 관리 사본으로 보고 삭제한다 (2026-08-31 Codex R3). 수정본·소스 부재는 보존.
    if (kind === 'docs' && sourceDir) {
      const srcFull = path.join(sourceDir, 'docs', rel);
      if (fs.existsSync(srcFull) && sha(full) !== null && sha(full) === sha(srcFull)) {
        try {
          fs.unlinkSync(full);
          removed++;
          log(`옵션 제외로 삭제(소스 동일 증명): ${dispFor(kind, rel)}`);
          rmEmptyDirs(path.dirname(full), root);
        } catch { warn(`${dispFor(kind, rel)} 삭제 실패 — 직접 확인하세요`); }
        continue;
      }
    }
    warn(`옵션 제외 대상이지만 매니페스트 밖(커스텀?) → 보존: ${dispFor(kind, rel)}`);
    continue;
  }
  const recorded = manifest[kind].hashes[rel];
  const current = sha(full);
  if (typeof recorded !== 'string' || current !== recorded) { warn(`옵션 제외 대상이지만 설치 후 수정됨 → 보존: ${dispFor(kind, rel)}`); continue; }
  try {
    fs.unlinkSync(full);
    removed++;
    log(`옵션 제외로 삭제: ${dispFor(kind, rel)}`);
    rmEmptyDirs(path.dirname(full), root);
  } catch { warn(`${dispFor(kind, rel)} 삭제 실패 — 직접 확인하세요`); }
}
if (removed > 0) log(`옵션 제외 파일 ${removed}건 정리`);
process.exit(0);
