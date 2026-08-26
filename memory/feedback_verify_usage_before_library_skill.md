---
name: feedback_verify_usage_before_library_skill
description: 라이브러리 스킬은 package.json 의존성이 아니라 실제 import·파일 사용량을 실측한 뒤 만든다 — 2026-08-26 vanilla-extract 스킬을 죽은 devDependency만 보고 만들었다가 삭제
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f4a1bdb6-4f86-4205-a4f6-644338ab6d05
  modified: 2026-08-26T02:30:01.271Z
---

# 라이브러리 스킬 생성 전 실제 사용량 실측

2026-08-26 사용자 지시 "불필요한 에이전트나 스킬은 만든 건 아닌지 판단해봐" 로 사후 점검 → `frontend/vanilla-extract` 스킬이
대상 프로젝트에 `@vanilla-extract/next-plugin` devDependency만 있고 **`.css.ts` 0개·import 0개·next.config 미참조**인 죽은 의존성 기반이었음이 드러나 삭제(검증 완료된 992줄이 매몰).

**Why:** `package.json`은 "설치돼 있음"이지 "쓰고 있음"이 아니다. 레거시 프로젝트는 시도 후 방치된 의존성이 흔하다. 이 레포는 미사용·내장지식 중복 스킬을 두지 않는 원칙(2026-06-11 개편에서 224→202종 삭제)이라 실측 없는 생성은 곧 삭제 대상이 된다.

**How to apply:**
- 스킬 생성 판단 전에 `grep -rl '<패키지>' src --include='*.ts' --include='*.tsx' | wc -l` 로 **import 파일 수**를 재고, 설정 파일·빌드 산출물에서 실제 활성화 여부까지 확인한다 (zsh에서 `--include=*.tsx`는 반드시 따옴표)
- 기준: import 파일 수가 두 자리 이상이거나 핵심 흐름(상태·데이터·그리드 등)에 있을 때만 전용 스킬. 한 자리면 내장 지식으로 충분
- 같은 세션 실측치(2026-08-26): lf-ui — TanStack Query 976·Recoil 346·MUI 51 파일 / lfos-ui — ag-grid 64·zustand 2·react-dnd 2 (react-dnd 스킬은 기존이라 유지했지만 사용량 기준으론 경계선)
- 관련: [[project_frontend_domain_refactor_assets_2026-08-26]], [[feedback_neutral_tech_comparison]]
