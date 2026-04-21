---
skill: swiper
category: frontend
version: v2
date: 2026-04-20
status: PENDING_TEST
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | swiper |
| 스킬 경로 | .claude/skills/frontend/swiper/SKILL.md |
| 검증일 | 2026-04-20 |
| 검증자 | Claude (WebSearch 기반 공식 문서 직접 조사) |
| 스킬 버전 | v2 |
| 버전 기준 | Swiper 11.2.6 (2025-03-19) / 12.1.3도 swiper/react 지원 확인 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (swiperjs.com/react, swiperjs.com/element, swiperjs.com/migration-guide-v11)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/nolimits4web/swiper releases, discussions)
- [✅] 최신 버전 기준 내용 확인 (Swiper 11.2.6 — 2025-03-19, npm 확인)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | https://swiperjs.com/react — Swiper React 컴포넌트 공식 문서 | SwiperRef/SwiperClass 타입, useSwiper/useSwiperSlide 훅, modules prop 패턴 확인 |
| 조사 | WebSearch | Swiper 11 current version npm 2025 | Swiper 11.2.6 (2025-03-19), Swiper 12.1.3이 최신임 확인 |
| 조사 | WebSearch | https://swiperjs.com/migration-guide-v11 — Swiper 11 마이그레이션 가이드 | loopedSlides 제거 → loopAdditionalSlides 대체, lazy 모듈 v9에서 core 통합 후 실질 제거 확인 |
| 조사 | WebSearch | https://swiperjs.com/blog/swiper-v12 — Swiper 12 주요 변경사항 | swiper/react는 v12에서도 유지·지원됨 확인, CSS 변경사항 파악 |
| 조사 | WebSearch | swiperjs.com React SwiperRef TypeScript patterns 2025 | SwiperRef(ref용) vs SwiperClass(onSwiper용) 구분 패턴, useSwiper 훅 존재 확인 |
| 조사 | WebSearch | Swiper 11 Next.js App Router SSR use client dynamic import best practice | hydration mismatch 시 dynamic + ssr:false 패턴, Server Component 내 직접 사용 불가 주의사항 |
| 교차 검증 | WebSearch | 12개 클레임, 독립 소스 2개 이상 (swiperjs.com, github.com/nolimits4web/swiper, npmjs.com) | VERIFIED 10 / DISPUTED 1 / UNVERIFIED 1 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Swiper 공식 문서 (React) | https://swiperjs.com/react | ⭐⭐⭐ High | 2026-04-20 | 공식 문서, WebSearch 확인 |
| Swiper 공식 문서 (Element) | https://swiperjs.com/element | ⭐⭐⭐ High | 2026-04-20 | 공식 문서, WebSearch 확인 |
| Swiper 마이그레이션 가이드 v11 | https://swiperjs.com/migration-guide-v11 | ⭐⭐⭐ High | 2026-04-20 | loopedSlides 제거, lazy 모듈 변경 확인 |
| Swiper v12 블로그 | https://swiperjs.com/blog/swiper-v12 | ⭐⭐⭐ High | 2026-04-20 | swiper/react 유지 확인 |
| Swiper v11 블로그 | https://swiperjs.com/blog/swiper-v11-back-to-basics | ⭐⭐⭐ High | 2026-04-20 | overflow:hidden 복귀, loop 개선 확인 |
| Swiper GitHub Releases | https://github.com/nolimits4web/swiper/releases | ⭐⭐⭐ High | 2026-04-20 | 11.2.6 (2025-03-19) 최신 11.x 버전 확인 |
| Swiper npm | https://www.npmjs.com/package/swiper | ⭐⭐⭐ High | 2026-04-20 | 최신 버전 12.1.3, 11.2.6 확인 |
| Swiper GitHub Discussions #7354 | https://github.com/nolimits4web/swiper/discussions/7354 | ⭐⭐ Medium | 2024 | React 2024 사용 패턴 커뮤니티 논의 |
| Swiper GitHub Discussions #6792 | https://github.com/nolimits4web/swiper/discussions/6792 | ⭐⭐ Medium | 2023-2024 | SwiperRef/SwiperClass TypeScript 패턴 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Swiper 11.2.6, 검증일 2026-04-20)
- [✅] deprecated된 패턴을 권장하지 않음 (lazy 모듈 제거, loopedSlides 제거 명시)
- [✅] 코드 예시가 실행 가능한 형태임

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
- [❌] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행
- [❌] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [❌] 잘못된 응답이 나오는 경우 스킬 내용 보완

### 교차 검증 클레임 결과

| 클레임 | 판정 | 비고 |
|--------|------|------|
| `swiper/react`에서 Swiper, SwiperSlide import | VERIFIED | 공식 문서 + GitHub 다수 확인 |
| 모듈은 `swiper/modules`에서 import | VERIFIED | 공식 문서 확인 |
| CSS는 `swiper/css`, `swiper/css/{module}` 형식 | VERIFIED | 공식 문서 확인 |
| `modules` prop에 배열로 모듈 전달 | VERIFIED | 공식 문서 확인 |
| `SwiperRef` (ref용) / `SwiperClass` (onSwiper용) 타입 분리 | VERIFIED | swiperjs.com/types + GitHub discussions #6792 확인 |
| `useSwiper`, `useSwiperSlide` 훅 제공 | VERIFIED | 공식 문서 확인 |
| lazy 모듈 Swiper 9+에서 제거 — 네이티브 loading="lazy" 권장 | VERIFIED | migration-guide-v11, GitHub discussions 확인 |
| `loopedSlides` Swiper 11에서 제거 → `loopAdditionalSlides` 대체 | VERIFIED | migration-guide-v11 확인 |
| Thumbs 연동 시 `destroyed` 체크 필요 | VERIFIED | 공식 문서 예제 패턴 확인 |
| Virtual Slides에 `virtualIndex` prop 필수 | VERIFIED | 공식 문서 + GitHub issues 확인 |
| `swiper/react` Swiper 12.x에서도 유지 | VERIFIED | swiper v12 블로그, swiperjs.com/types/modules/swiper-react v12.1.2 확인 |
| Swiper Element 이벤트에 `swiper` 접두사 (eventsPrefix) | DISPUTED | v11 back-to-basics 블로그에서 확인되나, React에서는 swiper/react 방식 권장이므로 SKILL.md에 주의사항으로만 기록 |

---

## 5. 테스트 진행 기록

> 아직 실시하지 않음. frontend-developer 에이전트를 통한 활용 테스트 예정.

### 테스트 케이스 1: Swiper 히어로 배너 구현

**입력 (질문/요청):**
```
히어로 배너를 Swiper로 구현해줘. 자동 재생 + 페이드 효과 + 페이지네이션 필요. Next.js App Router 환경.
```

**기대 결과:**
```
'use client' 추가, modules에 Autoplay + EffectFade + Pagination,
effect="fade", fadeEffect={{ crossFade: true }}, slidesPerView=1, loop, autoplay 설정
```

**실제 결과:** 미실시

**판정:** ❌ PENDING

---

### 테스트 케이스 2: TypeScript ref로 Swiper 외부 제어

**입력 (질문/요청):**
```
커스텀 버튼으로 Swiper를 외부에서 제어하고 싶어. TypeScript로 작성해줘.
```

**기대 결과:**
```
SwiperClass 타입 + useState, onSwiper 콜백으로 인스턴스 보관,
버튼 onClick에서 swiperInstance?.slideNext() / slidePrev() 호출
```

**실제 결과:** 미실시

**판정:** ❌ PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ⚠️ (미실시) |
| **최종 판정** | **PENDING_TEST** |

---

## 7. 개선 필요 사항

- [❌] frontend-developer 에이전트에서 Swiper 슬라이더 구현 테스트 (히어로 배너, 썸네일 갤러리)
- [❌] Swiper 12.x 정식 마이그레이션 가이드 공개 시 CSS 변경사항 반영 (scss 소스 제거, SVG 네비게이션 아이콘)
- [❌] React 19 + Swiper 11/12 호환성 실사용 테스트

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성 — Swiper 11.x 학습 데이터 기반 (WebSearch 미사용) | skill-creator |
| 2026-04-20 | v2 | WebSearch로 공식 문서 직접 재조사·재작성 — SwiperRef/SwiperClass 타입 분리, useSwiper 훅 추가, loopedSlides 제거 반영, Swiper 12 지원 여부 확인, EffectFade slidesPerView 주의사항 추가, DISPUTED 항목 재검토 | Claude (WebSearch) |
