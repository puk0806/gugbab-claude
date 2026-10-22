// inv.test.js — 레포의 스킬·에이전트·룰·커맨드 목록 추출(inv.js)을 임시 레포로 실제 실행해 시험
// 정상 / 악성·이상 입력 / 경계(CRLF 체크아웃) 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const INV = path.join(__dirname, 'inv.js');
const SK = 'SKILL' + '.md';

function repo(files) {
  const r = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-'));
  for (const d of ['docs/skills/frontend', '.claude/skills', '.claude/agents/meta', '.claude/rules', '.claude/commands']) fs.mkdirSync(path.join(r, d), { recursive: true });
  for (const [p, t] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(r, p)), { recursive: true }); fs.writeFileSync(path.join(r, p), t); }
  return r;
}
function run(r) {
  const out = path.join(r, 'inv.json');
  const p = spawnSync(process.execPath, [INV, r, out], { encoding: 'utf8' });
  return { p, j: p.status === 0 ? JSON.parse(fs.readFileSync(out, 'utf8')) : null };
}
const crlf = (s) => s.replace(/\n/g, '\r\n');

test('정상: LF frontmatter — 설명·카테고리·모델·참조 스킬을 읽음', () => {
  const r = repo({
    [`.claude/skills/alpha/${SK}`]: '---\nname: alpha\ndescription: 알파 스킬\n---\n본문\n',
    'docs/skills/frontend/alpha/verification.md': 'x',
    '.claude/agents/meta/maker.md': '---\nname: maker\ndescription: 만드는 에이전트\nmodel: sonnet\n---\nalpha 스킬을 쓴다\n',
    '.claude/rules/git.md': '# Git 규칙\n',
    '.claude/commands/commit.md': '---\ndescription: 커밋\n---\n',
  });
  const { p, j } = run(r);
  assert.strictEqual(p.status, 0, p.stderr);
  assert.deepStrictEqual(j.skills, [{ n: 'alpha', c: 'frontend', d: '알파 스킬' }]);
  assert.strictEqual(j.agents[0].m, 'sonnet');
  assert.deepStrictEqual(j.agents[0].skills, ['alpha']);
  assert.strictEqual(j.rules[0].h, 'Git 규칙');
  assert.strictEqual(j.cmds[0].d, '커밋');
});

test('경계: CRLF 체크아웃(윈도우 autocrlf)도 LF 와 같은 결과 — 설명 끝에 \\r 이 붙지 않음', () => {
  const lf = {
    [`.claude/skills/beta/${SK}`]: '---\nname: beta\ndescription: >\n  여러 줄\n  설명\n---\n본문\n',
    '.claude/agents/meta/a.md': '---\nname: a\ndescription: 에이전트\nmodel: opus\n---\nbeta\n',
    '.claude/rules/r.md': '---\npaths: src/**\n---\n# 룰 제목\n',
    '.claude/commands/c.md': '---\ndescription: 명령\n---\n',
  };
  const a = run(repo(lf)).j;
  const b = run(repo(Object.fromEntries(Object.entries(lf).map(([k, v]) => [k, crlf(v)])))).j;
  assert.deepStrictEqual(b.skills, a.skills);
  assert.strictEqual(b.agents[0].m, 'opus');
  assert.strictEqual(b.rules[0].paths, 'src/**');
  assert.strictEqual(b.cmds[0].d, '명령');
  assert.ok(!JSON.stringify(b).includes('\\r'), JSON.stringify(b));
});

test('악성·이상: frontmatter 없음·닫는 줄 없음·\\r 만 있는 파일은 빈 설명으로 넘어가고 멈추지 않음', () => {
  const r = repo({
    [`.claude/skills/none/${SK}`]: '본문만\n',
    [`.claude/skills/open/${SK}`]: '---\nname: open\ndescription: 닫히지 않음\n',
    [`.claude/skills/cr/${SK}`]: '---\rname: cr\rdescription: 옛 맥 줄바꿈\r---\r',
    '.claude/agents/meta/x.md': '<script>alert(1)</script>\n',
  });
  const { p, j } = run(r);
  assert.strictEqual(p.status, 0, p.stderr);
  const d = Object.fromEntries(j.skills.map(s => [s.n, s.d]));
  assert.strictEqual(d.none, '');
  assert.strictEqual(d.open, '');
  assert.strictEqual(d.cr, '옛 맥 줄바꿈'); // \r 만 쓴 파일도 줄로 본다
  assert.strictEqual(j.agents[0].d, '');
});
