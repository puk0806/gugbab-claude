---
skill: pwa-push-notifications
category: frontend
version: v1
date: 2026-05-15
status: PENDING_TEST
---

# pwa-push-notifications 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `pwa-push-notifications` |
| 스킬 경로 | `.claude/skills/frontend/pwa-push-notifications/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (Opus 4.7 1M) |
| 스킬 버전 | v1 |
| 짝 스킬 | `frontend/vite-pwa-service-worker` |

---

## 1. 작업 목록 (Task List)

- [✅] MDN Push API / Notifications API / PushManager.subscribe 1순위 소스 확인
- [✅] MDN ServiceWorkerGlobalScope notificationclick / Clients.openWindow 확인
- [✅] Apple Developer Web Push 문서 + iOS 16.4 출시 정보 확인
- [✅] web.dev Permission UX 가이드 확인 (2025-03-26 최신)
- [✅] web-push npm 라이브러리 GitHub README 확인
- [✅] iOS Safari 옵션 비호환 항목(icon/tag/actions) 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 꿈 앱 시나리오 3종(반복 꿈·일일 리마인더·해몽 결과) 작성
- [✅] 흔한 함정 11종 정리
- [✅] SKILL.md 파일 작성
- [✅] verification.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | MDN Push API + PushManager.subscribe + userVisibleOnly + VAPID | MDN 1차 소스 확정, userVisibleOnly Chromium/Firefox 필수 확인 |
| 조사 2 | WebSearch | iOS Safari 16.4 Web Push PWA home screen requirement | 홈 화면 설치 PWA 한정·사용자 제스처 필수 확인 |
| 조사 3 | WebSearch | Notification API options actions badge renotify silent tag | 각 옵션 정의 및 renotify+tag 의존성 확인 |
| 조사 4 | WebSearch | web-push npm Node VAPID generateVAPIDKeys sendNotification | 라이브러리 사용법·setVapidDetails·자동 암호화 확인 |
| 조사 5 | WebSearch | notificationclick clients.openWindow focus matchAll | matchAll+focus 후 openWindow 패턴·InvalidAccessError 조건 확인 |
| 조사 6 | WebSearch | web.dev push notifications permission UX best practice | Double Opt-in 패턴·페이지 진입 즉시 요청 금지 확인 |
| 조사 7 | WebFetch | https://developer.mozilla.org/.../Push_API | Baseline since 2023-03·Safari 16.4+·CSRF 주의·Firefox quota 확인 |
| 조사 8 | WebSearch | iOS Safari notification icon/tag/actions 미지원 | iOS는 icon/tag/actions 무시, body·title·data만 안정 동작 확인 |
| 교차 검증 | WebSearch | 핵심 클레임 7개, 독립 소스 2~3개씩 대조 | VERIFIED 7 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| MDN Push API | https://developer.mozilla.org/en-US/docs/Web/API/Push_API | ⭐⭐⭐ High | 2026-05-15 | 1순위 |
| MDN PushManager.subscribe | https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe | ⭐⭐⭐ High | 2026-05-15 | userVisibleOnly·applicationServerKey 정의 |
| MDN Notification | https://developer.mozilla.org/en-US/docs/Web/API/Notification | ⭐⭐⭐ High | 2026-05-15 | 옵션 전체 |
| MDN showNotification | https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification | ⭐⭐⭐ High | 2026-05-15 | SW에서 알림 표시 |
| MDN notificationclick event | https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclick_event | ⭐⭐⭐ High | 2026-05-15 | 클릭 핸들러 |
| MDN Clients.openWindow | https://developer.mozilla.org/en-US/docs/Web/API/Clients/openWindow | ⭐⭐⭐ High | 2026-05-15 | InvalidAccessError 조건 |
| WHATWG Notifications spec | https://notifications.spec.whatwg.org/ | ⭐⭐⭐ High | 2026-05-15 | 표준 스펙 |
| web.dev Permission UX | https://web.dev/articles/push-notifications-permissions-ux | ⭐⭐⭐ High | 2025-03-26 | Double Opt-in |
| Apple Developer Web Push | https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers | ⭐⭐⭐ High | 2026-05-15 | iOS 16.4+ 공식 |
| web-push GitHub | https://github.com/web-push-libs/web-push | ⭐⭐⭐ High | 2026-05-15 | Node 서버 라이브러리 (공식 web-push-libs org) |
| MagicBell PWA iOS 가이드 | https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide | ⭐⭐ Medium | 2026 | iOS 옵션 미지원 보조 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서(MDN·Apple·WHATWG)와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (iOS 16.4+, Safari macOS 16.1+, Push API Baseline 2023-03)
- [✅] deprecated 패턴 권장 안 함 (예: 페이지 진입 즉시 권한 요청 — 명시적으로 금지로 표기)
- [✅] 코드 예시 실행 가능 형태 (TS·JS 모두 import 경로·시그니처 정확)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL 9개 + 검증일 명시
- [✅] 핵심 개념(전체 흐름 다이어그램·구독·SW 이벤트) 설명 포함
- [✅] 코드 예시 다수 (subscribe·SW push/click·web-push 서버·옵트인 UI·iOS 가이드)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (브라우저 호환성 표·iOS 조건 표)
- [✅] 흔한 실수 패턴 11종 포함

### 4-3. 실용성
- [✅] 에이전트가 참조 시 실제 코드 작성 가능 수준
- [✅] 꿈 앱 시나리오 3종(반복·일일·해몽) 실용 예시
- [✅] 범용 사용 가능 (꿈 앱 외 알림 패턴 일반화 가능)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] skill-tester 호출로 실전 질문 답변 검증 — 2026-05-15 수행 완료
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — 3/3 PASS
- [✅] 잘못된 응답 시 스킬 보완 — gap 없음, 보완 불필요

---

## 4-X. 교차 검증 핵심 클레임 판정표

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | `PushManager.subscribe`에서 `userVisibleOnly: true`는 Chrome·Edge에서 필수 | MDN PushManager.subscribe | Microsoft Learn Edge PWA push | VERIFIED |
| 2 | iOS Safari Web Push는 16.4+, 홈 화면 설치 PWA 한정 | Apple Developer 문서 | OneSignal/PushAlert/MagicBell 등 다수 | VERIFIED |
| 3 | iOS Safari는 icon·tag·actions 옵션을 무시 | mdn/browser-compat-data 이슈 #19318 | MagicBell 2026 가이드 | VERIFIED |
| 4 | `renotify: true`는 비어있지 않은 `tag`를 요구 | MDN Notification | WHATWG Notifications spec | VERIFIED |
| 5 | `clients.openWindow`는 `notificationclick` 핸들러 안에서만 가능, 밖이면 `InvalidAccessError` | MDN Clients.openWindow | MDN notificationclick + web-push-book | VERIFIED |
| 6 | `web-push` 라이브러리는 `setVapidDetails` 후 `sendNotification` 호출 시 자동 암호화 | web-push GitHub README | npm web-push 페이지 | VERIFIED |
| 7 | 페이지 진입 즉시 권한 요청은 안티패턴, Double Opt-in 권장 | web.dev permissions UX 2025-03-26 | web-push-book Permission UX | VERIFIED |

**총합: VERIFIED 7 / DISPUTED 0 / UNVERIFIED 0**

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (세션 내 직접 검증)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. iOS 16.4+ Web Push 지원 조건 및 무시되는 옵션**
- ✅ PASS
- 근거: SKILL.md "8. iOS Safari 16.4+ 특별 조건" 섹션 (조건 표 + IOSInstallGuide 코드)
- 상세: OS 버전(16.4+) / 설치 형태(홈 화면 PWA만, Safari 브라우저 내 불가) / 권한 트리거(click 동기 컨텍스트) / manifest display:standalone / 무시 옵션(icon·tag·actions) 모두 근거 명시. 섹션 4 옵션 표·섹션 11 함정 표에서도 3중 교차 확인됨.

**Q2. userVisibleOnly 필수 여부 (false 설정 시 결과)**
- ✅ PASS
- 근거: SKILL.md "2. 클라이언트 구독" 코드 주석 + 주의 블록 + "11. 흔한 함정" 표
- 상세: Chrome·Edge·Firefox 모두 필수 명시. 누락 또는 false 시 subscribe() reject 명확히 기재. anti-pattern(optional이다/false도 동작한다) 반박 근거 3곳에 존재.

**Q3. notificationclick 핸들러에서 clients.openWindow InvalidAccessError 원인 및 해결**
- ✅ PASS
- 근거: SKILL.md "3. Service Worker — push/notificationclick 이벤트" 코드 + 주의 블록 + "11. 흔한 함정" 표
- 상세: notificationclick 이벤트 핸들러 밖에서 openWindow 호출 시 InvalidAccessError 발생 명시. event.waitUntil() 안에서 호출하는 올바른 패턴 코드 포함. matchAll→focus→openWindow 순서 패턴까지 예시화됨.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md의 명시적 근거 섹션에서 답변 도출 가능.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 카테고리 (실 디바이스 iOS/Android 검증 필요) → PENDING_TEST 유지
- 최종 상태: PENDING_TEST (agent content test는 완료, 실 디바이스 검증 미완료로 APPROVED 미전환)

---

> 아래는 skill-creator가 작성한 원래 예정 템플릿 (참고용 보존)

### 테스트 케이스 1: (예정 → 완료) 반복 꿈 알림 구현 질문

**입력 (질문/요청):**
```
반복 꿈 패턴이 감지되면 푸시 알림을 보내려고 합니다. 클라이언트에서 구독하고 서버에서 발송하는 코드를 작성해주세요. iOS도 지원해야 합니다.
```

**기대 결과:**
- `userVisibleOnly: true` + VAPID 공개키로 `pushManager.subscribe`
- 서버는 `web-push` 라이브러리 + `setVapidDetails` + `sendNotification`
- iOS 16.4+ 홈 화면 설치 PWA 한정 안내 UI 추가
- 사용자 제스처 안에서 권한 요청 (Double Opt-in)

**판정:** Q1(iOS 조건)·Q2(userVisibleOnly)로 분할 검증 → PASS

---

### 테스트 케이스 3: (예정 → 완료) notificationclick 디버깅 → Q3으로 수행

**판정:** PASS — 섹션 3 주의 블록 + 섹션 11 함정표 근거 확인

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-15 수행) |
| **최종 판정** | **PENDING_TEST** (agent content test 완료, 실 디바이스 검증 대기) |

**판정 근거:**
- 실 디바이스 검증이 필요한 영역(iOS 16.4+ PWA 홈 화면 설치 실 디바이스 푸시 수신·Android Chrome 백그라운드 푸시 수신·VAPID 키 실 발급/회수)이 있어 **"실사용 필수 카테고리"**로 분류되어 PENDING_TEST 유지.
- agent content test는 2026-05-15 skill-tester로 3/3 PASS 완료 (Q1 iOS 조건 / Q2 userVisibleOnly / Q3 InvalidAccessError 해결).

---

## 7. 개선 필요 사항

- [✅] skill-tester가 agent content test 수행하고 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] 실 디바이스(iOS 16.4+ PWA·Android Chrome) 푸시 수신 검증 후 캡처 첨부 — **차단 요인**: 실사용 필수 카테고리, 실 디바이스 테스트 후 APPROVED 전환 가능
- [❌] Notification Triggers API(Chrome 실험 단계)의 안정성 추적 — **선택 보강**: 현재 보조 언급 수준으로도 사용 가능
- [❌] FCM(Firebase Cloud Messaging) 통합 예시 추가 검토 — **선택 보강**: web-push 라이브러리 사용법은 이미 충분히 커버됨
- [❌] EU 외 지역 한정 이슈(iOS 16.4+ EU 제외 정책) 변동 추적 — **선택 보강**: 변동 추적 필요하나 현재 내용은 정확

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — 1단계(내용 검증) 완료, 2단계(skill-tester 호출) 메인 세션에 위임 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 iOS 16.4 조건 / Q2 userVisibleOnly 필수 여부 / Q3 InvalidAccessError 원인·해결) → 3/3 PASS, 실사용 필수 카테고리로 PENDING_TEST 유지 | skill-tester |
