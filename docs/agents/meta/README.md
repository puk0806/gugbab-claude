# meta 에이전트

에이전트·스킬 생성·관리, 기술 스택 결정, 프로젝트 부트스트랩 등 개발 워크플로우 전반을 지원하는 메타 에이전트 모음.

| 에이전트 | 설명 |
|---------|------|
| [agent-creator](../../../.claude/agents/meta/agent-creator.md) | 새 에이전트 MD 파일을 대화형으로 생성. 역할/도구/모델/절차/출력형식 자동 구성 |
| [skill-creator](../../../.claude/agents/meta/skill-creator.md) | 공식 문서 검증 후 SKILL.md 생성. WebSearch 기반 교차 검증 포함 |
| [skill-tester](../../../.claude/agents/meta/skill-tester.md) | PENDING_TEST 스킬 실사용 테스트 자동 수행. verification.md 업데이트까지 자기 완결 |
| [freshness-auditor](../../../.claude/agents/meta/freshness-auditor.md) | 에이전트·스킬 전체 감사 — deprecated·검증일 만료·verification.md 누락 점검 |
| [planner](../../../.claude/agents/meta/planner.md) | 복잡한 작업을 2~5분 단위 단계로 분해하고 적합한 에이전트·스킬 매핑 |
| [spec-writer](../../../.claude/agents/meta/spec-writer.md) | 기능 요청 → Requirements·Design·Tasks 3단계 구현 명세 작성 |
| [changelog-writer](../../../.claude/agents/meta/changelog-writer.md) | git log → Keep a Changelog 형식 CHANGELOG.md 자동 작성 |
| [claude-code-guide](../../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI·훅·슬래시 커맨드·MCP·SDK 공식 문서 기반 안내 |
| [tech-stack-advisor](../../../.claude/agents/meta/tech-stack-advisor.md) | 서비스 요구사항 → 기술 스택 2~3개 비교·추천·트레이드오프 출력 |
| [mvp-scope-planner](../../../.claude/agents/meta/mvp-scope-planner.md) | PRD·기능 후보 → MVP Phase 1·2·3 절단 + 비기능 최소선 정의 |
| [project-scaffolder](../../../.claude/agents/meta/project-scaffolder.md) | 결정된 스택으로 프로젝트 부트스트랩 (CLI init → 폴더 구조 → git init 초기 커밋) |
