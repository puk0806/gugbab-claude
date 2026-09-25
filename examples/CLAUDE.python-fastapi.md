# CLAUDE.md — {프로젝트명}

Python + FastAPI — {프로젝트 한 줄 설명}

---

## 필수 원칙

- 복잡한 작업 전 계획 확인 → @.claude/rules/task-workflow.md
- 테스트는 정상 흐름 + 악성 유저 방어 + 이상·경계 경로 3계층 → @.claude/rules/adversarial-testing.md

---

## 금지 사항

<!-- common-rules -->
- `async def` 경로에서 blocking I/O(`requests`, 동기 DB 드라이버, `time.sleep`) 직접 호출 금지 — async 클라이언트 또는 `run_in_threadpool` 사용
- Pydantic v1 API(`.dict()`, `.parse_obj()`, `class Config`) 신규 작성 금지 — v2(`model_dump`, `model_validate`, `model_config`) 사용
- SQL 문자열 포매팅(f-string·`%`)으로 쿼리 조립 금지 — 바인딩 파라미터 사용
- `print()` 로깅 금지 — `logging`/구조화 로거 사용
- 의존성 수동 `pip install` 금지 — `uv add` 로 `pyproject.toml`·`uv.lock` 에 기록

---

## 규칙 참조

| 상황 | 참조 파일 |
|------|----------|
| 작업 착수 전 확인 | @.claude/rules/task-workflow.md |
| Git 커밋 컨벤션 | @.claude/rules/git.md |
| 외부 정보 조사·검증 | @.claude/rules/info-verification.md |
| 테스트 작성(적대적 3계층) | @.claude/rules/adversarial-testing.md |
| 에이전트 설계·작성 | @.claude/rules/agent-design.md |
| 슬래시 커맨드 작성 | @.claude/rules/commands.md |
| README 업데이트 | @.claude/rules/readme-update.md |
| Codex 적대적 코드 리뷰 | @.claude/rules/codex-review.md |
