# Git 커밋 컨벤션

## 구조

```
[category] Type: Subject

body (선택, 72자 이내)
footer (선택)
```

**category:** `agent` | `skill` | `docs` | `config`

## Type

| Type | 설명 |
|------|------|
| `Add` | 새 파일·기능 추가 |
| `Remove` | 삭제 |
| `Fix` | 버그 수정 |
| `Modify` | 기존 기능 변경 |
| `Improve` | 품질·성능 향상 |
| `Refactor` | 구조 개선 |
| `Rename` / `Move` | 이름·위치 변경 |

## Subject

- 마침표 없음
- 영문이면 동사 첫 글자 대문자

## Body (선택)

- 한 줄 72자 이내
- "어떻게"보다 "무엇을, 왜" 위주로 작성

## Footer (선택)

| 키워드 | 사용 시점 |
|--------|-----------|
| `Fixes` | 이슈 수정 중 |
| `Resolves` | 이슈 해결 완료 |
| `Ref` | 참고 이슈 |
| `Related to` | 관련 이슈 |

## 커밋 분리 원칙

하나의 작업이 여러 관심사에 걸치면 관심사별로 커밋을 나눈다.

| 관심사 | 예시 |
|--------|------|
| 스킬 파일 | SKILL.md 추가·수정 |
| 에이전트 파일 | agent MD 추가·수정 |
| 설정·규칙 | CLAUDE.md, rules/, settings.json, hooks/ |
| 문서 | README.md, docs/, verification.md |

**분리 기준:**
- `[skill]`과 `[agent]`는 항상 별도 커밋
- `[config]` 변경과 `[docs]` 변경은 별도 커밋
- 같은 category 내에서도 변경 목적이 다르면 분리 가능

**하나로 묶어도 되는 경우:**
- 동일 스킬의 SKILL.md + verification.md (한 작업의 산출물)
- 에이전트 추가 + 해당 에이전트 문서

## 예시

```
[agent] Add: agent-creator subagent for generating agent MD files

새로운 서브에이전트를 대화형으로 설계하고 .claude/agents/에 저장.
모델/도구/절차/출력형식을 자동으로 구성함.
```

```
# 여러 관심사가 섞인 경우 — 아래처럼 분리

[skill] Add: Rust 백엔드 스킬 15종 추가
[agent] Add: rust-backend-developer, rust-backend-architect
[config] Improve: skill-creator 검증 프로세스 강화
[docs] Add: 백엔드 스킬 verification.md 15종 및 README 업데이트
```
