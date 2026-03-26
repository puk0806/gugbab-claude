# CLAUDE.md — gugbab-claude 프로젝트 규칙

이 파일은 Claude Code가 이 프로젝트에서 작업할 때 항상 따라야 하는 규칙입니다.

---

## 프로젝트 개요

Claude Code 활용에 필요한 에이전트(Agent), 스킬(Skill), 설정(CLAUDE.md)을 만들고 관리하는 레포지토리입니다.

---

## Git 커밋 컨벤션

### 구조

```
type: Subject

body (선택)

footer (선택)
```

카테고리가 명확한 경우 대괄호 prefix 사용:

```
[agent] Add: agent-creator subagent
[skill] Add: deep-researcher skill
[docs] Update: README agent list
```

### Type

| Type | 설명 |
|------|------|
| `Add` | 새로운 에이전트, 스킬, 파일 추가 |
| `Remove` | 파일 및 코드 삭제 |
| `Fix` | 버그 및 오류 수정 |
| `Modify` | 기존 기능 추가 또는 변경 |
| `Improve` | 성능, 품질, 가독성 향상 |
| `Refactor` | 중복 제거, 변수명 변경, 구조 개선 |
| `Simplify` | 코드/내용 단순화 (Refactor보다 가벼운 수정) |
| `Move` | 파일 이동 |
| `Rename` | 파일 또는 코드 이름 변경 |
| `Merge` | 코드 병합 |

### Subject 규칙

- 코드 변경사항에 대한 짧은 요약
- 마침표 및 특수 기호 사용하지 않음
- 영문으로 작성 시 동사를 가장 앞에, 첫 글자는 대문자로 표기
- 한글 작성 가능

### Body 규칙 (선택)

- 한 줄에 72자 이내
- "어떻게"보다 "무엇을, 왜" 변경했는지 작성
- 최대한 자세히 작성

### Footer 규칙 (선택)

이슈 트래커 ID 명시 시 사용:

| 키워드 | 사용 시점 |
|--------|-----------|
| `Fixes` | 이슈 수정 중 |
| `Resolves` | 이슈를 해결했을 때 |
| `Ref` | 참고할 이슈가 있을 때 |
| `Related to` | 해당 커밋에 관련된 이슈가 있을 때 |

### 커밋 예시

```
[agent] Add: agent-creator subagent for generating agent MD files

새로운 서브에이전트를 대화형으로 설계하고 .claude/agents/에 저장하는
에이전트를 추가. 모델/도구/절차/출력형식을 자동으로 구성함.
```

```
[docs] Update: README agent list
```

```
Fix: Correct typo in agent-creator description
```

---

## 파일 및 폴더 규칙

### 에이전트 파일 (.claude/agents/)

- 파일명: `kebab-case.md` (예: `agent-creator.md`, `code-reviewer.md`)
- 반드시 YAML frontmatter 포함 (name, description, tools, model)
- 시스템 프롬프트는 한국어로 작성
- description에 `<example>` 태그로 사용 예시 포함

### 스킬 파일 (.claude/skills/)

- 파일명: `kebab-case.md`
- 에이전트와 달리 YAML frontmatter 불필요
- 메인 대화에 주입할 지식/패턴 중심으로 작성

---

## README 업데이트 규칙

에이전트나 스킬이 추가/수정/삭제될 때마다 README.md도 함께 업데이트합니다.

- 에이전트 추가 → README "에이전트 목록" 섹션에 항목 추가
- 스킬 추가 → README "스킬 목록" 섹션에 항목 추가
- 업데이트 로그 날짜와 변경 내용 기록

---

## 금지 사항

- 민감한 정보(API 키, 토큰, 비밀번호)를 파일에 직접 작성하지 않음
- 테스트되지 않은 에이전트를 main 브랜치에 바로 커밋하지 않음
