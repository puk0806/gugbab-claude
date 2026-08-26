---
name: project_frontend_domain_refactor_assets_2026-08-26
description: "2026-08-26 프론트 도메인 리팩터링용 자산 정비 — 타깃 2개(lfos-ui Next16 모노레포·lf-ui Vite/React18 레거시) 스택 실측, 깨진 스킬 참조 수리, 신규 스킬 8종·에이전트 1종, 레거시 훅 프로파일·SEO 옵트아웃·commands export 추가"
metadata: 
  node_type: memory
  type: project
  originSessionId: f4a1bdb6-4f86-4205-a4f6-644338ab6d05
  modified: 2026-08-26T07:55:15.344Z
---

# 프론트 도메인 리팩터링 자산 정비 (2026-08-26)

**목적:** 사용자의 두 실무 프로젝트를 이 레포 자산 기반으로 도메인 정리 리팩터링하기 위한 사전 정비.
**작업 방식(사용자 확정):** 모든 작업은 gugbab-claude 레포에서만 하고 `project-install.sh`로 export. 타깃 프로젝트는 스택 참고용으로만 읽고 절대 수정하지 않는다.

## 타깃 스택 실측 (2026-08-26)
| | lfos-ui (`~/Desktop/workspace/01_lf-os/lfos-ui`) | lf-ui (`~/Desktop/workspace/00_lf-ui/lf-ui`) |
|---|---|---|
| 형태 | pnpm 9.15 + Turborepo 2.2, apps 2/packages 6 | 단일 Vite 5 SPA, src 4,000 파일 |
| 코어 | Next 16.2.6 / React 19.2.6 + React Compiler / TS 5.3.3 | React 18.2 / TS **4.7.4** |
| 상태 | TanStack Query v5 + zustand 5 | **Recoil 0.7** + TanStack Query **v4** |
| UI | ag-grid 33, vanilla-extract, sass, Storybook 8 | **MUI 5.10 + Emotion 11**, jQuery, swiper 11 |
| 테스트/tsc | 테스트 3개, tsc 3초 | 테스트 31개, tsc **77초 + TS2688 기존 에러** |
| 폴더 | layer-first (`types/·constants/·utils/` 밑에 splash·card·plan·live… 반복) | `utils/{도메인}` 40여 개, `desktop/`·`mobile/` 분기 |

둘 다 react-spa 템플릿으로 설치돼 있었고 CLAUDE.md가 `{프로젝트명}` 템플릿 그대로였음. lfos-ui는 nextjs 템플릿으로 재설치해야 맞다.

## 이번에 만든/고친 것
- **수리**: `frontend-developer`(12건)·`frontend-architect`(2건)·`python-backend-developer`(6건)·`skill-tester`(1건)의 존재하지 않는 스킬 참조 — 2026-06-11 개편(224→202종)에서 삭제된 스킬(react-core·typescript·sass·accessibility 등)을 에이전트 본문에서 안 고친 것. 복원이 아니라 현행 스킬로 재매핑 + "설치 안 된 스킬은 Glob 확인 후 건너뛰기" 규칙 추가
- **신규 스킬 8종**: `architecture/frontend-domain-structure`·`module-boundaries`·`incremental-refactoring`(도메인 리팩터링 3종), `frontend/mui-v5`·`ag-grid`·`vanilla-extract`·`recoil-to-zustand-migration`·`tanstack-query-v4-to-v5-migration`(스택 갭 5종)
- **신규 에이전트**: `domain/frontend-domain-refactorer` — codebase-domain-analyst(진단)와 frontend-developer(구현) 사이의 "실행 계획" 갭. import 그래프·co-change로 경계 역추출, 리프부터 배치, ts-morph codemod·경계 규칙 산출. 소스 직접 수정 안 함
- **export 파이프라인**: ① `--legacy` 프로파일(tdd-guard 제외 + `typescript-quality --changed-only`: 증분 컴파일·방금 저장한 파일 에러만 차단·180s) — gen-settings/install-cleanup/project-install 3곳 배선 ② SEO·GEO 스킬 포함 여부 질문(n이면 frontend 20종+writing 4종 제외) ③ dream 전용 frontend 18종을 react-spa/nextjs/health에서 항상 제외 ④ `.claude/commands/` 10종이 그동안 export에서 통째로 빠져 있던 것 추가

## 사후 재검증 (2026-08-26 후반, 목적 = 리팩터링 체인 관점)
- `frontend/vanilla-extract` 삭제 (죽은 devDep, 스킬 7종으로 확정) → [[feedback_verify_usage_before_library_skill]]
- 체인 결함 수정: build-error-resolver 프론트 템플릿 포함, codebase-domain-analyst 프론트 신호표+인계, pr-reviewer 이동 PR 관점, typescript.md 전환기 공존 규칙
- frontend-domain-refactorer: agent-creator 사후 리뷰 8건 반영 (Bash 읽기 전용, `npx --no-install`, `.proposed`, co-change 폴더 쌍 스크립트 — `git log --format`은 `%` 없으면 `tformat:` 접두사 필수)
- freshness 6종: code-convention(ESLint 10·Biome 2.5)·testing·e2e-testing·typescript-v4 갱신, ddd·state-management 검증일만. skill-creator 위임 1건이 API 세션 한도로 실패해 직접 수행

## doctor 지표 재현 점검 (2026-08-26 후반) — /doctor는 세션 내 커맨드라 Bash 실행 불가, 지표를 직접 재현
- 측정법: 설치본에서 스킬 name+description 합, 에이전트 description 합, paths 없는 rules 본문을 chars/2.6으로 토큰 추정
- 노이즈 제거 후 nextjs·SEO n·작성 n: 스킬 55종 3.5k tok / 에이전트 30종 3.8k / rules 2.2k (이전 66·4.5k / 34·4.5k / 6.5k)
- 신설 옵션: "작성 도구 포함?"(기본 n) → 타깃 2개 모두 n (자산은 이 레포에서만). `--keep-authoring` cleanup 플래그
- 재설치 수렴: `scripts/prune-option-excluded.js` — 이번 템플릿 범위에서 옵션으로 빠진 파일만 매니페스트 해시 증명 하에 삭제. lfos-ui의 dream 8·SEO 18 잔재가 이걸로 정리됨
- `permissions.defaultMode`로 이동 (최상위는 무효 — 08-10 미결 항목 해소)
- 실제 /doctor는 export 후 각 프로젝트에서 사용자가 1회 실행해 스킬 노출 여부 확인 권장
- Codex 2차 사이클 6건 반영: rules도 매니페스트 소유 증명, cleanup이 `defaultMode` 이관, 시드는 루트+패키지 전부, 베이스라인 multiset + `~/.claude/typescript-quality/` 영속, `npx --no-install`. 설계 원칙으로 굳어진 것: **삭제는 반드시 소유 증명(매니페스트 해시 or 소스 동일) 후, 게이트는 fail-closed, 상태는 tmp가 아닌 홈**

## SEO·GEO 점검 (2026-08-26 후반, lf-ui 커머스 관점)
- lf-ui 실측: CSR 전용(프리렌더 없음)·Helmet 156파일 공용 컴포넌트 없음·og 6파일·JSON-LD Product 1파일·canonical 2·m.lfmall↔www.lfmall 교차 지정 없음·sitemap 없음·네이버 인증 0·AI 크롤러 정책 없음
- SEO 스킬 12종 freshness 반영(9종 갱신), 갭 2건: m-dot 교차 지정(`mobile-seo-pwa` 1-4절), 네이버 AI 브리핑(naver·geo). seo-auditor 2.11 영역 추가
- export 시 lf-ui는 SEO **c**(커머스 프로파일). 나머지 SEO 12종(og-image 제외 local-business·i18n 등)은 커머스 프로파일에서 빠지므로 재검증 안 함
- 원칙 재확인: 감사 에이전트가 3rd-party 근거로 보고한 수치·날짜(더미 데이터 04-07, Cloudflare 09-15, satori 0.29.0, returnPolicyCountry 필수화)는 공식 소스·registry로 재확인 후 틀린 건 미기재/정정 — [[feedback_live_event_info_verification]] 연장선

## 완료 상태 (2026-08-26 세션 종료 시점)
- 스킬 8종 content test 29/29 PASS — APPROVED 5(frontend-domain-structure·module-boundaries·mui-v5·ag-grid·vanilla-extract), PENDING_TEST 3(incremental-refactoring·recoil·tanstack 마이그레이션 = 실사용 필수 카테고리, 실제 전환 후 졸업)
- Codex 3라운드 7건 전부 ACCEPT 반영: typescript-quality는 베이스라인 차집합·`--seed`·타임아웃/도구장애 연속 2회 차단, commands 매니페스트·cleanup 추적, 모노레포 패키지별 시드
- 커밋·푸시 미수행 (사용자 요청 대기). 워킹트리에 신규 파일 다수 — 커밋 시 `[agent]`/`[skill]`/`[config]`/`[docs]`/`[memory]` 분리 필요

## 다음 단계 (미완)
- 타깃 재설치: lfos-ui는 `nextjs` 템플릿 + SEO n, lf-ui는 `react-spa` + legacy y + SEO n. 재설치 시 빈 잔재 디렉토리(lfos-ui 41개)는 install-cleanup이 매니페스트 기준으로 정리
- lf-ui는 tsc 자체가 실패(TS2688 'exhibition' 타입 정의 누락)라 리팩터링 배치 0 이전에 "타입체크 그린" 선행 과제 필요 — refactorer 에이전트가 이를 강제하도록 설계됨

**Why:** 213종 스킬 중 도메인 리팩터링 자산이 0이었고, 주력 에이전트가 삭제된 스킬을 가리키고 있어 export하면 그대로 깨진 상태로 따라갔다.

**How to apply:** 사용자가 이 두 프로젝트 얘기를 꺼내면 위 스택 표를 기준으로 답하고, "프로젝트에서 직접 작업"이 아니라 "레포 자산 수정 → export" 경로를 기본으로 잡는다. 관련: [[project_install_architecture]], [[feedback_pause_at_95_percent_tokens]]
