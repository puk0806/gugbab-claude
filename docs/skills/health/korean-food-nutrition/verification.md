---
skill: korean-food-nutrition
category: health
version: v3
date: 2026-09-28
status: APPROVED
---

# korean-food-nutrition 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 식품안전나라·농촌진흥청·공공데이터포털 공식 문서 기반 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실사용 테스트 (skill-tester 수행 후)
  └─ APPROVED 전환 예정
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `korean-food-nutrition` |
| 스킬 경로 | `.claude/skills/korean-food-nutrition/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-06-26, 2026-09-28 재검증) |
| 검증자 | skill-creator |
| 스킬 버전 | v2 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (식품안전나라·농촌진흥청)
- [✅] 공공데이터 API 문서 확인 (data.go.kr)
- [✅] 식품 분류 카테고리 구조 정리
- [✅] 주요 한국 식품 영양 데이터 표 작성
- [✅] API 호출 코드 예시 작성 (JavaScript)
- [✅] SKILL.md 파일 작성
- [✅] skill-tester 에이전트 content test 수행 (2026-06-26)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "식품안전나라 국가표준식품성분표 영양성분 데이터베이스 2024" | 식품안전나라·data.go.kr·농촌진흥청 등 10개 소스 확인 |
| 직접 확인 | WebFetch | https://various.foodsafetykorea.go.kr/nutrient/ | DB 구조·영양성분 항목 확인 |
| API 확인 | WebSearch | 공공데이터포털 식품영양성분 API 문서 | AMT_NUM 필드 구조 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 식품안전나라 영양성분 DB | https://various.foodsafetykorea.go.kr/nutrient/ | ⭐⭐⭐ High | 2026-06-26 | 식약처 공식 |
| 공공데이터포털 식품영양성분DB API | https://www.data.go.kr/data/15127578/openapi.do | ⭐⭐⭐ High | 2026-06-26 | 공식 REST API |
| 농촌진흥청 국가표준식품성분표 | https://koreanfood.rda.go.kr/kfi/fct/fctFoodSrch/list | ⭐⭐⭐ High | 2026-06-26 | 농축수산물 중심 |
| 전국통합식품영양성분 음식 표준데이터 | https://www.data.go.kr/data/15100070/standard.do | ⭐⭐⭐ High | 2026-06-26 | 조리 후 음식 기준 |

---

## 4. 검증 체크리스트 (Test List)

### 3-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (식품안전나라 2024 업데이트 / 농촌진흥청 10개정판)
- [✅] deprecated 패턴 없음
- [✅] API 코드 예시가 실행 가능한 형태

### 3-2. 구조 완전성
- [✅] YAML frontmatter 포함
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 (식품 분류, 영양성분 항목)
- [✅] 코드 예시 포함 (API 호출, 환산 계산)
- [✅] 주의사항 포함 (수치 오차, 가공식품 포장지 우선)

### 3-3. 실용성
- [✅] 식단 앱 개발 시 API 연동에 바로 활용 가능
- [✅] 한국 식품 데이터 참조 테이블 포함
- [✅] 범용적으로 사용 가능

### 3-4. Claude Code 에이전트 활용 테스트
- [✅] skill-tester content test 수행 (2026-06-26)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester 재테스트 — wrapping 구조 정정 반영분(3차)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2개 병렬 호출)
**수행 방법**: SKILL.md Read 후 실전 질문 2개 답변. 직전 선택 보강(코드 `data.body.items` → `data.response.body.items` 정정 + `response`>`header`/`body`>`items` 공통 구조 설명 추가)이 실제 질문 답변에 정확히 반영되는지, 옛 코드(`data.body.items`)로 오답하지 않는지 확인

**Q1. 공공데이터포털 API로 "고등어" 검색 후 나트륨 값을 꺼내는 JavaScript 코드(정확한 접근 경로 포함) 작성**
- ✅ PASS
- 근거: SKILL.md "요청 예시 (JavaScript)" 코드(172~186행) + "응답 JSON 구조" 설명 문단(186행)
- 상세: `data.response.body.items`로 정확히 접근하는 코드를 작성했고, `items` 내부가 `item[]`로 한 번 더 감싸일 수 있다는 caveat까지 반영해 방어적으로(`Array.isArray` 분기) 코드를 짬. 옛 코드(`data.body.items`)로 오답하지 않음

**Q2. "data.body.items로 바로 접근하면 안 되나요?"라는 동료 오해를 SKILL.md 근거로 정정 + 다른 서비스 재사용 가능 여부**
- ✅ PASS
- 근거: SKILL.md 186행 "응답 JSON 구조" 설명 인용
- 상세: `data.body`가 `undefined`이므로 런타임 에러가 남을 정확히 지적하고, `response`>`header`(resultCode/resultMsg)>`body`(items 등) 공통 구조를 정확히 설명. "top-level wrapping은 공통 패턴이라 재사용 가능성 높지만 `items`/`items.item[]` 내부 구조는 서비스·`type` 파라미터별로 다를 수 있어 재사용 전 Swagger 재확인 필요"라는 SKILL.md의 caveat도 정확히 인용

### 발견된 gap (2026-09-28 3차 재테스트)

- 없음(차단 요인). 두 에이전트 모두 공통으로 "`items` 내부가 `item[]`로 감싸이는지 단일 배열인지, 필드 값의 데이터 타입(문자열/숫자)이 SKILL.md에 확정되어 있지 않다"고 지적했으나, 이는 이미 SKILL.md 186행이 "실제 연동 전 재확인 필요"로 명시한 기존 caveat의 재확인일 뿐 신규 발견이 아님 — 선택 보강(비차단)으로 기록

### 판정 (2026-09-28 3차 재테스트)

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (데이터 참조 스킬, content test로 APPROVED 전환 가능한 카테고리)
- 최종 상태: **APPROVED** (wrapping 구조 정정이 실전 질문에 정확히 반영됨을 확인, 옛 코드로 오답하지 않음)

---

### [2026-09-28] 선택 보강 반영

2026-09-28 재테스트(Q1)에서 발견된 gap — 응답 JSON 최상위 wrapping 구조(`data.body.items` vs 실제 구조) 설명 부족 — 을 반영. SKILL.md "요청 예시(JavaScript)" 코드의 `data.body.items`를 `data.response.body.items`로 정정하고, 공공데이터포털(data.go.kr) API 공통 응답 구조(`response` > `header`/`body` > `items`) 설명 문단을 추가.

- 근거: 공공데이터포털 OpenAPI는 `response` 최상위 키 아래 `header`(resultCode/resultMsg)·`body`(items/numOfRows/pageNo/totalCount)로 감싸는 것이 표준 공통 응답 구조임을 WebSearch로 교차 확인(복수의 data.go.kr 연동 예제·GitHub 클라이언트 코드에서 동일 구조 `{"response":{"body":{"items":{"item":[...]}}}} ` 확인). 이 스킬이 참조하는 특정 서비스(FoodNtrCpntDbInfo03/getFoodNtrCpntDbInq03)의 Swagger 원문은 data.go.kr 활용신청 승인 후에만 열람 가능해(WebFetch 403/게이트웨이 차단) 직접 대조는 못했으므로, SKILL.md에 "서비스별 `items`/`items.item` 중첩 여부는 실제 연동 전 재확인" caveat을 명시함
- **코드 수정**: `data.body.items` → `data.response.body.items` (기존 코드는 존재하지 않는 wrapping을 가정한 실질적 오류였음)
- status: 코드 예시 오류를 수정했으므로 PENDING_TEST로 전환 (메인이 skill-tester 재테스트 예정)

**수행일**: 2026-09-28 (재테스트)
**수행자**: skill-tester → general-purpose (2개 병렬 호출)
**수행 방법**: SKILL.md Read 후 실전 질문 2개 답변, 2026-09-28 재검증에서 정정된 API 엔드포인트·응답 필드 매핑을 직접 겨냥. 근거 섹션 및 anti-pattern(옛 엔드포인트·필드로 오답) 회피 확인

### 실제 수행 테스트 (2026-09-28 재테스트)

**Q1. 공공데이터포털 API로 "고등어" 검색 후 나트륨·비타민C 파싱하는 JavaScript 코드 작성 (엔드포인트·필드명 명시)**
- ✅ PASS
- 근거: SKILL.md "식품의약품안전처 식품영양성분DB API" 섹션(엔드포인트·필드 표) + "요청 예시" 코드
- 상세: 정정된 엔드포인트 `FoodNtrCpntDbInfo03/getFoodNtrCpntDbInq03`, 나트륨 `AMT_NUM13`, 비타민C `AMT_NUM21`, 소문자 `serviceKey` 파라미터까지 정확히 반영한 코드 작성. 옛 엔드포인트(`FoodNtrIrdntInfoService1`)·옛 필드(`AMT_NUM17`=나트륨, `AMT_NUM22`=비타민C)로 오답하지 않음

**Q2. 국가표준식품성분표 최신 개정판·DB 갱신 주기·가공식품 우선순위**
- ✅ PASS
- 근거: SKILL.md 상단 "기준" 인용문 + "공식 데이터 소스" 표 + "주의사항" 섹션
- 상세: 제10개정판(2022, 11개정판 미발간)·식품안전나라 매월 업데이트·가공식품은 "포장지 영양성분표가 가장 정확, DB는 참고용"으로 정확히 답변

### 발견된 gap (2026-09-28 재테스트)

- 없음(차단 요인). Q1에서 응답 JSON 최상위 wrapping 구조(`data.body.items` 단일 배열 vs `items.item` 중첩) 세부 설명 부족을 테스트 에이전트가 지적 — 선택 보강 사항으로 기존 섹션 7 항목("개별 식품 수치 1:1 대조")과 별개로 낮은 우선순위 후속 과제로 기록

### 판정 (2026-09-28 재테스트)

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (데이터 참조 스킬, content test로 APPROVED 전환 가능한 카테고리)
- 최종 상태: APPROVED (API 엔드포인트·필드 매핑 정정이 실전 질문에 정확히 반영됨을 확인)

---

### 최초 테스트 (2026-06-26)

**수행일**: 2026-06-26
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 닭가슴살 150g 섭취 시 단백질·칼로리 계산 및 DB 환산 코드 패턴**
- ✅ PASS
- 근거: SKILL.md "단백질 식품" 표 (닭가슴살 100g: 109kcal, 단백질 23.0g) + "1회 제공량 환산 팁" 섹션 (150g 예시 직접 기재)
- 상세: 34.5g 단백질, 163.5kcal 정확히 도출. AMT_NUM1·AMT_NUM3 필드 활용 코드 패턴도 조합 가능

**Q2. 공공데이터 API로 "고등어" 검색 시 파라미터 및 에너지·단백질·나트륨 응답 필드**
- ✅ PASS
- 근거: SKILL.md "공공데이터 API 활용 > 식품의약품안전처 식품영양성분DB API" 섹션
- 상세: FOOD_NM_KR='고등어', ServiceKey, pageNo, numOfRows, type='json' 파라미터 확인. AMT_NUM1(에너지), AMT_NUM3(단백질), AMT_NUM17(나트륨) 필드명 정확히 기재됨

**Q3. 식품 DB 수치 정확도 주의사항 및 가공식품 DB vs 포장지 우선순위**
- ✅ PASS
- 근거: SKILL.md "주의사항" 섹션
- 상세: 10~30% 오차 가능성 명시. 가공식품은 포장지 영양성분표 우선, DB는 참고용으로 명확히 구분됨

### 발견된 gap

- 조리 후 중량 변화에 따른 보정 계수 미제공 (DB는 원재료 기준이나 보정 방법 구체화 권장) — 선택 보강
- API 응답 필드 AMT_NUM9~16 일부 누락 (칼륨·인·철 등) — 선택 보강

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (데이터 참조 스킬)
- 최종 상태: APPROVED (2026-09-28 재검증으로 PENDING_TEST 전환 — 아래 참고)

---

### [2026-09-28] 재검증 — API 엔드포인트·응답 필드 매핑 오류 발견, 정정

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 5개를 1차 소스와 대조. 공공데이터포털 API(15127578) 상세페이지는 WebFetch 요약이 Swagger 위젯 내용을 누락해, curl로 원본 HTML을 직접 내려받아 임베디드 Swagger JSON(`"AMT_NUM17":{"type":"string","description":"..."}` 등)을 grep으로 직접 추출 후 대조.

**클레임 대조 결과**:
1. 공공데이터포털 API 엔드포인트 → **DISPUTED** — 기존 SKILL.md는 `https://apis.data.go.kr/1471000/FoodNtrIrdntInfoService1/getFoodNtrItdntList1`로 기재. data.go.kr(15127578) 현재 Swagger 명세를 직접 curl로 대조한 결과 실제 서비스명은 `FoodNtrCpntDbInfo03`, 오퍼레이션은 `getFoodNtrCpntDbInq03`(v03) — 구버전(v1) 서비스명이 그대로 남아있던 것으로 판단, 정정
2. 응답 필드 AMT_NUM17(나트륨), AMT_NUM22(비타민C) → **DISPUTED** — data.go.kr Swagger 응답 스키마 원문 직접 대조 결과 `AMT_NUM17`=베타카로틴(μg), `AMT_NUM22`=비타민D(μg). 실제 나트륨은 `AMT_NUM13`, 비타민C는 `AMT_NUM21`. AMT_NUM1~10(에너지·수분·단백질·지방·회분·탄수화물·당류·식이섬유·칼슘·철)은 기존 기재와 일치 확인(VERIFIED)
3. serviceKey 파라미터 표기 → DISPUTED(경미) — 공식 스펙은 소문자 시작 `serviceKey`. 기존 SKILL.md의 `ServiceKey` 표기 정정
4. 농촌진흥청 국가표준식품성분표 최신 개정판 → **VERIFIED, 변경 없음** — 2026-09-28 현재도 제10개정판(2022 발간)이 최신이며 11개정판 미발간(nics.go.kr/food 공식 페이지 직접 확인). 단, 도메인이 `koreanfood.rda.go.kr` → `www.nics.go.kr/food/...`로 이전(301 리다이렉트, 기존 링크도 동작은 함) 확인 후 정정
5. 식품안전나라 식품영양성분DB 갱신 주기 → DISPUTED(경미) — 기존 SKILL.md "분기 업데이트"·"(2024 업데이트)" 기재를 WebSearch로 대조한 결과 실제로는 매월 업데이트되는 상시 플랫폼(최근 갱신일 2026-06-01 확인 시점 기준) — "매월 업데이트"로 정정, 특정 연도 고정 표현 삭제

**실전 질문 재검증**:
- Q1. "공공데이터포털 식품영양성분DB API로 식품명 검색 시 기본 엔드포인트와 나트륨 필드는?" → 정정 전 SKILL.md 그대로 사용하면 존재하지 않는 서비스명(FoodNtrIrdntInfoService1)과 틀린 필드(AMT_NUM17=베타카로틴을 나트륨으로 오인)로 실패했을 것 → 정정 후 SKILL.md "식품의약품안전처 식품영양성분DB API" 섹션 근거로 PASS
- Q2. "국가표준식품성분표 최신판은 몇 개정판인가?" → SKILL.md 헤더 근거로 "제10개정판(2022), 11개정판 미발간" PASS

**재검증 최종 판정**: API 엔드포인트·응답 필드 매핑에서 실질적 오류(서비스가 존재하지 않는 이름으로 기재되어 있었고, 나트륨·비타민C 필드가 다른 영양소를 가리키고 있었음) 발견·정정. 개별 식품 영양가 표(백미·시금치 등)는 이번 재검증 범위 밖(기존 섹션7 "선택 보강" 상태 유지). API 정정 범위가 실사용에 직접 영향을 주므로 재테스트 필요 → status **PENDING_TEST 전환(재테스트 필요)**

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-06-26) + ✅ (2/2 PASS, 2026-09-28 재테스트 — 정정된 엔드포인트·필드 매핑 반영 확인) + ✅ (2/2 PASS, 2026-09-28 3차 재테스트 — wrapping 구조 정정 반영 확인) |
| 2026-09-28 재검증 | API 엔드포인트·응답 필드 매핑 오류 정정(FoodNtrCpntDbInfo03, AMT_NUM13/21), 도메인 이전·갱신주기 표현 정정 |
| 2026-09-28 선택 보강 | 응답 JSON wrapping 구조 오류(`data.body.items`→`data.response.body.items`) 정정 + 공통 구조 설명 추가 |
| **최종 판정** | **APPROVED** (2026-09-28 3차 재테스트 2/2 PASS — wrapping 구조 정정이 실전 질문에 정확히 반영됨을 확인) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 후 오류 항목 보완 (2026-06-26 완료, 3/3 PASS)
- [❌] 개별 식품 수치를 농촌진흥청 성분표와 1:1 대조 확인 — 선택 보강, 비차단 (수치 오차 ±10~30%는 이미 주의사항에 명시됨)
- [✅] 공공데이터포털 API 엔드포인트·응답 필드 명세를 Swagger 원문과 1:1 대조 (2026-09-28 완료 — 엔드포인트·나트륨·비타민C 필드 오류 발견 및 정정)
- [✅] skill-tester 2단계 실사용 재테스트 (2026-09-28 완료, 2/2 PASS — 정정된 API 엔드포인트·필드 매핑이 실전 질문에 정확히 반영됨을 확인, APPROVED 전환)
- [✅] (2026-09-28 반영) 응답 JSON 최상위 wrapping 구조 세부 설명 보강 — 2026-09-28 재테스트에서 발견. `data.body.items`가 실제로는 존재하지 않는 구조였음을 확인, `data.response.body.items`로 코드 정정 + `response`/`header`/`body`/`items` 공통 구조 설명 추가. 단, 이 서비스의 정확한 `items` 내부 중첩(item 배열 여부)은 Swagger 원문 미열람으로 "실제 연동 전 재확인" caveat으로 보류
- [✅] skill-tester 2단계 3차 재테스트 (2026-09-28 완료, 2/2 PASS — wrapping 구조 정정이 실전 질문에 정확히 반영됨을 확인, 옛 코드로 오답하지 않음, PENDING_TEST → APPROVED 전환)
- [❌] `items` 내부 `item[]` 중첩 여부·필드 값 데이터 타입(문자열/숫자)을 서비스별 Swagger 원문으로 확정 — 선택 보강, 비차단(활용신청 게이트로 원문 미열람, 이미 "실제 연동 전 재확인" caveat으로 우회 처리됨)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-26 | v1 | 최초 작성 | skill-creator |
| 2026-06-26 | v1 | 2단계 실사용 테스트 수행 (Q1 닭가슴살 150g 영양소 환산 / Q2 공공데이터 API 파라미터·응답필드 / Q3 수치 정확도·가공식품 우선순위) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-28 | v2 | 재검증 — 공공데이터포털 API 엔드포인트가 실제 존재하지 않는 서비스명(FoodNtrIrdntInfoService1)으로 기재되어 있던 것을 발견, `FoodNtrCpntDbInfo03/getFoodNtrCpntDbInq03`로 정정. 응답 필드 AMT_NUM17(나트륨→베타카로틴), AMT_NUM22(비타민C→비타민D) 매핑 오류 정정(나트륨=AMT_NUM13, 비타민C=AMT_NUM21). 농촌진흥청 도메인 이전(koreanfood.rda.go.kr→nics.go.kr) 및 식품안전나라 DB 갱신주기(분기→매월) 표현 정정. 국가표준식품성분표는 제10개정판으로 변경 없음 확인. APPROVED → PENDING_TEST 전환(재테스트 필요) | skill-creator (재검증) |
| 2026-09-28 | v2 | 2단계 재테스트 수행 (Q1 고등어 API 검색 나트륨·비타민C 코드 / Q2 국가표준식품성분표 개정판·갱신주기·가공식품 우선순위) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-28 | v3 | 선택 보강 반영 — 응답 JSON 최상위 wrapping 구조 설명 추가 및 코드 오류 정정(`data.body.items` → `data.response.body.items`). WebSearch로 data.go.kr 공통 응답 구조(response>header/body>items) 교차 확인, 서비스별 Swagger 원문은 활용신청 게이트로 미열람 — caveat 명시. status APPROVED → PENDING_TEST (코드 예시 변경, 메인이 재테스트 예정) | Claude (Opus 5.5) |
| 2026-09-28 | v3 | 2단계 3차 재테스트 수행 (Q1 고등어 API 나트륨 파싱 코드 — 정확한 응답 경로 포함 / Q2 "data.body.items로 바로 접근하면 안 되나" 오해 정정 + 타 서비스 재사용 가능 여부) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
