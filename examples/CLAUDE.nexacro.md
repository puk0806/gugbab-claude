# CLAUDE.md — {프로젝트명}

넥사크로 17 + Spring(X-API) 레거시 → Next.js·Java 이전 — {프로젝트 한 줄 설명}

---

## 필수 원칙

- 복잡한 작업 전 계획 확인 → @.claude/rules/task-workflow.md
- 이전 코드·테스트는 적대적 테스트 3계층(정상·악성 유저·경계)을 따른다 → @.claude/rules/adversarial-testing.md

---

## 금지 사항

<!-- common-rules -->
- **회사 소스·데이터를 외부로 반출 금지** — 외부 서비스·공개 저장소·외부 AI 도구에 넥사크로 화면·서버 코드·업무 데이터를 붙여넣지 않는다
- 넥사크로 화면·기능을 **사용 여부 확인 없이 1:1 복제 금지** — 메뉴 접근 기록·호출 여부로 쓰이는지 먼저 확인하고, 안 쓰는 기능은 옮기지 않는다
- 변환 초안을 **사람 검토 없이 머지 금지** — `nexacro-screen-converter` 결과는 초안이며 `// TODO(migration)` 표시를 모두 확인한 뒤 반영한다
- AG Grid **Enterprise(유료) 기능을 표시 없이 사용 금지** — 트리·합계 행·엑셀 내보내기 등 유료 기능은 변환표에 표시하고 라이선스 확인 후 사용한다
- **원본 넥사크로 파일(.xfdl·.xjs)과 운영 중인 X-API 경로를 깨뜨리는 수정 금지** — 전환기 공존(strangler) 중에는 기존 화면이 그대로 동작해야 한다. 서버 버전 업·REST 전환은 아래 원칙대로 별도 브랜치·모듈에서 하고, 기존 X-API 응답 형식은 그 화면이 이전될 때까지 유지한다

---

## 넥사크로 이전 작업 원칙

- 분석·계획 산출물은 `docs/migration/` 에 쓴다 — 화면 인벤토리·Grid 기능·공통 의존·웨이브 계획(`nexacro-screen-analyzer` 에이전트), 화면별 변환표(`docs/migration/converted/`), 동등성 차이 보고(`docs/migration/parity/`)
- 원본 해석은 `nexacro-17-xfdl-anatomy`, 대응 규칙은 `nexacro-to-react-mapping`, 서버 쪽은 `nexacro-xapi-server`·`xapi-to-rest-migration` 스킬을 먼저 읽는다
- 기존 화면과 새 화면은 웨이브 단위로 함께 운영한다 (`nexacro-strangler-coexistence` 스킬) — 공통 컴포넌트·공통 함수 대체가 웨이브 0
- 옮긴 화면·API는 `migration-parity-tester` 에이전트로 기존과 같은 결과(조회·일괄 저장·오류)인지 비교 테스트를 만든다 — 권한 우회·위조 행 같은 적대적 케이스 포함
- 서버가 Spring Boot 1.x·iBATIS 면 `spring-boot-1-to-2-migration`·`ibatis-to-mybatis-migration` → `spring-boot-2-to-3-migration` 순서로 단계 이전한다
- 화면·API 상세 명세가 필요하면 `15,14` 로 spec-extraction 템플릿을 함께 설치해 `docs/spec/` 에 추출한다

---

## 규칙 참조

| 상황 | 참조 파일 |
|------|----------|
| 작업 착수 전 확인 | @.claude/rules/task-workflow.md |
| Git 커밋 컨벤션 | @.claude/rules/git.md |
| 외부 정보 조사·검증 | @.claude/rules/info-verification.md |
| Java 코딩 규칙 | @.claude/rules/java.md |
| TypeScript 코딩 규칙 (이전 목표 Next.js) | @.claude/rules/typescript.md |
| 적대적 테스트 | @.claude/rules/adversarial-testing.md |
| 에이전트 설계·작성 | @.claude/rules/agent-design.md |
| 슬래시 커맨드 작성 | @.claude/rules/commands.md |
| README 업데이트 | @.claude/rules/readme-update.md |
| Codex 적대적 코드 리뷰 | @.claude/rules/codex-review.md |
