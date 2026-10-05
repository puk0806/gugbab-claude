'use strict';
// skill-index.js — 스킬 논리 ID({category}/{name}) ↔ 실제 경로 매핑 (2026-10-05 평탄화)
//
// 스킬 본체는 Claude Code 가 인식하는 1단 경로 `.claude/skills/<name>/SKILL.md` 에 있고, 카테고리는 짝 검증 문서
// `docs/skills/<category>/<name>/` 위치가 단일 원천이다(project-install.sh 의 skill_category 와 같은 규칙).
// 테스트·도구는 사람이 읽기 쉬운 논리 ID `<category>/<name>` 을 계속 쓰고, 이 모듈로 실제 경로와 오간다.

const fs = require('node:fs');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');

// 레포 docs/skills/<cat>/<name>/ → Map(name → cat). 같은 이름이 둘 이상의 카테고리에 있으면 예외(구조 위반).
function categoryMap(repo = REPO) {
  const docs = path.join(repo, 'docs', 'skills');
  const map = new Map();
  for (const cat of fs.readdirSync(docs, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    for (const n of fs.readdirSync(path.join(docs, cat.name), { withFileTypes: true })) {
      if (!n.isDirectory()) continue;
      if (map.has(n.name)) throw new Error(`스킬 이름 중복: ${n.name} (${map.get(n.name)}, ${cat.name})`);
      map.set(n.name, cat.name);
    }
  }
  return map;
}

// 논리 ID → 이름
const nameOf = (id) => id.split('/').pop();

// 설치본(또는 레포) .claude/skills 아래 스킬 → 논리 ID 목록(정렬).
// 1단 `<name>/SKILL.md` 는 categoryMap 으로 카테고리를 붙이고(모르면 `?/<name>`), 평탄화 이전 2단 잔재
// `<cat>/<name>/SKILL.md` 는 그대로 논리 ID 로 본다.
function installedSkillIds(dir, cmap = categoryMap()) {
  const root = path.join(dir, '.claude', 'skills');
  const out = [];
  if (!fs.existsSync(root)) return out;
  for (const e of fs.readdirSync(root, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (fs.existsSync(path.join(root, e.name, 'SKILL.md'))) { out.push(`${cmap.get(e.name) || '?'}/${e.name}`); continue; }
    for (const s of fs.readdirSync(path.join(root, e.name), { withFileTypes: true })) {
      if (s.isDirectory() && fs.existsSync(path.join(root, e.name, s.name, 'SKILL.md'))) out.push(`${e.name}/${s.name}`);
    }
  }
  return out.sort();
}

// 논리 ID → 설치본 스킬 폴더 절대경로
const skillDirOf = (dir, id) => path.join(dir, '.claude', 'skills', nameOf(id));

module.exports = { categoryMap, installedSkillIds, nameOf, skillDirOf };
