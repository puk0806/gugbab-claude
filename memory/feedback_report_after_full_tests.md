---
name: feedback-report-after-full-tests
description: 하네스 수정은 단위 테스트에서 멈추지 말고 실사용 시나리오·실세션 전후 비교까지 끝낸 뒤 한 번에 보고 (2026-10-20 사용자 요청)
metadata:
  node_type: memory
  type: feedback
  originSessionId: d852c16f-4ed9-436a-affa-a1a250d0233a
  modified: 2026-10-21T06:50:48.869Z
---

2026-10-20 사용자: "테스트까지 완료하고 보고해", "완료되면 보고해". 단위 테스트 통과 시점에 중간 보고하자 실테스트까지 마치고 보고하라고 함.

**Why:** 단위 테스트만으로는 실제 세션에서 확인 창이 사라지는지 같은 체감 동작을 보장 못 한다(결정 36 의 화면 표시 전제가 틀렸던 사례도 있음). 사용자는 중간 상태가 아니라 검증된 결과를 받고 싶어 함.

**How to apply:** 하네스 훅·래퍼 수정 후 보고 전에 ① 단위 전체(`cli`·`.claude/hooks`·`scripts`) ② `scripts/wrapper-e2e.sh --dev` ③ 고치기 전(설치본)·후(작업 트리) 실세션 `claude -p` 비교(데이터는 홈 아래 임시 `GUGBAB_DATA`, 시험 대화 기록은 지움)까지 수행. 시나리오와 실세션 시험은 동시에 돌리지 않고 순서대로(부하 오탐). 다른 작업 세션을 방해하지 않게 시험 메시지는 이 세션으로 보낸다. 관련: [[project-shim-wrapper-direction]] [[feedback-verification-strictness]]
