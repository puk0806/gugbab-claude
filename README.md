# gugbab-claude

`claude` 대신 **`gugbab-claude`** 로 실행하면 훅·룰·스킬·에이전트·커맨드 하네스가 붙은 Claude Code 가 열립니다.

- 프로젝트에 파일을 복사하지 않습니다. 하네스는 `~/gugbab` 한 곳에 있고, 프로젝트 폴더·git 에는 아무것도 생기지 않습니다.
- 한 번 설치하면 실행할 때마다 알아서 최신화됩니다.
- 프로젝트마다 무엇을 켜고 끌지 세션 안 `/harness` 화면에서 고릅니다.
- 로그인·대화 기록·메모리·플러그인은 그냥 `claude` 와 함께 씁니다.

---

## 설치

필요한 것: `git`, `node` 18 이상, [Claude Code](https://code.claude.com)(`claude`, 한 번 로그인해 둔 상태). sudo 는 쓰지 않습니다.

```bash
curl -fsSL https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.sh | bash
```

- `~/gugbab` 에 설치되고 `~/.local/bin/gugbab-claude` 링크가 생깁니다.
- `~/.local/bin` 이 PATH 에 없으면 셸 설정(`~/.zshrc` 등)에 넣을 한 줄을 알려 줍니다. 넣은 뒤 새 터미널을 여세요.
- 끝에 `gugbab-claude doctor` 점검 결과가 나옵니다.
- 다시 실행하면 갱신합니다. `~/gugbab` 이 다른 내용으로 차 있으면 건드리지 않고 멈춥니다.

| 옵션 | 설명 |
|---|---|
| `--version vX.Y.Z` | 그 버전(태그)으로 고정 — 자동 최신화 끔 |
| `--channel stable\|main` | 최신화 채널. stable = `v*` 태그 중 최신(태그가 아직 없으면 main), main = main 최신 커밋 |
| `--ref <브랜치>` | 그 브랜치를 받고 계속 따라감 — PR 머지 전 시험용 |
| `--dir PATH` · `--bin-dir PATH` | 설치 위치(기본 `~/gugbab`) · 링크 위치(기본 `~/.local/bin`) |
| `--yes` | 묻지 않고 진행 |
| `--uninstall` | 제거 (아래) |

옵션은 `bash -s --` 뒤에 붙입니다. 예: `curl -fsSL …/install.sh | bash -s -- --channel main`

---

## 사용

프로젝트 폴더에서:

```bash
gugbab-claude                    # 하네스가 붙은 claude — 인자는 claude 에 그대로 (예: gugbab-claude -p "질문")
gugbab-claude --raw              # 하네스 없이 그냥 claude
```

| 명령 | 하는 일 |
|---|---|
| `gugbab-claude status` | 이 프로젝트에 켜진 것 요약 (하네스 버전·Claude Code 버전·종류별 개수·기본값과 다른 항목·경고) |
| `gugbab-claude doctor` | 설치·로그인·조립 상태 점검 |
| `gugbab-claude update` | 지금 바로 최신화 (평소엔 실행할 때 1시간에 한 번 자동) |
| `gugbab-claude harness` | 켜기·끄기 화면 (터미널에서) |
| `gugbab-claude on\|off <항목> [--all]` | 명령으로 켜기·끄기 — 예: `off hook:cc-notify`, `on bundle:dev-quality`, `on block:rust` |
| `gugbab-claude preset [이름] [--all]` | 프리셋 목록 / 적용 |

### 켜기·끄기 — `/harness`

세션 안에서 `/harness` 를 치면 켜기·끄기 화면이 뜹니다 — comux 안이면 옆 창, tmux 안이면 팝업, 그 밖의 macOS 면 새 터미널 창. `/harness off <항목>` · `/harness preset <이름>` 처럼 명령으로도 됩니다.

```
 gugbab 하네스 · my-ui   범위: [이 프로젝트]  모든 프로젝트
 설정 7/7 · 훅 29/30 · 룰 14/14 · 커맨드 12/12 · 에이전트 39/61 · 스킬 1/195 · 🔒 32
 ── 묶음 — 훅·룰·커맨드를 기능별로 (6) ─────────────────
›   🔒 작업 확인 절차                  3/3 · bundle:task-confirm
    ✅ 테스트 품질 (TDD·적대적 테스트  6/6 · bundle:dev-quality
    ⬜ Codex 리뷰                      0/3 · bundle:codex-review
 ── 스택 블록 — 스킬·에이전트 (21) ─────────────────────
    🟨 개발 공통                       8/14 · block:dev-common
 ↑↓ 이동 · Space 켜기/끄기 · Tab 범위 · / 검색 · p 프리셋 · Enter 저장 · q 닫기
```

- **이름**: `hook:이름` · `rule:이름.md` · `command:이름` · `agent:이름` · `skill:이름`, 기능 묶음 `bundle:이름`, 스킬·에이전트 스택 `block:이름`. ✅ 켬 · ⬜ 끔 · 🟨 일부만 켜짐 · 🔒 고정.
- **범위**: 기본은 **이 프로젝트만** (`~/gugbab/projects/<프로젝트>/settings.json`). Tab 이나 `--all` 이면 **모든 프로젝트** (`~/gugbab/profile.json`). 둘 다 있으면 이 프로젝트 쪽이 이깁니다.
- **🔒 고정** 항목(확인 절차·위험 명령 차단·비밀 보호·병렬 안내 등)은 끌 수 없습니다. 눌렀는데 안 바뀌면 이유(고정·다른 설정이 덮음·필수 의존)를 보여 줍니다.
- **반영 시점**: 훅·스킬·커맨드는 바로. 룰·CLAUDE.md·에이전트·설정은 `/exit` 하면 래퍼가 대화를 이어서(`--continue`) 다시 띄울 때.
- 팀이 같은 설정을 git 으로 공유하려면 프로젝트에 `.gugbab.json`(`lock`·`enable`·`disable`)을 둡니다 — `lock` 은 그 프로젝트에서 끌 수 없게 고정합니다.

### 프리셋

스택에 맞는 스킬·에이전트 블록을 한 번에 켭니다 (화면에서 `p`, 또는 `gugbab-claude preset <이름>`). 애드온은 다른 프리셋에 더합니다.

| 프리셋 | 내용 | 켜지는 블록 |
|---|---|---|
| `nextjs` | React·Next.js (+TS 백엔드) | `dev-common` · `frontend-core` · `frontend-tooling` · `ts-backend` |
| `java-legacy` | Java Spring 레거시 | `dev-common` · `java-common` · `java-legacy` |
| `java-modern` | Java Spring 모던 | `dev-common` · `java-common` · `java-modern` |
| `rust` | Rust Axum | `dev-common` · `rust` |
| `python` | Python FastAPI | `dev-common` · `python` |
| `unity` | Unity 게임 | `dev-common` · `unity` |
| `dream` | 꿈 해몽 앱 | `frontend-core` · `frontend-tooling` · `ai-app` · `dream` |
| `fortune` | 운세 앱 | `frontend-core` · `frontend-tooling` · `ai-app` · `fortune` |
| `health` | 건강·식단 앱 | `frontend-core` · `frontend-tooling` · `ai-app` · `health` |
| `nexacro` | 넥사크로 마이그레이션 | `dev-common` · `frontend-core` · `java-common` · `java-legacy` · `nexacro` |
| `seo-geo` | 애드온 · SEO·GEO | `seo-geo` |
| `spec-extraction` | 애드온 · 레거시 스펙 추출 | `spec-extraction` |
| `n8n` | 애드온 · n8n | `n8n` |

---

## 업데이트 · 버전

- 버전은 GitHub 태그(`v1.0.0`, `v1.0.1` …)로 관리합니다 — [릴리스 목록](https://github.com/puk0806/gugbab-claude/releases). 기본 설치(stable)는 **최신 태그**를 따라가므로 main 에 머지돼도 새 태그가 붙기 전에는 받지 않습니다.
- 지금 버전·채널은 `gugbab-claude status` 의 "버전" 줄 또는 `gugbab-claude doctor` 로 확인합니다.
- 실행할 때 1시간에 한 번 원격을 확인해 fast-forward 로만 갱신합니다(3초 제한, 오프라인이면 건너뜀). 바로 받으려면 `gugbab-claude update`.
- 특정 버전으로 고정·되돌리기: 설치 명령에 `--version v1.0.0` (자동 최신화 끔). 다시 최신을 따라가려면 옵션 없이 설치 명령을 다시 실행합니다.
- `~/gugbab` 을 직접 고쳐 두었거나 원격 이력이 달라졌으면 덮어쓰지 않고 경고만 합니다 — `~/gugbab` 은 직접 수정하지 마세요.
- 채널을 바꾸거나 버전을 고정하려면 설치 명령을 옵션과 함께 다시 실행합니다 (`--channel` · `--version` · `--ref`).

## 제거

```bash
curl -fsSL https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.sh | bash -s -- --uninstall --yes
```

`~/.local/bin/gugbab-claude` 링크와 `~/gugbab`(프로젝트별 켜기·끄기 설정 포함)을 지웁니다. 대화 기록·메모리(`~/.claude`)는 그대로입니다. 다른 곳을 가리키는 링크나 gugbab 설치본이 아닌 폴더는 지우지 않습니다.

## 문제 해결

| 증상 | 확인 |
|---|---|
| `command not found: gugbab-claude` | `~/.local/bin` 을 PATH 에 넣고 새 터미널 (설치가 알려 준 한 줄) |
| "Not logged in" | 먼저 그냥 `claude` 로 한 번 로그인. 래퍼는 같은 로그인을 씁니다 — Claude Code 업데이트 뒤 이 문제가 생기면 `gugbab-claude doctor` 결과를 확인하세요 |
| 세션을 끝낼 때마다 Codex 리뷰를 요구 | 쓰지 않으면 `/harness` 에서 "Codex 리뷰" 묶음을 끄거나 `gugbab-claude off bundle:codex-review` |
| 바꿨는데 반영이 안 됨 | 룰·에이전트·설정은 `/exit` 후 다시 시작해야 반영. `gugbab-claude status` 의 ⚠ 줄 확인 |
| 하네스 없이 확인하고 싶음 | `gugbab-claude --raw` |

---

## 무엇이 들어 있나

| 종류 | 수 | 문서 |
|---|---|---|
| 스킬 | 스킬 (11카테고리, 195종) | [docs/skills/](./docs/skills/README.md) |
| 에이전트 | 에이전트 (9카테고리) 61종 | [docs/agents/](./docs/agents/README.md) |
| 훅 | 훅 (32종) — 확인 절차·위험 명령 차단·비밀 보호·TDD·적대적 테스트·한국어 답변·병렬 안내·Claude Code 버전 확인 등 | [docs/hooks/](./docs/hooks/README.md) |
| 룰 | 규칙 (14종) | [docs/rules/](./docs/rules/README.md) |
| 커맨드 | 12종 — `/harness` · `/commit` · `/create-pr` · `/create-plan` · `/tdd-implement` 등 | [.claude/commands/](./.claude/commands) |

무엇이 기본으로 켜지고 무엇이 고정인지는 [항목 체크리스트](./docs/plans/2026-10-15-harness-item-checklist.md), 항목끼리의 관계(묶음·블록·필수 의존)는 [relations.json](./relations.json) 이 원본입니다.

---

## 이 레포 개발

이 레포가 하네스 원본입니다. 고친 것을 설치하지 않고 바로 써 보려면 개발 모드로:

```bash
cd ~/어떤/프로젝트
GUGBAB_HOME=<이 레포 경로> <이 레포 경로>/bin/gugbab-claude      # 자동 최신화 끔, 데이터는 ~/.gugbab-dev
```

```
gugbab-claude/
├── install.sh            ← 한 줄 설치
├── bin/gugbab-claude     ← 실행 진입점
├── cli/                  ← 래퍼 (조립·훅 디스패처·업데이트·doctor·status·켜기/끄기 화면·프리셋)
├── manifest.json         ← 래퍼가 읽는 항목 정의 (생성 파일 — node scripts/build-manifest.js)
├── relations.json        ← 항목 관계 원본 + 프리셋
├── .gugbab.json          ← 이 레포 전용 래퍼 설정
├── .claude/              ← 하네스 원본 (agents · skills · hooks · rules · commands · settings.json)
├── docs/                 ← 상세 문서 · 계획서 · 업데이트 로그
├── scripts/              ← 생성기·검사 스크립트와 테스트
└── memory/               ← Claude 메모리 미러 (커밋은 수동)
```

- 테스트: `node --test cli/*.test.js` · `node --test .claude/hooks/*.test.js` · `node --test scripts/*.test.js`
- 실사용 시나리오(실제 claude 세션으로 종류별 껐다 켜기·폴더 분리 확인, 몇 분 걸림): `sh scripts/wrapper-e2e.sh` (설치본) · `--dev` (작업 트리)
- 항목을 추가·변경하면 `relations.json`(소속·관계)과 체크리스트를 함께 고치고 `node scripts/build-manifest.js` 로 manifest 를 다시 만듭니다 (`relation-guard` 훅이 빠진 것을 커밋 때 막음).
- 이 레포에서 작업할 때의 규칙: [CLAUDE.md](./CLAUDE.md) · `.claude/rules/`
- 설계·진행 상황: [래퍼 개편 계획서](./docs/plans/2026-10-15-gugbab-claude-shim-wrapper.md)
- 변경 기록: [docs/CHANGELOG.md](./docs/CHANGELOG.md)
