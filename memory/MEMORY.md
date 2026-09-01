# Memory Index

## Reference
- [comux/copad 자료+사용법](reference_comux_copad.md) — AI 에이전트용 tmux 스타일 멀티플렉서. 사용자 맥 설치 완료(2026-08-07), 레포별 세션 분리·단축키·링크 정리

## User
- [사용자 프로필](user_profile.md) — 풀스택 개발자. 프론트엔드(lfos-ui Next.js 모노레포 + lf-ui CRA 레거시) + Java 레거시 백엔드(SB 2.5+MyBatis+Oracle+MySQL+Redisson 2+EhCache 2+AWS SDK v1) 운영

## Feedback
- [README 업데이트 로그 규칙](feedback_readme_log.md) — 날짜별 단일 행 유지, 같은 날 여러 변경은 기존 행에 합산
- [커밋은 사용자 요청 시에만](feedback_commit_policy.md) — 자동 커밋·제안 금지, 요청 시 실행 전 메모리 정리 선행 후 [memory] 커밋 포함, main push는 branch-protection이 차단(PR 경유)
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
- [적대적 테스트 강제](feedback_adversarial_testing.md) — 테스트는 정상 흐름만 아니라 악성 유저 방어·이상 경로까지 필수, 테스트 통과용 하드코딩 return 금지(A안 hard block). adversarial-test-guard·fake-impl-guard 훅
- [실시간 이벤트 정보는 유저 인증 우선 검증](feedback_live_event_info_verification.md) — 유튜브·커뮤니티 인증 먼저, 언급 부재≠불가, 검색 AI 요약은 원문 검증 전 인용 금지
- [사진 재현은 회전 방향 먼저 확정](feedback_pdf_photo_reproduction_rotation.md) — 180°(top→bottom)와 90° CCW(top→left) 혼동 시 행·열 전치. 기존 `pdf변환/` 스크립트부터 확인
- [수정본은 새 파일명 + 미리보기 동봉](feedback_output_revision_delivery.md) — 같은 이름 덮어쓰기 금지(뷰어가 옛 버전 표시), 레이아웃 논쟁은 좌표로 제시
- [라이브러리 스킬은 실제 사용량 실측 후 생성](feedback_verify_usage_before_library_skill.md) — package.json 의존성≠사용. import 파일 수 두 자리 이상일 때만 전용 스킬. vanilla-extract 죽은 devDep 사례
- [토큰 95% 소진 시 일시 정지](feedback_pause_at_95_percent_tokens.md) — 장기 작업은 병렬 가능한 것만 병렬, 잔여 5% 이하면 새 작업 금지·완료/미완 목록+재개법 보고 후 멈춤

## Project — 컨벤션 자산 인프라

- [하네스 평가 & 훅 다이어트 완료](project_hook_diet_plan.md) — 2026-07-04 5단계 완료 + PR #9 머지. 2026-07-10 메모리 개편(memory-stop-guard 삭제)으로 훅 22종. 후순위 중 플러그인 전환은 2026-07-09 계획 수립 착수
- [메모리 저장 구조 (2026-07-10 개편)](project_memory_architecture.md) — 전역 실제 디렉토리 = 1차 저장, 레포 memory/ = 워킹트리 미러, 자동 커밋 전면 폐지(memory·exports), Y/N 판별 = 레포 memory/ 존재 여부. export --refresh는 `CLAUDE_PROJECT_DIR` env 필수(없으면 무음 no-op), push는 커밋과 별도 Bash 호출로
- [Claude 구독 중계 서버(05_gugbab-claude-relay) 계획](project_claude_relay_plan.md) — Vercel Sandbox+claude -p 구독 인증 SSE 중계. 스킬 2종 APPROVED(2026-07-03), 스캐폴딩 미착수
- [전수검사·정리 (2026-08-11)](project_full_audit_2026-08-11.md) — 스킬 209·에이전트 67 전수 감사, 에이전트 4종 정리(67→63), 긴급 스킬 7종 갱신, UPDATE 백로그 12건
- [doctor 컨텍스트 최적화 (2026-08-10)](project_doctor_context_optimization.md) — rules 5종 paths 스코핑·auto 모드 적용, 스킬 209종 목록 미노출 발견(정리 작업 1단계)
- [project-install.sh 이식 아키텍처](project_install_architecture.md) — 11개 템플릿(0~10), JAVA_SKILLS_* 필터, 2026-08-31 누수 차단(java·rust·unity)+references 복사+매니페스트 docs kind+template-separation E2E, gen-settings.js로 settings.json 생성
- [lfcp-ui-ssr 설치 타깃 실측 (2026-09-01)](project_lfcp_ui_ssr_target.md) — lfmall SEO·GEO용 Java 11+SB 2.5+JSP 봇 대응 SSR. 템플릿 `5,11`(java-legacy + seo-geo 애드온, 커머스 프로파일 c). seo-geo 템플릿 신설 계기
- [lfcp-nxapi 설치 타깃 실측 (2026-08-31)](project_lfcp_nxapi_target.md) — 실무 Java 레거시 커머스 API. java-spring-legacy(5) 1:1 매칭, Oracle 전용·Redisson 2.15.2·Joda 269파일 실측, SAP JCo·log4j1 잔재 참고
- [프로젝트 scope 전용 원칙](project_scope_only.md) — gugbab-claude 모든 산출물은 프로젝트 scope에만, 글로벌(~/.claude) 설정 금지
- [MCP 미사용 결정](project_mcp_decision.md) — WebSearch/WebFetch만 사용, 팀 이식성 우선
- [Claude Code 설치 환경·npm SSL 우회](project_claude_install_environment.md) — 단일 nvm-global 설치(2.1.226, 2026-08-10 이중화 재해소), 업데이트 후 버전 안 바뀌면 .npm-global 중복 의심, npm tgz가 SELF_SIGNED_CERT로 막히면 curl 우회 절차 사용
- [PDF 빈칸 뚫기 워크플로우](project_pdf_blank_workflow.md) — 반복 요청 작업(첫 건 2026-07-13 종결). 글자(char) 단위 판정·줄별 분리·침범 금지 6대 주의사항 + 검증 6종. 파일은 사용 후 삭제됨 — 재요청 시 메모리 기준 재작성, 미세 침범 개선 반영해 시작
- [PDF 근무표 양식 생성 워크플로우](project_pdf_schedule_form_workflow.md) — 반복 요청 작업(2026-07-15 첫 건, 2026-08-13 재요청). 요일=상단 가로 / 홀·주방=좌측 세로 8행이 불변 조건. 스크립트 전문 포함, 재요청 시 `pdf변환/make-schedule.py` 먼저 확인
- [프론트 도메인 리팩터링 자산 정비 (2026-08-26)](project_frontend_domain_refactor_assets_2026-08-26.md) — 타깃 2개(lfos-ui Next16 모노레포 / lf-ui Vite+React18+Recoil+MUI5+TS4.7 레거시) 스택 실측표, 깨진 스킬 참조 수리, 신규 스킬 8종+에이전트 1종, `--legacy` 훅 프로파일·SEO 옵트아웃·commands export. 작업은 레포에서만, 타깃은 export 대상
- [PDF 재고량 표 생성 워크플로우](project_pdf_inventory_form_workflow.md) — 2026-08-13 수용. A4 세로·품목/재고량(넓게)/기타 3열·여분 3줄·한 줄 걸러 음영. 품목 15종 리스트 포함

### 자산 이력 (커밋·푸시 완료)

- [★ 레포 개편 전체 완료 (2026-06-12)](project_overhaul_progress.md) — 작업1~5 전부 완료. 스킬 224→202종, 훅 20→28종(공통 19·dev 4·Codex 1), docs 전체 구조 신설, 9종 templates·examples
- [★ SEO·GEO·웹표준 인프라 1·2·3차 (2026-06-04)](project_seo_geo_assets_2026-06.md) — 스킬 28종 + 에이전트 4종. 전체 커밋·푸시 완료
- [★ Unity 게임 개발 인프라 전체 완료 (2026-06-10)](project_unity_gamedev_assets_plan.md) — 스킬 17종 + 에이전트 6종 APPROVED. Phase 1~7 완료
- [스킬/에이전트 frontmatter 업그레이드 (2026-06-06)](project_skill_agent_frontmatter_upgrade_2026-06.md) — A1~C2 전체 완료. disable-model-invocation·permissionMode·isolation·background 필드 + InstructionsLoaded·UserPromptSubmit 훅
- [프론트엔드 성능 벤치마킹 인프라 (2026-05-14)](project_perf_benchmarking_assets_2026-05-14.md) — 스킬 5종 + validation 에이전트 2종. 69 클레임 VERIFIED
- [꿈 해몽 앱 인프라 통합 (2026-05-14·15)](project_dream_app_complete_2026-05.md) — 스킬 28종 + 에이전트 5종. content test 84/84 PASS
- [Python + n8n 인프라 (2026-05-15)](project_python_n8n_assets_2026-05-15.md) — Python 16종 + n8n 5종. content test 21/21 PASS
- [범용 워크플로우 에이전트 9종 (2026-05-15)](project_workflow_agents_2026-05-15.md) — meta 3 + backend 5 + validation 1. "0→MVP" 갭 메움
