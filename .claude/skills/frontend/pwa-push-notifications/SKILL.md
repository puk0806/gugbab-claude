---
name: pwa-push-notifications
description: Web Push API + Notifications API — PWA 푸시 알림 구현(VAPID·Service Worker push/notificationclick·iOS 16.4+ 홈 화면 설치 PWA 한정·권한 요청 UX·꿈 앱 시나리오)
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
> - https://github.com/web-push-libs/web-push
> - https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
> 검증일: 2026-05-15
> 짝 스킬: `frontend/vite-pwa-service-worker` (Service Worker 등록·precache는 그쪽 참조)

---

## 1. 전체 흐름

```
[클라이언트]                              [앱 서버]                [Push 서비스 (FCM/Mozilla 등)]
     │ ① SW 등록 + Notification.requestPermission()
     │ ② pushManager.subscribe({userVisibleOnly, applicationServerKey: VAPID 공개키})
     │ ③ PushSubscription(endpoint, keys.p256dh, keys.auth) ────────────►│ 저장
     │                                                                    │
     │                                                  ④ webpush.sendNotification(sub, payload, VAPID 비공개키 서명)
     │                                                                    └──────────────►│
     │ ⑤ SW 'push' 이벤트 ◄──── 푸시 전달 ────────────────────────────────────────────────│
     │ ⑥ self.registration.showNotification(title, options)
     │ ⑦ 'notificationclick' → clients.matchAll / openWindow
```

핵심: **클라이언트는 endpoint 등록만, 실제 전송은 항상 앱 서버가 VAPID 비공개키로 서명해 Push 서비스에 보낸다.**

---

## 2. 클라이언트 구독 — `PushManager.subscribe`

```ts
// src/lib/push/subscribe.ts
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY; // Base64URL 문자열

export async function subscribePush(): Promise<PushSubscription | null> {
  // 1) Service Worker 등록 보장 (vite-plugin-pwa가 등록한 것을 가져옴)
  const reg = await navigator.serviceWorker.ready;

  // 2) 이미 구독되어 있으면 그대로 반환
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  // 3) 권한 요청 (반드시 사용자 제스처 컨텍스트에서)
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  // 4) 구독 생성
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true, // Chromium·Firefox 모두 필수, false면 즉시 reject
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // 5) 서버로 endpoint·keys 전송
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub.toJSON()),
  });

  return sub;
}

// VAPID Base64URL → Uint8Array (subscribe()는 BufferSource를 요구)
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
```

> 주의: `userVisibleOnly: true`는 Chrome·Edge에서 **필수**이며 누락 또는 `false`이면 `subscribe()`가 reject된다. Firefox도 같은 정책을 적용한다.

---

## 3. Service Worker — `push` / `notificationclick` 이벤트

```js
// public/service-worker.js  (또는 injectManifest용 src/sw.ts)
self.addEventListener('push', (event) => {
  const payload = event.data?.json() ?? { title: '알림', body: '' };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png', // Android·Chrome 상태바용 단색 아이콘
      tag: payload.tag,             // 같은 tag면 기존 알림 교체 (iOS는 무시됨)
      renotify: !!payload.tag && payload.renotify, // tag 비어있으면 에러
      silent: false,
      data: { url: payload.url, dreamId: payload.dreamId },
      actions: payload.actions ?? [],  // iOS Safari에서는 무시됨
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/';

  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });

    // 이미 열린 창이 있으면 focus
    for (const client of allClients) {
      const url = new URL(client.url);
      if (url.pathname === targetUrl) {
        return client.focus();
      }
    }

    // 없으면 새 창 열기 (notificationclick 안에서만 가능)
    return self.clients.openWindow(targetUrl);
  })());
});
```

> 주의: `notificationclick` 이벤트 핸들러 **밖**에서 `clients.openWindow()`를 호출하면 `InvalidAccessError`. 반드시 이벤트 콜백 안에서, `event.waitUntil(...)`로 감싸야 한다.

---

## 4. 알림 옵션 — Notification·showNotification

| 옵션 | 설명 | 비고 |
|------|------|------|
| `title` | 알림 제목 (1번째 인자) | 모든 플랫폼 지원 |
| `body` | 본문 텍스트 | 모든 플랫폼 지원 |
| `icon` | 알림 아이콘 URL | **iOS는 무시**(앱 아이콘 강제) |
| `badge` | 상태바용 단색 아이콘 (~72×72, 4x: ~96×96) | Android Chrome |
| `tag` | 동일 tag 알림은 교체 | **iOS는 무시**(매번 새 알림) |
| `renotify` | tag 교체 시 재알림 | `tag` 비어있으면 에러 |
| `silent` | 소리·진동 없음 | `null`(기본)이면 디바이스 설정 따름 |
| `data` | 임의 JSON 페이로드 | notificationclick에서 `event.notification.data`로 접근 |
| `actions` | 액션 버튼 배열 `[{action, title, icon}]` | **iOS Safari에서 무시**, Chrome/Firefox 지원 |
| `requireInteraction` | 사용자 dismiss 전까지 유지 | Chrome desktop |

---

## 5. 서버 측 — `web-push` (Node)

```js
// server/push.js
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@dreamapp.example',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendDreamReminder(subscription, payload) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 } // 24h
    );
  } catch (err) {
    // 410 Gone / 404 Not Found → 구독 만료, DB에서 제거
    if (err.statusCode === 410 || err.statusCode === 404) {
      await db.subscriptions.deleteByEndpoint(subscription.endpoint);
    } else {
      throw err;
    }
  }
}
```

### VAPID 키 생성 (한 번만)

```bash
npx web-push generate-vapid-keys
# {
#   publicKey:  "BNc...",   ← 클라이언트 VITE_VAPID_PUBLIC_KEY
#   privateKey: "Hs7..."    ← 서버 환경변수, Git 커밋 금지
# }
```

> 주의: **VAPID 비공개키를 분실하면 기존 구독자 전원 재구독 필요.** 1Password·KMS 등에 별도 보관하고 키 로테이션 정책을 정의한다.

---

## 6. 권한 요청 UX — Mute Notifications 회피

**금지 패턴:**

```ts
// 페이지 진입 즉시 권한 요청 — 영구 차단 위험
useEffect(() => { Notification.requestPermission(); }, []);
```

**권장 패턴 (Double Opt-in):**

```tsx
// 1) 맥락 있는 시점(꿈 기록 3개 이상 작성 후)에 *앱 자체 UI*로 사전 동의 받기
function ReminderOptIn() {
  return (
    <Card>
      <h3>매일 밤 꿈 기록 리마인더를 받아보시겠어요?</h3>
      <p>잊지 않고 꿈을 기록하면 반복 패턴을 찾기 쉬워집니다.</p>
      <Button onClick={handleEnable}>알림 켜기</Button>
      <Button variant="ghost" onClick={handleSkip}>나중에</Button>
    </Card>
  );
}

// 2) 사용자가 '알림 켜기'를 누른 그 순간에만 브라우저 권한 요청
async function handleEnable() {
  const sub = await subscribePush();
  if (sub) toast.success('알림이 설정되었습니다');
}
```

핵심 원칙:
- **첫 진입 시 즉시 요청 금지** — 차단되면 영구 차단 (Chrome은 3번 dismiss하면 자동 차단).
- **사용자 제스처 안에서** 요청해야 한다 (iOS는 더 엄격: 반드시 click·tap 핸들러 안).
- **가치 제안을 먼저** — 무엇을, 언제, 왜 알릴지 설명 후 권한 요청.

---

## 7. 사용자 컨트롤 — 알림 끄기 의무

```ts
export async function unsubscribePush(): Promise<void> {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  await sub.unsubscribe();
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });
}
```

설정 화면에 항상 *알림 켜기/끄기* 토글을 둔다. 끄기 UI가 없으면 사용자는 브라우저 단에서 영구 차단해버린다.

---

## 8. iOS Safari 16.4+ 특별 조건

| 항목 | 조건 |
|------|------|
| **OS 버전** | iOS/iPadOS 16.4 이상 |
| **설치 형태** | **반드시 "홈 화면에 추가"로 설치한 PWA만** 지원. Safari 브라우저 안에서는 **불가** |
| **권한 트리거** | 사용자 탭(click) 이벤트 *동기* 컨텍스트에서만 `Notification.requestPermission` 호출 가능 |
| **manifest.json** | `display: "standalone"` 필요 |
| **무시되는 옵션** | `icon`(앱 아이콘 강제), `tag`(매번 새 알림), `actions`(액션 버튼 없음) |
| **Service Worker** | 일반 SW 동작하지만 백그라운드 실행 제한 있음 |

**개발자 안내 UI 권장:**

```tsx
function IOSInstallGuide() {
  const isIOS = /iPad|iPhone/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  if (isIOS && !isStandalone) {
    return (
      <Banner>
        iOS에서 알림을 받으려면: 공유 버튼 → "홈 화면에 추가" 후 홈 화면 아이콘으로 앱을 다시 열어주세요.
      </Banner>
    );
  }
  return null;
}
```

---

## 9. 브라우저 호환성 요약

| 브라우저 | Push API | 비고 |
|----------|---------|------|
| Chrome (Desktop·Android) | ✅ 안정 | 모든 옵션 지원 |
| Edge | ✅ 안정 | Chromium 기반 |
| Firefox (Desktop·Android) | ✅ 안정 | 푸시 quota 있음 |
| Safari (macOS) | ✅ 16.1+ | actions 제한 |
| **Safari (iOS/iPadOS)** | ✅ **16.4+, 홈 화면 PWA만** | icon/tag/actions 미지원 |
| Samsung Internet | ✅ | |

---

## 10. 꿈 앱 시나리오

### 시나리오 A: 반복 꿈 알림

같은 키워드(예: "물에 빠지는 꿈")가 3회 이상 누적되면 서버가 푸시 발송.

```js
// server
await sendDreamReminder(sub, {
  title: '반복되는 꿈이 발견됐어요',
  body: '"물에 빠지는 꿈"이 이번 달에 3번 기록됐습니다.',
  tag: 'recurring-water', // Chrome에서 같은 패턴 중복 알림 방지
  url: '/insights/recurring/water',
  actions: [{ action: 'view', title: '자세히 보기' }],
});
```

### 시나리오 B: 일일 꿈 기록 리마인더

서버 측 크론(매일 23:00) 또는 클라이언트 측 `Notification Triggers` API(실험적, Chrome 전용)로 발송.

```js
await sendDreamReminder(sub, {
  title: '오늘 밤 꿈을 기록해보세요',
  body: '잠들기 전 1분, 꿈 일기를 미리 열어두면 깨자마자 적기 쉬워요.',
  tag: 'daily-reminder',
  renotify: true,
  url: '/journal/new',
});
```

### 시나리오 C: 해몽 결과 알림

비동기 AI 해몽이 완료되면 푸시.

```js
await sendDreamReminder(sub, {
  title: '꿈 해석이 완료됐어요',
  body: '"하늘을 나는 꿈"의 분석 결과를 확인해보세요.',
  tag: `interpret-${dreamId}`,
  url: `/dreams/${dreamId}/interpretation`,
  data: { dreamId },
});
```

---

## 11. 흔한 함정

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
| 과도한 알림 빈도 | 사용자가 OS 단에서 차단 | 일일 1~2건 상한, 사용자 설정 가능 시간대 |

---

## 12. 짝 스킬 연계

| 작업 | 참조 |
|------|------|
| Service Worker 등록·precache | `frontend/vite-pwa-service-worker` |
| 푸시 알림 구독·발송·표시 | 이 스킬 |

`injectManifest` 전략으로 커스텀 SW에 위의 `push`·`notificationclick` 핸들러를 추가하는 것이 일반적인 통합 흐름이다.
