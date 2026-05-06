---
name: academic-databases-korean-humanities
description: >
  도덕윤리교육 전공 대학원생(석/박사)이 akrasia(자제력 없음/의지박약) 등 인문학·윤리학 주제의 학위논문·KCI 학술지 논문을 작성할 때
  활용할 국내외 학술 데이터베이스 검색 전략. KCI·RISS·DBpia·교보스콜라 등 국내 DB와 PhilPapers·JSTOR·
  Project MUSE·Google Scholar 등 국제 DB의 검색 필드, 키워드 조합, 인용 추적 기법을 정리.
  <example>사용자: "akrasia 관련 한국어 논문 어떻게 찾아?"</example>
  <example>사용자: "도덕윤리과교육 학술지 KCI 등재된 거 있어?"</example>
  <example>사용자: "PhilPapers에서 weakness of will 관련 자료 찾는 법"</example>
---

# 한국 인문학·윤리학 학술 DB 검색 스킬

> 대상 독자: 도덕윤리교육 전공 대학원생(석/박사) — akrasia/자제력 없음/의지박약 주제 학위논문·KCI 등재지 작성 시나리오
> 검증일: 2026-05-03
> 1차 소스: 각 DB 공식 사이트, KCI 한국학술지인용색인(www.kci.go.kr), 각 학회 공식 페이지

---

## 1. 국내 학술 데이터베이스 4종

### 1.1 KCI(한국학술지인용색인)

> 소스: https://www.kci.go.kr/

- **운영 주체**: 한국연구재단 (2007년 구축, 2008년 출범)
- **성격**: 비영리 인용 색인. 국내 학술지의 KCI 등재 여부·인용 관계 확인용 1차 도구
- **등급 구분**:
  - **KCI 등재학술지** — 한국연구재단 평가 통과
  - **KCI 등재후보학술지** — 등재 직전 단계 (학부 논문에서도 인용 가능)
  - **KCI 우수등재학술지** — 등재지 중 최상위 등급 (예: 한국철학회 「철학」)
- **핵심 검색 화면**:
  - 등재 학술지 검색: https://www.kci.go.kr/kciportal/guidance/recordedJourSearchList.kci
  - 논문(Citation) 검색: https://www.kci.go.kr/kciportal/po/search/poCitaSear.kci
- **검색 필드**: 저자, 제목, 키워드, 초록, 학술지명, 발행연도, 분야(주제분류)
- **KCI 식별번호**: `ART00xxxxxx` (논문) / `SER000xxxxxx` (학술지) — 인용·내보내기 시 활용

**KCI URL 직접 활용 (sereId/artiId 패턴)**

학술지·논문 페이지로 직접 이동할 수 있는 영구 URL 패턴:

| 대상 | URL 패턴 | 예시 |
|------|---------|------|
| 학술지 페이지 | `https://www.kci.go.kr/kciportal/po/search/poCitaView.kci?sereId={SER번호}` | 「도덕윤리과교육」: `?sereId=001279` |
| 논문 페이지 | `https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId={ART번호}` | 박재주(2011): `?sereArticleSearchBean.artiId=ART001575952` |
| 논문 짧은 URL | `https://www.kci.go.kr/kciportal/landing/article.kci?arti_id={ART번호}` | 같은 논문: `?arti_id=ART001575952` |

활용 시나리오:
- 학위논문 참고문헌에 KCI 영구 URL 함께 명시 (인용 검증성 향상)
- 동명 학술지 구분 시 `sereId`로 정확한 발행기관 확인 (예: 「철학연구」 철학연구회 sereId=000154 vs 대한철학회 sereId=001231)
- citation-checker / curriculum-2022-fact-checker 에이전트에게 검증 의뢰 시 URL 직접 전달

**활용 팁**
- KCI는 원문 제공이 제한적이다. **등재 여부 확인** 후 RISS·DBpia·교보스콜라에서 원문을 받는다.
- 동일 제목 학술지(예: 「철학연구」)는 KCI에서 **발행기관**까지 같이 확인해야 정확히 인용할 수 있다 — `sereId` 직접 조회로 빠르게 식별.

---

### 1.2 RISS(학술연구정보서비스)

> 소스: https://www.riss.kr/

- **운영 주체**: KERIS(한국교육학술정보원, 대구혁신도시)
- **성격**: 국내 최대 통합 학술정보 검색 서비스. **학위논문**과 국내·국외 학술지 통합 검색이 강점
- **수록 규모(공식 안내 기준)**: 학위논문 약 64만 건, 학술지 논문 약 97만 건
- **핵심 기능**:
  - 학위논문 전문(全文) 다수 무료 제공 (대학 도서관 협약 기반)
  - 원문 미제공 자료는 **상호대차/원문복사 신청** 가능
  - 검색 결과 18개 언어 초록 번역 서비스 제공
- **추천 검색 시점**: 가장 먼저 들어가는 관문. 학위논문을 통해 **참고문헌 역추적**으로 핵심 1차 문헌을 빠르게 확보

---

### 1.3 DBpia

> 소스: https://www.dbpia.co.kr/

- **운영 주체**: 누리미디어 (1998년 시작, 2000년 5월 DBpia 브랜드 출범)
- **성격**: 국내 최대 규모 유료 원문 학술 DB. 전국 90% 이상 대학이 기관 구독
- **수록 규모(공식 안내 기준)**: 2,200여 종 간행물, 약 230만 편 원문 PDF
- **핵심 기능**:
  - 인용 표기: APA·MLA·Chicago 등 한국어/영어 자동 생성
  - 인용 관리 도구: **Citeasy(싸이티지)** — Word·한글에서 인용·참고문헌 자동 삽입
  - 내보내기: EndNote, RefWorks, BibTeX 형식 지원
- **활용 팁**: 학교 도서관 계정으로 접속해야 원문 무료. 캠퍼스 외부에서는 **VPN 또는 EZproxy** 경유 필수

---

### 1.4 교보스콜라(학지사·교보문고 스콜라)

> 소스: https://scholar.kyobobook.co.kr/

- **운영 주체**: 학지사 + 교보문고 협력 운영
- **성격**: 학회별 원문 DB. **DBpia에 없는 학회**의 독점 콘텐츠가 있어 보완 검색에 필수
- **수록 규모(공식 안내 기준)**: 850여 학회, 1,350여 종 간행물 (독점 계약 다수)
- **활용 팁**: DBpia에서 검색이 안 되는 학회·간행물은 교보스콜라에서 재검색한다. 특히 **교육학·인문학 소형 학회**는 교보스콜라 단독 수록인 경우가 많다.

---

## 2. 국제 인문학 데이터베이스 4종

### 2.1 PhilPapers

> 소스: https://philpapers.org/

- **운영 주체**: Centre for Digital Philosophy (University of Western Ontario)
- **성격**: 철학 전공 핵심 DB. 전 세계 철학 저널·단행본·아카이브를 종합 색인
- **akrasia 관련 검색 경로(검증된 카테고리 URL)**:
  - Weakness of Will: https://philpapers.org/browse/weakness-of-will
  - Aristotle: Weakness of Will: https://philpapers.org/browse/aristotle-weakness-of-will
  - Plato: Weakness of Will: https://philpapers.org/browse/plato-weakness-of-will
- **검색 팁**:
  - **Browse by topic** 기능으로 주제별 분류 트리 활용 → akrasia는 "Weakness of Will" 하위 트리
  - 키워드: `akrasia`, `weakness of will`, `epistemic akrasia`, `inverse akrasia`
  - 저자별 색인: Alfred Mele, Richard Holton, Donald Davidson, Christopher Bobonich 등 핵심 연구자 중심 검색
- **부속 서비스**: PhilArchive(philarchive.org) — 오픈 액세스 프리프린트 아카이브

---

### 2.2 JSTOR

> 소스: https://www.jstor.org/

- **성격**: 1,000개 이상 인문·사회·자연과학 학술지 아카이브. **고전 문헌·과거 호 접근**에 강점
- **주의**: "moving wall" 정책으로 **최신 1~3년 호는 제공하지 않는** 학술지가 많다. 최신 논문은 Project MUSE 또는 출판사 사이트 병행
- **활용 팁**: akrasia 연구의 고전 논문(예: Davidson 1969, Watson 1977 등)은 JSTOR 아카이브에 있을 가능성이 높음

---

### 2.3 Project MUSE

> 소스: https://muse.jhu.edu/

- **운영 주체**: Johns Hopkins University Press (1993년 설립, 1995년 온라인 출범)
- **성격**: 인문·사회과학 학술지·전자책 DB. JSTOR과 달리 **현재(current) 호** 제공
- **수록 규모(2024년 기준 공식)**: 800+ 학술지, 100,000+ 전자책 (400여 대학출판부·학회 참여)
- **활용 팁**: 최신 인문학 논문은 MUSE → 과거 호는 JSTOR 조합이 표준 패턴

---

### 2.4 Google Scholar

> 소스: https://scholar.google.com/

- **성격**: 학술 메타 검색. 모든 DB를 가로질러 검색되지만 **출처 신뢰도는 직접 확인** 필수
- **핵심 기능 — Cited by**:
  - 검색 결과 각 논문 하단 "Cited by N" 링크 → **해당 논문을 인용한 후속 연구** 목록 확인
  - 논문 1편을 기점으로 **앞(참고문헌) → 뒤(피인용)** 양방향 추적 가능
  - "Cited by"가 없으면 Google Scholar가 인용 데이터를 못 찾았을 뿐, 인용이 0이라는 뜻은 아니다
- **활용 팁**:
  - akrasia 연구에서 Donald Davidson "How is Weakness of the Will Possible?" 같은 고전 논문의 Cited by → 현대 연구자 지도 그리기
  - "Set up alert"로 **새 인용 알림** 메일 수신 가능

---

## 3. 도덕윤리교육 핵심 학술지 (KCI 등재 검증 완료)

> 모든 정보는 KCI 포털(www.kci.go.kr) 및 각 학회 공식 페이지에서 2026-05-03 기준 검증

| 학술지명 | 발행기관 | KCI 등급 | ISSN(P/E) | 비고 |
|---|---|---|---|---|
| 도덕윤리과교육 | 한국도덕윤리과교육학회 | 등재 | 1598-8708 / 2713-8224 | 1990 창간, 계간 |
| 윤리교육연구 | 한국윤리교육학회 | 등재 | 1738-0545 / 2733-8983 | 2000 창간 |
| 교육철학연구 | 한국교육철학학회 | 등재 | 1598-1568 / 2713-9107 | 연 4회 발행 |
| 철학 | 한국철학회 | **우수등재** | — | 한국 철학계 최고 권위 |
| 철학연구 | 철학연구회 | 등재 | — | 1966 창간, 계간 |
| 철학연구 | 대한철학회 | 등재 | — | 1965 창간 (한국 칸트학회 후신) |
| 범한철학 | 범한철학회 | 등재 | 1225-1410 / 2713-9344 | 계간, 연 4회 |

> **주의 — 「철학연구」 동명 학술지 구분 필수**
> 「철학연구」는 **두 학회**가 동일 제호로 발행한다. 인용·각주 표기 시 반드시 **발행기관**을 함께 명시한다.
> - 「철학연구」, 철학연구회, 제○○집, 연도
> - 「철학연구」, 대한철학회, 제○○집, 연도
> 또한 한국철학회의 학술지는 「철학」이며, 제호가 「철학연구」가 아니다 — 혼동 금지.

> **참고**: 도덕교육 분야에는 한국도덕교육학회(http://www.kssme.or.kr/)의 「도덕교육연구」도 KCI 등재지로 존재. 학술지명이 비슷하므로 발행기관 확인 필수.

---

## 4. akrasia 주제 검색 전략

### 4.1 키워드 조합 (한국어)

| 한국어 표현 | 비고 |
|---|---|
| 아크라시아 | 음역. 최근 논문에서 사용 빈도 증가 |
| 자제력 없음 | 직역. 표준 번역어 중 하나 |
| 의지박약 | 전통 번역. 일부 교재·번역서에서 사용 |
| 자제력 부족 / 자제하지 못함 | 풀어쓴 표현 |
| 무절제 | 아리스토텔레스 맥락에서 사용 (단, 의미 차이 있음) |

**검색 시 권장**: 위 표현을 OR 조합으로 묶어 폭넓게 검색한다.
예) `(아크라시아 OR "자제력 없음" OR 의지박약)`

### 4.2 키워드 조합 (영어)

| 영어 표현 | 활용 맥락 |
|---|---|
| akrasia | 표준 학술 용어 |
| weakness of will | akrasia의 표준 영어 번역 |
| akratic action | 행위 측면 강조 |
| epistemic akrasia | 인식론적 자제력 결여 — 최근 활발한 분과 |
| incontinence | 아리스토텔레스 영어 번역에서 사용 |

### 4.3 주제 결합 검색 (도덕교육 맥락)

```
국내 DB:
  (아크라시아 OR "자제력 없음" OR 의지박약) AND (도덕교육 OR 윤리교육)
  (아크라시아 OR "자제력 없음") AND 아리스토텔레스
  의지박약 AND (덕윤리 OR 인격교육)

국제 DB:
  akrasia AND moral education
  "weakness of will" AND virtue ethics
  akrasia AND Aristotle AND education
  "epistemic akrasia" AND moral
```

### 4.4 정렬 옵션 활용

| 정렬 방식 | 사용 시점 |
|---|---|
| **인용 횟수 정렬** (Cited by) | 분야의 핵심 문헌·고전 파악 시. 처음 주제에 진입할 때 |
| **최신순 정렬** | 최근 5년 연구 동향 파악 시. 선행 연구 검토 마지막 단계 |
| **관련도 정렬** (기본) | 키워드가 정확히 일치하는 문헌 우선 확인 시 |

**권장 순서**: 인용순 → 핵심 고전 5~10편 확보 → 최신순 → 최근 동향 5~10편 확보 → 양방향 인용 추적

### 4.5 학위논문 → 참고문헌 역추적

학부 논문에서 가장 효율적인 1차 문헌 확보 방법.

```
1단계: RISS에서 "akrasia" "자제력" "의지박약" 키워드로 학위논문 검색
2단계: 박사학위논문 우선 → 석사학위논문 보완
3단계: 해당 학위논문의 참고문헌 목록 확보
4단계: 참고문헌 중 반복 등장하는 저자·논문 식별 → 핵심 문헌 확정
5단계: 식별된 핵심 문헌을 다시 KCI/DBpia/PhilPapers에서 직접 확인
```

> **이유**: 박사학위논문의 참고문헌은 해당 주제의 표준 문헌 지도 역할을 한다. 신규 진입 연구자가 빠르게 분야 지형을 파악하는 가장 안전한 경로.

---

## 5. 검색 워크플로우 권장 순서

```
[1] KCI에서 핵심 학술지(7종) 등재 여부 재확인 + 학술지 내부 키워드 검색
        ↓
[2] RISS에서 학위논문 검색 → 박사학위논문 1~2편 참고문헌 확보
        ↓
[3] DBpia / 교보스콜라에서 ②에서 식별한 핵심 학술지 논문 원문 PDF 수집
        ↓
[4] PhilPapers "Weakness of Will" 카테고리 트리 탐색 + 저자별 색인
        ↓
[5] JSTOR(고전) + Project MUSE(최신)로 영문 1차 문헌 보강
        ↓
[6] Google Scholar "Cited by"로 ④⑤ 핵심 논문의 후속 연구 추적
        ↓
[7] DBpia Citeasy 또는 EndNote로 인용 정리 → 논문 작성
```

---

## 6. 흔한 실수 패턴

| 실수 | 올바른 접근 |
|------|-------------|
| 「철학연구」를 발행기관 명시 없이 인용 | 철학연구회 / 대한철학회 발행 여부 반드시 표기 |
| KCI 등재 여부 확인 없이 인용 | 학부 논문이라도 등재(후보)지 우선 인용 권장 |
| Google Scholar "Cited by" 숫자만 보고 신뢰도 판단 | 출판 매체(학술지/출판사) 신뢰도 별도 확인 |
| 한국어 키워드 1개만 검색 | 음역·번역·풀어쓴 표현을 OR로 조합 검색 |
| JSTOR에서 최신 논문이 안 보인다고 자료 부족으로 결론 | moving wall 정책으로 최신 호 미수록일 가능성 → MUSE 병행 |
| 원문 PDF 무한 다운로드 시도 | 캠퍼스 외부에서는 학교 도서관 VPN/EZproxy 경유 필수 |
| "아크라시아"만 검색 | "자제력 없음" "의지박약" "incontinence" 모두 OR로 묶기 |

---

## 7. 도구별 결과 내보내기 (인용 관리)

| DB | 지원 형식 | 비고 |
|---|---|---|
| KCI | RIS, BibTeX, EndNote | 논문 상세 페이지에서 다운로드 |
| RISS | RIS, EndNote, 한글/Word | 검색 결과에서 일괄 내보내기 가능 |
| DBpia | RIS, EndNote, BibTeX, Citeasy 직접 연동 | Word·한글에 인용 자동 삽입 |
| PhilPapers | BibTeX, EndNote, RIS | 무료 계정 가입 시 개인 라이브러리 관리 |
| JSTOR | RIS, BibTeX, MARC | "Cite this Item" 메뉴 |
| Project MUSE | RIS, BibTeX | 논문 페이지 "Download" 메뉴 |
| Google Scholar | BibTeX, EndNote, RefMan, RefWorks | 인용 아이콘 클릭 |

> **권장**: 학부 논문은 Zotero(무료) + 학교가 제공하는 EndNote 중 택일. DBpia Citeasy는 한국어 인용 형식이 정확해 한국어 논문 작성에 유리.
