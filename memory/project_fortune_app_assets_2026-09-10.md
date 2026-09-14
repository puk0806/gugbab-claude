---
name: project_fortune_app_assets_2026-09-10
description: "사주·타로·손금 운세 앱(fortune-app) 자산 — 2026-09-10 스킬 13종·에이전트 2종 신설 → 2026-09-11 '캐주얼 앱' 결정으로 안전 계열 삭제·축소(스킬 10종·에이전트 1종, dev 템플릿 승격·SEO 옵트인). 삭제 자산은 미커밋 상태에서 지워져 git 복구 불가"
metadata: 
  node_type: memory
  type: project
  originSessionId: 452e8161-d832-4361-8318-699231be5c03
  modified: 2026-09-11T07:11:24.968Z
---

# 운세 앱(fortune-app) 자산 (2026-09-09 신설 → 09-11 캐주얼 축소, 커밋 전)

**현재 상태(2026-09-11)**: 스킬 10종·에이전트 1종(`validation/fortune-interpretation-prompt-tester`, 3축 평가)·설치 템플릿 `12/fortune-app`(dev 템플릿·SEO 옵트인)·`examples/CLAUDE.fortune-app.md`(원칙 2항: 재미용 면책 + 개인정보 최소화)·`docs/templates/fortune-app.md`. 전체 스킬 230 / 에이전트 65 / APPROVED 212 / PENDING_TEST 18. 여전히 **미커밋**.

**핵심 결정 — 캐주얼 앱, 안전 계열 불필요 (2026-09-11 사용자 지시 "막 캐주얼하게 하는거라 안전 이런 스킬은 필요 없어")**: 09-10에 꿈 앱과 다른 경계("상징 해석 허용 / 결정론적 단정·YMYL 조언 금지", 7카테고리 안전 분류기, severe_distress `response_policy` 단일 기준, `classifier_unavailable` 폴백)로 설계했던 안전 정책은 **전부 폐기**. Codex 3라운드로 정착시킨 불변식들도 삭제 자산과 함께 사라짐 — 되살릴 때는 이 메모리가 아니라 새로 설계.
- 삭제: `meta/fortune-safety-classifier-prompts`·`humanities/fortune-content-ethics-korea`(법·규제)·`backend/web-subscription-payments-korea`(정기결제, PENDING_TEST였음)·에이전트 `validation/fortune-safety-classifier`. **untracked 상태에서 rm 했으므로 git 이력 없음** — 세션 스크래치패드 백업은 세션 종료 후 사라짐.
- 축소: prompt-engineering(분류기 연동·위기 섹션 제거), prompt-tester(5축→3축: 톤·단정 회피·출력 포맷, 별자리 언급 제거), palmistry-limitations(건강 해석 금지 가드→엔터테인먼트 한 줄 고지), daily-fortune-retention-loop(과의존 가드 제거), CLAUDE.fortune-app.md(8항→2항).
- 템플릿 12에서 `humanities/crisis-intervention-resources-korea` 포함 제거(dream 자산으로는 유지).

**설치 필터 설계**: 전용 10종은 `FORTUNE_APP_SKILLS`+`is_fortune_skill` 게이트로 fortune-app·all 외 전역 차단. fortune-app 안에서 dream 전용은 `frontend/dream-*`·`is_dream_meta`·`DREAM_ARCH_SKILLS`로 차단, 접두어 없는 공용 LLM·PWA·음성 스킬은 **의도적 공유** — 바꾸지 말 것. 2026-09-11부터 dream(9)·fortune(12)은 health(10)와 **완전히 같은 레벨** — `is_dev_selected`(dev 훅 4) + `is_ts_selected`(typescript-quality 훅·typescript.md 규칙·레거시 프로파일 질문) + Codex 질문, SEO는 `is_seo_optin_selected`로 react/next와 같은 y/c/N 질문(기본 n, `seo-static-html`은 항상 제외). 테스트 answers 순서: memory·superpowers·codex·legacy·SEO·작성도구. E2E 정상값(기본 옵션): 에이전트 23·스킬 89(SEO y 시 113)·훅 20·규칙 5·커맨드 9, 매니페스트 `templates: ["fortune-app"]`.

**Why:** 사용자가 "사주·손금·타로 앱 만들 예정"으로 자산을 요청했고(09-09), 이후 "캐주얼하게 하는 것"이라 안전·규제·결제 자산이 과잉이라고 판단(09-11).

**How to apply:**
- 운세 앱 export 시 `./project-install.sh → 12`, SEO 질문은 n. 자산 작업 전 `git fetch` + `main..origin/main` 확인(09-10 번호 충돌 교훈).
- PENDING_TEST 잔여 1종(만세력) 졸업 조건은 `docs/skills/PENDING_TEST.md`(KASI 대조).
- 안전 기능이 다시 필요해지면 dream 자산(`meta/dream-safety-classifier-prompts`·`validation/dream-safety-classifier`)을 참고해 운세용으로 새로 쓴다.

**운영 교훈 (재발 시 절차)**: skill-creator 13종 병렬은 세션 한도(429)로 병합 에이전트가 중단됨 → `isolation: worktree` 산출물은 `.claude/worktrees/agent-*/`에 untracked로 남으니 `git status`로 확인 후 `diff -q`로 대조해 누락분만 복사, 끝나면 `git worktree remove --force` + `prune`. skill-tester 12종 동시 실행은 동시 서브에이전트 상한 20에 걸려 1종이 멈춤 → 6~8종씩 나누거나 SendMessage로 재개. 관련: [[project_dream_app_complete_2026-05]], [[project_full_audit_2026-09-11]], [[feedback_skill_testing_enforcement]].
