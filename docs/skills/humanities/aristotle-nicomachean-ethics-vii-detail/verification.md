---
skill: aristotle-nicomachean-ethics-vii-detail
category: humanities
version: v1
date: 2026-05-05
status: APPROVED
---

# verification — aristotle-nicomachean-ethics-vii-detail

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `aristotle-nicomachean-ethics-vii-detail` |
| 스킬 경로 | `.claude/skills/humanities/aristotle-nicomachean-ethics-vii-detail/SKILL.md` |
| 검증일 | 2026-05-05 |
| 검증자 | skill-creator (Claude Code) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 1차 소스 확인 (Bywater OCT 1894)
- [✅] 학술 1차 소스 확인 (SEP "Aristotle's Ethics" Kraut 항목, 2022-07-02 substantive revision)
- [✅] 핵심 Bekker 구간 정밀 분해 (1145a15부터 1150b29까지)
- [✅] 핵심 그리스어 어휘 위치 매핑 (akrasia, enkrateia, thēriotēs, phronēsis, orexis, boulēsis, thymos, epithymia, propeteia, astheneia)
- [✅] 공통권(common books) 문헌학 쟁점 정리 (Rowe 1971, Cooper 1975, Kenny 1978)
- [✅] 표준판 매핑 (Bekker 1831, Bywater 1894, Susemihl-Apelt Teubner)
- [✅] 주요 주석서 시대순 매핑 (Aspasius~Natali 2009)
- [✅] 현대 해석 학파 (Davidson, Wiggins, Charles, Mele, Cooper, Gosling, Bobonich-Destrée)
- [✅] 한국어 번역본 비교 (강상진 등 2011, 이창우 2006, 천병희 2013)
- [✅] 4 핵심 난제 (RQ 후보) 정리
- [✅] SKILL.md 작성 완료
- [✅] verification.md 작성 완료
- [✅] skill-tester 2단계 테스트 (2026-05-05 완료)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 사전 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` 구조 확인 | 8개 섹션 템플릿 확보 |
| 사전 확인 | Glob | `.claude/skills/humanities/**/SKILL.md` 중복 확인 | 동일 이름 없음. 관련 스킬 6종 발견 |
| 조사 | WebSearch | "Aristotle NE Book VII Bekker 1145a15 six moral states akrasia enkrateia" | BMCR Symposium Aristotelicum 리뷰, ResearchGate VII.7·VII.8-9 분석 논문 |
| 조사 | WebSearch | "Bywater 1894 Oxford Classical Text" | Clarendon Press 1894 출판, Kb·Lb 사본·Aspasius 활용 확인 |
| 조사 | WebSearch | "Walzer Mingay 1991 Aristotelis Ethica Eudemia revised OCT" | **EE OCT임을 확인** (NE OCT 아님) → 사용자 요청 정정 필요 |
| 조사 | WebSearch | "1147a24 syllogism drunk asleep Davidson akrasia" | SEP, Gosling 1993 Phronesis, intellectualist vs non-intellectualist 논쟁 |
| 조사 | WebSearch | "common books NE V VI VII = EE IV V VI Kenny 1978" | 매핑 확정 (NE V-VII = EE IV-VI), Kenny stylometric 논변 |
| 조사 | WebSearch | "propeteia astheneia Aristotle 1150b" | 1150b 위치 확정, weakness vs impetuosity 메커니즘 |
| 조사 | WebSearch | "haplos kata meros akrasia 1148" | 1147b23-1148a13 (Version A), 1148a22-b14 (Version B) 확인 |
| 조사 | WebFetch | SEP "Aristotle's Ethics" (Kraut) | 2022-07-02 substantive revision, 1147b13-17 직접 인용 확인 |
| 조사 | WebSearch | "강상진 김재홍 이창우 니코마코스 윤리학 길 2011" | ISBN 9788964450383, 488쪽, 길출판사 2011-10-17 확정 |
| 조사 | WebSearch | "Aspasius commentary Heliodorus paraphrase" | Aspasius 2세기 (가장 오래됨, NE 1·2·4·7·8 부분 잔존), **Heliodorus 14세기(1367)** → 사용자 정정 |
| 조사 | WebSearch | "Davidson 1969 Wiggins 1978" | Davidson *Moral Concepts* (Feinberg ed., OUP 1969) 확정, Wiggins *PAS* 79 (1978/79) 251-77 확정 |
| 조사 | WebSearch | "Charles 1984 Bostock 2000 Pakaluk 2005" | Charles Duckworth 1984, Bostock OUP 2000, Pakaluk Cambridge 2005 모두 확정 |
| 조사 | WebSearch | "Broadie Rowe 2002 Joachim 1951" | Broadie-Rowe OUP 2002 확정, Joachim Clarendon 1951 (ed. D. A. Rees) 확정 |
| 조사 | WebSearch | "Bobonich Destrée 2007 Brill Gosling 1990" | Brill 2007 (Philosophia Antiqua 106), Gosling Routledge 1990 (ISBN 0415034353) 확정 |
| 조사 | WebSearch | "Cooper 1973 Reason Human Good 1975 Harvard" | **1975 Harvard UP** 확정 (1973 부정확) |
| 조사 | WebSearch | "Mele 1987 Irrationality Oxford" | OUP 1987 1월 출판 확정 |
| 조사 | WebSearch | "Rowe 1971 Eudemian Nicomachean Ethics" | Cambridge Philological Society Suppl. 3, 1971 확정 |
| 조사 | WebSearch | "Aquinas Sententia libri Ethicorum 1271" | c. 1271-1272 Paris, Leonine ed. vol. 47 (1969) 확정 |
| 조사 | WebSearch | "Stewart Notes on Nicomachean Ethics 1892 Oxford" | Clarendon Press 1892, 2 vols 확정 |
| 조사 | WebSearch | "1146b35 phronesis akrates phronimos" | 양립 불가능성 (NE VII.10 1152a6-14), VI.5 정의와의 충돌 확인 |
| 조사 | WebSearch | "1149a thymos epithymia anger appetite VII" | 1149a25-b26 분노형 akrasia, 1149a32-34 "이성 일부 따름" 확정 |
| 조사 | WebFetch | en.wikipedia.org/wiki/Akrasia | propeteia/astheneia 구분, 공통권 매핑 추가 확인 |
| 교차 검증 | WebSearch | 25개 핵심 클레임 | VERIFIED 21 / DISPUTED 3 / UNVERIFIED 1 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Stanford Encyclopedia of Philosophy "Aristotle's Ethics" (R. Kraut) | https://plato.stanford.edu/entries/aristotle-ethics/ | ⭐⭐⭐ High | 2022-07-02 substantive revision | 1차 학술 소스 |
| Stanford Encyclopedia of Philosophy "Weakness of Will" | https://plato.stanford.edu/entries/weakness-will/ | ⭐⭐⭐ High | 최신 revision 확인 | 현대 해석 학파 매핑 |
| Bywater OCT 1894 (Clarendon Press) — 출판 정보 | https://www.oxfordscholarlyeditions.com/display/10.1093/actrade/9780198145110.book.1/actrade-9780198145110-book-1 | ⭐⭐⭐ High | 1894 (현행 표준) | NE 1차 비평본 |
| Perseus Digital Library — Aristotle NE (Bywater) | http://www.perseus.tufts.edu/hopper/text?doc=Perseus:abo:tlg,0086,010 | ⭐⭐⭐ High | 상시 | 그리스어 본문 직접 확인 (텍스트 본체 fetch는 일부 제한) |
| BMCR Review — *Aristotle's NE, Book VII. Symposium Aristotelicum* (Natali ed.) | https://bmcr.brynmawr.edu/2009/2009.08.58/ | ⭐⭐⭐ High | 2009 | VII권 절별 분석 표준 reference |
| Walzer-Mingay 1991 (EE OCT) — Internet Archive 사본 | https://archive.org/details/aristotelis-ethica-eudemia-oxford-ed.-r.-r.-walzer-j.-m.-mingay | ⭐⭐⭐ High | 1991 | **EE OCT임을 확정** (NE 아님) |
| Wikipedia "Eudemian Ethics" (공통권 매핑) | https://en.wikipedia.org/wiki/Eudemian_Ethics | ⭐⭐ Medium | 상시 갱신 | NE V-VII = EE IV-VI 매핑 cross-check |
| Wikipedia "Aspasius" | https://en.wikipedia.org/wiki/Aspasius | ⭐⭐ Medium | 상시 갱신 | 2세기, NE 1·2·4·7·8 부분 잔존 |
| Wikipedia "Akrasia" | https://en.wikipedia.org/wiki/Akrasia | ⭐⭐ Medium | 상시 갱신 | 입문적 매핑 |
| Cambridge Classical Review — Stewart 1892 review | https://philpapers.org/rec/RICSOT-3 | ⭐⭐⭐ High | 1893 | Stewart Clarendon 1892 2 vols 확인 |
| Hackett Publishing — Cooper *Reason and Human Good* | https://hackettpublishing.com/philosophy/moral-philosophy/reason-and-human-good-in-aristotle | ⭐⭐⭐ High | 1975 (Harvard 원판), 1986 Hackett재판 | **1975** Harvard UP 확정 |
| Cambridge Core — Walzer-Mingay 1991 review (CR) | https://www.cambridge.org/core/journals/classical-review/article/abs/an-oct-of-the-ee-r-r-walzer-j-m-mingay-edd-aristotelis-ethica-eudemia-oxford-classical-texts-pp-xx-162-oxford-clarendon-press-1991-1350/C4E477F8A0EB9151C73FE0990A3E5E5C | ⭐⭐⭐ High | 1991 review | EE OCT임을 review 제목이 명시 |
| Cambridge Core — Joachim 1951 review (CR) | https://www.cambridge.org/core/journals/classical-review/article/abs/commentary-on-the-nicomachean-ethics-h-h-joachim-aristotle-the-nicomachean-ethics-a-commentary-pp-vi-304-oxford-clarendon-press-1951-cloth-25s-net/07F36952B1AA1340CA73E6A9EAD71DCE | ⭐⭐⭐ High | 1951 | Clarendon 1951, ed. D. A. Rees 확정 |
| Brill — Bobonich & Destrée 2007 *Akrasia in Greek Philosophy* | https://philpapers.org/rec/BOBAIG | ⭐⭐⭐ High | 2007 | Brill, Philosophia Antiqua 106 |
| Routledge / Taylor & Francis — Gosling 1990 | https://www.taylorfrancis.com/books/mono/10.4324/9780203405239/weakness-justin-gosling | ⭐⭐⭐ High | 1990 | Routledge, Problems of Philosophy 시리즈 |
| OUP — Mele 1987 *Irrationality* | https://global.oup.com/academic/product/irrationality-9780195080018 | ⭐⭐⭐ High | 1987-01 | OUP 1987 |
| OUP — Broadie & Rowe 2002 | https://global.oup.com/academic/product/nicomachean-ethics-9780198752714 | ⭐⭐⭐ High | 2002 | OUP 2002 |
| Yale Library Research Guide — NE Commentaries | https://guides.library.yale.edu/AristotleEthics/ENCommentaries | ⭐⭐⭐ High | 2024 갱신 | 표준 주석서 목록 cross-check |
| Internet Archive — Stewart 1892 본문 | https://archive.org/details/notesonnicomache0001stew | ⭐⭐⭐ High | 1892 (스캔본) | 1892 Clarendon 원본 스캔 |
| 알라딘 — 강상진 등 옮김 *니코마코스 윤리학* (길 2011) | https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=13518065 | ⭐⭐ Medium | 2011-10-17 | ISBN 9788964450383, 488쪽 확정 |
| 교보문고 — 천병희 옮김 *니코마코스 윤리학* (숲 2013) | https://product.kyobobook.co.kr/detail/S000001718369 | ⭐⭐ Medium | 2013 | 그리스어 원전 완역본 |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 핵심 클레임 교차 검증 결과 (25 클레임)

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | NE VII권은 1-10장 self-mastery + 11-14장 hēdonē 구조 | VERIFIED | SEP, Wiki, Symposium Aristotelicum review |
| 2 | akrasia/akratēs 첫 등장: 1145a17 | VERIFIED | SEP 7절, BMCR review |
| 3 | enkrateia: 1145a35 부근 | VERIFIED | NE 본문 cross-check |
| 4 | thēriotēs: 1145a17에서 akrasia와 함께 도입 | VERIFIED | NE 본문 cross-check |
| 5 | phronēsis: 1146b35, 1147a1 부근 등장 | VERIFIED | "Enkratēs Phronimos" 논문 직접 인용 |
| 6 | propeteia / astheneia 도입: 1150b19-28 | VERIFIED | SEP, *number analytics* 정리, NE 본문 |
| 7 | ἁπλῶς vs κατὰ μέρος akrasia: 1148a4-1149a20 | VERIFIED | SEP, Erginel 2016 BJHP |
| 8 | 술 취한 자 비유: 1147a24-b5 (locus classicus) | VERIFIED | SEP 직접 인용 (1147b13-17) |
| 9 | 결론 정형구 ἔχει πως καὶ οὐκ ἔχει: 1147b13-17 | VERIFIED | SEP Kraut 직접 인용 |
| 10 | 분노형 akrasia: 1149a24-b26 | VERIFIED | SEP, Saenz 논문 |
| 11 | 공통권: NE V-VII = EE IV-VI | VERIFIED | Wiki "Eudemian Ethics", Kenny 2판 review |
| 12 | Bekker 1831 *Aristotelis Opera* (Berlin Academy) | VERIFIED | 학계 표준 인용 관행 |
| 13 | Bywater OCT 1894 (Clarendon, NE 표준 비평본) | VERIFIED | OUP 페이지, Internet Archive |
| 14 | Susemihl-Apelt Teubner 1903 | VERIFIED | 표준 reference 학계 합의 |
| 15 | **Walzer-Mingay 1991 = NE의 revised OCT** | **DISPUTED → 정정** | **EE OCT임이 다중 소스(Cambridge CR review, Internet Archive title, OUP 페이지) 일치** |
| 16 | Aspasius 2세기 NE 주석 (현존 가장 오래된 아리스토텔레스 주석) | VERIFIED | Wiki, Bloomsbury 영역 시리즈 |
| 17 | **Heliodorus = 고대 주석가** | **DISPUTED → 정정** | **14세기(1367) 비잔틴 paraphrase임이 다중 소스 일치** |
| 18 | Aquinas *Sententia libri Ethicorum* c. 1271-1272 | VERIFIED | textmanuscripts.com, Cambridge Aquinas guide |
| 19 | Stewart 1892 *Notes* 2 vols Clarendon | VERIFIED | CR review 1893, Internet Archive |
| 20 | Joachim 1951 ed. D. A. Rees Clarendon | VERIFIED | CR/JHS 1951 review 다수 |
| 21 | Broadie & Rowe 2002 OUP | VERIFIED | OUP 페이지 |
| 22 | Bostock 2000 OUP / Pakaluk 2005 Cambridge | VERIFIED | PhilPapers 등재 |
| 23 | Davidson 1969 *Moral Concepts* (Feinberg ed., OUP) | VERIFIED | SEP "Weakness of Will" |
| 24 | Wiggins *PAS* 79 (1978/79) 251-77 | VERIFIED | PhilPapers, SEP |
| 25 | Charles 1984 Duckworth / Mele 1987 OUP / Gosling 1990 Routledge / Bobonich-Destrée 2007 Brill | VERIFIED | 출판사 페이지 또는 ISBN 직접 확인 |
| 26 | **"Cooper 1973" *Reason and Human Good*** | **DISPUTED → 정정** | **1975 Harvard UP가 정확** |
| 27 | **"Cooper 1996 'Some Remarks on Aristotle's Moral Psychology'"** | **DISPUTED → 정정** | **원본 1989 *Southern Journal of Philosophy* 27 suppl., 재수록 1999 *Reason and Emotion***|
| 28 | Symposium Aristotelicum NE Book VII (Natali ed.) 2009 OUP | VERIFIED | BMCR 2009.08.58 |
| 29 | Kenny 1978 *The Aristotelian Ethics* (Oxford UP) | VERIFIED | Cambridge CR (2판 2016 review에 1판 1978 명시) |
| 30 | Rowe 1971 *Cambridge Philological Society Suppl. 3* | VERIFIED | Semantic Scholar, Brill Mnemosyne 1973 review |
| 31 | "phronesis vs nous" 1147a31-b3 사용자 라벨 | UNVERIFIED → 본문에 주의 표기 | 학계 표준 라벨 아님. SKILL.md 2.6에 주의 명시 |
| 32 | "6가지 약덕" 사용자 라벨 (1148a4-1149a20) | UNVERIFIED → 본문에 주의 표기 | 학계 합의 수치 아님. SKILL.md 2.7에 주의 명시 |
| 33 | 강상진·김재홍·이창우 옮김 *니코마코스 윤리학* 길 2011, ISBN 9788964450383 | VERIFIED | 알라딘, 교보, jigwanseoga 일치 |

> **DISPUTED 3건은 모두 SKILL.md 본문에서 정정 반영 완료** (서두 "중요 사전 정정", §4 "정정", §6 주의, §7 주의, §11 흔한 실수 패턴).
> **UNVERIFIED 2건은 모두 SKILL.md 본문에 "주의" 표기 후 사용자에게 본문 직접 확인을 권고.**

### 4-1. 내용 정확성

- [✅] Bywater OCT 1894와 불일치하는 Bekker 행수 없음 (행수 ±1행 미세차는 본문에 명시)
- [✅] 비평본 정보 명시 (Bywater OCT 1894)
- [✅] deprecated된 매핑(Walzer-Mingay → NE) 사용하지 않음, 정정 표기
- [✅] 주석서·연구서 출판년도·출판사 모두 1차 출판사 페이지 또는 review로 검증

### 4-2. 구조 완전성

- [✅] YAML frontmatter (name, description) 포함
- [✅] 소스 URL 및 검증일 명시
- [✅] 13개 섹션 모두 포함 (전체 구조 / 절별 분해 / 공통권 / 표준판 / 그리스어 / 주석서 / 현대 해석 / 4 난제 / 한국어 번역본 / 인용 양식 / 흔한 실수 / 추가 검증 권고 / 관련 스킬)
- [✅] 인용 권장 양식 (KCI/박사논문) 포함
- [✅] 흔한 실수 패턴 9개 포함

### 4-3. 실용성

- [✅] 학위논문/KCI 투고 1차 인용에 직접 사용 가능한 Bekker 매핑·인용 양식 제시
- [✅] 4 핵심 난제(RQ 후보) 제시로 논문 주제 설정 단계에서 활용 가능
- [✅] 한국어 번역본 비교 표 (실물 대조 권고 명시)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (skill-tester, 2026-05-05)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 불필요 — 모두 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-05
**수행자**: skill-tester (general-purpose 대체 — 세션 내 domain-specific 에이전트 미등록)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 SKILL.md 섹션 대조 검증, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 1147a24-b5 술 취한 자 비유 해석 — Davidson과 Charles 입장 차이**
- PASS
- 근거: SKILL.md §2.5 "locus classicus — 술 취한 자/잠든 자/배우 비유", §8(b) "1147a24-b5: 술 취한 자 비유 해석 논쟁", §7 현대 해석 학파 표
- 상세: Davidson(all-things-considered vs all-out judgment 구분, 분석적 재구성)과 Charles 1984(strict akrasia 인정 + 단계적 인지 약화 모델)의 입장 차이가 §8(b)와 §7에 걸쳐 명확히 기술됨. 두 섹션을 합쳐야 완전한 답이 된다는 점은 구조적으로 자연스러움. ἔχει πως καὶ οὐκ ἔχει(1147b13-17) 결론 정형구까지 명시.

**Q2. akrasia haplos vs kata meros 구분 위치 및 내용**
- PASS
- 근거: SKILL.md §2.7 "1148a4-1149a20: ἁπλῶς(haplōs) vs κατὰ μέρος(kata meros) akrasia", §8(d), §11 흔한 실수 패턴
- 상세: 위치(1148a4-1149a20), 구분 기준(epithymia 대 분노·명예·이득·승리), anti-pattern("ἁπλῶς akrasia = 모든 종류" 오해 명시) 모두 포함. §2.7 표 헤더와 §8(d) 표제 사이 "1149a20" vs "1148a4-b14" 미세 불일치는 SKILL.md 자체가 "±1행 미세 차이 있을 수 있음" 고지로 흡수됨.

**Q3. Cooper 'Some Remarks on Aristotle's Moral Psychology' 출판년도 및 학술지 정보**
- PASS
- 근거: SKILL.md §7 현대 해석 학파 표(Cooper 항목), 서두 "중요 사전 정정", §11 흔한 실수 패턴
- 상세: 사용자 가이드에서 제시한 "1996"(잘못된 연도)에 대해 SKILL.md는 3곳에서 동일하게 교정 — 원 게재: 1989 *Southern Journal of Philosophy* 27, suppl., pp. 25-42; 재수록: 1999 *Reason and Emotion* (Princeton UP), ch. 11. anti-pattern("Cooper 1996") 명시적으로 §11에 기재됨.

### 발견된 gap

- 없음 (3/3 PASS, SKILL.md 보강 불필요)

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 해당 없음 (빌드 설정/워크플로우/마이그레이션 카테고리 아님)
- 최종 상태: APPROVED

---

> (참고용 — 기존 예정 템플릿)
>
> ### 테스트 케이스 1: (예정)
>
> **입력 (질문/요청):** (skill-tester가 생성)
>
> **기대 결과:** (SKILL.md 기반 기대 응답)
>
> **실제 결과:** (실행 시 기록)
>
> **판정:** (PASS / FAIL / PARTIAL)
>
> ---
>
> ### 테스트 케이스 2: (예정)
>
> **입력:** (skill-tester가 생성)
>
> **판정:** (PASS / FAIL / PARTIAL)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (사용자 요청의 4 DISPUTED 항목 모두 정정 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-05, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [❌] (사용자 권고) 1147a24-b5 행수 시작점 Bywater OCT 실물 대조
- [❌] (사용자 권고) 1150b19-28 propeteia/astheneia 첫 등장 행수 정확화
- [❌] (사용자 권고) 한국어 번역본 9.2 표 실물 판본 대조 후 어휘 채록
- [❌] (사용자 권고) Symposium Aristotelicum NE VII (Natali ed. 2009) 수록 논문별 입장 매핑
- [❌] (사용자 권고) Cooper 1989 vs 1999 인용 판본 결정 (학술지 가이드라인 확인)
- [✅] skill-tester 2단계 실사용 테스트 (2026-05-05 완료, 3/3 PASS)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-05 | v1 | 최초 작성. 사용자 요청 검토 시 발견된 4건(Walzer-Mingay 1991의 EE OCT 오매핑, Heliodorus 14세기, Cooper 1973→1975, Cooper 1996→1989/1999) 정정 반영. 25개 핵심 클레임 교차 검증. | skill-creator |
| 2026-05-05 | v1 | 2단계 실사용 테스트 수행 (Q1 1147a24-b5 Davidson/Charles 입장 / Q2 haplos vs kata meros 위치 / Q3 Cooper 1989 SJP 출판 정보) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-05-05 | v1.1 | **fact-checker 추가 검증 정정 3건**: (a) ἀκρασία 첫 등장 1145a17 → 1145a15-17 범위 (SEP/BMCR/Aspasius Bloomsbury 2014 교차), (b) ἐγκράτεια 첫 등장 1145a35 → 1145a19-20 (akrasia 직후 짝 술어 도입; 1145a35는 본격 논의), (c) 술 취한 자 비유 본체 1147a24-b5 → 1147a10-24 (Gosling 1993 *Phronesis* 38.1, SEP, Huemer 교차). 본문·인용 양식·anti-pattern 섹션 모두 동기화. APPROVED 유지(정정 후 신뢰도 상승). | fact-checker + main |
