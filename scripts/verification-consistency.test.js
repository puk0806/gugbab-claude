'use strict';
// verification-consistency.test.js — verification.md ↔ SKILL.md 일관성 회귀 검사 (2026-09-30)
//
// 배경: 2026-09-28~29 전수 재검증 후에도 verification.md 날짜 4곳 불일치 39개가 남아 있었다.
//   staleness-check 는 "최신 날짜를 검증일로 채택" 하므로 한 곳만 갱신돼도 통과해 불일치를 가렸다.
//   이 테스트는 파일 하나의 형식이 아니라 **파일 간 일관성**(frontmatter date · 메타 표 · SKILL.md)을 본다.
//
// 3계층 (rules/adversarial-testing.md):
//  - 정상: 레포 실물 전수 검사(필수 키·status 집합·경로 일치·1:1 짝·날짜 3곳 일치) + 정상 픽스처 통과
//  - 악성·오남용: 날짜 위장(주석 붙은 frontmatter 값·미래 날짜·달력상 무효일·코드펜스 안 가짜 행·심볼릭 SKILL.md)이
//      일치로 통과하지 못하는지
//  - 경계·이상: 파일 부재·빈 파일·frontmatter 없음·날짜 없는 셀·CRLF·판독 불가 입력에서 예외 없이 문제로 보고
//
// 날짜 판독 로직은 .claude/hooks/staleness-check.js 의 함수를 그대로 재사용한다(판독 규칙 이원화 방지).

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');
const DOCS = path.join(REPO, 'docs', 'skills');
const SKILLS = path.join(REPO, '.claude', 'skills');
const { checkDateConsistency, collectDateSources, scanConsistency } = require(path.join(REPO, '.claude', 'hooks', 'staleness-check.js'));

const ALLOWED_STATUS = new Set(['APPROVED', 'PENDING_TEST', 'NEEDS_REVISION']); // UNVERIFIED 는 verification-guard 가 저장 차단
const REQUIRED_KEYS = ['skill', 'category', 'version', 'date', 'status'];

function listVerifications() {
  const out = [];
  for (const cat of fs.readdirSync(DOCS, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    for (const name of fs.readdirSync(path.join(DOCS, cat.name), { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      const v = path.join(DOCS, cat.name, name.name, 'verification.md');
      if (fs.existsSync(v)) out.push({ category: cat.name, name: name.name, file: v });
    }
  }
  return out;
}

function frontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
  if (!m) return null;
  const kv = {};
  for (const line of m[1].split(/\r?\n/)) {
    const k = /^([A-Za-z_][\w-]*):[ \t]*(.*?)[ \t]*$/.exec(line);
    if (k) kv[k[1]] = k[2].replace(/^["']|["']$/g, '');
  }
  return kv;
}

// ── 정상: 레포 실물 전수 ───────────────────────────────────────────────
const all = listVerifications();

test('레포에 verification.md 가 실제로 존재한다 (빈 순회로 통과하는 가짜 성공 방지)', () => {
  assert.ok(all.length >= 100, `verification.md ${all.length}개 — 경로 오류로 순회가 비었을 가능성`);
});

test('모든 verification.md: frontmatter·필수 키·status 허용 집합·경로 일치', () => {
  const bad = [];
  for (const { category, name, file } of all) {
    const rel = `${category}/${name}`;
    const fm = frontmatter(fs.readFileSync(file, 'utf8'));
    if (!fm) { bad.push(`${rel}: frontmatter 없음`); continue; }
    for (const k of REQUIRED_KEYS) if (!fm[k]) bad.push(`${rel}: 필수 키 ${k} 없음`);
    if (fm.status && !ALLOWED_STATUS.has(fm.status)) bad.push(`${rel}: status "${fm.status}" 허용 밖`);
    if (fm.skill && fm.skill !== name) bad.push(`${rel}: frontmatter skill="${fm.skill}" ≠ 경로 "${name}"`);
    if (fm.category && fm.category !== category) bad.push(`${rel}: frontmatter category="${fm.category}" ≠ 경로 "${category}"`);
  }
  assert.deepStrictEqual(bad, []);
});

test('모든 verification.md: 메타 표 "| 검증일 |" 행 존재', () => {
  const bad = all.filter(({ file }) => !/^\|\s*\**검증일\**\s*\|/m.test(fs.readFileSync(file, 'utf8'))).map(v => `${v.category}/${v.name}`);
  assert.deepStrictEqual(bad, []);
});

test('verification.md ↔ SKILL.md 1:1 (양방향, 심볼릭 링크 SKILL.md 불허)', () => {
  const bad = [];
  for (const { category, name } of all) {
    const skill = path.join(SKILLS, category, name, 'SKILL.md');
    let st = null;
    try { st = fs.lstatSync(skill); } catch {}
    if (!st || !st.isFile()) bad.push(`${category}/${name}: 짝 SKILL.md 없음(또는 일반 파일 아님)`);
  }
  // 역방향: verification.md 없는 SKILL.md
  for (const cat of fs.readdirSync(SKILLS, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    for (const name of fs.readdirSync(path.join(SKILLS, cat.name), { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      if (!fs.existsSync(path.join(SKILLS, cat.name, name.name, 'SKILL.md'))) continue;
      if (!fs.existsSync(path.join(DOCS, cat.name, name.name, 'verification.md'))) bad.push(`${cat.name}/${name.name}: verification.md 없음`);
    }
  }
  assert.deepStrictEqual(bad, []);
});

test('날짜 3곳 일치: frontmatter date == 메타 표 검증일(최신) == SKILL.md "> 검증일:"(최신)', () => {
  const problems = scanConsistency(DOCS, SKILLS);
  assert.deepStrictEqual(problems.map(p => `${p.rel}: ${p.problems.join('; ')}`), []);
});

// ── 픽스처 헬퍼 ───────────────────────────────────────────────────────
function mkFixture({ fm = '2026-09-01', meta = '2026-09-01', skill = '2026-09-01', fmLine, skillLine, rawVerif, skillAsSymlink } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'verif-cons-'));
  const v = path.join(root, 'verification.md');
  const s = path.join(root, 'SKILL.md');
  fs.writeFileSync(v, rawVerif ?? `---\nskill: x\ncategory: y\nversion: v1\n${fmLine ?? (fm === null ? '' : `date: ${fm}`)}\nstatus: APPROVED\n---\n\n# x\n\n## 메타 정보\n\n| 항목 | 내용 |\n|---|---|\n${meta === null ? '' : `| 검증일 | ${meta} |\n`}`);
  if (skillAsSymlink) {
    const outside = path.join(root, 'outside.md');
    fs.writeFileSync(outside, `# x\n\n> 검증일: ${skill}\n`);
    fs.symlinkSync(outside, s);
  } else if (skill !== null) {
    fs.writeFileSync(s, skillLine ?? `---\nname: x\n---\n\n# x\n\n> 검증일: ${skill}\n`);
  }
  return { root, v, s };
}
const cleanup = (f) => fs.rmSync(f.root, { recursive: true, force: true });
const check = (opts) => { const f = mkFixture(opts); try { return checkDateConsistency(f.v, opts && opts.noSkillPath ? null : f.s); } finally { cleanup(f); } };

// ── 정상 픽스처 ───────────────────────────────────────────────────────
test('정상: 세 곳이 같으면 문제 없음', () => {
  assert.deepStrictEqual(check(), []);
});

test('정상: 메타 표·SKILL.md 줄에 최초/재검증이 병기돼도 최신 날짜가 같으면 일치', () => {
  assert.deepStrictEqual(check({ fm: '2026-09-26', meta: '2026-04-23 (재검증: 2026-09-26)', skill: '2026-04-23 (재검증: 2026-09-26 — 변경 없음)' }), []);
});

// ── 악성·오남용: 위장이 일치로 통과하면 안 된다 ────────────────────────
test('악성: 세 곳 중 한 곳이 오래된 날짜면 불일치로 보고 (최신값 채택이 가리던 케이스)', () => {
  const p = check({ fm: '2026-09-26', meta: '2026-09-26', skill: '2026-04-23' });
  assert.ok(p.some(x => x.startsWith('날짜 불일치')), p.join('|'));
  assert.ok(check({ fm: '2026-04-23', meta: '2026-09-26', skill: '2026-09-26' }).some(x => x.startsWith('날짜 불일치')));
  assert.ok(check({ fm: '2026-09-26', meta: '2026-04-23', skill: '2026-09-26' }).some(x => x.startsWith('날짜 불일치')));
});

test('악성: frontmatter date 에 주석을 붙인 값("2026-09-01 (최초: …)")은 판독 불가로 보고', () => {
  const p = check({ fmLine: 'date: 2026-09-01 (최초: 2026-04-01)' });
  assert.ok(p.includes('frontmatter date 판독 불가'), p.join('|'));
});

test('악성: 미래 날짜("영원히 신선" 위장)는 판독 불가', () => {
  const p = check({ fm: '2099-01-01', meta: '2099-01-01', skill: '2099-01-01' });
  assert.ok(p.filter(x => x.includes('판독 불가')).length === 3, p.join('|'));
});

test('악성: 달력상 무효일(2026-02-30)은 판독 불가', () => {
  const p = check({ fm: '2026-02-30', meta: '2026-02-30', skill: '2026-02-30' });
  assert.ok(p.filter(x => x.includes('판독 불가')).length === 3, p.join('|'));
});

test('악성: 코드펜스 안의 가짜 메타 표 행은 메타 표로 인정하지 않음', () => {
  const raw = '---\nskill: x\ncategory: y\nversion: v1\ndate: 2026-09-01\nstatus: APPROVED\n---\n\n```\n| 검증일 | 2026-09-01 |\n```\n';
  const p = check({ rawVerif: raw });
  assert.ok(p.includes('메타 표 검증일 없음'), p.join('|'));
});

test('악성: 코드펜스 안의 가짜 SKILL.md "> 검증일:" 은 무시', () => {
  const p = check({ skillLine: '# x\n\n```\n> 검증일: 2026-09-01\n```\n' });
  assert.ok(p.includes('SKILL.md > 검증일 없음'), p.join('|'));
});

test('악성: 심볼릭 링크 SKILL.md(외부 파일로 신선 위장)는 읽지 않아 SKILL.md 없음으로 보고', () => {
  const p = check({ skillAsSymlink: true });
  assert.ok(p.includes('SKILL.md > 검증일 없음'), p.join('|'));
});

test('악성: 첫 줄만 유효 — 뒤에 가짜 "> 검증일:" 을 덧붙여 신선 위장해도 첫 매치(오래된 값)로 불일치 보고', () => {
  const p = check({ fm: '2026-09-26', meta: '2026-09-26', skillLine: '# x\n\n> 검증일: 2026-04-23\n\n본문\n\n> 검증일: 2026-09-26\n' });
  assert.ok(p.some(x => x.startsWith('날짜 불일치')), p.join('|'));
});

// ── 경계·이상 ─────────────────────────────────────────────────────────
test('경계: frontmatter 없음 / date 키 없음 → 예외 없이 "없음" 보고', () => {
  assert.ok(check({ rawVerif: '# x\n\n| 검증일 | 2026-09-01 |\n' }).includes('frontmatter date 없음'));
  assert.ok(check({ fm: null }).includes('frontmatter date 없음'));
});

test('경계: 메타 표 행 없음 / 날짜 없는 셀 → 없음·판독 불가 구분', () => {
  assert.ok(check({ meta: null }).includes('메타 표 검증일 없음'));
  assert.ok(check({ meta: '확인 필요' }).includes('메타 표 검증일 판독 불가'));
});

test('경계: SKILL.md 없음·경로 null → "없음" 보고 (예외 없음)', () => {
  assert.ok(check({ skill: null }).includes('SKILL.md > 검증일 없음'));
  assert.ok(check({ noSkillPath: true }).includes('SKILL.md > 검증일 없음'));
});

test('경계: 존재하지 않는 verification.md / 빈 파일도 예외 없이 문제 목록 반환', () => {
  const ghost = checkDateConsistency(path.join(os.tmpdir(), 'no-such-dir-xyz', 'verification.md'), null);
  assert.strictEqual(ghost.length, 3);
  const f = mkFixture({ rawVerif: '' });
  try { assert.ok(checkDateConsistency(f.v, f.s).includes('frontmatter date 없음')); } finally { cleanup(f); }
});

test('경계: CRLF 줄바꿈 frontmatter·초장문 셀도 정상 판독', () => {
  const raw = '---\r\nskill: x\r\ncategory: y\r\nversion: v1\r\ndate: 2026-09-01\r\nstatus: APPROVED\r\n---\r\n\r\n| 검증일 | 2026-09-01 |\r\n';
  assert.deepStrictEqual(check({ rawVerif: raw }), []);
  const long = `${'가'.repeat(50000)} 2026-09-01`;
  const f = mkFixture({ meta: long });
  try { assert.strictEqual(collectDateSources(f.v, f.s).meta, '2026-09-01'); } finally { cleanup(f); }
});
