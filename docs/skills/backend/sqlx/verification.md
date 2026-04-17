---
skill: sqlx
category: backend
version: v1
date: 2026-04-17
status: APPROVED
---

# sqlx 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ fact-checker 교차 검증 ❌ (미실행 — 수동 작성)
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증)
  ├─ rust-backend-developer 에이전트 테스트 수행
  └─ 테스트 PASS → APPROVED
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | sqlx |
| 스킬 경로 | .claude/skills/sqlx/SKILL.md |
| 최초 작성일 | 2026-04-07 |
| 재검증일 | 2026-04-09 |
| 검증 방법 | 수동 작성(초기) + rust-backend-developer 활용 테스트 |
| 버전 기준 | sqlx 0.8.x |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.rs, crates.io)
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성 (Rust 기준)
- [✅] 흔한 실수 패턴 정리
- [✅] WebSearch 교차 검증 (7개 클레임, VERIFIED 6, DISPUTED 1)
- [✅] DISPUTED 1건 수정 반영 (runtime feature 복수 선택 시 컴파일 에러→런타임 패닉)
- [✅] SKILL.md 파일 작성
- [✅] Claude Code 에이전트에서 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | Pool, query_as/FromRow, INSERT/execute, 트랜잭션, AppState+Pool, 에러처리 6개 | 5/6 PASS → SKILL.md 수정 후 APPROVED |
| 교차 검증 | WebSearch | 7개 클레임, 독립 소스 2개+ | VERIFIED 6 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 공식 문서 | https://docs.rs/sqlx/latest/sqlx/ | ⭐⭐⭐ High | - | API 레퍼런스 |
| GitHub | https://github.com/launchbadge/sqlx | ⭐⭐⭐ High | - | 공식 소스 + CHANGELOG |
| sqlx-cli README | https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md | ⭐⭐⭐ High | - | 오프라인 모드 문서 |
| PostgreSQL 에러 코드 | https://www.postgresql.org/docs/current/errcodes-appendix.html | ⭐⭐⭐ High | - | 23505 unique_violation 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임 (Rust 컴파일 기준)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. WebSearch 교차 검증 결과

| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | sqlx 0.8.x 기준, 0.7→0.8 Breaking Change 존재 | VERIFIED | CHANGELOG.md 직접 확인 |
| 2 | `runtime-*`/`tls-*` 복수 선택 시 컴파일 에러 | DISPUTED | 0.8부터 런타임 패닉으로 변경 → 수정 반영 |
| 3 | `query!` 매크로 컴파일 타임 검증, DATABASE_URL 필요 | VERIFIED | docs.rs/sqlx query 매크로 문서 확인 |
| 4 | `PgPool` 내부 Arc 포함, 이중 래핑 불필요 | VERIFIED | Pool 공식 문서 "reference-counted handle" 확인 |
| 5 | commit 미호출 시 Transaction drop 시 자동 rollback | VERIFIED | Transaction 공식 문서 직접 확인 |
| 6 | `cargo sqlx prepare` 오프라인 모드 (SQLX_OFFLINE=true) | VERIFIED | sqlx-cli README 확인 |
| 7 | PostgreSQL unique_violation 에러 코드: 23505 | VERIFIED | PostgreSQL 공식 에러 코드 문서 확인 |

### 4-5. DISPUTED 항목 처리

**DISPUTED #2: runtime feature 복수 선택 동작**
- 원래 표현: "복수 선택 시 컴파일 에러가 발생합니다"
- 수정: sqlx 0.8부터 컴파일 에러 대신 런타임 패닉 발생. tls 복수 선택 시 `tls-native-tls` 우선 적용.
- SKILL.md 반영: `> 주의:` 표기 수정

### 4-6. Claude Code 에이전트 활용 테스트
- [✅] 공식 문서 1순위 소스 확인 (docs.rs/sqlx, github.com/launchbadge/sqlx)
- [✅] WebSearch 교차 검증 완료 (7개 클레임)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (sqlx 0.8.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 수정 후 PASS)

---

## 5. 테스트 진행 기록

### 테스트 케이스 1: rust-backend-developer 에이전트 활용 테스트

**테스트 방법:** rust-backend-developer 에이전트에게 sqlx 관련 Rust 코드 작성 요청

**발견 및 수정 사항:**
- Cargo.toml에 `anyhow` / `thiserror` 누락: AppError::Unexpected(#[from] anyhow::Error) 사용 시 필요 → SKILL.md Cargo.toml에 추가 완료
- `lastval()` 사용 위험성: 동일 세션에서 다른 시퀀스 사용 시 잘못된 값 반환 가능 → 주의 문구 추가 완료

**판정:** ✅ PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (rust-backend-developer) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- 현재 없음

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-09 | v1 | 최초 작성, rust-backend-developer 활용 테스트 완료 | rust-backend-developer 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-04-17 | v3 | WebSearch 7개 클레임 교차 검증, DISPUTED 1건 수정 (runtime feature 복수 선택 시 런타임 패닉) | 메인 대화 오케스트레이션 |
