---
skill: n8n-llm-integration
category: devops
version: v3.3
date: 2026-11-11
status: APPROVED
---

# n8n LLM Integration — 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `n8n-llm-integration` |
| 스킬 경로 | `.claude/skills/n8n-llm-integration/SKILL.md` |
| 검증일 | **2026-11-11** (재검증, 이전 2026-11-06 · 2026-09-28) — 최초 작성 2026-05-15 |
| 검증자 | skill-creator (최초) → 최신화 재검증(2026-08-11, 2026-08-12, 2026-09-25) → 2차 재검증(2026-09-28) → 3차 재검증(2026-11-06) |
| 스킬 버전 | v3.3 |
| 대상 버전 | n8n v2.x — 2026-11-06 기준 npm latest **v2.46.6** (Anthropic Chat Model 노드 defaultVersion 1.6) |
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
| n8n 소스 `LmChatAnthropic.node.ts` (master) | https://github.com/n8n-io/n8n/blob/master/packages/@n8n/nodes-langchain/nodes/llms/LMChatAnthropic/LmChatAnthropic.node.ts | ⭐⭐⭐ High | 2026-11-06 | sampling 파라미터 모델별 분기, Thinking Mode 매핑, typeVersion 1.6 |
| n8n `pnpm-workspace.yaml` | https://github.com/n8n-io/n8n/blob/master/pnpm-workspace.yaml | ⭐⭐⭐ High | 2026-11-06 | catalog `@langchain/anthropic` 1.5.6 |
| npm `@langchain/anthropic@1.5.6` | https://registry.npmjs.org/@langchain/anthropic/1.5.6 | ⭐⭐⭐ High | 2026-11-06 | `@anthropic-ai/sdk` ^0.115.0 |
| npm `n8n` latest | https://registry.npmjs.org/n8n/latest | ⭐⭐⭐ High | 2026-11-06 | 2.46.6 |
| Anthropic Models overview | https://platform.claude.com/docs/en/about-claude/models/overview | ⭐⭐⭐ High | 2026-11-06 | 현행 4종·Legacy 목록 |
| Claude Sonnet 5.5 / Haiku 5.5 개요 | https://platform.claude.com/docs/en/models/sonnet-5-5/overview · https://platform.claude.com/docs/en/models/haiku-5-5/overview | ⭐⭐⭐ High | 2026-11-06 | 가격·출시일·thinking·sampling |
| Anthropic API versions / migration-2026-10-21 | https://platform.claude.com/docs/en/api/versioning · https://platform.claude.com/docs/en/api/migration-2026-10-21 | ⭐⭐⭐ High | 2026-11-06 | `2026-10-21` sampling 파라미터 전 모델 400 |
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

**2026-11-06 재검증 클레임**

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 28 | ~~Haiku 는 `claude-haiku-4-5` 가 계속 현행~~ (SKILL.md 구 90행) | **DISPUTED → 본문 정정** | 현행 Haiku = `claude-haiku-5-5`(2026-10-07), Haiku 4.5·Sonnet 5 는 Legacy — models overview + Haiku 5.5 개요 |
| 29 | 현행 4종 ID·가격: Fable 5.2 `claude-fable-5-2` $8/$40(2026-11-11 갱신, Fable 5.1 $10/$50 은 Legacy), Opus 5.5 $4/$20, Sonnet 5.5 $2/$10, Haiku 5.5 $0.10/$0.50(10만 토큰 초과 $0.50/$2.50), 전부 1M | VERIFIED | models overview + Sonnet 5.5·Haiku 5.5 개요(독립 페이지 일치) |
| 30 | API `2026-10-21` 에서 `temperature`/`top_p`/`top_k` 는 모든 모델 400(기본값 포함). `2023-06-01` 계속 유효 | VERIFIED | versioning 페이지 + migration-2026-10-21 |
| 31 | n8n Anthropic Chat Model 노드는 `modelSupportsSamplingParams()` 로 구모델(`claude-sonnet-4*`·`claude-haiku-4*`·`claude-opus-4`~`4-6`·`claude-3*`·`claude-2` 등)에만 Temperature(UI 기본 0.7)·Top K(-1)·Top P(1)를 보내고 그 밖의 `claude-*` 에는 보내지 않는다 | VERIFIED (소스 1차) | n8n master `LmChatAnthropic.node.ts` 소스 직접 확인 — 공식 문서에는 이 분기 서술 없음 |
| 32 | 노드 Thinking Mode=Disabled 는 `thinking:{type:'disabled'}` 를 전송, 옵션 미설정이면 필드 생략. Adaptive 는 `thinking:{type:'adaptive'}`+`output_config.effort`(기본 medium) | VERIFIED (소스 1차) | 같은 소스 파일 |
| 33 | Opus 5.5·Sonnet 5.5 는 `thinking:{type:'disabled'}` 400 (Sonnet 5.5 는 `between_tools` 대체) | VERIFIED | Sonnet 5.5 개요 "lowest thinking setting is between_tools", claude-api 공식 스킬 Opus 5.5 breaking changes |
| 34 | 노드 typeVersion 1~1.6, defaultVersion 1.6 / n8n npm latest 2.46.6 | VERIFIED | 소스 파일 + registry.npmjs.org/n8n/latest |
| 35 | 노드 SDK: `@langchain/anthropic` 1.5.6(catalog) → `@anthropic-ai/sdk ^0.115.0` → 0.x 이므로 `anthropic-version: 2023-06-01` 전송 | VERIFIED (의존성 체인) — 단 실제 lockfile 해석 버전·헤더 값은 직접 관측하지 않음 | n8n `pnpm-workspace.yaml` + npm registry `@langchain/anthropic@1.5.6` + migration 가이드("Earlier SDK versions sent 2023-06-01") |
| 36 | n8n 이 SDK 1.x 로 올리면 legacy 4.x 모델 temperature 도 400 | UNVERIFIED (향후 동작 추정) → SKILL.md `주의: 미검증` 표기 | — |

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
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 skill-tester 수행, 2026-09-28 재테스트 수행, 2026-11-06 3차 재시험 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-15 3/3 PASS, 2026-09-28 2/2 PASS, 2026-11-06 3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음 — 경미한 보강 후보만 발견)

---

## 5. 테스트 진행 기록

**수행일**: 2026-11-06
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미설치로 대체 사용, 동시 실행 한도로 1회 호출에 질문 3개 일괄 답변)
**수행 방법**: 3차 재검증(티어 표 Sonnet 5.5·Haiku 5.5·가격, 노드 sampling 분기, Thinking Disabled 400, SDK 체인) 반영분을 겨냥해 SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션·줄 번호 대조 및 anti-pattern 회피 확인

### 실제 수행 테스트 (2026-11-06)

**Q1. claude-sonnet-5-5 + Sampling Temperature 0.2 가 전송되는가 / Thinking Mode Disabled 결과와 올바른 설정**
- ✅ PASS
- 근거: SKILL.md §2 "주의 — 샘플링 파라미터" 블록 + "주의 — Opus 5.5·Sonnet 5.5·Fable 5.1 선택 시" 블록 + §12 노드 구성 + §13 함정 표 Thinking Disabled 행
- 상세: 현행 5 계열에는 노드가 Temperature를 전송하지 않아 무시됨(`modelSupportsSamplingParams` 분기), Disabled 선택 시 `thinking:{type:'disabled'}` 전송으로 400, 비우거나 Adaptive 로 설정 — 모두 정확. anti-pattern(현행 모델에 temperature 적용, Disabled 권장) 회피.

**Q2. 경량 라우팅 모델 ID·가격, SDK 체인과 anthropic-version, 향후 변경 가능성**
- ✅ PASS
- 근거: SKILL.md §2 모델 티어 표(`claude-haiku-5-5`, $0.10/$0.50, 10만 토큰 초과 $0.50/$2.50) + 샘플링 주의 블록(`@langchain/anthropic` 1.5.6 → `@anthropic-ai/sdk` ^0.115.0 → `2023-06-01`) + §10 모델 라우팅
- 상세: Haiku 4.5 를 현행으로 답하는 구 오답 없음. SDK 1.x 전환 영향은 SKILL.md 의 "주의: 미검증" 표기를 그대로 인용해 확정 서술을 피함.

**Q3. HTTP Request 노드 `anthropic-version: 2026-10-21` + temperature/top_p 전송**
- ✅ PASS
- 근거: SKILL.md §2 샘플링 주의 블록 후반부 + §13 함정 표(HTTP Request 노드 sampling 행, 4.6 이하 legacy 한정 행)
- 상세: 2026-10-21 에서는 모든 모델 400, 본문에서 세 파라미터 제거, 결정성은 `output_config.format` + 낮은 `output_config.effort`. "temperature/top_p 중 하나만" 규칙은 legacy+2023-06-01 한정임을 정확히 구분.

### 발견된 gap (있으면)

- (경미) SKILL.md §2 thinking 해결됨 블록(110줄 부근)에 "2026-09-28 기준 npm latest v2.40.7" 이 남아 있어 상단 메타(2.46.6)와 시점이 어긋남 — 과거 기준 서술이라 오류는 아니나 선택 정리 후보.
- (경미) `output_config.effort` 구체 값(low/medium/high)·`output_config.format` 요청 JSON 예시 없음 — 선택 보강.
- (경미) §14 표가 스킬을 `devops/n8n-llm-integration` 으로 표기(카테고리/이름 표기) — 영향 없음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: content test 가능 (경계선) — 실사용 필수 카테고리 아님
- 최종 상태: APPROVED

---

> (2026-09-28 기록, 참고용 보존)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미설치로 대체 사용)
**수행 방법**: 2026-09-28 2차 재검증(§섹션 5 "[2026-09-28] 재검증(2차)" 블록)에서 보강·정정된 내용(Publish 배포 모델, Code 노드 `$env` 기본 차단 정책 정정, thinking 함정 해결 상태)을 겨냥해 SKILL.md Read 후 실전 질문 2개 답변, 근거 섹션 대조 및 형제 스킬(n8n-self-hosting, n8n-workflow-design) 교차 일치 확인

### 실제 수행 테스트 (2026-09-28)

**Q1. 새로 만든 Webhook 챗봇 워크플로우를 Save만 했는데 외부 호출이 안 되는 원인 + Code 노드에서 `$env`로 API 키를 직접 읽어써도 되는지 + 형제 스킬과 모순 여부**
- ✅ PASS
- 근거: SKILL.md §4 "주의 — Publish 필요" + §12 예시 마지막 줄 + §13 함정 표("Save만 하고 Publish 안 함") / §11 안전 가드 "Code 노드 `$env` 접근" 행 + §13 함정 표
- 상세: Save와 Publish의 구분, Shift+P 단축키, 2.0 업그레이드 이전 활성 워크플로우는 자동 마이그레이션되는 예외까지 정확히 답변. `$env` 기본 차단(2026-09-28 메인 정정 반영분)도 정확히 인용했고, n8n-self-hosting SKILL.md(§5 주의문)·n8n-workflow-design SKILL.md(§Credentials 주의문)를 직접 Grep/Read로 대조한 결과 세 스킬 모두 "`N8N_BLOCK_ENV_ACCESS_IN_NODE` 기본값 true = Code 노드 접근 차단, 표현식은 영향 없음"으로 완전히 일치함을 skill-tester가 재확인. 에이전트 자체 보고 gap: n8n-workflow-design은 메인 스킬의 "동일" 서술만 신뢰하고 직접 대조하지 않았다고 자백했으나, skill-tester가 별도로 Grep 대조하여 실제 일치를 확인함(gap 해소).

**Q2. n8n 2.20.0 이상에서 Anthropic Chat Model + thinking 조합이 아직도 400을 내는지**
- ✅ PASS
- 근거: SKILL.md §2 "해결됨 — thinking 파라미터" 인용 블록 + §12 예시 Thinking Mode 주석
- 상세: 2.20.0/typeVersion 1.5 + Adaptive 선택 조합이면 해결됨, 레거시 인스턴스(2.20.0 미만)·Manual(Deprecated) 선택 시에는 여전히 함정이라는 조건부 결론까지 정확히 도출. "미해결→해결됨" 정정이 답변에 제대로 반영됨(구 내용 잔존 없음).

### 발견된 gap

- (경미) Q1 답변에서 에이전트가 n8n-workflow-design SKILL.md를 직접 열지 않고 메인 스킬의 "동일" 서술을 신뢰했다고 자체 보고 — skill-tester가 별도 Grep으로 재확인해 실제 일치 확인, SKILL.md 자체의 결함은 아님.
- (경미) §2 "Opus 5.5·Fable 5.1 선택 시" 주의(tool_choice 강제·thinking *비활성화* 400)와 "해결됨 — thinking 파라미터"(thinking *활성화* 시 포맷 400) 두 항목이 섹션상 인접해 혼동 소지가 있다고 에이전트가 지적 — 실질 오류는 아니며 두 항목이 다루는 대상(비활성화 vs 활성화 포맷)이 다름을 명확히 하는 소제목 보강을 선택 검토할 수 있음.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: content test 가능 (경계선) — 실사용 필수 카테고리 아님, 답변 정확성만으로 검증 충분
- 최종 상태: APPROVED

---

> (2026-05-15 원 기록, 참고용 보존)

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

### [2026-09-28] 재검증(2차) — n8n 2.40.x 버전 갱신 + Publish 배포 모델·Code 노드 `$env` 차단 정책 보강 + thinking 함정 해소 반영

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임을 1차 소스(npm registry, docs.n8n.io, support.n8n.io, GitHub n8n-io/n8n)와 대조, 보강·정정 검토

**클레임 대조 결과**:
1. n8n 최신 버전이 2.40.x대라는 제보 → **VERIFIED**. `curl https://registry.npmjs.org/n8n/latest` 결과 `2.40.7` (npm registry, 1차 소스). 기존 본문의 "2.33.7/2.34.4"는 낡은 값이라 "2026-09-28 기준 npm latest v2.40.7"로 정정.
2. n8n 2.x의 워크플로우 배포가 Active 토글만으로 충분한지 → **DISPUTED(보강 필요) → 본문 정정 완료**. 공식 문서(docs.n8n.io/build/understand-workflows/save-and-publish-workflows)와 지원 문서(support.n8n.io "Understanding Workflow Publishing in n8n 2.0")에 따르면 n8n 2.0부터 **Active 토글이 Publish 버튼으로 대체**됐다 — Save는 저장만, Publish를 눌러야 해당 버전이 운영에 반영되고 Webhook/Chat Trigger 프로덕션 URL·스케줄이 동작한다. 2.0 업그레이드 이전 활성 워크플로우는 자동으로 published로 마이그레이션된다. 기존 SKILL.md는 이 배포 모델을 전혀 언급하지 않아 누락이었으므로 §4·§12·§13에 보강했다.
3. Code 노드에서 `$env`(환경변수) 접근이 기본적으로 차단되어 있는지 → **VERIFIED(보강 필요) → 본문 보강 완료**. 공식 문서(docs.n8n.io …/use-environment-variables/security, HTML 원문 직접 확인)에 `N8N_BLOCK_ENV_ACCESS_IN_NODE | Boolean | false | Whether to allow users to access environment variables in expressions and the Code node (false) or not (true).`로 명시 — **셀프호스트 기본값은 `false`(차단 아님, 접근 허용)**다. n8n Cloud는 이보다 엄격한 기본 제한이 있다는 커뮤니티 보고가 있으나 공식 문서에 수치로 명시돼 있지 않아 그 부분은 `> 주의: 미검증`으로 남겼다. 기존 SKILL.md는 이 항목을 전혀 다루지 않아 §11·§13에 신규 보강했다.
   - **[2026-09-28 메인 정정 — 위 판정은 DISPUTED]** 위 security 참조 표는 2.0 이전 기본값이 남은 문서 드리프트다. 공식 v2.0 breaking changes(https://docs.n8n.io/changelog/v20-breaking-changes.md)는 "`N8N_BLOCK_ENV_ACCESS_IN_NODE` … now `true` — n8n will block access to environment variables from the Code node by default"라고 명시하고, 일반 노드 필드 표현식은 영향 없다고 적는다(WebFetch 직접 확인). 형제 스킬 n8n-self-hosting·n8n-workflow-design·n8n-webhook-patterns도 같은 날 이 문서로 `true`를 확인했다. → SKILL.md §11·§13을 "2.0+ Code 노드 기본 차단(`true`), 표현식은 영향 없음"으로 정정.
4. n8n issue #28635(Anthropic Chat Model 노드가 레거시 `thinking: {type:"enabled"}` 포맷만 전송해 최신 모델과 조합 시 400) 현재 상태 → **DISPUTED → 본문 정정 완료**. GitHub에서 직접 확인 결과 이 이슈는 **PR #29467로 closed**됐다(2026-04-30 머지, n8n 2.20.0 릴리즈 2026-05-05 반영). typeVersion 1.5 노드부터 `Thinking Mode` UI가 `Disabled`/`Adaptive (Recommended)`/`Manual (Deprecated)` 3종으로 바뀌었고 Adaptive 선택 시 `thinking.type:"adaptive"` + `output_config.effort`를 전송한다. 기존 SKILL.md(v3.1)가 "2026-08-11 기준 open"이라고 서술한 것은 낡은 정보였으므로 §2·§12·§13을 "해결됨" 서술로 정정하되, 2.20.0 미만/typeVersion 1.4 이하 레거시 인스턴스에는 여전히 해당 함정이 남아 있음을 유지했다(레거시 경고 축소 금지 원칙 준수).

**보강(ADD)·축소**:
- 보강 3건: (1) Publish 배포 모델 — §4에 `> 주의` 블록, §12 핵심 포인트에 1줄, §13 함정 표에 1행 추가. (2) Code 노드 `$env` 차단 정책 — §11 안전 가드 표에 1행, §13 함정 표에 1행 추가. (3) thinking 관련 서술을 "미해결 함정"에서 "해결됨 + 레거시 조건부 함정"으로 갱신(§2 주의 블록·§2 파라미터 표 행·§12 예시·§13 함정 표).
- 정정 1건: 대상 버전 2.33.7/2.34.4 → npm latest 2.40.7.
- 축소: 없음 (레거시 경고·안전 가드·함정 목록 모두 보존 또는 확장).

**실전 질문 재검증**:
- Q1. "n8n에서 새로 만든 Webhook 챗봇 워크플로우를 저장했는데 외부에서 호출이 안 된다. 왜?" → SKILL.md §4 "주의 — Publish 필요" + §12 "핵심 포인트" 마지막 줄 + §13 함정 표 "Save만 하고 Publish 안 함" 근거로 PASS (Save와 Publish 구분, Shift+P 단축키까지 답변 가능)
- Q2. "Code 노드에서 `process.env`나 `$env`로 API 키를 그대로 읽어써도 되는가?" → SKILL.md §11 "Code 노드 `$env` 접근" + §13 함정 표 근거로 PASS (초안 답변은 "기본 허용"이었으나 메인 정정 후 기준은 "2.0+ Code 노드 기본 차단 + Credential 권고 + 필요 시 `=false` 명시" — skill-tester 재테스트에서 재확인 필요)
- Q3. "Anthropic Chat Model 노드에서 최신 Claude 모델 쓰면서 thinking 켜면 아직도 400 나나?" → SKILL.md §2 "해결됨 — thinking 파라미터" 블록 근거로 PASS (2.20.0/typeVersion 1.5부터 Adaptive Thinking Mode로 해결됐고, 구버전 인스턴스에서만 여전히 함정이라는 조건부 답변까지 가능)

**재검증 최종 판정**: status **PENDING_TEST 전환** (Publish 배포 모델·Code 노드 `$env` 차단 정책이라는 신규 보강 내용이 있고, thinking 함정 서술이 "미해결→해결됨"으로 실질 정정됐으므로 skill-tester를 통한 agent content test 재실행을 권장한다. 위 Q1~Q3는 이 세션 내 자체 재검증이며 verification-policy.md 2단계 skill-tester 호출을 대체하지 않는다.)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (v1 15개 + v2 재검증 12개 + 2026-09-28 2차 재검증 4개 클레임 대조. DISPUTED 3건(v2) + 2건(2차: 버전·thinking) 본문 정정 완료) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (**2026-11-06 3차 재시험 3/3 PASS** — 노드 sampling 미전송·Thinking Disabled 400·Haiku 5.5 가격/SDK 체인·API 2026-10-21 HTTP 호출) + (2026-05-15 3/3 PASS + **2026-09-28 skill-tester 재테스트 2/2 PASS** — Publish 배포 모델·Code 노드 `$env` 차단 정책 정정분·thinking 해결 상태 겨냥, 형제 스킬 교차 일치 확인) |
| 최신성 (2026-09-28) | ✅ (n8n npm latest 2.40.7 반영, Publish 배포 모델·Code 노드 `$env` 차단 정책 신규 보강, thinking 함정 해결 상태 반영) |
| **최종 판정** | **APPROVED** |

> 판정 근거: 내용 검증(공식 docs·npm registry·GitHub 1차 소스 기반) + 2026-05-15 agent content test 3/3 PASS (Q1 Chat Trigger+Memory 구성 / Q2 temperature+top_p 함정 / Q3 RAG 노드 조합)에 더해
> **2026-09-28 skill-tester(general-purpose 대체) 재테스트 2/2 PASS**로 신규 보강분(Publish 배포 모델, Code 노드 `$env` 차단 정책 정정, thinking "해결됨" 정정)까지 검증 완료.
> **2026-11-06 3차 재검증 후 skill-tester 재시험 3/3 PASS**로 모델 티어·sampling·Thinking Disabled·SDK 체인 정정분까지 검증 완료.
> 카테고리 분류가 "content test 가능(경계선)" — 실사용 필수 카테고리가 아니므로 PASS로 **APPROVED 유지**한다.

---

## 7. 개선 필요 사항

- [✅] skill-tester 2단계 테스트 결과 본 문서에 반영 (2026-05-15 완료, 3/3 PASS → APPROVED 전환)
- [✅] n8n 버전 업데이트 시 노드명·옵션 재검증 — 2026-08-11 수행 (Agent 타입 제거, Top K 옵션, 동적 모델 로딩 반영)
- [✅] 짝 스킬(`devops/n8n-self-hosting`) cross-link 보강 — 2026-08-11 양 스킬 동시 최신화로 정합성 확보
- [✅] 신모델 출시 시 모델 선택 표 갱신 — 2026-08-11 수행 (Claude 3 계열 제거, 현행 티어 표 + Opus 5/Sonnet 5 차이 주의 표기)
- [✅] (2026-09-28 해소) **n8n issue #28635 해소 추적** — GitHub 확인 결과 PR #29467로 closed, n8n 2.20.0/typeVersion 1.5부터 Adaptive Thinking Mode 지원. 본문 주의 문구·예시(`Enable Thinking: OFF` → `Thinking Mode: Disabled`)·함정 표 전부 "해결됨 + 레거시 조건부" 서술로 갱신
- [✅] (2026-09-25 해소 — agent-design.md가 Opus 5.5/Fable 5.1 기준으로 갱신되어 본 스킬 표와 일치) **`agent-design.md`의 Opus 5 / Sonnet 5 반영 여부 결정** — 결정 시 본 스킬 모델 표와 `> 주의:` 블록 동기화 필요 (레포 전역 판단 사항이므로 이 스킬 단독 결정 금지)
- [✅] **(2026-11-06 완료)** 3차 재검증 정정분(Sonnet 5.5·Haiku 5.5 티어/가격, 노드 sampling 미전송, Thinking Disabled 400, SDK 체인 2023-06-01) skill-tester 재시험 — general-purpose 대체 수행, 3/3 PASS, APPROVED 유지
- [ ] SKILL.md §2 thinking 해결됨 블록의 "2026-09-28 기준 npm latest v2.40.7" 문구를 현행(2.46.6) 기준으로 정리 (선택 보강 — 차단 요인 아님, 2026-11-06 재시험에서 발견)
- [ ] `output_config.effort` 값 예시·`output_config.format` 요청 JSON 예시 추가 (선택 보강 — 차단 요인 아님)
- [ ] MCP 서버 직접 연결(2.22) 실제 워크플로우 구성 예시 추가 검토 (선택 보강 — 차단 요인 아님)
- [✅] **(2026-09-28 완료)** 2026-09-28 보강분(Publish 배포 모델, Code 노드 `$env` 차단 정책) skill-tester 2단계 재테스트 — general-purpose 대체 수행, 2/2 PASS, APPROVED 전환
- [ ] n8n Cloud의 `N8N_BLOCK_ENV_ACCESS_IN_NODE` 기본값(셀프호스트와 다르다는 커뮤니티 보고가 있으나 공식 문서 수치 미확인) 추가 검증 — 선택 보강, 차단 요인 아님(현재 `> 주의: 미검증`으로 표기 유지)
- [ ] 2026-04 n8n이 도입한 **1차 MCP 서버(instance-level, 워크플로우를 MCP 도구로 노출)** 기능은 본 스킬 §5의 "MCP 서버 직접 연결(2.22)"과 별개 기능이므로, 필요 시 별도 절 신설 검토 (이번 재검증 범위 밖 — 확인만 하고 반영 안 함)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (Anthropic·OpenAI·Ollama·HF + AI Agent + Memory + Vector Store + Output Parser + 꿈 해몽 예시) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 Chat Trigger+AI Agent+Simple Memory 최소 구성 / Q2 temperature+top_p 동시 사용 함정 / Q3 Vector Store+Embeddings RAG 노드 조합) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-08-11 | v2 | **최신화 재검증.** 구버전 모델명(`claude-3-7-sonnet`·`claude-3-5-sonnet`·`claude-3-haiku`) 제거 → `agent-design.md` 기준 티어 표(fable-5/opus-4-8/sonnet-4-6/haiku-4-5)로 교체, Anthropic 공식 현행 라인업(Opus 5·Sonnet 5)과의 차이를 `> 주의:`로 명시. Agent 타입 6종 서술 → **1.82.0에서 선택 제거, Tools Agent 단일화**로 정정. 모델 드롭다운 동적 조회(PR #13543)·Top K 옵션 추가. thinking 포맷 400 에러(issue #28635) 주의·함정 추가. MCP 서버 직접 연결(2.22)·HITL 도구 승인(2.6)·Motorhead deprecated(2.8.3) 반영. 컨텍스트 윈도우 1M 정정. 함정 표 4행 추가. 클레임 16~27 재검증(VERIFIED 8 / DISPUTED 3 정정 / 처리 1). status **APPROVED 유지** | 최신화 세션 |
| 2026-08-12 | v3 | **모델 ID 세대 정렬.** 티어 표를 `claude-opus-4-8`·`claude-sonnet-4-6` → `claude-opus-5`·`claude-sonnet-5`로 교체(Haiku는 `claude-haiku-4-5` 유지, Fable 5 유지). 2026-08-11에 남겨 둔 "agent-design.md 기준 vs 공식 라인업 차이" 주의 문구를 세대 정렬 완료 서술로 대체하고, `.claude/rules/agent-design.md`가 아직 4.8/4.6 기준임을 별도 갱신 필요 항목으로 명시. 꿈 해몽 워크플로우 예시의 노드 모델 `claude-sonnet-4-6` → `claude-sonnet-5`. **샘플링 파라미터 주의 전면 개정** — 5 계열(Opus 5·Sonnet 5·Fable 5·Opus 4.8/4.7)은 `temperature`/`top_p`/`top_k` 미지원(비기본값 전송 시 400)이므로 n8n 노드의 Sampling Temperature를 기본값으로 두라는 지침 추가, 기존 "temperature+top_p 동시 금지"는 4.6 이하 legacy 한정으로 범위 축소. 함정 표에 5 계열 샘플링 파라미터 행 신설. 검증일 2026-08-11 → 2026-08-12. status **APPROVED 유지** | 모델 ID 세대 정렬 |
| 2026-09-25 | v3.1 | **모델 ID 현행화(Opus 5.5/Fable 5.1).** 티어 표 `claude-fable-5` → `claude-fable-5-1`, `claude-opus-5` → `claude-opus-5-5`(단가 열 추가: $10/$50·$4/$20·$2/$10·$1/$5). "agent-design.md 별도 갱신 필요" 문구를 일치 서술로 교체하고 Fable 5/Opus 5를 legacy 목록에 편입. Opus 5.5·Fable 5.1의 강제 `tool_choice`/thinking disabled 400 주의 추가(n8n 노드 내부 동작은 미확인 표기). 샘플링 파라미터 주의·함정 표·컨텍스트 행에 Opus 5.5·Fable 5.1 포함. Claude 3 계열 금지 목록은 레거시 경고라 유지. 내용 재검증 없음 — status APPROVED 유지 | 모델 ID 현행화 |
| 2026-09-25 | v3.1 | 교차 참조 조건부 표기 (내용 변경 없음) | Claude (Sonnet 5) |
| 2026-09-28 | v3.2 | **2차 재검증.** npm registry로 n8n 최신 버전 확인(2.40.7, 기존 2.33.7/2.34.4 정정). 신규 보강 2건: Publish 배포 모델(n8n 2.0부터 Active 토글 → Publish 버튼, §4·§12·§13), Code 노드 `$env` 접근 기본 정책(§11·§13 — 초안은 security 참조 표를 근거로 `false`=허용으로 적었으나 메인이 v2.0 breaking changes 원문으로 **`true`=Code 노드 기본 차단**으로 정정, 형제 n8n 스킬 3종과 일치). 정정 1건: n8n issue #28635(thinking 포맷 400)는 PR #29467로 해결됨(n8n 2.20.0/typeVersion 1.5, Adaptive Thinking Mode) — "미해결 함정" 서술을 "해결됨 + 2.20.0 미만 레거시 조건부 함정"으로 전면 개정(§2·§12·§13). 축소 없음. 검증일 4곳(SKILL.md 인용·본 표·frontmatter·본 행) 동기화. status **PENDING_TEST 전환**(신규 보강분 skill-tester 재테스트 필요) | 2차 재검증(devops 전수 재검증 배치) |
| 2026-09-28 | v3.2 | **2단계 실사용 테스트 재수행(skill-tester → general-purpose).** Q1 Save-vs-Publish + Code 노드 `$env` 차단 정책 + 형제 스킬(n8n-self-hosting·n8n-workflow-design) 교차 일치 확인 / Q2 thinking 400 해결 상태 → 2/2 PASS. 카테고리 "content test 가능(경계선)"이므로 **APPROVED 전환** | skill-tester |
| 2026-11-06 | v3.3 | **3차 재검증 — 모델·API 2026-10-21·노드 소스 확인.** ① 티어 표 `claude-sonnet-5` → **`claude-sonnet-5-5`**, `claude-haiku-4-5` → **`claude-haiku-5-5`**($0.10/$0.50, 10만 토큰 초과 $0.50/$2.50), "Haiku 4.5 계속 현행" 오류 정정(#28) ② 샘플링 파라미터 주의 전면 개정 — n8n 노드 소스 직접 확인 결과 현행 모델에는 Temperature/Top K/Top P 를 **보내지 않음**(구 서술 "노드가 그대로 전송" 정정, #31), API 2026-10-21 전 모델 400, 노드 SDK 체인(`@langchain/anthropic` 1.5.6 → `@anthropic-ai/sdk` ^0.115.0 → `2023-06-01`) 명시, 향후 SDK 1.x 전환 영향은 미검증 표기 ③ Thinking Mode=Disabled 가 `{type:'disabled'}` 를 전송해 Opus 5.5·Sonnet 5.5 에서 400 — 예시·함정 표를 "비움 또는 Adaptive" 로 정정 ④ n8n latest 2.40.7 → 2.46.6, 노드 defaultVersion 1.6 ⑤ 함정 표에 HTTP Request 노드 sampling 행·Thinking Disabled 행 추가, 컨텍스트 행 Haiku 5.5 1M 반영. 검증일 4곳 동기화. status는 skill-tester 재시험 결과로 결정 | 3차 재검증 — 메인 오케스트레이션 포크 |
| 2026-11-06 | v3.3 | 3차 재검증 후 2단계 실사용 테스트 재수행(skill-tester → general-purpose 1회 호출). Q1 Sonnet 5.5 temperature 미전송 + Thinking Disabled 400 / Q2 Haiku 5.5 가격·SDK 체인·2023-06-01·미검증 표기 / Q3 HTTP Request 2026-10-21 sampling 400 → 3/3 PASS, 카테고리 "content test 가능(경계선)"이므로 APPROVED 유지 | skill-tester |
| 2026-11-11 | v3.3 | 2026-11-11 재검증 — Fable 5.2 현행화(공식 models overview·whats-new-fable-5-2). §2 상위 티어 `claude-fable-5-1` $10/$50 → **`claude-fable-5-2` $8/$40**, 세대 정렬 블록 현행 라인업 Fable 5.2·Legacy 목록에 `claude-fable-5-1` 추가, 강제 tool_choice·thinking disabled 400 주의와 샘플링 주의·컨텍스트 표의 Fable 표기를 5.2로(thinking disabled 400 대상에 Fable 5.2 추가). 클레임 29 갱신. status 변경 없음 | Claude |
| 2026-11-12 | v3.4 | 정리(사실 재검증 아님) — 일반 지식 덜어내기: 남긴 것 모델 동적 조회·현행 모델 ID/단가표·세대 정렬·Claude 3 retired·1M 컨텍스트·Thinking Mode(2.20.0/typeVersion 1.5)와 Disabled 400·sampling 자동 미전송/SDK 0.x 2023-06-01·프롬프트 캐싱 이슈·버전별 변경표(1.82.0 Agent 타입 제거·2.0 Publish·2.0 $env 차단·2.6 HITL·2.8.3 Motorhead·2.22 MCP 직결)·Guardrails·실측 함정표 / 덜어낸 것 클러스터 노드 아키텍처 설명·Chat Model 노드 비교표·파라미터 설명표·Tools Agent 파라미터·sub-node 연결도·Chat Trigger 모드·도구/Vector Store/Memory/Output Parser 일반 표·모델 중립 비교·비용 관리·안전 가드 일반표·꿈 해몽 예시 워크플로우·짝 스킬 관계표 | 정리 |
