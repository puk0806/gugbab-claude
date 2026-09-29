# PENDING_TEST 졸업 체크리스트

> 최종 갱신: 2026-09-29 (09-28~29 실사용 실행 검증으로 9종 졸업 — 8종 남음)

`PENDING_TEST`는 "**내용 검증은 끝났고 실사용 테스트만 남은**" 상태다. 사용은 가능하다.
`verification-policy.md` 기준으로 **실행 결과·빌드 산출물로만 최종 확인 가능한 스킬**이 여기에 남는다 — content test가 PASS여도 그것만으로는 전환하지 않는다.

이 문서는 각 스킬이 **무엇을 한 번 실행하면 APPROVED로 갈 수 있는지**를 적어 둔 것이다.
검증이 막연히 미뤄지는 것을 막는 게 목적이니, 해당 작업을 실제로 하게 되는 날 이 표를 먼저 보고 결과를 그 스킬의 `verification.md` 섹션 5에 남긴다.

## 왜 이 목록은 "지금 당장" 처리할 수 없나

2026-09-28~29에 로컬 격리 폴더(세션 임시 디렉터리)에서 실행 가능한 것은 모두 실제로 돌렸다(Node 22·Vite 8·hyperfine·Docker·JDK 17 + Gradle Wrapper·Python venv + uv·Claude Code headless). 남은 8종은 각자 **로컬 샘플로는 채울 수 없는 조건**(CI 러너·모바일 실기기·외부 API 키·대규모 실코드베이스·유료 계정·실운영 인프라)이 남아 있다. 각 스킬 verification.md 섹션 5 "[2026-09-28] 실사용(실행) 검증" 블록에 **무엇을 이미 실행했고 무엇이 남았는지**가 기록돼 있다.

## 졸업 조건 (남은 것만)

| 스킬 | 이미 실행한 것 (09-28~29) | 남은 졸업 조건 | 필요 환경 |
|------|------------------------|---------------|-----------|
| `backend/python-uv-project-setup` | `uv init` 4모드·`add`·`sync`·`sync --locked` 실패 재현·GH Actions YAML 파싱 — 서술 100% 일치 | GitHub Actions 실제 러너 실행, Docker 빌드 | GitHub Actions, Docker |
| `backend/spring-boot-2-to-3-migration` | SB 2.5.15 샘플을 Phase 0~4(+9)로 3.5.16까지 이전·테스트 GREEN (Security 5.8 오버라이드 필요 사실 발견·정정) | Java 11 실환경, Phase 5 라이브러리 교체(Springfox·Sleuth·EhCache2·Redisson), Phase 7 WAR/Tomcat 10.1, Phase 8 카나리·롤백, MyBatis 경로 | 실제 레거시 SB 2.5 프로젝트 |
| `devops/n8n-self-hosting` | n8n 2.40.7 + Postgres + Redis 큐 모드 + worker + external runner 기동, `$env` 차단 실측 (서술 오류 5건 정정) | HTTPS/Let's Encrypt, owner 계정, 외부 webhook 콜백, 백업·복원, 업그레이드 사이클 | 공개 도메인, 운영 서버 |
| `frontend/vite-pwa-service-worker` | 빌드 → SW·precache 생성, 헤드리스 Chromium으로 SW 등록·오프라인 재방문 확인 | 모바일 **실기기**(iOS Safari·Android Chrome) 설치·오프라인 동작 | 실기기, HTTPS 배포 |
| `frontend/lighthouse-ci-setup` | 로컬 `lhci autorun`(collect 3회→assert→upload filesystem) 전체 실행, 워크플로우 YAML 문법 검증 | GitHub Actions 러너에서 baseline 생성 | GitHub Actions |
| `game/unity-cicd-codemagic` | (실행 불가 — 도구·계정 없음) | Codemagic에서 Unity 빌드 1회 성공 | Unity, Codemagic 계정 |
| `architecture/incremental-refactoring` | 20파일 샘플에서 ts-morph 배치 이동 → tsc·dependency-cruiser 게이트 (예제 `move()` 경로 버그 발견·정정) | 소스 수백 개 이상 실코드베이스에서 배치 1개 이동 → 게이트 통과 → 머지 1사이클 | 대규모 TS 프로젝트 |
| `backend/korean-lunar-calendar-manseryeok` | 라이브러리 3종으로 경계·표준시·서머타임 케이스 실계산 (1954·1961 전환의 모호/부재 시각 구간 발견·보강) | KASI 공식 음양력 API 대조(T-1/T-2, 300건 규모) | KASI 오픈 API 키 |

## 기록 방법

실행했다면 해당 `docs/skills/{카테고리}/{이름}/verification.md`에:

1. 섹션 5에 수행일·수행 방법·실제 결과(산출물/로그 요약)를 추가
2. 섹션 6 표의 "실사용 검증" 행과 최종 판정을 갱신
3. 섹션 8 변경 이력에 행 추가
4. frontmatter `status`를 `APPROVED`로 변경
5. 이 문서에서 해당 행을 제거

**주의**: 여러 스킬을 한 번에 `APPROVED`로 바꾸는 일괄 전환은 금지다(`verification-policy.md`). 스킬별로 개별 근거를 남긴다.

## 참고 — 졸업 사례

**2026-09-28~29 실사용 실행 졸업 9종** — 모두 격리 폴더에 샘플 프로젝트를 만들어 실제로 실행했고, 실행에서만 드러나는 결함을 SKILL.md에 정정한 뒤 재실행으로 확인했다:

| 스킬 | 실행 내용 | 실행으로 드러나 정정한 것 |
|---|---|---|
| `frontend/vite-advanced-splitting` | Vite 8.3.1 `codeSplitting.groups` + `dropConsole` 빌드 | — (서술 일치) |
| `frontend/webpack-vite-config-mapping` | craco 샘플을 매핑표대로 Vite 8 전환, 빌드·dev 서버 | Vite 8 네이티브 `resolve.tsconfigPaths` 보강 |
| `frontend/tsup` | tsup 8.5.1 CJS/ESM/.d.ts + `outExtension` | TypeScript 7 + `dts: true` 크래시(egoist/tsup#1405) 주의·회피책 |
| `frontend/build-perf-benchmarking` | hyperfine cold 10회·warm 20회 | hyperfine 경고 문구 인용 오류 |
| `frontend/bundle-size-analysis` | visualizer 7.1.1·size-limit 14.1.0 (한도 초과 exit 1 확인) | — (서술 일치) |
| `frontend/dev-server-hmr-benchmarking` | dev 서버 cold/warm 기동, 실브라우저 HMR 측정 | `date +%s%3N` macOS 비호환, `exit 0` 누락, WS 클라이언트 연결 전제조건 누락 |
| `frontend/tanstack-query-v4-to-v5-migration` | v4.44 샘플 → codemod 3종 → 수동 정리 → v5.104, tsc·build·vitest | codemod 경로, 자동/수동 경계표 5항목, 런타임 함정 2건 |
| `frontend/recoil-to-zustand-migration` | Recoil 0.7.7 리프 atom → Zustand 5 공존 이전, 회귀 테스트 | — (테스트 격리 경고 실측 재현) |
| `meta/claude-code-hook-authoring` | 스킬만 보고 작성한 훅으로 headless 세션 9회 | `node <경로>` 배선 경로 오타는 exit 1(`Cannot find module`) |

`meta/claude-code-hook-authoring` (2026-08-12 최초 졸업): 레포에 배선된 훅 24종의 테스트 16스위트(391건)를 실행해 전부 통과했고, 검증 중 `test-fake-guard`가 실제로 작업을 차단하면서 스킬의 핵심 클레임(exit 2 차단 + 사유의 stderr 전달)이 실제 사례로 확인됐다. 잔여 한계("스킬만 보고 신규 훅을 처음부터 작성"하는 경로)는 2026-09-28 재졸업에서 해소됐다 — 실행 근거를 확보했다는 것과 모든 경로를 밟았다는 것은 다르며, 그 차이를 감추지 않는 것이 이 문서의 취지다.
