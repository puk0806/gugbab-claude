---
skill: dream-interpretation-prompt-engineering
category: meta
version: v1.5
date: 2026-11-11
status: APPROVED
---

# verification — dream-interpretation-prompt-engineering

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-interpretation-prompt-engineering` |
| 스킬 경로 | `.claude/skills/dream-interpretation-prompt-engineering/SKILL.md` |
| 검증일 | 2026-11-11 (재검증, 이전 2026-11-06 · 2026-09-28 · 최초 2026-05-14) |
| 검증자 | skill-creator (최초) / 모델 ID 정기 감사 (2026-08-11) / 재검증 2차 (2026-09-28) / skill-tester 재테스트 (2026-09-28) / 재검증 3차 (2026-11-06) |
| 스킬 버전 | v1.5 |
| 대상 모델 | Claude Opus 5.5 / Sonnet 5.5 / Haiku 5.5 (공식 models/overview, 2026-11-06 현행화) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (platform.claude.com docs)
- [✅] 공식 GitHub 2순위 소스 확인 (anthropics/prompt-eng-interactive-tutorial 검색 결과로 확인)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-05-14)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (시스템 프롬프트·few-shot·캐싱·안전 가드)
- [✅] 코드 예시 작성 (Python SDK `client.messages.create`)
- [✅] 흔한 실수 패턴 정리 (12 함정)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebFetch | Anthropic prompt-engineering overview | redirect → platform.claude.com, 핵심 진입점 확인 |
| 조사 2 | WebFetch | Anthropic prompt-caching docs | `cache_control` API 형식·최소 토큰·TTL·가격 |
| 조사 3 | WebFetch | platform.claude.com `claude-prompting-best-practices` (system prompts 항목) | role·XML·few-shot·long context 권고 |
| 조사 4 | WebFetch | platform.claude.com `multishot-prompting` (best-practices 통합본) | 3–5개 예시·`<example>` 태그 권고 |
| 교차 검증 1 | WebSearch | "Anthropic prompt engineering best practices role prompting system prompt 2026" | system prompt 구조·role prompting 효과 재확인 |
| 교차 검증 2 | WebSearch | "Anthropic Claude prompt caching cache_control ephemeral system prompt minimum tokens 2026" | Sonnet/Opus 1024 vs 4096, ttl 1h, 2026-02 workspace isolation |
| 교차 검증 3 | WebSearch | "Anthropic Claude API safety guardrails harmful content 2026" | 자체 분류기·classifier·jailbreak 정책 |
| 교차 검증 4 | WebSearch | "few-shot zero-shot tradeoff token cost tone consistency Claude API" | 3–5개에서 diminishing returns·tone에 효과적 |
| 안전 자원 검증 | WebSearch + WebFetch | "한국 자살예방 상담전화 1393 보건복지부 2026" + mohw.go.kr 보도자료 | **1393 → 109 통합(2024-01-01)** 확인. 1577-0199/1388/1366 별도 유지 |

총 4개 클레임 그룹, 독립 소스 8개 이상 교차 확인. VERIFIED 9 / DISPUTED 1 / UNVERIFIED 0.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Anthropic — Prompt engineering overview | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview | ⭐⭐⭐ High | 2026-05-14 | 공식 진입점 |
| Anthropic — Prompting best practices (system/role/few-shot 통합) | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices | ⭐⭐⭐ High | 2026-05-14 | Opus 4.7 기준 |
| Anthropic — Prompt caching | https://platform.claude.com/docs/en/build-with-claude/prompt-caching | ⭐⭐⭐ High | 2026-05-14 | `cache_control` 공식 스펙 |
| Anthropic — Mitigate jailbreaks / safeguards | https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks | ⭐⭐⭐ High | 2026-05-14 | 안전 가드 정책 |
| Anthropic — Building safeguards for Claude | https://www.anthropic.com/news/building-safeguards-for-claude | ⭐⭐⭐ High | 2026-05-14 | classifier·safety 정책 |
| Anthropic Help — API Safeguards Tools | https://support.claude.com/en/articles/9199617-api-safeguards-tools | ⭐⭐⭐ High | 2026-05-14 | API-level 안전 도구 |
| 보건복지부 보도자료 — 자살예방 상담전화 109 통합 | https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027 | ⭐⭐⭐ High | 2026-05-14 | 1393 → 109 통합 공식 발표 |
| 대한민국 정책브리핑 — 1393 개통 | https://www.korea.kr/news/policyNewsView.do?newsId=148856771 | ⭐⭐⭐ High | 2026-05-14 | 1393 역할 이력 |
| anthropics/prompt-eng-interactive-tutorial | https://github.com/anthropics/prompt-eng-interactive-tutorial | ⭐⭐⭐ High | 2026-05-14 | 공식 GitHub 튜토리얼 |
| Anthropic — Models overview | https://platform.claude.com/docs/en/about-claude/models/overview | ⭐⭐⭐ High | 2026-11-06 | 현행 4종 ID·가격·캐시 읽기 비율(Opus 5.5·Sonnet 5.5 = 5%) |
| Anthropic — Claude Sonnet 5.5 overview | https://platform.claude.com/docs/en/models/sonnet-5-5/overview | ⭐⭐⭐ High | 2026-11-06 | $2/$10, cache write 5m $2.50·1h $4, read $0.10, 캐시 최소 512, between_tools |
| Anthropic — Claude Haiku 5.5 overview | https://platform.claude.com/docs/en/models/haiku-5-5/overview | ⭐⭐⭐ High | 2026-11-06 | 캐시 최소 512 |
| Anthropic — API versions / Migrating to 2026-10-21 | https://platform.claude.com/docs/en/api/versioning , https://platform.claude.com/docs/en/api/migration-2026-10-21 | ⭐⭐⭐ High | 2026-11-06 | 샘플링 파라미터 모든 모델 400, Python SDK 2.0.0 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Opus 4.7 / Sonnet 4.6 / Haiku 4.5, 2026-05 기준)
- [✅] deprecated된 패턴을 권장하지 않음 (`claude-sonnet-4-20250514` 같은 ID는 *함정* 섹션에서 경고)
- [✅] 코드 예시가 실행 가능한 형태임 (anthropic SDK Python)

### 4-2. 핵심 클레임 교차 검증 결과

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| C1 | `cache_control: {type: "ephemeral"}` API 형식 | **VERIFIED** | 공식 docs + LiteLLM/Bedrock 문서 일치 |
| C2 | 5분 TTL 기본, `ttl: "1h"` 옵션 | **VERIFIED** | 공식 docs + dev.to 2026 가이드 일치 |
| C3 | Sonnet 4.6 최소 캐시 토큰 = 1,024 | **VERIFIED** | 공식 docs + apiyi 트러블슈팅 가이드 일치 |
| C4 | ~~Opus 4.7 / Haiku 4.5 최소 캐시 토큰 = 4,096~~ | **DISPUTED (2026-08-11 재검증)** | 공식 prompt-caching 표 기준 Opus 4.7은 **2,048**, Haiku 4.5만 4,096. Opus 4.7 부분이 오류였음 |
| C4' | 최소 캐시 토큰: Opus 4.8 = 1,024 / Opus 4.7 = 2,048 / Opus 4.6·4.5 = 4,096 / Sonnet 4.6·4.5 = 1,024 / Haiku 4.5 = 4,096 | **VERIFIED (2026-08-11)** | 공식 prompt-caching 표 (WebFetch 직접 인용) + 번들 `claude-api` 스킬 레퍼런스 교차 확인 |
| C5 | 대상 모델 Opus 계열 현행 ID는 `claude-opus-4-8` | **VERIFIED (2026-08-11)** | `.claude/rules/agent-design.md` + 공식 model-deprecations |
| C6 | `claude-sonnet-4-20250514`·`claude-opus-4-20250514`는 2026-06-15 retired, `claude-opus-4-1-20250805`는 2026-08-05 retired | **VERIFIED (2026-08-11)** | 공식 model-deprecations 페이지 + 교차 검색 |
| C5 | Cache write 1.25x / read 0.1x 가격 | **VERIFIED** | 공식 docs + finout 가격 가이드 일치 |
| C6 | few-shot 3–5개 권장, `<example>` 태그 | **VERIFIED** | 공식 best-practices `Use examples effectively` 명시 |
| C7 | role prompting을 system에 두는 권고 | **VERIFIED** | 공식 best-practices `Give Claude a role` + 검색 결과 다수 |
| C8 | XML 태그로 구획화 권고 | **VERIFIED** | 공식 best-practices `Structure prompts with XML tags` |
| C9 | 한국 자살예방 상담전화 109 통합 (2024-01-01) | **VERIFIED** | 보건복지부 보도자료 + 정책브리핑 일치 |
| C11 | (2026-11-06) 현행 예제 모델 `claude-sonnet-5-5`, Sonnet 5·Haiku 4.5는 Legacy | **VERIFIED** | models/overview + sonnet-5-5 overview |
| C12 | (2026-11-06) Sonnet 5.5 가격 $2 / 5m write $2.50 / 1h write $4 / read $0.10 per MTok | **VERIFIED** | sonnet-5-5 overview 가격 표 + models/overview 캐시 읽기 5% 각주 |
| C13 | (2026-11-06, 2026-11-11 갱신) 현행 4종(Fable 5.2·Opus 5.5·Sonnet 5.5·Haiku 5.5) 캐시 최소 512, Fable 5.1 은 Legacy(512) | **VERIFIED** | sonnet-5-5·haiku-5-5 overview "minimum cacheable prompt length is 512" + claude-api 스킬 캐시 표 + prompt-caching 문서(2026-11-11, Fable 5.2 512) |
| C14 | (2026-11-06) API `2026-10-21`에서 `temperature`/`top_p`/`top_k` 모든 모델 400, `extra_body` 우회도 400 | **VERIFIED** | api/versioning + migration-2026-10-21 |
| C15 | (2026-11-06) Sonnet 5.5 thinking disabled 400 → `between_tools`(effort high 이하), prefill·budget_tokens 400 | **VERIFIED** | sonnet-5-5 overview "Good to know" + claude-api 스킬 thinking 표 |
| C10 | 사용자 초안의 "KCC 콜센터 1577-0199" 안내 | **DISPUTED → 수정** | 1577-0199는 *정신건강상담전화*(보건복지부)지 KCC가 아니다. 또한 자살 위험에는 109가 더 적합. SKILL.md에서 109를 자살 위험 1순위, 1577-0199를 정신건강 일반으로 분리해 작성 |

### 4-3. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, `<example>` 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (12개 섹션)
- [✅] 코드 예시 포함 (Python SDK + JSON 스키마 + few-shot XML)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (짝 스킬 활용 섹션)
- [✅] 흔한 실수 패턴 포함 (12 함정)

### 4-4. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (template + 코드 + 예시 + JSON 스키마)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (꿈 해몽 도메인 구체 예시 3개)
- [✅] 범용적으로 사용 가능 (꿈 해몽 앱이라는 도메인 한정이지만 동일 패턴이 *상담형 소비자 AI 코파일럿* 전반에 응용 가능)

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — gap 없음, 보완 불필요
- [✅] 2026-11-06 재검증(3차) 후 재테스트 수행 (3/3 PASS, 2026-11-06)

---

## 5. 테스트 진행 기록

### [2026-11-06] skill-tester 재테스트 (3차 재검증 대응)

**수행일**: 2026-11-06
**수행자**: skill-tester → general-purpose (1회 호출로 3문항 일괄 답변, 도메인 특화 에이전트 미사용으로 대체)
**수행 방법**: SKILL.md Read 후 3차 재검증(Sonnet 5.5·SDK 2.x·between_tools·캐시 512·비용 재계산·temperature 400)을 겨냥한 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Sonnet 5.5에서 prefill/thinking disabled가 400일 때 JSON 강제·thinking 끄기·응답 텍스트 추출은?**
- ✅ PASS
- 근거: SKILL.md "3-1. 스키마 강제 방식 — Structured Outputs" 섹션 (코드 + Sonnet 5.5 주의 인용문)
- 상세: `output_config.format`(json_schema)을 권장 방식으로, `thinking: {"type":"between_tools"}`(effort high 이하)를 끄기 대안으로, `stop_reason` 확인 후 text 블록 탐색(thinking 블록 건너뜀)을 정확히 인용. prefill·`disabled`·`budget_tokens` 사용 anti-pattern 회피.

**Q2. Haiku 5.5·Sonnet 5.5 캐시 최소 토큰, Sonnet 5.5 단가, 2,000토큰 hit 시 절감, 4,096 우회 필요 여부?**
- ✅ PASS
- 근거: SKILL.md "6. 프롬프트 캐싱 활용" 최소 캐시 토큰 임계값·비용 효과·1h TTL 항목
- 상세: 현행 4종 512, $2 / $2.50 / $4 / $0.10, $0.004→$0.0002(95%), 4,096 채우기 우회 불필요를 모두 SKILL.md 값 그대로 답변. 옛 Sonnet 4.6 단가($3) 사용·Haiku 4.5 4,096 적용 anti-pattern 회피.

**Q3. temperature=0.2(extra_body 포함)가 에러인 원인·대안, 스키마를 자주 바꿔도 되는가?**
- ✅ PASS
- 근거: SKILL.md 상단 "SDK 기준" 주석 / "11. 흔한 함정" 12번 / "3-1" 공식 제약 / 함정 11번·4번
- 상세: API 2026-10-21에서 `temperature`/`top_p`/`top_k` 모든 모델 400(extra_body 우회도 400), 대안은 프롬프트·few-shot·`output_config.format`, 스키마·시스템 프롬프트 고정(변경 시 캐시 무효화)을 일관되게 인용.

### 발견된 gap (비차단, 선택 보강)

- §11 함정 번호가 1~9 → 12 → 10 → 11 순서로 어긋나 있음(내용 충돌 아님, 가독성 문제).
- `between_tools`의 정확한 동작 설명 없음, Haiku 5.5 단가·캐시 write/read 손익분기점 미기재 (모두 선택 보강).
- SKILL.md 수정은 하지 않음(사용자 승인 사항).

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 프롬프트 패턴 스킬 — "content test PASS = APPROVED 가능" (실사용 필수 카테고리 해당 없음)
- 최종 상태: APPROVED

---

### [2026-09-28] skill-tester 재테스트 (2차 재검증 대응)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2026-09-28 재검증(2차)에서 반영된 Structured
Outputs(§3-1/3-2)·캐시 임계값 정정(§6)을 직접 겨냥한 실전 질문 2개 답변, 근거
섹션 및 anti-pattern 회피 확인

**Q1. 꿈 해몽 앱에서 JSON 응답 스키마를 강제하는 현재 권장 방식은? 예전 "프롬프트로
JSON만 반환 지시 + 실패 시 재시도" 방식은 이제 어떤 위치인가?**
- ✅ PASS
- 근거: SKILL.md "3-1. 스키마 강제 방식 — Structured Outputs (권장)" / "3-2. 폴백
  — 프롬프트 지시 + 재시도"
- 상세: `output_config.format`(Structured Outputs, GA, constrained decoding)이
  현행 권장 방식이며, 기존 "JSON만 반환 + 재시도" 방식은 §3-2 폴백으로 정확히
  위치시켜 답변. 2026-09-28 재검증에서 신설된 §3-1/3-2 구분이 답변에 그대로
  반영됨 — 옛 서술이 남아 모순을 일으키지 않음을 확인.

**Q2. Opus 5.5로 이 시스템 프롬프트를 캐싱하려는데 최소 캐시 토큰은 몇 개인가?
Structured Outputs 스키마를 자주 바꿔도 되는가?**
- ✅ PASS
- 근거: SKILL.md "6. 프롬프트 캐싱 활용" 최소 캐시 토큰 표 / §3-1 하단 공식 제약
  / §11 흔한 함정 11번
- 상세: Opus 5.5 최소 캐시 토큰 = 512 tokens로 2026-09-28 정정된 값을 정확히
  인용. "스키마를 바꾸면 캐시가 무효화되므로 고정 유지" 원칙도 §3-1·§11 두
  곳에서 일관되게 인용해 모순 없이 답변.

**발견된 gap**: 없음. 2/2 PASS. (에이전트 코멘트: Opus 5.5 512 각주가 "재확인"
서술 방식이라 원 공식 표 캡처가 SKILL.md 자체엔 없다는 사소한 지적 — 소스 URL은
상단에 명시되어 있고 이미 WebFetch로 재확인된 사안이라 gap으로 간주하지 않음.)

**판정**: agent content test 2/2 PASS → verification-policy 분류(프롬프트 패턴
스킬, content test PASS = APPROVED 가능) 재확인 → **최종 상태 APPROVED**

---

**수행일**: 2026-05-14
**수행자**: skill-tester → general-purpose (도메인 특화 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 안전 가드를 system 프롬프트(user 메시지가 아닌)에 두는 이유는?**
- PASS
- 근거: SKILL.md "1. 전체 프롬프트 구조" 섹션 + "2. 시스템 프롬프트 템플릿" 설계 근거
- 상세: "user 메시지(꿈 내용)는 매번 바뀌지만 안전 규칙은 불변 → 캐시 적중을 극대화" 로 명시. 구조 다이어그램도 system에 안전 가드, messages에 꿈 내용만 배치하는 패턴 일치.

**Q2. 자해·자살 신호가 감지된 꿈 입력 vs 단순 스트레스성 꿈 — 각각 어느 상담 번호를 안내해야 하는가?**
- PASS
- 근거: SKILL.md "5. 안전 가드 상세 — 한국 자원 안내" 테이블 + "11. 흔한 함정" 8번
- 상세: 자해·자살 신호 → 109 (보건복지부 자살예방 상담전화, 2024-01 통합 3자리). 정신건강 일반 상담 → 1577-0199 로 역할 분리 명시. 함정 8번에서 "109/1577-0199 혼동"을 anti-pattern으로 명시. few-shot 예시의 `safety_flag: "self_harm"` 케이스 disclaimer에서도 109 우선 안내 확인.

**Q3. Haiku 4.5 모델로 꿈 해몽 시스템 프롬프트를 캐싱하려 했는데 캐시가 적용되지 않는다. 원인과 해결책은?**
- PASS
- 근거: SKILL.md "6. 프롬프트 캐싱 활용" 섹션 최소 캐시 토큰 임계값 표
- 상세: Haiku 4.5 최소 임계값 = 4,096 tokens. few-shot 3개 + 안전 가드 + 톤 규칙 포함 시스템 프롬프트는 한국어 기준 1,500–2,500 tokens으로 임계값 미달. 해결책: 프롬프트를 4,096 tokens 이상으로 보강하거나 Sonnet 4.6 (임계값 1,024) 사용 권장.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md 내 해당 섹션에서 완전한 근거를 확인.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 프롬프트 패턴 스킬 — "content test PASS = APPROVED 가능" (실 앱 운영 메트릭은 사용자 영역)
- 최종 상태: APPROVED

---

### [2026-09-28] 재검증(2차) — Structured Outputs 반영 + 캐시 임계값 정정 + 검증일 불일치 정리

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 3개를 1차 소스(platform.claude.com)와
대조, ADD 항목(Structured Outputs) 반영 및 캐시 임계값 보강 검토

**클레임 대조 결과**:
1. "JSON만 반환" 프롬프트 지시 + 클라이언트 재시도가 여전히 현행 유일 방식이라는
   기존 서술 → **DISPUTED(보강 반영)**. Anthropic Structured Outputs
   (`output_config.format`, `type: "json_schema"`)가 GA이며 constrained decoding으로
   스키마 위반을 원천 차단한다. `claude-haiku-4-5-20251001`·`claude-sonnet-5`·
   `claude-opus-5-5` 모두 Claude API에서 지원 확인 (소스:
   https://platform.claude.com/docs/en/build-with-claude/structured-outputs). 기존
   "JSON만 반환 + 재시도" 방식은 §3-2 폴백으로 재배치.
2. "Claude Opus 5.5 최소 캐시 토큰: 주의: 미확인 — 공식 캐싱 표 미기재(2026-09-25)"
   → **DISPUTED(정정)**. 2026-09-28 재조회 결과 공식 prompt-caching 표에 Opus 5.5가
   **512 tokens**로 명시되어 있음을 확인 (소스:
   https://platform.claude.com/docs/en/build-with-claude/prompt-caching). §6 표와
   "세대 순 비단조" 문구 정정.
3. Structured Outputs 스키마 제약(`additionalProperties: false` 필수,
   `minLength`/`minimum` 등 미지원, `output_config.format` 변경 시 캐시 무효화) →
   **VERIFIED** (동일 공식 문서, 같은 레포 `meta/fortune-interpretation-prompt-engineering`
   REFERENCE.md §6-2와 표기 방식 일치 확인 — 읽기만, 수정 없음).

**보강(ADD)·축소**:
- §3에 3-1(Structured Outputs, 스키마 예제 코드 + 공식 제약)·3-2(폴백: 기존 JSON
  지시+재시도) 신설. 안전 가드·한국 자원 안내 등 도메인 안전 콘텐츠는 전혀 축소하지
  않음.
- §6 최소 캐시 토큰 표의 Opus 5.5 "미확인" → "512"로 정정, 비단조성 설명 문구도
  Opus 5.5 포함하도록 수정.
- §9 출력 후처리 1번에 "Structured Outputs 사용 시 파싱 실패 사실상 없음" 단서 추가.
- §11에 함정 11번("`output_config.format`을 자주 바꿈") 추가.
- 검증일 불일치 정리: SKILL.md는 2026-08-12, verification.md 메타 표는 2026-08-11로
  어긋나 있었음 → 양쪽 모두 2026-09-28로 통일, frontmatter `date`·버전(v1.3)도 동기화.

**실전 질문 재검증**:
- Q1. "꿈 해몽 앱에서 JSON 응답 스키마를 강제하는 현행 권장 방식은? 예전 '재시도' 방식은
  언제 쓰는가?" → PASS (근거: SKILL.md "3-1 Structured Outputs (권장)" / "3-2 폴백")
- Q2. "Opus 5.5로 이 시스템 프롬프트를 캐싱하려는데 최소 토큰이 몇인가?" → PASS
  (근거: SKILL.md "6. 프롬프트 캐싱 활용" 최소 캐시 토큰 표 — 512 tokens)

**재검증 최종 판정**: status **PENDING_TEST 전환** (Structured Outputs 신규 코드
예제 추가 + 캐시 표 정정으로 실사용 재테스트 필요)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (2026-09-28 재검증 — Opus 5.5 캐시 임계값 정정 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 핵심 클레임 교차 검증 | ✅ (VERIFIED 9 / DISPUTED 1 수정반영 / UNVERIFIED 0, 2026-05-14) + 2026-09-28 재검증 3건(정정 2·검증 1) |
| 에이전트 활용 테스트 | ✅ (2026-05-14 수행, 3/3 PASS) + 2026-09-28 재테스트 2/2 PASS + 2026-11-06 skill-tester 재테스트 3/3 PASS (Sonnet 5.5 JSON 강제·between_tools / 캐시 512·비용 / temperature 400 겨냥) |
| **최종 판정** | **APPROVED** (2026-11-06 3차 재검증 후 skill-tester 재테스트 3/3 PASS) |

> 본 스킬은 *프롬프트 패턴* 카테고리로, `verification-policy.md` 기준 "content test PASS = APPROVED 가능". 운영 환경의 *톤 일관성·안전 가드 발동률* 같은 실측 메트릭 검증은 사용자 영역.

---

## 7. 개선 필요 사항

- [✅] 사용자 초안의 "KCC 콜센터 1577-0199" → "보건복지부 정신건강상담전화 1577-0199 + 자살 위험은 109" 로 정정 반영 완료
- [❌] 짝 스킬(`humanities/korean-dream-interpretation-tradition`, `humanities/dream-psychology-jung-freud`) 미생성 상태 — 본 스킬 단독 사용은 가능하지만 *해몽 콘텐츠*는 짝 스킬과 함께 사용해야 효과적. 해당 스킬 생성 시 본 스킬에 cross-link 점검
- [✅] **skill-tester content test 수행 완료** (2026-05-14, 3/3 PASS) — APPROVED 전환
- [✅] 2026-09-28 재검증(2차)에서 Structured Outputs §3-1·3-2 신설 + 캐시 표 정정 →
  skill-tester 재테스트 완료 (2026-09-28, 2/2 PASS) — APPROVED 전환
- [✅] 2026-11-06 재검증(3차, Sonnet 5.5·SDK 2.x·캐시 512·비용 재계산·temperature 400) 후 skill-tester 재테스트 완료 (2026-11-06 완료, 3/3 PASS) — APPROVED 유지
- [❌] (선택 보강, 차단 요인 아님) SKILL.md §11 함정 번호 순서 정리(9→12→10→11), `between_tools` 동작 설명·Haiku 5.5 단가·캐시 손익분기점 추가

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성. 공식 docs 기반 + 한국 안전 자원(109 통합) 정정 반영 | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 안전가드 system 배치 이유 / Q2 109 vs 1577-0199 구분 / Q3 Haiku 캐시 미스 원인·해결) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-08-11 | v1 | **모델 ID 정기 감사.** 헤더 "대상 모델" `Claude Opus 4.7` → `Claude Opus 4.8`. 최소 캐시 토큰 절(§6) 정정 — 기존 "Opus 4.7 = 4,096"은 오류로, Opus 4.8=1,024 / 4.7=2,048 / 4.6·4.5=4,096 / Haiku 4.5=4,096으로 교체. 함정 §9의 retired 모델 ID 안내를 "작동하지 않을 수 있다" → 실제 retired 사실로 현행화. 본문 코드의 `claude-sonnet-4-6`은 현행이라 미변경. Q3 테스트 근거(Haiku 4.5=4,096, Sonnet 4.6=1,024)는 정정 후에도 그대로 유효. status는 APPROVED 유지 | 모델 ID 정기 감사 |
| 2026-08-12 | v1.1 | **모델 ID 세대 정렬.** 헤더 "대상 모델" `Claude Opus 4.8 / Sonnet 4.6 / Haiku 4.5` → `Claude Opus 5 / Sonnet 5 / Haiku 4.5`(Haiku는 현행 유지). 본문 캐싱 예제 코드의 `claude-sonnet-4-6` → `claude-sonnet-5`. §6 최소 캐시 토큰 표에 **Opus 5 = 512** 행 추가(Opus 4.8 대비 절반), Sonnet 5를 1,024 행에 편입, 임계값이 세대 순으로 단조롭지 않다는 주의 추가. 비용 효과 절 기준 모델 Sonnet 4.6 → Sonnet 5. 함정 §9의 모델 ID 하드코딩 항목을 현행 별칭(`claude-opus-5`·`claude-sonnet-5`·`claude-haiku-4-5`) 기준으로 재작성하고 4.8/4.6을 legacy로 표기. 샘플링 파라미터·`budget_tokens` 사용 없음 — 5 계열 400 이슈 해당 없음. 검증일 2026-08-11 → 2026-08-12. status **APPROVED 유지** | 모델 ID 세대 정렬 |
| 2026-09-25 | v1.2 | **모델 ID 현행화(Opus 5.5/Fable 5.1).** 헤더 대상 모델 Opus 5 → Opus 5.5(예제 기본은 Sonnet 5 유지). §6 최소 캐시 토큰 512 행에 Fable 5.1/Fable 5 편입, Opus 5.5는 "미확인" 표기. 함정 §9 현행 ID를 `claude-opus-5-5`로, `claude-opus-5`를 legacy 목록에 추가. 메타 표 "대상 모델" 행(4.8/4.6 잔존) 동기화. 본문 코드에 thinking disabled·강제 `tool_choice` 없음 — Opus 5.5 브레이킹 해당 없음. status APPROVED 유지 | 모델 ID 현행화 |
| 2026-09-28 | v1.3 | **재검증(2차) — Structured Outputs 반영.** §3에 3-1(Structured Outputs `output_config.format` 스키마 강제, GA, Haiku 4.5/Sonnet 5/Opus 5.5 지원 확인)·3-2(기존 "JSON만 반환+재시도"를 폴백으로 재배치) 신설. §6 최소 캐시 토큰 표의 "Opus 5.5 미확인"을 **512로 정정**(공식 표 갱신 확인). §9 출력 후처리·§11 함정에 Structured Outputs 관련 단서 추가. SKILL.md(2026-08-12)·verification.md 메타 표(2026-08-11) 검증일 불일치를 2026-09-28로 통일. 안전 가드·한국 자원 안내는 축소 없음. status **PENDING_TEST 전환** | 재검증 2차 |
| 2026-09-28 | v1.4 | 2단계 실사용 재테스트 수행 (Q1 Structured Outputs 현행 권장 방식·폴백 위치 / Q2 Opus 5.5 캐시 최소 토큰·스키마 변경 시 캐시 무효화) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-11-06 | v1.5 | **재검증(3차) — 현행 모델·API 버전 2026-10-21 반영.** 헤더 대상 모델 Sonnet 5·Haiku 4.5 → Sonnet 5.5·Haiku 5.5(예제 기본 `claude-sonnet-5-5`), SDK 기준 `anthropic>=2.6.0` 명시. §3-1 코드에 `effort="low"`·`stop_reason` 확인·text 블록 탐색 추가, Sonnet 5.5 주의(disabled 400 → `between_tools`, prefill·budget_tokens 400) 추가. §6 최소 캐시 토큰을 현행 4종 512 / Legacy 별도 줄로 재구성, "Haiku 4.5 캐시 미스 → Sonnet 권장" 서술 삭제. §6 비용을 Sonnet 5.5 기준($2·$2.50·$4·$0.10, 95% 절감)으로 재계산 — 이전 $3 기준값은 Sonnet 4.6 단가가 남아 있던 오류. §10 함정 9 현행 ID 갱신, 함정 12(`temperature` 400) 신설 | 재검증 3차 |
| 2026-11-06 | v1.5 | 재검증 후 2단계 실사용 재테스트 수행 (Q1 Sonnet 5.5 JSON 강제·between_tools·text 블록 추출 / Q2 캐시 512·Sonnet 5.5 단가·95% 절감·4,096 우회 불필요 / Q3 temperature 400·스키마 고정) → 3/3 PASS, APPROVED 유지 | skill-tester |
| 2026-11-11 | v1.6 | 2026-11-11 재검증 — Fable 5.2 현행화(공식 models overview·whats-new-fable-5-2). SKILL.md §6 최소 캐시 토큰 현행 목록 Fable 5.1 → **Fable 5.2**, Legacy 목록에 Fable 5.1 추가. 클레임 C13 갱신. status 변경 없음 | Claude |
| 2026-11-12 | v1.7 | 정리(사실 재검증 아님) — Claude API 사용법 절만 덜어내기: 덜어낸 것 헤더 대상 모델·SDK 기준 줄, §3-1 SDK 호출 코드·Sonnet 5.5 thinking/prefill 주의·스키마 공식 제약·§3-2 Structured Outputs 폴백 설명, §6 캐싱 코드·최소 캐시 토큰·TTL·단가 계산, 함정 9(모델 ID)·11(output_config 캐시 무효화)·12(temperature 400) → 그 자리에 "API 호출·캐싱·structured outputs 는 Claude Code 기본 `claude-api` 스킬 참조" / 남긴 것 프롬프트 구조·시스템 프롬프트 템플릿·JSON 스키마(DREAM_SCHEMA 본체 포함)·few-shot·한국 위기 자원·전처리·후처리·평가 지표·분야 함정, REFERENCE.md(지워진 dream-multi-perspective-synthesizer 언급은 "메인 대화에서"로) | 정리 |
