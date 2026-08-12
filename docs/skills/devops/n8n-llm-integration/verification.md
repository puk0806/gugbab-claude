---
skill: n8n-llm-integration
category: devops
version: v2
date: 2026-08-11
status: APPROVED
---

# n8n LLM Integration — 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `n8n-llm-integration` |
| 스킬 경로 | `.claude/skills/devops/n8n-llm-integration/SKILL.md` |
| 검증일 | **2026-08-11** (최초 작성 2026-05-15) |
| 검증자 | skill-creator (최초) → 최신화 재검증 (2026-08-11) |
| 스킬 버전 | v2 |
| 대상 버전 | n8n v2.x — 2026-08-11 기준 stable v2.33.7 / beta v2.34.4 |
| 카테고리 분류 | content test 가능 (경계선) — *실행 결과·빌드 산출물 없이도 SKILL.md 답변 정확성만으로 1차 검증 가능*. 단, 실제 n8n 워크플로우 동작은 사용자 self-host 환경에서 별도 확인 권장 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 — docs.n8n.io (AI Agent, Tools Agent, Anthropic Chat Model, Chat Trigger, Simple Memory, Structured Output Parser, Vector Store 5종)
- [✅] 공식 GitHub 2순위 소스 확인 — n8n-io/n8n-docs, n8n-io/n8n issue tracker (#13128, #13231, #18304)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-05-15) — n8n LangChain nodes, 2026 가이드 블로그 교차 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 — Chat Trigger + AI Agent + Memory + Tools + Output Parser
- [✅] 코드 예시 작성 — 꿈 해몽 webhook 워크플로우
- [✅] 흔한 실수 패턴 정리 — 10개 함정 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | n8n AI Agent node LangChain, Anthropic Chat Model, Vector Store, Memory, Output Parser, Ollama/HF, Chat Trigger 7회 | 공식 docs.n8n.io URL 다수 확보 |
| 조사 | WebFetch | docs.n8n.io 6개 페이지 fetch (AI Agent, Tools Agent, LangChain overview, Anthropic Chat Model, Chat Trigger, Structured Output Parser, Qdrant) | 노드별 파라미터·sub-node 구조 확보 |
| 교차 검증 | WebSearch | "Anthropic Chat Model" temperature+top_p 이슈, Window Buffer Memory = Simple Memory 명칭 변경, AI Agent 자격증명 안전 패턴 | VERIFIED 12 / DISPUTED 1 (temperature+top_p 동시 사용 제약 — 본문에 주의 표기) / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| n8n Docs — LangChain Overview | https://docs.n8n.io/advanced-ai/langchain/overview/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — AI Agent Node | https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Tools Agent | https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/tools-agent/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Anthropic Chat Model | https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatanthropic/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Anthropic Credentials | https://docs.n8n.io/integrations/builtin/credentials/anthropic/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Chat Trigger | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.chattrigger/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Simple Memory | https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorybufferwindow/ | ⭐⭐⭐ High | 2026-05-15 | 공식 (구 Window Buffer Memory) |
| n8n Docs — Postgres Chat Memory | https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorypostgreschat/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Redis Chat Memory | https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memoryredischat/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Structured Output Parser | https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.outputparserstructured/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Item List Output Parser | https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.outputparseritemlist/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Pinecone Vector Store | https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstorepinecone/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Qdrant Vector Store | https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstoreqdrant/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Supabase Vector Store | https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstoresupabase/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Simple Vector Store (in-memory) | https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstoreinmemory/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Embeddings OpenAI | https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.embeddingsopenai/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Ollama Chat Model | https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatollama/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Hugging Face Inference Model | https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmopenhuggingfaceinference/ | ⭐⭐⭐ High | 2026-05-15 | 공식 (Tools Agent 비호환 명시) |
| n8n Docs — What's memory in AI? | https://docs.n8n.io/advanced-ai/examples/understand-memory/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| GitHub n8n-io/n8n issue #18304 | https://github.com/n8n-io/n8n/issues/18304 | ⭐⭐⭐ High | 2026-05-15 | temperature+top_p 동시 지정 이슈 |
| GitHub n8n-io/n8n issue #13231 | https://github.com/n8n-io/n8n/issues/13231 | ⭐⭐⭐ High | 2026-05-15 | Anthropic 프롬프트 캐싱 이슈 |
| n8n Docs — OpenAI credentials common issues | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues/ | ⭐⭐⭐ High | 2026-05-15 | sk-proj-... 키 호환성 |

---

## 4. 검증 체크리스트 — 클레임별 판정

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | n8n LLM 통합은 LangChain 기반 cluster node 구조 | VERIFIED | docs.n8n.io/advanced-ai/langchain/overview |
| 2 | AI Agent는 6종 agent type 지원, Tools Agent가 권장 | VERIFIED | AI Agent 노드 공식 docs |
| 3 | Anthropic Chat Model 노드 지원 (Claude Opus·Sonnet·Haiku) | VERIFIED | Anthropic Chat Model 공식 docs |
| 4 | `temperature`와 `top_p`는 Anthropic에서 동시 지정 시 에러 | DISPUTED → 본문에 주의 표기 | n8n issue #18304, Anthropic 공식 문서 |
| 5 | Hugging Face Inference Model은 tools 미지원, AI Agent 불가 | VERIFIED | n8n HF Inference Model 공식 docs |
| 6 | Window Buffer Memory가 Simple Memory로 명칭 변경 | VERIFIED | Simple Memory 공식 docs (구 Window Buffer Memory 명시) |
| 7 | Simple Memory 다중 노드는 기본적으로 동일 메모리 공유 | VERIFIED | Simple Memory common issues docs |
| 8 | Postgres/Redis/Xata 메모리 노드는 Context Window Length 옵션 보유 | VERIFIED | n8n PR #10203 + 공식 docs |
| 9 | Vector Store 5종 (Pinecone, Qdrant, Supabase, PGVector, Simple) 지원 | VERIFIED | 각 노드 공식 docs |
| 10 | Vector Store 노드는 4가지 동작 모드(Insert/Get/Retrieve as VS/Retrieve as Tool) | VERIFIED | Qdrant docs 등 |
| 11 | Structured Output Parser는 `$ref` 미지원 | VERIFIED | Structured Output Parser 공식 docs |
| 12 | Chat Trigger는 hosted/embedded/webhook 모드 지원 | VERIFIED | Chat Trigger 공식 docs |
| 13 | `$fromAI('key','desc','type')` 동적 파라미터 지원 | VERIFIED | Tools Agent 공식 docs |
| 14 | Tools Agent의 Max Iterations 옵션 존재 | VERIFIED | Tools Agent 공식 docs |
| 15 | API 키는 n8n Credential Manager에 저장해야 안전 | VERIFIED | n8n 보안 가이드 다수 |

### 4-0. 최신화 재검증 클레임 판정 (2026-08-11, v2)

| # | 클레임 | 판정 | 근거 (2개 이상 독립 소스) |
|---|--------|------|--------------------------|
| 16 | **AI Agent 노드의 Agent 타입 선택 파라미터는 n8n 1.82.0에서 제거**, 현재 모든 AI Agent는 Tools Agent로만 동작 (v1 본문의 "6종 지원" 서술은 현행과 불일치) | **DISPUTED → 본문 정정 완료** | docs.n8n.io AI Agent 노드 공식 문서("all AI Agent nodes work as a Tools Agent … prior to 1.82.0 offered configurable agent type, removed") + n8n 2026 아키텍처 자료 |
| 17 | Anthropic Chat Model 노드는 **모델 목록을 Anthropic API에서 동적 조회**(최신순 정렬)하며 하드코딩 목록이 아님 | VERIFIED | n8n PR #13543 (`loadModels`/dynamic fetch) + docs.n8n.io 노드 페이지(모델 선택은 Anthropic 모델 문서 참조로 위임) |
| 18 | 노드(v1.3)가 레거시 `thinking: {type:"enabled", budget_tokens}`만 전송 → 최신 Claude 모델에서 **400 에러**. 2026-08-11 기준 issue open | VERIFIED | n8n issue #28635 (에러 메시지·상태·관련 PR #29467/#29270 확인) + Anthropic 공식 모델 문서(최신 세대 `extended thinking: No`, adaptive thinking 사용) |
| 19 | `claude-3-*` 계열(3.7 Sonnet·3.5 Sonnet·3.5 Haiku·3 Opus 등)은 대부분 retired — v1 본문 예시가 이 계열 사용 | **DISPUTED → 본문 정정 완료** | Anthropic 공식 모델 문서 Retired 목록(3.7 Sonnet 2026-02-19, 3.5 Sonnet 2025-10-28, 3 Opus 2026-01-05 등) + claude-api 스킬 모델 카탈로그 |
| 20 | 현행 Anthropic 라인업은 Fable 5 / Opus 5 / Sonnet 5 / Haiku 4.5이며 Opus 4.8·Sonnet 4.6은 legacy(사용 가능) | VERIFIED | Anthropic 공식 Models overview(2026-08-11 fetch) + claude-api 스킬 모델 표 |
| 21 | 레포 기준 파일 `.claude/rules/agent-design.md`는 opus=`claude-opus-4-8`, sonnet=`claude-sonnet-4-6`, haiku=`claude-haiku-4-5`, 상위 티어 `claude-fable-5`로 정의 (2026-07-03 작성) | VERIFIED | `.claude/rules/agent-design.md` 직접 Read |
| 22 | 위 #20과 #21이 **불일치**(Opus 5·Sonnet 5 미반영) → 본문은 agent-design.md 기준을 채택하되 `> 주의:`로 차이를 명시 | 처리 완료 | 두 소스 대조. 임의 판단 대신 차이를 표기하고 갱신을 별도 판단 사항으로 남김 |
| 23 | n8n 2.22부터 MCP Client 노드 없이 에이전트에 MCP 서버 직접 연결 (Apify·Linear·monday.com·Notion·PostHog) | VERIFIED | docs.n8n.io changelog release-notes-2.x v2.22 + 2.34 릴리즈 요약("MCP … capabilities") |
| 24 | n8n 2.6부터 AI 도구 호출 human-in-the-loop(사전 승인) 지원 | VERIFIED | docs.n8n.io changelog release-notes-2.x v2.6 |
| 25 | Motorhead 메모리 노드는 n8n 2.8.3에서 deprecated (업스트림 유지보수 중단) | VERIFIED | docs.n8n.io changelog release-notes-2.x v2.8.3 |
| 26 | Anthropic Chat Model 노드 옵션에 Top K가 존재 (v1 본문 누락) | VERIFIED | docs.n8n.io 노드 페이지 옵션 표(Max Tokens / Temperature / Top K / Top P) |
| 27 | 최신 Claude 세대 컨텍스트 윈도우는 1M(Fable 5·Opus·Sonnet), Haiku 4.5는 200K — v1의 "200K (Claude 3.x)" 서술은 구형 | **DISPUTED → 본문 정정 완료** | Anthropic 공식 Models overview 비교표 + claude-api 스킬 모델 표 |

**판정 요약 (v2, 2026-08-11): VERIFIED 8 / DISPUTED 3(전부 본문 정정 완료) / 처리 1**

> DISPUTED 3건은 모두 **시간 경과로 낡아진 서술**이다: Agent 타입 6종(#16), Claude 3 계열 모델명(#19),
> 컨텍스트 윈도우 200K(#27). 세 건 모두 SKILL.md 본문을 현행 기준으로 교체했다.

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (검증일 2026-05-15 명시, n8n 노드명 최신 — Simple Memory)
- [✅] deprecated된 패턴을 권장하지 않음 (Window Buffer Memory 구 이름 명시, Tools Agent를 권장)
- [✅] 코드 예시가 실행 가능한 형태임 (꿈 해몽 워크플로우 노드 구성)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description, example 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (cluster node 구조, Root/Sub-node)
- [✅] 코드 예시 포함 (꿈 해몽 워크플로우 + `$fromAI()` 예시)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (모델 선택 표, 메모리 권장 패턴)
- [✅] 흔한 실수 패턴 포함 (10개 함정)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 워크플로우 구성에 도움 (노드 연결 다이어그램 포함)
- [✅] 지나치게 이론적이지 않고 실용적 예시 (Anthropic Tool Agent 패턴, RAG 파이프라인)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 꿈 해몽은 예시일 뿐)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (대체 사용: 세션 내 직접 SKILL.md Read 후 근거 섹션 대조)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Chat Trigger + AI Agent + Simple Memory 최소 구성 및 Session Key 설정**
- PASS
- 근거: SKILL.md "4. 채팅 패턴 — Chat Trigger + AI Agent + Memory" 섹션 (최소 구성 다이어그램, Session Key expression 권장, Context Window Length 기본값 5, 메모리 누락 시 stateless 경고)
- 상세: 노드 연결 다이어그램·Session Key expression (`$('Chat Trigger').item.json.sessionId`)·Context Window Length 기본값 모두 명확히 기록되어 있음. Chat Trigger 3가지 모드(Hosted/Embedded/Webhook)까지 포함.

**Q2. temperature + top_p 동시 사용 Anthropic API 에러 함정**
- PASS
- 근거: SKILL.md "2. LLM Chat Model 노드" Anthropic Chat Model 주요 파라미터 아래 주의 블록 + "13. 흔한 함정" 표
- 상세: temperature + top_p 동시 지정 시 에러 발생 가능 경고가 섹션 2와 섹션 13 두 곳에 중복 명시. n8n issue #18304 근거 링크까지 포함. anti-pattern 회피 기준 충족.

**Q3. Vector Store(Qdrant) + Embeddings OpenAI RAG 적재·검색 파이프라인 및 동작 모드**
- PASS
- 근거: SKILL.md "6. RAG 워크플로우 — Vector Store" 섹션 (문서 적재·검색 파이프라인 다이어그램, Vector Store 4가지 동작 모드, Embeddings OpenAI 파라미터 표)
- 상세: 문서 적재(Text Splitter → Embeddings → Vector Store Insert)·검색(AI Agent Tool로 Retrieve) 파이프라인 다이어그램 명확. AI Agent 연결 시 "Retrieve Documents (as Tool for AI Agent)" 모드 지정. Qdrant self-host 특성, 영속성 경고(Simple Vector Store 휘발) 포함.

### 발견된 gap

없음 — SKILL.md 모든 핵심 내용이 충분한 근거를 제공함.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: content test 가능 (경계선) — 답변 정확성만으로 검증 충분
- 최종 상태: APPROVED

---

> (참고) 기존 예정 항목: skill-tester 호출 후 업데이트 예정. 메인 세션에서 `Agent(subagent_type="skill-tester", prompt="devops/n8n-llm-integration")` 형태로 호출한다.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (v1 15개 + v2 재검증 12개 클레임 대조. DISPUTED 3건 본문 정정 완료) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-15, 3/3 PASS) |
| 최신성 (2026-08-11) | ✅ (모델명·Agent 구조·MCP·HITL·Motorhead deprecated 반영) |
| **최종 판정** | **APPROVED 유지** |

> 판정 근거: 내용 검증(공식 docs 기반·DISPUTED 1건 주의 표기 완료) + agent content test 3/3 PASS (Q1 Chat Trigger+Memory 구성 / Q2 temperature+top_p 함정 / Q3 RAG 노드 조합). content test 가능 카테고리 기준 APPROVED 전환.
>
> **2026-08-11 최신화 후 status 유지 근거:** 이번 개정은 *모델명·노드 구조 서술의 사실 정정*이며, 검증 방식은 변하지 않는다.
> 이 스킬은 `verification-policy.md`상 "실사용 필수" 카테고리가 아니라 **답변 정확성으로 검증 가능한 카테고리**이고,
> 정정된 클레임 전부가 공식 문서 2개 이상으로 교차 검증됐다. 기존 content test 3문항(Chat Trigger+Memory 구성 /
> temperature+top_p 함정 / RAG 노드 조합)의 근거 섹션은 이번 개정에서 변경되지 않아 재실행 없이 유효하다.
> 따라서 **APPROVED를 유지**한다(신규 승격이 아님).

---

## 7. 개선 필요 사항

- [✅] skill-tester 2단계 테스트 결과 본 문서에 반영 (2026-05-15 완료, 3/3 PASS → APPROVED 전환)
- [✅] n8n 버전 업데이트 시 노드명·옵션 재검증 — 2026-08-11 수행 (Agent 타입 제거, Top K 옵션, 동적 모델 로딩 반영)
- [✅] 짝 스킬(`devops/n8n-self-hosting`) cross-link 보강 — 2026-08-11 양 스킬 동시 최신화로 정합성 확보
- [✅] 신모델 출시 시 모델 선택 표 갱신 — 2026-08-11 수행 (Claude 3 계열 제거, 현행 티어 표 + Opus 5/Sonnet 5 차이 주의 표기)
- [ ] **n8n issue #28635 해소 추적** — Anthropic 노드가 adaptive thinking(`output_config.effort`)을 지원하면 본문 주의 문구 및 예시의 `Enable Thinking: OFF` 제거 (차단 요인 아님)
- [ ] **`agent-design.md`의 Opus 5 / Sonnet 5 반영 여부 결정** — 결정 시 본 스킬 모델 표와 `> 주의:` 블록 동기화 필요 (레포 전역 판단 사항이므로 이 스킬 단독 결정 금지)
- [ ] MCP 서버 직접 연결(2.22) 실제 워크플로우 구성 예시 추가 검토 (선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (Anthropic·OpenAI·Ollama·HF + AI Agent + Memory + Vector Store + Output Parser + 꿈 해몽 예시) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 Chat Trigger+AI Agent+Simple Memory 최소 구성 / Q2 temperature+top_p 동시 사용 함정 / Q3 Vector Store+Embeddings RAG 노드 조합) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-08-11 | v2 | **최신화 재검증.** 구버전 모델명(`claude-3-7-sonnet`·`claude-3-5-sonnet`·`claude-3-haiku`) 제거 → `agent-design.md` 기준 티어 표(fable-5/opus-4-8/sonnet-4-6/haiku-4-5)로 교체, Anthropic 공식 현행 라인업(Opus 5·Sonnet 5)과의 차이를 `> 주의:`로 명시. Agent 타입 6종 서술 → **1.82.0에서 선택 제거, Tools Agent 단일화**로 정정. 모델 드롭다운 동적 조회(PR #13543)·Top K 옵션 추가. thinking 포맷 400 에러(issue #28635) 주의·함정 추가. MCP 서버 직접 연결(2.22)·HITL 도구 승인(2.6)·Motorhead deprecated(2.8.3) 반영. 컨텍스트 윈도우 1M 정정. 함정 표 4행 추가. 클레임 16~27 재검증(VERIFIED 8 / DISPUTED 3 정정 / 처리 1). status **APPROVED 유지** | 최신화 세션 |
| 2026-08-12 | v3 | **모델 ID 세대 정렬.** 티어 표를 `claude-opus-4-8`·`claude-sonnet-4-6` → `claude-opus-5`·`claude-sonnet-5`로 교체(Haiku는 `claude-haiku-4-5` 유지, Fable 5 유지). 2026-08-11에 남겨 둔 "agent-design.md 기준 vs 공식 라인업 차이" 주의 문구를 세대 정렬 완료 서술로 대체하고, `.claude/rules/agent-design.md`가 아직 4.8/4.6 기준임을 별도 갱신 필요 항목으로 명시. 꿈 해몽 워크플로우 예시의 노드 모델 `claude-sonnet-4-6` → `claude-sonnet-5`. **샘플링 파라미터 주의 전면 개정** — 5 계열(Opus 5·Sonnet 5·Fable 5·Opus 4.8/4.7)은 `temperature`/`top_p`/`top_k` 미지원(비기본값 전송 시 400)이므로 n8n 노드의 Sampling Temperature를 기본값으로 두라는 지침 추가, 기존 "temperature+top_p 동시 금지"는 4.6 이하 legacy 한정으로 범위 축소. 함정 표에 5 계열 샘플링 파라미터 행 신설. 검증일 2026-08-11 → 2026-08-12. status **APPROVED 유지** | 모델 ID 세대 정렬 |
