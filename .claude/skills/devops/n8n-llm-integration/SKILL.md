---
name: n8n-llm-integration
description: >
  n8n에서 LLM(Anthropic Claude · OpenAI · Ollama · Hugging Face)을 활용해 AI Agent·Chat Trigger·RAG·도구 호출 워크플로우를 구성하는 가이드.
  Anthropic Chat Model 노드와 Tools Agent를 중심으로 메모리·벡터 스토어·Output Parser 사용 패턴을 정리한다.
  <example>사용자: "n8n에서 Claude로 챗봇 만들고 싶어"</example>
  <example>사용자: "n8n RAG 워크플로우 — Pinecone vs Qdrant"</example>
  <example>사용자: "n8n AI Agent에서 도구 호출 setup"</example>
disable-model-invocation: true
---

# n8n LLM Integration

> 소스:
> - [n8n Docs — Advanced AI (LangChain in n8n)](https://docs.n8n.io/advanced-ai/langchain/overview/)
> - [AI Agent node](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/)
> - [Tools Agent](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/tools-agent/)
> - [Anthropic Chat Model](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatanthropic/)
> - [Chat Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.chattrigger/)
> - [Simple Memory (구 Window Buffer Memory)](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorybufferwindow/)
> - [Structured Output Parser](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.outputparserstructured/)
> - [n8n Release notes 2.x](https://docs.n8n.io/changelog/release-notes-2.x)
> - [Anthropic — Models overview](https://platform.claude.com/docs/en/about-claude/models/overview)
> - [n8n PR #13543 — Anthropic 모델 동적 로딩 + thinking 지원](https://github.com/n8n-io/n8n/pull/13543)
> - [n8n issue #28635 — Anthropic 노드 thinking 포맷 미갱신](https://github.com/n8n-io/n8n/issues/28635)
>
> 검증일: 2026-08-12
> 대상 버전: n8n v2.x (2026-08-11 기준 stable v2.33.7 / beta v2.34.4)

> 짝 스킬: `devops/n8n-self-hosting`, `devops/n8n-workflow-design`, `backend/python-anthropic-sdk`

---

## 1. n8n LLM 통합 아키텍처

n8n은 LangChain을 기반으로 **클러스터 노드(Cluster Nodes)** 구조를 사용한다.

| 계층 | 노드 종류 | 역할 |
|------|-----------|------|
| Root Node | AI Agent, Basic LLM Chain, Q&A Chain, Vector Store 등 | 오케스트레이션 |
| Sub-Node | Chat Model, Embeddings, Memory, Tool, Output Parser, Retriever | Root 노드에 연결되어 기능 제공 |
| Trigger | Chat Trigger, Webhook, Schedule | 입력 진입점 |

> **핵심 원칙:** Root 노드 단독으로는 작동하지 않는다. 반드시 Chat Model sub-node가 연결되어야 한다.

---

## 2. LLM Chat Model 노드 (공식)

| 노드 | 용도 | Tool calling | 비고 |
|------|------|:---:|------|
| **Anthropic Chat Model** | Claude (Fable·Opus·Sonnet·Haiku) | ✅ | API key 인증, Bedrock·Vertex 미포함 |
| **OpenAI Chat Model** | GPT 계열 | ✅ | 기본 함수 호출 지원 |
| **Google Gemini Chat Model** | Gemini 계열 | ✅ | |
| **Ollama Chat Model** | 로컬 Llama·Mistral·Qwen 등 | ⚠️ 모델별 상이 | self-hosted 환경 권장 |
| **Hugging Face Inference Model** | HF Hub 추론 API | ❌ | **AI Agent에 연결 불가**, Basic LLM Chain에만 사용 |

### Anthropic Chat Model 주요 파라미터

| 파라미터 | 설명 |
|----------|------|
| Model | **Anthropic API에서 동적으로 조회**되는 드롭다운 (최신순 정렬). 하드코딩 목록이 아님 — n8n PR #13543 |
| Maximum Number of Tokens | 응답 최대 토큰 |
| Sampling Temperature | 0.0~1.0, 높을수록 다양성 증가 |
| Top K | 다음 토큰 후보 수 |
| Top P | nucleus sampling, 0.0~1.0 |
| Enable Thinking / Thinking Budget | extended thinking 토글 + 예산 (아래 주의 참조) |

> **모델 목록은 하드코딩하지 않는다.** 이 노드는 자격증명의 API key로 Anthropic `/v1/models`를 조회해 드롭다운을 채운다.
> 따라서 "어떤 모델이 뜨는가"는 **키에 열려 있는 모델**에 따라 달라진다. 워크플로우 JSON에는 선택된 모델 ID 문자열이 그대로 박히므로,
> 모델 교체 시 워크플로우를 수정해야 한다.

**현행 모델 지정 기준** — 이 레포는 `.claude/rules/agent-design.md`를 기준으로 삼는다:

| 티어 | 모델 ID | 용도 |
|------|---------|------|
| 상위 티어 | `claude-fable-5` | 최고난도 장기 에이전트 작업 (단가 $10/$50 per MTok — 비용 감안해 최소 사용) |
| 고성능 | `claude-opus-5` | 최고난도 판단·분석, 오케스트레이션 |
| 균형 | `claude-sonnet-5` | 검색·코드 생성·검증 — n8n 워크플로우 기본 선택 |
| 경량 | `claude-haiku-4-5` | 단순 분류·포맷 변환·라우팅 |

> **세대 정렬 (2026-08-12):** 위 표는 Anthropic 현행 라인업(**Claude Fable 5 / Claude Opus 5 / Claude Sonnet 5 /
> Claude Haiku 4.5**) 기준으로 갱신했다. 구세대 `claude-opus-4-8`·`claude-sonnet-4-6`은 여전히 호출 가능한
> *legacy*지만 신규 워크플로우에는 쓰지 않는다. Haiku는 `claude-haiku-4-5`가 계속 현행이다.
> 레포 규칙 파일 `.claude/rules/agent-design.md`는 아직 Opus 4.8·Sonnet 4.6 기준으로 남아 있으므로
> **별도 갱신이 필요**하다. 신규 n8n 워크플로우 구성 시 드롭다운에 뜨는 최신 ID를 함께 확인한다.

> **구버전 모델명 금지:** `claude-3-7-sonnet`, `claude-3-5-sonnet`, `claude-3-haiku`, `claude-3-opus` 등 Claude 3 계열은
> 대부분 **retired**(API 404)다. 과거 워크플로우 JSON에 이 문자열이 남아 있으면 실행이 실패하므로 일괄 점검 대상이다.

> **주의 — thinking 파라미터 미갱신 (n8n issue #28635, 2026-08-11 기준 open):** Anthropic Chat Model 노드(v1.3)는
> 레거시 포맷 `thinking: {type: "enabled", budget_tokens: N}`만 전송한다. Anthropic은 최신 모델에서 이 포맷을 제거하고
> `thinking: {type: "adaptive"}` + `output_config.effort`를 요구하므로, **최신 모델 + thinking 활성화 조합은 400 에러**가 난다
> (에러: `"thinking.type.enabled" is not supported for this model`). 노드가 수정될 때까지 우회책은 **thinking을 끄거나
> extended thinking을 지원하는 모델을 쓰는 것**뿐이다. 깊은 추론이 필요하면 HTTP Request 노드로 Messages API를 직접 호출한다.

> **주의 — 샘플링 파라미터 (5 계열에서 제거됨):** Claude Opus 5·Sonnet 5·Fable 5·Opus 4.8/4.7은 `temperature`·`top_p`·`top_k`를
> **더 이상 받지 않는다** — 기본값이 아닌 값을 보내면 400이다. n8n Anthropic Chat Model 노드는 Sampling Temperature 필드를
> 그대로 전송하므로, **5 계열 모델을 선택했다면 노드의 Sampling Temperature를 기본값으로 두고 프롬프트로 톤을 제어**한다.
> 응답 다양성이나 결정성이 필요하면 `output_config.effort`를 쓰되 노드가 지원하지 않으므로 HTTP Request 노드로 직접 호출한다.
> (4.6 이하 legacy 모델을 쓰는 경우에만 종전 제약이 적용된다 — `temperature`와 `top_p` 중 하나만 지정. 참고: n8n issue #18304)

---

## 3. AI Agent 노드 (Root) — Tools Agent 중심

### Agent 타입 선택은 제거됐다 (n8n 1.82.0+)

**1.82.0부터 AI Agent 노드의 Agent 타입 선택 파라미터가 제거됐다.** 이제 모든 AI Agent 노드는 **Tools Agent로만 동작**한다
— 기존에 가장 많이 쓰이던 권장 설정이 유일한 동작 방식이 된 것이다.

| 구 Agent 타입 | 현재 |
|--------------|------|
| **Tools Agent** | ✅ 유일한 동작 방식 (선택 UI 없음) |
| Conversational / OpenAI Functions / ReAct / Plan and Execute / SQL Agent | ❌ 선택지 제거 |

기존 워크플로우가 `Tools Agent`로 설정돼 있었다면 **그대로 동작**한다. 다른 타입으로 설정돼 있던 노드는 마이그레이션 검토가 필요하다.

> 오래된 튜토리얼·블로그가 여전히 "Agent 타입에서 Tools Agent를 고르세요"라고 안내한다 — 현재 UI에는 그 드롭다운이 없다.
> 화면에 안 보인다고 잘못 설치된 게 아니다.

### Tools Agent 파라미터

| 파라미터 | 설명 |
|----------|------|
| Prompt (Define / Take from previous) | 사용자 입력. Chat Trigger 연결 시 `Take from previous node automatically` 권장 |
| Require Specific Output Format | Output Parser 연결 활성화 토글 |
| System Message (옵션) | 에이전트 역할 정의 |
| Max Iterations (옵션) | 도구 호출 최대 횟수 (기본 10) |
| Return Intermediate Steps | 디버깅용 reasoning step 반환 |
| Enable Streaming | Chat Trigger에 토큰 단위 스트리밍 |

### 필수 sub-node 연결

```
Chat Trigger ──▶ AI Agent (Tools)
                    │
                    ├─ Chat Model       (필수: Anthropic Chat Model 등)
                    ├─ Memory           (옵션: Simple Memory)
                    ├─ Tool × N         (옵션: HTTP Request Tool, Calculator 등)
                    └─ Output Parser    (옵션: Structured Output Parser)
```

---

## 4. 채팅 패턴 — Chat Trigger + AI Agent + Memory

### 최소 구성

```
[Chat Trigger]  ──▶  [AI Agent (Tools)]  ──▶  (응답은 Chat Trigger UI로 자동 반환)
                          ├─ Anthropic Chat Model
                          └─ Simple Memory  (sessionId = $('Chat Trigger').item.json.sessionId)
```

Chat Trigger는 세 가지 모드를 지원한다.
- **Hosted Chat** — n8n이 호스팅하는 공개/임베드 URL
- **Embedded Chat** — `@n8n/chat` 위젯으로 외부 사이트 임베드
- **Webhook** — REST 호출

### Simple Memory (구 Window Buffer Memory)

- 메모리 sub-node 중 **가장 단순**, 워크플로 내 in-memory 저장
- **Session Key**: 같은 사용자/세션을 식별. Chat Trigger의 sessionId를 expression으로 연결 권장
- **Context Window Length**: 보존할 이전 메시지 수 (기본 5)

> **주의 — 메모리 노드 누락 시:** Memory sub-node가 없으면 매 호출이 stateless가 되어 대화 맥락이 끊긴다. 챗봇 워크플로우에는 반드시 연결한다.

> **주의 — 다중 Memory 동일 sessionId:** 같은 워크플로우에 Simple Memory를 2개 이상 두면 *기본적으로 같은 메모리 인스턴스를 공유*한다. 분리하려면 sessionId를 다르게 지정한다.

---

## 5. 도구 호출 (Tool Sub-Nodes)

| Tool | 용도 |
|------|------|
| **HTTP Request Tool** | 외부 REST API 호출. tool description으로 LLM이 자동 호출 |
| **Calculator Tool** | 수식 계산 |
| **Vector Store Tool** | RAG 검색 (Retriever as tool) |
| **Workflow Tool (Call n8n Workflow)** | 다른 n8n 워크플로우를 도구로 호출 |
| **Code Tool** | JS/Python 커스텀 도구 |
| **Wikipedia / SerpAPI / Wolfram** | 검색·지식 |
| **MCP Client Tool** | MCP 서버 도구 호출 |

### MCP 서버 직접 연결 (n8n 2.22+)

**2.22부터 MCP Client 노드를 별도로 두지 않고 에이전트에 MCP 서버를 직접 연결**할 수 있다.
초기 지원 대상: Apify, Linear, monday.com, Notion, PostHog. 단순 MCP 도구 사용이라면 노드 하나를 줄일 수 있다.

### 도구 호출 사람 승인 (Human-in-the-loop, n8n 2.6+)

특정 도구에 대해 **AI Agent가 실행하기 전 명시적 사람 승인을 요구**하도록 설정할 수 있다.
DB 쓰기·메일 발송·결제 같은 비가역 액션 도구에는 이 옵션을 켜는 것이 기본이다 (11절 안전 가드 참조).

### `$fromAI()` — 동적 파라미터

도구 파라미터를 LLM이 결정하게 하려면 `$fromAI('key', 'description', 'type')` 사용:

```js
// HTTP Request Tool URL 필드
https://api.example.com/dreams/{{ $fromAI('dreamId', '꿈 레코드 ID', 'string') }}
```

### Tool Description 작성 원칙

- 도구 이름과 설명은 **LLM이 읽고 호출 여부를 판단하는 근거**다.
- "꿈 해몽 사전을 조회한다. 입력은 꿈 키워드(예: 뱀, 물)" 처럼 *언제 호출해야 하는지*를 명확히 적는다.

> **주의 — Tool schema 오류:** description이 모호하면 LLM이 도구를 호출하지 않거나, 잘못된 인자를 전달한다. JSON Schema 파라미터를 명시할 때 `$ref`는 n8n이 지원하지 않으므로 평탄화해서 작성한다.

---

## 6. RAG 워크플로우 — Vector Store

### 지원 Vector Store (공식 Root 노드)

| Vector Store | 환경 | 비고 |
|--------------|------|------|
| **Pinecone** | 클라우드 SaaS | 빠른 시작, 프로덕션 가능 |
| **Qdrant** | self-host (Docker) | self-host n8n 동거 권장 |
| **Supabase** | Postgres pgvector | 기존 Supabase 스택과 통합 |
| **PGVector** | Postgres 확장 | 자체 Postgres 운영 시 |
| **Simple Vector Store (In-Memory)** | 메모리 | 개발/테스트 전용, 재시작 시 휘발 |
| Milvus, Weaviate, MongoDB Atlas, Redis | 추가 옵션 | 환경에 따라 선택 |

### Vector Store 노드의 4가지 동작 모드

1. **Insert Documents** — 문서 임베딩 후 저장
2. **Get Many** — 메타데이터 필터로 조회
3. **Retrieve Documents (as Vector Store for Chain/Tool)** — Chain/Retriever에 연결
4. **Retrieve Documents (as Tool for AI Agent)** — AI Agent에 도구로 직접 연결

### 표준 RAG 파이프라인

```
[문서 적재]
File/HTTP ──▶ Text Splitter ──▶ Embeddings (OpenAI) ──▶ Vector Store (Insert)

[검색]
Chat Trigger ──▶ AI Agent ──▶ (Tool) Vector Store Retrieve
                    └─ Chat Model
```

### Embeddings OpenAI 노드 파라미터

| 파라미터 | 설명 |
|----------|------|
| Model | text-embedding-3-small, text-embedding-3-large, text-embedding-ada-002 |
| Base URL | OpenAI 호환 self-host 모델 사용 시 |
| Batch Size | 한 요청당 문서 수 |
| Strip New Lines | 개행 제거 |
| Timeout | 요청 타임아웃(초) |

---

## 7. 메모리 노드 비교

| Memory | 영속성 | 용도 |
|--------|:---:|------|
| **Simple Memory** (구 Window Buffer) | ❌ 워크플로 내 in-memory | 단일 인스턴스 챗봇 |
| **Postgres Chat Memory** | ✅ | 프로덕션 영속 저장, 사용자 프로필과 통합 |
| **Redis Chat Memory** | ✅ (단 TTL 가능) | 빠른 세션 컨텍스트, 다중 인스턴스 |
| **MongoDB Chat Memory** | ✅ | 문서형 저장 |
| **Xata / Zep** | ✅ | 매니지드 메모리 서비스 |
| ~~Motorhead~~ | — | **n8n 2.8.3에서 deprecated** (업스트림 프로젝트 유지보수 중단) — 신규 사용 금지 |

> Postgres·Redis·Xata 메모리 노드는 **Context Window Length** 옵션을 지원해 보존 메시지 수를 제한할 수 있다.

### 권장 패턴

- **개발/단일 사용자**: Simple Memory
- **다중 사용자 프로덕션**: Postgres Chat Memory (영속) 또는 Redis (속도)
- **하이브리드**: Redis(세션) + Postgres(사용자 프로필) 조합

---

## 8. Output Parser

| Parser | 출력 형태 |
|--------|----------|
| **Structured Output Parser** | JSON 객체 (스키마 강제) |
| **Item List Output Parser** | 배열 (구분자로 split) |
| **Auto-fixing Output Parser** | 다른 parser 결과가 깨졌을 때 LLM이 보정 |

### Structured Output Parser 사용

1. AI Agent 노드의 `Require Specific Output Format` 토글 ON
2. Output Parser sub-node 연결
3. 스키마 정의 — 두 방식:
   - **Generate from JSON Example**: 예시 JSON 입력하면 자동 추론
   - **Manually input the JSON schema**: JSON Schema 직접 작성

> **주의 — `$ref` 미지원:** n8n Structured Output Parser는 JSON Schema의 `$ref`를 지원하지 않는다. 중첩 구조는 inline으로 평탄화한다.

### Item List Output Parser 파라미터

- **Number of Items**: 최대 항목 수 (-1 = 무제한)
- **Separator**: 분리 문자 (개행, 콤마 등)

---

## 9. 모델 선택 — Claude vs GPT vs Llama (중립 비교)

| 기준 | Claude (Anthropic) | OpenAI GPT 계열 | Llama/Mistral via Ollama |
|------|-------------------|-----------------|--------------------------|
| 추론 품질 | 최상위권, 긴 컨텍스트·에이전트 작업 강함 | 최상위권, 함수 호출 안정 | 모델별 편차 큼 |
| 컨텍스트 윈도우 | **1M** (Fable 5·Opus·Sonnet 최신 세대) / 200K (Haiku 4.5) | 모델별 | 모델별 (8K~128K) |
| Tool calling | 안정 | 안정 (네이티브) | 모델별, Tools Agent 호환 모델 한정 |
| 비용 | Haiku 저렴 → Sonnet 중간 → Opus 높음 → Fable 최상 | 티어별 상이 | self-host 운영비만 |
| 데이터 주권 | API 호출 (외부) | API 호출 (외부) | 로컬 (self-host) |
| 적합한 용도 | 긴 문서 분석·코드·장기 에이전트 추론 | 함수 호출 중심·범용 | 데이터 외부 송출 금지·내부망 |

> 컨텍스트 윈도우 수치는 Anthropic 공식 모델 문서(2026-08-11 확인) 기준. OpenAI·Ollama 측 수치는 벤더 문서에서 직접 확인할 것
> — 이 스킬은 n8n 통합이 주제이므로 타 벤더 스펙을 추적하지 않는다.

> **선택 기준**
> - 외부 API 허용 + 추론 품질 우선 → Claude 또는 GPT
> - 데이터 외부 송출 금지 → Ollama (self-host) + Tools Agent 호환 모델
> - Tool calling 안정성 최우선 → OpenAI 또는 Anthropic (Hugging Face Inference는 Tools Agent 비호환)

---

## 10. 비용 관리·캐싱 패턴

| 패턴 | 방법 |
|------|------|
| **모델 라우팅** | Switch 노드로 간단 질의는 Haiku, 복잡한 추론은 Opus/Fable |
| **프롬프트 캐싱** | Anthropic prompt caching 활용 (System Message 고정 시 효과 큼) |
| **컨텍스트 윈도우 축소** | Memory `Context Window Length` 5~10으로 제한 |
| **Embedding 재사용** | Vector Store 노드 Insert는 1회, 이후 Retrieve만 |
| **Max Iterations 제한** | Tools Agent의 무한 루프 방지 (기본 10, 단순 작업은 3~5) |
| **응답 캐시** | Webhook 입력을 해시 키로 Redis/PostgreSQL 캐시 후 동일 입력은 캐시 반환 |

> **주의 — Anthropic 프롬프트 캐싱:** n8n Anthropic Chat Model 노드의 system 메시지 캐싱 동작이 명시적으로 노출되지 않는 시점이 있었다 (n8n issue #13231). 최신 버전 확인 권장.

---

## 11. 안전 가드

| 영역 | 조치 |
|------|------|
| **API 키** | n8n Credential Manager에만 저장. 노드 파라미터에 직접 입력 금지. 워크플로우 export 시 자격증명 분리 확인 |
| **PII / 시크릿** | n8n **Guardrails 노드**로 PII·시크릿·jailbreak 입력 차단 (AI Agent와 액션 사이 배치) |
| **도구 호출 사전 승인** | **Human-in-the-loop (n8n 2.6+)** — 지정한 도구는 AI Agent 실행 전 명시적 사람 승인 필요. DB 쓰기·메일 발송·결제 도구에 필수 |
| **Output 검증** | Structured Output Parser로 스키마 강제 + 후속 IF 노드로 값 범위 검증 |
| **Rate Limit** | Wait 노드 / Queue 노드로 API rate limit 회피 |
| **워크플로우 격리** | LLM 호출 워크플로우와 액션(메일 발송·DB 쓰기) 워크플로우 분리, Call n8n Workflow Tool로 명시적 호출 |

---

## 12. 예시 — 꿈 해몽 워크플로우

요구사항: 사용자가 webhook으로 꿈을 입력 → AI Agent(Anthropic Claude)가 해몽 → 결과를 DB에 저장.

### 노드 구성

```
[Webhook Trigger]
  POST /dream
  Body: { userId, dreamText }
        │
        ▼
[AI Agent (Tools)]
  Prompt: "{{ $json.dreamText }}"
  Require Specific Output Format: ON
        │
        ├─ [Anthropic Chat Model]
        │     Model: claude-sonnet-5         # 드롭다운에서 선택 (API로 동적 조회)
        │     System Message: "당신은 꿈 해몽 전문가다. 문화적 맥락(동양 전통 해몽 + 현대 심리학)을 모두 고려해 균형 있게 해석한다."
        │     Sampling Temperature: (기본값 유지)  # 5 계열은 temperature 미지원 — 비기본값 전송 시 400
        │     Enable Thinking: OFF            # issue #28635 — 최신 모델 + thinking = 400
        │
        ├─ [Simple Memory]
        │     Session Key: {{ $json.userId }}
        │     Context Window Length: 10
        │
        ├─ [HTTP Request Tool]  (선택: 해몽 사전 API)
        │     Name: dreamDictionary
        │     Description: "꿈 키워드별 전통 해몽을 조회한다. 입력: keyword (string)"
        │     URL: https://api.example.com/dict/{{ $fromAI('keyword', '꿈 핵심 키워드', 'string') }}
        │
        └─ [Structured Output Parser]
              JSON Example:
              {
                "summary": "한 줄 요약",
                "interpretation": "상세 해몽 본문",
                "keywords": ["뱀", "물"],
                "mood": "positive"
              }
        │
        ▼
[Postgres — Insert]
  Table: dream_interpretations
  Columns: user_id, dream_text, summary, interpretation, keywords, mood, created_at
        │
        ▼
[Respond to Webhook]
  Body: {{ $('AI Agent').item.json.output }}
```

### 핵심 포인트

- `Require Specific Output Format` ON + Structured Output Parser → 파싱 실패 없이 Postgres 컬럼에 매핑 가능
- Simple Memory의 `Session Key`를 `userId`로 → 같은 사용자의 꿈 이력 컨텍스트 유지
- HTTP Request Tool은 선택. 없으면 모델 내재 지식으로만 해몽
- 응답은 Respond to Webhook으로 반환 (Webhook의 Respond 설정이 `Using Respond to Webhook Node`여야 함)

---

## 13. 흔한 함정

| 함정 | 증상 | 대응 |
|------|------|------|
| **API 키 노출** | 워크플로우 JSON export에 키가 포함 | n8n Credential에만 저장, export 시 credentials 제외 옵션 사용 |
| **Memory 노드 누락** | 챗봇이 매번 처음처럼 대답 | Simple Memory 또는 Postgres Chat Memory 연결 |
| **Tool description 모호** | LLM이 도구 호출 안 함 또는 잘못된 인자 전달 | "언제 호출하는가 + 입력 형식"을 명시 |
| **`$ref` 사용 schema** | Structured Output Parser 에러 | 스키마를 inline 평탄화 |
| **5 계열 모델 + Sampling Temperature 지정** | `400` — Opus 5·Sonnet 5·Fable 5·Opus 4.8/4.7은 `temperature`/`top_p`/`top_k` 미지원 | 노드 필드를 기본값으로 두고 프롬프트로 톤 제어 |
| **`temperature` + `top_p` 동시** (4.6 이하 legacy 한정) | Anthropic API 에러 | 한쪽만 지정 |
| **Enable Thinking + 최신 Claude 모델** | `400 "thinking.type.enabled" is not supported` | thinking OFF, 또는 HTTP Request 노드로 Messages API 직접 호출 (issue #28635) |
| **워크플로우에 Claude 3 계열 모델명 잔존** | 모델 404 / 실행 실패 | `claude-3-*` 문자열 일괄 검색 후 현행 모델로 교체 |
| **오래된 가이드대로 Agent 타입 찾기** | UI에 드롭다운이 없음 | 1.82.0에서 제거됨 — 항상 Tools Agent |
| **Motorhead 메모리 노드 사용** | 2.8.3부터 deprecated | Postgres / Redis Chat Memory로 이전 |
| **Hugging Face Inference → AI Agent** | Tools Agent에서 모델 인식 안 됨 | Basic LLM Chain으로 변경하거나 다른 모델 사용 |
| **Simple Memory 다중 인스턴스** | 분리된 줄 알았는데 공유됨 | sessionId를 노드별로 다르게 expression 설정 |
| **OpenAI `sk-proj-...` 키 호환성** | OpenAI 노드가 키 거부하는 케이스 보고됨 | n8n 최신 버전 확인, 필요 시 user-scoped key 사용 |
| **Max Iterations 무한 루프** | 토큰·요금 폭주 | Tools Agent `Max Iterations`를 작업별로 3~10 사이 설정 |
| **Vector Store In-Memory 휘발** | n8n 재시작 시 인덱스 사라짐 | 프로덕션은 Pinecone·Qdrant·Supabase 등 영속 저장소로 교체 |

---

## 14. 짝 스킬과의 관계

| 스킬 | 다루는 범위 |
|------|-------------|
| `devops/n8n-llm-integration` (본 스킬) | LLM 노드·AI Agent·RAG·메모리·도구 호출 |
| `devops/n8n-self-hosting` | n8n Docker/Kubernetes 자체 호스팅, 환경변수, queue mode |
| `devops/n8n-workflow-design` | 일반 워크플로우 설계 원칙, 에러 처리, 모듈화 |
| `backend/python-anthropic-sdk` | n8n 외부에서 직접 Anthropic SDK 호출(파이썬), Tool Use·streaming |

> n8n 워크플로우 내에서 LLM을 *시각적 노드 조합*으로 다룰 때는 본 스킬을, 직접 SDK 호출이 필요한 영역(복잡한 도구 체인·테스트 코드)은 `backend/python-anthropic-sdk`를 참조한다.
