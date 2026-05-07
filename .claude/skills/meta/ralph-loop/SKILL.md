---
name: ralph-loop
description: 명시적 종료 조건이 있는 자율 반복 루프 워크플로우. 검증·테스트·다듬기 작업을 *통과 기준 충족까지* 반복 실행하되 max_iterations·convergence·timeout으로 무한 루프 방지. Ouroboros Ralph 패턴(boulder never stops)을 우리 프로젝트 컨벤션에 맞게 정리한 메타 스킬
---

# ralph-loop — 자율 반복 루프 워크플로우

> 소스: Ouroboros Agent OS — https://github.com/Q00/ouroboros (skills/ralph 컨셉을 우리 프로젝트 컨벤션에 맞게 재정리)
> 검증일: 2026-05-07

> 컨셉 출처: Ouroboros Agent OS의 Ralph 모드 ("The boulder never stops")
> 적용 범위: 검증·테스트·다듬기 작업 가운데 *통과 기준이 명확*한 경우

## 언제 사용하나

다음 조건이 모두 충족될 때 사용한다.

- 작업의 *성공 판정 기준*이 객관적으로 정의 가능 (예: 테스트 통과, AI 패턴 N건 미만, similarity 0.95 이상)
- 한 번의 시도로 끝나지 않을 가능성이 높다 (반복 다듬기·재테스트가 자연스러운 작업)
- 무한 루프 방지를 위한 *명시적 종료 조건* 설정이 가능하다 (max_iterations, timeout)

대표 사례:
- skill-tester 실패 시 SKILL.md 보완 → 재테스트 (PASS까지 반복)
- 학위논문 본문 다듬기 (AI 패턴 검출 → 수정 → 재검출, 0건까지)
- 빌드 실패 → 에러 분석 → 수정 → 재빌드 (성공까지)
- 테스트 케이스 추가 → 기존 테스트 깨짐 → 수정 → 재실행 (전체 통과까지)

## 언제 사용하지 않나

- 작업의 성공 기준이 *주관적*이다 (예: "더 자연스럽게", "더 보기 좋게")
- 한 번에 끝나는 작업 (단순 정보 조회, 단일 파일 생성 등)
- 외부 부작용이 큰 작업 (DB 변경, API 호출 등) — 잘못된 시도가 누적되면 위험

## 4단계 루프 구조

```
[종료 조건 정의] → [실행] → [평가] → [수렴? Y→종료 / N→1로]
        ↑                                       │
        └───────────────────────────────────────┘
```

### 1단계: 종료 조건 명시 (필수)

루프 시작 *전*에 다음 4가지를 모두 명시한다.

| 조건 | 설명 | 예시 |
|------|------|------|
| **PASS 기준** | 무엇이 충족되면 성공인가 | "skill-tester 3개 질문 모두 PASS" |
| **max_iterations** | 최대 반복 횟수 | 5회 (대부분의 경우 충분) |
| **convergence** | 수렴 감지 (선택) | 3회 연속 동일 결과 → 더 이상 진전 없음으로 판정 |
| **timeout** | 절대 시간 제한 | 30분 또는 1시간 |

종료 조건이 명시되지 않으면 루프 시작을 거부한다.

### 2단계: 실행

종료 조건을 정의한 후 실제 작업을 1회 수행한다. 이 단계는 *기존 워크플로우 그대로*다.

- skill-tester 호출
- 본문 다듬기
- 빌드 실행
- 테스트 실행

### 3단계: 평가

PASS 기준에 비추어 결과를 평가한다.

- **PASS**: 종료
- **FAIL**: 실패 원인 분석 → 다음 시도에 반영할 수정 계획 수립

평가 결과는 *명시적 로그*로 기록한다 (반복 횟수·실패 원인·수정 계획).

### 4단계: 수렴 판정

다음 조건 중 하나라도 충족되면 루프 종료:

- PASS 도달 → 성공 종료
- max_iterations 도달 → 실패 종료, 사용자에게 결과 보고
- convergence 감지 (3회 연속 동일 결과) → 정체 종료, 다른 접근 필요
- timeout 초과 → 시간 종료

종료 사유를 사용자에게 명시 보고한다.

## 우리 프로젝트 적용 예시 3가지

### 적용 1: skill-tester 자동 재시도

```
PASS: agent content test 3/3 PASS
max_iterations: 3
convergence: 동일 PARTIAL 결과 2회 연속 시 정체로 판정

루프:
  반복 1: skill-tester 실행 → 2/3 PASS, 1 PARTIAL
  실패 분석: "Q2 답변에서 SKILL.md 섹션 N 누락"
  수정: SKILL.md 섹션 N에 anti-pattern 추가
  반복 2: skill-tester 재실행 → 3/3 PASS
  종료: PASS, status PENDING_TEST 유지 또는 APPROVED 전환 (verification-policy 카테고리 기준)
```

### 적용 2: 본문 다듬기 (AI 패턴 검출)

```
PASS: AI 패턴 검출 0건 (정식화·작동한다·~을 보여준다 등 N개 패턴 grep 결과 0)
max_iterations: 5
timeout: 30분

루프:
  반복 1: grep -c "정식화" → 24건. 단락별 다듬기.
  반복 2: grep → 12건. 추가 다듬기.
  반복 3: grep → 3건. 추가 다듬기.
  반복 4: grep → 0건. PASS 종료.
```

### 적용 3: 빌드 에러 자동 해결

```
PASS: pnpm build 종료 코드 0
max_iterations: 5
timeout: 15분

루프:
  반복 1: 빌드 실행 → cannot find module 'X'
  수정: pnpm add X
  반복 2: 빌드 실행 → 타입 에러 file.ts:42
  수정: 타입 정정
  반복 3: 빌드 실행 → 종료 코드 0. PASS 종료.
```

## 안전 장치

### 1. max_iterations 강제

종료 조건 정의 단계에서 `max_iterations`가 누락되면 작업을 시작하지 않는다. 무한 루프 방지의 1차 방벽.

### 2. 동일 시도 반복 금지 (convergence)

3회 연속 동일 결과가 나오면 *정체로 판정*하고 루프를 멈춘다. 같은 실패를 반복하는 것은 다른 접근이 필요하다는 신호다.

### 3. 외부 부작용 작업 보호

다음 작업은 ralph-loop 사용 *금지*:
- git push, git commit (사용자 승인 작업)
- DB 변경, 외부 API 호출 (롤백 어려움)
- 파일 삭제 (rm -rf 등)

해당 작업은 단발 실행만 허용. 반복 작업은 *멱등(idempotent)* 작업에 한정한다.

### 4. 사용자 인터럽트 보장

루프 진행 중 *언제든* 사용자가 중단 가능. 각 반복 종료 시 진행 상황을 보고하여 사용자가 *멈출지 계속할지* 결정할 수 있게 한다.

## 출력 형식

루프 종료 시 다음 형식으로 보고:

```
=== ralph-loop 종료 ===
종료 사유: PASS / max_iterations / convergence / timeout / user-interrupt
반복 횟수: N / max
소요 시간: M분
최종 결과: <성공 시 결과 / 실패 시 마지막 시도 상태>
다음 단계: <성공 시 후속 작업 / 실패 시 사용자 결정 필요 사항>
```

## 흔한 실수

| 실수 | 결과 |
|------|------|
| 종료 조건을 *주관적*으로 정의 ("자연스러워질 때까지") | 무한 루프 또는 자의적 종료 |
| max_iterations를 너무 크게 (50회 이상) | 비효율적 반복, 수렴 못 함 |
| 외부 부작용 작업에 적용 | 롤백 불가능한 누적 손상 |
| 사용자 보고 누락 | 컨텍스트 손실 |

## 우리 컨벤션과의 정합

- **memory `feedback_no_static_paths.md`**: 본 스킬은 일반화된 워크플로우만 다루므로 로컬 경로 박지 않음
- **memory `feedback_verification_md_rules.md`**: 본 스킬은 *워크플로우 카테고리*이므로 verification.md status는 `PENDING_TEST` 유지 (실 프로젝트 적용 후 APPROVED 전환)
- **superpowers `/loop`과의 차이**: superpowers의 `/loop`는 *시간 간격* 기반 반복. 본 스킬은 *성공 기준* 기반 반복으로 종료 조건이 명확
