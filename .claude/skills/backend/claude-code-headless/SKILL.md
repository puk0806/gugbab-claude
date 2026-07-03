---
name: claude-code-headless
description: Claude Code CLI를 headless(`claude -p`) 모드로 프로그래매틱 실행하고, 구독(OAuth) 인증으로 중계 서버·샌드박스에서 사용하는 방법. stream-json 파싱, 인증 우선순위, 안전 가드 포함.
---

# Claude Code Headless 실행 & 구독 인증

> 소스:
> - https://code.claude.com/docs/en/headless (Run Claude Code programmatically)
> - https://code.claude.com/docs/en/authentication (Authentication)
> - https://code.claude.com/docs/en/cli-reference (CLI reference)
> - https://code.claude.com/docs/en/agent-sdk/overview (Agent SDK overview)
> - https://support.claude.com/en/articles/15036540 (Use the Agent SDK with your Claude plan)
> 검증일: 2026-07-03

Vercel Sandbox 등 비대화형 환경에서 Claude Code CLI를 구독 인증으로 헤드리스 실행해
프롬프트를 중계(예: SSE)할 때 필요한 핵심 지식을 정리한다.

---

## 1. Headless 모드 (`claude -p`) 핵심 플래그

`-p` (`--print`)를 붙이면 대화형 UI 없이 프롬프트를 실행하고 결과를 stdout으로 출력한다.
모든 CLI 옵션은 `-p`와 함께 동작한다.

```bash
claude -p "이 저장소의 auth 모듈이 하는 일을 설명해줘"
```

| 플래그 | 값 / 설명 |
|--------|-----------|
| `-p`, `--print` | 비대화형 실행. stdin도 읽으므로 파이프 입력 가능 |
| `--output-format` | `text`(기본) / `json` / `stream-json` |
| `--model` | 별칭(`sonnet`, `opus`, `haiku`, `fable`) 또는 전체 모델명 |
| `--resume`, `-r` | 세션 ID 또는 이름으로 특정 대화 이어가기 |
| `--continue` | 가장 최근 대화 이어가기 |
| `--allowedTools` | 프롬프트 없이 자동 승인할 도구 (permission rule 문법) |
| `--disallowedTools`, `--disallowed-tools` | 거부 규칙. bare 이름은 모델 컨텍스트에서 도구 제거 (`"*"`=전체 제거) |
| `--max-turns` | agentic turn 수 제한 (print 모드 전용). 초과 시 에러로 종료 |
| `--append-system-prompt` | 기본 시스템 프롬프트에 지시 추가 (기본 동작 유지) |
| `--system-prompt` | 시스템 프롬프트를 완전히 교체 |
| `--tools` | 내장 도구 제한. `""`=전체 비활성, `"Bash,Edit,Read"` 등 |

### stdin 파이프 & 구조화 출력

```bash
# 파이프 입력 → 결과를 파일로
cat build-error.txt | claude -p '이 빌드 에러의 근본 원인을 간결히 설명' > out.txt

# JSON 출력: result / session_id / total_cost_usd 등 메타 포함
claude -p "이 프로젝트 요약" --output-format json | jq -r '.result'
```

> 주의: piped stdin은 v2.1.128부터 10MB 상한. 초과 시 non-zero 종료.
> 큰 입력은 파일로 저장 후 경로를 프롬프트에 참조시킨다.

---

## 2. stream-json 출력 구조 & SSE 중계 파싱

`--output-format stream-json`은 **줄 단위(newline-delimited) JSON**을 내보낸다.
각 줄이 하나의 이벤트 객체다. 토큰 단위 실시간 스트리밍은 아래 두 플래그가 **필수**다.

```bash
claude -p "재귀를 설명해줘" \
  --output-format stream-json --verbose --include-partial-messages
```

- `--verbose`: turn-by-turn 전체 출력 (stream-json에 필수)
- `--include-partial-messages`: 부분 스트리밍 이벤트 포함 (`--print` + stream-json 필요)

### 주요 이벤트 타입

| type / subtype | 의미 |
|----------------|------|
| `system` / `init` | 첫 이벤트. 모델·도구·MCP·plugin 등 세션 메타 (`session_id` 포함) |
| `stream_event` | 부분 델타. `event.delta.type == "text_delta"`면 `event.delta.text`가 토큰 |
| `system` / `api_retry` | 재시도 이벤트. `attempt`, `max_retries`, `retry_delay_ms`, `error_status`, `error` |
| `result` | 최종 결과 (`--output-format json`에서 `result` 필드) |

### SSE 중계 시 텍스트 델타만 추출

```bash
claude -p "시를 써줘" --output-format stream-json --verbose --include-partial-messages | \
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'
```

중계 서버에서는 각 줄을 `JSON.parse` → `type`/`subtype`으로 분기 →
`stream_event`의 `text_delta`만 SSE `data:` 청크로 흘려보내는 패턴을 쓴다.
`system/init`에서 `session_id`를 캡처해 두면 이후 `--resume`으로 대화를 이어갈 수 있다.

```bash
# 세션 ID 캡처 후 이어가기
session_id=$(claude -p "리뷰 시작" --output-format json | jq -r '.session_id')
claude -p "그 리뷰 계속" --resume "$session_id"
```

> 주의: `--resume`의 세션 ID 조회는 현재 프로젝트 디렉터리(및 git worktree) 범위로 한정된다.
> 첫 호출과 이어가기 호출을 같은 디렉터리에서 실행해야 한다.

---

## 3. 구독(OAuth) 인증 — `claude setup-token`

브라우저 로그인이 불가능한 CI·스크립트·샌드박스 환경에서는 장기 OAuth 토큰을 발급한다.

```bash
claude setup-token
# OAuth 승인 절차를 거쳐 토큰을 터미널에 출력 (어디에도 저장하지 않음)
export CLAUDE_CODE_OAUTH_TOKEN=your-token
```

핵심 제약:
- **Pro / Max / Team / Enterprise 플랜 필요** (구독 계정 인증)
- **1년(one-year) 만료** 토큰
- **inference 전용 스코프** — Remote Control 세션은 만들 수 없다
- 명령은 토큰을 저장하지 않으므로, 출력값을 복사해 환경변수로 주입한다

---

## 4. 인증 우선순위 (공식 문서 기준)

여러 자격증명이 동시에 존재하면 Claude Code는 아래 순서로 하나를 고른다.

1. **Cloud provider** — `CLAUDE_CODE_USE_BEDROCK` / `CLAUDE_CODE_USE_VERTEX` / `CLAUDE_CODE_USE_FOUNDRY`
2. **`ANTHROPIC_AUTH_TOKEN`** — `Authorization: Bearer` 헤더 (LLM 게이트웨이/프록시용)
3. **`ANTHROPIC_API_KEY`** — `X-Api-Key` 헤더 (직접 API 접근)
4. **`apiKeyHelper`** — 스크립트가 반환하는 동적 키 (short-lived 토큰 등)
5. **`CLAUDE_CODE_OAUTH_TOKEN`** — `setup-token`으로 만든 장기 OAuth 토큰
6. **구독 OAuth** (`/login`) — Pro/Max/Team/Enterprise 기본값

> 함정: **`ANTHROPIC_API_KEY`가 설정돼 있으면 구독보다 우선한다.**
> 비대화형(`-p`) 모드에서는 키가 존재하면 **항상** 사용된다.
> 구독으로 되돌리려면 `unset ANTHROPIC_API_KEY` 후 `/status`로 활성 인증 방식 확인.
> 샌드박스 이미지·CI 시크릿에 API 키가 섞여 들어가면 구독 인증이 조용히 덮어써지므로,
> 구독 인증 중계 서버에서는 `ANTHROPIC_API_KEY`/`ANTHROPIC_AUTH_TOKEN`을 명시적으로 비운다.

---

## 5. bare 모드(`--bare`) 제약

`--bare`는 hook·skill·plugin·MCP·auto memory·CLAUDE.md 자동 탐색을 건너뛰어 시작을 빠르게 한다.
CI·스크립트에서 머신마다 동일한 결과를 얻는 데 유용하다. 하지만:

> 주의: **bare 모드는 `CLAUDE_CODE_OAUTH_TOKEN`을 읽지 않는다.**
> OAuth·keychain 읽기를 모두 건너뛰므로, `--bare` 스크립트는
> `ANTHROPIC_API_KEY` 또는 `--settings`에 담은 `apiKeyHelper`로 인증해야 한다.

즉 **구독 토큰으로 중계**하려면 `--bare`를 쓰면 안 된다.
`claude -p`(bare 미적용)로 실행해야 `CLAUDE_CODE_OAUTH_TOKEN`이 적용된다.
(bare 모드에서는 Bash·file read·file edit 도구만 기본 제공되고, 컨텍스트는 플래그로만 주입된다.)

---

## 6. Agent SDK vs CLI 직접 실행 선택 기준

| 상황 | 선택 |
|------|------|
| 단순 프롬프트 중계 / 일회성 태스크 / 인터랙티브 개발 | **CLI (`claude -p`)** |
| 도구 실행 제어·훅 콜백·권한 콜백·구조화 메시지 객체 필요 | **Agent SDK** |
| CI/CD 파이프라인, 커스텀 앱, 프로덕션 자동화 | **Agent SDK** |

- TypeScript: `npm install @anthropic-ai/claude-agent-sdk` (`query()` 함수, 네이티브 바이너리 번들)
- Python: `pip install claude-agent-sdk` (Python 3.10+)

단순히 프롬프트를 받아 stream-json을 SSE로 흘려보내는 **채팅 중계 서버**라면
CLI 직접 실행(`claude -p --output-format stream-json`)이 가장 단순하다.
훅으로 도구 사용을 감사(audit)하거나 권한을 코드로 판정해야 하면 SDK를 쓴다.

---

## 7. 구독 프로그래매틱 사용 정책 (2026-07-03 기준)

- **본인 프로젝트·개인용**: 구독 계정 자격증명으로 `claude -p` / Agent SDK 사용 **허용**.
- **타인 대상 서비스**: 공식 문서상 "사전 승인 없이는 제3자 제품에 claude.ai 로그인/레이트리밋을
  제공할 수 없다". 이 경우 **API 키 인증**을 사용해야 한다.
- **크레딧 풀 분리 정책**: 2026-06-15 예정이던 "Agent SDK·`claude -p` 사용을 구독 풀에서 분리해
  별도 월 크레딧으로 청구"하는 변경은 **시행 직전 일시 중지(paused)**되었다.
  현재는 `claude -p`·Agent SDK·GitHub Actions 사용이 **기존 구독 사용 한도에서 차감**되는 방식 유지.
  Anthropic은 향후 변경 시 사전 고지하겠다고 밝혔다.

> 즉 개인 중계 서버(본인 사용)는 구독 토큰으로 문제없으나, 외부 사용자에게 노출하는
> 서비스로 확장하면 API 키 기반으로 전환해야 한다.

---

## 8. 안전 가드 (채팅 전용 중계 서버)

채팅·텍스트 응답만 필요한 중계 용도라면 파일 수정·명령 실행 도구를 반드시 차단한다.

```bash
# 모든 도구 비활성 — 순수 텍스트 응답만
claude -p "$USER_PROMPT" --tools "" \
  --output-format stream-json --verbose --include-partial-messages \
  --model haiku --max-turns 1
```

체크리스트:
- **도구 차단**: `--tools ""`(전체 비활성) 또는 `--disallowedTools "*"`로 Bash/Edit/Write 등 제거
- **모델 지정으로 한도 절약**: 채팅 중계는 `--model haiku`로 구독 사용량 절감
- **`--max-turns` 제한**: 무한 agentic loop 방지 (채팅이면 1로 고정)
- **토큰 노출 금지**: `CLAUDE_CODE_OAUTH_TOKEN`은 로그·응답·에러 메시지에 절대 출력하지 않는다
- **API 키 오염 차단**: 구독 중계 서버 환경에서 `ANTHROPIC_API_KEY`가 비어 있는지 확인 (우선순위 함정)
- **bare 모드 금지**: 구독 토큰 인증 시 `--bare`를 쓰지 않는다 (5번 참조)

---

## 흔한 실수

| 실수 | 결과 | 해결 |
|------|------|------|
| `--bare`로 구독 토큰 인증 시도 | OAuth 미로드 → 인증 실패 | `--bare` 제거, `claude -p`로 실행 |
| 샌드박스에 `ANTHROPIC_API_KEY` 잔존 | 구독 대신 API 키로 청구됨 | `unset ANTHROPIC_API_KEY`, `/status` 확인 |
| stream-json에 `--verbose` 누락 | 스트리밍 이벤트 안 나옴 | `--verbose --include-partial-messages` 추가 |
| 채팅 중계에 도구 미차단 | 임의 파일·명령 실행 위험 | `--tools ""` 또는 `--disallowedTools "*"` |
| `--resume`를 다른 디렉터리에서 호출 | 세션 못 찾음 | 첫 호출과 같은 디렉터리에서 실행 |
