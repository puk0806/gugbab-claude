---
skill: dream-content-privacy-ethics
category: humanities
version: v1
date: 2026-05-15
status: APPROVED
---

# 검증 문서 — dream-content-privacy-ethics

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-content-privacy-ethics` |
| 스킬 경로 | `.claude/skills/humanities/dream-content-privacy-ethics/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (자동) |
| 스킬 버전 | v1 |
| 카테고리 분류 | content test 가능 (실사용 필수 스킬 아님) — 답변 정확성만으로 검증 가능 |

---

## 1. 작업 목록 (Task List)

- [✅] 한국 개인정보보호법 제23조 본문 조사 (법령정보센터)
- [✅] 한국 PIPA 시행령 제18조 민감정보 추가 항목 조사
- [✅] 한국 PIPA 제21조(파기)·제22조의2(아동)·제35조~37조(권리) 조사
- [✅] GDPR Art. 9 (special categories) 조문 직접 확인
- [✅] APA Ethics Code 2017 PDF·해설 검증
- [✅] HIPAA Privacy Rule psychotherapy notes(§164.508·§164.501·§164.524) 확인
- [✅] 45 CFR Part 46 (Common Rule) §46.111·§46.116 확인
- [✅] LLM/AI 시대 추가 위험: EDPB 2025-04 자료, 국외 이전 위험
- [✅] k-anonymity·differential privacy·재식별 위험 조사
- [✅] Narrative text de-identification 한계 (PMC, Nature) 조사
- [✅] 한국 KISA·개인정보보호위원회 2025.08 생성형 AI 처리 안내서 확인
- [✅] SKILL.md 작성 (12개 섹션, 법률 자문 권유 명시)
- [✅] 짝 스킬 명시 (frontend/dream-privacy-consent-ui, architecture/dream-journal-data-modeling)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "한국 개인정보보호법 제23조 민감정보 정의" | 법령정보센터·법제처·CaseNote 결과, 조문 본문 확인 |
| 조사 | WebSearch | "GDPR Article 9 special categories health philosophical beliefs" | gdpr-info.eu·ICO·DPC 결과 |
| 조사 | WebSearch | "APA Ethics Code 2017 confidentiality clinical psychology" | apa.org PDF·Wikipedia·해설 |
| 조사 | WebSearch | "HIPAA Privacy Rule psychotherapy notes" | HHS·HIPAA Journal·Holland & Hart 결과 |
| 조사 | WebSearch | "k-anonymity differential privacy re-identification PII" | Wikipedia·NIST·Springer 결과 |
| 조사 | WebSearch | "한국 개인정보보호법 정보주체 권리 GDPR 비교" | 국민권익위·Kim&Chang·DBpia |
| 조사 | WebSearch | "LLM API embedding cross-border training data privacy" | EDPB·Skyflow·GDPR Local 결과 |
| 조사 | WebSearch | "한국 만 14세 미만 미성년자 동의 법정대리인" | privacy.go.kr·easylaw·Kim&Chang |
| 조사 | WebSearch | "IRB Common Rule 45 CFR 46 vulnerable populations" | eCFR·HHS·Cornell LII |
| 조사 | WebSearch | "한국 PIPA 제21조 파기 보관 기간" | 법령정보센터·CaseNote·PRESPRES |
| 조사 | WebSearch | "Domhoff Hall Van de Castle dream content research" | dreams.ucsc.edu·Springer |
| 조사 | WebSearch | "KISA 영향평가·NIA AI 가이드라인 2024 2025" | kisa.or.kr·pipc·smartcity.go.kr |
| 조사 | WebSearch | "narrative re-identification quasi-identifier free text" | PMC8382275·Nature·OpenReview |
| 교차 검증 | WebSearch | "PIPA 제23조 시행령 제18조 정신건강" | 1차 결과와 일치 — 사상·신념·건강·성생활·유전·범죄경력·생체인식 |
| 교차 검증 | WebFetch | gdpr-info.eu/art-9-gdpr/ 직접 fetch | Art.9(1) 8개 카테고리·Art.9(2) 10개 예외 조건 직접 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 국가법령정보센터 — 개인정보보호법 | https://www.law.go.kr/lsEfInfoP.do?lsiSeq=195062 | ⭐⭐⭐ High | 2026-05-15 | 정부 공식 법령 |
| GDPR Article 9 공식 텍스트 | https://gdpr-info.eu/art-9-gdpr/ | ⭐⭐⭐ High | 2026-05-15 | EU 공식 텍스트 미러 |
| APA Ethics Code 2017 PDF | https://www.apa.org/ethics/code/ethics-code-2017.pdf | ⭐⭐⭐ High | 2026-05-15 | APA 공식 |
| HHS HIPAA Privacy Rule | https://www.hhs.gov/hipaa/ | ⭐⭐⭐ High | 2026-05-15 | 미국 정부 공식 |
| eCFR 45 CFR Part 46 | https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-A/part-46 | ⭐⭐⭐ High | 2026-05-15 | 미국 연방규정 공식 |
| 개인정보보호위원회 (PIPC) | https://www.pipc.go.kr | ⭐⭐⭐ High | 2026-05-15 | 한국 감독기구 |
| KISA | https://www.kisa.or.kr | ⭐⭐⭐ High | 2026-05-15 | 한국 인터넷진흥원 |
| 생성형 AI 개발·활용을 위한 개인정보 처리 안내서 (2025.08) | smartcity.go.kr 미러 PDF | ⭐⭐⭐ High | 2026-05-15 | 개인정보보호위원회 발행 |
| EDPB AI Privacy Risks & Mitigations in LLMs (2025-04) | https://www.edpb.europa.eu/system/files/2025-04/ai-privacy-risks-and-mitigations-in-llms.pdf | ⭐⭐⭐ High | 2026-05-15 | EU 데이터보호이사회 |
| NISTIR 8053 De-Identification | https://nvlpubs.nist.gov/nistpubs/ir/2015/nist.ir.8053.pdf | ⭐⭐⭐ High | 2026-05-15 | NIST 공식 |
| Domhoff (1999) Dream Content | https://dreams.ucsc.edu/Library/domhoff_1999a.html | ⭐⭐⭐ High | 2026-05-15 | 학술 논문 저자 사이트 |
| PMC8382275 NLP deidentification | https://pmc.ncbi.nlm.nih.gov/articles/PMC8382275/ | ⭐⭐⭐ High | 2026-05-15 | PubMed Central |
| Kim&Chang 법률 인사이트 (아동 가이드라인) | https://www.kimchang.com/ko/insights/detail.kc?idx=25475 | ⭐⭐ Medium | 2026-05-15 | 법무법인 해설(보완) |
| privacy.go.kr — 법정대리인 동의 | https://www.privacy.go.kr/front/contents/cntntsView.do?contsNo=75 | ⭐⭐⭐ High | 2026-05-15 | 정부 공식 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 한국 PIPA 제23조 민감정보 항목이 공식 법령과 일치
- [✅] GDPR Art. 9(1) 8개 카테고리가 공식 텍스트와 일치 (gdpr-info.eu WebFetch 직접 확인)
- [✅] HIPAA psychotherapy notes 정의 §164.501 정확
- [✅] 45 CFR 46.111·46.116 핵심 요건 정확
- [✅] APA Ethics 4.01/4.02/4.05/4.07·8.02/8.05/8.07/8.14 표준 번호 정확
- [✅] 한국 PIPA 제21조(파기), 제22조의2(아동), 제30조(처리방침) 조문 번호 정확
- [✅] 임베딩의 개인정보 해당 가능성 — 개인정보보호위 2025.08 가이드와 정합
- [✅] LLM memorization·membership inference 위험 — EDPB 2025-04 자료와 정합
- [✅] k-anonymity 한계(homogeneity attack) — 공식 학술 자료와 일치
- [✅] 만 14세 미만 위반 시 형사 처벌 수위 정확

### 4-2. 구조 완전성

- [✅] YAML frontmatter (name, description, example 3개)
- [✅] 소스 URL과 검증일(2026-05-15) 명시
- [✅] 12개 섹션 구조 (민감정보 위치 / 임상 윤리 / AI 위험 / 익명화 / 권리 / 최소화 / 미성년자 / 연구 윤리 / 한국 가이드 / 함정 / 짝 스킬 / 출처)
- [✅] 코드 예시(anti-pattern 블록) 7개 포함
- [✅] 흔한 실수 패턴 7가지 정리
- [✅] *법률 자문 권유* 2회 명시 (상단·하단)
- [✅] 학술적 보수적 견해와 확정 해석을 명확히 구분

### 4-3. 실용성

- [✅] 꿈 일기 앱·연구 양쪽 시나리오 모두 포함
- [✅] 한국 PIPA·GDPR·HIPAA·APA·IRB 비교 표로 직관성 확보
- [✅] AI/LLM 시대 추가 위험 별도 섹션
- [✅] 짝 스킬(UI·데이터 모델링) 연결 명시
- [✅] 범용 (특정 프로젝트·라이브러리 종속 없음)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] skill-tester 호출 수행 (2026-05-15)
- [✅] 실전 질문 3개 답변 검증 완료 (2026-05-15, 3/3 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (도메인 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 꿈 데이터의 민감정보 해당 여부 학술 논의 (한국 PIPA + GDPR)**
- PASS
- 근거: SKILL.md "1. 꿈 = 민감 정보 위치 (학술적 논의)" 섹션 (1-1, 1-2, 1-3)
- 상세: 섹션 1-2 표 + 결론 "전체가 일률적으로 민감정보는 아님, 내용에 따라 민감정보에 준해 처리하는 것이 안전"이 정확히 도출됨. GDPR Art.9(1)과 Recital 35 (정신적 건강 포함) + 처리 허용 조건 (a)(h)(j) 모두 섹션 1-3에 존재. Anti-pattern("꿈 전체=민감정보" 단순화, "전혀 해당 없음" 오판) 회피 가능.

**Q2. k-anonymity 한계 — 꿈 일기 자유 텍스트 특유의 재식별 위험**
- PASS
- 근거: SKILL.md "4. 익명화·가명화 — 한계와 실무" 섹션 (4-2, 4-3, 4-4)
- 상세: 섹션 4-3에 Homogeneity attack·Background knowledge attack·연속 데이터 부적합(quasi-identifier 정의 어려움) 3가지 한계 명시. 섹션 4-2에 고유 꿈 시나리오·시간적 패턴·stylometry 등 꿈 특유 식별자 표 존재. PMC8382275 연구 사례 인용. 섹션 4-4에 공개·공유 시 differential privacy(ε≤1.0) 또는 합성 데이터 권장 명시. Anti-pattern("k=5면 충분") 회피 가능.

**Q3. APA Ethics Code 임상 꿈 보고 비밀유지 + 출판 처리 + 만 14세 미만 처리 규칙**
- PASS
- 근거: SKILL.md "2-1. APA Ethics Code 2017 — Confidentiality", "8-3. 출판 시 사례 위장", "7. 미성년자 보호" 섹션
- 상세: APA 4.01/4.02/4.05/4.07 표준 번호와 내용 명시. 출판 시 식별 불가능 변형·composite case·세부 변경 3가지 방법 존재(섹션 8-3). 만 14세 미만: PIPA 제22조의2 법정대리인 동의 필수, 위반 시 형사 처벌 수위(5년 이하 징역·5천만원 이하 벌금 또는 매출 3% 과징금) 명시(섹션 7-1). 앱 권장 정책(가입 불허 또는 법정대리인 인증+LLM 분석 비활성화) 섹션 7-3에 존재. Anti-pattern("연구 목적이면 IRB 후 자유 공개", "만 14세 미만 본인 동의 가능") 회피 가능.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md 내 충분한 근거 섹션이 존재하며, anti-pattern을 명확히 구분하는 내용이 포함되어 있음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법·API 패턴·개념·이론 정리 스킬 — content test PASS = APPROVED)
- 최종 상태: APPROVED

---

> (참고) 이전 템플릿:
> skill-tester 에이전트가 SKILL.md Read 후 실전 질문을 수행하고 이 섹션을 업데이트할 예정.
>
> 이전 상태: SKILL.md 작성 완료, content test 미수행. PENDING_TEST.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (공식 법령·공식 가이드·EDPB 자료 다중 출처 교차 검증) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-15, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 후 섹션 5·6·7·8 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] (선택·비차단) 한국 *판례*나 *개인정보보호위 의결례* 중 꿈·심리 관련 직접 사례 발견 시 추가 — APPROVED 상태에 영향 없음, 실전 도입 이후 보강 가능
- [❌] (선택·비차단) 2026년 PIPA 추가 개정 시행 시점 재검토 (자동화된 의사결정 거부권 등) — 법령 개정 시 스킬 갱신 필요하나 현재 v1 내용은 2026-05-15 기준 정확

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (한국 PIPA·GDPR·HIPAA·APA·IRB 종합, AI/LLM 시대 위험 포함) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 꿈=민감정보 학술 논의 / Q2 k-anonymity 한계+재식별 / Q3 APA Ethics 임상+만 14세 미만) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
