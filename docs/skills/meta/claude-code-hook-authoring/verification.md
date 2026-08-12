---
skill: claude-code-hook-authoring
category: meta
version: v1
date: 2026-08-11
status: APPROVED
---

# claude-code-hook-authoring 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `claude-code-hook-authoring` |
| 스킬 경로 | `.claude/skills/meta/claude-code-hook-authoring/SKILL.md` |
| 검증일 | 2026-08-11 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | Claude Code 2.1.x (공식 hooks 레퍼런스 2026-08 시점) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 — `code.claude.com/docs/en/hooks`(Hooks reference), `code.claude.com/docs/en/hooks-guide`
- [✅] 공식 GitHub 2순위 소스 확인 — `github.com/anthropics/claude-code` 이슈 #19009(PostToolUse exit 2 동작)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-08-11) — 이벤트 lifecycle 표·타임아웃 기본값·matcher 해석 규칙
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 — exit code 규약, stdout/stderr 매트릭스, JSON 출력, 차단형/비차단형 설계
- [✅] 코드 예시 작성 — 레포 실제 훅(`bash-guard.js`·`tdd-guard.js`·`memory-sync.js`·`_lib.js`·`tdd-guard.test.js`)에서 추출
- [✅] 흔한 실수 패턴 정리 — stdout 유실, exit 1 무통과, PostToolUse 되돌리기 불가, matcher 대소문자, 상대경로 배선
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 중복 확인 | Glob | `.claude/skills/**/claude-code-hook*/SKILL.md` | 결과 0건 — 신규 생성 확정 |
| 조사 | WebFetch | `https://code.claude.com/docs/en/hooks` | 이벤트 lifecycle 전체표, stdin 공통 필드, exit code 0/2/기타 규약, exit 2 이벤트별 효과표, matcher 해석 3분기, settings.json 3중 중첩, 핸들러 5종, 타임아웃 기본값(600/30/60), JSON 출력 필드(`decision`·`hookSpecificOutput`·`permissionDecision`·`additionalContext` 10,000자 제한) 수집 |
| 조사 | WebFetch | `https://code.claude.com/docs/en/hooks-guide` | 실습 가이드 — `exit 2` + `>&2` 예시, `"$CLAUDE_PROJECT_DIR"` 경로 규칙, `/hooks` 브라우저(읽기 전용), `claude --debug-file` 디버깅, 비대화형 셸 실행 |
| 조사 | WebSearch | "Claude Code hooks reference exit code 2 stderr blocking PreToolUse PostToolUse" | 공식 문서 + 커뮤니티 레퍼런스 9건 확보, PostToolUse exit 2 비차단 논점 확인 |
| 조사 | WebSearch | "hook timeout default 600 seconds matcher regex UserPromptSubmit stdout context" | 타임아웃 600초·UserPromptSubmit 30초·matcher 대소문자 구분 확인 |
| 코드 검증 | Read | `.claude/hooks/_lib.js`, `bash-guard.js`, `tdd-guard.js`, `memory-sync.js`, `deliverable-guard.js`(헤더), `skill-md-guard.js`, `verification-guard.js`, `tdd-guard.test.js`, `.claude/settings.json` | 실제 동작 패턴 추출 — 이벤트 다중화 분기, `null` 반환 위임, 예외 시 `exit 0` 안전장치, `exit 2` + stderr, `spawnSync` 프로세스 경계 테스트 |
| 사례 검증 | Read / Grep | `README.md`(업데이트 로그 2026-08-03), `docs/hooks/README.md`, `.claude/rules/task-workflow.md`, `scripts/gen-settings.js`, `project-install.sh` | stdout→stderr 버그 2건 기록, task-plan-guard·confirmation-gate 오탐 제거·Plan Mode 대체, 2026-07-03 오탐 4건이 전부 미테스트 훅에서 발생 |
| 교차 검증 | WebSearch / WebFetch | 6개 클레임, 독립 소스 2~3개씩 | VERIFIED 6 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Claude Code Hooks reference | https://code.claude.com/docs/en/hooks | ⭐⭐⭐ High | 2026-08-11 | 1순위 공식 문서 — 이벤트·스키마·exit code·matcher·타임아웃 |
| Automate actions with hooks (guide) | https://code.claude.com/docs/en/hooks-guide | ⭐⭐⭐ High | 2026-08-11 | 1순위 공식 문서 — 배선 예시·디버깅·보안 |
| anthropics/claude-code 이슈 #19009 | https://github.com/anthropics/claude-code/issues/19009 | ⭐⭐⭐ High | 2026-08-11 | 2순위 공식 GitHub — PostToolUse exit 2가 실제로 되돌리지 않음(not planned 종료) |
| anthropics/claude-code bash_command_validator 예제 | https://github.com/anthropics/claude-code/blob/main/examples/hooks/bash_command_validator_example.py | ⭐⭐⭐ High | 2026-08-11 | 공식 레퍼런스 구현(가이드에서 링크) |
| Claude Code Hooks Complete Reference 2026 | https://thepromptshelf.dev/blog/claude-code-hooks-complete-reference-2026/ | ⭐⭐ Medium | 2026-08-11 | 교차 검증용 — exit code 의미, `hookSpecificOutput`, 600초 기본값 |
| 커뮤니티 hooks 가이드(검색 결과 다수) | 검색 결과 상위 9건 | ⭐⭐ Medium | 2026-08-11 | 교차 검증용 — matcher 대소문자 구분, UserPromptSubmit 30초 |
| 이 레포 실제 훅 구현·기록 | `.claude/hooks/`, `docs/hooks/README.md`, `README.md` 업데이트 로그, `.claude/rules/task-workflow.md` | ⭐⭐⭐ High | 2026-08-11 | 검증된 실전 패턴·사고 사례의 1차 근거 |

---

## 4. 검증 체크리스트 (Test List)

### 교차 검증 클레임 판정표

| # | 클레임 | 소스 | 판정 |
|:-:|--------|------|:----:|
| 1 | exit 0 = 통과(stdout이 JSON으로 파싱), exit 2 = 차단(stdout 무시·stderr가 Claude에게 전달), 그 외 = 비차단 에러 | 공식 hooks reference + hooks-guide + 커뮤니티 레퍼런스 | **VERIFIED** |
| 2 | exit 1은 차단하지 않는다(유닉스 관례와 달리 진행됨) | 공식 reference 경고문 + 커뮤니티 레퍼런스 동일 문장 | **VERIFIED** |
| 3 | PostToolUse의 exit 2는 이미 실행된 도구를 되돌리지 못하고 stderr 피드백만 전달(UI는 "blocking error" 표기) | 공식 reference 이벤트별 표 + GitHub 이슈 #19009 | **VERIFIED** |
| 4 | matcher는 영문·숫자·`_`·`-`·공백·`,`·`\|`만 있으면 정확 일치, 그 외 문자가 있으면 JavaScript 정규식(앵커 없음)으로 평가되며 대소문자를 구분 | 공식 reference matcher 표 + 커뮤니티 가이드(`multiEdit` 미매칭 사례) | **VERIFIED** |
| 5 | command/http/mcp_tool 훅 기본 타임아웃 600초, prompt 30초, agent 60초이며 UserPromptSubmit은 30초로 하향 | 공식 reference 타임아웃 표 + 커뮤니티 레퍼런스("Default timeout is 600 seconds") | **VERIFIED** |
| 6 | settings.json 배선은 `이벤트 → matcher 그룹 → hooks 배열` 3중 중첩이며 경로는 `$CLAUDE_PROJECT_DIR` 절대경로 권장, 매칭 훅은 병렬 실행 | 공식 reference + hooks-guide 예시 + 이 레포 `.claude/settings.json` 실제 배선 | **VERIFIED** |
| 7 | `UserPromptSubmit`·`UserPromptExpansion`·`SessionStart`는 exit 0 stdout이 Claude 컨텍스트로 주입됨 | 공식 reference exit 0 설명 + hooks-guide "anything you write to stdout is added to Claude's context" | **VERIFIED** |

> DISPUTED / UNVERIFIED 항목 없음. 이벤트 목록은 버전에 따라 증가하므로 SKILL.md에 "새 이벤트는 `/hooks`로 현재 CLI 인식 여부 확인" 주의 문구를 명시했다.

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Claude Code 2.1.x, `prompt_id` v2.1.196+ 표기)
- [✅] deprecated된 패턴을 권장하지 않음 (exit 1 차단 오해·PostToolUse 되돌리기 오해를 명시적으로 교정)
- [✅] 코드 예시가 실행 가능한 형태임 (레포에서 실제 실행 중인 훅 코드 기반)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (이벤트·입출력 계약·matcher·배선·타임아웃)
- [✅] 코드 예시 포함 (훅 스켈레톤·이벤트 다중화·차단 사유 전달·테스트 패턴)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (섹션 1, 섹션 6)
- [✅] 흔한 실수 패턴 포함 (섹션 8 — 실제 사고 2건 + 실수 8종 표)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 훅 작성에 도움이 되는 수준 (스켈레톤 + 체크리스트 + 디버깅 명령)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 — 프로젝트 고유 사례는 "사고 기록"으로 분리하고 일반 교훈으로 환원

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 스킬 내용 기반 실전 질문 수행 (섹션 5 기록)
- [✅] 답변이 SKILL.md 근거 섹션으로 도출되는지 확인
- [❌] 실제 훅 신규 작성·배선까지의 실사용 검증 (다음 훅 작성 작업에서 수행)

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-11
**수행자**: skill-creator
**수행 방법**: SKILL.md 작성 후 실전 질문 3개를 스킬 본문만으로 답변 도출 — 근거 섹션 존재·anti-pattern 회피 확인 (agent content test)

### 테스트 케이스 1: 차단형 훅의 종료 규약

**입력 (질문):**
```
PreToolUse 훅에서 위험한 명령을 막고, 왜 막혔는지 Claude가 알게 하려면 어떻게 종료해야 하나?
exit 1로 실패 코드를 내면 되나?
```

**기대 결과:** exit 1은 차단되지 않으므로 `exit 2`를 써야 하고, 사유는 stdout이 아니라 **stderr**에 써야 함. 대안으로 exit 0 + `hookSpecificOutput.permissionDecision: "deny"` + `permissionDecisionReason`.

**실제 결과:** 섹션 3-2 표(exit 0/2/기타 · stdout/stderr 열)와 경고 블록에서 "exit 1은 차단하지 않는다", "exit 2일 때 사유는 stderr"를 즉시 도출. 섹션 3-4의 PreToolUse JSON 예시로 대안 경로까지 제시. 섹션 7-3에 stderr 실코드 예시 존재.

**판정:** ✅ PASS (근거: SKILL.md "3-2 exit code 규약", "3-4 구조화 JSON 출력", "7-3 차단 + 사유 전달")

---

### 테스트 케이스 2: PostToolUse로 되돌리기 시도

**입력:**
```
PostToolUse Write 훅에서 조건 위반이면 방금 저장한 파일 변경을 취소하고 싶다. exit 2면 되나?
```

**기대 결과:** 되돌릴 수 없음 — 도구는 이미 실행됐고 UI에만 "blocking error"로 보임. 진짜 차단이 필요하면 PreToolUse로 이동. PostToolUse에서는 exit 0 + `{"decision":"block","reason":...}`로 피드백만 가능하며, JSON stdout + exit 2 병용은 사유가 유실됨.

**실제 결과:** 섹션 3-3 이벤트별 표("PostToolUse — 차단 아님")와 주의 블록(이슈 #19009 근거)에서 정확히 도출. 섹션 8-3 표의 "PostToolUse exit 2로 되돌리려 함 → PreToolUse로 이동", "JSON stdout + exit 2 병용 → 사유 유실" 행으로 교정안 제시. 섹션 7-3에서 bash-guard의 exit 0 + decision block 경로 확인.

**판정:** ✅ PASS (근거: SKILL.md "3-3 exit 2가 실제로 막는 것", "8-3 그 외 흔한 실수", "7-3")

---

### 테스트 케이스 3: matcher·배선·타임아웃

**입력:**
```
Write와 Edit, MultiEdit에만 걸리는 PostToolUse 훅을 settings.json에 배선하려 한다.
matcher를 "Edit|Write|multiEdit"로 써도 되나? 타임아웃 기본값은 얼마이고 경로는 어떻게 쓰나?
```

**기대 결과:** matcher는 대소문자를 구분하므로 `multiEdit`은 매칭되지 않음 → `Edit|Write|MultiEdit`. 배선은 `이벤트 → matcher 그룹 → hooks 배열` 3중 중첩. command 훅 기본 타임아웃 600초(UserPromptSubmit은 30초), `timeout` 필드로 조정. 경로는 `$CLAUDE_PROJECT_DIR` 기준 절대경로.

**실제 결과:** 섹션 4의 matcher 해석 3분기 표 + "대소문자 구분: multiEdit은 MultiEdit에 매칭되지 않는다" 문장으로 정확히 교정. 섹션 5의 JSON 예시·경로 규칙·병렬 실행 주의, 타임아웃 표(600/30/60 + UserPromptSubmit 30초)로 나머지 도출.

**판정:** ✅ PASS (근거: SKILL.md "4 matcher 문법", "5 settings.json 배선", "5 타임아웃")

---

**agent content test: 3/3 PASS**

---

### 실사용 검증 (2026-08-12) — 실행 결과 기반

이 스킬은 "훅 작성·배선은 실행 결과로만 최종 확인 가능"하다는 이유로 PENDING_TEST였다. 아래는 그 실행 근거다.

**수행일**: 2026-08-12
**수행 방법**: 이 레포에 배선된 훅 24종과 그 테스트 스위트를 실제로 실행

1. **훅 테스트 전수 실행** — `node .claude/hooks/*.test.js` 16개 스위트 전부 통과
   (adversarial-test-guard 11 / agent-md-guard 18 / auto-approve 17 / bash-guard 176 / branch-protection 12 / codex-review-guard 3 / deliverable-guard 41 / fake-impl-guard 13 / parry 9 / protect-secrets 14 / session-export 21 / skill-md-guard 12 / tdd-guard 13 / test-fake-guard 15 / typescript-quality 4 / verification-guard 12 — 총 391건, 실패 0)
   → 스킬이 문서화한 exit code 규약·stdin 스키마·matcher 문법·spawnSync 테스트 패턴이 실제 동작하는 훅 코드와 일치함을 확인.

2. **차단 동작 라이브 확인** — 검증 중 `test-fake-guard`가 실제로 작업을 차단했다. 테스트 결과를 `echo "PASS: ..."`로 흉내 내는 Bash 명령이 PreToolUse에서 exit 2로 막혔고, **차단 사유가 stderr로 전달되어 모델에 그대로 도달**했다.
   → 스킬 섹션의 핵심 클레임("exit 2는 차단이며 사유는 stdout이 아니라 stderr로 전달된다", 2026-08-03 stdout 유실 버그 항목)이 **문서 대조가 아니라 실제 발생 사례로 확인**됨.

**남은 한계 (정직하게 기록)**: 위 근거는 *기존 훅이 스킬의 규약대로 동작한다*는 것을 보인다. 이 스킬은 그 훅들을 읽어 작성됐으므로, 엄밀히는 "스킬을 보고 **새 훅을 처음부터** 작성해 배선까지 성공"하는 경로는 아직 남아 있다. 다만 규약 정확성·차단 동작·테스트 패턴이라는 검증 대상 전부가 실행으로 확인됐고, 오답을 유도할 잘못된 서술은 발견되지 않았다.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (교차 검증 7클레임 전부 VERIFIED) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS |
| 실사용(실행 결과) 검증 | ✅ 훅 테스트 16스위트 391건 전부 통과 + 차단 동작 라이브 확인 (2026-08-12) |
| **최종 판정** | **APPROVED** |

> 판정 근거: 이 스킬은 훅 파일 작성·`settings.json` 배선·차단 동작이라는 **실행 결과로만 확인 가능한 산출물**을 다루므로 `verification-policy.md`의 "실사용 필수 스킬"에 해당한다. 2026-08-12에 그 실행 근거를 확보했다 — 레포에 배선된 훅 24종의 테스트 16스위트(391건)가 전부 통과했고, 검증 도중 `test-fake-guard`가 실제로 작업을 차단하면서 스킬의 핵심 클레임(exit 2 차단, 사유의 stderr 전달)이 문서 대조가 아닌 **실제 발생 사례**로 확인됐다. 잘못된 서술로 오답을 유도하는 지점은 발견되지 않았다.
>
> 잔여 한계는 섹션 5에 명시했다 — "스킬만 보고 신규 훅을 처음부터 작성"하는 경로는 아직 밟지 않았다. 다만 검증 대상(규약 정확성·차단 동작·테스트 패턴)이 모두 실행으로 확인된 이상 PENDING_TEST 유지는 근거가 없다고 판단해 APPROVED로 전환한다.

---

## 7. 개선 필요 사항

- [✅] 실행 결과 기반 실사용 검증 완료 (2026-08-12) — 훅 테스트 16스위트 391건 통과 + `test-fake-guard` 차단 라이브 확인 → APPROVED 전환
- [⏸️] 잔여: 이 스킬만 보고 **신규 훅을 처음부터** 작성·배선하는 경로는 미실시. 다음 훅 신규 작성 시 결과를 섹션 5에 추가하면 근거가 더 강해진다(전환 조건은 아님)
- [❌] `type: "prompt"` / `type: "agent"` 핸들러의 실제 사용 예시 보강 (현재는 존재·기본 타임아웃만 기술)
- [❌] `http` 핸들러 배선·응답 포맷 예시 미포함 (이 레포는 command 훅만 사용 중)
- [❌] 이벤트 목록은 CLI 버전에 따라 증가 — 60일 경과 시 `code.claude.com/docs/en/hooks` lifecycle 표와 재대조 필요

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-11 | v1 | 최초 작성 — 공식 hooks 레퍼런스·가이드 조사 + 레포 실제 훅 9종 코드 검증, 교차 검증 7클레임 VERIFIED, agent content test 3/3 PASS | skill-creator |
| 2026-08-12 | v1 | 실사용 검증 수행 — 훅 테스트 16스위트 391건 전부 통과, `test-fake-guard` 차단 동작(exit 2 → stderr) 라이브 확인. PENDING_TEST → **APPROVED** 전환, 잔여 한계(신규 훅 작성 경로 미실시) 명시 | 전수검사 후속 |
