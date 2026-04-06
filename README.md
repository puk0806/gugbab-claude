# 🤖 gugbab-claude

Claude Code를 효과적으로 활용하기 위한 **에이전트(Agent)**, **스킬(Skill)**, **설정(CLAUDE.md)** 모음입니다.

---

## 📁 프로젝트 구조

```
gugbab-claude/
├── README.md
├── CLAUDE.md                     ← 프로젝트 공통 규칙
├── docs/
│   ├── agents/                   ← 에이전트 상세 문서
│   ├── hooks/                    ← 훅 문서
│   │   └── permission-judge.md   ← 자동 허가 판단기 문서
│   └── skills/
│       ├── VERIFICATION_TEMPLATE.md   ← 스킬 검증 템플릿
│       └── frontend/             ← 프론트엔드 스킬 검증 문서
└── .claude/
    ├── agents/
    │   ├── meta/                 ← 에이전트 생성/관리
    │   ├── research/             ← 리서치
    │   ├── validation/           ← 검증
    │   └── frontend/             ← 프론트엔드 개발
    ├── hooks/
    │   ├── permission-judge.js   ← PreToolUse 자동 허가 판단기
    │   └── permission-judge.test.js
    ├── rules/                    ← 상황별 규칙
    ├── settings.json             ← 훅 등록 설정
    └── skills/
        └── frontend/             ← 프론트엔드 도메인 스킬
```

---

## 🧩 에이전트 목록

상세 문서: [docs/agents/](./docs/agents/)

### meta

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [agent-creator](./docs/agents/meta/agent-creator.md) | 새 에이전트 MD 파일 대화형 생성 | → |
| [skill-creator](./.claude/agents/meta/skill-creator.md) | 공식 문서 검증 후 스킬 SKILL.md 생성 | - |

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

---

## 📚 스킬 목록

상세 문서: [docs/skills/](./docs/skills/)

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
| [sass](./.claude/skills/frontend/sass/SKILL.md) | SCSS 핵심 패턴, CSS Modules + SCSS, 캡슐화 중심 스타일 설계 | - |
| [testing](./.claude/skills/frontend/testing/SKILL.md) | Jest/Vitest + React Testing Library, 동작 중심 테스트 전략 | - |
| [component-design](./.claude/skills/frontend/component-design/SKILL.md) | 캡슐화 원칙, Compound Component, Headless 패턴, 컴포넌트 API 설계 | - |
| [form-handling](./.claude/skills/frontend/form-handling/SKILL.md) | React Hook Form + Zod 유효성 검증, 재사용 필드 컴포넌트 | - |
| [api-integration](./.claude/skills/frontend/api-integration/SKILL.md) | API 클라이언트 캡슐화, TanStack Query 연동, 에러 핸들링 | - |
| [accessibility](./.claude/skills/frontend/accessibility/SKILL.md) | ARIA 패턴, 시맨틱 HTML, 키보드 네비게이션, a11y 테스트 | - |
| [animation](./.claude/skills/frontend/animation/SKILL.md) | Framer Motion 핵심 패턴, CSS transition/keyframe, 성능 고려 | - |
| [performance](./.claude/skills/frontend/performance/SKILL.md) | React Compiler 기준 메모이제이션, 코드 스플리팅, TanStack Virtual 가상화 | - |
| [error-handling](./.claude/skills/frontend/error-handling/SKILL.md) | Error Boundary, React 19 에러 콜백, TanStack Query 에러 처리, 에러 유형별 전략 | - |
| [design-patterns](./.claude/skills/frontend/design-patterns/SKILL.md) | Compound Component, Custom Hook, useSyncExternalStore, API 캡슐화, 전략 주입 | - |
| [seo](./.claude/skills/frontend/seo/SKILL.md) | Next.js 15 Metadata API, OpenGraph, JSON-LD, sitemap/robots | - |

---

## 🔒 훅 (Hooks)

| 훅 | 유형 | 설명 | 문서 |
|----|------|------|------|
| [permission-judge](./.claude/hooks/permission-judge.js) | PreToolUse + PermissionRequest | 안전한 도구(Write/Edit/Bash 등) 자동 승인, 위험 Bash 패턴 차단 | [→](./docs/hooks/permission-judge.md) |

---

## ⚡ Claude Code 빠른 참조

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

## 🔄 업데이트 로그

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-03-26 | 프로젝트 초기화 — `agent-creator` 추가, CLAUDE.md 작성, 커밋 컨벤션 분리 |
| 2026-03-27 | 리서치·검증 에이전트 5종 추가, 카테고리별 폴더 구조 도입, 상세 문서 분리 |
| 2026-03-27 | 프론트엔드 스킬 5종 추가 (react-core, nextjs, typescript, monorepo-turborepo, bundling-compiler), frontend-architect 에이전트 추가, 스킬 검증 템플릿 도입 |
| 2026-03-27 | 프론트엔드 스킬 2종 추가 (code-convention, state-management) |
| 2026-04-02 | permission-judge 훅 리팩터(block 전용), settings.json 권한 체계 개편, 프론트엔드 스킬 11종 추가(sass·testing·component-design·form-handling·api-integration·accessibility·animation·performance·error-handling·design-patterns·seo), skill-creator 에이전트 추가, 생성 검증 절차(creation-workflow.md) 분리, 기존 스킬 공식 문서 검증 및 오류 수정 |
| 2026-04-02 | permission-judge 훅 PermissionRequest 이벤트 추가 — 서브에이전트 파일 생성 시 allow 프롬프트 제거 (hook_event_name 필드명 버그 수정, Bash 자동 승인 추가) |