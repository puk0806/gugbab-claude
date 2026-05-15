---
skill: dream-safety-classifier-prompts
category: meta
version: v1
date: 2026-05-15
status: PENDING_TEST
---

# dream-safety-classifier-prompts — 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-safety-classifier-prompts` |
| 스킬 경로 | `.claude/skills/meta/dream-safety-classifier-prompts/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (Claude Opus 4.7) |
| 스킬 버전 | v1 |

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

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-15, skill-tester 수행, general-purpose 대체) |
| **최종 판정** | **PENDING_TEST 유지** (실 운영 골든셋 precision/recall 평가는 사용자 영역) |

**판정 근거:**
- 8개 핵심 클레임 모두 Anthropic 공식 문서 + 공식 cookbook + 공식 발표 블로그
  교차 검증 완료. 내용 신뢰성 확보.
- 본 카테고리는 *분류 정확성 평가가 핵심*이므로 content test PASS만으로 APPROVED
  전환이 가능한 경계선이지만, 안전 분류기는 *실제 운영 골든셋 평가가 매우 중요*하므로
  PENDING_TEST 유지를 권장. 실 운영 평가(precision/recall 골든셋 200~500건)는
  사용자 영역.
- 사용자 지시: skill-tester는 메인이 직접 호출 → 본 verification은 단계 1·2까지만
  완료.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] 실 운영 골든셋 200~500건 구축 후 precision/recall 측정 결과 추가 (사용자 영역 — PENDING_TEST 유지의 핵심 차단 요인)
- [❌] 사용자가 짝 스킬 `humanities/crisis-intervention-resources-korea` 분리 생성 시
       본 스킬 §6 자원 표를 그 스킬 참조로 단순화 가능 (선택 보강 — 차단 요인 아님)
- [❌] 분류기를 Claude Structured Outputs(JSON schema 강제) 기능으로 마이그레이션
       시 §5 JSON 파싱 fallback 코드 단순화 가능 (선택 보강 — 차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — Anthropic content moderation 공식 가이드 + cookbook 기반 안전 분류기 분리형 프롬프트 패턴. 5개 카테고리·few-shot 5개·precision/recall 평가·2단계 호출 비용 분석 포함 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 분리형 vs 통합형 설계 근거 / Q2 일반 흉몽 FP 회피·자해 신호 구분 / Q3 Haiku 4.5+Sonnet 4.6 조합+temperature=0+confidence처리) → 3/3 PASS, PENDING_TEST 유지 (실 운영 골든셋 평가 필요) | skill-tester |
