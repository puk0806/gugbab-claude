# frontend-domain-refactorer 검증 문서

**검증일:** 2026-08-26
**대상 파일:** `.claude/agents/domain/frontend-domain-refactorer.md`
**최종 판정:** APPROVED (기술 클레임 5/5 VERIFIED, fact-checker 교차 검증)

---

## 설계 배경

기존 `codebase-domain-analyst`는 *진단*(도메인 역추출·의존 위반 보고)에서 끝나고, `frontend-developer`는 *개별 파일 구현*만 담당한다.
layer-first(`types/·utils/·hooks/·api/` 아래 도메인이 반복) 코드베이스를 domain-first로 옮기려면 그 사이에
**"어떤 순서로, 어떤 단위로, 무엇으로 검증하며 옮기는가"** 를 정하는 단계가 필요한데 이를 담당하는 에이전트가 없었다.
실제 적용 대상은 Next.js App Router 모노레포(소스 ~860개)와 대규모 Vite SPA(소스 ~4,000개, 테스트 극소) 두 유형이다.

핵심 설계 결정:
- **소스를 직접 옮기지 않는다** — 계획서 + codemod 스크립트 + 경계 규칙만 산출. 수천 파일 이동을 에이전트가 자율 실행하면 되돌리기 어렵다
- **경계 규칙을 필수 산출물로** — 폴더만 옮기고 import 규칙을 안 켜면 몇 달 안에 원상 복귀한다
- **타입체크가 깨진 상태면 시작하지 않는다** — 안전망 없는 이동 금지 (대상 프로젝트 중 하나가 실제로 이 상태)

---

## 사용한 소스 및 신뢰도

| 소스 | URL | 신뢰도 |
|------|-----|--------|
| TypeScript 4.0 릴리즈 노트 (noEmit + incremental 허용) | https://devblogs.microsoft.com/typescript/announcing-typescript-4-0/ | High |
| TypeScript 이슈 #38440 | https://github.com/microsoft/TypeScript/issues/38440 | High |
| tsconfig `incremental` / `tsBuildInfoFile` 레퍼런스 | https://www.typescriptlang.org/tsconfig/incremental.html | High |
| dependency-cruiser CLI 문서 | https://github.com/sverweij/dependency-cruiser/blob/main/doc/cli.md | High |
| madge README | https://github.com/pahen/madge | High |
| Next.js Project Structure (private folder·route group) | https://nextjs.org/docs/app/getting-started/project-structure | High |
| Next.js Route Groups | https://nextjs.org/docs/app/api-reference/file-conventions/route-groups | High |
| git-log 공식 문서 | https://git-scm.com/docs/git-log | High |

---

## 클레임별 fact-checker 판정 결과

| 클레임 | 판정 | 수정 여부 |
|--------|------|-----------|
| `tsc --noEmit --incremental --tsBuildInfoFile` 조합은 TS 4.0+에서 유효 | VERIFIED | 없음 (에이전트 본문에는 버전 조건 없이 `--incremental` 만 언급 — 대상 프로젝트 최저 TS 4.7이라 문제 없음) |
| `npx depcruise <dir> --include-only '<regex>' --output-type json` 으로 JSON 그래프 출력 | VERIFIED | 없음 |
| `npx madge --circular --extensions ts,tsx <dir>` 로 순환 참조 탐지 | VERIFIED | 없음 |
| App Router `_folder` = private(라우팅 제외), `(group)` = URL 미포함 | VERIFIED | 없음 |
| `git log --name-only --format=<fmt> -- <path>` 로 co-change 집계 가능 | VERIFIED | 없음 — 커밋 구분자를 포맷에 명시해야 한다는 팁은 본문 awk 예시가 이미 `--format='---'` 구분자를 사용 |

---

## 참조 스킬 존재 확인

| 스킬 | 경로 존재 |
|------|:---:|
| architecture/frontend-domain-structure | ✅ (2026-08-26 신규) |
| architecture/module-boundaries | ✅ (2026-08-26 신규) |
| architecture/incremental-refactoring | ✅ (2026-08-26 신규) |
| architecture/ddd | ✅ |
| frontend/monorepo-turborepo | ✅ |
| frontend/typescript-v5 / typescript-v4 | ✅ |

---

## 구조 검증

- frontmatter: name(kebab-case)·description(`<example>` 3개)·tools(Read/Glob/Grep/Bash/Write — Edit 없음: 소스 수정 금지 의도)·model(opus: 배치 설계는 판단 집약)·maxTurns 40 (agent-design.md 오케스트레이터 아님이지만 그래프 수집·배치 설계가 긴 작업이라 상한 설정)
- agent-md-guard 통과 (Write 시 사전 검증)
- 실사용 테스트: 대상 프로젝트에 export 후 수행 예정 — APPROVED는 구조·클레임·설계 리뷰 기준이며, 실사용 결과는 추후 변경 이력에 추가한다

---

## agent-creator 설계 리뷰 (2026-08-26, 최초 작성이 agent-creator를 거치지 않아 사후 리뷰)

| 항목 | 판정 | 반영 |
|------|------|------|
| agent-design.md 위반 | description 6줄·볼드(경미), maxTurns 40 근거 주석 없음(경미) | description 2줄 평문으로 압축, frontmatter에 근거 주석 추가 |
| codebase-domain-analyst와 중복 | 단계 1~3(진단)은 높음, 4~6(배치·codemod·규칙)은 없음 → **별도 유지 정당** | 양쪽에 인계 규칙 추가: refactorer는 기존 진단 보고서가 있으면 단계 1~3 대체, analyst는 실행 계획 목적이면 refactorer로 인계 |
| 모델 opus | 타당 (3신호 교차 판정·배치 절단은 오판 비용이 큼, 저빈도) | 유지 |
| 도구 | Edit 제외만으로는 "소스 수정 금지"가 강제되지 않음 — Bash로 `git mv`·`sed -i`·codemod 실행 가능. Write가 기존 설정 파일을 덮어쓸 수 있음 | "Bash 읽기 전용" 명문화, 기존 설정은 `.proposed` 산출, 스크립트 위치는 `docs/domain/refactor/` 기본 + 사용자 확인 |
| 절차 모호·모순 | `npx`가 자동 설치라 "승인 없이 설치 금지"와 모순 / `src` 하드코딩 vs 모노레포 앱 선택 순서 / tsc 타임아웃 미대응 / co-change awk의 빈 키·부분 문자열 오탐·쌍 집계 아님 / "import 재작성 예상 건수" 산출법 없음 | `npx --no-install` + 존재 확인, `$ROOT` 변수화·모노레포는 단계 1 전 질문, 타임아웃 시 보수적 게이트·미측정 표기, co-change를 3단계 폴더 키·폴더 쌍 집계 node 스크립트로 교체(레포 git log로 동작 확인), 예상 건수 = fan-in 합 명시 |
| 총평 | **소폭 수정 권장** (재작성 불필요) | 8건 전부 반영 |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-08-26 | 최초 작성. fact-checker 5/5 VERIFIED |
| 2026-08-26 | agent-creator 사후 설계 리뷰 8건 반영 (Bash 읽기 전용·npx --no-install·co-change 스크립트 교체·인계 규칙 등) |
