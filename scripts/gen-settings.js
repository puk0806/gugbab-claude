#!/usr/bin/env node
// gen-settings.js — project-install.sh에서 호출. 선택된 옵션에 따라 settings.json 생성
// 사용: node scripts/gen-settings.js [--util] [--dev] [--typescript] [--memory] [--codex] [--readme-guard]

const args = process.argv.slice(2);
const isUtil          = args.includes('--util');
const isDev           = args.includes('--dev');          // tdd-guard 포함 (개발 템플릿)
const withTs          = args.includes('--typescript');   // typescript-quality 포함
const withMemory      = args.includes('--memory');       // memory-* 훅 포함
const withCodex          = args.includes('--codex');           // codex@openai-codex 플러그인 활성화
const withReadmeGuard    = args.includes('--readme-guard');    // git commit/push 직전 README 미업데이트 차단
const withStalenessGuard = args.includes('--staleness-guard'); // 60일 초과 스킬 강제 재검증 지시 주입

const H = (name) => ({ type: 'command', command: `node $CLAUDE_PROJECT_DIR/.claude/hooks/${name}` });

// ── Permissions ─────────────────────────────────────────────────────────
const permissions = {
  allow: [
    'Bash(node*)', 'Bash(npx*)', 'Bash(pnpm*)', 'Bash(npm*)', 'Bash(codex*)',
    'Bash(git status*)', 'Bash(git diff*)', 'Bash(git log*)',
    'Bash(git branch*)', 'Bash(git show*)', 'Bash(git remote*)',
    'Bash(git add*)', 'Bash(git stash*)', 'Bash(git fetch*)',
    'Bash(ls*)', 'Bash(ll*)', 'Bash(cat*)', 'Bash(head*)', 'Bash(tail*)',
    'Bash(find*)', 'Bash(grep*)', 'Bash(wc*)', 'Bash(pwd)',
    'Bash(which*)', 'Bash(echo*)', 'Bash(printf*)',
    'Bash(mkdir*)', 'Bash(touch*)', 'Bash(cp*)', 'Bash(mv*)', 'Bash(rm*)',
    'Bash(sed*)', 'Bash(awk*)', 'Bash(sort*)', 'Bash(uniq*)',
    'Bash(diff*)', 'Bash(xargs*)', 'Bash(for*)',
    'Write', 'Edit', 'Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'Agent',
  ],
  additionalDirectories: [
    '/tmp', '/private/tmp', '/var/folders', '/private/var/folders',
  ],
  deny: [
    'Bash(git push --force*)', 'Bash(git push -f*)',
    'Bash(git reset --hard HEAD~[2-9]*)',
    'Bash(rm -rf /bin*)', 'Bash(rm -rf /etc*)', 'Bash(rm -rf /lib*)',
    'Bash(rm -rf /sbin*)', 'Bash(rm -rf /sys*)', 'Bash(rm -rf /usr*)',
    'Bash(rm -rf /var*)', 'Bash(rm -rf /proc*)', 'Bash(rm -rf /dev*)',
    'Bash(chmod 777*)', 'Bash(curl*|*bash)', 'Bash(wget*|*sh)',
  ],
};

// ── Hooks ────────────────────────────────────────────────────────────────
const hooks = {};

// PreToolUse — 공통
hooks.PreToolUse = [
  { matcher: '*',     hooks: [H('bash-guard.js'), H('auto-approve.js')] },
  { matcher: 'Write', hooks: [H('parry.js'), H('protect-secrets.js')] },
  { matcher: 'Edit',  hooks: [H('protect-secrets.js')] },
];
// PreToolUse Bash — 개발 전용 (가짜 테스트 차단 + rm -rf 분석)
if (isDev) {
  hooks.PreToolUse.push({ matcher: 'Bash', hooks: [H('test-fake-guard.js'), H('careful-with-judge.js')] });
}
// PreToolUse Bash — readme-guard 선택 시 (git commit/push 직전 README 미업데이트 차단)
if (withReadmeGuard) {
  hooks.PreToolUse.push({ matcher: 'Bash', hooks: [H('readme-guard.js')] });
}

// PostToolUse Write
const writeHooks = [H('verification-guard.js'), H('skill-md-guard.js'), H('agent-md-guard.js')];
if (isDev) writeHooks.push(H('tdd-guard.js'));
if (withTs) writeHooks.push(H('typescript-quality.js'));
writeHooks.push(H('session-summary.js'));
if (withMemory) writeHooks.push(H('memory-sync.js'));

// PostToolUse Edit
const editHooks = [];
if (isDev) editHooks.push(H('tdd-guard.js'));
if (withTs) editHooks.push(H('typescript-quality.js'));
editHooks.push(H('session-summary.js'));
if (withMemory) editHooks.push(H('memory-sync.js'));

hooks.PostToolUse = [
  { matcher: 'Write', hooks: writeHooks },
  { matcher: 'Edit',  hooks: editHooks  },
  { matcher: 'Bash',  hooks: [H('bash-guard.js')] },
];

// SessionStart
const sessionStartHooks = [];
if (withMemory) sessionStartHooks.push(H('memory-pull.js'));
sessionStartHooks.push(H('session-start.js'));
sessionStartHooks.push(H('session-handoff-inject.js'));
hooks.SessionStart = [{ hooks: sessionStartHooks }];

// UserPromptSubmit — 복잡한 작업 요청 시 계획 확인 절차 지시
hooks.UserPromptSubmit = [{
  hooks: [H('task-plan-guard.js')],
}];

// InstructionsLoaded — /clear 포함 모든 컨텍스트 초기화 시 동작
const stalenessHook = withStalenessGuard
  ? { type: 'command', command: 'node $CLAUDE_PROJECT_DIR/.claude/hooks/staleness-check.js --strict' }
  : H('staleness-check.js');
hooks.InstructionsLoaded = [{
  hooks: [
    H('instructions-loaded.js'),
    stalenessHook, // 세션 시작 + /clear 양쪽 커버
  ],
}];

// Stop
const stopHooks = [H('pending-test-guard.js')];
if (withReadmeGuard) stopHooks.push(H('readme-guard.js'));
if (withCodex) stopHooks.push(H('codex-review-guard.js'));
if (withMemory) stopHooks.push(H('memory-stop-guard.js'));
if (isDev) stopHooks.push(H('verification-gate.js'));
stopHooks.push(H('session-summary.js'));
stopHooks.push(H('session-handoff.js'));
stopHooks.push(H('cc-notify.js'));
hooks.Stop = [{ hooks: stopHooks }];

// PermissionRequest
hooks.PermissionRequest = [
  { matcher: '*', hooks: [H('bash-guard.js'), H('auto-approve.js')] },
];

// ── util 모드: 검증 훅 제외, 최소 구성 ─────────────────────────────────
if (isUtil) {
  hooks.PostToolUse = [
    { matcher: 'Write', hooks: [H('session-summary.js'), ...(withMemory ? [H('memory-sync.js')] : [])] },
    { matcher: 'Edit',  hooks: [H('session-summary.js'), ...(withMemory ? [H('memory-sync.js')] : [])] },
    { matcher: 'Bash',  hooks: [H('bash-guard.js')] },
  ];
  hooks.Stop = [
    { hooks: [H('session-summary.js'), H('session-handoff.js'), ...(withMemory ? [H('memory-stop-guard.js')] : []), H('cc-notify.js')] },
  ];
  // InstructionsLoaded / PermissionRequest 유지
}

// ── Output ───────────────────────────────────────────────────────────────
const enabledPlugins = {
  'superpowers@superpowers-marketplace': true,
  ...(withCodex ? { 'codex@openai-codex': true } : {}),
};
const settings = {
  defaultMode: 'acceptEdits',
  enabledPlugins,
  permissions,
  hooks,
  statusLine: { type: 'command', command: 'bash $CLAUDE_PROJECT_DIR/.claude/hooks/statusline.sh' },
};
process.stdout.write(JSON.stringify(settings, null, 2) + '\n');
