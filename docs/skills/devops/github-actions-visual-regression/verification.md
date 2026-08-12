---
skill: github-actions-visual-regression
category: devops
version: v1.1
date: 2026-08-11
status: APPROVED
---

# 스킬 검증 문서: github-actions-visual-regression

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

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `github-actions-visual-regression` |
| 스킬 경로 | `.claude/skills/devops/github-actions-visual-regression/SKILL.md` |
| 최초 검증일 | 2026-04-29 |
| 최종 재검증일 | 2026-08-11 (액션 메이저 버전·checkout v7 보안 기본값 반영) |
| 검증자 | Claude (Opus 4.7 최초 / Opus 5 재검증) |
| 스킬 버전 | v1.1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.github.com, storybook.js.org)
- [✅] 공식 GitHub 2순위 소스 확인 (storybookjs/test-runner, actions/cache, actions/upload-artifact, actions/checkout)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-04-29)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (8토픽 모두 커버)
- [✅] 코드 예시 작성 (전체 워크플로우 + 각 토픽별 단편 예시)
- [✅] 흔한 실수 패턴 정리 (6가지 anti-pattern)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

> skill-creator 에이전트가 사용한 도구와 조사·검증 내역 기록

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 형식 참조 | Read | `.claude/skills/devops/github-actions/SKILL.md` | 형식·구조 일관성 확보용 기존 devops 스킬 확인 |
| 형식 참조 | Read | `docs/skills/devops/github-actions/verification.md` | verification.md 8섹션 구조 확인 |
| 템플릿 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 검증 문서 템플릿 구조 확인 |
| 조사 1 | WebSearch | `actions/checkout v5 latest release 2026` | actions/checkout v6도 출시되었으나 v5도 안정. 본 스킬은 기존 devops 스킬과 일관되게 v5 사용 |
| 조사 2 | WebSearch | `actions/upload-artifact v4 latest release path retention-days` | upload-artifact@v4 사양 확인 (path 필수, retention 1~90일 default 90, v4부터 동일이름 덮어쓰기 불가) |
| 조사 3 | WebSearch | `actions/cache v4 latest release github 2026` | cache v5 출시(Node 24)되었으나 v4도 안정 사용. 기존 스킬과 일관되게 v4 사용 |
| 조사 4 | WebSearch | `storybook test-runner CI playwright start-server-and-test storybook-deployed` | test-storybook + start-server-and-test/concurrently+wait-on 두 가지 패턴 확인. TARGET_URL 사용한 deployed Storybook 패턴 확인 |
| 조사 5 | WebSearch | `pull_request_target security risk pwn permissions github actions` | GitHub Security Lab의 pwn requests 권고 확인. base 컨텍스트에서 시크릿/write 노출 |
| 조사 6 | WebSearch | `dorny/paths-filter v3 v4 latest version github` | v4가 최신(Node 24). v3도 안정. 본 스킬은 v3 사용 (다른 스킬과 일관) |
| 조사 7 | WebSearch | `thollander/actions-comment-pull-request v3 latest release github` | v3.0.1이 최신. comment-tag로 갱신 가능 |
| 조사 8 | WebSearch | `storybook test-runner playwright install --with-deps chromium CI github actions example` | `npx playwright install --with-deps chromium`으로 chromium만 설치하는 패턴 확인 |
| 상세 조사 | WebFetch | `github.com/storybookjs/test-runner` README | deployed Storybook 패턴 + concurrently+http-server+wait-on 패턴 + maxWorkers=2 권고 확인 |
| 교차 검증 1 | WebSearch | `pull_request_target` 보안 이슈 | VERIFIED: 다수 소스(GitHub Security Lab, Sysdig, Wiz, Orca)에서 pwn requests 위험 확인 |
| 교차 검증 2 | WebSearch | upload-artifact@v4 동일이름 덮어쓰기 | VERIFIED: v4는 immutable artifact (이전 v3는 append 가능했음) |
| 교차 검증 3 | WebSearch | playwright `--with-deps chromium` 명령어 | VERIFIED: 공식 문서 및 다수 가이드에서 동일 사용법 확인 |
| 교차 검증 4 | WebSearch | start-server-and-test vs concurrently+wait-on | VERIFIED: 양쪽 모두 공식 문서/커뮤니티에서 권장. 본 스킬은 더 단순한 start-server-and-test 우선 |

### 재검증 로그 (2026-08-11)

> 2026-04-29 작성 시점에는 "v5/v4 LTS 라인 유지"가 의도적 선택이었으나, 2026-06-18 checkout v7의 **보안 기본값 변경**과
> 2026-07-20 백포트로 그 전제가 무효화되어 최신 메이저 기준으로 재작성함.

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 재조사 1 | WebSearch | `actions/checkout v7 release notes 2026` | v7 GA 2026-06-18, 포크 PR 체크아웃 기본 차단, 백포트 2026-07-20 확인 |
| 재조사 2 | WebSearch | `GitHub changelog "Safer pull_request_target defaults" checkout` | 공식 changelog + 독립 보안 매체 보도로 교차 확인 |
| 재조사 3 | WebFetch | github.blog changelog 2026-06-18 (공식 원문) | 차단 이벤트(`pull_request_target`, `workflow_run` of `pull_request*`), 차단 입력 패턴, `allow-unsafe-pr-checkout` 예외 확인 |
| 재조사 4 | WebFetch | checkout releases (HTML + API) + README | v7.0.1 = 2026-07-20, 백포트 라인 v2.8.0~v6.1.0, README 예시 `@v7`, 예외 입력 기본 `false` 확인 |
| 재조사 5 | WebFetch | upload-artifact releases API + README | v7.0.1 최신, v7.0.0에서 ESM·`archive: false` 직접 업로드 추가, artifact immutable·`overwrite` 유지 확인 |
| 재조사 6 | WebFetch | download-artifact releases API + README | v8.0.1 최신, `pattern`·`merge-multiple` 유지, `digest-mismatch` 기본 `error`, `skip-decompress` 신설 확인 |
| 재조사 7 | WebFetch | cache / setup-node / github-script releases API + README | cache v6.1.0, setup-node v7.0.0, github-script v9.0.0 및 각 breaking change 확인 |
| 재조사 8 | WebFetch | paths-filter / pnpm-action-setup / create-pull-request / comment-pull-request releases API | paths-filter v4.0.3, pnpm/action-setup v6.0.10, create-pull-request v8.1.1, comment-pull-request v3.0.1(변동 없음) 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| GitHub Actions 공식 문서 | https://docs.github.com/en/actions | ⭐⭐⭐ High | 2026-04 | 공식 문서 (1순위) |
| Storybook Test Runner 공식 가이드 | https://storybook.js.org/docs/writing-tests/integrations/test-runner | ⭐⭐⭐ High | 2026-04 | 공식 문서 |
| Storybook Testing in CI | https://storybook.js.org/docs/writing-tests/in-ci | ⭐⭐⭐ High | 2026-04 | 공식 문서 |
| storybookjs/test-runner GitHub | https://github.com/storybookjs/test-runner | ⭐⭐⭐ High | 2026-04 | 공식 GitHub README |
| actions/checkout GitHub | https://github.com/actions/checkout | ⭐⭐⭐ High | 2026-04 | 공식 GitHub (v5/v6) |
| actions/cache GitHub | https://github.com/actions/cache | ⭐⭐⭐ High | 2026-04 | 공식 GitHub (v4/v5) |
| actions/upload-artifact GitHub | https://github.com/actions/upload-artifact | ⭐⭐⭐ High | 2026-04 | 공식 GitHub (v4) |
| GitHub Security Lab — pwn requests | https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/ | ⭐⭐⭐ High | 2026-04 | 공식 보안 가이드 |
| Sysdig — Insecure GitHub Actions | https://www.sysdig.com/blog/insecure-github-actions-found-in-mitre-splunk-and-other-open-source-repositories | ⭐⭐ Medium | 2026-04 | 보안 회사 블로그 (교차검증용) |
| Wiz — Hardening GitHub Actions | https://www.wiz.io/blog/github-actions-security-guide | ⭐⭐ Medium | 2026-04 | 보안 회사 블로그 (교차검증용) |
| dorny/paths-filter GitHub | https://github.com/dorny/paths-filter | ⭐⭐ Medium | 2026-04 | 커뮤니티 액션 (Stars 1k+, v3/v4) |
| thollander/actions-comment-pull-request | https://github.com/thollander/actions-comment-pull-request | ⭐⭐ Medium | 2026-04 | 커뮤니티 액션 (v3.0.1) |
| Playwright CI docs | https://playwright.dev/docs/ci-intro | ⭐⭐⭐ High | 2026-04 | 공식 문서 |

### 재검증 추가 소스 (2026-08-11)

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Safer pull_request_target defaults (공식 changelog) | https://github.blog/changelog/2026-06-18-safer-pull_request_target-defaults-for-github-actions-checkout/ | ⭐⭐⭐ High | 2026-06-18 | 1순위 — 보안 기본값 변경 원문 |
| actions/checkout README + releases | https://github.com/actions/checkout | ⭐⭐⭐ High | 2026-08 | v7.0.1, `allow-unsafe-pr-checkout` 기본 false |
| actions/upload-artifact README + releases | https://github.com/actions/upload-artifact | ⭐⭐⭐ High | 2026-08 | v7.0.1, `archive`·`overwrite`, immutable artifact |
| actions/download-artifact README + releases | https://github.com/actions/download-artifact | ⭐⭐⭐ High | 2026-08 | v8.0.1, `digest-mismatch` 기본 error |
| actions/cache releases | https://github.com/actions/cache | ⭐⭐⭐ High | 2026-08 | v6.1.0 |
| actions/setup-node README + releases | https://github.com/actions/setup-node | ⭐⭐⭐ High | 2026-08 | v7.0.0 |
| actions/github-script README + releases | https://github.com/actions/github-script | ⭐⭐⭐ High | 2026-08 | v9.0.0 (ESM, Node 24, 러너 2.327.1+) |
| pnpm/action-setup README | https://github.com/pnpm/action-setup | ⭐⭐ Medium | 2026-08 | v6.0.10, pnpm v11+는 pnpm/setup 권장 |
| peter-evans/create-pull-request releases | https://github.com/peter-evans/create-pull-request | ⭐⭐ Medium | 2026-08 | v8.1.1 |
| The Hacker News — checkout pwn request 차단 보도 | https://thehackernews.com/2026/06/github-updates-actionscheckout-to-block.html | ⭐⭐ Medium | 2026-06 | 독립 교차 검증용 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (2026-08-11 갱신: checkout@v7, cache@v6, upload-artifact@v7, download-artifact@v8, setup-node@v7, github-script@v9, paths-filter@v4, pnpm/action-setup@v6, create-pull-request@v8, comment-pr@v3)
- [✅] deprecated된 패턴을 권장하지 않음 (`pull_request_target` + 포크 체크아웃 명시적 anti-pattern으로 표기)
- [✅] 코드 예시가 실행 가능한 형태임 (전체 워크플로우 통합 예시 포함)
- [✅] 보안 기본값 변경 반영 (checkout v7 포크 PR 체크아웃 기본 차단 + 2026-07-20 백포트로 기존 워크플로우가 버전 고정 없이도 실패할 수 있음을 명시)

### 4-1-1. 재검증 클레임 판정 (2026-08-11)

| # | 클레임 | 소스 수 | 판정 |
|---|--------|:---:|------|
| 1 | `actions/checkout` 최신은 v7.0.1(2026-07-20), v7.0.0 GA는 2026-06-18 | 3 (changelog·releases HTML·API) | VERIFIED |
| 2 | v7은 `pull_request_target`·`workflow_run`(pull_request 계열)에서 포크 PR 코드 체크아웃을 기본 차단 | 3 (changelog·README·독립 보도) | VERIFIED |
| 3 | 차단 입력은 포크 `repository:`, `refs/pull/<n>/head|merge`, 포크 head/merge SHA | 2 (changelog·README) | VERIFIED |
| 4 | 예외 입력 `allow-unsafe-pr-checkout` 기본값 `false` | 2 (README·릴리스 노트) | VERIFIED |
| 5 | 2026-07-20 백포트로 v2~v6 부동 태그도 영향, SHA/마이너 핀은 미적용, v1 제외 | 2 (changelog·releases 목록) | VERIFIED |
| 6 | `upload-artifact` 최신 메이저 v7(7.0.1) — v7.0.0에서 ESM + `archive: false` 직접 업로드 도입 | 2 (releases API·README) | VERIFIED |
| 7 | artifact immutable(동일 이름 다중 업로드 불가)은 v7에서도 유지, `overwrite` 입력 존재 | 2 (README·기존 v1 검증 기록) | VERIFIED |
| 8 | `download-artifact` 최신 메이저 v8(8.0.1) — `pattern`·`merge-multiple` 유지, `digest-mismatch` 기본 `error`, 자동 압축 해제 유지 | 2 (releases API·README) | VERIFIED |
| 9 | `github-script` v9는 `require('@actions/github')` 불가(ESM) + `getOctokit` 재선언 시 SyntaxError, v8부터 Node 24·러너 2.327.1+ | 2 (releases API·README) | VERIFIED |
| 10 | cache v6.1.0 / setup-node v7.0.0 / paths-filter v4.0.3 / pnpm-action-setup v6.0.10 / create-pull-request v8.1.1 / comment-pull-request v3.0.1 | 2 (releases API·README) | VERIFIED |

DISPUTED / UNVERIFIED 항목: 없음.

> 참고: 2026-04-29 판정 중 "각 액션의 신규 메이저는 출시됐으나 v5/v4 LTS 라인을 유지한다"는 서술은
> checkout v7 보안 백포트(2026-07-20)로 **더 이상 안전한 선택이 아니게 되어** 최신 메이저 기준으로 교체됨.

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일(2026-04-29) 명시
- [✅] 핵심 개념 설명 포함 (시각 회귀 CI의 일반 CI 대비 특수성, 워크플로우 구조도)
- [✅] 코드 예시 포함 (10개 섹션, 단편 + 전체 통합 예시)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (Chromatic/Percy/Argos SaaS와의 비교 포함)
- [✅] 흔한 실수 패턴 포함 (6가지 anti-pattern: pull_request_target, baseline drift, 로컬 baseline, artifact 이름 충돌, 모든 브라우저 설치, retention 무제한)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 워크플로우 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (storybook-mui, storybook-radix 양쪽 매트릭스 실제 사례)
- [✅] 범용적으로 사용 가능 (프로젝트 맥락 반영하되 구조 자체는 일반적)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] skill-tester 호출 완료 (2026-04-29, general-purpose 에이전트로 대체 수행)
- [✅] 테스트 질문 3개 수행 결과 반영 (3/3 PASS)
- [✅] 잘못된 응답 없음 — SKILL.md 내용으로 모든 질문에 완전한 답변 도출 가능

---

## 5. 테스트 진행 기록

**수행일**: 2026-04-29
**수행자**: skill-tester → general-purpose (devops-engineer 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. matrix 잡에서 upload-artifact@v4를 쓸 때 artifact 이름 충돌을 피하려면?**
- PASS
- 근거: SKILL.md "3. Storybook 빌드 + 정적 호스팅" 섹션 핵심 포인트 및 "8-4. artifact 이름 충돌" anti-pattern 섹션
- 상세: v4부터 동일 이름 덮어쓰기 불가 → `name: storybook-static-${{ matrix.app }}` 처럼 matrix 변수를 이름에 포함해야 함. 섹션 8-4에서 고정 이름(금지) vs `${{ matrix.app }}` 포함(권장) 코드 예시 모두 제공됨. 근거 명확.

**Q2. 포크 PR에서 시각 회귀를 실행할 때 pull_request_target을 쓰면 안 되는 이유와 올바른 대안은?**
- PASS
- 근거: SKILL.md "2. 트리거" 섹션 주의사항 및 "8-1. pull_request_target으로 시각 회귀 실행" anti-pattern 섹션
- 상세: `pull_request_target`은 base repo 컨텍스트에서 실행되어 시크릿·write 권한이 노출되며, 포크 코드 체크아웃 시 RCE로 이어짐("pwn requests"). 올바른 대안(pull_request 사용, write 권한 필요 시 workflow_run + 격리 환경)까지 명시. GitHub Security Lab 공식 권고 인용 포함.

**Q3. "baseline을 로컬 macOS에서 생성해서 커밋했더니 CI에서 모든 스크린샷이 실패한다" — 원인과 올바른 갱신 방법은?**
- PASS
- 근거: SKILL.md "5. baseline 캐시: 갱신은 별도 PR로 분리" 섹션 주의사항 및 "8-3. 로컬에서 생성한 baseline을 커밋" anti-pattern 섹션
- 상세: macOS와 Ubuntu(GitHub-hosted runner)의 폰트 렌더링 차이(anti-aliasing, sub-pixel hinting)로 false positive 발생. 해결책: CI(Ubuntu)에서만 baseline 생성, `vrt-update-baseline` workflow_dispatch 워크플로우로 별도 PR 생성(peter-evans/create-pull-request@v7). 로컬 확인 시 Docker 이미지(`mcr.microsoft.com/playwright:v1.x-jammy`) 사용 방법도 제공.

### 발견된 gap

- 없음. 3개 질문 모두 SKILL.md에서 완전한 답변 도출 가능.

### 재검증 회귀 확인 (2026-08-11)

**수행일**: 2026-08-11
**수행자**: 스킬 최신화 에이전트 (2026-04-29 skill-tester content test 3/3 PASS 위에 얹는 회귀 확인)
**수행 방법**: 액션 메이저 버전·보안 기본값 갱신 후 기존 질문 3건 재확인 + 신규 보안 질문 1건 추가

- Q1 재확인 (matrix artifact 이름 충돌) — PASS. `upload-artifact@v7`로 갱신됐지만 immutable artifact 제약은 그대로라 `name: storybook-static-${{ matrix.app }}` 해법이 동일하게 도출됨. 갱신본에는 `overwrite: true` 대안과 `archive: false`를 디렉토리에 쓰지 말라는 단서까지 추가됨.
- Q2 재확인 (pull_request_target 위험과 대안) — PASS. 기존 서술에 더해, v7이 이 패턴을 액션 차원에서 차단하며 백포트로 기존 워크플로우도 실패할 수 있다는 점, `allow-unsafe-pr-checkout`를 켜는 것이 해법이 아니라는 점까지 도출 가능.
- Q3 재확인 (로컬 macOS baseline false positive) — PASS. 원인·해법 서술은 이번 갱신 범위 밖이라 그대로 유효하며, 갱신 워크플로우의 PR 생성 액션만 `peter-evans/create-pull-request@v8`로 이동.
- Q4 (신규) "`pull_request_target` 시각 회귀 워크플로우가 액션 버전을 바꾸지 않았는데 2026-07-20 이후 갑자기 실패한다" — PASS. 헤더 보안 경고 + 섹션 2 주의 블록에서 백포트로 인한 부동 태그 자동 적용이라는 원인과 `pull_request` 분리 대응을 도출 가능.

재검증 회귀 확인: 4/4 PASS

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: "워크플로우/CI 설정" 성격이나, 사용자 지정에 따라 content test PASS시 APPROVED 전환 가능
- 최종 상태: APPROVED

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-29, 3/3 PASS) |
| 최신성 재검증 | ✅ (2026-08-11, 클레임 10건 전부 VERIFIED / 회귀 확인 4/4 PASS) |
| **최종 판정** | **APPROVED** (유지) |

> 1단계(오프라인 검증) + 2단계(skill-tester content test) 모두 완료.
> 3개 실전 질문(artifact 이름 충돌 회피 / pull_request_target 위험 / 로컬 baseline false positive) 모두 PASS.
> SKILL.md에서 완전한 답변 도출 가능함이 확인되어 APPROVED 전환.
>
> 2026-08-11 재검증: 액션 메이저 버전 갱신 + `actions/checkout` v7 보안 기본값(포크 PR 체크아웃 차단·2026-07-20 백포트)을
> 본문에 반영해 불일치 해소. 상태는 APPROVED 유지.

---

## 7. 개선 필요 사항

- [✅] skill-tester 호출하여 2~3개 실전 질문 수행 (2026-04-29 완료, 3/3 PASS — Q1: artifact 이름 충돌 / Q2: pull_request_target 보안 위험 / Q3: 로컬 baseline false positive)
- [⏸️] 동적 matrix 패턴(앱 5개 이상일 때) 보강 — 차단 요인 아님, 실제 필요해질 때 추가 (선택 보강)
- [⏸️] Chromatic / Percy / Argos SaaS 연동 비교 가이드 — 현재는 self-managed CI 전용, 필요 시 별도 스킬로 분리 (선택 보강)
- [✅] 액션 메이저 버전·checkout v7 보안 기본값 반영 (2026-08-11)
- [✅] `references/REFERENCE.md`의 액션 버전 표기(섹션 8-1 anti-pattern 예시·섹션 10 전체 워크플로우 예시)를 SKILL.md와 동기화 (2026-08-11 완료 — checkout v5→v7, upload-artifact v4→v7, download-artifact v4→v8, cache v4→v6, setup-node v4→v7, pnpm/action-setup v4→v6, paths-filter v3→v4. thollander/actions-comment-pull-request@v3은 SKILL.md와 이미 일치하여 유지)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-29 | v1 | 최초 작성: 시각 회귀 CI 워크플로우 구조, paths-filter 트리거, Storybook 빌드 artifact 전달, test-runner + start-server-and-test 실행, baseline 캐시 + 별도 PR 갱신, 결과 PNG/HTML 업로드, github-script/thollander 코멘트, matrix 병렬, 6가지 anti-pattern (pull_request_target, baseline drift, 로컬 baseline, artifact 이름 충돌, 전체 브라우저 설치, retention 무제한) | Claude (Opus 4.7) |
| 2026-04-29 | v1 | 2단계 실사용 테스트 수행 (Q1: matrix artifact 이름 충돌 회피 / Q2: pull_request_target 보안 위험 및 대안 / Q3: 로컬 baseline false positive 원인과 갱신 방법) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-08-11 | v1.1 | 최신화: "v5/v4 LTS 라인 유지" 전제 폐기 후 최신 메이저로 갱신(checkout v5→v7, cache v4→v6, upload-artifact v4→v7, download-artifact v4→v8, setup-node v4→v7, github-script v7→v9, paths-filter v3→v4, pnpm/action-setup v4→v6, create-pull-request v7→v8). checkout v7 포크 PR 체크아웃 기본 차단·2026-07-20 백포트 경고 추가, download-artifact v8 `digest-mismatch`·github-script v9 ESM 주의 추가. 클레임 10건 교차 검증 전부 VERIFIED, 회귀 확인 4/4 PASS. status APPROVED 유지 | Claude (Opus 5) |
