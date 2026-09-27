---
skill: aristotle-akrasia-translations-comparison
category: humanities
version: v1
date: 2026-09-26
status: APPROVED
---

# 스킬 검증 — aristotle-akrasia-translations-comparison

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `aristotle-akrasia-translations-comparison` |
| 스킬 경로 | `.claude/skills/humanities/aristotle-akrasia-translations-comparison/SKILL.md` |
| 검증일 | 2026-05-03 |
| 검증자 | skill-creator (Claude Opus 4.7) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 영역본 4종(Ross/Irwin/Crisp/Bartlett & Collins) 출판사 공식 페이지·서평 확인
- [✅] Ross 번역 본문(MIT Internet Classics Archive)으로 propeteia/astheneia/akolasia 직접 확인
- [✅] BMCR 서평으로 Crisp/Bartlett & Collins 핵심 술어 검증
- [✅] Bartlett & Collins의 hexis="characteristic" 표기 검증 (Wikipedia Hexis + Minerva academic 출처)
- [✅] 강상진 외 길 2011판 핵심 번역어 ("자제력 없음", "품성상태") 다중 출처 확인
- [⚠️] 천병희 숲 2013판 propeteia/astheneia/hexis/phronesis/orexis 직접 확인 시도 → **PDF·웹 미공개로 [검증 필요] 표기**
- [✅] 8종 핵심 어휘 비교표 작성
- [✅] 충돌 패턴 4가지 정리 (akrasia/akolasia, enkrateia, hexis, propeteia/astheneia)
- [✅] NE VII.3, VII.7 핵심 구절 번역 비교 작성
- [✅] 인용 형식 가이드 (Chicago Style)
- [✅] 빠른 참조 카드 작성
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 사전 조사 | Read | VERIFICATION_TEMPLATE.md, 참조 스킬 3종 | 템플릿 구조 확인, 기존 스킬과 일관성 보장 |
| 1차 조사 | WebSearch × 4 | Irwin/Crisp/Bartlett-Collins/Ross akrasia 번역어 | 출판사·서평·MIT Classics 자료 12개 수집 |
| 본문 검증 | WebFetch | classics.mit.edu Ross NE Book VII | propeteia="impetuosity", astheneia="weakness", akolasia="self-indulgence" 직접 확인 |
| 2차 조사 | WebSearch × 4 | hexis/phronesis/akolasia/sophrosune 번역어 | Bartlett-Collins hexis="characteristic" 확인 (사용자 초안 "habit/disposition" 정정) |
| 한국어 조사 | WebSearch × 4 | 강상진·천병희 번역어 | 강상진 "자제력 없음"/"품성상태" 다중 확인. 천병희 세부 어휘 직접 확인 불가 |
| 한국어 검증 | WebFetch × 4 | 알라딘·SNU 철학연구소·블로그 비교 | 강상진 외 핵심 어휘 검증. 천병희 세부 어휘는 [검증 필요] 처리 |
| 추가 검증 | WebFetch | Claremont Review 번역 비교 | Crisp prohairesis="rational choice" 확인 (사용자 초안 phronesis 오인 가능성 정정) |
| 교차 검증 | WebSearch × 2 | Crisp phronesis="practical wisdom" 재확인 | VERIFIED |
| 작성 | Write | SKILL.md, verification.md | 총 2개 파일 생성 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Hackett Publishing 공식 (Irwin 3rd ed.) | https://hackettpublishing.com/nicomachean-ethics-irwin-third-edition | ⭐⭐⭐ High | 2026-05-03 | 출판사 공식. ISBN·번역자 정보 1차 출처 |
| Cambridge University Press (Crisp rev. ed.) | https://www.cambridge.org/core/books/aristotle-nicomachean-ethics/C2E5B105977CA6384FF8088CDBA0B90D | ⭐⭐⭐ High | 2026-05-03 | 출판사 공식 |
| University of Chicago Press (Bartlett & Collins) | https://press.uchicago.edu/ucp/books/book/chicago/A/bo11393496.html | ⭐⭐⭐ High | 2026-05-03 | 출판사 공식 |
| MIT Internet Classics Archive (Ross 1908) | https://classics.mit.edu/Aristotle/nicomachaen.7.vii.html | ⭐⭐⭐ High | 2026-05-03 | Ross 무료 공개본 본문 직접 검증 |
| BMCR — Crisp 서평 (Tessitore) | https://bmcr.brynmawr.edu/2001/2001.09.24/ | ⭐⭐⭐ High | 2026-05-03 | 학술 서평. Crisp 술어 비판 검증 |
| BMCR — Lesley Brown / Ross 서평 | https://bmcr.brynmawr.edu/2014/2014.08.45/ | ⭐⭐⭐ High | 2026-05-03 | Ross 개정판 정보 |
| BMCR — Bartlett & Collins 서평 | https://bmcr.brynmawr.edu/2012/2012.05.14/ | ⭐⭐⭐ High | 2026-05-03 | B&C 직역 정책 확인 |
| Claremont Review — Translating the Philosopher | https://claremontreviewofbooks.com/translating-the-philosopher/ | ⭐⭐⭐ High | 2026-05-03 | Susan Collins 인터뷰. Crisp prohairesis="rational choice" 명시 |
| Wikipedia — Hexis | https://en.wikipedia.org/wiki/Hexis | ⭐⭐ Medium | 2026-05-03 | Bartlett & Collins hexis="characteristic" 교차 확인 |
| Minerva (UL.ie) — Hexis 학술 논문 | https://minerva.mic.ul.ie/vol7/moral.html | ⭐⭐ Medium | 2026-05-03 | hexis 번역사 학술 검증 |
| Wikipedia — Nicomachean Ethics | https://en.wikipedia.org/wiki/Nicomachean_Ethics | ⭐⭐ Medium | 2026-05-03 | 영역본 술어 일반 정보 |
| 알라딘 — 강상진 외 (길 2011) | https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=13518065 | ⭐⭐⭐ High | 2026-05-03 | 국역본 1차 서지 |
| 알라딘 — 천병희 (숲 2013) | https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=31685631 | ⭐⭐⭐ High | 2026-05-03 | 국역본 1차 서지. 본문 미공개로 세부 어휘 검증 한계 |
| 한국어 위키백과 — 니코마코스 윤리학 | https://ko.wikipedia.org/wiki/니코마코스_윤리학 | ⭐⭐ Medium | 2026-05-03 | 강상진 외 hexis="품성상태" 교차 확인 |
| 서울대 철학사상연구소 보조자료 | https://philinst.snu.ac.kr/ | ⭐⭐⭐ High | 2026-05-03 | PDF 직접 추출 실패하나 자료 존재 확인 |
| 모르겠고...다음 블로그 (NE 7권) | https://blog.daum.net/prospector8/48 | ⭐ Low | 2026-05-03 | 접속 실패. 강상진 번역 인용 빈도 확인 목적 |
| sootax.co.kr — NE 정리 글 | https://sootax.co.kr/4464 | ⭐ Low | 2026-05-03 | "품성상태" 술어 사용 교차 확인 (블로그 신뢰도 낮으므로 보조 용도) |
| dcinside book gallery 번역 비교 글 | https://gall.dcinside.com/board/view/?id=book&no=495906 | ⭐ Low | 2026-05-03 | 강상진/천병희 문체 비교 확인. 핵심 어휘는 미공개 |
| Perseus Digital Library | https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0054 | ⭐⭐⭐ High | 2026-05-03 | 그리스어 원전 1차 출처 (참조용) |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 핵심 클레임 교차 검증 결과

| 클레임 | 출처 | 판정 |
|--------|------|------|
| Ross가 propeteia를 "impetuosity"로 번역 | MIT Classics Archive 본문 직접 | ✅ VERIFIED |
| Ross가 astheneia를 "weakness"로 번역 | MIT Classics Archive 본문 직접 | ✅ VERIFIED |
| Ross가 akolasia를 "self-indulgence"로 번역 | MIT Classics Archive 본문 직접 | ✅ VERIFIED |
| Ross가 enkrateia를 "continence"로 번역 | MIT + BMCR 서평 | ✅ VERIFIED |
| Irwin이 akrasia를 "incontinence"로 번역 (3rd ed. 유지) | Hackett 공식 + Wikipedia | ✅ VERIFIED |
| Irwin이 phronesis를 "practical wisdom"으로 번역 | Hackett 공식 + WebSearch 다중 | ✅ VERIFIED |
| Irwin이 akolasia를 "intemperance"로 번역 | WebSearch 다중 출처 | ✅ VERIFIED |
| Crisp가 enkrateia를 "self-control"로 번역 | BMCR 2001.09.24 서평 직접 인용 | ✅ VERIFIED |
| Crisp가 phronesis를 "practical wisdom"으로 번역 | WebSearch 다중 + Claremont (대조: prohairesis="rational choice") | ✅ VERIFIED |
| Crisp가 akolasia를 "intemperance"로 번역 | BMCR 2001.09.24 서평 | ✅ VERIFIED |
| Bartlett & Collins가 akrasia를 "lack of self-restraint"로 번역 | Chicago 공식 + WebSearch 다중 | ✅ VERIFIED |
| Bartlett & Collins가 enkrateia를 "self-restraint"로 번역 | Chicago 공식 | ✅ VERIFIED |
| Bartlett & Collins가 hexis를 "characteristic"으로 번역 | Wikipedia Hexis + Minerva 학술 + WebSearch | ✅ VERIFIED (사용자 초안 "habit/disposition" → 정정) |
| Bartlett & Collins가 akolasia를 "licentiousness"로 번역 | WebSearch 다중 출처 | ✅ VERIFIED |
| Bartlett & Collins가 phronesis를 "prudence"로 번역 | WebSearch 다중 | ✅ VERIFIED (사용자 초안과 일치) |
| 강상진 외가 akrasia를 "자제력 없음"으로 번역 | 위키백과·WebSearch 다중 | ✅ VERIFIED |
| 강상진 외가 hexis를 "품성상태"로 번역 | 위키백과·sootax 블로그·WebSearch | ✅ VERIFIED |
| 강상진 외가 phronesis를 "실천적 지혜"로 번역 | WebSearch 다중 | ✅ VERIFIED |
| 천병희가 akrasia를 "무절제" 계열로 번역 | 사용자 초안의 단정. **검색으로는 직접 미확인** | ⚠️ UNVERIFIED → 본문에서 "[검증 필요]" 및 "추정" 표기 |
| 천병희의 propeteia/astheneia/hexis/phronesis/orexis 번역어 | 출판사 페이지·블로그 미공개 | ⚠️ UNVERIFIED → 본문 [검증 필요] 처리 |
| Bywater OCT(1894)가 NE 표준 비평본 | aristotle-primary-citation 스킬과 일관 | ✅ VERIFIED |
| Crisp 개정판 2014년 출간 (ISBN 9781107612235) | Cambridge 공식 + Amazon | ✅ VERIFIED |
| Irwin 3판 2019년 출간 (ISBN 9781624668159) | Hackett 공식 | ✅ VERIFIED |
| Bartlett & Collins 2011년 Chicago 출간 (ISBN 9780226026756) | Chicago 공식 | ✅ VERIFIED |

**총 24개 클레임 검증: VERIFIED 22 / UNVERIFIED 2 (천병희 세부 어휘 — 본문에 [검증 필요] 명시 처리)**

### 4-2. 사용자 초안 정정 사항

| 항목 | 사용자 초안 | 검증 결과 | 본문 반영 |
|------|-------------|-----------|-----------|
| Bartlett & Collins의 hexis | "habit/disposition" | **"characteristic"** | ✅ 정정 |
| Bartlett & Collins의 propeteia | "rashness" | "impetuosity / rashness" 병기 | ✅ 둘 다 표기 |
| 천병희 hexis | "성품 / 습관" | [검증 필요] | ✅ 추정 표기 + [검증 필요] |
| 천병희 phronesis | "실천지 / 사려" | [검증 필요] | ✅ "사려/실천적 지혜" + [검증 필요] |

### 4-3. 내용 정확성

- [✅] 출판사 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (Irwin 3rd ed. 2019, Crisp rev. ed. 2014, B&C 2011, 강상진 외 길 2011, 천병희 숲 2013)
- [✅] deprecated된 표기 없음 (학술 관용 표기 사용)
- [✅] 인용 예시가 Chicago Style 표준 형식

### 4-4. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, example 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 어휘 8종 비교표 (그리스어 + 음역 + 영역본 4종 + 국역본 2종)
- [✅] 번역어 충돌 4가지 패턴 정리
- [✅] 핵심 구절 비교 (NE VII.3, NE VII.7)
- [✅] 인용 권고 가이드
- [✅] Chicago Style 인용 형식
- [✅] 본문 첫 등장 3중 표기 형식
- [✅] 흔한 실수 패턴
- [✅] 빠른 참조 카드
- [✅] 참고 자료 목록

### 4-5. 실용성

- [✅] 학술 논문 작성에 즉시 활용 가능 (3중 표기, 각주 양식 포함)
- [✅] 번역본 우열 단정 회피 (사용자 요구 사항 준수)
- [✅] [검증 필요] 항목 솔직히 명시 (사용자 요구 사항 준수)
- [✅] 관련 스킬 참조(aristotle-primary-citation, akrasia-scholarship-map — 구 aristotle-greek-text-tools는 2026-09-26 aristotle-primary-citation §11로 병합)

### 4-6. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-03; 재검증 2026-09-26)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-03 3/3 PASS; 2026-09-26 재검증 2/2 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 보완 불필요, 3/3 PASS (2026-05-03)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-26 (재검증)
**수행자**: skill-tester → general-purpose (대체)
**수행 방법**: 2026-09-26 Perseus/Ross 원문 대조 정정(§10, 5건) 반영 후 재검증. SKILL.md Read 후 정정된 Ross 인용을 써야만 답할 수 있는 실전 질문 2개 답변

### 재검증 수행 테스트 (2026-09-26)

**Q1. Ross(1908) 번역 "The case of those affected by wine or sleep or madness is similar; for it is plain that knowledge in such cases is not present…"를 1147a24-b5 인용으로 사용 가능한지**
- ✅ PASS
- 근거: SKILL.md §3-1 Ross 인용 정정 각주
- 상세: 에이전트가 해당 문장은 Ross 공개본(MIT Internet Classics Archive)에 존재하지 않는 가짜 인용이며, 실제 Ross 문장("It is plain, then, that incontinent people must be said to be in a similar condition to men asleep, mad, or drunk.")과 정확한 위치(1147a10-24 구간)를 SKILL.md 근거로 정확히 답변.

**Q2. Ross가 "αἴσθησις ... κυρία"를 "control over"로 번역했다고 인용 가능한지**
- ✅ PASS
- 근거: SKILL.md §3-1 "kuria" 번역 정정 각주
- 상세: 에이전트가 "Ross 'control over'" 기술은 SKILL.md에서 이미 정정된 오류이며, Ross 공개본은 "within the sphere of perception"류로 풀어 옮겨 "control" 어휘를 쓰지 않는다는 점을 정확히 답변. Irwin·Crisp 해당 구절은 미검증 표기임도 함께 확인.

### 재검증 발견 gap

- 없음(2/2 PASS). 두 질문 모두 SKILL.md가 이미 DISPUTED로 판정·정정한 항목과 정확히 일치.

### 재검증 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (개념·번역 비교 스킬 — content test PASS로 APPROVED 가능)
- 최종 상태: APPROVED (PENDING_TEST → APPROVED, 원문 정정 5건 반영 검증 완료)

---

> (이전 최초 검증 기록 — 2026-05-03)

**수행일**: 2026-05-03
**수행자**: skill-tester → general-purpose (대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. akolasia 번역어 4종 비교 및 학위논문 권장어 근거**
- 결과: PASS
- 근거: SKILL.md "1. 핵심 어휘 8종 비교표" + "4. 인용 시 번역어 권고 가이드" 섹션
- 상세: 비교표에서 Irwin=intemperance, B&C=licentiousness, 강상진 외=무절제, 천병희=무절제(추정·[검증 필요]) 모두 명시. 권장 근거가 KCI 인용 빈도(박재주 2011 등)로 명시되며 "번역본 우열을 단정하지 않는다"(섹션 0) 원칙 준수 확인.

**Q2. hexis 첫 등장 표기 및 [검증 필요] 이유**
- 결과: PASS
- 근거: SKILL.md "1. 핵심 어휘 8종 비교표", "2-3. hexis: 한국어/영어 모두 다중 번역어", "4-1. 권장 한국어 표준", "6-1. 본문 첫 등장 형식 (3중 표기)", "7. 흔한 실수 패턴" 섹션
- 상세: 한국어 학위논문에는 "품성상태(hexis, ἕξις)" 3중 표기 권고(강상진 외 기준·KCI 인용 빈도 근거). B&C 사용 시 "characteristic" 그대로. [검증 필요]는 천병희 숲 2013판 hexis 번역어가 출판사 공개 페이지·서평으로 확인 불가하여 부착(섹션 0 주의 박스·비교표 천병희 행). 번역본 우열 단정 없이 근거 명시.

**Q3. akrasia ↔ akolasia 한국어 "무절제" 충돌 구분 표기 (천병희 사용 시 예시)**
- 결과: PASS
- 근거: SKILL.md "2-1. akrasia ↔ akolasia: 한국어 '무절제' 중복 가능성", "7. 흔한 실수 패턴" 섹션
- 상세: 천병희 번역 사용 시 구체적 권장 표기 예시 코드블록(섹션 2-1)과 각주 처리 예시(섹션 6-3) 모두 존재. "akrasia / akolasia 모두 '무절제'로 표기"를 흔한 실수로 명시하고 그리스어 병기를 권고. 강상진 외가 두 개념을 분리(akrasia=자제력 없음, akolasia=무절제)한다는 점도 비교표에서 명확히 확인.

### 발견된 gap

없음. 천병희 미확인 항목은 이미 [검증 필요] 표기로 정직하게 처리되어 있으며 SKILL.md 자체의 오류나 누락이 아님.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 해당 없음 (빌드/워크플로우/설정+실행/마이그레이션 카테고리 아님)
- 최종 상태: APPROVED

---

### 테스트 케이스 1: 미실시 (PENDING — 위 "실제 수행 테스트"로 대체)

**입력 (질문/요청):**
```
(skill-tester 호출 후 작성 예정 — 위 섹션으로 대체됨)
```

**기대 결과:** (예정)

**실제 결과:** (예정)

**판정:** PENDING

---

### 테스트 케이스 2: 미실시 (PENDING — 위 "실제 수행 테스트"로 대체)

**입력:** (예정)

**기대 결과:** (예정)

**실제 결과:** (예정)

**판정:** PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ 영역본 4종 모두 출판사·서평으로 검증. 강상진 외 다중 출처 검증 |
| 구조 완전성 | ✅ 9개 섹션 + 빠른 참조 카드 + 참고 자료 |
| 실용성 | ✅ 3중 표기, Chicago Style, 충돌 패턴, 흔한 실수 모두 포함 |
| 한계 | ⚠️ 천병희 숲 2013판 세부 어휘 5종은 [검증 필요] (출판사 미리보기 미공개) |
| 에이전트 활용 테스트 | ✅ (2026-05-03 3/3 PASS; 2026-09-26 재검증 2/2 PASS) |
| **최종 판정** | **APPROVED** (2026-09-26 원문 대조 정정 5건 반영 후 skill-tester 재검증 완료, §5·§10 참조) |

---

## 7. 개선 필요 사항

- [❌] **천병희 숲 2013판 핵심 어휘 5종 직접 확인 후 본 표 보완** — 선택 보강 (차단 요인 아님. 현재 [검증 필요] 표기로 사용자에게 명시되어 있음. 인쇄본 접근 시 v2 업데이트)
  - propeteia, astheneia, hexis, phronesis, orexis 번역어
  - 인쇄본 색인 또는 7권 본문 직접 대조 필요
  - 보완 후 v2로 업데이트
- [❌] **강상진 외 길 2011판 propeteia="성급함" 직접 인쇄본 페이지 확인** — 선택 보강 (차단 요인 아님. KCI 인용 빈도·위키백과 교차 검증으로 APPROVED 기준 충족. 인쇄본 확인 시 v2에 반영)
  - 현재는 도덕윤리교육 분야 KCI 인용 빈도와 위키백과 교차로 추정
  - 실제 인쇄본 7권 본문에서 직접 확인 권장
- [❌] **NE VII.3 1147a24-b5 핵심 구절 영역본 4종 본문 직접 옮김** — 선택 보강 (차단 요인 아님. 본문 인용은 사용자 직접 확인 안내로 대체됨. 인쇄본 접근 시 v2에 반영)
- [✅] **skill-tester 호출 후 실제 활용 테스트 수행** (2026-05-03 완료, 3/3 PASS)
- [✅] **skill-tester 2단계 재검증 테스트** (2026-09-26 완료, 2/2 PASS — Ross 인용 정정 5건 반영 확인, 가짜 인용문·"control over" 오역 정정 회피 검증)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-03 | v1 | 최초 작성. 영역본 4종 + 국역본 2종 비교표 작성. 천병희 세부 어휘 5종은 [검증 필요] 처리 | skill-creator |
| 2026-05-03 | v1 | 2단계 실사용 테스트 수행 (Q1 akolasia 번역어 4종 비교 / Q2 hexis 첫 등장 표기 및 [검증 필요] 이유 / Q3 akrasia↔akolasia 구분 표기) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-26 | v2 | **원문 대조 정정 5건** (§10 표): 1147a24 그리스어 인용 불일치(δὲ 첨가·ἐπιβλέψειεν·ἡ μὲν), 1150b19 그리스어 인용 불일치(τῆς δ' ἀκρασίας → ἀκρασίας δὲ, οἱ → οἳ), Ross 공개본에 존재하지 않는 영역문 삭제·실제 문장으로 교체, Ross 1150b19 영역문 문구 원문대로 교정, Ross "control over"(κυρία) 기술 정정. Irwin 1150b19 영역문은 미검증 표기(직접 인용 금지). status APPROVED → PENDING_TEST | 메인 세션 (원문 대조) |
| 2026-09-26 | v2 | **2단계 재검증 테스트 수행** (Q1 Ross 가짜 인용문 회피 / Q2 "control over" 오역 정정 확인) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |

---

## 10. 원문 대조 기록 (2026-09-26)

- 1차 원문: Perseus `tlg0086.tlg010.perseus-grc2.xml` (Bywater 1894). Ross 영역: MIT Internet Classics Archive Book VII (https://classics.mit.edu/Aristotle/nicomachaen.7.vii.html)

| # | 클레임 (기존) | 원문 대조 결과 | 판정 |
|---|---|---|---|
| 1 | 1147a24 "ἔτι δὲ καὶ ὧδε … ἐπιβλέψειεν … ἡ μὲν γὰρ καθόλου δόξα" | 원문 "ἔτι καὶ ὧδε φυσικῶς ἄν τις ἐπιβλέψειε τὴν αἰτίαν. ἣ μὲν γὰρ καθόλου δόξα" 1147a24-25 | 정정 |
| 2 | "ὧν αἴσθησις ἤδη κυρία" | 1147a25-26 일치 | VERIFIED |
| 3 | Ross "The case of those affected by wine or sleep or madness is similar…" | Ross 공개본에 없음. 실제: "incontinent people must be said to be in a similar condition to men asleep, mad, or drunk" | 정정 |
| 4 | 1150b19 "τῆς δ' ἀκρασίας τὸ μὲν προπέτεια…" | 원문 "ἀκρασίας δὲ τὸ μὲν προπέτεια τὸ δʼ ἀσθένεια. οἳ μὲν γὰρ …" | 정정 |
| 5 | Ross 1150b19 영역 "…while others are led by their emotion because…" | 원문 "…others because they have not deliberated are led by their emotion" | 정정 |
| 6 | Irwin 1150b19 영역 | 인쇄본 대조 불가, 구조상 의역 의심 | > 주의: 미검증 표기 |
| 7 | Ross κυρία = "control over" | Ross는 "within the sphere of perception"류로 풀이 | 정정 |
| 8 | 1150b29-31 akolastos 서술 (VII.8) | "ὁ μὲν ἀκόλαστος … οὐ μεταμελητικός· ἐμμένει γὰρ τῇ προαιρέσει" 1150b29-31 | VERIFIED |
| 9 | VII.3 = 1147a24-b5, VII.7 = 1150b19-28 장 표기 | 장 경계 일치 | VERIFIED |
| 10 | Ross OWC rev. Brown 2009, Irwin 2019, Crisp 2014, Bartlett & Collins 2011 | 기존 검증과 충돌 없음 | VERIFIED |

**합계: 대조 10건 / 정정 5건 / 미검증 1건.** 실질 정정이므로 PENDING_TEST.
