---
skill: academic-paper-structure-humanities
category: writing
version: v4
date: 2026-05-03
status: APPROVED
---

# academic-paper-structure-humanities 검증 문서

> 한국 인문학(철학·교육학) 논문의 구조와 인용 표기 가이드 검증 기록

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `academic-paper-structure-humanities` |
| 스킬 경로 | `.claude/skills/writing/academic-paper-structure-humanities/SKILL.md` |
| 검증일 | 2026-05-03 |
| 검증자 | skill-creator (Opus 4.7) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 한국 인문학 학술지 투고규정 1차 소스 확인 (한국철학회, 이화여대 한국문화연구원)
- [✅] 한국도덕윤리과교육학회 사이트 확인 (직접 투고규정 PDF 확보 실패 — 회원 로그인 필요)
- [✅] Chicago Manual of Style 17판 공식 정보 확인 (Purdue OWL + chicagomanualofstyle.org)
- [✅] 인문학 학위논문 5장 구조 표준 확인
- [✅] Bekker 번호(아리스토텔레스 표준 페이지) 시스템 확인
- [✅] 핵심 클레임 교차 검증 (다중 소스)
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성
- [✅] verification.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사1 | WebSearch | "한국 인문학 논문 각주 인용 형식 KCI 등재지 투고규정" | KCI 포털 + 한양대 가이드 + 학회 링크 9건 수집 |
| 조사2 | WebSearch | "한국도덕윤리과교육학회 논문 투고규정 각주 형식" | 학회 사이트(kosmee.jams.or.kr) + DBpia + 대구교대 안내 등 9건 |
| 조사3 | WebSearch | "Chicago Manual of Style 17th edition notes bibliography" | Purdue OWL + chicagomanualofstyle.org + Doane PDF 등 10건 |
| 조사4 | WebFetch | 한국도덕윤리과교육학회 사이트 | Author's Guide 메뉴 존재만 확인, 투고규정 본문은 회원 영역 |
| 조사5 | WebFetch | 이화여대 한국문화연구원 작성 지침 | 단행본·논문·번역서·재인용 전체 형식 확보 |
| 조사6 | WebFetch | Purdue OWL Chicago 17판 (1차 시도) | 429 Rate Limit |
| 조사7 | WebFetch | chicagomanualofstyle.org Citation Quick Guide | 책·논문·번역서 full note/short note/bibliography 형식 확보 |
| 조사8 | WebSearch | "한국철학회 논문 투고규정 각주 형식 참고문헌" | 한국철학회·서울대 철학사상연구소·한국동서철학회 등 9건 |
| 조사9 | WebFetch | hanchul.org/homepage/custom/rule3 | 한국철학회 저자-연도 방식, ibid 미사용, 부호 체계 등 핵심 규정 확보 |
| 조사10 | WebSearch | "학위논문 석사논문 5장 구조" | 서울대 글쓰기교실 + 인문학 석사논문 표준 5장 구조 확인 |
| 조사11 | WebSearch | "akrasia Aristotle Bekker number citation" | Bekker 번호 시스템 표준 형식(NE II.2, 1103b1) 확인 |
| 교차 검증 | WebSearch | 8개 핵심 클레임, 독립 소스 2개 이상 | VERIFIED 7 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 한국철학회 투고규정 | https://hanchul.org/39 | ⭐⭐⭐ High | 2026-05-03 | 1차 학회 공식 규정 |
| 한국철학회 (서브) | https://hanchul.org/homepage/custom/rule3 | ⭐⭐⭐ High | 2026-05-03 | 부호·연도 표기 |
| 이화여대 한국문화연구원 | https://kcri.ewha.ac.kr/kcri/intro/instructions-for-writing.do | ⭐⭐⭐ High | 2026-05-03 | 인문학 표준 각주 형식 |
| Chicago Manual of Style 공식 | https://www.chicagomanualofstyle.org/tools_citationguide/citation-guide-1.html | ⭐⭐⭐ High | 2026-05-03 | Notes-Bibliography 공식 가이드 |
| Purdue OWL Chicago 17판 | https://owl.purdue.edu/owl/research_and_citation/chicago_manual_17th_edition/ | ⭐⭐⭐ High | 2026-05-03 | Chicago 17판 공인 해설 |
| Bekker numbering (Wikipedia) | https://en.wikipedia.org/wiki/Bekker_numbering | ⭐⭐ Medium | 2026-05-03 | 표준 페이지 시스템 설명 (학계 통용) |
| 한국도덕윤리과교육학회 | https://kosmee.jams.or.kr/co/main/jmMain.kci | ⭐⭐⭐ High | 2026-05-03 | 회원 영역으로 투고규정 본문 직접 확인 불가 |
| 서울대 온라인 글쓰기교실 | https://owl.snu.ac.kr/2465/ | ⭐⭐⭐ High | 2026-05-03 | 학위논문 구조 표준 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 핵심 클레임 교차 검증 결과

| 클레임 | 판정 | 근거 |
|--------|------|------|
| 한국 인문학에서 책은 『 』, 논문은 「 」 | **VERIFIED** | 이화여대 + 한국철학회 두 소스 일치 |
| 참고문헌 정렬은 한국어 → 동양어 → 서양어 | **VERIFIED** | 이화여대 + 한국철학회 일치 |
| Chicago 17판은 ibid. 사용을 권장하지 않음 | **VERIFIED** | Purdue OWL + 검색 결과 일치 ("Use of ibid. for repeated citations is discouraged in favor of shortened citations") |
| 한국철학회는 각주에 저자-연도-쪽수만 표기 | **VERIFIED** | hanchul.org 공식 규정 명시 |
| 한국철학회는 ibid./같은 책/위의 책 사용 금지 | **VERIFIED** | hanchul.org 공식 규정 명시 |
| Bekker 번호는 아리스토텔레스 표준 인용법 | **VERIFIED** | Wikipedia + Perseus + SEP 일치 |
| 인문학 석사논문 5장 구조(서론-이론-방법-결과-결론) | **VERIFIED** | 서울대 글쓰기교실 + 명지대 인문학 석사논문 안내 |
| KCI 등재지 abstract 단어 수 / 분량 | **DISPUTED** | 학술지마다 차이 큼 → "투고규정 우선"으로 명시 처리 |

### 4-2. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전/판본 정보 명시 (Chicago 17판, 2026-05-03 기준 한국철학회 규정)
- [✅] deprecated 패턴(ibid 17판) 권장하지 않음, 변경 사항 별도 표기
- [✅] 인용 예시가 실제 사용 가능한 형태

### 4-3. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, example 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념(논문 유형, 각주 형식, Chicago, 1차 텍스트) 모두 포함
- [✅] 인용 예시 포함 (단행본·논문·번역서·재인용)
- [✅] akrasia 주제 학부 논문 흐름 예시 포함
- [✅] 흔한 실수 패턴 7개 포함
- [✅] 작성 전 체크리스트 포함

### 4-4. 실용성

- [✅] 도덕윤리교육 학부생이 텀페이퍼 작성에 바로 활용 가능
- [✅] 지도교수·학술지 규정 우선 원칙을 일관되게 명시
- [✅] 학부·석사·KCI 단계별로 구분되어 활용 가능
- [✅] aristotle-primary-citation 스킬과 상호 참조

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-03, skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 발견 — Chicago NB 편저 챕터 형식 누락, 선택 보강 항목으로 기록)

---

## 5. 테스트 진행 기록

### [재검증] 2026-09-26 — Perseus 원문 대조 정정 2건 재테스트

**수행일**: 2026-09-26
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md + references/introduction-writing.md Read 후 §10 원문 대조 정정 2건(§5 목차 예시 VII.2 장 번호, references 예시의 원문에 없는 따옴표 인용 교체)을 각각 겨냥한 질문 2개, 근거 섹션 및 anti-pattern 회피 확인

**Q1. (정정 겨냥) §5 목차 예시 "소크라테스적 입장 비판" 절의 정확한 장(章)·Bekker 번호**
- PASS
- 근거: SKILL.md "5. akrasia 주제 학부 논문 작성 예시 흐름" 3-1절("소크라테스적 입장 비판 (VII.2, 1145b21–28) ← 2026-09-26 원문 대조: 1145b21은 VII.2 시작(VII.3은 1146b8부터)")
- 상세: 정정된 "VII.2, 1145b21–28"을 정확히 인용하고, VII.3은 1146b8부터 시작한다는 근거로 VII.2/VII.3 경계를 정확히 구분. §4-1의 별개 예시(NE VII.3, 1147a24–b5)와 혼동하지 않고 서로 다른 지점을 가리킴을 명확히 인지 — anti-pattern(구 버전 VII.3 오기) 회피 확인.

**Q2. (정정 겨냥) references 예시의 NE 1145b21-27 인용 시 "더 좋은 것을 알면서도 더 나쁜 것을 행한다" 직접인용 가부**
- PASS
- 근거: references/introduction-writing.md §5 "좋은 예시" 본문 + "분석" 섹션 정정 각주("원문에 없는 표현이므로 원문 기반 문구로 교체. 따옴표 안에는 원문 번역만 넣는다")
- 상세: 현재 예시 본문에는 "옳게 판단하면서도 어떻게 자제력 없이 행위할 수 있는가"(그리스어 원문 병기)만 따옴표 안에 있고, 과거 표현("더 좋은 것을 알면서도...")은 원문 불일치로 이미 교체되었음을 정확히 인용. anti-pattern(원문에 없는 재구성 문구를 직접인용으로 표기) 정확히 회피. SKILL.md 본문(§4-4)에는 이 원칙이 일반화되어 있지 않다는 gap을 스스로 지적(차단 요인 아님, 선택 보강).

### 발견된 gap (Perseus 정정 재테스트)

- "직접인용 시 원문에 없는 표현을 재구성해 따옴표로 묶지 말 것"이라는 원칙이 references 파일의 사례별 각주에만 있고 SKILL.md 본문 §4-4·§6(흔한 실수)에 일반 원칙으로 승격되어 있지 않음 (차단 요인 아님, 선택 보강)

### 판정 (Perseus 정정 재테스트)

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (writing 카테고리 — 빌드/워크플로우/설정+실행/마이그레이션 아님)
- 최종 상태: APPROVED (PENDING_TEST → APPROVED 전환)

---

### [재검증] 2026-09-26 — 서론 작성 스킬 병합분 content test

**수행일**: 2026-09-26
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md + references/introduction-writing.md Read 후 실전 질문 2개 답변(핵심 기능 1개 + 병합 내용 대상 1개), 근거 섹션·anti-pattern 회피 확인

### 실제 수행 테스트 (재검증)

**Q1. 한국철학회식 저자-연도 각주에서 여러 문헌 동시 인용 + 동일 저자 동일 연도 구분법**
- ✅ PASS
- 근거: SKILL.md 섹션 2-7(세미콜론 연결 예시), 섹션 6-6·2-8(`2007a`/`2007b` 구분 규칙)
- 상세: "김재권 (2007), 35쪽; 박이문 (2001), 50쪽." 세미콜론 연결 형식과 동일 저자·동일 연도 a/b 구분 규칙을 SKILL.md 문구 그대로 인용해 정확히 답변. 나열 순서 기준(언급순/연도순) 미명시는 선택 보강 gap으로 지적됨.

**Q2. (병합분 대상) 서론에서 IMRaD처럼 결론을 미리 예고해도 되는지 — KCI vs IMRaD 관행 차이**
- ✅ PASS
- 근거: references/introduction-writing.md §2 IMRaD vs 인문학 전통 비교표 "결과 예고" 행 + 주의 문단, §5 좋은 예시 Move 3 분석("결론 누설 회피" 표기)
- 상세: "한국 인문학 관행상 결론을 그대로 누설하면 본문 읽을 동기가 약화된다"는 주의 문단을 정확히 근거로 제시하고, IMRaD Move 3B(결과 예고)와의 관행 차이를 명확히 구분해 답변. SKILL.md §1-5 포인터 → references 파일 연결이 정상 작동함을 확인.

### 판정 (재검증)

- agent content test: 2/2 PASS (병합분 포함, general-purpose 대체 사용 명시)
- verification-policy 분류: writing 카테고리 — 실사용 필수 카테고리(빌드/워크플로우/설정+실행/마이그레이션) 해당 없음
- 최종 상태: **APPROVED** (재전환 완료)

---

## 5-1. 최초 테스트 진행 기록 (2026-05-03, 보존)

**수행일**: 2026-05-03
**수행자**: skill-tester → general-purpose (대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 한국도덕윤리과교육학회 vs 한국철학회 각주 형식 차이 (투고규정 우선 원칙, ibid 사용 차이)**

- PASS
- 근거: SKILL.md 섹션 2 서두 `> **중요**` 박스, 섹션 2-6(약어 사용, 한국철학회 ibid 금지 주의), 섹션 2-7(한국철학회식 저자-연도 각주)
- 상세: 투고규정 1순위 원칙이 명확히 기술됨. 한국철학회는 ibid/위의 책 사용 금지·매번 반복 표기 규정이 2-6 주의 박스에 명시됨. 한국도덕윤리과교육학회 투고규정 본문 직접 확인 불가(회원 영역)이나, 이화여대 표준(2-1)과 한국철학회식(2-7)의 차이를 대비하여 설명 가능.

**Q2. 박재주(2011) KCI 학술지 논문 각주 표기 (한국 인문학 표준 형식, 반복 인용)**

- PASS
- 근거: SKILL.md 섹션 2-1(학술지 논문 각주 형식 + 예시), 섹션 2-6(반복 인용 위의 글/앞의 글)
- 상세: 첫 인용 `박재주, 「아크라시아의 교육적 함의」, 『도덕윤리과교육』 33호, 한국도덕윤리과교육학회, 2011, ○쪽.` — 섹션 2-1 예시 패턴과 정확히 일치. 반복 인용 시 '위의 글'(바로 앞) / '앞의 글'(다른 자료 끼인 후) 구분이 2-6에 예시와 함께 있음. anti-pattern 회피: 논문명 `「」`, 학술지명 `『』` 부호 올바름.

**Q3. Davidson 1969 영문 논문 Chicago NB 방식 첫 인용/반복 인용, ibid. 사용 여부**

- PASS (단, gap 발견)
- 근거: SKILL.md 섹션 3-2(학술지 논문 첫 노트/짧은 노트), 섹션 3-4(17판 ibid 권장하지 않음, short note 사용 권장)
- 상세: 첫 인용은 full note 형식(3-2), 두 번째 인용은 `Davidson, "How Is Weakness of the Will Possible?," [쪽수].` short note. ibid 사용 금지 → short note가 핵심 anti-pattern 회피 확인. **gap**: Davidson의 해당 논문은 편저 수록 논문(chapter in edited volume) 형태로 많이 인용되나 SKILL.md 섹션 3에는 Chicago NB 방식의 편저 챕터 형식이 없음. 한국식 편저 챕터(2-4)는 있으나 Chicago NB 편저 챕터는 누락. (차단 요인이 아닌 선택 보강 항목)

### 발견된 gap

- SKILL.md 섹션 3(Chicago NB)에 **편저 수록 논문(chapter in edited volume)** 형식 없음. Davidson처럼 편저서 수록 논문을 Chicago NB로 인용할 경우 대응 불가. 섹션 2-4(한국식 편저 챕터)는 있으나 Chicago NB 편저 챕터는 없음. 선택 보강 항목 — 핵심 기능(학술지 논문/단행본/번역서) PASS에는 영향 없음.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: writing 카테고리 — 빌드/워크플로우/설정/마이그레이션 해당 없음
- 최종 상태: APPROVED

---

> (아래는 최초 작성 시 권장 테스트 케이스 — 참고용 보존)

### 권장 테스트 케이스 1: 학부 텀페이퍼 각주 형식 질문

**입력 (질문):**
```
학부 도덕윤리교육 텀페이퍼에서 김상봉의 『도덕교육의 파시즘』(길, 2005) 120쪽을 각주로 인용하려고 한다. 한국 인문학 일반 형식으로 어떻게 적나?
```

**기대 결과:**
```
김상봉, 『도덕교육의 파시즘』, 길, 2005, 120쪽.
```

### 권장 테스트 케이스 2: Chicago 17판 ibid. 정책

**입력:**
```
Chicago 17판에서 같은 책을 연속으로 인용할 때 ibid.를 써도 되나?
```

**기대 결과:**
```
17판은 ibid.를 권장하지 않는다. 대신 짧은 노트(short note: 저자성 + 짧은 제목 + 쪽수)를 사용한다.
```

### 권장 테스트 케이스 3: 아리스토텔레스 1차 텍스트 인용

**입력:**
```
akrasia 논문에서 『니코마코스 윤리학』 7권 3장을 인용할 때 표준 페이지는 어떻게 적나?
```

**기대 결과:**
```
Bekker 번호 사용. 예: NE VII.3, 1147a24–b5
강상진 외 한국어 번역본을 함께 보면 표준 번호와 번역본 페이지를 병기.
```

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-03 3/3 PASS, 2026-09-26 병합분 재검증 2/2 PASS, 2026-09-26 Perseus 원문 대조 정정 재테스트 2/2 PASS) |
| **최종 판정** | **APPROVED** (2026-09-26 Perseus 원문 대조 정정 2건 반영 재테스트 2/2 PASS 완료 — PENDING_TEST → APPROVED 전환) |

---

## 7. 개선 필요 사항

- [❌] 한국도덕윤리과교육학회 투고규정 본문 직접 확인 (회원 가입 또는 학회 사무국 문의 필요) — 차단 요인 아님, 선택 보강
- [❌] 한국 도덕교육학회 등 도덕윤리교육 분야 다른 KCI 등재지 형식 비교 추가 — 선택 보강
- [❌] 칸트(KrV A/B) · 플라톤(Stephanus) 1차 텍스트 인용 예시 더 보강 — 선택 보강
- [❌] 학부생용 LaTeX/MS Word 템플릿 링크 추가 검토 — 선택 보강
- [✅] skill-tester 실행하여 APPROVED 전환 (2026-05-03 완료, 3/3 PASS)
- [❌] SKILL.md 섹션 3(Chicago NB)에 편저 수록 논문(chapter in edited volume) 형식 추가 — content test 중 발견된 gap. 차단 요인 아님, 선택 보강
- [✅] 서론 작성 스킬 병합분(references/introduction-writing.md) content test 수행 및 APPROVED 재전환 (2026-09-26 완료, 2/2 PASS)
- [❌] references §4 "KCI 등재지 인문학 서론 8~12%" UNVERIFIED 표기 — 공식 통계 확인 시 보강. 차단 요인 아님, 선택 보강
- [✅] Perseus 원문 대조 정정 2건(§5 목차 VII.2 장 번호, references 예시 따옴표 인용 교체) 재테스트 수행 (2026-09-26 완료, 2/2 PASS, APPROVED 재전환)
- [❌] "직접인용 시 원문에 없는 표현을 재구성해 따옴표로 묶지 말 것" 원칙을 SKILL.md §4-4·§6 일반 원칙으로 승격 — 현재 references 사례별 각주에만 존재. 차단 요인 아님, 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-03 | v1 | 최초 작성 | skill-creator (Opus 4.7) |
| 2026-05-03 | v1 | 2단계 실사용 테스트 수행 (Q1 한국철학회vs도덕윤리과교육학회 각주 차이 / Q2 박재주 KCI 논문 각주 표기 / Q3 Davidson 1969 Chicago NB 인용) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-26 | v2 | 스킬 정리 — `writing/introduction-writing-humanities` 병합: 원 §1(5요소·비율)·§2 인문학 적용 유의·§3(KCI 전통 구조·비교표)·§5(1인칭)·§6(분량)·§7 함정 5 주의·§8(akrasia 첫 단락 예시)·§9 5문장 점검을 `references/introduction-writing.md`로 이관, SKILL.md §1-5 포인터 추가(500줄 한도로 references 분리). 예시의 "Charles(2009)" → "Charles(1984)" 정정. status PENDING_TEST 전환 | 메인 세션 (스킬 정리) |
| 2026-09-26 | v2 | 2단계 실사용 재검증 수행 (Q1 한국철학회식 각주 세미콜론·a/b 구분 / Q2 병합분 대상 — KCI vs IMRaD 결과 예고 관행 차이) → 2/2 PASS, PENDING_TEST → APPROVED 재전환 | skill-tester |
| 2026-09-26 | v3 | **Perseus 원문 대조 정정 2건** (§10): SKILL.md 목차 예시 "NE VII.3 분석 / 3-1 소크라테스 비판(1145b21–27)" → VII.2–3·VII.2 명시, references/introduction-writing.md 예시의 원문에 없는 따옴표 인용("더 좋은 것을 알면서도 더 나쁜 것을 행한다") → 원문 "πῶς ὑπολαμβάνων ὀρθῶς ἀκρατεύεταί τις"(1145b21-22) 기반 문구로 교체. status APPROVED → PENDING_TEST | 메인 세션 (원문 대조) |
| 2026-09-26 | v4 | 2단계 실사용 재검증 수행 (Q1 §5 목차 "소크라테스적 입장 비판" 절 VII.2 장 번호 정정 겨냥 / Q2 references 예시 따옴표 인용 교체 정정 겨냥) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |

---

## 9. 병합 이력 (2026-09-26)

| 항목 | 내용 |
|------|------|
| 원 스킬 | `writing/introduction-writing-humanities` (제거 — CARS 모델·서론 5요소·Relevance 정당화 4패턴·일반 함정은 일반 지식) |
| 이관 범위 | 원 §1 5요소 표·비율 → references §1 / §2 "인문학 적용 시 유의" → §1 주의 / §3 KCI 전통 구조·비교표 → §2 / §7 함정 5(결론 누설) 주의 → §2 주의 / §5 1인칭·3인칭 → §3 / §6 분량 표 → §4 / §8 첫 단락 예시·분석 + §9 단계 1 5문장 점검 → §5 |
| 병합 시 정정 | 좋은 예시의 "Charles(2009)" → "Charles(1984)". Charles의 행위론 단행본은 *Aristotle's Philosophy of Action* (Duckworth 1984)이고, 2009년 *Symposium Aristotelicum* NE VII권 편자는 Carlo Natali (`aristotle-nicomachean-ethics-vii-detail` VERIFIED 서지와 대조) |
| 원 소스 | Swales (1990) *Genre Analysis*, CUP / Swales (2004) *Research Genres*, CUP / Hyland (2000; Michigan Classics 2004) *Disciplinary Discourses* / 한국철학회 『철학』 투고규정 |
| 이관 클레임 판정 (원 verification.md, 2026-05-05) | Swales 1990·2004 CUP 서지 — VERIFIED / CARS 1990 3 Moves — VERIFIED / Hyland 2004 UMich Press — VERIFIED / 인문학 학위논문 서론 10~15% — VERIFIED / 한국철학회 『철학』 200자 원고지 120매 이내 — VERIFIED / 영문 인문학 1인칭 사용 자유 — VERIFIED / **KCI 등재지 인문학 서론 8~12%** — UNVERIFIED(references §4 `주의`로 명시) |
| 상태 | **APPROVED** (2026-09-26 재검증 완료 — references 병합분 content test 2/2 PASS; 같은 날 원문 대조 정정으로 PENDING_TEST 전환 후, Perseus 정정 재테스트 2/2 PASS로 APPROVED 재전환 — §5·§10 참조) |

---

## 10. 원문 대조 기록 (2026-09-26)

- 1차 원문: Perseus `tlg0086.tlg010.perseus-grc2.xml` (Bywater 1894)

| # | 클레임 (기존) | 원문 대조 결과 | 판정 |
|---|---|---|---|
| 1 | 원어 제목 『니코마코스 윤리학』(Ἠθικὰ Νικομάχεια) | Perseus XML 제목 "Ἠθικὰ Νικομάχεια" 일치 | VERIFIED |
| 2 | 예시 "NE VII.3, 1147a24–b5" | VII.3(1146b8–1147b19) 내부 | VERIFIED |
| 3 | 목차 예시 "VII권에서의 정의 (1145b8 이하)" | 1145b8부터 ἔνδοξα 나열 | VERIFIED |
| 4 | 목차 예시 "NE VII.3 분석 — 3-1 소크라테스적 입장 비판 (1145b21–27)" | 1145b21은 VII.2 시작 | 정정 |
| 5 | references 예시 따옴표 "더 좋은 것을 알면서도 더 나쁜 것을 행한다"(1145b21-27) | 원문에 해당 어구 없음 — 원문은 "πῶς ὑπολαμβάνων ὀρθῶς ἀκρατεύεταί τις" | 정정 |
| 6 | 예시 "1147a24–b5 (강상진 외 역, 길, 2011, 280쪽)" 쪽수 | 인쇄본 대조 불가 — 양식 예시로만 사용 | 미검증(양식 예시) |

**합계: 대조 6건 / 정정 2건.** 실질 정정이므로 PENDING_TEST → 재테스트(§5) 2/2 PASS 완료 후 APPROVED.
