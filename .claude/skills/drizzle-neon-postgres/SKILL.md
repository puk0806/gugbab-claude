---
name: drizzle-neon-postgres
description: Drizzle 0.45.x + Neon 서버리스 드라이버(Vercel) 버전 기준·함정 — v1 RC를 latest로 착각 금지, neon-http는 transaction 미지원(batch로), WebSocket Pool 수명, 마이그레이션은 UNPOOLED, Vercel 빌드 마이그레이션 동시성, Neon Free 한도(2026-10 스토리지 1 GB)·scale-to-zero
---

# Drizzle ORM + Neon Postgres on Vercel (서버리스)

> 소스:
> - Drizzle: https://orm.drizzle.team/docs/get-started/neon-new , https://orm.drizzle.team/docs/connect-neon , https://orm.drizzle.team/docs/sql-schema-declaration , https://orm.drizzle.team/docs/indexes-constraints , https://orm.drizzle.team/docs/insert , https://orm.drizzle.team/docs/batch-api , https://orm.drizzle.team/docs/migrations , https://orm.drizzle.team/docs/drizzle-kit-migrate , https://orm.drizzle.team/docs/upgrade-v1
> - Neon: https://neon.com/docs/serverless/serverless-driver , https://neon.com/docs/connect/choose-connection , https://neon.com/docs/connect/connection-pooling , https://neon.com/docs/guides/drizzle , https://neon.com/docs/guides/drizzle-migrations , https://neon.com/docs/guides/vercel-native-integration , https://neon.com/docs/introduction/plans , https://neon.com/docs/introduction/scale-to-zero
> - Vercel: https://vercel.com/docs/cli/env , https://vercel.com/docs/global-config
> - GitHub: https://github.com/neondatabase/serverless , https://github.com/drizzle-team/drizzle-orm
>
> 검증일: 2026-11-06
> 기준 버전: `drizzle-orm` **0.45.4**(2026-10-08, dist-tag `latest`) / `drizzle-kit` **0.31.11**(2026-09-21) / `@neondatabase/serverless` **1.2.0**(2026-10-01) / Next.js 16.x App Router
> Neon 무료 티어 한도는 2026-11-06 기준 공식 plans 페이지 값으로 확인 — **스토리지가 0.5 GB → 1 GB/프로젝트(전 프로젝트 합계 20 GB)로 상향**(2026-10 초 변경), 나머지 수치는 동일
>
> 대상 시나리오: **개인용 PWA 푸시 알림 앱(사용자 6명)**. Web Push 구독(endpoint·p256dh·auth)과 사용자별 알림 시각 목록을 저장. Vercel Hobby + Neon Free로 운영.

---

## 이 스킬의 범위

버전 기준(0.45 vs v1 RC), neon-http/neon-serverless 제약, Vercel·Neon 운영 함정, Free 한도만 싣는다.
> 기본 사용법(스키마 정의·select/insert/upsert·drizzle-kit 명령·drizzle.config 예제)은 공식 문서 수준이라 싣지 않는다.

---

## 1. 버전 기준 — `latest`는 0.45.x, v1은 RC

> **주의(버전 정책):** Drizzle 공식 get-started 문서는 현재 `npm i drizzle-orm@rc` / `drizzle-kit@rc`(= v1.0.0-rc 계열, 공식 `rc` dist-tag는 2026-10-21부터 **1.0.0-rc.5**)를 안내한다. 그러나 **dist-tag `latest`는 11-06 기준 0.45.4**이며(0.45.4는 postgres-js의 명명 prepared statement 수정뿐 — 이 스킬이 다루는 Neon/스키마 API에는 영향 없음) v1은 여전히 RC 단계다. v1에서는 마이그레이션 폴더 구조가 바뀌고(`journal.json` 제거, `drizzle-kit drop` 삭제, `drizzle-kit up`으로 구조 이전) 관계형 쿼리 API도 바뀐다. 개인 프로젝트를 안정적으로 굴릴 목적이면 **0.45.x + drizzle-kit 0.31.x 고정**을 기본값으로 삼고, v1 RC는 의도적으로 선택할 때만 쓴다.

> **주의:** `relations()` 형태와 `db.query.*` 관계형 쿼리는 **0.45.x 기준**이다. v1에서는 관계 정의·쿼리 API가 바뀌어 별도 마이그레이션 경로가 필요하다(공식 upgrade 문서). 소규모 앱은 관계형 쿼리 없이 `leftJoin` 또는 쿼리 2번으로 끝내는 편이 업그레이드 부담이 적다.

- 테이블 세 번째 인자는 **배열 반환 콜백**(`(t) => [...]`). 0.36.0부터 배열이 표준이고 객체 반환은 deprecated.
- `@neondatabase/serverless` 1.2.0(2026-10-01)은 하위 호환 기능 추가뿐 — `neon()`·`transaction()`이 연결 문자열 대신 `user`/`password`/`host` 등 개별 파라미터(함수로 매 쿼리 해석 가능)도 받는다. **JSR 배포가 중단**돼 Deno 등은 `npm:@neondatabase/serverless`로 참조.
- 한 패키지에 HTTP(`neon()`)와 WebSocket(`Pool`/`Client`)이 모두 있고, 선택은 import 경로(`drizzle-orm/neon-http` vs `drizzle-orm/neon-serverless`)로 한다. Node에서 WebSocket 경로를 쓸 때만 `ws` 필요.

---

## 2. 드라이버 선택 — 제약이 핵심

| | `drizzle-orm/neon-http` | `drizzle-orm/neon-serverless` |
|---|---|---|
| 적합 | 단발 쿼리 / 비대화형 배치 (서버리스·Edge) | 대화형 트랜잭션, `pg` 드롭인 |
| 왕복 | 적음(설정 ~3회) | 많음(~8회) |
| `db.transaction()` | ❌ **`No transactions support in neon-http driver` throw** | ✅ |
| `db.batch([...])` | ✅ (내부적으로 Neon HTTP `transaction()` 한 번) | — |
| 클라이언트 수명 | `neon()`+`drizzle()`은 **모듈 최상위 1회 생성이 정상** | `Pool`/`Client`는 **핸들러 안에서 생성→사용→`end()`** |

- `batch`는 쿼리 배열을 미리 만들어 한 번에 보낸다 — **앞 쿼리 결과로 뒤 쿼리를 바꾸는 것은 불가** → 필요하면 `neon-serverless`.
- Neon HTTP `transaction()`은 `isolationLevel`·`readOnly`·`deferrable` 옵션 지원.

> Neon 공식 문서: 서버리스에서는 "WebSocket 커넥션이 단일 요청보다 오래 살 수 없다". `Pool`/`Client`는 **요청 핸들러 밖에서 만들지 말 것.** 반대로 요청마다 `new Pool()` 후 닫지 않으면 커넥션 누수.

---

## 3. Vercel Marketplace 환경변수·마이그레이션

| 환경변수 | 용도 |
|----------|------|
| `DATABASE_URL` (풀드, 호스트에 `-pooler`) | 앱 런타임 |
| `DATABASE_URL_UNPOOLED` (다이렉트) | **마이그레이션**, `CREATE INDEX CONCURRENTLY`, `LISTEN/NOTIFY` |
| `PGHOST` / `PGHOST_UNPOOLED` / `PGUSER` / `PGDATABASE` / `PGPASSWORD` | 직접 조립용 |
| `POSTGRES_*` (레거시) | 구 Vercel 템플릿 호환 — 신규 코드 미사용 |

- 마이그레이션에 풀드 연결을 쓰면 PgBouncer transaction 모드에서 DDL·세션 의존 작업이 실패할 수 있다(Neon 공식) → `drizzle.config.ts`의 `dbCredentials.url`은 `DATABASE_URL_UNPOOLED`.
- 변수는 Production·Development에 먼저, Preview 배포가 생기면 Preview에도 주입. Preview 브랜치 옵션을 켜면 Preview 배포마다 Neon 브랜치(copy-on-write)가 생기고 배포 삭제 시 정리된다.
- 로컬: `vercel link` → `vercel env pull .env.local`(대시보드 변경 후 다시 pull). 파일 없이 `vercel env run -- next dev`. `vercel build`/`vercel dev`는 `vercel pull`.
- **Vercel 빌드 단계 마이그레이션**: Drizzle 공식 권장은 ① CI/CD에서 `migrate` ② 앱 시작/배포 시점 `migrate()`. "`buildCommand`에 `drizzle-kit migrate`"는 공식 권장으로 문서화되어 있지 않고, 빌드는 Preview 포함 병렬로 돌아 같은 DB에 동시 DDL이 생길 수 있다. 기본값은 배포 전 로컬/Actions에서 `generate && migrate` 한 번. 굳이 넣는다면 `UNPOOLED` + Production에만.

> **주의:** 위 "빌드 단계에 넣지 말라"는 공식 금지 문구가 아니라, 공식 권장 경로(CI/CD·배포 시점) + 프리뷰 배포 동시성이라는 검증된 사실에서 도출한 운영 권고다.

- 런타임 요청 핸들러에서 `migrate()` 금지(동시 DDL 경쟁·콜드 스타트). 프로덕션 `drizzle-kit push` 금지(이력 없음, rename이 drop+create로 처리되면 데이터 소실).

---

## 4. 서버리스 운영 함정

| 항목 | 내용 |
|------|------|
| 콜드 스타트 | 함수 콜드 스타트 + **Neon scale-to-zero(5분 비활성 후, Free에서 비활성화 불가)** 가 겹친다. suspend 후 첫 쿼리는 컴퓨트 기동에 수백 ms 추가, 7일 이상 idle이면 조금 더 길 수 있다 |
| keep-alive cron | 1분 간격 `SELECT 1`은 컴퓨트를 상시 깨워 Free **100 CU-hours를 빠르게 소진** — 소규모 앱은 지연 수용이 정답 |
| 리전 | Hobby는 함수 리전 선택이 제한적 → **Neon 리전을 Vercel 기본 리전에 맞춰 생성** |
| 캐싱 | Next.js 15부터 GET Route Handler 기본 static → dynamic. 의도 표시로 `export const dynamic = 'force-dynamic'` |
| Web Push 정리 | 푸시 서비스가 **404/410**(RFC 8030)을 주면 그 endpoint 행 삭제. 그 외 오류는 구독 유지 |
| web-push 4.0.0 | (2026-11-06) ESM 전용·default export 없음 → `import * as webpush from 'web-push'`. `import webpush from 'web-push'`는 4.x에서 깨짐. CJS `require`는 require(esm) 지원 Node 20.19+/22.12+에서만 |
| 보안 | 구독 저장 시 클라이언트가 보낸 `userId` 신뢰 금지(IDOR) — 세션 userId로 모든 쿼리 스코프. `endpoint` UNIQUE + `onConflictDoUpdate`로 중복 알림 방지. cron 핸들러는 `CRON_SECRET` 검증 |

---

## 5. Neon Free 한도 — 2026-11-06 기준(최초 확인 2026-09-17)

| 항목 | Free plan |
|------|-----------|
| 스토리지 | **1 GB / 프로젝트**, 전 Free 프로젝트 합계 20 GB (2026-10 초 0.5 GB에서 상향. 초과 과금 없이 쓰기 실패) |
| 컴퓨트 | **100 CU-hours / 프로젝트·월** (0.25 CU 기준 약 400시간) |
| 오토스케일 상한 | 최대 2 CU (8 GB RAM) |
| Scale to zero | **5분 비활성 후 자동 정지, 비활성화 불가** |
| 프로젝트 수 | 100 |
| 브랜치 | **10 / 프로젝트** (추가 브랜치 불가) — Preview 브랜치 남발 시 먼저 걸림 |
| Instant restore | 6시간(변경 이력 최대 1 GB/프로젝트), 수동 스냅샷 1개 |
| 네트워크 전송(공용) | 5 GB / 프로젝트·월 |
| 모니터링 보존 | 1일 |

> 위 수치는 정책 변경 가능 항목이다. 재사용 시 plans 페이지를 다시 확인한다.

### 대안 판단 (소규모)

- 시각/사용자 조건 검색 → Postgres. 키로만 꺼냄 → Upstash Redis(무료 256 MB·월 50만 커맨드). 설정값 → **Vercel Global Config**(구 Edge Config, 읽기 P99 15 ms·쓰기는 API·변동 지연이라 자주 쓰는 데이터엔 부적합). 파일 → Vercel Blob.
