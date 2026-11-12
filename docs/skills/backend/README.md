# backend 스킬

Java · Python · TypeScript(Prisma/Zod/Better Auth/Drizzle/Neon) · Claude Code CLI · 운세 앱 백엔드 · 넥사크로 레거시 마이그레이션 스킬 모음 (총 27종).

---

## Java 백엔드 (17종)

### 공통 (레거시·모던 공용, 10종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [spring-boot-gradle-setup](../../../.claude/skills/spring-boot-gradle-setup/SKILL.md) | Spring Boot 프로젝트 초기 셋업 — 레거시(SB 2.5/Java 11/WAR)·모던(SB 3.4+/Java 21/Jar) | [→](./spring-boot-gradle-setup/verification.md) |
| [spring-boot-2-to-3-migration](../../../.claude/skills/spring-boot-2-to-3-migration/SKILL.md) | SB 2.5(Java 11) → 3.x 마이그레이션 — Phase 0~9 게이트, javax→jakarta, Security 5→6, Tomcat 10, 롤백 기준 | [→](./spring-boot-2-to-3-migration/verification.md) |
| [mybatis-mapper-patterns](../../../.claude/skills/mybatis-mapper-patterns/SKILL.md) | MyBatis Mapper 작성 패턴 — 인터페이스·XML 매퍼, 동적 SQL, resultMap, TypeHandler | [→](./mybatis-mapper-patterns/verification.md) |
| [spring-multi-datasource-oracle-mysql](../../../.claude/skills/spring-multi-datasource-oracle-mysql/SKILL.md) | Oracle + MySQL 멀티 데이터소스 — SqlSessionFactory 분리, 트랜잭션 매니저 설정 | [→](./spring-multi-datasource-oracle-mysql/verification.md) |
| [hikaricp-tuning-oracle-mysql](../../../.claude/skills/hikaricp-tuning-oracle-mysql/SKILL.md) | HikariCP 커넥션 풀 튜닝 — Oracle/MySQL 필수 파라미터, Leak Detection, 모니터링 | [→](./hikaricp-tuning-oracle-mysql/verification.md) |
| [jasypt-encrypted-config](../../../.claude/skills/jasypt-encrypted-config/SKILL.md) | Jasypt application.yml 설정값 암호화 — ENC() 구문, 환경변수 키 주입 | [→](./jasypt-encrypted-config/verification.md) |
| [xss-lucy-jsoup](../../../.claude/skills/xss-lucy-jsoup/SKILL.md) | XSS 방어 — Naver Lucy XSS Filter(요청 파라미터) + jsoup Safelist(HTML) | [→](./xss-lucy-jsoup/verification.md) |
| [jackson-time-migration](../../../.claude/skills/jackson-time-migration/SKILL.md) | Jackson + 자바 시간 API — Joda-Time(레거시)에서 java.time(JSR-310)으로 마이그레이션 | [→](./jackson-time-migration/verification.md) |
| [webflux-webclient-in-sync-app](../../../.claude/skills/webflux-webclient-in-sync-app/SKILL.md) | WebFlux WebClient를 블로킹(WebMVC) 앱에서 HTTP 클라이언트로 사용하는 패턴 | [→](./webflux-webclient-in-sync-app/verification.md) |
| [bouncycastle-crypto](../../../.claude/skills/bouncycastle-crypto/SKILL.md) | BouncyCastle 암호화 — Provider 등록, AES-GCM/CBC, RSA-OAEP, JDK 버전별 의존성 | [→](./bouncycastle-crypto/verification.md) |

### 레거시 전용 (Java 11 + Spring Boot 2.5, 5종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [spring-security-5-jwt-jjwt10](../../../.claude/skills/spring-security-5-jwt-jjwt10/SKILL.md) | Spring Security 5.5.x + jjwt 0.10.7 JWT 인증 — WebSecurityConfigurerAdapter | [→](./spring-security-5-jwt-jjwt10/verification.md) |
| [swagger-springfox-2](../../../.claude/skills/swagger-springfox-2/SKILL.md) | Springfox 기반 레거시 Swagger 2 API 문서화 — @EnableSwagger2, Docket Bean | [→](./swagger-springfox-2/verification.md) |
| [redis-redisson-legacy](../../../.claude/skills/redis-redisson-legacy/SKILL.md) | Redis + Redisson 2.15.2 레거시 — Spring Boot 2.5 + Java 11, 분산 락 | [→](./redis-redisson-legacy/verification.md) |
| [ehcache-2-legacy](../../../.claude/skills/ehcache-2-legacy/SKILL.md) | EhCache 2.10.x 레거시 로컬 캐시 — Spring Boot 2.5 + Java 11, ehcache.xml 설정 | [→](./ehcache-2-legacy/verification.md) |
| [aws-sdk-v1-s3-rekognition](../../../.claude/skills/aws-sdk-v1-s3-rekognition/SKILL.md) | AWS SDK Java v1 S3 + Rekognition 레거시 — 의존성·BOM, 자격 증명 체인 | [→](./aws-sdk-v1-s3-rekognition/verification.md) |

### 모던 전용 (Java 21 + Spring Boot 3.x, 2종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [spring-security-6-jwt-jjwt12](../../../.claude/skills/spring-security-6-jwt-jjwt12/SKILL.md) | Spring Security 6.x + jjwt 0.12.x 모던 JWT 인증 — SecurityFilterChain Bean | [→](./spring-security-6-jwt-jjwt12/verification.md) |
| [redis-redisson-4](../../../.claude/skills/redis-redisson-4/SKILL.md) | Redisson 4.x — 3.x→4.x Breaking Change(Config 최상위 이동·모듈 분리), Spring Boot 3.x/4.x 호환 매트릭스 | [→](./redis-redisson-4/verification.md) |

---

## Python 백엔드 (3종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [python-llamaindex](../../../.claude/skills/python-llamaindex/SKILL.md) | LlamaIndex RAG 시스템 — Document, Node, VectorStore, Query Engine, Retriever | [→](./python-llamaindex/verification.md) |
| [python-langchain-current](../../../.claude/skills/python-langchain-current/SKILL.md) | LangChain 1.x 균형 평가 — 아키텍처·장단점·LlamaIndex 비교·실전 사용 판단 기준 | [→](./python-langchain-current/verification.md) |
| [python-korean-nlp-konlpy](../../../.claude/skills/python-korean-nlp-konlpy/SKILL.md) | KoNLPy + Mecab-ko 한국어 NLP — 형태소 분석, 품사 태깅, 키워드 추출 | [→](./python-korean-nlp-konlpy/verification.md) |

---

## TypeScript 백엔드 (4종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [prisma-orm](../../../.claude/skills/prisma-orm/SKILL.md) | Prisma ORM 7.x — prisma.config.ts·드라이버 어댑터 필수화 등 v7 브레이킹 체인지, schema 모델링·관계, migrate dev/deploy, 트랜잭션, N+1 회피, Neon·Vercel 서버리스/엣지 연결 | [→](./prisma-orm/verification.md) |
| [zod-schema-validation](../../../.claude/skills/zod-schema-validation/SKILL.md) | Zod 4 서버 경계 검증 — body/query/params, 환경변수, 외부 API 응답, 모노레포 FE/BE 스키마 공유, 악성 입력 방어(초장문·`__proto__`), Zod 3→4 변경점 | [→](./zod-schema-validation/verification.md) |
| [better-auth](../../../.claude/skills/better-auth/SKILL.md) | Better Auth 1.7.x — betterAuth() 서버 설정, Drizzle/Prisma 어댑터, 이메일·비밀번호+OAuth, 세션(쿠키·cookieCache), Next.js/Hono 통합, 보안 체크리스트 | [→](./better-auth/verification.md) |
| [drizzle-neon-postgres](../../../.claude/skills/drizzle-neon-postgres/SKILL.md) | Drizzle ORM + Neon Postgres 서버리스 — neon-http vs neon-serverless, 스키마·마이그레이션(풀드/언풀드 URL), upsert·batch, Vercel Marketplace 환경변수, Neon Free 한도 | [→](./drizzle-neon-postgres/verification.md) |

---

## Claude Code CLI (1종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [claude-code-headless](../../../.claude/skills/claude-code-headless/SKILL.md) | Claude Code headless(`claude -p`) — stream-json 파싱·SSE 중계, 구독(OAuth) 인증, 인증 우선순위 함정, 안전 가드 | [→](./claude-code-headless/verification.md) |

---

## 운세 앱 백엔드 (운세 도메인 블록 · 프리셋 `fortune`, 1종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [korean-lunar-calendar-manseryeok](../../../.claude/skills/korean-lunar-calendar-manseryeok/SKILL.md) | 한국 음양력·만세력 계산 규칙 — 절기 기준 월주·입춘 기준 연주 경계, 표준시 변천·서머타임 이력, 진태양시 보정, 야자시/조자시, KASI 공식 데이터 대조 검증 | [→](./korean-lunar-calendar-manseryeok/verification.md) |

---

## 넥사크로 레거시 백엔드 마이그레이션 (넥사크로 블록 · 프리셋 `nexacro`, 1종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [ibatis-to-mybatis-migration](../../../.claude/skills/ibatis-to-mybatis-migration/SKILL.md) | iBATIS 2 → MyBatis 3 — 공식 변환 도구 ibatis2mybatis 실행·한계, 문법 대응표(isNotEmpty·procedure 함정), SqlMapClient→Mapper, 공존 점진 전환, Oracle `jdbcTypeForNull` | [→](./ibatis-to-mybatis-migration/verification.md) |
