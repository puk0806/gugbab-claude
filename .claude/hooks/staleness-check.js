// InstructionsLoaded — 스킬 검증일 경과 감지
// 사용: node staleness-check.js [--strict]
//
// --strict 모드 (export 선택 시 활성화):
//   60일 초과 → stdout 강제 지시 주입 (Claude 컨텍스트에 직접 주입, 다른 작업 불가)
//   30~59일   → stderr 재검증 권고
//
// 일반 모드:
//   60일 초과 → stderr 경고 + Claude 지시 (사용자 확인 요청)
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
    return j && typeof j.hook_event_name === 'string' ? j.hook_event_name : null;
  } catch { return null; }
}
const SESSION_START = readEvent() === 'SessionStart';
const clip = (s) => (s.length > CAP ? s.slice(0, CAP - 20) + '\n  ... (생략)' : s);
const STALE_DAYS = 60;
const WARN_DAYS  = 30;

function scan(dir, results) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full, results);
    } else if (entry.name === 'verification.md') {
      try {
        const content = fs.readFileSync(full, 'utf8');
        const match = content.match(/>\s*검증일\s*:\s*(\d{4}-\d{2}-\d{2})/);
        if (match) {
          const days = Math.floor((Date.now() - new Date(match[1])) / 86400000);
          if (days > WARN_DAYS) {
            results.push({ path: full, date: match[1], days });
          }
        }
      } catch {}
    }
  }
}

try {
  const docsDir = path.join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), 'docs', 'skills');
  if (!fs.existsSync(docsDir)) process.exit(0);

  const all = [];
  scan(docsDir, all);
  if (all.length === 0) process.exit(0);

  all.sort((a, b) => b.days - a.days);

  const stale = all.filter(s => s.days > STALE_DAYS);  // 60일 초과
  const warn  = all.filter(s => s.days > WARN_DAYS && s.days <= STALE_DAYS); // 30~59일

  function formatList(items, limit = 10) {
    const lines = items.slice(0, limit).map(s => {
      const rel = path.relative(docsDir, path.dirname(s.path));
      return `  - ${rel.padEnd(50)} ${s.date}  (${s.days}일 경과)`;
    });
    if (items.length > limit) lines.push(`  ... 외 ${items.length - limit}종`);
    return lines.join('\n');
  }

  // ── SessionStart 모드: stdout JSON 1개 ─────────────────────────────────
  if (SESSION_START) {
    const out = {};
    const userLines = [];
    if (stale.length > 0) {
      const head = `[staleness-check] 검증일 ${STALE_DAYS}일 초과 스킬 ${stale.length}종 감지`;
      const q = `"검증일이 ${STALE_DAYS}일을 넘은 스킬 ${stale.length}종이 있습니다. freshness-auditor로 재검증하시겠습니까?"`;
      const ctx = STRICT
        ? [head, '', formatList(stale), '',
           '[staleness-check → 필수 질문] 지금 즉시 사용자에게 다음을 물어보세요:', q,
           `YES → freshness-auditor 에이전트를 실행하세요. 대상: 검증일 ${WARN_DAYS}일 초과 스킬 전체(${all.length}종).`,
           'NO  → 그냥 진행하세요.', '(이 질문은 생략하지 마세요)']
        : [head, '', formatList(stale), '',
           '[staleness-check → Claude 지시] 사용자에게 질문하세요:', q,
           `YES면 freshness-auditor 에이전트를 실행하고(대상: ${WARN_DAYS}일 초과 전체), NO면 그냥 진행하세요.`];
      out.hookSpecificOutput = { hookEventName: 'SessionStart', additionalContext: clip(ctx.join('\n')) };
      userLines.push(head + ':', formatList(stale));
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
  if (stale.length > 0) {
    if (STRICT) {
      // stdout 주입 → Claude 컨텍스트에 직접 삽입 → Claude가 반드시 질문해야 함
      // 사용 자체는 막지 않음 — YES/NO 답변 후 정상 진행
      process.stdout.write([
        '',
        `[staleness-check] 검증일 ${STALE_DAYS}일 초과 스킬 ${stale.length}종 감지`,
        '',
        formatList(stale),
        '',
        '[staleness-check → 필수 질문] 지금 즉시 사용자에게 다음을 물어보세요:',
        `"검증일이 ${STALE_DAYS}일을 넘은 스킬 ${stale.length}종이 있습니다. freshness-auditor로 재검증하시겠습니까?"`,
        `YES → freshness-auditor 에이전트를 실행하세요. 대상: 검증일 ${WARN_DAYS}일 초과 스킬 전체(${all.length}종).`,
        'NO  → 그냥 진행하세요.',
        '(이 질문은 생략하지 마세요)',
        '',
      ].join('\n'));
    } else {
      // 일반 모드: stderr 경고 + 사용자 확인 지시
      process.stderr.write([
        '',
        `[staleness-check] 검증일 ${STALE_DAYS}일 초과 스킬 ${stale.length}종 감지:`,
        '',
        formatList(stale),
        '',
        `[staleness-check → Claude 지시] 즉시 사용자에게 질문하세요:`,
        `"검증일이 ${STALE_DAYS}일을 넘은 스킬 ${stale.length}종이 있습니다. freshness-auditor로 재검증하시겠습니까?"`,
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
