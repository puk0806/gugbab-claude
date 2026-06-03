---
name: accessibility-vpat-writing
description: VPAT(Voluntary Product Accessibility Template) 및 ACR(Accessibility Conformance Report)을 공식 양식 기준으로 작성하는 절차·표기·흔한 실수 정리. 공공조달·B2B SaaS·기업 도입 검토 시 요구되는 접근성 적합성 문서 작성 가이드.
---

# VPAT / ACR 작성 가이드

> 소스:
> - ITI 공식 VPAT 페이지: https://www.itic.org/policy/accessibility/vpat
> - Section508.gov ACR/VPAT FAQ: https://www.section508.gov/sell/acr-vpat-faq/
> - Section508.gov "How to Create an ACR": https://www.section508.gov/sell/how-to-create-acr-with-vpat/
> - EN 301 549 V3.2.1 (ETSI): https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf
> - 한국형 KWCAG 2.2 (KS X OT0003): https://a11ykr.github.io/kwcag22/
>
> 검증일: 2026-06-02
> 기준 버전: **VPAT 2.5Rev (ITI, 2025-04 발행)**

---

## 1. VPAT란 무엇인가

**VPAT(Voluntary Product Accessibility Template)** 은 IT 제품·서비스의 접근성 적합성을 공급자가 자체 평가하여 기록하는 표준 양식이다.

- **발행 주체**: ITI (Information Technology Industry Council)
- **시작**: 1998년 미국 연방 조달(Section 508) 대응 목적
- **현재 위치**: 글로벌 사실상 표준. 공공조달·대형 B2B 거래에서 사실상 필수
- **법적 성격**: "Voluntary" — 법적 의무는 아니지만, 미국 연방·주정부·대학·대기업 조달 RFP에서 거의 항상 요구됨
- **가격**: ITI가 무료(.doc)로 배포. ITI 멤버십 불필요
- **공식 입장**: ITI는 작성된 VPAT을 *검토·승인하지 않음*. 인증·로고 없음. 모두 *자기 평가*

> 주의: ITI는 작성된 VPAT의 내용을 검증해주지 않는다. 허위 기재는 전적으로 작성자 책임이며 거래 신뢰 손실·계약 분쟁의 사유가 된다.

---

## 2. VPAT vs ACR — 용어 정확히

| 용어 | 정의 |
|------|------|
| **VPAT** | 빈 *템플릿* (ITI 배포 .doc 파일) |
| **ACR** | VPAT을 채워 완성한 *보고서* (Accessibility Conformance Report) |

대외 공개·고객 전달 시 파일명은 ACR 형식으로 명명한다.

```
좋은 예: MyProduct_v2.5_WCAG_ACR_2026-06.pdf
나쁜 예: vpat_template_filled.docx
```

---

## 3. VPAT 4가지 에디션

ITI는 시장별로 4가지 에디션을 제공한다. 작성자는 *대상 시장*에 맞춰 1개 또는 INT를 선택한다.

| 에디션 | 기준 표준 | 대상 시장 |
|--------|-----------|-----------|
| **VPAT 2.5 WCAG** | WCAG 2.2 (A/AA/AAA) | 글로벌 일반, 한국 기업 글로벌 B2B 기본값 |
| **VPAT 2.5 508** | Revised Section 508 + WCAG 2.0 | 미국 연방 조달 |
| **VPAT 2.5 EU** | EN 301 549 v3.2.1 + WCAG 2.1 AA | 유럽 공공 조달 |
| **VPAT 2.5 INT** | 위 세 가지 모두 통합 | 글로벌 전 시장 동시 대응 |

> 한국 기업이 글로벌 B2B SaaS 진출 시: **WCAG Edition** 기본 + 미국 연방 고객 있으면 **INT Edition**.
>
> 주의: 한국 국내 컴플라이언스(KS X OT0003 / KWCAG 2.2 / 디지털포용법 제21조)는 VPAT과 *별개 트랙*이다. 국내 인증(한국디지털접근성진흥원 웹접근성 품질마크)은 KWCAG 기준으로 별도 진행한다.

---

## 4. VPAT 2.5Rev 변경점 요약

VPAT 2.5는 2023-09에 발표되어 WCAG 2.2 정렬(success criterion 9개 추가)했고, 2025-04에 2.5Rev로 소폭 개정되었다.

- WCAG 및 INT 에디션에 WCAG 2.2 신규 9개 SC 포함
- 4가지 conformance level 표기 강제
- "Essential Requirements for Authors" 섹션이 정의의 권원

> 다음 버전(2.6) 예정 없음. WCAG 3.0 또는 EN 301 549·Section 508 대규모 개정 시 갱신 전망.

---

## 5. VPAT 문서 구조

VPAT은 다음 순서로 구성된다.

```
[1] 표지 (Title Page)
[2] 적용 범위·서문 (Applicable Standards & Guidelines)
[3] 평가 방법론 (Evaluation Methods Used)
[4] WCAG 표 (Tables 1, 2, 3 — A, AA, AAA)
[5] Section 508 표 (508/INT 에디션만)
[6] EN 301 549 표 (EU/INT 에디션만)
[7] 약어·각주·법적 면책
```

### 5.1 표지 7개 필수 항목

Section508.gov가 누락 빈도가 가장 높다고 지적하는 항목들:

- 제품명·버전 (Product Name & Version)
- 보고서 날짜 (Report Date) — `YYYY-MM-DD`
- 제품 설명 (Product Description) — 1~2문단
- 연락처 (Contact Information) — 접근성 담당자 이메일
- **평가 방법** (Evaluation Methods Used) — 자동/수동 도구, 사용 도구명
- **적용 표준** (Applicable Standards/Guidelines) — 어떤 에디션·버전인지
- 작성자·작성 기관 (Author / Organization)

---

## 6. Conformance Level — 4종 공식 정의

VPAT의 Conformance 컬럼에는 반드시 다음 4개 용어 중 하나만 사용한다. ITI Essential Requirements에 정의된 공식 용어 외 변형은 허용되지 않는다 (예: "Mostly Supports", "Compliant" 등 금지).

| 용어 | 공식 정의 | 사용 시점 |
|------|-----------|-----------|
| **Supports** | 제품 기능이 알려진 결함 없이 또는 equivalent facilitation으로 기준을 충족 | 완전 충족 |
| **Partially Supports** | 제품의 일부 기능이 기준을 충족하지 않음 | 일부 페이지·일부 기능 미충족 |
| **Does Not Support** | 제품 기능 대부분이 기준을 충족하지 않음 | 대부분 미충족 |
| **Not Applicable** | 해당 기준이 제품에 적용되지 않음 | 예: 비디오 없는 제품의 1.2.x 자막 |

추가 표기:
- **Not Evaluated** — AAA 수준이거나 평가 범위 밖일 때 (선택적, 표기 시 사유 필수)

> 주의: "Partially Supports" 또는 "Does Not Support"인 경우 **Remarks and Explanations 컬럼에 무엇이 미충족인지·어떤 페이지/기능에서 발생하는지를 반드시 설명**해야 한다. ITI 공식 요구사항.

---

## 7. WCAG 표 작성 — 행 단위 예시

각 success criterion(SC)별로 다음 3개 컬럼을 채운다.

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| 1.3.1 Info and Relationships (Level A) | Supports | 모든 폼 필드에 `<label for>` 연결. 헤딩 계층 점검 완료. axe DevTools 자동 점검 0 violations, 수동 점검(NVDA + Chrome) 통과. |
| 1.4.3 Contrast (Minimum) (Level AA) | Partially Supports | 본문 텍스트는 7.2:1로 충족. 그러나 `/dashboard` 페이지의 보조 라벨(`.help-text`) 3.8:1로 미충족. 2026-Q3 디자인 시스템 토큰 개편으로 4.5:1 이상 확보 예정. |
| 1.2.4 Captions (Live) (Level AA) | Not Applicable | 제품 내 라이브 비디오 콘텐츠 없음. 녹화 영상 자막은 1.2.2에서 평가. |
| 2.5.7 Dragging Movements (Level AA, WCAG 2.2 신규) | Supports | 모든 드래그 인터랙션에 키보드·버튼 대체 수단 제공. 칸반 보드 카드 이동 시 "위로/아래로" 버튼 제공. |

> 상세 SC 점검 방법은 [[wcag-2.2-checklist]] 스킬 참조. 본 스킬은 *문서화 형식*에 집중한다.

---

## 8. Remarks and Explanations — 작성 6원칙

ACR의 신뢰성을 좌우하는 핵심 컬럼이다.

1. **구체성** — "일부 페이지에서 미충족" (X) → "/dashboard, /settings 페이지의 모달 닫기 버튼" (O)
2. **검증 방법 명시** — "axe-core 4.9 자동 점검 + NVDA 2024.1 수동 점검 + 키보드 단독 시나리오"
3. **개선 일정** — Partially Supports인 경우 "2026-Q3 개선 예정" 같은 *Roadmap* 포함 (선택이지만 권장)
4. **회피·은폐 표현 금지** — "곧 개선될 예정" (X) → "현재 미충족, 2026-09까지 개선" (O)
5. **사용자 영향 기술** — 미충족이 *어떤 사용자에게 어떤 영향*을 주는지 (예: "저시력 사용자가 보조 라벨을 식별하기 어려움")
6. **Not Applicable 사유 명시** — 단순히 "N/A"만 적지 말고 *왜* 해당 안 되는지 1문장 첨부

---

## 9. 평가 방법론 표기 (Evaluation Methods Used)

표지에 다음을 *모두* 명시한다.

### 9.1 자동 도구

대표적으로 사용되는 도구:

- **axe DevTools** (Deque) — 브라우저 확장·CI 통합
- **WAVE** (WebAIM) — 브라우저 확장
- **Lighthouse Accessibility** — Chrome DevTools 내장
- **Pa11y CI** — 헤드리스 자동화

> 주의: 자동 도구는 WCAG SC의 약 **30%만 커버**한다 (Deque, WebAIM 공통 추정). 자동 도구만으로 "Supports"를 주장하는 것은 흔한 실수다. 반드시 수동 점검과 병행한다.

### 9.2 수동 점검

- **키보드 단독 내비게이션** — Tab/Shift+Tab/Enter/Space/Esc만으로 전 기능 사용 가능한가
- **스크린리더** — NVDA(Windows) + JAWS(Windows) + VoiceOver(macOS/iOS) + TalkBack(Android) 중 최소 2종
- **확대(Zoom) 200% / 400%** — 가로 스크롤 없이 사용 가능한가 (1.4.10 Reflow)
- **색맹 시뮬레이션** — Chrome DevTools Rendering · NoCoffee
- **고대비 모드** — Windows High Contrast / Forced Colors

### 9.3 사용자 시나리오 기반 검증

- 핵심 user flow 5~10개에 대해 보조기술 사용자 관점 시나리오 수행
- 예: "스크린리더 사용자가 회원가입 → 결제 → 영수증 다운로드까지 완주"

### 9.4 평가 범위(Scope) 명시

평가 범위는 항상 명확히 기술한다:

- "전체 사이트 (32개 페이지)" 또는
- "핵심 사용자 여정에 해당하는 12개 페이지: /, /login, /signup, /dashboard, /settings/..."

### 9.5 평가자 자격

권장 표기 (필수는 아니나 신뢰성 ↑):

- **IAAP CPACC** (Certified Professional in Accessibility Core Competencies)
- **IAAP WAS** (Web Accessibility Specialist)
- 제3자 감사 기관명 (Deque, Level Access, TPGi 등)

---

## 10. ACR 작성 절차 — D-30 ~ D-Day

| 시점 | 작업 |
|------|------|
| **D-30** | [[wcag-2.2-checklist]] 스킬 기반 자체 점검 시작. 대상 SC 목록 확정 |
| **D-21** | 자동 도구(axe, WAVE, Lighthouse, Pa11y) 결과 수집 및 정리 |
| **D-14** | 수동 점검 시나리오 수행. 키보드·스크린리더·확대·색맹 시뮬레이션 |
| **D-10** | 사용자 시나리오 기반 end-to-end 검증 |
| **D-7** | ITI 공식 사이트에서 *최신* VPAT 템플릿(.doc) 다운로드. 채우기 시작 |
| **D-5** | Conformance level 결정 + Remarks 초안 작성 |
| **D-3** | 내부 리뷰 — 접근성 담당자 + 법무·컴플라이언스 |
| **D-1** | ACR 자체 접근성 점검 (PDF 태깅, 헤딩 구조, 표 대체 텍스트) |
| **D-Day** | PDF/Word 산출 + ACR 명명 + 공식 채널 게시 |

> 흔한 실수: D-7 시점에 *작년에 받은 템플릿*을 재사용. 반드시 ITI에서 새로 다운로드해 최신 버전(VPAT 2.5Rev)을 사용한다.

---

## 11. 한국 기업의 VPAT 작성 케이스

### 11.1 언제 작성하나

- 미국·유럽 B2B SaaS 고객사가 RFP·계약 단계에서 요구
- 글로벌 엔터프라이즈 마켓플레이스 등록 (Salesforce AppExchange, Atlassian Marketplace 등)
- 다국적 기업의 공급사 등록 절차

### 11.2 국내 컴플라이언스와의 관계

| 영역 | 한국 국내 | 글로벌 (VPAT) |
|------|-----------|---------------|
| 기준 | KWCAG 2.2 (KS X OT0003) | WCAG 2.2 |
| 인증 | 한국디지털접근성진흥원(KWACC) 품질마크 | 자기 평가 (제3자 인증 별도) |
| 법적 근거 | 디지털포용법 제21조, 장애인차별금지법 | Section 508(미국), EAA(EU) |
| 구조 | 4원칙·14지침·33검사항목 | WCAG 4원칙·13가이드라인·86 SC (2.2 AAA 포함) |

> 주의: KWCAG 2.2와 WCAG 2.2는 *구조와 일부 검사항목이 다르다*. KWCAG 점검 결과를 그대로 VPAT에 옮기지 말고, WCAG SC 단위로 *재매핑*한다.

### 11.3 작성 언어

- ACR은 **영문 작성이 기본**. 글로벌 고객 대상이므로 한글 ACR은 거의 사용되지 않음
- 내부용으로 한글 버전을 함께 유지하면 협업·리뷰가 쉬움

---

## 12. 흔한 실수 패턴 — 체크리스트

| 패턴 | 문제 |
|------|------|
| "Supports" 남발 | 실제 점검 안 한 채 모두 Supports로 표기 → 신뢰성 즉시 손실 |
| 자동 도구만으로 "Fully Supports" 주장 | 자동 도구는 SC의 ~30%만 커버. 수동 점검 필수 |
| Remarks 비어 둠 | Partially/Does Not Support인데 설명 없음 → ITI 공식 요구사항 위반 |
| 평가일·버전 갱신 누락 | 작년 ACR을 신제품 v2.5에 재사용 → 즉시 거절됨 |
| 잘못된 WCAG 버전 표기 | WCAG 2.0 기준으로 점검하고 "WCAG 2.2 Supports" 표기 |
| Partially Supports를 Roadmap 없이 둠 | 개선 일정 없으면 영구 미충족으로 해석됨 |
| 평가 범위 모호 | "전체 사이트" 또는 "핵심 12개 페이지" 명시 없음 |
| 4종 외 conformance level 사용 | "Mostly Supports", "Compliant" 등 → 공식 용어 위반 |
| Not Applicable 사유 누락 | "N/A"만 표기, 왜 해당 안 되는지 없음 |
| 구버전 VPAT 사용 | 2.5Rev가 최신인데 2.3·2.4 사용 |
| 지침 페이지 미삭제 | 템플릿의 안내(instructions) 페이지를 그대로 둔 채 배포 |
| ACR 자체의 접근성 미점검 | PDF 태깅·헤딩 구조·표 헤더 누락 |
| 일회성 작성 | 1년 이상 갱신 없음 — 제품 변경 시 즉시 갱신 권장 |

---

## 13. 법적·신뢰성 면책

- VPAT은 **자기 평가**다. ITI·정부 인증 아님
- 허위·과장 기재 시 **거래 신뢰 손실 + 계약 분쟁 + 미국 ADA Title III 소송 위험**
- **최소 1년 단위 재검증** 권장. 제품 메이저 업데이트(예: UI 리뉴얼) 시 즉시 갱신
- 제3자 감사(Deque, Level Access, TPGi 등) 결과를 VPAT 표지에 명시하면 신뢰성 ↑

### 13.1 ACR 게시 위치

- 회사 웹사이트 `/accessibility` 또는 `/legal/accessibility` 경로
- 제품 페이지에 "Accessibility" 링크
- 영업·고객 성공 팀이 RFP 응답 시 즉시 제공 가능하도록 내부 저장소에 보관

---

## 14. 산출물 파일 명명 컨벤션

```
{ProductName}_v{Version}_{Edition}_ACR_{YYYY-MM}.pdf
```

예시:
- `Acme_v2.5_WCAG_ACR_2026-06.pdf`
- `Acme_v2.5_INT_ACR_2026-06.pdf`
- `Acme_Mobile_v1.0_508_ACR_2026-06.pdf`

PDF는 *반드시 태깅된 PDF*로 산출 (Word → PDF 변환 시 "구조 태그 포함" 옵션). ACR 자체가 접근성 위반이면 신뢰도 0이다.

---

## 15. 연계 스킬

- **[[wcag-2.2-checklist]]** — VPAT 작성 *전에* 수행하는 SC 단위 점검 절차
- ACR은 wcag-2.2-checklist 점검 결과를 *공식 양식으로 정리*하는 산출물

---

## 부록 A: 최소 ACR 표지 템플릿 (영문)

```
VPAT® 2.5Rev — WCAG Edition
Accessibility Conformance Report

Name of Product/Version: Acme Dashboard v2.5
Report Date: 2026-06-30
Product Description: A web-based analytics dashboard for B2B SaaS customers.
Contact Information: accessibility@acme.example (Jane Doe, Accessibility Lead, CPACC)
Notes: This report covers the web application only. Mobile apps are reported separately.
Evaluation Methods Used:
  - Automated: axe DevTools 4.9, WAVE 3.2, Lighthouse 11
  - Manual: Keyboard-only navigation, NVDA 2024.1 + VoiceOver (macOS 14)
  - Scope: 14 core pages covering full user journey (signup → checkout → admin)
Applicable Standards/Guidelines:
  - Web Content Accessibility Guidelines 2.2, Levels A and AA
```

## 부록 B: 참고 자료

- ITI VPAT: https://www.itic.org/policy/accessibility/vpat
- Section508.gov ACR/VPAT FAQ: https://www.section508.gov/sell/acr-vpat-faq/
- Section508.gov "How to Create an ACR": https://www.section508.gov/sell/how-to-create-acr-with-vpat/
- WCAG 2.2 (W3C): https://www.w3.org/TR/WCAG22/
- EN 301 549 V3.2.1 (ETSI): https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf
- KWCAG 2.2 (KS X OT0003): https://a11ykr.github.io/kwcag22/
- IAAP 인증 (CPACC/WAS): https://www.accessibilityassociation.org/s/certification
