---
name: project_freshness_audit_2026-06
description: "2026-06-19~22 Freshness Audit — 30일 이상 스킬 전체 재검증, confirmation-gate 훅 신설, PR"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2df54556-f3d1-4476-b4b9-fe4f076a4a62
---

Freshness Audit 전체 완료. `feature/confirmation-enforcement` 브랜치 → PR #3 → main merge.

**Why:** 30일 이상 경과한 스킬들의 버전 정보 stale 상태 해소 + PENDING_TEST 스킬 APPROVED 전환.

**How to apply:** 다음 freshness audit 시 이 결과를 베이스라인으로 삼는다. 변경 목록은 아래 참조.

---

## Phase 1 — Critical Fixes (버전 호환 파괴 업데이트)

- `frontend/mui-v5` SKILL.md: MUI v5 → **v9 전면 재작성** (v8 skip, slots/slotProps, Grid `size` prop, CSS Variables, `applyStyles('dark')`)
- `backend/spring-boot-gradle-setup`: Spring Boot 4.x 섹션 추가 (Gradle 8.14+, Jackson 3.0 `tools.jackson`, `@MockitoBean`)
- `backend/hikaricp-tuning-oracle-mysql`: HikariCP 7.0 변경사항 추가
- `backend/springdoc-openapi-3`: springdoc v3.x 섹션 추가
- `backend/testing-junit5-spring-boot`: SB4 `@MockitoBean`, `@MockBean` 제거 노트
- `meta/riper-workflow` verification.md: 신규 생성

## Phase 2 — PENDING_TEST → APPROVED 전환 (16종)

frontend 16종 APPROVED: web-speech-api-tts, web-speech-api-stt, indexeddb-dexie, media-recorder-api, voice-input-ui, dream-symbol-tagging, dream-recurrence-detection, whisper-api-integration, chat-ui-pattern, emotion-tagging-input, dream-sharing-anonymized, dream-privacy-consent-ui, dream-export-import, dream-app-onboarding, dream-statistics-visualization, dream-image-generation

backend 1종: testing-junit5-spring-boot — content test 3/3 PASS 기록, PENDING_TEST 유지 (실사용 필수 카테고리)

## Phase 3 — Warning 재검증 (버전 업데이트)

- `backend/sqlx`: 0.9.0 마이그레이션 노트 (SqlSafeStr trait)
- `backend/reqwest`: 0.13.11 마이그레이션 노트 (rustls default, MSRV 1.85)
- `backend/tower-http`: 0.7.0 마이그레이션 노트 (no-op feature 제거)
- `backend/jwt-auth`: jsonwebtoken 9 → 10.4.0 (rust_crypto feature 필수)
- `frontend/monorepo-turborepo`: Turborepo 2.9.18 + pnpm 11 호환성 노트
- 나머지 Rust backend 13종 + frontend 4종: 검증일 2026-06-20 업데이트

## confirmation-gate.js 훅 신설

- PostToolUse Write/Edit 이벤트에서 복잡한 작업 시 파일 수정 전 사용자 확인 강제
- task-plan-guard.js 개선 병행
- 총 훅 수: 28 → **29종**
