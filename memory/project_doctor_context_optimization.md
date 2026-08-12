---
name: doctor-context-optimization
description: "2026-08-10 /doctor 실행 결과 — rules 5종 paths 스코핑 적용, auto 모드 기본화, 스킬 209종 미노출 발견(정리 작업 근거)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0b16af4b-c86a-4b1f-87bd-2a134a790482
  modified: 2026-08-11T23:02:09.686Z
---

2026-08-10 `/doctor` 진단·적용 결과. 전체 정리 계획(불필요 스킬·에이전트 제거 → 필요 자산 생성)의 1단계.

**적용된 변경 (2026-08-12 Codex 리뷰로 일부 되돌림):**
- rules 3종(java·rust·typescript)만 `paths` 스코핑 유지 → ~3.3k est. 토큰/세션 절약. 확장자로 트리거가 정확히 표현되는 경우에만 안전하다
- **되돌린 2종 — 같은 실수를 반복하지 말 것:**
  - `codex-review.md`를 `.codex-review-done`으로 스코핑했었다. 그 마커는 **리뷰가 끝난 뒤** 생기므로 트리거가 역전됐고, `codex-review-guard` 훅은 `@` 임포트가 아니라 평문 경로로 규칙을 안내하므로 자동 트리거 시점에 규칙이 컨텍스트에 없었다
  - `memory-sync.md`를 `memory/**`로 스코핑했었다. 이 규칙의 핵심 트리거는 *커밋·푸시 요청*인데 **`paths`는 "작업 중인 파일"만 매칭할 수 있어 의도(intent) 트리거를 표현하지 못한다**. 코드만 고치고 커밋하는 경로에서 "커밋 시 메모리 정리" 절차가 통째로 빠졌다
  - **판별 기준: 규칙의 트리거가 "이 파일을 만질 때"면 스코핑 가능, "이 행동을 할 때"면 불가능.**
- `~/.claude/settings.json`에 `permissions.defaultMode: "auto"` 추가 (권한 팝업 감소, [[permission-prompt-reduction]] 연장선)

**미해결 발견 (다음 단계 정리 작업의 근거):**
- **프로젝트 스킬 209종이 스킬 목록 예산(~1%) 초과로 세션에 하나도 미노출, 설치 이후 dispatch 0회** — 로컬에서는 사실상 호출 불가. export 자산 가치와 분리해서 정리 방향 결정 필요
- 슬래시 커맨드 10종 중 7종(agent-status·codex-review·fix-pr·sparc-refine·tdd-implement·update-docs·create-plan) 사용 0회 — 비용 미미해 유지 판정
- `.claude/settings.json` 최상위 `"defaultMode": "acceptEdits"`는 잘못된 위치(올바른 키는 `permissions.defaultMode`)라 **무효 상태** — 수정 여부 미결정. 수정하면 이 프로젝트에서 user 스코프 auto를 덮어씀
- tdd-guard가 레포 밖 스크래치패드 파일에도 발동 — matcher 축소 권장, 미적용
- 에이전트 정의 67종+문서 3, 오류·충돌 0. 상시 컨텍스트: 에이전트 ~8.1k > rules(적용 후) ~7k est.

**Why:** 컨텍스트 비용 최적화와 스킬 정리는 별개 트랙 — doctor는 로딩만 손봤고, 스킬·에이전트 제거/생성은 사용자 승인 게이트를 거쳐 별도 진행하기로 함.
**How to apply:** 되돌리기: rules frontmatter 블록 삭제(git diff로 확인 가능), user settings의 defaultMode 라인 삭제. 다음 정리 세션에서는 이 발견 목록을 출발점으로 사용.
