---
skill: research-proposal-humanities
category: writing
version: v1
date: 2026-05-05
status: APPROVED
---

# research-proposal-humanities 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `research-proposal-humanities` |
| 스킬 경로 | `.claude/skills/writing/research-proposal-humanities/SKILL.md` |
| 검증일 | 2026-05-05 |
| 검증자 | skill-creator (Claude Code 에이전트) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (University of Chicago Press 공식 페이지, 한국연구재단 IRB 가이드라인, SEP)
- [✅] 공식 GitHub 2순위 소스 확인 (해당 없음 — 출판 도서·법령 기반 스킬)
- [✅] 최신 버전 기준 내용 확인 (Booth 5판 2024-06-25 출판 확인)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (Booth 3단계 템플릿, 좋은 RQ 6+2항목)
- [✅] 코드 예시 작성 (akrasia 학위논문 적용 예시 §9 전체)
- [✅] 흔한 실수 패턴 정리 (§8에 10항목)
- [✅] SKILL.md 파일 작성
- [✅] 사용자가 요청한 "4판 2024" 부정확성 식별·수정·DISPUTED 표기

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 중복 확인 | Glob | `.claude/skills/**/research-proposal-humanities/SKILL.md` | 0건 (신규 작성 가능) |
| 조사 1 | WebSearch | "Craft of Research" 5판 2024 + 4판 2016 | 5판 2024-06-25 출판 확인, 4판은 2016 — 사용자 입력 정정 필요 |
| 조사 2 | WebSearch | topic narrowing, "so what" question | Ch.3–4 핵심 개념 확인 |
| 조사 3 | WebFetch | uchicago press 공식 페이지 | 5판 신규 추가 사항(AI/presentation/ethics) 확인 |
| 조사 4 | WebSearch | 서울대 미학과 연구계획서 + 한국연구재단 인문사회 IRB | 한국 학과 표준 5섹션 + IRB 가이드라인 확보 |
| 조사 5 | WebFetch | 서울대 미학과 공식 페이지 | 5섹션 구조 정확 추출 |
| 조사 6 | WebSearch | Booth 3단계 템플릿 정확한 표현 | "I am studying / because I want to find out / in order to help my reader understand" 확정 |
| 조사 7 | WebFetch | researchinprocess.wordpress.com Ch.4 노트 | practical vs conceptual problem, "so what" test 정확한 의미 확보 |
| 조사 8 | WebSearch | akrasia NE 7권 도덕교육 + 영문 SEP | propeteia/astheneia 구분, "lack of mastery" 의미 확인 |
| 조사 9 | WebSearch | 한국 IRB 학생 인터뷰 동의 | 학생은 취약 연구대상자, 동의서 필수 확인 |
| 교차 검증 | WebSearch | 9개 핵심 클레임 × 2~3개 독립 소스 | VERIFIED 8 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| University of Chicago Press, *The Craft of Research*, 5th ed. 공식 페이지 | https://press.uchicago.edu/ucp/books/book/chicago/C/bo215874008.html | ⭐⭐⭐ High | 2026-05-05 | 출판사 공식. 5판 출판일·구조·신규 사항 |
| Wikipedia "The Craft of Research" | https://en.wikipedia.org/wiki/The_Craft_of_Research | ⭐⭐ Medium | 2026-05-05 | 판본 변천사 교차 확인용 |
| Amazon 5판 ISBN 페이지 | https://www.amazon.com/Research-Chicago-Writing-Editing-Publishing/dp/0226833887 | ⭐⭐ Medium | 2026-05-05 | ISBN·출판일 교차 검증 |
| 서울대학교 미학과 「연구계획서 작성 요령」 | https://meehak.snu.ac.kr/연구계획서-작성-요령/ | ⭐⭐⭐ High | 2026-05-05 | 한국 인문학 대학원 공식 양식 |
| 한국연구재단 「인문사회분야 연구자를 위한 IRB 연구윤리 가이드라인」 | https://irb.kmu.ac.kr/bbs/irb/2692/110290/download.do | ⭐⭐⭐ High | 2026-05-05 | NRF 공식 가이드라인 |
| 기관생명윤리위원회 정보포털 | https://irb.or.kr/menu01/RegulationTarget01.aspx | ⭐⭐⭐ High | 2026-05-05 | 「생명윤리 및 안전에 관한 법률」 공식 포털 |
| Stanford Encyclopedia of Philosophy "Aristotle's Ethics" | https://plato.stanford.edu/entries/aristotle-ethics/ | ⭐⭐⭐ High | 2026-05-05 | akrasia 학술 표준 |
| Akrasia – Wikipedia | https://en.wikipedia.org/wiki/Akrasia | ⭐⭐ Medium | 2026-05-05 | propeteia/astheneia 구분 보조 |
| Research in Process: Craft of Research Ch.4 노트 | https://researchinprocess.wordpress.com/2013/09/03/the-more-important-notes-of-chapter-4the-craft-of-research/ | ⭐⭐ Medium | 2026-05-05 | 3단계 템플릿 정확한 표현 |
| Mason GMU Craft of Research 요약 | https://mason.gmu.edu/~afinn/html/teaching/courses/250_s2002/thecraftofresearch.htm | ⭐⭐ Medium | 2026-05-05 | 4가지 narrowing 관점 추출 |
| GMU Craft of Research PDF 요약 | https://mason.gmu.edu/~afinn/html/teaching/courses/250_s2002/craftofresearch.pdf | ⭐⭐ Medium | 2026-05-05 | substantive/contestable/specific 기준 |
| Sacred Heart University Research Problem Guide | https://library.sacredheart.edu/c.php?g=29803&p=185918 | ⭐⭐ Medium | 2026-05-05 | "so what" test 보조 |
| USC Libraries Narrowing a Topic | https://libguides.usc.edu/writingguide/narrowtopic | ⭐⭐ Medium | 2026-05-05 | topic narrowing 보조 |
| 동국대학교 일반대학원 연구계획서 양식 | https://gs.dongguk.edu/cmmn/fileDown.do?fileSeq=4092 | ⭐⭐ Medium | 2026-05-05 | 한국 학과 양식 비교 |
| 고려대 교육대학원 도덕윤리과교육 전공소개 | https://edugrad.korea.ac.kr/edugrad/master/master_major09.do | ⭐⭐ Medium | 2026-05-05 | 도덕윤리교육 분야 영역 확인 |
| 한국도덕윤리과교육학회 KCI | https://www.kci.go.kr/kciportal/po/search/poCitaView.kci?sereId=001279 | ⭐⭐⭐ High | 2026-05-05 | 분야 표준 학술지 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Booth 5판 2024 명시)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임 (akrasia 적용 예시 §9 — 즉시 적용 가능한 5단계)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, example 3개)
- [✅] 소스 URL과 검증일 명시 (헤더 "소스" 블록)
- [✅] 핵심 개념 설명 포함 (§1 5단계, §2 8섹션, §3 5유형, §4 체크리스트)
- [✅] 코드 예시 포함 (§1 단계별 예시, §9 끝까지 적용)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (§0 다룬다/다루지 않는다 표)
- [✅] 흔한 실수 패턴 포함 (§8 10항목)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (Booth 3단계 템플릿 그대로 채울 수 있음)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (akrasia 케이스 처음부터 끝까지)
- [✅] 범용적으로 사용 가능 — 도덕윤리교육 분야에 특화되었으나, RQ 5단계·8섹션·체크리스트는 인문학 전반 적용 가능

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-05 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음 — 수정 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-05
**수행자**: skill-tester → general-purpose (대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. akrasia 박사논문 — 지도교수 면담 1쪽 요약 구성법**
- PASS
- 근거: SKILL.md "§5-1 지도교수 면담용 1쪽 요약 (One-pager)" 섹션
- 상세: 7항목 구조 ((1) 한 문장 RQ → (7) 면담에서 묻고 싶은 것 3개) 완전 존재. §9 akrasia 예시의 [4단계] Booth 3단계 템플릿이 (2)항에 직접 대입 가능. §8 anti-pattern("지도교수 면담에 '검토 부탁'") 명시 및 회피 방향("구체적 결정 지점") 제공. gap 없음.

**Q2. 큰 주제 → 좁은 RQ로 좁히는 5단계**
- PASS
- 근거: SKILL.md "§1 큰 주제를 RQ로 좁히는 5단계" 섹션
- 상세: 5단계 전체(Interest → Topic → Question → Problem → 최종 RQ 확정) 명확히 정의. 4가지 narrowing 관점(Booth Ch.3) 테이블 존재. Booth 3단계 템플릿 및 "so what" 테스트 설명 완전. §9-1에 akrasia 5단계 적용 예시 있음. anti-pattern: §8 "Topic을 RQ로 착각", "descriptive 질문에서 멈춤" 명시. gap 없음.

**Q3. 한국 인문학 학위논문 연구계획서 vs 미국 dissertation proposal 차이**
- PASS
- 근거: SKILL.md "§6 한국 대학원 vs 미국 dissertation proposal 구조 차이" 섹션
- 상세: 8개 항목(시점/분량/심사 형식/가설 표현/선행연구/일정/윤리 항목/분량 균형) 비교표 완전 존재. 미국: 30~60쪽 + 구두 defense + 방법론 비중 高. 한국: 15~30쪽 + 서면 발표 + 선행연구 비중 高 + 차별성 단락 필수. gap 없음.

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md 내 근거 섹션이 명확히 존재하고, 예상 anti-pattern을 회피하는 교정 방향도 포함됨.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 해당 없음 (writing 카테고리 — 빌드 설정/워크플로우/설정+실행/마이그레이션 해당 없음)
- 최종 상태: APPROVED

---

> 아래는 skill-creator가 남긴 원래 템플릿 (참고용 보존)

### 테스트 케이스 1: (예정 — 위 실제 수행 기록으로 대체됨)

**입력 (질문/요청):**
```
(skill-tester가 생성)
```

**기대 결과:**
```
(skill-tester가 평가)
```

**실제 결과:**
```
(skill-tester가 기록)
```

**판정:** (대기)

---

### 테스트 케이스 2: (예정 — 위 실제 수행 기록으로 대체됨)

**입력:** (skill-tester가 생성)

**기대 결과:** (skill-tester가 평가)

**실제 결과:** (skill-tester가 기록)

**판정:** (대기)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-05 수행, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

### 핵심 클레임 교차 검증 결과

| # | 클레임 | 판정 | 근거 |
|---|--------|:---:|------|
| 1 | "The Craft of Research"는 Booth, Colomb, Williams, Bizup, FitzGerald 공저 | VERIFIED | uchicago press 공식 + Wikipedia + Amazon (3개 독립 소스) |
| 2 | 5판은 2024-06-25 출판, ISBN 978-0-226-82667-7 | VERIFIED | uchicago press 공식 + Amazon + biblio.com |
| 3 | 4판은 2016 출판, ISBN 978-0-226-23973-6 | VERIFIED | barnesandnoble + UCF + 출판사 |
| 4 | **사용자 입력 "4판 2024"는 부정확** — 2024년 출판은 5판이고 4판은 2016년 | DISPUTED → 5판 기준으로 작성, SKILL.md 끝 "주의" 블록에 명시 | 위 1·2·3 근거 |
| 5 | Booth 3단계 템플릿: "I am studying / because I want to find out / in order to help my reader understand" | VERIFIED | researchinprocess.wordpress Ch.4 노트 + GMU 요약 + bookey 요약 |
| 6 | Practical Problem vs Conceptual/Research Problem 구분이 Ch.4의 핵심 | VERIFIED | researchinprocess + GMU 요약 |
| 7 | "so what" test의 의미 — 독자가 "그래서 어떻게"에서 "뭔가 문제네"로 전환 | VERIFIED | researchinprocess + Sacred Heart University guide |
| 8 | 4가지 topic narrowing 관점(부분-전체/역사적 변화/범주·특성/가치 평가) | VERIFIED | GMU 요약 + USC libguides |
| 9 | 한국 IRB: 인터뷰·설문은 인간대상연구, 동의서 필수, 학생은 취약 연구대상자 | VERIFIED | 한국연구재단 IRB 가이드라인 + irb.or.kr 법령 + 서울시립대 IRB 안내 |
| 10 | 한국 인문학 학위논문 표준 섹션: 배경·필요성/선행연구/연구문제/이론적 틀/방법·범위/일정/기여/참고문헌 | VERIFIED | 서울대 미학과 5섹션 양식 + 동국대 양식 + editage·essayreview 가이드 (구조 일치) |
| 11 | 5판은 4판 대비 AI 사용 가이드라인·"Research Presentations" 챕터·확대된 윤리 장 추가 | VERIFIED | uchicago press 공식 페이지 |
| 12 | 아리스토텔레스 NE 7권에서 akrasia를 propeteia(impetuousness)와 astheneia(weakness) 두 유형으로 구분 | VERIFIED | SEP "Aristotle's Ethics" + Wikipedia "Akrasia" + tandfonline 학술지 |
| 13 | 미국 dissertation proposal은 한국보다 분량 大, defense 절차 있음 | VERIFIED | namu.wiki "프로포절" + editage thesis/dissertation 비교 |

**판정 요약:** VERIFIED 12 / DISPUTED 1 (사용자 입력 자체의 오류, 스킬 내용은 5판 기준 정확) / UNVERIFIED 0

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 실사용 테스트 수행 — agent content test (2026-05-05 완료, 3/3 PASS)
- [❌] 도덕윤리교육 외 다른 인문학 분야(미학·역사학·언어학 등)에 적용했을 때 5단계가 잘 작동하는지 추가 케이스 테스트 — 선택 보강 (APPROVED 전환에 차단 요인 아님)
- [❌] Booth 5판 4부 흐름(Interest→Topic→Question→Problem)을 5단계로 재구성한 것에 대해 도덕윤리교육 전공 실제 학생의 피드백 수렴 — 선택 보강 (실전 적용 후 수렴 권장)
- [❌] 한국 학과별 양식 차이(서울대·고려대·이화여대·공주대 등)를 부록으로 추가할지 검토 — 선택 보강 (현재 서울대·동국대 2개 소스 기반으로 충분)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-05 | v1 | 최초 작성. Booth 5판(2024) 기준. 사용자 입력 "4판 2024" 정정 반영. | skill-creator |
| 2026-05-05 | v1 | 2단계 실사용 테스트 수행 (Q1 akrasia 1쪽 요약 / Q2 RQ 좁히는 5단계 / Q3 한국 vs 미국 proposal 차이) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
