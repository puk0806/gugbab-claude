#!/usr/bin/env node
// release-version-guard.js — PreToolUse Bash (gugbab-claude 레포 전용, 🔒 고정 — 계획서 결정 32)
//
// `gh pr create` 직전에 커밋된 VERSION 이 최신 v* 태그보다 큰지 확인한다. 아니면 막고(exit 2) 올리는 법을 알려 준다.
// main 에 머지되면 release-on-main 워크플로가 VERSION 값으로 태그·Release 를 만들고, stable 설치본이 그 태그를 받는다.
//
// - 이 레포에서만 동작: 프로젝트(git 최상위)에 .github/workflows/release-on-main.yml 이 일반 파일로 있을 때만 검사.
//   다른 프로젝트(래퍼로 연 일반 프로젝트)에서는 아무것도 하지 않는다.
// - 프로젝트의 코드는 실행하지 않는다 — 판정 로직은 이 훅이 들어 있는 하네스의 scripts/release-version.js,
//   프로젝트에서는 `git show HEAD:VERSION`(데이터)과 태그 목록만 읽는다.
// - 훅은 파일을 고치거나 커밋하지 않는다. 막히면 Claude 가 VERSION 을 올려 커밋한 뒤 다시 PR 을 만든다.
// - 원격 태그는 3초 안에 확인, 실패하면 로컬 태그. 태그가 하나도 없으면(첫 릴리스) 형식만 본다.
// - 명령 해석은 bash-guard.js 의 셸 분석기를 쓴다 — echo "gh pr create" 같은 인용 텍스트는 무시, bash -c·체인 안은 잡는다.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const TAG = '[release-version-guard]';
const MARKER = path.join('.github', 'workflows', 'release-on-main.yml');

function isPrCreate(cmd) {
  if (typeof cmd !== 'string' || !/\bgh\b/.test(cmd)) return false;
  let analyzer = null;
  try { analyzer = require('./bash-guard.js'); } catch { analyzer = null; }
  if (analyzer && typeof analyzer.analyzeShell === 'function') {
    try {
      return analyzer.analyzeShell(cmd).invocations.some((inv) => {
        if (inv.name !== 'gh') return false;
        const a = (inv.args || []).map((x) => (x && typeof x === 'object' ? x.value : x)).filter((x) => typeof x === 'string' && !x.startsWith('-'));
        const i = a.indexOf('pr'); // gh --repo a/b pr create 처럼 옵션 값이 앞에 올 수 있음
        return i >= 0 && a[i + 1] === 'create';
      });
    } catch { /* 분석 실패 → 정규식 */ }
  }
  return cmd.split(/&&|\|\||;|\||\n/).some((s) => /^\s*(?:\w+=\S*\s+)*gh\s+pr\s+create\b/.test(s));
}

function gitTop(dir) {
  try { return execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: dir, encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; }
}

function isThisRepo(root) {
  try { return fs.lstatSync(path.join(root, MARKER)).isFile(); } catch { return false; }
}

// 판정 — 테스트에서 직접 부른다. { block: bool, message }
function evaluate({ command, cwd, rv }) {
  if (!isPrCreate(command)) return { block: false, message: '' };
  const root = gitTop(cwd);
  if (!root || !isThisRepo(root)) return { block: false, message: '' };
  if (!rv) return { block: false, message: `${TAG} 버전 검사 스크립트를 찾지 못해 건너뜁니다` };
  const head = rv.headVersion(root);
  if (head == null) return { block: true, message: `${TAG} 커밋된 VERSION 파일이 없습니다 — 레포 최상위에 VERSION(예: 1.0.0)을 만들어 커밋한 뒤 PR 을 만드세요` };
  const { tags, source } = rv.tagsOf(root, true);
  const r = rv.checkVersion(head, tags);
  if (r.ok) return { block: false, message: '' };
  let working = null;
  try { const st = fs.lstatSync(path.join(root, 'VERSION')); if (st.isFile() && st.size <= 64) working = rv.parseVersion(fs.readFileSync(path.join(root, 'VERSION'), 'utf8')); } catch { /* 없음 */ }
  const lines = [`${TAG} PR 전에 버전을 올려야 합니다 — ${r.reason} (태그 확인: ${source})`];
  if (working && r.latest && rv.checkVersion(rv.fmt(working), tags).ok) {
    lines.push(`  작업 폴더의 VERSION 은 ${rv.fmt(working)} 인데 커밋되지 않았습니다 → VERSION 을 커밋한 뒤 다시 PR`);
  } else if (r.next) {
    lines.push(`  1) node scripts/release-version.js bump   (→ ${r.next}, 큰 변경이면 bump minor / bump major)`);
    lines.push(`  2) git add VERSION && git commit -m "[config] Modify: 버전 ${r.next}"   3) push 후 다시 gh pr create`);
  } else {
    lines.push('  VERSION 에는 X.Y.Z 숫자만 한 줄로 적습니다 (예: 1.0.2)');
  }
  lines.push('  머지되면 release-on-main 워크플로가 이 버전으로 태그·Release 를 만들어 설치본이 자동으로 받습니다');
  return { block: true, message: lines.join('\n') };
}

function loadRv() {
  try { return require(path.join(__dirname, '..', '..', 'scripts', 'release-version.js')); } catch { return null; }
}

if (require.main === module) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { raw += c; if (raw.length > 1e6) process.exit(0); });
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw); } catch { process.exit(0); }
    if (!input || input.tool_name !== 'Bash') process.exit(0);
    const command = input.tool_input && input.tool_input.command;
    const cwd = typeof input.cwd === 'string' ? input.cwd : (process.env.CLAUDE_PROJECT_DIR || process.cwd());
    let r;
    try { r = evaluate({ command, cwd, rv: loadRv() }); } catch { process.exit(0); }
    if (r.block) { process.stderr.write(`${r.message}\n`); process.exit(2); }
    process.exit(0);
  });
}

module.exports = { evaluate, isPrCreate, isThisRepo };
