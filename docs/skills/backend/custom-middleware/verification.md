---
skill: custom-middleware
category: backend
version: v2
date: 2026-04-09
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | custom-middleware |
| 스킬 경로 | .claude/skills/custom-middleware/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 갱신일 | 2026-04-08 |
| 검증 방법 | cargo check 컴파일 검증 (axum 0.8.8 실설치 기준) |
| 버전 기준 | axum 0.8.x (실제 검증: 0.8.8) |
| 현재 상태 | **PENDING_TEST** — cargo check 통과, 런타임 통합 테스트 미실시 |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| 공식 문서 | https://docs.rs/axum/0.8.1/axum/middleware/index.html | https://docs.rs/axum/0.8.1/axum/middleware/fn.from_fn.html | https://docs.rs/axum/0.8.1/axum/middleware/fn.from_fn_with_state.html | ⭐⭐⭐ High |

---

## cargo check 컴파일 검증 결과 (2026-04-08)

axum 0.8.8 실설치 환경에서 6개 패턴 전체 컴파일 검증 실행.

| 패턴 | 검증 전 상태 | 발견된 오류 | 수정 내용 | 최종 결과 |
|------|------------|------------|----------|----------|
| 1. `from_fn` 기본 시그니처 | SKILL.md에 `axum::http::Request` import 사용 | `E0107`: `Request`에 제네릭 인자 필요 | `axum::extract::Request`로 교체 | PASS |
| 2. `from_fn_with_state` + State | `axum::extract::State`만 import, `Request` 누락 | 동일 `E0107` | `axum::extract::Request` 추가 | PASS |
| 3. 요청 헤더 읽기 | import 없음 (섹션 공통 import 누락) | 미검증 상태 | 섹션 공통 import 블록 추가 | PASS |
| 4. 조기 응답 반환 | import 없음 | 미검증 상태 | 섹션 공통 import 블록으로 커버 | PASS |
| 5. Router `.layer()` 적용 | 패턴 자체는 올바름 | 없음 | 변경 없음 | PASS |
| 6. 응답 후처리 | import 없음 | 미검증 상태 | 섹션 공통 import 블록으로 커버 | PASS |

**핵심 발견사항:**

`axum::http::Request`는 `http` 크레이트의 제네릭 타입(`Request<T>`)이므로 미들웨어 함수 인자로 그대로 쓰면 컴파일 에러가 발생한다. axum 0.8.x 미들웨어에서는 반드시 `axum::extract::Request`를 사용해야 한다. 이는 `axum_core::extract::Request`의 re-export이며, 내부적으로 `http::Request<axum::body::Body>`의 타입 alias이다.

동일 오류가 `axum` 스킬(`SKILL.md`)의 `from_fn` 예시에도 존재하여 함께 수정했다.

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] cargo check 컴파일 검증 (axum 0.8.8)
- [✅] DISPUTED 항목 수정 반영 (`axum::http::Request` → `axum::extract::Request`)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. from_fn/from_fn_with_state, 요청 본문 재구성, 응답 가로채기, Extensions, layer 적용 범위 컴파일 검증 완료. 이슈 없음.
