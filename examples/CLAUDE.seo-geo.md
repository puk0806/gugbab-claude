# CLAUDE.md — {프로젝트명}

SEO·GEO 검색 노출 — {프로젝트 한 줄 설명}

---

## 필수 원칙

- 복잡한 작업 전 계획 확인 → @.claude/rules/task-workflow.md

---

## 금지 사항

<!-- common-rules -->
- 검색엔진 봇(UA)에게만 다른 HTML을 내려주는 **동적 렌더링·클로킹 금지** — 사용자와 봇이 같은 콘텐츠를 받아야 한다 (Google은 동적 렌더링을 권장하지 않는 임시 방편으로 분류)
- JSON-LD·메타 태그를 **검증 없이 배포 금지** — Rich Results Test / Schema Markup Validator 통과 후 반영 (`structured-data-validation-api` 스킬)
- `robots.txt`·`X-Robots-Tag`·`noindex` 변경을 **영향 범위 확인 없이 수정 금지** — 한 줄 실수가 색인 전체를 지운다
- canonical·hreflang·OG URL에 **상대경로·트래킹 파라미터 금지** — 절대 URL + 정규화된 형태만 (`url-canonicalization-redirects` 스킬)
- 상품·가격·재고 구조화 데이터를 **화면 값과 다르게 출력 금지** — 불일치는 Merchant listings 수동 조치 사유

---

## SEO·GEO 작업 원칙

- 페이지 유형별 스키마 기준: 상품 → `Product`+`Offer`, 카테고리·검색 → `ItemList`+`BreadcrumbList`, 회사 → `Organization`+`WebSite` (`schema-org-patterns`·`ecommerce-seo` 스킬)
- 한국 시장은 Google + **네이버 서치어드바이저**를 함께 본다 — 네이버는 C-Rank·D.I.A. 기준이 달라 Google 최적화만으로 노출되지 않는다 (`naver-seo-specifics`·`search-console-webmaster` 스킬)
- AI 답변 엔진(ChatGPT·Claude·Perplexity·AI Overviews) 인용 대비 — AI 크롤러 robots 정책과 `llms.txt`, 인용 친화 구조를 GEO 기준으로 점검 (`geo-ai-discoverability` 스킬)
- 카카오톡 공유 미리보기는 OG 캐시 초기화까지가 배포 절차다 (`kakao-share-optimization` 스킬)
- 작업 완료 후 `seo-auditor` 에이전트로 메타·OG·JSON-LD·canonical·robots 10개 영역 점검, 콘텐츠 변경은 `content-quality-reviewer`로 E-E-A-T 점검

---

## 규칙 참조

| 상황 | 참조 파일 |
|------|----------|
| 작업 착수 전 확인 | @.claude/rules/task-workflow.md |
| Git 커밋 컨벤션 | @.claude/rules/git.md |
| 외부 정보 조사·검증 | @.claude/rules/info-verification.md |
| SEO·GEO 통합 감사 | `seo-auditor` 에이전트 + `.claude/skills/frontend/{schema-org-patterns,ecommerce-seo,geo-ai-discoverability,naver-seo-specifics}` |
| 에이전트 설계·작성 | @.claude/rules/agent-design.md |
| 슬래시 커맨드 작성 | @.claude/rules/commands.md |
| README 업데이트 | @.claude/rules/readme-update.md |
