// 체크리스트 md → 장(section)·그룹·항목 목록. build-page.js(페이지)와 scripts/build-manifest.js(manifest)가 함께 쓴다
// 항목 상태: 체크 = lock(고정), `(기본 켬)` = on, 그 밖 = off. 스킬 줄은 체크 = on
// 7장(고정 목록 요약)부터는 문서라 항목으로 읽지 않는다
const TYPE = { 1: 'setting', 2: 'hook', 3: 'rule', 4: 'command', 5: 'agent', 6: 'skill' };

// 이름은 manifest 에서 파일 경로를 만드는 재료다 — 경로를 벗어나는 글자는 받지 않는다
function checkName(name) {
  const body = name.replace(/^\//, '');
  if (!body || body.includes('..') || /[\\/\0]/.test(body)) throw new Error(`허용되지 않는 이름: ${name}`);
}

function parseChecklist(md) {
  if (typeof md !== 'string') throw new TypeError('체크리스트 md 는 문자열이어야 합니다');
  md = md.replace(/\r\n?/g, '\n'); // CRLF(윈도우 autocrlf 체크아웃)면 항목이 0개로 읽히던 문제
  const m7 = /^## 7\. /m.exec(md);
  const relIdx = m7 ? m7.index : md.length;
  const sections = [];
  const seen = new Set();
  let sec = null, grp = null, last = null;
  const add = (item) => {
    if (seen.has(item.id)) throw new Error(`중복 항목: ${item.id}`);
    seen.add(item.id);
    grp.items.push(item);
    last = item;
  };
  for (const raw of md.slice(0, relIdx).split('\n')) {
    let m;
    if ((m = raw.match(/^## (\d)\. (.+)$/))) {
      sec = { no: +m[1], title: m[2], type: TYPE[m[1]], groups: [] }; sections.push(sec);
      grp = { title: '', items: [] }; sec.groups.push(grp); last = null; continue;
    }
    if (!sec || !sec.type) continue;
    if ((m = raw.match(/^### [\d.]+ (.+)$/))) { grp = { title: m[1], items: [] }; sec.groups.push(grp); last = null; continue; }
    if (/^- \[[ x]\] \*\*묶음 전체 기본 켬\*\*/.test(raw)) continue;
    // 일반 항목: - [x] **name** (기본 켬 …) (신규) — desc
    if ((m = raw.match(/^- \[( |x)\] \*\*(.+?)\*\*(?: \(([^)]*)\))?(?: \(신규\))? — (.*)$/))) {
      checkName(m[2]);
      const note = m[3] || '';
      const rec = m[1] === 'x' ? 'lock' : /기본 켬/.test(note) ? 'on' : 'off';
      const extra = note.replace(/^기본 [켬끔]\s*·?\s*/, '').replace(/\*\*/g, '');
      add({ id: sec.type + ':' + m[2].replace(/^\//, ''), type: sec.type, name: m[2], rec, note: extra, desc: m[4], rel: [], projHint: null });
      continue;
    }
    // 스킬: - [ ] `name` — desc · 쓰는 에이전트: …
    if ((m = raw.match(/^ {2}- \[( |x)\] `(.+?)` — (.*)$/))) {
      checkName(m[2]);
      let desc = m[3]; const rel = [];
      const k = desc.indexOf(' · 쓰는 에이전트: ');
      if (k >= 0) { rel.push(desc.slice(k + 3)); desc = desc.slice(0, k); }
      add({ id: 'skill:' + m[2], type: 'skill', name: m[2], rec: m[1] === 'x' ? 'on' : 'off', note: '', desc, rel, projHint: null });
      continue;
    }
    // 항목 아래 상세 줄(일반 2칸, 스킬 4칸). "프로젝트 추천: 끔" 은 상세가 아니라 표시
    if ((m = raw.match(/^ {2}(?: {2})?- (.+)$/)) && last) {
      if (m[1].trim() === '프로젝트 추천: 끔') { last.projHint = 'off'; continue; }
      last.rel.push(m[1]);
    }
  }
  for (const s of sections) s.groups = s.groups.filter(g => g.items.length);
  const items = sections.flatMap(s => s.groups.flatMap(g => g.items));
  return { sections, items, relIdx };
}

module.exports = { parseChecklist, TYPE };
