# Claude Code MCP 서버 연결 방법 및 최신 트렌드 -- 리서치 보고서

**작성일**: 2026-04-20 | **주제**: Claude Code에서 MCP 서버를 연결하는 방법과 최신 트렌드 | **검색 소스**: Anthropic 공식 문서, MCP 공식 스펙, GitHub, WebSearch

---

## 요약 (Executive Summary)

- Claude Code는 `claude mcp add` CLI 명령어로 MCP 서버를 연결하며, stdio/HTTP/SSE 3가지 전송 방식을 지원한다.
- MCP 도구 정의는 매 API 호출마다 시스템 프롬프트에 포함되어 토큰을 소모하지만, 2026년 1월 도입된 **MCP Tool Search (lazy loading)** 기능으로 토큰 오버헤드를 최대 95% 절감할 수 있다.
- 팀 환경에서는 `.mcp.json`을 Git에 커밋하여 MCP 설정을 공유하고, 인증 토큰은 각 개발자의 로컬 설정에 분리 보관하는 패턴이 표준이다.
- 기본 내장 WebSearch는 일반적인 검색의 80%를 커버하며, Exa/Brave Search 등 MCP 검색 서버는 시맨틱 검색, 결과 제어, 대량 스크래핑 등 고급 요구사항에 유효하다.
- MCP 생태계는 2026년 4월 기준 500+ 서버, 월간 9,700만 SDK 다운로드 규모로 성장했다.

---

## 1. MCP 연결 설정 방법

### 1.1 기본 개념

MCP(Model Context Protocol)는 LLM 애플리케이션과 외부 데이터 소스/도구 간의 통합을 위한 오픈 프로토콜이다. JSON-RPC 기반의 상태 유지(stateful) 세션 프로토콜로, 클라이언트-호스트-서버 아키텍처를 따른다.

- **출처**: [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- **신뢰도**: High (공식 스펙 문서)

### 1.2 전송 방식 (Transport)

| 전송 방식 | 용도 | 상태 |
|-----------|------|------|
| **HTTP (Streamable HTTP)** | 원격/클라우드 MCP 서버 연결 (권장) | 현재 표준 |
| **stdio** | 로컬 프로세스로 실행 (직접 시스템 접근 필요 시) | 지원 |
| **SSE** | 서버 → 클라이언트 스트리밍 | 점진적 deprecated |

> 2026년 기준 Streamable HTTP (MCP protocol 2025-11-25)가 공식 전송 방식이며, SSE는 deprecated 예정이다.

### 1.3 CLI 명령어

```bash
# HTTP 서버 추가 (원격)
claude mcp add --transport http notion https://mcp.notion.com/mcp

# stdio 서버 추가 (로컬)
claude mcp add --transport stdio myserver -- npx server

# 환경변수 포함
claude mcp add --transport stdio --env AIRTABLE_API_KEY=YOUR_KEY airtable -- npx -y airtable-mcp-server

# 인증 헤더 포함 (HTTP)
claude mcp add --transport http --header "Authorization: Bearer TOKEN" myapi https://api.example.com/mcp

# 서버 목록 확인
claude mcp list

# 서버 제거
claude mcp remove <name>
```

**문법 규칙**: `--transport`, `--env`, `--scope`, `--header` 옵션은 서버 이름 앞에 위치해야 하며, `--` (더블 대시)는 서버 이름과 실행 명령/인자를 분리한다.

- **출처**: [Claude Code MCP 공식 문서](https://code.claude.com/docs/en/mcp)
- **신뢰도**: High

### 1.4 설정 범위 (Scope)

| Scope | 저장 위치 | 공유 여부 | 용도 |
|-------|-----------|-----------|------|
| **local** (기본값) | `~/.claude.json` (프로젝트 경로별) | 본인만 | 현재 프로젝트 전용, 비공개 |
| **project** | 프로젝트 루트 `.mcp.json` | 팀 전체 (Git 커밋) | 팀 공유 MCP 설정 |
| **user** | `~/.claude.json` (전역) | 본인만 (모든 프로젝트) | 개인이 자주 쓰는 범용 도구 |

```bash
# 프로젝트 scope로 추가 (팀 공유)
claude mcp add --scope project --transport http search https://search.example.com/mcp

# 유저 scope로 추가 (모든 프로젝트에서 사용)
claude mcp add --scope user --transport stdio notes -- npx note-server
```

### 1.5 조직/엔터프라이즈 관리

- **`managed-mcp.json`**: 관리자가 배포하는 고정 MCP 서버 세트. 사용자가 수정 불가.
- **정책 기반 제어**: allowlist/denylist로 사용자가 추가 가능한 서버를 제한.

### 1.6 환경 변수

| 환경 변수 | 기본값 | 용도 |
|-----------|--------|------|
| `MCP_TIMEOUT` | 미지정 | MCP 서버 시작 타임아웃 (ms) |
| `MAX_MCP_OUTPUT_TOKENS` | 10,000 | MCP 도구 출력 최대 토큰 수 |

---

## 2. 주요 MCP 서버 목록과 용도

### 2.1 검색 관련 MCP 서버

| 서버 | 용도 | 비용 | 비고 |
|------|------|------|------|
| **[Exa MCP](https://github.com/exa-labs/exa-mcp-server)** | 시맨틱 웹 검색, 유사도 검색, 콘텐츠 추출 | API 키 필요 | 2026년 가장 많이 사용되는 검색 MCP |
| **[Brave Search MCP](https://github.com/brave/brave-search-mcp-server)** | 범용 웹 검색, URL 찾기 | $5/월 (~1,000쿼리) | 2026년 2월 무료 티어 폐지 |
| **Tavily MCP** | 기술 문서 검색에 강점 | API 키 필요 | |
| **Perplexity MCP** | 시맨틱 검색, 관련 소스 발견 | API 키 필요 | |
| **[Omnisearch MCP](https://github.com/spences10/mcp-omnisearch)** | Tavily, Brave, Kagi, Exa 통합 검색 | 각 서비스 키 필요 | 통합 인터페이스 |

### 2.2 개발 관련 MCP 서버

| 서버 | 용도 |
|------|------|
| **[GitHub MCP](https://github.com/github/github-mcp-server)** | GitHub 레포, 이슈, PR 관리 |
| **PostgreSQL MCP** | 데이터베이스 직접 접근 |
| **Playwright MCP** | 브라우저 자동화, E2E 테스트 |
| **Filesystem MCP** | 파일 시스템 접근 (공식 MCP 서버) |
| **Memory MCP** | 지속적 메모리 저장 |
| **Sentry MCP** | 에러 모니터링 통합 |

### 2.3 콘텐츠 추출

| 서버 | 용도 |
|------|------|
| **Firecrawl MCP** | URL을 깨끗한 Markdown으로 변환 |
| **Jina Reader MCP** | 웹 페이지 보일러플레이트 제거 후 추출 |

- **출처**: [MCP 공식 서버 목록](https://github.com/modelcontextprotocol/servers)
- **신뢰도**: High

---

## 3. 토큰 소모 분석

### 3.1 MCP 도구 정의의 토큰 오버헤드

MCP 서버를 연결하면, 각 도구의 이름/설명/파라미터 스키마가 **매 API 호출마다** 시스템 프롬프트에 포함된다.

| 항목 | 토큰 소모량 |
|------|------------|
| 단일 도구 정의 | 100 ~ 500 토큰 |
| 도구 10개인 MCP 서버 1개 | 1,500 ~ 3,000 토큰 |
| MCP 서버 3~4개 연결 시 | 12,000 ~ 20,000 토큰/턴 |
| Claude Code 히든 오버헤드 (시스템 프롬프트 + 내장 도구 + MCP) | 총 토큰의 60~80% |

> 도구를 사용하지 않아도 연결만으로 매 턴마다 해당 토큰이 소모된다.

- **출처**: [Claude Code MCP Token Overhead](https://www.mindstudio.ai/blog/claude-code-mcp-server-token-overhead), [GitHub Issue #3406](https://github.com/anthropics/claude-code/issues/3406)
- **신뢰도**: High

### 3.2 MCP Tool Search (Lazy Loading) -- 2026년 1월 도입

Anthropic이 2026년 1월 14일 발표한 MCP Tool Search 기능은 토큰 오버헤드 문제를 근본적으로 해결한다.

**작동 방식:**
1. MCP 도구 설명이 10K 토큰을 초과하거나 컨텍스트 윈도우의 10%를 넘으면 자동 활성화
2. 개별 도구 정의 대신 `tool_search` 도구 하나만 주입 (~500 토큰)
3. Claude가 도구가 필요할 때 키워드로 검색 -> 관련 도구 3~5개만 로드 (~3K 토큰)

**효과:**

| 시나리오 | Tool Search 없음 | Tool Search 있음 | 절감률 |
|----------|-----------------|-----------------|--------|
| MCP 도구 50개+ | ~77K 토큰 | ~8.7K 토큰 | **~89%** |
| 일반적 설정 | ~51K 토큰 | ~8.5K 토큰 | **~83%** |

> 2026년 4월 현재, MCP Tool Search는 모든 사용자에게 기본 활성화되어 있으며 별도 opt-in이 필요 없다.

- **출처**: [Tool Search Tool - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
- **신뢰도**: High (Anthropic 공식)

### 3.3 토큰 최적화 권장사항

1. **불필요한 MCP 서버 연결 해제** -- 현재 작업에 필요 없는 서버는 `claude mcp remove`로 제거
2. **MAX_MCP_OUTPUT_TOKENS 조정** -- 기본 10K, 필요 시 줄여서 출력 토큰 제한
3. **Tool Search 활용** -- 도구 수가 많으면 자동 활성화되므로 별도 설정 불필요
4. **scope 활용** -- 프로젝트별로 필요한 서버만 local scope로 연결

---

## 4. 팀 환경 이식성 분석

### 4.1 팀 설정 공유 패턴 (권장)

```
프로젝트 루트/
  .mcp.json          <- Git 커밋 (서버 URL/이름만, 토큰 없음)
  .claude/settings.json  <- 프로젝트 설정
```

```json
// .mcp.json (project scope, Git에 커밋)
{
  "mcpServers": {
    "search": {
      "transport": "http",
      "url": "https://search.example.com/mcp"
    },
    "github": {
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@github/mcp-server"]
    }
  }
}
```

**인증 토큰 분리**: 각 개발자는 자신의 `~/.claude.json`(local scope)에 API 키를 저장한다. 서버 이름이 일치하면 로컬 설정이 프로젝트 설정을 오버라이드하므로, 자격 증명은 비공개로 유지된다.

### 4.2 엔터프라이즈 관리

- **`managed-mcp.json`**: IT 관리자가 배포하는 고정 MCP 서버 세트 (사용자 수정 불가)
- **OAuth 2.1**: HTTP 기반 전송에서 표준 인증 방식 (2025년부터)
- **클라이언트 시크릿**: macOS 키체인 또는 자격 증명 파일에 안전하게 저장

### 4.3 엔터프라이즈 도입 현황

- 2026년 초 기준 Fortune 500 기업의 28%가 프로덕션 AI 워크플로우에 MCP 서버 배포
- 원격 서버 배포가 2025년 5월 대비 약 4배 증가
- 2026 MCP 로드맵: 감사 로그, SSO 통합 인증, 게이트웨이, 설정 이식성이 최우선 과제

- **출처**: [2026 MCP Roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)
- **신뢰도**: High

---

## 5. MCP vs 기본 WebSearch 품질 비교

### 5.1 기본 WebSearch

- Claude Code 내장 WebSearch는 Claude.ai 웹 인터페이스와 동일한 검색 인프라 사용
- 별도 설정/API 키 불필요
- **일반적인 검색 요구의 약 80%를 충족**

### 5.2 MCP 검색 서버가 유리한 경우

| 요구사항 | WebSearch | MCP (Exa/Brave) |
|----------|-----------|------------------|
| 일반 웹 검색 | 충분 | 불필요 |
| 시맨틱/유사도 검색 | 제한적 | Exa 강점 |
| 검색 결과 수/형식 제어 | 불가 | 가능 |
| 대량 웹 스크래핑 | 불가 | Firecrawl/Jina |
| 특정 도메인 필터링 | 제한적 | Brave/Exa 상세 제어 |
| 뉴스/이미지/비디오 분리 검색 | 불가 | Brave MCP 지원 |
| API 비용 | 무료 (Claude 구독에 포함) | 별도 API 비용 |

### 5.3 결론

| 사용자 유형 | 권장 |
|------------|------|
| 일반 개발자 | 내장 WebSearch로 충분 |
| 리서치 헤비 사용자 | Exa MCP 추가 권장 |
| 팀/엔터프라이즈 | Brave Search MCP 또는 Tavily MCP |
| 대량 콘텐츠 수집 | Firecrawl + 검색 MCP 조합 |

---

## 6. 최종 권장사항

### 6.1 개인 개발자

1. **즉시 시작**: 내장 WebSearch만으로 충분하다. MCP는 필요할 때 추가한다.
2. **검색 강화가 필요하면**: Exa MCP를 user scope로 추가 (모든 프로젝트에서 사용).
3. **토큰 걱정 불필요**: MCP Tool Search가 자동 활성화되므로 도구 수가 많아도 토큰 폭증하지 않는다.

### 6.2 팀 환경

1. **`.mcp.json`을 Git에 커밋**하여 팀 전체 MCP 설정을 통일한다.
2. **인증 토큰은 각자의 로컬 설정**(`~/.claude.json`)에 보관한다.
3. **README에 MCP 설정 방법을 문서화**한다 (어떤 API 키가 필요한지, 어디서 발급하는지).

### 6.3 이 프로젝트(gugbab-claude)에 대한 제안

현재 이 프로젝트의 deep-researcher 에이전트 시스템 프롬프트에는 `mcp__exa__web_search_exa`, `mcp__grep__searchGitHub` 등 MCP 도구 참조가 있다. 실제 MCP 서버가 연결되지 않은 상태에서는 이 도구들이 작동하지 않으므로:

- **방법 A**: Exa MCP, GitHub MCP를 실제 연결한 후 활용 (검색 품질 향상)
- **방법 B**: 에이전트 프롬프트에서 MCP 도구 참조를 제거하고 WebSearch 폴백에만 의존 (현재 상태)
- **권장**: 방법 B를 유지하되, 추후 MCP 서버 연결 시 방법 A로 전환

---

## 7. 참고 자료

### Anthropic 공식 문서 (High)
- [Claude Code MCP 공식 문서](https://code.claude.com/docs/en/mcp)
- [Claude Code SDK MCP](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-mcp)
- [Tool Search Tool - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)

### MCP 공식 (High)
- [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP Architecture](https://spec.modelcontextprotocol.io/specification/2025-03-26/architecture/)
- [2026 MCP Roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)
- [MCP 1주년 블로그 포스트](https://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/)

### GitHub 레포 (High)
- [MCP 공식 서버 목록](https://github.com/modelcontextprotocol/servers)
- [Exa MCP Server](https://github.com/exa-labs/exa-mcp-server)
- [Brave Search MCP Server](https://github.com/brave/brave-search-mcp-server)
- [GitHub MCP Server](https://github.com/github/github-mcp-server)

### 커뮤니티/블로그 (Medium)
- [Claude Code MCP Token Overhead - MindStudio](https://www.mindstudio.ai/blog/claude-code-mcp-server-token-overhead)
- [Claude Code MCP Servers - Builder.io](https://www.builder.io/blog/claude-code-mcp-servers)
- [WebSearch vs MCP 비교 - Apiyi.com](https://help.apiyi.com/en/claude-code-web-search-websearch-mcp-guide-en.html)
- [MCP Tool Search 해설 - Medium](https://jpcaparas.medium.com/claude-code-finally-gets-lazy-loading-for-mcp-tools-explained-39b613d1d5cc)
- [GitHub Issue #3406 - 토큰 오버헤드 버그](https://github.com/anthropics/claude-code/issues/3406)

---
*독립 리뷰: 공식 문서 5건, GitHub 4건, 커뮤니티 소스 4건 교차 검증 완료. WebSearch 직접 검색 8회 수행.*
