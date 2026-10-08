# 스킬 목록

> **위치 규칙 (2026-10-05):** 스킬 본체는 1단 `.claude/skills/<이름>/SKILL.md`에 있다 — Claude Code는 이 깊이만 스킬로 등록한다(카테고리 폴더로 한 단계 더 중첩하면 스킬 목록에 뜨지 않는다). 아래 카테고리는 이 `docs/skills/<카테고리>/<이름>/` 검증 문서 위치로만 구분하며, `project-install.sh`가 이 위치를 읽어 템플릿별로 걸러 설치한다.

| 카테고리 | 종류 | 설명 |
|----------|------|------|
| [frontend](./frontend/README.md) | 78종 | 프레임워크·상태관리·UI·빌드·테스트·성능·SEO·LLM·i18n·꿈/운세 앱 UI |
| [backend](./backend/README.md) | 52종 | Rust·Java(레거시/모던)·Python·TypeScript(Hono/Prisma/Zod/Better Auth/Drizzle/Neon)·Claude Code CLI·만세력 백엔드·넥사크로 레거시 백엔드 마이그레이션(SB 1→2·iBATIS→MyBatis) |
| [devops](./devops/README.md) | 11종 | Docker·GitHub Actions·n8n·Vercel Sandbox/Workflow·SEO 운영 |
| [architecture](./architecture/README.md) | 6종 | DDD·프론트 도메인 구조·모듈 경계·점진 리팩터링·꿈/운세 앱 데이터 모델링 |
| [humanities](./humanities/README.md) | 9종 | 꿈 심리학·애착 이론·위기 개입·사주/타로/손금 전통 |
| [writing](./writing/README.md) | 4종 | SEO 콘텐츠 품질 |
| [game](./game/README.md) | 16종 | Unity 2D 게임 개발·출시·수익화 |
| [health](./health/README.md) | 5종 | 건강·식단·영양 (KDRIs·한국 식품 DB·식단 프롬프트) |
| [meta](./meta/README.md) | 5종 | 프롬프트 엔지니어링(꿈·운세)·훅 작성법 |
| [spec](./spec/README.md) | 4종 | 레거시 스펙 추출 — 공통 방법론·양식, Spring/MyBatis·React 추출, 특성화 테스트 |
| [nexacro](./nexacro/README.md) | 5종 | 넥사크로 17 소스 읽기·X-API 서버·React 대응표·REST 전환·Strangler 공존 |

---

## 검증 상태

스킬별 검증 문서는 각 카테고리 폴더의 `{스킬명}/verification.md`에 있다.

- **`APPROVED`** — 내용 검증 + 실사용/content 테스트 완료
- **`PENDING_TEST`** — 내용 검증 완료, 실행 결과로만 확인 가능한 항목이 남음 (사용은 가능)
- 남은 PENDING_TEST 스킬과 **각각의 졸업 조건**은 → [PENDING_TEST.md](./PENDING_TEST.md)
