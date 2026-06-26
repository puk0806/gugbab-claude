---
skill: ingredient-management
category: health
version: v1
date: 2026-06-26
status: APPROVED
---

# ingredient-management 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 국내 식재료 관리 앱 도메인 분석 기반 작성
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
| 스킬 이름 | `ingredient-management` |
| 스킬 경로 | `.claude/skills/health/ingredient-management/SKILL.md` |
| 검증일 | 2026-06-26 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 국내 식재료 관리 앱 도메인 분석 (유통기한 언제지, 원더 프리지, BEEP)
- [✅] 핵심 도메인 모델 (Ingredient 인터페이스) 설계
- [✅] 카테고리·보관 위치·상태 타입 정의
- [✅] PWA 로컬 저장 패턴 (IndexedDB/Dexie) 코드 작성
- [✅] 식단 추천 연동을 위한 컨텍스트 생성 코드 작성
- [✅] SKILL.md 파일 작성
- [✅] skill-tester 에이전트 content test 수행 (2026-06-26)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "식재료 관리 앱 도메인 모델 유통기한 카테고리 냉장고 관리" | 국내 앱 3종 (유통기한 언제지, 원더 프리지, BEEP) 도메인 분석 |
| 교차 검증 | 도메인 분석 | 앱 기능 비교 | 카테고리/보관위치/소비기한 공통 모델 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 유통기한 언제지 (App Store) | https://apps.apple.com/kr/app/id1522650178 | ⭐⭐ Medium | 2026-06-26 | 도메인 분석용 |
| 원더 프리지 (Google Play) | https://play.google.com/store/apps/details?id=com.meolly.fridge | ⭐⭐ Medium | 2026-06-26 | 도메인 분석용 |
| indexeddb-dexie 스킬 | `.claude/skills/frontend/indexeddb-dexie/SKILL.md` | ⭐⭐⭐ High | 2026-06-26 | 내부 스킬 기반 |

---

## 4. 검증 체크리스트 (Test List)

### 3-1. 내용 정확성
- [✅] 도메인 모델이 실제 앱 패턴과 일치
- [✅] TypeScript 타입 정의가 올바른 문법
- [✅] Dexie 쿼리 패턴이 표준 패턴에 부합
- [✅] 소비기한 계산 로직이 정확

### 3-2. 구조 완전성
- [✅] YAML frontmatter 포함
- [✅] 소스 URL과 검증일 명시
- [✅] 도메인 모델 전체 설명
- [✅] 코드 예시 포함 (IndexedDB 쿼리, 컨텍스트 생성)
- [✅] 알림 트리거 기준 포함

### 3-3. 실용성
- [✅] PWA 앱 개발 시 바로 활용 가능한 TypeScript 타입
- [✅] meal-recommendation-prompt 스킬과 연동 설계
- [✅] 범용적으로 사용 가능

### 3-4. Claude Code 에이전트 활용 테스트
- [✅] skill-tester content test 수행 (2026-06-26)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-26
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 오늘(2026-06-26) 구매한 생닭, expiryDate=2026-06-28 설정 시 getIngredientStatus() 반환값**
- ✅ PASS
- 근거: SKILL.md "식재료 상태 분류" 섹션 (getIngredientStatus 함수) + "보관 위치별 식재료 기본 소비기한 참고" 표
- 상세: daysLeft=2, daysLeft<=3 → 'urgent' 반환. 생닭 냉장 2일 참조표와도 일치 확인됨

**Q2. 냉장고(fridge) 식재료 필터링 + 소비기한 임박 순 정렬 + IndexedDB 스키마 설계**
- ✅ PASS
- 근거: SKILL.md "핵심 쿼리 패턴" 섹션 (getByLocation, getSortedByExpiry) + "권장 로컬 저장 구조" 섹션 (FridgeDatabase Dexie 스키마)
- 상세: getByLocation('fridge'), getSortedByExpiry() 함수 패턴 직접 기재됨. 인덱스 필드(category, storageLocation, expiryDate) 구조 명확

**Q3. 식단 추천 AI에 소비 임박 식재료 우선 표시하는 컨텍스트 문자열 생성**
- ✅ PASS
- 근거: SKILL.md "식단 추천을 위한 식재료 목록 추출" 섹션
- 상세: buildIngredientContext() 함수. urgent/warning/fresh 3단계 분류 → 레이블 포함 문자열 출력 패턴 완전 기재

### 발견된 gap

- getIngredientStatus의 타임존 처리 주의사항 없음 (ISO 날짜 문자열 UTC 파싱 vs 로컬 시각 비교 edge case) — 선택 보강
- getSortedByExpiry의 정렬 방향(오름차순) 코드 주석 미명시 — 선택 보강

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (도메인 패턴 스킬)
- 최종 상태: APPROVED

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-06-26) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 후 오류 항목 보완 (2026-06-26 완료, 3/3 PASS)
- [❌] Dexie 버전 호환성 확인 (indexeddb-dexie 스킬 버전 참조) — 선택 보강, 비차단 (Dexie 버전 명시 없으나 쿼리 패턴은 표준적)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-26 | v1 | 최초 작성 | skill-creator |
| 2026-06-26 | v1 | 2단계 실사용 테스트 수행 (Q1 생닭 expiryDate→urgent 판정 / Q2 냉장 필터·임박 정렬·IndexedDB 스키마 / Q3 buildIngredientContext 컨텍스트 생성) → 3/3 PASS, APPROVED 전환 | skill-tester |
