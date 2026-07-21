#!/usr/bin/env node
// gen-settings.js — project-install.sh에서 호출. 선택된 옵션에 따라 settings.json 생성
// 사용: node scripts/gen-settings.js [--util] [--dev] [--typescript] [--memory] [--superpowers] [--codex] [--readme-guard] [--branch-protection]

const args = process.argv.slice(2);
const isUtil               = args.includes('--util');
const isDev                = args.includes('--dev');               // tdd-guard·adversarial-test-guard·fake-impl-guard 포함 (개발 템플릿)
const withTs               = args.includes('--typescript');        // typescript-quality 포함
const withMemory           = args.includes('--memory');            // memory-* 훅 포함
const withSuperpowers      = args.includes('--superpowers');       // superpowers@superpowers-marketplace 플러그인 활성화
const withCodex            = args.includes('--codex');             // codex@openai-codex 플러그인 활성화
const withReadmeGuard      = args.includes('--readme-guard');      // git commit/push 직전 README 미업데이트 차단
const withStalenessGuard   = args.includes('--staleness-guard');   // 60일 초과 스킬 강제 재검증 지시 주입
const withBranchProtection = args.includes('--branch-protection'); // main push 금지 + 피처→피처 브랜치 생성 금지

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
    'Bash(diff*)', 'Bash(xargs*)', 'Bash(for*)', 'Bash(tee*)',
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
// (계획 확인은 confirmation-gate/task-plan-guard 훅 대신 네이티브 Plan Mode 사용 — 2026-07 훅 다이어트)
// 구조 검증 3종(verification/skill-md/agent-md)은 Write 사전 차단 — 위반 파일은 저장 자체가 안 됨
hooks.PreToolUse = [
  { matcher: '*',     hooks: [H('bash-guard.js'), H('auto-approve.js')] },
  { matcher: 'Write', hooks: [H('parry.js'), H('protect-secrets.js'), H('verification-guard.js'), H('skill-md-guard.js'), H('agent-md-guard.js')] },
  { matcher: 'Edit',  hooks: [H('protect-secrets.js')] },
];
// PreToolUse Bash — 개발 전용 (가짜 테스트 차단. rm -rf 분석은 bash-guard에 흡수)
if (isDev) {
  hooks.PreToolUse.push({ matcher: 'Bash', hooks: [H('test-fake-guard.js')] });
}
// PreToolUse Bash — readme-guard 선택 시 (git commit/push 직전 README 미업데이트 차단)
// deliverable-guard가 구 readme-guard + pending-test-guard + 세션 파일 추적 통합 훅
// memory 선택 시에는 README 검사 없이도 push/PR 직전 memory·exports 클린 검사가 필요 → --no-readme로 배선
const deliverablePreBash = { type: 'command', command: 'node $CLAUDE_PROJECT_DIR/.claude/hooks/deliverable-guard.js --no-readme' };
if (withReadmeGuard) {
  hooks.PreToolUse.push({ matcher: 'Bash', hooks: [H('deliverable-guard.js')] });
} else if (withMemory) {
  hooks.PreToolUse.push({ matcher: 'Bash', hooks: [deliverablePreBash] });
}
// PreToolUse Bash — branch-protection 선택 시 (main push 금지 + 피처→피처 브랜치 생성 금지)
if (withBranchProtection) {
  hooks.PreToolUse.push({ matcher: 'Bash', hooks: [H('branch-protection.js')] });
}

// PostToolUse Write — deliverable-guard(세션 수정 파일 추적, 구 session-summary 역할)를
// 체인 선두에 배치: 뒤의 exit 2 검증 훅이 체인을 중단시켜도 추적 기록은 보장
const writeHooks = [H('deliverable-guard.js')];
if (isDev) writeHooks.push(H('tdd-guard.js'), H('adversarial-test-guard.js'), H('fake-impl-guard.js'));
if (withTs) writeHooks.push(H('typescript-quality.js'));
if (withMemory) writeHooks.push(H('memory-sync.js'));

// PostToolUse Edit — 구조 검증 3종은 Edit만 사후 검증 (디스크 전체 재읽기, Write는 PreToolUse에서 사전 차단)
const editHooks = [H('deliverable-guard.js'), H('verification-guard.js'), H('skill-md-guard.js'), H('agent-md-guard.js')];
if (isDev) editHooks.push(H('tdd-guard.js'), H('adversarial-test-guard.js'), H('fake-impl-guard.js'));
if (withTs) editHooks.push(H('typescript-quality.js'));
if (withMemory) editHooks.push(H('memory-sync.js'));

hooks.PostToolUse = [
  { matcher: 'Write', hooks: writeHooks },
  { matcher: 'Edit',  hooks: editHooks  },
  { matcher: 'Bash',  hooks: [H('bash-guard.js')] },
];

// SessionStart — 핸드오프 주입은 네이티브 resume이 커버하므로 제거 (2026-07 훅 다이어트)
const sessionStartHooks = [];
if (withMemory) sessionStartHooks.push(H('memory-pull.js'));
sessionStartHooks.push(H('session-start.js'));
hooks.SessionStart = [{ hooks: sessionStartHooks }];

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

// Stop — 산출물 완결성(deliverable-guard) + 선택 훅만 (스태킹 최소화)
// --readme-guard 미선택 시 README 검사는 끄고 PENDING_TEST 검사만 수행 (opt-in 의미 보존)
const deliverableStop = withReadmeGuard
  ? H('deliverable-guard.js')
  : { type: 'command', command: 'node $CLAUDE_PROJECT_DIR/.claude/hooks/deliverable-guard.js --no-readme' };
const stopHooks = [deliverableStop];
if (withCodex) stopHooks.push(H('codex-review-guard.js'));
// memory-stop-guard는 2026-07-10 제거 — 자동 커밋 폐지로 존재 이유 소멸 (memory-sync가 미러 복사 담당)
stopHooks.push(H('session-export.js')); // 대화 요약 강제 보존 — 옵션 없음 (Y: 레포 exports/ 워킹트리 · N: 로컬 exports/)
stopHooks.push(H('cc-notify.js'));
hooks.Stop = [{ hooks: stopHooks }];

// PermissionRequest
hooks.PermissionRequest = [
  { matcher: '*', hooks: [H('bash-guard.js'), H('auto-approve.js')] },
];

// ── util 모드: 스킬·에이전트 구조 검증 훅 제외, 최소 구성 ────────────────
// 단, 명시적 opt-in 옵션(--readme-guard·--branch-protection·--memory·--codex)은 보존한다
if (isUtil) {
  // PreToolUse 재정의 — 구조 검증 3종(verification/skill-md/agent-md)이 딸려가지 않도록
  hooks.PreToolUse = [
    { matcher: '*',     hooks: [H('bash-guard.js'), H('auto-approve.js')] },
    { matcher: 'Write', hooks: [H('parry.js'), H('protect-secrets.js')] },
    { matcher: 'Edit',  hooks: [H('protect-secrets.js')] },
  ];
  if (withReadmeGuard)      hooks.PreToolUse.push({ matcher: 'Bash', hooks: [H('deliverable-guard.js')] });
  else if (withMemory)      hooks.PreToolUse.push({ matcher: 'Bash', hooks: [deliverablePreBash] });
  if (withBranchProtection) hooks.PreToolUse.push({ matcher: 'Bash', hooks: [H('branch-protection.js')] });

  // README 검사를 쓰려면 세션 파일 추적(PostToolUse)도 함께 필요
  const utilWriteHooks = [
    ...(withReadmeGuard ? [H('deliverable-guard.js')] : []),
    ...(withMemory ? [H('memory-sync.js')] : []),
  ];
  hooks.PostToolUse = [
    ...(utilWriteHooks.length > 0 ? [
      { matcher: 'Write', hooks: utilWriteHooks },
      { matcher: 'Edit',  hooks: utilWriteHooks },
    ] : []),
    { matcher: 'Bash', hooks: [H('bash-guard.js')] },
  ];
  hooks.Stop = [
    { hooks: [
      ...(withReadmeGuard ? [H('deliverable-guard.js')] : []),
      ...(withCodex ? [H('codex-review-guard.js')] : []),
      H('session-export.js'), // 대화 요약 강제 보존 — util 모드에서도 옵션 없이 포함
      H('cc-notify.js'),
    ] },
  ];
  // InstructionsLoaded / PermissionRequest 유지
}

// ── Output ───────────────────────────────────────────────────────────────
const enabledPlugins = {
  ...(withSuperpowers ? { 'superpowers@superpowers-marketplace': true } : {}),
  ...(withCodex       ? { 'codex@openai-codex': true }               : {}),
};
const hasPlugins = Object.keys(enabledPlugins).length > 0;
const settings = {
  defaultMode: 'acceptEdits',
  ...(hasPlugins ? { enabledPlugins } : {}),
  permissions,
  hooks,
  statusLine: { type: 'command', command: 'bash $CLAUDE_PROJECT_DIR/.claude/hooks/statusline.sh' },
};
process.stdout.write(JSON.stringify(settings, null, 2) + '\n');
