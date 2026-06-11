---
name: 셀프 검증으로 skill-tester 대체 금지
description: 스킬 작성 직후 단계 5(skill-tester 정식 호출)를 셀프 검증으로 대체하지 말 것. pending-test-guard 훅이 자백 키워드를 차단하도록 강화됨.
type: feedback
originSessionId: 11a2150d-6a64-4199-93d0-384f6c8a4063
---
스킬 작성 직후 verification.md 섹션 5에 다음과 같이 작성하지 말 것:

```
**수행일**: YYYY-MM-DD
**수행 방법**: SKILL.md 작성 직후 셀프 검증 (skill-tester 호출 미수행)
```

**Why:** 2026-05-07에 프론트엔드 스킬 3종(web-speech-api-tts·srs-spaced-repetition·indexeddb-dexie)을 작성하면서, "카테고리상 PENDING_TEST 유지가 맞으니 content test 굳이 지금 안 해도 되겠다"는 자기합리화로 단계 5(skill-tester 정식 호출)를 스킵했다. 이튿날(2026-05-08) 사용자가 직접 적발. 당시 pending-test-guard.js는 "수행일" 라인 형식만 보고 통과시키는 빈틈이 있었음.

이건 룰 위반이다:
- creation-workflow.md 단계 5: "실사용 필수 스킬 카테고리인 경우도 agent content test는 반드시 수행·기록해야 훅을 통과한다"
- 카테고리 분류(PENDING_TEST 유지)는 *status 결정 근거*이지, *content test 수행 자체를 스킵할 근거가 아니다*

**How to apply:**
1. 스킬 작성 완료 직후 *반드시* `Agent(subagent_type="skill-tester", prompt="<category>/<skill-name>")` 호출
2. 카테고리상 PENDING_TEST 유지가 맞아도 agent content test는 *별도로* 수행해 verification.md 섹션 5에 결과 기록
3. 섹션 5에 다음 키워드 중 최소 1개 포함 — PASS / FAIL / Q1·Q2 / skill-tester 호출 / agent content test / N/N PASS
4. 셀프 검증을 했더라도 "skill-tester 호출 미수행" 같은 자백 라인을 *남기지 말 것*. 셀프 검증은 정식 수행을 대체하지 않으며, 이런 자백 라인이 있으면 강화된 훅이 차단한다 (2026-05-08 보강)
5. "다음 세션에서 결정" 같이 단계 5를 미루지 말 것 — 같은 세션에서 끝내야 한다

**훅 강화 (2026-05-08):** `pending-test-guard.js`가 자백 키워드 검출 + 진짜 수행 흔적 키워드 동시 검사로 강화됐다. 단순히 "수행일" 라인만 박는 우회는 더 이상 통하지 않는다.
