// SessionStart — 세션 시작 시 현재 브랜치·미커밋 파일·최근 커밋 요약 주입
//
// 출력 채널 (공식 문서 code.claude.com/docs/en/hooks):
//   "Stderr from a hook that exits 0 goes to the debug log only, never the transcript, and Claude never sees it."
//   → stderr 금지. stdout JSON 으로
//     - hookSpecificOutput.additionalContext : Claude 컨텍스트 주입
//     - systemMessage                        : 사용자에게 표시
//   상한: "additionalContext, systemMessage ... and its plain stdout, are capped at 10,000 characters"
const { execSync } = require('child_process');

const MAX_CHARS = 9000;       // 10,000 상한 여유
const MAX_LINE = 200;         // 커밋 제목 1줄 상한

function runRaw(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return '';
  }
}
const run = (cmd) => runRaw(cmd).trim();

// -z: NUL 구분 — 개행 포함 파일명을 여러 개로 세지 않음. rename/copy 는 원경로 토큰 1개 추가 → 스킵
// 입력은 trim 하지 않은 원본이어야 한다 — 첫 항목의 선행 공백(" M a")이 사라지면 "XY 경로" 형식이 깨져
// 1글자 경로 항목이 길이 필터(<4)에 걸려 누락된다
function countChanged(raw) {
  const tokens = raw.split('\0');
  let n = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.length < 4) continue;
    n++;
    if (t[0] === 'R' || t[0] === 'C') i++;
  }
  return n;
}

const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

let text = '';
try {
  const branch = run('git branch --show-current') || 'unknown';
  const changed = countChanged(runRaw('git status --porcelain -z'));
  const log = run('git log --oneline -3');

  const lines = [`[Session Start] 브랜치: ${clip(branch, MAX_LINE)}`];
  if (changed > 0) lines.push(`미커밋 파일: ${changed}개`);
  if (log) {
    lines.push('최근 커밋:');
    log.split('\n').forEach(l => lines.push(`  ${clip(l, MAX_LINE)}`));
  }
  text = clip(lines.join('\n'), MAX_CHARS);
} catch {}

if (text) {
  process.stdout.write(JSON.stringify({
    systemMessage: text,
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text },
  }));
}

process.exit(0);
