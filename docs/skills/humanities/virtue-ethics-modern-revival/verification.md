---
skill: virtue-ethics-modern-revival
category: humanities
version: v1
date: 2026-05-03
status: APPROVED
---

# virtue-ethics-modern-revival 검증 문서

> 현대 덕윤리(Virtue Ethics) 부흥 스킬의 작성·검증 기록

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `virtue-ethics-modern-revival` |
| 스킬 경로 | `.claude/skills/humanities/virtue-ethics-modern-revival/SKILL.md` |
| 검증일 | 2026-05-03 |
| 검증자 | skill-creator (Opus 4.7) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] SEP "Virtue Ethics" (plato.stanford.edu/entries/ethics-virtue/) WebFetch 수행
- [✅] Anscombe 1958 *Philosophy* 33(124), pp.1-19 게재 검증
- [✅] MacIntyre *After Virtue* 1/2/3판 출판 연도 검증 (Notre Dame UP)
- [✅] Foot *Natural Goodness* 2001 출판사·ISBN 검증 (Oxford UP)
- [✅] Hursthouse *On Virtue Ethics* 1999 (Oxford UP) 검증 + akrasia/continence 분석 확인
- [✅] Slote *Morals from Motives* 2001 (Oxford UP) + *Ethics of Care and Empathy* 2007 (Routledge) 검증
- [✅] Annas *Intelligent Virtue* 2011 (Oxford UP) 검증, skill model 핵심 확인
- [✅] Nussbaum *Fragility of Goodness* 1986/2001 개정판 (Cambridge UP) 검증 + Capability Approach 연결
- [✅] Swanton *Virtue Ethics: A Pluralistic View* 2003 (Oxford UP) 검증
- [✅] MacIntyre practice/internal goods/external goods 핵심 정의 검증
- [✅] 한국 학자 KCI 검색 (황경식, 강상진)
- [✅] SKILL.md 작성 (`.claude/skills/humanities/virtue-ethics-modern-revival/SKILL.md`)
- [✅] verification.md 작성 (본 문서)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | VERIFICATION_TEMPLATE.md | 8개 섹션 구조 확인 |
| 1차 조사 | WebFetch | plato.stanford.edu/entries/ethics-virtue/ | Anscombe·MacIntyre·Foot·Hursthouse·Slote·Annas·Swanton 서지 + akrasia/continence 구분 확인 |
| 1차 조사 | WebSearch | "Anscombe Modern Moral Philosophy 1958 Philosophy vol 33" | *Philosophy* 33(124), Jan 1958, pp.1-19 / Cambridge Core / 'consequentialism' 신조어 확인 |
| 교차 검증 | WebSearch | "MacIntyre After Virtue Notre Dame 1981 1984 2007" | 1판 1981, 2판 1984(Postscript), 3판 2007(Prologue) 확인 |
| 교차 검증 | WebSearch | "Foot Natural Goodness Oxford 2001 ISBN" | OUP 2001-05-10, ISBN-13 9780198235088, 136pp |
| 교차 검증 | WebSearch | "Hursthouse On Virtue Ethics 1999 v-rules naturalism" | OUP 1999, x+275pp / continence vs full virtue 구분 / phronesis 결여 논의 |
| 교차 검증 | WebSearch | "Slote Morals from Motives Oxford 2001 agent-based" | OUP 2001 / agent-based virtue ethics / Hume·Hutcheson sentimentalism |
| 교차 검증 | WebSearch | "Slote Ethics of Care and Empathy Routledge 2007" | Routledge 2007, 133pp / Hoffman 공감 연구 인용 |
| 교차 검증 | WebSearch | "Annas Intelligent Virtue Oxford 2011 skill model" | OUP 2011, 189pp / 'need to learn' + 'drive to aspire' / skill 비유 |
| 교차 검증 | WebSearch | "Nussbaum Fragility of Goodness Cambridge 1986 revised 2001" | Cambridge UP 1986, xviii+544pp / 2001 개정판 본문 변경 없음 + 새 서문 |
| 교차 검증 | WebSearch | "Swanton Virtue Ethics Pluralistic View Oxford 2003" | OUP 2003-03-20, 312pp, ISBN 0-19-925388-9 / modes of moral response |
| 교차 검증 | WebSearch | "Nussbaum Capability Approach Aristotelian virtue ethics" | "Non-Relative Virtues" 1993 *Quality of Life* / 아리스토텔레스 기능 개념 차용 |
| 교차 검증 | WebSearch | "MacIntyre After Virtue practice internal external goods" | 14장 정의 인용 확인 |
| 교차 검증 | WebSearch | "황경식 덕윤리 KCI" | "덕 윤리의 현대적 의의" *인간·환경·미래* 5호 (2010), pp.3-22 / 아카넷 단행본 2012, 2015 |
| 교차 검증 | WebSearch | "강상진 아리스토텔레스 덕윤리 KCI" | "아리스토텔레스의 덕론" *가톨릭철학* 9호 (2007), pp.11-39 |
| 작성 | Write | SKILL.md (13개 섹션) | 1차 작성 → skill-md-guard 차단 → `> 소스:` 형식 수정 후 통과 |
| 작성 | Write | verification.md (본 문서) | 8개 섹션 작성 |

> **사용 도구 요약**: Read 1회, WebFetch 1회, WebSearch 11회, Write 2회, Edit 1회. 모든 정보는 WebSearch/WebFetch 1차 소스 기반.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| SEP "Virtue Ethics" | https://plato.stanford.edu/entries/ethics-virtue/ | ⭐⭐⭐ High | 2026-05-03 | 1순위 공식 백과 |
| Cambridge Core — *Philosophy* 33 | https://www.cambridge.org/core/journals/philosophy/article/modern-moral-philosophy1/9E56836F22C34BE2CE4A3E763691C2FB | ⭐⭐⭐ High | 2026-05-03 | Anscombe 1958 원문 게재지 |
| Wikipedia "Modern Moral Philosophy" | https://en.wikipedia.org/wiki/Modern_Moral_Philosophy | ⭐⭐ Medium | 2026-05-03 | 보조 (Cambridge Core와 교차 일치) |
| University of Notre Dame Press — *After Virtue* | https://undpress.nd.edu/9780268035044/after-virtue/ | ⭐⭐⭐ High | 2026-05-03 | 출판사 공식 |
| Wikipedia *After Virtue* | https://en.wikipedia.org/wiki/After_Virtue | ⭐⭐ Medium | 2026-05-03 | 판본 연도 보조 확인 |
| Oxford Academic — *Natural Goodness* | https://academic.oup.com/book/10657 | ⭐⭐⭐ High | 2026-05-03 | OUP 공식 |
| Oxford UP — *Natural Goodness* product page | https://global.oup.com/academic/product/natural-goodness-9780199265473 | ⭐⭐⭐ High | 2026-05-03 | OUP 공식 |
| PhilPapers — Hursthouse *On Virtue Ethics* | https://philpapers.org/rec/HUROVE | ⭐⭐⭐ High | 2026-05-03 | PhilPapers 서지 |
| Oxford UP — *On Virtue Ethics* | https://global.oup.com/academic/product/on-virtue-ethics-9780199247998 | ⭐⭐⭐ High | 2026-05-03 | OUP 공식 |
| Oxford Academic — *Morals from Motives* | https://academic.oup.com/book/7808/chapter/152986801 | ⭐⭐⭐ High | 2026-05-03 | Agent-Based Virtue Ethics 챕터 |
| OUP — *Morals from Motives* product | https://global.oup.com/academic/product/morals-from-motives-9780195170207 | ⭐⭐⭐ High | 2026-05-03 | OUP 공식 |
| Routledge — *The Ethics of Care and Empathy* | https://www.routledge.com/The-Ethics-of-Care-and-Empathy/Slote/p/book/9780415772013 | ⭐⭐⭐ High | 2026-05-03 | Routledge 공식 |
| Oxford Academic — *Intelligent Virtue* | https://academic.oup.com/book/3286 | ⭐⭐⭐ High | 2026-05-03 | OUP 공식 |
| OUP — *Intelligent Virtue* product | https://global.oup.com/academic/product/intelligent-virtue-9780199228775 | ⭐⭐⭐ High | 2026-05-03 | OUP 공식 |
| Cambridge Core — *Fragility of Goodness* | https://www.cambridge.org/core/books/fragility-of-goodness/B212012979833A828690B9CA907A87BF | ⭐⭐⭐ High | 2026-05-03 | Cambridge UP 공식 |
| BMCR Review — *Fragility of Goodness* revised ed. | https://bmcr.brynmawr.edu/2002/2002.10.06/ | ⭐⭐ Medium | 2026-05-03 | 2001 개정판 정보 보조 |
| Oxford Academic — *Virtue Ethics: A Pluralistic View* | https://academic.oup.com/book/2669 | ⭐⭐⭐ High | 2026-05-03 | OUP 공식 |
| NDPR Review — Swanton *Virtue Ethics* | https://ndpr.nd.edu/reviews/virtue-ethics-a-pluralistic-view-oxford/ | ⭐⭐⭐ High | 2026-05-03 | Notre Dame Philosophical Reviews |
| Oxford Academic — *Quality of Life* (Nussbaum 챕터) | https://academic.oup.com/book/9949/chapter/157307006 | ⭐⭐⭐ High | 2026-05-03 | "Non-Relative Virtues" |
| IEP — MacIntyre Political Philosophy | https://iep.utm.edu/p-macint/ | ⭐⭐⭐ High | 2026-05-03 | practice/internal goods 정의 보조 |
| KCI — "덕 윤리의 현대적 의의" (황경식, 2010) | https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001629812 | ⭐⭐⭐ High | 2026-05-03 | KCI 등재 서지 |
| KCI — "아리스토텔레스의 덕론" (강상진, 2007) | https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001052539 | ⭐⭐⭐ High | 2026-05-03 | KCI 등재 서지 |
| KCI — "덕 윤리, 유교 윤리 그리고 도덕 교육" | https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002110639 | ⭐⭐ Medium | 2026-05-03 | 보조 KCI 서지 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 클레임별 교차 검증 결과

| # | 핵심 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|------------|----------|----------|------|
| 1 | Anscombe "Modern Moral Philosophy" *Philosophy* 33(124), 1958, pp.1-19 | SEP | Cambridge Core / abebooks 1st ed. / Wikipedia | VERIFIED |
| 2 | Anscombe 논문이 'consequentialism' 신조어 도입 | Wikipedia | 1000-Word Philosophy 해설 | VERIFIED |
| 3 | MacIntyre *After Virtue* Notre Dame UP, 1981 1판 / 1984 2판(Postscript) / 2007 3판(Prologue) | Notre Dame Press 공식 | Wikipedia / Figshare(Notre Dame) | VERIFIED |
| 4 | MacIntyre practice/internal goods/external goods 정의 (3판 14장) | IEP | Frontiers / driverlesscrocodile / The Metasophist 요약 | VERIFIED |
| 5 | Foot *Natural Goodness* OUP 2001, ISBN-13 9780198235088, 136pp | OUP global.oup.com | Oxford Academic / PhilPapers | VERIFIED |
| 6 | Hursthouse *On Virtue Ethics* OUP 1999, x+275pp | PhilPapers | OUP global / Marquette Review PDF | VERIFIED |
| 7 | Hursthouse: full virtue vs continence 구분, phronesis 결여 논의 | SEP | Marquette Review / Atlas of Public Management | VERIFIED |
| 8 | Slote *Morals from Motives* OUP 2001, agent-based virtue ethics, sentimentalism | OUP global | NDPR / Oxford Academic 챕터 / Wikipedia Slote 항목 | VERIFIED |
| 9 | Slote *Ethics of Care and Empathy* Routledge 2007, 133pp, Hoffman 공감 인용 | Routledge 공식 | NDPR / Hypatia Cambridge Core 리뷰 | VERIFIED |
| 10 | Annas *Intelligent Virtue* OUP 2011, 189pp, skill model | Oxford Academic | NDPR / Ethics 저널 리뷰 (Univ. of Chicago) | VERIFIED |
| 11 | Annas: 'need to learn' + 'drive to aspire' 표현 | Oxford Academic 본문 | Wordpress 리뷰 / ResearchGate PDF | VERIFIED |
| 12 | Nussbaum *Fragility of Goodness* Cambridge UP 1986, xviii+544pp | Cambridge UP 공식 | Canadian J. Philosophy 리뷰 | VERIFIED |
| 13 | *Fragility of Goodness* 2001 개정판 — 본문 변경 없음, 새 서문 추가 | BMCR Review | Wikipedia | VERIFIED |
| 14 | Nussbaum 역량 접근법이 아리스토텔레스에서 영감 | "Non-Relative Virtues" Oxford Academic 챕터 | IEP Global Ethics: Capability / Springer 논문 | VERIFIED |
| 15 | Swanton *Virtue Ethics: A Pluralistic View* OUP 2003, 312pp, ISBN 0-19-925388-9 | Cambridge Core(Kantian Review) 서지 | Oxford Academic / NDPR | VERIFIED |
| 16 | Swanton: virtue profile = plurality of functions/modes/targets | NDPR | Oxford Academic Conclusion 챕터 | VERIFIED |
| 17 | 황경식 "덕 윤리의 현대적 의의" *인간·환경·미래* 5호 (2010), pp.3-22 | KCI | DBpia | VERIFIED |
| 18 | 황경식 『덕윤리의 현대적 의의』 아카넷 2012 단행본 | DBpia 리뷰 인용 | 검색 결과 메타데이터 | VERIFIED (도서 메타데이터 기준) |
| 19 | 강상진 "아리스토텔레스의 덕론" *가톨릭철학* 9호 (2007), pp.11-39 | KCI | 검색 결과 | VERIFIED |

> 모든 핵심 클레임 19개가 VERIFIED 상태. DISPUTED·UNVERIFIED 항목 없음.

### 4-2. 내용 정확성

- [✅] SEP 및 출판사 공식 페이지와 불일치하는 내용 없음
- [✅] 출판 연도·판본·출판사·페이지 분량 명시
- [✅] deprecated된 내용 없음 (역사적 학술 자료이므로 deprecated 개념 비적용)
- [✅] 학파 우열 단정 회피 (§0, §11에서 명시)

### 4-3. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (`> 소스:`, `> 검증일: 2026-05-03`)
- [✅] 핵심 개념 설명 포함 (Anscombe→MacIntyre→Foot→Hursthouse→Slote→Annas→Nussbaum→Swanton)
- [✅] akrasia 연결 섹션 (§9) 포함
- [✅] 한국 학계 수용 (§10) 포함
- [✅] 흔한 실수 패턴 (§12) 포함

### 4-4. 실용성

- [✅] 도덕윤리교육 대학원생이 학위논문에 인용할 서지 정보 제공
- [✅] akrasia 논문 위치 잡기를 위한 §9·§11 활용 흐름 제시
- [✅] 학파 우열 단정 없이 비교 검토 자료로 사용 가능

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-03, skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (Q1·Q2 PASS, Q3 PARTIAL)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 기록 → 선택 보강 권고로 분류)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-03
**수행자**: skill-tester (general-purpose 대체 — domain-specific 인문학 에이전트 미존재)
**수행 방법**: SKILL.md 전체 Read 후 대학원 도덕윤리교육 전공생 관점 실전 질문 3개 수행, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Anscombe 1958 "Modern Moral Philosophy"가 현대 덕윤리 부흥 기점인 이유와 학위논문 인용 형식은?**
- PASS
- 근거: SKILL.md §1 표(게재지: *Philosophy* 33(124), Jan 1958, pp.1-19 / Royal Institute of Philosophy / CUP), §1 핵심주장 1-4 (의무론·결과론 비판, 도덕적 shall 무용론, 심리철학 권유, consequentialism 신조어 도입), §1 의의("현대 덕윤리 부흥의 기점 — SEP 명시"), §12 anti-pattern 1행("덕윤리 선언문으로만 기술" 금지)
- 상세: 인용 형식 필수 정보(저자·논문명·게재지·권호·연도·페이지) 전부 §1 표에 존재. consequentialism 신조어 도입 + "현재 통용 의미와 다소 차이" 주의 표기까지 있어 정확. anti-pattern(단순 덕윤리 선언문으로 오독) 회피 경고도 §12에 명확히 기술. 단, Chicago/APA 등 구체적 인용 스타일 예시는 없음(§13 주석에서 직접 확인 권고로 설계 의도로 간주).

**Q2. Hursthouse가 *On Virtue Ethics*에서 akrasia를 어떻게 다루는가?**
- PASS
- 근거: SKILL.md §4 "akrasia 관련 (§9 연결)" (full virtue vs continence 구분, phronesis 결여), §9-1 신아리스토텔레스주의 입장(akrasia = 미덕 발달 연속체 위 위치, continence vs akrasia 방향 차이), §9-3 비대칭성(욕구 통제 방향 vs 굴복 방향, phronesis·욕구 정렬 차이), §12 anti-pattern 3행(v-rules를 단순 규칙주의로 비판 금지)
- 상세: Hursthouse 핵심 입장 세 층위(full virtue / continence / akrasia 연속체, phronesis 결여 설명, 비대칭성)가 모두 SKILL.md에 명확한 근거로 존재. v-rules anti-pattern도 §12에서 경고. 마이너 gap: Hursthouse *On Virtue Ethics* 본문의 구체적 챕터/장 번호 정보 없음(차단 요인 아님, 선택 보강 권고).

**Q3. MacIntyre *After Virtue* 1판 vs 3판의 차이를 학위논문에서 어떻게 표기하나?**
- PARTIAL
- 근거: SKILL.md §2 표(1판 1981 / 2판 1984 Postscript 추가 / 3판 2007 Prologue "After Virtue after a Quarter of a Century" 추가), §2 핵심주장 3 "(3판 기준 14장)" 명시, §13 참조표(1981/1984/2007)
- 상세: 판본별 연도·추가 텍스트 종류는 명확히 존재. 그러나 (a) 1판 vs 3판의 본문 내용 실질적 변경 범위(본문 수정 여부 vs Prologue 추가만인지)가 명시되지 않음 — Nussbaum §7에서 "본문 변경 없이 새 서문"을 명시한 것과 대비. (b) 학위논문 인용 시 판본 표기 형식 예시(예: "3rd ed.", "제3판") 없음. 이 두 항목은 차단 요인이 아닌 선택 보강 권고.

### 발견된 gap (SKILL.md 보강 권장)

- §2 MacIntyre 판본 섹션: 3판이 1판 대비 본문 내용 변경이 있는지, Prologue만 추가되었는지 명시 권고 (Nussbaum §7 수준의 기술)
- §4 Hursthouse 섹션: akrasia 관련 논의가 *On Virtue Ethics* 본문의 어느 파트/장에서 주로 이루어지는지 챕터 위치 정보 추가 권고

### 판정

- agent content test: Q1 PASS / Q2 PASS / Q3 PARTIAL (2/3 PASS, 1/3 PARTIAL)
- verification-policy 분류: 해당 없음 (인문학 참조 스킬 — 빌드 설정/워크플로우/설정+실행/마이그레이션 미해당)
- 최종 상태: APPROVED (핵심 정보 모두 근거 있음, gap은 선택 보강 권고 수준)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (19개 클레임 전원 VERIFIED) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ Q1 PASS / Q2 PASS / Q3 PARTIAL (2026-05-03) |
| **최종 판정** | **APPROVED** (2/3 PASS, 1/3 PARTIAL — gap은 선택 보강 권고) |

---

## 7. 개선 필요 사항

- [✅] skill-tester를 통한 실사용 테스트 후 status 갱신 필요 (2026-05-03 완료, 2/3 PASS + 1/3 PARTIAL → APPROVED 전환)
- [❌] MacIntyre §2: 3판이 1판 대비 본문 내용을 변경했는지, Prologue 추가만인지 명시 권고 — 차단 요인 아님, 선택 보강
- [❌] Hursthouse §4: akrasia 관련 논의가 *On Virtue Ethics* 어느 파트/장에서 이루어지는지 챕터 위치 정보 추가 권고 — 차단 요인 아님, 선택 보강
- [❌] 한국 학계 수용 섹션은 KCI 서지만 확인된 상태이므로, 추후 본문 인용 시 원문 확인 워크플로우 추가 검토 — 차단 요인 아님, §10 주의 표기로 이미 경고 중
- [❌] Nussbaum 자기 분류(덕윤리 여부)에 대한 시기별 변화는 §7에 주의 표기만 두었으며, 별도 보강 자료 추가 여지 있음 — 차단 요인 아님, 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-03 | v1 | 최초 작성 (현대 덕윤리 부흥 13개 섹션 + 검증 19개 클레임) | skill-creator (Opus 4.7) |
| 2026-05-03 | v1 | 2단계 실사용 테스트 수행 (Q1 Anscombe 기점·인용형식 / Q2 Hursthouse akrasia 처리 / Q3 MacIntyre 판본 차이 표기) → 2/3 PASS + 1/3 PARTIAL, APPROVED 전환 | skill-tester |
