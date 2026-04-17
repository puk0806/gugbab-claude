---
skill: axum
category: backend
version: v1
date: 2026-04-07
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
| 재검증일 | 2026-04-08 |
| 검증 방법 | fact-checker 에이전트 (재검증) + rust-backend-developer 활용 테스트 |
| 버전 기준 | axum 0.8.x (0.8.8 실제 resolve 확인) |

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
| 에이전트 활용 테스트 | ✅ PASS (rust-backend-developer) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- 현재 없음

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-07 | v1 | 최초 작성, fact-checker 검증 및 rust-backend-developer 활용 테스트 완료 | rust-backend-developer 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
