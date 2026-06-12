# /codex-review — Codex 적대적 코드 리뷰 수동 실행

코딩 작업 완료 후 Codex 적대적 리뷰 워크플로우를 수동으로 시작한다.

@.claude/rules/codex-review.md

위 규칙 파일에 정의된 3단계 확인(CLI 설치·로그인·플러그인 활성화) → 최대 3라운드 핑퐁 워크플로우를 그대로 실행한다.

인자가 없으면 현재 미커밋 변경 사항(`--uncommitted`) 전체를 대상으로 리뷰한다.
