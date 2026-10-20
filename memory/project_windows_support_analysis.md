---
name: project-windows-support-analysis
description: "하네스 윈도우 지원 — 2026-10-20 계획서 작성(결정 41), 0단계 PoC 대기. 사용자 윈도우 PC 에서 PoC 스크립트 실행 결과 JSON 을 받아 방향 확정"
metadata:
  node_type: memory
  type: project
  originSessionId: d852c16f-4ed9-436a-affa-a1a250d0233a
  modified: 2026-10-20T04:37:31.167Z
---

2026-10-19 분석만 하고 보류 → **2026-10-20 사용자 요청("윈도우도 돌아가게, 이슈 많을 테니 잘 동작하게")으로 계획서 작성**. 상세는 레포 `docs/plans/2026-10-20-windows-support.md`, 개편 계획서 결정 41·17장. 코드 수정은 아직 없음.

**지금 상태: 0단계 PoC 대기** — 사용자가 윈도우 PC 에서 `poc-windows.ps1`(+`poc-windows.js`)을 돌려 `poc-windows-result.json` 을 돌려줘야 함. 스크립트는 **브랜치 `feat/windows-support-poc-2026-10-20` 의 `scripts/poc/`** 에 커밋·푸시(2026-10-20, PR 은 올리지 말라는 사용자 지시 — 이 브랜치에서 작업 이어감). 윈도우 실행: `git clone -b <브랜치> …` 후 `powershell -ExecutionPolicy Bypass -File .\scripts\poc\poc-windows.ps1 -Repo <클론>`. 결과 JSON 은 레포 안에 생기므로 커밋 금지. 계획서 4.1 경로는 2026-10-20 고침.

**1단계 구현 (2026-10-20, 이 브랜치, 커밋 전)** — bash-guard `cmdNameOf` 가 `\`·`.exe/.cmd/.bat/.com/.ps1` 를 떼고 판정 + `cmd`·`powershell`·`pwsh`·`wsl`·`wscript`·`cscript`·`mshta` ask · `/dev/stdin` 훅 8개 → `readFileSync(0)`, **branch-protection·parry 는 입력 비었거나 깨지면 exit 2(fail-closed, 사용자 승인)** · branch-protection `execFileSync`, codex-review-guard `which` → PATH 직접 탐색 · CRLF 정규화(skill/agent/verification 가드·inv·parse-checklist·build-page) · `.gitattributes`. 검증: 훅 34파일·391·e2e 40/40·전후 실세션 비교. 2단계로 미룬 것: `path.delimiter`(결정 39 env 구분자 `:` — compose·bash-guard 양쪽), 공용 경로 헬퍼, 훅 테스트 러너 `echo '…' | node`. **main 병합(v1.0.12) 끝, 푸시는 아직**(병합 커밋 a0a9935 + 1단계 미커밋). 맥에서 판정 로직 검증 완료(`.ps1` 은 맥에 PowerShell 없어 미실행).

**방향을 가르는 두 항목**: P6 로그인 공유(빈 값 내부 변수 → `.credentials.json` 하드링크 → 실행 전후 동기화 → `setup-token` 순) · P7 설정 폴더 스킬 인식(공식 이슈 #31649·#41177 은 고쳐지지 않고 중복·stale 로 닫힘 — 안 되면 단일 설정 폴더 + 주입으로 구조 분기).

**확인된 사실(공식)**: 훅·상태줄 command 는 윈도우에서 Git Bash(없으면 PowerShell), `args` 실행 형식·`shell` 필드 있음, 경로는 `/` 로. Git Bash 있으면 `Bash(...)` deny 규칙이 PowerShell 도구를 조용히 끔. npm 설치는 Node 22+. 신뢰 키 `C:/…` 드라이브 대소문자 버그(#75855).

**코드 조사 40건** — 시작 실패 7(`compose.js:18` `\` 거부가 첫 지점) · 보안 8(`/dev/stdin` 훅 8개 fail-open, **bash-guard 가 `git.exe push --force`·`rm.exe -rf ~`·`cmd //c rd`·`powershell.exe Remove-Item` 을 PermissionRequest 자동 승인 — 맥에서도 같은 판정 실측**) · 기능 24(`split(':')` 로 결정 39 무효 등) · 테스트(60개 중 27 확실 실패, 훅 테스트 러너 `echo '…' | node` 가 cmd 비호환).

**맥 함정**: 래퍼 세션 안에서 테스트 돌리면 `GUGBAB_*`·`CLAUDE_CONFIG_DIR` 이 새어 `bin.test.js` 2개 실패, `CLAUDE_SECURESTORAGE_CONFIG_DIR=` 가 새어 "새 설정 폴더도 로그인됨"으로 오판 — 지우고 돌릴 것.

**추천(미확정, PoC 뒤 확정)**: PowerShell 도구 끔 + Git for Windows 필수 · Node 런처 `cli/launch.js` + `.cmd`/`.ps1` 껍데기(macOS sh 유지) · 폴더 junction·파일 하드링크→복사 · Windows Terminal 공식 · 1단계(보안 결함, 맥에도 있음)는 윈도우 일정과 별개로 먼저 · 완료 릴리스 v1.1.0.

**윈도우 PC 에서 이어서 작업하기 (2026-10-20 사용자 결정 — 이 메모리를 윈도우로 넘겨 거기서 계속)**
- 윈도우에서는 아직 `gugbab-claude` 가 안 뜬다 → **그냥 `claude` 를 레포 클론 폴더에서 실행**(레포 `.claude/settings.json` 훅이 Git Bash 로 돎). `git clone -b feat/windows-support-poc-2026-10-20 https://github.com/puk0806/gugbab-claude.git C:\src\gugbab-claude` → `cd` → `claude`
- 메모리: 세션 시작 훅 `memory-pull` 이 레포 `memory/` → 그 PC 전역 메모리로 복사(전역 위치는 훅 입력 transcript_path 기준이라 윈도우 경로도 따라감). 첫 답변 전에 `memory/MEMORY.md`·이 파일이 읽혔는지 확인, 안 읽혔으면 레포 `memory/` 를 직접 Read
- **윈도우에서 새로 쓴 메모리는 레포로 자동 미러되지 않는다**(memory-sync 가 `includes('/memory/')` 라 `\` 경로를 못 봄 — 2단계 수정 대상). 윈도우 세션은 메모리를 **레포 `memory/` 파일에 직접 Write/Edit** 해서 커밋해야 맥으로 돌아온다
- 윈도우에서 예상되는 불편(2단계 전): 프로젝트 안 Write/Edit 도 확인 창(auto-approve 의 `/` 판정), `%TEMP%` 쓰기 확인, memory-sync 미러 안 됨. 보안 훅은 1단계로 동작
- 첫 할 일: `powershell -ExecutionPolicy Bypass -File .\scripts\poc\poc-windows.ps1 -Repo C:\src\gugbab-claude` → `poc-windows-result.json` 을 읽고 계획서 4.2 분기표대로 판정(결과 파일은 커밋 금지 — 사용자 이름·경로)
- 로컬 전용 메모리 7개(`local_index.md` 목록 — 업무 프로젝트 관련, 결정 18)는 git 제외라 윈도우로 안 간다. 윈도우 작업엔 필요 없음

**How to apply:** 결과 JSON 받으면 계획서 4.2 분기표대로 판정 → 계획서·결정 41 갱신(+페이지 재게시) → 1단계 착수 전 확인. 관련: [[project-shim-wrapper-direction]] [[reference-wrapper-project-settings-precedence]] [[feedback-report-after-full-tests]]
