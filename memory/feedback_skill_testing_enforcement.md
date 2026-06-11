---
name: 스킬 생성 후 2단계 테스트 즉시 수행 필수
description: 스킬 생성 작업을 마친 직후 같은 세션 내에서 반드시 skill-tester를 호출하여 2단계 테스트를 수행해야 한다. pending-test-guard 훅이 세션 종료를 차단한다.
type: feedback
originSessionId: 0d50be35-5012-479d-82c9-84f0edba18f5
---
스킬(SKILL.md + verification.md)을 생성하거나 수정한 뒤 **같은 세션 내에서 반드시** 다음을 수행한다.

1. `skill-tester` 에이전트 호출
   - `Agent(subagent_type="skill-tester", prompt="<category>/<skill-name>")`
   - 여러 스킬 순차 처리 가능 (병렬 금지 — verification.md 동시 수정 충돌)

2. skill-tester가 자동 수행:
   - SKILL.md Read + 2~3 실전 질문 생성
   - domain-specific 에이전트(없으면 general-purpose)로 답변 실행
   - verification.md 섹션 5(테스트 진행 기록) + 6(검증 결과 요약) 업데이트
   - status 전환: PASS → APPROVED (또는 "실사용 필수" 카테고리면 PENDING_TEST 유지)

3. 생략하면 `pending-test-guard` 훅이 세션 종료 차단 (exit 2)
   - 차단 조건 (2026-04-23 완화): 오늘 mtime된 verification.md 중 status=PENDING_TEST이고 **섹션 5에 어떤 "수행일" 라인도 없는 경우**
   - 즉 섹션 5에 과거 수행 기록이 하나라도 있으면 섹션 7/8 cleanup-only 수정은 통과 (신규 스킬 미테스트 차단 효과는 유지)
   - 차단 해제: skill-tester 호출 후 완료 / 수동으로 섹션 5에 수행일 라인 작성

**Why:** 이전에 Java Tier 1 스킬 10종을 PENDING_TEST로만 남겨두고 2단계 테스트를 생략한 사례가 있음. 사용자가 "테스트 강제로 돌게 해뒀는데 왜 안 됐냐"고 명시 피드백. verification-policy는 "절차"만 강제하고 "실행"은 강제 안 했던 갭을 훅·에이전트로 메움.

**How to apply:**
- 스킬 생성 작업 지시받으면 플로우: (1) skill-creator 호출 → (2) 완료 보고 받으면 바로 skill-tester 호출 → (3) 결과 취합해서 사용자에게 최종 보고
- 여러 스킬 배치 생성 시에도 **각 배치 완료 직후** skill-tester로 후속 처리
- "실사용 필수 카테고리"(빌드 설정/워크플로우/설정+실행/마이그레이션)도 agent content test는 반드시 기록
- 사용자가 "커밋 푸쉬"를 요청하기 전에 반드시 테스트까지 완료시킨다 (세션 종료 차단 훅 발동 방지)
