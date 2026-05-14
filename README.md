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
    │   ├── devops/               ← DevOps·배포
    │   └── education/            ← 교육과정 인용 검증
    ├── hooks/
    │   ├── auto-approve.js       ← 안전한 도구 자동 승인
    │   ├── bash-guard.js         ← 위험 Bash 차단
    │   ├── session-summary.js    ← 세션 종료 시 수정 파일 요약 출력
    │   ├── verification-guard.js ← verification.md 구조·품질 자동 검증
    │   └── skill-md-guard.js     ← SKILL.md 구조 자동 검증
    ├── rules/                    ← 상황별 규칙 (git, typescript, rust 등)
    ├── settings.json             ← 훅 등록 설정
    └── skills/
        ├── frontend/             ← 프론트엔드 스킬 (48종)
        ├── backend/              ← Rust 백엔드 (19종) + Java 백엔드 (22종)
        ├── devops/               ← DevOps 스킬 (3종)
        ├── architecture/         ← 아키텍처 스킬 (1종)
        ├── humanities/           ← 인문학·철학 스킬 (12종)
        ├── research/             ← 학술 리서치 스킬 (4종)
        ├── writing/              ← 학술 글쓰기 스킬 (12종)
        ├── education/            ← 교육과정·도덕교육 스킬 (5종)
        └── meta/                 ← 프로젝트 관리 스킬 (2종)
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
| [academic-researcher](./.claude/agents/research/academic-researcher.md) | 인문학·철학 학술 리서치 오케스트레이터 — 1차 텍스트 / 2차 학술 문헌 / 현대적 응용 3축, 한국 인문학 인용 형식 출력 | - |
| [translation-comparison](./.claude/agents/research/translation-comparison.md) | 동일 1차 텍스트(Bekker·Stephanus 위치)의 다국어·다역본 행 단위 비교 — 그리스어 원문 + 영역본·국역본 대조표, 핵심 개념어 번역 차이, 학술적 인용 권고 | - |
| [literature-review-synthesizer](./.claude/agents/research/literature-review-synthesizer.md) | 다수 2차 학술 문헌 종합 — 연구사 흐름표, 학파 계보도(Mermaid), 핵심 논쟁 매트릭스(Concept Matrix), 연구 갭 도출, 학위논문 선행연구 챕터 보조 (opus, maxTurns 30, Read/Write/Grep/Glob) | - |
| [defense-question-simulator](./.claude/agents/research/defense-question-simulator.md) | 학위논문 본문 → 한국 대학원 심사위원 예상 질문 12-15개 + 6요소(의도·구조·인용위치·권장표현·회피표현·함정등급) + 약점 3개 + 함정 회피 스크립트, 7개 카테고리(주제·방법론·1차 텍스트·선행연구·논증·적용·한계), 심사위원 톤 4유형(호의·비판·방법론·현장), 텍스트 범위 정당화 강제, 영문 학위논문 처리, 해석학·사상사 방법론 특화 (opus, maxTurns 25, Read만) | - |
| [research-proposal-coach](./.claude/agents/research/research-proposal-coach.md) | 큰 주제 → RQ 후보 5-8개 생성 + 5항목 평가표(기여도·자료가용·선행연구·범위·분야적합) + 추천/비추천 판정 + 지도교수 면담용 1쪽 요약(가제목 한·영, 학기 일정) + 후속 질문 3개. 인문학 RQ 5유형 분포 보장(개념분석·사상사·비교철학·적용/실천·비판적 검토). 윤리 고지(본문 집필 거부, 참고자료 표기) 강제 (opus, maxTurns 25, Read/WebSearch) | - |
| [socratic-interviewer](./.claude/agents/research/socratic-interviewer.md) | 모호한 요구 → 명확한 명세(Seed) 변환 — 답을 주지 않고 질문으로 사용자 사유 정리. 5단계 명료도(L1~L5) 평가, 질문 4카테고리(목표·제약·결정사항·모호함), Seed 출력 + 다음 단계 추천. Ouroboros Agent OS 컨셉 한국화 (opus, maxTurns 25, Read/WebSearch) | - |
| [data-analyst](./.claude/agents/research/data-analyst.md) | 이벤트 택소노미 설계, 퍼널 분석, A/B 테스트 계획, KPI 대시보드 스키마 | [→](./docs/agents/research/data-analyst.md) |
| [competitor-analyst](./.claude/agents/research/competitor-analyst.md) | 경쟁사 분석, 기능 비교표, SWOT, 시장 포지셔닝, 차별화 전략 | [→](./docs/agents/research/competitor-analyst.md) |

### validation

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [fact-checker](./docs/agents/validation/fact-checker.md) | 단일 클레임 교차 검증 (VERIFIED/UNVERIFIED/DISPUTED) | → |
| [source-validator](./docs/agents/validation/source-validator.md) | URL/레포/문서 신뢰도 평가 (TRUST/CAUTION/REJECT) | → |
| [qa-engineer](./.claude/agents/validation/qa-engineer.md) | PRD 수용 기준 → 테스트 계획서, E2E 시나리오, Playwright 코드, 회귀 체크리스트 | [→](./docs/agents/validation/qa-engineer.md) |
| [citation-checker](./.claude/agents/validation/citation-checker.md) | 학술 논문 원고의 본문 인용 ↔ 참고문헌 대조, Bekker 번호·페이지·연도·저자명 표기 일관성 검증, 의심 항목 외부 검증(WorldCat·PhilPapers·Perseus 등) | - |
| [argument-reviewer](./.claude/agents/validation/argument-reviewer.md) | 철학·인문학 논문 논증 평가 — 전제·결론 매핑, 5항목(명확성·타당성·충분성·반박검토·학술적 기여) 평가, 비형식 오류 탐지, STRONG/NEEDS_STRENGTHENING/MAJOR_REVISION 판정 | - |
| [abstract-reviewer](./.claude/agents/validation/abstract-reviewer.md) | 학술 논문 초록·키워드 평가 — 6항목(분량·구조·표현·인용·키워드·검색 노출 ASEO), 인문학 5요소(문제 제기·연구 위치·핵심 논증·결론·기여), 학술지별 양식(KCI/APA 7/MLA 9/Springer/Elsevier), 미래시제·hedging 정량 임계값, 학술지 기본값 결정 트리, "기여" 진술 구체성 룰브릭, 치명적 vs 권장 분류 매트릭스, PASS/NEEDS_REVISION 판정, 재작성 금지(Read/WebSearch/WebFetch만, sonnet, maxTurns 15) | - |
| [peer-review-simulator](./.claude/agents/validation/peer-review-simulator.md) | 학술지 익명 동료 심사 시뮬레이션 — KCI/JME/E&E/EPT 등 학술지별 모드 자동 감지, 5관점(Originality·Theory·Methodology·Argumentation·Writing), Accept/Minor/Major/Reject 판정, General/Major/Minor Comments + Strengths 출력, 자매 에이전트(argument-reviewer·citation-checker·abstract-reviewer·curriculum-2022-fact-checker) 결과 통합 절차, 원고 분량별 코멘트 가이드, 인신공격 금지·강점 명시 공정성 (opus, maxTurns 25, Read만) | - |
| [build-perf-benchmarker](./.claude/agents/validation/build-perf-benchmarker.md) | 빌드·번들·dev 서버·Lighthouse 성능 지표 측정 실행 전담 — hyperfine으로 cold/warm 빌드 N회 반복, rollup-plugin-visualizer/webpack-bundle-analyzer 청크 분석, HMR 지연 측정, lhci collect, median/p95/IQR·혼동변수·이상치 표기, 결과는 `./bench-results/{date}/{kind}/`에 markdown+JSON 산출. 해석·서사는 `perf-report-writer`에 위임 (sonnet, maxTurns 20, Bash/Read/Write) | - |
| [perf-report-writer](./.claude/agents/validation/perf-report-writer.md) | `build-perf-benchmarker` 산출물(`./bench-results/{date}/`) → 이해관계자용 성능 보고서 작성 — 7섹션 표준(Executive Summary·환경 정보·측정 결과·혼동변수·통계적 해석 CI95%·결론/권고·다음 단계), Web Vitals 한계값 WebSearch 검증 후 인용, raw.json에 없는 값 작성 금지, 측정 재실행은 benchmarker 재호출 안내 (sonnet, maxTurns 15, Read/Write/WebSearch) | - |

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

### education

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [curriculum-2022-fact-checker](./.claude/agents/education/curriculum-2022-fact-checker.md) | 학위논문·학술지 원고에서 2022 개정 도덕과 교육과정 인용을 NCIC 원문과 자동 대조 — 성취기준 코드 형식, 코드↔전문 매칭, 영역명, 교과역량, 적용 시기, 2015↔2022 개정 혼동 6항목 점검, 의심 항목 NCIC 외부 검증, PASS/NEEDS_REVISION 판정 (sonnet, maxTurns 20, Read/Grep/WebSearch/WebFetch) | - |

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
| [web-speech-api-tts](./.claude/skills/frontend/web-speech-api-tts/SKILL.md) | 브라우저 내장 TTS — speechSynthesis + SpeechSynthesisUtterance, getVoices() 비동기 로딩(voiceschanged), 영어 voice 필터링, rate·pitch·volume, 일시정지/재개/취소+큐, iOS Safari 백그라운드 자동중단 대응, 미지원 브라우저 graceful degradation, React useSpeech 훅 | [→](./docs/skills/frontend/web-speech-api-tts/verification.md) |
| [srs-spaced-repetition](./.claude/skills/frontend/srs-spaced-repetition/SKILL.md) | 간격 반복 학습 알고리즘 — SM-2(Anki classic, 1987 Wozniak EF·interval) + FSRS-5(2024 표준, DSR 모델 19 weights, forgetting curve r=exp(ln(0.9)*t/S)) 비교, 카드 상태 4종(New/Learning/Review/Relearning), 2버튼/4-rating 매핑, 단조 증가 unit test, 시계 변경 방어 | [→](./docs/skills/frontend/srs-spaced-repetition/verification.md) |
| [indexeddb-dexie](./.claude/skills/frontend/indexeddb-dexie/SKILL.md) | Dexie 4.4.x로 IndexedDB — 스키마 db.version().stores(), 인덱스 표기(++id·&unique·*multi-entry·[a+b] compound), .upgrade() 마이그레이션, 트랜잭션 rw, where/orderBy/limit, dexie-react-hooks useLiveQuery, 차단 환경 감지 폴백, PWA Persistent Storage | [→](./docs/skills/frontend/indexeddb-dexie/verification.md) |
| [vite-pwa-service-worker](./.claude/skills/frontend/vite-pwa-service-worker/SKILL.md) | Vite PWA/Service Worker — vite-plugin-pwa, generateSW/injectManifest 전략, 기존 커스텀 SW 마이그레이션 | [→](./docs/skills/frontend/vite-pwa-service-worker/verification.md) |
| [react-dnd](./.claude/skills/frontend/react-dnd/SKILL.md) | react-dnd 16.x 드래그앤드롭 — DndProvider, useDrag/useDrop/useDragLayer, 리스트 순서 변경, 커스텀 프리뷰, 중첩 드롭, Next.js SSR 주의사항, @dnd-kit 선택 기준 | [→](./docs/skills/frontend/react-dnd/verification.md) |
| [tsup](./.claude/skills/frontend/tsup/SKILL.md) | esbuild 기반 TypeScript 라이브러리 번들러 — CJS/ESM 동시 출력, DTS 생성, exports 필드 설정, 모노레포 공유 패키지 빌드 패턴 | [→](./docs/skills/frontend/tsup/verification.md) |
| [rsbuild](./.claude/skills/frontend/rsbuild/SKILL.md) | Rsbuild 2.x — Rspack 기반 고수준 웹 앱 빌드 툴, React/Vue/Svelte 플러그인, CRA·webpack 공식 마이그레이션, Module Federation, Vite/tsup/Rslib와의 선택 기준 | [→](./docs/skills/frontend/rsbuild/verification.md) |
| [e2e-testing](./.claude/skills/frontend/e2e-testing/SKILL.md) | Playwright E2E 테스팅 — POM, 로케이터 전략, 네트워크 인터셉트, 인증 상태, 비주얼 회귀, CI, 샤딩 | [→](./docs/skills/frontend/e2e-testing/verification.md) |
| [storybook-visual-testing](./.claude/skills/frontend/storybook-visual-testing/SKILL.md) | Storybook 10 + @storybook/test-runner + Playwright `toHaveScreenshot` 자체 호스팅 시각 회귀 — preVisit/postVisit 훅, axe-playwright a11y, iframe 캡처, baseline Docker 강제, 모노레포 멀티 Storybook | [→](./docs/skills/frontend/storybook-visual-testing/verification.md) |
| [build-perf-benchmarking](./.claude/skills/frontend/build-perf-benchmarking/SKILL.md) | hyperfine 1.20.0 빌드 시간 벤치마킹 — `--warmup`/`--prepare`/`--runs`/`--export-markdown`/`--export-json` 핵심 옵션, cold(`rm -rf node_modules/.vite` 등) vs warm 분리, N회 반복 median 권장 + p95 JSON 후처리, 혼동변수(CPU 부하·디스크 캐시·thermal throttling) 명시, `--prepare` vs `--warmup` 정반대 의미 주의, 표준 보고서 포맷 | [→](./docs/skills/frontend/build-perf-benchmarking/verification.md) |
| [bundle-size-analysis](./.claude/skills/frontend/bundle-size-analysis/SKILL.md) | raw/gzip/brotli 번들 크기 측정·청크 비교 — rollup-plugin-visualizer 7.0.1(`gzipSize`/`brotliSize` 기본 false 주의, 7+종 템플릿) / vite-bundle-visualizer 1.2.1 / webpack-bundle-analyzer(stat·parsed·gzip 3종) / size-limit 12.1.0 + andresz1/size-limit-action@v1 CI 임계치, node_modules 단일 청크·source map 포함 측정·duplicate dependency 7가지 함정 | [→](./docs/skills/frontend/bundle-size-analysis/verification.md) |
| [dev-server-hmr-benchmarking](./.claude/skills/frontend/dev-server-hmr-benchmarking/SKILL.md) | dev server cold start + HMR 지연 측정 — Vite `import.meta.hot.on('vite:beforeUpdate'/'vite:afterUpdate')` 정밀 시점 + `performance.now()` 차이로 latency, Webpack `stats.timings: true`, Chrome DevTools Performance Capture settings(Network/CPU throttling·Screenshots·Memory), hyperfine `--prepare 'rm -rf node_modules/.vite'` cold 반복, WSL2 `/mnt/c/` inotify·macOS FSEvents 128 워처 제한 watcher 차이 | [→](./docs/skills/frontend/dev-server-hmr-benchmarking/verification.md) |
| [lighthouse-ci-setup](./.claude/skills/frontend/lighthouse-ci-setup/SKILL.md) | Lighthouse CI 설정 + Core Web Vitals 회귀 감지 — `@lhci/cli@0.15.1` collect/assert/upload, `lighthouserc.json` (numberOfRuns 3+·startServerCommand·preset 3종·aggregationMethod 4종), CWV threshold(LCP 2.5s·INP 200ms·CLS 0.1, 2024-03 FID→INP), TBT good ≤ 200ms, performance 가중치(TBT 30/LCP 25/CLS 25/FCP 10/SI 10), treosh/lighthouse-ci-action@v12, temporary-public-storage 공개성 주의 | [→](./docs/skills/frontend/lighthouse-ci-setup/verification.md) |
| [web-vitals-rum-comparison](./.claude/skills/frontend/web-vitals-rum-comparison/SKILL.md) | RUM 실사용자 Core Web Vitals 추출·배포 전후 비교 — `web-vitals` v5 onLCP/onINP/onCLS + visibilitychange 확정, Sentry `browserTracingIntegration({enableInp})` + Discover `p75(measurements.inp)` + release 태그, Datadog `@datadog/browser-rum` v7.1.0 + `@view.largest_contentful_paint` + RUM Explorer `@version:(A OR B)` Group by `@version` Measure p75, 트래픽 분포·표본 크기·INP bfcache·샘플링 곱셈·release 누락 8가지 함정 | [→](./docs/skills/frontend/web-vitals-rum-comparison/verification.md) |

---

### devops

| 스킬 | 설명 | 검증 문서 |
|------|------|----------|
| [docker-deployment](./.claude/skills/devops/docker-deployment/SKILL.md) | Docker 멀티스테이지 빌드, Node.js/Rust Docker화, compose, 이미지 최적화, 보안, Vercel/Railway 배포 | [→](./docs/skills/devops/docker-deployment/verification.md) |
| [github-actions](./.claude/skills/devops/github-actions/SKILL.md) | GitHub Actions CI/CD — 이벤트 트리거, 매트릭스 빌드, 캐싱, Node.js/Rust CI, Docker 빌드, Reusable workflows | [→](./docs/skills/devops/github-actions/verification.md) |
| [github-actions-visual-regression](./.claude/skills/devops/github-actions-visual-regression/SKILL.md) | Storybook + Playwright 시각 회귀 GitHub Actions workflow — paths-filter 트리거, start-server-and-test, baseline 캐시, PR 코멘트 자동화, matrix 멀티 Storybook, pull_request_target 보안 | [→](./docs/skills/devops/github-actions-visual-regression/verification.md) |

---

### meta

| 스킬 | 설명 | 검증 문서 |
|------|------|----------|
| [continuous-learning](./.claude/skills/meta/continuous-learning/SKILL.md) | Git 히스토리에서 반복 패턴을 발굴해 새 스킬 후보를 도출하는 워크플로우 | - |
| [ralph-loop](./.claude/skills/meta/ralph-loop/SKILL.md) | 명시적 종료 조건이 있는 자율 반복 루프 워크플로우 — 검증·테스트·다듬기 작업을 PASS 기준 충족까지 반복 실행. max_iterations·convergence·timeout 4중 안전장치, 외부 부작용 작업 금지, 사용자 인터럽트 보장. Ouroboros Agent OS Ralph 모드 컨셉 한국화 | [→](./docs/skills/meta/ralph-loop/verification.md) |

---

### humanities

| 스킬 | 설명 | 검증 문서 |
|------|------|----------|
| [aristotle-primary-citation](./.claude/skills/humanities/aristotle-primary-citation/SKILL.md) | 아리스토텔레스 1차 텍스트 인용 — Bekker 번호 체계, 작품 표준 약어, 영역본 4종(Ross/Irwin/Crisp/Bartlett & Collins) + 그리스어 비평본(Bywater OCT/Susemihl/Rowe) + 국역본(강상진 외 길/이제이북스/숲), NE VII.1-10 akrasia 위치 매핑 | [→](./docs/skills/humanities/aristotle-primary-citation/verification.md) |
| [akrasia-scholarship-map](./.claude/skills/humanities/akrasia-scholarship-map/SKILL.md) | akrasia(자제력 없음) 학술 논쟁 지도 — 소크라테스 vs 아리스토텔레스, 현대 분석철학 6명(Davidson·Mele·Wiggins·Charlton·Rorty·Holton), 한국 학계, 도덕심리학 응용(Haidt·Greene·Baumeister·Mischel), SEP·Cambridge Companion 입문 경로 | [→](./docs/skills/humanities/akrasia-scholarship-map/verification.md) |
| [aristotle-greek-text-tools](./.claude/skills/humanities/aristotle-greek-text-tools/SKILL.md) | 아리스토텔레스 그리스어 원전 도구 — Perseus Digital Library(Bekker URL 패턴) + LSJ(Logeion) + Smyth Greek Grammar + TLG, akrasia 핵심 어휘 분석(ἀκρασία/ἐγκράτεια/προπέτεια/ἀσθένεια/φρόνησις/ἕξις), ALA-LC 음역, 비평본(Bywater/Susemihl/Walzer-Mingay/Rowe) 비교 | [→](./docs/skills/humanities/aristotle-greek-text-tools/verification.md) |
| [concept-analysis-methods](./.claude/skills/humanities/concept-analysis-methods/SKILL.md) | 철학적 개념 분석 방법론 — 분석철학(Moore 1903, Gettier counterexample), Quine·Wittgenstein 비판, 반성적 평형(Rawls), 개념 공학(Cappelen 2018), 해석학(Schleiermacher→Gadamer), 사상사(Skinner 케임브리지 학파), akrasia 적용 방법 선택 가이드 | [→](./docs/skills/humanities/concept-analysis-methods/verification.md) |
| [aristotle-akrasia-translations-comparison](./.claude/skills/humanities/aristotle-akrasia-translations-comparison/SKILL.md) | akrasia 핵심 어휘(akrasia/enkrateia/propeteia/astheneia/akolasia/hexis/phronēsis/orexis) 번역어 비교표 — Ross/Irwin/Crisp/Bartlett & Collins 영역 + 강상진 외(길 2011) 국역 검증, 천병희(숲 2013) 일부 [검증 필요], 본문 첫 등장 시 한·영·그리스어 3중 표기 권고, akrasia↔akolasia "무절제" 충돌 구분 | [→](./docs/skills/humanities/aristotle-akrasia-translations-comparison/verification.md) |
| [korean-moral-education-thinkers](./.claude/skills/humanities/korean-moral-education-thinkers/SKILL.md) | 한국 도덕교육 사상가 계보 — 박은식·정인보·박종홍·김태길·윤사순 (1세대) + 추병완·박병기·박재주·박장호 (현대), KCI 검증 한정, 박장호(2009)→박재주(2011)→본 연구 직계 선행연구 다이어그램, 거시·중간·미시 3층위 서술 가이드, 박종홍 국민교육헌장 인용 주의(기초위원 26명 중 1인) | [→](./docs/skills/humanities/korean-moral-education-thinkers/verification.md) |
| [virtue-ethics-modern-revival](./.claude/skills/humanities/virtue-ethics-modern-revival/SKILL.md) | 현대 덕윤리 부흥 — Anscombe 1958 *Philosophy* 33권 기점(consequentialism 신조어 도입), MacIntyre *After Virtue* 1981/1984/2007, Foot *Natural Goodness* 2001, Hursthouse *On Virtue Ethics* 1999(v-rules·full virtue/continence/akrasia 연속체), Slote, Annas, Nussbaum *Fragility of Goodness*, Swanton, akrasia ↔ phronesis 결여 연결 | [→](./docs/skills/humanities/virtue-ethics-modern-revival/verification.md) |
| [aristotelian-virtue-ethics-detail](./.claude/skills/humanities/aristotelian-virtue-ethics-detail/SKILL.md) | 아리스토텔레스 NE I-VI권 세부 — eudaimonia(I)·hexis/ethismos/meson(II)·prohairesis/bouleusis(III)·정의(V)·phronesis(VI)·우정(VIII-IX)·관조(X), akrasia(VII)와의 권별 매핑표, NE V/VI/VII = EE IV/V/VI 공통권, akrates ≠ phronimos(1146a4-9), hexis 위치 1105b25 vs 1106a10 DISPUTED 병기 | [→](./docs/skills/humanities/aristotelian-virtue-ethics-detail/verification.md) |
| [socratic-akrasia-denial-detail](./.claude/skills/humanities/socratic-akrasia-denial-detail/SKILL.md) | 소크라테스 akrasia 부정론 세부 — *프로타고라스* 352b-358d 외 *고르기아스* 466b-468e/499b-500a, *메논* 77b-78b 5단계, *국가* IV 437b-441c 영혼 삼분설(플라톤이 소크라테스 변형), *법률* IX 859c-864c 부정론 약화, Xenophon *Memorabilia* III.9.4-5, Vlastos vs Irwin 학파 다툼, NE VII.2 1145b21-28 아리스토텔레스 비판 | [→](./docs/skills/humanities/socratic-akrasia-denial-detail/verification.md) |
| [eastern-vs-western-moral-philosophy](./.claude/skills/humanities/eastern-vs-western-moral-philosophy/SKILL.md) | 동·서양 도덕철학 비교 (akrasia ↔ 유교) — 自省·克己·愼獨·誠意正心, 朱子 居敬窮理(1차 출처는 *朱子語類*·*朱子文集*, *性理大全*은 1415년 명대 호광 편찬), 王陽明 知行合一(소크라테스 주지주의와 비교), 退溪·栗谷, Tu Weiming(SUNY 1985)·Roger Ames·Hall & Ames, akrasia↔유교 비교표, 단순 등치 회피 원칙 | [→](./docs/skills/humanities/eastern-vs-western-moral-philosophy/verification.md) |
| [aristotle-nicomachean-ethics-vii-detail](./.claude/skills/humanities/aristotle-nicomachean-ethics-vii-detail/SKILL.md) | NE VII권 절별 정밀 독해 — Bywater OCT 1894 기준, akrasia 핵심 구간 9개(1145a15-1150b29) Bekker 매핑, 술 취한 자 비유 1147a10-24·결론 정형구 1147b13-17 분리, NE=EE 공통권 문헌학(Kenny 1978·Cooper 1975·Rowe 1971), Aspasius 2C → Aquinas 13C → Heliodorus 14C → Stewart 1892 시대순 정정, 4 핵심 난제(두 전제 결합·술 취한 자·phronēsis 보유·haplos vs kata meros), Davidson 1969/Charles 1984/Mele 1987/Cooper 1989 SJP 출판 정보 정확, 한국어 번역본 비교(강상진 외 길 2011 표준판). fact-checker 추가 정정 3건 반영(1145a17→1145a15-17, 1145a35→1145a19-20, 1147a24-b5→1147a10-24) | [→](./docs/skills/humanities/aristotle-nicomachean-ethics-vii-detail/verification.md) |
| [aristotle-akrasia-vs-akolasia-distinction](./.claude/skills/humanities/aristotle-akrasia-vs-akolasia-distinction/SKILL.md) | akrasia(자제력 없음) vs akolasia(무절제) 정밀 구분 — NE VII.4(1147b20-1148b14) + III.10-12(1117b23-1119b18) 절별 분해, 5축 차이(prohairesis 핵심 명제 1151a5-8·hexis·회복 가능성 ἰατός/ἀνίατος·수치심 μεταμελητικός/ἀμεταμέλητος·logos), 핵심 그리스어 어휘(akolasia ἀ+κολάζω 어원), Bostock 2000·Broadie & Rowe 2002·Pakaluk 2005·Hursthouse 1999·Charles 1984 학자별 해석, 도덕교육 함의 차이(akrates 회복 가능 vs akolastos 가치관 재형성). fact-checker 정정 3건 반영(1151a5-8 핵심 명제 분리, VII.7-8 챕터 경계 1150b30, akolasia III.10 1117b23 도입) | [→](./docs/skills/humanities/aristotle-akrasia-vs-akolasia-distinction/verification.md) |

---

### research (학술)

| 스킬 | 설명 | 검증 문서 |
|------|------|----------|
| [academic-databases-korean-humanities](./.claude/skills/research/academic-databases-korean-humanities/SKILL.md) | 한국 인문학 학술 DB 검색 전략 — KCI/RISS/DBpia/교보스콜라(국내) + PhilPapers/JSTOR/Project MUSE/Google Scholar(국제), 도덕윤리교육 핵심 학술지 7종, akrasia 검색 키워드, 학위논문 역추적, 6단계 워크플로우 | [→](./docs/skills/research/academic-databases-korean-humanities/verification.md) |
| [research-ethics-and-integrity](./.claude/skills/research/research-ethics-and-integrity/SKILL.md) | 대학원 연구윤리·인용 윤리 — 교육부 훈령 제449호(2023.7) 7대 부정행위, 표절·자기표절·학위논문↔KCI 전환, AI 활용 윤리(COPE/WAME/ICMJE/한국연구재단 2024.3), 카피킬러·Turnitin, IRB 3분류 (학생·교사 인터뷰 시나리오) | [→](./docs/skills/research/research-ethics-and-integrity/verification.md) |
| [systematic-literature-review](./.claude/skills/research/systematic-literature-review/SKILL.md) | 체계적 문헌 검토(SLR) 인문학 적용 — PRISMA 2020 27항목 + 인문학 변형(부록 A), SPIDER/SPICE 프레임(PICO 대체), CASP 질 평가, Webster & Watson concept-centric, Thomas-Harden thematic synthesis, akrasia 검색 식 예시 | [→](./docs/skills/research/systematic-literature-review/verification.md) |
| [case-study-methodology](./.claude/skills/research/case-study-methodology/SKILL.md) | 도덕교육 사례연구 방법론 — Yin 6판(SAGE 2018)·Stake 1995·Merriam & Tisdell 4판(2016 제목 변경: *Qualitative Research*), 본질적·도구적·집합적 사례, Kvale 7단계 인터뷰·Spradley 참여 관찰·Braun & Clarke 6단계 thematic analysis, Lincoln & Guba 1985 4기준(credibility·transferability·dependability·confirmability), IRB 미성년자 consent + assent | [→](./docs/skills/research/case-study-methodology/verification.md) |

---

### writing

| 스킬 | 설명 | 검증 문서 |
|------|------|----------|
| [academic-paper-structure-humanities](./.claude/skills/writing/academic-paper-structure-humanities/SKILL.md) | 인문학 논문 구조·인용 — 학부/석사/KCI 등재지 분량별 표준, 서론-선행연구-개념정리-논증-반론-결론 흐름, 한국 인문학 각주(『』「」)·Chicago notes-bibliography, 학술지별 투고규정 우선 원칙 | [→](./docs/skills/writing/academic-paper-structure-humanities/verification.md) |
| [thesis-structure-graduate](./.claude/skills/writing/thesis-structure-graduate/SKILL.md) | 한국 대학원 학위논문 구조·심사 — 석사(80~150쪽)/박사(200~400쪽), proposal→중간발표→예비심사→본심사 절차, 표준 5장 구조, point-by-point revision response 작성법, dCollection·자기표절 회피, 도덕윤리교육 분야 특수 사항 | [→](./docs/skills/writing/thesis-structure-graduate/verification.md) |
| [citation-style-international](./.claude/skills/writing/citation-style-international/SKILL.md) | 국제 학술 인용 스타일 + 인용관리 도구 — APA 7판/MLA 9판/Chicago 17판(NB+Author-Date) 비교, Chicago 18판(2024-09) 출시 안내, Bekker(Aristotle)·Stephanus(Plato) 스타일별 표기, Zotero 7/Mendeley/EndNote 2025/BibTeX, CSL 1.0.2 한국 KCI 등재지 검색 | [→](./docs/skills/writing/citation-style-international/verification.md) |
| [journal-submission-response](./.claude/skills/writing/journal-submission-response/SKILL.md) | 학술지 투고·심사·revision 응답 — Predatory journal 회피(Think Check Submit·DOAJ·Cabells), Cover letter(영문 4단락+KCI), 4단계 심사 결과(영문)+KCI 4단계, point-by-point response letter 5대 원칙, 이견 표명 표현(영문·한국어), Journal of Moral Education·Ethics and Education 안내 | [→](./docs/skills/writing/journal-submission-response/verification.md) |
| [abstract-and-keywords-writing](./.claude/skills/writing/abstract-and-keywords-writing/SKILL.md) | 학술 논문 초록·키워드 작성 + ASEO 검색 노출 — 구조화/비구조화 초록, 분량 표(KCI 600-1000자/APA 150-250단어/Springer 200/Elsevier 250), 인문학 5요소(문제·위치·논증·결론·기여), 시제·hedging·미래시제 회피, 광범위 키워드 회피(윤리학·교육), 한·영·동의어·이형 키워드, KCI/PhilPapers/JSTOR/ERIC 노출 최적화 | [→](./docs/skills/writing/abstract-and-keywords-writing/verification.md) |
| [academic-english-writing-humanities](./.claude/skills/writing/academic-english-writing-humanities/SKILL.md) | 인문학 영문 학술 논문 작성 — Manchester Academic Phrasebank 기반, literary present tense(1차 텍스트), hedging 강도 표(may/might/could), signposting(However/Furthermore/Therefore), 한국어 화자 흔한 실수(article·"However, but"·번역투), Bekker·고전 인용 영어 표현, "data is/are" plural 권장 정정 | [→](./docs/skills/writing/academic-english-writing-humanities/verification.md) |
| [conclusion-writing-strategies](./.claude/skills/writing/conclusion-writing-strategies/SKILL.md) | 결론 챕터 작성 전략 — 4대 구성(요약·발견·기여·한계+후속), 학술적 기여 4유형(이론·방법론·실증·실천), 한계 학술적 절제(방어적·자기비하 회피), 후속 연구 구체화("더 연구 필요" 회피), 폐회 진술 박사 논문, 새 주장 도입 금지·본문 단순 반복 회피 | [→](./docs/skills/writing/conclusion-writing-strategies/verification.md) |
| [dissertation-defense-prep](./.claude/skills/writing/dissertation-defense-prep/SKILL.md) | 박사학위 디펜스 준비 — 한국(서울대 5인/4) vs 미국(Penn State) vs 영국(viva voce) 비교, PPT 30-40매 표준 구성, PREP 답변 기법(Point-Reason-Example-Point), "잘 모르겠습니다" 정직 표현법, point-by-point 수정 응답서, 4-7-8 호흡법 심리 준비, 1주·1일·당일 체크리스트 | [→](./docs/skills/writing/dissertation-defense-prep/verification.md) |
| [research-proposal-humanities](./.claude/skills/writing/research-proposal-humanities/SKILL.md) | 인문학 연구계획서 작성 가이드 — 큰 주제→RQ 좁히기 5단계(Booth 5판 2024 University of Chicago Press 기반), 한국 인문학 학위논문 표준 8섹션(연구 배경·필요성·선행연구·RQ·이론적 틀·연구방법·범위·일정·기여), 한국 vs 미국 dissertation proposal 8항목 비교표, 인문학 RQ 5유형(개념분석·사상사·비교철학·적용·비판), Booth 6항목 + 한국 추가 2항목 체크리스트, IRB 인간대상연구 판정표(학생·교사 인터뷰 시), 1쪽 요약 vs 본 계획서 분리, akrasia 박사논문 끝까지 적용 모델 케이스 | [→](./docs/skills/writing/research-proposal-humanities/verification.md) |
| [introduction-writing-humanities](./.claude/skills/writing/introduction-writing-humanities/SKILL.md) | 인문학 학위논문·KCI 서론 작성 — 5요소(문제제기·선행연구 위치·RQ·방법·구성), CARS 모델(Swales 1990 *Genre Analysis* CUP, 2004 *Research Genres* CUP) Move 매핑, IMRaD vs 인문학 전통(KCI) 비교 7항목, Relevance 정당화 4가지 접근(이론적 공백·시대 적실성·해석 갈등·텍스트 재검토), Hyland 2000 Longman 초판/2004 Michigan Classics, 1인칭(KCI "본 연구는"/영문지 "I argue") 분기, 흔한 함정 5가지(사전적 정의·일반화·선행연구 부재·제목 반복·결론 누설), akrasia 첫 단락 좋은 예/나쁜 예 비교 | [→](./docs/skills/writing/introduction-writing-humanities/verification.md) |
| [academic-korean-style](./.claude/skills/writing/academic-korean-style/SKILL.md) | 한국어 학술 글쓰기 스타일 — 국립국어원 어문 규범 + KCI 등재지 편집 기준, 피동·번역투 회피 6패턴(이중피동/by 직역/have 직역/명사화/about/시키다), 영문→한국어 번역 함정 10가지, 문어체·학술체·구어체 구분, 학계 합의 표현 사전(서론·선행연구·본론·결론), 인용 도입 동사 매트릭스(주장/논의/제안/비판/강조 등 10개), 시제 규약(선행연구 현재형·본 연구 과거형·결론 현재형), 자기 지칭(본 연구·필자·본고) ★권장도, 도덕윤리교육 KCI 3대 학회(도덕윤리과교육·교육철학·윤리) 가이드 | [→](./docs/skills/writing/academic-korean-style/verification.md) |
| [plagiarism-prevention-workflow](./.claude/skills/writing/plagiarism-prevention-workflow/SKILL.md) | 카피킬러·Turnitin·iThenticate 사전 점검 통과 워크플로우 — 정직한 학술 글쓰기 절차, 6어절(국문)/8단어(영문) 검사 원리, 학교·학술지별 임계값(5~20%), 직접인용 정확 표기(큰따옴표+페이지+Bekker), 간접인용 자가 점검 5단계(Howard 1995 *College English* 57.7:788-806 patchwriting 정의), 자기표절 4경로 표기, COPE 2023(Position Statement)/WAME 2023.05/ICMJE 2024.01/한국연구재단 2025.09.17 개정판 AI 활용 표기, Acknowledgments 한·영 예시(도구·버전·시기·범위·책임 5요소), 의심 구간 재집필 워크플로우(동의어 치환·AI 회피 명시 금지) | [→](./docs/skills/writing/plagiarism-prevention-workflow/verification.md) |

---

### education

| 스킬 | 설명 | 검증 문서 |
|------|------|----------|
| [moral-education-curriculum-link](./.claude/skills/education/moral-education-curriculum-link/SKILL.md) | 2022 개정 도덕과 교육과정 ↔ akrasia 연결 프레임 — 교육부 고시 제2022-33호 기반 4대 영역·3범주·교과역량·성취기준 코드, akrasia 4축(인지-정의-행동 통합/hexis/자기조절·메타인지/콜버그 비판) | [→](./docs/skills/education/moral-education-curriculum-link/verification.md) |
| [moral-curriculum-2022-achievement-standards](./.claude/skills/education/moral-curriculum-2022-achievement-standards/SKILL.md) | 2022 개정 도덕과 성취기준 전문(全文) 부록 — ✓ 검증 8건(4도01-01~04, 6도01-01~03, 9도01-01)은 학위논문 직접 인용 가능, 나머지는 [NCIC 원문 직접 확인 필요] 표기로 추측 차단. akrasia 활용도 높은 자신과의 관계 영역 강조, 학위논문 인용 형식 예시 + 2015 vs 2022 혼동 방지 | [→](./docs/skills/education/moral-curriculum-2022-achievement-standards/verification.md) |
| [moral-education-pedagogy-models](./.claude/skills/education/moral-education-pedagogy-models/SKILL.md) | 도덕교육 교수학습 모델 카탈로그 — Kohlberg JusCom·Gilligan 배려윤리·Lickona 인격교육(11원리·앎·감정·행동 통합)·Noddings *Caring*·Values Clarification·Blatt-Kohlberg·Constructive Controversy·Rest 4-component·Narvaez Triune·Kristjánsson Aristotelian Character(Jubilee Centre)·Turiel 영역이론, 추병완·박병기 KCI 검증, akrasia↔모델 매핑표 + 2022 개정 도덕과 3범주 매핑 | [→](./docs/skills/education/moral-education-pedagogy-models/verification.md) |
| [moral-education-self-control-modern-issues](./.claude/skills/education/moral-education-self-control-modern-issues/SKILL.md) | 현대 도덕교육 자제력 교육 필요성 — 한국 2024 통계(스마트폰 과의존 42.6%·학교폭력 2024 1차·ADHD 4년 314% 증가), 도덕심리학 재현성 위기 명시(Baumeister 2010 *Psych Bulletin* → Hagger 2016 *PPS* 23 labs N=2141 d=0.04 재현 실패 / Mischel 1989 → Watts 2018 *Psych Sci* SES 통제 후 2/3 감소 / Duckworth 2007 *JPSP* → Credé 2017 *JPSP* jangle fallacy r≈.84), Kahneman·Greene·Haidt dual-process, akrasia↔자제력 7축 매핑(차이점 명시), 학술적 정당화 4유형, Hursthouse 1999 *OVE* "유비로 활용·동일시 회피" 모델 적용, grit의 도덕교육 제한적 활용 처방 4항목 | [→](./docs/skills/education/moral-education-self-control-modern-issues/verification.md) |
| [akrasia-classroom-application-guide](./.claude/skills/education/akrasia-classroom-application-guide/SKILL.md) | akrasia 이론 학교 도덕교육 적용 실무 — 2022 개정 도덕과 「자신과의 관계」 영역 매핑(초·중·고), 4단계 차시 지도안 패턴(도입·전개1·전개2·정리), 학생 활동 5종(사례 분석·자기 성찰 일지·습관 일지 cue-routine-reward·역할극·JusCom 토론), 5종 평가 매트릭스(수행·자기·동료·메타인지·누적) × 인지·정의·행동 3범주, 도덕교육 8모형 결합(Kohlberg·Lickona·Kristjánsson Jubilee Centre·Noddings·Rest·Narvaez 등), 학년별 어휘 변환표(초등 "두 목소리" → 중등 "자제력 부족" → 고등 akrasia 음역), 중학교 1학년 4차시 지도안 예시, 학생 안전(수치심 노출·낙인 효과)·평가 공정성 주의사항. fact-checker 정정 2건 반영(Kristjánsson 2015 London·Lickona 1996 단독 저자 정정) | [→](./docs/skills/education/akrasia-classroom-application-guide/verification.md) |

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
| [drift-monitor](./.claude/hooks/drift-monitor.js) | PostToolUse Write\|Edit | `.claude/spec.md`(또는 `SPEC.md`) 존재 시 작업 중 spec 이탈 자동 감지 — 범위 외 파일 변경, 금지 패턴 포함, 10분 내 동일 파일 5회 이상 반복 수정. 차단 아닌 경고만 (의도된 변경이면 무시 가능). Ouroboros Agent OS 컨셉 한국화 |

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
프로젝트 경로를 입력하세요: ./my-project

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
| 2026-05-14 | **프론트엔드 성능 벤치마킹 인프라 — 스킬 5종 + 에이전트 2종 추가** (creation-workflow.md 5단계 풀세트 준수, 모두 skill-tester content test 3/3 PASS): ① **frontend/build-perf-benchmarking** (hyperfine 1.20.0 빌드 시간 벤치마킹 — `--warmup`/`--prepare`/`--runs`/`--export-markdown`/`--export-json` 핵심 옵션, cold(`rm -rf node_modules/.vite`·`.turbo/cache` `--force`) vs warm 분리, median 권장 + p95 JSON 후처리(hyperfine 기본 출력 미포함), 혼동변수(CPU·디스크 캐시·thermal throttling) 명시, `--prepare`/`--warmup` 정반대 의미 주의 — 20 클레임 전수 VERIFIED, status PENDING_TEST 실 빌드 결과 검증 필요) ② **frontend/bundle-size-analysis** (raw/gzip/brotli 청크 비교 — rollup-plugin-visualizer 7.0.1(`gzipSize`/`brotliSize` 기본 false·7+종 템플릿 treemap/sunburst/network/raw-data/list/flamegraph) + vite-bundle-visualizer 1.2.1(템플릿 5종) + webpack-bundle-analyzer(stat·parsed·gzip 3종, `defaultSizes` `parsed`·zstd 추가) + size-limit 12.1.0 + andresz1/size-limit-action@v1 CI 임계치, 7가지 함정 — 12 클레임 전수 VERIFIED, status PENDING_TEST) ③ **frontend/dev-server-hmr-benchmarking** (dev cold start + HMR 지연 — Vite `import.meta.hot.on('vite:beforeUpdate'/'vite:afterUpdate'/'vite:beforeFullReload'/'vite:beforePrune'/'vite:invalidate'/'vite:error'/'vite:ws:disconnect'/'vite:ws:connect')` 8종 + `performance.now()` 차이로 latency·`Date.now() - payload.updates[0].timestamp`로 서버 감지 구간, webpack-dev-server v4+ HMR 기본 활성화 + `stats.timings: true`, Chrome DevTools Performance Capture settings(Network/CPU throttling·Screenshots·Memory·Disable JS samples) + Record and reload(about:blank), hyperfine `--prepare 'rm -rf node_modules/.vite'`, WSL2 `/mnt/c/` inotify 미동작·chokidar 폴링·macOS FSEvents 128 워처 제한 — 9 클레임 전수 VERIFIED, status PENDING_TEST) ④ **frontend/lighthouse-ci-setup** (LHCI + Core Web Vitals 회귀 감지 — `@lhci/cli@0.15.1` collect/assert/upload + `lighthouserc.json` numberOfRuns 3+ 권장·startServerCommand·preset 3종·aggregationMethod 4종 + assertion `[level, options]` 문법·categories:performance·error/warn 레벨 구분, CWV threshold(LCP 2.5s·INP 200ms·CLS 0.1 — 2024-03 FID→INP 교체, TBT good ≤ 200ms 모바일), Lighthouse 가중치 TBT 30/LCP 25/CLS 25/FCP 10/SI 10(TTI는 v10+ 가중치 0), treosh/lighthouse-ci-action@v12.6.2(2026-03-12) + LHCI Server/temporary-public-storage 3종, temporary-public-storage 공개성 주의, variance 큰 metric numberOfRuns 3+·CI 머신 사양 차이·throttlingMethod simulate 함정 — 15 클레임 전수 VERIFIED, status PENDING_TEST 실 CI 워크플로우 검증) ⑤ **frontend/web-vitals-rum-comparison** (RUM 실사용자 CWV 추출·배포 전후 비교 — `web-vitals` v5 onLCP/onINP/onCLS + visibilitychange 페이지 hidden 확정·`reportAllChanges`, Sentry `browserTracingIntegration({enableInp})` 8.x+ 기본 true + `release`/`window.SENTRY_RELEASE.id` + Discover `p75(measurements.inp)` + `release:[v1.2.0, v1.2.1]` 비교, Datadog `@datadog/browser-rum` v7.1.0(2026-03-16) + `@view.largest_contentful_paint` + RUM Explorer `@version:(A OR B)` Group by `@version` Measure p75 + INP는 v5.1.0+ 필요, 트래픽 분포·표본 크기·INP bfcache·background tab·privacy 모드·샘플링 곱셈·release 누락 8가지 함정 — 13 클레임 전수 VERIFIED, content test 3/3 PASS → status APPROVED, 실 RUM 데이터 검증은 사용자 운영 환경) ⑥ **validation/build-perf-benchmarker 에이전트** (빌드·번들·dev·Lighthouse 지표 측정 실행 전담 — 측정 4분기(빌드/번들/dev·HMR/Lighthouse) 참조 스킬별 분기, 표준 산출물 `./bench-results/{YYYY-MM-DD}/{kind}/` `summary.md`+`raw.json`+`cmd.txt`, p95 JSON 후처리, 1차 요약 출력 템플릿 고정, 에러 핸들링 6종, 금지 사항 4종(해석 혼입·원본 손실·동시 빌드·예상값), 해석·서사는 perf-report-writer에 위임 — sonnet, maxTurns 20, Bash/Read/Write) ⑦ **validation/perf-report-writer 에이전트** (측정 결과 → 이해관계자용 보고서 — 7섹션 표준(Executive Summary·환경 정보·측정 결과 median/p95/mean/stddev/IQR/CI95%/Δ/판정·혼동변수 통제/미통제·통계적 해석 CI95% 중첩·결론/권고·다음 단계), Web Vitals 한계값 WebSearch 검증 후 인용, Bash 미부여로 측정 재실행 구조적 차단, raw.json 미포함 값 작성 금지, 산출물 3종 누락 시 작성 중단 — sonnet, maxTurns 15, Read/Write/WebSearch). **누적 총계: 프론트엔드 스킬 48종(43→48), 에이전트 38종+2=40종(validation 9종)** |
| 2026-05-07 | **PWA 학습 앱 인프라 — 프론트엔드 스킬 3종 추가** (creation-workflow.md 5단계 준수): ① **frontend/web-speech-api-tts** (브라우저 내장 TTS — speechSynthesis + SpeechSynthesisUtterance, getVoices() 비동기 로딩 voiceschanged, 영어 voice 필터링·localService 우선, rate 0.1-10·pitch 0-2·volume 0-1, 7개 이벤트(start·end·pause·resume·error·mark·boundary), 큐 관리, iOS Safari 백그라운드 자동중단 + WebKit Bug 198277 + 대응 패턴 3종, 미지원 graceful degradation, React useSpeech 훅 TypeScript, 호환성 매트릭스 — MDN 공식 + W3C draft 교차 검증, status PENDING_TEST 실 PWA 환경 검증 후 APPROVED) ② **frontend/srs-spaced-repetition** (SM-2 + FSRS-5 양 알고리즘 정리 — SM-2: Wozniak 1990 공식 EF' = EF + (0.1 - (5-Q)*(0.08 + (5-Q)*0.02)) + min 1.3, Anki 4-button 변형 매핑, 50줄 직접 구현 / FSRS-5: DSR 모델, 19 trainable weights, forgetting curve r = exp(ln(0.9)*t/S), 4-rating Again=1·Hard=2·Good=3·Easy=4, 카드 상태 4종 New/Learning/Review/Relearning, ts-fsrs 라이브러리 권장 / 비교표 9항목 + 2버튼·3버튼 ↔ 4-rating 매핑 + 단조 증가 unit test + 시계 변경 방어 safeReview — SuperMemo 공식 + Anki FAQ + open-spaced-repetition GitHub 교차 검증, 셀프 content test 3/3 PASS → status APPROVED) ③ **frontend/indexeddb-dexie** (Dexie 4.4.2 + dexie-react-hooks 4.2.0 — 스키마 db.version().stores() + 인덱스 표기법 5종(++id·&unique·일반·*multi-entry·[a+b] compound) + .upgrade(trans => modify) 마이그레이션 + 트랜잭션 모드 r/rw/rw! + 외부 await 금지 + 쿼리 5종 패턴(where 비교/복합 인덱스/orderBy+limit/multi-entry/필터+인덱스) + useLiveQuery deps + 다중 탭 자동 동기화 + 차단 환경 감지 isIndexedDBAvailable + 폴백 MemoryStorage + PWA Persistent Storage requestPersistentStorage + 사용량 모니터링 estimate — Dexie 공식 문서 + npm 버전 교차 검증, status PENDING_TEST 실 마이그레이션 누적 검증 후 APPROVED) **누적 총계: 프론트엔드 스킬 43종 (이전 40 + 3)** |
| 2026-05-07 | **Ouroboros Agent OS 컨셉 한국화 — 자산 3종 추가**: ① **신규 스킬 1종** — meta/`ralph-loop` (명시적 종료 조건이 있는 자율 반복 루프 워크플로우 — 검증·테스트·다듬기 작업을 PASS 기준 충족까지 반복 실행. 4단계 구조[종료 조건 정의 → 실행 → 평가 → 수렴 판정] + 안전장치 4종[max_iterations 강제·convergence·timeout·user-interrupt] + 우리 프로젝트 적용 예시 3종[skill-tester 재시도·본문 다듬기·빌드 에러]. 워크플로우 카테고리 PENDING_TEST 유지 — 실 시나리오 2개 이상 정상 작동 후 APPROVED 전환). ② **신규 에이전트 1종** — research/`socratic-interviewer` (모호 요구→Seed 명세 변환 — 답을 주지 않고 질문으로 사용자 사유 정리. 5단계 명료도(L1~L5) 평가, 질문 4카테고리[목표·제약·결정사항·모호함], Seed 출력+다음 단계 추천. opus, maxTurns 25). ③ **신규 hook 1종** — `drift-monitor.js` (PostToolUse Write\|Edit — `.claude/spec.md`/`SPEC.md` 존재 시 작업 중 spec 이탈 자동 감지 — 범위 외 파일 변경·금지 패턴 포함·10분 내 동일 파일 5회 이상 반복 수정 경고. 차단 아닌 경고만, spec.md 없으면 silent pass). 모두 Ouroboros Agent OS 컨셉을 우리 프로젝트 컨벤션(memory feedback_no_static_paths.md/feedback_verification_md_rules.md)에 맞춰 한국화·재구성. **누적 총계: 에이전트 38종, 스킬 121종, hook 7종** |
| 2026-05-06 | **akrasia 석사학위논문 3·4·5장 핵심 자료 자산 3종 + 5단계 검증 풀세트 + 정정 5건**: ① **신규 스킬 3종** — humanities/`aristotle-akrasia-vs-akolasia-distinction` (논문 3장 학술 핵심 — NE VII.4 1147b20-1148b14 + III.10-12 1117b23-1119b18 절별 분해, 5축 차이 prohairesis·hexis·회복 가능성·수치심·logos, 핵심 그리스어 어휘 어원, Bostock 2000·Broadie & Rowe 2002·Pakaluk 2005·Hursthouse 1999·Charles 1984 학자별 해석, akrates 회복 가능 vs akolastos 가치관 재형성 도덕교육 함의 — 25 클레임 22 VERIFIED + 5건 자체 정정 + 3건 fact-checker 정정[1151a5-8 prohairesis 핵심 명제 / VII.7-8 챕터 경계 1150b30 / akolasia III.10 1117b23 도입]) · education/`moral-education-self-control-modern-issues` (논문 4장 — 한국 2024 통계 스마트폰 42.6%·학교폭력·ADHD 314% 증가, 도덕심리학 재현성 위기 1차+비판 페어 인용 Baumeister/Hagger 2016 23 labs d=0.04, Mischel/Watts 2018 SES 2/3 감소, Duckworth/Credé 2017 jangle fallacy r≈.84, akrasia↔자제력 7축 매핑+차이점 명시, Hursthouse 1999 *OVE* "유비로 활용·동일시 회피" 모델, grit 도덕교육 제한적 활용 4처방 — 16 클레임 14 VERIFIED + 1 정정[Credé 2017 학술지 *JPSP* 정정] + 1 UNVERIFIED) · education/`akrasia-classroom-application-guide` (논문 5장 — 2022 개정 도덕과 「자신과의 관계」 매핑, 4단계 차시 지도안 패턴, 학생 활동 5종 사례·성찰·습관·역할극·JusCom, 평가 매트릭스 5×3, 도덕교육 8모형 결합, 학년별 어휘 변환표, 중학교 4차시 지도안 예시, 학생 안전·평가 공정성 주의사항 — 13 VERIFIED + 2 정정[Kristjánsson 2015 London 출판지 / Lickona 1996 단독 저자 / Schaps·Lewis는 별도 CEP 보고서]). ② **5단계 검증 풀세트**: skill-creator 1차 자체 검증 + fact-checker 추가 교차검증(NE VII.4·III.10-12 5건 + 도덕심리학 재현성 5건 + 도덕교육 모형 5건 = 15 클레임, 5건 DISPUTED 즉시 정정) + skill-tester(A 3/3 PASS / B 1차 1 PASS+2 PARTIAL → NEEDS_REVISION → §3 박스 Hursthouse *OVE* 5장·9장 좋은 모델 이유 6요소 보강 + §2.1 Duckworth 행 grit 도덕교육 제한적 활용 4처방 보강 → 재테스트 3/3 PASS → APPROVED / C 3/3 PASS) + 통합 시나리오 12단계 워크플로우 PASS. ③ **사용자 정보 메모리 갱신**: 학사 철학과 + 교육학 **석사** 과정 확정, 그리스어 직독 가능, 지도교수 AI 부정적(`feedback_ai_disclosure_advisor.md` — AI 사용 표기 금지·AI 출력 본문 직접 사용 절대 금지·자료 정리 단계 후 사용자 100% 재집필 모드), 6장 목차 확정(1 개관/2 종류/3 차이[학술 핵심]/4 현대 필요성/5 학교 적용/6 2022 교육과정). **누적 총계: 카테고리 4개, 에이전트 10종, 스킬 33종(humanities 12+research 4+writing 12+education 5), 검증 38건, 보강 51건 — akrasia 석사논문 6장 본문 작성 인프라 완비** |
| 2026-05-05 | **akrasia 학위논문 작성 인프라 보강 — 자산 6종 + 검증 5단계 + 정정 8건**: ① **신규 스킬 5종** — writing/`research-proposal-humanities` (Booth 5판 2024 UCP 기반 RQ 좁히기 5단계, 한국 vs 미국 dissertation proposal 8항목 비교, 인문학 RQ 5유형, IRB 인간대상연구 판정표, akrasia 박사논문 모델 케이스 — 13 클레임 12 VERIFIED + 1 정정[Booth 4판 2024→5판 2024 출판 사실 정정]) · writing/`introduction-writing-humanities` (Swales CARS 1990/2004 CUP, IMRaD vs KCI 7항목 비교, Relevance 4접근, Hyland 2000 Longman 초판/2004 Michigan Classics, 함정 5가지, akrasia 첫 단락 좋은 예/나쁜 예 — 10 클레임 8 VERIFIED + 2 UNVERIFIED 명시) · writing/`academic-korean-style` (국립국어원 어문 규범, 피동·번역투 회피 6패턴, 영문→한국어 함정 10, 문어체·학술체·구어체 구분, 학계 합의 표현 사전, 인용 도입 동사 매트릭스, 시제 규약, 자기 지칭 권장도 — 14 클레임 12 VERIFIED + 1 UNVERIFIED + 1 DISPUTED 처리) · writing/`plagiarism-prevention-workflow` (카피킬러 6어절·Turnitin 8단어·iThenticate 동일엔진, Howard 1995 *College English* 57.7:788-806 patchwriting 정의, 자가 점검 5단계, 자기표절 4경로, COPE 2023/WAME 2023.05/ICMJE 2024.01/한국연구재단 2025.09.17 AI 활용 표기, Acknowledgments 한·영 예시, 동의어 치환·AI 회피 명시 금지 — 23 클레임 21 VERIFIED + 1 PARTIAL + 1 UNVERIFIED) · humanities/`aristotle-nicomachean-ethics-vii-detail` (NE VII 절별 정밀 독해, Bywater OCT 1894 기준, akrasia 핵심 9구간 1145a15-1150b29, NE=EE 공통권 문헌학 Kenny 1978·Cooper 1975·Rowe 1971, 주석서 시대순 Aspasius 2C→Aquinas 13C→Heliodorus 14C, 4 핵심 난제, Davidson 1969/Charles 1984/Mele 1987/Cooper 1989 SJP, 강상진 외 길 2011 표준판 — 28 VERIFIED + 3 정정[Walzer-Mingay=EE OCT/Heliodorus 14C/Cooper 1973→1975/Cooper 1996→1989]). ② **신규 에이전트 1종** — research/`research-proposal-coach` (큰 주제→RQ 5-8개 생성, 5항목 평가표 25점, 추천/비추천, 1쪽 요약 가제목 한·영, 후속 질문 3개, RQ 5유형 분포 보장, 본문 집필 거부·"참고자료" 표기 윤리 강제 — opus, maxTurns 25, Read/WebSearch). ③ **5단계 검증 풀세트**: skill-creator 1차 자체 검증 + fact-checker 추가 교차검증 3건(NE VII Bekker 5건/윤리 가이드 5건/서론 모델 4건 = 14 클레임 중 7 DISPUTED 즉시 정정) + skill-tester 5종 모두 3/3 PASS → APPROVED 전환(research-proposal-humanities·introduction-writing-humanities·academic-korean-style·aristotle-NE-VII-detail·plagiarism-prevention-workflow) + research-proposal-coach 모의 시나리오 PASS(akrasia 박사 1년차 가상 입력 8/8 항목 사양 일치) + 통합 시나리오 PASS(12단계 워크플로우 매핑, 충돌 2/중복 2/갭 2 식별·해소). ④ **fact-checker 추가 정정 7건** (박사논문 직접 인용 결정적): a) ἀκρασία 첫 등장 1145a17 → **1145a15-17** 범위 (SEP/BMCR 교차) b) ἐγκράτεια 첫 등장 1145a35 → **1145a19-20** (akrasia 직후 짝 술어) c) 술 취한 자 비유 본체 1147a24-b5 → **1147a10-24** (Gosling 1993 *Phronesis* 38.1) d) Howard 1995 페이지 708-736 → **788-806** (NCTE 공식) e) Hyland *Disciplinary Discourses* 2004 단일 → **2000 Longman 초판 / 2004 Michigan Classics 재출판** f) (skill-creator 자체 정정) Booth 4판 2024 → **5판 2024-06-25** g) (skill-creator 자체 정정) COPE "2024 가이드" → **2023-02-13 Position Statement**. ⑤ **메모리 critical 규칙(학부생 가정 절대 금지) 위반 6스킬 정정**: aristotle-primary-citation, akrasia-scholarship-map, academic-databases-korean-humanities, academic-paper-structure-humanities, aristotelian-virtue-ethics-detail에서 "학부생" → "대학원생(석/박사)"로 일괄 정정 + aristotelian-virtue-ethics-detail의 미존재 자매 스킬 참조(`akrasia-research`) → `aristotle-nicomachean-ethics-vii-detail`로 갱신. **누적 총계: 카테고리 4개(humanities·research·writing·education), 에이전트 10종, 스킬 30종(humanities 11+research 4+writing 12+education 3), 검증 33건, 보강 47건 — akrasia 박사논문 작성·KCI 투고·심사 대비 인프라 완비** |
| 2026-05-03 | **인문학·도덕윤리교육 논문 작업 지원 자산 8종 추가** — 도덕윤리교육 전공 대학원생(석/박사)의 아리스토텔레스 akrasia 주제 학위논문·KCI 학술지 작업을 위한 신규 카테고리 4종(humanities·research(학술)·writing·education)과 자산 8개. **에이전트 3종**: ① research/`academic-researcher` (deep-researcher의 학술 변형, 1차 텍스트/2차 학술 문헌/현대적 응용 3축 + source-validator·fact-checker·research-reviewer 3단 검증, 한국 인문학 인용 형식 출력, opus, maxTurns 50) ② validation/`citation-checker` (본문 인용 ↔ 참고문헌 대조, Bekker 번호·페이지·연도·저자명 일관성 + WorldCat/PhilPapers/Perseus/Crossref 외부 검증, sonnet, Edit/Write 미부여) ③ validation/`argument-reviewer` (전제·결론 매핑, 5항목 평가, 비형식 오류 탐지, STRONG/NEEDS_STRENGTHENING/MAJOR_REVISION 판정, sonnet, Read만). **스킬 5종**: ① humanities/`aristotle-primary-citation` (Bekker 번호 체계, 영역본 4종 + 그리스어 비평본 + 국역본 ISBN 검증, NE VII.1-10 akrasia 위치 매핑, 17개 클레임 VERIFIED 16/UNVERIFIED 1) ② humanities/`akrasia-scholarship-map` (소크라테스 vs 아리스토텔레스, 현대 분석철학 6명, 도덕심리학 4명, 박재주 2011 KCI 검증 1편, 20개 클레임 모두 VERIFIED, ego depletion·마시멜로 재현성 논란 주의 표기) ③ research/`academic-databases-korean-humanities` (KCI 동명 학술지 「철학연구」 발행기관 분리, 7개 학술지 sereId 직접 검증, akrasia 검색 키워드, 6단계 워크플로우, 14개 클레임 모두 VERIFIED) ④ writing/`academic-paper-structure-humanities` (한국 인문학 학술지별 인용 형식 차이 — 한국철학회 저자-연도-쪽수 vs 전통 ibid 방식, Chicago 17판 short note 권장, 8개 클레임 VERIFIED 7/DISPUTED 1) ⑤ education/`moral-education-curriculum-link` (교육부 고시 제2022-33호 4대 영역·3범주·성취기준 코드, akrasia 4축 프레임 — 인지-정의-행동 통합/hexis/자기조절·메타인지/콜버그 비판, 박장호 2009·박재주 2011 선행연구 검증). **2단계 실사용 테스트(skill-tester) 결과**: 4개 스킬 PASS → APPROVED 전환(`aristotle-primary-citation` 3/3, `akrasia-scholarship-map` 3/3, `academic-databases-korean-humanities` 2 PASS+1 PARTIAL → APPROVED + sereId 활용법 보강 권장, `academic-paper-structure-humanities` 3/3 + Chicago NB 편저 챕터 형식 보강 권장), `moral-education-curriculum-link`는 3/3 PASS이지만 실사용 필수 카테고리(교육과정 표기 인용 시 재검증 필요)로 PENDING_TEST 유지. 모든 verification.md 섹션 5·6·7·8 동기화 완료 / **에이전트 1종 추가** — research/`translation-comparison` (동일 1차 텍스트의 다국어·다역본 행 단위 비교 — Bekker·Stephanus 위치 입력, Perseus 그리스어 원문 추출, 행 단위 대조표 + 핵심 개념어 번역 차이표 + 학술적 인용 권고, 저작권 보호상 본문 발췌 최소화·번역본 우열 단정 금지 원칙, sonnet, maxTurns 20, Read/Write/WebSearch/WebFetch) / **대학원 수준 풀 보강 — 자산 9종 추가 + 검증 6건 + 보강 11건**: ① **신규 스킬 7종** — research/`research-ethics-and-integrity` (교육부 훈령 제449호 7대 부정행위, 자기표절·학위논문↔KCI 전환, AI 활용 윤리 COPE/WAME/한국연구재단 2024.3, IRB 3분류, VERIFIED 11/DISPUTED 3/UNVERIFIED 1) · research/`systematic-literature-review` (PRISMA 2020 27항목 + 인문학 변형, SPIDER/SPICE, CASP, concept-centric, 20개 클레임 모두 VERIFIED) · writing/`thesis-structure-graduate` (석/박사 학위논문 절차·구조·revision response, 14개 클레임 VERIFIED 12/UNVERIFIED 2) · writing/`citation-style-international` (APA 7/MLA 9/Chicago 17·18판 비교, Zotero 7/Mendeley/EndNote 2025/CSL, 18개 클레임 모두 VERIFIED) · writing/`journal-submission-response` (Predatory journal 회피, Cover letter, point-by-point revision letter, JME·E&E 안내, 20개 클레임 모두 VERIFIED) · humanities/`aristotle-greek-text-tools` (Perseus·LSJ·Smyth·TLG, akrasia 핵심 어휘 그리스어 분석, 21개 클레임 VERIFIED 20/UNVERIFIED 1) · humanities/`concept-analysis-methods` (분석철학 4단계+Quine/Wittgenstein 비판+개념공학+해석학+Skinner 사상사, akrasia 적용 가이드, 18개 클레임 VERIFIED 17). ② **신규 에이전트 1종** — research/`literature-review-synthesizer` (다수 2차 문헌 종합 → 연구사 표·학파 계보도 Mermaid·Concept Matrix·연구 갭 도출, opus, Read/Write/Grep/Glob). ③ **검증 6건**: fact-checker 7개 핵심 클레임 교차검증 (6 VERIFIED + 1 DISPUTED — NE VII 실천 추론 정확 범위는 학자별 1147a10-b13/1146b35-1147b13 등 다양 → aristotle-primary-citation·akrasia-scholarship-map 양쪽에 주의 표기 보강) / source-validator 외부 URL 신뢰도 평가 (나무위키 REJECT, Wikipedia·알라딘·교보문고·DBpia URL·PhilPapers rec CAUTION → 본문 인용 시 원 학술지 정보로 대체 권고) / academic-researcher·citation-checker·argument-reviewer 3종 동작 시뮬레이션 검증 → 모두 NEEDS_PROMPT_REVISION (경미) → 11건 보강 완료 / 5스킬 통합 시나리오 검증 (INTEGRATED_WITH_GAPS — 충돌 3·중복 3·갭 6 식별, 경미 충돌 3건 즉시 수정). ④ **에이전트 보강 11건**: academic-researcher 5건(주제 scope lock 강제, 단계별 Glob 강제, source-validator 부재 시 fact-checker 위임 강화, fact-checker fallback에 KCI 한정 쿼리, §3.2 빈 처리 규칙) · citation-checker 5건(고전 인용 보조 규칙, 본문 vs 각주 cross-check 단계 3-7, 공역·공저자 표기 단계 3-8, 스타일 가이드 메타 권고, 한국어 단행본·학회지 1차 확인 정책) · argument-reviewer 3건(비형식 오류 4종 추가-발생론적/red herring/시대착오/구성-분할, 결론 강도 vs 근거 강도 갭 별도 명시, 외부 사실 검증 한계 디스클레이머). ⑤ **충돌 수정 3건**: akrasia-scholarship-map 역자명 순서 통일(길 2011 표제지 기준 강상진·김재홍·이창우) + 학술 인용 표준판(길 2011) 명시 / 박재주(2011) 학회명(한국초등도덕교육학회) 명기 — akrasia-scholarship-map + moral-education-curriculum-link 양쪽. ⑥ **2단계 실사용 테스트**: 신규 7스킬 전부 PASS → APPROVED 전환(research-ethics-and-integrity 3/3, systematic-literature-review 3/3, thesis-structure-graduate 3/3, aristotle-greek-text-tools 2 PASS+1 PARTIAL, citation-style-international 1 PASS+2 PARTIAL [Zotero 7 메뉴 경로 보강 권장], journal-submission-response 3/3, concept-analysis-methods 3/3). 모든 verification.md 섹션 5·6·7·8 동기화 완료. **총계: 카테고리 4개 신설(humanities/research/writing/education), 에이전트 4종(academic-researcher·citation-checker·argument-reviewer·translation-comparison·literature-review-synthesizer), 스킬 12종, 검증 6건, 보강 14건** / **에이전트 1종 추가** — education/`curriculum-2022-fact-checker` (학위논문·학술지 원고에서 2022 개정 도덕과 교육과정 인용을 NCIC 원문과 자동 대조 — 6가지 검증 항목: ① 성취기준 코드 형식(`[6도01-01]` 등 정규식) ② 코드↔전문 매칭 ③ 영역명 정확성(자연·초월과의 관계 등 2015 잔재 검출) ④ 교과역량명 정확성 ⑤ 적용 시기 정확성(2024년 일괄 시행 오류 검출) ⑥ 2015 vs 2022 개정 혼동 검출(생활과 윤리·고전과 윤리 등). 의심 항목 한정 NCIC·교육부 외부 검증, PASS/NEEDS_REVISION 판정, 원고 직접 수정 금지(citation-checker 동일 정책), sonnet, maxTurns 20, Read/Grep/WebSearch/WebFetch). education/ 에이전트 카테고리 신설 / **선택 보강 + 추가 자산 — 자산 2종 + 검증 3건 + 보강 10건**: ① **신규 스킬 2종** — humanities/`aristotle-akrasia-translations-comparison` (akrasia 핵심 어휘 8종 번역어 비교표 — Ross/Irwin/Crisp/B&C 영역 + 강상진 외 길 2011 국역 검증, 천병희 숲 2013 [검증 필요], 본문 첫 등장 시 한·영·그리스어 3중 표기 권고, akrasia↔akolasia "무절제" 충돌 구분, 22 VERIFIED + 2 [검증 필요], skill-tester 3/3 PASS → APPROVED) · education/`moral-curriculum-2022-achievement-standards` (2022 개정 도덕과 성취기준 전문 부록 — ✓ 검증 8건 학위논문 직접 인용 가능 + 나머지 [NCIC 원문 직접 확인 필요] 표기로 추측 차단, akrasia 활용도 높은 자신과의 관계 영역 강조, 실사용 필수 카테고리 PENDING_TEST 유지). ② **신규 에이전트 1종** — education/`curriculum-2022-fact-checker` (2022 개정 도덕과 인용 NCIC 자동 검증, 6항목: 코드 형식·코드↔전문·영역명·교과역량·적용 시기·2015 혼동, sonnet, Read/Grep/WebSearch/WebFetch). ③ **A 보강 5건 (skill-tester 권고 반영)** — humanities/aristotle-greek-text-tools §1 Bekker URL 페이지 단위 한계 + §6 προπέτεια 어원 분해(πρό+πίπτω) / writing/citation-style-international Zotero 7 메뉴 경로 변경(Edit→**Settings**→Cite, 구버전 Preferences) / writing/thesis-structure-graduate 예비심사 실무 행동 가이드(구두 발표·발표자료·사전 배부·결과 처리) / research/academic-databases-korean-humanities KCI sereId/artiId URL 패턴 직접 활용법 + 동명 학술지 식별 방법. ④ **curriculum-2022-fact-checker 5건 보강 (general-purpose 동작 검증 결과 반영)** — 정규식 alternation에 2015 잔재 prefix(생윤·고윤·심윤) 분기 + 2-1→2-2 직렬화(형식 오류여도 전문 매칭 수행) / 2-3 영역명 판정 강도 표(자연·초월=치명적, 가운뎃점 누락=일관성) / 2-5 고시일(2022.12.22.) 인접 ±1 오기 검증 + 고시 번호 ±1 오기 / 출력 템플릿에 "수정안 미상(NCIC 직접 확인 필요)" 옵션. ⑤ **검증 3건**: B-1 moral-curriculum-2022-achievement-standards skill-tester 3/3 PASS (PENDING_TEST 유지) / B-2 curriculum-2022-fact-checker general-purpose 모의 검증 — 의도적 5개 오류 모두 5/5 검출 가능 (READY with minor enhancement) / B-3 aristotle-akrasia-translations-comparison skill-tester 3/3 PASS → APPROVED. ⑥ **메모리 업데이트**: 사용자 학술 정체성(`user_academic_role.md` — 도덕윤리교육 대학원생, 학부생 가정 금지) + 검증 강도 feedback(`feedback_verification_strictness.md` — 검증 단계 생략 금지). **누적 총계: 카테고리 4개(humanities·research·writing·education), 에이전트 6종(academic-researcher·citation-checker·argument-reviewer·translation-comparison·literature-review-synthesizer·curriculum-2022-fact-checker), 스킬 14종, 검증 9건, 보강 22건** / **P1+P2+P3 풀세트 — 자산 13종 + 검증 13건 + 보강 17건**: ① **신규 스킬 10종** — humanities/`korean-moral-education-thinkers` (한국 도덕교육 사상가 박은식~정인보~박종홍~김태길~윤사순~추병완~박병기~박재주~박장호 KCI 검증, 박장호 2009→박재주 2011→본 연구 직계 계보, 거시·중간·미시 3층위 서술, 박종홍 국민교육헌장 기초위원 26명 중 1인 정정) · humanities/`virtue-ethics-modern-revival` (Anscombe 1958 *Philosophy* 33권 기점, MacIntyre/Foot/Hursthouse/Slote/Annas/Nussbaum/Swanton, akrasia↔phronesis 결여 연결, 19 클레임 모두 VERIFIED) · humanities/`aristotelian-virtue-ethics-detail` (NE I-VI권 권별 핵심 + akrasia 매핑표, prohairesis(III)·phronesis(VI) 연결, hexis 1105b25 vs 1106a10 DISPUTED 병기) · humanities/`socratic-akrasia-denial-detail` (*프로타고라스* 외 *고르기아스*·*메논*·*국가*·*법률* 다수 대화편, 영혼 삼분설=플라톤이 소크라테스 변형, Vlastos vs Irwin 학파 다툼, NE VII.2 1145b21-28 비판) · humanities/`eastern-vs-western-moral-philosophy` (akrasia↔自省·克己·愼獨·朱子 居敬·王陽明 知行合一, *性理大全* 1415년 명대 호광 편찬 정정 — 주자 본인 저작 아님, Tu Weiming/Roger Ames 검증, 단순 등치·우열 단정 회피) · research/`case-study-methodology` (Yin 6판/Stake 1995/Merriam & Tisdell 4판 제목 변경 정정, Kvale·Spradley·Braun & Clarke·Lincoln & Guba 4기준, IRB consent+assent) · writing/`abstract-and-keywords-writing` (KCI 분량 DISPUTED, 인문학 5요소, ASEO 광범위 키워드 회피, 한·영 동의어 병기, AI 활용 윤리) · writing/`academic-english-writing-humanities` (Manchester Phrasebank, literary present tense, hedging 강도 표, 한국어 화자 흔한 실수, "data is/are" plural 정정) · writing/`conclusion-writing-strategies` (4대 구성, 학술적 기여 4유형, 한계 학술적 절제, 후속 연구 구체화, 폐회 진술 박사 한정) · writing/`dissertation-defense-prep` (한국·미국·영국 디펜스 비교, PPT 30-40매, PREP 답변 기법, "잘 모르겠습니다" 정직 표현, 4-7-8 호흡법). ② **신규 에이전트 3종** — research/`defense-question-simulator` (학위논문 → 심사 질문 12-15개 + 6요소 + 약점 3개 + 함정 회피 스크립트, 7카테고리, 심사위원 톤 4유형, 텍스트 범위 정당화 강제, 영문 학위논문 처리, 해석학·사상사 방법론 특화, opus, Read만) · validation/`abstract-reviewer` (초록·키워드 6항목 평가, 인문학 5요소, 학술지별 양식, 미래시제 정량 임계값, 학술지 기본값 결정 트리, 치명적 vs 권장 분류 매트릭스, sonnet, Read/WebSearch/WebFetch) · validation/`peer-review-simulator` (KCI/JME/E&E 학술지별 모드 자동 감지, 5관점 평가, Accept/Minor/Major/Reject 판정, General/Major/Minor Comments + Strengths, 자매 에이전트 결과 통합 절차, 분량별 코멘트 가이드, 인신공격 금지·강점 명시 공정성, opus, Read만). ③ **검증 13건**: skill-tester 10스킬 전부 PASS → APPROVED 전환 (korean-moral-education-thinkers 3/3, virtue-ethics-modern-revival 2 PASS+1 PARTIAL, abstract-and-keywords-writing 2 PASS+1 PARTIAL, aristotelian-virtue-ethics-detail 2 PASS+1 PARTIAL, academic-english-writing-humanities 3/3, case-study-methodology 3/3, socratic-akrasia-denial-detail 3/3, conclusion-writing-strategies 3/3, dissertation-defense-prep 3/3, eastern-vs-western-moral-philosophy 3/3) + 에이전트 3종 동작 검증 (defense-question-simulator·abstract-reviewer·peer-review-simulator 모두 NEEDS_PROMPT_REVISION → 17건 보강 완료). ④ **에이전트 17건 보강** (general-purpose 동작 검증 결과 반영): defense-question-simulator 6건(텍스트 범위 정당화 강제, 약점 본문 인용 강제, 질문 수 상한 강제, 인용 위치 fallback, 영문 학위논문 처리, 해석학·사상사 방법론 특화) · abstract-reviewer 6건(논문 제목 입력 추가, 학술지·언어 기본값 결정 트리, 분량 측정 단위 다중 출력, 미래시제 정량 임계값, "기여" 진술 구체성 룰브릭, 치명적 vs 권장 분류 매트릭스) · peer-review-simulator 5건(KCI ↔ 영문 자동 감지 규칙, 자매 에이전트 결과 통합 절차, 원고 분량별 코멘트 가이드, 학술지별 인용 양식 매핑, 50쪽 이상 처리). 모든 verification.md 섹션 5·6·7·8 동기화 완료. **최종 누적 총계: 카테고리 4개, 에이전트 9종, 스킬 24종, 검증 22건, 보강 39건 — 매우 훌륭한 대학원 도덕윤리교육 akrasia 학위논문 작성 인프라 완비** |
| 2026-04-29 | 시각 회귀 테스트 스킬 2종 추가 — `frontend/storybook-visual-testing` (Storybook 10 + @storybook/test-runner + Playwright `toHaveScreenshot` 자체 호스팅, preVisit/postVisit 훅·axe-playwright·iframe 캡처·baseline Docker 강제·모노레포 멀티 Storybook), `devops/github-actions-visual-regression` (paths-filter 트리거·start-server-and-test·baseline 캐시·PR 코멘트 자동화·matrix·pull_request_target 보안 anti-pattern). 외부 SaaS(Chromatic·Percy) 의존 없는 자체 호스팅 패턴. 양쪽 모두 2단계 에이전트 활용 테스트 3/3 PASS → APPROVED 전환 |
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
| 2026-04-20 | freshness-auditor 에이전트 추가 (에이전트·스킬 최신화 감사), typescript-v4·typescript-v5 스킬 추가 (TS 버전별 핵심 기능·tsconfig·마이그레이션), typescript 통합 스킬 제거 (v4·v5로 분리 대체), web-searcher MCP 도구 제거 (WebSearch/WebFetch 단순화), continuous-learning verification.md 보완, CRA → Vite 마이그레이션 관련 프론트엔드 스킬 4종 추가, animation 스킬 motion 12.x 기준 전면 재작성 (framer-motion → motion 마이그레이션·useScroll/useTransform/useSpring/useInView·LazyMotion), dayjs·storybook·swiper·react-dnd·tsup·mui-v5·react-virtuoso 프론트엔드 스킬 7종 추가 (공식 문서 WebSearch 기반 검증), CLAUDE.md 경량화 및 디렉토리별 CLAUDE.md 분리, bash-guard PostToolUse 훅 추가, session-summary 훅 추가, planner·build-error-resolver 에이전트 추가, rules/typescript·rust 언어별 코딩 규칙 분리, project-install.sh 추가 (다른 프로젝트에 Claude Code 컨벤션 이식) |
