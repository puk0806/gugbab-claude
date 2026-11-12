# CLAUDE.md — gugbab-claude 프로젝트 규칙

Claude Code 활용에 필요한 에이전트(Agent), 스킬(Skill), 설정(CLAUDE.md)을 만들고 관리하는 레포지토리입니다.

---

## 작업 착수 전 확인 절차 (필수)

파일을 고치는 작업(구현·설계·추가·변경·개편) 전에 **"이렇게 이해했습니다:"** → **"작업 목록:"** → 답변 마지막 줄 **진행할까요?** 로 확인받고, 승인 뒤에 실행한다.
`task-confirm-guard` 훅이 승인 전 Write/Edit 와 파일을 바꾸는 셸 명령(Bash·Monitor)을 막는다. 예외·생략 표현 등 상세 → `.claude/rules/task-workflow.md`

---

## 금지 사항

- **커밋·푸시는 사용자가 명시적으로 요청할 때만 진행한다. 작업 완료 후 자동 커밋 제안·실행 금지** — 규칙 수준 준수 (settings.json deny 는 force-push 만 막는다)
- 요청된 것만 수정한다. 요청 범위 밖의 코드는 건드리지 않는다
- API 키·토큰·비밀번호를 파일에 직접 작성 금지
- 검증되지 않은 외부 소스 그대로 복붙 금지
- 테스트되지 않은 에이전트를 main 브랜치에 직접 커밋 금지
- **verification.md, SKILL.md를 Bash(sed/awk 등)로 수정 금지** — 반드시 Write/Edit 도구 사용
- **memory 파일을 Bash로 직접 수정 금지** — Write/Edit 도구 사용 시에만 memory-sync 훅이 자동 동기화
- **PENDING_TEST → APPROVED 일괄 전환 금지** — 스킬별 개별 검증 필수 (`.claude/rules/verification-policy.md`)
- **정상 흐름만 담은 테스트 금지** — 테스트 코드는 악성 유저 방어·이상 경로까지 필수 커버, 테스트 통과용 하드코딩 return 금지 (`.claude/rules/adversarial-testing.md`)

---

이 레포 개발(개발 모드 실행·테스트·실사용 시나리오·항목 추가) → `docs/DEVELOPMENT.md`
