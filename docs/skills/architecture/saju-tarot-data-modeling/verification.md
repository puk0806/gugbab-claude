---
skill: saju-tarot-data-modeling
category: architecture
version: v1.3
date: 2026-09-28
status: APPROVED
---

# saju-tarot-data-modeling 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `saju-tarot-data-modeling` |
| 스킬 경로 | `.claude/skills/architecture/saju-tarot-data-modeling/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-09-10 · 09-25 모델ID 현행화 · 09-28 재검증) |
| 검증자 | skill-creator (Claude Code) |
| 스킬 버전 | v1.2 |
| 대상 버전 기준 | Dexie 4.4.6 (2026-09-28 기준 최신 안정 — 최초 검증 시점 4.4.5, v5 없음) / 개인정보 보호법·시행령 현행 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (dexie.org, MDN, 국가법령정보센터, KASI/공공데이터포털)
- [✅] 공식 GitHub 2순위 소스 확인 (dexie/Dexie.js releases, w3c/IndexedDB issue #76)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-09-10 / Dexie 4.4.5)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (입력·파생 분리, EngineStamp 무효화, append-only 동기화, 인덱스=프라이버시)
- [✅] 코드 예시 작성 (TypeScript 타입 정의, Dexie 스키마, upgrade 3종, 캐시 조회, 키 파생)
- [✅] 흔한 실수 패턴 정리 (섹션 12, 12항목)
- [✅] SKILL.md 파일 작성 (`user-invocable: false` 포함)
- [✅] 참고 템플릿(`architecture/dream-journal-data-modeling`) 구조 준수 — 엔티티 정의 → Dexie 스키마 → 인덱스 근거 → 마이그레이션 → 쿼리/운영 → 프라이버시
- [✅] skill-tester 2단계 실사용 테스트 (2026-09-10 수행, 3/3 PASS)
- [❌] README.md 업데이트 (요청에 의해 **의도적으로 제외** — 본 작업에서 README.md / docs/skills/README.md 수정 금지 지시)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md`, `architecture/dream-journal-data-modeling/SKILL.md` | 8개 섹션 구조 확보, 참고 스킬 구성(엔티티→스키마→마이그레이션→쿼리) 파악 |
| 중복 확인 | Glob | `.claude/skills/**/saju*`, `**/*{saju,tarot,palm}*`, `**/*fortune*` | 동일·유사 스킬 없음. 작성 시점엔 운세 콘텐츠 윤리 짝 스킬이 미존재해 참조만 기재했고, 2026-09-11 해당 스킬 삭제로 참조를 `meta/fortune-interpretation-prompt-engineering`·`humanities/palmistry-limitations`로 대체 |
| 조사 | WebSearch | Dexie 최신 버전, 사주 절기/야자시, 대운 계산, 한국 표준시 이력, 만세력 JS 라이브러리, 타로 78장/켈틱크로스, 개인정보보호법 민감정보·아동, dexie-encrypted, IndexedDB boolean 키 | 9개 검색, 1순위 공식 소스 6종 + 참고 소스 다수 수집 |
| 조사 | WebFetch | dexie.org(Version.stores·IndexSpec·Indexable-Type·libs/dexie-encrypted·cloud), GitHub releases, MDN(Basic Terminology·estimate·CryptoKey), ko.wikipedia(사주팔자·대운), en.wikipedia(Rider–Waite·Time in South Korea) | 12개 페이지 직접 확인. npmjs.com은 403으로 접근 불가 → GitHub Releases로 대체 |
| 교차 검증 | WebSearch + WebFetch | 13개 클레임, 각 독립 소스 2개 이상 | VERIFIED 10 / DISPUTED 2 / UNVERIFIED 1 |

> SKILL.md의 모든 외부 사실 주장은 위 WebSearch·WebFetch 호출로 확인한 소스에 근거한다. 도구로 확인하지 못한 항목(C13)은 본문에서 근거로 사용하지 않고 `> 주의` 표기로 남겼다.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Dexie 공식 문서 | https://dexie.org/ | ⭐⭐⭐ High | 2026-09-10 | 1순위 |
| Dexie Version.stores() | https://dexie.org/docs/Version/Version.stores() | ⭐⭐⭐ High | 2026-09-10 | 스키마 문법(`++`·`&`·`*`·`[a+b]`) |
| Dexie IndexSpec | https://dexie.org/docs/IndexSpec | ⭐⭐⭐ High | 2026-09-10 | 유니크 복합 인덱스 `&[a+b]` 지원 확인 |
| Dexie Indexable Type | https://dexie.org/docs/Indexable-Type | ⭐⭐⭐ High | 2026-09-10 | boolean·null·Object 인덱싱 불가 |
| Dexie Version.upgrade() | https://dexie.org/docs/Version/Version.upgrade() | ⭐⭐⭐ High | 2026-09-10 | 업그레이드 트랜잭션 제약 |
| dexie-encrypted 문서 | https://dexie.org/docs/libs/dexie-encrypted | ⭐⭐⭐ High | 2026-09-10 | 인덱스 암호화 불가, TweetNaCl, 3가지 설정 모드 |
| Dexie Cloud | https://dexie.org/cloud/ | ⭐⭐⭐ High | 2026-09-10 | 동기화 테이블 PK `@id` 요구 |
| Dexie GitHub Releases | https://github.com/dexie/Dexie.js/releases | ⭐⭐⭐ High | 2026-09-10 | v4.4.5가 최신 (8/14), v5 없음 |
| MDN IndexedDB Basic Terminology | https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology | ⭐⭐⭐ High | 2026-09-10 | 유효 키 타입(string·date·float·binary·array) |
| MDN StorageManager.estimate() | https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate | ⭐⭐⭐ High | 2026-09-10 | usage/quota는 근사치 |
| MDN CryptoKey | https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey | ⭐⭐⭐ High | 2026-09-10 | extractable 의미. structured clone 여부는 별도 교차 검증(섹션 4 C12) |
| W3C IndexedDB issue #76 | https://github.com/w3c/IndexedDB/issues/76 | ⭐⭐⭐ High | 2026-09-10 | boolean은 유효 키 아님, 복합 인덱스에서도 불가 |
| 개인정보 보호법 / 시행령 (국가법령정보센터) | https://www.law.go.kr/LSW/lsInfoP.do?lsId=011357 | ⭐⭐⭐ High | 2026-09-10 | 시행령 제18조 민감정보, 제22조의2 아동, 제58조 적용 일부 제외 |
| KASI Open API 안내 | https://astro.kasi.re.kr/information/pageView/31 | ⭐⭐⭐ High | 2026-09-10 | 음양력·특일(24절기) 정보 제공 |
| 공공데이터포털 한국천문연구원 특일 정보 | https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15012690 | ⭐⭐⭐ High | 2026-09-10 | 24절기 정보 API |
| 사주팔자 (한국어 위키백과) | https://ko.wikipedia.org/wiki/사주팔자 | ⭐⭐ Medium | 2026-09-10 | 사주 구성·월주 절기 기준·야자시/조자시·십성 정의 |
| 대운 (사주팔자) (한국어 위키백과) | https://ko.wikipedia.org/wiki/대운_(사주팔자) | ⭐⭐ Medium | 2026-09-10 | 10년 주기, 순행/역행, 대운수 = 절입일까지 일수 ÷ 3 |
| Rider–Waite Tarot (영문 위키백과) | https://en.wikipedia.org/wiki/Rider–Waite_Tarot | ⭐⭐ Medium | 2026-09-10 | 78장(22+56), 1909년 초판, 퍼블릭 도메인 상태 |
| Time in South Korea (영문 위키백과) | https://en.wikipedia.org/wiki/Time_in_South_Korea | ⭐⭐ Medium | 2026-09-10 | UTC+8:30↔+9 변경 이력, 1988 서머타임 |
| 사주·만세력 해설 블로그·커뮤니티 다수 | (검색 결과) | ⭐ Low | 2026-09-10 | 방향 탐색용으로만 사용. **SKILL.md 본문 근거로 채택하지 않음** |
| npm dexie 페이지 | https://www.npmjs.com/package/dexie | — | 2026-09-10 | HTTP 403으로 직접 확인 실패 → GitHub Releases로 대체 |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 교차 검증한 클레임과 판정

| # | 클레임 | 판정 | 근거 소스(2개 이상) |
|---|--------|------|---------------------|
| C1 | Dexie 최신 안정은 4.4.5이며 v5는 없다 | ✅ VERIFIED | GitHub Releases(4.4.5, 8/14) + npm 버전 목록 검색 결과 |
| C2 | Dexie 스키마 기호: `++`(auto PK)·`&`(unique)·`*`(multi-entry)·`[a+b]`(compound) | ✅ VERIFIED | Version.stores() 문서 + IndexSpec 문서 |
| C3 | `&[a+b]` 유니크 복합 인덱스를 지원한다 | ✅ VERIFIED | IndexSpec(unique/compound 플래그 조합) + Version.stores() 예제 |
| C4 | IndexedDB 유효 키는 string·number·Date·binary·array이며 boolean·null·undefined·Object는 키가 될 수 없다 | ✅ VERIFIED | Dexie Indexable Type + MDN Basic Terminology |
| C5 | 인덱스 키가 무효면 add()/put()이 실패하는 게 아니라 **해당 인덱스 항목만 조용히 생략**된다 | ✅ VERIFIED | w3c/IndexedDB issue #76 스레드 + W3C public-webapps "Multientry with invalid keys" 아카이브 |
| C6 | `.upgrade()` 콜백 안에서 별도 트랜잭션을 열면 업그레이드 트랜잭션이 중단된다 / 각 버전 `.stores()`는 그 버전 전체 스키마다 | ✅ VERIFIED | Dexie Version.upgrade() 문서 + Version.stores() 문서 |
| C7 | dexie-encrypted는 인덱스를 암호화할 수 없고, 기본 구현은 TweetNaCl이며 NON_INDEXED_FIELDS/UNENCRYPTED_LIST/ENCRYPT_LIST 설정을 제공한다 | ✅ VERIFIED | dexie.org/docs/libs/dexie-encrypted + dexie-encrypted GitHub README |
| C8 | Dexie Cloud 동기화 테이블은 `@id`(전역 유일 서버 생성 ID) PK를 사용한다 | ✅ VERIFIED | dexie.org/cloud 스키마 예시 + Dexie Cloud 문서 본문 |
| C9 | `navigator.storage.estimate()`의 usage/quota는 압축·중복제거·난독화로 인해 근사치다 | ✅ VERIFIED | MDN StorageManager.estimate() + MDN 스토리지 할당량 관련 서술 |
| C10 | 사주에서 연주는 입춘, 월주는 12절(절기) 기준으로 바뀌며 자시 처리(야자시/조자시)는 유파별로 갈린다 | ✅ VERIFIED | ko.wikipedia 사주팔자("24절기를 기준, 학파마다 차이", "야자시·조자시") + KASI/공공데이터포털 24절기 API 제공 사실 |
| C11 | 대운은 10년 주기이고, 순행/역행은 연간 음양과 성별 조합으로 결정되며 대운수는 절입일까지 일수를 3으로 나눠 구한다 | ⚠️ DISPUTED → 수정 반영 | ko.wikipedia 대운 문서는 "양순음역 + 남순여역"으로 서술하고 다수 실무 자료는 "양남음녀 순행"으로 서술 → **SKILL.md에 "통설: 양간 남자·음간 여자 순행"으로 완화 표기**하고, 유파 차이는 `rulesetId`로 파라미터화하도록 설계 지침에 반영 |
| C12 | `CryptoKey`는 structured clone 가능하며 non-extractable 상태로 IndexedDB에 저장·복원할 수 있다 | ⚠️ DISPUTED → 수정 반영 | MDN 페이지 요약본은 "저장 불가"로 읽혔으나, WebCrypto 사양 논의(W3C public-webcrypto 아카이브)와 브라우저 이슈 트래커(Firefox Bugzilla #1348279·#1434898)는 **structured clone 대상이며 저장 가능, 다만 브라우저·키 종류별 DataCloneError 사례 존재**로 확인 → SKILL.md에 "저장 가능 + 브라우저별 왕복 테스트 필수 + 비밀번호 파생 폴백" 형태로 기재 |
| C13 | 한국 표준시 변경 시행 일시(1954/1961)와 1988년 이전 서머타임 구간 전체 | ❌ UNVERIFIED | 영문 위키는 1988년만, 국내 자료는 1987·1988 및 1950년대 시행을 언급하는 등 서술 불일치. IANA tzdb `asia` 파일 fetch에서도 Korea 구간을 확보하지 못함 → **SKILL.md에서 구체 일자를 근거로 삼지 않고 `> 주의(부분 미검증)` 표기 + IANA tz 데이터 위임 권고로 처리** |

> 참고 스킬(`dream-journal-data-modeling`)은 boolean이 복합 인덱스 안에서는 "동작은 한다"고 서술하나, C4·C5 검증 결과 **동작하지 않고 조용히 인덱싱에서 빠진다**. 본 스킬은 `0 | 1` 정수 플래그를 단일 권고로 채택했다.

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 2건은 수정 후 반영)
- [✅] 버전 정보가 명시되어 있음 (Dexie 4.4.5, 검증일 2026-09-10)
- [✅] deprecated된 패턴을 권장하지 않음 (구 dexie-syncable 대신 Dexie Cloud/자체 LWW 서술)
- [✅] 코드 예시가 실행 가능한 형태임 (TypeScript 타입 + Dexie API 시그니처 기준)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description, `user-invocable: false`)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (엔티티 지도, 3대 분리 원칙)
- [✅] 코드 예시 포함 (타입 12종, 스키마, upgrade 3종, 캐시·정리·키 파생 함수)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함 (섹션 12)
- [✅] 짝 스킬 상호 참조 명시 (`frontend/indexeddb-dexie`, `architecture/dream-journal-data-modeling`, `meta/fortune-interpretation-prompt-engineering`, `humanities/palmistry-limitations` — 2026-09-11 기준)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (그대로 붙여 쓸 수 있는 스키마 문자열 제공)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (지연 재계산·만료 정리·중복 생성 방지 코드)
- [✅] 범용적으로 사용 가능 (특정 프로젝트·로컬 경로 종속 없음)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-10, general-purpose 3건)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 근거 섹션 명시 확인)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (해당 없음 — 전건 PASS, 경미한 gap만 발견)

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester 재테스트 — 선택 보강분(중복 구분선 제거·dexie-encrypted 버전 명시) 반영 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 부재로 대체, 2개 병렬 호출)
**수행 방법**: SKILL.md + references/REFERENCE.md Read 후 실전 질문 2개 답변. 질문 1개는 REFERENCE.md §10.2에 신규 반영된 `dexie-encrypted` 버전·유지보수 상태(npm 안정판 2.0.0 정체·베타 4.2.0-beta.2 유지보수 중)를 직접 겨냥, 질문 1개는 SKILL.md 축소(상세 내용 REFERENCE.md 분리) 후에도 §4.1 참조 링크를 따라가면 답이 나오는지·본문 간 모순이 없는지 확인

**Q1. dexie-encrypted 설치 시 버전 주의점 ("최신 버전을 그냥 설치하면 되나?")**
- ✅ PASS
- 근거: REFERENCE.md §10.2 "버전·유지보수 상태(2026-09-28 확인)" 문단(428행)
- 상세: npm `latest` 태그(2.0.0, Dexie 3.x 세대 기준)를 그냥 설치하면 안 되고 Dexie 4.x 프로젝트는 베타 태그(`4.2.0-beta.x`)를 명시적으로 설치해야 한다고 정확히 답변. 인덱스 암호화 불가 원칙(NON_INDEXED_FIELDS 등)까지 정확히 인용

**Q2. 켈틱크로스 위치 설명 문구 수정이 과거 리딩에 소급 적용되는 버그 원인·스키마 설계**
- ✅ PASS
- 근거: REFERENCE.md §4.1 "왜 스프레드를 데이터로 두고 버전까지 붙이나" + §4.2 `TarotSession.spreadVersion` 스냅샷 필드
- 상세: `SpreadDefinition`을 append-only로 다루지 않고(기존 레코드 `put`으로 덮어씀) 수정한 것이 원인이며, 문구 수정 시 새 `version`으로 추가해야 함을 정확히 도출. SKILL.md 축소(REFERENCE.md 분리) 후에도 참조 링크를 따라가 정확한 근거를 찾음 — 축소가 답변 품질에 영향을 주지 않음을 확인

### 발견된 gap (2026-09-28 재테스트, 선택 보강)

- REFERENCE.md §4.1/§9.3에 "마스터 데이터(`SpreadDefinition`·`Deck`)도 append-only로 다뤄야 한다"는 규칙이 암묵적으로만 있고 명시 문장이 없음 — Q2 답변 에이전트가 직접 지적. 차단 요인 아님(§9.3 append-only 철학에서 유추 가능한 수준), 선택 보강으로 기록

### 판정 (2026-09-28 재테스트)

- agent content test: 2/2 PASS
- verification-policy 분류: 실사용 필수 카테고리 아님(데이터 모델링 설계 가이드 — 답변 정확성만으로 검증 가능)
- 최종 상태: **APPROVED** (선택 보강분이 실전 질문에 정확히 반영됨을 확인, 축소 후에도 참조 링크로 답이 나옴을 확인)

---

### [2026-09-28] 선택 보강 반영

2026-09-28 skill-tester 재테스트에서 발견된 gap 2건 반영:

1. **SKILL.md 292~293행 중복 구분선(`---`) 제거** — 서식 오류 수정, 내용 변경 없음, 소스 확인 불필요, status 영향 없음.
2. **REFERENCE.md §10.2 `dexie-encrypted` 버전·유지보수 상태 명시** — npm registry(`https://registry.npmjs.org/dexie-encrypted`)·GitHub API(`https://github.com/dexie/dexie-encrypted`)로 1차 소스 확인: npm 안정 태그는 `2.0.0`(2020-11 배포, 정체)이지만 GitHub는 archived 아님, `4.2.0-beta.2`(2026-03 배포, Dexie 3.x/4.x 공통 지원)까지 베타로 유지보수 중(최종 push 2026-03, open issues 2건). §10.2에 "npm 안정판은 Dexie 3.x 세대 기준 — Dexie 4.x 프로젝트는 베타 태그 명시적 설치 필요" 문구로 반영.

판정: 두 건 다 사실 보강(②는 신규 사실 추가)이라 PENDING_TEST 전환 → 같은 날 skill-tester 재테스트 2/2 PASS로 APPROVED 복귀(섹션 8 참조).

**[2026-09-28] skill-tester 재테스트 — 2차 재검증(Dexie 4.4.5→4.4.6 버전 정정) 반영분 대상**

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 부재로 대체)
**수행 방법**: SKILL.md + references/REFERENCE.md Read 후 2개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인. 질문 1개는 2026-09-28 재검증(2차)에서 정정된 Dexie 4.4.6 버전 표기를 직접 겨냥, 질문 1개는 SKILL.md 축소(REFERENCE.md 분리) 후에도 참조 링크를 따라가면 답이 나오는지 확인

### 실제 수행 테스트

**Q1. Dexie 4.4.6 업그레이드 시 기존 스키마 문법·마이그레이션 코드 재작성 필요 여부** ("Dexie를 4.4.6으로 업그레이드했는데 `&[subjectId+date+kind]` 같은 유니크 복합 인덱스 문법이나 `.upgrade()` 코드를 다시 짜야 하나요?")
- ✅ PASS
- 근거: SKILL.md 상단 메타(`> 대상 버전: Dexie 4.4.6 ... patch 릴리스로 스키마 문법·API 변경 없음. v5 없음`)
- 상세: 재작성 불필요하다고 정확히 답변, Dexie 버전 자체는 마이그레이션 트리거가 아니며 이 스킬 기준 무효화 대상은 `EngineStamp`(계산 로직/룰셋/절기 데이터 버전)라는 점까지 정확히 구분. SKILL.md 본문에 `&[a+b]` 구문 정의나 `.upgrade()` 코드가 없어(REFERENCE.md로 분리됨) 실제 코드 검증은 SKILL.md만으로는 안 된다는 점도 스스로 명시 — 설계된 분리 구조가 의도대로 인지됨.

**Q2. 민감 필드 암호화 — dexie-encrypted 사용 시 주의점** ("생년월일시·질문 텍스트처럼 민감한 필드를 암호화할 때 dexie-encrypted를 쓰면 뭘 주의해야 하나요?")
- ✅ PASS
- 근거: REFERENCE.md §10 "개인정보·암호화 전략"(10.1~10.4), §7 "반드시 피할 것 — boolean 인덱스", §12 "흔한 실수"
- 상세: 인덱스는 암호화 불가(`where()` 쿼리 불가능해지므로) → 민감 필드는 애초에 비인덱싱해야 한다는 §10.3 핵심 원칙, `NON_INDEXED_FIELDS`/`UNENCRYPTED_LIST`/`ENCRYPT_LIST` 3종 설정, 기본 구현 TweetNaCl(WebCrypto 아님) 근거까지 정확히 인용. SKILL.md 본문에는 암호화 내용이 전혀 없어 REFERENCE.md §10까지 찾아가야 답이 나옴을 스스로 명시 — 참조 링크 체계가 의도대로 동작.

### 발견된 gap (선택 보강, 차단 요인 아님)

- [✅] (2026-09-28 반영) SKILL.md 292~293번째 줄에 구분선(`---`)이 중복 삽입되어 있음(포맷 사소 오류, 내용상 영향 없음) — 제거 완료
- [✅] (2026-09-28 반영) REFERENCE.md §10.2의 `dexie-encrypted` 최신 버전·유지보수 상태가 구체 명시되어 있지 않아 "도입 전 확인하라"는 지침에 의존해야 함 — npm registry·GitHub API로 확인해 구체 상태(안정판 2.0.0 정체, 베타 4.2.0-beta.2로 유지보수 중) 명시 완료

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 실사용 필수 카테고리 아님(데이터 모델링 설계 가이드 — 답변 정확성만으로 검증 가능)
- 최종 상태: **APPROVED** (2026-09-28 재검증(2차) Dexie 버전 정정 반영 확인 완료)

---

**수행일**: 2026-09-10
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 부재로 대체)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 사주 계산 엔진 수정 시 기존 저장 원국(SajuChart) 처리 방법**
- ✅ PASS
- 근거: SKILL.md 섹션 3.3("저장 vs 재계산") + 섹션 8.1("계산 엔진 변경 → 전량 stale 표시") + 섹션 12
- 상세: `upgrade()`에서는 `stale=1` 플래그만 찍고, 실제 재계산은 `getChart()` 조회 시점에 `isStale()` 판정 후 지연 수행한다는 답변. 앱 시작 시 전량 재계산을 배제하는 근거(DB 오픈 지연·롤백 위험)까지 정확히 인용. gap: 마이그레이션 후 재계산 대상을 미리 훑는 배치 패턴은 SKILL.md에 없음(사소, 범위 밖).

**Q2. 가족 사주 등록 기능 스키마·개인정보 설계**
- ✅ PASS
- 근거: SKILL.md 섹션 1(대상≠계정 원칙) + 섹션 2(Subject/ThirdPartyConsent) + 섹션 9.4(syncScope) + 섹션 12
- 상세: `Subject.kind`+`syncScope: 'local-only'` 기본값+`thirdPartyConsent.allowServerUpload` 조합, 아동 판정을 업로드 시점에 재평가하는 설계까지 정확히 인용. gap: 동의 철회 시나리오·Subject 삭제 캐스케이드의 구체 코드는 SKILL.md에 없음(설계 가이드 성격상 사소).

**Q3. Dexie boolean 플래그 필터링이 항상 0건인 이유**
- ✅ PASS
- 근거: SKILL.md 섹션 7("반드시 피할 것 — boolean 인덱스") + 섹션 12
- 상세: IndexedDB 유효 키 타입에 boolean이 없어 인덱스 항목이 조용히 생략되는 원인과 `0 | 1` 정수 플래그 대안을 코드 대비(❌/✅)로 정확히 인용. anti-pattern(boolean 인덱싱) 회피 확인됨.

### 발견된 gap

- 없음(차단 요인 아님) — 3건 모두 SKILL.md 근거만으로 충분히 정답 도출. 위 3건의 사소한 gap(배치 재계산 패턴, 동의 철회 흐름, 기존 boolean→0|1 변환 마이그레이션 코드 예시)은 스킬 범위 밖이거나 다른 섹션에서 유추 가능한 수준.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 카테고리 아님(데이터 모델링 설계 가이드 — 답변 정확성만으로 검증 가능, 빌드/실행 산출물 검증 불필요)
- 최종 상태: APPROVED

---

### (참고) 사전 작성된 테스트 질문 후보 원본

1. "사주 계산 로직을 고쳤는데 이미 저장된 원국은 어떻게 처리하지?"
   → 기대 답변 경로: `EngineStamp`(engineVersion·rulesetId·solarTermDataVersion) 불일치 감지 → 마이그레이션에서 `stale=1`만 표시 → 조회 시 지연 재계산 (섹션 3.3, 8.1)
2. "가족 사주를 등록하는 기능을 추가하려는데 스키마를 어떻게 잡지?"
   → 기대 답변 경로: `Subject.kind` + `syncScope: 'local-only'` 기본 + `thirdPartyConsent.allowServerUpload` (섹션 2, 9.4)
3. "보관 여부 플래그로 필터링하는데 결과가 항상 0건이야"
   → 기대 답변 경로: boolean은 IndexedDB 유효 키가 아니어서 인덱스 항목이 조용히 생략됨 → `0 | 1` 정수 플래그 (섹션 7)

---

### [2026-09-28] 재검증(2차) — Dexie 패치 버전 정정(4.4.5→4.4.6), 그 외 변경 없음

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 + REFERENCE.md Read → 핵심 클레임 3개를 npm registry(`curl registry.npmjs.org`)·WebSearch로 1차 소스 대조

**클레임 대조 결과**:
1. Dexie 최신 안정 버전 — DISPUTED(정정) → npm registry 확인 결과 4.4.6이 최신(4.4.5 이후 patch, 2026-09-10 배포). 릴리스 노트는 Service Worker 크래시 수정·HMR 보호·primary key 처리·로그아웃 시 sync state 보존 등 patch 성격 — 섹션 7의 스키마 문법(`++`/`&`/`*`/`[a+b]`)·업그레이드 트랜잭션 제약에는 영향 없음. v5는 여전히 없음
2. `dexie-encrypted`의 인덱스 암호화 불가·TweetNaCl 기본·3종 설정(NON_INDEXED_FIELDS/UNENCRYPTED_LIST/ENCRYPT_LIST) — VERIFIED (npm registry 최신은 2.0.0으로 6년 전 배포 그대로, 변경 없음)
3. IndexedDB 유효 키 타입에 boolean 미포함(C4·C5) — VERIFIED (스펙 레벨 사실, 2026-09 기준 변경 없음 — MDN 재확인은 08-10 검증 시점과 동일 출처이므로 이번엔 npm/registry 확인에 집중, 별도 재검색 없이 스펙 안정성 근거로 유지)

**보강(ADD)·축소**: SKILL.md 상단 `> 대상 버전` 줄과 verification.md 메타 표를 4.4.6으로 정정. 본문 스키마 예시·API 시그니처는 4.4.5/4.4.6 간 차이 없어 그대로 유지(축소 없음)

**실전 질문 재검증**:
- Q1. "Dexie 버전이 올라갔는데 `&[a+b]` 유니크 복합 인덱스 문법이 여전히 유효한가?" → SKILL.md 섹션 7 근거로 PASS (4.4.6에서도 동일 문법, breaking change 없음)
- Q2. "손금 사진 원본을 왜 기본으로 저장하지 않는가?" → SKILL.md 섹션 5 근거로 PASS (법적 위험·용량·가치 대비 3가지 근거 그대로 유효)

**재검증 최종 판정**: status **PENDING_TEST 전환** (버전 정정 반영 — 메인이 skill-tester로 재테스트)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (VERIFIED 10 / DISPUTED 2 수정 반영 / UNVERIFIED 1 주의 표기) — 2026-09-28 재검증에서 Dexie 버전 정정(4.4.5→4.4.6) 1건 추가 |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-09-10, skill-tester → general-purpose) — 2026-09-28 skill-tester 재테스트 2/2 PASS (Dexie 4.4.6 버전 정정 반영 확인 완료) — 2026-09-28 skill-tester 재테스트(선택 보강분) 2/2 PASS (dexie-encrypted 버전 명시·축소 후 참조 링크 확인 완료) |
| 2026-09-28 선택 보강 | 중복 구분선 제거(서식) + `dexie-encrypted` 버전·유지보수 상태 명시(npm/GitHub 1차 소스 확인) |
| **최종 판정** | **APPROVED** (2026-09-28 재테스트 2/2 PASS — 선택 보강분이 실전 질문에 정확히 반영됨을 확인) |

---

## 7. 개선 필요 사항

- [✅] `skill-tester` 2단계 테스트 수행 후 섹션 5·6 갱신 및 APPROVED 전환 판단 (2026-09-10 완료, 3/3 PASS)
- [✅] (2026-09-28 완료) skill-tester 재테스트 수행 — 2/2 PASS, Dexie 4.4.6 버전 정정 반영분 재확인, PENDING_TEST → APPROVED 전환
- [✅] 2026-09-11 상호 참조 정리 — 삭제된 운세 콘텐츠 윤리 스킬 참조를 `meta/fortune-interpretation-prompt-engineering`(고지 문구 톤)·`humanities/palmistry-limitations` §6(손 사진 개인정보)로 대체
- [❌] 한국 표준시 변경 이력·서머타임 구간(C13)을 IANA tzdb 원문(`Asia/Seoul` Zone/Rule 항목)으로 1차 확인 — 선택 보강: SKILL.md 본문이 이미 `> 주의(부분 미검증)` 표기와 IANA tz 위임 권고로 우회 처리했으므로 사용에는 지장 없음
- [❌] 사주 계산 라이브러리(KASI 데이터 기반 JS 패키지) 실사용 비교는 본 스킬 범위 밖 — 선택 보강: 필요 시 별도 스킬로 분리, 본 스킬의 완성도와 무관
- [❌] README.md / docs/skills/README.md 반영 (이번 작업에서 수정 금지 지시로 제외됨) — 차단 요인: 별도 배치에서 반드시 일괄 정리 필요 (README 업데이트 규칙 위반 상태로 남아 있음)
- [✅] 2026-09-28 선택 보강 반영분(중복 구분선 제거·dexie-encrypted 버전 명시)에 대한 skill-tester 2단계 재테스트 (2026-09-28 완료, 2/2 PASS — PENDING_TEST → APPROVED 전환)
- [❌] REFERENCE.md §4.1/§9.3에 "마스터 데이터(SpreadDefinition·Deck)도 append-only로 다뤄야 한다"는 규칙을 명시 문장으로 보강 — 선택 보강, 비차단(2026-09-28 재테스트에서 발견, §9.3 append-only 철학에서 유추 가능한 수준)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-10 | v1 | 최초 작성. Dexie 4.4.5 기준, 클레임 13건 교차 검증(VERIFIED 10 / DISPUTED 2 / UNVERIFIED 1) | skill-creator |
| 2026-09-10 | v1 | 2단계 실사용 테스트 수행 (Q1 엔진 변경 시 마이그레이션 / Q2 가족 사주 등록 설계 / Q3 boolean 인덱스 0건 버그) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-11 | v1.1 | 캐주얼 앱 방향 정리 — 삭제된 운세 콘텐츠 윤리 스킬 참조 3곳(description·짝 스킬 안내·개인정보 주의)을 생성 프롬프트·손금 스킬 참조로 대체. 데이터 모델 본문 변동 없음 | main session |
| 2026-09-25 | v1.1 | 모델 ID 현행화(Opus 5.5/Fable 5.1) — `Reading.model` 필드 주석 예시값 `'claude-opus-5'` → `'claude-opus-5-5'`. 스키마·인덱스 변동 없음, status APPROVED 유지 | 모델 ID 현행화 |
| 2026-09-25 | v1.1 | 구조 개편: 상세 내용 references/REFERENCE.md 분리 (내용 변경 없음) | Claude (Sonnet 5) |
| 2026-09-25 | v1.1 | 교차 참조 조건부 표기 (내용 변경 없음) | Claude (Sonnet 5) |
| 2026-09-28 | v1.2 | 재검증(2차) — Dexie 대상 버전 정정(4.4.5→4.4.6, patch·스키마 문법 영향 없음). status APPROVED → PENDING_TEST(재테스트 대기) | Claude (Sonnet 5) |
| 2026-09-28 | v1.2 | 2단계 실사용 재테스트 수행 (Q1 Dexie 4.4.6 업그레이드 시 스키마·마이그레이션 재작성 필요 여부 / Q2 dexie-encrypted 암호화 주의점) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-28 | v1.3 | 선택 보강 반영 — SKILL.md 292~293행 중복 구분선 제거(서식), REFERENCE.md §10.2에 `dexie-encrypted` 버전·유지보수 상태 명시(npm registry·GitHub API 1차 소스 확인: 안정판 2.0.0 정체·베타 4.2.0-beta.2 유지보수 중). 신규 사실 추가로 status APPROVED → PENDING_TEST(재테스트 대기) | Claude (Opus 5.5) |
| 2026-09-28 | v1.3 | 2단계 재테스트 수행 (Q1 dexie-encrypted 설치 버전 주의점 / Q2 켈틱크로스 위치 문구 수정 소급 적용 버그 원인·스키마 설계) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
