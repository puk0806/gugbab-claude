---
name: reference-comux-copad
description: "comux/copad — AI 에이전트 오케스트레이션용 터미널 멀티플렉서. 링크 + 세션 분리·단축키·맥 사용법 (사용자 설치 완료, 2026-08-07)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 062d20b7-4639-4671-bd42-324edc80d2b3
  modified: 2026-08-07T08:16:00.550Z
---

# comux / copad 자료 + 사용법 (2026-08-07)

개발자 marshallku가 만든 AI 에이전트 오케스트레이션 터미널 도구 세트. **사용자가 2026-08-07 맥에 comux 설치 완료, 레포별 세션 분리 워크플로우 학습 중.**

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
