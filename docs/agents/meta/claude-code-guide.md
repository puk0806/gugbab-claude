# claude-code-guide

> Claude Code CLI / MCP / 훅 / API 관련 질문에 공식 문서 기반으로 답변하는 에이전트

| 항목 | 내용 |
|------|------|
| 파일 | `.claude/agents/meta/claude-code-guide.md` |
| 모델 | Sonnet |
| 도구 | WebSearch, WebFetch, Read |
| 호출 | "Claude Code 훅 어떻게 설정해?", "MCP 서버 추가 방법", "Anthropic SDK 스트리밍 예제" 등 |

---

## 역할

Claude Code CLI 기능, 훅(hooks), MCP 서버, 설정(settings.json), IDE 연동, 단축키, Claude API / Anthropic SDK 사용법에 대한 질문을 공식 문서 기반으로 답변합니다. 검증되지 않은 내용은 답변하지 않고 공식 문서 링크를 제공합니다.

---

## 활용 테스트 기록

### 테스트 케이스 1: 훅 설정 방법

**질문:** Claude Code에서 훅(hooks)을 설정하는 방법과 훅 타입

**판정:** ✅ PASS

**요약:** PreToolUse, PostToolUse, PermissionRequest, Stop 훅 이벤트 정확히 식별. 설정 경로(`~/.claude/settings.json`, `.claude/settings.json`) 정확. command/prompt/agent/http 훅 타입 반환. 공식 문서 링크(code.claude.com/docs/en/hooks) 포함.

---

### 테스트 케이스 2: MCP 서버 추가

**질문:** MCP 서버를 추가하고 사용하는 방법

**판정:** ✅ PASS

**요약:** `mcpServers` 설정 구조 정확. `@` 리소스 참조 방법 설명. 공식 문서(code.claude.com/docs/en/mcp) 링크 포함.

---

### 테스트 케이스 3: Python SDK 스트리밍

**질문:** Claude API Python SDK 스트리밍 메시지 처리 코드 예시

**판정:** ✅ PASS

**요약:** `client.messages.stream()` 컨텍스트 매니저 패턴 정확. `text_stream` 반복자 사용 정확. 비동기(`AsyncAnthropic`) 버전도 제공. 공식 문서 링크 포함.

---

## 검증 체크리스트

- [✅] 공식 문서 기반 답변 (code.claude.com, docs.anthropic.com)
- [✅] 3개 테스트 케이스 전항목 PASS
- [✅] 부정확한 정보 없음 (훅 타입, MCP 설정, SDK API 모두 정확)
- [✅] 공식 문서 링크 포함

---

## 최종 판정

**APPROVED** — 3개 테스트 케이스 전항목 PASS. 공식 문서 기반 답변 확인.

| 테스트일 | 2026-04-08 |
|----------|------------|
