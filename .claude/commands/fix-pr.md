$ARGUMENTS (PR 번호 또는 URL)의 리뷰 코멘트를 읽고 수정을 적용해.

순서:
1. `gh pr view $ARGUMENTS --comments` 로 코멘트 목록 조회
2. 각 코멘트가 요청하는 변경 사항 파악
3. 파일별로 수정 사항 그룹화
4. 수정 적용 전 요약 보고 + 확인 요청
5. 확인 후 수정 적용 → 커밋 (커밋 메시지: `[docs] Fix: PR 리뷰 반영`)

Resolved 상태인 코멘트는 건너뜀.
$ARGUMENTS가 없으면 현재 브랜치의 열린 PR을 자동 탐색.
