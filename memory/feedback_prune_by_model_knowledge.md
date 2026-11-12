---
name: feedback-prune-by-model-knowledge
description: "스킬·에이전트 정리 기준은 \"모델이 이미 아는가\"이지 \"앱에서 쓰는가\"가 아님 — 미사용은 삭제 이유도, 사용 중은 되살릴 이유도 아님"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 2426fb8e-78ee-47da-895d-573aeac5af90
  modified: 2026-11-11T23:46:22.818Z
---

하네스 정리(삭제·갱신)의 기준은 **모델이 똑똑해져서 스킬 없이도 아는 내용인가**다. 앱에서 쓰지 않는다고 지우지 않고, 앱에서 쓴다고 되살리지도 않는다. 남길 가치 = 모델 지식 컷오프 뒤의 변경점·검증된 함정·한국/레거시 특화 내용.

**Why:** 사용자 "모델이 똑똑해져서 불필요한 스킬들을 삭제 하라거나 업데이트 하라는거지 사용하지 않는다고 삭제 하라고 한게 아니야" (2026-11-12). 그 전에 내가 앱 사용량(Playwright 4개 앱·tsup 8패키지)을 근거로 되살리기를 추천했다가 정정받음.

각 앱(01~05)에 설치된 `.claude` 사본·앱 코드 사용처는 판단 근거로 들지 않는다 — 사용자 "다른앱에 설치된 .claude는 신경쓰지 말라고 했어"(2026-11-12). 이 레포 하나만 기준.

**How to apply:** 후보마다 "모델이 모르는 내용이 몇 줄 있나"로 판정. 사용량은 참고만. "미사용 스택" 같은 경계 분류는 이 기준으로 다시 본다. 관련 [[feedback-deletion-scope-narrow]] [[project-full-audit-2026-11-06]] [[feedback-one-decision-at-a-time]]
