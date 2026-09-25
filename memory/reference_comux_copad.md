---
name: reference-comux-copad
description: "comux/copad — AI 에이전트 오케스트레이션용 터미널 멀티플렉서. 링크 + 세션 분리·단축키·맥 사용법 (사용자 설치 완료, 2026-08-07)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 062d20b7-4639-4671-bd42-324edc80d2b3
  modified: 2026-09-22T00:16:36.886Z
---

# comux / copad 자료 + 사용법 (2026-08-07)

개발자 marshallku가 만든 AI 에이전트 오케스트레이션 터미널 도구 세트. **사용자가 2026-08-07 맥에 comux 설치 완료, 레포별 세션 분리 워크플로우 학습 중.** 2026-09-17 v1.0.5 → v1.2.0 갱신 완료.

## 설치 형태 · 업데이트 절차 (2026-09-17 실측)

- **풀 설치**(install.sh 경로): `~/Applications/Copad.app` + `~/.local/bin/{comux,coctl,copadd}` + `~/Library/Application Support/copad/plugins/` + LaunchAgent `com.marshall.copad.daemon`. Homebrew 아님(v1.2.0부터 cask·formula 공개됐지만 기존 경로 유지).
- 버전 확인: `coctl --version` (comux에는 `--version`·`version` 서브커맨드 없음, 바이너리 날짜로 판단). 상태바 `⬆ x.y.z` 마커 = 업데이트 있음.
- 갱신: `curl -fsSL https://raw.githubusercontent.com/marshallku/copad/master/install.sh | bash` — Copad.app을 pkill·교체, 바이너리 3종 교체, copadd 데몬 bootout 후 재등록. **실행 중인 comux 서버는 안 건드림**(세션 유지).
- **함정 1**: 스크립트의 `launchctl bootstrap`이 실패해 copadd가 내려간 채 끝날 수 있음 → `launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.marshall.copad.daemon.plist` 수동 실행하면 정상 기동(같은 명령인데 스크립트 안에서만 실패, 원인 미확인).
- **함정 2**: 갱신 후에도 comux 서버 프로세스는 구버전 → `comux server restart`로 새 서버 띄워야 함(레이아웃·에이전트 `--resume` 복원). Claude 세션이 comux 안에서 돌고 있으면(`COPAD_MUX=1`) 재시작이 그 세션도 끊으니 사용자가 직접 타이밍 결정. `comux doctor`가 "health counters unavailable → server restart"로 알려줌.
- **복사(클립보드) 구조**: comux 안 드래그 복사(v1.0.5부터)와 pane 내부 프로그램의 클립보드 쓰기(v1.2.0 OSC 52 패스스루, `osc52 = true` 기본, 읽기는 절대 응답 안 함) 모두 **OSC 52**로 호스트 터미널에 전달됨. 사용자는 macOS **Terminal.app**(`TERM_PROGRAM=Apple_Terminal`)에서 comux를 띄우는데 매뉴얼상 Terminal.app은 OSC 52 미지원 → 두 경로 다 클립보드에 안 들어감. 해법: Copad.app(`open -a Copad`, v1.2.0부터 OSC 52 기본 allow)·iTerm2(Settings→General→Selection "Applications in terminal may access clipboard" 켜기)·kitty/WezTerm/Ghostty 사용, 또는 Shift+드래그로 터미널 네이티브 선택.
- **Terminal.app에서 Claude 답변 복사 (2026-09-17 안내)**: ① Claude Code `/export` → 클립보드(가장 깔끔) ② Fn 또는 Shift 누른 채 드래그 후 ⌘C(Terminal.app에서 어느 키가 통하는지 미검증) ③ `comux capture-pane <idx> -S 200 | pbcopy`(pbcopy는 로컬 프로세스라 OSC 52 불필요, 단 Claude TUI는 보이는 화면 ~60줄만 잡힘 — 실측) ④ `mux.toml`에 `mouse = false` + `comux reload`(휠·클릭 포커스 포기). 사용자는 mux.toml 없이 기본값 사용 중.
- **2026-09-22 확인**: 설치 1.2.0 = GitHub latest v1.2.0(09-14 릴리스). 서버 프로세스도 갱신 후(09-17 07:41) 기동된 1.2.0. 릴리스 조회는 `gh release list -R marshallku/copad`(api.github.com curl은 403).
- **"에이전트 생성" 전용 커맨드는 없음**: 에이전트 = pane에서 `claude`/`codex`를 실행하면 자동 감지. 사람은 새 세션(⌃b C)·탭(⌃b c)·분할(⌃b %)에서 `claude` 실행. 에이전트 안에서 다른 에이전트를 띄울 땐 `comux split --from "$COPAD_MUX_PANE"` → 토큰으로 `send "claude"` + `send $'\n'` → `wait-agent`/`capture-pane`. `comux skill > ~/.claude/skills/comux/SKILL.md`로 운영 가이드 설치 가능(`$COPAD_MUX` 없으면 실행 금지, 인덱스 말고 토큰 주소 사용).
- v1.2.0 주요 추가: 내장 comux 에이전트 스킬, `capture-pane`·`wait-output`·`list-agents`·`wait-agent`·`close-tab`·`kill-session` 컨트롤 커맨드, 닫힌 에이전트 대화 resume 피커(⌃b R), 사이드바 attention 밴드·time-in-status, 호스트 CPU/메모리 탑바(옵션), 분할선 드래그 리사이즈, OSC 52 클립보드 패스스루, "panes inheriting Claude Code session markers" 버그 수정.

## 구성요소

- **comux** — tmux 스타일 멀티플렉서. 단일 정적 바이너리(Rust). 에이전트(Claude Code·Codex) 상태를 사이드바·상태바에 실시간 표시, 턴 완료/입력 대기 시 데스크톱 알림(detach 중에도), 서버 재시작 후 레이아웃·에이전트 자동 복원.
- **copad** — 크로스플랫폼 터미널 에뮬레이터 본체(Linux GTK4/VTE4, macOS Swift+Metal). 플러그인 14종, config.toml 핫리로드.
- **coctl** — copad 스크립트 제어 CLI (`coctl usage --oneline` = Claude/Codex 토큰·비용).

## 핵심 구조 (사용자가 헷갈렸던 부분)

- `comux` 인자 없이 실행 = **하나뿐인 백그라운드 서버에 attach**. 어느 레포에서 실행해도 같은 화면 공유 (여러 클라이언트 동시 attach 시 화면·입력 공유, 최소 터미널 크기 기준). **정상 동작임.**
- 레포별 분리는 **세션(session)** 으로: 서버 하나 안에 세션 여러 개(레포당 1개), 세션 > 탭 > pane 계층.
- 새 세션·탭·분할은 현재 디렉토리 상속 → `cd ~/dev/레포 && comux new-session 이름`이 정석. 서버 없으면 자동 시작.
- v1에는 tmux `attach -t`처럼 특정 세션 지정 attach가 매뉴얼에 없음 → 창 2개로 다른 세션 동시 보기는 안 될 가능성. 한 화면에서 ⌃f 전환이 기본 워크플로우.

## 주요 단축키 (맥: prefix = ⌃b = control+b, ⌘ 아님. 대문자 = shift 포함)

| 동작 | 키 / CLI |
|------|----------|
| 새 세션 (이름 프롬프트) | ⌃b C / `comux new-session <이름>` |
| 세션 전환 퍼지 팝업 | **⌃f** (prefix 없이) — 타이핑=필터, Enter=전환 |
| 다음/이전 세션 | ⌃b ) / ( |
| 세션 종료 (y/n 확인, 안의 에이전트도 죽음) | ⌃b X. 사이드바 우클릭 → kill도 가능 |
| detach (전부 살려둔 채 나가기) | ⌃b d — 재접속은 `comux` |
| 사이드바 (세션+전 세션 에이전트 상태) | ⌃b s |
| 입력 대기 에이전트로 점프 | ⌃b ! |
| 알림 센터 (턴 이벤트 로그, jump/dismiss) | ⌃b a |
| 사이드바 키보드 탐색 모드 | ⌃b e (jk 이동, hl 그룹 전환, Enter 선택, Esc) |
| 세션/탭 이름 변경 | ⌃b $ / ⌃b , (CLI: `rename-session`, `rename-tab`) |
| 새 탭 / 다음·이전 탭 / 탭 닫기 / 탭 점프 | ⌃b c / ⌃b n·p / ⌃b & / ⌃b 1~9 (⌥+1~9는 터미널서 Option=Meta 설정 필요, iTerm2: Left Option key=Esc+) |
| 분할 좌우/상하 | ⌃b % / ⌃b " |
| pane 이동 | ⌃b h/j/k/l, ⌃b o(다음), 또는 ⌃⇧+방향키 (prefix 없이) |
| pane 리사이즈 / 닫기 | ⌃b H/J/K/L / ⌃b x |
| 스크롤백 | ⌃b [ (j/k 이동, ⌃u/⌃d 반 페이지, g 맨위, G·q·Esc 종료) |
| 강제 리페인트 | ⌃b r |
| worktree+세션 동시 생성 | `comux worktree create feat/x` 또는 ⌃b W (인라인 브랜치 프롬프트). `--from <ref>`, 삭제는 `worktree rm <branch> -f -d` |
| pane에 텍스트 주입 (스크립트용) | `comux list`로 인덱스 확인 → `comux send 1 "git status"` |
| 목록/서버 | `comux list-sessions`, `comux server status`, `comux server restart` (레이아웃 복원됨) |

## 설정·복원 (2026-08-07 매뉴얼 확인)

- 설정: `~/.config/copad/mux.toml` (없어도 동작). 대부분 `comux reload`로 라이브 반영. `[keys]`(prefix 바인딩)·`[global]`(prefix-less) 리맵, `prefix = "C-a"` 변경 가능. `[worktree.scripts]`에 레포별 post-create 훅(`"~/dev/레포" = "yarn"` 식, `$WORKTREE_PATH` 제공).
- 복원: 15초마다 자동 저장(`~/.local/state/copad/mux-session.json`). 재시작 시 `restore_processes` 화이트리스트(기본: claude·codex 등 AI 에이전트)만 재실행되고, `restore_agent_sessions = true`(기본)면 `claude --resume <id>`로 **대화 이어서** 복원. 깨끗이 시작하려면 state 파일 삭제.
- 상태바 usage 게이지: Claude 5h+주간/Codex 주간 한도, 60초 폴링, 터미널 100컬럼 이상일 때만 표시. `usage_layout`/`usage_rotate_secs` 등으로 캐러셀 조정.
- 매뉴얼 curl은 브라우저 UA(`-A "Mozilla/5.0..."`)를 주면 통과 확인됨 (WebFetch는 403).

## 링크

- GeekNews: https://news.hada.io/topic?id=31859
- 제작기: https://marshallku.com/dev/road-to-making-my-own-terminal/
- GitHub: https://github.com/marshallku/copad (2026-08 Stars 26 — [[info-verification]] 기준 신뢰도 낮음 주의)
- 매뉴얼: https://copad.marshallku.dev/ (curl은 브라우저 UA 없으면 403. 세션 문서: comux/sessions-tabs-panes.html)
