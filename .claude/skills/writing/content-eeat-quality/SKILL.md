---
name: content-eeat-quality
description: >
  Google의 Quality Rater Guidelines(QRG)와 Helpful Content System에 기반한 콘텐츠 신뢰성·전문성 평가 프레임워크 E-E-A-T를 정리한 스킬. 일반 콘텐츠 사이트(블로그·매체·SaaS·이커머스) 관점에서 Experience·Expertise·Authoritativeness·Trustworthiness 4축을 어떻게 콘텐츠와 사이트 구조에 반영하는지, AI 생성 콘텐츠를 어떻게 다뤄야 하는지, 한국 사이트 특유의 신뢰 신호는 무엇인지 다룬다.
  <example>사용자: "우리 블로그에 E-E-A-T 적용하려는데 뭐부터 손대야 해?"</example>
  <example>사용자: "AI로 글 쓰고 있는데 Google에서 페널티 받을까?"</example>
  <example>사용자: "의료 블로그인데 신뢰도 점수 올리려면 어떤 페이지를 추가해야 해?"</example>
---

# 콘텐츠 E-E-A-T 품질 — Google Quality Rater Guidelines 기반 신뢰성 강화

> 소스:
> - Google Search Quality Rater Guidelines (현행 PDF): https://services.google.com/fh/files/misc/hsw-sqrg.pdf
> - 2022-12 E-E-A-T 도입 공식 블로그: https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t
> - Helpful Content / People-First Content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
> - 생성 AI 콘텐츠 가이드라인: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
> - QRG 업데이트 블로그(2023-11): https://developers.google.com/search/blog/2023/11/search-quality-rater-guidelines-update
> 검증일: 2026-06-02
> 적용 범위: Quality Rater Guidelines 2025-09-11판 기준

---

## 0. 이 스킬을 언제 쓰는가

- 블로그·매체·뉴스레터·SaaS 마케팅 사이트의 신뢰도를 점검할 때
- AI를 활용한 콘텐츠 제작 워크플로우를 설계할 때
- 의료·금융·법률·교육 등 YMYL 영역에서 콘텐츠를 발행할 때
- Google 코어 업데이트 이후 트래픽이 빠진 사이트의 원인을 진단할 때
- SEO/GEO 작업과 함께 콘텐츠 품질 baseline을 정의할 때

학술 논문 작성·인용은 다루지 않는다(별도 스킬군: `writing/academic-paper-structure-humanities` 등).

---

## 1. E-E-A-T 정의와 진화

### 1-1. 4요소

| 약자 | 의미 | 핵심 질문 | 한 줄 요약 |
|------|------|-----------|------------|
| **E**xperience | 직접 경험 | "글쓴이가 실제로 해봤는가?" | 1인칭 경험·사진·날짜·구체 디테일 |
| **E**xpertise | 전문성 | "주제에 대한 깊은 지식이 있는가?" | 자격·경력·기술적 정확성 |
| **A**uthoritativeness | 권위 | "이 주제의 신뢰 가능한 출처로 인용되는가?" | 백링크·언급·표창·도메인 평판 |
| **T**rustworthiness | 신뢰 | "이 사이트·페이지를 믿을 수 있는가?" | 정확성·투명성·안전·면책 |

### 1-2. 진화 타임라인

| 시점 | 변화 |
|------|------|
| 2014 | E-A-T 최초 도입 (Expertise·Authoritativeness·Trustworthiness) |
| 2022-12-15 | Experience(E) 추가 → E-E-A-T 4요소로 확장 |
| 2023-11 | QRG 업데이트 — E-E-A-T 적용 예시 확장 |
| 2024-03 | Helpful Content System이 코어 알고리즘에 통합, scaled content abuse 정책 도입 |
| 2025-09-11 | 현행 QRG 182쪽 — YMYL Government/Civics/Society 정의 추가, AI Overviews 평가 챕터 신설 |

### 1-3. **E-E-A-T는 직접 랭킹 신호가 아니다**

> 주의: E-E-A-T는 알고리즘 안의 단일 점수가 아니다.

Google 공식 입장:
- QRG는 검색 *랭킹 시스템 평가*를 위해 사람 평가자(Quality Rater)가 사용하는 가이드
- 평가자의 점수가 직접 페이지 랭킹을 바꾸지 않는다
- 대신 Google이 "이런 콘텐츠를 보상하는 시스템"을 설계할 때 *방향*을 제시

**실무 함의:** "E-E-A-T 점수를 올린다"는 표현보다 "E-E-A-T가 신호로 잡힐 만한 콘텐츠·사이트 구조를 만든다"가 정확하다.

---

## 2. Trustworthiness가 최상위인 이유

### 2-1. Google 공식 표현

> "Trust is the most important member of the E-E-A-T family because untrustworthy pages have low E-E-A-T no matter how Experienced, Expert, or Authoritative they may seem."
> — Quality Rater Guidelines (Section 3.4 부근)

### 2-2. 시각 모델

```
        ┌─────────────────┐
        │      Trust      │  ← 최상위. 깨지면 나머지 무의미
        ├─────┬─────┬─────┤
        │  E  │  E  │  A  │  ← Trust를 지탱하는 3개 기둥
        │ xp. │ xp. │ uth.│
        └─────┴─────┴─────┘
```

### 2-3. Trust가 깨지는 시나리오

| 상황 | 결과 |
|------|------|
| 전문가가 작성했지만 정보가 부정확 | Trust ❌ — 다른 E·E·A 무의미 |
| 권위 있는 사이트지만 결제 페이지가 HTTPS 아님 | Trust ❌ |
| 경험·전문성 모두 우수하지만 광고와 본문 구분이 모호 | Trust ⚠️ |
| 사기성 콘텐츠 — "사기 전문가가 사기 글 작성" | Trust ❌ — 분명한 사례 (QRG 명시) |

### 2-4. Trust의 4대 구성요소

1. **정확성(Accuracy)** — 사실 오류·출처 미상 통계 없음
2. **안전(Safety)** — HTTPS, 결제 보안, 악성 다운로드 없음
3. **투명성(Transparency)** — 누가·왜·어떻게 운영하는지 공개
4. **책임성(Accountability)** — 연락처·정정 절차·면책 조항

---

## 3. Experience — 2022 신규 요소

### 3-1. Experience가 추가된 배경

기존 E-A-T는 "전문가만 평가 가능"이라는 한계가 있었다. 일반 사용자의 *직접 경험*도 가치 있다는 인식이 반영되어 2022-12-15에 Experience가 추가되었다.

### 3-2. 주제별 Experience 적용 예시

| 주제 유형 | Experience 시그널 |
|-----------|-------------------|
| **제품 리뷰** | 실제 구매·개봉·사용 사진, 사용 기간, 단점 언급 |
| **여행기** | 방문 날짜, 현장 사진(메타데이터 포함), 동행자·날씨 등 디테일 |
| **의료 정보** | 환자 본인 경험 vs 의사 임상 경험 — 둘 다 가치 있지만 *맥락 다름* |
| **소프트웨어 튜토리얼** | 실제 실행 스크린샷, 에러 메시지 원문, 해결 과정 |
| **음식점 리뷰** | 영수증·메뉴 사진·방문 시각·동행 인원 |

### 3-3. Experience를 증명하는 구체 디테일

- 구체 날짜·시각 ("2026년 3월 화창한 토요일 오후")
- 1인칭 서술 ("내가 도착했을 때 줄이 30명쯤이었다")
- 비교 ("이전에 쓰던 X와 비교하면…")
- 단점·실패 언급 (광고성 글은 단점을 거의 안 적는다)
- EXIF 메타데이터가 살아있는 본인 사진

### 3-4. **Experience가 항상 우월하지는 않다**

> 주의: 주제에 따라 Expertise가 Experience보다 중요한 경우가 있다.

- 세무 신고법: 환자 1명의 경험 < 회계사 1명의 전문 지식
- 약물 상호작용: 사용자 후기 < 임상 의사 검토
- 법률 절차: 1회 경험자 < 전문 변호사

**판정 기준:** 주제가 *반복 가능한 일반 정보*인가, *개별 사례 경험*인가에 따라 다르다.

---

## 4. 저자(Author) 표기 — E-E-A-T 코어 신호

### 4-1. 필수 요소 체크리스트

- [ ] **byline**: 모든 본문 페이지에 글쓴이 이름 노출
- [ ] **저자 프로필 페이지**: `/author/{slug}` 형태의 독립 페이지
- [ ] **자격·약력·경력**: 200자 이상의 진짜 소개
- [ ] **프로필 사진**: 익명 아바타가 아닌 실제 인물 사진
- [ ] **외부 프로필 링크**: LinkedIn, X, GitHub, 학회 페이지 등
- [ ] **연락 수단**: 이메일 또는 폼
- [ ] **저자별 글 목록**: 동일 저자의 다른 글 인덱스

### 4-2. Schema.org 구조화 데이터

```html
<!-- Article 페이지 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "글 제목",
  "datePublished": "2026-06-02T09:00:00+09:00",
  "dateModified": "2026-06-02T09:00:00+09:00",
  "author": {
    "@type": "Person",
    "@id": "https://example.com/author/hong-gildong#person",
    "name": "홍길동",
    "url": "https://example.com/author/hong-gildong"
  },
  "publisher": {
    "@type": "Organization",
    "name": "사이트명",
    "url": "https://example.com"
  }
}
</script>
```

```html
<!-- 저자 프로필 페이지 — Person 본체 1번만 정의 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://example.com/author/hong-gildong#person",
  "name": "홍길동",
  "image": "https://example.com/images/hong-gildong.jpg",
  "jobTitle": "내과 전문의",
  "affiliation": {
    "@type": "Organization",
    "name": "○○대학교 의료원"
  },
  "alumniOf": "○○대학교 의과대학",
  "sameAs": [
    "https://www.linkedin.com/in/hong-gildong",
    "https://x.com/honggildong",
    "https://scholar.google.com/citations?user=XXXX"
  ]
}
</script>
```

**핵심 원칙:**
- Person 본체는 *저자 프로필 페이지 1곳*에만 두고, 다른 글에서는 `@id`로 참조
- 변경이 생기면 한 곳만 업데이트하면 된다 (DRY)

### 4-3. YMYL 분야의 자격증 명시

| 분야 | 권장 표기 |
|------|-----------|
| 의료 | "내과 전문의, 의사면허번호 ○○○○○" + "Medically reviewed by Dr. ○○○" |
| 금융 | "공인재무설계사(CFP), AFPK 자격" |
| 법률 | "변호사, 대한변호사협회 등록번호 ○○○○" |
| 세무 | "공인회계사 / 세무사 자격 보유" |
| 부동산 | "공인중개사, 등록번호 ○○○○○" |

### 4-4. 익명·가명 처리

| 케이스 | 권장 처리 |
|--------|-----------|
| 개인정보 노출 위험 큰 분야(정치·내부고발) | 가명 + 편집부 책임 명시 + 검증 절차 공개 |
| 일반 블로그 익명 | YMYL 영역이면 신뢰도 하락 — 실명 권장 |
| 회사 공식 블로그 | 부서명·팀명 byline 가능 (예: "OO팀") + 회사 책임 명시 |

---

## 5. About Us · Contact · 신뢰 페이지

### 5-1. "Who, Why, How" 프레임워크

Google이 헬프 문서에서 직접 제시하는 3가지 질문:

- **Who** — 누가 이 콘텐츠를 만들었는가? (저자 byline, 회사 소개)
- **Why** — 왜 이 콘텐츠를 만들었는가? (사명, 독자에게 어떤 도움)
- **How** — 어떻게 만들었는가? (편집 프로세스, AI 사용 여부, 출처 검증 절차)

### 5-2. About Us 페이지 필수 요소

- 회사·매체의 사명(mission)과 운영 주체
- 설립일·역사
- 핵심 인물 소개 (편집장·CEO·주요 기여자)
- 편집 가이드라인 (별도 페이지 링크)
- 광고·제휴·후원 정책 공개
- 외부 인증·수상·언론 인용

> 주의: 한 문단짜리 About Us는 Google 평가자 기준에서 *불충분*하다.

### 5-3. Contact 페이지 최소 요건

- 이메일 주소 또는 폼
- 운영 주체 회사명·대표자
- 사업장 주소 (가능한 경우)
- 전화번호 (이커머스·금융 등 강력 권장)

### 5-4. 편집·교정 프로세스 공개 페이지

E-E-A-T 강한 매체가 갖는 페이지:

- **Editorial Guidelines** — 작성 원칙·취재 윤리
- **Fact-Checking Policy** — 사실 확인 절차
- **Corrections Policy** — 오류 발견 시 정정 방법
- **AI Usage Disclosure** — AI 활용 범위 (2024 이후 권장)
- **Sponsored Content Policy** — 광고와 본문 구분 기준

### 5-5. 한국 사이트 특유의 신뢰 페이지 (필수 / 권장)

| 항목 | 법적 의무 | 표시 위치 |
|------|----------|-----------|
| 사업자등록번호 | 전자상거래법 | 푸터 |
| 대표자명 | 전자상거래법 | 푸터 |
| 사업장 주소 | 전자상거래법 | 푸터 |
| 통신판매업 신고번호 | 전자상거래법 (판매 사이트) | 푸터 + 공정거래위원회 조회 링크 |
| 연락처(전화·이메일) | 전자상거래법 | 푸터·Contact |
| 개인정보처리방침 | 개인정보보호법 | 푸터 별도 페이지 |
| 이용약관 | 권장 | 푸터 |
| 환불·교환 정책 | 권장 (의무인 경우 있음) | 푸터·Contact |

> 한국 이커머스 사이트는 푸터의 사업자 정보 박스가 *그 자체로 강한 신뢰 신호*다. 정부 공식 등록 정보와 연결되기 때문이다.

---

## 6. YMYL 콘텐츠 — 더 엄격한 E-E-A-T

### 6-1. YMYL 영역 (QRG 2025-09 기준)

| 카테고리 | 예시 |
|----------|------|
| **Health & Safety** | 의료, 약물, 정신건강, 응급 처치 |
| **Financial** | 투자, 세금, 대출, 보험, 암호화폐 |
| **Legal** | 법률 자문, 비자, 권리, 분쟁 |
| **Government/Civics/Society** | 투표, 공공 서비스, 법규 (2025-09 명칭 명확화) |
| **News & Current Events** | 정치·국제·중대 사건 |
| **Shopping (고가)** | 결제 정보가 오가는 큰 거래 |

### 6-2. YMYL 강화 체크리스트

- [ ] 저자의 자격증·전문 경력 명시
- [ ] 의료/법률은 *별도 전문가 검토* 표시 ("Medically reviewed by ...")
- [ ] 출처는 정부·학회·peer-reviewed 저널 우선
- [ ] 최근 업데이트 날짜 표시 (`dateModified`)
- [ ] 면책 조항 — "본 글은 일반 정보 제공 목적이며, 개별 상담은 전문가에게 문의하세요"
- [ ] 응급 상황 안내 (의료 콘텐츠는 119/응급실 안내 권장)

### 6-3. YMYL은 별도 스킬에서 더 자세히

→ 별도 스킬 `seo/ymyl-content-seo`(가칭)에서 분야별 디테일 다룸. 본 스킬은 *프레임워크* 수준에서만 다룬다.

---

## 7. AI 생성 콘텐츠와 E-E-A-T

### 7-1. Google 공식 입장 (2023-02 블로그 + 현행 가이드)

> "AI 사용 자체는 페널티가 아니다. 핵심은 *Helpful Content*다."

| 행위 | Google 평가 |
|------|-------------|
| AI를 글쓰기 보조로 사용 + 사람 편집·검증 | OK |
| AI로 빠른 초안 작성 후 전문가 검토·재집필 | OK |
| AI로 대량 생성 + 검증 없이 발행 | **scaled content abuse — 페널티** |
| AI 콘텐츠로 검색 노출만 노린 사이트 | 스팸 정책 위반 |

### 7-2. Scaled Content Abuse 정책 (2024-03)

- 정의: "랭킹 조작 목적의 대량 콘텐츠 생산 — 자동화·사람·혼합 무관"
- 2024-03 코어 업데이트로 강제 — 영향 받은 일부 사이트 50~80% 트래픽 감소
- 핵심 기준: **양이 아니라 의도와 결과 가치**

### 7-3. AI 안전 사용 워크플로우

```
[1] 주제·아웃라인 — 사람 작성
[2] 초안 — AI 보조 가능
[3] 사실 확인 — 사람 + 공식 출처 검증
[4] 1인칭 경험·디테일 추가 — 사람 (Experience 신호)
[5] 전문가 검토 — YMYL이면 필수
[6] 최종 편집 — 사람
[7] AI 사용 공개 — Editorial 페이지 + 필요 시 글 하단
```

### 7-4. AI 사용 공개(Disclosure) 모범 예시

```
이 글은 ChatGPT(GPT-4)로 초안을 작성한 뒤,
편집자 ○○○이 자료 검증·재집필을 거쳐 게재되었습니다.
사실 확인 출처는 본문 하단 [참고자료]에 명시되어 있습니다.
```

> 주의: "Edited by AI" 한 줄만 박고 사람 검토가 없는 것은 *공개의 의미를 잃는다*. Helpful Content 기준에서 부정적 신호다.

### 7-5. **흔한 함정 — 셀프 검증 부재**

| 함정 | 결과 |
|------|------|
| AI가 만든 통계·인용을 그대로 사용 | 환각으로 인한 사실 오류 → Trust ❌ |
| AI 생성 사진을 직접 촬영한 것처럼 사용 | Experience 신호 위반 + 신뢰 붕괴 |
| 같은 AI 프롬프트로 50개 사이트 운영 | 명백한 scaled content abuse |
| AI가 쓴 "전문가" 자격으로 YMYL 콘텐츠 발행 | 자격 사칭 — 가장 강한 페널티 신호 |

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
