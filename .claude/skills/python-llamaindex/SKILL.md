---
name: python-llamaindex
description: >
  LlamaIndex 0.14.x 기준과 함정 — ServiceContext·FunctionCallingAgent·AgentRunner·ReActAgentWorker deprecated(→ Settings·AgentWorkflow), 기본값(chunk 1024/20·ada-002·gpt-3.5) 그대로 쓰지 말 것, Anthropic은 임베딩 없음(Voyage AI 공식 추천), Claude temperature 400(API 2026-10-21)·anthropic SDK 상한 없음, 한국어 임베딩·BM25 하이브리드, LlamaParse·liteparse.
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
> - Claude 모델 개요: https://platform.claude.com/docs/en/about-claude/models/overview
> - Claude API 버전 2026-10-21: https://platform.claude.com/docs/en/api/migration-2026-10-21
> - PyPI llama-index-llms-anthropic: https://pypi.org/project/llama-index-llms-anthropic/
>
> 검증일: 2026-11-06 (재검증, 이전 2026-09-28 · 최초 2026-05-15)
> 검증 버전: llama-index **0.14.25** (2026-11-06 PyPI 재확인, 여전히 최신) / llama-index-llms-anthropic **0.12.3**(`anthropic[bedrock,vertex]>=0.75.0` 상한 없음, `llama-index-core>=0.14.5,<0.15`) — 최초 검증 시 0.14.22, 0.14.x 라인 내 patch 업데이트만 있어 API 변경 없음
> 권장 버전: 0.14.x 이상 (이 스킬은 0.14 기준. 0.11~0.13에서는 일부 API 다름)

---

## 이 스킬의 범위

0.14 기준 deprecated·기본값 함정, Claude 연동 함정, 한국어 RAG 선택만 싣는다.
> 기본 사용법(Document·Node·VectorStoreIndex·as_query_engine·벡터 스토어 연결·QueryFusionRetriever·reranker 예제)은 공식 문서 수준이라 싣지 않는다.

LangChain과의 분업: RAG 품질·검색 정확도 우선 → LlamaIndex / 복잡한 Agent·외부 도구 체이닝 → LangGraph(`python-langchain-current`) / 둘 다 → LlamaIndex(retrieval) + LangGraph(orchestration). 한국 전통 해몽 사전 콘텐츠는 `korean-dream-interpretation-tradition`.

---

## 1. deprecated — 구버전 코드를 섞지 말 것

| deprecated (0.14 deprecated_terms) | 대체 |
|-----------|------|
| `ServiceContext` | `Settings` 싱글톤(`Settings.llm`·`embed_model`·`transformations`) |
| `FunctionCallingAgent`, `FunctionCallingAgentWorker` | `FunctionAgent` + `AgentWorkflow` |
| `AgentRunner` / `AgentWorker` | `AgentWorkflow` |
| `ReActAgentWorker` | workflow 버전 `ReActAgent` (function calling 미지원 LLM용) |
| `SimpleNodeParser` | `SentenceSplitter`(최신 권장, SimpleNodeParser는 호환성 유지용) |

> 구버전 코드 마이그레이션 시 `llama_index.core.agent.workflow` 경로의 클래스만 사용한다. `agent.run(...)`은 `await`.

- 0.10부터 **모듈형 패키지** — 통합마다 별도 설치(`llama-index-llms-anthropic`, `llama-index-embeddings-huggingface`, `llama-index-vector-stores-*`, `llama-index-retrievers-bm25`, `llama-index-postprocessor-cohere-rerank` 등).

---

## 2. 기본값 함정

> 기본값: chunk_size=1024, chunk_overlap=20, embed_model=OpenAIEmbedding(text-embedding-ada-002), llm=OpenAI(gpt-3.5-turbo). 모두 `Settings`로 변경 가능.

- `text-embedding-ada-002`(영어 위주)는 한국어 검색 성능이 떨어진다 → 한국어는 `BAAI/bge-m3`(100+ 언어, 8192 토큰, 1024차원) 또는 `text-embedding-3-large`. 한국어 특화 대안 `jhgan/ko-sroberta-multitask`, `nlpai-lab/KURE-v1`(고려대 NLP 랩).
- chunk_size 권장: 일반 문서 512~1024, 짧은 사전·FAQ 256~512(예: 1~3문장 사전 항목은 384/64), 긴 논문·법조문 1024~2048. **chunk_size + metadata 길이 > 한계** 에러는 metadata를 줄이거나 chunk_size를 늘린다.
- 인덱싱·검색 임베딩 모델이 다르면 의미가 어긋난다 → 모델 변경 시 인덱스 **재구축**.
- 한국어처럼 동음이의·고유명사가 많은 도메인은 BM25 + Dense(`QueryFusionRetriever(mode="reciprocal_rerank")`) 하이브리드가 recall을 크게 올린다. 권장 흐름: top_k 크게(20) → reranker(예: `CohereRerank(model="rerank-multilingual-v3.0")`) top_n 3~5 → 생성.
- `response_mode` 기본은 `compact`. context 초과 시 `refine`·`tree_summarize` 또는 top_k 축소.

---

## 3. Claude 연동 함정

> **주의:** Anthropic은 **임베딩 모델을 제공하지 않는다.** Claude(LLM)만 제공.
> LlamaIndex에서 `Settings.llm = Anthropic(...)` 으로 LLM은 쓸 수 있지만, embedding은 OpenAI·HuggingFace·Cohere 등으로 별도 구성해야 한다.
> Anthropic 공식 문서가 임베딩 대안으로 명시 추천하는 파트너는 **Voyage AI**다 (`pip install llama-index-embeddings-voyageai`, `from llama_index.embeddings.voyageai import VoyageEmbedding`). 한국어 특화가 필요 없고 매니지드 임베딩을 원하면 HuggingFace 로컬 모델 대신 고려 가능 (2026-09-28 검증 확인).

```python
from llama_index.llms.anthropic import Anthropic
Settings.llm = Anthropic(model="claude-sonnet-5-5")   # 현행 Sonnet (2026-11-06) — temperature 지정 금지
```

> **사실(공식 문서 확인, 2026-11-06):** Claude API 버전 `2026-10-21`에서는 `temperature`·`top_p`·`top_k`를 보내면 **기본값이어도 모든 모델에서 400**이다. `2023-06-01`에서도 Sonnet 5.5·Opus 5.5 등 4.7 이후 모델은 비기본값을 거부한다. `anthropic` SDK 2.x(2026-10-21 v2.0.0~)는 기본으로 `2026-10-21`을 보내고, `llama-index-llms-anthropic`은 `anthropic`에 상한이 없어 새 환경에서는 2.x가 설치될 수 있다.
> 주의: 미검증 — `llama-index-llms-anthropic` 0.12.x가 `temperature` 기본값을 요청에 실어 보내는지, `anthropic` 2.x와 호환되는지는 공식 릴리스 노트로 확인하지 못했다. `Anthropic(...)`에 `temperature`를 넘기지 말고, 400이 나면 `pip show anthropic`으로 SDK 버전과 전송 파라미터를 확인한 뒤 통합 패키지를 올리거나 확인 전까지 `anthropic<2`로 핀한다.

- 비용을 줄일 응답 모델은 `claude-haiku-5-5`($0.10/$0.50). 임베딩은 로컬 HuggingFace로 무료화 가능.

---

## 4. LlamaParse·로컬 파서

- LlamaParse: 매니지드 OCR·문서 파싱(PDF 표·차트·다단 → markdown/JSON, 130+ 파일 타입). 패키지 **`llama-cloud-services`**(`from llama_cloud_services import LlamaParse`, `result_type="markdown"`, `language="ko"`). pages 단위 과금, Cost Optimizer가 단순/복잡 페이지 tier 자동 라우팅.
- 로컬 대안은 `liteparse`(LlamaIndex의 오픈소스 CLI 파서, 2026-03 공개). 표 많은 PDF만 LlamaParse, 일반 텍스트는 `SimpleDirectoryReader`.
