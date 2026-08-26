# architecture 스킬

아키텍처·데이터 모델 설계 스킬 모음 (총 5종).

| 스킬 | 설명 | 검증 |
|------|------|------|
| [ddd](../../../.claude/skills/architecture/ddd/SKILL.md) | DDD 아키텍처 핵심 패턴 — 유비쿼터스 언어, 서브도메인, 바운디드 컨텍스트, Aggregate, Entity | [→](./ddd/verification.md) |
| [frontend-domain-structure](../../../.claude/skills/architecture/frontend-domain-structure/SKILL.md) | layer-first → domain-first 전환 설계 — FSD 2.1 정본(레이어·slice·segment·import 규칙), 경량 features+shared 대안, App Router 공존, 모노레포 패키지 승격 기준, 경계 역추출 | [→](./frontend-domain-structure/verification.md) |
| [module-boundaries](../../../.claude/skills/architecture/module-boundaries/SKILL.md) | 도메인·레이어 의존 방향 강제 — dependency-cruiser, eslint-plugin-boundaries / import no-restricted-paths (ESLint 8·9 양쪽), 순환·barrel 정리, baseline 점진 도입 | [→](./module-boundaries/verification.md) |
| [incremental-refactoring](../../../.claude/skills/architecture/incremental-refactoring/SKILL.md) | 수천 파일 코드베이스 무중단 재구조화 — Strangler Fig, ts-morph/jscodeshift codemod, 배치 분할·검증 게이트, 테스트 없는 코드의 안전망, 진행 지표 | [→](./incremental-refactoring/verification.md) |
| [dream-journal-data-modeling](../../../.claude/skills/architecture/dream-journal-data-modeling/SKILL.md) | 꿈 일기 PWA 데이터 모델 설계 — Dream·Interpretation·Symbol·Tag 엔티티, Dexie 스키마 | [→](./dream-journal-data-modeling/verification.md) |
