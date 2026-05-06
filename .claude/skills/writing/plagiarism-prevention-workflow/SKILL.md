---
name: plagiarism-prevention-workflow
description: >
  대학원생 학위논문·KCI 학술지 투고 단계에서 카피킬러·Turnitin·iThenticate 사전 점검을 자연스럽게 통과하는 정직한 학술 글쓰기 실무 절차. 표절 회피 기법이 아니라 출처 표기·인용·재구성·자기표절 방지·AI 활용 표기까지 포함하는 작성 워크플로우.
  <example>사용자: "학위논문 카피킬러 검사 전에 어떤 점검을 해야 하나요?"</example>
  <example>사용자: "ChatGPT를 자료조사에 사용했는데 어떻게 표기해야 하죠?"</example>
  <example>사용자: "선행연구 paraphrase가 patchwriting인지 어떻게 자가 점검하나요?"</example>
---

# 표절 예방 워크플로우 — 학위논문·KCI 학술지 사전 점검

> 소스: 본 문서 하단 "검증된 소스" 섹션 참조 (COPE / WAME / ICMJE / 교육부훈령 449호 / Turnitin·iThenticate 공식 가이드 / Howard 1995)
> 검증일: 2026-05-05

---

## 0. 핵심 원칙 (먼저 읽고 시작할 것)

이 스킬은 **"검사기를 속이는 기법"이 아니다.**
정직한 학술 글쓰기를 했을 때 검사기가 자연스럽게 통과되는 절차를 다룬다.

**명시적으로 금지되는 행위 (스킬에서 절대 권장하지 않음):**

- 단어 동의어 치환만 한 paraphrase (= patchwriting, 표절)
- 어순만 변경한 paraphrase (= patchwriting, 표절)
- AI에게 paraphrase시켜 검사기 회피 (자기 사유 부재 + 미공개 시 표절·연구부정)
- 인용부호 누락 후 본인 문장처럼 작성
- 본인 이전 논문·발표문 출처 누락
- AI 출력을 그대로 본문에 삽입 (COPE·ICMJE·WAME 모두 책임 위반으로 분류)

> Howard(1995)가 정의한 patchwriting: "원문에서 몇 단어만 삭제·문법 구조만 변경·일대일 동의어로 대체"하는 것. 이는 출처를 표기해도 표절로 분류된다(MLA Style Center, kpu.pressbooks.pub).

---

## 1. 검사기 작동 원리 (왜 이런 절차가 필요한가)

| 검사기 | 운영사 | 매칭 단위 | 비교 DB | 사용처 |
|--------|--------|-----------|---------|--------|
| 카피킬러 | 무하유 | **6어절 연속 일치** (교육부 지침 기준) | KCI 논문, 학위논문, 인터넷, 도서, 학술지(약 100억 건 규모) | 한국 대학원 학위논문 사전 점검 |
| Turnitin | Turnitin LLC | **8단어 이상 연속 일치** (기본 minimum) | 학생 제출물·웹·학술지 DB | 영문 학술지 일부, 해외 대학원 |
| iThenticate | Turnitin LLC | Turnitin과 **동일 엔진** | Crossref Similarity Check DB (학술지 출판사 출간물) | KCI·SSCI·SCI 학술지 출판사 사전 점검 |

핵심 사실:
- **iThenticate와 Turnitin은 동일 엔진**(Turnitin LLC). Crossref Similarity Check가 iThenticate 기반으로 운영됨.
- 카피킬러 표절률 계산식: `표절 의심 어절 수 / 전체 어절 수 × 100`
  - 동일문장: 6어절 1문장 전체가 같은 문장
  - 의심문장: 6어절 1문장 중 일부가 같은 문장
- **Turnitin의 AI Writing Detection은 Similarity Score와 별도**로 운용된다(2024 업데이트). Similarity가 0%여도 AI Writing이 50%+로 나올 수 있음. 두 보고서는 분리되어 출력된다.

> 주의: 카피킬러도 별도의 GPT 생성 검사(GPTKiller)를 운용한다. 표절률이 낮아도 AI 생성 검사에서 걸리면 별도 사유가 된다.

---

## 2. 유사도 임계값 (학교·학술지별 차등)

**공식 통일 기준 없음.** 학교·학술지마다 자체 기준을 가진다. 아래는 **확인 가능한 사례**이며, 본인 소속 기관 규정이 우선이다.

| 분류 | 통상 권장 범위 | 비고 |
|------|---------------|------|
| 한국 대학원 학위논문 | **5% 내외 권장**이 다수 (수원대·공주대 등) | 학교마다 5%~20%까지 차이. 본인 학교 규정 확인 필수 |
| KCI 등재지 학술지 | 학술지별 자체 기준 | 인용 문헌·참고문헌 제외 후 산정이 일반적 |
| 영문 학술지 | 보통 15~20% 이하 (Methods 표준 표현 제외) | 학술지 Editorial Policy 확인 필요 |

> 주의 (UNVERIFIED): "도덕윤리교육 분야 KCI 학술지의 분야 표준 표절률 기준"은 공식 통합 수치를 확인할 수 없음. **투고 학술지의 투고 규정·연구윤리 규정**을 직접 확인할 것. (한국도덕윤리과교육학회 등 개별 학회 공지 참조)

> 주의: % 수치만 낮으면 안전하다는 인식은 잘못됨. KCI 안내처럼 "유사도가 낮아도 출처 없이 사용했다면 표절"이다. 절대 임계값보다 **출처 표기 정확성**이 본질이다.

---

## 3. 직접인용 정확 표기

### 3-1. 한글 직접인용 (3행 이내)

```
선행 연구는 "아크라시아는 무지가 아니라 욕망의 우세에서 비롯된다"(이상인, 2018: 142)고 본다.
```

규칙:
- 큰따옴표(`"..."`)로 인용 범위 명시
- 출처는 **(저자, 연도: 페이지)** — 반드시 페이지 포함
- **인용부호 안의 6어절+ 일치는 카피킬러가 인용으로 정상 인식**한다 (인용 처리 옵션 활성화 시)

### 3-2. 블록 인용 (4행 이상 또는 일정 길이 초과)

```
   아리스토텔레스는 다음과 같이 말한다.

      덕은 습관에 의해 형성되며, 우리는 정의로운 행위를 함으로써 정의로워지고
      절제 있는 행위를 함으로써 절제 있게 되며 용감한 행위를 함으로써 용감해진다.
      (Aristoteles, NE 1103a31-b2; 강상진 외 역, 2011: 51)
```

규칙:
- 본문에서 **들여쓰기**(통상 좌우 1~2자)
- 큰따옴표 생략 (들여쓰기가 인용임을 표시)
- 출처 + 원전 위치(예: 베커판 페이지 NE 1103a31-b2)

### 3-3. 그리스어·라틴어 등 원어 인용

```
아크라시아(ἀκρασία, akrasia)는 통상 "자제력 없음" 또는 "의지 박약"으로 번역된다(Aristoteles, NE VII; 강상진 외 역, 2011: 235).
```

규칙:
- **음역 + 원어(괄호 또는 병기) + 출처**
- 원전 인용은 베커판 페이지(예: NE 1145b21) 사용이 학계 표준

---

## 4. 간접인용(paraphrase) 정확 표기

### 4-1. 무엇이 정상 paraphrase인가

| 기준 | 정상 paraphrase | patchwriting (표절) |
|------|-----------------|--------------------|
| 어휘 | 본인 어휘로 거의 전면 재구성 | 동의어 치환만 |
| 문장 구조 | 새 구조로 재배열 | 어순만 변경 |
| 사유 흐름 | 본인 논리에 통합 | 원문 논리 그대로 답습 |
| 출처 | 명시 | 명시해도 patchwriting이면 표절 |

> Howard(1995)에 따르면 patchwriting은 "원문에서 몇 단어 삭제·문법 변경·동의어 1:1 치환"이며, 출처 표기 여부와 무관하게 표절의 한 형태로 분류된다.

### 4-2. paraphrase 자가 점검 5단계

1. **맥락 안에서 원문 통독** — 단편적으로 가져오면 의미 왜곡 위험
2. **의미 단위(chunk)로 분할** — 문장·문단 단위로 핵심 명제 식별
3. **원문을 닫고 초고 작성** — 원문을 보면서 쓰면 patchwriting이 된다
4. **체크리스트 검증** (아래)
5. **원문과 나란히 비교** — 핵심 의미 보존 + 어휘·구조 충분히 달라졌는가

**체크리스트:**

- [ ] 원문 어휘를 70% 이상 다른 표현으로 바꿨는가
- [ ] 문장 구조를 새로 짰는가 (단순 어순 변경 아님)
- [ ] 본인 논리 흐름에 통합되었는가
- [ ] 출처(저자, 연도: 페이지)를 명시했는가
- [ ] 원문 의미가 왜곡되지 않았는가

---

## 5. 자기표절 (self-plagiarism) 방지

같은 저자의 글이라도 출처 미표기 시 자기표절·중복게재로 분류된다(교육부훈령 449호 시행 2023.07.17). 한국 학계는 **출처를 명시하면 재사용을 허용**하는 입장이 일반적이다.

| 경로 | 표기 방법 |
|------|----------|
| 수업 보고서 → KCI 투고 | 각주 또는 서두에 "본 논문은 ○○ 수업에서 작성한 보고서를 수정·확장한 것임" |
| 학위논문 일부 → KCI 투고 | "본 논문은 저자의 박사학위논문(○○대학교, 20○○) 제○장을 수정·확장한 것임" |
| KCI 게재 논문 → 학위논문 통합 | 학위논문 서론 또는 해당 장 첫 각주에 출처 명시. 일부 학과는 "기 발표 논문 활용 동의서" 요구 |
| 학회 발표문 → 학술지 투고 | "본 논문의 초기 형태는 ○○학회 20○○년 ○월 학술대회에서 발표되었음" |

> 주의: 한국 학계 통용 관행이지만, **투고 학술지의 자기표절·중복게재 정의 조항을 별도 확인**할 것. 학술지마다 허용 비율(예: 30% 이내 재사용 등)이 다르다.

---

## 6. AI 도구 활용 시 표기 방법 (2026년 5월 기준 국제 표준)

### 6-1. 공통 원칙 (COPE / WAME / ICMJE 합의)

세 기관 모두 다음 원칙에 일치한다:

1. **AI는 저자가 될 수 없다** — 책임을 질 수 없고 법적 인격이 없음
2. **AI 사용은 반드시 공개** — 어디서·어떻게 썼는지 명시
3. **모든 책임은 인간 저자** — 정확성·표절 부재·출처 적합성 모두 저자 책임
4. **AI 생성물을 1차 출처로 인용 금지** (ICMJE)

| 기관 | 권고 핵심 | 발표·개정일 |
|------|----------|-----------|
| COPE | AI 저자 불인정, Materials & Methods 또는 유사 섹션에서 사용 도구·방법 공개 | Position Statement (2023, 후속 갱신) |
| WAME | 4개 권고 (저자 자격 부정, 투명한 공개, 저자 책임, 편집자·심사자도 공개) | 2023.01.20 발표, 2023.05.31 개정 |
| ICMJE | 커버레터 + 본문 모두에 사용 방법 기술. 미공개 시 misconduct로 간주 가능 | 2023.05 신설, 2024.01 갱신 |

### 6-2. 한국 권고

- **한국연구재단 "생성형 AI 도구의 책임 있는 사용을 위한 권고사항"**: 2024.03 최초 제시, **2025.09.17 개정판** 공개. 적용 범위는 "재단 과제 신청·평가 참여 연구자". 챗봇 사용 시 초록(abstract)과 방법론(methods) 섹션에 명시 권고.

> 주의: 한국연구재단 권고의 항목별 세부 본문은 cre.nrf.re.kr 원문 PDF 직접 확인 권장.

### 6-3. 표기 예시 (Acknowledgments / 감사의 말 섹션)

**한글 예시:**

```
본 논문 작성 과정에서 OpenAI GPT-4o(2024년 5월 버전)와 Anthropic Claude Sonnet 4.5
(2025년 9월~12월 사용)를 다음 범위에서 활용하였다: (1) 선행연구 키워드 탐색,
(2) 영문 초록 문법 교정, (3) 본문 한국어 표현 다듬기. 모든 인용·논증·결론은
저자의 판단이며, AI 출력물은 저자가 검토·수정 후 반영하였다.
본 논문의 모든 내용에 대한 책임은 저자에게 있다.
```

**영문 예시:**

```
During the preparation of this work, the author used OpenAI GPT-4o (May 2024)
and Anthropic Claude Sonnet 4.5 (September–December 2025) for (1) literature
keyword exploration, (2) grammar editing of the English abstract, and
(3) Korean prose refinement. After using these tools, the author reviewed
and edited the content as needed and takes full responsibility for the
content of the publication.
```

### 6-4. 절대 금지

- AI를 저자(author) 또는 공저자로 등재
- AI 출력을 검토·수정 없이 그대로 본문 삽입
- AI를 1차 출처(primary source)로 인용 (`(ChatGPT, 2025)` 형태로 본문 인용 — ICMJE 명시 금지)
- AI 사용 사실 자체를 미공개 (ICMJE: "misconduct로 간주 가능")

---

## 7. 사전 시뮬레이션 워크플로우 (제출 전 자가 점검 순서)

```
[1] 인용 표기 일관성 검토
       ↓
[2] 자기 문장 vs 인용 문장 비율 점검
       ↓
[3] 카피킬러(또는 학교 제공 검사기) 사전 검사
       ↓
[4] 의심 구간 재집필 → 재검사
       ↓
[5] 영문 초록 별도 점검
       ↓
[6] AI 사용 표기 섹션 작성 확인
       ↓
[7] 자기 이전 글 출처 누락 점검
```

각 단계 세부:

**[1] 인용 표기 일관성**
- 직접인용 모두 큰따옴표로 묶였는가
- 모든 인용에 (저자, 연도: 페이지) 형태가 일관되게 적용되었는가
- 참고문헌 목록과 본문 인용이 1:1로 대응되는가

**[2] 자기 문장 비율**
- 본인 사유·해석·논증이 60% 이상 권장 (인문학 전공 통념)
- 인용·재구성이 70%를 넘으면 본인 기여 미달로 평가될 위험

**[3] 사전 검사**
- 대부분 한국 대학원은 카피킬러 무료 제공
- 인용 처리 옵션, 참고문헌 제외 옵션 활성화 후 검사

**[4] 의심 구간 재집필** (아래 9절 참조)

**[5] 영문 초록 별도 점검**
- 한국어 → 영어 번역체는 다국어 검사기에서 매칭됨
- DeepL·Google 번역 출력 그대로 사용 시 다른 한국 논문과 충돌 가능
- 영문 초록은 직접 작성 + 영문 교정 권장

**[6] AI 사용 표기**
- 6.3 예시처럼 도구명·버전·시기·범위·책임 소재 명시

**[7] 자기 이전 글**
- 본인 학회 발표문, 수업 보고서, 학위논문, 이전 학술지 논문 모두 출처 표기

---

## 8. 흔한 실수 5가지

| # | 실수 | 결과 | 올바른 처리 |
|---|------|------|------------|
| 1 | 출처는 있는데 인용부호 누락 | 간접인용으로 분류되어 patchwriting 판정 | 직접인용은 반드시 큰따옴표 + (저자, 연도: 페이지) |
| 2 | paraphrase가 단어 치환 수준 | patchwriting → 표절 | 4-2의 5단계 자가 점검 수행 |
| 3 | 본인 이전 논문·발표문 출처 미표기 | 자기표절·중복게재 | 5절 표기 패턴 적용 |
| 4 | 그림·표 출처 누락 | 표절 | 그림·표 캡션 하단에 "출처: 저자(연도: 페이지)" 또는 "○○에서 재구성" |
| 5 | "상식적 사실"이라 출처 누락 | 학술 글에서는 표절 위험 | 전공 분야 통념이라도 1차 출처 명시 권장 |

---

## 9. 의심 구간 재집필 워크플로우

카피킬러 결과지에서 빨간색·주황색 구간이 나왔을 때:

```
[Step 1] 빨간색 구간 식별 (6어절+ 연속 일치)
       ↓
[Step 2] 판단: 이 구간이 본질적으로
   (A) 핵심 명제 인용인가 → 직접인용으로 전환
   (B) 본인 사유로 재구성한 것인가 → 본인 문장으로 완전 재작성
       ↓
[Step 3-A] 직접인용 전환:
   - 큰따옴표 + (저자, 연도: 페이지)
   - 검사 시 "인용 제외" 옵션 활성화하면 유사도에서 제외됨
       ↓
[Step 3-B] 완전 재작성:
   - 원문 닫고 본인 노트만 보면서 다시 작성
   - 4-2의 자가 점검 5단계 통과 확인
       ↓
[Step 4] 재검사 → 통과 시 확정
```

> 절대 금지: 동의어 사전 돌려서 단어만 바꾸기. 어순만 뒤집기. AI에게 "이 문장 표절 안 걸리게 바꿔줘"라고 시키기. 셋 모두 patchwriting + AI 미공개로 이중 위반.

---

## 10. 실전 체크리스트 (제출 직전)

- [ ] 모든 직접인용에 큰따옴표 + 페이지 표기
- [ ] 모든 paraphrase가 단순 동의어 치환·어순 변경 수준이 아님
- [ ] 본인 이전 글 사용 시 출처 명시
- [ ] 그림·표·도식 모두 출처 또는 자체 작성 표기
- [ ] AI 도구 사용 시 Acknowledgments에 도구·버전·범위·책임 명시
- [ ] 카피킬러(또는 동등 검사기) 사전 검사 통과
- [ ] 영문 초록 별도 점검 완료
- [ ] 참고문헌 목록과 본문 인용 1:1 대응
- [ ] 학교·학술지별 표절률 기준 충족 (본인 소속 규정 확인)
- [ ] 투고 학술지의 자기표절 허용 범위 확인

---

## 검증된 소스

| 소스 | URL | 신뢰도 |
|------|-----|--------|
| COPE Authorship and AI Tools | https://publicationethics.org/guidance/cope-position/authorship-and-ai-tools | ⭐⭐⭐ 1순위 |
| WAME Recommendations 2023.05.31 | https://wame.org/page3.php?id=110 / https://pmc.ncbi.nlm.nih.gov/articles/PMC10712422/ | ⭐⭐⭐ 1순위 |
| ICMJE AI Use by Authors | https://www.icmje.org/recommendations/browse/artificial-intelligence/ai-use-by-authors.html | ⭐⭐⭐ 1순위 |
| 교육부훈령 449호 (2023.07.17 시행) | https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000226306 | ⭐⭐⭐ 1순위 |
| 한국연구재단 생성형 AI 권고 | https://cre.nrf.re.kr/bbs/BoardDetail.do?bbsId=BBSMSTR_000000000169&nttId=15100 | ⭐⭐⭐ 1순위 |
| 카피킬러 매뉴얼 (6어절 기준) | https://manual.muhayu.com/copykiller-campus/plagiarism/undefined-1 | ⭐⭐⭐ 운영사 공식 |
| 이화여대 카피킬러 가이드 | https://ewha.libguides.com/Researchethics2/Copykiller | ⭐⭐ 기관 공식 |
| Turnitin Similarity Score | https://guides.turnitin.com/hc/en-us/articles/23435833938701-Understanding-the-similarity-score | ⭐⭐⭐ 1순위 |
| Turnitin AI Writing Detection | https://guides.turnitin.com/hc/en-us/articles/22774058814093-AI-writing-detection-in-the-new-enhanced-Similarity-Report | ⭐⭐⭐ 1순위 |
| iThenticate (Turnitin 동일 엔진) | https://en.wikipedia.org/wiki/IThenticate / https://www.ithenticate.com/ | ⭐⭐ 보조 |
| Crossref Similarity Check | https://www.crossref.org/services/similarity-check/ | ⭐⭐⭐ 1순위 |
| Howard 1995 Patchwriting | *College English* 57.7 (Nov 1995): **788-806** (NCTE 공식 출판 기준) — https://publicationsncte.org/content/journals/10.58680/ce19959094 / 저자 공개본 https://surface.syr.edu/wp/7/ | ⭐⭐⭐ 원전 |
| MLA Style Center (Paraphrase vs Patchwriting) | https://style.mla.org/paraphrasing-patchwriting/ | ⭐⭐⭐ 1순위 |
| KPU Academic Integrity (Paraphrase Steps) | https://kpu.pressbooks.pub/academicintegrity/chapter/paraphrase/ | ⭐⭐ 교육 자료 |

---

## 함께 보면 좋은 스킬

- `writing/citation-style-international` — APA·Chicago·MLA 등 분야별 인용 스타일
- `writing/journal-submission-response` — 학술지 투고 후 심사 응답
- `writing/academic-paper-structure-humanities` — 인문학 논문 구조
