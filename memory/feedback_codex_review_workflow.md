---
name: codex-review-workflow-findings
description: "codex review CLI v0.122.0 제약 및 훅 안정성 패턴. --uncommitted에 prompt 병용 불가, stderr 캡처 필수"
metadata:
  type: feedback
---

codex review 워크플로우 작업 중 발견한 사항들.

**규칙 1: `codex review --uncommitted "[PROMPT]"` 사용 금지 (v0.122.0+)**
`--uncommitted`와 `[PROMPT]` 인수는 mutually exclusive. CLI가 에러로 거부한다.
→ 대신 `codex review --uncommitted 2>&1 | tee /tmp/codex-r{N}.txt` 패턴 사용.

**Why:** v0.122.0에서 확인. 커스텀 프롬프트는 Codex CLI에 전달 불가. 라운드별 분화는 Claude의 응답 판정 로직에서만 가능.

**규칙 2: `codex login status`는 stderr로 출력**
`execSync('codex login status', ...)` — stdout 캡처 시 항상 빈 문자열.
→ 반드시 `execSync('codex login status 2>&1', ...)` 형태로 stderr를 stdout에 합쳐야 "Logged in" 텍스트 캡처 가능.

**Why:** `2>&1` 없이 timeout만 늘리면 오히려 로그인 판정이 false로 깨진다. (2026-06-15 실수로 확인)

**규칙 3: Stop 훅 기본 타임아웃 600초 — codex review에 별도 timeout 불필요**
Claude Code Stop 훅 기본값이 600s(10분)이므로 `codex review --uncommitted` 실행에 별도 타임아웃 설정 불필요.
`isLoggedIn()`용 execSync timeout(15000ms)과 혼동하지 말 것.

**How to apply:**
- codex-review.md 업데이트 시 → `--uncommitted "[PROMPT]"` 구문 절대 쓰지 말 것
- codex-review-guard.js isLoggedIn() 수정 시 → `2>&1` 유지 필수
- Stop 훅에서 느린 외부 명령 실행 시 → 기본 600s 먼저 확인, 초과 시 settings.json `"timeout"` 필드(초 단위)로 늘리기
