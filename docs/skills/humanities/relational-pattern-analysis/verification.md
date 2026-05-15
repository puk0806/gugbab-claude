---
skill: relational-pattern-analysis
category: humanities
version: v1
date: 2026-05-15
status: APPROVED
---

# 검증 문서 — `humanities/relational-pattern-analysis`

> 관계 패턴 분석 — Gottman 4 Horsemen · EFT pursuer/withdrawer cycle · NVC 4단계의 학술적 정리.
> 꿈 해몽 앱에서 *진단·치료 권고 금지* 가드레일과 함께 일반론적 모델 제공용.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `relational-pattern-analysis` |
| 스킬 경로 | `.claude/skills/humanities/relational-pattern-analysis/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (자동) |
| 스킬 버전 | v1 |
| 짝 스킬 | `humanities/attachment-theory-basics` · `meta/dream-interpretation-prompt-engineering` |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Gottman Institute · ICEEFT · Dr. Sue Johnson · CNVC · PuddleDancer Press)
- [✅] 학술 1차 문헌 확인 (Gottman & Levenson 1992/2000, Johnson 2008/2019, Rosenberg 2003/2015)
- [✅] 최신 판본·년도 확인 (Seven Principles 1999, Hold Me Tight 2008, NVC 3rd ed. 2015)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (4 horsemen · pursuer-withdrawer · 4단계 NVC)
- [✅] 적용 예시 작성 (꿈 해몽 앱 관계 조언 적용)
- [✅] 흔한 함정·anti-pattern 정리 (단일 사건 단정·기법화·상대 진단 등 7종)
- [✅] 학술적 한계·진단 금지 가드레일 명시
- [✅] SKILL.md 파일 작성
- [✅] verification.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | "Gottman Method Four Horsemen criticism contempt defensiveness stonewalling antidotes official" | gottman.com 공식 + 학술 PDF + 임상 사이트 10건 수집. 4 horsemen 정의·antidote 4종·예측력 인용 확보 |
| 조사 2 | WebSearch | "Emotionally Focused Therapy Sue Johnson pursuer withdrawer cycle ICEEFT attachment" | drsuejohnson.com + iceeft.com 공식 + 임상 사이트 10건 수집. EFT 1980년대 발전사·Johnson + Greenberg 공동 개발·ICEEFT 1998 설립 확인 |
| 조사 3 | WebSearch | "Nonviolent Communication Marshall Rosenberg 4 components observation feeling need request CNVC" | cnvc.org + PuddleDancer Press(nonviolentcommunication.com) + BayNVC 등 10건. NVC 4단계 모델 + Rosenberg 1960~70년대 개발·CNVC 1984 설립 확인 |
| 조사 4 | WebFetch | https://www.gottman.com/blog/the-four-horsemen-recognizing-criticism-contempt-defensiveness-and-stonewalling/ | 각 horseman의 공식 정의 직접 인용 확보. antidote는 별도 페이지 안내 |
| 조사 5 | WebFetch | https://drsuejohnson.com/iceeft/ | EFT 공식 소개 확보. attachment 명시 부족 → 별도 검증 필요 |
| 조사 6 | WebFetch | https://nonviolentcommunication.com/learn-nonviolent-communication/4-part-nvc/ | 4단계 존재만 확인. 세부 정의는 추가 소스 필요 |
| 교차 검증 1 | WebSearch | "Gottman Levenson 1992 OR 2000 longitudinal divorce prediction accuracy J. Family Psychology" | 1992 JPSP 논문 + 2000 JFP 14(1) 논문 + 2000 JMF 14년 추적 논문 3종 모두 학술 DB로 확인. *분류 정확도* 87.4%·81% 수치 직접 인용 |
| 교차 검증 2 | WebSearch | "Hold Me Tight Sue Johnson seven conversations book 2008 EFT couples" | Hachette/Penguin/Goodreads/저자 사이트로 부제 *Seven Conversations for a Lifetime of Love* + 2008 출판 + EFT 70~75% recovery / 90% improvement 인용 확보 |
| 교차 검증 3 | WebSearch | "Gottman four horsemen antidotes gentle start-up build culture of appreciation take responsibility physiological self-soothing" | gottman.com 공식 antidote 페이지로 4 antidote 명칭 + 5:1 magic ratio + 30분 타임아웃 인용 확보 |
| 교차 검증 4 | WebSearch | "Seven Principles for Making Marriage Work Gottman 1999 publication year original edition" | Amazon/Wikipedia/저자 사이트로 1999 초판 확인. Love Lab 14년 650쌍 추적 정보 확인 |
| 교차 검증 5 | WebFetch | https://www.gottman.com/blog/the-four-horsemen-the-antidotes/ | 4 antidote 공식 직접 인용 + 5:1 ratio + 30분 self-soothing 인용 확보 |
| 교차 검증 6 | WebFetch | https://baynvc.org/basics-of-nonviolent-communication/ | NVC 4단계 정의 + 관찰/평가·느낌/판단·욕구/전략·요청/요구 구분 직접 인용 확보 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Gottman Institute — Four Horsemen | https://www.gottman.com/blog/the-four-horsemen-recognizing-criticism-contempt-defensiveness-and-stonewalling/ | ⭐⭐⭐ High | 2026-05-15 | 학파 공식 (Gottmans 본인 기관) |
| Gottman Institute — Antidotes | https://www.gottman.com/blog/the-four-horsemen-the-antidotes/ | ⭐⭐⭐ High | 2026-05-15 | 학파 공식 antidote 페이지 |
| Gottman & Levenson (2000) JFP 14(1) PDF | https://www.johngottman.net/wp-content/uploads/2011/05/Predicting-Marital-Stability-and-Divorce-in-Newlywed-Couples.pdf | ⭐⭐⭐ High | 2026-05-15 | 학술 1차 문헌(저자 본인 사이트 호스팅) |
| Gottman & Levenson (1992) JPSP PDF (Berkeley host) | https://bpl.studentorg.berkeley.edu/docs/41-Marital%20Processes92.pdf | ⭐⭐⭐ High | 2026-05-15 | 학술 1차 문헌 |
| Gottman & Levenson (2000) JMF 14-year | https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1741-3737.2000.00737.x | ⭐⭐⭐ High | 2026-05-15 | Wiley 학술 DB |
| Dr. Sue Johnson — What is EFT | https://drsuejohnson.com/iceeft/ | ⭐⭐⭐ High | 2026-05-15 | 학파 창시자 본인 사이트 |
| ICEEFT — About Dr. Sue Johnson | https://iceeft.com/about-dr-sue-johnson/ | ⭐⭐⭐ High | 2026-05-15 | EFT 공식 국제기구 |
| Hold Me Tight — Hachette 출판사 | https://www.hachettebookgroup.com/titles/dr-sue-johnson/hold-me-tight/9780316113007/ | ⭐⭐⭐ High | 2026-05-15 | 정식 출판사 페이지 (부제·년도·ISBN) |
| Center for Nonviolent Communication | https://www.cnvc.org/about/purpose-of-nvc | ⭐⭐⭐ High | 2026-05-15 | Rosenberg 설립 학파 공식 기관 |
| PuddleDancer Press — 4-Part NVC | https://nonviolentcommunication.com/learn-nonviolent-communication/4-part-nvc/ | ⭐⭐⭐ High | 2026-05-15 | NVC 공식 출판사 |
| BayNVC — Basics of NVC | https://baynvc.org/basics-of-nonviolent-communication/ | ⭐⭐ Medium-High | 2026-05-15 | NVC 공인 트레이너 협회 |
| Wikipedia — Nonviolent Communication | https://en.wikipedia.org/wiki/Nonviolent_Communication | ⭐⭐ Medium | 2026-05-15 | 1차 문헌 인용 확인용 보조 |
| Wikipedia — Seven Principles | https://en.wikipedia.org/wiki/The_Seven_Principles_for_Making_Marriage_Work | ⭐⭐ Medium | 2026-05-15 | 1999 초판 확인용 보조 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (Gottman 4 horsemen 정의·antidote 4종, EFT 1980년대 + Johnson/Greenberg 공동개발 + ICEEFT 1998, NVC 4단계 모두 공식 소스로 확인)
- [✅] 버전·년도 정보 명시 (Seven Principles 1999 / Hold Me Tight 2008 / NVC 3rd ed. 2015)
- [✅] deprecated 내용 없음 (학파 모델은 현재도 유효한 표준)
- [✅] 학술 인용이 정확한 저널·연도·쪽수 명시
- [✅] *후향적 분류 정확도*와 *예측*의 차이 명시 (대중 인용 함정 회피)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (`> 소스:`·`> 검증일: 2026-05-15`)
- [✅] 핵심 개념 설명 포함 (3개 학파 각각)
- [✅] 적용 예시 포함 (꿈 해몽 앱 4가지 활용 예)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (학술적 한계 박스 + 출력 가드레일)
- [✅] 흔한 함정 패턴 포함 (anti-pattern 7종)
- [✅] 짝 스킬 명시 (`humanities/attachment-theory-basics` · `meta/dream-interpretation-prompt-engineering`)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 *진단 금지 가드레일*과 *교육적 모델 제공* 모두 산출 가능한 수준
- [✅] 지나치게 이론적이지 않고 *실제 예시 대화* 포함 (NVC 4단계 통합 예시 + 비교 anti-version)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 일반 학술 정리)
- [✅] *학파별 식별*로 모델 출처 명시 (혼동 방지)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (대체 수행: skill-tester가 SKILL.md Read 후 직접 대조)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Contempt(경멸)가 이혼의 단일 최강 예측 변수인 이유와 antidote는?**
- PASS
- 근거: SKILL.md "1.2 4 Horsemen — 정의·예시·해독제" 표 (Contempt 행)
- 상세: 정의("우월·혐오 표현"), "이혼의 단일 최강 예측 변수" 문구, antidote "Build a culture of appreciation — 5:1 magic ratio" 모두 근거 존재. 섹션 1.1의 "후향적 분류 정확도" 구분 주의사항도 명시됨. anti-pattern "수치를 단일 사실로 인용" 금지(섹션 5)까지 커버.

**Q2. 자꾸 따져 묻고 상대는 입을 닫는다 — 상대가 나쁜 사람인가?**
- PASS
- 근거: SKILL.md "2.3 Pursuer / Withdrawer Cycle" 표 + 단락 + "4.2 EFT cycle — 추적자/회피자 동학"
- 상세: pursuer 표면 행동(따져 묻기·비난), withdrawer 표면 행동(침묵·자리 피하기), 각 역할의 1차 정서(두려움/무력감), "상대가 적이 아니라 cycle 자체가 적임을 인식"이 EFT 1단계 핵심 — 모두 근거 존재. anti-pattern "상대를 진단하는 도구로 사용" 금지(섹션 5) 회피 확인.

**Q3. NVC에서 '느낌'과 '생각'의 차이, '요청'과 '요구'의 차이는?**
- PASS
- 근거: SKILL.md "3.2 4단계 모델" 표 + "3.4 자기 공감·공감 사이클" + 섹션 6(출력 가드레일) 5번
- 상세: 느낌 vs 판단·생각 구분("외로워" = 느낌 / "네가 날 사랑하지 않는 것 같아" = 해석), 요청 vs 요구 구분("거절 가능성 인정 = 요청, 거절 시 처벌·죄책감 유발 = 요구") 모두 근거 존재. anti-pattern "NVC를 기법화해 진정성 상실" 경고(섹션 5), "NVC 4단계는 사용자 본인 문장 작성용으로만"(섹션 6.5) 근거 존재.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md의 해당 섹션에서 직접 근거 확인.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 경계선 카테고리 — content test PASS 시 APPROVED 가능 (사용자 지침 명시)
- 최종 상태: APPROVED

---

> 아래는 skill-creator가 작성한 예정 템플릿 (참고용 보존)

### 테스트 케이스 1 (예정 — 참고용)

**입력 (예정 질문):**
```
"파트너랑 자주 싸우는데 내가 어떤 패턴인지 모르겠어요. Gottman 4 horsemen으로 점검하려면 어떻게 해야 하나요?"
```

**기대 결과:**
- 4 horsemen(criticism·contempt·defensiveness·stonewalling) 각각의 정의 + 자신의 표현이 어디에 가까웠는지 *스스로 점검*하라는 안내
- 상대를 진단하는 도구로 사용 금지 명시
- 만성·고통스럽다면 부부 상담 전문가 상의 권유

---

### 테스트 케이스 2 (예정 — 참고용)

**입력 (예정 질문):**
```
"제가 자꾸 따져 묻고 상대는 입을 닫아요. 이게 어떤 패턴인가요?"
```

**기대 결과:**
- EFT pursuer/withdrawer cycle 설명
- "상대가 적이 아니라 *cycle 자체가 적*"이라는 1차 정서 관점
- 표면 행동 아래 1차 정서(두려움·외로움·압도감) 안내
- 진단·치료 권고 금지

---

### 테스트 케이스 3 (예정 — 참고용)

**입력 (예정 질문):**
```
"파트너에게 '왜 매번 늦게 들어와'라고 따지지 않고 부드럽게 말하려면 어떻게 해야 할까요?"
```

**기대 결과:**
- NVC 4단계(관찰 → 느낌 → 욕구 → 요청) 구조 제시
- 관찰 vs 평가 / 느낌 vs 판단 / 욕구 vs 전략 / 요청 vs 요구 구분
- 사용자 본인 문장 작성용으로 모델 제공 (완성 대본 일방 제공 금지)
- 기법화로 진정성 상실 위험 경고

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ 공식 소스 + 학술 1차 문헌 교차 확인 |
| 구조 완전성 | ✅ frontmatter·소스·검증일·예시·anti-pattern·짝 스킬 모두 포함 |
| 실용성 | ✅ 진단 금지 가드레일 + 교육적 모델 제공 양립 |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-15 skill-tester 수행) |
| **최종 판정** | **APPROVED** |

> 사용자 지침에 따라 "경계선" 카테고리 — content test PASS 시 APPROVED 전환 가능으로 분류. 3/3 PASS 확인 후 APPROVED 전환.

---

## 7. 개선 필요 사항

- [❌] 한국·동아시아 관계 맥락(체면·간접 표현·가족 단위 결정)에 대한 보완 스킬 추가 검토 (현재 *문화 차이 주의*만 anti-pattern으로 명시) — 선택 보강 사항, 차단 요인 아님
- [❌] EFT 임상 9-step·3-stage 모델 세부는 `humanities/attachment-theory-basics`와 연계해 별도 깊이 보강 검토 — 선택 보강 사항, 차단 요인 아님
- [✅] 메인 세션에서 skill-tester 호출 후 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (Gottman 4 horsemen + EFT cycle + NVC 4단계 + 꿈 해몽 앱 적용 + 학술적 한계 가드레일) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 Contempt 정의·antidote / Q2 pursuer-withdrawer cycle / Q3 NVC 느낌vs판단·요청vs요구) → 3/3 PASS, APPROVED 전환 | skill-tester |
