---
skill: storybook-visual-testing
category: frontend
version: v1
date: 2026-04-29
status: APPROVED
---

# 스킬 검증 — storybook-visual-testing

---

## 검증 워크플로우

스킬은 **2단계 검증**을 거쳐 최종 APPROVED 상태가 됩니다.

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST  ← 지금 바로 쓸 수 있음. 내용은 신뢰 가능.

[2단계] 실제 사용 중 (온라인 검증)
  ├─ Claude CLI에서 @에이전트로 테스트 질문 수행
  ├─ 에이전트가 스킬을 올바르게 활용하는지 확인
  ├─ 잘못된 답변 발견 시 → 스킬 내용 수정 후 재테스트
  └─ 모든 테스트 케이스 PASS → 체크박스 ✅ 체크
        ↓
  최종 판정: APPROVED  ← 검증 완료
```

### 판정 상태 의미

| 상태 | 의미 | 사용 가능 여부 |
|------|------|--------------|
| `PENDING_TEST` | 내용 검증 완료, CLI 테스트 미실시 | ✅ 사용 가능 |
| `APPROVED` | 모든 검증 완료 | ✅ 사용 가능 |
| `NEEDS_REVISION` | 테스트에서 오류 발견, 수정 필요 | ⚠️ 주의해서 사용 |

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `storybook-visual-testing` |
| 스킬 경로 | `.claude/skills/frontend/storybook-visual-testing/SKILL.md` |
| 검증일 | 2026-04-29 |
| 검증자 | Claude (skill-creator) |
| 스킬 버전 | v1 |
| 대상 버전 | Storybook 10.3.x · @storybook/test-runner 0.x · Playwright v1.59.x |

---

## 1. 작업 목록 (Task List)

> 스킬 작성 전 조사한 내용과 작업 범위

- [✅] 공식 문서 1순위 소스 확인 (storybook.js.org/docs, playwright.dev/docs)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/storybookjs/test-runner)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-04-29, Storybook 10.3.x · Playwright v1.59.x)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (8개 토픽 모두 다룸)
- [✅] 코드 예시 작성 (test-runner.ts, axe-playwright 통합, postVisit 스크린샷)
- [✅] 흔한 실수 패턴 정리 (Anti-pattern 섹션 + 흔한 실수 표)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

> skill-creator 에이전트가 사용한 도구와 조사·검증 내역 기록

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | Storybook 10 Node 요구사항, test-runner preVisit/postVisit, toHaveScreenshot 옵션, 모노레포 멀티 SB, 폰트/애니메이션 anti-pattern, Chromatic·Percy vs 자체호스팅 (총 6회) | 공식 문서 + GitHub README + 외부 가이드 다수 수집 |
| 조사 | WebFetch | github.com/storybookjs/test-runner README, storybook-is-going-esm-only 블로그, playwright.dev/docs/test-snapshots, storybook docs 마이그레이션 가이드, test-runner 공식 페이지 (총 5회) | preVisit/postVisit 시그니처·deprecated 상태, ESM 요구사항, toHaveScreenshot 옵션 전체 확인 |
| 교차 검증 | WebSearch | 4개 핵심 클레임 (Node 버전, test-runner 훅, toHaveScreenshot 옵션, iframe.html 패턴) | VERIFIED 3 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

> 실제 참조한 소스와 신뢰도 기록

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Storybook 공식 - Migration Guide 10 | https://storybook.js.org/docs/releases/migration-guide | ⭐⭐⭐ High | 2026-04-29 | 공식 문서 (Node 요구사항 1차 출처) |
| Storybook 공식 - ESM-only 블로그 | https://storybook.js.org/blog/storybook-is-going-esm-only/ | ⭐⭐⭐ High | 2026-04-29 | 공식 블로그 |
| Storybook 공식 - Test Runner | https://storybook.js.org/docs/writing-tests/integrations/test-runner | ⭐⭐⭐ High | 2026-04-29 | 공식 문서 |
| Storybook 공식 - 10.3 릴리스 | https://storybook.js.org/blog/storybook-10-3/ | ⭐⭐⭐ High | 2026-04-29 | 공식 블로그 (10.3 발표) |
| Storybook 공식 - 버전 메타 | https://storybook.js.org/versions | ⭐⭐⭐ High | 2026-04-29 | 공식 (latest: 10.3.3) |
| Storybook GitHub - test-runner README | https://github.com/storybookjs/test-runner/blob/next/README.md | ⭐⭐⭐ High | 2026-04-29 | 공식 GitHub |
| Storybook GitHub - storybook 본체 | https://github.com/storybookjs/storybook/releases | ⭐⭐⭐ High | 2026-04-29 | 공식 GitHub |
| Playwright 공식 - Visual Comparisons | https://playwright.dev/docs/test-snapshots | ⭐⭐⭐ High | 2026-04-29 | 공식 문서 |
| Playwright 공식 - PageAssertions | https://playwright.dev/docs/api/class-pageassertions | ⭐⭐⭐ High | 2026-04-29 | 공식 API 문서 |
| npm - storybook | https://www.npmjs.com/package/storybook | ⭐⭐⭐ High | 2026-04-29 | npm 레지스트리 |
| npm - @storybook/test-runner | https://www.npmjs.com/package/@storybook/test-runner | ⭐⭐⭐ High | 2026-04-29 | npm 레지스트리 |
| Tiger Oakes - test-runner screenshots | https://tigeroakes.com/posts/storybook-test-runner-screenshots/ | ⭐⭐ Medium | 2026-04-29 | 외부 가이드 (보조 검증) |
| Markus Oberlehner - VRT for free | https://markus.oberlehner.net/blog/running-visual-regression-tests-with-storybook-and-playwright-for-free | ⭐⭐ Medium | 2026-04-29 | 외부 가이드 (자체호스팅 패턴) |
| TestDino - Playwright Visual Testing | https://testdino.com/blog/playwright-visual-testing/ | ⭐⭐ Medium | 2026-04-29 | 외부 가이드 (CI baseline 운영) |
| Chromatic - Percy 비교 | https://www.chromatic.com/compare/percy | ⭐⭐ Medium | 2026-04-29 | 가격·기능 비교 (벤더 자료, 편향 가능성 인지) |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Storybook 10.3.x, Playwright v1.59.x, Node 20.19+/22.12+)
- [✅] deprecated된 패턴을 권장하지 않음 (preRender/postRender → preVisit/postVisit로 안내)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (Storybook 10 ESM, test-runner 훅, toHaveScreenshot)
- [✅] 코드 예시 포함 (test-runner.ts, axe 통합, 모노레포 turbo)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함 (Anti-pattern 섹션 + 정리 표)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (Docker 명령, package.json 스크립트, turbo.json)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 — 2026-04-29 수행 (3/3 PASS)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — 2026-04-29 확인 완료
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — gap 없음, 보완 불필요

---

## 5. 테스트 진행 기록

> 실제로 어떻게 테스트했고 결과가 어떠했는지 기록

### 실제 수행 테스트

**수행일**: 2026-04-29
**수행자**: skill-tester (general-purpose 에이전트로 대체 — domain-specific frontend-developer 에이전트 미확인)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

**Q1. test-runner 훅 시그니처: preRender 사용 여부 + a11y + 스크린샷 동시 설정**
- PASS
- 근거: SKILL.md 섹션 2 "test-runner.ts 설정" (preRender/postRender deprecated 경고, preVisit/postVisit 시그니처), 섹션 3 "axe-playwright로 a11y 자동 검증" (preVisit injectAxe + postVisit checkA11y 완전 코드 예시), 섹션 4 패턴 A (postVisit에서 waitForPageReady + toHaveScreenshot + animations: 'disabled'), 섹션 9 흔한 실수 표
- 상세: preRender deprecated 경고가 섹션 2와 섹션 9 두 군데 명시되어 있어 함정 회피 명확. a11y + 스크린샷 동시 설정 코드가 완전한 예시로 존재함.

**Q2. macOS 로컬 baseline vs CI Linux 1px 깨짐 해결**
- PASS
- 근거: SKILL.md 섹션 5 "Baseline 운영 정책 — 환경 일관성" (OS별 파일명 차이 설명, Docker 명령어 예시, macOS 로컬 PNG git commit 금지 규칙), 섹션 9 흔한 실수 표 (macOS 로컬 → Docker/CI 러너 baseline 생성)
- 상세: 원인(폰트 렌더링·서브픽셀 위치·안티앨리어싱 OS별 차이)과 해결책(Docker `mcr.microsoft.com/playwright:v1.59.1-jammy`) 모두 SKILL.md에 명확히 기술됨.

**Q3. 자체 호스팅 vs Chromatic/SaaS 선택 기준 (판단형)**
- PASS
- 근거: SKILL.md 섹션 8 "외부 SaaS(Chromatic·Percy) vs 자체 호스팅 비교" (7개 항목 비교 표, 자체 호스팅 선택 이유 4가지, SaaS 선택 신호 3가지), 서두 "언제 사용하지 않는가" 섹션
- 상세: 중립적 비교 표와 각각의 적합 시그널이 상세히 기술되어 있어 판단형 질문에 근거 기반 답변 도출 가능. 벤더 편향 없는 서술.

### 발견된 gap

없음 — 3/3 모두 PASS, SKILL.md 보강 권장 항목 없음.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 해당 없음 (빌드 설정/워크플로우/설정+실행/마이그레이션 카테고리 아님)
- 최종 상태: APPROVED

---

### 교차 검증 1 (skill-creator 수행): Storybook 10 Node.js 요구사항 (DISPUTED → 정정 후 작성)

**클레임:** Storybook 10은 Node.js 20.19+ 또는 22.12+를 요구한다

**검증 소스:**
- 공식 마이그레이션 가이드 (`storybook.js.org/docs/releases/migration-guide`): "Node 20.19+ or 22.12+ is required"
- ESM-only 공식 블로그 (`storybook.js.org/blog/storybook-is-going-esm-only/`): "Node.js version that supports `require()` of ESM, these are 20.16, 22.19, 24 or higher"
- 외부 블로그(Onix React, nikosmastragelis.dev): "20.16+/22.19+/24+" 표기

**판정:** **DISPUTED** — 공식 마이그레이션 가이드와 공식 ESM 블로그가 서로 다른 minor 버전을 명시한다.
- 마이그레이션 가이드(20.19+/22.12+)는 **Storybook이 직접 강제하는 최소 버전**으로 해석됨 (사용자 요구사항도 이 값)
- ESM 블로그(20.16+/22.19+/24+)는 **Node.js 자체가 require(esm)을 안정적으로 지원하는 버전대**를 설명한 것으로 보임
- SKILL.md는 사용자 요구사항이자 마이그레이션 가이드 기준인 **20.19+/22.12+**로 작성하고, "20.16+/22.19+ 표기 출처가 있음"을 `> 주의:` 표기로 명시함

---

### 교차 검증 2: test-runner preVisit/postVisit 훅 (preRender/postRender deprecated)

**클레임:** 신규 코드는 `preVisit`/`postVisit`을 사용해야 하며, `preRender`/`postRender`는 deprecated다.

**검증 소스:**
- 공식 GitHub README (`github.com/storybookjs/test-runner/blob/next/README.md`): 명시적으로 "preRender (deprecated) preVisit · postRender (deprecated) postVisit"
- 공식 Storybook docs - test-runner: `preVisit`/`postVisit` 훅 시그니처 그대로 안내
- 외부 가이드(Sauce Labs, BrowserStack): preVisit/postVisit 패턴 사용

**판정:** **VERIFIED** — 공식 GitHub README + 공식 docs + 외부 신뢰 소스 모두 일치

---

### 교차 검증 3: Playwright toHaveScreenshot 옵션 시그니처

**클레임:** toHaveScreenshot은 mask, stylePath, threshold, maxDiffPixels, maxDiffPixelRatio, animations, fullPage, clip 옵션을 제공한다.

**검증 소스:**
- 공식 Playwright docs (`playwright.dev/docs/test-snapshots`): mask, stylePath, threshold, maxDiffPixels 등 옵션 전체 확인
- 공식 PageAssertions API (`playwright.dev/docs/api/class-pageassertions`): 시그니처 일치
- TestDino 가이드: 동일 옵션 설명, "default threshold 0.2" 일치
- microsoft/playwright Issue #30112: maxDiffPixels/maxDiffPixelRatio가 함께 작동(OR 조건) 인지

**판정:** **VERIFIED** — 공식 문서 2곳 + 외부 가이드에서 일치

---

### 교차 검증 4: Storybook iframe.html 단일 스토리 URL 패턴

**클레임:** Storybook은 `/iframe.html?id={story-id}&viewMode=story`로 단일 스토리를 격리 렌더링한다.

**검증 소스:**
- Storybook GitHub Discussion #24835 (공식 디스커션): iframe.html 패턴 활용 사례
- Markus Oberlehner 블로그: `iframe.html?id=${storyId}&viewMode=story` 직접 사용
- pow.rs 가이드: 동일 패턴
- Tiger Oakes 가이드: index.json + iframe.html 조합

**판정:** **VERIFIED** — 외부 신뢰 소스 4곳에서 일치 (공식 docs는 직접 명시는 없으나 Storybook 내부 동작이며 빌드 산출물 구조에서 확인 가능)

---

### 테스트 진행 기록 (실사용 테스트 — 완료)

**상태:** 2026-04-29 skill-tester 수행 완료 (3/3 PASS → APPROVED 전환)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-04-29) |
| **최종 판정** | **APPROVED** |

> 1단계(오프라인 검증) 완료. 공식 문서 기반으로 작성되었으며 핵심 클레임 4건 중 3건 VERIFIED, 1건 DISPUTED는 정정 후 `> 주의:` 표기로 반영. 2026-04-29 skill-tester로 2단계 실사용 테스트 수행 완료 (Q1 preRender deprecated 함정 / Q2 OS baseline 일관성 / Q3 SaaS vs 자체 호스팅 의사결정 — 3/3 PASS).

---

## 7. 개선 필요 사항

> 검증 과정에서 발견된 문제점 및 TODO

- [✅] skill-tester로 실사용 테스트 3건 수행 후 APPROVED 전환 (2026-04-29 완료, 3/3 PASS)
- [📅] Storybook 10.4 stable 릴리스 시 변경점 모니터링 (현재 next: 10.4.0-alpha.3) — 선택 보강 항목, 차단 요인 아님
- [📅] @storybook/test-runner의 Vitest addon 대체 흐름 모니터링 — 공식 docs가 Vite 기반 SB에 Vitest addon 권장 시작. Playwright 기반 시각 회귀가 그래도 표준이지만, 차후 Vitest browser mode + visual 테스트로 대체될 가능성 있음. 선택 보강 항목, 차단 요인 아님
- [⏸️] DISPUTED였던 Node 버전(20.16+/22.19+ vs 20.19+/22.12+)의 정확한 차이 출처를 Storybook 코어 팀이 명확화하면 SKILL.md 재정리 — 선택 보강 항목, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-29 | v1 | 최초 작성 — Storybook 10.3 + @storybook/test-runner + Playwright v1.59.x 기준, 8개 필수 토픽 모두 포함, 핵심 클레임 4건 교차 검증 (VERIFIED 3 / DISPUTED 1) | Claude (skill-creator) |
| 2026-04-29 | v1 | 2단계 실사용 테스트 수행 (Q1 preRender deprecated 함정 + a11y/스크린샷 동시 설정 / Q2 macOS baseline vs CI Linux 1px 깨짐 / Q3 자체 호스팅 vs Chromatic 의사결정) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
