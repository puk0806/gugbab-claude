---
name: python-llamaindex
description: >
  Python LlamaIndex 기반 RAG(Retrieval-Augmented Generation) 시스템 설계·구현 스킬.
  Document·Node·Index·Query Engine 핵심 추상화, 벡터 DB 통합, 고급 검색(re-ranking·hybrid),
  AgentWorkflow, LlamaParse 문서 파싱을 다룬다. LangChain과의 분업 기준도 포함한다.
  <example>사용자: "한국 전통 해몽 사전을 RAG로 만들고 싶다. LlamaIndex로 어떻게 구성?"</example>
  <example>사용자: "LlamaIndex vs LangChain — RAG 전용으로는 어느 쪽이 낫나?"</example>
  <example>사용자: "chunk_size 1024가 default인데 한국어 문서에는 어떻게 조정?"</example>
---

# LlamaIndex — Python RAG 전문 프레임워크

> 소스: https://docs.llamaindex.ai/ (→ https://developers.llamaindex.ai/ 로 리다이렉트)
> 추가 소스:
> - GitHub: https://github.com/run-llama/llama_index
> - PyPI: https://pypi.org/project/llama-index/
> - LlamaParse: https://www.llamaindex.ai/llamaparse
>
> 검증일: 2026-05-15
> 검증 버전: llama-index **0.14.22** (2026-05-14 PyPI 릴리즈)
> 권장 버전: 0.14.x 이상 (이 스킬은 0.14 기준. 0.11~0.13에서는 일부 API 다름)

---

## 0. 짝 스킬과의 분업

| 스킬 | 역할 |
|------|------|
| **backend/python-llamaindex** (이 스킬) | RAG 전문 — Index 추상화·Query Engine·AgentWorkflow |
| `backend/python-langchain-current` | 범용 LLM 오케스트레이션 — Agent·Tool·체이닝 |
| `backend/python-embeddings-vector-db` | 임베딩·벡터 DB 저수준 — 모델 선택·인덱스 튜닝 원리 |
| `humanities/korean-dream-interpretation-tradition` | 한국 전통 해몽 사전 콘텐츠 소스 (이 스킬 §10 예시의 원본) |

**선택 기준 — LlamaIndex vs LangChain:**
- *RAG 품질·검색 정확도 우선* → LlamaIndex
- *복잡한 Agent·다양한 외부 도구 체이닝* → LangChain (LangGraph)
- *둘 다 필요* → LlamaIndex(retrieval) + LangGraph(orchestration) 조합이 2026 시점 production 표준 패턴

---

## 1. LlamaIndex 핵심 개념

### 1.1 5대 추상화

```
Reader → Document → Node → Index → Retriever → QueryEngine → Response
                                 ↓
                              VectorStore (외부 DB)
```

| 추상화 | 설명 |
|--------|------|
| **Document** | 원본 데이터 한 단위 (PDF·API 응답·DB row 등). `text` + `metadata` 보유 |
| **Node** | Document의 청크. 인덱싱·검색의 최소 단위. 부모 Document의 metadata 상속 |
| **Index** | Node들을 검색 가능한 구조로 정리한 자료구조 (Vector·Summary·Tree 등) |
| **Retriever** | Query에 대해 관련 Node 반환 (top-k 등) |
| **QueryEngine** | Retriever + Response Synthesizer 결합. 자연어 질문 → 자연어 응답 |

### 1.2 최소 예제 — 5줄 RAG

```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
response = query_engine.query("문서의 핵심 주제는?")
print(response)
```

> 기본값: chunk_size=1024, chunk_overlap=20, embed_model=OpenAIEmbedding(text-embedding-ada-002), llm=OpenAI(gpt-3.5-turbo). 모두 `Settings`로 변경 가능 (§3).

---

## 2. Document & Node 다루기

### 2.1 Document 생성

```python
from llama_index.core import Document

doc = Document(
    text="아리스토텔레스의 akrasia 개념은...",
    metadata={"source": "ethics.pdf", "page": 12, "topic": "ethics"},
)
```

### 2.2 Node 변환 — SentenceSplitter

```python
from llama_index.core.node_parser import SentenceSplitter

splitter = SentenceSplitter(chunk_size=512, chunk_overlap=64)
nodes = splitter.get_nodes_from_documents([doc])
```

> 주의: `SimpleNodeParser`도 동일 역할이지만 *최신 권장은 `SentenceSplitter`*. SimpleNodeParser는 호환성 유지용.

### 2.3 metadata 검색 필터에 활용

```python
from llama_index.core.vector_stores import MetadataFilters, MetadataFilter

filters = MetadataFilters(filters=[
    MetadataFilter(key="topic", value="ethics"),
])
retriever = index.as_retriever(similarity_top_k=5, filters=filters)
```

---

## 3. Settings — 전역 LLM·임베딩·청크 설정

```python
from llama_index.core import Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.node_parser import SentenceSplitter

Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0.1)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
Settings.transformations = [SentenceSplitter(chunk_size=1024, chunk_overlap=20)]
```

> 이전 `ServiceContext` API는 **deprecated**. 0.14에서는 `Settings` 싱글톤이 표준.

---

## 4. Index 종류 — 언제 무엇을 쓰나

| Index | 구조 | 적합한 경우 | LLM 비용 |
|-------|------|------------|---------|
| **VectorStoreIndex** | Node + 임베딩 → 벡터 저장 | 의미 기반 검색 (대부분의 RAG) | 낮음 |
| **SummaryIndex** | 순차 리스트 | 전체 문서를 항상 봐야 하는 작은 코퍼스, 요약 | 높음 (모든 Node 사용) |
| **TreeIndex** | 계층 트리 (하위→상위 요약) | 긴 문서 계층적 탐색·요약 | 중간 |
| **KeywordTableIndex** | 키워드 → Node 매핑 | 키워드 기반 검색 (희귀 토큰) | 중간 |
| **PropertyGraphIndex** | 지식 그래프 | 엔티티 관계 추론 | 높음 |

### 4.1 VectorStoreIndex (기본)

```python
from llama_index.core import VectorStoreIndex
index = VectorStoreIndex(nodes)  # 또는 .from_documents(documents)
```

기본 in-memory. production은 외부 vector store 연결 (§6).

### 4.2 SummaryIndex (전체 스캔)

```python
from llama_index.core import SummaryIndex
index = SummaryIndex(nodes)
# query 시 모든 Node를 LLM에 전달 → 비용 ↑, 누락 ↓
```

### 4.3 TreeIndex (계층 요약)

```python
from llama_index.core import TreeIndex
index = TreeIndex(nodes, num_children=10)  # 자식 10개씩 묶어 요약 노드 생성
```

---

## 5. 임베딩 모델

### 5.1 OpenAI

```python
from llama_index.embeddings.openai import OpenAIEmbedding

Settings.embed_model = OpenAIEmbedding(
    model="text-embedding-3-small",   # 1536 차원, 비용 낮음
    # 또는 "text-embedding-3-large" — 3072 차원, 정확도↑
)
```

### 5.2 HuggingFace (로컬·오픈소스)

```python
# pip install llama-index-embeddings-huggingface
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

# 다국어·한국어 권장: BAAI/bge-m3 (100+ 언어, 8192 토큰)
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-m3")

# 한국어 특화 대안
# HuggingFaceEmbedding(model_name="jhgan/ko-sroberta-multitask")
# HuggingFaceEmbedding(model_name="nlpai-lab/KURE-v1")  # 고려대 NLP 랩
```

### 5.3 Anthropic 임베딩에 관한 주의

> **주의:** Anthropic은 **임베딩 모델을 제공하지 않는다.** Claude(LLM)만 제공.
> LlamaIndex에서 `Settings.llm = Anthropic(...)` 으로 LLM은 쓸 수 있지만, embedding은 OpenAI·HuggingFace·Cohere 등으로 별도 구성해야 한다.

```python
from llama_index.llms.anthropic import Anthropic
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

Settings.llm = Anthropic(model="claude-sonnet-4-5")   # 응답 생성
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-m3")  # 검색
```

---

## 6. 벡터 DB 통합

LlamaIndex는 **20+ vector store**를 공식 지원한다. 주요 5종:

| Vector Store | 패키지 | 적합한 경우 |
|--------------|--------|------------|
| **Chroma** | `llama-index-vector-stores-chroma` | 로컬·prototype·자체 호스팅 |
| **pgvector** | `llama-index-vector-stores-postgres` | 기존 Postgres 운용 중 (Spring·Java 환경 포함) |
| **Qdrant** | `llama-index-vector-stores-qdrant` | 고성능·hybrid search·payload 필터 강함 |
| **Pinecone** | `llama-index-vector-stores-pinecone` | 매니지드·serverless |
| **Weaviate** | `llama-index-vector-stores-weaviate` | 매니지드·하이브리드 검색 강함 |

### 6.1 Chroma 예시 (로컬)

```python
import chromadb
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import VectorStoreIndex, StorageContext

client = chromadb.PersistentClient(path="./chroma_db")
chroma_collection = client.get_or_create_collection("dreams")

vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

index = VectorStoreIndex.from_documents(
    documents, storage_context=storage_context,
)
```

### 6.2 pgvector 예시 (Postgres)

```python
from llama_index.vector_stores.postgres import PGVectorStore

vector_store = PGVectorStore.from_params(
    database="rag_db",
    host="localhost", port=5432,
    user="postgres", password="...",
    table_name="documents",
    embed_dim=1024,  # bge-m3
)
```

---

## 7. 검색·응답 — Retriever & ResponseSynthesizer

### 7.1 기본 retriever

```python
retriever = index.as_retriever(similarity_top_k=5)
nodes = retriever.retrieve("akrasia의 정의는?")
```

> `similarity_top_k`는 벡터 store에서 가져올 후보 Node 수. 정답이 누락되면 *top_k를 늘리고 reranker로 정밀화*하는 것이 권장 패턴.

### 7.2 QueryEngine 직접 구성

```python
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.response_synthesizers import get_response_synthesizer

query_engine = RetrieverQueryEngine(
    retriever=retriever,
    response_synthesizer=get_response_synthesizer(response_mode="compact"),
)
```

**response_mode 종류:**
| mode | 동작 |
|------|------|
| `refine` | Node를 하나씩 보며 점진적 정제 (정확도↑, 비용↑) |
| `compact` (기본) | Node를 prompt context에 가능한 만큼 채워 한 번에 처리 |
| `tree_summarize` | 트리 구조로 요약 (긴 답변) |
| `simple_summarize` | 단일 LLM 호출, 잘리면 잘림 |

### 7.3 Hybrid Search (BM25 + Dense) — Reciprocal Rerank Fusion

```python
from llama_index.retrievers.bm25 import BM25Retriever
from llama_index.core.retrievers import QueryFusionRetriever

vector_retriever = index.as_retriever(similarity_top_k=10)
bm25_retriever = BM25Retriever.from_defaults(nodes=nodes, similarity_top_k=10)

hybrid = QueryFusionRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    similarity_top_k=10,
    num_queries=1,           # query rewriting 안 함
    mode="reciprocal_rerank",
    use_async=True,
)
```

> 한국어처럼 동음이의·고유명사가 많은 도메인은 *BM25 추가가 retrieval recall을 크게 끌어올린다*.

### 7.4 Reranker (Cohere·sentence-transformers)

```python
# pip install llama-index-postprocessor-cohere-rerank
from llama_index.postprocessor.cohere_rerank import CohereRerank

reranker = CohereRerank(top_n=3, model="rerank-multilingual-v3.0")

query_engine = RetrieverQueryEngine.from_args(
    retriever=hybrid,
    node_postprocessors=[reranker],
)
```

권장 흐름: **top_k 크게(20) → reranker로 top_n 작게(3~5) → LLM 생성**.

---

## 8. AgentWorkflow — 0.14 시점 권장 Agent 패턴

### 8.1 FunctionAgent (function calling LLM용)

```python
from llama_index.core.agent.workflow import FunctionAgent
from llama_index.llms.openai import OpenAI
from llama_index.core.tools import FunctionTool

def search_dreams(query: str) -> str:
    """한국 전통 해몽 사전에서 query와 유사한 항목 검색."""
    return str(query_engine.query(query))

agent = FunctionAgent(
    tools=[FunctionTool.from_defaults(fn=search_dreams)],
    llm=OpenAI(model="gpt-4o-mini"),
    system_prompt="당신은 한국 전통 해몽 전문가다.",
)

response = await agent.run("어젯밤 뱀 꿈을 꿨는데 무슨 의미인가?")
```

### 8.2 ReActAgent — function calling 미지원 LLM용

```python
from llama_index.core.agent.workflow import ReActAgent

agent = ReActAgent(tools=[...], llm=...)  # 임의 LLM 가능
```

### 8.3 deprecated 클래스 주의

> **주의:** 다음은 모두 **deprecated** (LlamaIndex 0.14 deprecated_terms 목록):
> - `FunctionCallingAgent` → `FunctionAgent` + `AgentWorkflow`
> - `FunctionCallingAgentWorker` → 동일
> - `AgentRunner` / `AgentWorker` → `AgentWorkflow`
> - `ReActAgentWorker` → workflow 버전 `ReActAgent` 사용
>
> 구버전 코드 마이그레이션 시 `llama_index.core.agent.workflow` 경로의 클래스만 사용한다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
