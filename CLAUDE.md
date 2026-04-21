# CLAUDE.md — gugbab-claude 프로젝트 규칙

Claude Code 활용에 필요한 에이전트(Agent), 스킬(Skill), 설정(CLAUDE.md)을 만들고 관리하는 레포지토리입니다.

---

## 컨텍스트 관리

- 관련 없는 작업 사이에는 `/clear`로 컨텍스트 초기화
- 같은 실수를 2번 이상 수정하면 `/clear` 후 더 구체적인 프롬프트로 재시작
- 파일을 많이 읽는 조사 작업은 서브에이전트에 위임
- 컨텍스트 압축 시: `/compact "수정된 파일 목록과 주요 결정사항 보존"`

---

## 금지 사항

- API 키·토큰·비밀번호를 파일에 직접 작성 금지
- 검증되지 않은 외부 소스 그대로 복붙 금지
- 테���트되지 않은 에이전트를 main 브랜치에 직접 커밋 금지
- **verification.md, SKILL.md를 Bash(sed/awk 등)로 수정 금지** — 반드시 Write/Edit 도��� 사용
- **PENDING_TEST → APPROVED 일괄 전환 금지** �� 스킬별 개별 검증 필수 (@.claude/rules/verification-policy.md)

---

## 상황별 규칙 참조

| 상황 | 참조 파일 |
|------|----------|
| 외부 정보 조사·검증 | @.claude/rules/info-verification.md |
| 에이전트 설계·작성 | @.claude/rules/agent-design.md |
| 스킬·에이전트 생성 절차 | @.claude/rules/creation-workflow.md |
| Git 커밋 컨벤션 | @.claude/rules/git.md |
| README 업데이트 | @.claude/rules/readme-update.md |
| 검증 정책·APPROVED 전환 | @.claude/rules/verification-policy.md |
