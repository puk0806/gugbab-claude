# 규칙 (Rules)

상황별 Claude Code 동작 규칙 파일 모음 (총 13종).

규칙 파일 위치: `.claude/rules/`

---

## 공통 규칙 (8종) — 대부분의 템플릿

| 규칙 | 설명 |
|------|------|
| [git.md](../../.claude/rules/git.md) | Git 커밋 컨벤션 — [category] Type: Subject 형식, 관심사별 커밋 분리 원칙 |
| [info-verification.md](../../.claude/rules/info-verification.md) | 외부 정보 검증 원칙 — 공식 문서 1순위, 교차 검증 절차, 낮은 신뢰도 경고 기준 |
| [agent-design.md](../../.claude/rules/agent-design.md) | 에이전트 설계 규칙 — 모델 선택 기준, 도구 부여 원칙, 파일 작성 포맷 |
| [commands.md](../../.claude/rules/commands.md) | 슬래시 커맨드 작성 규칙 — 파일 위치, 작성 원칙, 기존 커맨드 목록 |
| [creation-workflow.md](../../.claude/rules/creation-workflow.md) | 스킬·에이전트 생성 5단계 워크플로우 — 조사→교차검증→작성→검증문서→2단계테스트 |
| [readme-update.md](../../.claude/rules/readme-update.md) | README 업데이트 규칙 — 추가·삭제·이름변경·이동 시 반영 항목, 업데이트 로그 형식 |
| [verification-policy.md](../../.claude/rules/verification-policy.md) | 검증 정책 — PENDING_TEST→APPROVED 전환 절차, 수정 도구 제한, 실사용 필수 카테고리 |
| [task-workflow.md](../../.claude/rules/task-workflow.md) | 작업 착수 전 확인 절차 — 이해 확인→작업 목록→사용자 확인 대기→승인 후 실행 |

---

## 언어별 코딩 규칙 (3종) — 해당 템플릿에만 포함

| 규칙 | 대상 템플릿 | 설명 |
|------|------------|------|
| [java.md](../../.claude/rules/java.md) | java-spring-legacy·java-spring-modern | Java + Spring Boot 코딩 규칙 — 레거시(Java 11 / SB 2.5)·모던(Java 21 / SB 3.x) 양쪽 |
| [rust.md](../../.claude/rules/rust.md) | rust-axum | Rust + Axum 코딩 규칙 — 에러 처리, 타입 설계, 비동기, 아키텍처, Clippy 기준 |
| [typescript.md](../../.claude/rules/typescript.md) | react-spa·nextjs | TypeScript + React 코딩 규칙 — 타입 시스템, 컴포넌트, 상태 관리, 에러 처리 |

---

## 선택적 규칙 (2종) — 옵션 선택 시 포함

| 규칙 | 활성화 조건 | 설명 |
|------|------------|------|
| [memory-sync.md](../../.claude/rules/memory-sync.md) | `--memory` 선택 | 크로스 데스크탑 Claude 메모리 동기화 정책 — git 추적, 자동 훅, 충돌 방지 원칙 |
| [codex-review.md](../../.claude/rules/codex-review.md) | `--codex` 선택 | Codex 적대적 코드 리뷰 워크플로우 — 최대 3라운드 핑퐁, ACCEPT/REJECT 판정 기준 |
