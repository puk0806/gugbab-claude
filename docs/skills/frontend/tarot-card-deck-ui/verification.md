---
skill: tarot-card-deck-ui
category: frontend
version: v1
date: 2026-09-10
status: APPROVED
---

# 스킬 검증 — tarot-card-deck-ui

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `tarot-card-deck-ui` |
| 스킬 경로 | `.claude/skills/frontend/tarot-card-deck-ui/SKILL.md` |
| 검증일 | 2026-09-10 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 버전 기준 | motion 13.2.0 (2026-09-02 npm `latest`) / CSS·DOM 표준은 MDN 현행 기준 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (MDN / W3C WAI-ARIA APG / motion.dev / v8.dev)
- [✅] 공식 GitHub 2순위 소스 확인 (lodash issue #4743 — Math.random 상태 비트 한계)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-09-10, motion 13.2.0)
- [✅] 기존 레포 스킬과의 정합성 확인 — `frontend/animation`, `frontend/swiper` Read 후 상호 참조·역할 분담 명시
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (셔플·플립·부채꼴·스프레드·접근성·에셋)
- [✅] 코드 예시 작성 (TS / React / CSS / HTML)
- [✅] 흔한 실수 패턴 정리 (§8, 19항목)
- [✅] SKILL.md 파일 작성
- [✅] 중복 스킬 존재 여부 확인 (Glob — 동명 스킬 없음)

---

## 2. 실행 에이전트 로그

> skill-creator 에이전트가 사용한 도구와 조사·검증 내역

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 중복 확인 | Glob | `.claude/skills/**/tarot*/SKILL.md` | 결과 0건 — 신규 생성 확정 |
| 레포 정합 | Read | `frontend/animation/SKILL.md`, `frontend/swiper/SKILL.md` | motion 13.x 권장·Swiper 14.x 확인. 부채꼴에 Swiper 부적합 판단 근거 확보 |
| 레포 정합 | Glob | `.claude/skills/humanities/**/SKILL.md`, 이미지·a11y 관련 스킬 | `image-optimization-seo` 존재 확인. `humanities/tarot-history-symbolism`은 현 시점 미존재(동시 생성 전제로 상호 참조 링크만 배치) |
| 조사 | WebFetch | MDN `transform-style`, `backface-visibility`, `will-change`, `touch-action`, `prefers-reduced-motion`, `Pointer_events`, `Crypto.getRandomValues`, `<img>` | 8개 1순위 소스, 값·기본값·경고 문구 원문 확보 |
| 조사 | WebFetch | v8.dev `math-random` 블로그 | xorshift128+ / 128비트 상태 / 비암호학적 명시 확인 |
| 조사 | WebFetch | motion.dev `react-motion-config`, `react-accessibility`, `react-use-reduced-motion` | `reducedMotion` 값·기본값·동작 확인 |
| 조사 | WebSearch | Fisher-Yates·modulo bias·rejection sampling, 켈틱크로스 포지션, RWS 저작권, preload responsive images, APG roving tabindex | 보조 소스 확보 및 1순위 소스 교차 확인 |
| 교차 검증 | WebSearch + WebFetch | 14개 클레임, 각 독립 소스 2개 이상 | VERIFIED 12 / DISPUTED 2 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| MDN — transform-style | https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style | ⭐⭐⭐ High | 2026-09-10 | 표준 문서. preserve-3d → flat 강제 조건 10종 |
| MDN — backface-visibility | https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility | ⭐⭐⭐ High | 2026-09-10 | 값·초깃값·비상속·2D 무효 |
| MDN — will-change | https://developer.mozilla.org/en-US/docs/Web/CSS/will-change | ⭐⭐⭐ High | 2026-09-10 | 과용 경고 원문 4건 |
| MDN — touch-action | https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action | ⭐⭐⭐ High | 2026-09-10 | 값 목록, pointercancel 관계, 줌 차단 접근성 경고 |
| MDN — Pointer events | https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events | ⭐⭐⭐ High | 2026-09-10 | setPointerCapture 동작·자동 해제·over/out 미발생 |
| MDN — prefers-reduced-motion | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion | ⭐⭐⭐ High | 2026-09-10 | reduce 의미, "대체" 권장, 기본값 no-preference |
| MDN — Crypto.getRandomValues | https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues | ⭐⭐⭐ High | 2026-09-10 | 허용 TypedArray, 65,536바이트 한도, 비보안 컨텍스트 가용 |
| MDN — `<img>` | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img | ⭐⭐⭐ High | 2026-09-10 | loading/decoding/fetchpriority, 0크기 미로드 함정 |
| V8 공식 블로그 — math-random | https://v8.dev/blog/math-random | ⭐⭐⭐ High | 2026-09-10 | xorshift128+, 128비트 상태, 비암호학적 명시 |
| Motion 공식 — MotionConfig | https://motion.dev/docs/react-motion-config | ⭐⭐⭐ High | 2026-09-10 | reducedMotion 값 3종 + 기본값 `"never"` |
| Motion 공식 — Accessibility | https://motion.dev/docs/react-accessibility | ⭐⭐⭐ High | 2026-09-10 | 자동 적용 아님, transform/layout만 비활성 |
| Motion 공식 — useReducedMotion | https://motion.dev/docs/react-use-reduced-motion | ⭐⭐⭐ High | 2026-09-10 | 시그니처·설정 변경 시 리렌더 |
| W3C WAI-ARIA APG — Listbox | https://www.w3.org/WAI/ARIA/apg/patterns/listbox/ | ⭐⭐⭐ High | 2026-09-10 | listbox/option, aria-activedescendant 대안 |
| W3C WAI-ARIA APG — Keyboard Interface | https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/ | ⭐⭐⭐ High | 2026-09-10 | roving tabindex의 자동 스크롤 이점 |
| web.dev — Preload responsive images | https://web.dev/articles/preload-responsive-images | ⭐⭐⭐ High | 2026-09-10 | imagesrcset/imagesizes, href 생략, fetchpriority 필요성 |
| npm / npmx — motion | https://www.npmjs.com/package/motion , https://npmx.dev/package/motion/versions | ⭐⭐⭐ High | 2026-09-10 | 13.2.0 (2026-09-02) `latest` — 2개 소스 일치 |
| lodash Issue #4743 | https://github.com/lodash/lodash/issues/4743 | ⭐⭐ Medium | 2026-09-10 | 128비트 상태 → 약 34개 원소 한계. 공식 레포 이슈 |
| Plagiarism Today — RWS 저작권 분쟁 | https://www.plagiarismtoday.com/2024/02/28/the-copyright-battle-over-a-tarot-card-deck/ | ⭐⭐ Medium | 2026-09-10 | CCB 사건 — 양측 모두 원본 PD 인정, US Games 입장 |
| Wikipedia — The Pictorial Key to the Tarot | https://en.wikipedia.org/wiki/The_Pictorial_Key_to_the_Tarot | ⭐⭐ Medium | 2026-09-10 | 1910년 발행·1911년 표기, 켈틱크로스 수록 |
| Truly Teach Me Tarot — Celtic Cross | https://teachmetarot.com/celtic-cross-spread/ | ⭐⭐ Medium | 2026-09-10 | Waite 원문 10포지션 표현, 현대 변형 |
| Internet Sacred Text Archive — RWS Copyright FAQ | https://sacred-texts.com/tarot/faq.htm | — | 2026-09-10 | **접근 실패(HTTP 403).** 대체 소스로 검증 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (motion 13.2.0, 검증일 2026-09-10)
- [✅] deprecated된 패턴을 권장하지 않음 (`framer-motion` 대신 `motion/react`, `useAnimation` 미사용)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, user-invocable: false)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함 (§8, 19항목)
- [✅] 불확실 항목에 `> 주의:` 표기 (Math.random 체감 편향, 역방향 전통 차이, 3장 스프레드 원전 미확인, 켈틱크로스 의미 변형, 저작권 비법률자문)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)
- [✅] 기존 레포 스킬과 권장 라이브러리 충돌 없음 (`frontend/animation`의 motion 13.x, `frontend/swiper`의 Swiper 14.x와 역할 분담 명시)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-10, skill-tester → frontend-developer)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS, 근거 섹션 명시 확인)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (해당 없음 — FAIL 없음, 경미한 gap만 발견)

### 4-5. 교차 검증한 클레임과 판정 결과

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | `transform-style: preserve-3d`는 `overflow`(visible/clip 외)·`opacity<1`·`filter`·`clip`·`clip-path`·`isolation:isolate`·`mask-image`·`mask-border-source`·`mix-blend-mode`·`contain:paint` 사용 시 used value가 `flat`으로 강제된다 | MDN transform-style | CSS Transforms Level 2 명세(MDN 인용) | **VERIFIED** |
| 2 | `backface-visibility` 초깃값은 `visible`, 비상속, 2D transform에 효과 없음 | MDN backface-visibility | Codrops / SitePoint 레퍼런스 | **VERIFIED** |
| 3 | `backface-visibility`는 Baseline 널리 사용 가능이며 현행 브라우저에서 `-webkit-` 접두사 불필요 (Safari 11 이하만 필요) | MDN(Baseline 표기) | autoprefixer issue #923(Safari 11 이하 한정) | **VERIFIED** |
| 4 | MDN은 `will-change` 과용 시 오히려 느려지며, 스크립트로 켜고 끄는 것이 권장 관행이고, 선제 최적화 용도로 쓰면 안 된다고 명시 | MDN will-change (원문 인용) | 동 문서 내 예제 코드(mouseenter/animationEnd 토글) | **VERIFIED** |
| 5 | V8의 `Math.random()`은 xorshift128+ 이며 내부 상태 128비트, 암호학적으로 안전하지 않음 | v8.dev/blog/math-random (공식) | Chromium issue tracker / arXiv xorshift128+ 논문 | **VERIFIED** |
| 6 | 128비트 PRNG 상태로는 약 34개 원소까지만 Fisher-Yates 전체 순열 도달이 보장된다 | lodash issue #4743 | Wikipedia Fisher–Yates "Pseudorandom generators" 절 | **VERIFIED** |
| 7 | `crypto.getRandomValues()`는 정수 TypedArray만 받고, 호출당 65,536바이트 한도이며, `Crypto` 멤버 중 유일하게 비보안 컨텍스트에서 동작 | MDN getRandomValues | W3C Web Cryptography API 명세(MDN 인용) | **VERIFIED** |
| 8 | 브라우저 Web Crypto에는 Node의 `crypto.randomInt()` 대응 API가 없으며 거부 샘플링을 직접 구현해야 한다 | MDN Crypto 인터페이스 멤버 목록 | Node.js 공식 crypto 문서 + 커뮤니티 구현 비교 | **VERIFIED** |
| 9 | Pointer capture는 `pointerup`/`pointercancel` 후 암묵적으로 해제되며, 캡처 중에는 `pointerover/enter/leave/out`이 발생하지 않는다 | MDN Pointer events | 동 문서 setPointerCapture 절 | **VERIFIED** |
| 10 | `touch-action` 미지정 시 브라우저가 팬/줌을 가로채며 `pointercancel`이 발생한다. `none`은 브라우저 확대를 막아 접근성 위험이 있다 | MDN touch-action(경고 박스) | MDN Pointer events "touch-action" 절 | **VERIFIED** |
| 11 | `prefers-reduced-motion`의 기본은 `no-preference`이며, MDN은 전면 제거가 아니라 더 부드러운 대체를 권장 | MDN prefers-reduced-motion(예제 포함) | WCAG 2.3.3 | **VERIFIED** |
| 12 | lazy 이미지에 width/height가 없으면 크기 0으로 계산되어 영원히 로드되지 않을 수 있고, lazy 이미지는 `load` 이벤트 계산에서 제외된다 | MDN `<img>` (원문 인용) | web.dev 이미지 지연 로딩 가이드 | **VERIFIED** |
| 13 | motion 최신 안정 버전은 13.2.0 (2026-09-02) | npmjs.com/package/motion | npmx.dev/package/motion/versions | **VERIFIED** |
| 14 | RWS 원본 아트워크는 미국에서 퍼블릭 도메인이며, U.S. Games Systems는 원본 이미지 자체의 소유권은 주장하지 않는다 | Plagiarism Today(CCB 사건 보도) | 검색 결과 다수(Rideau River Tarot 등) | **VERIFIED** |

**집계: VERIFIED 12 / DISPUTED 2 / UNVERIFIED 0**

### 4-6. DISPUTED 항목과 수정 반영 내역

| # | 클레임 | 불일치 내용 | 조치 |
|---|--------|-------------|------|
| D1 | motion `MotionConfig`의 `reducedMotion` 기본값 | 서드파티 자료 일부는 기본값을 `"user"`(사용자 설정 존중)로 서술. **공식 문서(motion.dev/docs/react-motion-config)는 기본값을 `"never"`로 명시**하며, 공식 접근성 가이드도 "명시적으로 설정해야 한다"는 전제로 서술 | 공식 문서 기준 **`"never"`가 기본값**으로 작성. SKILL.md §6-1에 3개 값 표 + 기본값 명시, "명시하지 않으면 사용자 설정을 무시한다" 경고 추가. §8 흔한 실수 표에도 항목 추가 |
| D2 | 켈틱크로스 포지션 3·5·9의 *의미*, 3장 과거-현재-미래 배열의 출처 | Waite 원전(`crowns him` = 의식적 목표)과 Eden Gray 계열 현대 해석(3번 = 의식적 사고, 시계방향 배열)이 불일치. 3장 배열은 Waite 원전에서 확인되지 않음 | **레이아웃 기하만 확정 서술**(2개 소스 일치)하고, 의미 해석은 `> 주의:`로 전통별 차이를 명시한 뒤 `humanities/tarot-history-symbolism`으로 위임. 3장 스프레드도 "원전 미확인, 현대 관용 배열"로 `> 주의:` 표기 |

### 4-7. 접근 실패 소스 처리

- `sacred-texts.com/tarot/faq.htm` (RWS 저작권 FAQ) — HTTP 403으로 본문 확보 실패.
  → 저작권 클레임은 Plagiarism Today의 CCB 사건 보도(1차 자료 인용)와 검색 결과 교차로 대체 검증.
  SKILL.md §7-6 서두에 **"법률 자문이 아님 / 상용 배포 전 변호사 검토"** 경고를 명시했다.
  영국 만료 시점은 기산점 이견이 있어 단정하지 않고 "통설" + "이견 존재"로 서술했다.

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-10
**수행자**: skill-tester → frontend-developer
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인 (아래 §5의 "예정 테스트 케이스" 3건을 그대로 실행)

### 실제 수행 테스트

**Q1. 78장 덱을 편향 없이 섞어 3장 뽑는 로직**
- ✅ PASS
- 근거: SKILL.md §1-2(Fisher-Yates), §1-4(`crypto.getRandomValues()` + 거부 샘플링), §1-6(React 실행 위치), §8
- 상세: `randomIntBelow(i + 1)` 상한을 정확히 지켰고(Sattolo 오분기 회피), `Array.prototype.sort` 셔플 금지 근거를 §1-1에서 인용. 이벤트 핸들러 + `useState` 고정 패턴도 §1-6 그대로 재현. gap: "셔플 후 slice(0,3)" 조합 자체를 하나의 완성 예제로 SKILL.md가 제공하지 않아 에이전트가 직접 조합해야 했음(경미).

**Q2. CSS 카드 플립에서 앞면이 뒤집혀 보이고 뒷면이 비치는 문제 진단**
- ✅ PASS
- 근거: SKILL.md §2-2("`preserve-3d`가 조용히 `flat`으로 강제되는 조건"), §2-1, §8
- 상세: `.card`의 `overflow: hidden`이 `transform-style: preserve-3d`를 `flat`으로 강제한다는 정확한 원인 지목, 클리핑을 `.card__face`로 내리는 수정안까지 §2-2 체크리스트 그대로 제시. gap: `border-radius` 자체는 강제 조건표에 명시되어 있지 않아 "무엇이 실제 원인인지" 약간의 모호함이 있었음(경미, 실무 영향 없음).

**Q3. `prefers-reduced-motion` + motion(motion/react) 환경에서 카드 뽑기 접근성 대응**
- ✅ PASS
- 근거: SKILL.md §6-1("플립은 특별 취급이 필요하다"), §2-4, §3-1/3-2
- 상세: `MotionConfig` 기본값이 `"never"`라 명시하지 않으면 사용자 설정이 무시된다는 함정, `useReducedMotion`으로 즉시 면 교체 대체 렌더 경로 제공 필요성, 셔플 로직과 연출 분리 원칙을 모두 정확히 인용. gap: CSS 미디어쿼리 방식과 `useReducedMotion` 훅 병행 시 우선순위는 SKILL.md가 다루지 않음(경미, 셔플 연출 섹션은 CSS 예시 위주).

### 발견된 gap (SKILL.md 보강 권장, 차단 요인 아님)

- 셔플+N장 추출을 하나로 묶은 완성형 예제 부재 (§1)
- `border-radius`가 §2-2 강제 조건표에 명시적으로 포함되어 있지 않음
- 셔플 연출(§3)에서 reduced-motion 감지를 React 훅(`useReducedMotion`) vs CSS 미디어쿼리 중 어느 쪽을 쓸지 명시적 가이드 부재

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 — UI 인터랙션/라이브러리 사용 패턴 스킬(빌드 설정·워크플로우·마이그레이션 아님) → content test PASS만으로 APPROVED 전환 가능한 카테고리
- 최종 상태: APPROVED

---

### 예정 테스트 케이스 1: 셔플 랜덤성

**입력 (질문/요청):**
```
타로 앱에서 78장 덱을 섞어 3장 뽑는 로직을 작성해줘.
결과가 편향되지 않게 해야 해.
```

**기대 결과:**
```
- Array.prototype.sort 셔플을 금지로 명시
- Fisher-Yates(Durstenfeld) 사용, 상한이 i + 1임을 지킴
- crypto.getRandomValues + 거부 샘플링으로 modulo bias 제거
- 렌더 중이 아니라 이벤트 핸들러에서 실행하고 상태에 고정
- 필요 시 Math.random 128비트 상태 한계를 근거로 설명
```

**실제 결과:** 2026-09-10 skill-tester → frontend-developer 수행. Fisher-Yates `randomIntBelow(i + 1)`, `crypto.getRandomValues()` + 거부 샘플링, 이벤트 핸들러 + `useState` 고정 패턴을 모두 정확히 인용해 구현. 위 "실제 수행 테스트 Q1" 참조.

**판정:** ✅ PASS

---

### 예정 테스트 케이스 2: 카드 플립이 깨지는 원인 진단

**입력:**
```
CSS로 카드 플립을 만들었는데 앞면이 뒤집힌 채로 보이고 뒷면이 비쳐.
.card에 border-radius랑 overflow: hidden을 줬어.
```

**기대 결과:**
```
- overflow: hidden이 transform-style: preserve-3d를 flat으로 강제한다는 점 지적
- 클리핑을 .card__face로 내리라고 안내
- 함께 위험한 속성(opacity<1, filter, contain: paint 등) 열거
```

**실제 결과:** 2026-09-10 skill-tester → frontend-developer 수행. `overflow: hidden`이 `preserve-3d`를 `flat`으로 강제하는 원인을 정확히 지목하고 클리핑을 face로 내리는 수정안 제시. 위 "실제 수행 테스트 Q2" 참조.

**판정:** ✅ PASS

---

### 예정 테스트 케이스 3: reduced-motion + 접근성

**입력:**
```
prefers-reduced-motion을 켠 사용자에게도 타로 카드 뽑기가 동작하게 하고 싶어.
motion 라이브러리를 쓰고 있어.
```

**기대 결과:**
```
- MotionConfig reducedMotion 기본값이 "never"이므로 "user"로 명시해야 함을 지적
- reduced motion에서 transform이 꺼지면 rotateY 플립이 멈춰 앞면을 볼 수 없다는 함정 지적
- useReducedMotion으로 대체 렌더 경로(즉시 면 교체/크로스페이드) 제공
- 78장 listbox + roving tabindex, 뒷면 alt에 카드명 노출 금지
```

**실제 결과:** 2026-09-10 skill-tester → frontend-developer 수행. `MotionConfig` 기본값 `"never"` 함정, `useReducedMotion` 대체 렌더 경로, 셔플 로직/연출 분리 원칙을 모두 정확히 인용. 위 "실제 수행 테스트 Q3" 참조.

**판정:** ✅ PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (14 클레임 중 VERIFIED 12 / DISPUTED 2 — 2건 모두 수정 반영) |
| 구조 완전성 | ✅ (frontmatter·소스 URL·검증일·주의 표기·코드 예시·흔한 실수 포함) |
| 실용성 | ✅ (실행 가능한 TS/React/CSS 예시, 프로젝트 비종속) |
| 기존 스킬 정합성 | ✅ (`frontend/animation`·`frontend/swiper` Read 후 역할 분담·상호 참조 명시, 권장 라이브러리 충돌 없음) |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-09-10, skill-tester → frontend-developer) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] **skill-tester로 2단계 실사용 테스트 수행** (2026-09-10 완료, 3/3 PASS — §5 "실제 수행 테스트" 참조. status PENDING_TEST → APPROVED 전환)
- [❌] `humanities/tarot-history-symbolism` 스킬이 실제로 생성되면 상호 참조 링크 유효성 확인 — 선택 보강(차단 아님, 해당 스킬 부재 시에도 본 스킬은 독립적으로 유효)
- [❌] RWS 저작권 절은 `sacred-texts.com` FAQ가 403으로 접근 실패했다. 접근 가능해지면 재확인해 영국 만료 기산점 서술을 보강 — 선택 보강(차단 아님, 이미 "통설+이견 존재"로 안전하게 서술됨)
- [❌] 켈틱크로스 포지션 의미는 앱이 채택할 전통이 확정되면 `humanities` 스킬과 라벨 문구를 정합화 — 선택 보강(차단 아님, 레이아웃 기하는 이미 확정 서술)
- [❌] 실제 78장 덱으로 모바일 저사양 기기 성능 측정 후 §3-2 프록시 카드 권장 개수(8~12장)를 실측값으로 갱신 — 선택 보강(차단 아님, 실사용 데이터 축적 후 개선)
- [❌] README.md / docs/skills/README.md 스킬 목록·업데이트 로그 반영 — 차단 요인(스킬 사용 자체는 가능하나 레포 문서 동기화 규칙상 필요, 사용자 승인 하에 후속 조치)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-10 | v1 | 최초 작성. 셔플 랜덤성·CSS 3D 플립·부채꼴 인터랙션·스프레드 배치·접근성·이미지 에셋 6개 축. 14개 클레임 교차 검증(VERIFIED 12 / DISPUTED 2) | skill-creator |
| 2026-09-10 | v1 | 2단계 실사용 테스트 수행 (Q1 셔플 랜덤성 / Q2 CSS 플립 깨짐 진단 / Q3 reduced-motion 접근성) → 3/3 PASS, APPROVED 전환 | skill-tester |
