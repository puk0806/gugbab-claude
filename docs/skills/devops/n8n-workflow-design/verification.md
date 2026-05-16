---
skill: n8n-workflow-design
category: devops
version: v1
date: 2026-05-15
status: APPROVED
---

# n8n-workflow-design 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `n8n-workflow-design` |
| 스킬 경로 | `.claude/skills/devops/n8n-workflow-design/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (Claude Opus 4.7) |
| 스킬 버전 | v1 |
| 카테고리 분류 | content test 가능 (라이브러리/패턴 설명 스킬) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (`docs.n8n.io`)
- [✅] 공식 GitHub 2순위 소스 확인 (`github.com/n8n-io/n8n`)
- [✅] 최신 버전 기준 내용 확인 (2026-05-15 기준, Code 노드 0.198.0+ 도입, Python 1.0+ 지원)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (16개 섹션)
- [✅] 코드 예시 작성 (Code 노드 두 모드 예시, 표현식 예시)
- [✅] 흔한 실수 패턴 정리 (7개 함정)
- [✅] SKILL.md 파일 작성
- [✅] 짝 스킬 4종 명시 (`devops/n8n-self-hosting`, `devops/n8n-llm-integration`, `devops/n8n-webhook-patterns`, `devops/n8n-error-handling`)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "n8n workflow nodes documentation 2026 core concepts" | docs.n8n.io 공식 문서 10건, 핵심 4개 카테고리 (Triggers/Actions/Core/Cluster) 확인 |
| 조사 | WebSearch | "n8n expressions data flow item array $json syntax" | item 배열 구조, `$json` 정의, 표현식 `{{ }}` 문법 확인 |
| 조사 | WebFetch | docs.n8n.io/workflows/components/nodes/ | Workflow/Node/Connection/Execution/Item 정의 추출 |
| 조사 | WebFetch | docs.n8n.io/data/data-structure/ | item 배열 + json/binary/pairedItem 필드 구조 확인 |
| 조사 | WebSearch | "n8n IF node Switch node Merge node conditional branching" | IF/Switch/Merge 동작, IF+Merge 부작용 확인 |
| 조사 | WebSearch | "n8n SplitInBatches Loop Over Items sub-workflow Execute Workflow" | Loop Over Items = Split in Batches, 배치 크기 동작 확인 |
| 조사 | WebSearch | "n8n Code node JavaScript Set Edit Fields Function deprecated" | Code 노드가 0.198.0에서 Function 노드 대체, Edit Fields = Set 별칭 확인 |
| 조사 | WebSearch | "n8n best practices error handling workflow sticky note credentials" | Error Workflow, Sticky Note, Credentials Manager 모범 사례 확인 |
| 조사 | WebFetch | docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/ | Code 노드 페이지 구조 확인 (상세는 후속 검색 보완) |
| 조사 | WebFetch | docs.n8n.io/flow-logic/error-handling/ | Error Trigger, Error Workflow, Stop And Error 노드 확인 |
| 교차 검증 | WebSearch | "Run Once for All Items vs Each Item return format" | 두 모드 반환 형식 차이 (배열 vs 단일 객체) 확인 |
| 교차 검증 | WebSearch | "n8n webhook trigger schedule trigger cron syntax" | Cron 5필드 형식, Test/Production URL 구분, timezone 동작 확인 |
| 교차 검증 | WebSearch | "n8n $node expression syntax referencing previous node data" | `$node[...]` (레거시) vs `$('NodeName')` (신규) 문법 차이 확인 |
| 교차 검증 | WebSearch | "n8n Function node deprecated 0.198 Code node replacement" | 0.198.0 버전 deprecation 사실 재확인 + Python 1.0 지원 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| n8n Docs — Nodes | https://docs.n8n.io/workflows/components/nodes/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 (1순위) |
| n8n Docs — Data Structure | https://docs.n8n.io/data/data-structure/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Expressions | https://docs.n8n.io/data/expressions/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Expression Reference | https://docs.n8n.io/data/expression-reference/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Referencing previous nodes | https://docs.n8n.io/data/data-mapping/referencing-other-nodes/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Code node (concept) | https://docs.n8n.io/code/code-node/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Code node (reference) | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Edit Fields (Set) | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — IF node | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Switch node | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.switch/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Loop Over Items | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Looping | https://docs.n8n.io/flow-logic/looping/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Error handling | https://docs.n8n.io/flow-logic/error-handling/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Schedule Trigger | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Webhook node | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Execute Sub-workflow | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |

### 교차 검증한 핵심 클레임

| 클레임 | 1차 소스 | 2차 소스 | 판정 |
|--------|----------|----------|------|
| n8n 노드 간 데이터는 항상 JSON 객체의 배열(item 배열) | docs.n8n.io/data/data-structure/ | n8narena 치트시트, scriflow 가이드 | **VERIFIED** |
| `$json`은 현재 노드의 현재 item JSON | docs.n8n.io 표현식 레퍼런스 | Medium "Mastering Code Node" | **VERIFIED** |
| Code 노드가 0.198.0부터 Function/Function Item 노드 대체 | docs.n8n.io Code 노드 페이지 | n8n 커뮤니티 공지 | **VERIFIED** |
| Code 노드 Python 지원은 1.0부터 (Pyodide) | docs.n8n.io/code/code-node/ | 검색 결과 다수 | **VERIFIED** |
| Run Once for All Items 반환은 배열, Each Item 반환은 단일 객체 | n8n 공식 Code 문서 + 커뮤니티 | Medium 가이드 | **VERIFIED** |
| Schedule Trigger는 5필드 Cron, 6번째 필드(초)는 선택 | docs.n8n.io ScheduleTrigger | aiworkflowsautomation 가이드 | **VERIFIED** |
| Webhook은 Test URL과 Production URL이 분리, 활성화 후 Production 사용 | docs.n8n.io Webhook | community 다수 답변 | **VERIFIED** |
| IF + Merge 조합 시 양쪽 분기가 모두 실행되는 부작용 가능 | docs.n8n.io Merge | n8n 커뮤니티 Q&A | **VERIFIED** |
| `$('NodeName')`이 신규 권장 문법, `$node[...]`는 레거시 호환 | docs.n8n.io referencing-other-nodes | n8n GitHub issue #13418 | **VERIFIED** |
| Error Workflow는 Error Trigger로 시작하는 별도 워크플로우 | docs.n8n.io/flow-logic/error-handling/ | hostinger 가이드 | **VERIFIED** |
| Loop Over Items 기본 배치 크기 = 1 | docs.n8n.io SplitInBatches | hostinger 튜토리얼 | **VERIFIED** |

**판정 요약**: VERIFIED 11 / DISPUTED 0 / UNVERIFIED 0

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Code 노드 0.198.0+, Python 1.0+)
- [✅] deprecated된 패턴을 권장하지 않음 (Function 노드 대신 Code 노드 안내)
- [✅] 코드 예시가 실행 가능한 형태임 (Code 노드 두 모드 모두 정확한 반환 형식)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (> 소스: / > 검증일: 줄)
- [✅] 핵심 개념 설명 포함 (16개 섹션)
- [✅] 코드 예시 포함 (Code 노드, 표현식, 매핑/필터)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (IF vs Switch, 자동 반복 vs Loop)
- [✅] 흔한 실수 패턴 포함 (7개 함정)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 워크플로우 설계에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 필요 없음, 3/3 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (직접 SKILL.md 대조 검증)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부·anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Code 노드 "Run Once for All Items" 모드에서 반환 형식 (Item 배열 vs 단일 객체 함정)**
- PASS
- 근거: SKILL.md "5. 변환 노드 - 실행 모드 2가지" 표 + 예시 코드(라인 146–151) + "16. 흔한 함정 §1"
- 상세: Run Once for All Items 모드에서는 `return [{ json: {...} }]` 배열 형태로 반환해야 하며, 단일 객체 반환이 데이터 손실을 초래한다는 내용이 예시 코드 + 함정 섹션에 명확히 기술됨. `$input.all()` + `.map()` 패턴도 정확히 기술됨.

**Q2. `$node["Get User"].json` vs `$('Get User').item.json` 참조 문법**
- PASS
- 근거: SKILL.md "4. 데이터 흐름 - 데이터 참조" 표 + 권장 메모(라인 117) + "12. 표현식" 예시(라인 329)
- 상세: `$('NodeName').item.json`이 신규 권장 문법, `$node["NodeName"].json`이 레거시임을 명시. 신규 문법이 item 페어링을 더 정확히 다룬다는 이유까지 설명됨. 섹션 12에 `{{ $('Get User').item.json.name }}` 구체 예시도 존재.

**Q3. Sub-workflow 측 "Execute Workflow Trigger" 설정 필수**
- PASS
- 근거: SKILL.md "10. 워크플로우 재사용 - Sub-workflow 측 설정" (라인 291–293)
- 상세: sub-workflow는 반드시 "Execute Workflow Trigger"(또는 "Execute Sub-workflow Trigger") 노드를 트리거로 사용해야 한다는 내용이 명확히 기술됨. Run Once for All Items 모드 안에서 item별 반복이 필요하면 sub-workflow 내부에서 Loop Over Items를 명시적으로 사용해야 한다는 주의사항도 포함됨.

### 발견된 gap

없음. 3개 질문 모두 근거가 SKILL.md 내에 명확히 존재하며 anti-pattern(단일 객체 반환, 레거시 문법 사용, 트리거 미설정)이 올바르게 회피됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: content test 가능 (라이브러리/패턴 설명 스킬) — "실사용 필수" 카테고리 해당 없음
- 최종 상태: APPROVED

---

> 아래는 skill-creator가 남긴 원본 참고 안내 (보존):
> skill-creator 작성 직후, skill-tester 메인 호출 예정. 본 섹션은 skill-tester가 채워 넣는다.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-15 3/3 PASS) |
| **최종 판정** | **APPROVED** |

content test 가능 카테고리 (라이브러리/패턴 설명) — skill-tester content test 3/3 PASS → APPROVED 전환 완료.

---

## 7. 개선 필요 사항

- [x] skill-tester 호출 후 섹션 5·6 갱신 (2026-05-15 완료, 3/3 PASS)
- [ ] 짝 스킬 4종(`n8n-self-hosting`, `n8n-llm-integration`, `n8n-webhook-patterns`, `n8n-error-handling`) 작성 후 상호 링크 검증 — 차단 요인 아님, 선택 보강 (짝 스킬 미작성이어도 본 스킬 단독 사용에 지장 없음)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (16개 섹션, 11개 핵심 클레임 교차 검증 VERIFIED) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 Code 노드 반환 형식 / Q2 `$('NodeName')` vs `$node[...]` 참조 문법 / Q3 Sub-workflow Execute Workflow Trigger 설정) → 3/3 PASS, APPROVED 전환 | skill-tester |
