---
name: MCP 미사용 결정
description: MCP 서버 연결 없이 WebSearch/WebFetch만 사용 — 팀 이식성 우선
type: project
originSessionId: b0c5da5d-e263-4ea4-86af-17b46b6e9172
---
web-searcher 에이전트에서 MCP 도구(mcp__exa__, mcp__grep__)를 제거하고 WebSearch/WebFetch만 사용하기로 결정 (2026-04-20).

**Why:** gugbab-claude의 핵심 가치는 project-install.sh로 팀원이 바로 쓸 수 있는 환경. MCP를 추가하면 팀원마다 API 키 발급 + MCP 서버 설정이 필요해 이식성이 깨짐.

**How to apply:** 에이전트 frontmatter에 mcp__ 접두사 도구를 넣지 않는다. 나중에 개인 용도로 Exa 같은 MCP를 쓰고 싶으면 .mcp.json으로 별도 추가.
