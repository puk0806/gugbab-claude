# PENDING_TEST 졸업 체크리스트

> 최종 갱신: 2026-09-11 (운세 앱 캐주얼 방향 정리로 정기결제 스킬 삭제 — 18종)

`PENDING_TEST`는 "**내용 검증은 끝났고 실사용 테스트만 남은**" 상태다. 사용은 가능하다.
`verification-policy.md` 기준으로 **실행 결과·빌드 산출물로만 최종 확인 가능한 스킬**이 여기에 남는다 — content test가 PASS여도 그것만으로는 전환하지 않는다.

이 문서는 각 스킬이 **무엇을 한 번 실행하면 APPROVED로 갈 수 있는지**를 적어 둔 것이다.
검증이 막연히 미뤄지는 것을 막는 게 목적이니, 해당 작업을 실제로 하게 되는 날 이 표를 먼저 보고 결과를 그 스킬의 `verification.md` 섹션 5에 남긴다.

## 왜 이 목록은 "지금 당장" 처리할 수 없나

전부 이 레포 밖의 실행 환경을 요구한다. 2026-08-12 기준 로컬 점검 결과:
`uv`·`gradle`·`mvn`·`unity`·`codemagic`·`lhci`·`n8n` 미설치, 이 레포에 `package.json` 없음(프론트엔드 빌드 대상 부재).
따라서 이 레포 안에서 실행 검증이 가능했던 `meta/claude-code-hook-authoring` 한 종만 2026-08-12에 졸업했다.

## 졸업 조건

| 스킬 | 무엇을 실행하면 되나 | 필요 환경 |
|------|---------------------|-----------|
| `backend/python-uv-project-setup` | 새 프로젝트에서 `uv init` → 생성 파일이 스킬 서술과 일치하는지, `uv sync`·GitHub Actions 예시가 그대로 도는지 확인 | uv 0.12+ |
| `backend/spring-boot-2-to-3-migration` | 실제 SB 2.5 프로젝트를 Phase 0~9 순서대로 3.x로 올려보고, 롤백 기준·OpenRewrite 경계 서술이 맞는지 확인 | Java 17+, Gradle/Maven, 레거시 SB 프로젝트 |
| `devops/n8n-self-hosting` | docker-compose로 현행 n8n을 올리고 큐 모드·환경변수 서술 검증 | Docker, n8n 2.33+ |
| `frontend/cra-to-vite-migration` | 실제 CRA 프로젝트를 Vite로 전환해 빌드 산출물 비교 | CRA 프로젝트 |
| `frontend/webpack-vite-config-mapping` | 위 전환 중 설정 매핑표대로 옮겨 빌드 성공 확인 | 위와 동일 |
| `frontend/vite-advanced-splitting` | manualChunks 적용 후 번들 분할 결과가 의도대로인지 확인 (Vite 8은 `rolldownOptions` 주의) | Vite 프로젝트 |
| `frontend/vite-pwa-service-worker` | 빌드 후 SW 등록·오프라인 동작 실기기 확인 | Vite + PWA |
| `frontend/build-perf-benchmarking` | hyperfine으로 실제 빌드 10회 측정, 보고서 형식대로 산출 | 프론트 프로젝트 (hyperfine은 설치됨) |
| `frontend/bundle-size-analysis` | visualizer·size-limit 실행 후 리포트 산출 | 프론트 프로젝트 |
| `frontend/dev-server-hmr-benchmarking` | dev 서버 cold start·HMR 지연 측정 | 프론트 프로젝트 |
| `frontend/lighthouse-ci-setup` | GitHub Actions에서 lhci 파이프라인이 baseline을 만들어내는지 확인 | @lhci/cli, CI |
| `game/unity-cicd-codemagic` | Codemagic에서 Unity 빌드 1회 성공 | Unity, Codemagic 계정 |
| `meta/ralph-loop` | 실제 반복 루프 작업에 적용해 안전장치(파괴적 작업 배제)가 작동하는지 확인 | — (세션 내 적용 가능) |
| `meta/riper-workflow` | 실제 작업에 5단계 워크플로우를 적용해 네이티브 Plan Mode와 충돌 없는지 확인 | — (세션 내 적용 가능) |
| `architecture/incremental-refactoring` | 실제 대규모 코드베이스에서 배치 1개(리프 도메인)를 ts-morph codemod로 이동 → 타입체크·빌드·경계 규칙 게이트 통과 → 머지까지 1사이클 | TS 프로젝트(소스 수백 개 이상), dependency-cruiser |
| `frontend/recoil-to-zustand-migration` | Recoil 사용 프로젝트에서 리프 atom 1개 이상을 공존 상태로 Zustand/Jotai로 옮기고 회귀 없음 확인 | Recoil 0.7 프로젝트 |
| `frontend/tanstack-query-v4-to-v5-migration` | v4 프로젝트를 v5로 올려 codemod(remove-overloads) 실행 + `isLoading`/`gcTime`/콜백 제거 수동 정리 후 devtools로 캐시 동작 확인 | `@tanstack/react-query` 4.x 프로젝트 |
| `backend/korean-lunar-calendar-manseryeok` | 구현한 양력→사주 변환을 KASI 공식 음양력 API·만세력 기준표와 대조(1954~61 표준시 이중 보정 구간·서머타임 연도 포함) 해 일치 확인 | KASI 오픈 API 키, 사주 계산 구현 코드 |

## 기록 방법

실행했다면 해당 `docs/skills/{카테고리}/{이름}/verification.md`에:

1. 섹션 5에 수행일·수행 방법·실제 결과(산출물/로그 요약)를 추가
2. 섹션 6 표의 "실사용 검증" 행과 최종 판정을 갱신
3. 섹션 8 변경 이력에 행 추가
4. frontmatter `status`를 `APPROVED`로 변경
5. 이 문서에서 해당 행을 제거

**주의**: 여러 스킬을 한 번에 `APPROVED`로 바꾸는 일괄 전환은 금지다(`verification-policy.md`). 스킬별로 개별 근거를 남긴다.

## 참고 — 졸업 사례

`meta/claude-code-hook-authoring` (2026-08-12): 레포에 배선된 훅 24종의 테스트 16스위트(391건)를 실행해 전부 통과했고, 검증 중 `test-fake-guard`가 실제로 작업을 차단하면서 스킬의 핵심 클레임(exit 2 차단 + 사유의 stderr 전달)이 실제 사례로 확인됐다. 잔여 한계("스킬만 보고 신규 훅을 처음부터 작성"하는 경로 미실시)는 정직하게 기록해 남겼다 — 실행 근거를 확보했다는 것과 모든 경로를 밟았다는 것은 다르며, 그 차이를 감추지 않는 것이 이 문서의 취지다.
