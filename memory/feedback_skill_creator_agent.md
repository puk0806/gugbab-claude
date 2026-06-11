---
name: skill-creator 에이전트는 정상 동작 (이전 메모 정정)
description: 이전에 "skill-creator subagent_type은 WebSearch 없음"이라고 잘못 기록했었음. 실제로는 정상 동작하므로 그냥 사용한다.
type: feedback
originSessionId: 0d50be35-5012-479d-82c9-84f0edba18f5
---
`subagent_type: "skill-creator"`로 호출하면 WebSearch/WebFetch 모두 정상 동작한다. 이전 메모에 "WebSearch 없음 → general-purpose 사용" 권고가 있었는데, 이는 잘못된 관찰이었다.

**Why (정정 근거):**
- 이번 세션(2026-04-22 ~ 04-23)에서 skill-creator를 Java 스킬 22종 생성에 호출 — 모두 WebSearch/WebFetch로 공식 문서 교차 검증 정상 수행
- 시스템 description: "WebSearch로 직접 조사·교차 검증 후 파일 작성까지 자기 완결형으로 처리. 서브에이전트(Agent 도구)를 사용하지 않으므로 중첩 호출 제한이 없다."
- skill-creator는 verification.md 섹션 구조(8섹션)·"내장" 키워드 회피 등 verification-guard 훅 통과까지 알아서 처리

**How to apply:**
- 스킬 생성 시 `subagent_type: "skill-creator"` 그대로 사용 (general-purpose로 우회할 필요 없음)
- 프롬프트에 SKILL.md 경로, verification.md 경로, 다룰 내용, 참고 소스, 형식 참조 스킬, "README 절대 수정 금지(병렬 시)" 명시
- 병렬 호출은 안전 (skill-creator는 Agent 도구 없어서 중첩 안 됨)
