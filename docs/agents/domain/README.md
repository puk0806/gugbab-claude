# domain 에이전트

도메인 모델 분석, 제품 기획, UI/UX 설계, API 스펙 설계 등 기획·설계 단계를 담당하는 에이전트 모음.

| 에이전트 | 설명 |
|---------|------|
| [business-domain-analyst](../../../.claude/agents/domain/business-domain-analyst.md) | 비즈니스 요구사항 → DDD 유비쿼터스 언어·바운디드 컨텍스트·집합체·도메인 이벤트 도출 |
| [codebase-domain-analyst](../../../.claude/agents/domain/codebase-domain-analyst.md) | 코드베이스 역분석 → 도메인 구조·레이어 의존성·현재 vs 이상적 구조 갭 진단 |
| [frontend-domain-refactorer](../../../.claude/agents/domain/frontend-domain-refactorer.md) | React/Next.js layer-first → domain-first 재구조화 **실행 계획** — import 그래프·co-change로 경계 역추출, 리프부터 배치 설계, ts-morph codemod·경계 규칙·검증 게이트 산출 (소스 직접 수정 없음) |
| [product-planner](../../../.claude/agents/domain/product-planner.md) | 기능 아이디어 → 사용자 스토리·수용 기준·화면 흐름·엣지 케이스 포함 PRD 작성 |
| [ui-ux-designer](../../../.claude/agents/domain/ui-ux-designer.md) | PRD → 텍스트 와이어프레임·디자인 토큰·컴포넌트 스펙·반응형 전략 출력 |
| [api-spec-designer](../../../.claude/agents/domain/api-spec-designer.md) | PRD → OpenAPI 3.1 스펙·RESTful 엔드포인트·요청/응답 스키마·에러 코드·인증 설계 |
| [legacy-spec-extractor](../../../.claude/agents/domain/legacy-spec-extractor.md) | 레거시 코드(Java·React·넥사크로) → 화면·API·데이터·비즈니스 규칙 명세를 모듈 단위로 추출·병합, 근거(파일:줄)·확신도·사용 여부 표기 — 오케스트레이터 (spec-extraction 템플릿) |
| [nexacro-screen-analyzer](../../../.claude/agents/domain/nexacro-screen-analyzer.md) | 넥사크로 화면(.xfdl) 인벤토리 — Dataset·transaction·Grid 기능·팝업·공통 함수 의존, 난이도·전환 웨이브 계획 (nexacro 템플릿) |
