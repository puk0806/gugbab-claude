# 템플릿: seo-geo (11)

SEO·GEO(생성형 AI 검색 노출) 애드온 템플릿. 프레임워크 비종속 검색 노출 자산만 담고 있어 **스택 템플릿과 병행 선택**하는 것이 기본 용법이다.

```
./project-install.sh  →  번호 입력: 5,11   (Java 레거시 SSR·JSP 페이지)
                                      3,11   (Next.js — seo-nextjs·og-image-generation 은 nextjs 가 보탬)
                                      11     (단독 — 콘텐츠·SEO 운영만 하는 프로젝트)
```

> 2026-09-01 신설. 그동안 SEO·GEO 스킬 20종·writing 4종·SEO 에이전트 2종은 react-spa·nextjs 템플릿에만 묶여 있어 JSP·Thymeleaf 등 **서버 렌더 HTML을 내려주는 Java 프로젝트**(봇 대응 SSR, SEO 랜딩)에는 넣을 방법이 없었다. 조건 분기 대신 독립 템플릿으로 분리해 기존 union(가산) 설계 그대로 조합한다.

---

## 프로파일 질문

설치 시 SEO 프로파일을 고른다 — 이 템플릿은 SEO 자체가 목적이라 **제외(n)는 없다** (SEO가 필요 없으면 11을 빼면 된다).

| 선택 | 포함 | 용도 |
|------|------|------|
| `y` (엔터 기본) | 전체 22종 | 블로그·미디어·다국어·로컬 비즈니스까지 |
| `c` | 커머스 14종 — 로컬비즈니스·다국어(i18n·multilingual)·YMYL·VPAT·사이트 이전·Indexing API·모니터링 자동화 제외 | 상품·카테고리·검색 페이지 중심의 커머스·서비스 사이트 |

전체 → 커머스로 바꿔 재설치하면 빠진 8종(짝 docs 포함)은 매니페스트 소유 증명 하에 정리된다. 사용자가 수정한 파일은 보존된다.

---

## 에이전트 (6종)

| 카테고리 | 에이전트 | 설명 |
|----------|---------|------|
| validation | [seo-auditor](../../.claude/agents/validation/seo-auditor.md) | 메타·OG·JSON-LD·sitemap·robots·canonical·hreflang·GEO 10개 영역 통합 감사 |
| validation | [content-quality-reviewer](../../.claude/agents/validation/content-quality-reviewer.md) | E-E-A-T·Helpful Content·네이버/카카오 특화 콘텐츠 품질 진단 |
| validation | [fact-checker](../../.claude/agents/validation/fact-checker.md) | 사실·수치·주장 교차 검증 |
| validation | [source-validator](../../.claude/agents/validation/source-validator.md) | URL·문서 신뢰도 판정 |
| research | [web-searcher](../../.claude/agents/research/web-searcher.md) | 검색 축별 소스 탐색 전담 |
| meta | [claude-code-guide](../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI 사용법·설정 가이드 |

> 스택 에이전트(java-backend-developer·frontend-developer 등)는 병행 선택한 스택 템플릿이 union 으로 보탠다.
> a11y-auditor·build-perf-benchmarker·perf-report-writer 는 프론트 템플릿 소유 — `5,11` 조합에는 들어오지 않는다.

---

## 스킬 (전체 22종 / 커머스 14종)

| 분류 | 스킬 | 커머스 |
|------|------|:------:|
| 구조화 데이터 | [schema-org-patterns](../../.claude/skills/frontend/schema-org-patterns/SKILL.md) · [structured-data-validation-api](../../.claude/skills/frontend/structured-data-validation-api/SKILL.md) | ✅ |
| 커머스·GEO | [ecommerce-seo](../../.claude/skills/frontend/ecommerce-seo/SKILL.md) · [geo-ai-discoverability](../../.claude/skills/frontend/geo-ai-discoverability/SKILL.md) | ✅ |
| 한국 시장 | [naver-seo-specifics](../../.claude/skills/frontend/naver-seo-specifics/SKILL.md) · [kakao-share-optimization](../../.claude/skills/frontend/kakao-share-optimization/SKILL.md) · [search-console-webmaster](../../.claude/skills/frontend/search-console-webmaster/SKILL.md) | ✅ |
| URL·크롤링·헤더 | [url-canonicalization-redirects](../../.claude/skills/frontend/url-canonicalization-redirects/SKILL.md) · [bot-management-seo](../../.claude/skills/frontend/bot-management-seo/SKILL.md) · [security-headers-seo](../../.claude/skills/frontend/security-headers-seo/SKILL.md) | ✅ |
| 렌더·자산 | [seo-static-html](../../.claude/skills/frontend/seo-static-html/SKILL.md) · [image-optimization-seo](../../.claude/skills/frontend/image-optimization-seo/SKILL.md) · [mobile-seo-pwa](../../.claude/skills/frontend/mobile-seo-pwa/SKILL.md) | ✅ |
| 콘텐츠 | [content-eeat-quality](../../.claude/skills/writing/content-eeat-quality/SKILL.md) | ✅ |
| 다국어·로컬 | [i18n-seo](../../.claude/skills/frontend/i18n-seo/SKILL.md) · [local-business-seo](../../.claude/skills/frontend/local-business-seo/SKILL.md) · [multilingual-content-strategy](../../.claude/skills/writing/multilingual-content-strategy/SKILL.md) | — |
| 특수 콘텐츠 | [ymyl-content-seo](../../.claude/skills/writing/ymyl-content-seo/SKILL.md) · [accessibility-vpat-writing](../../.claude/skills/writing/accessibility-vpat-writing/SKILL.md) | — |
| 운영·이전 | [google-indexing-api](../../.claude/skills/frontend/google-indexing-api/SKILL.md) · [seo-monitoring-automation](../../.claude/skills/frontend/seo-monitoring-automation/SKILL.md) · [site-migration-seo](../../.claude/skills/devops/site-migration-seo/SKILL.md) | — |

> **프레임워크 종속 3종은 이 템플릿 소유가 아니다** — `seo-nextjs`·`og-image-generation`(Next ImageResponse/satori)은 nextjs, `seo-vite-spa`는 react-spa 가 소유한다. `3,11`처럼 병행하면 union 으로 함께 온다.
> `seo-static-html`은 그동안 프레임워크 필터에서 모든 템플릿이 제외해 **어느 템플릿에서도 export 되지 않던 스킬**이었다. JSP·Thymeleaf 등 서버 렌더 HTML에 가장 가까워 이 템플릿이 소유한다.

---

## 훅 (공통 15종)

단독 설치 시 공통 훅만 들어간다(academic·dream 과 동일). dev 훅(tdd-guard·test-fake-guard·adversarial-test-guard·fake-impl-guard)·TypeScript 훅은 **병행한 스택 템플릿**이 결정한다 — `5,11`이면 java 가 dev 4종을, `3,11`이면 nextjs 가 dev 4종 + typescript-quality 를 보탠다.

공통 15종 목록은 [java-spring-legacy 템플릿 문서](./java-spring-legacy.md#훅-19종)의 공통 섹션과 같다.

---

## 규칙 (기본 3종)

| 규칙 | 설명 |
|------|------|
| [git.md](../../.claude/rules/git.md) | Git 커밋 컨벤션 |
| [info-verification.md](../../.claude/rules/info-verification.md) | 외부 정보 검증 원칙 — 공식 문서 1순위, 교차 검증 |
| [task-workflow.md](../../.claude/rules/task-workflow.md) | 작업 착수 전 확인 절차 |

> 작성 규칙 5종은 "작성 도구" 옵션 y 일 때만. 언어 규칙(java.md 등)·adversarial-testing.md 는 병행 스택 템플릿이 보탠다.

---

## 슬래시 커맨드 (9종)

util 3종(commit·create-pr·context-prime) + dev 6종(create-plan·fix-pr·update-docs·tdd-implement·agent-status·sparc-refine). Codex 옵션 y 면 codex-review 추가.

---

## CLAUDE.md

단독 설치면 [`examples/CLAUDE.seo-geo.md`](../../examples/CLAUDE.seo-geo.md)가 베이스로 복사된다.
병행 설치(`5,11`)면 스택 템플릿(java)의 CLAUDE.md 가 베이스가 되고(입력 순서가 `11,5`여도 애드온은 뒤로 정렬), seo-geo 의 **"SEO·GEO 작업 원칙" 도메인 섹션이 규칙 참조 앞에 append** 되며 **금지 사항 항목은 베이스 `## 금지 사항` 끝에 병합**된다(`<!-- seo-geo 금지 사항 -->` 표식).

**사전 구성 내용:**
- 금지 사항 — 봇 UA 전용 HTML(동적 렌더링·클로킹), 미검증 JSON-LD 배포, 영향 범위 미확인 robots/noindex 변경, 상대경로·트래킹 파라미터 canonical, 화면 값과 다른 가격·재고 구조화 데이터
- 작업 원칙 — 페이지 유형별 스키마 기준, Google + 네이버 병행, GEO(AI 크롤러·llms.txt), 카카오 OG 캐시 초기화, 완료 후 seo-auditor·content-quality-reviewer 점검

---

## settings.json

단독이면 `scripts/gen-settings.js` 플래그 없이(공통 훅만) 생성. 병행 시 스택 템플릿의 플래그(`--dev`·`--typescript`)를 따른다.
