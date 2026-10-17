'use strict';
// docs-counts.test.js — README·docs 의 수치·프리셋 표 ↔ 실제 레포 (2026-10-17, 옛 template-docs-counts 에서 래퍼에 필요한 부분만 옮김)
//   README "무엇이 들어 있나" 수치(스킬·에이전트·훅·규칙) · README 프리셋 표 == relations.json · docs/skills 카테고리 수치
// 3계층 (rules/adversarial-testing.md):
//  - 정상: 실제 README·docs 와 실제 .claude 개수 대조
//  - 악성·오남용: 근사 표기("약 N종")·중복 행·유령 프리셋으로 수치를 흐리는 문서는 실패
//  - 경계: 수치가 사라진 문서·빈 문서·null 입력은 예외 없이 "못 찾음"
const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');
const APPROX = /(?:약|대략|~|≈|about)\s*\**\s*\d+\s*종|\d+\s*종\s*(?:내외|안팎|정도|가량)/;
const listFiles = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []);

// ── 파서 (합성 문서로도 시험) ─────────────────────────────────────────
function readmeCounts(md) {
  const s = typeof md === 'string' ? md : '';
  const sk = s.match(/스킬 \((\d+)카테고리,\s*(\d+)종\)/);
  const hk = s.match(/훅 \((\d+)종\)/);
  const rl = s.match(/규칙 \((\d+)종\)/);
  const ag = s.match(/에이전트 \((\d+)카테고리\)/);
  return {
    skillCats: sk ? Number(sk[1]) : null, skills: sk ? Number(sk[2]) : null,
    hooks: hk ? Number(hk[1]) : null, rules: rl ? Number(rl[1]) : null, agentCats: ag ? Number(ag[1]) : null,
    approx: APPROX.test(s),
  };
}
// README 프리셋 표: | `이름` | 내용 | `블록` · `블록` |  → Map(이름 → [블록]), 같은 이름이 두 번이면 예외
function presetRows(md) {
  const out = new Map();
  const s = typeof md === 'string' ? md : '';
  for (const m of s.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|[^|\n]*\|([^\n]*)\|\s*$/gm)) {
    const blocks = [...m[2].matchAll(/`([a-z0-9-]+)`/g)].map((x) => x[1]);
    if (!blocks.length) continue;
    if (out.has(m[1])) throw new Error(`프리셋 행 중복: ${m[1]}`);
    out.set(m[1], blocks);
  }
  return out;
}
// docs/skills/README.md 카테고리 표: | [cat](…) | N종 |  → 객체, 중복이면 예외
function categoryRows(md) {
  const rows = {};
  const s = typeof md === 'string' ? md : '';
  for (const m of s.matchAll(/^\|\s*\[([\w-]+)\]\([^)]*\)\s*\|\s*(\d+)\s*종\s*\|/gm)) {
    if (m[1] in rows) throw new Error(`카테고리 행 중복: ${m[1]}`);
    rows[m[1]] = Number(m[2]);
  }
  return rows;
}

// ── 1. 정상 — 실제 문서 ↔ 실제 레포 ───────────────────────────────────
describe('README·docs 수치 ↔ 실제 레포 개수', () => {
  const skillsRoot = path.join(REPO, '.claude', 'skills');
  const cmap = require('./skill-index.js').categoryMap();
  const actualByCat = {};
  for (const e of listFiles(skillsRoot)) {
    if (!e.isDirectory() || !fs.existsSync(path.join(skillsRoot, e.name, 'SKILL.md'))) continue;
    const cat = cmap.get(e.name) || '?';
    actualByCat[cat] = (actualByCat[cat] || 0) + 1;
  }
  const totalSkills = Object.values(actualByCat).reduce((a, b) => a + b, 0);
  const readme = fs.readFileSync(path.join(REPO, 'README.md'), 'utf8');
  const c = readmeCounts(readme);

  test('README "스킬 (N카테고리, M종)" == 실제', () => {
    assert.notStrictEqual(c.skills, null, 'README 에서 "스킬 (N카테고리, M종)" 표기를 찾지 못함');
    assert.strictEqual(c.skillCats, Object.keys(actualByCat).length, '스킬 카테고리 수');
    assert.strictEqual(c.skills, totalSkills, '스킬 총계');
  });

  test('README "훅 (N종)" == 실제 .claude/hooks (package.json·*.test.js 제외)', () => {
    assert.notStrictEqual(c.hooks, null, 'README 에서 "훅 (N종)" 표기를 찾지 못함');
    const actual = listFiles(path.join(REPO, '.claude', 'hooks')).filter((e) => e.isFile() && e.name !== 'package.json' && !e.name.endsWith('.test.js')).length;
    assert.strictEqual(c.hooks, actual);
  });

  test('README "규칙 (N종)"·"에이전트 (N카테고리)" == 실제, 근사 표기 없음', () => {
    assert.strictEqual(c.rules, listFiles(path.join(REPO, '.claude', 'rules')).filter((e) => e.isFile() && e.name.endsWith('.md')).length);
    assert.strictEqual(c.agentCats, listFiles(path.join(REPO, '.claude', 'agents')).filter((e) => e.isDirectory()).length);
    assert.strictEqual(c.approx, false, 'README 에 근사 표기("약 N종" 등)');
  });

  test('README 프리셋 표 == relations.json 프리셋 (이름·켜지는 블록, 빠짐·유령 없음)', () => {
    const presets = Object.entries(JSON.parse(fs.readFileSync(path.join(REPO, 'relations.json'), 'utf8')).presets || {}).filter(([k]) => !k.startsWith('$'));
    assert.ok(presets.length > 0, 'relations.json 에 프리셋이 없음');
    const shown = presetRows(readme);
    for (const [name, p] of presets) {
      assert.ok(shown.has(name), `README 프리셋 표에 ${name} 없음`);
      assert.deepStrictEqual(shown.get(name), p.enable.map((g) => g.replace(/^(?:block|bundle):/, '')), `README 프리셋 ${name} 의 블록이 relations.json 과 다름`);
    }
    for (const name of shown.keys()) assert.ok(presets.some(([k]) => k === name), `README 프리셋 표의 ${name} 는 relations.json 에 없음`);
  });

  test('docs/skills/README.md 카테고리별 수 == 실제, 유령·누락 카테고리 없음', () => {
    assert.deepStrictEqual(categoryRows(fs.readFileSync(path.join(REPO, 'docs', 'skills', 'README.md'), 'utf8')), actualByCat);
  });

  test('docs/skills/<cat>/README.md 제목·소개의 총계 == 실제 (수치가 사라지면 실패)', () => {
    for (const [cat, actual] of Object.entries(actualByCat)) {
      const p = path.join(REPO, 'docs', 'skills', cat, 'README.md');
      assert.ok(fs.existsSync(p), `${cat}/README.md 없음`);
      const head = fs.readFileSync(p, 'utf8').split('\n').slice(0, 6).join('\n');
      const m = head.match(/스킬 \((\d+)종\)/) || head.match(/총\s*(\d+)\s*종/);
      assert.ok(m, `${cat}/README.md 상단에서 총계 수치를 찾지 못함`);
      assert.ok(!APPROX.test(head), `${cat}/README.md 상단에 근사 표기`);
      assert.strictEqual(Number(m[1]), actual, `${cat}/README.md 총계 ${m[1]} vs 실제 ${actual}`);
    }
  });
});

// ── 2. 악성·오남용 — 수치를 흐리는 문서 ───────────────────────────────
describe('파서 방어 (악성·오남용)', () => {
  test('악성: 근사 표기("약 195종"·"~30종"·"30종 내외")는 approx 로 잡힘', () => {
    for (const s of ['스킬 약 195종', '훅 ~30종', '규칙 14종 내외', '에이전트 대략 61종']) assert.strictEqual(readmeCounts(s).approx, true, s);
    assert.strictEqual(readmeCounts('훅 (31종)').approx, false);
  });
  test('악성: 프리셋·카테고리 표의 같은 이름 중복 행(수치 충돌 은폐)은 예외', () => {
    const dup = '| `rust` | Rust | `dev-common` · `rust` |\n| `rust` | 다른 | `rust` |\n';
    assert.throws(() => presetRows(dup), /중복/);
    assert.throws(() => categoryRows('| [frontend](x) | 3종 |\n| [frontend](x) | 4종 |\n'), /중복/);
  });
  test('악성: 블록 칸에 백틱 이름이 없는 행(옵션 표 등)은 프리셋으로 세지 않음', () => {
    const rows = presetRows('| `--version vX.Y.Z` | 고정 |  |\n| `gugbab-claude status` | 요약 | 설명 |\n| `rust` | Rust | `rust` |\n');
    assert.deepStrictEqual([...rows.keys()], ['rust']);
  });
});

// ── 3. 경계 — 수치가 사라짐·빈 입력 ──────────────────────────────────
describe('파서 경계', () => {
  test('경계: 수치를 지운 문서("## 훅")는 null — 조용히 통과하지 않게 소비측이 실패', () => {
    const r = readmeCounts('## 훅\n## 스킬\n');
    assert.deepStrictEqual([r.skills, r.hooks, r.rules, r.agentCats], [null, null, null, null]);
  });
  test('경계: 빈 문서·null·숫자·초장문 입력도 예외 없이 처리', () => {
    for (const v of ['', null, undefined, 42, 'x'.repeat(200000)]) {
      assert.doesNotThrow(() => { readmeCounts(v); presetRows(v); categoryRows(v); });
    }
    assert.strictEqual(presetRows(null).size, 0);
  });
});
