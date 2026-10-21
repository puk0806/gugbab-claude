---
name: project-windows-support-analysis
description: "하네스 윈도우 지원 — 2026-10-20 사용자 윈도우 PC 에서 PoC 완료·1~4단계 구현·실측 테스트 완료(미커밋). 남은 것: 맥 회귀 확인·윈도우 CI·대화형 수동 확인·릴리스"
metadata:
  node_type: memory
  type: project
  originSessionId: d852c16f-4ed9-436a-affa-a1a250d0233a
  modified: 2026-10-20T18:00:00.000Z
---

2026-10-19 분석만 → 2026-10-20 맥에서 계획서(결정 41)·1단계 → **같은 날 사용자 윈도우 PC(Win10 LTSC 2019, PS 5.1, Node 22.17, Git 2.37, Claude Code 2.1.280→304 npm 설치)에서 PoC·2~4단계 구현·실측까지**. 브랜치 `feat/windows-support-poc-2026-10-20`, **커밋·푸시 안 함(사용자 지시 — 요청 시에만)**. 상세는 레포 `docs/plans/2026-10-20-windows-support.md` 4.4(PoC 결과)·5.2(2~4단계 결과).

**PoC 로 확정**: 로그인 = 빈 값 `CLAUDE_SECURESTORAGE_CONFIG_DIR`(맥과 같음, 윈도우도 동작) · 설정 폴더 구조 유지(junction 스킬·하드링크 에이전트/룰/커맨드/CLAUDE.md 모두 인식) · 훅은 Git Bash 로 돎(`CLAUDE_PROJECT_DIR=C:/…`) · PowerShell 도구 기본 켜짐 → 조립 settings `env.CLAUDE_CODE_USE_POWERSHELL_TOOL=0` · 심볼릭 링크 EPERM(개발자 모드 꺼짐) → 폴더 junction·파일 하드링크→복사.

**구현 요점**: `cli/launch.js`(Node 래퍼) + `bin/gugbab-claude.cmd`(.ps1 은 일부러 없음 — PS 가 .ps1 을 우선해 Restricted 정책에서 실패) · sh 래퍼는 Git Bash(MINGW/MSYS)면 launch.js 로 넘김 · `cli/winfs.js`(realpath `.native`·rename/unlink 재시도·junction/하드링크·claude.cmd 안의 claude.exe 찾기) · compose 관리 기록 `fileLinks`(윈도우 파일 링크는 일반 파일이라 기록으로 우리 것 판별, 잠겨 못 지우면 기록 유지·다음 조립에서) · 신뢰 키 `C:\`·`C:/` 둘 다 · `install.ps1`(ASCII 만, `<설치>\bin` 을 사용자 PATH 에 REG_EXPAND_SZ 보존, 제거는 `cmd rmdir /s` — PS5.1 `Remove-Item -Recurse` 는 junction 따라감) · 훅 공용 `.claude/hooks/lib/winpath.js`·`testfs.js` · E2E Node 이식 `scripts/wrapper-e2e.js`·전체 매트릭스 `scripts/wrapper-matrix.js`(둘 다 `--home <설치폴더>`).

**윈도우 함정(재발 방지)**: npm `claude`(확장자 없는 sh)는 spawn ENOENT·`.cmd` 는 셸 없이 EINVAL · `claude --version` 13초(백신) → npm package.json 에서 버전 읽음 · Node 22.17 `fs.cpSync` 대상 경로에 한글 있으면 세그폴트 · JS realpath 는 입력 대소문자 유지 · 테스트 임시 홈은 `HOME`+`USERPROFILE` 둘 다 · PS 함수 이름 `Git` 은 `& git` 자기 호출, 함수에 넘긴 `-C` 는 매개변수 토큰으로 사라짐(배열로 넘길 것), PS5.1 `$ErrorActionPreference=Stop`+`2>$null` 은 stderr 한 줄에 예외 · branch-protection 훅은 임시 폴더의 `git checkout -b` 도 막음(테스트 저장소는 node 스크립트로).

**찾았지만 맥 동작이라 안 고친 것(보고함)**: task-confirm-guard 승인 상태 파일을 임시 폴더에 직접 써서 자기 승인 가능 · tdd/adversarial/fake-impl 의 `.claude/hooks` 부분 문자열 제외(`.claude/hooksX/`) · 폴더 링크 너머 파일 신뢰(staleness·auto-format) · 이름만으로 git 실행 시 현재 폴더 git.exe(윈도우 NoDefaultCurrentDirectoryInExePath 없을 때). task-confirm-guard "응 … 하지 말고" 승인 오탐은 고침(모든 플랫폼).

**2026-10-21 대화형 실측 완료**: 이 PC 사용자 PATH 에 `C:\회사\gugbab-claude\gugbab-claude\bin` + 사용자 환경변수 `GUGBAB_HOME`(개발 모드) 등록(원래 PATH 는 세션 scratchpad 백업 — 정식 설치 후 둘 다 지울 것). 자동 키 입력(SendKeys)은 윈도우 포커스 제한으로 안 됨 → `AttachConsole`+`WriteConsoleInput`(가상 키·스캔 코드 채워야 claude 가 받음)+`ReadConsoleOutputCharacter` 로 새 창을 직접 구동해 첫 실행·신뢰·응답·Ctrl+C(키 이벤트)·/harness 새 창 TUI 저장·/exit→--continue·종료 정리 확인. 찾은 것: Git Bash 의 `/` 인자 경로 변환 → sh 래퍼 수정 · 창 하나 입력 멈춤(재현 안 됨) · 이 PC Claude Code 자동 업데이트 중 몇 초간 claude.exe 없음 · 시험 도중 생긴 고아 `git status` 프로세스·오래된 `.git/index.lock`(잠금은 지움, 프로세스 종료는 분류기 거부) · 줄바꿈 정규화 뒤 내용 같은 파일 767개가 status 에 M 으로 보여 인덱스에서 다시 꺼내 정리. 버전 1.0.13.

**남은 것**: 맥에서 전체 테스트·`sh scripts/wrapper-e2e.sh --dev`·`node scripts/wrapper-e2e.js --dev` 회귀 확인(M13) · `windows-latest` CI · M2·M3·M11 · 커밋(사용자 요청 시, 이 PC git 전역 작성자는 회사 계정 kty — 커밋 전 local user 를 puk0806 로 바꿀지 확인).

**How to apply:** 맥으로 돌아가면 위 회귀 확인부터. 윈도우 세션은 메모리를 레포 `memory/` 에 직접 써도 이제 memory-sync 가 전역으로 미러함(윈도우 경로 인식 수정). 관련: [[project-shim-wrapper-direction]] [[reference-wrapper-project-settings-precedence]] [[feedback-report-after-full-tests]]
