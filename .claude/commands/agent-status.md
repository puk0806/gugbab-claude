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

PENDING_TEST 스킬 수 — 상태는 SKILL.md 본문이 아니라 `docs/skills/**/verification.md` **frontmatter의 `status:`** 에 있다
(본문의 "PENDING_TEST → APPROVED" 같은 언급·frontmatter 없는 파일은 세지 않는다. `docs/skills/`가 없으면 0):
```bash
CAT=""   # 카테고리 인자가 있으면 CAT="<category>" (영소문자·숫자·하이픈만 허용 — 그 외 값이면 전체 집계)
find "docs/skills/${CAT}" -name verification.md -exec awk '{sub(/\r$/,"")} FNR==1&&$0!="---"{nextfile} FNR>1&&$0=="---"{nextfile} /^status:[[:space:]]*PENDING_TEST[[:space:]]*$/{print FILENAME; nextfile}' {} + 2>/dev/null | wc -l | tr -d " "
```
(목록이 필요하면 `| wc -l | tr -d " "` 를 빼고 실행)

오늘 작업한 파일 (오늘 커밋된 파일 + 현재 미커밋 변경의 합집합 — README mtime 기준 아님):
```bash
{ git log --since=midnight --name-only --pretty=format:; git status --porcelain | cut -c4-; } | grep -v '^$' | sort -u | head -10
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
- 확인 필요 시: skill-tester 에이전트로 2단계 테스트 (작성 도구 설치 시에만 존재 — 없으면 `.claude/rules/verification-policy.md` 절차를 수동 수행, 해당 규칙도 없으면 생략)

### 오늘 작업한 파일
- {최근 수정 파일 목록}
```

인자(`$ARGUMENTS`)가 있으면 해당 카테고리(`docs/skills/{category}/`)만 집계한다 — `^[a-z0-9-]+$` 에 맞지 않는 인자(`../` 등)는 무시하고 전체를 집계한다.
