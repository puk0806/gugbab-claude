---
name: reference_harness_structure
description: gugbab-claude 하네스 구조 요약(이벤트·훅 배치·강제 수준·테스트 체계)과 구조도 아티팩트 링크 — 하네스 질문을 받으면 먼저 참조
metadata:
  node_type: memory
  type: reference
  originSessionId: ea135cf2-6650-48cc-ac4f-5b9362cf7126
  modified: 2026-10-05T02:51:00.190Z
---

구조도 페이지(2026-09-30 기준, 현재 상태 서술): https://claude.ai/artifact/2F5h1h3o6bgam1CLbyzft5 — 원본 HTML은 세션 scratchpad에 있었으므로 갱신은 이 URL을 `url`로 read → 수정 → 재게시.

**층 구조**: 규칙(CLAUDE.md + rules 14, java·rust·typescript는 `paths` 조건부) → 권한(settings permissions, acceptEdits + deny 7) → 훅 22(+statusline, 폴더 23) → 자산(에이전트 56·스킬 184, verification.md 짝) → 설치 분기(project-install.sh 템플릿 13·옵션 9, 매니페스트 해시 소유 증명).

**이벤트 순서는 Claude Code가 정함**(settings.json은 "어느 이벤트에 어떤 훅을 거는지"와 같은 이벤트 내 실행 순서만 정함): SessionStart(시작·재개·clear·compact) → 턴 안에서 도구마다 반복 [PreToolUse → (권한 필요 시) PermissionRequest → 실행 → PostToolUse] → 턴 끝 Stop(세션 종료가 아니라 **답변마다**).

**강제 수준 구분**(사용자가 헷갈려함 — 설명 시 명시):
- SessionStart 4훅(memory-pull 메모리 동기화, session-start 브랜치·커밋 주입, instructions-loaded 규칙 파일 존재 확인, staleness-check --strict 60일·날짜 불일치)은 **막을 수 없음** — `additionalContext` 지시 주입 + `systemMessage` 표시. "필수 질문"은 모델이 지시를 따르는 수준.
- 실제 차단은 PreToolUse(시크릿·보호 파일 Bash·main push·가짜 테스트 실행), PostToolUse(형식 누락·tdd·적대적 테스트·가짜 구현·tsc), Stop(README 미갱신·PENDING_TEST 테스트 기록·Codex 리뷰).

**테스트 체계**: 전체 293개(2026-10-05 기준, `ls .claude/hooks/*.test.js scripts/*.test.js | xargs node --test --test-reporter=tap`, 약 8~9분 — 기본 spec 리포터는 `# tests` 요약 줄이 없어 grep 결과가 비므로 tap 지정). 실설치 기반 검사 — template-separation(E2E 72, Codex `.gitignore` 마커 포함), template-ownership(자산 58그룹×28케이스, 미분류 자산 실패), installed-refs(설치본 무조건 참조), template-docs-counts(문서 수치↔실설치), verification-consistency(검증일 3곳). 배경은 [[feedback_audit_blind_spots]] 8번.
관련: [[project_install_architecture]], [[project_memory_architecture]].
