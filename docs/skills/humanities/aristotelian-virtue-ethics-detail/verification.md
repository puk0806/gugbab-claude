---
skill: aristotelian-virtue-ethics-detail
category: humanities
version: v1
date: 2026-09-26
status: APPROVED
---

# 스킬 검증 — aristotelian-virtue-ethics-detail

> 작성: 2026-05-03 / 검증자: skill-creator (Claude Code)

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `aristotelian-virtue-ethics-detail` |
| 스킬 경로 | `.claude/skills/humanities/aristotelian-virtue-ethics-detail/SKILL.md` |
| 검증일 | 2026-05-03 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 자매 스킬 | `aristotle-primary-citation` (인용 형식), `akrasia-research` (NE VII 본문) |

---

## 1. 작업 목록 (Task List)

- [✅] 1순위 소스 확인 — Stanford Encyclopedia "Aristotle's Ethics" (Kraut)
- [✅] 1순위 소스 확인 — Cambridge Companion to NE (Polansky ed., 2014) 챕터 구성
- [✅] 1순위 소스 확인 — Bywater OCT 1894 표준 비평본 명시 (자매 스킬과 일관)
- [✅] 2순위 소스 확인 — Wikipedia "Nicomachean Ethics" (권별 Bekker 범위)
- [✅] 2순위 소스 확인 — Internet Classics Archive (Ross 영역, 본문 검증용)
- [✅] 핵심 Bekker 위치 교차 검증 (1098a16, 1106a10, 1106b36, 1111b4, 1140a24, 1144b30, 1146a4-9 등)
- [✅] NE I–X 권별 범위 정리
- [✅] akrasia 챕터 활용 매핑 표 작성
- [✅] 자매 스킬과의 중복 회피 (인용 형식은 `aristotle-primary-citation`이 담당)
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 사전 확인 | Read | VERIFICATION_TEMPLATE.md, aristotle-primary-citation/SKILL.md | 템플릿 구조 확인, 자매 스킬 어휘·표기 일관성 확보 |
| 조사 1 | WebFetch | SEP "Aristotle's Ethics" — I~X권 핵심 Bekker 행 일괄 질의 | 1098a16(ergon 결론), 1106a26-b28(중용), 1109b30(자발성 시작), 1112a18(숙고 범위) 확인 |
| 조사 2 | WebSearch | Cambridge Companion Polansky 2014 목차 | 20개 챕터 중 절반 확인 |
| 조사 3 | WebSearch | "1098a16 ergon function eudaimonia" | ergon 논증 결론 위치 1098a16 재확인 |
| 조사 4 | WebSearch | "1106a10 hexis virtue Book II" | hexis 도입은 1105b25, 정의는 1106a10에 명시. DISPUTED 처리 후 SKILL.md에 주의 표기 |
| 조사 5 | WebSearch | "Book III prohairesis 1111b4 1113a14" | III.2 시작 1111b4, 숙고-선택 동일성 1113a4 확인 |
| 조사 6 | WebSearch | "Book VI 1140a24 phronesis" | 1140a24 phronēsis 정의 확인, 1140b3 technē-praxis 구분 확인 |
| 조사 7 | WebSearch | "NE VI = EE V common book" | NE V/VI/VII = EE IV/V/VI 공통권 확인 (Wikipedia + SEP) |
| 조사 8 | WebSearch | "Book IV megalopsychia liberality magnificence" | Book IV 덕 목록 및 megalopsychia 위치 확인 |
| 조사 9 | WebSearch | "Book V justice 1129a 1138b" | 분배적·시정적 정의 구분 + 형평 위치 확인 |
| 조사 10 | WebSearch | "Book VIII IX friendship 1155a three kinds" | philia 세 종류 위치(1156a10–b35), 1155a3-4 도입 확인 |
| 조사 11 | WebSearch | "Book X pleasure contemplative 1172a" | X.7 관조 1177a12 확인, X.9 입법 결론 확인 |
| 교차 검증 1 | WebFetch | Wikipedia NE — 권별 Bekker 범위 일괄 검증 | I~V권 범위 검증 완료, VI~X 부분 확인 |
| 교차 검증 2 | WebSearch | "1146a akrates phronimos cannot Book VII" | 1146a8 + 1152a9에서 akrates ≠ phronimos 명시 확인 (Marechal 2024, De Gruyter 2017) |
| 교차 검증 3 | WebSearch | "1103a17 habit ethos ethike arete" | II.1 1103a17 어원 연결 ēthikē/ethos 검증 |
| 교차 검증 4 | WebFetch | Cambridge Core 페이지 — Polansky 2014 목차 | 20개 챕터 전체 확인 (Bobzien 5장, Lorenz 12장 akrasia, Natali 9장 phronēsis 등) |
| 작성 | Write | SKILL.md 12섹션 + verification.md | 검증된 내용만 반영 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| SEP — Aristotle's Ethics | https://plato.stanford.edu/entries/aristotle-ethics/ | ⭐⭐⭐ High | 2026-05-03 | 1순위 학술 표준 백과 |
| Cambridge Companion to NE (Polansky ed.) — Cambridge Core | https://www.cambridge.org/core/books/cambridge-companion-to-aristotles-nicomachean-ethics/38B133CFD5FEF5FD45C119FFBDF41BF2 | ⭐⭐⭐ High | 2026-05-03 | 1순위 학술 컴패니언, 20장 전체 목차 확보 |
| Wikipedia — Nicomachean Ethics | https://en.wikipedia.org/wiki/Nicomachean_Ethics | ⭐⭐ Medium | 2026-05-03 | 권별 Bekker 범위 교차 검증 |
| Wikipedia — Eudemian Ethics | https://en.wikipedia.org/wiki/Eudemian_Ethics | ⭐⭐ Medium | 2026-05-03 | NE-EE 공통권 검증 |
| Internet Classics Archive — NE (Ross) | https://classics.mit.edu/Aristotle/nicomachaen.html | ⭐⭐ Medium | 2026-05-03 | 영역 전문 검증용 |
| Bryn Mawr Classical Review — Reeve, Aristotle on Practical Wisdom | https://bmcr.brynmawr.edu/2013/2013.11.55/ | ⭐⭐⭐ High | 2026-05-03 | NE VI 표준 주석본 정보 |
| PhilArchive — Lockwood, Habituation in Aristotle | https://philarchive.org/rec/LOCHHA-2 | ⭐⭐ Medium | 2026-05-03 | 1103a17 ethismos 검증 |
| PhilArchive — Bobzien, Choice and Moral Responsibility | https://philarchive.org/rec/BOBCAM | ⭐⭐⭐ High | 2026-05-03 | III.1-5 표준 해석 |
| Wiley PPR — Marechal 2024 | https://onlinelibrary.wiley.com/doi/10.1111/phpr.13032 | ⭐⭐⭐ High | 2026-05-03 | 1146a8 akrates ≠ phronimos 검증 |
| De Gruyter — Enkratēs Phronimos (AGPh 2017) | https://www.degruyterbrill.com/document/doi/10.1515/agph-2017-0002/html | ⭐⭐⭐ High | 2026-05-03 | 1146a8 + 1152a9 위치 재확인 |
| University of Notre Dame — NE Books II-IV review | https://ndpr.nd.edu/reviews/nicomachean-ethics-books-ii-iv-3/ | ⭐⭐⭐ High | 2026-05-03 | II권 hexis·중용 해석 보조 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 핵심 클레임별 판정

| # | 클레임 | 판정 | 근거 |
|---|---|---|---|
| 1 | NE I.7 ergon 논증 결론 = 1098a16 | **VERIFIED** | SEP, 다수 학술 자료 일치. 논증 범위 전체는 1097b22–1098a20. SKILL.md에 두 가지 모두 명시. |
| 2 | NE II hexis 정의 = 1106a10 | **DISPUTED → 보정** | SEP는 1105b25-26 인용. 1106a10에서 정의가 명시되지만 도입은 1105b부터. SKILL.md "주의" 박스로 두 위치 병기. |
| 3 | NE II 습관화 = 1103a17 | **VERIFIED** | II.1 1103a14 시작, 1103a17에서 어원 연결(ēthikē/ethos). |
| 4 | NE II 중용 정의 = 1106b36–1107a8 | **VERIFIED** | 표준 인용 범위. SEP는 1106a26-b28을 중용 일반론 위치로 인용하나 정식 정의 단락은 1106b36–1107a8. |
| 5 | NE III 자발성 = 1109b30–1111b3 | **VERIFIED** | Wikipedia·SEP 일치. III.1은 1109b30부터 시작. |
| 6 | NE III 선택(prohairesis) = 1111b4–1113a14 | **VERIFIED** | 다수 자료 일치. III.2-3 범위. |
| 7 | NE III 숙고 = 1112a18–1113a14 | **VERIFIED** | III.3 범위. 종결점 1113a4(숙고된 것 = 선택된 것). |
| 8 | NE IV 권별 덕 분포 (megalopsychia 등) | **VERIFIED** | Wikipedia + Cambridge Companion 7장(Cullyer)과 일치. |
| 9 | NE V 정의 = 1129a3–1138b14 | **VERIFIED** | 일반 정의 vs 특수 정의, 분배적 vs 시정적 구분 일관. |
| 10 | NE VI = EE V 공통권 | **VERIFIED** | Wikipedia "Books V, VI, and VII of NE = Books IV, V, and VI of EE" 명시. |
| 11 | NE VI 다섯 지적 덕 (epistēmē, technē, phronēsis, sophia, nous) | **VERIFIED** | VI.3-7. 표준 5분류. |
| 12 | NE VI.5 phronēsis 정의 = 1140a24–b30 | **VERIFIED** | 다수 자료 일치. Reeve 주석본(2013)도 동일 범위. |
| 13 | NE VI.13 덕-phronēsis 상호 함축 = 1144b30–1145a2 | **VERIFIED** | "본래 덕(kyrios aretē)과 phronēsis는 상호 함축" 표준 인용. |
| 14 | NE VII.10 akrates ≠ phronimos = 1146a4–9 | **VERIFIED (보정)** | Marechal 2024와 De Gruyter 2017은 핵심 행을 1146a8 + 1152a9로 인용. 1146a4-9 범위에 1146a8이 포함되므로 SKILL.md는 1146a4-9 범위 + 1152a6-14 함께 표기. |
| 15 | NE VIII-IX 우정 = 1155a3–1172a15 | **VERIFIED** | VIII.1 도입 1155a3-4 확인. |
| 16 | NE VIII.3 우정 세 종류 = 1156a10–b35 | **VERIFIED** | 효용·즐거움·덕 기초 우정 표준 분류. |
| 17 | NE X.7 관조적 삶 = 1177a12–1178a8 | **VERIFIED** | 표준 인용 범위. |
| 18 | NE X.9 입법론 = 1179b4–1180b28 | **VERIFIED** | 결론부 입법-교육 논의. |
| 19 | Bywater OCT 1894 NE 표준 비평본 | **VERIFIED** | 자매 스킬 `aristotle-primary-citation`과 일관. |
| 20 | Cambridge Companion (Polansky 2014) 20장 구성 | **VERIFIED** | Cambridge Core 직접 확인. 5장(Bobzien), 12장(Lorenz akrasia), 9장(Natali phronēsis) 등 핵심 챕터 위치 확인. |

### 4-2. 내용 정확성
- [✅] 공식 문서·학술 자료와 불일치하는 내용 없음
- [✅] 권별 Bekker 범위 명시
- [✅] DISPUTED 항목(hexis 정의 행)에 "주의" 표기
- [✅] 자매 스킬 `aristotle-primary-citation`과 인용 형식·표기 일관

### 4-3. 구조 완전성
- [✅] YAML frontmatter (name, description, examples 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 권별 핵심 개념 + Bekker 위치 + akrasia 활용 매핑 표
- [✅] NE I-VI ↔ VII 통합 매핑 표 (섹션 7)
- [✅] 흔한 실수 패턴 9개
- [✅] Quick Reference Card

### 4-4. 실용성
- [✅] 학부생이 akrasia 학위논문 1차 텍스트 챕터에 바로 인용 가능
- [✅] Cambridge Companion 챕터 매핑으로 2차 문헌 후속 조사 가능
- [✅] 자매 스킬과 역할 분담 명확 (인용 형식 vs 본문 내용)

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] skill-tester 실행 완료 (2026-05-03, 3개 질문 수행, 2 PASS / 1 PARTIAL)
- [✅] skill-tester 재검증 실행 완료 (2026-09-26, 2개 질문 수행, 2/2 PASS — 원문 정정 반영 확인)
- [❌] 실제 학위논문 챕터 작성 테스트 미수행 (실사용 후 평가 필요 — 차단 요인 아님, 선택적 보강)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-26 (재검증)
**수행자**: skill-tester → general-purpose (도메인 에이전트 대체; 인문학 전용 에이전트 미등록)
**수행 방법**: 2026-09-26 Perseus 원문 대조 정정(§10, 9건) 반영 후 재검증. SKILL.md Read 후 정정된 장 번호·Bekker 위치를 써야만 답할 수 있는 실전 질문 2개 답변

### 재검증 수행 테스트 (2026-09-26)

**Q1. "akrates는 phronimos일 수 없다"는 aporia가 NE VII.10 1146a4-9에 나오는지**
- ✅ PASS
- 근거: SKILL.md §7-1(b) 표
- 상세: 에이전트가 "기존 'VII.10' 표기는 장 번호 오류 — VII.2가 정확"이라는 정정 각주를 근거로, 정확한 장이 VII.2임을 답변. VII.10은 같은 결론의 반대 방향(1152a6-14, phronimos는 akrates일 수 없다)임을 구분해 설명.

**Q2. NE X권 시작 위치가 1172a16인지**
- ✅ PASS
- 근거: SKILL.md §7-2 통합 매핑 표
- 상세: 에이전트가 표에 기재된 정정값 1172a19를 근거로 1172a16이 아님을 정확히 답변.

### 재검증 발견 gap

- Q2 관련: NE X권은 §7-2 통합 매핑 표 한 줄로만 존재하고 I-VI권처럼 별도 상세 섹션(2차 문헌·활용 포인트 포함)이 없어 교차 확인처가 단일 셀뿐임. 차단 요인 아님(섹션 7 기존 항목과 별개의 신규 선택 보강 후보).

### 재검증 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (개념·인용 정리 스킬 — content test PASS로 APPROVED 가능)
- 최종 상태: APPROVED (PENDING_TEST → APPROVED, 원문 정정 9건 반영 검증 완료)

---

> (이전 최초 검증 기록 — 2026-05-03)

**수행일**: 2026-05-03
**수행자**: skill-tester → general-purpose (도메인 에이전트 대체; 인문학 전용 에이전트 미등록)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. prohairesis(NE III권)와 akrasia(NE VII권)의 관계 — 학위논문 서술 및 Bekker 위치**
- ✅ PASS
- 근거: SKILL.md 섹션 3-2(b), 섹션 3-3 활용 포인트, 섹션 7-1(a) 통합 연결표
- 상세: prohairesis 시작 위치 1111b4(anti-pattern 1109b30 혼동 방지) 명시 확인. VII권 연결 NE VII.4 1148a4-22(para tēn prohairesin), VII.8 1151a5-28(akolastos vs akratēs 대비) 모두 SKILL.md에 근거 존재. 섹션 11(흔한 실수) 에서 "prohairesis를 III권 첫머리(1109b30)으로 잘못 위치" anti-pattern 명시적 차단 확인.

**Q2. phronēsis(NE VI권)가 결핍된 자가 akrates인가? 1146a4-9 인용 방법**
- 🟡 PARTIAL
- 근거: SKILL.md 섹션 6-7, 섹션 7-1(b), 섹션 12(Quick Reference)
- 상세: akrates ≠ phronimos 방향(1146a4-9, 1152a6-14)과 phronimos → not-akrates 역방향(1152a6-14)을 모두 명시. 그러나 "phronēsis 결핍자 전체 = akrates인가?"(역의 성립 여부, 즉 phronēsis 결핍이 akrasia의 필요조건인가 충분조건인가)에 대한 명시적 논의가 없음. 학위논문 논리 구성 시 필요한 구분점. SKILL.md 보강 권장(비차단).

**Q3. hexis 정의가 1105b25 vs 1106a10 두 위치로 표기되는 이유**
- ✅ PASS
- 근거: SKILL.md 섹션 2-1(Bekker 범위), 섹션 2-2(b) 주의 박스, 섹션 11(흔한 실수 패턴)
- 상세: "주의" 박스에서 SEP(1105b25-26) vs 스킬 명세(1106a10-13) 차이를 명시적으로 DISPUTED 처리하고 "사용 비평본·번역본 행 번호를 직접 확인할 것" 지침 제공. 섹션 11에서도 "도입은 1105b25부터, 정의는 1106a10-13에 명시" 구분 명확. hexis 위치 단일화 anti-pattern 방지 확인.

### 발견된 gap

- Q2: "phronēsis 결핍이 akrasia의 필요조건인가 충분조건인가" — 역의 성립 여부에 대한 명시적 논술 부재. 학위논문 논리 체계 구성에 필요한 내용으로 SKILL.md 보강 권장(차단 요인 아님, 선택적 보강).

### 판정

- agent content test: 2 PASS / 1 PARTIAL / 0 FAIL
- verification-policy 분류: 해당 없음 (빌드 설정/워크플로우/설정+실행/마이그레이션 아님)
- 최종 상태: APPROVED

---

### 테스트 케이스 참고 (기존 예정 케이스)

**테스트 케이스 1 (참고용 — 위 Q1·Q2·Q3로 대체됨)**

**입력 (질문/요청):**
```
NE II권 습관화(ethismos)와 VI권 phronēsis가 akrasia 극복에 어떻게 연결되는지
1차 텍스트 인용과 함께 설명해줘.
```

**기대 결과:**
- ethismos 위치 (II.1, 1103a17) 인용
- phronēsis 정의 위치 (VI.5, 1140a24–b30) 인용
- 덕-phronēsis 상호 함축 (VI.13, 1144b30–1145a2) 인용
- akrates ≠ phronimos (VII.10, 1146a4–9) 연결
- "akrasia 극복 = hexis 재형성 + phronēsis 활성화" 결론 도출

---

**테스트 케이스 2 (참고용 — 위 Q1·Q2·Q3로 대체됨)**

**입력:**
```
III권 prohairesis(선택) 정의를 인용하고, akrates의 행위가 prohairesis와 어떤 관계인지
NE VII권 본문과 연결해서 설명해줘.
```

**기대 결과:**
- prohairesis 정의 (III.2, 1111b4–1112a17) 인용
- 숙고된 욕구로서의 prohairesis (1113a9–11) 인용
- akrates는 자신의 prohairesis에 어긋나게(para tēn prohairesin) 행위 (NE VII.4, 1148a4–22) 연결
- akolastos는 잘못된 prohairesis를 지님 (NE VII.8, 1151a5–28) 대비

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 1건은 주의 표기로 보정) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-03 3개 질문 2 PASS/1 PARTIAL; 2026-09-26 재검증 2/2 PASS) |
| **최종 판정** | **APPROVED** (2026-09-26 원문 대조 정정 9건 반영 후 skill-tester 재검증 완료, §5·§10 참조) |

---

## 7. 개선 필요 사항

- [✅] skill-tester를 통한 실사용 테스트 (2026-05-03 완료, 3/3 질문 수행, 2 PASS / 1 PARTIAL)
- [❌] "phronēsis 결핍의 필요조건/충분조건" 논리 구분 추가 — Q2에서 발견된 gap. 차단 요인 아님, 선택적 보강. SKILL.md 섹션 6-7 또는 7-1(b)에 한 문단 추가 권장.
- [❌] 실제 학위논문 챕터 초고에 적용 후 누락된 권/단락이 있는지 점검 — 차단 요인 아님, 실전 도입 후 선택적 보강.
- [❌] EE II.7-8(자발성)·DA III.9-11(욕구) 등 NE 외 작품과의 추가 매핑 보강 검토 — 차단 요인 아님, 선택적 확장.
- [❌] Politics 1.13, 7.13-15 등 도덕교육 관련 *Politics* 단락 매핑 추가 검토 — 차단 요인 아님, 선택적 확장.
- [✅] skill-tester 2단계 재검증 테스트 (2026-09-26 완료, 2/2 PASS — Perseus 원문 대조 정정 9건 반영 확인, VII.10→VII.2 장 번호 오류·X권 1172a19 정정 검증)
- [❌] NE X권 별도 상세 섹션(2차 문헌·활용 포인트) 보강 — Q2 재검증 중 발견된 gap, 차단 요인 아님, 선택적 보강.

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-03 | v1 | 최초 작성. NE I-VI + VIII-X 권별 정리 + akrasia 매핑. status PENDING_TEST. | skill-creator |
| 2026-05-03 | v1 | 2단계 실사용 테스트 수행 (Q1 prohairesis-akrasia 관계 / Q2 phronēsis 결핍과 akrates / Q3 hexis 위치 DISPUTED 처리) → 2/3 PASS 1 PARTIAL, APPROVED 전환 | skill-tester |
| 2026-09-26 | v2 | **Perseus 원문 대조 정정 9건** (SKILL.md 5 + REFERENCE.md 4, §10 표): 장 번호 오류(1146a4-9를 VII.10으로 표기 → VII.2, 3곳), Bekker 위치 오류(1103a18-26 인용 → 1103b1, 1113a4 → 1113a2-3), X권 시작 1172a16 → 1172a19(3곳), IX.10 범위에 IX.11 포함 오류, 덕 정의 번역에서 προαιρετική 누락, 1144b30-32 요약 번역을 원문 인용처럼 제시, Rowe EE OCT 2024 → 2023. status APPROVED → PENDING_TEST | 메인 세션 (원문 대조) |
| 2026-09-26 | v2 | **2단계 재검증 테스트 수행** (Q1 VII.10→VII.2 장 번호 오류 회피 / Q2 X권 시작 1172a19 정정 확인) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |

---

## 10. 원문 대조 기록 (2026-09-26)

- 1차 원문: Perseus canonical-greekLit `tlg0086.tlg010.perseus-grc2.xml` (Bywater 1894), 행 ±1 추정. 장 시작 위치는 XML section div로 전 권 산출(예: II.5 1105b18, III.2 1111b4, IV.3 1123a33, VI.5 1140a23, IX.11 1171a20, X.1 1172a19)
- 서지: OUP(Rowe EE OCT 2023)

| # | 클레임 (기존) | 원문 대조 결과 | 판정 |
|---|---|---|---|
| 1 | I권 구간·ergon 결론 1098a16-18 | "τὸ ἀνθρώπινον ἀγαθὸν ψυχῆς ἐνέργεια γίνεται κατʼ ἀρετήν" 1098a16 | VERIFIED |
| 2 | 외적 좋음 1099a31-b6 | "τῶν ἐκτὸς ἀγαθῶν προσδεομένη" 1099a31-32 | VERIFIED |
| 3 | ēthikē 어원 1103a17 | "μικρὸν παρεκκλῖνον ἀπὸ τοῦ ἔθους" 1103a17-18 | VERIFIED |
| 4 | "정의로운 행위를 함으로써 정의로워진다" 1103a18-26 | "τὰ μὲν δίκαια πράττοντες δίκαιοι γινόμεθα" 1103b1 | 정정 |
| 5 | hexis 결론 1106a10-13 / 도입 1105b25 | "ἕξεις αὐτὰς εἶναι" 1106a12 | VERIFIED |
| 6 | 연속·분할 가능한 것 1106a26 | "ἐν παντὶ δὴ συνεχεῖ καὶ διαιρετῷ" 1106a26 | VERIFIED |
| 7 | 덕 정의 1106b36-1107a8 (번역문) | "ἔστιν ἄρα ἡ ἀρετὴ ἕξις προαιρετική…" 1106b36 — 번역에 προαιρετική 누락 | 정정 |
| 8 | III.1-3 구간, 1111b6-10, 1112b11-28, 1113a9-11 | 장 경계·"βουλευτικὴ ὄρεξις" 1113a11·"εἰ ὑγιάσει" 1112b13 일치 | VERIFIED |
| 9 | "숙고된 것과 선택된 것은 동일" 1113a4 | "βουλευτὸν δὲ καὶ προαιρετὸν τὸ αὐτό" 1113a2-3 | 정정 |
| 10 | IV권 9개 덕 Bekker 표 | IV.1-9 장 경계와 전부 일치 | VERIFIED |
| 11 | megalopsychia 1123b30-1124a4 | "κόσμος τις" 1124a1 | VERIFIED |
| 12 | V권 구간·1129b30 "완전한 덕" | "τελεία" 1129b26·b30·b31 | VERIFIED |
| 13 | VI권 5개 지적 덕·VI.8-11 Bekker | VI.3-11 장 경계 일치, 페리클레스 1140b8 | VERIFIED |
| 14 | 1144b30-1145a2 인용문 | 원문 "οὐχ οἷόν τε ἀγαθὸν εἶναι κυρίως ἄνευ φρονήσεως, οὐδὲ φρόνιμον ἄνευ τῆς ἠθικῆς ἀρετῆς" — 요약 번역임을 명시 | 정정 |
| 15 | "NE VII.10, 1146a4-9" (SKILL 2곳 + REFERENCE 1곳) | 1146a4-9는 VII.2 | 정정 |
| 16 | VII.4 1148a4-22 para tēn prohairesin | "παρὰ τὴν προαίρεσιν" 1148a9 | VERIFIED |
| 17 | VII.8 1151a5-28 | "τὸ μὲν γὰρ παρὰ προαίρεσιν τὸ δὲ κατὰ τὴν προαίρεσιν" 1151a6-7 | VERIFIED |
| 18 | VII.10 1152a25-36 변화 가능성 | "εὐιατοτέρα … οἱ διʼ ἐθισμοῦ ἀκρατεῖς" 1152a27-30 | VERIFIED |
| 19 | X권 1172a16 (SKILL·REFERENCE 3곳) | X.1 시작 1172a19 | 정정 |
| 20 | REFERENCE VIII.2-4·VIII-IX 구간표 | 장 경계 일치 | VERIFIED |
| 21 | REFERENCE "1170b20-1171b28 (IX.10)" | IX.10 = 1170b20-1171a20, IX.11 = 1171a21-b28 | 정정 |
| 22 | REFERENCE X.6-9 구간 | 장 경계 일치 | VERIFIED |
| 23 | Rowe EE OCT 2024 | OUP 2023 | 정정 |
| 24 | Polansky 2014, Irwin 2019, Crisp 2014, Reeve 2013 | 기존 검증과 충돌 없음 | VERIFIED |

**합계: 대조 24건 / 정정 9건(동일 오류 반복 포함 13곳).** 실질 정정이므로 PENDING_TEST.
