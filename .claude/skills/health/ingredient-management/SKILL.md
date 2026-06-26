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

const getIngredientStatus = (ingredient: Ingredient): IngredientStatus => {
  if (!ingredient.expiryDate) return 'no_expiry';

  const today = new Date();
  const expiry = new Date(ingredient.expiryDate);
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 3) return 'urgent';
  if (daysLeft <= 7) return 'warning';
  return 'fresh';
};
```

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
// 소비기한 임박 순 정렬
const getSortedByExpiry = () =>
  db.ingredients
    .where('expiryDate')
    .above('') // expiryDate 있는 것만
    .sortBy('expiryDate');

// 위치별 필터
const getByLocation = (location: StorageLocation) =>
  db.ingredients.where('storageLocation').equals(location).toArray();

// 카테고리별 필터
const getByCategory = (category: IngredientCategory) =>
  db.ingredients.where('category').equals(category).toArray();

// 전체 (소비기한 만료 제외)
const getAvailable = async () => {
  const all = await db.ingredients.toArray();
  const today = new Date().toISOString().split('T')[0];
  return all.filter(i => !i.expiryDate || i.expiryDate >= today);
};
```

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
