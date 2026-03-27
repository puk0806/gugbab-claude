# Claude Code 서브에이전트 활용 Best Practice -- 리서치 보고서

**작성일**: 2026-03-26 | **주제**: Claude Code 서브에이전트 활용 best practice | **검색 소스**: WebSearch, WebFetch

## 요약 (Executive Summary)

Claude Code의 서브에이전트는 독립된 컨텍스트 윈도우에서 특화된 작업을 수행하는 전문 AI 어시스턴트이다. 2025-2026년 기준으로 서브에이전트 활용은 단순 코드 자동완성을 넘어 병렬 리서치, 보안 감사, 테스트 자동화, 멀티 에이전트 협업 등 프로덕션 수준의 워크플로우로 진화했다. 학술 연구에서는 멀티 에이전트 오케스트레이션이 단일 에이전트 대비 100% 실행 가능한 권고사항 생성률(단일 에이전트 1.7%)을 달성했으며, Anthropic 내부에서는 16개 에이전트가 병렬로 10만 줄 규모의 C 컴파일러를 Rust로 구축하는 데 성공했다. 핵심 best practice는 다음과 같다:

1. **3-4개 이하의 집중된 서브에이전트** 운용으로 의사결정 오버헤드 최소화
2. **읽기 전용 도구 제한**과 후크 기반 검증을 통한 안전성 확보
3. **모델 티어링**(Opus-Sonnet-Haiku)을 통한 비용 최적화
4. **퍼시스턴트 메모리**를 활용한 세션 간 학습 축적
5. **서브에이전트 vs 에이전트 팀**의 명확한 사용 기준 수립

## 1. 논문 & 학술 연구

### 1.1 Multi-Agent LLM Orchestration for Incident Response (2026.01)
- **출처**: https://arxiv.org/abs/2511.15755
- **신뢰도**: High (peer-reviewed, 348 controlled trials)
- **핵심 내용**: MyAntFarm.ai 프레임워크를 통해 단일 에이전트 vs 멀티 에이전트 시스템을 348회 통제 실험으로 비교하였다. 멀티 에이전트가 100% 실행 가능한 권고사항 생성률을 달성한 반면, 단일 에이전트는 1.7%에 불과했다. 행동 특이성 80배, 솔루션 정확도 140배 향상을 보였다. 양 아키텍처 모두 이해 속도는 약 40초로 유사하여, 핵심 가치는 속도가 아닌 **신뢰성**에 있음을 입증했다. Decision Quality(DQ)라는 새로운 평가 메트릭을 도입하여 유효성, 특이성, 정확도를 통합 측정했다.
- **시사점**: 멀티 에이전트 오케스트레이션은 단순 성능 향상이 아닌 **프로덕션 준비성의 전제 조건**으로 재정의되어야 한다. 결정적(deterministic) 행동이 SLA 커밋을 가능하게 한다.

### 1.2 The Orchestration of Multi-Agent Systems: Architectures, Protocols, and Enterprise Adoption (2026.01)
- **출처**: https://arxiv.org/html/2601.13671v1
- **신뢰도**: High (comprehensive survey)
- **핵심 내용**: 오케스트레이션을 자율 에이전트를 "목표 지향적 집단"으로 변환하는 **제어 평면(control plane)**으로 정의한다. 5개 핵심 유닛으로 구성된다:
  1. 계획 & 정책 관리: 목표를 태스크로 분해하면서 거버넌스 제약 내재
  2. 실행 & 제어 관리: 태스크 시퀀싱, 동시성, 텔레메트리 수집
  3. 상태 & 지식 관리: 운영 상태와 컨텍스트 정보 분리 유지
  4. 품질 & 운영 관리: 출력 검증, 메트릭 모니터링, 교정 트리거
  5. 통신 계층: 에이전트-도구, 에이전트-에이전트 상호작용

  에이전트 역할은 Worker(도메인 태스크 실행), Service(규정 준수 등 공유 유틸리티), Support(시스템 헬스 모니터링)로 분류된다. MCP(Model Context Protocol)와 A2A(Agent-to-Agent) 프로토콜을 표준 통신 수단으로 분석했다.
- **시사점**: 실제 엔터프라이즈 성과로 보험 인수심사 95% 정확도, 모기지 처리 20배 가속 및 80% 비용 절감, 소프트웨어 현대화 50% 개발 시간 단축이 보고되었다.

### 1.3 Multi-Agent Collaboration via Evolving Orchestration (2025.10)
- **출처**: https://arxiv.org/abs/2505.19591
- **신뢰도**: High (OpenReview peer-reviewed)
- **핵심 내용**: 중앙 집중형 오케스트레이터가 강화학습을 통해 에이전트 시퀀싱과 우선순위를 적응적으로 조정하는 **"퍼펫티어(puppeteer)" 패러다임**을 제안한다. 정적 파이프라인 대비 동적 태스크 상태 기반 에이전트 조율의 우위를 입증했다.
- **시사점**: 서브에이전트 호출 순서와 병렬/순차 결정을 자동화하는 것이 차세대 오케스트레이션의 핵심 방향이다.

### 1.4 Multi-Agent Collaboration Mechanisms: A Survey of LLMs (2025.01)
- **출처**: https://arxiv.org/html/2501.06322v1
- **신뢰도**: High (comprehensive survey, Tran et al.)
- **핵심 내용**: 협업 메커니즘을 5가지 차원으로 분류하는 확장 가능한 프레임워크를 제시한다. 5G/6G 네트워크, 인더스트리 5.0, QA, 소셜 설정 등 다양한 도메인에서의 적용 사례를 탐색했다.
- **시사점**: 멀티 에이전트 협업의 범용적 분류 체계는 Claude Code 서브에이전트 설계 시 역할 정의에 참고할 수 있다.

## 2. 오픈소스 프로젝트

### 2.1 VoltAgent/awesome-claude-code-subagents
- **GitHub**: https://github.com/VoltAgent/awesome-claude-code-subagents
- **Stars/라이센스**: 15.3k stars / 1.7k forks / Open Source
- **핵심 기능**: 127개 이상의 특화 서브에이전트를 10개 카테고리로 분류한다:
  - Core Development (10): API 설계, 프론트엔드/백엔드, 풀스택
  - Language Specialists (22+): TypeScript, Python, Go, Rust, Java 등 + 프레임워크(Next.js, React, Vue, FastAPI 등)
  - Infrastructure & DevOps (15+): Kubernetes, Docker, Terraform, AWS/GCP/Azure
  - Quality & Security (14): 테스팅, 코드 리뷰, 침투 테스트, 컴플라이언스
  - Data & AI (13): ML, 데이터 엔지니어링, NLP, MLOps
  - Developer Experience (13): 툴링, 문서화, 리팩토링, 레거시 현대화
  - Specialized Domains (12): 블록체인, 핀테크, IoT, 게임
  - Business & Product (10): PM, 프로젝트 조율, 기술 문서
  - Meta & Orchestration (12): 멀티 에이전트 조율, 워크플로우 자동화
  - Research & Analysis (7): 경쟁 분석, 시장 조사
- **차별점**: 가장 포괄적인 서브에이전트 컬렉션. 대화형 설치 스크립트, 플러그인 마켓플레이스 통합, curl 기반 단독 설치를 지원한다. Meta/Orchestration 카테고리가 다른 카테고리와 조합 시 최적 성능을 발휘한다.

### 2.2 wshobson/agents
- **GitHub**: https://github.com/wshobson/agents
- **핵심 기능**: 4개 특화 에이전트, 7개 커맨드, 6개 스킬을 포함한 멀티 에이전트 오케스트레이션 프레임워크이다. Claude Code의 실험적 Agent Teams 기능을 활용한 병렬 워크플로우의 참조 구현을 제공한다.
- **차별점**: Agent Teams 기능의 실전 레퍼런스 구현으로, 팀 기반 병렬 작업의 구체적 패턴을 제시한다.

### 2.3 Gentleman-Programming/agent-teams-lite
- **GitHub**: https://github.com/Gentleman-Programming/agent-teams-lite
- **핵심 기능**: 경량 코디네이터가 모든 실제 작업을 특화 서브에이전트에 위임하는 오케스트레이션 패턴이다. 오케스트레이터 + 9개 특화 서브에이전트(Product Spec, Architect, Implementer, Tester 등)로 구조화된 기능 개발을 수행한다. 제로 의존성, 순수 마크다운 기반이다.
- **차별점**: 의존성 없이 마크다운만으로 동작하여 Claude Code, OpenCode, Cursor 등 다양한 도구와 호환된다. Spec-Driven Development 방법론을 적용한다.

### 2.4 zhsama/claude-sub-agent
- **GitHub**: https://github.com/zhsama/claude-sub-agent
- **핵심 기능**: AI 기반 개발 워크플로우 시스템으로, Claude Code 서브에이전트를 활용한 구조화된 개발 파이프라인을 제공한다.
- **차별점**: 서브에이전트를 단순 도구가 아닌 완전한 개발 워크플로우 시스템으로 통합한 접근 방식을 취한다.

### 2.5 shanraisshan/claude-code-best-practice
- **GitHub**: https://github.com/shanraisshan/claude-code-best-practice
- **핵심 기능**: Claude Code 사용 시 best practice를 체계적으로 정리한 가이드 레포이다. CLAUDE.md 작성법, 서브에이전트 구성, 컨텍스트 관리 전략을 포함한다.
- **차별점**: 실전 경험 기반의 실용적 가이드로, 공식 문서를 보완하는 커뮤니티 지식을 집약한다.

## 3. 기업 도입 사례 & 공식 가이드

### 3.1 Anthropic 공식 문서: 서브에이전트 설정 가이드
- **출처**: https://code.claude.com/docs/en/sub-agents
- **신뢰도**: High (공식 1차 자료)
- **핵심 내용**:

  **서브에이전트 정의 방식**: `.claude/agents/`(프로젝트) 또는 `~/.claude/agents/`(전역)에 YAML frontmatter를 가진 마크다운 파일로 정의한다. CLI 플래그(`--agents`)로 세션 한정 에이전트도 가능하다.

  **내장 서브에이전트**:
  - **Explore**: Haiku 모델, 읽기 전용, 코드베이스 탐색/검색 특화
  - **Plan**: 상속 모델, 읽기 전용, 계획 수립을 위한 리서치
  - **General-purpose**: 상속 모델, 모든 도구, 복잡한 멀티스텝 작업

  **주요 설정 필드**:
  | 필드 | 설명 |
  |------|------|
  | `name` | 고유 식별자 (소문자+하이픈) |
  | `description` | 자동 위임 판단 기준이 되는 설명 |
  | `tools` / `disallowedTools` | 허용/차단 도구 목록 |
  | `model` | sonnet, opus, haiku, inherit, 또는 전체 모델 ID |
  | `permissionMode` | default, acceptEdits, dontAsk, bypassPermissions, plan |
  | `memory` | user, project, local (세션 간 학습 축적) |
  | `hooks` | PreToolUse, PostToolUse, Stop 이벤트 기반 검증 |
  | `mcpServers` | MCP 서버 스코핑 (인라인 또는 참조) |
  | `isolation` | worktree 설정 시 독립 git worktree 제공 |
  | `background` | true 시 백그라운드 실행 |
  | `maxTurns` | 최대 에이전틱 턴 수 제한 |
  | `skills` | 시작 시 주입할 스킬 콘텐츠 |
  | `effort` | low, medium, high, max (Opus 4.6 전용) |

  **서브에이전트 제한**: 서브에이전트는 다른 서브에이전트를 생성할 수 없다. 중첩 위임이 필요하면 Skills 또는 체이닝 패턴을 사용해야 한다.

- **교훈**: 서브에이전트는 **3-4개로 제한**하고, 각각이 하나의 특정 태스크에 탁월하도록 설계하며, 상세한 description으로 자동 위임을 유도해야 한다.

### 3.2 Anthropic 공식 문서: 에이전트 팀 가이드
- **출처**: https://code.claude.com/docs/en/agent-teams
- **신뢰도**: High (공식 1차 자료, 실험적 기능)
- **핵심 내용**:

  에이전트 팀은 서브에이전트와 달리 독립된 Claude Code 인스턴스들이 **공유 태스크 리스트**와 **메시지 시스템**을 통해 직접 소통한다. 팀 리드가 조율하고, 팀원들이 자율적으로 태스크를 클레임한다.

  **서브에이전트 vs 에이전트 팀 비교**:
  | | 서브에이전트 | 에이전트 팀 |
  |---|---|---|
  | 컨텍스트 | 자체 윈도우, 결과 반환 | 자체 윈도우, 완전 독립 |
  | 소통 | 메인 에이전트에게만 보고 | 팀원 간 직접 메시징 |
  | 조율 | 메인 에이전트가 관리 | 공유 태스크 리스트로 자율 조율 |
  | 최적 용도 | 결과만 필요한 집중 태스크 | 토론/협업이 필요한 복잡한 작업 |
  | 토큰 비용 | 낮음 | 높음 (인스턴스 수에 비례) |

  **활성화**: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 환경변수 또는 settings.json

  **최적 팀 규모**: 3-5명, 팀원당 5-6개 태스크

  **디스플레이 모드**: In-process(기본, 모든 터미널) 또는 Split panes(tmux/iTerm2)

  **품질 게이트 후크**: TeammateIdle, TaskCreated, TaskCompleted 이벤트 지원

- **교훈**: 파일 충돌 방지를 위해 팀원별 파일 소유권 분리가 필수이다. 순차 작업이나 같은 파일 편집에는 단일 세션이나 서브에이전트가 더 효과적이다.

### 3.3 Anthropic 내부 사례: 16개 에이전트의 C 컴파일러 구축
- **출처**: https://www.anthropic.com/engineering/building-c-compiler
- **신뢰도**: High (1차 자료, Anthropic 엔지니어링 블로그)
- **도입 배경**: 16개 Claude Opus 4.6 에이전트가 독립 Docker 컨테이너에서 병렬로 Rust 기반 C 컴파일러를 구축하는 대규모 실험이다. 약 2,000회 Claude Code 세션, $20,000 API 비용을 투입했다. 락 파일 메커니즘으로 태스크 클레임을 관리하고, Git으로 버전 제어를 수행했다.
- **성과/수치**:
  - 10만 줄 코드의 Rust 기반 C 컴파일러 생성
  - Linux 6.9 커널 빌드 성공 (x86, ARM, RISC-V)
  - QEMU, FFmpeg, SQLite, PostgreSQL, Redis 컴파일 성공
  - GCC torture test suite **99% 통과율** 달성
- **에이전트 역할 분담**:
  - 다수 에이전트: 서로 다른 파일의 버그 수정 병렬 처리
  - 중복 코드 통합 전담 에이전트
  - 컴파일러 성능 최적화 전담 에이전트
  - 효율적 컴파일 코드 출력 전담 에이전트
  - Rust 개발자 관점 설계 비평 에이전트
- **교훈**: 에이전트별 명확한 역할 분담이 핵심이다. 아키텍처적 선견지명은 부족하지만, 잘 정의된 스펙의 반복 구현("toil" 오프로딩)에 탁월하다. 인간 개발자를 완전히 대체하지는 못하지만, 정의된 작업의 대규모 병렬 실행에는 강력하다.

### 3.4 Anthropic 팀별 Claude Code 활용 사례
- **출처**: https://claude.com/blog/how-anthropic-teams-use-claude-code
- **신뢰도**: High (1차 자료)
- **주요 팀별 활용 및 성과**:

  | 팀 | 활용 방식 | 성과 |
  |---|---|---|
  | 인프라/데이터 | K8s 장애 진단, 코드베이스 탐색 | 장애 진단 20분 단축 |
  | ML/추론 | 모델 함수 이해, Rust 테스트 작성 | 리서치 시간 80% 감소 (1시간 -> 10-20분) |
  | 보안 | 스택 트레이스 분석, TDD 전환 | 진단 속도 3배 향상 |
  | 디자인 | Figma -> 코드 자동 변환, 엣지 케이스 탐지 | 비개발자의 React 앱 구축 가능 |
  | Growth 마케팅 | 2개 서브에이전트로 광고 변형 생성 | 수백 개 광고를 분 단위로 생성 (기존 수 시간) |
  | 법무 | 법률 상담 라우팅 프로토타입 | 개발 리소스 없이 시스템 구축 |

- **교훈**: Claude Code를 **"코드 생성기"가 아닌 "사고 파트너"**로 활용하는 것이 핵심이다. 비개발 직군(디자이너, 마케터, 법무)에서도 서브에이전트 활용의 효과가 입증되었다.

### 3.5 Doctolib 도입 사례
- **출처**: https://winbuzzer.com/2026/03/24/anthropic-claude-code-subagent-mcp-advanced-patterns-xcxwbn/
- **신뢰도**: Medium (뉴스 기사 기반 간접 자료)
- **도입 배경**: 유럽 최대 헬스케어 플랫폼 Doctolib이 Claude Code 프레임워크를 전체 엔지니어링 팀에 롤아웃했다.
- **성과/수치**: 레거시 테스트 인프라를 주 단위가 아닌 시간 단위로 교체하고, **40% 빠른 기능 출시**를 달성했다.
- **교훈**: 대규모 엔터프라이즈 엔지니어링 팀에서도 에이전트 기반 워크플로우가 실질적 생산성 향상을 가져온다.

## 4. 종합 인사이트 -- Claude Code 서브에이전트 Best Practice

### 4.1 설계 원칙

#### 원칙 1: 집중된 전문화 (Focused Specialization)
서브에이전트는 하나의 명확한 태스크에 특화시킨다. **3-4개를 초과하면** 어떤 에이전트를 호출할지 결정하는 오버헤드가 생산성을 저하시킨다. 대부분의 작업에서는 기본 Claude Code를 사용하고, 서브에이전트는 아키텍처 리뷰, 보안 감사, 복잡한 디버깅 등 시니어 레벨 태스크에 한정한다.

```yaml
# 좋은 예: 명확한 단일 목적
---
name: code-reviewer
description: Expert code review specialist. Use proactively after code changes.
tools: Read, Grep, Glob, Bash
model: sonnet
---
```

#### 원칙 2: 최소 권한 원칙 (Least Privilege)
읽기 전용 태스크에는 Write/Edit 도구를 제거하고, DB 접근에는 PreToolUse 후크로 SELECT만 허용하는 등 필요한 도구만 부여한다.

```yaml
# tools로 허용 목록 지정
tools: Read, Grep, Glob, Bash

# 또는 disallowedTools로 차단 목록 지정
disallowedTools: Write, Edit
```

#### 원칙 3: 명확한 description 작성
Claude가 자동 위임 여부를 description 기반으로 결정하므로, **"use proactively"** 등의 문구를 포함해 적극적 위임을 유도한다. description은 언제 이 서브에이전트를 사용해야 하는지를 명시해야 한다.

#### 원칙 4: 모델 티어링 (Model Tiering)
메인 세션은 Opus로, 탐색/검색은 Haiku로, 분석은 Sonnet으로 운용하여 비용 대비 품질을 최적화한다. 내장 Explore 서브에이전트가 이 패턴을 이미 구현하고 있다(Haiku 모델 사용).

```yaml
# 비용 효율적 탐색 에이전트
model: haiku

# 균형 잡힌 분석 에이전트
model: sonnet

# 복잡한 추론이 필요한 경우
model: opus
```

### 4.2 아키텍처 패턴

#### 패턴 1: 병렬 리서치
독립적인 조사 영역을 별도 서브에이전트에 할당하고, 메인 에이전트가 결과를 종합한다. 연구 경로가 서로 의존하지 않을 때 가장 효과적이다.

```
메인 에이전트
  ├─> [서브에이전트A: 보안 분석]     ─┐
  ├─> [서브에이전트B: 성능 분석]     ─┼─> 메인이 종합
  └─> [서브에이전트C: 테스트 커버리지] ─┘
```

**주의**: 많은 서브에이전트가 각각 상세한 결과를 반환하면 메인 컨텍스트를 상당히 소모할 수 있다.

#### 패턴 2: 체이닝 (Sequential Pipeline)
서브에이전트를 순차적으로 연결하여 파이프라인을 구성한다. 각 서브에이전트가 태스크를 완료하고 결과를 반환하면, Claude가 관련 컨텍스트를 다음 서브에이전트에 전달한다.

```
코드 리뷰 서브에이전트 → 최적화 서브에이전트 → 테스트 서브에이전트
```

#### 패턴 3: 에이전트 팀 (상호 소통 필요 시)
서브에이전트는 메인에게만 보고할 수 있고 서로 소통할 수 없다. 팀원 간 발견 공유, 상호 도전, 자율 조율이 필요하면 에이전트 팀을 사용한다.

**최적 시나리오**: 경쟁 가설 검증(디버깅), 다각도 리뷰(보안/성능/테스트), 크로스 레이어 조율(프론트엔드/백엔드/DB)

#### 패턴 4: 격리 (Worktree Isolation)
`isolation: worktree` 설정으로 서브에이전트에 독립된 git worktree를 제공하여 파일 충돌을 원천 방지한다. 변경 사항이 없으면 worktree는 자동 정리된다.

```yaml
---
name: experimental-refactor
description: Tries risky refactoring in isolation
isolation: worktree
---
```

### 4.3 운영 가이드라인

#### 가이드 1: 컨텍스트 관리
대량 출력을 생성하는 작업(테스트 실행, 문서 패칭, 로그 분석)은 서브에이전트에 격리하여 메인 컨텍스트를 보존한다. 서브에이전트 내부의 상세 출력은 요약만 메인에 반환된다.

```
# 효과적인 사용
"서브에이전트로 테스트 스위트를 실행하고 실패한 테스트와 에러 메시지만 보고하세요"
```

#### 가이드 2: 퍼시스턴트 메모리 활용
`memory: project` 스코프로 서브에이전트가 세션 간 학습을 축적하게 한다. MEMORY.md에 코드베이스 패턴, 반복 이슈, 아키텍처 결정을 기록하도록 시스템 프롬프트에 명시한다.

```yaml
---
name: code-reviewer
memory: project
---
리뷰 중 발견한 패턴, 컨벤션, 반복 이슈를 에이전트 메모리에 업데이트하세요.
```

**메모리 스코프 선택**:
- `project` (권장 기본값): 프로젝트별 지식, 버전 관리 공유 가능
- `user`: 모든 프로젝트에 걸친 범용 지식
- `local`: 프로젝트별이지만 버전 관리 제외

#### 가이드 3: 후크 기반 품질 게이트
PreToolUse/PostToolUse 후크로 조건부 검증을 적용한다. 예: SQL 쓰기 연산 차단, 파일 편집 후 린터 자동 실행.

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
```

#### 가이드 4: 비용 제어
- Haiku 기반 Explore 서브에이전트로 탐색 비용을 절감한다
- 에이전트 팀 사용 시 토큰이 팀원 수에 선형 비례함을 인지한다 (3명 팀 = 약 3-4배 토큰)
- 일상적 작업에는 단일 세션이 더 비용 효율적이다
- `maxTurns`로 서브에이전트의 최대 턴 수를 제한하여 비용 폭주를 방지한다

#### 가이드 5: 팀 규모 관리
- 에이전트 팀은 **3-5명**이 최적이며, 팀원당 **5-6개 태스크**가 적절하다
- 그 이상은 조율 오버헤드가 이득을 상쇄한다
- 팀원은 보통 20-30초 내 스폰되며, 1분 내에 결과 생산을 시작한다

### 4.4 서브에이전트 vs 에이전트 팀 vs 메인 세션 선택 기준

| 상황 | 메인 세션 | 서브에이전트 | 에이전트 팀 |
|------|-----------|-------------|------------|
| 빠른 단일 변경 | **O** | | |
| 반복적 대화/정제 | **O** | | |
| 대량 출력 격리 | | **O** | |
| 도구 제한 필요 | | **O** | |
| 비용 민감 | **O** | O | |
| 상호 토론/도전 필요 | | | **O** |
| 파일 수정 병렬 | | | **O** (파일 분리) |
| 경쟁 가설 검증 | | | **O** |
| 독립 리서치 병렬 | | **O** | O |

## 5. 참고 자료

### High 신뢰도
1. [Claude Code Subagents 공식 문서](https://code.claude.com/docs/en/sub-agents) -- Anthropic
2. [Claude Code Agent Teams 공식 문서](https://code.claude.com/docs/en/agent-teams) -- Anthropic
3. [How Anthropic Teams Use Claude Code](https://claude.com/blog/how-anthropic-teams-use-claude-code) -- Anthropic
4. [Building a C Compiler with Parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler) -- Anthropic Engineering
5. [Multi-Agent LLM Orchestration for Incident Response](https://arxiv.org/abs/2511.15755) -- arXiv, 2026
6. [The Orchestration of Multi-Agent Systems: Architectures, Protocols, and Enterprise Adoption](https://arxiv.org/html/2601.13671v1) -- arXiv, 2026
7. [Multi-Agent Collaboration via Evolving Orchestration](https://arxiv.org/abs/2505.19591) -- arXiv/OpenReview, 2025
8. [Multi-Agent Collaboration Mechanisms: A Survey of LLMs](https://arxiv.org/html/2501.06322v1) -- arXiv, 2025

### Medium 신뢰도
9. [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) -- GitHub (15.3k stars)
10. [wshobson/agents](https://github.com/wshobson/agents) -- GitHub
11. [Gentleman-Programming/agent-teams-lite](https://github.com/Gentleman-Programming/agent-teams-lite) -- GitHub
12. [shanraisshan/claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice) -- GitHub
13. [zhsama/claude-sub-agent](https://github.com/zhsama/claude-sub-agent) -- GitHub
14. [Claude Code Sub-Agents: Parallel vs Sequential Patterns](https://claudefa.st/blog/guide/agents/sub-agent-best-practices) -- claudefast
15. [Claude Code Agent Teams: The Complete Guide 2026](https://claudefa.st/blog/guide/agents/agent-teams) -- claudefast
16. [Everything-Claude-Code: Production Agent Framework](https://byteiota.com/everything-claude-code-production-agent-framework/) -- byteiota
17. [Doctolib 사례](https://winbuzzer.com/2026/03/24/anthropic-claude-code-subagent-mcp-advanced-patterns-xcxwbn/) -- WinBuzzer

---
*독립 리뷰: 통과 기준 5/5개 (주제 커버리지, 소스 신뢰도, 실용성, 최신성, 균형성 모두 PASS), 보완 0회 수행*
