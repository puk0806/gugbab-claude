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
const run = (target, lines) => {
  const lf = path.join(tmp('list'), 'list.txt');
  fs.writeFileSync(lf, lines.join('\n') + '\n');
  const r = spawnSync('node', [SCRIPT, target, lf], { encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout}\n${r.stderr}` };
};
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
