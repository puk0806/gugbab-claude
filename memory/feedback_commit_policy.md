---
name: feedback-commit-policy
description: 커밋·푸시는 사용자 명시 요청 시에만 — 제안도 금지. 요청받으면 실행 전 메모리 정리를 먼저 수행해 [memory] 커밋으로 배치에 포함. main push는 branch-protection 훅이 차단(PR 경유)
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 9152b891-1df7-4c78-8301-10defaed293c
---

커밋·푸시는 사용자가 명시적으로 요청할 때만 실행한다.

**Why:** 사용자가 커밋 타이밍을 직접 제어하고 싶어 함. 자동 커밋뿐 아니라 "커밋할까요?" 같은 제안도 금지. 2026-07-10 메모리 개편으로 훅의 자동 커밋([memory]/[export] sync)도 전면 폐지됨 — 커밋 주체는 항상 사용자 요청([[project-memory-architecture]]).

**How to apply:**
- 파일 수정 완료 후 커밋·푸시 관련 언급 일절 금지 ("커밋할까요?" 제안 포함)
- **커밋·푸시 요청받으면 실행 전에 항상 메모리 정리 선행** (2026-07-10 사용자 지시): 낡은 memory 서술 갱신 + 신규 기록 + **세션 요약 최신화**(`session-export.js --refresh`) + 미러 확인 → `[memory]`/`[export]` 커밋으로 같은 배치에 포함. 절차는 memory-sync.md·commands/commit.md·create-pr.md에 명문화
- **훅 강제**: memory/·exports/ 미커밋 상태로 `git push`·`gh pr create` 실행 시 deliverable-guard가 차단 — "PR에는 메모리 정리된 상태의 모든 정보가 같이 올라가야 한다"(사용자 요구)
- 사용자가 명시 요청하면 Claude가 Bash로 직접 실행 가능 (git.md 컨벤션 + 관심사별 분리, 2026-07-10 실증)
- 단 main 직접 push는 branch-protection 훅이 차단 → feature 브랜치 + PR 경유 (또는 사용자가 `! git push` 직접 실행)
- deny 목록이 막는 것은 force push(`git push -f`)뿐 — "커밋 자체가 deny로 차단"은 과거 서술로 폐기
