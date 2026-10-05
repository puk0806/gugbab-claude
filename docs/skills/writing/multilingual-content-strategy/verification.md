---
skill: multilingual-content-strategy
category: writing
version: v2
date: 2026-09-26
status: APPROVED
---

# 검증 문서 — multilingual-content-strategy

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `multilingual-content-strategy` |
| 스킬 경로 | `.claude/skills/multilingual-content-strategy/SKILL.md` |
| 검증일 | 2026-09-26 |
| 검증자 | skill-creator / 2026-09-26 재검증: 메인 세션 (Google Search Central 원문 직접 대조) |
| 스킬 버전 | v2 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Google Search Central, JFTC)
- [✅] 공식 GitHub/공인 표준 2순위 확인 (W3C i18n, BCP 47)
- [✅] 최신 기준 내용 확인 (2026-06-04)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (10개 섹션)
- [✅] 코드 예시 작성 (hreflang HTML)
- [✅] 흔한 실수 패턴 정리 (10개)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | "Yahoo Japan Google search switch 2023" | Yahoo Japan-Google 파트너십은 2010년 시작, 2025년 만료 예정 — *2023년 전환은 사실 아님* |
| 조사 2 | WebSearch + WebFetch | Google Search Central — March 2024 spam policies | Scaled content abuse 정책 2024-03 발표 확인, 자동 번역 명시적 포함 |
| 조사 3 | WebSearch | Baidu ICP license 요건 | ICP는 본토 호스팅 법적 요건, Baidu 랭킹 간접 영향 — VERIFIED |
| 조사 4 | WebSearch + WebFetch | hreflang zh-CN/zh-TW/zh-Hans/zh-Hant Google 공식 | Google은 ISO 639-1 + ISO 3166-1 Alpha-2 + ISO 15924 스크립트 코드 지원 — zh-CN/zh-TW와 zh-Hans/zh-Hant 모두 유효 |
| 교차 검증 | WebSearch | 4개 핵심 클레임, 독립 소스 2~3개씩 | VERIFIED 3 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Google Search Central — Localized versions | https://developers.google.com/search/docs/specialty/international/localized-versions | ⭐⭐⭐ High | 2026-06-04 | hreflang 공식 가이드 |
| Google Search Central Blog — March 2024 core update | https://developers.google.com/search/blog/2024/03/core-update-spam-policies | ⭐⭐⭐ High | 2024-03 발표 | Scaled content abuse 정책 |
| 일본 공정거래위원회(JFTC) — Yahoo Japan/Google 2010 | https://www.jftc.go.jp/en/pressreleases/yearly-2010/dec/individual-000002.html | ⭐⭐⭐ High | 2010 발표 | Yahoo-Google 파트너십 시점 근거 |
| Yahoo Japan — Wikipedia | https://en.wikipedia.org/wiki/Yahoo_Japan | ⭐⭐ Medium | 2026 갱신 | 2010 이후 파트너십 / 2025 만료 보도 종합 |
| Phys.org — Yahoo Japan adopts Google 2010 | https://phys.org/news/2010-07-yahoo-japan-google.html | ⭐⭐ Medium | 2010-07 | 2010년 전환 사실 보강 |
| Hilborn Digital — Baidu ICP | https://www.hilborndigital.com/icp-license-need-one-baidu-seo/ | ⭐⭐ Medium | — | Baidu ICP SEO 영향 |
| Sinorbis — ICP China license | https://blog.sinorbis.com/chinese-icp-license | ⭐⭐ Medium | — | ICP 법적 요건 |
| Dragon Metrics — Baidu Technical SEO | https://www.dragonmetrics.com/technical-on-page-seo-guide-baidu/ | ⭐⭐ Medium | — | Baidu 기술 SEO |
| W3C i18n — Language tags (BCP 47) | https://www.w3.org/International/articles/language-tags/ | ⭐⭐⭐ High | — | 언어 태그 표준 |
| Search Engine Journal — Google translated content | https://www.searchenginejournal.com/is-google-okay-with-minor-tweaks-to-machine-translations/468763/ | ⭐⭐ Medium | — | MT 정책 해석 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 1건 *수정 후* 주의 표기 반영)
- [✅] 버전 정보가 명시되어 있음 (검증일 2026-06-04, March 2024 정책 명시)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임 (hreflang HTML)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (Translation/L10n/Transcreation/i18n)
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (의사결정 트리)
- [✅] 흔한 실수 패턴 포함 (10개)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 다국어 콘텐츠 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (언어별 표·체크리스트)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. 핵심 클레임별 교차 검증 결과

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | "Yahoo! Japan: 2023년 6월 구글 검색 엔진 전환 완료" (사용자 입력 원문) | **DISPUTED** → SKILL.md에서 수정 | Yahoo Japan은 **2010년부터** Google 검색 기술 기반 운영 (JFTC 2010 발표, Wikipedia, Phys.org 2010-07 다수 일치). 2023년 전환은 사실 아님. 단, 2025년 파트너십 만료 보도 별도 표기 |
| 2 | "Baidu SEO: 중국 본토 호스팅·ICP 라이선스 권장" | **VERIFIED** (조건부) | ICP는 본토 호스팅에 법적 필수. Baidu 직접 랭킹 요건은 아니지만 ICP 없으면 유기 노출 저하 — Hilborn·Sinorbis·Dragon Metrics 다수 일치 |
| 3 | "Google Scaled content abuse 정책 — 자동 번역 명시 포함 (March 2024)" | **VERIFIED** | Google Search Central Blog 2024-03 공식 게시. "automated transformations like synonymizing, translating" 원문 포함 |
| 4 | "hreflang zh-CN vs zh-TW 분리 / zh-Hans·zh-Hant 스크립트 코드도 유효" | **VERIFIED** | Google Search Central 공식 — ISO 639-1 + ISO 3166-1 Alpha-2 + ISO 15924 모두 지원. zh-Hans-US 같은 조합도 명시 |
| R1 | #3 scaled content abuse 인용문 | Spam policies 문서 원문(2026-08-28 수정본) | **DISPUTED→수정 (2026-09-26)** — 구절은 "Scraping feeds … (including through automated transformations like … translating …)"로 *스크래핑 변형* 예시. 앞부분 누락 인용 교정, 출처를 blog→spam policies 문서로 정정 |
| R2 | #4 hreflang 규칙 | localized-versions 문서 원문(2026-09-21 수정본) | VERIFIED — es-419 미지원·대소문자 무관 보완 |
| R3 | #1 Yahoo Japan 2010 Google 기반·2025 만료·NAVER 검토 | JFTC 페이지 접속 차단, 영문 위키백과(2차) | 2010 기반: 기존 판정 유지 / **2025 이후 상태 UNVERIFIED→`주의: 미검증`** |
| R4 | 일본어 문체 용어 "상체" | 일본어 문법 용어 敬体/常体 | **DISPUTED→수정** (표기 오류) |

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-04 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 불필요 — 3/3 PASS)

---

## 5. 테스트 진행 기록

### skill-tester 재테스트 (2026-09-28, 2026-09-26 정정 2건 반영 확인)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (writing 전용 에이전트 미존재, general-purpose 대체) x2
**수행 방법**: SKILL.md만 근거로 답하도록 지시한 general-purpose 서브에이전트 2개에 질문 위임. 2026-09-26 정정 2건(①scaled content abuse 인용 앞부분 누락·출처 정정 ②일본어 문체 용어 "상체"→敬体/常体 정정) 각각을 직접 겨냥

**Q1. "です/ます체와 だ/である체를 일본어 문법 용어로 각각 뭐라고 불러? 'です/ます체'는 '상체'라고 부르는 게 맞아?"**
- ✅ PASS
- 근거: SKILL.md §2-3(71행) "です/ます체(敬体, 정중체) vs だ/である체(常体, 보통체) ... (이전 판 '상체' 표기 정정)"
- 상세: 옛 오기 "상체"를 긍정하지 않고 정정된 용어(敬体/정중체, 常体/보통체)를 정확히 인용해 반박. 정정 ②가 답변에 정확히 반영됨, 옛 용어와의 혼동 없음.

**Q2. "March 2024 spam policy의 '자동 번역(translating)' 언급이 정확히 어떤 맥락이야? DeepL로 자체 콘텐츠 번역해서 올리는 것도 위반이야?"**
- ✅ PASS
- 근거: SKILL.md §5-2(186~189행) 원문 인용 "Scraping feeds ... including through automated transformations like synonymizing, translating ..." + "이 예시는 남의 콘텐츠를 긁어와 ... 본인 콘텐츠의 번역 자체를 금지하는 문장은 아니다" + "MT 자체가 자동 페널티 대상은 아니다"
- 상세: 문장 구조(scraping이 핵심 행위, translating은 변형 수법 중 하나)를 정확히 분해해 "자동 번역=무조건 스팸"이 아님을 도출. 정정 ①(인용 앞부분 누락 교정)이 답변에 정확히 반영됨. 사람 검토 없는 대량 MT 배포는 별도 위험(생성형 AI 무가치 대량생산 조항)이라는 균형 잡힌 부연도 SKILL.md 근거로 정확히 인용.

### 발견된 gap (2026-09-28)

없음 — 정정 2건(①②) 모두 재테스트 Q1·Q2로 직접 확인, 옛 내용(상체·인용 누락) 잔존·모순 없음.

### 판정 (2026-09-28)

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (라이브러리·패턴 정리형 스킬 — content test PASS = APPROVED)
- 최종 상태: APPROVED (2026-09-26 정정 2건 전체 반영 확인 완료)

### 재검증 기록 (2026-09-26)

**수행일**: 2026-09-26
**수행자**: 메인 세션 재검증 (공식 문서 대조 후 SKILL.md 자체 답변 확인)
**수행 방법**: §4-4 #3·#4·R1~R4 대조 → 정정 2건 → 실전 질문 2개

Q1. "우리 블로그 글을 DeepL로 번역해 올리면 Google 스팸 정책 위반이야?" — PASS (근거: §5-2 정정 — 원문 예시는 스크래핑 콘텐츠의 자동 변형 대량 생산. 자체 콘텐츠 번역 자체는 금지 아님, 단 가치 없는 대량 배포는 위험 → 후편집)
Q2. "중남미 스페인어 페이지에 hreflang='es-419' 써도 돼?" — PASS (근거: §5-1 — Google은 ISO 3166-1 Alpha-2만 지원, es-419 미지원 원문 명시)

agent content test: 2/2 PASS (재검증 기록). 인용 맥락 정정으로 status PENDING_TEST 전환.

### 최초 테스트 (2026-06-04)

**수행일**: 2026-06-04
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 이메일 헤드라인 vs 개인정보처리방침 — Translation/Transcreation 선택**
- PASS
- 근거: SKILL.md 섹션 1 표 (Translation = 법적·계약 문서, Transcreation = 광고·헤드라인), 섹션 4 의사결정 트리, 섹션 8 실수 8번 ("법적 약관·개인정보 처리방침을 Transcreation → 분쟁 위험")
- 상세: 개인정보처리방침 = Translation(법적 문서), 이메일 헤드라인 = Transcreation(감정·브랜드 임팩트). 근거 3개 섹션에서 일치하게 확인됨.

**Q2. `hreflang="uk"` 유효 여부 — 영국 지역 코드 함정**
- PASS
- 근거: SKILL.md 섹션 5-1 "지역 코드만 단독 사용 불가", 섹션 8 실수 6번 ("`hreflang='uk'`는 무효 — 영국은 `gb`")
- 상세: ISO 3166-1 Alpha-2 기준 영국 코드는 `gb`, 올바른 표기는 `en-GB`. SKILL.md에 구체적 예시로 명시되어 있어 오답 도출 불가능.

**Q3. DeepL 자동 번역 200개 페이지 그대로 배포 — Google 정책 위반 여부**
- PASS
- 근거: SKILL.md 섹션 5-2 (Scaled content abuse, March 2024 core update, 공식 인용 포함), 섹션 7 Full PE 기준, 섹션 8 실수 7번 ("MT 결과를 사람 검토 없이 대량 배포 → 스팸 정책 위반 가능")
- 상세: MT 자체는 금지 아님. 사람 후편집(post-editing) 없이 대량 배포가 위반 요건. Full PE 적용 시 위반 회피 가능. SKILL.md에 공식 인용까지 포함되어 있어 근거 충분.

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md에서 근거 섹션 및 코드/예시를 충분히 제공함.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리·패턴 정리형 스킬 → content test PASS = APPROVED 전환 가능
- 최종 상태: APPROVED

---

> 아래는 skill-tester 수행 전 참고용 템플릿 (이력 보존)

### 테스트 케이스 1: (완료 — 위 실제 수행 테스트 참조)

---

### 테스트 케이스 2: (완료 — 위 실제 수행 테스트 참조)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 1건 수정 반영, 주의 표기) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-06-04 수행) / 2026-09-26 재검증 2/2 PASS / 2026-09-28 skill-tester 재테스트 2/2 PASS |
| **최종 판정** | **APPROVED** (2026-09-26 재검증 정정 2건을 2026-09-28 skill-tester 재테스트 Q1·Q2로 각각 직접 확인 완료) |

---

## 7. 개선 필요 사항

- [❌] Yahoo Japan-Google 파트너십 2025년 만료 후 변경 시 본 스킬 재검증 (2025년 말 ~ 2026년 초 재확인 권장)
- [❌] Baidu SEO 세부 가이드를 별도 스킬(`frontend/baidu-seo-specifics`)로 분리 검토
- [❌] 시장별 색상 의미 매핑은 일반화된 경향만 기록 — 산업·세대별 실증 자료 추가 시 보강
- [✅] skill-tester 2단계 테스트 수행 (2026-06-04 완료, 3/3 PASS)
- [✅] 2026-09-26 재검증 정정 2건에 대한 skill-tester 재테스트 (2026-09-28 완료, 2/2 PASS — ①scaled content abuse 인용 맥락 ②일본어 문체 용어 반영 확인)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-04 | v1 | 최초 작성. Yahoo Japan 클레임 DISPUTED 판정 반영, 4개 핵심 클레임 교차 검증 완료 | skill-creator |
| 2026-06-04 | v1 | 2단계 실사용 테스트 수행 (Q1 Translation/Transcreation 선택 / Q2 hreflang 영국 코드 / Q3 MT 대량 배포 정책) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-26 | v2 | 재검증 — Google localized-versions(2026-09-21)·spam policies(2026-08-28) 원문 대조 5건, 정정 2건(scaled content abuse 인용 앞부분 누락·출처, 일본어 문체 용어), 미검증 1건(Yahoo Japan 2025 이후 상태), es-419 미지원 보완, 실전 질문 2/2 PASS → PENDING_TEST | 메인 세션 (재검증) |
| 2026-09-28 | v2 | 2단계 실사용 재테스트 수행 (Q1 일본어 문체 용어 정정 확인 / Q2 scaled content abuse 인용 맥락 정정 확인) → 2/2 PASS, 2026-09-26 정정 2건 전체 반영 확인, PENDING_TEST → APPROVED 전환 | skill-tester |
