# 에이전트 설계 규칙

에이전트를 만들거나 수정할 때 참조하는 규칙입니다.
에이전트 파일을 쓸 때 이 파일을 기준으로 삼습니다(agent-md-guard 훅이 구조를 검사).

---

## 모델 선택 기준

| 모델 | 최신 ID | 적합한 경우 | 예시 (프로젝트에서 꺼 두었을 수 있음) |
|------|---------|------------|------|
| fable | `claude-fable-5-2` | 최고난도 **장기(long-horizon) 멀티에이전트 오케스트레이션** — 다수 서브에이전트를 장시간 지휘·종합 | (현재 없음) |
| `opus` | `claude-opus-5-5` | 최고난도 판단·분석, 일반 오케스트레이터 | legacy-spec-extractor |
| `sonnet` | `claude-sonnet-5-5` | 검색·코드 생성, 검증·판정 | fact-checker, skill-tester, spec-reviewer |
| `haiku` | `claude-haiku-5-5` | 단순 포맷 변환, 반복 작업 | 포맷터, 분류기 등 |

> **참고 (2026-11-11 갱신):** 현행 4종의 API 단가(입·출력, per MTok)·기본 effort는 Fable 5.2(2026-11-09 출시) $8/$40·`high`, Opus 5.5 $4/$20·`medium`, Sonnet 5.5(2026-09-28 출시) $2/$10·`high`, Haiku 5.5(2026-10-07 출시) $0.10/$0.50부터(긴 프롬프트는 더 비쌈)·`medium`이다. 모두 날짜 접미사 없는 고정 ID다. Fable 5.2는 Opus 상위 티어라(Opus 5.5의 2배, 구독 한도 소모도 큼 — 플랜에 따라 사용 크레딧으로 청구) *장기 멀티에이전트 오케스트레이션*에 한정한다. 공식 sub-agents 문서상 frontmatter `model`은 `opus`·`sonnet`·`haiku`·`fable` 별칭, 전체 ID, `inherit`(메인 대화 모델 사용)를 모두 받는다. **이 레포 정책:** 일반 에이전트는 `opus`·`sonnet`·`haiku` 별칭을 쓴다(현행 최신 모델로 해석되므로 ID 갱신 불필요). fable 티어는 비용이 커서 별칭으로 무심코 고르지 않도록 전체 ID `claude-fable-5-2`로만 명시한다(`fable` 별칭은 agent-md-guard 가 막는다). 메인 대화와 다른 모델을 쓰는 서브에이전트는 메인 세션의 effort 가 아니라 그 모델에 저장된 effort(없으면 기본값)를 쓴다(Claude Code 2.1.317) — 서브에이전트 전체를 한 값으로 맞추려면 frontmatter `effort` 또는 환경변수 `CLAUDE_CODE_SUBAGENT_EFFORT`(2.1.316). `inherit`은 허용하지만, 비용과 품질이 메인 대화 모델에 따라 바뀌므로 그 동작을 의도한 경우에만 쓴다. 오케스트레이터 외에는 sonnet이 기본 선택.
>
> **구세대 ID를 스킬·코드에 하드코딩하지 말 것.** Fable 5.1(`claude-fable-5-1`)·Fable 5(`claude-fable-5`)·Opus 5(`claude-opus-5`)·Opus 4.8(`claude-opus-4-8`)·Opus 4.7(`claude-opus-4-7`)·Opus 4.6(`claude-opus-4-6`)·Sonnet 5(`claude-sonnet-5`)·Sonnet 4.6(`claude-sonnet-4-6`)·Haiku 4.5(`claude-haiku-4-5`, 날짜 고정판 `claude-haiku-4-5-20251001`)은 아직 서비스되지만 현행 세대가 아니다. 예제 코드에는 `claude-opus-5-5`를 기본으로 쓰고, 레거시 스택 대응 등 구버전을 의도적으로 명시해야 하는 경우에만 사유와 함께 남긴다. (agent-md-guard 훅의 `VALID_MODELS`가 이 구세대 ID 목록의 최종 기준이며, 이 문서는 그와 동기화되어야 한다.) 이미 은퇴한 ID — Sonnet 4·Opus 4(2025-05-14 판, 2026-06-15 은퇴), Haiku 3.5·Haiku 3 — 는 쓰지 않으며, Sonnet 4.5(2025-09-29 판)는 2026-11-30 은퇴 예정이다.
>
> **API 버전 2026-10-21부터** `temperature`·`top_p`·`top_k` 같은 sampling 파라미터는 모든 모델에서 400이다. 예제 코드에 sampling 파라미터를 넣지 말고 프롬프트로 조절한다.
>
> **Opus 5.5 API 브레이킹 체인지 (예제 코드 작성 시 필수 반영):** ① thinking 비활성 불가 — `{type:"disabled"}`·`budget_tokens` 모두 400, 깊이는 `output_config.effort`로만 조절하며 **기본값이 `medium`**(Opus 5는 `high`) ② 강제 `tool_choice`(`any`/`tool`) 400 — `auto` + `strict: true` 또는 structured outputs 사용 ③ 컴퓨터 사용은 `computer_toolset_20260801`만 ④ thinking 블록은 생성 모델·대화에 묶임(preserved thinking). Fable 5.2도 ①②④가 동일하다. 이 패턴을 쓰는 예제를 Opus 5.5로 옮길 때는 ID만 바꾸지 말고 코드도 함께 고친다.
>
> **Fable 5.2 브레이킹 체인지 (Fable 5.1 코드를 옮길 때, 2026-11-09):** ① 이전 턴(`system`·`tools`·이전 메시지)을 바꾼 뒤 thinking 블록을 돌려보내면 **모든 계정**에서 400(5.1 은 2026-08-31 이후 계정만) — 임시 회피는 `thinking-binding-controls-2026-08-01` 베타 헤더 + `prefix_mismatch_behavior:"drop_block"` ② Fable 5.2 thinking 블록은 Fable 5.2·Mythos 5.2 만 읽음(다른 모델로 옮기면 그 사고는 버려짐) ③ 옛 `computer_20251124` 400(Bedrock 제외) — `computer_toolset_20260801` ④ advisor 도구는 실행 모델이 Fable 5.2 면 advisor 도 `claude-fable-5-2`. 사고 항상 켜짐·강제 `tool_choice` 400·sampling 400 은 5.1 과 같다.
>
> **Sonnet 5.5 API 브레이킹 체인지 (Sonnet 5·4.6 코드를 옮길 때):** ① `thinking:{type:"disabled"}` 400 — 대신 `{type:"between_tools"}`(첫 응답 전 사고만 끔, effort `low`~`high`에서만) ② `budget_tokens` 400 — adaptive + `output_config.effort`(기본 `high`) ③ 강제 `tool_choice`(`any`/`tool`) 400(토큰 세기 요청 포함) — `auto` + `strict: true` ④ `temperature`·`top_p`·`top_k` 400 ⑤ 마지막 assistant 턴 prefill 400 — structured outputs 또는 user 턴으로 ⑥ 컴퓨터 사용은 `computer_toolset_20260801`만.
>
> **Haiku 5.5 API 브레이킹 체인지 (Haiku 4.5 코드를 옮길 때):** ① `budget_tokens` 400 — adaptive + `output_config.effort`(기본 `medium`) ② sampling 파라미터 400 ③ prefill 400(thinking 꺼도) ④ 옛 `computer_20250124` 400 — `computer_toolset_20260801` ⑤ 이전 턴(`system`·`tools`·이전 메시지)을 바꾼 뒤 thinking 블록을 돌려보내면 400(대화는 append-only) ⑥ thinking 블록은 만든 계정에 귀속(다른 계정으로 재생하면 조용히 버려짐) ⑦ 같은 글이 토큰 약 30% 더 많이 세어짐 — `max_tokens`·비용 재산정 ⑧ `stop_reason:"refusal"` 처리 필요(서버 쪽 대체 없음). 강제 `tool_choice`는 **허용**되지만 그때는 thinking 없이 바로 도구를 부른다. `{type:"disabled"}` 허용 여부는 마이그레이션 가이드에 없다 — 쓰기 전에 Models API `capabilities.thinking.types.disabled`로 확인한다(> 주의: 미확인).
>
> **캐시 최소 토큰은 모델마다 다르고 세대순이 아니다** — Fable 5.2·Fable 5.1·Opus 5.5·Sonnet 5.5·Haiku 5.5·Fable 5·Opus 5는 512, Opus 4.8·Sonnet 5·Sonnet 4.6은 1,024, Opus 4.7은 2,048, Opus 4.6·Opus 4.5·Haiku 4.5는 4,096 (2026-11-11 공식 prompt-caching 문서 기준). 프롬프트 캐싱을 다루는 스킬에서 이 값을 인용할 때는 대상 모델을 명시한다.
>
> 소스: https://platform.claude.com/docs/en/about-claude/models/overview · /models/sonnet-5-5/migration-guide · /models/haiku-5-5/migration-guide · /build-with-claude/prompt-caching · /about-claude/model-deprecations · /api/versioning · /models/fable-5-2/whats-new-fable-5-2 · https://code.claude.com/docs/en/sub-agents · /model-config · /changelog (검증일 2026-11-11)

**선택 기준:**
- 다수 서브에이전트를 장시간 지휘하는 최고난도 리서치 오케스트레이터 → `claude-fable-5-2` (비용 감안해 최소 지정)
- 그 외 오케스트레이터(Agent 도구 사용) → `opus` 또는 `sonnet` (단순 조합이면 sonnet)
- 판단보다 검색/실행이 주된 작업 → `sonnet`
- 입력을 정해진 형식으로 변환만 하는 작업 → `haiku`

---

## 도구 부여 기준

| 도구 | 부여 조건 |
|------|-----------|
| `Agent` | 오케스트레이터에만. 다른 서브에이전트를 호출할 때 |
| `Read` | 파일 내용을 읽어야 할 때 |
| `Write` | 파일을 생성·저장해야 할 때 |
| `Edit` | 기존 파일을 수정해야 할 때 |
| `Glob` | 파일 목록을 탐색해야 할 때 |
| `Grep` | 코드·텍스트 패턴을 검색해야 할 때 |
| `Bash` | 명령어 실행이 꼭 필요할 때만 (보안 위험, 최소 부여) |
| `WebSearch` | 웹 검색이 필요할 때 |
| `WebFetch` | 특정 URL 내용을 가져와야 할 때 |

**원칙: 필요한 도구만 최소로 부여한다.**

---

## 에이전트 vs 스킬 선택 기준

| 상황 | 선택 |
|------|------|
| 독립 컨텍스트가 필요한 전문 작업 | 에이전트 |
| 파일을 많이 읽어 컨텍스트 오염 우려 | 에이전트 |
| 메인 대화에 주입할 도메인 지식·패턴 | 스킬 |
| 반복 실행하는 작업 절차(workflow) | 스킬 |

---

## 파일 작성 규칙

```yaml
---
name: {에이전트-이름}           # kebab-case
description: >
  {핵심 역할 1-3줄}
  <example>사용자: "{예시 요청}"</example>
  <example>사용자: "{예시 요청}"</example>
tools:
  - {필요한 도구만}
model: {opus|sonnet|haiku}   # fable 티어는 claude-fable-5-2 전체 ID, inherit 은 의도한 경우만
# 선택적 필드 (필요 시):
# maxTurns: 30          # 오케스트레이터: 30-50 / 워커: 10-20 (기본값: 무제한)
# disallowedTools:      # 사용 금지 도구 목록 (보안/범위 제한 목적)
#   - Bash
# effort: medium        # low / medium / high / xhigh / max — 이 에이전트의 사고 깊이
# skills:               # 시작할 때 전체 내용을 미리 넣을 스킬
#   - {스킬-이름}
# memory: project       # 지속 메모리 범위: user / project / local
# permissionMode: default   # default / acceptEdits / auto / dontAsk / bypassPermissions / plan
# isolation: worktree   # 임시 git worktree 에서 실행
# background: true      # 항상 백그라운드로 실행
# omitClaudeMd: true    # 시작할 때 CLAUDE.md 를 읽지 않음
# autoCompactWindow: 200000   # 자동 압축 창(100000~1000000 토큰)
# initialPrompt: "..."  # 메인 세션 에이전트로 실행될 때 자동 제출할 첫 턴
# color: blue           # 표시 색: red / blue / green / yellow / purple / orange / pink / cyan
# hooks: {...}          # 이 에이전트에만 적용되는 훅
# mcpServers: [...]     # 이 에이전트가 쓸 MCP 서버(이름 참조 또는 인라인 정의)
# (필드 목록: https://code.claude.com/docs/en/sub-agents — 2026-11-06 확인)
---
```

- 시스템 프롬프트는 한국어로 작성
- description에 `<example>` 태그 2-3개 포함 (Claude 자동 선택 정확도 향상)
- 자동 호출을 원하면 description에 "Use proactively" 포함
- 오케스트레이터 에이전트(Agent 도구 사용)에는 `maxTurns`를 반드시 설정한다 (비용/안전 제어 필수)

---

## 폴더 구조

```
.claude/agents/   (괄호 안 에이전트명은 예시 — 프로젝트에서 켠 블록에 따라 꺼져 있을 수 있음)
├── meta/        ← 하네스 관리 도구 (skill-tester)
├── validation/  ← 독립 검증·평가 (fact-checker, spec-reviewer, 프롬프트 시험 에이전트 등)
├── frontend/    ← 화면 변환 (nexacro-screen-converter)
├── domain/      ← 레거시 분석·스펙 추출 (legacy-spec-extractor, nexacro-screen-analyzer)
└── health/      ← 건강·식단 앱 프롬프트 검증
```

> 래퍼(`gugbab-claude`)에서는 프로젝트마다 켠 블록·프리셋에 따라 일부 에이전트만 로드된다 — `relations.json` 의 `blocks`·`presets` 참조.

새 카테고리 추가 시 `docs/agents/{category}/` 문서 폴더도 함께 생성한다.
