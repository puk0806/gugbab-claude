---
skill: srs-spaced-repetition
category: frontend
version: v1
date: 2026-05-07
status: APPROVED
---

# 스킬 검증 문서: srs-spaced-repetition

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `srs-spaced-repetition` |
| 스킬 경로 | `.claude/skills/frontend/srs-spaced-repetition/SKILL.md` |
| 검증일 | 2026-05-07 |
| 검증자 | Claude (Opus 4.7) |
| 스킬 버전 | v1 |
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
| 작성 | Write | .claude/skills/frontend/srs-spaced-repetition/SKILL.md | 두 알고리즘 정리 + 비교표 + 매핑 패턴 + 단조 증가 보장 + 시계 변경 방어 |

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

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] SM-2 EF 초기값 2.5 + min 1.3 (Anki 변형)
- [✅] SM-2 공식 정확 (EF' = EF + (0.1 - (5-Q)*(0.08 + (5-Q)*0.02)))
- [✅] SM-2 interval 규칙 (Q<3 → reset / n=0 → 1d / n=1 → 6d / else → I*EF)
- [✅] FSRS-5 DSR 모델 + 19 trainable parameters
- [✅] FSRS-5 forgetting curve r = exp(ln(0.9)*i/s)
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

---

## 5. 테스트 진행 기록

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
- 최종 상태: **APPROVED** (content test PASS + 알고리즘 자체는 실 라이브러리 검증 — ts-fsrs는 별도 라이브러리 스킬화 시 검증)

---

## 6. 검증 결과 요약

| 항목 | 내용 |
|------|------|
| 검증 방법 | SuperMemo 공식 + Anki FAQ + open-spaced-repetition GitHub 교차 검증 |
| 클레임 판정 | 핵심 클레임 7건 모두 VERIFIED (SM-2 공식·EF min·Q→Anki 매핑·FSRS DSR·19 weights·forgetting curve·rating scale) |
| 에이전트 활용 테스트 | 3/3 PASS (Q1·Q2·Q3 모두 SKILL.md 본문에서 답변 도출) |
| 최종 판정 | **APPROVED** (알고리즘·이론 정리 카테고리 — content test PASS로 충분) |

---

## 7. 개선 필요 사항

- [⏸️] FSRS-5 19 weights optimize 절차 상세화 (선택 보강 — 현재는 라이브러리 위임)
- [⏸️] Anki Hard 버튼의 정확한 EF 변동량 (현재 -0.15로 기재, Anki 매뉴얼 직접 대조 권장)
- [⏸️] FSRS-5와 FSRS-4 차이점 명시 (선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-05-07 | v1 | 최초 작성 — SM-2(Anki 변형 포함) + FSRS-5(DSR 모델) 양 알고리즘 정리, 비교표, 2버튼/3버튼/4버튼 매핑 패턴, 단조 증가 unit test, 시계 변경 방어 safeReview, 라이브러리 추천. 셀프 content test 3/3 PASS → APPROVED | Claude (Opus 4.7) |
