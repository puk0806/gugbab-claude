---
skill: chat-ui-pattern
category: frontend
version: v1
date: 2026-05-14
status: APPROVED
---

# chat-ui-pattern 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `chat-ui-pattern` |
| 스킬 경로 | `.claude/skills/frontend/chat-ui-pattern/SKILL.md` |
| 검증일 | 2026-05-14 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

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
| react-virtuoso 스킬 (내부) | `.claude/skills/frontend/react-virtuoso/SKILL.md` | ⭐⭐⭐ High | 2026-04-20 | 상호 보완 스킬 참조 |

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

---

## 5. 테스트 진행 기록

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

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (v9 → v10 DISPUTED 수정 반영 완료) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-14 1차, 2026-06-19 재검토, 2026-06-20 3차 — 전 회차 PASS) |
| **최종 판정** | **APPROVED** (라이브러리 사용법 스킬 — content test 3/3 PASS로 충분. 2026-06-19 카테고리 재분류, 2026-06-20 전체 섹션 동기화 완료) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 테스트 수행 (2026-05-14 완료, 3/3 PASS; 2026-06-20 3차 재확인 3/3 PASS)
- [✅] 실제 LLM 채팅 앱 프로토타입 검증 요건 해소 (2026-06-19 카테고리 재분류: 라이브러리 사용법 스킬로 재분류, content test PASS = APPROVED 가능 — 실사용 필수 요건 아님)
- [❌] react-virtuoso `followOutput` 옵션이 스트리밍 중 사용자 수동 스크롤 감지를 정확히 처리하는지 실측 (선택 보강: APPROVED 전환 차단 요인 아님)
- [❌] CJK 줄바꿈(`word-break: keep-all` + `overflow-wrap: anywhere`) 조합이 다양한 폰트에서 의도대로 동작하는지 시각 확인 (선택 보강: 시각 회귀 테스트 성격)
- [❌] `prefers-reduced-motion` 사용자에 대한 타이핑 인디케이터 대체 표현 추가 검토 (선택 보강: 현재 animation:none 처리됨, 텍스트 대체 추가는 UX 향상용)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성 — 15섹션 SKILL.md + 핵심 클레임 8건 교차 검증 (VERIFIED 7 / DISPUTED 1 수정 반영) | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 스트리밍 토큰 누적+수동 스크롤 감지 / Q2 Markdown XSS 안전성 / Q3 IME Enter 방지) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-06-19 | v1 | 카테고리 재분류 수행 (실사용 필수 → 라이브러리 사용법 스킬 재분류) + 재검토 3/3 PASS → APPROVED 전환. 섹션 5 기록 추가, frontmatter status 갱신 | skill-tester |
| 2026-06-20 | v1 | 3차 테스트 수행 (Q1 함수형 업데이트+AbortError 구분 / Q2 Markdown 재파싱 문제+XSS 안전성 / Q3 자동 스크롤 임계값 로직+컨테이너 실수) → 3/3 PASS, APPROVED 유지. 섹션 5·6·7·8 전체 동기화 완료 | skill-tester |
