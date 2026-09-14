---
name: project_full_audit_2026-09-11
description: 2026-09-11 스킬 233·에이전트 66·훅 22 전수 감사 + export 13템플릿 E2E — 같은 날 오후 백로그 7항 중 6항 수정 완료(CLAUDE.md 규칙 행 자동 제거·python 에이전트/스킬 누수·dream/fortune dev 승격·SEO 옵트인·깨진 참조 8건·문서 정확성), 남은 후속 과제와 결함 아님 판정
metadata: 
  node_type: memory
  type: project
  originSessionId: 75f2c8a6-9ce3-47ab-8781-9e88fa61e2ec
  modified: 2026-09-11T07:11:18.920Z
---

# 전수 감사 + export E2E (2026-09-11 오전 읽기 전용 → 오후 수정 완료)

**수정 결과 (2026-09-11 오후, 사용자 "전체 전수 검사 진행" 승인)**: 아래 백로그 1·2·4·5·6·7 수정 완료, 3은 SEO 옵트인 프롬프트로 해결. 방식: `scripts/template-separation.test.js`에 실패 테스트 먼저 추가(danglingRuleRefs 헬퍼·python 에이전트/스킬·util/academic 신규 케이스·react 작성도구 y 대조·dream/fortune dev 훅·SEO 기본 n) → `project-install.sh` 수정 → 29/29 통과 + 훅 테스트 전체 통과.
- 1: CLAUDE.md 생성부 끝에 "대상 `.claude/rules/`에 없는 규칙을 `@.claude/rules/`로 가리키는 *표 행*(`|` 시작)만 grep -v로 제거". 본문 문장은 건드리지 않음(RULES_COMMON만 본문 참조 전제, 테스트가 감시).
- 2: `EXCLUDE_AGENTS_RUST/JAVA/GAME`에 python 2종 + `PYTHON_AGENTS_NEWLY_EXCLUDED` 조합 무관 prune 기록. rust 스킬 필터에 `backend/python-*`·`redis-redisson-4` 차단, rust·unity에 `FRONTEND_ONLY_DEVOPS_SKILLS`(site-migration-seo·VR). **n8n·vercel-sandbox는 rust 소유라 제외하지 않음**(혼합 재설치 테스트 전제).
- 3·4: dream(9)·fortune(12) → `is_dev_selected`(dev 훅 4·adversarial-testing 규칙·Codex 질문) + `is_seo_optin_selected`/`_seo_optin_skill_ok`(react/next와 같은 y/c/N, 기본 n). 기본 옵션 스킬 수가 118→89(fortune)·→98(dream)로 줄어든 것은 SEO 24종+정리분.
- 5: wcag→accessibility 참조 삭제(대체 스킬 없음), bundling-compiler vanilla-extract 문장 삭제, python-basics/pytest 삭제, rust-backend-developer 경로 9건 `backend/` 보정 + dotenvy 행 삭제.
- 6: util에 `is_dream_meta` 차단, academic에 SEO writing 차단. 7: CLAUDE.md:32 deny 문구 정정, storybook verification frontmatter 보정, 별자리 언급 제거(에이전트 축소와 함께).
- **같은 날 2차 (사용자 "voca·dream·health 전부 템플릿 레벨 → 다른 템플릿과 똑같은 레벨로")**: dream(9)·fortune(12)을 `is_ts_selected`·`typescript.md` 규칙에 추가(health와 동일 = dev 4 + TS 1 훅, 규칙 5, Codex·레거시 질문), health도 `is_seo_optin_selected`에 포함(필터는 옵션을 읽었지만 질문이 없어 전체 포함 고정이던 결함), `_seo_optin_skill_ok`가 `seo-static-html` 제외. health 분기에 `HEALTH_LLM_FRONTEND_SKILLS` 3종 예외(claude-api-streaming-frontend·chat-ui-pattern·pwa-offline-llm-fallback — DREAM_FRONTEND_SKILLS에 섞인 공용 스킬이 health에서 빠지던 결함). **매니페스트 `templates` 필드 신설**: `write-install-manifest.js` 9번째 인자 `$TEMPLATE_DISPLAY`(CSV), 최신값 교체(합집합 아님), kebab-case 외 폐기, 인자 생략 시 이월 — 기존 설치처(voca·dream)는 다음 재설치부터 기록됨. 테스트: template-separation 30/30, manifest 48, gen-settings 59, cleanup 194, prune 19, 훅 16 스위트 전부 PASS. 기본 옵션 정상값: fortune 89/23, dream 98/25, health 68/30 (스킬/에이전트), 셋 다 훅 20·규칙 5.
- **미수행 후속 과제**: docs 프루닝 미구현(`project-install.sh` docs 섹션), seo-geo 단독 시 a11y/perf 감사 에이전트 미포함(판단 보류), 레포 자체 settings.json statusline 미배선, `docs/templates/react-spa.md`·`nextjs.md` 훅 수(17종) 등 구 문서 카운트 부패, Codex 리뷰(전역 config 모델 문제로 미수행 — [[feedback_codex_review_workflow]] 규칙 5).

운세 앱 자산 커밋 전 사용자 요청("불필요·필요·export 일괄 검사 후 보고")으로 수행. 실측: 스킬 233(APPROVED 214/PENDING 19) · 에이전트 66 · 훅 22(settings 1:1) · 커맨드 10 · 규칙 14. 짝 누락·고아 docs·README 종수 불일치 0건. `node --test scripts/template-separation.test.js` 25/25 PASS, 템플릿 0~12 단독 + 조합 4종 전부 exit 0·매니페스트 유효·멱등·prune 정상.

**수정 백로그 (심각도순, 전부 직접 재현 확인):**
1. **CLAUDE.md 깨진 `@.claude/rules/` 참조** — `examples/CLAUDE.*.md`의 규칙 표가 정적이라 기본 옵션(작성도구 N·codex N)이면 `agent-design`·`commands`·`readme-update`(·`codex-review`) 미설치인데 참조 남음. util 외 전 템플릿 3~4건. 수정처: `project-install.sh` CLAUDE.md 생성부(~1495행)에서 `INCLUDE_AUTHORING`/`INCLUDE_CODEX`로 행 제거.
2. **rust-axum·unity·java 에이전트 배제 목록에 python 에이전트 2종 누락**(`EXCLUDE_AGENTS_RUST/JAVA/GAME`, ~639-680행) + rust-axum 스킬 필터가 `is_java_skill`만 걸러 python 스킬 9~10종·`backend/redis-redisson-4`(Java 스킬인데 JAVA_SKILLS_* 미등록이라 java엔 빠지고 rust엔 들어감) 누출. `is_java_noncore_excluded`(n8n 5·site-migration-seo·VR·vercel-sandbox)가 rust·unity 분기 미적용. 테스트도 rust/unity 블록에서 agentFiles 미검사.
3. **fortune-app(12)·dream(9) SEO 20종+writing 4종 무조건 포함** — `docs/templates/fortune-app.md:78`에 문서화된 설계지만 `12,11` 조합이 no-op(스킬 118 동일). 옵트인 프롬프트 추가 여부는 사용자 판단.
4. **dream·fortune 템플릿에 dev 훅 미설치인데 qa-engineer 포함** — `is_dev_selected`에 9·12 없음 → adversarial-test-guard 없는데 qa-engineer 본문(:307)은 "훅이 차단"이라 명시. dev 훅 추가 또는 문구 수정 필요.
5. **깨진 스킬 참조**: `wcag-2.2-checklist:12,421`→frontend/accessibility 없음, `bundling-compiler:289`→vanilla-extract(삭제됨), `python-uv-project-setup:41`·`python-cli-typer:16`→python-basics/python-pytest 없음. `rust-backend-developer.md:43-52` 스킬 경로에 `backend/` 세그먼트 누락 9건 + `dotenvy` 스킬 부재.
6. util(1)에 dream meta 3종 누출(`meta/*` 필터 없음, dream만 전역 게이트 부재로 fortune과 비대칭). academic에 SEO writing 4종 혼입(저우선).
7. 문서 정확성: CLAUDE.md:32 "커밋·푸시 deny 목록으로 강제"는 사실과 다름(deny는 force-push·hard-reset만). 운세 에이전트 2종이 손금 0회·별자리 언급(별자리 스킬 없음). seo-geo 단독 시 a11y/perf/security 감사 에이전트 미포함. docs 프루닝 미구현(`project-install.sh:1430` 후속 과제). `storybook/verification.md` frontmatter date 누락. statusline.sh 레포 자체 settings 미배선.

**결함 아님으로 판정**: fortune-app 안 접두어 없는 공용 LLM·PWA·음성 스킬 공유는 의도([[project_fortune_app_assets_2026-09-10]]). 비차단 훅 6종 테스트 부재는 문서화된 설계. `0/all`이 전부 포함하므로 죽은 자산 0. fortune에 이미지 안전 분류기 없는 것은 이미지 생성 기능 부재로 정합. 검증일 60일 경과 183/233은 정보성.

**Why:** 운세 자산 커밋 전 품질 게이트. 이전 세션(2026-09-10)은 세션 한도 429 + macOS Desktop TCC 차단으로 중단돼 결과 유실 → 2026-09-11 재실행.

**다음 세션 재개 절차 (2026-09-11 사용자 지시: "다른 세션에서 이어서 작업")**: ① `git status`로 운세 앱 미커밋 46건이 그대로인지 확인 ② 사용자에게 백로그 1~7 중 수정 범위 확인(아직 미결정) ③ 수정 후 `node --test scripts/template-separation.test.js` + 템플릿 12·4·7 단독 설치로 재검증 ④ 운세 앱 자산 커밋은 사용자 요청 시 `[skill]`·`[agent]`·`[config]`·`[docs]`·`[memory]` 분리, main 보호라 브랜치+PR.

**How to apply:** 수정 착수 시 위 번호 순. 1·2·4는 `project-install.sh` + `scripts/template-separation.test.js` 동시 수정(테스트가 소스 버그를 복제하고 있음 — `foreign` 필터·rust/unity agentFiles 검사 확장). 감사 서브에이전트는 sonnet으로 3축 병렬이 한도 안에서 안정적. 관련: [[project_full_audit_2026-08-11]], [[project_install_architecture]].
