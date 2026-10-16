---
name: project-shim-wrapper-direction
description: "2026-10-15 하네스 개편 방향 확정 — 플러그인 아님, `gugbab-claude` 셸 래퍼 + CLAUDE_CONFIG_DIR=~/gugbab/.claude + 세션 내 /harness TUI 토글. 결정 10개·체크리스트·권한 정책 확정, 다음 = manifest 초안 + PoC"
metadata:
  node_type: memory
  type: project
  originSessionId: 956a993c-0d69-41df-9a5f-10e37ec24b3f
  modified: 2026-10-16T02:53:07.059Z
---

2026-10-15 사용자가 하네스 개편 방향을 **shim wrapper 방식**으로 확정했다. 플러그인/마켓플레이스 전환 제안은 명시적으로 거부("공식 플러그인 이딴소리 하지말고").

- 실행: `gugbab-claude` → 원격(GitHub) 하네스 최신화 → `CLAUDE_CONFIG_DIR=~/gugbab/.claude exec claude "$@"`
- 세션 안 `/harness` → 훅·룰·스킬·에이전트 켜기/끄기 TUI (2026-10-15 `/tab`에서 이름 변경 — comux·tmux의 "탭"과 헷갈려서). 띄우는 곳: comux=옆 창, tmux=팝업, 기본 터미널=새 창. 인자 방식(`/harness off <항목>`)은 제안만 함 — 사용자가 "명령어만 바꿔줘"라고 해 계획서에는 미반영. 필수(잠금) 항목은 끌 수 없음, 선택 항목(codex 리뷰 등)은 자유
- 설치 한 번으로 계속 최신 — `project-install.sh` 복사 방식 폐기 목표
- 진행 순서: 계획서·구현 방향·레포 변경안 제시 → 사용자 승인 → PoC → 단계별 진행
- **2026-10-15 확정 상태**: 계획서 `docs/plans/2026-10-15-gugbab-claude-shim-wrapper.md`(13장까지) + 체크리스트 `docs/plans/2026-10-15-harness-item-checklist.md` + 페이지 생성기 `docs/plans/page/`(미커밋). 결정 10개: ~/gugbab 설치, 기록 공유, stable 태그, 현 레포 재구성, Node+@inquirer, 루트 무관 폴더 1단계 정리, comux 우선, `/harness`, 체크리스트 = 추천안 + acceptEdits·임시 폴더 고정(고정16·켬47·끔254), 권한 정책 12장(신규 자동: ArtifactData·Comments·PushNotification·ExitWorktree·TaskStop·LSP / 신규 확인: SendMessage·Cron·RemoteTrigger·DesignSync·PowerShell·Drive update_file)
- **체크리스트 = 한 칸(모든 프로젝트 기본값: 고정·켬·끔)** — 2026-10-15 두 칸("이 레포 / 프로젝트")으로 나눴다가 사용자 판단으로 다시 합침("둘중 하나 고정 아닌건 고정 빼고"). 합치기: 같으면 그 값, 한쪽만 고정이면 고정 아닌 쪽, 둘 다 비고정·다르면 프로젝트 값. 이 레포 전용 고정은 레포 `.gugbab.json`(`lock`·`enable`). 체크리스트 페이지는 일회성이 아니라 **gugbab-claude 레포가 계속 가지고 있는 관리 도구** — 앞으로도 고정/켬/끔을 바꿀 때 이 페이지에서 고르고 Claude 가 db 를 읽어 manifest 기본값에 반영
- **2026-10-15 확정**: 하네스 설정은 프로젝트 폴더가 아니라 `~/gugbab/projects/<프로젝트>/`(그 안 `.claude` = 그 프로젝트의 CLAUDE_CONFIG_DIR)에 저장 — 사용자 표현 "<프로젝트> 에서 열면 /gugbab/<프로젝트>/.claude 로 동작". 프로젝트 폴더·git 에는 파일 안 생김, git 공유 원하는 프로젝트만 선택적 `.gugbab.json`(`lock` 포함). `/harness` 는 연 프로젝트만 바꾸고 선택 시 모든 프로젝트(`profile.json`, 레포 제외). PoC 1번에 "프로젝트별 설정 폴더에서 로그인 공유" 추가 — 실패 시 단일 설정 폴더로 후퇴
- **PoC 일부 실측 (2026-10-16, claude 2.1.296)**: ① `CLAUDE_CONFIG_DIR` 만 바꾸면 "Not logged in" — 키체인 이름이 `Claude Code-credentials-<sha256(설정폴더) 앞 8자>` 로 바뀌기 때문. **`CLAUDE_SECURESTORAGE_CONFIG_DIR=`(빈 값)** 을 함께 주면 기본 키체인 항목을 써서 로그인 공유됨(새 키체인 항목 안 생김). 단 문서에 없는 내부 변수라 버전마다 doctor 로 확인 필요 ② 항목별 심볼릭 링크로 넣은 CLAUDE.md·rules·skills·agents·commands·settings.json(훅) 모두 인식·실행, 실행 후에도 링크 유지. 설정 폴더마다 `.claude.json` 은 따로 생김
- **2026-10-16 체크 완료**(추천에서 바꾼 45개, 고정45·켬46·끔226 — db `checklist/selection` version 110, 아직 체크리스트 md 에 미반영). 사용자 요청으로 항목 간 관계를 계획서 **14장 검토안**에 정리(관계 6종 ①강제·설명 짝 ②필수 호출 ③코드 공유 ④스택 소속 ⑤선택 참조 ⑥이름만 / 기능 묶음 11개 / 템플릿 실측으로 겹치지 않는 스킬 블록 19개 + 템플릿=프리셋 / 방안 A~D, 추천 C+D / 어긋남 7곳 / 정할 것 8개). 사용자가 "방안 보고 어떻게 할지 정하겠다" — **결정 대기**. 사용자 요구: TUI 에 묶음 일괄 켜기·끄기, 스킬은 레포별 일괄
- **2026-10-16 체크리스트 반영 완료**: 사용자 체크 45개 + **묶음 정리 규칙**(짝 묶음 안 상태가 섞이면 고정 빼고 전부 켬 — 두 칸 합칠 때와 같은 원칙 / 필수 의존은 쓰는 쪽 수준까지 끌어올림 / instructions-loaded 끔) → **고정 31 · 켬 69 · 끔 217**. 고정→켬 12(dev-quality 훅 3, memory-pull, harness-authoring 8). 에이전트·스킬 기본값은 새 파일 `docs/plans/page/defaults.json`(gen-md.js 5번째 인자), 페이지 db changes 비움. 14.6 방안 이름 A~D → **방안 1~4**(16장 관계 종류 A~E 와 구분), 처리 순서 A 펼치기→B 채우기→C 정리→B 재검사
- **2026-10-16 방안 3+4 확정 + 관계 검사 구현**(계획서 13장 15~17번, 14.8): 레포 최상위 `relations.json`(묶음 6·standalone 23·블록 21·requires 11·edges 194, 자동 분류 = 스킬발 언급·에이전트→스킬·같은 묶음·requires) + 레포 전용 훅 `relation-guard`(저장 때 안내, `git commit` 때 차단, 전체 검사 0.6초) + `scripts/relations.test.js`. gen-settings 에 레포 전용 `--relation-guard` 옵션, template-ownership 에 `repo-only` 소유. 훅 29→30종, 체크리스트 고정31·켬70·끔217(318). 새 훅·에이전트·스킬 만들 때: 블록/묶음 넣기 + edges 분류 + (훅·룰·커맨드) checklist-head 줄
- **2026-10-16 결정 18 — 개편 범위는 gugbab 만**: 범위 밖 메모리 7·세션 요약 6·분석 문서 1은 `git rm --cached` + `.git/info/exclude`(커밋 안 되는 로컬 제외 목록)로 로컬 전용, 목록은 [[local-index]]. 공유 문서 예시 이름 `my-ui`. 구현(래퍼 본체)은 아직 시작 전 — 계획서 13장 "지금 어디까지 왔나"
- **다음**: manifest.json 초안(relations.json 합침) → 남은 PoC(플러그인 링크·첫 실행 화면 포함) → 1차본 완성 후 Codex 리뷰

**Why:** 복사 설치는 버전 갱신마다 재설치가 필요해 불편. comux처럼 별도 명령으로 감싼 프로그램을 띄우는 형태를 원함.
**How to apply:** 개편 논의에서 플러그인 대안을 다시 꺼내지 말고 래퍼 방식 안에서 해법을 낸다. 불확실한 동작(로그인 유지·핫리로드 등)은 PoC 항목으로 명시. 관련: [[project-harness-status-2026-10-15]] [[project-install-architecture]]
