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

// 스킬 본체는 1단 .claude/skills/<name>/SKILL.md (2026-10-05 평탄화 — Claude Code 는 2단 중첩을 스킬로 등록하지
// 않았다), 짝 검증 문서는 docs/skills/<category>/<name>/verification.md. 카테고리 단일 원천은 docs 위치다.
const { LEGACY_SKILL_CATEGORIES } = require(path.join(REPO, 'scripts', 'prune-option-excluded.js'));
const skillDirs = () => fs.readdirSync(SKILLS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

test('verification.md ↔ SKILL.md 1:1 (양방향, 심볼릭 링크 SKILL.md 불허)', () => {
  const bad = [];
  for (const { category, name } of all) {
    const skill = path.join(SKILLS, name, 'SKILL.md');
    let st = null;
    try { st = fs.lstatSync(skill); } catch {}
    if (!st || !st.isFile()) bad.push(`${category}/${name}: 짝 SKILL.md(.claude/skills/${name}/) 없음(또는 일반 파일 아님)`);
  }
  // 역방향: 짝 verification.md 가 없거나 둘 이상(여러 카테고리)인 SKILL.md
  for (const name of skillDirs()) {
    if (!fs.existsSync(path.join(SKILLS, name, 'SKILL.md'))) continue;
    const pairs = all.filter((v) => v.name === name);
    if (pairs.length === 0) bad.push(`${name}: verification.md 없음 (docs/skills/<카테고리>/${name}/)`);
    if (pairs.length > 1) bad.push(`${name}: 짝 verification.md 가 여러 카테고리에 있음 (${pairs.map((p) => p.category).join(', ')})`);
  }
  assert.deepStrictEqual(bad, []);
});

// ── 구조 회귀: Claude Code 스킬 등록 조건 (2026-10-05) ───────────────────
test('구조: 모든 SKILL.md 는 1단(.claude/skills/<name>/SKILL.md) — 2단 이상 중첩은 스킬로 등록되지 않는다', () => {
  const nested = [];
  (function walk(dir, depth) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) walk(f, depth + 1);
      else if (e.name === 'SKILL.md' && depth !== 1) nested.push(path.relative(SKILLS, f));
    }
  })(SKILLS, 0);
  assert.deepStrictEqual(nested, []);
  assert.ok(skillDirs().filter((n) => fs.existsSync(path.join(SKILLS, n, 'SKILL.md'))).length >= 100, '1단 스킬 순회가 비었음');
});

test('구조: 스킬 폴더는 SKILL.md 가 있어야 하고, 이름이 구 카테고리명과 같으면 안 된다', () => {
  const bad = [];
  for (const name of skillDirs()) {
    if (!fs.existsSync(path.join(SKILLS, name, 'SKILL.md'))) bad.push(`${name}: SKILL.md 없는 폴더 (카테고리 폴더 잔재?)`);
    if (LEGACY_SKILL_CATEGORIES.has(name)) bad.push(`${name}: 구 카테고리명과 같은 스킬 이름 — 재설치 정리가 구 2단 경로로 오인`);
  }
  assert.deepStrictEqual(bad, []);
});

test('구조: SKILL.md frontmatter name 은 폴더 이름과 같다 (등록 이름 = 폴더 이름)', () => {
  const bad = [];
  for (const name of skillDirs()) {
    const f = path.join(SKILLS, name, 'SKILL.md');
    if (!fs.existsSync(f)) continue;
    const fm = frontmatter(fs.readFileSync(f, 'utf8'));
    if (!fm || fm.name !== name) bad.push(`${name}: frontmatter name="${fm && fm.name}"`);
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
