# spec 스킬

레거시 코드에서 마이그레이션·재구축용 스펙(화면·API·데이터·비즈니스 규칙)을 뽑는 스킬 모음 (총 4종). spec-extraction 템플릿(14) 소유.

| 스킬 | 설명 | 검증 |
|------|------|------|
| [spec-extraction-method](../../../.claude/skills/spec-extraction-method/SKILL.md) | 기술 무관 공통 방법론·명세 양식 — 역공학, Feature Parity 함정과 사용 여부 판정, CRUD 매트릭스 완전성, LLM 추출 규약(근거 파일:줄·확신도·사람 검토), 화면/API/데이터/규칙/배치 명세 템플릿 | [→](./spec-extraction-method/verification.md) |
| [spring-mybatis-spec-extraction](../../../.claude/skills/spring-mybatis-spec-extraction/SKILL.md) | Spring(Boot 1.x~3.x)·MyBatis/iBATIS 백엔드에서 API 목록·SQL·CRUD 매트릭스·배치/연동 목록 추출 — 매핑 합성, Actuator mappings, springdoc, 매퍼 XML 파싱, 읽기 전용 스크립트 3종 | [→](./spring-mybatis-spec-extraction/verification.md) |
| [react-spec-extraction](../../../.claude/skills/react-spec-extraction/SKILL.md) | React·Next.js 프론트에서 화면 명세 추출 — 라우트 목록, ts-morph로 API 호출 수집, RHF·zod 4 검증 규칙(z.toJSONSchema 함정), 버튼→API, 전역 상태 | [→](./react-spec-extraction/verification.md) |
| [characterization-testing](../../../.claude/skills/characterization-testing/SKILL.md) | 현행 동작 고정 테스트 — ApprovalTests.Java·JUnit 5·MockMvc, Jest·Vitest 스냅샷, 비결정성 제어, API 골든 마스터(민감 정보 마스킹), 현행 버그 처리 | [→](./characterization-testing/verification.md) |
