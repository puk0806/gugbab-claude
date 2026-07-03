---
skill: claude-code-headless
category: backend
version: v1
date: 2026-07-03
status: APPROVED
---

# 스킬 검증 — claude-code-headless

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `claude-code-headless` |
| 스킬 경로 | `.claude/skills/backend/claude-code-headless/SKILL.md` |
| 검증일 | 2026-07-03 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (headless / authentication / cli-reference / agent-sdk)
- [✅] 공식 GitHub 2순위 소스 확인 (agent-sdk 패키지명 공식 문서 내 명시)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-07-03, CLI v2.1.x 기준 플래그)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (headless 플래그·stream-json·인증 우선순위·안전 가드)
- [✅] 코드 예시 작성 (bash 실행·jq 파싱 예시)
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | code.claude.com/docs/en/headless | `-p`/`--print`, output-format, stream-json 이벤트 구조, bare 모드, --continue/--resume 확인 |
| 조사 | WebFetch | code.claude.com/docs/en/authentication | 인증 우선순위 6단계, setup-token, OAuth 토큰 1년 만료·inference 스코프, bare 미지원 확인 |
| 조사 | WebFetch | code.claude.com/docs/en/cli-reference | --max-turns / --disallowedTools / --model 별칭 / --tools / --verbose / --include-partial-messages 정확한 명칭·설명 확인 |
| 조사 | WebFetch | code.claude.com/docs/en/agent-sdk/overview | 패키지명(@anthropic-ai/claude-agent-sdk, claude-agent-sdk), CLI vs SDK 선택 표, 제3자 로그인 금지 정책 확인 |
| 조사 | WebFetch | support.claude.com/articles/15036540 | 6/15 크레딧 풀 분리 정책 pause, 현재 구독 한도 차감 유지 확인 |
| 교차 검증 | WebSearch | 크레딧 풀 분리 정책 pause 여부 (독립 소스 다수) | thenewstack·techtimes·zed.dev 등 다수 소스에서 6/15 시행 당일 pause 확정 |
| 교차 검증 | Grep | cli-reference 원문에서 플래그 명칭 대조 | --max-turns/--disallowedTools/--model/--tools 명칭 원문 일치 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Run Claude Code programmatically (headless) | https://code.claude.com/docs/en/headless | ⭐⭐⭐ High | 2026-07-03 | 1순위 공식 문서 |
| Authentication | https://code.claude.com/docs/en/authentication | ⭐⭐⭐ High | 2026-07-03 | 인증 우선순위·setup-token 원문 |
| CLI reference | https://code.claude.com/docs/en/cli-reference | ⭐⭐⭐ High | 2026-07-03 | 플래그 명칭 원문 대조 |
| Agent SDK overview | https://code.claude.com/docs/en/agent-sdk/overview | ⭐⭐⭐ High | 2026-07-03 | 패키지명·CLI vs SDK·정책 |
| Use the Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540 | ⭐⭐⭐ High | 2026-07-03 | 공식 지원 문서, 크레딧 정책 pause |
| Anthropic pauses Agent SDK subscription change | https://thenewstack.io/anthropic-pauses-claude-agent-sdk-subscription-change/ | ⭐⭐ Medium | 2026-06 | 정책 pause 교차 검증 |
| Zed blog — Anthropic subscription changes | https://zed.dev/blog/anthropic-subscription-changes | ⭐⭐ Medium | 2026-06 | 정책 pause 교차 검증 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (18개 클레임 전량 VERIFIED)
- [✅] 버전 정보가 명시되어 있음 (CLI v2.1.x, 검증일 2026-07-03)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임 (bash + jq)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (headless·stream-json·인증 우선순위)
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (CLI vs SDK, bare 금지)
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 중계 서버 구현에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-07-03)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-07-03)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (발견 없음)

### 4-5. 교차 검증한 클레임 판정

| # | 클레임 | 판정 | 근거 소스 |
|---|--------|------|-----------|
| 1 | `claude -p`(`--print`)가 headless 실행 진입점, 모든 CLI 옵션과 함께 동작 | VERIFIED | headless + cli-reference |
| 2 | `--output-format`은 text/json/stream-json 3종 | VERIFIED | headless + cli-reference |
| 3 | stream-json은 줄 단위 JSON, `--verbose`+`--include-partial-messages` 필요, text_delta 필터 | VERIFIED | headless(예시) + cli-reference |
| 4 | 이벤트 타입: system/init(첫 이벤트, session_id), stream_event, system/api_retry, result | VERIFIED | headless 원문 필드 표 |
| 5 | `--model` 별칭 sonnet/opus/haiku/fable 또는 전체명 | VERIFIED | cli-reference |
| 6 | `--resume`(ID/이름)·`--continue`(최근) 세션 이어가기, 같은 디렉터리 범위 | VERIFIED | headless + cli-reference |
| 7 | `--disallowedTools`/`--disallowed-tools` bare 이름은 도구 제거, `"*"`=전체 | VERIFIED | cli-reference |
| 8 | `--max-turns` print 모드 전용, 초과 시 에러 종료 | VERIFIED | cli-reference |
| 9 | `--append-system-prompt` 기본 프롬프트에 추가 / `--system-prompt` 완전 교체 | VERIFIED | headless + cli-reference |
| 10 | `claude setup-token` → 1년 OAuth 토큰, 저장 안 함, CLAUDE_CODE_OAUTH_TOKEN 주입 | VERIFIED | authentication |
| 11 | 토큰: Pro/Max/Team/Enterprise 필요, inference 전용 스코프, Remote Control 불가 | VERIFIED | authentication |
| 12 | 인증 우선순위: cloud provider → ANTHROPIC_AUTH_TOKEN → ANTHROPIC_API_KEY → apiKeyHelper → CLAUDE_CODE_OAUTH_TOKEN → 구독 OAuth | VERIFIED | authentication 원문 6단계 |
| 13 | ANTHROPIC_API_KEY 존재 시 구독보다 우선, `-p`에서는 항상 사용, unset으로 복귀 | VERIFIED | authentication |
| 14 | bare 모드는 CLAUDE_CODE_OAUTH_TOKEN 미독, ANTHROPIC_API_KEY/apiKeyHelper 필요 | VERIFIED | headless + authentication |
| 15 | Agent SDK 패키지: @anthropic-ai/claude-agent-sdk(TS), claude-agent-sdk(Python 3.10+) | VERIFIED | agent-sdk overview |
| 16 | CLI vs SDK 선택: 일회성·인터랙티브=CLI, CI/CD·커스텀앱·프로덕션=SDK | VERIFIED | agent-sdk overview 비교 표 |
| 17 | 제3자 제품에 claude.ai 로그인/레이트리밋 제공 불가(사전 승인 없이) → API 키 사용 | VERIFIED | agent-sdk overview Note |
| 18 | 2026-06-15 크레딧 풀 분리 정책 pause, 현재 구독 한도 차감 유지 | VERIFIED | support 15036540 + thenewstack + zed.dev |

- VERIFIED: 18 / DISPUTED: 0 / UNVERIFIED: 0

---

## 5. 테스트 진행 기록

**수행일**: 2026-07-03
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Vercel Sandbox에서 `--bare` + CLAUDE_CODE_OAUTH_TOKEN 조합 사용 가부**
- ✅ PASS
- 근거: SKILL.md "5. bare 모드(`--bare`) 제약" 섹션 + "흔한 실수" 표
- 상세: `--bare`는 OAuth/keychain 읽기를 건너뛰어 CLAUDE_CODE_OAUTH_TOKEN이 무시된다는 핵심 제약을 정확히 인용. 대안(`claude -p` bare 미적용)까지 제시.

**Q2. stream-json 출력에서 텍스트 토큰만 SSE로 추출하는 방법**
- ✅ PASS
- 근거: SKILL.md "2. stream-json 출력 구조 & SSE 중계 파싱" 섹션 (64~90번 줄)
- 상세: `--verbose`, `--include-partial-messages` 두 플래그가 필수임을 정확히 명시. `stream_event` + `event.delta.type == "text_delta"` 필터 조건과 jq 명령어 예시를 섹션 코드 그대로 인용.

**Q3. CI에 ANTHROPIC_API_KEY 잔존 시 발생하는 문제 (인증 우선순위 함정)**
- ✅ PASS
- 근거: SKILL.md "4. 인증 우선순위" 섹션 + "8. 안전 가드" 체크리스트 + "흔한 실수" 표
- 상세: ANTHROPIC_API_KEY가 우선순위 3위(CLAUDE_CODE_OAUTH_TOKEN은 5위)여서 조용히 구독 인증을 덮어쓴다는 핵심 함정을 정확히 식별. `unset` + `/status` 확인 해결책도 정확.

### 발견된 gap

- 없음. 3개 질문 모두 SKILL.md에 충분한 근거가 있었으며 anti-pattern 회피 확인.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: CLI 사용법/패턴 스킬 → 실사용 필수 카테고리 해당 없음
- 최종 상태: APPROVED

---

> (참고) 기존 예정 케이스 — 위 Q1·Q2가 이를 포함하여 수행됨

### 테스트 케이스 1: 구독 토큰 중계 서버에서 bare 모드 사용 가부

**입력:** "Vercel Sandbox에서 CLAUDE_CODE_OAUTH_TOKEN으로 인증하는데 `--bare`를 붙여도 되나?"

**기대 결과:** 안 됨. bare 모드는 OAuth/keychain을 읽지 않아 CLAUDE_CODE_OAUTH_TOKEN이 무시되므로 `--bare` 제거하고 `claude -p`로 실행. (SKILL §5)

**실제 결과:** (실사용 테스트 시 기록)

**판정:** 미실시

### 테스트 케이스 2: stream-json에서 응답 텍스트만 SSE로 흘리기

**입력:** "claude -p stream-json 출력에서 사용자에게 보여줄 텍스트 토큰만 뽑으려면?"

**기대 결과:** `--verbose --include-partial-messages` 추가 후 `stream_event` 중 `event.delta.type == "text_delta"`의 `event.delta.text`만 추출. (SKILL §2)

**실제 결과:** (실사용 테스트 시 기록)

**판정:** 미실시

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (공식 문서 5종 + 교차 검증 18/18 VERIFIED) |
| 구조 완전성 | ✅ (frontmatter·소스·검증일·8섹션·예시·흔한 실수 포함) |
| 실용성 | ✅ (중계 서버 관점 실행·파싱·안전 가드 예시) |
| 에이전트 활용 테스트 | ✅ (3/3 PASS — 2026-07-03, general-purpose 에이전트 수행) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 실사용 테스트 수행 후 섹션 5·6 업데이트 (2026-07-03 완료, 3/3 PASS)
- [❌] CLI 버전 업데이트 시 플래그 명칭 재확인 (`--tools`/`--disallowedTools` 변동 가능성) — 차단 요인 아님, 선택적 유지보수 항목

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-07-03 | v1 | 최초 작성. 공식 문서 5종 기반, 18개 클레임 전량 VERIFIED | skill-creator |
| 2026-07-03 | v1 | 2단계 실사용 테스트 수행 (Q1 --bare+OAuth 조합 / Q2 stream-json 텍스트 추출 / Q3 인증 우선순위 함정) → 3/3 PASS, APPROVED 전환 | skill-tester |
