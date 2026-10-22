# gugbab 하네스 윈도우 지원 계획서

> 작성: 2026-10-20 · 최종 수정: 2026-10-22 · 상태: **0단계 PoC 완료(4.4) · 1~4단계 구현·윈도우 실측 완료(5.1·5.2) · 맥 회귀(5.3)·윈도우 재확인(5.4)·맥 확인(5.5)·CI 맥·윈도우 통과 완료** — 남은 것: 릴리스(PR, bump 1.0.15). 사용자 PC 수동 체크리스트 일부(M6·M9·M10)는 이 PC 환경상 불가
> 관련: [래퍼 개편 계획서](2026-10-15-gugbab-claude-shim-wrapper.md) 결정 41 · 17장(요약)
> 기준 버전: 하네스 v1.0.11 · Claude Code 2.1.304

---

## 1. 목표와 범위

| 항목 | 내용 |
|---|---|
| 목표 | 윈도우 네이티브(PowerShell 7 · Windows PowerShell 5.1 · cmd · Windows Terminal)에서 `gugbab-claude` 설치·실행·`/harness`·업데이트·훅 차단이 macOS 와 **같은 결과**로 동작 |
| 원칙 1 | **macOS 동작은 바꾸지 않는다** — 단계마다 `scripts/wrapper-e2e.sh --dev` 와 전체 테스트(맥 1,882개 통과 기준)를 그대로 통과 |
| 원칙 2 | **보안 훅은 실패하면 막는다(fail-closed) 쪽으로** — 지금은 윈도우에서 입력을 못 읽으면 조용히 통과(exit 0)한다 |
| 원칙 3 | 공식 문서에 있는 동작만 기댄다. 문서에 없는 것(로그인 공유 내부 변수, `sessions/` 구조)은 PoC 로 실측하고 `doctor` 가 매번 점검 |
| 범위 밖 | WSL(리눅스 경로로 동작 — 별도 확인), VS Code 확장·데스크톱 앱(래퍼를 거치지 않음, macOS 와 같음), comux·tmux(윈도우 없음 → 새 창 방식) |
| 전제 | **Git for Windows 필수**(훅·Bash 도구·상태줄이 Git Bash 로 돎), Node 22 이상 |

---

## 2. 공식 문서로 확인한 사실 (2026-10-20)

| # | 사실 | 판정 | 출처 |
|---|---|---|---|
| F1 | 윈도우 로그인 정보는 `%USERPROFILE%\.claude\.credentials.json` **파일**. `CLAUDE_CONFIG_DIR` 을 바꾸면 그 폴더 아래로 옮겨가고 새 폴더는 로그인을 다시 안내 | VERIFIED (파일 복사·링크로 공유되는지는 미확인 → PoC) | code.claude.com/docs/en/authentication |
| F2 | `claude setup-token` → `CLAUDE_CODE_OAUTH_TOKEN`: 구독 인증, 1년, 모델 요청만(Remote Control·claude.ai 커넥터 불가) | VERIFIED | authentication, env-vars |
| F3 | Git for Windows 는 선택이지만 Bash 도구·Monitor 도구에 필요. `CLAUDE_CODE_GIT_BASH_PATH` 로 위치 지정 | VERIFIED | setup, env-vars |
| F4 | 설치: `irm https://claude.ai/install.ps1 \| iex`, `install.cmd`, winget, npm(Node 22+, 같은 네이티브 바이너리). winget 은 자동 업데이트 안 됨 | VERIFIED | setup |
| F5 | **훅 `command` 는 윈도우에서 Git Bash 로, Git Bash 가 없으면 PowerShell 로 실행.** `shell` 필드(`bash`/`powershell`), `args` 배열(셸 없이 직접 실행) 지원. 이벤트 JSON 은 stdin | VERIFIED | hooks |
| F6 | PowerShell 도구: Git Bash 가 있어도 claude.ai 계정에서 기본 켜짐. `CLAUDE_CODE_USE_POWERSHELL_TOOL=0` 이면 끔. **Git Bash 가 있는 윈도우에서 `Bash(...)` deny 규칙이 있으면 PowerShell 도구가 경고 없이 꺼짐** | VERIFIED | tools-reference |
| F7 | 상태줄도 Git Bash(없으면 PowerShell). **Git Bash 는 이스케이프 안 한 `\` 를 먹으므로 경로는 `/` 로** | VERIFIED | statusline |
| F8 | 세션 간 메시지: 네이티브 윈도우는 v2.1.234+, 세션별 named pipe. WSL 세션과는 서로 안 닿음 | VERIFIED (`sessions/` 폴더 구조는 문서에 없음 → PoC·수동) | cross-session-messaging |
| F9 | `.claude.json` 신뢰 기록 키: `\`→`/` 로 바꿔 `C:/Users/...` 로 저장, **드라이브 문자 대소문자는 실행 경로마다 다름**(VS Code `c:`, 터미널 `C:`) — 같은 폴더가 두 키로 | 이슈 본문 기준(#75855 open) | github.com/anthropics/claude-code/issues/75855 |
| F10 | 설정 폴더의 skills 를 윈도우가 무시(#31649), junction 스킬 Unknown(#41177) — **둘 다 "고쳐서" 닫힌 게 아니라 중복·stale 로 닫힘**. 지금 버전 동작은 실측 필요 | VERIFIED(상태) | issues #31649 · #41177 · #34586 · #36172 |
| F11 | 네이티브 윈도우는 샌드박스 미지원 | VERIFIED | setup |

---

## 3. 코드 전수 조사 결과 — 40건 (v1.0.11)

심각도: **A 시작 실패** > **B 보안 fail-open·약화** > **C 기능 이상** > **D 테스트만**. "환경 의존"은 PoC 결과로 확정.

### 3.1 A — 시작 실패 (7)

| 위치 | 문제 | 고칠 방법 |
|---|---|---|
| `bin/gugbab-claude` | sh 스크립트(확장자 없음, `dash`·`set -m` 작업 제어) — PowerShell·cmd 에서 실행 불가 | 로직을 `cli/launch.js` 로 옮기고 윈도우는 `gugbab-claude.cmd`·`.ps1` 껍데기. 작업 제어 블록은 윈도우에서 생략(Ctrl+Z 없음) |
| `cli/compose.js:18,99` (+`apply.js:95`) | `UNSAFE_SHELL` 이 `\` 금지 → 모든 윈도우 경로에서 **첫 조립부터 예외** | 윈도우는 명령에 넣을 경로를 `/` 로 바꾼 뒤 검사(`"` `$` `` ` `` 줄바꿈 금지는 유지) |
| `cli/compose.js:151` | `symlinkSync` 타입 생략 — 개발자 모드 없으면 EPERM | 폴더 `junction`(권한 불필요), 파일 하드링크 → 실패 시 복사(조립 때마다 다시 복사, 관리 목록에 방식 기록) |
| `install.sh:143` → `bin/gugbab-claude:10-17` | Git Bash `ln -s` 는 **복사본**을 만듦 → 자기 위치를 `~/.local` 로 오판, 재설치는 "일반 파일 있음"으로 중단 | 윈도우는 `install.ps1` + 한 줄 런처 `.cmd` |
| `.gitattributes` 없음 | autocrlf 로 `.sh` 가 CRLF → `set -u\r` 문법 오류 | `* text=auto eol=lf` (+ `*.cmd`·`*.ps1` 은 `eol=crlf`) |
| `cli/compose.js:29,34,246-247` | `mode & 0o777 === 0o600` 이 윈도우에서 항상 거짓 → 매 실행 `.claude.json` 다시 씀, 다른 세션이 잡고 있으면 rename EPERM/EBUSY(간헐) | 윈도우는 mode 비교 생략 + `atomicWrite` 재시도(EPERM·EBUSY·EACCES, 짧은 지연 5회) |
| `.claude/settings.json` 훅 30개 `node "$CLAUDE_PROJECT_DIR"/…` | 환경 의존 — Git Bash 면 동작, PowerShell 로 떨어지면 `$CLAUDE_PROJECT_DIR` 해석이 달라 전부 실패 | F5 대로 Git Bash 필수화 + `doctor` 점검 (조립 settings 는 절대경로 `/` 표기) |

### 3.2 B — 보안 fail-open·약화 (8)

| 위치 | 문제 | 결과 | 고칠 방법 |
|---|---|---|---|
| `/dev/stdin` 읽기 8개: branch-protection·parry·tdd-guard·fake-impl-guard·adversarial-test-guard·typescript-quality·codex-review-guard·cc-notify | `C:\dev\stdin` ENOENT → catch → exit 0 | **main push 보호·시크릿/인젝션 차단·TDD·가짜 구현·적대 테스트·tsc·Codex 가드 전부 꺼짐** | `fs.readFileSync(0, 'utf8')` + 보안 훅은 입력 파싱 실패 시 차단(exit 2) |
| `branch-protection.js:55` | `execSync('… 2>/dev/null')` 가 cmd.exe 로 실행 → 브랜치 못 읽어 통과 | stdin 을 고쳐도 남는 두 번째 fail-open | `execFileSync('git', [...], { stdio: [..., 'ignore'] })` |
| `bash-guard.js:1074-1077,814,1751-1767` | 명령 이름에서 `.exe` 를 안 뗌, `cmd`·`powershell` 미등록 | **`git.exe push --force`, `rm.exe -rf ~`, `cmd //c "rd /s /q …"`, `powershell.exe -c Remove-Item -Recurse …` 가 PermissionRequest 에서 자동 승인** — 2026-10-20 맥에서도 같은 판정 실측(윈도우에서만 실제 실행됨) | 이름 정규화(`소문자` + `.exe/.cmd/.bat/.ps1` 제거 + `\` 구분자), `cmd`·`powershell`·`pwsh` 는 인자 판정 불가 → ask |
| `bash-guard.js:1313→1393` | `isAncestorOrSame` 이 `/` 기준 | 설치 폴더(GUGBAB_HOME) 쓰기 보호(결정 39) 무효 | `path.relative` 기반 + 윈도우 대소문자 무시 |
| `bash-guard.js:1303,1329-1336,809` | `startsWith('/')`, `abs === '/'`, `/\/\.ssh/`, POSIX 시스템 폴더만 | `rm -r "$HOME"`, `rm -rf /c/Users/x`, `rm ~/.ssh/id_rsa` 의 deny 가 ask 로 약화 | MSYS `/c/…` ↔ `C:\…` 변환, `C:\Windows`·`C:\Program Files` 등 추가 |
| `bash-guard.js:86-99,776-779` | 금지 쓰기 위치가 POSIX 뿐 | PowerShell 프로필·시작프로그램 폴더 쓰기가 자동 허용 | 윈도우 민감 경로 추가 |
| `protect-secrets.js:45-76` | 대소문자 구분, `~/` 만 확장 | `~\.aws\credentials`, 대소문자 다른 `.SSH` 가 빠져나감, `%APPDATA%\gcloud` 없음 | 윈도우는 소문자 비교, `~\` 확장, 위치 추가 |
| Bash matcher 훅 6개(branch-protection·relation-guard·release-version-guard·deliverable-guard·test-fake-guard·package-manager-guard) | PowerShell 도구 명령은 안 봄 | PowerShell 로 commit·push 하면 가드 우회(auto-approve 확인 창만 남음) | 윈도우 하네스 settings 에 `CLAUDE_CODE_USE_POWERSHELL_TOOL=0` (결정 41-②) |

### 3.3 C — 기능 이상 (24, 주요만)

| 위치 | 문제 → 고칠 방법 |
|---|---|
| `bash-guard.js:204-216`·`auto-approve.js:122-131` | `startsWith('/')`·`/tmp`·`/var/folders` 고정 → 프로젝트 안 Write 도 매번 확인, `%TEMP%` 차단 → `path.isAbsolute`·`path.relative`·`os.tmpdir()`+realpath |
| `bash-guard.js:232-627` 안전 패턴 | `/` 전제 → cd+git·heredoc 자동 허용 안 됨(확인 창 증가) → 위와 같음 |
| `bash-guard.js:169`, `compose.js:94,205` | 경로 목록 `split(':')`, `:` 든 경로 제외 → **윈도우는 모든 경로에 `C:` 가 있어 결정 39(메모리 폴더 허용)가 항상 꺼짐** → `path.delimiter`(양쪽 같이) |
| `bash-guard.js:1558` | `ps -axo` → `tasklist` 분기 |
| `memory-sync.js:23` | `includes('/memory/')` → 메모리 미러 안 됨 → `\`→`/` 정규화 후 비교 |
| `deliverable-guard.js:76-122` | `/` 정규식·`split('/')` → README 동기화 검사 꺼짐 → 정규화 |
| frontmatter 정규식 `^---\n`: agent-md-guard·skill-md-guard·verification-guard·`docs/plans/page/inv.js`·`parse-checklist.js` | CRLF 파일 오탐 차단, 체크리스트 항목 0개 → 읽은 직후 `\r\n`→`\n` |
| `codex-review-guard.js:36` `which codex`, `typescript-quality.js:141` `cd "…" &&` | cmd 에서 실패 → `execFileSync` + `cwd` |
| `auto-format.js:51-90` | `.bin/biome` 확장자 없는 shim, `.venv/bin` → PATHEXT·`Scripts\` |
| `claude-version-check.js:81`, `doctor.js:8,18` | `execFileSync('claude')` — npm `claude.cmd` 는 ENOENT/EINVAL → 공용 `findExecutable`(PATHEXT, `.cmd` 는 셸 경유) |
| `bin/gugbab-claude:96` 로그인 공유 | `CLAUDE_SECURESTORAGE_CONFIG_DIR=` 는 macOS 키체인 방식. **윈도우는 PowerShell 에서 빈 값 환경변수를 만들 수 없음**(빈 값 = 삭제) → Node 런처가 넘김 + PoC 결과로 방식 결정 |
| `open.js:28-38` | POSIX 따옴표·osascript·tmux 만 → `wt.exe new-tab`(없으면 `start powershell`) |
| `session-export.js:104` ↔ `codex-review-guard.js:279` | node 는 `C:\tmp`, Git Bash `tee /tmp` 는 `%TEMP%` → 양쪽 `os.tmpdir()` |
| `project.js:50`·`layers.js:50`·`update.js:138`·`claude-version-check.js:75`·`wrapper-version-check.js:83` | rename 덮어쓰기 EPERM(백신) → 공용 `atomicWrite` 재시도 |
| `setup.sh`, `statusline.sh` | 링크·bash 의존 → 상태줄은 Node 로 이식(`statusline.js`), setup 은 윈도우 미지원 명시 |
| `main.js:180,197` | mintty(Git Bash 창)는 isTTY false → 첫 실행 질문·TUI 꺼짐 → Windows Terminal 권장 + 안내 |
| `cli/paths.js:10` | `HOME` 우선 → 윈도우는 `os.homedir()`(USERPROFILE) 우선 |
| `compose.js:79` `/\.claude\/hooks\//` | 프로젝트가 `\` 로 쓴 훅 감지 못해 중복 실행 → `[\\/]` |
| `compose.js:240-243` 신뢰 기록 | `homeCj.projects[project.root]` 를 `\` 경로로 찾음 → F9 대로 `C:/…` + 드라이브 대소문자 양쪽 조회 |
| `update.js` fetch 3초 | 윈도우 git 첫 실행·자격 증명 관리자 → 시간 늘림 + `GCM_INTERACTIVE=never` |
| `cc-notify.js` | darwin 전용(의도) — 윈도우 토스트는 후순위 |

### 3.4 D — 테스트

| 구분 | 파일 |
|---|---|
| 윈도우에서 확실히 실패 (27) | cli: `bin`·`compose`·`main`·`paths`·`open` / hooks: branch-protection·parry·tdd-guard·fake-impl-guard·adversarial-test-guard·typescript-quality·codex-review-guard·**auto-approve(테스트 러너가 `echo '…' \| node` — cmd 에서 작은따옴표 안 됨)**·skill-md-guard·verification-guard·deliverable-guard·bash-guard·bash-guard-harness·task-confirm-guard·memory-sync·memory-pull·claude-version-check·auto-format·session-export / scripts: install-sh |
| 환경 의존 (~17) | 심볼릭 링크 권한: doctor·hook·update·layers·first-run·wrapper-version-check·parallel-hint·test-fake-guard·staleness-check·release-version-guard·release-version·verification-consistency / bash 필요: statusline·gen-settings / CRLF: docs/plans/page·build-manifest·docs-counts |
| 테스트 기반 | 훅 테스트는 자체 러너(`결과: N/M 통과`), cli·scripts 는 `node --test`. 훅 테스트의 `execSync('echo … \| node')` 는 공용 헬퍼(`spawnSync` + `input`)로 바꿔야 윈도우에서 돎 |
| 맥에서 확인 | 래퍼 세션 안에서 테스트를 돌리면 `GUGBAB_*`·`CLAUDE_CONFIG_DIR` 이 새어 `bin.test.js` 2개 실패 — 환경을 지우면 통과. CI·PoC 는 지우고 돌린다 |

---

## 4. 0단계 — PoC (사용자 윈도우 PC)

### 4.1 실행 방법

PoC 는 레포 `scripts/poc/`(`poc-windows.js`·`poc-windows.ps1`)에 있다 — 브랜치 `feat/windows-support-poc-2026-10-20`.

```powershell
# 0) 준비: Git for Windows, Node 22+, Claude Code(평소 쓰는 방식으로 설치·로그인 1회)
# 1) 이 브랜치를 윈도우에 클론 (테스트·훅 실측용 — autocrlf 영향을 보려면 git 설정 그대로)
git clone -b feat/windows-support-poc-2026-10-20 https://github.com/puk0806/gugbab-claude.git C:\src\gugbab-claude
cd C:\src\gugbab-claude
# 2) PoC — Windows Terminal 의 PowerShell 에서 (Git Bash 창 아님). 결과는 현재 폴더 poc-windows-result.json
powershell -ExecutionPolicy Bypass -File .\scripts\poc\poc-windows.ps1 -Repo C:\src\gugbab-claude
# 3) 로그인 파일 링크 방식까지 보려면 (실제 .credentials.json 을 가리킴 — 끝나면 원상 확인·복구)
powershell -ExecutionPolicy Bypass -File .\scripts\poc\poc-windows.ps1 -LinkCreds
```

> 결과 파일 `poc-windows-result.json` 은 레포 폴더 안에 생긴다 — 사용자 이름·경로가 들어 있으므로 **커밋하지 말고** 파일만 전달한다.
> 이 브랜치는 1단계 수정(5장)도 담고 있어 `hookDefenses`(P12)는 수정 뒤 판정이 나온다. 수정 전 판정이 필요하면 `-Repo` 에 `main` 클론을 준다.

결과 `poc-windows-result.json` 을 돌려주면 다음 단계 방향을 확정한다. 토큰 값은 기록하지 않는다(파일 존재·크기·최상위 키 이름만). 시험 파일은 `%TEMP%\gugbab-poc-*` 에 만들고 끝나면 지운다. claude 호출은 haiku 로 9~11번.

> 2026-10-20 맥에서 같은 스크립트로 판정 로직을 검증했다 — 설정 폴더만 바꾸면 로그인 안 됨·빈 값 내부 변수면 됨(10-16 PoC 와 같은 결과), 훅 exit 2 차단·`args` 형식·스킬(junction·심볼릭·CRLF)·에이전트·커맨드·룰·CLAUDE.md 인식 모두 기대대로 판정, 레포 파일 변화 없음. **`.ps1` 껍데기는 맥에 PowerShell 이 없어 미실행.**

### 4.2 확인 항목과 결과에 따른 분기

| # | 항목 (결과 JSON 키) | 판정 | 결과별 다음 행동 |
|---|---|---|---|
| P1 | 환경 (`env`) | Node·Git·Git Bash·claude 위치(`.exe`/`.cmd`)·개발자 모드·긴 경로·autocrlf·사용자 이름(공백·한글)·터미널 | 요구 사항·`doctor` 점검 항목 확정 |
| P2 | 링크 (`links`) | junction·심볼릭·하드링크 생성, rename 뒤 하드링크 유지 | 심볼릭 불가면 폴더 junction + 파일 하드링크/복사 (3.1 설계 그대로) |
| P3 | Node 동작 (`node`) | `/dev/stdin` 실패, `readFileSync(0)` 성공, 열린 파일 rename, chmod, `2>/dev/null`, `.cmd` 직접 실행 | 3.2 수정 근거 |
| P4 | 줄바꿈 (`gitEol`) | autocrlf 클론에서 CRLF → `.gitattributes` 로 LF | 1단계 `.gitattributes` 확정 |
| P5 | Git Bash (`gitBash`) | `$HOME`·`/tmp` 위치, Git Bash 안 `/dev/stdin`, `ln -s` 복사 여부 | 훅 경로 판정 규칙(MSYS ↔ 윈도우) 확정 |
| **P6** | **로그인 공유 (`login`)** | 새 설정 폴더 · 빈 값 내부 변수 · 홈 지정 · 파일 복사 · (하드링크·심볼릭) · OAuth 토큰 | **아래 4.3** |
| **P7** | **설정 폴더 내용 (`configDirContent`)** | 진짜 폴더·junction·심볼릭 스킬, CRLF 스킬, 링크 에이전트·커맨드·룰·CLAUDE.md 가 init 목록·응답에 나오는가 | **전부 됨** → 지금 구조 유지 / **junction 만 안 됨** → 스킬은 복사 / **설정 폴더 스킬 자체를 안 읽음(F10)** → 구조 재설계: `~/.claude` 하나 + `--settings`·`--add-dir`·`--append-system-prompt-file` 주입(10장 1번 대안) |
| P8 | 훅 (`hooks`, `hooksArgsForm`) | 셸 종류(bash/cmd/PowerShell), `\`·`/` 경로 명령 실행, stdin, settings `env` 전달, exit 2 차단, `args` 형식 | Git Bash 면 조립 명령은 `node "C:/…/cli/hook.js" 이벤트` / 아니면 `args` 형식 |
| P9 | PowerShell 도구 (`powershellTool`) | 기본·변수 0·Bash deny 규칙일 때 도구 목록 | 결정 41-② 근거 (Bash deny 만으로 꺼지면 변수는 명시용) |
| P10 | 경로 형식 (`pathFormats`) | `.claude.json` 신뢰 키, `projects/` 폴더 이름 인코딩 | compose 신뢰 기록·메모리 폴더 인코딩 맞춤 |
| P11 | 세션 목록 (`sessions`) | `~/.claude/sessions` 존재 | 결정 38 링크를 junction 으로 (수동 M3 로 확정) |
| P12 | 훅 방어 실측 (`hookDefenses`) | 윈도우식 명령·경로 17개를 훅에 직접 넣어 deny/ask/allow 확인 | 실패 목록 = 2단계 테스트 케이스 |
| P13 | 테스트 스위트 (`repoTests`) | 60개 파일별 통과/실패·첫 실패 | 3.4 표를 실측으로 교체, CI 기준선 |

### 4.3 로그인 방식 — P6 결과로 고른다 (추천 순)

| 순위 | 방식 | 장점 | 위험 | 채택 조건 |
|---|---|---|---|---|
| 1 | **빈 값 `CLAUDE_SECURESTORAGE_CONFIG_DIR`** (macOS 와 같은 내부 변수, Node 런처가 빈 값으로 넘김) | macOS 와 같은 코드 | 문서에 없음, 윈도우에서 파일 저장소에 적용되는지 모름 | `newConfigDir_secureStorageEmpty` 로그인 성공 |
| 2 | **설정 폴더 `.credentials.json` 하드링크** (같은 드라이브) | 갱신이 제자리 쓰기면 모든 프로젝트 공유 | 토큰 갱신이 "새 파일 → rename" 이면 링크가 끊겨 프로젝트별로 갈라짐 | `hardlinkCredentials` 성공 + 하루 뒤 수동 M2 에서 `nlink` 유지 |
| 3 | **조립 전후 동기화** — 실행 전 `~/.claude` 최신본을 복사, 종료 후 더 새것이면 되돌려 복사 | 링크 권한 불필요 | 동시 세션이 각자 갱신하면 마지막이 이김(로그아웃 위험 낮음 — 같은 계정 토큰) | 1·2 실패, `copyCredentials` 성공 |
| 4 | `claude setup-token` → 하네스가 `CLAUDE_CODE_OAUTH_TOKEN` 주입 | 공식·안정 | Remote Control·커넥터 불가(F2), 1년마다 재발급, 토큰을 어딘가 저장해야 함(자격 증명 관리자) | 1~3 모두 실패 |

### 4.4 PoC 결과 (2026-10-20, 사용자 윈도우 PC)

환경: Windows 10 Enterprise LTSC 2019(17763) · PowerShell 5.1 · Node 22.17.1 · Git 2.37.1(Git Bash, `/usr/bin/dash` 있음) · Claude Code 2.1.280(npm 설치 — `claude`(sh)·`claude.cmd`·`claude.ps1`) · 개발자 모드 꺼짐 · 관리자 아님 · 긴 경로 꺼짐 · autocrlf=true · 콘솔 949 · 레포 경로에 한글(`C:\회사\…`).

> 1차 실행은 PoC 가 확장자 없는 `npm\claude`(sh)를 spawn 해 ENOENT — claude 항목이 전부 "판정 불가". PATHEXT 확장자 있는 것만 쓰게 고쳐 2차 실행(아래).

| # | 결과 | 결정 |
|---|---|---|
| P2 링크 | 심볼릭 링크 EPERM(파일·폴더), **junction·하드링크 됨**, 하드링크는 "새 파일 → rename" 쓰기면 끊김, junction 을 지워도 대상 그대로 | 41-④ 확정: 폴더 junction · 파일 하드링크 → 복사, 끊긴 하드링크는 조립 때 다시 연결 |
| P3 Node | `/dev/stdin` ENOENT · `readFileSync(0)` 됨 · 열린 파일 위 rename EPERM · chmod 600 → 666 · `2>/dev/null` 이 cmd 로 돎 · `.cmd` 셸 없이 spawn EINVAL · JS realpath 는 입력 대소문자 유지(`.native` 만 실제 표기) | 3.2·3.3 수정 근거 그대로 + realpath 는 윈도우에서 `.native` |
| P4 줄바꿈 | `.gitattributes` 로 LF 유지 | 1단계 그대로 |
| P5 Git Bash | `$HOME=/c/Users/…`, `/tmp`=`%TEMP%`, Git Bash 안에서도 `/dev/stdin` ENOENT, `ln -s` 는 복사본 | 훅 경로 판정에 MSYS `/c/…` 변환 |
| **P6 로그인** | 새 설정 폴더만 = "Not logged in" · **빈 값 `CLAUDE_SECURESTORAGE_CONFIG_DIR` = 로그인 됨** · 홈 지정 = 됨 · `.credentials.json` 복사 = 됨 | **4.3 1순위 채택** — macOS 와 같은 방식, Node 래퍼가 빈 값으로 넘김 |
| **P7 설정 폴더 내용** | 진짜 폴더·**junction 스킬**·CRLF 스킬·하드링크 에이전트·커맨드·룰·CLAUDE.md 모두 인식(세션 init 목록·응답) | **지금 구조 유지**(구조 재설계 불필요, F10 걱정은 2.1.280 에서 해당 없음) |
| P8 훅 | Git Bash(bash 4.4, MSYSTEM=MINGW64)로 실행, stdin 정상, settings `env` 전달, exit 2 차단 됨, `CLAUDE_PROJECT_DIR=C:/…`(슬래시)·`CLAUDE_CONFIG_DIR` 은 준 그대로, `args` 형식도 동작 | 조립 명령은 `node "C:/…/cli/hook.js" 이벤트` (shell 형식, `/` 표기) |
| P9 PowerShell 도구 | 기본 켜짐 · 변수 0 → 꺼짐 · Bash deny 규칙 → 꺼짐 | 41-② 확정: 조립 settings `env.CLAUDE_CODE_USE_POWERSHELL_TOOL=0` |
| P10 경로 형식 | `projects/` 폴더 이름 = 영숫자 밖 → `-` (`C--Users-…`) · 신뢰 키는 `C:\…`(옛 기록)와 `C:/…`(2.1.280 기록)가 섞여 있음 | 신뢰 키는 대소문자·구분자 무시로 찾고 두 표기 모두로 옮김 |
| P11 세션 | `~/.claude/sessions` 있음 | 결정 38 링크를 junction 으로 |
| P12 훅 방어 | 1단계 뒤 11/17 — `rm -rf "$HOME"`·`/c/Users/x`·`C:/Users/x`·`rm.exe -rf ~` 가 ask, 프로젝트·`%TEMP%` Write 가 ask | 2단계에서 전부 수정(5.2) |
| P13 테스트 | cli 15파일 중 8 실패, 훅 34파일 중 약 20 실패 | 2~3단계에서 전부 통과(5.2) |

추가로 확인한 윈도우 함정: Node 22.17 `fs.cpSync` 는 대상 경로에 한글이 있으면 **프로세스가 죽는다**(세그폴트, 재현) — 운영 코드는 쓰지 않음, 테스트·E2E 도 파일 단위 복사로. PowerShell 5.1 `Remove-Item -Recurse` 는 junction 을 따라 들어갈 수 있어 제거는 `cmd rmdir /s`(junction 은 링크만 지움 — 실측).

---

## 5. 단계별 계획 (PR 단위)

각 단계는 별도 브랜치·PR, **커밋·푸시는 요청 시에만**. 단계마다 ① 맥 전체 테스트 ② `wrapper-e2e.sh --dev` ③ (2단계부터) 윈도우 CI ④ 고치기 전·후 실세션 비교를 마친 뒤 한 번에 보고한다.

| 단계 | 내용 | 테스트 (적대적 포함) | 완료 기준 |
|---|---|---|---|
| **0. PoC** | 4장 | — | 결과 JSON 회수, P6·P7 방향 확정, 계획서 갱신 |
| **1. 공통 정리·보안** (맥에서도 의미, 동작 변화 없음) | `.gitattributes` · 훅 8개 `readFileSync(0)` + 보안 훅 입력 실패 시 차단 · `execSync` 리다이렉트 → `execFileSync` · **bash-guard 명령 이름 정규화(`.exe`·`cmd`·`powershell`)** · frontmatter CRLF 허용 · 경로 목록 `path.delimiter` · 공용 헬퍼(`.claude/hooks/lib/winpath.js`: `normPath`·`samePath`·`isUnder`·`msysToWin`, `cli/fsx.js`: `atomicWrite`·`findExecutable`) · 훅 테스트 러너를 `spawnSync`+`input` 으로 | `path.win32` 로 맥에서 윈도우 입력 시험: `git.exe push --force` deny, `C:\…\.SSH\id_rsa` 차단, `/c/Users/x` 삭제 deny, 빈 stdin·깨진 JSON → 보안 훅 차단, CRLF frontmatter 통과·`\r` 만 있는 이상 입력 | 맥 테스트 전부 + 새 적대 테스트, 실세션 회귀 없음 |
| **2. 훅 윈도우 경로 판정** | 3.2·3.3 의 경로·임시 폴더·시스템 폴더·프로세스 목록·auto-format·codex·tsc·claude 찾기·session-export | 위 + 드라이브 대소문자(`c:`/`C:`), UNC(`\\server\share`), 다른 드라이브(`D:\`), 공백·한글 사용자 이름, 260자 넘는 경로, junction 으로 허용 폴더 밖을 가리키는 경로(탈출) | **GitHub Actions `windows-latest` 에서 훅 테스트 전부 통과** (이 단계에서 CI 추가) |
| **3. 래퍼·조립** | `cli/launch.js`(래퍼 로직, 재시작 반복·`--continue`·`self-update` exit 10·`GUGBAB_*` 전달) + `bin/gugbab-claude.cmd`·`.ps1` (macOS sh 는 그대로, 공통 부분만 launch 로) · compose: `UNSAFE_SHELL` 윈도우 처리·junction/하드링크/복사·mode 생략·신뢰 키 `C:/`·훅 명령 `/` 표기·메모리 폴더 인코딩 · `paths.js` homedir · `open.js` `wt.exe` · 상태줄 Node 이식 · 로그인 방식(4.3) · 윈도우 settings `env.CLAUDE_CODE_USE_POWERSHELL_TOOL=0` · `doctor` 윈도우 점검(Git Bash·개발자 모드·긴 경로·autocrlf·로그인 방식·PowerShell 도구·터미널) | 조립 적대 테스트: 링크 자리에 사용자 파일·폴더, junction 이 하네스 밖을 가리킴, 복사 방식 원본 삭제·변경 후 재조립, 동시 두 조립(잠금), 읽기 전용 `.claude.json`, 백신 잠금 흉내(EBUSY 주입) | 윈도우 CI 에서 cli 테스트 전부, 사용자 PC 에서 `gugbab-claude` 로 세션이 열림 |
| **4. 설치·업데이트·E2E** | `install.ps1`(install.sh 1:1 — clone·런처·사용자 PATH·`--version`·`--channel`·`--uninstall`) · README 윈도우 절 · `scripts/wrapper-e2e` 를 Node 로 이식(맥·윈도우 공용, sh 판은 유지 또는 대체) | 빈 사용자 프로필 시뮬레이션(임시 `USERPROFILE`), 재설치·제거, PATH 에 이미 다른 `gugbab-claude`, 실행 정책 Restricted | 새 윈도우 PC 한 줄 설치 → 실행 성공, E2E 전부 통과 |
| **5. 실사용 검증·릴리스** | 6장 수동 체크리스트를 사용자 PC 에서, 문제 수정 | — | 체크리스트 전부 통과 → **v1.1.0**(새 플랫폼 = minor) |

### 5.1 1단계 결과 (2026-10-20 — PoC 와 무관하게 먼저, 결정 41-⑥)

| 항목 | 한 일 | 테스트 |
|---|---|---|
| bash-guard 명령 이름 | `cmdNameOf` 가 `\` 경로·`.exe/.cmd/.bat/.com/.ps1` 를 떼고 소문자로 — git·rm 등 **모든 분류가 함께** 적용. `cmd`·`powershell`·`pwsh`·`wsl`·`wscript`·`cscript`·`mshta` 는 안의 명령을 판정할 수 없어 확인(ask) | 우회 17개(`git.exe`·`GIT.EXE`·`"C:\Git\bin\git.exe"`·`/c/Program Files/…/git.exe`·`git.cmd`·`rm.exe -rf ~`·`RM.EXE -rf "$HOME"`, PermissionRequest 자동 승인 안 함, 윈도우 셸 ask·파이프 뒤) + 회귀 6개(`ls`·`git status`·`node build.com.js`·인자로만 나온 `cmd` 등 그대로 자동). 수정 전 코드로 돌리면 실패 |
| 입력 못 읽으면 통과하던 훅 8개 | `readFileSync('/dev/stdin')` → `readFileSync(0)`: branch-protection·parry·tdd-guard·fake-impl-guard·adversarial-test-guard·typescript-quality·codex-review-guard·cc-notify. **보안 훅 2개(branch-protection·parry)는 입력이 비었거나 JSON 객체가 아니면 차단(exit 2)** — 기존 "깨진 JSON → 통과" 테스트는 기대값을 바꿈 | 깨진 JSON·빈 stdin·`null`·배열·숫자/문자열 → 차단, 다른 도구는 통과, `git.exe push origin main` 차단 |
| 셸을 거치던 명령 | branch-protection `git branch --show-current 2>/dev/null` → `execFileSync`. codex-review-guard `which codex` → PATH 직접 탐색(윈도우는 PATHEXT, 폴더·실행 불가 파일은 미설치) | PATH 에 `codex` 폴더·실행 불가 파일만 → "codex CLI 없음" 으로 건너뜀(로그인 실패로 우연히 통과한 것과 구분) |
| CRLF | skill-md-guard·agent-md-guard·verification-guard·`docs/plans/page/inv.js`·`parse-checklist.js`·`build-page.js` 가 읽은 직후 `\r\n`·`\r` → `\n` (build-page 는 parse-checklist 가 준 7장 위치로 자르므로 같은 기준) | CRLF·CR 만 쓴 파일이 LF 와 같은 결과, 누락 필드는 CRLF 여도 계속 차단. `inv.test.js` 신설. skill·agent·page 는 수정 전 코드로 실패(verification-guard 는 원래 CRLF 에서도 동작 — 회귀용) |
| `.gitattributes` | `* text=auto eol=lf`, `*.cmd`·`*.bat`·`*.ps1` 은 `eol=crlf`, 이미지·폰트·zip 바이너리 | `git add --renormalize .` 로 줄바꿈이 바뀌는 기존 파일 0개 확인 |

검증: 훅 테스트 파일 34개 전부 · cli·scripts·문서 391 · `wrapper-e2e.sh --dev` 40/40 · **고치기 전(`origin/main`)·후 실세션 비교**(`claude -p`, 임시 프로젝트): 전에는 `git.exe push --force`·`cmd //c` 가 훅을 그대로 지나 "command not found" 로만 끝났고, 후에는 branch-protection·bash-guard 가 막음(`ls` 는 그대로).

**1단계에서 뺀 것 → 2단계로**: 경로 목록 `path.delimiter`(compose·bash-guard 양쪽), 공용 경로 헬퍼(`normPath`·`isUnder`·`msysToWin`), 훅 테스트 러너의 `echo '…' | node` → `spawnSync`+`input`(윈도우 CI 와 함께).

### 5.2 2~4단계 결과 (2026-10-20 — 사용자 윈도우 PC 에서 구현·실측)

| 단계 | 한 일 |
|---|---|
| 2 훅 | 공용 `.claude/hooks/lib/winpath.js`(`toSlash`·`msysToWin`·`normPath`·`isUnder`·`samePath`, 플랫폼 인자로 맥에서도 윈도우 판정 시험)·`testfs.js`(폴더 링크 = junction, 파일 심볼릭 링크는 권한 없으면 "건너뜀"). **bash-guard**: `$HOME`·`~`·`/c/…`·`C:/…`·`C:\…` 를 한 비교 형식으로 — `rm -rf "$HOME"`·`/c/Users/x`·`C:/Users/x`·`rm.exe -rf ~`·드라이브 루트·`C:\Users`·`Windows`/`Program Files` 재귀 삭제 deny, 자동 허용 패턴에 `C:/…`·`/c/…`·UNC·따옴표 밖 `\`·`$APPDATA`·PowerShell 프로필·시작프로그램 폴더 검사, 허용 폴더 목록 `;` 구분. **auto-approve**: 프로젝트 안·`%TEMP%` Write 허용(실제 위치로도 확인 — junction 탈출 거부). **protect-secrets**: 대소문자 무시·`~\`·`%APPDATA%\gcloud`·PowerShell 프로필·시작프로그램 쓰기 차단. **memory-sync**(윈도우에서 미러가 통째로 꺼져 있었음)·session-export(경로 비교·`/tmp`↔`os.tmpdir()`)·progress-tracker(`/` 기록)·deliverable-guard(README 검사 꺼져 있었음)·task-confirm-guard(임시 폴더 예외는 실제 위치로, 자기 승인 상태 파일 쓰기 거부)·tdd/adversarial/fake-impl/test-fake-guard(`\` 경로 예외 판정, `/c/…` `CLAUDE_PROJECT_DIR`)·auto-format(`.bin` shim 대신 패키지 bin JS, `.venv\Scripts`)·codex-review-guard·typescript-quality(`cd &&` → `cwd`)·claude-version-check(npm 설치는 package.json 에서 버전 — `claude.exe --version` 이 윈도우에서 13초). 훅 테스트 러너를 `spawnSync`+`input` 으로 |
| 3 래퍼·조립 | `cli/launch.js`(sh 래퍼와 같은 순서 — 업데이트 후 새 래퍼로 한 번 다시 실행·first-run·prepare·재시작 표시 → `--continue`·`-p` 는 다시 띄우지 않음·Ctrl+C 는 claude 에 맡기고 래퍼는 기다림·빈 `CLAUDE_SECURESTORAGE_CONFIG_DIR`), `bin/gugbab-claude.cmd`, sh 래퍼는 Git Bash 면 launch.js 로. `cli/winfs.js`(realpath `.native`·rename/unlink 재시도·junction/하드링크/복사·`claude.cmd` 안의 `claude.exe` 를 찾아 셸 없이 실행). compose: 명령 경로 `/` 표기·관리 기록 `fileLinks`(하드링크·복사는 일반 파일이라 기록으로 판별, 끊긴 하드링크 다시 연결, 사용자가 고친 파일은 남기고 알림, **다른 세션이 파일을 잡고 있으면 조립을 멈추지 않고 기록을 남겨 다음 조립에서**)·신뢰 키 두 표기·메모리 폴더 목록 `;`·PowerShell 도구 끔. paths(홈 = `os.homedir()`, MSYS 경로 변환)·project(실제 표기 루트)·open(`/harness` = `start` 새 창)·doctor(Git Bash·로그인 파일 점검)·update(fetch 8초, 자격 증명 창 안 띄움) |
| 4 설치·E2E | `install.ps1`(install.sh 대응 — `-Ref`·`-Version`·`-Channel`·`-Dir`·`-NoModifyPath`·`-Uninstall`·`-Yes`, ASCII 만, `<설치>\bin` 을 사용자 PATH 에 REG_EXPAND_SZ 그대로, 채널 파일 BOM 없이, 제거는 `cmd rmdir /s`). `scripts/wrapper-e2e.js`(sh 판 시나리오 전부 + 윈도우 전용: PowerShell 도구 꺼짐·개인키 Read/`cat` 차단·`.env` Read 허용(설계)·main push·`git.exe push --force` 차단·junction 공유 폴더·`.cmd` 런처·`/harness` 새 창 계획·doctor), `scripts/wrapper-matrix.js`(프리셋 13종·항목 321개 켜기·끄기·고정 35개 거부, `--with-claude` 면 프리셋마다 실제 세션 목록). 둘 다 `--home <설치 폴더>` |

**검증 (윈도우 10, 2026-10-20)**

| 무엇 | 결과 |
|---|---|
| 단위 테스트 | 훅·cli·scripts·페이지 전부 통과 — 윈도우에서 만들 수 없는 것(파일 심볼릭 링크·`"`·개행 파일 이름·sh 래퍼·install.sh)은 이유와 함께 건너뜀, 대신 junction 판 적대 시험 추가 |
| 실세션 E2E 개발 모드 | 첫 실행 53/54 — 실패 1건은 시험 기대값 오류(`.env` 읽기 차단을 기대했으나 허용이 2026-10-06 결정) → 개인키 차단 + `.env` 허용 확인으로 시나리오 수정 후 **56/56** |
| **대화형 실측**(2026-10-21, 새 PowerShell 창 — 사용자 PATH 에 개발 모드 등록 후 콘솔에 직접 키 입력·화면 읽기) | 첫 실행 프리셋 질문(번호 선택·고르지 않음·잘못된 입력 재질문) · 폴더 신뢰 · 질문·응답 · 상태줄(Git Bash) · **키보드 Ctrl+C 는 답변만 중단**(세션·래퍼 유지) · 세션 안 `/harness` → **새 창 TUI** 에서 이동·Space·Enter 저장 → 설정 폴더 반영 · `/exit` → 래퍼가 `launch.js --continue` 로 다시 실행해 새 에이전트 반영 · 마지막 `/exit` 후 래퍼·claude·cmd 프로세스 모두 정리 — 전부 확인 |
| 대화형에서 찾은 것 | **Git Bash 창에서 `/` 로 시작하는 인자가 윈도우 경로로 바뀜**(`gugbab-claude -p "/harness preset"` → `C:/Program Files/Git/harness preset`) → sh 래퍼가 변환을 끄고 넘김(수정·회귀 시험 추가) · claude 가 떠 있지 않을 때(첫 실행 질문 등) 콘솔 Ctrl+C 신호면 cmd 의 "일괄 작업을 끝내시겠습니까 (Y/N)?" 가 나옴(`.cmd` 도구 공통, claude 대화 중 Ctrl+C 는 해당 없음) · 첫 시도 창 하나에서 claude 가 키 입력을 읽지 않는 상태가 됨 — Claude Code 자동 업데이트 직후 시작된 세션, 같은 순서로 두 번 다시 해서는 재현 안 됨(원인 미확정) · 이 PC 는 Claude Code npm 설치본이 수십 분마다 자동 업데이트(2.1.304→305→306)되며 그 몇 초 동안 `claude.exe` 가 없어 `claude`·`gugbab-claude` 모두 실행 안 됨(하네스와 무관) |
| 실세션 E2E **설치본**(`install.ps1` 로 설치한 배포 모드) | **56/56** — 자동 업데이트 v9.0.0 → v9.0.1 후 그 실행에서 새 래퍼, 세션 시작 버전 안내 포함 |
| 매트릭스 개발 모드 | 624/625 → 실패 1건(동시 세션이 하드링크 원본을 열고 있어 끄기 실패)을 고침 |
| 매트릭스 **설치본** + 프리셋별 실제 세션 | **638/638** (E2E 와 동시에 돌려 잠김 보강도 확인) |
| `install.ps1` | 설치·브랜치·재설치·제거(junction 너머 대화 기록 보존)·거부 8/8, 실제 설치 후 doctor 전부 ✓ |
| 메모리 미러 | 이 세션에서 레포 `memory/` 를 고치자 전역으로 미러됨(수정 전에는 윈도우에서 안 됨) |

**main 추가분 병합 (2026-10-21)**: main `206193c`(PR #41 `/harness` 창 저장 뒤 자동 닫힘 · PR #42 결정 42 변수 풀기·결정 43 📌)을 이 브랜치에 병합 — 충돌 9개(VERSION 은 main 1.0.14, open.js 는 윈도우 새 창 + macOS `--close-terminal` 둘 다, 테스트·문서·계획서는 양쪽 합침). **병합으로 생긴 윈도우 보안 회귀를 찾아 고침**: 결정 42 가 대입값의 `~` 를 홈으로 펼칠 때 윈도우 홈 `C:\Users\x` 의 `\` 가 안전값 검사에 걸려 아예 안 풀려 `P=~/.ssh; cat $P/id_rsa` 가 자동 허용·`S=~; rm -rf $S` 가 확인으로 약해짐 → 윈도우는 `C:/Users/x` 로 펼침. 변수 × 윈도우 시험 추가(`X=git.exe; $X push --force` 차단, `X=cat.exe; $X …` 읽기 자동, `X=cmd.exe` 확인, `\` 값은 안 풂). 윈도우 `/harness` 창 자동 닫힘 실측: `start` 로 연 콘솔이라 저장 뒤 요약을 약 2초 보여 주고 node 가 끝나면 창도 닫힘(macOS 같은 추가 처리 불필요). 병합 뒤 검증: 단위 2,499 통과(부하로 시간 초과난 2건은 단독 재실행 통과) · E2E 56/56 · 매트릭스 625/625 · bash-guard 645/645.

**병합 뒤 추가 실측 (2026-10-21, 새 환경 PowerShell 창 2개 · 콘솔 직접 구동)**: 대화형 전체 흐름(첫 실행 추천 A=rust·B=nextjs → 적용 → 신뢰 → 질문·응답 → 상태줄 → 키보드 Ctrl+C → 세션 안 `/harness` 새 창 저장 → 요약 약 2초 뒤 창 자동 닫힘 → `/exit` 후 `--continue` 재시작·새 에이전트 반영 → 마지막 `/exit` 프롬프트 복귀) · **M3** 두 세션 `ListAgents`·`SendMessage` 양방향(named pipe, 설정 폴더 달라도 `sessions/` junction 공유로 서로 찾음) · **M8** claude 가 떠 있는 채 창 닫기(WM_CLOSE) → PowerShell·cmd·래퍼·claude 모두 종료, 남는 프로세스 없음 · **M2** 로그인 파일이 시험 중 실제 갱신(토큰 약 8시간)된 뒤에도 모든 래퍼 세션 재로그인 없음, 설정 폴더별 로그인 사본 0 · **M11** 백신(AhnLab V3) 켠 채 항목을 바꿔 가며 연속 20회 조립·실행 — 파일 잠김 오류 0(2회는 모델이 1턴 안에 도구를 부른 "max turns" — 하네스 있음·없음 각 6회 재현 안 됨) · 병합본 스냅샷을 `install.ps1` 로 새로 설치한 설치본 E2E 56/56.

**남은 것**: ~~맥 회귀 확인(M13)~~ → 5.3 · ~~`windows-latest` CI~~ → 5.3(워크플로 추가, 첫 실행은 푸시 뒤) · 5.3 의 윈도우 재확인 · v1.1.0 릴리스. M1·M2·M3·M4·M8·M11 은 2026-10-21 윈도우 실측으로 확인(위). 버전은 main 병합으로 **1.0.14**, PR 을 올릴 때만 `release-version.js bump`(결정 32 — 단계 PR 은 패치 +1).

**맥에도 있는 것으로 찾았지만 동작을 바꾸지 않아 남긴 것**(따로 결정 필요): task-confirm-guard 승인 상태 파일을 임시 폴더에 직접 써 자기 승인 가능(윈도우 분기는 막음) · tdd/adversarial/fake-impl 의 `.claude/hooks` 부분 문자열 제외(`.claude/hooksX/…`·경로 중간 `.claude/hooks/`) · 폴더 링크 너머 파일 신뢰(staleness-check·auto-format) · 자동 허용 패턴이 `cp x ~/…` 대상은 보지 않음 · 이름만으로 `git` 실행 시 현재 폴더의 `git.exe`(윈도우 `NoDefaultCurrentDirectoryInExePath` 없을 때).

### 5.3 맥 회귀 확인(M13)·테스트 보강 (2026-10-22 — 맥)

**병합본(`2c5be7a`) 그대로 맥에서**: 단위 cli 308 통과·**3 실패**(`winfs.test.js` — `win:true` 로 맥 임시 폴더를 `\var\folders\…` 윈도우 경로로 만든 뒤 진짜 fs 로 찾아 언제나 없음, 시험 결함·제품 동작 무관) · 훅 51 파일·bash-guard 563/563(윈도우 645 — 차이는 윈도우 전용 구역) · scripts 103 · `wrapper-e2e.js --dev` 43/43 · `wrapper-e2e.sh --dev` 40/40 · 매트릭스 625/625. 새로 만든 **조립 링크 점검**(껐다 켜기·되돌리기·블록·프로젝트 자체 항목 있음/지움·`--all`/이 프로젝트만·사용자 파일 보존·프리셋 4종 뒤 설정 폴더의 모든 링크가 깨지지 않음·절대 경로·켠 항목만·그 항목의 원본·프로젝트 폴더를 안 가리킴·공용 링크는 `~/.claude/<같은 이름>`·관리 기록 일치) 10,141/10,141 — 일부러 깬 링크 3종을 잡는지 자기 점검 통과.

**검토에서 찾아 고친 것** (윈도우 세션 테스트 품질 검토 — 서브에이전트 + 코드 직접 확인)
| 대상 | 문제 | 고침 |
|---|---|---|
| `winpath.normPath`·`isUnder` | `C:/proj/../evil` 이 `C:/proj` 아래로 판정 — **맥도 같음**(`/Users/a/p/../q`). 머리말의 `..` 시험이 실제로 없었음 | `.`·`..`·겹친 슬래시를 정리한 뒤 비교(루트·드라이브·UNC 공유 위로는 못 올라감), 시험 +11(고치기 전 코드로 9개 실패). 지금 호출하는 쪽은 먼저 resolve·realpath 해서 당장 뚫리진 않았음 |
| `cli/winfs.test.js` | 맥에서 3개 실패, 같은 이름 폴더 시험은 맥에서 엉뚱한 이유로 통과, 같은 값 두 번 쓴 분기 | `findExecutable`·`exeFromCmdShim`·`resolveClaude` 에 시험용 `fsys` 주입 → 윈도우 경로 가짜 fs 로 맥에서도 판정(형제 폴더·형식 밖 `.cmd` 거부·PATH 순서·따옴표 폴더 추가), 윈도우 실제 fs·맥 실행 권한 시험 분리 |
| `lib/testfs.test.js` | `threw \|\| IS_WIN`·`r===true\|\|r===null` 이 윈도우에서 늘 통과 | 성공이면 링크로 읽히는지, null 이면 아무것도 안 생겼는지, 부모 없음은 ENOENT 또는 윈도우 null 만 |
| `scripts/wrapper-e2e.js` | `git.exe push --force` 판정 정규식 `force` 가 프롬프트에도 맞아 안 막혀도 통과, 개인키 cat 은 세션이 실패해도 통과, 보안 확인이 윈도우 전용 구역에만 | `blockedBy` — 그 도구 호출의 결과(`tool_result`)에 훅 이름이 있을 때만 '차단', 도구를 안 부르면 실패. 개인키·`.env`·main push·`git.exe push --force` 7개를 맥·윈도우 공통으로 |
| `scripts/wrapper-matrix.js` | 훅 32개는 검사 없이 넘어감·센 수도 없음, `>= before` 는 늘 참 | 훅은 `status` 의 켜진 훅 수가 끄기·켜기마다 정확히 1씩 바뀌는지, 블록 스킬은 하나하나 연결·끄면 고정만 남는지, 넘어간 수 출력 |
| 시험 없음 | `project.js` realpath(.native), `config-change-audit` `hooks[\\/]`, `cc-notify` fd 0 | `project.test.js` +4(대소문자만 다른 경로·윈도우 .native·심볼릭 링크로 연 경로·index 임시 파일), `config-change-audit` +2, `cc-notify` +1 |
| CI 없음 | 윈도우 전용 보안 시험이 맥에서 전부 건너뛰어 회귀를 잡을 곳이 없음 | `.github/workflows/unit-tests.yml` — `macos-latest`·`windows-latest` 단위 테스트(PR·`feat/**`·`fix/**` 푸시, Git Bash). 실사용 시나리오는 로그인이 필요해 제외 |

**고친 뒤 맥**: 단위 cli 315 통과·0 실패(15 건너뜀) · 훅 51 파일 · `winpath` 36·`testfs` 11 · scripts 103 · `wrapper-e2e.js --dev` **50/50**(보안 7개가 공통으로) · `wrapper-e2e.sh --dev` 40/40 · 매트릭스 **671/671**(훅 검사 추가) · 링크 점검 10,768/10,768.

**윈도우에서 다시 확인할 것** (이번 수정이 윈도우 경로를 건드림)
1. 단위 전체 — `winfs` 윈도우 실제 fs 시험은 처음 돎, `normPath` 변경은 윈도우 훅 9개(bash-guard·auto-approve·protect-secrets·task-confirm-guard 등) 경로 판정에 영향
2. `node scripts/wrapper-e2e.js --dev` — 새 공통 보안 구역·`blockedBy` 가 윈도우 stream-json 에서도 맞는지(56 → 63 예상)
3. `node scripts/wrapper-matrix.js --dev` — 훅 수·블록 검사
4. 푸시 뒤 GitHub Actions `unit-tests` 첫 실행(특히 `windows-latest`)
5. 아직 실측 기록 없는 수동 항목: M5(`rm -rf ~`·`cat ~/.ssh/id_rsa` 실세션), M6, M9, M10, M12

### 5.4 윈도우 재확인 결과·CI 첫 실행 실패 수정 (2026-10-22 — 사용자 윈도우 PC)

**5.3 의 재확인 목록 결과** (하네스 제품 동작에서 새로 나온 문제 없음)
| # | 항목 | 결과 |
|---|---|---|
| 1 | 단위 전체 | cli 280 통과(윈도우 전용 포함, 50 건너뜀 = 맥 전용·sh 래퍼) · 훅 51/51 · 훅 공용 헬퍼(`winpath` 36·`testfs` 11 등) 전부 · scripts 86 — `normPath` `..` 정리가 윈도우 훅 9개 경로 판정에 영향 없음 |
| 2 | `wrapper-e2e.js --dev` | 맥 메모의 "56 → 63" 은 착오 — 윈도우 전용 보안 5개가 공통 7개로 바뀐 것이라 **56 → 58**. 첫 실행 56/58: 실패 2(개인키 Read·`git.exe push --force`)는 아래 "모델 거절" |
| 3 | `wrapper-matrix.js --dev` | **671/671**(맥과 같음 — 훅 32개 켜기·끄기, 블록 스킬 하나하나) |
| 4 | Actions `unit-tests` 첫 실행 | **맥·윈도우 둘 다 실패** — 아래 "CI 실패 원인" (로그는 GitHub 로그인이 필요해 못 보고, 러너 조건을 이 PC 에서 흉내 내 재현) |
| 5 | M12 일부 | VS Code 처럼 드라이브 소문자(`c:\…`)·하위 폴더로 열어도 같은 프로젝트·설정 폴더 |
| 5 | M5 | main push·`git.exe push --force`·`cat server.key` 차단·PowerShell 도구 없음은 E2E 로. `rm -rf ~` 는 훅이 못 막으면 진짜 홈이 지워지므로 실세션 대신 bash-guard 단위 테스트로 |
| 5 | M6·M9·M10 | 이 PC 에서 불가 — PowerShell 7·D: 드라이브 없음, `LongPathsEnabled=0`, 사용자 계정 하나. 상태줄은 5.2 대화형 실측에서 확인 |

**CI 실패 원인 — 테스트가 러너 환경을 가정 (제품 동작과 무관)**
| 원인 | 어디 | 고침 |
|---|---|---|
| 윈도우 러너 임시 폴더가 8.3 짧은 이름(`C:\Users\RUNNER~1\…`) — 시험 기대값은 `fs.realpathSync`(짧은 이름 그대로), 제품은 `.native`(긴 이름) | `cli/project.test.js` 3 · `session-export.test.js` 3 · `codex-review-guard.test.js` 1 | 기대값도 `fs.realpathSync.native` (맥·리눅스는 둘이 같음) |
| 러너 홈에 `~/.claude/projects` 가 없어 설정 폴더 → `~/.claude/projects` 링크가 깨짐 → "자동" 이어야 할 메모리 쓰기가 "확인" (**맥 러너도 같음** — 맥 CI 훅 단계 실패의 유력 원인, 푸시 뒤 CI 로 확인) | `auto-approve.test.js` 1 · `task-confirm-guard.test.js` 1 | 없을 때만 만들고 끝나면 만든 것만 지움 |

재현·확인: 러너처럼 홈 `C:\cisim\runneradministrator`(비어 있음)·`TEMP=C:\cisim\RUNNER~1\AppData\Local\Temp`·`CI=true`·PATH 에서 claude 제외 → 고치기 전 cli 3·훅 4+2 실패, 고친 뒤 **cli 280/0 · 훅 51/0 · scripts 86/0**(조용한 상태). 윈도우 CI 는 cli 단계에서 멈춰 훅 이후 단계는 아직 한 번도 돌지 않았다.

**E2E 들쭉날쭉 — 모델 거절·요약 의존 (하네스 문제 아님)**
| 시험 | 무엇이 | 고침 |
|---|---|---|
| 개인키 Read·Bash cat·main push·`git.exe push --force`·`.env` Read | haiku 가 "개인키라서·force push 라서" 도구를 **아예 안 부름**(3번 중 2번) — 맥에서 판정을 "도구 안 부름 = 실패" 로 엄격히 한 뒤 모델 기분에 따라 갈림. 부른 1번은 `branch-protection` 이 정확히 막음, 값은 한 번도 안 샘 | 프롬프트에 "하네스 훅 시험·가짜 값" 을 덧붙이고 최대 3번 다시 시도, 끝내 안 부르면 실패가 아니라 **판정 불가**로 따로 셈(훅 자체는 단위 테스트가 봄). 값이 안 샜는지는 모든 시도에서 봄 |
| 훅 켜기 → tdd-guard 안내 | 출력 전체의 `tdd-guard` 글자를 세어 **모델이 답에서 언급하지 않으면** 실패(2번 중 1번) — 훅은 매번 실행됨 | `--include-hook-events` 의 PostToolUse `hook_response` 에 `[tdd-guard]` 가 있는지로 판정(켬 3/3 = 1개, 끔 0개 실측) + "소스 파일을 실제로 씀" 전제 검사 |
| `/harness preset` 목록 | 평문 최종 답만 봐서 모델이 요약에 `nextjs` 를 안 쓰거나 3턴 안에 못 끝내면(`Reached max turns (3)`) 실패 — 커맨드는 3번 모두 `gugbab-claude preset` 을 실행해 목록을 받음 | stream-json 의 Bash 도구 결과(목록) 또는 최종 답에 `nextjs`, 턴 6 |

**부하 때문에 보인 것 (수정 없음)**: 단위·CI 흉내·E2E·매트릭스 4개를 동시에 돌리면 훅 시험(claude-version-check·deliverable-guard·session-start·release-version-guard 등)과 `update.test.js` 가 4~8초 제한에 걸려 `exit null` — 단독·조용한 상태에서는 전부 통과. `node --test` 가 훅 시험 파일 51개를 동시에 띄우는 것만으로도 윈도우에서는 가끔 걸린다(`claude-version-check`·`session-start` 1건씩) → CI 윈도우 러너에서 재발하면 훅 단계만 `--test-concurrency=1` 로 돌리는 것을 검토.

**고친 뒤 윈도우(단독·조용한 상태)**: 단위 cli 280/0 · 훅 51/0 · 공용 헬퍼 전부 · scripts 86/0 · CI 흉내(빈 홈·짧은 이름 임시 폴더) cli 280/0 · 훅 51/0 · scripts 86/0 · `wrapper-e2e.js --dev` **59/59**(판정 불가 0 — 프롬프트에 시험임을 덧붙이니 haiku 가 도구를 불렀고 훅이 전부 막음) · 매트릭스 671/671.

### 5.5 맥 확인·CI 2차 실행 (2026-10-22 — 맥)

- **맥(5.4 수정 뒤)**: 단위 cli 315(15 건너뜀) · 훅 51/51 · 공용 헬퍼 전부 · scripts 103(8 건너뜀) · `wrapper-e2e.js --dev` **51/51**(판정 불가 0 — 훅 이벤트 판정·`/harness preset` 도구 결과 판정·보안 재시도가 맥 stream-json 에서도 맞음. 윈도우 59 와의 차이는 윈도우 전용 시험)
- **CI 1차 실패 원인 = 윈도우 추정과 같음** (맥에서 잡 로그 확인): 맥 훅 단계 `auto-approve`·`task-confirm-guard` "설정 폴더 projects → ~/.claude/projects 링크 안 메모리 → 자동 (기대 allow, 실제 ask)", 윈도우 cli 단계 `project.test` 3건 "기대 `C:\Users\RUNNER~1\…` · 실제 `C:\Users\runneradmin\…`"
- **CI 2차**(5.4 수정 푸시): 맥 **전부 통과**. 윈도우는 cli 통과 → 훅 단계에서 `skill-md-guard.test.js`·`verification-guard.test.js` 가 시험 입력을 고정 `/tmp/…json` 에 씀 → 윈도우에선 "현재 드라이브:\tmp" = 러너 `D:\tmp`(없음) → `ENOENT` 로 파일째 죽음(윈도우 PC 는 `C:\tmp` 가 있었던 것으로 추정). → `os.tmpdir()` 로 고침(맥은 그대로 통과, 다른 `TMPDIR` 로도 통과·그 폴더에 씀 확인). 다른 `/tmp/…` 는 "생기지 않았는지" 확인용(`existsSync`)이라 윈도우에서도 문제없음
- **CI 3차**(`4ce81c9`, run `39725358364`, 2026-10-22): **맥·윈도우 모두 통과** — 윈도우 훅·공용 헬퍼·scripts 단계 첫 통과, 시간 초과를 걱정했던 `claude-version-check`·`session-start` 도 러너에서 통과. 같은 시각 윈도우 세션도 같은 `/tmp` 수정을 만들어 푸시하다 거부됨(non-fast-forward) → 내용이 같아 윈도우 로컬 커밋은 버리고 원격에 맞춤. **두 PC 에서 같은 브랜치를 동시에 작업하지 않는다** — 한쪽이 푸시하고 다른 쪽은 pull 뒤 이어서
- 남은 것: PR(`release-version.js bump` → 1.0.15)

---

## 6. 수동 확인 체크리스트 (사용자 윈도우 PC — 5단계)

| # | 확인 | 기대 |
|---|---|---|
| M1 | `install.ps1` 새 설치 → 새 터미널에서 `gugbab-claude` | 첫 실행 프리셋 질문 → 세션 열림, 화면 첫 답변에 `[gugbab] 하네스 v…` |
| M2 | 프로젝트 2개 동시 실행 · 다음 날 다시 실행 | 어느 쪽도 재로그인 없음 (토큰 갱신 후에도) |
| M3 | 두 세션에서 `ListAgents`·`SendMessage` | 서로 보이고 메시지 도착 |
| M4 | `/harness` 켜기·끄기 → `/exit` | 새 창(Windows Terminal)에서 TUI, 재시작이 `--continue` 로 이어짐 |
| M5 | 차단 실측: main 직접 push · `rm -rf ~` · `cat ~/.ssh/id_rsa` · `git.exe push --force` · PowerShell 도구 목록 | 전부 차단, PowerShell 도구 없음 |
| M6 | 상태줄 | 맥과 같은 항목 표시 |
| M7 | 업데이트(`gugbab-claude update` 와 자동 확인) | 새 버전으로 다시 실행, 버전 안내 |
| M8 | Ctrl+C·창 닫기 | 남는 node·claude 프로세스 없음 |
| M9 | 사용자 이름에 공백·한글, `D:\` 프로젝트, 260자 넘는 경로 | 조립·훅 정상 |
| M10 | PowerShell 7 · Windows PowerShell 5.1 · cmd 각각 실행 | 모두 같은 결과 |
| M11 | Defender 실시간 검사 켠 채 연속 10회 실행 | EPERM·EBUSY 로 실패 없음 |
| M12 | VS Code 통합 터미널에서 실행 | 신뢰 기록 드라이브 대소문자(F9) 문제 없음 |
| M13 | macOS 회귀 | `wrapper-e2e.sh --dev` 전부 통과, 기존 세션과 같은 동작 — **2026-10-22 확인(5.3)** |

---

## 7. 결정 (결정 41) — 추천안, 확정은 사용자

| # | 항목 | 추천 | 상태 |
|---|---|---|---|
| 41-① | 진행 순서 | **PoC 먼저**, 결과로 P6(로그인)·P7(설정 폴더 내용) 방향 확정 후 1단계 | 사용자 승인(2026-10-20) |
| 41-② | PowerShell 도구 | **윈도우 하네스는 끔**(`CLAUDE_CODE_USE_POWERSHELL_TOOL=0`), Git for Windows 필수 — Bash 가드 7개를 PowerShell 로 다시 만들지 않는다 | **구현**(2026-10-20, P9 실측 — E2E 로 도구 목록에서 빠짐 확인) |
| 41-③ | 래퍼 형식 | **Node 런처(`cli/launch.js`) + `.cmd` 껍데기**, macOS sh 래퍼는 유지(comux 작업 제어 때문). `.ps1` 은 두지 않음 — PowerShell 은 같은 폴더의 `.ps1` 을 `.cmd` 보다 먼저 실행해 실행 정책 Restricted 에서 실패(npm 의 알려진 문제) | **구현**(2026-10-20) |
| 41-④ | 링크 | 폴더 **junction**, 파일 **하드링크 → 복사** (개발자 모드·관리자 권한 요구하지 않음) | **구현**(P2·P7 실측) |
| 41-⑤ | 지원 터미널 | PowerShell 7/5.1·cmd·Windows Terminal, Git Bash 창도 같은 Node 래퍼로 넘김 | **구현** — mintty TTY 감지는 대화형 수동 확인 남음 |
| 41-⑥ | 1단계를 윈도우 작업과 별개로 먼저 | bash-guard `.exe` 이름 우회·보안 훅 fail-open 은 **맥 코드에도 있는 결함**이라 윈도우 일정과 무관하게 먼저 고칠 가치 | 구현(5.1) — 릴리스 시기는 확인 필요 |
| 41-⑦ | 버전 | 윈도우 지원 완료 릴리스 = **v1.1.0**, 1~4단계 PR 은 기존처럼 패치 +1 | 추천 |

---

## 8. 위험·한계

| 위험 | 대응 |
|---|---|
| F10 — 설정 폴더 스킬을 윈도우가 안 읽으면 구조 자체가 안 맞음 | P7 로 가장 먼저 확인. 안 되면 단일 설정 폴더 + 주입 방식(기존 10장 1번 대안)으로 윈도우만 분기 |
| 로그인 공유가 문서에 없는 동작에 기댐 | `doctor`·`claude-version-check` 가 매 업데이트 점검, 최후 수단은 공식 `setup-token`(4.3-4) |
| `.claude.json` 신뢰 키 버그(F9, open) | 대소문자 양쪽 조회·기록, Claude Code 수정 시 단순화 |
| 백신·인덱서 파일 잠금 | 모든 쓰기를 `atomicWrite` 재시도로 통일, M11 |
| 개발자가 윈도우 PC 를 매일 쓰지 않음 → 회귀를 늦게 발견 | 2단계부터 `windows-latest` CI 를 PR 필수 검사로 |
| Git Bash 경로 변환(`/c/…`)·MSYS 동작 차이 | 훅은 입력 경로를 항상 `normPath` 로 정규화, P5 실측값으로 테스트 |
| comux·tmux 없음 → 세션 목록 감지(결정 38)·옆 창 TUI 불가 | 윈도우는 새 창 방식, 세션 간 메시지는 Claude Code named pipe(F8) 로 동작 — `sessions/` 공유만 맞추면 됨 |

---

## 9. 변경 기록

| 날짜 | 내용 |
|---|---|
| 2026-10-19 | 1차 분석(메모리에만, 보류) |
| 2026-10-20 | 계획서 작성 — 공식 문서 재확인(F1~F11), 코드 전수 조사 40건, PoC 스크립트 작성·맥에서 판정 로직 검증, 결정 41 추천안 · PoC 를 브랜치 `scripts/poc/` 로(4.1) · **1단계 보안·공통 정리 구현(5.1)** · **사용자 윈도우 PC 에서 PoC(4.4)·2~4단계 구현·실측(5.2)**, 결정 41-②~⑤ 구현 |
| 2026-10-21 | (윈도우 PC) main(결정 42·43·창 자동 닫힘) 병합·윈도우 `~` 회귀 수정·병합 뒤 대화형·M2·M3·M8·M11 실측 |
| 2026-10-22 | (맥) M13 회귀 확인·테스트 품질 검토로 찾은 것 수정 — `winpath` `..` 정리(맥도 해당), 늘 통과하던 판정·플랫폼 가정 시험 고침, 빠진 시험 보강, 단위 테스트 CI(맥·윈도우) 추가, 윈도우 재확인 목록(5.3) · (윈도우) 재확인 완료(5.4) — 단위·매트릭스 671 통과, CI 첫 실행 실패 원인 2가지(8.3 짧은 이름 임시 폴더·`~/.claude/projects` 없음)를 시험 9건 수정으로 해소, E2E 모델 거절·요약 의존 판정 3곳을 도구 결과·훅 이벤트 기준으로 · (맥) 5.4 수정 확인(단위 실패 0·E2E 51)·CI 2차 윈도우 훅 단계 고정 `/tmp` 시험 2건 → `os.tmpdir()`(5.5) |
