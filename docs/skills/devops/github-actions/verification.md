---
skill: github-actions
category: devops
version: v1.2
date: 2026-08-11
status: APPROVED
---

# 스킬 검증 문서: github-actions

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

> **PENDING_TEST 스킬도 사용에 문제없습니다.** 공식 문서 기반으로 작성되었으므로 내용은 신뢰할 수 있습니다.
> 사용 중 틀린 답변이 나오면 그때 스킬을 수정하고 verification.md를 업데이트하세요.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `github-actions` |
| 스킬 경로 | `.claude/skills/devops/github-actions/SKILL.md` |
| 최초 검증일 | 2026-04-20 |
| 최종 재검증일 | 2026-08-11 (액션 메이저 버전·checkout v7 보안 기본값 반영) |
| 검증자 | Claude (Opus 4.6 최초 / Opus 5 재검증) |
| 스킬 버전 | v1.2 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인
- [✅] 공식 GitHub 2순위 소스 확인
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-04-20)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | `GitHub Actions workflow syntax reference site:docs.github.com` | 워크플로우 문법 공식 문서 URL 10건 수집 |
| 조사 2 | WebSearch | `GitHub Actions events triggers push pull_request workflow_dispatch schedule site:docs.github.com` | 이벤트 트리거 공식 문서 URL 10건 수집 |
| 조사 3 | WebSearch | `GitHub Actions cache actions/cache setup-node cache pnpm site:docs.github.com` | 캐싱 전략 공식 문서 URL 10건 수집 |
| 조사 4 | WebSearch | `GitHub Actions reusable workflows composite actions site:docs.github.com` | 재사용 워크플로우 및 Composite 액션 문서 수집 |
| 조사 5 | WebSearch | `GitHub Actions secrets environments deployment protection rules site:docs.github.com` | 시크릿 관리 및 환경 보호 규칙 문서 수집 |
| 조사 6 | WebSearch | `GitHub Actions Docker build push container registry GHCR site:docs.github.com` | Docker 빌드/푸시 워크플로우 문서 수집 |
| 조사 7 | WebSearch | `GitHub Actions matrix strategy include exclude fail-fast site:docs.github.com` | 매트릭스 빌드 공식 문서 수집 |
| 조사 8 | WebSearch | `GitHub Actions monorepo paths filter dorny paths-filter` | dorny/paths-filter v3 모노레포 패턴 수집 |
| 조사 9 | WebSearch | `GitHub Actions Rust CI cargo check clippy Swatinem rust-cache` | Rust CI 패턴 및 rust-cache v2 정보 수집 |
| 상세 조사 1 | WebFetch | `docs.github.com/.../workflow-syntax-for-github-actions` | 워크플로우 문법 전체 참조: on, jobs, steps, matrix, concurrency, permissions 등 |
| 상세 조사 2 | WebFetch | `docs.github.com/.../events-that-trigger-workflows` | push, pull_request, workflow_dispatch, schedule, workflow_call 상세 설정 및 YAML 예시 |
| 상세 조사 3 | WebFetch | `docs.github.com/.../dependency-caching` | actions/cache@v4 키 매칭 순서, 캐시 제한 (10GB, 7일), 퇴거 정책, setup-* 액션 연동 |
| 상세 조사 4 | WebFetch | `docs.github.com/.../publishing-docker-images` | GHCR 빌드/푸시 전체 워크플로우, docker/login-action, metadata-action, build-push-action 예시 |
| 상세 조사 5 | WebFetch | `docs.github.com/.../using-secrets-in-github-actions` | 시크릿 레벨 (repo/env/org), CLI 생성, 워크플로우 사용법, 제한사항, 48KB 제한 |
| 상세 조사 6 | WebFetch | `docs.github.com/.../creating-a-composite-action` | Composite action 구조 (action.yml), inputs/outputs, runs.steps, 사용 예시 |
| 교차 검증 1 | WebSearch | `GitHub Actions cache 10GB limit 7 day eviction actions/cache v4` | VERIFIED: 기본 10GB, 7일 미접근 캐시 삭제, 최대 10TB 증가 가능 확인 |
| 교차 검증 2 | WebSearch | `Swatinem rust-cache v2 latest version` | VERIFIED: v2.9.0 최신, Cargo.lock/Cargo.toml 해시 기반 캐시 키 자동 생성 확인 |
| 교차 검증 3 | WebSearch | `dorny paths-filter v3 latest version monorepo` | VERIFIED: v3 안정 (v4도 존재), 잡/스텝 레벨 조건부 실행 지원 확인 |

### 재검증 로그 (2026-08-11)

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 재조사 1 | WebSearch | `actions/checkout v7 release notes 2026` | v7 GA 2026-06-18, 포크 PR 체크아웃 기본 차단, 백포트 시행일 2026-07-20로 연기됨 확인 |
| 재조사 2 | WebSearch | `GitHub changelog "Safer pull_request_target defaults" checkout` | 동일 changelog + 보안 매체(The Hacker News 등) 다수 보도 확인 |
| 재조사 3 | WebFetch | github.blog changelog 2026-06-18 (공식) | 차단 대상 이벤트·차단 입력 패턴(포크 `repository:`, `refs/pull/*/head|merge`, 포크 head/merge SHA)·`allow-unsafe-pr-checkout` 예외 입력 확인 |
| 재조사 4 | WebFetch | `github.com/actions/checkout/releases` (HTML) | v7.0.1·v6.1.0·v5.1.0·v4.4.0·v3.7.0·v2.8.0 백포트 릴리스 목록 확인 |
| 재조사 5 | WebFetch | `api.github.com/repos/actions/checkout/releases` | tag/published_at 확인: v7.0.1 = 2026-07-20, v7.0.0 = 2026-06-18 |
| 재조사 6 | WebFetch | `raw.githubusercontent.com/actions/checkout/main/README.md` | README 예시가 `@v7`, `allow-unsafe-pr-checkout` 기본값 `false` 확인 |
| 재조사 7 | WebFetch | upload/download-artifact releases API + README | upload-artifact v7.0.1(v7.0.0 ESM·`archive` 입력), download-artifact v8.0.1(`digest-mismatch` 기본 error, `skip-decompress`) 확인 |
| 재조사 8 | WebFetch | cache / setup-node / github-script releases API + README | cache v6.1.0, setup-node v7.0.0, github-script v9.0.0 최신 확인 |
| 재조사 9 | WebFetch | paths-filter / pnpm-action-setup / rust-cache releases API + README | paths-filter v4.0.3(Node 24 breaking), pnpm/action-setup v6.0.10(`version` 조건부 선택), rust-cache v2.9.2 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| GitHub Actions 공식 문서 | https://docs.github.com/en/actions | ⭐⭐⭐ High | 2026-04 | 공식 문서 (1순위) |
| Workflow Syntax Reference | https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions | ⭐⭐⭐ High | 2026-04 | 공식 문서 |
| Events that trigger workflows | https://docs.github.com/actions/learn-github-actions/events-that-trigger-workflows | ⭐⭐⭐ High | 2026-04 | 공식 문서 |
| Dependency caching reference | https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching | ⭐⭐⭐ High | 2026-04 | 공식 문서 |
| Using secrets in GitHub Actions | https://docs.github.com/actions/security-guides/using-secrets-in-github-actions | ⭐⭐⭐ High | 2026-04 | 공식 문서 |
| Publishing Docker images | https://docs.github.com/en/actions/publishing-packages/publishing-docker-images | ⭐⭐⭐ High | 2026-04 | 공식 문서 |
| Creating a composite action | https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-composite-action | ⭐⭐⭐ High | 2026-04 | 공식 문서 |
| Deployments and environments | https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments | ⭐⭐⭐ High | 2026-04 | 공식 문서 |
| GitHub Actions cache size changelog | https://github.blog/changelog/2025-11-20-github-actions-cache-size-can-now-exceed-10-gb-per-repository/ | ⭐⭐⭐ High | 2025-11 | 공식 블로그 |
| Swatinem/rust-cache GitHub | https://github.com/Swatinem/rust-cache | ⭐⭐ Medium | 2026-04 | 공식 GitHub (v2.9.0) |
| dorny/paths-filter GitHub | https://github.com/dorny/paths-filter | ⭐⭐ Medium | 2026-04 | 공식 GitHub (v3) |
| Building and testing Node.js | https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs | ⭐⭐⭐ High | 2026-04 | 공식 문서 |

### 재검증 추가 소스 (2026-08-11)

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Safer pull_request_target defaults (공식 changelog) | https://github.blog/changelog/2026-06-18-safer-pull_request_target-defaults-for-github-actions-checkout/ | ⭐⭐⭐ High | 2026-06-18 | 1순위 — 보안 기본값 변경 원문 |
| actions/checkout README | https://github.com/actions/checkout | ⭐⭐⭐ High | 2026-08 | `@v7` 예시, `allow-unsafe-pr-checkout` 기본 false |
| actions/checkout releases (HTML + API) | https://github.com/actions/checkout/releases | ⭐⭐⭐ High | 2026-08 | v7.0.1(2026-07-20), 백포트 라인 v2.8.0~v6.1.0 |
| actions/upload-artifact releases + README | https://github.com/actions/upload-artifact | ⭐⭐⭐ High | 2026-08 | v7.0.1, `archive`·`overwrite` 입력, artifact immutable |
| actions/download-artifact releases + README | https://github.com/actions/download-artifact | ⭐⭐⭐ High | 2026-08 | v8.0.1, `digest-mismatch`·`skip-decompress` |
| actions/cache releases + README | https://github.com/actions/cache | ⭐⭐⭐ High | 2026-08 | v6.1.0 (v6.0.0 ESM) |
| actions/setup-node releases + README | https://github.com/actions/setup-node | ⭐⭐⭐ High | 2026-08 | v7.0.0 (더미 NODE_AUTH_TOKEN 폴백 제거) |
| actions/github-script releases + README | https://github.com/actions/github-script | ⭐⭐⭐ High | 2026-08 | v9.0.0 (ESM, getOctokit 주입) |
| dorny/paths-filter releases + README | https://github.com/dorny/paths-filter | ⭐⭐ Medium | 2026-08 | v4.0.3 (Node 24 breaking, filters 동작 동일) |
| pnpm/action-setup README | https://github.com/pnpm/action-setup | ⭐⭐ Medium | 2026-08 | v6.0.10, pnpm v11+는 pnpm/setup 권장 |
| Swatinem/rust-cache releases | https://github.com/Swatinem/rust-cache | ⭐⭐ Medium | 2026-08 | v2.9.2 (메이저 v2 유지) |
| The Hacker News — checkout pwn request 차단 보도 | https://thehackernews.com/2026/06/github-updates-actionscheckout-to-block.html | ⭐⭐ Medium | 2026-06 | 독립 교차 검증용 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (2026-08-11 갱신: checkout@v7, cache@v6, setup-node@v7, upload-artifact@v7, download-artifact@v8, github-script@v9, paths-filter@v4, pnpm/action-setup@v6, rust-cache@v2)
- [✅] deprecated된 패턴을 권장하지 않음 (actions-rs 미사용, dtolnay/rust-toolchain 사용)
- [✅] 코드 예시가 실행 가능한 형태임
- [✅] 보안 기본값 변경 반영 (checkout v7의 pull_request_target·workflow_run 포크 체크아웃 차단 + 2026-07-20 백포트)

### 4-1-1. 재검증 클레임 판정 (2026-08-11)

| # | 클레임 | 소스 수 | 판정 |
|---|--------|:---:|------|
| 1 | `actions/checkout` 최신은 v7.0.1(2026-07-20)이며 v7.0.0은 2026-06-18 GA | 3 (changelog·releases HTML·releases API) | VERIFIED |
| 2 | v7은 `pull_request_target` / `workflow_run`(pull_request 계열)에서 포크 PR 코드 체크아웃을 기본 차단한다 | 3 (공식 changelog·checkout README·독립 보도) | VERIFIED |
| 3 | 차단 대상 입력은 포크 `repository:`, `refs/pull/<n>/head|merge` ref, 포크 head/merge SHA | 2 (공식 changelog·README) | VERIFIED |
| 4 | 예외 입력은 `allow-unsafe-pr-checkout`이고 기본값은 `false` | 2 (checkout README·releases 노트) | VERIFIED |
| 5 | 백포트 시행일은 2026-07-20(당초 07-16에서 연기), v1 제외·부동 태그만 자동 적용 | 2 (공식 changelog·releases 목록) | VERIFIED |
| 6 | `actions/upload-artifact` 최신 메이저는 v7(7.0.1), v7.0.0에서 ESM + `archive` 직접 업로드 도입 | 2 (releases API·README) | VERIFIED |
| 7 | upload-artifact는 v4 이후 artifact가 immutable — 동일 이름 다중 업로드 불가(`overwrite`로만 대체) | 2 (README·기존 v1 검증 기록) | VERIFIED |
| 8 | `actions/download-artifact` 최신 메이저는 v8(8.0.1), `digest-mismatch` 기본 `error`, 자동 압축 해제는 유지(`skip-decompress`로 해제) | 2 (releases API·README) | VERIFIED |
| 9 | cache v6.1.0 / setup-node v7.0.0 / github-script v9.0.0이 각 최신 메이저 | 2 (releases API·각 README) | VERIFIED |
| 10 | paths-filter v4.0.3(Node 24 breaking, `filters` 동작 동일), pnpm/action-setup v6.0.10, rust-cache v2.9.2 | 2 (releases API·README) | VERIFIED |

DISPUTED / UNVERIFIED 항목: 없음.

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (트리거, 잡 의존성, 매트릭스, 캐싱, 시크릿, Docker, 배포, 재사용, 모노레포)
- [✅] 코드 예시 포함 (20개 이상 YAML 예시)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함 (5가지)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 워크플로우 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (Node.js/pnpm CI, Rust CI, Docker GHCR, 배포 등)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완

---

## 5. 테스트 진행 기록

### 테스트 케이스 1: Node.js/pnpm CI 워크플로우 생성

**입력 (질문/요청):**
```
pnpm 기반 Next.js 프로젝트의 CI 워크플로우를 만들어줘 (lint, typecheck, test, build)
```

**기대 결과:**
```
스킬의 "Node.js / pnpm 프로젝트 CI" 섹션을 참조하여
pnpm/action-setup, setup-node cache: 'pnpm', --frozen-lockfile 을 포함한 워크플로우 생성
```

**실제 결과:**
```
스킬의 "Node.js / pnpm 프로젝트 CI" 섹션(349-381행)을 참조.
actions/checkout@v5, pnpm/action-setup@v4 (version: 9), actions/setup-node@v4 (cache: 'pnpm'),
pnpm install --frozen-lockfile, permissions: contents: read 모두 포함.
WebSearch로 공식 문서와 대조한 결과 패턴이 정확함을 확인.
```

**판정:** ✅ PASS

---

### 테스트 케이스 2: 모노레포 변경 감지 설정

**입력:**
```
모노레포에서 frontend, backend 변경된 패키지만 CI 돌리도록 설정해줘
```

**기대 결과:**
```
스킬의 "모노레포 변경 감지" 섹션을 참조하여
dorny/paths-filter@v3 기반 changes 잡 + 조건부 CI 잡 구성
```

**실제 결과:**
```
스킬의 "모노레포 변경 감지" 섹션(682-765행)을 참조.
dorny/paths-filter@v3로 changes 잡 구성, outputs로 frontend/backend boolean 전달,
후속 잡에서 needs: changes + if: needs.changes.outputs.frontend == 'true' 조건 사용.
shared 패키지를 양쪽 필터에 포함하는 패턴도 정확.
WebSearch로 dorny/paths-filter v3 안정 버전 확인 완료.
```

**판정:** ✅ PASS

---

### 테스트 케이스 3: Docker 이미지 GHCR 푸시

**입력:**
```
Docker 이미지를 빌드해서 GHCR에 푸시하는 워크플로우를 만들어줘
```

**기대 결과:**
```
스킬의 "Docker 빌드 + GHCR 푸시" 섹션을 참조하여
docker/login-action, metadata-action, build-push-action 기반 워크플로우 생성
```

**실제 결과:**
```
스킬의 "Docker 빌드 + GHCR 푸시" 섹션(424-481행)을 참조.
docker/login-action@v3 (GITHUB_TOKEN), docker/metadata-action@v5 (자동 태깅),
docker/build-push-action@v6 (cache-from/cache-to: type=gha), permissions: packages: write 포함.
공식 문서 패턴과 정확히 일치함을 확인.
```

**판정:** ✅ PASS

---

### 재검증 회귀 확인 (2026-08-11)

**수행일**: 2026-08-11
**수행자**: 스킬 최신화 에이전트 (2026-04-20 skill-tester content test 3/3 PASS 결과 위에 얹는 회귀 확인)
**수행 방법**: 액션 메이저 버전·보안 기본값 갱신 후, 기존 테스트 케이스 3건이 갱신된 SKILL.md에서도 동일하게 성립하는지 재확인 + 신규 보안 질문 1건 추가

- TC1 (Node.js/pnpm CI) — PASS. 갱신 후 답변 경로가 `actions/checkout@v7` + `pnpm/action-setup@v6` + `actions/setup-node@v7`(`cache: 'pnpm'`)로 이동했고, `version` 입력이 `packageManager` 필드 유무에 따라 선택적이라는 단서까지 SKILL.md에서 확보 가능.
- TC2 (모노레포 변경 감지) — PASS. `dorny/paths-filter@v4`로 갱신됐고 `filters` 입력·출력 사용법은 v3와 동일해 기존 예시가 그대로 유효함을 README로 확인.
- TC3 (Docker GHCR 푸시) — PASS. 이번 갱신 범위 밖(docker/* 액션)이라 변경 없음, 기존 판정 유지.
- TC4 (신규) "포크 PR 워크플로우에서 `pull_request_target` + `ref: head.sha` 조합이 갑자기 실패한다. 원인과 올바른 대응은?" — PASS. "포크 PR 보안 — checkout v7 pwn request 차단" 섹션에서 원인(v7 기본 차단 + 2026-07-20 백포트), 차단 입력 패턴 표, `allow-unsafe-pr-checkout`를 켜는 대신 `pull_request`로 분리하는 권장 대응까지 모두 도출 가능.

재검증 회귀 확인: 4/4 PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-20 content test 3건 PASS) |
| 최신성 재검증 | ✅ (2026-08-11, 클레임 10건 전부 VERIFIED / 회귀 확인 4/4 PASS) |
| **최종 판정** | **APPROVED** (유지) |

> 2026-08-11 재검증: 액션 메이저 버전이 대거 올라갔고 `actions/checkout` v7에서 보안 기본값이 바뀌었으나,
> 스킬 본문을 최신 버전·보안 서술로 갱신해 불일치가 해소됨. 상태는 APPROVED 유지.

---

## 7. 개선 필요 사항

- [✅] 에이전트 활용 테스트 실시 후 APPROVED로 상태 변경 (2026-04-20)
- [✅] 액션 메이저 버전·checkout v7 보안 기본값 반영 (2026-08-11)
- [✅] `references/REFERENCE.md`의 액션 버전 표기를 SKILL.md와 동기화 (2026-08-11 완료 — checkout v5→v7, setup-node v4→v7, pnpm/action-setup v4→v6, paths-filter v3→v4. docker/*·aws-actions/*·vercel-action은 SKILL.md 표기 대상이 아니므로 미변경)
- [⏸️] self-hosted runner 설정 패턴 추가 검토 — 선택 보강, 차단 요인 아님
- [⏸️] GitHub Actions OIDC (id-token) 기반 클라우드 인증 심화 패턴 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성: 워크플로우 구조, 트리거, 잡 의존성, 매트릭스, 캐싱, 시크릿, Node.js/Rust CI, Docker GHCR, 배포, 재사용 워크플로우, Composite Action, 모노레포 변경 감지 | Claude (Opus 4.6) |
| 2026-04-20 | v1.1 | PENDING_TEST → APPROVED 전환: 테스트 3건 수행 (Node.js/pnpm CI, 모노레포 변경 감지, Docker GHCR 푸시), 핵심 클레임 3건 WebSearch 교차 검증 완료 | Claude (Opus 4.6) |
| 2026-08-11 | v1.2 | 최신화: 액션 버전 갱신(checkout v5→v7, cache v4→v6, setup-node v4→v7, pnpm/action-setup v4→v6, paths-filter v3→v4 표기), "포크 PR 보안 — checkout v7 pwn request 차단" 섹션 신설, 클레임 10건 교차 검증 전부 VERIFIED, 회귀 확인 4/4 PASS. status APPROVED 유지 | Claude (Opus 5) |
