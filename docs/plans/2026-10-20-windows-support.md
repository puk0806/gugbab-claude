# gugbab 하네스 윈도우 지원 계획서

> 작성: 2026-10-20 · 최종 수정: 2026-10-20 · 상태: **0단계 PoC 대기** (사용자 윈도우 PC 실행 필요)
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

PoC 파일 두 개(`poc-windows.js`·`poc-windows.ps1`)를 윈도우 PC 의 같은 폴더에 둔다. 전달 방법(USB·메신저·레포 브랜치)은 사용자가 정한다.

```powershell
# 0) 준비: Git for Windows, Node 22+, Claude Code(평소 쓰는 방식으로 설치·로그인 1회)
# 1) 하네스 레포를 윈도우에 클론 (테스트·훅 실측용 — autocrlf 영향을 보려면 기본 설정 그대로)
git clone https://github.com/puk0806/gugbab-claude.git C:\src\gugbab-claude
# 2) PoC — Windows Terminal 의 PowerShell 에서 (Git Bash 창 아님)
powershell -ExecutionPolicy Bypass -File .\poc-windows.ps1 -Repo C:\src\gugbab-claude
# 3) 로그인 파일 링크 방식까지 보려면 (실제 .credentials.json 을 가리킴 — 끝나면 원상 확인·복구)
powershell -ExecutionPolicy Bypass -File .\poc-windows.ps1 -LinkCreds
```

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
| M13 | macOS 회귀 | `wrapper-e2e.sh --dev` 전부 통과, 기존 세션과 같은 동작 |

---

## 7. 결정 (결정 41) — 추천안, 확정은 사용자

| # | 항목 | 추천 | 상태 |
|---|---|---|---|
| 41-① | 진행 순서 | **PoC 먼저**, 결과로 P6(로그인)·P7(설정 폴더 내용) 방향 확정 후 1단계 | 사용자 승인(2026-10-20) |
| 41-② | PowerShell 도구 | **윈도우 하네스는 끔**(`CLAUDE_CODE_USE_POWERSHELL_TOOL=0`), Git for Windows 필수 — Bash 가드 7개를 PowerShell 로 다시 만들지 않는다 | 추천 — 확인 필요 |
| 41-③ | 래퍼 형식 | **Node 런처(`cli/launch.js`) + `.cmd`·`.ps1` 껍데기**, macOS sh 래퍼는 당분간 유지(comux 작업 제어 때문) | 추천 — 확인 필요 |
| 41-④ | 링크 | 폴더 **junction**, 파일 **하드링크 → 복사** (개발자 모드·관리자 권한 요구하지 않음) | 추천 — P2 결과로 확정 |
| 41-⑤ | 지원 터미널 | **Windows Terminal**(PowerShell 7/5.1, cmd) 공식 지원, Git Bash 창(mintty)은 TTY 감지가 안 돼 비권장 | 추천 |
| 41-⑥ | 1단계를 윈도우 작업과 별개로 먼저 | bash-guard `.exe` 이름 우회·보안 훅 fail-open 은 **맥 코드에도 있는 결함**이라 윈도우 일정과 무관하게 먼저 고칠 가치 | 추천 — 확인 필요 |
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
| 2026-10-20 | 계획서 작성 — 공식 문서 재확인(F1~F11), 코드 전수 조사 40건, PoC 스크립트 작성·맥에서 판정 로직 검증, 결정 41 추천안 |
