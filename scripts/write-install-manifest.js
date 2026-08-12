#!/usr/bin/env node
// 설치 매니페스트 작성기 — project-install.sh가 설치 마지막에 호출한다.
// 사용법: node write-install-manifest.js <target> <agentsList> <skillsList> <includeMemory true|false>
//
// 기록 규칙:
//  - agents/skills: 이번 실행이 복사한 목록 + (이전 매니페스트 중 대상에 아직 존재하는 항목) 합집합
//  - hashes: 설치 시점 콘텐츠 sha256. 이번에 복사된 항목만 새로 해싱하고, 이월 항목은
//    이전 기록을 유지한다 — 현재 파일을 재해싱하면 사용자의 로컬 수정본이 '설치 원본'으로
//    승격돼, 나중에 폐기될 때 cleanup이 수정본을 삭제해 버린다 (2026-08-12 적대적 리뷰 지적)
//  - memoryManaged: 옵션값(INCLUDE_MEMORY)이 기본이지만, memory OFF인데 이전(migration)이
//    미완이면(레포 memory/ + memory 훅 잔존) true를 유지한다 — false를 기록하면 다음
//    재설치가 선언을 믿고 재시도조차 안 하는 split-brain이 된다 (2026-08-12 적대적 리뷰 지적)
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const [target, agentsListFile, skillsListFile, mem, hooksListFile] = process.argv.slice(2);
if (!target) {
  console.error('사용법: write-install-manifest.js <target> <agentsList> <skillsList> <includeMemory>');
  process.exit(1);
}

const manifestFile = path.join(target, '.claude', '.install-manifest.json');

const readList = (f) => {
  try { return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean); } catch { return []; }
};

const sha256File = (f) => {
  try { return crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'); } catch { return null; }
};

// 이전 매니페스트 — 손상돼 있으면 무시하고 새로 만든다 (여기서는 삭제 판단을 하지 않으므로 안전)
let prev = { agents: [], skills: [], hooks: [], hashes: { agents: {}, skills: {}, hooks: {} } };
try {
  const p = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const hs = (p.hashes && typeof p.hashes === 'object') ? p.hashes : {};
  prev = {
    agents: Array.isArray(p.agents) ? p.agents : [],
    skills: Array.isArray(p.skills) ? p.skills : [],
    hooks: Array.isArray(p.hooks) ? p.hooks : [],
    hashes: {
      agents: (hs.agents && typeof hs.agents === 'object') ? hs.agents : {},
      skills: (hs.skills && typeof hs.skills === 'object') ? hs.skills : {},
      hooks: (hs.hooks && typeof hs.hooks === 'object') ? hs.hooks : {},
    },
  };
} catch { /* 없거나 손상 — 신규 생성 */ }

const build = (kind, listF) => {
  const fresh = new Set(readList(listF));
  const carried = prev[kind].filter((r) => fs.existsSync(path.join(target, '.claude', kind, r)));
  const rels = [...new Set([...carried, ...fresh])].sort();
  const hashes = {};
  for (const rel of rels) {
    if (fresh.has(rel)) {
      const h = sha256File(path.join(target, '.claude', kind, rel));
      if (h) hashes[rel] = h;
    } else if (typeof prev.hashes[kind][rel] === 'string') {
      hashes[rel] = prev.hashes[kind][rel];
    }
  }
  return { rels, hashes };
};

const agents = build('agents', agentsListFile);
const skills = build('skills', skillsListFile);
const hooks = build('hooks', hooksListFile); // 인자 생략 시 readList가 빈 목록 반환

// memoryManaged 판정 — install-cleanup.js와 동일한 관리 흔적 규칙을 쓴다
const MEMORY_EVIDENCE_RE = /memory-(pull|sync|stop-guard)\.c?js/;
let memoryManaged = mem === 'true';
if (!memoryManaged) {
  let repoMemExists = false;
  try { repoMemExists = fs.statSync(path.join(target, 'memory')).isDirectory(); } catch {}
  let evidence = false;
  try {
    evidence = fs.readdirSync(path.join(target, '.claude', 'hooks'))
      .some((e) => MEMORY_EVIDENCE_RE.test(e));
  } catch {}
  if (!evidence) {
    try {
      evidence = MEMORY_EVIDENCE_RE.test(
        fs.readFileSync(path.join(target, '.claude', 'settings.json'), 'utf8'));
    } catch {}
  }
  if (repoMemExists && evidence) {
    memoryManaged = true;
    console.log('  ⚠ memory 이전이 완료되지 않아 memoryManaged를 유지합니다 — 다음 재설치 때 이전을 재시도합니다');
  }
}

fs.mkdirSync(path.join(target, '.claude'), { recursive: true });
fs.writeFileSync(manifestFile, JSON.stringify({
  version: 1,
  updatedAt: new Date().toISOString(),
  memoryManaged,
  agents: agents.rels,
  skills: skills.rels,
  hooks: hooks.rels,
  hashes: { agents: agents.hashes, skills: skills.hashes, hooks: hooks.hashes },
}, null, 2) + '\n');
console.log(`  → .claude/.install-manifest.json (agents ${agents.rels.length} / skills ${skills.rels.length} / hooks ${hooks.rels.length})`);
