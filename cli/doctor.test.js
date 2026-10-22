// doctor.js — 설치·조립 상태 점검
// 정상 / 악성·우회 / 경계 3계층 (외부 명령은 주입한 가짜로 시험)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runDoctor, findGitBash } = require('./doctor');
const { trySymlink } = require('../.claude/hooks/lib/testfs');
const winfs = require('./winfs');

const tmp = (p) => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), p)));
const w = (f, s = '') => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

function setup() {
  const code = tmp('dr-code-');
  w(path.join(code, '.claude/rules/git.md'));
  w(path.join(code, 'manifest.json'), JSON.stringify({ items: { 'rule:git.md': { type: 'rule', state: 'on', path: '.claude/rules/git.md' } } }));
  const data = tmp('dr-data-');
  const cfg = path.join(data, 'projects', 'p', '.claude');
  fs.mkdirSync(path.join(cfg, 'rules'), { recursive: true });
  const paths = { codeHome: code, manifestPath: path.join(code, 'manifest.json'), dataDir: data, home: tmp('dr-home-') };
  const project = { id: 'p', root: code, configDir: cfg };
  return { code, data, cfg, paths, project };
}
const okExec = (cmd, args) => {
  if (cmd === 'claude') return '2.1.296 (Claude Code)';
  if (cmd === 'security') return '';
  if (cmd === 'comux') return 'usage: comux split send';
  throw new Error('없음');
};
const levels = (r) => Object.fromEntries(r.map(x => [x.key, x.level]));

test('정상: 다 갖춰지면 ok', () => {
  const s = setup();
  const r = runDoctor({ paths: s.paths, project: s.project, exec: okExec, env: {}, platform: 'darwin', nodeVersion: 'v22.23.1' });
  const l = levels(r);
  assert.strictEqual(l.node, 'ok');
  assert.strictEqual(l.claude, 'ok');
  assert.strictEqual(l.manifest, 'ok');
  assert.strictEqual(l.login, 'ok');
  assert.ok(r.find(x => x.key === 'login').msg.includes('CLAUDE_SECURESTORAGE_CONFIG_DIR'), '내부 변수 의존을 매번 알림');
});

test('악성: 설정 폴더 링크가 하네스 밖이나 없는 곳을 가리키면 경고', (t) => {
  const s = setup();
  if (trySymlink('/etc/hosts', path.join(s.cfg, 'rules', 'evil.md')) === null) return t.skip('윈도우 심볼릭 링크 권한 없음 — junction 판은 아래 시험');
  fs.symlinkSync(path.join(s.code, 'nope.md'), path.join(s.cfg, 'rules', 'broken.md'));
  const r = runDoctor({ paths: s.paths, project: s.project, exec: okExec, env: {}, platform: 'darwin', nodeVersion: 'v22.0.0' });
  const links = r.find(x => x.key === 'links');
  assert.strictEqual(links.level, 'warn');
  assert.ok(links.msg.includes('evil.md') && links.msg.includes('broken.md'));
});

test('악성: manifest 가 없는 파일을 가리키면 fail', () => {
  const s = setup();
  fs.rmSync(path.join(s.code, '.claude/rules/git.md'));
  const r = runDoctor({ paths: s.paths, project: s.project, exec: okExec, env: {}, platform: 'darwin', nodeVersion: 'v22.0.0' });
  assert.strictEqual(levels(r).manifest, 'fail');
});

test('경계: node 18 미만·claude 없음·키체인 항목 없음·manifest 깨짐', () => {
  const s = setup();
  fs.writeFileSync(s.paths.manifestPath, '{broken');
  const none = () => { throw new Error('없음'); };
  const r = runDoctor({ paths: s.paths, project: s.project, exec: none, env: {}, platform: 'darwin', nodeVersion: 'v16.20.0' });
  const l = levels(r);
  assert.strictEqual(l.node, 'fail');
  assert.strictEqual(l.claude, 'fail');
  assert.strictEqual(l.manifest, 'fail');
  assert.strictEqual(l.login, 'warn');
});

test('경계: macOS 가 아니면 로그인 점검은 건너뛴다는 안내, comux·tmux 감지', () => {
  const s = setup();
  const r = runDoctor({ paths: s.paths, project: s.project, exec: okExec, env: { COPAD_MUX: '1' }, platform: 'linux', nodeVersion: 'v20.0.0' });
  assert.strictEqual(levels(r).login, 'info');
  assert.match(r.find(x => x.key === 'mux').msg, /comux/);
  const r2 = runDoctor({ paths: s.paths, project: null, exec: okExec, env: { TMUX: '/t' }, platform: 'darwin', nodeVersion: 'v20.0.0' });
  assert.match(r2.find(x => x.key === 'mux').msg, /tmux/);
  assert.ok(!r2.some(x => x.key === 'links'), '프로젝트가 없으면 링크 점검 생략');
});

test('정상·경계: Claude Code 최신 여부 줄 — 훅 기록이 있으면 표시(새 버전이면 경고), 없거나 깨지면 줄 없음', () => {
  const s = setup();
  const hooksDir = path.join(s.code, '.claude', 'hooks');
  fs.mkdirSync(hooksDir, { recursive: true });
  fs.copyFileSync(path.join(__dirname, '..', '.claude', 'hooks', 'claude-version-check.js'), path.join(hooksDir, 'claude-version-check.js'));
  const state = path.join(s.data, 'state');
  const paths = { ...s.paths, harnessRoot: path.join(s.code, '.claude'), stateDir: state };
  assert.ok(!runDoctor({ paths, project: s.project, exec: okExec, env: {}, platform: 'darwin' }).some(x => x.key === 'claudeLatest'));
  w(path.join(state, 'claude-version.json'), JSON.stringify({ lastSeen: '2.1.296', latest: '2.1.302', latestCheckedAt: Date.now() }));
  const r = runDoctor({ paths, project: s.project, exec: okExec, env: {}, platform: 'darwin' }).find(x => x.key === 'claudeLatest');
  assert.ok(r && r.level === 'warn' && /2\.1\.302/.test(r.msg), JSON.stringify(r));
  w(path.join(state, 'claude-version.json'), '{broken');
  assert.ok(!runDoctor({ paths, project: s.project, exec: okExec, env: {}, platform: 'darwin' }).some(x => x.key === 'claudeLatest'));
});

test('정상·경계: 하네스 버전 줄 — 개발 모드 표시, git 저장소가 아니어도 죽지 않음, stateDir 없으면 줄 없음', () => {
  const s = setup();
  const r = runDoctor({ paths: { ...s.paths, stateDir: path.join(s.data, 'state'), dev: true }, project: s.project, exec: okExec, env: {}, platform: 'darwin' });
  const v = r.find(x => x.key === 'version');
  assert.ok(v, '버전 줄 없음');
  assert.match(v.msg, /하네스 \? \(git 저장소가 아님\)/);
  assert.ok(!runDoctor({ paths: s.paths, project: s.project, exec: okExec, env: {}, platform: 'darwin' }).some(x => x.key === 'version'));
});

// ── 윈도우 (2026-10-20) ──
test('정상: 윈도우 — 로그인 파일·Git Bash 점검', () => {
  const s = setup();
  w(path.join(s.paths.home, '.claude', '.credentials.json'), '{}');
  const pf = tmp('dr-pf-'); w(path.join(pf, 'Git', 'bin', 'bash.exe'));
  const r = runDoctor({ paths: s.paths, project: s.project, exec: okExec, env: { ProgramFiles: pf }, platform: 'win32', nodeVersion: 'v22.0.0' });
  const lv = levels(r);
  assert.strictEqual(lv.login, 'ok');
  assert.strictEqual(lv.gitBash, 'ok');
  assert.match(r.find(x => x.key === 'mux').msg, /새 창/);
});

test('악성: 윈도우 — Git Bash 가 없으면 fail(훅이 PowerShell 로 떨어져 가드가 꺼짐), 로그인 파일 없으면 warn', () => {
  const s = setup();
  const r = runDoctor({ paths: s.paths, project: s.project, exec: okExec, env: { ProgramFiles: tmp('dr-empty-'), PATH: '' }, platform: 'win32', nodeVersion: 'v22.0.0' });
  const lv = levels(r);
  assert.strictEqual(lv.gitBash, 'fail');
  assert.strictEqual(lv.login, 'warn');
});

test('악성: Git Bash 후보 — PATH 의 git 폴더에서 찾되, 이름만 비슷한 폴더·폴더로 된 bash.exe 는 아님', () => {
  const root = tmp('dr-git-');
  w(path.join(root, 'Git', 'bin', 'bash.exe'));
  assert.strictEqual(findGitBash({ PATH: path.join(root, 'Git', 'cmd') }), path.join(root, 'Git', 'bin', 'bash.exe'));
  assert.strictEqual(findGitBash({ PATH: path.join(root, 'legit', 'cmd') }), null);
  const dirAsExe = tmp('dr-git2-'); fs.mkdirSync(path.join(dirAsExe, 'Git', 'bin', 'bash.exe'), { recursive: true });
  assert.strictEqual(findGitBash({ ProgramFiles: dirAsExe }), null);
  assert.strictEqual(findGitBash({}), null);
});

test('악성(윈도우): 설정 폴더 안 junction 이 하네스 밖을 가리키면 경고 (권한 없이 만드는 링크)', { skip: process.platform !== 'win32' && '윈도우 전용' }, () => {
  const s = setup();
  const outside = tmp('dr-out-');
  fs.mkdirSync(path.join(s.cfg, 'skills'), { recursive: true });
  winfs.makeLink(outside, path.join(s.cfg, 'skills', 'evil'));
  const r = runDoctor({ paths: s.paths, project: s.project, exec: okExec, env: {}, platform: 'win32', nodeVersion: 'v22.0.0' });
  const links = r.find(x => x.key === 'links');
  assert.strictEqual(links.level, 'warn');
  assert.ok(links.msg.includes('evil'));
});
