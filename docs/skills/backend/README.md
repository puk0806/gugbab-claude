# backend 스킬

Rust · Java · Python · Claude Code CLI 백엔드 스킬 모음 (총 50종).

---

## Rust 백엔드 (17종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [axum](../../../.claude/skills/backend/axum/SKILL.md) | Axum 웹 프레임워크 핵심 패턴 — 라우팅, 상태 공유, 추출자, 에러 핸들링, 미들웨어 | [→](./axum/verification.md) |
| [custom-middleware](../../../.claude/skills/backend/custom-middleware/SKILL.md) | Tower 커스텀 미들웨어 — from_fn, from_fn_with_state, 요청/응답 가로채기 | [→](./custom-middleware/verification.md) |
| [dependency-injection](../../../.claude/skills/backend/dependency-injection/SKILL.md) | Trait 기반 의존성 주입 — Arc<dyn Trait> vs 제네릭, AppState 구성, Axum 핸들러 주입 | [→](./dependency-injection/verification.md) |
| [design-patterns-rust](../../../.claude/skills/backend/design-patterns-rust/SKILL.md) | Rust 디자인 패턴 8종 — Builder, Newtype, Type State, Strategy, Command, Observer, RAII | [→](./design-patterns-rust/verification.md) |
| [jwt-auth](../../../.claude/skills/backend/jwt-auth/SKILL.md) | JWT 인증 패턴 — jsonwebtoken 크레이트 + Axum 미들웨어 기반 토큰 생성/검증 | [→](./jwt-auth/verification.md) |
| [multipart-upload](../../../.claude/skills/backend/multipart-upload/SKILL.md) | Axum Multipart 파일 업로드 — 필드 구분, 바이트 읽기, 크기 제한, 에러 처리 | [→](./multipart-upload/verification.md) |
| [project-structure](../../../.claude/skills/backend/project-structure/SKILL.md) | Rust + Axum 레이어드 아키텍처 — 4계층 구조, 모듈 시스템, 책임 분리, DI 조립 | [→](./project-structure/verification.md) |
| [repository-pattern](../../../.claude/skills/backend/repository-pattern/SKILL.md) | Repository 패턴 — async trait 기반 DB 추상화, In-Memory 구현, Service-Repository DI | [→](./repository-pattern/verification.md) |
| [reqwest](../../../.claude/skills/backend/reqwest/SKILL.md) | reqwest HTTP 클라이언트 — GET/POST, JSON, 헤더, 스트리밍, 에러 처리, Client 재사용 | [→](./reqwest/verification.md) |
| [serde](../../../.claude/skills/backend/serde/SKILL.md) | serde + serde_json 직렬화/역직렬화 핵심 패턴 | [→](./serde/verification.md) |
| [sqlx](../../../.claude/skills/backend/sqlx/SKILL.md) | sqlx 비동기 SQL 툴킷 — Pool 연결, query 매크로, 트랜잭션, 마이그레이션, Axum 연동 | [→](./sqlx/verification.md) |
| [sse-streaming](../../../.claude/skills/backend/sse-streaming/SKILL.md) | Axum SSE 스트리밍 구현 — Sse 응답, Event 구성, tokio-stream, Claude API 스트리밍 변환 | [→](./sse-streaming/verification.md) |
| [testing-rust](../../../.claude/skills/backend/testing-rust/SKILL.md) | Rust 테스트 패턴 — 단위·통합·비동기 테스트, Axum 핸들러 테스트(tower::ServiceExt) | [→](./testing-rust/verification.md) |
| [thiserror](../../../.claude/skills/backend/thiserror/SKILL.md) | thiserror 기반 에러 처리 — derive(Error), 메시지 포매팅, from 변환, Axum 연동 | [→](./thiserror/verification.md) |
| [tokio](../../../.claude/skills/backend/tokio/SKILL.md) | Tokio 비동기 런타임 핵심 패턴 및 API 가이드 | [→](./tokio/verification.md) |
| [tower-http](../../../.claude/skills/backend/tower-http/SKILL.md) | tower-http 미들웨어 — CorsLayer, TraceLayer, CompressionLayer, Axum 연동 | [→](./tower-http/verification.md) |
| [tracing](../../../.claude/skills/backend/tracing/SKILL.md) | tracing + tracing-subscriber 구조화 로깅 — 초기화, EnvFilter, 매크로, #[instrument] | [→](./tracing/verification.md) |

---

## Java 백엔드 (22종)

### 공통 (레거시·모던 공용, 13종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [spring-boot-gradle-setup](../../../.claude/skills/backend/spring-boot-gradle-setup/SKILL.md) | Spring Boot 프로젝트 초기 셋업 — 레거시(SB 2.5/Java 11/WAR)·모던(SB 3.4+/Java 21/Jar) | [→](./spring-boot-gradle-setup/verification.md) |
| [mybatis-mapper-patterns](../../../.claude/skills/backend/mybatis-mapper-patterns/SKILL.md) | MyBatis Mapper 작성 패턴 — 인터페이스·XML 매퍼, 동적 SQL, resultMap, TypeHandler | [→](./mybatis-mapper-patterns/verification.md) |
| [spring-multi-datasource-oracle-mysql](../../../.claude/skills/backend/spring-multi-datasource-oracle-mysql/SKILL.md) | Oracle + MySQL 멀티 데이터소스 — SqlSessionFactory 분리, 트랜잭션 매니저 설정 | [→](./spring-multi-datasource-oracle-mysql/verification.md) |
| [hikaricp-tuning-oracle-mysql](../../../.claude/skills/backend/hikaricp-tuning-oracle-mysql/SKILL.md) | HikariCP 커넥션 풀 튜닝 — Oracle/MySQL 필수 파라미터, Leak Detection, 모니터링 | [→](./hikaricp-tuning-oracle-mysql/verification.md) |
| [global-exception-validation](../../../.claude/skills/backend/global-exception-validation/SKILL.md) | 글로벌 예외 처리 + Bean Validation — @RestControllerAdvice, ErrorResponse | [→](./global-exception-validation/verification.md) |
| [testing-junit5-spring-boot](../../../.claude/skills/backend/testing-junit5-spring-boot/SKILL.md) | JUnit 5 + Spring Boot 테스트 — 단위·슬라이스·통합 테스트, Mockito, MockMvc | [→](./testing-junit5-spring-boot/verification.md) |
| [lombok-mapstruct-modelmapper](../../../.claude/skills/backend/lombok-mapstruct-modelmapper/SKILL.md) | Lombok + MapStruct + ModelMapper — DTO 변환과 보일러플레이트 제거 패턴 | [→](./lombok-mapstruct-modelmapper/verification.md) |
| [logback-mdc-tracing](../../../.claude/skills/backend/logback-mdc-tracing/SKILL.md) | Logback + MDC 구조화 로깅 + 분산 추적 — Sleuth(SB 2.5)·Micrometer(SB 3.x) | [→](./logback-mdc-tracing/verification.md) |
| [jasypt-encrypted-config](../../../.claude/skills/backend/jasypt-encrypted-config/SKILL.md) | Jasypt application.yml 설정값 암호화 — ENC() 구문, 환경변수 키 주입 | [→](./jasypt-encrypted-config/verification.md) |
| [xss-lucy-jsoup](../../../.claude/skills/backend/xss-lucy-jsoup/SKILL.md) | XSS 방어 — Naver Lucy XSS Filter(요청 파라미터) + jsoup Safelist(HTML) | [→](./xss-lucy-jsoup/verification.md) |
| [jackson-time-migration](../../../.claude/skills/backend/jackson-time-migration/SKILL.md) | Jackson + 자바 시간 API — Joda-Time(레거시)에서 java.time(JSR-310)으로 마이그레이션 | [→](./jackson-time-migration/verification.md) |
| [webflux-webclient-in-sync-app](../../../.claude/skills/backend/webflux-webclient-in-sync-app/SKILL.md) | WebFlux WebClient를 블로킹(WebMVC) 앱에서 HTTP 클라이언트로 사용하는 패턴 | [→](./webflux-webclient-in-sync-app/verification.md) |
| [bouncycastle-crypto](../../../.claude/skills/backend/bouncycastle-crypto/SKILL.md) | BouncyCastle 암호화 — Provider 등록, AES-GCM/CBC, RSA-OAEP, JDK 버전별 의존성 | [→](./bouncycastle-crypto/verification.md) |

### 레거시 전용 (Java 11 + Spring Boot 2.5, 5종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [spring-security-5-jwt-jjwt10](../../../.claude/skills/backend/spring-security-5-jwt-jjwt10/SKILL.md) | Spring Security 5.5.x + jjwt 0.10.7 JWT 인증 — WebSecurityConfigurerAdapter | [→](./spring-security-5-jwt-jjwt10/verification.md) |
| [swagger-springfox-2](../../../.claude/skills/backend/swagger-springfox-2/SKILL.md) | Springfox 기반 레거시 Swagger 2 API 문서화 — @EnableSwagger2, Docket Bean | [→](./swagger-springfox-2/verification.md) |
| [redis-redisson-legacy](../../../.claude/skills/backend/redis-redisson-legacy/SKILL.md) | Redis + Redisson 2.15.2 레거시 — Spring Boot 2.5 + Java 11, 분산 락 | [→](./redis-redisson-legacy/verification.md) |
| [ehcache-2-legacy](../../../.claude/skills/backend/ehcache-2-legacy/SKILL.md) | EhCache 2.10.x 레거시 로컬 캐시 — Spring Boot 2.5 + Java 11, ehcache.xml 설정 | [→](./ehcache-2-legacy/verification.md) |
| [aws-sdk-v1-s3-rekognition](../../../.claude/skills/backend/aws-sdk-v1-s3-rekognition/SKILL.md) | AWS SDK Java v1 S3 + Rekognition 레거시 — 의존성·BOM, 자격 증명 체인 | [→](./aws-sdk-v1-s3-rekognition/verification.md) |

### 모던 전용 (Java 21 + Spring Boot 3.x, 4종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [spring-security-6-jwt-jjwt12](../../../.claude/skills/backend/spring-security-6-jwt-jjwt12/SKILL.md) | Spring Security 6.x + jjwt 0.12.x 모던 JWT 인증 — SecurityFilterChain Bean | [→](./spring-security-6-jwt-jjwt12/verification.md) |
| [springdoc-openapi-3](../../../.claude/skills/backend/springdoc-openapi-3/SKILL.md) | Springdoc OpenAPI 2.x 모던 API 문서화 — Spring Boot 3.x, OpenAPI 3.1, Swagger UI | [→](./springdoc-openapi-3/verification.md) |
| [redis-redisson-modern](../../../.claude/skills/backend/redis-redisson-modern/SKILL.md) | Redisson 3.x 모던 — Spring Boot 3.x + Java 17+, RedissonClient 자동 구성 | [→](./redis-redisson-modern/verification.md) |
| [aws-sdk-v2-s3-rekognition](../../../.claude/skills/backend/aws-sdk-v2-s3-rekognition/SKILL.md) | AWS SDK Java v2 S3 + Rekognition 모던 — 빌더 API, 비동기 클라이언트 | [→](./aws-sdk-v2-s3-rekognition/verification.md) |

---

## Python 백엔드 (10종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [python-uv-project-setup](../../../.claude/skills/backend/python-uv-project-setup/SKILL.md) | uv Python 프로젝트 셋업 — pip/poetry/pyenv 대체, Rust 기반 차세대 패키지 매니저 | [→](./python-uv-project-setup/verification.md) |
| [python-fastapi](../../../.claude/skills/backend/python-fastapi/SKILL.md) | FastAPI 0.115+ 비동기 REST API — Pydantic v2, Annotated 의존성 주입, SSE 스트리밍 | [→](./python-fastapi/verification.md) |
| [python-pydantic-v2](../../../.claude/skills/backend/python-pydantic-v2/SKILL.md) | Pydantic v2 데이터 검증·직렬화 — BaseModel, Field, field_validator, model_validator | [→](./python-pydantic-v2/verification.md) |
| [python-anthropic-sdk](../../../.claude/skills/backend/python-anthropic-sdk/SKILL.md) | Anthropic Python SDK — Claude API 동기/비동기 호출, 스트리밍, 토큰 관리 | [→](./python-anthropic-sdk/verification.md) |
| [python-async-asyncio](../../../.claude/skills/backend/python-async-asyncio/SKILL.md) | asyncio + async/await — FastAPI·LLM API 호출 등 I/O 바운드 작업 패턴 | [→](./python-async-asyncio/verification.md) |
| [python-llamaindex](../../../.claude/skills/backend/python-llamaindex/SKILL.md) | LlamaIndex RAG 시스템 — Document, Node, VectorStore, Query Engine, Retriever | [→](./python-llamaindex/verification.md) |
| [python-embeddings-vector-db](../../../.claude/skills/backend/python-embeddings-vector-db/SKILL.md) | 임베딩 + Vector DB — 의미 검색·유사도·RAG, OpenAI/Cohere/BGE/ko-sbert 임베딩 | [→](./python-embeddings-vector-db/verification.md) |
| [python-langchain-current](../../../.claude/skills/backend/python-langchain-current/SKILL.md) | LangChain 1.x 균형 평가 — 아키텍처·장단점·LlamaIndex 비교·실전 사용 판단 기준 | [→](./python-langchain-current/verification.md) |
| [python-korean-nlp-konlpy](../../../.claude/skills/backend/python-korean-nlp-konlpy/SKILL.md) | KoNLPy + Mecab-ko 한국어 NLP — 형태소 분석, 품사 태깅, 키워드 추출 | [→](./python-korean-nlp-konlpy/verification.md) |
| [python-cli-typer](../../../.claude/skills/backend/python-cli-typer/SKILL.md) | Typer Python CLI 개발 — 타입 힌트 기반, 서브커맨드, 옵션/인자, Click 호환 | [→](./python-cli-typer/verification.md) |

---

## Claude Code CLI (1종)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [claude-code-headless](../../../.claude/skills/backend/claude-code-headless/SKILL.md) | Claude Code headless(`claude -p`) — stream-json 파싱·SSE 중계, 구독(OAuth) 인증, 인증 우선순위 함정, 안전 가드 | [→](./claude-code-headless/verification.md) |
