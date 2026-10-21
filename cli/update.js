// 업데이트 — 실행할 때 원격 하네스를 최신화 (계획서 4장 ①)
//   마지막 확인 후 1시간이 지났을 때만 git fetch (3초 제한, 실패·오프라인이면 건너뜀)
//   채널 stable = v* 태그 중 최신 / main = origin/main / branch = 설치 때 고른 origin/<브랜치>(PR 머지 전 시험). fast-forward 로만 갱신
//   로컬 변경이 있거나 fast-forward 가 안 되면 갱신하지 않고 경고 (덮어쓰지 않음)
//   개발 모드·버전 고정(--version)이면 확인하지 않음
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { renameRetry } = require('./winfs');

const INTERVAL_MS = 60 * 60 * 1000;
// 윈도우는 git 첫 실행·자격 증명 관리자(GCM) 초기화가 느려 3초면 자주 fetch-failed — 8초 (2026-10-20)
const FETCH_TIMEOUT_MS = process.platform === 'win32' ? 8000 : 3000;
const BRANCH_RE = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$/; // 옵션처럼 보이는 이름·경로 조작 거부

// 자격 증명 창·프롬프트를 띄우지 않는다 — 세션 시작 전 자동 확인이 사용자 입력을 기다리며 멈추지 않게 (윈도우 GCM 창 대비)
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' };
function git(cwd, args, timeout = 10000) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout, env: GIT_ENV }).trim();
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
  if (now - last < INTERVAL_MS && now >= last) return { updated: false, skipped: 'recent', lastCheckAt: last };
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
  if (targetSha === headSha) return { updated: false, skipped: 'up-to-date', version: describe(codeHome) };

  if (git(codeHome, ['status', '--porcelain', '--untracked-files=no'])) {
    return { updated: false, skipped: 'local-changes', message: `[gugbab] 하네스 폴더에 로컬 변경이 있어 업데이트하지 않았습니다 (${codeHome})` };
  }
  try { git(codeHome, ['merge-base', '--is-ancestor', headSha, targetSha]); } catch {
    return { updated: false, skipped: 'not-ff', message: `[gugbab] 원격 이력이 달라 fast-forward 할 수 없어 업데이트하지 않았습니다 — \`gugbab-claude doctor\`` };
  }
  const from = describe(codeHome);
  try {
    if (channel !== 'stable') git(codeHome, ['merge', '--ff-only', '--quiet', targetSha]);
    else git(codeHome, ['checkout', '--quiet', '--detach', targetSha]);
  } catch (e) { return { updated: false, skipped: 'failed', message: `[gugbab] 업데이트 실패: ${e.message.split('\n')[0]}` }; }
  const to = channel === 'stable' ? label : `${label} ${describe(codeHome)}`;
  return { updated: true, from, to, message: `[gugbab] 하네스 ${from} → ${to}` };
}

// 채널 기록(state/channel.json) — install.sh 가 설치 폴더에 쓴다. 설치 폴더 것을 먼저, 없으면 데이터 폴더 것
// (데이터 폴더를 GUGBAB_DATA 로 따로 두면 두 위치가 달라진다 — 2026-10-17 실측). 일반 파일·객체만, 링크는 무시
function readChannel({ codeHome, stateDir }) {
  for (const dir of [codeHome && path.join(codeHome, 'state'), stateDir]) {
    if (!dir) continue;
    const f = path.join(dir, 'channel.json');
    try {
      if (!fs.lstatSync(f).isFile()) continue;
      const v = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (v && typeof v === 'object' && !Array.isArray(v)) return v;
    } catch { /* 없음·깨짐 → 다음 위치 */ }
  }
  return {};
}

// 지금 버전과 채널 — status·doctor 가 보여 준다
function versionInfo({ codeHome, stateDir, dev = false }) {
  const ch = readChannel({ codeHome, stateDir });
  let isGit = true;
  try { git(codeHome, ['rev-parse', '--git-dir']); } catch { isGit = false; }
  if (!isGit) return { version: '?', channel: 'stable', text: '? (git 저장소가 아님)', hint: null };
  let tag = null;
  try { tag = git(codeHome, ['describe', '--tags', '--exact-match', 'HEAD']); } catch { /* 태그 위가 아님 */ }
  if (tag && !/^v\d+\.\d+\.\d+$/.test(tag)) tag = null;
  let short = '?';
  try { short = git(codeHome, ['rev-parse', '--short', 'HEAD']); } catch { /* 무시 */ }
  const version = tag || short;
  if (dev) return { version, channel: 'dev', text: `${version} (개발 모드 — 자동 최신화 끔)`, hint: null };
  const pin = typeof ch.pin === 'string' && /^v\d+\.\d+\.\d+$/.test(ch.pin) ? ch.pin : null;
  if (pin) return { version, channel: 'pinned', text: `${version} (고정 — 자동 최신화 끔, 바꾸려면 설치 명령을 다시)`, hint: null };
  if (ch.channel === 'branch' && typeof ch.branch === 'string' && BRANCH_RE.test(ch.branch) && !ch.branch.includes('..')) {
    return { version, channel: 'branch', text: `${ch.branch} ${short} (브랜치 시험 채널 — 그 브랜치를 따라감)`, hint: null };
  }
  if (ch.channel === 'main') {
    let latest = null;
    try { latest = latestTag(git(codeHome, ['tag', '--list', 'v*']).split('\n').filter(Boolean)); } catch { /* 무시 */ }
    return { version, channel: 'main', text: `main ${short} (main 채널 — main 최신 커밋을 따라감)`,
      hint: latest ? `안정 버전 ${latest} 이 있습니다 — 버전(태그)만 받으려면 설치 명령을 다시 실행하세요 (기본 stable)` : null };
  }
  return { version, channel: 'stable', text: `${version} (stable — 최신 v* 태그를 따라감)`, hint: null };
}

// 이번 실행의 업데이트 확인 결과 기록(state/last-check.json) — wrapper-version-check 훅이 세션 시작 때 사용자에게 보여 준다 (2026-10-19)
//   launch = 래퍼가 실행마다 새로 만드는 값(GUGBAB_LAUNCH). 훅은 자기 세션의 launch 와 같을 때만 결과를 보여 주고 한 번 보여 주면 shown 표시
//   링크·폴더 자리에는 쓰지 않음, 임시 파일 → rename 으로 통째로 바꿈
const LAUNCH_RE = /^\d{1,10}-\d{1,13}$/;
const RESULTS = new Set(['updated', 'up-to-date', 'recent', 'fetch-failed', 'pinned', 'local-changes', 'not-ff', 'failed', 'no-tag', 'no-target', 'not-git', 'bad-branch', 'error']);
function writeLastCheck({ stateDir, launch, result, now = Date.now() }) {
  if (typeof launch !== 'string' || !LAUNCH_RE.test(launch) || !result || result.skipped === 'dev') return false;
  const kind = result.updated ? 'updated' : result.skipped;
  if (!RESULTS.has(kind)) return false;
  const rec = { launch, at: now, result: kind };
  if (kind === 'updated') { rec.from = result.from; rec.to = result.to; }
  if (kind === 'recent' && Number.isFinite(result.lastCheckAt)) rec.lastCheckAt = result.lastCheckAt;
  const f = path.join(stateDir, 'last-check.json');
  const tmpf = `${f}.${process.pid}.tmp`;
  try {
    fs.mkdirSync(stateDir, { recursive: true });
    try { if (!fs.lstatSync(f).isFile()) return false; } catch { /* 없음 → 새로 */ }
    fs.writeFileSync(tmpf, JSON.stringify(rec), { flag: 'wx' });
    renameRetry(tmpf, f);
    return true;
  } catch {
    try { if (fs.lstatSync(tmpf).isFile()) fs.rmSync(tmpf); } catch { /* 없음 */ }
    return false;
  }
}

module.exports = { checkUpdate, latestTag, versionInfo, readChannel, writeLastCheck };
