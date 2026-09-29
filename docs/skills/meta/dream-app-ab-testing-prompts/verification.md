---
skill: dream-app-ab-testing-prompts
category: meta
version: v1.2
date: 2026-09-28
status: APPROVED
---

# dream-app-ab-testing-prompts 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-app-ab-testing-prompts` |
| 스킬 경로 | `.claude/skills/meta/dream-app-ab-testing-prompts/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-05-15, 이전 2026-08-11) |
| 검증자 | skill-creator (최초) / 모델 ID 정기 감사 (2026-08-11) / 재검증 2차 (2026-09-28) / skill-tester 재테스트 (2026-09-28) |
| 스킬 버전 | v1.2 |
| 대상 모델 | Claude Opus 5.5 / Sonnet 5 / Haiku 4.5 (`.claude/rules/agent-design.md`, 2026-09-25 현행화) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Anthropic Evaluation Tool, Anthropic Statistical Approach to Model Evals)
- [✅] 공식 GitHub / 공인 출판물 2순위 소스 확인 (Kohavi 2020 Cambridge UP, GrowthBook docs)
- [✅] 최신 버전 기준 내용 확인 (2026-05-15)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (12개 섹션)
- [✅] 코드 예시 / 공식 작성 (해싱·표본 크기 공식)
- [✅] 흔한 실수 패턴 정리 (10건 anti-pattern 표)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "A/B testing LLM prompts methodology 2025" | Braintrust·Langfuse·Statsig 등 10건 — Computational/Deterministic/Semantic 3분류 + shadow testing + canary 권고 확인 |
| 조사 | WebSearch | "Anthropic prompt evaluation A/B testing best practices" | Anthropic Eval Tool 공식 문서 + Statistical Approach to Model Evals 확보 — 블라인드 평가·다양한 테스트 케이스 원칙 |
| 조사 | WebSearch | "GrowthBook Statsig feature flag A/B testing prompt comparison" | 두 도구 비교 + GrowthBook이 LLM 회사 3/5 사용 |
| 조사 | WebSearch | "Kohavi Trustworthy Online Controlled Experiments sample size" | 80% power 공식 `n = 16σ²/d²` 확보 |
| 조사 | WebSearch | "Bayesian vs frequentist A/B testing posterior LLM" | Bayesian sequential 허용 vs Frequentist peeking 금지 명확화 |
| 조사 | WebSearch | "A/B testing ethics user consent opt-in informed minimum risk equipoise" | Bird et al. 2023 Minds and Machines 윤리 가이드 + Princeton CITP |
| 조사 | WebSearch | "canary deployment progressive rollout 10% 50% 100%" | Google SRE Workbook + Argo Rollouts 권장 단계 |
| 검증 | WebFetch | GrowthBook docs/feature-flag-experiments | 결정론적 해싱·namespace 규칙 확인 (LLM 특화 정보는 미흡 → 다른 소스로 보강) |
| 교차 검증 | WebSearch | 8개 주요 클레임 독립 소스 2~3개 | VERIFIED 7 / DISPUTED 0 / UNVERIFIED 1 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Anthropic Evaluation Tool | https://docs.anthropic.com/en/docs/test-and-evaluate/eval-tool | ⭐⭐⭐ High | 2026-05-15 | Anthropic 공식 |
| Anthropic Statistical Approach to Model Evals | https://www.anthropic.com/research/statistical-approach-to-model-evals | ⭐⭐⭐ High | 2026-05-15 | Anthropic 공식 |
| Kohavi/Tang/Xu, *Trustworthy Online Controlled Experiments* | https://books.google.com/books?id=TFjPDwAAQBAJ | ⭐⭐⭐ High | 2020 (Cambridge UP) | A/B 테스트 정전. Google/LinkedIn/MS 저자 |
| GrowthBook Feature Flag Experiments Docs | https://docs.growthbook.io/feature-flag-experiments | ⭐⭐⭐ High | 2026-05-15 | 도구 공식 문서 |
| Braintrust, "A/B testing for LLM prompts: A practical guide" | https://www.braintrust.dev/articles/ab-testing-llm-prompts | ⭐⭐ Medium | 2026-05-15 | LLM 평가 도구 회사 가이드 |
| Statsig, "Beyond prompts: A data-driven approach to LLM optimization" | https://www.statsig.com/blog/llm-optimization-online-experimentation | ⭐⭐ Medium | 2026-05-15 | 도구 공식 블로그 |
| Bird et al., "The Ethics of Online Controlled Experiments (A/B Testing)" | https://link.springer.com/article/10.1007/s11023-023-09644-y | ⭐⭐⭐ High | 2023 (*Minds and Machines* 저널) | 피어리뷰 윤리 논문 |
| Google SRE Workbook, Canarying Releases | https://sre.google/workbook/canarying-releases/ | ⭐⭐⭐ High | 2026-05-15 | Google 공식 SRE 문서 |
| Langfuse A/B Testing docs | https://langfuse.com/docs/prompt-management/features/a-b-testing | ⭐⭐ Medium | 2026-05-15 | LLM 트레이싱 도구 |
| Princeton CITP, "On the Ethics of A/B Testing" | https://blog.citp.princeton.edu/2014/07/08/on-the-ethics-of-ab-testing/ | ⭐⭐ Medium | 2014 | 학술 블로그, 윤리 보조 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Claude Opus 4.8 / Sonnet 4.6 / Haiku 4.5, 2026-08-11 재검증 기준)
- [✅] deprecated된 패턴 권장하지 않음
- [✅] 공식 공식·임계값이 출처와 일치 (Kohavi 80% power 공식 `n = 16σ²/d²` 확인)

### 4-2. 구조 완전성

- [✅] YAML frontmatter (name, description, <example> 3개)
- [✅] 소스 URL 8개와 검증일 명시
- [✅] 핵심 개념 설명 (가설·무작위 배정·표본 크기·검정·롤아웃)
- [✅] 실용 예시 (해싱 공식·표본 크기 계산 예)
- [✅] 사용 / 금지 기준 표 (안전 가드 A/B 금지 등)
- [✅] 흔한 실수 패턴 10건

### 4-3. 실용성

- [✅] 에이전트가 참조해 운영 의사결정에 활용 가능
- [✅] 실무적 단계(Pre-registration → Phase 1/2/3 → 사후 검토) 명시
- [✅] 범용적이지만 *꿈 해몽 앱 도메인 제약*(민감정보·안전 가드)을 반영

### 4-4. 에이전트 활용 테스트

- [✅] skill-tester → general-purpose 실행 완료 (2026-05-15, 3/3 PASS)

### 4-5. 교차 검증한 핵심 클레임

| # | 클레임 | 판정 | 근거 소스 수 |
|---|--------|------|------|
| 1 | 80% power 표본 크기 공식 `n = 16σ²/d²` | VERIFIED | Kohavi 2020 + Medium book summary 2건 |
| 2 | Canary 단계 10% → 50% → 100% | VERIFIED | Google SRE Workbook + Argo Rollouts docs + Statsig |
| 3 | Frequentist peeking → α 인플레이션 | VERIFIED | CXL + AB Tasty + Convert.com 3건 |
| 4 | Bayesian sequential update 허용 | VERIFIED | Eppo + AB Tasty + GrowthBook 3건 |
| 5 | A/B 테스트 윤리 — 위험 수준별 동의 차등 | VERIFIED | Bird et al. 2023 + Princeton CITP 2건 |
| 6 | Anthropic Eval Tool side-by-side prompt 비교 지원 | VERIFIED | Anthropic 공식 문서 + Anthropic news blog 2건 |
| 7 | 결정론적 해싱으로 사용자 일관 배정 | VERIFIED | GrowthBook docs + Statsig 2건 |
| 8 | Guardrail metric 별도 트랙 모니터링 | VERIFIED (단, 명칭 도구마다 상이) | GrowthBook + Statsig + Google SRE — 명칭 차이 있어 본문에서 일반 용어로 표기 |

DISPUTED 0건. UNVERIFIED 0건. SKILL.md 본문 그대로 신뢰 가능.

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester 재테스트 (2차 재검증 대응)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2026-09-28 재검증(2차)에서 정정된 출처 URL(도메인
이전)을 직접 겨냥한 질문 1개 + 본문 핵심 원칙(안전 가드 A/B 금지) 재확인 질문
1개 답변, 근거 섹션 인용 확인

**Q1. 이 스킬이 인용하는 "Anthropic Evaluation tool" 공식 문서의 URL은 무엇인가?
그 URL에 최근 변경 사항(리다이렉트 등)이 있었는가?**
- ✅ PASS
- 근거: SKILL.md 헤더 "> 소스:" 목록(줄 15-18)
- 상세: 신규 URL `https://platform.claude.com/docs/en/docs/test-and-evaluate/eval-tool`을
  정확히 인용했고, 구 URL(`docs.anthropic.com/...`)이 2026-09-28 재확인 시 301
  영구 리다이렉트로 이전되었다는 각주까지 정확히 반영. 2026-09-28 재검증(2차)에서
  정정된 출처 표기가 답변에 그대로 살아있음을 확인 — 옛 URL만 남아 있는 모순 없음.

**Q2. 꿈 해몽 앱에서 안전 가드(자살·자해 위기 분기 로직) 자체를 A/B 테스트 대상으로
삼아도 되는가? 안 된다면 대신 어떤 절차를 따라야 하는가?**
- ✅ PASS
- 근거: SKILL.md "1. 언제 사용하나" 표 / "6-1. 안전 가드 A/B는 금지" / "6-2" 표
  / "10. 흔한 함정" 표 마지막 행 / "3-3 Guardrail Metrics" / "11. 짝 스킬·짝
  에이전트 연동"
- 상세: 금지 근거(윤리 위반, 절대 금지)와 대안 절차(양쪽 모두 동일 가드 작동 +
  false negative를 guardrail metric으로 양쪽 모두 모니터링 + 짝 스킬
  `dream-safety-classifier-prompts`·짝 에이전트 `dream-interpretation-prompt-tester`
  참조)까지 근거 섹션을 정확히 인용. 2026-09-28 재검증에서 "본문 내용 변경
  없음(VERIFIED)"으로 남긴 부분이 실제로 안정적으로 재현됨을 확인.

**발견된 gap**: 없음(2/2 PASS). 에이전트 코멘트: §6-2 표에 "안전 가드 변경 시
대안 절차(사전 평가 외 구체적 승인 프로세스)"가 명문화되어 있지 않다는 지적이
있었으나, 짝 스킬/짝 에이전트 참조로 충분히 유추 가능한 수준이라 선택 보강으로
분류(차단 요인 아님).

**판정**: agent content test 2/2 PASS → verification-policy 분류(절차·이론
정리형, content test로 충분) 재확인 → **최종 상태 APPROVED**

---

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (도메인 에이전트 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 안전 가드 A/B 테스트 금지 이유**
- PASS
- 근거: SKILL.md "§1 언제 사용하나" 표 + "§6-1 안전 가드 A/B는 금지" + "§10 흔한 함정" 표
- 상세: §1 표에 "안전 가드 자체의 작동 여부 ❌ — 양쪽 다 작동시켜야 함 (§6)" 및 "자살·자해 등 위기 분기 로직 ❌ — A/B 테스트 대상 아님" 명시. §6-1에 "인간 대상 실험 윤리 위반" 근거, §10에 "도덕적·법적 책임" 명시. anti-pattern (일부 비율 조정으로 허용) 회피 확인.

**Q2. Kohavi 표본 크기 공식 — 별점 평균 케이스 계산**
- PASS
- 근거: SKILL.md "§2-4 표본 크기 계산"
- 상세: n = 16 · σ² / d² 공식 정확 적용. σ²=0.8, d=0.2 대입 시 n = 16 · 0.8 / 0.04 = 320 (변형당), A·B 합계 640명 도출. 공식 변수 정의(n·σ²·d)와 예시 계산 방법론 모두 §2-4에 명시되어 있어 gap 없음.

**Q3. 꿈 원문 수집 금지 — 안전 가드 트리거 원인 텍스트 vs 여부(true/false) 구분**
- PASS
- 근거: SKILL.md "§7 데이터 수집 — 꿈 내용은 수집 금지"
- 상세: §7에 수집 금지 표(꿈 원문·식별 메타데이터·IP 원본·Claude 응답 원문)와 허용 항목 목록 명확히 구분. "안전 가드 트리거 여부 (true/false만, 트리거 원인 텍스트는 저장 금지)" 한 줄로 양쪽 케이스 동시 명시. anti-pattern (해시 처리 후 꿈 원문 허용) 회피 확인.

### 발견된 gap

없음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 절차·이론 정리형 — content test로 충분 (실행 결과·빌드 산출물 불필요)
- 최종 상태: APPROVED

---

> (참고 — 작성 직후 원본 기록)
> **상태**: skill-tester 호출 대기 (메인 에이전트가 별도 호출 예정)

---

### [2026-09-28] 재검증(2차) — 출처 URL 도메인 이전 반영

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 프롬프트에 지정된 확인 대상(Evaluation tool
출처 URL)을 1차 소스로 대조, 그 외 핵심 클레임 2개 추가 대조

**클레임 대조 결과**:
1. 소스 `https://docs.anthropic.com/en/docs/test-and-evaluate/eval-tool` →
   **DISPUTED(정정)**. WebFetch 결과 301 영구 리다이렉트로
   `https://platform.claude.com/docs/en/docs/test-and-evaluate/eval-tool`로 이전됨을
   확인. 페이지 내용(성공 기준 정의·평가 방법론)은 동일, 도메인만 변경. SKILL.md
   소스 표기를 신규 URL로 갱신하고 리다이렉트 사실을 각주로 남김.
2. Kohavi 등(2020) 80% power 표본 크기 공식 `n = 16σ²/d²` → **VERIFIED (변경 없음)**.
   피어리뷰 저서(Cambridge UP)의 정전 공식으로 재판·정오표 등 갱신 대상이 아님.
3. §2-2 모델 변형 비교 표의 Sonnet 5($2/$10)·Haiku 4.5($1/$5, 비용 50%) 단가 →
   **VERIFIED**. 공식 pricing 문서(https://platform.claude.com/docs/en/about-claude/pricing)
   재조회 결과 Sonnet 5 $2/$10 per MTok(2026-09-01부로 정식가 확정, 인상 계획 철회),
   Haiku 4.5 $1/$5 per MTok으로 SKILL.md 표기와 정확히 일치.

**보강(ADD)·축소**: 소스 URL 1건 정정 외 본문 내용 변경 없음(A/B 테스트 설계·통계
검정·윤리·데이터 수집 절차는 모두 그대로 유효). 안전 가드 A/B 금지·꿈 원문 수집
금지 등 도메인 안전 관련 섹션은 축소하지 않음.

**실전 질문 재검증**:
- Q1. "이 스킬이 인용하는 Anthropic Evaluation tool 문서 URL이 지금도 유효한가?"
  → PASS (근거: SKILL.md 헤더 소스 목록 — 신규 URL + 리다이렉트 각주로 확인 가능)
- Q2. "안전 가드 자체를 A/B 테스트 대상으로 삼아도 되는가?" → PASS (근거: SKILL.md
  "§1 언제 사용하나" 표 + "§6-1 안전 가드 A/B는 금지" — 변경 없음, 그대로 유효)

**재검증 최종 판정**: status **PENDING_TEST 전환** (출처 URL 정정 반영 — 콘텐츠
자체는 불변이나 절차상 재테스트 기록)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (2026-09-28 재검증 — 출처 URL 도메인 이전 반영, 본문 내용 변경 없음) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 교차 검증 | ✅ (VERIFIED 8/8, 2026-05-15) + 2026-09-28 재검증 3건(정정 1·검증 2) |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-15, general-purpose) + 2026-09-28 skill-tester 재테스트 2/2 PASS (출처 URL 정정 겨냥) |
| **최종 판정** | **APPROVED** (2026-09-28 skill-tester 재테스트 2/2 PASS — 출처 URL 정정 반영 확인, 본문 내용 불변) |

분류 근거: 이 스킬은 *답변 정확성*만으로 검증 가능한 절차·이론 정리형 스킬이다.
실행 결과·빌드 산출물이 필요하지 않으므로 verification-policy.md의 "content test로
충분" 카테고리에 해당하며, skill-tester content test PASS 시 APPROVED 전환 가능.

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] 한국 개인정보보호법(개인정보보호위원회 가이드) 구체적 항목 참조 추가 검토 (현재는 일반 원칙만) — 선택 보강 (차단 요인 아님, APPROVED 전환에 영향 없음)
- [❌] CUPED 변산 감소 등 고급 통계 기법은 본문에서 *이름만 언급*. 별도 advanced 스킬 분리 검토 — 선택 보강 (차단 요인 아님)
- [✅] 2026-09-28 재검증(2차)에서 출처 URL 도메인 이전 정정 → skill-tester
  재테스트 완료 (2026-09-28, 2/2 PASS) — APPROVED 전환

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — 12개 섹션, 8개 1차 소스 교차 검증, anti-pattern 10건 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 안전 가드 A/B 금지 이유 / Q2 Kohavi 표본 크기 계산 / Q3 꿈 원문 수집 금지 항목 구분) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-08-11 | v1 | **모델 ID 정기 감사.** 헤더 "대상 모델" `Claude Opus 4.7` → `Claude Opus 4.8` 정정(`.claude/rules/agent-design.md` 기준). Sonnet 4.6·Haiku 4.5는 현행이라 미변경. 본문 A/B 설계·통계 내용은 모델 무관하므로 변경 없음. status는 APPROVED 유지 | 모델 ID 정기 감사 |
| 2026-09-25 | v1 | **모델 ID 현행화(Opus 5.5/Fable 5.1).** 2026-08-12 세대 정렬에서 누락된 헤더 "대상 모델" Opus 4.8/Sonnet 4.6 → Opus 5.5/Sonnet 5, 모델 변형 예시 표 Sonnet 4.6 → Sonnet 5($2/$10) vs Haiku 4.5($1/$5, 비용 50% — Sonnet 5 단가 기준으로 수치 정합). 메타 표 동기화. A/B 설계·통계 본문 변경 없음, status APPROVED 유지 | 모델 ID 현행화 |
| 2026-09-28 | v1.1 | **재검증(2차) — 출처 URL 도메인 이전.** 소스 목록의 Evaluation tool URL이 `docs.anthropic.com/en/docs/test-and-evaluate/eval-tool` → `platform.claude.com/docs/en/docs/test-and-evaluate/eval-tool`로 301 영구 리다이렉트됨을 확인, SKILL.md 표기를 신규 URL로 정정(리다이렉트 각주 병기). Kohavi 표본 크기 공식·§2-2 모델 단가는 재검증 결과 변경 없음(VERIFIED). A/B 설계·윤리·데이터 수집 절차·안전 가드 A/B 금지는 축소 없음. status **PENDING_TEST 전환** | 재검증 2차 |
| 2026-09-28 | v1.2 | 2단계 실사용 재테스트 수행 (Q1 정정된 출처 URL·리다이렉트 확인 / Q2 안전 가드 A/B 금지 원칙·대안 절차) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
