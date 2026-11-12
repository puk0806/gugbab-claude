# domain 에이전트

레거시 스펙 추출·넥사크로 화면 분석 등 마이그레이션 분석 단계를 담당하는 에이전트 모음.

| 에이전트 | 설명 |
|---------|------|
| [legacy-spec-extractor](../../../.claude/agents/domain/legacy-spec-extractor.md) | 레거시 코드(Java·React·넥사크로) → 화면·API·데이터·비즈니스 규칙 명세를 모듈 단위로 추출·병합, 근거(파일:줄)·확신도·사용 여부 표기 — 오케스트레이터 (spec-extraction 템플릿) |
| [nexacro-screen-analyzer](../../../.claude/agents/domain/nexacro-screen-analyzer.md) | 넥사크로 화면(.xfdl) 인벤토리 — Dataset·transaction·Grid 기능·팝업·공통 함수 의존, 난이도·전환 웨이브 계획 (nexacro 템플릿) |
