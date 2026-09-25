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

---

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

---

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
