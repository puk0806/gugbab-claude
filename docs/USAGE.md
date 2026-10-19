# 사용 안내 — gugbab-claude

설치·제거와 기본 실행은 [README](../README.md) 에 있습니다. 이 문서는 처음 실행(프리셋 고르기)·켜기·끄기(`/harness`)·연관 동작·프리셋·업데이트·버전·문제 해결입니다. 기본값과 고정 목록은 [기본값·고정 목록](DEFAULTS.md), 하위 명령·설치 옵션은 [개발 문서](DEVELOPMENT.md#명령설치-옵션-참고) 에 있습니다.

- 프로젝트에 파일을 복사하지 않습니다. 하네스는 `~/gugbab` 한 곳에 있고, 프로젝트 폴더·git 에는 아무것도 생기지 않습니다.
- 한 번 설치하면 실행할 때마다 알아서 최신화됩니다.
- 프로젝트마다 무엇을 켜고 끌지 세션 안 `/harness` 화면에서 고릅니다.
- 로그인·대화 기록·메모리·플러그인은 그냥 `claude` 와 함께 씁니다.

---

## 처음 실행 — 기본 프리셋 고르기

프로젝트(git 최상위 폴더)에서 `gugbab-claude` 를 처음 띄우면 기본으로 켤 프리셋을 묻습니다. 프로젝트 파일을 보고 추천합니다 — `package.json` 의 next·react → `nextjs`, `pom.xml`·`build.gradle` → `java-legacy`/`java-modern`(Spring Boot 버전), `Cargo.toml` → `rust`, `pyproject.toml`·`requirements.txt` → `python`, Unity `ProjectSettings` → `unity`.

```
[gugbab] 이 프로젝트(my-ui)에서 처음 실행합니다 — 기본으로 켤 프리셋(스택별 스킬·에이전트 묶음)을 고르세요
  감지: package.json 에 next → 추천 nextjs
   1) nextjs           React·Next.js (+TS 백엔드)  ★ 추천
   2) java-legacy      Java Spring 레거시
   …
  11) seo-geo          애드온 · SEO·GEO
   0) 고르지 않음 (기본값만 — 나중에 /harness 의 p 로 고를 수 있음)
번호를 입력하세요 (여러 개는 쉼표, 그냥 Enter = 추천(nextjs)): 1,11
```

- 고른 프리셋은 **이 프로젝트에만** 적용되고(`~/gugbab/projects/<프로젝트>/settings.json`), 프로젝트마다 **한 번만** 묻습니다. 나중에 바꾸려면 `/harness` 화면의 `p` 또는 `gugbab-claude preset <이름>`.
- 묻지 않는 경우: `-p`(한 번 실행)·터미널이 아닐 때(스크립트·CI)·이 프로젝트에 이미 켜기·끄기 설정이 있을 때·프로젝트에 `.gugbab.json`(git 공유 설정)이 있을 때·`GUGBAB_NO_FIRST_RUN=1`.
- 잘못 입력하면 세 번까지 다시 묻고, 그래도 아니면 고르지 않은 것으로 시작합니다(세션을 막지 않음).
- 기본과 프리셋마다 모든 항목이 🔒 고정·✅ 켜짐·⬜ 꺼짐 중 무엇인지는 [기본값·고정 목록](DEFAULTS.md) 의 "프리셋 한눈 표"·"항목 × 프리셋 표"·"프리셋별 상세".

---

## 켜기·끄기 — `/harness` 자세히

기본 사용법(여는 법·키·명령)은 [README](../README.md#켜기끄기--harness) 에 있습니다. 처음 상태(기본값)·🔒 고정 목록·프리셋별로 무엇이 켜지고 꺼지는지는 [기본값·고정 목록](DEFAULTS.md) 에서 봅니다. 여기는 화면을 자세히 설명합니다.

화면 예시 — 구성은 [계획서 체크리스트](plans/2026-10-15-harness-item-checklist.md)와 같습니다(종류 → 용도 → 항목, 적힌 순서 그대로). 처음에는 종류와 용도까지만 보이고, → 로 펼쳐 안의 항목을 봅니다. 룰·커맨드·설정처럼 용도 구분이 없는 종류는 항목이 바로 나옵니다.

```
 gugbab 하네스 · my-ui   범위: [이 프로젝트]  모든 프로젝트
 설정 7/7 · 훅 32/32 · 룰 14/14 · 커맨드 12/12 · 에이전트 39/61 · 스킬 1/195 · 🔒 35
 ✅ 켬 · ⬜ 끔 · 🟨 일부만 켬(그룹 안 일부) · 🔒 고정(끌 수 없음) · * 저장 안 한 변경
 ──────────────────────────────────────────────────────────────
   ▸ ✅ 설정                                7/7
   ▾ ✅ 훅                                  31/31
 ›   ▾ ✅ 안전 — 위험한 행동 차단           6/6
         🔒 bash-guard                      훅
         ✅ branch-protection               훅
     ▸ 🔒 작업 방식 — 사용자 규칙 강제      3/3
     ▸ ✅ 개발 품질 (코드 작성 프로젝트용)  7/7
   ▸ ✅ 룰                                  14/14
   ▾ 🟨 스킬                                1/195
     ▸ ⬜ 프론트엔드 (React·Next.js·PWA…)   0/78
     ▸ ⬜ 백엔드 (Java·Rust·Python·TS)      0/52
 ──────────────────────────────────────────────────────────────
 [안전 — 위험한 행동 차단] 6개 중 6개 켜짐 (훅 6) · 🔒 5개는 끌 수 없음 — Space: 안의 항목 일괄 끄기
   · 용도 = 계획서 체크리스트의 분류. Space = 안의 항목 일괄 (🔒 고정은 건너뜀) · 스택 단위는 p(프리셋)·v(블록·묶음 보기)
```

- **Space 규칙**: 항목이면 그것만, 용도면 안의 항목 일괄, 종류면 그 아래 전체 일괄(🔒 고정은 건너뜀). 모두 켜져 있으면 끄고, 하나라도 꺼져 있으면 켭니다. 펼친 그룹에서 → 는 첫 항목으로, 항목에서 ← 는 그 그룹으로 갑니다. 검색(`/`)하면 맞는 항목과 그 위 종류·용도가 자동으로 펼쳐지고, 용도 이름으로 찾으면 그 안 전체가 나옵니다. 저장 안 한 변경이 있으면 q 를 한 번 더 눌러야 닫힙니다.
- **`v` 보기 전환**: 스택 블록(스킬·에이전트·언어 룰 묶음)·기능 묶음(훅·룰·커맨드) 단위로 보고 싶으면 `v` — 큰 갈래(스택 블록·묶음·단독 항목) → 블록·묶음 → 항목. 이 보기에서 블록·묶음 줄의 Space 는 그 이름 하나로 기록됩니다(`block:rust` 등). 저장 안 한 변경은 보기를 바꿔도 그대로입니다.
- **표시**: ✅ 켬 · ⬜ 끔 · **🟨 일부만 켬** — 묶음·블록 안의 항목 중 일부만 켜진 상태(예: 개발 공통 14개 중 8개) · 🔒 고정 · `*` 저장 안 한 변경 · ↷ 이 프로젝트의 자체 `.claude` 가 같은 것을 가져서 여기서 바꿔도 적용 안 됨.
- **설명칸**(화면 아래): 커서가 가리키는 것의 개수·속한 곳·연관 관계(아래 "연관 동작")·🔒 고정 이유를 보여 줍니다. 눌렀는데 안 바뀌면 그 이유를 메시지 줄에 보여 줍니다.
- **이름**: `hook:이름` · `rule:이름.md` · `command:이름` · `agent:이름` · `skill:이름`, 기능 묶음 `bundle:이름`, 스킬·에이전트 스택 `block:이름`.
- **범위**: 기본은 **이 프로젝트만** (`~/gugbab/projects/<프로젝트>/settings.json`). Tab 이나 `--all` 이면 **모든 프로젝트** (`~/gugbab/profile.json`). 둘 다 있으면 이 프로젝트 쪽이 이깁니다.
- **반영 시점**: 훅·스킬·커맨드는 바로. 룰·CLAUDE.md·에이전트·설정은 `/exit` 하면 래퍼가 대화를 이어서(`--continue`) 다시 띄울 때.
- 팀이 같은 설정을 git 으로 공유하려면 프로젝트에 `.gugbab.json`(`lock`·`enable`·`disable`)을 둡니다 — `lock` 은 그 프로젝트에서 끌 수 없게 고정합니다.

### 연관 동작 — 켜고 끌 때 같이 바뀌는 것

항목끼리는 아래 다섯 가지로 엮여 있습니다. 원본은 [relations.json](../relations.json) (묶음·블록·필수 의존·충돌)과 [항목 체크리스트](plans/2026-10-15-harness-item-checklist.md) (고정·켬·끔 기본값)입니다.

| 관계 | 무엇인가 | 켤 때 | 끌 때 |
|---|---|---|---|
| **묶음** (`bundle:`) | 한 기능을 이루는 훅·룰·커맨드(·에이전트) 모음 | 묶음을 켜면 안의 항목이 다 켜짐 | 묶음을 끄면 다 꺼짐. 안의 항목 하나만 끄면 묶음은 🟨 |
| **블록** (`block:`) | 한 스택의 스킬·에이전트·언어 룰 모음. 프리셋은 블록 여러 개를 한 번에 켬 | 블록을 켜면 안의 항목이 다 켜짐 | 블록을 끄면 다 꺼짐 |
| **필수 의존** (requires) | A 가 B 없이는 동작이 깨짐 | A 를 켜면 B 도 같이 켜짐(경고 표시) | B 를 끄면 A 도 같이 꺼짐(경고 표시) |
| **충돌** (conflicts) | A 와 B 를 같이 쓰면 안 됨 | A 를 켜면 B 가 꺼짐 | — |
| **고정** (🔒) | 체크리스트 고정, 또는 프로젝트 `.gugbab.json` 의 `lock` | — | 끌 수 없음. 고정 항목이 필요로 하는 것도 같이 고정 |

한 항목이 묶음과 블록 양쪽에 속할 수 있습니다(목록에 "다른 묶음에도 속함"). 이때는 어느 쪽에서 꺼도 꺼집니다. 처리 순서는 ① 묶음·블록을 항목으로 펼침 → ② 필수 의존 채우기 → ③ 충돌 정리 → ④ 필수 의존 다시 확인 이고, 범위 우선순위는 🔒 고정 > `.gugbab.json` > 이 프로젝트 > 모든 프로젝트 > 기본값입니다.

**필수 의존 목록** (A 가 B 를 필요로 함 — B 를 끄면 A 도 꺼짐)

| A | 필요로 하는 B |
|---|---|
| `command:spec-extract` | `agent:legacy-spec-extractor`, `agent:spec-reviewer`, `skill:spec-extraction-method` |
| `agent:legacy-spec-extractor` | `agent:spec-reviewer` |
| `hook:progress-tracker` | `hook:task-confirm-guard` |
| `hook:deliverable-guard` | `agent:skill-tester` |
| `rule:creation-workflow.md` | `agent:skill-tester` |
| `agent:skill-creator` | `rule:creation-workflow.md` |
| `agent:agent-creator` | `rule:agent-design.md`, `rule:creation-workflow.md` |
| `hook:codex-review-guard` | `rule:codex-review.md` |
| `command:codex-review` | `rule:codex-review.md` |
| `agent:deep-researcher` | `agent:web-searcher`, `agent:research-reviewer` |
| `command:commit` | `rule:git.md` |

**충돌 목록** (A 를 켜면 B 가 꺼짐)

| A | 꺼지는 B |
|---|---|
| `block:nexacro` | `hook:tdd-guard` |

**묶음 목록**

| 묶음 | 기능 | 항목 수 |
|---|---|---|
| `bundle:task-confirm` | 작업 확인 절차 | 3 |
| `bundle:verification` | 스킬 검증 문서 | 2 |
| `bundle:dev-quality` | 테스트 품질 (TDD·적대적 테스트) | 6 |
| `bundle:codex-review` | Codex 리뷰 | 3 |
| `bundle:memory-share` | 메모리 공유 | 3 |
| `bundle:harness-authoring` | 하네스 제작 (스킬·에이전트 만들기) | 14 |

### 프리셋

스택에 맞는 스킬·에이전트 블록을 한 번에 켭니다 (화면에서 `p`, 또는 `gugbab-claude preset <이름>`). 애드온은 다른 프리셋에 더합니다. 프리셋마다 모든 항목이 🔒 고정·✅ 켜짐·⬜ 꺼짐 중 무엇이 되는지는 [기본값·고정 목록](DEFAULTS.md) 의 "프리셋 한눈 표"·"항목 × 프리셋 표"·"프리셋별 상세".

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

- 버전은 GitHub 태그(`v1.0.0`, `v1.0.1` …)로 관리합니다 — [릴리스 목록](https://github.com/puk0806/gugbab-claude/releases). **main 에 PR 이 머지될 때마다 새 버전 태그가 자동으로 붙고**(PR 마다 버전을 올림), 기본 설치(stable)는 최신 태그를 따라가므로 다음 실행 때 자동으로 받습니다.
- 지금 버전·채널은 `gugbab-claude status` 의 "버전" 줄 또는 `gugbab-claude doctor` 로 확인합니다.
- 실행할 때 1시간에 한 번 원격을 확인해 fast-forward 로만 갱신합니다(3초 제한, 오프라인이면 건너뜀). 바로 받으려면 `gugbab-claude update`.
- 특정 버전으로 고정·되돌리기: 설치 명령에 `--version v1.0.0` (자동 최신화 끔). 다시 최신을 따라가려면 옵션 없이 설치 명령을 다시 실행합니다.
- `~/gugbab` 을 직접 고쳐 두었거나 원격 이력이 달라졌으면 덮어쓰지 않고 경고만 합니다 — `~/gugbab` 은 직접 수정하지 마세요.
- 채널을 바꾸거나 버전을 고정하려면 설치 명령을 옵션과 함께 다시 실행합니다 (`--channel` · `--version` · `--ref`).

---

## 문제 해결

| 증상 | 확인 |
|---|---|
| `command not found: gugbab-claude` | `~/.local/bin` 을 PATH 에 넣고 새 터미널 (설치가 알려 준 한 줄) |
| "Not logged in" | 먼저 그냥 `claude` 로 한 번 로그인. 래퍼는 같은 로그인을 씁니다 — Claude Code 업데이트 뒤 이 문제가 생기면 `gugbab-claude doctor` 결과를 확인하세요 |
| 세션을 끝낼 때마다 Codex 리뷰를 요구 | 쓰지 않으면 `/harness` 에서 "Codex 리뷰" 묶음을 끄거나 `gugbab-claude off bundle:codex-review` |
| 바꿨는데 반영이 안 됨 | 룰·에이전트·설정은 `/exit` 후 다시 시작해야 반영. `gugbab-claude status` 의 ⚠ 줄 확인 |
| 하네스 없이 확인하고 싶음 | `gugbab-claude --raw` |
