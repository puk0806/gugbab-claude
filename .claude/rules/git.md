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

## 예시

```
[agent] Add: agent-creator subagent for generating agent MD files

새로운 서브에이전트를 대화형으로 설계하고 .claude/agents/에 저장.
모델/도구/절차/출력형식을 자동으로 구성함.
```
