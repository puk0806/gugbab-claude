---
name: reference-wrapper-project-settings-precedence
description: 래퍼(사용자 범위)와 프로젝트 .claude 설정이 함께 있을 때 실제 동작 — 2026-10-19 claude -p 실측 결과
metadata:
  node_type: memory
  type: reference
  originSessionId: d852c16f-4ed9-436a-affa-a1a250d0233a
  modified: 2026-10-19T06:49:46.600Z
---

2026-10-19 실측 (설치본 v1.0.8, Claude Code 2.1.303, scratchpad 임시 프로젝트 + `GUGBAB_DATA` 격리, 래퍼와 같은 `CLAUDE_CONFIG_DIR` 로 `claude -p` 3회).
하네스 조립 폴더 = Claude Code **사용자 범위**, 프로젝트 `.claude/` = 프로젝트 범위 → **둘 다 동작, 겹칠 때만 우선순위**.

- 훅: 하네스·프로젝트·`settings.local.json` 훅이 **모두 실행**(합쳐짐, 덮어쓰기 없음). 하네스 디스패처 SessionStart 도 실행
- 값(`env` 등): `settings.local.json` > 프로젝트 `settings.json` > 하네스
- 권한 deny: 하네스 deny 는 프로젝트·local allow 로 못 풂(3회 모두 거부)
- 같은 이름 스킬·에이전트·룰·커맨드: 조립 때 하네스가 뺌(`.gugbab-state.json` `skippedItems`) → 프로젝트 것만
- 프로젝트 settings 에 `.claude/hooks/<이름>.js` 로 연결된 하네스 훅: 하네스 쪽에서 뺌(`skippedHooks`) → 두 번 안 돎. 근거 `cli/compose.js` `projectWiredHooks`
- 함정: **신뢰 안 한 폴더는 프로젝트 `permissions.allow` 를 무시**(`this workspace has not been trusted` 경고). `env`·훅은 그 상태에서도 적용. 시험 땐 설정 폴더 `.claude.json` 의 `projects[<경로>].hasTrustDialogAccepted=true`

세션 간 메시지(`ListAgents`·`SendMessage`)는 `~/.claude/sessions/<pid>.json` + `/tmp/cc-socks/<pid>.sock` 기반이라 comux·tmux 와 무관 — 같은 Mac·같은 계정이면 어떤 터미널이든 서로 보임(결정 38 로 래퍼 세션도 공유). 실측: comux 칸끼리 00_gugbab-claude ↔ 다른 업무 프로젝트(설정 폴더 다름) 서로 보임. 일반 터미널 앱 단독 확인은 아직.

관련: [[project-shim-wrapper-direction]]
