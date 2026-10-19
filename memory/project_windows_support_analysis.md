---
name: project-windows-support-analysis
description: "하네스 윈도우(PowerShell) 지원 — 2026-10-19 전수 분석 결과, 추후 작업으로 보류(사용자 지시). 착수 시 PoC부터"
metadata:
  node_type: memory
  type: project
  originSessionId: d852c16f-4ed9-436a-affa-a1a250d0233a
  modified: 2026-10-19T06:45:02.381Z
---

2026-10-19 사용자 요청으로 분석만 함 → **"추후 작업으로 진행, 지금은 메모리에만"** (사용자 지시). 사용자는 윈도우 PC 있음. 착수 때 이 메모를 출발점으로.

**결론**: 가능. 단 현재 코드는 윈도우에서 시작부터 실패하고, 고쳐도 보안 훅 다수가 조용히 통과(fail-open). 래퍼·조립·훅 3층 동시 수정. PR 3~4개 규모.

**PoC 먼저 (방향 바뀔 수 있음)**
- A 로그인: 윈도우는 `<CLAUDE_CONFIG_DIR>/.credentials.json` 파일 저장(공식 문서) → 프로젝트별 재로그인. 후보 ① 파일 심볼릭 링크(개발자 모드, 토큰 갱신 시 끊기는지) ② 래퍼가 실행 전후 최신본 복사(동시 세션 갱신 충돌) ③ `claude setup-token` → `CLAUDE_CODE_OAUTH_TOKEN`(구독 가능·1년, Remote Control·커넥터 불가)
- B 스킬·에이전트를 설정 폴더에서 읽는지: 이슈 #31649(윈도우 `$CLAUDE_CONFIG_DIR/skills` 무시)·#41177(junction 스킬 Unknown skill) — 수정 버전 기록 없음. junction/링크/복사로 실측. 안 되면 구조 재설계
- 그 외 실측: 훅이 Git Bash 로 도는지, `.claude.json` 신뢰 기록 키 형식, `sessions/` 위치(세션 메시지는 윈도우 v2.1.234+ named pipe 지원)

**고칠 곳**
- 래퍼 `bin/gugbab-claude`(sh) → 로직을 `cli/launch.js`(Node)로, 윈도우는 `.cmd`/`.ps1` 껍데기. job control 블록 생략. macOS 경로 유지
- `compose.js:18` `UNSAFE_SHELL` 이 `\` 금지 → 윈도우 경로로 무조건 실패(첫 지점). `:141` symlinkSync → 폴더 junction·파일 링크→하드링크→복사. 0o600 mode 비교 건너뜀. 공통 `samePath`(대소문자)·`atomicWrite`(EPERM 재시도)·`normPath`·`findExecutable`(PATHEXT, `.cmd` 는 shell). manifest `additionalDirectories` `/tmp` → `os.tmpdir()`. `open.js` → `wt.exe`. `update.js` fetch 3초 → 늘림 + `GCM_INTERACTIVE=never`
- **`.gitattributes` 없음** → autocrlf 로 `.sh`·`.md` CRLF → statusline·md 가드 깨짐. `* text=auto eol=lf`(공통 조치)
- 훅: `/dev/stdin` 읽기 7개(branch-protection·parry·tdd·adversarial·fake-impl·typescript-quality·codex-review) → ENOENT 삼키고 exit 0 = 무검사 → `readFileSync(0)`. bash-guard·auto-approve 경로 `startsWith('/')` → `rm -rf ~` deny→ask, 시크릿 읽기 우회, 프로젝트 내 Write 마다 확인창. 슬래시 고정 정규식(memory-sync `'/memory/'` 등). `execSync('…2>/dev/null')` 은 cmd.exe 로 돎 → `execFileSync`. CRLF frontmatter(skill/agent-md-guard). auto-format `.bin` sh·`.venv/bin`
- PowerShell 도구는 윈도우 기본 켜짐(공식) → Bash 가드 7개 미적용. **추천: 윈도우 하네스 settings 에 `CLAUDE_CODE_USE_POWERSHELL_TOOL=0`** 으로 Git Bash 고정(Git for Windows 필수화)
- 설치 `install.ps1`(install.sh 1:1), 테스트 CI 자체가 없음(워크플로는 ubuntu 버전검사·태그뿐) → `windows-latest` 추가 시 테스트 56개 중 ~13 확실 실패·~8 환경 의존

**How to apply:** 사용자가 윈도우 작업 재개하면 PoC 스크립트(`poc-windows.ps1`, scratchpad, 결과 JSON)부터 제안 → 결과로 계획서에 새 결정 번호로 추가(39 는 2026-10-19 메모리 폴더 허용에 씀). 관련: [[project-shim-wrapper-direction]] [[reference-wrapper-project-settings-precedence]]
