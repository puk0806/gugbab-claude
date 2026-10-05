'use strict';
// template-docs-counts.test.js — 템플릿 문서 수치 ↔ 실제 설치 결과 일치 검사 (2026-09-30)
//
// 배경: 전수 재검증 뒤에도 docs/templates/*.md 의 "에이전트 (N종)"·"스킬 (N종)"·"훅 (N종)"·"규칙 (N종)" 수치가
// 실제 설치 결과와 어긋난 채 남아 있었다. 기존 테스트는 "설치가 되는가"만 봤고 "문서가 설치 결과를 말하는가"는
// 검사하지 않았다. 이 파일은 12개 템플릿 문서에서 수치를 파싱하고, 같은 템플릿을 실제로 설치(os.tmpdir 임시 디렉터리)해
// 센 개수와 비교한다.
//
// 3계층 (rules/adversarial-testing.md):
//  - 정상: 12개 문서 × 기본 옵션·문서에 적힌 옵션 변형(작성 도구 y, SEO n/c/y) 실설치 개수 == 문서 수치
//  - 악성·오남용: 수치 삭제/근사 표기/제목 변조/중복 행/코드펜스 속 가짜 제목 등 "수치가 문서에서 조용히 사라지거나
//    위장되는" 퇴행을 파서가 실패로 처리하는지 (합성 문서 대상)
//  - 경계: 옵션 변형 표기가 없는 문서(util)·존재하지 않는 템플릿 문서·빈 문서·초장문 입력
//
// 근사 표기 정책 (주석으로 못박음): "약 N종"·"~N종"·"≈N종"·"N종 내외"·"대략 N종" 은 **전부 실패**다.
// 허용 오차 0 — 이 수치들은 실설치 실측값이어야 하고, 근사를 허용하는 순간 문서가 실측에서 조용히 멀어진다.
// (근사가 정당한 곳은 본문 서술이지 제목·총계 줄이 아니다. 파서는 제목과 "총 **N종**" 줄만 본다.)
//
// 수치 표기 형식 (12개 문서 조사 결과, 파서가 지원하는 것):
//  에이전트  `## 에이전트 (N종 — 작성 도구 y 시 M종)` | `(N종)`(util)      + 섹션 내 `SEO y 시 K종`(선택)
//  스킬      `## 스킬 (N종 — SEO c C종 · SEO y Y종)` | `## 스킬 (N종)` | `## 스킬 (전체 Y종 / 커머스 C종 …)`(seo-geo)
//            | `## 스킬` + 섹션 안 `총 **N종** (… SEO c C종·SEO y Y종 …)` | `## 스킬` + 카테고리 표 행 `| x (N종 / SEO y 시 M종) |`
//            표 행이 있으면 그 합계도 실제와 비교한다(총계와 표가 서로 어긋난 문서를 잡는다 — java 표 중복 행 사례).
//  훅        `## 훅 (N종 …)` | `## 훅 (공통 N종)` | `## 훅 (N종) — …`
//  규칙      `## 규칙 (N종 — 작성 도구 n이면 M종)` | `(기본 N종 — 작성 도구 y 시 M종)` | `(N종 기본 / 작성 도구 y 시 M종)` | `(N종)`
//  커맨드    `## 슬래시 커맨드 (N종)` (있는 문서만 — 아래 COMMANDS_DOCUMENTED 로 "사라짐"을 막는다)

const { test, describe, after } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');
const INSTALLER = path.join(REPO, 'project-install.sh');

// ── 템플릿 메타 — project-install.sh 의 _parse_template / is_*_selected 와 동기 (아래 테스트가 드리프트를 잡는다) ──
const TEMPLATES = [
  { num: 1, name: 'util' },
  { num: 2, name: 'react-spa' },
  { num: 3, name: 'nextjs' },
  { num: 4, name: 'rust-axum' },
  { num: 5, name: 'java-spring-legacy' },
  { num: 6, name: 'java-spring-modern' },
  { num: 7, name: 'unity-game' },
  { num: 9, name: 'dream-interpretation' },
  { num: 10, name: 'health' },
  { num: 11, name: 'seo-geo' },
  { num: 12, name: 'fortune-app' },
  { num: 13, name: 'python-fastapi' },
];
const DEV = new Set(['react-spa', 'nextjs', 'rust-axum', 'java-spring-legacy', 'java-spring-modern', 'unity-game',
  'health', 'dream-interpretation', 'fortune-app', 'python-fastapi']);
const TS = new Set(['react-spa', 'nextjs', 'health', 'dream-interpretation', 'fortune-app']);
const SEO_OPTIN = new Set(['react-spa', 'nextjs', 'health', 'dream-interpretation', 'fortune-app']); // n/c/y 질문
const SEO_ADDON = new Set(['seo-geo']); // c/y 질문 (엔터 = y)
// 현재 커맨드 수를 문서에 적고 있는 템플릿 — 이 수치가 문서에서 사라지면(퇴행) 실패
const COMMANDS_DOCUMENTED = new Set(['java-spring-legacy', 'java-spring-modern', 'seo-geo']);

// ══════════════════════════════════════════════════════════════════════
// 파서
// ══════════════════════════════════════════════════════════════════════
const APPROX = /(?:약|대략|~|≈|about)\s*\**\s*\d+\s*종|\d+\s*종\s*(?:내외|안팎|정도|가량)/;

// 코드펜스 안의 가짜 제목(## 에이전트 (99종))이 진짜 제목을 가리지 못하게 펜스를 제거한다.
function stripFences(md) {
  return md.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '');
}

// `## <prefix>...` 제목별 섹션 추출. 같은 접두 제목이 2개 이상이면 모호 → 호출측이 오류 처리.
function sectionsByPrefix(md, prefix) {
  const lines = stripFences(md).split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^## /.test(lines[i])) continue;
    const title = lines[i].slice(3).trim();
    if (!(title === prefix || title.startsWith(`${prefix} `) || title.startsWith(`${prefix}(`))) continue;
    let j = i + 1;
    while (j < lines.length && !/^## /.test(lines[j])) j++;
    out.push({ title, body: lines.slice(i + 1, j).join('\n') });
  }
  return out;
}

const num = (m) => (m ? Number(m[1]) : undefined);

function parseTemplateDoc(md) {
  const errors = [];
  const r = { agents: {}, skills: {}, hooks: {}, rules: {}, commands: undefined, errors };
  if (typeof md !== 'string' || md.trim() === '') { errors.push('문서가 비어 있음'); return r; }
  if (md.length > 2_000_000) { errors.push('문서가 비정상적으로 큼 (>2MB)'); return r; }

  const one = (prefix, label, required = true) => {
    const secs = sectionsByPrefix(md, prefix);
    if (secs.length === 0) { if (required) errors.push(`"## ${label}" 섹션 없음`); return null; }
    if (secs.length > 1) { errors.push(`"## ${label}" 섹션이 ${secs.length}개 — 모호`); return null; }
    if (APPROX.test(secs[0].title)) errors.push(`"## ${label}" 제목에 근사 표기(약·~·내외): ${secs[0].title}`);
    return secs[0];
  };

  // ── 에이전트
  const ag = one('에이전트', '에이전트');
  if (ag) {
    r.agents.n = num(ag.title.match(/(\d+)\s*종/));
    r.agents.y = num(ag.title.match(/작성 도구 y 시 (\d+)\s*종/));
    r.agents.seoY = num(ag.body.match(/SEO y 시 (\d+)\s*종/));
    if (r.agents.n === undefined) errors.push(`에이전트 제목에서 수치 파싱 불가: "${ag.title}"`);
  }

  // ── 스킬
  const sk = one('스킬', '스킬');
  if (sk) {
    const totalLine = sk.body.split('\n').find((l) => /총\s*\*\*/.test(l));
    if (totalLine && APPROX.test(totalLine)) errors.push(`스킬 총계 줄에 근사 표기: ${totalLine.trim()}`);
    const primary = `${sk.title}\n${totalLine || ''}`;
    const prof = {};
    const full = num(sk.title.match(/전체\s*(\d+)\s*종/));   // seo-geo: 전체(y)/커머스(c)
    const comm = num(sk.title.match(/커머스\s*(\d+)\s*종/));
    if (full !== undefined) { prof.y = full; if (comm !== undefined) prof.c = comm; }
    else {
      prof.n = num(sk.title.match(/^스킬\s*\(\s*(\d+)\s*종/)) ?? num((totalLine || '').match(/총\s*\*\*\s*(\d+)\s*종/));
      prof.c = num(primary.match(/SEO c\s*(\d+)\s*종/));
      prof.y = num(primary.match(/SEO y\s*(\d+)\s*종/));
    }
    // 카테고리 표 합계 — `| name (N종 / SEO y 시 M종) |` 행
    const rows = sk.body.split('\n').filter((l) => /^\|/.test(l))
      .map((l) => l.match(/^\|[^|]*?\(\s*(\d+)\s*종(?:\s*\/\s*SEO y 시\s*(\d+)\s*종)?\s*\)/)).filter(Boolean);
    if (rows.length) {
      r.skills.tableN = rows.reduce((s, m) => s + Number(m[1]), 0);
      r.skills.tableY = rows.reduce((s, m) => s + Number(m[2] ?? m[1]), 0);
    }
    // `### ... (N종` 하위 소계 — 있으면 표 합계는 총계가 아니라 소계(fortune: 공유 스킬 76 + 운세 전용 10 = 86)
    r.skills.subtotals = sk.body.split('\n').filter((l) => /^### /.test(l)).map((l) => num(l.match(/\(\s*(\d+)\s*종/))).filter((v) => v !== undefined);
    r.skills.profiles = prof;
    if (prof.n === undefined && prof.y === undefined && r.skills.tableN === undefined) {
      errors.push(`스킬 수치 파싱 불가 (제목·총계 줄·표 어디에도 없음): "${sk.title}"`);
    }
  }

  // ── 훅
  const hk = one('훅', '훅');
  if (hk) {
    r.hooks.n = num(hk.title.match(/(\d+)\s*종/));
    if (r.hooks.n === undefined) errors.push(`훅 제목에서 수치 파싱 불가: "${hk.title}"`);
  }

  // ── 규칙
  const ru = one('규칙', '규칙');
  if (ru) {
    const base = num(ru.title.match(/(\d+)\s*종/));
    const nIf = num(ru.title.match(/작성 도구 n이면\s*(\d+)\s*종/));
    const yIf = num(ru.title.match(/작성 도구(?: 옵션)? y 시\s*(\d+)\s*종/));
    if (base === undefined) errors.push(`규칙 제목에서 수치 파싱 불가: "${ru.title}"`);
    else if (nIf !== undefined) { r.rules.n = nIf; r.rules.y = base; }   // "10종 — 작성 도구 n이면 5종"
    else { r.rules.n = base; r.rules.y = yIf ?? base; }                  // "기본 5종 — 작성 도구 y 시 10종"
  }

  // ── 커맨드 (선택)
  const cm = sectionsByPrefix(md, '슬래시 커맨드');
  if (cm.length > 1) errors.push('"## 슬래시 커맨드" 섹션이 여러 개 — 모호');
  if (cm.length === 1) {
    if (APPROX.test(cm[0].title)) errors.push(`커맨드 제목에 근사 표기: ${cm[0].title}`);
    r.commands = num(cm[0].title.match(/(\d+)\s*종/));
    if (r.commands === undefined) errors.push(`커맨드 제목에서 수치 파싱 불가: "${cm[0].title}"`);
  }
  return r;
}

// ══════════════════════════════════════════════════════════════════════
// 설치·계수 헬퍼 (template-separation.test.js 방식 — 임시 디렉터리 + 빈 줄 응답)
// ══════════════════════════════════════════════════════════════════════
const tmpDirs = [];
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }); });

// seoAns: 'n'|'c'|'y'|null(질문 없음/기본), authoring: 'y'|'n'
function install(tmpl, { seo = null, authoring = 'n' } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `tmpl-docs-${tmpl}-`));
  tmpDirs.push(dir);
  // 질문 순서: memory, superpowers, [codex(dev)], [legacy(dev&ts)], [SEO(optin|addon)], [작성 도구(!util)]
  const answers = ['', ''];
  if (DEV.has(tmpl)) answers.push('');
  if (DEV.has(tmpl) && TS.has(tmpl)) answers.push('');
  if (SEO_OPTIN.has(tmpl) || SEO_ADDON.has(tmpl)) answers.push(seo === 'n' ? '' : (seo || ''));
  if (tmpl !== 'util') answers.push(authoring === 'y' ? 'y' : '');
  const num = TEMPLATES.find((t) => t.name === tmpl).num;
  const input = `${dir}\n${num}\n` + answers.map((a) => `${a}\n`).join('') + '\n'.repeat(60);
  const res = spawnSync('bash', [INSTALLER], { input, encoding: 'utf8', timeout: 120000 });
  assert.strictEqual(res.status, 0, `install(${tmpl}) 실패 status=${res.status}\n${(res.stderr || '').slice(-400)}`);
  // 답변 정렬 검증 — 질문 순서가 바뀌어 엉뚱한 옵션이 켜진 채 비교되는 것을 막는다.
  const wantSeo = { n: 'false', c: 'commerce', y: 'true' }[seo || (SEO_ADDON.has(tmpl) ? 'y' : 'n')];
  if (SEO_OPTIN.has(tmpl) || SEO_ADDON.has(tmpl)) {
    assert.ok(res.stdout.includes(`SEO 스킬: ${wantSeo}`), `${tmpl}: SEO 응답 정렬 어긋남 (기대 ${wantSeo})`);
  }
  if (tmpl !== 'util') {
    assert.ok(res.stdout.includes(`작성 도구: ${authoring === 'y' ? 'true' : 'false'}`), `${tmpl}: 작성 도구 응답 정렬 어긋남`);
  }
  return dir;
}

const listFiles = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []);
function walk(d, cb) {
  for (const e of listFiles(d)) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) walk(full, cb); else cb(full, e.name);
  }
}
function countInstalled(dir) {
  const c = dir + '/.claude';
  let agents = 0, skills = 0;
  walk(path.join(c, 'agents'), (_f, n) => { if (n.endsWith('.md') && n !== 'CLAUDE.md') agents++; });
  // 스킬은 1단 .claude/skills/<name>/SKILL.md 만 센다 — Claude Code 가 등록하는 깊이 (2026-10-05 평탄화)
  walk(path.join(c, 'skills'), (f, n) => { if (n === 'SKILL.md' && path.relative(path.join(c, 'skills'), f).split(path.sep).length === 2) skills++; });
  const hooks = listFiles(path.join(c, 'hooks')).filter((e) => e.isFile() && e.name !== 'package.json' && !e.name.endsWith('.test.js')).length;
  const rules = listFiles(path.join(c, 'rules')).filter((e) => e.isFile() && e.name.endsWith('.md')).length;
  const commands = listFiles(path.join(c, 'commands')).filter((e) => e.isFile() && e.name.endsWith('.md')).length;
  return { agents, skills, hooks, rules, commands };
}

const readDoc = (name) => fs.readFileSync(path.join(REPO, 'docs', 'templates', `${name}.md`), 'utf8');

// ══════════════════════════════════════════════════════════════════════
// 1. 정상 — 실제 문서 파싱 + 실설치 비교
// ══════════════════════════════════════════════════════════════════════
describe('템플릿 문서 ↔ 실설치 개수 (정상 경로)', () => {
  const docs = {};
  for (const t of TEMPLATES) {
    test(`${t.name}: 문서가 파싱되고 필수 수치가 모두 있다`, () => {
      const parsed = parseTemplateDoc(readDoc(t.name));
      docs[t.name] = parsed;
      assert.deepStrictEqual(parsed.errors, [], `${t.name}.md 파싱 오류`);
      assert.ok(Number.isInteger(parsed.agents.n) && Number.isInteger(parsed.hooks.n) && Number.isInteger(parsed.rules.n));
      const p = parsed.skills.profiles;
      const base = SEO_ADDON.has(t.name) ? p.y : (p.n ?? parsed.skills.tableN);
      assert.ok(Number.isInteger(base), `${t.name}: 기본 옵션 스킬 수치 없음`);
      if (SEO_OPTIN.has(t.name)) {
        assert.ok(Number.isInteger(p.y ?? parsed.skills.tableY), `${t.name}: SEO y 스킬 수치 없음`);
      }
      if (COMMANDS_DOCUMENTED.has(t.name)) {
        assert.ok(Number.isInteger(parsed.commands), `${t.name}: 커맨드 수치가 문서에서 사라짐`);
      }
    });

    test(`${t.name}: 기본 옵션 설치 결과 == 문서 (에이전트·스킬·훅·규칙${COMMANDS_DOCUMENTED.has(t.name) ? '·커맨드' : ''})`, () => {
      const d = parseTemplateDoc(readDoc(t.name));
      const dir = install(t.name);
      const got = countInstalled(dir);
      const p = d.skills.profiles;
      const wantSkills = SEO_ADDON.has(t.name) ? p.y : (p.n ?? d.skills.tableN);
      assert.strictEqual(got.agents, d.agents.n, `${t.name} 에이전트: 실제 ${got.agents} vs 문서 ${d.agents.n}`);
      assert.strictEqual(got.skills, wantSkills, `${t.name} 스킬: 실제 ${got.skills} vs 문서 ${wantSkills}`);
      if (d.skills.subtotals.length) {
        // 하위 소계가 있는 문서: 소계 합 == 총계, 표(공유 스킬) 합계 == 소계 중 하나
        assert.strictEqual(d.skills.subtotals.reduce((a, b) => a + b, 0), wantSkills, `${t.name} 하위 소계 합 != 총계`);
        assert.ok(d.skills.subtotals.includes(d.skills.tableN), `${t.name} 표 합계 ${d.skills.tableN} 가 어느 소계와도 안 맞음`);
      } else if (d.skills.tableN !== undefined && !SEO_ADDON.has(t.name)) {
        assert.strictEqual(got.skills, d.skills.tableN, `${t.name} 스킬 표 합계: 실제 ${got.skills} vs 표 ${d.skills.tableN}`);
      }
      assert.strictEqual(got.hooks, d.hooks.n, `${t.name} 훅: 실제 ${got.hooks} vs 문서 ${d.hooks.n}`);
      assert.strictEqual(got.rules, d.rules.n, `${t.name} 규칙: 실제 ${got.rules} vs 문서 ${d.rules.n}`);
      if (d.commands !== undefined) {
        assert.strictEqual(got.commands, d.commands, `${t.name} 커맨드: 실제 ${got.commands} vs 문서 ${d.commands}`);
      }
    });

    if (t.name !== 'util') {
      test(`${t.name}: 작성 도구 y 변형 == 문서 (에이전트·규칙)`, () => {
        const d = parseTemplateDoc(readDoc(t.name));
        const got = countInstalled(install(t.name, { authoring: 'y' }));
        assert.ok(Number.isInteger(d.agents.y), `${t.name}: 에이전트 "작성 도구 y 시" 수치가 문서에 없음`);
        assert.strictEqual(got.agents, d.agents.y, `${t.name} 에이전트(작성 도구 y): 실제 ${got.agents} vs 문서 ${d.agents.y}`);
        assert.strictEqual(got.rules, d.rules.y, `${t.name} 규칙(작성 도구 y): 실제 ${got.rules} vs 문서 ${d.rules.y}`);
      });
    }
  }

  for (const name of SEO_OPTIN) {
    for (const seo of ['c', 'y']) {
      test(`${name}: SEO ${seo} 변형 == 문서 (스킬·에이전트)`, () => {
        const d = parseTemplateDoc(readDoc(name));
        const got = countInstalled(install(name, { seo }));
        const p = d.skills.profiles;
        const wantSkills = seo === 'y' ? (p.y ?? d.skills.tableY) : p.c;
        if (seo === 'c' && wantSkills === undefined) return; // 문서가 c 수치를 적지 않은 템플릿(health) — y 는 필수, c 는 선택
        assert.strictEqual(got.skills, wantSkills, `${name} 스킬(SEO ${seo}): 실제 ${got.skills} vs 문서 ${wantSkills}`);
        if (seo === 'y' && d.agents.seoY !== undefined) {
          assert.strictEqual(got.agents, d.agents.seoY, `${name} 에이전트(SEO y): 실제 ${got.agents} vs 문서 ${d.agents.seoY}`);
        }
      });
    }
  }

  test('seo-geo: 커머스(c) 변형 스킬 수 == 문서 "커머스 N종"', () => {
    const d = parseTemplateDoc(readDoc('seo-geo'));
    assert.ok(Number.isInteger(d.skills.profiles.c), 'seo-geo 문서에 커머스 수치 없음');
    const got = countInstalled(install('seo-geo', { seo: 'c' }));
    assert.strictEqual(got.skills, d.skills.profiles.c);
  });
});

// ══════════════════════════════════════════════════════════════════════
// 2. 드리프트 방지 — 템플릿 문서 집합·번호 매핑
// ══════════════════════════════════════════════════════════════════════
describe('템플릿 문서 집합 일치 (경계: 존재하지 않는/미등록 문서)', () => {
  test('docs/templates/*.md 는 TEMPLATES 와 정확히 일치 (누락·미등록 문서 없음)', () => {
    const onDisk = fs.readdirSync(path.join(REPO, 'docs', 'templates')).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)).sort();
    assert.deepStrictEqual(onDisk, TEMPLATES.map((t) => t.name).sort(),
      '문서와 검사 목록이 어긋남 — 새 템플릿이면 TEMPLATES·DEV/TS/SEO 집합에 등록하고, 삭제된 템플릿이면 목록에서 제거');
  });

  test('project-install.sh 의 번호 매핑·질문 조건이 TEMPLATES 메타와 일치', () => {
    const sh = fs.readFileSync(INSTALLER, 'utf8');
    for (const t of TEMPLATES) {
      assert.ok(new RegExp(`\\b${t.num}\\|${t.name}\\)`).test(sh), `설치 스크립트에 ${t.num}|${t.name} 매핑 없음`);
    }
    const fn = (name) => {
      const m = sh.match(new RegExp(`${name}\\(\\) \\{[\\s\\S]*?\\n\\}`));
      assert.ok(m, `${name}() 를 찾지 못함`);
      return m[0];
    };
    const inCase = (body, tmpl) => new RegExp(`(^|[|\\s])${tmpl}([|\\s)]|$)`, 'm').test(body);
    const dev = fn('is_dev_selected'), ts = fn('is_ts_selected'), seo = fn('is_seo_optin_selected');
    for (const t of TEMPLATES) {
      assert.strictEqual(inCase(dev, t.name), DEV.has(t.name), `is_dev_selected 와 DEV 불일치: ${t.name}`);
      assert.strictEqual(inCase(ts, t.name), TS.has(t.name), `is_ts_selected 와 TS 불일치: ${t.name}`);
      assert.strictEqual(inCase(seo, t.name), SEO_OPTIN.has(t.name), `is_seo_optin_selected 와 SEO_OPTIN 불일치: ${t.name}`);
    }
  });

  test('루트 README 템플릿 표가 12개 문서를 모두 링크', () => {
    const readme = fs.readFileSync(path.join(REPO, 'README.md'), 'utf8');
    for (const t of TEMPLATES) {
      assert.ok(readme.includes(`docs/templates/${t.name}.md`), `README 템플릿 표에 ${t.name} 문서 링크 없음`);
      // 표 행: `| 번호 | 표시명 | ... | [→](./docs/templates/<name>.md) |` — 번호와 문서 링크가 같은 행에 있어야 한다
      assert.ok(new RegExp(`^\\|\\s*${t.num}\\s*\\|[^\\n]*docs/templates/${t.name}\\.md`, 'm').test(readme), `README 표의 번호 ${t.num}↔${t.name} 문서 링크 불일치`);
    }
  });
});

// ══════════════════════════════════════════════════════════════════════
// 3. 악성·이상 — 파서가 수치 퇴행을 실패로 처리하는지 (합성 문서)
// ══════════════════════════════════════════════════════════════════════
const GOOD = [
  '# t', '',
  '## 에이전트 (24종 — 작성 도구 y 시 27종)', '표',
  '## 스킬 (22종)', '| a (10종) | x |', '| b (12종) | y |',
  '## 훅 (18종 — 공통 14 + 개발 전용 4)', '',
  '## 규칙 (기본 5종 — 작성 도구 y 시 10종)', '',
  '## 슬래시 커맨드 (9종)', '',
].join('\n');

describe('파서 방어 (악성·근사·삭제 퇴행)', () => {
  test('정상 합성 문서는 오류 없이 모든 수치를 뽑는다 (양성 대조)', () => {
    const r = parseTemplateDoc(GOOD);
    assert.deepStrictEqual(r.errors, []);
    assert.deepStrictEqual([r.agents.n, r.agents.y, r.skills.profiles.n, r.skills.tableN, r.hooks.n, r.rules.n, r.rules.y, r.commands],
      [24, 27, 22, 22, 18, 5, 10, 9]);
  });

  test('수치를 지운 제목("## 훅")은 실패 — 수치가 조용히 사라지는 퇴행', () => {
    for (const [from, to] of [['## 훅 (18종 — 공통 14 + 개발 전용 4)', '## 훅'], ['## 에이전트 (24종 — 작성 도구 y 시 27종)', '## 에이전트'],
      ['## 규칙 (기본 5종 — 작성 도구 y 시 10종)', '## 규칙']]) {
      assert.ok(parseTemplateDoc(GOOD.replace(from, to)).errors.length > 0, `${to} 수치 삭제가 통과됨`);
    }
  });

  test('스킬 섹션에 제목·총계·표 어디에도 수치가 없으면 실패', () => {
    const md = GOOD.replace('## 스킬 (22종)\n| a (10종) | x |\n| b (12종) | y |', '## 스킬\n설명만');
    assert.ok(parseTemplateDoc(md).errors.some((e) => e.includes('스킬 수치 파싱 불가')));
  });

  test('필수 섹션 자체가 없으면 실패 (에이전트/스킬/훅/규칙)', () => {
    for (const sec of ['에이전트', '스킬', '훅', '규칙']) {
      const md = GOOD.split('\n').filter((l) => !l.startsWith(`## ${sec}`)).join('\n');
      assert.ok(parseTemplateDoc(md).errors.some((e) => e.includes(`## ${sec}`)), `${sec} 섹션 삭제가 통과됨`);
    }
  });

  test('근사 표기("약 N종"·"~N종"·"N종 내외")는 허용 오차 0 정책으로 전부 실패', () => {
    for (const bad of ['약 24종', '~24종', '≈24종', '24종 내외', '대략 24종']) {
      const r = parseTemplateDoc(GOOD.replace('24종', bad));
      assert.ok(r.errors.some((e) => e.includes('근사')), `근사 표기 "${bad}" 통과됨`);
    }
    // 총계 줄의 근사 표기도 잡는다
    const md = GOOD.replace('## 스킬 (22종)', '## 스킬\n총 **약 22종** (SEO y 30종)');
    assert.ok(parseTemplateDoc(md.replace('| a (10종) | x |\n| b (12종) | y |', '')).errors.some((e) => e.includes('근사')));
  });

  test('코드펜스 안의 가짜 제목은 진짜 제목을 대체·중복시키지 못한다', () => {
    const md = GOOD + '\n```\n## 훅 (99종)\n## 에이전트 (1종)\n```\n';
    const r = parseTemplateDoc(md);
    assert.deepStrictEqual(r.errors, []);
    assert.strictEqual(r.hooks.n, 18);
    assert.strictEqual(r.agents.n, 24);
  });

  test('같은 제목이 2번 나오면(수치 충돌 은폐) 모호 오류', () => {
    const md = GOOD + '\n## 훅 (99종)\n';
    assert.ok(parseTemplateDoc(md).errors.some((e) => e.includes('모호')));
  });

  test('부분 문자열 제목("## 핵심 스킬 연동 관계", "## 훅 연결")은 스킬·훅 섹션으로 오인되지 않는다', () => {
    const md = GOOD + '\n## 핵심 스킬 연동 관계 (99종)\n## 훅연결 (77종)\n';
    const r = parseTemplateDoc(md);
    assert.deepStrictEqual(r.errors, []);
    assert.strictEqual(r.hooks.n, 18);
  });

  test('표 행 중복(java 문서 사례)은 표 합계로 드러난다 — 총계와 표 합계가 갈리면 소비측이 실패', () => {
    const md = GOOD.replace('| b (12종) | y |', '| b (12종) | y |\n| b (12종) | y |');
    const r = parseTemplateDoc(md);
    assert.strictEqual(r.skills.profiles.n, 22);
    assert.strictEqual(r.skills.tableN, 34); // 중복 행이 합계를 부풀림 → 실측 22 와 비교 시 실패
  });

  test('"n이면" 규칙 표기와 "y 시" 표기가 뒤섞여도 n/y 를 올바르게 배정', () => {
    const a = parseTemplateDoc(GOOD.replace('(기본 5종 — 작성 도구 y 시 10종)', '(10종 — 작성 도구 n이면 5종)'));
    assert.deepStrictEqual([a.rules.n, a.rules.y], [5, 10]);
    const b = parseTemplateDoc(GOOD.replace('(기본 5종 — 작성 도구 y 시 10종)', '(4종 기본 / 작성 도구 y 시 9종)'));
    assert.deepStrictEqual([b.rules.n, b.rules.y], [4, 9]);
  });

  test('빈 문서·공백·null·비문자열·초장문 입력은 예외 없이 오류 반환', () => {
    for (const bad of ['', '   \n\t', null, undefined, 42, {}]) {
      assert.ok(parseTemplateDoc(bad).errors.length > 0);
    }
    const huge = '## 훅 (1종)\n' + 'x'.repeat(2_100_000);
    assert.ok(parseTemplateDoc(huge).errors.some((e) => e.includes('비정상')));
  });

  test('제어문자·HTML·마크다운 인젝션이 섞인 수치 제목도 크래시 없이 처리', () => {
    const md = GOOD.replace('## 훅 (18종', '## 훅 (<script>alert(1)</script>\u0000 18종');
    const r = parseTemplateDoc(md);
    assert.strictEqual(r.hooks.n, 18); // 숫자만 추출 — 페이로드는 무시
  });

  test('경계: 옵션 변형 표기가 없는 문서(util 형식)는 y 를 n 으로 위장하지 않고 undefined 로 남긴다', () => {
    const md = GOOD.replace(' — 작성 도구 y 시 27종', '').replace(' — 작성 도구 y 시 10종', '');
    const r = parseTemplateDoc(md);
    assert.strictEqual(r.agents.y, undefined);
    // 소비측(작성 도구 y 테스트)은 non-util 에서 agents.y 부재를 실패 처리한다
    assert.strictEqual(r.rules.y, r.rules.n);
  });

  test('경계: 존재하지 않는 템플릿 문서를 읽으면 예외(ENOENT) — 조용한 통과 불가', () => {
    assert.throws(() => readDoc('no-such-template'), /ENOENT/);
  });

  test('경계: 실제 문서에서 파서가 sanity 가드로 쓰는 값이 뒤섞이지 않았는지 (util = 에이전트 12·스킬 1·훅 14·규칙 2, 변형 없음)', () => {
    const r = parseTemplateDoc(readDoc('util'));
    assert.deepStrictEqual(r.errors, []);
    assert.strictEqual(r.agents.y, undefined);
    assert.strictEqual(r.skills.profiles.n, 1);
  });
});

// ══════════════════════════════════════════════════════════════════════
// 4. 루트 README·docs/skills README 수치 ↔ 실제 .claude 개수
// ══════════════════════════════════════════════════════════════════════
describe('README·카테고리 문서 수치 ↔ 실제 레포 개수', () => {
  // 스킬 본체는 1단 .claude/skills/<name>/, 카테고리는 docs/skills/<cat>/<name>/ 위치 (2026-10-05 평탄화)
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

  test('README 구조도 "스킬 (N카테고리, M종)" == 실제', () => {
    const m = readme.match(/스킬 \((\d+)카테고리,\s*(\d+)종\)/);
    assert.ok(m, 'README 에서 "스킬 (N카테고리, M종)" 표기를 찾지 못함 (수치가 사라졌거나 형식 변경)');
    assert.strictEqual(Number(m[1]), Object.keys(actualByCat).length, '스킬 카테고리 수');
    assert.strictEqual(Number(m[2]), totalSkills, '스킬 총계');
  });

  test('README 구조도 "훅 (N종)" == 실제 .claude/hooks (package.json·*.test.js 제외)', () => {
    const m = readme.match(/훅 \((\d+)종\)/);
    assert.ok(m, 'README 에서 "훅 (N종)" 표기를 찾지 못함');
    const actual = listFiles(path.join(REPO, '.claude', 'hooks')).filter((e) => e.isFile() && e.name !== 'package.json' && !e.name.endsWith('.test.js')).length;
    assert.strictEqual(Number(m[1]), actual);
  });

  test('README 구조도 "규칙 (N종)"·"에이전트 (N카테고리)" == 실제', () => {
    const rm = readme.match(/규칙 \((\d+)종\)/);
    assert.ok(rm, 'README 에서 "규칙 (N종)" 표기를 찾지 못함');
    assert.strictEqual(Number(rm[1]), listFiles(path.join(REPO, '.claude', 'rules')).filter((e) => e.isFile() && e.name.endsWith('.md')).length);
    const am = readme.match(/에이전트 \((\d+)카테고리\)/);
    assert.ok(am, 'README 에서 "에이전트 (N카테고리)" 표기를 찾지 못함');
    assert.strictEqual(Number(am[1]), listFiles(path.join(REPO, '.claude', 'agents')).filter((e) => e.isDirectory()).length);
  });

  test('docs/skills/README.md 카테고리별 수 == 실제, 유령·누락 카테고리 없음', () => {
    const md = fs.readFileSync(path.join(REPO, 'docs', 'skills', 'README.md'), 'utf8');
    const rows = {};
    for (const m of md.matchAll(/^\|\s*\[([\w-]+)\]\([^)]*\)\s*\|\s*(\d+)\s*종\s*\|/gm)) {
      assert.ok(!(m[1] in rows), `카테고리 행 중복: ${m[1]}`);
      rows[m[1]] = Number(m[2]);
    }
    assert.deepStrictEqual(rows, actualByCat);
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
