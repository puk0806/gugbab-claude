---
name: project-hook-diet-plan
description: 하네스 평가(2026-07-03) 후속 훅 다이어트 — 2026-07-04 5단계 전체 완료(훅 29→22종·Stop 차단형 6→3·오탐 수정·테스트 15스위트 362 어설션). PR #9 머지. session-export 추가(23종) 후 2026-07-10 메모리 개편으로 memory-stop-guard 삭제 → 현재 22종. 후순위 중 플러그인 전환은 2026-07-09 계획 수립 착수
metadata: 
  node_type: memory
  type: project
  originSessionId: a10fe4ce-af50-421d-984c-c4c2a9e72594
---

# 하네스 평가 & 훅 다이어트 (2026-07-03 평가 → 2026-07-04 실행 완료)

**커밋·머지 완료**: feature/hook-diet-full-audit 브랜치 → PR #9 머지(main). 이후 session-export.js 훅 추가로 훅 22→23종.

> **2026-07-10 후속 변경** (PR #10, [[project-memory-architecture]]): 메모리 개편으로 memory-stop-guard 삭제 → **현재 훅 22종**. memory·exports 자동 커밋 전면 폐지 — 아래 기록 중 "[export] sync 자동 커밋"·"차단형 3(… memory-stop)"·"자동 수행(memory 3종)"은 당시 기준.

## 실행 결과 (2026-07-04, 5단계 전체 완료)

1. **Plan Mode 중복 제거** ✅ — task-plan-guard·confirmation-gate 삭제. CLAUDE.md·task-workflow.md에 "복잡한 작업은 네이티브 Plan Mode 사용" 규칙으로 대체. settings.json UserPromptSubmit 이벤트 제거
2. **Stop 통합** ✅ — pending-test-guard + readme-guard + session-summary(세션 파일 추적) → **deliverable-guard.js** 1개로 병합(PostToolUse Write/Edit 추적 + PreToolUse Bash commit/push README 검사 + Stop 산출물 검사). session-handoff/inject(네이티브 resume 커버)·verification-gate(경고만)·careful-with-judge(bash-guard에 rm 패턴 흡수) 삭제. Stop = 차단형 3(deliverable·codex-review·memory-stop) + 알림 1(cc-notify)
3. **오탐 수정** ✅ — bash-guard 보호 파일(verification.md/SKILL.md/memory/) 차단을 *쓰기 연산만*(sed -i·perl -i·awk -i inplace·리다이렉트·tee)으로 축소, 읽기 전용 grep/diff/sed -n 허용. deliverable-guard 스캔에서 `.claude/worktrees/`·node_modules 제외. agent-md-guard VALID_MODELS에 claude-fable-5·claude-opus-4-8 추가 + Edit 부분 문자열 오탐 수정(Edit는 디스크에서 전체 파일 재읽기 검증 — Codex 리뷰 반영)
4. **유지 확정** ✅ — parry·branch-protection·memory 3종·verification-guard·tdd-guard 유지. protect-secrets는 배선 누락 상태였음을 발견해 PreToolUse Write/Edit에 배선 추가
5. **테스트 필수화** ✅ — 차단형 훅 전체 테스트 작성(신규 10종: deliverable·parry·protect-secrets·test-fake·branch-protection·tdd·agent-md·typescript-quality·memory-stop·codex-review). 훅 테스트 4→14종, 총 323 어설션 전체 통과. 비차단 관찰 훅(cc-notify·session-start·instructions-loaded·staleness-check·memory-pull/sync)은 테스트 제외(오탐 피해 없음)

**동기화 완료**: settings.json 재배선 / scripts/gen-settings.js·gen-settings.test.js(배선 검증 5종 추가) / project-install.sh 훅 매트릭스(공통 14·dev 2) / docs/hooks/README.md 재작성 / docs/templates 10종 훅 표 갱신 / examples/settings/util.json 재생성(구버전 pre-compact 등 유령 훅 참조였음) / skill-tester.md·creation-workflow.md·verification-policy.md의 pending-test-guard → deliverable-guard 참조 갱신 / README 구조도·업데이트 로그

최종: 훅 파일 22종(실행 훅 20 + _lib + statusline). 판단 기준 유지 — "없으면 비가역 사고가 나는가? 아니면 CLAUDE.md 한 줄/네이티브로 충분한가"

## 후속: 구조 검증 3종 사전 차단 격상 (2026-07-04, 같은 날 사용자 요청)

사용자 요구("Claude 의지 말고 정해진 경로로 강제")에 따라 verification-guard·skill-md-guard·agent-md-guard의 Write 검증을 **PreToolUse 사전 차단**으로 격상 — 위반 파일은 저장 자체가 안 됨(parry와 동일 패턴). Edit는 new_string이 부분 문자열이라 사전 검증 불가 → PostToolUse에서 디스크 전체 재읽기 검증으로 통일. 격상 전제조건으로 verification-guard "내장" 단독 매칭을 "내장 지식" 구문으로 좁힘(예: "Python 내장 자료형" 정당 문맥 오탐 제거). 근거: 2026-05-08 셀프 검증 우회 전례(사후 수정 의존이 깨진 실증) + 에이전트 MD는 Stop 백스톱 부재. 테스트 15스위트 362 어설션 통과. 훅 강제 수준 최종 분류: ①사전 차단(bash-guard·parry·protect-secrets·test-fake·branch-protection·구조검증3종·deliverable commit검사) ②사후 강제(tdd·typescript-quality·Edit 경로 구조검증) ③종료 게이트(deliverable·codex-review) ④자동 수행(memory 3종·cc-notify) ⑤권고(staleness-check --strict는 지시 주입일 뿐 차단 아님·Plan Mode 확인 절차)

## 평가 요약 (2026-07-03, 공식 best-practices 문서 대조 — 배경)

- 잘된 것: 검증 루프(skill-creator→tester), 얇은 CLAUDE.md+@rules, 결정론 가드, 크로스머신 memory
- 문제였던 것: 훅 과다(Stop 6개 스태킹 — 공식상 8회 연속 차단 시 강제 종료), 네이티브 Plan Mode 재구현, 훅 테스트 4/27, 실측 오탐 4건(전부 미테스트 훅) → 위 실행으로 해소
- 구조적 발견(미해결): 스킬 209종은 2단계 중첩 경로라 **스킬로 등록 안 됨**(에이전트가 Read하는 지식베이스로만 동작). 에이전트 68종 description 매 세션 로드(수천 토큰). project-install.sh 복사 방식은 구세대(2026 표준은 플러그인+사설 마켓플레이스)

## 전수 검증 결과 (2026-07-04)

- export: 28개 플래그 조합 전부 "배선된 훅 ⊆ 복사되는 훅" 성립, install.sh 훅 배열 22종 전부 실존, 전 조합 settings JSON 유효
- 에이전트 67종 frontmatter 전수 PASS (agents/ 하위 CLAUDE.md 3개는 컨텍스트 파일 — agent-md-guard 패턴에서 CLAUDE.md·README.md 제외 처리)
- 스킬 209종 구조 전수 PASS (game/unity-ui-system 소스 콜론 누락 1건 수정), verification.md 짝 209/209, status 분포 APPROVED 193 + PENDING_TEST 16
- 관찰: statusline.sh는 이 레포 settings.json에 statusLine 미배선 (export 시에는 gen-settings가 넣어줌) — 로컬에서 상태바 쓰려면 배선 필요
- E2E 설치 실증: project-install.sh를 임시 디렉토리에 실제 실행(react-spa 풀옵션·util 최소) — 배선 훅 전부 복사·문법 통과·옵션별 배선 일치·구훅 미참조·statusLine 포함 확인
- 검증일 경과 8종(60일+ 5 + 30~59일 3) → 병렬 서브에이전트 3개로 freshness 재검증 완료(2026-07-04): 전원 VERIFIED·DISPUTED 0. spring-security-6-jwt-jjwt12에 jjwt 0.12.7·Boot 3.5.16(OSS EOL 2026-06-30)·Security 6.5(2027-07까지 지원) 반영. 위기상담 번호(109·1577-0199·1366·1388 등 7건) 전부 유효. SKILL.md+verification.md 검증일 갱신 → staleness 0건. 참고: Spring Security 7.x 출시됨 — 추후 spring-security-7 스킬 신설 검토 가치
- 오케스트레이터 maxTurns 누락 2건 보정: deep-researcher 50·skill-tester 30 (agent-design.md 필수 규칙)
- 에이전트 모델 신선도: 67종 전부 최신(별칭 65 + claude-fable-5 2 + claude-sonnet-4-6 1), deprecated ID 0건

## 후순위

- 플러그인 전환: project-install.sh → plugin.json+marketplace.json 사설 배포 — **2026-07-09 계획 수립 착수** ([[project-plugin-migration-plan]])
- 자산 다이어트: 저사용 에이전트/스킬(dream 28·unity 17·학술 ~40) 아카이브 분리
- agent-design.md에 "네이티브 우선 원칙" 추가, 테스트 실행 PostToolUse 훅 검토

레퍼런스: code.claude.com/docs/en/best-practices (Plan Mode 휴리스틱·Stop 8회 한도·훅 원칙), code.claude.com/docs/en/plugins
