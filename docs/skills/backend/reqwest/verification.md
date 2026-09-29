---
skill: reqwest
category: backend
version: v7
date: 2026-09-28
status: APPROVED
---

# reqwest 스킬 검증 문서

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
| 스킬 이름 | reqwest |
| 스킬 경로 | .claude/skills/reqwest/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 검증 방법 | rust-backend-developer 활용 테스트 (cargo check 검증) |
| 버전 기준 | reqwest 0.13.x (0.12.x도 동일 API로 호환) |
| 검증일 | 2026-09-28 (재검증, 이전 2026-08-12) |
| 재검증일 | 2026-04-09, 2026-09-28(2차) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.rs, crates.io)
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성 (Rust 기준)
- [✅] 흔한 실수 패턴 정리
- [✅] WebSearch 교차 검증 (7개 클레임, VERIFIED 6, DISPUTED 1)
- [✅] DISPUTED 1건 수정 반영 (reqwest 내장 retry v0.12.23+)
- [✅] SKILL.md 파일 작성
- [✅] Claude Code 에이전트에서 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | Client생성/재사용, GET(.text/.json), POST(.json), 헤더(개별/HeaderMap), 스트리밍, 에러처리 6개 | 6/6 PASS (Rust 1.85+ 권장 환경 명시) |
| 교차 검증 | WebSearch | 7개 클레임, 독립 소스 2개+ | VERIFIED 6 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 공식 문서 | https://docs.rs/reqwest/latest/reqwest/ | ⭐⭐⭐ High | - | 공식 API 문서 |
| GitHub | https://github.com/seanmonstar/reqwest | ⭐⭐⭐ High | - | 공식 소스 + CHANGELOG |
| CHANGELOG.md | https://github.com/seanmonstar/reqwest/blob/master/CHANGELOG.md | ⭐⭐⭐ High | - | 버전별 변경 이력 |
| PR #2763 (built-in retry) | https://github.com/seanmonstar/reqwest/pull/2763 | ⭐⭐⭐ High | 2025-08-08 | v0.12.23 내장 retry 머지 |
| crates.io reqwest-retry | https://crates.io/crates/reqwest-retry | ⭐⭐ Medium | - | 외부 retry 크레이트 |

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
| 1 | reqwest 0.12.x → hyper 1.x, 0.11.x → hyper 0.14 | VERIFIED | CHANGELOG.md 직접 확인 |
| 2 | `json` feature로 `.json()` 메서드 활성화 (serde 연동) | VERIFIED | response.rs #[cfg(feature="json")] 확인 |
| 3 | `stream` feature로 `bytes_stream()` 메서드 활성화 | VERIFIED | response.rs #[cfg(feature="stream")] 확인 |
| 4 | Client 내부 커넥션 풀 유지, 재사용 권장 | VERIFIED | docs.rs Client 문서 직접 명시 |
| 5 | `.json(&body)` → `Content-Type: application/json` 자동 설정 | VERIFIED | RequestBuilder::json() docs 확인 |
| 6 | reqwest 자체에는 재시도 기능 없음 | DISPUTED | v0.12.23부터 내장 retry 추가 (PR #2763) → 수정 반영 |
| 7 | `error_for_status()` → 4xx/5xx를 reqwest::Error로 변환 | VERIFIED | response.rs 소스 직접 확인 |

### 4-5. DISPUTED 항목 처리

**DISPUTED #6: reqwest 내장 retry 기능**
- 원래 표현: "reqwest 자체에는 재시도 기능이 없다"
- 수정: v0.12.23(2025-08-08)부터 `reqwest::retry` 모듈과 `ClientBuilder::retries(policy)` 내장. 커스텀 정책은 reqwest-middleware + reqwest-retry 조합 권장.
- SKILL.md 반영: `> 주의:` 표기 추가

### 4-6. Claude Code 에이전트 활용 테스트
- [✅] 공식 문서 1순위 소스 확인 (docs.rs/reqwest)
- [✅] WebSearch 교차 검증 완료 (7개 클레임)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (reqwest 0.12.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)
- [✅] (2026-09-28 4차 재테스트 완료, 2/2 PASS) 선택 보강 반영분(retry::Builder/for_host 예제, dns::Resolve 섹션) content test 수행

---

## 5. 테스트 진행 기록

### 2단계 4차 재테스트 (2026-09-28) — 선택 보강 반영분(retry::Builder·for_host 예제, dns::Resolve 섹션) 검증

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2개 병렬 호출, rust-backend-developer 미가용 환경으로 대체)
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션·anti-pattern 회피 확인. 직전 "[2026-09-28] 선택 보강 반영"(바로 아래 블록)에서 추가된 `retry::Builder`/`for_host()`/`classify_fn()` 체이닝 예제와 `reqwest::dns::Resolve` 구현+`dns_resolver()` 섹션을 직접 겨냥한 질문 구성

**Q1. api.anthropic.com 호스트에만 재시도 정책을 적용하고 5xx만 재시도하도록 커스텀하려면? policy 인자 타입은?**
- ✅ PASS
- 근거: "재시도 패턴" 섹션 342~370행 — `policy: Builder`(`reqwest::retry::Builder`) 타입 명시, `retry::for_host(host)` → `.max_retries_per_request(n)` → `.classify_fn(...)` 체이닝 코드 예제
- 상세: `status.is_server_error()`일 때만 `req_rep.retryable()` 반환하는 `classify_fn` 클로저까지 정확히 인용해 질문의 요구사항(호스트 한정 + 5xx만 재시도)을 코드로 재구성함. 잔여 gap: `req_rep` 타입의 전체 API·backoff 간격 세부 제어는 SKILL.md에 없음(경미, reqwest-middleware로 위임 안내가 이미 있어 비차단)

**Q2. reqwest Client에 커스텀 DNS resolver를 연결하려면? Arc로 감싸야 하는 이유·제약은?**
- ✅ PASS
- 근거: "DNS 리졸버 커스터마이징" 섹션 374~398행 — `reqwest::dns::Resolve` 트레이트(`fn resolve(&self, name: Name) -> Resolving`), `Client::builder().dns_resolver(Arc::new(MyResolver))`, `IntoResolve`(`Resolve + 'static` 또는 `Arc<dyn Resolve>`) 설명
- 상세: 트레이트 시그니처·builder 등록법 모두 정확히 인용. 테스트 에이전트가 "Arc가 SKILL.md상 필수라고 명시되어 있진 않고 `IntoResolve`가 값 타입도 지원한다는 서술만 있어, Arc를 써야 하는 강제 이유는 SKILL.md에 직접 서술되어 있지 않다"는 정확한 관찰을 함 — 이는 SKILL.md 원문(398행)이 실제로 그렇게만 서술하고 있어 답변이 SKILL.md에 충실한 것이며 오류 아님(선택 보강 여지)

### 발견된 gap (2026-09-28 4차 재테스트)

- **[선택 보강, 비차단]** `retry::Builder`의 `req_rep`(응답 판별 객체) 전체 API·재시도 backoff 간격 제어 방법이 SKILL.md에 없음(reqwest-middleware 위임 안내로 대체 가능, 차단 아님)
- **[선택 보강, 비차단]** `dns_resolver()`에 `Arc::new(...)`를 쓰는 것이 예제상 관례일 뿐 SKILL.md가 "왜 Arc가 필요한지"(멀티스레드 공유 등) 명시적 이유를 설명하지 않음 — `IntoResolve`가 값 타입도 지원한다는 서술과 상충하지 않으나 이유가 궁금한 독자에게는 gap

### 판정 (2026-09-28 4차 재테스트)

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 (content test로 APPROVED 전환 가능)
- 최종 상태: PENDING_TEST → APPROVED (선택 보강 반영분이 실전 질문에 정확히 반영됨을 확인, 잔여 지적은 선택 보강)

---

### [2026-09-28] 선택 보강 반영

**무엇을**: §7의 선택 보강 항목("`ClientBuilder::retry(policy)`의 `policy` 인자 타입·`dns_resolver()` 사용 코드 예제 보강") 반영.
- "재시도 패턴" 섹션에 `ClientBuilder::retry(policy)`의 `policy` 인자가 `reqwest::retry::Builder` 타입임을 명시하고, `retry::for_host(host)` → `.max_retries_per_request(n)` → `.classify_fn(...)` 체이닝 실전 코드 예제 추가. `no_budget()`/`max_extra_load()`/`classify()` 등 나머지 `Builder` 메서드도 요약 추가.
- 신규 "DNS 리졸버 커스터마이징" 섹션 추가 — `reqwest::dns::Resolve` 트레이트 구현 예제(`fn resolve(&self, name: Name) -> Resolving`) + `Client::builder().dns_resolver(Arc::new(MyResolver))` 사용 코드, `IntoResolve` 구현 대상(`Resolve + 'static`, `Arc<dyn Resolve>`) 설명.

**근거** (docs.rs reqwest 0.13.5 공식 API 문서, 1차 소스 직접 확인):
- https://docs.rs/reqwest/0.13.5/reqwest/struct.ClientBuilder.html — `retry(self, policy: Builder) -> ClientBuilder`, `dns_resolver<R>(self, resolver: R) -> ClientBuilder where R: IntoResolve`
- https://docs.rs/reqwest/0.13.5/reqwest/retry/struct.Builder.html — `max_retries_per_request`, `classify_fn`, `classify`, `no_budget`, `max_extra_load`, `scoped` 시그니처 + `classify_fn` 예제 코드
- https://docs.rs/reqwest/0.13.5/reqwest/retry/fn.for_host.html — `pub fn for_host<S>(host: S) -> Builder`
- https://docs.rs/reqwest/0.13.5/reqwest/dns/trait.Resolve.html — `pub trait Resolve: Send + Sync { fn resolve(&self, name: Name) -> Resolving; }`
- https://docs.rs/reqwest/0.13.5/reqwest/dns/trait.IntoResolve.html — `Arc<dyn Resolve>`, `Arc<R: Resolve + 'static>`, `R: Resolve + 'static` 구현 확인

### 테스트 케이스 1: rust-backend-developer 에이전트 활용 테스트

**테스트 방법:** rust-backend-developer 에이전트에게 reqwest 관련 Rust 코드 작성 요청

**발견 및 수정 사항:**
발견된 오류 없음 — 스킬 내용 수정 불필요 (모든 API cargo check 통과, reqwest 0.12 최신버전은 Rust 1.85+ 필요(getrandom 0.4.x) — 코드 오류 아님)

**판정:** ✅ PASS

---

### [2026-09-28] 재검증(2차) — crates.io 최신 버전 오류 정정 + 0.13 기준 전환

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임을 crates.io API·GitHub CHANGELOG.md·reqwest crate 소스 코드(0.12.24, 0.13.0) 직접 다운로드 대조

**클레임 대조 결과**:
1. "reqwest 0.13.x 최신은 0.13.11 (2026-05-28 릴리즈)" → **DISPUTED(정정)**. crates.io API 직접 조회 결과 0.13.11 버전은 존재하지 않음(`does not have a version` 응답). 실제 최신은 0.13.5(2026-09-08 릴리즈), 0.13.0 최초 릴리즈는 2025-12-30 (crates.io API)
2. "0.13 마이그레이션 시 MSRV 1.85로 상향" → **DISPUTED(정정)**. 0.12.24·0.13.0 크레이트 소스 Cargo.toml 모두 `rust-version = "1.64.0"`으로 동일 — MSRV 변경 없음
3. "`ClientBuilder::dns_resolver`가 `dns_resolver2`로 교체" → **DISPUTED(정정)**. 소스 확인 결과 `dns_resolver2`는 0.12.23에서 임시 추가됐다가 0.13.0에서 제거됨. 원래 `dns_resolver()`는 0.13.0에도 그대로 존재 — 정반대로 기재되어 있었음
4. "reqwest 0.12.23부터 `ClientBuilder::retries(policy)` 내장" → **DISPUTED(정정)**. 실제 메서드명은 `retry(policy)`(단수), 소스(0.12.24·0.13.0) 및 CHANGELOG.md 직접 확인. 릴리즈일도 2025-08-08이 아닌 2025-08-12로 정정(crates.io API)
5. "0.13 rustls 기본 TLS·aws-lc·`rustls-tls`→`rustls` rename" → VERIFIED (GitHub CHANGELOG.md v0.13.0 항목 직접 확인)
6. "`json`/`stream` feature로 `.json()`/`bytes_stream()` 활성화" → VERIFIED (0.13.0 소스 Cargo.toml `[features]` 섹션에서 feature명 불변 확인)
7. "reqwest-middleware 0.4.x / reqwest-retry 0.7.x" → **DISPUTED(정정)**. crates.io 최신은 reqwest-middleware 0.5.2 / reqwest-retry 0.9.1. reqwest-middleware 0.5.2의 Cargo.toml이 `reqwest 0.13.1`을 의존하는 것도 직접 확인
8. "`reqwest::Url`의 serde Deserialize 지원이 별도 feature 필요"(0.13 변경점) → **UNVERIFIED** — 공식 CHANGELOG.md v0.13.0 항목에 해당 내용 없고 소스에서도 0.12→0.13 사이 변경 근거 못 찾음 → 근거 부족으로 SKILL.md에서 제거

**보강(ADD)·축소**: 본문을 0.12.x 기준에서 0.13.x 기준으로 전환(Cargo.toml 예시 `version = "0.13"`). 예제 코드(Client 생성, GET/POST, 헤더, 스트리밍, 에러 처리)는 0.12·0.13 API 동일이라 변경 없이 유지. 마이그레이션 노트 블록을 CHANGELOG.md 원문 기준으로 재작성(query/form opt-in feature化, native-tls ALPN 기본 포함, TLS 메서드 soft-deprecation 등 실제 항목 반영). 축소는 없음(레포 고유 가치 있는 실전 예제·주의사항이라 유지).

**실전 질문 재검증**:
- Q1. "reqwest 0.13에서 Cargo.toml에 어떻게 의존성을 추가하나?" → SKILL.md "Cargo.toml 의존성" 섹션 근거로 PASS (`version = "0.13", features = ["json", "stream"]`)
- Q2. "reqwest에 내장 재시도 기능이 있나? 메서드명은?" → SKILL.md "재시도 패턴" 섹션 근거로 PASS (`ClientBuilder::retry(policy)`, 0.12.23+)

**재검증 최종 판정**: status **PENDING_TEST 전환** (사실 오류 다건 정정 + 0.13 기준 전환으로 skill-tester 재테스트 필요)

### skill-tester 에이전트 content test (2026-09-28, 독립 재테스트)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose × 2 (rust-backend-developer 미가용 환경으로 대체, 자체 재검증이 아닌 별도 서브에이전트 위임)
**수행 방법**: SKILL.md Read 후 2차 재검증에서 정정된 내용(MSRV 불변, `dns_resolver` 정정, `retry()` 메서드명, 버전 0.13.5)을 겨냥한 질문 2개를 각각 독립 서브에이전트에게 위임(자기 지식 사용 금지, SKILL.md 근거 인용 필수)

**Q1. reqwest 0.13 마이그레이션 시 MSRV가 올라가는가? 내장 재시도 메서드명은?**
- ✅ PASS
- 근거: SKILL.md 상단 "0.12 → 0.13 실제 Breaking Change" 블록(MSRV 1.64.0 불변) + "재시도 패턴" 섹션(`ClientBuilder::retry(policy)`)
- 상세: 과거 "1.85로 상향" 오기재가 정정되어 있음을 정확히 인용, 메서드명 `retry`(단수) 정확히 인용

**Q2. crates.io 최신 0.13.x 버전은? DNS resolver 메서드는 dns_resolver인가 dns_resolver2인가?**
- ✅ PASS
- 근거: SKILL.md 상단 인용문(0.13.5, 2026-09-08) + "0.12 → 0.13 Breaking Change" 블록(`dns_resolver2`는 0.13.0에서 제거, 원래 `dns_resolver()`가 유지)
- 상세: 과거 "dns_resolver2로 교체" 오기재가 정반대로 정정되어 있음을 정확히 인용

**발견된 gap (경미, 선택 보강)**: `ClientBuilder::retry(policy)`의 `policy` 인자 타입과 `dns_resolver()` 사용 코드 예제가 SKILL.md에 없음 — 메서드명·존재 여부 서술만 있고 실전 코드 스니펫 부재. 차단 요인 아님.

agent content test: 2/2 PASS (독립 general-purpose 서브에이전트 수행)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | 2026-09-28 재검증에서 버전·MSRV·메서드명 오류 다건 정정 (아래 8. 참조) → 독립 에이전트 재테스트로 정정 내용 재확인 완료 (2/2 PASS) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (rust-backend-developer, 2026-04-09) + 2026-09-28 독립 general-purpose 재테스트 2/2 PASS (정정 내용 반영 확인) + 2026-09-28 4차 재테스트 2/2 PASS (retry::Builder/for_host 예제·dns::Resolve 섹션 반영 확인) |
| **최종 판정** | **APPROVED** (2026-09-28 4차 재테스트로 선택 보강 반영분 content test 통과. 잔여 gap은 req_rep API·Arc 필요 이유 미상세, 선택 보강·비차단) |

---

## 7. 개선 필요 사항

- [✅] (2026-09-28 반영) `ClientBuilder::retry(policy)`의 `policy` 인자 타입·`dns_resolver()` 사용 코드 예제 보강 — docs.rs 0.13.5 기준 `reqwest::retry::Builder`/`for_host()`/`classify_fn()` 체이닝 예제와 `reqwest::dns::Resolve` 구현+`dns_resolver(Arc::new(...))` 예제 추가 (근거: §5 "[2026-09-28] 선택 보강 반영")
- [✅] (2026-09-28 4차 재테스트 완료, 2/2 PASS) 선택 보강 반영분(retry::Builder·for_host 예제, dns::Resolve 섹션) content test 수행 → §5 "2단계 4차 재테스트" 참조
- [❌] **(선택 보강, 비차단)** `retry::Builder`의 `req_rep` 응답 판별 객체 전체 API·backoff 간격 제어 방법 미기재, `dns_resolver()`에 `Arc`가 필요한 이유(멀티스레드 공유 등) 미설명 — 둘 다 차단 요인 아님, 향후 보강 시 반영 권장

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-09 | v1 | 최초 작성, rust-backend-developer 활용 테스트 완료 | rust-backend-developer 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-04-17 | v3 | WebSearch 7개 클레임 교차 검증, DISPUTED 1건 수정 (reqwest 내장 retry v0.12.23+) | 메인 대화 오케스트레이션 |
| 2026-06-20 | v4 | 버전 재검증 — reqwest 0.13.11 (2026-05-28 릴리즈) 확인. 현재 문서는 0.12.x 유지, SKILL.md에 0.13 마이그레이션 노트(rustls 기본 TLS, MSRV 1.85, dns_resolver2, Url serde feature 변경) 추가 | 버전 재검증 작업 |
| 2026-08-12 | v4 | **모델 ID 세대 정렬.** Claude API 예제 코드 2곳의 `claude-sonnet-4-6` → `claude-sonnet-5` 교체(§JSON 요청 본문, §스트리밍 응답 처리). Sonnet 4.6은 여전히 호출 가능한 legacy지만 현행 세대는 Sonnet 5. 샘플링 파라미터(`temperature`/`top_p`/`top_k`)·`budget_tokens` 사용 없음 — 5 계열 400 이슈 해당 없음. reqwest 라이브러리 내용은 변경 없음. 검증일 2026-06-20 → 2026-08-12. status **APPROVED 유지** | 모델 ID 세대 정렬 |
| 2026-09-28 | v5 | **재검증(2차) — crates.io·CHANGELOG.md·소스 코드 직접 대조로 사실 오류 4건 정정.** 존재하지 않는 "0.13.11" 버전 기재를 실제 최신 0.13.5로 정정, MSRV "1.85 상향" 오류 제거(실제 1.64.0 불변), `dns_resolver→dns_resolver2` 교체 서술을 정반대로 정정(실제는 dns_resolver2가 0.13에서 제거), `ClientBuilder::retries()`를 실제 메서드명 `retry()`로 정정. reqwest-middleware/reqwest-retry 버전도 최신(0.5.x/0.9.x)으로 갱신. 본문을 0.12 기준에서 0.13 기준으로 전환(예제 코드는 API 불변이라 유지). status APPROVED → **PENDING_TEST** | 재검증(2차) 작업 |
| 2026-09-28 | v6 | skill-tester 독립 에이전트(general-purpose) content test 재수행 (Q1 MSRV·retry() 메서드명 / Q2 버전 0.13.5·dns_resolver 정정) → 2/2 PASS. 라이브러리 스킬(content test로 충분 카테고리) — status PENDING_TEST → **APPROVED** | skill-tester |
| 2026-09-28 | v7 | **선택 보강 반영** — docs.rs reqwest 0.13.5 API 문서로 `ClientBuilder::retry(policy: Builder)`의 `policy` 타입(`reqwest::retry::Builder`)·`for_host()`/`max_retries_per_request()`/`classify_fn()` 체이닝 코드 예제 추가, `dns_resolver<R: IntoResolve>()` 사용을 위한 `reqwest::dns::Resolve` 구현+`Arc` 사용 코드 예제 신규 섹션 추가. 내용(코드 예제) 추가로 status APPROVED → **PENDING_TEST**(메인이 skill-tester 재테스트 필요) | 메인 오케스트레이션 (Claude Sonnet 5) |
| 2026-09-28 | v7 | 2단계 4차 재테스트 수행 (Q1 retry::Builder/for_host 호스트별 5xx 재시도 / Q2 dns::Resolve 구현+Arc 등록) → 2/2 PASS, 선택 보강 반영분 content test 통과 → PENDING_TEST → **APPROVED** 전환 | skill-tester |
