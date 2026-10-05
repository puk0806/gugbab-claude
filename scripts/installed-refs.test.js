'use strict';
// installed-refs.test.js — 설치본 참조 무결성 E2E (2026-09-30)
//
// project-install.sh 를 템플릿·옵션 조합별로 **실제 설치**한 뒤 **설치된 파일만** 스캔해,
// 설치되지 않은 규칙·스킬·에이전트·커맨드를 조건 표기 없이 가리키는 참조를 찾아 실패시킨다.
// (배경: 작성 도구 n 설치에서 없는 규칙을 가리키는 문구가 2026-09-28~29 전수 재검증을 통과했다 —
//  기존 테스트는 원본 파일 하나의 형식만 보고, 설치 결과의 참조 무결성은 보지 않았다.)
//
// 스캔 대상 (설치본): .claude/agents/**/*.md, .claude/skills/**/*.md, .claude/rules/*.md,
//   .claude/commands/*.md, CLAUDE.md, .claude/hooks/*.js(비테스트)의 문자열 리터럴(사용자에게 보이는 메시지).
//   docs/**/*.md (2026-10-05 추가 — 매니페스트 docs kind 로 설치되는 문서. 설치본에 실재하는 파일만 스캔.
//   과거엔 "검증 증거"라 제외했으나 docs/agents/*.md 의 위임 안내가 미설치 에이전트를 가리키는 사례가 감사에서 나왔다).
//   훅 JS 의 주석은 사용자에게 보이지 않으므로 계속 제외한다.
//
// 참조 형태 (레포 실제 표기 조사 결과):
//   rule    : `@.claude/rules/x.md`, `.claude/rules/x.md`, `rules/x.md`, 알려진 규칙 파일명 단독 `x.md`
//   skill   : `category/skill-name` (원본 스킬 목록에 실재하는 id 만), `.claude/skills/category/skill-name`
//   agent   : `agents/<cat>/<name>.md`, `subagent_type="x"`, `` `x` 에이전트 `` / `x 에이전트` (원본 에이전트명만),
//             (2026-10-05) 원본 에이전트명 단독 — `` `x` `` 또는 문장 속 `x는 …` (하이픈 포함 이름, 양쪽 [\w-] 경계)
//   command : `.claude/commands/x.md`, `` `/x` `` (원본 커맨드명만)
//
// 판정: 대상이 설치본에 없으면 → 아래 "조건 범위" 안에 조건부 표기(CONDITIONAL_RE)가 있어야 통과.
//   조건 범위 = ① 같은 논리 줄(리스트 항목+이어지는 줄 / 표 행 / 산문 문단의 같은 문장)
//              ② 조상 헤딩에 조건 표기 (`## 짝 스킬 (설치된 경우 참조)` 섹션 전체)
//              ③ 같은 블록의 도입 줄(`…(설치된 경우 참조):` 로 끝나는 줄) → 그 블록의 나머지 줄
//              ④ 표 헤더 행의 조건 표기 → 그 표의 모든 행
//              ⑤ 코드 펜스 바로 앞 줄의 조건 표기 → 그 코드 블록
//   다른 문단·다른 문장·빈 줄 너머의 조건 표기는 인정하지 않는다(가짜 통과 차단).
//
// 코드 블록 방침: 코드 블록 안 참조도 스캔한다. 설치본의 코드 블록은 대부분 "그대로 실행하라"는 지시
//   (예: `Agent(subagent_type="skill-tester")`)라서 산문보다 오히려 실행력이 높다. 순수 예시라면
//   펜스 바로 앞 줄이나 블록 안에 조건 표기를 달면 된다(⑤).
//
// 3계층 (rules/adversarial-testing.md):
//  - 정상: 템플릿 0~7·9~13 기본 옵션 + 대표 변형(작성 도구 y·SEO y·SEO c·5,11·0+작성 y) 실설치 → 위반 0
//  - 악성·오남용: 다른 문단/문장의 조건 표기로 가짜 통과, 빈 줄로 끊긴 도입 줄, 주석 속 참조로 JS 위장,
//    존재하지 않는 템플릿(8 폐지·99·음수·경로 주입) 설치 시도 거부
//  - 경계: 빈 파일·CRLF·코드 블록·중첩 헤딩 범위 종료·유사 이름(prefix) 충돌·universe 밖 토큰 무시

const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');
const INSTALLER = path.join(REPO, 'project-install.sh');

// ── 원본 레포 universe (참조 후보 판정용) ────────────────────────────────

function walk(dir, pred, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir)) {
    const full = path.join(dir, e);
    const st = fs.lstatSync(full);
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) walk(full, pred, out);
    else if (pred(full)) out.push(full);
  }
  return out;
}

function buildUniverse(root) {
  // 스킬 논리 ID {cat}/{name} — 본체는 1단 .claude/skills/<name>/, 카테고리는 docs 위치 (2026-10-05 평탄화)
  const skillIndex = require('./skill-index.js');
  const skills = new Set(skillIndex.installedSkillIds(root, skillIndex.categoryMap(root)).filter((id) => !id.startsWith('?/')));
  const agentsRoot = path.join(root, '.claude', 'agents');
  const agents = new Set(
    walk(agentsRoot, (f) => f.endsWith('.md'))
      .map((f) => path.basename(f, '.md'))
      .filter((n) => n !== 'CLAUDE' && n !== 'README'),
  );
  const rulesDir = path.join(root, '.claude', 'rules');
  const rules = new Set(fs.existsSync(rulesDir)
    ? fs.readdirSync(rulesDir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : []);
  const cmdDir = path.join(root, '.claude', 'commands');
  const commands = new Set(fs.existsSync(cmdDir)
    ? fs.readdirSync(cmdDir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : []);
  const skillCats = new Set([...skills].map((s) => s.split('/')[0]));
  const agentCats = new Set(fs.existsSync(agentsRoot)
    ? fs.readdirSync(agentsRoot).filter((d) => fs.lstatSync(path.join(agentsRoot, d)).isDirectory()) : []);
  return { skills, agents, rules, commands, skillCats, agentCats };
}

// 조건부 표기 — 레포 실제 표기 조사(2026-09-30) 결과 목록:
//   "설치된 경우"(71) · "설치 시"/"설치 시에만"(12) · "설치된 경우에만"(7) · "미설치"(6) · "설치되지 않은"(3)
//   · "dev 템플릿"(4) · "SEO 옵션 설치 시" · "작성 도구 설치 시에만 존재" · "템플릿에 따라 설치되지 않을 수 있음"
//   · "함께 설치 시에만 존재" · "있으면 활용"/"레포에 있으면 활용" · "설치 템플릿에 따라 없을 수 있으므로"
// "있으면"/"있는 경우" 단독은 조건이 참조 대상이 아닌 다른 것(설정·값)을 가리키는 경우가 많아 제외한다.
const CONDITIONAL_RE = /설치된 경우|설치돼 있으면|설치되어 있으면|설치 시|설치되지 않|미설치|템플릿 전용|dev 템플릿|옵션 설치|있으면 활용|설치본에 (?:있|없)|템플릿에 따라 (?:없|설치되지)/;

// ── 참조 추출 ─────────────────────────────────────────────────────────

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function makeExtractor(U) {
  const ruleNames = [...U.rules].sort((a, b) => b.length - a.length).map(esc).join('|') || '(?!)';
  const agentNames = [...U.agents].sort((a, b) => b.length - a.length).map(esc).join('|') || '(?!)';
  const cmdNames = [...U.commands].sort((a, b) => b.length - a.length).map(esc).join('|') || '(?!)';
  const cats = [...U.skillCats].map(esc).join('|') || '(?!)';

  // rules/x.md — 접두는 없음·`.claude/`·`@.claude/`·`./.claude/` 만 규칙 참조로 인정 (docs/rules/ 등은 제외)
  const RULE_PATH = /(^|[^\w/.-]|@|\.\/)((?:@?\.claude\/)?rules\/([a-z0-9][\w-]*)\.md)(?![\w-])/g;
  const RULE_BARE = new RegExp(`(^|[^\\w/.@-])(${ruleNames})\\.md(?![\\w-])`, 'g');
  // skill: 백틱 span 전체가 `cat/name` (또는 `.claude/skills/cat/name[/…]`) 인 경우, 또는 백틱 밖 `.claude/skills/cat/name` 경로.
  // 백틱 없는 평문 `cat/name` 은 예시 출력 표·사용자 발화 예시(<example>)에서 대상 지시가 아니라 데이터로 쓰이므로 제외
  // (오탐 근거: freshness-auditor 예시 리포트 표의 `backend/axum`, skill-tester <example> 발화 속 스킬명).
  const SKILL_SPAN = new RegExp(`\`(?:\\.claude\\/skills\\/)?((?:${cats})\\/[a-z0-9][a-z0-9-]*)(?:\\/[^\`]*)?\``, 'g');
  const SKILL_PATH = new RegExp(`\\.claude\\/skills\\/((?:${cats})\\/[a-z0-9][a-z0-9-]*)(?![\\w-])`, 'g');
  // 현행 1단 경로 `.claude/skills/<name>` (2026-10-05 평탄화) — 이름 → 논리 ID 로 환원해 같은 판정을 탄다
  const idByName = new Map([...U.skills].map((id) => [id.split('/').pop(), id]));
  const SKILL_FLAT = /\.claude\/skills\/([a-z0-9][a-z0-9.-]*?)(?=\/|`|'|"|\)|\s|$|[^\w.-])/g;
  const AGENT_PATH = /(?:^|[^\w-])(?:\.claude\/)?agents\/([a-z0-9-]+)\/([a-z0-9][\w-]*)\.md/g;
  const AGENT_SUBTYPE = /subagent_type\s*[=:]\s*["'`]?([a-z0-9][\w:-]*)/g;
  const AGENT_NAMED = new RegExp(`(^|[^\\w-])\`?(${agentNames})\`?\\s*(?:\\([^)]*\\)\\s*)?(?:서브\\s*)?(?:에이전트|agent\\b)`, 'g');
  // (2026-10-05 보강) 알려진 에이전트 이름 단독 — 백틱 `seo-auditor` 위임, 문장 속 "skill-creator는 …".
  // 에이전트 이름은 전부 하이픈 포함 고유명이라 일반 단어와 겹치지 않는다. 단어 경계는 양쪽 [\w-] 로 잡아
  // `my-seo-auditor`·`seo-auditor-v2`·`dream-safety-classifier-prompts`(스킬) 같은 접두/접미 확장을 배제하고,
  // 왼쪽에 `/`·`.` 이 붙은 경로 조각(`docs/agents/x/seo-auditor.md`, 스킬 경로)은 경로 규칙에 맡긴다.
  // 하이픈 없는 이름(현재 0개)은 일반 단어 오탐 위험이 있어 단독 매칭에서 뺀다.
  const agentWordNames = [...U.agents].filter((a) => a.includes('-')).sort((a, b) => b.length - a.length).map(esc).join('|') || '(?!)';
  const AGENT_WORD = new RegExp(`(^|[^\\w/.-])(${agentWordNames})(?![\\w-])`, 'g');
  // `validation/seo-auditor` 처럼 에이전트 카테고리 접두가 붙은 이름 (content-quality-reviewer 위임 표 실제 표기).
  // 카테고리는 원본 .claude/agents/ 하위 디렉토리. 스킬 id 와 이름이 겹치는 에이전트는 없다(2026-10-05 확인).
  const agentCats = [...(U.agentCats || [])].map(esc).join('|') || '(?!)';
  // 뒤에 `.md` 가 붙은 맨 경로(`meta/agent-creator.md`)는 제외 — freshness-auditor 예시 리포트 표의 파일 열(데이터)이며,
  // 실제 파일 경로 지시는 `agents/<cat>/<name>.md` 형태로 AGENT_PATH 가 잡는다.
  const AGENT_CATPATH = new RegExp(`(^|[^\\w/.-])(?:${agentCats})\\/(${agentWordNames})(?![\\w-]|\\.md)`, 'g');
  const CMD_PATH = /(?:^|[^\w-])(?:\.claude\/)?commands\/([a-z0-9][\w-]*)\.md/g;
  const CMD_SLASH = new RegExp('`\\/(' + cmdNames + ')(?![\\w-])[^`]*`', 'g');

  return function extract(text) {
    const refs = [];
    let m;
    for (RULE_PATH.lastIndex = 0; (m = RULE_PATH.exec(text));) {
      const before = text.slice(Math.max(0, m.index - 10), m.index + m[1].length);
      if (/docs\/$|[\w-]\/$/.test(before) && !/\.claude\/$/.test(before)) continue;
      refs.push({ kind: 'rule', target: m[3], raw: m[2] });
    }
    for (RULE_BARE.lastIndex = 0; (m = RULE_BARE.exec(text));) refs.push({ kind: 'rule', target: m[2], raw: `${m[2]}.md` });
    for (const RE of [SKILL_SPAN, SKILL_PATH]) {
      for (RE.lastIndex = 0; (m = RE.exec(text));) {
        if (U.skills.has(m[1])) refs.push({ kind: 'skill', target: m[1], raw: m[1] });
      }
    }
    for (SKILL_FLAT.lastIndex = 0; (m = SKILL_FLAT.exec(text));) {
      const id = idByName.get(m[1]);
      if (id) refs.push({ kind: 'skill', target: id, raw: `.claude/skills/${m[1]}` });
    }
    for (AGENT_PATH.lastIndex = 0; (m = AGENT_PATH.exec(text));) {
      if (U.agents.has(m[2])) refs.push({ kind: 'agent', target: m[2], raw: `agents/${m[1]}/${m[2]}.md` });
    }
    for (AGENT_SUBTYPE.lastIndex = 0; (m = AGENT_SUBTYPE.exec(text));) {
      if (U.agents.has(m[1])) refs.push({ kind: 'agent', target: m[1], raw: `subagent_type=${m[1]}` });
    }
    for (AGENT_NAMED.lastIndex = 0; (m = AGENT_NAMED.exec(text));) refs.push({ kind: 'agent', target: m[2], raw: m[2] });
    for (AGENT_WORD.lastIndex = 0; (m = AGENT_WORD.exec(text));) refs.push({ kind: 'agent', target: m[2], raw: m[2] });
    for (AGENT_CATPATH.lastIndex = 0; (m = AGENT_CATPATH.exec(text));) refs.push({ kind: 'agent', target: m[2], raw: m[0].replace(/^[^a-z]/, '') });
    for (CMD_PATH.lastIndex = 0; (m = CMD_PATH.exec(text));) {
      if (U.commands.has(m[1])) refs.push({ kind: 'command', target: m[1], raw: `commands/${m[1]}.md` });
    }
    for (CMD_SLASH.lastIndex = 0; (m = CMD_SLASH.exec(text));) refs.push({ kind: 'command', target: m[1], raw: `/${m[1]}` });
    // 같은 줄 중복 제거
    const seen = new Set();
    return refs.filter((r) => { const k = `${r.kind}|${r.target}`; if (seen.has(k)) return false; seen.add(k); return true; });
  };
}

// ── 설치본 존재 판정 ──────────────────────────────────────────────────

function makeInstalledIndex(dir) {
  const agentsRoot = path.join(dir, '.claude', 'agents');
  const agents = new Set(walk(agentsRoot, (f) => f.endsWith('.md')).map((f) => path.basename(f, '.md')));
  return {
    has(ref) {
      switch (ref.kind) {
        case 'rule': return fs.existsSync(path.join(dir, '.claude', 'rules', `${ref.target}.md`));
        // 논리 ID {cat}/{name} → 설치본 1단 .claude/skills/<name>/SKILL.md (2026-10-05 평탄화)
        case 'skill': return fs.existsSync(path.join(dir, '.claude', 'skills', ref.target.split('/').pop(), 'SKILL.md'));
        case 'agent': return agents.has(ref.target);
        case 'command': return fs.existsSync(path.join(dir, '.claude', 'commands', `${ref.target}.md`));
        default: return false;
      }
    },
  };
}

// ── 마크다운 조건 범위 계산 ─────────────────────────────────────────────

const stripQuote = (l) => l.replace(/^\s*(?:>\s?)+/, '');
const isBlank = (l) => stripQuote(l).trim() === '';
const headingLevel = (l) => { const m = /^(#{1,6})\s/.exec(stripQuote(l)); return m ? m[1].length : 0; };
const isFence = (l) => /^\s*(```|~~~)/.test(stripQuote(l));
const isTableRow = (l) => /^\s*\|/.test(stripQuote(l));
const isTableSep = (l) => /^\s*\|?\s*:?-{2,}/.test(stripQuote(l)) && /-\s*\|/.test(stripQuote(l) + '|');
const isListItem = (l) => /^\s*(?:[-*+]|\d+[.)])\s/.test(stripQuote(l));
// 도입 줄: `…:` / `**…:**` / `…:**` 로 끝나는 줄, 또는 줄 전체가 굵은 라벨(`**짝 스킬 안내 (설치된 경우 참조)**`)
// — 굵은 라벨 단독 줄은 바로 아래 목록의 소제목 역할을 한다 (saju-tarot-data-modeling 실제 표기).
const isLeadIn = (l) => {
  const t = stripQuote(l).trim();
  return /[:：]\s*(?:\*\*)?$/.test(t) || /^\*\*[^*]+\*\*$/.test(t);
};

// 지시가 아닌 기록·예시 줄 — 좁은 예외 (2026-10-05, 에이전트명 단독 매칭 도입 후 첫 실행의 오탐 근거):
//  ① 커밋 제목 예시 `[agent] Add: agent-creator subagent …` (rules/git.md 컨벤션 예시 — 에이전트명이 커밋 데이터)
//  ② 스킬 상단 출처 메타 `> 검증 상태: … skill-tester content test 3/3 PASS` (과거 수행 기록, 호출 지시 아님)
//  줄 앞머리 고정 형식으로만 판정한다 — 목록(`- [agent] …`)·표·산문 줄은 면제되지 않는다.
const EXEMPT_LINE_RE = new RegExp([
  String.raw`^\s*\[(?:agent|skill|docs|config|memory|export)\] (?:Add|Remove|Fix|Modify|Improve|Refactor|Rename|Move|sync): `,
  String.raw`^\s*>\s*검증 상태\s*:`,
].join('|'));

// 산문 문단에서 참조가 든 문장만 떼어낸다 (한국어 "…다." 포함 . ! ? 。 뒤 공백 기준)
function sentencesOf(text) {
  return text.split(/(?<=[.!?。])\s+/);
}

/**
 * 마크다운 텍스트 → 위반 목록. isInstalled(ref) 가 false 이고 조건 범위에 표기가 없으면 위반.
 */
function scanMarkdown(text, extract, isInstalled) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const n = lines.length;
  // 1) 블록(빈 줄로 구분) · 펜스 · 헤딩 스택 계산
  const info = new Array(n);
  const headingStack = []; // {level, marked}
  let inFence = false; let fenceCovered = false; let fenceStart = -1;
  let blockId = 0; let prevBlank = true;
  for (let i = 0; i < n; i++) {
    const l = lines[i];
    if (isFence(l)) {
      if (!inFence) {
        inFence = true; fenceStart = i;
        // ⑤ 펜스 바로 앞 줄(빈 줄 없이)의 조건 표기 → 블록 전체
        fenceCovered = i > 0 && !isBlank(lines[i - 1]) && CONDITIONAL_RE.test(lines[i - 1]);
      } else { inFence = false; }
      info[i] = { fence: true, block: blockId, headingMarked: headingStack.some((h) => h.marked), fenceCovered };
      prevBlank = false;
      continue;
    }
    if (inFence) {
      info[i] = { inFence: true, fenceStart, block: blockId, headingMarked: headingStack.some((h) => h.marked), fenceCovered };
      continue;
    }
    const hl = headingLevel(l);
    if (hl) {
      while (headingStack.length && headingStack[headingStack.length - 1].level >= hl) headingStack.pop();
      headingStack.push({ level: hl, marked: CONDITIONAL_RE.test(l) });
    }
    if (isBlank(l)) { prevBlank = true; info[i] = { blank: true }; continue; }
    if (prevBlank) blockId++;
    prevBlank = false;
    info[i] = { block: blockId, heading: !!hl, headingMarked: headingStack.slice(0, hl ? -1 : undefined).some((h) => h.marked) };
  }
  // 코드 블록 내부 줄의 펜스 조건: 블록 안 아무 줄에 조건 표기가 있어도 인정
  const fenceBodyMarked = new Map();
  for (let i = 0; i < n; i++) {
    if (info[i] && info[i].inFence && CONDITIONAL_RE.test(lines[i])) fenceBodyMarked.set(info[i].fenceStart, true);
  }

  const violations = [];
  for (let i = 0; i < n; i++) {
    const inf = info[i];
    if (!inf || inf.blank || inf.fence) continue;
    if (EXEMPT_LINE_RE.test(lines[i])) continue;
    const refs = extract(lines[i]);
    if (!refs.length) continue;
    const missing = refs.filter((r) => !isInstalled(r));
    if (!missing.length) continue;

    let covered = false;
    if (inf.headingMarked) covered = true;                                  // ②
    if (inf.inFence && (inf.fenceCovered || fenceBodyMarked.get(inf.fenceStart))) covered = true; // ⑤
    if (!covered && inf.inFence) {
      // 코드 블록 줄은 그 줄 자체만 조건 범위
      covered = CONDITIONAL_RE.test(lines[i]);
    } else if (!covered) {
      const l = lines[i];
      // 같은 블록 줄 범위
      let s = i; while (s > 0 && info[s - 1] && !info[s - 1].blank && !info[s - 1].fence && !info[s - 1].inFence && info[s - 1].block === inf.block) s--;
      // ③ 블록의 도입 줄(현재 줄보다 앞) 중 조건 표기 + 콜론 종료
      for (let k = s; k < i && !covered; k++) {
        if (isLeadIn(lines[k]) && CONDITIONAL_RE.test(lines[k])) covered = true;
      }
      // ③' 콜론 도입 줄 + 빈 줄 1개 + 목록/표 — 표준 마크다운 표기(`…조합한다(설치된 경우 참조):` ⏎⏎ `- …`).
      //     바로 다음 블록 하나만, 그 블록이 목록·표로 시작할 때만 인정 (빈 줄 2개 이상·산문 블록·두 번째 목록은 불인정)
      if (!covered && (isListItem(lines[s]) || isTableRow(lines[s]))) {
        let k = s - 1; let blanks = 0;
        while (k >= 0 && info[k] && info[k].blank) { blanks++; k--; }
        if (blanks === 1 && k >= 0 && info[k] && !info[k].inFence && !info[k].fence
          && /[:：]\s*(?:\*\*)?$/.test(stripQuote(lines[k]).trim()) && CONDITIONAL_RE.test(lines[k])) covered = true;
      }
      // ④ 표: 헤더 행(구분선 바로 위)의 조건 표기
      if (!covered && isTableRow(l)) {
        let h = i; while (h > s && isTableRow(lines[h - 1])) h--;
        const header = lines[h];
        if (h + 1 < n && isTableSep(lines[h + 1]) && CONDITIONAL_RE.test(header)) covered = true;
        if (!covered) covered = CONDITIONAL_RE.test(l);                       // ① 표 행 자체
      } else if (!covered && (isListItem(l) || inf.heading)) {
        // ① 리스트 항목 + 이어지는 들여쓰기 줄
        let e = i + 1; let unit = l;
        while (e < n && info[e] && !info[e].blank && info[e].block === inf.block && !isListItem(lines[e]) && !isTableRow(lines[e]) && !headingLevel(lines[e]) && !isFence(lines[e])) { unit += ' ' + lines[e]; e++; }
        covered = CONDITIONAL_RE.test(unit);
      } else if (!covered) {
        // 산문: 리스트 항목의 연속 줄이면 그 항목까지, 아니면 문단 → 같은 문장
        // 시작점: 같은 블록 안에서 표 행·헤딩을 만나기 전까지 거슬러 올라가되, 리스트 항목을 만나면 그 항목에서 멈춤
        let ps = i;
        while (ps > s && !isListItem(lines[ps]) && !isTableRow(lines[ps - 1]) && !headingLevel(lines[ps - 1])) ps--;
        let pe = i + 1; while (pe < n && info[pe] && !info[pe].blank && info[pe].block === inf.block && !isListItem(lines[pe]) && !isTableRow(lines[pe]) && !headingLevel(lines[pe]) && !isFence(lines[pe])) pe++;
        const para = lines.slice(ps, pe).map((x) => stripQuote(x).trim()).join(' ');
        if (isListItem(lines[ps])) {
          covered = CONDITIONAL_RE.test(para);
        } else {
          // 참조별로 "그 참조를 담은 문장"에 조건 표기가 있어야 한다
          const sents = sentencesOf(para);
          const key = (r) => `${r.kind}|${r.target}`;
          const stillMissing = missing.filter((r) => !sents.some((sent) => CONDITIONAL_RE.test(sent) && extract(sent).some((x) => key(x) === key(r))));
          for (const r of stillMissing) violations.push({ line: i + 1, ...r, text: lines[i].trim().slice(0, 160) });
          continue;
        }
      }
    }
    if (!covered) for (const r of missing) violations.push({ line: i + 1, ...r, text: lines[i].trim().slice(0, 160) });
  }
  return violations;
}

// ── JS 훅: 문자열 리터럴만 (주석·정규식 제외) ────────────────────────────

function jsStringLiterals(src) {
  // 주석 제거 후 리터럴 추출 — 간이 토크나이저 (정규식 리터럴은 `/…/` 로 건너뜀)
  const out = [];
  let i = 0; let line = 1; const len = src.length;
  let lastSig = '';
  while (i < len) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < len && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); const end = e < 0 ? len : e + 2; line += (src.slice(i, end).match(/\n/g) || []).length; i = end; continue; }
    if (c === '/' && /[(,=:[!&|?{};]|^$|return$/.test(lastSig)) {
      // 정규식 리터럴 건너뛰기
      i++; let inClass = false;
      while (i < len && src[i] !== '\n') {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === '[') inClass = true; else if (src[i] === ']') inClass = false;
        else if (src[i] === '/' && !inClass) { i++; break; }
        i++;
      }
      while (i < len && /[a-z]/.test(src[i])) i++;
      lastSig = ')';
      continue;
    }
    if (c === '\'' || c === '"' || c === '`') {
      const startLine = line; let j = i + 1; let s = '';
      while (j < len && src[j] !== c) {
        if (src[j] === '\\') { s += src[j + 1] === 'n' ? '\n' : src[j + 1]; j += 2; continue; }
        if (src[j] === '\n') line++;
        s += src[j]; j++;
      }
      out.push({ line: startLine, value: s });
      i = j + 1; lastSig = ')';
      continue;
    }
    if (!/\s/.test(c)) {
      const w = /^[A-Za-z_$][\w$]*/.exec(src.slice(i, i + 40));
      if (w) { lastSig = w[0] === 'return' || w[0] === 'typeof' ? 'return' : ')'; i += w[0].length; continue; }
      lastSig = c;
    }
    i++;
  }
  return out;
}

function scanJs(src, extract, isInstalled) {
  const violations = [];
  const srcLines = src.split('\n');
  for (const lit of jsStringLiterals(src)) {
    for (const piece of lit.value.split('\n')) {
      const missing = extract(piece).filter((r) => !isInstalled(r));
      if (!missing.length) continue;
      // 리터럴 자체 또는 같은 소스 줄에 조건 표기
      if (CONDITIONAL_RE.test(piece) || CONDITIONAL_RE.test(srcLines[lit.line - 1] || '')) continue;
      for (const r of missing) violations.push({ line: lit.line, ...r, text: piece.trim().slice(0, 160) });
    }
  }
  return violations;
}

// ── 설치본 스캔 ────────────────────────────────────────────────────────

// basename 이 정확히 `verification.md` 또는 `<agent>-verification.md` 일 때만 검증 기록 (VERIFICATION_TEMPLATE.md 등은 스캔)
const isVerificationRecord = (f) => /^(?:[a-z0-9-]+-)?verification\.md$/.test(path.basename(f));

function installedScanTargets(dir) {
  const c = path.join(dir, '.claude');
  const md = (f) => f.endsWith('.md');
  const files = [
    ...walk(path.join(c, 'agents'), md),
    ...walk(path.join(c, 'skills'), md),
    ...(fs.existsSync(path.join(c, 'rules')) ? fs.readdirSync(path.join(c, 'rules')).filter(md).map((f) => path.join(c, 'rules', f)) : []),
    ...(fs.existsSync(path.join(c, 'commands')) ? fs.readdirSync(path.join(c, 'commands')).filter(md).map((f) => path.join(c, 'commands', f)) : []),
  ];
  if (fs.existsSync(path.join(dir, 'CLAUDE.md'))) files.push(path.join(dir, 'CLAUDE.md'));
  // (2026-10-05 보강) docs/** — 매니페스트 docs kind 로 설치되는 사용자 열람 문서. 설치본에 실제로 있는 파일만.
  // 단 검증 기록(docs/skills/**/verification.md, docs/agents/**/*-verification.md)은 제외한다 — 소스 레포에서
  // 실제로 일어난 일("수행자: skill-tester", "verification-policy.md 기준 APPROVED")의 과거형 증거라 참조 지시가
  // 아니며, 조건 표기를 덧대면 기록 자체가 변조된다. 첫 실행에서 이 범주만 1,936건(전부 이력 서술)이었다.
  files.push(...walk(path.join(dir, 'docs'), (f) => md(f) && !isVerificationRecord(f)));
  const hooks = fs.existsSync(path.join(c, 'hooks'))
    ? fs.readdirSync(path.join(c, 'hooks')).filter((f) => f.endsWith('.js') && !/\.test\.js$/.test(f)).map((f) => path.join(c, 'hooks', f))
    : [];
  return { md: files, js: hooks };
}

const UNIVERSE = buildUniverse(REPO);
const EXTRACT = makeExtractor(UNIVERSE);

function scanInstalled(dir) {
  const idx = makeInstalledIndex(dir);
  const isInstalled = (r) => idx.has(r);
  const { md, js } = installedScanTargets(dir);
  const out = [];
  for (const f of md) {
    for (const v of scanMarkdown(fs.readFileSync(f, 'utf8'), EXTRACT, isInstalled)) out.push({ file: path.relative(dir, f), ...v });
  }
  for (const f of js) {
    for (const v of scanJs(fs.readFileSync(f, 'utf8'), EXTRACT, isInstalled)) out.push({ file: path.relative(dir, f), ...v });
  }
  return out;
}

const fmt = (vs) => vs.map((v) => `  ${v.file}:${v.line} [${v.kind}:${v.target}] ${v.text}`).join('\n');

// ── 설치 실행 헬퍼 ─────────────────────────────────────────────────────
// project-install.sh 의 `read -rp` 는 비대화형 stdin 에서 프롬프트를 출력하지 않으므로 질문 순서를 위치로 맞춘다.
// 질문 순서(설치 스크립트 기준): memory → superpowers → codex(dev) → legacy(dev&&ts) → SEO(seo-geo | 옵트인) → 작성 도구(util 단독 제외)
// 템플릿 성질 표는 설치 스크립트의 is_dev/is_ts/is_seo_optin 함수와 같아야 한다 — 어긋나면 옵션 효과 단언이 잡는다.
const TMPL = {
  0: { name: 'all', dev: true, ts: true },
  1: { name: 'util' },
  2: { name: 'react-spa', dev: true, ts: true, seoOptin: true },
  3: { name: 'nextjs', dev: true, ts: true, seoOptin: true },
  4: { name: 'rust-axum', dev: true },
  5: { name: 'java-spring-legacy', dev: true },
  6: { name: 'java-spring-modern', dev: true },
  7: { name: 'unity-game', dev: true },
  9: { name: 'dream-interpretation', dev: true, ts: true, seoOptin: true },
  10: { name: 'health', dev: true, ts: true, seoOptin: true },
  11: { name: 'seo-geo', seoGeo: true },
  12: { name: 'fortune-app', dev: true, ts: true, seoOptin: true },
  13: { name: 'python-fastapi', dev: true },
};

function answersFor(tmplInput, { authoring = false, seo = '' } = {}) {
  const ids = String(tmplInput).split(',').map((s) => Number(s.trim()));
  const ts = ids.map((i) => TMPL[i]);
  const any = (k) => ts.some((t) => t[k]);
  const utilOnly = ids.length === 1 && ids[0] === 1;
  const a = ['', '']; // memory, superpowers
  if (any('dev')) a.push('');                 // codex
  if (any('dev') && any('ts')) a.push('');    // legacy
  if (any('seoGeo') || any('seoOptin')) a.push(seo);
  if (!utilOnly) a.push(authoring ? 'y' : '');
  return a;
}

function install(tmpl, dir, answers) {
  const input = `${dir}\n${tmpl}\n` + answers.map((x) => `${x}\n`).join('') + '\n'.repeat(40);
  return spawnSync('bash', [INSTALLER], { input, encoding: 'utf8', timeout: 180000 });
}

function installAndScan(tmpl, opts = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `inst-refs-${String(tmpl).replace(/\W/g, '_')}-`));
  try {
    const r = install(tmpl, dir, answersFor(tmpl, opts));
    assert.strictEqual(r.status, 0, `install(${tmpl}) 실패 status=${r.status}\n${(r.stdout || '').slice(-600)}\n${(r.stderr || '').slice(-300)}`);
    // 옵션 효과 단언 — 위치 응답이 어긋나 다른 옵션으로 설치된 것을 "통과"로 착각하지 않게
    const agentsDir = path.join(dir, '.claude', 'agents');
    const hasAgent = (n) => walk(agentsDir, (f) => path.basename(f) === `${n}.md`).length > 0;
    if (opts.authoring) assert.ok(hasAgent('skill-creator'), `${tmpl}: 작성 도구 y 인데 skill-creator 미설치 (응답 위치 어긋남)`);
    else if (String(tmpl) !== '1') assert.ok(!hasAgent('skill-creator'), `${tmpl}: 작성 도구 n 인데 skill-creator 설치됨 (응답 위치 어긋남)`);
    // 설치 요약 줄로 codex·SEO 응답 위치 확인 (SEO: seo-geo 기본 = 전체(true), 옵트인 기본 = 제외(false))
    assert.match(r.stdout, /Codex 리뷰: false/, `${tmpl}: codex 응답 위치 어긋남`);
    const ids = String(tmpl).split(',').map(Number);
    const seoAsked = ids.some((i) => TMPL[i].seoGeo || TMPL[i].seoOptin);
    if (seoAsked) {
      const want = opts.seo === 'c' ? 'commerce' : (opts.seo === 'y' || ids.some((i) => TMPL[i].seoGeo)) ? 'true' : 'false';
      assert.match(r.stdout, new RegExp(`SEO 스킬: ${want}\\b`), `${tmpl}: SEO 응답 위치 어긋남 (기대 ${want})`);
    }
    const scanned = installedScanTargets(dir);
    assert.ok(scanned.md.length > 0, `${tmpl}: 스캔 대상 마크다운 0개 — 설치 경로 변경 의심`);
    return { dir, violations: scanInstalled(dir) };
  } catch (e) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw e;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 단위: 스캐너 자체 (정상·악성·경계)
// ═══════════════════════════════════════════════════════════════════════

const FAKE_U = {
  skills: new Set(['frontend/nextjs', 'frontend/nextjs-seo', 'devops/n8n-self-hosting']),
  agents: new Set(['skill-tester', 'seo-auditor', 'skill-creator']),
  rules: new Set(['agent-design', 'git', 'commands']),
  commands: new Set(['commit', 'codex-review']),
  skillCats: new Set(['frontend', 'devops']),
  agentCats: new Set(['meta', 'validation']),
};
const FX = makeExtractor(FAKE_U);
// 설치본 가정: git 규칙·frontend/nextjs·commit 만 있음
const FAKE_INSTALLED = (r) => (r.kind === 'rule' && r.target === 'git')
  || (r.kind === 'skill' && r.target === 'frontend/nextjs')
  || (r.kind === 'command' && r.target === 'commit');
const scanFx = (md) => scanMarkdown(md, FX, FAKE_INSTALLED);

test('정상: 설치된 대상 참조는 조건 표기 없이 통과', () => {
  assert.deepStrictEqual(scanFx('규칙은 @.claude/rules/git.md 참조. 스킬 `frontend/nextjs`, 커맨드 `/commit`.\n'), []);
});

test('정상: 미설치 대상 + 같은 줄 조건 표기 → 통과', () => {
  assert.deepStrictEqual(scanFx('- `devops/n8n-self-hosting` (설치된 경우 참조)\n'), []);
  assert.deepStrictEqual(scanFx('참고: @.claude/rules/agent-design.md (작성 도구 설치 시에만 존재)\n'), []);
});

test('정상: 조상 헤딩·도입 줄·표 헤더의 조건 표기는 해당 범위를 덮는다', () => {
  assert.deepStrictEqual(scanFx('## 짝 스킬 (설치된 경우 참조)\n\n| 스킬 | 범위 |\n|---|---|\n| `devops/n8n-self-hosting` | 운영 |\n\n### 하위\n- `frontend/nextjs-seo`\n'), []);
  assert.deepStrictEqual(scanFx('**연계 스킬 (설치된 경우 참조):**\n- `frontend/nextjs-seo` — 메타\n- `devops/n8n-self-hosting`\n'), []);
  assert.deepStrictEqual(scanFx('| 스킬 (설치된 경우) | 용도 |\n|---|---|\n| `frontend/nextjs-seo` | x |\n'), []);
  assert.deepStrictEqual(scanFx('> **짝 스킬 안내 (설치된 경우 참조)**\n> - `frontend/nextjs-seo` — x\n> - `devops/n8n-self-hosting`\n'), []);
});

test('정상: 참조 종류별 추출 (rule 경로·단독 파일명·skill·agent 경로/subagent_type/명칭·command)', () => {
  const kinds = (s) => FX(s).map((r) => `${r.kind}:${r.target}`).sort();
  assert.deepStrictEqual(kinds('`@.claude/rules/agent-design.md` 와 git.md'), ['rule:agent-design', 'rule:git']);
  assert.deepStrictEqual(kinds('Agent(subagent_type="skill-tester")'), ['agent:skill-tester']);
  assert.deepStrictEqual(kinds('`seo-auditor` 에이전트 호출, agents/validation/seo-auditor.md'), ['agent:seo-auditor']);
  assert.deepStrictEqual(kinds('`/codex-review` 실행, .claude/commands/commit.md'), ['command:codex-review', 'command:commit']);
});

test('악성: 조건 표기가 다른 문단에 있으면 가짜 통과 불가', () => {
  const v = scanFx('이 스킬은 설치된 경우에만 동작한다.\n\n`devops/n8n-self-hosting` 을 먼저 읽어라.\n');
  assert.strictEqual(v.length, 1);
  assert.strictEqual(v[0].target, 'devops/n8n-self-hosting');
});

test('악성: 같은 문단이라도 다른 문장의 조건 표기는 불인정', () => {
  const v = scanFx('도구는 설치된 경우에만 쓴다. 규칙은 @.claude/rules/agent-design.md 를 따른다.\n');
  assert.strictEqual(v.length, 1);
  assert.strictEqual(v[0].kind, 'rule');
});

test('악성: 빈 줄로 끊긴 도입 줄·범위가 끝난 헤딩은 덮지 못한다', () => {
  // 콜론 도입 줄 + 빈 줄 1개 + 목록 = 표준 표기 → 인정. 그 이상은 전부 불인정
  assert.deepStrictEqual(scanFx('아래와 조합한다(설치된 경우 참조):\n\n- `devops/n8n-self-hosting`\n'), []);
  assert.strictEqual(scanFx('아래와 조합한다(설치된 경우 참조):\n\n\n- `devops/n8n-self-hosting`\n').length, 1, '빈 줄 2개 너머 도입 줄 인정됨');
  assert.strictEqual(scanFx('**연계 (설치된 경우 참조)**\n\n- `devops/n8n-self-hosting`\n').length, 1, '콜론 없는 굵은 라벨이 빈 줄 너머까지 인정됨');
  assert.strictEqual(scanFx('아래와 조합한다(설치된 경우 참조):\n\n`devops/n8n-self-hosting` 을 읽는다.\n').length, 1, '산문 블록에 도입 줄 인정됨');
  assert.deepStrictEqual(scanFx('조합(설치된 경우 참조):\n\n- `frontend/nextjs-seo`\n\n- `devops/n8n-self-hosting`\n').map((v) => v.target),
    ['devops/n8n-self-hosting'], '도입 줄이 두 번째 목록 블록까지 덮음');
  const closed = scanFx('## A (설치된 경우 참조)\n- `frontend/nextjs-seo`\n## B\n- `devops/n8n-self-hosting`\n');
  assert.deepStrictEqual(closed.map((v) => v.target), ['devops/n8n-self-hosting'], '형제 헤딩으로 범위가 닫히지 않음');
  const nonLeadIn = scanFx('설치된 경우 참조 문구가 있지만 콜론이 없는 줄\n- `devops/n8n-self-hosting`\n');
  assert.strictEqual(nonLeadIn.length, 1, '콜론 없는 줄이 도입 줄로 인정됨');
});

test('악성: 조건 표기 없는 표 행은 다른 행의 표기로 통과하지 못한다', () => {
  const v = scanFx('| 스킬 | 비고 |\n|---|---|\n| `frontend/nextjs-seo` | 설치된 경우 |\n| `devops/n8n-self-hosting` | 운영 |\n');
  assert.deepStrictEqual(v.map((x) => x.target), ['devops/n8n-self-hosting']);
});

test('악성: JS 주석·정규식 속 참조는 메시지가 아니다 / 문자열 리터럴 속 참조는 잡는다', () => {
  const src = [
    '// 참조: @.claude/rules/agent-design.md',
    '/* skill-tester 에이전트 */',
    'const re = /skill-tester\\s+호출/;',
    "const msg = '참고: @.claude/rules/agent-design.md';",
    "const ok = '참고: @.claude/rules/agent-design.md (설치된 경우)';",
  ].join('\n');
  const v = scanJs(src, FX, FAKE_INSTALLED);
  assert.deepStrictEqual(v.map((x) => `${x.line}:${x.target}`), ['4:agent-design']);
});

test('경계: 빈 파일·CRLF·blockquote·코드 블록', () => {
  assert.deepStrictEqual(scanFx(''), []);
  assert.strictEqual(scanFx('`devops/n8n-self-hosting` 참조\r\n').length, 1, 'CRLF 에서 누락');
  assert.deepStrictEqual(scanFx('> **연계 (설치된 경우 참조):**\r\n> - `frontend/nextjs-seo`\r\n'), []);
  // 코드 블록: 조건 없으면 위반, 펜스 바로 앞 줄 조건이면 통과
  assert.strictEqual(scanFx('```\nAgent(subagent_type="skill-tester")\n```\n').length, 1);
  assert.deepStrictEqual(scanFx('작성 도구 설치 시:\n```\nAgent(subagent_type="skill-tester")\n```\n'), []);
  // 펜스 앞 빈 줄 → 인정 안 함
  assert.strictEqual(scanFx('작성 도구 설치 시:\n\n```\nAgent(subagent_type="skill-tester")\n```\n').length, 1);
});

test('경계: 접두 유사 이름·universe 밖 토큰·docs 경로는 오탐하지 않는다', () => {
  // frontend/nextjs 설치 + frontend/nextjs-seo 미설치 — prefix 로 뒤섞이면 안 됨
  assert.deepStrictEqual(FX('`frontend/nextjs`').map((r) => r.target), ['frontend/nextjs']);
  assert.deepStrictEqual(FX('`frontend/nextjs-seo`').map((r) => r.target), ['frontend/nextjs-seo']);
  assert.deepStrictEqual(FX('`frontend/unknown-thing` react/jsx src/frontend/nextjs'), []);
  // 백틱 없는 평문 id 는 예시 데이터로 보고 무시, `.claude/skills/` 경로는 백틱 없이도 참조
  assert.deepStrictEqual(FX('| ⚠️ | frontend/nextjs-seo | 2026-08-10 |'), []);
  assert.deepStrictEqual(FX('.claude/skills/frontend/nextjs-seo/SKILL.md 를 읽어라').map((r) => r.target), ['frontend/nextjs-seo']);
  assert.deepStrictEqual(FX('`.claude/skills/devops/n8n-self-hosting/references/REFERENCE.md`').map((r) => r.target), ['devops/n8n-self-hosting']);
  assert.deepStrictEqual(FX('docs/skills/frontend/nextjs-seo/verification.md docs/rules/agent-design.md'), []);
  assert.deepStrictEqual(FX('my-git.md, legit.md, git.mdx'), []);
});

test('2026-10-05 평탄화: 현행 1단 경로 `.claude/skills/<name>` 참조도 논리 ID 로 잡고, 접두 유사·자리표시자·비스킬은 무시', () => {
  assert.deepStrictEqual(FX('.claude/skills/nextjs-seo/SKILL.md 를 읽어라').map((r) => r.target), ['frontend/nextjs-seo']);
  assert.deepStrictEqual(FX('`.claude/skills/nextjs/SKILL.md`').map((r) => r.target), ['frontend/nextjs']);
  assert.deepStrictEqual(FX('`.claude/skills/n8n-self-hosting/references/REFERENCE.md`').map((r) => r.target), ['devops/n8n-self-hosting']);
  // 자리표시자·스킬 폴더 아닌 파일·universe 밖 이름·접미 확장
  assert.deepStrictEqual(FX('.claude/skills/{name}/SKILL.md · .claude/skills/<name>/ · .claude/skills/CLAUDE.md'), []);
  assert.deepStrictEqual(FX('.claude/skills/unknown-thing/SKILL.md .claude/skills/nextjs-seo-extra/SKILL.md'), []);
});

// ── 2026-10-05 보강: 에이전트명 단독 참조 · docs 스캔 (설치본 감사 제보 3건의 형태) ──

test('악성(제보 형태 a): 백틱 `seo-auditor` 위임은 "에이전트" 접미 없이도 잡는다', () => {
  // a11y-auditor.md 383행 형태
  assert.deepStrictEqual(scanFx('- 추가 검증:\n  - SEO 영역 → `seo-auditor` (짝 감사 에이전트)\n').map((v) => v.target), ['seo-auditor']);
  // 407행 형태 — 표 행 속 나열
  assert.deepStrictEqual(scanFx('| 상황 | 대응 |\n|---|---|\n| 영역 외 | `seo-auditor`·`build-x` 권장 |\n').map((v) => v.target), ['seo-auditor']);
  // 카테고리 접두 형태 `validation/seo-auditor`
  assert.deepStrictEqual(scanFx('- 기술 SEO → `validation/seo-auditor`\n').map((v) => v.target), ['seo-auditor']);
});

test('악성(제보 형태 b): 문장 속 에이전트명 "skill-creator는 …" — 마크다운·훅 문자열 모두', () => {
  assert.deepStrictEqual(scanFx('작성 시 skill-creator는 반드시 WebSearch로 조사한다.\n').map((v) => v.target), ['skill-creator']);
  // verification-guard.js 58행 형태
  const src = "errors.push(\n  '에이전트 로그에 \"내장 지식\" 구문이 감지됐습니다.\\n' +\n  '  → skill-creator는 반드시 WebSearch/WebFetch로 공식 문서를 직접 조사·교차 검증해야 합니다.\\n'\n)\n";
  assert.deepStrictEqual(scanJs(src, FX, FAKE_INSTALLED).map((v) => `${v.line}:${v.target}`), ['3:skill-creator']);
  // 주석 속 에이전트명은 여전히 무시
  assert.deepStrictEqual(scanJs('// skill-creator는 내부 구현 메모\nconst x = 1;\n', FX, FAKE_INSTALLED), []);
});

test('악성(제보 형태 c): docs 의 "관련 에이전트" 목록 — 굵은 이름 나열도 잡는다', () => {
  const doc = '## 관련 에이전트\n\n- **skill-creator** (meta) -- 감사 결과 스킬 재검증/재작성이 필요할 때\n';
  assert.deepStrictEqual(scanFx(doc).map((v) => v.target), ['skill-creator']);
});

test('정상: 세 형태 모두 같은 범위의 조건 표기가 있으면 통과', () => {
  assert.deepStrictEqual(scanFx('- SEO 영역 → `seo-auditor` (SEO 옵션 설치 시)\n'), []);
  assert.deepStrictEqual(scanFx('작성 시 skill-creator(작성 도구 설치 시)는 반드시 WebSearch로 조사한다.\n'), []);
  assert.deepStrictEqual(scanJs("const m = '→ skill-creator(작성 도구 설치 시)는 반드시 조사';\n", FX, FAKE_INSTALLED), []);
  assert.deepStrictEqual(scanFx('## 관련 에이전트 (설치된 경우 참조)\n\n- **skill-creator** (meta) -- x\n- `validation/seo-auditor`\n'), []);
});

test('악성: 다른 문장의 조건 표기로 에이전트명 단독 참조를 가짜 통과시키지 못한다', () => {
  const v = scanFx('도구는 설치된 경우에만 쓴다. 결과는 skill-creator가 재작성한다.\n');
  assert.deepStrictEqual(v.map((x) => x.target), ['skill-creator']);
});

test('경계: 에이전트명과 비슷한 일반 단어·확장 이름·경로 조각은 오탐하지 않는다', () => {
  const agentRefs = (s) => FX(s).filter((r) => r.kind === 'agent').map((r) => r.target);
  for (const s of [
    'my-seo-auditor 와 seo-auditor-v2, seo-auditors 는 다른 이름이다',
    'skill creator·seo auditor·auditor·creator·skill-creators·pre-skill-creator',
    'skill-tested, skill-testers, skill-tester_x, skill-tester2',
    '`frontend/seo-auditor-guide` 스킬과 src/seo-auditor 디렉토리, ./seo-auditor 실행 파일',
    'SEO-AUDITOR 대문자 표기와 Skill-Creator 제목 표기',
  ]) assert.deepStrictEqual(agentRefs(s), [], `오탐: ${s}`);
  // 예시 리포트 표의 맨 파일 경로(`meta/skill-creator.md`)는 데이터 — 단, 다이어그램 속 `validation/seo-auditor` 는 참조
  assert.deepStrictEqual(agentRefs('| ❌ | meta/skill-creator.md | 모델 ID deprecated |'), []);
  assert.deepStrictEqual(agentRefs('  validation/seo-auditor — 기술 SEO 점검'), ['seo-auditor']);
  // 한국어 조사가 바로 붙어도 이름 경계로 인정 (\w 는 ASCII 만)
  assert.deepStrictEqual(agentRefs('seo-auditor와 skill-creator는'), ['seo-auditor', 'skill-creator']);
  // 문장 끝 마침표·괄호·백틱 경계
  assert.deepStrictEqual(agentRefs('(skill-tester). `seo-auditor`.'), ['skill-tester', 'seo-auditor']);
});

test('경계: 좁은 예외 — 커밋 제목 예시·출처 메타 줄만 면제, 목록·산문으로 위장하면 면제 안 됨', () => {
  assert.deepStrictEqual(scanFx('```\n[agent] Add: skill-creator subagent for generating MD\n```\n'), []);
  assert.deepStrictEqual(scanFx('> 검증 상태: skill-tester content test 3/3 PASS → APPROVED\n'), []);
  assert.strictEqual(scanFx('- [agent] Add: skill-creator 를 호출하라\n').length, 1, '목록 줄이 커밋 예시로 면제됨');
  assert.strictEqual(scanFx('작업 후 [agent] Add: skill-creator 호출\n').length, 1, '산문 중간의 커밋 형식이 면제됨');
  assert.strictEqual(scanFx('> 참고: skill-tester 로 검증하라\n').length, 1, '검증 상태 외 인용 줄이 면제됨');
});

test('경계: docs 검증 기록 판정은 basename 정확 일치만 (템플릿·유사 이름은 스캔 대상)', () => {
  for (const f of ['docs/skills/frontend/x/verification.md', 'docs/agents/meta/freshness-auditor-verification.md']) {
    assert.ok(isVerificationRecord(f), `검증 기록 미인식: ${f}`);
  }
  for (const f of ['docs/skills/VERIFICATION_TEMPLATE.md', 'docs/agents/meta/freshness-auditor.md',
    'docs/hooks/verification-guard.md', 'docs/x/verification.md.bak', 'docs/x/my_verification.md']) {
    assert.ok(!isVerificationRecord(f), `검증 기록으로 오인(스캔 누락): ${f}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════
// E2E: 실제 설치본 스캔
// ═══════════════════════════════════════════════════════════════════════

const CASES = [
  ...[0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13].map((t) => ({ tmpl: String(t), opts: {}, label: `${t}(${TMPL[t].name}) 기본` })),
  { tmpl: '5', opts: { authoring: true }, label: '5 + 작성 도구 y' },
  { tmpl: '3', opts: { seo: 'y' }, label: '3 + SEO y' },
  { tmpl: '10', opts: { seo: 'c' }, label: '10 + SEO c(커머스)' },
  { tmpl: '2', opts: { seo: 'y', authoring: true }, label: '2 + SEO y + 작성 도구 y' },
  { tmpl: '5,11', opts: {}, label: '5,11 기본(SEO 전체)' },
  { tmpl: '5,11', opts: { seo: 'c' }, label: '5,11 + SEO c' },
  { tmpl: '0', opts: { authoring: true }, label: '0(all) + 작성 도구 y' },
];

for (const c of CASES) {
  test(`설치본 참조 무결성: ${c.label}`, () => {
    const { dir, violations } = installAndScan(c.tmpl, c.opts);
    try {
      assert.strictEqual(violations.length, 0,
        `${c.label}: 설치되지 않은 대상을 조건 표기 없이 가리키는 참조 ${violations.length}건\n${fmt(violations)}`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}

// ── 악성: 실제 설치본에 무조건 참조를 주입하면 파일 종류별로 모두 잡혀야 한다 (스캐너 공회전 방지) ──
test('악성: 설치본(5)에 미설치 대상 무조건 참조 주입 → 에이전트·CLAUDE.md·규칙·훅 문자열 모두 탐지', () => {
  const { dir, violations: before } = installAndScan('5');
  try {
    assert.strictEqual(before.length, 0, `주입 전부터 위반 존재\n${fmt(before)}`);
    const agent = walk(path.join(dir, '.claude', 'agents'), (f) => f.endsWith('.md') && !f.endsWith('CLAUDE.md'))[0];
    const rule = path.join(dir, '.claude', 'rules', 'git.md');
    const hook = walk(path.join(dir, '.claude', 'hooks'), (f) => f.endsWith('.js'))[0];
    assert.ok(agent && fs.existsSync(rule) && hook, '주입 대상 파일 없음');
    // java 템플릿엔 frontend/nextjs·agent-design(작성 도구 n)·skill-tester·/codex-review(codex n)가 없다
    fs.appendFileSync(agent, '\n\n작업 전 `frontend/nextjs` 를 읽어라.\n');
    fs.appendFileSync(path.join(dir, 'CLAUDE.md'), '\n\n규칙: @.claude/rules/agent-design.md\n');
    fs.appendFileSync(rule, '\n\n리뷰는 `/codex-review` 로 실행한다.\n');
    fs.appendFileSync(hook, "\n// 주석 속 skill-tester 에이전트 는 무시돼야 한다\nconst __injected = '조치: skill-tester 에이전트 호출';\n");
    const after = scanInstalled(dir).map((v) => `${v.file}|${v.kind}:${v.target}`).sort();
    const rel = (f) => path.relative(dir, f);
    assert.deepStrictEqual(after, [
      `${rel(hook)}|agent:skill-tester`,
      `${rel(agent)}|skill:frontend/nextjs`,
      `${rel(rule)}|command:codex-review`,
      'CLAUDE.md|rule:agent-design',
    ].sort());
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ── 악성 (2026-10-05): 제보 3형태를 실제 설치본에 주입 → 백틱 단독·문장 속(훅)·docs 모두 탐지, 검증 기록은 면제 ──
test('악성: 설치본(5)에 에이전트명 단독 참조 주입 → 에이전트 백틱·훅 문장·docs 목록 탐지, verification 기록은 제외', () => {
  const { dir, violations: before } = installAndScan('5');
  try {
    assert.strictEqual(before.length, 0, `주입 전부터 위반 존재\n${fmt(before)}`);
    const agent = walk(path.join(dir, '.claude', 'agents'), (f) => f.endsWith('.md') && !f.endsWith('CLAUDE.md'))[0];
    const hook = walk(path.join(dir, '.claude', 'hooks'), (f) => f.endsWith('.js') && !f.endsWith('.test.js'))[0];
    const doc = walk(path.join(dir, 'docs'), (f) => f.endsWith('.md') && !isVerificationRecord(f))[0];
    const record = walk(path.join(dir, 'docs'), (f) => isVerificationRecord(f))[0];
    assert.ok(agent && hook && doc && record, `주입 대상 파일 없음 (agent=${agent} hook=${hook} doc=${doc} record=${record})`);
    // java-spring-legacy 기본(SEO 질문 없음·작성 도구 n)엔 seo-auditor·skill-creator 가 없다
    fs.appendFileSync(agent, '\n\n- SEO 영역 → `seo-auditor` (짝 감사)\n');
    fs.appendFileSync(hook, "\nconst __injected2 = '  → skill-creator는 반드시 공식 문서를 조사해야 합니다.';\n");
    fs.appendFileSync(doc, '\n\n## 관련 에이전트\n\n- **skill-creator** (meta) -- 스킬 재작성이 필요할 때\n');
    fs.appendFileSync(record, '\n\n**수행자**: skill-creator → seo-auditor\n');
    const rel = (f) => path.relative(dir, f);
    const after = scanInstalled(dir).map((v) => `${v.file}|${v.kind}:${v.target}`).sort();
    assert.deepStrictEqual(after, [
      `${rel(agent)}|agent:seo-auditor`,
      `${rel(doc)}|agent:skill-creator`,
      `${rel(hook)}|agent:skill-creator`,
    ].sort());
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ── 악성: 존재하지 않는 템플릿 조합은 설치 자체가 거부돼야 한다 ─────────────
for (const bad of ['8', '99', '-1', '5,8', '../../etc', 'academic']) {
  test(`악성: 존재하지 않는 템플릿 '${bad}' 설치 거부 + 대상 무변경`, () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'inst-refs-bad-'));
    try {
      const r = install(bad, dir, []);
      assert.notStrictEqual(r.status, 0, `'${bad}' 가 설치 성공으로 끝남`);
      assert.match(r.stdout + r.stderr, /알 수 없는 템플릿/);
      assert.ok(!fs.existsSync(path.join(dir, '.claude')), `'${bad}' 거부 후에도 .claude/ 가 생성됨`);
      assert.ok(!fs.existsSync(path.join(dir, 'CLAUDE.md')), `'${bad}' 거부 후에도 CLAUDE.md 가 생성됨`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}

module.exports = { buildUniverse, makeExtractor, scanMarkdown, scanJs, scanInstalled, isVerificationRecord, CONDITIONAL_RE };
