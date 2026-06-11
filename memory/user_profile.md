---
name: 사용자 프로필 및 프로젝트 환경
description: 풀스택 개발자, 프론트엔드(Next.js·CRA) + Java 레거시 백엔드(SB 2.5+MyBatis+Oracle) 운영. gugbab-claude로 컨벤션을 만들어 다른 프로젝트에 이식.
type: user
originSessionId: 0d50be35-5012-479d-82c9-84f0edba18f5
---
풀스택 개발자. gugbab-claude로 Claude Code 컨벤션을 만들고 다른 프로젝트에 이식하는 방식으로 운영.

**프론트엔드 운영 프로젝트:**
- `lfos-ui` (`/Users/lf/Desktop/workspace/01_lf-os/lfos-ui`) — Next.js + Turborepo 모노레포, React 18/19, Zustand, Zod, ag-grid, vanilla-extract, Storybook, tsup, TS 5.3.3
- `lf-ui` (`/Users/lf/Desktop/workspace/00_lf-ui/lf-ui`) — CRA/CRACO 레거시, React 18, MUI v5 + Emotion, Recoil, TanStack Query v4, axios, Swiper, react-virtuoso, TS 4.7.4

**Java 백엔드 환경 (레거시 엔터프라이즈):**
- 핵심: Java 11, Spring Boot 2.5.12, Gradle, WAR 배포 (Tomcat 9.0.111)
- DB: Oracle (ojdbc8) 주력 + MySQL 5.1.38 보조, MyBatis 3.5.4 (JPA 미사용), HikariCP 3.4.5
- 캐시: Redis (Redisson 2.15.2 + spring-data-redis 2.6.0), EhCache 2.10.x 로컬
- 보안: Spring Security 5, jjwt 0.10.7, Jasypt 3.0.2, BouncyCastle 1.64
- 외부: AWS SDK v1 (S3 1.12.201 + Rekognition 1.12.372), MaxMind GeoIP2, Innorules BRMS 7.2.x (한국 상용)
- 문서·로깅: Springfox Swagger 2.9.2, Spring Cloud Sleuth 3.0.4
- 기타: Lombok 1.18.22, MapStruct 1.4.2, ModelMapper 2.3.7, Jackson 2.12.3, Joda-Time 2.10.10, jsoup 1.13.1, Naver Lucy XSS 2.0.0, Spring WebFlux WebClient

**스킬 생성 방향:**
- 실제 프로젝트에서 쓰는 패키지 기반으로 스킬을 만듦. 이론적 스킬보다 실용적 스킬 우선.
- 레거시 스택과 모던 스택을 분리해서 각각 스킬 작성 (예: spring-security-5 vs 6, redis-redisson-legacy vs modern, aws-sdk-v1 vs v2). API가 크게 달라진 라이브러리는 항상 분리.
- 한국 엔터프라이즈 특화(Naver Lucy XSS, KISA SEED/ARIA, Innorules) 항목은 별도 명시.
