// apply.js — 켜기·끄기 기록 규칙 + 안 바뀐 이유 + 저장·조립 (CLI on/off·preset 과 TUI 가 함께 씀)
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { applyToggle, applyPreset, explainUnchanged, commitLayer, layerIndex } = require('./apply');
const { resolve } = require('./resolve');

const manifest = {
  items: {
    'hook:a': { type: 'hook', state: 'on' },
    'hook:b': { type: 'hook', state: 'on' },
    'hook:lock': { type: 'hook', state: 'lock' },
    'rule:r.md': { type: 'rule', state: 'on' },
    'skill:s1': { type: 'skill', state: 'off' },
    'skill:s2': { type: 'skill', state: 'off' },
    'setting:superpowers 플러그인': { type: 'setting', state: 'on', key: 'plugin:superpowers@m' },
    'setting:상태줄 `statusline.sh`': { type: 'setting', state: 'on', key: 'statusLine' },
  },
  relations: {
    bundles: { q: { title: '품질', items: ['hook:a', 'hook:b', 'rule:r.md'] } },
    blocks: { st: { title: '스택', items: ['skill:s1', 'skill:s2'] } },
    presets: { web: { title: '웹', enable: ['block:st', 'bundle:q'] }, bad: { title: '깨짐', enable: ['block:none'] } },
  },
};
const run = (layers) => resolve(manifest, layers);

test('정상: 끄고 켜면 같은 층에 반대 기록이 남지 않음', () => {
  let l = applyToggle({}, 'off', 'hook:a', manifest);
  assert.deepStrictEqual([l.enable, l.disable], [[], ['hook:a']]);
  l = applyToggle(l, 'on', 'hook:a', manifest);
  assert.deepStrictEqual([l.enable, l.disable], [['hook:a'], []]);
});

test('정상: 묶음을 끈 뒤 그 안 항목 하나를 켜면 실제로 켜짐 (같은 층에선 끔이 이기므로 묶음 기록을 나머지로 풂)', () => {
  let l = applyToggle({}, 'off', 'bundle:q', manifest);
  l = applyToggle(l, 'on', 'hook:a', manifest);
  assert.deepStrictEqual(l.disable.sort(), ['hook:b', 'rule:r.md']);
  const r = run([{ source: 'project', ...l }]);
  assert.ok(r.enabled.has('hook:a'));
  assert.ok(!r.enabled.has('hook:b'));
});

test('정상: 묶음을 켜면 그 구성원의 끔 기록을 걷어냄', () => {
  let l = applyToggle({}, 'off', 'hook:b', manifest);
  l = applyToggle(l, 'on', 'bundle:q', manifest);
  assert.deepStrictEqual([l.enable, l.disable], [['bundle:q'], []]);
});

test('정상: 묶음을 끄면 그 구성원의 개별 켬 기록은 정리', () => {
  let l = applyToggle({}, 'on', 'hook:a', manifest);
  l = applyToggle(l, 'off', 'bundle:q', manifest);
  assert.deepStrictEqual([l.enable, l.disable], [[], ['bundle:q']]);
});

test('정상: 프리셋은 블록·묶음을 한 번에 켬', () => {
  const l = applyPreset({}, 'web', manifest);
  assert.deepStrictEqual(l.enable.sort(), ['block:st', 'bundle:q']);
  const r = run([{ source: 'project', ...l }]);
  assert.ok(r.enabled.has('skill:s1') && r.enabled.has('skill:s2'));
});

test('정상: 안 바뀐 이유 — 위쪽 층(프로젝트 설정)이 덮고 있음', () => {
  const layers = [{ source: 'profile', disable: ['hook:a'] }, { source: 'project', enable: ['hook:a'] }, { source: '.gugbab.json' }];
  const why = explainUnchanged(['hook:a'], 'off', layers, run(layers), layerIndex('profile'), manifest);
  assert.match(why.join(' '), /이 프로젝트 설정/);
});

test('정상: 안 바뀐 이유 — 고정, .gugbab.json lock', () => {
  const layers = [{ source: 'profile' }, { source: 'project', disable: ['hook:lock', 'hook:b'] }, { source: '.gugbab.json', lock: ['hook:b'] }];
  const why = explainUnchanged(['hook:lock', 'hook:b'], 'off', layers, run(layers), layerIndex('project'), manifest);
  assert.match(why.join(' '), /hook:lock.*고정/);
  assert.match(why.join(' '), /hook:b.*\.gugbab\.json/);
});

test('정상: commitLayer — 파일에 쓰고 켬·끔 차이와 재시작 필요를 돌려줌', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'ap-'));
  const paths = { profilePath: path.join(d, 'profile.json') };
  const project = { root: d, id: 'p', configDir: path.join(d, 'cfg'), settingsPath: path.join(d, 'projects', 'p', 'settings.json') };
  const composed = [];
  const r = commitLayer({ manifest, paths, project, scope: 'project', mutate: (l) => applyToggle(l, 'off', 'rule:r.md', manifest), composeFn: (x) => composed.push(x) });
  assert.deepStrictEqual(r.turnedOff, ['rule:r.md']);
  assert.strictEqual(r.needRestart, true);
  assert.ok(fs.existsSync(path.join(project.configDir, '.gugbab-restart')));
  assert.strictEqual(composed.length, 1);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(project.settingsPath, 'utf8')).disable, ['rule:r.md']);
  const r2 = commitLayer({ manifest, paths, project, scope: 'profile', mutate: (l) => applyToggle(l, 'off', 'hook:a', manifest), composeFn: () => {} });
  assert.deepStrictEqual([r2.turnedOff, r2.needRestart], [['hook:a'], false]);
  assert.ok(fs.existsSync(paths.profilePath));
});

test('정상: 설정 항목은 이름에 공백·한글·백틱이 있어도 켜고 끔 (manifest 에 있는 이름이면)', () => {
  let l = applyToggle({}, 'off', 'setting:superpowers 플러그인', manifest);
  l = applyToggle(l, 'off', 'setting:상태줄 `statusline.sh`', manifest);
  const r = run([{ source: 'project', ...l }]);
  assert.ok(!r.enabled.has('setting:superpowers 플러그인') && !r.enabled.has('setting:상태줄 `statusline.sh`'));
  l = applyToggle(l, 'on', 'setting:superpowers 플러그인', manifest);
  assert.ok(run([{ source: 'project', ...l }]).enabled.has('setting:superpowers 플러그인'));
});

test('악성: 공백 허용을 이용한 조작 — manifest 에 없는 이름·줄바꿈·제어문자·경로 조작은 거부', () => {
  for (const bad of ['setting:superpowers 플러그인\n', 'setting:superpowers  플러그인', 'setting:superpowers 플러그인\u0000', 'hook:a b', 'setting:../../x 플러그인', 'setting:\u001b[2J', ' setting:superpowers 플러그인']) {
    assert.throws(() => applyToggle({}, 'off', bad, manifest), /올바르지|모르는/, JSON.stringify(bad));
  }
});

test('악성: 모르는 이름·경로 조작·프로토타입 키 → 거부(예외), 층은 그대로', () => {
  for (const bad of ['hook:nope', '../../etc/passwd', '__proto__', 'bundle:__proto__', 'block:constructor', '', null, 42]) {
    assert.throws(() => applyToggle({ enable: ['hook:a'] }, 'off', bad, manifest), /올바르지|모르는/);
  }
  assert.throws(() => applyToggle({}, 'delete', 'hook:a', manifest), /on 또는 off/);
});

test('악성: 모르는 프리셋·없는 블록을 가리키는 프리셋 → 거부', () => {
  assert.throws(() => applyPreset({}, 'nope', manifest), /모르는 프리셋/);
  assert.throws(() => applyPreset({}, '__proto__', manifest), /모르는 프리셋/);
  assert.throws(() => applyPreset({}, 'bad', manifest), /모르는 항목/);
});

test('악성: 층 파일에 배열이 아닌 enable·disable 이 있어도 덮어써서 정상화', () => {
  const l = applyToggle({ enable: 'hook:a', disable: { x: 1 }, other: 1 }, 'off', 'hook:b', manifest);
  assert.deepStrictEqual([l.enable, l.disable, l.other], [[], ['hook:b'], 1]);
});

test('경계: 같은 동작을 두 번 해도 기록은 하나', () => {
  let l = applyToggle({}, 'on', 'hook:a', manifest);
  l = applyToggle(l, 'on', 'hook:a', manifest);
  assert.deepStrictEqual(l.enable, ['hook:a']);
});

test('경계: 바뀐 게 있으면 이유 없음, 원래 그 상태면 "이미 그 상태"', () => {
  const layers = [{ source: 'profile' }, { source: 'project' }, { source: '.gugbab.json' }];
  const why = explainUnchanged(['skill:s1'], 'off', layers, run(layers), layerIndex('project'), manifest);
  assert.match(why.join(' '), /이미/);
  assert.strictEqual(layerIndex('nope'), -1);
});
