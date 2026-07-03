# Memory Index

## User
- [사용자 프로필](user_profile.md) — 풀스택 개발자. 프론트엔드(lfos-ui Next.js 모노레포 + lf-ui CRA 레거시) + Java 레거시 백엔드(SB 2.5+MyBatis+Oracle+MySQL+Redisson 2+EhCache 2+AWS SDK v1) 운영

## Feedback
- [README 업데이트 로그 규칙](feedback_readme_log.md) — 날짜별 단일 행 유지, 같은 날 여러 변경은 기존 행에 합산
- [커밋은 사용자 요청 시에만](feedback_commit_policy.md) — 작업 완료 후 자동 커밋 금지
- [병렬 에이전트 README 충돌 방지](feedback_parallel_readme.md) — 병렬 스킬 생성 시 README 동시 수정 금지, 완료 후 한 번에 정리
- [플러그인 설치는 claude CLI로 끝낸다](feedback_plugin_install.md) — `claude plugin marketplace add` + `install` Bash 실행, 프로젝트 scope `enabledPlugins`만, user-scope 별도
- [스킬 생성 후 2단계 테스트 즉시 수행](feedback_skill_testing_enforcement.md) — skill-creator → skill-tester 순차 호출 필수, pending-test-guard 훅이 세션 종료 차단
- [셀프 검증으로 skill-tester 대체 금지](feedback_skill_tester_self_replacement_anti.md) — "수행일" 라인 형식만 박고 "skill-tester 호출 미수행" 자백하는 패턴 금지. 2026-05-08 훅 강화로 차단됨
- [기술 비교는 중립 관점이 기본](feedback_neutral_tech_comparison.md) — "내 프로젝트 기준"이 명시되지 않으면 신규/중립 관점으로 비교, 기존 스택 대입은 선택 섹션으로만
- [verification.md 섹션 7·8까지 cleanup 확인](feedback_verification_full_cleanup.md) — skill-tester 후 섹션 5·6만 업데이트되는 누락 케이스 있으므로 메인이 직접 전 섹션 동기화 확인
- [permission 프롬프트 줄이기 작업 맥락](feedback_permission_prompt_reduction.md) — defaultMode acceptEdits / permission 키 단순화 / hook 경로 절대화는 allow 팝업 감소 목적의 의도된 변경
- [검증 단계 생략 금지 — 명시적 강도 요구](feedback_verification_strictness.md) — 학술·논문 작업에서 fact-checker/source-validator/skill-tester/통합 시나리오 모두 수행, "역할 정의만 있으면 생략 가능" 안주 금지
- [정적 절대경로 작성 금지](feedback_no_static_paths.md) — 문서에 `/Users/lf/...` 박지 말고 상대경로(`./...`) 또는 placeholder(`<프로젝트 루트>/`, `~/.../<해시>/`)로 작성. 다른 사람·다른 PC도 이해 가능하게
- [verification.md 작성 4원칙](feedback_verification_md_rules.md) — 로컬 프로젝트명·PR 번호 박기 금지, 일괄 업데이트는 사전 승인, 자의적 부분 적용 금지, content test PASS = APPROVED 가능 카테고리 구분
- [네이밍은 이름만으로 의미 전달](feedback_naming_clarity.md) — Group A/B/C 같은 임시 라벨 금지. dream-app→dream-interpretation처럼 목적이 드러나는 이름 사용
- [codex review 워크플로우 제약·패턴](feedback_codex_review_workflow.md) — --uncommitted+prompt 병용 불가(v0.122.0), isLoggedIn에 2>&1 필수, Stop훅 기본 600s로 별도 timeout 불필요

## Project — 컨벤션 자산 인프라

- [Claude 구독 중계 서버(05_gugbab-claude-relay) 계획](project_claude_relay_plan.md) — Vercel Sandbox+claude -p 구독 인증 SSE 중계. 스킬 2종 APPROVED(2026-07-03), 스캐폴딩 미착수
- [project-install.sh 이식 아키텍처](project_install_architecture.md) — 10개 템플릿(0~9), JAVA_SKILLS_* 필터, scripts/gen-settings.js로 settings.json 생성
- [프로젝트 scope 전용 원칙](project_scope_only.md) — gugbab-claude 모든 산출물은 프로젝트 scope에만, 글로벌(~/.claude) 설정 금지
- [MCP 미사용 결정](project_mcp_decision.md) — WebSearch/WebFetch만 사용, 팀 이식성 우선

### 자산 이력 (커밋·푸시 완료)

- [★ 레포 개편 전체 완료 (2026-06-12)](project_overhaul_progress.md) — 작업1~5 전부 완료. 스킬 224→202종, 훅 20→28종(공통 19·dev 4·Codex 1), docs 전체 구조 신설, 9종 templates·examples
- [★ SEO·GEO·웹표준 인프라 1·2·3차 (2026-06-04)](project_seo_geo_assets_2026-06.md) — 스킬 28종 + 에이전트 4종. 전체 커밋·푸시 완료
- [★ Unity 게임 개발 인프라 전체 완료 (2026-06-10)](project_unity_gamedev_assets_plan.md) — 스킬 17종 + 에이전트 6종 APPROVED. Phase 1~7 완료
- [스킬/에이전트 frontmatter 업그레이드 (2026-06-06)](project_skill_agent_frontmatter_upgrade_2026-06.md) — A1~C2 전체 완료. disable-model-invocation·permissionMode·isolation·background 필드 + InstructionsLoaded·UserPromptSubmit 훅
- [프론트엔드 성능 벤치마킹 인프라 (2026-05-14)](project_perf_benchmarking_assets_2026-05-14.md) — 스킬 5종 + validation 에이전트 2종. 69 클레임 VERIFIED
- [꿈 해몽 앱 인프라 통합 (2026-05-14·15)](project_dream_app_complete_2026-05.md) — 스킬 28종 + 에이전트 5종. content test 84/84 PASS
- [Python + n8n 인프라 (2026-05-15)](project_python_n8n_assets_2026-05-15.md) — Python 16종 + n8n 5종. content test 21/21 PASS
- [범용 워크플로우 에이전트 9종 (2026-05-15)](project_workflow_agents_2026-05-15.md) — meta 3 + backend 5 + validation 1. "0→MVP" 갭 메움
