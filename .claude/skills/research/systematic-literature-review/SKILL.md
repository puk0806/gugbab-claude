---
name: systematic-literature-review
description: >
  대학원 수준 체계적 문헌 검토(SLR) 가이드. PRISMA 2020·SPIDER·SPICE·thematic synthesis·meta-ethnography 등 표준 방법론을 인문학·교육학(특히 도덕윤리교육) 학위논문 "선행연구" 챕터 작성에 적용한다.
  <example>사용자: "도덕교육 박사논문 선행연구 챕터를 PRISMA에 맞춰 쓰고 싶은데 어디서부터 시작하나요?"</example>
  <example>사용자: "akrasia 주제로 RISS·KCI에서 검색식을 어떻게 짜면 되나요?"</example>
  <example>사용자: "선행연구를 단순 나열하지 말라는 지도교수 피드백을 받았어요. 비판적 종합은 어떻게 하나요?"</example>
---

# 체계적 문헌 검토 (Systematic Literature Review, SLR)

> 소스: PRISMA 2020 공식 사이트(prisma-statement.org), Page MJ et al. (2021) BMJ/PLoS Medicine, Booth/Sutton/Papaioannou (2016, Sage 2nd ed.), Cooke et al. (2012) Qualitative Health Research, Booth (2006) Library Hi Tech, Petticrew & Roberts (2006), Hart (1998/2018), Webster & Watson (2002), Thomas & Harden (2008), Noblit & Hare (1988), McGowan et al. (2016)
> 검증일: 2026-05-03
> 적용 대상: 인문학·교육학 학위논문 선행연구 챕터 (도덕윤리교육 전공 가정)

---

## 0. 시작 전 핵심 인지

PRISMA(Preferred Reporting Items for Systematic reviews and Meta-Analyses)는 **본래 의학·보건 분야 메타분석을 위한 보고 가이드라인**이다. 인문학·교육학에 그대로 적용할 수 없다.

> 주의(중요): PRISMA 2020 statement 자체가 "primarily designed for systematic reviews of studies that evaluate the effects of health interventions"라고 명시한다. 다만 "items are applicable to reports of systematic reviews evaluating other non-health-related interventions (such as social or educational interventions)"라고 적용 가능성을 인정한다. 인문학 SLR에서는 다음과 같이 변형한다:
> - 양적 효과크기 통계(Item 12 effect measures, Item 19 individual results, Item 20 statistical syntheses) → **정성적 종합으로 대체**
> - Risk of bias 도구(RoB 2, ROBINS-I) → **CASP 또는 학술적 엄밀성 기준으로 대체**
> - GRADE 확실성 평가(Item 15, 22) → **CERQual 또는 비판적 평가로 대체**
> - PICO 질문 프레임 → **SPIDER 또는 SPICE로 대체**

---

## 1. PRISMA 2020 statement 개요

### 1.1 발표 정보

- **저자(첫 5인)**: Matthew J Page, Joanne E McKenzie, Patrick M Bossuyt, Isabelle Boutron, Tammy C Hoffmann
- **발표**: 2021년 3월 29일, *BMJ* 372:n71 및 *PLoS Medicine*
- **공식 사이트**: https://www.prisma-statement.org/
- **공식 BMJ 논문**: https://doi.org/10.1136/bmj.n71

### 1.2 27-Item Checklist (7개 섹션)

PRISMA 2020 체크리스트는 7개 섹션·27개 주요 항목으로 구성되며 일부는 하위 항목을 포함한다.

| 섹션 | 항목 # | 항목명 | 인문학 SLR 적용 |
|------|:-----:|--------|----------------|
| **TITLE** | 1 | Title | "체계적 문헌 검토" 명시 |
| **ABSTRACT** | 2 | Abstract | PRISMA for Abstracts 별도 체크리스트 참조 |
| **INTRODUCTION** | 3 | Rationale | 기존 지식 맥락에서 검토 근거 |
| | 4 | Objectives | 검토 목적·연구 질문 명시 |
| **METHODS** | 5 | Eligibility criteria | 포함/배제 기준 (필수) |
| | 6 | Information sources | 데이터베이스·웹사이트 등 모든 정보원 |
| | 7 | Search strategy | 전체 검색식 공개 (필수) |
| | 8 | Selection process | 선별 절차·검토자 수·독립성 |
| | 9 | Data collection process | 데이터 추출 방법 |
| | 10a/10b | Data items | 결과변수·기타변수 정의 |
| | 11 | Study risk of bias assessment | 연구별 편향 평가 (인문학: CASP) |
| | 12 | Effect measures | 효과측도 (양적 메타분석 시) |
| | 13a~13f | Synthesis methods | 종합 방법 6하위 항목 |
| | 14 | Reporting bias assessment | 보고 편향 평가 |
| | 15 | Certainty assessment | 증거 확실성 평가 (GRADE) |
| **RESULTS** | 16a/16b | Study selection | flow diagram·제외 사유 |
| | 17 | Study characteristics | 포함 연구 특성 |
| | 18 | Risk of bias in studies | 편향 평가 결과 |
| | 19 | Results of individual studies | 개별 연구 결과 |
| | 20a~20d | Results of syntheses | 종합 결과 4하위 항목 |
| | 21 | Reporting biases | 보고 편향 결과 |
| | 22 | Certainty of evidence | 증거 확실성 결과 |
| **DISCUSSION** | 23a~23d | Discussion | 해석·증거 한계·검토 한계·시사점 |
| **OTHER INFORMATION** | 24a~24c | Registration and protocol | 프로토콜 등록 |
| | 25 | Support | 재정 지원 |
| | 26 | Competing interests | 이해상충 |
| | 27 | Availability of data, code, and other materials | 데이터·코드 가용성 |

> 주의: Item 12, 19, 20의 통계적 효과측도·메타분석 항목은 의학 양적 종합 전제다. 인문학 학위논문 선행연구 챕터에서는 "해당 없음(N/A)"으로 처리하고 정성적 종합 항목으로 보완한다.

### 1.3 Flow Diagram 4단계

PRISMA 2020 Flow Diagram은 검색→포함까지 정보 흐름을 시각화한다.

```
1. Identification (식별)
   ├─ Records identified from databases (n=?)
   ├─ Records identified from registers (n=?)
   ├─ Records removed before screening (중복·자동 필터)
   │  └─ Duplicate records removed (n=?)
   ↓
2. Screening (선별)
   ├─ Records screened (n=?)
   ├─ Records excluded (n=?, 사유)
   ↓
3. Eligibility (적격성 평가) — 본문 검토
   ├─ Reports sought for retrieval (n=?)
   ├─ Reports not retrieved (n=?)
   ├─ Reports assessed for eligibility (n=?)
   ├─ Reports excluded (n=?, 사유별로 구분)
   ↓
4. Included (포함)
   └─ Studies included in review (n=?)
   └─ Reports of included studies (n=?)
```

> 공식 다이어그램 템플릿: https://www.prisma-statement.org/prisma-2020-flow-diagram
> Shiny App(자동 생성): https://www.eshackathon.org/software/PRISMA2020.html

---

## 2. 인문학·교육학 SLR 핵심 문헌

| 저자·연도 | 제목 | 출판사 | 역할 |
|----------|------|--------|------|
| Booth, Sutton, Papaioannou (2016) | *Systematic Approaches to a Successful Literature Review* (2nd ed.) | Sage Publications, London (ISBN 9781473912465) | 사회과학 SLR 표준 교재 |
| Petticrew & Roberts (2006) | *Systematic Reviews in the Social Sciences: A Practical Guide* | Blackwell, Oxford (ISBN 1405121106, 352p) | 사회과학 SLR 실무 가이드 |
| Hart (1998 / 2018, 2nd ed.) | *Doing a Literature Review: Releasing the Research Imagination* | Sage (2nd ed. ISBN 9781526419217) | 인문·사회 학위논문 문헌검토 표준 |
| Webster & Watson (2002) | "Analyzing the Past to Prepare for the Future: Writing a Literature Review" | *MIS Quarterly* 26(2), xiii-xxiii | concept-centric vs author-centric 원형 논문 |
| Cooke, Smith, Booth (2012) | "Beyond PICO: the SPIDER tool for qualitative evidence synthesis" | *Qualitative Health Research* 22(10), 1435-1443 | SPIDER 프레임 원형 |
| Booth (2006) | "Clear and present questions: formulating questions for evidence based practice" | *Library Hi Tech* | SPICE 프레임 원형 |
| Thomas & Harden (2008) | "Methods for the thematic synthesis of qualitative research in systematic reviews" | *BMC Medical Research Methodology* 8:45 | thematic synthesis 3단계 방법론 |
| Noblit & Hare (1988) | *Meta-Ethnography: Synthesizing Qualitative Studies* | Sage Publications, Newbury Park | meta-ethnography 7단계 원형 |
| McGowan et al. (2016) | "PRESS Peer Review of Electronic Search Strategies: 2015 Guideline Statement" | *Journal of Clinical Epidemiology* 75, 40-46 | 검색 전략 동료검토 표준 |

---

## 3. 5단계 SLR 워크플로우 (인문학 적용)

### 단계 1 — 연구 질문 명료화 (PICO 대신 SPIDER/SPICE)

**PICO**(Population, Intervention, Comparison, Outcome)는 의학 임상시험용이다. 인문학에서는 다음을 사용한다.

#### SPIDER (Cooke, Smith, Booth 2012)

질적/혼합방법 연구 검색에 적합. *Qualitative Health Research* 게재 후 사회과학으로 확산.

| 글자 | 의미 | 도덕교육 예시 (akrasia 주제) |
|------|------|-----------------------------|
| **S**ample | 표본 | 중·고등학생, 도덕과 교사 |
| **PI** | Phenomenon of Interest | 의지박약(akrasia)·자기통제 실패 경험 |
| **D**esign | 연구 설계 | 면담·내러티브·현상학적 연구 |
| **E**valuation | 평가 | 학생 자기보고·교사 관찰 |
| **R**esearch type | 연구 유형 | 질적·혼합방법 |

#### SPICE (Booth 2006, *Library Hi Tech*)

질적·평가적 연구에 적합. 사회과학·서비스 평가 영역.

| 글자 | 의미 | 도덕교육 예시 |
|------|------|--------------|
| **S**etting | 어디서? | 중학교 도덕과 수업 |
| **P**erspective | 누구의 관점? | 교사·학생·학부모 |
| **I**ntervention | 무엇을? | 토론식 도덕 수업 |
| **C**omparison | 무엇과 비교? | 강의식 수업 |
| **E**valuation | 어떤 결과로? | 도덕적 추론 능력 변화 |

> 주의: PICO/SPIDER/SPICE 비교 연구(Methley et al. 2014, BMC Health Services Research)에 따르면 SPIDER는 PICO보다 specificity가 높고 sensitivity가 낮아 누락 위험이 있다. **첫 검색은 PICO/SPICE로 넓게 잡고, SPIDER로 정밀화**하는 것이 권장된다.

### 단계 2 — 검색 전략 (Search Strategy)

**필수 사전 결정 사항** (PRISMA Item 6, 7):
1. 데이터베이스 목록 (최소 3개 이상)
2. 검색어와 동의어 집합
3. Boolean 연산자 조합 (AND, OR, NOT)
4. 검색 기간 (예: 2000-01-01 ~ 2026-05-03)
5. 언어 제한 (한국어/영어/기타)
6. 자료 유형 (학술지·학위논문·단행본·정부보고서)

#### 한국어 데이터베이스

| DB | 운영기관 | 특성 | URL |
|----|---------|------|-----|
| **RISS** | 한국교육학술정보원(KERIS) | 학위논문·학술지·해외자료 통합검색, 150개 대학 |  http://www.riss.kr |
| **KCI** | 한국연구재단 | 한국학술지인용색인, 등재(후보)지 메타데이터 |  https://www.kci.go.kr |
| **DBpia** | 누리미디어 | 학회·연구소 학술지 본문 1.8M+ 편 (1918~) |  https://www.dbpia.co.kr |
| **KISS** | 한국학술정보 | 학술지 본문 1M+ 편 |  https://kiss.kstudy.com |
| **eArticle** | 학술교육원 | 인문사회 학술지 |  https://www.earticle.net |

#### 영문 데이터베이스 (도덕·윤리·철학 영역)

| DB | 특성 |
|----|------|
| **PhilPapers** | 철학 전문, OAI-PMH 인덱싱, akrasia 등 철학 키워드 강함 |
| **JSTOR** | 인문학 학술지 아카이브 |
| **ERIC** | 교육학 전문 (Education Resources Information Center) |
| **Scopus / Web of Science** | 다학제 인용 색인 |
| **Google Scholar** | 보조 검색 (재현성 낮으므로 주 DB 아님) |

#### 검색식 작성 예시 (akrasia 주제)

```
# RISS 한국어 검색식
("의지박약" OR "자제력 결여" OR "아크라시아" OR "akrasia") 
AND ("도덕교육" OR "도덕과" OR "윤리교육") 
NOT ("의학" OR "약물")
검색 기간: 2000-01-01 ~ 2026-05-03
자료유형: 학위논문, 국내학술지

# PhilPapers/JSTOR 영문 검색식  
("akrasia" OR "weakness of will" OR "incontinence") 
AND ("moral education" OR "ethics education" OR "character education") 
AND ("Aristotle" OR "Socrates" OR "Davidson")
Filters: peer-reviewed, English, 2000-2026
```

#### PRESS 검색식 동료검토 (McGowan et al. 2016)

검색식은 작성 후 사서·메서돌로지스트 검토 권장. 6개 평가 요소:
1. 연구 질문의 검색식 변환 (translation)
2. Boolean / 근접 연산자 사용
3. 주제어(MeSH 등) vs 자연어 (subject headings vs text words)
4. 철자·구문·라인 번호
5. 제한·필터 (언어·기간·자료유형)
6. (제거됨: 다른 DB로의 번역 — 검색자 재량으로)

> 출처: McGowan J, Sampson M, Salzwedel DM, et al. (2016) *J Clin Epidemiol* 75:40-46

### 단계 3 — 선별 (Screening)

**2단계 선별** (PRISMA Item 8):

```
1차: 제목 + 초록 검토
  ├─ 명백히 무관한 자료 제외
  ├─ 포함/배제 기준 사전 명시 필수
  └─ 가능하면 2명 독립 검토 후 일치도(κ) 확인

2차: 본문(full text) 검토
  ├─ 적격성 최종 판정
  ├─ 제외 사유를 사유별로 기록 (PRISMA Flow Diagram 4단계)
  └─ 제외된 "유사하지만 비포함" 연구는 본문에서 사유 명시 (Item 16b)
```

**포함/배제 기준 작성 예시:**

| 기준 | 포함 (Inclusion) | 배제 (Exclusion) |
|------|------------------|------------------|
| 주제 | 도덕적 의지박약 직접 다룬 연구 | 일반 의지력·자기통제 (도덕 무관) |
| 연구 유형 | 학술지 논문, 학위논문 | 학회 발표문, 신문 기사, 블로그 |
| 언어 | 한국어, 영어 | 그 외 |
| 기간 | 2000-01-01 ~ 2026-05-03 | 그 이전 |
| 학문 영역 | 도덕교육, 윤리학, 교육철학 | 임상심리, 신경과학, 약리학 |

> 주의: 단일 연구자 SLR(석·박사 논문)에서는 2명 독립 검토가 어려우므로 **불일치 시 지도교수와 협의**하는 절차를 명시하고 verification.md / 논문 부록에 기록한다(편향 완화).

### 단계 4 — 질 평가 (Quality Appraisal)

PRISMA Item 11(risk of bias)의 인문학 변형. 의학용 RoB 2, ROBINS-I는 무작위배정 임상시험 전제이므로 직접 사용 불가.

#### CASP (Critical Appraisal Skills Programme)

질적 연구용 10문항 체크리스트. 영국 옥스포드 기반 비영리 기관.

- 공식: https://casp-uk.net/casp-tools-checklists/qualitative-studies-checklist/
- 구조: 3개 섹션 (A. 결과 타당성 / B. 결과 내용 / C. 지역 활용성)
- 1·2번은 스크리닝 질문 ("yes" 두 개 시 진행)
- 응답: yes / no / can't tell

10개 평가 영역: 연구 목적, 방법론 적절성, 연구 설계, 표집, 자료 수집, 연구자-참여자 관계 고려, 윤리, 자료 분석, 결과 명료성, 가치.

#### 그 외 도구

- **AXIS** (Appraisal tool for Cross-Sectional Studies, 2016): 단면연구용 20문항
- **JBI Critical Appraisal Tools**: Joanna Briggs Institute, 연구설계별 11종

> 주의: 인문학 이론·해석 연구(예: 아리스토텔레스 *NE* 7권 akrasia 해석)에는 위 도구들이 적합하지 않다. 이 경우 **학술적 엄밀성·논증 일관성·1차 텍스트 인용 정확성** 등 분야 고유 기준을 명시적으로 적용한다.

### 단계 5 — 종합 (Synthesis)

PRISMA Item 13의 인문학 변형. 양적 메타분석 대신 **정성적 종합**.

#### A. Thematic Synthesis (Thomas & Harden 2008)

질적 연구 종합용. *BMC Medical Research Methodology* 8:45.

```
3단계:
1. Line-by-line coding (행별 코딩)
   └─ 각 연구의 발견을 한 줄씩 코드 부여
2. Descriptive themes (서술적 주제 도출)
   └─ 코드를 묶어 각 연구를 가로지르는 서술 주제 형성
3. Analytical themes (분석적 주제 생성)
   └─ 서술 주제를 넘어 새로운 해석·이론적 통찰 생성
```

#### B. Meta-Ethnography (Noblit & Hare 1988)

인류학·교육학에서 출발한 7단계 정성적 종합.

```
1. Getting started (시작)
2. Deciding what is relevant to the initial interest (관련성 판단)
3. Reading the studies (정독)
4. Determining how the studies are related (연구 간 관계 파악)
5. Translating the studies into one another (상호 번역)
6. Synthesising translations (번역 종합)
7. Expressing the synthesis (종합 표현)
```

연구 간 관계 4유형: ① 유사(reciprocal), ② 반박(refutational), ③ 보완(line of argument), ④ 추가 sense-making 필요.

#### C. Narrative Synthesis (서사적 종합)

Popay et al. (2006) ESRC Methods Programme. 양적·질적 모두 적용 가능. 4요소:
1. 이론 개발 (theory development)
2. 예비 종합 (preliminary synthesis)
3. 연구 간 관계 탐구 (exploring relationships)
4. 종합의 견고성 평가 (assessing robustness)

---

## 4. 선행연구 챕터 글쓰기 패턴

### 4.1 구성 방식

| 방식 | 특징 | 적합 상황 |
|------|------|----------|
| **시간순(Chronological)** | 연도 순으로 연구 발전 추적 | 학설사·이론사 정리 |
| **주제별(Thematic)** | 핵심 개념·쟁점별 묶음 | **대부분의 학위논문 권장** |
| **방법론별(Methodological)** | 연구 방법별 분류 | 방법론 비교 연구 |

### 4.2 단순 나열 금지 — 비판적 종합

**Webster & Watson (2002, MIS Quarterly)** 핵심 주장:

> "A literature review is **concept-centric**, meaning concepts determine the organizing framework of a review. In contrast, some authors take an **author-centric** approach and essentially present a summary of the relevant articles, a method that **fails to synthesize the literature**."

Author-centric (지양):
> "김철수(2010)는 ... 라고 주장했다. 이영희(2015)는 ... 라고 보았다. 박민수(2020)는 ..."

Concept-centric (권장):
> "도덕적 의지박약의 원인에 관한 국내 연구는 크게 **인지적 결함론**과 **정서적 동기론**으로 양분된다. 인지적 결함론은 김철수(2010), 박민수(2020) 등이 ... 반면 정서적 동기론은 이영희(2015), 정수진(2022) 등이 ..."

### 4.3 Concept Matrix (Webster & Watson 2002)

| 저자(연도) | 개념 A: 인지적 원인 | 개념 B: 정서적 원인 | 개념 C: 환경 요인 | 개념 D: 교육 처방 |
|-----------|:-:|:-:|:-:|:-:|
| 김철수(2010) | ● | | | ● |
| 이영희(2015) | | ● | ● | |
| 박민수(2020) | ● | | ● | ● |
| 정수진(2022) | | ● | | ● |

각 개념을 행이 아닌 **열**로 두어 종합하면 자연스럽게 concept-centric 글쓰기로 이어진다.

### 4.4 연구 갭(Research Gap) 도출

선행연구 챕터의 최종 목적은 **본 연구의 위치 정당화**다.

```
1. 무엇이 이미 잘 연구되었는가 (consensus)
2. 무엇이 아직 논쟁 중인가 (controversy)
3. 무엇이 거의 연구되지 않았는가 (gap)
   ├─ 주제 갭: 다뤄지지 않은 주제
   ├─ 방법 갭: 시도되지 않은 방법론
   ├─ 인구 갭: 다뤄지지 않은 대상
   ├─ 이론 갭: 검증되지 않은 이론
   └─ 맥락 갭: 다뤄지지 않은 시·공간
4. 본 연구는 어느 갭을 어떻게 채우는가 (positioning)
```

---

## 5. 선행연구 종합 시각화

| 시각화 도구 | 용도 |
|------------|------|
| **PRISMA Flow Diagram** | 검색→포함 흐름 (PRISMA Item 16a, 필수) |
| **연구사 흐름도** | 시간축 위 주요 전환점 표시 |
| **학파 계보도** | 사상가·이론 간 영향 관계 |
| **핵심 논쟁 매트릭스** | 쟁점 × 입장 2차원 표 |
| **Concept Matrix** | 저자 × 개념 (Webster & Watson 2002) |
| **친화도 다이어그램(KJ법)** | 코드를 그룹화해 주제 도출 |

> 도구: Zotero(레퍼런스 매니저), Lucidchart/draw.io(다이어그램), MAXQDA/NVivo(질적 코딩), VOSviewer(인용 네트워크).

---

## 6. 인문학 SLR의 한계와 대안

| 한계 | 의학 SLR의 해결책 | 인문학 대안 |
|------|------------------|-----------|
| 양적 효과 통합 불가 | 메타분석(forest plot) | 정성적 종합(thematic / meta-ethnography / narrative) |
| 단일 연구자 편향 | 2명 이상 독립 검토 | 지도교수·동료 동료검토 + 절차 투명 공개 |
| 회색문헌 누락 | trial registries | 학위논문·정책보고서·국가전자도서관 추가 |
| 출판 편향 | funnel plot | 비공식 채널 검색·언급 |
| 1차 텍스트 해석 | (해당 없음) | 원전 직접 인용·번역 비교 |
| 통일된 질 평가 부재 | RoB 2, ROBINS-I, GRADE | CASP(질적), JBI, 분야별 학술 엄밀성 기준 |

> 단일 연구자 학위논문에서는 **편향을 완전히 제거할 수 없다**. 대신 ① 검색식과 절차를 투명하게 부록에 공개, ② PRISMA Flow Diagram으로 누락 가능성 시각화, ③ 한계 절에서 명시적으로 인정한다.

---

## 7. 참고 자료 관리 도구

| 도구 | 특징 | 무료/유료 |
|------|------|----------|
| **Zotero** | 오픈소스, 브라우저 확장, 워드 플러그인 | 무료 (300MB 무료 클라우드) |
| **Mendeley** | Elsevier 제공, PDF 주석 강력 | 무료 (2GB) |
| **EndNote** | Clarivate, 대학 라이선스 흔함 | 유료 |
| **RefWorks** | ProQuest, 클라우드 기반 | 기관 구독 |

**한국어 환경 추천**: Zotero + Better BibTeX(인용 키 관리) + ZotFile(PDF 자동 정리). KCI/RISS는 RIS 형식 export 가능.

**PRISMA Flow Diagram 작성 도구:**
- 공식 Word 템플릿: https://www.prisma-statement.org/prisma-2020-flow-diagram
- Shiny App (자동 생성·SVG/PDF 다운로드): https://www.eshackathon.org/software/PRISMA2020.html
- 브라우저 도구: https://estech.shinyapps.io/prisma_flowdiagram/

---

## 8. 도덕윤리교육 학위논문 체크리스트

선행연구 챕터 제출 전 자가 점검:

- [ ] 연구 질문이 SPIDER 또는 SPICE 프레임으로 정리되었는가
- [ ] 검색식이 부록에 그대로 재현 가능하게 공개되었는가 (PRISMA Item 7)
- [ ] 검색 데이터베이스가 최소 3개 이상이고 한국어 + 영어 모두 포함되었는가
- [ ] 포함/배제 기준이 사전에 명시되고 그대로 적용되었는가 (Item 5)
- [ ] PRISMA 2020 Flow Diagram이 본문 또는 부록에 포함되었는가 (Item 16a)
- [ ] 단순 author-centric 나열이 아니라 concept-centric 종합인가 (Webster & Watson 2002)
- [ ] Concept Matrix 또는 동등한 종합 표가 있는가
- [ ] 연구 갭이 명시적으로 도출되고 본 연구의 위치가 정당화되었는가
- [ ] 단일 연구자의 한계가 인정되고 동료검토 절차가 명시되었는가
- [ ] 질 평가 도구(CASP 등 또는 분야 고유 기준)가 적용되었는가
- [ ] 종합 방법(thematic / meta-ethnography / narrative)이 명시되었는가
- [ ] PRISMA의 의학 본 용도와 인문학 적용 한계가 방법론 절에 언급되었는가

---

## 부록 A. 빠른 참조 — PRISMA 2020 vs 인문학 적용

| PRISMA Item | 의학 표준 | 인문학 권장 변형 |
|:-:|------|----------------|
| 5 | 명시적 inclusion/exclusion | 동일 적용 |
| 6 | PubMed, EMBASE, Cochrane | RISS, KCI, DBpia, JSTOR, PhilPapers |
| 7 | MeSH + 자연어 | 한국어 DB는 자연어 위주, 동의어 풍부하게 |
| 11 | RoB 2, ROBINS-I | CASP / JBI / 분야 고유 엄밀성 기준 |
| 12 | risk ratio, odds ratio | N/A (정성적) |
| 13 | meta-analysis | thematic / meta-ethnography / narrative synthesis |
| 14 | funnel plot, Egger | 회색문헌 추가 검색·한계 명시 |
| 15 | GRADE | CERQual 또는 비판적 평가 |
| 19, 20 | 통계적 결과 | 주제별 정성 결과 |
| 22 | GRADE 등급 | N/A 또는 CERQual |

---

## 부록 B. 원 문헌 직접 확인 URL

| 문헌 | URL |
|------|-----|
| PRISMA 2020 statement (BMJ) | https://doi.org/10.1136/bmj.n71 |
| PRISMA 2020 statement (PLoS Med) | https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1003583 |
| PRISMA 2020 E&E (PMC) | https://pmc.ncbi.nlm.nih.gov/articles/PMC8005925/ |
| PRISMA 공식 사이트 | https://www.prisma-statement.org/ |
| EQUATOR Network | https://www.equator-network.org/reporting-guidelines/prisma/ |
| SPIDER 원논문 | https://journals.sagepub.com/doi/10.1177/1049732312452938 |
| SPICE 원논문 | Booth A. (2006) *Library Hi Tech* |
| Webster & Watson 2002 | https://web.njit.edu/~egan/Writing_A_Literature_Review.pdf |
| Thomas & Harden 2008 | https://link.springer.com/article/10.1186/1471-2288-8-45 |
| CASP 체크리스트 | https://casp-uk.net/casp-tools-checklists/ |
| PRESS 2015 | https://pubmed.ncbi.nlm.nih.gov/27005575/ |
