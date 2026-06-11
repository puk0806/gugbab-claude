# 슬래시 커맨드 작성 규칙

슬래시 커맨드(`.claude/commands/`)를 추가하거나 수정할 때 참조한다.

---

## 파일 규칙

```
.claude/commands/{command-name}.md
```

- 파일명 = 슬래시 커맨드명 (kebab-case)
- 확장자: `.md`
- 사용자가 `/command-name` 입력 시 이 파일 내용이 프롬프트로 실행됨

---

## 작성 원칙

| 원칙 | 내용 |
|------|------|
| **단일 목적** | 커맨드 하나 = 작업 하나. 여러 작업은 에이전트로 |
| **현재 컨텍스트 활용** | 커맨드는 현재 대화 컨텍스트에서 실행됨. 파일 읽기·git 명령 등 자유롭게 활용 가능 |
| **인자 처리** | `$ARGUMENTS`로 사용자가 넘긴 인자 참조. 인자 없을 때 동작도 명시 |
| **확인 요청** | 파일 수정·커밋·push 등 되돌리기 어려운 작업 전 사용자 확인 단계 포함 |
| **rules 참조** | 기존 규칙 파일(git.md 등)을 직접 인용하지 말고 파일 경로로 참조 |

---

## 기존 커맨드 목록

| 커맨드 | 파일 | 용도 |
|--------|------|------|
| `/commit` | commit.md | git.md 컨벤션에 맞는 커밋 자동 실행 |
| `/create-pr` | create-pr.md | GitHub PR 제목·본문 작성 + gh pr create |
| `/context-prime` | context-prime.md | 새 세션 컨텍스트 초기화 (CLAUDE.md·rules·git 상태 로드) |
| `/create-plan` | create-plan.md | Requirements→Design→Tasks 3단계 계획 작성 |
| `/fix-pr` | fix-pr.md | PR 리뷰 코멘트 자동 수정 반영 |
| `/update-docs` | update-docs.md | 코드 변경 후 README·docs/ 동기화 |
| `/tdd-implement` | tdd-implement.md | Red-Green-Refactor 사이클 강제 실행 |
| `/agent-status` | agent-status.md | 현재 브랜치·미커밋 파일·PENDING_TEST 스킬 현황 요약 |
| `/sparc-refine` | sparc-refine.md | SPARC 5단계(Spec→Pseudocode→Arch→Refine→Complete) 리팩터링 |

---

## 새 커맨드 추가 시 CLAUDE.md 업데이트 규칙

커맨드 파일만 추가하면 자동 동작한다. 단, 이 파일(commands.md)의 **기존 커맨드 목록**은 반드시 동기화한다.
