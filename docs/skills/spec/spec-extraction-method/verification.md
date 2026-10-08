---
skill: spec-extraction-method
category: spec
version: v1
date: 2026-10-08
status: PENDING_TEST
---

# spec-extraction-method 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `spec-extraction-method` |
| 스킬 경로 | `.claude/skills/spec-extraction-method/SKILL.md` (+ `references/spec-templates.md`) |
| 검증일 | 2026-10-08 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Feathers 블로그, martinfowler.com 2종, eventstorming.com, Anthropic 문서, IEEE 표준 페이지)
- [✅] 2순위 소스 확인 (Thoughtworks Radar 2종, ApprovalTests, DePaul 강의 자료, Chikofsky 용어집 미러 3종)
- [✅] 최신 기준 내용 확인 (날짜: 2026-10-08 — Strangler Fig 2024-08-22 개정본, Radar 2025-11 판, 29148:2018 현행)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (역공학 분류, 특성화·승인 테스트, Feature Parity 경고, EventStorming 검증, CRUD 완전성, LLM 추출 규약 R1~R9)
- [✅] 코드 예시 작성 (서브에이전트 지시 예시, 명세 템플릿 5종 — 가상 예시 값만 사용, 특정 회사 코드 없음)
- [✅] 흔한 실수 패턴 정리 (10절 10항목)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿·중복 확인 | Read / Glob | VERIFICATION_TEMPLATE.md, 기존 `incremental-refactoring`·`ddd` SKILL.md | 동명 스킬 없음. 경계: Strangler Fig 실행 절차는 incremental-refactoring, 도메인 설계는 ddd → 이 스킬은 "현행 스펙 문서화"로 한정 |
| 조사 | WebFetch | michaelfeathers.silvrback.com/characterization-testing, martinfowler.com/bliki/StranglerFigApplication.html, martinfowler.com/articles/patterns-legacy-displacement/feature-parity.html, eventstorming.com, condor.depaul.edu/jbernste/is315_CRUDmatrix.htm, martinfowler.com/articles/legacy-modernization-gen-ai.html, thoughtworks.com/radar/techniques/using-genai-to-understand-legacy-codebases, platform.claude.com/.../reduce-hallucinations, standards.ieee.org/ieee/29148/6937/, informit.com WELC 상품 페이지, approvaltests.com, code.claude.com/docs/en/sub-agents, thoughtworks.com/radar/techniques/legacy-migration-feature-parity | 13개 1·2순위 소스 수집 |
| 조사 (Chikofsky) | WebSearch + WebFetch | Chikofsky & Cross 1990 taxonomy | 원문(IEEE 유료) 미열람. Georgia Tech 용어집, IEEE-CS TCSE 용어집(훔볼트대 미러), Georgia Tech 논문 요약 PDF(서지: IEEE Softw. 7(1):13-17, doi 10.1109/52.43044) 확보 |
| 교차 검증 | WebSearch | 특성화 테스트 정의, 승인/골든 마스터, Feature Parity, CRUD 완전성, EventStorming 수준, CodeConcise, Radar 상태, 화면정의서 표준 유무 | 18개 클레임, 독립 소스 2개 이상 대조 |
| 판정 | — | 18개 클레임 | VERIFIED 14 / DISPUTED 2 / UNVERIFIED 2 (UNVERIFIED는 제거 대신 `> 주의:` 표기 유지) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Feathers, Characterization Testing | https://michaelfeathers.silvrback.com/characterization-testing | ⭐⭐⭐ High | 2016-08-08 | 저자 공식 블로그 |
| Working Effectively with Legacy Code | https://www.informit.com/store/working-effectively-with-legacy-code-9780131177055 | ⭐⭐⭐ High | 2004-09-22 | 출판사 페이지(서지 확인. 상품 설명에 "characterization" 용어는 직접 없음) |
| Wikipedia, Characterization test | https://en.wikipedia.org/wiki/Characterization_test | ⭐⭐ Medium | 확인 2026-10-08 | 교차 검증용("Feathers가 만든 용어") |
| ApprovalTests | https://approvaltests.com/ | ⭐⭐⭐ High | 확인 2026-10-08 | 공식 사이트 |
| Codurance, Testing legacy code with Golden Master | https://codurance.com/2012/11/11/testing-legacy-code-with-golden-master/ | ⭐⭐ Medium | 2012-11-11 | 골든 마스터 교차 확인(검색 요약) |
| Fowler, Strangler Fig | https://martinfowler.com/bliki/StranglerFigApplication.html | ⭐⭐⭐ High | 2024-08-22 | 저자 공식 |
| Feature Parity (Patterns of Legacy Displacement) | https://martinfowler.com/articles/patterns-legacy-displacement/feature-parity.html | ⭐⭐⭐ High | 2021-07-27 | Cartwright·Horn·Lewis |
| Thoughtworks Radar — legacy migration feature parity | https://www.thoughtworks.com/radar/techniques/legacy-migration-feature-parity | ⭐⭐⭐ High | 2019-11-20 (갱신 2020-05-19) | Hold |
| EventStorming 공식 | https://www.eventstorming.com/ | ⭐⭐⭐ High | 확인 2026-10-08 | Brandolini |
| Wikipedia, Event storming / DDD Europe 마스터클래스 | https://en.wikipedia.org/wiki/Event_storming , https://2025.dddeurope.com/program/eventstorming-masterclass | ⭐⭐ Medium | 확인 2026-10-08 | 3수준(Big Picture/Process/Software Design) 교차 확인 |
| DePaul IS 315 CRUD Matrix | https://condor.depaul.edu/jbernste/is315_CRUDmatrix.htm | ⭐⭐ Medium | 2003-02-17 | 대학 강의 자료(Joel E. Bernstein) |
| TMap / arXiv 2011.10866 (CRUD) | https://www.tmap.net/?p=927 , https://arxiv.org/pdf/2011.10866 | ⭐⭐ Medium | 확인 2026-10-08 | 완전성 규칙·정보공학 기원 서술(검색 요약 기준) |
| Legacy Modernization meets GenAI | https://martinfowler.com/articles/legacy-modernization-gen-ai.html | ⭐⭐⭐ High | 2024-09-24 | CodeConcise |
| Thoughtworks Radar — Using GenAI to understand legacy codebases | https://www.thoughtworks.com/radar/techniques/using-genai-to-understand-legacy-codebases | ⭐⭐⭐ High | 최초 2024-04-03, 갱신 2025-11-05 | Adopt |
| Anthropic, Reduce hallucinations | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations | ⭐⭐⭐ High | 확인 2026-10-08 | 공식 문서 |
| Claude Code Subagents | https://code.claude.com/docs/en/sub-agents | ⭐⭐⭐ High | 확인 2026-10-08 | 공식 문서 |
| ISO/IEC/IEEE 29148:2018 | https://standards.ieee.org/ieee/29148/6937/ | ⭐⭐⭐ High | 2018-11-30 발행, Active | 개요(abstract)만 확인 |
| Chikofsky 용어집 (Georgia Tech) | https://sites.cc.gatech.edu/reverse/bibliography/terminology.html | ⭐⭐ Medium | 확인 2026-10-08 | 2차 소스 |
| Chikofsky 용어집 (IEEE-CS TCSE, 훔볼트대 미러) | https://www2.informatik.hu-berlin.de/~wwwcompsoft/projekt98/lehre/taxonomy.htm | ⭐⭐ Medium | 2000-02-07 갱신 | 2차 소스 |
| Chikofsky 논문 요약 (Georgia Tech) | https://sites.cc.gatech.edu/morale/tools/isvis/2009/summaries/Reverse_Engineering_and_Design_Recovery_A_Tax.pdf | ⭐⭐ Medium | 2009 | 서지 정보 포함 |
| 국내 화면정의서 실무 자료 | https://brunch.co.kr/@planbasic/26 , https://wikidocs.net/432794 | ⭐ Low | 확인 2026-10-08 | "공식 표준 없음" 근거(부재 확인용) |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 핵심 클레임 교차 검증 결과

| # | 클레임 | 소스 | 판정 |
|---|------|------|------|
| C1 | Chikofsky & Cross, IEEE Software 7(1):13-17, 1990 서지 | gatech 요약 PDF, 검색 결과 다수 | VERIFIED |
| C2 | Reverse Engineering = 구성요소·상호관계 식별 + 다른 형태/상위 추상 표현, 시스템을 바꾸지 않음 | gatech 용어집, hu-berlin 용어집, gatech 요약 | VERIFIED (원문 미열람 → SKILL.md 주의 표기) |
| C3 | Redocumentation 정의 문구 | gatech 용어집 vs hu-berlin vs gatech 요약 — 문구 상이 | DISPUTED → 3개 문구 병기 + 주의 표기 |
| C4 | Design Recovery = 관찰 + 도메인 지식·외부 정보·추론으로 상위 추상 식별 | gatech 용어집, hu-berlin 용어집 | VERIFIED |
| C5 | 특성화 테스트 목적 = 실제 동작 기록, 원하는 동작 검증 아님 | Feathers 블로그 원문, Wikipedia | VERIFIED |
| C6 | WELC 2004-09-22, ISBN 978-0-13-117705-5, 용어 유래 | informit, Wikipedia | VERIFIED (상품 설명에 용어 미기재 → "널리 인용된다"로 표현) |
| C7 | 승인 테스트 = 결과 스냅샷을 승인 후 변경 여부 확인 / 골든 마스터 = 출력 기준 비교 | approvaltests.com, codurance·understandlegacycode(검색) | VERIFIED |
| C8 | Strangler Fig 2024-08-22 개정, 동작 조각 이전, 전이 아키텍처, 원치 않는 동작 재구축은 낭비 | martinfowler.com, 기존 incremental-refactoring 스킬 | VERIFIED |
| C9 | Feature Parity 정의·저자·2021-07-27, "feature parity trap" | martinfowler.com, 검색 결과 | VERIFIED |
| C10 | Thoughtworks Radar legacy migration feature parity = Hold | thoughtworks.com Radar, Feature Parity 문서 맥락 | VERIFIED |
| C11 | 권고: 사용량 분석(로그·계측), end-to-end 프로세스 단위 진척 추적 | martinfowler.com Feature Parity, Radar(사용자 리서치) | VERIFIED |
| C12 | 미사용 기능 50%(2014 Standish Group) | Feature Parity 문서, Radar("about half") | UNVERIFIED(원 보고서 미확인) → 재인용 명시 + 주의 |
| C13 | EventStorming = 협업 워크숍, Brandolini, 3수준 Big Picture/Process/Software Design | eventstorming.com, Wikipedia, DDD Europe | DISPUTED(공식 메인은 Improve/Envision/Explore/Design 4용도) → 축 차이 주의 표기 |
| C14 | CRUD 완전성: 엔티티마다 C·R·U·D ≥1, Create 다중 = 중복 의심 | DePaul IS 315, TMap·arXiv(검색) | VERIFIED |
| C15 | CRUD 매트릭스가 정보공학에서 처음 도입 | arXiv 2011.10866(검색 요약)만 | UNVERIFIED → 주의 표기 |
| C16 | CodeConcise: AST→그래프 DB, 컨텍스트 노이즈 감소, 사람 통제·SME 필수 | martinfowler.com GenAI 글, gotopia·softwareseni(검색) | VERIFIED |
| C17 | Radar "Using GenAI to understand legacy codebases" 2025-11 Adopt | Radar 페이지, 검색 결과(최초 2024-04-03, 갱신 2025-11-05) | VERIFIED (현행 판 미게재 가능 → 시점 명시 주의) |
| C18 | Anthropic: "I don't know" 허용, 직접 인용, 인용 못 찾으면 철회, 외부 지식 제한, 제거 불가 경고 / 서브에이전트 독립 컨텍스트·요약 반환 | platform.claude.com 원문, code.claude.com 원문 | VERIFIED |
| (참고) | ISO/IEC/IEEE 29148:2018 Active, 요구공학 프로세스·정보 항목 | standards.ieee.org | VERIFIED(개요만) |
| (참고) | 한국식 화면정의서 공식 표준 없음 | 국내 실무 자료 복수("구성에 정답 없음") | VERIFIED(부재 주장 — 주의 표기) |

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Strangler Fig 2024-08-22, Radar 2025-11, 29148:2018, 각 소스 날짜)
- [✅] deprecated된 패턴을 권장하지 않음 (Feature Parity는 함정으로 명시, "Strangler Application" 구명칭 미사용)
- [✅] 코드 예시가 실행 가능한 형태임 (서브에이전트 지시문·마크다운 템플릿 — 실행 코드 아님)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (9절)
- [✅] 흔한 실수 패턴 포함 (10절)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 산출물 작성에 도움이 되는 수준 (템플릿 5종 + 진행 순서 9단계 + DoD)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (기술 스택 무관, 특정 회사 코드 없음, 스택별 세부는 별도 스킬로 위임)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-10-08, 3문항)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (잘못된 응답 없음 — 보완 불필요, 선택 보강만 섹션 7에 기록)

---

## 5. 테스트 진행 기록

**수행일**: 2026-10-08
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 대신 general-purpose 사용)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 레거시 Spring+MyBatis 어드민의 주문 모듈 API 명세를 LLM 서브에이전트로 추출하는 지시문·공통 칸·병합/검증 방법**
- ✅ PASS
- 근거: SKILL.md 6-2(R1~R9, 지시 예시), 7-0(공통 칸), 7-2, 7-6, 7-7, 8절 및 DoD, 10절
- 상세: 모듈 단위 분할, 파일:줄 근거, 재확인 후 철회, "미확인" 허용, 일반 관례 추측 금지, 확신도 "추정" 규칙을 지시문에 모두 반영. 공통 칸 3종(근거·확신도·사용 여부)과 R7·R9 병합/검증 절차 정확. anti-pattern(전체 레포 한 프롬프트 투입, 근거 없는 행) 회피.

**Q2. 특성화 테스트 중 발견한 반올림 버그를 "그냥 고치자", 미사용 기능까지 "전부 1:1 이전"하자는 요구에 대한 대응**
- ✅ PASS
- 근거: SKILL.md 2-1, 2-3, 3-2, 7-0, 8절 7·9단계, 10절
- 상세: 버그는 고치지 않고 `현행 버그 메모`에 기록, 호환/수정은 사람이 결정, 미사용 행은 삭제 않고 "재구축 제외 후보"로 표시, Feature Parity(Radar Hold)를 함정으로 지적. "50%" 수치를 재인용으로 취급. anti-pattern(버그 선수정, 전체 1:1 복제) 회피.

**Q3. CRUD 매트릭스에서 U/D 없음(로그 테이블)·Create 3개·무접촉 테이블의 해석과 조치**
- ✅ PASS
- 근거: SKILL.md 5절 규칙 1~3, 해석 표, 끝 주의 블록, 8절 5단계, 10절
- 상세: 세 건 모두 5절 원인 표로 분류하고 "위반 = 오류 아님, 사유 기재"로 처리. 무접촉 테이블은 삭제하지 않고 `미사용` 후보로 두며 배치·연동 명세 확인을 안내. 사실(확인됨)과 해석(추정) 분리. anti-pattern(무조건 오류 판정) 회피.

### 발견된 gap (선택 보강, 차단 요인 아님)

- Create 다중이 정당한 업무별 경로인지 중복인지 가르는 판별 기준 없음 (5절)
- 모듈 분할 크기 기준, 모듈 간 중복 URL·공통 코드 병합 규칙, R9 이중 추출 적용 범위 기준 없음 (6-2)
- `프로세스ID`가 7-0 공통 칸에는 없고 7-6·8절에만 나와 서브에이전트 지시 포함 여부가 불명확
- 버그 호환/수정의 결정권자·금액 영향 버그의 에스컬레이션 기준 없음 (2-3)
- 5절 규칙 3(역방향)이 Bernstein 원문인지 확장 해석인지 출처 표기 모호

### 판정

- agent content test: 3/3 PASS (DISPUTED·에러 없음)
- verification-policy 분류: 워크플로우 성격이 강한 스킬 — 9단계 진행 순서와 명세 양식 5종은 답변 정확성만으로는 칸 과부족·산출물 품질을 확인할 수 없고, 실제 레거시 프로젝트에 적용한 결과로만 검증 가능 (연계 스킬도 미생성). 따라서 실사용 필수 카테고리(워크플로우)로 분류
- 최종 상태: PENDING_TEST 유지 (content test는 통과, 실사용 적용 후 APPROVED 전환)

### (참고) 기존 예정 템플릿

### 테스트 케이스 1: (skill-tester 수행 대기)

**입력 (질문/요청):**
```
(skill-tester가 생성)
```

**판정:** 미실시

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 2·UNVERIFIED 2는 주의 표기로 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-10-08, 3/3 PASS) |
| **최종 판정** | **PENDING_TEST** (content test 통과, 워크플로우 성격 — 실사용 적용 대기) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 content test 수행 후 섹션 5·6 갱신 (2026-10-08 완료, 3/3 PASS)
- [❌] Chikofsky & Cross 1990 원문 확보 시 Redocumentation 정의 문구 확정 (C3)
- [❌] 2014 Standish Group 보고서 원문 확인 시 50% 수치 출처 보강 (C12)
- [❌] CRUD 매트릭스 정보공학 기원 1차 소스 확인 (C15)
- [❌] 실제 레거시 프로젝트에 양식 적용 후 칸 과부족 피드백 반영 (skill-tester 판정: 워크플로우 성격이라 실사용 필수 → **APPROVED 전환의 차단 요인**)
- [❌] 선택 보강: Create 다중 정당/중복 판별 기준, 모듈 분할·병합 규칙, 프로세스ID 공통 칸 여부, 버그 결정권자 기준, 5절 규칙 3 출처 표기 (차단 요인 아님)
- [❌] 연계 스킬(spring-mybatis-spec-extraction, react-spec-extraction, nexacro-17-xfdl-anatomy, characterization-testing) 생성 후 상호 링크 확인

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-10-08 | v1 | 최초 작성 (SKILL.md + references/spec-templates.md, 클레임 18개 판정) | skill-creator |
| 2026-10-08 | v1 | 2단계 실사용 테스트 수행 (Q1 API 명세 서브에이전트 지시·병합 / Q2 현행 버그·Feature Parity 대응 / Q3 CRUD 매트릭스 위반 해석) → 3/3 PASS, 워크플로우 성격으로 PENDING_TEST 유지 | skill-tester |
| 2026-10-08 | v1.1 | 설치 검수 반영 — spec-extraction 템플릿 단독 설치본에 없는 `incremental-refactoring` 참조 4곳에 "(설치된 경우)" 조건 표기. 내용 클레임 변경 없음 | Claude |
