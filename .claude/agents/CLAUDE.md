@.claude/rules/agent-design.md

## 파일·폴더 규칙

에이전트 파일: `.claude/agents/{category}/{name}.md`

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
---
```

새 카테고리 추가 시 `docs/agents/{category}/` 문서 폴더도 함께 생성한다.

## README 업데이트

에이전트 추가·수정·삭제·이름변경 시 README.md 에이전트 목록과 업데이트 로그를 반드시 동기화한다.
