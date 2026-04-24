# gugbab-claude

Claude Code를 효과적으로 활용하기 위한 **에이전트(Agent)**, **스킬(Skill)**, **설정(CLAUDE.md)** 모음입니다.

---

## 프로젝트 구조

```
gugbab-claude/
├── README.md
├── CLAUDE.md                     ← 프로젝트 공통 규칙
├── examples/                     ← 프로젝트 유형별 CLAUDE.md 템플릿
│   ├── react-spa-CLAUDE.md
│   ├── nextjs-CLAUDE.md
│   └── rust-axum-CLAUDE.md
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
    │   ├── backend/              ← Rust · Java 백엔드 개발
    │   ├── domain/               ← 도메인 분석·기획·설계
    │   └── devops/               ← DevOps·배포
    ├── hooks/
    │   ├── auto-approve.js       ← 안전한 도구 자동 승인
    │   ├── bash-guard.js         ← 위험 Bash 차단
    │   ├── session-summary.js    ← 세션 종료 시 수정 파일 요약 출력
    │   ├── verification-guard.js ← verification.md 구조·품질 자동 검증
    │   └── skill-md-guard.js     ← SKILL.md 구조 자동 검증
    ├── rules/                    ← 상황별 규칙 (git, typescript, rust 등)
    ├── settings.json             ← 훅 등록 설정
    └── skills/
        ├── frontend/             ← 프론트엔드 스킬 (39종)
        ├── backend/              ← Rust 백엔드 (19종) + Java 백엔드 (22종)
        ├── devops/               ← DevOps 스킬 (2종)
        ├── architecture/         ← 아키텍처 스킬 (1종)
        └── meta/                 ← 프로젝트 관리 스킬 (1종)
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
| [freshness-auditor](./.claude/agents/meta/freshness-auditor.md) | 에이전트·스킬 전체 감사 — 모델 deprecated, 버전 outdated, 검증일 만료, verification.md 누락 점검 | - |
| [skill-tester](./.claude/agents/meta/skill-tester.md) | PENDING_TEST 스킬의 2단계 실사용 테스트 자동 수행 — SKILL.md 기반 실전 질문 생성, general-purpose로 답변 확인, verification.md 업데이트·상태 전환까지 자기 완결 | - |

### research

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [deep-researcher](./docs/agents/research/deep-researcher.md) | 3축(논문/오픈소스/기업사례) 딥리서치 오케스트레이터 | → |
| [web-searcher](./docs/agents/research/web-searcher.md) | 검색 축별 전담 서브에이전트 | → |
| [research-reviewer](./docs/agents/research/research-reviewer.md) | 리서치 품질 5항목 평가 | → |
| [data-analyst](./.claude/agents/research/data-analyst.md) | 이벤트 택소노미 설계, 퍼널 분석, A/B 테스트 계획, KPI 대시보드 스키마 | [→](./docs/agents/research/data-analyst.md) |
| [competitor-analyst](./.claude/agents/research/competitor-analyst.md) | 경쟁사 분석, 기능 비교표, SWOT, 시장 포지셔닝, 차별화 전략 | [→](./docs/agents/research/competitor-analyst.md) |

### validation

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [fact-checker](./docs/agents/validation/fact-checker.md) | 단일 클레임 교차 검증 (VERIFIED/UNVERIFIED/DISPUTED) | → |
| [source-validator](./docs/agents/validation/source-validator.md) | URL/레포/문서 신뢰도 평가 (TRUST/CAUTION/REJECT) | → |
| [qa-engineer](./.claude/agents/validation/qa-engineer.md) | PRD 수용 기준 → 테스트 계획서, E2E 시나리오, Playwright 코드, 회귀 체크리스트 | [→](./docs/agents/validation/qa-engineer.md) |

### frontend

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [frontend-architect](./.claude/agents/frontend/frontend-architect.md) | 프론트엔드 아키텍처 설계 (구조/스택/렌더링/번들링 판단) | - |
| [frontend-developer](./.claude/agents/frontend/frontend-developer.md) | React/Next.js 컴포넌트·훅·API 연동 코드 구현, TypeScript 에러 수정 | - |

### backend

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [rust-backend-developer](./.claude/agents/backend/rust-backend-developer.md) | Rust + Axum 핸들러·서비스·라우터 코드 구현 | - |
| [rust-backend-architect](./.claude/agents/backend/rust-backend-architect.md) | Rust + Axum 아키텍처 설계 — 크레이트 구조, 레이어드 아키텍처, 트레이트 추상화 | - |
| [java-backend-developer](./.claude/agents/backend/java-backend-developer.md) | Java + Spring Boot 코드 구현 — 레거시(SB 2.5/Java 11/MyBatis/WAR) 및 모던(SB 3.x/Java 21) 양쪽 대응, 컴파일 에러 수정 | - |
| [java-backend-architect](./.claude/agents/backend/java-backend-architect.md) | Java + Spring Boot 아키텍처 설계 — 멀티 데이터소스, 캐시 계층, 레거시→모던 마이그레이션 판단, 트레이드오프 | - |
| [build-error-resolver](./.claude/agents/backend/build-error-resolver.md) | Rust/TypeScript/Vite 빌드·컴파일·타입 에러 전담 진단·수정 | - |

### domain

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [business-domain-analyst](./.claude/agents/domain/business-domain-analyst.md) | 비즈니스 요구사항 → DDD 도메인 모델 도출 (유비쿼터스 언어, 바운디드 컨텍스트, 집합체, 도메인 이벤트) | [→](./docs/agents/domain/business-domain-analyst-verification.md) |
| [codebase-domain-analyst](./.claude/agents/domain/codebase-domain-analyst.md) | 코드베이스 역분석 — 도메인 구조 파악, 레이어 의존성 진단, 아키텍처 개선 제안 | [→](./docs/agents/domain/codebase-domain-analyst-verification.md) |
| [product-planner](./.claude/agents/domain/product-planner.md) | 기능 아이디어 → PRD/기능 명세서 작성 (사용자 스토리, 수용 기준, 화면 흐름, 데이터 요구사항, 엣지 케이스) | [→](./docs/agents/domain/product-planner.md) |
| [ui-ux-designer](./.claude/agents/domain/ui-ux-designer.md) | PRD → 텍스트 와이어프레임, 디자인 토큰 체계, 컴포넌트 스펙, 사용자 플로우 (Mermaid), 반응형 전략 | [→](./docs/agents/domain/ui-ux-designer.md) |
| [api-spec-designer](./.claude/agents/domain/api-spec-designer.md) | PRD → OpenAPI 3.x 스펙, REST API 설계, 요청/응답 스키마, RFC 9457 에러 코드 체계 | [→](./docs/agents/domain/api-spec-designer.md) |

### devops

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [devops-engineer](./.claude/agents/devops/devops-engineer.md) | Dockerfile, docker-compose, GitHub Actions CI/CD, Vercel/Railway 배포, 환경변수 관리 | [→](./docs/agents/devops/devops-engineer.md) |

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
| [typescript-v4](./.claude/skills/frontend/typescript-v4/SKILL.md) | TypeScript 4.x (4.0~4.9) 버전별 핵심 기능, 타입 시스템 고급 패턴, tsconfig 설정 | [→](./docs/skills/frontend/typescript-v4/verification.md) |
| [typescript-v5](./.claude/skills/frontend/typescript-v5/SKILL.md) | TypeScript 5.x (5.0~5.8) 버전별 신규 기능, tsconfig 5.x 설정, 4.x 마이그레이션 | [→](./docs/skills/frontend/typescript-v5/verification.md) |
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
| [animation](./.claude/skills/frontend/animation/SKILL.md) | motion 12.x (구 framer-motion) — CSS transition/keyframe, useScroll/useTransform, 드래그/제스처, LazyMotion 번들 최적화, Next.js App Router | [→](./docs/skills/frontend/animation/verification.md) |
| [dayjs](./.claude/skills/frontend/dayjs/SKILL.md) | dayjs 날짜 라이브러리 — 파싱/포맷/조작/비교, 플러그인(relativeTime·utc·timezone·duration), i18n, TypeScript, date-fns 마이그레이션 | [→](./docs/skills/frontend/dayjs/verification.md) |
| [storybook](./.claude/skills/frontend/storybook/SKILL.md) | Storybook 8.x — CSF 3.0, args/controls, play function, autodocs, TypeScript 타입, 모노레포 설정, Chromatic 연동 | [→](./docs/skills/frontend/storybook/verification.md) |
| [react-virtuoso](./.claude/skills/frontend/react-virtuoso/SKILL.md) | react-virtuoso 4.x 가상 스크롤 — Virtuoso/VirtuosoGrid/TableVirtuoso, 동적 높이, 무한 스크롤, GroupedVirtuoso, 프로그래매틱 스크롤 | [→](./docs/skills/frontend/react-virtuoso/verification.md) |
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
| [mui-v5](./.claude/skills/frontend/mui-v5/SKILL.md) | MUI v5 + Emotion — ThemeProvider, sx prop, styled(), 컴포넌트 오버라이드, TypeScript 테마 확장, 반응형 레이아웃, Next.js App Router 통합 | [→](./docs/skills/frontend/mui-v5/verification.md) |
| [swiper](./.claude/skills/frontend/swiper/SKILL.md) | Swiper 11.x 슬라이더/캐러셀 — React 컴포넌트 + Swiper Element, 핵심 모듈, 반응형, 성능 최적화, Next.js SSR | [→](./docs/skills/frontend/swiper/verification.md) |
| [cra-to-vite-migration](./.claude/skills/frontend/cra-to-vite-migration/SKILL.md) | CRA → Vite 마이그레이션 8단계 절차 — 환경 변수, index.html, SVG, tsconfig, Jest→Vitest 전환 | [→](./docs/skills/frontend/cra-to-vite-migration/verification.md) |
| [webpack-vite-config-mapping](./.claude/skills/frontend/webpack-vite-config-mapping/SKILL.md) | Webpack/Craco 설정 → Vite 1:1 매핑 — cacheGroups→manualChunks, babel→esbuild, plugins 대응표, retry chunk | [→](./docs/skills/frontend/webpack-vite-config-mapping/verification.md) |
| [vite-advanced-splitting](./.claude/skills/frontend/vite-advanced-splitting/SKILL.md) | Vite 고급 코드 스플리팅 — manualChunks 함수형, 모바일/데스크톱 분리 빌드, Gulp→Vite 플러그인 훅 전환 | [→](./docs/skills/frontend/vite-advanced-splitting/verification.md) |
| [vite-pwa-service-worker](./.claude/skills/frontend/vite-pwa-service-worker/SKILL.md) | Vite PWA/Service Worker — vite-plugin-pwa, generateSW/injectManifest 전략, 기존 커스텀 SW 마이그레이션 | [→](./docs/skills/frontend/vite-pwa-service-worker/verification.md) |
| [react-dnd](./.claude/skills/frontend/react-dnd/SKILL.md) | react-dnd 16.x 드래그앤드롭 — DndProvider, useDrag/useDrop/useDragLayer, 리스트 순서 변경, 커스텀 프리뷰, 중첩 드롭, Next.js SSR 주의사항, @dnd-kit 선택 기준 | [→](./docs/skills/frontend/react-dnd/verification.md) |
| [tsup](./.claude/skills/frontend/tsup/SKILL.md) | esbuild 기반 TypeScript 라이브러리 번들러 — CJS/ESM 동시 출력, DTS 생성, exports 필드 설정, 모노레포 공유 패키지 빌드 패턴 | [→](./docs/skills/frontend/tsup/verification.md) |
| [rsbuild](./.claude/skills/frontend/rsbuild/SKILL.md) | Rsbuild 2.x — Rspack 기반 고수준 웹 앱 빌드 툴, React/Vue/Svelte 플러그인, CRA·webpack 공식 마이그레이션, Module Federation, Vite/tsup/Rslib와의 선택 기준 | [→](./docs/skills/frontend/rsbuild/verification.md) |
| [e2e-testing](./.claude/skills/frontend/e2e-testing/SKILL.md) | Playwright E2E 테스팅 — POM, 로케이터 전��, 네트워크 인터셉트, 인증 상태, 비주얼 회귀, CI, 샤딩 | [→](./docs/skills/frontend/e2e-testing/verification.md) |

---

### devops

| 스킬 | 설명 | 검증 문서 |
|------|------|----------|
| [docker-deployment](./.claude/skills/devops/docker-deployment/SKILL.md) | Docker 멀티스테이지 빌드, Node.js/Rust Docker화, compose, 이미지 최적화, 보안, Vercel/Railway 배포 | [→](./docs/skills/devops/docker-deployment/verification.md) |
| [github-actions](./.claude/skills/devops/github-actions/SKILL.md) | GitHub Actions CI/CD — 이벤트 트리거, 매트릭스 빌드, 캐싱, Node.js/Rust CI, Docker 빌드, Reusable workflows | [→](./docs/skills/devops/github-actions/verification.md) |

---

### meta

| 스킬 | 설명 | 검증 문서 |
|------|------|----------|
| [continuous-learning](./.claude/skills/meta/continuous-learning/SKILL.md) | Git 히스토리에서 반복 패턴을 발굴해 새 스킬 후보를 도출하는 워크플로우 | - |

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

### backend (Java)

| 스킬 | 설명 | 검증 문서 |
|------|------|----------|
| [spring-boot-gradle-setup](./.claude/skills/backend/spring-boot-gradle-setup/SKILL.md) | Spring Boot 2.5 + Java 11 + WAR/Tomcat 9 (레거시) 와 SB 3.4 + Java 21 + Jar/Native (모던) 듀얼 커버, Gradle 빌드 설정, 마이그레이션 체크리스트 | [→](./docs/skills/backend/spring-boot-gradle-setup/verification.md) |
| [mybatis-mapper-patterns](./.claude/skills/backend/mybatis-mapper-patterns/SKILL.md) | MyBatis Mapper 인터페이스+XML, 동적 SQL, resultMap, TypeHandler, Oracle/MySQL 특화, 페이징, N+1 방지 | [→](./docs/skills/backend/mybatis-mapper-patterns/verification.md) |
| [spring-multi-datasource-oracle-mysql](./.claude/skills/backend/spring-multi-datasource-oracle-mysql/SKILL.md) | Oracle + MySQL 멀티 DataSource 구성, SqlSessionFactory 분리, @Transactional 네임드 매니저, HikariCP 풀 분리 | [→](./docs/skills/backend/spring-multi-datasource-oracle-mysql/verification.md) |
| [hikaricp-tuning-oracle-mysql](./.claude/skills/backend/hikaricp-tuning-oracle-mysql/SKILL.md) | HikariCP 커넥션 풀 튜닝 — Oracle/MySQL 별 권장 설정, maxLifetime vs wait_timeout, Pool Exhaustion 진단, Micrometer 메트릭 | [→](./docs/skills/backend/hikaricp-tuning-oracle-mysql/verification.md) |
| [spring-security-5-jwt-jjwt10](./.claude/skills/backend/spring-security-5-jwt-jjwt10/SKILL.md) | **레거시** Spring Security 5 + JWT (jjwt 0.10.7) — `WebSecurityConfigurerAdapter` 상속, 0.10.x `Jwts.parser()` API, `javax.servlet` | [→](./docs/skills/backend/spring-security-5-jwt-jjwt10/verification.md) |
| [spring-security-6-jwt-jjwt12](./.claude/skills/backend/spring-security-6-jwt-jjwt12/SKILL.md) | **모던** Spring Security 6 + JWT (jjwt 0.12.x) — `SecurityFilterChain` Bean + 람다 DSL, 0.12.x `verifyWith`/`parseSignedClaims`, `jakarta.servlet`, Virtual Threads | [→](./docs/skills/backend/spring-security-6-jwt-jjwt12/verification.md) |
| [global-exception-validation](./.claude/skills/backend/global-exception-validation/SKILL.md) | `@RestControllerAdvice` + `@ExceptionHandler`, 도메인 예외 계층, Bean Validation 표준 어노테이션, 커스텀 Validator, ErrorResponse DTO + traceId | [→](./docs/skills/backend/global-exception-validation/verification.md) |
| [testing-junit5-spring-boot](./.claude/skills/backend/testing-junit5-spring-boot/SKILL.md) | JUnit 5 + Mockito + `@SpringBootTest`, `@MockBean`/`@MockitoBean`, `@MybatisTest`, MockMvc, AssertJ, Testcontainers (Oracle/MySQL) | [→](./docs/skills/backend/testing-junit5-spring-boot/verification.md) |
| [lombok-mapstruct-modelmapper](./.claude/skills/backend/lombok-mapstruct-modelmapper/SKILL.md) | Lombok 어노테이션, MapStruct (컴파일타임, 고성능) vs ModelMapper (런타임, 편의) 선택 기준, `lombok-mapstruct-binding`, Record 지원 | [→](./docs/skills/backend/lombok-mapstruct-modelmapper/verification.md) |
| [logback-mdc-tracing](./.claude/skills/backend/logback-mdc-tracing/SKILL.md) | Logback 설정, SLF4J+MDC, Spring Cloud Sleuth(레거시) vs Micrometer Tracing(모던) 분기, 비동기 컨텍스트 전파 | [→](./docs/skills/backend/logback-mdc-tracing/verification.md) |
| [jasypt-encrypted-config](./.claude/skills/backend/jasypt-encrypted-config/SKILL.md) | `application.yml` 민감값 암호화 — `ENC(...)` 구문, 환경변수 키 주입, `PBEWITHHMACSHA512ANDAES_256`, 커스텀 `StringEncryptor` Bean | [→](./docs/skills/backend/jasypt-encrypted-config/verification.md) |
| [xss-lucy-jsoup](./.claude/skills/backend/xss-lucy-jsoup/SKILL.md) | Naver Lucy XSS Servlet Filter(파라미터 레벨) + jsoup Safelist(HTML 본문) 조합 — 한국 엔터프라이즈 실무 패턴, CSP 헤더 | [→](./docs/skills/backend/xss-lucy-jsoup/verification.md) |
| [jackson-time-migration](./.claude/skills/backend/jackson-time-migration/SKILL.md) | Joda-Time → java.time(JSR-310) 마이그레이션 — Jackson `JavaTimeModule`, `WRITE_DATES_AS_TIMESTAMPS=false`, 타입 매핑·점진 전환 | [→](./docs/skills/backend/jackson-time-migration/verification.md) |
| [swagger-springfox-2](./.claude/skills/backend/swagger-springfox-2/SKILL.md) | **레거시** Springfox 2.9.2 / 3.0.0 — `@Api/@ApiOperation`, SB 2.6+ `PathPatternParser` NPE 해결책, Springdoc 전환 매핑 | [→](./docs/skills/backend/swagger-springfox-2/verification.md) |
| [springdoc-openapi-3](./.claude/skills/backend/springdoc-openapi-3/SKILL.md) | **모던** Springdoc OpenAPI 2.x — OpenAPI 3.1 자동 활성화, `@Tag/@Operation/@Parameter`, Spring Security whitelist, JWT Bearer 설정 | [→](./docs/skills/backend/springdoc-openapi-3/verification.md) |
| [redis-redisson-legacy](./.claude/skills/backend/redis-redisson-legacy/SKILL.md) | **레거시** Redisson 2.15.2 — 분산 락(`RLock.tryLock`), 분산 맵/셋/큐, spring-data-redis 2.6 역할 분담, `RedisCacheManager` | [→](./docs/skills/backend/redis-redisson-legacy/verification.md) |
| [redis-redisson-modern](./.claude/skills/backend/redis-redisson-modern/SKILL.md) | **모던** Redisson 3.18.1+ — `RedissonClient` 자동 구성, Reactive/Async API, 2.x→3.x 마이그레이션(yaml 키 이동) | [→](./docs/skills/backend/redis-redisson-modern/verification.md) |
| [ehcache-2-legacy](./.claude/skills/backend/ehcache-2-legacy/SKILL.md) | **레거시** EhCache 2.10.9.2 — `ehcache.xml`(TTL/LRU/maxEntriesLocalHeap), CacheEventListener, Redis 2계층 캐시 패턴 | [→](./docs/skills/backend/ehcache-2-legacy/verification.md) |
| [aws-sdk-v1-s3-rekognition](./.claude/skills/backend/aws-sdk-v1-s3-rekognition/SKILL.md) | **레거시** AWS SDK v1 — S3 presigned URL, `TransferManager`, Rekognition DetectFaces/Labels, BOM 통일(2025-12 EOL 경고) | [→](./docs/skills/backend/aws-sdk-v1-s3-rekognition/verification.md) |
| [aws-sdk-v2-s3-rekognition](./.claude/skills/backend/aws-sdk-v2-s3-rekognition/SKILL.md) | **모던** AWS SDK v2 — `S3Client`/`S3Presigner`/`S3TransferManager`, `RekognitionClient`, `AutoCloseable`, OpenRewrite 마이그레이션 도구 | [→](./docs/skills/backend/aws-sdk-v2-s3-rekognition/verification.md) |
| [webflux-webclient-in-sync-app](./.claude/skills/backend/webflux-webclient-in-sync-app/SKILL.md) | WebMVC 블로킹 앱에서 `WebClient` 부분 비동기 사용 — Reactor Netty 타임아웃, `onStatus`, `Retry.backoff`, `MockWebServer` 테스트 | [→](./docs/skills/backend/webflux-webclient-in-sync-app/verification.md) |
| [bouncycastle-crypto](./.claude/skills/backend/bouncycastle-crypto/SKILL.md) | BC 1.64 / 1.78.1 — AES-GCM/RSA-OAEP, X.509, PEM, KISA SEED/ARIA 표준, CVE 주의 | [→](./docs/skills/backend/bouncycastle-crypto/verification.md) |

---

## 훅 (Hooks)

| 훅 | 유형 | 설명 |
|----|------|------|
| [auto-approve](./.claude/hooks/auto-approve.js) | PreToolUse + PermissionRequest | 안전한 비-Bash 도구(Read/Write/Edit 등) 자동 승인 |
| [bash-guard](./.claude/hooks/bash-guard.js) | PreToolUse + PermissionRequest + PostToolUse | 위험한 Bash 패턴 차단, git commit/push 사용자 확인 강제, .claude/ 파일 삭제·이동 시 README 동기화 경고 |
| [session-summary](./.claude/hooks/session-summary.js) | PostToolUse + Stop | 세션 중 수정된 파일을 누적 추적, 세션 종료 시 요약 출력 |
| [verification-guard](./.claude/hooks/verification-guard.js) | PostToolUse | verification.md 구조·품질 자동 검증 (8개 섹션, 내장 지식 금지, 체크박스 완성도) |
| [skill-md-guard](./.claude/hooks/skill-md-guard.js) | PostToolUse | SKILL.md 구조 자동 검증 (frontmatter name·description, > 소스:, > 검증일: 필수) |
| [pending-test-guard](./.claude/hooks/pending-test-guard.js) | Stop | 오늘 생성·수정된 PENDING_TEST 스킬 중 verification.md 섹션 5에 오늘 날짜 수행 기록이 없는 경우 세션 종료 차단. skill-tester 호출 유도 |

---

## 다른 프로젝트에 설치하기

gugbab-claude의 에이전트·훅·규칙을 다른 프로젝트에 심어서 팀 전체가 동일한 Claude Code 환경으로 작업할 수 있습니다.

### 설치

```bash
cd ~/Desktop/gugbab-workspace/00_gugbab-claude
./project-install.sh
```

실행하면 순서대로 입력을 요청합니다.

```
프로젝트 경로를 입력하세요: /Users/lf/Desktop/my-project

템플릿을 선택하세요:
  0) 전체              — 모든 에이전트·스킬·규칙 복사
  1) 유틸              — 비개발자용 (리서치·검증·플래너 등 범용 에이전트만)
  2) react-spa         — React SPA
  3) nextjs            — Next.js App Router
  4) rust-axum         — Rust + Axum 백엔드
  5) java-spring-legacy — Java 11 + Spring Boot 2.5 + WAR + MyBatis
  6) java-spring-modern — Java 21 + Spring Boot 3.x + Jar/Native + MyBatis

번호 입력 (0/1/2/3/4/5/6): 2
```

설치가 완료되면 대상 프로젝트에서 커밋합니다.

```bash
cd /Users/lf/Desktop/my-project
git add .claude/ CLAUDE.md
git commit -m '[config] Add: Claude Code 컨벤션 설정'
git push
```

팀원은 `git clone` 후 Claude Code를 열면 바로 동일한 환경이 구성됩니다.

### 설치되는 항목

| 항목 | 동작 |
|------|------|
| `.claude/hooks/` | 같은 이름이면 덮어씌움 / 프로젝트 고유 훅은 유지 |
| `.claude/agents/` | 같은 이름이면 덮어씌움 / 프로젝트 고유 에이전트는 유지 |
| `.claude/rules/` | 같은 이름이면 덮어씌움 / 프로젝트 고유 규칙은 유지 |
| `.claude/skills/` | 같은 이름이면 덮어씌움 / 프로젝트 고유 스킬은 유지 |
| `.claude/settings.json` | 이미 있으면 건너뜀 (프로젝트 고유 권한·훅 설정 보존) |
| `CLAUDE.md` | 이미 있으면 건너뜀 (프로젝트 고유 내용 보존) |

### gugbab-claude 업데이트 후 갱신

gugbab-claude에 에이전트·훅·규칙이 추가되거나 수정되면 동일한 스크립트를 다시 실행해 프로젝트에 반영합니다.

```bash
# gugbab-claude 최신화
cd ~/Desktop/gugbab-workspace/00_gugbab-claude
git pull

# 대상 프로젝트에 갱신
./project-install.sh
# 경로·템플릿 입력 후 자동으로 덮어씌워짐

# 변경 내용 커밋
cd /Users/lf/Desktop/my-project
git add .claude/
git commit -m '[config] Update: Claude Code 컨벤션 업데이트'
git push
```

> **CLAUDE.md와 settings.json은 갱신하지 않습니다.**
>
> 두 파일은 프로젝트마다 직접 수정하는 파일입니다.
> - `CLAUDE.md` — 프로젝트명, 실행 명령어, 팀 고유 규칙이 담겨 있음
> - `settings.json` — 프로젝트 고유 권한 설정, 추가 훅 연결이 담겨 있음
>
> 덮어쓰면 프로젝트에서 작성한 내용이 전부 사라지므로 건너뜁니다.
> hooks·agents·rules는 gugbab-claude가 원본이므로 같은 이름의 파일은 최신 버전으로 덮어쓰고, 프로젝트 고유 파일은 그대로 유지합니다.

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
| 2026-04-21 | 1인 스타트업 역할 확장 — 에이전트 6종 추가 (ui-ux-designer·qa-engineer·devops-engineer·api-spec-designer·data-analyst·competitor-analyst), devops 카테고리 신설, 스킬 3종 추가 (e2e-testing·docker-deployment·github-actions), product-planner WebSearch 검증 (성공 지표·비기능 요구사항 보완), verification-policy.md 규칙 추가 (APPROVED 전환 4단계 절차 강제, bash-guard 검증 파일 보호), 프론트엔드 스킬 12개 APPROVED 전환 (WebSearch 교차 검증 + 테스트 질문), 에이전트 docs 9개 생성, example 태그 보완 |
| 2026-04-23 | Java 백엔드 스킬 12종 추가 (Tier 2 확장) — jasypt-encrypted-config, xss-lucy-jsoup, jackson-time-migration (COMMON), swagger-springfox-2, redis-redisson-legacy, ehcache-2-legacy, aws-sdk-v1-s3-rekognition (LEGACY_ONLY), springdoc-openapi-3, redis-redisson-modern, aws-sdk-v2-s3-rekognition (MODERN_ONLY), webflux-webclient-in-sync-app, bouncycastle-crypto (COMMON). 전부 2단계 에이전트 활용 테스트 PASS → APPROVED. project-install.sh `JAVA_SKILLS_*` 배열 확장 (COMMON 13 / LEGACY_ONLY 5 / MODERN_ONLY 4). Tier 1 Phase 4 gap 보강 완료 (spring-boot-gradle-setup §6.5 추가, 경미 gap 6건 보강, gradle-setup APPROVED 전환). 프론트엔드 스킬 1종 추가 — rsbuild (Rspack 기반 웹 앱 빌드 툴, CRA·webpack 마이그레이션, Module Federation, Vite/tsup/Rslib 선택 기준, 2단계 테스트 PASS → APPROVED). skill-tester 에이전트 개편 — 단계 5에 "섹션 7 체크박스 전환 + 섹션 8 변경 이력 행 추가" 의무 조항 추가, 단계 5.5(verification.md Read 재확인 체크리스트 6개) 신설, 중요 원칙에 섹션 5·6·7·8 전체 동기화 규칙 추가 (rsbuild 스킬 작업 중 발견된 섹션 5·6만 업데이트되고 섹션 7·8 cleanup 누락 이슈 대응). 전체 37개 verification.md 섹션 7 ❌ 항목 일괄 cleanup — 125개 ❌ → 0개(완료 ✅ 31 / 선택 보강 ⏸️ 64 / 미래 버전 📅 13 / 실환경 검증 🔬 21)로 정리해 "테스트 안 됨"으로 오해되던 문서 불일치 해소. pending-test-guard 훅 완화 — 섹션 5에 과거 수행 기록이 있으면 섹션 7/8 cleanup-only 수정을 통과시키도록 조건 변경 (신규 스킬 PENDING_TEST 차단 효과는 유지) |
| 2026-04-22 | **테스트 강제화 체계 구축** — skill-tester 에이전트 신설 (PENDING_TEST 스킬 2단계 테스트 자동 수행), pending-test-guard Stop 훅 신설 (오늘 생성된 PENDING_TEST 중 섹션 5 수행 기록 없으면 세션 종료 차단), creation-workflow.md 5단계로 확장 (단계 5: skill-tester 호출 필수), 산출물 체크리스트에 "agent content test" + "수행일 기록" 항목 추가, Java Tier 1 10종에 2단계 테스트 수행 및 7종 APPROVED 전환 + 3종 (빌드/워크플로우/설정) agent test 기록 유지 / Java 백엔드 지원 추가 — rules/java.md (Java 11/21 듀얼 커버, MyBatis, 멀티 데이터소스, Spring Boot 2→3 마이그레이션 가이드) 추가, 에이전트 2종 추가 (java-backend-architect, java-backend-developer), Java 백엔드 스킬 10종 추가 (spring-boot-gradle-setup, mybatis-mapper-patterns, spring-multi-datasource-oracle-mysql, hikaricp-tuning-oracle-mysql, spring-security-5-jwt-jjwt10, spring-security-6-jwt-jjwt12, global-exception-validation, testing-junit5-spring-boot, lombok-mapstruct-modelmapper, logback-mdc-tracing), project-install.sh 템플릿 2종 추가 (java-spring-legacy, java-spring-modern), 플러그인 설정 프로젝트 scope 이관 (extraKnownMarketplaces 제거, enabledPlugins만 유지로 강제 설치 프롬프트 방지), `Bash(codex*)` 권한 추가, 글로벌(`~/.claude/`) CLAUDE.md·rules·agents 심볼릭 링크 정리 (프로젝트 scope 전용 원칙 확립), '요청된 것만 수정' 원칙을 CLAUDE.md·템플릿에 이식, CLAUDE.md 인코딩 깨짐 교정 |
| 2026-04-20 | freshness-auditor 에이전트 추가 (에이전트·스킬 최신화 감사), typescript-v4·typescript-v5 스킬 추가 (TS 버전별 핵심 기능·tsconfig·마이그레이션), typescript 통합 스킬 제거 (v4·v5로 분리 대체), web-searcher MCP 도구 제거 (WebSearch/WebFetch 단순화), continuous-learning verification.md 보완, CRA → Vite 마이그레이션 관련 프론트엔드 스킬 4종 추가, animation 스킬 motion 12.x 기준 전면 재작성 (framer-motion → motion 마이그레이션·useScroll/useTransform/useSpring/useInView·LazyMotion), dayjs·storybook·swiper·react-dnd·tsup·mui-v5·react-virtuoso 프론트엔드 스킬 7종 추가 (공식 문서 WebSearch 기반 검증), CLAUDE.md 경량화 및 디렉토리별 CLAUDE.md 분리, bash-guard PostToolUse 핸들러 추가, session-summary 훅 추가, planner·build-error-resolver 에이전트 추가, rules/typescript·rust 언어별 코딩 규칙 분리, project-install.sh 추가 (다른 프로젝트에 Claude Code 컨벤션 이식) |
