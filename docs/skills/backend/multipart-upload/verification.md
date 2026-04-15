---
skill: multipart-upload
category: backend
version: v1
date: 2026-04-09
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | multipart-upload |
| 스킬 경로 | .claude/skills/multipart-upload/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-08 |
| 검증 방법 | rust-backend-developer 활용 테스트 |
| 버전 기준 | axum 0.8.x |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | next_field/bytes, 파일/텍스트 구분, chunk 스트리밍, MIME 검증, DefaultBodyLimit, IntoResponse 6개 | 6/6 PASS (MultipartError variant 오해 소지 → SKILL.md 주의 문구 수정) |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| docs.rs/axum Multipart | https://docs.rs/axum/latest/axum/extract/struct.Multipart.html | ⭐⭐⭐ High |
| docs.rs/axum DefaultBodyLimit | https://docs.rs/axum/latest/axum/extract/struct.DefaultBodyLimit.html | ⭐⭐⭐ High |

---

## fact-checker 검증 결과

> ⚠️ fact-checker 에이전트를 통한 검증이 실행되지 않았습니다 (수동 작성).

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| `multipart` feature flag 누락 | axum 0.8.x에서 `Multipart`는 비기본 feature. `Cargo.toml`에 `features = ["multipart"]` 추가 → SKILL.md 수정 완료 |
| 버전 표기 수정 | SKILL.md 주의문 "axum 0.7.x" → "axum 0.8.x"로 수정 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (docs.rs/axum)
- [❌] fact-checker로 핵심 클레임 검증 ← 미실행 (수동 작성)
- [✅] feature flag 누락 수정 반영 (multipart feature 명시)
- [✅] 버전 명시 (axum 0.8.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. `MultipartError`가 단일 구조체(공개 variant 없음)임을 SKILL.md에 주의 문구 추가. 코드 동작 정확.
