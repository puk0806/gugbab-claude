---
name: srs-spaced-repetition
description: 간격 반복(SRS) 구현에서 모델이 틀리기 쉬운 최신 사실 — FSRS 세대별 retrievability 공식(v3·v4·4.5/5·6) 정정, FSRS-6(21 parameters)이 FSRS-5 대체, ts-fsrs 6.0.0 DefaultScheduler 기본 FSRS-7·레거시 FSRS deprecated·Rating 상수 객체·Node 24, 라이브러리 세대 표, 2버튼→4-rating 매핑, 단조 증가·시계 변경 방어
---

# srs-spaced-repetition — 간격 반복 학습 알고리즘 (SM-2 / FSRS-5)

> 소스: SM-2 — Wozniak 1990 SuperMemo paper / Anki 공식 매뉴얼; FSRS — open-spaced-repetition GitHub
> 검증일: 2026-11-09

> 주의 (2026-09-28 재검증, 2026-11-09 재정정): **FSRS-6**이 FSRS-5를 대체한 버전이다(21 trainable parameters, 감쇠 지수 w20 학습). 본 스킬은 여전히 FSRS-5(19 parameters) 기준으로 작성되어 있다 — 신규 구현 시 FSRS-6 채택 여부를 별도 확인할 것. retrievability 공식은 세대마다 다르다: FSRS v3 이전 = 지수 감쇠 `exp(ln(0.9)·t/S)`, **FSRS v4** = `(1 + t/(9·S))^(-1)`, **FSRS-4.5·FSRS-5** = `(1 + (19/81)·t/S)^(-0.5)`, FSRS-6 = `(1 + factor·t/S)^(-w20)`. (09-28판은 v4 공식을 FSRS-5 공식으로 잘못 적었음 — 2026-11-09 정정.)

> 주의 (2026-11-09): **ts-fsrs 6.0.0**(2026-10-28)이 메이저 개편됐다 — 새 `DefaultScheduler()`가 기본으로 **FSRS-7**을 쓰고(`version: 'FSRS-6'`으로 이전 모델 선택), 기존 `FSRS`·`fsrs()`는 deprecated(FSRS-6으로 동작), `Rating`/`State`가 enum → 상수 객체로 바뀌고 Node.js `>=24`를 요구한다. 아래 코드 예시는 ts-fsrs 5.x / 6.x 레거시 API 기준이다. FSRS-7 알고리즘 자체의 공식·파라미터 수는 ts-fsrs 릴리스 외 독립 소스로 확인하지 못했다(> 주의: 미검증).

> 다루는 알고리즘: **SM-2** (Anki 4.x 이전 베이스, 가장 단순) / **FSRS-5** (Anki 23.10+에서 FSRS 지원 시작 — Anki 버전별 FSRS 세대는 릴리스 노트로 확인, 2024 표준)
> 우선 권장: 신규 구현은 **FSRS-5** — 정확도가 SM-2 대비 통계적으로 우수
> (단, **FSRS-6**이 최신 버전이다 — 21 trainable parameters, retrievability 공식 변경. 위 "주의" 참조. 신규 구현이면 FSRS-6 채택 여부를 먼저 확인할 것 — 본 스킬은 FSRS-5 기준으로 작성됨)
> 단순성 우선: 학습/프로토타입은 **SM-2** — 1990 논문 한 페이지로 정의 가능

---

## 이 스킬의 범위

FSRS 세대·ts-fsrs 버전 변경점, 2버튼 매핑, 단조 증가·시계 변경 방어 함정만 다룬다.

> 기본 사용법(SM-2 공식·Q 0~5 등급·Anki 4버튼 변형, FSRS DSR 변수 정의, 카드 상태 전이 New→Learning→Review→Relearning, SM-2 vs FSRS 일반 비교)은 공식 문서 수준이라 싣지 않는다. SM-2는 직접 구현(EF 최소값 1.3은 Anki 관행), FSRS는 공식 라이브러리 사용이 원칙이다.

---

## 1. FSRS retrievability — 세대별 공식

```
// FSRS-4.5 / FSRS-5: DECAY = -0.5, FACTOR = 19/81 → R(S, S) = 0.9
R(t, S) = (1 + (19 / 81) * t / S) ** -0.5
```

> 주의(2026-11-09 재정정): 2026-09-28판 본문의 `R = (1 + t/(9·S))^(-1)`은 **FSRS v4** 공식이었다(그 이전판의 `exp(ln(0.9)·t/S)`는 FSRS v3 이전 지수 감쇠). FSRS-4.5·FSRS-5는 위의 `DECAY = -0.5`, `FACTOR = 19/81` 거듭제곱 공식을 쓴다(출처: open-spaced-repetition awesome-fsrs wiki "The Algorithm" — FSRS-5는 "다른 공식은 FSRS-4.5와 동일"; Expertium 해설 "4.5·5는 v4와 다른 거듭제곱 함수"). 모든 세대에서 t = S일 때 R = 0.9다. FSRS-6은 감쇠 지수를 학습 파라미터(w20)로 만든 `R(t,S) = (1 + factor·t/S)^(-w20)`, `factor = 0.9^(-1/w20) - 1`이다.

`t`는 마지막 review로부터 경과 일수, `S`는 stability. 목표 retention(기본 0.9)에 도달하는 시점이 due다.

---

## 2. ts-fsrs API — 레거시 vs 6.0

> 주의 (2026-11-09): 아래는 ts-fsrs **레거시 API**(`FSRS`/`generatorParameters`/`next`) 의사 코드다. ts-fsrs 5.x·6.x의 레거시 `FSRS`는 FSRS-6(21 weights)으로 동작하므로 `w`를 직접 넣을 땐 그 모델 길이에 맞추고, 모르면 생략해 기본값을 쓴다. ts-fsrs 6.0의 새 API는 `const scheduler = await DefaultScheduler()` → `scheduler.newCard({ now })` → `scheduler.review({ card, grade: Rating.Good, now })`(반환 `{ card, revlog }`)이며 기본 모델이 FSRS-7이다. 6.0에서 `Rating`은 enum이 아닌 상수 객체라 타입 위치에는 `typeof Rating.Good` 같은 형태를 쓰고, `Rating[3]` 역조회는 안 된다.

```typescript
// 의사 코드 — ts-fsrs 레거시 API
import { FSRS, generatorParameters, Rating } from 'ts-fsrs'

const f = new FSRS(generatorParameters({
  request_retention: 0.9,   // 다음 review 시점 R 목표값 (default 0.9)
  maximum_interval: 36500,  // default 36500 days
  // w: [/* floats */],     // 생략 시 기본값; FSRS-5 = 19개, ts-fsrs 레거시 기본 FSRS-6 = 21개 — 사용자 데이터로 optimize 권장
}))

const result = f.next(card, new Date(), Rating.Good) // result.card: 갱신된 D·S·due / result.log: 이력
```

### 라이브러리 세대

| 라이브러리 | 알고리즘 | 언어 | 비고 |
|-----------|---------|------|------|
| **ts-fsrs** | 5.x: FSRS-6 / 6.0+: `DefaultScheduler` 기본 FSRS-7(`version: 'FSRS-6'` 선택 가능) | TypeScript | open-spaced-repetition 공식. 가장 활발. 6.0은 Node.js `>=24` |
| py-fsrs | v6.0+: FSRS-6 | Python | 동일 그룹 공식 |
| fsrs-rs | FSRS (세대는 릴리스로 확인 — > 주의: 미검증) | Rust | 동일 그룹 공식, Anki 내장 엔진 |
| (직접 구현) | SM-2 | 모든 언어 | 50줄 — 직접 구현 권장 |

FSRS weights는 충분한 review 데이터가 있어야 optimize 효과가 있다 — 신규 사용자는 default w(suboptimal), 100+ review 후 한 번 optimize 권장.

---

## 3. 2버튼 모드 ↔ 4-rating 매핑

| 사용자 버튼 | SM-2 (0~5) | FSRS rating (1~4) |
|------------|-----------|-------------|
| 모르겠음 | 1 (Q<3 fail) | Again (1) — Relearning |
| 알았음 | 4 (보수적 default) | Good (3) |
| (3버튼 확장 시) 쉬웠음 | — | Easy (4) — 더 긴 interval |

2버튼은 카드별 미세 조정 정보가 사라지므로 가능하면 3버튼(Again·Good·Easy)으로 확장한다. SM-2 등급을 0/5로 극단 매핑하면 EF가 빠르게 양극화된다.

---

## 4. 단조 증가 보장 · 시계 변경 방어

기본 동작은 단조 증가지만 다음 경우 역전될 수 있다:

1. **SM-2 Anki 변형의 EF 감소 누적** — Hard에서 EF -= 0.15. EF 최소값 1.3을 강제하지 않으면 interval이 비정상적으로 짧아진다.
2. **시계 변경(time travel)** — 디바이스 시간을 과거로 바꾸면 마지막 review timestamp > 현재 → 음수 t → 알고리즘 망가짐(시간 조작으로 review skip도 가능). 대응: `now < lastReview`면 review 거부, 또는 `last + 1초`로 보정. `lastReview`·`nextDue`는 ISO 8601로 저장하고, 서버 시간 동기화나 모노톤 시계(`performance.now()` 차이)로 추가 보호.
3. **Relearning 후 stability 오계산** — Relearning 후 Review 복귀 시 짧은 interval로 시작하는 것은 의도된 동작이지만, stability가 직전 Review보다 크게 잘못 계산되면 due가 오히려 빨라진다. 라이브러리를 쓰고, 직접 구현 시 "연속 Good이면 due가 매번 직전보다 커진다" unit test로 검증한다.

---

## 5. 자주 보는 함정

| 함정 | 결과 |
|------|------|
| FSRS-5 공식으로 `(1 + t/(9·S))^(-1)` 사용 | 그건 FSRS v4 공식 — 4.5/5는 `(1 + (19/81)·t/S)^(-0.5)` |
| ts-fsrs 레거시 `FSRS`에 19개 weights 주입 | 레거시 `FSRS`는 FSRS-6(21 weights)으로 동작 — 길이 맞추거나 생략 |
| ts-fsrs 6.0에서 `Rating`을 enum처럼 타입·역조회 | 상수 객체 — `typeof Rating.Good`, `Rating[3]` 불가 |
| ts-fsrs 6.0을 Node 24 미만에서 | Node.js `>=24` 요구 |
| ts-fsrs 6.0 `DefaultScheduler` 결과를 FSRS-6으로 가정 | 기본 FSRS-7 — 이전 모델은 `version: 'FSRS-6'` |
| SM-2 EF 최소값 미설정 | 어려운 카드에서 EF가 무한 감소 |
| FSRS w optimize 없이 default 영원히 사용 | 학습자에게 suboptimal |
| Relearning 단계 무시 | Again 받은 카드가 즉시 긴 interval로 복귀 |
| 시계 변경 방어 누락 | 시간 조작으로 무한 review skip 가능 |

## 참고

- SuperMemo SM-2: https://super-memory.com/english/ol/sm2.htm
- Anki SRS 알고리즘 FAQ: https://faqs.ankiweb.net/what-spaced-repetition-algorithm.html
- open-spaced-repetition GitHub: https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler
- ts-fsrs: https://github.com/open-spaced-repetition/ts-fsrs
- fsrs4anki tutorial: https://github.com/open-spaced-repetition/fsrs4anki/blob/main/docs/tutorial.md
- FSRS 기술 해설 (Expertium): https://expertium.github.io/Algorithm.html
