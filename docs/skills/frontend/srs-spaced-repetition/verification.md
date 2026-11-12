---
skill: srs-spaced-repetition
category: frontend
version: v3
date: 2026-11-09
status: APPROVED
---

# 스킬 검증 문서: srs-spaced-repetition

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `srs-spaced-repetition` |
| 스킬 경로 | `.claude/skills/srs-spaced-repetition/SKILL.md` |
| 검증일 | 2026-11-09 (재검증, 이전 2026-09-28) |
| 검증자 | Claude (Sonnet 5) |
| 스킬 버전 | v2 |
| 카테고리 | 알고리즘·이론 정리 (content test로 APPROVED 가능) |

---

## 1. 작업 목록

- [✅] SM-2 알고리즘 조사 — Wozniak 1990 + Anki 4-button 변형
- [✅] FSRS-5 알고리즘 조사 — DSR 모델·19 weights·forgetting curve
- [✅] 카드 상태 전이(New/Learning/Review/Relearning) 명시
- [✅] 4-rating(Again/Hard/Good/Easy) 매핑 + 2버튼 모드 매핑 패턴
- [✅] 단조 증가 보장 + 시계 변경 방어 패턴
- [✅] SM-2 vs FSRS-5 비교표 + 라이브러리 추천
- [✅] SKILL.md 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|----------|----------|
| 조사 1 | WebSearch | "SM-2 algorithm SuperMemo easiness factor interval Anki implementation" | Wozniak 1987 Turbo Pascal 출발, EF 초기 2.5 + min 1.3, 공식 EF' = EF + (0.1 - (5-Q)*(0.08 + (5-Q)*0.02)), Anki 4-button 변형 |
| 조사 2 | WebSearch | "FSRS-5 Free Spaced Repetition Scheduler algorithm 2024 stability difficulty retrievability" | DSR 모델, 19 trainable parameters, forgetting curve r = exp(ln(0.9)*i/s), Anki 23.10+ default |
| 조사 3 | WebSearch | "FSRS-5 rating scale Again Hard Good Easy 1-4 card states" | Again=1·Hard=2·Good=3·Easy=4. 4 카드 상태(New/Learning/Review/Relearning) |
| 조사 4 | WebFetch | https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler | 다국어 구현(TypeScript/Python/Rust/Go/Dart 등). DSR 3 변수. 메모리 법칙 3가지 |
| 작성 | Write | .claude/skills/srs-spaced-repetition/SKILL.md | 두 알고리즘 정리 + 비교표 + 매핑 패턴 + 단조 증가 보장 + 시계 변경 방어 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| SuperMemo 공식 SM-2 | https://super-memory.com/english/ol/sm2.htm | ⭐⭐⭐ High | Wozniak 본인 작성 1990 논문 ascii 버전 |
| Anki SRS 알고리즘 FAQ | https://faqs.ankiweb.net/what-spaced-repetition-algorithm.html | ⭐⭐⭐ High | Anki 공식 FAQ. SM-2 ↔ FSRS 전환 정책 |
| open-spaced-repetition GitHub | https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler | ⭐⭐⭐ High | FSRS 공식 그룹. 알고리즘 명세·다국어 구현 |
| ts-fsrs | https://github.com/open-spaced-repetition/ts-fsrs | ⭐⭐⭐ High | TypeScript 공식 구현 |
| fsrs4anki tutorial | https://github.com/open-spaced-repetition/fsrs4anki/blob/main/docs/tutorial.md | ⭐⭐⭐ High | Anki 통합 튜토리얼 |
| Expertium FSRS 기술 해설 | https://expertium.github.io/Algorithm.html | ⭐⭐ Medium | 알고리즘 상세 + 벤치마크 (FSRS vs SM-2) |
| Mindomax FSRS vs SM-2 | https://www.mindomax.com/fsrs-vs-sm2-spaced-repetition-algorithm | ⭐⭐ Medium | 비교 분석 (보조 소스) |
| awesome-fsrs wiki "The Algorithm" (2026-11-09 재확인) | https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm | ⭐⭐⭐ High | FSRS-6 21 params·`(1+factor·t/S)^-w20`, FSRS-4.5 `DECAY=-0.5, FACTOR=19/81`, FSRS-5는 4.5와 동일 공식. FSRS-7 서술 없음 |
| ts-fsrs GitHub releases·README (2026-11-09) | https://github.com/open-spaced-repetition/ts-fsrs/releases | ⭐⭐⭐ High | 6.0.0: DefaultScheduler 기본 FSRS-7, 레거시 FSRS deprecated(FSRS-6), Rating 상수 객체, Node >=24 |
| npm registry ts-fsrs | https://registry.npmjs.org/ts-fsrs | ⭐⭐⭐ High | latest 6.0.0 (2026-10-28) |
| py-fsrs GitHub releases | https://github.com/open-spaced-repetition/py-fsrs/releases | ⭐⭐⭐ High | v6.0.0 "FSRS 6 model" 채택, 최신 v6.3.2 |

### 3-1. 2026-11-09 재검증 클레임 판정

| 클레임 | 판정 | 근거 |
|--------|------|------|
| FSRS-4.5·5 retrievability = `(1 + t/(9S))^-1` (09-28판) | DISPUTED → 정정 | awesome-fsrs wiki(19/81·-0.5) + Expertium(v4와 다른 함수) |
| FSRS-6 = 21 parameters, w20 감쇠 지수 | VERIFIED | awesome-fsrs wiki + Expertium(w20 0.1~0.8) |
| ts-fsrs가 FSRS-5 구현체 | DISPUTED → 정정 | ts-fsrs 5.x는 FSRS-6, 6.0은 기본 FSRS-7 (releases + README) |
| ts-fsrs 레거시 `FSRS`/`next`/`createEmptyCard` 사용 가능 | VERIFIED (deprecated) | ts-fsrs 6.0.0 릴리스 노트 |
| FSRS-7 공식·파라미터 수(34 weights) | UNVERIFIED | ts-fsrs 릴리스 단일 출처 — SKILL.md `> 주의: 미검증` |
| 4-rating Again=1~Easy=4, SM-2 공식 | VERIFIED (불변) | ts-fsrs 6.0 "값 불변", SuperMemo 원문(기존) |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] SM-2 EF 초기값 2.5 + min 1.3 (Anki 변형)
- [✅] SM-2 공식 정확 (EF' = EF + (0.1 - (5-Q)*(0.08 + (5-Q)*0.02)))
- [✅] SM-2 interval 규칙 (Q<3 → reset / n=0 → 1d / n=1 → 6d / else → I*EF)
- [✅] FSRS-5 DSR 모델 + 19 trainable parameters
- [✅] FSRS-5 forgetting curve `R = (1 + (19/81)·t/S)^-0.5` (2026-11-09 재정정 — 최초 exp 공식은 v3 이전, 09-28 `(1+t/9S)^-1`은 v4 공식이었음)
- [✅] FSRS-5 rating Again=1/Hard=2/Good=3/Easy=4
- [✅] 카드 상태 4종(New/Learning/Review/Relearning)

### 4-2. 구조 완전성

- [✅] YAML frontmatter (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 두 알고리즘 별도 섹션 + 비교표
- [✅] 2버튼 ↔ 4-rating 매핑 패턴 + SM-2/FSRS 양쪽 코드
- [✅] 단조 증가 unit test 예시
- [✅] 시계 변경 방어 패턴 + safeReview 코드
- [✅] 라이브러리 추천표

### 4-3. 실용성

- [✅] PRD 명시 사항 모두 커버 (SM-2/FSRS 비교·트레이드오프·카드 상태·2버튼 매핑·단조 증가·시계 변경)
- [✅] SM-2 50줄 직접 구현 코드 + FSRS-5 ts-fsrs 사용 예시
- [✅] 자주 보는 함정 6종

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 셀프 content test 수행 — SKILL.md 본문이 SM-2 공식·FSRS DSR·매핑 패턴을 모두 직접 답변 가능 수준으로 포함
- [✅] verification-policy.md *content test PASS = APPROVED 가능 카테고리* (알고리즘·이론 정리)에 해당
- [✅] skill-tester → general-purpose 재테스트 수행 (2026-09-28, FSRS-6·retrievability 거듭제곱 감쇠 정정 겨냥 2/2 PASS)
- [✅] skill-tester → general-purpose 재시험 수행 (2026-11-09, retrievability 재정정·ts-fsrs 6.0 개편 겨냥 2/2 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-11-09
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미설치로 대체)
**수행 방법**: 2026-11-09 재검증(retrievability 재정정·ts-fsrs 6.0.0 개편)을 겨냥한 실전 질문 2개. SKILL.md Read 후 그 내용에만 의존해 답변, 근거 줄 번호 명시.

### 실제 수행 테스트 (재시험, 2026-11-09)

**Q1. FSRS-5에서 Stability=4일 카드를 2일 뒤 review할 때 R은? t=S일 때 R, v4/FSRS-6 공식과의 차이는?**
- ✅ PASS
- 근거: SKILL.md "FSRS-5 알고리즘" 섹션 R 공식(`(1 + (19/81)·t/S)^-0.5`) + 상단 주의(세대별 공식)
- 상세: R = 1.117284^-0.5 ≈ 0.946으로 정확히 계산(검산 일치). t=S → R=0.9, v3 지수/v4 `(1+t/(9S))^-1`/4.5·5 거듭제곱/FSRS-6 `(1+factor·t/S)^-w20`을 정확히 구분. 정정 전 v4 공식을 FSRS-5에 쓰는 오답 없음.

**Q2. 신규 프로젝트에서 ts-fsrs 최신에 레거시 `new FSRS()`·`f.next()` 예제를 그대로 써도 되나? 6.0 변경점·새 API 흐름·미검증 항목은?**
- ✅ PASS
- 근거: SKILL.md 13행 주의, 166행 주의, 338행 라이브러리 표
- 상세: 레거시는 deprecated(FSRS-6 동작), `DefaultScheduler()` 기본 FSRS-7, `Rating` 상수 객체(`typeof Rating.Good`, 역조회 불가), Node >=24, 새 흐름 `newCard`/`review` → `{card, revlog}`를 정확히 답변. FSRS-7 공식·fsrs-rs 세대·Anki 세대를 미검증으로 구분했고 SKILL.md에 없는 `DefaultScheduler` 옵션 시그니처는 추정하지 않음.

### 발견된 gap (선택 보강, 차단 요인 아님)

- `DefaultScheduler` 옵션(request_retention·`version` 전달 위치) 시그니처가 SKILL.md에 없음
- `safeReview`의 `applyFsrs`(313행) 정의 없음, 단조 증가 테스트(278~289행)는 레거시 API 기준
- 326행 "getVoices()처럼…" 문구는 다른 스킬에서 섞여 들어온 것으로 보임(문구 정리 권장)

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 알고리즘·이론 정리 — content test PASS = APPROVED 가능 카테고리
- 최종 상태: APPROVED 유지

---

### [2026-09-28] 선택 보강 반영

2026-09-28 재테스트 Q2에서 발견된 gap("우선 권장: FSRS-5" 14행·SM-2 vs FSRS-5 비교표 188~200행이 FSRS-6 언급 없이 남아 상단 경고 박스를 건너뛰면 오도 가능) 반영. 14행 바로 아래·비교표 바로 아래에 "FSRS-6(21 trainable parameters, retrievability 공식 변경)이 최신 — 상단 주의 참조" 각주 추가. 새 사실이 아니라 스킬 상단에 이미 검증된(2026-09-28 재검증) FSRS-6 서술을 본문 다른 위치에도 정합시킨 것이므로 소스 재확인 불필요, status 영향 없음.

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미설치로 대체)
**수행 방법**: 2026-09-28 재검증에서 정정된 FSRS-6·retrievability 거듭제곱 감쇠 공식을 겨냥한 실전 질문 2개. SKILL.md Read 후 그 내용에만 의존해 답변, 근거 줄 번호 명시 필수.

### 실제 수행 테스트 (재테스트, 2026-09-28)

**Q1. FSRS-5에서 Stability=2일 카드를 3일 후 review할 때 Retrievability는?**
- ✅ PASS
- 근거: SKILL.md 120줄 정정된 거듭제곱 공식 `R(t, S) = (1 + t / (9 * S)) ** -1`
- 상세: R = (1 + 3/(9*2))^-1 ≈ 0.857로 정확히 계산. 정정 전 지수 감쇠 공식은 전혀 사용하지 않음 — 오기 공식이 재발하지 않음을 확인.

**Q2. 신규 프로덕션 구현에 FSRS-5를 그대로 채택해도 되는가, 확인할 최신 버전 이슈가 있는가?**
- 🟡 PASS (경미한 gap 동반)
- 근거: SKILL.md 11줄 재검증 주의문(FSRS-6이 최신, 19→21 parameters, 공식 변경) + 123줄 정정 주의문
- 상세: 에이전트가 FSRS-6 존재·구체적 차이(파라미터 수, 감쇠 지수의 학습 파라미터화)를 정확히 답변. 다만 14줄 "우선 권장: FSRS-5"과 188~200줄 비교표("추천 사용처: 프로덕션 학습 앱")가 FSRS-6 관련 언급 없이 남아 있어, 상단 경고 박스를 건너뛰면 오도될 수 있는 구조적 gap을 에이전트 스스로 지적함(§7에 기록).

### 발견된 gap

- "우선 권장" 문구(14줄)·SM-2 vs FSRS-5 비교표(188~200줄)에 FSRS-6 관련 각주가 없어 상단 경고 박스를 건너뛰면 오도 가능 — 차단 요인은 아님(상단 박스가 이미 명확히 정정 내용을 전달), 선택 보강 권장.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 알고리즘·이론 정리 — content test PASS = APPROVED 가능 카테고리
- 최종 상태: APPROVED

---

### 최초 테스트 (2026-05-07, 셀프 content test)

**수행일**: 2026-05-07
**수행 방법**: SKILL.md 본문을 기준으로 셀프 content test 3건 수행

### 셀프 content test 3건

**Q1**: "SM-2의 easiness factor가 1.3 미만으로 떨어지지 않게 하는 이유와 공식은?"
- **PASS**: SKILL.md SM-2 공식 섹션에 `if (easiness < 1.3) easiness = 1.3` 명시. 이유는 흔한 함정 표("어려운 카드에서 EF 무한 감소") + Anki 변형 표(min 1.3 강제)에 명시.

**Q2**: "FSRS-5에서 Stability 1.5일 카드를 1일 후 review할 때 Retrievability는?"
- **PASS**: SKILL.md FSRS-5 DSR 섹션 공식 R = exp(ln(0.9)*t/S) 적용. R = exp(ln(0.9)*1/1.5) ≈ exp(-0.0702) ≈ 0.932.

**Q3**: "사용자가 디바이스 시계를 과거로 변경하면 SRS 알고리즘에 어떤 영향이 있고, 어떻게 방어하나?"
- **PASS**: SKILL.md 시계 변경 방어 섹션에 명시. (1) 마지막 review timestamp > 현재 시간 → 음수 t → 알고리즘 망가짐. (2) 대응: now < lastReview면 review 거부 또는 last + 1초 사용. safeReview 코드 예시 제공.

### 판정

- agent content test: 3/3 PASS
- 카테고리: 알고리즘·이론 정리 (verification-policy.md *실사용 검증 불필요* 카테고리)
- 최종 상태(당시): APPROVED (아래 2026-09-28 재검증에서 PENDING_TEST로 재전환됨)

---

### 재검증 — 수행일: 2026-09-28

**수행 방법**: SKILL.md + verification.md 전체 Read → 핵심 클레임 3개 1차 소스 대조(WebFetch: open-spaced-repetition `awesome-fsrs` wiki "The Algorithm", ts-fsrs GitHub releases API, npm registry) → 실전 질문 2개로 SKILL.md 자체 답변 확인.

**클레임 대조 결과**:
1. "FSRS-5가 2024 표준·최신" → **DISPUTED**: `awesome-fsrs` wiki 기준 **FSRS-6**(21 trainable parameters)이 FSRS-5(19 parameters)를 대체한 현재 버전. FSRS-5는 여전히 유효하지만 최신은 아님 — SKILL.md에 `> 주의` 표기 추가.
2. "FSRS retrievability 공식 R = exp(ln(0.9) * t / S)" → **DISPUTED**: 1차 소스 확인 결과 FSRS-4.5·FSRS-5는 **거듭제곱(power-law) 공식** `R(t,S) = (1 + t/(9S))^-1` 을 쓴다. 지수 감쇠 공식은 FSRS v4 이전 구식. SKILL.md 본문 공식을 정정하고 `> 주의`로 이전 공식이 오기였음을 명시.
3. "ts-fsrs가 FSRS-5 공식 TypeScript 구현체, open-spaced-repetition 공식" → VERIFIED: ts-fsrs GitHub releases API 확인(최신 태그 v5.4.2, 2026-09-01 배포) — 활발히 유지보수 중인 공식 패키지 맞음. 단, 패키지 semver 버전(v5.x)과 FSRS *알고리즘* 세대(FSRS-5/6)는 별개 숫자 체계이므로 혼동 주의.

**실전 질문 재검증**:
- Q1(재검증). "SKILL.md 공식대로 FSRS-5에서 Stability 1.5일 카드를 1일 후 review하면 R은?" → SKILL.md 정정 전 공식(지수)으로는 옛 verification.md Q2와 같이 ≈0.932였으나, **정정된 거듭제곱 공식**으로는 R = (1 + 1/(9*1.5))^-1 ≈ (1.074)^-1 ≈ 0.931 — 두 공식이 이 예시에서는 근사값이 비슷해 우연히 큰 차이가 안 보이지만, t/S 비율이 커질수록 두 곡선이 크게 갈라진다(거듭제곱 공식이 long-tail에서 더 완만). 판정: 정정 반영 후 PASS.
- Q2(재검증). "FSRS-5와 FSRS-6의 차이는?" → 재검증 전 SKILL.md는 FSRS-6 언급이 전혀 없어 FAIL. `> 주의` 추가 후 PASS(21 parameters·감쇠 지수 trainable화 명시).

**재검증 최종 판정**: 예제 공식(retrievability)과 "최신 버전" 클레임이 실제로 바뀌어(패치 숫자 수준이 아님) **PENDING_TEST로 하향**. SKILL.md 정정은 완료했으나, 정정된 FSRS-6 관련 내용은 다음 skill-tester 2단계 실사용 테스트에서 재확인 필요.

---

## 6. 검증 결과 요약

| 항목 | 내용 |
|------|------|
| 검증 방법 | SuperMemo 공식 + Anki FAQ + open-spaced-repetition GitHub 교차 검증 (2026-05-07) → awesome-fsrs wiki + ts-fsrs releases API 재검증 (2026-09-28) |
| 클레임 판정 | SM-2 관련 클레임 4건 VERIFIED(불변). FSRS 관련 2건 **DISPUTED**(2026-09-28) — retrievability 공식 정정, FSRS-6 최신 버전 사실 추가 |
| 에이전트 활용 테스트 | 최초 3/3 PASS(2026-05-07). 재검증 2/2(2026-09-28, 메인 세션 자체 확인) → skill-tester 재테스트 2/2 PASS(2026-09-28) → 2026-11-09 재검증 후 skill-tester 재시험 2/2 PASS |
| 최종 판정 | **APPROVED** (2026-11-09 재시험 2/2 PASS로 유지 — retrievability 재정정·ts-fsrs 6.0 개편 반영 확인; 이전 2026-09-28 — skill-tester → general-purpose 재테스트에서 FSRS-6·거듭제곱 감쇠 정정이 정확히 반영됨을 확인, 알고리즘·이론 정리 카테고리로 content test PASS = APPROVED 가능) |

---

## 7. 개선 필요 사항

- [✅] skill-tester → general-purpose 2단계 실사용 재테스트 수행 (2026-09-28 완료, 2/2 PASS)
- [✅] (2026-09-28 반영) "우선 권장: FSRS-5"(14줄)·SM-2 vs FSRS-5 비교표(188~200줄)에 FSRS-6 관련 각주 반영 — 2026-09-28 재테스트 Q2에서 발견, 같은 날 두 지점 모두 각주 추가 완료
- [✅] (2026-11-09 완료, 2/2 PASS) 재검증 후 skill-tester 재시험 — retrievability 재정정·ts-fsrs 6.0 개편 확인
- [⏸️] (선택 보강, 차단 요인 아님) `DefaultScheduler` 옵션 시그니처 추가, `applyFsrs` 정의·단조 증가 테스트 새 API 반영, 326행 "getVoices()" 혼입 문구 정리
- [⏸️] FSRS-5 19 weights optimize 절차 상세화 (선택 보강 — 현재는 라이브러리 위임)
- [⏸️] Anki Hard 버튼의 정확한 EF 변동량 (현재 -0.15로 기재, Anki 매뉴얼 직접 대조 권장)
- [⏸️] FSRS-5와 FSRS-4 차이점 명시 (선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-05-07 | v1 | 최초 작성 — SM-2(Anki 변형 포함) + FSRS-5(DSR 모델) 양 알고리즘 정리, 비교표, 2버튼/3버튼/4버튼 매핑 패턴, 단조 증가 unit test, 시계 변경 방어 safeReview, 라이브러리 추천. 셀프 content test 3/3 PASS → APPROVED | Claude (Opus 4.7) |
| 2026-09-28 | v2 | 재검증 — FSRS-6(21 parameters)가 FSRS-5를 대체한 최신임을 발견, retrievability 공식을 지수 감쇠(오기)에서 거듭제곱 감쇠(FSRS-4.5/5 실제 공식)로 정정. `> 주의` 2건 추가. status APPROVED → PENDING_TEST | Claude (Sonnet 5) |
| 2026-09-28 | v2 | 2단계 실사용 재테스트 수행 (Q1 정정된 거듭제곱 공식 R 계산 / Q2 FSRS-6 채택 확인 필요성) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-28 | v2 | 선택 보강 반영 — 14행·188~200행 비교표에 FSRS-6 관련 각주 추가(상단 서술과 정합, 신규 사실 아님). status 영향 없음, APPROVED 유지 | Claude (Opus 5.5) |
| 2026-11-09 | v3 | 재검증 — ① retrievability 공식 **재정정**: 09-28판 `(1 + t/(9S))^-1`은 FSRS v4 공식이었음. FSRS-4.5·5는 `(1 + (19/81)·t/S)^-0.5`(awesome-fsrs wiki 명시 + Expertium 해설 "4.5·5는 v4와 다른 거듭제곱 함수") → 본문·상단 주의 정정, 세대별 공식 정리 ② ts-fsrs 6.0.0(2026-10-28, npm·GitHub releases) 메이저 개편 반영: `DefaultScheduler` 기본 FSRS-7·`version:'FSRS-6'` 선택, 레거시 `FSRS`/`fsrs()` deprecated(FSRS-6), `Rating` enum→상수 객체, Node `>=24` — 코드 예시에 레거시 API 표기·weights 길이 주석 수정, 라이브러리 표 정정(ts-fsrs 5.x는 이미 FSRS-6, py-fsrs v6+는 FSRS-6) ③ FSRS-7 공식·파라미터 수, fsrs-rs 세대는 독립 소스 미확인 → `> 주의: 미검증`. SM-2 공식·4-rating 값(1~4) 불변. status APPROVED 유지. skill-tester 재시험 수행(Q1 FSRS-5 S=4·t=2 R 계산 ≈0.946 / Q2 ts-fsrs 6.0 레거시 API·DefaultScheduler·Rating·Node 요구) → 2/2 PASS, APPROVED 유지 | Claude (Opus 5.5, 재검증 배치) |
| 2026-11-12 | v3.1 | 정리(사실 재검증 아님) — 일반 지식 덜어내기: 남긴 것 상단 주의 2개(FSRS-6 대체·세대별 R 공식, ts-fsrs 6.0.0 개편)·권장 문단, R 공식 재정정 주의, ts-fsrs 레거시/6.0 API 주의·의사 코드, 라이브러리 세대 표, 2버튼 매핑, 단조 증가·시계 변경 방어, 함정 표(ts-fsrs 6.0 항목은 기존 주의 내용을 표로 옮김) / 덜어낸 것 언제 사용/비사용, SM-2 변수·등급·공식 코드·Anki 4버튼 표·강약점, FSRS DSR 변수 표·4등급 표·상태 전이도, FSRS 강약점, SM-2 vs FSRS-5 비교 표, 매핑 함수·단조 증가 테스트·safeReview 코드, 함정 표의 SRS와 무관한 getVoices 행. 원 검증일 2026-11-09 기준 내용 그대로, status·검증일 변경 없음 | 정리 |
