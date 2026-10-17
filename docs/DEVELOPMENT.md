# 이 레포 개발 — gugbab-claude

이 레포가 하네스 원본입니다. 설치·사용법은 [README](../README.md) · [사용 안내](USAGE.md) 에 있고, 이 문서는 하네스 자체를 고칠 때의 안내입니다.

## 개발 모드로 실행

고친 것을 설치하지 않고 바로 써 보려면 개발 모드로:

```bash
cd ~/어떤/프로젝트
GUGBAB_HOME=<이 레포 경로> <이 레포 경로>/bin/gugbab-claude      # 자동 최신화 끔, 데이터는 ~/.gugbab-dev
```

## 폴더 구조

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

## 테스트

- 단위·검사: `node --test cli/*.test.js` · `node --test .claude/hooks/*.test.js` · `node --test scripts/*.test.js`
- 실사용 시나리오(실제 claude 세션으로 종류별 껐다 켜기·폴더 분리 확인, 몇 분 걸림): `sh scripts/wrapper-e2e.sh` (설치본) · `--dev` (작업 트리)

## 항목을 추가·변경할 때

- `relations.json`(소속·관계)과 체크리스트를 함께 고치고 `node scripts/build-manifest.js` 로 manifest 를 다시 만듭니다 (`relation-guard` 훅이 빠진 것을 커밋 때 막음).
- manifest 가 바뀌면 `node scripts/build-defaults-doc.js` 로 [기본값·고정 목록](DEFAULTS.md) 도 다시 만듭니다 (최신인지 `scripts/build-defaults-doc.test.js` 가 검사).
- 이 레포에서 작업할 때의 규칙: [CLAUDE.md](../CLAUDE.md) · `.claude/rules/`

## 참고

- 설계·진행 상황: [래퍼 개편 계획서](plans/2026-10-15-gugbab-claude-shim-wrapper.md)
- 변경 기록: [CHANGELOG.md](CHANGELOG.md)

## 명령·설치 옵션 참고

### 설치 옵션

필요한 것: `git`, `node` 18 이상, [Claude Code](https://code.claude.com)(`claude`, 한 번 로그인해 둔 상태). sudo 는 쓰지 않습니다.

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
| `--uninstall` | 제거 — `~/.local/bin/gugbab-claude` 링크와 `~/gugbab`(프로젝트별 켜기·끄기 설정 포함)을 지운다. 대화 기록·메모리(`~/.claude`)는 그대로. 다른 곳을 가리키는 링크나 gugbab 설치본이 아닌 폴더는 지우지 않는다 |

옵션은 `bash -s --` 뒤에 붙입니다. 예: `curl -fsSL …/install.sh | bash -s -- --channel main`


### 하위 명령

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
