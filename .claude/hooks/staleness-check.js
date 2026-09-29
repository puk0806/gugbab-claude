// SessionStart (레거시: InstructionsLoaded) — 스킬 검증일 경과 감지
// 사용: node staleness-check.js [--strict]
//
// --strict 모드 (export 선택 시 활성화):
//   60일 초과 → stdout 강제 지시 주입 (Claude 컨텍스트에 직접 주입, 다른 작업 불가)
//   30~59일   → stderr 재검증 권고
//
// 일반 모드:
//   60일 초과 → 경고 + 참고 안내 (SessionStart: 현재 요청 우선, 응답 끝에 재검증 안내 — 질문 강요 없음)
//   30~59일   → 무시
//
// SessionStart 모드 (stdin hook_event_name === 'SessionStart', 정확 일치):
//   공식 문서(code.claude.com/docs/en/hooks) — InstructionsLoaded 는 "Claude Code discards their JSON output fields",
//   stdout 은 "For most events ... writes stdout to the debug log" (예외: SessionStart 등), exit 0 stderr 는
//   "debug log only ... Claude never sees it". 즉 레거시(InstructionsLoaded) 경로의 출력은 아무에게도 전달되지 않는다.
//   → SessionStart 에서는 stdout JSON 하나로 출력:
//      hookSpecificOutput.additionalContext = Claude 지시(60일 초과만), systemMessage = 사용자 요약(60일 초과 + 30~59일)
//   /clear 는 SessionStart source="clear" 로 발화하므로 기존 "InstructionsLoaded 사용 이유(/clear 커버)"도 충족된다.

const fs = require('fs');
const path = require('path');

const STRICT = process.argv.includes('--strict');
const CAP = 9000; // 문서 상한 10,000자 여유

function readEvent() {
  try {
    if (process.stdin.isTTY) return null;
    const raw = fs.readFileSync(0, 'utf8').trim();
    if (!raw) return null;
    const j = JSON.parse(raw);
    return j && typeof j === 'object' ? j : null;
  } catch { return null; }
}
const EVENT = readEvent();
const SESSION_START = !!EVENT && EVENT.hook_event_name === 'SessionStart';
// source 분기 (공식 source: startup | resume | clear | compact | fork)
//   startup·clear → Claude 지시(additionalContext) + 사용자 요약(systemMessage) — 새 대화의 시작점
//   compact       → 무출력 — 자동 압축은 작업 도중 발생. 요약에 이전 대화가 보존되고, 매번 지시하면 작업이 끊긴다
//   resume·fork   → 사용자 요약만 — 이전 대화에 이미 안내됐고, 이어받은 작업을 질문으로 끊지 않는다
//   누락·알 수 없는 값·타입 위장 → 사용자 요약만(보수적: 작업을 끊는 지시는 명시된 startup/clear 에서만)
const SOURCE = EVENT && typeof EVENT.source === 'string' ? EVENT.source : null;
const INSTRUCT_SOURCES = new Set(['startup', 'clear']);
const clip = (s) => (s.length > CAP ? s.slice(0, CAP - 20) + '\n  ... (생략)' : s);
const STALE_DAYS = 60;
const WARN_DAYS  = 30;

// ── 검증일 결정 (2026-09-26 개편) ─────────────────────────────────────
// 과거: verification.md 에서 "처음 매칭되는 `> 검증일:`" 을 읽었다. 레포 237개 verification.md 실측 결과
//   - 줄 시작 `> 검증일:` 을 가진 파일은 0개, 매칭된 19개는 전부 체크리스트 문장 안 백틱 예시
//     ("- [✅] 소스 URL과 검증일 명시 (`> 소스:` + `> 검증일: 2026-06-10`)") 의 옛 날짜였고,
//   - 나머지 218개는 매칭 실패로 **조용히 누락**됐다.
//   → 재검증(SKILL.md 갱신) 후에도 옛 날짜로 60일 초과 보고, 나머지는 영원히 감시 밖.
// 신뢰 소스 (실측 형식 분포: SKILL.md 줄 시작 인용 237/237, frontmatter date 237/237,
//             메타 표 `| 검증일 |` 200/237, 섹션 8 변경 이력 237/237):
//   (a) SKILL.md 줄 시작 `> 검증일: YYYY-MM-DD` (첫 줄만 — 헤더 인용 블록. 중복 추가로 신선 위장 방지)
//   (b) verification.md 줄 시작 `> 검증일:` (첫 줄만 — 구형식 호환)
//   (c) verification.md 메타 표 `| 검증일 | … |` 첫 행 — 셀 안 날짜 중 최신("2026-06-01 (최초) / 2026-08-26")
//   (d) verification.md frontmatter `date:` (파일 첫 줄 `---` 블록 안에서만)
//   (e) verification.md `## 8.` 섹션 표 중 "재검증"·"freshness" 가 들어간 행의 날짜 — 재검증 기록이 곧 검증 증거
//   → 후보들의 **최신값** 채택. 한 소스만 갱신돼도(재검증 절차 누락) 오탐하지 않는다.
// 무시: 코드펜스 안, 줄 중간(체크리스트·백틱·문장 안 인용), 섹션 8 밖 표, 달력상 무효(2026-02-30),
//       미래 날짜(오늘+1일 초과 — "영원히 신선" 위장 차단, 1일은 타임존 허용오차).
// 후보가 하나도 없으면 days=null 로 **판독 불가** 보고 — 조용한 누락 금지.
// SKILL.md 는 심볼릭 링크면 읽지 않는다(외부 파일로 신선 위장 차단). 경로는 docs/skills 상대경로와 동일 구조.
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const TODAY_UTC = (() => { const n = new Date(); return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()); })();

function parseDate(s) {
  const m = ISO.exec(s);
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(t);
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null; // 2026-02-30 등
  if (t > TODAY_UTC + 86400000) return null; // 미래
  return t;
}

const stripFences = (s) => s.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '');
const datesIn = (s) => (s.match(/\d{4}-\d{2}-\d{2}/g) || []);

function candidatesFromVerification(raw) {
  const out = [];
  const fm = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
  if (fm) {
    const d = /^date:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m.exec(fm[1]);
    if (d) out.push(d[1]);
  }
  const body = stripFences(fm ? raw.slice(fm[0].length) : raw);
  const bq = /^>\s*검증일\s*:\s*(\d{4}-\d{2}-\d{2})/m.exec(body);
  if (bq) out.push(bq[1]);
  const meta = /^\|\s*\**검증일\**\s*\|([^|\n]*)\|/m.exec(body);
  if (meta) out.push(...datesIn(meta[1]));
  const sec8 = /^##\s*8\.[^\n]*\n([\s\S]*?)(?=^##\s|(?![\s\S]))/m.exec(body);
  if (sec8) {
    for (const line of sec8[1].split('\n')) {
      const row = /^\|\s*\**(\d{4}-\d{2}-\d{2})\**\s*\|(.*)$/.exec(line);
      if (row && /재검증|freshness/i.test(row[2])) out.push(row[1]);
    }
  }
  return out;
}

function candidatesFromSkillMd(file) {
  try {
    if (!fs.lstatSync(file).isFile()) return [];
    const m = /^>\s*검증일\s*:\s*(\d{4}-\d{2}-\d{2})/m.exec(stripFences(fs.readFileSync(file, 'utf8')));
    return m ? [m[1]] : [];
  } catch { return []; }
}

function resolveDate(verifPath, skillMdPath) {
  let best = null;
  let raw = '';
  try { raw = fs.readFileSync(verifPath, 'utf8'); } catch {}
  for (const s of [...candidatesFromVerification(raw), ...(skillMdPath ? candidatesFromSkillMd(skillMdPath) : [])]) {
    const t = parseDate(s);
    if (t !== null && (best === null || t > best)) best = t;
  }
  return best;
}

function scan(dir, results, docsDir, skillsDir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full, results, docsDir, skillsDir);
    } else if (entry.name === 'verification.md' && entry.isFile()) {
      try {
        const rel = path.relative(docsDir, dir);
        const skillMd = path.join(skillsDir, rel, 'SKILL.md');
        const inside = !rel.startsWith('..') && !path.isAbsolute(rel) && skillMd.startsWith(skillsDir + path.sep);
        const t = resolveDate(full, inside ? skillMd : null);
        if (t === null) {
          results.push({ path: full, date: null, days: null });
        } else {
          const days = Math.floor((TODAY_UTC - t) / 86400000);
          if (days > WARN_DAYS) results.push({ path: full, date: new Date(t).toISOString().slice(0, 10), days });
        }
      } catch {}
    }
  }
}

try {
  const docsDir = path.join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), 'docs', 'skills');
  if (!fs.existsSync(docsDir)) process.exit(0);

  const skillsDir = path.join(path.dirname(path.dirname(docsDir)), '.claude', 'skills');
  const all = [];
  scan(docsDir, all, docsDir, skillsDir);
  if (all.length === 0) process.exit(0);

  const undated = all.filter(s => s.days === null).sort((a, b) => a.path.localeCompare(b.path)); // 판독 불가
  const dated = all.filter(s => s.days !== null).sort((a, b) => b.days - a.days);
  const stale = dated.filter(s => s.days > STALE_DAYS);  // 60일 초과
  const warn  = dated.filter(s => s.days > WARN_DAYS && s.days <= STALE_DAYS); // 30~59일
  const urgentCount = stale.length + undated.length;    // 즉시 재검증 대상(60일 초과 + 판독 불가)

  function formatList(items, limit = 10) {
    const lines = items.slice(0, limit).map(s => {
      const rel = path.relative(docsDir, path.dirname(s.path));
      return s.days === null
        ? `  - ${rel.padEnd(50)} (검증일 판독 불가 — SKILL.md \`> 검증일:\`·메타 표 확인)`
        : `  - ${rel.padEnd(50)} ${s.date}  (${s.days}일 경과)`;
    });
    if (items.length > limit) lines.push(`  ... 외 ${items.length - limit}종`);
    return lines.join('\n');
  }
  // 60일 초과 블록 + 판독 불가 블록 (sfx: 레거시 일반 모드 헤더 뒤 ':' 유지)
  function urgentLines(sfx = '') {
    const L = [];
    if (stale.length > 0) L.push(`[staleness-check] 검증일 ${STALE_DAYS}일 초과 스킬 ${stale.length}종 감지${sfx}`, '', formatList(stale));
    if (undated.length > 0) {
      if (L.length) L.push('');
      L.push(`[staleness-check] 검증일 판독 불가 스킬 ${undated.length}종${sfx || ' 감지'}`, '', formatList(undated));
    }
    return L;
  }
  const question = undated.length > 0
    ? `"검증일이 ${STALE_DAYS}일을 넘었거나 판독 불가한 스킬 ${urgentCount}종이 있습니다. freshness-auditor로 재검증하시겠습니까?"`
    : `"검증일이 ${STALE_DAYS}일을 넘은 스킬 ${stale.length}종이 있습니다. freshness-auditor로 재검증하시겠습니까?"`;

  // ── SessionStart 모드: stdout JSON 1개 ─────────────────────────────────
  if (SESSION_START) {
    if (SOURCE === 'compact') process.exit(0);
    const instruct = INSTRUCT_SOURCES.has(SOURCE);
    const out = {};
    const userLines = [];
    if (urgentCount > 0) {
      const ctx = STRICT
        ? [...urgentLines(), '',
           '[staleness-check → 필수 질문] 지금 즉시 사용자에게 다음을 물어보세요:', question,
           `YES → freshness-auditor 에이전트를 실행하세요. 대상: 검증일 ${WARN_DAYS}일 초과 스킬 전체(${all.length}종).`,
           'NO  → 그냥 진행하세요.', '(이 질문은 생략하지 마세요)']
        // 일반 모드 = "경고만"(설치 안내: 60일+ 강제 질문은 strict 전용) — 작업을 끊는 질문 강요 금지
        : [...urgentLines(), '',
           '[staleness-check → 참고] 사용자의 현재 요청을 먼저 처리하세요. 작업을 중단하지 말고,',
           `응답을 마칠 때 한 줄로 재검증(freshness-auditor, 대상: ${WARN_DAYS}일 초과 전체) 가능 여부를 안내하면 충분합니다.`];
      if (instruct) out.hookSpecificOutput = { hookEventName: 'SessionStart', additionalContext: clip(ctx.join('\n')) };
      userLines.push(...urgentLines(':'));
    }
    if (warn.length > 0) {
      userLines.push(`[staleness-check] 검증일 ${WARN_DAYS}~${STALE_DAYS}일 스킬 ${warn.length}종 (재검증 권고):`, formatList(warn));
    }
    if (userLines.length > 0) out.systemMessage = clip(userLines.join('\n'));
    if (Object.keys(out).length > 0) process.stdout.write(JSON.stringify(out));
    process.exit(0);
  }

  // ── 레거시(InstructionsLoaded) 경로 — 문서상 출력이 전달되지 않음(관측·수동 실행용으로 유지) ──
  // ── 60일 초과 처리 ────────────────────────────────────────────────────
  if (urgentCount > 0) {
    if (STRICT) {
      // stdout 주입 → Claude 컨텍스트에 직접 삽입 → Claude가 반드시 질문해야 함
      // 사용 자체는 막지 않음 — YES/NO 답변 후 정상 진행
      process.stdout.write([
        '',
        ...urgentLines(),
        '',
        '[staleness-check → 필수 질문] 지금 즉시 사용자에게 다음을 물어보세요:',
        question,
        `YES → freshness-auditor 에이전트를 실행하세요. 대상: 검증일 ${WARN_DAYS}일 초과 스킬 전체(${all.length}종).`,
        'NO  → 그냥 진행하세요.',
        '(이 질문은 생략하지 마세요)',
        '',
      ].join('\n'));
    } else {
      // 일반 모드: stderr 경고 + 사용자 확인 지시
      process.stderr.write([
        '',
        ...urgentLines(':'),
        '',
        `[staleness-check → Claude 지시] 즉시 사용자에게 질문하세요:`,
        question,
        `YES면 freshness-auditor 에이전트를 실행하고(대상: ${WARN_DAYS}일 초과 전체), NO면 그냥 진행하세요.`,
        '',
      ].join('\n'));
    }
  }

  // ── 30~59일 처리 (모드 무관 경고) ────────────────────────────────────
  if (warn.length > 0) {
    process.stderr.write([
      '',
      `[staleness-check] 검증일 ${WARN_DAYS}~${STALE_DAYS}일 스킬 ${warn.length}종 (재검증 권고):`,
      '',
      formatList(warn),
      '',
    ].join('\n'));
  }

} catch {}

process.exit(0);
