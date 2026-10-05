---
skill: n8n-workflow-design
category: devops
version: v2
date: 2026-09-28
status: APPROVED
---

# n8n-workflow-design 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `n8n-workflow-design` |
| 스킬 경로 | `.claude/skills/n8n-workflow-design/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-05-15, 2026-09-28 재검증) |
| 검증자 | skill-creator (Claude Opus 4.7) → Claude (Sonnet 5, 2026-09-28 재검증) |
| 스킬 버전 | v2 (2026-09-28 재검증 정정 반영) |
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
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 skill-tester 수행, 2026-09-28 재검증 정정 반영 후 재테스트 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 필요 없음, 2026-05-15 3/3 PASS + 2026-09-28 재테스트 2/2 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (devops 도메인 전용 에이전트 미등록으로 대체)
**수행 방법**: 2026-09-28 재검증에서 정정된 내용(§3/§11/§15/§16 — Active 토글→Save/Publish 분리, Code 노드 `$env` 기본 차단)이 실전 질문에 올바르게 반영되는지 SKILL.md Read 후 2개 질문 답변으로 재확인

### 실제 수행 테스트 (재테스트)

**Q1. Schedule Trigger 워크플로우를 Save만 하고 Publish 안 한 상태에서 자동 실행되는가**
- ✅ PASS
- 근거: SKILL.md "3. 트리거 노드 — Schedule Trigger" 주의문(줄 75), "15. 모범 사례" 표(줄 394), "16. 흔한 함정 §5"(줄 433-435)
- 상세: "Save만으로는 프로덕션에 반영되지 않고 게시(Publish)해야 자동 실행된다"는 정정된 답을 정확히 도출. 세 섹션 서술이 서로 일관되며 옛 "Active" 서술과 충돌 없음(모두 "n8n 2.x — 구버전 Active와 동일 취지"로 병기).

**Q2. Code 노드에서 `process.env.API_KEY`가 undefined로 나오는 원인**
- ✅ PASS
- 근거: SKILL.md "11. 변수·환경 — Credentials와 Variables" 주의문(줄 305, 309)
- 상세: n8n 2.x부터 Code 노드가 task runner 격리 실행이 기본이며 `N8N_BLOCK_ENV_ACCESS_IN_NODE` 기본값이 `true`로 바뀌어 차단된다는 정정 내용을 정확히 인용. 해결책(`N8N_BLOCK_ENV_ACCESS_IN_NODE=false` 명시 또는 Credentials 우선 사용)까지 도출. 표현식 필드의 `{{ $env.VAR }}`는 이 제한과 별개라는 구분도 정확히 반영.

### 발견된 gap (재테스트, 경미·선택 보강)

- Q1: Publish 버튼의 정확한 UI 위치, 재게시 시 다음 실행 시각 처리 방식은 SKILL.md에 없음 (경미, 선택 보강)
- Q2: `N8N_BLOCK_ENV_ACCESS_IN_NODE` 값을 실제로 어디서(환경변수 파일·Docker Compose 등) 설정하는지는 짝 스킬 `devops/n8n-self-hosting` 범위로 위임되어 있어 본 스킬만으로는 답할 수 없음 (설계상 의도된 역할 분리, 차단 아님)

### 재테스트 판정

- agent content test: 2/2 PASS
- verification-policy 분류: content test로 충분 (n8n 워크플로우 설계 패턴 가이드 — 답변 정확성으로 검증 가능, 빌드/실행 산출물 검증이 필요한 "워크플로우 스킬"(CI/CD 등) 카테고리와는 다름 — 사용자의 실제 n8n 실행 로그가 아니라 공식 문서 대조로 정확성 검증 가능하므로 "실사용 필수" 해당 없음)
- 최종 상태: APPROVED (기존 2026-05-15 3/3 PASS + 금번 재테스트 2/2 PASS, 정정 반영 확인 완료)

---

### [2026-05-15] 최초 테스트

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

### [2026-09-28] 재검증 — n8n 메이저 버전 2.x 승격, Save/Publish 모델·Code 노드 격리 실행 변경 발견 (PENDING_TEST 전환)

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 5개를 docs.n8n.io 공식 changelog·블로그·커뮤니티 교차 검증으로 재대조.

**클레임 대조 결과**:
1. n8n 최신 메이저 버전 1.x → **DISPUTED(정정)**: docs.n8n.io changelog에 "Release notes 2.x" 페이지 신설 확인 — 2026-05-15 이후 메이저 버전 2.0 출시 (소스: docs.n8n.io/changelog/release-notes-2.x)
2. "저장 + 활성화(Active)"로 프로덕션 즉시 반영 → **DISPUTED(정정)**: n8n 2.0부터 Save(초안 보존)/Publish(라이브 반영) 모델로 분리, Schedule Trigger·Webhook 모두 Publish해야 프로덕션 동작 (소스: blog.n8n.io/introducing-n8n-2-0/, n8n 커뮤니티 포럼 다수 확인)
3. Code 노드에서 `{{ $env.VAR_NAME }}` 자유롭게 접근 가능 → **DISPUTED(정정)**: n8n 2.0부터 Code 노드는 task runner(격리 환경)에서 기본 실행되며 `N8N_BLOCK_ENV_ACCESS_IN_NODE` 기본값이 `true`로 바뀌어 Code 노드 내부 `$env`/`process.env` 접근이 기본 차단됨 (소스: n8n 공식 hosting 문서 task-runners.md, GitHub issue #29603/커뮤니티 확인)
4. `$('NodeName')` 신규 문법 vs `$node[...]` 레거시 — VERIFIED (변경 근거 없음, 유지)
5. Loop Over Items 기본 배치 크기 1, IF 2-출력/Switch 4+-출력, Merge 부작용 — VERIFIED (n8n 2.0 changelog에 관련 breaking change 언급 없음, 유지)

**실전 질문 재검증**:
- Q1. "n8n 2.x에서 워크플로우를 저장만 하면 Webhook production URL이 바로 동작하는가?" → 정정 전 SKILL.md 기준 "활성화하면 됨"으로 오답 유도 — 정정 후 "Publish까지 해야 동작" 근거로 PASS
- Q2. "Code 노드에서 `process.env.API_KEY`를 읽으려는데 에러가 난다" → 정정 후 SKILL.md 11절 "N8N_BLOCK_ENV_ACCESS_IN_NODE 기본 차단" 근거로 원인 설명 PASS

**재검증 최종 판정**: 핵심 클레임 5건 중 3건 DISPUTED(메이저 버전 2.x 승격·Save/Publish 모델 전환·Code 노드 환경변수 기본 차단) 정정 반영, 2건 VERIFIED(변경 없음). 워크플로우 활성화 모델이라는 핵심 개념이 바뀌어 실전 질문 결과가 달라지므로 status **PENDING_TEST 전환**(메인 대화가 skill-tester로 재테스트 수행 필요).

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
| 에이전트 활용 테스트 | ✅ (2026-05-15 3/3 PASS, 2026-09-28 정정 반영 후 재테스트 2/2 PASS) |
| **최종 판정** | **APPROVED** (2026-09-28 재검증에서 n8n 2.x Save/Publish 모델·Code 노드 환경변수 차단 등 정정 반영 후 skill-tester 재테스트 2/2 PASS로 재승인) |

content test 가능 카테고리 (라이브러리/패턴 설명) — 2026-05-15 skill-tester content test 3/3 PASS로 APPROVED 전환, 2026-09-28 재검증에서 핵심 클레임 정정으로 PENDING_TEST 재전환했다가, 같은 날 skill-tester 재테스트 2/2 PASS로 APPROVED 재전환.

---

## 7. 개선 필요 사항

- [✅] skill-tester 호출 후 섹션 5·6 갱신 (2026-05-15 완료, 3/3 PASS)
- [✅] 2026-09-28 재검증 정정(Save/Publish 분리, Code 노드 `$env` 차단) 반영 후 skill-tester 재테스트 및 섹션 5·6·7·8 동기화 (2026-09-28 완료, 2/2 PASS)
- [ ] 짝 스킬 4종(`n8n-self-hosting`, `n8n-llm-integration`, `n8n-webhook-patterns`, `n8n-error-handling`) 작성 후 상호 링크 검증 — 차단 요인 아님, 선택 보강 (짝 스킬 미작성이어도 본 스킬 단독 사용에 지장 없음)
- [ ] Publish 버튼 UI 위치·재게시 시 다음 실행 시각 처리, `N8N_BLOCK_ENV_ACCESS_IN_NODE` 설정 위치(짝 스킬 `n8n-self-hosting` 범위) 보강 — 차단 요인 아님, 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (16개 섹션, 11개 핵심 클레임 교차 검증 VERIFIED) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 Code 노드 반환 형식 / Q2 `$('NodeName')` vs `$node[...]` 참조 문법 / Q3 Sub-workflow Execute Workflow Trigger 설정) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-28 | v2 | 재검증 — n8n 메이저 버전 1.x→2.x 승격 확인, 핵심 클레임 3건 DISPUTED 정정: "저장+활성화(Active)" 즉시 반영 모델 → Save(초안)/Publish(라이브) 분리 모델(§3 Schedule Trigger·Webhook 사용 순서, §15 모범 사례, §16 함정5), Code 노드 `$env` 자유 접근 → task runner 격리 실행 기본 + `N8N_BLOCK_ENV_ACCESS_IN_NODE` 기본 차단(§11). status APPROVED → PENDING_TEST(재테스트 필요) | Claude (Sonnet 5) |
| 2026-09-28 | v2 | 2단계 실사용 재테스트 수행 (Q1 Schedule Trigger Save만으로 자동 실행 여부 / Q2 Code 노드 `process.env` undefined 원인) → 2/2 PASS, 정정 내용이 형제 스킬과 모순 없이 반영됨을 확인, PENDING_TEST → APPROVED 전환 | skill-tester |
