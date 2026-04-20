# gugbab-claude

Claude Code를 효과적으로 활용하기 위한 **에이전트(Agent)**, **스킬(Skill)**, **설정(CLAUDE.md)** 모음입니다.

---

## 프로젝트 구조

```
gugbab-claude/
├── README.md
├── CLAUDE.md                     ← 프로젝트 공통 규칙
├── docs/
│   ├── agents/                   ← 에이전트 상세 문서
│   ├── hooks/                    ← 훅 문서
│   │   └── permission-judge.md   ← 훅 문서
│   └── skills/
│       ├── VERIFICATION_TEMPLATE.md   ← 스킬 검증 템플릿
│       ├── frontend/             ← 프론트엔드 스킬 검증 문서
│       ├── backend/              ← 백엔드 스킬 검증 문서
│       └── architecture/         ← 아키텍처 스킬 검증 문서
└── .claude/
    ├── agents/
    │   ├── meta/                 ← 에이전트 생성/관리
    │   ├── research/             ← 리서치
    │   ├── validation/           ← 검증
    │   ├── frontend/             ← 프론트엔드 개발
    │   ├── backend/              ← Rust 백엔드 개발
    │   └── domain/               ← 도메인 분석
    ├── hooks/
    │   ├── auto-approve.js       ← 안전한 도구 자동 승인
    │   ├── bash-guard.js         ← 위험 Bash 차단
    │   ├── session-summary.js    ← 세션 종료 시 수정 파일 요약 출력
    │   ├── verification-guard.js ← verification.md 구조·품질 자동 검증
    │   └── skill-md-guard.js     ← SKILL.md 구조 자동 검증
    ├── rules/                    ← 상황별 규칙
    ├── settings.json             ← 훅 등록 설정
    └── skills/
        ├── frontend/             ← 프론트엔드 스킬 (29종)
        ├── backend/              ← Rust 백엔드 스킬 (19종)
        └── architecture/         ← 아키텍처 스킬 (1종)
```

---

## 에이전트 목록

상세 문서: [docs/agents/](./docs/agents/)

### meta

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [agent-creator](./docs/agents/meta/agent-creator.md) | 새 에이전트 MD 파일 대화형 생성 | → |
| [skill-creator](./.claude/agents/meta/skill-creator.md) | 공식 문서 검증 후 스킬 SKILL.md 생성 | - |
| [claude-code-guide](./.claude/agents/meta/claude-code-guide.md) | Claude Code CLI·hooks·MCP·settings·Anthropic SDK 사용법 안내 | - |
| [planner](./.claude/agents/meta/planner.md) | 복잡한 요청을 단계별 실행 계획으로 분해, 에이전트·스킬 매핑 | - |

### research

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [deep-researcher](./docs/agents/research/deep-researcher.md) | 3축(논문/오픈소스/기업사례) 딥리서치 오케스트레이터 | → |
| [web-searcher](./docs/agents/research/web-searcher.md) | 검색 축별 전담 서브에이전트 | → |
| [research-reviewer](./docs/agents/research/research-reviewer.md) | 리서치 품질 5항목 평가 | → |

### validation

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [fact-checker](./docs/agents/validation/fact-checker.md) | 단일 클레임 교차 검증 (VERIFIED/UNVERIFIED/DISPUTED) | → |
| [source-validator](./docs/agents/validation/source-validator.md) | URL/레포/문서 신뢰도 평가 (TRUST/CAUTION/REJECT) | → |

### frontend

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [frontend-architect](./.claude/agents/frontend/frontend-architect.md) | 프론트엔드 아키텍처 설계 (구조/스택/렌더링/번들링 판단) | - |
| [frontend-developer](./.claude/agents/frontend/frontend-developer.md) | React/Next.js 컴포넌트·훅·API 연동 코드 구현, TypeScript 에러 수정 | - |

### backend

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [rust-backend-developer](./.claude/agents/backend/rust-backend-developer.md) | Rust + Axum 핸들러·서비스·라우터 코드 구현, 컴파일 에러 수정 | - |
| [rust-backend-architect](./.claude/agents/backend/rust-backend-architect.md) | Rust + Axum 아키텍처 설계 — 크레이트 구조, 레이어드 아키텍처, 트레이트 추상화 | - |

### domain

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [business-domain-analyst](./.claude/agents/domain/business-domain-analyst.md) | 비즈니스 요구사항 → DDD 도메인 모델 도출 (유비쿼터스 언어, 바운디드 컨텍스트, 집합체, 도메인 이벤트) | [→](./docs/agents/domain/business-domain-analyst-verification.md) |
| [codebase-domain-analyst](./.claude/agents/domain/codebase-domain-analyst.md) | 코드베이스 역분석 — 도메인 구조 파악, 레이어 의존성 진단, 아키텍처 개선 제안 | [→](./docs/agents/domain/codebase-domain-analyst-verification.md) |

---

## 스킬 목록

상세 문서: [docs/skills/](./docs/skills/)

### architecture

| 스킬 | 설명 | 검증 문서 |
|------|------|----------|
| [ddd](./.claude/skills/architecture/ddd/SKILL.md) | DDD 아키텍처 핵심 패턴 — 유비쿼터스 언어, 서브도메인, 바운디드 컨텍스트, Aggregate, Entity/VO, 도메인 서비스/이벤트, 레이어드 아키텍처 | [→](./docs/skills/architecture/ddd/verification.md) |

---

### frontend

| 스킬 | 설명 | 검증 문서 |
|------|------|----------|
| [react-core](./.claude/skills/frontend/react-core/SKILL.md) | React 18/19 핵심 패턴, Concurrent, React Compiler | [→](./docs/skills/frontend/react-core/verification.md) |
| [nextjs](./.claude/skills/frontend/nextjs/SKILL.md) | Next.js 15/16 App Router, 캐싱, Server Actions | [→](./docs/skills/frontend/nextjs/verification.md) |
| [typescript](./.claude/skills/frontend/typescript/SKILL.md) | TypeScript 핵심 패턴, React 타입, tsconfig | [→](./docs/skills/frontend/typescript/verification.md) |
| [monorepo-turborepo](./.claude/skills/frontend/monorepo-turborepo/SKILL.md) | 모노레포 구조, Turborepo 파이프라인 | [→](./docs/skills/frontend/monorepo-turborepo/verification.md) |
| [bundling-compiler](./.claude/skills/frontend/bundling-compiler/SKILL.md) | tsup/Vite/Turbopack 선택 기준, React Compiler, Tree Shaking | [→](./docs/skills/frontend/bundling-compiler/verification.md) |
| [code-convention](./.claude/skills/frontend/code-convention/SKILL.md) | ESLint 9+ flat config, Biome, Prettier, Husky, lint-staged | [→](./docs/skills/frontend/code-convention/verification.md) |
| [state-management](./.claude/skills/frontend/state-management/SKILL.md) | Zustand v5 전역 상태, TanStack Query v5 서버 상태/캐싱 | [→](./docs/skills/frontend/state-management/verification.md) |
| [sass](./.claude/skills/frontend/sass/SKILL.md) | SCSS 핵심 패턴, CSS Modules + SCSS, 캡슐화 중심 스타일 설계 | [→](./docs/skills/frontend/sass/verification.md) |
| [testing](./.claude/skills/frontend/testing/SKILL.md) | Jest/Vitest + React Testing Library, 동작 중심 테스트 전략 | [→](./docs/skills/frontend/testing/verification.md) |
| [component-design](./.claude/skills/frontend/component-design/SKILL.md) | 캡슐화 원칙, Compound Component, Headless 패턴, 컴포넌트 API 설계 | [→](./docs/skills/frontend/component-design/verification.md) |
| [form-handling](./.claude/skills/frontend/form-handling/SKILL.md) | React Hook Form + Zod 유효성 검증, 재사용 필드 컴포넌트 | [→](./docs/skills/frontend/form-handling/verification.md) |
| [api-integration](./.claude/skills/frontend/api-integration/SKILL.md) | API 클라이언트 캡슐화, TanStack Query 연동, 에러 핸들링 | [→](./docs/skills/frontend/api-integration/verification.md) |
| [accessibility](./.claude/skills/frontend/accessibility/SKILL.md) | ARIA 패턴, 시맨틱 HTML, 키보드 네비게이션, a11y 테스트 | [→](./docs/skills/frontend/accessibility/verification.md) |
| [animation](./.claude/skills/frontend/animation/SKILL.md) | motion/react(Framer Motion) 핵심 패턴, CSS transition/keyframe, 성능 고려 | [→](./docs/skills/frontend/animation/verification.md) |
| [performance](./.claude/skills/frontend/performance/SKILL.md) | React Compiler 기준 메모이제이션, 코드 스플리팅, TanStack Virtual 가상화 | [→](./docs/skills/frontend/performance/verification.md) |
| [error-handling](./.claude/skills/frontend/error-handling/SKILL.md) | Error Boundary, React 19 에러 콜백, TanStack Query 에러 처리, 에러 유형별 전략 | [→](./docs/skills/frontend/error-handling/verification.md) |
| [design-patterns](./.claude/skills/frontend/design-patterns/SKILL.md) | Compound Component, Custom Hook, useSyncExternalStore, API 캡슐화, 전략 주입 | [→](./docs/skills/frontend/design-patterns/verification.md) |
| [seo](./.claude/skills/frontend/seo/SKILL.md) | Next.js 15 Metadata API, OpenGraph, JSON-LD, sitemap/robots | [→](./docs/skills/frontend/seo/verification.md) |
| [intersection-observer](./.claude/skills/frontend/intersection-observer/SKILL.md) | Intersection Observer API 핵심 패턴, lazy load, React Hook | [→](./docs/skills/frontend/intersection-observer/verification.md) |
| [mutation-observer](./.claude/skills/frontend/mutation-observer/SKILL.md) | MutationObserver API 핵심 패턴 — 자식 노드·속성 변경 감지 | [→](./docs/skills/frontend/mutation-observer/verification.md) |
| [page-visibility](./.claude/skills/frontend/page-visibility/SKILL.md) | Page Visibility API — 탭 가시성 감지, 폴링 제어, 데이터 갱신 | [→](./docs/skills/frontend/page-visibility/verification.md) |
| [resize-observer](./.claude/skills/frontend/resize-observer/SKILL.md) | ResizeObserver API 핵심 패턴, React Hook | [→](./docs/skills/frontend/resize-observer/verification.md) |
| [css-variables](./.claude/skills/frontend/css-variables/SKILL.md) | CSS Custom Properties 핵심 패턴 — 선언, 상속, 폴백, 테마 전환, JS 연동 | [→](./docs/skills/frontend/css-variables/verification.md) |
| [radix-ui](./.claude/skills/frontend/radix-ui/SKILL.md) | Radix UI Primitives — asChild/Slot, Compound Component, Controlled/Uncontrolled, data-attribute + SCSS 스타일링 | [→](./docs/skills/frontend/radix-ui/verification.md) |
| [design-token-scss](./.claude/skills/frontend/design-token-scss/SKILL.md) | 디자인 토큰 3계층 설계, Figma 토큰 추출, Style Dictionary v4 SCSS/CSS 변환, 테마 전환 패턴 | [→](./docs/skills/frontend/design-token-scss/verification.md) |
| [cra-to-vite-migration](./.claude/skills/frontend/cra-to-vite-migration/SKILL.md) | CRA → Vite 마이그레이션 8단계 절차 — 환경 변수, index.html, SVG, tsconfig, Jest→Vitest 전환 | [→](./docs/skills/frontend/cra-to-vite-migration/verification.md) |
| [webpack-vite-config-mapping](./.claude/skills/frontend/webpack-vite-config-mapping/SKILL.md) | Webpack/Craco 설정 → Vite 1:1 매핑 — cacheGroups→manualChunks, babel→esbuild, plugins 대응표, retry chunk | [→](./docs/skills/frontend/webpack-vite-config-mapping/verification.md) |
| [vite-advanced-splitting](./.claude/skills/frontend/vite-advanced-splitting/SKILL.md) | Vite 고급 코드 스플리팅 — manualChunks 함수형, 모바일/데스크톱 분리 빌드, Gulp→Vite 플러그인 훅 전환 | [→](./docs/skills/frontend/vite-advanced-splitting/verification.md) |
| [vite-pwa-service-worker](./.claude/skills/frontend/vite-pwa-service-worker/SKILL.md) | Vite PWA/Service Worker — vite-plugin-pwa, generateSW/injectManifest 전략, 기존 커스텀 SW 마이그레이션 | [→](./docs/skills/frontend/vite-pwa-service-worker/verification.md) |

---

### backend (Rust)

| 스킬 | 설명 | 검증 문서 |
|------|------|----------|
| [tokio](./.claude/skills/backend/tokio/SKILL.md) | Rust Tokio 비동기 런타임 — #[tokio::main], spawn, sync, fs, time | [→](./docs/skills/backend/tokio/verification.md) |
| [axum](./.claude/skills/backend/axum/SKILL.md) | Rust Axum 웹 프레임워크 — 라우팅, 상태 공유, 추출자, 에러 핸들링, 미들웨어 | [→](./docs/skills/backend/axum/verification.md) |
| [reqwest](./.claude/skills/backend/reqwest/SKILL.md) | Rust reqwest HTTP 클라이언트 — GET/POST, JSON, 헤더, 스트리밍, Client 재사용 | [→](./docs/skills/backend/reqwest/verification.md) |
| [serde](./.claude/skills/backend/serde/SKILL.md) | Rust serde + serde_json 직렬화/역직렬화 핵심 패턴 | [→](./docs/skills/backend/serde/verification.md) |
| [thiserror](./.claude/skills/backend/thiserror/SKILL.md) | Rust thiserror 에러 처리 — derive(Error), #[from] 변환, Axum IntoResponse 연동 | [→](./docs/skills/backend/thiserror/verification.md) |
| [tower-http](./.claude/skills/backend/tower-http/SKILL.md) | tower-http 미들웨어 — CorsLayer, TraceLayer, CompressionLayer, Axum 연동 | [→](./docs/skills/backend/tower-http/verification.md) |
| [sse-streaming](./.claude/skills/backend/sse-streaming/SKILL.md) | Axum SSE 스트리밍 — Sse 응답, Event 구성, Claude API 스트리밍 변환 | [→](./docs/skills/backend/sse-streaming/verification.md) |
| [multipart-upload](./.claude/skills/backend/multipart-upload/SKILL.md) | Axum Multipart 파일 업로드 — 필드 구분, 바이트 읽기, 파일 타입별 처리 | [→](./docs/skills/backend/multipart-upload/verification.md) |
| [dotenvy](./.claude/skills/backend/dotenvy/SKILL.md) | Rust 환경변수 관리 — dotenvy(.env 로드) + envy(타입 안전 매핑) 조합 패턴 | [→](./docs/skills/backend/dotenvy/verification.md) |
| [tracing](./.claude/skills/backend/tracing/SKILL.md) | Rust tracing + tracing-subscriber 구조화 로깅 — 초기화, EnvFilter, #[instrument], Span, Axum 연동 | [→](./docs/skills/backend/tracing/verification.md) |
| [cargo-workspace](./.claude/skills/backend/cargo-workspace/SKILL.md) | Rust Cargo Workspace 멀티 크레이트 구조 설계 및 의존성 관리 | [→](./docs/skills/backend/cargo-workspace/verification.md) |
| [project-structure](./.claude/skills/backend/project-structure/SKILL.md) | Rust + Axum 레이어드 아키텍처 — 4계층 구조, 모듈 시스템, 책임 분리, DI 조립 패턴 | [→](./docs/skills/backend/project-structure/verification.md) |
| [dependency-injection](./.claude/skills/backend/dependency-injection/SKILL.md) | Rust Trait 기반 DI — Arc<dyn Trait> vs 제네릭, AppState 구성, Axum 핸들러 주입, Mock 테스트 | [→](./docs/skills/backend/dependency-injection/verification.md) |
| [repository-pattern](./.claude/skills/backend/repository-pattern/SKILL.md) | Rust Repository 패턴 — async trait DB 추상화, 의존성 역전, In-Memory Mock, Hexagonal Architecture | [→](./docs/skills/backend/repository-pattern/verification.md) |
| [custom-middleware](./.claude/skills/backend/custom-middleware/SKILL.md) | Axum Tower 커스텀 미들웨어 — from_fn, from_fn_with_state, 요청/응답 가로채기 | [→](./docs/skills/backend/custom-middleware/verification.md) |
| [sqlx](./.claude/skills/backend/sqlx/SKILL.md) | Rust sqlx 비동기 SQL — Pool 연결, query! 매크로, 트랜잭션, 마이그레이션, Axum 연동 | [→](./docs/skills/backend/sqlx/verification.md) |
| [testing-rust](./.claude/skills/backend/testing-rust/SKILL.md) | Rust 테스트 패턴 — 단위·통합 테스트, #[tokio::test], Axum oneshot, In-Memory Mock | [→](./docs/skills/backend/testing-rust/verification.md) |
| [jwt-auth](./.claude/skills/backend/jwt-auth/SKILL.md) | Rust JWT 인증 — jsonwebtoken 9.x 토큰 생성·검증, Axum 미들웨어 인증, Refresh Token | [→](./docs/skills/backend/jwt-auth/verification.md) |
| [design-patterns-rust](./.claude/skills/backend/design-patterns-rust/SKILL.md) | Rust 디자인 패턴 8종 — Builder, Newtype, Type State, Strategy, Command, Observer, RAII, Extension Trait | [→](./docs/skills/backend/design-patterns-rust/verification.md) |

---

## 훅 (Hooks)

| 훅 | 유형 | 설명 |
|----|------|------|
| [auto-approve](./.claude/hooks/auto-approve.js) | PreToolUse + PermissionRequest | 안전한 비-Bash 도구(Read/Write/Edit 등) 자동 승인 |
| [bash-guard](./.claude/hooks/bash-guard.js) | PreToolUse + PermissionRequest + PostToolUse | 위험한 Bash 패턴 차단, git commit/push 사용자 확인 강제, .claude/ 파일 삭제·이동 시 README 동기화 경고 |
| [session-summary](./.claude/hooks/session-summary.js) | PostToolUse + Stop | 세션 중 수정된 파일을 누적 추적, 세션 종료 시 요약 출력 |
| [verification-guard](./.claude/hooks/verification-guard.js) | PostToolUse | verification.md 구조·품질 자동 검증 (8개 섹션, 내장 지식 금지, 체크박스 완성도) |
| [skill-md-guard](./.claude/hooks/skill-md-guard.js) | PostToolUse | SKILL.md 구조 자동 검증 (frontmatter name·description, > 소스:, > 검증일: 필수) |

---

## Claude Code 빠른 참조

```bash
claude                        # 실행
claude --agent {name}         # 특정 에이전트로 세션 시작
claude --continue             # 이전 대화 이어서
```

| 명령어 | 설명 |
|--------|------|
| `/agents` | 등록된 에이전트 목록 |
| `/clear` | 컨텍스트 초기화 |
| `/memory` | 메모리 확인·편집 |
| `/compact` | 컨텍스트 압축 |

---

## 업데이트 로그

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-03-26 | 프로젝트 초기화 — `agent-creator` 추가, CLAUDE.md 작성, 커밋 컨벤션 분리 |
| 2026-03-27 | 리서치·검증 에이전트 5종 추가, 카테고리별 폴더 구조 도입, 상세 문서 분리, 프론트엔드 스킬 7종 추가(react-core·nextjs·typescript·monorepo-turborepo·bundling-compiler·code-convention·state-management), frontend-architect 에이전트 추가, 스킬 검증 템플릿 도입 |
| 2026-04-02 | permission-judge 훅 전면 개편(PermissionRequest 이벤트 추가, hook_event_name 버그 수정, Bash 자동 승인 추가, block 전용 리팩터), settings.json 권한 체계 개편, 프론트엔드 스킬 11종 추가(sass·testing·component-design·form-handling·api-integration·accessibility·animation·performance·error-handling·design-patterns·seo), skill-creator 에이전트 추가, creation-workflow.md 분리, 기존 스킬 공식 문서 검증 및 오류 수정 |
| 2026-04-06 | 프론트엔드 스킬 5종 추가(intersection-observer·mutation-observer·page-visibility·resize-observer·css-variables), permission-judge 훅 수정(PermissionRequest 이벤트 추가) |
| 2026-04-07 | Rust 백엔드 스킬 18종 추가(tokio·axum·reqwest·serde·thiserror·tower-http·sse-streaming·multipart-upload·dotenvy·tracing·cargo-workspace·project-structure·dependency-injection·repository-pattern·custom-middleware·sqlx·testing-rust·jwt-auth), 백엔드 에이전트 2종 추가(rust-backend-developer·rust-backend-architect), skill-creator 검증 프로세스 강화(fact-checker 필수화, verification.md 의무화, 실행 에이전트 로그 섹션 추가), creation-workflow 4단계 개편, 관심사별 커밋 분리 원칙 추가 |
| 2026-04-08 | Rust 백엔드 스킬 1종 추가(design-patterns-rust), claude-code-guide 에이전트 추가, tokio·axum SKILL.md DISPUTED 항목 수정, verification.md 체크리스트 표기 도입, tokio 검증 APPROVED |
| 2026-04-14~15 | 프론트엔드 스킬 23개 전체 frontend-architect 활용 테스트 완료 및 APPROVED, 스킬 폴더 구조 정리(backend/ · frontend/ 2단계 분류), frontend-developer 에이전트 추가 |
| 2026-04-16~17 | 도메인 분석 에이전트 2종 추가(business-domain-analyst·codebase-domain-analyst), domain/ 카테고리 신설, 훅 단일 책임 분리(permission-judge → auto-approve·bash-guard 2파일), skill-guard 제거(skill-creator Write 충돌 해소), skill-creator 아키텍처 개편(Agent 도구 제거 → WebSearch/WebFetch 직접 조사·검증으로 중첩 제한 해소), verification-guard PostToolUse 훅 추가(verification.md 품질 자동 검증), DDD 아키텍처 스킬 추가(fact-checker 재검증 DISPUTED 3건 수정 반영, PENDING_TEST) |
| 2026-04-17 | 백엔드 스킬 14종 WebSearch 교차 검증 및 DISPUTED 항목 수정, 전체 43개 스킬 verification.md 8섹션 포맷 마이그레이션, 헤드리스 UI 패키지 대응 프론트엔드 스킬 추가·업데이트 (radix-ui·design-token-scss 신규 추가, sass·component-design asChild/Slot·data-attribute 패턴 보완) |
| 2026-04-20 | CRA → Vite 마이그레이션 관련 프론트엔드 스킬 4종 추가 (cra-to-vite-migration·webpack-vite-config-mapping·vite-advanced-splitting·vite-pwa-service-worker), lf-ui 프로젝트 분석 기반 WebSearch 교차 검증 전항목 VERIFIED, README 최신화 (hooks 구조도·스킬 수·검증 심볼 수정), CLAUDE.md 경량화 및 디렉토리별 CLAUDE.md 분리, bash-guard PostToolUse 핸들러 추가 (README 동기화 경고), session-summary 훅 추가 (Stop 이벤트 세션 요약), planner 에이전트 추가 (복잡 요청 단계 분해) |
