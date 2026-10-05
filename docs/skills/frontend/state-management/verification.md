---
skill: state-management
category: frontend
version: v4
date: 2026-09-28
status: APPROVED
---

# state-management 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증)
  ├─ frontend-architect 에이전트 테스트 수행
  └─ 테스트 PASS → APPROVED
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | state-management |
| 스킬 경로 | `.claude/skills/state-management/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 검증일 | 2026-09-28 (재검증(2차)) / 2026-08-26 / 2026-06-20 |
| 검증 방법 | frontend-architect 활용 테스트 (v1) → 재검증(2차, 축소 포함) |
| 버전 기준 | Zustand v5.0.15, TanStack Query v5.104.0 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성
- [✅] Claude Code 에이전트에서 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | 상태 선택 기준, Zustand, TanStack Query, Context, Jotai, 의사결정 기준 6개 | 5/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Zustand useShallow 레퍼런스 | https://zustand.docs.pmnd.rs/reference/hooks/use-shallow | ⭐⭐⭐ High |
| TanStack Query v5 마이그레이션 | https://tanstack.com/query/v5/docs/framework/react/guides/migrating-to-v5 | ⭐⭐⭐ High |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (cacheTime→gcTime, onSuccess/onError in useQuery 제거 반영)
- [✅] 버전 명시 (Zustand v5, TanStack Query v5)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)
- [✅] 재테스트 (2026-09-28, skill-tester → general-purpose — TanStack Query 상세 축소 후 링크·잔존 본문 정합성 확인, 2/2 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (frontend-developer 미설치/미등록 세션이라 대체, verification-policy 원칙에 따라 대체 사실 명시)
**수행 방법**: SKILL.md Read 후 실전 질문 2개 답변, 근거 섹션 및 anti-pattern 회피 확인. 특히 2026-09-28 축소(TanStack Query 상세 → `frontend/tanstack-query`·`frontend/tanstack-query-v4-to-v5-migration` 링크 대체) 이후 "링크를 따라가면 답이 나오는지"·"남은 본문끼리 모순 없는지"를 중점 확인

### 실제 수행 테스트

**Q1. TanStack Query `useMutation` 낙관적 업데이트 콜백 시그니처를 이 SKILL.md에서 확인할 수 있는가**
- ✅ PASS
- 근거: SKILL.md "TanStack Query v5 — 이 스킬의 범위" 섹션(172~180행)
- 상세: 에이전트가 "이 SKILL.md 안에서는 확인 불가"라고 정확히 답하고, 175행의 "낙관적 업데이트 콜백 시그니처는 v5.89.0에서 `(err, variables, onMutateResult, context)`로 확장" 문구와 179행 표의 `frontend/tanstack-query` 안내를 근거로 제시. 축소된 상세 절을 되살려 답하려는 시도(할루시네이션) 없이 정본 스킬로 명확히 위임 — 축소가 의도대로 작동함을 확인. gap 없음.

**Q2. 서버 데이터(게시글 목록)와 클라이언트 상태(선택된 게시글 id)를 각각 무엇으로 관리하는지 + 서버 데이터를 Zustand에 저장하면 안 되는 이유**
- ✅ PASS
- 근거: SKILL.md "상태 분류" 표(13~35행), "Zustand + TanStack Query 조합 패턴"(184~212행)
- 상세: 축소되지 않고 유지된 "상태 분류 표"·"조합 패턴" 섹션만으로 정확한 답 도출(게시글 목록→TanStack Query, 선택 id→Zustand, `enabled: !!selectedUserId` 패턴까지 인용). anti-pattern(서버 데이터를 Zustand에 저장, 209~210행)도 정확히 지적. 축소 이후에도 이 스킬 고유 핵심 내용(상태 분류·조합 패턴)은 손상되지 않았음을 확인.

### 발견된 gap (있으면)

- 없음 (경미한 지적: "서버 데이터를 Zustand에 저장하면 안 되는 이유"의 상세 근거(재검증 주기·stale time 등)는 정본 스킬로 위임되어 있어 이 스킬만으로는 한 줄 요약 수준 — 의도된 축소이므로 차단 요인 아님)

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 — 라이브러리/패턴 사용법 스킬(빌드 설정·워크플로우·마이그레이션 아님) → content test PASS만으로 APPROVED 전환 가능한 카테고리
- 최종 상태: APPROVED (축소·재구성 이후 링크 위임 정상 작동 + 잔존 본문 모순 없음 확인)

---

### 테스트 케이스 1: frontend-architect 에이전트 활용 테스트

**테스트 방법:** frontend-architect 에이전트에게 state-management 관련 설계 질문 및 코드 리뷰 요청

**발견 및 수정 사항:**
- useShallow import 경로 오류: `'zustand/shallow'` → `'zustand/react/shallow'` (Zustand v5 공식). 3곳 모두 수정 완료

**판정:** ✅ PASS

---

### [2026-09-28] 재검증(2차) — TanStack Query v5 상세 중복 축소 + 버전 현행화

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 3개를 1차 소스와 대조, 다른 스킬의 참조 여부(`grep -rn "state-management" .claude docs`) 확인 후 중복 상세 축소

**클레임 대조 결과**:
1. Zustand 최신 버전 → VERIFIED (`npm registry zustand@latest` = 5.0.15, 변경 없음)
2. TanStack Query 최신 버전 → VERIFIED (`npm registry @tanstack/react-query@latest` = 5.104.0, 08-26 시점 5.102 대비 갱신)
3. `useShallow` import 경로 `'zustand/react/shallow'` 여전히 유효한가 → VERIFIED (github.com/pmndrs/zustand `docs/reference/hooks/use-shallow.md` 원문 예제 코드로 확인)

**보강(ADD)·축소**: 브리핑 지시에 따라 본문 "## TanStack Query v5"의 상세 절(기본 설정·v4→v5 변경표·Query Key 관리·useQuery 핵심 옵션·useMutation 낙관적 업데이트·useInfiniteQuery·SSR prefetch, 원문 약 172~356행)을 `frontend/tanstack-query`(사용법)·`frontend/tanstack-query-v4-to-v5-migration`(전환)로 가는 링크 표로 대체. 상태 분류 기준(§상태 분류)·조합 패턴(§Zustand + TanStack Query 조합 패턴)·스토어 파일 구조·흔한 실수 패턴은 축소하지 않고 그대로 유지. 다른 파일의 참조 여부는 `grep -rn "state-management" .claude docs`로 확인 — 참조하는 곳은 모두 "상태 분류 기준·Zustand 사용법" 역할로만 이 스킬을 가리키고 있어(섹션 제목·번호 참조 없음, 단순 스킬명 참조) 축소로 깨지는 링크 없음. 부수 효과로, 제거된 useMutation 예시가 쓰던 구식 콜백 시그니처(`onError: (err, newData, context)`, v5.89.0 이전 규약 — `frontend/tanstack-query` verification.md에 기 지적된 불일치)도 함께 해소됨.

**실전 질문 재검증**:
- Q1. "서버에서 온 게시글 목록과, 현재 선택된 게시글 id는 각각 뭘로 관리해야 하나?" → SKILL.md "상태 분류" 표 + "조합 패턴" 예시 근거로 PASS
- Q2. "TanStack Query의 낙관적 업데이트 콜백 시그니처가 궁금한데 이 스킬에 있나?" → SKILL.md가 `frontend/tanstack-query`로 명시적으로 안내(중복 미보유를 스스로 밝힘) — PASS

**재검증 최종 판정**: status **PENDING_TEST 전환** (본문 축소·재구성 — skill-tester 재테스트 필요)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (frontend-architect, v1) / ✅ 재테스트 2/2 PASS (2026-09-28, skill-tester → general-purpose) |
| **최종 판정** | **APPROVED** (2026-09-28 축소·재구성분 skill-tester 재테스트 완료 — 링크 위임 정상, 본문 모순 없음) |

---

## 7. 개선 필요 사항

- 현재 없음

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-03-27 | v1 | 최초 작성 및 frontend-architect 활용 테스트 완료 | frontend-architect 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-06-20 | v3 | 버전 재확인 — 변경 없음 (Zustand 5.0.14, TanStack Query 5.101.0 최신, SKILL.md 내용 이미 적합) | 버전 재검증 |
| 2026-08-26 | v3.1 | freshness 재검증(67일 경과) — Zustand 5.0.15·TanStack Query 5.102.x, API 변경 없음(VERIFIED). v4→v5 표는 신설 `frontend/tanstack-query-v4-to-v5-migration`과 중복되므로 검증일 줄에 정본 포인터 추가(본문 삭제는 별도 정리 과제) | freshness-auditor + orchestrator |
| 2026-09-28 | v4 | 재검증(2차) — Zustand 5.0.15(변경없음)·TanStack Query 5.104.0 확인. 08-26에 남겨둔 "본문 삭제" 과제 실행: TanStack Query v5 상세 절(기본 설정·v4→v5 표·쿼리 키·useQuery 옵션·useMutation·useInfiniteQuery·SSR prefetch)을 `frontend/tanstack-query`·`frontend/tanstack-query-v4-to-v5-migration` 링크로 대체, 구식 낙관적 업데이트 콜백 시그니처 예시도 함께 제거. 상태 분류·조합 패턴·흔한 실수는 그대로 유지 | 재검증(2차) |
| 2026-09-28 | v4 | 2단계 실사용 테스트 재수행 (Q1 낙관적 업데이트 콜백 시그니처 링크 위임 확인 / Q2 상태 분류·조합 패턴·anti-pattern) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
