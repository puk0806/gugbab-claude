---
name: python-embeddings-vector-db
description: >
  Python 임베딩 + Vector DB 인프라 — 의미 검색·유사도·RAG. OpenAI/Cohere/BGE/ko-sbert
  임베딩 모델 비교, Chroma·Pinecone·Qdrant·pgvector·Weaviate·Milvus 선택 기준,
  코사인/내적/유클리드 등가성, HNSW/IVF 인덱스, 청킹·메타 필터·하이브리드 검색 패턴.
  <example>사용자: "한국어 문장 1만 건을 의미 검색하려면 어떤 임베딩 모델이 좋아?"</example>
  <example>사용자: "Chroma에서 메타데이터로 필터링하면서 유사도 검색하는 코드"</example>
  <example>사용자: "꿈 텍스트 임베딩으로 반복되는 꿈 자동 감지하려면 어떻게 설계해?"</example>
---

# Python Embeddings + Vector DB

> 소스:
> - OpenAI Embeddings: https://developers.openai.com/api/docs/guides/embeddings
> - Chroma Docs: https://docs.trychroma.com/
> - sentence-transformers: https://sbert.net/
> - jhgan/ko-sbert-multitask: https://huggingface.co/jhgan/ko-sbert-multitask
> - pgvector: https://github.com/pgvector/pgvector
> - Qdrant: https://qdrant.tech/documentation/
> - BGE-M3: https://huggingface.co/BAAI/bge-m3
>
> 검증일: 2026-05-15
> 기준 버전: chromadb 1.5.9 / pgvector 0.8.2 / sentence-transformers v5.x / OpenAI text-embedding-3 / Python 3.11+

---

## 1. 임베딩 모델 선택

### 1-1. 주요 모델 비교

| 모델 | 차원 | 컨텍스트 | 비용 / 라이선스 | 강점 |
|------|------|----------|----------------|------|
| OpenAI `text-embedding-3-small` | 1536 (가변 256~1536) | 8191 tokens | $0.02 / 1M tokens | 가성비, 다국어 OK |
| OpenAI `text-embedding-3-large` | 3072 (가변 256~3072) | 8191 tokens | $0.13 / 1M tokens | MTEB 상위, RAG 권장 |
| `BAAI/bge-m3` | 1024 | 8192 tokens | Apache 2.0 (셀프호스트) | 100+ 언어, dense+sparse+ColBERT 통합 |
| `jhgan/ko-sbert-multitask` | 768 | 128 tokens | Apache 2.0 (셀프호스트) | **한국어 KorSTS Pearson 84.13** |
| `jhgan/ko-sroberta-multitask` | 768 | 128 tokens | Apache 2.0 (셀프호스트) | 한국어 KorSTS 84.83 (RoBERTa 기반) |
| Cohere `embed-multilingual-v3.0` | 1024 | 512 tokens | $0.10 / 1M tokens | 다국어 retrieval 특화 |

### 1-2. 선택 기준

```
한국어 단문(< 128 tokens) + 셀프호스트 + 비용 0 → ko-sbert-multitask / ko-sroberta-multitask
다국어 장문(긴 문서) + 셀프호스트                → bge-m3 (8192 tokens)
관리형 SaaS + 빠른 시작 + 비용 OK                → OpenAI text-embedding-3-small
최고 품질 + 비용 OK                              → OpenAI text-embedding-3-large
```

> **주의:** ko-sbert/ko-sroberta는 `max_seq_length=128`이라 긴 문서를 통째로 넣으면 잘림.
> 긴 한국어 문서는 청크 단위(< 128 tokens)로 자르거나 bge-m3를 사용한다.

### 1-3. 한국어 임베딩 사용 패턴 (sentence-transformers)

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('jhgan/ko-sbert-multitask')

sentences = [
    "오늘 하늘을 나는 꿈을 꿨다",
    "어제 추락하는 악몽을 꾸었다",
    "비행기를 타고 여행 가는 꿈을 봤다",
]

# normalize_embeddings=True 권장 — unit vector로 만들면 dot product = cosine similarity
embeddings = model.encode(sentences, normalize_embeddings=True)

print(embeddings.shape)  # (3, 768)
```

### 1-4. OpenAI 임베딩 + 차원 축소(Matryoshka)

```python
from openai import OpenAI

client = OpenAI()

# 기본 1536 → 768로 축소 저장 가능 (저장 비용 50% 감소)
response = client.embeddings.create(
    model="text-embedding-3-small",
    input=["오늘 하늘을 나는 꿈"],
    dimensions=768,  # 256~1536 사이 임의 지정 가능
)

vector = response.data[0].embedding  # length 768
```

> OpenAI 임베딩은 기본적으로 L2 정규화되어 반환되므로 dot product = cosine similarity.

---

## 2. Vector DB 선택

### 2-1. 비교표

| DB | 배포 | 언어 | 메타 필터 | 하이브리드 | 적합 시나리오 |
|----|------|------|----------|-----------|--------------|
| **Chroma** | 임베디드/서버 | Python 우선 | `where` JSON | dense/sparse (1.5+) | 프로토타입, 로컬 RAG, 100만 미만 |
| **Pinecone** | SaaS (관리형) | 다국어 | 메타 필터 | dense+sparse hybrid | 프로덕션, 운영 부담 최소화 |
| **Qdrant** | 셀프/Cloud | Rust 코어 | filterable HNSW | dense+sparse | 메타 필터 빈도 높음, 비용 효율 |
| **pgvector** | Postgres 확장 | SQL | SQL `WHERE` | dense + 전문검색 | 기존 Postgres 활용, 트랜잭션 필요 |
| **Weaviate** | 셀프/Cloud | GraphQL/REST | where filter | dense+BM25 native | 임베딩 자동 생성 모듈 활용 |
| **Milvus** | 셀프/Zilliz Cloud | 다국어 | 메타 필터 | dense+sparse | 1억+ 대규모, GPU 가속 |

### 2-2. 선택 기준

```
프로토타입 / 로컬 개발 / 데이터 100만 미만        → Chroma (PersistentClient)
이미 Postgres 사용 중 + 트랜잭션 일관성 필요      → pgvector
운영 인력 부족 + 비용 OK                          → Pinecone (서버리스)
메타 필터 사용 빈번 + 셀프호스트                  → Qdrant
1억+ 벡터 + GPU 활용                              → Milvus
```

### 2-3. Chroma 기본 사용 (PersistentClient)

```python
import chromadb
from sentence_transformers import SentenceTransformer

# 1. 디스크 영속 클라이언트
client = chromadb.PersistentClient(path="./chroma_db")

# 2. 컬렉션 생성/획득 (cosine 기본은 squared L2 → 정규화 벡터면 거의 무관, 명시 권장)
collection = client.get_or_create_collection(
    name="dreams",
    metadata={"hnsw:space": "cosine"},
)

# 3. 임베딩 + 추가
model = SentenceTransformer('jhgan/ko-sbert-multitask')
docs = [
    "오늘 하늘을 나는 꿈을 꿨다",
    "어제 추락하는 악몽을 꾸었다",
]
embeddings = model.encode(docs, normalize_embeddings=True).tolist()

collection.add(
    ids=["dream_001", "dream_002"],
    embeddings=embeddings,
    documents=docs,
    metadatas=[
        {"user_id": "user_1", "date": "2026-05-14", "tag": "flying"},
        {"user_id": "user_1", "date": "2026-05-15", "tag": "nightmare"},
    ],
)

# 4. 유사도 검색 + 메타 필터
query_vec = model.encode(["나는 꿈"], normalize_embeddings=True).tolist()
results = collection.query(
    query_embeddings=query_vec,
    n_results=5,
    where={"user_id": "user_1"},          # 메타 필터
    where_document={"$contains": "꿈"},    # 문서 텍스트 필터
)
```

### 2-4. pgvector — HNSW 인덱스 + 코사인 검색

```sql
-- 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 테이블 정의
CREATE TABLE dreams (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768)
);

-- HNSW 인덱스 (cosine distance)
CREATE INDEX ON dreams USING hnsw (embedding vector_cosine_ops);

-- 코사인 거리 기반 유사도 top-5 (정규화 벡터에서는 dot/cosine 등가)
SELECT id, content, 1 - (embedding <=> $1) AS similarity
FROM dreams
WHERE user_id = $2
ORDER BY embedding <=> $1
LIMIT 5;
```

| 연산자 | 의미 | 인덱스 ops |
|--------|------|-----------|
| `<->` | 유클리드 L2 거리 | `vector_l2_ops` |
| `<=>` | 코사인 거리 | `vector_cosine_ops` |
| `<#>` | 음의 내적 (negative inner product) | `vector_ip_ops` |

> **주의(pgvector 0.8+):** 메타 필터 + 인덱스 조합 시 `WHERE`가 너무 많이 거르면 결과 누락 가능. `hnsw.iterative_scan = on` 옵션으로 완화.

---

## 3. 유사도 메트릭

### 3-1. 정규화 시 등가성

```
unit vector (||v|| = 1) 환경에서는:

  cosine_similarity(a, b) = dot(a, b)
  euclidean_distance(a, b) = sqrt(2 - 2 * cosine_similarity(a, b))

→ 순위(ranking) 기준으로는 모두 동일. 계산 비용만 다름.
→ dot product가 가장 빠름 (분모 계산 없음).
```

### 3-2. 메트릭 선택

| 상황 | 권장 메트릭 |
|------|------------|
| 임베딩이 정규화되어 있다 (OpenAI, sentence-transformers `normalize_embeddings=True`) | dot product (가장 빠름) |
| 임베딩 크기 자체가 신호 (예: TF-IDF) | dot product (정규화하지 말 것) |
| 모르겠다 / 호환성 | cosine — 항상 안전한 기본값 |

> **권장:** 임베딩을 *항상* `normalize_embeddings=True`로 만들고 dot product를 쓰면 단순·빠름.

---

## 4. 인덱스 (ANN)

### 4-1. HNSW vs IVF vs Flat

| 인덱스 | 빌드 속도 | 쿼리 속도 | 메모리 | 정확도(recall) | 동적 삽입 |
|--------|----------|----------|--------|---------------|----------|
| Flat (brute force) | 즉시 | O(N) 느림 | 낮음 | 100% | OK |
| IVFFlat | 빠름 | 보통 | 낮음 | 95-99% | 재학습 필요 |
| HNSW | 느림 | 빠름 | 높음 | 95-99% | OK (학습 불필요) |

### 4-2. 데이터 규모별 권장

```
< 10K        → Flat (인덱스 불필요, 그냥 brute force)
10K ~ 10M    → HNSW (대부분의 프로덕션 RAG 기본값)
10M+         → IVF + PQ (메모리 압축) 또는 HNSW + 샤딩
```

### 4-3. HNSW 파라미터

| 파라미터 | 의미 | 기본 | 튜닝 방향 |
|----------|------|------|----------|
| `M` | 노드당 연결 수 | 16 | ↑하면 정확도↑, 메모리↑ |
| `ef_construction` | 빌드 시 후보군 | 200 | ↑하면 빌드 느림, 정확도↑ |
| `ef_search` | 쿼리 시 후보군 | 40~100 | ↑하면 쿼리 느림, recall↑ |

```sql
-- pgvector 예시
CREATE INDEX ON dreams USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 200);

SET hnsw.ef_search = 100;  -- 세션별 조정
```

---

## 5. 청킹 전략

### 5-1. 전략별 특성

| 전략 | 설명 | 장단점 |
|------|------|--------|
| Fixed-size | 토큰 N개 단위 분할 | 단순·빠름 / 문장 중간 자름 |
| Sliding window + overlap | N 토큰 + M 토큰 겹침 | 문맥 보존 / 인덱스 크기↑ |
| Semantic chunking | 임베딩 유사도로 경계 결정 | 의미 보존 / 전처리 비용↑ |
| Recursive (chars → sentences → tokens) | LangChain `RecursiveCharacterTextSplitter` | 균형 잡힘 / 권장 기본값 |

### 5-2. 권장 시작값 (RAG)

```
chunk_size  = 400 ~ 512 tokens
overlap     = 50 ~ 100 tokens (10~20%)
strategy    = recursive character splitting
```

> 청크가 너무 크면 — 의미 희석, retrieval 정확도 하락.
> 청크가 너무 작으면 — 문맥 부족, LLM이 답하기 어려움.

### 5-3. 한국어 청킹 주의

```
ko-sbert/ko-sroberta는 max_seq_length=128 → 청크를 토큰 기준 100 내외로 잡아야 안전.
긴 한국어 문서 + 1024+ 토큰 청크 필요 → bge-m3 (8192 지원) 또는 OpenAI(8191) 선택.
```

---

## 6. 메타데이터 필터링 + 하이브리드 검색

### 6-1. Chroma `where` 절

```python
# 단일 조건
collection.query(query_embeddings=[v], where={"user_id": "user_1"}, n_results=5)

# 복합 조건 (AND)
collection.query(
    query_embeddings=[v],
    where={
        "$and": [
            {"user_id": "user_1"},
            {"date": {"$gte": "2026-05-01"}},
        ]
    },
    n_results=5,
)

# OR / IN
where={"$or": [{"tag": "flying"}, {"tag": "falling"}]}
where={"tag": {"$in": ["flying", "falling"]}}
```

### 6-2. 하이브리드 검색 (dense + sparse + RRF)

```
1. 사용자 쿼리 → 임베딩(dense) + BM25(sparse) 동시 검색
2. 각 top-K 결과를 Reciprocal Rank Fusion으로 병합
   score(d) = Σ 1 / (k + rank_i(d))   (k=60 관행)
3. 통합 순위로 상위 N 반환
```

| 단독 사용 시 한계 | 하이브리드의 이점 |
|------------------|------------------|
| dense: 정확한 키워드(고유명사·코드) 약함 | 사용자가 정확한 단어를 알면 dense+sparse 동시 매칭 |
| sparse(BM25): 동의어·문맥 약함 | dense가 의미적 동의어 보강 |

실제 측정값: dense+sparse 결합 시 단독 대비 recall 15~30% 향상 (Weaviate 등 사례).

### 6-3. 메타 필터 누락 함정

> **주의:** "왜 결과가 비어있지?"의 90%는 메타 필터 오타·타입 불일치.
> - 숫자를 문자열로 저장하고 숫자로 필터 → 매칭 실패
> - HNSW 인덱스 + 강한 메타 필터 → recall 급락 (pgvector 0.8+ iterative scan, Qdrant filterable HNSW로 완화)

---

## 7. 비용·성능 가이드

### 7-1. 임베딩 API 비용 예측

```
text-embedding-3-small: $0.02 / 1M tokens

100,000개 문서 × 평균 500 tokens = 50M tokens = $1.00
1,000,000개 문서 × 평균 500 tokens = 500M tokens = $10.00

→ 임베딩 비용은 일반적으로 LLM 호출 대비 100~1000배 저렴.
   하지만 청크 단위 변경 시 재임베딩 필요 — 청킹 전략을 먼저 확정할 것.
```

### 7-2. 인덱스 메모리 추정

```
1M 벡터 × 768 dim × 4 bytes (float32) = ~3 GB (raw)
+ HNSW 그래프 오버헤드(M=16 기준) ≈ 1.5~2배 = ~4.5~6 GB

→ 메모리 부족 시: float16/int8 양자화, 차원 축소(Matryoshka 768→256), PQ 압축
```

### 7-3. 쿼리 지연 (대략)

```
1M 벡터 + HNSW + 정규화 dot product (단일 서버):
  - 단일 쿼리: 1~10 ms
  - 메타 필터 + 강한 selectivity: +5~20 ms
  - 하이브리드(dense + sparse + RRF): 2~3배 증가
```

---

## 8. 실전 예시 — 반복 꿈 감지 (dream-recurrence-detection)

```python
"""
사용자가 비슷한 꿈을 반복적으로 꾸는지 자동 감지.
신규 꿈 텍스트가 들어오면 같은 사용자의 과거 꿈과 비교 → 유사도 0.8+ 발견 시 알림.
"""
import chromadb
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('jhgan/ko-sbert-multitask')
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(
    name="dreams",
    metadata={"hnsw:space": "cosine"},
)

SIMILARITY_THRESHOLD = 0.80  # 도메인 튜닝 대상

def add_dream(dream_id: str, user_id: str, text: str, date: str) -> dict:
    # 1. 새 꿈을 정규화 임베딩으로
    new_vec = model.encode([text], normalize_embeddings=True).tolist()

    # 2. 같은 사용자의 과거 꿈 중 가장 유사한 것 5개
    found = collection.query(
        query_embeddings=new_vec,
        n_results=5,
        where={"user_id": user_id},
    )

    # 3. 코사인 유사도 = 1 - distance (Chroma cosine 기준)
    recurrent: list[dict] = []
    if found["ids"] and found["ids"][0]:
        for past_id, dist, past_doc in zip(
            found["ids"][0], found["distances"][0], found["documents"][0]
        ):
            similarity = 1.0 - dist
            if similarity >= SIMILARITY_THRESHOLD:
                recurrent.append(
                    {"id": past_id, "similarity": similarity, "text": past_doc}
                )

    # 4. 새 꿈 저장
    collection.add(
        ids=[dream_id],
        embeddings=new_vec,
        documents=[text],
        metadatas=[{"user_id": user_id, "date": date}],
    )

    return {"is_recurrent": bool(recurrent), "matches": recurrent}


# 사용
result = add_dream(
    dream_id="dream_2026_05_15_01",
    user_id="user_1",
    text="다시 비행기를 놓치고 공항에서 헤매는 꿈",
    date="2026-05-15",
)
if result["is_recurrent"]:
    print(f"반복 꿈 감지! 유사 사례 {len(result['matches'])}건")
```

> 짝 스킬:
> - `backend/python-korean-nlp-konlpy` — 형태소 단위 전처리(불용어·표제어) 필요 시
> - `backend/python-llamaindex` — 다단계 RAG·쿼리 엔진 추상화가 필요할 때
> - `frontend/dream-recurrence-detection` — 위 백엔드에 대응하는 프론트 UI

---

## 9. 흔한 함정 (Anti-patterns)

| 함정 | 결과 | 해결 |
|------|------|------|
| 모델 A로 인덱스 만들고 모델 B로 쿼리 | 무의미한 결과 (다른 벡터 공간) | 컬렉션 메타에 모델명·차원 기록, 모델 변경 시 전체 재임베딩 |
| 차원 다른 벡터 같은 컬렉션에 혼합 | 에러 또는 실패 | 컬렉션별 단일 차원 강제, 다중 모델은 컬렉션 분리 |
| 청크가 너무 큼 (2000+ tokens) | 의미 희석, retrieval 정확도↓ | 400~512 tokens + overlap 50~100 |
| 청크가 너무 작음 (50 tokens) | 문맥 부족, LLM이 답 못함 | 문장+α 단위 유지, 의미 단위 분할 |
| 메타 필터 타입 불일치 (`"2026"` vs `2026`) | 결과 0건 | 인덱싱·쿼리 모두 동일 타입으로 통일 |
| ko-sbert에 1024 tokens 통째로 넣기 | 128 이후 잘림 | 청킹 후 임베딩, 또는 bge-m3로 교체 |
| 정규화 안 한 벡터에 dot product | 길이 큰 벡터 편향 | `normalize_embeddings=True` 또는 cosine 사용 |
| HNSW 인덱스 + 강한 메타 필터 | recall 급락 | Qdrant filterable HNSW, pgvector 0.8+ iterative scan |
| 임베딩 모델 변경하고 인덱스 그대로 | 점수 의미 달라짐 | 모델 버전 컬렉션 메타에 기록, 변경 시 마이그레이션 |
| 비용 견적 없이 1억 문서 OpenAI 호출 | 청구서 폭탄 | 사전 견적 계산, 한국어 짧은 텍스트면 ko-sbert 무료 |

---

## 10. 체크리스트

스킬 사용 전 확인:

- [ ] 임베딩 모델 선정 근거 (언어·길이·비용·셀프호스트 여부) 명확한가
- [ ] 청크 크기·overlap 결정했는가 (기본 512 / 50~100)
- [ ] 메타데이터 필드 스키마 정의했는가 (타입 일관성)
- [ ] 인덱스 종류 선택했는가 (Flat / HNSW / IVF)
- [ ] 유사도 메트릭 선택했는가 (정규화 + dot 권장)
- [ ] 모델 버전·차원을 컬렉션 메타에 기록했는가
- [ ] 비용·메모리 추정해봤는가
