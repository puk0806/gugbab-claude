# ui-ux-designer

## 개요

- **역할**: product-planner의 PRD(화면 흐름, 구성 요소)를 받아 개발팀이 바로 구현할 수 있는 수준의 디자인 사양을 출력하는 UI/UX 설계 에이전트. 텍스트 기반 와이어프레임, 디자인 토큰 체계, 컴포넌트 스펙 시트, 사용자 플로우 다이어그램, 반응형 전략을 생성한다.
- **모델**: opus
- **도구**: Read, Write, Glob, Grep
- **카테고리**: domain

## 사용 시점

- PRD를 받아 개발 가능한 디자인 사양서로 변환할 때
- 디자인 토큰 체계(색상, 타이포그래피, 스페이싱)를 DTCG 표준으로 정의할 때
- 컴포넌트별 크기, 여백, 색상, 상태별 스타일을 스펙 시트로 작성할 때
- 사용자 플로우를 Mermaid 다이어그램으로 시각화할 때
- Mobile-First 반응형 breakpoint 전략을 수립할 때

## 사용 예시

- "이 PRD 보고 와이어프레임 만들어줘"
- "디자인 토큰 체계 잡아줘"
- "이 화면의 컴포넌트 스펙 정의해줘"

## 입력/출력

- **입력**: PRD 문서(화면 흐름, 구성 요소 포함) 또는 기능 설명, 프로젝트 경로(선택)
- **출력**: 마크다운 형식의 디자인 사양서 -- 사용자 플로우(Mermaid), 텍스트 와이어프레임(ASCII), 디자인 토큰(DTCG JSON), 컴포넌트 스펙 시트, 반응형 전략, 접근성 요구사항 포함. 요청 시 `docs/design/` 경로에 저장

## Claude Code 한계 및 대안

| 한계 | 대안 |
|------|------|
| Figma/Sketch 시안 생성 불가 | 텍스트 기반 와이어프레임(ASCII) + Mermaid 다이어그램 |
| 비주얼 목업 불가 | 컴포넌트 스펙(숫자 기반 크기/여백/색상 정의) |
| 디자인 파일 편집 불가 | 디자인 토큰 JSON/SCSS 코드 생성 가능 |

## 방법론 근거

### 와이어프레임
- 저충실도(Low-fidelity) 와이어프레임으로 구조와 콘텐츠 계층에 집중
- 최소 모바일(375px)과 데스크톱(1280px+) 두 뷰포트 고려

### 디자인 토큰
- W3C DTCG 표준(v2025.10) 형식 준수 -- `$type`, `$value`, `$description` 프로퍼티
- 3계층 추상화: Primitive(참조) -> Semantic(시스템) -> Component
- Style Dictionary, Tokens Studio, Figma, Penpot 등 주요 도구 호환

### 컴포넌트 스펙
- 변형(variants), 상태(states), 구조(anatomy), 접근성을 포함하는 완전한 스펙
- NNGroup의 디자인 스펙 방법론 및 W3C Open UI 스펙 템플릿 참조

### 반응형 전략
- Mobile-First 접근: 최소 뷰포트 기본 스타일 -> min-width 미디어 쿼리로 확장
- 3~5개 breakpoint 권장: 480px(모바일), 768px(태블릿), 1024px(데스크톱), 1280px(와이드)

### 사용자 플로우
- Mermaid flowchart 문법으로 텍스트 기반 다이어그램 생성
- 단일 방향(TD/LR), 표준 기호(시작/끝, 단계, 분기) 사용

## 검증 소스

| 항목 | 소스 | 검증일 |
|------|------|--------|
| DTCG 표준 | https://www.designtokens.org/tr/drafts/format/ (v2025.10) | 2026-04-20 |
| 와이어프레임 방법론 | https://ixdf.org/literature/topics/wireframe | 2026-04-20 |
| 컴포넌트 스펙 | https://uxdesign.cc/component-spec-the-design-system-component-delivery-5f88db6ccf7e | 2026-04-20 |
| 디자인 스펙 작성 | https://www.nngroup.com/articles/creating-design-specs-for-development/ | 2026-04-20 |
| 반응형 breakpoint | https://www.browserstack.com/guide/responsive-design-breakpoints | 2026-04-20 |
| Mermaid 문법 | https://mermaid.ai/open-source/syntax/flowchart.html | 2026-04-20 |

## 관련 에이전트

- **product-planner** (domain) -- PRD 작성. 이 에이전트의 출력이 ui-ux-designer의 주요 입력
- **frontend-developer** (frontend) -- 디자인 사양을 실제 코드로 구현할 때 활용
- **frontend-architect** (frontend) -- 컴포넌트 구조와 디자인 시스템 아키텍처 설계 시 협업
