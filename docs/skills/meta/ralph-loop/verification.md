---
skill: ralph-loop
category: meta
version: v1
date: 2026-05-07
status: PENDING_TEST
---

# 스킬 검증 문서: ralph-loop

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `ralph-loop` |
| 스킬 경로 | `.claude/skills/meta/ralph-loop/SKILL.md` |
| 검증일 | 2026-05-07 |
| 검증자 | Claude (Opus 4.7) |
| 스킬 버전 | v1 |
| 카테고리 | 워크플로우 (실사용 필수) |

---

## 1. 작업 목록

- [✅] Ouroboros Agent OS의 Ralph 모드 컨셉 조사 (WebFetch)
- [✅] 우리 프로젝트 컨벤션과의 정합성 정리 (memory feedback_no_static_paths.md / feedback_verification_md_rules.md 반영)
- [✅] superpowers `/loop`과의 차이 명시 (시간 기반 vs 결과 기반)
- [✅] 4단계 루프 구조 정리 (종료 조건 정의 → 실행 → 평가 → 수렴 판정)
- [✅] 안전 장치 4종 정리 (max_iterations 강제, convergence, 외부 부작용 금지, 사용자 인터럽트)
- [✅] 우리 프로젝트 적용 예시 3종 (skill-tester 재시도, 본문 다듬기, 빌드 에러)
- [✅] SKILL.md 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|----------|----------|
| 조사 | WebFetch | https://github.com/Q00/ouroboros (skills/ralph SKILL.md) | Ralph 모드 — boulder never stops, max_generations, lineage_id, QA verification, convergence 종료 조건 확인 |
| 조사 | WebFetch | https://github.com/Q00/ouroboros/blob/main/CLAUDE.md | 4단계 사이클(Interview → Seed → Execute → Evaluate) 및 9개 페르소나 구조 확인 |
| 조사 | WebSearch | "Q00/ouroboros claude code agents skills structure ralph" | superpowers `/loop`과의 차이(시간 기반 vs 결과 기반) 확인, ralph 트리거 키워드 확인 |
| 형식 참조 | Read | .claude/skills/meta/continuous-learning/SKILL.md | 메타 카테고리 스킬 형식 확인 |
| 형식 참조 | Read | .claude/rules/verification-policy.md | 워크플로우 카테고리 PENDING_TEST 분류 규칙 확인 |
| 작성 | Write | .claude/skills/meta/ralph-loop/SKILL.md | 4단계 루프 + 안전 장치 4종 + 적용 예시 3종으로 정리 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| Ouroboros Agent OS | https://github.com/Q00/ouroboros | ⭐⭐ Medium | 컨셉 출처 (Ralph 모드 skills/ralph) |
| Ouroboros Ralph SKILL.md | https://raw.githubusercontent.com/Q00/ouroboros/main/skills/ralph/SKILL.md | ⭐⭐ Medium | Ralph 모드 상세 명세 |
| Ouroboros CLAUDE.md | https://raw.githubusercontent.com/Q00/ouroboros/main/CLAUDE.md | ⭐⭐ Medium | 워크플로우 사이클 정의 |
| 우리 프로젝트 verification-policy.md | 프로젝트 내부 규칙 | ⭐⭐⭐ High | 워크플로우 카테고리 PENDING_TEST 분류 근거 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] Ouroboros Ralph 컨셉 출처 명시
- [✅] superpowers `/loop`과의 차이 명시
- [✅] 안전 장치(max_iterations, convergence, timeout, user-interrupt) 4종 모두 정리
- [✅] 외부 부작용 작업(git push, DB 변경, 파일 삭제) 명시 금지

### 4-2. 구조 완전성

- [✅] YAML frontmatter (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 언제 사용 / 언제 사용하지 않을지 기준
- [✅] 4단계 루프 구조 다이어그램
- [✅] 우리 프로젝트 적용 예시 3종
- [✅] 흔한 실수 패턴

### 4-3. 실용성

- [✅] 종료 조건 4가지(PASS·max_iterations·convergence·timeout) 모두 코드/형식 예시 포함
- [✅] 출력 형식 정의 (종료 사유·반복 횟수·소요 시간·결과·다음 단계)
- [✅] 우리 컨벤션과의 정합 명시

### 4-4. Claude Code 에이전트 활용 테스트

- [❌] skill-tester 호출 (워크플로우 카테고리 — 실 시나리오로 검증)
- [⏸️] 실 시나리오 적용 후 APPROVED 전환 검토

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-07
**수행 방법**: SKILL.md 작성 직후 셀프 검증 (skill-tester 호출 미수행)

### 자체 검증

본 스킬은 *워크플로우 카테고리*에 속하며, verification-policy.md에 따르면 *실사용 필수 카테고리*다. 따라서 작성 직후 PENDING_TEST 상태로 시작하며, 실제 프로젝트에서 4단계 루프를 1회 이상 적용해본 뒤에만 APPROVED 전환이 가능하다.

skill-tester 자체 호출은 본 스킬의 적용 대상이기도 하므로(skill-tester 재시도 = 적용 1번 예시), 본 스킬을 사용한 *첫 번째 실 시도*가 곧 검증 1차 단계가 된다.

### 후속 검증 시나리오

- 시나리오 1: skill-tester 실패 시 본 스킬 적용 → SKILL.md 보완 → 재테스트 → PASS 도달까지 반복
- 시나리오 2: 본문 다듬기 작업에서 AI 패턴 검출 0건 도달까지 반복
- 시나리오 3: 빌드 실패 시 자동 분석·수정·재빌드 반복

위 3개 시나리오 중 *2개 이상*에서 4단계 루프가 정상 작동(종료 조건 도달, 무한 루프 없음, 사용자 보고 정상)하면 APPROVED 전환 검토.

---

## 6. 검증 결과 요약

| 항목 | 내용 |
|------|------|
| 검증 방법 | 내부 워크플로우 구조 검토 + Ouroboros Ralph 컨셉 정합성 점검 |
| 클레임 판정 | 외부 클레임 없음 (내부 워크플로우, 컨셉 출처만 명시) |
| 에이전트 활용 테스트 | 미수행 (워크플로우 카테고리 — 실사용으로 검증) |
| 최종 판정 | **PENDING_TEST** (워크플로우 카테고리 — 실 시나리오 2개 이상에서 정상 작동 확인 후 APPROVED 전환) |

---

## 7. 개선 필요 사항

- [⏸️] 실 시나리오 적용 (skill-tester 재시도, 본문 다듬기, 빌드 에러) — 3건 중 2건 이상 정상 작동 확인 후 APPROVED 전환
- [⏸️] convergence 감지 알고리즘 정밀화 — 현재는 "3회 연속 동일 결과" 휴리스틱. 더 정교한 유사도 측정 도입 가능 (선택 보강)
- [⏸️] 시간/반복/결과 통계 자동 수집 도구 (선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-05-07 | v1 | 최초 작성 — Ouroboros Ralph 컨셉을 우리 프로젝트 컨벤션에 맞게 재정리. 4단계 루프 구조, 안전 장치 4종, 적용 예시 3종 정리 | Claude (Opus 4.7) |
