현재 브랜치의 변경사항을 분석해서 GitHub PR을 생성해.

순서:
1. `git log main...HEAD --oneline` 으로 커밋 목록 확인
2. `git diff main...HEAD --stat` 으로 변경 파일 범위 파악
3. PR title 작성 (70자 이내, 변경 핵심을 한 줄로)
4. PR body 작성:
   - `## Summary` — 변경 내용 bullet 3개 이내
   - `## Test plan` — 검증 방법 체크리스트
   - 하단에 `🤖 Generated with Claude Code` 한 줄
5. 원격 브랜치 push 필요 여부 확인 후 `gh pr create` 실행

main 브랜치로 force push는 절대 하지 않는다. push 전 사용자 확인 필수.
