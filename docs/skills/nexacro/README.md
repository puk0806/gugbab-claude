# nexacro 스킬

넥사크로 17 레거시 이해와 Next.js·Spring Boot 로의 마이그레이션 스킬 모음 (총 5종). nexacro 템플릿(15) 소유 — `nexacro-17-xfdl-anatomy`는 spec-extraction 템플릿(14)에도 설치.

| 스킬 | 설명 | 검증 |
|------|------|------|
| [nexacro-17-xfdl-anatomy](../../../.claude/skills/nexacro-17-xfdl-anatomy/SKILL.md) | 넥사크로 17 소스(.xprj·.xadl·typedefinition.xml·.xfdl·.xjs) 읽기 사전 — Dataset·transaction·Grid·showModal, 화면 1개 명세 추출 체크리스트 | [→](./nexacro-17-xfdl-anatomy/verification.md) |
| [nexacro-xapi-server](../../../.claude/skills/nexacro-xapi-server/SKILL.md) | 넥사크로와 통신하는 Java 서버(X-API·Spring 연동·xeni 엑셀) 분석 — PlatformData→DataSet, 행 타입, ErrorCode/ErrorMsg, 14/17/N 패키지 차이 | [→](./nexacro-xapi-server/verification.md) |
| [nexacro-to-react-mapping](../../../.claude/skills/nexacro-to-react-mapping/SKILL.md) | 넥사크로 화면 → Next.js 대응표 — Dataset→TanStack Query/RHF, transaction→REST 훅, showModal→모달, Grid→AG Grid(Community/Enterprise 두 경로), 엑셀 | [→](./nexacro-to-react-mapping/verification.md) |
| [xapi-to-rest-migration](../../../.claude/skills/xapi-to-rest-migration/SKILL.md) | X-API 컨트롤러 → Spring Boot 3 REST + DTO — ProblemDetail, 행 상태 일괄 저장(POST /batch), 낙관적 잠금, 공존 어댑터, POI SXSSF | [→](./xapi-to-rest-migration/verification.md) |
| [nexacro-strangler-coexistence](../../../.claude/skills/nexacro-strangler-coexistence/SKILL.md) | 점진 전환(Strangler Fig) 공존 — Next.js rewrites fallback·Multi-Zones, 넥사크로에서 새 화면 열기, 쿠키·세션 공유, 메뉴 전환 플래그, 웨이브 운영 | [→](./nexacro-strangler-coexistence/verification.md) |

넥사크로 마이그레이션용 백엔드 스킬 `spring-boot-1-to-2-migration`·`ibatis-to-mybatis-migration`은 [backend](../backend/README.md)에 있다 (nexacro 템플릿 전용).
