# /agent-status

현재 프로젝트의 작업 상태를 한눈에 요약한다.

## 실행 내용

1. 현재 브랜치와 최근 커밋 3개 확인
2. 미커밋 파일 목록
3. PENDING_TEST 상태 스킬 수 확인
4. 오늘 수정된 파일 목록

```bash
git branch --show-current
git log --oneline -3
git status --short
```

PENDING_TEST 스킬 수:
```bash
grep -rl "PENDING_TEST" .claude/skills/ | wc -l
```

오늘 수정된 파일:
```bash
find . -name "*.md" -newer README.md -not -path "*/node_modules/*" | head -10
```

## 출력 형식

```
## 현재 상태 — {브랜치명}

### 최근 커밋
- {해시} {메시지}
- {해시} {메시지}
- {해시} {메시지}

### 미커밋 파일
- {파일 목록 또는 "없음"}

### 스킬 검증 현황
- PENDING_TEST: {N}개
- 확인 필요 시: /tdd-implement 또는 skill-tester 에이전트 사용

### 오늘 작업한 파일
- {최근 수정 파일 목록}
```

인자(`$ARGUMENTS`)가 있으면 해당 카테고리(.claude/skills/{category}/)만 확인한다.
