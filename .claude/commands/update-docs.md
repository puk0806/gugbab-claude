최근 코드 변경사항을 기준으로 관련 문서를 업데이트해.

순서:
1. 변경된 파일 목록 확인 — "최근 커밋 + 아직 커밋 안 한 변경"의 합집합 (커밋이 1개뿐이거나 없는 레포도 동작):
   ```bash
   { if git rev-parse -q --verify HEAD~1 >/dev/null; then git diff --name-only HEAD~1 HEAD;
     elif git rev-parse -q --verify HEAD >/dev/null; then git show --name-only --pretty=format: HEAD; fi;
     git status --porcelain | cut -c4-; } | grep -v '^$' | sort -u
   ```
   (`$ARGUMENTS`로 기준 커밋·범위가 주어지면 `git diff --name-only $ARGUMENTS`를 대신 쓴다)
2. 변경된 파일과 연관된 문서 파일 탐색 (README.md, docs/, 해당 모듈의 README·가이드 등 — 이 프로젝트에 실제로 있는 문서만)
3. 문서와 코드 내용 대조 — 불일치 항목 목록 작성
4. 업데이트 필요 항목 요약 보고 후 확인 요청
5. 확인 후 문서 업데이트

범위: 이 프로젝트의 README·docs/ 등 문서 파일 (스킬·에이전트 자산 레포라면 README 목록·업데이트 로그·verification.md 포함).
코드 로직 자체는 수정하지 않음. 커밋은 하지 않는다 (필요 시 `/commit`).
