// paths.js — 코드·데이터 위치 계산
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { getPaths } = require('./paths');

test('정상: 배포 모드 — 데이터는 코드 폴더(~/gugbab), 개발 모드 — ~/.gugbab-dev', () => {
  const p = getPaths({ env: { HOME: '/h' }, codeHome: '/opt/gugbab' });
  assert.strictEqual(p.dev, false);
  assert.strictEqual(p.dataDir, '/opt/gugbab');
  assert.strictEqual(p.projectsDir, '/opt/gugbab/projects');
  assert.strictEqual(p.harnessRoot, '/opt/gugbab/.claude');
  const d = getPaths({ env: { HOME: '/h', GUGBAB_DEV: '1' }, codeHome: '/repo' });
  assert.strictEqual(d.dev, true);
  assert.strictEqual(d.dataDir, '/h/.gugbab-dev');
  assert.strictEqual(d.claudeHome, '/h/.claude');
});

test('정상: GUGBAB_DATA 가 있으면 그것이 우선', () => {
  assert.strictEqual(getPaths({ env: { HOME: '/h', GUGBAB_DATA: '/data/g', GUGBAB_DEV: '1' }, codeHome: '/repo' }).dataDir, '/data/g');
});

test('악성: GUGBAB_DEV 가 "1" 이 아닌 값(true·yes·공백)이면 개발 모드 아님', () => {
  for (const v of ['true', 'yes', ' 1', '0', '']) assert.strictEqual(getPaths({ env: { HOME: '/h', GUGBAB_DEV: v }, codeHome: '/r' }).dev, false, v);
});

test('악성: 상대 경로·../ 가 섞인 GUGBAB_DATA 는 절대 경로로 정규화', () => {
  const p = getPaths({ env: { HOME: '/h', GUGBAB_DATA: 'x/../../y' }, codeHome: '/r' });
  assert.ok(path.isAbsolute(p.dataDir) && !p.dataDir.includes('..'));
});

test('경계: codeHome 을 안 주면 GUGBAB_HOME, 그것도 없으면 이 파일 위 폴더', () => {
  assert.strictEqual(getPaths({ env: { HOME: '/h', GUGBAB_HOME: '/g' } }).codeHome, '/g');
  assert.strictEqual(getPaths({ env: { HOME: '/h' } }).codeHome, path.resolve(__dirname, '..'));
});
