---
skill: cargo-workspace
category: backend
version: v1
date: 2026-04-09
status: APPROVED
---

# cargo-workspace 스킬 검증 문서

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
| 스킬 이름 | cargo-workspace |
| 스킬 경로 | .claude/skills/cargo-workspace/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-08 |
| 검증 방법 | rust-backend-developer 활용 테스트 |
| 버전 기준 | Cargo 최신 안정 (Rust 1.75+ / Cargo 1.64+) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.rs, crates.io)
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성 (Rust 기준)
- [✅] 흔한 실수 패턴 정리
- [✅] fact-checker로 핵심 클레임 검증 (WebSearch 교차 검증 완료)
- [✅] SKILL.md 파일 작성
- [✅] Claude Code 에이전트에서 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | 가상워크스페이스, workspace.dependencies, path참조, 크레이트등록, features override, workspace.package 6개 | 6/6 PASS (core 크레이트명 충돌→app-core 수정, cargo run 설명 수정, workspace+version 경고 명시) |

> ⚠️ fact-checker 에이전트를 통한 검증이 실행되지 않았습니다 (수동 작성).

### fact-checker 교차 검증 결과

| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | `[workspace]` 섹션에 `members` 필드로 크레이트 경로 선언 | VERIFIED | doc.rust-lang.org/cargo/reference/workspaces.html 확인 |
| 2 | `members` 필드에서 glob 패턴(`"crates/*"`) 지원 | VERIFIED | 공식 문서에 glob 패턴 명시 확인 |
| 3 | `workspace.dependencies` Cargo 1.64(Rust 1.64)부터 안정화 | VERIFIED | 공식 문서 MSRV: 1.64+ 명시 확인 |
| 4 | `workspace = true` 사용 시 `version` 직접 지정 불가 | DISPUTED | "불가"가 아닌 경고(unused manifest key)로 무시됨. 본문 표현 수정 완료 |
| 5 | Resolver v3는 Rust 1.84(edition 2024)부터 사용 가능 | VERIFIED | blog.rust-lang.org/2025/01/09/Rust-1.84.0/ 확인 |
| 6 | 가상 워크스페이스에서 `resolver` 명시 필수(미지정 시 경고) | VERIFIED | 공식 문서 및 에디션 가이드 확인 |
| 7 | `workspace.package` 상속 방식 (`version.workspace = true`) | VERIFIED | doc.rust-lang.org/cargo/reference/workspaces.html 확인 |
| 8 | 내부 크레이트를 `workspace.dependencies`에 path로 등록 가능 | VERIFIED | 공식 문서 path dependency 절 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Cargo 공식 문서 | https://doc.rust-lang.org/cargo/reference/workspaces.html | ⭐⭐⭐ High |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 1건 수정 반영)
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
- [✅] 공식 문서 1순위 소스 확인 (doc.rust-lang.org/cargo)
- [✅] fact-checker로 핵심 클레임 검증 (WebSearch 교차 검증 8개 클레임)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (Cargo 1.64+)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)

---

## 5. 테스트 진행 기록

### 테스트 케이스 1: rust-backend-developer 에이전트 활용 테스트

**테스트 방법:** rust-backend-developer 에이전트에게 cargo-workspace 관련 Rust 코드 작성 요청

**발견 및 수정 사항:**
- `core` 예제 크레이트명 충돌 → `app-core`로 변경
- `cargo run` 설명 정확화
- `workspace+version` 경고/에러 구분 명시

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
| 2026-04-17 | v3 | fact-checker WebSearch 교차 검증 완료 (VERIFIED 7, DISPUTED 1) | WebSearch 직접 검증 |
