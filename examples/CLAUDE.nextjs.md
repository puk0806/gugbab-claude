# CLAUDE.md — {프로젝트명}

Next.js App Router (TypeScript) — {프로젝트 한 줄 설명}

---

## 필수 원칙

- 복잡한 작업 전 계획 확인 → @.claude/rules/task-workflow.md
- 커밋·푸시는 사용자 명시 요청 시에만

---

## 금지 사항

- `use client` 남용 금지 — Server Component 기본, 상호작용 필요한 부분만 클라이언트 컴포넌트
- `any` 타입 사용 금지 — `unknown` + 타입 가드로 대체
- `console.log` 프로덕션 코드에 남기지 않기

---

## 규칙 참조

| 상황 | 참조 파일 |
|------|----------|
| 작업 착수 전 확인 | @.claude/rules/task-workflow.md |
| Git 커밋 컨벤션 | @.claude/rules/git.md |
| 외부 정보 조사·검증 | @.claude/rules/info-verification.md |
| TypeScript 코딩 규칙 | @.claude/rules/typescript.md |
| 에이전트 설계·작성 | @.claude/rules/agent-design.md |
| 슬래시 커맨드 작성 | @.claude/rules/commands.md |
| README 업데이트 | @.claude/rules/readme-update.md |
| Codex 적대적 코드 리뷰 | @.claude/rules/codex-review.md |
