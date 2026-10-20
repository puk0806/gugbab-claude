# gugbab-claude 래퍼(shim wrapper) 개편 계획서

> 최종 수정: 2026-10-20 · 상태: **권한 정책 확정 · PoC 1~3번 확인 · 체크리스트 반영(고정 33 · 켬 70 · 끔 216) · 묶음·의존 관리 방안 3+4 확정 · relation-guard 구현 · 개편 범위 gugbab 만(범위 밖 내용 로컬 전용) · **0~2단계 완료(15장) · 4단계 TUI·`/harness`·프리셋 완료(15.6) · 3단계 설치 `install.sh` 완료(15.7) · **5단계 릴리스 v1.0.0·v1.0.1(15.8)**, 실사용 시나리오 16장 · **6단계 옛 복사 설치 삭제(15.9)**** · **윈도우 지원 계획(17장·결정 41, 0단계 PoC 대기)** → 다음: 사용자 1.0.x 실사용 테스트 → 태그 보호
> 대상 레포: `puk0806/gugbab-claude` (PUBLIC, 기본 브랜치 `main`)
> 이 문서와 [항목 체크리스트](2026-10-15-harness-item-checklist.md)가 원본이고, 계획서 페이지(claude.ai 아티팩트)는 이 두 파일로 만든다 — 생성 방법은 맨 끝 "문서 갱신 방법"

---

## 1. 배경과 목표

### 지금 방식의 문제
- `project-install.sh`(2,216줄)로 훅·룰·스킬·에이전트를 **각 프로젝트에 복사**한다.
- 원본이 바뀔 때마다 설치본(01·04·voca 등)을 하나씩 재설치해야 하고, 설치본마다 버전이 어긋난다.
- 기능을 켜고 끄려면 템플릿(0~15)을 다시 골라 재설치해야 한다.

### 목표
1. **설치는 한 줄**: `curl -fsSL .../install.sh | bash`
2. **실행은 `gugbab-claude`**: 감싼 claude가 **프로젝트별 설정 폴더** `~/gugbab/projects/<프로젝트>/.claude`를 쓰며 실행된다. 그냥 `claude`는 기존 `~/.claude` 그대로 — 서로 섞이지 않는다.
3. **자동 최신화**: 실행할 때 GitHub에서 최신 하네스를 받아 반영한다. 재설치 없음.
4. **세션 안 `/harness`**: 훅·룰·스킬·에이전트·모듈을 켜고 끄는 TUI. 필수 항목은 🔒 잠금. 바꾸면 **연 프로젝트의 설정만** 바뀐다(선택하면 모든 프로젝트).
5. **프로젝트 폴더는 건드리지 않음**: 하네스 설정은 전부 `~/gugbab` 안에 둔다. 작업 프로젝트에는 파일이 생기지 않는다 (복사 설치 폐지). git 으로 설정을 공유하고 싶은 프로젝트만 선택적으로 `.gugbab.json` 을 둔다.

---

## 2. 전체 구조

### 2.1 사용자 PC

```
~/.local/bin/gugbab-claude  → ~/gugbab/bin/gugbab-claude (심볼릭 링크)

~/gugbab/                       ← gugbab-claude 레포 clone (자동 업데이트 대상, 직접 수정 금지)
├── bin/gugbab-claude           ← 실행 진입점 (POSIX sh)
├── cli/                        ← Node: update · compose · tui · hook 디스패처
├── harness/                    ← 하네스 원본
│   ├── manifest.json           ← 모든 항목·모듈·잠금 정의
│   ├── CLAUDE.md
│   ├── hooks/  rules/  skills/  agents/  commands/
│   └── commands/harness.md         ← /harness 커맨드
├── profile.json                ← "모든 프로젝트" 켜기/끄기 상태 (git 무시, 업데이트해도 유지)
└── projects/                   ← ★ 프로젝트별 설정 (git 무시)
    ├── my-ui/                  ← 예: ~/…/my-ui 에서 실행할 때
    │   ├── settings.json       ← 이 프로젝트에서 /harness 로 켜고 끈 값 (modules·enable·disable)
    │   └── .claude/            ← 이 프로젝트용 CLAUDE_CONFIG_DIR (래퍼가 조립)
    │       ├── settings.json   ← 조립 결과 (훅은 디스패처 하나로 연결)
    │       ├── CLAUDE.md, rules/, skills/, agents/, commands/  ← 켜진 항목만 심볼릭 링크
    │       └── projects/ → ~/.claude/projects   ← 대화기록·메모리는 그냥 claude 와 공유 (결정 2)
    └── gugbab-claude/          ← 이 레포를 열 때
```

- 프로젝트 이름은 폴더 이름, 같은 이름이 둘이면 경로 해시를 붙여 구분한다 (예: `my-ui-3fa2`). 매핑은 `~/gugbab/projects/index.json`.
- 프로젝트마다 설정 폴더가 따로라서, 프로젝트 A·B 를 동시에 열어도 룰·스킬·에이전트가 서로 섞이지 않는다.

### 2.2 프로젝트 쪽 (선택)

프로젝트 폴더에는 기본적으로 아무것도 만들지 않는다. **git 으로 설정을 공유하고 싶은 프로젝트만** 아래 파일을 둔다(예: gugbab-claude 레포 자신).

```json
// <프로젝트>/.gugbab.json  (선택 — 있으면 ~/gugbab/projects/<프로젝트>/settings.json 보다 먼저 적용)
{
  "modules": ["java-legacy", "seo-geo"],
  "lock": ["skill-md-guard"],
  "disable": ["codex-review-guard"]
}
```

- 지금의 설치 템플릿 0~15 선택을 `modules` 가 대신한다.
- 프로젝트의 기존 `.claude/`(프로젝트 고유 설정)는 claude가 원래대로 함께 읽는다 — 래퍼는 건드리지 않는다.

---

## 3. 설치 — `curl | bash`

### 3.1 사용법

```bash
# 기본 설치 (stable 최신 태그)
curl -fsSL https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.sh | bash

# 옵션 전달
curl -fsSL https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.sh | bash -s -- --version v1.2.0
curl -fsSL https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.sh | bash -s -- --channel main --dir ~/gugbab

# 제거
curl -fsSL https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.sh | bash -s -- --uninstall
```

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `--ref <브랜치\|태그>` | (없음) | **2026-10-17 추가** — 받을 브랜치·태그. 브랜치면 `branch` 채널로 그 브랜치를 계속 따라 최신화 (PR 머지 전 시험용) |
| `--version vX.Y.Z` | (없음) | 특정 버전으로 설치·고정 (자동 업데이트 중지) |
| `--channel stable\|main` | `stable` | 업데이트를 받을 채널. stable = `v*` 태그 중 최신 |
| `--dir PATH` | `~/gugbab` | 설치 위치 |
| `--bin-dir PATH` | `~/.local/bin` | 실행 파일 링크 위치 |
| ~~`--share-history`~~ | — | 2026-10-17 구현에서 뺌 — 대화기록·메모리는 항상 공유(결정 2, 조립이 `projects/` 링크) |
| `--yes` | 끔 | 묻지 않고 진행 (제거 확인 포함, CI·비대화) |
| `--uninstall` | — | 링크·설치 폴더 제거 (대화기록 폴더는 묻고 삭제) |

### 3.2 install.sh 동작 순서

1. **안전장치**: 스크립트 전체를 `main()` 함수로 감싸고 맨 끝에서 호출한다 — 다운로드가 중간에 끊겨 반쪽만 받아져도 실행되지 않는다. `set -euo pipefail`. **sudo 사용 안 함**.
2. **필수 도구 확인**: `git`, `node`(18+), `claude`. 없으면 설치 방법을 안내하고 중단.
3. **추가 도구 불필요**: `/harness` 은 comux·tmux·일반 터미널을 자동 판별하므로 tmux 설치를 요구하지 않는다 (5장).
4. **받기**: `~/gugbab`이 없으면 `git clone --branch <태그> https://github.com/puk0806/gugbab-claude.git ~/gugbab`. 이미 있으면 업데이트로 처리.
5. **CLI 의존성**: `cd ~/gugbab/cli && npm ci --omit=dev` (TUI 라이브러리). 실패 시 TUI 없이 동작하도록 표시.
6. **실행 파일 연결**: `~/.local/bin/gugbab-claude` 심볼릭 링크. PATH에 없으면 셸 설정(`~/.zshrc` 등)에 추가할 한 줄을 안내 (자동 수정은 묻고 진행).
7. **초기 프로필**: `profile.json`이 없으면 manifest 기본값으로 생성.
8. **대화기록 공유 설정** (결정 2).
9. **첫 조립**: `gugbab-claude doctor`를 실행해 결과 표시 → "이제 `gugbab-claude`로 실행하세요" 안내.

> 질문은 `curl | bash`에서 표준입력이 스크립트로 쓰이므로 `/dev/tty`에서 읽는다. `/dev/tty`가 없으면(CI) 기본값 사용.

### 3.3 릴리스 방식 (결정 28 — npm 아님, GitHub 태그)
- `main` 머지 후 안정 버전에 `v1.2.0` 같은 태그를 단다 → stable 채널 사용자가 다음 실행 때(1시간에 한 번 확인) 받는다. 바로 받으려면 `gugbab-claude update`.
- 버전 규칙: 설정·이름이 호환 안 되게 바뀌면 X, 기능 추가 Y, 수정 Z.
- GitHub Release는 변경 내역 표시용으로 함께 만든다 (`gh release create vX.Y.Z --generate-notes`). 배포 파일(tarball)은 필요 없다 — git 태그 clone으로 받는다.
- 첫 릴리스 테스트 동안은 `v1.0.0` 하나만 쓰고, 버그 수정은 태그를 고친 커밋으로 옮긴다(원격 태그를 덮어쓰는 작업이라 사용자 승인 필요, 태그 보호 켜기 전에만). 정상 확인 후 태그 보호를 켜고 그 뒤로는 새 버전만 단다.

---

## 4. 실행 흐름 — `gugbab-claude`

```
$ gugbab-claude [claude 인자 그대로 전달]
 ① 업데이트 확인
    · 마지막 확인 후 1시간 지났을 때만 git fetch (3초 제한, 실패·오프라인이면 건너뜀)
    · 채널(stable 태그 / main)에서 더 새 버전이 있으면 fast-forward로만 갱신
    · 로컬 변경·non-ff면 갱신 거부 + 경고 (덮어쓰지 않음)
    · 갱신 시 "하네스 v1.4.0 → v1.5.0" 한 줄 + 변경 요약 표시
 ② 프로젝트 확인
    · 현재 폴더의 git 최상위(없으면 현재 폴더)를 프로젝트로 보고 ~/gugbab/projects/<프로젝트>/ 를 찾거나 만든다
 ③ 조립 (compose)
    · manifest.json(체크리스트 기본값·고정) + profile.json(모든 프로젝트) + projects/<프로젝트>/settings.json + (있으면) <프로젝트>/.gugbab.json
    · → ~/gugbab/projects/<프로젝트>/.claude 의 링크·settings.json 재생성 (바뀐 게 없으면 건너뜀)
 ④ 실행
    · 지금 있는 터미널(comux 창·tmux 창·일반 터미널) 그대로 실행 — 래퍼가 멀티플렉서를 새로 띄우지 않음
    · CLAUDE_CONFIG_DIR=~/gugbab/projects/<프로젝트>/.claude CLAUDE_SECURESTORAGE_CONFIG_DIR= claude "$@"
      (두 번째 변수를 빈 값으로 줘야 그냥 claude 의 로그인을 그대로 쓴다 — 없으면 설정 폴더마다 다시 로그인. 10장 PoC 1번)
    · 반복 실행 구조: claude 가 끝났을 때 "재시작 요청" 표시가 있으면 claude --continue 로 다시 띄움 (대화 유지)
```

### 부가 명령

| 명령 | 하는 일 |
|---|---|
| `gugbab-claude config` | TUI (세션 밖에서도 실행 가능) |
| `gugbab-claude update [--version vX]` | 지금 바로 갱신 / 특정 버전 고정 / `--unpin` |
| `gugbab-claude doctor` | 설치·조립 상태 점검 (링크 깨짐, 훅 파일 누락, node·claude 버전, comux/tmux 감지, **로그인 공유** — `CLAUDE_SECURESTORAGE_CONFIG_DIR` 는 문서에 없는 내부 변수라 claude 업데이트 후 동작이 바뀔 수 있어 매번 확인) |
| `gugbab-claude status` | 현재 버전·채널·켜진 모듈·이 프로젝트 적용 항목 |
| `gugbab-claude --raw …` | 하네스 없이 claude 실행 (문제 해결용) |
| `gugbab-claude uninstall` | 제거 |

---

## 5. `/harness` — 세션 안 켜기/끄기 TUI

### 5.1 동작 — 실행 환경을 보고 자동 선택
프로젝트 설정 폴더의 `commands/harness.md` 가 셸 실행으로 `gugbab-claude harness` 을 부르고, 이 명령이 환경을 판별해 TUI 를 띄운다.

| 환경 (판별 기준) | TUI 를 띄우는 방법 |
|---|---|
| **comux 안** (`$COPAD_MUX` 있음) | `comux split --from "$COPAD_MUX_PANE"` 으로 claude 옆에 창을 나누고 `comux send` 로 `gugbab-claude config --session; exit` 실행 → TUI 를 닫으면 창도 닫힘 |
| **tmux 안** (`$TMUX` 있음) | `tmux display-popup -E gugbab-claude config --session` 으로 claude 화면 위 팝업 |
| **둘 다 아님** | macOS 면 새 터미널 창(osascript)에서 TUI 실행, 그 외엔 "다른 터미널에서 `gugbab-claude config`" 안내 |

- 화면 출력을 파싱하지 않고 각 도구의 공식 명령만 쓰므로 claude·comux 업데이트에 영향을 덜 받는다.
- comux 명령(`split --from`·`send`)은 2026-10-15 설치된 comux 에서 존재 확인. comux 에는 팝업 명령이 없어 창 나누기 방식을 쓴다.

### 5.2 화면 (2026-10-17 구현 — Node 기본 readline, 의존성 없음 · 결정 24)

```
 gugbab 하네스 · my-ui                 범위: [이 프로젝트]  모든 프로젝트
 ── 모듈 ─────────────────────────────────
 🔒 core            필수 가드 (bash-guard·protect-secrets …)
 [x] dev            TDD·적대적 테스트 가드
 [ ] typescript
 [x] java-legacy    스킬 23 · 에이전트 2 · 룰 1
 [ ] seo-geo
 [ ] codex-review
 ── 개별 항목 (모듈 안에서 더 끄기) ──────
 [x] 훅 task-confirm-guard
 [ ] 훅 staleness-check
 [x] 룰 git.md
 …
 Space 토글 · Tab 범위 전환 · / 검색 · Enter 저장 · Esc 취소
```

- **바뀌는 범위 (2026-10-15 확정)**: 기본은 **연 프로젝트만** — `~/gugbab/projects/<프로젝트>/settings.json` 에 저장. 위쪽에서 "모든 프로젝트" 를 고르면 `~/gugbab/profile.json` 에 저장(gugbab-claude 레포는 제외). 프로젝트 폴더에는 아무것도 안 생긴다.
- 같은 프로젝트를 세션 여러 개로 열면 설정 하나를 같이 쓴다(한 세션에서 끄면 다른 세션에도 적용). 다른 프로젝트는 영향 없음.
- 🔒 항목은 선택 불가, 이유 표시 — 체크리스트 고정 + 그 프로젝트 `.gugbab.json` 의 `lock`
- **적용 순서**: 🔒 고정(체크리스트) > 프로젝트 `.gugbab.json`(있으면, `lock` 포함) > 연 프로젝트 설정 > 모든 프로젝트(`profile.json`) > 체크리스트 기본값

### 5.3 반영 시점

| 항목 | 반영 | 방법 |
|---|---|---|
| 훅 | **즉시** | 디스패처가 실행 때마다 상태를 읽음 (6장) |
| 스킬·커맨드 | 즉시 가능성 있음 | PoC에서 확인 |
| 룰·CLAUDE.md·에이전트 | 재시작 필요 | TUI 가 "재시작 요청" 표시를 남기고 "`/exit` 하면 이어서 다시 시작됩니다" 안내 → 래퍼의 반복 실행 구조가 `claude --continue` 로 다시 띄움 (대화 유지, 터미널 종류와 무관) |

---

## 6. 훅 디스패처

### 6.1 왜 필요한가
settings.json에 훅을 26개 개별 연결하면 켜고 끌 때마다 settings.json을 다시 써야 하고, 실행 중 세션 반영이 불확실하다. 이벤트별로 **디스패처 하나만** 연결한다.

```json
"PreToolUse": [{ "matcher": "*", "hooks": [{ "type": "command",
  "command": "node \"$HOME/gugbab/cli/hook.js\" PreToolUse" }] }]
```

### 6.2 동작
1. stdin(훅 입력 JSON)을 한 번 읽는다.
2. `manifest.json`에서 그 이벤트 + `tool_name`이 matcher에 맞는 훅을 순서대로 고른다.
3. 5.2 의 적용 순서(체크리스트 고정·기본값 + `profile.json` + `projects/<프로젝트>/settings.json` + 있으면 `.gugbab.json`)로 켜진 것만 남긴다. 실행할 때마다 읽으므로 `/harness` 변경이 즉시 반영된다. **🔒 잠금 훅은 꺼져 있어도 항상 실행.**
4. 각 훅을 같은 stdin·환경변수로 실행한다 (`CLAUDE_PROJECT_DIR` 그대로 전달 → 훅이 검사할 대상 프로젝트는 지금과 동일).
5. 결과 합치기 규약:
   - 하나라도 exit 2 → 즉시 중단하고 그 stderr로 exit 2 (차단)
   - stdout JSON의 `permissionDecision`은 deny > ask > allow 우선
   - `additionalContext`는 이어붙임
   - 훅 자체 오류(exit 1·크래시)는 지금과 같은 비차단 처리 + `~/gugbab/logs/hook-errors.log` 기록 (프로젝트 이름 포함)
6. 시간 제한: 훅별 timeout을 manifest에 두고 초과 시 비차단 처리 (잠금 훅은 manifest에 fail-closed 지정 가능).

### 6.3 테스트 (적대적 포함 — adversarial-testing.md 준수)
- 정상: 켜진 훅만 실행, 순서 보장, 결과 합치기
- 악성·우회: profile에서 잠금 훅을 꺼도 실행되는가 / `.gugbab.json`에 manifest에 없는 훅 경로(`../../evil.js`) 넣기 → 거부 / 변조된 manifest(존재하지 않는 파일, 절대경로) → 거부
- 경계: 빈 stdin, 깨진 JSON, 훅 timeout, 동시 실행, 공백 포함 경로

---

## 7. manifest.json

```jsonc
{
  "version": "1.0.0",
  "modules": {
    "core":         { "locked": true,  "default": true,  "description": "필수 가드" },
    "dev":          { "default": true },
    "typescript":   { "default": false },
    "legacy":       { "default": false, "conflicts": ["dev:tdd-guard"] },
    "java-legacy":  { "default": false },
    "seo-geo":      { "default": false, "addon": true },
    "codex-review": { "default": false }
  },
  "hooks": [
    { "id": "bash-guard", "file": "hooks/bash-guard.js", "event": "PreToolUse", "matcher": "*", "module": "core", "locked": true },
    { "id": "tdd-guard",  "file": "hooks/tdd-guard.js",  "event": "PreToolUse", "matcher": "Write|Edit", "module": "dev" }
  ],
  "rules":    [{ "id": "git",  "file": "rules/git.md",  "module": "core" }],
  "skills":   [{ "id": "mybatis-mapper-patterns", "module": "java-legacy" }],
  "agents":   [{ "id": "java-backend-developer", "file": "agents/backend/java-backend-developer.md", "module": "java-legacy" }],
  "commands": [{ "id": "harness", "module": "core", "locked": true }],
  "settings": { "permissions": { "defaultMode": "acceptEdits", "allow": ["…"], "deny": ["…"] } },
  "plugins":  { "superpowers@superpowers-marketplace": { "module": "core" }, "codex@openai-codex": { "module": "codex-review" } }
}
```

- 지금 `project-install.sh`의 템플릿 정의와 `gen-settings.js`의 옵션(`--dev`·`--typescript`·`--legacy`·`--memory`·`--codex`·`--readme-guard`·`--staleness-guard`·`--branch-protection`)을 이 파일로 옮긴다.
- 모듈 매핑 초안:

| 기존 | 새 모듈 |
|---|---|
| 템플릿 0~15 (스택별) | `react-next`, `java-legacy`, `java-modern`, `rust`, `python-fastapi`, `unity`, `dream-app`, `fortune-app`, `nexacro` … (번호 대신 이름) |
| 애드온 11 seo-geo, 14 spec-extraction | `seo-geo`, `spec-extraction` |
| `--dev` / `--typescript` / `--legacy` | `dev` / `typescript` / `legacy` |
| `--codex` | `codex-review` |
| `--memory` | `memory-sync` |
| `--readme-guard` · `--staleness-guard` · `--branch-protection` | 각각 개별 토글 |
| 이 레포 전용 개발 규칙·가드 (creation-workflow·verification-policy·skill-md-guard·verification-guard·deliverable-guard 등) | `harness-authoring` — 이 레포의 `.gugbab.json`에서만 켬 |

---

## 8. gugbab-claude 레포 변경안

| 현재 | 변경 후 |
|---|---|
| `.claude/hooks/*.js` — `$CLAUDE_PROJECT_DIR/.claude/hooks/…`로 참조 | `harness/hooks/*.js` — 디스패처가 실행. 훅 내부의 대상 프로젝트 참조(`CLAUDE_PROJECT_DIR`)는 유지, 훅 자기 위치 기준 경로(`__dirname` 등)만 점검 |
| `.claude/skills` · `agents` · `commands` · `rules` | `harness/` 아래로 이동 |
| 루트 `CLAUDE.md` (이 레포 개발 규칙) | 공통 부분 → `harness/CLAUDE.md`, 이 레포 전용 부분 → 레포 루트에 유지 |
| `project-install.sh` (2,216줄) · `setup.sh` | 템플릿 정의 → `manifest.json`으로 추출 후 **폐기** (이전 기간 동안만 유지) |
| `scripts/gen-settings.js` | `cli/compose.js`로 전환 (권한 목록 로직 재사용) |
| `scripts/*-cleanup`, `prune-*`, `write-install-manifest` 등 설치 관련 스크립트·테스트 | 폐기 또는 manifest 검증 테스트로 교체 |
| 신규 | `install.sh`(curl 설치), `bin/gugbab-claude`, `cli/{update,compose,tui,hook,doctor}.js`, `cli/package.json`, `harness/manifest.json`, `harness/commands/harness.md`, `.gitignore`에 `projects/`(런타임)·`profile.json` 추가 |
| memory-sync / memory-pull | 메모리 경로가 프로젝트별 `CLAUDE_CONFIG_DIR` 아래로 바뀌지만 `projects/` 를 `~/.claude/projects` 에 링크하므로 실제 위치는 그대로 — 경로 계산이 링크를 따라가는지 점검 |
| 이 레포 자신의 개발 환경 | 이 레포도 `gugbab-claude`로 실행 — 레포의 `.gugbab.json`(git 커밋)에 스킬 제작 검사 등 `lock`. 개발 중인 작업 트리를 그대로 쓰도록 `GUGBAB_HOME=$(pwd)` 개발 모드 지원 |
| `docs/plans/page/` (체크리스트 페이지 생성기) | **하네스 기본값 관리 도구로 상시 유지** (2026-10-15 결정). 고정·켬·끔을 바꿀 때 페이지에서 고르고 → Claude 가 저장값을 읽어 → 체크리스트 원본과 `manifest.json` 의 `locked`·`default` 에 반영 → 다음 `gugbab-claude` 실행 때 모든 PC 에 퍼짐. 1단계에서 `manifest.json` 을 체크리스트에서 생성하도록 연결 |

### 이 레포 개발 모드 (중요)
`~/gugbab`은 배포본(자동 업데이트)이고 이 레포는 개발 원본이다. 이 레포에서 작업할 때는:
```bash
GUGBAB_HOME="$PWD" gugbab-claude      # 작업 트리의 harness/를 바로 사용, 자동 업데이트 끔
```

---

## 9. 진행 단계

| 단계 | 내용 | 완료 기준 |
|---|---|---|
| **0. PoC** | 세션 임시 폴더에서 10장 확인 항목 검증 (레포 수정 없음) | 항목별 결과 확보, 막힌 항목은 설계 수정 |
| **1. 구조 이동 + 정리** | `harness/` + `manifest.json` 추출 (항목 체크리스트 결과 반영). 이 레포 `.gugbab.json` 초안 작성 — 하네스 제작용 16개 중 이 레포에서 꼭 켜둘 것을 `lock`·`enable` 로. 기존 `.claude/`는 `harness/`로의 링크로 유지해 지금 동작 보장. 루트의 하네스 무관 폴더는 폴더별로 확인받고 정리. `statusline.sh` 결함 2건 수정(① pending 숫자가 틀림 — 실제 PENDING_TEST 15개인데 `.claude/skills` 본문의 예시 글자까지 세어 1 로 나옴 → `docs/skills/**/verification.md` frontmatter `status:` 기준으로 ② ` \| ` 구분자가 공백으로 나오는 문제) · `instructions-loaded` 훅 폐지 · `relations.json` 을 manifest 의 `bundles`·`requires`·`conflicts`·`blocks` 로 합치고 템플릿 결과로 블록 구성원 확정(14.4) | 기존 테스트 274개 통과 + manifest 정합성 테스트 + `relations.test.js` |
| **2. 래퍼 핵심** | `bin/gugbab-claude`, update, compose, hook 디스패처 + 적대적 테스트. 12장 권한 정책을 auto-approve 에 반영. 조립·`/harness` 에 14장 처리 순서(A→B→C→B 재검사)와 필수 의존 자동 포함 + 경고, 디스패처의 `GUGBAB_ENABLED` 전달 | 이 레포에서 개발 모드로 실제 작업 가능 |
| **3. 설치** | `install.sh` (`curl \| bash`), `--version`·`--channel`·`--uninstall` + 테스트(빈 HOME 컨테이너/임시 HOME에서 설치·재설치·제거) | 새 HOME에서 한 줄 설치 → 실행 성공 |
| **4. TUI + /harness** | comux 창 나누기 · tmux 팝업 · 새 터미널 창 3가지 경로, 범위 전환, 재시작 흐름 | comux 안에서 실제 화면으로 토글 확인 (사용자 확인 포함) |
| **5. 첫 릴리스** | `v1.0.0` 태그 + GitHub Release | stable 채널로 설치·업데이트 확인 |
| **6. 이전** | 설치본(01·04·voca)의 복사된 하네스 제거 → 각 프로젝트에서 `gugbab-claude` 로 열어 `/harness` 로 모듈 선택(설정은 `~/gugbab/projects/` 에 저장). gugbab-claude 레포는 `.gugbab.json`(스킬 제작 검사 `lock`)을 커밋. `project-install.sh` 삭제 | 세 프로젝트 정상 동작, 프로젝트 폴더에 하네스 파일 없음 |
| **7. 문서** | README·rules·docs 동기화, 업데이트 로그 | — |

각 단계는 별도 브랜치·PR로 진행하고, 커밋은 요청 시에만 한다.

---

## 10. PoC 확인 항목 (0단계)

| # | 확인할 것 | 실패 시 대안 |
|---|---|---|
| 1 | `CLAUDE_CONFIG_DIR` 변경 시 재로그인 필요 여부 — **프로젝트마다 설정 폴더가 다를 때도 로그인이 공유되는가** (프로젝트마다 다시 로그인하면 안 됨)<br>**2026-10-16 확인 (claude 2.1.296): `CLAUDE_CONFIG_DIR` 만 바꾸면 "Not logged in"** — 키체인 이름이 `Claude Code-credentials-<설정 폴더 경로 해시 8자>` 로 바뀌기 때문. **`CLAUDE_SECURESTORAGE_CONFIG_DIR=`(빈 값)을 함께 주면 기본 키체인 항목을 그대로 써서 로그인 공유됨** (새 키체인 항목 안 생김). 문서에 없는 내부 변수라 `doctor` 가 매번 점검 | ① 로그인 정보 파일만 공용 위치로 링크 ② 그래도 안 되면 설정 폴더를 하나(`~/gugbab/.claude`)로 두고 프로젝트별 차이는 디스패처·`--settings`·`--add-dir` 로 주입 (초기 설계로 후퇴) |
| 2 | 그 폴더의 skills·agents·commands·rules·CLAUDE.md·settings 훅이 모두 로드되는가<br>**2026-10-16 확인: 통과** — CLAUDE.md·`rules/` 내용이 시스템 프롬프트에 들어가고, 스킬·에이전트 호출, 커맨드 실행, settings.json 훅(UserPromptSubmit) 실행 모두 됨. 설정 폴더마다 `.claude.json`(첫 실행 상태 등)이 따로 생김 | 로드 안 되는 종류만 `--settings`·`--append-system-prompt-file`·`--add-dir`로 주입 |
| 3 | 심볼릭 링크로 넣은 skills·rules가 인식되는가<br>**2026-10-16 확인: 통과** — 항목별 링크(스킬 폴더·에이전트·커맨드·룰 파일·CLAUDE.md·settings.json) 모두 인식, 실행 후에도 링크 유지. 단 `settings.json` 은 Claude 가 설정 저장 시 덮어쓸 수 있으므로 조립 때 **일반 파일로 생성** | 링크 대신 복사(조립 시) |
| 4 | 디스패처 방식에서 exit 2 차단·JSON 결정이 정상 전달되는가<br>**2026-10-16 확인: 통과** — 디스패처 하나를 거쳐도 exit 2 차단(stderr 그대로), PreToolUse JSON `permissionDecision: deny`, UserPromptSubmit `additionalContext` 모두 claude 까지 전달 | 훅별 개별 연결 + 조립 시 settings 재생성 |
| 5 | 커스텀 커맨드의 셸 실행에서 `comux split --from` + `send` 로 옆 창에 TUI 를 띄울 수 있는가 (tmux 는 `display-popup`) — 4단계에서 확인 | comux 단축키(mux.toml `[keys]`)로 TUI 실행 |
| 6 | 스킬·커맨드 변경이 실행 중 세션에 즉시 반영되는가<br>**2026-10-16 확인: 통과** — 세션이 떠 있는 동안 설정 폴더에 새 커맨드·스킬을 넣자 바로 `/커맨드` 실행·스킬 목록에 나타남 (재시작 불필요). 룰·CLAUDE.md·에이전트는 재시작 대상으로 유지 | 재시작 흐름에 포함 |
| 7 | `/exit` 후 래퍼 반복 실행으로 `claude --continue` 가 대화를 이어가는가<br>**2026-10-16 확인: 통과** — `-p` 로 단어 기억 → `--continue` 로 기억 확인, 래퍼 대화형 실측(룰 끄기 → 재시작 표시 → `/exit` → 래퍼가 `--continue` 로 다시 띄움 → 이전 대화 기억)까지 통과. `-p`(한 번 실행)는 대화형으로 바뀌지 않게 다시 띄우지 않고 안내만 | "재시작 필요" 안내만 표시 |
| 8 | 대화기록 공유용 `projects/` 링크가 문제없는가<br>**2026-10-16 확인: 통과** — 대화기록이 원래 `~/.claude/projects/<인코딩>/` 에 쌓임. 단 훅에 들어오는 경로가 링크 경로(`설정폴더/projects/…`)라 메모리·계획 경로 판정 훅 3개(task-confirm-guard·auto-approve·session-export)를 실제 위치 기준으로 고침 | 분리 운영 + 메모리만 동기화 |
| 9 | `curl \| bash`에서 `/dev/tty` 질문이 동작하는가 — 3단계에서 확인 | `--yes` 기본값 + 설치 후 `gugbab-claude config` |
| + | 플러그인을 `plugins/` 링크로 넣으면 보이는가<br>**2026-10-16 확인: 통과** — `claude plugin list` 에 superpowers·codex·vercel 이 그대로 보이고 `superpowers:brainstorming` 스킬 사용 가능. 켜고 끄기는 조립한 `settings.json` 의 `enabledPlugins` 로 | 조립 때 플러그인 설정 복사 |
| + | 설정 폴더마다 첫 실행 화면이 다시 나오는가<br>**2026-10-16 확인: 나옴 → 해결** — 새 설정 폴더는 테마 선택(온보딩)이 다시 뜸. 조립 때 `~/.claude.json` 의 `hasCompletedOnboarding`·`lastOnboardingVersion`·`theme` 과 그 폴더의 `hasTrustDialogAccepted` 만 옮기면 바로 입력 화면 (계정 정보 등 다른 값은 옮기지 않음). 처음 여는 폴더의 신뢰 확인은 그냥 `claude` 와 같이 한 번 뜸 | — |

---

## 11. 한계와 위험

| 항목 | 내용 | 대응 |
|---|---|---|
| 잠금 범위 | 잠금은 래퍼 안에서만 유효. 그냥 `claude`로 실행하면 하네스 미적용 | 개인·팀 편의 목적이므로 수용 |
| 실행 경로 | VS Code 확장·데스크톱 앱은 래퍼를 거치지 않음 | 터미널(comux·tmux 포함) 전용으로 명시 |
| claude 업데이트 | 환경변수·플래그·커맨드 문법 변경 시 영향 | 공식 문서에 있는 것만 사용, 화면 파싱 금지, `doctor`에서 claude 버전 경고 |
| 공급망 | 원격에서 받은 코드가 훅으로 실행됨 | 내 레포 고정, stable 태그, fast-forward만, `--version` 고정 옵션, 변경 요약 표시 |
| comux 변경 | comux 는 개인 프로젝트(Stars 적음)라 명령이 바뀔 수 있음 | `doctor` 가 `comux split`·`send` 존재를 점검, 실패하면 새 터미널 창 방식으로 대체 |
| 동시 세션 | 프로젝트 A·B를 동시에 열 때 설정이 섞이는 문제 | **해결 — 프로젝트별 설정 폴더**(`~/gugbab/projects/<프로젝트>/.claude`)라 섞이지 않음. 단 PoC 1번(로그인 공유)이 통과해야 함 |
| 프로젝트 이동 | 프로젝트 폴더를 옮기거나 다른 PC 에서 쓰면 그 프로젝트 설정을 다시 해야 함 | git 공유가 필요한 프로젝트만 `.gugbab.json` 사용. `doctor` 가 경로가 사라진 프로젝트 설정을 알려줌 |

---

## 12. 권한 정책 (2026-10-15 확정)

권한은 세 곳이 함께 정한다: settings.json 의 allow/deny 목록, `auto-approve` 훅(도구 단위), `bash-guard` 훅(Bash 명령 단위). 래퍼에서도 이 구조를 그대로 가져가고 core 모듈(🔒)에 둔다.

### 12.1 자동 허용 (확인 창 없음)

| 대상 | 조건 |
|---|---|
| Read · Glob · Grep | 항상 (개인키·클라우드 인증 파일 읽기만 12.3 차단) |
| Write · Edit · NotebookEdit | 프로젝트 안, `/tmp`·`/var/folders`, 메모리 폴더, 계획 폴더 |
| Artifact | 게시·읽기·열기·목록 (삭제만 12.2) |
| Agent · Skill · Workflow · Monitor · TodoWrite · WebSearch · WebFetch · EnterWorktree · ExitPlanMode · ShareOnboardingGuide | 항상 |
| MCP 도구 | 삭제·공유 계열(12.2)을 뺀 전부 — 크롬 브라우저 조작, Claude Docs 수정 포함 |
| Bash | 12.2·12.3 에 걸리지 않는 모든 명령 (`bash-guard` 가 승인). settings.json 의 Bash 허용 41개는 `bash-guard` 가 없을 때를 대비한 예비 목록 |
| **신규 자동 허용** | ArtifactData(삭제만 확인) · ArtifactComments · PushNotification · ExitWorktree · TaskStop · LSP · **SendMessage(2026-10-20 결정 40 — 받는 세션이 확인)** |

### 12.2 확인 창

| 분류 | 항목 |
|---|---|
| 파일 | 프로젝트·허용 폴더 밖 파일 수정 |
| Artifact·MCP | Artifact 삭제, 이름에 delete·trash·share·remove·destroy·purge·unpublish·revoke 가 들어간 MCP 도구, **Google Drive `update_file`(덮어쓰기) — 신규** |
| git·GitHub | `git commit`, `git push`, 판정 불가 `git reset --hard`, `gh` 쓰기(PR·이슈 생성 등)·`gh api` POST/PATCH/DELETE |
| 패키지·권한 | `npm`·`pnpm`·`yarn`·`bun`·`cargo` publish, `sudo`·`doas` |
| 삭제·시스템 | 프로젝트 밖 `rm`, 허용 폴더 통째 삭제, 대상 불명 삭제, `dd`·`mkfs`·`shutdown`·`reboot`·`diskutil erase` |
| 외부 전송·프로세스 | `curl`·`wget` 파일 업로드, `docker prune`·볼륨 삭제, `killall`·`pkill`, 남의 프로세스 `kill -9` |
| 판정 불가 | 명령 이름이 변수라 무엇이 실행될지 모르는 Bash |
| **신규 확인** | CronCreate · CronDelete · RemoteTrigger · DesignSync · PowerShell (SendMessage 는 2026-10-20 자동으로 옮김 — 결정 40) |

### 12.3 차단 (확인 창 없이 거부)

force push · 푸시된 커밋을 지우는 `reset --hard` · `gh repo delete` · 루트·홈·시스템·`.git`·`.claude`·`.ssh`·프로젝트 루트 `rm -rf` · `curl … | bash` 원격 실행 · 포크 폭탄 · `chmod 777` · `.env`·`*.pem`·`*.key`·홈 셸/SSH/git 설정 수정 · 개인키·클라우드 인증 파일 읽기(Bash 포함) · SKILL.md·verification.md·memory 의 Bash 수정

---

## 13. 확정된 결정 (2026-10-15)

| # | 항목 | 결정 |
|---|---|---|
| 1 | 설치 위치 | `~/gugbab/` 에 레포 clone. 설정 폴더는 프로젝트별 `~/gugbab/projects/<프로젝트>/.claude` (13번) |
| 2 | 대화기록·메모리 | 그냥 `claude` 와 **공유** (프로젝트별 설정 폴더의 `~/gugbab/projects/<프로젝트>/.claude/projects` → `~/.claude/projects` 링크) |
| 3 | 업데이트 채널 | **stable 태그** 기본 (`--channel main` 선택 가능) |
| 4 | 레포 | **지금 레포 재구성** |
| 5 | TUI | **Node + `@inquirer/prompts`** |
| 6 | 루트의 하네스 무관 폴더 (`akrasia`, `inBody`, `pdf변환`, `tmp_assets`, `outputs` 등) | **1단계에서 함께 정리** — 폴더별로 유지/이동/삭제 확인받고 진행 |
| 7 | `/harness` 실행 환경 | **comux 우선** 지원, tmux·일반 터미널도 자동 대응. tmux 설치 불필요 |
| 8 | 커맨드 이름 | `/tab` → **`/harness`** (comux·tmux 의 "탭"과 헷갈리지 않게) |
| 9 | 항목별 고정/켬/끔 | 1차(2026-10-15): 추천안 + 2건 변경 — 고정 16 · 켬 47 · 끔 254. **2차(2026-10-16): 사용자 체크 45개 + 묶음 정리 규칙(14.5) 반영 → 고정 31 · 켬 69 · 끔 217** (전체 317). 같은 날 새 훅 `relation-guard`(켬) 추가로 **고정 31 · 켬 70 · 끔 217 (전체 318)**. 에이전트·스킬 기본값은 `docs/plans/page/defaults.json`. 변경: `acceptEdits` 시작 권한 모드·임시 폴더 접근 허용을 켬 → **고정**. 상세는 [항목 체크리스트](2026-10-15-harness-item-checklist.md) |
| 10 | 권한 정책 | 12장대로 확정 (추천안 그대로) |
| 11 | 체크리스트는 한 칸 | 체크리스트는 **모든 프로젝트의 기본값 한 칸**(고정·켬·끔). gugbab-claude 레포도 프로젝트 중 하나라 자기 설정은 `/harness` 로 바꾸고, **이 레포만의 고정·기본값은 레포 `.gugbab.json`**(`lock`·`enable`, git 커밋)으로 한다. (한때 "이 레포 / 프로젝트" 두 칸으로 나눴다가 고정 외에는 프로젝트 설정과 같아서 다시 합침 — 합칠 때 두 칸 중 하나라도 고정이 아니면 고정을 뺀 값으로.) 하네스 제작·README 용 16개(룰 readme-update·agent-design·creation-workflow·verification-policy·commands, 훅 verification-guard·skill-md-guard·agent-md-guard·deliverable-guard·staleness-check·instructions-loaded, 에이전트 agent-creator·skill-creator·skill-tester·freshness-auditor, 커맨드 /agent-status)에는 "다른 프로젝트 추천: 끔 · 이 레포는 .gugbab.json 으로 고정 예정" 안내. 메모리 3종은 다른 프로젝트에서도 쓰므로 안내 없음 |

| 12 | `/harness` 가 바꾸는 범위 | 기본은 **연 프로젝트만**, 선택하면 **모든 프로젝트**(레포 제외). 5.2 적용 순서대로 |
| 13 | 프로젝트별 설정 저장 위치 | **내 PC 의 `~/gugbab/projects/<프로젝트>/`** (프로젝트별 설정 폴더 = 그 프로젝트의 `CLAUDE_CONFIG_DIR`). 프로젝트 폴더에는 파일을 안 만든다. git 공유가 필요한 프로젝트만 선택적으로 `.gugbab.json` |
| 14 | 체크리스트 페이지 | 이 레포의 **상시 관리 도구** — 앞으로도 고정·켬·끔을 이 페이지에서 바꾸고 manifest 기본값에 반영 (8장) |
| 15 | 묶음·의존 관리 (2026-10-16) | **방안 3 + 4** (14.6) — 스킬·에이전트·언어 룰은 겹치지 않는 블록 19개(14.4)로, 훅·룰·커맨드는 기능 묶음(14.3)으로 켜고 끔. 템플릿은 프리셋으로만. 필수 의존은 경고 후 같이 켜고 끔, 고정이 필요로 하는 것은 같이 고정. 처리 순서 A 펼치기 → B 채우기 → C 정리 → B 재검사. 디스패처가 켜진 목록(`GUGBAB_ENABLED`)을 훅에 넘겨 꺼진 항목은 안내에서 뺌. 블록 안 개별 끄기 허용("일부 켬"). 묶음 안 상태가 섞이면 고정을 빼고 켬(14.5) |
| 16 | 관계 원본 + 검사 훅 (2026-10-16) | 관계 분류는 레포 최상위 **`relations.json`**(1단계에서 manifest 로 합침). 새 훅 **`relation-guard`**(harness-authoring) 가 훅·에이전트·스킬·룰·커맨드 저장 때 분류 안 된 새 언급·소속 없는 새 항목을 알리고, `git commit` 때 하나라도 있으면 차단. `scripts/relations.test.js` 로 레포 전체 정합성 검사 |
| 17 | Codex 리뷰 시점 (2026-10-16) | 개편 **1차본을 전부 완성한 뒤 맨 마지막에** 한 번. 그 전까지 `codex.skipReview` 로 중지 유지 |
| 18 | 개편 범위 (2026-10-16) | **gugbab 하네스만** 개편한다. 범위 밖(업무용 프로젝트 관련) 메모리·세션 요약·분석 문서는 git 추적에서 빼고 **로컬에만** 둔다(`.git/info/exclude` — 커밋되는 `.gitignore` 에 이름을 적지 않음, 목록은 로컬 메모리 `local_index.md`). 공유 문서의 예시 프로젝트 이름은 중립 이름(`my-ui`). 예전 커밋 이력 정리는 개편 완성 후 결정(force push 필요) |
| 19 | `harness/` 폴더 이동 시점 (2026-10-16) | **6단계로 미룸** — 1·2단계는 manifest 가 지금 `.claude/` 아래 경로를 그대로 가리킨다(하네스 원본 위치 = `GUGBAB_HOME/.claude`). 아직 쓰는 `project-install.sh`·기존 설치본이 깨지지 않게, 실제 이동은 `project-install.sh` 를 지울 때 함께 한다 |
| 20 | 루트 하네스 무관 폴더 정리 (2026-10-16) | **미룸** — 2단계 동작과 무관하고 폴더별 확인이 필요해 이후 따로 진행 (6번 결정의 시점만 변경) |
| 21 | `instructions-loaded` 파일 삭제 시점 (2026-10-16) | **6단계로 미룸** — manifest 에서 이미 "끔"이라 래퍼는 실행하지 않는다(폐지 효과는 지금 적용). 파일·배선 삭제는 아직 쓰는 `project-install.sh` 설치 목록·설정 이관 스크립트(`migrate-settings`)와 그 테스트·템플릿 문서 9곳에 걸려 있어, 결정 19 처럼 `project-install.sh` 를 지울 때 함께 한다 |
| 22 | 하네스 레포 자신을 래퍼로 열 때 (2026-10-16) | 레포 `.claude/` 가 같은 훅·항목을 이미 직접 가지고 있으므로 래퍼는 **프로젝트가 가진 것은 건너뛴다**(같은 이름 스킬·룰·에이전트·커맨드, 프로젝트 settings 에 연결된 같은 훅 — 두 번 실행·중복 방지). 공통 CLAUDE.md 도 넣지 않는다(레포 CLAUDE.md 가 상위 집합). 레포 `.gugbab.json` 은 6단계(레포 자체 배선 제거) 뒤 실제로 쓰인다 |
| 23 | 충돌 판정의 "블록을 켰다" (2026-10-16 실측 버그) | 블록·묶음은 **이름으로 켰거나 구성원이 전부 켜졌을 때만** 켜진 것으로 본다. 체크리스트에서 nexacro 블록의 에이전트 일부를 모든 프로젝트 기본 켬으로 해 두어, "하나라도 켜짐" 규칙이면 모든 프로젝트에서 tdd-guard 가 꺼지는 문제가 실제 실행에서 드러남 |
| 24 | TUI 구현 방식 (2026-10-17, 결정 5 의 화면 부분 변경) | **Node 기본 `readline` 으로 직접 구현, npm 의존성 없음** — `@inquirer/prompts` 체크박스로는 Tab 범위 전환·`/` 검색·묶음 일부 켬(`[-] 1/6`) 표시·프리셋 화면을 함께 넣을 수 없고, 설치 단계 전이라 의존성이 없는 편이 단순. 상태 계산·그리기는 순수 함수로 나눠 테스트(`cli/tui.js`) |
| 25 | 덮여 있어도 기록은 남김 (2026-10-17 실측 버그) | 켜기·끄기는 **이 프로젝트에서 위쪽 층(프로젝트 설정·`.gugbab.json`)이 덮어 안 바뀌어도 고른 범위에 기록**하고 이유만 보여 준다. "모든 프로젝트" 범위에서 끈 것이 지금 연 프로젝트가 켬으로 덮고 있다는 이유로 기록되지 않아 다른 프로젝트에도 반영되지 않던 문제가 실측에서 드러남. 🔒 고정은 기록하지 않음. 같은 층에서는 끔이 켬을 이기므로, 켤 때는 그 항목을 덮는 끔 기록을 걷어낸다(묶음 끔이면 나머지 구성원 끔으로 풂) |
| 26 | 병렬 실행 안내 훅 `parallel-hint` (2026-10-17 사용자 요청) | 비차단 안내만. 요청에 독립 작업이 여럿이면 병렬 요령 주입(UserPromptSubmit), 읽기 전용 단일 호출 3연속이면 한 번 알림(PostToolUse). **이 레포 + 래퍼 전용**(relation-guard 와 같은 `repo-only` — 옛 복사 설치에는 넣지 않음, 이전 방식은 6단계에 정리), **🔒 고정(2026-10-17 사용자 결정 — 어느 프로젝트에서도 끌 수 없음)**, `relations.json` standalone |
| 27 | 래퍼로만 사용 (2026-10-17 사용자 결정, PR #24 머지 후) | 이 레포는 앞으로 **`gugbab-claude` 래퍼로만** 쓴다. README 를 래퍼 설치·사용 안내로 전면 개편하고 옛 복사 설치(`project-install.sh`·템플릿 표) 안내를 모두 뺐다. 업데이트 로그는 `docs/CHANGELOG.md` 로 이동. 옛 설치 스크립트·템플릿 문서·예시·관련 테스트 **파일 삭제는 6단계**에서 범위를 확인받고 진행 |
| 28 | 버전 관리 = GitHub 태그 (2026-10-17 사용자 결정) | npm 배포 대신 **`vX.Y.Z` git 태그 + GitHub Release**. 기본 설치는 stable(최신 태그)이라 main 에 머지해도 태그 전에는 사용자에게 가지 않음, `--version` 으로 고정·되돌리기. 순서(사용자 지정): ① **v1.0.0** 으로 실제 테스트 — 테스트 중 버그는 버전을 올리지 않고 고친 커밋으로 `v1.0.0` 태그를 옮김(업데이트는 태그가 가리키는 커밋을 비교하므로 설치본도 받음) ② 정상 확인 후 `v*` 태그 보호 규칙(삭제·덮어쓰기 금지) 켬 ③ **v1.0.1** 로 업데이트 시험(`gugbab-claude update` 또는 1시간 뒤 실행). `status`·`doctor` 가 지금 버전·채널 표시, main 채널인데 태그가 생기면 stable 로 바꾸는 법 안내 |
| 29 | 화면 아이콘·Claude Code 버전 확인 (2026-10-17 사용자 요청, v1.0.0 테스트 중) | `/harness` 화면 표시를 docs 와 같은 아이콘으로 — ✅ 켬 · ⬜ 끔 · 🟨 일부 · 🔒 고정. 새 훅 `claude-version-check`(SessionStart, 비차단, **🔒 고정**, 레포·래퍼 전용 `repo-only`) — 지난 세션 이후 Claude Code 버전이 바뀌면 로그인 공유 내부 변수 확인 안내, 하루 한 번 npm 레지스트리 최신 버전 확인 후 새 버전 안내. 디스패처가 `GUGBAB_STATE_DIR`(<데이터>/state)을 넘겨 기록을 래퍼 데이터 폴더에 두고 `status`·`doctor` 가 같은 기록으로 "Claude Code 2.1.296 (최신 2.1.302 있음)" 표시. 훅 31→32 |
| 30 | `/harness` 화면 트리·일괄 켜기·연관 설명 (2026-10-17 사용자 요청) | 목록을 **접고 펼치는 트리**로 — 큰 갈래(스택 블록·묶음·단독 항목) → 그룹(블록·묶음·종류) → 항목, 처음엔 블록·묶음까지만. →/← 펼치기·접기, a 모두 펼치기/접기, 검색하면 자동 펼침. Space 는 항목이면 그것만, 묶음·블록이면 안의 항목 일괄, 큰 갈래·종류면 그 아래 전체 일괄(🔒 고정 건너뜀) — 기록은 기존 `applyToggle` 그대로라 `on`/`off` 명령과 결과가 같다. 범례 줄(🟨 = 묶음 안 일부만 켬)과 설명칸(개수·속한 곳·필요로 함·이걸 필요로 함·충돌·고정 이유). 사용 안내에 "연관 동작" 절과 필수 의존·충돌·묶음 표(relations.json 과 docs-counts 가 대조) |
| 31 | 처음 실행 프리셋 고르기 · 기본값 문서 (2026-10-17 사용자 요청) | 프로젝트(git 최상위)에서 처음 `gugbab-claude` 를 띄우면 기본 프리셋을 묻는다 — 프로젝트 파일로 스택 감지·추천(next·react→nextjs, Spring Boot 버전→java-legacy/modern, Cargo→rust, pyproject→python, Unity→unity), 번호(쉼표 여러 개, Enter=추천, 0=안 고름), 이 프로젝트 설정에 적용하고 `firstRun` 기록으로 다시 묻지 않음. 터미널 아님·`-p`·기존 설정·`.gugbab.json`·`GUGBAB_NO_FIRST_RUN` 이면 묻지 않음, 실패해도 세션은 막지 않음(`cli/first-run.js`). 기본값·고정 목록·프리셋별 구성은 manifest 에서 만드는 생성 문서 `docs/DEFAULTS.md`(`scripts/build-defaults-doc.js`, 최신 여부 테스트). README 에 요구 사항·PATH·`/harness`, 사용 안내는 `/harness` 중심(하위 명령·설치 옵션은 개발 문서로) |
| 32 | PR 마다 버전 올리기 → 머지 때 자동 태그 (2026-10-17 사용자 요청 — 결정 28 의 손으로 다는 태그를 대체) | 사용자 지적 "main 머지되면 태그가 계속 바뀌어야지" — stable 은 태그만 따라가는데 태그를 손으로 달아 머지분이 설치본에 안 갔다. 레포 최상위 **`VERSION`**(X.Y.Z)이 다음 버전. PR 은 Claude 가 올리므로 **`gh pr create` 직전 레포 전용 🔒 훅 `release-version-guard`** 가 커밋된 VERSION > 최신 `v*` 태그(origin 3초, 실패 시 로컬)인지 검사해 아니면 막고 `scripts/release-version.js bump` → 커밋 안내(훅은 파일을 고치지 않음, 프로젝트 코드 실행 안 함, `.github/workflows/release-on-main.yml` 이 있는 레포에서만 동작). `/create-pr` 에 버전 단계, PR 마다 **`version-check`** 워크플로, main push 때 **`release-on-main`** 워크플로가 VERSION 으로 태그·Release 생성(이미 있으면 건너뜀, concurrency, 손으로 재실행). 기본 패치 +1, 큰 변경이면 minor·major. 훅 31 + 상태줄, 고정 34 |
| 33 | `/harness` 트리 = 종류 → 용도 → 항목 (2026-10-17 사용자 요청 — 결정 30 의 기본 트리 변경) | 사용자 지적 "훅·룰·스킬·에이전트로 나뉘고 거기서 사용 용도에 따라 나뉘어야지, 계획서 체크리스트처럼". 기본 보기를 **종류(설정·훅·룰·커맨드·에이전트·스킬) → 용도(체크리스트 `###` 절, 적힌 순서) → 항목**으로. 순서·용도는 `build-manifest` 가 체크리스트에서 읽어 manifest `layout` 에 담는다(체크리스트를 고치면 화면도 따라감, 절 제목 끝 개수 표기는 뺌). 절이 없는 종류(설정·룰·커맨드)는 항목이 바로, layout 에 없는 항목은 그 종류 끝 "기타". 용도·종류에서 Space = 안의 항목 하나씩 일괄(🔒 건너뜀). 결정 30 의 블록·묶음 보기는 **`v` 키**로 전환해 유지(스택 단위는 프리셋 `p` 와 이 보기). 같이 고침: 화면 맨 아래 키 도움말 줄이 높이 계산(-8 → -9) 때문에 잘려 안 보이던 버그 |
| 34 | 세션 안에서 다시 부른 래퍼는 배포 모드 유지 (2026-10-19 버그 수정) | 사용자 보고 "켰더니 자동 최신화가 꺼져 있다". 래퍼가 claude 에 넘기는 `GUGBAB_HOME` 때문에 세션 안에서 다시 부른 `gugbab-claude`(`/harness` 의 status·on·off·preset)가 개발 모드로 판정 → "개발 모드 — 자동 최신화 끔" 표시 + 데이터가 `~/gugbab` 대신 `~/.gugbab-dev` 로(세션 안 명령 켜기·끄기가 실제 설정에 안 들어감). 배포 모드는 `GUGBAB_DEV=0` 을 넘기고, 다시 불릴 때 `GUGBAB_DEV=0` 이면 배포 모드·자기 위치 유지(넘어온 `GUGBAB_HOME` 무시). 실사용 시나리오에 "세션 안 `gugbab-claude status` 의 모드" 검사 추가(시나리오는 데이터 폴더를 따로 지정해 이 차이를 못 잡았음) |
| 35 | 업데이트하면 새 래퍼로 다시 실행 + `wrapper-version-check` 훅 (2026-10-19 사용자 요청 — "강제로 훅으로") | 결정 34 를 v1.0.3 → v1.0.4 자동 업데이트 직후 세션에서 확인해 보니 여전히 개발 모드로 나왔다 — 업데이트는 됐지만 **그 실행은 이미 돌던 예전 래퍼(셸)와 미리 불러온 `cli/` 코드로 진행**돼, 래퍼·cli 수정은 "한 번 늦게" 반영되는 구조였다(스킬·훅·룰 등 내용은 조립 때 디스크에서 읽어 바로 반영). ① 래퍼가 업데이트를 따로 `node cli/main.js self-update`(갱신되면 exit 10)로 하고, 갱신됐으면 `GUGBAB_REEXEC=1` 로 **새 버전 자신을 `exec`** — 다시 실행된 쪽은 업데이트를 건너뛰어 반복 없음, 새 래퍼 파일이 없거나 업데이트가 죽으면 지금 프로세스로 계속, 조립은 `prepare --no-update`(예전 래퍼가 부르는 `prepare` 는 그대로 업데이트 포함 — 호환). 재시작 표시로 다시 띄울 때도 지금 설치된 래퍼로 `exec … --continue`. ② claude 에 이 래퍼의 하네스 커밋 `GUGBAB_WRAPPER_REV`(git 이 없으면 `unknown`)를 넘기고, 새 SessionStart 훅 **`wrapper-version-check`**(🔒 고정, 레포·래퍼 전용, 비차단)가 설치본 HEAD 와 비교 — 다르면(세션 도중 업데이트) 재시작 표시를 남겨 `/exit` 하면 새 버전으로 이어서 시작, 값이 없으면(v1.0.4 이하 래퍼) 터미널에서 `gugbab-claude -c` 안내(표시는 남기지 않음 — 예전 래퍼는 재시작해도 값을 안 넘겨 매번 다시 시작하게 되므로). 훅만으로는 강제할 수 없다(업데이트는 claude 가 뜨기 전, SessionStart 는 막거나 재시작 못 함) — 실제 반영은 ①, 훅은 안전망. 이 수정이 들어간 버전을 받는 **그 한 번**은 예전 래퍼가 돌고, 그 뒤부터 바로 반영. 훅 31→32 · 고정 34→35 |
| 36 | 세션 시작 때 하네스 버전·업데이트 결과를 화면에 표시 — 훅으로 강제 (2026-10-19 사용자 요청) | v1.0.5 머지 뒤 실행했는데 1시간 확인 간격 때문에 받지 못했고, 지금 버전·확인 여부를 볼 방법이 없었다(래퍼의 stderr 한 줄은 claude 화면이 뜨며 가려짐). ① 래퍼가 실행마다 `GUGBAB_LAUNCH`(`<pid>-<초>`)를 만들어 넘기고(다시 실행된 쪽은 이어받음, 밖에서 넘어온 값은 버림), `self-update` 가 확인 결과를 `<데이터>/state/last-check.json` 에 그 값과 함께 남김 — 결과 코드(updated·up-to-date·recent·fetch-failed·pinned·local-changes·not-ff·failed·no-tag 등) + 갱신이면 이전·새 버전, 1시간 안이면 마지막 확인 시각. 경로가 든 메시지는 기록하지 않음, 링크·폴더 자리엔 쓰지 않음(임시 파일 → rename). ② 🔒 고정 훅 `wrapper-version-check` 가 SessionStart 때 실행 값이 같고 아직 안 보여 준 기록이면 사용자 화면(`systemMessage` — 공식 hooks 문서상 SessionStart 는 버리지 않음, 실사용 시나리오로 확인)에 `[gugbab] 하네스 v1.0.4 → v1.0.5 로 업데이트됐습니다` / `하네스 v1.0.5 — 최신입니다 (방금 확인)` / `… 업데이트 확인 건너뜀 (마지막 확인 HH:MM, 1시간마다 확인 · 바로 받으려면 gugbab-claude update)` / 실패 사유를 띄우고 `shown` 표시 — 같은 실행의 /clear·compact·재시작에선 반복 안 함, 기록이 없거나 다른 실행 것이면 새 세션(startup·resume)일 때 `하네스 v1.0.5` 만. 1시간 확인 간격은 유지(사용자 확인). `gugbab-claude update` 도 최신이면 `이미 최신 (v1.0.5)` 로 버전 표시. 새 훅 없음(훅 수 그대로) |
| 37 | 세션 시작 버전 안내는 Claude 가 첫 답변 맨 위에 전달 — 결정 36 보완 (2026-10-19 사용자 선택) | v1.0.6 으로 실행했는데 화면에 안내가 안 보였다. 세션 기록을 보면 훅은 정상으로 돌았고 `systemMessage` 도 `hook_system_message` 로 저장됐지만 첫 화면에는 그려지지 않았다 — 결정 36 의 "SessionStart `systemMessage` 는 화면에 뜬다" 전제가 틀림(공식 문서에도 SessionStart 표시 위치는 없음, 실제 화면 확인을 빠뜨림). `additionalContext` 의 "(사용자 화면에 이미 표시됨)" 을 "첫 답변 맨 위에 고치지 말고 그대로 한 번, 두 번째 답변부터 반복 안 함" 요청으로 바꿈. `systemMessage` 는 보이는 환경을 위해 유지. 첫 질문을 해야 보이는 한계는 사용자 확인(상태줄 상시 표시는 하지 않음). 조작된 버전 라벨은 화면·문맥 어디에도 들어가지 않음(테스트 98→102) |
| 38 | 래퍼 세션도 comux·tmux 에이전트 목록과 세션 간 메시지에 보이게 (2026-10-19 사용자 요청) | 래퍼로 띄운 세션이 `comux list-agents` 에 안 나오고(칸이 `KIND=shell LABEL=sh`), `ListAgents` 도 다른 세션을 못 찾았다. ① 원인: 래퍼(비대화형 sh)는 재시작 반복 때문에 claude 를 `exec` 하지 않고 자식으로 띄우는데, 작업 제어가 꺼져 claude 가 sh 와 같은 프로세스 그룹에 들어가 멀티플렉서가 그룹 대표 `sh` 만 봄. 해결: 터미널(stdin·stdout 둘 다)이고 `-p` 가 아니면 claude 실행·재시작 반복을 **`/bin/dash`(또는 `/usr/bin/dash`, 고정 경로 — PATH 의 가짜 dash 무시)에 `set -m` 으로 넘겨 `exec`** — claude 가 자기 그룹 대표로 터미널 앞에 섬(PoC: comux 가 `agent claude` 로 감지). macOS `/bin/sh`(bash 3.2)는 set -m 이어도 claude 가 Ctrl+Z 로 멈춘 걸 못 알아채 칸이 멈춰서 쓰지 않음(PoC). claude 가 멈추면 `jobs %1` 로 작업이 남았는지 보고 래퍼가 스스로 멈춰 부모 셸로 돌아가고, `fg` 로 깨면 `fg %1` 로 claude 를 다시 앞으로 — 진짜 종료 코드 146 은 정지로 오해하지 않음. dash 가 없거나 터미널이 아니거나 `GUGBAB_JOBCTL=0` 이면 예전 방식(감지 안 됨). ② 원인: 실행 중 세션 목록(`<pid>.json`·`.key`)이 `<CLAUDE_CONFIG_DIR>/sessions/` 에 있어 설정 폴더가 다르면 서로 못 찾음(메시지 소켓은 공용 `/tmp/cc-socks`). 해결: 조립 때 `sessions/` 를 `~/.claude/sessions` 로 링크(공유 폴더 목록에 추가, 없으면 0700 생성). 예전 실행이 만든 진짜 폴더는 세션 기록 형식의 일반 파일만 옮기고(같은 이름은 더 최근 것), 링크·폴더·낯선 파일이 있으면 손대지 않고 링크도 걸지 않고 경고. PoC: 설정 폴더가 다른 두 임시 세션이 공유 목록으로 서로를 찾았고 메시지가 받는 쪽 inbox 에 들어감(받는 쪽 권한 모드에 따라 승인 대기는 Claude Code 동작). `sessions/` 는 문서에 없는 내부 구조라 Claude Code 업데이트로 바뀔 수 있음. **남은 한계**: comux 는 에이전트 칸을 `claude --resume <id>` 로 저장해, comux 서버 재시작 복원 때는 하네스 없이(설정 폴더 없이) 대화만 이어서 열린다 |
| 39 | 이 프로젝트 메모리·대화 폴더는 확인 없이, 하네스 설치 폴더 Bash 쓰기는 확인 (2026-10-19 사용자 요청) | 다른 프로젝트에서 `gugbab-claude` 로 작업할 때 설정 폴더 메모리를 읽고 고칠 때마다 확인 창이 떴다. 실측(`claude -p`, 실제와 같은 링크 경로): **하네스 훅을 쓰는 프로젝트는 이미 확인 없이 동작**(auto-approve 가 `projects/` 링크를 따라가 판정) — 확인 창은 **자기 훅을 가진 프로젝트**(별도 하네스 원본 등)에서만 뜸: 그 auto-approve 는 `~/.claude/projects` 를 글자 그대로만 비교해 메모리 수정이 ask, 그 bash-guard 는 `cd <메모리 폴더> && grep …` 을 허용 폴더 밖으로 보고 판정하지 않아 Claude Code 자체 "이 폴더 읽기 허용?" 창. 실행 중에 프로젝트 훅을 지우면 디스패처가 실행 때 기록(`.gugbab-state.json` skippedHooks)대로 하네스 훅도 건너뛰어 같은 창이 뜸 → 다시 실행하면 해소. 해결: 조립하는 settings.json `env` 에 **`CLAUDE_BASH_GUARD_ALLOWED_DIRS` = 그 프로젝트 메모리·대화 폴더 하나**(설정 폴더 쪽 `projects/<인코딩>` + 실제 위치 `~/.claude/projects/<인코딩>`) — 하네스·파생 bash-guard 가 공통으로 읽는 변수라 그 레포 파일을 안 고치고 통함(settings `env` 가 훅에 전달되는지 실측). 사용자 `env` 의 다른 키는 보존, 인코딩 200자 초과(Claude Code 가 잘라 해시)·경로에 `:`·projects 링크 없음이면 안 넣음(지금처럼 확인), 하위 폴더에서 실행해 인코딩이 다르면 확인. `additionalDirectories` 는 파생 훅이 래퍼 settings 를 안 읽어 효과 없고 acceptEdits 로 쓰기까지 열려 안 씀, `Read(//…)` 규칙은 읽기가 이미 허용이라 안 씀. 함께: **bash-guard 가 `GUGBAB_HOME` 아래 Bash 쓰기를 ask**(`touch`·`mkdir`·`ln`·`chmod`·`mv`·`tee`·`truncate`, `cp`·`install`·`rsync` 목적지·`-t`, `sed -i`·`perl -i`, 출력 리다이렉트 — lexer 에 리다이렉트 방향·fd 복제 구분 추가). 실측에서 `touch ~/gugbab/x` 가 확인 없이 됐다(기본 allow `Bash(touch*)` 등). 실제 위치(링크 추적)가 허용 폴더 안이면 제외, 프로젝트 루트가 하네스 안이면(하네스 자체 작업) 보호 안 함, `GUGBAB_HOME` 이 상대경로·루트·홈(상위)이면 무시, 변수 대상은 판정 안 함. **남은 한계**: 자기 bash-guard 를 가진 프로젝트는 하네스 bash-guard 가 빠져 설치 폴더 보호가 적용 안 됨, `git -C ~/gugbab checkout` 같은 git 쓰기는 대상 아님, 실행 중 프로젝트 훅 삭제는 다시 실행해야 반영 |
| 40 | 세션 간 메시지(`SendMessage`)는 확인 없이 보냄 (2026-10-20 사용자 결정 — 12.2 에서 12.1 로) | 다른 세션에 작업 자료를 넘길 때마다 auto-approve 가 확인 창을 띄웠다. 사용자: "해당 세션에서 내용 전달받으면 내용 확인하고 진행 여부 확인 이후에 진행" — 받는 세션이 메시지를 읽고 자기 규칙(작업 전 확인 절차)대로 진행 여부를 묻기 때문에 보내는 쪽 확인은 중복. `SendMessage` 를 확인 목록에서 자동 허용 목록으로 옮김(정확한 도구 이름만 — 비슷한 이름·대소문자 다른 이름은 자동 아님). CronCreate·CronDelete·RemoteTrigger·DesignSync·PowerShell 은 확인 유지. 받는 세션의 권한 모드가 보내는 쪽과 다르면 Claude Code 자체가 받는 쪽 사용자에게 수락을 묻는데, 이것은 Claude Code 동작이라 그대로 둠 |
| 41 | 윈도우 지원 착수 — PoC 먼저 (2026-10-20 사용자 요청 "윈도우도 돌아가게") | 지금 코드는 윈도우에서 **첫 조립부터 실패**(`compose.js` 가 `\` 든 경로 거부·심볼릭 링크)하고, 고쳐도 `/dev/stdin` 을 읽는 보안 훅 8개가 **조용히 통과**한다. 전수 조사 40건(시작 실패 7 · 보안 8 · 기능 24 · 테스트 1)·공식 문서 재확인(훅·상태줄은 Git Bash 로 실행, 로그인은 설정 폴더의 `.credentials.json` 파일, Bash deny 규칙이 PowerShell 도구를 끔, 설정 폴더 스킬 무시 이슈는 고쳐지지 않고 닫힘). ① **사용자 윈도우 PC 에서 PoC 스크립트로 로그인 공유·설정 폴더 스킬 인식·훅 셸·링크·테스트를 먼저 실측**하고 결과로 방향 확정 ② 추천: PowerShell 도구 끔 + Git for Windows 필수 ③ Node 런처 + `.cmd`·`.ps1` 껍데기(macOS sh 유지) ④ 폴더 junction·파일 하드링크→복사 ⑤ Windows Terminal 공식 지원 ⑥ bash-guard `.exe` 이름 우회(맥에서도 `git.exe push --force` 등이 PermissionRequest 자동 승인으로 실측)·보안 훅 fail-open 은 1단계에서 먼저 ⑦ 완료 릴리스 v1.1.0. ②~⑦ 은 추천 — PoC 뒤 확정. 상세: [윈도우 지원 계획서](2026-10-20-windows-support.md), 요약 17장 |

### 지금 어디까지 왔나 (2026-10-17)
- **0~2단계 완료** (15장 계획대로, 결과는 15.5) — PoC 4·6·7·8·플러그인·첫 실행 화면 확인, `manifest.json` 생성기, 훅 경로 수정 6개, 상태줄 수정, `bin/gugbab-claude` + `cli/` 래퍼 핵심. 이 레포에서 `GUGBAB_HOME=$PWD bin/gugbab-claude` 로 실제 세션이 열린다
- **4단계 완료** (2026-10-17, 결과는 15.6) — 켜기·끄기 화면(TUI), 세션 안 `/harness`(comux 옆 창 · tmux 팝업 · macOS 새 창), 프리셋 13개, 안 바뀐 이유 표시. 사용자 요청으로 3단계보다 먼저 진행. comux 옆 창으로 실제 토글 확인
- **3단계 완료** (2026-10-17, 결과는 15.7) — `install.sh` + branch 채널, 병렬 안내 훅(결정 26)
- **PR #24 머지 (2026-10-17)** — 래퍼가 main 에 들어감. 같은 날 README 를 래퍼 전용으로 개편(결정 27)
- 결정 28 (2026-10-17): 버전 = GitHub 태그. 다음은 README PR 머지 후 `v1.0.0` 태그 → 사용자 실제 테스트 → 태그 보호 → `v1.0.1` 업데이트 시험
- 남은 단계: 5 첫 릴리스 · 6 이전(설치본 정리·`project-install.sh` 삭제·`harness/` 이동·`instructions-loaded` 삭제) · 7 문서 · 맨 마지막 Codex 리뷰

### 다음 단계
1. ~~14장 관리 방안 결정~~ → 2026-10-16 방안 3+4 확정(15번), `relations.json` + `relation-guard` 구현(16번)
2. ~~0~2단계 구현~~ → 2026-10-16 완료 (15.5)
3. ~~4단계 TUI·`/harness`~~ → 2026-10-17 완료 (15.6)
4. ~~3단계 설치~~ → 2026-10-17 완료 (15.7) — 사용자가 브랜치로 설치부터 시험
5. 5단계 첫 릴리스(`v1.0.0` 태그) — PR 머지 후

---

## 14. 훅·룰·커맨드·에이전트·스킬은 어떻게 엮여 있나 — 관리 방안 (2026-10-16 결정: 방안 3 + 4)

> 이 장은 결정의 **근거 자료**다. 결정 내용은 13장 15·16번. 관계 분류 원본은 레포 최상위 `relations.json`, 검사는 `relation-guard` 훅(14.8).

### 14.1 어떻게 조사했나

- **언급 관계**: 체크리스트 317개 항목의 원본 파일(훅 `.js`, 룰·커맨드·에이전트·스킬 `.md`)에서 다른 항목 이름이 나오는 곳을 전부 뽑음 → **878건**. 한 줄씩 문맥을 보고 성격을 나눔.
- **스택 구성**: `project-install.sh` 를 템플릿 14종(1–7번, 9–15번)으로 임시 폴더에 **실제 설치**해 템플릿마다 들어가는 스킬·에이전트·룰·커맨드·훅을 뽑음.

### 14.2 관계는 6종류

| 종류 | 건수 | 예 | 같이 관리해야 하나 |
|---|---:|---|---|
| **① 강제·설명 짝** — 훅이 막고, 룰이 그 규칙을 설명 | 약 25 | `task-confirm-guard` ↔ `task-workflow.md`, `adversarial-test-guard` ↔ `adversarial-testing.md` | **예** — 한쪽만 켜면 룰은 "훅이 막는다" 고 말하는데 실제로는 안 막음 |
| **② 필수 호출** — 없으면 동작이 깨짐 | 약 15 | `deliverable-guard` → `skill-tester`, `/spec-extract` → `legacy-spec-extractor` | **예** — 켜고 끌 때 같이 |
| **③ 코드 공유** — 훅끼리 함수를 가져다 씀 | 21 | `branch-protection` → `bash-guard` 의 셸 분석기 | 아니오 — 훅 파일은 늘 있고 디스패처가 실행만 건너뜀 |
| **④ 스택 소속** — 스킬·에이전트·언어 룰이 특정 기술에 속함 | 스킬 195 · 에이전트 47 · 룰 3 | `mybatis-mapper-patterns` → Java, `unity-iap` → Unity | **예** — 레포마다 스택 단위로 한꺼번에 켜고 끔 |
| **⑤ 선택 참조** — 있으면 쓰고 없으면 대신함 | 에이전트→스킬 178 · 스킬→스킬 412 · 에이전트↔에이전트 약 70 | `devops-engineer` → `docker-deployment`, architect ↔ developer 안내 | 아니오 — 묶지 않음 (꺼져 있으면 답 품질만 조금 떨어짐) |
| **⑥ 이름만 나옴** — 예시·목록 | 약 30 | `git.md` 커밋 예시의 `rust-backend-developer`, `agent-design.md` 모델 표 | 아니오 — 무시 |

→ **같이 관리할 것은 ①②④ 세 가지**. 나머지는 묶지 않는다.

**16장(연관된 항목 처리 방법)의 A~E 와 대응:** ① 강제·설명 짝 = **A 짝 묶음**, ② 필수 호출 = **B 의존**, ③ 코드 공유 = **D 코드 공유**, ④ 스택 소속 = 14.4 블록(16장에는 없음 — 새로 추가), 레거시 프로파일 ↔ `tdd-guard` 같은 충돌 = **C 충돌·변형**, 저장 위치·적용 순서 = **E**. A·B·C 는 manifest 의 서로 다른 칸(`bundles`·`requires`·`conflicts`/`variants`)으로 **따로 구현·테스트**하고, D 는 처리하지 않는다.

**한 번 바꿨을 때의 처리 순서 (고정):** ① **A 펼치기** — 묶음을 켜고 끄면 구성원이 같이 바뀜 → ② **B 채우기** — 켜진 항목이 필요로 하는 것을 같이 켬(고정이 필요로 하면 고정) → ③ **C 정리** — 충돌하는 쪽을 끄고 변형은 하나만 남김 → ④ **B 재검사** — ③에서 끈 것을 필수로 쓰는 항목이 있으면 경고. 순서를 되돌아가지 않으므로 끝없이 돌지 않는다(테스트로 강제). 지금 이 연쇄가 실제로 생기는 곳은 nexacro 묶음 ↔ dev-quality 의 `tdd-guard` 한 곳.

### 14.3 ①② 기능 묶음 — 훅·룰·커맨드·에이전트가 한 기능을 이루는 것

> 아래 "지금 체크" 열은 **정리 전**(2026-10-16 사용자 체크) 상태다. 정리한 결과는 14.5.

| 묶음 | 구성 | 엮인 방식 | 지금 체크 |
|---|---|---|---|
| **task-confirm** | 훅 `task-confirm-guard`·`progress-tracker` + 룰 `task-workflow.md` | 훅이 확인 절차 강제(①), progress-tracker 는 그 승인 판정이 있어야 기록(②) | 모두 고정 ✅ |
| **verification** | 훅 `verification-guard` + 룰 `verification-policy.md` | ① | 모두 고정 ✅ |
| **dev-quality** | 훅 `tdd-guard`·`adversarial-test-guard`·`fake-impl-guard`·`test-fake-guard` + 룰 `adversarial-testing.md` + 커맨드 `/tdd-implement` | ① (레거시 프로파일과 충돌 — `tdd-guard` 만 빠짐) | ⚠️ 훅 3개 고정 · `tdd-guard`·룰·커맨드 켬 |
| **codex-review** | 훅 `codex-review-guard` + 룰 `codex-review.md` + 커맨드 `/codex-review` + codex 플러그인 | 훅이 "룰 절차대로 리뷰" 를 지시(②), 커맨드가 룰을 불러옴(②) | ⚠️ 훅만 켬, 룰·커맨드 끔 |
| **memory-share** | 훅 `memory-pull`·`memory-sync` + 룰 `memory-sync.md` (+ `deliverable-guard` 의 push 전 검사) | ① + 두 훅이 짝(가져오기·내보내기) | ⚠️ `memory-pull` 만 고정 |
| **harness-authoring** | 훅 `skill-md-guard`·`agent-md-guard`·`deliverable-guard`·`staleness-check` + 룰 `agent-design.md`·`creation-workflow.md`·`readme-update.md`·`commands.md` + 에이전트 `skill-creator`·`skill-tester`·`agent-creator`·`freshness-auditor` + 커맨드 `/agent-status` | `deliverable-guard`·`creation-workflow.md` → `skill-tester`(②), `skill-creator`·`agent-creator` → 룰(②), `staleness-check` → `freshness-auditor`(안내) | ⚠️ 대부분 고정, `staleness-check`·`/agent-status` 켬, `readme-update.md`·`commands.md` 끔 |
| **research** | 에이전트 `deep-researcher` → `web-searcher`·`research-reviewer` | ② (Agent 도구로 직접 호출) | 켬·고정·고정 ✅ |
| **spec-extraction** | 커맨드 `/spec-extract` + 에이전트 `legacy-spec-extractor`·`spec-reviewer` + 스킬 `spec-extraction-method` 등 | ② (커맨드가 순서대로 호출, 추출기는 끝나면 반드시 검토) | ⚠️ 커맨드·추출기 켬, `spec-reviewer`·스킬 끔 |
| **nexacro** | 에이전트 `nexacro-screen-analyzer` → `nexacro-screen-converter` → `migration-parity-tester` | 분석 → 변환 → 동등성 테스트 흐름 | ⚠️ converter 만 켬 |
| **perf** | 에이전트 `build-perf-benchmarker` ↔ `perf-report-writer` | 서로 "짝 에이전트" (측정 / 보고서) | 둘 다 끔 ✅ |
| **git** | 커맨드 `/commit` → 룰 `git.md` | ② | 둘 다 켬 ✅ |
| (단독) | 훅 `instructions-loaded` | — | ⚠️ 고정인데 9장 1단계에 **폐지** 예정 |

### 14.4 ④ 스킬·에이전트의 스택 구성 — 템플릿 실측 결과

**지금 템플릿은 서로 많이 겹친다.** 스킬 78개가 템플릿 3개 이상에 들어 있고, react-spa·nextjs·java·python 템플릿에는 "그 템플릿에만 있는 스킬" 이 0개다. 템플릿은 기술 단위가 아니라 **"앱 종류별 꾸러미"**(예: 꿈 해몽 앱 = 프론트 + Python + 꿈 도메인)이기 때문이다.

같은 템플릿 조합에 들어가는 스킬끼리 모으면 **겹치지 않는 블록**으로 깔끔하게 나뉜다:

| 블록 | 스킬 | 대표 스킬 | 같이 들어갈 에이전트·룰 |
|---|---:|---|---|
| **개발 공통** | 6 | ddd, docker-deployment, github-actions, module-boundaries | (공통 에이전트 14 — 아래) |
| **프론트 핵심** | 15 | nextjs, tanstack-query, state-management, typescript-v5, form-handling | frontend-architect·developer·domain-refactorer, 룰 `typescript.md` |
| **프론트 도구·품질** | 24 | storybook, mui-v5/v9, vite-pwa, lighthouse-ci, rsbuild, swiper | a11y-auditor, build-perf-benchmarker·perf-report-writer |
| **TS 백엔드** | 5 | hono, prisma, drizzle, better-auth, zod | typescript-backend-architect·developer |
| **Java 공통** | 13 | mybatis-mapper-patterns, spring-multi-datasource, logback-mdc | java-backend-architect·developer, 룰 `java.md` |
| **Java 레거시 (SB 2)** | 6 | ehcache-2, redisson-legacy, springfox-2, spring-security-5 | — |
| **Java 모던 (SB 3)** | 5 | redisson-4, aws-sdk-v2, springdoc, spring-security-6 | — |
| **Rust** | 9 | axum, sqlx, tower-http, sse-streaming | rust-backend-architect·developer, 룰 `rust.md` |
| **Python** | 10 | python-fastapi, pydantic-v2, langchain, uv | python-backend-architect·developer |
| **Unity** | 16 | unity-6-2d, unity-iap, unity-addressables | unity-architect·developer, game 기획·에셋·수익화·출시 4 |
| **SEO·GEO** | 22 (+3) | schema-org, naver-seo, geo-ai-discoverability (+ 어느 템플릿에도 없던 og-image·seo-nextjs·seo-vite-spa) | seo-auditor, content-quality-reviewer |
| **AI 앱 공통** | 9 | chat-ui-pattern, claude-api-streaming-frontend, voice-input-ui, whisper-api | — |
| **n8n** | 5 | n8n-workflow-design, n8n-llm-integration | — |
| **꿈 도메인** | 18 | dream-symbol-tagging, korean-dream-interpretation-tradition | dream 에이전트 5 |
| **운세 도메인** | 10 | korean-saju-tradition, tarot-card-deck-ui | fortune-interpretation-prompt-tester |
| **건강 도메인** | 5 | nutrition-basics, meal-recommendation-prompt | nutrition-prompt-tester |
| **스펙 추출** | 5 | spec-extraction-method, react/spring-mybatis-spec-extraction, nexacro-17-xfdl-anatomy | legacy-spec-extractor·spec-reviewer (+ 커맨드 `/spec-extract`) |
| **넥사크로** | 6 | nexacro-xapi-server, nexacro-to-react-mapping, ibatis-to-mybatis | nexacro analyzer·converter·migration-parity-tester |
| 기타 | 3 | claude-code-headless, vercel-sandbox, vercel-workflow | — |

**에이전트 공통 14**(모든 스택 템플릿에 있음): api-spec-designer, claude-code-guide, deep-researcher, devops-engineer, fact-checker, product-planner, project-scaffolder, qa-engineer, research-reviewer, security-auditor, source-validator, tech-stack-advisor, ui-ux-designer, web-searcher.
**개발 확장 8**(대부분 스택에 있음): business-domain-analyst, codebase-domain-analyst, competitor-analyst, data-analyst, database-architect, changelog-writer, pr-reviewer, build-error-resolver.
**어느 템플릿에도 없음 4**: agent-creator, skill-creator, skill-tester(→ harness-authoring), socratic-interviewer.

지금 템플릿을 블록으로 다시 쓰면 (= **프리셋**):

| 프리셋 (지금 템플릿) | 블록 조합 |
|---|---|
| react-spa / nextjs | 개발 공통 + 프론트 핵심 + 프론트 도구 + TS 백엔드 |
| java-spring-legacy | 개발 공통 + Java 공통 + Java 레거시 |
| java-spring-modern | 개발 공통 + Java 공통 + Java 모던 |
| rust-axum · python-fastapi · unity-game | 개발 공통 + 각 블록 (+ n8n) |
| dream / fortune / health | 프론트 핵심 + 프론트 도구 + AI 앱 공통 + 각 도메인 (+ Python / TS 백엔드) |
| nexacro | 개발 공통 + 프론트 핵심 + Java 공통 + Java 레거시 + 넥사크로 (+ xfdl) |
| seo-geo · spec-extraction | 애드온 — 다른 프리셋에 더함 |

### 14.5 어긋난 7곳 정리 (2026-10-16 반영 완료)

14.3 표의 ⚠️ 7곳(codex-review · memory-share · dev-quality · harness-authoring · spec-extraction · nexacro · instructions-loaded)을 아래 규칙으로 정리해 체크리스트에 반영했다.

**정리 규칙** — 체크리스트를 두 칸에서 한 칸으로 합칠 때의 결정("둘 중 하나라도 고정이 아니면 고정을 뺀다")을 묶음에도 똑같이 적용:
- **A 짝 묶음** 안에서 상태가 섞여 있으면 → **고정을 빼고 전부 켬**(켬·끔이 섞여도 켬). 모두 고정인 묶음(task-confirm·verification)은 그대로.
- **B 의존** 은 같은 값으로 맞추지 않고, 쓰는 쪽보다 낮은 것만 끌어올림(쓰는 쪽이 켬이면 필요한 쪽은 최소 켬).
- `instructions-loaded` 는 1단계 폐지 예정이라 끔.

**고정 → 켬 (12개)**

| 묶음 | 항목 |
|---|---|
| dev-quality | 훅 `adversarial-test-guard`·`fake-impl-guard`·`test-fake-guard` |
| memory-share | 훅 `memory-pull` |
| harness-authoring | 훅 `skill-md-guard`·`agent-md-guard`·`deliverable-guard`, 룰 `agent-design.md`·`creation-workflow.md`, 에이전트 `skill-creator`·`skill-tester`·`agent-creator`·`freshness-auditor` (gugbab-claude 레포는 `.gugbab.json` 으로 다시 고정) |

**고정 → 끔 (1개)**: 훅 `instructions-loaded`

**끔 → 켬 (11개)**: 룰 `codex-review.md`·커맨드 `/codex-review`(codex-review) · 훅 `memory-sync`·룰 `memory-sync.md`(memory-share) · 룰 `readme-update.md`·`commands.md`(harness-authoring) · 에이전트 `nexacro-screen-analyzer`·`migration-parity-tester`(nexacro) · 에이전트 `spec-reviewer`·스킬 `spec-extraction-method`(spec-extraction 필수 의존)

**결과:** 사용자 체크 고정 45 · 켬 46 · 끔 226 → **고정 31 · 켬 69 · 끔 217**

### 14.6 관리 방안

| | 방안 | 내용 | 장점 | 단점 |
|---|---|---|---|---|
| 방안 1 | **개별 관리 + 경고만** | 지금 체크리스트처럼 항목마다 켬/끔. 어긋나면 경고만 | 가장 단순, 자유도 최고 | 스킬 195개를 레포마다 하나씩 고르기 힘듦. 경고를 무시하면 깨진 상태로 동작 |
| 방안 2 | **템플릿 그대로 묶음** | 지금 템플릿 14종을 묶음으로 켜고 끔 | 지금 설치 방식과 같아 익숙함 | 겹침이 커서 "nextjs 를 껐는데 dream 때문에 프론트 스킬이 남아 있음" 이 자주 생김. 묶음 안 내용이 뭔지 알기 어려움 |
| 방안 3 | **겹치지 않는 블록 + 프리셋 + 기능 묶음 + 필수 의존 자동 연동** | 스킬·에이전트·언어 룰은 14.4 블록(항목마다 블록 하나)으로, 훅·룰·커맨드는 14.3 기능 묶음으로 켜고 끔. 템플릿은 "블록 여러 개를 한 번에 고르는 프리셋" 으로만 남김. 필수 의존(②)은 경고 후 같이 켜고 끔, 고정이 필요로 하는 것은 같이 고정 | 묶음 하나 끄면 정확히 그만큼 꺼짐. 레포마다 "프론트 + TS 백엔드" 처럼 몇 번 클릭으로 끝. 깨진 조합이 생기지 않음 | 블록 정의를 유지해야 함 (→ 정합성 테스트로 강제) |
| 방안 4 | **의존을 코드에서 없애기** | 디스패처가 켜진 목록(`GUGBAB_ENABLED`)을 훅에 넘기고, 훅이 꺼진 에이전트·룰은 안내에서 뺌 | 훅 쪽 어긋남(⑤ 안내류)이 사라짐 | ①②는 여전히 남음 — 단독으로는 부족, **방안 3 의 보완**으로 씀 |

> 방안 번호(1~4)는 고르는 선택지, 16장의 A~E 는 관계 종류 이름이다 — 서로 다른 것.

**추천: 방안 3 + 4.** 블록·기능 묶음이 기본 단위, 개별 항목은 묶음을 펼쳐서 예외로만 조정.

TUI 화면 예 (방안 3 을 고를 때 — 체크리스트 페이지의 "이 묶음 전부 켬/끔" 과 같은 방식):

```
 gugbab 하네스 · my-ui                 범위: [이 프로젝트]  모든 프로젝트
 ── 스택 블록 (스킬·에이전트 일괄) ─────── 프리셋: [nextjs] [java-legacy] …
 [x] 프론트 핵심      스킬 15 · 에이전트 3 · 룰 1
 [~] 프론트 도구·품질  일부 켬 (12/24)        ← 펼쳐서 개별 조정한 상태
 [ ] Java 공통
 ── 기능 묶음 ─────────────────────────────
 🔒 task-confirm      훅 2 · 룰 1
 [x] codex-review     훅 1 · 룰 1 · 커맨드 1 · 플러그인 1
 ── 개별 항목 (→ 로 묶음 펼치기) ───────────
 ⚠ spec-reviewer 를 끄면 /spec-extract·legacy-spec-extractor 도 꺼집니다 [Enter 확인]
```

### 14.7 정해야 할 것

| # | 질문 | 추천 |
|---|---|---|
| 1 | 관리 방안 | 방안 3 + 4 |
| 2 | 스택 단위 | 14.4 블록 (템플릿은 프리셋으로만) |
| 3 | 블록 안 개별 끄기 허용? | 허용 — TUI 에 "일부 켬 (12/24)" 로 표시 |
| 4 | 필수 의존이 꺼지려 할 때 | 경고 → 확인하면 쓰는 쪽도 같이 끔 (켤 때는 필요한 것을 자동으로 같이 켬) |
| 5 | 고정 전파 | 고정 항목이 필요로 하는 것(②)과 같은 기능 묶음(①)은 자동 고정 |
| 6 | 에이전트의 참고 스킬(⑤ 178건) | 묶지 않음 — 에이전트는 자기 블록의 스킬과 같이 켜지므로 대부분 자연히 맞음 |
| 7 | 14.5 어긋난 7곳 | ✅ 2026-10-16 정리 규칙대로 반영 완료 |
| 8 | `instructions-loaded` | ✅ 폐지 유지, 체크는 끔으로 반영 |

### 14.8 새 항목이 생길 때 — `relations.json` + `relation-guard` (2026-10-16 구현)

**관계 원본 `relations.json`** (레포 최상위, 1단계에서 manifest 로 합침)

| 칸 | 내용 | 지금 |
|---|---|---|
| `bundles` | 같이 켜고 끄는 기능 묶음 (A) | 6개 — task-confirm·verification·dev-quality·codex-review·memory-share·harness-authoring |
| `standalone` | 묶음 없는 훅·룰·커맨드 | 23개 |
| `blocks` | 스킬·에이전트(+언어 룰·`/spec-extract`) 스택 블록 — 스킬·에이전트는 **정확히 한 곳** | 21개 (14.4 의 19개 + 공통 에이전트 + 하네스 제작 에이전트) |
| `requires` | 필수 의존 (B) | 11건 |
| `conflicts`·`variants` | 충돌·변형 (C) | nexacro ↔ tdd-guard, typescript-quality 일반/레거시 |
| `edges` | 그 밖의 언급 분류 `"from>to": requires·uses·mention·code` | 194건 |

자동 분류(적지 않음): 스킬이 무엇이든 언급 → uses, 에이전트가 스킬 언급 → uses, 같은 묶음 안의 언급, `requires` 에 적힌 관계.

**`relation-guard` 훅** (레포 전용 — 설치되지 않음, harness-authoring 묶음)

| 언제 | 무엇을 | 결과 |
|---|---|---|
| 파일 저장 (`.claude/{hooks,agents,skills,rules,commands}`, `relations.json`) | 그 항목에서 나가는 **분류 안 된 새 언급**, 블록·묶음 **소속 없는 새 항목**, 체크리스트 줄 없는 새 훅·룰·커맨드, `relations.json` 이 **없는 항목**을 가리키는 것, 중복 소속, 틀린 분류값 | Claude 에게 안내 (막지 않음) |
| `git commit` | 레포 전체를 같은 기준으로 검사 (약 0.6초) | 하나라도 있으면 **커밋 차단** + 고칠 곳 목록 |

- 테스트: 훅 21개(정상·악성·경계) + `scripts/relations.test.js`(레포 실물 전수) + `gen-settings`(`--relation-guard` 레포 전용 옵션)·`template-ownership`(`repo-only` 소유 — 설치본에 섞이면 누수로 잡음).
- 새 훅·에이전트·스킬을 만들면: ① 블록이나 묶음에 넣고 ② 새로 생긴 언급을 `edges`(또는 `requires`)에 분류하고 ③ 훅·룰·커맨드면 `checklist-head.md` 에 항목 줄을 추가한다 — 빠뜨리면 커밋이 막힌다.

---

## 15. 0~2단계 구현 계획 (2026-10-16 승인)

목표: 이 레포에서 `GUGBAB_HOME=$PWD ./bin/gugbab-claude` 로 실제 세션이 열리고, 로그인 공유·스킬·룰 로드·디스패처를 거친 훅 차단이 실제로 동작하는 상태. 설치(`install.sh`)는 3단계, `/harness` TUI 는 4단계라 이번 범위가 아니다. 끝나면 원할 때 `~/.local/bin/gugbab-claude` 링크 하나로 다른 폴더에서도 실행해 볼 수 있다.

### 15.1 0단계 — 남은 PoC (세션 임시 폴더, 레포 수정 없음)

| # | 확인 | 결과가 2단계에 주는 영향 |
|---|---|---|
| 4 | 디스패처 하나로 묶었을 때 exit 2 차단·JSON 결정(deny/ask/allow)·`additionalContext` 가 claude 까지 그대로 전달되는가 | 실패하면 훅별 개별 연결 + 조립 시 settings 재생성 |
| 6 | 스킬·커맨드 변경이 실행 중 세션에 즉시 반영되는가 | 재시작이 필요한 종류 목록 확정 |
| 7 | `/exit` 후 `claude --continue` 가 대화를 이어가는가 | 반복 실행 구조 포함 여부 |
| 8 | `projects/` 링크로 대화기록·메모리 공유 시 문제없는가 | memory 훅 경로 계산 점검 |
| + | `plugins/` 링크로 플러그인(superpowers·codex·vercel)이 보이는가 | 실패하면 조립 때 플러그인 설정 복사 |
| + | 설정 폴더마다 첫 실행 화면이 다시 나오는가 | 나오면 `.claude.json` 완료 표시 미리 넣기 |

5번(comux 창)은 4단계, 9번(`/dev/tty`)은 3단계에서 확인한다.

### 15.2 1단계 — manifest

1. `scripts/build-manifest.js` → 레포 최상위 `manifest.json` **생성**(손으로 고치지 않음). 재료: 체크리스트 고정·켬·끔(`checklist-head.md` + `defaults.json`), 지금 `.claude/settings.json` 의 훅 연결(이벤트·matcher·timeout·인자), `relations.json`(묶음·블록·의존·충돌), `gen-settings` 의 권한 목록. 재생성 결과가 같은지 테스트로 확인
2. 이 레포 전용 `.gugbab.json` — 하네스 제작 검사 `lock`
3. 훅 경로 점검 — 훅마다 자기 위치 기준 경로와 대상 프로젝트 `.claude/` 경로 중 무엇을 쓰는지 확인하고 래퍼 실행 때 깨지는 곳 수정 (예: codex-review-guard 가 프로젝트 `settings.json` 에서 플러그인을 읽음)
4. 작은 정리: `statusline.sh` 결함 2건, `instructions-loaded` 훅 폐지
5. 결정 19 대로 파일 이동 없음 — manifest 경로는 `.claude/` 기준

### 15.3 2단계 — 래퍼 핵심 (Node 기본 기능만, npm 의존성 없음)

| 파일 | 하는 일 |
|---|---|
| `bin/gugbab-claude` (POSIX sh) | `GUGBAB_HOME` 결정 → 업데이트 → 조립 → `CLAUDE_CONFIG_DIR=… CLAUDE_SECURESTORAGE_CONFIG_DIR= claude "$@"` · 재시작 표시 있으면 `--continue` 로 다시 · `--raw` 는 하네스 없이 |
| `cli/project.js` | git 최상위로 프로젝트 이름, `~/gugbab/projects/<이름>/`, 같은 이름은 해시 붙임, `index.json` |
| `cli/resolve.js` | 적용 순서(고정 > `.gugbab.json` > 프로젝트 > profile > 기본값) + 14장 처리 순서 A→B→C→B + 필수 의존 경고 |
| `cli/compose.js` | 켜진 항목만 링크, `settings.json` 은 일반 파일(이벤트마다 디스패처 하나), `projects/`·`plugins/` 링크, 바뀐 게 없으면 건너뜀 |
| `cli/hook.js` | 디스패처 — 켜진 훅만 순서대로, exit 2 차단, 결정 deny > ask > allow, 안내 이어붙임, 시간 초과·오류 기록, 잠금 훅 항상 실행, `GUGBAB_ENABLED` 전달 |
| `cli/update.js` | 1시간에 한 번 3초 제한 fetch, fast-forward 만, 개발 모드에선 끔 |
| `cli/doctor.js` · `cli/status.js` | 링크·훅·버전·로그인 공유(내부 변수) 점검 / 현재 켜진 항목 |
| `.claude/hooks/auto-approve.js` | 12장 권한 정책 반영 |

테스트(정상·악성·경계): `.gugbab.json` 에 `../../evil.js`, 잠금 훅 끄기 시도, 변조된 manifest, 설정 폴더 밖을 가리키는 링크 / 빈 stdin, 깨진 JSON, timeout, 공백 경로, 동시 실행.

완료 기준: 이 레포에서 개발 모드 실제 세션 — 로그인 공유, 스킬·룰 로드, task-confirm-guard 등 훅이 디스패처를 거쳐 차단 + 기존 테스트 전부 통과.

### 15.4 진행 방식
- 브랜치: `feat/shim-wrapper-relation-guard-2026-10-16` 에서 이어서 (branch-protection 이 피처 브랜치에서 새 브랜치 생성을 막음 — 앞 작업이 아직 머지 전이라 같은 브랜치 사용)
- 단계마다 짧게 보고, PoC 결과로 설계가 바뀌면 그 자리에서 계획서·페이지 갱신. 커밋·PR 은 요청 시, Codex 리뷰는 결정 17 대로 맨 마지막

### 15.5 결과 (2026-10-16 완료)

**만든 것**

| 파일 | 내용 |
|---|---|
| `bin/gugbab-claude` | 실행 진입점(POSIX sh). 링크를 따라 자기 위치를 찾고, `prepare` → `CLAUDE_CONFIG_DIR=… CLAUDE_SECURESTORAGE_CONFIG_DIR= claude "$@"`. 재시작 표시가 있으면 `--continue` 로 다시(`-p` 는 안내만). `--raw`·하위 명령(`status`·`doctor`·`update`·`on`·`off`) |
| `cli/paths.js` · `project.js` · `layers.js` | 위치(코드 = `GUGBAB_HOME`, 데이터 = `GUGBAB_DATA` > 개발 모드 `~/.gugbab-dev` > 코드 폴더), 프로젝트 이름(겹치면 해시 4자, `index.json`), 적용 층 읽기·쓰기(고정은 `.gugbab.json` 에서만) |
| `cli/resolve.js` | 적용 순서 + 14장 처리 순서(A 펼치기 → B 채우기 → C 정리 → B 재검사), 고정 전파, 고정 끄기 거부 목록 |
| `cli/compose.js` | 켜진 항목 링크 · `projects/`·`plugins/`·`plans/` 링크 · `settings.json`(일반 파일, 이벤트마다 디스패처 하나, 사용자가 넣은 값 보존) · `.claude.json` 첫 실행 표시. 프로젝트가 가진 것은 건너뜀(결정 22) |
| `cli/hook.js` | 디스패처 — exit 2 즉시 차단, deny > ask > allow, 안내 이어붙임, 시간 초과·크래시는 `logs/hook-errors.log` 에 남기고 계속, hooks 폴더 밖 파일 거부, `GUGBAB_ENABLED` 전달, manifest 를 못 읽으면 도구 이벤트는 막음 |
| `cli/update.js` · `doctor.js` · `status.js` · `main.js` | 1시간·3초 fetch + fast-forward 만 / 점검(로그인 공유 내부 변수 매번 안내) / 요약 / 하위 명령 |
| `scripts/build-manifest.js` → `manifest.json` | 체크리스트 + settings + relations 로 생성(318 항목 · 이벤트 7). 레포 테스트가 "최신인지" 검사 |
| `docs/plans/page/parse-checklist.js` | 체크리스트 읽기 공용(페이지·manifest 같은 규칙) |
| `.claude/CLAUDE.common.md` · `.claude/commands/harness.md` · `.gugbab.json` | 공통 규칙 문서, `/harness`(지금은 상태 보기 + `on`/`off` 명령 — TUI 는 4단계), 이 레포 전용 설정 |

**고친 훅** — `auto-approve`(12장 권한 정책: 신규 자동 6 · 신규 확인 6 · Drive `update_file` 확인 · ArtifactData 삭제 확인), `task-confirm-guard`·`session-export`(링크 경로를 실제 위치로 판정), `codex-review-guard`·`bash-guard`·`config-change-audit`(설정 폴더 `settings.json` 도 읽음), `statusline.sh`(PENDING_TEST 를 verification.md frontmatter 기준으로 — 실제 14개, ` | ` 구분자)

**실측** (일반 터미널과 같게 이 세션의 `CLAUDE_CODE_*` 환경변수를 빼고 실행, 데이터는 임시 폴더)
- `.claude` 없는 시험 프로젝트: 로그인 공유, 공통 CLAUDE.md·룰 로드, 디스패처를 거친 한국어·확인 절차 안내 주입, 승인 없는 Write 차단(task-confirm-guard), main push 차단(branch-protection), `off hook:branch-protection` 후 다음 호출부터 bash-guard 메시지로 바뀜(재시작 없이), 고정 끄기 거부, 대화형 재시작 → `--continue` 로 대화 유지
- 이 레포 개발 모드: 세션 정상, 레포가 직접 연결한 훅 28개·항목 215개는 건너뜀(중복 실행 없음)

**테스트** — cli 11개 파일 · 페이지 4개 파일 134개, scripts 12개 파일(새 `build-manifest` 10), 훅 30개 파일(새 `statusline` 7, auto-approve 124 등) 전부 통과

### 15.6 4단계 결과 — 켜기·끄기 화면 · `/harness` · 프리셋 (2026-10-17 완료)

**만든 것**

| 파일 | 내용 |
|---|---|
| `cli/tui.js` | 화면. 묶음 → 스택 블록 → 종류별 항목 순 목록, `[x]`·`[ ]`·`[-] 1/6`(일부 켬)·🔒, 바꾼 줄 `*`, "● 저장 안 됨". 키: ↑↓ · Space · Tab(이 프로젝트 ↔ 모든 프로젝트) · `/` 검색 · `p` 프리셋 · Enter 저장 · q 닫기(바꾼 게 있으면 한 번 확인). 한글 2칸 폭 계산, 제어문자·이스케이프 제거. 저장 때는 화면에서 한 동작을 **그때의 파일 위에 다시 적용**(화면을 연 뒤 다른 세션이 바꾼 것 보존). 프로젝트 자체 `.claude` 가 가진 항목은 `↷ 자체 .claude 우선` 표시 |
| `cli/apply.js` | 켜기·끄기 기록 규칙 공용(CLI·화면) — 같은 층 정리(결정 25), 프리셋 적용, 안 바뀐 이유(🔒 체크리스트 고정 / `.gugbab.json` 고정 / 위쪽 층이 덮음 / 의존·충돌 / 이미 그 상태), 저장 → 다시 계산 → 조립 → 재시작 표시 |
| `cli/open.js` | 화면 띄울 곳 — comux(`split --from $COPAD_MUX_PANE` → `send`), tmux(`run-shell -b` + `display-popup`), macOS(osascript 새 터미널 창), 그 밖 안내. 경로는 작은따옴표로 감싸고 줄바꿈 경로·이상한 창 토큰은 거부 |
| `cli/main.js` | `preset [이름] [--all]`, `harness`(터미널에서 화면), `harness --open [--dry-run]`(/harness 가 부름), `on`/`off` 가 안 바뀐 이유를 함께 출력 |
| `bin/gugbab-claude` | claude 를 띄우기 전에 `$GUGBAB_HOME/bin` 을 PATH 앞에 — `/harness` 가 `${…}` 변수 없이 `gugbab-claude` 를 부를 수 있게 |
| `.claude/commands/harness.md` | 인자 없으면 화면 열기, `on`/`off`/`preset` 은 명령으로 |
| `relations.json` `presets` | 템플릿 → 블록 조합 13개(nextjs · java-legacy · java-modern · rust · python · unity · dream · fortune · health · nexacro + 애드온 seo-geo · spec-extraction · n8n). `build-manifest` 가 이름·구성(블록·묶음만) 검사 후 manifest 로 |

**실측에서 찾아 고친 문제**
1. **`/harness` 가 아예 동작하지 않음** — 커맨드 안 `${GUGBAB_HOME:-…}` 를 Claude Code 가 "실행 전에 검사할 수 없는 변수"로 거부(`Shell command permission check failed`). → 래퍼가 PATH 를 넣고 커맨드는 `gugbab-claude` 이름만 사용
2. **모든 프로젝트 범위 끄기가 기록되지 않음** — 연 프로젝트가 켬으로 덮고 있으면 화면이 기록 자체를 건너뜀 → 결정 25
3. 묶음을 끈 뒤 그 안 항목 하나를 켜도 안 켜짐(같은 층에서 끔이 이김) → 결정 25
4. 안 바뀌면 "바뀐 항목 없음"만 나옴 → 이유 표시. `status` 의 기본값과 다른 항목 목록이 수백 개 그대로 찍힘 → 12개 + 개수

**실측** (이 세션의 `CLAUDE_CODE_*` 를 뺀 일반 터미널 조건, 홈 아래 시험 프로젝트 2개 A·B, 데이터는 임시 폴더)
- 명령: 이 프로젝트만 끄기 / `--all` / 우선순위(프로젝트 > 모든 프로젝트) / 고정 거부 / 묶음·블록 / `.gugbab.json` lock / 이상 입력 — 25개 확인 통과
- 화면(pty 에 실제 키 입력): 묶음 끄고 저장 → 실제 claude 세션에서 tdd-guard 안 돎 → 검색으로 tdd-guard 만 켬 → 다시 돎 → 모든 프로젝트 범위로 끔 → B 에선 안 돌고 A 는 이유 표시하며 유지 → B 에서 다시 켬 → 돎 · 프리셋 rust · 🔒 거부 · 저장 안 하고 닫기 확인 · 바꾼 것 없이 Enter
- 실제 claude 세션의 `/harness`: 상태·고정 거부·묶음 끄기·프리셋 목록, 인자 없으면 **comux 옆 창이 실제로 열림** → 그 창에 키를 보내 켜고 저장 → 재시작 표시 생성 → 창 닫힘
- 확인 못 한 것: tmux(이 PC 에 없음 — 계획만 `--dry-run` 확인), macOS 새 터미널 창(AppleScript 문법만 `osacompile` 로 확인, 실제 창은 안 엶)

**테스트** — 새 `apply` 13 · `open` 11 · `tui` 19, `main`·`bin`·`status`·`layers`·`build-manifest` 보강. 전체 병렬 실행 결과는 README 2026-10-17 행

---

### 15.7 3단계 결과 — 설치 `install.sh` (2026-10-17)

**만든 것**
- `install.sh` (bash, 전체를 `main()` 으로 감싸 반쪽 다운로드 실행 방지, sudo 없음) — 도구 확인(git·node 18+·claude 는 없으면 경고만) → `~/gugbab` 에 clone(이미 우리 설치본이면 fetch 후 갱신, 로컬 변경이 있으면 멈춤, 남의 폴더면 멈춤) → 꺼낼 버전 결정(`--version` 고정 / `--ref` 브랜치·태그 / 기본 stable 태그, **태그가 아직 없으면 main**) → `state/channel.json` 기록 → `~/.local/bin/gugbab-claude` 링크(일반 파일이 있으면 멈춤) → PATH 안내 → `gugbab-claude doctor`. `--uninstall` 은 우리 링크·우리 설치본만 지운다
- 계획서 3.2 와 달라진 점: npm 의존성 단계 없음(결정 24), 대화기록 공유 질문 없음(항상 공유), 셸 설정 자동 수정 없음(넣을 한 줄만 안내), `--ref` 추가
- `cli/update.js` 에 **branch 채널** — `--ref <브랜치>` 로 설치하면 실행할 때 `origin/<브랜치>` 로 fast-forward. 브랜치 이름은 옵션처럼 보이는 이름·`..` 거부
- 테스트 `scripts/install-sh.test.js` 14개 — 임시 HOME + 임시 git 원격으로 실제 설치·재설치·제거 (악성: 옵션·경로 조작 브랜치 이름, 홈·루트·상대경로 설치 위치, 남의 폴더 설치·제거, 링크 자리 일반 파일, 로컬 변경 덮어쓰기 / 경계: 없는 브랜치·잘못된 버전·채널, 원격 불통, 래퍼 없는 브랜치)

**실측 (푸시 전 — 작업 트리 스냅샷을 임시 원격으로, 임시 HOME 에 설치)**
- `install.sh --ref <브랜치>` → clone · 링크 · `state/channel.json`(`branch`) · doctor 출력까지 정상. 설치된 `gugbab-claude` 가 PATH 에서 잡히고, 배포 모드(`GUGBAB_HOME` 없음)에서 `status` · `preset rust` · `harness --open --dry-run`(comux 옆 창 계획) 동작. 프로젝트 설정은 설치 폴더 `projects/` 에 쌓이고 설치 폴더 git 은 깨끗(gitignore)
- 원격 브랜치에 새 커밋 → `gugbab-claude update` 가 그 브랜치로 fast-forward (`2a82da3 → … 9053fb8`)
- `--uninstall --yes` → 우리 링크·설치 폴더만 삭제, 프로젝트 폴더는 그대로
- 임시 HOME 에선 macOS 키체인이 없어 doctor 가 로그인 경고를 냄(실제 홈에선 해당 없음). doctor 의 "/harness … 4단계" 옛 문구 정리

**실측 (푸시 후 — GitHub 에서 받아 설치, 2026-10-17)**
- `raw.githubusercontent.com/puk0806/gugbab-claude/<브랜치>/install.sh` 를 받아 로컬 파일과 같은지 확인 → 임시 HOME 에서 `--ref <브랜치>` 실행: GitHub clone(060a2ec) · 링크 · `state/channel.json`(`branch`) · PATH 안내 · doctor 정상. 설치본에서 `status`·`preset` 동작
- 실제 홈에서 doctor 의 로그인 점검 ✓(기본 키체인 항목 있음 — 임시 HOME 의 경고는 키체인이 없어서)
- 남은 것: 사용자가 기본 터미널에서 실제 홈에 설치해 실사용(이슈는 PR 에서)

**실측 (실제 설치본 — 사용자가 main 에서 설치한 `~/gugbab`, 2026-10-17)** — 켜기·끄기 데이터만 임시 폴더로 두고(`GUGBAB_DATA`) 시험 프로젝트 A·B 에서 설정을 바꿀 때마다 실제 `claude -p` 세션의 시작 정보(에이전트·커맨드·스킬·플러그인 목록)와 대조
- 통과: 프리셋 rust(A 만 rust 에이전트·axum 스킬 생김) · `block:rust` 끄기 · `rule:git.md` 끄기 → `/commit` 같이 꺼짐·다시 켜면 복귀 · 모든 프로젝트로 끄고 A 만 켜기(A 켬·B 끔, 🔒 고정 에이전트는 이유 표시) · B 의 `.gugbab.json` lock·enable(B 만 적용, lock 끄기 거부) · 프리셋 nexacro → tdd-guard 자동 끔(충돌 경고) · 깨진 프로젝트 설정에도 세션 시작 · 세션 안 `/harness preset`
- **버그 — 설정 항목 7개를 켜고 끌 수 없었음**: 이름에 공백·한글·백틱이 있는데(`setting:superpowers 플러그인`) 켜기·끄기가 이름을 영문·숫자 패턴으로 검사해 명령·화면 모두 "항목 이름이 올바르지 않습니다". → `cli/apply.js` 가 패턴 대신 **manifest 에 있는 이름인지(허용 목록)** 로 판정(제어문자·`..`·앞뒤 공백은 계속 거부). 고친 뒤 실제 세션에서 superpowers 플러그인이 빠졌다 돌아오고, 상태줄 끄기가 조립된 settings.json 에 반영, 화면 Space·저장도 확인
- **약점 — 데이터 폴더를 따로 두면 버전·채널 표시가 틀림**: 채널 기록은 설치 폴더(`~/gugbab/state`)에 있는데 데이터 폴더 쪽을 읽었음(평소엔 같은 폴더라 무관). → `readChannel` 이 설치 폴더 것을 먼저, 없으면 데이터 폴더 것(일반 파일·객체만, 링크 무시)
- 고친 코드로 같은 시나리오 재실행 19/19 통과

### 15.8 5단계 결과 — 릴리스 v1.0.0 · v1.0.1 (2026-10-17)

- **v1.0.0** (PR #26 머지 a9d67c3) — 태그 + [GitHub Release](https://github.com/puk0806/gugbab-claude/releases/tag/v1.0.0). 사용자 설치본은 태그가 없던 때 설치돼 main 채널이었음 → `status` 가 "안정 버전 v1.0.0 이 있습니다 — 설치 명령을 다시" 안내 → 재설치로 stable 전환(프로젝트 설정 유지)
- stable 설치본은 main 에 PR #27 이 머지돼도 `v1.0.0` 에 머묾 (`update` = "이미 최신", 실행 시 자동 확인도 움직이지 않음)
- **v1.0.1** (PR #27 머지 8e86bfb — 화면 아이콘·Claude Code 버전 확인 훅·설정 항목 버그 수정) — 태그 + [Release](https://github.com/puk0806/gugbab-claude/releases/tag/v1.0.1). 사용자 설치본에서 1시간 확인 기록을 지우고 세션을 실행하자 **`[gugbab] 하네스 v1.0.0 → v1.0.1`** 로 자동 갱신(별도 명령 없이), 1시간 안에 다시 실행하면 확인하지 않음
- v1.0.1 설치본으로 16장 시나리오 32/32
- 태그 보호 규칙은 아직 안 켬 — 사용자 1.0.x 테스트가 끝나면 켠다(결정 28)

### 15.9 6단계 결과 — 옛 복사 설치 삭제 (2026-10-17, 결정 27 "래퍼로만 사용")

**지운 것**: `project-install.sh`(2,216줄) · 옛 설치본 도구 `scripts/install-cleanup.js`·`migrate-settings.js`·`prune-option-excluded.js`·`write-install-manifest.js`(+테스트) · 템플릿 실제 설치 E2E·소유·참조 검사 `template-separation`·`template-ownership`·`installed-refs` · 템플릿 문서 `docs/templates/` 14개 · 예시 `examples/` 16개 · `instructions-loaded` 훅(결정 21 — 옛 설치와 함께 삭제, 훅 32→31)

**남기고 고친 것**: `gen-settings.js`(이 레포 settings.json 원본 생성기 — 주석 정리, instructions-loaded 배선 제거) · README·docs 수치 검사는 새 `scripts/docs-counts.test.js` 로 옮김(옛 `template-docs-counts` 의 템플릿 부분은 삭제) · `skill-index.js`(docs-counts 가 씀) · 규칙·문서의 옛 설치 언급을 래퍼 기준으로(`agent-design.md`·`docs/rules/README.md`·`docs/skills/README.md`·`.claude/skills/CLAUDE.md`, 에이전트 4개의 "설치 템플릿에 따라" → "이 프로젝트에서 꺼 두었을 수 있음") · 체크리스트·`relations.json`·`settings.json`·manifest(319 항목, 고정 33·켬 70·끔 216)

**그대로 둔 것**: 스킬 `verification.md` 3개의 옛 설치 언급(과거 검증 기록, 여러 개 일괄 수정은 규칙상 따로 승인) · 계획서·CHANGELOG 의 과거 기록

## 16. 실사용 테스트 시나리오 — `scripts/wrapper-e2e.sh` (2026-10-17 사용자 요청)

릴리스·큰 변경 뒤에 실제 claude 세션으로 확인하는 시나리오. 켜고 끈 결과를 **세션 시작 정보**(claude 가 로드한 에이전트·커맨드·스킬·플러그인 목록)와 **실제 동작**(훅 안내)으로 대조한다. 켜기·끄기 기록은 임시 데이터 폴더(`GUGBAB_DATA`)에만 쓰고, 시험 프로젝트는 홈 아래 임시 폴더에 만든 뒤 지운다 — 사용자의 실제 설정은 건드리지 않는다.

```bash
sh scripts/wrapper-e2e.sh --expect-version v1.0.1   # 설치본(~/.local/bin/gugbab-claude)
sh scripts/wrapper-e2e.sh --dev                     # 이 레포 작업 트리(개발 모드)
```

| 구역 | 확인하는 것 |
|---|---|
| 0. 버전·상태 | `status` 출력, 버전 줄이 기대 버전(`--expect-version`) |
| 1. 종류별 껐다 켜기 | **에이전트**(qa-engineer 끄기·켜기 → 세션 에이전트 목록) · **스킬**(axum 켜기·끄기 → 스킬 목록) · **커맨드**(/commit) · **룰**(git.md 끄기 → 필요로 하는 /commit 도 꺼짐 안내·재시작 안내·조립 폴더 링크 제거) · **설정**(superpowers 플러그인 — 공백·한글 이름 → 플러그인 목록) · **묶음**(codex-review → 훅·룰·커맨드 3개) · **블록**(rust → 에이전트) · **훅 실제 동작**(tdd-guard 끄면 안내 없음, 켜면 안내) · **🔒 고정 거부**(bash-guard·claude-version-check·parallel-hint) |
| 2. 폴더(워크스페이스) 분리 | alpha 에 켠 프리셋이 beta 에 없음 · 프로젝트마다 설정 폴더 다름 · **같은 이름 폴더**(x/app·y/app)는 다른 프로젝트 · **하위 폴더**에서 열어도 git 최상위 프로젝트 설정 · **git 이 아닌 폴더**도 동작 · **동시 세션** 두 개가 각자 설정 · **모든 프로젝트(--all)** 와 프로젝트별 덮기 · **`.gugbab.json`** enable·lock 이 그 프로젝트에만 |
| 3. 세션 안 `/harness` | `/harness preset` 이 설치본 PATH 의 `gugbab-claude` 로 프리셋 목록 표시 |

**결과 기록**
| 날짜 | 대상 | 결과 |
|---|---|---|
| 2026-10-17 | 설치본 v1.0.1 | 32/32 (처음 31/32 — 실패 1건은 시나리오 기대값 오류, 고친 뒤 32/32) |
| 2026-10-17 (깨끗한 세션 리뷰 후 보강) | 설치본 v1.0.1 | 34/34 — 전제 검사 2개 추가. 시나리오 뒤 `~/gugbab` 버전 그대로(8e86bfb), `~/.claude/projects` 시험 기록 0 |
| 2026-10-17 | 가짜 claude(`GUGBAB_E2E_CLAUDE=/usr/bin/false`) | 실패 19 · 전체 실패(rc=1) — claude 가 실패하면 시나리오가 실패로 잡히는지 확인용 |

**보강 (2026-10-17 깨끗한 세션 리뷰 지적)**: 설치본 모드에서도 `~/gugbab` 이 자동 업데이트되지 않게 시작 때 "방금 확인함" 기록을 임시 데이터 폴더에 둠 · 시험 세션 대화 기록(`~/.claude/projects/<임시 경로를 바꾼 이름>`)을 끝날 때 지움 · 세션 시작 정보를 못 받으면 "읽기실패"로 검사 실패 · 설정 폴더 이름·소스 파일 생성 같은 전제를 별도 검사로 · Ctrl-C 면 정리 후 종료

화면(TUI) 아이콘은 이 스크립트에 넣지 않았다(가짜 터미널이 필요) — pty 로 따로 확인: 설치본 v1.0.1 에서 ✅·⬜·🟨·🔒 표시.

## 17. 윈도우 지원 계획 (2026-10-20 — 결정 41, 상세는 [별도 계획서](2026-10-20-windows-support.md))

**상태: 0단계 PoC 대기 · 1단계 구현** — 사용자 윈도우 PC 에서 PoC 스크립트(브랜치 `feat/windows-support-poc-2026-10-20` 의 `scripts/poc/`)를 실행해 결과 JSON 을 회수한다. 맥에서 판정 로직은 검증함(`.ps1` 껍데기는 미실행). PoC 와 무관한 **1단계(보안·공통 정리)는 2026-10-20 구현** — bash-guard 가 `git.exe`·`\` 경로·`.exe` 를 떼고 판정·`cmd`·`powershell` 은 확인, `/dev/stdin` 훅 8개를 fd 0 으로(보안 훅 2개는 입력 실패 시 차단), CRLF frontmatter, `.gitattributes`. 상세는 윈도우 계획서 5.1.

### 17.1 지금 윈도우에서 일어나는 일

| 층 | 결과 | 대표 원인 |
|---|---|---|
| 래퍼 | PowerShell·cmd 에서 실행 불가 | `bin/gugbab-claude` 가 sh(dash `set -m`) |
| 조립 | **첫 실행부터 예외** | `compose.js:18` `UNSAFE_SHELL` 이 `\` 금지, `:151` 심볼릭 링크(개발자 모드 필요) |
| 보안 훅 | **조용히 통과(fail-open)** | `/dev/stdin` 읽기 8개(branch-protection·parry·tdd·fake-impl·adversarial·typescript-quality·codex-review·cc-notify), bash-guard 의 `/` 기준 경로 판정·`.exe` 이름 미정규화 |
| 기능 | 확인 창 폭증·메모리 미러 안 됨·결정 39 무효 | `startsWith('/')`, `split(':')`(윈도우 경로마다 `C:`), `includes('/memory/')` |
| 저장소 | `.sh` CRLF 로 문법 오류 | `.gitattributes` 없음 |
| 테스트 | 60개 파일 중 27개 확실 실패·~17개 환경 의존 | `sh` 실행·`/tmp`·권한 비트·`echo '…' \| node` 러너 |

### 17.2 단계

| 단계 | 내용 | 완료 기준 |
|---|---|---|
| 0 | PoC — 로그인 공유(P6)·설정 폴더 스킬 인식(P7)이 방향을 가름 | 결과 회수·방향 확정 |
| 1 | 공통 정리·보안(맥 동작 변화 없음): `.gitattributes`, stdin `readFileSync(0)`, bash-guard 이름 정규화, CRLF, `path.delimiter`, 공용 경로 헬퍼 | 맥 전체 + 윈도우식 입력 적대 테스트 |
| 2 | 훅 윈도우 경로 판정 + `windows-latest` CI | 윈도우 CI 훅 테스트 전부 |
| 3 | 래퍼·조립(Node 런처·junction/하드링크/복사·신뢰 키 `C:/`·상태줄 Node·로그인 방식·PowerShell 도구 끔·doctor) | 사용자 PC 에서 세션 열림 |
| 4 | `install.ps1`·E2E Node 이식 | 새 PC 한 줄 설치 |
| 5 | 수동 체크리스트 M1~M13 → v1.1.0 | 전부 통과 |

### 17.3 정해야 할 것 (PoC 뒤)

로그인 방식(빈 값 내부 변수 → 하드링크 → 실행 전후 동기화 → `setup-token` 순으로 시험 결과 고름) · PowerShell 도구 끔 확정 · 1단계(맥에도 있는 보안 결함)를 윈도우 일정과 별개로 먼저 할지.

---

## 문서 갱신 방법

결정이 바뀌면 이 계획서와 체크리스트 md 를 고치고, 같은 턴에 페이지를 다시 만들어 같은 링크로 게시한다. 버전 파일을 따로 만들지 않는다.

```bash
P=docs/plans/page
node $P/inv.js . /tmp/gugbab-inv.json                                  # 레포의 스킬·에이전트·룰·커맨드 목록 추출
node $P/gen-md.js /tmp/gugbab-inv.json $P/checklist-head.md docs/plans/2026-10-15-harness-item-checklist.md $P/descriptions.json $P/defaults.json
node $P/build-page.js docs/plans/2026-10-15-gugbab-claude-shim-wrapper.md docs/plans/2026-10-15-harness-item-checklist.md /tmp/gugbab-plan.html
```

- 설정·훅·룰·커맨드 설명은 `checklist-head.md` 에 직접 쓴다. 에이전트·스킬 설명은 `descriptions.json`(`"agent:이름"`·`"skill:이름"` → 요약·하는 일·이럴 때·예시·주의)에 있고, 없는 항목은 원본 frontmatter 설명으로 대신 나온다. 에이전트·스킬을 추가하면 이 파일에도 설명을 추가한다.
- 테스트: `node --test docs/plans/page/*.test.js`

체크리스트 페이지에서 고른 값은 페이지 저장소 `checklist/selection` 문서의 `changes`(추천과 다른 값만)에 남는다. 예전 두 칸 형식(`repo`·`project`)이 남아 있으면 페이지를 열 때 합쳐서 다시 저장된다(같으면 그 값, 한쪽만 고정이면 고정 아닌 쪽). "프로젝트 추천: 끔" 안내는 체크리스트 md 의 항목 아래 `  - 프로젝트 추천: 끔` 줄로 한다. 확정할 때 그 값을 기본값으로 옮긴다 — 설정·훅·룰·커맨드는 `checklist-head.md` 항목 줄(체크 = 고정, `(기본 켬/끔)`), 에이전트·스킬은 `defaults.json`(`"agent:이름": "lock"|"on"|"off"`, `"skill:이름": "on"`; 없는 항목은 `gen-md.js` 의 기본값). 옮긴 뒤 페이지 저장값을 비우면 "추천에서 바꿈"이 0 으로 돌아간다. 묶음 안 상태가 섞이면 14.5 정리 규칙으로 맞춘다.
