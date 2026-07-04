# 템플릿: 유틸 (1)

비개발자·기획자·연구자를 위한 범용 에이전트 세트. 리서치·검증·기획 작업에 특화.

```
./project-install.sh  →  번호 입력: 1
```

---

## 에이전트 (12종)

| 카테고리 | 에이전트 | 설명 |
|----------|---------|------|
| meta | [planner](../../.claude/agents/meta/planner.md) | 복잡한 작업을 단계별 실행 계획으로 분해 |
| meta | [claude-code-guide](../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI 사용법·설정 가이드 |
| research | [deep-researcher](../../.claude/agents/research/deep-researcher.md) | 논문/오픈소스/기업 사례 3축 딥 리서치 |
| research | [web-searcher](../../.claude/agents/research/web-searcher.md) | 검색 축별 소스 탐색 전담 |
| research | [research-reviewer](../../.claude/agents/research/research-reviewer.md) | 리서치 보고서 품질 평가 |
| research | [data-analyst](../../.claude/agents/research/data-analyst.md) | 이벤트 택소노미·퍼널 분석·A/B 테스트 설계 |
| research | [competitor-analyst](../../.claude/agents/research/competitor-analyst.md) | 경쟁사 분석·기능 비교·차별화 포인트 도출 |
| validation | [fact-checker](../../.claude/agents/validation/fact-checker.md) | 사실·수치·주장을 복수 소스로 교차 검증 |
| validation | [source-validator](../../.claude/agents/validation/source-validator.md) | URL·문서·블로그 신뢰도 TRUST/CAUTION/REJECT 판정 |
| validation | [qa-engineer](../../.claude/agents/validation/qa-engineer.md) | 테스트 계획·E2E 시나리오·Playwright 코드 생성 |
| domain | [product-planner](../../.claude/agents/domain/product-planner.md) | 아이디어·요구사항 → PRD 작성 |
| domain | [ui-ux-designer](../../.claude/agents/domain/ui-ux-designer.md) | PRD → 와이어프레임·디자인 토큰·컴포넌트 스펙 |

---

## 스킬 (5종)

> 유틸 템플릿은 기술 스택 스킬 없이 워크플로우·프롬프트 스킬만 포함합니다.

| 스킬 | 설명 |
|------|------|
| [ralph-loop](../../.claude/skills/meta/ralph-loop/SKILL.md) | 종료 조건 있는 자율 반복 루프 워크플로우 |
| [riper-workflow](../../.claude/skills/meta/riper-workflow/SKILL.md) | Research→Innovate→Plan→Execute→Review 5단계 워크플로우 |
| [dream-interpretation-prompt-engineering](../../.claude/skills/meta/dream-interpretation-prompt-engineering/SKILL.md) | 꿈 해몽 앱 Claude API 프롬프트 설계 패턴 |
| [dream-safety-classifier-prompts](../../.claude/skills/meta/dream-safety-classifier-prompts/SKILL.md) | 꿈 앱 안전 분류기 프롬프트 패턴 |
| [dream-app-ab-testing-prompts](../../.claude/skills/meta/dream-app-ab-testing-prompts/SKILL.md) | 꿈 해몽 앱 시스템 프롬프트 A/B 테스트 설계 |

---

## 훅 (14종) — 공통 훅

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [_lib.js](../../.claude/hooks/_lib.js) | — | 훅 공통 유틸리티 모듈 |
| [bash-guard.js](../../.claude/hooks/bash-guard.js) | PreToolUse Bash | 위험한 Bash 명령어 패턴 차단 (rm -rf 시스템 경로, force push 등) |
| [auto-approve.js](../../.claude/hooks/auto-approve.js) | PreToolUse | Bash를 제외한 도구 자동 승인 |
| [parry.js](../../.claude/hooks/parry.js) | PreToolUse Write | 시크릿·프롬프트 인젝션 패턴 스캔 — 감지 시 저장 차단 |
| [protect-secrets.js](../../.claude/hooks/protect-secrets.js) | PreToolUse Write/Edit | 민감 파일(.env, *.pem, *.key, credentials 등) 수정 차단 |
| [session-start.js](../../.claude/hooks/session-start.js) | SessionStart | 세션 시작 시 브랜치·미커밋 파일·최근 커밋 요약 출력 |
| [cc-notify.js](../../.claude/hooks/cc-notify.js) | Stop | 작업 완료 시 macOS 데스크탑 알림 |
| [instructions-loaded.js](../../.claude/hooks/instructions-loaded.js) | InstructionsLoaded | CLAUDE.md 로드 완료 시 규칙 요약 출력 |
| [deliverable-guard.js](../../.claude/hooks/deliverable-guard.js) | PostToolUse Write/Edit · PreToolUse Bash · Stop | 산출물 완결성 — 세션 수정 파일 추적 + README 동기화 검사 + PENDING_TEST 스킬 테스트 미수행 차단 |
| [skill-md-guard.js](../../.claude/hooks/skill-md-guard.js) | PostToolUse Write | SKILL.md 소스 URL·검증일·필수 섹션 검증 |
| [agent-md-guard.js](../../.claude/hooks/agent-md-guard.js) | PostToolUse Write | 에이전트 .md name·description·tools·model·example 형식 검증 |
| [verification-guard.js](../../.claude/hooks/verification-guard.js) | PostToolUse Write | verification.md 필수 섹션 확인, UNVERIFIED 상태 차단 |
| [staleness-check.js](../../.claude/hooks/staleness-check.js) | InstructionsLoaded | 스킬 검증일 경과 감지 — 30~59일 경고, 60일+ 재검증 강제 |
| [statusline.sh](../../.claude/hooks/statusline.sh) | statusLine | 상태 바 — 브랜치·미커밋 수·PENDING_TEST 스킬 수 표시 |

> dev 전용(tdd-guard·test-fake-guard)·TypeScript(typescript-quality) 훅은 포함되지 않습니다.

---

## 규칙 (2종)

| 규칙 | 설명 |
|------|------|
| [git.md](../../.claude/rules/git.md) | Git 커밋 컨벤션 — [category] Type: Subject 형식, 관심사별 커밋 분리 원칙 |
| [info-verification.md](../../.claude/rules/info-verification.md) | 외부 정보 검증 원칙 — 공식 문서 1순위, 교차 검증 절차, 낮은 신뢰도 경고 기준 |

> 공통 8종 중 에이전트 설계·스킬 생성 관련 규칙은 유틸 템플릿에서 제외됩니다.

---

## CLAUDE.md

설치 시 [`examples/CLAUDE.util.md`](../../examples/CLAUDE.util.md)가 대상 프로젝트 루트에 복사됩니다.

이미 CLAUDE.md가 있으면 덮어쓸지 확인 후 처리합니다.

**사전 구성 내용:**
- 프로젝트명·설명 플레이스홀더 (`{프로젝트명}` 수정 필요)
- 커밋·푸시 사용자 요청 시에만 진행 원칙
- git.md · info-verification.md 규칙 참조

---

## settings.json

`scripts/gen-settings.js --util` 플래그로 생성됩니다.

이미 settings.json이 있으면 덮어쓸지 확인 후 처리합니다.

| 설정 | 값 |
|------|-----|
| `defaultMode` | `"acceptEdits"` — 파일 수정 도구 자동 승인 |
| `permissions.allow` | node/npm/git 조회 명령어, Write/Edit/Read/Glob/Grep/WebSearch/WebFetch/Agent |
| `permissions.deny` | `git push --force`, `rm -rf` 시스템 경로, `chmod 777`, curl\|bash 패턴 |
| `statusLine` | 브랜치·미커밋·PENDING_TEST 상태 표시 (`statusline.sh`) |
| 훅 연결 | 유틸 최소 구성 — verification·skill/agent-md-guard 제외, bash-guard·cc-notify 유지 |
