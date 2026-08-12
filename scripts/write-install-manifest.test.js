#!/usr/bin/env node
// write-install-manifest.js 테스트 — 정상 / 악성 방어 / 이상·경계 3계층.
//
// 검증 축:
//  1. 설치 목록 + 이전 매니페스트 합집합, 설치 시점 sha256 기록
//  2. 이월 항목의 해시는 재계산하지 않음 (로컬 수정본을 '원본'으로 승격 금지)
//  3. memoryManaged — 옵션값이 아니라 *이전 완료 여부*를 반영 (split-brain 방지)
//  4. 손상 입력(깨진 이전 매니페스트, 누락 파일)에서 크래시 없이 안전 동작
'use strict';

const { spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SCRIPT = path.join(__dirname, 'write-install-manifest.js');

let pass = 0;
let fail = 0;
const assert = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; console.log(`  ✅ ${name} → PASS`); }
  else { fail++; console.log(`  ❌ ${name} → FAIL (기대: ${JSON.stringify(expected)}, 실제: ${JSON.stringify(actual)})`); }
};

const sha256 = (content) => crypto.createHash('sha256').update(content).digest('hex');

const tmp = (label) => fs.mkdtempSync(path.join(os.tmpdir(), `wim-${label}-`));

// 대상 프로젝트 뼈대 생성 + 에이전트/스킬 파일 심기
const makeTarget = (root, files = {}) => {
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  fs.mkdirSync(path.join(root, '.claude'), { recursive: true });
  return root;
};

const listFile = (dir, rels) => {
  const f = path.join(dir, `list-${Math.random().toString(36).slice(2)}.txt`);
  fs.writeFileSync(f, rels.map((r) => `${r}\n`).join(''));
  return f;
};

const run = (target, agentsRels, skillsRels, mem, hooksRels = []) => {
  const scratch = tmp('lists');
  const r = spawnSync('node', [
    SCRIPT, target, listFile(scratch, agentsRels), listFile(scratch, skillsRels), mem,
    listFile(scratch, hooksRels),
  ], { encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout}\n${r.stderr}` };
};

const readManifest = (target) =>
  JSON.parse(fs.readFileSync(path.join(target, '.claude', '.install-manifest.json'), 'utf8'));

console.log('[정상] 설치 목록 → 매니페스트 생성 (정렬·해시·memoryManaged=true)');
{
  const tgt = makeTarget(tmp('tgt'), {
    '.claude/agents/meta/b.md': '# agent b\n',
    '.claude/agents/meta/a.md': '# agent a\n',
    '.claude/skills/backend/s1/SKILL.md': '# skill 1\n',
  });
  const { code } = run(tgt, ['meta/b.md', 'meta/a.md'], ['backend/s1/SKILL.md'], 'true');
  const m = readManifest(tgt);
  assert('exit 0', code, 0);
  assert('agents 정렬 기록', m.agents, ['meta/a.md', 'meta/b.md']);
  assert('skills 기록', m.skills, ['backend/s1/SKILL.md'])
  assert('agent 해시 = 설치 파일 sha256', m.hashes.agents['meta/a.md'], sha256('# agent a\n'));
  assert('skill 해시 기록', m.hashes.skills['backend/s1/SKILL.md'], sha256('# skill 1\n'));
  assert('memoryManaged=true (옵션 켬)', m.memoryManaged, true);
}

console.log('\n[정상] 재설치 — 이전 매니페스트와 합집합, 대상에서 사라진 항목은 제외');
{
  const tgt = makeTarget(tmp('tgt'), {
    '.claude/agents/meta/kept.md': '# kept\n',
    '.claude/agents/meta/new.md': '# new\n',
  });
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify({
    version: 1, memoryManaged: true,
    agents: ['meta/kept.md', 'meta/gone.md'], skills: [],
    hashes: { agents: { 'meta/kept.md': sha256('# kept\n'), 'meta/gone.md': 'x' }, skills: {} },
  }));
  run(tgt, ['meta/new.md'], [], 'true');
  const m = readManifest(tgt);
  assert('이월+신규 합집합', m.agents, ['meta/kept.md', 'meta/new.md'])
  assert('사라진 항목(gone.md) 제외', m.agents.includes('meta/gone.md'), false);
  assert('신규 항목 해시 기록', m.hashes.agents['meta/new.md'], sha256('# new\n'));
}

console.log('\n[악성 방어] 이월 항목이 로컬 수정돼도 해시를 재계산하지 않음 (수정본 원본 승격 금지)');
{
  // 이월 항목을 현재 내용으로 다시 해싱하면 로컬 수정본이 "설치 원본"이 돼서
  // 나중에 폐기될 때 cleanup이 수정본을 삭제해 버린다.
  const originalHash = sha256('# original installed\n');
  const tgt = makeTarget(tmp('tgt'), {
    '.claude/agents/meta/edited.md': '# locally EDITED by user\n',
  });
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify({
    version: 1, memoryManaged: true, agents: ['meta/edited.md'], skills: [],
    hashes: { agents: { 'meta/edited.md': originalHash }, skills: {} },
  }));
  run(tgt, [], [], 'true');
  const m = readManifest(tgt);
  assert('이월 항목 유지', m.agents, ['meta/edited.md']);
  assert('설치 시점 해시 보존 (재계산 금지)', m.hashes.agents['meta/edited.md'], originalHash);
}

console.log('\n[경계] memory OFF + 이전 완료 → memoryManaged=false');
{
  const tgt = makeTarget(tmp('tgt'), { '.claude/agents/meta/a.md': '# a\n' });
  run(tgt, ['meta/a.md'], [], 'false');
  assert('memoryManaged=false', readManifest(tgt).memoryManaged, false);
}

console.log('\n[경계] memory OFF지만 이전 미완(레포 memory/ + memory 훅 잔존) → memoryManaged 유지 (split-brain 방지)');
{
  // 마이그레이션이 실패해 잔재가 남았는데 false를 기록하면, 다음 재설치가 선언을 믿고
  // 재시도조차 안 하는 영구 고아 상태가 된다. 잔재가 있으면 true를 유지해 재시도를 보장한다.
  const tgt = makeTarget(tmp('tgt'), {
    'memory/MEMORY.md': '# memory index\n',
    '.claude/hooks/memory-sync.js': '// hook\n',
    '.claude/agents/meta/a.md': '# a\n',
  });
  const { out } = run(tgt, ['meta/a.md'], [], 'false');
  assert('memoryManaged=true 유지', readManifest(tgt).memoryManaged, true);
  assert('유지 사유 안내 출력', /memory/.test(out), true);
}

console.log('\n[경계] memory OFF + 레포 memory/ 있으나 관리 흔적 없음(프로젝트 고유 데이터) → false');
{
  const tgt = makeTarget(tmp('tgt'), {
    'memory/app-data.md': '# project-owned\n',
    '.claude/agents/meta/a.md': '# a\n',
  });
  run(tgt, ['meta/a.md'], [], 'false');
  assert('memoryManaged=false (고유 데이터 불간섭)', readManifest(tgt).memoryManaged, false);
}

console.log('\n[악성 방어] 이전 매니페스트가 손상(JSON 파싱 불가)돼도 새 매니페스트를 정상 생성');
{
  const tgt = makeTarget(tmp('tgt'), { '.claude/agents/meta/a.md': '# a\n' });
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), '{corrupted!!!');
  const { code } = run(tgt, ['meta/a.md'], [], 'true');
  assert('exit 0 (크래시 없음)', code, 0);
  assert('손상 무시하고 신규 생성', readManifest(tgt).agents, ['meta/a.md']);
}

console.log('\n[이상 경로] 목록 파일 누락·목록의 파일 실체 없음 → 크래시 없이 안전 기록');
{
  const tgt = makeTarget(tmp('tgt'), {});
  const r = spawnSync('node', [SCRIPT, tgt, '/nonexistent/a.txt', '/nonexistent/s.txt', 'true'], { encoding: 'utf8' });
  assert('목록 파일 누락 → exit 0', r.status, 0);
  assert('빈 매니페스트 생성', readManifest(tgt).agents, []);

  const tgt2 = makeTarget(tmp('tgt'), {});
  const { code } = run(tgt2, ['meta/never-copied.md'], [], 'true');
  const m2 = readManifest(tgt2);
  assert('실체 없는 항목도 exit 0', code, 0);
  assert('실체 없는 항목은 해시 미기록', m2.hashes.agents['meta/never-copied.md'] === undefined, true);
}

console.log('\n[정상] 복사된 훅 파일도 목록+해시로 기록 (폐지 훅 소유 증명의 근거)');
{
  const tgt = makeTarget(tmp('tgt'), {
    '.claude/hooks/bash-guard.js': '// bash guard\n',
    '.claude/agents/meta/a.md': '# a\n',
  });
  run(tgt, ['meta/a.md'], [], 'true', ['bash-guard.js']);
  const m = readManifest(tgt);
  assert('hooks 목록 기록', m.hooks, ['bash-guard.js']);
  assert('hooks 해시 기록', m.hashes.hooks['bash-guard.js'], sha256('// bash guard\n'));
}

console.log('\n[경계] 훅 목록 인자 생략(구버전 호출) → hooks 빈 배열로 안전 기록');
{
  const tgt = makeTarget(tmp('tgt'), { '.claude/agents/meta/a.md': '# a\n' });
  const scratch = tmp('lists');
  const r = spawnSync('node', [
    SCRIPT, tgt, listFile(scratch, ['meta/a.md']), listFile(scratch, []), 'true',
  ], { encoding: 'utf8' });
  assert('exit 0', r.status, 0);
  assert('hooks 빈 배열', readManifest(tgt).hooks, []);
}

console.log('\n[악성 방어] 이월 훅이 로컬 수정돼도 해시 재계산 금지 (agents와 동일 원칙)');
{
  const originalHash = sha256('// original hook\n');
  const tgt = makeTarget(tmp('tgt'), {
    '.claude/hooks/bash-guard.js': '// user EDITED hook\n',
  });
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify({
    version: 1, memoryManaged: true, agents: [], skills: [], hooks: ['bash-guard.js'],
    hashes: { agents: {}, skills: {}, hooks: { 'bash-guard.js': originalHash } },
  }));
  run(tgt, [], [], 'true', []);
  const m = readManifest(tgt);
  assert('이월 훅 유지', m.hooks, ['bash-guard.js']);
  assert('설치 시점 해시 보존', m.hashes.hooks['bash-guard.js'], originalHash);
}

console.log(`\n═══ 결과: ${pass} PASS / ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
