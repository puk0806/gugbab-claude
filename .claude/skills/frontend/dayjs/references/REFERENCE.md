## 국제화 (i18n)

### 로케일 설정

```typescript
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

// 전역 설정
dayjs.locale('ko');
dayjs().format('dddd');  // "금요일"

// 인스턴스별 설정 (전역 영향 없음)
dayjs().locale('ko').format('dddd');  // "금요일"
dayjs().locale('ja').format('dddd');  // "金曜日"
```

### 한국어 로케일 + relativeTime

```typescript
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('ko');

dayjs('2024-03-10').fromNow();         // "5일 전"
dayjs().add(3, 'hour').fromNow();      // "3시간 후"
dayjs().subtract(2, 'day').fromNow();  // "2일 전"
```

---

## TypeScript 사용

Day.js는 TypeScript 타입 내장 (`@types/dayjs` 별도 설치 불필요).

```typescript
import dayjs, { Dayjs } from 'dayjs';

// 타입
const date: Dayjs = dayjs();
const dateOrNull: Dayjs | null = someCondition ? dayjs() : null;

// 함수 시그니처
function formatDate(date: Dayjs): string {
  return date.format('YYYY-MM-DD');
}

function getDateRange(start: Dayjs, end: Dayjs): number {
  return end.diff(start, 'day');
}

// props 타입
interface DateRangeProps {
  startDate: Dayjs;
  endDate: Dayjs;
  onChange: (start: Dayjs, end: Dayjs) => void;
}
```

### 플러그인 타입 확장

플러그인 import 후 타입이 자동 확장됨.

```typescript
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// 이제 .fromNow(), .utc(), .tz() 타입이 인식됨
dayjs().fromNow();        // OK
dayjs.utc();              // OK
dayjs().tz('Asia/Seoul'); // OK
```

---

## React 패턴

### 날짜 포맷 유틸리티

```typescript
// utils/date.ts
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.locale('ko');

/** 표시용 포맷 */
export const formatDate = (date: string | Date) =>
  dayjs(date).format('YYYY.MM.DD');

export const formatDateTime = (date: string | Date) =>
  dayjs(date).format('YYYY.MM.DD HH:mm');

export const formatTime = (date: string | Date) =>
  dayjs(date).format('HH:mm');

/** 상대 시간 ("3분 전", "2일 전") */
export const timeAgo = (date: string | Date) =>
  dayjs(date).fromNow();

/** 조건부 포맷: 오늘이면 시간, 올해면 월/일, 아니면 연/월/일 */
export const smartFormat = (date: string | Date): string => {
  const d = dayjs(date);
  const now = dayjs();

  if (d.isSame(now, 'day')) return d.format('HH:mm');
  if (d.isSame(now, 'year')) return d.format('M월 D일');
  return d.format('YYYY.MM.DD');
};
```

### 서버 날짜 변환 패턴

```typescript
// API 응답 날짜를 Dayjs로 변환
interface ApiResponse {
  createdAt: string;  // ISO 8601 문자열
  updatedAt: string;
}

// 표시 시에만 포맷 — 상태에는 문자열 그대로 저장
function PostItem({ post }: { post: ApiResponse }) {
  return (
    <article>
      <time dateTime={post.createdAt}>
        {formatDate(post.createdAt)}
      </time>
      <span>{timeAgo(post.updatedAt)}</span>
    </article>
  );
}
```

### 날짜 범위 계산

```typescript
// 최근 7일 / 30일 필터
const getDateRange = (range: '7d' | '30d' | '90d') => {
  const end = dayjs();
  const days = { '7d': 7, '30d': 30, '90d': 90 };
  const start = end.subtract(days[range], 'day');

  return {
    startDate: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD'),
  };
};
```

### dayjs 초기화 패턴 (앱 진입점)

SSR/Next.js 환경에서는 서버·클라이언트 양쪽 모두 같은 초기화 파일을 import해야 hydration mismatch 방지.

```typescript
// src/lib/dayjs.ts — 앱 전체에서 이 파일만 import
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

dayjs.locale('ko');
dayjs.tz.setDefault('Asia/Seoul');

export default dayjs;
```

```typescript
// 컴포넌트에서 사용
import dayjs from '@/lib/dayjs';  // 플러그인 이미 등록됨
```

---

## date-fns에서 dayjs 마이그레이션

| date-fns | Day.js |
|----------|--------|
| `format(date, 'yyyy-MM-dd')` | `dayjs(date).format('YYYY-MM-DD')` |
| `addDays(date, 7)` | `dayjs(date).add(7, 'day')` |
| `subMonths(date, 1)` | `dayjs(date).subtract(1, 'month')` |
| `differenceInDays(a, b)` | `dayjs(a).diff(dayjs(b), 'day')` |
| `isBefore(a, b)` | `dayjs(a).isBefore(dayjs(b))` |
| `isAfter(a, b)` | `dayjs(a).isAfter(dayjs(b))` |
| `startOfMonth(date)` | `dayjs(date).startOf('month')` |
| `endOfMonth(date)` | `dayjs(date).endOf('month')` |
| `parseISO(str)` | `dayjs(str)` |
| `formatDistanceToNow(date)` | `dayjs(date).fromNow()` (relativeTime 플러그인) |
| `isValid(date)` | `dayjs(date).isValid()` |
| `getYear(date)` | `dayjs(date).year()` |
| `getMonth(date)` | `dayjs(date).month()` |
| `getWeek(date)` | `dayjs(date).week()` (weekOfYear 플러그인) |

**포맷 토큰 차이 (핵심):**

| 의미 | date-fns | Day.js |
|------|----------|--------|
| 4자리 연도 | `yyyy` | `YYYY` |
| 2자리 일 | `dd` | `DD` |
| 24시간 | `HH` | `HH` |
| AM/PM | `a` | `A` |
| 분기 | `Q` (advancedFormat 없이 불가) | `Q` (advancedFormat) |

> 주의: date-fns는 소문자 `yyyy`, `dd` / Day.js는 대문자 `YYYY`, `DD`. 포맷 문자열 일괄 치환 필요.

---

## 흔한 실수

### 1. month()가 0-indexed

```typescript
// 실수: 3월을 기대하지만 4월
dayjs().month(3); // 4월 (0=1월, 1=2월, 2=3월, 3=4월)

// 올바른 방법
dayjs().month(2); // 3월
```

### 2. 원본 변경 기대 (불변성 무시)

```typescript
// 실수: date가 변경되지 않음
const date = dayjs('2024-03-15');
date.add(1, 'day');  // 새 인스턴스 반환, date는 그대로
console.log(date.format('YYYY-MM-DD')); // "2024-03-15"

// 올바른 방법
const nextDay = date.add(1, 'day');
console.log(nextDay.format('YYYY-MM-DD')); // "2024-03-16"
```

### 3. 플러그인 미등록

```typescript
// 실수: extend 없이 사용 → 런타임 에러
dayjs().fromNow();  // TypeError: fromNow is not a function

// 올바른 방법
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs().fromNow();  // OK
```

### 4. timezone 플러그인에 utc 미등록

```typescript
// 실수: utc 없이 timezone만 등록
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(timezone);
dayjs().tz('Asia/Seoul'); // 에러 또는 잘못된 결과

// 올바른 방법: utc 먼저 등록
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
```

### 5. 비표준 포맷 파싱 실패

```typescript
// 실수: customParseFormat 없이 비표준 문자열 파싱
dayjs('15-03-2024').isValid(); // false 또는 잘못된 날짜

// 올바른 방법
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
dayjs('15-03-2024', 'DD-MM-YYYY').isValid(); // true
```

### 6. SSR에서 로케일 미설정으로 hydration mismatch

```typescript
// 실수: 클라이언트에서만 locale 설정
// → 서버 "5 days ago", 클라이언트 "5일 전" → hydration 오류

// 올바른 방법: 초기화 파일에서 locale 설정 후 서버/클라이언트 모두 import
// src/lib/dayjs.ts에서 locale 설정 → 모든 곳에서 해당 파일 import
```

### 7. diff 세 번째 인자 없이 소수점 기대

```typescript
// 실수
dayjs('2024-04-01').diff(dayjs('2024-03-15'), 'month'); // 0 (정수 절삭)

// 올바른 방법: 세 번째 인자 true
dayjs('2024-04-01').diff(dayjs('2024-03-15'), 'month', true); // 0.548...
```
