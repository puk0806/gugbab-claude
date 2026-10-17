// resolve.js — 켜짐·꺼짐 계산 (적용 순서 + 14장 처리 순서 A 펼치기 → B 채우기 → C 정리 → B 재검사)
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const { resolve, expand } = require('./resolve');

function manifest() {
  const it = (type, state) => ({ type, state });
  return {
    items: {
      'hook:bash-guard': it('hook', 'lock'),
      'hook:task-confirm-guard': it('hook', 'lock'),
      'hook:progress-tracker': it('hook', 'on'),
      'hook:cc-notify': it('hook', 'on'),
      'hook:tdd-guard': it('hook', 'on'),
      'hook:fake-impl-guard': it('hook', 'on'),
      'rule:task-workflow.md': it('rule', 'on'),
      'rule:codex-review.md': it('rule', 'off'),
      'hook:codex-review-guard': it('hook', 'off'),
      'agent:nexacro-screen-analyzer': it('agent', 'off'),
      'skill:nexacro-xfdl': it('skill', 'off'),
      'agent:skill-tester': it('agent', 'off'),
      'hook:deliverable-guard': it('hook', 'off'),
    },
    relations: {
      bundles: {
        'dev-quality': { items: ['hook:tdd-guard', 'hook:fake-impl-guard'] },
        'codex-review': { items: ['hook:codex-review-guard', 'rule:codex-review.md'] },
      },
      blocks: { nexacro: { items: ['agent:nexacro-screen-analyzer', 'skill:nexacro-xfdl'] } },
      requires: {
        'hook:progress-tracker': ['hook:task-confirm-guard'],
        'hook:codex-review-guard': ['rule:codex-review.md'],
        'hook:deliverable-guard': ['agent:skill-tester'],
      },
      conflicts: [['block:nexacro', 'hook:tdd-guard']],
    },
  };
}
const on = (r) => [...r.enabled].sort();

test('정상: 기본값만 — lock·on 은 켜고 off 는 끔', () => {
  const r = resolve(manifest(), []);
  assert.deepStrictEqual(on(r), ['hook:bash-guard', 'hook:cc-notify', 'hook:fake-impl-guard', 'hook:progress-tracker', 'hook:task-confirm-guard', 'hook:tdd-guard', 'rule:task-workflow.md']);
  assert.ok(r.locked.has('hook:bash-guard'));
});

test('정상: 적용 순서 — profile < project < .gugbab.json (뒤가 이김)', () => {
  const r = resolve(manifest(), [
    { source: 'profile', disable: ['hook:cc-notify'] },
    { source: 'project', enable: ['hook:cc-notify'] },
    { source: '.gugbab.json', disable: ['hook:cc-notify'] },
  ]);
  assert.ok(!r.enabled.has('hook:cc-notify'));
  const r2 = resolve(manifest(), [{ source: 'profile', disable: ['hook:cc-notify'] }, { source: 'project', enable: ['hook:cc-notify'] }]);
  assert.ok(r2.enabled.has('hook:cc-notify'));
});

test('정상: A 펼치기 — bundle:·block: 이름으로 한 번에 켜고 끔', () => {
  const r = resolve(manifest(), [{ source: 'project', disable: ['bundle:dev-quality'] }]);
  assert.ok(!r.enabled.has('hook:tdd-guard') && !r.enabled.has('hook:fake-impl-guard'));
  assert.deepStrictEqual(expand('bundle:dev-quality', manifest()), ['hook:tdd-guard', 'hook:fake-impl-guard']);
});

test('정상: B 채우기 — 켠 항목이 필요로 하는 것은 경고와 함께 같이 켬', () => {
  const r = resolve(manifest(), [{ source: 'project', enable: ['hook:codex-review-guard'] }]);
  assert.ok(r.enabled.has('rule:codex-review.md'));
  assert.ok(r.warnings.some(w => w.includes('hook:codex-review-guard') && w.includes('rule:codex-review.md')));
});

test('정상: 필요한 것을 사용자가 끄면 쓰는 쪽도 같이 끔 (경고)', () => {
  const r = resolve(manifest(), [{ source: 'project', enable: ['hook:deliverable-guard'], disable: ['agent:skill-tester'] }]);
  assert.ok(!r.enabled.has('hook:deliverable-guard'));
  assert.ok(r.warnings.some(w => w.includes('agent:skill-tester') && w.includes('hook:deliverable-guard')));
});

test('정상: C 정리 — 충돌(nexacro 블록 ↔ tdd-guard)이면 뒤쪽을 끄고 B 재검사', () => {
  const r = resolve(manifest(), [{ source: 'project', enable: ['block:nexacro'] }]);
  assert.ok(r.enabled.has('skill:nexacro-xfdl'));
  assert.ok(!r.enabled.has('hook:tdd-guard'));
  assert.ok(r.warnings.some(w => w.includes('충돌')));
});

test('정상: 블록 구성원 일부만 기본으로 켜져 있으면 충돌로 보지 않음 (블록을 켠 것이 아님 — 실측 버그 2026-10-16)', () => {
  const m = manifest();
  m.items['agent:nexacro-screen-analyzer'].state = 'on'; // 체크리스트에서 에이전트 하나만 모든 프로젝트 기본 켬
  const r = resolve(m, []);
  assert.ok(r.enabled.has('hook:tdd-guard'));
  assert.ok(!r.warnings.some(w => w.includes('충돌')));
  const r2 = resolve(m, [{ source: 'project', enable: ['skill:nexacro-xfdl'] }]); // 구성원이 전부 켜짐 → 블록 켬으로 봄
  assert.ok(!r2.enabled.has('hook:tdd-guard'));
});

test('정상: 명시적으로 켠 블록을 뒤 층에서 끄면 충돌도 사라짐', () => {
  const r = resolve(manifest(), [{ source: 'profile', enable: ['block:nexacro'] }, { source: 'project', disable: ['block:nexacro'] }]);
  assert.ok(r.enabled.has('hook:tdd-guard'));
});

test('정상: .gugbab.json lock 은 고정으로 취급하고 고정이 필요로 하는 것도 고정', () => {
  const r = resolve(manifest(), [{ source: '.gugbab.json', lock: ['hook:codex-review-guard'] }]);
  assert.ok(r.locked.has('hook:codex-review-guard') && r.locked.has('rule:codex-review.md'));
  const r2 = resolve(manifest(), [{ source: '.gugbab.json', lock: ['hook:codex-review-guard'] }, { source: 'project', disable: ['rule:codex-review.md'] }]);
  assert.ok(r2.enabled.has('rule:codex-review.md'));
});

test('악성: 고정 항목 끄기 시도 → 거부 목록에 남고 계속 켜짐', () => {
  const r = resolve(manifest(), [{ source: 'profile', disable: ['hook:bash-guard', 'hook:task-confirm-guard'] }]);
  assert.ok(r.enabled.has('hook:bash-guard') && r.enabled.has('hook:task-confirm-guard'));
  assert.deepStrictEqual(r.refused.map(x => x.id).sort(), ['hook:bash-guard', 'hook:task-confirm-guard']);
});

test('악성: 고정이 필요로 하는 것을 끄면 고정이 이긴다 (progress-tracker 를 고정했을 때 task-confirm-guard)', () => {
  const m = manifest();
  m.items['hook:task-confirm-guard'].state = 'on';
  const r = resolve(m, [{ source: '.gugbab.json', lock: ['hook:progress-tracker'] }, { source: 'project', disable: ['hook:task-confirm-guard'] }]);
  assert.ok(r.enabled.has('hook:progress-tracker') && r.enabled.has('hook:task-confirm-guard'));
});

test('악성: manifest 에 없는 이름·경로 조작·이상한 형식은 무시하고 unknown 에 남김', () => {
  const r = resolve(manifest(), [{ source: 'project', enable: ['hook:../../evil', 'hook:nope', 'bundle:nope', '__proto__', 42, { x: 1 }] }]);
  assert.deepStrictEqual(r.unknown.sort(), ['42', '[object Object]', '__proto__', 'bundle:nope', 'hook:../../evil', 'hook:nope'].sort());
  assert.ok(!r.enabled.has('hook:../../evil'));
});

test('악성: enable 이 배열이 아니면(문자열·객체) 무시 + 경고', () => {
  const r = resolve(manifest(), [{ source: 'project', enable: 'hook:codex-review-guard', disable: { 'hook:cc-notify': true } }]);
  assert.ok(!r.enabled.has('hook:codex-review-guard') && r.enabled.has('hook:cc-notify'));
  assert.ok(r.warnings.some(w => w.includes('배열')));
});

test('경계: 순환 의존이어도 끝난다', () => {
  const m = manifest();
  m.relations.requires['hook:cc-notify'] = ['hook:tdd-guard'];
  m.relations.requires['hook:tdd-guard'] = ['hook:cc-notify'];
  const r = resolve(m, [{ source: 'project', disable: ['hook:cc-notify'] }]);
  assert.ok(!r.enabled.has('hook:cc-notify') && !r.enabled.has('hook:tdd-guard'));
});

test('경계: 층이 null·빈 객체·너무 긴 목록이어도 깨지지 않는다', () => {
  assert.doesNotThrow(() => resolve(manifest(), [null, {}, { source: 'x', enable: Array(5000).fill('hook:cc-notify') }]));
  const r = resolve(manifest(), [{ source: 'x', disable: Array(5000).fill('hook:cc-notify') }]);
  assert.ok(r.warnings.some(w => w.includes('너무 깁니다')));
});

test('경계: manifest 에 relations 가 없어도 동작', () => {
  const m = manifest(); delete m.relations;
  assert.doesNotThrow(() => resolve(m, [{ source: 'p', enable: ['bundle:dev-quality'] }]));
});
