# 템플릿: fortune-app (12)

사주·타로·손금 **캐주얼 운세 앱** 개발 전용. 운세 도메인 스킬 10종·프롬프트 평가 에이전트 1종 + 프론트엔드·Python/TypeScript 백엔드 포함.

```
./project-install.sh  →  번호 입력: 12
```

> dream-interpretation(9) 템플릿과 구조가 같지만 **안전 계열 자산이 없다**. 2026-09-10 신설 시점에는 꿈 앱과 다른 경계("문화적 상징 해석 허용 / 결정론적 단정·YMYL 조언 금지")로 안전 분류기·콘텐츠 윤리·위기 자원을 실었으나, 2026-09-11 "재미로 보는 캐주얼 앱" 방향이 확정되면서 안전 분류기 스킬·에이전트, 콘텐츠 윤리(법·규제) 스킬, 정기결제 스킬, 위기 자원 포함을 **전부 제거**했다. 남은 것은 "재미용 면책 한 줄 + 개인정보 최소화"뿐이다. dream 전용 스킬(`frontend/dream-*`·meta 꿈 프롬프트 3종·`dream-journal-data-modeling`)과 dream 에이전트는 이 템플릿에 포함되지 않는다.

---

## 에이전트 (23종)

| 카테고리 | 에이전트 | 설명 |
|----------|---------|------|
| frontend | [frontend-developer](../../.claude/agents/frontend/frontend-developer.md) | React/Next.js 컴포넌트·훅·API 연동 구현 |
| frontend | [frontend-architect](../../.claude/agents/frontend/frontend-architect.md) | 프론트엔드 아키텍처 설계·기술 판단 |
| domain | [frontend-domain-refactorer](../../.claude/agents/domain/frontend-domain-refactorer.md) | layer-first → domain-first 재편 실행 계획 |
| backend | [python-backend-developer](../../.claude/agents/backend/python-backend-developer.md) | FastAPI 백엔드 코드 구현 |
| backend | [python-backend-architect](../../.claude/agents/backend/python-backend-architect.md) | FastAPI 백엔드 아키텍처 설계 |
| backend | [typescript-backend-developer](../../.claude/agents/backend/typescript-backend-developer.md) | Node/TS 백엔드 구현 (Hono·Fastify·Prisma/Drizzle) |
| backend | [typescript-backend-architect](../../.claude/agents/backend/typescript-backend-architect.md) | Node/TS 백엔드 아키텍처 설계 |
| backend | [database-architect](../../.claude/agents/backend/database-architect.md) | DB 스키마·ERD·인덱싱 설계 |
| devops | [devops-engineer](../../.claude/agents/devops/devops-engineer.md) | Dockerfile·GitHub Actions·배포 설정 |
| domain | [api-spec-designer](../../.claude/agents/domain/api-spec-designer.md) | PRD → OpenAPI 3.1 스펙·에러 코드·인증 설계 |
| domain | [product-planner](../../.claude/agents/domain/product-planner.md) | 아이디어·요구사항 → PRD 작성 + MVP 범위 절단 |
| domain | [ui-ux-designer](../../.claude/agents/domain/ui-ux-designer.md) | PRD → 와이어프레임·디자인 토큰·컴포넌트 스펙 |
| research | [web-searcher](../../.claude/agents/research/web-searcher.md) | 검색 축별 소스 탐색 전담 |
| research | [deep-researcher](../../.claude/agents/research/deep-researcher.md) | 논문/오픈소스/기업 사례 3축 딥 리서치 |
| research | [research-reviewer](../../.claude/agents/research/research-reviewer.md) | 리서치 보고서 품질 평가 |
| validation | [fortune-interpretation-prompt-tester](../../.claude/agents/validation/fortune-interpretation-prompt-tester.md) | 운세 해석 프롬프트 3축 평가 (톤·단정 회피·출력 포맷) |
| validation | [fact-checker](../../.claude/agents/validation/fact-checker.md) | 사실·수치·주장 교차 검증 |
| validation | [source-validator](../../.claude/agents/validation/source-validator.md) | URL·문서 신뢰도 판정 |
| validation | [qa-engineer](../../.claude/agents/validation/qa-engineer.md) | E2E 테스트·적대적 시나리오·Playwright 코드 생성 |
| validation | [security-auditor](../../.claude/agents/validation/security-auditor.md) | OWASP·PIPA·LLM 리스크 보안 감사 |
| meta | [claude-code-guide](../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI 사용법·설정 가이드 |
| meta | [tech-stack-advisor](../../.claude/agents/meta/tech-stack-advisor.md) | 요구사항에 맞는 기술 스택 추천·비교 |
| meta | [project-scaffolder](../../.claude/agents/meta/project-scaffolder.md) | 결정된 스택으로 프로젝트 부트스트랩 |

> 작성 도구 포함 옵션(y)을 켜면 `agent-creator`·`skill-creator`·`skill-tester` 3종이 추가된다.
> 2026-09-11 제거: `validation/fortune-safety-classifier`(7카테고리 안전 분류기) — 캐주얼 앱에 불필요.

---

## 스킬 (89종 — SEO 옵트인 y 시 113종)

### 운세 앱 전용 (10종 — 이 템플릿과 `all`에서만 설치)

| 카테고리 | 스킬 | 설명 |
|----------|------|------|
| humanities | [korean-saju-tradition](../../.claude/skills/humanities/korean-saju-tradition/SKILL.md) | 사주명리 3대 원전 계보·간지/오행/십성/대운 개념·조선 명과학 수용사 |
| humanities | [tarot-history-symbolism](../../.claude/skills/humanities/tarot-history-symbolism/SKILL.md) | 타로 덱 계보·78장 구조·RWS 상징·융 원형론(과장 금지)·이미지 저작권 |
| humanities | [palmistry-limitations](../../.claude/skills/humanities/palmistry-limitations/SKILL.md) | 손금 어휘(선·구 명칭)·문화사·경험 연구 실패 이력, 엔터테인먼트 프레이밍 한 줄 고지 |
| meta | [fortune-interpretation-prompt-engineering](../../.claude/skills/meta/fortune-interpretation-prompt-engineering/SKILL.md) | 사주·타로·손금 3모드 시스템 프롬프트, "상징 해석 허용 / 단정 회피" 톤, Structured Outputs, 캐싱 |
| architecture | [saju-tarot-data-modeling](../../.claude/skills/architecture/saju-tarot-data-modeling/SKILL.md) | 출생 입력/계산 결과 분리·계산 버전 캐시 무효화·Subject 분리·Dexie 4.x 스키마·생년월일시 암호화 |
| frontend | [saju-chart-visualization](../../.claude/skills/frontend/saju-chart-visualization/SKILL.md) | 원국 표·오행 차트·대운 타임라인, 오방정색 WCAG 재조정, "오행 개수=우열" 오독 방지 |
| frontend | [tarot-card-deck-ui](../../.claude/skills/frontend/tarot-card-deck-ui/SKILL.md) | CSS 3D 플립·셔플, 스프레드 배치, Fisher-Yates + crypto 셔플, 접근성, 카드 에셋 |
| frontend | [palm-photo-capture-vision](../../.claude/skills/frontend/palm-photo-capture-vision/SKILL.md) | 손바닥 촬영 → Claude Vision 파이프라인, 품질 검증, 손 아닌 이미지 거부, 원본 미보관 |
| frontend | [daily-fortune-retention-loop](../../.claude/skills/frontend/daily-fortune-retention-loop/SKILL.md) | 하루 1회 갱신 경계·write-once 캐싱(리롤 금지)·푸시·스트릭·공유 카드 |
| backend | [korean-lunar-calendar-manseryeok](../../.claude/skills/backend/korean-lunar-calendar-manseryeok/SKILL.md) | 절기 기준 월주·입춘 기준 연주, 한국 표준시·서머타임 이력, 진태양시 보정, KASI 대조 검증 |

> 2026-09-11 삭제 3종: `meta/fortune-safety-classifier-prompts`(안전 분류기 프롬프트)·`humanities/fortune-content-ethics-korea`(표시광고법·전자상거래법·개인정보 규제)·`backend/web-subscription-payments-korea`(정기결제) — 캐주얼 앱에 과잉. 필요해지면 git 이력(2026-09-10 신설 커밋 전 워킹트리)이 아니라 신규 작성으로 되살린다(미커밋 상태에서 삭제됨).

### 공유 스킬 (79종 — SEO y 시 103종)

| 카테고리 | 종류 | 링크 |
|----------|------|------|
| frontend (53종 / SEO y 시 72종) | 프레임워크·상태관리·UI·빌드·테스트·성능·LLM 스트리밍·PWA (dream-* 전용 제외, SEO·GEO 19종은 옵트인 — 정적 HTML 전용 `seo-static-html` 은 스택 템플릿과 같이 제외) | [→ frontend 스킬 목록](../skills/frontend/README.md) |
| backend — Python (10종) | FastAPI·Pydantic·LlamaIndex·Anthropic SDK 등 | [→ backend 스킬 목록](../skills/backend/README.md) |
| devops (9종 / SEO y 시 10종) | Docker·GitHub Actions·n8n·Vercel Sandbox (+ site-migration-seo 는 옵트인) | [→ devops 스킬 목록](../skills/devops/README.md) |
| architecture (4종) | DDD·프론트 도메인 구조·모듈 경계·점진 리팩터링 | [→ architecture 스킬 목록](../skills/architecture/README.md) |
| writing (0종 / SEO y 시 4종) | SEO 콘텐츠 품질 (content-eeat-quality·ymyl·multilingual·accessibility-vpat) — 옵트인 | [→ writing 스킬 목록](../skills/writing/README.md) |
| meta (3종) | ralph-loop·riper-workflow·claude-code-hook-authoring | [→ meta 스킬 목록](../skills/meta/README.md) |

> game·education·research·health 카테고리와 Java·Rust 백엔드, dream 전용 스킬(frontend `dream-*` 8종·meta 3종·`dream-journal-data-modeling`), humanities 공유 스킬(위기 자원 포함)은 제외된다.
> **SEO·GEO 옵트인 (2026-09-11)**: react-spa·nextjs와 같은 질문(`y` 전체 / `c` 커머스 / `n` 제외, 엔터 = n)을 받는다. 이전에는 SEO 20종 + writing 4종이 무조건 포함돼 seo-geo(11) 병행 선택이 무의미했다. 캐주얼 앱이면 n.

---

## 훅 (20종 — 공통 15 + 개발 전용 4 + TypeScript 1)

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [_lib.js](../../.claude/hooks/_lib.js) | — | 훅 공통 유틸리티 모듈 |
| [bash-guard.js](../../.claude/hooks/bash-guard.js) | PreToolUse Bash | 위험한 Bash 명령어 패턴 차단 (rm -rf 시스템 경로, force push 등) |
| [auto-approve.js](../../.claude/hooks/auto-approve.js) | PreToolUse | Bash를 제외한 도구 자동 승인 |
| [parry.js](../../.claude/hooks/parry.js) | PreToolUse Write | 시크릿·프롬프트 인젝션 패턴 스캔 — 감지 시 저장 차단 |
| [protect-secrets.js](../../.claude/hooks/protect-secrets.js) | PreToolUse Write/Edit | 민감 파일(.env, *.pem, *.key, credentials 등) 수정 차단 |
| [session-start.js](../../.claude/hooks/session-start.js) | SessionStart | 세션 시작 시 브랜치·미커밋 파일·최근 커밋 요약 출력 |
| [session-export.js](../../.claude/hooks/session-export.js) | Stop | 세션 대화 요약을 로컬 exports에 기록 |
| [cc-notify.js](../../.claude/hooks/cc-notify.js) | Stop | 작업 완료 시 macOS 데스크탑 알림 |
| [instructions-loaded.js](../../.claude/hooks/instructions-loaded.js) | InstructionsLoaded | CLAUDE.md 로드 완료 시 규칙 요약 출력 |
| [deliverable-guard.js](../../.claude/hooks/deliverable-guard.js) | PostToolUse Write/Edit · PreToolUse Bash · Stop | 산출물 완결성 — 세션 수정 파일 추적 + README 동기화 검사 + PENDING_TEST 스킬 테스트 미수행 차단 |
| [skill-md-guard.js](../../.claude/hooks/skill-md-guard.js) | PreToolUse Write | SKILL.md 소스 URL·검증일·필수 섹션 검증 |
| [agent-md-guard.js](../../.claude/hooks/agent-md-guard.js) | PreToolUse Write | 에이전트 .md name·description·tools·model·example 형식 검증 |
| [verification-guard.js](../../.claude/hooks/verification-guard.js) | PreToolUse Write | verification.md 필수 섹션 확인, UNVERIFIED 상태 차단 |
| [staleness-check.js](../../.claude/hooks/staleness-check.js) | InstructionsLoaded | 스킬 검증일 경과 감지 — 30~59일 경고, 60일+ 재검증 강제 |
| [statusline.sh](../../.claude/hooks/statusline.sh) | statusLine | 상태 바 — 브랜치·미커밋 수·PENDING_TEST 스킬 수 표시 |
| [tdd-guard.js](../../.claude/hooks/tdd-guard.js) | PostToolUse Write/Edit | 소스 파일 수정 시 대응 테스트 파일 존재 여부 검사 — 없으면 차단 |
| [test-fake-guard.js](../../.claude/hooks/test-fake-guard.js) | PreToolUse Bash / PostToolUse Write | 가짜 테스트 패턴 탐지·차단 |
| [adversarial-test-guard.js](../../.claude/hooks/adversarial-test-guard.js) | PostToolUse Write/Edit | 테스트 파일이 정상 흐름만 담고 악성 유저 방어·이상 경로를 누락하면 차단 |
| [fake-impl-guard.js](../../.claude/hooks/fake-impl-guard.js) | PostToolUse Write/Edit | 파라미터를 무시하고 테스트 기대 리터럴을 그대로 return하는 가짜 구현 차단 |
| [typescript-quality.js](../../.claude/hooks/typescript-quality.js) | PostToolUse Write/Edit | tsc --noEmit 타입 검사 — 에러 시 차단 (레거시 프로파일 선택 시 --changed-only) |

> **2026-09-11부터 스택 템플릿과 같은 레벨(dev + TypeScript)**: health(10)·dream(9)과 동일하게 개발 전용 훅 4종 + TypeScript 훅 1종, `adversarial-testing.md`·`typescript.md` 규칙, Codex 적대적 리뷰·레거시 프로파일 옵션 질문을 받는다. 이전에는 개발 에이전트(frontend-developer·backend developer 4종·qa-engineer)를 설치하면서 훅이 없어 qa-engineer가 명시하는 "adversarial-test-guard가 차단"이 성립하지 않았다. Memory·Branch Protection 훅은 설치 시 옵션으로 켤 수 있다.

---

## 규칙 (5종 기본 / 작성 도구 옵션 y 시 10종)

| 규칙 | 설명 | 포함 조건 |
|------|------|-----------|
| [git.md](../../.claude/rules/git.md) | Git 커밋 컨벤션 — [category] Type: Subject 형식, 관심사별 커밋 분리 | 항상 |
| [info-verification.md](../../.claude/rules/info-verification.md) | 외부 정보 검증 원칙 — 공식 문서 1순위, 교차 검증 절차 | 항상 |
| [task-workflow.md](../../.claude/rules/task-workflow.md) | 작업 착수 전 확인 절차 — 이해 확인→작업 목록→승인 후 실행 | 항상 |
| [adversarial-testing.md](../../.claude/rules/adversarial-testing.md) | 적대적 테스트 원칙 — 테스트 3계층 강제, 가짜 구현 금지 (dev 템플릿 공통) | 항상 (2026-09-11 추가) |
| [typescript.md](../../.claude/rules/typescript.md) | TypeScript 코딩 규칙 (TS 템플릿 공통) | 항상 (2026-09-11 추가) |
| [agent-design.md](../../.claude/rules/agent-design.md) | 에이전트 설계 규칙 — 모델 선택, 도구 부여 기준 | 작성 도구 y |
| [creation-workflow.md](../../.claude/rules/creation-workflow.md) | 스킬·에이전트 생성 5단계 | 작성 도구 y |
| [verification-policy.md](../../.claude/rules/verification-policy.md) | 검증 정책 — PENDING_TEST→APPROVED 전환 절차 | 작성 도구 y |
| [commands.md](../../.claude/rules/commands.md) | 슬래시 커맨드 작성 규칙 | 작성 도구 y |
| [readme-update.md](../../.claude/rules/readme-update.md) | README 업데이트 규칙 | 작성 도구 y |

> java.md·rust.md는 포함되지 않는다. 작성 도구 n·codex n 이면 CLAUDE.md 규칙 표에서 해당 미설치 규칙 행이 설치 시 자동 제거된다(2026-09-11).

---

## CLAUDE.md

설치 시 [`examples/CLAUDE.fortune-app.md`](../../examples/CLAUDE.fortune-app.md)가 대상 프로젝트 루트에 복사되고 공통 규칙(`CLAUDE.common.md`)이 주입된다.

이미 CLAUDE.md가 있으면 덮어쓸지 확인 후 처리한다.

**사전 구성 내용 — `## 콘텐츠 원칙` 2항 (2026-09-11, 안전 정책 8항에서 축소):**
- **재미로 보는 운세** — 결과 화면마다 "재미로 보는 운세예요. 검증된 예측이 아니에요" 한 줄 고지. 상징 해석·전통 풀이는 살리되 결정론적 단정보다 hedging 어조 권장
- **개인정보 최소화** — 생년월일시·손 사진은 개인정보. 수집 최소화, 분석 로그 원문 보관 금지, 손 사진은 해석 후 즉시 폐기 기본값

> 이전 버전의 안전 정책 8항(안전 분류기 카테고리별 대응, 위기 자원 안내, YMYL 실행 조언 금지, 과의존 대응 등)은 제거됐다.

---

## settings.json

`scripts/gen-settings.js --dev --typescript` 로 생성된다(react-spa·health와 같은 플래그). 이미 settings.json이 있으면 덮어쓸지 확인 후 처리한다.

| 설정 | 값 |
|------|-----|
| `permissions.defaultMode` | `"acceptEdits"` — 파일 수정 도구 자동 승인 |
| `permissions.allow` | node/npm/git 조회·변경 명령어, Write/Edit/Read/Glob/Grep/WebSearch/WebFetch/Agent |
| `permissions.deny` | `git push --force`, `rm -rf` 시스템 경로, `chmod 777`, curl\|bash 패턴 |
| `permissions.additionalDirectories` | `/tmp`, `/private/tmp`, `/var/folders` |
| `statusLine` | 브랜치·미커밋·PENDING_TEST 상태 표시 (`statusline.sh`) |
| 훅 연결 | 공통 15종 + 개발 전용 4종 + TypeScript 1종 |

---

## 설치 검증 (2026-09-11)

임시 디렉토리에 기본 옵션(memory·superpowers·codex·레거시·작성 도구·readme-guard·staleness·branch-protection 전부 n, SEO 엔터 = n)으로 설치해 **에이전트 23 / 스킬 89(운세 전용 10종 전부 포함) / 훅 20 / 규칙 5 / 커맨드 9**가 매니페스트에 기록되고 `templates: ["fortune-app"]`이 남는 것을 확인했다. SEO 옵트인 y 시 스킬 113(SEO 19 + writing 4 + site-migration-seo). 운세 전용 스킬 10종은 react-spa·nextjs·dream·java 등 다른 템플릿에서 `is_fortune_skill` 게이트로 차단되고, `12 → util` 다운그레이드 재설치에서 수렴한다. `scripts/template-separation.test.js` fortune 케이스 5건(양성 대조·SEO y·누수·다운그레이드·수정본 보존) 포함 전체 통과.
