---
skill: monorepo-turborepo
category: frontend
version: v4
date: 2026-08-11
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
| 스킬 경로 | `.claude/skills/frontend/monorepo-turborepo/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 직전 재검증일 | 2026-06-20 |
| 재검증일 | 2026-08-11 |
| 검증 방법 | frontend-architect 활용 테스트 + 버전 재검증 (공식 문서·GitHub API·npm 레지스트리) |
| 버전 기준 | **Turborepo 2.10.9 (2026-08-07), pnpm 11.21.0** |

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

### 테스트 케이스 1: frontend-architect 에이전트 활용 테스트

**테스트 방법:** frontend-architect 에이전트에게 monorepo-turborepo 관련 설계 질문 및 코드 리뷰 요청

**발견 및 수정 사항:**
발견된 오류 없음 — Turborepo 2.x tasks 키, workspace:* 프로토콜, exports 필드 모두 정확. 스킬 내용 수정 불필요

**판정:** ✅ PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (frontend-architect) |
| 버전 재검증 (2026-08-11) | ✅ 클레임 12건 — VERIFIED 11 / DISPUTED 1 (정정 반영) |
| **최종 판정** | **APPROVED** |

**2026-08-11 재검증 근거:**
- 기준 버전을 Turborepo 2.9.18 → **2.10.9(2026-08-07)**, pnpm 11.8.0 → **11.21.0** 으로 갱신.
- 낡은 서술 1건(pnpm 11 비호환 = 2.9.x 알려진 이슈)을 **2.9.7에서 해소됨**으로 정정 — 사용자가 불필요하게 pnpm 11 도입을 미루게 만드는 서술이었으므로 영향도가 큰 수정.
- 재검증은 *버전·사실 갱신* 범위이며 스킬 핵심 구조(모노레포 선택 기준, 폴더 구조, turbo.json tasks, workspace:*, 캐싱, Changesets)는 변경 없음 → content test 재수행 없이 **APPROVED 유지**.

---

## 7. 개선 필요 사항

- [✅] 2026-08-11 — pnpm 11 호환성 서술 정정(2.9.7 해소) 및 Turborepo 2.10 신규 기능 반영 완료
- [🔬] 버전 관련 "알려진 이슈" 서술은 다음 재검증 시 **이슈 종결 여부 + 해소 릴리즈 태그**까지 확인할 것 — 이번에 2개월 이상 낡은 서술이 남아 있던 전례가 있음

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-03-27 | v1 | 최초 작성 및 frontend-architect 활용 테스트 완료 | frontend-architect 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-06-20 | v3 | 버전 재검증 — Turborepo 2.9.18 최신, pnpm 11.8.0 최신 확인. pnpm 11 + Turborepo 호환성 주의 노트 SKILL.md에 추가 | 버전 재검증 |
| 2026-08-11 | v4 | 버전 재검증 — 기준을 Turborepo 2.10.9(2026-08-07)·pnpm 11.21.0으로 갱신. ① **pnpm 11 비호환 서술 정정**: "2.9.x 알려진 이슈" → **2.9.7(2026-05-01)에서 해소**(PR #12616·#12676), 대응 방법을 "업그레이드"로 교체 ② **Turborepo 2.10 신규 기능 섹션 신설**(`cacheMaxAge`/`cacheMaxSize` 로컬 캐시 자동 정리, `--affected`+`--filter` 조합, graceful shutdown, incremental task caching, boundaries 순환 의존성 탐지) ③ 소스 URL을 `turbo.build` → `turborepo.dev`로 갱신 ④ `packageManager` 예시 pnpm 11.21.0. 클레임 12건(VERIFIED 11 / DISPUTED 1 정정) | 버전 재검증 |
