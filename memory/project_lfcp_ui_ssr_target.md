---
name: lfcp-ui-ssr-target
description: "lfcp-ui-ssr(lfmall SEO·GEO용 Java SSR 봇 대응 페이지 프로젝트) 스택 실측과 템플릿 선택 근거 — java-spring-legacy + seo-geo(5,11) 조합 (2026-09-01)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 326d382d-a205-4839-bf71-16d21252358a
  modified: 2026-09-01T08:36:15.334Z
---

`~/Desktop/workspace/05_lfcp-ui-ssr/lfcp-ui-ssr` — lfmall 검색 노출(SEO·GEO)용 **서버 렌더 페이지** 프로젝트. 2026-09-01 실측, `.claude/`·`CLAUDE.md` 미설치 상태였음. [[project-install-sh]] 템플릿 **`5,11` (java-spring-legacy + seo-geo)** 대상.

**스택 실측 (build.gradle + java 34파일 + JSP 17):**
- Java 11 / Spring Boot 2.5.12 / Gradle / WAR(bootWar off, Tomcat 9.0.111) — [[lfcp-nxapi-target]]과 같은 레거시 계열
- JSP/JSTL 뷰(`WEB-INF/views/seo|crawler|bridge|bridgeNew|demo`), spring-boot-starter-webflux(동기 앱 내 WebClient·RestTemplate로 nxapi 호출), Spring Security 5(WebSecurityConfigurerAdapter), Lucy XSS, Logback MDC 인터셉터, Lombok+ModelMapper, Joda, 사내 `lfcp-arch-common:1.0.8`
- 패키지: `seo/`(seoInfo·검색결과·전체카테고리, PC·모바일 JSP 쌍), `crawler/`(봇 UA 대응·SNS 공유), `bridge/`(앱 브릿지·UTM), `welfare/`(SSO)
- JSP에 이미 `application/ld+json` 6·`og:` 7·`canonical` 6·`robots` 6·`hreflang` 1 → 구조화 데이터·메타를 서버에서 출력
- **없는 것**: MyBatis·DB·Cacheable·AWS SDK·Swagger → java-legacy 스킬 27종 중 ~9종(mybatis·multi-datasource·hikaricp·redisson·ehcache·aws-sdk-v1·springfox·jasypt·bouncycastle)은 무용(무해)

**왜 5,11인가:** 5만 깔면 SEO 자산 0개(react-spa·nextjs 전용 게이트 + 2026-08-31에 seo-auditor를 EXCLUDE_AGENTS_JAVA에 넣음). 5+3 혼합은 React/Next 스킬 60여 종·TS 훅이 딸려와 노이즈. → seo-geo 애드온 템플릿 신설(사용자 결정).

**참고(프로젝트 측, 레포 작업 아님):** build.gradle에 SonarQube·Nexus 자격증명 평문(nxapi와 동일 패턴), `WEB-INF/backup/` 구 HTML 잔재, crawler 패키지가 봇 UA 분기 렌더링 — Google이 권장하지 않는 동적 렌더링 패턴이라 seo-auditor 감사 시 첫 점검 항목.

**How to apply:** 설치는 `./project-install.sh` → `5,11` → SEO 프로파일 `c`(커머스: 상품·카테고리·검색·카카오·네이버·GEO 중심). JSP/JSTL 서버사이드 SEO 전용 스킬은 아직 없음 — 필요 판단 시 [[verify-usage-before-library-skill]] 원칙대로 실측 후.
