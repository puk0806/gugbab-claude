#!/usr/bin/env node
/**
 * codex-review-guard.js
 * Stop Hook — 코드 변경 감지 시 Codex 적대적 리뷰 강제
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function skip(reason) {
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

function isLoggedIn() {
  try {
    const r = execSync('codex login status 2>&1', { encoding: 'utf8', timeout: 15000 });
    return /logged[\s-]*in/i.test(r);
  } catch { return false; }
}

const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|rs|java|py|go|rb|c|cpp|h|hpp|cs|swift|kt)$/;

/**
 * 변경 엔트리 목록 — `git status --porcelain -z -uall`
 * -z: NUL 구분·경로 무따옴표(공백·한글·따옴표·개행 파일명 그대로), 선행 공백 보존(trim 금지)
 * -uall: untracked 디렉토리를 "dir/" 한 줄이 아닌 개별 파일로 전개
 * rename/copy(X=R|C)는 "XY 새경로\0원경로\0" — 원경로 토큰은 건너뛴다
 */
function getChangedEntries(repoRoot) {
  let out;
  try {
    out = execSync('git status --porcelain -z -uall', {
      cwd: repoRoot, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024,
    });
  } catch { return []; }
  const tokens = out.split('\0');
  const entries = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.length < 4) continue;
    const x = t[0], y = t[1];
    entries.push({ x, y, file: t.slice(3) });
    if (x === 'R' || x === 'C') i++; // 원경로 스킵
  }
  return entries;
}

function hasCodeChanges(repoRoot) {
  return getChangedEntries(repoRoot).some(e => CODE_EXT.test(e.file));
}

function getMarkerPath(repoRoot) {
  return path.join(repoRoot, '.claude', '.codex-review-done');
}

function hasCodeChangesNewerThan(repoRoot, markerMtime) {
  return getChangedEntries(repoRoot).some(({ x, y, file }) => {
    if (!CODE_EXT.test(file)) return false;
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

const event = input.hook_event_name || input.hookEventName || input.event;
if (event && event !== 'Stop') skip(`이벤트 아님 (${event})`);

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

if (!isLoggedIn()) {
  process.stderr.write([
    '✗ codex-review-guard: Codex 로그인 필요',
    '',
    '다음을 즉시 실행하세요 (사용자에게 묻지 말고):',
    '  1. Bash("codex login") 실행',
    '  2. 로그인 완료 후 세션 종료 재시도',
    '',
    '이 프로젝트 영구 제외: git config codex.skipReview true',
  ].join('\n') + '\n');
  process.exit(2);
}

process.stderr.write([
  '✗ codex-review-guard: Codex 적대적 리뷰 필요',
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
