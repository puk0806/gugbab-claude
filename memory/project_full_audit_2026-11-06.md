---
name: project-full-audit-2026-11-06
description: 2026-11-06 전수 점검(훅·에이전트·스킬) 진단 결과와 일괄 수정·195개 재검증 진행 상황 — 끊기면 여기서 재개
metadata:
  node_type: memory
  type: project
  originSessionId: 2426fb8e-78ee-47da-895d-573aeac5af90
  modified: 2026-11-12T06:32:06.736Z
---

브랜치 `feat/lfmall-sync-2026-11-06` (커밋·푸시 금지 — 사용자 지시 "다 일괄 반영해 커밋 푸쉬는 하지말고"). 같은 브랜치에 lfmall 반영분(auto-approve 이 프로젝트 메모리만 자동 = 방법 A 유지 결정, compose Chrome 키, VERSION 1.1.4, CHANGELOG 11-06 행)이 먼저 들어가 있음. 비교용 HEAD 사본 `~/.gugbab-audit-2026-11-06/`.

**진단(1단계, 끝)** — 자동 검사 전부 통과(단위 502·매트릭스 674·E2E 56)인데 실제 문제:
- 보안(직접 재현): bash-guard PermissionRequest 가 `echo 'rm -rf ~' | bash`·`find ~ -delete` 등을 allow, auto-approve 가 Monitor 를 무조건 allow(bash-guard 는 Bash 만 봄), 래퍼 디스패처가 Bash matcher 훅을 Monitor 에 안 돌림, branch-protection 우회(detached HEAD·`git -C`·`| sh`), protect-secrets Grep glob·인증 파일 목록, fail-open 들, `onFailure:"block"` 미사용
- 모델: Sonnet 5.5 `claude-sonnet-5-5`(09-28)·Haiku 5.5 `claude-haiku-5-5`(10-07)가 agent-md-guard·agent-design.md 에 없음(새 ID 저장 차단), API 2026-10-21 에서 temperature 등 400, SDK Py 2.x·TS 1.x
- 기타: 넥사크로 에이전트 requires 누락, 에이전트 스킬 경로 카테고리 표기 ~60곳, permissionMode plan 3개, 500줄 초과 6개, 디스패처 exit 2 뒤 훅 건너뜀·SessionStart 1만 자 상한·fork 미처리
- 스킬 184개가 11-25~29 일괄 60일 초과

**2단계 수정** — 서브에이전트 6개 동시(① bash-guard·auto-approve ② branch-protection·protect-secrets·parry·deliverable·gen-settings ③ cli/hook.js·compose·세션 훅 ④ 모델 규칙·훅·에이전트 ⑤ Claude API 스킬 ~17개 ⑥ relations·경로·permissionMode·500줄 분리). 끝나면 메인이 manifest·DEFAULTS 재생성 → 단위·매트릭스·E2E·실세션 전후 비교·확인 창 증가 수치(대화 기록 재생) → CHANGELOG.
**3단계 재검증** — 사용자 "검증 일주일 넘을 거 기준으로 다 검증" = 195개 전부, 묶음별 서브에이전트(동시 5개 이하, 429 주의).

**Codex 리뷰 결정**: 이 레포는 `.claude/settings.json` 배선이 manifest hookOrder 재료라 뺄 수 없음 → 끄고 켜기는 `git config codex.skipReview true` / `--unset` (방법 A). `.gugbab.json` 은 원래대로 되돌림.
**발견**: 이 세션은 `lfmall-claude` 로 떠 있었음(CLAUDE_CONFIG_DIR=~/lfmall/projects/00_gugbab-claude/.claude) — gugbab `/harness` 켜고 끄기가 이 세션엔 적용 안 됨. 어느 래퍼로 띄울지 사용자 답 없음.

**결과 (2026-11-09 끝, 미커밋)**: 2·3단계 완료. 재검증은 실제 대상 177개(PENDING_TEST 포함) 전부 날짜·소스 갱신, NEEDS_REVISION 0. 단위 63파일·매트릭스 680·E2E 56·verification-consistency 23 실패 0. CHANGELOG 11-09 행에 정리. 확인 창 재생: 예전 자동 승인 중 5,629개(37%)가 확인으로(출력 전용 sed 를 읽기로 넣어 6,927→5,629).
**2026-11-10 후속 결정 4건 반영 (미커밋)**: ① 읽기만 하는 반복문·변수 인자·조회 명령은 자동(확인 창 재생 37%→33%, 새 쓰기·실행 자동 0) ② task-confirm-guard 가 승인 전 셸 쓰기도 차단(`lib/pre-approval-write.js`, `Bash|Monitor` 배선) + SubagentStart/Stop 로 승인 중 띄운 서브에이전트는 끝날 때까지 유지(`<agent-message>` 예외는 유지, 한도 알림 예외는 이것으로 대체) + 목표 기준 시험 ③ game-design-document SKILL.md APPROVED ④ emotion-tagging-input 출처 정정(Perogamvros 2025·Barbeau 2022 원문). 단위 64·매트릭스 680·E2E 56 실패 0, 실세션: 설치본은 승인 전 python 쓰기가 됨·개발본은 차단. 남은 것: 커밋·푸시(사용자 요청 시), 알려지지 않은 프로그램의 자체 쓰기는 판정 한계.
**2026-11-11 하네스 걷어내기 (미커밋)**: 사용자 "모델이 똑똑해져서 필요 없는 것 제거 → 남은 것 일괄 검사 → 더 지우고 갱신". 1차 스킬 48·에이전트 11·훅 3(session-start·parallel-hint·relation-guard → 검사는 `scripts/relations-check.js`)·커맨드 5·에이전트 폴더 CLAUDE.md 3, 2차 스킬 8·claude-code-guide. 남은 수: 스킬 139·에이전트 49·훅 29·커맨드 7. Fable 5.2(`claude-fable-5-2`) 현행화, 디스패처 Monitor allow 무시·PostToolUse 순서·memory 원자적 복사, CLAUDE.md·룰 정리. 단위 66 파일·매트릭스 528 통과. Codex 리뷰는 `skipReview` 해제했으나 ChatGPT 계정 + `gpt-5.4` 400 두 번 → `.claude/.codex-unavailable` 기록. 백업 `scratchpad/before-remove*-2026-11-11.tgz`(세션 임시). **남은 경계(사용자 결정 대기)**: 레거시 스킬 3(swagger-springfox-2·mui-v5·jasypt — 사용자 "남겨둬"), 🔒 에이전트 2(tech-stack-advisor·socratic-interviewer), 미사용 스택(Python·Rust·TS 백엔드 에이전트 6·n8n), 앱 묶음(꿈·운세·건강·Unity·PWA), 연구 세트(deep-researcher·web-searcher·research-reviewer), 경계 훅(cc-notify·claude-version-check ②·typescript-quality→Stop·tdd-guard·progress-tracker), 경계 스킬 약 30(일부 절만 남기고 합치기), `blockWritesOutsideWorkingDirectories` 선택 설정.
**11-11 3차(사용자 대화형 결정)**: Claude Code 자동 업데이트(claude-version-check — 새 버전이면 `claude update` 뒤에서, 성공=실제 버전 상승). 게임 묶음·프리셋 삭제, 운세 일반 지식 5개 삭제(사주 계열 유지 "추후 작업"), 3쌍 통합, 19개 일반 지식 절 덜어내기 → 스킬 115·에이전트 43·프리셋 12. gugbab 앱 조사: 앱들은 자기 `.claude` 사본을 씀(하네스 삭제와 무관), **relay(05) 는 `.claude/skills/<카테고리>/<이름>/SKILL.md` 경로로 꿈 4·건강 5 스킬을 런타임에 읽고 없으면 조용히 빈 값** — 재설치 시 깨질 위험. 되살릴 후보: indexeddb-dexie(voca 유일 DB)·vite-pwa-service-worker(voca 배포). 남은 결정: 되살리기·🔒 에이전트 2·미사용 스택·연구 세트·경계 훅·레거시 스킬 3.
**11-12 2차 걷어내기(미커밋, 35개 대화형 결정)**: 기준 정정 — "앱에서 쓰는가"가 아니라 "모델이 아는가(짐인가)", 앱 `.claude` 사본 무시([[feedback-prune-by-model-knowledge]]). 에이전트 43→10(남김: 넥사크로·스펙 5·skill-tester·fact-checker·프롬프트 시험 3), 스킬 115→90(삭제 19·합치기 3건으로 원본 6 삭제·약 50개 덜어내기, verification 섹션 8 "정리(사실 재검증 아님)"만). typescript-quality 는 `--record`(PostToolUse)+`--stop`(Stop) 으로. blockWritesOutsideWorkingDirectories 안 켬, 경계 훅 4개 유지. 백업 `scratchpad/before-remove5-2026-11-12.tgz`. 같은 날 에이전트 10개 점검(스킬은 검증일 11-06~11 이라 2주 안 지남): skill-tester 분류·훅 설명·커밋 제안 삭제, fact-checker 신뢰도 표, 프롬프트 시험 Haiku 5.5 `budget_tokens`, 넥사크로 AG Grid 유료 경계(트리·엑셀만) 정정. Boot 2.7 OSS 종료 = 2023-06-30(spring.io API) 로 swagger 정정. 남은 미확인: meal-recommendation-prompt "알레르기 법정 19종"(포장 19 vs 어린이 기호식품 22 기준 차이, 고시 원문 확인 필요). **11-12 사용자 요청으로 커밋·푸시 → PR #48.** PR 윈도우 CI 실패 3건: deliverable-guard 는 JS `realpathSync` 가 8.3 짧은 이름을 안 펼쳐 git 경로와 어긋난 실제 버그(→ `.native`), branch-protection·task-confirm-guard 는 시험이 `C:\…` 를 따옴표 없이 명령에 넣은 시험 버그. **교훈: 맥 로컬 시험 통과 ≠ 윈도우 통과 — 하네스 보고 전 PR CI 윈도우 결과까지 확인.**
**운영 교훈**: 작업 중 사용자 질문·한도 해제 알림이 오면 승인이 풀려 서브에이전트 Edit 가 막힘 → 남은 수정은 `<묶음>-remaining.md` 로 받고 재승인 후 재개. 서브에이전트 안의 skill-tester 는 하위 에이전트를 못 띄워 셀프 답변이 될 수 있음 → general-purpose 로 직접 시험. 동시 에이전트 많으면 5시간 한도에 걸림(4개 이하 권장).

**How to apply:** 재개 시 `git status`·`git diff --stat` 로 어디까지 됐는지 보고, 위 순서대로 이어서. 관련 [[project-full-audit-2026-09-25]] [[feedback-audit-blind-spots]] [[feedback-auto-allow-reads-only]]
