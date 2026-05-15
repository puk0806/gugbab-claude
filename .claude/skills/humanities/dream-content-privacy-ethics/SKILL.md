---
name: dream-content-privacy-ethics
description: >
  꿈 데이터를 *민감 정보*로 취급해야 하는 학술·법적 근거(한국 개인정보보호법 제23조, GDPR Art.9, HIPAA, APA Ethics), AI/LLM 시대 추가 위험, 익명화 한계, 사용자 권리, 미성년자 보호 등을 정리한 윤리·법 가이드 스킬.
  <example>사용자: "꿈 일기 앱을 만들 건데 꿈 내용이 민감 정보인지 정리해줘"</example>
  <example>사용자: "꿈 일기에서 OpenAI 임베딩 API를 쓸 때 개인정보 위험이 뭐야?"</example>
  <example>사용자: "꿈 일기 데이터 익명화하려면 어떻게 해야 하고 한계는 뭐야?"</example>
---

# 꿈 데이터 윤리·개인정보보호 (Dream Content Privacy & Ethics)

> 소스:
> - 한국 개인정보보호법 (법령정보센터, https://www.law.go.kr/lsEfInfoP.do?lsiSeq=195062)
> - GDPR Article 9 (https://gdpr-info.eu/art-9-gdpr/)
> - APA Ethics Code 2017 (https://www.apa.org/ethics/code/ethics-code-2017.pdf)
> - HIPAA Privacy Rule (https://www.hhs.gov/hipaa/)
> - 45 CFR Part 46 Common Rule (https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-A/part-46)
> - 생성형 AI 개발·활용을 위한 개인정보 처리 안내서 2025.08 (개인정보보호위원회/KISA)
> - EDPB AI Privacy Risks & Mitigations in LLMs (2025-04)
>
> 검증일: 2026-05-15
>
> **법률 자문 권유:** 이 스킬은 학술·기술 가이드이며 *법률 자문이 아니다*. 실제 서비스·연구를 진행할 때는 반드시 한국 변호사·DPO·IRB 등 전문가의 자문을 받는다.

---

## 1. 꿈 = 민감 정보 위치 (학술적 논의)

### 1-1. 한국 개인정보보호법 제23조 — 민감정보

개인정보보호법 제23조 제1항은 다음을 *민감정보*로 분류한다:

- 사상·신념
- 노동조합·정당 가입·탈퇴
- 정치적 견해
- **건강**(정신적·신체적 건강 상태)
- 성생활
- 유전정보(시행령 제18조)
- 범죄경력자료(시행령 제18조)
- 생체인식정보(시행령 제18조)

> 민감정보는 *원칙적으로 처리 금지*되며, 정보주체로부터 *다른 개인정보 동의와는 별도로* 받은 명시적 동의 또는 법령상 근거가 있어야 처리 가능하다. 위반 시 5년 이하 징역 또는 5천만원 이하 벌금(법 제71조).

### 1-2. 꿈 데이터가 민감정보에 해당할 가능성

꿈 일기에는 다음 항목이 자연스럽게 포함될 수 있다:

| 꿈 일기 항목 | 민감정보 분류 가능성 |
|--------------|---------------------|
| 악몽·반복적 불안 꿈 → 트라우마·PTSD 시사 | 정신적 건강 (제23조) |
| 종교적 상징·신비 체험 꿈 | 종교적 신념 (제23조 "신념") |
| 성적 꿈 | 성생활 (제23조) |
| 정치적 인물·이념 관련 꿈 | 정치적 견해 (제23조) |
| 가족·친밀 관계 꿈 | 일반 개인정보(다만 해석에 따라 정신건강 시사 가능) |

> **결론:** 꿈 일기 *전체*가 일률적으로 민감정보로 분류되는 것은 *아니다*. 다만 *내용에 따라* 정신건강·신념·성생활 관련 정보를 포함할 *가능성이 높으므로*, 운영상 **민감정보에 준해 처리하는 것이 안전**하다. 이는 학술적 보수적 견해이며, 최종 분류는 개인정보보호위원회·법원의 판단이 필요할 수 있다.

> **주의 (학술적 논의 영역):** 위 표의 "분류 가능성"은 명문 판례·해석 사례가 아직 정립되지 않은 영역으로, 보수적 해석을 따른 학술적 견해다. 실무 분류는 법률 자문을 받는다.

### 1-3. GDPR Article 9 비교

GDPR Art. 9(1)는 다음을 *special categories of personal data*로 정의한다:

- racial or ethnic origin
- political opinions
- **religious or philosophical beliefs**
- trade union membership
- genetic data
- biometric data (uniquely identifying)
- **data concerning health** (정신적 건강 포함, Recital 35)
- **sex life or sexual orientation**

Recital 35는 "data concerning health"에 정신적 건강(mental health)을 명시 포함한다. 꿈 내용이 정신적 건강 상태를 시사하면 GDPR Art.9 보호 대상이 된다.

처리 허용 조건(Art. 9(2)) 중 꿈 일기 앱에 현실적으로 사용 가능한 것은:
- (a) explicit consent — 일반적
- (h) 의료 목적 — 임상 환경 한정
- (j) 학술 연구 — Art. 89(1) safeguards 필요

---

## 2. 임상 데이터 윤리 비교

### 2-1. APA Ethics Code 2017 — Confidentiality

APA Ethics Code Standard 4 (Privacy and Confidentiality)는 심리학자의 비밀유지 의무를 규정한다. 임상 환경에서 꿈 보고(dream report)는 다음 원칙에 따라 보호된다:

- **4.01** Maintaining Confidentiality — 모든 매체(녹음·문서·디지털)
- **4.02** Discussing the Limits of Confidentiality — 비밀유지 한계 사전 고지
- **4.05** Disclosures — 동의·법적 의무·생명 보호 외 공개 금지
- **4.07** Use of Confidential Information for Didactic or Other Purposes — 교육·출판 시 식별 정보 위장 필수

2017 개정에서는 *디지털·온라인 환경*에서의 비밀유지 의무가 명시적으로 강화되었다.

### 2-2. HIPAA Privacy Rule — Psychotherapy Notes

HIPAA는 *psychotherapy notes*에 일반 PHI(Protected Health Information)보다 *강한 보호*를 부여한다(45 CFR §164.508(a)(2)):

- 별도 동의(authorization) 없이는 *치료 목적이라도* 다른 의료진에게 공개 금지
- 환자 본인도 *접근 권리 없음* (§164.524(a)(1)(i))
- 정의(§164.501): "private counseling session에서 기록된 대화 내용 분석 노트"
- 처방·세션 시간·진단 요약 등은 *psychotherapy notes에서 제외*

> 꿈 분석 세션의 *내용 기록*은 psychotherapy notes에 해당할 가능성이 높다(미국 임상 환경 기준).

### 2-3. IRB — Common Rule (45 CFR Part 46)

꿈 일기를 학술 연구로 수집·분석할 때 적용된다:

- **§46.111** IRB 승인 기준 — 위험 최소화, 충분한 사전 동의, 사생활 보호
- **§46.116** Informed Consent — 목적·기간·위험·자발성 명시
- **Subpart D** — 아동 대상 연구 추가 보호
- **Subpart B/C** — 임산부·수감자 추가 보호

꿈 일기는 정신건강 시사 가능성으로 인해 *minimal risk 초과*로 분류될 수 있어 *expedited* 보다 *full board review* 가 안전하다.

---

## 3. AI/LLM 시대 추가 위험

### 3-1. 외부 LLM API 호출 = 국외 이전 가능성

OpenAI·Anthropic·Google 등 *해외 사업자* LLM API에 꿈 텍스트(또는 임베딩)를 전송하면:

| 위험 | 한국법·GDPR 근거 |
|------|------------------|
| 개인정보 국외 이전 | 개인정보보호법 제28조의8 (별도 동의·고지 필수) |
| 처리 위탁 신고 | 개인정보보호법 제26조 |
| 민감정보 동의 누락 | 제23조 위반 가능 |
| GDPR Chapter V (적정성 결정·SCC 등) | EU 거주자 데이터 시 |

> **임베딩도 개인정보다.** 텍스트를 임베딩 벡터로 변환했더라도, *재구성 가능성·식별 가능성*이 존재하므로 가명정보·익명정보로 단정할 수 없다. 개인정보보호위원회 2025.08 가이드는 임베딩을 *원본 개인정보의 기술적 변환물*로 본다.

### 3-2. 학습 데이터 활용 위험

EDPB(2025-04) AI Privacy Risks & Mitigations in LLMs는 다음 위험을 식별한다:

- **Memorization**: 모델이 특정 입력을 그대로 재현(verbatim regurgitation)
- **Membership Inference Attack**: 특정 데이터가 학습에 사용됐는지 추론
- **Cross-tenant 누출**: 다른 사용자에게 답변으로 노출
- **모델 가중치 삭제 불가**: 데이터 주체의 *삭제권*(GDPR Art.17, 한국법 제36조) 실현 곤란

> **운영 원칙:** 꿈 데이터를 *학습용·파인튜닝용*으로 외부 API에 전송하지 *않는다*. API 호출 시 명시적으로 "do not train" 옵션(OpenAI: zero data retention, Anthropic: no-training default 등)을 확보하고 약관에 명문화한다.

### 3-3. 추론·프로파일링 위험

LLM이 꿈 내용을 분석해 *추가 정보를 추론*할 수 있다:

- 정신건강 상태 추정 (우울·불안·PTSD)
- 성적 지향 추정
- 종교적 신념 추정
- 정치적 견해 추정

→ *추론된 정보*도 민감정보 처리에 해당할 수 있으며, 자동화된 의사결정(GDPR Art.22, 한국법 제37조의2 신설 예정)의 거부권 대상이 된다.

---

## 4. 익명화·가명화 — 한계와 실무

### 4-1. 용어 정리

| 용어 | 정의 | 복원 가능성 |
|------|------|-------------|
| **가명처리** (pseudonymization) | 식별자를 토큰으로 대체, 추가 정보로 복원 가능 | 가능 |
| **익명처리** (anonymization) | 어떤 수단으로도 식별 불가능 | 불가 |
| **k-anonymity** | 동일 quasi-identifier 그룹 최소 k명 | 부분 보호 |
| **differential privacy** | 통계적 노이즈로 수학적 보장 | 강력 |

한국 개인정보보호법 제2조는 *가명정보*와 *익명정보*를 명확히 구분하며, 가명정보는 여전히 개인정보(추가 정보 분리 보관 의무, 법 제28조의2).

### 4-2. 꿈 데이터 특유의 식별 위험

PII 마스킹(이름·전화·주소 제거)만으로는 *재식별 위험*을 제거할 수 없다:

| 식별자 유형 | 꿈 일기 예시 |
|-------------|-------------|
| 직접 식별자 | "나는 박OO이고…" |
| Quasi-identifier | 생년·직업·거주지·가족 구성 |
| **고유한 꿈 시나리오** | "내 결혼식 날 비행기가 추락하는 꿈" + 결혼 날짜 |
| 시간적 패턴 | 특정 일자 반복되는 악몽 |
| 문체·어휘 | stylometry로 작성자 식별 가능 |

> **연구 사례:** PMC8382275(2021)·Nature Sci.Rep.(2025)는 *narrative text*가 HIPAA Safe Harbor 18개 식별자를 모두 제거해도 *quasi-identifier 결합*으로 재식별 가능함을 입증했다.

### 4-3. k-anonymity의 한계

- *Homogeneity attack*: 동일 그룹 내 민감 속성이 동일하면 추론 가능
- *Background knowledge attack*: 외부 정보 결합 시 무력
- *연속 데이터에 부적합*: 꿈 일기처럼 시계열 자유 텍스트는 quasi-identifier 정의 자체가 어려움

→ l-diversity, t-closeness 같은 보완책도 자유 텍스트에는 직접 적용 곤란.

### 4-4. 실무 권장 — 하이브리드 접근

1. **내부 저장**: 가명처리(pseudonymization) + 별도 저장 매핑 테이블 + AES-256 암호화
2. **분석·통계**: k-anonymity(k≥5) + 카테고리 일반화
3. **공개·공유**: differential privacy (ε≤1.0) 또는 합성 데이터(synthetic data)
4. **자유 텍스트**: NER 기반 마스킹 + 사람 검수 + 재식별 위험 평가

---

## 5. 사용자(정보주체) 권리

### 5-1. 한국 개인정보보호법 vs GDPR 비교

| 권리 | 한국 PIPA | GDPR |
|------|-----------|------|
| 열람권 | 제35조 | Art. 15 |
| 정정·삭제권 | 제36조 | Art. 16, 17 (잊힐 권리) |
| 처리정지권 | 제37조 | Art. 18 (제한권) |
| **이동권** | 제35조의2 (2024년 시행, 마이데이터) | Art. 20 |
| 자동화된 결정 거부권 | 제37조의2 (2026년 시행 강화) | Art. 22 |
| 동의 철회권 | 제22조 | Art. 7(3) |

### 5-2. 꿈 일기 앱 구현 시 필수 기능

- 자기 데이터 *전체 열람* (JSON·CSV export)
- 단건·전체 삭제 (논리 삭제 + N일 후 물리 삭제)
- 데이터 이동 (machine-readable 포맷)
- 자동 분석·추천 *옵트아웃*
- 동의 철회 (가입 해지 → 30일 내 파기, 제21조)

---

## 6. 데이터 최소화·보관 기간

### 6-1. 한국 PIPA 제3조·제16조 — 최소 수집 원칙

> 개인정보처리자는 *처리 목적에 필요한 최소한의 개인정보*를 수집해야 한다 (제16조 제1항).

꿈 일기에서 *불필요한 항목*은 수집하지 않는다:

- 실명 → *닉네임으로 충분*
- 정확한 생년월일 → *연령대만으로 충분*
- 위치 정보 → *기능에 필수가 아니면 수집 금지*

### 6-2. 보관 기간 (제21조)

- 처리 목적 달성·동의 철회·서비스 해지 시 *지체 없이* 파기
- 통상 *30일 이내* 파기 (실무 관행)
- 법령상 보존 의무가 있으면 *분리 보관* 후 만료 시 파기
- 파기 시 *복구 불가능한 방법* (덮어쓰기·물리적 파괴)

### 6-3. 처리방침 명시 의무 (제30조)

- 처리 목적
- 보관 기간
- 제3자 제공·위탁 현황 (LLM API 사업자 포함)
- 정보주체 권리 행사 방법
- DPO 연락처

---

## 7. 미성년자 보호

### 7-1. 만 14세 미만 (한국 PIPA 제22조의2)

- *법정대리인 동의* 필수
- 동의 확인 방법: 휴대폰 본인인증·신용카드·문자 확인 등
- 위반 시 5년 이하 징역·5천만원 이하 벌금 또는 매출 3% 이내 과징금

### 7-2. 만 14~18세

- 본인 동의 가능하나 *알기 쉬운 언어*로 설명 의무
- 미성년자 보호 강화 권고 (개인정보보호위원회 *아동·청소년 개인정보보호 가이드라인* 2024)
- 마케팅 동의는 별도·옵트아웃 기본

### 7-3. 꿈 일기 앱 권장 정책

- 만 14세 미만 가입 *불허* (가장 안전)
- 또는 *법정대리인 인증 플로우* 별도 구현 + 추가 안전조치(LLM 분석 비활성화 등)
- 만 14~18세: *부모 알림*·*공유 제한*·*마케팅 동의 분리*

---

## 8. 임상가·연구자 윤리

### 8-1. IRB 승인이 필요한 경우

| 상황 | IRB 필요 |
|------|---------|
| 학술지 게재 목적 꿈 데이터 분석 | ✅ 필수 |
| 학위 논문 (석·박사) | ✅ 필수 |
| 기업 내부 UX 분석(연구 목적 아님) | ❌ (다만 PIPA·GDPR 준수) |
| AI 모델 학습용 데이터셋 구축 | ✅ 권장 |

### 8-2. APA Ethics Standard 8 — Research

- **8.02** Informed Consent for Research
- **8.05** Dispensing With Informed Consent (제한적 예외)
- **8.07** Deception in Research (꿈 해석에 거짓 정보 제공 금지)
- **8.14** Sharing Research Data for Verification (검증을 위한 데이터 공유 + 비밀유지)

### 8-3. 출판 시 사례 위장

- 꿈 내용·꿈꾼이 신상을 *식별 불가능하게 변형* (APA 4.07)
- 복수 사례 *합성* (composite case)
- 핵심 의미를 해치지 않는 범위에서 세부 변경

---

## 9. 한국 공식 가이드 참조

| 기관 | 자료 | 위치 |
|------|------|------|
| 개인정보보호위원회 | 생성형 AI 개발·활용을 위한 개인정보 처리 안내서 (2025.08) | pipc.go.kr / kisa.or.kr |
| 개인정보보호위원회 | 아동·청소년 개인정보보호 가이드라인 (2024) | pipc.go.kr |
| KISA | 개인정보 영향평가 수행안내서 (2025.10 개정) | kisa.or.kr |
| NIA | 인공지능 윤리·신뢰성 자료 | nia.or.kr |
| 개인정보보호위원회 | 개인정보 처리방침 작성지침 | pipc.go.kr |

> **주의:** URL은 자료 위치 표기이며, 정확한 PDF 경로는 발행 시기에 따라 변동된다. 검색 시 *발행 연도·기관명·자료명*으로 찾는다.

---

## 10. 흔한 함정 (Anti-patterns)

### 10-1. "익명이면 안전" 오해

```
❌ "이름·전화만 지우면 익명이니 LLM API에 전송해도 OK"
```

→ 꿈 내용 자체가 quasi-identifier. 생년·직업·거주지·가족 구성 등이 결합되면 재식별 가능. 정신건강·신념을 *추론*당하는 위험은 별도.

### 10-2. LLM API 외부 처리 미고지

```
❌ 처리방침에 "외부 AI 분석 활용"만 표기하고 OpenAI·국외 이전 언급 누락
```

→ PIPA 제28조의8 (국외 이전) 별도 동의 의무 위반. 제30조 처리방침 부실 기재.

### 10-3. 보관 기간 무한·"영구 보관"

```
❌ "사용자가 삭제 요청하기 전까지 영구 보관"
```

→ PIPA 제21조 위반. 처리 목적 달성·서비스 종료 시 *지체 없이* 파기. 보관 기간을 *명시*해야 한다.

### 10-4. 동의 회피 — 묶음 동의

```
❌ "서비스 이용약관 + 개인정보 수집 + 민감정보 + 마케팅"을 한 체크박스로
```

→ PIPA 제23조: 민감정보 동의는 *다른 동의와 분리* 필수. 마케팅도 별도. 동의 거부 가능 항목은 *동의하지 않아도 서비스 이용 가능*해야 한다.

### 10-5. "연구 목적이라 동의 불필요"

```
❌ "통계·연구 목적이니 가명처리 후 자유 활용 가능"
```

→ 가명정보 처리는 PIPA 제28조의2 ~ 제28조의7 규정 준수 필수. 결합·재식별 금지, 안전조치, 처리 결과 공개 등 의무. 민감정보는 가명처리해도 *원칙적 처리 금지* 유지.

### 10-6. 사용자 권리 화면 미제공

```
❌ "삭제 요청은 이메일로만 받음, 처리는 30일 이내"
```

→ PIPA는 *지체 없이* 처리 의무. 또한 *셀프 서비스 UI 제공*이 권장된다(2024 가이드).

### 10-7. 임베딩만 저장하면 안전이라는 오해

```
❌ "원문은 지우고 임베딩 벡터만 보관하니 익명 데이터"
```

→ 임베딩은 *기술적 변환물*로 *재구성 가능성*이 있다. 개인정보보호위원회는 임베딩을 *원본 개인정보의 처리물*로 본다. 가명정보·익명정보 단정 불가.

---

## 11. 짝 스킬

- **frontend/dream-privacy-consent-ui** — 동의 화면·권리 행사 UI 구현
- **architecture/dream-journal-data-modeling** — 암호화·분리 저장·키 관리

---

## 12. 학술 출처

- 개인정보보호법 (법령정보센터): https://www.law.go.kr/lsEfInfoP.do?lsiSeq=195062
- GDPR Article 9 (공식): https://gdpr-info.eu/art-9-gdpr/
- APA Ethics Code 2017: https://www.apa.org/ethics/code/ethics-code-2017.pdf
- HIPAA Privacy Rule (HHS): https://www.hhs.gov/hipaa/
- 45 CFR Part 46 Common Rule: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-A/part-46
- 개인정보보호위원회 (PIPC): https://www.pipc.go.kr
- KISA: https://www.kisa.or.kr
- EDPB AI Privacy Risks & Mitigations in LLMs (2025-04): https://www.edpb.europa.eu/system/files/2025-04/ai-privacy-risks-and-mitigations-in-llms.pdf
- Domhoff, G. W. (1999). New Directions in the Study of Dream Content Using the Hall and Van de Castle Coding System. *Dreaming*, 9(2-3).
- NISTIR 8053 De-Identification of Personal Information (2015)
- "Enabling qualitative research data sharing using a natural language processing pipeline for deidentification" (PMC8382275, 2021)

> **다시 한 번 강조:** 이 스킬은 학술·기술적 정리다. 실제 서비스·연구 진행 시 변호사·DPO·IRB 자문을 *반드시* 받는다.
