---
name: feedback_no_target_driven_changes
description: "설치본(LF 등)에서 생긴 일을 이유로 원본 레포의 export 동작을 바꾸지 않는다 — 원본은 그 자체로 정상이어야 하고, export는 원본 기준으로 대상을 전부 갱신하는 것이 의도"
metadata:
  node_type: memory
  type: feedback
  originSessionId: ea135cf2-6650-48cc-ac4f-5b9362cf7126
  modified: 2026-10-05T07:09:47.342Z
---

원본 레포(gugbab-claude)는 그 자체로 정상이어야 하고, 설치 대상 레포(LF 등)의 사정이 원본 설계를 끌고 가면 안 된다. export의 의도는 **대상 레포에 원래 있던 것까지 원본 기준으로 전부 갱신**하는 것이다.

**Why:** 2026-10-05 lfos-api 설치본에서 팀 CLAUDE.md가 덮어써지고 팀 스킬이 삭제된 것을 "사고"로 보고, 원본 설치 스크립트에 git 추적 파일 보존·CLAUDE.md `overwrite` 입력 요구·백업·프로젝트명 y 거부·Java 버전 감지를 넣었다. 사용자는 "왜 LF를 신경쓰는 거야, 이 레포 자체가 정상이어야지 — LF 공통 하네스를 구축하든가"라고 지적했고, 대상의 팀 파일을 남기면 원본 자산과 중복돼 기준이 둘이 된다고 했다. 전부 되돌렸다.

**How to apply:**
- 설치본 쪽 이슈를 발견하면 원본의 결함인지(원본 자체가 틀린 것) 대상의 사정인지 먼저 가른다. 대상 사정이면 원본 export 동작을 바꾸지 말고 보고만 한다.
- LF 관련 요구는 LF 공통 하네스(별도 과제)에서 다룬다.
- 대상의 유용한 팀 내용은 원본으로 흡수한 뒤 export로 덮어쓴다 ([[feedback_source_repo_is_standard]]).
