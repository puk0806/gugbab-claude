// paths.js — 코드·데이터 위치 계산
// 정상 / 악성·우회 / 경계 3계층. 맥 규칙(HOME 우선)은 platform:'darwin' 으로, 윈도우 규칙은 platform:'win32' 로 시험
// 기대 경로는 path.resolve 로 만든다 — 윈도우에서 '/opt/gugbab' 는 'C:\opt\gugbab' 가 되므로
const test = require('node:test');
const assert = require('node:assert');
const os = require('os');
const path = require('path');
const { getPaths } = require('./paths');

const R = (p) => path.resolve(p);
const mac = (o) => getPaths({ platform: 'darwin', ...o });

test('정상: 배포 모드 — 데이터는 코드 폴더(~/gugbab), 개발 모드 — ~/.gugbab-dev', () => {
  const p = mac({ env: { HOME: '/h' }, codeHome: '/opt/gugbab' });
  assert.strictEqual(p.dev, false);
  assert.strictEqual(p.dataDir, R('/opt/gugbab'));
  assert.strictEqual(p.projectsDir, path.join(R('/opt/gugbab'), 'projects'));
  assert.strictEqual(p.harnessRoot, path.join(R('/opt/gugbab'), '.claude'));
  const d = mac({ env: { HOME: '/h', GUGBAB_DEV: '1' }, codeHome: '/repo' });
  assert.strictEqual(d.dev, true);
  assert.strictEqual(d.dataDir, path.join('/h', '.gugbab-dev'));
  assert.strictEqual(d.claudeHome, path.join('/h', '.claude'));
});

test('정상: GUGBAB_DATA 가 있으면 그것이 우선', () => {
  assert.strictEqual(mac({ env: { HOME: '/h', GUGBAB_DATA: '/data/g', GUGBAB_DEV: '1' }, codeHome: '/repo' }).dataDir, R('/data/g'));
});

test('정상: 윈도우 — 홈은 os.homedir()(USERPROFILE), Git Bash 가 넘긴 HOME 은 쓰지 않음', () => {
  const p = getPaths({ platform: 'win32', env: { HOME: '/c/Users/someone-else', GUGBAB_DEV: '1' }, codeHome: R('/repo') });
  assert.strictEqual(p.home, os.homedir());
  assert.strictEqual(p.claudeHome, path.join(os.homedir(), '.claude'));
});

test('정상(윈도우): MSYS 표기 GUGBAB_HOME·GUGBAB_DATA(/c/…) 는 C:\\… 로', { skip: process.platform !== 'win32' && '윈도우 경로 해석은 윈도우에서만' }, () => {
  const p = getPaths({ platform: 'win32', env: { GUGBAB_HOME: '/c/gugbab', GUGBAB_DATA: '/d/data' } });
  assert.strictEqual(p.codeHome, 'C:\\gugbab');
  assert.strictEqual(p.dataDir, 'D:\\data');
});

test('악성: GUGBAB_DEV 가 "1" 이 아닌 값(true·yes·공백)이면 개발 모드 아님', () => {
  for (const v of ['true', 'yes', ' 1', '0', '']) assert.strictEqual(mac({ env: { HOME: '/h', GUGBAB_DEV: v }, codeHome: '/r' }).dev, false, v);
});

test('악성: 상대 경로·../ 가 섞인 GUGBAB_DATA 는 절대 경로로 정규화', () => {
  for (const platform of ['darwin', 'win32']) {
    const p = getPaths({ platform, env: { HOME: '/h', GUGBAB_DATA: 'x/../../y' }, codeHome: '/r' });
    assert.ok(path.isAbsolute(p.dataDir) && !p.dataDir.includes('..'), platform);
  }
});

test('경계: codeHome 을 안 주면 GUGBAB_HOME, 그것도 없으면 이 파일 위 폴더', () => {
  assert.strictEqual(mac({ env: { HOME: '/h', GUGBAB_HOME: '/g' } }).codeHome, R('/g'));
  assert.strictEqual(mac({ env: { HOME: '/h' } }).codeHome, path.resolve(__dirname, '..'));
});

test('경계: 맥 — HOME 이 없으면 os.homedir()', () => {
  assert.strictEqual(mac({ env: {}, codeHome: '/r' }).home, os.homedir());
});
