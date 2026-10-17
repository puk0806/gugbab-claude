// status.js — 연 프로젝트에 적용된 하네스 요약
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const { statusLines } = require('./status');

const project = { id: 'p', root: '/r', configDir: '/d/p/.claude' };
const empty = () => ({ enabled: new Set(), locked: new Set(), warnings: [], unknown: [], refused: [] });

test('정상: 프로젝트·설정 폴더·종류별 켜진 수·기본값과 다른 항목', () => {
  const manifest = { items: { 'hook:a': { type: 'hook', state: 'lock' }, 'hook:b': { type: 'hook', state: 'on' }, 'skill:c': { type: 'skill', state: 'off' } } };
  const resolved = { enabled: new Set(['hook:a', 'skill:c']), locked: new Set(['hook:a']), warnings: ['w1'], unknown: ['hook:zz'], refused: [{ id: 'hook:a', source: 'profile' }] };
  const text = statusLines({ manifest, resolved, project, paths: { codeHome: '/g', dev: true } }).join('\n');
  for (const needle of ['/d/p/.claude', '훅 1/2', '스킬 1/1', '🔒 1', '켬(기본 끔): skill:c', '끔(기본 켬): hook:b', 'hook:zz', 'hook:a(profile)', 'w1', '개발 모드']) assert.ok(text.includes(needle), needle + '\n' + text);
});

test('악성: 모르는 이름·고정 끄기 시도는 숨기지 않고 보여 줌', () => {
  const r = { ...empty(), unknown: ['hook:../../x'], refused: [{ id: 'hook:bash-guard', source: '.gugbab.json' }] };
  const text = statusLines({ manifest: { items: {} }, resolved: r, project, paths: { codeHome: '/g' } }).join('\n');
  assert.ok(text.includes('hook:../../x') && text.includes('hook:bash-guard(.gugbab.json)'));
});

test('경계: 항목이 없어도 0/0 으로 출력, 기본값과 같으면 차이 줄 없음', () => {
  const text = statusLines({ manifest: {}, resolved: empty(), project, paths: { codeHome: '/g' } }).join('\n');
  assert.ok(text.includes('훅 0/0') && !text.includes('기본 끔') && !text.includes('개발 모드'));
});

test('정상: 프로젝트 자체 .claude 가 가진 항목(래퍼가 건너뜀)은 따로 알려 줌', () => {
  const text = statusLines({ manifest: {}, resolved: empty(), project, paths: { codeHome: '/g' }, skipped: new Set(['hook:a', 'rule:r.md']) }).join('\n');
  assert.match(text, /프로젝트 자체 \.claude 우선 2개/);
  assert.ok(!statusLines({ manifest: {}, resolved: empty(), project, paths: { codeHome: '/g' } }).join('\n').includes('자체'));
});

test('정상: 버전·채널 줄과 안내 (없으면 줄도 없음)', () => {
  const text = statusLines({ manifest: {}, resolved: empty(), project, paths: { codeHome: '/g' }, version: { text: 'v1.0.0 (stable — 최신 v* 태그를 따라감)', hint: '안정 버전 v1.0.1 이 있습니다' } }).join('\n');
  assert.match(text, /버전 +v1\.0\.0 \(stable/);
  assert.match(text, /⚠ 안정 버전 v1\.0\.1/);
  assert.ok(!statusLines({ manifest: {}, resolved: empty(), project, paths: { codeHome: '/g' } }).join('\n').includes('버전'));
});

test('경계: 기본값과 다른 항목이 많으면 12개만 보이고 나머지는 개수로', () => {
  const items = {};
  for (let i = 0; i < 30; i++) items[`skill:s${i}`] = { type: 'skill', state: 'off' };
  const r = { ...empty(), enabled: new Set(Object.keys(items)) };
  const text = statusLines({ manifest: { items }, resolved: r, project, paths: { codeHome: '/g' } }).join('\n');
  assert.match(text, /켬\(기본 끔\) 30개: skill:s0, .*skill:s11 …외 18개/);
  assert.ok(!text.includes('skill:s12,'));
});
