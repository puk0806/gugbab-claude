---
name: project_full_audit_2026-09-25
description: "2026-09-25 스킬 232·에이전트 65 전수 점검 → Opus 5.5/Fable 5.1 현행화, 신규 스킬 5·에이전트 1, 템플릿 13, 500줄 초과 31종 references 분리. 삭제 대상 0"
metadata:
  node_type: memory
  type: project
  originSessionId: 64863110-4333-4f2b-963a-d8c76a43ec50
  modified: 2026-09-25T10:03:52.406Z
---

2026-09-25 사용자 요청 "현재 모델(Opus 5.5)에 맞게 전체 점검·불필요 제거·필요한 것 생성". 점검 결과 **삭제·병합 근거 있는 자산 0** (버전별 분리 스킬은 의도된 설계) → 작업은 현행화·배선·신규 생성 중심.

**완료**
- 모델: 훅 `agent-md-guard` VALID_MODELS 먼저 갱신(규칙 먼저 바꾸면 훅이 새 ID 차단) → `agent-design.md`(Opus 5.5 브레이킹 체인지: thinking 비활성 불가·effort 기본 medium·강제 tool_choice 400·computer_toolset_20260801) → freshness-auditor → deep/academic-researcher `claude-fable-5-1` → 스킬 11종 예제. rust-backend-architect opus→sonnet.
- 신규 스킬 5 APPROVED: backend/hono-api-patterns, prisma-orm, zod-schema-validation, better-auth, frontend/next-intl-i18n. 신규 에이전트 health/nutrition-prompt-tester.
- 설치: redis-redisson-4 모던 등록, SPECIAL_AGENTS_HEALTH, 템플릿 13 python-fastapi ([[project_install_architecture]]).
- 500줄 초과 31종 references/REFERENCE.md 분리(내용 손실 0, `git show HEAD:` 비교로 검증).

**운영 교훈**
- skill-creator·agent-creator는 `isolation: worktree` → 산출물이 `.claude/worktrees/agent-*`에 남고 **HEAD 기준이라 미커밋 스킬이 안 보임**. 완료 시 복사 → diff → `git worktree remove --force` + 브랜치 삭제.
- 세션 한도(429)로 서브에이전트 10여 개가 동시 중단 → 분리 작업이 "REFERENCE 생성·SKILL 미축소(중복)" 반쪽 상태로 남음. 재개 시 `git show HEAD:` 대비 comm 비교로 상태 분류 후 이어서 처리. 재부팅으로 scratchpad(/private/tmp) 전체 유실 — 백업은 scratchpad에만 두지 말 것.
- deliverable-guard Stop 훅은 skill-tester 완료 전까지 매 턴 차단 → 포그라운드 until 루프로 verification.md status 전환 대기.
- Codex 리뷰는 계정 모델 문제로 미수행 ([[feedback_codex_review_workflow]]).

**2차 점검(같은 날) 후 수정 완료**: 설치 버그 6건(TS_BACKEND_SKILLS 소유 템플릿 2·3·10·12·0 신설 — 병렬 스킬 생성 시 설치 소유권 누락이 원인, TS 에이전트 rust·java·unity 누수, 에이전트 디렉토리 CLAUDE.md 누수·없는 규칙 import 자동 제거, health/* 다운그레이드 prune, 템플릿 0 깨진 참조, 입력 EOF → `prompt_read` exit 1). 훅 테스트 6종 신설로 전 훅 테스트 보유, 그 과정에서 memory-sync(N 프로젝트에 memory/ 생성)·memory-pull(깨진 symlink가 순회 중단) 버그 수정. agent-md-guard에 문서↔VALID_MODELS 동기화 테스트. 테스트 파일 27개 전부 통과.
**교훈**: 새 스킬을 만들면 project-install.sh 소유 템플릿 등록까지가 한 세트 — 스킬 생성과 설치 스크립트 수정을 병렬로 돌리면 연결이 빠진다.

**후속 과제(미처리)**: health 스킬 gap(meal-recommendation 알레르기 기본 흐름 부재·만료 식재료 미필터, nutrition-analysis 면책 필드 없음), 신규 스킬 선택 보강 gap들(각 verification.md 섹션 7), moral-curriculum 도덕과 부분개정 포함 여부 미확인. 관련: [[project_full_audit_2026-09-11]].
