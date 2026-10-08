'use strict';
// template-ownership.test.js — 템플릿 소유 규칙 매트릭스 (2026-09-30)
//
// 배경: template-separation.test.js 는 "예전에 사고가 난 조합"만 개별 검사해서 rust·unity 설치에
// SEO 감사 에이전트가 새는 것을 놓쳤다. 여기서는 **자산 그룹 × 템플릿(+옵션) 전체**를 표 하나(OWNERSHIP)로
// 선언하고, 모든 칸을 실제 설치 결과와 대조한다.
//
// 표 작성 기준: project-install.sh 의 필터 코드가 아니라 docs/templates/*.md 의 에이전트·스킬 목록과
// 설치 스크립트 주석에 적힌 설계 의도(템플릿은 가산적 union, 0=전체, 옵션 제외는 템플릿보다 우선)다.
// 코드와 표가 어긋나면 표를 코드에 맞추지 말고 어느 쪽이 맞는지 판단한다.
//
// 불변식:
//  - 레포의 모든 스킬·에이전트·규칙·훅은 정확히 한 그룹에 속한다 (미분류 = 실패 → 새 자산 추가 시 소유 선언 강제)
//  - 그룹 멤버는 실제로 존재해야 한다 (오타 = 실패), 빈 그룹 금지, 폐지 템플릿(8) 참조 금지
//  - 설치 결과 ∩ 그룹 = 표가 말한 기대 집합 (누수·누락 모두 실패)
//
// 3계층 (rules/adversarial-testing.md):
//  - 정상: 템플릿 0~7·9~15 단독(SEO 옵트인은 n/y 둘 다, seo-geo 는 y/c) + 대표 조합 + 작성 도구 y
//    (2026-10-08: 14 spec-extraction 애드온·15 nexacro 스택 — 소유 그룹·누수 방지·순서 정규화 케이스 추가)
//  - 악성·오남용(tamper): 표 자체를 오염(오타 멤버·중복 소유·미분류 자산·폐지 템플릿·허용 목록 밖 부분집합)시켜
//    검증기가 스스로 실패하는지, 누수가 섞인 가짜 설치 결과를 비교기가 잡는지
//  - 경계: 빈 그룹, 조합 순서 뒤집기(11,4 == 4,11), 옵션 전용 그룹(기본값에선 항상 empty)
//
// 느린 테스트: 설치 약 30회(회당 수 초). os.tmpdir() 아래 임시 디렉터리에 설치하고 바로 삭제한다.

const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');
const INSTALLER = path.join(REPO, 'project-install.sh');

// ── 템플릿·옵션 정의 (docs/templates 기준) ──────────────────────────────
const TEMPLATE_IDS = ['0', '1', '2', '3', '4', '5', '6', '7', '9', '10', '11', '12', '13', '14', '15']; // 8(academic) 폐지
const ALL_BUT = (...ex) => TEMPLATE_IDS.filter((t) => !ex.includes(t));
// 개발 템플릿 (dev 훅·adversarial-testing 규칙·codex 질문) — util·seo-geo·spec-extraction(애드온) 제외. dream·fortune 은 2026-09-11 부터 dev
const DEV_T = ALL_BUT('1', '11', '14');
// 레거시 프로파일 강제 템플릿 — 질문 없이 tdd-guard 제외 (2026-10-08 nexacro: 테스트 없는 레거시 코드베이스 전제)
const LEGACY_FORCED_T = ['15'];
// TypeScript 템플릿 (TS 훅·규칙·레거시 프로파일 질문) — 프론트 스택 + 웹앱 도메인 3종
const TS_T = ['0', '2', '3', '9', '10', '12'];
// SEO 옵트인 질문(y/c/N)을 받는 템플릿
const SEO_OPTIN_T = ['2', '3', '9', '10', '12'];
// 프론트·웹앱 템플릿 (프론트 에이전트·스킬 소유)
const WEB_T = ['0', '2', '3', '9', '10', '12'];

// ── 소유 표 ─────────────────────────────────────────────────────────────
// on      : 이 템플릿 중 하나라도 선택되면 멤버 전부 설치
// seoOn   : SEO 가 켜졌을 때(전체 y·커머스 c) 이 템플릿이면 전부 설치
// seoFull : SEO 전체(y) 일 때만 이 템플릿이면 전부 설치 (커머스 프로파일 제외분)
// partial : { 템플릿: [허용 부분집합] } — 그 템플릿에선 이 목록만 설치
// option  : 'authoring' (작성 도구 y 일 때만, util 단독 제외) / 'off-by-default' (memory·codex·branch — 이 테스트는 전부 기본 N)
// 나열하지 않은 템플릿 = 전혀 없음.
const OWNERSHIP = [
  // ── agents ──
  { id: 'agent:조사·검증 코어', kind: 'agents', on: TEMPLATE_IDS,
    why: 'seo-geo(11) 단독에서도 쓰는 최소 조사 세트 — 전 템플릿 공통',
    members: ['meta/claude-code-guide.md', 'research/web-searcher.md', 'validation/fact-checker.md', 'validation/source-validator.md'] },
  { id: 'agent:범용 기획·QA·리서치', kind: 'agents', on: ALL_BUT('11', '14'),
    why: 'util 과 모든 개발 템플릿 공통 (seo-geo 화이트리스트엔 없음, spec-extraction 화이트리스트는 qa-engineer 만)',
    partial: { 14: ['validation/qa-engineer.md'] },
    members: ['domain/product-planner.md', 'domain/ui-ux-designer.md', 'validation/qa-engineer.md',
      'research/deep-researcher.md', 'research/research-reviewer.md'] },
  { id: 'agent:범용 분석(도메인 앱 제외)', kind: 'agents', on: ALL_BUT('9', '11', '12', '14'),
    why: 'util·일반 개발 템플릿 — dream·fortune 화이트리스트(docs 25·23종)에는 없음',
    members: ['research/competitor-analyst.md', 'research/data-analyst.md'] },
  { id: 'agent:개발 공용', kind: 'agents', on: ALL_BUT('1', '11', '14'),
    partial: { 14: ['domain/api-spec-designer.md'] },
    members: ['devops/devops-engineer.md', 'domain/api-spec-designer.md', 'meta/project-scaffolder.md',
      'meta/tech-stack-advisor.md', 'validation/security-auditor.md'] },
  { id: 'agent:개발 공용(도메인 앱 제외)', kind: 'agents', on: ALL_BUT('1', '9', '11', '12', '14'),
    why: 'dream·fortune 화이트리스트에는 없는 개발 보조 에이전트 (spec-extraction 은 코드 역분석 1종만)',
    partial: { 14: ['domain/codebase-domain-analyst.md'] },
    members: ['domain/business-domain-analyst.md', 'domain/codebase-domain-analyst.md', 'meta/changelog-writer.md',
      'meta/freshness-auditor.md', 'validation/pr-reviewer.md'] },
  { id: 'agent:프론트 개발', kind: 'agents', on: [...WEB_T, '15'],
    why: 'nexacro(15)는 Next.js 이전 대상 — 프론트 개발 에이전트 포함',
    members: ['frontend/frontend-developer.md', 'frontend/frontend-architect.md', 'domain/frontend-domain-refactorer.md'] },
  // 예외(좁게): dream·fortune 은 frontend 에이전트와 typescript.md 를 받지만 이 파일은 받지 않는다.
  // 이 파일의 내용은 typescript.md 재임포트뿐이고, 두 템플릿엔 typescript.md 가 프로젝트 규칙으로 이미 설치돼 잃는 것이 없다.
  // 화이트리스트 템플릿의 최소 구성 원칙 + template-separation.test.js 의 fortune 에이전트 정확 집합(23종)과 일치.
  { id: 'agent:frontend/CLAUDE.md (typescript.md 임포트)', kind: 'agents', on: ['0', '2', '3', '10', '15'],
    why: '프론트 스택 템플릿 + nexacro(typescript.md 규칙 설치) — 화이트리스트 도메인 앱(9·12)은 위 예외',
    members: ['frontend/CLAUDE.md'] },
  { id: 'agent:프론트 검증', kind: 'agents', on: ['0', '2', '3', '4', '7', '10'],
    why: 'docs: rust·unity 는 기본 포함, java·python·dream·fortune·seo-geo 는 제외',
    members: ['validation/a11y-auditor.md', 'validation/build-perf-benchmarker.md', 'validation/perf-report-writer.md'] },
  { id: 'agent:build-error-resolver (cargo·tsc·Vite)', kind: 'agents', on: ['0', '2', '3', '4', '10'],
    members: ['backend/build-error-resolver.md'] },
  { id: 'agent:database-architect', kind: 'agents', on: ['0', '4', '5', '6', '7', '9', '12', '13', '15'],
    why: '프론트 스택(2·3·10) 제외',
    members: ['backend/database-architect.md'] },
  { id: 'agent:backend/CLAUDE.md (rust·java 임포트)', kind: 'agents', on: ['0', '4', '5', '6', '15'],
    members: ['backend/CLAUDE.md'] },
  { id: 'agent:rust 백엔드', kind: 'agents', on: ['0', '4'],
    members: ['backend/rust-backend-developer.md', 'backend/rust-backend-architect.md'] },
  { id: 'agent:java 백엔드', kind: 'agents', on: ['0', '5', '6', '15'],
    members: ['backend/java-backend-developer.md', 'backend/java-backend-architect.md'] },
  { id: 'agent:python 백엔드', kind: 'agents', on: ['0', '9', '12', '13'],
    members: ['backend/python-backend-developer.md', 'backend/python-backend-architect.md'] },
  { id: 'agent:TS 백엔드', kind: 'agents', on: ['0', '2', '3', '10', '12'],
    members: ['backend/typescript-backend-developer.md', 'backend/typescript-backend-architect.md'] },
  { id: 'agent:SEO 감사', kind: 'agents', on: ['0', '11'], seoOn: SEO_OPTIN_T,
    why: '소유자 = all·seo-geo·SEO 옵트인(y/c) — rust·unity·java·python 누수 금지',
    members: ['validation/seo-auditor.md', 'validation/content-quality-reviewer.md'] },
  { id: 'agent:dream 전용', kind: 'agents', on: ['0', '9'],
    members: ['research/dream-journal-coach.md', 'research/dream-multi-perspective-synthesizer.md',
      'validation/dream-image-safety-classifier.md', 'validation/dream-interpretation-prompt-tester.md',
      'validation/dream-safety-classifier.md'] },
  { id: 'agent:fortune 전용', kind: 'agents', on: ['0', '12'],
    members: ['validation/fortune-interpretation-prompt-tester.md'] },
  { id: 'agent:health 전용', kind: 'agents', on: ['0', '10'],
    members: ['health/nutrition-prompt-tester.md'] },
  { id: 'agent:game 전용', kind: 'agents', on: ['0', '7'],
    members: ['game/game-asset-ai-director.md', 'game/game-design-document-writer.md', 'game/game-monetization-strategist.md',
      'game/mobile-app-publisher.md', 'game/unity-architect.md', 'game/unity-developer.md'] },
  { id: 'agent:util 전용(요구사항 면담)', kind: 'agents', on: ['0', '1'],
    members: ['research/socratic-interviewer.md'] },
  { id: 'agent:spec-extraction 전용', kind: 'agents', on: ['0', '14'],
    why: '스펙 추출 자산은 14 소유 — nexacro(15) 단독 포함 전 템플릿 누수 금지 (15,14 로 조합)',
    members: ['domain/legacy-spec-extractor.md', 'validation/spec-reviewer.md'] },
  { id: 'agent:nexacro 전용', kind: 'agents', on: ['0', '15'],
    members: ['domain/nexacro-screen-analyzer.md', 'frontend/nexacro-screen-converter.md', 'validation/migration-parity-tester.md'] },
  { id: 'agent:작성 도구', kind: 'agents', option: 'authoring',
    why: '작성 도구 y 일 때만 — all(0)·화이트리스트 템플릿 포함 전부 동일',
    members: ['meta/agent-creator.md', 'meta/skill-creator.md', 'meta/skill-tester.md', 'CLAUDE.md'] },

  // ── skills ──
  { id: 'skill:java 공통', kind: 'skills', on: ['0', '5', '6', '15'],
    members: ['backend/spring-boot-gradle-setup', 'backend/mybatis-mapper-patterns', 'backend/spring-multi-datasource-oracle-mysql',
      'backend/hikaricp-tuning-oracle-mysql', 'backend/global-exception-validation', 'backend/testing-junit5-spring-boot',
      'backend/lombok-mapstruct-modelmapper', 'backend/logback-mdc-tracing', 'backend/jasypt-encrypted-config',
      'backend/xss-lucy-jsoup', 'backend/jackson-time-migration', 'backend/webflux-webclient-in-sync-app',
      'backend/bouncycastle-crypto'] },
  { id: 'skill:java 레거시 전용', kind: 'skills', on: ['0', '5', '15'],
    members: ['backend/spring-security-5-jwt-jjwt10', 'backend/swagger-springfox-2', 'backend/redis-redisson-legacy',
      'backend/ehcache-2-legacy', 'backend/aws-sdk-v1-s3-rekognition', 'backend/spring-boot-2-to-3-migration'] },
  { id: 'skill:java 모던 전용', kind: 'skills', on: ['0', '6'],
    why: 'nexacro(15)는 이전 목표(Security 6·springdoc)만',
    partial: { 15: ['backend/spring-security-6-jwt-jjwt12', 'backend/springdoc-openapi-3'] },
    members: ['backend/spring-security-6-jwt-jjwt12', 'backend/springdoc-openapi-3', 'backend/redis-redisson-modern',
      'backend/redis-redisson-4', 'backend/aws-sdk-v2-s3-rekognition'] },
  { id: 'skill:rust', kind: 'skills', on: ['0', '4'],
    members: ['backend/axum', 'backend/sqlx', 'backend/tower-http', 'backend/reqwest', 'backend/jwt-auth',
      'backend/multipart-upload', 'backend/sse-streaming', 'backend/project-structure', 'backend/testing-rust'] },
  { id: 'skill:python 백엔드', kind: 'skills', on: ['0', '9', '12', '13'],
    members: ['backend/python-fastapi', 'backend/python-pydantic-v2', 'backend/python-async-asyncio', 'backend/python-uv-project-setup',
      'backend/python-anthropic-sdk', 'backend/python-langchain-current', 'backend/python-llamaindex',
      'backend/python-embeddings-vector-db', 'backend/python-korean-nlp-konlpy', 'backend/python-cli-typer'] },
  { id: 'skill:TS 백엔드', kind: 'skills', on: ['0', '2', '3', '10', '12'],
    why: '짝 에이전트 typescript-backend-* 소유 템플릿과 동일 (drizzle 은 prisma 링크 대상이라 함께). nexacro 는 zod 도 없음(본문이 hono 참조)',
    members: ['backend/hono-api-patterns', 'backend/prisma-orm', 'backend/zod-schema-validation', 'backend/better-auth',
      'backend/drizzle-neon-postgres'] },
  { id: 'skill:claude-code-headless (구독 중계 예외)', kind: 'skills', on: ['0', '2', '3', '4', '10'],
    members: ['backend/claude-code-headless'] },
  { id: 'skill:fortune 전용', kind: 'skills', on: ['0', '12'],
    members: ['humanities/korean-saju-tradition', 'humanities/tarot-history-symbolism', 'humanities/palmistry-limitations',
      'meta/fortune-interpretation-prompt-engineering', 'architecture/saju-tarot-data-modeling',
      'frontend/saju-chart-visualization', 'frontend/tarot-card-deck-ui', 'frontend/palm-photo-capture-vision',
      'frontend/daily-fortune-retention-loop', 'backend/korean-lunar-calendar-manseryeok'] },
  { id: 'skill:health 전용', kind: 'skills', on: ['0', '10'],
    members: ['health/ingredient-management', 'health/korean-food-nutrition', 'health/meal-recommendation-prompt',
      'health/nutrition-analysis-prompt', 'health/nutrition-basics'] },
  { id: 'skill:dream 전용(humanities·meta·architecture)', kind: 'skills', on: ['0', '9'],
    members: ['humanities/dream-content-privacy-ethics', 'humanities/dream-content-research', 'humanities/dream-psychology-jung-freud',
      'humanities/korean-dream-interpretation-tradition', 'humanities/crisis-intervention-resources-korea',
      'humanities/attachment-theory-basics',
      'meta/dream-app-ab-testing-prompts', 'meta/dream-interpretation-prompt-engineering', 'meta/dream-safety-classifier-prompts',
      'architecture/dream-journal-data-modeling'] },
  { id: 'skill:꿈 앱 frontend 17종', kind: 'skills', on: ['0', '9'],
    why: 'react-spa·nextjs 에선 전부 제외. health 는 공용 LLM PWA 3종만, fortune 은 dream-* 접두어 8종만 제외(docs)',
    partial: {
      10: ['frontend/claude-api-streaming-frontend', 'frontend/chat-ui-pattern', 'frontend/pwa-offline-llm-fallback'],
      12: ['frontend/claude-api-streaming-frontend', 'frontend/chat-ui-pattern', 'frontend/pwa-offline-llm-fallback',
        'frontend/emotion-tagging-input', 'frontend/srs-spaced-repetition', 'frontend/voice-input-ui',
        'frontend/web-speech-api-stt', 'frontend/whisper-api-integration', 'frontend/media-recorder-api'],
    },
    members: ['frontend/dream-app-onboarding', 'frontend/dream-export-import', 'frontend/dream-image-generation',
      'frontend/dream-privacy-consent-ui', 'frontend/dream-recurrence-detection', 'frontend/dream-sharing-anonymized',
      'frontend/dream-statistics-visualization', 'frontend/dream-symbol-tagging',
      'frontend/claude-api-streaming-frontend', 'frontend/chat-ui-pattern', 'frontend/pwa-offline-llm-fallback',
      'frontend/emotion-tagging-input', 'frontend/srs-spaced-repetition', 'frontend/voice-input-ui',
      'frontend/web-speech-api-stt', 'frontend/whisper-api-integration', 'frontend/media-recorder-api'] },
  { id: 'skill:공용 frontend', kind: 'skills', on: WEB_T,
    why: 'nexacro(15)는 Next.js 이전 목표 스택 핵심만',
    partial: { 15: ['frontend/nextjs', 'frontend/ag-grid', 'frontend/tanstack-query', 'frontend/form-handling',
      'frontend/state-management', 'frontend/typescript-v5', 'frontend/e2e-testing',
      // 참조 닫힘 — 위 스킬·frontend-architect·frontend-domain-refactorer 본문이 무조건 참조
      'frontend/tanstack-query-v4-to-v5-migration', 'frontend/typescript-v4', 'frontend/monorepo-turborepo',
      'frontend/bundling-compiler', 'frontend/vite-advanced-splitting', 'frontend/bundle-size-analysis',
      'frontend/core-web-vitals-optimization'] },
    members: ['frontend/ag-grid', 'frontend/animation', 'frontend/build-perf-benchmarking', 'frontend/bundle-size-analysis',
      'frontend/bundling-compiler', 'frontend/code-convention', 'frontend/core-web-vitals-optimization', 'frontend/design-token-scss',
      'frontend/dev-server-hmr-benchmarking', 'frontend/e2e-testing', 'frontend/font-optimization', 'frontend/form-handling',
      'frontend/indexeddb-dexie', 'frontend/lighthouse-ci-setup', 'frontend/monorepo-turborepo', 'frontend/mui-v5', 'frontend/mui-v9',
      'frontend/next-intl-i18n', 'frontend/nextjs', 'frontend/pwa-push-notifications', 'frontend/recoil-to-zustand-migration',
      'frontend/rsbuild', 'frontend/state-management', 'frontend/storybook-visual-testing', 'frontend/storybook', 'frontend/swiper',
      'frontend/tanstack-query-v4-to-v5-migration', 'frontend/tanstack-query', 'frontend/testing', 'frontend/tsup',
      'frontend/typescript-v4', 'frontend/typescript-v5', 'frontend/vite-advanced-splitting', 'frontend/vite-pwa-service-worker',
      'frontend/wcag-2.2-checklist', 'frontend/web-vitals-rum-comparison', 'frontend/webpack-vite-config-mapping'] },
  { id: 'skill:SEO·GEO 커머스 코어', kind: 'skills', on: ['0', '11'], seoOn: SEO_OPTIN_T,
    why: 'seo-geo 는 y·c 모두, 옵트인 템플릿은 y·c 에서만',
    members: ['frontend/bot-management-seo', 'frontend/ecommerce-seo', 'frontend/geo-ai-discoverability',
      'frontend/image-optimization-seo', 'frontend/kakao-share-optimization', 'frontend/mobile-seo-pwa',
      'frontend/naver-seo-specifics', 'frontend/schema-org-patterns', 'frontend/search-console-webmaster',
      'frontend/security-headers-seo', 'frontend/structured-data-validation-api', 'frontend/url-canonicalization-redirects',
      'writing/content-eeat-quality'] },
  { id: 'skill:SEO 비커머스 8종', kind: 'skills', on: ['0'], seoFull: ['11', ...SEO_OPTIN_T],
    why: '커머스 프로파일(c)에서 제외되는 8종 — 전체(y)에서만',
    members: ['frontend/local-business-seo', 'frontend/i18n-seo', 'frontend/google-indexing-api', 'frontend/seo-monitoring-automation',
      'writing/ymyl-content-seo', 'writing/multilingual-content-strategy', 'writing/accessibility-vpat-writing',
      'devops/site-migration-seo'] },
  { id: 'skill:seo-static-html', kind: 'skills', on: ['0', '11'],
    why: '서버 렌더 HTML — seo-geo 소유 (프로파일 무관)',
    members: ['frontend/seo-static-html'] },
  { id: 'skill:seo-nextjs', kind: 'skills', on: ['0'], seoOn: ['3', '9', '12'],
    why: 'Next.js 전용 — dream·fortune 은 스택 미정이라 둘 다 받음, react-spa·health(Vite) 제외',
    members: ['frontend/seo-nextjs'] },
  { id: 'skill:seo-vite-spa', kind: 'skills', on: ['0'], seoOn: ['2', '9', '10', '12'],
    members: ['frontend/seo-vite-spa'] },
  { id: 'skill:og-image-generation', kind: 'skills', on: ['0'], seoOn: SEO_OPTIN_T,
    why: 'seo-geo(11) 소유 아님 — 프론트 스택이 SEO 켤 때만',
    members: ['frontend/og-image-generation'] },
  { id: 'skill:devops 기본', kind: 'skills', on: ALL_BUT('1', '11', '14'),
    members: ['devops/docker-deployment', 'devops/github-actions'] },
  { id: 'skill:n8n', kind: 'skills', on: ['0', '4', '7', '9', '10', '12', '13'],
    why: 'LLM 워크플로우 도메인 앱·rust·unity·python — react-spa·nextjs·java 제외',
    members: ['devops/n8n-error-handling', 'devops/n8n-llm-integration', 'devops/n8n-self-hosting',
      'devops/n8n-webhook-patterns', 'devops/n8n-workflow-design'] },
  { id: 'skill:vercel-sandbox', kind: 'skills', on: ALL_BUT('1', '5', '6', '11', '14', '15'),
    members: ['devops/vercel-sandbox'] },
  { id: 'skill:github-actions-visual-regression', kind: 'skills', on: WEB_T,
    members: ['devops/github-actions-visual-regression'] },
  { id: 'skill:vercel-workflow (Next.js 서버리스)', kind: 'skills', on: ['0', '3', '9', '10', '12'],
    why: '서버 없는 react-spa 제외',
    members: ['devops/vercel-workflow'] },
  { id: 'skill:architecture 기본', kind: 'skills', on: ALL_BUT('1', '11', '14'),
    members: ['architecture/ddd', 'architecture/incremental-refactoring', 'architecture/module-boundaries'] },
  { id: 'skill:frontend-domain-structure', kind: 'skills', on: [...WEB_T, '15'],
    members: ['architecture/frontend-domain-structure'] },
  { id: 'skill:claude-code-hook-authoring', kind: 'skills', on: ALL_BUT('11', '14'),
    members: ['meta/claude-code-hook-authoring'] },
  { id: 'skill:game', kind: 'skills', on: ['0', '7'],
    members: ['game/ai-game-asset-pipeline', 'game/app-store-submission', 'game/game-audio-ai-tools', 'game/game-design-document',
      'game/mobile-user-acquisition', 'game/unity-6-2d-fundamentals', 'game/unity-addressables', 'game/unity-cicd-codemagic',
      'game/unity-firebase', 'game/unity-game-feel', 'game/unity-iap', 'game/unity-levelplay-ads', 'game/unity-live-ops',
      'game/unity-mobile-optimization', 'game/unity-save-system', 'game/unity-ui-system'] },
  { id: 'skill:spec 추출', kind: 'skills', on: ['0', '14'],
    why: 'spec 카테고리 전부 — 14 소유, 15 단독엔 없음',
    members: ['spec/spec-extraction-method', 'spec/spring-mybatis-spec-extraction', 'spec/react-spec-extraction',
      'spec/characterization-testing'] },
  { id: 'skill:nexacro 화면 구조(14·15 공유)', kind: 'skills', on: ['0', '14', '15'],
    why: '스펙 추출(14)의 넥사크로 화면 해석 + 이전(15) 양쪽에서 필요',
    members: ['nexacro/nexacro-17-xfdl-anatomy'] },
  { id: 'skill:nexacro 이전', kind: 'skills', on: ['0', '15'],
    members: ['nexacro/nexacro-xapi-server', 'nexacro/nexacro-to-react-mapping', 'nexacro/xapi-to-rest-migration',
      'nexacro/nexacro-strangler-coexistence'] },
  { id: 'skill:nexacro 전용 backend 이관', kind: 'skills', on: ['0', '15'],
    why: 'backend 카테고리지만 SB 1.x·iBATIS 탈출은 넥사크로 레거시 전용 — java-spring-legacy/modern 누수 금지',
    members: ['backend/spring-boot-1-to-2-migration', 'backend/ibatis-to-mybatis-migration'] },

  // ── rules ──
  { id: 'rule:공통 최소', kind: 'rules', on: TEMPLATE_IDS, members: ['git.md', 'info-verification.md'] },
  { id: 'rule:task-workflow', kind: 'rules', on: ALL_BUT('1'), members: ['task-workflow.md'] },
  { id: 'rule:작성 규칙', kind: 'rules', option: 'authoring',
    members: ['agent-design.md', 'creation-workflow.md', 'verification-policy.md', 'commands.md', 'readme-update.md'] },
  { id: 'rule:adversarial-testing', kind: 'rules', on: DEV_T, members: ['adversarial-testing.md'] },
  { id: 'rule:java', kind: 'rules', on: ['0', '5', '6', '15'], members: ['java.md'] },
  { id: 'rule:rust', kind: 'rules', on: ['0', '4'], members: ['rust.md'] },
  { id: 'rule:typescript', kind: 'rules', on: [...TS_T, '15'], members: ['typescript.md'],
    why: 'nexacro 는 TS 훅은 없지만 이전 목표(Next.js) 코드 규칙은 받는다' },
  { id: 'rule:옵션 전용(memory·codex)', kind: 'rules', option: 'off-by-default', members: ['memory-sync.md', 'codex-review.md'] },

  // ── hooks ──
  { id: 'hook:공통', kind: 'hooks', on: TEMPLATE_IDS,
    members: ['bash-guard.js', 'auto-approve.js', 'parry.js', 'protect-secrets.js', 'session-start.js', 'session-export.js',
      'cc-notify.js', 'korean-response-guard.js', 'task-confirm-guard.js', 'config-change-audit.js', 'progress-tracker.js', 'instructions-loaded.js', 'deliverable-guard.js', 'skill-md-guard.js', 'agent-md-guard.js',
      'verification-guard.js', 'staleness-check.js', 'statusline.sh'] },
  { id: 'hook:dev', kind: 'hooks', on: DEV_T,
    members: ['test-fake-guard.js', 'adversarial-test-guard.js', 'fake-impl-guard.js', 'auto-format.js', 'package-manager-guard.js'] },
  { id: 'hook:tdd-guard', kind: 'hooks', on: DEV_T.filter((t) => !LEGACY_FORCED_T.includes(t)), legacyOff: true,
    why: '레거시 프로파일(nexacro 가 조합에 있으면 강제, 그 외 TS 템플릿은 질문 — 이 테스트는 N)에서 제외',
    members: ['tdd-guard.js'] },
  { id: 'hook:typescript', kind: 'hooks', on: TS_T, members: ['typescript-quality.js'] },
  { id: 'hook:옵션 전용(memory·codex·branch)', kind: 'hooks', option: 'off-by-default',
    members: ['memory-pull.js', 'memory-sync.js', 'codex-review-guard.js', 'branch-protection.js'] },
];

const KINDS = ['agents', 'skills', 'rules', 'hooks'];

// ── 자산 나열 (레포 원본 / 설치 대상 공용) ─────────────────────────────
function listAssets(root) {
  const claude = path.join(root, '.claude');
  const out = { agents: [], skills: [], rules: [], hooks: [] };
  const agentsRoot = path.join(claude, 'agents');
  const walk = (d, prefix) => {
    for (const e of fs.readdirSync(d)) {
      const full = path.join(d, e);
      if (fs.statSync(full).isDirectory()) walk(full, `${prefix}${e}/`);
      else if (e.endsWith('.md')) out.agents.push(`${prefix}${e}`);
    }
  };
  if (fs.existsSync(agentsRoot)) walk(agentsRoot, '');
  // 스킬 논리 ID {cat}/{name} — 본체는 1단 .claude/skills/<name>/, 카테고리는 레포 docs 위치 (2026-10-05 평탄화).
  // 카테고리를 모르는 1단 스킬은 `?/<name>` 으로 나와 어떤 그룹에도 속하지 않으므로 "미분류"로 실패한다.
  out.skills = require('./skill-index.js').installedSkillIds(root);
  const rulesRoot = path.join(claude, 'rules');
  if (fs.existsSync(rulesRoot)) out.rules = fs.readdirSync(rulesRoot).filter((f) => f.endsWith('.md'));
  const hooksRoot = path.join(claude, 'hooks');
  if (fs.existsSync(hooksRoot)) {
    // package.json(CJS 경계)은 템플릿 무관 고정 설치라 소유 대상이 아니다. 테스트 파일은 설치 대상 아님.
    out.hooks = fs.readdirSync(hooksRoot).filter((f) => /\.(js|sh)$/.test(f) && !/\.test\.js$/.test(f));
  }
  for (const k of KINDS) out[k].sort();
  return out;
}

// ── 표 무결성 검증기 — 문제 목록을 돌려준다 (빈 배열 = 정상) ─────────────
function validateOwnership(groups, sources) {
  const problems = [];
  const owner = { agents: new Map(), skills: new Map(), rules: new Map(), hooks: new Map() };
  for (const g of groups) {
    if (!KINDS.includes(g.kind)) { problems.push(`${g.id}: 알 수 없는 kind '${g.kind}'`); continue; }
    if (!Array.isArray(g.members) || g.members.length === 0) problems.push(`${g.id}: 빈 그룹 (empty members)`);
    const members = g.members || [];
    for (const m of members) {
      if (!sources[g.kind].includes(m)) problems.push(`${g.id}: 존재하지 않는 멤버 '${m}' (오타·삭제된 자산?)`);
      if (owner[g.kind].has(m)) problems.push(`${g.id}: '${m}' 가 '${owner[g.kind].get(m)}' 와 중복 소유`);
      else owner[g.kind].set(m, g.id);
    }
    const tmplRefs = [...(g.on || []), ...(g.seoOn || []), ...(g.seoFull || []), ...Object.keys(g.partial || {})];
    for (const t of tmplRefs) {
      if (!TEMPLATE_IDS.includes(String(t))) problems.push(`${g.id}: 존재하지 않는(폐지) 템플릿 '${t}' 참조`);
    }
    for (const [t, subset] of Object.entries(g.partial || {})) {
      for (const m of subset) if (!members.includes(m)) problems.push(`${g.id}: partial[${t}] 의 '${m}' 가 멤버가 아님`);
      if (subset.length === 0) problems.push(`${g.id}: partial[${t}] 가 비어 있음 — 전혀 없음이면 partial 에서 빼라`);
    }
    if (g.option) {
      if (!['authoring', 'off-by-default'].includes(g.option)) problems.push(`${g.id}: 알 수 없는 option '${g.option}'`);
      if (tmplRefs.length) problems.push(`${g.id}: option 그룹은 템플릿 소유를 함께 선언할 수 없음`);
    } else if (!(g.on || []).includes('0')) {
      problems.push(`${g.id}: all(0) 은 옵션 제외분 외 전부를 설치한다 — on 에 '0' 누락`);
    }
  }
  for (const k of KINDS) {
    for (const a of sources[k]) {
      if (!owner[k].has(a)) problems.push(`미분류 ${k} '${a}' — OWNERSHIP 에 소유 그룹을 선언하라`);
    }
  }
  return problems;
}

// ── 케이스 → 기대 집합 ─────────────────────────────────────────────────
// opts: { templates: [...], seo: true|'commerce'|false, auth: bool }
function expectedSet(group, opts) {
  for (const t of opts.templates) {
    if (!TEMPLATE_IDS.includes(t)) throw new Error(`invalid template '${t}'`);
  }
  const utilOnly = opts.templates.length === 1 && opts.templates[0] === '1';
  if (group.option === 'authoring') return new Set(opts.auth && !utilOnly ? group.members : []);
  if (group.option === 'off-by-default') return new Set();
  const has = (list) => opts.templates.some((t) => (list || []).includes(t));
  // 레거시 강제 템플릿(nexacro)이 조합에 하나라도 있으면 설치 전체가 레거시 프로파일 — tdd-guard 는 어떤 템플릿 소유로도 오지 않는다
  if (group.legacyOff && has(LEGACY_FORCED_T)) return new Set();
  if (has(group.on)) return new Set(group.members);
  if (opts.seo && has(group.seoOn)) return new Set(group.members);
  if (opts.seo === true && has(group.seoFull)) return new Set(group.members);
  const s = new Set();
  for (const t of opts.templates) for (const m of (group.partial || {})[t] || []) s.add(m);
  return s;
}

// 설치 결과를 표와 비교 — 누수(leak)·누락(missing)·미분류 설치물 목록
function compareInstall(groups, installed, opts) {
  const problems = [];
  const classified = { agents: new Set(), skills: new Set(), rules: new Set(), hooks: new Set() };
  for (const g of groups) {
    const exp = expectedSet(g, opts);
    const members = new Set(g.members);
    members.forEach((m) => classified[g.kind].add(m));
    const act = new Set(installed[g.kind].filter((a) => members.has(a)));
    const leak = [...act].filter((a) => !exp.has(a));
    const missing = [...exp].filter((a) => !act.has(a));
    if (leak.length) problems.push(`[누수] ${g.id}: ${leak.join(', ')}`);
    if (missing.length) problems.push(`[누락] ${g.id}: ${missing.join(', ')}`);
  }
  for (const k of KINDS) {
    const stray = installed[k].filter((a) => !classified[k].has(a));
    if (stray.length) problems.push(`[미분류 설치물] ${k}: ${stray.join(', ')}`);
  }
  return problems;
}

// ── 설치 실행 ──────────────────────────────────────────────────────────
// 질문 순서 (project-install.sh): memory → superpowers → codex(dev) → legacy(dev+TS) → SEO(seo-geo 프로파일 | 옵트인)
//   → 작성 도구(util 단독 제외) → readme-guard → staleness → branch → CLAUDE.md 프로젝트명·설명. 나머지는 빈 줄(N).
function caseOptions(c) {
  const templates = c.input.split(',').map((s) => s.trim());
  const utilOnly = templates.length === 1 && templates[0] === '1';
  const dev = templates.some((t) => DEV_T.includes(t));
  const ts = templates.some((t) => TS_T.includes(t));
  let seoQ = null; let seo;
  if (templates.includes('11')) { seoQ = c.seo ?? ''; seo = seoQ === 'c' ? 'commerce' : true; }
  else if (templates.some((t) => SEO_OPTIN_T.includes(t))) {
    seoQ = c.seo ?? ''; seo = seoQ === 'y' ? true : seoQ === 'c' ? 'commerce' : false;
  } else seo = true; // 질문 없음 — 스크립트 기본값(전체). seoOn 은 옵트인·seo-geo 템플릿에만 걸리므로 영향 없음
  const answers = ['', ''];
  if (dev) answers.push('');
  // 레거시 질문은 dev+TS 일 때만, 단 nexacro 가 섞이면 질문 없이 강제 (2026-10-08)
  if (dev && ts && !templates.some((t) => LEGACY_FORCED_T.includes(t))) answers.push('');
  if (seoQ !== null) answers.push(seoQ);
  if (!utilOnly) answers.push(c.auth ? 'y' : '');
  return { templates, seo, auth: !!c.auth && !utilOnly, answers };
}

function install(c) {
  const opts = caseOptions(c);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `tmpl-own-${c.id.replace(/[^\w]/g, '_')}-`));
  try {
    const input = `${dir}\n${c.input}\n` + opts.answers.map((a) => `${a}\n`).join('') + '\n'.repeat(60);
    const r = spawnSync('bash', [INSTALLER], { input, encoding: 'utf8', timeout: 180000 });
    assert.strictEqual(r.status, 0, `install(${c.id}) failed status=${r.status}\n${(r.stdout || '').slice(-600)}\n${(r.stderr || '').slice(-300)}`);
    // 응답이 엉뚱한 질문에 들어가면 매트릭스 전체가 오판되므로 옵션 요약줄로 먼저 확인한다
    const seoLine = opts.seo === 'commerce' ? 'commerce' : String(opts.seo);
    assert.match(r.stdout, new RegExp(`\\nSEO 스킬: ${seoLine}\\n`), `${c.id}: SEO 옵션 응답 위치 어긋남`);
    assert.match(r.stdout, new RegExp(`\\n작성 도구: ${opts.auth}\\n`), `${c.id}: 작성 도구 응답 위치 어긋남`);
    return { opts, installed: listAssets(dir) };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const CASES = [
  { id: '0', input: '0' },
  { id: '1', input: '1' },
  { id: '2', input: '2', seo: 'n' },
  { id: '2y', input: '2', seo: 'y' },
  { id: '3', input: '3', seo: 'n' },
  { id: '3y', input: '3', seo: 'y' },
  { id: '4', input: '4' },
  { id: '5', input: '5' },
  { id: '6', input: '6' },
  { id: '7', input: '7' },
  { id: '9', input: '9', seo: 'n' },
  { id: '9y', input: '9', seo: 'y' },
  { id: '10', input: '10', seo: 'n' },
  { id: '10y', input: '10', seo: 'y' },
  { id: '11', input: '11' },
  { id: '11c', input: '11', seo: 'c' },
  { id: '12', input: '12', seo: 'n' },
  { id: '12y', input: '12', seo: 'y' },
  { id: '13', input: '13' },
  // 대표 조합
  { id: '4,11', input: '4,11' },
  { id: '7,11', input: '7,11' },
  { id: '5,11', input: '5,11' },
  { id: '13,2', input: '13,2', seo: 'n' },
  { id: '12,11', input: '12,11' },
  { id: '0,5', input: '0,5' },
  // 경계: 애드온을 앞에 쓴 역순 입력 — 4,11 과 같은 결과여야 한다
  { id: '11,4', input: '11,4' },
  // 옵션: 작성 도구 y (스택 템플릿·화이트리스트 템플릿 각각)
  { id: '2y+auth', input: '2', seo: 'y', auth: true },
  { id: '11+auth', input: '11', auth: true },
  // 2026-10-08: spec-extraction(14) 애드온 · nexacro(15) 스택
  { id: '14', input: '14' },
  { id: '15', input: '15' },
  { id: '15,14', input: '15,14' },
  { id: '5,14', input: '5,14' },
  { id: '2,14', input: '2,14', seo: 'n' },
  { id: '14+auth', input: '14', auth: true },
  // 경계: 애드온을 앞에 쓴 역순 입력·공백 섞인 입력 — 각각 5,14 / 15,14 와 같은 결과여야 한다
  { id: '14,5', input: '14,5' },
  { id: ' 15 , 14 ', input: ' 15 , 14 ' },
  // 경계: nexacro + TS 템플릿 — 레거시 질문 없이 강제(tdd-guard 없음), 프론트 자산은 nextjs 가 union
  { id: '15,3', input: '15,3', seo: 'n' },
];

const results = new Map();
const run = (c) => { if (!results.has(c.id)) results.set(c.id, install(c)); return results.get(c.id); };

// ── 정상: 표 무결성 ─────────────────────────────────────────────────────
test('소유 표: 레포의 모든 스킬·에이전트·규칙·훅이 정확히 한 그룹에 속하고 멤버 오타·폐지 템플릿이 없다', () => {
  const problems = validateOwnership(OWNERSHIP, listAssets(REPO));
  assert.deepStrictEqual(problems, [], `소유 표 문제:\n  ${problems.join('\n  ')}`);
});

test('소유 표: docs/templates 실측 수치와 표가 계산하는 기본 설치 수가 일치 (표 자체의 오기 방지)', () => {
  // docs/templates/*.md 의 2026-09-30 실측 스킬 수 (기본 옵션). 표가 이 수를 재현하지 못하면 표가 틀린 것이다.
  const DOC_SKILL_COUNTS = { 1: 1, 2: 52, 3: 53, 4: 22, 5: 25, 6: 24, 7: 28, 9: 89, 10: 66, 12: 86, 13: 22, 14: 5, 15: 49 };
  const skillGroups = OWNERSHIP.filter((g) => g.kind === 'skills');
  for (const [t, n] of Object.entries(DOC_SKILL_COUNTS)) {
    const opts = { templates: [t], seo: SEO_OPTIN_T.includes(t) ? false : true, auth: false };
    const total = skillGroups.reduce((s, g) => s + expectedSet(g, opts).size, 0);
    assert.strictEqual(total, n, `템플릿 ${t}: 표 기대 스킬 수 ${total} ≠ docs 실측 ${n}`);
  }
  const seoGeo = (seo) => skillGroups.reduce((s, g) => s + expectedSet(g, { templates: ['11'], seo, auth: false }).size, 0);
  assert.strictEqual(seoGeo(true), 22, 'seo-geo 전체 22종');
  assert.strictEqual(seoGeo('commerce'), 14, 'seo-geo 커머스 14종');
});

// ── 정상: 실제 설치 × 표 전체 ───────────────────────────────────────────
for (const c of CASES) {
  test(`매트릭스 [${c.id}]: 설치 결과가 모든 그룹의 기대값과 일치 (누수·누락·미분류 0)`, () => {
    const { opts, installed } = run(c);
    const problems = compareInstall(OWNERSHIP, installed, opts);
    assert.deepStrictEqual(problems, [], `템플릿 ${c.id}:\n  ${problems.join('\n  ')}`);
  });
}

// ── 경계: 조합 순서 ────────────────────────────────────────────────────
test('경계: 애드온을 앞에 쓴 11,4 는 4,11 과 설치 자산이 완전히 같다', () => {
  const a = run(CASES.find((c) => c.id === '4,11')).installed;
  const b = run(CASES.find((c) => c.id === '11,4')).installed;
  assert.deepStrictEqual(b, a);
});

test('경계: spec-extraction 애드온 역순(14,5)·공백 섞인 입력( 15 , 14 )은 정규 입력과 설치 자산이 같다', () => {
  assert.deepStrictEqual(run(CASES.find((c) => c.id === '14,5')).installed, run(CASES.find((c) => c.id === '5,14')).installed);
  assert.deepStrictEqual(run(CASES.find((c) => c.id === ' 15 , 14 ')).installed, run(CASES.find((c) => c.id === '15,14')).installed);
});

// ── 누수 방지: 14·15 소유 자산이 소유 템플릿 밖으로 새지 않는다 (표와 별개의 직접 단언 — 표 오기에도 걸리게) ──
// 2026-10-08 검수: 1·5·6·11 만 보던 것을 소유자(0·14·15) 외 기존 템플릿 전부로 확장 — rust·unity·python(4·7·13) 포함
test('누수: spec·nexacro 자산과 SB1→2·iBATIS 이관 스킬은 기존 템플릿(1~7·9~13) 어디에도 없다', () => {
  const NEW_ONLY = [
    'spec/spec-extraction-method', 'spec/characterization-testing', 'nexacro/nexacro-17-xfdl-anatomy',
    'nexacro/xapi-to-rest-migration', 'backend/spring-boot-1-to-2-migration', 'backend/ibatis-to-mybatis-migration',
  ];
  const NEW_AGENTS = ['domain/legacy-spec-extractor.md', 'validation/spec-reviewer.md', 'domain/nexacro-screen-analyzer.md',
    'frontend/nexacro-screen-converter.md', 'validation/migration-parity-tester.md'];
  const NON_OWNERS = TEMPLATE_IDS.filter((t) => !['0', '14', '15'].includes(t));
  assert.ok(NON_OWNERS.includes('4') && NON_OWNERS.includes('7') && NON_OWNERS.includes('13') && NON_OWNERS.length === 12, `비소유 템플릿 목록 이상: ${NON_OWNERS}`);
  for (const id of NON_OWNERS) {
    const c = CASES.find((x) => x.id === id);
    assert.ok(c, `매트릭스 CASES 에 템플릿 ${id} 단독 케이스 없음`);
    const { installed } = run(c);
    assert.deepStrictEqual(installed.skills.filter((s) => NEW_ONLY.includes(s) || /^(spec|nexacro)\//.test(s)), [], `템플릿 ${id} 에 14·15 스킬 누수`);
    assert.deepStrictEqual(installed.agents.filter((a) => NEW_AGENTS.includes(a)), [], `템플릿 ${id} 에 14·15 에이전트 누수`);
  }
});

test('누수: nexacro(15) 단독엔 스펙 추출 자산(spec/* 스킬·legacy-spec-extractor·spec-reviewer)이 없고, 14 단독엔 Java·TS 훅·규칙이 없다', () => {
  const n = run(CASES.find((c) => c.id === '15')).installed;
  assert.deepStrictEqual(n.skills.filter((s) => s.startsWith('spec/')), [], '15 단독에 spec 스킬 누수');
  assert.ok(!n.agents.includes('domain/legacy-spec-extractor.md') && !n.agents.includes('validation/spec-reviewer.md'), '15 단독에 스펙 추출 에이전트 누수');
  assert.ok(n.rules.includes('java.md') && n.rules.includes('typescript.md'), '15: java 규칙 O · 이전 목표 TS 규칙 O (TS 훅은 X)');
  assert.ok(!n.hooks.includes('tdd-guard.js') && n.hooks.includes('adversarial-test-guard.js') && !n.hooks.includes('typescript-quality.js'),
    '15: 레거시(tdd-guard 제외)·dev O·TS X');
  const s = run(CASES.find((c) => c.id === '14')).installed;
  for (const h of ['tdd-guard.js', 'adversarial-test-guard.js', 'typescript-quality.js', 'auto-format.js']) {
    assert.ok(!s.hooks.includes(h), `14 단독(비 dev·비 TS)에 ${h} 설치됨`);
  }
  assert.deepStrictEqual(s.rules.sort(), ['git.md', 'info-verification.md', 'task-workflow.md'], '14 단독 규칙은 공통 3종만');
});

// ── 악성·오남용: 오염된 표를 검증기가 스스로 잡는가 ─────────────────────
const clone = () => OWNERSHIP.map((g) => ({ ...g, members: [...g.members], partial: g.partial && { ...g.partial } }));
const SOURCES = listAssets(REPO);

test('tamper: 멤버 오타(존재하지 않는 자산)를 적으면 검증이 실패한다', () => {
  const g = clone();
  g.find((x) => x.id === 'agent:SEO 감사').members.push('validation/seo-auditr.md');
  assert.ok(validateOwnership(g, SOURCES).some((p) => p.includes("존재하지 않는 멤버 'validation/seo-auditr.md'")));
});

test('tamper: 한 자산을 두 그룹이 소유하면 실패한다 (소유권 모호)', () => {
  const g = clone();
  g.find((x) => x.id === 'agent:rust 백엔드').members.push('validation/seo-auditor.md');
  assert.ok(validateOwnership(g, SOURCES).some((p) => p.includes('중복 소유')));
});

test('tamper: 새 스킬이 어떤 그룹에도 선언되지 않으면(미분류) 실패한다', () => {
  const src = { ...SOURCES, skills: [...SOURCES.skills, 'frontend/brand-new-unowned-skill'] };
  assert.ok(validateOwnership(OWNERSHIP, src).some((p) => p.includes("미분류 skills 'frontend/brand-new-unowned-skill'")));
  const src2 = { ...SOURCES, agents: [...SOURCES.agents, 'validation/new-auditor.md'] };
  assert.ok(validateOwnership(OWNERSHIP, src2).some((p) => p.includes("미분류 agents 'validation/new-auditor.md'")));
});

test('tamper: 폐지 템플릿(8 academic)·허용 목록 밖 부분집합·on 에 0 누락을 거부한다', () => {
  const g = clone();
  g.find((x) => x.id === 'agent:util 전용(요구사항 면담)').on = ['0', '1', '8'];
  g.find((x) => x.id === 'skill:꿈 앱 frontend 17종').partial = { 10: ['frontend/nextjs'] };
  g.find((x) => x.id === 'skill:game').on = ['7'];
  const p = validateOwnership(g, SOURCES);
  assert.ok(p.some((x) => x.includes("폐지) 템플릿 '8'")), p.join('\n'));
  assert.ok(p.some((x) => x.includes("partial[10] 의 'frontend/nextjs' 가 멤버가 아님")), p.join('\n'));
  assert.ok(p.some((x) => x.includes("skill:game: all(0)")), p.join('\n'));
});

test('tamper: 누수가 섞인 가짜 설치 결과를 비교기가 [누수]로, 빠진 자산을 [누락]으로 보고한다', () => {
  const opts = { templates: ['4'], seo: true, auth: false };
  const fake = { agents: [], skills: [], rules: [], hooks: [] };
  for (const g of OWNERSHIP) for (const m of expectedSet(g, opts)) fake[g.kind].push(m);
  assert.deepStrictEqual(compareInstall(OWNERSHIP, fake, opts), [], '기대 집합 그대로면 문제 0');
  const leaky = { ...fake, agents: [...fake.agents, 'validation/seo-auditor.md'] };
  assert.ok(compareInstall(OWNERSHIP, leaky, opts).some((p) => p.startsWith('[누수] agent:SEO 감사')));
  const short = { ...fake, skills: fake.skills.filter((s) => s !== 'backend/axum') };
  assert.ok(compareInstall(OWNERSHIP, short, opts).some((p) => p.startsWith('[누락] skill:rust')));
  const stray = { ...fake, skills: [...fake.skills, 'frontend/injected-by-attacker'] };
  assert.ok(compareInstall(OWNERSHIP, stray, opts).some((p) => p.startsWith('[미분류 설치물] skills')));
});

// ── 경계: 빈 그룹·옵션 전용 그룹·잘못된 템플릿 ──────────────────────────
test('경계: 빈 그룹(empty members)은 표 검증에서 실패한다', () => {
  const g = [...clone(), { id: 'skill:빈 그룹', kind: 'skills', on: ['0'], members: [] }];
  assert.ok(validateOwnership(g, SOURCES).some((p) => p.includes('skill:빈 그룹: 빈 그룹')));
});

test('경계: 옵션 전용 그룹은 all(0) 에서도 기본값이면 empty, 작성 도구는 util 단독에서 항상 empty', () => {
  const memo = OWNERSHIP.find((g) => g.id === 'hook:옵션 전용(memory·codex·branch)');
  assert.strictEqual(expectedSet(memo, { templates: ['0'], seo: true, auth: true }).size, 0);
  const auth = OWNERSHIP.find((g) => g.id === 'agent:작성 도구');
  assert.strictEqual(expectedSet(auth, { templates: ['1'], seo: true, auth: true }).size, 0);
  assert.strictEqual(expectedSet(auth, { templates: ['0'], seo: true, auth: false }).size, 0);
  assert.strictEqual(expectedSet(auth, { templates: ['11'], seo: true, auth: true }).size, auth.members.length);
});

test('경계: 표에 없는 템플릿 번호(8·99·빈 값)로 기대값을 묻으면 invalid 로 던진다', () => {
  const g = OWNERSHIP[0];
  for (const bad of ['8', '99', '']) {
    assert.throws(() => expectedSet(g, { templates: [bad], seo: false, auth: false }), /invalid template/);
  }
});
