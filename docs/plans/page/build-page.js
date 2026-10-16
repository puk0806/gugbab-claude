// 계획서 md + 체크리스트 md → 아티팩트 HTML 한 장
// 사용: node build-page.js <계획서.md> <체크리스트.md> <출력.html>
const fs = require('fs');
const path = require('path');
const S = __dirname;
const [, , planPath, clPath, outPath] = process.argv;
if (!planPath || !clPath || !outPath) { console.error('사용: node build-page.js <계획서.md> <체크리스트.md> <출력.html>'); process.exit(1); }
const plan = fs.readFileSync(planPath, 'utf8');
const cl = fs.readFileSync(clPath, 'utf8');

// 체크리스트 7·8장(요약·연관 처리)은 계획서 탭에 문서로 붙인다
// 계획서의 마지막 장 번호(N) 다음인 N+1·N+2 장으로 번호를 바꿔 붙인다 — 계획서에 장이 늘어도 겹치지 않게.
// 코드 블록 안의 제목과 4자리를 넘는 번호는 세지 않는다. 7장이 없으면 붙일 것도 없다
function lastChapter(md) {
  let n = 0, fence = false;
  for (const line of md.split('\n')) {
    if (/^(```|~~~)/.test(line)) { fence = !fence; continue; }
    const m = !fence && /^## (\d{1,4})\. /.exec(line);
    if (m) n = Math.max(n, +m[1]);
  }
  return n;
}
const base = lastChapter(plan);
const m7 = /^## 7\. /m.exec(cl);
const relIdx = m7 ? m7.index : cl.length;
const relMd = cl.slice(relIdx).replace(/^## 7\./m, `## ${base + 1}.`).replace(/^## 8\./m, `## ${base + 2}.`).replace(/^### ([A-E])\./gm, `### ${base + 2}.$1`);

const TYPE = { 1: 'setting', 2: 'hook', 3: 'rule', 4: 'command', 5: 'agent', 6: 'skill' };
const sections = []; // {no, title, type, groups:[{title, items:[]}]}
let sec = null, grp = null, last = null;
for (const raw of cl.slice(0, relIdx).split('\n')) {
  let m;
  if ((m = raw.match(/^## (\d)\. (.+)$/))) {
    sec = { no: +m[1], title: m[2], type: TYPE[m[1]], groups: [] }; sections.push(sec);
    grp = { title: '', items: [] }; sec.groups.push(grp); last = null; continue;
  }
  if (!sec) continue;
  if ((m = raw.match(/^### [\d.]+ (.+)$/))) { grp = { title: m[1], items: [] }; sec.groups.push(grp); last = null; continue; }
  if ((m = raw.match(/^- \[[ x]\] \*\*묶음 전체 기본 켬\*\*/))) continue;
  // 일반 항목: - [x] **name** (기본 켬 …) — desc
  if ((m = raw.match(/^- \[( |x)\] \*\*(.+?)\*\*(?: \(([^)]*)\))?(?: \(신규\))? — (.*)$/))) {
    const note = m[3] || '';
    const rec = m[1] === 'x' ? 'lock' : /기본 켬/.test(note) ? 'on' : 'off';
    const extra = note.replace(/^기본 [켬끔]\s*·?\s*/, '').replace(/\*\*/g, '');
    last = { id: sec.type + ':' + m[2].replace(/^\//, ''), name: m[2], rec, note: extra, desc: m[4], rel: [], projHint: null };
    grp.items.push(last); continue;
  }
  // 스킬: - [ ] `name` — desc · 쓰는 에이전트: …
  if ((m = raw.match(/^ {2}- \[( |x)\] `(.+?)` — (.*)$/))) {
    let desc = m[3], rel = [];
    const k = desc.indexOf(' · 쓰는 에이전트: ');
    if (k >= 0) { rel.push(desc.slice(k + 3)); desc = desc.slice(0, k); }
    last = { id: 'skill:' + m[2], name: m[2], rec: m[1] === 'x' ? 'on' : 'off', note: '', desc, rel, projHint: null };
    grp.items.push(last); continue;
  }
  // 항목 아래 상세 줄: 일반 항목은 2칸, 스킬은 4칸 들여쓰기. 그보다 깊거나 항목 앞에 나온 줄은 무시
  // "프로젝트 추천: 끔" (정확히 이 문구만) → 다른 프로젝트에서는 끄기를 추천하는 항목(하네스 제작·README 용). 상세 줄에는 넣지 않는다
  if ((m = raw.match(/^ {2}(?: {2})?- (.+)$/)) && last) {
    if (m[1].trim() === '프로젝트 추천: 끔') { last.projHint = 'off'; continue; }
    last.rel.push(m[1]); continue;
  }
}
for (const s of sections) s.groups = s.groups.filter(g => g.items.length);
const count = sections.reduce((n, s) => n + s.groups.reduce((a, g) => a + g.items.length, 0), 0);

const tpl = fs.readFileSync(path.join(S, 'page-template.html'), 'utf8');
const safe = s => s.replace(/<\/script/gi, '<\\/script');
const out = tpl
  // 치환 문자열의 $' $& 등이 해석되지 않도록 함수 치환 사용
  .replace('/*__ITEMS__*/null', () => safe(JSON.stringify(sections)))
  .replace('__PLAN_MD__', () => safe(plan + '\n\n---\n\n' + relMd))
  .replace(/__COUNT__/g, () => String(count))
  // 부제의 최종 수정일은 계획서 머리말 "최종 수정: YYYY-MM-DD" 에서 가져온다 (없으면 표시 안 함)
  .replace('__UPDATED__', () => { const d = /최종 수정:\s*(\d{4}-\d{2}-\d{2})/.exec(plan); return d ? d[1] : '-'; });
fs.writeFileSync(outPath, out);
console.log('items', count, 'sections', sections.map(s => s.type + ':' + s.groups.reduce((a, g) => a + g.items.length, 0)).join(' '), 'bytes', out.length);
