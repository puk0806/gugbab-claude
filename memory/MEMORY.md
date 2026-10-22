# Memory Index

## ★ 하네스 현재 상태
- [★★ 하네스 현재 상태 (2026-10-21 갱신) — 여기부터 읽기](project_harness_status_2026-10-15.md) — shim 래퍼로만 사용, 설치본 v1.0.14(결정 42 변수 읽기 자동·43 📌 표시 — lfmall 은 전달 끝·신경 안 씀, 윈도우 브랜치엔 main 추가분 할 일을 메모리로 넣음), 321 항목(훅 32·고정 35·켬 70·끔 216). 남은 제안: 태그 보호·Codex 리뷰·고정 훅 fail-closed·윈도우(구현·윈도우 실측 끝, main 병합·맥 회귀·PR 남음). 설치는 PATH 를 묻지 않고 자동 추가(v1.0.12). 기본값·고정 = 계획서 페이지 + `docs/DEFAULTS.md`. **수정 작업은 마지막 줄 `진행할까요?`**
- [★ 개편 방향 = shim wrapper (2026-10-15)](project_shim_wrapper_direction.md) — `gugbab-claude` 래퍼 + 프로젝트별 `CLAUDE_CONFIG_DIR` + `/harness` 토글. 플러그인 제안 거부됨. **2026-10-17 0~4단계 완료·PR #24 머지, 래퍼로만 사용(결정 27) — README 래퍼 전용·로그는 docs/CHANGELOG.md** → v1.0.5 까지 릴리스(결정 35 새 래퍼 재실행), 2026-10-19 결정 36(세션 시작 때 하네스 버전·vA→vB 표시, v1.0.6 머지) → 결정 37(SessionStart systemMessage 는 화면에 안 보여 Claude 가 첫 답변 맨 위에 전달, v1.0.7 머지·설치본 반영) — 남은 한계: 첫 메시지 전엔 화면에 안 보임, 래퍼 출력/상태줄 미결정. `gugbab-claude --version` 은 claude 버전임 → 결정 38(dash `set -m` 으로 comux 에이전트 감지 + `sessions/` 공유로 세션 간 메시지, v1.0.8) → 결정 39(이 프로젝트 메모리 폴더 env 허용 + 설치 폴더 Bash 쓰기 확인, v1.0.9 머지·설치본 반영) → 결정 40(SendMessage 자동 — 받는 세션이 확인, v1.0.11 머지·설치본 반영). 남은 제안: 태그 보호·Codex 리뷰·고정 훅 fail-closed
- [윈도우 지원 — PoC·1~4단계 구현·윈도우 실측 완료, 브랜치 푸시 (2026-10-20~21, 결정 41)](project_windows_support_analysis.md) — 사용자 윈도우 PC 에서 PoC(로그인=빈 값 변수 OK·구조 유지)·Node 래퍼 `cli/launch.js`+`.cmd`·junction/하드링크·`install.ps1`·훅 윈도우 경로·E2E/매트릭스 Node 이식. main(PR #41·#42) 병합 완료(윈도우 `~` 보안 회귀 수정)·병합 뒤 대화형·M2·M3·M8·M11 실측 통과. 2026-10-22 맥 회귀(M13)·테스트 보강·CI 추가 끝. **다음: 윈도우 재확인 목록 → PR(bump)**
- [Codex 리뷰는 1차본 완성 후 맨 마지막 (중지 중)](feedback_codex_review_on_request.md) — `codex.skipReview=true` 유지, 구현 중 재개 여부 다시 묻지 않음, 완료 후 `--unset` 하고 리뷰
- [개편 계획서 항상 최신화](feedback_keep_plan_synced.md) — 결정 바뀌면 그 턴에 레포 `docs/plans/` 문서 + 아티팩트 페이지 함께 갱신
- [로컬 전용 메모리 목록](local_index.md) — git 제외(.gitignore), 이 PC에만 있음. 개편 범위 밖 내용은 여기 먼저 확인

## 하네스 구조 지식
- [래퍼 vs 프로젝트 설정 우선순위 실측 (2026-10-19)](reference_wrapper_project_settings_precedence.md) — 하네스=사용자 범위, 훅은 모두 실행·값은 local>프로젝트>하네스·deny는 못 풂·같은 이름은 하네스가 뺌. 신뢰 안 한 폴더는 프로젝트 allow 무시. 세션 간 메시지는 터미널 무관
- [하네스 구조 요약·구조도 링크](reference_harness_structure.md) — 이벤트 순서는 Claude Code 고정, settings.json은 훅 배치만. SessionStart 훅은 차단 불가(지시 주입), 실제 차단은 Pre/Post/Stop. 테스트 274(실설치 검사 5종)
- [project-install.sh 이식 아키텍처](project_install_architecture.md) — 템플릿 0~15(8 academic 폐지·결번, 11 seo-geo·14 spec-extraction 애드온, 15 nexacro 레거시 강제), JAVA_SKILLS_* 필터, 누수 차단·references 복사·매니페스트 docs kind·template-separation E2E, gen-settings.js로 settings.json 생성
- [하네스 평가 & 훅 다이어트 완료](project_hook_diet_plan.md) — 2026-07-04 5단계 완료 + PR #9 머지. 2026-07-10 메모리 개편으로 훅 22종. 플러그인 전환은 2026-07-09 계획 수립만
- [메모리 저장 구조 (2026-07-10 개편)](project_memory_architecture.md) — 전역 실제 디렉토리 = 1차 저장, 레포 memory/ = 워킹트리 미러, 자동 커밋 전면 폐지(memory·exports). export --refresh는 `CLAUDE_PROJECT_DIR` env 필수, push는 커밋과 별도 Bash 호출로
- [doctor 컨텍스트 최적화 (2026-08-10)](project_doctor_context_optimization.md) — rules 5종 paths 스코핑·auto 모드 적용, 스킬 목록 미노출 발견
- [프로젝트 scope 전용 원칙](project_scope_only.md) — gugbab-claude 모든 산출물은 프로젝트 scope에만, 글로벌(~/.claude) 설정 금지
- [MCP 미사용 결정](project_mcp_decision.md) — WebSearch/WebFetch만 사용, 팀 이식성 우선
- [세션 일괄 메모리 저장·재시작 절차](project_multi_session_memory_save_restart.md) — ListAgents+SendMessage 병렬 요청, mtime으로 완료 확인, 원격 재시작 불가(각 터미널 `/exit`→`claude -c`)
- [Claude Code 설치 환경·npm SSL 우회](project_claude_install_environment.md) — 단일 nvm-global 설치, 업데이트 후 버전 안 바뀌면 .npm-global 중복 의심, SELF_SIGNED_CERT면 curl 우회, `ENOTEMPTY rename` 잔재 삭제, postinstall 미완료 시 `claude` 실행 불가

## User
- [사용자 프로필](user_profile.md) — 풀스택 개발자. 프론트엔드(Next.js 모노레포 + CRA 레거시) + Java 레거시 백엔드(SB 2.5+MyBatis+Oracle+MySQL+Redisson 2+EhCache 2+AWS SDK v1) 운영

## Feedback — 작업 방식
- [자동 허용은 읽기만 넓힌다](feedback_auto_allow_reads_only.md) — Edit·Write·삭제·실행은 새로 자동 허용 금지, 훅으로 강제·적대 테스트, 바꾸기 전 실제 확인 창 기록 재생으로 효과 수치 보고 (결정 42)
- [커밋은 사용자 요청 시에만](feedback_commit_policy.md) — 자동 커밋·제안 금지, 요청 시 실행 전 메모리 정리 선행 후 [memory] 커밋 포함, main push는 branch-protection이 차단(PR 경유)
- [삭제 요청은 범위를 좁게](feedback_deletion_scope_narrow.md) — 확정/경계/유지로 나눠 경계는 질문, 검색·검증 범용 에이전트는 휩쓸어 지우지 않음, 남는 자산의 설치 경로 이관
- [기준은 항상 원본 레포](feedback_source_repo_is_standard.md) — 설치본이 쓰고 있어도 원본 기준 불필요면 제거, 프로젝트별 보존 예외 없음, 유용한 내용만 원본으로 흡수 후 재설치로 배포
- [설치본 사정으로 원본 export 동작 바꾸지 않기](feedback_no_target_driven_changes.md) — 원본은 그 자체로 정상, export는 대상을 원본 기준으로 전부 갱신
- [전수 감사 사각지대](feedback_audit_blind_spots.md) — 훅 I/O 규약 대조·설치본 역류·실설치 참조 스캔·짝 단위 처리. 교훈은 테스트로 강제하고 감사 계획에 체크리스트로 직접 포함
- [적대적 테스트 강제](feedback_adversarial_testing.md) — 악성 유저 방어·이상 경로까지 필수, 테스트 통과용 하드코딩 return 금지. adversarial-test-guard·fake-impl-guard 훅
- [permission 프롬프트 줄이기 작업 맥락](feedback_permission_prompt_reduction.md) — defaultMode acceptEdits / permission 키 단순화 / hook 경로 절대화는 의도된 변경
- [플러그인 설치는 claude CLI로 끝낸다](feedback_plugin_install.md) — `claude plugin marketplace add` + `install` Bash 실행, 프로젝트 scope `enabledPlugins`만
- [codex review 워크플로우 제약·패턴](feedback_codex_review_workflow.md) — --uncommitted+prompt 병용 불가, isLoggedIn에 2>&1 필수. ChatGPT 계정+`gpt-5.4` config는 400 거부 → 2회 시도 후 마커 기록·사용자 보고
- [병렬 에이전트 README 충돌 방지](feedback_parallel_readme.md) — 병렬 스킬 생성 시 README 동시 수정 금지, 완료 후 한 번에 정리
- [README 업데이트 로그 규칙](feedback_readme_log.md) — 날짜별 단일 행 유지, 같은 날 여러 변경은 기존 행에 합산. 2026-10-17부터 위치는 docs/CHANGELOG.md
- [테스트 전부 끝내고 보고](feedback_report_after_full_tests.md) — 하네스 수정은 단위 → `wrapper-e2e.sh --dev` → 고치기 전·후 실세션 비교까지 순서대로 마친 뒤 한 번에 보고. 시험 메시지는 이 세션으로
- [토큰 95% 소진 시 일시 정지](feedback_pause_at_95_percent_tokens.md) — 장기 작업은 병렬 가능한 것만 병렬, 잔여 5% 이하면 새 작업 금지·완료/미완 목록+재개법 보고 후 멈춤

## Feedback — 스킬·검증
- [스킬 생성 후 2단계 테스트 즉시 수행](feedback_skill_testing_enforcement.md) — skill-creator → skill-tester 순차 호출 필수, pending-test-guard 훅이 세션 종료 차단
- [셀프 검증으로 skill-tester 대체 금지](feedback_skill_tester_self_replacement_anti.md) — "수행일" 형식만 박고 "skill-tester 호출 미수행" 자백하는 패턴 금지
- [verification.md 섹션 7·8까지 cleanup 확인](feedback_verification_full_cleanup.md) — skill-tester 후 섹션 5·6만 업데이트되는 누락 케이스 있으므로 메인이 직접 전 섹션 동기화 확인
- [verification.md 작성 4원칙](feedback_verification_md_rules.md) — 로컬 프로젝트명·PR 번호 박기 금지, 일괄 업데이트는 사전 승인, 자의적 부분 적용 금지, content test PASS = APPROVED 가능 카테고리 구분
- [검증 단계 생략 금지 — 명시적 강도 요구](feedback_verification_strictness.md) — fact-checker/source-validator/skill-tester/통합 시나리오 모두 수행
- [라이브러리 스킬은 실제 사용량 실측 후 생성](feedback_verify_usage_before_library_skill.md) — package.json 의존성≠사용. import 파일 수 두 자리 이상일 때만 전용 스킬
- [기술 비교는 중립 관점이 기본](feedback_neutral_tech_comparison.md) — "내 프로젝트 기준"이 명시되지 않으면 신규/중립 관점으로 비교
- [실시간 이벤트 정보는 유저 인증 우선 검증](feedback_live_event_info_verification.md) — 유튜브·커뮤니티 인증 먼저, 언급 부재≠불가, 검색 AI 요약은 원문 검증 전 인용 금지

## Feedback — 문서·산출물
- [정적 절대경로 작성 금지](feedback_no_static_paths.md) — 문서에 `/Users/lf/...` 박지 말고 상대경로 또는 placeholder로
- [네이밍은 이름만으로 의미 전달](feedback_naming_clarity.md) — Group A/B/C 같은 임시 라벨 금지
- [문서 재구성 시 내용 유지](feedback_doc_restructure_keep_content.md) — 구조 변경은 위치만 옮기고 원문·체크·그림 그대로, 대조 후에만 원본 삭제. Docs는 탭 간 move 불가
- [강조는 본문 제자리 굵게](feedback_doc_emphasis_inline.md) — 맨 위 요약 섹션·강조 박스 만들지 말 것, 기존 문장 핵심 구절만 굵게
- [아티팩트 UI는 실제 입력으로 검증](feedback_artifact_ui_verification.md) — JS click 시험만으로 "고쳤다" 금지, CDP 실제 마우스·휠 필수, 크롬 확장은 claude.ai 아티팩트 안 입력 불가 → 실화면 미확인 명시
- [수정본은 새 파일명 + 미리보기 동봉](feedback_output_revision_delivery.md) — 같은 이름 덮어쓰기 금지, 레이아웃 논쟁은 좌표로 제시
- [사진 재현은 회전 방향 먼저 확정](feedback_pdf_photo_reproduction_rotation.md) — 180°와 90° CCW 혼동 시 행·열 전치. 기존 `pdf변환/` 스크립트부터 확인

## 자산 구축 이력 (완료·머지)
- [전수 점검·모델 현행화 (2026-09-25, PR #18 머지)](project_full_audit_2026-09-25.md) — Opus 5.5/Fable 5.1 현행화, 신규 스킬 5·에이전트 1·템플릿 13 python-fastapi, 31종 references 분리. 이후 09-28 학술 자산 삭제까지 기록
- [전수감사 + 백로그 수정 (2026-09-11, PR #17 머지)](project_full_audit_2026-09-11.md) — 감사 백로그 7항을 TDD로 수정, E2E 30/30. 후속 과제: docs 프루닝·statusline 배선·구 템플릿 문서 카운트
- [운세 앱(fortune-app) 자산 (2026-09-10~14, PR #17 머지)](project_fortune_app_assets_2026-09-10.md) — 스킬 10종·에이전트 1종·템플릿 12. 병렬 생성 한도 문제·워크트리 회수 절차
- [프론트 도메인 리팩터링 자산 정비 (2026-08-26)](project_frontend_domain_refactor_assets_2026-08-26.md) — 타깃 2개 스택 실측표, 신규 스킬 8종+에이전트 1종, `--legacy` 훅 프로파일·SEO 옵트아웃·commands export
- [전수검사·정리 (2026-08-11)](project_full_audit_2026-08-11.md) — 스킬 209·에이전트 67 전수 감사, 에이전트 4종 정리, UPDATE 백로그 12건
- [★ 레포 개편 전체 완료 (2026-06-12)](project_overhaul_progress.md) — 스킬 224→202종, 훅 20→28종, docs 전체 구조 신설, 9종 templates·examples
- [★ SEO·GEO·웹표준 인프라 (2026-06-04)](project_seo_geo_assets_2026-06.md) — 스킬 28종 + 에이전트 4종
- [★ Unity 게임 개발 인프라 (2026-06-10)](project_unity_gamedev_assets_plan.md) — 스킬 17종 + 에이전트 6종 APPROVED
- [스킬/에이전트 frontmatter 업그레이드 (2026-06-06)](project_skill_agent_frontmatter_upgrade_2026-06.md) — disable-model-invocation·permissionMode·isolation·background 필드 + InstructionsLoaded·UserPromptSubmit 훅
- [프론트엔드 성능 벤치마킹 인프라 (2026-05-14)](project_perf_benchmarking_assets_2026-05-14.md) — 스킬 5종 + validation 에이전트 2종
- [꿈 해몽 앱 인프라 (2026-05-14·15)](project_dream_app_complete_2026-05.md) — 스킬 28종 + 에이전트 5종
- [Python + n8n 인프라 (2026-05-15)](project_python_n8n_assets_2026-05-15.md) — Python 16종 + n8n 5종
- [범용 워크플로우 에이전트 9종 (2026-05-15)](project_workflow_agents_2026-05-15.md) — meta 3 + backend 5 + validation 1

## 하네스 외 작업 (이 레포 세션에서 한 개인 작업)
- [PWA 예약 푸시 앱 계획 (2026-09-17)](project_pwa_scheduled_push_app.md) — Next.js PWA + Vercel Workflow + web-push + Drizzle/Neon, 스킬 2종 APPROVED, 앱 프로젝트 미착수
- [Claude 구독 중계 서버(05_gugbab-claude-relay) 계획](project_claude_relay_plan.md) — Vercel Sandbox+claude -p 구독 인증 SSE 중계. 스킬 2종 APPROVED, 스캐폴딩 미착수
- [comux/copad 자료+사용법](reference_comux_copad.md) — AI 에이전트용 tmux 스타일 멀티플렉서. 업데이트 절차·copadd LaunchAgent 함정
- [PDF 빈칸 뚫기 워크플로우](project_pdf_blank_workflow.md) — 반복 요청 작업. 글자 단위 판정·침범 금지 6대 주의사항 + 검증 6종
- [PDF 근무표 양식 생성 워크플로우](project_pdf_schedule_form_workflow.md) — 요일=상단 가로 / 홀·주방=좌측 세로 8행 불변. 재요청 시 `pdf변환/make-schedule.py` 먼저 확인
- [PDF 재고량 표 생성 워크플로우](project_pdf_inventory_form_workflow.md) — A4 세로·3열·여분 3줄·한 줄 걸러 음영. 품목 15종
- 강아지 영상(dog-video)은 2026-10-15 `~/Desktop/gugbab-workspace/dog-video`로 폴더·메모리 모두 이동
