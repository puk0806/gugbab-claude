---
description: gugbab 하네스 켜기·끄기 화면(TUI) 열기, 또는 항목·프리셋을 명령으로 켜고 끄기
allowed-tools: Bash(gugbab-claude:*)
---

gugbab 하네스의 켜기·끄기를 돕는다. 래퍼(`gugbab-claude`)가 세션을 띄울 때 `gugbab-claude` 를 PATH 에 넣어 두므로 이름만으로 부른다.

현재 상태:
!`gugbab-claude status`

인자: $ARGUMENTS

- **인자가 없으면** Bash 로 `gugbab-claude harness --open` 을 실행해 켜기·끄기 화면을 띄우고, 결과 문구(comux 옆 창 / tmux 팝업 / 새 터미널 창)를 그대로 전한다. 띄우지 못했으면 출력된 "다른 터미널에서 실행하세요" 명령을 그대로 알려 준다. 위 상태도 한두 줄로 요약한다.
- **`on <항목>` / `off <항목>`** 이면(예: `off hook:cc-notify`, `on bundle:dev-quality`, `on block:rust`) 무엇이 바뀌는지와 범위(이 프로젝트만 / `--all` 모든 프로젝트)를 확인받은 뒤 `gugbab-claude <on|off> <항목> [--all]` 을 실행한다. 사용자가 범위를 이미 말했거나 "바로"라고 했으면 확인 없이 실행한다.
- **`preset`** 이면 `gugbab-claude preset` 으로 목록을 보여 주고, **`preset <이름>`** 이면 범위를 확인한 뒤 `gugbab-claude preset <이름> [--all]` 을 실행한다.
- 명령 출력의 `· ` 줄(안 바뀐 이유 — 🔒 고정, 다른 설정이 덮고 있음 등)은 빼지 말고 그대로 전한다.
- 훅·스킬·커맨드는 바로 반영된다. 룰·CLAUDE.md·에이전트·설정은 `/exit` 하면 래퍼가 대화를 이어서(`--continue`) 다시 시작할 때 반영된다.

화면은 접고 펼치는 트리(큰 갈래 → 묶음·블록 → 항목)다. 키: ↑↓ 이동 · →/← 펼치기·접기 · a 모두 펼치기/접기 · Space 켜기/끄기(묶음·블록·큰 갈래면 일괄) · Tab 범위(이 프로젝트 ↔ 모든 프로젝트) · / 검색 · p 프리셋 · Enter 저장 · q 닫기. 🟨 는 묶음 안 일부만 켜진 상태. 연관 동작(필수 의존·충돌)은 화면 아래 설명칸과 `docs/USAGE.md` "연관 동작". 무엇이 기본으로 켜져 있고 무엇이 🔒 고정인지, 프리셋마다 무엇이 켜지고 꺼지는지 물으면 `docs/DEFAULTS.md`(하네스 폴더 `$GUGBAB_HOME/docs/DEFAULTS.md`)를 근거로 답한다
