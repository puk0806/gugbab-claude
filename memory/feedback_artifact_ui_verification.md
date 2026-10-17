---
name: feedback-artifact-ui-verification
description: "아티팩트 페이지 UI 수정은 로컬 JS 시험만으로 \"고쳤다\" 보고 금지 — 실제 마우스 입력 테스트 필수, claude.ai 화면 미확인은 명시"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 98f279e1-54fd-44e1-828d-5a253796c47d
  modified: 2026-10-15T00:08:55.690Z
---

아티팩트 페이지(계획서 등)의 인터랙션을 고친 뒤 로컬 헤드리스 크롬에서 `el.click()`(JS 클릭)으로만 시험하고 "고쳤다"고 보고했다가, 사용자가 실제 화면에서 "현재 구조 LNB 눌러도 안 열린다, 장난하냐"고 강하게 지적했다 (2026-10-07).

**Why:** JS 클릭은 화면 위를 덮는 요소·보이지 않는 좌표·스크롤 타이밍 문제를 통과해 버려 실제 사용 결함을 못 잡는다. 실제로 CDP `Input.dispatchMouseEvent`(실제 마우스) 테스트에서 묶음 클릭 고정이 스크롤 중 영영 안 풀리는 회귀가 추가로 드러났다.

**How to apply:**
- 인터랙션 검증은 CDP 실제 마우스·휠 입력으로 한다 (Node 22 내장 WebSocket + 헤드리스 크롬, 스크립트는 세션 scratchpad에 재작성).
- claude-in-chrome 확장은 claude.ai 아티팩트 프레임 안으로 클릭·휠이 전달되지 않았다(문서형 아티팩트도 동일) → 실제 claude.ai 화면 동작은 내가 확인할 수 없다. 보고 시 "로컬 실제 입력으로 확인, claude.ai 화면은 사용자 확인 필요"를 명시한다.
- 사용자는 PC 기준만 신경 씀(모바일 무관)
