---
skill: riper-workflow
category: meta
version: v1
date: 2026-06-06
status: PENDING_TEST
---

# 스킬 검증 문서: riper-workflow

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `riper-workflow` |
| 스킬 경로 | `.claude/skills/meta/riper-workflow/SKILL.md` |
| 검증일 | 2026-06-06 |
| 검증자 | Claude (Sonnet 4.6) |
| 스킬 버전 | v1 |
| 카테고리 | 워크플로우 (실사용 필수) |

---

## 1. 작업 목록

- [✅] RIPER 컨셉 출처 확인 (github.com/tom-doerr/riper, Reddit r/ClaudeAI)
- [✅] 5단계(Research→Innovate→Plan→Execute→Review) 구조 정리
- [✅] 단계별 사용자 승인 게이트 명시
- [✅] 적합/부적합 사용 기준 정리
- [✅] /create-plan 커맨드와의 관계 명시
- [✅] SKILL.md 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|----------|----------|
| 조사 | WebFetch | github.com/tom-doerr/riper | RIPER 5단계 워크플로우 컨셉 확인 |
| 조사 | WebFetch | reddit.com/r/ClaudeAI/comments/1kh2mgk/ | 커뮤니티 활용 사례 확인 |
| 작성 | Write | .claude/skills/meta/riper-workflow/SKILL.md | 5단계 구조 + 게이트 + 적용 기준 정리 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| tom-doerr/riper GitHub | https://github.com/tom-doerr/riper | ⭐⭐ Medium | RIPER 컨셉 원출처 |
| Reddit r/ClaudeAI | https://www.reddit.com/r/ClaudeAI/comments/1kh2mgk/ | ⭐⭐ Medium | 커뮤니티 활용 사례 |
| 우리 프로젝트 verification-policy.md | 프로젝트 내부 규칙 | ⭐⭐⭐ High | 워크플로우 카테고리 분류 근거 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] RIPER 5단계 명칭 및 순서 올바름 (Research→Innovate→Plan→Execute→Review)
- [✅] 단계별 금지 사항 명시 (Research 단계: 코드 생성·수정 금지 등)
- [✅] 단계 전환 시 사용자 승인 요구
- [✅] 이전 단계 복귀 가능 명시

### 4-2. 구조 완전성

- [✅] YAML frontmatter (name, description, user-invocable, disable-model-invocation)
- [✅] 소스 URL과 검증일 명시
- [✅] 언제 사용 / 언제 사용하지 않을지 기준
- [✅] 5단계 산출물 형식 (출력 템플릿 포함)
- [✅] /create-plan 커맨드와의 관계 명시

### 4-3. 실용성

- [✅] "30분 이상 소요될 작업"이라는 적용 기준 명확
- [✅] 각 단계 금지 사항이 구체적으로 명시됨
- [✅] 출력 형식 정의 (단계 완료 후 보고 템플릿)

### 4-4. 에이전트 활용 테스트

- [⏸️] skill-tester 호출 (워크플로우 카테고리 — 실사용으로 검증)
- [⏸️] 실 시나리오 적용 후 APPROVED 전환 검토

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-19
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변

Q1. "새 기능 구현 요청이 왔을 때 RIPER에서 첫 단계는 무엇이고, 이 단계에서 금지되는 행동은?" — PASS (SKILL.md Research 단계: 코드 생성·수정 금지, 파일 읽기·파악만)

Q2. "Innovate 단계에서 산출물 형식은? 몇 개의 접근법을 제시해야 하나?" — PASS (SKILL.md: 접근법 2~3개, 장단점·트레이드오프, 권장 방향 + 근거)

Q3. "Execute 도중 Plan 범위를 벗어나는 변경이 필요하면 어떻게 해야 하나?" — PASS (SKILL.md: 즉시 보고 후 확인 요청)

agent content test: 3/3 PASS

---

## 6. 검증 결과 요약

| 항목 | 내용 |
|------|------|
| 검증 방법 | 내부 워크플로우 구조 검토 + RIPER 컨셉 출처 정합성 점검 |
| 클레임 판정 | 외부 API 클레임 없음 (워크플로우 방법론) |
| 에이전트 활용 테스트 | 3/3 PASS (content test) |
| 최종 판정 | **PENDING_TEST** (워크플로우 카테고리 — 실 프로젝트에서 5단계 루프 1회 이상 적용 후 APPROVED 전환 검토) |

---

## 7. 개선 필요 사항

- [⏸️] 실 프로젝트 복잡한 구현 작업에서 5단계 적용 → APPROVED 전환 조건 달성 확인
- [⏸️] Plan 단계 태스크 분해 예시 추가 (선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-06-19 | v1 | 최초 작성 — verification.md 누락 건 보완. content test 3/3 PASS 기록 | Claude (Sonnet 4.6) |
