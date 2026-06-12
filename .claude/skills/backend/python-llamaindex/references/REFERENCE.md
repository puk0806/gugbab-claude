## 9. LlamaParse — 표·차트·130+ 파일 타입 파서

LlamaParse는 LlamaIndex가 제공하는 매니지드 OCR·문서 파싱 서비스다. PDF의 표·차트·다단 레이아웃을 LLM이 활용 가능한 markdown/JSON으로 변환한다.

```python
# pip install llama-cloud-services
from llama_cloud_services import LlamaParse

parser = LlamaParse(
    api_key="llx-...",       # cloud.llamaindex.ai에서 발급
    result_type="markdown",   # 또는 "text", "json"
    language="ko",            # 한국어 우선
)

documents = parser.load_data("dream_dictionary.pdf")
```

**지원 파일 타입:** PDF, DOCX, PPTX, XLSX, HTML, JPEG, PNG, XML, EPUB 등 130+.

**특징:**
- 표 → markdown 표로 정확히 변환
- 차트·이미지 → 자연어 설명 추출
- Cost Optimizer: 단순 페이지는 저가 tier, 복잡 페이지는 premium tier 자동 라우팅

> 비용: pages 단위 과금. 로컬 대안은 `liteparse` (LlamaIndex의 오픈소스 CLI 파서, 2026-03 공개).

---

## 10. 실전 예시 — 한국 전통 해몽 사전 RAG

> 짝 스킬 `humanities/korean-dream-interpretation-tradition`의 사전 데이터를 RAG로 만든다.
> 사용자: "어젯밤 뱀이 나무를 휘감는 꿈을 꿨다" → 사전에서 유사 항목 검색·해석.

```python
from llama_index.core import VectorStoreIndex, Document, Settings, StorageContext
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.anthropic import Anthropic
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb, json

# 1. 임베딩·LLM 설정 — 한국어 특화
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-m3")
Settings.llm = Anthropic(model="claude-sonnet-4-5")
Settings.transformations = [SentenceSplitter(chunk_size=384, chunk_overlap=64)]
# ↑ 사전 항목은 짧으므로 chunk_size를 default(1024)보다 작게

# 2. 해몽 사전 데이터 → Document
with open("dream_dict.json", encoding="utf-8") as f:
    entries = json.load(f)

documents = [
    Document(
        text=f"{e['symbol']}: {e['interpretation']}",
        metadata={
            "symbol": e["symbol"],         # 예: "뱀"
            "category": e["category"],     # 예: "동물"
            "source": e["source"],         # 예: "주공해몽"
        },
    )
    for e in entries
]

# 3. Chroma에 영구 저장
client = chromadb.PersistentClient(path="./dream_db")
collection = client.get_or_create_collection("korean_dreams")
vector_store = ChromaVectorStore(chroma_collection=collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)

# 4. Query
query_engine = index.as_query_engine(
    similarity_top_k=5,
    response_mode="compact",
)
response = query_engine.query("뱀이 나무를 휘감는 꿈을 꿨다. 전통적으로 어떤 의미인가?")
print(response)
print("\n참고 사전 항목:")
for node in response.source_nodes:
    print(f"- [{node.metadata['source']}] {node.metadata['symbol']}: {node.score:.3f}")
```

**핵심 설계 결정:**
- *chunk_size=384*: 사전 항목이 1-3문장으로 짧음. default 1024는 너무 큼.
- *bge-m3 임베딩*: 한국어·한자 혼합 문서에 강함.
- *metadata에 출전 기록*: 답변에 *주공해몽·해몽전서* 등 출처 추적 가능.
- *similarity_top_k=5*: 유사 상징 여러 개 보여주고 LLM이 종합 해석.

---

## 11. 흔한 함정

### 11.1 chunk_size 잘못

> **주의:** chunk_size는 *임베딩 모델의 최대 입력 길이*와 *검색 단위 의미 단위*를 모두 고려해야 한다.
> - text-embedding-3-small/large: 8191 토큰까지 가능하지만 너무 크면 의미가 희석됨
> - 권장: 일반 문서 512~1024, 짧은 사전·FAQ 256~512, 긴 논문·법조문 1024~2048
> - **chunk_size + metadata 길이 > chunk_size 한계** 에러: metadata를 짧게 하거나 chunk_size를 늘린다.

### 11.2 임베딩 모델 미스매치

> **주의:** *인덱싱할 때*와 *검색할 때* 같은 임베딩 모델을 써야 한다.
> Chroma·pgvector에 저장된 벡터는 임베딩 모델이 바뀌면 의미가 달라진다. 모델 변경 시 인덱스를 *재구축*한다.

### 11.3 context length 초과

LLM의 context window를 초과하면 잘림. 대응:
- `response_mode="refine"` 또는 `"tree_summarize"` 사용
- `similarity_top_k`를 줄임
- reranker로 top_n을 줄임

### 11.4 ServiceContext 사용 (구버전)

> 0.14에서 `ServiceContext`는 deprecated. 모든 신규 코드는 `Settings` 싱글톤을 사용한다.

### 11.5 deprecated Agent 클래스 사용

`FunctionCallingAgent`, `AgentRunner`, `ReActAgentWorker` 등은 모두 deprecated. `llama_index.core.agent.workflow`의 `FunctionAgent` / `ReActAgent`만 사용.

### 11.6 한국어 임베딩에 영어 모델 사용

`text-embedding-ada-002`(영어 위주)는 한국어 검색 성능이 떨어진다. 한국어 코퍼스는 `bge-m3` 또는 `text-embedding-3-large`(다국어 강함) 권장.

---

## 12. 비용 관리

### 12.1 비용 구성

| 항목 | 발생 시점 | 절감 방법 |
|------|----------|----------|
| 임베딩 비용 | 인덱싱 1회 + 매 query 1회 | 로컬 HuggingFace 모델로 인덱싱·query 모두 무료화 |
| LLM 응답 비용 | 매 query | gpt-4o-mini·claude-haiku로 응답 모델 다운그레이드 |
| LlamaParse 비용 | 파싱 1회 | 로컬 PDF는 `liteparse` 사용, 표 많은 PDF만 LlamaParse |
| Vector DB 호스팅 | 상시 | 작은 코퍼스는 Chroma 로컬 / Pinecone Free Tier |

### 12.2 절감 패턴

```python
# 1) 임베딩은 무료 로컬, LLM은 유료 API
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-m3")
Settings.llm = OpenAI(model="gpt-4o-mini")

# 2) 캐시 — 동일 query 재호출 방지
from llama_index.core import set_global_handler
set_global_handler("simple")  # 또는 langfuse·arize 등

# 3) 답변 모델은 작게, reranker만 정확하게
reranker = CohereRerank(top_n=3, model="rerank-multilingual-v3.0")  # 저비용 reranker
```

---

## 13. 체크리스트 — 새 RAG 프로젝트 시작 시

- [ ] 코퍼스 크기·문서 길이 측정 → chunk_size 결정
- [ ] 언어 확인 → 한국어/다국어면 bge-m3 또는 다국어 모델
- [ ] LLM 선택 → 응답 길이·정확도·비용 trade-off
- [ ] Vector store 선택 → 로컬 prototype은 Chroma, production은 Qdrant/pgvector
- [ ] metadata 스키마 설계 → 출처·카테고리·날짜 등 필터링 가능하게
- [ ] Hybrid search 필요한가? → 한국어·고유명사 많으면 BM25 추가
- [ ] Reranker 필요한가? → top_k 큰 후보군에서 정밀화 필요하면 추가
- [ ] LlamaParse vs 로컬 파서 → 표·차트 많으면 LlamaParse, 일반 텍스트는 SimpleDirectoryReader
- [ ] Agent vs Query Engine → 단순 Q&A면 QueryEngine, 도구 호출·다단계 추론은 AgentWorkflow

---

## 14. 패키지 설치 참고

```bash
pip install llama-index                                # 코어 (0.14.x)
pip install llama-index-vector-stores-chroma           # Chroma
pip install llama-index-vector-stores-postgres         # pgvector
pip install llama-index-vector-stores-qdrant           # Qdrant
pip install llama-index-embeddings-huggingface         # HuggingFace 임베딩
pip install llama-index-llms-anthropic                 # Claude
pip install llama-index-postprocessor-cohere-rerank    # Cohere Reranker
pip install llama-index-retrievers-bm25                # BM25
pip install llama-cloud-services                       # LlamaParse
```

> 0.10부터 LlamaIndex는 **모듈형 패키지**로 분리되었다. 통합별로 별도 설치 필요.
