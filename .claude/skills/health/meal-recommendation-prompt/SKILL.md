---
name: meal-recommendation-prompt
description: 보유 식재료 기반 식단·레시피 추천 Claude 프롬프트 패턴. 소비기한 우선순위 반영, 구조화된 JSON 출력 포함.
---

# Meal Recommendation Prompt — 식재료 기반 식단 추천

> 소스: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
> 검증일: 2026-06-26

---

## 핵심 설계 원칙

1. **소비기한 우선**: 곧 만료되는 식재료를 우선 활용하도록 지시
2. **현실적 추천**: 추가 재료 구매 최소화 (있는 재료만 또는 +1~2가지)
3. **구조화 출력**: JSON으로 받아 UI 렌더링에 바로 활용
4. **한국 식단 중심**: 한식 위주 + 간편식 혼합

---

## 시스템 프롬프트

```
당신은 한국 가정의 영양사 겸 요리 전문가입니다.

역할:
- 사용자가 보유한 식재료를 기반으로 현실적이고 맛있는 식단을 추천합니다
- 소비기한이 임박한 식재료를 우선적으로 활용합니다
- 한식 위주로 추천하되, 간편하게 만들 수 있는 요리를 선호합니다

규칙:
- 사용자가 갖고 있지 않은 재료는 최소 1~2가지만 추가 권장합니다
- 조리 시간을 항상 명시합니다 (10분 이내 / 30분 이내 / 30분 이상)
- 각 메뉴의 대략적인 칼로리를 함께 제공합니다
- 응답은 반드시 지정된 JSON 형식으로만 반환합니다
```

---

## 식단 추천 프롬프트 템플릿

```
다음 식재료로 만들 수 있는 식단을 추천해주세요.

{ingredientContext}

요청 사항:
- 추천 식단 수: {count}가지 (기본 3가지)
- 끼니 유형: {mealType} (아침/점심/저녁/간식 중 하나)
- 소비기한 임박 식재료를 최대한 활용해주세요
- 추가 재료가 필요하면 최소한으로 제안해주세요

아래 JSON 형식으로만 응답해주세요:
{
  "recommendations": [
    {
      "name": "음식명",
      "description": "한 줄 설명",
      "cookTime": "10분 이내 | 30분 이내 | 30분 이상",
      "calories": 숫자 (kcal, 1인분 기준),
      "usedIngredients": ["사용하는 보유 식재료"],
      "additionalIngredients": ["추가 필요한 재료 (없으면 빈 배열)"],
      "steps": ["조리 순서 1", "조리 순서 2", "조리 순서 3"],
      "tip": "요리 팁 또는 변형 방법 (선택)"
    }
  ],
  "urgentUsageNote": "소비기한 임박 식재료 활용 메모 (있을 경우)"
}
```

---

## ingredientContext 생성 패턴

```ts
const buildPromptContext = (ingredients: Ingredient[]): string => {
  const urgent = ingredients.filter(i => getIngredientStatus(i) === 'urgent');
  const warning = ingredients.filter(i => getIngredientStatus(i) === 'warning');
  const fresh = ingredients.filter(i =>
    ['fresh', 'no_expiry'].includes(getIngredientStatus(i))
  );

  const fmt = (items: Ingredient[]) =>
    items.map(i => `- ${i.name} (${i.quantity}${i.unit})`).join('\n');

  const sections = [];
  if (urgent.length > 0) sections.push(`🚨 빨리 써야 하는 식재료 (3일 이내):\n${fmt(urgent)}`);
  if (warning.length > 0) sections.push(`⚠️ 곧 사용해야 하는 식재료 (7일 이내):\n${fmt(warning)}`);
  if (fresh.length > 0) sections.push(`✅ 보유 중인 식재료:\n${fmt(fresh)}`);

  return sections.join('\n\n');
};
```

---

## Claude API 호출 패턴

```ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const getMealRecommendations = async (
  ingredients: Ingredient[],
  mealType: '아침' | '점심' | '저녁' | '간식' = '저녁',
  count: number = 3
) => {
  const ingredientContext = buildPromptContext(ingredients);

  const prompt = `
다음 식재료로 만들 수 있는 식단을 추천해주세요.

${ingredientContext}

요청 사항:
- 추천 식단 수: ${count}가지
- 끼니 유형: ${mealType}
- 소비기한 임박 식재료를 최대한 활용해주세요
- 추가 재료가 필요하면 최소한으로 제안해주세요

아래 JSON 형식으로만 응답해주세요:
{"recommendations": [...], "urgentUsageNote": "..."}
`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `당신은 한국 가정의 영양사 겸 요리 전문가입니다. 보유 식재료로 현실적인 한식 위주 식단을 추천하며, 소비기한 임박 재료를 우선 활용합니다. 응답은 반드시 JSON 형식으로만 반환합니다.`,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // JSON 파싱 (마크다운 코드블록 제거)
  const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(jsonStr);
};
```

---

## 스트리밍 버전 (PWA 응답 체감 개선)

```ts
const getMealRecommendationsStream = async (
  ingredients: Ingredient[],
  onChunk: (text: string) => void
) => {
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: '...위와 동일...',
    messages: [{ role: 'user', content: buildMealPrompt(ingredients) }],
  });

  let fullText = '';
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullText += chunk.delta.text;
      onChunk(chunk.delta.text);
    }
  }

  return JSON.parse(fullText.replace(/```json\n?|\n?```/g, '').trim());
};
```

---

## 추천 결과 타입 정의

```ts
interface MealRecommendation {
  name: string;
  description: string;
  cookTime: '10분 이내' | '30분 이내' | '30분 이상';
  calories: number;
  usedIngredients: string[];
  additionalIngredients: string[];
  steps: string[];
  tip?: string;
}

interface MealRecommendationResponse {
  recommendations: MealRecommendation[];
  urgentUsageNote?: string;
}
```

---

## 프롬프트 변형 패턴

### 특정 식재료 강제 사용

```
위 식재료 중 반드시 "{ingredientName}"을(를) 포함한 레시피를 추천해주세요.
```

### 칼로리 제한 추가

```
1인분 기준 {maxCalories}kcal 이하 메뉴만 추천해주세요.
```

### 조리 시간 제한

```
조리 시간 20분 이내의 간단한 메뉴만 추천해주세요.
```

### 식단 제한 조건

```
다음 조건을 반드시 지켜주세요: {dietaryRestriction}
예: "돼지고기 제외", "채식 위주", "저탄수화물"
```
