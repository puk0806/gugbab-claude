---
name: python-langchain-current
description: >
  LangChain 1.x 현황의 균형 잡힌 평가 스킬. 아키텍처(langchain-core·langchain·community·partner)·
  LCEL·프롬프트·tool calling·RAG·LangGraph·메모리·LangSmith 디버깅을 정리하고,
  Anthropic SDK 직접 사용·LlamaIndex 대비 *언제 LangChain이 필요한가*를 명확화한다.
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
> 검증일: 2026-05-15
> 검증 기준 버전: langchain-core 1.4.0 (2026-05-11 release) / langchain 1.3.x / langchain-community 0.4.x
> 짝 스킬: `backend/python-anthropic-sdk` (직접 호출 비교) · `backend/python-llamaindex` (RAG 대안)

> 핵심 입장: **무조건 LangChain을 쓰지 말 것.** 추상화 비용·API 변동성·디버깅 난이도라는 *명확한 비용*이 있고,
> 그 비용을 정당화하는 *명확한 이득*이 있을 때만 채택한다. 의사결정 표는 §10·§11을 보라.

---

## 1. LangChain 1.x 아키텍처

> 주의: LangChain은 2024-10 v0.3, 2025-10경 v1.0 GA를 거쳐 2026-05 기준 `langchain-core 1.4.0`이 안정 버전이다.
> *0.x 시절의 잦은 breaking change 평판*은 사실이며, 1.0 이후 안정성을 약속했지만 신뢰는 *축적 중*이다.

### 1.1 패키지 분리 구조

| 패키지 | 역할 | 안정성 |
|--------|------|--------|
| `langchain-core` | 추상 인터페이스(Runnable, BaseChatModel, BaseRetriever 등) + LCEL 런타임 | 1.x로 stable 약속 |
| `langchain` | 고수준 체인·에이전트(상당수가 LangGraph로 이관 권장) | 1.x stable, 단 일부 deprecated 진행 |
| `langchain-community` | 서드파티 통합(벡터스토어·로더 등) | 0.x — 변동성 잔존 |
| `langchain-{provider}` | 공식 partner 통합 (`langchain-anthropic`, `langchain-openai`, `langchain-ollama` 등) | 개별 버전 |
| `langgraph` | 그래프 기반 agentic workflow 오케스트레이션 | 별도 1.x stable |
| `langsmith` | 트레이싱·평가 SaaS | 별도 |

### 1.2 설치 예시

```bash
# 필요한 것만 깔기 — 메가 의존성 방지
uv add langchain-core langchain-anthropic
# RAG·LangGraph가 필요하면 추가
uv add langchain langchain-community langgraph
```

> 주의: `pip install langchain`만 하면 *간접 의존성 폭발*이 일어난다는 평판은 1.x 이후 partner package 분리로 *완화되었지만*, 여전히 *실제 사용하는 partner package만 명시 설치*하는 것이 권장된다.

---

## 2. LCEL (LangChain Expression Language)

LCEL은 `Runnable` 인터페이스를 갖는 컴포넌트를 `|` 파이프로 연결해 체인을 만드는 방식이다. v0.3 이후 *legacy Chain 클래스(LLMChain, RetrievalQA 등) 대체 표준*이다.

### 2.1 핵심: Runnable 인터페이스

모든 LangChain 컴포넌트는 다음 메서드를 갖는다:
- `invoke(input)` — 동기 단일 호출
- `ainvoke(input)` — 비동기 단일 호출
- `stream(input)` — 동기 스트리밍 (chunk yield)
- `astream(input)` — 비동기 스트리밍
- `batch(inputs)` / `abatch(inputs)` — 일괄 처리
- `.pipe(next)` 또는 `|` — 체인 연결

### 2.2 기본 LCEL 체인

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_anthropic import ChatAnthropic

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful translator. Translate to {language}."),
    ("human", "{text}"),
])
model = ChatAnthropic(model="claude-haiku-4-5-20251001")
parser = StrOutputParser()

chain = prompt | model | parser
result = chain.invoke({"language": "French", "text": "I love programming."})
```

### 2.3 병렬 실행

```python
from langchain_core.runnables import RunnableParallel

parallel = RunnableParallel(
    summary=summarize_chain,
    keywords=keyword_chain,
)
parallel.invoke({"doc": text})  # 두 체인 동시 실행
```

> 주의: LCEL은 *간단한 선형/병렬 체인*에서 빛난다. 조건 분기·루프·human-in-the-loop이 들어가면 *LangGraph로 옮기는 것*이 공식 권장이다 (§7 참조).

---

## 3. 프롬프트 템플릿

### 3.1 ChatPromptTemplate.from_messages + MessagesPlaceholder

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are {persona}."),
    MessagesPlaceholder("history"),         # 대화 이력 주입 자리
    ("human", "{question}"),
])

prompt.invoke({
    "persona": "a friendly tutor",
    "history": [("human", "안녕"), ("ai", "안녕하세요!")],
    "question": "오늘 뭘 배울까?",
})
```

`MessagesPlaceholder(name, optional=True)`로 선택적 자리로도 만들 수 있다.

---

## 4. 모델 통합

| 통합 | 패키지 | 임포트 |
|------|--------|--------|
| Anthropic Claude | `langchain-anthropic` | `from langchain_anthropic import ChatAnthropic` |
| OpenAI | `langchain-openai` | `from langchain_openai import ChatOpenAI` |
| Ollama (로컬) | `langchain-ollama` | `from langchain_ollama import ChatOllama` |
| Google Gemini | `langchain-google-genai` | `from langchain_google_genai import ChatGoogleGenerativeAI` |

```python
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI

claude = ChatAnthropic(model="claude-haiku-4-5-20251001", temperature=0)
gpt = ChatOpenAI(model="gpt-4.1-mini", temperature=0)

# 공통 인터페이스: 둘 다 Runnable이므로 같은 체인에서 교체 가능
chain = prompt | claude        # vs   prompt | gpt
```

> 이것이 *LangChain의 가장 명확한 이득*: **공급자 추상화**. 단, 공급자별 고유 기능(Claude의 prompt caching·extended thinking 등)은 이 추상화 위에서 *부분적으로만* 지원되거나 우회 옵션이 필요하다.

---

## 5. Tool Calling

### 5.1 `@tool` 데코레이터 (간단)

```python
from langchain_core.tools import tool

@tool
def get_weather(location: str) -> str:
    """Get current weather for a given city."""
    return f"{location}: 22°C, sunny"

model_with_tools = ChatAnthropic(model="claude-haiku-4-5-20251001").bind_tools([get_weather])
response = model_with_tools.invoke("What's the weather in Seoul?")
print(response.tool_calls)  # [{"name": "get_weather", "args": {"location": "Seoul"}, "id": "..."}]
```

### 5.2 Pydantic 스키마 (엄격한 타입)

```python
from pydantic import BaseModel, Field

class GetWeather(BaseModel):
    """Get the current weather in a given location."""
    location: str = Field(description="The city and state, e.g. San Francisco, CA")

model_with_tools = model.bind_tools([GetWeather])
```

### 5.3 tool_choice 옵션

```python
model.bind_tools([GetWeather], tool_choice="auto")    # 모델이 결정
model.bind_tools([GetWeather], tool_choice="any")     # 도구 호출 강제
model.bind_tools([GetWeather], tool_choice="GetWeather")  # 특정 도구 강제
```

> 주의: tool calling *루프 관리*(호출→실행→결과 재주입→재호출)는 *LangGraph의 `create_react_agent` 또는 직접 그래프*를 쓰는 것이 현재 권장이다. `AgentExecutor`는 *legacy* 취급이며 신규 개발 비권장.

---

## 6. RAG — `create_retrieval_chain` (현재 권장)

> 주의: `RetrievalQA` 클래스는 v0.1.17 이후 *deprecated*다. 신규 코드는 `create_retrieval_chain` 또는 LCEL 수동 조립을 사용한다.

```python
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 4})

prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer based only on this context:\n\n{context}"),
    ("human", "{input}"),
])

combine_docs = create_stuff_documents_chain(model, prompt)
rag_chain = create_retrieval_chain(retriever, combine_docs)

result = rag_chain.invoke({"input": "What is LCEL?"})
# result = {"input": ..., "context": [Document, ...], "answer": "..."}
```

대화 이력을 반영하는 RAG는 `create_history_aware_retriever`와 조합한다.

### 6.1 LlamaIndex와의 비교 (짝 스킬 `backend/python-llamaindex` 참조)

| 측면 | LangChain RAG | LlamaIndex RAG |
|------|---------------|----------------|
| 학습 곡선 | 가파름 (체인·리트리버 조립 필요) | 완만함 (`VectorStoreIndex.from_documents` 한 줄) |
| 인덱싱 옵션 | 벡터·기본 | 벡터·트리·키워드·하이브리드 등 풍부 |
| 검색 최적화 | 일반적 | *검색에 특화*, 정확도/지연 우수 보고 |
| 외부 도구·체인 통합 | 강함 (이것이 LangChain의 본업) | 약함 (외부 오케스트레이션은 LangChain·LangGraph로 위임) |
| 권장 시나리오 | 다단계 추론·도구 호출 포함 RAG | 문서 검색이 핵심인 단순 RAG |

**실무 패턴:** *검색 = LlamaIndex / 오케스트레이션 = LangChain·LangGraph* 하이브리드도 흔하다.

---

## 7. LangGraph — agentic workflow의 현재 권장

> LangChain팀 공식 입장: **"에이전트 워크플로우는 LangGraph로 옮겨라."** 루프·조건 분기·상태 영속·human-in-the-loop이 필요한 모든 경우에 해당한다.

### 7.1 사전 구축된 React agent

```python
from langgraph.prebuilt import create_react_agent
from langchain_anthropic import ChatAnthropic

agent = create_react_agent(
    model=ChatAnthropic(model="claude-haiku-4-5-20251001"),
    tools=[get_weather],
)

result = agent.invoke({"messages": [("human", "Seoul 날씨 알려줘")]})
```

### 7.2 직접 그래프 구성

```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict

class State(TypedDict):
    messages: list

def call_model(state: State):
    response = model.invoke(state["messages"])
    return {"messages": state["messages"] + [response]}

graph = StateGraph(State)
graph.add_node("model", call_model)
graph.add_edge(START, "model")
graph.add_edge("model", END)
app = graph.compile()
```

> LangChain `AgentExecutor`는 *legacy*다. 신규 코드는 LangGraph 사용.

---

## 8. 메모리 · 체크포인트

### 8.1 LangGraph 체크포인터 (현재 권장)

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

checkpointer = MemorySaver()              # 개발용 (프로세스 종료 시 휘발)
agent = create_react_agent(model, tools=[...], checkpointer=checkpointer)

config = {"configurable": {"thread_id": "user-42"}}
agent.invoke({"messages": [("human", "안녕")]}, config=config)
agent.invoke({"messages": [("human", "방금 뭐라고 했지?")]}, config=config)
# thread_id가 같으면 이력이 자동 로드된다
```

프로덕션은 `langgraph-checkpoint-postgres` / `langgraph-checkpoint-sqlite` 사용.

### 8.2 RunnableWithMessageHistory (LCEL 체인용)

LangGraph를 쓰지 않고 LCEL 체인에 이력을 붙이고 싶다면:

```python
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import InMemoryChatMessageHistory

store = {}
def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

chain_with_history = RunnableWithMessageHistory(
    chain, get_session_history,
    input_messages_key="question",
    history_messages_key="history",
)
chain_with_history.invoke(
    {"question": "안녕"},
    config={"configurable": {"session_id": "user-42"}},
)
```

> 주의: agentic 워크플로우라면 *LangGraph checkpointer가 우선*이다. `RunnableWithMessageHistory`는 단순 LCEL 체인용.

---

## 9. 디버깅 — LangSmith

LangChain의 가장 *체감되는 강점 중 하나*. 환경변수만으로 모든 Runnable 호출이 자동 트레이싱된다.

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=ls_...
export LANGSMITH_PROJECT=my-project
```

LangChain/LangGraph 코드는 **코드 변경 없이** 모든 chain·tool·model 호출이 트리 형태로 LangSmith에 기록된다. 입력·출력·지연·토큰·에러까지 한눈에 본다.

> 주의: LangSmith는 *SaaS·유료(무료 티어 있음)*다. self-hosted 옵션은 별도 enterprise 계약 필요. 트레이싱만 원하면 OpenTelemetry로 대체 가능하지만 통합 깊이는 떨어진다.

---

## 10. *Anthropic SDK 직접 사용과의 비교 — 결정 표*

> 짝 스킬 `backend/python-anthropic-sdk` 참조. *어느 쪽이 옳다*가 아니라 *상황별로 다르다*.

### 10.1 LangChain을 권장하는 경우

- **다중 LLM 공급자 추상화**가 필요 — Claude·GPT·Gemini·Ollama 사이를 *동일 코드로* 교체할 가능성
- **복잡한 체인·RAG·tool calling 루프** — LCEL/LangGraph가 *조립 보일러플레이트*를 줄여준다
- **LangGraph agentic workflow** — 상태·체크포인트·human-in-the-loop·다중 agent 협업이 필요
- **LangSmith 트레이싱**의 통합 디버깅이 가치 있는 경우
- 팀이 이미 LangChain 패턴에 익숙해 학습 비용이 없다

### 10.2 Anthropic SDK 직접 사용을 권장하는 경우

- **단일 공급자(Claude)만 사용**할 것이 확정 — 추상화 비용만 부담하고 이득 0
- **단순 호출 / 단순 챗봇** — 프롬프트→응답 한 번이면 SDK가 훨씬 직관적
- **세밀한 제어**가 필요 — prompt caching, extended thinking, message batching, beta 헤더 등 *Claude 고유 기능*을 풀로 활용
- **최소 의존성**·가벼운 배포 산출물(serverless·edge) — `anthropic` 한 패키지면 충분
- **명확한 디버깅**·낮은 마법(magic) — 호출 스택이 얕고 추측할 게 없는 코드를 원함

### 10.3 한 줄 휴리스틱

> **"Claude만 쓰고, 체인이 1~2단계고, agent loop이 없으면 → Anthropic SDK. 그 외 → LangChain·LangGraph 검토."**

---

## 11. 흔한 비판 — 사실 확인

> 공정한 평가를 위해 *사실과 과장*을 구분한다.

| 비판 | 사실 여부 | 1.x 시점 보정 |
|------|----------|--------------|
| "잦은 breaking change" | **사실** (0.x 시기 특히) | 1.0 GA 후 stable 약속, 신뢰는 *축적 중*. partner package 버전 따로 추적 필요 |
| "추상화 누수(leaky abstraction)" | **부분 사실** | 공급자 고유 기능 사용 시 우회 코드 필요. 단순 LCEL 체인은 안정적 |
| "디버깅이 어렵다 / 스택트레이스가 깊다" | **사실** | LangSmith로 *상당 부분 완화*. 단, LangSmith 없이는 여전히 고통 |
| "의존성 비대" | **부분 사실** | 1.x partner package 분리로 *필요한 것만* 설치 가능 |
| "단순 RAG에 과잉" | **사실** | 단순 RAG라면 LlamaIndex 또는 직접 작성이 더 적합한 경우 많음 |
| "AgentExecutor가 불안정" | **사실** | 그래서 *LangGraph로 이관*이 공식 권장이다 |

---

## 12. 흔한 함정 (Anti-patterns)

### 12.1 deprecated API 사용

```python
# 금지 — v0.1.17 이후 deprecated
from langchain.chains import RetrievalQA, LLMChain
qa = RetrievalQA.from_chain_type(llm, retriever=retriever)

# 권장 — LCEL 또는 create_retrieval_chain
from langchain.chains import create_retrieval_chain
```

```python
# 금지 — legacy AgentExecutor
from langchain.agents import AgentExecutor, create_react_agent  # 구버전 path

# 권장 — LangGraph
from langgraph.prebuilt import create_react_agent
```

### 12.2 버전 호환성 무시

```bash
# 위험 — partner package 버전이 langchain-core와 어긋날 수 있음
pip install langchain langchain-anthropic

# 권장 — 해당 시점 호환 매트릭스를 PyPI/changelog에서 확인하고 핀
uv add langchain==1.3.* langchain-core==1.4.* langchain-anthropic==X.Y.*
```

### 12.3 메가 `pip install langchain`

```python
# 금지 — 안 쓰는 community 통합까지 끌려옴
import langchain

# 권장 — 필요한 partner만
from langchain_core.prompts import ChatPromptTemplate
from langchain_anthropic import ChatAnthropic
```

### 12.4 LCEL로 agent loop 짜기

조건 분기·루프·상태가 들어가는 순간 LCEL은 *읽기 어려운 람다 지옥*이 된다. **그 순간 LangGraph로 옮긴다.**

### 12.5 LangSmith 없이 운영

LangChain의 디버깅 비용을 가장 크게 낮춰주는 도구다. *프로덕션 도입 시* 트레이싱 인프라(LangSmith 또는 OTel 대체)는 *선택이 아니라 사실상 필수*다.

### 12.6 공급자 추상화의 환상

> 주의: "LangChain이면 모델 한 줄 바꿔서 GPT/Claude/Gemini를 즉시 교체할 수 있다"는 *반은 맞고 반은 틀리다*. 프롬프트 포맷·tool calling 스펙·system message 처리·streaming chunk 구조가 공급자마다 미묘하게 다르다. *진짜로 다중 공급자가 필요한지* 먼저 확인하라.

---

## 참고 자료

- LangChain Python 공식 문서 — https://docs.langchain.com/oss/python/langchain/overview
- LangChain v0.3 announcement — https://www.langchain.com/blog/announcing-langchain-v0-3
- LangChain 1.0 GA — https://changelog.langchain.com/announcements/langchain-1-0-now-generally-available
- LangGraph 공식 GitHub — https://github.com/langchain-ai/langgraph
- LangGraph workflows·agents — https://docs.langchain.com/oss/python/langgraph/workflows-agents
- LangSmith Observability — https://docs.langchain.com/langsmith/observability
- ChatAnthropic integration — https://docs.langchain.com/oss/python/integrations/chat/anthropic
- LCEL reference — https://reference.langchain.com/python/langchain-core
- 짝 스킬 `backend/python-anthropic-sdk` — Claude만 쓸 때의 직접 호출 패턴
- 짝 스킬 `backend/python-llamaindex` — 검색 특화 RAG 대안
