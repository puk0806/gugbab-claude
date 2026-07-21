---
name: codex-review-workflow-findings
description: "codex review CLI v0.122.0 제약 및 훅 안정성 패턴. 적대적 기준은 adversarial-review 컴패니언(기본 codex review 아님), --uncommitted에 prompt 병용 불가, stderr 캡처 필수"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d685a042-0480-44be-95c3-ce07507ef3ba
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

**규칙 4: 적대적 기준을 쓰려면 기본 `codex review`가 아니라 `adversarial-review` 컴패니언 (2026-07-21)**
`codex review`(= `/codex:review`)는 codex *내장 일반* 리뷰 기준일 뿐이다. 진짜 적대적 attack-surface 기준(auth·IDOR·데이터 손실·멱등성·레이스·null/timeout·스키마 drift·관측성)은 플러그인 내장 프롬프트 `prompts/adversarial-review.md`에 있고, 이를 태우는 명령은:
```bash
CODEX_COMPANION=$(ls ~/.claude/plugins/cache/openai-codex/codex/*/scripts/codex-companion.mjs 2>/dev/null | sort -V | tail -1); node "$CODEX_COMPANION" adversarial-review --wait --scope working-tree 2>&1 | tee /tmp/codex-rN.txt
```
→ codex-review.md·codex-review-guard.js 3라운드 전부 이 형태로 교체됨. 컴패니언 경로는 설치 버전 무관하게 glob+`sort -V`로 동적 해석, 미검출 시 `codex review --uncommitted` 폴백. `/codex:review`·`/codex:adversarial-review`는 `disable-model-invocation: true`라 모델 자동 호출 불가 → 컴패니언 스크립트 직접 호출이 확실.

**Why:** codex 적대적 리뷰 기준이 실은 이 레포가 정하는 게 아니라 플러그인 프롬프트에 있고, 강제 경로가 기본 리뷰를 쓰고 있던 갭을 [[feedback_adversarial_testing]]와 같은 attack-surface로 정렬.

**How to apply:**
- codex-review.md 업데이트 시 → `--uncommitted "[PROMPT]"` 구문 절대 쓰지 말 것, 적대적 기준 필요하면 adversarial-review 컴패니언 사용
- codex 리뷰에 **레포 스킬 추가 불필요** — 플러그인이 CLI·프롬프트·자체 스킬(codex-cli-runtime·gpt-5-4-prompting·codex-result-handling) 번들. 요건은 CLI 설치+플러그인 활성+로그인뿐
- codex-review-guard.js isLoggedIn() 수정 시 → `2>&1` 유지 필수
- Stop 훅에서 느린 외부 명령 실행 시 → 기본 600s 먼저 확인, 초과 시 settings.json `"timeout"` 필드(초 단위)로 늘리기
