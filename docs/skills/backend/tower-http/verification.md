---
skill: tower-http
category: backend
version: v1
date: 2026-04-17
status: APPROVED
---

# tower-http 스킬 검증 문서

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
| 스킬 이름 | tower-http |
| 스킬 경로 | .claude/skills/tower-http/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-08 |
| 검증 방법 | rust-backend-developer 활용 테스트 |
| 버전 기준 | tower-http 0.6.x |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.rs, crates.io)
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성 (Rust 기준)
- [✅] 흔한 실수 패턴 정리
- [✅] WebSearch 교차 검증 (7개 클레임, VERIFIED 5, DISPUTED 2)
- [✅] DISPUTED 2건 수정 반영 (Compression 우선순위 조건부, permissive credentials 미포함)
- [✅] SKILL.md 파일 작성
- [✅] Claude Code 에이전트에서 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | CorsLayer(permissive/명시), allow_origin 패턴, TraceLayer 기본/커스텀, CompressionLayer, ServiceBuilder 스택 6개 | 6/6 PASS (TimeoutLayer::with_status_code 0.6.7+ 주의 문구 추가) |
| 교차 검증 | WebSearch | 7개 클레임, 독립 소스 2개+ | VERIFIED 5 / DISPUTED 2 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 공식 문서 | https://docs.rs/tower-http | ⭐⭐⭐ High | - | API 레퍼런스 |
| GitHub | https://github.com/tower-rs/tower-http | ⭐⭐⭐ High | - | 소스 + CHANGELOG |
| axum middleware 공식 문서 | https://docs.rs/axum/latest/axum/middleware/index.html | ⭐⭐⭐ High | - | 레이어 실행 순서 확인 |
| MDN CORS 문서 | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Credentials | ⭐⭐⭐ High | - | credentials + Any 금지 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (deprecated 패턴 수정 반영: TimeoutLayer::new → with_status_code)
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
| 1 | tower-http 0.6.x 기준, 0.5.x 이하 API 차이 존재 | VERIFIED | CHANGELOG.md 다수 Breaking Change 확인 |
| 2 | `allow_credentials(true)` + `allow_origin(Any)` 동시 사용 불가 | VERIFIED | MDN CORS 스펙 직접 확인 |
| 3 | `Router::layer()` 역순 실행 (마지막 추가 레이어가 먼저 실행) | VERIFIED | axum 공식 middleware.md 확인 |
| 4 | `ServiceBuilder`는 선언 순서대로 실행 | VERIFIED | tower + axum 공식 문서 확인 |
| 5 | CompressionLayer 기본 우선순위: zstd > brotli > gzip > deflate | DISPUTED | quality 값이 동일할 때만 적용되는 타이브레이커 순서 → 수정 반영 |
| 6 | TraceLayer는 tracing 크레이트 연동, subscriber 초기화 필요 | VERIFIED | docs.rs/tower-http 확인 |
| 7 | `CorsLayer::permissive()`는 모든 origin/method/header 허용 | DISPUTED | credentials는 미포함. credentials 허용은 `very_permissive()` → 수정 반영 |

### 4-5. DISPUTED 항목 처리

**DISPUTED #5: CompressionLayer 알고리즘 선택 우선순위**
- 원래 표현: "기본 우선순위: zstd > brotli > gzip > deflate"
- 수정: Accept-Encoding quality 값이 높은 알고리즘 우선 선택. quality 값이 동일할 때만 내부 순서(deflate < gzip < brotli < zstd)가 타이브레이커로 작동.
- SKILL.md 반영: `> 주의:` 표기 추가

**DISPUTED #7: `CorsLayer::permissive()` credentials 동작**
- 원래 표현: "모든 origin, method, header를 허용하는 간편 설정"
- 수정: credentials는 허용하지 않음. credentials까지 허용하려면 `CorsLayer::very_permissive()` 사용.
- SKILL.md 반영: 코드 주석 추가

### 4-6. Claude Code 에이전트 활용 테스트
- [✅] 공식 문서 1순위 소스 확인 (docs.rs/tower-http)
- [✅] WebSearch 교차 검증 완료 (7개 클레임)
- [✅] deprecated 패턴 수정 반영 (TimeoutLayer::new → with_status_code)
- [✅] 버전 명시 (tower-http 0.6.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)

---

## 5. 테스트 진행 기록

### 테스트 케이스 1: rust-backend-developer 에이전트 활용 테스트

**테스트 방법:** rust-backend-developer 에이전트에게 tower-http 관련 Rust 코드 작성 요청

**발견 및 수정 사항:**
- `TimeoutLayer::new` deprecated: tower-http 0.6.x에서 deprecated. `with_status_code(StatusCode, Duration)` 으로 수정 완료
- Cargo.toml feature 누락: `timeout`, `limit` feature 예시에 추가 완료
- `TimeoutLayer::with_status_code`는 0.6.7+ 전용임을 SKILL.md에 주의 문구 추가

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
| 2026-04-17 | v3 | WebSearch 7개 클레임 교차 검증, DISPUTED 2건 수정 (Compression 우선순위 조건부, permissive credentials 미포함) | 메인 대화 오케스트레이션 |
