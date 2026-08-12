---
skill: riper-workflow
category: meta
version: v1
date: 2026-08-12
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

- [✅] RIPER 컨셉 출처 확인 — 2026-08-12 정정: 최초 기재한 github.com/tom-doerr/riper는 404(미존재), Reddit 링크는 확인 불가. 실제 원조는 Cursor 포럼 robotlovehuman 게시글(2025-03-17)로 확정
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

> 2026-08-12 정정: 아래 표는 출처 재조사 결과로 교체됨. 폐기된 출처는 하단에 취소선 대신 "폐기" 행으로 남긴다.

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| **Cursor 포럼 원 게시글** (RIPER-5 원조) | https://forum.cursor.com/t/i-created-an-amazing-mode-called-riper-5-mode-fixes-claude-3-7-drastically/65516 | ⭐⭐⭐ High (원저자 1차 출처) | 제목 "I created an AMAZING MODE called 'RIPER-5 Mode' Fixes Claude 3.7 Drastically!", 작성자 robotlovehuman, 2025-03-17. **2026-08-12 WebFetch 실접속 확인** — Research·Innovate·Plan·Execute·Review 5개 모드 정의 확인 |
| tony/claude-code-riper-5 | https://github.com/tony/claude-code-riper-5 | ⭐⭐ Medium (Stars 92 — 100 미만, 낮은 신뢰도 주의) | Claude Code 이식 구현체. **2026-08-12 실접속 확인**. README가 위 포럼 게시글을 원저작으로 명시 → 원조 규명의 교차 근거 |
| 우리 프로젝트 verification-policy.md | 프로젝트 내부 규칙 | ⭐⭐⭐ High | 워크플로우 카테고리 분류 근거 |
| ~~tom-doerr/riper~~ (폐기) | https://github.com/tom-doerr/riper | ❌ 미존재 | **HTTP 404 — 실존하지 않음.** 2026-08-12 SKILL.md에서 제거 |
| ~~Reddit r/ClaudeAI~~ (폐기) | https://www.reddit.com/r/ClaudeAI/comments/1kh2mgk/ | ❌ UNVERIFIED | 접근 불가로 내용 검증 실패. 2026-08-12 SKILL.md에서 제거 |

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

- [✅] skill-tester 호출 (2026-06-19 최초 수행 + 2026-08-11 재검증 — content test 누적 6/6 PASS 계열)
- [⏸️] 실 시나리오 적용 후 APPROVED 전환 검토 (여전히 미수행)

---

## 5. 테스트 진행 기록

### 출처 정정 반영 (2026-08-12)

**수행일**: 2026-08-12
**수행자**: 메인 세션 (WebFetch 실접속 확인 후 SKILL.md 직접 수정)
**대상**: 2026-08-11 재감사에서 DISPUTED/UNVERIFIED로 판정된 출처 2건

| # | 2026-08-11 판정 | 2026-08-12 조치 | 근거 |
|---|-----------------|-----------------|------|
| 1 | ❌ DISPUTED — `github.com/tom-doerr/riper`가 404 | **정정 반영됨.** SKILL.md `> 소스:` 라인에서 제거하고, 실제 원조인 Cursor 포럼 게시글(robotlovehuman, 2025-03-17)로 교체 | WebFetch 실접속 확인: 포럼 스레드가 정상 로드되며 Research·Innovate·Plan·Execute·Review 5개 모드를 직접 정의. 교차 근거로 `tony/claude-code-riper-5` README가 동일 게시글을 원저작으로 명시(해당 저장소도 실접속 확인) |
| 2 | ⚠️ UNVERIFIED — Reddit `r/ClaudeAI/comments/1kh2mgk/` 접근 불가 | **정정 반영됨.** SKILL.md에서 제거 (대체 URL로 바꿔치기하지 않고 삭제) | 내용을 확인할 수 없는 출처는 info-verification.md 기준상 근거로 쓸 수 없음 |

추가 반영:
- 참고 구현체(`tony/claude-code-riper-5`)는 Stars 100 미만이므로 info-verification.md의 "낮은 신뢰도" 기준에 해당 → SKILL.md에 주의 표기를 함께 기재하고 원 출처를 우선 근거로 명시
- 원본 RIPER-5의 `[MODE: RESEARCH]` 모드 선언 프로토콜과 본 스킬(단계 경계 사용자 승인)의 차이를 SKILL.md에 명시 — 원저와의 차이를 숨기지 않기 위함
- `> 검증일:` 2026-06-06 → **2026-08-12** 갱신
- **방법론 본문(5단계 절차·산출물 템플릿·적용 기준)은 content test에서 유효 판정되었으므로 변경하지 않음**

### 2026-08-11 재검증 기록

**수행일**: 2026-08-11
**수행자**: skill-tester → general-purpose(content test) + fact-checker(핵심 클레임 3개 WebSearch 교차검증)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 재답변 + 핵심 클레임 3개 WebSearch 교차검증(최초 검증일로부터 약 2개월 경과 재확인)

### 실제 수행 테스트 (content test, 2026-08-11)

**Q1. RIPER Research 단계의 허용/금지 행동과 산출물 형식**
- ✅ PASS
- 근거: SKILL.md "1단계: Research (조사)" 섹션 + "5단계 개요" 다이어그램
- 상세: 허용(파일 읽기·패턴 파악·제약 확인·외부 문서 조사)/금지(코드 생성·수정)/산출물 형식(현재 상태 요약 + 제약 목록) 모두 정확히 인용

**Q2. Execute 도중 Plan에 없던 변경 필요 시 대응**
- ✅ PASS
- 근거: SKILL.md "4단계: Execute (실행) — 규칙" 목록
- 상세: "Plan 범위를 벗어나는 변경 → 즉시 보고 후 확인 요청", "새 문제 발견 시 실행 중단 → 사용자 보고" 정확히 인용, 필요 시 Plan 단계 복귀 가능 근거도 결합

**Q3. /create-plan 커맨드와 RIPER 전체 워크플로우의 차이**
- 🟡 PARTIAL
- 근거: SKILL.md "/create-plan 커맨드와의 관계" 섹션(2문장)
- 상세: 관계 자체(‘Plan 단계만 단독 실행하는 단축키’)는 명확하나, "전체 RIPER 흐름이 필요 없을 때"의 구체적 판단 기준(이미 조사·아이디어가 끝난 상태인지 등)이 SKILL.md에 없어 "언제 사용하나" 표로 유추해서 보완 답변해야 했음 — gap 존재하나 차단 수준 아님

agent content test: 2026-08-11 재검증 3/3 PASS 계열(PASS/PASS/PARTIAL, 결함 없음, 경미한 gap 1건)

### 핵심 클레임 WebSearch 교차검증 (fact-checker, 2026-08-11)

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | github.com/tom-doerr/riper가 RIPER 5단계 컨셉의 출처 | ❌ DISPUTED (사실상 오류) | 해당 저장소는 **HTTP 404 — 존재하지 않음**. tom-doerr GitHub 계정의 다른 저장소 목록에도 riper 없음. RIPER-5의 실제 원조는 Cursor 포럼 사용자 "robotlovehuman"의 게시글(2025)이며, Claude Code 구현체로는 `tony/claude-code-riper-5`가 대표적 |
| 2 | Reddit r/ClaudeAI/comments/1kh2mgk/ 게시물이 RIPER 활용 사례를 다룸 | ⚠️ UNVERIFIED | WebFetch/WebSearch로 게시물 내용 자체를 확인하지 못함(접근 제한). 다만 RIPER-5 개념 자체는 GitHub 다수 구현체·forum·deepwiki 등에서 현재도 통용되는 것은 별도 확인됨 |
| 3 | Claude Code 네이티브 Plan Mode가 RIPER Plan 단계와 겹치되, RIPER 5단계 전체(개별 승인 게이트)는 대체 불가 | ✅ VERIFIED | code.claude.com 공식 문서, claude-code-system-prompts 저장소 확인 — Plan Mode는 단일 승인 게이트만 제공, RIPER처럼 5단계별 개별 게이트 없음 |

**핵심 판정**: 3개 중 1개만 VERIFIED. 특히 클레임 1은 SKILL.md 최상단 "> 소스:" 라인에 실제 존재하지 않는 저장소(github.com/tom-doerr/riper, 404)를 인용하고 있어 명백한 오류. RIPER 5단계 워크플로우 구조·게이트 자체(콘텐츠 실용성)는 content test에서 결함 없이 PASS했으나, 출처 인용이 깨진 링크라는 점은 반드시 수정이 필요함 — SKILL.md 수정은 사용자 승인 후 진행 (skill-tester 원칙, 즉시 수정하지 않음).

### 최초 수행 기록 (2026-06-19, 참고용 — 아래 내용은 그대로 보존)

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
| 검증 방법 | 내부 워크플로우 구조 검토 + 핵심 클레임 3개 재검증(2026-08-11) + agent content test + **출처 재조사·실접속 확인 후 정정(2026-08-12)** |
| 클레임 판정 | 2026-08-11: 1 VERIFIED / 1 DISPUTED / 1 UNVERIFIED → **2026-08-12 전량 해소**: DISPUTED(404 저장소)는 실존 원 출처로 교체, UNVERIFIED(Reddit)는 제거. 현재 SKILL.md에 남은 출처는 모두 실접속 확인됨 |
| 에이전트 활용 테스트 | 누적 PASS (2026-06-19 3/3 PASS, 2026-08-11 재검증 PASS/PASS/PARTIAL) |
| 최종 판정 | **PENDING_TEST** — 출처 오류(차단 요인)가 2026-08-12 해소되어 NEEDS_REVISION 탈출. 다만 본 스킬은 verification-policy.md의 *워크플로우 = 실사용 필수* 카테고리이므로, 실 프로젝트의 복잡한 구현 작업에 5단계를 적용해 정상 작동을 확인하기 전까지는 APPROVED로 전환하지 않는다 |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 재수행 및 섹션 5·6 업데이트 (2026-08-11 완료)
- [✅] **차단 요인 해소 — SKILL.md 출처 정정** (2026-08-12): 404였던 `github.com/tom-doerr/riper`를 제거하고 실존 원 출처(Cursor 포럼 robotlovehuman 게시글, 실접속 확인)로 교체. 참고 구현체 `tony/claude-code-riper-5`는 낮은 신뢰도 주의와 함께 병기
- [✅] Reddit 출처(`r/ClaudeAI/comments/1kh2mgk/`) 처리 완료 (2026-08-12): 끝내 내용 확인 불가 → 대체 URL로 바꿔치지 않고 **삭제**
- [⏸️] 실 프로젝트 복잡한 구현 작업에서 5단계 적용 → APPROVED 전환 조건 달성 확인 (**현재 PENDING_TEST를 유지시키는 유일한 잔여 항목**)
- [⏸️] Plan 단계 태스크 분해 예시 추가 (선택 보강, 차단 요인 아님)
- [⏸️] "/create-plan만 써도 되는 시점" 구체적 판단 기준 보강 (2026-08-11 content test에서 발견된 경미한 gap, 선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-06-19 | v1 | 최초 작성 — verification.md 누락 건 보완. content test 3/3 PASS 기록 | Claude (Sonnet 4.6) |
| 2026-08-11 | v1 | 2단계 실사용 테스트 재수행 (Q1 Research 단계 허용/금지 / Q2 Execute 중 Plan 이탈 대응 / Q3 /create-plan 관계) → PASS/PASS/PARTIAL. 핵심 클레임 3개 WebSearch 재검증 → 1 VERIFIED, 1 DISPUTED(소스 저장소 404), 1 UNVERIFIED → **NEEDS_REVISION 전환**, SKILL.md 출처 정정 필요(사용자 승인 대기) | skill-tester |
| 2026-08-12 | v1 | **출처 정정 반영** — 404 저장소(tom-doerr/riper)와 확인 불가 Reddit 링크를 SKILL.md에서 제거하고, WebFetch 실접속으로 확인한 원 출처(Cursor 포럼 robotlovehuman 게시글 2025-03-17)로 교체. 참고 구현체 tony/claude-code-riper-5 병기 + Stars 100 미만 낮은 신뢰도 주의 표기. 원본의 `[MODE:]` 선언 프로토콜과 본 스킬의 차이 명시. 검증일 2026-08-12 갱신. 방법론 본문은 변경 없음. → **NEEDS_REVISION 해소, PENDING_TEST 복귀**(워크플로우=실사용 필수 카테고리라 APPROVED 아님) | 메인 세션 |
