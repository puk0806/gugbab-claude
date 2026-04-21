---
skill: design-token-scss
category: frontend
version: v1
date: 2026-04-17
status: APPROVED
---

# design-token-scss 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ WebSearch 교차 검증 ✅ (6개 클레임, VERIFIED 5, DISPUTED 1)
  ├─ DISPUTED 1건 수정 반영 (Figma Variables API — Professional → Enterprise plan)
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증)
  ├─ frontend-developer 또는 frontend-architect 에이전트 테스트 수행
  └─ 테스트 PASS → APPROVED
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | design-token-scss |
| 스킬 경로 | .claude/skills/frontend/design-token-scss/SKILL.md |
| 최초 작성일 | 2026-04-17 |
| 검증 방법 | WebSearch 교차 검증 (메인 대화 오케스트레이션) |
| 버전 기준 | Style Dictionary v4.x / DTCG 2025.10 stable 스펙 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (styledictionary.com, designtokens.org, sass-lang.com)
- [✅] 최신 버전 기준 내용 확인 (Style Dictionary v4, DTCG 2025.10 stable)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성 (SCSS + JS 기준)
- [✅] 흔한 실수 패턴 정리
- [✅] WebSearch 교차 검증 (6개 클레임, VERIFIED 5, DISPUTED 1)
- [✅] DISPUTED 1건 수정 반영 (Figma Variables API 플랜 요건)
- [✅] SKILL.md 파일 작성
- [✅] 실제 활용 테스트 (2026-04-20, 3개 테스트 PASS)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 교차 검증 | WebSearch | 6개 클레임, 독립 소스 2개+ | VERIFIED 5 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Style Dictionary 공식 문서 | https://styledictionary.com/ | ⭐⭐⭐ High | - | API 레퍼런스 |
| Style Dictionary v4 Migration | https://styledictionary.com/versions/v4/migration/ | ⭐⭐⭐ High | - | v3→v4 변경점 |
| DTCG 스펙 (W3C Community Group) | https://www.designtokens.org/tr/drafts/format/ | ⭐⭐⭐ High | 2025.10 | 첫 stable 릴리즈 |
| Sass 공식 문서 (interpolation) | https://sass-lang.com/documentation/interpolation/ | ⭐⭐⭐ High | - | #{} 필요 이유 |
| Sass Breaking Change: CSS Variables | https://sass-lang.com/documentation/breaking-changes/css-vars/ | ⭐⭐⭐ High | - | CSS 변수 문법 변경 이력 |
| Figma Forum (Variables API plan) | https://forum.figma.com/suggest-a-feature-11/why-s-the-variables-api-only-available-on-enterprise-plans-36426 | ⭐⭐ Medium | - | Enterprise 전용 확인 |
| MDN: Using CSS custom properties | https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties | ⭐⭐⭐ High | - | media query 제한 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Style Dictionary v4, DTCG 2025.10)
- [✅] deprecated된 패턴을 권장하지 않음 (v3 API를 흔한 실수로 분류)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. WebSearch 교차 검증 결과

| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | Style Dictionary v4는 `new StyleDictionary(config)` 클래스 생성자 방식 사용 | VERIFIED | styledictionary.com migration 가이드 직접 확인 |
| 2 | v4에서 커스텀 transform은 `hooks.transforms` 객체에 정의 | VERIFIED | styledictionary.com hooks 레퍼런스 확인 |
| 3 | DTCG 포맷은 `$value`, `$type` 키 사용 (W3C 2025.10 stable 기준) | VERIFIED | designtokens.org 공식 스펙 및 W3C Community Group 발표 확인 |
| 4 | Figma Variables REST API는 Professional plan 이상에서 사용 가능 | DISPUTED | 실제로는 Enterprise plan 전용. Figma 공식 포럼 다수 확인 → 수정 반영 |
| 5 | CSS Custom Properties는 미디어 쿼리 조건에 사용 불가 | VERIFIED | MDN 공식 문서 + CSS-Tricks 확인 |
| 6 | SCSS 변수를 CSS Custom Properties에 사용할 때 `#{}` 보간 필수 | VERIFIED | sass-lang.com 공식 문서 Breaking Change 항목 확인 |

### 4-5. DISPUTED 항목 처리

**DISPUTED #4: Figma Variables REST API 플랜 요건**
- 원래 표현: "Figma Variables REST API는 Professional plan 이상에서 사용 가능하다"
- 수정: "Enterprise plan에서만 사용 가능하다. Professional 이하 plan에서는 접근 불가"
- 근거: Figma 공식 포럼 다수 스레드에서 Enterprise 전용 확인됨
- SKILL.md 반영: `> 주의:` 수정 완료

---

## 5. 테스트 진행 기록

> APPROVED — 2026-04-20 테스트 완료

### 테스트 1: 미디어 쿼리에 CSS 변수 사용 문제
- **질문**: "`@media (min-width: var(--breakpoint-md))` 형태로 CSS 변수를 미디어 쿼리에 사용했는데 동작하지 않는다. 왜?"
- **SKILL.md 기반 답변**: 섹션 4 및 실수 패턴 #2에서 CSS Custom Properties는 미디어 쿼리 조건에 사용 불가함을 명시. SCSS 변수 또는 리터럴 사용 안내.
- **WebSearch 검증**: MDN 공식 문서에서 "var() can only be used for property values, not for selectors or anything else" 확인. VERIFIED.
- **결과**: PASS

### 테스트 2: Style Dictionary v4 SCSS 변수 출력 설정
- **질문**: "Style Dictionary v4로 디자인 토큰 JSON에서 SCSS 변수 파일을 생성하려면 어떻게 설정하나?"
- **SKILL.md 기반 답변**: 섹션 3에서 `new StyleDictionary(config)` + `hooks.transforms` + `scss/variables` 포맷의 완전한 sd.config.mjs 예시 제공. v4 API와 정확히 일치.
- **WebSearch 검증**: styledictionary.com migration 가이드에서 v4 hooks API, new StyleDictionary() 생성자 방식 확인. VERIFIED.
- **결과**: PASS

### 테스트 3: DTCG 스펙 및 버전 최신성 검증
- **질문**: "DTCG 디자인 토큰 스펙 $value/$type 포맷이 현재 표준인가?"
- **WebSearch 검증**: W3C DTCG 2025.10 stable 스펙에서 $value, $type 키 사용 확인. VERIFIED.
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
| 2026-04-17 | v1 | 최초 작성, WebSearch 6개 클레임 교차 검증, DISPUTED 1건 수정 (Figma Variables API Enterprise 전용) | 메인 대화 오케스트레이션 |
| 2026-04-20 | v1 | PENDING_TEST → APPROVED 전환. WebSearch로 3개 핵심 클레임 재검증(SD v4 hooks API, DTCG $value/$type, CSS 변수 미디어 쿼리 제한), 테스트 질문 3개 수행 전체 PASS | 수동 검증 |
