---
skill: github-actions-visual-regression
category: devops
version: v1
date: 2026-04-29
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
| 검증일 | 2026-04-29 |
| 검증자 | Claude (Opus 4.7) |
| 스킬 버전 | v1 |

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

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (checkout@v5, cache@v4, upload-artifact@v4, github-script@v7, paths-filter@v3, comment-pr@v3)
- [✅] deprecated된 패턴을 권장하지 않음 (`pull_request_target` + 포크 체크아웃 명시적 anti-pattern으로 표기)
- [✅] 코드 예시가 실행 가능한 형태임 (전체 워크플로우 통합 예시 포함)

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
| **최종 판정** | **APPROVED** |

> 1단계(오프라인 검증) + 2단계(skill-tester content test) 모두 완료.
> 3개 실전 질문(artifact 이름 충돌 회피 / pull_request_target 위험 / 로컬 baseline false positive) 모두 PASS.
> SKILL.md에서 완전한 답변 도출 가능함이 확인되어 APPROVED 전환.

---

## 7. 개선 필요 사항

- [✅] skill-tester 호출하여 2~3개 실전 질문 수행 (2026-04-29 완료, 3/3 PASS — Q1: artifact 이름 충돌 / Q2: pull_request_target 보안 위험 / Q3: 로컬 baseline false positive)
- [⏸️] 동적 matrix 패턴(앱 5개 이상일 때) 보강 — 차단 요인 아님, 실제 필요해질 때 추가 (선택 보강)
- [⏸️] Chromatic / Percy / Argos SaaS 연동 비교 가이드 — 현재는 self-managed CI 전용, 필요 시 별도 스킬로 분리 (선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-29 | v1 | 최초 작성: 시각 회귀 CI 워크플로우 구조, paths-filter 트리거, Storybook 빌드 artifact 전달, test-runner + start-server-and-test 실행, baseline 캐시 + 별도 PR 갱신, 결과 PNG/HTML 업로드, github-script/thollander 코멘트, matrix 병렬, 6가지 anti-pattern (pull_request_target, baseline drift, 로컬 baseline, artifact 이름 충돌, 전체 브라우저 설치, retention 무제한) | Claude (Opus 4.7) |
| 2026-04-29 | v1 | 2단계 실사용 테스트 수행 (Q1: matrix artifact 이름 충돌 회피 / Q2: pull_request_target 보안 위험 및 대안 / Q3: 로컬 baseline false positive 원인과 갱신 방법) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
