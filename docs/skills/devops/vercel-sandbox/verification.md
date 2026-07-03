---
skill: vercel-sandbox
category: devops
version: v1
date: 2026-07-03
status: APPROVED
---

# 스킬 검증 문서 — vercel-sandbox

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `vercel-sandbox` |
| 스킬 경로 | `.claude/skills/devops/vercel-sandbox/SKILL.md` |
| 검증일 | 2026-07-03 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | `@vercel/sandbox` v2 / 과금·한도 2026-06 |

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
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-07-03)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답 시 스킬 내용 보완 (해당 없음 — 3/3 PASS)

---

## 5. 테스트 진행 기록

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

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-07-03) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 — 3/3 PASS (2026-07-03 완료)
- [❌] Hobby/Pro 과금 수치는 정책 변동 가능 — 재사용 시 pricing 페이지 재확인 권장 (선택 보강 — 차단 요인 아님)
- [❌] `@vercel/sandbox` 정확한 patch 버전은 npm에서 수시 변동하므로 v2 메이저 기준으로만 기술함 (선택 보강 — 차단 요인 아님)
- [❌] SSE 클라이언트가 먼저 연결 끊겼을 때 AbortSignal 처리 패턴 미기술 (선택 보강 — 차단 요인 아님)
- [❌] `extendTimeout()` 1회 연장 한도 및 누적 한도 미기술 (선택 보강 — 차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-07-03 | v1 | 최초 작성 (공식 문서 6페이지 + KB/블로그/changelog + npm 교차 검증, 12개 클레임 전부 VERIFIED) | skill-creator |
| 2026-07-03 | v1 | 2단계 실사용 테스트 수행 (Q1 SSE 중계 패턴 / Q2 Hobby 상시 실행 불가 / Q3 Persistent vs 수동 스냅샷) → 3/3 PASS, APPROVED 전환 | skill-tester |
