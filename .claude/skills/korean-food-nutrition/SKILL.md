---
name: korean-food-nutrition
description: 한국 식품 영양 데이터 — 식품안전나라 DB·농촌진흥청 국가표준식품성분표 기준 주요 식품 영양 정보와 API 활용 패턴
---

# Korean Food Nutrition — 한국 식품 영양 데이터

> 소스: https://various.foodsafetykorea.go.kr/nutrient/ | https://www.nics.go.kr/food/kfi/fct/fctFoodSrch/list (구 koreanfood.rda.go.kr, 301 리다이렉트) | https://www.data.go.kr/data/15127578/openapi.do
> 기준: 식품안전나라 식품영양성분DB (매월 업데이트되는 상시 플랫폼) / 농촌진흥청(국립식량과학원) 국가표준식품성분표 제10개정판(2022, DB는 연 1회 이상 갱신 — 2026-09 기준 11개정판 미발간)
> 검증일: 2026-09-28 (최초 2026-06-26, 2026-09-28 재검증)

---

## 공식 데이터 소스

| 소스 | URL | 특징 |
|------|-----|------|
| 식품안전나라 영양성분 DB | https://various.foodsafetykorea.go.kr/nutrient/ | 가공식품 포함, 매월 업데이트 |
| 공공데이터포털 API | https://www.data.go.kr/data/15127578/openapi.do | REST API 제공 |
| 농촌진흥청 국가표준식품성분표 | https://www.nics.go.kr/food/kfi/fct/fctFoodSrch/list (구 도메인 koreanfood.rda.go.kr는 301 리다이렉트로 계속 작동) | 농·축·수산물 중심, 제10개정판(2022) |
| 공공데이터 음식 성분 | https://www.data.go.kr/data/15100070/standard.do | 음식(조리 후) 기준 |

---

## 영양성분 DB 구조

### 제공 영양성분 항목 (100g 기준)

```
필수 항목:
- 에너지 (kcal)
- 수분 (g)
- 단백질 (g)
- 지방 (g)
- 탄수화물 (g)
- 당류 (g)
- 식이섬유 (g)
- 나트륨 (mg)

선택 항목:
- 칼륨 (mg)
- 칼슘 (mg)
- 인 (mg)
- 철 (mg)
- 비타민 A (μg RAE)
- 비타민 C (mg)
- 포화지방산 (g)
- 콜레스테롤 (mg)
```

### 식품 분류 카테고리

| 대분류 | 예시 |
|--------|------|
| 곡류·서류 | 쌀, 밀, 감자, 고구마 |
| 채소류 | 배추, 시금치, 무, 브로콜리 |
| 과일류 | 사과, 배, 바나나, 딸기 |
| 육류 | 소고기, 돼지고기, 닭고기 |
| 어패류 | 고등어, 새우, 오징어 |
| 난류 | 달걀 |
| 유제품 | 우유, 요거트, 치즈 |
| 콩류·견과류 | 두부, 콩, 아몬드 |
| 가공식품 | 라면, 빵, 과자 |
| 음식(조리 후) | 김치찌개, 비빔밥, 된장국 |

---

## 주요 한국 식품 영양 정보 (100g 기준)

### 곡류

| 식품명 | 에너지(kcal) | 탄수화물(g) | 단백질(g) | 지방(g) |
|--------|-------------|------------|----------|--------|
| 백미(밥) | 143 | 31.6 | 2.7 | 0.3 |
| 현미(밥) | 145 | 30.8 | 3.3 | 0.7 |
| 식빵 | 264 | 51.5 | 8.0 | 3.4 |
| 라면(조리 후) | 136 | 20.3 | 3.6 | 4.1 |

### 채소류

| 식품명 | 에너지(kcal) | 탄수화물(g) | 단백질(g) | 지방(g) |
|--------|-------------|------------|----------|--------|
| 배추 | 12 | 2.1 | 1.2 | 0.2 |
| 시금치 | 23 | 3.5 | 2.7 | 0.3 |
| 브로콜리 | 28 | 4.3 | 3.7 | 0.4 |
| 양파 | 38 | 8.6 | 1.1 | 0.1 |
| 당근 | 37 | 8.2 | 0.8 | 0.2 |

### 과일류

| 식품명 | 에너지(kcal) | 탄수화물(g) | 단백질(g) | 지방(g) |
|--------|-------------|------------|----------|--------|
| 사과 | 52 | 13.1 | 0.3 | 0.2 |
| 바나나 | 89 | 22.8 | 1.1 | 0.3 |
| 딸기 | 32 | 7.7 | 0.7 | 0.2 |
| 귤 | 43 | 10.3 | 0.7 | 0.2 |

### 단백질 식품

| 식품명 | 에너지(kcal) | 탄수화물(g) | 단백질(g) | 지방(g) |
|--------|-------------|------------|----------|--------|
| 소고기(안심) | 140 | 0 | 22.1 | 5.6 |
| 돼지고기(삼겹살) | 331 | 0 | 17.5 | 29.0 |
| 닭가슴살 | 109 | 0 | 23.0 | 1.2 |
| 달걀(전체) | 147 | 0.9 | 12.5 | 10.1 |
| 두부(연두부) | 47 | 2.0 | 4.8 | 2.2 |
| 고등어(생) | 183 | 0 | 20.2 | 11.8 |
| 새우(생) | 84 | 0.1 | 20.1 | 0.6 |

### 유제품

| 식품명 | 에너지(kcal) | 탄수화물(g) | 단백질(g) | 지방(g) |
|--------|-------------|------------|----------|--------|
| 우유(전유) | 61 | 4.8 | 3.0 | 3.5 |
| 그릭요거트 | 59 | 3.6 | 10.2 | 0.4 |
| 아몬드 | 578 | 21.6 | 21.2 | 49.9 |

### 한국 대표 음식 (1인분 기준)

| 음식명 | 에너지(kcal) | 1인분 기준 | 비고 |
|--------|-------------|-----------|------|
| 비빔밥 | 550 | 1공기 약 400g | 재료 구성 따라 차이 |
| 된장찌개 | 150 | 1인분 300g | |
| 김치찌개 | 180 | 1인분 300g | 돼지고기 포함 시 |
| 삼겹살 구이 | 430 | 200g | |
| 떡볶이 | 380 | 1인분 250g | |
| 김밥 | 330 | 1줄 220g | |

---

## 공공데이터 API 활용

### 식품의약품안전처 식품영양성분DB API

> 2026-09-28 재검증: 기존에 기재된 엔드포인트(`FoodNtrIrdntInfoService1/getFoodNtrItdntList1`)는 data.go.kr(15127578) 현재 API 명세와 불일치 확인. 실제 서비스명은 `FoodNtrCpntDbInfo03`(오퍼레이션 `getFoodNtrCpntDbInq03`, v03)이며, data.go.kr에 공개된 Swagger 응답 스키마를 직접 대조한 결과 `AMT_NUM17`=나트륨·`AMT_NUM22`=비타민C라는 기존 기재도 오류로 확인(실제 `AMT_NUM17`=베타카로틴, `AMT_NUM22`=비타민D). 아래는 정정된 값.

```
기본 URL: https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo03/getFoodNtrCpntDbInq03
인증: 공공데이터포털 API Key 필요

주요 파라미터:
- serviceKey: API 인증키 (공식 파라미터명은 소문자 시작 — 대소문자 구분됨)
- pageNo: 페이지 번호
- numOfRows: 페이지당 결과 수 (최대 100)
- FOOD_NM_KR: 식품명 (한글 검색)
- FOOD_CD: 식품 코드

응답 필드 (AMT_NUM1~157 중 자주 쓰는 항목 — 전체 목록은 data.go.kr 상세페이지 Swagger 참고):
- FOOD_NM_KR: 식품명
- AMT_NUM1: 에너지 (kcal)
- AMT_NUM2: 수분 (g)
- AMT_NUM3: 단백질 (g)
- AMT_NUM4: 지방 (g)
- AMT_NUM5: 회분 (g)
- AMT_NUM6: 탄수화물 (g)
- AMT_NUM7: 당류 (g)
- AMT_NUM8: 식이섬유 (g)
- AMT_NUM9: 칼슘 (mg)
- AMT_NUM10: 철 (mg)
- AMT_NUM11: 인 (mg)
- AMT_NUM12: 칼륨 (mg)
- AMT_NUM13: 나트륨 (mg)  ← (정정: 기존 AMT_NUM17은 오류)
- AMT_NUM21: 비타민 C (mg)  ← (정정: 기존 AMT_NUM22는 오류)
- AMT_NUM22: 비타민 D (μg)
- AMT_NUM23: 콜레스테롤 (mg)
- AMT_NUM24: 포화지방산 (g)
```

### 요청 예시 (JavaScript)

```js
const searchFood = async (foodName) => {
  const url = new URL('https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo03/getFoodNtrCpntDbInq03');
  url.searchParams.set('serviceKey', process.env.FOOD_API_KEY);
  url.searchParams.set('pageNo', '1');
  url.searchParams.set('numOfRows', '20');
  url.searchParams.set('FOOD_NM_KR', foodName);
  url.searchParams.set('type', 'json');

  const res = await fetch(url.toString());
  const data = await res.json();
  return data.response.body.items; // 영양성분 배열 (아래 "응답 JSON 구조" 참고)
};
```

> **응답 JSON 구조**: 공공데이터포털(data.go.kr) API는 공통적으로 최상위를 `response`로 감싸고, 그 안에 `header`(resultCode·resultMsg)와 `body`(items·numOfRows·pageNo·totalCount)를 중첩한다 — 즉 `data.body.items`가 아니라 `data.response.body.items`. `items` 내부가 `item` 배열로 한 번 더 감싸이는지(`items.item[]`) 단일 배열로 오는지는 서비스·`type`(json/xml) 파라미터에 따라 달라질 수 있으므로, 실제 연동 전 해당 서비스의 data.go.kr 상세페이지 Swagger 응답 예시로 반드시 재확인할 것.

---

## 1회 제공량 환산 팁

```
식품 DB는 기본 100g 기준 → 실제 섭취량으로 환산 필요

예: 닭가슴살 150g 섭취 시
  단백질: 23.0g (100g 기준) × 1.5 = 34.5g
  칼로리: 109kcal × 1.5 = 163.5kcal
```

---

## 주의사항

> **수치 변동**: 식품 성분은 산지·조리법·품종에 따라 10~30% 오차 발생 가능
> **조리 후 기준**: DB는 원재료 기준이 기본 — 조리 시 수분 증발로 영양소 농도 변화
> **가공식품**: 포장지 영양성분표가 가장 정확, DB는 참고용
