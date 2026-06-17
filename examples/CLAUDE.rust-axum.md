# CLAUDE.md — {프로젝트명}

Rust + Axum — {프로젝트 한 줄 설명}

---

## 필수 원칙

- 복잡한 작업 전 계획 확인 → @.claude/rules/task-workflow.md

---

## 금지 사항

<!-- common-rules -->
- `unwrap()` / `expect()` 프로덕션 코드 금지 — 테스트에서만 허용
- `std::sync::Mutex` async 컨텍스트 금지 — `tokio::sync::Mutex` 사용
- blocking 작업을 async 함수에서 직접 실행 금지 — `spawn_blocking` 사용

---

## 규칙 참조

| 상황 | 참조 파일 |
|------|----------|
| 작업 착수 전 확인 | @.claude/rules/task-workflow.md |
| Git 커밋 컨벤션 | @.claude/rules/git.md |
| 외부 정보 조사·검증 | @.claude/rules/info-verification.md |
| Rust 코딩 규칙 | @.claude/rules/rust.md |
| 에이전트 설계·작성 | @.claude/rules/agent-design.md |
| 슬래시 커맨드 작성 | @.claude/rules/commands.md |
| README 업데이트 | @.claude/rules/readme-update.md |
| Codex 적대적 코드 리뷰 | @.claude/rules/codex-review.md |
