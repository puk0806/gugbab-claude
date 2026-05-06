---
skill: eastern-vs-western-moral-philosophy
category: humanities
version: v1
date: 2026-05-03
status: APPROVED
---

# 검증 문서 — 동·서양 도덕철학 비교 (akrasia ↔ 유교 자기수양)

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `eastern-vs-western-moral-philosophy` |
| 스킬 경로 | `.claude/skills/humanities/eastern-vs-western-moral-philosophy/SKILL.md` |
| 검증일 | 2026-05-03 |
| 검증자 | skill-creator (Claude Code) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] SEP "Confucius" / "Wang Yangming" / "Zhu Xi" / "Weakness of Will" 1순위 소스 확인
- [✅] SUNY Press 공식 페이지에서 Tu Weiming, Hall & Ames 출판 정보 확인
- [✅] 한국민족문화대백과사전(encykorea.aks.ac.kr)에서 성학십도·이이 항목 확인
- [✅] *논어* 學而 4, 顏淵 1 원문·주석 다중 소스 확인
- [✅] *중용*·*대학* 愼獨 해석 학설사 확인 (Tao Liang, *Dao* 2014)
- [✅] Cambridge Univ. Press *Confucian Ethics* (Shun & Wong eds.) 확인
- [✅] 한국 학자(윤사순) KCI 등재 사실 확인. 황경식·정인재는 직접 서지 확인 필요로 표기
- [✅] akrasia ↔ 유교 비교표 작성 (4개 사상가 5개 측면)
- [✅] 흔한 실수 8개 패턴 정리
- [✅] 표준 텍스트 인용 형식 정리 (사서삼경 + 송대·조선 문헌)
- [✅] SKILL.md 파일 작성
- [✅] verification.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | docs/skills/VERIFICATION_TEMPLATE.md | 8개 섹션 구조 확보 |
| 중복 확인 | Read | 기존 SKILL.md 경로 | 미존재 확인 |
| 조사 1 | WebFetch | SEP "Confucius" / "Wang Yangming" / "Zhu Xi" / "Weakness of Will" | 4개 항목 핵심 개념 추출 |
| 조사 2 | WebSearch | "克己復禮為仁" 顔淵 / "愼獨" 中庸 大學 | *논어* 顔淵 1, 愼獨 학설사 확인 |
| 조사 3 | WebSearch | Tu Weiming SUNY 1985 / Hall & Ames SUNY 1987·1998 | 출판사·연도·페이지 확인 |
| 조사 4 | WebSearch | "吾日三省吾身" 學而 / 퇴계 성학십도 / 율곡 성학집요 | 한국 자료 추가 확보 |
| 조사 5 | WebSearch | 윤사순·황경식·정인재 KCI / akrasia Wang Yangming 비교 / Cambridge Companion | 한국 학자 검증, 비교 학계 동향 확보 |
| 교차 검증 | WebSearch | 핵심 클레임 7개, 독립 소스 2~4개씩 | VERIFIED 6 / DISPUTED 1 (性理大全 분류) / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| SEP "Confucius" | https://plato.stanford.edu/entries/confucius/ | ⭐⭐⭐ High | 2026-05-03 | 공식 학술 백과 |
| SEP "Wang Yangming" | https://plato.stanford.edu/entries/wang-yangming/ | ⭐⭐⭐ High | 2026-05-03 | 知行合一 공식 해석 |
| SEP "Zhu Xi" | https://plato.stanford.edu/entries/zhu-xi/ | ⭐⭐⭐ High | 2026-05-03 | 居敬窮理 공식 해석 |
| SEP "Weakness of Will" | https://plato.stanford.edu/entries/weakness-will/ | ⭐⭐⭐ High | 2026-05-03 | 소크라테스·아리스토텔레스 공식 해석 |
| SUNY Press *Confucian Thought* | https://sunypress.edu/Books/C/Confucian-Thought | ⭐⭐⭐ High | 2026-05-03 | Tu Weiming 1985 출판 정보 |
| SUNY Press *Thinking Through Confucius* | https://sunypress.edu/Books/T/Thinking-Through-Confucius | ⭐⭐⭐ High | 2026-05-03 | Hall & Ames 1987 |
| SUNY Press *Thinking from the Han* | https://www.sunypress.edu/p-2689-thinking-from-the-han.aspx | ⭐⭐⭐ High | 2026-05-03 | Hall & Ames 1998 |
| Cambridge Univ. Press *Confucian Ethics* | https://www.cambridge.org/us/universitypress/subjects/philosophy/ethics/confucian-ethics-comparative-study-self-autonomy-and-community | ⭐⭐⭐ High | 2026-05-03 | Shun & Wong eds. |
| 한국민족문화대백과사전 — 성학십도 | https://encykorea.aks.ac.kr/Article/E0029678 | ⭐⭐⭐ High | 2026-05-03 | 한국학중앙연구원 공식 |
| 한국민족문화대백과사전 — 이이 | https://encykorea.aks.ac.kr/Article/E0045546 | ⭐⭐⭐ High | 2026-05-03 | 한국학중앙연구원 공식 |
| KCI 한국학술지인용색인 | https://www.kci.go.kr/ | ⭐⭐⭐ High | 2026-05-03 | 윤사순 등재 확인 |
| Tao Liang, "Significance of Shendu" | https://link.springer.com/article/10.1007/s11712-014-9395-9 | ⭐⭐⭐ High | 2026-05-03 | *Dao* 13(4) — 愼獨 학설사 |
| The Discourses Vol.12 *Yan Yuan* | https://fourbooks.org/sourcebook/lunyu/12 | ⭐⭐ Medium | 2026-05-03 | *논어* 顏淵 원문 보조 확인 |
| 5000yan.com *論語* 學而 4 | https://lunyu.5000yan.com/1-4.html | ⭐⭐ Medium | 2026-05-03 | 吾日三省吾身 원문 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] SEP 등 공식 학술 백과와 불일치 없음
- [✅] 텍스트 출전(편명·장수)이 표준 인용 형식과 일치
- [✅] deprecated된 해석을 권장하지 않음 (예: 愼獨의 鄭玄 단일 해석 강요 회피)
- [✅] 비교표가 단순 등치 없이 차이 지점도 명시

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description with examples)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (自省·克己·愼獨·誠意正心·居敬窮理·知行合一·敬·誠敬)
- [✅] 비교표 + 표준 인용 형식 표 + 흔한 실수 표 포함
- [✅] "사용 범위" 절(0장)에서 비전공자용 한계 명시
- [✅] 흔한 실수 패턴 8개 포함

### 4-3. 실용성

- [✅] 도덕윤리교육 학위논문 작성에 직접 활용 가능한 구조
- [✅] 활용 패턴 A·B·C로 구체적 적용 시나리오 제시
- [✅] 제출 전 자체 체크리스트 포함
- [✅] 특정 프로젝트 종속 없는 범용 학술 가이드

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-03, skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (3/3 PASS, 보완 불필요)

---

## 4-5. 클레임별 교차 검증 결과

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|---------|---------|------|
| 1 | 王陽明 *傳習錄*: "안다고 하면서 행하지 않는 자는 아직 알지 못한 것이다" | SEP Wang Yangming (직접 인용) | The Empyrean Trail "Knowing and Doing" 비교 글 | VERIFIED |
| 2 | 朱子 居敬窮理는 "두 갈래 수양 노력" 구조 | SEP Zhu Xi | Cambridge *Confucian Ethics* 자기수양 섹션 | VERIFIED |
| 3 | "吾日三省吾身"은 *논어* 學而 4, 증자 발언 | 5000yan.com 원문 + 명륜 *논어간설* | 다수 한문 사이트 일치 | VERIFIED |
| 4 | "克己復禮爲仁"은 *논어* 顏淵 1, 안연 질문에 대한 답 | The Discourses Yan Yuan 12 | confucius.page Analects 12.1 + 다수 사이트 일치 | VERIFIED |
| 5 | 愼獨의 "獨" 해석에 학설 차이가 있다 | Tao Liang, *Dao* 13(4) 2014 | Springer Link 학술 논문 | VERIFIED (논쟁 사실 자체) |
| 6 | Tu Weiming *Confucian Thought* — SUNY Press 1985, xi+203pp. | SUNY Press 공식 페이지 | Cambridge Royal Asiatic Society 서평(1985 PDF) | VERIFIED |
| 7 | Hall & Ames *Thinking Through Confucius* — SUNY 1987, *Thinking from the Han* — SUNY 1998 | SUNY Press 공식 페이지 | Amazon ISBN, philpapers, Goodreads 일치 | VERIFIED |
| 8 | *性理大全*은 주자의 1차 저작 | (사용자 요청 원문) | SEP Zhu Xi에서는 *朱子語類*·*朱子文集*만을 1차 저작으로 분류. *性理大全*은 1415년 명대 호광 등 편찬 | DISPUTED → SKILL.md에서 "후대 종합서"로 정정 + `> 주의:` 표기 |

**DISPUTED 처리:** 사용자 요청에는 "주자의 *性理大全*"으로 적혀 있었으나, SEP Zhu Xi 항목 및 학술 표준에서는 *性理大全*을 명대 영락제 시기(1415) 호광 등이 편찬한 후대 종합서로 분류한다. SKILL.md §3에서 "*性理大全*은 명대 편찬된 송원 성리학 종합서"로 정정하고 `> 주의:` 표기로 명시.

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-03
**수행자**: skill-tester (general-purpose 대체 수행)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 王陽明 知行合一과 소크라테스 주지주의 비교 — 단순 등치 없이 서술하는 방법**
- 결과: PASS
- 근거: SKILL.md §4 "akrasia와의 관계" 섹션 + §7 비교표
- 상세: "결론은 유사(akrasia 부정)하지만 근거는 다르다(인지주의 vs 체현적 정감주의)"가 §4에 명시. "동양의 소크라테스" 통속 비교 회피 주의가 §4 말미에 명시. §7 비교표 "인지/정서 관계" 행에서도 이 대비가 구조화되어 있음.

**Q2. 朱子 居敬窮理와 아리스토텔레스 hexis 비교점·차이점**
- 결과: PASS
- 근거: SKILL.md §3 "朱子 居敬窮理" 섹션 + §7 비교표
- 상세: 공통 요소("반복적 실천·집중·구체적 상황 학습")와 차이("居敬의 '敬'은 종교적·의례적 함의 포함, hexis와 단순 등치 금지") 모두 §3에 수록. §7 비교표에서 "극복 방법"·"시간 구조" 행에도 표현됨. 미세 gap: hexis의 목적인론적 기반 vs 居敬의 理氣 형이상학적 기반 차이까지는 서술되지 않았으나, 학위논문 가이드 수준으로는 충분.

**Q3. *논어* 「학이」 4장 "吾日三省吾身" 학위논문 인용 형식 (한문+한국어 병기)**
- 결과: PASS
- 근거: SKILL.md §2-1 + §11 "표준 텍스트 인용 형식" 섹션
- 상세: §2-1에서 원문(한문)과 한국어 번역을 직접 병기 예시로 제공. 출처 "*論語* 學而 第一, 4장 (증자 曾參)"도 명시. §11 표에서 "*論語*, 學而 4" 형식 확인. §11 인용 원칙 4조항(한문+번역 병기, 한자 편명 표기, 표준 번역 출처 명시, 재인용 명시) 모두 수록.

### 발견된 gap (있으면)

- §3: hexis의 목적인론적(teleological) 기반 vs 居敬의 理氣 형이상학 기반 차이를 한 문장 추가하면 학위논문 활용도가 더 높아질 수 있음. 단, 현재 수준으로도 차단 요인 없음 — 선택 보강 사항.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 해당 없음 (학술 가이드 스킬, 실사용 필수 카테고리 아님)
- 최종 상태: APPROVED

---

> (참고용 예정 템플릿 — 위 실제 수행으로 대체됨)

### (완료) 테스트 케이스 1: 비교 챕터 구성 도움 요청 → 3/3 PASS로 대체

### (완료) 테스트 케이스 2: 한국 학자 인용 검증 → 3/3 PASS로 대체

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-03 skill-tester 수행, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

판정 사유: 1단계(내용 검증)는 SEP·SUNY·Cambridge·KCI 1순위 소스로 완료. 2단계(실사용 테스트)는 2026-05-03 skill-tester가 3개 실전 질문(王陽明↔소크라테스 비교, 朱子 居敬窮理↔hexis 비교, *논어* 인용 형식)을 수행하여 3/3 PASS 확인. APPROVED 전환.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-03 완료, 3/3 PASS)
- [❌] 황경식·정인재의 정확한 KCI 등재 논문 목록 추가 (본인이 KCI 직접 검색 후 보강) — 차단 요인 아님, 선택 보강
- [❌] *孟子* 관련 자기수양 개념(浩然之氣, 求放心)을 별도 절로 확장 검토 — 차단 요인 아님, 선택 보강
- [❌] 한국 도덕교육 분야 학술지(*도덕윤리과교육*, *윤리교육연구* 등) 비교 연구 사례 추가 — 차단 요인 아님, 선택 보강
- [❌] hexis 목적인론적 기반 vs 居敬 理氣 형이상학 기반 차이를 §3에 한 문장 추가 (Q2 테스트 중 발견) — 차단 요인 아님, 선택 보강
- [❌] 일본 유학(伊藤仁齋·荻生徂徠)과 비교는 의도적으로 제외 (논문 범위 초과). 필요 시 별도 스킬화.
- [❌] 실제 학위논문 작성 후 사용 결과 반영하여 v2 갱신

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-03 | v1 | 최초 작성. SEP 4개 항목 + SUNY Press 3종 + Cambridge UP 1종 + KCI + 한국민족문화대백과사전 검증 후 SKILL.md·verification.md 동시 작성. *性理大全* 1차 저작 분류 클레임은 DISPUTED 판정 후 정정. | skill-creator |
| 2026-05-03 | v1 | 2단계 실사용 테스트 수행 (Q1 王陽明↔소크라테스 단순 등치 회피 / Q2 居敬窮理↔hexis 비교·차이 / Q3 *논어* 학이 4장 인용 형식) → 3/3 PASS, PENDING_TEST → APPROVED 전환. 섹션 5·6·7·8 전체 동기화. | skill-tester |
