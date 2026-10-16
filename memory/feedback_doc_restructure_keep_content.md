---
name: feedback-doc-restructure-keep-content
description: "문서·계획서 구조를 바꿀 때 자세한 설명을 줄이거나 지우지 말 것 — 위치만 옮기고 원문 그대로 유지, 옮긴 뒤 원문과 대조"
metadata:
  node_type: memory
  type: feedback
  originSessionId: ea135cf2-6650-48cc-ac4f-5b9362cf7126
  modified: 2026-10-15T00:16:30.904Z
---

계획서·문서를 재구성(탭 분리, 목차 추가 등)할 때 **자세한 설명은 그대로 유지**한다. 요약하거나 삭제하지 않는다.

**Why:** 2026-10-06 계획서를 탭(LNB)으로 나눌 때 사용자가 "자세히 설명한건 유지해 그래야 이해하고 내용파악이 되니깐 갑자기 내용을 다 제거하거나 하지 말고"라고 명시. 상세 설명이 내용 파악의 근거라서.

**How to apply:**
- 구조 변경 = 위치 이동만. 문구·표·체크 상태·그림·링크 칩까지 원문 그대로.
- Claude Docs 는 탭 사이 `move` 가 안 됨(같은 탭 안에서만, 다른 탭 id 를 주면 맨 위로 튕김 — 실제 겪음). 대신 export(markdown) 원문을 새 탭에 그대로 넣고, 그림은 embed 칩(`node/<widget id>`)+caption attr, 탭 링크는 mention 칩으로 복원.
- 옮긴 뒤 블록 해시(h)·체크 개수를 원문과 대조하고, 일치를 확인한 다음에만 원본 섹션을 지운다.
- 원문에 이미 있던 오류(예: 깨진 표 칸)도 임의로 고치지 않고 그대로 옮긴 뒤 사용자에게 따로 알린다.

**후속 (2026-10-06)**: 사용자가 Docs 탭 방식이 "너무 불편, LNB 만들어줘"라고 해서 LNB 웹 페이지로 전환 — https://claude.ai/artifact/Q1knv71pTL9tt1DctTbVrh (계획서 본체, `db` capability로 체크 상태 팀 공유, collection `checks`/doc id = 'c'+fnv1a(섹션키|항목문구)). Docs 문서(1946e909…)는 보관용. 페이지는 Docs markdown export + 위젯 JSX(Babel로 정적 SVG)를 빌드 스크립트로 변환해 만들었고 원문 조각 1,506개 대조 완료. 빌드 스크립트는 세션 scratchpad에 있어 사라질 수 있음 — 내용 수정 요청이 오면 Artifact read로 현재 페이지 HTML을 받아 고친다.

관련: [[feedback-doc-emphasis-inline]]
