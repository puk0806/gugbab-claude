---
name: dream-app-ab-testing-prompts
description: >
  꿈 해몽 앱 시스템 프롬프트 A/B 테스트 설계 패턴 — 어떤 프롬프트가
  사용자 만족도·안전·정확도가 높은가를 무작위 배정·통계 검정·점진적
  롤아웃으로 결정. 안전 가드 A/B·민감정보 수집은 금지.
  <example>사용자: "꿈 해몽 앱에서 톤 warm vs academic 어떻게 A/B 테스트해?"</example>
  <example>사용자: "프롬프트 A/B 테스트 표본 크기 얼마나 필요해?"</example>
  <example>사용자: "Bayesian vs t-test 어떤 검정 써야 해?"</example>
---

# 꿈 해몽 앱 시스템 프롬프트 A/B 테스트 설계

> 소스:
> - Anthropic Evaluation tool — https://docs.anthropic.com/en/docs/test-and-evaluate/eval-tool
> - Anthropic A statistical approach to model evaluations — https://www.anthropic.com/research/statistical-approach-to-model-evals
> - Kohavi/Tang/Xu, *Trustworthy Online Controlled Experiments*, Cambridge UP, 2020 — https://books.google.com/books?id=TFjPDwAAQBAJ
> - Braintrust, "A/B testing for LLM prompts: A practical guide" — https://www.braintrust.dev/articles/ab-testing-llm-prompts
> - GrowthBook Feature Flag Experiments — https://docs.growthbook.io/feature-flag-experiments
> - Statsig, "Beyond prompts: A data-driven approach to LLM optimization" — https://www.statsig.com/blog/llm-optimization-online-experimentation
> - Bird et al., "The Ethics of Online Controlled Experiments (A/B Testing)", *Minds and Machines*, 2023 — https://link.springer.com/article/10.1007/s11023-023-09644-y
> - Google SRE Workbook, Canarying Releases — https://sre.google/workbook/canarying-releases/
>
> 검증일: 2026-05-15
> 대상 모델: Claude Opus 4.7 / Sonnet 4.6 / Haiku 4.5 기준
> 짝 스킬: `meta/dream-interpretation-prompt-engineering`, `meta/dream-safety-classifier-prompts`
> 짝 에이전트: `validation/dream-interpretation-prompt-tester` (사전 평가), `research/data-analyst` (운영 분석)

꿈 해몽 앱처럼 *사용자가 매번 자유 텍스트로 질문하고 LLM이 자유 텍스트로 답하는*
서비스는 "어떤 시스템 프롬프트가 더 좋은가"가 단일 단답이 아니다. 만족도·참여도·
안전·비용을 동시에 측정하고 통계적으로 판정해야 한다. 이 스킬은 그 절차다.

> 주의: 이 스킬은 *운영 단계의 온라인 A/B 테스트* 설계에 초점이 맞춰져 있다. 배포 전
> 사전 평가는 짝 에이전트 `dream-interpretation-prompt-tester`로 먼저 수행한다.

---

## 1. 언제 사용하나

| 상황 | A/B 테스트 적합 여부 |
|------|:---:|
| 톤·길이·학파 비율 등 *주관적 품질*이 영향받는 변경 | ✅ |
| 자기 성찰 질문 수·JSON 스키마 변형 등 *참여도 영향* 변경 | ✅ |
| 비용 절감용 모델 다운그레이드(Opus → Sonnet) | ✅ (품질 가드레일 필수) |
| 안전 가드 자체의 작동 여부 | ❌ — 양쪽 다 작동시켜야 함 (§ 6) |
| 자살·자해 등 위기 분기 로직 | ❌ — A/B 테스트 대상 아님 |
| 법적 고지 문구 | ❌ — 일관성 필요 |

---

## 2. A/B 테스트 설계

### 2-1. 가설 형식

Braintrust 권장 형식:

```
If we change [variable], we expect [outcome] because [reasoning].

예) 시스템 프롬프트의 학파 비율을 50:50 → 70:30 (전통:심리)로 바꾸면
    "도움됨" 클릭률이 +3%p 증가할 것이다. 사용자 설문(N=120)에서 한국
    전통 해몽을 더 원한다는 의견이 우세했기 때문이다.
```

가설은 한 번에 한 변수만 검증한다 (단일 변수 원칙). 다변수 동시 변경은
*요인 분리가 불가능*하므로 운영 의사결정에 쓸 수 없다.

### 2-2. 비교 변수 후보

| 차원 | A (Control) | B (Treatment) |
|------|-------------|---------------|
| 톤 | warm / 친구처럼 말함 | academic / 학술 어조 |
| 길이 | quick (3~4문장 요약) | deep (5~7문단 심층) |
| 학파 비율 | 전통:심리 = 50:50 | 70:30 |
| 자기 성찰 질문 수 | 0개 (답변만 제공) | 2개 (대화 유도) |
| JSON 스키마 | flat (key 5개) | nested (sections 배열) |
| 모델 | Sonnet 4.6 | Haiku 4.5 (비용 50%) |

### 2-3. 무작위 배정

GrowthBook 권장 방식: **결정론적 해싱**(deterministic hashing).

```
variant = hash(user_id + experiment_id) mod 100 < 50 ? "A" : "B"
```

같은 사용자는 같은 변형을 일관되게 받는다. 세션마다 바뀌면 사용자
경험이 일관되지 않고 데이터도 오염된다.

> 주의: 익명 사용자는 anonymous_id(쿠키/디바이스 ID) 기반으로 해싱한다.
> 절대 IP 주소·실명·이메일을 해시 입력에 쓰지 않는다 (§ 7).

### 2-4. 표본 크기 계산

Kohavi 등(2020)의 80% power 공식:

```
n = 16 · σ² / d²

  n: 변형당 필요 표본 수
  σ²: 메트릭 분산
  d:  MDE (minimum detectable effect, 검출하고 싶은 최소 효과 크기)
```

예) "도움됨" 클릭률이 현재 30% (분산 ≈ 0.21), 3%p 차이(MDE=0.03) 검출 시:

```
n = 16 · 0.21 / 0.03² ≈ 3,733 (변형당)
→ A·B 합쳐 약 7,500명 필요
```

> 주의: 실측 분산을 알기 전이라면 *Bernoulli 분산 최대값* σ² = p(1−p) 추정값을
> 사용한다. 비율 메트릭이면 보통 p ≈ 0.3~0.5 가정으로 분산 추정 가능.

### 2-5. 검정 기간

- *주중·주말 사용 패턴 모두 포함*하도록 최소 1주, 권장 2주.
- 너무 짧으면 novelty effect(새로움 효과)에 오염된다.
- 너무 길면 사용자 행동 변화·계절성에 오염된다.

---

## 3. 측정 지표 (Metric)

Braintrust·Statsig 권장처럼 **3개 카테고리**로 분류한다.

### 3-1. Primary Metric (1개만 선택)

가설 검증의 단일 의사결정 지표. 미리 정의하고 *변경 금지*.

- 예: "도움됨" 클릭률 (좋아요/전체 응답 수)

### 3-2. Secondary Metrics (보조 지표)

- 별점 평균 (1~5)
- 자기 성찰 질문 응답률
- 다시 묻기 (re-query) 비율
- 세션당 응답 횟수
- 7일 재방문율 (장기)

### 3-3. Guardrail Metrics (가드레일 — 악화 시 즉시 중단)

GrowthBook은 *guardrail metric을 별도 트랙*으로 모니터링하기를 권장한다.

| 가드레일 | 임계값 예 |
|----------|----------|
| 안전 가드 false negative 비율 | 0.5% 초과 시 즉시 롤백 |
| 응답 지연 (p95) | +500ms 초과 시 중단 |
| 토큰 비용/응답 | +30% 초과 시 중단 |
| 에러율 | +0.1%p 초과 시 중단 |

> 주의: 안전 가드 false negative는 *Treatment·Control 모두에서* 측정한다.
> 어느 한쪽이 더 위험하면 즉시 중단하고 가설 자체를 재설계한다.

### 3-4. 측정 지표 안티패턴

- ❌ **OEC를 사후에 바꾸기** — 사전에 단일 primary metric을 못 박지 않으면 cherry-picking
- ❌ **너무 많은 메트릭 동시 검정** — multiple comparison으로 false positive 증가
- ❌ **자기 보고 만족도만 의존** — 행동 지표(재방문·재질문)와 교차 확인 필수

---

## 4. 통계 검정

### 4-1. Frequentist (t-test, 비율 검정)

- 가설: H₀ (no difference) vs H₁ (B ≠ A)
- 유의수준: α = 0.05
- 검정통계량 → p-value < 0.05 면 H₀ 기각
- **장점**: 업계 표준, 해석 쉬움
- **단점**: 표본이 정해진 시점에 *한 번만* 확인 가능. 중간에 들여다보면 (peeking) α 인플레이션

### 4-2. Bayesian A/B

- Posterior P(B > A | data) 계산
- 임계값 예: P(B > A) > 0.95 → B 채택
- **장점**: 중간 peeking 허용 (sequential update), "B가 더 좋을 확률 X%"로 직관적
- **단점**: prior 선택 정당화 필요, 전통 통계 교육 받은 팀이 익숙치 않을 수 있음

GrowthBook 기본 엔진은 Bayesian, Statsig는 Bayesian + sequential testing 둘 다 지원.
어느 쪽을 선택하든 *실험 시작 전에* 검정 방법을 못 박는다.

### 4-3. 검정 안티패턴

- ❌ **Peeking** (frequentist에서 중간 확인 후 유의하면 종료) — α 인플레이션
- ❌ **p < 0.05 ≠ 큰 효과** — 통계적 유의성과 실용적 유의성 분리해서 본다
- ❌ **단일 실험으로 인과 확정** — 동일 변경을 여러 사용자 세그먼트·기간에서 replication

---

## 5. 점진적 롤아웃 (Canary)

Google SRE Workbook 권장: 단계별 트래픽 분배 후 자동 분석.

```
Phase 1: 10% Treatment / 90% Control — 1~2일 (안전·에러 모니터링)
  ↓ 가드레일 모두 PASS
Phase 2: 50% Treatment / 50% Control — 1~2주 (통계적 검정 가능 표본 수집)
  ↓ Primary metric 유의하고 가드레일 PASS
Phase 3: 100% Treatment — 신규 baseline으로 승격
```

각 단계 사이에 *자동 가드레일 체크*를 둔다. Argo Rollouts·Flagger 같은
도구는 가드레일 위반 시 자동 롤백을 지원한다.

> 주의: 꿈 해몽 앱처럼 *사용자 입력이 민감*한 도메인에서는 Phase 1을 5%로 더 보수적으로 시작해도 좋다.

---

## 6. 윤리

### 6-1. 안전 가드 A/B는 금지

자살·자해·위기 분기 로직은 *Control·Treatment 양쪽 모두 동일하게 작동*해야 한다.
"안전 가드 없는 변형이 만족도가 더 높은지 보자"는 발상은 인간 대상 실험 윤리 위반.

### 6-2. 사용자 고지

Bird et al.(2023)은 위험 수준에 따라 동의 수준을 달리할 것을 권한다.

| 변경 유형 | 위험 수준 | 동의 방식 |
|-----------|----------|----------|
| 톤·길이 변경 | 낮음 (양쪽 모두 균등 품질) | 통상적 약관 + "서비스 개선 실험" 일반 고지 |
| 비용용 모델 다운그레이드 | 중간 (품질 저하 가능) | 옵트인 권장 또는 베타 채널 분리 |
| 안전 가드 변경 | 높음 | A/B 테스트 자체 금지 |

**핵심 원칙**: 양쪽 변형이 *균등 품질*(equipoise)을 보장해야 통상적 고지로 충분.
한쪽이 명백히 열위라면 옵트인 또는 베타 채널로 격리.

### 6-3. 옵트아웃 경로

서비스 약관에 *실험 참여 거부 옵션*을 명시한다. 옵트아웃한 사용자는 stable 변형
(Control)으로 고정 라우팅한다.

---

## 7. 데이터 수집 — 꿈 내용은 수집 금지

꿈 해몽 앱은 사용자가 *극히 개인적인 정보*(가족·연애·죽음·트라우마)를 입력한다.
A/B 분석을 위해 *반드시 수집 금지*하는 것:

| 수집 금지 | 이유 |
|----------|------|
| 꿈 원문 텍스트 | 개인정보·민감정보 |
| 사용자 식별 가능 메타데이터 (실명·이메일·전화) | 재식별 위험 |
| IP 주소 (원본) | 위치 추정 가능 — 해시 후 저장 또는 폐기 |
| Claude 응답 원문 (사용자 입력 echo 포함 가능) | 꿈 내용 재구성 위험 |

**수집해도 되는 것**:

- 변형 ID (A / B)
- 익명 사용자 해시 (재현 가능한 식별자)
- 이벤트 타임스탬프
- 클릭 이벤트 (좋아요·도움됨·다시 묻기)
- 응답 토큰 수·지연 시간
- 안전 가드 트리거 여부 (true/false만, 트리거 원인 텍스트는 저장 금지)

> 주의: GDPR·개인정보보호법 적용 대상이면 *DPIA*(Data Protection Impact
> Assessment) 사전 수행이 필수. 한국에서 영업한다면 개인정보보호위원회 가이드
> 확인.

---

## 8. 실험 인프라 선택

| 도구 | 강점 | 약점 | 추천 시점 |
|------|------|------|----------|
| **GrowthBook** | 오픈소스·셀프호스팅·예측 가능한 시트당 과금 | warehouse 모드는 실시간 평가 약함 | 데이터 웨어하우스 있고 비용 통제 우선 |
| **Statsig** | 분 단위 평가·CUPED 분산 감소·sequential testing | 트래픽 증가 시 비용 스파이크 | 대규모 트래픽, 엔터프라이즈 |
| **Optimizely** | 마케팅 UI 강점·시각 편집기 | LLM 특화 메트릭 약함 | 전통적 웹 A/B 위주 |
| **Langfuse + 자체 분배** | LLM 트레이싱 통합 | 통계 검정은 별도 구현 필요 | LLM 트레이싱이 더 중요한 단계 |
| **자체 구현** | 완전 통제 | 통계 엔진·UI 직접 개발 | 매우 큰 팀, 특수 요구사항 |

**꿈 해몽 앱 추천**: 초기 GrowthBook(셀프호스팅) → 트래픽 증가 시 Statsig 검토.

---

## 9. 결과 적용 절차

1. **Pre-registration**: 가설·primary metric·MDE·표본 크기·검정 방법을 실험 시작 *전*에 문서화 (실험 ticket으로).
2. **데이터 수집**: 사전 계산된 표본 도달까지 peeking 금지 (Bayesian이면 sequential update 허용).
3. **분석**: primary metric + guardrail 동시 확인. 둘 다 PASS여야 채택.
4. **의사결정**:
   - B > A (유의) + 가드레일 PASS → Phase 2 → Phase 3 진행
   - B = A (no significant difference) → A 유지 (단순함 우선)
   - B < A → A 유지, 가설 재검토
5. **사후 검토**: 결과·로그·의사결정 근거를 운영 위키에 영구 보관 (다음 실험의 prior).

---

## 10. 흔한 함정 (Anti-patterns)

| 함정 | 왜 위험한가 | 대응 |
|------|-------------|------|
| **안전 가드를 A/B 대상으로 둠** | 윤리 위반, 사용자 안전 직접 위협 | 가드는 양쪽 모두 동일 작동 |
| **민감정보 수집** (꿈 원문) | 개인정보보호법 위반, 신뢰 상실 | 메타데이터만 수집 |
| **표본 부족** (n < 계산값) | 검출력 부족, false negative 가능 | 사전 표본 크기 계산 필수 |
| **Peeking** (frequentist 중간 확인) | α 인플레이션 → false positive | Bayesian 쓰거나 endpoint 못 박기 |
| **다변수 동시 변경** | 요인 분리 불가 | 한 번에 한 변수만 |
| **상관 ≠ 인과** | 가장된 동시 변경·트래픽 패턴 변화로 오인 | 무작위 배정 + replication |
| **Self-reported만 사용** | 사회적 바람직성 편향 | 행동 지표(재방문) 교차 검증 |
| **OEC 사후 변경** | Cherry-picking | Pre-registration 강제 |
| **너무 짧은 검정 기간** | Novelty effect 오염 | 최소 1주, 권장 2주 |
| **자살 위기 분기 A/B** | 절대 금지 — 도덕적·법적 책임 | 짝 스킬 `dream-safety-classifier-prompts` 참조 |

---

## 11. 짝 스킬·짝 에이전트 연동

```
[배포 전]
  validation/dream-interpretation-prompt-tester
    ↓ (사전 평가 PASS)
[배포 단계]
  meta/dream-app-ab-testing-prompts (이 스킬) — Phase 1/2/3 점진 롤아웃
    ↓ (수집된 데이터)
[운영 분석]
  research/data-analyst — 통계 검정·세그먼트 분석·이상치 탐지
    ↓
[프롬프트 갱신]
  meta/dream-interpretation-prompt-engineering — 채택된 변형을 신규 baseline으로
```

---

## 12. 체크리스트

배포 전 마지막 점검:

- [ ] 단일 primary metric을 사전 정의했는가
- [ ] MDE 기반 표본 크기를 계산했는가
- [ ] Guardrail metrics와 자동 롤백 임계값을 설정했는가
- [ ] 안전 가드가 양쪽 모두 동일하게 작동하는가
- [ ] 민감정보(꿈 원문·실명) 수집을 차단했는가
- [ ] 결정론적 해싱으로 사용자 일관 배정하는가
- [ ] 사용자 옵트아웃 경로가 있는가
- [ ] 검정 방법(Frequentist/Bayesian)을 시작 전에 못 박았는가
- [ ] Phase 1(10%)부터 점진 롤아웃 계획이 있는가
- [ ] 짝 에이전트 `dream-interpretation-prompt-tester`로 사전 평가했는가
