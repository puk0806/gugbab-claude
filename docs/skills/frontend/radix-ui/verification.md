---
skill: radix-ui
category: frontend
version: v1
date: 2026-04-17
status: APPROVED
---

# radix-ui 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ WebSearch 교차 검증 ✅ (6개 클레임, VERIFIED 6, DISPUTED 0)
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증)
  ├─ frontend-developer 에이전트 테스트 수행
  └─ 테스트 PASS → APPROVED
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | radix-ui |
| 스킬 경로 | .claude/skills/frontend/radix-ui/SKILL.md |
| 최초 작성일 | 2026-04-17 |
| 검증 방법 | WebSearch 교차 검증 (메인 대화 오케스트레이션) |
| 버전 기준 | radix-ui v1.4.3 (통합 패키지) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (radix-ui.com, npm registry)
- [✅] 최신 버전 기준 내용 확인 (radix-ui v1.4.3)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성 (TSX + SCSS 기준)
- [✅] 흔한 실수 패턴 정리
- [✅] WebSearch 교차 검증 (6개 클레임, VERIFIED 6, DISPUTED 0)
- [✅] SKILL.md 파일 작성
- [✅] 실제 활용 테스트 (2026-04-20, 3개 테스트 PASS)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 교차 검증 | WebSearch | 6개 클레임, 독립 소스 2개+ | VERIFIED 6 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Radix UI 공식 문서 | https://www.radix-ui.com/primitives/docs/overview/introduction | ⭐⭐⭐ High | - | 공식 레퍼런스 |
| Radix Composition 가이드 | https://www.radix-ui.com/primitives/docs/guides/composition | ⭐⭐⭐ High | - | asChild/Slot 공식 가이드 |
| Radix Styling 가이드 | https://www.radix-ui.com/primitives/docs/guides/styling | ⭐⭐⭐ High | - | data-attribute 스타일링 |
| radix-ui npm registry | https://www.npmjs.com/package/radix-ui | ⭐⭐⭐ High | - | 최신 버전 v1.4.3 확인 |
| Radix GitHub | https://github.com/radix-ui/primitives | ⭐⭐⭐ High | - | 공식 소스 |
| Radix Slot 공식 문서 | https://www.radix-ui.com/primitives/docs/utilities/slot | ⭐⭐⭐ High | - | Slot 유틸리티 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (radix-ui v1.4.3)
- [✅] deprecated된 패턴을 권장하지 않음 (개별 패키지 → 통합 패키지 마이그레이션 안내)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (asChild/Slot, Compound Component, data-attribute 등)
- [✅] 코드 예시 포함 (Dialog, Select, Tooltip, SCSS 선택자)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함 (7가지)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (SCSS + TSX 통합 예시)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. WebSearch 교차 검증 결과

| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | `radix-ui` 통합 패키지 최신 버전 v1.4.3 | VERIFIED | npm registry 직접 확인 (last published 8 months ago) |
| 2 | `npm install radix-ui` 단일 명령으로 설치 | VERIFIED | npm registry + Radix 공식 getting started 확인 |
| 3 | `asChild`는 자식 요소에 Radix props/이벤트/ARIA를 merge, 내부적으로 Slot 사용 | VERIFIED | Radix 공식 Composition 가이드 + Slot 문서 확인 |
| 4 | asChild 자식에 커스텀 컴포넌트 사용 시 React 18에서 forwardRef 필수 | VERIFIED | Radix 공식 문서 명시 "If your component doesn't accept a ref, then it will break" |
| 5 | React 19에서는 ref가 일반 prop으로 변경, forwardRef 불필요 | VERIFIED | Radix 공식 문서에 React 19 대응 변경 명시 |
| 6 | Radix Primitives는 CSS를 포함하지 않는 headless 컴포넌트 | VERIFIED | 공식 Overview "zero styling out of the box" 확인 |

### 4-5. DISPUTED 항목 처리

- 없음 (전 클레임 VERIFIED)

---

## 5. 테스트 진행 기록

> APPROVED — 2026-04-20 테스트 완료

### 테스트 1: asChild 커스텀 컴포넌트 문제 디버깅
- **질문**: "asChild로 커스텀 컴포넌트를 전달했는데 동작하지 않는다. 원인은?"
- **SKILL.md 기반 답변**: asChild 사용 규칙 섹션에서 React 18에서는 forwardRef 필수, Fragment 불가(단일 React 요소만 허용) 안내. React 19에서는 ref가 일반 prop이므로 forwardRef 불필요.
- **WebSearch 검증**: Radix 공식 Composition 가이드에서 forwardRef 필수 확인, React 19에서 forwardRef deprecated 확인. VERIFIED.
- **결과**: PASS

### 테스트 2: Dialog 열기/닫기 애니메이션 구현
- **질문**: "Radix Dialog의 열기/닫기에 애니메이션을 넣으려면?"
- **SKILL.md 기반 답변**: data-attribute 기반 스타일링 섹션에서 `&[data-state='open']` / `&[data-state='closed']` CSS 선택자 + keyframe 애니메이션 패턴 제공. 흔한 실수 #5에서 CSS class toggle 대신 data-state 사용 권장.
- **WebSearch 검증**: Radix 공식 Styling 가이드에서 data-state attribute 기반 스타일링 확인. VERIFIED.
- **결과**: PASS

### 테스트 3: 버전 및 headless 특성 검증
- **질문**: "radix-ui 통합 패키지 최신 버전과 headless 특성이 정확한가?"
- **WebSearch 검증**: npm에서 radix-ui v1.4.3 확인. 공식 문서에서 "unstyled, zero styling out of the box" 확인. VERIFIED.
- **결과**: PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3개 테스트 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- 현재 없음

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-17 | v1 | 최초 작성, WebSearch 6개 클레임 교차 검증 (전항목 VERIFIED) | 메인 대화 오케스트레이션 |
| 2026-04-20 | v1 | PENDING_TEST → APPROVED 전환. WebSearch로 3개 핵심 클레임 재검증(통합 패키지 v1.4.3, asChild/forwardRef/React 19, headless data-state), 테스트 질문 3개 수행 전체 PASS | 수동 검증 |
