---
name: feedback_adversarial_testing
description: "테스트 코드는 정상 흐름만이 아니라 악성 유저 방어·이상 경로까지 강제, 테스트 통과용 하드코딩 return 금지(A안 hard block)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d685a042-0480-44be-95c3-ce07507ef3ba
---

export/테스트 코드 생성 시 정상(happy path) 테스트만으로는 부족하다. **악성 유저가 시도할 법한 공격·오남용 시나리오와 이상 경로**까지 강제로 포함해야 하고, **테스트를 통과시키려고 기대값을 그대로 return하는 가짜 구현**은 차단되어야 한다.

**Why:** 정상 경로만 검증된 코드는 인젝션·IDOR·권한 상승 같은 공격 표면이 그대로 노출된 채 배포된다. 기대값을 박아넣은 가짜 구현은 커버리지만 올리고 실제로는 아무것도 검증하지 못한다. 사용자는 "테스트가 잘못됐으면 테스트를 다시 짜고 진행해야 한다"며 warn이 아닌 **A안(hard block)**을 명시 선택했다.

**How to apply:**
- 근거·표준: `@.claude/rules/adversarial-testing.md` (테스트 3계층 = 정상/악성 유저 방어/이상·경계, 악성 유저 공격 체크리스트, §3 가짜 구현 금지)
- 강제 훅(dev 전용, HOOKS_DEV_ONLY): `adversarial-test-guard.js`(테스트 2케이스↑인데 적대적 커버리지 2카테고리↓ 차단, RED 초기·waiver 예외) / `fake-impl-guard.js`(파라미터 무시 + 테스트 기대 리터럴 그대로 return 차단, boolean·상수 getter·waiver 제외)
- E2E는 `qa-engineer` 에이전트가 적대적 악성 유저 E2E 시나리오를 필수 산출물(5종 중 3번)로 생성
- waiver 필요 시: `adversarial-test-guard: allow — <이유>` / `fake-impl-guard: allow — <이유>`
- 관련: [[project_hook_diet_plan]] (훅 22→24종), [[feedback_codex_review_workflow]]
