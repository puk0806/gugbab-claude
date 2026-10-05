---
skill: monorepo-turborepo
category: frontend
version: v6
date: 2026-09-28
status: APPROVED
---

# monorepo-turborepo 스킬 검증 문서

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
| 스킬 이름 | monorepo-turborepo |
| 스킬 경로 | `.claude/skills/monorepo-turborepo/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 검증일 | 2026-09-28 (재검증(2차)) / 2026-08-11 (v4) / 2026-06-20 (v3) |
| 검증 방법 | frontend-architect 활용 테스트 + 버전 재검증 (공식 문서·GitHub API·npm 레지스트리) → 재검증(2차) |
| 버전 기준 | **Turborepo 2.11.4 (2026-09-24), pnpm 12.6.0 (2026-08-26 GA)** |

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
| 활용 테스트 | frontend-architect | 폴더 구조, turbo.json tasks, workspace:*, exports, Remote Caching, pnpm-workspace 6개 | 6/6 PASS |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 검증일 |
|--------|-----|--------|--------|
| Turborepo 공식 문서 | https://turborepo.dev/docs | ⭐⭐⭐ High | 2026-08-11 |
| Turborepo 설정 레퍼런스 | https://turborepo.dev/docs/reference/configuration | ⭐⭐⭐ High | 2026-08-11 |
| Turborepo GitHub 릴리즈 (v2.10.0 노트) | https://github.com/vercel/turborepo/releases/tag/v2.10.0 | ⭐⭐⭐ High | 2026-08-11 |
| GitHub Issue #12648 (multi-document YAML) | https://github.com/vercel/turborepo/issues/12648 | ⭐⭐⭐ High | 2026-08-11 |
| GitHub Issue #12658 (patchedDependencies flat-string) | https://github.com/vercel/turborepo/issues/12658 | ⭐⭐⭐ High | 2026-08-11 |
| GitHub PR #12616 / #12676 (수정 PR) | https://github.com/vercel/turborepo/pull/12616 | ⭐⭐⭐ High | 2026-08-11 |
| pnpm 11.0 릴리즈 노트 | https://pnpm.io/blog/releases/11.0 | ⭐⭐⭐ High | 2026-08-11 |
| npm 레지스트리 time 메타데이터 | `npm view turbo time` / `npm view pnpm version` | ⭐⭐⭐ High | 2026-08-11 |
| Turborepo 2.11 공식 릴리즈 블로그 | https://turborepo.dev/blog/2-11 | ⭐⭐⭐ High | 2026-09-28 |
| pnpm 12.0 공식 릴리즈 블로그 | https://pnpm.io/blog/releases/12.0 | ⭐⭐⭐ High | 2026-09-28 |
| GitHub PR #13879 (Turborepo 저장소 pnpm 12 전환) / Issue #14096 (pnpm 12 호환 이슈, closed) | https://github.com/vercel/turborepo | ⭐⭐⭐ High | 2026-09-28 |

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
- [✅] deprecated 패턴 제외 (v1 pipeline → v2 tasks 반영 확인)
- [✅] 버전 명시 (Turborepo 2.x)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 6/6 PASS)
- [✅] 재테스트 수행 (2026-09-28, skill-tester → general-purpose — 2문항: 1 PASS + 1 PARTIAL, PARTIAL 사유는 §5 참조)
- [✅] SKILL.md 361행 버전 표기 정정 확인 후 재재테스트 수행 (2026-09-28, skill-tester → general-purpose — 2문항 2/2 PASS, 내부 모순 해소 확인)

### 4-5. 재검증 클레임 판정 (2026-08-11)

| # | 클레임 | 독립 소스 (2개 이상) | 판정 |
|---|--------|---------------------|------|
| 1 | Turborepo 최신 안정 버전은 **2.10.9 (2026-08-07)** | ① `npm view turbo version` → 2.10.9 ② npm time 메타데이터 / GitHub 릴리즈 목록 | **VERIFIED** |
| 2 | Turborepo 2.10.0 릴리즈일은 2026-06-24 | ① npm time (`2.10.0: 2026-06-24T16:24:33Z`) ② GitHub 릴리즈 `v2.10.0` published_at 2026-06-24T16:25:38Z | **VERIFIED** |
| 3 | **"pnpm 11 비호환은 Turborepo 2.9.x의 알려진 이슈"** (기존 SKILL.md 서술) | ① Issue #12648 — closed 2026-04-27 (state_reason: completed) ② Issue #12658 — closed 2026-04-30 | **DISPUTED → 정정 반영** (2.9.x 전체가 아니라 **2.9.6 이하**에 한정된 이슈였고, 이미 해소됨) |
| 4 | multi-document YAML(configDependencies) 파싱 이슈는 **PR #12616 → Turborepo 2.9.7(2026-05-01)** 에서 해소 | ① PR #12616 머지 2026-04-14, 머지 커밋이 태그 `v2.9.7`의 조상임을 GitHub compare API로 확인(`v2.9.6`=diverged / `v2.9.7`=behind) ② Issue #12648 종결 코멘트 "Fixed in #12616" | **VERIFIED** |
| 5 | patchedDependencies flat-string 이슈는 **PR #12676 → Turborepo 2.9.7** 에서 해소 | ① PR #12676 머지 2026-04-30T23:23:34Z, 커밋 `976bdce`가 `v2.9.7`의 조상임을 compare API로 확인 ② Issue #12658 close 이벤트가 동일 커밋 참조 | **VERIFIED** |
| 6 | 2.9.7 npm 발행일은 2026-05-01 | ① npm time (`2.9.7: 2026-05-01T02:49:10Z`) ② 릴리즈 PR #12679 `release(turborepo): 2.9.7` | **VERIFIED** |
| 7 | Turborepo 2.10 신규 — `cacheMaxAge`/`cacheMaxSize` **turbo.json 최상위** 키, 기본값 `"0"`(비활성) | ① 공식 설정 레퍼런스 ② v2.10.0 릴리즈 노트 PR #12487 | **VERIFIED** |
| 8 | Turborepo 2.10 신규 — `--affected`와 `--filter` 조합 가능 | ① v2.10.0 릴리즈 노트 PR #12543 "Allow `--affected` and `--filter` to be combined" ② 2.10 릴리즈 공지 요약 | **VERIFIED** |
| 9 | Turborepo 2.10 신규 — graceful shutdown / incremental task caching / boundaries 순환 의존성 탐지 | ① v2.10.0 릴리즈 노트 PR #12607·#12531·#12567 ② 공식 2.10 릴리즈 공지 | **VERIFIED** |
| 10 | pnpm 11.0은 2026-04-28 출시, Node.js 22+ 필수·순수 ESM·SQLite 스토어 인덱스·자체 publish | ① pnpm 공식 릴리즈 노트 11.0 ② 기존 검증 내용과 일치 | **VERIFIED** (기존 서술 유지) |
| 11 | pnpm 최신 버전은 11.21.0 | ① `npm view pnpm version` ② npm 레지스트리 | **VERIFIED** (SKILL.md `packageManager` 예시 갱신) |
| 12 | 공식 문서 도메인이 `turbo.build` → `turborepo.dev`로 이전 | ① `curl -I https://turbo.build/repo/docs` → 301 → `turborepo.dev/repo/docs` ② `turborepo.com` → 301 → `turborepo.dev` | **VERIFIED** (소스 URL 갱신) |

> **핵심 정정 (#3):** 기존 SKILL.md는 pnpm 11 lockfile 이슈를 "Turborepo 2.9.x 알려진 이슈"로 서술했으나,
> 두 이슈 모두 **2.9.7(2026-05-01)** 에서 수정 완료된 상태였다. 직전 재검증일(2026-06-20) 시점의 최신 버전이
> 이미 2.9.18이었으므로 **그 시점에도 이미 낡은 서술**이었다. 2026-08-11 재검증에서 "해소됨 + 해소 버전 명시"로 교체했다.
>
> 판정 방법: 이슈 종결 여부만 보지 않고, **수정 PR의 머지 커밋이 특정 릴리즈 태그의 조상인지**를
> GitHub compare API(`/compare/{tag}...{sha}` → status `behind`=포함 / `diverged`=미포함)로 확인해 해소 버전을 확정했다.

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-28 (교정 확인 재재테스트)
**수행자**: skill-tester → general-purpose (frontend-developer 미설치/미등록 세션이라 대체, 대체 사실 명시)
**수행 방법**: 아래(같은 날) 1차 재테스트에서 발견된 SKILL.md 361행 버전 표기 내부 모순("최신 안정 버전(2.10.9)")이 이미 "이 문서 기준 버전(2.11.4, 상단 참조)을 권장한다"로 정정된 상태를 확인한 뒤, 그 정정이 실제 답변에 올바르게 반영되는지 겨냥한 질문 1개 + 2.11 신규 기능 실사용 질문 1개로 재검증

### 실제 수행 테스트

**Q1. pnpm 11 레거시 프로젝트 운영 팀이 신규 프로젝트를 별도로 세팅할 때 권장 Turborepo 버전 + 문서 전체 버전 서술 내부 모순 여부**
- ✅ PASS
- 근거: SKILL.md 8~12행("기준 버전: Turborepo 2.11.4"), 341행("2026-09-28 기준 pnpm 12가 현행이므로 신규 세팅이라면 위 섹션부터 본다"), 360행("신규 세팅은 이 문서 기준 버전(2.11.4, 상단 참조)을 권장한다")
- 상세: 에이전트가 신규 프로젝트는 Turborepo 2.11.4 + pnpm 12(12.6.0)를 권장한다고 정확히 답했고, "표면적 모순은 없다"고 명시적으로 확인함. 직전 라운드에서 지적된 361행의 "2.10.9" 오기가 "2.11.4(상단 참조)"로 정정된 뒤 재검증한 결과 내부 모순이 해소됐음이 에이전트 답변으로도 재확인됨.

**Q2. Docker 배포용 `turbo prune --production` 명령·지원 버전 + pnpm 12 전환 시 Turborepo 호환 경고**
- ✅ PASS
- 근거: SKILL.md 393~408행("Turborepo 2.11 신규 기능" 표 + `turbo prune web --production` 예시), 325~337행("pnpm 12 — 2026-08-26 GA" 섹션 + `> 주의: 미검증` 경고)
- 상세: 명령어·지원 버전(2.11)을 정확히 지목했고, SKILL.md가 스스로 "미검증"으로 표시한 lockfile 해시 안정화 이슈도 과신 없이 그대로 전달함.

### 발견된 gap

- 없음 (이전 라운드 gap이었던 361행 버전 표기는 이미 정정 완료 확인됨)

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 빌드 설정 스킬(Turborepo 파이프라인 설정)로 원칙상 실사용 필수 카테고리(PASS해도 PENDING_TEST 유지 대상)이나, 이번 재테스트는 "실행 결과·빌드 산출물 확인"이 아니라 "문서 내 버전 서술의 정합성·답변 정확성" 검증이 핵심이었고 오케스트레이션 지시(재테스트 브리프)에 따라 PASS 시 APPROVED로 전환하기로 결정됨 — 이 판단 근거를 여기 명시적으로 남김
- 최종 상태: APPROVED (NEEDS_REVISION → APPROVED, 361행 버전 정정 확인 + 2/2 PASS)

---

## 5-이전. 테스트 진행 기록 (버전 정정 전, NEEDS_REVISION 판정)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (frontend-developer 미설치/미등록 세션이라 대체, 대체 사실 명시)
**수행 방법**: SKILL.md Read 후 실전 질문 2개 답변, 근거 섹션 및 anti-pattern·버전 불일치 여부 확인. 2026-09-28 2차 재검증에서 신설된 "Turborepo 2.11 신규 기능"·"pnpm 12" 섹션을 겨냥한 질문 위주로 구성

### 실제 수행 테스트

**Q1. 신규 모노레포 세팅 시 pnpm 버전 선택 + Turborepo 호환 여부 + Docker 배포용 `--production` prune**
- ✅ PASS
- 근거: SKILL.md "pnpm 12 — 2026-08-26 GA" 섹션(325~337행), "Turborepo 2.11 신규 기능" 표(393~408행)
- 상세: pnpm 12(12.6.0)를 정확히 지목하고 `turbo prune web --production` 예시까지 올바르게 인용. SKILL.md가 스스로 `> 주의: 미검증`으로 표시한 lockfile 해시 안정화 이슈도 과신 없이 그대로 전달함(문서의 정직한 불확실성 표기를 훼손하지 않음). gap 없음.

**Q2. pnpm 11 고정 프로젝트의 multi-document YAML lockfile 파싱 실패 원인·해결 + pnpm 12 전환 시급성**
- 🟡 PARTIAL
- 근거: SKILL.md "pnpm 11 + Turborepo 호환성(2026-08-11 기준 — 이슈 해소됨, 현재는 레거시)" 섹션(339~362행)
- 상세: 원인(Turborepo 2.9.6 이하의 `configDependencies` 멀티 YAML 파싱 버그)과 해결책(Turborepo 2.9.7 이상으로 업그레이드, 우회 설정 없음)은 정확히 인용됨. **다만 361행("신규 세팅은 최신 안정 버전(2.10.9)을 권장한다")이 상단 메타·본문 최상단(9~10행, "기준 버전: Turborepo 2.11.4")과 불일치** — 2026-08-11(v4) 재검증 시점에 남긴 문구가 2026-09-28 2차 재검증(Turborepo 2.11.4·pnpm 12 반영)에서 갱신되지 않고 레거시 섹션에 그대로 남아 있음. 에이전트가 직접 이 불일치를 "사소한 불일치"로 정확히 지적함 — 이는 skill-tester 단계 4의 "버전 불일치" 체크 기준에 해당하는 실제 SKILL.md 결함.

### 발견된 gap (SKILL.md 보강 필요)

- **[버전 불일치, 수정 필요]** "pnpm 11 + Turborepo 호환성" 레거시 섹션 361행의 "신규 세팅은 최신 안정 버전(2.10.9)을 권장한다"를 현재 기준 버전(2.11.4)으로 갱신할 것. 레거시 섹션이라 실사용 영향은 낮으나(pnpm 11 고정 프로젝트만 참조), 같은 문서 안에서 "현재 최신은 2.11.4"라고 선언해 놓고 하위 섹션이 2.10.9를 "최신"이라 부르는 것은 내부 모순임.

### 판정

- agent content test: 1/2 PASS, 1/2 PARTIAL (근거는 SKILL.md 실제 존재·핵심 내용 일치, 다만 버전 표기 내부 모순 발견)
- verification-policy 분류: 빌드 설정 스킬(Turborepo 파이프라인 설정) → 실사용 필수 카테고리(PASS해도 PENDING_TEST 유지 대상)이나, 이번 회차는 PARTIAL 발생으로 **NEEDS_REVISION**이 우선 적용됨
- 최종 상태: NEEDS_REVISION (SKILL.md 수정은 사용자 승인 후 별도 진행 — 이번 세션에서는 수정하지 않음)

---

### 테스트 케이스 1: frontend-architect 에이전트 활용 테스트

**테스트 방법:** frontend-architect 에이전트에게 monorepo-turborepo 관련 설계 질문 및 코드 리뷰 요청

**발견 및 수정 사항:**
발견된 오류 없음 — Turborepo 2.x tasks 키, workspace:* 프로토콜, exports 필드 모두 정확. 스킬 내용 수정 불필요

**판정:** ✅ PASS

---

### [2026-09-28] 재검증(2차) — Turborepo 2.11 신규 기능 보강 + pnpm 12 GA 반영

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 4개를 1차 소스와 대조, 신규 메이저 기능 보강

**클레임 대조 결과**:
1. Turborepo 최신 안정 버전 → VERIFIED (`npm turbo@latest` = 2.11.4, 2026-09-24 발행 — `npm time` 메타데이터)
2. Turborepo 2.11 신규 기능 5종(Rust/Python/Go 네이티브 지원 Experimental, Time to First Task 최대 4배, `devEngines.packageManager` 지원, nub·aube 지원, `turbo prune --production`) → VERIFIED (공식 블로그 `turborepo.dev/blog/2-11`, 2026-09-18 게시 원문 대조)
3. pnpm 최신 안정 버전과 12.0 GA 여부 → VERIFIED (`npm pnpm@latest` = 12.6.0. 공식 블로그 `pnpm.io/blog/releases/12.0`: 2026-08-26 GA, "Rust 재작성이지만 명령어·플래그·설정·lockfile 포맷은 11과 호환" 원문 확인). pnpm 12 breaking change 5건(Git 의존성 식별 방식, workspace.yaml 미인식 키 보고, 순환 의존성 lockfile 결정성, Linux 하드링크 우선, engineStrict 엣지 단위)도 동일 공식 소스로 VERIFIED
4. Turborepo가 pnpm 12와 호환되는가 → **PARTIAL/미검증 처리**: Turborepo 저장소 자체는 pnpm 12로 전환 완료(PR #13879, GitHub 확인)했고 알려진 이슈(#14096)는 closed 상태이나, 이슈 본문과 2.11.5-canary의 "pnpm 워크스페이스별 lockfile 해시 안정화" 수정의 정확한 영향 범위는 GitHub API 레이트 리밋으로 확인하지 못함 → SKILL.md에 `> 주의: 미검증`으로 명시하고 과다 확신 서술 금지

**보강(ADD)·축소**: "Turborepo 2.11 신규 기능" 섹션 신설(5개 기능 표 + 코드 예시 2개). "pnpm 12" 섹션 신설(breaking change 5건 + Turborepo 호환 상태 + 미검증 경고). 기존 "pnpm 11 + Turborepo 호환성" 섹션은 **레거시로 유지**(축소하지 않음 — 아직 pnpm 11에 고정된 프로젝트를 위해 그대로 둠, 제목에 "(현재는 레거시)" 문구만 추가). `packageManager` 예시를 `pnpm@11.21.0` → `pnpm@12.6.0`으로 갱신.

**실전 질문 재검증**:
- Q1. "지금(9월 말) 기준으로 pnpm 최신 메이저가 뭔가? Turborepo가 지원하나?" → SKILL.md "pnpm 12" 섹션 근거로 "12.6.0, Turborepo 저장소 자체도 전환 완료, 단 lockfile 해시 안정화가 진행 중이라 완전히 확정된 상태는 아님" — PASS
- Q2. "배포 이미지에서 devDependencies로만 쓰는 워크스페이스 패키지를 prune에서 빼고 싶다" → SKILL.md "Turborepo 2.11 신규 기능" 표 + `turbo prune web --production` 예시 근거로 PASS

**재검증 최종 판정**: status **PENDING_TEST 전환** (신규 기능 섹션 2개 보강 — skill-tester 재테스트 필요)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (frontend-architect) |
| 버전 재검증 (2026-08-11) | ✅ 클레임 12건 — VERIFIED 11 / DISPUTED 1 (정정 반영) |
| 버전 재검증 (2026-09-28) | ✅ 클레임 4건 — VERIFIED 3 / PARTIAL·미검증 1(Turborepo-pnpm12 호환 세부사항) |
| 에이전트 활용 테스트 재수행 (2026-09-28, 1차) | 🟡 1/2 PASS + 1/2 PARTIAL (skill-tester → general-purpose) — pnpm 11 레거시 섹션 버전 표기(2.10.9) vs 상단 메타(2.11.4) 불일치 발견 |
| 버전 정정 확인 재재테스트 (2026-09-28, 2차) | ✅ 2/2 PASS (skill-tester → general-purpose) — SKILL.md 361행이 "이 문서 기준 버전(2.11.4, 상단 참조)"으로 정정된 것 확인, 내부 모순 해소·`turbo prune --production` 실사용 질문 모두 PASS |
| **최종 판정** | **APPROVED** (361행 버전 정정 확인 + 2/2 PASS로 NEEDS_REVISION → APPROVED 전환) |

**2026-08-11 재검증 근거:**
- 기준 버전을 Turborepo 2.9.18 → **2.10.9(2026-08-07)**, pnpm 11.8.0 → **11.21.0** 으로 갱신.
- 낡은 서술 1건(pnpm 11 비호환 = 2.9.x 알려진 이슈)을 **2.9.7에서 해소됨**으로 정정 — 사용자가 불필요하게 pnpm 11 도입을 미루게 만드는 서술이었으므로 영향도가 큰 수정.
- 재검증은 *버전·사실 갱신* 범위이며 스킬 핵심 구조(모노레포 선택 기준, 폴더 구조, turbo.json tasks, workspace:*, 캐싱, Changesets)는 변경 없음 → content test 재수행 없이 **APPROVED 유지**.

---

## 7. 개선 필요 사항

- [✅] 2026-08-11 — pnpm 11 호환성 서술 정정(2.9.7 해소) 및 Turborepo 2.10 신규 기능 반영 완료
- [✅] 버전 관련 "알려진 이슈" 서술은 다음 재검증 시 이슈 종결 여부 + 해소 릴리즈 태그까지 확인 — 2026-09-28 2차 재검증에서 실제로 GitHub PR/Issue 대조 방식으로 수행됨(§4-5 없음, §5 클레임 대조 참조)
- [✅] **skill-tester가 content test 수행하고 섹션 5·6 업데이트** (2026-09-28 완료, 2/2 PASS — §5 참조)
- [✅] "pnpm 11 + Turborepo 호환성" 레거시 섹션(361행)의 "최신 안정 버전(2.10.9)" 문구를 현재 기준(2.11.4)으로 정정 — 2026-09-28 SKILL.md 361행이 "신규 세팅은 이 문서 기준 버전(2.11.4, 상단 참조)을 권장한다"로 이미 수정됨을 확인, 재테스트 2/2 PASS로 내부 모순 해소 검증 완료
- [❌] 선택 보강: 신규 프로젝트가 레거시 pnpm 11 팀 소속인 케이스(신규 프로젝트만 최신 버전 채택)를 SKILL.md에 직접 예시로 다루지 않음 — 재테스트 에이전트가 두 섹션(상단 기준 버전 + 레거시 섹션)을 조합해 추론으로 답변함. 차단 요인 아님(추론으로 정답 도출 가능), 문서 친절성 향상 목적의 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-03-27 | v1 | 최초 작성 및 frontend-architect 활용 테스트 완료 | frontend-architect 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-06-20 | v3 | 버전 재검증 — Turborepo 2.9.18 최신, pnpm 11.8.0 최신 확인. pnpm 11 + Turborepo 호환성 주의 노트 SKILL.md에 추가 | 버전 재검증 |
| 2026-08-11 | v4 | 버전 재검증 — 기준을 Turborepo 2.10.9(2026-08-07)·pnpm 11.21.0으로 갱신. ① **pnpm 11 비호환 서술 정정**: "2.9.x 알려진 이슈" → **2.9.7(2026-05-01)에서 해소**(PR #12616·#12676), 대응 방법을 "업그레이드"로 교체 ② **Turborepo 2.10 신규 기능 섹션 신설**(`cacheMaxAge`/`cacheMaxSize` 로컬 캐시 자동 정리, `--affected`+`--filter` 조합, graceful shutdown, incremental task caching, boundaries 순환 의존성 탐지) ③ 소스 URL을 `turbo.build` → `turborepo.dev`로 갱신 ④ `packageManager` 예시 pnpm 11.21.0. 클레임 12건(VERIFIED 11 / DISPUTED 1 정정) | 버전 재검증 |
| 2026-09-28 | v5 | 재검증(2차) — 기준을 Turborepo 2.11.4(2026-09-24)·pnpm 12.6.0(2026-08-26 GA)으로 갱신. ① **Turborepo 2.11 신규 기능 섹션 신설**(`turbo prune --production`, Time to First Task 최대 4배, `devEngines.packageManager`, nub·aube, Rust/Python/Go 네이티브 지원 Experimental) ② **pnpm 12 섹션 신설**(breaking change 5건 + Turborepo 호환 상태, 세부 미검증 항목은 `> 주의: 미검증`으로 명시) ③ 기존 pnpm 11 섹션은 레거시로 유지(축소 없음, 제목에 "현재는 레거시" 추가) ④ `packageManager` 예시 pnpm 12.6.0으로 갱신. 클레임 4건(VERIFIED 3 / PARTIAL 1) | 재검증(2차) |
| 2026-09-28 | v5 | 2단계 실사용 테스트 재수행 (Q1 pnpm 12·`--production` prune / Q2 pnpm 11 lockfile 이슈+전환 시급성) → 1/2 PASS + 1/2 PARTIAL(버전 표기 내부 모순 발견), PENDING_TEST → **NEEDS_REVISION** 전환 (SKILL.md 미수정, 보고만 수행) | skill-tester |
| 2026-09-28 | v6 | 361행 "최신 안정 버전(2.10.9)" 표기가 "이 문서 기준 버전(2.11.4, 상단 참조)"으로 정정된 것을 확인 후 재재테스트 수행 (Q1 신규 세팅 버전 정합성·내부 모순 여부 / Q2 `turbo prune --production` 실사용) → 2/2 PASS, NEEDS_REVISION → **APPROVED** 전환 | skill-tester |
