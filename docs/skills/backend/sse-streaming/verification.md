---
skill: sse-streaming
category: backend
version: v7
date: 2026-09-28
status: APPROVED
---

# sse-streaming 스킬 검증 문서

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
| 스킬 이름 | sse-streaming |
| 스킬 경로 | .claude/skills/sse-streaming/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 검증일 | 2026-09-28 (재검증, 이전 2026-08-12) |
| 재검증일 | 2026-04-08, 2026-09-28(2차) |
| 검증 방법 | rust-backend-developer 활용 테스트 |
| 버전 기준 | axum 0.8.9 / tokio-stream 0.1.19 / tower-http 0.7.1 (crates.io 최신, 2026-09-28 확인) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.rs, crates.io)
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성 (Rust 기준)
- [✅] 흔한 실수 패턴 정리
- [✅] WebSearch 교차 검증 (7개 클레임, VERIFIED 5, DISPUTED 2)
- [✅] DISPUTED 2건 수정 반영 (async-stream 공식 예제 미포함, Claude 이벤트 타입 목록 보완)
- [✅] SKILL.md 파일 작성
- [✅] Claude Code 에이전트에서 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | Sse::new, Event 빌더, mpsc+ReceiverStream+KeepAlive, 라우터등록, Claude API 스트리밍, CORS 6개 | 6/6 PASS (reqwest 0.12 getrandom 환경 주의 명시) |
| 교차 검증 | WebSearch | 7개 클레임, 독립 소스 2개+ | VERIFIED 5 / DISPUTED 2 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| docs.rs/axum SSE | https://docs.rs/axum/latest/axum/response/sse/index.html | ⭐⭐⭐ High | - | 공식 API 문서 |
| docs.rs/tokio-stream | https://docs.rs/tokio-stream/latest/tokio_stream/ | ⭐⭐⭐ High | - | 공식 API 문서 |
| tokio-rs/axum SSE 예제 | https://github.com/tokio-rs/axum/blob/main/examples/sse/src/main.rs | ⭐⭐⭐ High | - | 공식 예제 |
| Anthropic 스트리밍 API | https://docs.anthropic.com/en/api/messages-streaming | ⭐⭐⭐ High | - | SSE 이벤트 타입 확인 |
| MDN EventSource | https://developer.mozilla.org/en-US/docs/Web/API/EventSource | ⭐⭐⭐ High | - | GET 전용 제약 확인 |

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
| 1 | `Sse::new(stream)` Item은 `Result<Event, E>`, 에러 없으면 `Infallible` | VERIFIED | tokio-rs/axum 공식 예제 직접 확인 |
| 2 | Event 빌더 패턴 (data/event/id/retry/comment) | VERIFIED | sse.rs 소스 및 docs.rs 확인 |
| 3 | `keep_alive(KeepAlive::new().interval(...))` 설정 | VERIFIED | 공식 예제 + docs.rs 확인 |
| 4 | EventSource는 GET만 지원, POST는 fetch + ReadableStream | VERIFIED | MDN 및 WHATWG 명세 확인 |
| 5 | `async-stream`의 `stream!` 매크로가 Axum 공식 예제에서 사용됨 | DISPUTED | 공식 예제는 `futures_util::stream::repeat_with()` 사용 → 수정 반영 |
| 6 | Claude 스트리밍 이벤트 타입 3종 (message_start/content_block_delta/message_stop) | DISPUTED | 실제 전체 타입은 8종 이상 (ping, error 등 포함) → 수정 반영 |
| 7 | Axum SSE 모듈 경로: `axum::response::sse` (0.8.x) | VERIFIED | docs.rs/axum 확인 |

### 4-5. DISPUTED 항목 처리

**DISPUTED #5: async-stream 공식 예제 사용 여부**
- 원래 표현: "Axum 공식 예제에서도 사용되지만 별도 크레이트가 필요하다"
- 수정: 공식 예제는 `futures_util::stream::repeat_with()` 사용. `stream!` 매크로는 커뮤니티에서 사용되는 패턴임.
- SKILL.md 반영: 주의 문구 수정

**DISPUTED #6: Claude 스트리밍 이벤트 타입 목록**
- 원래 표현: `message_start`, `content_block_delta`, `message_stop` 3종만 언급
- 수정: 전체 8종 (`message_start`, `content_block_start`, `content_block_delta`, `content_block_stop`, `message_delta`, `message_stop`, `ping`, `error`) + extended thinking 2종 추가
- SKILL.md 반영: `> 주의:` 전체 타입 목록 추가

### 4-6. Claude Code 에이전트 활용 테스트
- [✅] 공식 문서 1순위 소스 확인 (docs.rs/axum, docs.rs/tokio-stream)
- [✅] WebSearch 교차 검증 완료 (7개 클레임)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (axum 0.8.x / tokio-stream 0.1.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)
- [✅] (2026-09-28 4차 재테스트 완료, 2/2 PASS) 선택 보강 반영분(§5 serde_json 파싱 + type 분기 + 미지 이벤트 무시) content test 수행

---

## 5. 테스트 진행 기록

### 2단계 4차 재테스트 (2026-09-28) — 선택 보강 반영분(§5 serde_json 파싱 + type 분기 + 미지 이벤트 무시) 검증

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2개 병렬 호출, rust-backend-developer 미가용 환경으로 대체)
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션·anti-pattern 회피 확인. 직전 "[2026-09-28] 선택 보강 반영"(바로 아래 블록)에서 문자열 `.contains()` 판별을 `serde_json::from_str::<Value>` 파싱 후 `type` 분기 + 미지 이벤트·파싱 실패 무시 패턴으로 교체한 §5 예제 코드를 직접 겨냥한 질문 구성

**Q1. content_block_delta인데 delta.type이 input_json_delta(도구 사용)인 경우 예제 코드는 어떻게 동작하나? 모르는 새 이벤트 타입을 만나면 스트림이 끊기나?**
- ✅ PASS
- 근거: §5 예제 코드 249~299행, 특히 270~282행(`content_block_delta` 분기 내 `text_delta` 조건)과 296~298행(`_ => {}` 와일드카드)
- 상세: `input_json_delta`는 `text_delta` 조건에 안 걸려 아무 처리 없이 다음 청크로 넘어가고, 미지 타입은 바깥 `match`의 `_ => {}`에 걸려 무시되며 `while let Some(chunk) = stream.next().await` 루프가 계속 돌아 스트림이 끊기지 않음을 정확히 답변. 272~274행 주석("input_json_delta·thinking_delta·signature_delta는 필요 시 별도 분기 추가 대상, 현재는 무시")까지 정확히 인용

**Q2. SSE data 라인 판별에 문자열 contains() 대신 JSON 파싱 후 type 분기를 권장하는 이유는? 파싱 실패 라인은 어떻게 처리하나?**
- ✅ PASS
- 근거: §5 코드 주석 262~268행 + 하단 "주의" 문단 312~314행
- 상세: Anthropic 공식 문서의 "새 이벤트 타입이 추가될 수 있으니 우아하게 처리하라"는 버저닝 정책을 근거로 JSON 파싱 후 분기를 권장한다는 점, 파싱 실패 시 `continue`로 해당 라인만 무시하고 스트림 읽기를 계속한다는 점 모두 정확히 인용. "위 예제는 이를 반영해"(정정된 문구, 과거 "위 예제처럼"이었던 불일치 표현)까지 정확히 근거로 제시

### 발견된 gap (2026-09-28 4차 재테스트)

없음 — 2개 질문 모두 §5 예제 코드·주의 문단이 정확히 일치하고 anti-pattern(문자열 contains 판별)도 명확히 회피되어 있음이 확인됨

### 판정 (2026-09-28 4차 재테스트)

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 (content test로 APPROVED 전환 가능)
- 최종 상태: PENDING_TEST → APPROVED (선택 보강 반영분이 실전 질문에 정확히 반영됨을 확인, 텍스트 권고와 예제 코드 간 괴리 gap도 실제로 해소됨)

---

### [2026-09-28] 선택 보강 반영

**무엇을**: §7의 선택 보강 항목("§5 예제 코드를 '문자열 포함 검사' 대신 'JSON 파싱 후 타입 분기 + 미매치 무시' 패턴으로 갱신") 반영.
- "5. Claude API 스트리밍 응답을 SSE로 변환" 섹션 예제의 `data.contains("\"type\":\"message_stop\"")` / `data.contains("\"type\":\"content_block_delta\"")` 문자열 포함 검사를 제거하고, `serde_json::from_str::<Value>(data)`로 먼저 파싱한 뒤 `parsed["type"]`로 `match` 분기하는 방식으로 교체.
- `content_block_delta` 분기에서는 `parsed["delta"]["type"] == "text_delta"`일 때만 텍스트를 추출(도구 사용 `input_json_delta`·`thinking_delta`·`signature_delta`는 필요 시 별도 분기 추가 대상으로 명시하고 현재는 무시).
- `message_stop`·`error` 분기를 명시적으로 추가하고, 그 외 타입(`message_start`/`content_block_start`/`content_block_stop`/`message_delta`/`ping`/향후 신규 타입)과 JSON 파싱 실패 라인은 `_ => {}` / `continue`로 무시하고 스트림을 계속 읽도록 구성 — §5 하단 "주의" 문구가 권장하던 패턴과 예제 코드 간 괴리를 해소.
- §5 하단 "주의" 문구도 "위 예제처럼"(과거 불일치 표현) → "위 예제는 이를 반영해"로 정정.

**근거**: https://platform.claude.com/docs/en/build-with-claude/streaming — "In accordance with the versioning policy, new event types may be added, and your code should handle unknown event types gracefully." 및 `content_block_delta` 이벤트 JSON 형태(`{"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "..."}}`), `error` 이벤트 형태(`{"type": "error", "error": {"type": "...", "message": "..."}}`) 원문 확인. 이벤트 타입 목록·`input_json_delta`/`thinking_delta`/`signature_delta` 사실 자체는 기존 2026-09-28 1차 재검증(§8)에서 이미 원문 대조 완료 — 이번 반영은 그 기존 검증 사실을 코드 패턴으로 구현한 것으로 신규 사실 추가 없음(문서 내부 명확화 성격에 가까우나, 실행 코드 변경이므로 status는 안전하게 PENDING_TEST로 전환).

### 테스트 케이스 1: rust-backend-developer 에이전트 활용 테스트

**테스트 방법:** rust-backend-developer 에이전트에게 sse-streaming 관련 Rust 코드 작성 요청

**발견 및 수정 사항:**
발견된 오류 없음 — 스킬 내용 수정 불필요 (axum SSE API 정확, reqwest 0.12 최신 버전은 Rust 1.85+ 필요(getrandom 0.4.x) — SKILL.md 코드 오류 아님)

**판정:** ✅ PASS

---

### [2026-09-28] 재검증(2차) — axum 0.8.9 소스 재대조 + json_data 보강 + 도메인 이전 반영

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → axum/tokio-stream/tower-http/async-stream crates.io 최신 버전 확인 후 axum 0.8.9 크레이트 소스(`src/response/sse.rs`, `Cargo.toml`) 직접 다운로드 대조, tower-http 0.7.1 소스로 CorsLayer API 대조, Anthropic 공식 스트리밍 문서 재조회

**클레임 대조 결과**:
1. "axum 0.8.x, `Sse::new()`/`Event` 빌더(data/event/id/retry/comment)/`KeepAlive::new().interval().text()`" → VERIFIED (axum 0.8.9 소스 `src/response/sse.rs` 함수 시그니처 직접 확인, crates.io 최신도 0.8.9로 동일)
2. "tokio-stream 0.1.18 / tower-http 0.7.0" → **정정**. crates.io 최신은 tokio-stream 0.1.19 / tower-http 0.7.1 (둘 다 패치 버전 상향, API 변경 없음 — CorsLayer의 `allow_origin`/`allow_methods`/`allow_headers`/`Any` 소스 확인 결과 시그니처 불변)
3. "CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any)" → VERIFIED (tower-http 0.7.1 소스 `src/cors/mod.rs` 직접 확인)
4. "Claude API 스트리밍 이벤트 타입 8종 + thinking_delta/signature_delta" → VERIFIED (공식 문서 재조회, 도구 사용 시 `input_json_delta`도 존재함을 추가 확인 — 목록에 없던 항목이라 SKILL.md에 보강)
5. "async-stream 공식 예제 미포함, `futures_util::stream::repeat_with()` 사용" → 이번 회차에서는 axum 0.8.9 examples 디렉토리 재확인 범위 밖(이전 판정 유지, 변경 근거 없음)
6. Anthropic 공식 문서 URL `docs.anthropic.com/en/api/messages-streaming` → **정정**. `platform.claude.com/docs/en/api/messages-streaming`로 이전됨(301 리다이렉트 확인, 구 URL도 당분간 동작)

**보강(ADD)·축소**: (1) axum 0.8.9 소스에서 확인한 `Event::json_data(T)` 메서드를 JSON 전송 대안으로 §2 표·예제에 추가(기존 `.data(payload.to_string())` 수동 직렬화 방식과 병기). (2) Claude 스트리밍 이벤트 목록에 도구 사용 시 나타나는 `input_json_delta` 추가. (3) 공식 문서의 "미지 이벤트 타입도 우아하게 처리" 버저닝 정책을 근거로, 예제의 문자열 `contains()` 매칭 방식 대신 JSON 파싱 후 타입 분기 + 미매치 시 무시하는 방식을 권장하는 주의문 추가. 축소는 없음(레거시 버전 고정·주의사항·실전 예제 유지).

**실전 질문 재검증**:
- Q1. "axum SSE에서 JSON 페이로드를 보내는 방법은?" → SKILL.md "2. Event 구조체" 근거로 PASS (`.data(payload.to_string())` 또는 `.json_data(T)`)
- Q2. "Claude 스트리밍에서 아직 모르는 이벤트 타입이 오면 어떻게 처리해야 하나?" → SKILL.md "5. Claude API 스트리밍 응답을 SSE로 변환" 새 주의문 근거로 PASS (파싱 후 미매치 타입 무시)

**재검증 최종 판정**: status **PENDING_TEST 전환** (json_data 보강 + 이벤트 목록 보강 + 버전 정정으로 skill-tester 재테스트 필요)

### skill-tester 에이전트 content test (2026-09-28, 독립 재테스트)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose × 2 (rust-backend-developer 미가용 환경으로 대체, 자체 재검증이 아닌 별도 서브에이전트 위임)
**수행 방법**: SKILL.md Read 후 2차 재검증에서 보강된 내용(`json_data()` 메서드, `input_json_delta`, 미지 이벤트 처리 권고)을 겨냥한 질문 2개를 각각 독립 서브에이전트에게 위임(자기 지식 사용 금지, SKILL.md 근거 인용 필수)

**Q1. Axum SSE에서 JSON 페이로드를 전송하는 전용 메서드가 있는가?**
- ✅ PASS
- 근거: SKILL.md §2 "Event 구조체"(`.json_data(T)`, `Result<Event, axum_core::Error>` 반환, json feature 기본 활성화)
- 상세: 수동 직렬화(`.data(payload.to_string())`)와 `json_data()` 두 방식 모두 정확히 인용, 반환 타입·에러 처리 필요성까지 정확히 파악

**Q2. 도구 사용 시 이벤트 타입 및 미지 이벤트 타입 처리 방법은?**
- ✅ PASS
- 근거: SKILL.md §5 하단 "주의" 블록(`input_json_delta`, "파싱 후 미매치 타입 무시" 권고)
- 상세: 전체 이벤트 타입 목록·도구 사용 시 `input_json_delta` 위치·안전한 처리 방식(문자열 포함 검사 지양, JSON 파싱 후 분기) 모두 정확히 인용

**발견된 gap (실질 영향 제한적, 선택 보강)**: §5 예제 코드(249~281줄)는 여전히 `data.contains(...)` 문자열 포함 검사 방식을 사용하며, 주의문이 권장하는 "파싱 후 분기 + 미매치 무시" 패턴의 실제 코드 스니펫이 없음 — 텍스트 권고와 예제 코드 간 괴리. 차단 요인 아님.

agent content test: 2/2 PASS (독립 general-purpose 서브에이전트 수행)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | 2026-09-28 재검증에서 tokio-stream/tower-http 버전 정정 + 공식 문서 URL 이전 반영 (아래 8. 참조) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ (json_data·미지 이벤트 처리 가이드 보강) — 독립 에이전트 재테스트로 확인(2/2 PASS), 예제 코드 패턴 gap은 2026-09-28 선택 보강으로 해소 |
| 에이전트 활용 테스트 | ✅ PASS (rust-backend-developer, 2026-04-09) + 2026-09-28 독립 general-purpose 재테스트 2/2 PASS (보강 내용 반영 확인) + 2026-09-28 4차 재테스트 2/2 PASS (§5 JSON 파싱+type 분기+미지 이벤트 무시 패턴 반영 확인) |
| **최종 판정** | **APPROVED** (2026-09-28 4차 재테스트로 선택 보강 반영분 content test 통과, gap 없음) |

---

## 7. 개선 필요 사항

- [✅] (2026-09-28 반영) §5 예제 코드를 "문자열 포함 검사" 대신 "JSON 파싱 후 타입 분기 + 미매치 무시" 패턴으로 갱신 — `serde_json::from_str::<Value>(data)` 파싱 후 `match parsed["type"].as_str()` 분기, `message_stop`/`error`/`content_block_delta`(text_delta만) 처리 + 나머지 타입·파싱 실패는 무시(근거: §5 "[2026-09-28] 선택 보강 반영")
- [✅] (2026-09-28 4차 재테스트 완료, 2/2 PASS, gap 없음) 선택 보강 반영분(§5 serde_json 파싱+type 분기+미지 이벤트 무시) content test 수행 → §5 "2단계 4차 재테스트" 참조

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-09 | v1 | 최초 작성, rust-backend-developer 활용 테스트 완료 | rust-backend-developer 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-04-17 | v3 | WebSearch 7개 클레임 교차 검증, DISPUTED 2건 수정 (async-stream 공식 예제 미포함, Claude 이벤트 타입 목록 보완) | 메인 대화 오케스트레이션 |
| 2026-06-20 | v4 | 버전 재검증 — axum 0.8.9, tower-http 0.7.0 확인. CorsLayer API 시그니처 변경 없음 (0.7의 Vary 헤더 동작 변경은 코드에 영향 없음). SKILL.md 버전 표기는 0.8.x 범위이므로 변경 없음 | 버전 재검증 작업 |
| 2026-08-12 | v4 | **모델 ID 세대 정렬.** Claude Messages API 스트리밍 예제의 `claude-sonnet-4-6` → `claude-sonnet-5` 교체(1곳). Sonnet 4.6은 legacy로 호출은 되지만 현행 세대는 Sonnet 5. 샘플링 파라미터·`budget_tokens` 사용 없음 — 5 계열 400 이슈 해당 없음. axum/SSE 패턴 본문은 변경 없음. 검증일 2026-06-20 → 2026-08-12. status **APPROVED 유지** | 모델 ID 세대 정렬 |
| 2026-09-28 | v5 | **재검증(2차) — axum 0.8.9/tower-http 0.7.1 소스 직접 대조로 버전 정정 + 보강.** tokio-stream 0.1.18→0.1.19, tower-http 0.7.0→0.7.1(둘 다 패치, API 불변 확인). axum 0.8.9 소스에서 확인한 `Event::json_data()` 메서드를 JSON 전송 대안으로 추가. Claude 스트리밍 이벤트 목록에 `input_json_delta`(도구 사용 시) 추가, 미지 이벤트 타입 우아한 처리 권장 주의문 추가. Anthropic 공식 문서 URL을 `docs.anthropic.com`→`platform.claude.com`(도메인 이전 확인)으로 갱신. status APPROVED → **PENDING_TEST** | 재검증(2차) 작업 |
| 2026-09-28 | v6 | skill-tester 독립 에이전트(general-purpose) content test 재수행 (Q1 json_data() 메서드 / Q2 input_json_delta·미지 이벤트 처리) → 2/2 PASS. 라이브러리 스킬(content test로 충분 카테고리) — status PENDING_TEST → **APPROVED** | skill-tester |
| 2026-09-28 | v7 | **선택 보강 반영** — §5 예제의 문자열 `.contains()` 이벤트 판별을 `serde_json::from_str::<Value>` 파싱 후 `parsed["type"]` match 분기(+ 미매치·파싱 실패 무시) 패턴으로 교체(Anthropic 공식 스트리밍 문서 원문의 "handle unknown event types gracefully" 정책 반영). 코드 변경으로 status APPROVED → **PENDING_TEST**(메인이 skill-tester 재테스트 필요) | 메인 오케스트레이션 (Claude Sonnet 5) |
| 2026-09-28 | v7 | 2단계 4차 재테스트 수행 (Q1 input_json_delta 처리+미지 이벤트 스트림 유지 / Q2 JSON 파싱 권장 이유+파싱 실패 처리) → 2/2 PASS, gap 없음, 선택 보강 반영분 content test 통과 → PENDING_TEST → **APPROVED** 전환 | skill-tester |
