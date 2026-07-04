---
name: project-hook-diet-plan
description: "하네스 평가(2026-07-03) 결과와 훅 다이어트 실행 계획 — 훅 33→20개, Stop 6→3, Plan Mode 중복 훅 제거, bash-guard 오탐 수정. 미착수 상태"
metadata: 
  node_type: memory
  type: project
  originSessionId: 249f37f2-ab6f-4b6d-b2b2-7ec5126c3162
---

# 하네스 평가 결과 & 훅 다이어트 계획 (2026-07-03 평가, 미착수)

## 평가 요약 (공식 best-practices 문서 대조)

- 잘된 것: 검증 루프(skill-creator→tester), 얇은 CLAUDE.md+@rules, 결정론 가드(parry·branch-protection), 크로스머신 memory
- 문제: 훅 과다(구현 27, Stop 6개 스태킹 — 공식상 Stop 8회 연속 차단 시 강제 종료), 네이티브 Plan Mode 재구현, 훅 테스트 4/27
- 구조적 발견: 스킬 209종은 2단계 중첩 경로(skills/{cat}/{name}/)라 **스킬로 등록 안 됨** — 에이전트가 Read하는 지식베이스로만 동작. 에이전트 68종 description은 매 세션 로드(수천 토큰)
- 배포: project-install.sh 복사 방식은 구세대 — 2026 표준은 플러그인+사설 마켓플레이스(sha 핀)
- 세션 실측 오탐 4건: confirmation-gate("진행해" 미인식→수동 rm 플래그), bash-guard(읽기 전용 grep/diff 차단 2회), pending-test-guard(.claude/worktrees/ 잔재 오탐)

## 훅 다이어트 실행 계획 (5단계)

1. **제거 (Plan Mode 중복)**: task-plan-guard.js + confirmation-gate.js 삭제 → CLAUDE.md에 "복잡한 작업은 Plan Mode 사용" 규칙으로 대체. settings.json UserPromptSubmit/PreToolUse 배선도 제거
2. **Stop 훅 6→3 통합**: pending-test-guard+readme-guard → "산출물 완결성 체크" 1개로 병합 / session-summary+session-handoff → 병합 또는 제거(네이티브 resume이 커버) / memory-stop-guard·codex-review-guard는 유지
3. **오탐 수정**: bash-guard — 쓰기 연산(`>`, `-i`, `-w` 등) 있을 때만 차단(읽기 전용 grep/diff/sed -n 허용) / pending-test-guard — `.claude/worktrees/` 스캔 제외
4. **유지 (다이어트 제외)**: parry, protect-secrets, branch-protection, memory-sync/pull, verification-guard, tdd-guard — 네이티브에 없고 비가역 사고 방지
5. **남긴 훅에 *.test.js 필수화** — 오탐 4건 전부 미테스트 훅에서 발생

목표: 훅 파일 33→~20, Stop 6→3. 판단 기준: "없으면 비가역 사고가 나는가? 아니면 CLAUDE.md 한 줄/네이티브로 충분한가"

## 후순위 (훅 다이어트 이후)

- 플러그인 전환: project-install.sh → plugin.json+marketplace.json 사설 배포
- 자산 다이어트: 저사용 에이전트/스킬(dream 28·unity 17·학술 ~40) 아카이브 분리
- agent-design.md에 "네이티브 우선 원칙" 추가, 테스트 실행 PostToolUse 훅 검토

레퍼런스: code.claude.com/docs/en/best-practices (Plan Mode 휴리스틱·Stop 8회 한도·훅 원칙), code.claude.com/docs/en/plugins
