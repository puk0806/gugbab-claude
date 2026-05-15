---
skill: dream-content-research
category: humanities
version: v1
date: 2026-05-15
status: APPROVED
---

# 스킬 검증 — dream-content-research

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-content-research` |
| 스킬 경로 | `.claude/skills/humanities/dream-content-research/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (Claude Code) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 학술 문헌 1순위 소스 확인 (Hall & Van de Castle 1966, Domhoff 2003 APA, DreamResearch.net 공식 챕터)
- [✅] 공식 데이터셋 확인 (DreamBank.net, Hall/Van de Castle Normative Tables)
- [✅] 후속 학술 연구 확인 (Zadra/Robert 반복 꿈, Pesant & Zadra 2006, Schredl DRF)
- [✅] 신경과학 연결 확인 (Hobson AIM, Solms 가설, Hobson-Solms 논쟁 정리)
- [✅] SEP 항목 교차 확인 ("Dreams and Dreaming", Jennifer Windt)
- [✅] 핵심 통계적 발견 정리 (정서·인물·환경·성별 차이)
- [✅] 앱 적용 가이드라인 + 학술 한계 박스 작성
- [✅] 흔한 함정 5종 정리
- [✅] SKILL.md 작성
- [✅] verification.md 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Hall Van de Castle 1966 codebook categories" | DreamResearch.net 공식 챕터, ResearchGate, Springer 등 10건 |
| 조사 | WebSearch | "Domhoff continuity hypothesis 2003 APA" | APA PsycNet, ScienceDirect, Domhoff 논문 다수 확인 |
| 조사 | WebSearch | "Zadra Robert recurrent dreams Dreaming journal" | Zadra/O'Brien/Donderi 1998, Pesant & Zadra 2006, Robert 2008 등 |
| 조사 | WebSearch | "Schredl dream recall frequency" | DRF 7-point 척도, r=0.85 신뢰도, 회상 빈도 영향 요인 |
| 조사 | WebSearch | "DreamBank.net Domhoff Schneider database" | Schneider & Domhoff 운영, 20,000+ 보고서, 73 dream sets |
| 조사 | WebSearch | "Hobson AIM activation input modulation Solms" | AIM 3축 모델, Domhoff 2005 Hobson-Solms 논쟁 정리 |
| 조사 | WebFetch | https://dreams.ucsc.edu/Library/fmid2.html | 10개 일반 카테고리 공식 목록 확인 |
| 조사 | WebFetch | https://dreams.ucsc.edu/Norms/ | 표본 구성(Case Western 200명, 1,000꿈) 확인 |
| 조사 | WebFetch | https://www.dreambank.net/ | 운영자·규모·이용 조건 확인 |
| 교차 검증 | WebSearch | "negative emotions outnumber positive Hall Van de Castle" | 부정 정서 우세 통계 다수 출처로 재확인 |
| 교차 검증 | WebSearch | "continuity hypothesis criticism limitations" | Domhoff 본인 인정 불연속 꿈, Schredl 세분화 필요 비판 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| DreamResearch.net (UC Santa Cruz, Domhoff 공식) — Hall/Van de Castle System Chapter 2 | https://dreams.ucsc.edu/Library/fmid2.html | ⭐⭐⭐ High | 2026-05-15 | Hall/Van de Castle 시스템의 공식 매뉴얼 |
| Hall/Van de Castle Normative Tables (UC Santa Cruz) | https://dreams.ucsc.edu/Norms/ | ⭐⭐⭐ High | 2026-05-15 | 표본 구성·꿈 수 1차 자료 |
| DreamBank.net (Schneider & Domhoff 공식 운영) | https://www.dreambank.net/ | ⭐⭐⭐ High | 2026-05-15 | 20,000+ 익명화 꿈 보고서 |
| Domhoff *The Scientific Study of Dreams* 2003 APA (PsycNet 메타) | https://psycnet.apa.org/record/2002-06753-000 | ⭐⭐⭐ High | 2026-05-15 | 연속성 가설 원전 메타 |
| Domhoff (2017) "Continuity Hypothesis" — APA Handbook 챕터 | https://psycnet.apa.org/record/2017-57288-003 | ⭐⭐⭐ High | 2026-05-15 | 가장 최신 정리 |
| Zadra, O'Brien, Donderi (1998) *Imagination, Cognition and Personality* | https://journals.sagepub.com/doi/10.2190/LLXL-D4DB-9CP5-BRGT | ⭐⭐⭐ High | 2026-05-15 | 반복 꿈·심리적 안녕 1차 문헌 |
| Zadra & Robert (2003) "Ordinary and Recurrent Dream Recall" *Dreaming* | https://link.springer.com/article/10.1023/A:1021152411010 | ⭐⭐⭐ High | 2026-05-15 | 학업 스트레스와 반복 꿈 |
| Pesant & Zadra (2006) *Journal of Clinical Psychology* | https://onlinelibrary.wiley.com/doi/abs/10.1002/jclp.20212 | ⭐⭐⭐ High | 2026-05-15 | 연속성 가설 종단 검증 |
| Domhoff & Schneider (2008) *Consciousness and Cognition* — DreamBank 활용 | https://www.sciencedirect.com/science/article/abs/pii/S1053810008001116 | ⭐⭐⭐ High | 2026-05-15 | DreamBank 연구 활용 방법 |
| Domhoff (2005) Hobson vs Solms Debate 정리 | https://dreams.ucsc.edu/Library/domhoff_2005b.html | ⭐⭐⭐ High | 2026-05-15 | Hobson-Solms 논쟁 정리 |
| Frontiers — On Dreams and Motivation: Freud vs Hobson | https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2016.02001/full | ⭐⭐⭐ High | 2026-05-15 | AIM 모델과 동기 가설 수렴 |
| SEP "Dreams and Dreaming" (Jennifer Windt) | https://plato.stanford.edu/entries/dreams-dreaming/ | ⭐⭐⭐ High | 2026-05-15 | 철학적·과학적 종합 |
| Schredl *International Journal of Dream Research* (편집장) | https://journals.ub.uni-heidelberg.de/index.php/IJoDR/ | ⭐⭐⭐ High | 2026-05-15 | 회상 빈도·꿈 일지 메타 |
| Schredl (2004) Reliability of DRF Scale | https://journals.sagepub.com/doi/10.2466/pms.98.3c.1422-1426 | ⭐⭐⭐ High | 2026-05-15 | r=0.85 신뢰도 보고 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 공식 학술 문헌과 불일치하는 내용 없음
- [✅] 핵심 1차 문헌 서지 정보 명시 (Hall & Van de Castle 1966 Appleton-Century-Crofts, Domhoff 2003 APA Books)
- [✅] 코드북 10개 카테고리 *공식 매뉴얼*과 일치 (DreamResearch.net Chapter 2)
- [✅] Norms 표본 구성 정확 (Case Western Reserve, 남 100/여 100, 각 5개 = 1,000꿈)
- [✅] DreamBank.net 운영자·규모 정확 (Schneider & Domhoff, 20,000+)
- [✅] Schredl DRF 척도·신뢰도 정확 (7-point, r=0.85)
- [✅] Hobson AIM 3축 정확 (Activation, Input-output gating, Modulation)

### 4-2. 핵심 클레임 교차 검증 결과

| 클레임 | 1차 소스 | 2차 소스 | 판정 |
|--------|---------|---------|------|
| Hall & Van de Castle 원서 출판 = 1966 Appleton-Century-Crofts | Amazon/Google Books 메타 | Wikipedia Appleton-Century-Crofts 카탈로그 | **VERIFIED** |
| 코드북 10개 일반 카테고리 | DreamResearch.net 공식 챕터 2 | ResearchGate "Dream content analysis: Basic principles" | **VERIFIED** |
| Norms 표본 = Case Western 200명 × 5꿈 = 1,000꿈 | dreams.ucsc.edu/Norms 직접 확인 | FiveThirtyEight "Turning Dreams Into Data" (1947-1950 명시) | **VERIFIED** |
| Domhoff 2003 = *The Scientific Study of Dreams*, APA | APA PsycNet record | American Journal of Psychiatry 리뷰 | **VERIFIED** |
| 연속성 가설 = 꿈은 깨어있는 관심·우려의 연속 | APA PsycNet "Continuity hypothesis" 챕터 | ScienceDirect "Continuity between waking activities and dream activities" | **VERIFIED** |
| 반복 꿈 = 부정 정서 우세, 심리적 안녕과 음의 상관 | Zadra/O'Brien/Donderi 1998 | Pesant & Zadra 2006 | **VERIFIED** |
| Schredl DRF 7-point scale, r=0.85 | Schredl 2004 SAGE | PMC 2022 Schredl COVID 연구 | **VERIFIED** |
| DreamBank = Schneider & Domhoff 운영, 20,000+ 보고서 | dreambank.net 공식 | Domhoff & Schneider 2008 *Consciousness and Cognition* | **VERIFIED** |
| Hobson AIM 3축 (A/I/M) | ResearchGate Hobson 2009 | Wikipedia "Activation-synthesis hypothesis" | **VERIFIED** |
| Solms — REM과 꿈은 별개 메커니즘, 도파민 회로 매개 | Domhoff 2005 Hobson-Solms 논쟁 정리 | Frontiers 2016 Freud-Hobson 비교 | **VERIFIED** |
| 정상 꿈 표본 = 부정 정서 > 긍정 정서 | Hall/Van de Castle 1966 (FiveThirtyEight 인용) | "Dreams are more negative than real life" ResearchGate | **VERIFIED** |
| 연속성 가설 한계 — 일부 꿈은 불연속 (Domhoff 본인 인정) | Psychology Today "Continuity Hypothesis: A More Balanced Account" | Domhoff 2017 "Invasion of the Concept Snatchers" | **VERIFIED** |

**총 클레임**: 12개 / **VERIFIED**: 12 / **DISPUTED**: 0 / **UNVERIFIED**: 0

### 4-3. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, <example> 4개)
- [✅] 소스 URL 13건과 검증일 명시
- [✅] 학술 한계 박스 (5개 항목 — 정신분석과 별개, 개인 단정 금지, 문화 일반화 한계, 진단 아님 강제, 연속성 한계)
- [✅] 10개 섹션 구성 (Hall/Van de Castle / Domhoff 연속성 / 반복 꿈 / Schredl / 통계 요약 / 신경과학 / 앱 적용 / 함정 / 짝 스킬 / 참고 자료)
- [✅] 핵심 학술 가설·연구 결과 정리
- [✅] 흔한 실수 패턴 5종 포함
- [✅] 짝 스킬(`humanities/dream-psychology-jung-freud`, `humanities/korean-dream-interpretation-tradition`, `frontend/dream-recurrence-detection`)과의 관계 명시

### 4-4. 실용성

- [✅] 꿈 일지 앱 개발자가 참조했을 때 *코드북 간이 적용*·*반복 꿈 감지 안내 문구*를 그대로 사용 가능한 수준
- [✅] *진단 아님* 안전 문구 예시 포함
- [✅] 학술 가설 인용 형식 안내 문구 포함 ("Domhoff(2003) 연속성 가설에 따르면 ~")
- [✅] 통계 표기 예시 (꿈 통계 카드 형태) 포함

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] skill-tester 정식 호출 (2026-05-15 수행 — SKILL.md Read 후 실전 질문 3개, 근거 섹션 확인, anti-pattern 회피 확인)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (도메인별 전문 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Hall & Van de Castle 10개 카테고리·정서 5종·사용 금지 척도**
- PASS
- 근거: SKILL.md "§1.3 코딩 시스템 — 10개 일반 카테고리" 표 전체, 카테고리 6 Emotions 비고("5종: anger, apprehension, sadness, confusion, happiness"), §1.3 주의 박스("'penis envy', 'castration anxiety', 'castration wish' 척도 — Domhoff 본인이 권장하지 않는다. 일반 카테고리 10개만 활용")
- 상세: 10개 카테고리, 정서 5종, 사용 금지 척도 3종 모두 명시적으로 근거 섹션 존재. gap 없음

**Q2. Domhoff 연속성 가설 개인 단정 anti-pattern 식별**
- PASS
- 근거: SKILL.md "§8.2 통계적 일반화를 개인에게 단정", "§7.3 금지 패턴" 표, "학술적 한계 박스 #2", "§3.3 주의"
- 상세: "부정 정서 多 → 우울 단정" 패턴을 §7.3, §8.2, 한계 박스가 복수 위치에서 명시. "집단 통계는 개인 임상 판단 근거 불가" 명제와 금지 출력 예시 모두 존재

**Q3. Hobson AIM vs Solms 대립점 및 Domhoff 입장**
- PASS
- 근거: SKILL.md "§6.1 Hobson AIM 모델" 3축 표(A/I/M), "§6.2 Solms 정서적·동기 가설"(도파민 회로 손상 시 REM 유지·꿈 소실), Domhoff(2005) 입장("양측 모두 Hall/Van de Castle식 꿈 내용 데이터가 검증에 필요")
- 상세: 초기 Hobson의 "동기 중립" vs Solms의 "도파민 동기 시스템" 대립, Domhoff의 콘텐츠 데이터 필요성 강조 — 모두 근거 섹션 명시

### 발견된 gap

없음 — 3/3 PASS, SKILL.md 내 근거 섹션이 모두 명확히 존재

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 학술 지식 스킬 — content test PASS = APPROVED 가능
- 최종 상태: APPROVED

---

> (이하 작성 직후 셀프 점검 기록 — 참고용 보존)
>
> **본 스킬은 메인 에이전트 지시에 따라 skill-tester 호출을 *명시적으로 스킵*했다.** 다른 humanities 학술 스킬 페어(`dream-psychology-jung-freud`, `korean-dream-interpretation-tradition`)와 동일 패턴으로, 짝 스킬 묶음 작성 완료 후 메인이 일괄 테스트할 예정이었음.
>
> - Q1. §1.3 10개 카테고리 표 + §1.1 출판 정보
> - Q2. §2.1 핵심 명제 박스
> - Q3. §3.3 Domhoff 해석 + §7.2 권장 안내 문구 예시
> - Q4. §1.4 주의 박스 + §8.3 함정

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (12/12 클레임 VERIFIED) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-15 — Q1 10개 카테고리·정서 5종·금지 척도 / Q2 연속성 가설 개인 단정 anti-pattern / Q3 Hobson-Solms 대립점) |
| **최종 판정** | **APPROVED** (학술 지식 스킬 — content test 3/3 PASS로 APPROVED 전환) |

---

## 7. 개선 필요 사항

- [✅] skill-tester 정식 호출 (2026-05-15 완료, 3/3 PASS — APPROVED 전환)
- [❌] 한국 표본 norms 자료가 발견되면 §1.4 주의 박스에 추가 비교 (현재 미발견) — 선택 보강 (차단 요인 아님)
- [❌] DreamBank.net 데이터 직접 활용 예시 코드(JS/Python)는 별도 frontend 스킬(`dream-recurrence-detection`)에서 다룸 — 본 스킬은 *학술 근거* 영역에 집중 (선택 보강, 차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — Hall/Van de Castle 코드북·Domhoff 연속성 가설·Zadra/Robert 반복 꿈·Schredl DRF·Hobson AIM·Solms 정리, 앱 적용 가이드 + 함정 5종 + 짝 스킬 관계 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 Hall/Van de Castle 10개 카테고리·정서 5종·금지 척도 / Q2 연속성 가설 개인 단정 anti-pattern / Q3 Hobson AIM vs Solms 대립점) → 3/3 PASS, APPROVED 전환 | skill-tester |
