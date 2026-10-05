---
skill: claude-code-hook-authoring
category: meta
version: v2
date: 2026-09-28
status: APPROVED
---

# claude-code-hook-authoring 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `claude-code-hook-authoring` |
| 스킬 경로 | `.claude/skills/claude-code-hook-authoring/SKILL.md` |
| 검증일 | 2026-09-28 (재검증, 이전 2026-08-11) |
| 검증자 | skill-creator / 재검증(2차) |
| 스킬 버전 | v2 |
| 기준 버전 | Claude Code 2.1.x (공식 hooks 레퍼런스 + changelog 2.1.283 시점, 2026-09-28) |

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
| Claude Code changelog | https://code.claude.com/docs/en/changelog | ⭐⭐⭐ High | 2026-09-28 | 1순위 공식 — 2.1.133(effort·`$CLAUDE_EFFORT`), 2.1.214(exit 2 + 스키마 실패 JSON 차단), 2.1.248(깨진 JSON = 훅 에러), 2.1.251(Pre/PostModelSwitch) 버전 근거 |
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
| 1 | exit 0 = 통과(stdout이 JSON으로 파싱), exit 2 = 차단(stdout 무시·stderr가 Claude에게 전달), 그 외 = 비차단 에러 | 공식 hooks reference + hooks-guide + 커뮤니티 레퍼런스 | **VERIFIED** (2026-08-11) → **DISPUTED** (2026-09-28 재검증: stdout JSON은 모든 exit code에서 읽힘, exit 2 메시지는 JSON blocking reason 우선, 기타 exit + 유효 JSON은 JSON이 결과 결정 — SKILL.md 3-2 정정) |
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
- [✅] 스킬 내용 기반 실전 질문 수행 (섹션 5 기록, 최초 2026-08-11 + 재검증 정정분 타깃 skill-tester 재테스트 2026-09-28)
- [✅] 답변이 SKILL.md 근거 섹션으로 도출되는지 확인 (2026-09-28 재테스트 2/2 PASS)
- [✅] 실제 훅 신규 작성·배선까지의 실사용 검증 (2026-09-28 — 스킬만 보고 신규 훅 작성·임시 프로젝트 배선·headless 세션 9회로 정정 규약 재현, 섹션 5 최상단)

---

## 5. 테스트 진행 기록

### [2026-09-28] 실사용(실행) 검증

**수행일**: 2026-09-28
**수행 방법**: Claude Code 2.1.283 (`claude --version`), Node.js v22.23.1. 세션 스크래치패드의 임시 폴더에 빈 git 프로젝트 2개(`proj`, `proj4`)를 만들었다. SKILL.md만 보고 신규 훅 `lab-guard.js` 1개(약 60줄, §7-1 스켈레톤 + §3-2/§3-4 규약)를 작성했고, `.claude/settings.json`에 `PreToolUse`(matcher `Bash`)와 `PermissionRequest`(matcher `Bash`)를 `node $CLAUDE_PROJECT_DIR/...` 절대경로로 배선했다(§5). 먼저 §10 방식으로 stdin 로컬 재현을 했고, 그 뒤 `claude -p "<Bash 1회 실행 후 tool result 원문 인용>" --output-format json --debug-file <로그>` headless 호출을 **9회** 수행했다. 명령 문자열의 `LABCASEn` 마커로 케이스를 나눴다. 근거는 훅 호출 로그(jsonl), 케이스별 debug 로그, 세션 transcript의 `tool_result` 원문이다. 레포 `.claude/settings.json`·훅은 수정하지 않았다.
**실행 결과**:
1. PreToolUse exit 2 + stderr → 차단. transcript `tool_result`(is_error)에 `PreToolUse:Bash hook error: [node $CLAUDE_PROJECT_DIR/.claude/hooks/lab-guard.js]: [lab-guard] CASE1-STDERR-REASON ...`가 그대로 남았고 모델에 전달됐다 — **일치** (§3-2 exit 2 행, §7-3)
2. PreToolUse exit 2 + stdout 유효 JSON(`permissionDecision: deny` + reason) + stderr 동시 출력 → 차단. 모델이 받은 메시지는 `[lab-guard] CASE2-JSON-REASON`뿐이었고, stderr(`CASE2-STDERR-REASON`)는 transcript에 0회 나타났다. debug: `returned permissionDecision: deny (reason: ...)` — **일치** (§3-2 "JSON blocking reason 우선")
3. PreToolUse exit 1 + 스키마 통과 JSON(`permissionDecision: deny`) → 차단됐고 JSON reason이 전달됐다. debug 로그에 `non-blocking status code` notice는 0건 — **일치** (§3-2 "스키마 통과 JSON이면 exit code 무시, 에러 표시 없음", §8-3)
4. 존재하지 않는 스크립트 경로 → 비차단 통과. 명령(`touch`)이 실제로 실행돼 파일이 생성됐다.
   - (4a) `node $CLAUDE_PROJECT_DIR/.claude/hooks/typo-guard.js`: node가 exit 1(`Cannot find module`)로 끝났고, transcript에 `Failed with non-blocking status code: node:internal/modules/...`가 남았다.
   - (4b) 스크립트 직접 실행 `$CLAUDE_PROJECT_DIR/.claude/hooks/typo-guard.sh`: exit 127이었고 `Failed with non-blocking status code: /bin/sh: ...: No such file or directory`가 남았다.
   - 판정: **일치**(정책 훅 무력화 함정 재현). 다만 SKILL.md의 "127"은 직접 실행 형태에만 해당하고, 스킬이 권장하는 `node <경로>` 배선에서는 exit 1이 된다 → 최소 정정(아래).
5. PermissionRequest `decision: {behavior: "deny", message}`(exit 0) → `-p --permission-mode default` + 쓰기 명령 `mkdir`에서 **발화**해 거부됐다. 모델이 받은 메시지는 `[lab-guard] CASE5-PR-DENY ...`, 결과 JSON `permission_denials`에 해당 호출이 기록됐고, 디렉터리는 생성되지 않았다 — **일치** (§3-4)
   - 발화 조건 관찰: 첫 시도의 `printf`(읽기 전용, 자동 허용)에서는 PermissionRequest가 발화하지 않았고 명령이 실행됐다. 권한 판정이 실제로 필요한 호출에서만 발화한다. 공식 레퍼런스의 서술은 "When a tool call needs a permission decision"이며, headless 조건은 명시돼 있지 않다.
6. (추가) PermissionRequest exit 2 + stderr(`decision` 객체 없음) → exit 2는 무시됐다. debug `Hook PermissionRequest:Bash ... error` 뒤에 기본 권한 흐름(headless 기본 거부 "needs approval")이 그대로 이어졌고, stderr(`CASE6-PR-EXIT2-STDERR`)는 transcript에 0회 나타났다 — **일치** (§3-3 "exit 2 무시, stderr 폐기")
**SKILL.md 최소 정정**:
- §5 경로 오타 bullet: `node <경로>` 배선 시 exit 1 + `Cannot find module` 형태를 보강했다.
- §8-3 경로 오타 행: exit 1 형태를 병기했다.
- §10: headless 재현 절차와 PermissionRequest 발화 조건 관찰 1줄을 추가했다.
- 기존 서술 중 틀린 것은 없었다. 누락됐던 형태만 보강했다.
**미실시**: PreModelSwitch/PostModelSwitch는 이번 재현 대상이 아니었다(모델 전환 트리거가 필요함). 졸업 조건의 핵심인 "PermissionRequest deny, exit 2 + JSON reason 표시"는 재현됐다.
**졸업 조건 충족 여부**: 충족 — 스킬만 보고 신규 훅을 작성·배선했고, 정정된 동작(PermissionRequest `decision` deny, exit 2 + JSON reason 우선, 기타 exit + JSON 결정, PermissionRequest exit 2 무시)이 실제 세션에서 전부 재현됐다.
**판정**: APPROVED 전환

---

### [2026-09-28] skill-tester 재테스트 (재검증 정정분 타깃)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: 2026-09-28 재검증(2차)에서 정정된 PermissionRequest exit 2 무시·exit 2 stdout JSON 읽힘 규약을 겨냥한 실전 질문 2개를 SKILL.md만 근거로 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. PermissionRequest 훅에서 exit 2 + stderr로 위험 Bash를 차단할 수 있는가**
- ✅ PASS
- 근거: SKILL.md "2. 훅 이벤트 카탈로그"(PermissionRequest 행) · "3-3 exit 2가 실제로 막는 것" · "3-4 구조화 JSON 출력" · "6 차단형 vs 비차단형 설계" · "8-3 그 외 흔한 실수"
- 상세: "통하지 않는다 — exit 2는 무시되고 stderr도 버려짐, exit 0 + `hookSpecificOutput.decision.behavior: \"deny\"` + `message`로만 거부 가능"을 5개 섹션 교차 근거로 정확히 도출. 재검증(2차)에서 정정된 핵심 클레임이 실전 질문에서 올바르게 반영됨.

**Q2. PreToolUse가 exit 2 + JSON `permissionDecision: "allow"`를 동시에 내면 최종 결과와 메시지 출처는**
- ✅ PASS (경미한 gap)
- 근거: SKILL.md "3-2 exit code 규약"(exit 2 행) · "8-3 JSON stdout + exit 2 병용" 행 · "7-3 차단 + 사유 전달"
- 상세: "차단은 유지된다(JSON allow로도 못 뒤집음), JSON이 blocking reason을 안 주므로 메시지는 stderr에서 온다"를 정확히 도출. 다만 "JSON이 allow 판정이면서 그 안에 reason이 있는 경우"의 명시적 예제·로그가 SKILL.md에 없어 이 경계 케이스는 추론으로 보완했다는 점을 에이전트가 스스로 지적함 — 차단 요인 아님(엣지 케이스 문서화는 선택 보강).

### 발견된 gap

- (선택 보강, 차단 요인 아님) PermissionRequest·PreToolUse에서 "allow 판정 + reason 필드 동시 존재" 같은 비차단 JSON의 reason 노출 여부에 대한 명시적 예제가 없음. 실사용에 지장 없으나 다음 갱신 시 한 줄 보강 고려.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 실사용 필수 스킬(훅 작성·배선·차단 동작 — 실행 결과 검증 대상)
- 최종 상태: PENDING_TEST 유지 (재검증(2차) 정정분에 대한 content test 통과. 신규 훅 작성·배선을 통한 실행 검증은 여전히 미실시 — 섹션 7 참조)

---

### 2026-08-11 최초 content test (참고용 보존)

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

### [2026-09-28] 재검증(2차) — exit code·stdout JSON 규약 정정, PermissionRequest exit 2 오기재 정정, ModelSwitch 이벤트·공통 입력 보강

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 9개를 1차 소스(공식 hooks 레퍼런스 원문 markdown + 공식 changelog)와 대조, 보강·축소 검토. 레포 훅 코드 영향은 읽기 전용 점검

**클레임 대조 결과**:
1. PermissionRequest는 exit 2로 거부된다 (§2 표·§3-3) → **DISPUTED(정정)** — 레퍼런스 "Exit code 2 behavior per event": "Exit code 2 isn't honored for this event … Deny through the `decision` object", "A hook that exits 2 without a `decision` object leaves the permission flow unchanged, and its stderr is discarded" (https://code.claude.com/docs/en/hooks)
2. exit 2에서 stdout은 전부 무시 (§3-2·§3-4·§8-1·§8-3) → **DISPUTED(정정)** — "Claude Code reads JSON output fields from stdout on every exit code", "The blocking message is the reason from your JSON's blocking decision when it makes one, and your stderr text otherwise". 스키마 실패 JSON + exit 2 → 차단 유지·stderr 사유는 **v2.1.214** changelog("Fixed hooks with exit code 2 not blocking as documented when the hook's stdout JSON fails schema validation")로 확인. JSON reason 우선 규칙 자체의 도입 버전은 changelog에서 확인 불가 → 버전 미기재
3. exit 2 외 non-zero는 무조건 비차단 에러 → **DISPUTED(정정)** — "Other exit codes": 스키마 통과 JSON이면 "Claude Code ignores the exit code and the JSON alone decides the outcome" (레퍼런스, 버전 표기 없음)
4. JSON 파싱 실패 처리 → **VERIFIED(ADD)** — 비차단 에러, 컨텍스트 주입 이벤트도 주입 안 함. 레퍼런스 "Before v2.1.248 … treated that stdout as plain text" + changelog 2.1.248 "Fixed hooks silently treating a stdout `{…}` object that isn't valid JSON as plain text"
5. exit 0 plain stdout 컨텍스트 주입 이벤트 = UserPromptSubmit·UserPromptExpansion·SessionStart → **DISPUTED(보강)** — PostModelSwitch 추가 (레퍼런스 "Exit code 0")
6. PreModelSwitch(차단 가능, 타임아웃 시 차단, 기본 30초)/PostModelSwitch 이벤트 → **VERIFIED(ADD)** — 레퍼런스 해당 섹션 + changelog 2.1.251 "Added `PreModelSwitch` and `PostModelSwitch` hook events"
7. 공통 입력 `effort.level`·`$CLAUDE_EFFORT` → **VERIFIED(ADD)** — 레퍼런스 Common input fields + changelog 2.1.133
8. 공통 입력 `scratchpad_dir` → **VERIFIED(ADD, 버전 주의)** — 레퍼런스는 v2.1.257 표기, changelog에서 미확인 → SKILL.md에 `> 주의:` 표기
9. 스크립트 경로 오타 → exit 127 등 비차단 에러로 정책 훅이 조용히 무력화 → **VERIFIED(ADD)** — 레퍼런스 "Other exit codes" ("a mistyped path in `settings.json` leaves the gate silently disabled")
- 부수 확인(VERIFIED, 변경 없음): 타임아웃 기본값 600/30/60·UserPromptSubmit 30·MessageDisplay 10·SessionEnd 1.5초, matcher 3분기 해석·대소문자 구분, `hookSpecificOutput.hookEventName` 필수, `additionalContext` 10,000자 상한, prompt_id v2.1.196+
- 부수 정정: §3-3의 "Setup·Notification = stderr 사용자 표시"는 레퍼런스상 "Exit code and stderr are ignored" → 행 분리 정정

**보강(ADD)·축소**: ADD — §2 PreModelSwitch/PostModelSwitch 행, §3-1 `effort`·`$CLAUDE_EFFORT`·`scratchpad_dir`, §3-2 표 전면 재작성(모든 exit code에서 JSON 읽힘·파싱 실패·스키마 실패), §3-3 이벤트별 표 정정, §3-4 PermissionRequest deny 예시·PreModelSwitch 결정 필드, §5 경로 오타 exit 127 함정·PreModelSwitch 타임아웃, §6·§9 PermissionRequest 예외, §8-3 함정 4행 추가. 축소 — 없음(함정·사고 기록은 보존, §8-1 서술만 정확화)

**실전 질문 재검증**:
- Q1. "PermissionRequest 훅에서 위험한 Bash를 exit 2 + stderr로 거부하면 되나?" → SKILL.md "3-3"·"3-4"·"8-3" 근거로 "exit 2는 무시되고 stderr 폐기 → exit 0 + `decision.behavior: deny` + `message`" 도출 — PASS
- Q2. "PreToolUse 훅이 JSON deny와 exit 2를 같이 내면 어떤 메시지가 Claude에게 가나? exit 1 + JSON allow는?" → "3-2" 근거로 "차단 유지, 메시지는 JSON blocking reason 우선·없으면 stderr / exit 1 + 스키마 통과 JSON은 JSON이 결정(allow 적용)" 도출 — PASS
- Q3. "settings.json에 훅 경로를 잘못 써도 에러로 막히나?" → "5"·"8-3" 근거로 "exit 127 비차단 에러로 통과 — 정책 훅이 조용히 꺼짐, 첫 실행 notice 확인" 도출 — PASS

**재검증 최종 판정**: status **PENDING_TEST 전환** (정정 3건·보강 다수 — 메인이 skill-tester 재테스트 후 APPROVED 재전환)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (최초 7클레임 VERIFIED) → 2026-09-28 재검증: DISPUTED 3건(PermissionRequest exit 2·exit 2 stdout·기타 exit + JSON) 정정, ADD 5건 반영 |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 스킬 작성 시 3/3 PASS (2026-08-11) + **skill-tester 재검증 content test 2/2 PASS (2026-09-28, 정정분 타깃)** |
| 실사용(실행 결과) 검증 | ✅ 훅 테스트 16스위트 391건 전부 통과 + 차단 동작 라이브 확인 (2026-08-12) + **신규 훅 작성·배선 후 headless 세션 9회로 정정 규약 6케이스 재현, 전부 일치 (2026-09-28, Claude Code 2.1.283)** |
| 재검증(2차, 2026-09-28) | 정정·보강 반영, 실전 질문 3/3 PASS(내용 재검증) + skill-tester content test 2/2 PASS(2026-09-28) 완료 |
| **최종 판정** | **APPROVED** (2026-09-28 실사용 실행 검증 완료 — 스킬만 보고 신규 훅 작성·배선, PermissionRequest decision deny·exit 2 + JSON reason 우선·exit 1 + JSON 결정·경로 오타 비차단·PermissionRequest exit 2 무시 재현. SKILL.md 누락 형태 1건 최소 보강) |

> 판정 근거: 이 스킬은 훅 파일 작성·`settings.json` 배선·차단 동작이라는 **실행 결과로만 확인 가능한 산출물**을 다루므로 `verification-policy.md`의 "실사용 필수 스킬"에 해당한다. 2026-08-12에 그 실행 근거를 확보했다 — 레포에 배선된 훅 24종의 테스트 16스위트(391건)가 전부 통과했고, 검증 도중 `test-fake-guard`가 실제로 작업을 차단하면서 스킬의 핵심 클레임(exit 2 차단, 사유의 stderr 전달)이 문서 대조가 아닌 **실제 발생 사례**로 확인됐다. 잘못된 서술로 오답을 유도하는 지점은 발견되지 않았다.
>
> 잔여 한계는 섹션 5에 명시했다 — "스킬만 보고 신규 훅을 처음부터 작성"하는 경로는 아직 밟지 않았다. 다만 검증 대상(규약 정확성·차단 동작·테스트 패턴)이 모두 실행으로 확인된 이상 PENDING_TEST 유지는 근거가 없다고 판단해 APPROVED로 전환한다.

---

## 7. 개선 필요 사항

- [✅] 실행 결과 기반 실사용 검증 완료 (2026-08-12) — 훅 테스트 16스위트 391건 통과 + `test-fake-guard` 차단 라이브 확인 → APPROVED 전환
- [✅] 이 스킬만 보고 **신규 훅을 처음부터** 작성·배선하는 경로 — 2026-09-28 임시 프로젝트 + headless 세션으로 실시, 전 케이스 일치 (섹션 5 최상단)
- [❌] PreModelSwitch/PostModelSwitch 실행 재현 미실시(모델 전환 트리거 필요) — 다음 재검증 때 선택적으로 보강
- [❌] `type: "prompt"` / `type: "agent"` 핸들러의 실제 사용 예시 보강 (현재는 존재·기본 타임아웃만 기술)
- [❌] `http` 핸들러 배선·응답 포맷 예시 미포함 (이 레포는 command 훅만 사용 중)
- [❌] 이벤트 목록은 CLI 버전에 따라 증가 — 60일 경과 시 `code.claude.com/docs/en/hooks` lifecycle 표와 재대조 필요 (2026-09-28 재대조 완료 — Pre/PostModelSwitch 반영)
- [✅] 2026-09-28 정정분 skill-tester content test 수행 (2026-09-28 완료, 2/2 PASS) — 실사용 필수 카테고리라 status는 PENDING_TEST 유지(APPROVED 전환 아님). 잔여 차단 요인은 위 "신규 훅 처음부터 작성" 항목 하나뿐

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-11 | v1 | 최초 작성 — 공식 hooks 레퍼런스·가이드 조사 + 레포 실제 훅 9종 코드 검증, 교차 검증 7클레임 VERIFIED, agent content test 3/3 PASS | skill-creator |
| 2026-08-12 | v1 | 실사용 검증 수행 — 훅 테스트 16스위트 391건 전부 통과, `test-fake-guard` 차단 동작(exit 2 → stderr) 라이브 확인. PENDING_TEST → **APPROVED** 전환, 잔여 한계(신규 훅 작성 경로 미실시) 명시 | 전수검사 후속 |
| 2026-09-28 | v2 | 재검증(2차) — 공식 hooks 레퍼런스·changelog 대조. 정정: PermissionRequest exit 2 무시(decision 객체로만 거부), exit 2에서도 stdout JSON 읽힘(blocking reason 우선), 기타 exit + 유효 JSON은 JSON이 결정, Setup·Notification stderr 무시. 보강: Pre/PostModelSwitch(v2.1.251), PostModelSwitch 컨텍스트 주입, 깨진 JSON 비차단 에러(v2.1.248), 스키마 실패 + exit 2 차단(v2.1.214), `effort`·`$CLAUDE_EFFORT`(v2.1.133), `scratchpad_dir`, 경로 오타 exit 127 함정. APPROVED → **PENDING_TEST** | 재검증(2차) |
| 2026-09-28 | v2 | 2단계 실사용 테스트 수행(재검증 정정분 타깃) — Q1 PermissionRequest exit 2 무시 규약 / Q2 PreToolUse exit 2+JSON allow 우선순위 및 메시지 출처 → 2/2 PASS, PENDING_TEST 유지(실사용 필수 카테고리 — 신규 훅 작성 실행 검증은 별도 필요) | skill-tester |
| 2026-09-28 | v2 | 실사용(실행) 검증 — 스킬만 보고 신규 훅 작성·임시 git 프로젝트 배선 후 `claude -p` headless 9회(2.1.283). PreToolUse exit 2+stderr / exit 2+JSON reason 우선 / exit 1+JSON deny 결정 / 경로 오타 비차단(127·node exit 1) / PermissionRequest decision deny / PermissionRequest exit 2 무시 전부 일치. SKILL.md 최소 보강(§5·§8-3 `node <경로>` 오타 시 exit 1 형태, §10 headless 재현·PermissionRequest 발화 조건). PENDING_TEST → **APPROVED** | 실사용 검증 |
| 2026-09-30 | v2 | tdd-guard 예시(§5 배선·§7-3)에 "dev 템플릿 전용 훅, 설치된 경우에만 존재" 표기 추가 (내용 변경 없음), status 유지 | Claude (Sonnet 5.5) |
