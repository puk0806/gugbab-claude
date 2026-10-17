# gugbab 하네스 항목 체크리스트 — 고정 / 켜고 끄기 선택

> 최종 수정: 2026-10-17 · 상태: **사용자 체크 반영** (고정 33 · 켬 70 · 끔 217 — 사용자 체크 45개 + 묶음 정리 규칙 적용(계획서 14.5) + 새 훅 relation-guard · parallel-hint · claude-version-check) · 기준: 현재 레포 실측 (훅 32 + 상태줄 1 · 룰 14 · 커맨드 11 + `/harness` · 에이전트 61 · 스킬 195)
> 짝 문서: `docs/plans/2026-10-15-gugbab-claude-shim-wrapper.md`

## 체크하는 법

- `- [x]` = **🔒 고정** — 누구도 `/harness` 에서 끌 수 없음 (항상 켜짐)
- `- [ ]` = **켜고 끄기 가능** — 뒤의 `(기본 켬)` / `(기본 끔)` 은 처음 설치했을 때 상태
- **2026-10-16 반영:** 사용자가 페이지에서 체크한 45개를 반영하고, 같이 켜고 끄는 묶음 안에서 상태가 섞인 곳은 고정을 빼고 켬으로 맞췄다(계획서 14.5). 설정·훅·룰·커맨드는 이 파일, 에이전트·스킬은 `defaults.json` 에 기본값이 있다. 다시 바꾸려면 계획서 페이지의 체크리스트 탭에서 바꾸고 알려주면 반영한다.
- **연관** 줄은 같이 켜고 꺼야 하는 항목입니다. 처리 방법은 맨 아래 **8장**에 정리했습니다.
- `현재:` 는 지금 `project-install.sh` 에서 그 항목이 어느 옵션·템플릿에 딸려 설치되는지입니다.

---

## 1. 기본 설정 (settings.json)

> settings.json = Claude Code 가 시작할 때 읽는 설정 파일. 래퍼에서는 프로젝트별 설정 폴더의 `~/gugbab/projects/<프로젝트>/.claude/settings.json` 을 조립해서 넣는다.

- [x] **위험 명령 차단 목록 (deny)** — 되돌릴 수 없는 명령 14개를 무조건 거부
  - 하는 일: Claude 가 실행하려는 Bash 명령이 이 목록에 맞으면 확인 창도 없이 바로 거부한다. `git push --force`, `rm -rf /usr` 같은 시스템 폴더 삭제, `chmod 777`, `curl … | bash`(인터넷에서 받은 스크립트 바로 실행) 등이 들어 있다.
  - 이렇게 보여요: Claude 가 `git push --force` 를 시도하면 화면에 "Permission denied" 와 함께 실행되지 않고, Claude 는 다른 방법을 찾거나 사용자에게 직접 하라고 안내한다.
  - 끄면: bash-guard 훅이 같은 명령을 대부분 막아주지만, 훅이 꺼지거나 고장 났을 때 마지막 방어선이 사라진다.
  - 지금: 전 템플릿 공통
- [x] **자동 허용 목록 (allow)** — 자주 쓰는 명령·도구는 확인 창 없이 실행
  - 하는 일: `node`·`npm`·`git status`·`ls`·`grep` 등 Bash 명령 41개와 Write·Edit·Read·Agent 등 도구를 "물어보지 말고 실행" 으로 등록한다.
  - 이렇게 보여요: 켜져 있으면 Claude 가 `npm test` 를 돌릴 때 "실행할까요?" 창이 안 뜬다. 꺼져 있으면 이런 명령마다 승인 창이 뜬다.
  - 끄면: 실제로는 auto-approve·bash-guard 훅이 이보다 넓게 자동 허용하기 때문에 큰 차이는 없다. 이 목록은 훅이 없을 때를 대비한 예비. 전체 허용·확인·차단 목록은 계획서 12장 "권한 정책".
  - 지금: 전 템플릿 공통
- [x] **시작 권한 모드 `acceptEdits`** — 파일 수정은 묻지 않고 바로 진행
  - 하는 일: Claude Code 의 기본 모드는 파일을 고칠 때마다 확인 창을 띄운다. 이 설정은 "파일 수정은 자동 승인" 모드로 시작하게 한다. 위험한 수정(비밀 파일·프로젝트 밖)은 훅이 따로 막는다.
  - 이렇게 보여요: 화면 하단에 "accept edits on" 표시가 보이고, Edit·Write 때 승인 창이 뜨지 않는다.
  - 끄면: 파일 하나 고칠 때마다 승인 창이 뜬다.
  - 2026-10-15 사용자 결정으로 고정
- [x] **임시 폴더 접근 허용** — `/tmp`·`/var/folders` 를 작업 폴더처럼 사용
  - 하는 일: Claude 는 원래 프로젝트 폴더 밖 파일을 다룰 때 확인을 받는다. 임시 폴더는 테스트·중간 결과물을 두는 곳이라 예외로 허용한다.
  - 이렇게 보여요: Claude 가 `/tmp/test-output.json` 을 만들거나 읽을 때 확인 창이 안 뜬다.
  - 끄면: 임시 파일을 만들 때마다 확인 창이 뜬다.
  - 2026-10-15 사용자 결정으로 고정
- [ ] **superpowers 플러그인** (기본 켬) — 작업 절차 스킬 모음 (외부 플러그인)
  - 하는 일: 외부에서 받은 플러그인으로, brainstorming(아이디어 정리)·TDD(테스트 먼저 작성)·계획서 작성·코드 리뷰 요청 같은 "일하는 방법" 스킬을 넣어준다.
  - 이렇게 보여요: 새 기능을 만들어 달라고 하면 Claude 가 바로 코드를 쓰지 않고 먼저 요구사항을 질문하거나 계획을 세우는 식으로 움직인다.
  - 끄면: 그런 절차 없이 바로 작업한다. 이 하네스 자체 규칙(진행할까요? 확인 등)은 그대로 남는다.
  - 지금: 설치할 때 질문
- [ ] **상태줄 `statusline.sh`** (기본 켬) — 화면 맨 아래에 브랜치·미커밋 수를 한 줄로 표시
  - 하는 일: Claude Code 입력창 바로 아래에 한 줄을 계속 띄운다. 지금 브랜치, 커밋 안 한 파일 수, 테스트가 덜 끝난(PENDING_TEST) 스킬 수를 보여준다. 숫자가 0 이면 그 부분은 안 나오고, git 레포가 아닌 폴더에서는 아무것도 안 나온다.
  - 이렇게 보여요: `main 12 uncommitted 1 pending` (2026-10-15 이 레포에서 실제 실행 결과). 다 커밋한 상태면 `main` 만 나온다.
  - 끄면: 하단 한 줄이 사라진다. 기능에는 아무 영향 없음.
  - 고침(2026-10-16): pending 숫자를 `docs/skills/**/verification.md` frontmatter `status:` 기준으로 센다(예전엔 스킬 본문의 예시 글자까지 세어 틀렸다 — 지금 실제 14개). 구분자 ` | ` 도 제대로 나온다.
  - 연관: pending 숫자는 스킬을 만드는 이 레포(harness-authoring)에서만 의미가 있다. 일반 프로젝트에서는 `브랜치 + 미커밋 수` 만 보인다.
- [x] **전역 CLAUDE.md 공통 부분** — 모든 프로젝트에서 Claude 가 항상 읽는 기본 규칙
  - 하는 일: CLAUDE.md 는 Claude 가 세션을 시작할 때마다 무조건 읽는 지침서다. 지금 이 레포 CLAUDE.md 에서 어느 프로젝트에나 통하는 부분만 떼어 래퍼가 프로젝트별 설정 폴더(`~/gugbab/projects/<프로젝트>/.claude/CLAUDE.md`)에 링크로 넣는다. 그래서 어느 프로젝트를 열든 Claude 가 자동으로 읽는다(각 프로젝트에 복사할 필요 없음). 프로젝트 자체의 CLAUDE.md 도 함께 읽힌다.
  - 들어가는 것: ① 작업 착수 확인 절차("이렇게 이해했습니다 → 작업 목록 → 진행할까요?") ② 금지 사항 — 커밋·푸시는 요청할 때만, 요청 안 한 곳은 고치지 않기, API 키·토큰을 파일에 쓰지 않기, 검증 안 된 외부 내용 그대로 붙이지 않기 ③ 상황별 룰 안내표 — "git 커밋할 땐 git.md, 외부 정보 조사할 땐 info-verification.md" 같은 길잡이
  - 빠지는 것(이 레포 전용으로 남김): SKILL.md·verification.md·memory 를 Bash 로 고치지 않기, PENDING_TEST 일괄 전환 금지, 테스트 안 된 에이전트를 main 에 커밋 금지
  - 끄면: 고정 훅(task-confirm-guard 등)은 계속 막는데 Claude 는 그 이유를 모르는 상태가 된다 → 그래서 고정

---

## 2. 훅 (32종)

> 훅 = Claude 가 도구를 쓰기 직전·직후, 사용자가 질문을 보낼 때, 답변을 끝낼 때 자동으로 실행되는 검사 프로그램. 막기(차단)·물어보기(확인 창)·정보 주입(Claude 에게 한마디 덧붙이기)을 한다.
> 래퍼에서는 디스패처가 실행 직전에 켜짐/꺼짐을 읽으므로 **훅은 `/harness` 에서 바꾸면 즉시 반영**된다.

### 2.1 안전 — 위험한 행동 차단

- [x] **bash-guard** — Bash 명령을 실행 전에 분석해 위험하면 거부, 애매하면 확인 창
  - 하는 일: Claude 가 실행하려는 셸 명령을 단어 단위로 풀어서 검사한다. 파이프(`|`)·`&&`·`$( )`·`bash -c "…"` 안에 숨긴 명령까지 다 꺼내 본다. 위험(force push, 홈·시스템 폴더 `rm -rf`, 원격 스크립트 실행, 개인키 접근)은 거부, 확인이 필요한 것(commit·push·publish·sudo·프로젝트 밖 삭제)은 확인 창, 나머지 안전한 명령은 자동 허용. `git reset --hard` 는 푸시 안 된 커밋만 지우면 허용, 이미 푸시된 커밋을 지우면 거부.
  - 이렇게 보여요: Claude 가 `git commit -m "…"` 를 실행하려 하면 "git commit 은 사용자 확인이 필요합니다" 확인 창이 뜬다. `echo hi && rm -rf ~` 처럼 숨겨도 거부된다.
  - 끄면: 위 판단이 전부 사라지고 Claude Code 기본 동작(대부분 확인 창)만 남는다. deny 목록 14개만 막힌다.
  - 연관: protect-secrets 의 판정을 가져다 쓰고, branch-protection·package-manager-guard·auto-approve 가 이 훅의 분석기를 가져다 쓴다(코드 공유 — 8장 D)
- [x] **protect-secrets** — 비밀 파일은 못 고치게, 개인키는 못 읽게
  - 하는 일: `.env`·`*.pem`·`*.key`·credentials 파일과 홈의 셸·SSH·git 설정 파일(`~/.zshrc`, `~/.ssh/config`, `~/.gitconfig` 등) 수정을 막는다. 개인키(`~/.ssh/id_rsa`)·클라우드 인증 파일(`~/.aws/credentials` 등)은 읽기도 막는다. `.env` 읽기는 디버깅에 필요해서 허용.
  - 이렇게 보여요: Claude 가 `.env` 에 값을 쓰려 하면 "민감 파일 수정은 차단됩니다" 로 거부된다.
  - 끄면: Claude 가 실수로 비밀 파일을 덮어쓰거나 개인키를 읽어 대화에 노출할 수 있다.
- [x] **parry** — 새로 쓰는 파일에 비밀값·프롬프트 인젝션 문구가 있으면 저장 차단
  - 하는 일: Write 로 저장하려는 내용을 훑어서 API 키·토큰처럼 생긴 문자열이나 "이전 지시를 무시하라" 같은 인젝션 문구가 있으면 저장을 막는다. `.env` 파일은 원래 비밀을 담는 곳이라 제외.
  - 이렇게 보여요: 예제 코드에 진짜처럼 생긴 `sk-…` 키를 박아 넣으려 하면 저장이 거부되고 Claude 가 환경변수로 바꾸는 식으로 고친다.
  - 끄면: 비밀값이 파일에 박혀 git 에 올라갈 위험이 커진다.
- [x] **auto-approve** — 안전한 도구는 자동 승인, 위험한 건 확인 창 강제
  - 하는 일: Read·Grep·Write·Edit·Artifact 같은 도구는 확인 창 없이 승인한다. 반대로 프로젝트 밖 파일 수정, Artifact 삭제, 삭제·공유 계열 MCP 도구(Drive 공유·휴지통 등)는 확인 창을 강제로 띄운다. 자세한 목록은 계획서 12장 "권한 정책".
  - 이렇게 보여요: 켜져 있으면 작업 중 승인 창이 거의 안 뜨고, Google Drive 파일을 공유하려 할 때만 확인 창이 뜬다.
  - 끄면: 도구를 쓸 때마다 승인 창이 늘고, 동시에 "프로젝트 밖 수정 확인" 같은 보호도 사라진다.
  - 연관: bash-guard 의 허용 폴더 판정을 같이 쓴다
- [ ] **branch-protection** (기본 켬) — main 에 직접 push 막기, 브랜치에서 또 브랜치 만들기 막기
  - 하는 일: ① `main`·`master` 로 직접 push 하면 차단 — PR 로만 머지하게 한다 ② 피처 브랜치에서 새 브랜치를 만들면 차단 — 새 브랜치는 항상 main 에서. `feature/main-fix` 처럼 이름에 main 이 들어갈 뿐인 브랜치는 허용.
  - 이렇게 보여요: main 에서 `git push origin main` 을 하려 하면 "main 직접 push 금지 — PR 을 만드세요" 로 거부된다.
  - 끄면: main 에 바로 올리는 게 가능해진다. 혼자 쓰는 작은 레포라면 꺼도 무방.
  - 지금: 설치할 때 옵션
- [x] **config-change-audit** — 세션 중 설정 파일이 바뀌면 무엇이 바뀌었는지 알림
  - 하는 일: 세션 시작 때 settings.json 을 찍어두고, 도중에 바뀌면 비교해서 기록한다. 훅이 빠지거나 허용 목록이 넓어지거나 권한 모드가 바뀌는 등 보호가 약해지는 변경은 ⚠ 로 표시해 알린다. 막지는 않는다.
  - 이렇게 보여요: 누군가(Claude 포함) settings.json 에서 bash-guard 를 빼면 화면에 "⚠ 설정 변경: PreToolUse 훅 bash-guard 제거됨" 같은 알림이 뜬다.
  - 끄면: 하네스 보호가 조용히 꺼져도 알 방법이 없다 → 래퍼 구조에서 고정을 추천하는 이유
  - 지금: 전 템플릿 공통

### 2.2 작업 방식 — 사용자 규칙 강제

- [x] **task-confirm-guard** — "진행할까요?" 에 승인하기 전에는 파일 수정 차단
  - 하는 일: Claude 의 직전 답변 마지막 줄이 "진행할까요?" 이고 사용자가 승인해야 Write·Edit 가 풀린다. "아니", "말고", "다시 정리" 같은 거절·수정 요청은 승인으로 안 본다. 메모리·계획·임시 폴더 쓰기는 항상 허용. 사용자가 "바로 진행"·"확인 없이" 라고 하면 생략.
  - 이렇게 보여요: 지금 이 대화에서 Claude 가 매번 "이렇게 이해했습니다 → 작업 목록 → 진행할까요?" 를 묻는 것이 이 훅 때문이다. 확인 없이 고치려 하면 "승인 전 수정은 차단됩니다" 로 막힌다.
  - 끄면: Claude 가 요청을 받자마자 바로 파일을 고친다.
  - 연관: 룰 `task-workflow.md` 와 짝(8장 A), `progress-tracker` 가 이 훅의 승인 판정을 쓴다(8장 B)
- [x] **korean-response-guard** — 답변을 한국어로 강제
  - 하는 일: 질문을 보낼 때마다 "한국어로 답변" 지시를 덧붙이고, 답변을 끝낼 때 한국어 비율이 낮으면 한 번 다시 쓰게 한다. 코드·경로·도구 이름은 계산에서 뺀다. 사용자가 영어로 해 달라고 하면 통과.
  - 이렇게 보여요: Claude 가 영어로 답하면 답변이 끝나지 않고 곧바로 한국어로 다시 써서 보여준다.
  - 끄면: 질문 언어나 내용에 따라 영어 답변이 섞여 나올 수 있다.
- [x] **progress-tracker** — 승인된 계획과 수정한 파일을 자동 기록, 끊겨도 이어서
  - 하는 일: "진행할까요?" 에 승인하면 그 계획(이해 요약·작업 목록)을 저장하고, 이후 고친 파일을 덧붙인다. 토큰이 떨어지거나 `/clear`·자동 요약으로 대화가 끊긴 뒤 다시 시작하면 "직전에 이 작업을 하다 끊겼다" 고 알려준다.
  - 이렇게 보여요: 새 세션을 열면 "[progress-tracker] 직전 세션에서 승인된 작업이 있습니다 — 요청: … 수정한 파일 10개 …" 가 Claude 에게 전달된다.
  - 끄면: 작업이 끊기면 어디까지 했는지 사용자가 직접 설명해야 한다.
  - 연관: task-confirm-guard 가 꺼져 있으면 '승인' 이 없어 기록할 계획도 없다(8장 B)

### 2.3 세션 편의

- [x] **session-start** — 세션 시작 때 git 상태를 Claude 에게 알려줌
  - 하는 일: 세션이 시작되면 현재 브랜치, 커밋 안 한 파일 목록, 최근 커밋 5개를 Claude 에게 전달한다.
  - 이렇게 보여요: 사용자 화면에는 안 보이고, Claude 가 처음부터 "지금 main 브랜치에 미커밋 파일 8개" 를 알고 답한다.
  - 끄면: Claude 가 상태를 알려면 매번 `git status` 를 직접 실행해야 한다.
- [x] **session-export** — 매 턴 대화 요약을 파일로 저장
  - 하는 일: 답변이 끝날 때마다 요청·답변·수정한 파일·Codex 리뷰 결과를 요약해 `~/…/projects/<해시>/exports/` 에 저장한다. 커밋할 때 `--refresh` 로 레포 `exports/` 에 전체 요약을 만든다(메모리 공유 프로젝트만).
  - 이렇게 보여요: 화면에는 안 보이고, 나중에 "그때 무슨 작업을 했더라" 를 exports 폴더의 md 파일로 확인할 수 있다.
  - 끄면: 대화 원본(JSONL)만 남고 읽기 쉬운 요약은 안 생긴다.
  - 연관: memory-pull·memory-sync 가 이 훅의 경로 계산 함수를 쓴다(코드 공유)
- [x] **cc-notify** — 작업이 끝나면 macOS 알림
  - 하는 일: Claude 가 답변을 끝내면 macOS 알림 센터에 "작업 완료" 알림을 띄운다. 백그라운드 작업을 기다리는 중이면 "대기 중" 으로 알린다. 다른 OS 에서는 아무것도 안 한다.
  - 이렇게 보여요: 다른 창에서 일하다가 화면 오른쪽 위에 "Claude Code — 작업이 끝났습니다" 알림이 뜬다.
  - 끄면: 알림이 없다. comux 를 쓰면 comux 자체 알림이 있어서 겹칠 수 있다.
- [ ] **instructions-loaded** (기본 끔 · **폐지 추천**) — 설치본에 룰 파일이 빠졌는지 검사
  - 프로젝트 추천: 끔
  - 하는 일: 세션 시작 때 이 설치본에 있어야 할 rules 파일이 다 있는지 확인하고, 빠진 게 있으면 경고한다.
  - 끄면/폐지: 복사 설치를 없애면 "설치본에서 빠진 파일" 이란 상황 자체가 없어진다. `gugbab-claude doctor` 가 같은 역할을 대신한다.
  - 래퍼는 이미 실행하지 않는다(끔). 파일 삭제는 `project-install.sh` 를 지우는 6단계에 함께 (결정 21)
  - 지금: 전 템플릿 공통

### 2.4 개발 품질 (코드 작성 프로젝트용)

- [ ] **tdd-guard** (기본 켬) — 테스트 파일 없이 소스만 고치면 차단
  - 하는 일: 소스 파일(`foo.js` 등)을 고쳤는데 짝이 되는 테스트 파일(`foo.test.js`)이 없으면 막는다. 설정 파일·서비스워커·DB 연결 파일처럼 단위 테스트가 어려운 파일은 제외.
  - 이렇게 보여요: 이번 작업에서 `build-page.js` 를 고치자 "[tdd-guard] 테스트 파일 없음 — build-page.test.js 를 만드세요" 로 막혔고, 그래서 테스트를 작성했다.
  - 끄면: 테스트 없이 코드만 늘어날 수 있다.
  - 연관: 레거시 프로파일(nexacro 등 테스트가 거의 없는 코드)과 충돌 — 그 경우 자동으로 꺼짐(8장 C)
- [ ] **adversarial-test-guard** (기본 켬) — 정상 케이스만 있는 테스트는 차단
  - 하는 일: 테스트 파일에 정상 흐름만 있고 악성 입력·경계값·에러 경로 테스트가 2종류 미만이면 막는다. 케이스가 1개뿐인 TDD 초기 단계는 통과.
  - 이렇게 보여요: 로그인 테스트에 "올바른 비밀번호 → 성공" 만 있으면 "SQL 인젝션·빈 값 같은 공격·경계 테스트가 없습니다" 로 막힌다.
  - 끄면: 공격 경로가 검증되지 않은 채 테스트가 통과한다.
- [ ] **fake-impl-guard** (기본 켬) — 테스트 기대값을 그대로 반환하는 가짜 구현 차단
  - 하는 일: 함수가 받은 값을 하나도 안 쓰면서 테스트가 기대하는 숫자·문자열을 그대로 `return` 하면 막는다(예: 할인 계산 함수가 무조건 `return 900`). 정당한 상수 반환은 waiver 주석으로 허용.
  - 이렇게 보여요: 테스트를 억지로 통과시키려는 코드가 저장되지 않고 "가짜 구현입니다" 로 거부된다.
  - 끄면: 테스트는 초록불인데 실제 로직은 없는 코드가 생길 수 있다.
- [ ] **test-fake-guard** (기본 켬) — 테스트를 실행한 척하는 명령 차단
  - 하는 일: 실제 테스트 러너(jest·vitest·pytest·cargo test 등) 없이 `echo "tests passed"`·`true`·`exit 0` 으로 테스트 통과를 흉내내는 명령을 막는다.
  - 이렇게 보여요: Claude 가 `echo "All tests passed"` 를 실행하려 하면 거부된다.
  - 끄면: "테스트 통과" 라는 보고를 믿을 수 없게 된다.
  - 연관 (tdd·adversarial·fake-impl·test-fake 4개 공통): 룰 `adversarial-testing.md`, 커맨드 `/tdd-implement` 와 한 묶음(8장 A — dev-quality)
- [x] **package-manager-guard** — 프로젝트가 쓰는 패키지 매니저만 허용
  - 하는 일: lock 파일로 매니저를 판단한다(pnpm-lock.yaml → pnpm, yarn.lock → yarn, uv.lock → uv 등). 다른 매니저로 설치·삭제·업데이트하면 막는다. `npm run test` 같은 실행 명령은 통과.
  - 이렇게 보여요: pnpm 프로젝트에서 `npm install lodash` 를 하려 하면 "이 프로젝트는 pnpm 을 씁니다" 로 거부된다.
  - 끄면: lock 파일이 둘로 갈라져 팀원·CI 와 의존성 버전이 어긋날 수 있다.
- [x] **auto-format** — 저장한 파일을 프로젝트 포매터로 바로 정리
  - 하는 일: 파일을 저장하면 그 프로젝트에 설정·설치된 포매터(biome·prettier·ruff·black·rustfmt)로 그 파일 하나만 정리한다. 포매터가 없으면 아무것도 안 하고, 인터넷에서 받지도 않는다. Java 는 대상 아님.
  - 이렇게 보여요: Claude 가 쓴 코드의 들여쓰기·따옴표가 저장 직후 프로젝트 스타일로 바뀐다.
  - 끄면: 포맷이 안 맞는 코드가 남고, 나중에 커밋 전 포매터를 따로 돌려야 한다.
- [x] **typescript-quality** — `.ts`·`.tsx` 저장 시 타입 검사, 에러 있으면 차단
  - 하는 일: TypeScript 파일을 저장할 때마다 `tsc --noEmit` 으로 타입 검사를 돌려 에러가 있으면 막는다. 레거시 모드는 이번 저장으로 **새로 생긴** 에러만 막는다(기존 에러 수백 개인 프로젝트용).
  - 이렇게 보여요: 타입이 안 맞는 코드를 저장하면 "TS2322: Type 'string' is not assignable to type 'number'" 같은 에러와 함께 막혀서 Claude 가 바로 고친다.
  - 끄면: 타입 에러는 빌드할 때 한꺼번에 발견된다.
  - 연관: 일반/레거시 두 방식 중 하나만 고른다(8장 C — 변형). TS 스택 모듈에서 켠다

### 2.5 Codex 리뷰

- [ ] **codex-review-guard** (기본 켬) — 코드를 바꾼 턴이 끝날 때 Codex 적대적 리뷰 요구
  - 하는 일: 코드를 바꾼 답변이 끝나면 OpenAI Codex 에게 "배포를 막을 결함을 찾아라" 리뷰를 최대 3라운드 받게 하고, 끝날 때까지 종료를 막는다. codex CLI 가 없거나 로그인이 안 됐으면 조용히 건너뛴다.
  - 이렇게 보여요: 답변이 끝나는 순간 "✗ Codex 적대적 리뷰 필요" 가 뜨고 Claude 가 리뷰를 돌린다(이번 대화에서도 한 번 떴고, 지금은 사용자 요청으로 일시 중지).
  - 끄면: 리뷰는 `/codex-review` 로 원할 때만 한다.
  - 주의: 커밋 안 한 변경 전체가 외부(OpenAI)로 나간다 — 회사 관련 내용이 섞이면 안 됨
  - 연관: 룰 `codex-review.md`, 커맨드 `/codex-review`, codex 플러그인과 한 묶음(8장 A — codex-review)

### 2.6 메모리 공유 (레포에 `memory/` 를 두고 git 으로 여러 PC 공유하는 프로젝트용)

- [ ] **memory-pull** (기본 켬) — 세션 시작 때 레포 `memory/` 의 최신 메모리를 가져옴
  - 하는 일: 다른 PC 에서 push 한 메모리를 `git pull` 로 받은 뒤 세션을 시작하면, 레포 `memory/` 중 더 최신인 파일을 Claude 메모리 폴더로 복사한다.
  - 이렇게 보여요: 화면에는 안 보이고, 집 PC 에서 저장한 메모리를 회사 PC 의 Claude 도 알고 있게 된다.
  - 끄면: 메모리는 PC 마다 따로 쌓인다.
- [ ] **memory-sync** (기본 켬) — 메모리를 쓸 때마다 레포 `memory/` 에도 복사
  - 하는 일: Claude 가 메모리 파일을 쓰면 전역 메모리 폴더와 레포 `memory/` 양쪽에 같은 내용을 복사한다. 커밋은 하지 않는다(커밋은 사용자가 요청할 때).
  - 이렇게 보여요: 메모리를 저장하면 `git status` 에 `memory/…md` 변경이 나타난다(지금 이 레포처럼).
  - 끄면: 메모리는 이 PC 에만 남는다.
  - 연관 (pull·sync 공통): 룰 `memory-sync.md`, deliverable-guard 의 "push 전 memory 미커밋 검사" 와 한 묶음(8장 A — memory-share). 래퍼에서는 메모리 경로가 바뀌어 경로 계산 수정 필요

### 2.7 하네스 개발용 (이 gugbab-claude 레포 작업할 때만 필요)

- [x] **verification-guard** — 스킬 검증 문서(verification.md) 형식 검사
  - 프로젝트 추천: 끔
  - 하는 일: verification.md 에 소스 URL·검증일·판정·테스트 기록이 갖춰졌는지, "내장 지식으로 대체했다" 같은 자백 문구가 없는지 검사해 어긋나면 저장을 막는다.
  - 이렇게 보여요: 검증일을 빼고 저장하면 "verification.md 필수 항목 누락: 검증일" 로 막힌다.
- [ ] **skill-md-guard** (기본 켬) — 스킬 파일(SKILL.md) 형식 검사
  - 프로젝트 추천: 끔
  - 하는 일: SKILL.md 의 이름·설명, 소스 URL, 검증일, 폴더 구조(1단)가 규칙에 맞는지 검사한다.
  - 이렇게 보여요: 소스 URL 없이 스킬을 쓰면 저장이 거부된다.
- [ ] **agent-md-guard** (기본 켬) — 에이전트 파일 형식 검사
  - 프로젝트 추천: 끔
  - 하는 일: 에이전트 md 의 이름·설명·도구·모델, 예시 태그, 구세대 모델 ID 사용 여부, 다른 에이전트를 부르는 에이전트의 maxTurns 설정을 검사한다.
  - 이렇게 보여요: `model: claude-opus-4-6` 같은 구세대 ID 를 쓰면 저장이 거부된다.
- [ ] **deliverable-guard** (기본 켬) — 산출물이 빠졌으면 커밋·종료 차단
  - 프로젝트 추천: 끔
  - 하는 일: ① 스킬·에이전트를 바꿨는데 README 를 안 고치고 commit/push 하면 막는다 ② 테스트 안 끝난(PENDING_TEST) 스킬을 두고 세션을 끝내려 하면 막는다 ③ memory·exports 를 커밋 안 한 채 push 하면 막는다.
  - 이렇게 보여요: 스킬을 추가하고 `git push` 하면 "README 스킬 목록이 갱신되지 않았습니다" 로 막힌다.
- [ ] **staleness-check** (기본 켬) — 스킬 검증일이 오래되면 재검증 알림
  - 프로젝트 추천: 끔
  - 하는 일: 세션 시작 때 스킬 검증일을 확인해 60일이 넘은 스킬이 있으면 재검증하라고 알린다(`--strict` 면 다른 작업보다 먼저 하게 강제).
  - 이렇게 보여요: "검증일 60일 초과 스킬 3개: …" 안내가 Claude 에게 전달된다.
- [ ] **relation-guard** (기본 켬) (신규) — 새 훅·에이전트·스킬의 관계 분류 누락 검사
  - 프로젝트 추천: 끔
  - 하는 일: 훅·에이전트·스킬·룰·커맨드 파일을 저장하면 다른 항목 이름이 새로 나오는데 `relations.json` 에 분류(requires·uses·mention·code)가 없는 관계, 블록·묶음 소속이 없는 새 항목, 체크리스트 줄이 없는 새 훅·룰·커맨드를 알린다. `git commit` 때 하나라도 남아 있으면 커밋을 막는다.
  - 이렇게 보여요: 새 에이전트에서 `skill-tester` 를 부르게 쓰고 커밋하면 "분류 안 된 관계 agent:새이름>agent:skill-tester — relations.json 의 edges 에 추가하세요" 로 막힌다.
  - 연관 (2.7 전체): 룰 `creation-workflow.md`·`verification-policy.md`·`agent-design.md`·`readme-update.md`·`commands.md`, 에이전트 `skill-creator`·`skill-tester`·`agent-creator`·`freshness-auditor`, 커맨드 `/agent-status` 와 한 묶음(8장 A — harness-authoring). 래퍼에서는 스킬·에이전트가 각 프로젝트가 아니라 `~/gugbab` 에 있으므로 이 레포의 `.gugbab.json` 에서만 켠다
- [x] **parallel-hint** (신규) — 병렬로 할 수 있는 작업을 병렬로 하게 안내 (🔒 2026-10-17 사용자 결정)
  - 하는 일: 요청에 서로 독립인 작업이 여럿 보이면(번호 목록·여러 동사·"병렬") 독립 도구 호출은 한 응답에 묶고, 긴 테스트는 백그라운드로, 독립 조사는 서브에이전트로 동시에 하라고 Claude 에게 알린다(앞 결과가 필요한 단계·같은 파일 수정·커밋 순서는 제외). 읽기 전용 조회를 한 번에 하나씩 3번 연속하면 묶으라고 한 번 알린다. 막지는 않는다.
  - 이렇게 보여요: "독립 조회는 한 응답에 묶어 병렬로" 같은 안내가 Claude 에게 전달된다.
- [x] **claude-version-check** (신규) — 세션 시작 때 Claude Code 버전 변경·새 버전 알림 (🔒 2026-10-17 사용자 결정)
  - 하는 일: 세션을 시작하면 `claude --version` 을 지난 세션에 본 버전과 비교해, 바뀌었으면 "래퍼의 로그인 공유는 문서에 없는 내부 변수를 쓰므로 Not logged in 이면 `gugbab-claude doctor`" 를 알린다. 하루에 한 번 npm 레지스트리에서 최신 버전을 확인해(3초 제한, 실패하면 건너뜀) 더 새 버전이 있으면 `claude update` 로 올릴 수 있다고 알린다. 막지는 않는다. `/harness`·`status`·`doctor` 에도 버전 줄이 나온다.
  - 이렇게 보여요: "Claude Code 새 버전 2.1.300 이 있습니다 (지금 2.1.296)" 안내가 Claude 에게 전달된다.

---

## 3. 룰 (14종)

> 룰 = Claude 가 세션 시작 때 읽는 규칙 문서. `paths` 가 있는 룰은 해당 종류 파일을 다룰 때만 읽힌다. 바꾸면 **재시작 후 반영**.

- [ ] **git.md** (기본 켬) — 커밋 메시지 형식과 커밋 나누는 기준
  - 하는 일: 커밋 메시지를 `[category] Type: Subject` 형식으로 쓰게 한다(예: `[docs] Add: 래퍼 개편 계획서`). 스킬·에이전트·설정·문서 변경이 섞이면 관심사별로 커밋을 나누게 한다.
  - 이렇게 보여요: "커밋해줘" 하면 Claude 가 변경을 보고 `[config] Modify: …`, `[docs] Add: …` 처럼 나눠서 커밋한다.
  - 연관: `/commit`·`/create-pr` 이 이 룰을 따른다
- [x] **info-verification.md** — 외부 정보는 공식 문서부터 확인
  - 하는 일: 외부 정보를 쓸 때 공식 문서 → 공식 GitHub → Stars 500 이상 레포 → 블로그 순으로 확인하게 하고, 확인 안 되면 추측하지 말고 사용자에게 알리게 한다.
  - 이렇게 보여요: 라이브러리 사용법을 물으면 Claude 가 출처 URL 과 함께 답하고, 확인 못 한 부분은 "확인 안 됨" 으로 표시한다.
- [x] **task-workflow.md** — 작업 착수 전 확인 절차의 상세 규칙
  - 하는 일: "이렇게 이해했습니다 → 작업 목록 → 진행할까요?" 절차, 예외(조회·설명·커밋은 바로 실행), 마지막 줄 형식을 설명한다.
  - 끄면: 훅은 계속 막는데 Claude 가 예외 기준을 모른다.
  - 연관: `task-confirm-guard` 와 짝 — 룰만 켜고 훅을 끄면 "훅이 강제한다" 는 문구가 사실과 달라진다(8장 A)
- [ ] **adversarial-testing.md** (기본 켬) — 테스트는 정상·공격·경계 3계층 필수
  - 하는 일: 테스트에 정상 케이스 + 악성 유저 공격(인젝션·권한 우회·중복 제출 등) + 이상·경계 입력(빈 값·초장문·동시 요청)을 모두 넣게 하고, 테스트 통과용 가짜 구현을 금지한다. 공격 시나리오 체크리스트가 들어 있다.
  - 이렇게 보여요: "로그인 API 테스트 써줘" 하면 성공 케이스와 함께 SQL 인젝션·잠금·빈 값 테스트까지 만든다.
  - 연관: dev-quality 묶음(8장 A)
- [ ] **typescript.md** (기본 켬) — TypeScript·React 코딩 규칙
  - 하는 일: TS·React 코드 작성 규칙. `*.ts`·`*.tsx` 를 다룰 때만 읽혀서 다른 프로젝트에는 영향이 없다.
- [ ] **java.md** (기본 켬) — Java 코딩 규칙
  - 하는 일: Java·Spring 코드 작성 규칙. `*.java`·gradle·pom 을 다룰 때만 읽힌다.
- [ ] **rust.md** (기본 켬) — Rust 코딩 규칙
  - 하는 일: Rust 코드 작성 규칙. `*.rs`·`Cargo.toml` 을 다룰 때만 읽힌다.
- [ ] **codex-review.md** (기본 켬) — Codex 리뷰 진행 방법
  - 하는 일: Codex 리뷰 실행 조건 3가지(CLI 설치·로그인·플러그인), 라운드 진행, 지적별 ACCEPT/REJECT 판정, 완료·사용 불가 표시 파일 기록 방법을 정한다.
  - 연관: codex-review 묶음
- [ ] **memory-sync.md** (기본 켬) — 메모리 저장 구조와 커밋 전 메모리 정리
  - 하는 일: 메모리는 전역 폴더가 원본, 레포 `memory/` 는 복사본이라는 구조와, 커밋을 요청받으면 먼저 메모리를 정리하는 5단계를 정한다.
  - 연관: memory-share 묶음, `/commit` 의 "메모리 정리 먼저" 단계
- [ ] **agent-design.md** (기본 켬) — 에이전트 만드는 규칙
  - 프로젝트 추천: 끔
  - 하는 일: 에이전트 모델 선택 기준(fable·opus·sonnet·haiku), 도구는 최소로, frontmatter 형식, 폴더 구조를 정한다.
  - 연관: harness-authoring
- [ ] **creation-workflow.md** (기본 켬) — 스킬·에이전트 생성 5단계
  - 프로젝트 추천: 끔
  - 하는 일: 조사 → 교차 검증 → 작성 → verification.md 저장 → skill-tester 실사용 테스트 순서를 정하고, 셀프 검증으로 테스트를 대신하는 것을 금지한다.
  - 연관: harness-authoring
- [x] **verification-policy.md** — 스킬 검증 상태 바꾸는 규칙
  - 프로젝트 추천: 끔
  - 하는 일: PENDING_TEST → APPROVED 전환 절차(개별 확인 필수, 일괄 전환 금지), 재검증할 때 함께 고칠 위치를 정한다.
  - 연관: harness-authoring
- [ ] **readme-update.md** (기본 켬) — 자산이 바뀌면 README 도 같이
  - 프로젝트 추천: 끔
  - 하는 일: 에이전트·스킬·훅을 추가·삭제·이름변경하면 README 목록·개수·업데이트 로그를 함께 고치게 한다.
  - 연관: harness-authoring (deliverable-guard 의 README 검사)
- [ ] **commands.md** (기본 켬) — 슬래시 커맨드 작성 규칙과 목록
  - 프로젝트 추천: 끔
  - 하는 일: 커맨드 파일 위치·작성 원칙과 현재 커맨드 목록을 관리한다.
  - 연관: harness-authoring

---

## 4. 슬래시 커맨드 (11종 + 신규 `/harness`)

> 커맨드 = 입력창에 `/이름` 을 치면 미리 정해둔 지시가 실행되는 단축 명령. 바꾸면 반영 시점은 PoC 에서 확인(즉시일 가능성 있음).

- [x] **/harness** (신규) — 훅·룰·스킬·에이전트를 켜고 끄는 화면 열기
  - 하는 일: 이 체크리스트의 항목을 고정/켬/끔으로 바꾸는 TUI 화면을 띄운다. comux 안이면 옆 창, tmux 안이면 팝업, 기본 터미널이면 새 창에 뜬다.
  - 지금(2026-10-16, 2단계): 화면 대신 현재 상태(`gugbab-claude status`)를 보여주고 `/harness off hook:cc-notify` 처럼 명령으로 켜고 끈다. TUI 는 4단계.
  - 끄면: 다시 켤 방법이 없어진다 → 고정 필수
- [ ] **/commit** (기본 켬) — 규칙에 맞춰 커밋
  - 하는 일: 메모리 정리를 먼저 한 뒤, 변경 내용을 보고 `git.md` 형식으로 커밋 메시지를 써서 커밋한다. 관심사가 섞이면 나눌지 먼저 묻는다.
  - 이렇게 보여요: `/commit` → "[docs] Add: 래퍼 개편 계획서 / [memory] Add: …" 처럼 나눠 커밋하고 결과를 보고한다.
  - 연관: 룰 `git.md`, memory-share 가 켜져 있으면 메모리 정리 단계 수행
- [ ] **/create-pr** (기본 켬) — GitHub PR 만들기
  - 하는 일: 현재 브랜치의 커밋과 변경 범위를 분석해 PR 제목(70자 이내)과 본문(요약·테스트 계획)을 쓰고 `gh pr create` 로 올린다. push 전에 확인을 받는다.
- [ ] **/fix-pr** (기본 켬) — PR 리뷰 코멘트 반영
  - 하는 일: PR 의 대화 코멘트·리뷰 요약·라인 코멘트를 모두 읽고, 해결 안 된 것만 골라 파일별로 수정 계획을 보여준 뒤 확인받고 고친다. 커밋은 안 한다.
  - 이렇게 보여요: `/fix-pr 24` → "코멘트 5개 중 미해결 3개: …" 계획 → 승인 후 수정
- [ ] **/context-prime** (기본 켬) — 새 세션에서 현재 상태 파악
  - 하는 일: CLAUDE.md·룰·git 상태·최근 커밋·README 앞부분을 읽고 "지금 브랜치·수정 중인 파일·적용 중인 규칙·이어서 할 일" 을 요약한다.
- [ ] **/create-plan** (기본 켬) — 3단계 구현 계획서 작성
  - 하는 일: 요구사항(해결할 문제·완료 조건·범위 밖) → 설계(바꿀 파일·인터페이스) → 작업 목록(30분 단위) 순서로 계획을 쓰고 "이 계획으로 진행할까요?" 를 묻는다.
- [ ] **/update-docs** (기본 켬) — 코드 변경에 맞춰 문서 동기화
  - 하는 일: 최근 커밋과 커밋 안 한 변경을 보고 관련 README·docs 를 찾아 어긋난 부분을 목록으로 보여준 뒤, 확인받고 문서만 고친다. 코드와 커밋은 건드리지 않는다.
- [ ] **/tdd-implement** (기본 켬) — 테스트 먼저 쓰는 방식으로 구현
  - 하는 일: 실패하는 테스트 작성(Red) → 통과할 최소 코드(Green) → 정리(Refactor) 순서를 지키며, 단계마다 넘어가도 되는지 묻는다.
  - 연관: dev-quality 묶음
- [ ] **/sparc-refine** (기본 켬) — 5단계 리팩터링
  - 하는 일: 명세(문제·목표·범위) → 의사코드 → 구조 설계 → 개선 → 완성 순서로 코드를 정리한다. 단계마다 확인받는다.
- [ ] **/agent-status** (기본 켬) — 하네스 작업 현황 요약
  - 프로젝트 추천: 끔
  - 하는 일: 브랜치·최근 커밋 3개·미커밋 파일·PENDING_TEST 스킬 수·오늘 수정한 파일을 한 번에 보여준다.
  - 연관: harness-authoring
- [ ] **/codex-review** (기본 켬) — Codex 리뷰를 원할 때 실행
  - 하는 일: codex-review 룰의 절차대로 커밋 안 한 변경 전체를 Codex 에게 최대 3라운드 리뷰받는다.
  - 연관: codex-review 묶음
- [ ] **/spec-extract** (기본 켬) — 레거시 코드에서 스펙 문서 추출
  - 하는 일: 지정한 범위(레포·모듈·화면)의 레거시 코드에서 화면·API·데이터·규칙 명세를 뽑아 `docs/spec/` 에 문서로 남긴다. 소스는 고치지 않는다.
  - 연관: 에이전트 `legacy-spec-extractor`·`spec-reviewer`, 스펙 추출 스킬 4종(spec-extraction 묶음)

<!--TAIL-->
---

## 7. 고정 목록 요약 (2026-10-16 사용자 체크 반영 — 31개)

| 종류 | 🔒 고정 | 이유 |
|---|---|---|
| 설정 (5) | deny 목록, allow 목록, 전역 CLAUDE.md 공통부, `acceptEdits` 시작 권한 모드, 임시 폴더 접근 허용 | 꺼지면 위험 명령이 그냥 실행됨 / 나머지는 사용자 결정(작업 흐름 고정) |
| 훅 (15) | bash-guard, protect-secrets, parry, auto-approve, config-change-audit, task-confirm-guard, progress-tracker, korean-response-guard, session-start, session-export, cc-notify, package-manager-guard, auto-format, typescript-quality, verification-guard | 안전·비밀 보호, 하네스가 몰래 꺼지는 것 감지, 사용자가 모든 프로젝트에 강제하기로 한 작업 흐름 |
| 룰 (3) | info-verification.md, task-workflow.md, verification-policy.md | 모든 프로젝트 공통 원칙 (git.md 는 사용자 결정으로 켬으로 바꿈) |
| 커맨드 (1) | /harness | 이게 꺼지면 다시 켤 방법이 없음 |
| 에이전트 (7) | claude-code-guide, web-searcher, fact-checker, source-validator, research-reviewer, tech-stack-advisor, socratic-interviewer | 정보 검증 원칙을 실제로 수행하는 범용 도구 + 사용자 결정 |
| 스킬 | 없음 | 많을수록 엉뚱한 스킬이 끌려오므로 묶음 단위 선택 |

묶음 정리로 **고정 → 켬** 이 된 12개(dev-quality 훅 3, memory-pull, harness-authoring 8)는 계획서 14.5 참고. harness-authoring 은 gugbab-claude 레포에서만 `.gugbab.json` 으로 다시 고정한다.

---

## 8. 연관된 항목 처리 방법

연관은 5가지 종류가 있고, manifest 에 종류별로 적어 두면 `/harness` 과 조립기가 자동으로 처리합니다.

### A. 짝 묶음 — 함께 켜고 꺼야 의미가 맞는 것

훅이 강제하는 규칙과 그 규칙을 설명하는 룰·커맨드는 한쪽만 켜면 어긋납니다 (예: 훅은 꺼졌는데 룰은 "훅이 강제한다" 고 말함).

| 묶음 | 구성 |
|---|---|
| **task-confirm** | 훅 task-confirm-guard + 룰 task-workflow.md |
| **dev-quality** | 훅 tdd-guard·adversarial-test-guard·fake-impl-guard·test-fake-guard + 룰 adversarial-testing.md + 커맨드 /tdd-implement |
| **codex-review** | 훅 codex-review-guard + 룰 codex-review.md + 커맨드 /codex-review + codex 플러그인 |
| **memory-share** | 훅 memory-pull·memory-sync + 룰 memory-sync.md + deliverable-guard 의 push 전 검사 |
| **harness-authoring** | 훅 verification-guard·skill-md-guard·agent-md-guard·deliverable-guard·staleness-check·relation-guard + 룰 agent-design·creation-workflow·verification-policy·readme-update·commands + 에이전트 skill-creator·skill-tester·agent-creator·freshness-auditor + 커맨드 /agent-status |
| **spec-extraction** | 에이전트 legacy-spec-extractor·spec-reviewer + 커맨드 /spec-extract + 스킬 spec 4종 |
| **nexacro** | 에이전트 nexacro-screen-analyzer·nexacro-screen-converter·migration-parity-tester + 스킬 nexacro 5종 + 레거시 프로파일 (C 참고) |

**처리:** `/harness` 에서 묶음이 한 줄로 보이고, 묶음을 켜고 끄면 구성원이 같이 바뀜. 펼치면 구성원을 개별로 끌 수도 있지만 "룰과 훅이 어긋남" 경고를 표시.

### B. 의존 — A 를 쓰려면 B 가 켜져 있어야 하는 것

- **에이전트 → 스킬**: 예) `java-backend-developer` 는 `mybatis-mapper-patterns` 등 10종을 참조 (5장 "쓰는 스킬")
- **에이전트 → 에이전트**: 예) `deep-researcher` 는 `web-searcher`·`research-reviewer` 를 부름
- **훅 → 훅 (기능)**: `progress-tracker` 는 `task-confirm-guard` 의 승인이 있어야 계획을 기록

**처리:**
- A 를 켜면 B 를 **자동 포함** (TUI 에 "자동 포함 — deep-researcher 때문" 표시, 사용자가 B 를 따로 끄지 않아도 됨)
- A 가 켜진 상태에서 B 를 끄려 하면 "deep-researcher 가 사용 중 — 같이 끌까요?" 확인
- 🔒 고정 항목이 필요로 하는 것은 자동으로 고정 취급

### C. 충돌·변형 — 동시에 켤 수 없는 것

- **레거시 프로파일 ↔ tdd-guard**: 테스트가 거의 없는 레거시 코드에서는 tdd-guard 가 거의 모든 수정을 막음 → nexacro 묶음을 켜면 tdd-guard 를 끄고 typescript-quality 를 레거시 방식으로 전환
- **typescript-quality 일반 / 레거시(`--changed-only`)**: 둘 중 하나만 선택 (TUI 에서 라디오 버튼)

**처리:** manifest 에 `conflicts`·`variants` 로 적고, TUI 가 저장할 때 충돌을 보여주고 어느 쪽을 쓸지 묻기.

### D. 코드 공유 — 토글과 무관 (신경 안 써도 됨)

`bash-guard` 의 명령 분석기를 `branch-protection`·`package-manager-guard`·`auto-approve` 가, `protect-secrets` 판정을 `bash-guard` 가, `session-export` 경로 함수를 `memory-*` 가, `staleness-check` 날짜 검사를 `verification-guard` 가 가져다 씁니다.
래퍼에서는 **훅 파일은 항상 그대로 있고 디스패처가 실행만 건너뛰므로**, 하나를 꺼도 다른 훅이 깨지지 않습니다.

### E. 프로젝트별 차이 — 어디에 저장되고 무엇이 먼저인가

- 하네스 설정은 프로젝트 폴더가 아니라 `~/gugbab/projects/<프로젝트>/` 에 프로젝트별로 저장된다 (예: `my-ui` 를 열면 `~/gugbab/projects/my-ui/`). 프로젝트 폴더·git 에는 아무것도 안 생긴다
- 적용 순서: **🔒 고정(이 체크리스트) > 프로젝트 `.gugbab.json`(git 공유를 원하는 프로젝트만, `lock` 포함) > 연 프로젝트 설정 > 모든 프로젝트 `profile.json` > 이 체크리스트 기본값**
- `/harness` 는 기본으로 **연 프로젝트만** 바꾸고, 위쪽에서 "모든 프로젝트" 를 고르면 전체 기본값을 바꾼다(gugbab-claude 레포 제외)
- 예) `my-ui` 에서 codex-review 를 끄면 `my-ui` 에서만 꺼짐. 고정 항목은 어느 프로젝트에서도 못 끔

### manifest 표현 예

```jsonc
{
  "bundles":   { "codex-review": ["hook:codex-review-guard", "rule:codex-review", "command:codex-review", "plugin:codex@openai-codex"] },
  "requires":  { "agent:deep-researcher": ["agent:web-searcher", "agent:research-reviewer"],
                 "hook:progress-tracker": ["hook:task-confirm-guard"] },
  "conflicts": [["bundle:nexacro", "hook:tdd-guard"]],
  "variants":  { "hook:typescript-quality": ["normal", "changed-only"] }
}
```

에이전트 → 스킬 의존은 에이전트 본문에서 스킬 이름을 찾아 **자동 생성**합니다 (이 문서의 "쓰는 스킬" 도 그렇게 뽑음). 손으로 관리하지 않으므로 빠질 일이 적습니다.
