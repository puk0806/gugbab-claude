#!/usr/bin/env node
// gen-settings.js — 이 레포 .claude/settings.json 의 원본 생성기 (옛 project-install.sh 는 2026-10-17 삭제).
// 레포 settings.json 은 전체 옵션 출력과 같아야 하고(gen-settings.test.js 회귀 검사), build-manifest 가 그 settings.json 에서 훅 배선을 읽는다
// 사용: node scripts/gen-settings.js [--util] [--dev] [--typescript] [--legacy] [--memory] [--superpowers] [--codex] [--readme-guard] [--staleness-guard] [--branch-protection] [--claude-version-check] [--release-version-guard] [--wrapper-version-check]

const args = process.argv.slice(2);
const isUtil               = args.includes('--util');
const isDev                = args.includes('--dev');               // tdd-guard·adversarial-test-guard·fake-impl-guard 포함 (개발 템플릿)
const withTs               = args.includes('--typescript');        // typescript-quality 포함
// --legacy: 테스트가 거의 없고 tsc가 느린 기존 대형 코드베이스용 프로파일 (2026-08-26)
//   ① tdd-guard 제외 — 소스 수천 개에 테스트 수십 개인 레포에서 사실상 모든 편집을 차단하던 문제
//   ② typescript-quality를 --changed-only로 배선 — 증분 컴파일 + 방금 저장한 파일의 에러만 차단
//   adversarial-test-guard·fake-impl-guard·test-fake-guard는 유지 (테스트를 *쓸 때*의 품질 규칙이라 무해)
const isLegacy             = args.includes('--legacy');
const withMemory           = args.includes('--memory');            // memory-* 훅 포함
const withSuperpowers      = args.includes('--superpowers');       // superpowers@superpowers-marketplace 플러그인 활성화
const withCodex            = args.includes('--codex');             // codex@openai-codex 플러그인 활성화
const withReadmeGuard      = args.includes('--readme-guard');      // git commit/push 직전 README 미업데이트 차단
const withStalenessGuard   = args.includes('--staleness-guard');   // 60일 초과 스킬 강제 재검증 지시 주입
const withBranchProtection = args.includes('--branch-protection'); // main push 금지 + 피처→피처 브랜치 생성 금지
// 2026-11-11 제거: relation-guard(관계 검사는 scripts/relations.test.js 가 맡음)·parallel-hint(선호 안내)·session-start(내장 gitStatus 와 중복)
// claude-version-check(2026-10-17): 세션 시작 때 Claude Code 버전 변경·새 버전 안내(비차단). 레포·래퍼 전용, util 제외
const withClaudeVersionCheck = args.includes('--claude-version-check') && !isUtil;
// release-version-guard(2026-10-17): gh pr create 직전 VERSION > 최신 태그 검사. gugbab-claude 레포 전용(다른 프로젝트에선 스스로 건너뜀), util 제외
const withReleaseVersionGuard = args.includes('--release-version-guard') && !isUtil;
// wrapper-version-check(2026-10-19): 세션 시작 때 이 세션을 띄운 래퍼가 설치된 하네스와 같은 커밋인지 확인(비차단). 레포·래퍼 전용, util 제외
const withWrapperVersionCheck = args.includes('--wrapper-version-check') && !isUtil;

// 공식 문서(hooks "Reference scripts by path"): 셸 형태에서는 placeholder 를 큰따옴표로 감싼다 —
// 무따옴표면 공백 포함 프로젝트 경로에서 단어 분리로 Cannot find module → 모든 가드가 fail-open (2026-09-26)
const H = (name) => ({ type: 'command', command: `node "$CLAUDE_PROJECT_DIR"/.claude/hooks/${name}` });
// 차단형 보안 훅(PreToolUse·PermissionRequest 전용) — 공식 hooks 문서 "Block the action when a hook fails"(v2.1.295+):
// onFailure:"block" 이면 훅이 시작 실패(경로 오류·Cannot find module)·0/2 외 종료·타임아웃·잘못된 JSON 일 때
// 도구 호출을 막는다(PermissionRequest 는 거부). 없으면 고장 난 보안 훅이 모든 것을 통과시킨다(fail-open). (2026-11-06)
// Stop·PostToolUse 엔 효과가 없어 붙이지 않는다. 보안 훅은 정상 판정에서 0 또는 2 로만 끝나야 한다
const HB = (name) => ({ ...H(name), onFailure: 'block' });

// ── Permissions ─────────────────────────────────────────────────────────
const permissions = {
  // 시작 권한 모드 — 공식 문서 기준 `permissions.defaultMode` 가 올바른 위치. 최상위 `defaultMode` 는 무시된다
  // (2026-08-10 doctor 지적, 2026-08-26 code.claude.com/docs/en/permission-modes 로 재확인 후 이동)
  defaultMode: 'acceptEdits',
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
    // (구 'Bash(git reset --hard HEAD~[2-9]*)' 는 2026-10-06 제거 — 정적 규칙은 푸시 여부를 몰라 미푸시 리셋까지 막았다.
    //  bash-guard 가 git 으로 확인해 푸시된 커밋을 지우는 reset 만 차단)
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
// task-confirm-guard(2026-10-06): "진행할까요?" 승인 전 Write/Edit/NotebookEdit 차단 — 모든 템플릿·util 공통
hooks.PreToolUse = [
  { matcher: '*',     hooks: [HB('bash-guard.js'), H('auto-approve.js')] },
  { matcher: 'Write', hooks: [HB('parry.js'), HB('protect-secrets.js'), H('verification-guard.js'), H('skill-md-guard.js'), H('agent-md-guard.js'), H('task-confirm-guard.js')] },
  // parry Edit·NotebookEdit(2026-11-06): Write 만 검사해 Edit new_string·NotebookEdit new_source 로 넣은 시크릿이 통과했다
  { matcher: 'Edit',  hooks: [HB('parry.js'), HB('protect-secrets.js'), H('task-confirm-guard.js')] },
  { matcher: 'NotebookEdit', hooks: [HB('parry.js'), HB('protect-secrets.js'), H('task-confirm-guard.js')] },
  // protect-secrets 읽기 차단(2026-10-06): 개인키·클라우드 인증 파일 Read·Grep 차단
  { matcher: 'Read',  hooks: [HB('protect-secrets.js')] },
  { matcher: 'Grep',  hooks: [HB('protect-secrets.js')] },
  // task-confirm-guard Bash·Monitor(2026-11-10 결정 2-a): 승인 전 셸로 파일을 바꾸는 명령(리다이렉트·cp·sed -i·인라인 쓰기 코드…)도 차단
  { matcher: 'Bash|Monitor', hooks: [H('task-confirm-guard.js')] },
];
// PreToolUse Bash — 개발 전용 (가짜 테스트 차단. rm -rf 분석은 bash-guard에 흡수)
// package-manager-guard(2026-10-06): lock 파일과 다른 패키지 매니저로 의존성 변경 차단
if (isDev) {
  hooks.PreToolUse.push({ matcher: 'Bash', hooks: [H('test-fake-guard.js'), H('package-manager-guard.js')] });
}
// PreToolUse Bash — readme-guard 선택 시 (git commit/push 직전 README 미업데이트 차단)
// deliverable-guard가 구 readme-guard + pending-test-guard + 세션 파일 추적 통합 훅
// memory 선택 시에는 README 검사 없이도 push/PR 직전 memory·exports 클린 검사가 필요 → --no-readme로 배선
const deliverablePreBash = { type: 'command', command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/deliverable-guard.js --no-readme' };
if (withReadmeGuard) {
  hooks.PreToolUse.push({ matcher: 'Bash', hooks: [H('deliverable-guard.js')] });
} else if (withMemory) {
  hooks.PreToolUse.push({ matcher: 'Bash', hooks: [deliverablePreBash] });
}
// PreToolUse Bash — branch-protection 선택 시 (main push 금지 + 피처→피처 브랜치 생성 금지)
if (withBranchProtection) {
  hooks.PreToolUse.push({ matcher: 'Bash', hooks: [HB('branch-protection.js')] });
}
if (withReleaseVersionGuard) {
  hooks.PreToolUse.push({ matcher: 'Bash', hooks: [H('release-version-guard.js')] });
}

// PostToolUse Write — deliverable-guard(세션 수정 파일 추적, 구 session-summary 역할) 포함.
// 공식 문서: "All matching hooks run in parallel." — 배열 순서는 실행 순서가 아니며, 다른 훅의 exit 2 가
// 이 훅의 실행을 막지도 않는다. 각 훅은 서로의 결과에 의존하지 않도록 유지한다 (2026-09-26 주석 정정)
const devWriteHooks = isLegacy
  ? [H('adversarial-test-guard.js'), H('fake-impl-guard.js')]
  : [H('tdd-guard.js'), H('adversarial-test-guard.js'), H('fake-impl-guard.js')];
// typescript-quality(2026-11-12 사용자 결정): 저장할 때마다 tsc → PostToolUse 는 고친 파일만 기록(--record),
// 답변을 마칠 때(Stop) 한 번 tsc 로 판정(--stop). 레거시는 --changed-only(베이스라인 대비 새 에러만) 그대로
const tsHook = { type: 'command', command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/typescript-quality.js --record' };
const tsStopHook = isLegacy
  ? { type: 'command', command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/typescript-quality.js --stop --changed-only' }
  : { type: 'command', command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/typescript-quality.js --stop' };

// verification-guard 는 Write 를 PreToolUse 에서 사전 차단하지만, 날짜 4곳 불일치 경고(비차단)는 저장된 디스크
// 파일로만 판정할 수 있어 PostToolUse Write 배선이 필요하다(훅은 Post Write 를 경고 전용으로 처리 — 2026-10-05 배선 누락 수정)
// progress-tracker(2026-10-06, 공통): 승인된 계획에 수정 파일 기록 / auto-format(개발 전용): 저장 파일을 언어별 포매터로 정리
// 순서(2026-11-11): 래퍼 디스패처는 훅을 이 순서대로 하나씩 돌린다. Claude Code 2.1.319 부터 끼어든(중단된) 호출의 PostToolUse 는
// 10초 안에 끝나야 해서, 기록형 훅(deliverable·progress·memory-sync)을 앞에, 느린 auto-format·typescript-quality 를 맨 뒤에 둔다
const writeHooks = [H('deliverable-guard.js'), H('verification-guard.js'), H('progress-tracker.js')];
if (withMemory) writeHooks.push(H('memory-sync.js'));
if (isDev) writeHooks.push(...devWriteHooks, H('auto-format.js'));
if (withTs) writeHooks.push(tsHook);

// PostToolUse Edit — 구조 검증 3종은 Edit만 사후 검증 (디스크 전체 재읽기, Write는 PreToolUse에서 사전 차단)
const editHooks = [H('deliverable-guard.js'), H('verification-guard.js'), H('skill-md-guard.js'), H('agent-md-guard.js'), H('progress-tracker.js')];
if (withMemory) editHooks.push(H('memory-sync.js'));
if (isDev) editHooks.push(...devWriteHooks, H('auto-format.js'));
if (withTs) editHooks.push(tsHook);

hooks.PostToolUse = [
  { matcher: 'Write', hooks: writeHooks },
  { matcher: 'Edit',  hooks: editHooks  },
  { matcher: 'NotebookEdit', hooks: [H('progress-tracker.js')] },
  { matcher: 'Bash',  hooks: [H('bash-guard.js')] },
];

// SessionStart — 핸드오프 주입은 네이티브 resume이 커버하므로 제거 (2026-07 훅 다이어트)
// 2026-09-25: instructions-loaded·staleness-check 를 InstructionsLoaded → SessionStart 로 이동. (instructions-loaded 는 2026-10-17 옛 복사 설치와 함께 삭제 — 결정 21)
// 공식 문서상 InstructionsLoaded 는 관측 전용(출력 폐기)이라 경고가 아무에게도 전달되지 않았다.
// SessionStart 는 stdout·additionalContext 를 컨텍스트로 주입하며 /clear 시에도(source:"clear") 발생한다.
const stalenessHook = withStalenessGuard
  ? { type: 'command', command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/staleness-check.js --strict' }
  : H('staleness-check.js');
const sessionStartHooks = [];
// 같은 이벤트 훅은 병렬 실행(순서 보장 없음). memory-pull 과 경고 훅은 서로 독립 — memory 를 읽지 않는다
// (session-start — 브랜치·미커밋·최근 커밋 출력 — 은 Claude Code 내장 gitStatus 와 겹쳐 2026-11-11 제거)
if (withMemory) sessionStartHooks.push(H('memory-pull.js'));
sessionStartHooks.push(stalenessHook);
// 2026-10-06: config-change-audit(설정 스냅샷) · progress-tracker(직전·현재 작업 안내) — 공통
sessionStartHooks.push(H('config-change-audit.js'), H('progress-tracker.js'));
if (withClaudeVersionCheck) sessionStartHooks.push(H('claude-version-check.js'));
if (withWrapperVersionCheck) sessionStartHooks.push(H('wrapper-version-check.js'));
hooks.SessionStart = [{ hooks: sessionStartHooks }];

// ConfigChange(2026-10-06, 공통) — 세션 중 설정 파일 변경을 기록하고 보호 장치에 영향이 있으면 ⚠ 알림 (차단은 안 함)
hooks.ConfigChange = [{ hooks: [H('config-change-audit.js')] }];

// Stop — 산출물 완결성(deliverable-guard) + 선택 훅만 (스태킹 최소화)
// --readme-guard 미선택 시 README 검사는 끄고 PENDING_TEST 검사만 수행 (opt-in 의미 보존)
const deliverableStop = withReadmeGuard
  ? H('deliverable-guard.js')
  : { type: 'command', command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/deliverable-guard.js --no-readme' };
const stopHooks = [deliverableStop];
if (withCodex) stopHooks.push(H('codex-review-guard.js'));
if (withTs) stopHooks.push(tsStopHook); // 답변 종료 때 tsc 한 번 — 기록·알림 훅보다 앞
// memory-stop-guard는 2026-07-10 제거 — 자동 커밋 폐지로 존재 이유 소멸 (memory-sync가 미러 복사 담당)
stopHooks.push(H('session-export.js')); // 대화 요약 강제 보존 — 옵션 없음 (Y: 레포 exports/ 워킹트리 · N: 로컬 exports/)
stopHooks.push(H('korean-response-guard.js')); // 답변 한국어 강제 — 옵션 없음 (2026-10-06)
stopHooks.push(H('cc-notify.js'));
hooks.Stop = [{ hooks: stopHooks }];

// UserPromptSubmit — 매 질문마다 "한국어로 답변" 지시 주입 (Stop 검사와 짝) + 승인 여부 기록(task-confirm-guard)
// 모든 템플릿·util 공통
// progress-tracker: 승인된 계획 기록 (task-confirm-guard 와 같은 승인 판정 함수 공유)
// wrapper-version-check(2026-10-23): 세션 중 24시간마다 자동 업데이트 + 업데이트 안내
hooks.UserPromptSubmit = [{ hooks: [H('korean-response-guard.js'), H('task-confirm-guard.js'), H('progress-tracker.js'), H('config-change-audit.js'), ...(withWrapperVersionCheck ? [H('wrapper-version-check.js')] : []), ...(withClaudeVersionCheck ? [H('claude-version-check.js')] : [])] }];
// claude-version-check(2026-11-11): 켜 둔 세션도 24시간마다 Claude Code 최신 확인·자동 업데이트를 뒤에서 띄우고, 결과를 한 번 알림
// config-change-audit: ConfigChange 의 systemMessage 는 화면에 안 나와(공식) 대기 파일에 두었다가 다음 질문 때 additionalContext 로 전한다 (2026-11-09)

// SubagentStart·SubagentStop(2026-11-10 결정 2-b) — 승인된 동안 시작한 서브에이전트를 기록해 끝날 때까지 승인 유지 (모든 템플릿·util 공통)
hooks.SubagentStart = [{ hooks: [H('task-confirm-guard.js')] }];
hooks.SubagentStop = [{ hooks: [H('task-confirm-guard.js')] }];

// PermissionRequest
hooks.PermissionRequest = [
  { matcher: '*', hooks: [HB('bash-guard.js'), H('auto-approve.js')] },
];

// ── util 모드: 스킬·에이전트 구조 검증 훅 제외, 최소 구성 ────────────────
// 단, 명시적 opt-in 옵션(--readme-guard·--branch-protection·--memory·--codex)은 보존한다
if (isUtil) {
  // PreToolUse 재정의 — 구조 검증 3종(verification/skill-md/agent-md)이 딸려가지 않도록
  hooks.PreToolUse = [
    { matcher: '*',     hooks: [HB('bash-guard.js'), H('auto-approve.js')] },
    { matcher: 'Write', hooks: [HB('parry.js'), HB('protect-secrets.js'), H('task-confirm-guard.js')] },
    { matcher: 'Edit',  hooks: [HB('parry.js'), HB('protect-secrets.js'), H('task-confirm-guard.js')] },
    { matcher: 'NotebookEdit', hooks: [HB('parry.js'), HB('protect-secrets.js'), H('task-confirm-guard.js')] },
    { matcher: 'Read',  hooks: [HB('protect-secrets.js')] },
    { matcher: 'Grep',  hooks: [HB('protect-secrets.js')] },
    { matcher: 'Bash|Monitor', hooks: [H('task-confirm-guard.js')] },
  ];
  if (withReadmeGuard)     hooks.PreToolUse.push({ matcher: 'Bash', hooks: [H('deliverable-guard.js')] });
  else if (withMemory)      hooks.PreToolUse.push({ matcher: 'Bash', hooks: [deliverablePreBash] });
  if (withBranchProtection) hooks.PreToolUse.push({ matcher: 'Bash', hooks: [HB('branch-protection.js')] });

  // README 검사를 쓰려면 세션 파일 추적(PostToolUse)도 함께 필요
  // progress-tracker 는 util 에도 공통 (2026-10-06) — Write/Edit 그룹이 항상 존재
  const utilWriteHooks = [
    ...(withReadmeGuard ? [H('deliverable-guard.js')] : []),
    ...(withMemory ? [H('memory-sync.js')] : []),
    H('progress-tracker.js'),
  ];
  hooks.PostToolUse = [
    { matcher: 'Write', hooks: utilWriteHooks },
    { matcher: 'Edit',  hooks: utilWriteHooks },
    { matcher: 'NotebookEdit', hooks: [H('progress-tracker.js')] },
    { matcher: 'Bash', hooks: [H('bash-guard.js')] },
  ];
  hooks.Stop = [
    { hooks: [
      ...(withReadmeGuard ? [H('deliverable-guard.js')] : []),
      ...(withCodex ? [H('codex-review-guard.js')] : []),
      H('session-export.js'), // 대화 요약 강제 보존 — util 모드에서도 옵션 없이 포함
      H('korean-response-guard.js'), // 답변 한국어 강제 — util 모드에서도 옵션 없이 포함
      H('cc-notify.js'),
    ] },
  ];
  // SessionStart(위 공통 배선) / UserPromptSubmit / PermissionRequest 유지 — InstructionsLoaded 는 2026-09-25 폐지
}

// ── Output ───────────────────────────────────────────────────────────────
const enabledPlugins = {
  ...(withSuperpowers ? { 'superpowers@superpowers-marketplace': true } : {}),
  ...(withCodex       ? { 'codex@openai-codex': true }               : {}),
};
const hasPlugins = Object.keys(enabledPlugins).length > 0;
const settings = {
  ...(hasPlugins ? { enabledPlugins } : {}),
  permissions,
  hooks,
  statusLine: { type: 'command', command: 'bash "$CLAUDE_PROJECT_DIR"/.claude/hooks/statusline.sh' },
};
process.stdout.write(JSON.stringify(settings, null, 2) + '\n');
