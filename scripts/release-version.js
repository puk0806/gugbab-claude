#!/usr/bin/env node
// release-version.js — 이 레포 버전(VERSION 파일)과 GitHub 태그(v*)를 맞추는 도구 (계획서 결정 32)
//   PR 마다 VERSION 을 최신 태그보다 크게 올리고(release-version-guard 훅 · version-check 워크플로가 검사),
//   main 에 머지되면 release-on-main 워크플로가 VERSION 값으로 태그와 Release 를 만든다.
//
//   node scripts/release-version.js check [--remote]     VERSION(커밋된 HEAD 값) > 최신 태그인지 (아니면 exit 1)
//   node scripts/release-version.js bump [patch|minor|major] [--remote]
//                                                          최신 태그·VERSION 중 큰 쪽을 올려 VERSION 에 쓴다 (커밋은 하지 않음)
//   node scripts/release-version.js release-tag           머지 후 달 태그 이름(v<VERSION>)을 출력 — 형식이 틀리면 exit 1
//   node scripts/release-version.js latest [--remote]     최신 v* 태그
//   node scripts/release-version.js notes [--title "핵심 수정 요약"] [--base <커밋>] [--print]
//                                                          docs/release-notes/<VERSION> <핵심 수정 요약>.md 초안 (bump 도 끝에 부름, --no-notes 로 끔)
//   node scripts/release-version.js notes-check           커밋된 VERSION 의 릴리스 노트가 HEAD 에 커밋돼 있는지 (아니면 exit 1)
//   node scripts/release-version.js notes-path            커밋된 그 노트의 경로를 출력 (없으면 빈 줄) — release-on-main 이 Release 본문으로 씀
// --remote: origin 의 태그를 3초 안에 확인하고, 실패하면 로컬 태그로 판단한다
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const MAX_PART = 999999;
const VER_RE = /^(\d{1,6})\.(\d{1,6})\.(\d{1,6})$/;
const TAG_RE = /^v(\d{1,6})\.(\d{1,6})\.(\d{1,6})$/;

// "1.2.3" (끝 줄바꿈 하나만 허용) → [1,2,3], 그 밖(접두어·접미어·공백·셸 문자·0 앞붙임)은 null
function parseVersion(s) {
  if (typeof s !== 'string' || s.length > 32) return null;
  const m = s.replace(/\r?\n$/, '').match(VER_RE);
  if (!m) return null;
  const parts = m.slice(1).map(Number);
  if (m.slice(1).some((x) => x.length > 1 && x.startsWith('0'))) return null;
  return parts.every((n) => Number.isSafeInteger(n) && n <= MAX_PART) ? parts : null;
}
function parseTag(t) {
  if (typeof t !== 'string') return null;
  const m = t.match(TAG_RE);
  return m ? parseVersion(m.slice(1).join('.')) : null;
}
const cmp = (a, b) => (a[0] - b[0]) || (a[1] - b[1]) || (a[2] - b[2]);
const fmt = (v) => v.join('.');

// 태그 목록에서 정확히 vX.Y.Z 인 것 중 가장 큰 것 (위장 태그 v1.0.1-evil·v9.9.9.1·V1.0.0 은 무시)
function latestTag(tags) {
  let best = null;
  for (const t of tags || []) { const v = parseTag(String(t)); if (v && (!best || cmp(v, best) > 0)) best = v; }
  return best;
}

function bump(v, kind = 'patch') {
  if (kind === 'major') return [v[0] + 1, 0, 0];
  if (kind === 'minor') return [v[0], v[1] + 1, 0];
  if (kind === 'patch') return [v[0], v[1], v[2] + 1];
  throw new Error(`모르는 올림 종류: ${kind} (patch|minor|major)`);
}

// VERSION 이 최신 태그보다 커야 PR 가능. 태그가 하나도 없으면(첫 릴리스) 형식만 맞으면 통과
function checkVersion(versionText, tags) {
  const v = parseVersion(versionText);
  if (!v) return { ok: false, reason: `VERSION 형식이 잘못됐습니다 (X.Y.Z 숫자만): ${JSON.stringify(String(versionText).slice(0, 40))}` };
  const latest = latestTag(tags);
  if (latest && cmp(v, latest) <= 0) {
    return { ok: false, version: fmt(v), latest: `v${fmt(latest)}`, next: fmt(bump(latest)), reason: `VERSION ${fmt(v)} 이 최신 태그 v${fmt(latest)} 보다 커야 합니다` };
  }
  return { ok: true, version: fmt(v), latest: latest ? `v${fmt(latest)}` : null };
}

const git = (root, args, timeout = 5000) => execFileSync('git', args, { cwd: root, encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'ignore'] });
function tagsOf(root, remote) {
  if (remote) {
    try {
      const out = git(root, ['ls-remote', '--tags', '--refs', 'origin', 'v*'], 3000);
      return { tags: out.split('\n').map((l) => l.split('refs/tags/')[1]).filter(Boolean), source: 'origin' };
    } catch { /* 오프라인·원격 없음 → 로컬 */ }
  }
  try { return { tags: git(root, ['tag', '-l', 'v*']).split('\n').filter(Boolean), source: 'local' }; } catch { return { tags: [], source: 'none' }; }
}
function headVersion(root) {
  try { return git(root, ['show', 'HEAD:VERSION']); } catch { return null; }
}

// ── notes — 버전 릴리스 노트 초안 (2026-11-17, lfmall-ai-toolkit 방식을 이 레포에 맞춤) ──
//   docs/release-notes/<X.Y.Z> <핵심 수정 요약>.md 를 만든다. 기준 커밋(기본: origin/main 과 갈라진 곳)과 HEAD 를 비교해
//   스킬·에이전트(그룹별)·훅·룰·커맨드 수 변화와 커밋 제목을 적는다. 문장은 사람이(또는 Claude 가) 다듬어 커밋한다.
//   release-version-guard(gh pr create)·version-check 워크플로가 노트가 커밋돼 있는지 보고,
//   release-on-main 워크플로가 이 노트를 GitHub Release 본문으로 쓴다.
const RELEASE_BRANCH = 'main';
const NOTES_DIR = 'docs/release-notes';
const MAX_COMMITS = 300;
const TITLE_MAX = 50;
// 요약에서 경로·파일 이름에 위험한 글자(제어 문자·/ \ : * ? " < > | 등)와 대괄호·# % 같은 주소를 깨는 글자는 지우고 50자로. 비면 "수정내용"
function safeTitle(s) {
  const t = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f[\]/\\:*?"<>|#%{}^~`$]/g, ' ').replace(/\.{2,}/g, '.').replace(/\s+/g, ' ').trim().replace(/^[.\-\s]+|[.\s]+$/g, '');
  return [...t].slice(0, TITLE_MAX).join('').trim() || '수정내용';
}
const notesFileName = (version, title = '') => `${version} ${safeTitle(title)}.md`;
// "1.1.6 " 로 시작(1.1.60 과 구분)하고 .md 로 끝나는 이름 하나 (하위 폴더 아님)
const isNotesName = (name, version) => typeof name === 'string' && !name.includes('/') && !name.includes('\\') && name.startsWith(`${version} `) && name.endsWith('.md');

// ref 의 docs/release-notes 에 그 버전 노트(일반 파일 — 링크 제외)가 있으면 파일 이름, 없으면 null (커밋된 것만 본다)
function notesFile(root, version, ref = 'HEAD') {
  if (!parseVersion(String(version))) return null;
  let out;
  try { out = git(root, ['-c', 'core.quotePath=false', 'ls-tree', '-z', `${ref}:${NOTES_DIR}`]); } catch { return null; }
  for (const ent of out.split('\0')) {
    const m = ent.match(/^(\d+) (\w+) [0-9a-f]+\t(.+)$/);
    if (m && m[2] === 'blob' && m[1] !== '120000' && isNotesName(m[3], version)) return m[3];
  }
  return null;
}

// 트리의 파일 목록 → 종류별 이름 (훅 수 기준은 docs-counts.test.js 와 같게: package.json·*.test.js 제외, lib/ 는 훅 아님)
function inventory(files) {
  const skillCat = new Map();
  for (const f of files) { const m = f.match(/^docs\/skills\/([^/]+)\/([^/]+)\/verification\.md$/); if (m) skillCat.set(m[2], m[1]); }
  const inv = { skills: new Map(), agents: new Map(), hooks: new Set(), rules: new Set(), commands: new Set() };
  const add = (map, cat, name) => { if (!map.has(cat)) map.set(cat, new Set()); map.get(cat).add(name); };
  for (const f of files) {
    let m;
    if ((m = f.match(/^\.claude\/skills\/([^/]+)\/SKILL\.md$/))) add(inv.skills, skillCat.get(m[1]) || '기타', m[1]);
    else if ((m = f.match(/^\.claude\/agents\/(?:([^/]+)\/)?([^/]+)\.md$/)) && m[2] !== 'CLAUDE' && m[2] !== 'README') add(inv.agents, m[1] || '최상위', m[2]);
    else if ((m = f.match(/^\.claude\/hooks\/([^/]+)$/)) && m[1] !== 'package.json' && !m[1].endsWith('.test.js')) inv.hooks.add(m[1].replace(/\.js$/, ''));
    else if ((m = f.match(/^\.claude\/rules\/([^/]+\.md)$/))) inv.rules.add(m[1]);
    else if ((m = f.match(/^\.claude\/commands\/([^/]+)\.md$/))) inv.commands.add(`/${m[1]}`);
  }
  return inv;
}
const treeFiles = (root, ref) => git(root, ['-c', 'core.quotePath=false', 'ls-tree', '-r', '--name-only', ref, '--', '.claude', 'docs/skills']).split('\n').filter(Boolean);
const total = (map) => [...map.values()].reduce((s, x) => s + x.size, 0);
// 한 줄 텍스트로 — 제어 문자·줄바꿈 제거, 길이 제한 (커밋 제목이 마크다운 구조를 깨지 않게)
const oneLine = (s, max = 200) => String(s).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

function setDiff(label, before, after) {
  const added = [...after].filter((x) => !before.has(x)).sort();
  const removed = [...before].filter((x) => !after.has(x)).sort();
  const parts = [];
  if (added.length) parts.push(`추가: ${added.map((x) => `\`${x}\``).join('·')}`);
  if (removed.length) parts.push(`삭제: ${removed.map((x) => `\`${x}\``).join('·')}`);
  return `- **${label}:** ${before.size} → ${after.size}${parts.length ? `. ${parts.join(' / ')}` : ''}`;
}
function groupDiff(label, before, after) {
  const lines = [`- **${label}:** ${total(before)} → ${total(after)} (그룹 ${before.size} → ${after.size})`];
  const cats = [...new Set([...before.keys(), ...after.keys()])].sort();
  for (const c of cats) {
    const b = before.get(c) || new Set(), a = after.get(c) || new Set();
    const d = a.size - b.size;
    const note = a.size === 0 ? ' — 그룹 없어짐' : b.size === 0 ? ' — 새 그룹' : '';
    lines.push(`  - ${c}: ${b.size} → ${a.size}${d === 0 ? ' (그대로)' : ` (${d > 0 ? '+' : ''}${d})`}${note}`);
  }
  return lines;
}
// 노트에 안 적는 커밋: 버전만 올린 커밋, 세션 요약 동기화
const SKIP_SUBJECT = [/^\[config\]\s*Modify:\s*버전\s+\d+\.\d+\.\d+$/, /^\[export\]\s*sync:/];

// 초안 만들기 — { ok, message, file?, created?, content? }. write=false 면 파일을 쓰지 않고 내용만
function buildNotes(root, { base = null, write = true, date = new Date(), title = null } = {}) {
  const fail = (message) => ({ ok: false, message });
  let text;
  try { const st = fs.lstatSync(path.join(root, 'VERSION')); if (!st.isFile() || st.size > 64) return fail('VERSION 이 일반 파일이 아니거나 너무 큽니다'); text = fs.readFileSync(path.join(root, 'VERSION'), 'utf8'); } catch { return fail('VERSION 파일이 없습니다'); }
  const v = parseVersion(text);
  if (!v) return fail(`VERSION 형식이 잘못됐습니다: ${JSON.stringify(text.slice(0, 40))}`);
  const version = fmt(v);
  if (base == null) {
    try { base = git(root, ['merge-base', 'HEAD', `refs/remotes/origin/${RELEASE_BRANCH}`]).trim(); } catch { return fail(`기준 커밋을 찾지 못했습니다 (origin/${RELEASE_BRANCH} 없음) — notes --base <커밋> 으로 지정하세요`); }
  }
  // 옵션처럼 보이는 값(-…)·범위(..)·공백은 거부 — git 인자로 넘기기 전에
  if (typeof base !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._/~^-]{0,199}$/.test(base) || base.includes('..')) return fail(`기준 커밋 이름이 올바르지 않습니다: ${JSON.stringify(String(base).slice(0, 40))}`);
  let baseSha, headSha;
  try { baseSha = git(root, ['rev-parse', '--verify', '--quiet', `${base}^{commit}`]).trim(); headSha = git(root, ['rev-parse', 'HEAD']).trim(); } catch { return fail(`기준 커밋 ${base} 를 찾지 못했습니다`); }
  if (baseSha === headSha) return fail(`기준(${baseSha.slice(0, 7)})과 HEAD 가 같아 적을 변경이 없습니다 — 작업 브랜치에서 커밋한 뒤 실행하세요`);
  const dir = path.join(root, NOTES_DIR);
  let onDisk = null;
  try {
    const st = fs.lstatSync(dir);
    if (!st.isDirectory()) return fail(`${NOTES_DIR} 가 폴더가 아닙니다 (링크 등) — 쓰지 않습니다`);
    onDisk = fs.readdirSync(dir).find((n) => isNotesName(n, version)) || null;
  } catch { /* 폴더 없음 — 만든다 */ }
  const existing = onDisk || notesFile(root, version, 'HEAD');
  if (existing) return { ok: true, file: `${NOTES_DIR}/${existing}`, created: false, message: `${version} 노트가 이미 있습니다 — 덮어쓰지 않음: ${NOTES_DIR}/${existing}` };

  const raw = git(root, ['log', '--no-merges', `--max-count=${MAX_COMMITS}`, '--format=%s%x1e', `${baseSha}..${headSha}`]);
  const subjects = raw.split('\x1e').map((x) => oneLine(x)).filter(Boolean);
  const groups = new Map();
  for (const s of subjects.slice().reverse()) { // 오래된 커밋부터
    if (SKIP_SUBJECT.some((re) => re.test(s))) continue;
    const m = s.match(/^\[([a-z]+)\]\s*(.*)$/);
    const cat = m ? m[1] : '기타';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(m ? m[2] : s);
  }
  const b = inventory(treeFiles(root, baseSha)), a = inventory(treeFiles(root, headSha));
  const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  // 요약을 안 주면 가장 오래된 커밋 제목(분류·Type 뗀 것)을 임시로 — 다듬을 때 파일 이름도 바꾼다
  const firstSubject = [...groups.values()].flat()[0] || '';
  const name = notesFileName(version, title != null && String(title).trim() ? title : firstSubject.replace(/^[A-Za-z]+:\s*/, ''));
  const out = [`# ${name.replace(/\.md$/, '')}`, '', `날짜: ${day} · 기준: \`${baseSha.slice(0, 7)}\` → \`${headSha.slice(0, 7)}\``, '', '## 수 변화', '',
    ...groupDiff('스킬', b.skills, a.skills), ...groupDiff('에이전트', b.agents, a.agents),
    setDiff('훅', b.hooks, a.hooks), setDiff('룰', b.rules, a.rules), setDiff('커맨드', b.commands, a.commands), '', '## 큰 수정 내용', '',
    '<!-- 초안: 커밋 제목을 모았습니다. 읽는 사람이 알 수 있는 문장으로 다듬은 뒤 이 줄을 지우세요 -->'];
  for (const [cat, list] of [...groups.entries()].sort()) { for (const s of list) out.push(`- [${cat}] ${s}`); }
  if (!groups.size) out.push('- (버전 올림 외 커밋 없음)');
  if (subjects.length >= MAX_COMMITS) out.push('', `> 커밋이 ${MAX_COMMITS}개를 넘어 최근 ${MAX_COMMITS}개만 적었습니다.`);
  const content = `${out.join('\n')}\n`;
  if (!write) return { ok: true, file: `${NOTES_DIR}/${name}`, created: false, content, message: content };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), content, { flag: 'wx' }); // 이미 있으면 실패 (덮어쓰지 않음)
  return { ok: true, file: `${NOTES_DIR}/${name}`, created: true, content, message: `${version} 릴리스 노트 초안을 만들었습니다: ${NOTES_DIR}/${name} — 문장을 다듬어 커밋하세요` };
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const [cmd, ...rest] = process.argv.slice(2);
  const remote = rest.includes('--remote');
  const die = (m) => { console.error(`[release-version] ${m}`); process.exit(1); };
  if (cmd === 'check') {
    const head = headVersion(root);
    if (head == null) die('커밋된 VERSION 파일이 없습니다');
    const { tags, source } = tagsOf(root, remote);
    const r = checkVersion(head, tags);
    if (!r.ok) die(`${r.reason}${r.next ? ` — node scripts/release-version.js bump 로 ${r.next} 로 올리고 커밋하세요` : ''} (태그: ${source})`);
    console.log(`VERSION ${r.version} > 최신 태그 ${r.latest || '없음'} (태그: ${source})`);
  } else if (cmd === 'bump') {
    const kind = rest.find((a) => !a.startsWith('--')) || 'patch';
    const file = path.join(root, 'VERSION');
    let cur = null;
    try { const st = fs.lstatSync(file); if (st.isFile() && st.size <= 64) cur = parseVersion(fs.readFileSync(file, 'utf8')); } catch { /* 없음 */ }
    const latest = latestTag(tagsOf(root, remote).tags);
    const baseV = [cur, latest].filter(Boolean).sort(cmp).pop() || [0, 0, 0];
    let next;
    try { next = bump(baseV, kind); } catch (e) { die(e.message); }
    // 이어서 릴리스 노트 초안 (실패해도 bump 는 성공 — 안내만). 이미 있으면 덮어쓰지 않는다
    const notesAfter = () => {
      if (rest.includes('--no-notes')) return;
      let n;
      try { n = buildNotes(root); } catch (e) { n = { ok: false, message: e.message }; }
      console.log(n.ok ? n.message : `릴리스 노트는 만들지 못했습니다: ${n.message}`);
    };
    // 이미 VERSION 이 태그보다 크면(이번 PR 에서 올림) 그대로 둔다 — 노트가 빠졌으면 만든다
    if (cur && (!latest || cmp(cur, latest) > 0)) { console.log(`VERSION ${fmt(cur)} — 이미 최신 태그보다 큽니다 (그대로 둠)`); notesAfter(); process.exit(0); }
    fs.writeFileSync(file, `${fmt(next)}\n`);
    console.log(`VERSION ${cur ? fmt(cur) : '없음'} → ${fmt(next)}`);
    notesAfter();
  } else if (cmd === 'notes') {
    const opt = (flag, what) => {
      const i = rest.indexOf(flag);
      if (i < 0) return null;
      const val = rest[i + 1];
      if (!val || val.startsWith('--')) die(`${flag} 뒤에 ${what}을 적으세요`);
      return val;
    };
    const base = opt('--base', '커밋');
    const title = opt('--title', '핵심 수정 요약');
    const r = buildNotes(root, { base, title, write: !rest.includes('--print') });
    if (!r.ok) die(r.message);
    console.log(r.message);
  } else if (cmd === 'notes-check' || cmd === 'notes-path') {
    const head = headVersion(root);
    const v = head == null ? null : parseVersion(head);
    if (!v) die('커밋된 VERSION 이 없거나 형식이 잘못됐습니다');
    const name = notesFile(root, fmt(v), 'HEAD');
    if (cmd === 'notes-path') { console.log(name ? `${NOTES_DIR}/${name}` : ''); process.exit(0); }
    if (!name) die(`${fmt(v)} 릴리스 노트가 커밋돼 있지 않습니다 — node scripts/release-version.js notes --title "핵심 수정 요약" 으로 초안을 만들어 다듬은 뒤 커밋하세요 (${NOTES_DIR}/${fmt(v)} <요약>.md)`);
    console.log(`${fmt(v)} 릴리스 노트: ${NOTES_DIR}/${name}`);
  } else if (cmd === 'release-tag') {
    let text;
    try { const st = fs.lstatSync(path.join(root, 'VERSION')); if (!st.isFile() || st.size > 64) die('VERSION 이 일반 파일이 아니거나 너무 큽니다'); text = fs.readFileSync(path.join(root, 'VERSION'), 'utf8'); } catch (e) { die(`VERSION 을 읽지 못했습니다: ${e.message}`); }
    const v = parseVersion(text);
    if (!v) die(`VERSION 형식이 잘못됐습니다: ${JSON.stringify(text.slice(0, 40))}`);
    console.log(`v${fmt(v)}`);
  } else if (cmd === 'latest') {
    const l = latestTag(tagsOf(root, remote).tags);
    console.log(l ? `v${fmt(l)}` : '');
  } else {
    die('사용: check [--remote] | bump [patch|minor|major] [--remote] [--no-notes] | notes [--title <요약>] [--base <커밋>] [--print] | notes-check | notes-path | release-tag | latest [--remote]');
  }
}

module.exports = { parseVersion, parseTag, latestTag, bump, checkVersion, cmp, fmt, tagsOf, headVersion, safeTitle, notesFileName, isNotesName, notesFile, inventory, buildNotes, NOTES_DIR, RELEASE_BRANCH };
