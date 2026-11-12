---
name: content-eeat-quality
description: >
  Google Quality Rater Guidelines(QRG) 2025-09-11판 기준 E-E-A-T·YMYL 판단에서 모델이 틀리기 쉬운 정정 사항과 한국 사이트 신뢰 신호.
  현행 YMYL 4유형(구판 6분류 아님)·스펙트럼 개념("Many or most topics are not YMYL"), Trust 최상위 원문, 없는 인용문·없는 챕터 정정,
  scaled content abuse 원문, Helpful Content 질문 묶음 현행 구성, schema.org 의료·법률 마크업 정정, 한국 전자상거래 푸터 정보·의료법 제56·57조·금소법 제22조·변호사법 제112조·공정위 추천보증 심사지침·위기 자원 안내.
  <example>사용자: "우리 블로그에 E-E-A-T 적용하려는데 뭐부터 손대야 해?"</example>
  <example>사용자: "AI로 글 쓰고 있는데 Google에서 페널티 받을까?"</example>
  <example>사용자: "의료 블로그인데 YMYL 범주랑 한국 광고 규정 기준으로 점검해줘"</example>
---

# E-E-A-T·YMYL — QRG 2025-09-11판 정정 사항과 한국 신뢰 신호

> 소스:
> - Google Search Quality Rater Guidelines 전문 (현행 2025-09-11판, 182쪽): https://static.googleusercontent.com/media/guidelines.raterhub.com/en//searchqualityevaluatorguidelines.pdf
> - QRG *요약본* "Search Quality Rater Guidelines: An Overview" (2023-11, 36쪽): https://services.google.com/fh/files/misc/hsw-sqrg.pdf
>   > 주의 (2026-09-26 정정): 이전 판은 hsw-sqrg.pdf를 "현행 QRG PDF"로 표기했으나 이는 2023-11 **개요 문서**다. 인용·쪽수는 위 전문 PDF 기준.
> - 2022-12 E-E-A-T 도입 공식 블로그: https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t
> - Helpful Content / People-First Content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
> - 생성 AI 콘텐츠 가이드라인: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
> - QRG 업데이트 블로그(2023-11): https://developers.google.com/search/blog/2023/11/search-quality-rater-guidelines-update
> - YMYL 한국 규정·schema.org (구 ymyl-content-seo, 검증일 2026-11-09): https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf · schema.org MedicalWebPage / MedicalCondition / LegalService / InvestmentOrDeposit · 국가법령정보센터 의료법 제56조·제57조, 의료법 시행령 제24조, 금융소비자 보호에 관한 법률 제22조, 변호사법 제112조, 표시·광고의 공정화에 관한 법률 · 금융위원회 금융광고규제 가이드라인, 대한변호사협회 변호사 광고에 관한 규정 (2025-02-06 개정 — 2026-09-26 미대조) · 보건복지부 자살예방 보도준칙 4.0, 한국생명존중희망재단
> 검증일: 2026-11-06
> 적용 범위: Quality Rater Guidelines 2025-09-11판 기준 (2026-11-06 전문 PDF 재확인 시에도 최신판 — Last-Modified 2025-09-11, 182쪽)

---

## 1. QRG·E-E-A-T — 자주 틀리는 사실

- **E-E-A-T는 직접 랭킹 신호(단일 점수)가 아니다.** QRG 는 랭킹 시스템을 평가하는 사람 평가자용 지침이고, 평가자 점수가 페이지 랭킹을 바꾸지 않는다. "점수를 올린다"가 아니라 "신호로 잡힐 구조를 만든다".
- Experience(E)는 **2022-12-15** 추가(Search Central Blog 원문). 최초 E-A-T 도입 연도(2014)는 2026-09-26 1차 미대조.
- **Trust 최상위** — QRG 2025-09-11판 §3.4 원문: "Trust is the most important member of the E-E-A-T family because untrustworthy pages have low E-E-A-T no matter how Experienced, Expert, or Authoritative they may seem." 바로 뒤 예시: "a financial scam is untrustworthy, even if the content creator is a highly experienced and expert scammer".
- Experience 가 항상 우월하지는 않다 — 세무·약물 상호작용·법률 절차처럼 반복 가능한 일반 정보는 Expertise 가 앞선다.

> 주의 (2026-09-26 정정): 이전 판의 "2025-09-11판에 AI Overviews 평가 챕터 신설"은 전문 PDF(182쪽)에서 "AI Overview" 문구가 한 번도 나오지 않아 삭제했다. 생성형 AI는 §2.x 정의·Lowest 품질(scaled content abuse) 판단 부분에서 다룬다.

> 주의 (2026-09-26 정정): 이전 판의 따옴표 인용 *"highest E-E-A-T standards"*는 QRG 전문(182쪽)에 없는 문구다. 원문은 명확한 YMYL 주제 페이지에 "the most scrutiny"를 요구하고 "a high level of E-E-A-T may be required"라고 서술한다(§2.3, §7.3). 요약 표현으로만 사용할 것. (구 ymyl-content-seo)

- About Us·연락처는 QRG §2.5.3 기준 *목적에 비해 충분한지*를 볼 뿐 분량 기준이 없다 — "한 문단이면 불충분"은 QRG 문구가 아닌 실무 해석(2026-09-26 보완).

## 2. YMYL — 현행 4유형과 스펙트럼

| 유형 (QRG §2.3 원문 명칭) | 원문 정의 요약 | 예시 |
|----------|------|------|
| **YMYL Health or Safety** | 정신·신체·정서 건강 또는 물리적·온라인 안전을 해칠 수 있는 주제 | 심장마비 증상, 약물, 정신건강, 자해/자살, 지진 시 대처 |
| **YMYL Financial Security** | 자신과 가족을 부양할 능력을 해칠 수 있는 주제 | 투자, 세금, 대출, 보험, 은퇴 |
| **YMYL Government, Civics & Society** | 집단·공공 이익·공공기관 신뢰·선거와 투표 정보 등 | 투표 자격, 운전면허 취득 요건, 복지 정책 |
| **YMYL Other** | 사람을 해치거나 사회 복리에 부정적인 기타 주제 | — |

> 주의 (2026-09-26 정정): 이전 판의 6분류(Health & Safety / Financial / **Legal / News & Current Events / Shopping**)는 **구판 QRG 분류**다. 현행판은 위 4유형이며, 법률·뉴스·고가 쇼핑은 해당 주제가 위 유형의 피해를 줄 수 있을 때 YMYL로 판단한다.
>
> 주의: YMYL은 **스펙트럼**이다. QRG 원문: "it may be helpful to think of topics as clear YMYL, definitely not YMYL or something in between. Pages on clear YMYL topics require the most scrutiny" — 또한 "Many or most topics are not YMYL".

해(harm)의 잠재성(개인 건강 → 개인 재정 → 타인 안전 → 사회 후생)이 높을수록 "high level" / "very high level of E-E-A-T"와 "the most scrutiny"가 요구된다.

## 3. AI 생성 콘텐츠 — 원문 기준

- AI 사용 자체는 페널티가 아니다 — 이것은 Google 입장의 **요약**이며 따옴표 직접 인용이 아니다. QRG 원문: "the use of Generative AI tools alone does not determine the level of effort or Page Quality rating". QRG 는 저노력 생성 AI 양산을 Lowest 로 평가하도록 지시한다.
- **Scaled content abuse**(2024-03-05 신규 스팸 정책 3종 중 하나, 기존 automatically-generated content 정책 확장) 원문: "Scaled content abuse is when many pages are generated for the primary purpose of manipulating Search rankings and not helping users … no matter how it's created." 기준은 양이 아니라 의도와 결과 가치.
- March 2024 core update — "There's no longer one signal or system": helpfulness 판단이 코어 랭킹 시스템의 여러 신호로 흡수됐다.

> 주의: 미검증 — 이전 판의 "영향 받은 일부 사이트 50~80% 트래픽 감소", "2025-06 사이트 단위 manual action 본격화, 의료·금융 우선 타겟"은 출처를 확인하지 못해 삭제했다(2026-09-26).

> 주의 (2026-09-26 정정): 현행 "Creating helpful, reliable, people-first content" 문서(최종 수정 2025-12-10)의 질문 묶음은 **Content and quality(12) / Expertise(4) / Focus on people-first content(5) / Avoid creating search engine-first content(10) / Who·How(각 3)** 이다. 이전 판의 "32개 질문 4묶음, Presentation and Production 묶음"은 구판 구성이며 현행 문서에 Presentation and Production 묶음은 없다(페이지 경험은 "Provide a great page experience" 단락). "Who, How, and Why" 질문은 같은 문서 원문("Ask 'Who, How, and Why' about your content").

- fake freshness(본문 변경 없이 dateModified 만 갱신): QRG 는 페이지 표시 날짜가 실제 생성·갱신과 다를 수 있음을 평가자에게 주지시킨다. "알고리즘이 fake freshness 패턴을 감지"한다는 Google 공식 서술은 2026-09-26 미확인.

## 4. schema.org 정정 (YMYL 마크업)

> 주의: schema.org `Attorney` 정의 원문: "This type is deprecated - LegalService is more inclusive and less ambiguous." 신규 마크업은 `LegalService` 사용 (2026-09-26 대조).

> 주의 (2026-09-26 정정): `"mainContentOfPage": ["Diagnosis", "Treatment", "Prevention"]`는 schema.org 정의상 기대 타입이 **WebPageElement**(구 `aspect` 속성을 대체)여서 문자열 배열은 부적절하다. 청중은 MedicalWebPage 고유 속성 `medicalAudience`(MedicalAudience 또는 MedicalAudienceType)를 쓴다. `lastReviewed`(Date)·`reviewedBy`(Organization/Person)는 WebPage 속성으로 정의 확인.

- Person 본체는 저자 프로필 페이지 1곳에만 두고 다른 글에서는 `@id`로 참조.

## 5. 한국 사이트 신뢰 신호

**전자상거래 푸터** — 한국 이커머스는 정부 등록 정보와 연결되는 사업자 정보 박스 자체가 강한 신뢰 신호다.

| 항목 | 근거 |
|------|------|
| 사업자등록번호·대표자명·사업장 주소·연락처 | 전자상거래법 |
| 통신판매업 신고번호 (+ 공정거래위원회 조회 링크) | 전자상거래법 (판매 사이트) |
| 개인정보처리방침 | 개인정보보호법 |
| 환불·교환 정책 | 권장 (의무인 경우 있음) |

**의료 (의료법)**
- 광고 주체 제한(제56조 ①): 의료기관 개설자·의료기관의 장·의료인이 아닌 자는 의료 광고 불가.
- 금지 유형(제56조 ② 1~15호 중 주요, 2026-09-26 현행 조문 대조): 신의료기술 평가 미경유(1호), 환자 치료경험담 등 치료 효과 오인 우려(2호), 거짓(3호), 다른 의료인등과 **비교**(4호 — "우월" 비교에 한정되지 않음), 비방(5호), 직접적 시술행위 노출(6호), 심각한 부작용 등 중요 정보 누락(7호), 과장(8호), 기사·전문가 의견 형태(10호), 심의 미경유·심의 내용과 다른 광고(11호), 상장·인증·보증·추천 표방(14호, 법정 인증 등 예외).
- 사전심의(제57조·시행령 제24조): 의사회·치과의사회·한의사회 및 요건을 갖춘 소비자단체가 신고한 **자율심의기구**. 대상 매체에 **전년도 말 기준 직전 3개월 일일 평균 이용자 수 10만 명 이상**인 인터넷 매체·SNS 광고매체 포함(시행령 제24조 ②, 2018. 9. 28. 개정). 명칭·소재지·전화번호·진료과목·의료인 성명 등만의 광고는 심의 면제 가능(제57조 ③).

> 주의 (2026-09-26 정정): "2025년 가이드라인 개정으로 블로그·유튜브·인스타그램 포함"은 근거 문서를 확인하지 못했다. 이용자 수 10만 명 기준은 **2018년부터 시행령에 있는 기준**이다. "심의필번호 본문 표기 필수"는 자율심의기구 규정 소관으로 2026-09-26 미대조(`미검증`).

> 주의: 미검증 — HONcode는 2022년 운영 종료. 대안으로 거론되던 "NHS Information Standard"는 이미 종료된 제도로 알려져 있고(영국은 PIF TICK 등으로 대체), "Health on the Net 후속 인증"은 실체를 확인하지 못했다. 한국은 정부 공인 의료정보 인증 제도가 없다 — 자체 편집 가이드라인 공개가 차선.

**금융 (금융소비자 보호에 관한 법률 제22조, 2021-03-25 시행, 2026-09-26 현행 조문 대조)** — ① 금융상품판매업자등이 아닌 자의 광고 원칙 금지(협회 등 예외) ② 오해 없도록 명확·공정 전달 ③ 필수 포함 사항(설명서·약관 권유, 판매업자 명칭·상품 내용, 투자 위험, 과거 운용실적 ≠ 미래 수익 보장 등). 사전심의는 권역별 협회. **광고심의필번호** 표시는 협회 규정 소관, 2026-09-26 미대조(`미검증`). "안전한 고수익"·"원금 보장 + 고수익"은 위반 소지.

**법률 (변호사법)** — 변호사 아닌 자가 변호사·법률사무소를 표시하거나 이익 목적으로 법률 상담 등을 취급한다는 뜻을 표시하면 **변호사법 제112조 제3호**(3년 이하 징역 또는 2천만원 이하 벌금) 위반(2026-09-26 현행 조문 대조 — 이전 판의 "제109조"는 금품 수수 법률사무 취급 처벌 조항으로, 광고 표시 행위는 제112조 제3호가 직접 규정). 규범 체계는 변호사법 + 「변호사 광고에 관한 규정」 + 「변호사 광고에 관한 규칙」(2024-10 신설) + 변호사검색서비스 운영 가이드라인(2025-05).
> 주의: 미검증 — "AI 사용 광고 시 협회 사전 등록·검토 변호사 이름 명시", "'전관 변호사'·'전관예우' 표현 금지" 등 2025-02-06 개정 내용은 대한변호사협회 규정 원문을 2026-09-26 재검증에서 대조하지 못했다.

**광고·제휴 표기** — 공정위 2024-06 시행 「추천·보증 등에 관한 표시·광고 심사지침」: 신용카드·대출·증권 계좌 추천 등 어필리에이트는 수수료 수령 사실을 명확한 한국어로 고지(본문 상단 + 링크 직전).

**위기 자원** — 자해·자살 키워드 글은 본문에 **109**(자살예방 통합 상담, 2024-01-01 개통)·**1577-0199**(정신건강 위기상담)·**119** 안내 박스. 자살예방 보도준칙 4.0: 구체적 방법·도구·장소·동기 비공개. 상세 문구 → `crisis-intervention-resources-korea`.

**네이버 병행** — 한국 의료·금융 검색은 네이버 비중이 높고, 네이버는 의사·병원·공식 기관 출처를 우대하는 자체 평가(세부 미공개)를 가진다. 네이버 블로그 의료광고도 이용자 수 기준(시행령 제24조)에 따라 사전심의 대상이 될 수 있다("2025 가이드" 근거는 미검증). 한국어 YMYL 블로그는 1차 출처 인라인 인용 비율이 낮아, 의식적으로 강화하면 차별화된다.
