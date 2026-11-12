---
name: pwa-push-notifications
description: PWA 웹 푸시 최신 변경점과 함정 — web-push 4.0.0 ESM 전용·default export 없음, VAPID subject localhost 금지(Apple 403 BadJwtToken), iOS 16.4+ 홈 화면 PWA 한정 조건과 무시되는 옵션, Declarative Web Push(iOS 18.4+/Safari 18.5+), Notification Triggers 미출시, openWindow·renotify·userVisibleOnly·410 처리 함정
---

# PWA Push Notifications (Web Push API)

> 소스:
> - https://developer.mozilla.org/en-US/docs/Web/API/Push_API
> - https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe
> - https://developer.mozilla.org/en-US/docs/Web/API/Notification
> - https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
> - https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclick_event
> - https://developer.mozilla.org/en-US/docs/Web/API/Clients/openWindow
> - https://web.dev/articles/push-notifications-permissions-ux
> - https://github.com/web-push-libs/web-push (v4.0.0, 2026-11-06 — ESM 전용)
> - https://www.npmjs.com/package/web-push
> - https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
> - https://webkit.org/blog/16535/meet-declarative-web-push/ (Declarative Web Push, §3-1)
> - https://developer.chrome.com/docs/web-platform/notification-triggers (§4)
> 검증일: 2026-11-09 (최초 2026-05-15, §8-1 Declarative Web Push 보강: 2026-09-17 · 11-09 재검증: web-push 4.0.0 ESM 전용·default export 없음 반영, VAPID subject localhost 금지, badge 크기·Notification Triggers 상태 정정)

---

## 이 스킬의 범위

웹 푸시에서 **최근 바뀐 서버 라이브러리·플랫폼 조건과 실측 함정**만 다룬다.

> 기본 사용법(구독 → 서버 저장 → VAPID 서명 발송 → SW `push`/`notificationclick` 흐름, `PushManager.subscribe`·`showNotification` 예제, 알림 옵션 표, Double Opt-in 권한 UX 코드, 구독 해지 코드)은 공식 문서 수준이라 싣지 않는다.

---

## 1. 서버 — `web-push` 4.0.0

> 주의 — **web-push 4.0.0(2026-11-06)은 ESM 전용**(`"type": "module"`)이고 **default export가 없다**(named export만: `setVapidDetails`·`sendNotification`·`generateVAPIDKeys`·`WebPushError` 등). 3.x 예제의 `import webpush from 'web-push'`는 4.x에서 실패하므로 `import * as webpush from 'web-push'` 또는 named import를 쓴다. CommonJS `require('web-push')`는 `require(esm)`을 지원하는 Node(20.19+/22.12+ 등 현행 LTS)에서만 동작한다(메인테이너 ESM 전환 풀 리퀘스트 설명 — https://github.com/web-push-libs/web-push/pull/961). `engines`는 여전히 `node >= 16`이라 설치 단계에서 막히지 않으니 주의.

```js
// web-push 4.x, ESM
import * as webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@example.com', // 실제 연락 가능한 mailto:/https: URI — localhost 금지
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

try {
  await webpush.sendNotification(subscription, JSON.stringify(payload), { TTL: 60 * 60 * 24 });
} catch (err) {
  // 410 Gone / 404 Not Found → 구독 만료, DB에서 endpoint 삭제
  if (err.statusCode === 410 || err.statusCode === 404) await deleteByEndpoint(subscription.endpoint);
  else throw err;
}
```

> 주의: VAPID `subject`는 실제로 연락 가능한 `mailto:`/`https:` URI여야 한다. web-push README(4.0.0)는 `mailto:user@localhost` 같은 로컬 placeholder를 쓰면 **Apple Push가 `403 BadJwtToken`으로 거부할 수 있다**고 경고한다.
>
> 주의: **VAPID 비공개키를 분실하면 기존 구독자 전원 재구독 필요.** 1Password·KMS 등에 별도 보관하고 키 로테이션 정책을 정의한다. 키 생성은 `npx web-push generate-vapid-keys`(비공개키는 Git 커밋 금지).

페이로드 암호화는 `web-push`가 자동 처리한다 — 수동 구현 금지.

---

## 2. 클라이언트·SW 함정

> 주의: `userVisibleOnly: true`는 Chrome·Edge에서 **필수**이며 누락 또는 `false`이면 `subscribe()`가 reject된다. Firefox도 같은 정책을 적용한다.

> 주의: `notificationclick` 이벤트 핸들러 **밖**에서 `clients.openWindow()`를 호출하면 `InvalidAccessError`. 반드시 이벤트 콜백 안에서, `event.waitUntil(...)`로 감싸야 한다.

- `applicationServerKey`는 BufferSource를 요구 — Base64URL VAPID 공개키를 Uint8Array로 변환해 넘긴다.
- `renotify: true`인데 `tag`가 비어 있으면 TypeError.
- `badge`는 Android·Chrome 상태바용 단색 아이콘(Android 약 96×96, 자동으로 실루엣 마스킹 — MDN).
- 권한은 첫 진입 즉시 요청 금지 — Chrome은 3번 dismiss하면 자동 차단. 맥락 있는 시점에 앱 자체 UI로 사전 동의 → 사용자 제스처 안에서 `Notification.requestPermission()`. 설정 화면에 끄기 토글이 없으면 사용자는 브라우저 단에서 영구 차단한다.
- HTTP에서는 SW·Push 둘 다 불가(localhost 또는 HTTPS).
- `injectManifest` 전략으로 커스텀 SW에 `push`·`notificationclick` 핸들러를 추가하는 것이 일반적인 통합 흐름이다.

---

## 3. iOS Safari 16.4+ 특별 조건

| 항목 | 조건 |
|------|------|
| **OS 버전** | iOS/iPadOS 16.4 이상 |
| **설치 형태** | **반드시 "홈 화면에 추가"로 설치한 PWA만** 지원. Safari 브라우저 안에서는 **불가** (`Notification` 미정의/무반응) |
| **권한 트리거** | 사용자 탭(click) 이벤트 *동기* 컨텍스트에서만 `Notification.requestPermission` 호출 가능 |
| **manifest.json** | `display: "standalone"` 또는 `"fullscreen"` 필요(둘 다 홈 화면 웹앱 요건 충족 — WebKit 공식 블로그) |
| **무시되는 옵션** | `icon`(앱 아이콘 강제), `tag`(매번 새 알림), `actions`(액션 버튼 없음) |
| **Service Worker** | 일반 SW 동작하지만 백그라운드 실행 제한 있음 |

iOS이면서 `matchMedia('(display-mode: standalone)')`가 거짓이면 "공유 → 홈 화면에 추가 후 아이콘으로 다시 열기" 안내를 띄우고, standalone 모드에서만 권한을 시도한다. macOS Safari는 16.1+ 지원(actions 제한).

### 3-1. Declarative Web Push (iOS 18.4+ / Safari 18.5+) — 선택

> 소스: https://webkit.org/blog/16535/meet-declarative-web-push/ · 검증일: 2026-09-17

Service Worker 없이도 알림을 띄우는 WebKit 전용 확장. 푸시 본문을 아래 JSON으로 보내면 브라우저가 직접 알림을 표시한다.

```json
{
  "web_push": 8030,
  "notification": {
    "title": "아침 알림",
    "body": "오늘의 첫 리마인더입니다",
    "navigate": "https://example.com/today"
  }
}
```

- `"web_push": 8030`은 선언형 파싱을 켜는 고정 매직 값. `title`(비어 있지 않아야 함)과 `navigate`(클릭 시 열 URL)는 필수
- 구독은 SW 없이 `window.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`로 가능
- SW가 있으면 `push` 이벤트에 제안된 알림이 함께 전달되고, 핸들러가 다른 알림을 띄우면 그것이 우선. 핸들러가 실패하면 선언형 알림이 폴백으로 표시됨
- 구형 브라우저는 같은 JSON을 일반 payload로 받아 SW `push` 핸들러가 처리하므로, **서버는 이 형식 하나로 신·구 브라우저를 모두 커버**할 수 있다
- 지원: iOS/iPadOS 18.4+ 홈 화면 웹앱, macOS Safari 18.5+. Chrome·Firefox는 미지원(일반 push 경로로 동작)

> 주의: 기존 SW 기반 흐름을 대체하는 것이 아니라 보완이다. 크로스 브라우저 앱은 SW 경로를 유지하고 payload만 위 형식으로 통일하는 것이 안전하다.

---

## 4. 예약 알림 — Notification Triggers 쓰지 말 것

정해진 시각 알림(예: 매일 밤 리마인더)은 서버 측 크론으로 발송한다. 클라이언트 측 `Notification Triggers`(`showTrigger`/`TimestampTrigger`)는 Chrome origin trial만 끝났고 정식 출시되지 않았다(Chrome 문서 상태: Launch "Not started", 플래그로만 시험 가능) — 프로덕션에 쓰지 않는다.

---

## 5. 흔한 함정

| 함정 | 증상 | 해결 |
|------|------|------|
| iOS Safari 브라우저에서 권한 요청 | `Notification` 정의되지 않음 / 무반응 | 홈 화면 추가 PWA 안내 표시 후 standalone 모드에서만 시도 |
| `userVisibleOnly` 누락 | `subscribe()` reject | 항상 `true` 명시 |
| VAPID 비공개키 분실 | 신규 발송 불가, 전 구독 폐기 | KMS·1Password에 보관, 키 로테이션 절차 사전 정의 |
| `tag` 없이 `renotify: true` | TypeError | renotify 사용 시 tag 필수 |
| `notificationclick` 밖에서 `openWindow` | `InvalidAccessError` | 이벤트 핸들러 내부에서만 호출, `event.waitUntil()`로 감쌈 |
| 410 Gone 응답 무시 | 만료된 구독에 계속 발송 시도 | 410/404 시 DB에서 endpoint 삭제 |
| 페이지 진입 즉시 권한 요청 | dismiss 누적 → 영구 차단 | Double Opt-in 패턴, 가치 제안 후 사용자 제스처에서 요청 |
| 알림 끄기 UI 없음 | 사용자가 브라우저 단에서 영구 차단 | 설정에 토글 + `pushManager.getSubscription().unsubscribe()` |
| HTTP에서 테스트 | Service Worker·Push 둘 다 불가 | localhost 또는 HTTPS 필수 |
| 페이로드 암호화 누락 | Push 서비스가 거부 | `web-push` 사용 시 자동 처리, 수동 구현 금지 |
| web-push 4.x에 `import webpush from 'web-push'` | `does not provide an export named 'default'` | `import * as webpush from 'web-push'` (4.0.0부터 ESM 전용·named export) |
| VAPID subject에 `mailto:...@localhost` | Apple Push `403 BadJwtToken` | 실제 연락 가능한 mailto:/https: URI |
| iOS에서 `tag`로 중복 알림 교체 기대 | iOS는 `tag` 무시 — 매번 새 알림 | 빈도 자체를 서버에서 제한 |
| 과도한 알림 빈도 | 사용자가 OS 단에서 차단 | 일일 1~2건 상한, 사용자 설정 가능 시간대 |
