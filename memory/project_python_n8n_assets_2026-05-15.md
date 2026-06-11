---
name: python-n8n-2026-05-15
description: "2026-05-15 추가한 Python 16종 + n8n 5종 = 21개 스킬. 일반 실무·학습 우선(꿈 앱은 예시 중 하나). FastAPI·Anthropic SDK·KoNLPy·LangChain·LlamaIndex·임베딩·DataFrame·Jupyter·CLI·웹 스크래핑·n8n self-host·LLM 통합·워크플로우·웹훅·에러 처리. content test 21/21 PASS, APPROVED 14 + PENDING_TEST 7"
metadata: 
  node_type: memory
  type: project
  originSessionId: fad2d3a7-7551-4503-a516-6a3524b02835
---

## 신규 산출물 21개

### A. Python 핵심·환경 (8종, backend/)

| 자산 | status | 핵심 |
|------|--------|------|
| `python-basics` | **APPROVED** | Python 3.12+ PEP 695·Self·dataclass·match·comprehension·함정. Fluent Python 2판 |
| `python-uv-project-setup` | PENDING_TEST | uv 0.11.14 Astral Rust 10-100x·PEP 735 dependency-groups·Docker·GHA·Poetry 마이그레이션 |
| `python-fastapi` | PENDING_TEST | FastAPI 0.115+ Annotated Depends·Pydantic v2·SSE·multipart·JWT·TestClient·uvicorn |
| `python-pydantic-v2` | **APPROVED** | Pydantic 2.13.4 Rust 5-50x·Annotated Field·model_validator·model_dump·pydantic-settings 분리·bump-pydantic |
| `python-async-asyncio` | **APPROVED** | asyncio·TaskGroup 3.11+·to_thread·httpx.AsyncClient·timeout·CancelledError 재전파 |
| `python-pytest` | **APPROVED** | pytest 8.4 fixture scope·parametrize·pytest-asyncio·FastAPI dependency_overrides·mock·cov |
| `python-anthropic-sdk` | **APPROVED** | anthropic SDK sync/async·messages.stream() 헬퍼·cache_control TTL 5m/1h·tool_choice JSON 강제·Bedrock/Vertex |
| `python-korean-nlp-konlpy` | PENDING_TEST | KoNLPy 0.6.0 + mecab-ko·5 분석기 8141배 속도차·세종 POS·ko-sbert-multitask 768 dim |

### B. Python 데이터·LLM·도구 (8종, backend/)

| 자산 | status | 핵심 |
|------|--------|------|
| `python-pandas-fundamentals` | **APPROVED** | pandas 2.x PyArrow·CoW·.loc/.iloc·Named aggregation·utf-8-sig 한국어 |
| `python-data-visualization` | **APPROVED** | matplotlib 3.10 + seaborn 0.13.2 + plotly 6.7 5→6 마이그레이션·한국어 폰트·색맹 친화 |
| `python-jupyter-notebook` | PENDING_TEST | JupyterLab 4.5.7·nbstripout·jupytext py:percent·RISE 0.43.1·hidden state 방어 |
| `python-cli-typer` | **APPROVED** | Typer 0.25.1·Annotated Option·envvar·Exit vs Abort·Rich·CliRunner |
| `python-web-scraping` | **APPROVED** | BS4 4.14.3 + Playwright 1.59 + Scrapy 2.15.2·Locator API·RFC 9309 robots.txt·지수 백오프 |
| `python-langchain-current` | **APPROVED** | LangChain 1.x langchain-core 1.4.0·LCEL·ChatAnthropic·deprecated APIs·*언제 Anthropic SDK 직접 사용 권장* 명시 |
| `python-llamaindex` | **APPROVED** | llama-index 0.14.22·Document/Node/Index·Anthropic 임베딩 없음·FunctionAgent 권장·LlamaParse |
| `python-embeddings-vector-db` | PENDING_TEST | OpenAI text-embedding-3 Matryoshka·ko-sbert·Chroma vs Pinecone vs Weaviate vs Qdrant vs pgvector·청킹 |

### C. n8n (5종, devops/)

| 자산 | status | 핵심 |
|------|--------|------|
| `n8n-self-hosting` | PENDING_TEST | n8n v2.21.x·Docker compose+PostgreSQL+Caddy·encryption key·v2.0 MySQL 제거·Redis 큐 모드 |
| `n8n-llm-integration` | **APPROVED** | Anthropic/OpenAI 노드·AI Agent + Chat Trigger + Memory + Output Parser·temperature+top_p 함정 |
| `n8n-workflow-design` | **APPROVED** | Workflow/Node/Connection/Execution/Item·Code 노드·$('NodeName').item.json·Sub-workflow |
| `n8n-webhook-patterns` | **APPROVED** | Test/Production URL·응답 모드 3종·인증 4종·CORS 환경변수·multipart Binary Data |
| `n8n-error-handling` | **APPROVED** | 에러 모드 3종·Error Workflow·Retry On Fail Max 5 한계·Wait+Loop·Dead Letter Queue |

## 검증 통계 합계

- 핵심 클레임 약 200+ 건 교차 검증 → 전수 VERIFIED (DISPUTED는 본문 주의 표기)
- skill-tester content test **21/21 PASS** (FAIL 0)
- 14 APPROVED + 7 PENDING_TEST

## 사용자 결정 요약

- 범위: 21개 (🔴 5 + 🟡 8 + 🟢 8)
- 우선 초점: **일반 실무·학습 우선** — 꿈 앱은 예시 중 하나
- 에이전트: 미생성 (python-backend-developer/architect, n8n-workflow-designer 후보는 보류)
- python.md 코딩 규칙 파일: 미작성 (필요 시 별도 작업)

## 활용 시나리오

- 꿈 해몽 앱 백엔드 — FastAPI + Whisper 프록시 + Claude API 프록시, KoNLPy 한국어 형태소, pgvector/Chroma 임베딩, n8n 자동 워크플로우
- 학위논문 분석 — pandas + matplotlib + Jupyter
- 데이터 자동화 — Typer CLI + 웹 스크래핑 + n8n
- LLM 앱 — Anthropic SDK 또는 LangChain·LlamaIndex RAG

## 커밋·푸시 완료

- `ea897f5` [skill] Python 16 + n8n 5 = 21 SKILL.md
- `a1dcf88` [docs] 21 verification.md + README

모두 origin/main 푸시 완료.
