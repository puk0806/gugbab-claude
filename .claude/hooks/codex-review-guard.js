#!/usr/bin/env node
/**
 * codex-review-guard.js
 * Stop Hook — 코드 변경 감지 시 Codex 적대적 리뷰 강제
 */

const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

let stopInput = null; // 파싱된 Stop 입력 — skip 시 연쇄 상태 초기화용

function skip(reason) {
  // 위반 없이 끝나는 새 연쇄(active=false) → 이전 턴 서명 제거(다음 연쇄에서 "이미 안내함"으로 오판 방지)
  if (stopInput && stopInput.stop_hook_active !== true && typeof stopInput.session_id === 'string' && stopInput.session_id) {
    saveSig(stopInput.session_id, null);
  }
  process.stderr.write(`[codex-review-guard] 건너뜀: ${reason}\n`);
  process.exit(0);
}

function getRepoRoot() {
  try {
    return execSync('git rev-parse --show-toplevel', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch { return null; }
}

function isOptedOut() {
  try { return execSync('git config codex.skipReview', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim() === 'true'; }
  catch { return false; }
}

function isCodexAvailable() {
  try { execSync('which codex', { stdio: 'ignore' }); return true; } catch { return false; }
}

function isPluginEnabled(repoRoot) {
  try {
    const s = JSON.parse(fs.readFileSync(path.join(repoRoot, '.claude', 'settings.json'), 'utf8'));
    return !!s.enabledPlugins?.['codex@openai-codex'];
  } catch { return false; }
}

// 종료코드 0 AND "Not logged in" 부정 문구 없음 AND 긍정 문구 존재 — /logged in/ 부분 매치는 "Not logged in"도 잡는다
function isLoggedIn() {
  try {
    const r = execSync('codex login status 2>&1', { encoding: 'utf8', timeout: 15000 });
    if (/not[\s-]+logged[\s-]*in/i.test(r)) return false;
    return /logged[\s-]*in/i.test(r);
  } catch { return false; }
}

// ── stop_hook_active 루프 방지 ──────────────────────────────────────
// 공식 문서: stop_hook_active 는 "Claude Code is already continuing as a result of a stop hook" 일 때 true,
// "Check this value ... to avoid blocking on a condition that will never resolve" + 연속 8회 캡.
// 설계: 사용자 턴(연쇄)마다 같은 사유로는 1회만 차단한다.
//   - active=false(새 연쇄) → 차단 + 사유 서명 기록
//   - active=true + 같은 서명을 이 훅이 이미 차단함 → 재차단 대신 사용자 systemMessage 경고 후 통과
//   - active=true + 서명 없음/다름(다른 훅이 계속시켰거나 새 사유) → 1회 차단
//   - session_id 없음 + active=true → 추적 불가, 루프 방지 우선(경고 후 통과)
// 상태 파일: os.tmpdir()/claude-stopguard-codex-<sha256(session_id)>.json — session_id 는 해시로만 사용(경로 순회 차단)
function stateFile(sessionId) {
  const h = crypto.createHash('sha256').update(String(sessionId)).digest('hex').slice(0, 32);
  return path.join(os.tmpdir(), `claude-stopguard-codex-${h}.json`);
}
function loadSig(sessionId) {
  try { const j = JSON.parse(fs.readFileSync(stateFile(sessionId), 'utf8')); return typeof j.sig === 'string' ? j.sig : null; }
  catch { return null; }
}
function saveSig(sessionId, sig) {
  try {
    if (sig === null) fs.rmSync(stateFile(sessionId), { force: true });
    else fs.writeFileSync(stateFile(sessionId), JSON.stringify({ sig, at: Date.now() }));
  } catch {}
}
// 반환: true = 이번에 차단, false = 이미 안내한 사유(경고 후 통과)
function shouldBlock(input, sig) {
  const active = input.stop_hook_active === true; // 불리언 true 만 인정(문자열·숫자 위장은 새 연쇄로 취급 → 차단 쪽)
  const sid = typeof input.session_id === 'string' && input.session_id ? input.session_id : null;
  if (!sid) return !active;
  if (active && loadSig(sid) === sig) return false;
  saveSig(sid, sig);
  return true;
}
function passWithWarning(text) {
  process.stdout.write(JSON.stringify({ systemMessage: text }));
  process.exit(0);
}

const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|rs|java|py|go|rb|c|cpp|h|hpp|cs|swift|kt)$/;

/**
 * 변경 엔트리 목록 — `git status --porcelain -z -uall`
 * -z: NUL 구분·경로 무따옴표(공백·한글·따옴표·개행 파일명 그대로), 선행 공백 보존(trim 금지)
 * -uall: untracked 디렉토리를 "dir/" 한 줄이 아닌 개별 파일로 전개
 * rename/copy(X=R|C)는 "XY 새경로\0원경로\0" — 원경로 토큰은 건너뛴다
 */
// 실패 처리(fail-closed): -uall 이 버퍼 초과·타임아웃·오류면 일반 status(untracked 디렉토리를 "dir/" 1항목으로 접음)로
// 폴백하고, 그것도 실패하면 null(= 변경 목록 확인 불가 → 호출부가 "변경 있음"으로 간주). 빈 배열로 삼키지 않는다.
function gitStatus(repoRoot, args) {
  try {
    return execSync(`git status --porcelain -z${args}`, {
      cwd: repoRoot, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024, timeout: 30000,
    });
  } catch { return null; }
}
let _entriesCache;
function getChangedEntries(repoRoot) {
  if (_entriesCache !== undefined) return _entriesCache;
  const out = gitStatus(repoRoot, ' -uall') ?? gitStatus(repoRoot, '');
  if (out === null) return (_entriesCache = null);
  const tokens = out.split('\0');
  const entries = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.length < 4) continue;
    const x = t[0], y = t[1];
    entries.push({ x, y, file: t.slice(3) });
    if (x === 'R' || x === 'C') i++; // 원경로 스킵
  }
  return (_entriesCache = entries);
}

// 폴백 status 의 untracked 디렉토리 항목("?? dir/") — 안에 코드가 있을 수 있음 → 코드 가능성으로 간주
const isUntrackedDir = (e) => e.x === '?' && e.file.endsWith('/');
const mayBeCode = (e) => CODE_EXT.test(e.file) || isUntrackedDir(e);

function hasCodeChanges(repoRoot) {
  const entries = getChangedEntries(repoRoot);
  if (entries === null) return true; // 확인 불가 → 변경 있음(fail-closed)
  return entries.some(mayBeCode);
}

function getMarkerPath(repoRoot) {
  return path.join(repoRoot, '.claude', '.codex-review-done');
}

function hasCodeChangesNewerThan(repoRoot, markerMtime) {
  const entries = getChangedEntries(repoRoot);
  if (entries === null) return true; // 확인 불가 → 마커 이후 변경 있음으로 간주(fail-closed)
  return entries.some((e) => {
    const { x, y, file } = e;
    if (!mayBeCode(e)) return false;
    if (x === 'D' || y === 'D') {
      // deleted: .git/index mtime은 git status 자체가 갱신하므로 사용 금지 → parent dir mtime으로만 판단
      try { return fs.statSync(path.join(repoRoot, path.dirname(file))).mtime.getTime() > markerMtime; }
      catch { return false; }
    }
    // renamed(내용 무변경): 마커 이후 신규 코드 변경 아님. RM(rename+수정)은 mtime 판단
    if ((x === 'R' || x === 'C') && y !== 'M') return false;
    try { return fs.statSync(path.join(repoRoot, file)).mtime.getTime() > markerMtime; }
    catch { return false; }
  });
}

const raw = (() => {
  try { return fs.readFileSync('/dev/stdin', 'utf8').trim(); } catch { return ''; }
})();

if (!raw) skip('stdin 비어있음');

let input = {};
try { input = JSON.parse(raw); } catch { skip('JSON 파싱 실패'); }
if (!input || typeof input !== 'object' || Array.isArray(input)) skip('입력이 객체 아님');

const event = input.hook_event_name || input.hookEventName || input.event;
if (event && event !== 'Stop') skip(`이벤트 아님 (${event})`);
stopInput = input;

const repoRoot = getRepoRoot();
if (!repoRoot) skip('git 레포 아님');
if (isOptedOut()) skip('codex.skipReview=true');
if (!isCodexAvailable()) skip('codex CLI 없음');
if (!isPluginEnabled(repoRoot)) skip('플러그인 비활성화');
if (!hasCodeChanges(repoRoot)) skip('미커밋 코드 변경 없음');

const marker = getMarkerPath(repoRoot);
if (fs.existsSync(marker)) {
  const markerMtime = (() => { try { return fs.statSync(marker).mtime.getTime(); } catch { return 0; } })();
  if (!hasCodeChangesNewerThan(repoRoot, markerMtime)) skip('리뷰 완료 마커 확인 (신규 변경 없음)');
}

// 미로그인: `codex login` 은 대화형(브라우저) 로그인이라 Claude 가 해소할 수 없다 → 차단하면 8회 연속 루프.
// 규칙 codex-review.md "3가지 중 하나라도 실패 → 조용히 건너뜀" 과 동일하게 통과.
if (!isLoggedIn()) skip('codex 미로그인');

const statusFailed = getChangedEntries(repoRoot) === null;
const sig = statusFailed ? 'review-required:status-failed' : 'review-required';
if (!shouldBlock(input, sig)) {
  // 이미 이 연쇄에서 같은 사유로 1회 차단·안내함 → Claude 가 해소하지 못한 상태(계정 모델 400 등 환경 오류 포함)
  passWithWarning([
    '⚠ codex-review-guard: Codex 적대적 리뷰가 완료되지 않은 채 종료합니다 (마커 .claude/.codex-review-done 미갱신).',
    '  같은 사유로 이미 1회 차단했으므로 반복 차단하지 않습니다(stop_hook_active 루프 방지).',
    '  codex 실행이 계정·모델 오류(예: 400) 등 환경 문제로 실패했다면 수동으로 /codex-review 를 실행하거나',
    '  이 프로젝트를 제외하세요: git config codex.skipReview true',
  ].join('\n'));
}

process.stderr.write([
  '✗ codex-review-guard: Codex 적대적 리뷰 필요',
  ...(statusFailed ? ['  (git status 변경 목록 확인 실패 — 대형 untracked 트리·타임아웃 등. 변경 있음으로 간주)'] : []),
  '',
  '다음을 즉시 실행하세요 (사용자에게 묻지 말고, 3라운드 완료까지):',
  '  → .claude/rules/codex-review.md 의 워크플로우 그대로 실행 (적대적 프롬프트 = adversarial-review 컴패니언)',
  '  → Round 1~3: Bash("CODEX_COMPANION=$(ls ~/.claude/plugins/cache/openai-codex/codex/*/scripts/codex-companion.mjs 2>/dev/null | sort -V | tail -1); node \\"$CODEX_COMPANION\\" adversarial-review --wait --scope working-tree 2>&1 | tee /tmp/codex-r{N}.txt") 실행',
  '  → 각 라운드 결과: ACCEPT/REJECT/PARTIAL 판정 및 수정 반영',
  '  → 새 Critical 이슈 없으면 조기 종료 가능',
  `  → 완료 후 반드시: Bash("touch ${marker}")`,
  '  → 마커 기록 후 세션 종료 재시도',
  '',
  '이 프로젝트 영구 제외: git config codex.skipReview true',
].join('\n') + '\n');
process.exit(2);
