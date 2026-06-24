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

function hasCodeChanges() {
  const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|rs|java|py|go|rb|c|cpp|h|hpp|cs|swift|kt)$/;
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (!status) return false;
    return status.split('\n').map(l => l.slice(3).trim()).some(f => CODE_EXT.test(f));
  } catch { return false; }
}

function getMarkerPath(repoRoot) {
  return path.join(repoRoot, '.claude', '.codex-review-done');
}

function hasCodeChangesNewerThan(repoRoot, markerMtime) {
  const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|rs|java|py|go|rb|c|cpp|h|hpp|cs|swift|kt)$/;
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (!status) return false;
    return status.split('\n').some(line => {
      const flag = line.slice(0, 2).trim();
      const f = line.slice(3).trim();
      // R (renamed): "old -> new" — extract the new path after " -> "
      const actualFile = flag.startsWith('R') ? (f.split(' -> ').pop() || f) : f;
      if (!CODE_EXT.test(actualFile)) return false;
      if (flag === 'D') {
        // deleted: .git/index mtime은 git status 자체가 갱신하므로 사용 금지 → parent dir mtime으로만 판단
        try {
          const dirMtime = fs.statSync(path.join(repoRoot, path.dirname(actualFile))).mtime.getTime();
          return dirMtime > markerMtime;
        } catch {}
        return false;
      }
      if (flag.startsWith('R')) {
        // renamed: 마커 이후 신규 코드 변경 아님
        return false;
      }
      try { return fs.statSync(path.join(repoRoot, actualFile)).mtime.getTime() > markerMtime; }
      catch { return false; }
    });
  } catch { return false; }
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
if (!hasCodeChanges()) skip('미커밋 코드 변경 없음');

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
  '  → .claude/rules/codex-review.md 의 워크플로우 그대로 실행',
  '  → Round 1~3: Bash("codex review --uncommitted 2>&1 | tee /tmp/codex-r{N}.txt") 실행',
  '  → 각 라운드 결과: ACCEPT/REJECT/PARTIAL 판정 및 수정 반영',
  '  → 새 Critical 이슈 없으면 조기 종료 가능',
  `  → 완료 후 반드시: Bash("touch ${marker}")`,
  '  → 마커 기록 후 세션 종료 재시도',
  '',
  '이 프로젝트 영구 제외: git config codex.skipReview true',
].join('\n') + '\n');
process.exit(2);
