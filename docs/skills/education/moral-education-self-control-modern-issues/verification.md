---
skill: moral-education-self-control-modern-issues
category: education
version: v1
date: 2026-05-06
status: APPROVED
---

# 검증 문서: moral-education-self-control-modern-issues

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `moral-education-self-control-modern-issues` |
| 스킬 경로 | `.claude/skills/education/moral-education-self-control-modern-issues/SKILL.md` |
| 검증일 | 2026-05-06 |
| 검증자 | skill-creator (Claude Opus 4.7) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 한국 1차 통계 출처 확인 (스마트폰 과의존, 학교폭력, ADHD)
- [✅] 도덕심리학 주요 학자 1차 출처 + 재현성 비판 출처 확인
- [✅] akrasia ↔ 현대 자제력 연구 매핑 표 작성
- [✅] KCI 등재 한국 도덕교육 선행연구 검증 (박재주 2011 등)
- [✅] 2022 개정 도덕과 교육과정 자신과의 관계 영역 KCI 자료 확인
- [✅] Jubilee Centre Aristotelian Character Education 공식 자료 확인
- [✅] 학술적 정당화 패턴 4가지 정리
- [✅] 흔한 실수 회피 체크리스트 작성
- [✅] 인용 권장 양식 (1차+비판 페어) 작성
- [✅] SKILL.md 작성
- [✅] verification.md 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확인 |
| 중복 확인 | Glob | `.claude/skills/education/**/SKILL.md`, `.claude/skills/humanities/**/SKILL.md` | 동일 이름 스킬 없음. 관련 humanities 스킬 12종 존재 (akrasia 관련) |
| 조사 1 | WebSearch | 교육부 학교폭력 실태조사 2024 | 2024년 1차 전수조사 참여율 81.7%, 후속 정책(제5차 기본계획 2025–2029) 확인 |
| 조사 2 | WebSearch | Baumeister ego depletion replication | Hagger 2010 d=0.62 → Carter 2015 d≈0.2 → Hagger 2016 다중연구 재현 실패 확인 |
| 조사 3 | WebSearch | Watts Duncan Quan 2018 marshmallow | *Psychological Science*, 29(7), 1159–1177. SES 통제 시 효과 약화 확인 |
| 조사 4 | WebSearch | Credé Tynan Harms 2017 grit meta-analysis | *J. Personality and Social Psychology*, 113(3), 492–511 정정. *PPSci* 아님 |
| 조사 5 | WebSearch | KISDI/여가부 청소년 스마트폰 과의존 2024 | 청소년 위험군 42.6% (전년 +2.5%p) 확인 |
| 조사 6 | WebSearch | Inzlicht 2016 ego depletion critique | Inzlicht & Schmeichel 2012 process model 대안 확인 |
| 조사 7 | WebSearch | 청소년 ADHD 진단 2024 건강보험심사평가원 | 2020 79,248명 → 2024 약 149,272명 확인. 진료비 4년간 314% 증가 |
| 조사 8 | WebSearch | Kahneman *Thinking Fast and Slow* 출판 | 2011 Farrar, Straus and Giroux 확인 |
| 조사 9 | WebSearch | Greene *Moral Tribes* 2013 | Penguin Press, 2013 확인 |
| 조사 10 | WebSearch | Haidt *Righteous Mind* 2012 | Pantheon, 2012 확인. 6개 moral foundations 명단 확인 |
| 조사 11 | WebSearch | KCI 자기조절 도덕교육 코로나 | 도덕윤리과교육 학술지(sereId 001279) 외 관련 논문 확인 |
| 조사 12 | WebSearch | 2022 개정 도덕과 자신과의 관계 자기조절 | KCI ART002882858 자신과의 관계 영역 분석 확인 |
| 조사 13 | WebSearch | Jubilee Centre Aristotelian character education | 2012 설립, 30명 학제간 연구진, neo-Aristotelian 프레임워크 확인 |
| 조사 14 | WebSearch | Mischel Shoda Rodriguez 1989 *Science* | 1989.5.26 *Science* 244(4907) 933–938 확인 |
| 조사 15 | WebSearch | 박재주 akrasia 도덕교육 KCI | 박재주(2011), 초등도덕교육 36, 1–30 확인 |
| 조사 16 | WebSearch | Hursthouse 1999 *On Virtue Ethics* | Oxford UP 1999 확인 |
| 조사 17 | WebSearch | Baumeister & Vohs 2007 SPPC | 1(1), 115–128 확인 |
| 조사 18 | WebSearch | Duckworth 2007 grit JPSP | *JPSP* 92(6), 1087–1101 확인 |
| 교차 검증 | WebSearch | 14개 핵심 클레임 | VERIFIED 13 / DISPUTED 1 / UNVERIFIED 1 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 한국지능정보사회진흥원 스마트폰 과의존 실태조사 | https://www.nia.or.kr/site/nia_kor/ex/bbs/View.do?cbIdx=65914&bcIdx=27831 | ⭐⭐⭐ High | 2024 | 한국 1차 공공통계 |
| 여성가족부 청소년 미디어 이용습관 진단조사 (2024) | https://www.mogef.go.kr/nw/enw/nw_enw_s001d.do?mid=mda700&bbtSn=712082 | ⭐⭐⭐ High | 2024.7.25 | 한국 1차 공공통계 |
| 교육부 학교폭력 실태조사 2024 (보도자료) | https://www.korea.kr/briefing/pressReleaseView.do?newsId=156652099 | ⭐⭐⭐ High | 2024.9.26 | 한국 1차 공공통계 |
| 건강보험심사평가원 ADHD 진료현황 | https://opendata.hira.or.kr/op/opb/selectRfrm.do?sno=13509 | ⭐⭐⭐ High | 2024 | 한국 1차 보건통계 |
| Baumeister & Vohs (2007) SPPC | https://compass.onlinelibrary.wiley.com/doi/10.1111/j.1751-9004.2007.00001.x | ⭐⭐⭐ High | 2007 | 동료심사 1차 출처 |
| Mischel, Shoda, Rodriguez (1989) *Science* | https://www.science.org/doi/10.1126/science.2658056 | ⭐⭐⭐ High | 1989 | 동료심사 1차 출처 |
| Watts, Duncan, Quan (2018) *Psychological Science* | https://journals.sagepub.com/doi/10.1177/0956797618761661 | ⭐⭐⭐ High | 2018 | 재현 비판 핵심 |
| Duckworth et al. (2007) *JPSP* | https://psycnet.apa.org/record/2007-07951-009 | ⭐⭐⭐ High | 2007 | 동료심사 1차 출처 |
| Credé, Tynan, Harms (2017) *JPSP* | https://psycnet.apa.org/record/2016-29674-001 | ⭐⭐⭐ High | 2017 | 메타분석 비판 |
| Inzlicht & Schmeichel (2012) *PPSci* | https://journals.sagepub.com/doi/10.1177/1745691612454134 | ⭐⭐⭐ High | 2012 | 자원모델 대안 |
| Kahneman (2011) *Thinking, Fast and Slow* | https://us.macmillan.com/books/9780374533557/thinkingfastandslow/ | ⭐⭐⭐ High | 2011 | 출판사 공식 |
| Greene (2013) *Moral Tribes* | https://www.penguinrandomhouse.com/books/299057/moral-tribes-by-joshua-greene/ | ⭐⭐⭐ High | 2013 | 출판사 공식 |
| Haidt (2012) *The Righteous Mind* | https://en.wikipedia.org/wiki/The_Righteous_Mind | ⭐⭐ Medium | 2012 | 위키피디아 (출판사 검증 보강 필요) |
| 박재주 (2011) 초등도덕교육 36 | https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001575952 | ⭐⭐⭐ High | 2011 | KCI 등재지 |
| Jubilee Centre for Character and Virtues | https://www.jubileecentre.ac.uk/ | ⭐⭐⭐ High | 2012– | University of Birmingham 공식 |
| Jubilee Centre Framework 2024 | https://www.jubileecentre.ac.uk/wp-content/uploads/2024/12/The-Jubilee-Centre-Framework-for-Character-Education-in-Schools.pdf | ⭐⭐⭐ High | 2024 | 공식 발간 PDF |
| Hursthouse (1999) *On Virtue Ethics* | https://global.oup.com/academic/product/on-virtue-ethics-9780199247998 | ⭐⭐⭐ High | 1999 | Oxford UP 공식 |
| 2022 개정 도덕과 자신과의 관계 (KCI) | https://www.kci.go.kr/kciportal/landing/article.kci?arti_id=ART002882858 | ⭐⭐⭐ High | 2022– | KCI 등재 학술논문 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 클레임별 교차 검증 결과

| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | 청소년(만10–19세) 스마트폰 과의존 위험군 42.6% (2024) | VERIFIED | 한국지능정보사회진흥원 + 여가부 보도자료 + 데이터솜 보도 3중 일치 |
| 2 | 2024 1차 학교폭력 실태조사 참여율 81.7% | VERIFIED | 교육부 보도자료 + 정책브리핑 + 경기/경남교육청 일치 |
| 3 | ADHD 환자 2024년 약 149,272명, 4년간 약 2배 증가 | VERIFIED | 헤럴드경제 + 메디칼타임즈 + 인사이트 3중 일치 |
| 4 | Baumeister & Vohs (2007) SPPC, 1(1), 115–128 | VERIFIED | psycnet APA + Roy Baumeister 본인 사이트 + scirp 일치 |
| 5 | Hagger 2016 다중연구 23개 실험실 재현 실패 (N=2,141) | VERIFIED | Wikipedia ego depletion + Inzlicht 본인 글 + 다수 논문 일치 |
| 6 | Carter 2015 메타분석 출판편향 통제 시 d≈0.2 | VERIFIED | PMC 메타분석 + Wikipedia + Frontiers 논평 일치 |
| 7 | Mischel, Shoda, Rodriguez (1989) *Science*, 244(4907), 933–938 | VERIFIED | Science 직접 + PubMed + APA psycnet 일치 |
| 8 | Watts, Duncan, Quan (2018) *Psychological Science*, 29(7), 1159–1177 | VERIFIED | SAGE + PMC + APS 옵저버 일치 |
| 9 | Duckworth (2007) *JPSP*, 92(6), 1087–1101 | VERIFIED | psycnet + PubMed + scirp 일치 |
| 10 | Credé (2017) *JPSP*, 113(3), 492–511 — *PPSci* 아님 | DISPUTED → 정정 | 사용자 노트의 *Perspectives on Psychological Science* 게재는 오류. *JPSP*가 정확 (psycnet + scirp + ResearchGate 일치). SKILL.md에서 정정 표기. |
| 11 | Kahneman *Thinking, Fast and Slow* (2011, FSG) | VERIFIED | Macmillan 공식 + Wikipedia + APA psycnet 일치 |
| 12 | Greene *Moral Tribes* (2013, Penguin Press) | VERIFIED | Penguin Random House + 저자 공식 사이트 + ResearchGate 일치 |
| 13 | Haidt *The Righteous Mind* (2012, Pantheon) | VERIFIED | Wikipedia + Goodreads + 저자 공식 사이트 일치. 출판사: Pantheon (US), Penguin (UK) |
| 14 | 박재주 (2011), 『아크라시아와 도덕교육』, 초등도덕교육 36, 1–30 | VERIFIED | KCI artiId ART001575952 직접 확인 |
| 15 | Jubilee Centre 2012년 설립, neo-Aristotelian framework | VERIFIED | 공식 사이트 + Birmingham 연구 페이지 + Framework PDF 일치 |
| 16 | "디지털 의지박약" / "스마트폰 akrasia" KCI 정착 용어 | UNVERIFIED → 표기 | KCI 직접 확인 결과 정착 용어 미발견. SKILL.md에 *제안 용어*로 표기하고 사용자 정의 권장 |

**총합:** VERIFIED 14 / DISPUTED 1 (정정 반영) / UNVERIFIED 1 (주의 표기 반영)

### 4-2. 내용 정확성

- [✅] 공식 출처와 불일치하는 내용 없음 (DISPUTED 1건은 정정 반영)
- [✅] 통계 발표연도(2024)·논문 권호(volume/issue/page) 명시
- [✅] deprecated된/철회된 연구를 권장 출처로 다루지 않음 (재현 실패 명시)
- [✅] 인용 양식이 APA 7판 기준으로 작성

### 4-3. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (skill-md-guard 통과)
- [✅] 4장 논증 흐름 골격 포함
- [✅] 한국 통계 표 + 도덕심리학 표 + akrasia 매핑 표 포함
- [✅] 인용 권장 양식 포함
- [✅] 흔한 실수 회피 체크리스트 포함
- [✅] 추가 조사 권장 항목 포함

### 4-4. 실용성 (research notes 형식)

- [✅] 본문 작성용 단락 대신 표·인용 위치·체크리스트 위주
- [✅] 한국 KCI 학계 톤·인용 관행 반영
- [✅] 사용자(철학 학사 + 교육학 석사) 학술 톤 — 입문 설명 최소화
- [✅] 사용자 학위논문 4장 구체 활용 위치 명시 (§5-A/B/C/D)

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-06 skill-tester 수행, 2026-05-06 재테스트 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (Q1 PASS / Q2 PASS / Q3 PASS — 재테스트 3/3 PASS)
- [✅] 잘못된 응답 발견 시 스킬 보완 필요 항목 기록 (NEEDS_REVISION → APPROVED 전환 완료)

---

## 5. 테스트 진행 기록

---

### [재테스트] 2026-05-06 보강 후 재테스트

**수행일**: 2026-05-06
**수행자**: skill-tester → general-purpose (academic-researcher는 오케스트레이터 구조로 부적합, general-purpose로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인 (NEEDS_REVISION 보강 내용 검증)

**Q1. (재테스트) Duckworth grit 비판 인지 후 도덕교육 활용 처방 — 인용 시 주의점**
- PASS
- 근거: SKILL.md §2.1 Duckworth 행 재현성 상태(CRITICAL) 칸 — "도덕교육에서 grit의 제한적 활용 처방" 4항목
- 상세: 보강된 처방 4항목(단독 측정 도구 사용 금지 / 별개 구성개념 단정 금지 + Credé 2017 r≈.84 인용 방식 / akrasia 회복 가능성과의 *느슨한* 유비만 허용 / passion↔phronēsis 범위 차이 명시)이 §2.1에 수록되어 있음. §2.2 인용 페어 양식(Duckworth+Credé 세트)과 §6 체크리스트까지 결합하면 완전한 처방 제공. 이전 PARTIAL 원인("처방적 지침 부재") 해소.

**Q2. (재테스트) akrasia 분석↔현대 자제력 연구 비교 방법 — Hursthouse 1999 좋은 모델의 의미**
- PASS
- 근거: SKILL.md §3 도입부 박스 "Hursthouse 1999가 '좋은 모델'인 이유" (*On Virtue Ethics*, Oxford UP)
- 상세: 보강된 내용으로 (a) 덕 개념을 행동 변수로 환원하지 않음, (b) 심리학 연구가 덕의 존재를 증명/반증하지 않는다는 입장, (c) 덕=인간 종의 자연적 번영에 기여하는 안정적 성품이 심리학 연구와 양립 가능함(*OVE* 5장 v-rules, 9장 자연주의 옹호 참고)이 명시됨. 분석 단위 차이(영혼 구조 vs 행동 변수)와 상보적 관계까지 포함. 이전 PARTIAL 원인("Hursthouse 유비 방법론 핵심 논지 미수록") 해소.

**Q3. (확인) 한국 디지털 환경 청소년 통계와 도덕심리학 자료를 4장에서 결합하는 작성 흐름**
- PASS
- 근거: SKILL.md §0 "4장 논증 흐름 권장 골격" + §1 한국 통계 표 3종 + §5-B "시대적 적실성" + §6 회피 체크리스트
- 상세: §0에서 [2] 통계·환경 변화 → [3] 도덕심리학+재현성 한계 → [4] akrasia 유비 매핑 순서가 명시됨. §1 각 표에 "본문 인용 위치 권장" 안내 포함. §5-B에서 "통계 3개 이상 묶어 명제화" 방식 제공. §6 체크리스트에 단일 원인 환원 금지, 한국 1차 출처 인용 항목 포함.

### 발견된 gap

없음. 3/3 PASS.

### 판정

- agent content test: PASS (Q1 PASS / Q2 PASS / Q3 PASS)
- verification-policy 분류: 해당 없음 (education 카테고리, 실사용 필수 스킬 미해당)
- 최종 상태: APPROVED

---

### [최초 테스트] 2026-05-06

**수행일**: 2026-05-06
**수행자**: skill-tester → general-purpose (academic-researcher는 오케스트레이터 구조로 부적합, general-purpose로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 4장에서 디지털 환경 청소년 충동성 다룰 때 한국 통계+도덕심리학 결합 방법 및 재현성 위기 처리**
- PASS
- 근거: SKILL.md §0 "4장 논증 흐름 권장 골격" + §1 "현대 청소년 자제력 결여 — 통계·환경 변화" + §2 "도덕심리학 응용 — 자제력 연구 (재현성 논란 필수 표기)" + §2.2 "인용 방식 — 1차+비판 페어 표기"
- 상세: 한국 1차 통계(한국지능정보사회진흥원 42.6%, 교육부, 건강보험심사평가원) 수록 완비. §2 도입부에 "재현성 위기 미언급은 KCI 심사 약점"이라는 명확한 경고 존재. §2.2에 Baumeister/Mischel/Duckworth 각각의 1차+비판 페어 APA 양식 제공. §1.3 ADHD 통계에 "단일 원인 환원 금지" 주의 표기까지 포함.

**Q2. Duckworth grit과 conscientiousness 구별 불가 비판 — 도덕교육 활용 방법 및 인용 주의점**
- PARTIAL
- 근거: SKILL.md §2.1 Duckworth 행 재현성 상태(CRITICAL) + §6 체크리스트 "grit과 conscientiousness를 별개 구성개념으로 단정하지 않았는가?" + §2.2 인용 페어 양식
- 상세: 비판 내용(Credé 2017, jangle fallacy, JPSP 113(3))과 인용 주의점은 완비됨. 그러나 "비판을 인식하고도 도덕교육에서 grit을 긍정적으로 어떻게 활용할 수 있는가"에 대한 처방적 지침이 없음. SKILL.md는 회피 패턴 위주이고 grit의 도덕교육적 적용 방향은 미수록.

**Q3. akrasia 분석을 현대 자제력 연구와 비교하는 방법 — "Hursthouse 1999가 좋은 모델"의 의미**
- PARTIAL
- 근거: SKILL.md §3 "akrasia ↔ 현대 자제력 연구 개념 매핑" 도입부 + 매핑 표 7행
- 상세: "단순 등치 금지, 유비로 활용, 차이를 명시한다"는 원칙과 매핑 표(7개 유형 × 유비+차이점)는 충분함. 그러나 "Hursthouse 1999가 좋은 모델"이라는 주장의 근거(Hursthouse가 *On Virtue Ethics* 어느 장에서 유비 방법론을 보여주는지, 핵심 논지가 무엇인지)는 SKILL.md에 없음. URL만 출처 섹션에 수록. 이 질문에 대한 완전한 답을 SKILL.md에서 도출하기 어려움.

### 발견된 gap

- **Q2 gap**: grit 비판(jangle fallacy)을 인지한 상태에서 도덕교육에서 grit 개념을 어떻게 재구성·활용할 수 있는지 처방적 지침 부재. "인용 시 비판 함께 표기" 이상의 교육적 활용 방향 필요.
- **Q3 gap**: Hursthouse (1999) *On Virtue Ethics*가 왜 유비 방법론의 좋은 모델인지 핵심 논지 미수록. 해당 저작의 관련 장(덕윤리학과 현대 심리학 연결 부분) 및 유비 사용 방식에 대한 최소한의 설명 보강 필요.

### 판정

- agent content test: PARTIAL (Q1 PASS / Q2 PARTIAL / Q3 PARTIAL)
- verification-policy 분류: 해당 없음 (education 카테고리, 실사용 필수 스킬 미해당)
- 최종 상태: NEEDS_REVISION

---

### 테스트 케이스 원본 (참고용 예정 템플릿)

**테스트 케이스 1: (원본 예정 템플릿)**

**입력 (질문/요청):**
```
(예시) 학위논문 4장에서 마시멜로 테스트를 인용하려고 한다. 어떻게 인용해야 하는가?
```

**기대 결과:**
```
1차 출처 Mischel, Shoda, Rodriguez (1989), Science 244(4907), 933–938을 인용하되,
반드시 Watts, Duncan, Quan (2018) Psychological Science 29(7), 1159–1177을
재현 비판으로 함께 표기하여 SES·가정환경 통제 시 효과 약화 사실을 명시할 것.
```

---

**테스트 케이스 2: (원본 예정 템플릿)**

**입력:**
```
(예시) akrasia를 ADHD와 동일한 개념으로 보아 4장에서 인용해도 되는가?
```

**기대 결과:**
SKILL.md §3 매핑 표 + §6 체크리스트에 따라 "직접 등치 금지, 유비로만 활용, 차이점 명시" 답변.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 (research notes) | ✅ |
| 에이전트 활용 테스트 (최초) | PARTIAL (Q1 PASS / Q2 PARTIAL / Q3 PARTIAL, 2026-05-06 수행) |
| 에이전트 활용 테스트 (재테스트) | PASS (Q1 PASS / Q2 PASS / Q3 PASS, 2026-05-06 수행) |
| **최종 판정** | **APPROVED** |

**판정 근거:**
- 한국 1차 공공통계 4종, 도덕심리학 1차 출처 8종, 재현성 비판 4종, KCI 등재 선행연구, Jubilee Centre 공식 자료 모두 교차 검증 완료
- 1건 DISPUTED(Credé 2017 학술지 정정)은 SKILL.md에 정확한 출처(*JPSP*)로 반영
- 1건 UNVERIFIED("디지털 의지박약" 정착 용어)은 *제안 용어*로 표기하여 학문적 정직성 확보
- NEEDS_REVISION 이후 보강: §2.1 grit 도덕교육 활용 처방 4항목 + §3 Hursthouse 1999 좋은 모델 이유 추가
- 재테스트 Q1 PASS(grit 처방 4항목 완비) / Q2 PASS(Hursthouse 유비 방법론 핵심 논지 완비) / Q3 PASS(논증 흐름 안내 완비)
- 3/3 PASS → APPROVED 전환

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 실사용 테스트 수행 (2026-05-06 최초 완료, Q1 PASS / Q2 PARTIAL / Q3 PARTIAL)
- [✅] **[차단 요인 해소]** grit 비판(jangle fallacy) 인지 후 도덕교육 활용 방향 처방적 지침 추가 (2026-05-06 SKILL.md §2.1 보강 완료 — 처방 4항목 추가, 재테스트 Q1 PASS)
- [✅] **[차단 요인 해소]** Hursthouse (1999) *On Virtue Ethics*의 유비 방법론 핵심 내용 보강 (2026-05-06 SKILL.md §3 보강 완료 — 좋은 모델 이유 + *OVE* 5장·9장 참고 추가, 재테스트 Q2 PASS)
- [✅] skill-tester 재테스트 수행 (2026-05-06 완료, 3/3 PASS → APPROVED 전환)
- [❌] **[선택 보강]** Hursthouse 1999 *On Virtue Ethics* 내 akrasia/continence 절 정확한 페이지 확인 — 사용자 직독 권장 (차단 요인 아님, APPROVED 전환에 영향 없음)
- [❌] **[선택 보강]** 박장호 2009 정확한 서지정보 사용자 메모 대조
- [❌] **[선택 보강]** 한국청소년정책연구원 NYPI 게임·SNS 중독 세부 통계 추가 (본 검증에서는 메인 출처 한정)
- [❌] **[선택 보강]** 코로나19 이후 자기조절 KCI 실증 연구 5편 이상 추가 발굴
- [❌] **[선택 보강]** 2022 개정 도덕과 교육과정 *고시문* 원문(교육부 고시 제2022-33호 [별책 6]) 직접 확인 후 §5-C 보강
- [❌] **[선택 보강]** Haidt *The Righteous Mind* 출판사 검증을 출판사 공식 페이지(Pantheon/Penguin) 직접 URL로 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-06 | v1 | 최초 작성. 한국 2024 통계 + 도덕심리학 1차+재현 비판 + KCI 선행연구 + Jubilee Centre 통합. Credé 2017 학술지 정정 + Duckworth 2007 학술지 정정. | skill-creator (Claude Opus 4.7) |
| 2026-05-06 | v1.1 | **fact-checker 추가 검증 — 5건 모두 VERIFIED**: Hagger 2010 *Psychological Bulletin* 136(4) 495-525 / Hagger 2016 *Perspectives on Psychological Science* 11(4) 546-573 23 labs N=2141 d=0.04 / Watts 2018 *Psychological Science* 29(7) 1159-1177 SES 통제 후 효과 2/3 감소 / Credé 2017 *Journal of Personality and Social Psychology* 113(3) 492-511 (skill-creator 학술지 정정 정확) / Duckworth 2007 *Journal of Personality and Social Psychology* 92(6) 1087-1101 (skill-creator 학술지 정정 정확). PubMed + APA PsycNet + SAGE Journals 교차 검증. 추가 정정 사항 없음. APPROVED 미전환(skill-tester 2단계 실사용 테스트 대기). | fact-checker |
| 2026-05-06 | v1.2 | 2단계 실사용 테스트 수행 (Q1 디지털 환경 통계+도덕심리학 결합 / Q2 grit 비판 및 도덕교육 활용 / Q3 akrasia 유비 비교 및 Hursthouse 방법론) → 1/3 PASS, 2/3 PARTIAL, NEEDS_REVISION 전환. 차단 요인 2건: grit 도덕교육 활용 처방 부재, Hursthouse 유비 방법론 핵심 논지 미수록. | skill-tester |
| 2026-05-06 | v1.3 | SKILL.md 보강 후 재테스트 수행 (Q1 grit 비판+처방 4항목 / Q2 Hursthouse 좋은 모델 이유+OVE 5·9장 / Q3 한국 통계+도덕심리학 결합 흐름) → 3/3 PASS, NEEDS_REVISION → APPROVED 전환. 섹션 5·6·7·8 전체 동기화 완료. | skill-tester |
