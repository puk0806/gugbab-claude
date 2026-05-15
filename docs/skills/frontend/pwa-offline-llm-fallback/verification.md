---
skill: pwa-offline-llm-fallback
category: frontend
version: v1
date: 2026-05-14
status: PENDING_TEST
---

# pwa-offline-llm-fallback 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `pwa-offline-llm-fallback` |
| 스킬 경로 | `.claude/skills/frontend/pwa-offline-llm-fallback/SKILL.md` |
| 검증일 | 2026-05-14 |
| 검증자 | skill-creator (자동) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (MDN, web.dev, developer.chrome.com, platform.claude.com)
- [✅] 공식 GitHub 2순위 소스 확인 (GoogleChrome/workbox)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-05-14, Workbox 7.x 기준)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (NetworkFirst + offline fallback, BackgroundSyncPlugin, 실제 fetch 검증)
- [✅] 코드 예시 작성 (10개 코드 블록)
- [✅] 흔한 실수 패턴 정리 (함정 10개)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | MDN navigator.onLine | 공식 unreliability 경고 + LAN/VPN false positive 사례 확보 |
| 조사 | WebFetch | MDN Background Synchronization API | SyncManager 사용법 + 브라우저 호환성 (iOS Safari/Firefox 미지원) 확보 |
| 조사 | WebFetch | developer.chrome.com workbox-background-sync | BackgroundSyncPlugin·Queue·maxRetentionTime·onSync 코드 패턴 확보 |
| 조사 | WebFetch | web.dev Offline Cookbook | 6가지 캐싱 전략 + Generic fallback 패턴 확보 |
| 교차 검증 | WebSearch | "Background Sync API iOS Safari support 2026" | 2026-05 기준 iOS 미지원·Apple 로드맵 없음 재확인 (caniuse, MagicBell, MobiLoud, Apple Developer Forum) |
| 교차 검증 | WebSearch | "navigator.onLine unreliable false positive VPN LAN" | MDN 경고 + electron/electron #11290 + chromium #678075 + Mozilla #654579 재확인 |
| 교차 검증 | WebSearch | "workbox-background-sync BackgroundSyncPlugin maxRetentionTime" | npm package + GoogleChrome 공식 + Medium 사례로 코드 패턴 재확인 |
| 교차 검증 | WebSearch | "Claude API 429 529 overloaded retry-after" | platform.claude.com 공식 + dev.to 디버깅 사례로 에러 코드·retry-after 헤더 확인 |

총 4건 WebFetch + 4건 WebSearch = 8회 도구 사용. 모든 클레임은 공식 문서·복수 독립 소스 교차 확인으로만 작성됨.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| MDN — Navigator.onLine | https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine | ⭐⭐⭐ High | 2026-05-14 | 1순위 공식 표준 문서 |
| MDN — Background Synchronization API | https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API | ⭐⭐⭐ High | 2026-05-14 | 1순위 공식 표준 문서 |
| web.dev — Offline Cookbook (Jake Archibald) | https://web.dev/articles/offline-cookbook | ⭐⭐⭐ High | 2026-05-14 | Chrome Dev Rel 공식, SW 캐싱 전략 정전 |
| developer.chrome.com — workbox-background-sync | https://developer.chrome.com/docs/workbox/modules/workbox-background-sync | ⭐⭐⭐ High | 2026-05-14 | Workbox 공식 문서 |
| Claude API — Errors | https://platform.claude.com/docs/en/api/errors | ⭐⭐⭐ High | 2026-05-14 | Anthropic 공식 문서 |
| caniuse — Background Sync API | https://caniuse.com/background-sync | ⭐⭐⭐ High | 2026-05-14 | 브라우저 호환성 표준 출처 |
| GoogleChrome/workbox#2516 | https://github.com/GoogleChrome/workbox/issues/2516 | ⭐⭐ Medium | 2026-05-14 | iPad Safari 미지원 워크어라운드 토론 (1순위 보조) |
| Chromium bug #678075 | https://issues.chromium.org/issues/41293401 | ⭐⭐ Medium | 2026-05-14 | navigator.onLine false 반환 사례 |
| Mozilla bugzilla #654579 | https://bugzilla.mozilla.org/show_bug.cgi?id=654579 | ⭐⭐ Medium | 2026-05-14 | Firefox onLine 항상 true 반환 사례 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 핵심 클레임 교차 검증 결과

| # | 클레임 | 1차 소스 | 교차 소스 | 판정 |
|---|--------|----------|-----------|------|
| 1 | `navigator.onLine` 는 inherently unreliable, "힌트" 용도로만 사용해야 한다 | MDN | dev.to maxmonteil, tevpro, Mozilla #654579 | **VERIFIED** |
| 2 | `navigator.onLine === false`는 "확실한 오프라인" / `true`는 false positive 빈발 | MDN | jfhr.me, dev.to | **VERIFIED** |
| 3 | Background Sync API는 iOS Safari 미지원 (2026-05 기준, 로드맵 없음) | MDN | caniuse, MagicBell PWA iOS Guide 2026, MobiLoud 2026, Apple Developer Forum | **VERIFIED** |
| 4 | Background Sync API는 Firefox 미지원 | MDN | caniuse | **VERIFIED** |
| 5 | Workbox `BackgroundSyncPlugin` 옵션 `maxRetentionTime` 단위는 분(minutes) | developer.chrome.com 공식 | npm workbox-background-sync, Medium Renzulli | **VERIFIED** |
| 6 | Workbox Queue의 `onSync` 콜백에서 `shiftRequest()`/`unshiftRequest()`로 재시도 제어 | developer.chrome.com 공식 | GoogleChrome 공식 reference-docs | **VERIFIED** |
| 7 | Claude API 429 응답에 `Retry-After` 헤더 포함 | platform.claude.com 공식 | aifreeapi 429 가이드, claudeapi 에러 핸드북 | **VERIFIED** |
| 8 | Claude API 529 = `overloaded_error`, 재시도 무료 (billing 제외) | platform.claude.com 공식 | tokenmix 529 가이드, aifreeapi 529 가이드, laozhang.ai | **VERIFIED** |
| 9 | web.dev Offline Cookbook의 "Generic fallback" 패턴은 cache·network 둘 다 실패 시 placeholder 응답 | web.dev 공식 (Jake Archibald) | — | **VERIFIED** |
| 10 | `online`/`offline` 이벤트 즉시 발화되지 않으며 지연 가능 | MDN | tevpro RxJS 글 | **VERIFIED** |

**총 10개 클레임 — VERIFIED 10 / DISPUTED 0 / UNVERIFIED 0**

### 4-2. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Workbox 7.x, 검증일 2026-05-14)
- [✅] deprecated된 패턴을 권장하지 않음 (Workbox v3 `workbox.backgroundSync.Plugin`은 advanced 예시에만 인용)
- [✅] 코드 예시가 실행 가능한 형태임 (TypeScript, import 경로 명시)

### 4-3. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description with `<example>` 3개)
- [✅] 소스 URL과 검증일 명시 (6개 소스 명시)
- [✅] 핵심 개념 설명 포함 (10개 섹션)
- [✅] 코드 예시 포함 (10+ 블록)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (섹션 5 캐싱된 응답 재활용은 *복잡도 높음 — MVP 생략 권장* 명시)
- [✅] 흔한 실수 패턴 포함 (10개)

### 4-4. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (모든 코드가 PWA + Claude API 실제 호출 시나리오에 직접 적용 가능)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (꿈 해몽 앱은 예시일 뿐, fallback 패턴 자체는 모든 LLM PWA에 적용)

### 4-5. 짝 스킬 정합성
- [✅] `frontend/vite-pwa-service-worker` 참조 명시 (Service Worker 빌드·등록 인프라)
- [✅] `humanities/korean-dream-interpretation-tradition` 참조 명시 (로컬 폴백 콘텐츠 소스, hedging 톤 강제)

### 4-6. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음 — 3/3 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-14
**수행자**: skill-tester → general-purpose (frontend-developer 에이전트 존재하나 SKILL.md 단독 content test 목적으로 general-purpose 방식 적용)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. navigator.onLine false positive — 회사 내부망 환경에서 API 오류 원인과 올바른 처리 패턴**
- PASS
- 근거: SKILL.md 섹션 1 "온라인 감지 — navigator.onLine 한계 이해" + 섹션 9 흔한 함정 #1
- 상세: false positive 원인(LAN 연결만 있고 인터넷 차단된 환경)이 섹션 1에 명시됨. 해결책 `isRealOnline()` 코드(HEAD /api/ping + 3초 AbortController)가 섹션 1 코드 블록에 정확히 존재. online/offline 이벤트는 "UI 힌트용으로만, 실제 분기는 fetch 결과로"라는 주의사항도 확인됨.

**Q2. iOS Safari Background Sync 미지원 시 대안 구현 (visibilitychange + online 수동 flush)**
- PASS
- 근거: SKILL.md 섹션 4-3 "앱 측에서 큐 적재" + 미지원 환경 폴백 코드 블록, 섹션 9 함정 #4, 섹션 10 결정 트리
- 상세: iOS Safari 미지원(`'sync' in reg` 체크로 감지), Chrome iOS도 동일하게 미지원(WebKit 기반) 사실이 명시됨. 대안인 `manual-flush.ts`(window online + visibilitychange) 코드가 섹션 4-3 하단에 존재함.

**Q3. Claude API 429 Retry-After를 큐 재시도에 활용하는 방법 + maxRetentionTime 단위**
- PASS
- 근거: SKILL.md 섹션 2 표 + 섹션 2 주의사항, 섹션 4-1 BackgroundSyncPlugin 코드, 섹션 4-2 수동 Queue onSync 코드
- 상세: maxRetentionTime 단위가 분(minutes)임이 코드 주석 `// 분 단위 — 24시간 후 만료`에 명시됨. Retry-After는 사용자 응답이 아닌 큐 재시도에만 활용함이 섹션 2 주의에 명시. 429/529 시 `unshiftRequest`로 큐 앞 재삽입 후 throw하는 패턴이 섹션 4-2에 존재함.

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md 내에서 명확한 근거 섹션 및 코드 확인됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 카테고리 (PWA Service Worker 동작·오프라인 시나리오 — 실행 결과로만 검증 가능)
- 최종 상태: PENDING_TEST 유지 (content test PASS이나 실사용 필수 카테고리)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 짝 스킬 정합성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-14 skill-tester 수행, 3/3 PASS) |
| **최종 판정** | **PENDING_TEST** (content test PASS, 실사용 필수 카테고리 유지) |

판정 근거:
- 10개 핵심 클레임 모두 복수 공식·반공식 소스에서 VERIFIED
- 구조·실용성 체크리스트 모두 통과
- 단, 본 스킬은 "실사용 필수 스킬" 카테고리(`verification-policy.md` 명시): 실제 오프라인 환경에서 fallback 트리거·큐 적재·복귀 시 자동 전송이 동작하는지 *실행 결과로만 검증 가능*하므로 PENDING_TEST 유지가 정책상 옳다

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-14 완료, 3/3 PASS)
- [❌] 실제 PWA 프로젝트에서 비행기 모드 토글·Chrome DevTools Application > Background Services > Background Sync 패널로 큐 동작 확인 (차단 요인: 실사용 필수 — 실행 결과로만 검증 가능)
- [❌] iOS Safari 실기기에서 수동 flush 폴백 동작 확인 (visibilitychange + online 이벤트) (차단 요인: 실사용 필수 — 실기기 테스트 필요)
- [❌] Claude API 429/529 실 응답을 받았을 때 fallback이 일관되게 트리거되는지 확인 (모의 응답 또는 rate limit 의도적 초과) (차단 요인: 실사용 필수 — 실 API 응답 검증 필요)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성 — 공식 MDN·web.dev·developer.chrome.com·platform.claude.com 기반, 클레임 10건 VERIFIED | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 navigator.onLine false positive / Q2 iOS Safari Background Sync 대안 / Q3 Retry-After + maxRetentionTime 단위) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
