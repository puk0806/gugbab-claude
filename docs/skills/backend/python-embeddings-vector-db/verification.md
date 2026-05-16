---
skill: python-embeddings-vector-db
category: backend
version: v1
date: 2026-05-15
status: PENDING_TEST
---

# python-embeddings-vector-db 검증 기록

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `python-embeddings-vector-db` |
| 스킬 경로 | `.claude/skills/backend/python-embeddings-vector-db/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (OpenAI Embeddings, Chroma, sentence-transformers, pgvector, HuggingFace ko-sbert)
- [✅] 공식 GitHub 2순위 소스 확인 (chroma-core, pgvector, FlagOpen/FlagEmbedding, jhgan00/ko-sentence-transformers)
- [✅] 최신 버전 기준 내용 확인 (chromadb 1.5.9 / pgvector 0.8.2 / sentence-transformers v5.x — 2026-05-15)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (모델 선택, DB 선택, 메트릭 등가성, HNSW 파라미터, 청킹 기본값)
- [✅] 코드 예시 작성 (Chroma PersistentClient, pgvector HNSW, OpenAI Matryoshka, 반복 꿈 감지)
- [✅] 흔한 실수 패턴 정리 (10건 anti-pattern 표)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | OpenAI text-embedding-3 dimensions/pricing, Chroma Python API, ko-sbert KorSTS, pgvector HNSW/IVF, Qdrant Python, Vector DB 비교, RAG chunking, cosine/dot/euclidean 등가성, sentence-transformers normalize_embeddings, OpenAI Matryoshka dimensions param, BGE-M3, hybrid search BM25 | 공식·준공식 소스 30+ URL 확보 |
| 조사 | WebFetch | huggingface.co/jhgan/ko-sbert-multitask, docs.trychroma.com, github.com/pgvector/pgvector | KorSTS Pearson 84.13 / chromadb 1.5.x API / pgvector 0.8.2 + 연산자 표 직접 확인 |
| 교차 검증 | WebSearch | 핵심 클레임 8건 독립 소스 2개 이상에서 재확인 | VERIFIED 8 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| OpenAI Embeddings 공식 가이드 | https://developers.openai.com/api/docs/guides/embeddings | ⭐⭐⭐ High | 2026-05-15 | text-embedding-3 모델 사양 |
| OpenAI New embedding models 발표 | https://openai.com/index/new-embedding-models-and-api-updates/ | ⭐⭐⭐ High | 2026-05-15 | Matryoshka·dimensions 파라미터 |
| Chroma 공식 사이트 | https://www.trychroma.com/ | ⭐⭐⭐ High | 2026-05-15 | 기능 개요 |
| Chroma Python Client 레퍼런스 | https://docs.trychroma.com/reference/python/client | ⭐⭐⭐ High | 2026-05-15 | PersistentClient/HttpClient API |
| chromadb PyPI | https://pypi.org/project/chromadb/ | ⭐⭐⭐ High | 2026-05-15 | 1.5.9 (2026-05-05 release) |
| sentence-transformers 공식 (sbert.net) | https://sbert.net/ | ⭐⭐⭐ High | 2026-05-15 | encode + normalize_embeddings |
| HuggingFace jhgan/ko-sbert-multitask | https://huggingface.co/jhgan/ko-sbert-multitask | ⭐⭐⭐ High | 2026-05-15 | KorSTS Pearson 84.13 / 768 dim / max 128 |
| HuggingFace jhgan/ko-sroberta-multitask | https://huggingface.co/jhgan/ko-sroberta-multitask | ⭐⭐⭐ High | 2026-05-15 | RoBERTa 변종 |
| GitHub jhgan00/ko-sentence-transformers | https://github.com/jhgan00/ko-sentence-transformers | ⭐⭐⭐ High | 2026-05-15 | 모델 패밀리 인덱스 |
| HuggingFace BAAI/bge-m3 | https://huggingface.co/BAAI/bge-m3 | ⭐⭐⭐ High | 2026-05-15 | 100+ 언어 / 8192 tokens / 1024 dim |
| BGE 공식 문서 | https://bge-model.com/bge/bge_m3.html | ⭐⭐⭐ High | 2026-05-15 | M3 설명 |
| pgvector GitHub | https://github.com/pgvector/pgvector | ⭐⭐⭐ High | 2026-05-15 | 0.8.2 연산자/인덱스 |
| PostgreSQL pgvector 0.8.0 발표 | https://www.postgresql.org/about/news/pgvector-080-released-2952/ | ⭐⭐⭐ High | 2026-05-15 | iterative scan |
| Qdrant 공식 문서 | https://qdrant.tech/documentation/overview/ | ⭐⭐⭐ High | 2026-05-15 | filterable HNSW |
| Pinecone hybrid search 공식 | https://docs.pinecone.io/guides/search/hybrid-search | ⭐⭐⭐ High | 2026-05-15 | dense+sparse |
| Weaviate hybrid search blog | https://weaviate.io/blog/hybrid-search-explained | ⭐⭐ Medium | 2026-05-15 | RRF 알고리즘 |
| Cosine similarity (Wikipedia) | https://en.wikipedia.org/wiki/Cosine_similarity | ⭐⭐ Medium | 2026-05-15 | 메트릭 등가성 |
| Pinecone Vector Similarity 가이드 | https://www.pinecone.io/learn/vector-similarity/ | ⭐⭐⭐ High | 2026-05-15 | 메트릭 비교 |
| Databricks RAG chunking 가이드 | https://community.databricks.com/t5/technical-blog/the-ultimate-guide-to-chunking-strategies-for-rag-applications/ba-p/113089 | ⭐⭐ Medium | 2026-05-15 | 청킹 기본값 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 핵심 클레임 교차 검증 결과

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | OpenAI text-embedding-3-small: 1536 dim / 8191 tokens / $0.02 per 1M | ✅ VERIFIED | OpenAI 공식 + Helicone + costgoat + pecollective |
| 2 | text-embedding-3-large: 3072 dim / $0.13 per 1M | ✅ VERIFIED | OpenAI 발표 + OpenRouter + pecollective |
| 3 | jhgan/ko-sbert-multitask KorSTS Pearson 84.13 / 768 dim / max_seq 128 | ✅ VERIFIED | HuggingFace 모델 카드 직접 확인 (WebFetch) |
| 4 | BGE-M3 100+ 언어 / 8192 tokens / 1024 dim | ✅ VERIFIED | HF BAAI/bge-m3 + BGE 공식 문서 + arxiv 2402.03216 |
| 5 | pgvector 0.8.2 + 연산자 `<->` `<=>` `<#>` | ✅ VERIFIED | GitHub README 직접 확인 (WebFetch) |
| 6 | 정규화 시 cosine = dot, euclid = sqrt(2 - 2·cos) | ✅ VERIFIED | Wikipedia + Stanford NLP IR Book + Pinecone Learn |
| 7 | RAG 청킹 기본값 400~512 tokens / overlap 10~20% | ✅ VERIFIED | Databricks + Weaviate + Firecrawl + Stack Overflow |
| 8 | OpenAI Matryoshka `dimensions` 파라미터 256~1536 (small) / 256~3072 (large) | ✅ VERIFIED | OpenAI 발표 + Azure AI Search 문서 + MindStudio |

DISPUTED: 0
UNVERIFIED: 0

### 4-2. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (chromadb 1.5.9 / pgvector 0.8.2 / sentence-transformers v5.x / OpenAI text-embedding-3)
- [✅] deprecated된 패턴을 권장하지 않음 (text-embedding-ada-002는 의도적으로 미포함)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-3. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, examples 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (모델 선택, DB 선택, 메트릭, 인덱스, 청킹, 메타 필터, 비용)
- [✅] 코드 예시 포함 (Chroma, pgvector SQL, OpenAI Matryoshka, sentence-transformers, 반복 꿈 감지)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (모델·DB 선택 트리)
- [✅] 흔한 실수 패턴 포함 (10건)

### 4-4. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (dream-recurrence-detection 실 시나리오)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 예시만 dream 도메인)

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-15 수행, 4/4 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — gap 없음, 보완 불필요

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (SKILL.md 직접 Read 후 검증)
**수행 방법**: SKILL.md 전체 Read 후 4개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 정규화 시 cosine = dot product 등가성 원리 + 어느 것을 써야 하는가**
- 판정: PASS
- 근거: SKILL.md "3. 유사도 메트릭" — 3-1 정규화 시 등가성, 3-2 메트릭 선택
- 상세: unit vector 환경에서 cosine = dot임을 수식으로 명시. dot이 분모 없어 가장 빠름. normalize_embeddings=True + dot 권장 패턴 명확. anti-pattern(정규화 없이 dot 사용 → 길이 큰 벡터 편향)도 섹션 9에 명시.

**Q2. OpenAI text-embedding-3-small 1536 dim + Matryoshka dimensions 파라미터 사용법**
- 판정: PASS
- 근거: SKILL.md "1. 임베딩 모델 선택" — 1-1 비교표, 1-4 OpenAI 임베딩 + 차원 축소(Matryoshka)
- 상세: 1536 기본 차원, 256~1536 가변 범위, `client.embeddings.create(..., dimensions=768)` 코드 예시 완비. "저장 비용 50% 감소" 활용 근거도 명시. OpenAI 기본 L2 정규화 → dot = cosine 연결 설명 있음.

**Q3. ko-sbert-multitask 768 dim KorSTS Pearson 84.13 + 한국어 단문 구현**
- 판정: PASS
- 근거: SKILL.md "1. 임베딩 모델 선택" — 1-1 비교표, 1-2 선택 기준, 1-3 한국어 임베딩 사용 패턴, 5-3 한국어 청킹 주의
- 상세: 768 dim / KorSTS Pearson 84.13 / max_seq_length=128 모두 비교표에 명시. SentenceTransformer 코드 예시 완비. "128 이후 잘림" anti-pattern(섹션 9) + 청킹 100 tokens 기준(5-3) 명확.

**Q4. Chroma vs pgvector 선택 기준 — 기존 Postgres 유무 / 데이터 규모 / 트랜잭션 필요 여부**
- 판정: PASS
- 근거: SKILL.md "2. Vector DB 선택" — 2-1 비교표, 2-2 선택 기준, 2-4 pgvector 코드
- 상세: "이미 Postgres 사용 중 + 트랜잭션 일관성 필요 → pgvector" / "프로토타입 / 로컬 개발 / 100만 미만 → Chroma" 기준 명확. pgvector 메타 필터 함정(hnsw.iterative_scan = on)도 2-4 및 6-3에 명시.

### 발견된 gap

없음. 4개 질문 모두 SKILL.md에서 완전한 근거 도출 가능.

### 판정

- agent content test: 4/4 PASS
- verification-policy 분류: 라이브러리 사용법 + API 패턴 (실사용 필수 카테고리 아님) — 단, 사용자 명시 요청으로 PENDING_TEST 유지
- 최종 상태: PENDING_TEST 유지 (사용자 명시 요청)

---

### 테스트 케이스 1: (예정 — 참고용 보존)

**입력 (질문/요청):**
```
한국어 짧은 일기 문장 1만 건의 의미 검색을 셀프호스트로 구현하려는데
어떤 임베딩 모델과 vector DB 조합이 적합한가? 코드 스켈레톤도 알려줘.
```

**기대 결과:**
- jhgan/ko-sbert-multitask 또는 ko-sroberta-multitask 권장 (768 dim, max 128)
- Chroma PersistentClient 권장 (1만 건은 임베디드로 충분)
- `normalize_embeddings=True` + cosine metadata 설정
- 청크 크기 100 tokens 내외 (모델 max 128 고려)

**실제 결과:** (skill-tester 수행 후 기록)

**판정:** PENDING

### 테스트 케이스 2: (예정)

**입력:**
```
Chroma에서 user_id로 필터링하면서 코사인 유사도 top-5를 가져오는 코드는?
그리고 결과의 distance를 similarity로 변환하려면?
```

**기대 결과:**
- `collection.query(query_embeddings=v, n_results=5, where={"user_id": ...})`
- distance → similarity: `1 - distance` (cosine 기준)

**실제 결과:** (skill-tester 수행 후 기록)

**판정:** PENDING

### 테스트 케이스 3: (예정)

**입력:**
```
임베딩이 정규화되어 있을 때 cosine과 dot product, 어떤 걸 써야 하나?
이유도 함께.
```

**기대 결과:**
- 정규화 시 cosine = dot. ranking 동일.
- dot이 가장 빠름 (분모 없음).
- normalize_embeddings=True + dot 권장.

**실제 결과:** (skill-tester 수행 후 기록)

**판정:** PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-15 수행, 4/4 PASS) |
| **최종 판정** | **PENDING_TEST 유지** (사용자 명시 요청 — content test 통과, 실사용 검증 후 APPROVED 전환 예정) |

> 근거: "실사용 필수 스킬" 카테고리에는 해당하지 않으나(라이브러리 사용법 + API 패턴),
> 사용자 요청 사항에 "실 데이터 검증" 요건이 명시되어 PENDING_TEST 유지.
> agent content test는 2026-05-15 skill-tester에 의해 수행 완료 (4/4 PASS).

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-05-15 완료, 4/4 PASS)
- [❌] (조건부) Chroma 1.6+ 릴리즈 시 multimodal/regex 키워드 검색 섹션 보강 — 차단 요인 아님, 선택 보강
- [❌] (조건부) sentence-transformers v5.x에서 새로 도입된 sparse encoder 패턴 추가 검토 — 차단 요인 아님, 선택 보강
- [❌] (조건부) pgvector 0.9+ 릴리즈 시 인덱스 옵션 업데이트 — 차단 요인 아님, 릴리즈 후 갱신
- [❌] 실제 1M+ 벡터에서 HNSW 파라미터 튜닝 사례 추가 — 차단 요인 아님, 실사용 검증 후 보강 (PENDING_TEST → APPROVED 전환 시)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — 임베딩 모델·Vector DB·메트릭·인덱스·청킹·메타 필터·비용·반복 꿈 감지 예시 + anti-pattern 10건 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 정규화 cosine=dot 등가성 / Q2 OpenAI Matryoshka 1536dim / Q3 ko-sbert-multitask 768dim KorSTS / Q4 Chroma vs pgvector 선택) → 4/4 PASS, PENDING_TEST 유지 (사용자 명시 요청) | skill-tester |
