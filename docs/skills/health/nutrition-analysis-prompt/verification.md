---
skill: nutrition-analysis-prompt
category: health
version: v2
date: 2026-09-26
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
| 스킬 경로 | `.claude/skills/nutrition-analysis-prompt/SKILL.md` |
| 검증일 | 2026-09-26 (최초 2026-06-26) |
| 검증자 | skill-creator → 2026-09-26 안전 결함 수정 |
| 스킬 버전 | v2 |

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
| nutrition-basics 스킬 | `.claude/skills/nutrition-basics/SKILL.md` | ⭐⭐⭐ High | 2026-06-26 | BMR/TDEE 공식 기반 |
| Anthropic Structured outputs 공식 문서 | https://platform.claude.com/docs/en/build-with-claude/structured-outputs | ⭐⭐⭐ High | 2026-09-26 | `output_config.format`·지원 모델·스키마 제약 WebFetch 확인 |
| claude-api 번들 스킬 (TS SDK) | Claude Code 번들 `claude-api` 스킬 `typescript/claude-api/tool-use.md` | ⭐⭐⭐ High | 2026-09-26 | `messages.parse` + `zodOutputFormat`, 5 계열 sampling 파라미터 400 |
| 식품 등의 표시·광고에 관한 법률 (국가법령정보센터) | https://www.law.go.kr/lsInfoP.do?lsiSeq=269957&lsId=013094 | ⭐⭐⭐ High | 2026-09-26 | 제8조 질병 예방·치료 효능 인식 우려 표시·광고 금지 — 설계 참고 |
| 제8조 해설 (lawnb·LBOX·식품안전나라 부당광고 안내) | https://lawnb.com/Info/ContentView?sid=L000D000320A3DCF_8 | ⭐⭐ Medium | 2026-09-26 | 제8조 각 호 교차 확인 |

### 2026-09-26 교차 검증 클레임

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | structured outputs 파라미터는 `output_config.format` (`output_format` deprecated), claude-sonnet-5·claude-opus-5-5 지원 | 공식 문서 WebFetch + claude-api 번들 스킬 | VERIFIED |
| 2 | 스키마의 `minimum`·`maxLength` 등은 API 미지원 → 섭취량·길이 검증은 서버 코드 | 공식 문서 + 번들 스킬 | VERIFIED |
| 3 | 5 계열 `temperature`/`top_p`/`top_k` 400, Opus 5.5 강제 `tool_choice` 400 | 번들 스킬 + 레포 `agent-design.md` | VERIFIED |
| 4 | 식품표시광고법 제8조가 질병 예방·치료 효능 인식 우려 표시·광고를 금지 | 국가법령정보센터 + lawnb·LBOX·식품안전나라 | VERIFIED |
| 5 | 앱 AI 응답이 제8조의 "표시·광고"에 해당하는지 | 확인 불가 (사안별 판단) | UNVERIFIED — SKILL.md에 `> 주의:` 표기, 설계 참고로만 인용 |
| 6 | 기존 "±15~25% 오차" 수치 | 공식 근거 미확인 | UNVERIFIED — 제거, korean-food-nutrition 스킬의 10~30% 변동 서술로 대체하고 앱 문구에 수치 약속 금지 |

---

## 4. 검증 체크리스트 (Test List)

### 3-1. 내용 정확성
- [✅] Anthropic 공식 프롬프트 패턴과 일치
- [✅] 모델 ID `claude-sonnet-5` (옵션 `claude-opus-5-5`) 현행 — 2026-09-26
- [✅] `client.messages.parse()` + `output_config.format` — 구 `content[0]` 텍스트 가정·코드블록 정규식 파싱 제거, stop_reason 처리
- [✅] `disclaimer` 필수 필드 — 모델 스키마 제외, 서버 고정 주입 + `z.literal` 재검증
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
- [✅] skill-tester content test 수행 (2026-06-26, v1)
- [✅] v2 안전 결함 수정분 재테스트 수행 (2026-09-26, disclaimer 주입·의료 단정 필터 2개)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (v1 3/3 PASS, v2 2/2 PASS — 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-26
**수행자**: skill-tester → general-purpose (v2 안전 결함 수정분 재테스트)
**수행 방법**: SKILL.md(v2) Read 후 실전 질문 2개 답변(disclaimer 서버 주입 fail-closed, 의료 단정 문구 필터), 근거 코드 줄번호 및 anti-pattern 회피 확인

### 실제 수행 테스트 (v2, 2026-09-26)

**Q1. disclaimer가 모델 출력 스키마에 없는 이유 + 서버 코드가 주입을 누락하거나 다른 문구를 넣으면 어떻게 되는가**
- ✅ PASS
- 근거: SKILL.md "면책 문구 (서버 고정)" 섹션(47~56행), "출력 스키마 — 모델용/앱용 분리"(83~124행), `analyzeFoodNutrition`(205~211행)
- 상세: `FoodModelOutput`/`DayModelOutput`에는 disclaimer 필드 자체가 없어 모델이 조작할 자리가 없고, 앱용 스키마만 `.extend({ disclaimer: z.literal(NUTRITION_DISCLAIMER) })`로 강제한다는 구조를 정확히 설명. 서버가 주입을 누락·변경하면 `NutritionResultSchema.parse`가 `z.literal` 불일치로 throw하여 fail-closed로 렌더링 자체를 막는다는 점을 340행 적대적 테스트 체크리스트와 함께 근거로 제시

**Q2. 모델 피드백에 "당뇨에 좋은 식단입니다. 혈당 관리에 도움이 됩니다" 같은 의료 단정 문구가 섞이면 노출되는가, calories 등 수치에도 영향을 주는가**
- ✅ PASS
- 근거: SKILL.md "의료 단정 필터"(144~163행), `sanitizeDayFeedback`(152~160행), `analyzeDayNutrition`(237~256행)
- 상세: `MEDICAL_CLAIM_RE`가 "~에 좋"·"혈당을 낮" 패턴에 매칭되어 `feedback.positive`/`improve` 배열에서 완전 제거되거나 `suggestion`이 `null`로 치환됨을 정확히 추적. 163행 "수치는 그대로 두고 문장만 제거" 원칙과 코드의 스프레드(`...out`) 구조를 근거로 `totalNutrition`·`goalProgress` 수치는 영향받지 않음을 정확히 답변

### 발견된 gap (v2)

- `disclaimer` 검증 실패(`z.literal` throw) 이후 `analyzeFoodNutrition` 호출부의 상위 에러 핸들링(재시도·로깅·사용자 메시지)이 SKILL.md에 명시되어 있지 않음 — 선택 보강, 비차단(현재도 "렌더 안 함"이라는 fail-closed 결과 자체는 명확)
- `positive`/`improve` 배열이 필터링으로 전부 비어버리는 극단 케이스의 UI 처리 정책 없음 — 선택 보강, 비차단

### 판정 (v2)

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (프롬프트 패턴 스킬 — content test PASS = APPROVED 가능)
- 최종 상태: PENDING_TEST(v2) → **APPROVED**

---

## 5-이전. v1 테스트 진행 기록 (2026-06-26, 참고용)

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
- 최종 상태: APPROVED (v1 기준) → 2026-09-26 v2 내용 변경으로 PENDING_TEST, skill-tester 재테스트 대기

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ v2 재테스트 2/2 PASS (2026-09-26) — v1 3/3 PASS (2026-06-26)는 참고용 |
| **최종 판정** | **APPROVED** (2026-09-26 v2 안전 결함 수정분 재테스트 완료) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 후 오류 항목 보완 (2026-06-26 완료, 3/3 PASS)
- [❌] Claude 추정 정확도 실제 테스트 (한국 음식명 입력 시 정확도 측정) — 선택 보강, 비차단 (근거 없는 ±15~25% 수치는 2026-09-26 제거)
- [✅] 출력 스키마 `disclaimer` 필수 필드 + 서버 고정 주입 (2026-09-26, nutrition-prompt-tester 지적 반영)
- [✅] 피드백 의료 단정 문장 필터, 음식명 정제·데이터 블록 인젝션 방어, 섭취량·빈 입력 검증 (2026-09-26)
- [✅] skill-tester 재테스트 (v2) — 완료 (2026-09-26, 2/2 PASS)
- [✅] `disclaimer` 검증 실패 시 상위 에러 핸들링 정책 명시 (2026-09-26, 재시도 금지·서버 고정문구 대체·로깅·fail-closed 4원칙 + `withDisclaimerFailClosed` 코드 예시)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-26 | v1 | 최초 작성 | skill-creator |
| 2026-06-26 | v1 | 2단계 실사용 테스트 수행 (Q1 evaluation warning 조건 / Q2 confidence 필드 값 / Q3 나트륨 기본값 2300mg) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-08-12 | v1 | **모델 ID 세대 정렬.** 단일 음식 분석 / 하루 식단 분석 예제 2곳의 `claude-sonnet-4-6` → `claude-sonnet-5` 교체. Sonnet 4.6은 legacy, 현행 세대는 Sonnet 5. 샘플링 파라미터·`budget_tokens` 사용 없음 — 5 계열 400 이슈 해당 없음. 영양 분석 프롬프트·JSON 스키마 본문은 변경 없음. 검증일 2026-06-26 → 2026-08-12. status **APPROVED 유지** | 모델 ID 세대 정렬 |
| 2026-09-25 | v1 | 메타 날짜 정합 — 2026-08-12 변경 시 누락된 frontmatter `date`·메타 표 "검증일"을 SKILL.md 및 위 이력과 같은 2026-08-12로 동기화. 모델 ID(`claude-sonnet-5`)는 현행이라 SKILL.md 변경 없음. status APPROVED 유지 | 모델 ID 현행화 감사 |
| 2026-09-26 | v2 | **안전 결함 수정 (nutrition-prompt-tester 지적).** 출력 스키마를 모델용/앱용으로 분리하고 앱용에 `disclaimer` 필수 필드(`z.literal` 고정 문구, 서버 주입) 추가·예시 반영, 시스템 프롬프트 의료 단정 금지 강화 + 피드백 의료 단정 문장 코드 필터, 음식명 정제·`<meals>` 데이터 블록, 섭취량·빈 입력 사전 검증, `messages.parse`+`output_config.format` 전환·stop_reason 처리, 적대적 테스트 체크리스트 추가, 근거 없는 ±15~25% 수치 제거. 클레임 6건 교차 검증(VERIFIED 4 / UNVERIFIED 2 처리). status APPROVED → **PENDING_TEST** | 안전 결함 수정 |
| 2026-09-26 | v2 | 2단계 실사용 테스트 수행 (Q1 disclaimer 서버 주입·fail-closed z.literal 검증 / Q2 의료 단정 필터가 수치는 두고 문장만 제거) → 2/2 PASS, PENDING_TEST → **APPROVED** 전환 | skill-tester |
| 2026-09-26 | v2 | **선택 보강 — skill-tester 지적 gap 해소.** `disclaimer` 검증 실패(`z.literal` 불일치) 시 상위 처리 정책(재시도 금지·서버 고정 안내문 대체·로깅·fail-closed) 4원칙과 `withDisclaimerFailClosed` 래퍼 코드 예시 추가. 기존 판정과 모순 없어 status **APPROVED 유지** | 메인 대화 오케스트레이션 |
