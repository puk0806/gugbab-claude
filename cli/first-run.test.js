// first-run.js — 프로젝트에서 처음 실행할 때 기본 프리셋 고르기
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { PassThrough } = require('stream');
const { detectStack, shouldAsk, parseChoice, promptText, applyChoice, runFirstRun } = require('./first-run');
const { readJsonObject } = require('./layers');
const { resolve } = require('./resolve');

const tmp = (p) => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), p)));
const w = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const manifest = {
  items: { 'skill:react': { type: 'skill', state: 'off' }, 'skill:axum': { type: 'skill', state: 'off' }, 'skill:seo': { type: 'skill', state: 'off' } },
  relations: {
    blocks: { fe: { title: '프론트', items: ['skill:react'] }, rs: { title: 'Rust', items: ['skill:axum'] }, seo: { title: 'SEO', items: ['skill:seo'] } },
    presets: { nextjs: { title: 'Next.js', enable: ['block:fe'] }, rust: { title: 'Rust', enable: ['block:rs'] }, 'seo-geo': { title: '애드온 · SEO', enable: ['block:seo'] } },
  },
};
const NAMES = Object.keys(manifest.relations.presets);
function setup() {
  const d = tmp('fr-');
  const root = path.join(d, 'proj'); fs.mkdirSync(root);
  const paths = { profilePath: path.join(d, 'profile.json') };
  const project = { root, id: 'proj', configDir: path.join(d, 'cfg'), settingsPath: path.join(d, 'projects', 'proj', 'settings.json') };
  return { d, root, paths, project };
}
const enabledOf = (s) => resolve(manifest, [{ source: 'project', ...readJsonObject(s.project.settingsPath) }]).enabled;

// ── 정상 ─────────────────────────────────────────────────────────────
test('정상: 스택 감지 — package.json next/react → nextjs, Cargo.toml → rust, pom.xml(SB3) → java-modern, pyproject → python', () => {
  const s = setup();
  w(path.join(s.root, 'package.json'), JSON.stringify({ dependencies: { next: '15.0.0', react: '19' } }));
  assert.deepStrictEqual(detectStack(s.root).suggest, ['nextjs']);
  assert.match(detectStack(s.root).reasons.join(' '), /package\.json.*next/);
  const r = setup(); w(path.join(r.root, 'Cargo.toml'), '[package]\nname="x"\n');
  assert.deepStrictEqual(detectStack(r.root).suggest, ['rust']);
  const j = setup(); w(path.join(j.root, 'pom.xml'), '<parent><artifactId>spring-boot-starter-parent</artifactId><version>3.3.1</version></parent>');
  assert.deepStrictEqual(detectStack(j.root).suggest, ['java-modern']);
  const jl = setup(); w(path.join(jl.root, 'build.gradle'), "id 'org.springframework.boot' version '2.7.18'");
  assert.deepStrictEqual(detectStack(jl.root).suggest, ['java-legacy']);
  const p = setup(); w(path.join(p.root, 'pyproject.toml'), '[project]\nname="x"\n');
  assert.deepStrictEqual(detectStack(p.root).suggest, ['python']);
  const u = setup(); w(path.join(u.root, 'ProjectSettings', 'ProjectVersion.txt'), 'm_EditorVersion: 6000.0.1f1');
  assert.deepStrictEqual(detectStack(u.root).suggest, ['unity']);
});

test('정상: 번호 고르기 — 하나·여러 개(쉼표)·Enter=추천·0=안 고름', () => {
  assert.deepStrictEqual(parseChoice('2', NAMES, []), { presets: ['rust'] });
  assert.deepStrictEqual(parseChoice('1, 3', NAMES, []), { presets: ['nextjs', 'seo-geo'] });
  assert.deepStrictEqual(parseChoice('', NAMES, ['nextjs']), { presets: ['nextjs'] });
  assert.deepStrictEqual(parseChoice('', NAMES, []), { presets: [] });
  assert.deepStrictEqual(parseChoice('0', NAMES, ['nextjs']), { presets: [] });
  assert.deepStrictEqual(parseChoice('1,1', NAMES, []), { presets: ['nextjs'] }, '중복은 한 번');
});

test('정상: 고른 프리셋을 이 프로젝트 설정에 적용하고 "물어봤음" 기록, 고르지 않아도 기록', () => {
  const s = setup();
  const r = applyChoice({ manifest, paths: s.paths, project: s.project, presets: ['nextjs', 'seo-geo'], composeFn: () => {} });
  assert.deepStrictEqual(r.turnedOn.sort(), ['skill:react', 'skill:seo']);
  const st = readJsonObject(s.project.settingsPath);
  assert.deepStrictEqual(st.firstRun.presets, ['nextjs', 'seo-geo']);
  assert.ok(enabledOf(s).has('skill:react') && !enabledOf(s).has('skill:axum'));
  const n = setup();
  applyChoice({ manifest, paths: n.paths, project: n.project, presets: [], composeFn: () => {} });
  assert.deepStrictEqual(readJsonObject(n.project.settingsPath).firstRun.presets, []);
});

test('정상: 묻는 화면 — 추천 표시·애드온 표시·0 안 고름 안내', () => {
  const t = promptText({ projectId: 'my-ui', manifest, suggest: ['nextjs'], reasons: ['package.json 에 next'] });
  assert.match(t, /my-ui.*처음 실행/);
  assert.match(t, /1\) nextjs .*★ 추천/);
  assert.match(t, /3\) seo-geo .*애드온/);
  assert.match(t, /0\) 고르지 않음/);
  assert.match(t, /감지: package\.json 에 next/);
});

test('정상: runFirstRun — 가짜 터미널에 "2" 를 넣으면 rust 적용, 다음엔 묻지 않음', async () => {
  const s = setup();
  const input = new PassThrough(); const output = new PassThrough(); let shown = ''; output.on('data', (c) => { shown += c; });
  const p = runFirstRun({ manifest, paths: s.paths, project: s.project, input, output, composeFn: () => {} });
  input.write('2\n');
  const r = await p;
  assert.deepStrictEqual(r.presets, ['rust']);
  assert.ok(enabledOf(s).has('skill:axum'));
  assert.match(shown, /rust 를 이 프로젝트에 적용했습니다/);
  assert.strictEqual(shouldAsk({ project: s.project, argv: [], isTTY: true, env: {} }).ask, false);
});

// ── 악성·우회 ────────────────────────────────────────────────────────
test('악성: 범위 밖 번호·문자·셸 문자·음수·아주 긴 입력·너무 많은 선택 → 오류(아무것도 적용 안 함)', () => {
  for (const bad of ['9', '-1', 'abc', '1;rm -rf ~', '$(id)', '1 2', '1,,2', '1'.repeat(200), Array(20).fill('1').join(','), '\u0000', '０']) {
    const r = parseChoice(bad, NAMES, ['nextjs']);
    assert.ok(r.error, `${JSON.stringify(bad)} 는 오류여야 함: ${JSON.stringify(r)}`);
  }
});

test('악성: 프로젝트 파일이 링크로 밖을 가리키거나 너무 크면 감지에 쓰지 않음', () => {
  const s = setup();
  const outside = path.join(s.d, 'evil.json'); w(outside, JSON.stringify({ dependencies: { next: '1' } }));
  // 윈도우 권한 없으면(EPERM) 링크 부분은 건너뛰고 크기 시험만 — 그 PC 에선 공격자도 파일 심볼릭 링크를 못 만든다
  if (require('../.claude/hooks/lib/testfs').trySymlink(outside, path.join(s.root, 'package.json')) !== null) assert.deepStrictEqual(detectStack(s.root).suggest, []);
  const b = setup(); w(path.join(b.root, 'package.json'), JSON.stringify({ dependencies: { next: '1' }, pad: 'x'.repeat(2 * 1024 * 1024) }));
  assert.deepStrictEqual(detectStack(b.root).suggest, []);
});

test('악성: 잘못된 입력이면 다시 묻고(최대 3번), 그래도 틀리면 고르지 않음으로 기록 — 세션은 막지 않음', async () => {
  const s = setup();
  const input = new PassThrough(); const output = new PassThrough(); let shown = ''; output.on('data', (c) => { shown += c; });
  const p = runFirstRun({ manifest, paths: s.paths, project: s.project, input, output, composeFn: () => {} });
  input.write('x\n'); input.write('99\n'); input.write('$(id)\n');
  const r = await p;
  assert.deepStrictEqual(r.presets, []);
  assert.strictEqual((shown.match(/다시 입력/g) || []).length, 2);
  assert.deepStrictEqual(readJsonObject(s.project.settingsPath).firstRun.presets, []);
});

// ── 경계 ─────────────────────────────────────────────────────────────
test('경계: 묻지 않는 경우 — 터미널 아님, -p/--print, 끄는 환경변수, 이미 설정 있음, .gugbab.json 있음, 프리셋 없음', () => {
  const s = setup();
  assert.strictEqual(shouldAsk({ project: s.project, argv: [], isTTY: true, env: {}, manifest }).ask, true);
  assert.strictEqual(shouldAsk({ project: s.project, argv: [], isTTY: false, env: {}, manifest }).ask, false);
  assert.strictEqual(shouldAsk({ project: s.project, argv: ['-p', 'hi'], isTTY: true, env: {}, manifest }).ask, false);
  assert.strictEqual(shouldAsk({ project: s.project, argv: ['--print'], isTTY: true, env: {}, manifest }).ask, false);
  assert.strictEqual(shouldAsk({ project: s.project, argv: [], isTTY: true, env: { GUGBAB_NO_FIRST_RUN: '1' }, manifest }).ask, false);
  assert.strictEqual(shouldAsk({ project: s.project, argv: [], isTTY: true, env: {}, manifest: { items: {}, relations: {} } }).ask, false);
  w(path.join(s.root, '.gugbab.json'), '{}');
  assert.strictEqual(shouldAsk({ project: s.project, argv: [], isTTY: true, env: {}, manifest }).ask, false);
  const e = setup(); w(e.project.settingsPath, JSON.stringify({ disable: ['hook:x'] }));
  assert.strictEqual(shouldAsk({ project: e.project, argv: [], isTTY: true, env: {}, manifest }).ask, false, '이미 켜고 끈 프로젝트는 묻지 않음');
});

test('경계: 아무것도 감지 안 되면 추천 없음, 여러 스택이면 추천 여러 개(중복 없이)', () => {
  const s = setup();
  assert.deepStrictEqual(detectStack(s.root), { suggest: [], reasons: [] });
  w(path.join(s.root, 'package.json'), '{broken');
  assert.deepStrictEqual(detectStack(s.root).suggest, [], '깨진 package.json 은 무시');
  const m = setup();
  w(path.join(m.root, 'package.json'), JSON.stringify({ devDependencies: { react: '18' } }));
  w(path.join(m.root, 'Cargo.toml'), '[package]');
  assert.deepStrictEqual(detectStack(m.root).suggest, ['nextjs', 'rust']);
});

test('경계: 입력이 바로 끝나면(EOF) 추천을 고른 것으로 보지 않고 고르지 않음으로 기록', async () => {
  const s = setup();
  const input = new PassThrough(); const output = new PassThrough();
  const p = runFirstRun({ manifest, paths: s.paths, project: s.project, input, output, composeFn: () => {} });
  input.end();
  const r = await p;
  assert.deepStrictEqual(r.presets, []);
});
