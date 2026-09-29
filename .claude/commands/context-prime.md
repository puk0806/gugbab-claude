이 세션의 작업 컨텍스트를 초기화해. 아래 순서로 읽고 상태를 파악한 뒤 요약 보고해.

1. CLAUDE.md 읽기
2. `.claude/rules/` 목록을 먼저 확인(`ls .claude/rules/`)하고 **존재하는 파일만** 읽는다 — 설치 옵션에 따라 없는 규칙이 있다(작성 규칙은 작성 도구 설치 시에만 존재). 우선순위:
   `git.md` → `task-workflow.md` → `info-verification.md` → (있으면) `creation-workflow.md`·`verification-policy.md` → 나머지는 목록만 파악
   (폴더가 없거나 비어 있으면 건너뛴다)
3. git status 확인 (현재 브랜치, 수정 파일 목록)
4. git log --oneline -5 (최근 커밋 5개 — 커밋이 없는 새 레포면 건너뜀)
5. README.md가 있으면 첫 60줄 읽기 (프로젝트 개요·현황 파악용)

보고 형식:
- 현재 브랜치 + 수정 중인 파일
- 마지막 커밋 내용
- 적용 중인 규칙 목록 (읽은 rules 파일명)
- 프로젝트 현황 한 줄 요약 (README 기준)
- 이어서 할 작업이 있으면 제안
