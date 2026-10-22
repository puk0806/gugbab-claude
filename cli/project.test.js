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

// 대소문자 무시 파일 시스템(맥 APFS 기본·윈도우 NTFS)인가 — 대문자로 바꾼 이름으로도 열리면 그렇다
function caseInsensitive(dir) {
  const up = path.join(path.dirname(dir), path.basename(dir).toUpperCase());
  return up !== dir && fs.existsSync(up);
}

test('정상: 대소문자만 다르게 연 같은 git 레포는 같은 프로젝트 (2026-10-22 — 윈도우 realpath .native 변경 뒤 맥 확인)', (t) => {
  const data = tmp('pp-data-');
  const repo = path.join(fs.realpathSync(tmp('pp-case-')), 'MyProj');
  fs.mkdirSync(path.join(repo, 'sub'), { recursive: true });
  execSync('git init -q', { cwd: repo });
  if (!caseInsensitive(repo)) { t.skip('대소문자를 구분하는 파일 시스템 — 다른 폴더라 시험 대상 아님'); return; }
  const a = resolveProject(repo, data);
  const b = resolveProject(path.join(path.dirname(repo), 'myproj', 'sub'), data);
  const c = resolveProject(path.join(path.dirname(repo), 'MYPROJ'), data);
  assert.strictEqual(a.root, repo);
  assert.deepStrictEqual([b.root, c.root], [repo, repo], '실제 표기로 모임');
  assert.deepStrictEqual([b.id, c.id], [a.id, a.id]);
  const idx = JSON.parse(fs.readFileSync(path.join(data, 'projects', 'index.json'), 'utf8'));
  assert.strictEqual(Object.keys(idx).length, 1, 'index 에 한 줄만');
});

test('정상(윈도우): git 이 아닌 폴더도 대소문자만 다른 경로는 같은 프로젝트 (.native realpath)', { skip: process.platform !== 'win32' && '윈도우 realpath.native 시험' }, () => {
  const data = tmp('pp-data-');
  const dir = path.join(fs.realpathSync.native(tmp('pp-nc-')), 'Plain');
  fs.mkdirSync(dir);
  const a = resolveProject(dir, data);
  const b = resolveProject(path.join(path.dirname(dir), 'PLAIN'), data);
  assert.strictEqual(b.root, a.root);
  assert.strictEqual(b.id, a.id);
});

test('악성: 다른 프로젝트를 가리키는 심볼릭 링크로 열면 링크 이름이 아니라 실제 위치의 프로젝트', { skip: process.platform === 'win32' && '윈도우는 심볼릭 링크 권한이 없을 수 있음 — junction 시험은 compose 쪽' }, () => {
  const data = tmp('pp-data-');
  const base = fs.realpathSync(tmp('pp-ln-'));
  const real = path.join(base, 'real-proj'); fs.mkdirSync(real);
  execSync('git init -q', { cwd: real });
  fs.symlinkSync(real, path.join(base, 'innocent-name'));
  const viaLink = resolveProject(path.join(base, 'innocent-name'), data);
  assert.strictEqual(viaLink.root, real);
  assert.strictEqual(viaLink.id, 'real-proj');
  assert.strictEqual(resolveProject(real, data).id, viaLink.id);
});

test('경계: index.json 을 쓴 뒤 임시 파일이 남지 않고, 여러 번 열어도 내용이 깨지지 않음', () => {
  const data = tmp('pp-data-');
  const base = fs.realpathSync(tmp('pp-many-'));
  for (const n of ['a', 'b', 'c']) { fs.mkdirSync(path.join(base, n)); resolveProject(path.join(base, n), data); }
  const files = fs.readdirSync(path.join(data, 'projects'));
  assert.deepStrictEqual(files.filter(f => f.endsWith('.tmp')), []);
  const idx = JSON.parse(fs.readFileSync(path.join(data, 'projects', 'index.json'), 'utf8'));
  assert.deepStrictEqual(Object.values(idx).sort(), ['a', 'b', 'c']);
});

test('경계: 루트(/)·공백 경로', () => {
  const data = tmp('pp-data-');
  assert.strictEqual(resolveProject('/', data).id, 'root');
  const sp = path.join(fs.realpathSync(tmp('pp-sp-')), 'a b');
  fs.mkdirSync(sp);
  assert.strictEqual(resolveProject(sp, data).id, 'a-b');
});
