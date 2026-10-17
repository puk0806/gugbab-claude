# 규칙 (Rules)

상황별 Claude Code 동작 규칙 파일 모음 (총 14종).

규칙 파일 위치: `.claude/rules/`

래퍼(`gugbab-claude`)에서는 프로젝트마다 `/harness` 로 켜고 끈다. 🔒 고정 규칙은 끌 수 없고, 나머지 기본값은 [항목 체크리스트](../plans/2026-10-15-harness-item-checklist.md) 를 따른다. 규칙은 세션 시작 때 읽히므로 바꾸면 `/exit` 후 다시 시작할 때 반영된다(래퍼가 대화를 이어서 다시 띄움). 옛 복사 설치(`project-install.sh`)는 2026-10-17 삭제했다.

| 기본값 | 뜻 |
|---|---|
| 🔒 고정 | 어느 프로젝트에서도 끌 수 없음 |
| ✅ 켬 | 기본으로 켜짐 — 프로젝트마다 끌 수 있음 |

---

## 공통 규칙

| 규칙 | 기본값 | 묶음 (함께 켜고 끄는 단위) | 설명 |
|------|:---:|------|------|
| [info-verification.md](../../.claude/rules/info-verification.md) | 🔒 | — | 외부 정보 검증 원칙 — 공식 문서 1순위, 교차 검증 절차, 낮은 신뢰도 경고 기준 |
| [task-workflow.md](../../.claude/rules/task-workflow.md) | 🔒 | 작업 확인 절차 `bundle:task-confirm` | 작업 착수 전 확인 절차 — 이해 확인→작업 목록→사용자 확인 대기→승인 후 실행 |
| [verification-policy.md](../../.claude/rules/verification-policy.md) | 🔒 | 스킬 검증 문서 `bundle:verification` | 검증 정책 — PENDING_TEST→APPROVED 전환 절차, 수정 도구 제한, 실사용 필수 카테고리 |
| [git.md](../../.claude/rules/git.md) | ✅ | — | Git 커밋 컨벤션 — [category] Type: Subject 형식, 관심사별 커밋 분리 원칙 (끄면 `/commit` 도 같이 꺼짐) |
| [adversarial-testing.md](../../.claude/rules/adversarial-testing.md) | ✅ | 테스트 품질 `bundle:dev-quality` | 적대적 테스트 원칙 — 테스트 3계층(정상/악성 유저 방어/이상·경계) 강제, 테스트 통과용 하드코딩 return 금지(adversarial-test-guard·fake-impl-guard 훅) |
| [memory-sync.md](../../.claude/rules/memory-sync.md) | ✅ | 메모리 공유 `bundle:memory-share` | 크로스 데스크탑 Claude 메모리 동기화 정책 — 전역 1차 저장 + 레포 미러, 커밋 시 메모리 정리 절차 |
| [codex-review.md](../../.claude/rules/codex-review.md) | ✅ | Codex 리뷰 `bundle:codex-review` | Codex 적대적 코드 리뷰 워크플로우 — 최대 3라운드 핑퐁, ACCEPT/REJECT 판정 기준 |

---

## 하네스 제작 규칙 — 스킬·에이전트·커맨드를 만들 때 (`bundle:harness-authoring`)

| 규칙 | 기본값 | 설명 |
|------|:---:|------|
| [agent-design.md](../../.claude/rules/agent-design.md) | ✅ | 에이전트 설계 규칙 — 모델 선택 기준, 도구 부여 원칙, 파일 작성 포맷 |
| [commands.md](../../.claude/rules/commands.md) | ✅ | 슬래시 커맨드 작성 규칙 — 파일 위치, 작성 원칙, 기존 커맨드 목록 |
| [creation-workflow.md](../../.claude/rules/creation-workflow.md) | ✅ | 스킬·에이전트 생성 5단계 워크플로우 — 조사→교차검증→작성→검증문서→2단계테스트 |
| [readme-update.md](../../.claude/rules/readme-update.md) | ✅ | 문서 업데이트 규칙 — 추가·삭제·이름변경 시 반영 항목, 업데이트 로그(`docs/CHANGELOG.md`) 형식 |

---

## 언어별 코딩 규칙 — 해당 파일을 다룰 때만 로드(`paths`)

| 규칙 | 기본값 | 블록 (스택) | 로드 조건 | 설명 |
|------|:---:|------|------|------|
| [java.md](../../.claude/rules/java.md) | ✅ | Java 공통 `block:java-common` | `*.java`, `*.gradle(.kts)`, `pom.xml` | Java + Spring Boot 코딩 규칙 — 레거시(Java 11 / SB 2.5)·모던(Java 21 / SB 3.x) 양쪽 |
| [rust.md](../../.claude/rules/rust.md) | ✅ | Rust `block:rust` | `*.rs`, `Cargo.toml` | Rust + Axum 코딩 규칙 — 에러 처리, 타입 설계, 비동기, 아키텍처, Clippy 기준 |
| [typescript.md](../../.claude/rules/typescript.md) | ✅ | 프론트 핵심 `block:frontend-core` | `*.ts`, `*.tsx` | TypeScript + React 코딩 규칙 — 타입 시스템, 컴포넌트, 상태 관리, 에러 처리 |

언어 규칙은 해당 파일을 다룰 때만 읽히므로 기본으로 켜 두어도 다른 스택 프로젝트에 부담이 없다. 블록을 끄면 규칙도 같이 꺼진다.
