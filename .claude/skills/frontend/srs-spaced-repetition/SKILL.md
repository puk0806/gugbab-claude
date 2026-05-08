---
name: srs-spaced-repetition
description: 간격 반복 학습(SRS) 알고리즘 정리 — SM-2(Anki 베이스, 1987 Wozniak)와 FSRS-5(2024 표준, DSR 모델 19 trainable parameters) 두 알고리즘 비교, 카드 상태 전이(New→Learning→Review→Relearning), 2버튼 모드를 4-rating(Again/Hard/Good/Easy)으로 매핑하는 방법, 단조 증가 보장·시계 변경 방어
---

# srs-spaced-repetition — 간격 반복 학습 알고리즘 (SM-2 / FSRS-5)

> 소스: SM-2 — Wozniak 1990 SuperMemo paper / Anki 공식 매뉴얼; FSRS — open-spaced-repetition GitHub
> 검증일: 2026-05-07

> 다루는 알고리즘: **SM-2** (Anki 4.x 이전 베이스, 가장 단순) / **FSRS-5** (Anki 23.10+ 기본, 2024 표준)
> 우선 권장: 신규 구현은 **FSRS-5** — 정확도가 SM-2 대비 통계적으로 우수
> 단순성 우선: 학습/프로토타입은 **SM-2** — 1990 논문 한 페이지로 정의 가능

## 언제 사용하나

- 어휘·개념 학습 앱에서 *언제 다시 보여줄지* 자동 결정 필요
- 학습자별 망각 곡선을 데이터로 추적해 학습 효율 극대화
- 사용자가 "알았음/모르겠음" 같은 단순 입력만 받고 *내부 알고리즘이 다음 due를 계산*

## 언제 사용하지 않나

- 학습 콘텐츠가 *읽기·이해 위주*(반복이 아니라 정독) — SRS는 fact recall에 최적화
- 카드가 *극도로 적음* (10개 이하) — SRS 알고리즘 효과는 카드 수에 비례
- 사용자가 *학습 일정 직접 설정*을 선호 (SRS는 자동 스케줄링이 본질)

---

## SM-2 알고리즘 (Anki classic·1987 Wozniak)

### 핵심 변수 3개 (카드별 저장)

| 변수 | 의미 | 초기값 |
|------|------|--------|
| `repetitions` (n) | 연속 성공 횟수 (Q ≥ 3) | 0 |
| `easiness` (EF) | 카드 쉬움 정도 (다음 interval 배수) | 2.5 |
| `interval` (I) | 다음 review까지의 일수 | 0 |

### 등급 (Q) — 0~5 (SM-2 원본)

| Q | 의미 |
|---|------|
| 5 | 완벽한 응답 |
| 4 | 정답 + 약간 망설임 |
| 3 | 정답 + 큰 어려움 |
| 2 | 오답 + 정답이 쉬워 보임 |
| 1 | 오답 + 정답이 익숙함 |
| 0 | 완전 잊음 |

Q ≥ 3 = pass, Q < 3 = fail.

### 공식 (Wozniak 1990)

```javascript
function sm2(card, q) {
  // q: 0~5 응답 등급
  let { repetitions, easiness, interval } = card

  if (q < 3) {
    // Fail: 처음부터 다시
    repetitions = 0
    interval = 1
  } else {
    // Pass
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easiness)
    }
    repetitions += 1
  }

  // Easiness factor 갱신 (모든 응답)
  easiness = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))

  // Anki 관행: EF 최소값 1.3
  if (easiness < 1.3) easiness = 1.3

  return { repetitions, easiness, interval }
}
```

### Anki 변형 (4-button)

원본 SM-2는 6단계(Q 0~5). Anki는 *4-button*(Again/Hard/Good/Easy)로 변형:

| Anki | SM-2 매핑 | Pass/Fail |
|------|-----------|-----------|
| Again | Q=0 또는 1 | Fail |
| Hard | Q=3 | Pass (interval × 1.2 또는 EF 감소) |
| Good | Q=4 | Pass (표준 SM-2) |
| Easy | Q=5 | Pass + bonus (interval × 1.3) |

Anki는 EF 최소값 1.3 + Hard에서 EF 감소 등 *튜닝*을 더했다.

### 강점·약점

- **강점**: 단순 (구현 50줄 이내). 디버깅·테스트 쉬움. 1987년부터 검증됨
- **약점**: 카드 difficulty가 *학습자별·콘텐츠별*로 달라지는 것을 반영 못함. 모든 카드에 동일 공식 적용

---

## FSRS-5 알고리즘 (2024 표준·open-spaced-repetition)

### DSR 모델 — 카드별 상태 변수 3개

| 변수 | 의미 | 단위 |
|------|------|------|
| **Difficulty (D)** | 카드 자체의 어려움 | 1~10 |
| **Stability (S)** | 기억 강도 — 90% 회상 가능한 일수 | days |
| **Retrievability (R)** | 현재 회상 확률 | 0~1 |

R(retrievability)은 매번 계산되며, 다음 식으로 결정된다:

```
R = exp(ln(0.9) * t / S)
```

여기서 `t`는 마지막 review로부터 경과 일수, `S`는 stability. R = 0.9가 되는 시점이 *due date*다.

### 등급 — 4단계 (FSRS-5 표준)

| 등급 | 값 | 의미 |
|------|----|----|
| Again | 1 | Fail (lapse) |
| Hard | 2 | Pass with hesitation |
| Good | 3 | Correct response |
| Easy | 4 | Perfect/easy response |

Again만 fail, 나머지 셋 모두 pass.

### 카드 상태 전이

```
[New] ─ first review ─→ [Learning] ─ pass through learning steps ─→ [Review]
                            │                                          │
                            └── again ──┐                              │
                                        ↓                              │
                                    [Learning]                         │
                                                                       │
[Review] ── again ──→ [Relearning] ── pass ──→ [Review]
[Review] ── hard/good/easy ──→ [Review] (interval 증가)
```

| 상태 | 동작 |
|------|------|
| **New** | 학습 안 됨. 첫 review 시 Learning으로 이동 |
| **Learning** | 짧은 학습 단계(1m·10m 등) 통과 중. 모두 통과하면 Review |
| **Review** | 정상 review 사이클. interval은 stability + R 0.9 기준으로 결정 |
| **Relearning** | Review에서 Again 받은 카드. 짧은 단계 다시 통과해야 Review로 복귀 |

### 공식 (FSRS-5 단순화)

FSRS-5의 정확한 공식은 *19개 trainable parameters* (`w[0]..w[18]`)에 의존하므로 본 스킬에서는 *구조*만 정리한다. 실 구현은 `ts-fsrs`·`py-fsrs` 등 공식 라이브러리 사용 권장.

```typescript
// 의사 코드 (실제 ts-fsrs 라이브러리 사용 권장)
import { FSRS, generatorParameters, Rating } from 'ts-fsrs'

const f = new FSRS(generatorParameters({
  // request_retention: 다음 review가 일어날 때 R의 목표값 (default 0.9)
  request_retention: 0.9,
  // maximum_interval: 너무 긴 interval 방지 (default 36500 days = 100년)
  maximum_interval: 36500,
  // 19 trainable weights (default values 제공, 사용자 데이터로 optimize 권장)
  w: [/* 19 floats */],
}))

// review 적용
const result = f.next(card, new Date(), Rating.Good)
//   result.card: 갱신된 D·S·due 값
//   result.log: 이력
```

### 강점·약점

- **강점**: 정확도 우수 (Anki 23.10+ default 채택, expertium 벤치마크에서 SM-2 대비 일관 우수). 카드별 difficulty 학습. forgetting curve 직접 모델링
- **약점**: 19개 parameter — *충분한 review 데이터*가 있어야 optimize 효과적. 신규 사용자는 default w 사용 (suboptimal). 구현 복잡도 높음 — 직접 구현보다 ts-fsrs 등 라이브러리 사용 권장

---

## SM-2 vs FSRS-5 비교

| 항목 | SM-2 | FSRS-5 |
|------|------|--------|
| 발표 | 1987 (Wozniak Turbo Pascal) | 2022~2024 (open-spaced-repetition) |
| 변수 | 3개 (n·EF·I) | 3개 (D·S·R) + 19 weights |
| 알고리즘 복잡도 | 50줄 이내 | 라이브러리 권장 |
| 정확도 | 검증된 baseline | SM-2 대비 일관 우수 (벤치마크) |
| 사용자 데이터 활용 | 거의 없음 | 19 weights를 데이터로 optimize 가능 |
| 구현 비용 | 낮음 (직접 구현 권장) | 중~높음 (라이브러리 사용 권장) |
| 카드 상태 모델 | 암묵적 (n=0/1/≥2) | 명시적 (New/Learning/Review/Relearning) |
| 실패 처리 | n=0, I=1로 reset | Relearning 단계 + S 감소 |
| 추천 사용처 | 학습/프로토타입/MVP | 프로덕션 학습 앱·정확도 우선 |

---

## 2버튼 모드 ↔ 4-rating 매핑

PRD에서 "알았음/모르겠음" 2버튼만 받는 경우, 다음과 같이 매핑한다.

### SM-2로 매핑 (단순)

```javascript
function map2to6(buttonClicked) {
  // SM-2는 0~5 등급
  return buttonClicked === 'know' ? 4 : 1
  // know=4 (정답+약간 망설임) — 보수적 default
  // unknown=1 (오답+정답이 익숙) — Q<3 fail
}
```

### FSRS-5로 매핑 (단순)

```javascript
function map2toFsrs(buttonClicked) {
  // FSRS는 1~4 등급
  return buttonClicked === 'know' ? Rating.Good : Rating.Again
  // know=Good(3)
  // unknown=Again(1) — fail
}
```

### 3버튼 확장 (권장)

2버튼 모드는 *카드별 미세 조정 정보*가 사라진다. 가능하면 3버튼 (Again·Good·Easy)로 확장:

| 사용자 버튼 | FSRS rating | 의도 |
|------------|-------------|------|
| 모르겠음 | Again (1) | 실패 — Relearning |
| 알았음 | Good (3) | 정상 정답 |
| 쉬웠음 | Easy (4) | 더 긴 interval 부여 |

---

## 단조 증가 보장 (다음 due가 직전보다 빨라지지 않게)

SM-2와 FSRS-5 모두 *기본 동작은 단조 증가*다. 그러나 다음 경우에 *역전*될 수 있다:

1. **EF 감소가 누적되어 Hard 응답 시 interval 감소**
   - SM-2 Anki 변형: Hard에서 EF -= 0.15. EF가 1.3에 도달하면 floor.
   - 대응: EF 최소값 1.3 강제 (Anki 표준)

2. **시계 변경(time travel)** — 사용자가 디바이스 시간을 *과거로* 변경 후 review
   - 결과: 마지막 review timestamp > 현재 시간 → 음수 t → 알고리즘 망가짐
   - 대응:
     ```javascript
     const now = Date.now()
     const lastReview = card.lastReview.getTime()
     if (now < lastReview) {
       // 시계가 과거로 변경됨 — review 거부 또는 last review 기준 보정
       throw new Error('System clock changed: review rejected')
     }
     ```

3. **Relearning 카드의 due 계산 버그**
   - FSRS-5에서 Relearning 후 Review 복귀 시 *짧은 interval*로 시작 — 의도된 동작
   - 그러나 stability가 *직전 Review*보다 더 큰 값으로 잘못 계산되면 due가 오히려 빨라짐
   - 대응: 라이브러리(ts-fsrs) 사용. 직접 구현 시 unit test로 *Pass 후 due > 직전 due* 단조 증가 검증

### 단조 증가 검증 unit test 패턴

```javascript
test('FSRS-5 monotonic increase on consecutive Good', () => {
  const f = new FSRS()
  let card = createEmptyCard()
  let prevDue = new Date(0)

  for (let i = 0; i < 10; i++) {
    const now = new Date(prevDue.getTime() + 24 * 60 * 60 * 1000)
    card = f.next(card, now, Rating.Good).card
    expect(card.due.getTime()).toBeGreaterThan(prevDue.getTime())
    prevDue = card.due
  }
})
```

---

## 시계 변경 방어 패턴

```typescript
// 카드별 lastReview 항상 ISO 8601로 저장
interface SrsCard {
  id: number
  lastReview: string  // ISO 8601, e.g. "2026-05-07T12:00:00Z"
  nextDue: string     // ISO 8601
  stability: number
  difficulty: number
}

function safeReview(card: SrsCard, now: Date, rating: Rating) {
  const last = new Date(card.lastReview).getTime()
  if (now.getTime() < last) {
    // 시계가 과거로 — review 무시, last + 1초 사용
    now = new Date(last + 1000)
  }
  // 정상 적용
  return applyFsrs(card, now, rating)
}
```

추가 보호: *서버 시간*과 동기화하거나, *모노톤 시계*(performance.now() 차이) 사용.

---

## 자주 보는 함정

| 함정 | 결과 |
|------|------|
| SM-2 EF 최소값 미설정 | 어려운 카드에서 EF가 무한 감소, interval이 비정상적으로 짧아짐 |
| getVoices()처럼 알고리즘 *일회성*으로 잘못 이해 | 매 review마다 호출해야 함 — 캐싱 금지 |
| FSRS w(weights) optimize 없이 default 영원히 사용 | 학습자에게 suboptimal — 100+ review 후 한 번 optimize 권장 |
| Relearning 단계 무시 | Again 받은 카드가 즉시 긴 interval로 복귀, 잘 안 외워짐 |
| 시계 변경 방어 누락 | 사용자가 시간 조작으로 무한 review skip 가능 |
| 2버튼 모드에서 SM-2 등급을 0/5로 극단 매핑 | EF가 빠르게 양극화 — 학습 곡선 망가짐. 3 또는 4로 보수적 매핑 권장 |

---

## 라이브러리 추천 (실 구현 시)

| 라이브러리 | 알고리즘 | 언어 | 비고 |
|-----------|---------|------|------|
| **ts-fsrs** | FSRS-5 | TypeScript | open-spaced-repetition 공식. 가장 활발 |
| py-fsrs | FSRS-5 | Python | 동일 그룹 공식 |
| fsrs-rs | FSRS-5 | Rust | 동일 그룹 공식 |
| (직접 구현) | SM-2 | 모든 언어 | 50줄 — 직접 구현 권장 |

`ts-fsrs` 사용 예 (앞 섹션 참조).

## 참고

- SuperMemo SM-2: https://super-memory.com/english/ol/sm2.htm
- Anki SRS 알고리즘 FAQ: https://faqs.ankiweb.net/what-spaced-repetition-algorithm.html
- open-spaced-repetition GitHub: https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler
- ts-fsrs: https://github.com/open-spaced-repetition/ts-fsrs
- fsrs4anki tutorial: https://github.com/open-spaced-repetition/fsrs4anki/blob/main/docs/tutorial.md
- FSRS 기술 해설 (Expertium): https://expertium.github.io/Algorithm.html
