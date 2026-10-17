// layers.js — 적용 층 읽기·쓰기 (profile.json · 프로젝트 settings.json · 프로젝트 .gugbab.json)
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadLayers, readJsonObject, writeJson, readSkipped } = require('./layers');

const tmp = (p) => fs.mkdtempSync(path.join(os.tmpdir(), p));
const write = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, typeof v === 'string' ? v : JSON.stringify(v)); };

function setup() {
  const d = tmp('ly-');
  const paths = { profilePath: path.join(d, 'profile.json') };
  const project = { root: path.join(d, 'proj'), settingsPath: path.join(d, 'projects', 'p', 'settings.json') };
  fs.mkdirSync(project.root, { recursive: true });
  return { d, paths, project };
}

test('정상: 순서는 profile → 프로젝트 → .gugbab.json', () => {
  const { paths, project } = setup();
  write(paths.profilePath, { disable: ['hook:cc-notify'] });
  write(project.settingsPath, { enable: ['hook:cc-notify'] });
  write(path.join(project.root, '.gugbab.json'), { lock: ['bundle:harness-authoring'], disable: ['hook:x'] });
  const l = loadLayers(paths, project);
  assert.deepStrictEqual(l.map(x => x.source), ['profile', 'project', '.gugbab.json']);
  assert.deepStrictEqual(l[2].lock, ['bundle:harness-authoring']);
});

test('정상: writeJson — 폴더를 만들고 임시 파일을 거쳐 통째로 바꿈', () => {
  const { d } = setup();
  const f = path.join(d, 'a', 'b', 'x.json');
  writeJson(f, { enable: ['hook:a'] });
  assert.deepStrictEqual(readJsonObject(f), { enable: ['hook:a'] });
  assert.deepStrictEqual(fs.readdirSync(path.dirname(f)), ['x.json']);
});

test('악성: 프로필에 lock 을 넣어도 무시 (고정은 manifest·.gugbab.json 만)', () => {
  const { paths, project } = setup();
  write(paths.profilePath, { lock: ['hook:x'], enable: ['hook:y'] });
  write(project.settingsPath, { lock: ['hook:z'] });
  const l = loadLayers(paths, project);
  assert.strictEqual(l[0].lock, undefined);
  assert.strictEqual(l[1].lock, undefined);
});

test('악성: .gugbab.json 이 프로젝트 밖을 가리키는 링크면 읽지 않음', () => {
  const { d, paths, project } = setup();
  const outside = path.join(d, 'outside.json');
  write(outside, { lock: ['hook:evil'] });
  fs.symlinkSync(outside, path.join(project.root, '.gugbab.json'));
  const l = loadLayers(paths, project);
  assert.ok(!l.some(x => x.source === '.gugbab.json' && x.lock));
});

test('경계: 파일 없음·깨진 JSON·배열 루트 → 빈 층', () => {
  const { paths, project } = setup();
  write(paths.profilePath, '{broken');
  write(project.settingsPath, '[1,2]');
  const l = loadLayers(paths, project);
  assert.deepStrictEqual(l.map(x => Object.keys(x).filter(k => k !== 'source')), [[], [], []]);
  assert.deepStrictEqual(readJsonObject(path.join(project.root, 'none.json')), {});
});

test('경계: 너무 큰 파일(1MB 초과)은 읽지 않음', () => {
  const { paths, project } = setup();
  write(paths.profilePath, JSON.stringify({ enable: Array(200000).fill('hook:cc-notify') }));
  assert.deepStrictEqual(loadLayers(paths, project)[0], { source: 'profile' });
});

test('정상·경계: readSkipped — 조립 기록의 건너뛴 훅·항목, 없거나 깨지거나 이상한 값은 빼고', () => {
  const { d } = setup();
  const cfg = path.join(d, 'cfg');
  assert.deepStrictEqual([...readSkipped(cfg)], []);
  write(path.join(cfg, '.gugbab-state.json'), { skippedHooks: ['hook:a', 42, null], skippedItems: 'rule:x', projectRoot: '/r' });
  assert.deepStrictEqual([...readSkipped(cfg)], ['hook:a']);
  write(path.join(cfg, '.gugbab-state.json'), '{broken');
  assert.deepStrictEqual([...readSkipped(cfg)], []);
});
