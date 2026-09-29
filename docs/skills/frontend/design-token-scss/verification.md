---
skill: design-token-scss
category: frontend
version: v1
date: 2026-09-26
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
| 검증일 | 2026-09-26 (재검증) |
| 검증 방법 | WebSearch 교차 검증 (메인 대화 오케스트레이션) |
| 버전 기준 | Style Dictionary v5.5.x(2026-09-26 최신) / v4 API 하위 호환 / DTCG 2025.10 stable 스펙 |

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

### 재검증 (2026-09-26)

**수행일**: 2026-09-26
**수행 방법**: SKILL.md + references/REFERENCE.md Read 후 핵심 클레임 3개 WebSearch/WebFetch 재검증 + 실전 질문 2개 자체 답변 확인

클레임 재검증:
| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | Style Dictionary 최신 버전은 v4.x | DISPUTED | 실제 최신은 v5.5.x(npm). `new StyleDictionary(config)`/`hooks.transforms`/`scss·css` 포맷명은 v5에서도 호환(공식 v5 마이그레이션 가이드에 breaking으로 명시 안 됨). v5 실제 변경점: Node 22+ 요구, 토큰 참조 leaf-only 제한, 참조 구분자 커스터마이징 제거 → SKILL.md 섹션 3에 `> 주의:` 추가 |
| 2 | Figma Variables REST API는 Enterprise plan 전용 | VERIFIED | Figma 공식 포럼·developers.figma.com 재확인, 변경 없음 |
| 3 | DTCG 스펙은 2025.10 첫 stable, `$value`/`$type` 키 사용 | VERIFIED | W3C DTCG 공식 발표(2025-10-28) 재확인, 변경 없음 |

Q1. "Style Dictionary로 SCSS 변수 파일 만들 때 지금도 `new StyleDictionary(config)` 방식을 써야 하나?" — SKILL.md 섹션 3 답변: 그렇다, v4/v5 공통 API(신규 프로젝트는 v5 설치 권장). PASS
Q2. "Figma Variables를 REST API로 뽑고 싶은데 Professional 플랜인데 가능한가?" — SKILL.md 섹션 2 답변: 불가, Enterprise 전용. PASS

agent content test: 2/2 PASS. 단, 클레임 1이 DISPUTED(권장 버전 변경)로 판정되어 status는 PENDING_TEST로 유지한다.

---

### 2단계 재테스트 (2026-09-28)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2개 병렬 호출)
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션·anti-pattern 회피 확인. 2026-09-26 재검증에서 정정된 부분(Style Dictionary v4→v5.5.x, Node 22 요구, leaf-only 참조 제한, 구분자 커스터마이징 제거)을 겨냥한 질문 포함

**Q1. "신규 프로젝트 v4 vs v5 선택 + v5 전환 시 주의사항 + Node 버전"**
- ✅ PASS
- 근거: SKILL.md "3. Style Dictionary v4 설정" 도입부 주석(102행)
- 상세: v5 설치 권장, Node 22.0.0(LTS) 요구, leaf-only 토큰 참조 제한, 참조 구분자 커스터마이징 제거 3가지 변경점이 모두 정확히 답변됨.

**Q2. "미디어 쿼리에 CSS Custom Property 사용 불가 이유+해결 + Figma Professional 플랜 REST API 가능 여부"**
- ✅ PASS
- 근거: SKILL.md "4. SCSS 변수 vs CSS Custom Properties" 표·핵심 규칙(210-254행) + "2. Figma 토큰 추출" 방법 B(74-96행, 특히 84행)
- 상세: 미디어 쿼리는 SCSS 변수만 가능하다는 규칙과 하이브리드 해결 패턴, Figma Variables REST API는 Enterprise 전용(Professional 불가)이라는 명시적 경고 모두 정확히 답변됨. 테스트 에이전트가 §2 "선택 기준" 표의 "비용: Professional plan 이상" 문구가 84행의 명시적 경고("Enterprise에서만 가능")와 표현상 어긋난다는 경미한 불일치를 발견함(핵심 답변에는 지장 없음, 84행이 더 구체적이라 정답 도출 가능했음).

### 발견된 gap (2026-09-28)

- **(경미, 선택 보강)** §2 "선택 기준" 표의 "비용" 행이 "Professional plan 이상"으로 되어 있어 84행의 "Enterprise 전용" 경고와 표현상 어긋남. 표를 "Enterprise 이상"으로 정정하면 더 명확함 — 답변 자체에는 지장 없었으므로 차단 요인 아님.

### 판정 (2026-09-28)

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리/패턴 사용법 스킬 — content test로 충분 (실사용 필수 카테고리 아님)
- 최종 상태: APPROVED

---

### [2026-09-28] SKILL.md §2 표 정정 + 재테스트 — "Professional plan 이상" → "Enterprise plan 전용"

**수행일**: 2026-09-28
**수행자**: 메인 대화(SKILL.md §2 "선택 기준" 표 정정) → skill-tester → general-purpose
**수행 방법**: 위 2026-09-28 재테스트에서 발견한 §2 표·84행 주의문 간 경미한 표현 불일치를 메인 대화가 SKILL.md Edit으로 정정("비용" 행 "Professional plan 이상" → "Enterprise plan 전용 (REST API — 아래 주의 참조)"). 정정 직후 표·주의문 정합성을 직접 겨냥한 실전 질문 1개로 재테스트

**Q1. Figma Professional 플랜에서 Variables REST API로 토큰 추출 가능 여부 + §2 표·84행 주의문 정합성**
- ✅ PASS
- 근거: SKILL.md §2 "방법 B" 84행 주의문 + "선택 기준" 표 96행(비용 행)
- 상세: "Enterprise plan에서만 사용 가능, Professional 이하 plan에서는 접근 불가"를 정확히 인용해 Professional 플랜으로는 불가하다고 정확히 답변. 표(96행)와 본문 주의문(84행)이 "Enterprise plan 전용"으로 서로 일치함을 정확히 확인 — 이전 불일치("Professional plan 이상")가 해소되었음을 간접 검증. 대안(방법 A: Tokens Studio, Professional 플랜에서도 사용 가능)까지 정확히 제시

### 발견된 gap (2026-09-28, 정정 후)

- 없음 — 표·주의문 정합성 확인 완료. 단, "Enterprise만 가능"·"Professional 이하 불가" 두 표현이 한 문장에 섞여 있어 처음 읽을 때 재확인이 필요하다는 경미한 가독성 의견(차단 요인 아님)

### 판정 (2026-09-28, 정정 후)

- agent content test: 1/1 PASS
- verification-policy 분류: 라이브러리/패턴 사용법 스킬 — content test로 충분 (변경 없음)
- 최종 상태: **APPROVED 유지**

---

> 이전 기록 (2026-04-20 최초 APPROVED 테스트)

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
| 에이전트 활용 테스트 | ✅ (2026-04-20 3개 PASS + 2026-09-26 재검증 2개 PASS + 2026-09-28 재테스트 2개 PASS + 2026-09-28 §2 표 정정 후 재테스트 1개 PASS, 누적 8/8) |
| **최종 판정** | **APPROVED** (2026-09-28 §2 "선택 기준" 표를 "Enterprise plan 전용"으로 정정 후 표·주의문 정합성 재테스트 1/1 PASS — APPROVED 유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-04-20 완료, 3/3 PASS; 2026-09-28 재테스트 완료, 2/2 PASS; 2026-09-28 §2 표 정정 후 재테스트 완료, 1/1 PASS)
- [✅] (2026-09-28 완료) §2 "선택 기준" 표의 Figma Variables API "비용: Professional plan 이상" 문구를 "Enterprise plan 전용"으로 정정 — 84행 주의문과 일치 확인

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-17 | v1 | 최초 작성, WebSearch 6개 클레임 교차 검증, DISPUTED 1건 수정 (Figma Variables API Enterprise 전용) | 메인 대화 오케스트레이션 |
| 2026-04-20 | v1 | PENDING_TEST → APPROVED 전환. WebSearch로 3개 핵심 클레임 재검증(SD v4 hooks API, DTCG $value/$type, CSS 변수 미디어 쿼리 제한), 테스트 질문 3개 수행 전체 PASS | 수동 검증 |
| 2026-09-26 | v1 | 재검증. Style Dictionary 최신 버전 v4→v5.5.x 확인(핵심 API는 호환) → SKILL.md에 v5 주의사항 주석 추가, description·검증일 갱신. Figma Enterprise·DTCG 2025.10 클레임은 변경 없음 확인. 권장 버전 변경으로 APPROVED → PENDING_TEST | 수동 검증 |
| 2026-09-28 | v1 | 2단계 재테스트 수행 (Q1 SD v5 전환 주의사항+Node 버전 / Q2 미디어쿼리 CSS 변수 제약+Figma Enterprise 제약) → 2/2 PASS, PENDING_TEST → APPROVED 전환. 부수적으로 §2 표 문구 경미한 불일치 발견(선택 보강) | skill-tester |
| 2026-09-28 | v1 | §2 "선택 기준" 표 "비용" 행을 "Professional plan 이상" → "Enterprise plan 전용"으로 정정(84행 주의문과 일치) 후 표·주의문 정합성 재테스트 수행 (Q1) → 1/1 PASS, APPROVED 유지 | 메인 대화 → skill-tester |
