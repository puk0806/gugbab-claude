---
skill: testing
category: frontend
version: v3
date: 2026-11-09
status: APPROVED
---

# testing 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증)
  ├─ frontend-architect 에이전트 테스트 수행
  └─ 테스트 PASS → APPROVED
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | testing |
| 스킬 경로 | `.claude/skills/testing/SKILL.md` |
| 최초 작성일 | 2026-04-01 |
| 검증일 | 2026-11-09 (재검증, 이전 2026-09-28) |
| 검증 방법 | frontend-architect 활용 테스트 + 2026-09-28 재검증(2차) + 2026-11-09 재검증(3차, npm 레지스트리·공식 문서 대조) |
| 버전 기준 | Jest 30.5.2, Vitest 5.1.0(2026-11-02), @testing-library/react 16.3.3, @testing-library/jest-dom 7.0.1, @testing-library/dom 10.4.2, user-event 14.6.8 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성
- [✅] Claude Code 에이전트에서 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | setupFilesAfterEnv, renderHook import, vi.mocked, vi.mock 동적 import, RTL 쿼리 우선순위, userEvent.setup 6개 | 5/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Jest 공식 설정 문서 | https://jestjs.io/docs/configuration | ⭐⭐⭐ High |
| Testing Library About Queries | https://testing-library.com/docs/queries/about/ | ⭐⭐⭐ High |
| Vitest Mock API | https://vitest.dev/api/mock | ⭐⭐⭐ High |
| npm 레지스트리 (vitest·jest·@testing-library/*) | https://registry.npmjs.org/vitest · https://registry.npmjs.org/@testing-library/jest-dom | ⭐⭐⭐ High (2026-11-09 재검증) |
| Vitest 공식 마이그레이션 가이드 | https://vitest.dev/guide/migration/ | ⭐⭐⭐ High (2026-11-09 재검증) |
| jest-dom 공식 릴리즈·README | https://github.com/testing-library/jest-dom/releases · https://github.com/testing-library/jest-dom#with-vitest | ⭐⭐⭐ High (2026-11-09 재검증) |
| Next.js 공식 — Jest 설정 | https://nextjs.org/docs/app/guides/testing/jest | ⭐⭐⭐ High (2026-11-09 재검증) |

**2026-11-09 재검증 클레임 판정**

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| R1 | Vitest 5.x 요구사항(Node 22.12+·Vite 6.4+)·clearMocks 기본 true·중첩 vi.mock throw·미await 비동기 assertion 실패·test.sequential 제거·vite peer 전환 | vitest.dev/guide/migration | npm 레지스트리(latest 5.1.0) | **VERIFIED** |
| R2 | Jest + Next.js는 `next/jest` createJestConfig + `testEnvironment: 'jsdom'` + `setupFilesAfterEnv`에서 `import '@testing-library/jest-dom'` | nextjs.org Jest 가이드(2026-08-25 갱신) | jest-dom README | **VERIFIED** |
| R3 | Vitest setup에서 `import '@testing-library/jest-dom'` | jest-dom README "With Vitest" (`/vitest` 진입점 사용 안내) | jest-dom 7.0.1 package exports(`./vitest`) | **DISPUTED** → `@testing-library/jest-dom/vitest`로 수정 |
| R4 | jest-dom 7.0: `@testing-library/dom` 필수 peer·Node 22+ | jest-dom GitHub releases v7.0.0 | npm 7.0.1 package.json(engines·peerDependencies) | **VERIFIED** → SKILL.md 주의 블록 추가 |
| R5 | RTL 최신 16.3.x, `renderHook`·`act`는 `@testing-library/react`에서 import | npm 레지스트리(16.3.3) | 기존 RTL 문서 | **VERIFIED** |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (@testing-library/react-hooks → @testing-library/react 내장 반영)
- [✅] 버전 명시
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 5. 테스트 진행 기록

### [2026-11-09] skill-tester 재검증 content test — 11-09 수정분 겨냥

**수행일**: 2026-11-09
**수행자**: skill-tester → general-purpose (3건, Agent 도구로 실제 서브에이전트 호출. 3건 결과 모두 수신 후 판정)
**수행 방법**: SKILL.md Read 후 그 내용에만 의존해 답하도록 위임. 11-09 수정분(Vitest 전용 jest-dom import·tsconfig types 안내, jest-dom 7.0 주의, 기준 버전)을 겨냥한 실전 질문 3개

### 실제 수행 테스트

**Q1. Vitest 신규 세팅에서 setup 파일에 `import '@testing-library/jest-dom'`을 쓰면 되나? TS matcher 타입 에러 시 tsconfig는?**
- ✅ PASS
- 근거: SKILL.md "Vitest + React" 섹션 vitest.setup.ts 예시(`@testing-library/jest-dom/vitest`) + tsconfig `compilerOptions.types`·`include` 안내
- 상세: 기존 `jest-dom` import 가 아닌 `/vitest` 진입점이 정답임을 정확히 도출, Jest 쪽 import 와 구분함. anti-pattern(Vitest에서 기본 진입점 사용) 회피.

**Q2. CI Node 20에서 jest-dom 7.0 업그레이드 시 설치/실행 깨짐 및 `@testing-library/dom` peer 경고 — 원인·해결·신규 matcher?**
- ✅ PASS
- 근거: SKILL.md "jest-dom 7.0 주의" 블록 + 설치 명령(Jest/Vitest)
- 상세: Node 22+ 요구, `@testing-library/dom` 필수 peer(설치 명령에 이미 포함), 신규 matcher `toContainAnyBy*`·`toContainOneBy*` 모두 정확히 도출. 에이전트가 Node 20 유지 대안은 SKILL.md에 없고 추론임을 스스로 구분.

**Q3. 모노레포에서 Jest(Next.js)와 Vitest(Vite) 각각의 jest-dom import, Vitest 5.x 최소 Node/Vite 및 기준 버전?**
- ✅ PASS
- 근거: SKILL.md "Jest + Next.js"·"Vitest + React" 섹션, jest-dom 7.0 주의, Vitest 5.0+ 주의, 검증일 헤더
- 상세: Jest=`@testing-library/jest-dom`, Vitest=`/vitest`로 올바르게 구분. Node 22.12.0+/Vite 6.4.0+, 기준 버전 Vitest 5.1.0·Jest 30.5·RTL 16.3.3·jest-dom 7.0.1 정확히 제시.

### 발견된 gap (모두 선택 보강, 차단 요인 아님)

- tsconfig 안내(줄 80)가 문장만 있고 JSON 예시 없음
- jest-dom 7 신규 matcher 의미(Any/One 차이)·Node 22 불가 시 대안(6.x 고정) 미기재
- Jest 쪽 jest-dom 타입 설정 안내 없음, Jest 30.5·RTL 16.3.3 Node 최소 요구 미기재

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법 스킬, 실사용 필수 카테고리 아님)
- 최종 상태: APPROVED 유지

---

### 테스트 케이스 1: frontend-architect 에이전트 활용 테스트

**테스트 방법:** frontend-architect 에이전트에게 testing 관련 설계 질문 및 코드 리뷰 요청

**발견 및 수정 사항:**
- setupFilesAfterFramework 오타: `setupFilesAfterFramework` → `setupFilesAfterEnv` 수정. 잘못된 키는 Jest가 무시하므로 setup 파일이 실행되지 않는 심각한 오류

**판정:** ✅ PASS

---

### [2026-09-28] 재검증(2차) — Vitest 5.0 메이저 반영

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 3개를 1차 소스(npm registry, 공식 migration guide)와 대조, 보강 검토

**클레임 대조 결과**:
1. Vitest 최신 버전은 4.1.x → **DISPUTED(정정)**: 2026-09-03 Vitest **5.0.0** 메이저 출시, 현재 5.0.2(npm registry `latest`). Node.js 22.12.0+ · Vite 6.4.0+ 필수로 상향
2. RTL(`@testing-library/react`) 16.3에서 `@testing-library/dom` peerDependency 분리 유지 → VERIFIED (npm registry, 기존 08-26 재검증과 변동 없음)
3. Vitest 5.0 브레이킹 체인지 중 본 스킬 예시에 영향 있는 항목 3가지(clearMocks 기본값 true, vi.mock/vi.hoisted 최상단 강제, 비동기 assertion 미await 시 실패) → VERIFIED (vitest.dev/guide/migration/ 공식 마이그레이션 가이드)

**보강(ADD)·축소**: SKILL.md에 "주의 (Vitest 5.0+)" 블록 신설 — Node/Vite 최소 버전, clearMocks 기본값 변경, vi.mock/vi.hoisted 최상단 강제, 미await 비동기 assertion 실패 처리 4가지 명시. 설치 커맨드 주석에 vite peerDependency 전환 안내(Yarn 명시 설치 필요) 추가. vitest.config 예시에 `clearMocks: true` 주석 추가. 축소 없음.

**실전 질문 재검증**:
- Q1. "Vitest 5.0으로 올리면 기존에 `beforeEach(() => vi.clearAllMocks())`를 직접 호출하던 테스트 스위트는 어떻게 되는가?" → SKILL.md "주의 (Vitest 5.0+)" 1번 근거로 PASS (clearMocks 기본값 true로 자동 호출되어 중복 초기화는 무해하나, v4 방식 유지가 필요하면 `clearMocks: false` 명시해야 한다고 정확히 안내)
- Q2. "vi.mock을 describe 블록 안에서 조건부로 호출해도 되는가?" → SKILL.md "주의 (Vitest 5.0+)" 2번 근거로 PASS (Vitest 5.0+에서는 경고가 아니라 에러로 throw된다고 명시, 파일 최상단 호출 필요)

**재검증 최종 판정**: status **PENDING_TEST 전환** (Vitest 5.0 반영으로 보강 발생 — skill-tester 재테스트 대상)

---

### [2026-09-28] skill-tester 실제 에이전트 content test — Vitest 5.0 보강분 겨냥

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2건, Agent 도구로 실제 서브에이전트 호출)
**수행 방법**: SKILL.md만 근거로 답하도록 위임, "주의 (Vitest 5.0+)" 보강 블록(clearMocks 기본값 true·vi.mock 최상단 강제)을 직접 겨냥한 실전 질문 2개 수행

**Q1. Vitest 5.0으로 올린 후 `toHaveBeenCalledTimes` 검증이 실패하기 시작했다 — 원인과 v4 방식 유지 방법, Node/Vite 최소 버전은?**
- ✅ PASS
- 근거: SKILL.md "주의 (Vitest 5.0+)" 블록 1번 항목(줄 80-84)
- 상세: `clearMocks` 기본값이 `true`로 바뀌어 매 테스트 전 자동 초기화된다는 점, `clearMocks: false` 명시로 v4 방식 유지 가능하다는 점, Node.js 22.12.0+/Vite 6.4.0+ 필수라는 점 모두 정확히 근거 제시. 경미한 gap: `restoreMocks`/`resetMocks` 기본값과의 구분은 SKILL.md에 없음(선택 보강)

**Q2. vi.mock을 조건문(블록) 내부에서 호출하면 Vitest 5.0에서 어떻게 되는가? 올바른 위치는?**
- ✅ PASS
- 근거: SKILL.md "주의 (Vitest 5.0+)" 블록 2번 항목 + "비동기 테스트" 섹션 vi.mock 예시(줄 207-209)
- 상세: 블록 내부 호출 시 경고가 아닌 에러로 throw된다는 점, 파일 최상단이 올바른 위치라는 점을 정확히 도출하고 실제 코드 예시(파일 최상단 `vi.mock`)와 대조까지 수행. 경미한 gap: 조건부 모킹이 필요한 경우의 명시적 대안 패턴(vi.hoisted 등)은 SKILL.md에 없어 유추 필요(선택 보강)

**판정**: 2/2 PASS. Vitest 5.0 보강분(clearMocks·vi.mock 최상단 강제)이 실전 질문에서 올바른 답을 도출시킴을 확인. 기존 패턴(vi.fn, vi.mocked 등)과 신규 보강 문구 사이 모순 없음.

**최종 판정**: 실사용 필수 카테고리 아님(라이브러리 사용법 스킬) — content test 2/2 PASS로 **PENDING_TEST → APPROVED 전환**

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (Vitest 4.1 → 5.0.2 DISPUTED 수정 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (frontend-architect, 2026-04-14) + ✅ 2/2 PASS (2026-09-28 skill-tester→general-purpose, Vitest 5.0 보강분 겨냥) |
| 에이전트 활용 테스트 (2026-11-09 재검증) | ✅ 3/3 PASS (skill-tester→general-purpose, Vitest 전용 jest-dom import·jest-dom 7.0 주의·기준 버전 겨냥) |
| **최종 판정** | **APPROVED** (2026-11-09 재검증 content test 3/3 PASS, 실사용 필수 카테고리 아님) |

---

## 7. 개선 필요 사항

- [✅] **(2026-09-28 완료, 2/2 PASS)** skill-tester로 Vitest 5.0 보강 반영분(clearMocks 기본값·vi.mock 최상단 강제) content test 수행 → APPROVED 전환
- [✅] **(2026-11-09 완료, 3/3 PASS)** skill-tester로 11-09 수정분(Vitest 전용 jest-dom import·tsconfig types·jest-dom 7.0 주의·기준 버전) content test 수행 → APPROVED 유지
- [❌] (선택 보강, 차단 요인 아님) tsconfig JSON 예시, jest-dom 7 신규 matcher 설명·Node 22 불가 시 대안 추가

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-01 | v1 | 최초 작성 및 frontend-architect 활용 테스트 완료 | frontend-architect 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-08-26 | v2.1 | freshness 재검증(147일 경과) — RTL 16부터 `@testing-library/dom` peerDependency 분리(설치 커맨드 2곳에 추가, 근거: RTL npm·react-testing-library#906). Vitest 4.1 stable·쿼리 우선순위·renderHook 위치 VERIFIED | freshness-auditor + orchestrator |
| 2026-09-28 | v3 | 재검증(2차) — Vitest 4.1 → 5.0.2 메이저 출시(2026-09-03) 반영, "주의 (Vitest 5.0+)" 블록 신설(clearMocks 기본값·vi.mock 최상단 강제·미await 비동기 assertion 실패·Node/Vite 최소 버전). status APPROVED → PENDING_TEST | Claude (Sonnet 5) |
| 2026-09-28 | v3 | skill-tester 실사용 재테스트 — general-purpose 에이전트로 Vitest 5.0 보강분(clearMocks·vi.mock 최상단 강제) 겨냥 질문 2개 수행 → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-11-09 | v3.1 | 재검증 — Vitest 5.1.0·Jest 30.5.2·RTL 16.3.3 확인(Vitest 5 주의 블록 VERIFIED), Vitest setup import를 `@testing-library/jest-dom/vitest`로 정정(DISPUTED), jest-dom 7.0 브레이킹(`@testing-library/dom` 필수 peer·Node 22+) 주의 블록 추가 | Claude (Opus 5.5) |
| 2026-11-09 | v3.1 | 재검증 후 2단계 실사용 테스트 수행 (Q1 Vitest 전용 jest-dom import·tsconfig / Q2 jest-dom 7.0 Node 22·peer·신규 matcher / Q3 Jest·Vitest import 구분·Vitest 5 최소 버전·기준 버전) → 3/3 PASS, APPROVED 유지 | skill-tester |
| 2026-11-11 | v3.1 | 2026-11-11 정리 — 모델이 아는 일반 지식 절 제거(남긴 절: 설정(Jest + Next.js·Vitest + React, jest-dom/vitest 진입점·tsconfig 안내), jest-dom 7.0 주의, Vitest 5.0+ 주의 / 덜어낸 절: Jest vs Vitest 선택 기준, 핵심 원칙, 컴포넌트 테스트 패턴, 커스텀 훅 테스트, 비동기 테스트, 쿼리 우선순위, 테스트 파일 배치, 사실 재검증 아님) | Claude (Opus 5.5) |
