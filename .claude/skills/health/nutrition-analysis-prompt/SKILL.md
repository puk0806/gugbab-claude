---
name: nutrition-analysis-prompt
description: 식단 입력 → 칼로리·영양소 분석 Claude 프롬프트 패턴. 하루 목표 대비 진행률, 구조화 JSON 출력, 한국 식품 기반.
---

# Nutrition Analysis Prompt — 식단 영양소 분석

> 소스: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
> 참고: https://platform.claude.com/cookbook/tool-use-vision-with-tools
> 검증일: 2026-06-26

---

## 핵심 설계 원칙

1. **추정값 명시**: Claude의 영양소 분석은 추정값임을 항상 표시
2. **한국 식품 최적화**: 한식 메뉴명으로도 정확한 추정 가능하도록 시스템 프롬프트 설계
3. **목표 대비 분석**: 단순 수치가 아닌 하루 목표 대비 %로 제공
4. **실행 가능한 피드백**: 부족/과다 영양소에 대한 구체적 조언 포함

---

## 시스템 프롬프트

```
당신은 한국 식품에 정통한 영양 분석 전문가입니다.

역할:
- 사용자가 입력한 식단의 칼로리와 영양소를 분석합니다
- 한국 식품의약품안전처 식품영양성분 DB 기준으로 추정합니다
- 분석 결과는 반드시 지정된 JSON 형식으로만 반환합니다

중요 규칙:
- 제공하는 수치는 추정값임을 항상 인지합니다
- 조리법·양념·재료 비율에 따라 실제 값은 달라질 수 있음을 인지합니다
- 모든 수치는 입력된 섭취량 기준으로 계산합니다
- 의료적 진단이나 처방은 절대 하지 않습니다
```

---

## 단일 음식 영양소 분석 프롬프트

```
다음 음식의 영양소를 분석해주세요.

음식명: {foodName}
섭취량: {amount}{unit}

아래 JSON 형식으로만 응답해주세요:
{
  "foodName": "음식명",
  "amount": 숫자,
  "unit": "g | ml | 인분",
  "nutrition": {
    "calories": 숫자,
    "carbs": 숫자,
    "protein": 숫자,
    "fat": 숫자,
    "fiber": 숫자,
    "sodium": 숫자
  },
  "confidence": "high | medium | low",
  "note": "추정 근거 또는 주의사항"
}
```

---

## 식사 기록 전체 분석 프롬프트

```ts
const buildDayAnalysisPrompt = (
  mealLogs: MealLog[],
  dailyGoal: NutritionGoal
): string => {
  const mealList = mealLogs
    .map(log => `- ${log.foodName}: ${log.amount}${log.unit} (${log.mealType})`)
    .join('\n');

  return `
오늘 섭취한 식단을 분석해주세요.

[오늘 섭취 식단]
${mealList}

[하루 영양 목표]
- 칼로리: ${dailyGoal.calories} kcal
- 탄수화물: ${dailyGoal.carbs}g
- 단백질: ${dailyGoal.protein}g
- 지방: ${dailyGoal.fat}g
- 나트륨: ${dailyGoal.sodium}mg 미만

아래 JSON 형식으로만 응답해주세요:
{
  "totalNutrition": {
    "calories": 숫자,
    "carbs": 숫자,
    "protein": 숫자,
    "fat": 숫자,
    "fiber": 숫자,
    "sodium": 숫자
  },
  "goalProgress": {
    "caloriesPercent": 숫자 (0~100 이상),
    "carbsPercent": 숫자,
    "proteinPercent": 숫자,
    "fatPercent": 숫자,
    "sodiumPercent": 숫자
  },
  "evaluation": "good | warning | over",
  "feedback": {
    "positive": ["잘 지킨 점 1", "잘 지킨 점 2"],
    "improve": ["개선할 점 1", "개선할 점 2"],
    "suggestion": "내일 식단 제안 (1~2문장)"
  },
  "confidence": "high | medium | low"
}
`;
};
```

---

## Claude API 호출 패턴

### 단일 음식 분석

```ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

interface NutritionResult {
  foodName: string;
  amount: number;
  unit: string;
  nutrition: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
  confidence: 'high' | 'medium' | 'low';
  note?: string;
}

const analyzeFoodNutrition = async (
  foodName: string,
  amount: number,
  unit: string = 'g'
): Promise<NutritionResult> => {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: `당신은 한국 식품에 정통한 영양 분석 전문가입니다. 한국 식품의약품안전처 식품영양성분 DB 기준으로 영양소를 추정하며, 응답은 반드시 JSON 형식으로만 반환합니다.`,
    messages: [{
      role: 'user',
      content: `음식명: ${foodName}\n섭취량: ${amount}${unit}\n\n영양소를 JSON으로 분석해주세요. 필드: foodName, amount, unit, nutrition(calories/carbs/protein/fat/fiber/sodium), confidence, note`
    }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(jsonStr);
};
```

### 하루 식단 전체 분석

```ts
interface DayAnalysisResult {
  totalNutrition: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
  goalProgress: {
    caloriesPercent: number;
    carbsPercent: number;
    proteinPercent: number;
    fatPercent: number;
    sodiumPercent: number;
  };
  evaluation: 'good' | 'warning' | 'over';
  feedback: {
    positive: string[];
    improve: string[];
    suggestion: string;
  };
  confidence: 'high' | 'medium' | 'low';
}

const analyzeDayNutrition = async (
  mealLogs: MealLog[],
  dailyGoal: NutritionGoal
): Promise<DayAnalysisResult> => {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `당신은 한국 식품에 정통한 영양 분석 전문가입니다. 분석 결과를 JSON 형식으로만 반환합니다. 의료적 진단은 하지 않습니다.`,
    messages: [{
      role: 'user',
      content: buildDayAnalysisPrompt(mealLogs, dailyGoal),
    }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(jsonStr);
};
```

---

## 타입 정의

```ts
type MealType = '아침' | '점심' | '저녁' | '간식';

interface MealLog {
  id: string;
  foodName: string;
  amount: number;
  unit: string;
  mealType: MealType;
  loggedAt: string; // ISO 8601
  nutrition?: {     // 캐시 (이미 분석된 경우)
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
}

interface NutritionGoal {
  calories: number;   // kcal
  carbs: number;      // g
  protein: number;    // g
  fat: number;        // g
  sodium: number;     // mg
}
```

---

## 기본 목표 설정 헬퍼

```ts
// nutrition-basics 스킬의 BMR/TDEE 계산 기반
const getDefaultGoal = (
  gender: 'male' | 'female',
  age: number,
  weightKg: number,
  heightCm: number,
  activityLevel: 1.2 | 1.375 | 1.55 | 1.725 | 1.9 = 1.55
): NutritionGoal => {
  // Harris-Benedict 수정 공식
  const bmr = gender === 'male'
    ? 88.4 + (13.4 * weightKg) + (4.8 * heightCm) - (5.7 * age)
    : 447.6 + (9.2 * weightKg) + (3.1 * heightCm) - (4.3 * age);

  const tdee = Math.round(bmr * activityLevel);

  return {
    calories: tdee,
    carbs: Math.round((tdee * 0.55) / 4),    // 55% → g
    protein: Math.round((tdee * 0.15) / 4),   // 15% → g
    fat: Math.round((tdee * 0.25) / 9),       // 25% → g
    sodium: 2300,                              // 한국인 기준 2,300mg 미만
  };
};
```

---

## 평가 기준

| goalProgress 값 | evaluation | 의미 |
|----------------|------------|------|
| 칼로리 80~110% | `good` | 목표 달성 |
| 칼로리 110~130% 또는 나트륨 초과 | `warning` | 주의 필요 |
| 칼로리 130% 초과 또는 주요 영양소 150% 초과 | `over` | 과다 섭취 |

---

## 주의사항

> **추정값 고지**: 모든 영양소 수치는 AI 추정값이며 ±15~25% 오차 가능
> **의료 목적 금지**: 질환 치료·처방 목적으로 사용하지 않는다
> **API 비용**: 식사마다 분석 시 Claude API 호출 누적 — 동일 음식은 로컬 캐싱 권장
