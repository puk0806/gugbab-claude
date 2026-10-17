// doctor.js — 설치·조립 상태 점검
// 정상 / 악성·우회 / 경계 3계층 (외부 명령은 주입한 가짜로 시험)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runDoctor } = require('./doctor');

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

test('악성: 설정 폴더 링크가 하네스 밖이나 없는 곳을 가리키면 경고', () => {
  const s = setup();
  fs.symlinkSync('/etc/hosts', path.join(s.cfg, 'rules', 'evil.md'));
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
