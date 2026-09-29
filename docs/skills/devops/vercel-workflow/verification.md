---
skill: vercel-workflow
category: devops
version: v1.1
date: 2026-09-28
status: APPROVED
---

# 스킬 검증 문서 — vercel-workflow

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `vercel-workflow` |
| 스킬 경로 | `.claude/skills/devops/vercel-workflow/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-09-17 · 09-25 구조 개편 · 09-28 재검증) |
| 검증자 | skill-creator |
| 스킬 버전 | v1.1 |
| 기준 버전 | `workflow` v4.8.9 (npm latest, Apache-2.0, 09-28 재확인 동일) / Workflows 과금·한도 문서 2026-06-16 갱신본(09-28 수치 변경 없음 확인) / Cron 문서 2026-07-15 갱신본(09-28 수치 변경 없음 확인) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (vercel.com/docs/workflows, /concepts, /pricing, /docs/cron-jobs/usage-and-pricing)
- [✅] 공식 SDK 문서 확인 (workflow-sdk.dev — getting-started/next, api-reference, foundations, how-it-works, worlds, cookbook 총 13개 페이지)
- [✅] 공식 GitHub / npm 2순위 소스 확인 (github.com/vercel/workflow, registry.npmjs.org/workflow/latest)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-09-17, npm latest 4.8.9, 개요 문서 last_updated 2026-09-04)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (sleep(Date) 루프 · 멱등 발송 · CAS 취소/재시작 · deploymentId 'latest' 런 회전)
- [✅] 코드 예시 작성 (워크플로 + 3개 스텝, Route Handler, 타임존 유틸, hook+Promise.race 확장)
- [✅] 흔한 실수 패턴 정리 (안티패턴 16종 표 + 체크리스트 8항)
- [✅] Hobby 이벤트 예산 계산식·런 회전 필요성 수치 도출
- [✅] Cron Jobs 비교 섹션 (Hobby 하루 1회·±59분 근거 확보)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | `/docs/workflows` (개요) | 4대 추상, `workflow` 패키지, 멀티리전 핀 고정(5.0.0-beta.33+, 4.x=iad1), 관측성·RBAC, GA 상태 |
| 조사 | WebFetch | `/docs/workflows/concepts` | `'use workflow'`/`'use step'` 디렉티브, sleep·hook 예제, skew protection(배포 핀 고정·롤백 주의) |
| 조사 | WebFetch | `/docs/workflows/pricing` | 3개 과금 지표, Hobby 50,000 events·1GB Written, 보존표, 런 한도표 전량, 레이트 리밋 |
| 조사 | WebFetch | `/docs/cron-jobs/usage-and-pricing` | Hobby 하루 1회·시간 정밀도 ±59분·프로젝트당 100개, Pro/Ent 분 단위 |
| 조사 | WebFetch | workflow-sdk.dev `/docs/getting-started/next` | `npm i workflow`, `withWorkflow` from `workflow/next`, `.well-known/workflow/` 생성물, middleware matcher 제외, `npx workflow web`/`inspect runs` |
| 조사 | WebFetch | `/docs/api-reference/workflow`, `/workflow/sleep` | 패키지 export 목록(sleep·fetch·createHook·defineHook·createWebhook·getWritable·FatalError·RetryableError), sleep 오버로드(duration 문자열·ms·Date) |
| 조사 | WebFetch | `/docs/api-reference/workflow-api`, `/workflow-api/start`, `/workflow-api/get-run` | start/resumeHook/resumeWebhook/getHookByToken/getRun, StartOptions.deploymentId, Run{runId·status·exists·returnValue·wakeUp·getReadable} |
| 조사 | WebFetch | `/docs/api-reference/workflow-globals` | 패치된 결정론 전역(Math.random·Date·crypto) / 금지 전역(Node core·setTimeout·전역 fetch·Buffer) |
| 조사 | WebFetch | `/docs/foundations/workflows-and-steps`, `/starting-workflows`, `/hooks`, `/versioning` | 재시도 기본 3회, pass-by-value, fire-and-forget vs returnValue, defineHook/resumeHook, 배포 핀 고정 + `deploymentId:'latest'` 체이닝 |
| 조사 | WebFetch | `/docs/how-it-works/event-sourcing` | 전체 이벤트 타입 목록, 스텝 3개·wait 2개·hook 가변 |
| 조사 | WebFetch | `/docs/observability`, `/worlds/local` | CLI inspect 서브커맨드·플래그, Local World(.workflow-data, 인메모리 큐, 단일 인스턴스, 프로덕션 부적합) |
| 조사 | WebFetch | `/cookbook/common-patterns/scheduling`, `/cookbook/advanced/child-workflows`, `/cookbook/agent-patterns/agent-cancellation` | sleep+hook Promise.race 스케줄링, v4에서 `start()`는 스텝에서만, `getRun(runId).cancel()` 하드 취소·WorkflowRunCancelledError |
| 조사 | WebFetch | github.com/vercel/workflow, registry.npmjs.org/workflow/latest | Apache-2.0, GA, 지원 프레임워크, **latest 4.8.9** |
| 조사 | WebFetch | github.com/web-push-libs/web-push | `setVapidDetails(subject, publicKey, privateKey)`, `sendNotification(sub, payload, options)`, 오류 객체 `statusCode` |
| 교차 검증 | WebSearch | 30개 클레임 (cancel API·sleepUntil 존재 여부·Hobby 이벤트 한도·크론 한도·CLI 커맨드·start 호출 제약·npm 버전·GA 시점·훅 resume 형태 등) | VERIFIED 26 / DISPUTED 1 / UNVERIFIED 3 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Vercel Workflows 개요 | https://vercel.com/docs/workflows | ⭐⭐⭐ High | 2026-09-04 | 공식 문서 (1순위) |
| Workflow Pricing and Limits | https://vercel.com/docs/workflows/pricing | ⭐⭐⭐ High | 2026-06-16 | 공식 과금·한도 표 |
| Workflow Concepts | https://vercel.com/docs/workflows/concepts | ⭐⭐⭐ High | 2026-07-14 | 디렉티브·sleep·hook·skew protection |
| Cron Jobs Usage & Pricing | https://vercel.com/docs/cron-jobs/usage-and-pricing | ⭐⭐⭐ High | 2026-07-15 | Hobby 하루 1회·±59분 근거 |
| Workflow SDK — Next.js 시작하기 | https://workflow-sdk.dev/docs/getting-started/next | ⭐⭐⭐ High | 2026 | 공식 SDK 문서 |
| Workflow SDK — `workflow` API 레퍼런스 | https://workflow-sdk.dev/docs/api-reference/workflow | ⭐⭐⭐ High | 2026 | export 목록 |
| Workflow SDK — `sleep` | https://workflow-sdk.dev/docs/api-reference/workflow/sleep | ⭐⭐⭐ High | 2026 | duration/Date 오버로드 |
| Workflow SDK — `workflow/api` | https://workflow-sdk.dev/docs/api-reference/workflow-api | ⭐⭐⭐ High | 2026 | start·getRun·resumeHook·getHookByToken |
| Workflow SDK — `start()` | https://workflow-sdk.dev/docs/api-reference/workflow-api/start | ⭐⭐⭐ High | 2026 | StartOptions.deploymentId |
| Workflow SDK — `getRun()` | https://workflow-sdk.dev/docs/api-reference/workflow-api/get-run | ⭐⭐⭐ High | 2026 | Run 속성·메서드 |
| Workflow SDK — Workflow Globals | https://workflow-sdk.dev/docs/api-reference/workflow-globals | ⭐⭐⭐ High | 2026 | 결정론 전역·금지 전역 |
| Workflow SDK — Workflows and Steps | https://workflow-sdk.dev/docs/foundations/workflows-and-steps | ⭐⭐⭐ High | 2026 | 재시도 3회·pass-by-value |
| Workflow SDK — Starting Workflows | https://workflow-sdk.dev/docs/foundations/starting-workflows | ⭐⭐⭐ High | 2026 | fire-and-forget·returnValue |
| Workflow SDK — Hooks & Webhooks | https://workflow-sdk.dev/docs/foundations/hooks | ⭐⭐⭐ High | 2026 | createHook/defineHook/resumeHook |
| Workflow SDK — Versioning | https://workflow-sdk.dev/docs/foundations/versioning | ⭐⭐⭐ High | 2026 | 배포 핀 고정·`deploymentId:'latest'` 체이닝 |
| Workflow SDK — Event Sourcing | https://workflow-sdk.dev/docs/how-it-works/event-sourcing | ⭐⭐⭐ High | 2026 | 이벤트 타입·개수 |
| Workflow SDK — Observability | https://workflow-sdk.dev/docs/observability | ⭐⭐⭐ High | 2026 | CLI inspect 커맨드·플래그 |
| Workflow SDK — Local World | https://workflow-sdk.dev/worlds/local | ⭐⭐⭐ High | 2026 | `.workflow-data/`, 인메모리 큐 한계 |
| Cookbook — Scheduling | https://workflow-sdk.dev/cookbook/common-patterns/scheduling | ⭐⭐⭐ High | 2026 | sleep+hook Promise.race |
| Cookbook — Child Workflows | https://workflow-sdk.dev/cookbook/advanced/child-workflows | ⭐⭐⭐ High | 2026 | v4 `start()`는 스텝에서만 |
| Cookbook — Agent Cancellation | https://workflow-sdk.dev/cookbook/agent-patterns/agent-cancellation | ⭐⭐⭐ High | 2026 | `getRun(runId).cancel()` |
| GitHub: vercel/workflow | https://github.com/vercel/workflow | ⭐⭐⭐ High | 2026 | Apache-2.0, GA (2순위) |
| npm registry: workflow | https://registry.npmjs.org/workflow/latest | ⭐⭐⭐ High | 2026-09-17 | latest 4.8.9 (3순위 교차 확인) |
| GitHub: web-push-libs/web-push | https://github.com/web-push-libs/web-push | ⭐⭐⭐ High | 2026 | 발송 스텝 예시 근거 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 교차 검증 클레임 판정

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | 패키지명은 `workflow`, npm latest **4.8.9**, Apache-2.0 | npm registry `/workflow/latest` + GitHub README + Vercel 개요(`npm i workflow`) | ✅ VERIFIED |
| 2 | `'use workflow'` / `'use step'` 두 디렉티브로 durable 함수를 만든다 | Vercel Concepts + SDK foundations/workflows-and-steps | ✅ VERIFIED |
| 3 | Next.js 통합은 `withWorkflow` (from `workflow/next`), 생성물은 `app/.well-known/workflow/`, middleware matcher에서 제외 필요 | SDK getting-started/next + GitHub README | ✅ VERIFIED |
| 4 | 트리거는 `start(workflow, args[], options)` (`workflow/api`), 즉시 반환 후 `run.runId` / `run.returnValue` | SDK starting-workflows + start 레퍼런스 + Vercel 개요의 region 예제 | ✅ VERIFIED |
| 5 | **`sleepUntil()`은 이 SDK에 존재하지 않는다.** 절대 시각 대기는 `sleep(Date)` 오버로드 | SDK sleep 레퍼런스(문자열·Date 예시) + Cookbook scheduling("docs reference only `sleep()`") + workflow 패키지 export 목록에 부재 | ⚠️ DISPUTED → 정정 반영 |
| 6 | `sleep()`은 기간 문자열(`'1d'`,`'30s'`)·밀리초 숫자·`Date`를 받는다 | SDK sleep 레퍼런스 + Cookbook scheduling | ✅ VERIFIED |
| 7 | 최대 `sleep` 지속시간·최대 런 지속시간 = **제한 없음**, 워크플로 리플레이 1회 상한 240초 | Workflow Pricing 런 한도표 | ✅ VERIFIED |
| 8 | 잠든 동안 컴퓨트를 소비하지 않는다(대기 중 함수 미점유) | Vercel Concepts(Sleep) + SDK sleep 레퍼런스 + Cookbook scheduling | ✅ VERIFIED |
| 9 | 런당 이벤트 25,000 / 스텝 10,000 / 페이로드 50MB / 엔티티 2GB / 초당 이벤트 200 | Workflow Pricing 런 한도표 | ✅ VERIFIED |
| 10 | 2,000 이벤트 또는 1GB 초과 시 리플레이가 느려지며 **자식 워크플로로 분할** 권장 | Workflow Pricing 표 하단 Note | ✅ VERIFIED |
| 11 | Hobby: **50,000 events/월** + Data Written 1GB 포함, Data Retained는 Hobby 미제공. 초과 단가 $0.02/1K events | Workflow Pricing 표 + 독립 검색 재확인 | ✅ VERIFIED |
| 12 | 보존: Hobby 1일 / Pro 7일 / Enterprise 30일 (런 완료 후) | Workflow Pricing Storage retention 표 | ✅ VERIFIED |
| 13 | 이벤트 타입 전체 목록과 개수 — 정상 스텝 3개, sleep(wait) 2개, hook = created + 수신n + disposed | SDK how-it-works/event-sourcing + Vercel Pricing(Events 절의 step 3개 예시) | ✅ VERIFIED |
| 14 | `getRun(runId)` → `.status` `.exists` `.returnValue` `.wakeUp()` `.getReadable()` `.cancel()` | SDK get-run 레퍼런스 + Cookbook agent-cancellation(`await getRun(runId).cancel()`) | ✅ VERIFIED |
| 15 | `cancel()`은 하드 종료 — cleanup 미실행, 대기자에게 `WorkflowRunCancelledError` | Cookbook agent-cancellation + get-run 레퍼런스(returnValue가 해당 오류 throw) | ✅ VERIFIED |
| 16 | 훅: `defineHook({schema})`/`createHook<T>()` → `.create({ token })`, 재개는 `resumeHook(token, payload)` 또는 `hook.resume(token, payload)`, `sleep`과 `Promise.race` 경합 가능 | SDK foundations/hooks + define-hook 레퍼런스 + Vercel Concepts(Hook 예제) + Cookbook scheduling | ✅ VERIFIED |
| 17 | 워크플로 샌드박스: `Math.random`·`Date`·`crypto.randomUUID`는 시드/논리시계로 **결정론 보장**, Node core 모듈·`setTimeout`·전역 `fetch`·`Buffer`는 **throw** | SDK api-reference/workflow-globals + foundations/workflows-and-steps | ✅ VERIFIED |
| 18 | 스텝 기본 재시도 최대 3회, 스텝 인자는 pass-by-value(mutation 미반영) | SDK foundations/workflows-and-steps | ✅ VERIFIED |
| 19 | 런은 시작 배포에 핀 고정되며, 재배포·롤백해도 옛 배포에서 계속 실행·재시도된다. 갈아타려면 취소 후 `deploymentId: 'latest'`로 재시작 | Vercel Concepts(Skew Protection) + SDK foundations/versioning | ✅ VERIFIED |
| 20 | **v4에서 `start()`는 워크플로 본문에서 직접 호출 불가** — `'use step'` 래퍼 안에서 호출해야 한다 | Cookbook advanced/child-workflows + 검색 교차 확인 | ✅ VERIFIED |
| 21 | 4.x 런은 항상 `iad1`에 저장되고, 멀티리전은 `workflow` 5.0.0-beta.33+ 필요 | Vercel 개요(Multi-region → Version and migration) | ✅ VERIFIED |
| 22 | Hobby 크론: 프로젝트당 100개, 최소 간격 **하루 1회**(더 잦은 표현식은 배포 실패), 정밀도 **시간 단위 ±59분** | Cron Jobs Usage & Pricing 표 + Hobby scheduling limits 본문 | ✅ VERIFIED |
| 23 | 로컬 개발은 프레임워크 dev 서버에서 **Local World** 자동 사용, 데이터는 JSON 파일(`.workflow-data/`, Next.js는 `.next/workflow-data/`), 인메모리 큐·단일 인스턴스·인증 없음 → 프로덕션 부적합 | SDK worlds/local + docs/observability | ✅ VERIFIED |
| 24 | 관찰 CLI: `npx workflow inspect runs` / `inspect run <id>` / `--web` `--url` `--json` `--backend` `--decrypt` `--env preview` | SDK docs/observability + getting-started/next | ✅ VERIFIED |
| 25 | Workflows는 2026-04-21 GA | Vercel changelog 검색(“Workflows is now Generally Available”) + GitHub README(GA 표기) | ✅ VERIFIED |
| 26 | Vercel은 Workflow에 **Fluid compute** 사용을 권장하며, 스텝 실행 시간은 Vercel Functions 한도를 따른다 | Workflow Pricing(Functions/Fluid 문단) + 런 한도표 | ✅ VERIFIED |
| 27 | `npx workflow web` / `npx workflow cancel <run_id>` / `npx workflow health` 커맨드 | 커뮤니티 요약·검색 결과에만 등장, 공식 CLI 레퍼런스 페이지(`/docs/api-reference/cli`)는 404 | ❌ UNVERIFIED → SKILL.md에 `> 주의: 미검증` 표기 + `npx workflow --help` 확인 안내 |
| 28 | `vercel dev`에서의 Workflow 동작 여부 | 공식 문서에 명시 없음(문서화된 경로는 프레임워크 dev 서버) | ❌ UNVERIFIED → SKILL.md에 미검증 명시 |
| 29 | `sleep` 만료 후 재개 지연(스케줄링 정확도) 상한 수치 | Workflow Pricing·sleep 문서 어디에도 수치 없음 | ❌ UNVERIFIED → SKILL.md §6에 "공식 수치 없음" 명시하고 초 단위 지연 전제 설계 권고 |
| 30 | web-push: `setVapidDetails(subject, publicKey, privateKey)`, `sendNotification(sub, payload, options)`, 오류 객체에 `statusCode` | web-push 공식 README | ✅ VERIFIED |

**집계: VERIFIED 26 / DISPUTED 1 / UNVERIFIED 3 (총 30개 클레임)**

> **DISPUTED 처리:** 작업 요청 단계의 전제였던 "`sleepUntil` 시그니처"는 공식 문서에 해당 API가 존재하지 않음을 확인했다.
> SKILL.md §2에서 `> 주의 (정정):` 블록으로 명시하고, 안티패턴 표 #4에 "존재하지 않는 API"로 기재했다.
> **UNVERIFIED 처리:** #27·#28·#29는 삭제하지 않고 SKILL.md 본문에 미검증임을 명시한 뒤 확인 방법(`npx workflow --help`)과
> 보수적 설계 지침(초 단위 지연 전제)을 함께 적었다.
>
> 과금·플랜 한도는 정책 변동이 잦으므로 SKILL.md에 문서 갱신일(2026-06-16 / 2026-07-15)을 함께 표기했다.
> `workflow` 4.8.9는 npm latest 기준이며 patch 버전은 수시 변동한다. 5.x는 beta 라인이다.

---

### 4-2. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (`workflow` 4.8.9, 과금 문서 2026-06-16, 크론 문서 2026-07-15)
- [✅] deprecated된 패턴을 권장하지 않음 (Edge 런타임 언급 배제, Node.js 런타임 + Fluid compute 권장으로 기술)
- [✅] 코드 예시가 실행 가능한 형태임 (워크플로/스텝/Route Handler/타임존 유틸 전체 import 포함)

### 4-3. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (문서 15개 URL + 검증일 2026-09-17 + 기준 버전)
- [✅] 핵심 개념 설명 포함 (§1 4대 추상·결정론 규칙·Next.js 통합)
- [✅] 코드 예시 포함 (§7-a 워크플로+스텝, §7-b Route Handler, §7-c 타임존 유틸, §7-d hook 확장)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (§6 Cron·외부 스케줄러 비교 + "쓰지 말아야 할 때")
- [✅] 흔한 실수 패턴 포함 (§8 안티패턴 16종 + §9 체크리스트)

### 4-4. 실용성
- [✅] 에이전트가 참조 시 실제 코드 작성에 도움 (스케줄러 전체가 복붙 가능한 완결 형태)
- [✅] 지나치게 이론적이지 않고 실용적 예시 포함 (이벤트 예산 계산식, 회전 주기 산출)
- [✅] 범용적으로 사용 가능 (특정 로컬 프로젝트·절대경로 비종속, `@/lib/db` 등 일반 alias만 사용)
- [✅] 악성 입력·경합 방어 반영 (슬롯 정규식·개수 상한, 인증/인가, 멱등 키, CAS 교체, 취소 순서)

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-17)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-09-17)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (해당 없음 — 3/3 PASS, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-17
**수행자**: skill-tester → general-purpose (도메인 특화 에이전트 미등록으로 대체, verification-policy 대체 규정에 따름)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션·줄 번호 인용 확인 및 anti-pattern 회피(=`sleepUntil()` 미사용, 취소 순서 준수) 확인

### 실제 수행 테스트

**Q1. 사용자 지정 절대 시각까지 대기 — `sleep(Date)` vs `sleepUntil()`**
- ✅ PASS
- 근거: SKILL.md §2 "sleep() — 시그니처·한도·과금"(118~135줄), §8 안티패턴 표 #4(563줄)
- 상세: `sleep(new Date(...))` 오버로드를 정확히 제시하고, `sleepUntil()`이 존재하지 않는 API임을 §2 정정 블록(124~125줄)과 안티패턴 #4를 모두 인용해 설명. 워크플로 본문 직접 호출 제약, 타임존 계산은 스텝에서 분리해야 하는 이유(§7-c)까지 정확히 연결.

**Q2. 알림 시각 변경 시 기존 런 취소·재시작과 중복 발송 방지**
- ✅ PASS
- 근거: SKILL.md §7-b "시각 변경 시 취소·재시작 Route Handler"(483~529줄), §8 안티패턴 #6·#7(565~566줄), §9 체크리스트
- 상세: "새 런 시작 → DB CAS 교체 → 옛 런 취소" 순서를 코드 줄 번호(511·519~526줄)까지 인용해 정확히 재현했고, 순서를 바꾸면 안 되는 이유(취소 먼저 하면 start 실패 시 스케줄러 소실)도 근거와 함께 설명. 멱등 키(`userId:slotAt`, `db.claimDelivery`)와 CAS(`expectGeneration`)를 중복 방지 안전장치로 정확히 식별.

**Q3. 무한 루프 런의 이벤트·스텝 한도, 회전 패턴, Hobby 예산 계산**
- ✅ PASS
- 근거: SKILL.md §4-1 한도표(199~212줄), §4-4 예산 계산(242~265줄), §7-a `MAX_ITERATIONS`/`rotateScheduler`(400~401·468~480줄)
- 상세: 하드 한도(25,000 이벤트/10,000 스텝)와 성능 권고선(2,000 이벤트)을 구분해서 설명하고, 6명×하루5회 시나리오 계산(8 이벤트/회 → 월 약 7,250 → 14.5%)을 SKILL.md 수치와 정확히 재현. 회전 필요성(250회≈50일 vs `MAX_ITERATIONS=150`)도 정확히 연결.
- 경미한 gap: 회전 오버헤드 "6명×6≈36"의 세부 도출 산식과 §7-d "+5 이벤트/회"의 이벤트 구성 내역이 SKILL.md 본문에 없어 재검산은 어려움(결과값 자체는 정합적). 차단 요인 아님 — 섹션 7에 선택 보강으로 기록.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: **실사용 검증이 필요 없는 스킬(content test로 충분)**로 판정. 근거 — 이 스킬은 devops 카테고리이지만 실질적으로는 Vercel Workflow SDK(`workflow` 패키지)의 API 사용 패턴(시그니처·호출 위치 제약·취소 순서·이벤트 계산식) 스킬이며, 검증 대상 클레임이 (a) 이미 공식 문서 30개 클레임 교차 검증(VERIFIED 26/DISPUTED 1/UNVERIFIED 3, §4-1 verification.md)을 거쳤고 (b) Hobby 이벤트 예산 계산은 산술식으로 재현 가능해 실제 배포 없이도 정확성 확인이 가능하다. "워크플로우 스킬(빌드/설정 변환이 실제로 작동하는지 확인 필요)" 카테고리는 n8n 워크플로우 정의처럼 *실행 결과가 산출물 그 자체*인 경우를 가리키는데, 본 스킬은 실행 결과물이 아니라 *코드 패턴·API 계약의 정확성*이 핵심이므로 "라이브러리/SDK 사용법 스킬" 쪽에 더 가깝다. 다만 `sleep` 재개 지연 실측치·Hobby 이벤트 한도 실제 소진 여부·CLI 커맨드 존재 여부(§7 개선 필요 사항 참고)는 문서만으로 확정할 수 없는 잔여 불확실성으로 남아 있으며, 실제 Vercel 프로젝트에 배포해 사용해본 뒤 수치를 갱신하는 것을 권장한다(차단 요인 아님).
- 최종 상태: **APPROVED**

---

### [2026-09-28] 재검증(2차) — 변경 없음

**수행일**: 2026-09-28
**수행 방법**: SKILL.md + REFERENCE.md 전체 Read → 핵심 클레임 3개를 `curl registry.npmjs.org` + WebSearch로 1차 소스 재대조 (ADD 항목: workflow SDK 4.8.x, `sleep(Date)`)

**클레임 대조 결과**:
1. `workflow` npm dist-tag `latest` — VERIFIED, 09-17 확인 시점과 동일하게 여전히 **4.8.9**(4.8.x 라인, ADD 요청과 일치). 5.x는 여전히 beta 라인
2. `sleep(Date)` 오버로드 및 `sleepUntil()` 부재 — VERIFIED, workflow-sdk.dev sleep 레퍼런스 재확인 결과 duration 문자열/ms/Date 오버로드 그대로이고 `sleepUntil`은 여전히 이 SDK에 없음(Mastra 등 타 엔진에만 존재 — 09-17 DISPUTED 정정 사항 그대로 유효)
3. Vercel Workflows Hobby 한도(50,000 events/월, Data Written 1GB, Data Retained 미제공) + Cron Jobs Hobby(하루 1회, ±59분 정밀도) — VERIFIED, 09-17 시점과 수치 동일

**보강(ADD)·축소**: 없음 — 3개 클레임 전부 VERIFIED·변경 없음

**실전 질문 재검증**:
- Q1. "`workflow` 4.8.9에서 `sleepUntil()`을 써도 되나?" → SKILL.md §2 근거로 PASS (여전히 존재하지 않는 API, `sleep(date)` 오버로드 사용)
- Q2. "Hobby로 6명×하루5회 스케줄러를 돌리면 이벤트 한도를 넘기나?" → SKILL.md §4-4 근거로 PASS (월 약 7,250/50,000 = 14.5%, 한도 변경 없음)

**재검증 최종 판정**: status **APPROVED 유지**

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ — 2026-09-28 재검증에서 workflow 4.8.9·sleep(Date)·Hobby 한도 3건 전부 VERIFIED, 변경 없음 |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-09-17 수행, 3/3 PASS) |
| **최종 판정** | **APPROVED** (유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 (2026-09-17 완료, 3/3 PASS) — 더 이상 차단 요인 아님
- [❌] CLI 레퍼런스 페이지를 찾지 못해 `workflow cancel` / `workflow health` / `workflow web` 커맨드가 미검증 상태 — 선택 보강(실사용 시 `npx workflow --help`로 확인), 차단 요인 아님
- [❌] `vercel dev` 환경에서의 동작이 공식 문서에 없음 — 선택 보강(실제 배포 후 확인), 차단 요인 아님
- [❌] `sleep` 만료 후 재개 지연(정확도) 실측 없음 — 선택 보강(프리뷰 배포에서 실측 후 §6에 수치 추가 권장), 차단 요인 아님
- [❌] 회전 오버헤드 산식("6명×6≈36")과 §7-d 훅 경합 "+5 이벤트/회" 세부 구성이 본문에 없어 재검산 어려움 — 선택 보강(2026-09-17 Q3 테스트에서 발견), 차단 요인 아님
- [❌] 과금·플랜 한도는 정책 변동 가능 — 선택 보강(재사용 시 Workflow Pricing 페이지 재확인 권장), 차단 요인 아님
- [❌] `workflow` 5.x(beta) 라인의 API 변화(멀티리전 등)는 다루지 않음 — 선택 보강(4.x 기준으로 범위 한정), 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-17 | v1 | 최초 작성 (Vercel 공식 문서 4페이지 + workflow-sdk.dev 13페이지 + GitHub·npm·web-push 교차 검증, 30개 클레임: VERIFIED 26 / DISPUTED 1 / UNVERIFIED 3) | skill-creator |
| 2026-09-17 | v1 | 2단계 실사용 테스트 수행 (Q1 sleep(Date) vs sleepUntil / Q2 취소·재시작 순서·중복 방지 / Q3 이벤트 한도·회전·Hobby 예산 계산) → 3/3 PASS, "실사용 검증 불필요 — content test로 충분" 카테고리 판정, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-25 | v1 | 구조 개편: 상세 내용 references/REFERENCE.md 분리 (내용 변경 없음) | Claude (Sonnet 5) |
| 2026-09-28 | v1.1 | 재검증(2차) — workflow npm latest 4.8.9·sleep(Date)/sleepUntil 부재·Hobby 한도 3건 재대조, 전부 VERIFIED 변경 없음. status APPROVED 유지 | Claude (Sonnet 5) |
