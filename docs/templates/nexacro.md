# 템플릿: nexacro (15)

넥사크로 17 + Spring(X-API) 레거시 레포를 이해하고 **Next.js(App Router) 화면 + Java(Spring Boot 3) REST** 로 이전하는 스택 템플릿.

```
./project-install.sh  →  번호 입력: 15      (이전 작업만)
                                      15,14   (스펙 추출 함께 — 권장. legacy-spec-extractor·spec-reviewer·/spec-extract 추가)
```

> 2026-10-08 신설. dev 템플릿 O · TypeScript 템플릿 X(TS 훅 없음 — 이전 목표용 typescript.md 규칙만) · Java 규칙 사용.
> **레거시 프로파일 자동 적용** — 테스트가 거의 없는 레거시 코드베이스가 전제라 질문 없이 `--legacy`(tdd-guard 제외)로 설치된다. `15,3`처럼 TS 템플릿과 조합하면 typescript-quality 도 `--changed-only`로 배선된다.
> 스펙 추출 자산은 spec-extraction(14) 소유 — 이 템플릿 단독엔 넣지 않는다. 명세가 필요하면 `15,14`로 조합한다.

---

## 에이전트 (30종 — 작성 도구 y 시 33종)

> 2026-10-08 실측: 작성도구 n·codex n 기본 옵션 설치 기준.

| 카테고리 | 에이전트 | 설명 |
|----------|---------|------|
| domain | [nexacro-screen-analyzer](../../.claude/agents/domain/nexacro-screen-analyzer.md) | 화면(.xfdl)별 Dataset·transaction·Grid 기능·팝업·공통 의존 추출 → 난이도·웨이브 계획 (`docs/migration/`) |
| frontend | [nexacro-screen-converter](../../.claude/agents/frontend/nexacro-screen-converter.md) | 넥사크로 화면 → Next.js 화면 초안(페이지·API 훅·zod 스키마·AG Grid 설정) + 변환표, 사람 검토 전제 |
| validation | [migration-parity-tester](../../.claude/agents/validation/migration-parity-tester.md) | 기존·신규 조회·일괄 저장·오류 동등성 테스트 + 권한 우회·위조 행 적대적 테스트 |
| frontend | [frontend-developer](../../.claude/agents/frontend/frontend-developer.md) | Next.js 컴포넌트·훅·API 연동 구현 |
| frontend | [frontend-architect](../../.claude/agents/frontend/frontend-architect.md) | 프론트 구조·렌더링 전략 설계 |
| domain | [frontend-domain-refactorer](../../.claude/agents/domain/frontend-domain-refactorer.md) | 이전한 화면 코드의 도메인 폴더 재편 계획 |
| backend | [java-backend-developer](../../.claude/agents/backend/java-backend-developer.md) | Spring Boot REST·MyBatis·Security 구현 |
| backend | [java-backend-architect](../../.claude/agents/backend/java-backend-architect.md) | SB 1.x/2.x → 3.x 이전 판단·레이어 설계 |
| backend | [database-architect](../../.claude/agents/backend/database-architect.md) | DB 스키마·ERD·인덱싱 설계 |
| domain | [business-domain-analyst](../../.claude/agents/domain/business-domain-analyst.md) | 비즈니스 요구사항 → DDD 도메인 모델 도출 |
| domain | [codebase-domain-analyst](../../.claude/agents/domain/codebase-domain-analyst.md) | 코드베이스 역분석 → 도메인 구조 진단 |
| domain | [product-planner](../../.claude/agents/domain/product-planner.md) | 아이디어·요구사항 → PRD 작성 |
| domain | [ui-ux-designer](../../.claude/agents/domain/ui-ux-designer.md) | PRD → 와이어프레임·디자인 토큰·컴포넌트 스펙 |
| domain | [api-spec-designer](../../.claude/agents/domain/api-spec-designer.md) | X-API 서비스 → REST OpenAPI 3.1 계약 설계 |
| devops | [devops-engineer](../../.claude/agents/devops/devops-engineer.md) | Dockerfile·GitHub Actions·배포 설정 |
| meta | [freshness-auditor](../../.claude/agents/meta/freshness-auditor.md) | 에이전트·스킬 최신화 필요 항목 감사 |
| meta | [claude-code-guide](../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI 사용법·설정 가이드 |
| meta | [tech-stack-advisor](../../.claude/agents/meta/tech-stack-advisor.md) | 요구사항에 맞는 기술 스택 추천·비교 |
| meta | [project-scaffolder](../../.claude/agents/meta/project-scaffolder.md) | 결정된 스택으로 프로젝트 부트스트랩 |
| meta | [changelog-writer](../../.claude/agents/meta/changelog-writer.md) | git log → CHANGELOG.md 자동 작성 |
| research | [deep-researcher](../../.claude/agents/research/deep-researcher.md) | 논문/오픈소스/기업 사례 3축 딥 리서치 |
| research | [web-searcher](../../.claude/agents/research/web-searcher.md) | 검색 축별 소스 탐색 전담 |
| research | [research-reviewer](../../.claude/agents/research/research-reviewer.md) | 리서치 보고서 품질 평가 |
| research | [data-analyst](../../.claude/agents/research/data-analyst.md) | 이벤트 택소노미·퍼널 분석·A/B 테스트 설계 |
| research | [competitor-analyst](../../.claude/agents/research/competitor-analyst.md) | 경쟁사 분석·기능 비교·차별화 포인트 도출 |
| validation | [fact-checker](../../.claude/agents/validation/fact-checker.md) | 사실·수치·주장 교차 검증 |
| validation | [source-validator](../../.claude/agents/validation/source-validator.md) | URL·문서 신뢰도 판정 |
| validation | [pr-reviewer](../../.claude/agents/validation/pr-reviewer.md) | PR diff 리뷰 코멘트·판정 생성 |
| validation | [qa-engineer](../../.claude/agents/validation/qa-engineer.md) | 테스트 계획·적대적 E2E 시나리오 생성 |
| validation | [security-auditor](../../.claude/agents/validation/security-auditor.md) | OWASP·PIPA·LLM 리스크 보안 감사 |

**제외 (EXCLUDE_AGENTS_NEXACRO)**: rust·python·typescript 백엔드 에이전트 6종, build-error-resolver, SEO·a11y·성능 측정 검증 에이전트 5종.
스펙 추출 2종(legacy-spec-extractor·spec-reviewer)은 spec-extraction 소유 — `15,14` 조합 시 추가된다. `backend/CLAUDE.md`(미설치 rust.md 임포트 줄만 제거)·`frontend/CLAUDE.md`(typescript.md 임포트)는 설치된다.

---

## 스킬 (49종)

| 카테고리 | 종류 | 링크 |
|----------|------|------|
| nexacro — 넥사크로 (5종) | nexacro-17-xfdl-anatomy · nexacro-xapi-server · nexacro-to-react-mapping · xapi-to-rest-migration · nexacro-strangler-coexistence | [→ 목록](../skills/nexacro/README.md) |
| backend — 넥사크로 레거시 이관 (2종) | spring-boot-1-to-2-migration · ibatis-to-mybatis-migration | [→ 목록](../skills/backend/README.md) |
| backend — Java 공통 (13종) | spring-boot-gradle-setup·mybatis·hikaricp·global-exception·logback·xss 등 (java-spring-legacy 와 동일) | [→ 목록](../skills/backend/README.md) |
| backend — Java 레거시 (6종) | spring-security-5·swagger-springfox-2·redis-redisson-legacy·ehcache-2·aws-sdk-v1·spring-boot-2-to-3-migration | [→ 목록](../skills/backend/README.md) |
| backend — 이전 목표 (2종) | spring-security-6-jwt-jjwt12 · springdoc-openapi-3 | [→ 목록](../skills/backend/README.md) |
| frontend — Next.js 목표 핵심 (7종) | nextjs · ag-grid · tanstack-query · form-handling · state-management · typescript-v5 · e2e-testing | [→ 목록](../skills/frontend/README.md) |
| frontend — 참조 닫힘 (7종) | tanstack-query-v4-to-v5-migration · typescript-v4 · monorepo-turborepo · bundling-compiler · vite-advanced-splitting · bundle-size-analysis · core-web-vitals-optimization | [→ 목록](../skills/frontend/README.md) |
| devops (2종) | docker-deployment · github-actions | [→ 목록](../skills/devops/README.md) |
| architecture (4종) | ddd · incremental-refactoring · module-boundaries · frontend-domain-structure | [→ 목록](../skills/architecture/README.md) |
| meta (1종) | claude-code-hook-authoring | [→ 목록](../skills/meta/README.md) |

> `spring-boot-1-to-2-migration`·`ibatis-to-mybatis-migration` 은 backend 카테고리지만 **넥사크로 레거시 전용** — java-spring-legacy/modern 등 다른 템플릿엔 설치되지 않는다(전역 게이트).
> 프론트 스킬은 변환 에이전트가 따르는 핵심 7종 + 그 스킬들과 frontend-architect·frontend-domain-refactorer 본문이 참조하는 스킬(참조 닫힘 — `installed-refs` 테스트로 고정)만. 나머지 프론트 자산이 필요하면 `15,3`(nextjs)으로 조합한다.
> `zod-schema-validation`(backend)은 본문이 TS 백엔드(hono)를 참조해 넣지 않았다 — 폼 검증의 zod 사용법은 form-handling 이 다룬다.
> spec 카테고리(스펙 추출 4종)는 spec-extraction(14) 소유. 모던 전용 Redisson·AWS SDK v2·n8n·vercel·SEO·dream 계열은 제외.

---

## 훅 (23종 — 공통 18 + 개발 전용 5)

공통 18종은 [java-spring-legacy 템플릿 문서](./java-spring-legacy.md#훅-24종--공통-18--개발-전용-6)의 공통 섹션과 같다.

개발 전용(레거시 프로파일): `test-fake-guard.js` · `adversarial-test-guard.js` · `fake-impl-guard.js` · `auto-format.js` · `package-manager-guard.js`

> **tdd-guard 제외** — 레거시 프로파일 자동 적용(질문 없음). 이전에 일반 dev 로 설치했던 대상이면 재설치 때 install-cleanup 이 tdd-guard 를 소유 증명 하에 정리한다. `15→5`처럼 nexacro 를 빼면 tdd-guard 가 돌아온다.
> TypeScript 훅(typescript-quality)은 포함되지 않는다.

---

## 규칙 (기본 6종 — 작성 도구 y 시 11종)

| 규칙 | 설명 |
|------|------|
| [git.md](../../.claude/rules/git.md) | Git 커밋 컨벤션 |
| [info-verification.md](../../.claude/rules/info-verification.md) | 외부 정보 검증 원칙 |
| [task-workflow.md](../../.claude/rules/task-workflow.md) | 작업 착수 전 확인 절차 |
| [java.md](../../.claude/rules/java.md) | Java + Spring Boot 코딩 규칙 |
| [adversarial-testing.md](../../.claude/rules/adversarial-testing.md) | 적대적 테스트 원칙 — 동등성·이전 테스트에도 적용 |
| [typescript.md](../../.claude/rules/typescript.md) | 이전 목표(Next.js) 코드 규칙 — TS 훅(typescript-quality)은 없음 |

> 작성 규칙 5종은 "작성 도구" 옵션 y일 때만.

---

## 슬래시 커맨드 (9종)

`commit`·`create-pr`·`context-prime` (util 공통) + `create-plan`·`fix-pr`·`update-docs`·`tdd-implement`·`agent-status`·`sparc-refine` (dev 전용). `/spec-extract` 는 `15,14` 조합 시, `codex-review`는 Codex 옵션 y일 때만.

---

## CLAUDE.md

설치 시 [`examples/CLAUDE.nexacro.md`](../../examples/CLAUDE.nexacro.md)가 대상 프로젝트 루트에 복사된다. `15,14` 면 spec-extraction 의 "스펙 추출 작업 원칙" 섹션이 append 되고 금지 사항이 병합된다.

**사전 구성 내용:**
- 금지 사항 — 회사 소스·데이터 외부 반출, 사용 여부 확인 없는 1:1 복제, 사람 검토 없는 변환 초안 머지, 표시 없는 AG Grid Enterprise(유료) 기능 사용, 원본 넥사크로·X-API 코드 수정
- 작업 원칙 — 산출물은 `docs/migration/`(인벤토리·웨이브·변환표·동등성 차이), 스킬 읽는 순서, 웨이브 단위 공존(strangler), 동등성 테스트, SB 1.x·iBATIS 단계 이전
- 규칙 참조 표 — 미설치 규칙 행(작성 도구·Codex 옵션)은 설치 시 자동 제거

---

## settings.json

`scripts/gen-settings.js --dev --legacy` 플래그로 생성된다 (`--typescript` 없음 — tdd-guard 미배선, adversarial·fake-impl·auto-format 유지).

---

## 옵션 질문

| 질문 | 나오는가 |
|------|:---:|
| memory 공유 · Superpowers · 브랜치 보호 · README guard · staleness guard · 작성 도구 | ✅ |
| Codex 적대적 리뷰 (dev 템플릿) | ✅ |
| 레거시 TS 프로파일 | ❌ (질문 없이 자동 적용) |
| SEO·GEO 옵트인 | ❌ |

---

## 재설치·전환 수렴

nexacro 를 빼는 전환(`15→5` 등)에서는 nexacro 스킬·SB1→2·iBATIS 이관 스킬·전용 에이전트 3종이 조합 조건 없이 prune 목록에 기록되고, 매니페스트 해시가 일치하는 파일과 짝 docs 만 삭제된다. 사용자가 수정한 사본은 보존된다.
Next.js 목표 스킬(nextjs·ag-grid 등)은 프론트 템플릿 공용 자산이라 prune 기록하지 않는다(템플릿은 가산적).

---

## 설치 검증 (2026-10-08)

기본 옵션(전부 엔터) 실측: 스킬 49 · 에이전트 30 · 훅 23 · 규칙 6 · 커맨드 9 · 매니페스트 `templates: ["nexacro"]`.
`scripts/template-separation.test.js`(단독·`15,14`·`15,14→15`·`15→5` 수렴·잘못된 번호) · `scripts/template-ownership.test.js`(소유 매트릭스·`15,3`) · `scripts/installed-refs.test.js`(설치본 참조 무결성).
