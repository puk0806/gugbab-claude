---
skill: indexeddb-dexie
category: frontend
version: v1
date: 2026-05-07
status: PENDING_TEST
---

# 스킬 검증 문서: indexeddb-dexie

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `indexeddb-dexie` |
| 스킬 경로 | `.claude/skills/frontend/indexeddb-dexie/SKILL.md` |
| 검증일 | 2026-05-07 |
| 검증자 | Claude (Opus 4.7) |
| 스킬 버전 | v1 |
| 카테고리 | 라이브러리 사용법 + 마이그레이션 (실 PWA 검증 권장) |

---

## 1. 작업 목록

- [✅] Dexie 4.x 최신 버전 확인 (4.4.2 + dexie-react-hooks 4.2.0)
- [✅] 스키마 정의 (db.version().stores()) + 인덱스 표기법 (++id·&unique·*multi-entry·[a+b] compound)
- [✅] .upgrade() 마이그레이션 패턴
- [✅] 트랜잭션 (db.transaction('rw', tables, async () => {...}))
- [✅] 쿼리 패턴 (where + 비교, 복합 인덱스, orderBy + limit, multi-entry)
- [✅] dexie-react-hooks의 useLiveQuery (의존성 배열, 자동 반응)
- [✅] IndexedDB 차단 환경 감지 + 폴백 (시크릿 모드/Storage 권한 거부)
- [✅] PWA 오프라인 영속화 (Persistent Storage 요청, 사용량 모니터링)
- [✅] TypeScript 타입 활용
- [✅] 흔한 실수 9종

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|----------|----------|
| 조사 1 | WebSearch | "Dexie.js 4.x latest version 2026 db.version stores upgrade migration" | Dexie 4.4.2 (2026-05 기준), Dexie 4.4 + Dexie Cloud 3.0 March 2026 출시. Y.js → y-dexie 분리 |
| 조사 2 | WebSearch | "dexie-react-hooks useLiveQuery latest version" | dexie-react-hooks 4.2.0 latest, 4.2.1-beta.1 useSuspendingLiveQuery 실험 |
| 조사 3 | WebFetch | https://dexie.org/docs/Tutorial/React | useLiveQuery 패턴, schema singleton, binary range tree 변경 감지, multi-window sync |
| 조사 4 | WebSearch | "Dexie compound index '[level+nextDue]' syntax migration upgrade callback" | 복합 인덱스 [a+b] 표기, where('[a+b]').equals([v1,v2]) 쿼리, .upgrade(trans => modify) 마이그레이션 |
| 작성 | Write | .claude/skills/frontend/indexeddb-dexie/SKILL.md | 11개 섹션 + 9가지 흔한 실수 + 호환성 매트릭스 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| Dexie 공식 | https://dexie.org/ | ⭐⭐⭐ High | 공식 문서 (1순위) |
| Dexie GitHub | https://github.com/dexie/Dexie.js | ⭐⭐⭐ High | 4.x 릴리즈 노트 + 소스 |
| useLiveQuery 문서 | https://dexie.org/docs/dexie-react-hooks/useLiveQuery() | ⭐⭐⭐ High | React 통합 공식 가이드 |
| Compound Index 문서 | https://dexie.org/docs/Compound-Index | ⭐⭐⭐ High | [a+b] 표기 공식 |
| React 튜토리얼 | https://dexie.org/docs/Tutorial/React | ⭐⭐⭐ High | useLiveQuery 사용 패턴 |
| npm dexie | https://www.npmjs.com/package/dexie | ⭐⭐⭐ High | 4.4.2 버전 확인 |
| npm dexie-react-hooks | https://www.npmjs.com/package/dexie-react-hooks | ⭐⭐⭐ High | 4.2.0 버전 확인 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] Dexie 4.4.x 최신 버전 명시 (2026-05 기준)
- [✅] 인덱스 표기법 정확 (`++id`·`&email`·`*tags`·`[a+b]`)
- [✅] 복합 인덱스 쿼리 문법 정확 (`where('[a+b]').between([v1,v2],...)` / `equals([v1,v2])`)
- [✅] `.upgrade()` 콜백에서 `trans.table('x').toCollection().modify()` 패턴
- [✅] 트랜잭션 모드 (`r`·`rw`·`rw!`) + 외부 await 금지 명시
- [✅] useLiveQuery 의존성 배열 동작

### 4-2. 구조 완전성

- [✅] YAML frontmatter (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 언제 사용 / 언제 사용하지 않을지 기준
- [✅] 설치 명령어 (pnpm/npm)
- [✅] 스키마 정의 + 인덱스 표기법 표
- [✅] 마이그레이션 + CRUD + 쿼리 패턴 5종
- [✅] 트랜잭션 + React 통합 + 차단 환경 감지 + PWA 영속화
- [✅] TypeScript 타입 활용 + 호환성 매트릭스
- [✅] 흔한 실수 9종

### 4-3. 실용성

- [✅] PRD 명시 사항 모두 커버 (db.version·복합 인덱스·*tags·.upgrade·transaction·where/orderBy/limit·useLiveQuery·차단 감지·PWA 영속화)
- [✅] 즉시 복사 가능한 코드 블록 (싱글턴 db.ts, useLiveQuery 컴포넌트, isIndexedDBAvailable, requestPersistentStorage)
- [✅] TypeScript Table<RowType, PKType> 시그니처

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] skill-tester 호출 (2026-05-08 수행, 3/3 PASS — 복합 인덱스 쿼리·마이그레이션 누락 함정·트랜잭션 abort + useLiveQuery 의존성)
- [⏸️] 실 PWA 프로젝트 적용 후 APPROVED 전환

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-08
**수행자**: skill-tester → general-purpose (인라인 검증)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 복합 인덱스 [level+nextDue]로 level=1이고 기한 지난 카드를 효율 쿼리하는 방법**
- PASS
- 근거: SKILL.md "쿼리 패턴 > 2. 복합 인덱스 쿼리" 섹션 (where('[level+nextDue]').between([1, new Date(0)], [1, now], true, true) 코드 예시 존재)
- 상세: anti-pattern인 'level,nextDue'(쉼표 구분) 또는 'level+nextDue'(대괄호 없음) 표기에 대해 "흔한 실수" 섹션에서 명시적 경고 확인

**Q2. .upgrade() 마이그레이션에서 이전 버전 테이블을 누락했을 때 발생하는 문제와 올바른 패턴**
- PASS
- 근거: SKILL.md "마이그레이션 (.upgrade)" 섹션 주의 문구 ("이전 버전과 다른 부분만 적으면 제거로 간주") + "흔한 실수" 표 (".stores()에서 일부 테이블 누락 → 누락 테이블이 삭제됨")
- 상세: v3 예시 코드에서 cards 테이블을 반복 명시하는 올바른 패턴 확인

**Q3. transaction 콜백 안에서 fetch 호출 시 결과 + useLiveQuery 의존성 배열 누락 증상**
- PASS
- 근거: SKILL.md "트랜잭션" 섹션 중첩 금지 문구 ("외부 await 호출하면 자동 abort") + "흔한 실수" 표 ("useLiveQuery 의존성 배열 누락 → 변수 변경에도 재쿼리 안 됨")
- 상세: FilteredCards 예시에서 [minLevel] 의존성 배열 패턴 확인

### 발견된 gap

없음. 세 질문 모두 SKILL.md 본문에서 명확한 근거 확인.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 라이브러리 사용법 + 마이그레이션 혼합 — 마이그레이션·PWA 영속화 부분은 실 환경 검증 권장
- 최종 상태: PENDING_TEST 유지 (실 PWA 적용 후 사용자가 APPROVED 전환 결정)

---

### 참고 — 2026-05-07 자체 검증 기록

**수행일**: 2026-05-07
**수행 방법**: SKILL.md 작성 직후 셀프 검증 (skill-tester 호출 미수행)

본 스킬은 *라이브러리 사용법 + 마이그레이션·PWA 영속화*의 혼합 카테고리다.

- 사용법 부분(스키마·CRUD·쿼리·useLiveQuery)은 *content test로 충분*
- 마이그레이션·차단 환경·PWA 영속화 부분은 *실 환경 검증 필요* — 시크릿 모드 동작·Persistent Storage 요청 결과·여러 버전 마이그레이션 누적 시 회귀 검증

verification-policy.md의 *실사용 필수 카테고리(빌드 설정·마이그레이션)*에 부분 해당. **PENDING_TEST 시작**이 안전.

### 후속 검증 시나리오

- 시나리오 1: 신규 PWA 프로젝트에서 schema v1 → v2 → v3 단계적 마이그레이션 시 데이터 손실 없음 확인
- 시나리오 2: 시크릿 모드·디스크 부족 등 차단 환경에서 폴백 동작 검증
- 시나리오 3: useLiveQuery + 다중 탭에서 변경 동기화 검증 (binary range tree 알고리즘)

위 3개 시나리오 중 *2개 이상* 정상 작동 확인 시 APPROVED 전환 검토.

---

## 6. 검증 결과 요약

| 항목 | 내용 |
|------|------|
| 검증 방법 | Dexie 공식 문서 + GitHub + npm 버전 + Compound Index 문서 교차 검증 |
| 클레임 판정 | 핵심 클레임 6건 모두 VERIFIED (4.4.2 버전·복합 인덱스 표기·.upgrade trans.modify·transaction 모드·useLiveQuery deps·multi-window sync) |
| 에이전트 활용 테스트 | 수행 완료 (2026-05-08, 3/3 PASS — 복합 인덱스 쿼리·마이그레이션 누락 함정·트랜잭션 abort + useLiveQuery 의존성) |
| 최종 판정 | **PENDING_TEST** (실 PWA 적용 + 마이그레이션 누적 검증 후 APPROVED 전환) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-05-08 완료, 3/3 PASS)
- [⏸️] PWA 실환경 적용 후 APPROVED 전환 (시나리오 2개 이상 정상 작동 확인) — 차단 요인: 실 PWA 없이는 검증 불가, 현재 PENDING_TEST 유지 적절
- [⏸️] Dexie Cloud 동기화 패턴 (선택 보강 — 본 스킬은 로컬 only, 비차단)
- [⏸️] 4.4.x Blob Offloading / String Offloading 활용 패턴 (선택 보강, 비차단)
- [⏸️] React Suspense 통합 (4.2.1-beta.1 useSuspendingLiveQuery — 안정화 후 보강, 비차단)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-05-07 | v1 | 최초 작성 — Dexie 4.4.2 + dexie-react-hooks 4.2.0 기준. 스키마·인덱스·마이그레이션·트랜잭션·쿼리 5종·useLiveQuery·차단 환경 폴백·PWA 영속화·TypeScript 타입·호환성 매트릭스. PRD 요구사항 모두 커버. 9가지 흔한 실수 | Claude (Opus 4.7) |
| 2026-05-08 | v1 | 2단계 실사용 테스트 수행 (Q1 복합 인덱스 쿼리 / Q2 마이그레이션 누락 함정 / Q3 트랜잭션 abort + useLiveQuery 의존성) → 3/3 PASS, PENDING_TEST 유지 (실 PWA 검증 대기) | skill-tester |
