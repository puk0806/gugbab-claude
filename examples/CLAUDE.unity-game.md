# CLAUDE.md — {프로젝트명}

Unity 6 LTS — {프로젝트 한 줄 설명}

---

## 필수 원칙

- 복잡한 작업 전 계획 확인 → @.claude/rules/task-workflow.md

---

## 금지 사항

- **커밋·푸시는 사용자가 명시적으로 요청할 때만 진행한다. 작업 완료 후 자동 커밋 제안·실행 금지**
- `Update()`에 비용이 큰 로직 직접 작성 금지 — 코루틴 또는 이벤트 기반으로 대체
- `Find*()` 계열 함수를 런타임 루프에서 호출 금지 — `Awake/Start`에서 캐싱
- `new` 키워드로 오브젝트 빈번히 생성 금지 — 오브젝트 풀링 사용

---

## 규칙 참조

| 상황 | 참조 파일 |
|------|----------|
| 작업 착수 전 확인 | @.claude/rules/task-workflow.md |
| Git 커밋 컨벤션 | @.claude/rules/git.md |
| 외부 정보 조사·검증 | @.claude/rules/info-verification.md |
| 에이전트 설계·작성 | @.claude/rules/agent-design.md |
| 슬래시 커맨드 작성 | @.claude/rules/commands.md |
| README 업데이트 | @.claude/rules/readme-update.md |
| Codex 적대적 코드 리뷰 | @.claude/rules/codex-review.md |
