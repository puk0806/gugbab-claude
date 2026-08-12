---
skill: swiper
category: frontend
version: v3
date: 2026-08-11
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | swiper |
| 스킬 경로 | .claude/skills/frontend/swiper/SKILL.md |
| 검증일 | 2026-08-11 (v3 최신화) / 2026-04-20 (v2 최초 검증) |
| 검증자 | Claude (WebSearch + WebFetch 기반 공식 문서 직접 조사) |
| 스킬 버전 | v3 |
| 버전 기준 | Swiper 14.1.0 (2026-08-06) — v14.0.0은 2026-06-26, v13은 릴리즈되지 않음 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (swiperjs.com/react, /element, /swiper-api, /types)
- [✅] 공식 릴리즈 노트·changelog 확인 (swiperjs.com/changelog, swiperjs.com/blog/swiper-v14, /blog/swiper-v12)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/nolimits4web/swiper CHANGELOG.md, 커밋)
- [✅] 최신 버전 기준 내용 확인 (Swiper 14.1.0 — 2026-08-06, npm registry 확인)
- [✅] v11 → v12 → v14 breaking change 정리
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리 (references/REFERENCE.md)
- [✅] SKILL.md 파일 v14 기준으로 갱신
- [✅] references/REFERENCE.md의 v12 이후 무효화된 CSS 패턴 교정

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 (2026-08-11) | WebSearch | Swiper 14 release TypeScript rewrite browser baseline breaking changes | v14 = TS 전면 재작성, baseline Chrome/Edge 110+·Safari 16.4+·Firefox 110+, v12→v14 코드 변경 불필요 |
| 조사 (2026-08-11) | WebSearch | swiperjs.com migration guide v14 | 별도 migration-guide-v14 페이지 없음 — blog/swiper-v14가 사실상 마이그레이션 안내. 타입 엄격화 주의 확인 |
| 조사 (2026-08-11) | WebFetch | https://swiperjs.com/blog/swiper-v14 | 릴리즈 상세, v13 스킵, ssr-window 제거, 번들 2~4% 축소, swiper/react 유지 확인 |
| 조사 (2026-08-11) | WebFetch | https://swiperjs.com/blog/swiper-v13 | HTTP 404 — v13 미존재 확인 (교차 근거) |
| 조사 (2026-08-11) | WebFetch | https://swiperjs.com/blog/swiper-v12 | v12.0.0 2025-09-11, SCSS/LESS 제거, SVG 네비 아이콘, virtual slidesPerViewAutoSlideSize 확인 |
| 조사 (2026-08-11) | WebFetch | https://swiperjs.com/changelog | 14.1.0 (2026-08-06), 14.0.0 (2026-06-26), 12.1.0 (2026-01-28), 12.0.0 (2025-09-11) 버전·날짜 확정 |
| 조사 (2026-08-11) | WebFetch | https://registry.npmjs.org/swiper/latest | latest = 14.1.0, 런타임 의존성 0 확인. engines.node는 여전히 >= 4.7.0 |
| 조사 (2026-08-11) | WebFetch | https://raw.githubusercontent.com/nolimits4web/swiper/master/CHANGELOG.md | 공식 레포 CHANGELOG로 v14/v12 항목·"We skipped v13" 재확인 |
| 조사 (2026-08-11) | WebFetch | https://swiperjs.com/react | v14.1.0 문서 기준 import 경로·modules prop·훅·슬롯·render props 유지 확인 |
| 조사 (2026-08-11) | WebFetch | https://swiperjs.com/types/modules/swiper-react | v14.1.0에서 SwiperRef·SwiperProps·SwiperSlideProps·useSwiper·useSwiperSlide·SwiperClass export 확인 |
| 조사 (2026-08-11) | WebFetch | https://swiperjs.com/swiper-api | navigation.addIcons(기본 true), --swiper-navigation-* 변수, snapToSlideEdge 사양 확인 |
| 조사 (2026-08-11) | WebFetch | https://swiperjs.com/element | register() 경로, init="false" + Object.assign + initialize(), events-prefix, el.swiper 접근 확인 |
| 교차 검증 (2026-08-11) | WebSearch + WebFetch | 12개 클레임, 클레임별 독립 소스 2개 이상 (swiperjs.com blog/changelog/api, github.com/nolimits4web/swiper, registry.npmjs.org) | VERIFIED 11 / DISPUTED 1 / UNVERIFIED 0 |
| 조사 (2026-04-20, v2) | WebSearch | swiperjs.com/react, /element, /migration-guide-v11, npm | SwiperRef/SwiperClass 분리, useSwiper 훅, loopedSlides 제거, lazy 모듈 제거 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Swiper v14 릴리즈 블로그 | https://swiperjs.com/blog/swiper-v14 | ⭐⭐⭐ High | 2026-08-11 | TS 재작성·baseline·v13 스킵·업그레이드 지침 |
| Swiper 공식 changelog | https://swiperjs.com/changelog | ⭐⭐⭐ High | 2026-08-11 | 14.1.0/14.0.0/12.1.0/12.0.0 버전·날짜 확정 |
| Swiper GitHub CHANGELOG.md | https://raw.githubusercontent.com/nolimits4web/swiper/master/CHANGELOG.md | ⭐⭐⭐ High | 2026-08-11 | 사이트 changelog와 독립 대조용 |
| Swiper v12 릴리즈 블로그 | https://swiperjs.com/blog/swiper-v12 | ⭐⭐⭐ High | 2026-08-11 | SCSS/LESS 제거, SVG 아이콘, virtual 파라미터 |
| Swiper 공식 문서 (React) | https://swiperjs.com/react | ⭐⭐⭐ High | 2026-08-11 | v14.1.0 표기, React 래퍼 유지 확인 |
| Swiper 타입 문서 (swiper/react) | https://swiperjs.com/types/modules/swiper-react | ⭐⭐⭐ High | 2026-08-11 | v14.1.0 export 목록 |
| Swiper API 문서 | https://swiperjs.com/swiper-api | ⭐⭐⭐ High | 2026-08-11 | addIcons, navigation CSS 변수, snapToSlideEdge |
| Swiper 공식 문서 (Element) | https://swiperjs.com/element | ⭐⭐⭐ High | 2026-08-11 | register/init/events-prefix 패턴 |
| npm registry (swiper latest) | https://registry.npmjs.org/swiper/latest | ⭐⭐⭐ High | 2026-08-11 | latest 14.1.0, 의존성 0, engines 필드 |
| slidesPerViewAutoSlideSize 커밋 | https://github.com/nolimits4web/Swiper/commit/d47214480e7b9155ce2203a9a21209e56c5c303b | ⭐⭐⭐ High | 2026-08-11 | 해당 파라미터 도입 근거 |
| Swiper 마이그레이션 가이드 v11 | https://swiperjs.com/migration-guide-v11 | ⭐⭐⭐ High | 2026-04-20 | loopedSlides 제거, lazy 모듈 변경 (v2 검증분) |
| Swiper GitHub Discussions #6792 | https://github.com/nolimits4web/swiper/discussions/6792 | ⭐⭐ Medium | 2023-2024 | SwiperRef/SwiperClass 패턴 (v2 검증분) |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Swiper 14.1.0, 검증일 2026-08-11)
- [✅] deprecated·제거된 패턴을 권장하지 않음 (swiper/scss 경로, 폰트 기반 화살표 ::after, loopedSlides, lazy 모듈)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (references/REFERENCE.md)
- [✅] 흔한 실수 패턴 포함 (references/REFERENCE.md)
- [✅] 마이그레이션 노트 섹션 포함 (v11 → v12 → v14)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (REFERENCE.md 네비게이션 CSS 예시 교정 반영)

### 교차 검증 클레임 결과 (2026-08-11 최신화분)

| 클레임 | 판정 | 근거 소스 (2개 이상) |
|--------|------|----------------------|
| 최신 안정 버전은 Swiper 14.1.0 (2026-08-06 릴리즈) | VERIFIED | swiperjs.com/changelog + registry.npmjs.org/swiper/latest |
| v14.0.0은 2026-06-26 릴리즈이며 v13은 릴리즈되지 않음(스킵) | VERIFIED | swiperjs.com/blog/swiper-v14 + GitHub CHANGELOG.md("We skipped v13") + /blog/swiper-v13 404 |
| v14는 TypeScript 전면 재작성 — 타입을 런타임 소스에서 tsc로 생성 | VERIFIED | swiperjs.com/blog/swiper-v14 + GitHub CHANGELOG.md |
| v14 브라우저 baseline: Chrome/Edge 110+, Safari 16.4+(iOS 16.4+), Firefox 110+ | VERIFIED | swiperjs.com/blog/swiper-v14 + GitHub CHANGELOG.md |
| v12 → v14 업그레이드는 옵션·이벤트·메서드·모듈 import 변경 없음 | VERIFIED | swiperjs.com/blog/swiper-v14 + swiperjs.com/changelog |
| v14에서 `ssr-window` 제거 — 런타임 의존성 0, 번들 2~4% 축소 | VERIFIED | swiperjs.com/blog/swiper-v14 + registry.npmjs.org(의존성 없음) |
| v12.0.0(2025-09-11)에서 SCSS/LESS 소스 제거 → CSS-only (`swiper/scss` 경로 무효) | VERIFIED | swiperjs.com/blog/swiper-v12 + GitHub CHANGELOG.md |
| v12에서 네비게이션 아이콘이 폰트 → 인라인 SVG로 변경, `navigation.addIcons`(기본 true) 제공 | VERIFIED | swiperjs.com/blog/swiper-v12 + swiperjs.com/swiper-api |
| navigation CSS 변수: `--swiper-navigation-size/-top-offset/-sides-offset/-color` | VERIFIED | swiperjs.com/swiper-api + swiperjs.com/blog/swiper-v12(CSS 변수 테마) |
| `snapToSlideEdge`는 v12.1.0(2026-01-28) 추가, 소수·auto slidesPerView에만 적용되고 loop·centered에서 무시 | VERIFIED | swiperjs.com/changelog + swiperjs.com/swiper-api |
| v14.1.0에서도 `swiper/react`가 유지되고 SwiperRef·SwiperProps·useSwiper·useSwiperSlide·SwiperClass export | VERIFIED | swiperjs.com/react(v14.1.0) + swiperjs.com/types/modules/swiper-react(v14.1.0) |
| v14는 Node.js >= 20.19.0을 요구한다 | DISPUTED → 수정 반영 | 블로그·CHANGELOG는 "개발·빌드 툴체인 기준"으로 명시하나, npm registry의 published `engines.node`는 여전히 >= 4.7.0. 소비자 런타임 요구로 오해될 수 있어 SKILL.md에 "로컬 툴체인·빌드 환경 기준"이라는 `> 주의:` 표기로 수정 반영 |

> 참고: `virtual.slidesPerViewAutoSlideSize`(v12.0.0 추가)는 swiper-api 페이지 fetch에서 항목이 노출되지 않았으나, v12 블로그 + 공식 레포 도입 커밋 2개 소스로 확인되어 마이그레이션 표에만 "v12 추가 항목"으로 기재하고 사용 예시는 싣지 않았다.

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-11
**수행자**: skill-creator(본 최신화 세션) — SKILL.md 갱신본 기준 실전 질문 답변 검증
**수행 방법**: 갱신된 SKILL.md만 근거로 실전 질문 3개에 답변 → 공식 문서와 대조

Q1. "Swiper 11에서 14로 올리려는데 뭘 고쳐야 하나?" — PASS
 근거: SKILL.md "마이그레이션 노트 (v11 → v14)" 체크리스트가 ① `swiper/scss` → `swiper/css` 교체, ② SCSS 변수 → CSS 커스텀 프로퍼티, ③ SVG 아이콘 전환에 따른 화살표 CSS 재작성, ④ 브라우저 baseline 확인, ⑤ 타입 체크 재실행, ⑥ `loopedSlides` → `loopAdditionalSlides`를 순서대로 제시. "v12 → v14는 코드 변경 불필요"까지 구분되어 오작업을 막음.

Q2. "iOS 15까지 지원해야 하는 서비스인데 Swiper 최신으로 올려도 되나?" — PASS
 근거: SKILL.md "브라우저 baseline (v14 breaking change)" 표가 Safari 16.4+(iOS 16.4+)를 명시하고 "범위 밖이면 v14로 올리지 말고 v12에 머무릅니다"로 결론을 강제. 설치 섹션의 `npm install swiper@12` 명령까지 연결됨.

Q3. "네비게이션 화살표를 커스텀 아이콘으로 바꾸고 크기도 키우고 싶다" — PASS
 근거: SKILL.md "기본 네비게이션 화살표 아이콘 (v12+ SVG)" 섹션이 `navigation={{ addIcons: false }}`로 기본 SVG 삽입을 끄고 직접 마크업을 넣는 경로와, `--swiper-navigation-size` 등 CSS 변수로 크기·색상을 조정하는 경로를 모두 제시. v11 시절의 `::after { font-size }` 패턴이 더 이상 동작하지 않는다는 경고 포함.

agent content test: 3/3 PASS

**보완 조치**: Q3 검증 중 `references/REFERENCE.md`의 "CSS 커스터마이징" 예시가 v11 시절의 `.swiper-button-next::after { font-size: 20px }`(폰트 아이콘 전제)를 그대로 두고 있어 v12+에서 무효임을 확인 → CSS 커스텀 프로퍼티 기반 예시로 교정 완료.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (Swiper 14.1.0 기준 재검증) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS) |
| **최종 판정** | **APPROVED** |

> 판정 근거: 라이브러리 사용법 스킬이므로 `verification-policy.md`의 "실사용 검증이 필요 없는 스킬 — content test PASS = APPROVED" 카테고리에 해당. 다만 SKILL.md의 마이그레이션 노트 섹션은 실제 업그레이드 수행으로만 최종 확인 가능하므로 아래 개선 항목에 실환경 검증 대기로 남긴다.

---

## 7. 개선 필요 사항

- [✅] Swiper 14.1.0 기준 최신화 — 버전·baseline·v12/v14 breaking change 반영 (3개 메이저 지연 해소)
- [✅] v12 SCSS 제거·SVG 네비게이션 아이콘 반영 (v2 검증 시 "정식 가이드 공개 시 반영" 항목이었음)
- [✅] REFERENCE.md의 폰트 아이콘 전제 CSS 예시 교정
- [🔬] v11 → v14 실제 업그레이드 실환경 검증 (마이그레이션 체크리스트 6항목 적용 결과) — 대기
- [🔬] React 19 + Swiper 14 조합 실사용 검증 — 대기
- [📅] 차기 메이저(v15) 릴리즈 시 baseline·타입 변경 재확인

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성 — Swiper 11.x 학습 데이터 기반 (WebSearch 미사용) | skill-creator |
| 2026-04-20 | v2 | WebSearch로 공식 문서 직접 재조사·재작성 — SwiperRef/SwiperClass 타입 분리, useSwiper 훅 추가, loopedSlides 제거 반영, Swiper 12 지원 여부 확인, EffectFade slidesPerView 주의사항 추가, DISPUTED 항목 재검토 | Claude (WebSearch) |
| 2026-04-20 | v2 | PENDING_TEST → APPROVED 전환 — WebSearch 교차 검증 3개 클레임 VERIFIED, 테스트 질문 2건 PASS, 테스트 케이스 3건 기록 | Claude (WebSearch 검증) |
| 2026-08-11 | v3 | **Swiper 14.1.0 기준 최신화 (11.x → 14.x, 3개 메이저 지연 해소)** — 브라우저 baseline 섹션 신설, v12 CSS-only·SVG 네비게이션 아이콘(addIcons)·navigation CSS 변수·snapToSlideEdge 추가, v14 타입 엄격화 주의 추가, "마이그레이션 노트 (v11 → v14)" 섹션 신설, Node 20.19 요구를 툴체인 기준으로 정정(DISPUTED 반영), REFERENCE.md 폰트 아이콘 CSS 예시 교정. 12개 클레임 교차 검증(VERIFIED 11 / DISPUTED 1), content test 3/3 PASS로 APPROVED 유지 | Claude (WebSearch + WebFetch) |
