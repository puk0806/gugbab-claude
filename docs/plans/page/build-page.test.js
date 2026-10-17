// build-page.js 테스트 — node --test docs/plans/page/build-page.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT = path.join(__dirname, 'build-page.js');

function tmpdir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'build-page-')); }
function run(args) { return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' }); }

const CHECKLIST = [
  '# 체크리스트',
  '## 2. 훅 (2종)',
  '### 2.1 안전',
  '- [x] **bash-guard** — 위험 명령 차단',
  '  - 연관: protect-secrets',
  '- [ ] **cc-notify** (기본 켬) — 완료 알림',
  '## 6. 스킬 (1종)',
  '### 6.1 프론트엔드 — 1종',
  '- [ ] **묶음 전체 기본 켬**',
  '  - [ ] `nextjs` — Next.js 패턴 · 쓰는 에이전트: frontend-developer',
  '## 7. 추천 고정 목록 요약',
  '요약 본문',
  '## 8. 연관된 항목 처리 방법',
  '### A. 짝 묶음',
  '본문',
].join('\n');

function build(planText, checklistText) {
  const d = tmpdir();
  const plan = path.join(d, 'plan.md'), cl = path.join(d, 'cl.md'), out = path.join(d, 'out.html');
  fs.writeFileSync(plan, planText);
  fs.writeFileSync(cl, checklistText);
  const r = run([plan, cl, out]);
  return { r, out, html: fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null };
}

function sectionsOf(html) {
  const m = html.match(/const SECTIONS = (\[.*?\]);\n/s);
  assert.ok(m, 'SECTIONS JSON 이 페이지에 있어야 한다');
  return JSON.parse(m[1]);
}

test('정상: 계획서·체크리스트로 페이지를 만들고 항목 상태·연관을 파싱한다', () => {
  const { r, html } = build('# 계획서\n\n## 12. 앞 장\n\n## 13. 결정\n\n본문', CHECKLIST);
  assert.strictEqual(r.status, 0, r.stderr);
  const s = sectionsOf(html);
  const items = s.flatMap(x => x.groups.flatMap(g => g.items.map(i => ({ ...i, type: x.type }))));
  assert.deepStrictEqual(items.map(i => [i.id, i.rec]), [['hook:bash-guard', 'lock'], ['hook:cc-notify', 'on'], ['skill:nextjs', 'off']]);
  assert.deepStrictEqual(items[0].rel, ['연관: protect-secrets']);
  assert.deepStrictEqual(items[2].rel, ['쓰는 에이전트: frontend-developer']);
  assert.ok(html.includes('## 14. 추천 고정 목록 요약'), '7장이 14장으로 붙어야 한다');
  assert.ok(html.includes('### 15.A 짝 묶음'), '8장 하위 절도 15장 번호로 바뀌어야 한다');
  assert.ok(!html.includes('__COUNT__') && !html.includes('__PLAN_MD__'), '자리표시자가 남으면 안 된다');
});

test('정상: 체크리스트 7·8장은 계획서의 마지막 장 번호 다음부터 이어 붙는다 (계획서에 장이 늘어도 번호가 겹치지 않음)', () => {
  const { r, html } = build('# 계획서\n\n## 13. 결정\n\n## 14. 검토안\n\n### 14.1 조사\n\n## 문서 갱신 방법', CHECKLIST);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(html.includes('## 15. 추천 고정 목록 요약'), '7장이 15장으로 붙어야 한다');
  assert.ok(html.includes('## 16. 연관된 항목 처리 방법'));
  assert.ok(html.includes('### 16.A 짝 묶음'));
  assert.ok(!html.includes('## 14. 추천 고정 목록 요약'), '계획서 14장과 번호가 겹치면 안 된다');
});

test('경계: 계획서에 번호 붙은 장이 없으면 1·2장으로 붙이고, 코드 블록 안의 "## 99." 줄은 장 번호로 세지 않는다', () => {
  const none = build('# p\n\n본문', CHECKLIST);
  assert.ok(none.html.includes('## 1. 추천 고정 목록 요약') && none.html.includes('### 2.A 짝 묶음'));
  const fenced = build('# p\n\n## 3. 장\n\n```md\n## 99. 예시 제목\n```\n', CHECKLIST);
  assert.ok(fenced.html.includes('## 4. 추천 고정 목록 요약'), '코드 블록 안 제목은 무시해야 한다');
  assert.ok(!fenced.html.includes('## 100.'));
});

test('악성·경계: 장 번호가 비정상적으로 크거나(자릿수 폭탄) 들여쓴 제목이어도 깨지지 않는다', () => {
  const huge = build('# p\n\n## 99999999999999999999. 큰 번호\n\n   ## 50. 들여쓴 제목\n\n## 5. 정상', CHECKLIST);
  assert.strictEqual(huge.r.status, 0, huge.r.stderr);
  assert.ok(huge.html.includes('## 6. 추천 고정 목록 요약'), '4자리를 넘는 번호와 들여쓴 줄은 장 번호로 세지 않는다');
});

test('악성: 계획서 본문의 </script> 로 스크립트 주입을 시도해도 블록을 탈출하지 못한다', () => {
  const evil = '# 계획서\n</script><script>alert(1)</script>\n';
  const { r, html } = build(evil, CHECKLIST);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(!html.includes('</script><script>alert(1)'), '원문 </script> 가 그대로 들어가면 안 된다');
  assert.ok(html.includes('<\\/script><script>alert(1)<\\/script>'), '이스케이프된 형태로 보존돼야 한다');
});

test('악성: 체크리스트 설명의 </script> 도 JSON 안에서 이스케이프된다', () => {
  const evil = CHECKLIST.replace('위험 명령 차단', '설명 </script><img src=x onerror=alert(1)>');
  const { r, html } = build('# p', evil);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(!/<\/script><img/i.test(html), '체크리스트 설명이 스크립트 블록을 닫으면 안 된다');
  const s = sectionsOf(html);
  assert.strictEqual(s[0].groups[0].items[0].desc, '설명 </script><img src=x onerror=alert(1)>', 'JSON 파싱 후엔 원문 그대로 (화면에는 textContent 로만 출력)');
});

test('경계: 치환 패턴($\' $& $$)이 들어간 계획서도 글자 그대로 들어간다', () => {
  const text = "# p\nprintf $'\\n' 와 $& 와 $$ 와 $1";
  const { r, html } = build(text, CHECKLIST);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(html.includes("printf $'\\n' 와 $& 와 $$ 와 $1"));
});

test('경계: 항목이 하나도 없는 체크리스트도 깨지지 않고 0개로 만든다', () => {
  const { r, html } = build('# p', '## 7. 추천 고정 목록 요약\n없음');
  assert.strictEqual(r.status, 0, r.stderr);
  assert.deepStrictEqual(sectionsOf(html), []);
  assert.ok(html.includes('<span class="n">0</span>'));
});

test('경계: 형식이 깨진 줄(굵게 없음·체크박스 없음)은 항목으로 잡지 않는다', () => {
  const broken = CHECKLIST.replace('- [ ] **cc-notify** (기본 켬) — 완료 알림', '- [ ] cc-notify 완료 알림\n- **x** — 체크박스 없음');
  const { r, html } = build('# p', broken);
  assert.strictEqual(r.status, 0, r.stderr);
  const ids = sectionsOf(html).flatMap(x => x.groups.flatMap(g => g.items.map(i => i.id)));
  assert.deepStrictEqual(ids, ['hook:bash-guard', 'skill:nextjs']);
});

test('경계: 7장이 없는 체크리스트는 항목만 만들고 계획서에 아무것도 덧붙이지 않는다', () => {
  const noSummary = CHECKLIST.slice(0, CHECKLIST.indexOf('## 7.'));
  const { r, html } = build('# p', noSummary);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(!html.includes('## 14.'));
  const ids = sectionsOf(html).flatMap(x => x.groups.flatMap(g => g.items.map(i => i.id)));
  assert.deepStrictEqual(ids, ['hook:bash-guard', 'hook:cc-notify', 'skill:nextjs']);
});

test('정상·경계: 부제의 최종 수정일은 계획서 머리말에서 가져오고, 없거나 형식이 틀리면 - 로 표시한다', () => {
  const ok = build('# p\n> 최종 수정: 2026-10-15 · 상태: 확정', CHECKLIST);
  assert.ok(ok.html.includes('최종 수정 2026-10-15'));
  const none = build('# p\n> 작성일: 2026-10-15', CHECKLIST);
  assert.ok(none.html.includes('최종 수정 -'));
  const bad = build('# p\n> 최종 수정: 어제<script>', CHECKLIST);
  assert.ok(bad.html.includes('최종 수정 -'), '날짜 형식이 아니면 본문 글자를 부제에 넣지 않는다');
  assert.ok(!bad.html.includes('__UPDATED__'));
});

test('정상: 스킬 아래 4칸 들여쓴 설명 줄(담은 내용·이럴 때·쓰는 에이전트)도 그 스킬의 상세로 붙는다', () => {
  const cl = CHECKLIST.replace('  - [ ] `nextjs` — Next.js 패턴 · 쓰는 에이전트: frontend-developer',
    '  - [ ] `nextjs` — Next.js 참고서\n    - 담은 내용: App Router\n    - 쓰는 에이전트: frontend-developer');
  const { r, html } = build('# p', cl);
  assert.strictEqual(r.status, 0, r.stderr);
  const skill = sectionsOf(html).find(x => x.type === 'skill').groups[0].items[0];
  assert.strictEqual(skill.desc, 'Next.js 참고서');
  assert.deepStrictEqual(skill.rel, ['담은 내용: App Router', '쓰는 에이전트: frontend-developer']);
});

test('경계: 5칸 이상 들여쓴 줄이나 항목 앞에 나온 설명 줄은 상세로 잡지 않는다', () => {
  const cl = CHECKLIST.replace('### 2.1 안전\n', '### 2.1 안전\n  - 앞에 붙은 고아 줄\n')
    .replace('  - 연관: protect-secrets', '  - 연관: protect-secrets\n      - 너무 깊은 줄');
  const { r, html } = build('# p', cl);
  assert.strictEqual(r.status, 0, r.stderr);
  const hook = sectionsOf(html).find(x => x.type === 'hook').groups[0].items[0];
  assert.deepStrictEqual(hook.rel, ['연관: protect-secrets']);
});

test('정상: "프로젝트 추천: 끔" 줄은 항목의 projHint 로 잡히고 상세 줄에는 들어가지 않는다 (없으면 null)', () => {
  const cl = CHECKLIST.replace('  - 연관: protect-secrets', '  - 프로젝트 추천: 끔\n  - 연관: protect-secrets');
  const { r, html } = build('# p', cl);
  assert.strictEqual(r.status, 0, r.stderr);
  const items = sectionsOf(html).flatMap(x => x.groups.flatMap(g => g.items));
  assert.strictEqual(items[0].projHint, 'off');
  assert.deepStrictEqual(items[0].rel, ['연관: protect-secrets']);
  assert.strictEqual(items[1].projHint, null);
});

test('악성·경계: "프로젝트 추천:" 값이 정해진 문구가 아니면 인정하지 않고 일반 상세 줄로 남긴다', () => {
  const cl = CHECKLIST.replace('  - 연관: protect-secrets', '  - 프로젝트 추천: 끔"><script>x</script>\n  - 프로젝트 추천: 고정');
  const { r, html } = build('# p', cl);
  assert.strictEqual(r.status, 0, r.stderr);
  const it0 = sectionsOf(html).flatMap(x => x.groups.flatMap(g => g.items))[0];
  assert.strictEqual(it0.projHint, null);
  assert.ok(it0.rel.includes('프로젝트 추천: 끔"><script>x</script>'));
  assert.ok(it0.rel.includes('프로젝트 추천: 고정'));
  assert.ok(!html.includes('<script>x</script>'), '스크립트 태그는 이스케이프돼야 한다');
});

test('경계: 항목 괄호 안 표시의 마크다운 굵게(**)는 지우고 글자만 남긴다', () => {
  const cl = CHECKLIST.replace('**cc-notify** (기본 켬)', '**cc-notify** (기본 끔 · **폐지 추천**)');
  const { r, html } = build('# p', cl);
  assert.strictEqual(r.status, 0, r.stderr);
  const it = sectionsOf(html).flatMap(x => x.groups.flatMap(g => g.items)).find(i => i.id === 'hook:cc-notify');
  assert.strictEqual(it.note, '폐지 추천');
  assert.strictEqual(it.rec, 'off');
});

test('에러: 인자가 없으면 사용법을 알리고 실패하며 파일을 만들지 않는다', () => {
  const r = run([]);
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /사용:/);
});

test('에러: 입력 파일이 없으면 0이 아닌 코드로 끝나고 출력 파일을 만들지 않는다', () => {
  const d = tmpdir();
  const out = path.join(d, 'out.html');
  const r = run([path.join(d, 'nope.md'), path.join(d, 'nope2.md'), out]);
  assert.notStrictEqual(r.status, 0);
  assert.ok(!fs.existsSync(out));
});
