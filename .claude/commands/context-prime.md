이 세션의 작업 컨텍스트를 초기화해. 아래 순서로 읽고 상태를 파악한 뒤 요약 보고해.

1. CLAUDE.md 읽기
2. .claude/rules/ 핵심 파일 읽기: git.md, creation-workflow.md, verification-policy.md
3. git status 확인 (현재 브랜치, 수정 파일 목록)
4. git log --oneline -5 (최근 커밋 5개)
5. README.md 첫 60줄 읽기 (현재 에이전트/스킬 현황)

보고 형식:
- 현재 브랜치 + 수정 중인 파일
- 마지막 커밋 내용
- 에이전트/스킬 현황 한 줄 요약
- 이어서 할 작업이 있으면 제안
