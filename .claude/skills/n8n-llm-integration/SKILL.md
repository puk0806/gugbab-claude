---
name: n8n-llm-integration
description: >
  n8n 2.x에서 Claude를 쓸 때의 최신 변경점·함정 — Anthropic Chat Model 노드 Thinking Mode(2.20.0/typeVersion 1.5, Disabled는 Opus·Sonnet 5.5·Fable 5.2에서 400), sampling 파라미터 자동 미전송·SDK 0.x(2023-06-01), 현행 모델 ID·Claude 3 retired, Agent 타입 선택 제거(1.82.0), 2.0 Publish 필요, MCP 직결(2.22)·HITL(2.6)·Motorhead deprecated(2.8.3), $ref 미지원, Code 노드 $env 기본 차단.
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
> - [n8n issue #28635 — Anthropic 노드 thinking 포맷 미갱신 (→ PR #29467로 해결됨)](https://github.com/n8n-io/n8n/issues/28635)
> - [n8n PR #29467 — Anthropic 노드 Adaptive Thinking Mode 도입 (typeVersion 1.5, n8n 2.20.0)](https://github.com/n8n-io/n8n/pull/29467)
> - [n8n Docs — Save and publish workflows](https://docs.n8n.io/build/understand-workflows/save-and-publish-workflows)
> - [n8n Support — Understanding Workflow Publishing in n8n 2.0](https://support.n8n.io/article/understanding-workflow-publishing-in-n-8-n-2-0)
> - [n8n Docs — Security environment variables (`N8N_BLOCK_ENV_ACCESS_IN_NODE`)](https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/security)
> - [npm registry — n8n latest 버전 조회](https://registry.npmjs.org/n8n/latest)
>
> - [n8n 소스 — Anthropic Chat Model 노드 `LmChatAnthropic.node.ts` (master)](https://github.com/n8n-io/n8n/blob/master/packages/@n8n/nodes-langchain/nodes/llms/LMChatAnthropic/LmChatAnthropic.node.ts)
> - [n8n `pnpm-workspace.yaml` catalog (`@langchain/anthropic` 1.5.6)](https://github.com/n8n-io/n8n/blob/master/pnpm-workspace.yaml) · [npm — `@langchain/anthropic@1.5.6` 의존성](https://registry.npmjs.org/@langchain/anthropic/1.5.6)
> - [Anthropic — Models overview](https://platform.claude.com/docs/en/about-claude/models/overview) · [API versions](https://platform.claude.com/docs/en/api/versioning) · [Migrating to API version 2026-10-21](https://platform.claude.com/docs/en/api/migration-2026-10-21) · [Claude Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/overview) · [Claude Haiku 5.5](https://platform.claude.com/docs/en/models/haiku-5-5/overview)
>
> 검증일: 2026-11-11 (재검증, 이전 2026-11-06 · 2026-09-28 · 최초 2026-05-15 — 2026-11-11 상위 티어 Fable 5.2 현행화)
> 대상 버전: n8n v2.x (2026-11-06 기준 npm latest **v2.46.6**, Anthropic Chat Model 노드 defaultVersion **1.6**)

> 짝 스킬: `n8n-self-hosting`, `n8n-error-handling`, Claude Code 내장 `claude-api` 스킬(n8n 밖 SDK 직접 호출)

---

## 이 스킬의 범위

n8n 노드가 Claude API 최신 규약과 부딪히는 지점, n8n 버전별 UI·동작 변경, 실측 함정만 싣는다.
> 기본 사용법(클러스터 노드 구조, Chat Trigger + AI Agent + Memory 조립, Vector Store 모드·RAG 파이프라인, Output Parser 연결, 일반 비용·안전 원칙)은 공식 문서 수준이라 싣지 않는다.

---

## 1. Anthropic Chat Model 노드 — 모델 선택

- Model 드롭다운은 **자격증명의 API key로 Anthropic `/v1/models`를 동적 조회**(최신순, n8n PR #13543) — 하드코딩 목록이 아니다. 뜨는 모델은 키에 열린 모델에 따라 다르고, 워크플로우 JSON에는 선택한 모델 ID 문자열이 박히므로 모델 교체 시 워크플로우 수정 필요.
- 노드는 API key 인증만 — Bedrock·Vertex 미포함.

| 티어 | 모델 ID | 용도 |
|------|---------|------|
| 상위 티어 | `claude-fable-5-2` | 최고난도 장기 에이전트 작업 (단가 $8/$40 per MTok — 비용 감안해 최소 사용, 2026-11-09 출시) |
| 고성능 | `claude-opus-5-5` | 최고난도 판단·분석, 오케스트레이션 ($4/$20) |
| 균형 | `claude-sonnet-5-5` | 검색·코드 생성·검증 — n8n 워크플로우 기본 선택 ($2/$10, 2026-09-28 출시) |
| 경량 | `claude-haiku-5-5` | 단순 분류·포맷 변환·라우팅 ($0.10/$0.50 — 프롬프트 10만 토큰 초과 시 $0.50/$2.50, 2026-10-07 출시) |

> **세대 정렬 (2026-11-11 갱신):** 위 표는 Anthropic 현행 라인업(**Claude Fable 5.2 / Claude Opus 5.5 / Claude Sonnet 5.5 /
> Claude Haiku 5.5**, 공식 models overview) 기준이다. `claude-sonnet-5`·`claude-haiku-4-5`·`claude-fable-5-1`·`claude-fable-5`·`claude-opus-5`·
> `claude-opus-4-8`·`claude-sonnet-4-6` 등은 여전히 호출 가능한 **Legacy** 지만 신규 워크플로우에는 쓰지 않는다
> (이전 판의 "Haiku 4.5 가 계속 현행" 서술은 Haiku 5.5 출시로 틀렸다). 신규 n8n 워크플로우 구성 시 드롭다운에 뜨는 최신 ID를 함께 확인한다.

> **구버전 모델명 금지:** `claude-3-7-sonnet`, `claude-3-5-sonnet`, `claude-3-haiku`, `claude-3-opus` 등 Claude 3 계열은
> 대부분 **retired**(API 404)다. 과거 워크플로우 JSON에 이 문자열이 남아 있으면 실행이 실패하므로 일괄 점검 대상이다.

- 컨텍스트 윈도우: **1M** (Fable 5.2·Opus 5.5·Sonnet 5.5·Haiku 5.5 현행 전 모델) / 200K (legacy Haiku 4.5) — Anthropic 공식 모델 문서 기준.

---

## 2. Thinking Mode·Sampling — 400 함정

> **주의 — Opus 5.5·Sonnet 5.5·Fable 5.2 선택 시:** 세 모델은 강제 `tool_choice`(`any`/`tool`)를 400으로 거부한다.
> thinking 비활성(`{type: "disabled"}`)은 Opus 5.5·Sonnet 5.5·Fable 5.2 에서 400이다(Sonnet 5.5 는 대신 `between_tools`, 노드에는 이 옵션이 없다).
> n8n 노드는 **Thinking Mode = Disabled 를 고르면 `thinking: {type: 'disabled'}` 를 실제로 전송**하고, 옵션을 비워 두면 필드를
> 생략한다(소스 확인) — 이 모델들에서는 Thinking Mode 를 비우거나 `Adaptive` 로 둔다. LangChain 내부가 구조화 출력 등을 위해
> 도구 호출을 강제하는 경로를 쓰면 실패할 수 있으므로(주의: 미확인 — n8n 노드 버전별 동작 미검증), 400이 나면 HTTP Request 노드로 직접 호출한다.

> **해결됨 — thinking 파라미터 (n8n issue #28635 → PR #29467, n8n 2.20.0 / typeVersion 1.5부터):** 과거 Anthropic Chat Model
> 노드(typeVersion 1.4 이하)는 레거시 포맷 `thinking: {type: "enabled", budget_tokens: N}`만 전송해 최신 모델 + thinking 활성화
> 조합에서 400 에러(`"thinking.type.enabled" is not supported for this model`)가 났다. **n8n 2.20.0(2026-05-05 릴리즈)부터
> typeVersion 1.5 노드에 `Thinking Mode` 옵션 3종이 생겼다: `Disabled` / `Adaptive (Recommended)` / `Manual (Deprecated)`.**
> Adaptive를 고르면 노드가 `thinking.type: "adaptive"` + `output_config.effort`를 전송해 최신 모델과 호환된다. **오래된 워크플로우이거나 인스턴스가 2.20.0 미만이면
> 여전히 레거시 경로**라 400이 날 수 있다 — 그 경우 `Manual`을 피하고 `Disabled`로 두거나 인스턴스를 업그레이드한다(단, Opus 5.5·Sonnet 5.5·Fable 5.2 에서는 위 주의대로 `Disabled`도 400).
> `Manual (Deprecated)`은 신규 워크플로우에서 선택하지 않는다.

> **주의 — 샘플링 파라미터:** Claude 4.7 이후 모델(Opus 5.5·Sonnet 5.5·Haiku 5.5·Fable 5.2 등)은 `temperature`·`top_p`·`top_k`
> 비기본값을 400으로 거부하고, **API 버전 `2026-10-21` 에서는 모든 모델에서 세 파라미터 자체가 400**(기본값이어도)이다.
> n8n 노드 소스(2026-11-06 master 확인)는 `modelSupportsSamplingParams(modelName)` 로 걸러 **`claude-sonnet-4*`·`claude-haiku-4*`·
> `claude-opus-4`~`4-6`·`claude-3*` 등 구모델에만 Temperature(UI 기본 0.7)·Top K·Top P 를 보내고, 그 밖의 `claude-*`(5 계열 포함)에는 보내지 않는다.**
> 따라서 노드에서 현행 모델을 고르면 Sampling Temperature 필드는 무시된다 — 톤은 프롬프트로 제어한다.
> 노드가 쓰는 SDK 는 `@langchain/anthropic` 1.5.6 → `@anthropic-ai/sdk` **^0.115.0**(0.x)이므로 요청은 `anthropic-version: 2023-06-01` 로 나간다(0.x SDK 기본값).
> 그래서 legacy 4.x 모델의 temperature 도 지금은 통한다. 주의: 미검증 — n8n 이 SDK 1.x(API `2026-10-21`)로 올리면 4.x 모델에서도 temperature 가 400 이 되므로, 업그레이드 시 노드 Temperature 를 비우고 재확인한다.
> HTTP Request 노드로 직접 호출할 때 `anthropic-version: 2026-10-21` 을 보내면 본문에서 `temperature`·`top_p`·`top_k` 를 빼고, 결정성이 필요하면 `output_config.format`(structured outputs)과 낮은 `output_config.effort` 를 쓴다.
> (4.6 이하 legacy 모델 + `2023-06-01` 조합에서만 종전 제약이 적용된다 — `temperature`와 `top_p` 중 하나만 지정. 참고: n8n issue #18304)

> **주의 — Anthropic 프롬프트 캐싱:** n8n Anthropic Chat Model 노드의 system 메시지 캐싱 동작이 명시적으로 노출되지 않는 시점이 있었다 (n8n issue #13231). 최신 버전 확인 권장.

---

## 3. n8n 버전별 변경점

| 버전 | 변경 |
|------|------|
| **1.82.0** | AI Agent 노드의 **Agent 타입 선택 파라미터 제거** — 모든 AI Agent는 **Tools Agent로만 동작**(Conversational·OpenAI Functions·ReAct·Plan and Execute·SQL Agent 선택지 제거). 오래된 튜토리얼의 "Agent 타입에서 Tools Agent 선택" 드롭다운은 현재 UI에 없다. 다른 타입이던 노드는 마이그레이션 검토 |
| **2.0** | **Active 토글 → Save/Publish 분리** — Save는 저장만, 우측 상단 **Publish**(`Shift+P`)를 눌러야 Webhook·Chat Trigger 프로덕션 URL·스케줄·연결 앱 이벤트가 동작. 2.0 이전 active 워크플로우는 자동으로 published로 마이그레이션 |
| **2.0** | `N8N_BLOCK_ENV_ACCESS_IN_NODE` 기본값 **`true`** — Code 노드(Code Tool 포함)의 환경변수 접근 **기본 차단**(공식 v2.0 breaking changes: "n8n will block access to environment variables from the Code node by default"). 일반 노드 필드의 표현식은 영향 없음. 시크릿은 n8n Credential이 공식 권장, 꼭 필요하면 `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`(`n8n-self-hosting`과 동일) |
| **2.6** | 도구 호출 **Human-in-the-loop** — 지정 도구는 AI Agent 실행 전 사람 승인 필요. DB 쓰기·메일·결제 도구에 기본 |
| **2.8.3** | **Motorhead** 메모리 노드 deprecated(업스트림 유지보수 중단) → Postgres / Redis Chat Memory |
| **2.20.0** | Anthropic 노드 typeVersion 1.5 Thinking Mode (2절) |
| **2.22** | MCP Client 노드 없이 **에이전트에 MCP 서버 직접 연결** — 초기 지원: Apify, Linear, monday.com, Notion, PostHog |

- 안전 가드: n8n **Guardrails 노드**로 PII·시크릿·jailbreak 입력 차단(AI Agent와 액션 사이 배치).

---

## 4. 실측 함정

| 함정 | 증상 | 대응 |
|------|------|------|
| JSON Schema `$ref` | Structured Output Parser·Tool 스키마 에러 | n8n이 `$ref` 미지원 — inline 평탄화 |
| Hugging Face Inference → AI Agent | Tools Agent에서 모델 인식 안 됨 | AI Agent 연결 불가, Basic LLM Chain에만 |
| Ollama Chat Model 도구 호출 | 모델별로 동작 상이 | Tools Agent 호환 모델만 |
| Simple Memory 2개 이상 | 분리된 줄 알았는데 공유 | 기본적으로 같은 인스턴스 공유 — sessionId를 노드별로 다르게 |
| Simple Memory 기본값 | 맥락이 짧음 | Context Window Length 기본 5, in-memory(단일 인스턴스용) |
| Memory 노드 누락 | 매번 처음처럼 대답 | 챗봇엔 반드시 연결 |
| Simple Vector Store(In-Memory) | n8n 재시작 시 인덱스 사라짐 | 프로덕션은 Pinecone·Qdrant·Supabase·PGVector |
| Tools Agent Max Iterations | 토큰·요금 폭주 | 기본 10, 단순 작업 3~5 |
| Respond to Webhook 미동작 | 응답 안 옴 | Webhook Respond 설정 = `Using Respond to Webhook Node` |
| OpenAI `sk-proj-...` 키 | OpenAI 노드가 키 거부하는 케이스 보고 | n8n 최신 버전 확인, 필요 시 user-scoped key |
| 워크플로우 export | 키 포함 | Credential에만 저장, export 시 credentials 제외 |
| `$fromAI('key', 'description', 'type')` | — | 도구 파라미터를 LLM이 채우게 하는 표현식. description이 모호하면 호출 안 함·잘못된 인자 |
