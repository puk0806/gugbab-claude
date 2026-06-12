git status와 git diff --staged를 확인하고, .claude/rules/git.md 컨벤션에 따라 커밋 메시지를 작성한 뒤 커밋을 실행해.

규칙:
- 형식: `[category] Type: Subject`
- category: `agent` | `skill` | `docs` | `config`
- Type: Add / Remove / Fix / Modify / Improve / Refactor / Rename / Move
- Subject: 마침표 없음, 한국어 가능
- 여러 관심사가 섞이면 커밋 분리 여부 먼저 확인
- 푸터에 반드시 포함: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

staged가 없으면 변경된 파일 목록을 보여주고 무엇을 스테이징할지 물어봐.
