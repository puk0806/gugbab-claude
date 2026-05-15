---
skill: dream-symbol-tagging
category: frontend
version: v1
date: 2026-05-15
status: PENDING_TEST
---

# dream-symbol-tagging 스킬 검증

> 새 스킬 추가 검증 기록. 실 LLM 호출·임베딩 측정·실제 한국어 형태소 분석기 통합은
> 운영 환경 도입 시 측정해야 하므로 최종 판정은 `PENDING_TEST` 유지.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-symbol-tagging` |
| 스킬 경로 | `.claude/skills/frontend/dream-symbol-tagging/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (Claude Opus 4.7) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] OpenAI Embeddings 공식 문서 확인 (text-embedding-3-small 차원·가격·정규화)
- [✅] Anthropic Structured Outputs 공식 문서 확인 (tool_use, output_format, 베타 헤더)
- [✅] KoNLPy 공식 문서 확인 (지원 분석기·성능 비교)
- [✅] mecab-ko / Eunjeon Project 정보 확인
- [✅] 최신 버전·모델 기준 내용 정리 (2026-05-15)
- [✅] 핵심 패턴 정리 (룰·LLM·임베딩 3축 하이브리드)
- [✅] 코드 예시 작성 (tool_use, 임베딩 사전 계산, 코사인 유사도, 병합)
- [✅] 흔한 실수 패턴 정리 (룰 단독·JSON 깨짐·형태소 누락·다중 의미·차원 축소·키 노출)
- [✅] SKILL.md 파일 작성
- [✅] 짝 스킬(`dream-journal-data-modeling`·`korean-dream-interpretation-tradition`) 연결 기술

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "OpenAI text-embedding-3-small embeddings API documentation" | 공식 문서·모델 페이지 URL 수집 |
| 조사 | WebSearch | "Anthropic Claude API JSON structured output schema" | Structured Outputs · tool_use cookbook URL 수집 |
| 조사 | WebSearch | "KoNLPy Korean morphological analyzer documentation" | KoNLPy 0.6.0 공식 / 분석기 5종 정보 |
| 조사 | WebSearch | "mecab-ko Korean tokenizer eunjeon" | Eunjeon Project mecab-ko 정보 |
| 교차 검증 | WebSearch | "OpenAI text-embedding-3-small dimensions 1536 cosine similarity" | 1536차원·L2 정규화·코사인=dot product 재확인 |
| 교차 검증 | WebSearch | "Claude API tool_use force JSON output extract structured data" | tool_choice 강제 패턴 재확인 |
| 교차 검증 | WebFetch | KoNLPy `https://konlpy.org/en/latest/morph/` | Mecab 100K자 0.28초 / 5개 분석기 성능 수치 확인 |
| 교차 검증 | WebFetch | `https://platform.openai.com/docs/guides/embeddings` | HTTP 403 차단 — 다른 공식·미러 소스(zilliz, developers.openai.com)로 대체 |
| 작성 | Write | SKILL.md (13 섹션) | 4,500자+ 작성 완료 |
| 작성 | Write | verification.md | 8 섹션 작성 완료 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| OpenAI Embeddings Guide | https://platform.openai.com/docs/guides/embeddings | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 (직접 fetch는 403, 검색 인용으로 확인) |
| OpenAI text-embedding-3-small | https://platform.openai.com/docs/models/text-embedding-3-small | ⭐⭐⭐ High | 2026-05-15 | 공식 모델 페이지 |
| OpenAI Embeddings API Reference | https://developers.openai.com/api/reference/resources/embeddings/methods/create | ⭐⭐⭐ High | 2026-05-15 | 공식 API 레퍼런스 |
| Anthropic Structured Outputs | https://platform.claude.com/docs/en/build-with-claude/structured-outputs | ⭐⭐⭐ High | 2026-05-15 | 공식 문서, 베타 헤더·지원 모델 명시 |
| Anthropic Cookbook (tool_use 추출) | https://github.com/anthropics/anthropic-cookbook/blob/main/tool_use/extracting_structured_json.ipynb | ⭐⭐⭐ High | 2026-05-15 | 공식 GitHub cookbook |
| KoNLPy 공식 문서 (morph) | https://konlpy.org/en/latest/morph/ | ⭐⭐⭐ High | 2026-05-15 | 5개 분석기 성능 비교 |
| mecab-ko (Eunjeon) | https://bitbucket.org/eunjeon/mecab-ko/ | ⭐⭐⭐ High | 2026-05-15 | 원저 리포지토리 (사용자 지정 URL) |
| zilliz text-embedding-3-small 가이드 | https://zilliz.com/ai-models/text-embedding-3-small | ⭐⭐ Medium | 2026-05-15 | 보조 교차 확인용 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전·모델 정보 명시 (text-embedding-3-small / Claude Sonnet 4.6 / Structured Outputs 베타 헤더 `structured-outputs-2025-11-13`)
- [✅] deprecated 패턴 권장 없음 (legacy `text-embedding-ada-002` 미사용)
- [✅] 코드 예시가 실행 가능한 형태 (TS + Anthropic/OpenAI SDK 최신 인터페이스)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (`name`, `description`, `<example>` 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (하이브리드 3축·카테고리 6종·사전 스키마)
- [✅] 코드 예시 포함 (룰 매칭·tool_use·임베딩·병합·통합 파이프라인)
- [✅] 언제 사용 / 비사용 기준 포함
- [✅] 흔한 실수 패턴 6항목 포함

### 4-3. 실용성

- [✅] 에이전트가 참조해 실제 코드 작성에 도움 가능 (API 호출 패턴·타입 정의 구체)
- [✅] 이론보다 실용 (사전 구조·임계값·fallback 분기 명시)
- [✅] 범용 사용 가능 (특정 프로젝트 종속 없음, IndexedDB·서버리스 어느 환경에도 적용)

### 4-4. 에이전트 활용 테스트

- [✅] skill-tester → general-purpose 실전 질문 3개 수행 (2026-05-15)

### 4-5. 교차 검증한 핵심 클레임

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | text-embedding-3-small 기본 차원은 1536 | OpenAI 공식 + zilliz + 검색 다수 | VERIFIED |
| 2 | OpenAI v3 임베딩은 L2 정규화되어 cosine = dot product | OpenAI 공식 + developers.openai.com | VERIFIED |
| 3 | `dimensions` 파라미터로 차원 축소 가능 (256 이상) | OpenAI 공식 (Matryoshka) | VERIFIED |
| 4 | text-embedding-3-small 가격 $0.00002 / 1K 토큰 | OpenAI 공식 + 검색 다수 | VERIFIED |
| 5 | Claude API에서 `tool_choice: {type:"tool", name:...}`로 JSON 강제 가능 | Anthropic Cookbook + 공식 문서 | VERIFIED |
| 6 | Structured Outputs는 베타 헤더 `anthropic-beta: structured-outputs-2025-11-13` 필요 | Anthropic 공식 문서 | VERIFIED |
| 7 | KoNLPy는 Mecab/Okt/Komoran/Kkma/Hannanum 5종 지원 | KoNLPy 공식 morph 페이지 | VERIFIED |
| 8 | Mecab이 KoNLPy 분석기 중 최고 속도 (100K자 0.28초) | KoNLPy 공식 morph 페이지 | VERIFIED |
| 9 | mecab-ko는 Eunjeon Project가 MeCab을 한국어 적응 fork | mecab-ko 공식·DeepWiki | VERIFIED |
| 10 | Structured Outputs 지원 모델: Sonnet 4.5+/Opus 4.5+/Haiku 4.5 | Anthropic 공식 | VERIFIED |

**판정 요약:** VERIFIED 10 / DISPUTED 0 / UNVERIFIED 0

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 룰+LLM 하이브리드 흐름 — "룰 매칭만으로는 부족한데 LLM은 비용이 부담돼요. 어떻게 조합해야 하나요?"**
- PASS
- 근거: SKILL.md "§2 하이브리드 전략 개요", "§12 통합 파이프라인 예시", "§8 병합·정규화"
- 상세: §2 전략 선택 기준 표(정확도 우선·예산 있음 → 룰 1차 + LLM 정제), §12 코드 `ruleHits.length < 2 ? await llmExtract(text) : []` (룰 후보 부족 시에만 LLM 호출), §8 source 우선순위 `rule > llm > embedding` 모두 근거 명확. §10-1 룰 단독 한계(문맥 정서 놓침) anti-pattern 및 §1 LLM 단독 anti-pattern 도 명시되어 있음.

**Q2. Claude tool_use JSON 강제 패턴 — "Claude API로 꿈 텍스트에서 상징 JSON을 안정적으로 받고 싶어요."**
- PASS
- 근거: SKILL.md "§6-1 tool_use로 JSON 강제", "§6-3 JSON 깨짐 fallback", "§6-2 Structured Outputs 베타"
- 상세: §6-1에 `tool_choice: { type: "tool", name: "extract_dream_symbols" }` 완전한 TS 코드 예시 존재. `input_schema` enum 카테고리 6종(natural/animal/person/action/sensation/object) 명시. `res.content.find((c) => c.type === "tool_use")` 파싱 패턴 존재. §6-3 safeParseSymbols 3단계 fallback 존재. §10-2 JSON 깨짐 무대응 anti-pattern 명시되어 fallback 구현 강제.

**Q3. 형태소 분석 필요성 — "굳이 mecab-ko까지 써야 하나요? includes('뱀')으로 검사하면 안 되나요?"**
- PASS
- 근거: SKILL.md "§5-1 왜 형태소 분석이 필요한가", "§5-2 추천 도구", "§10-3 한국어 형태소 분석 누락"
- 상세: §5-1 비교 표에서 "선뱀선글라스" 오매칭(단순 ❌/mecab ✅), "구렁이가 또아리를 틀었다" 미매칭(단순 ❌/mecab ✅synonym 매핑) 구체적 사례 존재. §5-2에서 브라우저 환경 mecab-ko WebAssembly 사전 수십 MB 용량 문제로 서버 API 분리 권장 명시. §10-3에서 `text.includes("뱀")` 단순 매칭 합성어 오매칭·어미 결합 누락 anti-pattern 명확히 명시.

### 발견된 gap (있으면)

- 없음. 3개 질문 모두 SKILL.md 내 근거 섹션이 충분하며 anti-pattern 회피 확인됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 (외부 LLM·임베딩 API 실호출·한국어 형태소 분석기 통합 결과 실측 필요)
- 최종 상태: PENDING_TEST 유지 (content test PASS, 실사용 검증은 운영 도입 후)

---

> 아래는 skill-creator가 작성한 원래 예정 기록 (참고용 보존)

### 테스트 케이스 1: tool_use 강제 JSON 출력 패턴 안내

**입력 (예정):**
```
"Claude API로 꿈 텍스트에서 상징 JSON을 안정적으로 받고 싶어요. 어떻게 호출해야 하나요?"
```

**기대 결과:**
SKILL.md §6-1 코드 예시 기반으로 `tools` + `tool_choice: {type:"tool", name:"extract_dream_symbols"}` 패턴 안내. `input_schema`의 `enum` 카테고리 6종 명시. 응답 파싱은 `content.find(c => c.type === "tool_use")` 사용.

**실제 결과:** 2026-05-15 수행 완료 — PASS (Q2로 처리)

**판정:** PASS

### 테스트 케이스 2: 룰·LLM 하이브리드 흐름 설명

**입력 (예정):**
```
"룰 매칭만으로는 부족한데 LLM은 비용이 부담돼요. 어떻게 조합해야 하나요?"
```

**기대 결과:**
§2의 의사결정 흐름과 §12 통합 파이프라인 의사 코드를 인용해 *룰 1차 → 후보 부족·신뢰도 낮을 때만 LLM 호출 → 임베딩은 추천 결합 시 선택* 단계적 조합을 설명. source 우선순위 `rule > llm > embedding` 정렬 규칙 포함.

**실제 결과:** 2026-05-15 수행 완료 — PASS (Q1로 처리)

**판정:** PASS

### 테스트 케이스 3: 한국어 형태소 분석 필요성 설명

**입력 (예정):**
```
"굳이 mecab-ko까지 써야 하나요? 그냥 includes('뱀')으로 검사하면 안 되나요?"
```

**기대 결과:**
§5-1 비교 표 인용해 "뱀이/뱀에게/구렁이/선뱀..." 케이스에서 단순 매칭이 오·미매칭하는 것을 보이고, KoNLPy Mecab 또는 Komoran 사용자 사전 보강을 권장. 브라우저 환경에서는 WebAssembly 사전 용량 문제로 서버 API 권장.

**실제 결과:** 2026-05-15 수행 완료 — PASS (Q3로 처리)

**판정:** PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (공식 문서 10개 클레임 모두 VERIFIED) |
| 구조 완전성 | ✅ (frontmatter·소스·검증일·코드·함정 모두 포함) |
| 실용성 | ✅ (실제 SDK 호출 코드와 fallback 분기까지 포함) |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-15, skill-tester → general-purpose) |
| **최종 판정** | **PENDING_TEST 유지** (content test 3/3 PASS. 실 LLM API 호출·임베딩 측정·형태소 분석기 통합은 운영 도입 후 실측 필요) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] 실 OpenAI API 호출로 사전 100개·꿈 텍스트 50건 임베딩 매칭 정확도 측정 — **차단 요인 아님**, 운영 도입 후 선택 보강 (PENDING_TEST 유지 근거)
- [❌] Claude API `tool_use` 실호출로 JSON 스키마 위반율(% 단위) 측정 — **차단 요인 아님**, 운영 도입 후 선택 보강
- [❌] 임계값(코사인 0.45) 도메인 튜닝 — 한국어 꿈 텍스트 코퍼스 기반 — **차단 요인 아님**, 선택 보강
- [❌] mecab-ko WebAssembly 빌드 실측: PWA에서 초기 로드 시간·메모리 영향 — **차단 요인 아님**, 실사용 필수 검증 항목 (PENDING_TEST 유지 근거)
- [❌] Komoran 사용자 사전에 꿈 도메인 신조어 추가 가이드 — **차단 요인 아님**, 선택 보강
- [❌] 임베딩 단계에서 *문장 단위 분할 + max-pooling* 전략 실험·수치화 — **차단 요인 아님**, 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (룰·LLM·임베딩 3축 하이브리드, 6개 카테고리, 한국어 형태소 처리) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 룰+LLM 하이브리드 흐름 / Q2 tool_use JSON 강제 패턴 / Q3 mecab-ko 형태소 분석 필요성) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
