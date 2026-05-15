---
name: pwa-offline-llm-fallback
description: >
  PWA 환경에서 LLM(Claude API) 호출이 오프라인·rate limit·overloaded로 실패할 때
  로컬 폴백을 제공하는 패턴 — navigator.onLine 한계, Background Sync 큐, 로컬 사전 검색,
  Service Worker NetworkFirst fallback, Claude 429/529 graceful degradation, iOS Safari 한계.
  <example>사용자: "비행기 모드에서도 꿈 해몽 앱이 기본 응답이라도 주게 하려면?"</example>
  <example>사용자: "Claude API 429 떴을 때 로컬 폴백으로 자동 전환하는 패턴 알려줘"</example>
  <example>사용자: "오프라인에서 받은 요청을 온라인 복귀 시 자동 전송하려면?"</example>
---

# PWA Offline LLM Fallback

> 소스:
> - navigator.onLine: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine
> - Background Synchronization API: https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
> - Workbox Background Sync: https://developer.chrome.com/docs/workbox/modules/workbox-background-sync
> - Offline Cookbook (Jake Archibald, web.dev): https://web.dev/articles/offline-cookbook
> - Claude API Errors: https://platform.claude.com/docs/en/api/errors
> - Background Sync 호환성: https://caniuse.com/background-sync
> 검증일: 2026-05-14

---

## 사용 시나리오

```
┌──────────────────────────────────────────────────────────┐
│ 꿈 해몽 PWA 앱이 다음 상황에서도 "기본 응답"을 줘야 한다 │
│                                                          │
│  - 사용자가 비행기 모드 on (지하철·터널·기내)            │
│  - 신호는 잡히지만 약함 → fetch timeout                  │
│  - Claude API 429 rate limit                             │
│  - Claude API 529 overloaded                             │
│  - Claude API timeout                                    │
│                                                          │
│ 모두 동일한 fallback 트리거로 처리한다.                  │
└──────────────────────────────────────────────────────────┘
```

이 스킬은 짝 스킬과 함께 사용:
- `frontend/vite-pwa-service-worker` — Service Worker 빌드·등록 인프라
- `humanities/korean-dream-interpretation-tradition` — 로컬 폴백 응답의 콘텐츠 소스(전통 해몽 사전)

---

## 1. 온라인 감지 — `navigator.onLine` 한계 이해

### 공식 경고 (MDN)

> "This property is inherently unreliable, and you should not disable features based on the online status, only provide hints when the user may seem offline."

| 값 | 신뢰도 |
|----|--------|
| `navigator.onLine === false` | ⭐⭐⭐ 거의 신뢰 가능 — "확실한 오프라인" |
| `navigator.onLine === true` | ⭐⭐ false positive 빈발 — VPN·방화벽·LAN-only |

**false positive 원인 (MDN 명시):**
- LAN 연결만 있고 인터넷 차단된 환경 (회사 내부망, 카페 캡티브 포털)
- 가상 이더넷 어댑터(Docker, VMware) → 항상 "connected"
- Windows: Microsoft 홈 서버 도달 가능 여부로 판단 → 방화벽·VPN으로 차단되면 인터넷 있어도 false
- iOS Safari·Android 일부 버전에서 지연된 갱신

### 실전 패턴 — `navigator.onLine` + 실제 fetch 검증

```ts
// utils/network-status.ts
const PING_URL = '/api/ping'; // 자체 서버 경량 엔드포인트 (favicon도 가능)
const PING_TIMEOUT_MS = 3000;

export async function isRealOnline(): Promise<boolean> {
  // 1단계: 확실한 오프라인은 빠르게 처리
  if (navigator.onLine === false) return false;

  // 2단계: 실제 fetch로 검증 (no-cache, HEAD)
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), PING_TIMEOUT_MS);
    const res = await fetch(PING_URL, {
      method: 'HEAD',
      cache: 'no-store',
      signal: ac.signal,
    });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

// 이벤트 리스너 (UI 힌트용)
window.addEventListener('online', () => emit('network:hint', 'maybe-online'));
window.addEventListener('offline', () => emit('network:hint', 'offline'));
```

> 주의: `online`/`offline` 이벤트도 즉시 발화되지 않을 수 있다. UI 상태 표시·힌트용으로만 쓰고, 실제 분기는 `fetch` 결과로 한다.

---

## 2. LLM 호출 래퍼 — 실패 단일 트리거로 통일

Claude API의 4가지 실패 케이스를 *모두 동일한 fallback*으로 보낸다.

| 실패 유형 | 응답 | 처리 |
|-----------|------|------|
| 네트워크 실패 (fetch reject) | `TypeError: Failed to fetch` | fallback + 큐 적재 |
| 429 rate_limit_error | `Retry-After` 헤더 포함 | fallback + 큐 적재 (지연 retry) |
| 529 overloaded_error | API 과부하 | fallback + 큐 적재 |
| 408 / timeout | AbortController 발화 | fallback + 큐 적재 |

```ts
// services/llm-client.ts
import { isRealOnline } from '@/utils/network-status';
import { enqueueLlmRequest } from '@/services/offline-queue';
import { localDreamFallback } from '@/services/local-dream-fallback';

const TIMEOUT_MS = 15000;

export type LlmResult =
  | { kind: 'online'; text: string }
  | { kind: 'fallback'; text: string; reason: FallbackReason; queued: boolean };

type FallbackReason = 'offline' | 'rate_limit' | 'overloaded' | 'timeout' | 'unknown';

export async function interpretDream(input: string): Promise<LlmResult> {
  if (!(await isRealOnline())) {
    return await triggerFallback(input, 'offline');
  }

  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
    const res = await fetch('/api/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
      signal: ac.signal,
    });
    clearTimeout(t);

    if (res.ok) {
      const data = await res.json();
      return { kind: 'online', text: data.text };
    }

    // 4xx/5xx — Claude proxy가 그대로 status를 전달한다고 가정
    if (res.status === 429) return triggerFallback(input, 'rate_limit');
    if (res.status === 529) return triggerFallback(input, 'overloaded');
    return triggerFallback(input, 'unknown');
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return triggerFallback(input, 'timeout');
    }
    return triggerFallback(input, 'offline');
  }
}

async function triggerFallback(input: string, reason: FallbackReason): Promise<LlmResult> {
  const text = await localDreamFallback(input);
  const queued = await enqueueLlmRequest(input).catch(() => false);
  return { kind: 'fallback', text, reason, queued };
}
```

> 주의: 429 응답의 `Retry-After` 헤더는 *큐 재시도 간격*에만 활용한다. 사용자 응답은 즉시 fallback으로 돌려준다.

---

## 3. 로컬 Fallback 1 — 전통 해몽 사전 (IndexedDB)

콘텐츠 정의는 짝 스킬 `humanities/korean-dream-interpretation-tradition` 참조. 여기서는 *검색 메커니즘*만 다룬다.

### 데이터 모델

```ts
// schema (Dexie 예시 — frontend/indexeddb-dexie 스킬 참조)
type DreamSymbol = {
  id: string;
  keywords: string[];   // ["돼지", "豚"]
  category: string;     // "동물"
  meaning: string;      // 한국민족문화대백과사전 등 1차 출처 인용
  source: string;       // 인용 출처 URL/서지
  hedge: 'tradition' | 'literature' | 'folklore';
};
```

### 키워드 매칭 (간단 규칙 기반)

```ts
// services/local-dream-fallback.ts
import { db } from '@/db';

const STOPWORDS = new Set(['그리고', '나는', '꿈', '꿈을', '있는', '했다', '봤다']);

export async function localDreamFallback(input: string): Promise<string> {
  const tokens = tokenizeKeywords(input);
  const symbols = await db.dreamSymbols
    .filter((s) => s.keywords.some((kw) => tokens.includes(kw)))
    .limit(3)
    .toArray();

  if (symbols.length === 0) {
    return [
      '오프라인 모드입니다.',
      '입력하신 꿈에 매칭되는 전통 상징을 찾지 못했어요.',
      '온라인 복귀 시 더 자세한 해몽을 보내드릴게요.',
    ].join('\n');
  }

  const lines = symbols.map(
    (s) => `· **${s.keywords[0]}** (민속학적으로는) — ${s.meaning}\n  출처: ${s.source}`,
  );
  return [
    '⚠️ 오프라인 모드 — 전통 민속학적 해몽 (단정적 해석 아님)',
    ...lines,
    '\n온라인 복귀 시 더 자세한 해몽을 자동으로 보내드릴게요.',
  ].join('\n');
}

function tokenizeKeywords(text: string): string[] {
  // 한국어 형태소 분석기는 번들 크기 부담 — 간단 분리
  // 정밀도가 필요하면 사전에 키워드 lemma 테이블을 미리 빌드한다.
  return text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}
```

> 주의: 본격 한국어 형태소 분석기(예: kiwi-nlp wasm)는 wasm 번들 1MB 이상이다. PWA precache 비용을 따져 *키워드 사전 확장* 방식이 일반적으로 더 가볍다.

### 빌드 시 시드 (precache)

```ts
// db/seed-dream-symbols.ts (앱 첫 실행 시 1회 실행)
import { db } from './index';
import seed from './dream-symbols.seed.json';

export async function seedDreamSymbols() {
  const count = await db.dreamSymbols.count();
  if (count > 0) return;
  await db.dreamSymbols.bulkAdd(seed);
}
```

JSON 시드 파일은 Vite asset으로 빌드 산출물에 포함 → Service Worker가 precache → 첫 실행 후 IndexedDB로 복사.

---

## 4. 로컬 Fallback 2 — 오프라인 큐 (Background Sync)

요청을 IndexedDB 큐에 적재 → 온라인 복귀 시 자동 전송.

### 4-1. Workbox `BackgroundSyncPlugin` 방식 (권장)

```ts
// service-worker.ts (injectManifest 전략)
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

const llmQueue = new BackgroundSyncPlugin('llm-request-queue', {
  maxRetentionTime: 24 * 60, // 분 단위 — 24시간 후 만료
});

registerRoute(
  ({ url, request }) =>
    url.pathname === '/api/interpret' && request.method === 'POST',
  new NetworkOnly({ plugins: [llmQueue] }),
  'POST',
);
```

동작 원리 (공식 문서):
1. fetch 실패 → `fetchDidFail` 콜백 → IndexedDB에 request 적재
2. ServiceWorker `sync` 이벤트 발화 시 자동 retry
3. `maxRetentionTime` 만료 큐 항목은 자동 제거

### 4-2. 수동 Queue 방식 (커스텀 onSync)

```ts
import { Queue } from 'workbox-background-sync';

const queue = new Queue('llm-request-queue', {
  maxRetentionTime: 24 * 60,
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        const res = await fetch(entry.request);
        if (!res.ok) {
          // 429/529는 retry-after 만큼 뒤에 다시 시도
          if (res.status === 429 || res.status === 529) {
            await queue.unshiftRequest(entry);
            throw new Error(`Retry: ${res.status}`);
          }
        } else {
          // 성공한 응답을 사용자에게 알림 (Notification API)
          await notifyUser(entry.request, res);
        }
      } catch (err) {
        await queue.unshiftRequest(entry);
        throw err;
      }
    }
  },
});
```

### 4-3. 앱 측에서 큐 적재

```ts
// services/offline-queue.ts
export async function enqueueLlmRequest(input: string): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  const reg = await navigator.serviceWorker.ready;
  if (!('sync' in reg)) return false; // iOS Safari, Firefox

  // 큐는 SW의 BackgroundSyncPlugin이 자동 적재 — 여기서는 sync 태그만 등록
  try {
    // @ts-expect-error — SyncManager는 표준 TS 타입에 아직 미포함
    await reg.sync.register('llm-request-queue');
    return true;
  } catch {
    return false;
  }
}
```

> 주의 — 브라우저 호환성 (caniuse + MDN 2026-05 기준):
> - Chrome / Edge / Android Chrome: ✅ 지원
> - Firefox: ❌ 미지원
> - **iOS Safari: ❌ 미지원** (Apple 로드맵에 없음, 모든 iOS 브라우저가 WebKit 기반이므로 Chrome iOS도 동일)
>
> 미지원 환경 폴백: 앱 로컬 IndexedDB에 직접 적재 → 다음 앱 실행·`visibilitychange visible`·`window 'online'` 이벤트에 수동 flush.

```ts
// utils/manual-flush.ts (iOS Safari 폴백)
window.addEventListener('online', flushLocalQueue);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') flushLocalQueue();
});
```

---

## 5. 로컬 Fallback 3 — 캐싱된 응답 재활용 (선택)

과거 LLM 응답을 의미적 유사도로 재활용. **복잡도 높음** — MVP에서는 생략 권장.

| 단계 | 비용 |
|------|------|
| 응답 embedding 사전 계산 (서버) | 토큰 비용 + 저장 |
| embedding을 IndexedDB에 저장 | 벡터당 384-1536차원 |
| 클라이언트 코사인 유사도 검색 | 100건 이상 시 체감 가능 |
| 임계값(예: 0.85) 이상이면 재활용 | false positive 우려 |

도입 기준: 사용자당 LLM 호출 30회 이상 + Claude API 비용 부담이 명확할 때.

---

## 6. UX 패턴

```
┌────────────────────────────────────────────────────────────┐
│ 🌐 오프라인 모드입니다                                       │
│                                                            │
│ 기본 해몽을 보여드리고, 온라인 복귀 시 자세한 해몽을         │
│ 자동으로 받아드릴게요.                                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ · **돼지** (민속학적으로는) — …                              │
│   출처: 한국민족문화대백과사전                                │
│                                                            │
│ · **물** (민속학적으로는) — …                                │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ ⏳ 자세한 해몽이 큐에 저장됨 — 온라인 복귀 시 자동 전송       │
└────────────────────────────────────────────────────────────┘
```

상태별 메시지:
| reason | 사용자 메시지 |
|--------|---------------|
| `offline` | "오프라인 모드입니다. 기본 해몽을 보여드리고…" |
| `rate_limit` | "지금은 응답이 많아 기본 해몽을 먼저 보여드릴게요." |
| `overloaded` | "서버가 일시 과부하 상태예요. 기본 해몽을 먼저…" |
| `timeout` | "응답이 늦어 기본 해몽을 먼저 보여드릴게요." |

> 주의: "AI 서버 다운"·"Claude 장애" 같은 *기술 스택을 노출하는 문구는 사용 금지* (typescript.md 규칙).

---

## 7. Service Worker 통합 (Network with offline fallback)

`web.dev/offline-cookbook` "Generic fallback" 패턴 — 캐시도 네트워크도 실패하면 fallback 페이지/응답.

```ts
// service-worker.ts (injectManifest)
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { precacheAndRoute, matchPrecache } from 'workbox-precaching';

// 1. precache (Vite PWA injectManifest가 self.__WB_MANIFEST 주입)
precacheAndRoute(self.__WB_MANIFEST);

// 2. API: NetworkFirst (오프라인 시 cache fallback)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
  }),
);

// 3. 정적 자산: CacheFirst
registerRoute(
  ({ request }) => ['style', 'script', 'image'].includes(request.destination),
  new CacheFirst({ cacheName: 'static-cache' }),
);

// 4. 모든 매칭 실패 시 fallback
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    return (await matchPrecache('/offline.html')) ?? Response.error();
  }
  return Response.error();
});
```

> 짝 스킬 `frontend/vite-pwa-service-worker`의 `injectManifest` 전략을 전제로 한다.

---

## 8. Graceful Degradation 체크리스트

LLM 기능 추가 시 *반드시* 확인:

- [ ] 네트워크 실패 / 429 / 529 / timeout 모두 동일한 fallback path로 수렴하는가
- [ ] `navigator.onLine === true`만 믿지 않고 실제 `fetch`로 재검증하는가
- [ ] fallback 응답이 사용자에게 *명확하게 "오프라인/기본 응답"임을 표기*하는가
- [ ] 큐 적재 성공·실패를 사용자에게 알려주는가
- [ ] iOS Safari / Firefox에서 Background Sync 없이도 동작하는가 (수동 flush 폴백)
- [ ] fallback 응답에 *출처가 명시되는가* (전통 해몽 사전의 1차 출처)
- [ ] 기술 스택 정보가 노출되지 않는가 ("Claude API", "529 overloaded" 등 사용자에게 보이지 않게)

---

## 9. 흔한 함정

| # | 함정 | 결과 | 해결 |
|---|------|------|------|
| 1 | `navigator.onLine === true` 만 믿고 분기 | VPN·LAN 환경에서 fetch는 실패하는데 fallback 안 탐 | 실제 `fetch` 결과로 분기 |
| 2 | `online` 이벤트에서 즉시 큐 flush | 이벤트는 빨리 발화되지만 실제 인터넷 미연결 | `isRealOnline()` 한 번 더 확인 |
| 3 | Service Worker scope 오해 | `/app/` 하위에 등록 → 루트 `/api/` 캐싱 안 됨 | SW를 사이트 루트(`/`)에 등록 |
| 4 | Background Sync를 iOS에서 동작한다고 가정 | iOS 사용자만 큐 영구 보류 | 수동 flush 폴백 항상 함께 구현 |
| 5 | `BackgroundSyncPlugin`만 등록하고 SW 미등록 | 큐 적재 안 됨 (SW가 fetch를 가로채지 못함) | `registerRoute` 전 SW가 실제 활성화됐는지 확인 |
| 6 | 429 응답을 그대로 사용자에게 노출 | "API 오류 429"가 화면에 표시 | 사용자 메시지는 일반화 |
| 7 | `maxRetentionTime` 기본값 의존 | 기본값(24시간) 넘은 큐 항목 자동 폐기 → 사용자 모름 | 폐기 알림 또는 `maxRetentionTime` 명시 |
| 8 | 전통 해몽 사전을 단정적 톤으로 표시 | "당신의 꿈은 X를 의미합니다" → 미신 강화 | `humanities/korean-dream-interpretation-tradition` hedging 톤 강제 |
| 9 | `precacheAndRoute(self.__WB_MANIFEST)` 누락 | injectManifest 빌드 시 manifest 주입 실패 | vite-pwa injectManifest 설정 확인 |
| 10 | 큐 적재 결과를 사용자에게 안 알림 | 사용자가 응답을 영영 못 받았다고 생각 | UX 패턴(섹션 6) Toast/Banner 노출 |

---

## 10. 결정 트리

```
LLM 호출 실패?
  ├─ navigator.onLine === false  → 즉시 fallback
  ├─ fetch network error          → 즉시 fallback + 큐 적재
  ├─ HTTP 429 / 529               → 즉시 fallback + 큐 적재 (retry-after 반영)
  ├─ AbortError (timeout)         → 즉시 fallback + 큐 적재
  └─ HTTP 4xx (입력 오류)         → fallback ❌, 입력 검증 에러 메시지 표시

큐 적재 가능?
  ├─ Chrome/Edge/Android: BackgroundSyncPlugin 자동
  └─ iOS Safari/Firefox: IndexedDB 수동 큐 + visibilitychange/online flush
```

---

## 11. 참고 — Claude API 에러 코드 (공식)

| Status | 의미 | retry-after 헤더 |
|--------|------|------------------|
| 429 | `rate_limit_error` — 사용량 한도 초과 | ✅ 포함 |
| 529 | `overloaded_error` — API 일시 과부하 | ⚠️ 없을 수 있음 |
| 408 / timeout | 요청 타임아웃 | — |

> 공식: https://platform.claude.com/docs/en/api/errors
> 529는 billing에서 제외된다 (재시도 무료). 다만 *예방은 불가능*하므로 fallback이 반드시 필요.
