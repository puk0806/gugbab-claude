---
skill: sse-streaming
category: backend
version: v1
date: 2026-04-17
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
| 재검증일 | 2026-04-08 |
| 검증 방법 | rust-backend-developer 활용 테스트 |
| 버전 기준 | axum 0.8.8 / tokio-stream 0.1.18 |

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

---

## 5. 테스트 진행 기록

### 테스트 케이스 1: rust-backend-developer 에이전트 활용 테스트

**테스트 방법:** rust-backend-developer 에이전트에게 sse-streaming 관련 Rust 코드 작성 요청

**발견 및 수정 사항:**
발견된 오류 없음 — 스킬 내용 수정 불필요 (axum SSE API 정확, reqwest 0.12 최신 버전은 Rust 1.85+ 필요(getrandom 0.4.x) — SKILL.md 코드 오류 아님)

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
| 2026-04-17 | v3 | WebSearch 7개 클레임 교차 검증, DISPUTED 2건 수정 (async-stream 공식 예제 미포함, Claude 이벤트 타입 목록 보완) | 메인 대화 오케스트레이션 |
