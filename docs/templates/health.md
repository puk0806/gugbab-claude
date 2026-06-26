# 템플릿: health (10)

건강·식단 PWA 앱. 영양 계산(KDRIs 2020) · 식재료 관리 · Claude AI 식단 추천.
백엔드 없음 — IndexedDB(Dexie.js) 로컬 저장 전용.

```
./project-install.sh  →  번호 입력: 10  (또는 복수: react-spa,health)
```

---

## 에이전트

| 카테고리 | 에이전트 | 설명 |
|----------|---------|------|
| meta | [agent-creator](../../.claude/agents/meta/agent-creator.md) | 에이전트 MD 파일 대화형 생성 |
| meta | [skill-creator](../../.claude/agents/meta/skill-creator.md) | 공식 문서 검증 후 SKILL.md 생성 |
| meta | [skill-tester](../../.claude/agents/meta/skill-tester.md) | PENDING_TEST 스킬 2단계 실사용 테스트 |
| meta | [freshness-auditor](../../.claude/agents/meta/freshness-auditor.md) | 에이전트·스킬 최신화 필요 항목 감사 |
| meta | [planner](../../.claude/agents/meta/planner.md) | 복잡한 작업 단계별 실행 계획 분해 |
| meta | [claude-code-guide](../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI 사용법·설정 가이드 |
| meta | [tech-stack-advisor](../../.claude/agents/meta/tech-stack-advisor.md) | 요구사항에 맞는 기술 스택 추천·비교 |
| meta | [mvp-scope-planner](../../.claude/agents/meta/mvp-scope-planner.md) | MVP Phase 1·2·3 범위 절단 |
| meta | [project-scaffolder](../../.claude/agents/meta/project-scaffolder.md) | 결정된 스택으로 프로젝트 부트스트랩 |
| frontend | [frontend-developer](../../.claude/agents/frontend/frontend-developer.md) | React/Next.js 컴포넌트·훅·API 연동 구현 |
| frontend | [frontend-architect](../../.claude/agents/frontend/frontend-architect.md) | 프론트엔드 아키텍처 설계·기술 판단 |
| domain | [product-planner](../../.claude/agents/domain/product-planner.md) | 아이디어·요구사항 → PRD 작성 |
| domain | [ui-ux-designer](../../.claude/agents/domain/ui-ux-designer.md) | PRD → 와이어프레임·디자인 토큰·컴포넌트 스펙 |
| domain | [api-spec-designer](../../.claude/agents/domain/api-spec-designer.md) | PRD → OpenAPI 3.1 스펙·에러 코드 설계 |
| devops | [devops-engineer](../../.claude/agents/devops/devops-engineer.md) | Dockerfile·GitHub Actions·Vercel 배포 설정 |
| research | [deep-researcher](../../.claude/agents/research/deep-researcher.md) | 논문/오픈소스/기업 사례 3축 딥 리서치 |
| research | [web-searcher](../../.claude/agents/research/web-searcher.md) | 검색 축별 소스 탐색 전담 |
| validation | [fact-checker](../../.claude/agents/validation/fact-checker.md) | 사실·수치·주장 교차 검증 |
| validation | [source-validator](../../.claude/agents/validation/source-validator.md) | URL·문서 신뢰도 판정 |
| validation | [qa-engineer](../../.claude/agents/validation/qa-engineer.md) | E2E 테스트·Playwright 코드 생성 |
| validation | [security-auditor](../../.claude/agents/validation/security-auditor.md) | OWASP·PIPA 보안 감사 |

---

## 스킬

| 카테고리 | 종류 | 비고 |
|----------|------|------|
| health (5종) | nutrition-basics · korean-food-nutrition · ingredient-management · meal-recommendation-prompt · nutrition-analysis-prompt | 건강·식단 도메인 핵심 |
| frontend (76종) | 프레임워크·상태관리·UI·빌드·테스트·성능·SEO·LLM | indexeddb-dexie · claude-api-streaming-frontend 포함 |
| devops (9종) | Docker·GitHub Actions·n8n·SEO 운영 | |
| architecture (2종) | DDD, 앱 데이터 모델 | |
| meta (5종) | 워크플로우·프롬프트 엔지니어링 | |
| writing (4종) | SEO 콘텐츠 품질 | |

---

## 핵심 스킬 연동 관계

```
nutrition-basics           ← 영양소 기준값·BMR/TDEE 공식
korean-food-nutrition      ← 한국 식품 DB + 공공데이터 API
ingredient-management      ← TypeScript 도메인 모델 + Dexie 쿼리
meal-recommendation-prompt ← 식재료 기반 Claude 식단 추천
nutrition-analysis-prompt  ← 하루 식단 영양소 분석
frontend/indexeddb-dexie   ← IndexedDB 로컬 저장 (Dexie.js)
frontend/claude-api-streaming-frontend ← 프론트→Claude API 직접 호출
```

---

## 훅 (24종)

### 공통 (19종)

react-spa 템플릿과 동일한 공통 훅 세트. 자세한 목록은 [react-spa.md](./react-spa.md) 참조.

### 개발 전용 (4종)

`tdd-guard.js` · `test-fake-guard.js` · `verification-gate.js` · `careful-with-judge.js`

### TypeScript 전용 (1종)

`typescript-quality.js`

---

## 규칙

| 규칙 | 조건 |
|------|------|
| git.md | 항상 |
| info-verification.md | 항상 |
| task-workflow.md | 항상 |
| typescript.md | 항상 (PWA TypeScript 기반) |
| agent-design.md | 항상 |
| creation-workflow.md | 항상 |
| commands.md | 항상 |
| readme-update.md | 항상 |
| verification-policy.md | 항상 |
| memory-sync.md | memory 공유 선택 시 |
| codex-review.md | Codex 선택 시 |

---

## CLAUDE.md 예시

→ [examples/CLAUDE.health.md](../../examples/CLAUDE.health.md)

도메인 특화 규칙:
- KDRIs 2020 영양 기준 준수
- 식품안전나라 데이터 소스 명시
- AI 응답 면책 문구 필수
- IndexedDB 로컬 전용 원칙

---

## 복수 템플릿 조합 예시

```bash
# React SPA + 건강 도메인 (가장 일반적)
./project-install.sh → react-spa,health

# Next.js + 건강 도메인
./project-install.sh → nextjs,health
```

복수 선택 시 agents·skills·rules는 **union(합집합)** 으로 병합됩니다.
CLAUDE.md는 첫 번째 템플릿 기반 + 추가 템플릿 도메인 섹션 append 방식으로 병합됩니다.
