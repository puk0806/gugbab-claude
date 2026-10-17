// paths.js·project.js — 위치 계산, 프로젝트 이름·설정 폴더
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const { resolveProject, projectRoot, safeName } = require('./project');

const tmp = (p) => fs.mkdtempSync(path.join(os.tmpdir(), p));

test('정상: git 최상위를 프로젝트로, 설정 폴더는 projects/<이름>/.claude', () => {
  const data = tmp('pp-data-');
  const repo = fs.realpathSync(tmp('pp-repo-'));
  execSync('git init -q', { cwd: repo });
  fs.mkdirSync(path.join(repo, 'src', 'deep'), { recursive: true });
  const p = resolveProject(path.join(repo, 'src', 'deep'), data);
  assert.strictEqual(p.root, repo);
  assert.strictEqual(p.id, path.basename(repo));
  assert.strictEqual(p.configDir, path.join(data, 'projects', p.id, '.claude'));
  assert.strictEqual(resolveProject(repo, data).id, p.id, '같은 프로젝트는 같은 이름');
  const idx = JSON.parse(fs.readFileSync(path.join(data, 'projects', 'index.json'), 'utf8'));
  assert.strictEqual(idx[repo], p.id);
});

test('정상: 폴더 이름이 같은 다른 프로젝트는 해시를 붙여 구분', () => {
  const data = tmp('pp-data-');
  const a = path.join(fs.realpathSync(tmp('pp-a-')), 'my-ui');
  const b = path.join(fs.realpathSync(tmp('pp-b-')), 'my-ui');
  fs.mkdirSync(a); fs.mkdirSync(b);
  const pa = resolveProject(a, data);
  const pb = resolveProject(b, data);
  assert.strictEqual(pa.id, 'my-ui');
  assert.match(pb.id, /^my-ui-[0-9a-f]{4}$/);
  assert.notStrictEqual(pa.configDir, pb.configDir);
});

test('악성: 폴더 이름의 경로 조작·특수문자는 안전한 이름으로', () => {
  assert.strictEqual(safeName('..'), 'project');
  assert.strictEqual(safeName('a/b'), 'a-b');
  assert.strictEqual(safeName('$(rm -rf ~)'), '--rm--rf---');
  assert.strictEqual(safeName('한글 폴더'), '-----');
  assert.ok(!safeName('.hidden').startsWith('.'));
  assert.strictEqual(safeName('x'.repeat(200)).length, 64);
});

test('악성: index.json 이 설정 폴더 밖을 가리키도록 변조돼도 projects 밖으로 나가지 않음', () => {
  const data = tmp('pp-data-');
  const dir = fs.realpathSync(tmp('pp-x-'));
  fs.mkdirSync(path.join(data, 'projects'), { recursive: true });
  fs.writeFileSync(path.join(data, 'projects', 'index.json'), JSON.stringify({ [dir]: '../../etc' }));
  const p = resolveProject(dir, data);
  assert.ok(p.configDir.startsWith(path.join(data, 'projects') + path.sep), p.configDir);
  assert.ok(!p.id.includes('..'));
});

test('경계: git 레포가 아니면 현재 폴더, 깨진 index.json 은 새로 만듦', () => {
  const data = tmp('pp-data-');
  fs.mkdirSync(path.join(data, 'projects'), { recursive: true });
  fs.writeFileSync(path.join(data, 'projects', 'index.json'), '{broken');
  const dir = fs.realpathSync(tmp('pp-nogit-'));
  assert.strictEqual(projectRoot(dir), dir);
  assert.doesNotThrow(() => resolveProject(dir, data));
});

test('경계: 루트(/)·공백 경로', () => {
  const data = tmp('pp-data-');
  assert.strictEqual(resolveProject('/', data).id, 'root');
  const sp = path.join(fs.realpathSync(tmp('pp-sp-')), 'a b');
  fs.mkdirSync(sp);
  assert.strictEqual(resolveProject(sp, data).id, 'a-b');
});
