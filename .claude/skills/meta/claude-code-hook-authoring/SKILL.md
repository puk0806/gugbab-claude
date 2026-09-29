---
name: claude-code-hook-authoring
description: Claude Code 훅(hooks) 작성법 — 이벤트 종류·stdin 입력 스키마·exit code 규약(0/2/기타)·stdout vs stderr·matcher 문법·settings.json 배선·타임아웃·차단형/비차단형 설계와 실전 함정(오탐·stdout 유실)을 다룬다. 훅을 새로 만들거나 기존 훅을 수정·디버깅할 때 참조.
---

# Claude Code 훅 작성법

> 소스: https://code.claude.com/docs/en/hooks (Hooks reference) · https://code.claude.com/docs/en/hooks-guide (Automate actions with hooks) · 검증 사례는 이 레포 `.claude/hooks/` 실제 동작 코드
> 검증일: 2026-09-28 (최초 2026-08-11)
> 기준 버전: Claude Code 2.1.x (공식 changelog 2.1.283 시점 대조, 일부 필드는 최소 버전 요구 — 본문 표기)

---

## 1. 언제 훅을 쓰는가

| 상황 | 선택 |
|------|------|
| "반드시 항상" 실행돼야 하는 결정적(deterministic) 동작 | **훅** (모델 판단에 맡기지 않음) |
| 위험 명령·보호 파일 수정을 **물리적으로 차단** | **훅** (PreToolUse) |
| 세션 시작 시 컨텍스트 주입, 저장 후 포맷터 실행 | **훅** (SessionStart / PostToolUse) |
| "가급적 이렇게 해라" 수준의 지침 | CLAUDE.md / rules (훅으로 강제하면 오탐 비용이 큼) |
| 판단이 필요한 회색지대 검사 | 네이티브 Plan Mode·서브에이전트 또는 `type: "prompt"` 훅 |

> 원칙: **없으면 비가역 사고가 나는가?** 아니면 규칙 한 줄로 충분한가. 후자면 훅으로 만들지 않는다.

---

## 2. 훅 이벤트 카탈로그

자주 쓰는 이벤트 (트리거 시점):

| 이벤트 | 시점 | matcher 대상 | 차단 가능(exit 2) |
|--------|------|--------------|:---:|
| `PreToolUse` | 도구 호출 **직전** | 도구명 | ✅ 도구 호출 차단 |
| `PermissionRequest` | 도구 호출이 권한 판정을 필요로 할 때 | 도구명 | ❌ **exit 2 무시됨** — `decision` 객체(`behavior: "deny"`)로만 거부 |
| `PermissionDenied` | auto 모드 분류기가 거부했을 때 | 도구명 | ❌ (JSON `retry: true` 사용) |
| `PostToolUse` | 도구 호출 **성공 후** | 도구명 | ❌ 되돌리지 못함(피드백만) |
| `PostToolUseFailure` | 도구 호출 실패 후 | 도구명 | ❌ 피드백만 |
| `PostToolBatch` | 병렬 도구 배치가 모두 끝난 후 | 없음 | ✅ 다음 모델 호출 전 중단 |
| `UserPromptSubmit` | 사용자 프롬프트 제출 직후, 처리 전 | 없음 | ✅ 프롬프트 차단·삭제 |
| `SessionStart` | 세션 시작·재개 | `startup`·`resume`·`clear`·`compact`·`fork` | ❌ (stderr는 사용자에게만) |
| `SessionEnd` | 세션 종료 | 종료 사유 | ❌ |
| `Stop` | Claude가 응답을 마칠 때(턴 종료) | 없음 | ✅ 종료 차단, 대화 계속 |
| `SubagentStart` / `SubagentStop` | 서브에이전트 생성/종료 | 에이전트 타입 | Start ❌ / Stop ✅ |
| `InstructionsLoaded` | CLAUDE.md·`.claude/rules/*.md` 로드 시 | 로드 사유(`session_start` 등) | ❌ **exit code 자체가 무시됨** |
| `Notification` | Claude Code가 알림을 보낼 때 | 알림 타입 | ❌ (사용자에게만 표시) |
| `PreCompact` / `PostCompact` | 컨텍스트 압축 전/후 | `manual`·`auto` | Pre ✅ / Post ❌ |
| `ConfigChange` | 세션 중 설정 파일 변경 | `project_settings` 등 | ✅ (policy_settings 제외) |
| `FileChanged` | 감시 대상 파일이 디스크에서 변경 | 감시할 파일명 | ❌ |
| `PreModelSwitch` | 사용자·클라이언트가 요청한 모델 전환 적용 **직전** (v2.1.251+) | 전환 대상 모델의 canonical 이름 | ✅ 전환 취소 (타임아웃 시에도 차단) |
| `PostModelSwitch` | 세션 모델 변경 후 — 자동 fallback·resume 복원 포함 (v2.1.251+) | 동일 | ❌ (exit 0 stdout·`additionalContext`가 다음 요청에 주입) |

그 외 이벤트(공식 레퍼런스 lifecycle 표에 존재): `Setup`, `UserPromptExpansion`, `StopFailure`, `TaskCreated`/`TaskCompleted`, `TeammateIdle`, `CwdChanged`, `DirectoryAdded`, `WorktreeCreate`/`WorktreeRemove`, `Elicitation`/`ElicitationResult`, `MessageDisplay`.

> 주의: 이벤트 목록은 버전에 따라 추가된다. 새 이벤트를 쓰기 전 `/hooks` 브라우저(읽기 전용)로 현재 CLI가 인식하는 이벤트를 확인하라.

---

## 3. 실행 계약 — 입력·출력·exit code

### 3-1. stdin 입력 (command 훅)

훅 프로세스는 **stdin으로 JSON 한 덩어리**를 받는다. 모든 이벤트 공통 필드:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse"
}
```

- 도구 이벤트는 여기에 `tool_name`, `tool_input`(도구 인자 객체)이 추가된다. `PostToolUse`는 도구 실행 결과도 함께 받는다.
- `prompt_id`는 v2.1.196+, `agent_id`/`agent_type`은 서브에이전트 실행 시에만 존재.
- `permission_mode` 값: `default`·`plan`·`acceptEdits`·`auto`·`dontAsk`·`bypassPermissions`. (**Manual** 모드도 `"default"`로 옴. 모든 이벤트가 받는 필드는 아님)
- `effort` — `{ "level": "low"|"medium"|"high"|"xhigh"|"max" }`. PreToolUse·PostToolUse·Stop·SubagentStop 등 도구 사용 컨텍스트 이벤트에서, 현재 모델이 effort를 지원할 때만 존재. 같은 값이 환경변수 **`$CLAUDE_EFFORT`**로도 훅 커맨드(및 Bash 도구)에 제공된다 (v2.1.133+).
- `scratchpad_dir` — 세션 스크래치패드 디렉토리 경로. 스크래치패드가 없거나 temp 디렉토리를 쓸 수 없으면 생략된다.
  > 주의: 공식 레퍼런스는 최소 버전 v2.1.257을 표기하나 changelog에서는 해당 항목을 확인하지 못함 — 필드 부재를 전제로 방어적으로 읽을 것.

### 3-2. exit code 규약 (가장 많이 틀리는 부분)

**Claude Code는 exit code와 무관하게 stdout을 JSON으로 읽는다.** 표준 decision 모델 이벤트에서 스키마를 통과한 JSON 객체는 exit code와 함께 효력을 가지며, JSON이 뒤집을 수 없는 것은 **exit 2의 차단** 하나뿐이다.

| exit | 의미 | stdout | stderr |
|:---:|------|--------|--------|
| `0` | 통과 | `{`로 시작·`}`로 끝나면 **JSON으로 파싱**(구조화 출력), 아니면 plain text(대부분 이벤트에선 디버그 로그로만) | 디버그 로그에만 — Claude가 못 봄 |
| `2` | 차단(blocking error) — JSON `permissionDecision: "allow"`로도 못 뒤집음 | 유효 JSON은 여전히 읽힘. **JSON이 blocking decision을 내리면 그 reason이 차단 메시지**. plain text stdout은 메시지로 안 쓰임 | JSON 차단 사유가 없으면 **stderr가 차단 메시지** |
| 그 외(1 포함) | **stdout에 따라 다름** — 스키마 통과 JSON이면 exit code는 무시되고 **JSON만으로 결과 결정**(에러 표시 없음) / 스키마 실패·파싱 실패·plain text·빈 stdout이면 비차단 에러 | 위 참조 | 비차단 에러일 때 트랜스크립트에 `<hook> hook error` + stderr 첫 줄(`Failed with non-blocking status code:`) |

- **JSON 파싱 실패**(`{`로 시작·`}`로 끝나지만 유효 JSON이 아님)는 exit 2 외 모든 exit code에서 **비차단 에러**로 보고된다. 컨텍스트 주입 이벤트에서도 그 텍스트는 주입되지 않는다. v2.1.248 이전에는 plain text로 취급됐다.
- **스키마 검증 실패 JSON**: exit 0·기타 → 비차단 에러(동작 진행) / exit 2 → 그래도 차단되고 stderr가 사유가 된다(v2.1.214 수정 — 이전에는 비차단 에러로 진행됐다).

> **exit 1은 (유효 JSON 없이는) 차단하지 않는다.** 유닉스 관례상 실패 코드지만 Claude Code는 그대로 진행한다. 정책을 강제하려면 `exit 2` 또는 exit 0 + JSON 결정. 예외: `WorktreeCreate`/`WorktreeRemove`는 non-zero 전부가 실패 처리.
>
> **exit 2 + plain text 사유는 stdout이 아니라 stderr로 써야 한다.** plain text stdout은 차단 메시지로 쓰이지 않아 모델은 "No stderr output"만 본다.

예외적으로 `UserPromptSubmit`·`UserPromptExpansion`·`SessionStart`·`PostModelSwitch`는 **exit 0 plain-text stdout이 Claude 컨텍스트에 주입**된다(컨텍스트 주입 훅의 표준 경로).

### 3-3. exit 2가 실제로 막는 것 (이벤트별)

| 이벤트 | exit 2 효과 |
|--------|-------------|
| PreToolUse | 도구 호출 차단 |
| **PermissionRequest** | **차단 아님 — exit 2는 무시되고 권한 흐름이 그대로 진행, stderr도 버려짐.** 거부는 `hookSpecificOutput.decision: { "behavior": "deny", "message": "..." }`로만 |
| UserPromptSubmit | 프롬프트 차단 + 삭제 |
| Stop / SubagentStop | 종료 차단, 대화 계속 |
| PreCompact / ConfigChange / PostToolBatch | 해당 동작 차단 |
| PreModelSwitch | 모델 전환 취소 + stderr를 사용자에게 표시 |
| **PostToolUse / PostToolUseFailure** | **차단 아님** — 도구는 이미 실행됨. stderr를 Claude에게 보여줄 뿐 |
| SessionStart·SubagentStart·PostModelSwitch | 차단 아님 — stderr가 `<hook> hook error`로 트랜스크립트에 표시, Claude는 못 봄 |
| SessionEnd·PostCompact·CwdChanged·FileChanged | 차단 아님 — stderr가 사용자에게만 표시 |
| Setup·Notification·PermissionDenied | exit code·stderr 무시 |
| InstructionsLoaded·StopFailure·MessageDisplay | exit code 자체가 무시됨 |

> 주의: PostToolUse에서 exit 2를 내면 UI에 "blocking error"라고 표시되지만 **파일 변경은 그대로 남는다.** 되돌리기가 필요하면 PreToolUse로 옮겨야 한다. (공식 레퍼런스 + anthropics/claude-code 이슈 #19009에서 동일 확인, 이슈는 not planned로 종료)

### 3-4. 구조화 JSON 출력 (exit 0 권장)

exit 0 + stdout JSON이면 더 세밀한 제어가 가능하다. (JSON은 exit code와 무관하게 읽히지만 — 3-2 — 공식 권장은 "exit code만 쓰거나, exit 0 + JSON" 중 하나)

공통 필드:
```json
{ "continue": false, "stopReason": "왜 멈추는지", "suppressOutput": true, "systemMessage": "사용자에게 보일 경고" }
```

이벤트별 결정 필드:

```jsonc
// PreToolUse — 권한 판정을 훅이 직접 내림
{ "hookSpecificOutput": {
    "hookEventName": "PreToolUse",              // hookSpecificOutput에는 이 필드가 필수
    "permissionDecision": "deny",                // allow | deny | ask | defer
    "permissionDecisionReason": "위험 명령 차단" }}

// PermissionRequest — 허용/거부 모두 decision 객체로만 (exit 2는 무시됨)
{ "hookSpecificOutput": { "hookEventName": "PermissionRequest", "decision": { "behavior": "allow" } } }
{ "hookSpecificOutput": { "hookEventName": "PermissionRequest", "decision": { "behavior": "deny", "message": "Claude에게 전달할 거부 사유" } } }
// "allow"여도 deny/ask 권한 규칙은 계속 평가된다(훅 allow가 deny 규칙을 이기지 못함)

// PreModelSwitch — PreToolUse와 같은 permissionDecision(allow|deny|ask, defer·updatedInput 불가) 또는 최상위 decision: "block"

// PostToolUse / UserPromptSubmit / Stop 등 — 최상위 decision
{ "decision": "block", "reason": "Claude에게 전달할 지시" }

// 컨텍스트 주입 (SessionStart·PreToolUse·PostToolUse 등)
{ "hookSpecificOutput": { "hookEventName": "SessionStart", "additionalContext": "..." } }
```

- `additionalContext`는 **10,000자 제한**(초과 시 파일로 저장되고 미리보기+경로만 전달).
- PreToolUse는 `updatedInput`으로 도구 인자 자체를 수정할 수도 있다.
- **JSON stdout + exit 2 혼용**: 차단은 유지되고 JSON 필드도 읽힌다. 차단 메시지는 JSON의 blocking decision reason이 있으면 그것, 없으면 stderr(스키마 실패 JSON이면 stderr). 동작은 하지만 공식 권장은 한 방식만 쓰는 것이다.
- stdout에는 JSON 객체 **하나만** 출력한다 — 셸 프로필 출력 등이 섞이면 파싱이 깨진다(파싱 실패 = 비차단 에러, 결정 무효).

---

## 4. matcher 문법

matcher 값의 **문자 구성**에 따라 해석 방식이 바뀐다.

| matcher | 해석 | 예 |
|---------|------|-----|
| `"*"`, `""`, 생략 | 전체 매칭 | 모든 도구 |
| 영문·숫자·`_`·`-`·공백·`,`·`\|`만 사용 | 정확 일치(또는 `\|` 목록) | `Bash`, `Edit\|Write` |
| 그 외 문자 포함 | **JavaScript 정규식**(앵커 없음) | `^Notebook`, `mcp__memory__.*` |

- **대소문자 구분**: `multiEdit`은 `MultiEdit`에 매칭되지 않는다.
- MCP 도구는 `mcp__<server>__<tool>` 형태 → 서버 전체는 `mcp__memory__.*`.
- 도구 이벤트가 아닌 이벤트의 matcher는 도구명이 아니라 **사유 문자열**을 매칭한다(SessionStart는 `startup|resume`, PreCompact는 `manual|auto` 등). `UserPromptSubmit`·`Stop` 등 일부 이벤트는 matcher를 지원하지 않고 항상 실행된다.
- 도구 이벤트에서는 matcher 대신/추가로 `if` 필드(권한 규칙 문법)로 더 좁힐 수 있다: `"if": "Bash(git *)"`, `"if": "Edit(*.ts)"`. `if`는 파싱 실패 시 **fail-open**(훅이 그냥 실행됨)이므로 하드 차단 용도로 의존하지 말 것.

---

## 5. settings.json 배선

3중 중첩 구조 — `이벤트 → matcher 그룹 → hooks 배열`.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node $CLAUDE_PROJECT_DIR/.claude/hooks/bash-guard.js",
            "timeout": 30
          }
        ]
      }
    ],
    "PostToolUse": [
      { "matcher": "Write|Edit", "hooks": [ { "type": "command", "command": "node $CLAUDE_PROJECT_DIR/.claude/hooks/tdd-guard.js" } ] }
    ]
  }
}
```

- **경로는 항상 `$CLAUDE_PROJECT_DIR`(또는 `${CLAUDE_PROJECT_DIR}`) 기준 절대경로**로 쓴다. 훅은 임의의 cwd에서 실행될 수 있다. 플러그인은 `${CLAUDE_PLUGIN_ROOT}`.
- **경로 오타 = 정책 훅이 조용히 꺼짐.** 스크립트가 없거나 실행 불가면 셸이 127 등으로 종료 → **비차단 에러**(`Failed with non-blocking status code: /bin/sh: ...: No such file or directory`)로 처리되고 동작은 그대로 진행된다. 차단형 훅은 배선 직후 첫 실행에서 이 notice가 없는지 반드시 확인한다.
  - 위 127 형태는 스크립트 경로를 **직접** 실행할 때다. 위 예시처럼 `node $CLAUDE_PROJECT_DIR/...js`로 인터프리터를 앞에 두면 셸이 아니라 node가 **exit 1**(`Error: Cannot find module '...'`)로 끝난다 — 결과는 똑같이 비차단 통과이므로, notice를 `No such file`만으로 찾지 말고 `Cannot find module`도 확인한다. (2026-09-28 실행 확인, Claude Code 2.1.283)
- 매칭된 훅은 **모두 병렬 실행**된다. 서로의 결과에 의존하는 순서 가정을 하지 말 것.
- 설정 위치별 범위: `~/.claude/settings.json`(전역, 비공유) · `.claude/settings.json`(프로젝트, 커밋) · `.claude/settings.local.json`(로컬, gitignore) · 플러그인 `hooks/hooks.json` · 스킬/에이전트 frontmatter(해당 컴포넌트 활성 동안만).
- 핸들러 타입: `command`(셸), `http`(POST), `mcp_tool`, `prompt`(모델 판정), `agent`(서브에이전트, 실험적).
- `command`에 `args` 배열을 주면 셸을 거치지 않는 exec 형태로 실행된다(특수문자 그대로 전달). 파이프·`&&`가 필요하면 `args`를 생략.
- 전체 비활성화는 `"disableAllHooks": true`. 개별 훅만 끄는 옵션은 없다 — 항목을 지워야 한다.

### 타임아웃

| 핸들러/이벤트 | 기본 타임아웃 |
|------|------|
| `command`·`http`·`mcp_tool` | **600초** |
| `prompt` | 30초 |
| `agent` | 60초 |
| UserPromptSubmit의 command/http/mcp_tool | 30초 |
| MessageDisplay | 10초 |
| PreModelSwitch | 30초 — **타임아웃 시 전환 차단**(PreToolUse command 훅은 타임아웃 시 차단 안 됨·정상 권한 흐름 진행) |
| SessionEnd | 훅들이 공유하는 1.5초 예산(개별 `timeout` 지정 시 최대 60초까지 상향) |

핸들러의 `timeout`(초) 필드로 개별 조정한다. 비차단 부가 작업은 `"async": true`로 백그라운드 실행할 수 있다.

---

## 6. 차단형 vs 비차단형 설계

| 구분 | 차단형(blocking) | 비차단형(observing) |
|------|------------------|---------------------|
| 대표 이벤트 | PreToolUse, PermissionRequest, Stop, UserPromptSubmit | PostToolUse(관찰), SessionStart, InstructionsLoaded, Notification |
| 종료 규약 | 위반 시 stderr + `exit 2` (**PermissionRequest만 예외** — exit 0 + `decision.behavior: "deny"`) | 항상 `exit 0` |
| 오탐 비용 | **치명적** — 정상 작업이 막힘 | 낮음(잡음만) |
| 이 레포 규칙 | **`*.test.js` 필수** | 테스트 선택 |
| 실패 시 동작 | 예외 발생해도 `exit 0`으로 빠져나갈 안전장치 필요 | 동일 |

이 레포의 실제 배선 예: 차단형 = `bash-guard`(위험 Bash deny) · `parry`/`protect-secrets`(시크릿 저장 차단) · `skill-md-guard`/`verification-guard`/`agent-md-guard`(구조 위반 저장 차단) · `deliverable-guard`(README·PENDING_TEST 미완 시 종료 차단) · dev 전용 `tdd-guard`/`adversarial-test-guard`/`fake-impl-guard`. 비차단형 = `session-start`·`instructions-loaded`·`staleness-check`·`session-export`·`cc-notify`·`memory-sync`.

---

## 7. 검증된 구현 패턴 (실제 동작 코드 기준)

### 7-1. Node 훅 스켈레톤 — 안전장치 우선

```js
#!/usr/bin/env node
const readline = require('readline')

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()
  if (!raw) return process.exit(0)                       // 입력 없음 → 통과

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }  // 파싱 실패 → 통과

  const eventName = input.hook_event_name || input.hookEventName
  const { tool_name, tool_input = {}, cwd } = input

  // ...검사 로직...

  process.exit(0)
}

main().catch(() => process.exit(0))   // 예상 못한 예외로 작업을 막지 않는다
```

핵심 3가지:
1. **입력 파싱 실패·예외는 전부 `exit 0`** — 훅 버그가 사용자의 작업을 막아선 안 된다(`memory-sync.js`의 `catch {}` 주석: "Claude 작업 절대 차단 금지").
2. `hook_event_name`과 `hookEventName` 양쪽을 읽어 이벤트를 판별(하나의 파일이 여러 이벤트에 배선되는 구조).
3. 검사 대상이 아니면 **가능한 한 빨리 exit 0** — 경로 패턴·확장자로 먼저 걸러낸다.

### 7-2. 한 파일 · 여러 이벤트 (bash-guard.js)

```js
const result = eventName === 'PermissionRequest' ? handlePermissionRequest(tool_name, tool_input)
             : eventName === 'PostToolUse'       ? handlePostToolUse(tool_name, tool_input)
             :                                     handlePreToolUse(tool_name, tool_input, cwd)

if (result) process.stdout.write(JSON.stringify(result) + '\n')
process.exit(0)
```

- 훅 개수를 늘리지 않고 이벤트별 동작을 한 모듈에 모은다(훅 스태킹 = 매 도구 호출마다 프로세스 N개).
- **판정이 없으면 아무것도 출력하지 않는다(`null` 반환)** → 다른 훅·기본 권한 흐름에 위임. 훅이 `allow`를 남발하면 다른 방어선이 무력화된다.
- 테스트 가능하게 만들려면 판정 함수를 `module.exports`로 내보내고 `if (require.main === module) main()`으로 실행부를 감싼다.

### 7-3. 차단 + 사유 전달 (tdd-guard.js)

```js
if (!hasTest) {
  // exit 2 차단 시 모델에 전달되는 메시지는 stderr (plain text stdout은 차단 메시지로 쓰이지 않음)
  process.stderr.write(`[tdd-guard] 테스트 파일 없음: ${rel}\n즉시 생성하세요: ${basename}.test${ext}\n`)
  process.exit(2)
}
```

- 메시지에 **훅 이름 접두사 + 무엇을 하면 통과하는지**를 넣는다. 모델이 바로 후속 행동을 할 수 있어야 한다.
- PostToolUse에서 JSON으로 피드백하려면 exit 2가 아니라 **exit 0 + `{"decision":"block","reason":...}`** 를 쓴다(bash-guard의 PostToolUse 경로가 이 형태).

### 7-4. 테스트 코드 패턴 (`*.test.js`)

훅은 프로세스 경계로 테스트한다 — 입력 JSON을 stdin에 넣고 exit code와 stderr를 검사.

```js
const { spawnSync } = require('child_process')
const input = JSON.stringify({
  hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: filePath },
})
const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000 })
// 차단 케이스: exit code + 사유 전달 경로(stderr)까지 함께 검증
const pass = r.status === 2 && r.stderr.includes('[tdd-guard]')
```

필수 3계층 (`.claude/rules/adversarial-testing.md`, 설치된 경우):
- 정상: 통과해야 하는 입력 → `exit 0`
- 차단: 위반 입력 → `exit 2` **그리고 stderr에 사유 포함**(stdout 유실 회귀 방지)
- 경계·오탐 방지: 빈 stdin, 깨진 JSON, `file_path` 없음, 검사 제외 대상(설정 파일·훅 자신·테스트 파일 자체) → `exit 0`

---

## 8. 실전 함정 (실제 사고 기록)

### 8-1. 차단 사유를 stdout에 쓴 버그 (2026-08-03, tdd-guard)

`exit 2`로 차단하면서 사유를 `process.stdout.write`(plain text)로 출력 → **exit 2에서 plain text stdout은 차단 메시지로 쓰이지 않으므로**(메시지는 JSON blocking reason 또는 stderr) 모델은 "No stderr output"만 받고 왜 막혔는지 몰랐다. `process.stderr.write`로 교체 후 해결. 같은 날 두 번째 버그는 `.ts` 소스 + `.test.tsx` 테스트(React 훅 renderHook 표준 구조)를 "테스트 없음"으로 **오탐 차단**한 것 — 교차 확장자 탐색으로 수정. 두 건 모두 회귀 테스트를 추가해 재발을 막았다(tdd-guard 테스트 9→13건).

교훈: 차단형 훅의 테스트는 **exit code뿐 아니라 사유가 전달되는 스트림까지** 검증해야 한다.

### 8-2. 오탐이 훅 폐기로 이어진 사례 (task-plan-guard · confirmation-gate)

두 훅은 "복잡한 작업 요청 시 계획 확인 절차를 강제"하는 차단형이었다. 단순 요청까지 계획 확인을 요구하는 **오탐이 반복되면서 제거**되고, 그 자리는 네이티브 **Plan Mode**와 규칙 문서(`.claude/rules/task-workflow.md`, 설치된 경우)로 대체됐다. 2026-07 훅 다이어트에서 훅 29→22종으로 정리된 흐름의 일부다.

교훈:
- 자연어 의도(=회색지대)를 정규식으로 판정하는 차단형 훅은 오탐률이 구조적으로 높다. **구조적으로 판정 가능한 대상**(파일 경로, 명령 문자열, 파일 존재 여부)만 차단형으로 만든다.
- 판단이 필요한 영역은 훅이 아니라 네이티브 기능·규칙·`type: "prompt"` 훅으로 보낸다.
- 2026-07-03 발생한 오탐 4건이 **전부 테스트 없는 훅**에서 나왔다 → 이 레포는 이후 "차단형 훅은 `*.test.js` 필수" 규칙을 도입했다.
- 같은 맥락에서 보호 파일 Bash 차단도 "모든 사용"에서 **"쓰기 연산만"**으로 축소됐다 — 읽기 전용 `grep`/`diff`/`cat`이 막히는 오탐 때문.

### 8-3. 그 외 흔한 실수

| 실수 | 결과 | 교정 |
|------|------|------|
| 정책 위반에 `exit 1` (유효 JSON 없음) | 그냥 통과됨 | `exit 2` |
| `exit 1`이면 안전하게 무시될 거라 가정하고 stdout에 JSON 출력 | 스키마 통과 JSON이면 **exit code 무시·JSON이 결과 결정**(allow 등이 그대로 적용) | 판정 없을 땐 stdout에 아무것도 쓰지 않음 |
| PermissionRequest에서 `exit 2`로 거부 | **무시됨** — 권한 흐름 그대로 진행, stderr 폐기 | exit 0 + `decision: {"behavior":"deny","message":...}` |
| PostToolUse `exit 2`로 되돌리려 함 | 파일은 이미 변경됨 | PreToolUse로 이동 |
| JSON stdout + `exit 2` 병용 | 차단은 되지만 메시지 출처가 JSON reason/stderr로 갈려 헷갈림 | exit 0 + JSON **또는** exit 2 + stderr 한 방식만 |
| `{...}` 형태인데 깨진 JSON 출력 | 비차단 에러, 결정·컨텍스트 무효 (v2.1.248+) | `JSON.stringify` 한 번만, 다른 출력 섞지 않기 |
| settings.json 경로 오타 | exit 127(직접 실행) / exit 1(`node <경로>`, Cannot find module) → 비차단 에러로 **정책 훅이 조용히 무력화** | 배선 후 첫 실행 notice 확인, 경로 존재 검사 |
| `hookSpecificOutput`에 `hookEventName` 누락 | 결정이 적용되지 않음 | 필수 필드 추가 |
| 상대 경로 `command` | cwd에 따라 실행 실패 | `$CLAUDE_PROJECT_DIR` 절대경로 |
| matcher `multiEdit` | 매칭 안 됨(대소문자 구분) | `MultiEdit` |
| 훅 예외를 그대로 throw | 비차단 에러 잡음, 최악엔 작업 방해 | `catch → exit 0` |
| 정상 흐름만 테스트 | 오탐이 프로덕션에서 발견됨 | 제외 대상·깨진 입력 케이스 필수 |

---

## 9. 훅 추가 체크리스트

- [ ] 이 검사가 **비가역 사고를 막는가**? (아니면 rules 한 줄로 충분)
- [ ] 판정 대상이 구조적인가(경로·명령·파일 존재)? 자연어 의도 추론이면 차단형 금지
- [ ] 이벤트 선택이 맞는가 — 막아야 하면 PreToolUse, 관찰이면 PostToolUse
- [ ] matcher가 필요한 도구만 좁히는가(대소문자 확인)
- [ ] 차단 시 `exit 2` + **stderr**에 "무엇을 하면 통과하는지" 명시 (PermissionRequest는 exit 0 + `decision` deny)
- [ ] 예외·파싱 실패 시 `exit 0` 안전장치
- [ ] `$CLAUDE_PROJECT_DIR` 절대경로로 settings.json 배선
- [ ] 차단형이면 `*.test.js` 작성 — 정상/차단(사유 스트림 포함)/제외·깨진 입력 3계층
- [ ] 오탐 후보(설정 파일·훅 자신·생성 파일·워크트리)를 제외 목록에 반영
- [ ] `/hooks`로 등록 확인, `claude --debug-file /tmp/claude.log` + `tail -f`로 실제 실행 로그 확인

---

## 10. 디버깅

- `/hooks` — 이벤트별 등록 현황·matcher·소스 파일 확인(읽기 전용. 추가·수정은 설정 JSON 직접 편집).
- `Ctrl+O` 트랜스크립트: exit 0은 아무것도 안 보임 / exit 2는 stderr 표시 / 그 외는 `<hook> hook error` + stderr 첫 줄(`Failed with non-blocking status code:`).
- `claude --debug-file /tmp/claude.log` (또는 세션 중 `/debug`) — 매칭된 훅·exit code·stdout·stderr 전체 확인.
- 로컬 재현: `echo '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"rm -rf /"}}' | node .claude/hooks/bash-guard.js; echo "exit=$?"`
- 훅은 **비대화형 셸**에서 실행된다 — 대화형 전제(프롬프트 입력, `$-`에 `i` 포함 가정)를 두지 말 것.
- headless 재현: 임시 git 프로젝트의 `.claude/settings.json`에 배선하고 `claude -p "<프롬프트>" --output-format json --debug-file <로그>`로 트리거하면 된다. `PermissionRequest`는 **실제로 권한 판정이 필요한 호출**에서만 발화한다 — `-p --permission-mode default`에서 쓰기 명령(`mkdir` 등)은 발화했고, 읽기 전용으로 자동 허용되는 명령(`printf` 등)은 발화하지 않았다(2026-09-28 실행 확인, 2.1.283).

---

## 11. 보안 주의

훅은 사용자 권한으로 임의 셸 명령을 실행한다. 입력값(`tool_input.file_path`, `tool_input.command`)은 **신뢰할 수 없는 문자열**로 취급한다.

- 셸 문자열에 입력을 그대로 보간하지 않는다(인젝션). `args` exec 형태나 언어 내장 파일 API를 쓴다.
- 경로는 `path.resolve` 후 **허용 디렉터리 경계 검사**를 한다 — `..`·심볼릭 링크·절대경로 우회 차단(`bash-guard.js`의 `isUnderAllowed` 패턴).
- 민감 파일(`.env`, `*.pem`, `~/.ssh/`, 셸 시작 파일)은 읽기·쓰기 양쪽에서 제외한다.
- 설정 파일 변경은 파일 워처가 감지해 반영된다 — 신뢰할 수 없는 레포의 `.claude/settings.json`을 검토 없이 실행하지 않는다.
