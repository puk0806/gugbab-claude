---
skill: vercel-sandbox
category: devops
version: v2
date: 2026-09-28
status: APPROVED
---

# 스킬 검증 문서 — vercel-sandbox

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `vercel-sandbox` |
| 스킬 경로 | `.claude/skills/vercel-sandbox/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-07-03, 2026-09-28 재검증) |
| 검증자 | skill-creator → Claude (Sonnet 5, 2026-09-28 재검증) |
| 스킬 버전 | v2 (2026-09-28 재검증 정정 반영) |
| 기준 버전 | `@vercel/sandbox` v3(npm 최신 3.5.0) / 과금·한도 2026-09 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (vercel.com/docs/sandbox 하위 6개 페이지)
- [✅] 공식 GitHub / npm 2순위 소스 확인 (github.com/vercel/sandbox, npmjs.com/@vercel/sandbox)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-07-03, 과금표 last_updated 2026-06-16)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (요청 단위 resume→stop, CLI 사전 설치 보존)
- [✅] 코드 예시 작성 (create/runCommand/logs/stop/snapshot, SSE Route Handler)
- [✅] 흔한 실수 패턴 정리 (7종 안티패턴 표)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | `/docs/sandbox`, `/docs/sandbox/pricing` | 개요·런타임·리전·타임아웃·리소스 한도, 5개 과금 지표·Hobby/Pro 한도표 확보 |
| 조사 | WebFetch | `/docs/sandbox/sdk-reference` (76KB) | Sandbox.create/get/getOrCreate/fork, runCommand 오버로드·detached, command.logs/wait/stdout, stop/extendTimeout/snapshot 시그니처 확보 |
| 조사 | WebFetch | `/docs/sandbox/concepts/persistent-sandboxes` | persistent 기본, 2단계 sandbox/session 모델, onCreate/onResume, keepLastSnapshots, v1→v2 마이그레이션 |
| 조사 | WebFetch | `/docs/sandbox/concepts/snapshots` | 수동 snapshot() 흐름, source:{type:'snapshot'}, 30일 만료, snapshot() 후 자동 종료 |
| 조사 | WebFetch | `/docs/sandbox/concepts/authentication` | OIDC(VERCEL_OIDC_TOKEN, 12h) vs Access(VERCEL_TEAM_ID/PROJECT_ID/VERCEL_TOKEN) |
| 조사 | WebFetch | KB 스냅샷 가이드 / optimizing 블로그 / Claude changelog | CLI 사전 설치→snapshot 패턴(16.49s→0.4s), Firecracker·millisecond 부팅, Claude managed agents(2026-05-18) |
| 교차 검증 | WebSearch | `@vercel/sandbox` v2 persistent default 등 11개 클레임 | VERIFIED 11 / DISPUTED 0 / UNVERIFIED 0 (npm·GitHub 독립 확인) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Vercel Sandbox 개요 | https://vercel.com/docs/sandbox | ⭐⭐⭐ High | 2026-06-17 | 공식 문서 (1순위) |
| Vercel Sandbox Pricing | https://vercel.com/docs/sandbox/pricing | ⭐⭐⭐ High | 2026-06-16 | 공식 과금·한도 표 |
| JS SDK Reference | https://vercel.com/docs/sandbox/sdk-reference | ⭐⭐⭐ High | 2026-06-16 | 공식 API 레퍼런스 |
| Persistent sandboxes | https://vercel.com/docs/sandbox/concepts/persistent-sandboxes | ⭐⭐⭐ High | 2026-05-29 | 공식 개념 문서 |
| Snapshots | https://vercel.com/docs/sandbox/concepts/snapshots | ⭐⭐⭐ High | 2026-06-10 | 공식 개념 문서 |
| Authentication | https://vercel.com/docs/sandbox/concepts/authentication | ⭐⭐⭐ High | 2026-05-25 | 공식 인증 문서 |
| KB: 스냅샷 빠른 시작 가이드 | https://vercel.com/kb/guide/how-to-use-snapshots-for-faster-sandbox-startup | ⭐⭐⭐ High | 2026 | 공식 KB, CLI 사전 설치 패턴 |
| Blog: 스냅샷 최적화 | https://vercel.com/blog/optimizing-vercel-sandbox-snapshots | ⭐⭐⭐ High | 2026-04-02 | 공식 블로그, 복원 성능 수치 |
| Changelog: Claude managed agents | https://vercel.com/changelog/run-claude-managed-agents-with-vercel-sandbox | ⭐⭐⭐ High | 2026-05-18 | 공식 changelog |
| npm: @vercel/sandbox | https://www.npmjs.com/package/@vercel/sandbox | ⭐⭐⭐ High | 2026 | 패키지·persistent 기본 교차 확인 |
| GitHub: vercel/sandbox | https://github.com/vercel/sandbox | ⭐⭐⭐ High | 2026 | SDK·CLI 코드베이스 (2순위) |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 교차 검증 클레임 판정

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | `@vercel/sandbox` v2부터 persistent가 기본, stop 시 자동 스냅샷·resume 복원 | SDK reference + persistent-sandboxes doc + npm(WebSearch) | ✅ VERIFIED |
| 2 | Sandbox는 `iad1` 리전 전용 | pricing doc (Regions) + SDK region accessor | ✅ VERIFIED |
| 3 | 기본 타임아웃 5분, `extendTimeout(ms)`로 연장 | pricing(Runtime limits) + sdk-reference(create.timeout/extendTimeout) | ✅ VERIFIED |
| 4 | 기본 2 vCPU, vCPU당 2048MB 메모리 | pricing(Active CPU) + sdk-reference(vcpus/memory accessor·create) | ✅ VERIFIED |
| 5 | Active CPU는 I/O 대기 미과금 | pricing(Active CPU 설명) + 예시 계산 note | ✅ VERIFIED |
| 6 | Provisioned Memory는 GB-hours, 최소 1분 단위 과금 | pricing(Provisioned Memory 문단) | ✅ VERIFIED |
| 7 | Hobby: Active CPU 5h/월, 메모리 420 GB-hours/월, 생성 5,000회/월, 동시 10개, 최대 45분 | pricing 표 (2개 하위 표 상호 일치) | ✅ VERIFIED |
| 8 | Hobby 한도 초과 시 과금 없이 생성 일시정지(최초 사용 후 30일까지) | pricing(Billing information → Hobby) | ✅ VERIFIED |
| 9 | Pro: 최대 24시간, $20/월 크레딧, 동시 2,000 | pricing 표 + Pro billing 문단 | ✅ VERIFIED |
| 10 | 인증: OIDC(`VERCEL_OIDC_TOKEN`, 12h) / Access(`VERCEL_TEAM_ID`·`VERCEL_PROJECT_ID`·`VERCEL_TOKEN`) | authentication doc | ✅ VERIFIED |
| 11 | 수동 `snapshot()` 후 샌드박스 자동 종료, `source:{type:'snapshot', snapshotId}`로 재생성, 30일 만료 | snapshots doc + sdk-reference(sandbox.snapshot) + KB 가이드 | ✅ VERIFIED |
| 12 | `runCommand` 스트리밍: `command.logs()` AsyncGenerator `{stream,data}`, detached+wait | sdk-reference(runCommand/Command.logs/wait) | ✅ VERIFIED |

> DISPUTED / UNVERIFIED 항목 없음. Hobby 한도는 2026-06 기준 과금표를 근거로 명시했으며, 과금 정책은 변동 가능하므로 SKILL.md에 기준일을 표기함.

---

### 4-2. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (@vercel/sandbox v2, 과금 2026-06)
- [✅] deprecated된 패턴을 권장하지 않음 (updateNetworkPolicy 대신 update 언급 생략, v1 sandboxId 대신 name 사용)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-3. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (Persistent vs 수동 스냅샷, 상시 실행 불가)
- [✅] 흔한 실수 패턴 포함 (안티패턴 7종)

### 4-4. 실용성
- [✅] 에이전트가 참조 시 실제 코드 작성에 도움 (SSE Route Handler 완결 예시)
- [✅] 지나치게 이론적이지 않고 실용적 예시 포함
- [✅] 범용적으로 사용 가능 (특정 로컬 프로젝트 비종속)

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-07-03, 2026-09-28 재검증 정정분 재테스트)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답 시 스킬 내용 보완 (해당 없음 — 2/2 PASS, §3 예시 코드 잔재 gap만 발견)

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester 3차 재테스트 — §3 예시 코드 `image` 정정 반영 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: 직전 재테스트에서 발견된 gap(§3 `Sandbox.getOrCreate()` 예시가 `runtime: 'node24'` 잔재 사용)을 메인 대화가 Edit으로 `image: 'vercel/sandbox/universal'`로 정정한 뒤, §3 복붙 시나리오 질문 1개로 §1·§2·§3·요약 체크리스트 전체 정합성 재확인

**Q1. §3 `Sandbox.getOrCreate()` 예시 코드를 그대로 복사해 쓸 때 이미지 지정 방식이 §1·§2 권장 방식과 일치하는가, `runtime: 'node24'`를 써야 하는가**
- ✅ PASS
- 근거: SKILL.md §1 핵심 개념 "주의" 문구, §2 `Sandbox.create()` 코드(`image: 'vercel/sandbox/universal'` 주석 포함), §3 `Sandbox.getOrCreate()` 코드, 요약 체크리스트
- 상세: §3 예시가 이미 `image: 'vercel/sandbox/universal'`로 수정되어 있음을 정확히 확인. `runtime: 'node24'` 사용 시 디스크 32GB로 줄어드는 부작용까지 정확히 인용. §1·§2·§3·요약 체크리스트 4곳 모두 일관되게 `image` 권장·`runtime` deprecated로 기술되어 있어 문서 내부 모순 없음(직전 재테스트 gap 해소 확인)

### 발견된 gap (있으면)

- 없음 — 직전 재테스트에서 발견된 §3 `runtime` 잔재 gap이 해소되었음을 확인

### 판정

- agent content test: 1/1 PASS
- verification-policy 분류: 라이브러리/SDK 사용법 스킬 — content test PASS = APPROVED 가능
- 최종 상태: APPROVED (유지)

---

**수행일**: 2026-07-03
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. SSE 중계 패턴 — runCommand detached + logs() + 시크릿 전달**
- ✅ PASS
- 근거: SKILL.md "runCommand() — 블로킹 & 스트리밍" 섹션, "실전 패턴 — 요청 단위 resume→실행→stop" 섹션, "안티패턴" 섹션
- 상세: `detached: true` 옵션, `command.logs()` AsyncGenerator, `env`로 시크릿 전달(args 금지), `finally` 블록에서 `stop()` 모두 정확히 답변. anti-pattern 회피(args에 API_KEY 전달 금지) 정확 인식. gap: SSE 클라이언트가 먼저 연결 끊겼을 때 AbortSignal 처리 미기술

**Q2. Hobby 한도 초과 — 상시 실행 불가 이유 + 대안 패턴**
- ✅ PASS
- 근거: SKILL.md "Hobby 무료 한도 & 초과 동작" 섹션, "Hobby에서 상시(24/7) 실행이 불가능한 이유" 섹션
- 상세: 1 vCPU 기준 1,440 GB-hours vs 한도 420 GB-hours, 8.75일 소진 계산 정확. 45분 최대 실행 한도, 초과 시 생성 일시정지(과금 없음) 정확. 지속 가능 패턴(요청 단위 resume→stop) 정확. gap: Active CPU 5시간/월 관점의 계산 미포함

**Q3. Persistent Sandbox vs 수동 스냅샷 선택 + 스토리지 관리**
- ✅ PASS
- 근거: SKILL.md "Persistent Sandbox & 스냅샷" 섹션, "안티패턴" 섹션
- 상세: 선택 기준(단일 재사용 → persistent / 공유·포크 → 수동 스냅샷) 정확. `getOrCreate + onCreate` 1회 설치 패턴 코드 정확. `snapshot()` 호출 후 자동 종료 주의사항, 30일 만료, `keepLastSnapshots: { count: 1 }` 스토리지 관리 모두 정확. gap: `onResume` 콜백 API 시그니처 미기술

### 발견된 gap (있으면)

- SSE 클라이언트 연결 끊겼을 때(`AbortSignal`) 샌드박스 정리 방법 미기술 (선택 보강)
- `extendTimeout()` 1회 연장 한도 및 누적 한도 미기술 (선택 보강)
- Active CPU 5시간/월 한도의 상시 실행 계산 예시 미포함 (선택 보강)
- `onResume` 콜백 API 시그니처 미기술 (선택 보강)

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리/SDK 사용법 스킬 — content test PASS = APPROVED 가능
- 최종 상태: APPROVED

---

### [2026-09-28] 재검증 — 리전·이미지 API·과금 한도 대폭 변경 발견 (PENDING_TEST 전환)

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 8개를 vercel.com/docs/sandbox·pricing·concepts/regions·sdk-reference 공식 문서 WebFetch로 재대조, npm registry로 버전 확인.

**클레임 대조 결과**:
1. `@vercel/sandbox` 메이저 버전 v2 → **DISPUTED(정정)**: npm registry 최신 3.5.0, 현재 메이저는 v3 (소스: registry.npmjs.org)
2. 리전은 `iad1` 전용 → **DISPUTED(정정)**: 2026-07 이후 19개 리전 전면 개방, `region`/`failoverRegions`(Pro·Enterprise) 옵션 존재 (소스: /docs/sandbox/concepts/regions)
3. `runtime: 'node24'` 등 개별 런타임 지정이 표준 API → **DISPUTED(정정)**: `runtime`은 deprecated, `image`(예: `vercel/sandbox/universal`) 권장으로 전환 (소스: /docs/sandbox/sdk-reference)
4. 임시 NVMe 디스크 32GB 고정 → **DISPUTED(정정)**: SDK 3.0.0+/커스텀 이미지는 64GB, 레거시 `runtime` 경유만 32GB (소스: /docs/sandbox/pricing "Resource limits")
5. Data Transfer는 인/아웃 전량 과금 → **DISPUTED(정정)**: 2026-07 정책 변경으로 다운로드(패키지 설치·git clone 등)는 무료, egress+개방 포트 트래픽만 과금 (소스: /docs/sandbox/pricing "Network")
6. Pro 동시 실행 한도 2,000개 → **DISPUTED(정정)**: 현재 10,000개 (소스: /docs/sandbox/pricing 표)
7. vCPU 생성 속도(Hobby 40/10분, Pro 200/분 고정치) → **DISPUTED(정정)**: 현재 동적 쿼터제 — Hobby 시작 20/분→최대 40/분, Pro 시작 150/분→최대 5,000/분, 10분 유휴 시 초기화 (소스: /docs/sandbox/pricing "API quotas")
8. `stop()` 반환값 `activeCpuUsageMs` 필드명 → **DISPUTED(정정)**: 공식 SDK 레퍼런스 기준 필드명은 `activeCpuDurationMs` (소스: /docs/sandbox/sdk-reference)

**실전 질문 재검증**:
- Q1. "Sandbox를 서울 리전에 만들 수 있는가?" → 정정 전 SKILL.md 기준 "불가(iad1 전용)"로 오답 유도 — 정정 후 `region: 'icn1'` 지정 가능으로 PASS
- Q2. "@vercel/sandbox 설치 시 `runtime: 'node24'`를 그대로 써도 되는가?" → 정정 후 SKILL.md "runtime deprecated, image 권장" 근거로 PASS

**재검증 최종 판정**: 핵심 클레임 8건 중 8건 DISPUTED(전부 정정 반영 — 리전 다변화·image API 전환·디스크 용량·Data Transfer 정책·Pro 동시실행·vCPU 동적 쿼터·필드명). SKILL.md를 Edit로 수정 완료. 변경 폭이 커 실전 코드 동작 여부 재확인이 필요하므로 status **PENDING_TEST 전환**(메인 대화가 skill-tester로 재테스트 수행 필요).

---

### [2026-09-28] skill-tester 2단계 재테스트 — 리전·image API 정정분 검증

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2개 질문, 병렬 실행)
**수행 방법**: SKILL.md Read 후 2026-09-28 재검증 정정분(리전 19개 개방, `image` API 전환, 디스크 용량, `stop()` 필드명)을 겨냥한 실전 질문 2개 답변, 근거 섹션 및 anti-pattern 회피 확인

**Q1. 서울 리전(icn1) 생성 가능 여부 + image 지정 방법**
- ✅ PASS
- 근거: SKILL.md §1 "핵심 개념"(19개 리전, `region` 옵션), §2 `Sandbox.create()` 코드, §7 안티패턴 표
- 상세: "19개 리전 중 `region` 옵션으로 선택 가능" 정확히 인용해 `region: 'icn1'` 지정 가능하다고 답변. `image: 'vercel/sandbox/universal'` 권장·`runtime` deprecated 정확히 구분. gap: 19개 리전의 실제 코드 목록이 SKILL.md에 나열되어 있지 않아 `icn1`이 그 목록에 포함되는지는 문서만으로 확정 불가(선택 보강)

**Q2. `runtime: 'node24'` 사용 가부 + 레거시 경유 디스크 용량 + `stop()` CPU 사용 시간 필드명**
- ✅ PASS
- 근거: SKILL.md §1 "주의" 문구(runtime deprecated), §1 리소스 항목(32GB vs 64GB), §2 생명주기 제어 코드(`activeCpuDurationMs`)
- 상세: `runtime` deprecated·`image` 권장 정확히 답변, 레거시 `runtime` 경유 시 디스크 32GB(vs 3.0.0+/커스텀 이미지 64GB) 정확 인용, `stop()` 반환 필드명 `activeCpuDurationMs` 정확 인용

### 발견된 gap (있으면)

- §3 "Persistent Sandbox" `Sandbox.getOrCreate()` 예시 코드가 여전히 `runtime: 'node24'`를 사용 — §1·§2·요약 체크리스트의 "`image` 권장, `runtime` deprecated" 원칙과 문서 내부적으로 불일치 (양쪽 에이전트가 독립적으로 동일 지적, 선택 보강이나 다음 재검증 시 SKILL.md §3 코드도 `image`로 통일 권장)
- 19개 리전의 실제 코드 목록이 SKILL.md에 없어 특정 리전(예: `icn1`) 지원 여부를 문서만으로 확정할 수 없음 (선택 보강)

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리/SDK 사용법 스킬 — content test PASS = APPROVED 가능 (실행 결과물 검증이 필요한 빌드/워크플로우/마이그레이션 카테고리 아님)
- 최종 상태: APPROVED

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-09-28 3차 재테스트 1/1 PASS — §3 예시 `image` 정정 반영 및 전 섹션 정합성 확인) |
| **최종 판정** | **APPROVED** (2026-09-28 skill-tester 3차 재테스트 1/1 PASS — §3 `runtime` 잔재 gap 해소 확인, 잔여 gap 없음) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 — 3/3 PASS (2026-07-03 완료)
- [✅] (2026-09-28 완료) 2026-09-28 재검증 정정분(리전·image API·디스크·필드명) 겨냥 skill-tester 재테스트 — 2/2 PASS, status APPROVED 유지
- [❌] Hobby/Pro 과금 수치는 정책 변동 가능 — 재사용 시 pricing 페이지 재확인 권장 (선택 보강 — 차단 요인 아님)
- [❌] `@vercel/sandbox` 정확한 patch 버전은 npm에서 수시 변동하므로 메이저(v3) 기준으로만 기술함 (선택 보강 — 차단 요인 아님)
- [❌] SSE 클라이언트가 먼저 연결 끊겼을 때 AbortSignal 처리 패턴 미기술 (선택 보강 — 차단 요인 아님)
- [❌] `extendTimeout()` 1회 연장 한도 및 누적 한도 미기술 (선택 보강 — 차단 요인 아님)
- [✅] (2026-09-28 완료) §3 `Sandbox.getOrCreate()` 예시 코드 `image: 'vercel/sandbox/universal'`로 정정, skill-tester 3차 재테스트 1/1 PASS로 §1·§2·§3·요약 체크리스트 정합성 확인

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-07-03 | v1 | 최초 작성 (공식 문서 6페이지 + KB/블로그/changelog + npm 교차 검증, 12개 클레임 전부 VERIFIED) | skill-creator |
| 2026-07-03 | v1 | 2단계 실사용 테스트 수행 (Q1 SSE 중계 패턴 / Q2 Hobby 상시 실행 불가 / Q3 Persistent vs 수동 스냅샷) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-28 | v2 | 재검증 — 공식 문서 재대조 결과 8건 DISPUTED 발견 및 정정: `@vercel/sandbox` v2→v3, `iad1` 전용→19개 리전 개방(`region`/`failoverRegions`), `runtime` deprecated→`image` 권장, 디스크 32GB→64GB(3.0.0+), Data Transfer 다운로드 무료화, Pro 동시실행 2,000→10,000개, vCPU 생성 속도 고정치→동적 쿼터, `stop()` 반환 필드명 `activeCpuDurationMs` 정정. SKILL.md 전 섹션 반영. status APPROVED → PENDING_TEST(재테스트 필요) | Claude (Sonnet 5) |
| 2026-09-28 | v2 | 2단계 실사용 재테스트 수행 (Q1 서울 리전 icn1 지정+image API / Q2 runtime deprecated+디스크 용량+stop() 필드명) → 2/2 PASS, APPROVED 유지. §3 예시 코드 `runtime` 잔재 gap 발견·기록(선택 보강) | skill-tester |
| 2026-09-28 | v2 | 3차 재테스트 — 메인이 §3 `Sandbox.getOrCreate()` 예시를 `image: 'vercel/sandbox/universal'`로 정정 후 §3 복붙 시나리오 질문(Q1) 1개로 재검증 → 1/1 PASS, 잔여 gap 없음, APPROVED 유지 | skill-tester |
