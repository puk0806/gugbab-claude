---
skill: conclusion-writing-strategies
category: writing
version: v1
date: 2026-05-04
status: APPROVED
---

# 스킬 검증: conclusion-writing-strategies

> 학술 논문 결론 챕터 작성 전략 — 학위논문·KCI 등재지의 결론 챕터를 학술적 절제로 작성하는 가이드

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `conclusion-writing-strategies` |
| 스킬 경로 | `.claude/skills/writing/conclusion-writing-strategies/SKILL.md` |
| 검증일 | 2026-05-04 |
| 검증자 | skill-creator (sonnet) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (University of Chicago Press, Oxford, ANU, Southampton)
- [✅] 공식 GitHub 2순위 소스 확인 (해당 없음 — 학술 글쓰기 방법론)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-05-04, *Craft of Research* 5판 2024년 출간 기준)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (4대 구성 요소, 6가지 흔한 실수)
- [✅] 코드 예시 작성 (akrasia 논문 결론 골격 — 인문학 적용 사례)
- [✅] 흔한 실수 패턴 정리 (단순 반복·새 주장 도입·과도한 일반화 등 6가지)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

> skill-creator 에이전트가 사용한 도구와 조사·검증 내역 기록

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | "Booth Colomb Williams Craft of Research 5th edition 2024 conclusion chapter" | 5판 2024년 출간 확인, ISBN 9780226833880, 출판사 University of Chicago Press 확인 |
| 조사 2 | WebSearch | "dissertation conclusion chapter structure limitations future research contributions" | Oxford·Scribbr·Southampton·ANU·Cambridge Proofreading 가이드 5종 발견 |
| 조사 3 | WebSearch | "학위논문 결론 작성 방법 한계 후속연구 기여 인문학" | 서울대 OWL, Enago, BRIC, 에세이리뷰 가이드 확인 |
| 조사 4 | WebSearch | "서울대학교 대학원 학위논문 작성 가이드 결론 챕터" | 서울대 OWL, 연세대 대학원, 중앙대 대학원 가이드 확인 |
| 조사 5 | WebFetch | press.uchicago.edu *Craft of Research* 5판 페이지 | 출판일 2024, 저자 5인, ISBN 3종 확인 / 5판은 별도 결론 챕터 대신 Part V "Some Last Considerations" (Chapter 17 Ethics, 18 Advice for Teachers) 구성임을 확인 |
| 조사 6 | WebFetch | gradcoach.com dissertation conclusion | 6단계 구조 (Brief Intro → Findings → Contributions → Limitations → Future Research → Closing Summary), 분량 5-7% 확인 |
| 조사 7 | WebFetch | owl.snu.ac.kr 서울대 OWL | "앞에서 거론하지 않았던 새로운 문헌이나 이론과 개념들을 등장시키지 않도록 주의해야 한다" 원문 확인 |
| 조사 8 | WebFetch | lifelong-learning.ox.ac.uk Oxford | 4-move 구조 (Summary → Practical Applications → Evaluation → Future Directions) 확인, 인문학·의학 분야별 차이 확인 |
| 조사 9 | WebFetch | anu.edu.au ANU | Processing Findings·Drawing Out Implications·Grounding Speculations 3-step 확인, modal verb (perhaps, possibly) 권장 확인 |
| 조사 10 | WebFetch | library.soton.ac.uk Southampton | 분량 5-10% (보통 5%), 클리셰 "In conclusion..." 회피, 새 데이터·이론 도입 금지 확인 |
| 교차 검증 | WebSearch | "closing statement dissertation thesis conclusion humanities final paragraph" | Harvard Writing Center, Indiana Univ, Paperpile 등 추가 6종 소스로 closing statement 개념 교차 검증 |
| 교차 검증 | WebSearch | "KCI 등재지 논문 결론 분량 비율 인문학" | KCI 공식에 분량 비율 명시 가이드 없음 확인 → 학술지별 투고 규정 확인 권장 문구 추가 |

총 12회 조사·검증 수행. 핵심 클레임 7개에 대한 교차 검증 완료.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| University of Chicago Press — *Craft of Research* 5판 | https://press.uchicago.edu/ucp/books/book/chicago/C/bo215874008.html | ⭐⭐⭐ High | 2026-05-04 | 출판사 공식 페이지, ISBN·저자·출간일 확인 |
| Oxford Lifelong Learning — Writing Conclusions | https://lifelong-learning.ox.ac.uk/about/writing-conclusions | ⭐⭐⭐ High | 2026-05-04 | 옥스퍼드 공식 가이드, 4-move 구조 |
| Australian National University — Conclusions | https://www.anu.edu.au/students/academic-skills/research-writing/conclusions | ⭐⭐⭐ High | 2026-05-04 | ANU 공식 학술 글쓰기 가이드 |
| University of Southampton Library — Conclusion | https://library.soton.ac.uk/writing_the_dissertation/conclusion | ⭐⭐⭐ High | 2026-05-04 | 분량 5-10% 기준 출처 |
| Scribbr — Thesis/Dissertation Conclusion | https://www.scribbr.com/dissertation/write-conclusion/ | ⭐⭐ Medium | 2026-05-04 | 학술 글쓰기 전문 플랫폼 |
| Grad Coach — Dissertation Conclusion Chapter | https://gradcoach.com/dissertation-conclusion-chapter/ | ⭐⭐ Medium | 2026-05-04 | 6단계 구조 출처 |
| Cambridge Proofreading — Limitations & Future Research | https://proofreading.org/learning-center/how-to-frame-limitations-and-future-research-directions/ | ⭐⭐ Medium | 2026-05-04 | 한계 진술 3-move 구조 출처 |
| 서울대학교 온라인 글쓰기교실 (OWL) | https://owl.snu.ac.kr/2465/ | ⭐⭐⭐ High | 2026-05-04 | 한국 대학 공식 학술 글쓰기 가이드 |
| Enago — 학위논문 결론 작성하기 | https://www.enago.co.kr/thesis-editing/blog/writing-your-thesis-conclusion-section-making-last-impression-count | ⭐⭐ Medium | 2026-05-04 | 한국어 학술 편집 전문 플랫폼 |
| 연세대학교 대학원 — 학위논문 작성법 | https://graduate.yonsei.ac.kr/graduate/academic/paper06.do | ⭐⭐⭐ High | 2026-05-04 | 한국 대학 공식 가이드 |
| KCI 한국학술지인용색인 | https://www.kci.go.kr/ | ⭐⭐⭐ High | 2026-05-04 | 분량 가이드 없음을 확인하기 위한 참조 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 핵심 클레임 교차 검증

| 클레임 | 소스 1 | 소스 2 | 판정 |
|--------|--------|--------|------|
| *Craft of Research* 5판은 2024년 University of Chicago Press 출간 (ISBN 9780226833880) | press.uchicago.edu | Amazon · Apple Books | ✅ VERIFIED |
| 결론 챕터의 권장 분량은 본문의 5-10% (보통 5-7%) | Southampton: 5-10% (보통 5%) | Scribbr·Grad Coach: 5-7% | ✅ VERIFIED |
| 결론 챕터는 4대 구성 요소(요약·발견·기여·한계+후속) 포함 | Oxford 4-move | Scribbr 6-step (요소 일치) · Grad Coach 6-step | ✅ VERIFIED |
| 결론에 본문에 없던 새 주장 도입 금지 | Southampton: "New primary data or theories appearing for the first time" 회피 | 서울대 OWL: "앞에서 거론하지 않았던 새로운 문헌이나 이론과 개념들을 등장시키지 않도록" | ✅ VERIFIED |
| 한계는 변명·자기비하 없이 학술적 절제로 진술 | Grad Coach: "humble but firm" | Enago / 서울대 OWL: 한계는 길게 서술하면 논지 약화 | ✅ VERIFIED |
| 후속 연구는 구체적 연구 질문 형태로 제시 | ANU: 구체적 grounding | Cambridge Proofreading: forward-looking move 구체화 | ✅ VERIFIED |
| 인문학 학위논문은 별도 결론 챕터, 의학·자연과학은 Discussion에 통합 | Oxford: "Humanities typically feature standalone conclusion chapters" | ANU: "science/technology conclusions tend to be shorter than humanities" | ✅ VERIFIED |
| KCI 등재지 결론 분량 명시 가이드 존재 여부 | KCI 공식: 명시적 분량 가이드 없음 | 학술지별 투고 규정 별도 | ⚠️ UNVERIFIED → SKILL.md에 "학술지마다 투고 규정 별도 확인 필수" 명시 |
| *Craft of Research* 5판 별도 "결론" 챕터 존재 여부 | press.uchicago.edu Part V는 Ethics·Advice for Teachers 구성 | — | ⚠️ DISPUTED → SKILL.md에서는 *Craft of Research*를 학술 글쓰기 방법론 일반 참조로만 인용, "결론 챕터" 직접 인용 회피 |

**최종 판정 요약:** VERIFIED 7건 / UNVERIFIED 1건 / DISPUTED 1건. 모두 SKILL.md에 적절히 반영됨.

### 4-2. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전·출판년도 정보가 명시되어 있음 (*Craft of Research* 5판 2024)
- [✅] deprecated된 관행을 권장하지 않음 (시간/연구비 변명 금지 명시)
- [✅] 예시(akrasia 논문 결론 골격)가 실제 활용 가능한 형태임

### 4-3. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (6개 공식 소스 + 검증일 2026-05-04)
- [✅] 핵심 개념 설명 포함 (4대 구성 요소, 분량 기준, 구조 옵션)
- [✅] 예시 포함 (기여 진술 예시, 한계 표현 예시, akrasia 논문 결론 골격)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (인문학·사회과학 중심, 자연과학 별도 명시)
- [✅] 흔한 실수 패턴 포함 (6가지 실수 표)

### 4-4. 실용성

- [✅] 에이전트가 참조했을 때 실제 학위논문·KCI 논문 결론 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (akrasia 논문 5-7쪽 결론 골격)
- [✅] 범용적으로 사용 가능 (특정 학과 종속 없음, 인문학·사회과학 일반 적용)

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-03 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-03
**수행자**: skill-tester (sonnet) — general-purpose 대체 (도메인 전용 에이전트 없음, 학술 글쓰기 카테고리)
**수행 방법**: SKILL.md Read 후 3개 실전 질문에 대해 SKILL.md 근거 섹션과 직접 대조, anti-pattern 회피 확인

---

### 실제 수행 테스트

**Q1. akrasia 학위논문 결론에서 "학술적 기여" 4유형(이론·방법론·실증·실천) 적용 예시**

- 판정: PASS
- 근거: SKILL.md 섹션 4 "기여(Contributions) 작성 기준"
- 상세: 4유형 표, "1-2개 선택 원칙", 3요소 체크포인트(무엇을·어떻게·어디에), akrasia 논문 적용 예시(이론적 기여 + 실천적 기여 진술) 전부 명시적으로 존재. "4유형 모두 나열" anti-pattern은 "1-2개 선택" 원칙으로 차단됨.

**Q2. 한계 작성 시 방어적·자기비하 회피 + 학술적 절제 표현 사례**

- 판정: PASS
- 근거: SKILL.md 섹션 5 "한계(Limitations) 작성 — 정직함 + 학술적 절제"
- 상세: "연구의 약점을 자백하는 자리가 아니라 범위를 명확히 하는 장치"라는 핵심 프레이밍 전환, 금지 표현 4가지("시간이 부족했다"·"연구비가 부족했다"·"필자의 능력이 부족하여"·"~이 아쉽다"), 대안으로 3단계 구조(선언·성찰·전망)와 방법론·범위·자료 유형별 예시 문장이 모두 존재. 서울대 OWL 인용으로 한계 과다 나열 금지 보강.

**Q3. "더 연구가 필요하다" 막연한 표현 대신 후속 연구 구체화 방법**

- 판정: PASS
- 근거: SKILL.md 섹션 6 "후속 연구(Future Research) 작성 — 구체적·실현 가능"
- 상세: "추상적 표현 금지" 명시, 나쁜 예시/좋은 예시 3쌍 대조표("후속 연구가 더 필요하다" vs 구체 사례연구·메타분석 등), "[한계 진술] → [후속 연구 제안]" 연결 양식 제시. 한계 절과의 직접 연결 원칙도 명시.

### 추가 확인 항목 (사용자 지정 핵심)

- **결론에 새 주장 도입 금지**: 섹션 8 흔한 실수 "새 주장 도입" 항목 + 서울대 OWL 원문 인용으로 명확히 차단됨.
- **본문 단순 반복 회피**: 섹션 8 "단순 반복" 항목에서 "상위 개념으로 통합·재진술" 지침 제시.
- **폐회 진술(박사) 적정성**: 섹션 7 "박사 학위논문 한정" 명시, 과장 금지 원칙과 좋은/나쁜 예시 포함.

### 발견된 gap

- 없음. 3/3 PASS, 사용자 지정 핵심 항목 3가지도 모두 SKILL.md 내 근거 존재.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 해당 없음 (빌드 설정·워크플로우·설정+실행·마이그레이션 아님)
- 최종 상태: APPROVED

---

### (참고) 테스트 케이스 원안 (skill-creator 작성 기록 보존)

**테스트 케이스 1 원안 (예정 → 실수행으로 대체됨):**

입력: "본 연구는 시간이 부족하여 더 많은 자료를 다루지 못했다"고 쓰는 것이 적절한가요?
기대 결과: "시간 부족" 금지 표현 안내, 방법론·범위·자료 한계로 재구성, 3단계 구조 제시
→ Q2에서 완전히 커버됨.

**테스트 케이스 2 원안 (예정 → 실수행으로 대체됨):**

입력: 박사 학위논문 결론 챕터의 학술적 기여를 어떻게 명시적으로 진술할 수 있나요?
기대 결과: 4유형 분류 안내, 1-2유형 선택 진술, 3요소 포함, akrasia 예시
→ Q1에서 완전히 커버됨.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ 통과 (7건 VERIFIED, 1건 UNVERIFIED 명시 처리, 1건 DISPUTED 회피 처리) |
| 구조 완전성 | ✅ 통과 (frontmatter·소스·예시·실수 패턴·체크리스트 모두 포함) |
| 실용성 | ✅ 통과 (akrasia 논문 결론 골격 등 실제 적용 가능 예시 포함) |
| 에이전트 활용 테스트 | ✅ 통과 (2026-05-03 수행, Q1·Q2·Q3 모두 PASS, 3/3) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester 또는 실제 사용자 활용을 통한 2단계 검증 수행 (2026-05-03 완료, 3/3 PASS)
- [❌] KCI 등재 인문학 학술지(예: 도덕교육학회지, 철학연구) 투고 규정 직접 조사하여 분량 가이드 정밀화 — 차단 요인 아님, 선택 보강 (현재 SKILL.md는 "학술지별 투고 규정 별도 확인 필수" 주의 문구로 처리됨)
- [❌] *Craft of Research* 5판 본문(특히 Part V·Chapter 17 Ethics) 직접 확인 후 결론 작성 윤리 항목 보강 검토 — 차단 요인 아님, 선택 보강 (현재 SKILL.md는 출판사 공식 페이지 기준 인용으로 처리됨)
- [❌] 자연과학·공학 분야의 Discussion-통합 결론 작성법은 본 스킬 범위 외 → 별도 스킬로 분리 검토 — 차단 요인 아님, 별도 스킬 필요 시 신규 생성

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-04 | v1 | 최초 작성 — 4대 구성 요소·분량·구조 옵션·기여·한계·후속 연구·폐회 진술·흔한 실수·셀프 체크리스트·akrasia 논문 적용 예시 포함 | skill-creator |
| 2026-05-03 | v1 | 2단계 실사용 테스트 수행 (Q1 기여 4유형 적용 / Q2 한계 절제 표현 / Q3 후속연구 구체화) → 3/3 PASS, APPROVED 전환 | skill-tester |
