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
    // 이미 VERSION 이 태그보다 크면(이번 PR 에서 올림) 그대로 둔다
    if (cur && (!latest || cmp(cur, latest) > 0)) { console.log(`VERSION ${fmt(cur)} — 이미 최신 태그보다 큽니다 (그대로 둠)`); process.exit(0); }
    fs.writeFileSync(file, `${fmt(next)}\n`);
    console.log(`VERSION ${cur ? fmt(cur) : '없음'} → ${fmt(next)}`);
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
    die('사용: check [--remote] | bump [patch|minor|major] [--remote] | release-tag | latest [--remote]');
  }
}

module.exports = { parseVersion, parseTag, latestTag, bump, checkVersion, cmp, fmt, tagsOf, headVersion };
