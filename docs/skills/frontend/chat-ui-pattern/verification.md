---
skill: chat-ui-pattern
category: frontend
version: v6
date: 2026-09-28
status: APPROVED
---

# chat-ui-pattern 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `chat-ui-pattern` |
| 스킬 경로 | `.claude/skills/frontend/chat-ui-pattern/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-05-14, 2026-09-26 병합·정정, 2026-09-28 재검증) |
| 검증자 | skill-creator → Claude (Sonnet 5, 2026-09-28 재검증) |
| 스킬 버전 | v6 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (react-markdown, remark-gfm, rehype-highlight, MDN scrollIntoView, MDN aria-live)
- [✅] 공식 GitHub 2순위 소스 확인 (remarkjs/react-markdown, remarkjs/remark-gfm, rehypejs/rehype-highlight)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-05-14)
  - react-markdown 10.1.0 (2025-03-07)
  - remark-gfm 4.0.1 (2025-02-10)
  - rehype-highlight 7.0.2
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (메시지 모델·버블·가상 스크롤·스트리밍·Markdown·자동 스크롤·입력·액션·에러·a11y)
- [✅] 코드 예시 작성 (TypeScript·React 함수형 컴포넌트·훅 13개 섹션)
- [✅] 흔한 실수 패턴 정리 (XSS·코드 블록·한국어 줄바꿈·이모지·stale 클로저·IME·AbortController 재사용·스트리밍 비용 8건)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | VERIFICATION_TEMPLATE.md, 기존 react-virtuoso SKILL.md | 템플릿 구조 8섹션 파악, 상호 보완 스킬 위치 확인 |
| 조사 | WebSearch | react-markdown v9/v10·remark-gfm·rehype-highlight·scrollIntoView·aria-live·AbortController·XSS safe | 공식 소스 4개 + npm/GitHub 다수 |
| 조사 | WebFetch | github.com/remarkjs/react-markdown, github.com/remarkjs/remark-gfm, MDN scrollIntoView, MDN aria-live | 버전·API 시그니처·기본 보안 동작 확인 |
| 교차 검증 | WebSearch | 핵심 클레임 7건, 독립 소스 2개 이상 | VERIFIED 6 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| react-markdown 공식 GitHub | https://github.com/remarkjs/react-markdown | ⭐⭐⭐ High | 2026-05-14 | 1순위 (v10.1.0 확인) |
| remark-gfm 공식 GitHub | https://github.com/remarkjs/remark-gfm | ⭐⭐⭐ High | 2026-05-14 | 1순위 (v4.0.1 확인) |
| rehype-highlight 공식 GitHub | https://github.com/rehypejs/rehype-highlight | ⭐⭐⭐ High | 2026-05-14 | 1순위 (v7.0.2 확인) |
| MDN — scrollIntoView | https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView | ⭐⭐⭐ High | 2026-05-14 | 표준 스펙·옵션 시그니처 |
| MDN — aria-live | https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live | ⭐⭐⭐ High | 2026-05-14 | off/polite/assertive 정의 |
| MDN — ARIA Live Regions Guide | https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions | ⭐⭐⭐ High | 2026-05-14 | 채팅 컨텍스트 패턴 |
| W3C WAI — ARIA23 role=log | https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA23 | ⭐⭐⭐ High | 2026-05-14 | role="log"의 implicit polite·atomic 정의 |
| HackerOne — Secure Markdown Rendering in React | https://www.hackerone.com/blog/secure-markdown-rendering-react-balancing-flexibility-and-safety | ⭐⭐ Medium | 2026-05-14 | XSS 안전성 교차 검증 보조 |
| Sara Soueidan — Accessible Notifications with ARIA Live Regions | https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/ | ⭐⭐ Medium | 2026-05-14 | 접근성 패턴 교차 검증 |
| react-virtuoso 스킬 (내부) | `.claude/skills/frontend/react-virtuoso/SKILL.md` | ⭐⭐⭐ High | 2026-04-20 | 상호 보완 스킬 참조 (2026-09-26 본 스킬로 병합·제거 — 당시 기록) |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (단, 사용자 요청의 "v9" 표기를 v10으로 정정 — DISPUTED 처리)
- [✅] 버전 정보가 명시되어 있음 (react-markdown 10.1.0, remark-gfm 4.0.1, rehype-highlight 7.0.2)
- [✅] deprecated된 패턴을 권장하지 않음 (`transformImageUri`/`transformLinkUri` → `urlTransform` 통합 안내)
- [✅] 코드 예시가 실행 가능한 형태임 (TypeScript·import 경로·React 18+ 가정)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (7개 1순위 소스)
- [✅] 핵심 개념 설명 포함 (도메인 모델·15개 섹션)
- [✅] 코드 예시 포함 (메시지 버블·가상 스크롤·스트리밍 훅·Markdown 렌더러·자동 스크롤·인디케이터·입력창·액션·에러·전체 조립)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (섹션 14)
- [✅] 흔한 실수 패턴 포함 (섹션 12 — 8건)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — OpenAI/Anthropic Messages API 호환 모델 사용)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14 skill-tester 1차 / 2026-06-19 skill-tester 재검토·카테고리 재분류 후 APPROVED 전환)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS × 2회)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)
- [✅] 2026-09-26 `react-virtuoso` 병합 반영분(3절 보강·REFERENCE 16절) 포함 재테스트 (frontend-developer, 3/3 PASS — endReached/startReached 방향성 확인 필요 항목 발견)
- [✅] 2026-09-26 `startReached`/`firstItemIndex` 정정 반영 후 재테스트 (frontend-developer, 3/3 PASS — 정정된 부분 겨냥 질문 포함)

---

## 4-A. 교차 검증된 핵심 클레임

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 1 | react-markdown 최신 버전은 v10.x (v9 아님) | GitHub remarkjs/react-markdown (v10.1.0 / 2025-03-07) | npm 검색 결과 (current release line v10) | **DISPUTED → 수정 반영**: 사용자 요청 "v9" 표기를 v10 기준으로 정정. 섹션 15에 v9→v10 마이그레이션 주의 추가 |
| 2 | react-markdown은 secure by default (dangerouslySetInnerHTML 미사용) | 공식 README ("Use of react-markdown is secure by default") | HackerOne blog, Strapi guide | VERIFIED |
| 3 | `defaultUrlTransform`이 javascript:/vbscript:/file: 차단 | 공식 README ("default link URI transformer acts as an XSS-filter") | HackerOne blog | VERIFIED |
| 4 | remark-gfm v4.x — tables, strikethrough, tasklists, autolinks, footnotes | 공식 GitHub (v4.0.1, 5 GFM extensions 명시) | npm remark-gfm 페이지 | VERIFIED |
| 5 | rehype-highlight v7.x — highlight.js/lowlight 기반 | 공식 GitHub readme | npm rehype-highlight 페이지 | VERIFIED |
| 6 | scrollIntoView options: behavior(auto/smooth/instant) · block(start/center/end/nearest) | MDN 공식 | caniuse.com 지원 표 (Baseline since 2020-01) | VERIFIED |
| 7 | aria-live="polite"는 graceful 시점 알림, role="log"는 implicit polite + atomic="true" | MDN aria-live | W3C WAI ARIA23 ("aria-live='polite' and aria-atomic='true' attribute values") | VERIFIED |
| 8 | AbortController는 한 번 abort 후 재사용 불가 (매 요청 새로 생성) | MDN AbortController | React 패턴 가이드 (j-labs, localcan) | VERIFIED |

요약: **VERIFIED 7건 / DISPUTED 1건 (사용자 요청 v9 → v10으로 정정 후 반영) / UNVERIFIED 0건**

### 2026-09-26 추가 교차 검증 — endReached/startReached 방향성 정정

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 9 | `initialTopMostItemIndex`로 하단(최신 메시지)에서 시작하는 채팅에서, 위로 스크롤해 과거 메시지를 prepend하는 것은 `endReached`(하단 도달)가 아니라 `startReached`(상단 도달) + `firstItemIndex` 감소가 공식 패턴 | virtuoso.dev `VirtuosoProps` 인터페이스 레퍼런스 ("firstItemIndex는 역방향 무한 스크롤 구현 시 데이터 prepend와 함께 감소시켜 사용") | GitHub `petyosi/react-virtuoso` discussions #1032 (메인테이너: 큰 초기 오프셋 값도 내부적으로만 쓰여 안전) | **DISPUTED → 수정 반영**: SKILL.md 3절·REFERENCE.md 16-3의 "과거 메시지 = `endReached`" 서술을 `startReached`로 정정, `firstItemIndex` 상태 관리 코드 추가 |
| 10 | `VirtuosoMessageList`(`@virtuoso.dev/message-list`)는 오픈소스 `Virtuoso`와 별개의 상용 라이선스(license key 필요) 패키지 | virtuoso.dev `/message-list/` 공식 페이지 ("distributed under a commercial license") | GitHub `petyosi/react-virtuoso` issue #1065 (컴포넌트 발표 공지) | VERIFIED — SKILL.md 3절에 구분 각주 추가 |

요약(추가분): **VERIFIED 1건 / DISPUTED 1건 (수정 반영) / UNVERIFIED 0건**

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-26
**수행자**: skill-tester → frontend-developer
**수행 방법**: 공식 문서 대조로 `endReached`→`startReached`/`firstItemIndex` 정정이 SKILL.md·REFERENCE.md에 반영된 뒤 재테스트. Read 후 실전 질문 3개 답변(Q1은 정정된 부분을 직접 겨냥), 근거 섹션 및 anti-pattern 회피 확인. frontend-developer에게 Read 도구만 허용하고 WebSearch·WebFetch·자기 지식 사용을 금지해 SKILL.md/REFERENCE.md 근거만으로 답하도록 제한.

### 실제 수행 테스트

**Q1. (정정된 부분 겨냥) 과거 메시지 prepend — `startReached` vs `endReached`, `firstItemIndex` 감소**
- ✅ PASS
- 근거: SKILL.md 3절 110~112행 정정 주의문, 149~158행 `handleStartReached` 코드, 180~189행 "채팅 특화 props" 표, REFERENCE.md 16-3·16-5
- 상세: `endReached`가 아니라 `startReached`를 써야 하는 이유(하단에서 시작하는 채팅에서 위로 스크롤 = 상단 도달)와, `firstItemIndex`를 prepend한 개수만큼 감소시켜야 스크롤이 튀지 않는다는 점을 정정 주의문·코드를 근거로 정확히 답변. `loadingOlderRef` 가드로 중복 호출 방지도 확인.

**Q2. 핵심 기능 — SSE 스트리밍 중단 처리(AbortController)와 에러/중단 구분**
- ✅ PASS
- 근거: SKILL.md 4절 `useChatStream` 전체 코드, 12-7절 AbortController 재사용 금지
- 상세: `controller.abort()` → `err instanceof DOMException && err.name === 'AbortError'`로 사용자 중단과 실제 에러를 구분하고, `role="status"`(중단)/`role="alert"`(에러)로 다르게 렌더링하는 근거까지 정확히 답변.

**Q3. 판단형 — `VirtuosoMessageList` 상용 라이선스 vs 오픈소스 `Virtuoso` 구분**
- ✅ PASS
- 근거: SKILL.md 21행·193행 참고 블록, REFERENCE.md 16-5 흔한 실수 표
- 상세: `VirtuosoMessageList`(`@virtuoso.dev/message-list`)는 license key가 필요한 상용 패키지이며 이 스킬이 다루는 `Virtuoso`(MIT)와 라이선스가 다르다는 점을 정확히 답변. 구체적 가격 정보는 스킬 범위 밖이라는 점도 스스로 명시.

### 발견된 gap

- `VirtuosoMessageList`의 구체적 가격·플랜 정보 미기재 — 선택 보강, 차단 요인 아님 ("license key 필요" 확인만으로 스킬 목적상 충분)
- SSE 프로토콜 실제 프레임(`data:` 접두사) 파싱 예시 부재 — 기존에 이미 식별된 gap과 동일, 선택 보강

### 판정

- agent content test: 3/3 PASS (frontend-developer, Read 외 도구 사용 금지)
- verification-policy 분류: 라이브러리·패턴 스킬 — content test PASS = APPROVED 가능 카테고리
- 최종 상태: PENDING_TEST → **APPROVED** (정정된 `startReached`/`firstItemIndex` 패턴 재테스트 통과)

---

### (참고) 직전 테스트 기록 (정정 전 — 이슈 발견 시점)

**수행일**: 2026-09-26
**수행자**: skill-tester → frontend-developer
**수행 방법**: SKILL.md·references/REFERENCE.md Read 후 실전 질문 3개 답변(구 `react-virtuoso` 스킬 병합 반영분인 SKILL.md 3절 및 REFERENCE.md 16절 react-virtuoso 고유 사용법을 겨냥한 질문 포함), 근거 섹션 및 anti-pattern 회피 확인. frontend-developer에게 Read 도구만 허용하고 WebSearch·WebFetch·자기 지식 사용을 금지해 SKILL.md/REFERENCE.md 근거만으로 답하도록 제한.

### 실제 수행 테스트

**Q1. SSE 스트리밍 훅 구현 — stale state 회피 + AbortError 구분**
- ✅ PASS
- 근거: SKILL.md "4. 스트리밍 토큰 누적 표시" 섹션, `useChatStream.ts` 전체 코드
- 상세: 함수형 업데이트로 stale closure 회피, `err instanceof DOMException && err.name === 'AbortError'`로 정상 중단/에러 구분, 전체 구현 흐름(빈 버블 선추가 → AbortController → reader 루프 → status 전환 → finally 정리)까지 정확히 답변. SSE 이벤트 파싱(`data:` 프리픽스)이 SKILL.md에 없다는 gap도 스스로 발견.

**Q2. react-virtuoso 무한 스크롤 중복 요청 + role/aria-live 미반영 + 고정 높이 성능 개선 (병합 반영분 겨냥)**
- ✅ PASS (단, 아래 정확성 확인 필요 항목 발견)
- 근거: SKILL.md "3. 메시지 리스트 가상 스크롤"의 "가상화가 무효가 되는 실수 3가지" 및 주의 문단, REFERENCE.md 16-2·16-3·16-5
- 상세: `endReached` 중복 호출 가드(`if (!loading && hasMore)`), role/aria-live 미반영 시 외부 `<div role="log" aria-live="polite">` 래핑, 고정 높이 시 `fixedItemHeight` prop까지 정확히 SKILL.md/REFERENCE.md 근거로 답변. **다만 답변 과정에서 SKILL.md 3절·REFERENCE.md 16-3이 "과거 메시지 추가 로드"를 `endReached`(하단 도달)로 설명하는데, 채팅 UI에서 과거 메시지는 통상 리스트 상단(오래된 메시지)에서 위로 스크롤 시 로드되므로 react-virtuoso의 `startReached`(상단 도달) prop이 맞을 가능성이 있다는 방향성 불일치를 에이전트가 스스로 지적함.** SKILL.md에 `startReached` 언급이 전혀 없어 이 스킬만으로는 확정 판정 불가.

**Q3. 가상 스크롤 라이브러리 선택 기준(react-virtuoso vs TanStack Virtual vs react-window) + LogLevel enum 리버스 매핑 브레이킹 체인지**
- ✅ PASS
- 근거: REFERENCE.md "16-4. 라이브러리 선택" 비교표, "16-5. 흔한 실수" 표
- 상세: 채팅=가변 높이+자동 바닥 추적 필요 → react-virtuoso가 기본 선택지라는 판단 근거를 정확히 제시. `LogLevel[0]` 리버스 매핑이 v4.18.2 breaking change로 `undefined`를 반환한다는 점과 named 접근(`LogLevel.DEBUG`) 필요성을 정확히 답변.

### 발견된 gap (SKILL.md 보강 권장 — 이번 세션에서 직접 수정하지 않음. 다른 작업자가 frontend 참조 정리 중이라 보고만)

- **[정확성 확인 필요, 우선순위 높음]** SKILL.md 3절·REFERENCE.md 16-3이 "과거 메시지 추가 로드"의 콜백으로 `endReached`(하단 도달)를 지목하는데, 채팅 UI의 일반적 메시지 순서(오래된 메시지가 상단, `initialTopMostItemIndex = messages.length - 1`로 초기 하단 정렬)를 고려하면 과거 메시지 로드는 상단 스크롤 시 발생하므로 react-virtuoso의 `startReached` prop이 맞을 가능성이 있음. SKILL.md/REFERENCE.md 어디에도 `startReached`가 언급되지 않아 이 스킬 내용만으로는 확정할 수 없음 — **공식 react-virtuoso 문서 대조 후 정정 필요 여부 판단 권장** (다른 작업자 frontend 참조 정리 종료 후 확인)
- SSE 프로토콜 이벤트 파싱(`data:` 프리픽스 등) 언급 없음, `stop()` 이후 UI에서 aborted/error 상태를 어떻게 시각적으로 구분 표시할지 예시 없음 — 선택 보강, 차단 요인 아님
- `role`/`aria-live`가 "버전에 따라 다르다"는 서술만 있고 구체적 버전 조건 미기재 — 선택 보강, 차단 요인 아님
- `LogLevel[0]` breaking change의 원인(예: const enum 변경 등) 및 공식 changelog 링크 없음 — 선택 보강, 차단 요인 아님

### 판정

- agent content test: 3/3 PASS (frontend-developer 사용 — Read 외 도구 사용 금지 지시로 SKILL.md/REFERENCE.md 근거만 사용하도록 제한)
- verification-policy 분류: 라이브러리 사용법 스킬(2026-06-19 재분류 유지) — content test PASS = APPROVED 가능 카테고리
- 최종 상태: APPROVED (단, `endReached`/`startReached` 방향성 불일치 의심 건은 별도 정확성 확인 권장 — 차단 요인은 아니나 우선 확인 권장)

---

### (참고) 이전 테스트 기록

---

### [2026-06-20] 3차 테스트 — 전체 섹션 동기화 수행

**수행일**: 2026-06-20
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 스트리밍 토큰 누적 시 함수형 업데이트 필요 이유 + AbortError 구분**
- PASS
- 근거: SKILL.md 섹션 4 "스트리밍 토큰 누적 표시" 핵심 포인트, `useChatStream.ts` catch 블록 코드
- 상세: `setMessages(prev => prev.map(...))` 함수형 업데이트의 stale closure 회피 원리 정확히 설명. `err instanceof DOMException && err.name === 'AbortError'` 판별식으로 `status: 'aborted'` vs `status: 'error'` 분기 근거 확인. anti-pattern(직접 state 참조) 회피 확인.

**Q2. 스트리밍 중 Markdown 재파싱 문제 + XSS 안전성**
- PASS
- 근거: SKILL.md 섹션 5-3 "스트리밍 중 Markdown 렌더링 전략", 섹션 5-4 "XSS 안전성"
- 상세: 전략 A(매 토큰 재파싱)의 "100 토큰/초 끊김·코드 블록 미완성" 문제 정확히 확인. 전략 B(streaming 중 plain text) 권장 근거 확인. `dangerouslySetInnerHTML` 미사용·AST 변환·위험 프로토콜 차단 보안 원리 확인. `rehype-sanitize` 필요 시나리오 3가지(urlTransform 커스텀/rehype-raw 추가/신뢰불가 출처) 정확히 확인.

**Q3. SimpleMessageList 자동 스크롤 임계값 로직 + 컨테이너 실수**
- PASS
- 근거: SKILL.md 섹션 6 "자동 스크롤 패턴", `SimpleMessageList.tsx` 코드
- 상세: `SCROLL_THRESHOLD = 100px`, `distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight` 계산식 근거 확인. `shouldAutoScroll` state + `onScroll` 핸들러 + `useEffect` 조건 분기 패턴 확인. `overflow: hidden` 실수 시 페이지 전체 튀는 anti-pattern 회피 확인.

### 발견된 gap

- 없음. 3개 질문 모두 SKILL.md 내 충분한 근거 섹션과 코드 예시 존재.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 — content test로 충분 (2026-06-19 재분류 확인)
- 최종 상태: APPROVED (유지)

---

### [2026-06-19] 재검토 — 카테고리 재분류 + APPROVED 전환

**수행일**: 2026-06-19
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인. verification-policy.md 기준으로 카테고리 재분류 수행.

**Q1. 스트리밍 토큰 누적 시 함수형 업데이트 vs 직접 state 참조 — stale state 문제**
- PASS
- 근거: SKILL.md 섹션 4 "스트리밍 토큰 누적 표시", `useChatStream.ts` 코드 및 주석
- 상세: `setMessages(prev => prev.map(...))` 함수형 업데이트 패턴 및 "클로저 stale state 회피" 설명 확인. anti-pattern(`setMessages([...messages, ...])`) 회피 확인.

**Q2. 스트리밍 중 react-markdown 렌더링 전략 A/B/C 선택 기준**
- PASS
- 근거: SKILL.md 섹션 5-3 "스트리밍 중 Markdown 렌더링 전략" 비교표 및 권장 문장
- 상세: 일반 사용자 채팅은 전략 B(스트리밍 중 plain text, 완료 후 Markdown) 권장 이유 정확 확인. A 전략의 "100 토큰/초 끊김·코드 블록 미완성" anti-pattern 회피 확인.

**Q3. 사용자 수동 스크롤 시 자동 추적 중단 구현 — shouldAutoScroll + onScroll 패턴**
- PASS
- 근거: SKILL.md 섹션 6 "자동 스크롤 패턴", `SimpleMessageList.tsx` 코드
- 상세: `shouldAutoScroll` state, `SCROLL_THRESHOLD = 100px` 계산, `onScroll` 이벤트, `useEffect` 조건 분기 모두 근거 확인.

**발견된 gap**: 없음. 3개 질문 모두 SKILL.md 내 충분한 근거 섹션 및 코드 예시 존재.

**카테고리 재분류**: 기존 테스트(2026-05-14)는 "실 채팅 앱 스트리밍·스크롤·렌더링 동작 확인 필요"로 실사용 필수 카테고리로 분류했으나, verification-policy.md 판정 기준 재검토 결과 — 본 스킬은 react-markdown·react-virtuoso·AbortController 등 **라이브러리 사용법 패턴 스킬**로서 "사용 시점의 답변 정확성만으로 검증 가능"한 카테고리에 해당. 빌드 산출물/실행 결과물로만 검증 가능한 카테고리(빌드 설정·마이그레이션·워크플로우)가 아님.

**판정**:
- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 — content test로 충분 (재분류)
- 최종 상태: PENDING_TEST → **APPROVED**

---

### [2026-05-14] 최초 테스트

**수행일**: 2026-05-14
**수행자**: skill-tester → general-purpose (frontend 도메인)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 스트리밍 토큰 누적 시 stale 클로저 방지 + 사용자 수동 스크롤 감지**
- PASS
- 근거: SKILL.md 섹션 4 "스트리밍 토큰 누적 표시", 섹션 3 "메시지 리스트 가상 스크롤", 섹션 6 "자동 스크롤 패턴", 섹션 12-5 "스트리밍 토큰 함수 인자 stale 클로저"
- 상세: `setMessages((prev) => prev.map(...))` 함수형 업데이트 패턴이 명확히 코드와 주석으로 설명됨. `atBottomStateChange` (Virtuoso) 및 `handleScroll` + `shouldAutoScroll` (직접 구현) 두 가지 패턴 모두 근거 존재. anti-pattern(`setMessages([...messages, ...])`) 명시적으로 금지됨(섹션 12-5).

**Q2. react-markdown XSS 안전성 판단 + rehype-sanitize 필요 여부**
- PASS
- 근거: SKILL.md 섹션 5-4 "XSS 안전성", 섹션 12-1 "Markdown XSS"
- 상세: `dangerouslySetInnerHTML` 미사용·AST 변환 방식·`javascript:`/`vbscript:`/`file:` 프로토콜 차단이 명시됨. `rehype-sanitize` 필요 조건 3가지(urlTransform 커스텀, rehype-raw 추가, 신뢰 불가 출처)도 정확히 기술됨. 보안 중요 도메인(금융·의료) 권장 사항까지 포함.

**Q3. 한국어 IME Enter 전송 방지 (`e.nativeEvent.isComposing`)**
- PASS
- 근거: SKILL.md 섹션 8 "메시지 입력 (자동 높이 textarea)", 섹션 12-6 "IME 조합 중 Enter 전송"
- 상세: `if (e.nativeEvent.isComposing) return;` 체크가 코드 예시에 포함되고 "필수. 빠뜨리면 한국어 입력 시 자모 완성 단계에서 메시지가 전송된다"로 두 섹션에 걸쳐 강조됨. anti-pattern(체크 누락)도 12-6에 명시.

### 발견된 gap

- 없음. 3개 질문 모두 SKILL.md 내에 충분한 근거 섹션과 코드 예시 존재.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 카테고리 (빌드 설정/워크플로우/설정+실행 아님 — 실 채팅 앱 스트리밍·스크롤·렌더링 동작 확인 필요)
- 최종 상태: PENDING_TEST 유지 (content test PASS, 실사용 검증은 별도 수행 후 APPROVED 전환)

---

> 아래는 skill-creator가 작성한 원본 테스트 케이스 예정 템플릿 (참고용 보존):

### 테스트 케이스 1: (참고)

**입력 (질문/요청):**
```
LLM 응답을 토큰 단위로 스트리밍 받으면서 사용자가 위로 스크롤하면 자동 추적을 멈추는 채팅 UI를 React로 구현해주세요.
```

**기대 결과:**
- `useState` 함수형 업데이트로 토큰 누적
- `AbortController`로 중단 가능
- `react-virtuoso`의 `followOutput` 또는 `shouldAutoScroll` state 패턴으로 사용자 의도 보존
- `role="log" aria-live="polite"`로 스크린리더 호환

### 테스트 케이스 2: (참고)

**입력:**
```
한국어 사용자가 IME로 입력 중일 때 Enter가 의도치 않게 전송되는 문제를 어떻게 막나요?
```

**기대 결과:** `e.nativeEvent.isComposing` 체크로 IME 조합 중 Enter 무시 처리

### 테스트 케이스 3: (참고)

**입력:**
```
react-markdown으로 LLM 응답을 렌더링할 때 XSS가 걱정되는데 sanitize 플러그인을 꼭 추가해야 하나요?
```

**기대 결과:**
- 기본은 안전 (dangerouslySetInnerHTML 미사용)
- `rehype-raw` 추가 또는 `urlTransform` 약화 시에만 `rehype-sanitize` 필요

---

### [2026-09-28] 재검증 — 원본 본문 사실성 위주 (병합·정정 부분 제외)

**수행일**: 2026-09-28
**수행 방법**: SKILL.md + REFERENCE.md 전체 Read → 2026-09-26 병합·정정(startReached/firstItemIndex, VirtuosoMessageList 라이선스)은 이미 재검증 완료 상태이므로 제외하고, 원본(2026-05-14) 본문의 핵심 클레임 3개를 npm registry로 1차 소스 대조.

**클레임 대조 결과**:
1. react-markdown 최신 버전 10.1.0 → VERIFIED (npm registry latest = 10.1.0, 변동 없음)
2. remark-gfm 최신 버전 4.0.1 → VERIFIED (npm registry latest = 4.0.1, 변동 없음)
3. rehype-highlight 최신 버전 7.0.2 → VERIFIED (npm registry latest = 7.0.2, 변동 없음)
4. (참고) react-virtuoso — SKILL.md는 "4.x"로만 표기해 영향 없음. REFERENCE.md 16절 상단의 구체 버전 "4.18.5"는 npm registry 확인 결과 현재 4.18.15로 패치 버전만 올라감(API 변동 없음, 정정 불필요)

**실전 질문 재검증**:
- Q1. "react-markdown v10에서 XSS 방어가 기본으로 되는가?" → SKILL.md 5-4절 "secure by default" 근거로 PASS (버전·보안 정책 모두 불변 확인)
- Q2. "긴 대화에서 과거 메시지를 로드하려면 어떤 prop을 쓰나?" → SKILL.md 3절 `startReached`+`firstItemIndex` 근거로 PASS (2026-09-26 정정 유지 확인)

**재검증 최종 판정**: 원본 본문 핵심 클레임 3건 모두 VERIFIED, 변경 없음. 패치 버전 차이(react-virtuoso 4.18.5→4.18.15)만 발견되어 status는 **APPROVED 유지**.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (v9 → v10 DISPUTED 수정 반영 완료) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-14 1차, 2026-06-19 재검토, 2026-06-20 3차 — 전 회차 PASS) + ✅ 3/3 PASS (2026-09-26 재테스트, react-virtuoso 병합 반영분 포함) + ✅ 3/3 PASS (2026-09-26 `startReached`/`firstItemIndex` 정정 반영 후 재테스트) |
| **최종 판정** | **APPROVED** (2026-09-26 `endReached`/`startReached` 방향성 정정 반영 → 재테스트 3/3 PASS로 APPROVED 확정) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 테스트 수행 (2026-05-14 완료, 3/3 PASS; 2026-06-20 3차 재확인 3/3 PASS)
- [✅] 실제 LLM 채팅 앱 프로토타입 검증 요건 해소 (2026-06-19 카테고리 재분류: 라이브러리 사용법 스킬로 재분류, content test PASS = APPROVED 가능 — 실사용 필수 요건 아님)
- [❌] react-virtuoso `followOutput` 옵션이 스트리밍 중 사용자 수동 스크롤 감지를 정확히 처리하는지 실측 (선택 보강: APPROVED 전환 차단 요인 아님)
- [❌] CJK 줄바꿈(`word-break: keep-all` + `overflow-wrap: anywhere`) 조합이 다양한 폰트에서 의도대로 동작하는지 시각 확인 (선택 보강: 시각 회귀 테스트 성격)
- [❌] `prefers-reduced-motion` 사용자에 대한 타이핑 인디케이터 대체 표현 추가 검토 (선택 보강: 현재 animation:none 처리됨, 텍스트 대체 추가는 UX 향상용)
- [✅] (2026-09-26 완료, 3/3 PASS) `react-virtuoso` 병합 반영분(3절·REFERENCE 16절) 포함 skill-tester 재테스트 → 섹션 5·6 업데이트, PENDING_TEST → APPROVED 재전환
- [✅] (2026-09-26 완료) SKILL.md 3절·REFERENCE.md 16-3의 "과거 메시지 로드 = `endReached`" 서술을 virtuoso.dev 공식 `VirtuosoProps` 레퍼런스 대조 후 `startReached` + `firstItemIndex` 감소 패턴으로 정정, 코드·표·REFERENCE.md 16-5 흔한 실수에 반영. `VirtuosoMessageList`(상용 라이선스) 구분 각주 추가. (2026-09-26 재테스트 완료, 3/3 PASS → APPROVED 전환)
- [❌] (선택 보강, 차단 요인 아님) SSE 이벤트 파싱 예시, aborted/error 상태 UI 표시 예시 보강
- [❌] (선택 보강, 차단 요인 아님) `role`/`aria-live` 미반영 버전 조건 구체화, `LogLevel[0]` breaking change 원인·changelog 링크 보강
- [❌] (선택 보강, 차단 요인 아님) `VirtuosoMessageList` 구체적 가격·플랜 정보 보강 (2026-09-26 재테스트에서 발견)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성 — 15섹션 SKILL.md + 핵심 클레임 8건 교차 검증 (VERIFIED 7 / DISPUTED 1 수정 반영) | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 스트리밍 토큰 누적+수동 스크롤 감지 / Q2 Markdown XSS 안전성 / Q3 IME Enter 방지) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-06-19 | v1 | 카테고리 재분류 수행 (실사용 필수 → 라이브러리 사용법 스킬 재분류) + 재검토 3/3 PASS → APPROVED 전환. 섹션 5 기록 추가, frontmatter status 갱신 | skill-tester |
| 2026-06-20 | v1 | 3차 테스트 수행 (Q1 함수형 업데이트+AbortError 구분 / Q2 Markdown 재파싱 문제+XSS 안전성 / Q3 자동 스크롤 임계값 로직+컨테이너 실수) → 3/3 PASS, APPROVED 유지. 섹션 5·6·7·8 전체 동기화 완료 | skill-tester |
| 2026-09-26 | v2 | **병합**: 구 `frontend/react-virtuoso` 스킬 제거(스킬 트리아지 MERGE 판정 — 타깃 사용 2파일, 채팅 사용법은 이미 본 스킬에 존재)하면서 chat-ui에 없던 virtuoso 고유분만 이관. SKILL.md 3절에 "가상화 무효 실수 3가지"(높이 미지정·List forwardRef·endReached 가드), references/REFERENCE.md 16절(컴포넌트 5종 선택표, fixedItemHeight·defaultItemHeight·heightEstimates v4.16+·minOverscanItemCount v4.17+·scrollSeek·increaseViewportBy·useWindowScroll, scrollToIndex align, react-virtuoso vs TanStack Virtual vs react-window 비교, v4.18.2 LogLevel 브레이킹). 출처: https://virtuoso.dev/react-virtuoso/ , https://github.com/petyosi/react-virtuoso (구 react-virtuoso verification.md: v4.18.5·5개 컴포넌트·followOutput·fixedItemHeight·VirtuosoGrid 고정 크기·List forwardRef VERIFIED, react-window 유지보수 중단 클레임 DISPUTED→수정, 검증일 2026-04-20, APPROVED). 3절 참조 섹션의 `.claude/skills/frontend/react-virtuoso/SKILL.md` 행은 제거된 스킬의 과거 기록. status APPROVED → PENDING_TEST | 메인 대화 (스킬 정리) |
| 2026-09-26 | v3 | 2단계 실사용 테스트 재수행 (Q1 SSE 스트리밍 stale state+AbortError 구분 / Q2 병합 반영분 — react-virtuoso 무한 스크롤 중복 요청·role/aria-live 미반영·fixedItemHeight / Q3 가상 스크롤 라이브러리 선택 기준+LogLevel 브레이킹 체인지) → 3/3 PASS, PENDING_TEST → APPROVED 전환. Q2 과정에서 `endReached`/`startReached` 방향성 확인 필요 항목 발견 — SKILL.md는 수정하지 않고 보고만 함(다른 작업자 frontend 참조 정리 중) | skill-tester |
| 2026-09-26 | v4 | Q2에서 발견된 `endReached`/`startReached` 방향성 이슈 정정: virtuoso.dev `VirtuosoProps` 공식 레퍼런스 + GitHub discussions #1032 교차 검증 후 SKILL.md 3절(코드·표·주의 문단)과 REFERENCE.md 16-3·16-5를 `startReached` + `firstItemIndex` 감소 패턴으로 수정, `VirtuosoMessageList`(상용 라이선스) 구분 각주 추가. status APPROVED → PENDING_TEST (재테스트 필요) | 메인 대화 (정정 작업) |
| 2026-09-26 | v5 | 2단계 실사용 테스트 재수행 (Q1 정정된 `startReached`/`firstItemIndex` 패턴 겨냥 / Q2 SSE 스트리밍 AbortController 중단 구분 / Q3 `VirtuosoMessageList` 상용 라이선스 판단) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-28 | v6 | 재검증(원본 본문 사실성 위주) — react-markdown/remark-gfm/rehype-highlight 버전 npm registry 재대조 전부 VERIFIED, react-virtuoso 패치 버전만 확인(4.18.5→4.18.15, 영향 없음). status APPROVED 유지 | Claude (Sonnet 5) |
| 2026-10-05 | v6.1 | frontmatter description에 채팅 외 일반 목록·테이블·그리드의 react-virtuoso 가상 스크롤(references 16절)을 명시 — 구 `frontend/react-virtuoso` 흡수 내용이 채팅 이외 상황에서 선택되지 않던 발견성 문제. 본문·사실 변경 없음, status 유지 | 메인 |
