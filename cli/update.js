// 업데이트 — 실행할 때 원격 하네스를 최신화 (계획서 4장 ①)
//   마지막 확인 후 1시간이 지났을 때만 git fetch (3초 제한, 실패·오프라인이면 건너뜀)
//   채널 stable = v* 태그 중 최신 / main = origin/main / branch = 설치 때 고른 origin/<브랜치>(PR 머지 전 시험). fast-forward 로만 갱신
//   로컬 변경이 있거나 fast-forward 가 안 되면 갱신하지 않고 경고 (덮어쓰지 않음)
//   개발 모드·버전 고정(--version)이면 확인하지 않음
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const INTERVAL_MS = 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 3000;
const BRANCH_RE = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$/; // 옵션처럼 보이는 이름·경로 조작 거부

function git(cwd, args, timeout = 10000) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout }).trim();
}

// v<숫자>.<숫자>.<숫자> 만 — 프리릴리스·옵션처럼 보이는 이름은 제외
function latestTag(tags) {
  const ok = tags.filter(t => /^v\d+\.\d+\.\d+$/.test(t));
  ok.sort((a, b) => {
    const pa = a.slice(1).split('.').map(Number), pb = b.slice(1).split('.').map(Number);
    for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
    return 0;
  });
  return ok[ok.length - 1] || null;
}

function describe(cwd) {
  try { return git(cwd, ['describe', '--tags', '--exact-match', 'HEAD']); } catch { /* 태그 아님 */ }
  try { return git(cwd, ['rev-parse', '--short', 'HEAD']); } catch { return '?'; }
}

function checkUpdate({ codeHome, stateDir, channel = 'stable', branch = null, dev = false, pin = null, now = Date.now() }) {
  if (dev) return { updated: false, skipped: 'dev' };
  if (pin) return { updated: false, skipped: 'pinned' };
  if (channel === 'branch' && (typeof branch !== 'string' || !BRANCH_RE.test(branch) || branch.includes('..'))) return { updated: false, skipped: 'bad-branch' };
  try { git(codeHome, ['rev-parse', '--git-dir']); } catch { return { updated: false, skipped: 'not-git' }; }

  const stampFile = path.join(stateDir, 'update-check.json');
  let last = 0;
  try { last = Number(JSON.parse(fs.readFileSync(stampFile, 'utf8')).at) || 0; } catch { /* 처음 */ }
  if (now - last < INTERVAL_MS && now >= last) return { updated: false, skipped: 'recent' };
  try { fs.mkdirSync(stateDir, { recursive: true }); fs.writeFileSync(stampFile, JSON.stringify({ at: now })); } catch { /* 기록 실패는 무시 */ }

  try { git(codeHome, ['fetch', '--quiet', '--tags', '--force', 'origin'], FETCH_TIMEOUT_MS); } catch { return { updated: false, skipped: 'fetch-failed' }; }

  let target;
  let label;
  if (channel === 'main' || channel === 'branch') {
    label = channel === 'main' ? 'main' : branch;
    target = `refs/remotes/origin/${label}`;
  } else {
    label = latestTag(git(codeHome, ['tag', '--list', 'v*']).split('\n').filter(Boolean));
    if (!label) return { updated: false, skipped: 'no-tag' };
    target = `refs/tags/${label}`;
  }
  let targetSha, headSha;
  try { targetSha = git(codeHome, ['rev-parse', `${target}^{commit}`]); headSha = git(codeHome, ['rev-parse', 'HEAD']); } catch { return { updated: false, skipped: 'no-target' }; }
  if (targetSha === headSha) return { updated: false, skipped: 'up-to-date' };

  if (git(codeHome, ['status', '--porcelain', '--untracked-files=no'])) {
    return { updated: false, message: `[gugbab] 하네스 폴더에 로컬 변경이 있어 업데이트하지 않았습니다 (${codeHome})` };
  }
  try { git(codeHome, ['merge-base', '--is-ancestor', headSha, targetSha]); } catch {
    return { updated: false, message: `[gugbab] 원격 이력이 달라 fast-forward 할 수 없어 업데이트하지 않았습니다 — \`gugbab-claude doctor\`` };
  }
  const from = describe(codeHome);
  try {
    if (channel !== 'stable') git(codeHome, ['merge', '--ff-only', '--quiet', targetSha]);
    else git(codeHome, ['checkout', '--quiet', '--detach', targetSha]);
  } catch (e) { return { updated: false, message: `[gugbab] 업데이트 실패: ${e.message.split('\n')[0]}` }; }
  return { updated: true, message: `[gugbab] 하네스 ${from} → ${channel === 'stable' ? label : `${label} ${describe(codeHome)}`}` };
}

module.exports = { checkUpdate, latestTag };
