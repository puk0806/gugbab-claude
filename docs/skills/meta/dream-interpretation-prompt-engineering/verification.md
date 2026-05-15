---
skill: dream-interpretation-prompt-engineering
category: meta
version: v1
date: 2026-05-14
status: APPROVED
---

# verification — dream-interpretation-prompt-engineering

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-interpretation-prompt-engineering` |
| 스킬 경로 | `.claude/skills/meta/dream-interpretation-prompt-engineering/SKILL.md` |
| 검증일 | 2026-05-14 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 모델 | Claude Opus 4.7 / Sonnet 4.6 / Haiku 4.5 (2026-05 기준) |

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
| C4 | Opus 4.7 / Haiku 4.5 최소 캐시 토큰 = 4,096 | **VERIFIED** | 공식 docs 명시 |
| C5 | Cache write 1.25x / read 0.1x 가격 | **VERIFIED** | 공식 docs + finout 가격 가이드 일치 |
| C6 | few-shot 3–5개 권장, `<example>` 태그 | **VERIFIED** | 공식 best-practices `Use examples effectively` 명시 |
| C7 | role prompting을 system에 두는 권고 | **VERIFIED** | 공식 best-practices `Give Claude a role` + 검색 결과 다수 |
| C8 | XML 태그로 구획화 권고 | **VERIFIED** | 공식 best-practices `Structure prompts with XML tags` |
| C9 | 한국 자살예방 상담전화 109 통합 (2024-01-01) | **VERIFIED** | 보건복지부 보도자료 + 정책브리핑 일치 |
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

---

## 5. 테스트 진행 기록

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

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 핵심 클레임 교차 검증 | ✅ (VERIFIED 9 / DISPUTED 1 수정반영 / UNVERIFIED 0) |
| 에이전트 활용 테스트 | ✅ (2026-05-14 수행, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

> 본 스킬은 *프롬프트 패턴* 카테고리로, `verification-policy.md` 기준 "content test PASS = APPROVED 가능". 운영 환경의 *톤 일관성·안전 가드 발동률* 같은 실측 메트릭 검증은 사용자 영역.

---

## 7. 개선 필요 사항

- [✅] 사용자 초안의 "KCC 콜센터 1577-0199" → "보건복지부 정신건강상담전화 1577-0199 + 자살 위험은 109" 로 정정 반영 완료
- [❌] 짝 스킬(`humanities/korean-dream-interpretation-tradition`, `humanities/dream-psychology-jung-freud`) 미생성 상태 — 본 스킬 단독 사용은 가능하지만 *해몽 콘텐츠*는 짝 스킬과 함께 사용해야 효과적. 해당 스킬 생성 시 본 스킬에 cross-link 점검
- [✅] **skill-tester content test 수행 완료** (2026-05-14, 3/3 PASS) — APPROVED 전환

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성. 공식 docs 기반 + 한국 안전 자원(109 통합) 정정 반영 | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 안전가드 system 배치 이유 / Q2 109 vs 1577-0199 구분 / Q3 Haiku 캐시 미스 원인·해결) → 3/3 PASS, APPROVED 전환 | skill-tester |
