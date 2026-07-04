---
name: project-hook-diet-plan
description: "훅 다이어트·사전 차단 격상·스킬/에이전트 전수 검증 — 2026-07-04 전체 완료(PR로 제출). 최종 훅 22종·Stop 차단형 3·강제 수준 분류 확정. 후순위: 플러그인 전환·자산 아카이브·spring-security-7 검토"
metadata: 
  node_type: memory
  type: project
  originSessionId: a10fe4ce-af50-421d-984c-c4c2a9e72594
---

# 훅 다이어트 & 전수 검증 (2026-07-03 평가 → 2026-07-04 완료, PR 제출)

## 최종 상태

- **훅 22종** (실행 훅 20 + _lib + statusline), Stop 차단형 3(deliverable·codex-review·memory-stop) + 알림 1(cc-notify)
- **deliverable-guard.js** = 구 pending-test-guard + readme-guard + session-summary(세션 파일 추적) 통합. `--no-readme` 인자로 README 검사 opt-out (gen-settings가 --readme-guard 미선택 시 전달)
- 삭제 9종: task-plan-guard·confirmation-gate(→네이티브 Plan Mode), session-handoff/inject(→네이티브 resume), session-summary·pending-test-guard·readme-guard(→통합), verification-gate·careful-with-judge(rm 패턴은 bash-guard에 흡수)
- bash-guard: 보호 파일(verification.md·SKILL.md·memory/) 차단은 **쓰기 연산만**(sed -i·리다이렉트·tee). 읽기 전용 grep/diff/sed -n 허용
- **구조 검증 3종(verification/skill-md/agent-md-guard) = PreToolUse Write 사전 차단** — 위반 파일은 저장 자체 불가. Edit는 PostToolUse 디스크 전체 재읽기 검증. agents/ 하위 CLAUDE.md·README.md는 검사 제외
- 차단형 훅 전체 *.test.js 필수 — 훅 테스트 14종 + gen-settings 테스트, 15스위트
- 판단 기준: "없으면 비가역 사고가 나는가? 아니면 CLAUDE.md 한 줄/네이티브로 충분한가"

## 훅 강제 수준 분류 (사용자 요구: 의지가 아닌 결정론)

① **사전 차단**(실행/저장 자체 불가): bash-guard·parry·protect-secrets·test-fake-guard·branch-protection·구조검증3종(Write)·deliverable(commit/push README 검사)
② **사후 강제**(파일은 저장됨, 수정 요구 주입): tdd-guard·typescript-quality·구조검증3종(Edit)
③ **종료 게이트**: deliverable-guard(PENDING_TEST·README)·codex-review-guard
④ **자동 수행**: memory 3종·cc-notify
⑤ **권고**(Claude 의지 의존): staleness-check(--strict여도 지시 주입일 뿐 차단 아님)·Plan Mode 확인 절차

## 전수 검증 결과 (2026-07-04)

- 스킬 209종: 구조·verification 짝·status(APPROVED 193+PENDING_TEST 16) 전수 PASS. 검증일 30일+ 8종 병렬 재검증(서브에이전트 3개) 전원 VERIFIED → staleness 0건. spring-security-6에 jjwt 0.12.7·Boot 3.5.16(OSS EOL 2026-06-30)·Security 6.5(2027-07 지원) 반영. 위기상담 번호 7건(109·1577-0199 등) 유효 확인
- 에이전트 67종: frontmatter·모델·tools 전수 PASS. 오케스트레이터 maxTurns 보정(deep-researcher 50·skill-tester 30). agent-md-guard VALID_MODELS는 별칭 fable 불허(전체 ID claude-fable-5만)
- export: 28개 플래그 조합 배선⊆복사 정합 + project-install.sh 실제 설치 E2E(react-spa 풀옵션·util) 통과
- Codex 적대적 리뷰 총 6라운드, 지적 5건 전부 수정(fable 별칭·util opt-in 보존·Edit 추적 순서 등)

## 후속 (미착수)

- 플러그인 전환: project-install.sh → plugin.json+marketplace.json 사설 배포 (2026 표준)
- 자산 다이어트: 저사용 에이전트/스킬(dream 28·unity 17·학술 ~40) 아카이브 분리
- 스킬 209종은 2단계 중첩 경로라 스킬로 등록 안 됨(지식베이스로만 동작) / 에이전트 68종 description 매 세션 로드 — 자산 다이어트 시 함께 검토
- **spring-security-7 스킬 신설 검토** — Security 7.x 출시(2025-11), 현행 OSS 주류가 Boot 4.x+Security 7로 이동. 현 6.x 스킬은 2027-07까지 유효
- statusline.sh는 이 레포 settings.json에 statusLine 미배선(export본에는 gen-settings가 포함) — 로컬 상태바 원하면 배선

레퍼런스: code.claude.com/docs/en/best-practices, code.claude.com/docs/en/plugins
