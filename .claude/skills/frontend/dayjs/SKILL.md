---
name: dayjs
description: Day.js 날짜 라이브러리 핵심 패턴 — 파싱/포맷/조작/비교, 플러그인, i18n, TypeScript, React 패턴, date-fns 마이그레이션
---

# Day.js 날짜 라이브러리

> 소스: https://day.js.org/docs/en/installation/installation
> 소스: https://github.com/iamkun/dayjs/blob/dev/CHANGELOG.md
> 검증일: 2026-04-20
> 버전: 1.11.20 (2026-03-12 릴리즈)

---

## 라이브러리 선택 기준

| 기준 | Day.js | date-fns v3 | Temporal (TC39 Stage 4) |
|------|--------|-------------|------------------------|
| 번들 크기 | ~2KB (코어) | 13KB+ (Tree-shake 가능) | 네이티브 (폴리필 시 큼) |
| API 스타일 | 체이닝 (Moment 호환) | 함수형 (순수 함수) | 네이티브 객체 메서드 |
| 불변성 | 불변 | 불변 | 불변 |
| 타임존 | 플러그인 (dayjs/plugin/timezone) | date-fns-tz | 네이티브 지원 |
| Moment 마이그레이션 | API 거의 동일, 쉬움 | API 완전히 다름 | API 완전히 다름 |
| 프로덕션 준비 | 안정 (1.11.20) | 안정 (v3) | Chrome 144+, Firefox 139+ (2026-01~) |

> 주의: Temporal API는 2026-03-11 TC39 Stage 4 달성, Chrome 144+ / Firefox 139+에서 네이티브 지원. Safari는 2026년 말 전체 지원 예정. 레거시 브라우저 대상 프로젝트는 폴리필 또는 Day.js 유지.

**선택 지침:**
- Moment.js에서 마이그레이션 → **Day.js** (API 호환, 드롭인 교체)
- 함수형 프로그래밍, Tree-shaking 극대화 → **date-fns**
- 체이닝 스타일 선호, 최소 번들 → **Day.js**
- 타임존 복잡한 처리 → **Day.js + timezone 플러그인** 또는 **date-fns-tz**
- Chrome 144+/Firefox 139+ 전용 신규 프로젝트 → **Temporal** 고려

---

## 설치

```bash
npm install dayjs
```

TypeScript 타입 내장 — `@types/dayjs` 별도 설치 불필요.  
`tsconfig.json`에 `"esModuleInterop": true` 권장 (default import 사용 시).

---

## 기본 사용

### 파싱

```typescript
import dayjs from 'dayjs';

// 현재 시각
const now = dayjs();

// 문자열 파싱 (ISO 8601)
const date = dayjs('2024-03-15');
const dateTime = dayjs('2024-03-15T10:30:00');

// Date 객체
const fromDate = dayjs(new Date());

// 타임스탬프 (밀리초)
const fromTimestamp = dayjs(1710460800000);

// Unix 타임스탬프 (초) — dayjs.unix()
const fromUnix = dayjs.unix(1710460800);
```

> 주의: 비표준 포맷 파싱 시 반드시 `customParseFormat` 플러그인 사용. 플러그인 없이 `dayjs('15-03-2024')` 하면 Invalid Date.

```typescript
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const parsed = dayjs('15-03-2024', 'DD-MM-YYYY');
```

### 포맷

```typescript
dayjs().format();                    // ISO 8601 (기본)
dayjs().format('YYYY-MM-DD');        // "2024-03-15"
dayjs().format('YYYY년 M월 D일');     // "2024년 3월 15일"
dayjs().format('HH:mm:ss');          // "10:30:00"
dayjs().format('YYYY-MM-DD HH:mm'); // "2024-03-15 10:30"
dayjs().format('ddd');               // "Fri" (로케일에 따라 변경)
```

**주요 포맷 토큰:**

| 토큰 | 출력 | 설명 |
|------|------|------|
| `YYYY` | 2024 | 4자리 연도 |
| `MM` | 03 | 0-패딩 월 |
| `M` | 3 | 월 |
| `DD` | 05 | 0-패딩 일 |
| `D` | 5 | 일 |
| `HH` | 09 | 0-패딩 24시간 |
| `hh` | 09 | 0-패딩 12시간 |
| `mm` | 30 | 분 |
| `ss` | 45 | 초 |
| `A` | AM/PM | 오전/오후 |
| `ddd` | Mon | 요일 약어 |
| `dddd` | Monday | 요일 전체 |

### 조작 (Manipulation)

Day.js는 **불변(immutable)** — 모든 조작 메서드는 새 인스턴스 반환.

```typescript
const base = dayjs('2024-03-15');

// 더하기
base.add(7, 'day');        // 2024-03-22
base.add(1, 'month');      // 2024-04-15
base.add(1, 'year');       // 2025-03-15
base.add(2, 'hour');

// 빼기
base.subtract(1, 'week');  // 2024-03-08

// 시작/끝
base.startOf('month');     // 2024-03-01 00:00:00
base.endOf('month');       // 2024-03-31 23:59:59
base.startOf('week');      // 로케일의 주 시작일 기준
base.startOf('day');       // 당일 00:00:00

// 설정
base.set('year', 2025);
base.set('month', 0);     // 0-indexed (0 = 1월)
```

> 주의: `month`는 0-indexed. `dayjs().month(0)` = 1월.

### 비교

```typescript
const a = dayjs('2024-03-15');
const b = dayjs('2024-04-01');

a.isBefore(b);                    // true
a.isAfter(b);                     // false
a.isSame(b);                      // false (밀리초 단위 비교)
a.isSame(b, 'month');             // false (3월 vs 4월)
a.isSame(dayjs('2024-03-20'), 'month'); // true (둘 다 3월)

// 차이 — diff(비교대상, 단위, 소수점여부)
a.diff(b, 'day');                 // -17
b.diff(a, 'day');                 // 17
b.diff(a, 'month');               // 0 (정수 절삭)
b.diff(a, 'month', true);        // 0.5... (세 번째 인자 true → 소수점)
```

### Getter

```typescript
const d = dayjs('2024-03-15T10:30:45');

d.year();        // 2024
d.month();       // 2 (0-indexed, 3월)
d.date();        // 15 (일)
d.day();         // 5 (요일, 0=일요일)
d.hour();        // 10
d.minute();      // 30
d.second();      // 45
d.millisecond(); // 0

d.daysInMonth(); // 31
d.toDate();      // native Date 객체
d.toJSON();      // ISO 문자열
d.unix();        // Unix 타임스탬프 (초)
d.valueOf();     // 밀리초 타임스탬프
```

### 유효성 검사

```typescript
dayjs('2024-03-15').isValid();   // true
dayjs('invalid').isValid();       // false
dayjs('2024-13-40').isValid();    // false
```

---

## 플러그인 시스템

Day.js 코어는 최소화. 기능 확장은 플러그인으로.

```typescript
import dayjs from 'dayjs';
import pluginName from 'dayjs/plugin/pluginName';

dayjs.extend(pluginName);
```

### relativeTime — 상대 시간

```typescript
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

dayjs('2024-03-10').fromNow();                       // "5 days ago"
dayjs('2024-03-10').from(dayjs('2024-03-15'));        // "5 days ago"
dayjs('2024-03-20').toNow();                         // "in 5 days"
dayjs('2024-03-20').to(dayjs('2024-03-15'));          // "5 days ago"
```

### utc — UTC 모드

```typescript
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

dayjs.utc();                        // 현재 UTC
dayjs.utc('2024-03-15T10:00:00');   // UTC로 파싱
dayjs().utc().format();             // 로컬 → UTC 변환
dayjs.utc().local();                // UTC → 로컬 변환
dayjs().isUTC();                    // UTC 모드인지 확인
```

### timezone — 타임존 변환

```typescript
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);  // utc 플러그인 선행 필수

dayjs().tz('America/New_York');                          // 뉴욕 시간으로 변환
dayjs.tz('2024-03-15 10:00', 'Asia/Seoul');              // 서울 시간으로 파싱
dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm Z');   // +09:00

// 기본 타임존 설정
dayjs.tz.setDefault('Asia/Seoul');
```

> 주의: timezone 플러그인은 utc 플러그인에 의존. 반드시 utc를 먼저 extend.

### duration — 기간 계산

```typescript
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const dur = dayjs.duration(3600000);  // 밀리초
dur.hours();     // 1
dur.minutes();   // 0
dur.asHours();   // 1
dur.asMinutes(); // 60

// 객체로 생성
const dur2 = dayjs.duration({ hours: 2, minutes: 30 });
dur2.asMinutes(); // 150

// ISO 8601 duration
const dur3 = dayjs.duration('PT1H30M');
dur3.asMinutes(); // 90

// 두 날짜 사이 duration
const diff = dayjs.duration(dayjs('2024-04-01').diff(dayjs('2024-03-15')));
diff.asDays(); // 17
```

### customParseFormat — 커스텀 포맷 파싱

```typescript
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

dayjs('15/03/2024', 'DD/MM/YYYY');
dayjs('2024년 3월 15일', 'YYYY년 M월 D일');
dayjs('03-15-2024 10:30 PM', 'MM-DD-YYYY hh:mm A');

// strict 모드 (세 번째 인자 true)
dayjs('15-03-2024', 'DD-MM-YYYY', true).isValid(); // true
dayjs('15/03/2024', 'DD-MM-YYYY', true).isValid(); // false (구분자 불일치)
```

### isBetween — 범위 체크

```typescript
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const target = dayjs('2024-03-15');
target.isBetween('2024-03-01', '2024-03-31');             // true
target.isBetween('2024-03-01', '2024-03-31', 'day');      // true
target.isBetween('2024-03-01', '2024-03-15', 'day', '[]'); // true (양쪽 포함)
target.isBetween('2024-03-01', '2024-03-15', 'day', '[)'); // false (끝 미포함)
```

### isSameOrBefore / isSameOrAfter

```typescript
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

dayjs('2024-03-15').isSameOrBefore('2024-03-15'); // true
dayjs('2024-03-15').isSameOrAfter('2024-03-10');  // true
```

### weekOfYear — 연간 주차

```typescript
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekOfYear);

dayjs('2024-03-15').week(); // 11 (해당 연도의 몇 번째 주)
```

### weekday — 로케일 기반 요일

```typescript
import weekday from 'dayjs/plugin/weekday';
dayjs.extend(weekday);

dayjs().weekday(0); // 로케일 주 시작일 (ko면 월요일)
dayjs().weekday(6); // 로케일 주 마지막일
```

### advancedFormat — 추가 포맷 토큰

```typescript
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);

dayjs().format('Q');  // 1~4 (분기)
dayjs().format('Do'); // "15th" (서수 일)
dayjs().format('X');  // Unix 타임스탬프 (초)
dayjs().format('x');  // Unix 타임스탬프 (밀리초)
```

### localizedFormat — 로케일별 포맷 단축키

```typescript
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

dayjs().format('L');   // "04/20/2026" (로케일 날짜)
dayjs().format('LL');  // "April 20, 2026"
dayjs().format('LT');  // "10:30 AM"
dayjs().format('LTS'); // "10:30:00 AM"
```

### quarterOfYear — 분기

```typescript
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
dayjs.extend(quarterOfYear);

dayjs('2024-03-15').quarter();     // 1
dayjs('2024-07-01').quarter();     // 3
dayjs().add(1, 'quarter');
dayjs().startOf('quarter');
```

### minMax — 최소/최대 날짜

```typescript
import minMax from 'dayjs/plugin/minMax';
dayjs.extend(minMax);

dayjs.max(dayjs('2024-03-15'), dayjs('2024-04-01')); // 2024-04-01
dayjs.min(dayjs('2024-03-15'), dayjs('2024-04-01')); // 2024-03-15
```

---

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
