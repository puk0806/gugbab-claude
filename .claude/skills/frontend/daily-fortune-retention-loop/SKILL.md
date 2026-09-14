---
name: daily-fortune-retention-loop
description: >
  캐주얼 운세 앱의 일일 리텐션 루프 설계 — 하루 1회 갱신 경계(사용자 시간대 기준 service day key),
  오늘의 운세 write-once 캐싱(중복 LLM 호출 방지·같은 날 동일 결과 보장), 발송 시각 개인화 푸시,
  스트릭·공유 카드, 오프라인 대응.
  <example>사용자: "오늘의 운세를 하루 한 번만 갱신하려면 자정 기준을 어떻게 잡아야 해?"</example>
  <example>사용자: "같은 날 다시 들어왔는데 운세 결과가 바뀌어요. LLM 재호출 막으려면?"</example>
  <example>사용자: "운세 앱 푸시랑 스트릭 넣고 싶은데 사용자가 피로해서 끄지 않게 설계하려면?"</example>
user-invocable: false
---

# Daily Fortune Retention Loop

> 소스:
> - Intl.DateTimeFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
> - Intl.DateTimeFormat.resolvedOptions(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions
> - Intl.DateTimeFormat.formatToParts(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts
> - Temporal (Baseline 상태): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal
> - TC39 proposal-temporal: https://github.com/tc39/proposal-temporal
> - HTTP Cache-Control: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control
>
> 검증일: 2026-09-10 (2026-09-11 캐주얼 앱 방향으로 과의존 가드 섹션 제거)

---

## 이 스킬의 범위

```
┌─────────────────────────────────────────────────────────────┐
│  "하루 1회 열어보는 운세"라는 제품 루프 전체를 설계한다      │
│                                                             │
│   ① 날짜 경계    — 언제가 '오늘'인가 (service day key)       │
│   ② 캐싱         — 같은 날엔 같은 결과 (LLM 1회만 호출)      │
│   ③ 재방문 유도  — 푸시 · 스트릭 · 공유                      │
│   ④ 오프라인     — 캐시된 오늘 운세로 버티기                 │
└─────────────────────────────────────────────────────────────┘
```

| 이 스킬을 쓸 때 | 이 스킬을 쓰지 않을 때 |
|---|---|
| 일일 운세·사주·타로 등 **하루 단위로 갱신되는** 콘텐츠 앱 | 1회성 진단·테스트(MBTI형) — 날짜 경계 개념이 없음 |
| 재방문 유도 장치(푸시·스트릭)를 넣어야 할 때 | 유료 상담 매칭 플랫폼 — 루프가 아니라 거래 흐름 |
| LLM으로 운세를 생성해 비용·일관성을 모두 잡아야 할 때 | 정적 12간지 표를 그대로 노출하는 앱 (캐싱 불필요) |

---

## 1. 날짜 경계 — "오늘"을 서버가 정의한다

### 1-1. 기준 선택

| 방식 | 장점 | 단점 | 판정 |
|---|---|---|---|
| **UTC 자정** | 구현 단순, 전 사용자 동시 갱신 | 한국 사용자에게 오전 9시에 날짜가 바뀜 — 치명적 | ❌ |
| **고정 KST 자정** | 국내 단일 시장이면 단순·예측 가능, 배치 발송 쉬움 | 해외 거주 사용자 경험 붕괴 | ⚠️ 국내 전용이면 허용 |
| **사용자 시간대 자정** | 누구에게나 "내 자정" | tz 저장·버킷 배치 필요, tz 변경 어뷰징 가능 | ✅ 권장 |

> **추가 선택지 — 새벽 리셋(reset hour).** 자정이 아니라 **새벽 4~5시**를 경계로 두면 "자정을 넘겨 활동 중인 사용자가 아직 오늘 운세를 보지 않았는데 내일로 넘어가버리는" 문제를 없앨 수 있다. 아래 코드는 `resetHour`로 이를 지원한다.

### 1-2. service day key 생성 (클라이언트·서버 공용)

`Temporal`이 아니라 **`Intl.DateTimeFormat`** 을 쓴다(이유는 §1-4).

```ts
// src/lib/fortune/serviceDay.ts

/**
 * 특정 시점(instant)이 어느 "서비스 날짜"에 속하는지 계산한다.
 * @param timeZone  IANA 타임존 (예: 'Asia/Seoul')
 * @param resetHour 하루가 시작되는 시각(0 = 자정, 4 = 새벽 4시)
 * @returns 'YYYY-MM-DD'
 */
export function serviceDayKey(
  instant: Date,
  timeZone: string,
  resetHour = 0,
): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23', // 0~23. hour12:false와 동일 결과지만 명시가 안전
  }).formatToParts(instant);

  const get = (type: string) => parts.find((p) => p.type === type)!.value;

  const y = Number(get('year'));
  const m = Number(get('month'));
  const d = Number(get('day'));
  const hour = Number(get('hour')) % 24; // h24 폴백 방어

  // resetHour 이전이면 아직 '어제'로 취급
  const dayShift = hour < resetHour ? -1 : 0;

  // 이미 벽시계 날짜 숫자를 뽑은 뒤이므로, 여기서의 ±1일은 DST와 무관한 달력 연산
  const shifted = new Date(Date.UTC(y, m - 1, d + dayShift));
  return shifted.toISOString().slice(0, 10);
}

/** 브라우저에서 사용자 IANA 타임존 탐지 */
export function detectTimeZone(): string {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Asia/Seoul';
}
```

- `resolvedOptions().timeZone`은 IANA 타임존 이름을 반환하며 **2017년 9월부터 브라우저 전반에서 Baseline(widely available)** 이다. 폴리필 없이 써도 된다.
- `hour12: false`는 사양상 `hourCycle: 'h23'`(0~23)으로 매핑된다. 위 코드는 `hourCycle`을 직접 지정하고 `% 24` 가드를 함께 둔다.
- 날짜 산술에 `Date.UTC`를 쓰는 이유: 로컬 `new Date(y, m, d)`를 쓰면 **실행 환경의 tz**가 끼어들어 서버·클라이언트 결과가 갈린다.

### 1-3. 다음 경계까지 남은 시간 (카운트다운·TTL용)

```ts
export function msUntilNextServiceDay(
  now: Date,
  timeZone: string,
  resetHour = 0,
): number {
  const today = serviceDayKey(now, timeZone, resetHour);
  // 키가 바뀌는 지점을 이분 탐색으로 찾는다 (DST·표준시 변경에 강함)
  let lo = now.getTime();
  let hi = lo + 26 * 60 * 60 * 1000; // 26h면 어떤 tz 전이도 포함
  while (hi - lo > 60_000) {
    const mid = Math.floor((lo + hi) / 2);
    if (serviceDayKey(new Date(mid), timeZone, resetHour) === today) lo = mid;
    else hi = mid;
  }
  return hi - now.getTime();
}
```

> 오프셋을 직접 더하고 빼는 방식 대신 **경계를 탐색한다.** DST 전이·국가별 표준시 변경에 대해 분기 없이 항상 옳은 값을 준다. Asia/Seoul은 현재 DST가 없지만, 해외 거주 사용자를 받는 순간 필요해진다.

### 1-4. Temporal API — 아직 쓰지 마라

> **주의(교차 검증에서 정정된 항목):** "Temporal이 ES2026에 들어갔으니 date-fns·dayjs를 지금 버려라"는 취지의 블로그가 다수 있으나, **프로덕션 PWA에는 아직 부적합하다.**
>
> - TC39 기준: Temporal은 **2026년 3월 Stage 4 도달**, ECMAScript 2026 사양에 포함 — 사실이다.
> - 그러나 MDN은 Temporal을 **"Baseline 아님 — 가장 널리 쓰이는 브라우저 일부에서 동작하지 않음"** 으로 명시하고 폴리필 사용을 권한다. 운세 앱은 **iOS Safari 비중이 큰 PWA**다.
>
> **결론:** 날짜 경계 로직은 `Intl.DateTimeFormat`으로 구현한다. Temporal을 꼭 쓰려면 `@js-temporal/polyfill` 또는 `temporal-polyfill`을 번들에 포함해야 하며, 이 스킬이 요구하는 연산(날짜 키 추출·경계 탐색) 대비 이득이 크지 않다.

### 1-5. 시간대 변경 어뷰징 차단

사용자 시간대 기준을 쓰면 **기기 tz를 바꿔 하루에 여러 번 새 운세를 뽑는** 경로가 생긴다. "하루 한 번"이라는 제품 약속이 깨지고 LLM 비용도 사용자 손에 넘어간다.

```ts
// 서버가 권위(authority)를 가진다
async function resolveServiceDay(userId: string, clientTz: string) {
  const user = await db.users.find(userId);

  // 1) 저장된 tz를 기준으로 삼는다 (클라이언트가 보낸 값을 그대로 믿지 않음)
  const tz = user.timeZone ?? clientTz;

  // 2) tz 변경은 하루 1회 + 유효한 IANA 이름만 허용
  if (clientTz !== user.timeZone && isValidIanaTimeZone(clientTz)) {
    const lastChange = user.timeZoneChangedAt;
    if (!lastChange || Date.now() - lastChange.getTime() > 24 * 60 * 60 * 1000) {
      await db.users.update(userId, {
        timeZone: clientTz,
        timeZoneChangedAt: new Date(),
      });
    }
  }

  // 3) 서비스 데이 키는 항상 서버 시각 + 서버가 인정한 tz로 산출
  return serviceDayKey(new Date(), tz, RESET_HOUR);
}

function isValidIanaTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false; // 잘못된 tz는 RangeError
  }
}
```

> 핵심: **클라이언트가 보낸 날짜·시간대를 신뢰하지 않는다.** 서비스 데이 키는 서버가 생성해 응답에 담아 내려준다.

---

## 2. 오늘의 운세 캐싱 — 같은 날엔 반드시 같은 결과

### 2-1. 왜 UX상 필수인가

| 재방문 시 결과가 바뀌면 | 결과 |
|---|---|
| 사용자가 "아까랑 다른데?" 인지 | 콘텐츠 신뢰도 즉시 붕괴 |
| 마음에 들 때까지 새로고침 | "오늘의 운세"가 뽑기 게임으로 변질 — 하루 1회라는 제품 정체성 소멸 |
| 공유한 카드와 앱 내용 불일치 | 링크를 연 지인이 다른 운세를 봄 |
| LLM 재호출 | 비용이 방문 횟수에 비례해 증가 |

즉 캐싱은 **비용 최적화가 아니라 제품 정합성 요구사항**이다.

### 2-2. write-once 저장 (레이스 컨디션까지)

```sql
CREATE TABLE daily_fortunes (
  user_id      UUID        NOT NULL,
  service_day  DATE        NOT NULL,   -- serviceDayKey() 결과
  fortune_type TEXT        NOT NULL,   -- 'daily' | 'love' | 'money' ...
  content      JSONB       NOT NULL,
  model        TEXT        NOT NULL,   -- 재현성 추적용
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, service_day, fortune_type)
);
```

```ts
async function getTodayFortune(userId: string, type: FortuneType, clientTz: string) {
  const serviceDay = await resolveServiceDay(userId, clientTz);

  // 1) 캐시 우선
  const cached = await db.dailyFortunes.find({ userId, serviceDay, type });
  if (cached) return cached;

  // 2) 없으면 생성
  const generated = await generateFortuneWithLLM({ userId, serviceDay, type });

  // 3) INSERT ... ON CONFLICT DO NOTHING
  //    동시에 두 요청이 생성했더라도 최초 1건만 남고, 두 요청 모두 같은 값을 받는다
  const inserted = await db.dailyFortunes.insertIfAbsent({
    userId, serviceDay, type, content: generated, model: MODEL_ID,
  });
  return inserted ?? (await db.dailyFortunes.find({ userId, serviceDay, type }))!;
}
```

> 주의: `SELECT → 없으면 INSERT`만 하면 **동시 요청 2건이 서로 다른 운세를 생성**한다. 반드시 **PK/UNIQUE 제약 + `ON CONFLICT`** 로 최초 1건을 확정한다. 앱을 두 탭에서 동시에 여는 것만으로 재현되는 흔한 버그다.
>
> LLM **호출 자체의 중복 과금**까지 막으려면 `(user_id, service_day, type)` 기반 분산 락 또는 idempotency key를 생성 단계 앞에 둔다.

**리롤 UI:** 결과가 마음에 안 들어 다시 요청하는 사용자에게는 카운트다운을 보여준다. 운세 종류를 나누는 것(총운·애정운·재물운) 자체는 정상이나, **각 종류가 같은 날 고정 1회**여야 하루 1회라는 제품 약속이 유지된다.

```tsx
function RerollBlocked({ nextAt }: { nextAt: Date }) {
  return (
    <InfoBox>
      <p>오늘의 운세는 하루에 한 번만 확인할 수 있어요.</p>
      <p>다음 운세는 <Countdown to={nextAt} /> 후에 만나요.</p>
    </InfoBox>
  );
}
```

### 2-3. HTTP 캐시 헤더

개인화 콘텐츠이므로 **`private` 필수**다. 빠뜨리면 CDN·프록시 같은 공유 캐시가 다른 사용자에게 남의 운세를 그대로 줄 수 있다.

```ts
const ttlSec = Math.floor(msUntilNextServiceDay(new Date(), tz, RESET_HOUR) / 1000);

res.setHeader('Cache-Control', `private, max-age=${ttlSec}, must-revalidate`);
```

| 지시자 | 이유 |
|---|---|
| `private` | 개인화 응답 — 공유 캐시 저장 금지. **생략 시 사용자 정보 유출 위험** |
| `max-age=<다음 경계까지>` | 날짜가 바뀌는 순간 정확히 만료 |
| `must-revalidate` | 만료 후 낡은 응답을 조용히 재사용하지 않음 |

> `s-maxage`·`public`은 **쓰지 않는다.** 응답에 사용자 식별 정보가 들어가는 한 공유 캐시에 올릴 이유가 없다.

### 2-4. 클라이언트 캐시 + 경계 넘김 처리

```ts
// 탭을 열어둔 채 경계를 넘기는 케이스 — 어제 운세를 계속 보여주면 안 된다
useEffect(() => {
  const ms = msUntilNextServiceDay(new Date(), tz, RESET_HOUR);
  const timer = setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: ['fortune', 'today'] });
  }, ms + 1000); // 경계 직후로 1초 여유
  return () => clearTimeout(timer);
}, [tz]);
```

모바일에서는 백그라운드 전환 시 타이머가 지연·정지되므로 `visibilitychange`에서도 재확인한다.

```ts
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const nowKey = serviceDayKey(new Date(), tz, RESET_HOUR);
    if (nowKey !== renderedKey) {
      queryClient.invalidateQueries({ queryKey: ['fortune', 'today'] });
    }
  }
});
```

---

## 3. 푸시 알림 — `pwa-push-notifications` 위에 얹는다

### 3-1. 역할 분담

| 담당 | 내용 | 참조 |
|---|---|---|
| **기반 스킬** | VAPID 키, `pushManager.subscribe`, SW `push`/`notificationclick`, `web-push` 발송, 410/404 구독 정리, iOS 16.4+ 홈 화면 PWA 제약, Double Opt-in 기본형 | `frontend/pwa-push-notifications` |
| **이 스킬** | *언제·얼마나·무슨 문구로* 보낼지 — 발송 시각 개인화, 빈도 상한, 피로 감쇠, 문구 톤 | 아래 |

> 구독·전송·SW 핸들러 구현은 **기반 스킬을 그대로 따르고 중복 작성하지 않는다.** iOS는 홈 화면에 추가한 PWA에서만 푸시가 되므로, 푸시를 리텐션 축으로 삼으려면 **설치 유도 UX가 선행**되어야 한다.

### 3-2. 발송 시각 개인화

운세의 자연스러운 소비 시점은 **기상 직후~출근길**이다. 전 사용자에게 동일 UTC 시각으로 쏘면 누군가는 새벽 3시에 받는다.

```ts
// 사용자별 선호 시각을 로컬 벽시계로 저장
// users.pushHour = 8, users.pushMinute = 0, users.timeZone = 'Asia/Seoul'

// 서버 크론: 15분마다 실행하며 "지금이 그 사용자의 발송 시각인" 대상만 추린다
cron.schedule('*/15 * * * *', async () => {
  const now = new Date();
  const candidates = await db.users.findPushEnabled();

  for (const user of candidates) {
    const { hour, minute } = localWallClock(now, user.timeZone);
    if (hour !== user.pushHour) continue;
    if (Math.abs(minute - user.pushMinute) >= 15) continue;

    const serviceDay = serviceDayKey(now, user.timeZone, RESET_HOUR);
    if (!(await shouldSend(user, serviceDay))) continue; // §3-4 게이트

    await enqueuePush(user, serviceDay);
  }
});
```

- **발송 전 운세를 미리 생성**해 두면 푸시를 탭했을 때 로딩이 없다. 단, 열지 않는 사용자에게는 LLM 비용이 낭비되므로 **최근 N일 내 활성 사용자에게만 사전 생성**하고 나머지는 진입 시 생성한다.
- 발송 시각 기본값은 제안하되 **사용자가 바꿀 수 있게** 한다.

### 3-3. 옵트인 UX — 운세 앱 특화

기반 스킬의 Double Opt-in을 따르되, 운세 앱에서는 **"가치를 이미 경험한 뒤"** 로 시점을 더 늦춘다.

```
❌ 첫 진입 즉시 권한 요청       → Chrome은 dismiss 누적 시 자동 차단, 영구 손실
❌ 회원가입 직후 권한 요청       → 아직 앱 가치를 모름
✅ 오늘의 운세를 2~3회 열어본 뒤 → "내일 아침에도 알려드릴까요?" 앱 자체 UI
✅ [알림 받기]를 탭한 그 순간에만 Notification.requestPermission()
```

```tsx
function DailyFortuneOptIn({ onEnable, onSkip }: Props) {
  return (
    <Card>
      <h3>내일 아침에도 오늘의 운세를 알려드릴까요?</h3>
      <p>매일 아침 1회만 보내드려요. 시간은 원하는 대로 바꿀 수 있어요.</p>

      <TimePicker defaultValue="08:00" onChange={setPreferredTime} />

      <Button onClick={onEnable}>알림 받기</Button>
      <Button variant="ghost" onClick={onSkip}>괜찮아요</Button>
    </Card>
  );
}
```

- **"괜찮아요"를 누른 사용자에게 다시 묻는 간격은 최소 2주.** 매 진입마다 묻는 모달은 사용자를 OS 단 영구 차단으로 밀어낸다.
- 빈도·시각 변경과 **끄기 토글을 설정 화면 상단**에 둔다. 끄기가 어려우면 사용자는 OS 단에서 영구 차단해버린다.
- 수신 동의 체크박스를 **기본 체크로 켜두지 않는다.**

### 3-4. 빈도 상한과 피로 감쇠

운세 앱의 적정선은 **하루 1건**이다. "오늘의 운세"라는 콘텐츠 특성상 하루 2건 이상은 보낼 내용 자체가 없다.

```ts
const PUSH_POLICY = {
  maxPerDay: 1,
  quietHours: { start: 21, end: 8 },  // 사용자 로컬 기준, 이 사이엔 발송 금지
  // 미열람이 누적되면 자동으로 빈도를 낮춘다 (사용자가 끄기 전에 우리가 먼저 줄인다)
  decay: [
    { unopenedStreak: 14, action: 'pause' }, // 발송 중단 + 앱 내 배너로만 유도
    { unopenedStreak: 7,  everyNDays: 4 },
    { unopenedStreak: 3,  everyNDays: 2 },
  ],
};

async function shouldSend(user: User, serviceDay: string): Promise<boolean> {
  if (await db.pushLogs.existsFor(user.id, serviceDay)) return false; // 하루 1건
  if (inQuietHours(user)) return false;

  // decay는 큰 임계값부터 검사 (배열 순서 주의)
  const rule = PUSH_POLICY.decay.find((r) => user.unopenedStreak >= r.unopenedStreak);
  if (rule?.action === 'pause') return false;
  if (rule?.everyNDays && daysSince(user.lastPushAt) < rule.everyNDays) return false;

  return true;
}
```

> **원칙: 사용자가 알림을 끄기 전에 우리가 먼저 줄인다.** 미열람 누적은 이미 피로 신호다. 여기서 더 보내면 OS 단 영구 차단으로 이어져 복구 경로가 사라진다.
>
> 주의: 업계에서 회자되는 "주 2~5건 이상이면 이탈률 급증", "67%가 하루 1건 이하를 선호" 류의 구체 수치는 **푸시 벤더 마케팅 자료(오래된 Localytics 조사 등)** 출처가 대부분이라 이 스킬에서는 근거로 채택하지 않는다. 하루 1건 상한으로 시작하고 **옵트아웃률·열람률을 직접 계측해** 조정한다.

### 3-5. 푸시 문구 톤

재미로 보는 운세의 푸시는 **초대**여야 한다. 열지 않으면 손해·불행을 겪을 것처럼 암시하는 문구는 단기 CTR을 올리고 장기 신뢰를 무너뜨린다.

| ❌ 불안 조성 | ✅ 중립·초대 |
|---|---|
| "오늘 액운을 확인 안 하면 위험해요" | "오늘의 운세가 도착했어요" |
| "지금 확인 안 하면 후회할 수도" | "잠깐 쉬어가며 오늘 한 줄 어때요?" |
| "3일 연속 안 보셨네요. 운이 달아나요" | "오랜만이에요. 오늘 운세 보러 올래요?" |

푸시 본문용 요약은 운세 본문과 별도로, 중립 톤으로 생성한다(생성 프롬프트는 `meta/fortune-interpretation-prompt-engineering` 참조).

---

## 4. 스트릭·공유 — 리텐션 장치

### 4-1. 스트릭은 "블랙햇" 기법임을 알고 쓴다

스트릭은 **손실 회피(loss aversion)** 를 이용한다 — 얻는 기쁨보다 잃는 고통이 크다는 원리다. 게이미피케이션 문헌에서 이는 *Black Hat* 동기 부여로 분류되며, 사용자를 움직이지만 **"쫓기는 느낌"** 을 만든다. 한 번 끊긴 순간 이탈로 직결되는 역효과도 널리 보고된다. 재미로 보는 앱이 "쫓기는" 앱이 되면 소재의 장점이 사라진다.

### 4-2. 가볍게 유지하는 스트릭 설계

| ❌ 쫓기는 형태 | ✅ 가벼운 형태 |
|---|---|
| 끊기면 0으로 초기화, 복구 불가 | **streak freeze** — 하루 빠져도 자동 보호(주 1회) |
| "연속 기록이 사라집니다!" 경고 푸시 | 스트릭을 푸시 소재로 쓰지 않음 |
| 스트릭 숫자를 홈 최상단 대형 배치 | 마이페이지·하단 영역에 담백하게 |
| 스트릭 보상으로 추가 운세 뽑기 제공 | 보상은 **조회권이 아닌** 테마·배지 등 비-운세 재화 (하루 1회 경계 유지) |
| 연속 일수를 남과 비교(랭킹) | 비교 없음 — 본인 기록만 |

```ts
// 끊김을 '실패'가 아니라 '재시작'으로 표현한다
function streakMessage(streak: number, brokenYesterday: boolean): string {
  if (brokenYesterday) return '오늘 다시 시작해요';        // 질책 없음
  if (streak <= 1)     return '오늘의 운세를 확인했어요';
  return `${streak}일째 확인 중`;                          // 담백한 사실 진술
}
```

### 4-3. 공유 카드

공유는 **신규 사용자 획득**과 **본인 재방문**을 동시에 노리는 장치다. 구현은 전용 스킬에 위임한다.

| 작업 | 참조 스킬 |
|---|---|
| 카카오톡 공유 미리보기·`Kakao.Share.sendDefault`·OG 캐시 초기화 | `frontend/kakao-share-optimization` |
| 운세 카드 OG 이미지 동적 생성(문구 합성·폰트·캐싱) | `frontend/og-image-generation` |

운세 앱 특유의 주의점:

- **공유 URL은 개인 결과 원본이 아니라 "요약 카드" 페이지여야 한다.** 사주·생년월일 기반 결과를 그대로 공개 URL에 노출하면 링크만으로 개인정보가 유출된다. 만료되는 토큰 URL을 별도 발급한다.
- OG 이미지에 **부정적 문구를 넣지 않는다.** 공유 카드는 맥락 없이 타임라인에 노출된다.
- 공유 카드 이미지 안에도 **"재미로 보는 운세"** 표기를 넣는다(§5).
- 카카오 크롤러는 JS를 실행하지 않으므로 OG 태그는 **SSR/SSG로 응답 HTML에 포함**되어야 한다(상세는 참조 스킬).

---

## 5. "재미로 보는" 한 줄 고지

결과 화면에 접히지 않는 형태로 한 줄을 항상 둔다. 공유 카드 이미지와 스토어 설명 첫 문단에도 같은 취지를 넣는다.

```tsx
function FortuneDisclaimer() {
  return (
    <p className="disclaimer">재미로 보는 운세예요. 검증된 예측이 아니에요.</p>
  );
}
```

"100% 적중", "AI 정확도 98%" 같은 검증 불가 표현은 재미를 사기로 바꾸므로 쓰지 않는다.

---

## 6. 오프라인 대응

네트워크가 없어도 **오늘 것을 이미 받아둔 사용자에게는 그대로 보여준다.** 상세 구현(Background Sync 큐, `navigator.onLine` 한계, 429/529 graceful degradation)은 `frontend/pwa-offline-llm-fallback`을 따른다.

이 스킬이 더하는 규칙:

| 상황 | 동작 |
|---|---|
| 오늘 운세가 **이미 캐시됨** + 오프라인 | 캐시본을 정상 표시. "오프라인" 배지만 작게 표기 |
| 오늘 운세가 **아직 없음** + 오프라인 | **로컬에서 임의 생성 금지.** "연결되면 오늘의 운세를 준비할게요" 안내 |
| 서비스 데이가 바뀌었는데 오프라인 | 어제 운세를 오늘 것처럼 보여주지 않는다. 날짜를 명시하고 대기 상태로 |
| LLM 429/529 | 재시도 큐에 넣고 대기 UI. **폴백으로 아무 문구나 만들어 채우지 않는다** |

```ts
// SW 캐시 전략: 오늘 운세는 NetworkFirst + 서비스 데이 키를 캐시 키에 포함
const cacheKey = `/api/fortune/today?d=${serviceDay}`;
// 날짜가 바뀌면 캐시 키 자체가 달라지므로 어제 응답이 오늘로 새어나오지 않는다
```

> **원칙: 운세는 "없으면 없다"고 말한다.** 오프라인 폴백으로 그럴듯한 문구를 즉석 생성하면 사용자는 그것을 진짜 자기 운세로 받아들이고, 다음 날 캐시본과 어긋나 신뢰가 깨진다.

---

## 7. 흔한 실수

| 실수 | 증상 | 해결 |
|---|---|---|
| 클라이언트 `new Date()`로 날짜 키 생성 | 기기 시간·tz 조작으로 무제한 리롤 | 서버가 서비스 데이 키 생성·응답에 포함(§1-5) |
| `SELECT → INSERT`만으로 캐싱 | 두 탭 동시 진입 시 서로 다른 운세 생성 | PK/UNIQUE + `ON CONFLICT DO NOTHING` 후 재조회 |
| `Cache-Control`에 `private` 누락 | CDN이 남의 운세를 다른 사용자에게 서빙 | 개인화 응답엔 항상 `private` |
| Temporal을 폴리필 없이 사용 | iOS Safari에서 런타임 에러 | `Intl.DateTimeFormat` 사용(§1-4) |
| 로컬 `new Date(y, m, d)`로 날짜 산술 | 실행 환경 tz가 섞여 하루 어긋남 | 벽시계 값 추출 후 `Date.UTC`로 산술 |
| 오프셋을 직접 더해 다음 자정 계산 | DST·표준시 변경 시 1시간 어긋남 | 경계 이분 탐색(§1-3) |
| 탭 열어둔 채 경계 넘김 | 어제 운세가 계속 표시됨 | 경계 타이머 + `visibilitychange` 재검증 |
| 첫 진입 시 푸시 권한 요청 | dismiss 누적 → 영구 차단 | 2~3회 조회 후 앱 내 UI로 사전 동의 |
| 전 사용자 동일 UTC 시각 발송 | 해외 사용자가 새벽에 수신 | 사용자 tz 기준 15분 버킷 크론 |
| 미열람 누적에도 동일 빈도 발송 | OS 단 영구 차단 → 복구 불가 | 자동 감쇠·일시중지(§3-4) |
| 불안 조성 문구로 CTR 상승 확인 | 단기 지표는 오르고 장기 이탈·신뢰 붕괴 | 초대 톤 문구표(§3-5) |
| 스트릭 보상 = 추가 조회권 | 하루 1회 경계 무력화 | 보상은 테마·배지 등 비-운세 재화 |
| 오프라인에서 임의 운세 생성 | 가짜 결과를 진짜로 신뢰 | 생성 불가 시 대기 안내(§6) |
| 공유 URL에 사주·생년월일 원본 노출 | 링크로 개인정보 유출 | 만료되는 토큰 기반 요약 카드 URL |
| 수신 동의 기본 체크 | 사용자 의사와 무관한 구독 → 대량 차단 | 기본 해제 + 명시적 동의 |

---

## 8. 짝 스킬 연계

| 작업 | 참조 |
|---|---|
| 푸시 구독·발송·SW 핸들러·iOS 제약 | `frontend/pwa-push-notifications` |
| Service Worker 등록·precache | `frontend/vite-pwa-service-worker` |
| 오프라인·LLM 실패 폴백 | `frontend/pwa-offline-llm-fallback` |
| 카카오톡 공유 미리보기 | `frontend/kakao-share-optimization` |
| 공유 카드 OG 이미지 생성 | `frontend/og-image-generation` |
| 운세 본문·푸시 요약 생성 프롬프트(hedging 톤) | `meta/fortune-interpretation-prompt-engineering` |

**통합 흐름:**

```
서버 크론(tz 버킷) → 오늘 운세 사전 생성(LLM 1회, write-once)
   → 푸시 발송(pwa-push-notifications, 초대 톤·빈도 게이트)
   → 앱 진입 → 캐시 히트(재호출 없음) → 결과 + 한 줄 고지
   → 공유(kakao-share-optimization + og-image-generation, 요약 카드)
   → 오프라인 재방문 → 캐시본 표시(pwa-offline-llm-fallback)
   → 다음 서비스 데이 경계에서 자동 무효화
```
