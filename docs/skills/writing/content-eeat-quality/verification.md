---
skill: content-eeat-quality
category: writing
version: v1
date: 2026-06-02
status: APPROVED
---

# content-eeat-quality 스킬 검증 문서

> Google Quality Rater Guidelines + Helpful Content System + 생성 AI 콘텐츠 가이드 기반의 E-E-A-T 프레임워크 스킬 검증 기록.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `content-eeat-quality` |
| 스킬 경로 | `.claude/skills/writing/content-eeat-quality/SKILL.md` |
| 검증일 | 2026-06-02 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] Google Search Central 공식 문서 1순위 확인 (Helpful Content / Gen AI / E-E-A-T 블로그)
- [✅] Quality Rater Guidelines PDF 2순위 확인 (services.google.com)
- [✅] 최신 버전 기준 내용 확인 (QRG 2025-09-11판, Helpful Content 2024-03 코어 통합 기준)
- [✅] 4요소(E-E-A-T) 정의·역사·진화 정리
- [✅] Trust 최상위 근거 검증
- [✅] 자가 점검 질문(Helpful Content) 4개 묶음 정리
- [✅] AI 생성 콘텐츠 정책 + scaled content abuse 정리
- [✅] YMYL 적용 + 한국 사이트 특유 신뢰 신호 추가
- [✅] 저자 프로필 + Schema.org Person/Article 구조화 데이터 예시 작성
- [✅] 30문항 자가 진단 체크리스트 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사-1 | WebSearch | "Google QRG E-E-A-T 2026 latest update PDF" | 현행 QRG 2025-09-11판 182쪽, AI Overview 평가·YMYL Gov/Civics/Society 추가 확인 |
| 조사-2 | WebSearch | "E-E-A-T Experience added December 2022" | 2022-12-15 Experience 추가, E-A-T → E-E-A-T 진화 확인 |
| 조사-3 | WebSearch | "Trust most important member E-E-A-T 2024" | "Trust is the most important member" QRG 명문 인용 확인 |
| 조사-4 | WebSearch | "AI generated content policy 2024 scaled content abuse" | 2024-03 코어 업데이트 + scaled content abuse 정책 공식화 확인 |
| 조사-5 | WebSearch | "Helpful Content self-assessment 32 questions" | 4개 묶음(Content/Expertise/Presentation/People-First) + 자가 점검 질문 셋 확인 |
| 조사-6 | WebSearch | "YMYL categories medical financial legal" | Health/Financial/Legal/Government·Civics·Society/News 카테고리 확인 |
| 조사-7 | WebFetch | developers.google.com/search/blog/2022/12 | 2022-12 도입 사실은 페이지 메타에서만 확인 (본문 fetch 제한) — 다른 소스로 교차 |
| 조사-8 | WebFetch | developers.google.com/search/docs/fundamentals/using-gen-ai-content | "AI 사용 자체 페널티 아님 + scaled content abuse 위반 가능" 공식 입장 확인 |
| 조사-9 | WebFetch | developers.google.com/search/docs/fundamentals/creating-helpful-content | 자가 점검 질문 4개 묶음(Content·Expertise·Presentation·People-First) 확인 |
| 조사-10 | WebSearch | "author byline schema.org Person Article E-E-A-T" | Person `@id` 참조 패턴, byline 모범 사례 확인 |
| 조사-11 | WebSearch | "About Us Contact trust signals QRG" | About Us 한 문단 = 불충분, Contact 필수, QRG 평가 기준 확인 |
| 조사-12 | WebSearch | "한국 통신판매업 신고 사업자 정보 표시" | 전자상거래법상 사업자 정보·신고번호 푸터 표시 의무 확인 |
| 교차 검증 | WebSearch | 12개 클레임을 독립 소스 2개 이상에서 대조 | VERIFIED 12 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Google Search Quality Rater Guidelines PDF | https://services.google.com/fh/files/misc/hsw-sqrg.pdf | ⭐⭐⭐ High | 2025-09-11 | 1순위 공식 |
| Google Search Central — E-E-A-T 도입 블로그 | https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t | ⭐⭐⭐ High | 2022-12-15 | 1순위 공식 |
| Google Search Central — Helpful Content | https://developers.google.com/search/docs/fundamentals/creating-helpful-content | ⭐⭐⭐ High | 현행 | 1순위 공식 |
| Google Search Central — Gen AI Content | https://developers.google.com/search/docs/fundamentals/using-gen-ai-content | ⭐⭐⭐ High | 현행 | 1순위 공식 |
| Google Search Central — QRG 업데이트 (2023-11) | https://developers.google.com/search/blog/2023/11/search-quality-rater-guidelines-update | ⭐⭐⭐ High | 2023-11 | 1순위 공식 |
| Search Engine Land — E-E-A-T 2022 changes | https://searchengineland.com/google-search-quality-rater-guidelines-changes-december-2022-390350 | ⭐⭐ Medium | 2022-12 | 업계 권위 매체 (교차 검증) |
| Search Engine Land — 2024 EEAT Knowledge Graph | https://searchengineland.com/unpacking-google-2024-eeat-knowledge-graph-update-440224 | ⭐⭐ Medium | 2024 | 교차 검증 |
| Search Engine Journal — Author Bio E-A-T | https://www.searchenginejournal.com/how-to-write-author-bios/417619/ | ⭐⭐ Medium | 최근 | 저자 byline 모범 사례 |
| Yoast — Author·Publisher Entities | https://yoast.com/author-publisher-entities-seo/ | ⭐⭐ Medium | 최근 | Schema.org Person 패턴 |
| 정부24 — 통신판매업 신고 안내 | https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=11300000006 | ⭐⭐⭐ High | 현행 | 한국 법적 기준 |
| 공정거래위원회 — 통신판매사업자 조회 | https://www.ftc.go.kr/www/selectBizCommList.do?key=254 | ⭐⭐⭐ High | 현행 | 한국 법적 기준 |

---

## 4. 검증 체크리스트 (Claim Verification)

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 1 | E-E-A-T는 2022-12 Experience 추가로 형성 | Google 공식 블로그 (2022-12) | Search Engine Land (2022-12) | VERIFIED |
| 2 | Trust가 E-E-A-T의 most important member | Google QRG Section 3.4 | 다수 SEO 권위 매체 인용 | VERIFIED |
| 3 | E-E-A-T는 직접 랭킹 신호가 아님 | Google 공식 입장 (블로그) | Search Engine Land, Yoast | VERIFIED |
| 4 | QRG 현행판은 2025-09-11 발행 | broworks.net / seo-kreativ.de (업계 매체) | services.google.com/fh PDF 페이지수 | VERIFIED |
| 5 | 2025-09 QRG에 AI Overview 평가 챕터 추가 | 업계 매체 다수 | seo-kreativ.de | VERIFIED |
| 6 | YMYL Society → "Government, Civics & Society"로 명칭 변경 (2025-09) | 업계 매체 분석 | broworks.net | VERIFIED |
| 7 | 2024-03 코어 업데이트로 Helpful Content가 코어에 통합 | Google 공식 블로그 (2024-03) | Amsive, Animalz | VERIFIED |
| 8 | 2024-03에 scaled content abuse 정책 도입 | Google 공식 spam policies | Search Engine Land, digitalapplied.com | VERIFIED |
| 9 | AI 콘텐츠 자체는 페널티 아님 | Google Gen AI Content 공식 문서 | Search Atlas, contentellect | VERIFIED |
| 10 | Helpful Content 자가 점검은 4개 묶음(Content·Expertise·Presentation·People-First) | Google Helpful Content 공식 문서 | Amsive, immwit | VERIFIED |
| 11 | YMYL 카테고리 = Health/Financial/Legal/Gov·Civics·Society/News/큰 거래 Shopping | QRG | Semrush, Clearscope, Taboola | VERIFIED |
| 12 | 한국 사이트는 사업자 정보·통신판매업 신고번호 푸터 표시가 법적 의무 | 정부24 / 공정위 | 토스페이먼츠 가이드, Shopify KR | VERIFIED |

**최종 판정 분포:** VERIFIED 12 / DISPUTED 0 / UNVERIFIED 0

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-02
**수행자**: skill-tester → general-purpose (writing 전용 에이전트 미존재, general-purpose 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. "블로그를 AI로 양산하고 있는데 Google 페널티가 두렵다. 어떻게 해야 안전한가?"**
- PASS
- 근거: SKILL.md "7. AI 생성 콘텐츠와 E-E-A-T" 섹션 (7-1, 7-2, 7-3, 7-5)
- 상세: "AI 사용 자체는 페널티가 아니다"(7-1), scaled content abuse 정의·조건(7-2), 7단계 안전 워크플로우(7-3), 함정 테이블(7-5)가 모두 명시되어 있어 정확한 답변 도출 가능. anti-pattern("AI 사용 자체가 페널티") 배제 명확.

**Q2. "의료 정보 사이트(YMYL)에 E-E-A-T 어떻게 강화? 저자 표기·검토 절차 등"**
- PASS
- 근거: SKILL.md "4. 저자(Author) 표기" 섹션 (4-1, 4-2, 4-3) + "6. YMYL 콘텐츠" 섹션 (6-2)
- 상세: 의료 YMYL 자격 표기 예시(4-3), 저자 필수 7요소 체크리스트(4-1), Schema.org Article+Person 코드 예시(4-2), YMYL 강화 체크리스트(6-2 — 전문가 검토·면책 조항·응급 안내 포함)가 모두 존재.

**Q3. "Google E-E-A-T가 직접 랭킹 신호인가, 보조 개념인가? 가장 중요한 요소는?"**
- PASS
- 근거: SKILL.md "1-3. E-E-A-T는 직접 랭킹 신호가 아니다" 섹션 + "2. Trustworthiness가 최상위인 이유" 섹션
- 상세: "랭킹 신호가 아닌 방향 제시 역할" 명시(1-3), 실무 함의까지 정리("E-E-A-T 점수를 올린다" 표현 부정확 → 올바른 표현 제시), QRG 원문 인용으로 Trust 최상위 근거 제시(2-1).

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md 기반으로 충분하고 정확한 답변 도출 가능.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (개념·프레임워크 정리 스킬 — content test PASS = APPROVED)
- 최종 상태: APPROVED

---

> (참고용 원본 템플릿 — 미수행 기록)
> CLI 환경에서 skill-tester 호출을 통한 agent content test 미수행. 작업 지시에 따라 본 단계는 생략하며 status는 PENDING_TEST 유지.
>
> 수행일: (미수행 — 후속 skill-tester 호출 예정)
> 수행 방법: SKILL.md 작성 + 12개 핵심 클레임을 공식 소스 + 업계 권위 매체로 교차 검증한 내용 검증까지 완료. CLI agent 활용 테스트는 후속 단계로 이관.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (12/12 VERIFIED) |
| 구조 완전성 | ✅ (frontmatter, 소스, 검증일, 14개 섹션) |
| 실용성 | ✅ (30문항 체크리스트 + 7일 액션 플랜 포함) |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-06-02, skill-tester → general-purpose) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 agent content test 수행 (Q1~Q3 PASS 확인) (2026-06-02 완료, 3/3 PASS)
- [❌] YMYL 분야별 디테일은 별도 스킬 `seo/ymyl-content-seo`로 분리 검토 — 차단 요인 아님, 선택 보강 (본 스킬 프레임워크 수준으로 충분)
- [❌] GEO·AI 검색과의 시너지 부분은 별도 스킬 `seo/geo-ai-discoverability`로 분리 검토 — 차단 요인 아님, 선택 보강 (본 스킬 섹션 10에서 개요 수준 커버)
- [❌] 2026년 새 QRG 업데이트(연 1~2회 발생) 시점에 스킬 재검증 — 차단 요인 아님, 정기 유지보수 항목 (현행 QRG 2025-09-11판 기준 APPROVED)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-02 | v1 | 최초 작성. Google QRG 2025-09-11판 + Helpful Content 2024-03 통합본 + Gen AI 가이드 기반. 12개 핵심 클레임 모두 VERIFIED. | skill-creator |
| 2026-06-02 | v1 | 2단계 실사용 테스트 수행 (Q1 AI 양산 블로그 안전 사용법 / Q2 의료 YMYL E-E-A-T 강화 / Q3 E-E-A-T 랭킹 신호 여부+최상위 요소) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
