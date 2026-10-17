// 인벤토리 JSON (+ 쉬운 설명 JSON) → 체크리스트 md 의 에이전트·스킬 장 생성
// 사용: node gen-md.js <inv.json> <checklist-head.md> <출력.md> [descriptions.json] [defaults.json]
//   descriptions.json: { "agent:이름" | "skill:이름": { summary, what, when, example, note } }
//   설명이 없거나 형식이 틀린 항목은 원본 frontmatter 설명으로 대신 쓴다 (항목을 빠뜨리지 않음)
//   defaults.json: { "agent:이름": "lock"|"on"|"off", "skill:이름": "on"|"off" } — 체크리스트 페이지에서 고른 기본값.
//   없는 항목·틀린 값은 무시하고 아래 코드의 기본값을 쓴다
const fs = require('fs');
const [, , invPath, headPath, outPath, descPath, defPath] = process.argv;
if (!invPath || !headPath || !outPath) { console.error('사용: node gen-md.js <inv.json> <checklist-head.md> <출력.md> [descriptions.json] [defaults.json]'); process.exit(1); }
const j = JSON.parse(fs.readFileSync(invPath, 'utf8'));
const DESC = descPath ? JSON.parse(fs.readFileSync(descPath, 'utf8')) : {};
const DEF = defPath ? JSON.parse(fs.readFileSync(defPath, 'utf8')) : {};
if (!DEF || typeof DEF !== 'object' || Array.isArray(DEF)) { console.error('defaults.json 은 { "agent:이름": "on" } 형태의 객체여야 합니다'); process.exit(1); }
// 페이지에서 고른 값. 에이전트는 lock·on·off, 스킬은 on·off 만 인정 (자기 키만 읽어 프로토타입 값은 보지 않음)
function defOf(id) {
  if (!Object.prototype.hasOwnProperty.call(DEF, id)) return null;
  const v = DEF[id];
  const ok = id.startsWith('skill:') ? ['on', 'off'] : ['lock', 'on', 'off'];
  return ok.includes(v) ? v : null;
}
const head = fs.readFileSync(headPath, 'utf8');
const tailIdx = head.indexOf('<!--TAIL-->');
if (tailIdx < 0) { console.error('checklist-head.md 에 <!--TAIL--> 표시가 없습니다'); process.exit(1); }

// md 구조를 깨지 않게 한 줄 문자열로 (줄바꿈으로 가짜 항목·장 제목을 끼워 넣는 것 방지). 문자열이 아니면 빈 값
const one = v => (typeof v === 'string' ? v.replace(/\s*[\r\n]+\s*/g, ' ').trim() : '');
function descOf(id) {
  const d = DESC[id];
  if (!d || typeof d !== 'object' || Array.isArray(d)) return null;
  const o = { summary: one(d.summary), what: one(d.what), when: one(d.when), example: one(d.example), note: one(d.note) };
  return o.summary ? o : null;
}
const clip = (s, n) => (s.length >= n ? s + '…' : s);

// 스킬 카테고리 → 모듈 제안 (기존 설치 템플릿 기준 이름)
const CAT = {
  frontend: '프론트엔드 (React·Next.js·PWA·SEO 일부 포함)',
  backend: '백엔드 (Java·Rust·Python·TS)',
  architecture: '아키텍처·도메인 모델링',
  devops: '배포·CI/CD·n8n·Vercel',
  game: 'Unity 게임',
  humanities: '인문 (꿈 해몽·사주·타로·애착 이론 등 앱 도메인 지식)',
  health: '건강·식단 앱',
  meta: '메타 (Claude Code·프롬프트 엔지니어링)',
  writing: '글쓰기·콘텐츠 품질',
  spec: '레거시 스펙 추출',
  nexacro: '넥사크로 마이그레이션',
};

// 스킬 → 이 스킬을 본문에서 참조하는 에이전트 (역참조)
const usedBy = {};
for (const a of j.agents) for (const s of a.skills || []) (usedBy[s] = usedBy[s] || []).push(a.n);

const agents = j.agents.filter(a => a.n !== 'CLAUDE');
let md = '';
md += `\n---\n\n## 5. 에이전트 (${agents.length}종)\n\n`;
md += '> 에이전트 = 특정 일을 맡겨 따로 돌리는 전문 일꾼. Claude 가 필요할 때 불러서 일을 넘기고 결과만 받는다.\n';
md += '> 체크 = 🔒 고정. 체크 안 함 = `/harness` 에서 켜고 끌 수 있음. `(기본 켬/끔)` 은 처음 설치했을 때 상태.\n';
md += '> **쓰는 스킬** / **연결 에이전트** = 에이전트 본문에 이름이 나오는 스킬·에이전트를 자동으로 찾은 것. 실제로 의존하는 것(예: java-backend-developer → mybatis-mapper-patterns)도 있고 예시로만 언급된 것(예: freshness-auditor → axum)도 섞여 있어서, manifest 로 옮길 때 한 번 걸러야 한다 (8장 B).\n\n';
const byCat = {};
for (const a of agents) (byCat[a.c] = byCat[a.c] || []).push(a);
const ACAT = { meta: '메타 (생성·검증·관리)', research: '리서치', validation: '검증·감사', frontend: '프론트엔드', backend: '백엔드', domain: '도메인·기획·설계', devops: '배포', game: '게임', health: '건강' };
const LOCK_AGENTS = new Set(['claude-code-guide', 'web-searcher', 'fact-checker', 'source-validator']);
// 스택·도메인과 무관하게 어디서나 쓰는 범용 에이전트만 기본 켬. 스택·앱 도메인 전용은 모듈로 켬, 하네스 개발용은 harness-authoring
const DEFAULT_ON = new Set(['changelog-writer', 'project-scaffolder', 'tech-stack-advisor', 'deep-researcher', 'research-reviewer',
  'socratic-interviewer', 'competitor-analyst', 'data-analyst', 'pr-reviewer', 'qa-engineer', 'security-auditor', 'build-error-resolver',
  'api-spec-designer', 'product-planner', 'ui-ux-designer', 'business-domain-analyst', 'codebase-domain-analyst', 'database-architect', 'devops-engineer']);
const AUTHORING = new Set(['agent-creator', 'skill-creator', 'skill-tester', 'freshness-auditor']);
const cats = [...Object.keys(ACAT), ...Object.keys(byCat).filter(c => !ACAT[c])];
cats.forEach((c, idx) => {
  const list = byCat[c] || [];
  if (!list.length) return;
  md += `### 5.${idx + 1} ${ACAT[c] || c} (${list.length})\n\n`;
  for (const a of list) {
    const state = defOf('agent:' + a.n) || (LOCK_AGENTS.has(a.n) ? 'lock' : DEFAULT_ON.has(a.n) ? 'on' : 'off');
    const lock = state === 'lock';
    const word = state === 'on' ? '기본 켬' : '기본 끔';
    const def = lock ? '' : AUTHORING.has(a.n) ? ` (${word} · harness-authoring 묶음)` : (state === 'on' ? ' (기본 켬)' : ' (기본 끔 · 해당 스택/앱 모듈에서 켬)');
    const d = descOf('agent:' + a.n);
    md += `- [${lock ? 'x' : ' '}] **${a.n}**${def} — ${d ? d.summary : clip(one(a.d), 130)} · 모델 \`${a.m}\`\n`;
    if (AUTHORING.has(a.n)) md += '  - 프로젝트 추천: 끔\n';
    if (d) {
      if (d.what) md += `  - 하는 일: ${d.what}\n`;
      if (d.when) md += `  - 이럴 때: ${d.when}\n`;
      if (d.example) md += `  - 예시 요청: ${d.example}\n`;
      if (d.note) md += `  - 주의: ${d.note}\n`;
    }
    if ((a.skills || []).length) md += `  - 쓰는 스킬: ${a.skills.join(', ')}\n`;
    const ag = [...new Set((a.agents || []).filter(x => x !== 'CLAUDE'))];
    if (ag.length) md += `  - 연결 에이전트: ${ag.join(', ')}\n`;
  }
  md += '\n';
});

md += `---\n\n## 6. 스킬 (${j.skills.length}종)\n\n`;
md += '> 스킬 = Claude 가 질문 내용에 맞으면 스스로 꺼내 읽는 참고서. 켜져 있어도 쓰일 때만 내용이 읽히고, 평소에는 이름·설명 한 줄만 목록에 올라간다.\n';
md += '> 개수가 많으면 그 목록이 길어져 엉뚱한 스킬이 끌려오기 쉬우므로, **스킬은 고정 없이 묶음(모듈) 단위로 켜고 끄는 것**을 추천.\n';
md += '> **스킬 장에서만 체크의 뜻이 다르다:** "묶음 전체 기본 켬" 체크 = 그 분야 스킬 전부 처음부터 켬 / 개별 스킬 체크 = 그 스킬만 처음부터 켬. 체크 안 한 것도 `/harness` 나 프로젝트 `.gugbab.json` 에서 언제든 켤 수 있다.\n';
md += '> **쓰는 에이전트** = 이 스킬을 참조하는 에이전트. 에이전트를 켜면 이 스킬이 자동으로 같이 켜진다 (8장 연관 처리).\n\n';
const sBy = {};
for (const s of j.skills) (sBy[s.c] = sBy[s.c] || []).push(s);
const scats = [...Object.keys(CAT), ...Object.keys(sBy).filter(c => !CAT[c])];
let i = 1;
for (const c of scats) {
  const list = sBy[c] || [];
  if (!list.length) continue;
  md += `### 6.${i++} ${CAT[c] || c} — ${list.length}종\n\n- [ ] **묶음 전체 기본 켬**\n\n`;
  for (const s of list) {
    const d = descOf('skill:' + s.n);
    md += `  - [${defOf('skill:' + s.n) === 'on' ? 'x' : ' '}] \`${s.n}\` — ${d ? d.summary : clip(one(s.d), 150)}\n`;
    if (d) {
      if (d.what) md += `    - 담은 내용: ${d.what}\n`;
      if (d.when) md += `    - 이럴 때: ${d.when}\n`;
      if (d.example) md += `    - 예시 질문: ${d.example}\n`;
      if (d.note) md += `    - 주의: ${d.note}\n`;
    }
    if (usedBy[s.n]) md += `    - 쓰는 에이전트: ${usedBy[s.n].join(', ')}\n`;
  }
  md += '\n';
}
const out = head.slice(0, tailIdx) + md + head.slice(tailIdx + '<!--TAIL-->'.length);
fs.writeFileSync(outPath, out);
console.log('written', out.length, 'chars');
