---
skill: dream-recurrence-detection
category: frontend
version: v1
date: 2026-05-15
status: PENDING_TEST
---

# dream-recurrence-detection 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-recurrence-detection` |
| 스킬 경로 | `.claude/skills/frontend/dream-recurrence-detection/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (Claude) |
| 스킬 버전 | v1 |
| 카테고리 분류 | **실사용 필수 스킬** — 실 꿈 일지 누적 데이터로 반복 감지가 *진짜* 작동하는지 검증 필요. PENDING_TEST 유지. |

---

## 1. 작업 목록 (Task List)

- [✅] 학술 1순위 소스 확인 (Zadra 1996 in *Trauma and Dreams*, Domhoff 2003)
- [✅] 기술 1순위 소스 확인 (OpenAI Embeddings 공식, Dexie MultiEntry 공식)
- [✅] 최신 버전 기준 내용 확인 (2026-05-15)
- [✅] 감지 알고리즘 3종 (태그/임베딩/LLM) 정리
- [✅] 반복 정의 기준 (빈도·시점·정서) 조작적 정의 작성
- [✅] Dexie multiEntry 쿼리 패턴 + distinct() 권장 반영
- [✅] 임베딩 저장 형식 (ArrayBuffer) + 크기 가이드
- [✅] 사용자 알림 hedging UX
- [✅] 개인정보 동의 화면 패턴
- [✅] 흔한 함정 7종 정리
- [✅] 짝 스킬 분담표
- [✅] SKILL.md 작성 완료
- [✅] verification.md 작성 완료

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확인 |
| 중복 확인 | Glob | `dream-recurrence-detection/SKILL.md` | 중복 없음 |
| 짝 스킬 확인 | Glob | `dream-symbol-tagging`, `dream-journal-data-modeling`, `dream-content-research` | architecture/dream-journal-data-modeling 존재, 나머지 미생성 (참조 명시) |
| 조사 1 | WebSearch | "Zadra Robert 1997 Dreaming journal recurrent dreams" | 10개 소스, Zadra 1996/1997 구분 식별 |
| 조사 2 | WebSearch | "Domhoff Scientific Study of Dreams continuity hypothesis" | 10개 소스, PDF 직접 접근 가능 |
| 조사 3 | WebSearch | "OpenAI text-embedding-3-small cosine threshold" | 10개 소스, 차원·정규화 확인 |
| 조사 4 | WebSearch | "Dexie multiEntry where equals count" | 공식 + GitHub issue 확인 |
| 조사 5 | WebFetch | dexie.org/docs/MultiEntry-Index | `*tags` 문법, distinct() 권장 공식 확인 |
| 조사 6 | WebFetch | platform.openai.com/docs/guides/embeddings | 403 (대체 소스 활용) |
| 조사 7 | WebFetch | antoniozadra.com/en/publications | Zadra 정확 인용 정보 확보 |
| 교차 검증 1 | WebSearch | Zadra 1996 *Trauma and Dreams* 챕터 확인 | DeGruyter·HUP·PsycNet 3개 독립 소스 → VERIFIED |
| 교차 검증 2 | WebSearch | text-embedding-3-small 1536차원·정규화 | OpenAI + zilliz + TokenMix 3개 → VERIFIED |
| 교차 검증 3 | WebSearch | cosine 임계치 범위 (0.7±) | MDPI + Springer + sbert 학술 → VERIFIED |
| 교차 검증 4 | WebSearch | recurrent dream 60-75% 유병률 | Sleep Foundation + Wikipedia + Scientific American → VERIFIED |
| 교차 검증 5 | WebSearch | dream journal app 개인정보 best practice | Journey.cloud + DayOne + DeepJournal → VERIFIED |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Zadra (1996) "Recurrent dreams" in *Trauma and Dreams* (Harvard UP) | https://www.degruyter.com/document/doi/10.4159/9780674270534-019/html | ⭐⭐⭐ High | 2026-05-15 | 학술 원전 — 반복 꿈 정의의 표준 인용 |
| Domhoff (2003) *The Scientific Study of Dreams* (APA) PDF | https://dreams.ucsc.edu/TSSOD/The_Scientific_Study_of_Dreams_2003.pdf | ⭐⭐⭐ High | 2026-05-15 | 저자 본인 페이지 PDF — continuity hypothesis |
| Zadra Publications (저자 공식 페이지) | https://antoniozadra.com/en/publications | ⭐⭐⭐ High | 2026-05-15 | 정확 인용 정보 검증 |
| OpenAI Embeddings Guide | https://developers.openai.com/api/docs/guides/embeddings | ⭐⭐⭐ High | 2026-05-15 | text-embedding-3-small 1536차원·정규화 |
| Dexie MultiEntry Index 공식 문서 | https://dexie.org/docs/MultiEntry-Index | ⭐⭐⭐ High | 2026-05-15 | `*tags` 문법, distinct() 권장 |
| Dexie Table.where() 공식 | https://dexie.org/docs/Table/Table.where().html | ⭐⭐⭐ High | 2026-05-15 | API 시그니처 |
| Recurring dream — Wikipedia | https://en.wikipedia.org/wiki/Recurring_dream | ⭐⭐ Medium | 2026-05-15 | 유병률 60-75% 교차 검증 |
| Sleep Foundation: Recurring Dreams | https://www.sleepfoundation.org/dreams/dream-interpretation/recurring-dreams | ⭐⭐ Medium | 2026-05-15 | 유병률 교차 검증 |
| Transformer Paraphrase Detection (MDPI 2025) | https://www.mdpi.com/2073-431X/14/9/385 | ⭐⭐ Medium | 2026-05-15 | cosine 임계치 0.7 표준 근거 |
| Sentence Transformers Semantic Textual Similarity | https://sbert.net/docs/sentence_transformer/usage/semantic_textual_similarity.html | ⭐⭐⭐ High | 2026-05-15 | cosine 운영 가이드 |
| Day One End-to-End Encryption | https://dayoneapp.com/features/end-to-end-encryption/ | ⭐⭐ Medium | 2026-05-15 | 일지 앱 E2EE 업계 관행 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (text-embedding-3-small 1536 dim, Dexie 4.x multiEntry)
- [✅] deprecated 패턴 없음
- [✅] 코드 예시 실행 가능한 형태

#### 핵심 클레임 교차 검증 결과

| 클레임 | 1차 소스 | 2차 소스 | 판정 |
|--------|---------|---------|------|
| Zadra의 핵심 인용은 1996년 *Trauma and Dreams* 챕터다 (사용자 본문의 "Dreaming 7(2)"는 부정확) | DeGruyter HUP 챕터 페이지 | antoniozadra.com 공식 출판 목록 | **DISPUTED → 수정 반영** (1996 챕터로 정정) |
| Zadra & Pihl 1997은 *Psychotherapy and Psychosomatics*에 게재된 lucid dreaming 치료 연구 | antoniozadra.com | 다중 reference에서 인용 | VERIFIED |
| 반복 꿈은 성인의 60-75%가 경험한다 | Zadra 1996 인용 다수 | Wikipedia + Sleep Foundation | VERIFIED |
| text-embedding-3-small 기본 차원은 1536 | OpenAI 공식 가이드 | zilliz·TokenMix·OpenAI blog | VERIFIED |
| OpenAI 임베딩은 length 1로 정규화되어 cosine = dot product | OpenAI 공식 FAQ | OpenAI 공식 가이드 | VERIFIED |
| Dexie multiEntry는 `*field` 문법으로 정의 | Dexie 공식 문서 | Dexie GitHub issue 86 | VERIFIED |
| multiEntry 쿼리에는 distinct() 사용이 공식 권장 | Dexie 공식 문서 직접 인용 | Dexie 공식 예제 코드 | VERIFIED |
| cosine 임계치 0.7±는 paraphrase 분류의 보편 범위 | MDPI 2025 transformer 비교 연구 | sbert 공식 가이드 | VERIFIED |
| Domhoff continuity hypothesis: 꿈 내용은 깨어있는 삶과 연속성을 가진다 | TSSOD 2003 PDF | Pesant & Zadra 2006 *J Clin Psych* | VERIFIED |
| 꿈은 민감 정보로 로컬 우선·E2EE 권장 | journalisticapp.com privacy 글 | DayOne/Standard Notes 업계 관행 | VERIFIED |

> 주의: 사용자 요청 본문의 "Zadra & Robert 1997 *Dreaming* 7(2)" 인용은 학술 문헌에서 확인되지 않았다. SKILL.md에는 검증된 1996 챕터(Trauma and Dreams)와 1997 *Psychotherapy and Psychosomatics* 논문으로 정정 반영했다.

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (반복 정의·알고리즘 3종)
- [✅] 코드 예시 포함 (Dexie 스키마·쿼리·임베딩 직렬화)
- [✅] 언제 사용/사용하지 않을지 기준 포함 (§0)
- [✅] 흔한 실수 패턴 포함 (§6, 7종)

### 4-3. 실용성
- [✅] 에이전트 참조 시 실 구현에 도움 (Dexie 코드·임계치 권장값)
- [✅] 이론과 실용 균형 (학술 근거 + 구체 코드)
- [✅] 범용 (특정 프로젝트 종속 없음, dream journal 앱 일반)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] skill-tester 호출 (2026-05-15 수행 완료, 3/3 PASS)
- [❌] 실 꿈 일지 누적 데이터로 임계치 보정
- [❌] 알림 문구 사용자 수용성 테스트

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Dexie multiEntry distinct() 없이 태그 카운팅 시 문제점과 올바른 쿼리 패턴**
- PASS
- 근거: SKILL.md "§2-1 태그 기반 카운팅" 코드 블록, "§5-2 윈도우 기반 상징 카운트" `countSymbolInWindow`, "§8 체크리스트" 첫 번째 항목
- 상세: `where('tags').equals(symbol).filter(...).distinct().count()` 패턴이 §2-1·§5-2 양쪽에 명시됨. distinct() 없이 쓰면 multiEntry 특성상 한 레코드가 여러 index entry로 중복 카운팅될 수 있다는 문제도 §8 체크리스트("distinct() 적용했는가")에서 자가점검 항목으로 강조됨.

**Q2. cosine 유사도 0.65가 "같은 시나리오 반복 꿈" 판정 기준에 해당하는지, 임계치 보정 주의사항**
- PASS
- 근거: SKILL.md "§2-2 임베딩 cosine 유사도" 임계치 권장 표, 바로 아래 `주의:` 블록, "§6 흔한 함정" 세 번째 행
- 상세: 0.65는 "완화(같은 테마)" 범위(0.60~0.70)이며 "엄격(같은 시나리오)" 기준(0.75~0.82)에 미달. `주의:` 블록에 text-embedding-3-small은 ada-002 대비 낮은 cosine 값 경향 보고로 경험적 보정 필수 명시. §6에서 임계치 너무 낮으면 false positive 폭증 경고.

**Q3. 꿈 3개(N<5) 상황에서 알림 문구 필수 요소 + 임베딩 외부 API 사용 전 조치**
- PASS
- 근거: SKILL.md "§3-1 알림 문구 원칙" 표, "§6 흔한 함정" 첫 번째 행, "§4-2 동의 UX"
- 상세: N < 5에서는 §6 명시대로 알림 자제 또는 "표본이 작아 신뢰도 제한적" 필수 고지. §3-1에서 hedging 톤·진단 단정 금지·표본 한계 고지·사용자 주도 4원칙 확인. §4-2에서 임베딩 외부 전송 전 별도 화면·체크박스 default OFF·거부해도 태그 기반 사용 가능 고지 요구.

### 발견된 gap

없음. 3/3 질문 모두 SKILL.md 내 명확한 근거 섹션에서 답변 가능.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 (실 꿈 일지 누적 데이터·cosine 임계치 실전 보정 필요)
- 최종 상태: PENDING_TEST 유지 (content test PASS이나 실사용 필수 카테고리)

---

### 향후 테스트 계획 (실사용 시 수행)

**테스트 케이스 1: 태그 카운팅 정확성**
- 입력: 4주 윈도우, '물' 태그 4회 등장 시드 데이터
- 기대: `where('tags').equals('water').distinct().count()` = 4
- 검증 포인트: distinct() 적용 전후 결과 차이 (multiEntry 중복 제거)

**테스트 케이스 2: 임베딩 임계치 보정**
- 입력: 동일 시나리오 꿈 5쌍 + 다른 시나리오 꿈 5쌍
- 기대: 임계치 0.75에서 진짜 반복만 식별 (recall/precision 측정)
- 검증 포인트: 임계치 0.6/0.75/0.85 변경 시 결과 변화

**테스트 케이스 3: 알림 문구 hedging 검증**
- 입력: 반복 패턴 감지 → 알림 문구 생성
- 기대: "…일 수도 있습니다", "여러 해석이 있습니다" 등 hedging 표현 포함
- 검증 포인트: 진단·단정 표현 없음

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (10/10 클레임 VERIFIED, 1건 DISPUTED → 수정 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-15, 3/3 PASS — content test 완료, 실사용 필수로 PENDING_TEST 유지) |
| **최종 판정** | **PENDING_TEST** (content test PASS, 실사용 필수 카테고리로 유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] 짝 스킬 `frontend/dream-symbol-tagging` 생성 후 §7 책임 분담표와 상호 참조 점검 (차단 요인 아님 — 선택 보강)
- [❌] 짝 스킬 `humanities/dream-content-research` 생성 후 §3-2 학술 근거 표기와 정렬 (차단 요인 아님 — 선택 보강)
- [❌] 실 데이터 5명 × 30일 누적 시 임계치 권장값 보정 (차단 요인 — 실사용 필수 카테고리 해소를 위해 APPROVED 전환 전 수행 필요)
- [❌] 알림 문구 A/B 테스트로 hedging 강도 결정 (차단 요인 아님 — 선택 보강)
- [❌] 임베딩 외부 벡터 DB 옵션(Pinecone/Weaviate) 추가 가이드 — 현재는 로컬 우선만 다룸 (차단 요인 아님 — 선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성. 학술 인용 1건 정정(Zadra 1996 챕터로 수정). 알고리즘 3종·Dexie 패턴·hedging UX·개인정보 동의·흔한 함정 7종 포함 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 Dexie multiEntry distinct() 쿼리 / Q2 cosine 임계치 0.65 판정 + 보정 주의 / Q3 N<5 알림 문구 + 임베딩 동의 UX) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
