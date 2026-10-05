---
skill: axum
category: backend
version: v1
date: 2026-09-26
status: APPROVED
---

# axum 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ fact-checker 교차 검증 ✅
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
| 스킬 이름 | axum |
| 스킬 경로 | .claude/skills/axum/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 검증일 | 2026-09-26 (최초 2026-04-06, 본문 사실성 정기 재검증) |
| 재검증일 | 2026-09-26 (본문 사실성 정기 재검증) |
| 검증 방법 | fact-checker 에이전트 (재검증) + rust-backend-developer 활용 테스트 |
| 버전 기준 | axum 0.8.x (0.8.8 실제 resolve 확인) |
| 병합 이력 | 2026-09-26 구 `backend/custom-middleware` 스킬 흡수 — SKILL.md "커스텀 미들웨어" 절 + `references/custom-middleware.md`(원문 그대로) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.rs, crates.io)
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성 (Rust 기준)
- [✅] 흔한 실수 패턴 정리
- [✅] fact-checker로 핵심 클레임 검증
- [✅] SKILL.md 파일 작성
- [✅] Claude Code 에이전트에서 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 검증 | fact-checker | 핵심 클레임 7개 | VERIFIED 5, DISPUTED 2 |
| 활용 테스트 | rust-backend-developer | 6개 패턴 코드 작성 요청 (서버실행, 라우팅, State, Json, 에러핸들링, 미들웨어) | 전항목 PASS, error 0 / warning 0 |

### fact-checker 검증 결과

| 클레임 | 판정 | 비고 |
|--------|------|------|
| axum 0.7부터 `axum::Server` 제거, `axum::serve` 사용 | DISPUTED → 수정됨 | hyper 1.0 의존 소멸이 정확한 표현. SKILL.md 수정 완료 |
| axum 0.8부터 경로 파라미터 `{id}` 문법 변경 | VERIFIED | - |
| `TypedHeader`는 axum-extra + `headers` feature | DISPUTED → 수정됨 | feature명은 `typed-header`. SKILL.md 수정 완료 |
| Extension 런타임 에러, State 0.6 도입 권장 | VERIFIED | - |
| `Router::new().route()` 기본 라우팅 패턴 | VERIFIED | - |
| 핸들러 반환 타입 `IntoResponse` | VERIFIED | - |
| `Json<T>` 추출자 + 응답 양방향 사용 | VERIFIED | 추출자 사용 시 Content-Type: application/json 필요 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| docs.rs/axum | https://docs.rs/axum/latest/axum/ | ⭐⭐⭐ High |
| tokio-rs/axum GitHub | https://github.com/tokio-rs/axum | ⭐⭐⭐ High |
| Tokio 공식 블로그 (0.6~0.8 발표) | https://tokio.rs/blog/ | ⭐⭐⭐ High |
| docs.rs axum middleware (custom-middleware 병합분) | https://docs.rs/axum/0.8.1/axum/middleware/index.html | ⭐⭐⭐ High |
| docs.rs from_fn / from_fn_with_state (병합분) | https://docs.rs/axum/0.8.1/axum/middleware/fn.from_fn.html · https://docs.rs/axum/0.8.1/axum/middleware/fn.from_fn_with_state.html | ⭐⭐⭐ High |

### custom-middleware 병합분 클레임 (원 스킬 verification에서 승계, 2026-04-17 WebSearch 교차 검증 · 2026-04-08 axum 0.8.8 cargo check)

| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | 0.6 이하 `Next<B>` 제네릭, 0.7부터 제네릭 없음 | DISPUTED → 수정됨 | 원 초안의 "0.8부터"를 0.7로 정정 (axum 0.7 발표, Discussion #2488) |
| 2 | 미들웨어에서 `axum::extract::Request` 사용 (`axum::http::Request`는 제네릭 → E0107) | VERIFIED | cargo check로 재현·수정 확인 |
| 3 | `from_fn` 시그니처 Request → Next 순서 | VERIFIED | 공식 문서 예시 |
| 4 | State 추출자는 Request·Next보다 앞 | VERIFIED | from_fn_with_state 문서 |
| 5 | `route_layer()`는 매칭 라우트만, `layer()`는 fallback 포함 | VERIFIED | Discussion #2878, routing 문서 |
| 6 | `.layer()` 호출 순서와 실행 순서 역순 | VERIFIED | axum middleware 문서 |
| 7 | `ServiceBuilder`는 선언 순서대로 실행 | VERIFIED | Tower·axum 문서 |
| 8 | `Next`는 Clone 아님 | UNVERIFIED | references에 `> 주의: 미검증` 표기 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 2건 수정 반영)
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

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 공식 문서 1순위 소스 확인 (docs.rs, tokio.rs 블로그)
- [✅] fact-checker로 핵심 클레임 검증 (7개)
- [✅] DISPUTED 항목 수정 반영 (2건 → SKILL.md 수정 완료)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (axum 0.8.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6개 패턴 전항목 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-26
**수행자**: skill-tester → rust-backend-developer
**수행 방법**: SKILL.md + references/custom-middleware.md Read 후 병합분(커스텀 미들웨어)을 겨냥한 실전 질문 3개 답변, 근거 섹션·줄 번호 및 anti-pattern 회피 확인

### 실제 수행 테스트 (병합분 대상)

**Q1. 인증 미들웨어 선택 기준(tower-http vs from_fn) + State 접근 시 시그니처 순서**
- ✅ PASS
- 근거: SKILL.md "커스텀 미들웨어" 절 표(401~406행), references/custom-middleware.md "State 접근" 절(66~136행)
- 상세: 표 기반 판단(비즈니스 로직 포함 인증 → from_fn/from_fn_with_state)과 `State→Request→Next` 순서, API 키 검증 실전 코드까지 정확히 근거 제시. route_layer 사용 이유도 함께 설명

**Q2. `axum::http::Request` 컴파일 에러 원인 + `.layer()`로 인증 미들웨어 적용 시 404→401 오작동**
- ✅ PASS
- 근거: SKILL.md 399행("axum::extract::Request` 사용 필수"), SKILL.md 410행 + references/custom-middleware.md 444~449행("layer() vs route_layer() 적용 범위" 표)
- 상세: 제네릭 `Request<T>` 문제와 `route_layer()`로 fallback 우회 문제를 정확히 근거와 함께 설명. anti-pattern(`axum::http::Request` 직접 사용, 인증 미들웨어에 `.layer()` 사용) 모두 명시적으로 회피

**Q3. 미들웨어 2개 체이닝 시 실행 순서 + 선언 순서대로 실행하는 법**
- ✅ PASS
- 근거: references/custom-middleware.md 453~478행("미들웨어 적용 순서")
- 상세: `.layer()` 호출 역순 실행(mw_b→mw_a→handler→mw_a→mw_b)과 `tower::ServiceBuilder`를 통한 선언 순서 실행 코드까지 문서와 정확히 일치

### 발견된 gap

- 없음 (SKILL.md 본문만으로는 코드 예시가 부족하나 references 링크로 명시적으로 유도되어 있어 설계상 의도된 구조)

### 판정

- agent content test: 3/3 PASS (도메인 에이전트 rust-backend-developer 사용, general-purpose 대체 아님)
- verification-policy 분류: 라이브러리·패턴 스킬 (content test PASS = APPROVED 카테고리)
- 최종 상태: APPROVED

---

### 재검증 (2026-09-26, 원 본문 대상)

**수행자**: 메인 세션 (Sonnet 5), 서브에이전트 미사용(사용자 지시)
**수행 방법**: SKILL.md + REFERENCE.md 원문(병합분 제외) Read → 버전 관련 핵심 클레임 WebSearch/WebFetch 교차 검증 → 실전 질문 2개로 SKILL.md 자체 답변 확인

**교차 검증 클레임:**
1. axum 최신 안정 버전이 0.8.x 계열 유지, 0.9 미출시 — WebSearch(crates.io/docs.rs) 결과 최신 0.8.9, 0.9 브랜치 릴리즈 없음 확인 → **VERIFIED**
2. tower-http 버전 "0.6" 예시 — WebSearch/WebFetch 결과 최신 0.7.1까지 출시, 0.7의 breaking change(구 no-op feature 제거, trailing slash 404, FollowRedirect Extensions 처리)는 SKILL.md가 사용하는 CorsLayer/TraceLayer 기본 API에 영향 없음 확인 → **DISPUTED(버전 드리프트) → 수정 반영**: Cargo.toml 예시를 `tower-http = "0.7"`로 갱신
3. tower crate 버전 "0.5" — WebSearch 결과 최신 0.5.3으로 마이너 패치만 진행, 메이저 변경 없음 → **VERIFIED**

**Q1 (재확인). "axum 0.8에서 경로 파라미터 문법이 예전과 뭐가 다른가?"**
- PASS — SKILL.md "기본 라우팅" 절 `{id}` 문법 + "> 주의: axum 0.8부터 `:id`에서 `{id}`로 변경" 설명으로 정확히 답변 가능. 최신 0.8.9까지 유지되는 문법임을 재확인.

**Q2 (재확인). "tower-http CORS/트레이싱 미들웨어를 최신 버전으로 추가하려면 Cargo.toml에 뭘 넣어야 하나?"**
- PASS — 갱신된 Cargo.toml 예시(`tower-http = { version = "0.7", features = ["cors", "trace"] }`)와 REFERENCE.md "tower-http 미들웨어" 절의 `CorsLayer`/`TraceLayer` 코드로 정확히 답변 가능.

**status**: 버전 핀 1건 수정(0.6→0.7)했으나 API·동작 변경 없음, content test 2건 PASS → **APPROVED 유지**

---

### (참고) 최초 작성 시 테스트 진행 기록

### 테스트 케이스 1: rust-backend-developer 에이전트 활용 테스트

**테스트 방법:** rust-backend-developer 에이전트에게 axum 관련 Rust 코드 작성 요청

**발견 및 수정 사항:**
발견된 오류 없음 — 스킬 내용 수정 불필요 (fact-checker DISPUTED 2건은 SKILL.md 작성 단계에서 수정 완료)

**판정:** ✅ PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (rust-backend-developer, 초기 6/6 + 2026-09-26 병합분 3/3) |
| **최종 판정** | **APPROVED** (2026-09-26 custom-middleware 병합분 content test 3/3 PASS 완료) |

---

## 7. 개선 필요 사항

- [✅ 완료 (2026-09-26 skill-tester, 3/3 PASS)] custom-middleware 병합분("커스텀 미들웨어" 절 + references/custom-middleware.md)에 대한 content test

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-07 | v1 | 최초 작성, fact-checker 검증 및 rust-backend-developer 활용 테스트 완료 | rust-backend-developer 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-06-20 | v3 | 버전 재확인 — 변경 없음. axum 0.8.x (최신 0.8.9) 유지. 0.9 브랜치 개발 중이나 아직 미릴리즈 | 버전 재검증 작업 |
| 2026-09-26 | v4 | 구 `backend/custom-middleware` 스킬 병합(스킬 정리) — SKILL.md "커스텀 미들웨어" 절 신설, 원문은 `references/custom-middleware.md`로 그대로 이관, 원 스킬 클레임 8건 승계. status APPROVED → PENDING_TEST | 스킬 정리 작업 |
| 2026-09-26 | v5 | 2단계 실사용 테스트 수행 (Q1 미들웨어 선택+State 시그니처 / Q2 Request 타입 에러+layer 오작동 / Q3 layer 실행 순서, 모두 병합분 겨냥) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-26 | v6 | 정기 재검증(원 본문 사실성 대상, 병합분 제외) — axum 최신 0.8.9 유지(0.9 미출시) VERIFIED, tower-http 최신 0.7.1로 버전 드리프트 발견·Cargo.toml 예시 0.6→0.7 수정(CorsLayer/TraceLayer API 호환, breaking change 없음 확인), tower 0.5.x 유지 확인 | Claude (Sonnet 5) |
