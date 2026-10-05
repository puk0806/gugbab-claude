---
skill: ingredient-management
category: health
version: v2
date: 2026-09-28
status: APPROVED
---

# ingredient-management 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 국내 식재료 관리 앱 도메인 분석 기반 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실사용 테스트 (skill-tester 수행 후)
  └─ APPROVED 전환 예정
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `ingredient-management` |
| 스킬 경로 | `.claude/skills/ingredient-management/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-06-26, 재검증·보강 2026-09-26, 출처 검증 마감 2026-09-28) |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 국내 식재료 관리 앱 도메인 분석 (유통기한 언제지, 원더 프리지, BEEP)
- [✅] 핵심 도메인 모델 (Ingredient 인터페이스) 설계
- [✅] 카테고리·보관 위치·상태 타입 정의
- [✅] PWA 로컬 저장 패턴 (IndexedDB/Dexie) 코드 작성
- [✅] 식단 추천 연동을 위한 컨텍스트 생성 코드 작성
- [✅] SKILL.md 파일 작성
- [✅] skill-tester 에이전트 content test 수행 (2026-06-26)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "식재료 관리 앱 도메인 모델 유통기한 카테고리 냉장고 관리" | 국내 앱 3종 (유통기한 언제지, 원더 프리지, BEEP) 도메인 분석 |
| 교차 검증 | 도메인 분석 | 앱 기능 비교 | 카테고리/보관위치/소비기한 공통 모델 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 유통기한 언제지 (App Store) | https://apps.apple.com/kr/app/id1522650178 | ⭐⭐ Medium | 2026-06-26 | 도메인 분석용 |
| 원더 프리지 (Google Play) | https://play.google.com/store/apps/details?id=com.meolly.fridge | ⭐⭐ Medium | 2026-06-26 | 도메인 분석용 |
| indexeddb-dexie 스킬 | `.claude/skills/indexeddb-dexie/SKILL.md` | ⭐⭐⭐ High | 2026-06-26 | 내부 스킬 기반 |

---

## 4. 검증 체크리스트 (Test List)

### 3-1. 내용 정확성
- [✅] 도메인 모델이 실제 앱 패턴과 일치
- [✅] TypeScript 타입 정의가 올바른 문법
- [✅] Dexie 쿼리 패턴이 표준 패턴에 부합
- [✅] 소비기한 계산 로직이 정확

### 3-2. 구조 완전성
- [✅] YAML frontmatter 포함
- [✅] 소스 URL과 검증일 명시
- [✅] 도메인 모델 전체 설명
- [✅] 코드 예시 포함 (IndexedDB 쿼리, 컨텍스트 생성)
- [✅] 알림 트리거 기준 포함

### 3-3. 실용성
- [✅] PWA 앱 개발 시 바로 활용 가능한 TypeScript 타입
- [✅] meal-recommendation-prompt 스킬과 연동 설계
- [✅] 범용적으로 사용 가능

### 3-4. Claude Code 에이전트 활용 테스트
- [✅] skill-tester content test 수행 (2026-06-26, v1 / 2026-09-26 v2 재검증 / 2026-09-26 3차 재검증)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 2026-09-26 재검증에서 발견된 SKILL.md 결함을 메인이 수정, 같은 날 3차 재검증(3/3 PASS)으로 해소 확인

---

## 5. 테스트 진행 기록

### [2026-09-28] 선택 보강 반영

3차 재검증(2026-09-26)에서 발견된 선택 보강 gap 2건을 오늘 1차 소스 재확인 후 최종 반영·기록 마감(SKILL.md 본문은 2026-09-26에 이미 수정되어 있었음 — 오늘은 그 내용의 출처 검증과 verification.md 섹션 5·7 동기화):

1. **"최대 ±1일 오차" 방향 비대칭성 명시** — SKILL.md 122~124행에 이미 반영됨("오차 방향은 시각에 따라 달라진다..."). 이는 외부 사실이 아니라 SKILL.md 자체 코드(`Math.ceil` vs `Math.round`, KST/UTC 오프셋)로부터 도출되는 논리적 설명이라 별도 1차 소스 불필요(내부 명확화).
2. **Dexie/IndexedDB가 인덱스 값이 `undefined`인 레코드를 range 쿼리에서 제외하는 동작 명시** — SKILL.md 190~192행에 이미 반영됨("IndexedDB는 인덱스 키가 undefined인 레코드를 인덱스에 넣지 않으므로..."). 오늘 MDN(IndexedDB 공식 웹 표준 문서)으로 1차 소스 확인: "Adding objects that don't have a `name` property still succeeds, but the objects won't appear in the 'name' index." (인덱스 키 경로에 해당 프로퍼티가 없는 레코드는 그 인덱스에 포함되지 않음 — Dexie는 IndexedDB 위에 구축되어 이 동작을 그대로 상속). 근거 URL: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB

**수행일**: 2026-09-26
**수행자**: skill-tester → general-purpose
**수행 방법**: 직전 회차(v2 재검증) NEEDS_REVISION 사유 — 빈 문자열 expiryDate가 106행 `!ingredient.expiryDate` falsy 체크로 no_expiry 반환되어 110행 주석·138행 표("빈 값...expired 안전 처리")와 불일치했던 결함 — 를 메인이 수정. SKILL.md Read 후 실전 질문 3개(빈 문자열·undefined 구분 / KST 자정 직후 만료 판정(daysLeft 수치 추적) / getAvailable 문자열비교 안티패턴과 getIngredientStatus 위임 근거) 답변, 근거 코드 대조 및 SKILL.md 코드-표 내부 정합성 재확인. 질문 답변 에이전트(general-purpose)는 1개씩 순차 실행

### 메인 수정 내역 (3차 재검증 전, 2026-09-26)

- `getIngredientStatus()` 106~107행: `!ingredient.expiryDate`(falsy) 체크를 `ingredient.expiryDate === undefined || ingredient.expiryDate === null`로 엄격화 — `undefined`/`null`만 `no_expiry` 반환. 빈 문자열은 이 분기를 통과해 `parseDateOnly('')`가 정규식 불일치로 `null`을 반환하고 111행에서 `expired`로 처리됨 — 코드-문서 불일치를 근본적으로 해소
- `getAvailable()`: 문자열 비교(`expiryDate >= today`) 로직을 제거하고 `getIngredientStatus(i) !== 'expired'`로 판정을 위임(207행) — 사전순 문자열 비교에서 형식 오류 값(`'26/9/30'`)이 새어 나가던 문제와, `getAvailable`·`getIngredientStatus` 이중 판정 불일치 가능성을 근본 차단
- `getSortedByExpiry`에 정렬 방향(오름차순) 주석 추가(185행) — v1부터 미해결이던 선택 보강 항목 해소
- Dexie 버전 호환성 주의 문구 추가(213~214행) — 3.x/4.x 공통 API, 4.x `Table` import 경로 확인 안내
- 메인이 undefined/null/빈 문자열/형식 오류/존재하지 않는 날짜(`2026-02-30`)/시각 포함 문자열 등 경계 케이스 12개를 TZ=UTC·TZ=Asia/Seoul 양쪽에서 node 스크립트로 실행해 전부 기대값과 일치함을 확인

### 실제 수행 테스트 (3차 재검증)

**Q1. 빈 문자열(`''`) vs 필드 부재(`undefined`) expiryDate 구분**
- ✅ PASS
- 근거: SKILL.md "식재료 상태 분류" 섹션 `getIngredientStatus`(105~119행, 특히 106~107행 주석·111행), 경계 처리 표(139~140행)
- 상세: `undefined`/`null`은 107행에서 즉시 `no_expiry` 반환. 빈 문자열은 107행을 통과해 `parseDateOnly('')`가 정규식 불일치로 `null` 반환 → 111행에서 `expired` 반환. 이전 회차에서 발견된 코드-문서 불일치가 완전히 해소되었음을 코드 흐름으로 재확인함

**Q2. UTC 서버·KST 자정 직후(UTC 15:30=KST 00:30) expiryDate='2026-09-25' 만료 판정 + 금지 패턴 대조**
- ✅ PASS
- 근거: SKILL.md `todayInSeoul`·`parseDateOnly`·`getIngredientStatus`(85~119행), 금지 패턴(122~132행), 경계 처리 표(134~140행)
- 상세: `todayInSeoul(now)='2026-09-26'`, `daysLeft=-1` → `expired`를 숫자 단위로 정확히 추적. 금지 패턴을 그대로 적용하면 `daysLeft=Math.ceil(-0.6458…)=-0`이 되어 `urgent`로 오분류됨을 직접 계산해 재현 — 정상 구현과의 차이를 정량적으로 입증함
- gap(선택 보강, 비차단): "최대 ±1일 오차"라는 문구가 오차의 방향(더 급하게 vs 덜 급하게 오분류)이 케이스에 따라 다를 수 있음을 명시하지 않음

**Q3. getAvailable() 문자열 비교 "최적화" 안티패턴 vs getIngredientStatus 위임 근거**
- ✅ PASS
- 근거: SKILL.md `getAvailable`(201~208행, 특히 205~206행 주석), 211행 인용문, `getSortedByExpiry`(185~190행)
- 상세: `expiryDate` 없는 레코드(`no_expiry`)가 Dexie 인덱스 range 쿼리에서 누락되는 예시와, 형식 오류 문자열(`'26/9/30'`)이 사전순 비교를 통과해버리는 예시를 SKILL.md 근거 문장 그대로 인용해 정확히 설명. 211행 인용문("판정 로직은 getIngredientStatus 하나로 유지")을 안티패턴 방지 근거로 정확히 제시함
- gap(선택 보강, 비차단): Dexie가 인덱스 값이 `undefined`인 레코드를 range 쿼리에서 제외한다는 IndexedDB/Dexie 동작 자체는 SKILL.md에 명시적 설명 없음(간접 추론만 가능)

### 발견된 gap (3차 재검증, 전부 비차단)

- 금지 패턴 오차 방향 대칭성 미명시 — 선택 보강
- Dexie range 쿼리의 `undefined` 인덱스 제외 동작 미설명 — 선택 보강

### 판정 (2026-09-26, 3차 재검증)

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (도메인 패턴 스킬 — content test로 판정 가능한 카테고리)
- 최종 상태: NEEDS_REVISION → **APPROVED** (차단 결함 해소 확인, 잔여 gap 2건은 전부 선택 보강·비차단)

---

(이하 2026-09-26 v2 재검증 기록 — 결함 발견 당시 기록, 참고용 보존)

### 실제 수행 테스트 (v2 재검증)

**Q1. UTC 서버·KST 자정 직후(UTC 15:30=KST 00:30) expiryDate='2026-09-26' 만료 판정**
- ✅ PASS
- 근거: SKILL.md "식재료 상태 분류" 섹션 `todayInSeoul`·`parseDateOnly`·`getIngredientStatus`(85~118행), 경계 처리 표(133~138행)
- 상세: todayInSeoul(now)='2026-09-27'로 환산되어 daysLeft=-1 → expired. 기기/서버가 UTC여도 KST 달력 날짜로 정확히 판정됨을 근거 코드로 정확히 추적함

**Q2. 존재하지 않는 날짜(2026-02-30)·빈 문자열·형식 오류·시각 포함 문자열 처리**
- ❌ FAIL — SKILL.md 자체 결함 발견 (에이전트 답변 논리 추적은 정확했음)
- 근거: SKILL.md 106행 `if (!ingredient.expiryDate) return 'no_expiry';` vs 110행 주석·138행 표
- 상세: 106행은 빈 문자열(falsy)도 걸러 `'no_expiry'`를 반환하는데, 110행 주석과 138행 표는 "빈 값"도 `expired`로 안전 처리한다고 명시함 — 코드 흐름상 빈 문자열은 106행에서 먼저 반환되어 110행에 도달하지 못하므로 문서·코드 불일치. Claude가 106~118행 직접 재확인하여 재현·확정함. 존재하지 않는 날짜(2026-02-30)·형식 오류·시각 포함 문자열 케이스는 정규식/롤오버 체크로 정확히 `expired` 처리됨(문제 없음) — 결함은 "빈 문자열" 케이스에 한정

**Q3. getAvailable()의 new Date().toISOString() 금지 이유 + buildIngredientContext 연결**
- ✅ PASS
- 근거: SKILL.md "핵심 쿼리 패턴" 섹션 getAvailable(197~204행) 주석, "식단 추천을 위한 식재료 목록 추출" 섹션 buildIngredientContext(214~237행)
- 상세: UTC 기준 toISOString이 KST 자정 전후 하루 밀리는 문제, todayInSeoul() 대체 이유, getAvailable→getIngredientStatus 2단계 파이프라인 구조까지 정확히 설명함

### 발견된 gap (v2 재검증)

- **[신규 결함, 차단]** `getIngredientStatus()` 106행 `!ingredient.expiryDate` falsy 체크가 빈 문자열도 `'no_expiry'`로 반환 — 110행 주석·138행 표("빈 값...안전하게 만료 취급")와 불일치. 수정 방향 후보: ① 106행을 `ingredient.expiryDate === undefined`로 엄격화, ② 138행 표에서 "빈 문자열" 문구 제거(빈 문자열은 사실상 `no_expiry`로 처리됨을 명시). 사용자 승인 후 조치
- [선택 보강, 비차단] getAvailable()의 문자열 비교(`expiryDate >= today`)가 안전한 이유(고정폭 YYYY-MM-DD lexicographic)와, 형식 오류 레코드가 getAvailable 단계는 통과하고 getIngredientStatus 단계에서만 걸러지는 책임 분리가 문서에 명시되어 있지 않음 (Q3에서 확인)
- (2026-06-26 v1 기존 기록, 미해결 유지) getSortedByExpiry 정렬 방향(오름차순) 주석 미명시 — 선택 보강

### 판정 (2026-09-26, v2 재검증)

- agent content test: 2/3 PASS, 1/3 FAIL (SKILL.md 코드-문서 내부 불일치 발견)
- verification-policy 분류: 해당 없음 (도메인 패턴 스킬 — content test로 판정 가능한 카테고리)
- 최종 상태: **NEEDS_REVISION** (빈 문자열 expiryDate 처리 불일치 수정 필요 — SKILL.md 즉시 수정 금지 원칙에 따라 사용자 승인 후 조치)

---

(이하 2026-06-26 최초 테스트 기록 — v1 코드 기준, 참고용 보존)

**수행일**: 2026-06-26
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 오늘(2026-06-26) 구매한 생닭, expiryDate=2026-06-28 설정 시 getIngredientStatus() 반환값**
- ✅ PASS
- 근거: SKILL.md "식재료 상태 분류" 섹션 (getIngredientStatus 함수) + "보관 위치별 식재료 기본 소비기한 참고" 표
- 상세: daysLeft=2, daysLeft<=3 → 'urgent' 반환. 생닭 냉장 2일 참조표와도 일치 확인됨

**Q2. 냉장고(fridge) 식재료 필터링 + 소비기한 임박 순 정렬 + IndexedDB 스키마 설계**
- ✅ PASS
- 근거: SKILL.md "핵심 쿼리 패턴" 섹션 (getByLocation, getSortedByExpiry) + "권장 로컬 저장 구조" 섹션 (FridgeDatabase Dexie 스키마)
- 상세: getByLocation('fridge'), getSortedByExpiry() 함수 패턴 직접 기재됨. 인덱스 필드(category, storageLocation, expiryDate) 구조 명확

**Q3. 식단 추천 AI에 소비 임박 식재료 우선 표시하는 컨텍스트 문자열 생성**
- ✅ PASS
- 근거: SKILL.md "식단 추천을 위한 식재료 목록 추출" 섹션
- 상세: buildIngredientContext() 함수. urgent/warning/fresh 3단계 분류 → 레이블 포함 문자열 출력 패턴 완전 기재

### 발견된 gap

- getIngredientStatus의 타임존 처리 주의사항 없음 (ISO 날짜 문자열 UTC 파싱 vs 로컬 시각 비교 edge case) — 2026-09-26 코드 수정으로 해소 (섹션 8 참조)
- getSortedByExpiry의 정렬 방향(오름차순) 코드 주석 미명시 — 선택 보강, 미해결

### 판정 (2026-06-26 기준, 코드 수정 전)

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (도메인 패턴 스킬)
- 최종 상태: APPROVED → 2026-09-26 코드 예시 실질 변경으로 PENDING_TEST 재전환 → 같은 날 skill-tester 재검증 결과 NEEDS_REVISION (섹션 5 상단 "v2 재검증" 참조)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (2026-09-26 3차 재검증 — 빈 문자열/undefined 처리 수정 후 코드-표 정합성 회복 확인) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-09-26 3차 재검증 — Q1 빈 문자열/undefined 구분, Q2 KST 자정 경계+금지패턴 대조, Q3 getAvailable 위임 근거) |
| **최종 판정** | **APPROVED** (2026-09-26 3차 재검증에서 차단 결함 해소 확인, 잔여 gap 2건은 2026-09-28 선택 보강 반영으로 해소 — status 유지, 순수 서식/내부 명확화·기존 반영 사실의 출처 보강) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 후 오류 항목 보완 (2026-06-26 v1 완료, 3/3 PASS)
- [✅] 2026-09-26 날짜 처리 버그(UTC 자정 파싱) 수정 후 skill-tester 재검증 수행 완료 (2/3 PASS, 1/3 FAIL)
- [✅] **차단 해소** — `getIngredientStatus()` 빈 문자열 expiryDate 처리와 표(`expired` 안전 처리) 불일치 수정 완료 (2026-09-26 메인 수정 + skill-tester 3차 재검증 3/3 PASS로 확인)
- [✅] 선택 보강 — getAvailable()의 문자열 비교 안전성 근거 및 형식 오류 레코드가 getAvailable/getIngredientStatus 중 어느 단계에서 걸러지는지 문서에 명시 완료 (2026-09-26, 205~206행·211행 주석 추가, Q3 재검증에서 확인)
- [✅] 선택 보강 — Dexie 버전 호환성 문서화 완료 (2026-09-26, 3.x/4.x 공통 명시 + 4.x import 경로 확인 안내 추가). 단, 설치 버전별 실측은 아직이므로 실사용 시 재확인 권장(비차단)
- [✅] 선택 보강 — getSortedByExpiry 정렬 방향(오름차순) 코드 주석 명시 완료 (2026-09-26)
- [✅] (2026-09-28 반영) 선택 보강, 비차단 — "최대 ±1일 오차" 문구에 오차 방향(더 급하게 vs 덜 급하게 오분류) 대칭성이 케이스에 따라 다를 수 있음을 명시 (2026-09-26 3차 재검증 Q2에서 발견, SKILL.md 122~124행에 반영 완료, 내부 로직 명확화라 소스 확인 불필요)
- [✅] (2026-09-28 반영) 선택 보강, 비차단 — Dexie가 인덱스 값이 `undefined`인 레코드를 range 쿼리에서 제외하는 동작 자체를 SKILL.md에 명시 (2026-09-26 3차 재검증 Q3에서 발견, SKILL.md 190~192행에 반영 완료, 2026-09-28 MDN IndexedDB 공식 문서로 1차 소스 확인 — https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-26 | v1 | 최초 작성 | skill-creator |
| 2026-06-26 | v1 | 2단계 실사용 테스트 수행 (Q1 생닭 expiryDate→urgent 판정 / Q2 냉장 필터·임박 정렬·IndexedDB 스키마 / Q3 buildIngredientContext 컨텍스트 생성) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-26 | v2 | `getIngredientStatus`·`getAvailable`의 `new Date('YYYY-MM-DD')` UTC 자정 파싱 버그 수정 — health/meal-recommendation-prompt와 동일한 `todayInSeoul`(Intl `timeZone: 'Asia/Seoul'`) + `parseDateOnly`(달력 날짜 정수 비교) 패턴 도입. node 스크립트로 TZ=UTC·TZ=Asia/Seoul 양쪽 실행해 경계값(KST 자정 전후) 및 잘못된 날짜(`2026-02-30`·형식 오류·시각 포함 문자열) 처리 확인 — 신규 구현은 두 TZ 환경에서 동일 결과, 기존 구현은 `urgent`가 `warning`으로 밀리는 오차 재현. status APPROVED → PENDING_TEST (코드 예시 실질 변경) | Claude |
| 2026-09-26 | v2 | 2단계 실사용 재검증 수행 (Q1 UTC서버·KST자정 직후 만료 판정 / Q2 존재하지 않는 날짜·빈 문자열·형식 오류·시각 포함 문자열 처리 / Q3 getAvailable toISOString 금지 사유·buildIngredientContext 연결) → 2/3 PASS, 1/3 FAIL — 빈 문자열 expiryDate가 106행에서 `no_expiry`로 반환되는데 110행 주석·138행 표는 `expired`로 서술한 내부 불일치 발견. status PENDING_TEST → NEEDS_REVISION (SKILL.md 수정은 사용자 승인 대기) | skill-tester → general-purpose |
| 2026-09-26 | v2 | NEEDS_REVISION 사유 수정 — `getIngredientStatus()` undefined/null만 no_expiry로 엄격화(빈 문자열은 expired), `getAvailable()`이 `getIngredientStatus`에 판정 위임(문자열 비교 제거), getSortedByExpiry 정렬 방향 주석·Dexie 버전 호환성 주의 추가. 메인이 경계 케이스 12개를 TZ=UTC·Asia/Seoul 양쪽에서 실행해 전부 기대값 확인 | Claude |
| 2026-09-26 | v2 | 3차 실사용 재검증 수행 (Q1 빈 문자열/undefined 구분 / Q2 KST 자정 직후 만료 판정+금지패턴 대조(daysLeft 수치 추적) / Q3 getAvailable 문자열비교 안티패턴과 getIngredientStatus 위임 근거) → 3/3 PASS, NEEDS_REVISION → APPROVED 전환 (차단 결함 해소 확인, 잔여 gap 2건은 선택 보강·비차단) | skill-tester → general-purpose |
| 2026-09-26 | v2 | 선택 보강 2건 반영: 금지 패턴 오차 방향의 비대칭성 설명, IndexedDB가 undefined 인덱스 키 레코드를 범위 쿼리에서 제외하는 동작 주석 (코드 변경 없음, status 유지) | Claude (Opus 5.5) |
| 2026-09-28 | v2 | 위 2026-09-26 선택 보강 반영분의 출처 검증 마감 및 verification.md 섹션 5·7 동기화 — MDN IndexedDB 공식 문서로 undefined 인덱스 제외 동작 1차 소스 확인, 오차 방향 비대칭성은 내부 로직 명확화로 판정 (코드 변경 없음, status 유지) | Claude (Opus 5.5) |
