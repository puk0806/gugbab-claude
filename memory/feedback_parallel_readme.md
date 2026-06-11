---
name: 병렬 에이전트 README 충돌 방지
description: 여러 스킬 생성 에이전트를 병렬 실행할 때 README 동시 수정 금지
type: feedback
originSessionId: b0c5da5d-e263-4ea4-86af-17b46b6e9172
---
스킬 생성 에이전트를 병렬로 실행하면 README.md를 동시에 수정해 충돌이 발생한다.

**Why:** 2026-04-20 세션에서 8개 스킬 에이전트를 병렬 실행했을 때 README 동시 쓰기로 반복 실패 경험.

**How to apply:** 병렬 에이전트에는 "README 업데이트는 하지 마세요. SKILL.md와 verification.md만 작성" 지시. 모든 에이전트 완료 후 메인에서 README를 한 번에 정리.
