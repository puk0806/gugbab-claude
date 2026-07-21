# CLAUDE.md — gugbab-claude 프로젝트 규칙

Claude Code 활용에 필요한 에이전트(Agent), 스킬(Skill), 설정(CLAUDE.md)을 만들고 관리하는 레포지토리입니다.

---

## 컨텍스트 관리

- 관련 없는 작업 사이에는 `/clear`로 컨텍스트 초기화
- 같은 실수를 2번 이상 수정하면 `/clear` 후 더 구체적인 프롬프트로 재시작
- 파일을 많이 읽는 조사 작업은 서브에이전트에 위임
- 컨텍스트 압축 시: `/compact "수정된 파일 목록과 주요 결정사항 보존"`

---

## 작업 착수 전 확인 절차 (필수)

구현·설계·추가·변경·개편 등 복잡한 작업을 시작하기 전에 반드시:

1. **"이렇게 이해했습니다:"** — 요청 내용 요약
2. **"작업 목록:"** — 번호 있는 단계 리스트
3. **"진행할까요?"** — 사용자 확인 대기
4. 승인 후 실행

여러 파일에 걸친 복잡한 작업은 네이티브 **Plan Mode**(EnterPlanMode)를 우선 사용한다.
단순 조회(설명·요약·검색)와 git 커밋·푸시는 예외. 자세한 기준 → @.claude/rules/task-workflow.md

---

## 금지 사항

- **커밋·푸시는 사용자가 명시적으로 요청할 때만 진행한다. 작업 완료 후 자동 커밋 제안·실행 금지** — settings.json deny 목록으로 강제
- 요청된 것만 수정한다. 요청 범위 밖의 코드는 건드리지 않는다
- API 키·토큰·비밀번호를 파일에 직접 작성 금지
- 검증되지 않은 외부 소스 그대로 복붙 금지
- 테스트되지 않은 에이전트를 main 브랜치에 직접 커밋 금지
- **verification.md, SKILL.md를 Bash(sed/awk 등)로 수정 금지** — 반드시 Write/Edit 도구 사용
- **memory 파일을 Bash로 직접 수정 금지** — Write/Edit 도구 사용 시에만 memory-sync 훅이 자동 동기화
- **PENDING_TEST → APPROVED 일괄 전환 금지** — 스킬별 개별 검증 필수 (@.claude/rules/verification-policy.md)
- **정상 흐름만 담은 테스트 금지** — 테스트 코드는 악성 유저 방어·이상 경로까지 필수 커버, 테스트 통과용 하드코딩 return 금지. adversarial-test-guard·fake-impl-guard 훅으로 강제 (@.claude/rules/adversarial-testing.md)

---

## 상황별 규칙 참조

| 상황 | 참조 파일 |
|------|----------|
| 외부 정보 조사·검증 | @.claude/rules/info-verification.md |
| 테스트 코드 작성(악성 유저 방어·가짜 구현 차단) | @.claude/rules/adversarial-testing.md |
| 에이전트 설계·작성 | @.claude/rules/agent-design.md |
| 스킬·에이전트 생성 절차 | @.claude/rules/creation-workflow.md |
| Git 커밋 컨벤션 | @.claude/rules/git.md |
| README 업데이트 | @.claude/rules/readme-update.md |
| 검증 정책·APPROVED 전환 | @.claude/rules/verification-policy.md |
| 슬래시 커맨드 작성·목록 | @.claude/rules/commands.md |
| 메모리 동기화 정책 | @.claude/rules/memory-sync.md |
| 작업 착수 전 확인 절차 | @.claude/rules/task-workflow.md |
