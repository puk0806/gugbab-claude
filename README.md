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
    ├── skills/      ← 스킬 (11카테고리, 220종)
    ├── hooks/       ← 훅 (24종)
    ├── rules/       ← 규칙 (14종)
    ├── commands/    ← 슬래시 커맨드
    └── settings.json
```

- [agents/](./docs/agents/README.md) — 9카테고리
- [skills/](./docs/skills/README.md) — 11카테고리 220종
- [hooks/](./docs/hooks/README.md) — 24종 (공통 15 · dev 4 · TypeScript 1 · Memory 2 · Codex 1 · Branch Protection 1)
- [rules/](./docs/rules/README.md) — 14종 (공통 9 · 언어별 3 · 선택적 2)

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
| 2026-08-31 | **java 템플릿 export 전수검사 + 필터 누수·버그 5건 수리** (실무 Java 레거시 프로젝트 설치 준비 점검에서 발견): ① java 분기가 "backend만 화이트리스트, 그 외 카테고리 무조건 통과" 구조라 dream 스킬 4종(meta 3·architecture 1)·n8n 5종·site-migration-seo·frontend-domain-structure·github-actions-visual-regression·vercel-sandbox가 딸려가던 누수 차단(`is_java_noncore_excluded`), SEO 옵트아웃 질문이 java에선 안 나와 `INCLUDE_SEO=true` 기본값으로 항상 통과하던 seo-auditor·content-quality-reviewer + 프론트 전용 a11y-auditor·build-perf-benchmarker·perf-report-writer 에이전트와 고아 frontend/CLAUDE.md도 `EXCLUDE_AGENTS_JAVA`에 추가 — 순수 java 재설치에서 이전 잔재가 정리되도록 prune 기록 포함(타 템플릿 병행 설치 시엔 가산적 설계 보호를 위해 기록 안 함) ② `backend/spring-boot-2-to-3-migration`이 JAVA_SKILLS 배열 미등록으로 legacy 템플릿에서 탈락하던 버그 수정(LEGACY_ONLY 등록) ③ 스킬 복사 루프가 SKILL.md만 순회해 `references/` 부속 파일이 설치본에서 깨져 있던 버그 수정 — 부속 파일을 파일별 매니페스트 기록과 함께 복사 ④ 결과: java-legacy 설치본 스킬 39→27종·에이전트 35→28종(모던 25종) ⑤ docs/templates java 2종을 실제 설치 내역으로 동기화(에이전트 표에 changelog-writer·typescript-backend 2종·pr-reviewer 반영, Python 스킬 미설치 사실 정정, 훅 16→19종, 규칙 기본 5종+작성 옵션, 커맨드 9종 섹션 신설) ⑥ rust-axum·unity-game 분기의 동일 fallthrough 누수(dream meta 3·architecture 1·frontend-domain-structure) 차단 + 두 템플릿 문서 스킬 표 동기화 ⑦ **`scripts/template-separation.test.js` 신설** — 6개 템플릿을 실설치하는 E2E로 분리 불변식(코어 포함/누수 제외·references 복사·rules/commands 구성·python 미설치·react backend 예외 1종)을 자동 회귀 검증. 악성·경계 계층 포함: 소유 증명된 누수 잔재만 prune, 사용자 수정본(해시 불일치)·커스텀 파일(매니페스트 밖) 보존, 손상 매니페스트에서 무삭제 ⑧ **Codex 적대적 리뷰 R1 2건 수용** — (high) prune 기록이 순수 java 실행에만 걸려 rust/unity·java+rust 혼합 재설치가 수렴 안 하던 것 → 소유자 없는 조합(java·rust·unity ⊆)으로 일반화(`is_leakscope_only_selected`), ts·dream·health 혼합 시엔 그쪽 소유 가능성 때문에 기록 안 함 유지 / (medium) 짝 docs(docs/skills·docs/agents)가 복사만 되고 추적이 없어 자산 prune 후 스테일 문서로 영구 잔존 → 매니페스트에 `docs` kind 신설(rel은 docs/ 기준·해시 소유 증명), 설치 시 docs 복사 전수 기록 + 제외 기록 시 짝 docs 동반 기록 + prune이 docs 루트 지원. 업그레이드 E2E 3건 추가(수리 전 rust 잔재 수렴·java+rust 혼합 수렴+rust 소유 n8n 과잉 prune 방지·docs 동반 정리+커스텀 docs 보존) ⑨ **Codex R2 반영** — (high, 수용) 제외 스킬 prune이 SKILL.md만 큐잉해 이번에 도입한 references/ 부속 파일이 영구 잔존 → `record_excluded_skill`이 스킬 폴더 전체 파일을 큐잉(삭제는 여전히 파일별 해시 증명), rust 업그레이드 테스트에 references·빈 디렉토리 소멸 단언 추가 / (medium, 부분 수용) 공용 docs(VERIFICATION_TEMPLATE·docs/hooks)도 매니페스트 docs kind에 기록해 소유 증명 확보 — util 다운그레이드 시 실제 삭제 경로는 기존 동작 범위라 후속 과제로 명시 ⑩ **Codex R3 반영(수용)** — docs 매니페스트 이전 설치는 매니페스트에 docs 섹션이 없어 짝 docs를 영원히 정리 못 함 → prune에 **docs kind 한정 소스 동일성 폴백**(레포 원본과 바이트 동일 = 미수정 관리 사본일 때만 삭제, skills/CLAUDE.md cmp 증명과 동일 패턴) 추가, 설치 스크립트가 sourceDir 전달. 구버전 매니페스트 업그레이드 E2E 추가(미수정 docs 수렴·사용자 docs 보존). 최종 12/12 E2E + 유닛 4스위트 통과 |

| 2026-08-26 | **프론트 도메인 리팩터링 자산 정비 — 실무 프로젝트 2종(Next 16 Turborepo 모노레포 / Vite+React 18 레거시 SPA) export 준비**: ① **깨진 스킬 참조 수리** — `frontend-developer`(12건)·`frontend-architect`(2건)·`python-backend-developer`(6건)·`skill-tester`(1건)가 06-11 개편에서 삭제된 스킬(react-core·typescript·sass·accessibility 등)을 그대로 가리키고 있어 export 시 그대로 따라가던 문제. 복원 대신 현행 스킬로 재매핑(TS 4/5·MUI 5/9·SEO 3종은 package.json 기준 분기표)하고 "미설치 스킬은 Glob 확인 후 건너뛰기" 규칙 추가. ② **신규 스킬 7종(213→220)** — 도메인 리팩터링 3종 `architecture/frontend-domain-structure`(FSD 2.1 정본·경량 대안·App Router 공존·경계 역추출)·`module-boundaries`(dependency-cruiser 18·boundaries v4.2.2/7.2 ESLint 8·9 분기·baseline 점진 도입)·`incremental-refactoring`(Strangler Fig·ts-morph 28/jscodeshift 17 codemod·TS7 API 부재 대응·안전망) + 스택 갭 4종 `frontend/mui-v5`(EOL 5.18.0 레거시 고정, v9와 양방향 참조)·`ag-grid`(v33 모듈 등록·Theming API·Community/Enterprise 경계)·`recoil-to-zustand-migration`(2025-01-01 아카이브·React 19 비호환 근거·Jotai 대응표·Loadable 함정)·`tanstack-query-v4-to-v5-migration`(breaking change 전수·`@tanstack/query-codemods` 미존재 정정). 전 스킬 skill-tester content test **25/25 PASS** — APPROVED 4, 마이그레이션·워크플로우 3종은 실사용 필수 카테고리라 PENDING_TEST 유지. 조사 중 적발한 기존 스킬 오류 2건 정정: `bundling-compiler`의 "vanilla-extract Turbopack 미지원"(현행은 Next 16+ experimental 지원), `tanstack-query`의 `prefetchQuery` 계열이 v5.102.0에서 `@deprecated`(→`queryClient.query()`, fact-checker 5소스 VERIFIED). ③ **신규 에이전트 `domain/frontend-domain-refactorer`(63→64)** — codebase-domain-analyst(진단)와 frontend-developer(구현) 사이의 *실행 계획* 갭. import 그래프·git co-change·용어 클러스터 3신호 교차로 경계 역추출 → 리프부터 배치 설계 → ts-morph codemod·경계 규칙·검증 게이트 산출, 소스 직접 수정 없음. 기술 클레임 5/5 VERIFIED. ④ **export 파이프라인** — `--legacy` 프로파일(tdd-guard 제외 + `typescript-quality --changed-only`) 신설: 소스 4,000개·테스트 31개·tsc 77초인 레거시 SPA에 일반 dev 프로파일을 깔면 모든 편집이 차단되고 매 저장이 타임아웃 나던 문제. gen-settings·install-cleanup(설정 보존 경로 배선 재작성 포함)·project-install 3곳 배선. SEO·GEO 스킬 포함 여부 질문(n이면 frontend 20종+writing 4종 제외), dream 전용 frontend 18종을 일반 프론트 템플릿에서 항상 제외, **`.claude/commands/` 10종이 export에서 통째로 빠져 있던 것** 추가(매니페스트·cleanup 추적 포함). ⑤ **Codex 적대적 리뷰 3라운드 전부 수용(7건)** — R1: `--changed-only`가 편집 파일만 보면 공유 타입 변경으로 깨진 *소비자 파일* 회귀를 놓침 → 베이스라인(직전 통과 시점 에러 집합) 차집합으로 파일 불문 새 에러 차단, 차단 시 베이스라인 미갱신, 키에서 줄 번호 제외 / settings 보존 재설치 시 `--changed-only` 미부착 → cleanup 배선 재작성(멱등·역방향 포함). R2: 첫 실행 베이스라인 공백 → `--seed --project`로 설치 시 선생성 / 타임아웃 fail-open → 1회 경고·연속 2회 차단 / commands 매니페스트 미추적 → 옵션 OFF·소스 폐기분을 소유 증명(해시 일치) 시 삭제. R3: 진단 없는 tsc 비정상 종료(바이너리 누락 등)를 통과로 처리 → 도구 장애로 분류해 동일 에스컬레이션 / 모노레포 시드 미제공 → 깊이 2~3 패키지 tsconfig 자동 탐색·각각 시드. 테스트: typescript-quality 4→49건, install-cleanup 146→170건, manifest 27→37건, gen-settings 46→58건 전부 통과 + E2E 3종(nextjs+legacy+SEO n / util 다운그레이드 수렴 / 모노레포 시드). ⑥ **사후 재검증(목적 = 리팩터링 워크플로우 체인 진단→계획→실행→검증→회귀)** — `frontend/vanilla-extract`는 대상 프로젝트가 devDependency만 두고 실제 `.css.ts` 0개인 죽은 의존성으로 확인돼 **삭제**(package.json만 보고 만든 판단 오류 — 사용량 실측 선행 원칙을 memory에 기록. 나머지는 실측 근거 있음: Query v4 976·Recoil 346·ag-grid 64·MUI 51 파일). 체인 결함 4건 수정: `build-error-resolver`가 프론트 템플릿 제외 목록에 있어 tsc/Vite 에러 대응 에이전트가 export되지 않던 것(제외 해제), `codebase-domain-analyst`가 백엔드 신호(Entity/Repository)만 알아 React 코드베이스를 진단 못 하던 것(프론트 layer-first/domain-first 신호표 + refactorer 인계 규칙 추가), `pr-reviewer`에 구조 이동 PR 관점(`git diff -M` 리네임 분리·이동 외 변경 혼입 차단·import 재작성·경계 위반 수 감소 확인) 추가, `rules/typescript.md`에 전환 중 프로젝트의 상태 라이브러리 공존 규칙 추가. `frontend-domain-refactorer`는 agent-creator를 거치지 않고 작성된 점을 **agent-creator 사후 리뷰**로 보완 — "별도 유지 정당·소폭 수정" 판정 8건 전부 반영(Bash 읽기 전용 명문화로 `git mv`·`sed -i` 우회 차단, `npx --no-install`로 자동 설치 모순 해소, 기존 설정 `.proposed` 산출, co-change 스크립트를 폴더 쌍 집계로 교체·실동작 확인). 리팩터링 경로 스킬 6종 **freshness 재검증**(128~152일 경과): `code-convention` ESLint 10(eslintrc 완전 제거·v9 EOL 08-06)·Biome 2.5(`organizeImports`→`assist`·type-aware) 반영, `testing`에 RTL 16 `@testing-library/dom` peerDep 추가, `e2e-testing` Playwright 1.62, `typescript-v4`에 레거시 배너(TS 7.0 GA) + v5 역참조, `ddd`·`state-management`는 UP_TO_DATE. ⑦ **doctor 지표 재현 점검(설치본 기준)** — 스킬 목록 예산·에이전트 description·rules 상시 로드 토큰을 실측해 노이즈 4건 제거: `DREAM_META_SKILLS`의 폴더명 오타(`dream-interpretation-ab-testing-prompts`≠실제 `dream-app-ab-testing-prompts`)로 꿈 앱 meta 3종+architecture 1종이 프론트 템플릿에 누출되던 것 차단, n8n 5종을 react-spa·nextjs에서 제외, SEO n 시 `seo-auditor`·`content-quality-reviewer`·`site-migration-seo`도 제외, **"작성 도구 포함?" 옵션(기본 n)** 신설로 작성 규칙 5종·작성 에이전트 3종·`agents/CLAUDE.md`·`skills/CLAUDE.md`를 옵트인화. 옵션 y→n 재설치가 수렴하도록 `scripts/prune-option-excluded.js` 신설(이번 템플릿 범위에서 옵션으로 빠진 파일만 매니페스트 소유 증명 하에 삭제 — 다른 템플릿 자산은 불변, 19건 테스트) + cleanup에 `--keep-authoring`. `settings.json`의 `defaultMode`가 최상위에 있어 **무효**였던 것(08-10 doctor 지적, 공식 문서 `permissions.defaultMode` 재확인)을 gen-settings·레포 settings 양쪽 수정. 결과(nextjs·SEO n·작성 n): 스킬 66→**55종**(목록 4.5k→3.5k tok), 에이전트 34→**30종**(4.5k→3.8k), rules 상시 6.5k→**2.2k tok**. ⑧ **Codex 적대적 리뷰 2차 사이클(3라운드, 6건 전부 수용)** — R1: 작성 규칙 삭제가 이름만으로 이뤄져 프로젝트 자체 규칙을 지울 수 있음 → 매니페스트에 rules 기록·해시 증명(구버전 설치는 소스 동일성 폴백) / settings 보존 재설치가 최상위 `defaultMode`를 안 옮김 → cleanup에서 `permissions.defaultMode`로 이관 / 루트 tsconfig가 있으면 패키지 시드 누락 → 루트+중첩 전부 시드. R2: 베이스라인이 집합이라 같은 파일·같은 메시지 에러가 하나 더 생겨도 통과 → 키별 개수(multiset) 차집합. R3: 베이스라인이 OS tmp라 재부팅 후 첫 저장 fail-open → `~/.claude/typescript-quality/` 영속화 / `npx --yes`가 레지스트리에서 임의 버전 실행 → `--no-install` 로컬 컴파일러만, 없으면 도구 장애로 차단·안내. 테스트: typescript-quality 58건·install-cleanup 185건·manifest 43건·prune 19건·gen-settings 59건 전부 통과. ⑨ **SEO·GEO 자산 점검(커머스 CSR SPA·분리 모바일 호스트 관점)** — 관련 스킬 24종이 전부 83~86일 경과라 lf 실무에 직결되는 12종을 freshness-auditor 2병렬로 재검증: UP_TO_DATE 3(search-console·structured-data-validation·schema-org), NEEDS_UPDATE 9 전부 반영. **갭 2건 메움**: 분리 모바일 URL(m-dot)이 `mobile-seo-pwa`에 한 줄뿐이라 방향을 반대로 넣을 위험 → 1-4절 신설(데스크톱=canonical 자기참조+`rel=alternate media`, 모바일=canonical→데스크톱, Google 공식 원문) + `url-canonicalization-redirects` 결정 트리 행 / 네이버 **AI 브리핑**이 naver·geo 어디에도 없음 → 네이버 공식 보도자료로 월 3,000만·쿼리 20% 확인해 절 신설(3rd-party "인용 70% UGC"·"선정 원칙 5가지"는 원문 부재로 인용 금지 명시). **OUTDATED 정정**: Googlebot IP JSON 구경로 → `common-crawlers.json` 단일화, Cloudflare AI 크롤러 Search/Agent/Training·Bot Preference Sync(08-21) 절, Rendertron/동적 렌더링 비권장(2022 archive)을 seo-vite-spa·kakao 양쪽에 일치 서술, `vite-plugin-sitemap` 2025-05 이후 무갱신 주의, 카카오 SDK 2.8.2, satori 0.33.4/@vercel/og 1.0.2(감사 에이전트 보고 0.29.0은 registry로 정정), ecommerce-seo Product 스키마에 `shippingDetails`·`hasMerchantReturnPolicy` 필드표·`@graph` 예시(3rd-party "returnPolicyCountry 필수화"는 공식 속성표상 recommended라 DISPUTED), geo에 Bytespider·llms.txt v2(2026-08-10)·Google AI 최적화 가이드(07-10)·Search Console 생성형 AI 제어(06-03) 반영, `Google-Extended`가 UA가 아닌데 grep 예시에 있던 자기모순 제거. 감사 에이전트가 3rd-party 근거로 보고한 "구경로 04-07부터 더미 데이터"·"Cloudflare 09-15 기본 차단"은 공식 소스 미확인이라 **미기재**. `seo-auditor`에 2.11 커머스 SPA·분리 모바일 URL 영역 + 그렙 패턴 4개 + 참조를 `[[위키링크]]`→경로로 정리. 설치 SEO 옵션을 y/**c**(커머스: 로컬비즈니스·다국어·YMYL·VPAT·사이트 이전·Indexing API·모니터링 8종 제외)/n 3택으로, 프레임워크 불일치 구현 스킬(react-spa에 `seo-nextjs` 등)은 어느 선택이든 제외 — E2E react-spa+c: SEO 14종+E-E-A-T. ⑩ **실프로젝트 사본 재설치 리허설** — 두 타깃의 `.claude/`·CLAUDE.md 사본에 실제 옵션으로 재설치(타깃 원본은 미접촉): 옵션 제외 58건·구버전 매니페스트(commands·rules 미기록)·`settings.local.json` 보존·비관리 `memory/` 보존 전부 정상, **단 이전 재설치가 남긴 빈 폴더(lfos 사본 42개·lf-ui 7개)가 매니페스트 비대상이라 안 지워지는 결함** 발견 → install-cleanup에 빈 디렉토리 정리(6단계) 추가, 재실행 멱등 확인(2회째 삭제 로그 0건). cleanup 테스트 194건 통과. 문서: 템플릿 3종·hooks·agents/skills 인덱스·CLAUDE.md 예제 2종(모노레포 경계·도메인 구조 참조 행) 동기화, `frontend/_test` 빈 잔재 제거, 스킬 수 표기 209/213 불일치 정정 | **이 날 종료 시점: APPROVED 203 / PENDING_TEST 17 / NEEDS_REVISION 0** |
| 2026-08-12 | **모델 세대 정렬(Opus 5·Sonnet 5) + PENDING_TEST 잔여 정리**: ① **기준 문서 갱신** — `agent-design.md` 모델 표를 현행 세대로(`opus`→`claude-opus-5`, `sonnet`→`claude-sonnet-5`; fable·haiku 유지). 구세대 ID 하드코딩 금지·캐시 최소 토큰이 세대순이 아니라는 주의(Opus 5/Fable 5 512, Opus 4.8/Sonnet 5/Sonnet 4.6 1,024, Opus 4.7 2,048, Opus 4.6/Haiku 4.5 4,096) 추가. ② **하드코딩 ID 일괄 정렬** — 스킬·에이전트 13종 42곳(`claude-opus-4-8`→`claude-opus-5` 등). `claude-haiku-4-5`는 현행이라 전부 유지. 정렬 과정에서 **실제 API 규약 위반 5종 적발**: `python-anthropic-sdk`에 5 계열에서 400이 나는 `temperature` 파라미터 행 잔존, 캐시 최소 토큰 표에서 **Opus 5·Fable 5의 512 행 자체가 누락**(최저값을 1,024로 오기), Opus 5의 thinking 기본 ON·`disabled`의 effort 제약 미기재(`max_tokens` truncation 위험), `thinking.display` 기본 `"omitted"` 미기재(스트리밍 UI 직접 영향), Bedrock/Vertex 예시가 은퇴한 `claude-3-5-sonnet-*` 사용. n8n은 노드가 Sampling Temperature를 그대로 전송해 5 계열 선택 시 400이 나는 함정을 신설. ③ **차단 버그 수정** — `agent-md-guard.js`의 허용 모델 목록에 5 계열이 없어 `model: claude-opus-5` 에이전트가 훅에 거부되던 문제 해소(테스트 18→20건 통과). ④ **`meta/claude-code-hook-authoring` APPROVED 전환** — 레포 훅 24종의 테스트 16스위트(391건) 전수 실행 통과 + 검증 도중 `test-fake-guard`가 실제로 작업을 차단해 스킬의 핵심 클레임(exit 2 차단, 사유의 stderr 전달)이 실사용 사례로 확인됨. 잔여 한계(신규 훅 작성 경로 미실시)는 명시 보존. ⑤ **`docs/skills/PENDING_TEST.md` 신설** — 잔여 14종 각각의 *졸업 조건*(무엇을 한 번 실행하면 APPROVED인지)과 필요 환경을 표로 정리, `docs/skills/README.md`에 연결. 이 레포에 uv·gradle·Unity·n8n·프론트 프로젝트가 없어 나머지 14종은 로컬 검증 불가임을 근거와 함께 기록. ⑥ **Codex 적대적 리뷰 2라운드 반영** — `codex-review.md`·`memory-sync.md`에 넣었던 `paths` 스코핑을 되돌렸다: 전자는 트리거로 고른 `.codex-review-done`이 *리뷰 완료 후* 생기는 마커라 논리가 역전됐고(훅은 `@` 임포트가 아닌 평문 경로로 안내하므로 자동 트리거 시 규칙이 컨텍스트에 없음), 후자는 핵심 트리거가 *커밋 의도*인데 `paths`로는 그걸 표현할 수 없어 코드 전용 커밋 경로에서 절차가 통째로 빠진다. 각 파일 상단에 재발 방지 주석 명시. `agent-md-guard` 허용 목록에서 문서화되지 않은 `claude-mythos-5` 제거(Project Glasswing 전용). 스코핑은 확장자로 정확히 트리거되는 언어 규칙 3종(java·rust·typescript)만 유지 — 절약폭은 ~6.1k→~3.3k est. 토큰으로 줄지만 정책 누락 위험을 없애는 쪽을 택했다. ⑦ **install-cleanup memory 이전 범위 축소(3라운드 지적)** — `memory/` 소유권을 훅 흔적으로 *추정*하는 구조라, memory 배선이 남은 채 폴더를 앱 데이터 용도로 재사용한 프로젝트에서 무관한 파일까지 전역으로 옮기고 레포에서 삭제하던 문제. 이제 메모리 아티팩트(`.md`)만 이전하고 그 외 파일은 경고 후 보존한다(파일이 남으면 `memory/` 폴더도 유지). TDD RED→GREEN으로 재현 테스트 추가, 테스트 118→123건 통과. *참고*: 기존 구현도 복사 후 unlink에 충돌 시 `.conflict` 보존이라 파괴가 아닌 이동이었으나, 런타임에 그 경로를 읽는 앱은 깨질 수 있어 수용했다. ⑧ **설치 매니페스트 도입(리뷰 잔존 이슈의 근본 해결, 사용자 (a)안 승인)** — 설치가 관리하는 파일 목록을 명시 기록해 소유권 *추측*을 제거. `project-install.sh`가 복사한 에이전트·스킬을 수집해 설치 마지막에 대상의 `.claude/.install-manifest.json`으로 저장(이전 매니페스트 중 대상에 아직 존재하는 항목과 합집합, `memoryManaged` 필드 포함). `install-cleanup.js`는 재설치 시 **매니페스트에 있는데 소스에 없는 파일 = 폐기된 관리 파일 → 자동 삭제**(폐기가 재설치로 수렴), 매니페스트에 없는 파일 = 커스텀 → 절대 삭제 안 함, `memoryManaged: false`면 훅 흔적이 있어도 memory/ 를 건드리지 않음(명시 선언 > 휴리스틱). 매니페스트가 없는 구버전 설치처는 첫 재설치 때 1회 확인(`잔재 삭제? [y/N]`) 후 `--delete-orphans`로 일괄 정리하고 이후부터는 매니페스트 자동. 손상된 매니페스트는 어떤 삭제도 수행하지 않음. TDD RED→GREEN(신규 테스트 8건, 총 131건 통과) + E2E 왕복 검증(1차 설치 → 매니페스트 생성 확인 → 폐기 에이전트·커스텀 파일 심고 재설치 → 폐기분만 삭제·커스텀 보존 확인). ⑨ **매니페스트 기능 자체에 대한 Codex 적대적 리뷰 3라운드 반영(전부 수용, 1건 반박)** — R1: 경로만 기록하면 *사용자가 수정해 쓰던* 관리 파일도 폐기 시 삭제되는 문제 → 설치 시점 콘텐츠 sha256을 `hashes`로 기록하고 **해시가 일치하는(=설치 후 손대지 않은) 파일만 폐기 삭제**, 이월 항목은 재해싱 금지(수정본의 '원본' 승격 방지). memory 이전이 실패해도 `memoryManaged:false`가 기록돼 다음 재설치가 재시도를 안 하는 split-brain → 이전 미완(레포 memory/+memory 훅 잔존) 시 true 유지. 작성기를 `scripts/write-install-manifest.js`로 분리해 단독 테스트 가능하게 함. R2: 폐지 훅(RETIRED_HOOKS)이 매니페스트와 무관하게 basename만으로 무조건 삭제되던 문제 → 훅도 매니페스트에 목록+해시로 기록하고 소유 증명 시에만 삭제. "좁은 템플릿 재설치 시 이전 설치분 미삭제" 지적은 **REJECT** — 템플릿은 가산적(frontend 설치 후 backend 추가 설치) 설계라 미선택≠폐기. R3: 옵션 OFF 훅도 동일 문제(옵션 끔은 통합 제거 의사지 동명 커스텀 파일 삭제 동의가 아님) → 모든 훅 삭제를 소유 증명(매니페스트 해시 일치 또는 레거시 1회 확인)으로 통일, 미증명 시 파일·배선 모두 보존(반쪽 상태 방지). `java.md` `paths` 스코프에 `pom.xml`·`*.gradle.kts` 누락 → 추가. 최종 테스트: install-cleanup 146건·write-install-manifest 27건·gen-settings 46건 전부 통과 + E2E 3종(해시 보호·훅 소유·재설치 멱등) | **이 날 종료 시점: APPROVED 199 / PENDING_TEST 14 / NEEDS_REVISION 0** |
| 2026-08-12 | **PENDING_TEST 전수 검증 완료 — 실제 결함 3건 적발·정정**: 전날 전수검사의 후속으로 PENDING_TEST 18종 + whisper 재수행을 스킬별 개별 검증(일괄 전환 금지 규칙 준수, 6그룹 병렬). **APPROVED 전환 3종** — `testing-junit5-spring-boot`(어노테이션·마이그레이션 체크리스트 중심이라 "테스트 작성 패턴" 카테고리로 재분류) · `pwa-offline-llm-fallback`·`pwa-push-notifications`(본문 대부분이 규격화된 Web Push/SW API 사용법이라 재분류). **PENDING_TEST 유지 9종** — 벤치마킹 3종·Vite 계열 4종·lighthouse-ci-setup·unity-cicd-codemagic. content test는 전부 PASS했으나 측정·빌드 산출물로만 최종 검증 가능한 *실사용 필수* 카테고리라 유지하고 사유를 각 verification.md에 명시. **검증 중 적발한 실제 결함 3건(전부 정정, NEEDS_REVISION 0)**: ① `python-uv-project-setup` — uv 0.12.0에서 `uv init`이 패키지형 기본 생성으로 바뀐 breaking change 미반영(구버전 동작은 `--no-package` 필요), `setup-uv@v3`→v9 커밋 해시 핀, Docker 베이스 이미지·다이제스트 핀 보강 ② `riper-workflow` — 출처로 인용한 GitHub 저장소가 **404로 실존하지 않음** → 실제 원조인 Cursor 포럼 게시글(2025-03-17)로 교체, 접근 불가 Reddit 링크 제거 ③ `ralph-loop` — 원조 귀속 오류(실제는 Geoffrey Huntley의 Ralph Wiggum 기법, ouroboros는 채택 사례) 정정, 근거 없는 인용구와 미확인 커맨드 비교 서술 삭제. 아울러 `whisper-api-integration`은 권장 모델 교체로 기존 test 근거가 무효화돼 신규 내용 기준 3/3 PASS로 재검증, `ralph-loop`의 "셀프 검증(skill-tester 미수행)" 자백형 기록을 진짜 테스트 기록으로 대체. 부수 정정: size-limit 12.1.0→13.0.3(Node 20 지원 종료 주의), dev-server 예시 Vite 7.x→8.x, JUnit 6 GA 날짜 2026-02→2025-09-30. **이 날 종료 시점: APPROVED 198 / PENDING_TEST 15 / NEEDS_REVISION 0** (다음 행 참조 — 08-12에 훅 스킬 1종이 졸업해 199/14가 된다) |
| 2026-08-11 | **스킬·에이전트 전수검사(병렬 11에이전트) + 중복 정리 + 긴급 스킬 7종 갱신**: 스킬 209종·에이전트 67종을 오늘 기준으로 전수 감사 — 스킬 중복·제거 대상 0건(레거시/모던 짝 8종은 의도적 병존 확인), 내용 UPDATE 필요 19건 식별. **에이전트 중복 4종 정리(67→63종)**: `meta/planner`(네이티브 Plan Mode 대체 + 매핑표 부패)·`meta/spec-writer`(`/create-plan` 커맨드와 3단계 구조 중복) 삭제, `meta/mvp-scope-planner` → `domain/product-planner` 단계 7.5(MVP Phase 절단)로 흡수, `validation/seo-content-writer-coach` → `content-quality-reviewer`에 초안 코칭·네이버 특화 점검(영역 10) 통합. **긴급 스킬 7종 병렬 갱신(전부 APPROVED 유지)**: `frontend/swiper` 11.x→14.1.0(브라우저 baseline·v11→v14 마이그레이션 노트) · `frontend/storybook` 8.x→10.5.x(ESM-only·Node 20.19+·패키지 이동 12행 대응표) · `frontend/whisper-api-integration` 권장 모델을 `gpt-transcribe`로 교체(6종 모델표·`keywords[]`/`languages[]` 병용 금지, WER 수치는 1차 소스 미확인이라 UNVERIFIED 표기) · `frontend/typescript-v5` 커버리지 5.x→5.x~7.x(6.0 기본값 변경표·7.0 Go 네이티브 제약·병행 설치) · `devops/github-actions`+`github-actions-visual-regression` checkout v5→v7 pwn-request 차단 기본값 반영(보안) · `game/mobile-user-acquisition` SKAN 4 채택률 오류 정정(2023-04 5% 수치를 시점 없이 인용 → 시점 병기 추이표로 교체, ATT opt-in·€150M 제재 출처도 정정). `frontend/mui-v5` → `mui-v9` 폴더 리네임(내용은 2026-06-19에 이미 v9 재작성, 경로만 미변경 상태였음). project-install.sh 템플릿 에이전트 목록·docs/agents 인덱스·docs/templates 9종 참조 동기화. **갭 분석 후 신규 스킬 4종 추가(209→213종)**: `meta/claude-code-hook-authoring`(훅 39개를 운영하면서 작성법 자산이 0이던 구멍 — 이벤트 카탈로그·exit 규약(차단 사유는 stderr)·matcher·배선 + 레포 훅 4종에서 추출한 실전 패턴·오탐 폐기 사례, PENDING_TEST) · `backend/spring-boot-2-to-3-migration`(레거시/모던 짝 스킬은 있는데 건너가는 경로만 없던 갭 — Phase 0~9 게이트·javax→jakarta·Security 5→6·Tomcat 10·OpenRewrite 자동화 경계·롤백 기준, PENDING_TEST) · `frontend/tanstack-query`(typescript.md 규칙이 강제하는데 전용 스킬이 없던 유일 사례 — queryKey 설계·staleTime/gcTime·낙관적 업데이트·App Router SSR, state-management와 양방향 참조로 역할 분리, APPROVED) · `backend/redis-redisson-4`(3.x 스킬이 예고해둔 후속 — 4.7.0 기준, 4.0/4.1/4.2/4.5/4.7 Breaking Change 전수, Java 8 유지·Apache 2.0 불변 확인, APPROVED). **UPDATE 백로그 12건 병렬 갱신**: Next.js 2종 16.3(`generateSitemaps`의 `id`가 Promise화되어 분할 사이트맵이 조용히 빈 결과를 내던 오류 등 4건 정정) · rsbuild 2.1.10(v2.0.0 출시일 연도 오기 2025→2026 정정) · turborepo 2.10.9(pnpm 11 비호환은 2.9.7에서 이미 해소 — 애초에 사실이 아니던 클레임 정정) · radix-ui 1.6.7 · motion 13.1(`@emotion/is-prop-valid` 자동 주입 제거 대응) · n8n 2종(`N8N_RUNNERS_ENABLED`가 v2.0+ deprecated인데 "true로 설정"으로 정반대 안내하던 오류 + 공식 문서 URL 404 경로 교체) · 모델 ID 드리프트 7종(구세대 ID 교체 + **캐시 최소 토큰 표 오류 정정** — Opus 4.8은 1,024인데 4,096으로 기재돼 있었음). **부수 정합성 3건**: github-actions 2종 REFERENCE.md를 SKILL.md 버전 표기와 동기화, storybook-visual-testing의 v10 제거 패키지(`addon-essentials`) 및 짝 스킬 충돌 4건 정정 |
| 2026-08-10 | **doctor 컨텍스트 최적화 — rules 5종 조건부 로딩 전환**: `/doctor` 감사 결과 rules 14종(~52k자, 매 세션 ~13.1k est. 토큰)이 전부 상시 로드되던 것을 `java`·`rust`·`typescript`·`codex-review`·`memory-sync` 5종에 `paths` frontmatter를 추가해 관련 파일 작업 시에만 로드되도록 전환(~6.1k est. 토큰/세션 절약). CLAUDE.md의 memory-sync `@` 임포트도 일반 경로 참조로 교체. 부가 발견: 프로젝트 스킬 209종이 스킬 목록 예산(~1%) 초과로 세션 목록에 미노출·전 기간 dispatch 0회(전수검사 착수 근거), 슬래시 커맨드 10종 중 7종 사용 0회(비용 미미로 유지) |
| 2026-08-07 | **설치 잔재 정리 인프라 — `scripts/install-cleanup.js` 신규**: 재설치 시 옵션을 N으로 바꿔도 이전 설치의 훅·배선·rules가 남아 계속 동작하던 문제 해소(특히 memory — settings.json 덮어쓰기 skip 시 N 선택이 전혀 반영되지 않았고, 구버전 전역→레포 symlink가 N 프로젝트에서도 레포 memory/에 메모리를 계속 생성). ① 옵션 OFF 시 해당 훅 파일·rules·플러그인·마커 삭제 + 기존 settings.json에서 배선만 수술적 제거(덮어쓰기 skip과 무관하게 반영, deliverable-guard `--no-readme`·staleness `--strict` 재배선 포함) ② 소스에서 폐지된 훅(memory-stop-guard 등 9종)·구세대 `.cjs` 훅 항상 정리(keep 옵션은 배선 `.cjs`→`.js` 재작성) ③ memory OFF 시 구버전 전역 symlink → 실제 디렉토리 마이그레이션 + 레포 memory/ 전역 이전(mtime 병합, 유실 없음) ④ 템플릿 다운그레이드(dev·TS → util 등) 시 dev·TS 훅 4+1종도 `--keep-dev`/`--keep-typescript` 미전달이면 정리 ⑤ 커스텀 훅·소스에 없는 스킬·에이전트는 삭제하지 않고 경고만. `project-install.sh` 훅 복사 직전 0.5단계로 배선. **codex 적대적 리뷰 3라운드 반영 안전장치**: 깨진 settings.json이면 훅 삭제·memory 이동 전면 스킵(참조 무결성) · memory 내용 충돌 시 지는 쪽 `.conflict` 보존(mtime만 믿고 폐기 금지) · memory/ 폴더는 관리 흔적(훅·배선·symlink) 있을 때만 이전(무관한 프로젝트 데이터 보호) · 마이그레이션을 훅 삭제보다 먼저 수행하고 실패 시 잔재 보존으로 재시도 가능(split-brain 방지). TDD(Red→Green)로 3계층(정상/악성 방어/경계) 테스트 114건 + 실레포 통합 스모크 통과, gen-settings 46/46 회귀 통과 |
| 2026-08-03 | **tdd-guard 버그 2건 수정**: ① 교차 확장자 미인식 — testPatterns가 소스와 같은 확장자만 검사해 `.ts` 소스 + `.test.tsx` 테스트 조합(React 훅 renderHook 표준 구조)을 "테스트 없음"으로 오탐 차단 → `.ts↔.tsx`·`.js↔.jsx` 양방향 탐색으로 확장. ② 차단 사유를 stdout에 출력해 모델에 미전달(exit 2 규약상 stderr만 전달, "No stderr output") → stderr로 변경 + 교차 확장자 대안 파일명 안내 추가. TDD(Red→Green)로 회귀 테스트 4건 추가, tdd-guard.test 9→13 전체 통과 |
| 2026-07-21 | **codex 리뷰를 실제 적대적 프롬프트로 정렬 + health 스킬 export 누출 수정**: ① `codex-review.md`·`codex-review-guard.js`가 강제하던 `codex review --uncommitted`는 codex *기본* 리뷰 기준이었음 — 플러그인 내장 적대적 프롬프트(`prompts/adversarial-review.md`, attack-surface: auth·IDOR·데이터 손실·멱등성·레이스·null/timeout·스키마 drift·관측성)를 쓰도록 `adversarial-review` 컴패니언 호출로 3라운드 전부 교체(설치 버전 무관 동적 경로 해석 + 미검출 시 기본 리뷰 폴백). codex 리뷰 attack-surface를 adversarial-testing.md 테스트 기준과 동일 축으로 정렬. codex 리뷰는 별도 레포 스킬 불필요 — 플러그인이 CLI·프롬프트·스킬(codex-cli-runtime 등) 자체 번들, 요건은 CLI 설치+플러그인 활성+로그인뿐. ② `project-install.sh` 스킬 선택에서 react-spa·nextjs 템플릿이 `health/*`(영양·식단 도메인 스킬 5종)를 제외 목록에 빠뜨려 함께 export되던 누출 수정 — health 도메인 스킬은 health 템플릿에서만 포함. codex-review-guard 3/3·gen-settings 46/46 회귀 통과 |
| 2026-07-20 | **적대적 테스트 강제 인프라 — dev 훅 2종 + 규칙 신설**: 테스트 코드가 정상 흐름만 담거나 테스트 통과용 가짜 구현을 넣는 것을 차단. ① `@.claude/rules/adversarial-testing.md` 신설 — 테스트 3계층(정상/악성 유저 방어/이상·경계) 표준 + 악성 유저 공격 체크리스트(인증·인가/인젝션/비즈니스 로직 오남용/파일·CSRF) + 테스트 통과용 하드코딩 return 금지(A안 hard block). ② `adversarial-test-guard.js` 신규(PostToolUse Write/Edit, dev 전용) — 테스트 케이스 2개 이상인데 적대적 커버리지(에러/보안/경계) 카테고리 2개 미만이면 차단, TDD RED 초기 1케이스·waiver 주석 예외. ③ `fake-impl-guard.js` 신규(PostToolUse Write/Edit, dev 전용) — 파라미터를 무시하고 테스트 기대 리터럴(문자열/숫자)을 그대로 return하는 가짜 구현 차단, boolean/null·상수 getter·waiver 제외로 오탐 최소화. ④ `qa-engineer` 에이전트 산출물 4→5종(적대적 악성 유저 E2E 시나리오 필수 추가). settings.json·gen-settings.js·project-install.sh(HOOKS_DEV_ONLY) 배선, 신규 훅 테스트 10+12건 + gen-settings 배선 검증 6건 전체 통과. **훅 22→24종(dev 2→4)·규칙 13→14종** |
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
