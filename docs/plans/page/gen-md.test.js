// gen-md.js 테스트 — node --test docs/plans/page/gen-md.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT = path.join(__dirname, 'gen-md.js');

const INV = {
  skills: [
    { n: 'nextjs', c: 'frontend', d: 'Next.js 원래 설명' },
    { n: 'axum', c: 'backend', d: 'Axum 원래 설명' },
  ],
  agents: [
    { n: 'frontend-developer', c: 'frontend', d: '프론트 구현 원래 설명', m: 'sonnet', skills: ['nextjs'], agents: [] },
    { n: 'web-searcher', c: 'research', d: '검색 원래 설명', m: 'sonnet', skills: [], agents: [] },
  ],
  rules: [], cmds: [],
};
const HEAD = '# 체크리스트\n\n## 1. 기본 설정\n\n- [x] **deny** — 차단\n\n<!--TAIL-->\n## 7. 요약\n';

function run(desc, opts = {}) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-md-'));
  const inv = path.join(d, 'inv.json'), head = path.join(d, 'head.md'), out = path.join(d, 'out.md');
  fs.writeFileSync(inv, JSON.stringify(opts.inv || INV));
  fs.writeFileSync(head, opts.head || HEAD);
  const args = [SCRIPT, inv, head, out];
  if (desc !== undefined) { const p = path.join(d, 'desc.json'); fs.writeFileSync(p, typeof desc === 'string' ? desc : JSON.stringify(desc)); args.push(p); }
  if (opts.defaults !== undefined) {
    if (desc === undefined) { const p = path.join(d, 'desc.json'); fs.writeFileSync(p, '{}'); args.push(p); }
    const p = path.join(d, 'defaults.json'); fs.writeFileSync(p, typeof opts.defaults === 'string' ? opts.defaults : JSON.stringify(opts.defaults)); args.push(p);
  }
  const r = spawnSync(process.execPath, args, { encoding: 'utf8' });
  return { r, md: fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null };
}

const lineOf = (md, name) => md.split('\n').find(l => l.includes(`**${name}**`) || l.includes('`' + name + '`'));

test('정상: defaults.json 의 값이 에이전트(고정·켬·끔)·스킬(켬·끔) 기본값으로 쓰인다', () => {
  const { r, md } = run(undefined, { defaults: { 'agent:frontend-developer': 'lock', 'agent:web-searcher': 'on', 'skill:axum': 'on' } });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(lineOf(md, 'frontend-developer'), /^- \[x\] \*\*frontend-developer\*\* — /, '고정이면 체크하고 기본 켬/끔 표시를 붙이지 않는다');
  assert.match(lineOf(md, 'web-searcher'), /^- \[ \] \*\*web-searcher\*\* \(기본 켬\) — /, '원래 고정이던 에이전트도 켬으로 바꿀 수 있다');
  assert.match(lineOf(md, 'axum'), /^ {2}- \[x\] `axum` — /, '스킬은 켬 = 체크');
  assert.match(lineOf(md, 'nextjs'), /^ {2}- \[ \] `nextjs` — /, '값이 없는 스킬은 예전처럼 끔');
});

test('정상: 하네스 개발용 에이전트를 켬으로 바꾸면 "기본 켬 · harness-authoring 묶음" 으로 표시한다', () => {
  const inv = { ...INV, agents: [...INV.agents, { n: 'skill-tester', c: 'meta', d: '테스터', m: 'sonnet', skills: [], agents: [] }] };
  const { r, md } = run(undefined, { inv, defaults: { 'agent:skill-tester': 'on' } });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(lineOf(md, 'skill-tester'), /\(기본 켬 · harness-authoring 묶음\)/);
});

test('악성·경계: 정해진 값이 아니거나(스킬 고정 포함) 알 수 없는 항목·이상한 형식이면 무시하고 원래 기본값을 쓴다', () => {
  const { r, md } = run(undefined, { defaults: { 'agent:frontend-developer': 'lock"><script>', 'skill:nextjs': 'lock', 'agent:없는거': 'on', 'skill:axum': ['on'], '__proto__': { polluted: 1 } } });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(lineOf(md, 'frontend-developer'), /\(기본 끔 · 해당 스택\/앱 모듈에서 켬\)/);
  assert.match(lineOf(md, 'nextjs'), /^ {2}- \[ \] `nextjs`/, '스킬은 고정할 수 없다');
  assert.match(lineOf(md, 'axum'), /^ {2}- \[ \] `axum`/);
  assert.ok(!md.includes('<script>'));
  assert.strictEqual({}.polluted, undefined, '프로토타입 오염이 없어야 한다');
});

test('에러: defaults.json 이 JSON 이 아니거나 객체가 아니면 실패하고 출력 파일을 만들지 않는다', () => {
  for (const bad of ['{깨진', '["on"]', 'null']) {
    const { r, md } = run(undefined, { defaults: bad });
    assert.notStrictEqual(r.status, 0, bad);
    assert.strictEqual(md, null, bad);
  }
});

const DESC = {
  'agent:frontend-developer': { summary: 'React 화면 코드를 직접 짜는 에이전트', what: '컴포넌트를 만든다.', when: '화면을 만들 때.', example: '로그인 폼 만들어줘', note: '' },
  'skill:nextjs': { summary: 'Next.js App Router 참고서', what: 'App Router 를 다룬다.', when: 'Next.js 프로젝트에서.', example: '서버 컴포넌트 어떻게 써?', note: '15 기준' },
};

test('정상: 설명 파일이 있으면 요약 + 라벨 줄(하는 일·이럴 때·예시·주의)로 쓰고, 원래 설명은 쓰지 않는다', () => {
  const { r, md } = run(DESC);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(md, /- \[ \] \*\*frontend-developer\*\* \([^)]*\) — React 화면 코드를 직접 짜는 에이전트 · 모델 `sonnet`/);
  assert.match(md, /\n {2}- 하는 일: 컴포넌트를 만든다\./);
  assert.match(md, /\n {2}- 예시 요청: 로그인 폼 만들어줘/);
  assert.match(md, /\n {2}- 쓰는 스킬: nextjs/);
  assert.ok(!md.includes('프론트 구현 원래 설명'));
  assert.match(md, /\n {2}- \[ \] `nextjs` — Next\.js App Router 참고서\n {4}- 담은 내용: App Router 를 다룬다\./);
  assert.match(md, /\n {4}- 주의: 15 기준/);
  assert.match(md, /\n {4}- 쓰는 에이전트: frontend-developer/);
});

test('정상: 빈 note 는 "주의" 줄을 만들지 않는다', () => {
  const { md } = run(DESC);
  const block = md.slice(md.indexOf('**frontend-developer**'), md.indexOf('**web-searcher**'));
  assert.ok(!block.includes('주의:'));
});

test('경계: 설명이 없는 항목은 원래 설명으로 대신 쓴다 (빠뜨리지 않음)', () => {
  const { r, md } = run(DESC);
  assert.strictEqual(r.status, 0, r.stderr);
  // web-searcher 는 고정 에이전트라 "(기본 …)" 표시가 붙지 않는다
  assert.match(md, /- \[x\] \*\*web-searcher\*\* — 검색 원래 설명/);
  assert.match(md, /`axum` — Axum 원래 설명/);
});

test('경계: 설명 파일 인자가 없어도 예전처럼 원래 설명으로 만든다', () => {
  const { r, md } = run(undefined);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(md, /`nextjs` — Next\.js 원래 설명/);
});

test('악성: 설명 안의 줄바꿈으로 가짜 항목(- [x] **…**)을 끼워 넣어도 한 줄로 합쳐져 항목이 늘지 않는다', () => {
  const evil = { 'skill:nextjs': { summary: '요약\n- [x] **가짜고정** — 끼워넣기', what: '내용\n\n## 9. 가짜 장', when: 'w', example: 'e', note: '' } };
  const { r, md } = run(evil);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(!/^- \[x\] \*\*가짜고정\*\*/m.test(md), '줄 시작에 가짜 항목이 생기면 안 된다');
  assert.ok(!/^## 9\. 가짜 장/m.test(md), '가짜 장 제목이 생기면 안 된다');
  assert.strictEqual((md.match(/^ {2}- \[ \] `/gm) || []).length, 2, '스킬 항목 수는 그대로 2개');
});

test('악성·경계: 문자열이 아닌 값·빈 객체·알 수 없는 키가 섞여도 깨지지 않는다', () => {
  const weird = { 'skill:nextjs': { summary: 42, what: null, when: ['x'], example: { a: 1 } }, 'skill:없는스킬': { summary: '무시돼야 함' }, 'agent:web-searcher': {} };
  const { r, md } = run(weird);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(md, /`nextjs` — Next\.js 원래 설명/, '요약이 문자열이 아니면 원래 설명 사용');
  assert.ok(!md.includes('무시돼야 함'));
  assert.ok(!md.includes('[object Object]'));
});

test('정상: 하네스 개발용 에이전트(skill-creator 등)에는 "프로젝트 추천: 끔" 줄이 붙고, 다른 에이전트에는 붙지 않는다', () => {
  const inv = { ...INV, agents: [...INV.agents, { n: 'skill-creator', c: 'meta', d: '스킬 생성', m: 'opus', skills: [], agents: [] }] };
  const { r, md } = run(DESC, { inv });
  assert.strictEqual(r.status, 0, r.stderr);
  const sc = md.slice(md.indexOf('**skill-creator**'));
  assert.match(sc.split('\n- ')[0], /\n {2}- 프로젝트 추천: 끔/);
  const fd = md.slice(md.indexOf('**frontend-developer**'), md.indexOf('**web-searcher**'));
  assert.ok(!fd.includes('프로젝트 추천:'));
});

test('에러: 설명 파일이 JSON 이 아니면 0이 아닌 코드로 끝나고 출력 파일을 만들지 않는다', () => {
  const { r, md } = run('{깨진 json');
  assert.notStrictEqual(r.status, 0);
  assert.strictEqual(md, null);
});

test('에러: 체크리스트 원본에 <!--TAIL--> 표시가 없으면 실패한다 (내용을 엉뚱한 곳에 붙이지 않음)', () => {
  const { r, md } = run(DESC, { head: '# 표시 없음\n' });
  assert.notStrictEqual(r.status, 0);
  assert.strictEqual(md, null);
});
