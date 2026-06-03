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

## 8. Helpful Content System — Google 공식 자가 점검 질문

2022년 시작, 2024-03에 코어 알고리즘에 통합. 현행 Google Search Central 문서에 게시된 32개 자가 점검 질문은 4개 묶음으로 나뉜다.

### 8-1. Content and Quality (콘텐츠·품질)

- 원본 정보·취재·연구·분석이 있는가?
- 주제에 대해 *충분히 완전한* 설명을 제공하는가?
- 다른 글의 단순 재가공이 아니라 *부가가치*를 더했는가?
- 헤드라인이 과장(클릭베이트) 아닌가?
- 친구·가족·동료에게 추천할 만한 글인가?

### 8-2. Expertise (전문성)

- 명확한 출처가 표기되어 있는가?
- 저자의 배경·자격이 노출되어 있는가?
- 저자가 해당 주제의 *인정받는 권위자*인가?
- 사실 오류가 쉽게 발견되는가?

### 8-3. Presentation and Production (표현·제작)

- 맞춤법·문법 오류가 없는가?
- 대량 자동 생산처럼 보이지 않는가?
- 다수 작성자가 손대 일관성이 깨졌는가?
- 광고가 본문 가독성을 방해하는가?
- 모바일에서도 잘 읽히는가?

### 8-4. People-First (사람 우선)

- 정해진 대상 독자가 있는가?
- 독자가 *목표를 달성한 만족감*을 얻고 떠나는가?
- 검색 엔진을 위해 작성된 것은 아닌가?
- 트렌드 키워드를 따라 *전문 영역 밖* 주제까지 만들고 있지 않은가?

> 핵심 판단: "검색 결과 1위만 노린 글"이 아니라 "사람이 검색 없이도 찾아와서 만족할 글"이라야 한다.

---

## 9. 신뢰 신호 체크리스트 (사이트 운영자용)

### 9-1. 기술적 신뢰 신호

- [ ] HTTPS + 유효 인증서
- [ ] 광고 도메인 분리 / iframe 최소화
- [ ] 결제 페이지 PCI DSS 준수
- [ ] 모바일 친화 (Core Web Vitals 통과)
- [ ] 사이트맵·robots.txt 정상

### 9-2. 콘텐츠 신뢰 신호

- [ ] 모든 글에 byline + datePublished + dateModified
- [ ] 통계·인용에 출처 링크
- [ ] 외부 권위 소스 인용 (정부·학회·공식 문서)
- [ ] 광고·제휴 콘텐츠 명확 표시
- [ ] 오래된 글의 정기적 업데이트 (의료·금융 12개월 권장)

### 9-3. 사이트 구조 신뢰 신호

- [ ] About Us (충분히 상세)
- [ ] Contact (실제 접근 가능 수단)
- [ ] 저자 프로필 페이지 (한 명도 빠짐없이)
- [ ] 편집 가이드라인·정정 정책
- [ ] 개인정보처리방침·이용약관
- [ ] 한국 사이트: 사업자 정보·통신판매업 신고번호 푸터 표시

### 9-4. 외부 평판 신호

- [ ] 외부 사이트에서 *자연스러운* 언급·인용
- [ ] Wikipedia 항목 (해당되면)
- [ ] Knowledge Graph 등록 (Organization·Person 스키마)
- [ ] 동일 저자가 다른 권위 사이트에 기고
- [ ] 업계 표창·인증

---

## 10. GEO·AI 검색과 E-E-A-T 시너지

생성형 AI 검색(ChatGPT Search, Perplexity, Google AI Overviews, Bing Copilot 등)이 답변을 만들 때 *출처 신뢰도*를 평가한다. E-E-A-T가 강한 사이트는 *AI 인용 친화도*가 함께 올라간다.

| 시그널 | 전통 SEO | AI 검색(GEO) |
|--------|---------|--------------|
| 저자 정보 | E-E-A-T 점수 | "Who said this?" — AI 답변에 저자 인용 |
| 구조화 데이터 | Rich Result | AI가 사실 추출에 사용 |
| dateModified | 신선도 신호 | "최근 업데이트된 권위 출처" 우선 |
| 외부 권위 인용 | 백링크 + Trust | AI가 사실 검증 시 참조 |

→ 별도 스킬 `seo/geo-ai-discoverability`(가칭)와 강하게 연계된다. 본 스킬은 *콘텐츠 측 기반* 담당.

---

## 11. 흔한 실수 패턴

### 11-1. 페널티 트리오

> 익명 저자 + AI 대량 생성 + 광고 도배 — 이 세 가지가 동시에 잡히면 거의 확실한 강등.

| 패턴 | 왜 위험한가 |
|------|-------------|
| **익명·가명만 박힌 글** | YMYL이면 Trust 직격타 |
| **"AI가 작성, 사람 검토 0"** | scaled content abuse 후보 |
| **광고가 본문보다 큰 면적** | UX·Trust 양쪽에서 감점 |

### 11-2. 자주 빠뜨리는 요소

| 실수 | 영향 |
|------|------|
| 게시일만 있고 업데이트일 없음 | 오래된 정보가 그대로 노출 → Trust ↓ |
| 통계 인용에 출처 링크 없음 | Expertise 검증 불가 |
| 저자 프로필 페이지 없이 byline만 | 평가자가 자격 확인 불가 |
| About Us 한 문단 | QRG 기준에서 *부족* |
| YMYL 분야에 면책 조항 없음 | 책임 회피 — 신뢰 감점 |
| 한국 사이트 사업자 정보 숨김 | 법적 의무 위반 + 신뢰 직격타 |
| 환불·교환 정책 모호 | 이커머스 Trust 핵심 약점 |

### 11-3. 콘텐츠 길이 부풀리기

> 주의: thin content를 단순히 길게 늘리는 것은 Helpful Content 기준에서 *부정적* 신호다.

- 같은 말을 다르게 반복 (워드 카운트 올리려고)
- "결론부터 말하면" → 결론을 미루는 도입부
- 키워드만 채운 H2/H3 남발
- 인용·통계 없이 일반론만 나열

대신: *원본 정보·1인칭 경험·실제 데이터*를 추가하는 방향이 맞다.

---

## 12. E-E-A-T 자가 진단 체크리스트 30문항

각 항목을 PASS / PARTIAL / FAIL로 채점한다. PASS 비율이 70% 이상이면 양호, 50% 미만이면 개선 필요.

### A. 사이트 차원 (10문항)

1. About Us 페이지가 *2문단 이상* 자세히 작성되어 있다
2. Contact 페이지에 실제 응답 가능한 연락 수단이 있다
3. 사이트 운영 주체(회사·개인)가 명확히 공개되어 있다
4. 사명·운영 목적이 명시되어 있다
5. 광고·제휴 정책이 별도 페이지로 공개되어 있다
6. 편집·정정 가이드라인이 공개되어 있다
7. AI 사용 정책이 공개되어 있다 (해당하는 경우)
8. HTTPS + 유효 인증서가 적용되어 있다
9. 개인정보처리방침·이용약관이 최신이다
10. **(한국 사이트)** 사업자 정보·통신판매업 신고번호가 푸터에 노출되어 있다

### B. 저자·콘텐츠 차원 (10문항)

11. 모든 본문 페이지에 저자 byline이 있다
12. 저자별 독립 프로필 페이지가 존재한다
13. 저자 프로필에 200자 이상 약력·자격이 적혀 있다
14. 저자 프로필에 외부 프로필(LinkedIn 등) 링크가 있다
15. Article·Person 구조화 데이터가 적용되어 있다
16. 모든 글에 `datePublished` + `dateModified`가 있다
17. YMYL 분야는 자격·전문가 검토 표시가 있다
18. 통계·인용에 *공식* 출처 링크가 있다
19. 1인칭 경험·디테일이 들어간 글이 다수 있다
20. 같은 주제의 단순 재가공이 아닌 *원본 가치*가 있다

### C. AI·신뢰 운영 차원 (10문항)

21. AI 사용 시 사람 편집·검증 단계가 있다
22. AI 생성 사진을 사용 시 *AI 생성임을 공개*한다
23. AI 생성 콘텐츠 비율이 *대량 자동화 수준이 아니다*
24. 환불·교환·면책 조항이 명확하다
25. 광고와 본문이 시각적으로 명확히 구분된다
26. 사용자 리뷰·코멘트 모더레이션 정책이 있다
27. 오래된 글(12개월+)을 정기적으로 업데이트한다
28. 외부 권위 사이트에서 자연스러운 인용·언급이 있다
29. 부정확 정보 발견 시 정정 절차가 작동한다
30. *검색 노출 목적*이 아닌 *독자 가치* 중심 콘텐츠 비율이 높다

---

## 13. 빠른 시작 — 일주일 액션 플랜

| 일차 | 작업 |
|------|------|
| Day 1 | About Us·Contact 페이지 보강, 푸터 사업자 정보 점검 |
| Day 2 | 저자 프로필 페이지 작성(전 저자) — 자격·외부 링크·사진 |
| Day 3 | Article + Person 구조화 데이터 추가, `datePublished`/`dateModified` 확인 |
| Day 4 | 편집 가이드라인·AI 사용 정책 페이지 신설 |
| Day 5 | 상위 10개 트래픽 글 점검 — 출처 인용·byline·업데이트일 |
| Day 6 | YMYL 글에 전문가 검토·면책 조항 추가 |
| Day 7 | 30문항 자가 진단 → 개선 백로그 정리 |

---

## 14. 참고

- Google Search Quality Rater Guidelines PDF: https://services.google.com/fh/files/misc/hsw-sqrg.pdf
- Google: Creating Helpful Content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google: Generative AI Content Guidance: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- 2022-12 E-E-A-T 도입 블로그: https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t
- 2023-11 QRG 업데이트 블로그: https://developers.google.com/search/blog/2023/11/search-quality-rater-guidelines-update
