---
skill: akrasia-classroom-application-guide
category: education
version: v1.5
date: 2026-05-06
status: APPROVED
---

# akrasia-classroom-application-guide 스킬 검증

> 학위논문 5장 "akrasia 이론의 학교 도덕교육 적용" 실무 가이드 스킬에 대한 검증 기록.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `akrasia-classroom-application-guide` |
| 스킬 경로 | `.claude/skills/education/akrasia-classroom-application-guide/SKILL.md` |
| 검증일 | 2026-05-06 |
| 검증자 | skill-creator (Claude Opus 4.7) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 2022 개정 도덕과 「자신과의 관계」 영역 매핑 확인 (NCIC + 나무위키 교차)
- [✅] Kristjánsson(2015) *Aristotelian Character Education* 출판 정보 (Routledge) 확인
- [✅] Lickona(1991) *Educating for Character* 출판 정보 (Bantam) 확인
- [✅] Lickona, Schaps & Lewis(1996) "Eleven Principles" *JME* 25(1) 서지 확인
- [✅] Duhigg(2012) *The Power of Habit* 출판 정보 (Random House) + cue-routine-reward 구조 확인
- [✅] Blatt-Kohlberg(1975) "The Effects of Classroom Moral Discussion" *JME* 4(2) 확인
- [✅] Noddings(1984) *Caring* 출판 정보 (UC Press) + 부제 (feminine approach) 확인
- [✅] Narvaez(2014) *Neurobiology and the Development of Human Morality* (W.W. Norton) 확인
- [✅] 박재주(2011) "아크라시아와 도덕교육" KCI URL 확인 (ART001575952, *초등도덕교육* 36집)
- [✅] 박장호(2009) "아크라시아와 도덕교육: 도덕적 지식의 의미" KCI URL 확인 (ART001330038, *윤리연구* 72호)
- [✅] Jubilee Centre Framework "Building Blocks of Character" 4유형 + phronesis 메타-덕 확인
- [✅] Hagger et al.(2016) ego depletion 다중 재현 실패 결과 확인
- [✅] 21일 습관 형성 신화 vs Lally 연구 평균 66일 확인
- [✅] 한국 학교급별 차시 시간 (초 40분/중 45분/고 50분) 확인
- [✅] 단원 지도안 패턴·학생 활동 5종·평가 매트릭스·학년별 어휘 변환표 작성
- [✅] 흔한 실수·학생 안전 주의사항·5장 챕터 권장 구성 작성
- [✅] SKILL.md 파일 작성 완료
- [✅] verification.md 파일 작성 완료

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | docs/skills/VERIFICATION_TEMPLATE.md | 8섹션 구조 확인 |
| 중복 확인 | Glob | .claude/skills/**/akrasia-classroom-application-guide/SKILL.md | 신규 스킬 (중복 없음) |
| 연계 스킬 확인 | Read | 교육과정 연결 스킬(2026-09-26 moral-curriculum-2022-achievement-standards references로 병합), moral-education-pedagogy-models | 「자신과의 관계」 영역 매핑·8모형 카탈로그 확인 |
| 1차 검증 | WebSearch | Kristjánsson 2015, Lickona 1991, Duhigg 2012, Jubilee Centre framework | 4개 클레임 VERIFIED |
| 2차 검증 | WebSearch | Blatt-Kohlberg 1975, 2022 개정 도덕과 [9도01], 박재주 2011, Noddings 1984 | 4개 클레임 VERIFIED |
| 3차 검증 | WebSearch | 21일 습관 신화, 박장호 2009, ego depletion 재현, Lickona 11원리 | 4개 클레임 VERIFIED (재현 위기 명시 포함) |
| 4차 검증 | WebSearch | 한국 학교 차시 시간, Narvaez 2014 Norton | 2개 클레임 VERIFIED |
| 작성 | Write | SKILL.md 14개 절 (절 0–14) | 약 13,500자 작성 완료 |
| 검증 문서 | Write | verification.md 8섹션 | PENDING_TEST 상태로 저장 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Routledge — Aristotelian Character Education | https://www.routledge.com/Aristotelian-Character-Education/Kristjansson/p/book/9781138737945 | ⭐⭐⭐ High | 2026-05-06 | 1st ed. 2015-04-29, ISBN 978-1138804753, 198pp |
| Jubilee Centre — Professor Kristjánsson | https://www.jubileecentre.ac.uk/about/professor-kristjan-kristjansson/ | ⭐⭐⭐ High | 2026-05-06 | 저자 소속 공식 페이지 |
| ERIC ED337451 — Lickona 1991 | https://eric.ed.gov/?id=ED337451 | ⭐⭐⭐ High | 2026-05-06 | Bantam Books 1991 출판 확인 |
| SAGE — Anne Wescott Dodd 서평 | https://journals.sagepub.com/doi/10.1177/019263659207654519 | ⭐⭐⭐ High | 2026-05-06 | Educating for Character 1991 Bantam 인용 |
| Tandfonline — Lickona 1996 11 Principles | https://www.tandfonline.com/doi/abs/10.1080/0305724960250110 | ⭐⭐⭐ High | 2026-05-06 | JME 25(1) 93-100 |
| Tandfonline — Blatt & Kohlberg 1975 | https://www.tandfonline.com/doi/abs/10.1080/0305724750040207 | ⭐⭐⭐ High | 2026-05-06 | JME 4(2) 129-161 |
| Wikipedia — The Power of Habit | https://en.wikipedia.org/wiki/The_Power_of_Habit | ⭐⭐ Medium | 2026-05-06 | 2012 Random House 출판 + Habit Loop 구조 |
| Jubilee Centre — Framework PDF (3rd) | https://www.jubileecentre.ac.uk/wp-content/uploads/2024/12/The-Jubilee-Centre-Framework-for-Character-Education-in-Schools.pdf | ⭐⭐⭐ High | 2026-05-06 | Building Blocks 4유형 + phronesis 메타-덕 |
| W.W. Norton — Neurobiology and Development of Human Morality | https://wwnorton.com/books/Neurobiology-and-the-Development-of-Human-Morality/ | ⭐⭐⭐ High | 2026-05-06 | 2014 출판, ISBN 9780393706550, 456pp |
| UC Press / SearchWorks — Caring 1984 | https://searchworks.stanford.edu/view/4706657 | ⭐⭐⭐ High | 2026-05-06 | Noddings 1984 UC Press 초판 (feminine approach) |
| KCI — 박재주 2011 | https://www.kci.go.kr/kciportal/landing/article.kci?arti_id=ART001575952 | ⭐⭐⭐ High | 2026-05-06 | 초등도덕교육 36집, DOI 10.17282/ethics.2011..36.1 |
| KCI — 박장호 2009 | https://www.kci.go.kr/kciportal/landing/article.kci?arti_id=ART001330038 | ⭐⭐⭐ High | 2026-05-06 | 윤리연구 72호 131-161, DOI 10.15801/je.1.72.200903.131 |
| Frontiers — Ego Depletion Multilab Replication | https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2016.01155/full | ⭐⭐⭐ High | 2026-05-06 | Hagger et al. 2016, 23 labs N=2141, d=0.04 |
| 교육부 행복한교육 — 수업시간 40·45·50분 | https://happyedu.moe.go.kr/happy/bbs/selectHappyArticle.do?bbsId=BBSMSTR_000000005160&nttId=10180 | ⭐⭐⭐ High | 2026-05-06 | 교육부 공식 자료 |
| 나무위키 — 2022 개정 도덕과 중학교 | https://namu.wiki/w/2022%20%EA%B0%9C%EC%A0%95%20%EA%B5%90%EC%9C%A1%EA%B3%BC%EC%A0%95/%EB%8F%84%EB%8D%95%EA%B3%BC/%EC%A4%91%ED%95%99%EA%B5%90 | ⭐ Low | 2026-05-06 | 보조 참조 (NCIC 직접 확인 권장 명시) |
| 아주대 — 66일 법칙 칼럼 | https://www.ajou.ac.kr/kr/ajou/column.do?mode=view&articleNo=220092 | ⭐⭐ Medium | 2026-05-06 | 21일 신화 vs Lally 연구 비교 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] Kristjánsson 2015 출판사·연도·소속 (Routledge / 4월 29일 / Jubilee Centre 버밍엄)
- [✅] Lickona 1991 출판사 (Bantam Books)
- [✅] Lickona 1996 11원리 학술지 (JME 25(1))
- [✅] Duhigg 2012 출판사 + Habit Loop 3요소 (Random House / cue-routine-reward)
- [✅] Blatt-Kohlberg 1975 학술지 (JME 4(2))
- [✅] Noddings 1984 출판사 + 부제 (UC Press / Feminine Approach)
- [✅] Narvaez 2014 출판사·ISBN (W.W. Norton / 9780393706550)
- [✅] 박재주 2011 학술지·권호 (초등도덕교육 36집 1-30쪽)
- [✅] 박장호 2009 학술지·권호 (윤리연구 72호 131-161쪽)
- [✅] Jubilee Centre Framework 4유형 (intellectual·moral·civic·performance + phronesis)
- [✅] ego depletion 재현 실패 수치 (23 labs, N=2141, d=0.04)
- [✅] 한국 학교급 차시 시간 (40/45/50분)
- [✅] 21일 습관 신화 출처 (Maxwell Maltz)와 Lally 연구 차이

### 4-2. 구조 완전성

- [✅] YAML frontmatter (name, description) 포함
- [✅] 소스 URL과 검증일 명시 (절 머리)
- [✅] 14개 절 구성 — 사용 안내 / 영역 매핑 / 차시 패턴 / 활동 5종 / 평가 매트릭스 / 모형 결합 / 학년별 차이 / 지도안 예시 / 흔한 실수 / 현장 주의 / 인용 양식 / 5장 구성 / 심리학 실험 인용 주의 / 사용 시점 / 검증 한계
- [✅] 학년별 어휘 변환표 포함
- [✅] 4차시 단원 지도안 예시 포함 (중학교 1학년)
- [✅] 흔한 실수 패턴 9개 포함
- [✅] 학생 안전 주의사항 4개 항목 포함

### 4-3. 실용성

- [✅] 학위논문 5장 챕터 권장 구성을 직접 인용 가능한 형태로 제공
- [✅] 단원 지도안 차시별 표·도입 발문 예시·비교표 학생 작성 양식 포함
- [✅] 평가 매트릭스가 5종 도구 × 2022 개정 3범주 매핑 포함
- [✅] 도덕교육 8모형과 akrasia 결합 표가 학위논문 인용용 출처 표기 포함
- [✅] 학교 현장 적용 시 4개 위험 영역 + 대응책 제시
- [✅] 인용 권장 양식 (한국어 KCI + 영어 APA)

### 4-4. 클레임별 판정

| 클레임 | 판정 | 비고 |
|--------|------|------|
| Kristjánsson(2015) Routledge 출판 | VERIFIED | Routledge 공식 페이지 + Amazon ISBN 일치 |
| Lickona(1991) Bantam Books | VERIFIED | ERIC ED337451 + SAGE 서평 |
| Lickona et al.(1996) JME 25(1) 93-100 | VERIFIED | Tandfonline + ERIC EJ533384 |
| Duhigg(2012) Random House + Habit Loop | VERIFIED | Wikipedia + 다수 출처 일치 |
| Blatt & Kohlberg(1975) JME 4(2) | VERIFIED | Tandfonline + ERIC EJ115272 — 페이지 129-161 추가 확인 |
| Noddings(1984) UC Press *Feminine Approach* | VERIFIED | Stanford SearchWorks + Cambridge Core 서평 |
| Narvaez(2014) W.W. Norton | VERIFIED | 출판사 공식 페이지 |
| 박재주(2011) 초등도덕교육 36집 | VERIFIED | KCI ART001575952 직접 확인 |
| 박장호(2009) 윤리연구 72호 | VERIFIED | KCI ART001330038 직접 확인 (페이지 131-161) |
| Jubilee Centre 4유형 + phronesis | VERIFIED | Jubilee Centre 공식 PDF |
| ego depletion 재현 실패 (Hagger 2016) | VERIFIED | Frontiers + PMC 다중 출처 |
| 21일 습관 형성 신화 (Maltz 출처) | VERIFIED | 다수 한국어 매체 + Lally 비교 |
| 한국 학교급 차시 시간 (40/45/50) | VERIFIED | 교육부 행복한교육 |
| 2022 개정 도덕과 「자신과의 관계」 영역 | VERIFIED | 연계 스킬(교육과정 연결 스킬 — 현 moral-curriculum-2022-achievement-standards references/akrasia-curriculum-link.md) 검증분 + 검색 결과 일치 |
| [9도01-01] 성취기준 본문 일부 | UNVERIFIED 처리 | NCIC 별책 6 직접 확인 권장 (검증 한계 절에 명시) |

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-06)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-06)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 3/3 PASS, 보완 불필요 (2026-05-06)

---

## 5. 테스트 진행 기록

### [재검증] 2026-09-26 — Perseus 원문 대조 정정 1건(§9-3 번역본 서지) 재테스트

**수행일**: 2026-09-26
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 §10 원문 대조 정정 1건("이창우 외, 2006, 길" → 강상진·김재홍·이창우 옮김, 길, 2011)을 겨냥한 질문 1개 + 핵심 기능(akrates/akolastos 구분 활동 설계) 질문 1개, 근거 섹션 및 anti-pattern 회피 확인

**Q1. (정정 겨냥) 교사 준비도용 니코마코스 윤리학 한국어 번역본 정확한 서지(역자 순서·출판사·연도)**
- PASS
- 근거: SKILL.md "9-3. 교사 준비도" 표 "akrasia 이론 기초" 행
- 상세: "강상진·김재홍·이창우 옮김, 길, 2011 — 학술 인용 표준판 / 초판: 이제이북스, 2006"과 "기존 '2006, 길'은 출판사·연도 불일치로 정정(2026-09-26)"이라는 정정 이력을 정확히 인용해, 연도-출판사가 일치하는 조합(2011+길 또는 2006+이제이북스)으로 서지를 재구성함. anti-pattern(2006+길 혼용) 정확히 회피.

**Q2. (핵심 기능) 중학교 1학년 4차시 단원에서 akrates·akolastos 구분 활동 설계 + 동일 교정 전략 적용 가부**
- PASS
- 근거: SKILL.md "7-2. 차시별 설계"(2차시), "7-4. 2차시 핵심 비교표", "3-1. 활동 카탈로그"(시뮬레이션·역할극), "3-2. 활동 설계 시 핵심 원칙", "8. 흔한 실수" 표
- 상세: 2차시 비교표+역할극 활동을 정확히 인용하고, "akrates와 akolastos를 구분 안 하고 동일 교정 전략 적용" anti-pattern과 올바른 처리("akolastos는 가치관 재형성 필요 — akrates용 자기조절 전략은 부적합")를 정확히 근거로 제시.

### 발견된 gap (Perseus 정정 재테스트)

- 절 7-4 비교표에 실제 정답 예시 문구가 없고 "절 6-2+5축 참조"로만 지시됨 — 교사가 직접 재구성해야 함 (차단 요인 아님, 선택 보강)
- akolastos "가치관 재형성"이 절 3-1의 5개 활동 중 어느 것에 해당하는지 명시적 매핑 없음 (차단 요인 아님, 선택 보강)

### 판정 (Perseus 정정 재테스트)

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (교육 적용 가이드 — 빌드/워크플로우/설정+실행/마이그레이션 아님)
- 최종 상태: APPROVED (PENDING_TEST → APPROVED 전환)

---

**수행일**: 2026-05-06
**수행자**: skill-tester (general-purpose 대체 — humanities/education 전용 에이전트 미등록)
**수행 방법**: SKILL.md 전체 Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. akrasia·akolasia 구분을 중학교 수업에 도입하는 방법 + 4차시 지도안**
- PASS
- 근거: SKILL.md 절 6-1 "중학교 → 형식적 조작기, akrates ≠ akolastos 구분 도입", 절 6-2 학년별 어휘 변환표, 절 7 중학교 1학년 4차시 지도안 (7-1~7-4), 절 2 4단계 차시 구조
- 상세: 중학교 수준 단순화 방법(어휘 변환표), 4차시 45분 구성(차시별 학습목표·활동·평가), akrates vs akolastos 비교표(학생 작성용), 1차시 발문 예시까지 완비. "akolastos에게 akrates용 교정 전략 동일 적용" anti-pattern 명시 회피.

**Q2. 2022 개정 도덕과 「자신과의 관계」 영역 연결 + 학교급별 차이**
- PASS
- 근거: SKILL.md 절 1-1 4개 영역 관련성 표(「자신과의 관계」★★★), 절 1-2 학교급별 과목 표, 절 6-1 인지 발달 단계별 도입 깊이, 절 6-2 어휘 변환표
- 상세: 초3-4(구체적 조작기 → "마음의 두 목소리"), 초5-6(형식적 조작기 진입 → "옳음과 행동 사이의 차이"), 중학교(형식적 조작기 → akrates≠akolastos 한국어 도입), 고등(추상적 사고 → NE VII 직접 인용) 각 단계별 구분 완비. 성취기준 전문 미포함은 절 13에서 "moral-curriculum-2022-achievement-standards 스킬 참조"로 명시적 범위 분리 — gap 아님.

**Q3. 자기 성찰 활동의 수치심·낙인 위험 처리 + 평가 공정성 확보**
- PASS
- 근거: SKILL.md 절 9-1 학생 안전 4항목(수치심 노출·사적 경험 강제 공개·민감 사례·낙인 효과), 절 9-2 평가 공정성 3항목, 절 3-2 활동 설계 원칙 #3, 절 4-3 평가 설계 주의(사회적 바람직성 편향)
- 상세: 수치심 노출 → 익명 작성·자율 공유, 낙인 효과 → "행위 분석으로 한정·인격 분류 금지", 평가 공정성 → 출발점 진단 후 변화량 평가·학교 내 작성 시간 확보·동료평가 기준 사전 합의 모두 명시.

### 발견된 gap

- 없음. 3개 질문 모두 SKILL.md 내에서 근거 섹션을 명확히 확인.
- 성취기준 전문([9도01-01] 등)은 의도적으로 `moral-curriculum-2022-achievement-standards` 스킬에 위임 — 설계상 범위 분리, gap 아님.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 해당 없음 (마이그레이션·빌드 설정·워크플로우 카테고리 해당 없음)
- 최종 상태: APPROVED

---

> (참고 — 기존 미수행 템플릿)
> skill-tester를 통한 2단계 실사용 테스트 미수행 상태 → 2026-05-06 완료

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (14개 클레임 VERIFIED, 1개 UNVERIFIED는 NCIC 직접 확인 권장 명시 처리) |
| 구조 완전성 | ✅ (14개 절 + 학년별 변환표 + 차시 지도안 예시 + 인용 양식) |
| 실용성 | ✅ (5장 챕터 구성·차시 지도안·평가 매트릭스 직접 활용 가능) |
| 에이전트 활용 테스트 | ✅ (2026-05-06 완료 — 3/3 PASS) / Perseus 원문 대조 정정 재테스트 2/2 PASS (2026-09-26, general-purpose 대체) |
| **최종 판정** | **APPROVED** (2026-09-26 Perseus 원문 대조 정정 1건 반영 재테스트 2/2 PASS 완료 — PENDING_TEST → APPROVED 전환) |

---

## 7. 개선 필요 사항

- [❌] 2022 개정 도덕과 [9도01-01]·[6도01-xx] 성취기준 전문(全文)을 NCIC 별책 6 PDF에서 직접 확인해 SKILL.md 절 1·7에 보강
- [❌] 한국 도덕교육에서 akrasia 적용 실증 연구(KCI 직접 검색)를 보강 — 현재 박재주(2011)·박장호(2009) 외 후속 연구 카탈로그 필요
- [❌] 단원 지도안 예시를 초등 5-6학년·고등학교 「현대사회와 윤리」용으로 추가 (중학교 1학년 사례 외)
- [❌] 자기 성찰 일지·동료평가지·관찰 체크리스트 등 평가 도구 양식을 부록으로 추가
- [✅] skill-tester를 통한 2단계 실사용 테스트 수행 (2026-05-06 완료, 3/3 PASS, APPROVED 전환)
- [✅] Perseus 원문 대조 정정 1건(§9-3 번역본 서지) 재테스트 수행 (2026-09-26 완료, 2/2 PASS, APPROVED 재전환)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-06 | v1 | 최초 작성 — 14개 절 / 학년별 변환표 / 4차시 지도안 예시 / 평가 매트릭스 / 8모형 결합표 / 학생 안전 주의사항 / 5장 챕터 구성 | skill-creator (Claude Opus 4.7) |
| 2026-05-06 | v1.1 | **fact-checker 추가 검증 정정 2건** (Routledge 공식 + ResearchGate + Tandfonline + DigitalCommons UNO 교차): (a) Kristjánsson 2015 출판지 "Abingdon: Routledge" → **"London: Routledge"** (학술 인용 표준; "Abingdon" 표기도 혼용되나 다수 DB는 London) (b) "Lickona, Schaps & Lewis 1996 JME" → **Lickona 단독 저자** JME 25(1) 93-100. Schaps & Lewis 공저는 Character Education Partnership 보고서(1995/2002, 별개 문건). 본문 §5·§참고문헌·§소스 모두 정정 + 두 문건 혼동 금지 명시. APPROVED 미전환(skill-tester 2단계 실사용 테스트 대기). | fact-checker + main |
| 2026-05-06 | v1.2 | 2단계 실사용 테스트 수행 (Q1 중학교 4차시 지도안 / Q2 2022 개정 교육과정 학교급별 연결 / Q3 수치심·낙인·평가공정성) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-26 | v1.3 | 존재하지 않는 참조 스킬 `moral-philosophy-akrasia-aristotle`(레포에 없음) 발견 → 실제 존재하는 `humanities/aristotle-akrasia-vs-akolasia-distinction`(akrasia·akolasia 이론 정밀 분석 스킬, 목적상 가장 적합)로 교체. §0·§13 두 곳 수정. 내용 실질 변경 아님(깨진 링크 수리) — APPROVED 유지 | 메인 세션 |
| 2026-09-26 | v1.4 | **원문·서지 대조 정정 1건** (§10): 권장 자료 "이창우 외, 2006, 길" → 강상진·김재홍·이창우 옮김, 길, 2011 (초판 이제이북스 2006) — 출판사·연도 불일치. status APPROVED → PENDING_TEST | 메인 세션 (원문 대조) |
| 2026-09-26 | v1.5 | 2단계 실사용 재검증 수행 (Q1 §9-3 번역본 서지 정정 겨냥 / Q2 akrates·akolastos 구분 활동 설계+동일 교정전략 적용 가부) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |

---

## 10. 원문 대조 기록 (2026-09-26)

- 1차 원문: Perseus `tlg0086.tlg010.perseus-grc2.xml` (Bywater 1894). 서지: DBpia(이제이북스 2006 3인 공역 서평)

| # | 클레임 (기존) | 원문 대조 결과 | 판정 |
|---|---|---|---|
| 1 | 두 전제 결합 모델 (NE VII.3) | 1146b35–1147b19, VII.3 내부 | VERIFIED |
| 2 | NE VII.4 1147b20–1148b14 | VII.4 시작 "πότερον δʼ ἐστί τις ἁπλῶς ἀκρατὴς" 1147b20, VII.5 1148b15 | VERIFIED |
| 3 | "NE VII.1–10 한국어 번역본 (이창우 외, 2006, 길)" | 2006 = 이제이북스(3인 공역 초판), 길 = 2011 개정판 | 정정 |

**합계: 대조 3건 / 정정 1건.** 서지 사실 정정이므로 PENDING_TEST → 재테스트(§5) 2/2 PASS 완료 후 APPROVED.
