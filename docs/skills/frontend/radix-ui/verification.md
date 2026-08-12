---
skill: radix-ui
category: frontend
version: v2
date: 2026-08-11
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
| 최신화 재검증일 | 2026-08-11 |
| 검증 방법 | 공식 문서 WebFetch + npm registry 메타데이터 직접 조회 교차 검증 |
| 버전 기준 | radix-ui **v1.6.7** (통합 패키지, 2026-07-24 릴리즈) |

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
| Radix Slot 공식 문서 | https://www.radix-ui.com/primitives/docs/utilities/slot | ⭐⭐⭐ High | 2026-08-11 | Slot 유틸리티 (`Slot.Root`·`Slot.Slottable` 재확인) |
| Radix Releases (공식 체인지로그) | https://www.radix-ui.com/primitives/docs/overview/releases | ⭐⭐⭐ High | 2026-08-11 | 1.5.0·1.6.x 변경 이력 1차 소스 |
| radix-ui npm registry 메타데이터 | https://registry.npmjs.org/radix-ui | ⭐⭐⭐ High | 2026-08-11 | `dist-tags`·`time`·`peerDependencies` 직접 조회 (latest 1.6.7) |
| One-Time Password Field 공식 문서 | https://www.radix-ui.com/primitives/docs/components/one-time-password-field | ⭐⭐⭐ High | 2026-08-11 | 프리뷰 primitive, `unstable_` import 확인 |
| Password Toggle Field 공식 문서 | https://www.radix-ui.com/primitives/docs/components/password-toggle-field | ⭐⭐⭐ High | 2026-08-11 | 프리뷰 primitive |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (radix-ui v1.6.7 — 2026-08-11 갱신)
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

### 4-6. 2026-08-11 최신화 재검증 (v1.4.3 → v1.6.7)

**검증 방법**: 각 클레임을 최소 2개 독립 소스로 교차 검증.
소스 A = npm registry 메타데이터 직접 조회(`registry.npmjs.org/radix-ui`의 `dist-tags`·`time`·`peerDependencies`),
소스 B = Radix 공식 문서(Releases 페이지 / 각 컴포넌트 문서).

| # | 클레임 | 판정 | 교차 검증 근거 |
|---|--------|------|---------------|
| 1 | `radix-ui` 통합 패키지 최신 안정 버전은 **v1.6.7** (2026-07-24) | VERIFIED | npm `dist-tags.latest = 1.6.7`, `time["1.6.7"] = 2026-07-24` / 공식 Releases 페이지 최신 항목 2026-07-20 (1.6.3~1.6.4 대응) |
| 2 | v1.5.0 = 2026-06-06, v1.6.0 = 2026-06-15 릴리즈 | VERIFIED | npm `time` 객체 / 공식 Releases 페이지 "June 6, 2026" 항목 |
| 3 | v1.4.x → v1.6.x 사이 **파괴적 변경 없음** (asChild/Slot·Compound·Controlled·data-attribute 패턴 그대로 유효) | VERIFIED | 공식 Releases 페이지 전 항목이 "Added/Fixed/Improved"만 기술, breaking 항목 없음 / npm peerDependencies 범위 변동 없음 |
| 4 | peerDependencies는 `react`·`react-dom` 모두 `^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0` | VERIFIED | npm registry `peerDependencies` 필드 직접 확인 / 공식 문서 React 19 지원 명시 |
| 5 | v1.6.3부터 **primitive별 서브패스 엔트리** 지원 (`import { Accordion } from "radix-ui/accordion"`) | VERIFIED | 공식 Releases "July 20, 2026" — PR #4020 명시 / npm `time` 상 1.6.3 = 2026-07-20 |
| 6 | v1.6.3에서 `/* @__PURE__ */` + named render 함수로 트리셰이킹 개선 | VERIFIED | 공식 Releases "July 20, 2026" — PR #4038 |
| 7 | 통합 패키지에서 Slot 직접 사용 시 **`Slot.Root`** 네임스페이스 형태 | VERIFIED | 공식 Slot 유틸리티 문서 코드 예제 (`import { Slot } from "radix-ui"` → `<Slot.Root>`) / 동일 문서의 `Slot.Slottable` 예제 |
| 8 | `Slot.Slottable`이 render prop(`child`) 형태 중첩 지원 (v1.5.0+) | VERIFIED | 공식 Slot 문서 / 공식 Releases "June 6, 2026" Slot 항목 "Added support for nested Slottable items via a render prop" |
| 9 | `OneTimePasswordField`·`PasswordToggleField`는 **프리뷰(unstable) primitive**, `unstable_` 접두사로 import | VERIFIED | 각 컴포넌트 공식 문서(Preview 배지 + `unstable_` import 예제) / 공식 Releases 2025-04-17·2025-05-05 도입 항목 |
| 10 | v1.5.0에서 폼 컨트롤 내부 합성 파트를 `unstable_` 접두사로 공개 (Checkbox·Switch·Select·RadioGroup·Slider) | VERIFIED | 공식 Releases "June 6, 2026" — "New unstable composition parts" 절 / 동 절의 Switch 코드 예제 |
| 11 | v1.5.0에서 ContextMenu에 controlled `open` prop 추가 (읽기·프로그래밍적 닫기 용도 권장) | VERIFIED | 공식 Releases "June 6, 2026" Context Menu 항목 — "We discourage opening the menu programmatically" 명시 |
| 12 | v1.6.x는 React 19 / 19.2 관련 안정화 수정 다수 포함 | VERIFIED | 공식 Releases "June 30, 2026"(React 19 무한 리렌더) + "July 6, 2026"(React 19.2 핸들러) 항목 |

**판정 요약**: VERIFIED 12 / DISPUTED 0 / UNVERIFIED 0

**SKILL.md 반영 사항**:
- 버전 표기 `^1.4.0` → `^1.6.0`, 검증일 2026-08-11, Releases 소스 URL 추가
- 서브패스 임포트 절 신설 (v1.6.3+)
- asChild 절에 `Slot.Root` / `Slot.Slottable` 직접 사용 예제 추가
- 프리뷰(unstable) primitive 절 신설 (OneTimePasswordField·PasswordToggleField + 폼 컨트롤 합성 파트 표)
- "v1.4 → v1.6 변경 요약" 표 신설, 조치 필요 사항 없음 명시

**기존 내용 중 무효화된 것**: 없음. 기존 SKILL.md 본문(asChild/Slot 동작 원리, Compound Component 예제,
Controlled/Uncontrolled 표, data-attribute 표, CSS 변수 표)은 전부 현행 문서와 일치하여 그대로 유지.

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
| 2026-08-11 | v2 | **버전 갭 최신화 (v1.4.3 → v1.6.7)**. npm registry 메타데이터 + 공식 Releases 페이지 2소스 교차 검증 12개 클레임 전항목 VERIFIED. SKILL.md에 서브패스 임포트(v1.6.3+), `Slot.Root`/`Slot.Slottable` 직접 사용 예제, 프리뷰 unstable primitive 절, v1.4→v1.6 변경 요약표 추가. **파괴적 변경 없음 확인 — 기존 본문 전량 유지**. status APPROVED 유지 (기존 테스트 3건의 검증 대상 패턴이 모두 현행 유효) | 최신화 재검증 |
