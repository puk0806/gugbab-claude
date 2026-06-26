---
skill: nutrition-analysis-prompt
category: health
version: v1
date: 2026-06-26
status: APPROVED
---

# nutrition-analysis-prompt 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ Anthropic 공식 프롬프트 엔지니어링 가이드 기반 작성
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
| 스킬 이름 | `nutrition-analysis-prompt` |
| 스킬 경로 | `.claude/skills/health/nutrition-analysis-prompt/SKILL.md` |
| 검증일 | 2026-06-26 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] Anthropic 공식 프롬프트 엔지니어링 가이드 확인
- [✅] Claude vision + tools cookbook (영양 레이블 추출) 확인
- [✅] 단일 음식 분석 프롬프트 설계
- [✅] 하루 식단 전체 분석 프롬프트 설계
- [✅] Claude API 호출 패턴 코드 작성
- [✅] 기본 목표 설정 헬퍼 (BMR/TDEE 기반) 작성
- [✅] SKILL.md 파일 작성
- [✅] skill-tester 에이전트 content test 수행 (2026-06-26)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "nutrition analysis calorie tracking Claude anthropic prompt pattern 2025" | Anthropic cookbook, 실사용 패턴 10개 소스 확인 |
| 공식 문서 확인 | WebFetch | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices | 공식 프롬프트 베스트 프랙티스 확인 |
| Cookbook 확인 | WebSearch | "Using vision with tools - Anthropic cookbook nutrition" | vision + tools 영양 레이블 추출 패턴 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Anthropic 프롬프트 엔지니어링 공식 문서 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices | ⭐⭐⭐ High | 2026-06-26 | WebFetch 직접 확인 |
| Anthropic cookbook (vision + tools) | https://platform.claude.com/cookbook/tool-use-vision-with-tools | ⭐⭐⭐ High | 2026-06-26 | 공식 cookbook |
| Anthropic SDK (Node.js) | https://github.com/anthropics/anthropic-sdk-node | ⭐⭐⭐ High | 2026-06-26 | 공식 SDK |
| nutrition-basics 스킬 | `.claude/skills/health/nutrition-basics/SKILL.md` | ⭐⭐⭐ High | 2026-06-26 | BMR/TDEE 공식 기반 |

---

## 4. 검증 체크리스트 (Test List)

### 3-1. 내용 정확성
- [✅] Anthropic 공식 프롬프트 패턴과 일치
- [✅] 모델 ID `claude-sonnet-4-6` 유효
- [✅] `client.messages.create()` API 구조 정확
- [✅] BMR/TDEE 공식이 nutrition-basics 스킬과 일치

### 3-2. 구조 완전성
- [✅] YAML frontmatter 포함
- [✅] 소스 URL과 검증일 명시
- [✅] 단일 음식 분석 + 하루 전체 분석 두 케이스 모두 포함
- [✅] 코드 예시 포함 (타입 정의, API 호출, 헬퍼 함수)
- [✅] 평가 기준 테이블 포함
- [✅] 주의사항 포함 (추정값, 의료 목적 금지, API 비용)

### 3-3. 실용성
- [✅] nutrition-basics·korean-food-nutrition 스킬과 연동 설계
- [✅] 하루 목표 대비 % 진행률 출력으로 UX에 바로 활용 가능
- [✅] 범용적으로 사용 가능

### 3-4. Claude Code 에이전트 활용 테스트
- [✅] skill-tester content test 수행 (2026-06-26)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (3/3 PASS — 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-26
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. evaluation 'warning' 판정이 되는 조건**
- ✅ PASS
- 근거: SKILL.md "평가 기준" 표
- 상세: 칼로리 110~130% 또는 나트륨 초과 시 'warning'. 'good'(80~110%)·'over'(130% 초과)와 명확히 구분됨

**Q2. confidence 필드의 가능한 값 목록**
- ✅ PASS
- 근거: SKILL.md "단일 음식 영양소 분석 프롬프트" 섹션 JSON 스키마
- 상세: "high | medium | low" 3종. NutritionResult 타입 정의에도 동일하게 기재됨

**Q3. getDefaultGoal 함수에서 나트륨 기본값**
- ✅ PASS
- 근거: SKILL.md "기본 목표 설정 헬퍼" 섹션 코드
- 상세: sodium: 2300 (한국인 기준 2,300mg 미만). nutrition-basics 스킬의 나트륨 기준과 일치

### 발견된 gap

없음

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (프롬프트 패턴 스킬)
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
- [❌] Claude 추정 정확도 실제 테스트 (한국 음식명 입력 시 정확도 측정) — 선택 보강, 비차단 (추정값 ±15~25% 오차는 이미 주의사항에 명시됨)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-26 | v1 | 최초 작성 | skill-creator |
| 2026-06-26 | v1 | 2단계 실사용 테스트 수행 (Q1 evaluation warning 조건 / Q2 confidence 필드 값 / Q3 나트륨 기본값 2300mg) → 3/3 PASS, APPROVED 전환 | skill-tester |
