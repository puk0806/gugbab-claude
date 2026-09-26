---
name: ingredient-management
description: 식재료 관리 도메인 모델 — 보관 위치·카테고리·소비기한·수량 관리 패턴. PWA 오프라인 앱용 로컬 상태 설계 포함.
---

# Ingredient Management — 식재료 관리 도메인 모델

> 소스: 국내 식재료 관리 앱(유통기한 언제지·원더 프리지·BEEP) 도메인 분석
> 검증일: 2026-06-26

---

## 핵심 도메인 모델

### Ingredient (식재료)

```ts
interface Ingredient {
  id: string;                    // UUID
  name: string;                  // 식재료명 (예: "닭가슴살")
  category: IngredientCategory;  // 식품 분류
  storageLocation: StorageLocation; // 보관 위치
  quantity: number;              // 수량
  unit: IngredientUnit;          // 단위
  purchaseDate: string;          // 구매일 (ISO 8601)
  expiryDate?: string;           // 소비기한 (없으면 undefined)
  memo?: string;                 // 메모
  createdAt: string;
  updatedAt: string;
}
```

### IngredientCategory (식품 분류)

```ts
type IngredientCategory =
  | 'grain'        // 곡류·서류 (쌀, 감자, 고구마)
  | 'vegetable'    // 채소류
  | 'fruit'        // 과일류
  | 'meat'         // 육류
  | 'seafood'      // 어패류
  | 'egg_dairy'    // 난류·유제품
  | 'bean_nut'     // 콩류·견과류
  | 'processed'    // 가공식품
  | 'sauce'        // 양념·소스
  | 'other';       // 기타
```

### StorageLocation (보관 위치)

```ts
type StorageLocation =
  | 'fridge'       // 냉장
  | 'freezer'      // 냉동
  | 'pantry'       // 상온 (식료품 창고·찬장)
  | 'counter';     // 실온 (바나나·토마토 등)
```

### IngredientUnit (수량 단위)

```ts
type IngredientUnit =
  | 'g'     // 그램
  | 'kg'    // 킬로그램
  | 'ml'    // 밀리리터
  | 'l'     // 리터
  | 'ea'    // 개 (개수)
  | 'pack'  // 팩
  | 'can'   // 캔
  | 'bag';  // 봉지
```

---

## 식재료 상태 분류

```ts
type IngredientStatus =
  | 'fresh'     // 신선 (소비기한 7일 이상)
  | 'warning'   // 임박 (소비기한 3~7일)
  | 'urgent'    // 주의 (소비기한 3일 이내)
  | 'expired'   // 만료
  | 'no_expiry'; // 소비기한 없음 (장기 보관 가능)

// 기기 시간대와 무관하게 한국 날짜로 판정 (health/meal-recommendation-prompt와 동일 패턴)
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const todayInSeoul = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now); // 'YYYY-MM-DD'

// 'YYYY-MM-DD' -> UTC epoch ms. 형식 오류·존재하지 않는 날짜(2026-02-30 등)는 null
const parseDateOnly = (s: unknown): number | null => {
  if (typeof s !== 'string') return null;
  const m = DATE_RE.exec(s.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const dt = new Date(t);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return t;
};

const getIngredientStatus = (ingredient: Ingredient, now: Date = new Date()): IngredientStatus => {
  // 소비기한 "없음"은 필드 자체가 없을 때(undefined/null)만. 빈 문자열 ''은 입력 오류로 보고 아래에서 expired 처리
  if (ingredient.expiryDate === undefined || ingredient.expiryDate === null) return 'no_expiry';

  const today = parseDateOnly(todayInSeoul(now))!; // todayInSeoul은 항상 유효한 YYYY-MM-DD를 반환
  const expiry = parseDateOnly(ingredient.expiryDate);
  if (expiry === null) return 'expired'; // 빈 값·형식 오류·2026-02-30 같은 존재하지 않는 날짜는 안전하게 만료 취급

  const daysLeft = Math.round((expiry - today) / 86_400_000); // 달력 날짜 단위 정수 비교 (시각 정보 배제)

  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 3) return 'urgent';  // 당일(0)도 urgent — "오늘까지 사용하세요" 알림과 동일 기준
  if (daysLeft <= 7) return 'warning';
  return 'fresh';
};
```

**❌ 금지 패턴 (KST 날짜 경계에서 최대 ±1일 오차 — 방향은 대칭이 아니다)**

> 오차 방향은 시각에 따라 달라진다: KST 오전(UTC 전날)에는 남은 일수가 **적게** 계산돼 `warning`이 `urgent`로 과경보되고, `Math.ceil` 반올림과 겹치면 반대로 만료 당일이 `urgent`(=-0)로 남아 **덜 급하게** 보일 수 있다. 어느 쪽이든 경계가 흔들리므로 아래 패턴은 쓰지 않는다.

```ts
// new Date('YYYY-MM-DD')는 UTC 자정으로 파싱되고, new Date()는 현재 시각(시:분 포함)이다.
// "오늘 몇 시인지"에 따라 두 인스턴트 사이에 최대 9시간 오차가 생겨
// daysLeft가 실제 KST 달력 날짜 차이와 어긋난다 (예: urgent가 warning으로 밀림).
// 이 오차는 기기 OS 시간대 설정과 무관하게(Date는 항상 UTC 인스턴트) 발생한다.
const today = new Date();
const expiry = new Date(ingredient.expiryDate);
const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
```

| 경계 | 처리 |
|------|------|
| 소비기한 = 오늘 (KST) | `daysLeft: 0` → `urgent` — "오늘까지 사용하세요" 알림과 동일 기준 |
| 소비기한 < 오늘 (KST) | `expired` |
| 자정 전후(KST 00:30 등) | `todayInSeoul`(Intl `timeZone: 'Asia/Seoul'`)로 판정 — `new Date('YYYY-MM-DD')` UTC 파싱 + 로컬 `getTime()` 비교 금지 |
| 소비기한 빈 문자열·형식 오류(`26/9/30`)·존재하지 않는 날짜(`2026-02-30`)·시각 포함 문자열 | `expired`로 안전 처리 — `expiryDate`는 `YYYY-MM-DD`만 저장, UI에서 재입력 유도 |
| 소비기한 필드 없음(`undefined`/`null`) | `no_expiry` — 소금·설탕 등 장기 보관 품목. 빈 문자열과 구분 |

---

## 보관 위치별 식재료 기본 소비기한 참고

| 식재료 | 냉장 | 냉동 | 상온 |
|--------|------|------|------|
| 생닭 | 2일 | 9개월 | — |
| 소·돼지고기 | 3~5일 | 4~6개월 | — |
| 생선(생) | 1~2일 | 6개월 | — |
| 달걀 | 3~5주 | — | 1~2주 |
| 우유 | 개봉 후 5~7일 | — | — |
| 배추김치 | 1~2개월 | 6개월 | — |
| 밥 | 3~4일 | 1개월 | — |
| 감자·고구마 | 1~2주 | — | 1~2주 (서늘한 곳) |
| 양파 | 1~2개월 | — | 1~2개월 |
| 마늘 | 3개월 | 6~12개월 | 2~4주 |

> **주의**: 위 수치는 일반적인 참고값이며 개봉·조리 여부에 따라 달라짐

---

## 식재료 목록 상태 관리 (PWA 로컬)

### 권장 로컬 저장 구조 (IndexedDB / Dexie)

```ts
// Dexie 스키마
class FridgeDatabase extends Dexie {
  ingredients!: Table<Ingredient>;

  constructor() {
    super('FridgeDB');
    this.version(1).stores({
      // 인덱스: id(primary), category, storageLocation, expiryDate
      ingredients: '++id, category, storageLocation, expiryDate',
    });
  }
}
```

### 핵심 쿼리 패턴

```ts
// 소비기한 임박 순 정렬 — 오름차순(가장 먼저 만료되는 것이 앞). expiryDate 없는 항목은 제외됨
const getSortedByExpiry = () =>
  db.ingredients
    .where('expiryDate')
    .above('') // expiryDate 있는 것만 — IndexedDB는 인덱스 키가 undefined인 레코드를 인덱스에 넣지 않으므로
               // where('expiryDate') 범위 쿼리에서 소비기한 없는(no_expiry) 품목은 자동으로 빠진다
    .sortBy('expiryDate');

// 위치별 필터
const getByLocation = (location: StorageLocation) =>
  db.ingredients.where('storageLocation').equals(location).toArray();

// 카테고리별 필터
const getByCategory = (category: IngredientCategory) =>
  db.ingredients.where('category').equals(category).toArray();

// 전체 (소비기한 만료 제외, KST 기준)
const getAvailable = async () => {
  const all = await db.ingredients.toArray();
  // new Date().toISOString()은 UTC 기준 날짜라 KST 자정 전후로 하루 밀린다 — todayInSeoul 사용
  const today = todayInSeoul();
  // 판정은 getIngredientStatus 한 곳에 위임한다 — 문자열 비교(expiryDate >= today)를 따로 두면
  // 빈 문자열·형식 오류('26/9/30'은 사전순으로 today보다 커서 통과)가 여기서만 새어 나간다
  return all.filter(i => getIngredientStatus(i) !== 'expired');
};
```

> `getAvailable`과 `getIngredientStatus`가 서로 다른 규칙으로 판정하면 목록에는 보이는데 상태는 "만료"인 불일치가 생긴다. 만료 판정 로직은 `getIngredientStatus` 하나로 유지한다.

> Dexie 버전: 위 스키마 API(`version().stores()`, `Table<T>`, `where().above().sortBy()`)는 Dexie 3.x·4.x 공통이다. 4.x에서 `Table` 타입은 `import { Dexie, type Table } from 'dexie'`로 가져온다.
> 주의: Dexie 4.x import 경로는 설치 버전의 타입 정의로 확인할 것.

---

## 식단 추천을 위한 식재료 목록 추출

식단 추천 AI에 넘길 식재료 컨텍스트 포맷:

```ts
const buildIngredientContext = async (): Promise<string> => {
  const available = await getAvailable();

  // 상태별 그룹핑
  const urgent = available.filter(i => getIngredientStatus(i) === 'urgent');
  const warning = available.filter(i => getIngredientStatus(i) === 'warning');
  const fresh = available.filter(i =>
    ['fresh', 'no_expiry'].includes(getIngredientStatus(i))
  );

  const format = (items: Ingredient[]) =>
    items.map(i => `${i.name} (${i.quantity}${i.unit})`).join(', ');

  return `
[빨리 써야 하는 식재료 (3일 이내)]
${urgent.length > 0 ? format(urgent) : '없음'}

[곧 사용해야 하는 식재료 (7일 이내)]
${warning.length > 0 ? format(warning) : '없음'}

[보유 중인 식재료]
${fresh.length > 0 ? format(fresh) : '없음'}
`.trim();
};
```

---

## 카테고리별 기본 아이콘 매핑 (UI 참고)

| 카테고리 | 이모지 | 한글명 |
|----------|--------|--------|
| grain | 🌾 | 곡류·서류 |
| vegetable | 🥦 | 채소류 |
| fruit | 🍎 | 과일류 |
| meat | 🥩 | 육류 |
| seafood | 🐟 | 어패류 |
| egg_dairy | 🥚 | 난류·유제품 |
| bean_nut | 🫘 | 콩류·견과류 |
| processed | 🥫 | 가공식품 |
| sauce | 🧂 | 양념·소스 |
| other | 📦 | 기타 |

---

## 알림 트리거 기준

| 상황 | 트리거 시점 | 알림 내용 |
|------|-----------|----------|
| 소비기한 임박 | D-3, D-1 | "[식재료명] 소비기한이 N일 남았어요" |
| 소비기한 당일 | D-day | "[식재료명] 오늘까지 사용하세요" |
| 재고 부족 | quantity ≤ 임계값 | "[식재료명] 재고가 얼마 남지 않았어요" |
