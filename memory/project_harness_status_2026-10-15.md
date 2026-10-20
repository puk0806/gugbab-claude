---
name: project-harness-status-2026-10-15
description: "★ 하네스 현재 상태 (2026-10-20 갱신 — shim 래퍼 v1.0.10, 래퍼로만 사용) — 자산 수·남은 제안·미결 과제·환경 주의사항"
metadata:
  node_type: memory
  type: project
  originSessionId: 0693c72c-1709-4533-8cb9-8a3b20e52a64
  modified: 2026-10-20T00:46:02.763Z
---

**상태 (2026-10-20 갱신)**: **shim 래퍼(`gugbab-claude`)로만 사용**(결정 27). main = `89de4ef`(PR #38), 설치본 `~/gugbab` = **v1.0.10**(stable, PR 마다 VERSION 올림 → 머지 때 자동 태그 — 결정 32). 개편 0~6단계 완료, 결정 1~40 은 계획서 13장 + [[project-shim-wrapper-direction]]. 옛 복사 설치(`project-install.sh`·템플릿 0~15)는 6단계에서 삭제됨. 다른 PC 에서 시작하면 계획서 페이지 https://claude.ai/artifact/U7vpKRXVemaNYYNhz8nNLj (계획서 + 항목 체크리스트) 와 `docs/DEFAULTS.md` 가 기본값·고정 목록 원본.

**자산 수 (manifest 실측 2026-10-20)**: 스킬 195 · 에이전트 61 · 훅 32 + statusline · 규칙 14 · 커맨드 12 · 설정 7 = 321 항목, 기본 고정 35 · 켬 70 · 끔 216. 검증 상태(10-16 기준) APPROVED 181 · PENDING_TEST 15(실사용 필수만) · NEEDS_REVISION 0.

**남은 제안 (2026-10-20)**: `v*` 태그 보호 규칙(결정 28) · Codex 적대적 리뷰 맨 마지막 1회 · 🔒 고정 훅 비정상 종료 시 fail-closed · 디스패처가 프로젝트 훅 삭제를 실시간 반영 · 윈도우 지원([[project-windows-support-analysis]], 보류). 파생 하네스 세션에 래퍼 전환 자료를 메시지로 전달함(2026-10-19).

**최근 이력 (요약)**
- 09-28~29 PR #19: 철학·학술 자산 삭제(템플릿 8 폐지), 재검증·재테스트, PENDING_TEST 실행 검증
- 10-05 PR #20·#21: 구조 감사 회귀 테스트 4종, **스킬 2단→1단 평탄화**(2단이면 스킬로 등록 안 되던 결함), skill-md-guard 구조 가드
- 10-06 커밋 `b8ea4e2`: 훅 6종 신설(korean-response-guard·task-confirm-guard·package-manager-guard·auto-format·config-change-audit·progress-tracker)·승인 분류 정비 (상세는 README 2026-10-06 행)
- 10-08 PR #23: 스펙 추출·넥사크로 자산 + 템플릿 14·15 (상세는 README 2026-10-08 행)
- 10-15: 레포 안 `dog-video/`(개인 영상 작업)를 `~/Desktop/gugbab-workspace/dog-video`로 이동, 관련 메모리도 그 폴더 메모리로 이동

**개편 범위는 gugbab 하네스만** (2026-10-16 사용자 결정): 범위 밖 내용은 git 에 올리지 않고 로컬 전용으로 둔다 — 목록·사유는 [[local-index]] (`.gitignore` "로컬 전용" 구역과 짝).

**미결 과제**
1. 로컬 전용 내용: 2026-10-16 현재 파일에서는 정리 완료(추적 제외·중립 이름). 예전 커밋 이력에는 남아 있음 — 이력까지 지울지는 개편 완성 후 결정(force push 필요)
2. Codex 리뷰: 사용자 결정으로 개편 1차본 완성 후 맨 마지막에 실행(지금은 `codex.skipReview=true`) — [[feedback-codex-review-on-request]]. 작업 트리에 외부 반출하면 안 되는 내용이 있으면 빼는 방법부터. **완료 마커 위조 금지**
3. ~~설치본(01·04·voca) 재설치~~ → 복사 설치 폐지, 각 프로젝트는 `gugbab-claude` 로 열면 자동 최신화
4. 커밋·푸시는 요청 시에만. 2026-10-16 결정: 이번 세션 요약(exports)은 레포에 올리지 않고 로컬 전역에만 둠. 새로 올리는 문서의 예시 프로젝트 이름은 중립 이름(`my-ui`)

**개편 논의 때 참고할 사실 (2026-10-14 공식 문서 조사)**
- 조직 배포의 공식 경로 = **플러그인 + 사내 마켓플레이스**(`extraKnownMarketplaces`·`enabledPlugins`, 관리 설정으로 강제) + **관리 설정**(`managed-settings.json`/MDM/claude.ai 콘솔, `strictKnownMarketplaces`·`allowManagedHooksOnly`·`strictPluginOnlyCustomization` 등)
- CLAUDE.md·rules 는 플러그인 구성 요소가 아님(미재확인) → 관리 정책 CLAUDE.md 또는 레포 CLAUDE.md
- 지금 이 레포는 `project-install.sh` 복사(export) 방식. 플러그인 전환은 2026-07 계획만 있고 미착수 — [[project-hook-diet-plan]] [[project-install-sh]]

**환경 주의사항**
- 수정 작업은 답변 마지막 줄을 `진행할까요?`로 끝내야 다음 차례 Write/Edit가 풀림(task-confirm-guard)
- 바탕화면 아래가 갑자기 EPERM 이 되는 일이 있었음(엔드포인트 보안 추정) → 전체 디스크 접근 권한 확인
- 대용량 push 가 `HTTP 400 RPC failed` 면 `git -c http.postBuffer=524288000 push`
