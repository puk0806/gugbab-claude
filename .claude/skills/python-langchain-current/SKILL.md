---
name: python-langchain-current
description: >
  LangChain 1.x 현재 기준과 Claude 연동 함정 — 1.0 GA "2.0 전 breaking 없음" 정책, AgentExecutor 2026-12까지 LangGraph 이관 권장, RetrievalQA·LLMChain deprecated, ChatAnthropic temperature 400(API 2026-10-21)·anthropic SDK 상한 없음, 강제 tool_choice 400 모델과 with_structured_output method 명시, Anthropic SDK 직접 사용 대비 채택 판단.
  <example>사용자: "Claude만 쓰는 단순 챗봇인데 LangChain 써야 해?"</example>
  <example>사용자: "RAG 만들 때 LangChain vs LlamaIndex 뭐가 나아?"</example>
  <example>사용자: "LangChain agent 어떻게 만들어? AgentExecutor 써?"</example>
---

# python-langchain-current — LangChain 현황 균형 평가

> 소스:
> - LangChain Python 공식 문서: https://docs.langchain.com/oss/python/langchain/overview
> - LangChain v0.3 발표 블로그: https://www.langchain.com/blog/announcing-langchain-v0-3
> - LangChain 1.0 GA: https://changelog.langchain.com/announcements/langchain-1-0-now-generally-available
> - LCEL 컨셉 문서: https://docs.langchain.com/oss/python/langchain/overview (LCEL 페이지 통합)
> - LangGraph 공식: https://github.com/langchain-ai/langgraph
> - ChatAnthropic 통합 문서: https://docs.langchain.com/oss/python/integrations/chat/anthropic
> - LangSmith Observability: https://docs.langchain.com/langsmith/observability
>
> - Claude 모델 개요: https://platform.claude.com/docs/en/about-claude/models/overview
> - Claude API 버전 2026-10-21: https://platform.claude.com/docs/en/api/migration-2026-10-21
>
> 검증일: 2026-11-11 (재검증, 이전 2026-11-06 · 2026-09-26 · 2026-05-15 최초 검증 · 재검증 이력은 후술 — 2026-11-11 강제 tool_choice 금지 모델 표기 Fable 5.2 현행화)
> 검증 기준 버전: langchain-core **1.7.6** / langchain-anthropic **1.7.10**(PyPI, 2026-11-06 확인 — `anthropic>=0.120.0` 상한 없음, `langchain-core>=1.7.5,<2`) / langchain 1.3.x / langchain-community 0.4.x
> Claude 모델 기준(2026-11-06): 현행 Opus 5.5 `claude-opus-5-5` · Sonnet 5.5 `claude-sonnet-5-5` · Haiku 5.5 `claude-haiku-5-5`(분류·추출·대량, $0.10/$0.50). `claude-haiku-4-5`·`claude-sonnet-5`는 Legacy.
>
> 짝 스킬: Claude Code 내장 `claude-api` (직접 호출 비교) · `python-llamaindex` (RAG 대안)

---

## 이 스킬의 범위

1.x 시점의 정책·deprecated, Claude API 최신 규약과 LangChain 래퍼가 부딪히는 곳, 채택 판단만 싣는다.
> 기본 사용법(LCEL 파이프·ChatPromptTemplate·@tool·bind_tools·create_retrieval_chain·LangGraph 그래프·체크포인터 예제)은 공식 문서 수준이라 싣지 않는다.

> 핵심 입장: **무조건 LangChain을 쓰지 말 것.** 추상화 비용·API 변동성·디버깅 난이도라는 *명확한 비용*이 있고, 그 비용을 정당화하는 *명확한 이득*이 있을 때만 채택한다.

---

## 1. 버전·정책 현황

> **주의 (2026-09-26 갱신):** LangChain·LangGraph 모두 2025-10-22 GA로 1.0에 도달했고, **2.0 이전까지는 breaking change를 내지 않겠다는 정책**을 공식화했다(semantic versioning 준수). `AgentExecutor`는 여전히 deprecated이며, **2026-12까지 LangGraph로 마이그레이션을 권장**하는 공식 가이드가 나와 있다.

| 패키지 | 안정성 |
|--------|--------|
| `langchain-core` | 1.x stable 약속 (기준 1.7.6) |
| `langchain` | 1.x stable, 일부 deprecated 진행(에이전트는 LangGraph로 이관 권장) |
| `langchain-community` | **0.x — 변동성 잔존** |
| `langchain-{provider}` (`langchain-anthropic` 등) | 개별 버전 — 따로 추적 |
| `langgraph` | 별도 1.x stable |

| deprecated | 대체 |
|-----------|------|
| `RetrievalQA`, `LLMChain` 등 legacy Chain (v0.1.17 이후) | LCEL 또는 `create_retrieval_chain`(+`create_history_aware_retriever`) |
| `AgentExecutor`, `langchain.agents.create_react_agent` | `langgraph.prebuilt.create_react_agent` 또는 직접 `StateGraph` |
| agentic 메모리를 `RunnableWithMessageHistory`로 | LangGraph checkpointer(`thread_id`), 프로덕션은 `langgraph-checkpoint-postgres`/`-sqlite` |

- `pip install langchain` 단독 설치는 피하고 실제 쓰는 partner 패키지만 명시 설치. 버전은 `langchain==1.3.* langchain-core==1.7.* langchain-anthropic==1.7.*`처럼 호환 매트릭스를 확인해 핀(2026-11-06 PyPI 기준 예시).

---

## 2. Claude 연동 함정 (ChatAnthropic)

> **주의 (2026-11-06) — Claude API 버전 `2026-10-21`과 sampling 파라미터:** API `2026-10-21`에서는 `temperature`·`top_p`·`top_k`를 보내면 기본값이어도 **모든 모델에서 400**이다. `langchain-anthropic`은 `anthropic` SDK에 상한을 두지 않으므로 새 환경에서는 `anthropic` 2.x(기본 API 버전 `2026-10-21`)가 설치될 수 있다. `ChatAnthropic(..., temperature=...)`를 **설정하지 말고**, 설치된 `anthropic` 버전(`pip show anthropic`)과 래퍼가 보내는 `anthropic-version`을 확인한다. 출력 일관성은 `with_structured_output(Schema, method="json_schema")`(structured outputs)로 확보한다.
> 주의: 미검증 — `langchain-anthropic` 1.7.x가 `anthropic` 2.x와 완전히 호환되는지(내부에서 sampling 필드를 기본값으로 싣는지 등)는 공식 문서·릴리스 노트로 확인하지 못했다. 업그레이드 시 실제 호출로 400 여부를 확인하거나, 확인 전까지 `anthropic<2`로 핀하는 것을 고려한다.

> 주의: "공급자 교체 가능"해도 **공급자별 파라미터 규약은 다르다.** 공통 설정 dict로 `temperature=0`을 모든 모델에 일괄 주입하면 Claude 쪽은 400이 난다. Claude는 sampling 파라미터를 빼고 structured outputs·프롬프트로 일관성을 잡는다.

> 주의: `ChatAnthropic`에서 `tool_choice="any"`·특정 도구명 강제는 Anthropic `tool_choice` `{type:"any"}`/`{type:"tool"}`로 전달되며, **Claude Opus 5.5(`claude-opus-5-5`)·Sonnet 5.5(`claude-sonnet-5-5`)·Fable 5.2(`claude-fable-5-2`)에서는 400**을 반환한다(구세대 Fable 5.1도 동일. Legacy Sonnet 5·Haiku 4.5에서는 동작. Haiku 5.5는 공식 문서에 거부 명시가 없지만 모델 교체 이식성을 위해 `auto`를 권장). 해당 모델에선 `tool_choice="auto"` + 프롬프트로 도구 사용 지시(+ 도구 `strict: true`)하거나, JSON 추출 목적이면 Anthropic structured outputs(`output_config.format` — `with_structured_output(Schema, method="json_schema")`)를 쓴다. `with_structured_output` 기본 `function_calling` 방식은 내부적으로 강제 tool_choice를 쓸 수 있으니 해당 모델에서 method를 명시한다.

- 모델 ID는 날짜 접미사 없는 현행 ID(`claude-haiku-5-5` 등). Claude 고유 기능(prompt caching·extended thinking 등)은 추상화 위에서 *부분적으로만* 지원되거나 우회 옵션이 필요하다.

---

## 3. 채택 판단

> **한 줄 휴리스틱: "Claude만 쓰고, 체인이 1~2단계고, agent loop이 없으면 → Anthropic SDK(`claude-api` 스킬). 그 외 → LangChain·LangGraph 검토."**

| LangChain·LangGraph가 맞는 경우 | Anthropic SDK 직접이 맞는 경우 |
|------|------|
| 다중 공급자(Claude·GPT·Gemini·Ollama) 교체 가능성이 실제로 있음 | 단일 공급자(Claude) 확정 — 추상화 비용만 있고 이득 0 |
| 복잡한 체인·RAG·tool calling 루프 | 단순 호출·단순 챗봇 |
| 상태·체크포인트·human-in-the-loop·다중 agent (LangGraph) | Claude 고유 기능(caching·thinking·batch·beta 헤더)을 풀로 |
| LangSmith 통합 트레이싱 가치 | 최소 의존성(serverless·edge), 얕은 호출 스택 |

- RAG: 문서 검색이 핵심인 단순 RAG는 LlamaIndex(`python-llamaindex`)가 학습 곡선·검색 특화 면에서 유리, 다단계 추론·도구 호출 포함이면 LangChain. *검색 = LlamaIndex / 오케스트레이션 = LangGraph* 하이브리드도 흔하다.
- 조건 분기·루프·상태가 들어가는 순간 LCEL은 람다 지옥 → LangGraph로 옮긴다(공식 권장).

### 흔한 비판 — 사실 확인

| 비판 | 판정 | 1.x 보정 |
|------|------|---------|
| 잦은 breaking change | 사실(0.x) | 1.0 GA(2025-10-22)에 "2.0 전까지 없음" 정책화. partner 버전은 따로 추적 |
| 추상화 누수 | 부분 사실 | 공급자 고유 기능 시 우회 필요 |
| 디버깅 어려움 | 사실 | LangSmith로 상당 부분 완화 — 프로덕션엔 LangSmith(`LANGSMITH_TRACING=true` 등 환경변수만으로 자동 트레이싱) 또는 OTel 대체가 사실상 필수 |
| 의존성 비대 | 부분 사실 | partner 분리로 필요한 것만 설치 가능 |
| AgentExecutor 불안정 | 사실 | LangGraph 이관이 공식 권장 |

> 주의: LangSmith는 *SaaS·유료(무료 티어 있음)*다. self-hosted 옵션은 별도 enterprise 계약 필요. 트레이싱만 원하면 OpenTelemetry로 대체 가능하지만 통합 깊이는 떨어진다.

> 주의: "LangChain이면 모델 한 줄 바꿔서 GPT/Claude/Gemini를 즉시 교체할 수 있다"는 *반은 맞고 반은 틀리다*. 프롬프트 포맷·tool calling 스펙·system message 처리·streaming chunk 구조가 공급자마다 미묘하게 다르다. *진짜로 다중 공급자가 필요한지* 먼저 확인하라.
