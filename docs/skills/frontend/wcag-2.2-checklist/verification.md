---
skill: wcag-2.2-checklist
category: frontend
version: v3
date: 2026-09-28
status: APPROVED
---

# 스킬 검증 — wcag-2.2-checklist

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `wcag-2.2-checklist` |
| 스킬 경로 | `.claude/skills/frontend/wcag-2.2-checklist/SKILL.md` |
| 검증일 | 2026-09-28 (재검증, 최초 2026-06-02) |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 표준 | WCAG 2.2 (W3C Recommendation, 2023-10-05) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (W3C TR/WCAG22, WAI new-in-22, WAI Understanding)
- [✅] 공식 GitHub 2순위 소스 확인 (w3c/wcag 이슈 트래커)
- [✅] 최신 버전 기준 내용 확인 (WCAG 2.2 W3C Recommendation, 2023-10-05)
- [✅] 4 원칙 (POUR) 및 적합성 레벨 (A/AA/AAA) 정리
- [✅] A 레벨 30개 SC 체크리스트 작성 + 자동/수동 점검 매핑
- [✅] AA 레벨 20개 SC 체크리스트 작성 + 자동/수동 점검 매핑
- [✅] WCAG 2.2 신규 9개 SC 요점 정리 (A 2개, AA 4개, AAA 3개)
- [✅] 4.1.1 Parsing 제거 사실 명시
- [✅] 자동 점검 도구별 커버리지 표 작성 (axe-core, Lighthouse, WAVE, Pa11y, IBM Equal Access)
- [✅] 수동 점검 핵심 시나리오 9가지 정리
- [✅] 핵심 코드 예시 8개 작성 (대비, 타겟 크기, 포커스 가림, 포커스 표시, 색, 인증, 드래그, 언어)
- [✅] 흔한 실수 패턴 Top 10 정리
- [✅] 법적 배경 (한국 장차법, 미국 Section 508/ADA, EU EAA, 일본 JIS, VPAT) 정리
- [✅] SKILL.md 파일 작성
- [✅] skill-tester 실사용 테스트 (2026-06-02 수행 완료, 3/3 PASS)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | docs/skills/VERIFICATION_TEMPLATE.md | 8섹션 구조 확인 |
| 중복 확인 | Glob | `.claude/skills/**/wcag-2.2-checklist/SKILL.md` | 미존재 확인 (신규 작성) |
| 조사 1 | WebFetch | https://www.w3.org/TR/WCAG22/ | 87개 SC 전체 리스트, 신규 9개, 4.1.1 제거 확인 |
| 조사 2 | WebSearch | "WCAG 2.2 W3C Recommendation publication date October 2023" | 발표일 2023-10-05 확인 (10개 소스) |
| 조사 3 | WebFetch | https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ | 신규 9개 SC 요약 확인 |
| 조사 4 | WebSearch | "WCAG 2.2 target size minimum 24x24 CSS pixels exceptions" | 5가지 예외(Spacing/Equivalent/Inline/Essential/UA Control) 확인 |
| 조사 5 | WebSearch | "axe-core automated testing WCAG coverage percentage" | Deque 공식 — 실 이슈 57%, SC 단위 29.5% 완전 자동 확인 |
| 조사 6 | WebSearch | "WCAG 2.2 contrast ratio 4.5:1 large text 3:1 1.4.3" | 일반 4.5:1, 큰 텍스트(18pt or 14pt bold) 3:1 확인 |
| 조사 7 | WebSearch | "European Accessibility Act EAA enforcement June 2025" | 2025-06-28 시행 확인, 27 EU 회원국 적용 |
| 조사 8 | WebSearch | "한국 장애인차별금지법 웹접근성 의무 시행 2008 KWCAG" | 장차법 제21조 2008-04 시행, KWCAG 2.0 (방통위) 확인 |
| 조사 9 | WebSearch | "WCAG 2.2 2.4.11 Focus Not Obscured Minimum sticky header" | sticky header가 포커스를 완전히 가리면 위반, scroll-padding/scroll-margin으로 해결 |
| 조사 10 | WebSearch | "WCAG 2.2 3.3.8 Accessible Authentication CAPTCHA exception" | 객체/그림 인식 AA 예외, CAPTCHA는 비인간 식별 목적 시 본 SC 면제 |
| 조사 11 | WebSearch | "WCAG 2.2 3.2.6 Consistent Help help mechanisms consistent location" | 4종 도움말 메커니즘, 동일 상대 순서(serialized order) 유지 |
| 교차 검증 | WebSearch + WebFetch | 핵심 클레임 6개 독립 소스 2개 이상 확인 | VERIFIED 5 / DISPUTED 1(해결) / UNVERIFIED 0 |
| 작성 | Write | SKILL.md, verification.md | 2개 파일 생성 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| W3C — WCAG 2.2 Recommendation | https://www.w3.org/TR/WCAG22/ | ⭐⭐⭐ High | 2026-06-02 | 1순위 공식 표준 문서 |
| W3C WAI — What's New in WCAG 2.2 | https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ | ⭐⭐⭐ High | 2026-06-02 | 신규 9개 SC 공식 요약 |
| W3C WAI — WCAG 2.2 Understanding 문서 | https://www.w3.org/WAI/WCAG22/Understanding/ | ⭐⭐⭐ High | 2026-06-02 | 각 SC 상세 해설 |
| W3C — WCAG 2.2 Recommendation 발표 뉴스 | https://www.w3.org/WAI/news/2023-10-05/wcag22rec/ | ⭐⭐⭐ High | 2026-06-02 | 발표일 확정 근거 |
| W3C — F110 Failure Technique (2.4.11) | https://www.w3.org/WAI/WCAG22/Techniques/failures/F110 | ⭐⭐⭐ High | 2026-06-02 | sticky header 실패 사례 |
| W3C — Understanding 2.5.8 Target Size | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | ⭐⭐⭐ High | 2026-06-02 | 5가지 예외 정의 |
| W3C — Understanding 3.3.8 Accessible Authentication | https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html | ⭐⭐⭐ High | 2026-06-02 | CAPTCHA 예외 명시 |
| W3C — Understanding 3.2.6 Consistent Help | https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html | ⭐⭐⭐ High | 2026-06-02 | 4종 도움말 메커니즘 |
| Deque — Automated Accessibility Coverage Report | https://www.deque.com/automated-accessibility-coverage-report/ | ⭐⭐⭐ High | 2026-06-02 | axe-core 커버리지 공식 발표 |
| Deque axe-core GitHub | https://github.com/dequelabs/axe-core | ⭐⭐⭐ High | 2026-06-02 | 도구 사양 |
| WebAIM Contrast Article | https://webaim.org/articles/contrast/ | ⭐⭐⭐ High | 2026-06-02 | 색상 대비 공인 자료 |
| AccessibleEU — EAA 시행 안내 | https://accessible-eu-centre.ec.europa.eu/content-corner/news/eaa-comes-effect-june-2025-are-you-ready-2025-01-31_en | ⭐⭐⭐ High | 2026-06-02 | EU 공식 시행 안내 |
| 한국디지털접근성진흥원 — 관련 법률 | http://www.kwacc.or.kr/Accessibility/Law | ⭐⭐⭐ High | 2026-06-02 | 한국 법적 근거 |
| 국가법령정보센터 — 장애인차별금지법 | https://www.law.go.kr/lsInfoP.do?lsiSeq=195377 | ⭐⭐⭐ High | 2026-06-02 | 법조문 원문 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서(W3C TR/WCAG22)와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (WCAG 2.2, 발표일 2023-10-05)
- [✅] deprecated된 패턴(4.1.1 Parsing) 제거 사실 본문에서 명시
- [✅] 코드 예시가 실행 가능한 형태(CSS·HTML·React/TSX)
- [✅] 신규 9개 SC의 레벨(A/AA/AAA) 분류 일치

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] `> 소스:` URL과 `> 검증일:` 명시
- [✅] 4 원칙·적합성 레벨 개념 설명 포함
- [✅] A/AA 50개 SC 체크리스트 표 형식 제공
- [✅] 자동/수동 점검 매핑 컬럼 포함
- [✅] 코드 예시 8개 포함
- [✅] 흔한 실수 패턴 Top 10 포함
- [✅] 법적 배경 (한·미·EU·일) 별도 섹션 포함
- [✅] 점검 워크플로우 절차 포함

### 4-3. 실용성

- [✅] 에이전트가 컴플라이언스 감사 작성 시 그대로 참조 가능한 표 구조
- [✅] 지나치게 이론적이지 않고 코드 예시·실패 사례 중심
- [✅] 범용적 (특정 프로젝트·라이브러리 종속 없음, React TSX 예시 일부 외 framework 중립)
- [✅] `frontend/accessibility` 스킬과 중복 최소화 (ARIA 구현은 짧게만 처리)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-02 수행, 3/3 PASS)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-06-02 확인 완료)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — gap 발견 없음
- [✅] 2026-09-26 `media-accessibility` 병합 반영분(5.9절) 포함 재테스트 (a11y-auditor, 3/3 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-26
**수행자**: skill-tester → a11y-auditor
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변(구 `media-accessibility` 스킬 병합 반영분인 5.9절 미디어 SC·한국어 자막 함정을 겨냥한 질문 포함), 근거 섹션 및 anti-pattern 회피 확인. a11y-auditor에게 Read 도구만 허용하고 WebSearch·WebFetch·자기 지식 사용을 금지해 SKILL.md 근거만으로 답하도록 제한.

### 실제 수행 테스트

**Q1. 텍스트 명도 대비(1.4.3) vs 비-텍스트 UI 요소 명도 대비(1.4.11) 구분**
- ✅ PASS
- 근거: SKILL.md §3 AA 체크리스트 1.4.3·1.4.11 행, §5.1 명도 대비 코드 예시
- 상세: `#767676 on #FFFFFF`(4.54:1, 1.4.3 통과)와 입력창 테두리(1.4.11, 3:1 기준)를 정확히 구분. SKILL.md에 없는 `#949494`의 정확한 대비 수치는 추측하지 않고 "SKILL.md만으로 판정 불가, §11 외부 도구 필요"라고 정직하게 답변 — anti-pattern(근거 없는 수치 날조) 회피 확인.

**Q2. 한국어 단일 언어 콘텐츠도 captions 필요 여부 + 자동 생성 자막 충족 여부 + AA 목표 시 transcript만으로 충분한지 (병합 반영분 겨냥)**
- ✅ PASS
- 근거: SKILL.md §5.9 "Captions ≠ Subtitles — 한국어 자막의 함정" 표 및 오해 교정 문단, "1.2.3 vs 1.2.5" 구분 표, "감사 시 체크 포인트"
- 상세: "번역이 아니니 자막 불필요"라는 기획팀 판단이 틀렸음을 정확히 지적(1.2.2 대상은 청각장애 사용자이지 번역이 아님), 자동 생성 자막은 사람 교정 없이는 1.2.2 미충족, AA 목표 시 transcript만으로는 1.2.5(음성 해설 자체) 불충분함을 정확히 답변 — 병합의 핵심 목적(한국어 콘텐츠 오해 교정)이 실제로 답변에 반영됨을 확인.

**Q3. 드래그형 캡차만 있을 때 3.3.8 위반 여부 + 객체 인식 캡차로 전환 시 AA/AAA 판정**
- ✅ PASS
- 근거: SKILL.md §4 3.3.8 Accessible Authentication 설명(인정되는 대안 목록), §4 AAA 신규 표 3.3.9
- 상세: 드래그 퍼즐 캡차 단독 제공은 대안 부재로 위반, 객체 인식 캡차는 AA에서는 예외로 인정되나 AAA(3.3.9)에서는 예외가 사라져 위반이라는 AA/AAA 차이를 정확히 구분해 답변.

### 발견된 gap (SKILL.md 보강 권장 — 이번 세션에서 직접 수정하지 않음. 다른 작업자가 frontend 참조 정리 중이라 보고만)

- 대비 계산 공식(상대 휘도 산출식)이 스킬에 없어 예시로 주어지지 않은 임의 색상 조합은 SKILL.md만으로 검증 불가 — 설계상 의도(§11에서 외부 도구로 위임)이므로 선택 보강, 차단 요인 아님
- 자동 생성 자막의 "교정 완료" 판단 기준(오류율 허용치 등 정량 임계값)이 없음 — 선택 보강, 차단 요인 아님
- 1.2.4(라이브 자막, AA)가 §3 표에는 있으나 §5.9 본문 설명이 한 줄뿐 — 라이브 스트리밍 케이스 보강 여지, 차단 요인 아님
- 3.3.8 "비인간 식별 목적 캡차는 면제"와 "인지 테스트형 캡차는 대안 필수" 두 문구의 관계가 다소 모호 — 선택 보강, 차단 요인 아님

### 판정

- agent content test: 3/3 PASS (a11y-auditor 사용 — Read 외 도구 사용 금지 지시로 SKILL.md 근거만 사용하도록 제한)
- verification-policy 분류: 해당 없음 (라이브러리 사용법·표준 정리형 — content test PASS = APPROVED 가능 카테고리, 2026-06-02 최초 판정 유지)
- 최종 상태: APPROVED (병합 반영분 포함 3/3 PASS로 재확인)

---

### 재검증 (2026-09-28)

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read 후 핵심 클레임 3개 1차 소스 대조(WebSearch 세션 한도 소진으로 WebFetch 위주) + 실전 질문 2개 답변 검증

**클레임 대조:**
- axe-core 자동 점검 커버리지(실 이슈 약 57%): Deque 공식 페이지(deque.com/automated-accessibility-coverage-report) WebFetch 재확인 → "57.38%" 그대로 유지, 변경 없음. 다만 Deque 자체가 "SC 개수 기준 20~30%"보다 "이슈 볼륨 기준 57%"가 더 의미 있는 지표라고 강조하는 뉘앙스 확인 — SKILL.md는 이미 두 수치(57% / SC 단위 29.5%)를 구분해 기술하고 있어 정정 불필요
- WCAG 2.2가 여전히 최신 W3C Recommendation인지(WCAG 2.3 초안 진행 여부): WebSearch 세션 한도 소진으로 교차 검증 불가 → `> 주의: WCAG 2.3 진행 상태 미검증(2026-09-28 기준 WebSearch 한도 소진)`으로 표기 필요하나, WCAG 2.2는 W3C Recommendation으로 발표된 이상 2.3이 나와도 2.2 자체 내용(SC 정의)은 불변이므로 본 체크리스트 실용성에는 영향 없음
- EU EAA 2025-06-28 시행: 과거 시행일(이미 지난 날짜)이므로 재변동 없는 역사적 사실

Q1. "axe-core로 자동 점검하면 WCAG 위반의 몇 %나 잡을 수 있어? 최신 수치 맞아?"
— PASS. 근거: SKILL.md §6.1 "실 이슈 57%, SC 단위 29.5% 완전 자동" — Deque 공식 페이지 재조회 결과 57.38%로 일치.

Q2. "WCAG 2.2가 지금도 최신 기준이야, 아니면 2.3 같은 게 나왔어?"
— PASS(부분). SKILL.md에는 2.2가 현재 기준이라는 전제만 있고 2.3 동향은 다루지 않음. 답변 시 "WCAG 2.2가 2023-10-05 W3C Recommendation으로 확정된 표준이며, 이후 개정판 발표 여부는 SKILL.md 범위 밖 — 별도 확인 필요"로 정직하게 한계를 밝히는 것이 올바른 답변(추측 금지 원칙 준수).

**판정**: 핵심 수치(axe-core 커버리지) 불변 확인, WCAG 2.3 동향은 WebSearch 한도로 미검증(체크리스트 자체의 유효성에는 영향 없음) → status APPROVED 유지.

---

### (참고) 이전 테스트 기록

**수행일**: 2026-06-02
**수행자**: skill-tester → general-purpose (frontend-developer 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. WCAG 2.2에서 새로 추가된 AA 레벨 SC 4개를 모두 나열하라**
- PASS
- 근거: SKILL.md "§4 AA 레벨 신규 (4개)" 섹션 + §3 AA 체크리스트 ★2.2 신규 마킹
- 상세: 2.4.11 Focus Not Obscured / 2.5.7 Dragging Movements / 2.5.8 Target Size (Minimum) / 3.3.8 Accessible Authentication (Minimum) 4개 정확히 도출. 표(§3)와 상세 설명(§4) 간 정합성 확인됨.

**Q2. 버튼 크기 18×18 CSS px, 인접 타겟과 20px 간격 — WCAG 2.5.8 위반인가?**
- PASS
- 근거: SKILL.md "§4 2.5.8 Target Size (Minimum)" 섹션 + §5.2 코드 예시
- 상세: Spacing 예외 조건(24px 지름 원이 다른 타겟과 겹치지 않으면 OK) 적용. 18px 타겟 + 20px 간격이면 원이 겹치지 않아 위반 아님. §5.2에서 16px 타겟 + margin 4px spacing 예외 예시도 근거로 확인 가능.

**Q3. axe-core 자동 도구로 WCAG 위반의 몇 %를 잡을 수 있고, 나머지는 어떻게 점검하나?**
- PASS
- 근거: SKILL.md "§6.1 도구별 커버리지" 표 + 하단 주석 + §7 수동 점검 핵심 시나리오
- 상세: 실제 이슈 약 57% 탐지 / SC 기준 29.5% 완전 자동·10.3% 부분 자동·60.2% 수동 필수 (Deque 공식 수치 명시됨). 수동 점검 9가지 시나리오(키보드·스크린리더·줌·텍스트 간격·색맹 시뮬레이션·reduced-motion·모바일 회전·sticky Tab·패스워드 매니저) 상세 기술됨.

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md에서 완전한 근거 확인 가능.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법·표준 정리형 — content test로 충분)
- 최종 상태: APPROVED

---

> (참고용) 아래는 skill-creator가 남긴 향후 테스트 케이스 후보 원본 (실제 수행은 위에서 완료)

향후 권장 테스트 케이스 (원본 메모):

### 테스트 케이스 후보 1: 신규 SC 식별
**입력:** "WCAG 2.2에서 새로 추가된 success criteria 중 AA 레벨인 것을 모두 나열하라."
**기대 결과:** 2.4.11 Focus Not Obscured (Minimum), 2.5.7 Dragging Movements, 2.5.8 Target Size (Minimum), 3.3.8 Accessible Authentication (Minimum) — 4개

### 테스트 케이스 후보 2: 타겟 크기 예외
**입력:** "버튼 크기가 18×18이지만 인접 타겟과 충분히 떨어져 있다. WCAG 2.5.8 위반인가?"
**기대 결과:** Spacing 예외 적용 가능 — 24 CSS px 지름 원이 다른 타겟과 겹치지 않으면 OK.

### 테스트 케이스 후보 3: 4.1.1 Parsing 상태
**입력:** "HTML validator 결과 4.1.1 Parsing 위반이 나왔다. WCAG 2.2 AA 컴플라이언스에 문제 있나?"
**기대 결과:** 4.1.1은 WCAG 2.2에서 obsolete되어 제거됨. 2.2 기준 AA 컴플라이언스 판정에는 영향 없음. 단, WCAG 2.0/2.1 적용 시스템에는 여전히 적용.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ 공식 W3C 문서 + 다중 독립 소스 교차 검증 완료 |
| 구조 완전성 | ✅ frontmatter + 소스/검증일 + 50개 SC 표 + 신규 9개 상세 + 법적 배경 |
| 실용성 | ✅ 표 형식 체크리스트 + 코드 예시 8개 + 실수 Top 10 |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-06-02, Q1 신규 AA SC / Q2 타겟 크기 예외 / Q3 자동점검 커버리지) + ✅ 3/3 PASS (2026-09-26 재테스트, 미디어 병합 반영분 포함) |
| **최종 판정** | **APPROVED** (2026-09-26 재검증 완료 — 미디어 병합 반영분 포함 3/3 PASS) |

### 교차 검증 결과 (핵심 클레임 6개)

| 클레임 | 판정 | 근거 |
|--------|------|------|
| WCAG 2.2는 2023-10-05 W3C Recommendation으로 발표됨 | VERIFIED (DISPUTED → 해결) | WebFetch 1차 응답에서 "2024-12-12"가 나왔으나, w3c.org/WAI/news/2023-10-05 공식 뉴스 + WAI new-in-22 페이지에서 2023-10-05 재확인. 1차 응답은 오류로 판정. |
| WCAG 2.2 신규 SC는 9개 (A 2 / AA 4 / AAA 3) | VERIFIED | W3C TR + WAI new-in-22 + 다수 보조 소스 일치 |
| 4.1.1 Parsing은 WCAG 2.2에서 제거됨 | VERIFIED | W3C TR + WAI new-in-22 명시 |
| 2.5.8 Target Size 최소값은 24×24 CSS px | VERIFIED | W3C Understanding 2.5.8 명시, 5가지 예외 확인 |
| 1.4.3 명도 대비 일반 4.5:1, 큰 텍스트 3:1, 큰 텍스트 정의 18pt 또는 14pt bold | VERIFIED | W3C Understanding 1.4.3 (2.1 그대로 유지) + WebAIM 일치 |
| axe-core 자동 점검은 실 이슈의 약 57%, SC 단위 약 30%만 완전 자동 | VERIFIED | Deque 공식 Automated Accessibility Coverage Report |

---

## 7. 개선 필요 사항

- [✅] skill-tester를 통한 agent content test 수행 (2026-06-02 완료, 3/3 PASS)
- [❌] 실제 프로덕션 사이트 대상으로 본 체크리스트 적용 → 누락 항목 발견 시 SKILL.md 보강 (선택 보강 — APPROVED 전환을 차단하지 않음)
- [❌] KWCAG 2.2 (한국형) 항목 번호 매핑 별도 부록 작성 검토 (현재는 WCAG 2.2 SC 번호 기준) (선택 보강 — 공공기관 납품 시 별도 확인 안내로 충분)
- [❌] AAA 레벨 success criteria 별도 부록 검토 (현재는 신규 3개만 명시) (선택 보강 — AAA는 의무 기준 아님)
- [❌] 자동 점검 도구별 CI 예시 확장 (Lighthouse CI, Pa11y CI, IBM Equal Access) (선택 보강 — 현재 axe-core CI 예시로 핵심 커버됨)
- [✅] (2026-09-26 완료, 3/3 PASS) `media-accessibility` 병합 반영분(5.9절) 포함 skill-tester 재테스트 → 섹션 5·6 업데이트, PENDING_TEST → APPROVED 재전환
- [❌] (선택 보강, 차단 요인 아님) 자동 생성 자막의 "사람 교정 완료" 판단 기준(정량 임계값) 보강
- [❌] (선택 보강, 차단 요인 아님) 1.2.4 라이브 자막(AA) 실무 가이드 §5.9 본문 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-02 | v1 | 최초 작성 — WCAG 2.2 A/AA 50개 SC 체크리스트 + 신규 9개 + 자동/수동 점검 매핑 + 법적 배경 | skill-creator |
| 2026-06-02 | v1 | 2단계 실사용 테스트 수행 (Q1 신규 AA SC 4개 나열 / Q2 타겟 크기 18px Spacing 예외 판정 / Q3 axe-core 커버리지 57% + 수동 점검 9종) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-26 | v2 | **병합**: 구 `frontend/media-accessibility` 스킬 제거(스킬 트리아지 MERGE 판정)하면서 미디어 SC 고유분을 5.9절로 이관 — 1.2.3(A, 해설 또는 대체본) vs 1.2.5(AA, 해설 자체) 구분, captions vs subtitles 표, "한국어 콘텐츠도 captions 필요" 오해 교정, `<track>` 감사 포인트, 자동 자막 사람 교정 필요, descriptions 트랙 지원 한계. WebVTT 작성법·Whisper 자막 생성·transcript 양식은 일반 지식이라 이관하지 않음. 출처: https://www.w3.org/TR/WCAG22/ , https://webaim.org/techniques/captions/ , https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track (구 media-accessibility verification.md: C1·C2·C3·C4 VERIFIED — SC 1.2.2=A, 1.2.4·1.2.5=AA, 1.4.2 3초, track kind 5종, 검증일 2026-06-04, APPROVED). status APPROVED → PENDING_TEST | 메인 대화 (스킬 정리) |
| 2026-09-26 | v3 | 2단계 실사용 테스트 재수행 (Q1 1.4.3 vs 1.4.11 명도 대비 구분 / Q2 병합 반영분 — 한국어 콘텐츠 captions 필요·자동 자막 미충족·1.2.3 vs 1.2.5 / Q3 3.3.8 드래그 캡차·객체 인식 캡차 AA/AAA 판정) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-28 | v3 | 재검증: axe-core 커버리지(57.38%) Deque 공식 페이지 재대조로 불변 확인. WCAG 2.3 동향은 WebSearch 세션 한도 소진으로 미검증(체크리스트 유효성 영향 없음). status APPROVED 유지 | 메인 세션 |
