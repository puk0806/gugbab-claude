---
name: full-audit-2026-08-11
description: "2026-08-11 스킬 209종·에이전트 67종 전수검사 결과 — 에이전트 4종 정리(67→63), 긴급 스킬 7종 갱신, UPDATE 백로그 12건과 프로젝트 전용 자산 보존 결정"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0b16af4b-c86a-4b1f-87bd-2a134a790482
  modified: 2026-08-12T00:14:58.959Z
---

2026-08-11 병렬 11에이전트로 스킬 209종 + 에이전트 67종 전수 감사 후 정리·갱신 수행. [[doctor-context-optimization]]의 후속 단계.

## 확정된 판단 기준

- **스킬은 제거 대상 0건** — 레거시/모던 짝(aws-sdk-v1/v2, spring-security-5/6, redisson-legacy/modern, springfox/springdoc, typescript-v4/v5, ehcache-2, xss-lucy)은 사용자 실운영 레거시 스택 대응용 *의도적 병존*이므로 낡아 보여도 유지한다. n8n 5종·SEO 계열도 스코프가 상호 참조로 분리돼 중복 아님
- **프로젝트 전용 자산(스킬 ~70·에이전트 21)은 전부 보존 결정** — 세션 목록에 미노출이라 컨텍스트 비용 0이고, 꿈 앱·식단 앱·중계 서버 프로젝트가 워크스페이스에 실존. 삭제 실익은 유지보수 부담뿐

## 정리된 에이전트 4종 (67→63)

| 대상 | 처리 |
|------|------|
| meta/planner | 삭제 — 네이티브 Plan Mode가 대체, 본문 매핑표가 16종 시절 스냅샷으로 부패 |
| meta/spec-writer | 삭제 — `/create-plan` 커맨드와 Requirements→Design→Tasks 구조 완전 중복 |
| meta/mvp-scope-planner | product-planner 단계 7.5(MVP Phase 절단)로 흡수 후 삭제 |
| validation/seo-content-writer-coach | content-quality-reviewer 영역 10(네이버·카카오 특화)로 통합 후 삭제 |

## 갱신 완료 7종 + 남은 UPDATE 백로그 12건

완료(전부 APPROVED 유지, 검증일 2026-08-11): swiper 14.1.0 · storybook 10.5.x · whisper(gpt-transcribe) · typescript-v5(6.0/7.0) · github-actions 2종(checkout v7 보안) · mobile-user-acquisition(SKAN 통계 정정)

**UPDATE 백로그 12건 — 2026-08-11 같은 날 전부 완료.** 갱신 과정에서 *단순 버전 노후가 아니라 틀린 서술*이 다수 드러남: turborepo pnpm11 비호환은 2.9.7에서 이미 해소돼 이전 검증 시점부터 사실이 아니었고, n8n `N8N_RUNNERS_ENABLED`는 deprecated인데 "true 설정"으로 정반대 안내, seo-nextjs `generateSitemaps`는 `id`가 Promise화돼 분할 사이트맵이 조용히 빈 결과, 모델 캐시 최소 토큰 표는 Opus 4.8을 4,096(실제 1,024)으로 기재, rsbuild 출시일은 GitHub 상대 시각을 절대 연도로 옮겨 적어 1년 오기. → **교훈: 검증일이 최신이어도 클레임이 참인지는 별개다. 재감사 시 "버전 숫자"보다 "동작 서술"을 우선 대조할 것.**

**부수 후속 과제 — 완료**: github-actions 2종 REFERENCE.md 동기화 · storybook-visual-testing addon-essentials 및 짝 스킬 충돌 4건 정정 · Redisson 4.x 스킬 신설.

## 신규 스킬 4종 (209→213)

갭 판정 기준은 "규칙·실운영이 요구하는데 자산이 없는 것"이었다. Kafka·K8s·Terraform·GraphQL은 스킬이 없어도 사용자 스택과 무관해 제외했고, Tailwind는 MUI+SCSS 스택이라 *의도적 부재*로 판단해 보류(사용자 확인 대기).

| 스킬 | 갭 근거 | status |
|------|---------|--------|
| meta/claude-code-hook-authoring | 훅 39개를 운영하면서 작성법 자산 0 — 레포 핵심 역량이 코드에만 존재 | PENDING_TEST |
| backend/spring-boot-2-to-3-migration | 레거시·모던 짝 스킬은 있는데 *건너가는 경로*만 없었음 | PENDING_TEST |
| frontend/tanstack-query | typescript.md가 강제하는 기술 중 유일하게 전용 스킬 부재 | APPROVED |
| backend/redis-redisson-4 | 3.x 스킬이 "4.x는 별도 스킬로 분리"라 예고해둠 | APPROVED |

## PENDING_TEST 전수 검증 (2026-08-12 완료)

18종 + whisper 재수행을 스킬별 개별 검증. **최종 APPROVED 198 / PENDING_TEST 15 / NEEDS_REVISION 0.**

- **APPROVED 전환 3종**: testing-junit5-spring-boot · pwa-offline-llm-fallback · pwa-push-notifications — 전부 *카테고리 재분류*가 근거다. "워크플로우/빌드 설정"으로 분류돼 있었지만 실제 내용이 규격화된 API 사용법·작성 패턴이라 답변 정확성만으로 검증 가능했다.
- **PENDING_TEST 유지 9종**: 벤치마킹 3·Vite 계열 4·lighthouse-ci-setup·unity-cicd-codemagic. content test는 전부 PASS — 유지 사유는 "테스트 실패"가 아니라 *측정·빌드 산출물로만 최종 검증 가능*이라는 카테고리 판정이다. verification.md에 사유 명시.
- **적발한 실제 결함 3건 (전부 정정)**: python-uv(uv 0.12 `uv init` breaking change 미반영) · **riper-workflow(출처 GitHub 저장소가 404로 실존하지 않음)** · ralph-loop(원조 귀속 오류 + 근거 없는 인용구·미확인 커맨드 비교).

**교훈 2: status가 PENDING_TEST라고 "검증만 안 된 멀쩡한 스킬"이 아니다.** 18종 중 3종에서 실제 오류가 나왔고, 그중 2종은 *출처 자체가 허위*였다. 특히 존재하지 않는 URL을 인용한 사례는 info-verification 규칙의 정면 위반이라, 재감사 시 **출처 URL 실접속 확인**을 필수 절차로 넣을 것. 정정 시 "그럴듯한 다른 URL로 바꿔치기" 금지 — 확인 안 되면 삭제하고 삭제 사유를 남긴다.

## 모델 세대 정렬 (2026-08-12 완료)

`agent-design.md` 모델 표를 현행 세대로 갱신: `opus`→`claude-opus-5`, `sonnet`→`claude-sonnet-5`. **`claude-haiku-4-5`와 `claude-fable-5`는 현행이라 유지** — 갱신 시 이 둘을 같이 바꾸지 않도록 주의. 하드코딩 ID는 스킬·에이전트 13종 42곳 정렬.

**확정 사실 (재조사 불필요)**: Fable 5 $10/$50 · Opus 5 $5/$25 · Sonnet 5 $3/$15 · Haiku 4.5 $1/$5. 5 계열에서 `temperature`/`top_p`/`top_k`와 `budget_tokens`는 400, prefill도 400. Opus 5는 thinking 기본 ON이고 `disabled`는 effort `high` 이하에서만. **캐시 최소 토큰은 세대순이 아님** — Opus 5·Fable 5 512 / Opus 4.8·Sonnet 5·Sonnet 4.6 1,024 / Opus 4.7 2,048 / Opus 4.6·Haiku 4.5 4,096.

**적발한 결함**: 모델 ID 교체만 한 게 아니라 API 규약 위반 5종이 나왔다 — `temperature` 행 잔존, 캐시 최소 토큰 표에서 512 행 자체 누락, Opus 5 thinking 기본값·`display: "omitted"` 미기재, Bedrock 예시의 은퇴 ID. 그리고 **`agent-md-guard.js` 허용 목록에 5 계열이 없어 신형 ID를 쓴 에이전트가 훅에 거부되던 차단 버그**를 수정(테스트 20건 통과).

**교훈 3: 기준 문서를 바꾸면 그것을 강제하는 훅도 같이 봐야 한다.** 규칙만 고치고 가드를 두면 규칙을 따른 산출물이 차단된다.

## 설치 매니페스트 도입 (2026-08-12 완료 — 사용자 (a)안 승인)

Codex 리뷰 잔존 이슈 2건(폐기 자산이 기존 설치처에 잔존 / `memory/` 소유권을 훅 흔적으로 추정)을 매니페스트로 근본 해결했다.

**구조 (Codex 3라운드 리뷰 반영 후 최종):**
- `project-install.sh`가 복사한 에이전트·스킬·**훅**을 수집 → 설치 마지막에 `scripts/write-install-manifest.js`가 대상의 **`.claude/.install-manifest.json`** 저장. 내용: `{version, updatedAt, memoryManaged, agents[], skills[], hooks[], hashes:{agents,skills,hooks}}` — **hashes는 설치 시점 콘텐츠 sha256**. 재설치 시 이전 매니페스트 중 대상에 아직 존재하는 항목과 **합집합**(선택 템플릿이 줄어도 기존 관리분 추적 유지 — 템플릿은 *가산적* 설계라 미선택≠폐기, Codex의 "축소 시 삭제" 권고는 REJECT). 이월 항목은 **재해싱 금지** — 로컬 수정본이 '설치 원본'으로 승격되면 폐기 시 삭제됨
- `install-cleanup.js` 판정: 매니페스트에 있는데 소스에 없음 + **해시 일치(=설치 후 손대지 않음)** = 폐기 → 자동 삭제 / 해시 불일치·미기록 = 로컬 수정 가능성 → 보존+경고 / 매니페스트에 없음 = 커스텀 → 절대 보존 / `memoryManaged: false` = 훅 흔적 있어도 memory/ 불가침 / 매니페스트 손상 = 어떤 삭제도 안 함
- **훅 삭제(폐지 RETIRED_HOOKS·옵션 OFF 모두)도 동일한 소유 증명 필요** — basename 일치만으로 삭제하면 동명의 프로젝트 자체 훅이 유실된다. 미증명 시 파일·배선 모두 보존(반쪽 상태 방지). "옵션 끔"은 통합 제거 의사지 파일 삭제 동의가 아님
- `memoryManaged`는 옵션값이 기본이되, memory OFF인데 이전 미완(레포 memory/+memory 훅 잔존)이면 **true 유지** — false를 쓰면 다음 재설치가 선언을 믿고 재시도 안 하는 split-brain
- 구버전 설치처(매니페스트 없음): 첫 재설치 때 1회 확인(`잔재 삭제? [y/N]`) → y면 `--delete-orphans`가 소유 증명을 대신해 일괄 정리. 이후엔 매니페스트가 생겨 질문 안 나옴

**검증:** TDD RED→GREEN으로 install-cleanup 146건 + write-install-manifest 27건 통과, E2E 3종(해시 보호: 수정본 보존·원본만 삭제 / 훅 소유 증명 / 재설치 멱등).

**E2E 시 알아둘 것:** `project-install.sh`는 인자를 받지 않는다 — 대상 경로도 첫 프롬프트로 입력. 비대화 실행은 `printf '<경로>\n1\nn\n...' | bash project-install.sh`. macOS엔 `timeout` 명령이 없다.

이로써 이번에 폐기한 에이전트 4종은 각 프로젝트에서 다음 재설치 때(첫 회 y 응답 후) 자동 제거된다.

## PENDING_TEST 잔여 14종 — 졸업 조건 문서화

`docs/skills/PENDING_TEST.md` 신설(README에서 링크). 각 스킬이 *무엇을 한 번 실행하면 APPROVED인지*와 필요 환경을 표로 정리했다. 이 레포엔 uv·gradle·Unity·n8n·프론트 프로젝트가 없어 14종 모두 로컬 검증 불가 — 해당 작업을 실제로 하는 날 그 표를 먼저 보고 결과를 verification.md 섹션 5에 남기면 된다.

`meta/claude-code-hook-authoring`은 이 레포 안에서 검증 가능해 **APPROVED 전환**: 훅 24종 테스트 16스위트(391건) 전수 통과 + `test-fake-guard`가 실제로 작업을 차단하며 exit 2/stderr 규약이 실사용으로 확인됨. "스킬만 보고 신규 훅을 처음부터 작성"하는 경로는 미실시임을 정직하게 남겨뒀다 — 실행 근거 확보와 모든 경로 통과는 다르다.

**Why:** "안 쓰니까 삭제"가 아니라 *중복·부패·오류*만 제거하는 기준을 세움. 특히 planner처럼 내용이 낡아 오답을 유도하는 자산이 진짜 위험이고, 미사용 자산은 비용이 0이면 보존이 합리적.
**How to apply:** 다음 감사는 검증일 6개월 도달분(2026-10 Python 계열, 2026-12 Rust/Java 계열) 우선. 갱신 시 워크트리 서브에이전트 → Read/Write로 본 레포 병합(보호 파일이라 셸 복사 금지) 패턴이 잘 작동함.
