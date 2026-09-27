---
skill: aristotle-primary-citation
category: humanities
version: v2
date: 2026-09-26
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

### 4-1b. 2026-09-26 NE VII 장 매핑 원문 대조 (akrasia-vs-akolasia 스킬과의 장 표기 충돌 해소)

1차 소스: Perseus canonical-greekLit `tlg0086.tlg010.perseus-grc2.xml` (Bywater 1894 OCT, Bekker 5행 milestone + 장 div) — https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0086/tlg010/tlg0086.tlg010.perseus-grc2.xml (⭐⭐⭐ High). XML의 VII권 장 구분은 `<div type="textpart" subtype="section" n="1"…"14">`(Bywater 장 번호). 장 div 앞뒤 5행 표지 사이 어수 비례로 시작 행 보간(±1행). 교차: BMCR 2009.08.58 (https://bmcr.brynmawr.edu/2009/2009.08.58/) "1150b29-1151a28, i.e., the whole of VII 8"; PhilPapers Broadie "Nicomachean Ethics VII, 1150b29-1151b22" (https://philpapers.org/rec/BRONEV-2).

| # | 클레임 (구 §7-1) | 판정 | 원문 근거 (장 div 첫 구절 · 앞뒤 표지) | 정정 후 |
|---|------------------|------|------------------------------|---------|
| C1 | VII.1 = 1145a15–35 | DISPUTED → 정정 | n=7 book div 직후 [1145a15] μετὰ δὲ ταῦτα λεκτέον…; VII.2 div는 1145b20–25 사이 | VII.1 = 1145a15–1145b20 (세 상태 제시는 1145a15–35) |
| C2 | VII.2 = 1145b21–1146b8 | DISPUTED(±1) → 정정 | VII.3 div "πρῶτον μὲν οὖν σκεπτέον…"가 1146b5–10 사이, 보간 b8 | VII.2 = 1145b21–1146b7, VII.3 = 1146b8–1147b19 |
| C3 | VII.4 내용 = propeteia vs astheneia | DISPUTED → 정정 | VII.4 div [1147b20] "πότερον δʼ ἐστί τις ἁπλῶς ἀκρατὴς ἢ πάντες κατὰ μέρος"; προπετῆ ἀκρασίαν은 VII.7 div 안 1150b25–28 | VII.4 = 단적 vs 부분적 akrasia; propeteia/astheneia는 VII.7 1150b19–28 |
| C4 | VII.5 = 1148b15–1149a24 | DISPUTED(±1) → 정정 | VII.6 div "ὅτι δὲ καὶ ἧττον αἰσχρὰ ἀκρασία ἡ τοῦ θυμοῦ"가 1149a20–25 사이, 보간 a24 | VII.5 = 1148b15–1149a23 |
| C5 | VII.7 = 1150a9–1151a28 | DISPUTED → 정정 | VII.7 div "περὶ δὲ τὰς διʼ ἁφῆς…" 1150a5–10 사이(보간 a9); VII.8 div "ἔστι δʼ ὁ μὲν ἀκόλαστος, ὥσπερ ἐλέχθη, οὐ μεταμελητικός·" 직후 [1150b30] 표지 → VII.8 시작 1150b29 | VII.7 = 1150a9–1150b28, VII.8 = 1150b29–1151a28 |
| C6 | VII.8–10 = 1151a29–1152a36 | DISPUTED → 정정 | VII.9 div "πότερον οὖν ἐγκρατής ἐστιν…" 1151a25–30 사이(보간 a29); VII.10 div "οὐδʼ ἅμα φρόνιμον καὶ ἀκρατῆ…" 1152a5–10 사이(보간 a6) | VII.9 = 1151a29–1152a5, VII.10 = 1152a6–36 |
| C7 | VII.3 = 1146b8–1147b19, VII.6 = 1149a24–1150a8, 전체 1145a15–1152a36 | VERIFIED | 위 장 div 위치와 일치 | 유지 |
| C8 | 장 구분 판본 의존성 | 주의 명기 | Bekker 1831·Susemihl 등 구판·일부 번역본은 장 번호 상이(akrasia-vs-akolasia 스킬 §3 주의와 동일) | SKILL.md §7-1에 "기준: Bywater 장 구분, 절대 기준은 Bekker 행" 명기 |

**정정 반영**: SKILL.md §7-1 표 전체 재작성 + 장 시작 위치 목록 주석 추가. `aristotle-akrasia-vs-akolasia-distinction`의 장 표기(VII.8 = 1150b29–1151a28, VII.10 = 1152a6–36)와 일치시킴.

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

### [4차 테스트] 2026-09-26 — NEEDS_REVISION 해소(v2.2 propeteia/astheneia 범위 통일) 검증 재테스트

**수행일**: 2026-09-26
**수행자**: skill-tester → general-purpose (도메인 전용 학술 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인. 직전 3차 재테스트에서 발견된 §7-1·§9(1150b19-28) vs §11-2(1150b19-22) 내부 불일치를 메인 세션이 Perseus 원문 재대조로 "구분·정의 1150b19-22 / 논의 전체 1150b19-28"로 통일(v2.2)한 결과물이 실제로 SKILL.md 3곳(§7-1·§9·§11-2)에서 일관되게 답변 근거로 작동하는지 확인

### 실제 수행 테스트 (4차)

**Q1. propeteia/astheneia 인용 시 "구분·정의"만 인용할 때와 "VII.7 논의 전체"를 인용할 때 각각 어떤 Bekker 범위를 쓰는지**
- ✅ PASS
- 근거: SKILL.md §7-1 표 VII.7 행("구분·정의 1150b19–22, ... 논의 전체 1150b19–28"), §9 빠른 참조 카드("1150b19-22 ← ... 구분·정의 (논의 전체 1150b19-28)"), §7-4 인용 예시(`NE VII.7, 1150b19-22`)
- 상세: "구분·정의"는 1150b19-22, "두 유형을 다루는 논의 전체"는 1150b19-28로 정확히 구분해 답변. "아무거나 써도 된다"는 오답을 SKILL.md 근거로 명시적으로 반박함(§7-1의 DISPUTED 각주는 VII.3 실천 추론 범위에만 해당하고 이 두 범위에는 적용되지 않음을 정확히 짚음). 3차 재테스트 때 발견되었던 §7-1·§9·§11-2 간 내부 불일치는 더 이상 나타나지 않음 — v2.2 통일이 실제로 정합적으로 작동함을 확인.
- 품질 평가 메모(에이전트 자체 보고): "VII.7 논의 전체"라는 표현이 "VII.7 챕터 전체(1150a9-1150b28)"와 혼동될 여지가 이론상 있으나 이는 표현상의 잠재적 모호함이지 오류·gap은 아님(SKILL.md가 명확히 두 유형 논의 범위로 한정해 서술하고 있음).

**Q2. NE VII.7-VII.8 경계(Bekker 행)·핵심 내용·비평본 기준·판본 차이 대응법**
- ✅ PASS
- 근거: SKILL.md §7-1 표(VII.7 = 1150a9–1150b28, VII.8 = 1150b29–1151a28) + "장 경계 기준(2026-09-26 원문 대조 정정)" 각주(Bywater OCT 1894 기준, Perseus 원문 근거 인용) + "주의(Bekker 행 번호 인용 시 DISPUTED 처리)" 각주 + §1-2(Bekker판 출처)
- 상세: 경계(1150b28/1150b29), 각 장 핵심 내용, Bywater OCT 기준 명시, "장 번호는 판본마다 다를 수 있으나 Bekker 행이 절대 기준"이라는 대응 원칙까지 모두 SKILL.md 문구를 정확히 인용해 답변. anti-pattern(장 번호를 절대 기준으로 오인) 없음.

### 발견된 gap (4차)

없음. 3차 재테스트에서 발견된 §7-1·§9(1150b19-28) vs §11-2(1150b19-22) 내부 불일치는 메인 세션의 v2.2 정정("구분·정의 1150b19-22 / 논의 전체 1150b19-28"로 세 곳 통일) 이후 재발하지 않음을 이번 재테스트로 확인.

### 판정 (4차)

- agent content test: 2/2 PASS
- Perseus 원문 재대조 재확인: 별도 재fetch 없이 SKILL.md 서술 내 일관성만 확인(원문 재대조 자체는 3차 테스트에서 이미 완료). 두 범위(1150b19-22 / 1150b19-28)가 SKILL.md 3곳(§7-1·§9·§11-2)에서 모두 "구분·정의 / 논의 전체" 의미로 일관됨을 확인
- verification-policy 분류: 해당 없음 (개념·인용 정리 스킬 — content test로 APPROVED 가능)
- 최종 상태: NEEDS_REVISION → **APPROVED** (v2.2 정정 사항이 실사용 질문에서 정확히 근거로 작동함을 확인, 신규 gap 없음)

---

### [3차 테스트] 2026-09-26 — §7-1 NE VII 장 매핑 정정 후 재테스트 (Perseus 원문 대조 포함)

**수행일**: 2026-09-26
**수행자**: skill-tester → general-purpose (도메인 전용 학술 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 정정된 NE VII 장 시작 위치·VII.4 정체성을 인용해야 답할 수 있는 실전 질문 3개 답변, 근거 섹션 확인 + Perseus canonical-greekLit 원문(raw XML) 직접 fetch로 그리스어 원문·Bekker milestone 대조

### 실제 수행 테스트 (3차)

**Q1. NE VII.1~VII.10 전체 장 시작 Bekker 위치 매핑, VII.7-VII.8 경계**
- ✅ PASS
- 근거: SKILL.md §7-1 표 + "장 경계 기준(2026-09-26 원문 대조 정정)" 각주
- Perseus 대조: `<div subtype="section" n="7">`(VII.7)의 첫 문장 "περὶ δὲ τὰς διʼ ἁφῆς καὶ γεύσεως..."가 line milestone n="5"-"10" 사이(1150a5-9경)에 위치 — SKILL.md의 "VII.7 = 1150a9 시작" 표기와 정확히 부합. VII.8 시작(1150b29)은 skill1 검증 시 이미 동일 소스로 확인(§4-1b 교차).

**Q2. NE VII.4의 정체성(단적/부분적 akrasia) — propeteia/astheneia와 혼동 여부**
- 🟡 PARTIAL
- 근거: SKILL.md §7-1 표(VII.4 = 1147b20-1148b14, 단적/부분적 akrasia) + §7-1(VII.7 = 1150a9-1150b28, propeteia·astheneia는 1150b19-28) + §9 빠른 참조 카드(동일하게 1150b19-28) + §11-2 어휘표(προπέτεια·ἀσθένεια 출처를 1150b19-22로 표기)
- 상세: **핵심 질문(VII.4 ≠ propeteia/astheneia, 정확한 소속은 VII.7)에는 정확히 답변**하여 오늘 정정된 장 매핑을 올바르게 인용함. 그러나 답변 과정에서 **SKILL.md 내부 불일치를 발견**: §7-1 표·§9 빠른 참조 카드는 propeteia/astheneia 위치를 "**1150b19-28**"로, §11-2 어휘표는 동일 개념의 출처를 "**1150b19-22**"로 서로 다르게 표기함. Perseus 원문 raw XML 직접 대조 결과, "ἀκρασίας δὲ τὸ μὲν προπέτεια τὸ δʼ ἀσθένεια" 문장은 실제로 milestone n="15"와 n="20" 사이(≈1150b15-19)에서 끝나며, **1150b22도 1150b28도 정확한 milestone과 일치하지 않음**. 다만 문장 자체가 짧고 line 20 직전(~1150b19)에서 종료되는 점을 보면 "**1150b19-22**"(§11-2)가 실제 문장 범위에 더 근접하고, "**1150b19-28**"(§7-1·§9)은 VII.7 챕터 전체 종료 행(1150b28, VII.8 직전)과 혼동되어 잘못 복사되었을 가능성이 있음.

**Q3. VII.8 시작 위치(1150b29 vs 1150b30) 판단 + 판본별 표기 차이 대응법**
- ✅ PASS
- 근거: SKILL.md §7-1 표 + "장 경계 기준" 각주(Bywater 원문 대조로 1150b29 확정, ±1행 명기) + §7-1 "주의(Bekker 행 번호 인용 시 DISPUTED 처리)" 각주(비평본 명시 + 학자 인용 범위 병기 절차)
- Perseus 대조: skill1(akrasia-vs-akolasia) 검증 시 동일 소스에서 VII.8 div 첫 문장("ἔστι δʼ ὁ μὲν ἀκόλαστος...οὐ μεταμελητικός")이 1150b25(직전 div 종료)~1150b30(다음 milestone) 사이에 위치함을 확인 — 1150b29 표기와 정합.

### Perseus 원문 대조 종합 (raw XML 직접 fetch, 2026-09-26)

소스: https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0086/tlg010/tlg0086.tlg010.perseus-grc2.xml (Bywater 1894 OCT 기반, ⭐⭐⭐ High)

| 확인 항목 | 결과 |
|---|---|
| VII.7 장 div 시작·1150a9 근접 | 일치 (div n="7" 첫 문장이 line milestone n="5"-"10" 사이) |
| VII.4 장 div 시작·1147b20 | 일치 (skill1 검증 시 동일 소스로 확인 완료 — div n="4" 첫 문장이 line n="20" 직후) |
| VII.8 장 div 시작·1150b29 | 일치 (skill1 검증 시 확인 완료 — div n="8" 첫 문장이 line 25~30 사이) |
| προπέτεια/ἀσθένεια 출처 행수 (1150b19-22 vs -28) | **불일치 발견** — 원문 핵심 문장은 line milestone n="15"-"20" 사이(≈1150b19)에서 종료. "-22"·"-28" 둘 다 5행 단위 milestone과 정확히 일치하지 않으나, "-28"은 VII.7 챕터 종료 행(1150b28)과의 혼동 가능성이 있어 "-22"(§11-2)가 더 근접한 것으로 판단됨 |

### 발견된 gap (3차)

- **[SKILL.md 내부 불일치 — 사용자 승인 후 수정 권장]** §7-1 표·§9 빠른 참조 카드의 "propeteia(성급함)·astheneia(나약함) = NE VII.7, 1150b19-28"과 §11-2 어휘표의 "NE VII.7, 1150b19-22" 사이 불일치. Perseus 원문 대조 결과 두 값 모두 5행 단위 milestone과 정확히 일치하지는 않으나(원문 핵심 문장은 line 15-20 사이에서 종료), "1150b19-28"은 VII.7 챕터 전체 종료 행(1150b28)과 혼동되었을 가능성이 있어 "1150b19-22"(§11-2)가 더 근접한 값으로 판단됨. skill-tester는 SKILL.md를 직접 수정하지 않음 — 사용자 승인 후 §7-1·§9를 1150b19-22로 통일하거나, 실제 비평본(Bywater OCT 1894 인쇄본) 직접 대조로 재확정 권장.

### 판정 (3차)

- agent content test: 2/3 PASS (Q1 PASS, Q2 PARTIAL — 핵심 정답은 맞으나 SKILL.md 내부 불일치 신규 발견, Q3 PASS)
- Perseus 원문 독립 재대조: 장 경계 3건 일치, propeteia/astheneia 행수 1건 불일치 발견
- verification-policy 분류: 해당 없음 (개념·인용 정리 스킬)
- 최종 상태: NEEDS_REVISION (내부 행수 불일치 해소 전까지 APPROVED 보류 — 오늘 정정 대상이었던 장 경계·VII.4 정체성 자체는 모두 VERIFIED)

---

### [재검증] 2026-09-26 — §11 병합분(aristotle-greek-text-tools) content test

**수행일**: 2026-09-26
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변(§11 병합분 겨냥 1개 포함), 근거 섹션 및 anti-pattern 회피 확인

**Q1. (병합분 겨냥) NE VII.3, 1147a24-b5를 Perseus Digital Library에서 열람하는 URL 구성과 행 번호 직접 이동 가능 여부**
- PASS
- 근거: SKILL.md "11-1. Perseus Digital Library — 니코마코스 윤리학 접근 URL" (Bekker URL 패턴 `:bekker+page%3D{PAGE}`, 435번째 줄 "주의")
- 상세: 페이지 단위(`1147a`)만 URL로 이동 가능하고 행 번호(24)는 URL로 직접 지정 불가하다는 한계를 정확히 근거로 제시. Perseus 본문이 Bywater(OCT) 기반이라는 주의 문구도 함께 인용됨. anti-pattern(행 번호까지 URL로 이동 가능하다고 오답)을 정확히 피함.

**Q2. 각주 "강상진 역, p.245" + 본문 "1147A24" 오류 지적과 올바른 형식**
- PASS
- 근거: SKILL.md "0. 인용의 기본 원칙"(지양 예시 그대로 일치), "1-1. 구조"(a/b 소문자), "6-1. 강상진·김재홍·이창우 공역"(3인 공역·길 2011 표준판), "8. 흔은 실수 패턴"
- 상세: 페이지 인용·대문자 표기 두 오류 모두 §0·§8의 실제 anti-pattern 표와 1:1 대응시켜 답변. "강상진 역" 표기가 3인 공역 사실과 다르다는 점까지 §6-1 근거로 짚어냄.

### 발견된 gap (§11 병합분)

없음. 2개 질문 모두 SKILL.md §11(병합분)·기존 섹션에서 명확한 근거를 찾음.

### 판정 (2026-09-26 재검증)

- agent content test: 2/2 PASS (병합분 §11 포함)
- verification-policy 분류: 해당 없음 (도메인 지식 스킬)
- 최종 상태: APPROVED (병합 전 §1-10 기존 3/3 PASS + 병합분 §11 2/2 PASS 종합)

---

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
| 에이전트 활용 테스트 | ✅ (3/3 PASS — 2026-05-03, general-purpose 대체 / §11 병합분 2/2 PASS — 2026-09-26, general-purpose 대체 / §7-1 장 매핑 정정 후 3차 재테스트 2/3 PASS — 2026-09-26(Q2 PARTIAL, 내부 불일치 신규 발견) / **v2.2 통일 후 4차 재테스트 2/2 PASS — 2026-09-26, 내부 불일치 재발 없음 확인**) |
| 2026-09-26 장 매핑 정정 | §7-1 NE VII 장 매핑 6건 DISPUTED → Perseus Bywater XML 장 div로 정정 (섹션 4-1b), 3차 재테스트로 Perseus 원문 독립 재대조 완료(장 경계 3건 일치) |
| 2026-09-26 3차 재테스트 발견 → v2.2 해소 | §7-1·§9(1150b19-28) vs §11-2(1150b19-22) propeteia/astheneia 행수 내부 불일치 발견 → 메인 세션이 Perseus grc2 XML 재대조로 "구분·정의 1150b19-22 / 논의 전체 1150b19-28"로 3곳 통일(v2.2) → 4차 재테스트로 정합성 확인 완료 |
| **최종 판정** | **APPROVED** (§7-1 장 경계·VII.4 정체성은 Perseus 원문 재대조로 VERIFIED, propeteia/astheneia 행수 불일치는 v2.2로 해소하고 4차 재테스트 2/2 PASS로 검증 완료) |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-03 완료, 3/3 PASS)
- [✅] §11 병합분(Perseus 접근·Bekker URL 패턴·어휘 분석) content test 수행 (2026-09-26 완료, 2/2 PASS)
- [✅] §7-1 장 매핑 정정분(2026-09-26) skill-tester 재테스트 — 2026-09-26 3차 재테스트 완료(2/3 PASS + Perseus 원문 독립 재대조로 장 경계 3건 일치 확인)
- [✅] propeteia(성급함)·astheneia(나약함) 출처 행수 불일치 해소 — 3차 재테스트에서 발견된 §7-1·§9(1150b19-28) vs §11-2(1150b19-22) 불일치를 메인 세션이 Perseus grc2 XML 원문 직접 대조로 재확정(2026-09-26, v2.2): "구분·정의 1150b19-22 / 논의 전체 1150b19-28"로 §7-1·§9·§11-2 세 곳 통일. 4차 재테스트(2026-09-26, 2/2 PASS)로 통일이 실사용 질문에서 정합적으로 작동함을 확인 완료
- [❌] *Protrepticus* 단편 번호 체계 — Düring 1961본·Hutchinson-Johnson 본의 단편 번호 매핑표 추가 (학부 수준에서는 우선순위 낮음 — 차단 요인 아님, 선택 보강)
- [❌] 한국어 도덕교육 학회지 인용 양식(예: 한국윤리학회, 도덕교육연구) 추가 검토 — 본 스킬은 Chicago Style 중심이므로 한국 학회 양식 별도 정리 가능 (차단 요인 아님, 선택 보강)
- [❌] *De Anima* III.9-11과 *Rhet.* I.10의 akrasia 관련 단락 세부 매핑 (현재는 권/장 단위만 표기 — 차단 요인 아님, 선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-03 | v1 | 최초 작성. 17개 클레임 검증 (16 VERIFIED, 1 UNVERIFIED). | skill-creator (Claude) |
| 2026-05-03 | v1 | 2단계 실사용 테스트 수행 (Q1 Bekker 표기법+국역본 위치 / Q2 철자+공통권 보완 / Q3 Irwin vs Crisp 비교) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-26 | v2 | 스킬 정리 — `humanities/aristotle-greek-text-tools` 병합: 원 §1 Perseus 접근 URL·Bekker URL 패턴·행 번호 한계, 원 §6 akrasia 핵심 어휘 분석을 SKILL.md §11로 원문 이관. status PENDING_TEST 전환 | 메인 세션 (스킬 정리) |
| 2026-09-26 | v2 | 2단계 실사용 테스트 수행 (Q1 §11 Perseus URL·행 번호 한계 / Q2 각주 오류+Bekker 대문자 오류 정정) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-26 | v2.1 | §7-1 NE VII 장 매핑을 Perseus canonical-greekLit Bywater 1894 XML 장 div·Bekker 표지로 원문 대조해 전면 정정(VII.7 = 1150a9–1150b28, VII.8 = 1150b29–1151a28, VII.9 = 1151a29–1152a5, VII.10 = 1152a6–36, VII.4 내용 propeteia/astheneia → 단적/부분적 akrasia 등 6건). akrasia-vs-akolasia 스킬 장 표기와 일치. status APPROVED → PENDING_TEST | 메인 세션 |
| 2026-09-26 | v2.1 | 2단계 실사용 재테스트 수행 (Q1 NE VII 장 전체 매핑·VII.7-VII.8 경계 / Q2 VII.4 정체성·propeteia-astheneia 소속 / Q3 VII.8 1150b29 확정 판단·판본별 표기 차이 대응) → 2/3 PASS + Perseus raw XML 직접 fetch로 장 경계 3건 확인. Q2에서 §7-1·§9(1150b19-28) vs §11-2(1150b19-22) 내부 불일치 신규 발견 → PENDING_TEST → **NEEDS_REVISION** 전환 (SKILL.md 수정은 사용자 승인 후 진행 예정) | skill-tester |
| 2026-09-26 | v2.2 | NEEDS_REVISION 해소: Perseus grc2 XML 원문 직접 대조 — "ἀκρασίας δὲ τὸ μὲν προπέτεια τὸ δʼ ἀσθένεια"가 [20] 표지 직전(≈1150b19), 두 유형 설명 b20-22, 성급 유형(ὀξεῖς·μελαγχολικοί) 설명 b25-28, VII.7 종료 b28(VII.8은 b29 "ἔστι δʼ ὁ μὲν ἀκόλαστος"). 두 값은 범위 차이였음 → §7-1·§9·§11-2를 "구분·정의 1150b19-22 / 논의 전체 1150b19-28"로 명시 통일. 다른 스킬의 1150b19-28 인용은 "논의 전체" 범위로 정합 확인. PENDING_TEST (재테스트 대기) | Claude (Opus 5.5) |
| 2026-09-26 | v2.2 | 4단계 재테스트 수행 (Q1 propeteia/astheneia 인용 범위 구분·정의 vs 논의 전체 / Q2 NE VII.7-VII.8 경계·비평본 기준·판본 차이 대응) → 2/2 PASS, v2.2 통일 정정이 정합적으로 작동함을 확인, NEEDS_REVISION 신규 gap 없이 해소 → PENDING_TEST → APPROVED 전환 | skill-tester |

---

## 9. 병합 이력 (2026-09-26)

| 항목 | 내용 |
|------|------|
| 원 스킬 | `humanities/aristotle-greek-text-tools` (제거 — LSJ·Logeion·Smyth·TLG·폰트·교재 안내는 모델 기본 지식, 비평본 정리는 본 스킬 §4와 중복) |
| 이관 범위 | 원 §1 Perseus NE 접근 URL 표·Bekker URL 패턴·행 번호 한계 주의 → §11-1 / 원 §6 akrasia 핵심 어휘 분석(음역 주의 포함) → §11-2 |
| 이관하지 않은 것 | 원 §9 워크플로우의 "강상진 외 역 (이제이북스, 정암학당)"·"천병희(2013)는 '무절제'로 옮김" 서술 — 본 스킬 §6(길 2011 표준판) 및 akolasia 구분과 충돌해 옮기지 않음 |
| 원 소스 | Perseus Digital Library (https://www.perseus.tufts.edu/), Library of Congress ALA-LC Romanization (https://www.loc.gov/catdir/cpso/romanization/greeka.pdf) |
| 이관 클레임 판정 (원 verification.md, 2026-05-03) | Perseus NE 그리스어 ID `1999.01.0054` — VERIFIED / Bekker URL 패턴 `:bekker+page%3D{PAGE}` — VERIFIED / Perseus NE 본문 = Bywater — VERIFIED(명시 약함 → `주의` 유지) / akrasia = ἀ- + κράτος — VERIFIED / propeteia·astheneia NE VII.7 1150b19-22 — VERIFIED / ALA-LC 음역 규칙 — VERIFIED |
| 상태 | §11 content test 2/2 PASS (2026-09-26) 완료. 이후 §7-1 장 매핑 정정으로 스킬 전체 status PENDING_TEST (§8 v2.1) → 3차 재테스트(2026-09-26)에서 §7-1·§9의 "1150b19-28"이 본 병합 이력의 원 VERIFIED 값 "1150b19-22"(위 행 참조)와 불일치함을 발견 → NEEDS_REVISION → 메인 세션이 Perseus grc2 XML 재대조로 "구분·정의 1150b19-22 / 논의 전체 1150b19-28"로 §7-1·§9·§11-2 통일(v2.2) → 4차 재테스트(2026-09-26, 2/2 PASS)로 정합성 확인 완료 — status **APPROVED** |
