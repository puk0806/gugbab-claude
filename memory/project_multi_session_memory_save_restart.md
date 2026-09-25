---
name: multi-session-memory-save-restart
description: "Claude Code 업데이트 후 열려 있는 세션 전부에 메모리 저장을 요청하고 재시작하는 절차 (2026-09-25 첫 수행, 10개 세션)"
metadata: 
  node_type: memory
  type: project
  originSessionId: a87a2b8e-d761-4539-804f-40bbfdbd0060
  modified: 2026-09-25T04:14:01.594Z
---

Claude Code 업데이트(예: 2.1.281→2.1.282) 직후 사용자가 "모든 세션 메모리 저장시키고 재시작"을 요청할 때의 절차. 2026-09-25에 10개 세션 대상으로 처음 수행했다.

**절차**
1. `ListAgents`로 이 머신의 피어 세션 목록 확보 (이름이 곧 주소, idle/busy 표시됨).
2. `SendMessage`를 세션마다 병렬 호출. 메시지 첫 줄은 "세션 재시작 전 메모리 저장 요청:"처럼 자기완결 문장으로 (상대 터미널엔 첫 줄만 미리보기). 본문에 "저장할 것 없으면 '저장할 항목 없음'만 답하고 종료 / 커밋·푸시 금지"를 반드시 포함.
3. 완료 확인은 두 축으로: ① `ListAgents`의 idle/busy, ② `~/.claude/projects/<해시>/memory/` 파일 mtime (가장 확실). 응답 문구는 최신 `*.jsonl` 트랜스크립트를 tail+grep 해서 읽을 수 있다.
4. **task-workflow 규칙이 있는 프로젝트 세션은 "진행할까요?"에서 멈춘다** (2026-09-25에 04-gugbab-health가 그랬음). 사용자가 전체 저장을 이미 요청한 상태이므로 `SendMessage`로 "진행해 주세요"를 보내 승인하고, `notify_when_idle: true`로 완료 알림을 구독하면 폴링 없이 끝을 알 수 있다.
5. **원격 재시작은 불가.** 프로세스 kill은 가능해도 상대 터미널에 새 프로세스를 띄울 수 없고, Claude가 스스로 세션을 끝내는 기능도 없다. 사용자가 각 터미널에서 `/exit` → `claude -c`(해당 폴더 최신 세션 자동 재개)를 직접 입력해야 한다. 세션↔터미널 매핑은 `pgrep -f '^claude'` + `lsof -p <pid> -d cwd` + `ps -o tty=`로 뽑아 표로 제시하면 편하다.

**Why:** 실행 중인 세션은 메모리에 올라간 옛 바이너리로 계속 돌기 때문에 업데이트가 반영되지 않는다. 재시작 전에 각 세션의 미기록 결정을 memory에 남겨야 컨텍스트 유실이 없다.

**How to apply:** 위 1~5 순서대로. 관련: [[claude-install-environment]] (업데이트 자체의 함정), [[memory-architecture]].
