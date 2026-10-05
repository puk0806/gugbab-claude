---
skill: animation
category: frontend
version: v7
date: 2026-09-28
status: APPROVED
---

# animation 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증)
  ├─ 에이전트 테스트 수행 (미실시)
  └─ 테스트 PASS → APPROVED
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `animation` |
| 스킬 경로 | `.claude/skills/frontend/animation/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 검증일 | 2026-09-28 (최초 2026-03-27, 직전 재검증 2026-08-11, 2026-04-20) |
| 재검증일 | 2026-09-28 (직전 2026-08-11, 2026-04-20) |
| 검증자 | puk0806 (2026-09-28 재검증: Claude, Sonnet 5) |
| 스킬 버전 | v7 |
| 대상 버전 | motion **13.x** (최신: 13.4.4, 2026-09-25 릴리즈) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (motion.dev/docs)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/motiondivision/motion CHANGELOG)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-04-20, motion 12.38.0 기준)
- [✅] framer-motion → motion 마이그레이션 변경점 반영
- [✅] motion 12.36~12.38 신규 기능 반영 (layout="x"/"y", dragSnapToOrigin 축별, skipInitialAnimation, whileTap 키보드 접근성)
- [✅] motion/react-client (Server Component용) 패턴 추가
- [✅] useAnimate 권장 / useAnimation 레거시 표기
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 재작성 (v3 → v4)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | motion 12.x framer-motion migration API changes 2025 2026 | motion.dev 공식 문서 및 CHANGELOG 링크 수집, 12.38.0 최신 확인 |
| 조사 | WebSearch | motion.dev react animate AnimatePresence useScroll useInView 2026 | 각 훅/컴포넌트 공식 문서 페이지 및 기능 설명 확인 |
| 조사 | WebSearch | motion 12 LazyMotion domAnimation domMax bundle size | 초기 ~4.6kb, domAnimation/domMax 기능 범위 표 확인 |
| 조사 | WebSearch | motion 12 layout="x" layout="y" skipInitialAnimation dragSnapToOrigin | motion 12.36.0 신규 기능 3종 확인 (2026-03-09 릴리즈) |
| 조사 | WebSearch | motion/react-client Next.js SSR Server Component | motion/react-client 패키지 역할 및 사용 방법 확인 |
| 조사 | WebSearch | useReducedMotion MotionConfig accessibility motion.dev | useReducedMotion 훅 + MotionConfig reducedMotion 옵션 확인 |
| 교차 검증 | WebSearch | motion react useAnimation useAnimationControls deprecated | VERIFIED: useAnimation은 backwards compatible alias, useAnimate 현행 권장 (2개 소스) |
| 교차 검증 | WebSearch | motion.create forwardRef React 19 ref prop | VERIFIED: React 19에서 forwardRef 불필요, ref를 일반 prop으로 전달 가능 (2개 소스) |
| 교차 검증 | WebSearch | motion 12 github changelog breaking changes latest | VERIFIED: motion 12.38.0 최신, React 파괴적 변경 없음 (2개 소스) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Motion 공식 문서 | https://motion.dev/docs | ⭐⭐⭐ High | 2026-04-20 | 공식 문서 |
| Motion 업그레이드 가이드 | https://motion.dev/docs/react-upgrade-guide | ⭐⭐⭐ High | 2026-04-20 | framer-motion → motion 마이그레이션 |
| Motion LazyMotion 문서 | https://motion.dev/docs/react-lazy-motion | ⭐⭐⭐ High | 2026-04-20 | 번들 최적화 공식 가이드 |
| Motion Changelog | https://motion.dev/changelog | ⭐⭐⭐ High | 2026-04-20 | 버전별 변경 이력 |
| motiondivision/motion CHANGELOG | https://github.com/motiondivision/motion/blob/main/CHANGELOG.md | ⭐⭐⭐ High | 2026-04-20 | GitHub 공식 레포 |
| motion npm 페이지 | https://www.npmjs.com/package/motion | ⭐⭐⭐ High | 2026-04-20 | 최신 버전 12.38.0 확인 |
| Motion 설치 가이드 | https://motion.dev/docs/react-installation | ⭐⭐⭐ High | 2026-04-20 | motion/react-client 설명 포함 |
| Motion 접근성 문서 | https://motion.dev/docs/react-accessibility | ⭐⭐⭐ High | 2026-04-20 | useReducedMotion, MotionConfig |
| MDN CSS Animation | https://developer.mozilla.org/en-US/docs/Web/CSS/animation | ⭐⭐⭐ High | 2026-04-20 | CSS 표준 문서 |
| Motion React 업그레이드 가이드 (재확인) | https://motion.dev/docs/react-upgrade-guide | ⭐⭐⭐ High | 2026-08-11 | motion 13 파괴적 변경 1차 소스 |
| Motion Changelog (재확인) | https://motion.dev/changelog | ⭐⭐⭐ High | 2026-08-11 | 13.0.0 / 12.40~12.43 항목 |
| motion npm registry 메타데이터 | https://registry.npmjs.org/motion | ⭐⭐⭐ High | 2026-08-11 | `dist-tags`·`time`·`peerDependencies` 직접 조회 (latest 13.1.0) |
| framer-motion npm registry 메타데이터 | https://registry.npmjs.org/framer-motion | ⭐⭐⭐ High | 2026-08-11 | 별칭 패키지 버전·deprecated 플래그 확인 |
| Motion AnimateView 문서 | https://motion.dev/docs/react-animate-view | ⭐⭐⭐ High | 2026-08-11 | React용 AnimateView 실험 상태·요구사항 |

---

## 4. 검증 체크리스트 (Test List)

### 3-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (motion 13.x, 최신 13.1.0 기준 — 2026-08-11 갱신)
- [✅] deprecated된 패턴을 권장하지 않음 (framer-motion import, motion() 함수 호출, useAnimation 레거시 표기)
- [✅] 코드 예시가 실행 가능한 형태임

### 3-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (CSS vs motion 선택 기준표)
- [✅] 흔한 실수 패턴 포함

### 3-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 3-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-20, 2026-09-28 재테스트)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-04-20: 2개 PASS / 2026-09-28: 2개 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 불필요)

---

## 5. 테스트 진행 기록

### [2026-09-28] 재테스트 (skill-tester) — AnimateView 정식 이동 + CSS-in-JS 파괴적 변경 반영 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (domain-specific 프론트엔드 에이전트 미설치로 대체)
**수행 방법**: SKILL.md Read 후 실전 질문 2개 답변, 근거 섹션 인용 및 anti-pattern 회피 확인. 질문 1개는 2026-09-28 재검증(2차)에서 정정된 AnimateView 정식 이동 내용을 직접 겨냥.

**Q1. Next.js(React 19.4) 프로젝트에서 React용 AnimateView로 페이지 전환 — Motion+ 멤버십/토큰 필요 여부, import 경로, 요구 React 버전**
- ✅ PASS
- 근거: SKILL.md "animateView / AnimateView — 페이지·뷰 전환" 절, "업데이트(2026-09-28 확인)" 인용 블록
- 상세: "Motion+ 멤버십·액세스 토큰 불필요", import `motion/react-animate-view`, React/React DOM 19.3+ 요구를 정확히 인용. 옛 서술(Early Access·canary 요구)로 답하지 않음 — 정정이 제대로 반영됨을 확인. `startTransition` 필요성도 언급.

**Q2. styled-components + motion.create()에서 motion 13 업그레이드 후 스타일 전용 props가 DOM에 그대로 렌더링되는 문제**
- ✅ PASS
- 근거: SKILL.md "motion 13 업그레이드 (v12 → v13)" 절 (`@emotion/is-prop-valid` 자동 사용 제거)
- 상세: 원인(CSS-in-JS 자동 필터링 제거)과 해결책 2가지(`MotionConfig isValidProp` 명시 주입 / 합성 순서 반전) 모두 정확히 인용. "CSS Module만 쓰는 컴포넌트는 조치 불필요" 문구까지 정확히 반영해 과잉 조치를 권하지 않음(anti-pattern 회피).

**발견된 gap**: 두 해결책 중 우선순위 가이드 부재(경미, 차단 요인 아님) — SKILL.md 자체 결함 아님, 선택 보강 후보로만 기록.

**판정**: agent content test 2/2 PASS. AnimateView 정식 이동 정정이 답변에 정확히 반영됨(구 서술과 모순 없음).

---

### 교차 검증 클레임 목록

| 클레임 | 판정 | 비고 |
|--------|------|------|
| 패키지명이 `motion`이며 `framer-motion`은 마이그레이션 필요 | VERIFIED | motion.dev 업그레이드 가이드, npm |
| import 경로는 `motion/react` | VERIFIED | motion.dev 공식 문서 |
| `motion.create()`로 커스텀 컴포넌트 래핑 (이전 `motion()` 대체) | VERIFIED | motion 11+ API 변경, 공식 문서 |
| motion 12에서 React 파괴적 변경 없음 | VERIFIED | motion.dev 업그레이드 가이드, GitHub CHANGELOG |
| LazyMotion features: `domAnimation`(경량) / `domMax`(전체) | VERIFIED | motion.dev LazyMotion 문서 |
| LazyMotion 초기 렌더 ~4.6kb | VERIFIED (주의 표기) | 공식 문서 수치 확인, 버전별 변동 가능성 있어 주의 유지 |
| `useAnimate`가 `useAnimation`/`useAnimationControls`를 대체 | VERIFIED | 공식 문서, GitHub discussions 2개 소스 |
| `useScroll`로 스크롤 기반 애니메이션 / `useTransform`으로 값 변환 | VERIFIED | motion.dev 스크롤 애니메이션 문서 |
| `useSpring`의 `skipInitialAnimation` 옵션 (motion 12.36+) | VERIFIED | motion.dev changelog 2026-03-09 |
| `useInView` 약 0.6kb 경량 훅 | VERIFIED | motion.dev useInView 문서 |
| `useReducedMotion` 훅 + `MotionConfig reducedMotion` 옵션 | VERIFIED | motion.dev 접근성 문서 |
| AnimatePresence mode: "sync" / "wait" / "popLayout" | VERIFIED | motion.dev AnimatePresence 문서 |
| `layout="x"` / `layout="y"` 축별 레이아웃 애니메이션 (motion 12.36+) | VERIFIED | motion.dev changelog 2026-03-09 |
| `dragSnapToOrigin`에 "x"/"y" 축별 지정 (motion 12.36+) | VERIFIED | motion.dev changelog 2026-03-09 |
| `whileTap` 요소에 tabindex="0" 자동 부여 (키보드 접근성) | VERIFIED | motion.dev changelog |
| `motion/react-client` — Server Component에서 "use client" 없이 사용 | VERIFIED | motion.dev 설치 가이드, GitHub discussions #3184 |
| React 19에서 `forwardRef` 불필요, ref를 일반 prop으로 전달 | VERIFIED | react.dev, 블로그 2개 소스 |

---

### 2026-08-11 최신화 재검증 (motion 12.38 → 13.1.0)

**검증 방법**: 각 클레임을 최소 2개 독립 소스로 교차 검증.
소스 A = npm registry 메타데이터 직접 조회(`registry.npmjs.org/motion`, `registry.npmjs.org/framer-motion`),
소스 B = motion.dev 공식 문서(React 업그레이드 가이드 / Changelog / 설치·LazyMotion·AnimateView 문서).

| # | 클레임 | 판정 | 교차 검증 근거 |
|---|--------|------|---------------|
| 1 | `motion` 최신 안정 버전은 **13.1.0** (2026-08-10), 13.0.0은 2026-08-05 | VERIFIED | npm `dist-tags.latest = 13.1.0`, `time` 객체의 13.0.0 = 2026-08-05 / 공식 Changelog "13.0.0 — August 5, 2026" |
| 2 | motion 13의 유일한 파괴적 변경은 **`@emotion/is-prop-valid` optional dependency 제거** | VERIFIED | 공식 React 업그레이드 가이드 "Motion 13.0" 절 / 공식 Changelog 13.0.0 Breaking Changes 항목 |
| 3 | 위 변경의 **하드 증거** — 12.43.0 peerDependencies에는 `@emotion/is-prop-valid: "*"`가 있고 13.1.0에는 없음 | VERIFIED | npm registry `motion/12.43.0` vs `motion/13.1.0`의 `peerDependencies` 필드 직접 비교(패키지 메타데이터 = 문서와 독립된 증거) |
| 4 | 해결책은 `<MotionConfig isValidProp={isPropValid}>` 명시 주입 또는 합성 순서 반전(`motion.create(StyledComponent)`) | VERIFIED | 공식 React 업그레이드 가이드 코드 예제 / WebSearch로 동일 코드 재확인 |
| 5 | motion 13에 그 외 **React API 파괴적 변경 없음** (v12도 React 변경 없음) | VERIFIED | 공식 React 업그레이드 가이드 "There are no breaking changes in Motion for React in version 12" + 13 절이 is-prop-valid만 기술 / Changelog 13.0.0 Breaking Changes 단일 항목 |
| 6 | `framer-motion`은 **동일 버전(13.1.0)으로 계속 배포되는 별칭 패키지**이며, `motion`이 내부적으로 `framer-motion`을 의존 | VERIFIED | npm `framer-motion` `dist-tags.latest = 13.1.0` / npm `motion@13.1.0`의 `dependencies`에 `framer-motion: ^13.1.0` |
| 7 | 단, npm registry의 `deprecated` 플래그는 걸려 있지 **않다** (설치 시 경고 없음) — 공식 문서 서술상으로만 deprecated alias | VERIFIED (주의 표기) | npm `framer-motion@13.1.0`의 `deprecated` 필드 부재 직접 확인 / 공식 문서·검색 결과는 "deprecated alias" 서술. **문서 서술과 패키지 메타데이터가 불일치하므로 SKILL.md에 주의 문구로 명시** |
| 8 | peerDependencies는 `react`·`react-dom` `^18.0.0 \|\| ^19.0.0`이며 **optional**로 표기 | VERIFIED | npm `motion@13.1.0`의 `peerDependencies` + `peerDependenciesMeta` 직접 확인 / 공식 설치 문서는 "React 18.2 이상" 표기 |
| 9 | 12.41.0(2026-06-23)에서 `animateView`가 Early Access·alpha → **메인 라이브러리 승격** | VERIFIED | 공식 Changelog 12.41.0 항목 / motion.dev animateView 문서 |
| 10 | 12.43.0(2026-07-27)에서 `backgroundColor`·SVG 하드웨어 가속 추가 | VERIFIED | 공식 Changelog 12.43.0 항목 / 13.0.0 항목의 "hardware-accelerated SVG" 후속 수정 언급 |
| 11 | React용 `AnimateView` 컴포넌트는 **아직 실험적** — Motion+ Early Access 전용, `motion@12.34.0+` **및 React canary 이상** 요구 | VERIFIED | 공식 react-animate-view 문서 "Early Access API, expect changes" + 요구사항 명시 / WebSearch 재확인 |
| 12 | LazyMotion 번들 수치(`motion` ~34kb / `LazyMotion`+`m` 초기 ~4.6kb) 현행 유지 | VERIFIED | 공식 LazyMotion 문서 재확인(수치 변동 없음) / 기존 v4 검증 결과와 일치 |
| 13 | 기존 API(`motion/react` import, `motion.create()`, `AnimatePresence` mode 3종, variants·staggerChildren, `useAnimate`·`useScroll`·`useTransform`·`useSpring`·`useInView`, `motion/react-client`)는 **전부 현행 유효** | VERIFIED | 공식 설치 문서에서 `motion/react`·`motion/react-client` 재확인 / 업그레이드 가이드·Changelog에 해당 API 변경·제거 기록 없음 |

**판정 요약**: VERIFIED 13 / DISPUTED 0 / UNVERIFIED 0 (클레임 7은 주의 표기 동반)

**SKILL.md 반영 사항**:
- frontmatter description·제목 `motion 12.x` → `motion 13.x`, 검증일 2026-08-11, 소스 URL 3건 추가
- "motion 13 업그레이드 (v12 → v13)" 절 신설 — `@emotion/is-prop-valid` 파괴적 변경, 영향 범위(CSS-in-JS 사용자 한정), 해결책 2가지
- framer-motion 별칭 패키지 현황 + npm deprecated 플래그 부재 주의 문구 추가
- React 요구 버전(설치 문서 18.2+ vs npm peer ^18||^19) 병기
- "최근 버전 변경 요약 (v12.40 → v13.1)" 표 + `animateView`/`AnimateView` 절 신설 (React용은 프로덕션 미도입 권고)

**기존 내용 중 무효화된 것**: 없음. `references/REFERENCE.md`의 "motion 12.36+" 표기는
*기능 도입 버전* 마커이므로 13.x에서도 정확 — 수정 불필요.

---

### 테스트 케이스 1: stagger 리스트 애니메이션

**입력 (질문/요청):**
```
리스트 아이템이 순차적으로 하나씩 나타나는 stagger 애니메이션을 motion으로 구현하려면?
```

**기대 결과:**
```
variants에서 부모에 staggerChildren, 자식에 개별 variant 정의.
motion.ul + motion.li 조합으로 순차 등장.
```

**실제 결과:**
```
SKILL.md variants 섹션(라인 177-203)에 staggerChildren: 0.05 예시와
listVariants/itemVariants 패턴이 정확히 포함되어 있음. 올바른 답 도출 가능.
```

**판정:** PASS

---

### 테스트 케이스 2: 번들 최적화 패턴

**입력 (질문/요청):**
```
프로덕션 React 앱에서 motion 번들 크기를 최적화하려면 어떻게 해야 해?
```

**기대 결과:**
```
LazyMotion + m 컴포넌트 사용. domAnimation(경량) vs domMax(전체) 선택.
비동기 로딩으로 초기 번들에서 제거 가능.
```

**실제 결과:**
```
SKILL.md LazyMotion 섹션(라인 426-471)에 domAnimation vs domMax 기능 비교표,
m.div 사용법, 비동기 loadFeatures 패턴, strict 모드까지 포함. 올바른 답 도출 가능.
```

**판정:** PASS

---

### [2026-09-28] 재검증(2차) — 13.1→13.4.4 버전 갱신 + AnimateView 정식 이동 반영

**수행일**: 2026-09-28
**수행 방법**: SKILL.md + references/REFERENCE.md 전체 Read → 핵심 클레임 3개를 1차 소스(npm registry, GitHub 공식 CHANGELOG.md, motion.dev 공식 문서 원문)와 대조

**클레임 대조 결과**:
1. 최신 안정 버전은 13.1.0 → 13.4.4로 갱신 필요 → **정정 반영** (`curl https://registry.npmjs.org/motion/latest` → 13.4.4, `curl https://registry.npmjs.org/motion`의 `time` 객체로 13.1.0~13.4.4 릴리스 일자 전체 확인)
2. 13.1→13.4 구간에 React API 파괴적 변경이 있는가 → 공식 GitHub CHANGELOG.md(`raw.githubusercontent.com/motiondivision/motion/main/CHANGELOG.md`) 확인 결과 **breaking change 없음** — 13.2.0(비-DOM effect 구동·Three.js/WebGPU 모듈), 13.3.0(성능 개선), 13.4.0(AnimateView 이동)은 전부 추가·개선이며 기존 API 제거 없음
3. React용 `<AnimateView>`가 여전히 "아직 실험적·Motion+ Early Access 전용·React canary 요구"인가 → **DISPUTED → 수정 반영**: 13.4.0(2026-09-14)에서 Motion+ Early Access를 벗어나 메인 `motion` 패키지로 정식 이동함을 motion.dev 공식 문서(`motion.dev/docs/react-animate-view`) 원문으로 확인 — "AnimateView was originally in Motion+ early access... no longer requires a Motion+ membership or access token", "requires React and React DOM 19.3 or later", import 경로가 `motion/react-animate-view`(별도 엔트리포인트, `motion/react`에서 export 안 됨)로 확정. `framer-motion` 별칭 패키지도 동일 버전(13.4.4)으로 계속 배포되며 `deprecated` 플래그 여전히 없음(기존 서술과 일치, 변경 없음)

**보강(ADD)**: SKILL.md "최근 버전 변경 요약" 표에 13.1.1~13.4.4 행 추가. "animateView / AnimateView" 절의 React `AnimateView` 설명을 Early Access 상태 서술에서 정식 이동 내용(요구사항 React/React DOM 19.3+, import 경로 `motion/react-animate-view`, 마이그레이션 방법, `startTransition` 사용 예제)으로 전면 교체. 13.2.0의 `motion/three`·`motion/vgpu`(3D/WebGPU 이펙트 구동)는 이 스킬의 CSS/React UI 애니메이션 범위 밖임을 명시하고 표에만 기재(본문 섹션 신설은 하지 않음 — 스킬 범위 밖 판단).
**축소**: 없음.

**실전 질문 재검증**:
- Q1. "motion 최신 안정 버전은?" → SKILL.md 상단 인용구 "v13.4.4 (2026-09-25 릴리즈)" 근거로 PASS
- Q2. "React 프로젝트에서 페이지 전환에 AnimateView를 써도 되는가?" → SKILL.md 신규 주의 블록(React/React DOM 19.3+ 요구, `motion/react-animate-view` import, 최근 릴리스라 React 18 프로젝트는 `AnimatePresence mode="wait"` 권장) 근거로 PASS

**재검증 최종 판정**: status **PENDING_TEST 전환** (버전 갱신 + AnimateView 정식 이동 반영 — 다음 skill-tester 재테스트 필요)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-20: 2개 PASS / 2026-09-28 재테스트: 2개 PASS — AnimateView 정정 반영 확인) |
| **최종 판정** | **APPROVED** (2026-09-28 skill-tester 재테스트 2/2 PASS — 버전 갱신 13.1→13.4.4 + AnimateView 정식 이동 정정이 답변에 정확히 반영됨을 확인) |

---

## 7. 개선 필요 사항

- [✅] 에이전트 활용 테스트 — motion 마이그레이션 + LazyMotion 2건 PASS, APPROVED 전환 완료 (2026-04-14)
- [✅] 2026-09-28 재검증(2차) 보강분(AnimateView 정식 이동·버전 13.4.4) content test 수행 — 2/2 PASS, APPROVED 재전환 완료 (2026-09-28)
- [🔬] 실제 Next.js 프로젝트에서 motion/react-client 패턴 동작 확인 — 차단 요인 아님, 실환경 검증 대기(선택)
- [🔬] LazyMotion strict 모드에서 motion.div 사용 시 경고 확인 — 차단 요인 아님, 실환경 검증 대기(선택)
- [❌] 두 CSS-in-JS 해결책(MotionConfig 명시 주입 vs 합성 순서 반전) 중 우선순위 가이드 추가 — 차단 요인 아님, 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-03-27 | v1 | 최초 작성 (framer-motion 기준) | frontend-architect 에이전트 |
| 2026-04-14 | v2 | frontend-architect 활용 테스트 APPROVED | frontend-architect 에이전트 |
| 2026-04-17 | v3 | verification.md 8섹션 포맷 마이그레이션 | 메인 대화 |
| 2026-04-20 | v4 | WebSearch+WebFetch 조사 기반 전면 재작성. motion 12.38.0 기준 반영. layout="x"/"y", dragSnapToOrigin 축별, skipInitialAnimation, whileTap 키보드 접근성, motion/react-client, useAnimate 권장 패턴, 교차 검증 17개 클레임 추가 | puk0806 |
| 2026-08-11 | v5 | **메이저 버전 갭 최신화 (12.38.0 → 13.1.0)**. npm registry 메타데이터 + motion.dev 공식 문서 2소스 교차 검증 13개 클레임 전항목 VERIFIED. motion 13 파괴적 변경(`@emotion/is-prop-valid` 제거 → `MotionConfig isValidProp`) 절 신설, framer-motion 별칭 현황 + npm deprecated 플래그 부재 주의 표기, v12.40~13.1 변경 요약표, `animateView`/React `AnimateView`(실험적) 절 추가. **기존 API 전량 현행 유효 — 본문 유지**. status APPROVED 유지 (기존 테스트 2건의 대상 패턴 stagger·LazyMotion 모두 무변경) | 최신화 재검증 |
| 2026-09-28 | v6 | 재검증(2차) — 최신 안정 버전 13.1.0→13.4.4 갱신(breaking change 없음, 공식 CHANGELOG.md 확인). **React용 `<AnimateView>`가 13.4.0에서 Motion+ Early Access를 벗어나 메인 패키지로 정식 이동**함을 공식 문서 원문으로 확인·정정 반영(요구사항 React/React DOM 19.3+, import 경로 `motion/react-animate-view`, 마이그레이션 안내, `startTransition` 예제). 13.1.1~13.4.4 변경 요약표 보강(13.2.0 `motion/three`/`motion/vgpu`는 스킬 범위 밖으로 표에만 기재). status APPROVED → PENDING_TEST (skill-tester 재테스트 필요) | Claude (Sonnet 5) |
| 2026-09-28 | v7 | 2단계 재테스트 수행 (Q1 AnimateView 정식 이동 반영 확인 / Q2 CSS-in-JS `@emotion/is-prop-valid` 파괴적 변경 대응) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
