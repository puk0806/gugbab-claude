---
name: readme
description: 날짜별 단일 행 유지 — 같은 날짜에 여러 변경이 있어도 하나의 행으로 합산
metadata:
  node_type: memory
  type: feedback
  originSessionId: 956a993c-0d69-41df-9a5f-10e37ec24b3f
  modified: 2026-10-17T05:53:12.542Z
---

README 업데이트 로그는 날짜당 1행만 유지한다. 같은 날짜에 여러 번 변경이 생겨도 새 행을 추가하지 않고 기존 행에 내용을 합산해 수정한다.

**Why:** 날짜별로 로그가 여러 줄로 쪼개지면 가독성이 떨어지고 중복처럼 보인다.

**How to apply:** 업데이트 로그를 작성할 때, 해당 날짜 행이 이미 있으면 새 행 추가 대신 기존 행 내용에 변경사항을 이어 붙여 수정한다. **2026-10-17부터 로그 위치는 `docs/CHANGELOG.md`** (README 는 래퍼 설치·사용 안내 전용으로 개편 — 수·프리셋 표만, 테스트가 대조).
