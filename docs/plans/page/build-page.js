// 계획서 md + 체크리스트 md → 아티팩트 HTML 한 장
// 사용: node build-page.js <계획서.md> <체크리스트.md> <출력.html>
const fs = require('fs');
const path = require('path');
const S = __dirname;
const [, , planPath, clPath, outPath] = process.argv;
if (!planPath || !clPath || !outPath) { console.error('사용: node build-page.js <계획서.md> <체크리스트.md> <출력.html>'); process.exit(1); }
// CRLF(윈도우 autocrlf 체크아웃)는 LF 로 — parse-checklist 가 LF 로 바꾼 뒤 준 relIdx 로 이 문자열을 자르므로 같은 기준이어야 한다
const plan = fs.readFileSync(planPath, 'utf8').replace(/\r\n?/g, '\n');
const cl = fs.readFileSync(clPath, 'utf8').replace(/\r\n?/g, '\n');

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
// 항목 읽기는 parse-checklist.js 공용 (manifest 생성기와 같은 규칙)
const { sections, items, relIdx } = require('./parse-checklist').parseChecklist(cl);
const relMd = cl.slice(relIdx).replace(/^## 7\./m, `## ${base + 1}.`).replace(/^## 8\./m, `## ${base + 2}.`).replace(/^### ([A-E])\./gm, `### ${base + 2}.$1`);
const count = items.length;

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
