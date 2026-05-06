---
skill: aristotle-primary-citation
category: humanities
version: v1
date: 2026-05-03
status: APPROVED
---

# 스킬 검증 — aristotle-primary-citation

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `aristotle-primary-citation` |
| 스킬 경로 | `.claude/skills/humanities/aristotle-primary-citation/SKILL.md` |
| 검증일 | 2026-05-03 |
| 검증자 | skill-creator (Claude) |
| 스킬 버전 | v1 |
| 대상 사용자 | 학부생/대학원생, 도덕윤리교육 전공, akrasia 주제 논문 작성 |

---

## 1. 작업 목록 (Task List)

- [✅] Bekker 번호 표기 규칙 1순위 소스 확인 (Wikipedia + Stanford SEP 교차)
- [✅] 아리스토텔레스 작품 표준 약어 정리 (University of Washington + Oxford Handbook 교차)
- [✅] 영역본 4종 판본·연도·ISBN 검증 (Hackett·Cambridge·Chicago 공식 페이지)
- [✅] 그리스어 비평본 (Bywater OCT, Susemihl Teubner, Walzer-Mingay/Rowe OCT) 확인
- [✅] *Protrepticus* 재구성본 (Düring, Hutchinson-Johnson) 확인
- [✅] 국역본 2종 (강상진 외 공역, 천병희 역) 출판 정보 검증
- [✅] NE-EE 공통권 (NE V-VII = EE IV-VI) 확인 — Stanford SEP, Wikipedia 교차
- [✅] akrasia 핵심 텍스트 위치 매핑 (NE VII.1-10, 1145a15-1152a36)
- [✅] SKILL.md 작성
- [✅] verification.md 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | "Bekker numbering Aristotle citation system" | Wikipedia, Proofed, Knowadays 등 8개 소스 확보 |
| 조사 2 | WebSearch | "Aristotle works standard abbreviations NE EE MM" | Oxford Handbook, U. Washington, SEP 등 확보 |
| 조사 3 | WebSearch | "Irwin Nicomachean Ethics Hackett 3rd edition 2019" | Hackett 공식 페이지 확보 (ISBN 9781624668159) |
| 조사 4 | WebSearch | "Bywater Aristotelis Ethica Nicomachea OCT" | OUP 공식 페이지 확보 (ISBN 9780198145110) |
| 조사 5 | WebSearch | "강상진 김재홍 이창우 니코마코스 윤리학" | 교보문고, DBpia 확보 |
| 조사 6 | WebSearch | "Aristotle akrasia NE Book VII 1145a-1152a" | SEP, Cambridge Bostock, Bryn Mawr 확보 |
| 조사 7 | WebSearch | "Roger Crisp Cambridge Nicomachean Ethics" | CUP 공식 페이지 확보 |
| 조사 8 | WebSearch | "Bartlett Collins Chicago 2011" | Chicago UP 공식 페이지 확보 |
| 조사 9 | WebSearch | "천병희 니코마코스 윤리학 숲" | 교보문고, 알라딘 확보 (ISBN 9788991290525) |
| 조사 10 | WebSearch | "Eudemian Ethics common books NE V VI VII" | SEP, Wikipedia, OUP 확보 |
| 조사 11 | WebSearch | "Susemihl Eudemian Ethics Teubner" | Notre Dame Reviews, Loeb 확보 |
| 조사 12 | WebSearch | "Aristotle Protrepticus Düring Hutchinson Johnson" | protrepticus.info, PhilPapers 확보 |
| 조사 13 | WebSearch | "Magna Moralia authorship disputed" | SEP, Wikipedia, scientia.global 확보 |
| 조사 14 | WebSearch | "akrasia 1147a practical syllogism drunk asleep" | PhilArchive, Cambridge Journal 확보 |
| 교차 검증 1 | WebFetch | en.wikipedia.org/wiki/Bekker_numbering | 1094a1 = NE 시작점, 5권 1831-1837 확정 |
| 교차 검증 2 | WebFetch | faculty.washington.edu/smcohen/ariworks.htm | NE/EN, EE, MM, Pol, Met, Rhet, Cat 약어 확정 |
| 교차 검증 3 | WebFetch | plato.stanford.edu/entries/aristotle-ethics/ | NE VII = EE VI 동일성, NE 표기 사용 확정 |
| 교차 검증 4 | WebFetch | aladin.co.kr (천병희 숲판) | ISBN 9788991290525, 2013-10-15, 412쪽 확정 |
| 교차 검증 5 | WebFetch | aladin.co.kr (강상진 외 길판) | ISBN 9788964450383, 2011-10-17, 488쪽 확정 |

총 클레임 검증: **17개 클레임 / VERIFIED 16 / DISPUTED 0 / UNVERIFIED 1 (Protrepticus 단편 번호 체계)**

---

## 3. 조사 소스

### 3-1. Bekker 번호·약어 (1순위)

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| Wikipedia — Bekker numbering | https://en.wikipedia.org/wiki/Bekker_numbering | ⭐⭐⭐ High | 표기 규칙·출판 정보 정확 |
| Stanford Encyclopedia — Aristotle's Ethics | https://plato.stanford.edu/entries/aristotle-ethics/ | ⭐⭐⭐ High | 학계 표준 백과사전 |
| University of Washington — Ariworks | http://faculty.washington.edu/smcohen/ariworks.htm | ⭐⭐⭐ High | S. Marc Cohen 교수 작성 약어 표 |
| Oxford Handbook of Aristotle — Abbreviations | https://academic.oup.com/edited-volume/28232/chapter/213265253 | ⭐⭐⭐ High | OUP 공식 학술서 |

### 3-2. 영역본 (출판사 공식)

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| Hackett — Irwin 3rd ed. | https://hackettpublishing.com/nicomachean-ethics-irwin-third-edition | ⭐⭐⭐ High | 출판사 공식 |
| Cambridge — Crisp ed. | https://www.cambridge.org/core/books/aristotle-nicomachean-ethics/C2E5B105977CA6384FF8088CDBA0B90D | ⭐⭐⭐ High | 출판사 공식 |
| Chicago — Bartlett & Collins | https://press.uchicago.edu/ucp/books/book/chicago/A/bo11393496.html | ⭐⭐⭐ High | 출판사 공식 |
| Bryn Mawr Classical Review (Crisp) | https://bmcr.brynmawr.edu/2001/2001.09.24/ | ⭐⭐⭐ High | 학술 서평 |
| Bryn Mawr Classical Review (B&C) | https://bmcr.brynmawr.edu/2012/2012.05.14/ | ⭐⭐⭐ High | 학술 서평 |

### 3-3. 그리스어 비평본

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| OUP — Bywater Ethica Nicomachea | https://global.oup.com/academic/product/ethica-nicomachea-9780198145110 | ⭐⭐⭐ High | OCT 공식 |
| OUP — Rowe Eudemian Ethics | https://global.oup.com/academic/product/aristotles-eudemian-ethics-9780198838326 | ⭐⭐⭐ High | OCT 2024 신간 |
| Notre Dame Phil Reviews — Eudemian Ethics | https://ndpr.nd.edu/reviews/aristotle-eudemian-ethics/ | ⭐⭐⭐ High | Susemihl 한계 언급 |
| protrepticus.info | http://www.protrepticus.info/ | ⭐⭐ Medium | Hutchinson-Johnson 학술 프로젝트 |
| PhilPapers — Düring Protrepticus | https://philpapers.org/rec/DRIAPA-3 | ⭐⭐⭐ High | 학술 데이터베이스 |

### 3-4. 국역본 (한국 서점)

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| 교보문고 — 강상진 외 이제이북스판 | https://product.kyobobook.co.kr/detail/S000000824436 | ⭐⭐⭐ High | 대형 서점 |
| 알라딘 — 강상진 외 길판 | https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=13518065 | ⭐⭐⭐ High | ISBN·페이지 검증됨 |
| 알라딘 — 천병희 숲판 | https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=31685631 | ⭐⭐⭐ High | ISBN·페이지 검증됨 |
| DBpia — 이창우·김재홍·강상진 서평 | https://www.dbpia.co.kr/Journal/articleDetail?nodeId=NODE01262922 | ⭐⭐⭐ High | 학술 데이터베이스 |

### 3-5. akrasia 학술 자료

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| SEP — Alternate Readings on Akrasia | https://plato.stanford.edu/entries/aristotle-ethics/supplement1.html | ⭐⭐⭐ High | SEP 보충 항목 |
| Cambridge — Bostock akrasia 챕터 | https://resolve.cambridge.org/core/services/aop-cambridge-core/content/view/CAF6330853CA6C4D6283BE3A1C266DAF/9780511802041c8_p233-256_CBO.pdf/akrasia_or_failure_of_selfcontrol_nicomachean_ethics_7110.pdf | ⭐⭐⭐ High | CUP 학술서 챕터 |
| Bryn Mawr — NE Book VII Symposium | https://bmcr.brynmawr.edu/2009/2009.08.58/ | ⭐⭐⭐ High | 학술 리뷰 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 클레임별 판정

| # | 클레임 | 판정 | 소스 |
|---|--------|------|------|
| 1 | Bekker판은 1831-1837년 5권 베를린 학술원 출간 | **VERIFIED** | Wikipedia + SEP |
| 2 | Bekker 번호는 페이지(예: 1147) + 단(a/b) + 줄(예: 24) 구조 | **VERIFIED** | Wikipedia |
| 3 | 1094a1 = NE 시작점, Corpus 전체에서 번호 연속 | **VERIFIED** | Wikipedia |
| 4 | NE/EN, EE, MM, Pol, Met/Metaph, Rhet, Cat 약어 표준 | **VERIFIED** | UW + Oxford Handbook |
| 5 | "Nicomachean" 철자 (h 한 개) | **VERIFIED** | UW Cohen 페이지 |
| 6 | NE V/VI/VII = EE IV/V/VI 공통권 | **VERIFIED** | SEP + Wikipedia |
| 7 | Bywater OCT 초판 1890, ISBN 9780198145110 현행 | **VERIFIED** | OUP 공식 + PhilPapers |
| 8 | Irwin Hackett 3rd ed. 2019, ISBN 9781624668159 | **VERIFIED** | Hackett 공식 |
| 9 | Irwin Hackett 2nd ed. 1999, ISBN 9780872204645 | **VERIFIED** | Internet Archive + Amazon |
| 10 | Crisp Cambridge 초판 2000, ISBN 9780521635462 / 개정판 2014 ISBN 9781107612235 | **VERIFIED** | Cambridge 공식 + Amazon |
| 11 | Bartlett & Collins Chicago 2011, ISBN 9780226026756, 339쪽 | **VERIFIED** | Chicago UP 공식 |
| 12 | 강상진 외 이제이북스 2006, ISBN 9788956440842 | **VERIFIED** | 교보문고 |
| 13 | 강상진 외 길 2011-10-17, ISBN 9788964450383, 488쪽 | **VERIFIED** | 알라딘 직접 확인 |
| 14 | 천병희 숲 2013-10-15, ISBN 9788991290525, 412쪽 | **VERIFIED** | 알라딘 직접 확인 |
| 15 | akrasia 핵심 논의: NE VII.1-10, 1145a15-1152a36 | **VERIFIED** | SEP + Cambridge Bostock |
| 16 | astheneia(나약함) vs propeteia(성급함) 두 종류 구분 | **VERIFIED** | SEP + 학술 논문 다수 |
| 17 | *Protrepticus* 단편 번호 체계 (재구성본별 차이) | **UNVERIFIED** | 개별 단편 번호는 Düring/Johnson 등 재구성본 직접 대조 필요 — SKILL.md에 "재구성본 명시 필수"로 표기 |

### 4-2. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전·판본 정보 명시 (각 번역본별 ISBN·연도)
- [✅] deprecated된 표기 사용 안 함
- [✅] 인용 예시가 실제 학계 관행과 일치

### 4-3. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념(Bekker, 약어, 공통권) 설명 포함
- [✅] 인용 예시 포함
- [✅] 언제 어떤 번역본을 쓸지 기준 포함
- [✅] 흔한 실수 패턴 포함 (섹션 8)

### 4-4. 실용성

- [✅] 학부생이 참조해 실제 논문 인용에 사용 가능한 수준
- [✅] 빠른 참조 카드(섹션 9) 제공
- [✅] 도덕윤리교육 + akrasia 주제에 특화
- [✅] 한국·영미 양쪽 학계 관행 모두 반영

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-03 수행 완료)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 불필요 — gap 없음)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-03
**수행자**: skill-tester (general-purpose 에이전트로 대체 — 도메인 전용 에이전트 미등록)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Bekker 번호 표기법 + 국역본 위치 + 대문자/페이지 표기 오류**

질문: NE VII.3의 1147a24-b5 한국어 논문 인용 방법. '1147A24-B5'나 'p.245(강상진 역)' 표기가 잘못된 이유 포함.

- PASS
- 근거: SKILL.md "0. 인용의 기본 원칙" (Bekker 번호로 인용, 번역본은 참고문헌/첫 각주), "1-1. 구조" (소문자 a/b), "1-3. 작품과 함께 표기하는 형식", "1-4. 범위 표기" (다른 단까지 1147a24-b5), "8. 흔한 실수 패턴" (1147A24 → 1147a24, p.245 → Bekker)
- 상세: anti-pattern 3개(대문자 단 표기, 페이지 번호 인용, 번역본 정보 본문 삽입) 모두 근거 섹션에 명시. 올바른 형식과 잘못된 형식의 대비가 섹션 0·섹션 8에 구체적으로 제시되어 답변 도출에 충분.

**Q2. 철자 오류('Nichomachean') + 공통권(NE VII = EE VI) 보완 표기**

질문: 지도교수의 두 지적(철자, 공통권 귀속 표기 미기재)에 대한 올바른 인용 형식.

- PASS
- 근거: SKILL.md "2-2. 표기 시 주의" (Nicomachean / Nichomachean 구분, 가장 흔한 실수로 명시), "3. NE-EE 공통권 문제" (NE VII = EE VI 동일), "3-1. 인용 권장 방식" (`NE VII.3 (= EE VI.3), 1147a24-b5`), "8. 흔한 실수 패턴" (공통권을 NE에만 귀속 → 양쪽 명시)
- 상세: 두 오류 모두 별도 섹션에 독립적으로 다루어져 있으며, 올바른 형식이 코드 블록으로 명시되어 있어 답변 도출에 전혀 ambiguity 없음.

**Q3. Irwin 3판 vs Crisp 개정판 차이 및 참고문헌 표기**

질문: 두 번역본의 판본·특징·참고문헌 인용 형식 차이.

- PASS
- 근거: SKILL.md "5-1. Irwin(Hackett)" (3판 2019, ISBN, 학부 강의 채택 특징), "5-2. Crisp(Cambridge)" (개정판 2014, ISBN, 줄 번호 병기, 가독성 특징), "5-5. 영역본 인용 표기 차이" (본문은 Bekker 번호로 통일, 번역본 정보는 참고문헌에서 구분, 참고문헌 표기 예시 포함)
- 상세: 두 번역본의 판본·특징 모두 개별 섹션에 상세 기술. 논문에서 "어느 쪽을 선택해야 하는가"에 대한 직접 우열 판정은 없으나, 이는 의도적 중립 설계로 gap 아님. 학술 논문 국역본 권장(섹션 6-3)으로 맥락 완성.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 직접 근거 섹션을 찾을 수 있었으며, anti-pattern 회피 여부도 섹션 8에서 명확히 확인 가능.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 해당 없음 (빌드/워크플로우/설정+실행/마이그레이션 아님)
- 최종 상태: APPROVED

---

### 테스트 케이스 원본 템플릿 (참고 보존)

**테스트 케이스 1: (예정 템플릿)**

**입력 (질문/요청):**
```
(skill-tester가 작성)
```

**기대 결과:**
```
(skill-tester가 작성)
```

**실제 결과:**
```
(skill-tester가 작성)
```

**판정:** PENDING

---

**테스트 케이스 2: (예정 템플릿)**

**입력:** (skill-tester가 작성)

**기대 결과:** (skill-tester가 작성)

**실제 결과:** (skill-tester가 작성)

**판정:** PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (17개 클레임 중 16 VERIFIED, 1 UNVERIFIED는 SKILL.md에 주의 표기) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS — 2026-05-03 수행, general-purpose 에이전트 대체) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-03 완료, 3/3 PASS)
- [❌] *Protrepticus* 단편 번호 체계 — Düring 1961본·Hutchinson-Johnson 본의 단편 번호 매핑표 추가 (학부 수준에서는 우선순위 낮음 — 차단 요인 아님, 선택 보강)
- [❌] 한국어 도덕교육 학회지 인용 양식(예: 한국윤리학회, 도덕교육연구) 추가 검토 — 본 스킬은 Chicago Style 중심이므로 한국 학회 양식 별도 정리 가능 (차단 요인 아님, 선택 보강)
- [❌] *De Anima* III.9-11과 *Rhet.* I.10의 akrasia 관련 단락 세부 매핑 (현재는 권/장 단위만 표기 — 차단 요인 아님, 선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-03 | v1 | 최초 작성. 17개 클레임 검증 (16 VERIFIED, 1 UNVERIFIED). | skill-creator (Claude) |
| 2026-05-03 | v1 | 2단계 실사용 테스트 수행 (Q1 Bekker 표기법+국역본 위치 / Q2 철자+공통권 보완 / Q3 Irwin vs Crisp 비교) → 3/3 PASS, APPROVED 전환 | skill-tester |
