# 규칙 (Rules)

상황별 Claude Code 동작 규칙 파일 모음 (총 14종).

규칙 파일 위치: `.claude/rules/`

설치 조합은 `project-install.sh`가 결정한다 — 공통(`RULES_COMMON`) 중 작성 도구 규칙 5종은 "작성 도구" 옵션을 켰을 때만, util 템플릿은 `RULES_UTIL` 2종만 받는다.

---

## 공통 규칙 (8종) — util 외 모든 템플릿

| 규칙 | 작성 도구 옵션 필요 | 설명 |
|------|:---:|------|
| [git.md](../../.claude/rules/git.md) | — | Git 커밋 컨벤션 — [category] Type: Subject 형식, 관심사별 커밋 분리 원칙 (util 포함) |
| [info-verification.md](../../.claude/rules/info-verification.md) | — | 외부 정보 검증 원칙 — 공식 문서 1순위, 교차 검증 절차, 낮은 신뢰도 경고 기준 (util 포함) |
| [task-workflow.md](../../.claude/rules/task-workflow.md) | — | 작업 착수 전 확인 절차 — 이해 확인→작업 목록→사용자 확인 대기→승인 후 실행 |
| [agent-design.md](../../.claude/rules/agent-design.md) | ✅ | 에이전트 설계 규칙 — 모델 선택 기준, 도구 부여 원칙, 파일 작성 포맷 |
| [commands.md](../../.claude/rules/commands.md) | ✅ | 슬래시 커맨드 작성 규칙 — 파일 위치, 작성 원칙, 기존 커맨드 목록 |
| [creation-workflow.md](../../.claude/rules/creation-workflow.md) | ✅ | 스킬·에이전트 생성 5단계 워크플로우 — 조사→교차검증→작성→검증문서→2단계테스트 |
| [readme-update.md](../../.claude/rules/readme-update.md) | ✅ | README 업데이트 규칙 — 추가·삭제·이름변경·이동 시 반영 항목, 업데이트 로그 형식 |
| [verification-policy.md](../../.claude/rules/verification-policy.md) | ✅ | 검증 정책 — PENDING_TEST→APPROVED 전환 절차, 수정 도구 제한, 실사용 필수 카테고리 |

---

## 개발 템플릿 규칙 (1종) — util·seo-geo 단독 외 개발 템플릿

| 규칙 | 대상 | 설명 |
|------|------|------|
| [adversarial-testing.md](../../.claude/rules/adversarial-testing.md) | react-spa·nextjs·rust-axum·java×2·unity-game·dream-interpretation·health·fortune-app·python-fastapi·nexacro·all | 적대적 테스트 원칙 — 테스트 3계층(정상/악성 유저 방어/이상·경계) 강제, 악성 유저 공격 체크리스트, 테스트 통과용 하드코딩 return 금지(adversarial-test-guard·fake-impl-guard 훅) |

---

## 언어별 코딩 규칙 (3종) — 해당 템플릿에만 포함, 해당 파일을 다룰 때만 로드(`paths`)

| 규칙 | 대상 템플릿 | 로드 조건 | 설명 |
|------|------------|------|------|
| [java.md](../../.claude/rules/java.md) | java-spring-legacy·java-spring-modern·nexacro·all | `*.java`, `*.gradle(.kts)`, `pom.xml` | Java + Spring Boot 코딩 규칙 — 레거시(Java 11 / SB 2.5)·모던(Java 21 / SB 3.x) 양쪽 |
| [rust.md](../../.claude/rules/rust.md) | rust-axum·all | `*.rs`, `Cargo.toml` | Rust + Axum 코딩 규칙 — 에러 처리, 타입 설계, 비동기, 아키텍처, Clippy 기준 |
| [typescript.md](../../.claude/rules/typescript.md) | react-spa·nextjs·health·dream-interpretation·fortune-app·nexacro(규칙만, TS 훅 없음)·all | `*.ts`, `*.tsx` | TypeScript + React 코딩 규칙 — 타입 시스템, 컴포넌트, 상태 관리, 에러 처리 |

---

## 선택적 규칙 (2종) — 옵션 선택 시 포함

| 규칙 | 활성화 조건 | 설명 |
|------|------------|------|
| [memory-sync.md](../../.claude/rules/memory-sync.md) | `--memory` 선택 | 크로스 데스크탑 Claude 메모리 동기화 정책 — 전역 1차 저장 + 레포 미러, 커밋 시 메모리 정리 절차 |
| [codex-review.md](../../.claude/rules/codex-review.md) | `--codex` 선택 | Codex 적대적 코드 리뷰 워크플로우 — 최대 3라운드 핑퐁, ACCEPT/REJECT 판정 기준 |
