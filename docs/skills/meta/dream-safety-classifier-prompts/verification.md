---
skill: dream-safety-classifier-prompts
category: meta
version: v1.5
date: 2026-09-28
status: APPROVED
---

# dream-safety-classifier-prompts — 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-safety-classifier-prompts` |
| 스킬 경로 | `.claude/skills/meta/dream-safety-classifier-prompts/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-05-15, 이전 2026-08-12) |
| 검증자 | skill-creator (Claude Opus 4.7) / 재검증 2차 (2026-09-28) / skill-tester 재테스트 (2026-09-28) |
| 스킬 버전 | v1.5 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Anthropic content moderation guide)
- [✅] 공식 GitHub 2순위 소스 확인 (anthropic-cookbook building_moderation_filter)
- [✅] 최신 버전 기준 내용 확인 (2026-05-15)
- [✅] 짝 스킬 정합성 확인 (`dream-interpretation-prompt-engineering`)
- [✅] 분류 카테고리 5개 정의·경계 케이스 정리
- [✅] 분류기 프롬프트 템플릿 작성
- [✅] few-shot 예시 5개 작성 (각 카테고리 + false-positive 회피용)
- [✅] JSON 응답 스키마 작성
- [✅] 평가 지표 (precision/recall) 정리
- [✅] 운영 패턴(2단계 호출) + 비용 분석
- [✅] Prompt caching 전략
- [✅] 흔한 함정 10개
- [✅] 짝 스킬과의 분리 원칙 명시
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | Read | `meta/dream-interpretation-prompt-engineering/SKILL.md` | 짝 스킬 안전 가드 구조 파악, 카테고리·한국 자원 표 재사용 |
| 조사 2 | WebSearch | "Anthropic Claude content moderation classifier prompt best practices JSON output" | 공식 use-case guide + cookbook 식별 |
| 조사 3 | WebFetch | Anthropic content moderation use case guide | risk-level + JSON output + 카테고리 정의 + temperature=0 + batch + precision/recall 공식 권고 수집 |
| 조사 4 | WebFetch | anthropic-cookbook building_moderation_filter | 프롬프트 구조·JSON 출력·few-shot·평가 방법 확인 |
| 조사 5 | WebFetch | Anthropic Increase output consistency | format 지정·prefilling 제약(Haiku 4.5만 가능) 확인 |
| 조사 6 | WebFetch | Anthropic Prompt caching | Haiku 4.5 = 4,096 / Sonnet 4.6 = 1,024 / Opus 4.7 = 4,096 최소 토큰 재확인 |
| 조사 7 | WebSearch | "Claude API classifier prompt safety self-harm recall vs precision evaluation" | Anthropic safeguards 블로그(self-harm 분류기 운영 사실) + Protecting wellbeing 공식 발표 식별 |
| 교차 검증 | WebSearch+WebFetch | 6개 핵심 클레임, 독립 소스 2개 이상 | VERIFIED 6 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Anthropic Content moderation use case guide | https://platform.claude.com/docs/en/about-claude/use-case-guides/content-moderation | ⭐⭐⭐ High | 2026-05-15 | 1순위, 분류기 구조 핵심 |
| Anthropic cookbook (building_moderation_filter) | https://github.com/anthropics/anthropic-cookbook/blob/main/misc/building_moderation_filter.ipynb | ⭐⭐⭐ High | 2026-05-15 | 2순위 공식 GitHub |
| Anthropic Increase output consistency | https://platform.claude.com/docs/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency | ⭐⭐⭐ High | 2026-05-15 | temperature·format·prefill |
| Anthropic Prompt caching | https://platform.claude.com/docs/en/build-with-claude/prompt-caching | ⭐⭐⭐ High | 2026-05-15 | 캐시 최소 토큰 |
| Anthropic Building safeguards for Claude | https://www.anthropic.com/news/building-safeguards-for-claude | ⭐⭐⭐ High | 2026-05-15 | 분류기 분리 운영 사실 |
| Anthropic Protecting the wellbeing of our users | https://www.anthropic.com/news/protecting-well-being-of-users | ⭐⭐⭐ High | 2026-05-15 | claude.ai 자체 self-harm 분류기 운영 + 자원 안내 banner |
| Anthropic Prompting best practices | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices | ⭐⭐⭐ High | 2026-05-15 | XML tag 구조, role 설정 |
| 짝 스킬: dream-interpretation-prompt-engineering | (로컬) | ⭐⭐⭐ | 2026-05-14 | 안전 가드·한국 자원 표 일관성 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 모델 ID(`claude-haiku-4-5-20251001`, `claude-sonnet-4-6`)가 현재(2026-05-15) 유효
- [✅] deprecated된 패턴(temperature>0 분류, binary-only 분류) 권장하지 않음
- [✅] 코드 예시가 실행 가능한 anthropic SDK 형태

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, example 3개)
- [✅] 소스 URL 7개 + 검증일 2026-05-15 명시
- [✅] 핵심 개념: 분리 동기 / 카테고리 / 프롬프트 / few-shot / JSON / 자원 매핑 / 평가 / 운영 / 캐싱 / 함정 / 분리 원칙
- [✅] 코드 예시: 시스템 프롬프트 템플릿, few-shot 5개, 분기 로직, 2단계 호출
- [✅] 언제 사용 / 언제 사용하지 않을지: §1 분리 동기 + §11 짝 스킬과의 책임 분리표
- [✅] 흔한 실수 패턴 10개

### 4-3. 실용성

- [✅] 에이전트가 참조 시 분류기 프롬프트를 즉시 작성·통합 가능
- [✅] 추상 이론 대신 실제 함수·JSON·비용 분석 포함
- [✅] 범용성: 한국어 꿈 도메인이지만 카테고리·운영 패턴은 다른 도메인 분류기에도 응용 가능

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15, skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음 — 보완 불필요)

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester 재테스트 (2차 재검증 대응)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2026-09-28 재검증(2차)에서 반영된 §8 Structured
Outputs(`output_config.format`+`CLASSIFIER_SCHEMA`)·§9 캐시 임계값 정정(Opus 5.5
512)을 직접 겨냥한 실전 질문 2개 답변, 근거 섹션 인용 및 anti-pattern 회피 확인

**Q1. 이 안전 분류기 응답의 JSON 파싱 실패 위험을 원천적으로 줄이려면 어떻게
구현해야 하는가?**
- ✅ PASS
- 근거: SKILL.md "8. 운영 패턴 — 호출 순서와 비용" (`output_config.format` +
  `CLASSIFIER_SCHEMA` 코드) / "10. 흔한 함정" 5번·10번
- 상세: Structured Outputs(constrained decoding)로 스키마 위반 자체를 원천
  차단한다는 §8 서술과 `CLASSIFIER_SCHEMA`(enum 5종 + `additionalProperties: False`)
  코드를 정확히 인용. 다만 API 호출 자체 실패(네트워크·429)는 별개이므로
  `try/except` + retry 1회 + 보수적 unsafe fallback(fail-closed)이 필요하다는
  §10 함정 5·10번의 anti-pattern 회피(fail-open 금지)까지 정확히 답변에 반영.

**Q2. Haiku 4.5로 분류기를 캐싱하려는데 최소 캐시 토큰은? 분류기 시스템 프롬프트
(~700~900 tokens)만으로 캐시가 적용되는가? Opus 5.5로 운영하면 임계값이 어떻게
달라지는가?**
- ✅ PASS
- 근거: SKILL.md "8. 운영 패턴" 하단 주의 문구 / "9. Prompt Caching 전략" 표
- 상세: Haiku 4.5 최소 4,096 tokens, 분류기 프롬프트(~700~900 tokens)는 단독으로
  캐시 미적용(§8 주의 문구 그대로 인용)이라고 정확히 답변. Opus 5.5는 §9 표의
  2026-09-28 정정값 512 tokens를 인용하며, 이 값이면 분류기 프롬프트 자체로도
  캐시 조건을 충족한다는 점까지 도출(단, "분류기에 Opus는 과잉"이라는 SKILL.md의
  판단도 함께 인용해 모델 선택 권고와 캐시 임계값을 혼동하지 않음).

**발견된 gap(교차 파일 불일치 — SKILL.md 결함 아님)**: 테스트 에이전트가 `.claude/rules/agent-design.md`의
"Opus 5.5는 공식 캐싱 표에 아직 별도 기재가 없다(주의: 미확인)"라는 구절과 본
SKILL.md §9의 "Opus 5.5 = 512 (2026-09-28 공식 표 재확인)"이 서로 다른 결론을
내고 있다는 점을 지적함. 확인 결과 SKILL.md·짝 스킬
`meta/dream-interpretation-prompt-engineering` 양쪽 모두 2026-09-28에 WebFetch로
공식 prompt-caching 표를 직접 재조회해 512임을 확인한 반면, `agent-design.md`는
2026-09-25 감사 시점의 "미확인" 문구가 그대로 남아 있어 **규칙 파일이 스킬보다
갱신이 뒤처진 상태**로 보인다. 이 규칙 파일은 본 재테스트의 배정 범위(3개 스킬의
verification.md) 밖이므로 수정하지 않고, 최종 보고에서 사용자에게 별도 후속
조치 항목으로 전달한다. SKILL.md 자체는 이 불일치와 무관하게 자기 완결적으로
정확하므로 PASS 판정에는 영향 없음.

**판정**: agent content test 2/2 PASS → verification-policy 분류(안전 분류기,
2026-06-19 사용자 지시로 content test PASS = APPROVED 기조 유지) → **최종 상태
APPROVED**

---

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 미사용, meta 카테고리이므로 general-purpose로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 해몽 모델 안에 안전 가드를 넣으면 안 되는 이유와 분리 분류기 구체적 근거 + 호출 흐름도**
- PASS
- 근거: SKILL.md "1. 왜 분리하는가 — 분리 동기" 섹션 (비교 표 7개 차원 + 운영 흐름도 + Anthropic 공식 인용)
- 상세: 두 작업의 평가 지표 분리(톤 vs precision/recall), 장애 격리, 이중 안전망 근거가 §1에 완비됨. §10 함정 1번("둘 다 품질이 떨어진다")에서 anti-pattern도 명시. gap 없음.

**Q2. 일반 흉몽(이빨 빠짐·뱀·절벽) FP 회피 방법 — "절벽 + 진짜로 그러고 싶기도 해요"와의 구분**
- PASS
- 근거: SKILL.md "2. 분류 카테고리 정의" (FP/FN 회피 기준) + "4. few-shot 예시" (예시 2번·3번이 두 케이스를 정확히 대비)
- 상세: §2에서 "주체가 본인이고 수단이 구체적이면 self_harm" 기준 명시. §4 few-shot 예시 2번(일반 흉몽 → null)과 3번(반복+현실충동 → self_harm confidence 0.95)이 두 케이스를 직접 커버. §10 함정 2·3번에서 동일 주의 반복. gap 없음.

**Q3. Haiku 4.5 분류기 + Sonnet 4.6 해몽 조합 이유 + temperature=0 + confidence < 0.7 처리**
- PASS
- 근거: SKILL.md "§1 모델 선택 열" + "§3 설계 근거" + "§5 클라이언트 분기 로직" + "§8 운영 패턴 Python 코드" + "§10 함정 4·8번"
- 상세: Haiku 4.5 비용($0.0005 — 해몽의 4%) 근거 §8에 수치로 명시. temperature=0 이유 §3·§10(함정 8)에서 "일관성" 키워드로 명시. confidence < 0.7 null 케이스는 §5 "PROCEED_BUT_FLAG_FOR_REVIEW"와 §8 `log_for_review()` 코드로 양쪽 커버. 함정 4번("binary 사용 금지")으로 anti-pattern도 명시. gap 없음.

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md에서 근거 섹션 즉시 확인 가능, anti-pattern도 §10에 명시됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 안전 분류기 — 실 운영 골든셋 precision/recall 평가 필요, 사용자 지시에 따라 PENDING_TEST 유지
- 최종 상태: PENDING_TEST 유지

---

---

### 2차 테스트 (2026-06-19, APPROVED 전환 수행)

**수행일**: 2026-06-19
**수행자**: skill-tester → general-purpose (meta 카테고리, domain-specific 에이전트 대체)
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

**Q1. 분리 분류기 핵심 이유 3가지 + 운영 흐름 + fallback 동작**
- PASS
- 근거: SKILL.md "§1 분리 동기" 표 7개 차원 + "§8 운영 패턴" Python 코드 + "§10 함정 5·10번"
- 상세: 분리 이유(평가 지표 분리·모델 최적화·이중 안전망) 모두 §1에서 확인됨. fallback "보수적 unsafe" 원칙이 §10 항목 5·10에 명시됨. anti-pattern(fail-open) 명시적으로 회피. gap: §8 코드에 네트워크 예외 처리 블록 부재 (텍스트와 코드 불일치 — 선택 보강).

**Q2. 일반 흉몽 FP 회피 vs 자해 신호 분류 + temperature=0 이유 + few-shot 5개 근거**
- PASS
- 근거: SKILL.md "§2 카테고리 정의·FP/FN 회피 기준" + "§3 판정 규칙·설계 근거" + "§4 few-shot 예시 2·3번" + "§10 함정 8번"
- 상세: 이빨 빠짐 → null (§2 FP 회피 + §4 예시 2번), 반복+현실충동 → self_harm (§2 FN 회피 + §4 예시 3번) 모두 근거 섹션 즉시 확인. temperature=0 이유 §3·§10에서 "일관성" 키워드. few-shot 5개 구성 논리 §4에서 설명. gap: violence_toward_others few-shot 예시 누락(5개 중 4카테고리만 커버 — 선택 보강), self_harm vs trauma 동시 신호 우선순위 규칙 미명시(선택 보강).

### 발견된 gap (2026-06-19)

- §8 Python 코드에 `anthropic.APIError` 등 네트워크 예외 처리 블록 부재 (§10 항목 10 텍스트와 불일치) — 선택 보강
- violence_toward_others few-shot 예시 없음 (5개 예시 중 4카테고리만 커버) — 선택 보강
- self_harm vs trauma 동시 신호 시 우선순위 규칙 미명시 — 선택 보강

### 판정 (2026-06-19)

- agent content test: 2/2 PASS
- verification-policy 분류: 프롬프트 패턴·개념 스킬 — content test PASS = APPROVED 가능
- 사용자 지시: APPROVED 전환
- 최종 상태: APPROVED

---

### 교차 검증 (단계 2) 결과 (skill-creator 수행)

| # | 클레임 | 출처 1 | 출처 2 | 판정 |
|---|--------|--------|--------|------|
| C1 | Anthropic 공식은 content moderation을 *별도 분류 호출*로 분리 권장 | content moderation guide ("Content moderation is a classification problem") | cookbook (별도 함수 `moderate_message`로 분리) | ✅ VERIFIED |
| C2 | JSON 출력 강제 + temperature=0 + max_tokens 작게 | content moderation guide ("Use 0 temperature for increased consistency") | Increase output consistency guide | ✅ VERIFIED |
| C3 | 카테고리에 *정의* 동봉 시 정확도 향상 | content moderation guide §"Define topics and provide examples" | cookbook ("Provide Category Definitions") | ✅ VERIFIED |
| C4 | risk-level(0~3)로 multi-class 분류 권장 (binary 아님) | content moderation guide §"Evaluate your prompt" 직접 명시 | cookbook 코드 예시 | ✅ VERIFIED |
| C5 | precision/recall 트래킹으로 지속 평가 | content moderation guide §"Continuously evaluate and improve" | 검색 결과 ("precision and recall tracking") | ✅ VERIFIED |
| C6 | Haiku 4.5 cache 최소 4,096 tokens, Sonnet 4.6 = 1,024 | prompt caching doc 직접 표 | (짝 스킬 검증일 2026-05-14 재확인) | ✅ VERIFIED |
| C7 | Anthropic이 claude.ai에 self-harm 분류기를 *별도로* 운영 + 자원 안내 banner | Protecting wellbeing 공식 발표 | Building safeguards 공식 발표 | ✅ VERIFIED |
| C8 | 한국 자살예방 109 (2024-01 통합, 3자리, 24시간 무료) | 짝 스킬 §5 (보건복지부 출처 검증 완료) | — | ✅ VERIFIED (짝 스킬에서 이미 교차 검증됨) |

DISPUTED 항목 없음. UNVERIFIED 항목 없음.

---

### [2026-09-28] 재검증(2차) — §8 Structured Outputs 반영 + 캐시 임계값 정정

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 3개를 1차 소스(platform.claude.com)와
대조, ADD 항목(§8 Structured Outputs) 반영

**클레임 대조 결과**:
1. §8의 `classification = json.loads(safety.content[0].text)`가 스키마 강제 없이
   자유 텍스트 파싱에 의존하던 기존 서술 → **DISPUTED(보강 반영)**. Anthropic
   Structured Outputs(`output_config.format`, `type: "json_schema"`)가 GA이며
   `claude-haiku-4-5-20251001`이 Claude API에서 공식 지원됨을 확인 (소스:
   https://platform.claude.com/docs/en/build-with-claude/structured-outputs). §8
   코드에 `CLASSIFIER_SCHEMA`(category enum 5종 + confidence/signals/rationale)를
   추가하고 `output_config.format`으로 호출하도록 정정.
2. §9 "Claude Opus 5.5 / Opus 5(구세대) — 미확인(공식 표 미기재) / 512" →
   **DISPUTED(정정)**. 2026-09-28 재조회 결과 공식 prompt-caching 표에 Opus 5.5도
   **512 tokens**로 명시되어 있음을 확인. 표를 "512 / 512"로 정정.
3. Haiku 4.5 prompt cache 최소 4,096 tokens (§8 인용) → **VERIFIED** (공식
   prompt-caching 표 재확인, 변경 없음).

**보강(ADD)·축소**: §8 코드에 Structured Outputs 스키마 추가 + 캐시 무효화 주의 문구,
§9 캐싱 표 정정, §10 함정 5번에 Structured Outputs 반영 후에도 API 호출 실패 자체는
별도 처리 필요하다는 단서 추가. 카테고리 정의·false positive/negative 회피 기준·
한국 위기 자원 매핑(§2·§6)은 전혀 축소하지 않음.

**실전 질문 재검증**:
- Q1. "분류기 응답의 JSON 파싱이 실패할 위험을 원천적으로 줄이려면?" → PASS
  (근거: SKILL.md "8. 운영 패턴" Structured Outputs 단락 + 코드의 `CLASSIFIER_SCHEMA`)
- Q2. "Haiku 4.5로 분류기를 Structured Outputs와 함께 캐싱하려는데 캐시 최소 토큰은?"
  → PASS (근거: SKILL.md "9. Prompt Caching 전략" 표 — Haiku 4.5 4,096 그대로,
  Opus 5.5/Opus 5는 512로 정정됨)

**재검증 최종 판정**: status **PENDING_TEST 전환** (§8 코드 변경 + §9 캐싱 표 정정으로
실사용 재테스트 필요)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (2026-09-28 재검증 — §8 Structured Outputs 반영, §9 Opus 5.5 캐시 임계값 정정) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-15, skill-tester 수행, general-purpose 대체) + 2026-09-28 skill-tester 재테스트 2/2 PASS (§8 Structured Outputs·§9 캐시 정정 겨냥) |
| **최종 판정** | **APPROVED** (2026-09-28 skill-tester 재테스트 2/2 PASS — Structured Outputs·캐시 임계값 정정 반영 확인) |

**판정 근거:**
- 8개 핵심 클레임 모두 Anthropic 공식 문서 + 공식 cookbook + 공식 발표 블로그
  교차 검증 완료. 내용 신뢰성 확보.
- 2026-05-15 초기 테스트 3/3 PASS 이후 2026-06-19 추가 테스트 2/2 PASS.
- 프롬프트 패턴·개념 스킬 카테고리 — content test PASS = APPROVED 가능.
- 사용자 지시: APPROVED 전환. 실 운영 골든셋 평가(precision/recall 200~500건)는
  사용자 영역이며 차단 요인이 아닌 선택 보강 사항.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS; 2026-06-19 추가 2/2 PASS → APPROVED 전환)
- [❌] 실 운영 골든셋 200~500건 구축 후 precision/recall 측정 결과 추가 (사용자 영역 — 선택 보강, 차단 요인 아님)
- [❌] 사용자가 짝 스킬 `humanities/crisis-intervention-resources-korea` 분리 생성 시
       본 스킬 §6 자원 표를 그 스킬 참조로 단순화 가능 (선택 보강 — 차단 요인 아님)
- [✅] 분류기를 Claude Structured Outputs(JSON schema 강제) 기능으로 마이그레이션
       완료 (2026-09-28 재검증 2차 — §8 `output_config.format` + `CLASSIFIER_SCHEMA` 반영)
- [✅] 2026-09-28 재검증(2차)에서 §8 Structured Outputs 반영 + §9 캐시 표 정정 →
  skill-tester 재테스트 완료 (2026-09-28, 2/2 PASS) — APPROVED 전환
- [❌] `.claude/rules/agent-design.md`가 "Opus 5.5 캐싱 최소 토큰 미확인"으로
  남아 있어 본 SKILL.md·짝 스킬의 "512 확인" 서술과 불일치 — 규칙 파일 갱신은
  본 스킬 배정 범위 밖, 메인 에이전트/사용자 후속 조치 필요 (차단 요인 아님, 별도
  후속 과제)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — Anthropic content moderation 공식 가이드 + cookbook 기반 안전 분류기 분리형 프롬프트 패턴. 5개 카테고리·few-shot 5개·precision/recall 평가·2단계 호출 비용 분석 포함 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 분리형 vs 통합형 설계 근거 / Q2 일반 흉몽 FP 회피·자해 신호 구분 / Q3 Haiku 4.5+Sonnet 4.6 조합+temperature=0+confidence처리) → 3/3 PASS, PENDING_TEST 유지 (실 운영 골든셋 평가 필요) | skill-tester |
| 2026-06-19 | v1 | 2단계 실사용 테스트 재수행 (Q1 분리 이유·운영흐름·fallback / Q2 일반흉몽 FP vs 자해신호 분류·temperature=0·few-shot 5개 근거) → 2/2 PASS, PENDING_TEST → APPROVED 전환 (사용자 지시: 프롬프트 패턴 스킬 content test PASS = APPROVED) | skill-tester |
| 2026-08-11 | v1.1 | 모델 ID 한정 재감사 — §9 Prompt Caching 표의 `Claude Opus 4.7 / 4,096`을 **`Claude Opus 4.8 / 1,024`로 정정**(구세대 ID + 캐시 최소 토큰 값 오류). 동일 오류가 `backend/python-anthropic-sdk`·`frontend/claude-api-streaming-frontend`·`meta/dream-interpretation-prompt-engineering`에서도 발견되어 함께 정정됨. 근거: platform.claude.com prompt-caching 공식 문서 + `.claude/rules/agent-design.md` 현행 모델 기준. 본문 나머지(분류 카테고리·few-shot·평가 지표)는 변경 없어 status APPROVED 유지 | 전수검사 후속 |
| 2026-08-12 | v1.2 | **모델 ID 세대 정렬.** §8 2단계 파이프라인 코드의 해몽 호출 `claude-sonnet-4-6` → `claude-sonnet-5`(주석 "Sonnet 4.6" → "Sonnet 5"), 비용 분석 표 해몽 행 모델명 동반 정정. §9 Prompt Caching 표를 `Sonnet 4.6/1,024` → `Sonnet 5/1,024`, `Opus 4.8/1,024` → **`Opus 5/512`**로 교체하고 선택 가이드·캐시 주의 문구의 Sonnet 4.6 표기도 Sonnet 5로 정렬. **1단계 분류기의 `temperature=0`은 유지** — 호출 모델이 `claude-haiku-4-5-20251001`이고 Haiku 4.5는 여전히 현행 세대이며 샘플링 파라미터를 정상 지원하므로 5 계열 400 제약 대상이 아니다(§4·§10의 temperature=0 근거 서술도 그대로 유효). 검증일 2026-05-15 → 2026-08-12. status **APPROVED 유지** | 모델 ID 세대 정렬 |
| 2026-09-25 | v1.3 | **모델 ID 현행화(Opus 5.5/Fable 5.1).** SKILL.md 헤더 "대상 모델" Sonnet 4.6 → Sonnet 5, §1 비교표·§11 분리 원칙 표의 Sonnet 4.6 표기 → Sonnet 5, §8 비용 표 Sonnet 5 단가 $3/$15 → $2/$10(회당 ~$0.013 → ~$0.012, 가격 기준일 2026-09-25), §9 캐싱 표 Opus 행에 Opus 5.5 "미확인" 병기. §10-8에 5 계열 `temperature` 400 주의 추가(Haiku 4.5 분류기의 `temperature=0`은 유지). §10-9 안티패턴 예시의 형식 오류 ID `claude-haiku-4-20240307` → 실존 구 ID `claude-3-haiku-20240307`. 메타 날짜 정합 — frontmatter `date`·검증일이 2026-05-15로 남아 SKILL.md(2026-08-12)와 불일치하던 것을 2026-08-12로 동기화. status APPROVED 유지 | 모델 ID 현행화 |
| 2026-09-28 | v1.4 | **재검증(2차) — Structured Outputs 반영.** §8 `json.loads(safety.content[0].text)`만 쓰던 코드에 `output_config.format`(Structured Outputs, GA) + `CLASSIFIER_SCHEMA`(category enum 5종) 추가, `claude-haiku-4-5-20251001` Claude API 지원 확인. §9 캐싱 표의 "Opus 5.5 미확인"을 **512로 정정**(공식 표 갱신 확인). §10-5에 API 호출 실패 자체는 별도 처리 필요하다는 단서 추가. 5개 카테고리 정의·FP/FN 회피 기준·한국 위기 자원 매핑은 축소 없음. status **PENDING_TEST 전환** | 재검증 2차 |
| 2026-09-28 | v1.5 | 2단계 실사용 재테스트 수행 (Q1 Structured Outputs로 파싱 실패 원천 차단 + fail-closed fallback / Q2 Haiku 4.5·Opus 5.5 캐시 최소 토큰) → 2/2 PASS, PENDING_TEST → APPROVED 전환. 부수적으로 `.claude/rules/agent-design.md`의 Opus 5.5 캐시 임계값 "미확인" 서술이 본 스킬·짝 스킬의 "512 확인" 서술과 불일치함을 발견 — 규칙 파일 수정은 배정 범위 밖이라 후속 과제로 기록 | skill-tester |
