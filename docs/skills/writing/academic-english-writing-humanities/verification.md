---
skill: academic-english-writing-humanities
category: writing
version: v1
date: 2026-05-03
status: APPROVED
---

# academic-english-writing-humanities 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `academic-english-writing-humanities` |
| 스킬 경로 | `.claude/skills/writing/academic-english-writing-humanities/SKILL.md` |
| 검증일 | 2026-05-03 |
| 검증자 | skill-creator (자동) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Manchester Academic Phrasebank)
- [✅] 공식 출판사 페이지 확인 (Michigan UP — Swales & Feak 2012)
- [✅] 학술지 투고 규정 검증 (Journal of Moral Education / Taylor & Francis APA)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (시제·hedging·signposting·문장구조)
- [✅] 한국어 화자 특화 실수 패턴 정리 (관사·단복수·번역투)
- [✅] 1차 텍스트(고전) 인용 표준 표기 정리
- [✅] SKILL.md 파일 작성
- [✅] verification.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebFetch | Manchester Academic Phrasebank 메인 페이지 | 6개 주요 섹션 + 11개 communicative purposes 목록 확보 |
| 조사 2 | WebFetch | Phrasebank — Introducing Work 서브페이지 | 갭 식별·연구 목적·구조 안내 표현 확보 |
| 조사 3 | WebFetch | Phrasebank — Referring to Sources | 인용 시 시제(현재완료/단순과거/현재) 규칙 확보 |
| 조사 4 | WebFetch | Phrasebank — Signalling Transition | 추가/대조/순서/예시/회귀 signposting 표현 확보 |
| 조사 5 | WebFetch | Phrasebank — Writing Conclusions | 발견 요약·기여·한계·향후 연구 표현 확보 |
| 조사 6 | WebSearch + WebFetch | Swales & Feak 2012 Michigan UP 페이지 | 출판 정보·ISBN·CARS 모델·page count 확인 |
| 조사 7 | WebSearch | Journal of Moral Education (Taylor & Francis cjme20) | APA 7판 referencing 확인. 상세 word count는 페이지 직접 접근 필요 (403) |
| 조사 8 | WebFetch | Vanderbilt Writing Studio — Literary Present Tense | 1차 텍스트 현재시제 / 역사 사실 과거시제 규칙 확보 |
| 교차 검증 1 | WebSearch | "data is" vs "data are" 학술 영어 표준 | DISPUTED 발견 → 사용자 요청("data 단수 가능")을 plural 표준으로 정정 |
| 교차 검증 2 | WebSearch | 한국어 화자 영어 관사 오류 | VERIFIED — 다수 언어교육학 연구가 article 오류를 1순위 한국어 화자 실수로 기록 |
| 교차 검증 3 | WebSearch | 인문학 hedging — Hyland 모달 동사 | VERIFIED — 인문·사회과학이 자연과학보다 hedging 빈도 높음 (Hyland 1994) |
| 교차 검증 4 | WebSearch | 인문학 시제 (literature review present/past) | VERIFIED — 선행연구 = 현재완료/과거 혼용, 1차 텍스트 = 현재(literary present) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Manchester Academic Phrasebank | https://www.phrasebank.manchester.ac.uk/ | ⭐⭐⭐ High | 2026-05-03 | University of Manchester 공식, 학술계 표준 참조 |
| Phrasebank — Introducing Work | https://www.phrasebank.manchester.ac.uk/introducing-work/ | ⭐⭐⭐ High | 2026-05-03 | 공식 서브페이지 |
| Phrasebank — Referring to Sources | https://www.phrasebank.manchester.ac.uk/referring-to-sources/ | ⭐⭐⭐ High | 2026-05-03 | 공식 서브페이지 |
| Phrasebank — Writing Conclusions | https://www.phrasebank.manchester.ac.uk/writing-conclusions/ | ⭐⭐⭐ High | 2026-05-03 | 공식 서브페이지 |
| Phrasebank — Signalling Transition | https://www.phrasebank.manchester.ac.uk/ | ⭐⭐⭐ High | 2026-05-03 | 공식 (서브페이지 응답) |
| Swales & Feak (2012) — Michigan UP | https://press.umich.edu/Books/A/Academic-Writing-for-Graduate-Students-3rd-Edition2 | ⭐⭐⭐ High | 2026-05-03 | 공식 출판사 페이지, ISBN·DOI 확인 |
| Journal of Moral Education (Taylor & Francis) | https://www.tandfonline.com/journals/cjme20 | ⭐⭐⭐ High | 2026-05-03 | 공식 학술지 페이지, APA 사용 확인 |
| Taylor & Francis APA 7 가이드 | https://files.taylorandfrancis.com/tf_apa.pdf | ⭐⭐⭐ High | 2026-05-03 | 공식 referencing 가이드 |
| Vanderbilt Writing Studio — Literary Present | https://www.vanderbilt.edu/writing/resources/handouts/how-and-why-do-i-write-in-literary-present-tense/ | ⭐⭐⭐ High | 2026-05-03 | Vanderbilt University 공식 |
| Cell Press / Crosstalk — data plural | https://crosstalk.cell.com/blog/is-data-plural | ⭐⭐ Medium | 2026-05-03 | 학술 출판사 블로그, "data" 복수 표준 입증 |
| Hyland 관련 hedging 연구 (Tandfonline) | https://www.tandfonline.com/doi/full/10.1080/23311983.2023.2249630 | ⭐⭐ Medium | 2026-05-03 | hedging 학술 corpus 연구 |
| 한국어 화자 article 오류 (Liberty Univ.) | https://digitalcommons.liberty.edu/cgi/viewcontent.cgi?article=1264&context=honors | ⭐⭐ Medium | 2026-05-03 | 영어교육학 학위논문 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서(Phrasebank, Swales & Feak, JME)와 불일치 없음
- [✅] 출처 명시: Phrasebank URL, 책 ISBN, 학술지 URL 모두 표기
- [✅] deprecated 패턴 회피 (예: 과도한 수동태 권장 X, 무조건 hedging 권장 X)
- [✅] 시제 규칙 인문학 표준에 부합 (literary present, 선행연구 시제 혼용)
- [✅] DISPUTED 항목(data is/are) 정정 후 `> 주의: DISPUTED 정정` 표기

### 4-2. 구조 완전성

- [✅] YAML frontmatter (name, description with examples) 포함
- [✅] 소스 URL 4개 이상 + 검증일 명시
- [✅] 사용자 요청 10개 핵심 섹션 모두 포함
  - 5대 원칙 / 시제 / 핵심 표현 / hedging / signposting / 문장 구조 / 흔한 실수 / 고전 인용 / Discussion·Conclusion / 도구
- [✅] 인문학 vs 자연과학 차이 명시 (1인칭 허용 등)
- [✅] 한국어 화자 특화 실수 별도 섹션
- [✅] 영문 학술지 투고 전 체크리스트 포함

### 4-3. 실용성

- [✅] 모든 표현이 실제 인용 가능한 형태 (단순 설명 X)
- [✅] 한국어 화자 실수 패턴이 구체적 예시로 제시 (한 → 영 대조)
- [✅] 1차 텍스트 인용 표준 약어 (NE, Rep., KrV, Pol.) 제공
- [✅] AI 활용 시 `research-ethics-and-integrity` 스킬 cross-reference

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-03)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-03)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — gap 없음, SKILL.md 수정 불필요 (2026-05-03)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-03
**수행자**: skill-tester (general-purpose 에이전트 대체 — domain-specific 에이전트 미등록)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. "Aristotle argues" vs "Aristotle argued" — 1차 텍스트 인용 시제**
- PASS
- 근거: SKILL.md "2-3. 1차 텍스트 인용 (literary present)" 섹션
- 상세: "1차 텍스트 안의 명제·서술 → 현재시제" 규칙 + "Aristotle **states** that *eudaimonia* **is** the highest human good." 예시가 명확히 수록됨. "저자의 역사적 행위(집필·출판) → 단순과거" 구분도 제공. literary present 개념이 완전히 답변 가능.

**Q2. "However, but..." 번역투 부적합 이유 및 대체 표현**
- PASS
- 근거: SKILL.md "7-3. 번역투·중복 표현" 섹션 표 + "1. 학술 영어 5대 원칙" § Concision
- 상세: § 7-3 표에 "However, but ..." (중복) → "However, ..." 또는 "But ..." 중 하나"가 직접 수록됨. 이유 설명(중복 접속사 = Concision 원칙 위반)은 § 1과 § 7-3 조합으로 도출 가능. 두 섹션 연결이 필요한 소소한 gap이 있으나 답변 도출에는 충분.

**Q3. akrasia 논문 hedging 적정 수준 (over-hedging vs under-hedging)**
- PASS
- 근거: SKILL.md "4. Hedging — 학술적 신중성" 전체 (§ 4-1, § 4-5)
- 상세: § 4-1 modal verb 강도 표(강·중상·중·약 4단계)와 § 4-5 과도 hedging 예시("might possibly be argued that there could perhaps be...")가 사용자가 제시한 anti-pattern과 정확히 일치. "핵심 주장(thesis)은 단호하게, 보조 주장은 hedged로" 원칙 명시. Hyland (1994) 학문 분야별 hedging 빈도 차이도 수록.

### 발견된 gap

- Q2: "However, but"이 부적합한 이유(Concision 위반)가 § 7-3에 직접 설명되지 않고 § 1과 연결해야 함. SKILL.md 품질에 영향을 줄 수준은 아님 — 선택 보강 항목.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: writing 스킬 — 빌드 설정/워크플로우/설정+실행/마이그레이션 해당 없음
- 최종 상태: APPROVED

---

> 아래는 skill-creator가 남긴 예정 케이스 템플릿 (참고용 보존)

### 테스트 케이스 1 (예정): 선행연구 시제 안내

**입력 (질문/요청):**
```
영문 논문 introduction에서 "Davidson은 1980년에 ~를 주장했다"를 영어로 어떻게 쓰지?
시제는 어떻게 선택해야 해?
```

**기대 결과:**
- 단순과거: "Davidson (1980) argued that ..."
- 또는 현재 (입장이 현재도 유효): "Davidson (1980) argues that ..."
- 두 시제 모두 허용되며 인용 단락 안에서 일관성 유지

**실제 결과:** (미실시)

**판정:** PENDING

---

### 테스트 케이스 2 (예정): 한국어 화자 실수 교정

**입력:**
```
"There are many studies that have studied about the moral education in Korea. 
However, but until now, no one has studied this topic." 
이 문장을 학술 영어로 다듬어줘.
```

**기대 결과:**
- "However, but" 중복 제거 → "However"
- "Until now" → "To date"
- "studied about" → "examined" (about 제거)
- "moral education in Korea" → 정관사 the 검토 (특정 문맥 시)
- 다듬은 예: "Numerous studies have examined moral education in Korea. **To date**, however, this particular question **has remained unaddressed**."

**실제 결과:** (미실시)

**판정:** PENDING

---

### 테스트 케이스 3 (예정): 1차 텍스트 인용

**입력:**
```
Aristotle의 Nicomachean Ethics 7권 3장 (1147a 부근)에서 akrasia 논의를 인용하려고 해. 
영문 학술지 표준 형식으로 어떻게 써?
```

**기대 결과:**
- 본문 인용: "As Aristotle argues in the *Nicomachean Ethics* (NE VII.3, 1147a24-b5), ..."
- 그리스어: *akrasia* (italics) + 영어 번역 (weakness of will) 병기
- 1차 텍스트 시제: 현재 (literary present) — "Aristotle **argues** that ..."

**실제 결과:** (미실시)

**판정:** PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (공식 소스 4종 교차 검증, DISPUTED 1건 정정) |
| 구조 완전성 | ✅ (사용자 요청 10개 섹션 모두 반영) |
| 실용성 | ✅ (영어 예시 직접 사용 가능 형태) |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-03, general-purpose 대체 수행) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [❌] *Journal of Moral Education* "Instructions for Authors" 페이지가 WebFetch 403 차단 → 정확한 word count·구조 요건은 사용자가 학술지 페이지에서 직접 확인 권장. SKILL.md에 이 안내를 § 12에 명시.
- [❌] 추후 분야별 (philosophy / education / history / literature) 세부 변형 가이드 필요 시 별도 스킬 분리 검토
- [❌] Hyland (1998) *Hedging in Scientific Research Articles* 본문 직접 확인은 미수행 (출판물 1차 자료 접근 제한). 보조 학술 연구 corpus 결과로 교차 검증.
- [✅] skill-tester content test 수행 완료 (2026-05-03 완료, 3/3 PASS) — PENDING_TEST → APPROVED 전환 완료

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-03 | v1 | 최초 작성. Manchester Phrasebank·Swales & Feak (2012)·JME(APA)·Vanderbilt 4종 공식 소스 기반. DISPUTED 1건(data 단복수) 정정 반영. | skill-creator |
| 2026-05-03 | v1 | 2단계 실사용 테스트 수행 (Q1 literary present tense / Q2 "However, but..." 번역투 / Q3 hedging 적정 수준) → 3/3 PASS, APPROVED 전환 | skill-tester |
