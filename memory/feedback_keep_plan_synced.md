---
name: feedback-keep-plan-synced
description: 래퍼 개편 계획서는 결정이 바뀔 때마다 레포 문서와 아티팩트 페이지를 함께 즉시 최신화 (2026-10-15 사용자 요청)
metadata:
  node_type: memory
  type: feedback
  originSessionId: 956a993c-0d69-41df-9a5f-10e37ec24b3f
  modified: 2026-10-16T02:06:48.047Z
---

2026-10-15 사용자: "계획서랑 항상 최신화 해줘". 래퍼 개편 논의 중 결정·이름·설계가 바뀌면 **그 턴 안에** 계획서 레포 문서와 아티팩트 페이지를 같은 내용으로 갱신한다.

- 레포: `docs/plans/2026-10-15-gugbab-claude-shim-wrapper.md`(계획서), 체크리스트 md
- 페이지: https://claude.ai/artifact/U7vpKRXVemaNYYNhz8nNLj (계획서 탭 + 항목 체크리스트 탭, 체크 결과는 db `checklist/selection` 문서의 `changes`)
- 페이지는 레포 문서에서 생성 — 두 곳을 손으로 따로 고치지 않는다. 명령은 계획서 맨 끝 "문서 갱신 방법" (`docs/plans/page/` 의 inv.js → gen-md.js(+ descriptions.json, defaults.json) → build-page.js, 테스트 `node --test docs/plans/page/*.test.js`), 결과 html 을 같은 아티팩트 링크로 publish
- 버전 파일·"v2" 표시 금지 — 같은 파일에서 계속 수정, 머리말 "최종 수정: YYYY-MM-DD" 만 갱신 (사용자 2026-10-15)

**Why:** 계획서 v1(레포)과 v2(페이지)가 어긋난 채 남은 적이 있음. 사용자는 항상 최신본 한 곳을 보고 싶어 함.
**How to apply:** 변경을 반영한 답변에 "레포 문서·페이지 갱신함"을 함께 보고. 관련: [[project-shim-wrapper-direction]]
