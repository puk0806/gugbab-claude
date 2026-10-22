# gugbab-claude

`claude` 대신 **`gugbab-claude`** 로 실행하면 훅·룰·스킬·에이전트·커맨드 하네스가 붙은 Claude Code 가 열립니다.

---

## 설치

필요한 것: `git`, `node` 18 이상, [Claude Code](https://code.claude.com)(`claude`, 한 번 로그인해 둔 상태)

```bash
curl -fsSL https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.sh | bash
```

설치 뒤 `command not found: gugbab-claude` 가 나오면 `~/.local/bin` 을 PATH 에 넣고(설치가 알려 준 한 줄을 `~/.zshrc` 등에) 새 터미널을 여세요.

### 제거

```bash
curl -fsSL https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.sh | bash -s -- --uninstall --yes
```

### 윈도우

필요한 것: [Git for Windows](https://git-scm.com/download/win)(훅이 Git Bash 로 돕니다 — 없으면 안전 가드가 동작하지 않음), `node` 18 이상, Claude Code(한 번 로그인). PowerShell 에서:

```powershell
irm https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.ps1 | iex
```

`~\gugbab` 에 설치하고 `~\gugbab\bin` 을 사용자 PATH 에 넣습니다 — **새 터미널**(PowerShell·cmd·Windows Terminal)에서 `gugbab-claude`. 제거·옵션(`-Ref` 브랜치·`-Version`·`-NoModifyPath`):

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.ps1))) -Uninstall -Yes
```

윈도우에서 다른 점 — `/harness` 화면은 새 창에 뜨고, 설정 폴더 연결은 관리자 권한 없이 되는 방식(폴더 junction·파일 하드링크)을 쓰며, PowerShell 도구는 꺼 둡니다(안전 가드가 Bash 명령만 보므로). 자세한 내용 → [사용 안내 · 윈도우](./docs/USAGE.md#윈도우)

---

## 사용

```bash
gugbab-claude          # 하네스가 붙은 claude
gugbab-claude --raw    # 하네스 없이 그냥 claude
```

프로젝트에서 처음 실행하면 기본으로 켤 **프리셋**(스택별 스킬·에이전트 묶음)을 고릅니다 — 프로젝트 파일을 보고 추천합니다. 무엇이 처음부터 켜져 있고(기본값), 무엇이 🔒 고정이며, 프리셋마다 무엇이 켜지고 꺼지는지는 **[기본값·고정 목록](./docs/DEFAULTS.md)** 에서 봅니다.

### 켜기·끄기 — `/harness`

세션 안에서 **`/harness`** 를 치면 켜기·끄기 화면이 뜹니다 (comux 안이면 옆 창, tmux 안이면 팝업, 그 밖의 macOS 면 새 터미널 창). 훅·룰·커맨드·에이전트·스킬을 프로젝트마다 켜고 끕니다.

화면은 계획서 체크리스트와 같은 구성의 접고 펼치는 트리입니다 — **종류**(설정·훅·룰·커맨드·에이전트·스킬) → **용도**(예: 훅의 "안전"·"개발 품질", 스킬의 "프론트엔드"·"백엔드") → 항목. 표시는 ✅ 켬 · ⬜ 끔 · 🟨 그룹 안 일부만 켬 · 🔒 고정(끌 수 없음) · 📌 프로젝트의 `.gugbab.json` 이 정함(여기서 못 바꿈).

| 키 | 하는 일 |
|---|---|
| ↑↓ | 이동 |
| → / ← | 펼치기 / 접기 (`a` 모두 펼치기·접기) |
| Space | 켜기·끄기 — 종류·용도에서 누르면 안의 항목 일괄 (🔒 고정은 건너뜀) |
| Tab | 범위 — 이 프로젝트 ↔ 모든 프로젝트 |
| / | 검색 |
| p | 프리셋 고르기 (스택에 맞는 스킬·에이전트를 한 번에) |
| v | 보기 전환 — 종류별 ↔ 스택 블록·묶음별 |
| Enter · q | 저장 · 닫기 |

명령으로도 됩니다 — 세션 안 `/harness off hook:cc-notify` · `/harness preset rust`, 터미널에서 `gugbab-claude on|off <항목>` · `gugbab-claude preset <이름>`.
훅·스킬·커맨드는 바로 반영되고, 룰·에이전트·설정은 `/exit` 하면 래퍼가 대화를 이어서 다시 띄울 때 반영됩니다.

- 처음 상태(기본값)·🔒 고정 목록·프리셋별 🔒/✅/⬜ 표 → [기본값·고정 목록](./docs/DEFAULTS.md)
- 화면 예시·설명칸·범위·`.gugbab.json`(팀 공유)·연관 동작(필수 의존·충돌)·프리셋 표·업데이트·버전·문제 해결 → [사용 안내](./docs/USAGE.md)

---

## 무엇이 들어 있나

| 종류 | 수 | 문서 |
|---|---|---|
| 스킬 | 스킬 (11카테고리, 195종) | [docs/skills/](./docs/skills/README.md) |
| 에이전트 | 에이전트 (9카테고리) 61종 | [docs/agents/](./docs/agents/README.md) |
| 훅 | 훅 (33종) — 확인 절차·위험 명령 차단·비밀 보호·TDD·적대적 테스트·한국어 답변·병렬 안내·Claude Code 버전 확인·래퍼 버전 확인·PR 전 버전 검사 등 | [docs/hooks/](./docs/hooks/README.md) |
| 룰 | 규칙 (14종) | [docs/rules/](./docs/rules/README.md) |
| 커맨드 | 12종 — `/harness` · `/commit` · `/create-pr` · `/create-plan` · `/tdd-implement` 등 | [.claude/commands/](./.claude/commands) |

무엇이 기본으로 켜지고 무엇이 고정인지, 기본·프리셋마다 각 항목이 🔒 고정·✅ 켜짐·⬜ 꺼짐 중 무엇인지는 [기본값·고정 목록](./docs/DEFAULTS.md) 에 정리했습니다. 원본은 [항목 체크리스트](./docs/plans/2026-10-15-harness-item-checklist.md), 항목끼리의 관계(묶음·블록·필수 의존)는 [relations.json](./relations.json) 이 원본입니다.
