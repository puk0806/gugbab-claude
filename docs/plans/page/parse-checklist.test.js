// parse-checklist.js — 체크리스트 md 를 항목 목록으로 읽는다 (build-page·build-manifest 공용)
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const { parseChecklist } = require('./parse-checklist');

const MD = [
  '# 체크리스트',
  '## 1. 기본 설정',
  '- [x] **위험 명령 차단 목록 (deny)** — 되돌릴 수 없는 명령 거부',
  '## 2. 훅 (2종)',
  '### 2.1 안전',
  '- [x] **bash-guard** — 위험 명령 차단',
  '  - 하는 일: 분석',
  '- [ ] **cc-notify** (기본 켬) — 완료 알림',
  '  - 프로젝트 추천: 끔',
  '- [ ] **relation-guard** (기본 켬) (신규) — 관계 검사',
  '- [ ] **instructions-loaded** (기본 끔 · **폐지 추천**) — 룰 검사',
  '## 4. 슬래시 커맨드',
  '- [x] **/harness** (신규) — 켜고 끄기',
  '## 6. 스킬',
  '### 6.1 프론트',
  '- [ ] **묶음 전체 기본 켬**',
  '  - [x] `react-core` — 리액트 · 쓰는 에이전트: frontend-developer',
  '  - [ ] `vue-core` — 뷰',
  '## 7. 고정 목록 요약',
  '- [x] **여기는 항목이 아님** — 요약 표',
].join('\n');

test('정상: 종류·상태·프로젝트 추천을 읽는다', () => {
  const { items } = parseChecklist(MD);
  const by = Object.fromEntries(items.map(i => [i.id, i]));
  assert.strictEqual(by['setting:위험 명령 차단 목록 (deny)'].rec, 'lock');
  assert.strictEqual(by['hook:bash-guard'].rec, 'lock');
  assert.strictEqual(by['hook:cc-notify'].rec, 'on');
  assert.strictEqual(by['hook:cc-notify'].projHint, 'off');
  assert.strictEqual(by['hook:relation-guard'].rec, 'on');
  assert.strictEqual(by['hook:instructions-loaded'].rec, 'off');
  assert.strictEqual(by['command:harness'].rec, 'lock');
  assert.strictEqual(by['skill:react-core'].rec, 'on');
  assert.strictEqual(by['skill:vue-core'].rec, 'off');
});

test('정상: 7장 이후(요약·연관)는 항목으로 세지 않는다', () => {
  const { items, sections } = parseChecklist(MD);
  assert.ok(!items.some(i => i.name === '여기는 항목이 아님'));
  assert.deepStrictEqual(sections.map(s => s.type), ['setting', 'hook', 'command', 'skill']);
  assert.strictEqual(items.length, 8);
});

test('악성: 같은 id 가 두 번 나오면 오류 (한쪽 상태가 조용히 묻히지 않게)', () => {
  const dup = MD.replace('- [ ] **cc-notify** (기본 켬)', '- [x] **bash-guard** — 중복\n- [ ] **cc-notify** (기본 켬)');
  assert.throws(() => parseChecklist(dup), /중복 항목: hook:bash-guard/);
});

test('악성: 이름에 경로 조작 문자가 있으면 오류', () => {
  const evil = MD.replace('**cc-notify**', '**../../evil**');
  assert.throws(() => parseChecklist(evil), /허용되지 않는 이름/);
});

test('경계: 빈 문서·장 없는 문서는 빈 목록', () => {
  assert.deepStrictEqual(parseChecklist('').items, []);
  assert.deepStrictEqual(parseChecklist('- [x] **bash-guard** — 장 밖').items, []);
});

test('경계: 형식이 깨진 줄(체크박스·굵게 없음)은 무시', () => {
  const broken = MD.replace('- [ ] **cc-notify** (기본 켬) — 완료 알림', '- [ ] cc-notify 완료 알림\n- **x** — 체크박스 없음');
  const { items } = parseChecklist(broken);
  assert.ok(!items.some(i => i.id === 'hook:cc-notify'));
});

test('경계: CRLF·CR 줄바꿈도 LF 와 같은 항목 — 이름·설명 끝에 \\r 이 붙지 않음 (윈도우 autocrlf)', () => {
  const lf = parseChecklist(MD);
  for (const nl of ['\r\n', '\r']) {
    const r = parseChecklist(MD.replace(/\n/g, nl));
    assert.deepStrictEqual(r.items, lf.items);
    assert.deepStrictEqual(r.sections, lf.sections);
    assert.ok(!JSON.stringify(r).includes('\\r'));
  }
});

test('경계: 입력이 문자열이 아니면 TypeError', () => {
  assert.throws(() => parseChecklist(null), TypeError);
});
