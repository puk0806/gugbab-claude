커밋 실행 전에 **메모리 정리를 먼저 수행**하고, git status와 git diff --staged를 확인한 뒤 .claude/rules/git.md 컨벤션에 따라 커밋 메시지를 작성하고 커밋을 실행해.

## 0단계 — 메모리 정리 (커밋 실행 전 필수)

커밋·푸시 요청을 받으면 실행 전에 항상 아래를 수행한다 (@.claude/rules/memory-sync.md):

1. 이번 작업으로 낡아진 memory 서술이 있는지 스캔 → Write/Edit로 갱신
2. 기록할 가치 있는 신규 결정·피드백이 있으면 memory 파일로 저장 (+ MEMORY.md 인덱스)
3. **세션 요약 최신화**: `node $CLAUDE_PROJECT_DIR/.claude/hooks/session-export.js --refresh` — 이 시점까지의 전체 대화를 exports에 재생성
4. 레포 `memory/` ↔ 전역 `~/.claude/projects/<해시>/memory/` 미러 일치 확인 (`diff -rq`)
5. memory 변경이 있으면 `[memory]` 커밋으로, exports 변경이 있으면 `[export]` 커밋으로 이번 배치에 포함

> **강제됨**: memory/·exports/에 미커밋 변경이 남은 채 `git push`·`gh pr create`를 실행하면 deliverable-guard 훅이 차단한다.

## 커밋 규칙

- 형식: `[category] Type: Subject`
- category: `agent` | `skill` | `docs` | `config` | `memory` | `export`
- Type: Add / Remove / Fix / Modify / Improve / Refactor / Rename / Move (`[export]`는 관례상 `sync: <파일명>`)
- Subject: 마침표 없음, 한국어 가능
- 여러 관심사가 섞이면 커밋 분리 여부 먼저 확인
- 푸터에 반드시 포함: `Co-Authored-By: Claude <현재 모델명> <noreply@anthropic.com>` (예: `Claude Fable 5` — 모델명 하드코딩 금지, 실행 시점 모델로)

staged가 없으면 변경된 파일 목록을 보여주고 무엇을 스테이징할지 물어봐.
