# CLAUDE.md — {프로젝트명}

레거시 스펙 추출 — {프로젝트 한 줄 설명}

---

## 필수 원칙

- 복잡한 작업 전 계획 확인 → @.claude/rules/task-workflow.md

---

## 금지 사항

<!-- common-rules -->
- 스펙 추출 중 **대상 레포의 소스 코드 수정 금지** — 산출물은 `docs/spec/` 아래 문서만 쓴다 (예외: 사용자가 요청한 특성화 테스트 파일 추가)
- **근거(파일:줄) 없는 항목 기록 금지** — 근거를 못 찾으면 쓰지 않거나 확신도 "미확인"으로 둔다
- 비밀번호·API 키·DB 접속 정보 등 **비밀 값을 문서에 옮기기 금지** — 위치(파일:줄)만 적는다
- 스펙 추출 목적으로 **레포의 빌드·배포 스크립트 실행 금지** — grep·find·wc 같은 읽기 명령만 쓴다. 예외는 사용자가 요청한 특성화 테스트 실행뿐이며, 이때도 배포·DB 변경 스크립트는 실행하지 않고 테스트 전용 DB·목(mock)을 쓴다

---

## 스펙 추출 작업 원칙

- 결과는 대상 레포의 `docs/spec/` 에 쓴다 — 인벤토리·화면·API·데이터 사용·비즈니스 규칙·CRUD 매트릭스·추적표(화면 → API → SQL → 테이블)
- 모든 항목에 **근거(파일:줄) · 확신도(확인됨/추정/미확인) · 사용 여부** 세 칸을 붙인다 (`spec-extraction-method` 스킬 양식)
- "지금 시스템이 실제로 하는 것"만 적는다 — 개선안·새 설계는 명세와 분리해 별도 절에 둔다
- 스택별 추출법: Java·MyBatis/iBATIS → `spring-mybatis-spec-extraction`, React → `react-spec-extraction`, 넥사크로 화면 → `nexacro-17-xfdl-anatomy` 스킬
- 전체 흐름은 `/spec-extract` 로 실행한다 — `legacy-spec-extractor` 에이전트가 모듈 단위로 추출하고 `spec-reviewer` 에이전트가 근거 누락·불일치·CRUD 완전성을 검토한다
- 현행 동작을 테스트로 고정해야 하면 사용자 확인 후 `characterization-testing` 스킬을 따른다 (현행 버그도 우선 그대로 고정하고 표시) — 위 금지 사항의 유일한 예외

---

## 규칙 참조

| 상황 | 참조 파일 |
|------|----------|
| 작업 착수 전 확인 | @.claude/rules/task-workflow.md |
| Git 커밋 컨벤션 | @.claude/rules/git.md |
| 외부 정보 조사·검증 | @.claude/rules/info-verification.md |
| 스펙 추출 실행 | `/spec-extract` 커맨드 + `legacy-spec-extractor`·`spec-reviewer` 에이전트 |
| 에이전트 설계·작성 | @.claude/rules/agent-design.md |
| 슬래시 커맨드 작성 | @.claude/rules/commands.md |
| README 업데이트 | @.claude/rules/readme-update.md |
