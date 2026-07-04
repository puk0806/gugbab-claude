---
name: project-hook-diet-plan
description: 하네스 평가(2026-07-03) 후속 훅 다이어트 — 2026-07-04 5단계 전체 완료(훅 29→22종·Stop 차단형 6→3·오탐 수정·테스트 14종 323 어설션). 커밋 대기. 후순위(플러그인 전환·자산 아카이브)만 미착수
metadata: 
  node_type: memory
  type: project
  originSessionId: a10fe4ce-af50-421d-984c-c4c2a9e72594
---

# 하네스 평가 & 훅 다이어트 (2026-07-03 평가 → 2026-07-04 실행 완료)

## 실행 결과 (2026-07-04, 5단계 전체 완료 — 커밋은 사용자 대기)

1. **Plan Mode 중복 제거** ✅ — task-plan-guard·confirmation-gate 삭제. CLAUDE.md·task-workflow.md에 "복잡한 작업은 네이티브 Plan Mode 사용" 규칙으로 대체. settings.json UserPromptSubmit 이벤트 제거
2. **Stop 통합** ✅ — pending-test-guard + readme-guard + session-summary(세션 파일 추적) → **deliverable-guard.js** 1개로 병합(PostToolUse Write/Edit 추적 + PreToolUse Bash commit/push README 검사 + Stop 산출물 검사). session-handoff/inject(네이티브 resume 커버)·verification-gate(경고만)·careful-with-judge(bash-guard에 rm 패턴 흡수) 삭제. Stop = 차단형 3(deliverable·codex-review·memory-stop) + 알림 1(cc-notify)
3. **오탐 수정** ✅ — bash-guard 보호 파일(verification.md/SKILL.md/memory/) 차단을 *쓰기 연산만*(sed -i·perl -i·awk -i inplace·리다이렉트·tee)으로 축소, 읽기 전용 grep/diff/sed -n 허용. deliverable-guard 스캔에서 `.claude/worktrees/`·node_modules 제외. agent-md-guard VALID_MODELS에 claude-fable-5·claude-opus-4-8 추가 + Edit 부분 문자열 오탐 수정(Edit는 디스크에서 전체 파일 재읽기 검증 — Codex 리뷰 반영)
4. **유지 확정** ✅ — parry·branch-protection·memory 3종·verification-guard·tdd-guard 유지. protect-secrets는 배선 누락 상태였음을 발견해 PreToolUse Write/Edit에 배선 추가
5. **테스트 필수화** ✅ — 차단형 훅 전체 테스트 작성(신규 10종: deliverable·parry·protect-secrets·test-fake·branch-protection·tdd·agent-md·typescript-quality·memory-stop·codex-review). 훅 테스트 4→14종, 총 323 어설션 전체 통과. 비차단 관찰 훅(cc-notify·session-start·instructions-loaded·staleness-check·memory-pull/sync)은 테스트 제외(오탐 피해 없음)

**동기화 완료**: settings.json 재배선 / scripts/gen-settings.js·gen-settings.test.js(배선 검증 5종 추가) / project-install.sh 훅 매트릭스(공통 14·dev 2) / docs/hooks/README.md 재작성 / docs/templates 10종 훅 표 갱신 / examples/settings/util.json 재생성(구버전 pre-compact 등 유령 훅 참조였음) / skill-tester.md·creation-workflow.md·verification-policy.md의 pending-test-guard → deliverable-guard 참조 갱신 / README 구조도·업데이트 로그

최종: 훅 파일 22종(실행 훅 20 + _lib + statusline). 판단 기준 유지 — "없으면 비가역 사고가 나는가? 아니면 CLAUDE.md 한 줄/네이티브로 충분한가"

## 평가 요약 (2026-07-03, 공식 best-practices 문서 대조 — 배경)

- 잘된 것: 검증 루프(skill-creator→tester), 얇은 CLAUDE.md+@rules, 결정론 가드, 크로스머신 memory
- 문제였던 것: 훅 과다(Stop 6개 스태킹 — 공식상 8회 연속 차단 시 강제 종료), 네이티브 Plan Mode 재구현, 훅 테스트 4/27, 실측 오탐 4건(전부 미테스트 훅) → 위 실행으로 해소
- 구조적 발견(미해결): 스킬 209종은 2단계 중첩 경로라 **스킬로 등록 안 됨**(에이전트가 Read하는 지식베이스로만 동작). 에이전트 68종 description 매 세션 로드(수천 토큰). project-install.sh 복사 방식은 구세대(2026 표준은 플러그인+사설 마켓플레이스)

## 후순위 (미착수)

- 플러그인 전환: project-install.sh → plugin.json+marketplace.json 사설 배포
- 자산 다이어트: 저사용 에이전트/스킬(dream 28·unity 17·학술 ~40) 아카이브 분리
- agent-design.md에 "네이티브 우선 원칙" 추가, 테스트 실행 PostToolUse 훅 검토

레퍼런스: code.claude.com/docs/en/best-practices (Plan Mode 휴리스틱·Stop 8회 한도·훅 원칙), code.claude.com/docs/en/plugins
