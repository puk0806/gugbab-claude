---
name: project-claude-relay-plan
description: "05_gugbab-claude-relay 프로젝트 계획 — Vercel Sandbox에서 claude -p(구독 인증)를 실행해 개인 PWA(03 dream·04 health)에 SSE 중계하는 서버. 스킬 2종 생성 완료(2026-07-03), 스캐폴딩은 미착수"
metadata: 
  node_type: memory
  type: project
  originSessionId: 249f37f2-ab6f-4b6d-b2b2-7ec5126c3162
---

# Claude 구독 중계 서버 (05_gugbab-claude-relay) 계획

**배경**: 03_gugbab-claude-dream·04_gugbab-health(개인용 PWA, Vercel)는 `app/api/chat/route.ts`에서 `@google/genai`+GEMINI_API_KEY로 gemini-2.5-flash를 스트리밍 호출. 이를 사용자 Claude Max/Pro 구독으로 대체하기로 결정.

**핵심 결정 (2026-07-03)**:
- 구독 프로그래매틱 사용(`claude -p`·Agent SDK)은 개인용 허용. 2026-06-15 크레딧 풀 분리 정책은 시행 직전 pause — 현재 구독 한도 차감 유지
- Vercel 서버리스에선 CLI 실행 불가 → **Vercel Sandbox**(Firecracker microVM)에서 실행
- 아키텍처: PWA → relay `/api/chat`(시크릿 헤더) → Sandbox resume → `claude -p --output-format stream-json --verbose --include-partial-messages --tools "" --model haiku --max-turns 1` → text_delta만 SSE 중계 → `sandbox.stop()`
- 스택: Next.js 16 Route Handler(API 전용) + `@vercel/sandbox` + zod + pnpm/Biome/vitest. TS 선택 이유: Sandbox SDK가 TS 전용
- 이름: `05_gugbab-claude-relay` (gateway 아닌 relay — 단일목적 중계)

**완료**: 스킬 2종 생성·APPROVED — [[project-overhaul-progress]] 레포에 `devops/vercel-sandbox`, `backend/claude-code-headless`. README/docs 반영 완료 (스킬 209종). 커밋은 미실행(사용자 요청 대기).

**다음 단계**: ① 사용자가 `claude setup-token` 직접 실행(토큰 발급) → ② 05 프로젝트 스캐폴딩 → ③ /api/chat 구현 → ④ Vercel 배포+스모크 테스트 → ⑤ 04→03 순 전환.

**함정 메모**: `--bare`는 CLAUDE_CODE_OAUTH_TOKEN 안 읽음 / ANTHROPIC_API_KEY 잔존 시 구독을 조용히 덮어씀 / Hobby 상시 실행 불가(420 GB-hours) — 요청 단위 resume→stop 필수 / Sandbox는 iad1 전용.
