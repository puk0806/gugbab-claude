---
skill: drizzle-neon-postgres
category: backend
version: v1.1
date: 2026-09-28
status: APPROVED
---

# 스킬 검증 문서 — drizzle-neon-postgres

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `drizzle-neon-postgres` |
| 스킬 경로 | `.claude/skills/backend/drizzle-neon-postgres/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-09-17 · 09-25 구조 개편 · 09-28 재검증) |
| 검증자 | skill-creator |
| 스킬 버전 | v1.1 |
| 기준 버전 | `drizzle-orm` 0.45.3 / `drizzle-kit` 0.31.11 / `@neondatabase/serverless` 1.1.0 / Next.js 16.x App Router / Neon Free 플랜 한도 2026-09-28 재확인(변경 없음) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Drizzle 공식 문서 9페이지, Neon 공식 문서 8페이지, Vercel 공식 문서 2페이지, Next.js 공식 문서 1페이지)
- [✅] 공식 GitHub / npm 2순위 소스 확인 (drizzle-team/drizzle-orm 소스 및 릴리즈, neondatabase/serverless README, npm 레지스트리 미러 2종)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-09-17 — drizzle-orm 0.45.2 / drizzle-kit 0.31.10 / @neondatabase/serverless 1.1.0, v1.0.0-rc.5 프리릴리즈 병존 확인)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (neon-http 기본 채택, 런타임 풀드 / 마이그레이션 비풀드 분리, upsert, batch)
- [✅] 코드 예시 작성 (스키마 3테이블, db 클라이언트, drizzle.config.ts, migrate 스크립트, Route Handler 3종 완결 예시)
- [✅] 흔한 실수 패턴 정리 (안티패턴 12종 표)
- [✅] SKILL.md 파일 작성
- [✅] skill-tester 2단계 실사용 테스트 (2026-09-17 수행, 3/3 PASS)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | Drizzle `get-started/neon-new`, `connect-neon`, `sql-schema-declaration`, `indexes-constraints`, `insert`, `batch-api`, `migrations`, `drizzle-kit-migrate`, `upgrade-v1`, `goodies` | 설치 명령·drizzle.config.ts·스키마/타입추론·제약·upsert 구문·batch 지원 드라이버·generate/migrate/push 차이·v1 RC 마이그레이션 구조 변경 확보 |
| 조사 | WebFetch | Neon `serverless/serverless-driver`, `connect/choose-connection`, `connect/connection-pooling`, `guides/drizzle`, `guides/drizzle-migrations`, `guides/vercel-native-integration`, `introduction/plans` | HTTP vs WebSocket 선택 기준, 풀드/비풀드 사용처, Vercel 통합 주입 환경변수 전체 목록, Free 플랜 한도표 확보 |
| 조사 | WebFetch | Vercel `/docs/cli/env`, `/docs/global-config` | `vercel env pull` 사용법·플래그, Edge Config → Global Config 개명 및 읽기/쓰기 특성 확보 |
| 조사 | WebFetch | Next.js `/docs/app/api-reference/file-conventions/route` (문서 버전 16.3.5) | GET Route Handler 기본 캐싱이 v15부터 static→dynamic으로 변경된 버전 히스토리 확보 |
| 조사 | WebFetch | GitHub `neondatabase/serverless` README, `drizzle-orm/src/neon-http/session.ts` 원본 | HTTP 드라이버의 세션·트랜잭션 미지원 명시, `transaction()` throw 코드와 `batch()`의 `client.transaction()` 위임 확인 |
| 교차 검증 | WebSearch / WebFetch | 29개 클레임, 독립 소스 2개 이상씩(공식 문서 + 소스코드 / npm 미러 2종 / 공식 문서 + 릴리즈 노트) | VERIFIED 27 / DISPUTED 1 / UNVERIFIED 1 |

> npm 공식 사이트(npmjs.com)는 403으로 직접 조회 불가 → npmx.dev + Snyk 패키지 DB 2개 독립 미러로 버전·배포일을 교차 확인함.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Drizzle: Get Started with Neon | https://orm.drizzle.team/docs/get-started/neon-new | ⭐⭐⭐ High | 2026-09-17 조회 | 공식 문서 (1순위) |
| Drizzle: Connect Neon | https://orm.drizzle.team/docs/connect-neon | ⭐⭐⭐ High | 2026-09-17 조회 | 드라이버 선택 기준 |
| Drizzle: Schema declaration | https://orm.drizzle.team/docs/sql-schema-declaration | ⭐⭐⭐ High | 2026-09-17 조회 | pgTable·파일 구성 |
| Drizzle: Goodies (type inference) | https://orm.drizzle.team/docs/goodies | ⭐⭐⭐ High | 2026-09-17 조회 | `$inferSelect`/`$inferInsert` |
| Drizzle: Indexes & Constraints | https://orm.drizzle.team/docs/indexes-constraints | ⭐⭐⭐ High | 2026-09-17 조회 | unique·index·PK·FK 구문 |
| Drizzle: Insert | https://orm.drizzle.team/docs/insert | ⭐⭐⭐ High | 2026-09-17 조회 | onConflictDoUpdate·excluded |
| Drizzle: Batch API | https://orm.drizzle.team/docs/batch-api | ⭐⭐⭐ High | 2026-09-17 조회 | neon-http batch 지원 |
| Drizzle: Migrations / drizzle-kit migrate | https://orm.drizzle.team/docs/migrations , https://orm.drizzle.team/docs/drizzle-kit-migrate | ⭐⭐⭐ High | 2026-09-17 조회 | 명령별 차이·`__drizzle_migrations` |
| Drizzle: Upgrade to v1 | https://orm.drizzle.team/docs/upgrade-v1 | ⭐⭐⭐ High | 2026-09-17 조회 | v1 RC 상태·구조 변경 |
| Drizzle release 0.36.0 | https://github.com/drizzle-team/drizzle-orm/releases/tag/0.36.0 | ⭐⭐⭐ High | 2026-09-17 조회 | 3번째 인자 배열 전환 |
| drizzle-orm 소스 (neon-http/session.ts) | https://raw.githubusercontent.com/drizzle-team/drizzle-orm/main/drizzle-orm/src/neon-http/session.ts | ⭐⭐⭐ High | 2026-09-17 조회 | transaction throw / batch 구현 원본 |
| Neon: Serverless driver | https://neon.com/docs/serverless/serverless-driver | ⭐⭐⭐ High | 2026-09-17 조회 | HTTP vs WebSocket, transaction() 옵션 |
| Neon: Choosing your connection method | https://neon.com/docs/connect/choose-connection | ⭐⭐⭐ High | 2026-09-17 조회 | 풀드/비풀드·마이그레이션 지침 |
| Neon: Connection pooling | https://neon.com/docs/connect/connection-pooling | ⭐⭐⭐ High | 2026-09-17 조회 | PgBouncer·`-pooler`·max_connections |
| Neon: Connect from Drizzle | https://neon.com/docs/guides/drizzle | ⭐⭐⭐ High | 2026-09-17 조회 | 서버리스=HTTP 드라이버 권장 |
| Neon: Drizzle 스키마 마이그레이션 가이드 | https://neon.com/docs/guides/drizzle-migrations | ⭐⭐⭐ High | 2026-09-17 조회 | migrate 스크립트·비풀드 경고 |
| Neon: Vercel 통합 가이드 | https://neon.com/docs/guides/vercel-native-integration | ⭐⭐⭐ High | 2026-09-17 조회 | 주입 환경변수 목록·프리뷰 브랜치 |
| Neon: Plans (Free 한도) | https://neon.com/docs/introduction/plans | ⭐⭐⭐ High | 2026-09-17 조회 | 무료 티어 한도표 |
| Neon: Scale to Zero / Connection latency | https://neon.com/docs/introduction/scale-to-zero , https://neon.com/docs/connect/connection-latency | ⭐⭐⭐ High | 2026-09-17 조회 | 5분 자동 정지·기동 지연 |
| neondatabase/serverless README | https://github.com/neondatabase/serverless | ⭐⭐⭐ High | 2026-09-17 조회 | 공식 GitHub (2순위) |
| Vercel CLI: vercel env | https://vercel.com/docs/cli/env | ⭐⭐⭐ High | last_updated 2026-08-20 | `env pull`·`env run` |
| Vercel: Global Config (구 Edge Config) | https://vercel.com/docs/global-config | ⭐⭐⭐ High | last_updated 2026-08-17 | 대안 비교 근거 |
| Next.js: route.js 레퍼런스 | https://nextjs.org/docs/app/api-reference/file-conventions/route | ⭐⭐⭐ High | 문서 버전 16.3.5 / 2026-04-30 | GET 기본 캐싱 변경 이력 |
| npmx: drizzle-orm / drizzle-kit / @neondatabase/serverless | https://npmx.dev/package/drizzle-orm 외 2건 | ⭐⭐ Medium | 2026-09-17 조회 | npm 레지스트리 미러 (npmjs.com 403 대체) |
| Snyk Advisor 패키지 페이지 | https://security.snyk.io/package/npm/drizzle-orm 외 2건 | ⭐⭐ Medium | 2026-09-17 조회 | 버전·배포일 2차 교차 확인 |
| Upstash Redis Pricing | https://upstash.com/pricing/redis , https://upstash.com/docs/redis/overall/pricing | ⭐⭐⭐ High | 2026-09-17 조회 | 대안 비교(무료 한도) |
| Web Push 오류 코드 해설 (RFC 8030 §7.3 인용) | https://pushpad.xyz/blog/web-push-errors-explained-with-http-status-codes | ⭐⭐ Medium | 2026-09-17 조회 | 404/410 처리 근거 보조 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 교차 검증 클레임 판정

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | `drizzle-orm` dist-tag `latest`는 **0.45.2** (2026-03-27 배포) | npmx + Snyk (독립 2소스) | ✅ VERIFIED |
| 2 | `drizzle-kit` 최신 안정 버전은 **0.31.10** (2026-03-17 배포) | npmx + 레지스트리 검색 결과 | ✅ VERIFIED |
| 3 | `@neondatabase/serverless` 최신 버전은 **1.1.0** (2026-04-17 배포) | npmx + Snyk (독립 2소스) | ✅ VERIFIED |
| 4 | Drizzle v1.0.0은 **RC 단계**이며 최신 rc는 1.0.0-rc.5(2026-09-09). 공식 get-started는 `drizzle-orm@rc` 설치를 안내 | get-started/neon-new + upgrade-v1 + npmx 태그 목록 | ✅ VERIFIED |
| 5 | v1에서 마이그레이션 폴더 구조 변경(`journal.json` 제거, `drizzle-kit drop` 삭제, `drizzle-kit up`으로 이전)·관계형 쿼리 API 변경 | upgrade-v1 문서 | ✅ VERIFIED |
| 6 | `neon-http`는 HTTP(fetch) 기반으로 단발·비대화형 쿼리에 적합, `neon-serverless`는 WebSocket 기반으로 세션·대화형 트랜잭션 지원 | Drizzle connect-neon + Neon serverless-driver + serverless README | ✅ VERIFIED |
| 7 | `neon-http`에서 `db.transaction()` 호출 시 `No transactions support in neon-http driver` 에러가 throw됨 | drizzle-orm `neon-http/session.ts` 원본 코드 + 다수 실사용 이슈 리포트 | ✅ VERIFIED |
| 8 | `db.batch([...])`는 neon-http에서 지원되며 내부적으로 `client.transaction(builtQueries, ...)`를 호출한다 | Drizzle batch-api 문서 + `neon-http/session.ts` 원본 | ✅ VERIFIED |
| 9 | Neon HTTP `transaction()`은 여러 쿼리를 **단일 HTTP 요청의 비대화형 트랜잭션**으로 보내며 `isolationLevel`·`readOnly`·`deferrable` 옵션을 지원 | Neon serverless-driver 문서 + serverless README | ✅ VERIFIED |
| 10 | WebSocket `Pool`/`Client`는 **단일 요청 핸들러 안에서 생성·사용·종료**해야 하며 핸들러 밖(모듈 스코프)에서 만들면 안 된다 | serverless README + Neon choose-connection | ✅ VERIFIED |
| 11 | Vercel Neon 통합이 주입하는 환경변수: `DATABASE_URL`(풀드/PgBouncer), `DATABASE_URL_UNPOOLED`(다이렉트), `PGHOST`/`PGHOST_UNPOOLED`/`PGUSER`/`PGDATABASE`/`PGPASSWORD`, 레거시 `POSTGRES_*` | Neon vercel 통합 가이드 + 도메인 한정 검색 결과 | ✅ VERIFIED |
| 12 | 통합은 Production·Development에 먼저 변수를 설정하고, Preview 배포 시 Preview 환경에도 설정한다. Preview 배포마다 copy-on-write Neon 브랜치가 생성·정리된다 | Neon vercel 통합 가이드 + 검색 교차 | ✅ VERIFIED |
| 13 | 마이그레이션에는 **비풀드(다이렉트) 연결 문자열**을 써야 하며, 풀드 연결 사용 시 오류가 발생할 수 있다 | Neon drizzle-migrations 가이드 + choose-connection ("항상 다이렉트 사용") | ✅ VERIFIED |
| 14 | 풀드 연결은 호스트명에 `-pooler`가 붙고 PgBouncer transaction 모드로 동작한다 | Neon connection-pooling 문서 | ✅ VERIFIED |
| 15 | `drizzle-kit generate`(SQL 생성) / `migrate`(미적용분 적용) / `push`(파일 없이 직접 반영) / `pull`(역생성) 역할 구분, 적용 이력은 `drizzle` 스키마의 `__drizzle_migrations` 테이블 | Drizzle migrations + drizzle-kit-migrate 문서 | ✅ VERIFIED |
| 16 | `migrate()`를 `drizzle-orm/neon-http/migrator`에서 임포트해 프로그래밍 방식으로 실행할 수 있다 | Neon drizzle-migrations 가이드(스크립트 예시) | ✅ VERIFIED |
| 17 | `onConflictDoUpdate({ target, set, targetWhere, setWhere })` 지원, `set`에서 `sql\`excluded.column\`` 사용 가능, 복합 타깃은 배열 | Drizzle insert 문서 | ✅ VERIFIED |
| 18 | `pgTable` 세 번째 인자는 **배열 반환 콜백**이 표준이며(0.36.0 도입) 객체 반환은 deprecated. 0.36.0은 drizzle-kit 0.27.0 이상 요구 | Drizzle 0.36.0 릴리즈 노트 + 관련 이슈 + indexes-constraints 문서 예시 | ✅ VERIFIED |
| 19 | 타입 추론은 `typeof table.$inferSelect` / `$inferInsert`(동등: `InferSelectModel`/`InferInsertModel`) | Drizzle goodies 문서 + schema declaration 문서 | ✅ VERIFIED |
| 20 | `unique()`·`unique('name').on(...)`·`index()`·`uniqueIndex()`·`primaryKey({ columns })`·`references(() => ...)` 구문 | Drizzle indexes-constraints 문서 | ✅ VERIFIED |
| 21 | Neon Free 플랜: 스토리지 0.5 GB/프로젝트, 컴퓨트 100 CU-hours/프로젝트, 프로젝트 100개, 브랜치 10/프로젝트, 오토스케일 최대 2 CU, 공용 네트워크 전송 5 GB/프로젝트, 수동 스냅샷 1개·instant restore 6시간 | Neon plans 문서 | ✅ VERIFIED |
| 22 | Neon은 기본적으로 **5분 비활성 후 scale to zero**되며 Free에서는 비활성화 불가. 정지 후 첫 쿼리는 컴퓨트 기동으로 수백 ms가 추가되고 버퍼가 차가워 초기 쿼리가 느릴 수 있다 | Neon plans + scale-to-zero + connection-latency (독립 3페이지) | ✅ VERIFIED |
| 23 | Next.js **15.0.0-RC부터 GET Route Handler 기본 캐싱이 static → dynamic으로 변경**됨 (현행 문서 버전 16.3.5) | Next.js route.js 레퍼런스 Version History | ✅ VERIFIED |
| 24 | `vercel env pull [file]`은 기본적으로 development 환경변수를 파일로 내려받고 `--environment`/`--git-branch` 플래그를 지원. `vercel build`/`vercel dev` 사용 시에는 `vercel pull` 사용 | Vercel CLI 공식 문서 | ✅ VERIFIED |
| 25 | Vercel **Edge Config는 Global Config로 개명**됐고, "자주 읽고 드물게 쓰는" 데이터용 읽기 최적화 저장소(읽기 P99 15 ms 이내, 쓰기는 API·가변 지연) | Vercel global-config 문서 + 개명 changelog 링크 | ✅ VERIFIED |
| 26 | Upstash Redis Free: 최대 데이터 256 MB, 월 50만 커맨드 | Upstash pricing 페이지 + Upstash 블로그(신규 가격 정책) | ✅ VERIFIED |
| 27 | Web Push 발송 시 404/410 응답은 구독 소멸을 의미하며 애플리케이션 서버는 해당 endpoint를 저장소에서 삭제해야 한다 (RFC 8030 §7.3) | Web Push 오류 코드 해설 + 복수 라이브러리 이슈 리포트(RFC 인용 일치) | ✅ VERIFIED |
| 28 | `neon-http`(HTTP) 드라이버가 **풀드(`-pooler`) 연결 문자열을 반드시 요구**하는가 | 검색 요약은 "서버리스에서 풀드 + `neon()` 권장"이라 했으나, Neon 1차 문서(serverless-driver / choose-connection)에는 HTTP 드라이버에 풀러가 **필수**라는 서술이 없음 | ⚠️ DISPUTED → SKILL.md에 "HTTP는 앱 측 풀링이 불필요하며, `DATABASE_URL`(풀드)을 쓰는 것은 통합 기본값이자 안전한 선택"으로 정정 기술 |
| 29 | Vercel **빌드 커맨드에서 `drizzle-kit migrate` 실행**이 공식 권장 방식인가 | Drizzle 공식은 CI/CD 파이프라인 또는 앱 시작/배포 시점 실행만 언급, 빌드 단계 실행에 대한 공식 권장·금지 서술을 찾지 못함 | ❓ UNVERIFIED → SKILL.md 6절에 "공식 권장으로 문서화되어 있지 않음"을 명시하고, 프리뷰 동시 빌드 근거를 든 **운영 권고**임을 `주의` 문구로 표기 |

**집계: VERIFIED 27 / DISPUTED 1 / UNVERIFIED 1 (총 29건)**

> DISPUTED(28번)는 1차 문서 기준으로 내용을 정정해 반영했고, UNVERIFIED(29번)는 제거하지 않고 "공식 근거 없음 + 판단 근거 명시" 형태로 `주의` 표기해 남겼다.

---

### 4-2. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 1건은 1차 문서 기준으로 정정 반영)
- [✅] 버전 정보가 명시되어 있음 (drizzle-orm 0.45.2 / drizzle-kit 0.31.10 / @neondatabase/serverless 1.1.0 / Next.js 16.x, Neon 한도 기준일 2026-09-17)
- [✅] deprecated된 패턴을 권장하지 않음 (pgTable 3번째 인자 객체 반환 대신 배열 콜백 사용, 레거시 `POSTGRES_*` 변수 사용 금지 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (스키마·config·db 클라이언트·migrate 스크립트·Route Handler 3종이 import까지 완결)

### 4-3. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (드라이버 2종 비교, 풀드/비풀드 분리, 마이그레이션 명령 차이)
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (neon-http vs neon-serverless 선택 기준, 대안 저장소 4종 비교표)
- [✅] 흔한 실수 패턴 포함 (안티패턴 12종)

### 4-4. 실용성
- [✅] 에이전트가 참조 시 실제 코드 작성에 도움 (구독 upsert·조회·410 정리 Route Handler 완결 예시)
- [✅] 지나치게 이론적이지 않고 실용적 예시 포함 (검증 로직·IDOR 방지·cron 시크릿 검증 포함)
- [✅] 범용적으로 사용 가능 (로컬 프로젝트명·절대경로 비종속. 대상 시나리오는 "개인용 PWA 푸시 알림 앱" 일반 서술로만 기술)

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-17, typescript-backend-developer 3회 / 2026-09-28 재검증 후 general-purpose 2회 재테스트)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-09-17 3/3, 2026-09-28 2/2 근거 섹션·줄번호 정확 인용)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (FAIL 없음 — 보완 불필요, gap만 기록)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-28 (재테스트)
**수행자**: skill-tester → general-purpose (2회 병렬 호출, typescript-backend-developer 미등록으로 대체)
**수행 방법**: 2026-09-28 재검증(2차)에서 정정된 drizzle-orm/kit 버전(0.45.2→0.45.3, 0.31.10→0.31.11)과 Neon Free 한도 재확인 내용을 겨냥해 SKILL.md + REFERENCE.md Read 후 실전 질문 2개 답변, 근거 섹션·줄번호 확인

### 실제 수행 테스트 (재테스트)

**Q1. drizzle-orm 0.45.2→0.45.3 / drizzle-kit 0.31.10→0.31.11 패치 적용 시 기존 pgTable 배열 콜백·onConflictDoUpdate·db.batch() 코드가 깨지는지, v1.0.0 정식 출시 여부**
- ✅ PASS
- 근거: SKILL.md 상단 메타(15행)·§1 "주의(버전 정책)"(45행), §5 문법 포인트(198행), §7 upsert/batch 예시(311-354행)
- 상세: 0.45.x 라인 09-21 패치(Netlify DB 드라이버 추가)가 Neon/스키마 API에 영향 없음을 정확히 인용했고, v1은 여전히 RC 단계(공식 rc dist-tag 1.0.0-rc.4)이며 GA되지 않았음을 정확히 답변. pgTable 배열 콜백(0.36.0 도입)·onConflictDoUpdate·batch 모두 이번 패치로 깨지지 않는다고 정확히 판정.

**Q2. Neon Free 플랜 한도 축소설 확인 + 1분 간격 keep-alive cron의 안전성**
- ✅ PASS
- 근거: SKILL.md 헤더(16행), §8 "콜드 스타트"·"완화책" 행(364-365행), REFERENCE.md §10 표+해석(160-178행), §12 안티패턴 #11(209행)
- 상세: "09-17과 09-28 수치 변경 없음"을 정확히 인용해 축소설을 반박했고, 1분 간격 keep-alive cron이 안티패턴 #11에 명시적으로 등재된 CU-hours 소진 위험 패턴임을 정확히 지적함.

### 재테스트 발견 gap (보강 권장, 차단 요인 아님)

- Q1: 0.45.3 자체의 상세 변경 로그(diff)가 SKILL.md에 없어 "Neon/스키마 API 영향 없음"이라는 결론에 의존해야 함(간접 추론).
- Q2: keep-alive cron 간격을 "충분히 넓힘"이라고만 정성적으로 권고, 구체적 권장 분(N분) 수치가 없음.

### 재테스트 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리/ORM 사용법 스킬 — 실사용 필수 카테고리 아님 → content test PASS로 APPROVED 유지
- 최종 상태: APPROVED

---

### 최초 테스트 기록 (2026-09-17, 참고용)

**수행일**: 2026-09-17
**수행자**: skill-tester → typescript-backend-developer (domain-specific, 3회 병렬 호출)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션·줄번호 및 안티패턴 회피 확인

### 실제 수행 테스트

**Q1. neon-http에서 db.transaction() 시도 시 에러 원인과 대안(batch/neon-serverless)**
- ✅ PASS
- 근거: SKILL.md 3절 드라이버 비교 표, 7절 "트랜잭션 — neon-http에서는 batch", 12절 안티패턴 #3, 9-3절 예시
- 상세: `No transactions support in neon-http driver` throw 근거를 정확히 인용했고, 비대화형 원자 처리는 `db.batch([...])`, 대화형 분기가 필요하면 `neon-serverless` + 핸들러 내부 `Pool` 생성·`end()` 패턴으로 정확히 분기 답변함. 문서 내 3개 절(3/7/12절)의 일관성도 확인.

**Q2. Web Push 구독 upsert 패턴(endpoint UNIQUE + onConflictDoUpdate) + 클라이언트 userId 신뢰 여부**
- ✅ PASS
- 근거: SKILL.md 5절 스키마(`endpoint.unique()`), 7절 `onConflictDoUpdate({ target: endpoint, set: {...} })`, 9-1절 Route Handler, 12절 안티패턴 #8·#9
- 상세: UNIQUE 제약 없이 insert만 할 때의 중복 문제(안티패턴 #9)와 클라이언트 userId를 그대로 신뢰하면 안 되는 이유(안티패턴 #8, IDOR)를 모두 근거와 함께 정확히 답변. 세션 userId만 사용하는 9-1절 코드의 주석("클라이언트가 보낸 userId는 절대 신뢰하지 않고 세션 값만 쓴다")까지 인용함.

**Q3. 마이그레이션 시 DATABASE_URL vs DATABASE_URL_UNPOOLED + Vercel 빌드 자동화 여부**
- ✅ PASS
- 근거: SKILL.md 0절 요약표, 2절 환경변수 표, 4절 drizzle.config.ts, 6절 "Vercel 빌드 단계에서 마이그레이션을 돌려도 되나", 12절 안티패턴 #5, 13절 체크리스트
- 상세: 마이그레이션은 `DATABASE_URL_UNPOOLED`(다이렉트) 사용, 풀드 사용 시 PgBouncer transaction 모드에서 DDL 실패 가능성을 정확히 답변. 빌드 커맨드 자동화는 "공식 권장으로 문서화되어 있지 않음"이라는 SKILL.md의 UNVERIFIED 표기(주의 문구)까지 정확히 구분해서 전달함.

### 발견된 gap (보강 권장, 차단 요인 아님)

- Q1: `db.batch()` 호출 시 `isolationLevel` 등 옵션을 실제로 넘기는 코드 예시가 없음(사실 언급만 존재). `neon-serverless`의 `db.transaction()` 콜백 내부에서 조건 분기하는 완결 코드 예시도 부재.
- Q2: `onConflictDoUpdate`의 `set.userId`를 항상 덮어써 "기기를 다른 계정이 재등록하면 소유권이 이전"되는 트레이드오프에 대한 보안 주석이 없음(endpoint 자체가 추측 불가 랜덤값이라 실질 위험은 낮음).
- Q3: "Production 배포에만 마이그레이션 분기" 구현 예시(`VERCEL_ENV` 체크 코드) 및 GitHub Actions 워크플로 yml 예시가 없음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리/ORM 사용법 스킬 — 실사용 필수 카테고리 아님 (content test PASS로 APPROVED 전환 가능)
- 최종 상태: APPROVED

---

### 권장 테스트 질문 후보 (참고용 — 위 3개 실제 수행으로 대체)

1. "Vercel 서버리스 Route Handler에서 Web Push 구독을 저장하려는데, 같은 브라우저가 재구독하면 행이 중복된다. Drizzle + Neon으로 어떻게 해결하나?" (기대: `endpoint` UNIQUE + `onConflictDoUpdate` + `excluded.*`, 세션 userId 사용)
2. "구독 저장과 오래된 구독 삭제를 한 번에 원자적으로 처리하려고 `db.transaction()`을 썼더니 에러가 난다. 왜이고 어떻게 고치나?" (기대: neon-http는 transaction 미지원 → `db.batch()` 또는 neon-serverless, 대화형 필요 여부로 분기)
3. "Neon 무료 티어로 6명 앱을 운영하는데 첫 요청이 느리다. 원인과 대응은?" (기대: 5분 scale-to-zero + 콜드 스타트, 기동 수백 ms, keep-alive cron은 CU-hours 소진 트레이드오프)
4. "마이그레이션을 Vercel 빌드에서 돌려도 되나? 연결 문자열은 어떤 걸 쓰나?" (기대: `DATABASE_URL_UNPOOLED`, 공식 권장은 CI/CD·배포 시점, 프리뷰 동시 빌드 위험)

---

### [2026-09-28] 재검증(2차) — drizzle-orm/kit 패치 버전 정정, Neon Free 한도 변경 없음

**수행일**: 2026-09-28
**수행 방법**: SKILL.md + REFERENCE.md Read → 핵심 클레임 3개를 `curl registry.npmjs.org`(dist-tags·time 포함) + WebSearch로 1차 소스 대조

**클레임 대조 결과**:
1. `drizzle-orm` dist-tag `latest` — DISPUTED(정정) → 0.45.2(03-27) 이후 0.45.3(09-21) 배포 확인. GitHub 릴리즈 노트 확인 결과 Netlify DB 드라이버 추가가 전부이며 스키마/쿼리/마이그레이션 API에 영향 없음. `drizzle-kit`도 0.31.10(03-17)→0.31.11(09-21)로 동시 패치, v1은 여전히 RC(공식 `rc` dist-tag=1.0.0-rc.4, 최신 프리릴리즈 빌드는 rc.5 계열 09-09 그대로 — GA 안 됨)
2. `@neondatabase/serverless` 최신 버전 1.1.0(2026-04-17) — VERIFIED, 변경 없음
3. Neon Free 플랜 한도(스토리지 0.5GB·컴퓨트 100 CU-hours·브랜치 10·오토스케일 최대 2CU·5분 scale-to-zero) — VERIFIED (neon.com/docs/introduction/plans, neon.com/faqs/free-plan-limits-and-quotas 09-28 재확인, 09-17 시점과 수치 동일)

**보강(ADD)·축소**: SKILL.md 상단 버전 줄·5절 주의 문구·REFERENCE.md §10 제목의 버전/날짜만 정정. 코드 예시·안티패턴·API 시그니처는 0.45.2→0.45.3, 0.31.10→0.31.11 사이 변경 없어 그대로 유지(축소 없음)

**실전 질문 재검증**:
- Q1. "0.45.3으로 올렸는데 기존 `onConflictDoUpdate`/`db.batch()` 코드가 그대로 동작하나?" → SKILL.md 5·7절 + 릴리즈 노트(Netlify 드라이버 추가만) 근거로 PASS (그대로 동작)
- Q2. "Neon Free로 6명 앱 운영 중인데 한도가 최근에 바뀌었나?" → REFERENCE.md §10 근거로 PASS (09-17과 09-28 수치 동일, 변경 없음)

**재검증 최종 판정**: status **PENDING_TEST 전환** (버전 정정 반영 — 메인이 skill-tester로 재테스트)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ — 2026-09-28 재검증에서 drizzle-orm/kit 버전 정정(0.45.2→0.45.3, 0.31.10→0.31.11) 1건 추가 |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-09-17 3/3 PASS, 2026-09-28 재테스트 2/2 PASS) |
| **최종 판정** | **APPROVED** (재검증 정정분 재테스트 완료) |

> 분류: 라이브러리/ORM 사용법 스킬 — verification-policy 기준상 실사용 필수 카테고리가 아니므로, skill-tester content test PASS(2026-09-17 3/3, 2026-09-28 2/2)로 APPROVED 전환.

---

## 7. 개선 필요 사항

- [✅] skill-tester 2단계 content test 수행 (2026-09-17 완료, 3/3 PASS — typescript-backend-developer / 2026-09-28 재검증 정정분 재테스트 완료, 2/2 PASS — general-purpose)
- [❌] Drizzle v1.0.0이 정식 릴리즈되면 마이그레이션 폴더 구조·관계 정의 API 기준으로 스킬 전면 갱신 필요 (현재 0.45.x 기준) — 차단 요인 아님, v1 정식 릴리즈 시점에 재작성 필요한 선택 보강
- [❌] Neon Free 플랜 한도·Upstash Free 한도는 정책 변동 가능 — 재사용 시 pricing 페이지 재확인 권장 — 차단 요인 아님, 선택 보강
- [❌] 빌드 단계 마이그레이션 실행에 대한 공식 근거를 찾지 못함(UNVERIFIED) — Vercel/Drizzle 공식 가이드가 추가되면 6절 갱신 — 차단 요인 아님, 선택 보강
- [❌] `neon-http` + 풀드 연결 조합의 공식 명시 서술이 없어 "필수 아님"으로만 기술 — Neon 문서 갱신 시 재확인 — 차단 요인 아님, 선택 보강
- [❌] 대량 발송 시 Neon 동시 커넥션·rate limit 관점의 배치 전략 미기술 (6명 규모 범위 밖) — 차단 요인 아님, 선택 보강
- [❌] `db.batch()`에서 `isolationLevel` 등 옵션 실사용 코드 예시 부재, `onConflictDoUpdate`의 userId 덮어쓰기 소유권 이전 트레이드오프 미기술, "Production만 마이그레이션" 분기 구현 예시 부재 (content test 3건에서 발견된 gap) — 차단 요인 아님, 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-17 | v1 | 최초 작성 (Drizzle 공식 10페이지 + Neon 공식 8페이지 + Vercel/Next.js 공식 3페이지 + GitHub 원본 소스 2건 조사, 29개 클레임 교차 검증: VERIFIED 27 / DISPUTED 1 / UNVERIFIED 1) | skill-creator |
| 2026-09-17 | v1 | 2단계 실사용 테스트 수행 (Q1 neon-http 트랜잭션 에러·batch 대안 / Q2 구독 upsert 패턴·IDOR 방지 / Q3 DATABASE_URL vs UNPOOLED·빌드 자동화) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-25 | v1 | 구조 개편: 상세 내용 references/REFERENCE.md 분리 (내용 변경 없음) | skill-creator |
| 2026-09-28 | v1.1 | 재검증(2차) — drizzle-orm 0.45.2→0.45.3, drizzle-kit 0.31.10→0.31.11 버전 정정(API 영향 없음), Neon Free 한도 변경 없음 확인. status APPROVED → PENDING_TEST(재테스트 대기) | Claude (Sonnet 5) |
| 2026-09-28 | v1.1 | 2단계 재테스트 수행 (Q1 0.45.3/0.31.11 패치 영향·v1 GA 여부 / Q2 Neon Free 한도 축소설·keep-alive cron 안전성) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
