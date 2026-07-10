# gugbab-claude

Claude Code를 효과적으로 활용하기 위한 **에이전트(Agent)**, **스킬(Skill)**, **설정(CLAUDE.md)** 모음입니다.

---

## 빠른 시작

```bash
./project-install.sh
```

1. 대상 프로젝트 경로 입력
2. 템플릿 선택
3. 에이전트·스킬·훅·규칙이 대상 프로젝트에 자동 복사됨

---

## 프로젝트 구조

```
gugbab-claude/
├── CLAUDE.md        ← 프로젝트 공통 규칙
├── examples/        ← 프로젝트 유형별 CLAUDE.md 템플릿
│   ├── CLAUDE.common.md   ← 공통 규칙 (모든 템플릿에 자동 주입)
│   └── CLAUDE.{stack}.md  ← 스택별 규칙
├── docs/            ← 상세 문서
├── memory/          ← Claude 메모리 미러 (전역 memory의 워킹트리 복사 · 커밋은 수동 · 크로스 데스크탑 공유)
└── .claude/
    ├── agents/      ← 에이전트 (9카테고리)
    ├── skills/      ← 스킬 (11카테고리, 209종)
    ├── hooks/       ← 훅 (22종)
    ├── rules/       ← 규칙 (13종)
    ├── commands/    ← 슬래시 커맨드
    └── settings.json
```

- [agents/](./docs/agents/README.md) — 9카테고리
- [skills/](./docs/skills/README.md) — 11카테고리 209종
- [hooks/](./docs/hooks/README.md) — 22종 (공통 15 · dev 2 · TypeScript 1 · Memory 2 · Codex 1 · Branch Protection 1)
- [rules/](./docs/rules/README.md) — 13종 (공통 8 · 언어별 3 · 선택적 2)

---

## 템플릿

`project-install.sh` 실행 시 선택할 수 있는 템플릿 목록입니다.
생성되는 CLAUDE.md는 **[공통 규칙](./examples/CLAUDE.common.md)** + 스택별 규칙으로 자동 구성됩니다.

| 번호 | 템플릿 | 대상 | 상세 | CLAUDE.md 예시 |
|------|--------|------|------|---------------|
| 0 | 전체 | 모든 에이전트·스킬·규칙 | — | [예시](./examples/CLAUDE.template.md) |
| 1 | 유틸 | 비개발자용 (리서치·검증·플래너 등 범용) | [→](./docs/templates/util.md) | [예시](./examples/CLAUDE.util.md) |
| 2 | react-spa | React SPA + TypeScript | [→](./docs/templates/react-spa.md) | [예시](./examples/CLAUDE.react-spa.md) |
| 3 | nextjs | Next.js App Router | [→](./docs/templates/nextjs.md) | [예시](./examples/CLAUDE.nextjs.md) |
| 4 | rust-axum | Rust + Axum 백엔드 | [→](./docs/templates/rust-axum.md) | [예시](./examples/CLAUDE.rust-axum.md) |
| 5 | java-spring-legacy | Java 11 + Spring Boot 2.5 + MyBatis | [→](./docs/templates/java-spring-legacy.md) | [예시](./examples/CLAUDE.java-spring-legacy.md) |
| 6 | java-spring-modern | Java 21 + Spring Boot 3.x | [→](./docs/templates/java-spring-modern.md) | [예시](./examples/CLAUDE.java-spring-modern.md) |
| 7 | unity-game | Unity 6 LTS 2D 모바일 게임 | [→](./docs/templates/unity-game.md) | [예시](./examples/CLAUDE.unity-game.md) |
| 8 | academic | 논문·학술·인문학 | [→](./docs/templates/academic.md) | [예시](./examples/CLAUDE.academic.md) |
| 9 | dream-interpretation | 꿈 해몽 앱 도메인 | [→](./docs/templates/dream-interpretation.md) | [예시](./examples/CLAUDE.dream-interpretation.md) |
| 10 | health | 건강·식단 PWA 앱 (IndexedDB · Claude AI 연동) | [→](./docs/templates/health.md) | [예시](./examples/CLAUDE.health.md) |

복수 선택도 가능합니다: `react-spa,health` 또는 `2,10` 처럼 쉼표로 구분하면 agents·skills·rules가 **union(합집합)** 으로 병합됩니다.

---

## 다른 프로젝트에 설치하기

gugbab-claude의 에이전트·훅·규칙을 다른 프로젝트에 심어서 팀 전체가 동일한 Claude Code 환경으로 작업할 수 있습니다.

### 설치

```bash
# gugbab-claude 폴더에서 실행
./project-install.sh
```

실행하면 순서대로 입력을 요청합니다.

```
프로젝트 경로를 입력하세요: ./my-project

템플릿을 선택하세요:
  0) 전체              — 모든 에이전트·스킬·규칙 복사
  1) 유틸              — 비개발자용 (리서치·검증·플래너 등 범용 에이전트만)
  2) react-spa         — React SPA
  3) nextjs            — Next.js App Router
  4) rust-axum         — Rust + Axum 백엔드
  5) java-spring-legacy — Java 11 + Spring Boot 2.5 + WAR + MyBatis
  6) java-spring-modern — Java 21 + Spring Boot 3.x + Jar/Native + MyBatis
  7) unity-game        — Unity 6 LTS 2D 모바일 게임 개발
  8) academic          — 논문·학술·인문학
  9) dream-interpretation — 꿈 해몽 앱 도메인
 10) health             — 건강·식단 PWA 앱

번호 또는 이름 입력 (쉼표로 복수 선택 가능): 2,10
```

설치가 완료되면 대상 프로젝트에서 커밋합니다.

```bash
git add .claude/ CLAUDE.md
git commit -m '[config] Add: Claude Code 컨벤션 설정'
git push
```

팀원은 `git clone` 후 Claude Code를 열면 바로 동일한 환경이 구성됩니다.

### 설치되는 항목

| 항목 | 동작 |
|------|------|
| `.claude/hooks/` | 같은 이름이면 덮어씌움 / 프로젝트 고유 훅은 유지 |
| `.claude/agents/` | 같은 이름이면 덮어씌움 / 프로젝트 고유 에이전트는 유지 |
| `.claude/rules/` | 같은 이름이면 덮어씌움 / 프로젝트 고유 규칙은 유지 |
| `.claude/skills/` | 같은 이름이면 덮어씌움 / 프로젝트 고유 스킬은 유지 |
| `.claude/settings.json` | 이미 있으면 덮어쓸지 확인 후 처리 |
| `CLAUDE.md` | 이미 있으면 덮어쓸지 확인 후 처리 |

### gugbab-claude 업데이트 후 갱신

gugbab-claude에 에이전트·훅·규칙이 추가되거나 수정되면 동일한 스크립트를 다시 실행해 프로젝트에 반영합니다.

```bash
# gugbab-claude 폴더에서
git pull
./project-install.sh

# 대상 프로젝트에서
git add .claude/
git commit -m '[config] Update: Claude Code 컨벤션 업데이트'
git push
```

> **CLAUDE.md와 settings.json은 갱신하지 않습니다.**
>
> 두 파일은 프로젝트마다 직접 수정하는 파일입니다.
> - `CLAUDE.md` — 프로젝트명, 실행 명령어, 팀 고유 규칙이 담겨 있음
> - `settings.json` — 프로젝트 고유 권한 설정, 추가 훅 연결이 담겨 있음
>
> 덮어쓰면 프로젝트에서 작성한 내용이 전부 사라지므로 건너뜁니다.
> hooks·agents·rules는 gugbab-claude가 원본이므로 같은 이름의 파일은 최신 버전으로 덮어쓰고, 프로젝트 고유 파일은 그대로 유지합니다.

---

## Claude Code 빠른 참조

```bash
claude                        # 실행
claude --agent {name}         # 특정 에이전트로 세션 시작
claude --continue             # 이전 대화 이어서
```

| 명령어 | 설명 |
|--------|------|
| `/agents` | 등록된 에이전트 목록 |
| `/clear` | 컨텍스트 초기화 |
| `/memory` | 메모리 확인·편집 |
| `/compact` | 컨텍스트 압축 |

---

## 업데이트 로그

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-07-10 | **메모리 저장 구조 개편 — symlink·자동 커밋 폐지**: 전역 `~/.claude/projects/<해시>/memory/`를 실제 디렉토리 1차 저장소로 전환(과거 symlink는 `memory-pull.js`가 자동 마이그레이션), 레포 `memory/`는 워킹트리 미러로 격하. `memory-sync.js` 재작성(git commit → 전역↔레포 양방향 미러 복사), `memory-pull.js` 재작성(git fetch/checkout/commit 제거 → 레포→전역 반영만), `memory-stop-guard.js`(Stop 자동 커밋)·`scripts/setup-memory-link.sh`(symlink 수동 설정) 삭제. `session-export.js` Y/N 판별을 symlink 감지→레포 `memory/` 존재 기준으로 교체 + exports 자동 커밋 제거(워킹트리 저장까지만). memory·exports 커밋·푸시는 전부 사용자 수동 — `[memory] sync`/`[export] sync` 자동 커밋으로 인한 깃 트리 오염 해소. 신규 훅 샌드박스 테스트 9건 + gen-settings 36 + session-export 16 전체 통과. **훅 23→22종**. **커밋 전 메모리 정리 절차 신설(PR #11)**: 커밋·푸시 요청 시 memory 정리→`session-export.js --refresh`(세션 요약 즉시 최신화, 신규 모드)→`[memory]`/`[export]` 커밋 포함을 의무화 — commit.md 0단계·create-pr.md·memory-sync.md 명문화, git.md category에 `memory`·`export` 공식 추가. **deliverable-guard 강제 추가**: push·`gh pr create` 직전 memory/·exports/ 미커밋 감지 시 차단(PreToolUse Bash, --no-readme 무관), gen-settings에 --memory 단독 선택 시 PreToolUse Bash 배선(--no-readme) 신설. 테스트: deliverable-guard 30→39, session-export 16→18, gen-settings 36→40 전체 통과 + 실환경 차단·refresh 검증. **exports 저장 위치 재설계**: Stop(매 턴)은 로컬 `~/.claude/.../exports/`에만 기록, 레포 `exports/`는 커밋 배치 `--refresh` 시점에만 생성 → push 후 워킹트리 항상 클린(매 턴 dirty 잔류 해소), session-export 테스트 18→21 |
| 2026-07-08 | **세션 대화 요약 강제 보존 훅 추가**: `session-export.js` 신규(Stop, 비차단) — 매 세션 대화 요약(사용자 요청 + Claude 응답 + 수정 파일·도구 통계 + Codex 리뷰 라운드)을 markdown으로 자동 저장. memory 공유(Y) 모드면 레포 `exports/`에 커밋(푸시는 사용자), 비공유(N) 모드면 로컬 `~/.claude/projects/<해시>/exports/`. 선택 옵션 없이 모든 템플릿 공통 세트(HOOKS_COMMON)·gen-settings dev/util 양쪽 Stop에 강제 배선. 수정 파일·도구 통계는 트랜스크립트 tool_use 블록에서 직접 추출(제거된 session-summary 의존 없음). 단위 테스트 16 어설션(`session-export.test.js`) + gen-settings 배선 검증 3건 추가. **훅 22→23종** |
| 2026-07-04 | **훅 다이어트 (하네스 평가 후속) — 훅 29→22종, Stop 차단형 6→3개**: ① Plan Mode 중복 제거 — `task-plan-guard`·`confirmation-gate` 삭제, CLAUDE.md "복잡한 작업은 네이티브 Plan Mode 사용" 규칙으로 대체. ② Stop 통합 — `pending-test-guard`+`readme-guard`+`session-summary`(세션 파일 추적) → **`deliverable-guard.js`** 1개로 병합, `session-handoff`/`session-handoff-inject`(네이티브 resume이 커버)·`verification-gate`(경고만)·`careful-with-judge`(rm 분석 → bash-guard 흡수) 삭제. ③ 오탐 수정 — bash-guard 보호 파일(verification.md·SKILL.md·memory/) 차단을 *쓰기 연산*(sed -i·리다이렉트·tee)만으로 축소(읽기 전용 grep/diff/sed -n 허용), 고위험 rm 패턴(~·$HOME·.·.git·.claude·.ssh) 흡수, deliverable-guard의 verification 스캔에서 `.claude/worktrees/` 제외. `agent-md-guard` VALID_MODELS에 `claude-fable-5`·`claude-opus-4-8` 추가. ④ **차단형 훅 테스트 필수화** — 신규 테스트 10종 추가(deliverable·parry·protect-secrets·test-fake·branch-protection·tdd·agent-md·typescript-quality·memory-stop·codex-review), 훅 테스트 4→14종·총 323 어설션 전체 통과. `gen-settings.js`·`project-install.sh` 훅 매트릭스 동기화(+배선 검증 테스트 5종). ⑤ **구조 검증 3종 사전 차단 격상** — `verification-guard`·`skill-md-guard`·`agent-md-guard`의 Write 검증을 PostToolUse(사후 수정 요구)에서 PreToolUse(위반 파일 저장 자체 차단)로 이동, Edit는 디스크 전체 재읽기 사후 검증으로 통일. verification-guard "내장" 단독 매칭을 "내장 지식" 구문으로 좁혀 정당한 문맥("Python 내장 자료형" 등) 오탐 제거. ⑥ **전수 검증** — export 파이프라인 28개 플래그 조합 배선⊆복사 정합 확인, 에이전트 67종·스킬 209종 구조 전수 검증(`game/unity-ui-system` 소스 콜론 누락 1건 수정), agent-md-guard가 `agents/` 하위 CLAUDE.md·README.md를 에이전트로 오인하지 않도록 제외. ⑦ **freshness 전수 재검증(병렬 3에이전트)** — 검증일 30일+ 스킬 8종 WebSearch 재검증 전원 VERIFIED·DISPUTED 0건(`spring-security-6-jwt-jjwt12`는 jjwt 0.12.7·Boot 3.5.16·Security 6.5 지원기한 반영, 위기상담 번호 109·1577-0199 등 7건 유효 확인), SKILL.md·verification.md 검증일 2026-07-04 갱신 → staleness 경과 0건. 에이전트 67종 모델·tools 유효성 전수 OK, 오케스트레이터 maxTurns 누락 2건(deep-researcher 50·skill-tester 30) 보정. E2E 설치 테스트(react-spa 풀옵션·util) 통과 |
| 2026-07-03 | **Claude 구독 중계 서버(relay) 인프라 — 스킬 2종 신규 추가**: `devops/vercel-sandbox`(Sandbox 마이크로VM·Persistent 스냅샷·과금/Hobby 한도·SSE 중계, 12클레임 VERIFIED) · `backend/claude-code-headless`(`claude -p` stream-json·`setup-token` 구독 인증·인증 우선순위 함정·안전 가드, 18클레임 VERIFIED). 양쪽 모두 skill-tester content test 3/3 PASS → APPROVED. 스킬 207→209종. docs/skills 인덱스에 누락됐던 health 카테고리 행 + health/README.md 보정. **에이전트 모델 최신화**: `agent-design.md` 모델 표에 fable 티어(`claude-fable-5`) 추가·opus ID `claude-opus-4-8` 갱신, 장기 리서치 오케스트레이터 2종(`deep-researcher`·`academic-researcher`) fable 전환 |
| 2026-06-26 | **건강·식단 앱 인프라 — 스킬 5종 신규 추가 + 템플릿 10(health) 추가 + 다중 템플릿 export 지원**: `health` 카테고리 신설(`nutrition-basics`·`korean-food-nutrition`·`ingredient-management`·`meal-recommendation-prompt`·`nutrition-analysis-prompt`). `project-install.sh` 쉼표 구분 복수 선택(`react-spa,health` 등) + union 병합 지원. 스킬 202→207종, 카테고리 10→11종, 템플릿 9→10종. |
| 2026-06-20 | **Freshness Audit Phase 2·3 완료** — PENDING_TEST 16개 추가 APPROVED 전환(`web-speech-api-tts`·`web-speech-api-stt`·`indexeddb-dexie`·`media-recorder-api`·`voice-input-ui`·`dream-symbol-tagging`·`dream-recurrence-detection`·`whisper-api-integration`·`chat-ui-pattern`·`emotion-tagging-input`·`dream-sharing-anonymized`·`dream-privacy-consent-ui`·`dream-export-import`·`dream-app-onboarding`·`dream-statistics-visualization`·`dream-image-generation`). `testing-junit5-spring-boot` content test 3/3 PASS 기록(PENDING_TEST 유지). **Phase 3 Warning 재검증** — frontend 4종(nextjs·bundling-compiler·monorepo-turborepo·state-management) + Rust 백엔드 17종 버전 재확인. 주요 업데이트: `sqlx 0.9`·`reqwest 0.13`·`tower-http 0.7`·`jsonwebtoken 10`·`Turborepo 2.9.18` 마이그레이션 노트 추가. |
| 2026-06-19 | **Freshness Audit 개선·재검증** — `mui-v5` 스킬 MUI v9 전면 재작성(name: `mui-v9`, slots/slotProps·Grid size prop·System props 제거·CSS Variables+colorSchemes·v5→v9 Breaking Changes). `meta/riper-workflow` verification.md 신설. Spring Boot 4.x 마이그레이션 섹션 추가(`spring-boot-gradle-setup`·`hikaricp-tuning-oracle-mysql`·`springdoc-openapi-3`·`testing-junit5-spring-boot`). PENDING_TEST 8개 APPROVED 전환(`logback-mdc-tracing`·`python-fastapi`·`python-korean-nlp-konlpy`·`python-embeddings-vector-db`·`moral-education-curriculum-link`·`moral-curriculum-2022-achievement-standards`·`crisis-intervention-resources-korea`·`dream-safety-classifier-prompts`). |
| 2026-06-17 | **`readme-guard.js` 강화** — `.changeset/*.md` 생성 시 README 버전 테이블 업데이트 강제(git diff 기반 탐지). Stop 훅을 경고(exit 0)에서 세션 종료 차단(exit 2)으로 강화. 하위 패키지 README 오탐 수정. **CLAUDE.md 상속 구조 도입** — `examples/CLAUDE.common.md` 신설(공통 5개 규칙). `project-install.sh` 공통 규칙 자동 주입(`<!-- common-rules -->` 플레이스홀더). README 템플릿 표 CLAUDE.md 예시 링크 추가. **`branch-protection.js` 추가** — main push 차단(PR 필수) + 피처→피처 브랜치 생성 차단. 이 프로젝트 필수 적용, export 시 선택 옵션 제공. **훅 28→29종** |
| 2026-06-12 | **README 간소화 + docs/ 연동** — 에이전트·스킬·훅 상세 목록 제거. 프로젝트 구조 카테고리별 클릭 링크 추가. 템플릿별 개별 상세 페이지(9종) 신설. 훅·규칙 개요 페이지 신설. 절대 경로 → 상대 경로 수정. **Codex 적대적 리뷰 인프라 추가**: `codex-review-guard.js` 신규 훅(Stop) — 미커밋 코드 변경 감지 시 3라운드 Codex 리뷰 강제. `bash-guard.js` env var prefix 패턴 보강. `tdd-guard.js` scripts/ 디렉토리 제외 추가. `gen-settings.js` + `project-install.sh` codex 옵션 연동. **훅 27→28종** |
| 2026-06-11 | **레포 정비 개편 작업 2 후속 + Task 3·5 완료 + 강제화 추가** — 훅/룰 export 매트릭스 구현: `project-install.sh` 훅 3계층(공통·개발·TypeScript) + memory 선택 질문 신설. `scripts/gen-settings.js` 추가. 훅 강제화: `parry.js`(시크릿/인젝션 차단), `typescript-quality.js`(tsc 오류 차단). 신규 훅 `staleness-check.js`·`task-plan-guard.js`·`test-fake-guard.js`(개발 전용: 가짜 테스트 차단)·`session-summary.js` Stop 강화. 9종 CLAUDE.md 템플릿(`examples/` 폴더). **Task 5 강제화 강화**: `verification-guard.js`(UNVERIFIED 상태 저장 차단), `agent-md-guard.js` 신규(PostToolUse: agent .md name/description/tools/model/example 검증), `readme-guard.js` 신규(Stop: 스킬·에이전트 추가 시 README 미업데이트 경고), `bash-guard.js`에 memory/ Bash 수정 차단 5종 추가, `agent-design.md` maxTurns 강제 표현 교체. **훅 15→20종** (공통 14 + 개발 전용 2 + TypeScript 1 + memory 3) |
| 2026-06-11 | **크로스 데스크탑 메모리 공유 인프라 구축**: `memory/` 폴더 git 추적 시작(25개 파일) · 훅 3종 추가 — `memory-sync.js`(PostToolUse Write/Edit: memory 변경 즉시 commit+push) · `memory-stop-guard.js`(Stop: 세션 종료 전 미동기 변경 강제 재시도) · `memory-pull.js`(SessionStart: 원격 최신 memory 자동 pull) · `scripts/setup-memory-link.sh`(새 데스크탑 최초 설정 스크립트) · `.claude/rules/memory-sync.md`(동기화 정책 문서화). **레포 정비 개편 (feature/overhaul) 작업 1** — **스킬 21종 삭제** (Claude 내장 지식으로 커버되는 범용·기초 스킬 전체 정리. 총 스킬 224→202종). **project-install.sh 템플릿 2종 신설** — `academic` · `dream-interpretation`. **레포 정비 개편 작업 2** — **훅 4종 삭제** (훅 19→15종). settings.json 4개 이벤트 블록 제거 |
| 2026-06-10 | **game 인프라 Phase 5·6·7 완료 — 에이전트 2종 + 스킬 9종 추가** |
| 2026-06-09 | **game 인프라 Phase 4 — 스킬 2종 추가**: `unity-levelplay-ads`·`unity-iap` |
| 2026-06-08 | **game 인프라 Phase 1·2·3 완료 — 에이전트 4종 + 스킬 6종 추가** |
| 2026-06-04 | **SEO·GEO·웹표준 인프라 3차 라운드 완료 — 스킬 11종 + 에이전트 1종 추가** |
| 2026-06-02 | **SEO·GEO·웹표준 인프라 2차 라운드 완료 — 스킬 11종 + 에이전트 2종 추가** |
| 2026-05-31 | **SEO·GEO·웹표준 인프라 1차 라운드 완료 — 스킬 6종 + 에이전트 1종 추가** |
| 2026-05-15 | **Python + n8n 인프라 완료 — 스킬 21종 추가**. 범용 워크플로우 에이전트 9종 추가 |
| 2026-05-14 | **꿈 해몽 앱 인프라 1차·2차 완료 — 스킬 17종 + 에이전트 3종 추가**. 프론트엔드 성능 벤치마킹 인프라 — 스킬 5종 + 에이전트 2종 |
| 2026-05-13 | **꿈 해몽 앱 인프라 3차 — 스킬 11종 추가** |
| 2026-05-08 | **훅 강화**: `pending-test-guard.js` 업그레이드. `bash-guard.js` memory/ 직접 수정 차단 추가 |
| 2026-05-06 | **Rust 백엔드 스킬 17종 완료**. Java 백엔드 스킬 22종 완료 |
| 2026-04-28 | **에이전트 확장**: domain 카테고리 신설. backend 카테고리 신설. devops-engineer 추가 |
| 2026-04-20 | **프론트엔드 스킬 초기 구축**: frontend 30종. meta/research/validation 에이전트 확장 |
| 2026-04-15 | **초기 구축**: core 에이전트 8종, core 스킬 5종, 훅 6종 |
