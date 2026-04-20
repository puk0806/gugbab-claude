# 에이전트 설계 규칙

에이전트를 만들거나 수정할 때 참조하는 규칙입니다.
CLAUDE.md와 agent-creator 모두 이 파일을 기준으로 삼습니다.

---

## 모델 선택 기준

| 모델 | 최신 ID | 적합한 경우 | 예시 |
|------|---------|------------|------|
| `opus` | `claude-opus-4-6` | 최고난도 판단·분석, 오케스트레이터 | deep-researcher, agent-creator |
| `sonnet` | `claude-sonnet-4-6` | 검색·코드 생성, 검증·판정 | web-searcher, fact-checker, rust-backend-developer |
| `haiku` | `claude-haiku-4-5` | 단순 포맷 변환, 반복 작업 | 포맷터, 분류기 등 |

> **참고 (2026-04-17 기준):** Sonnet 4.6은 Opus 수준의 코딩·추론 성능을 제공하면서 비용은 낮다. 오케스트레이터 외에는 sonnet이 기본 선택이다. `claude-sonnet-4-20250514`, `claude-opus-4-20250514`는 2026-06-15 deprecated 예정이므로 신규 에이전트에서는 위 최신 ID를 사용한다.

**선택 기준:**
- 다른 에이전트를 호출(Agent 도구)하는 오케스트레이터 → `opus` 또는 `sonnet` (단순 조합이면 sonnet)
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
model: {opus|sonnet|haiku}
# 선택적 필드 (필요 시):
# maxTurns: 30          # 오케스트레이터: 30-50 / 워커: 10-20 (기본값: 무제한)
# disallowedTools:      # 사용 금지 도구 목록 (보안/범위 제한 목적)
#   - Bash
---
```

- 시스템 프롬프트는 한국어로 작성
- description에 `<example>` 태그 2-3개 포함 (Claude 자동 선택 정확도 향상)
- 자동 호출을 원하면 description에 "Use proactively" 포함
- `maxTurns`는 비용/안전 제어 목적으로 오케스트레이터 에이전트에 권장

---

## 폴더 구조

```
.claude/agents/
├── meta/        ← 에이전트 생성·관리 도구
├── research/    ← 리서치·조사 관련
├── validation/  ← 검증·확인 관련
└── frontend/    ← 프론트엔드 개발 관련
```

새 카테고리 추가 시 `docs/agents/{category}/` 문서 폴더도 함께 생성한다.
