# 템플릿: academic (8)

논문·학술·인문학 작업 전용. humanities·research·writing·education 스킬 특화.

```
./project-install.sh  →  번호 입력: 8
```

---

## 에이전트 (19종)

| 카테고리 | 에이전트 | 설명 |
|----------|---------|------|
| education | [curriculum-2022-fact-checker](../../.claude/agents/education/curriculum-2022-fact-checker.md) | 2022 개정 도덕과 교육과정 인용 NCIC 원문 대조 검증 |
| research | [academic-researcher](../../.claude/agents/research/academic-researcher.md) | 인문학·철학 주제 1차 텍스트·2차 문헌·현대 응용 3축 조사 |
| research | [defense-question-simulator](../../.claude/agents/research/defense-question-simulator.md) | 학위논문 심사위원 예상 질문 12~15개 생성 + 모범 답변 |
| research | [literature-review-synthesizer](../../.claude/agents/research/literature-review-synthesizer.md) | 다수 학술 문헌 → 연구사 표·학파 계보·핵심 논쟁 매트릭스 생성 |
| research | [research-proposal-coach](../../.claude/agents/research/research-proposal-coach.md) | 큰 연구 주제 → RQ 5~8개 생성 + 기여도·가용성·적합도 평가 |
| research | [research-reviewer](../../.claude/agents/research/research-reviewer.md) | 리서치 보고서 5항목 품질 평가 |
| research | [socratic-interviewer](../../.claude/agents/research/socratic-interviewer.md) | 소크라테스식 질문으로 모호한 요구사항 → 명확한 명세 변환 |
| research | [translation-comparison](../../.claude/agents/research/translation-comparison.md) | 1차 텍스트 번역본 행 단위 비교·주요 차이 분석 |
| research | [web-searcher](../../.claude/agents/research/web-searcher.md) | 검색 축별 소스 탐색 전담 |
| research | [deep-researcher](../../.claude/agents/research/deep-researcher.md) | 논문/오픈소스/기업 사례 3축 딥 리서치 |
| validation | [abstract-reviewer](../../.claude/agents/validation/abstract-reviewer.md) | 학술 논문 초록·키워드 KCI·APA·Springer·Elsevier 기준 평가 |
| validation | [argument-reviewer](../../.claude/agents/validation/argument-reviewer.md) | 논문 논증 구조 평가 — 논리적 오류 탐지, 논증 강화 방향 |
| validation | [citation-checker](../../.claude/agents/validation/citation-checker.md) | 본문 인용·참고문헌 대조 검증 — Bekker 번호·페이지·연도 점검 |
| validation | [fact-checker](../../.claude/agents/validation/fact-checker.md) | 사실·수치·주장 교차 검증 |
| validation | [peer-review-simulator](../../.claude/agents/validation/peer-review-simulator.md) | KCI·JME 익명 동료 심사 시뮬레이션 |
| validation | [source-validator](../../.claude/agents/validation/source-validator.md) | URL·문서 신뢰도 판정 |
| meta | [planner](../../.claude/agents/meta/planner.md) | 복잡한 작업 단계별 실행 계획 분해 |
| meta | [claude-code-guide](../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI 사용법·설정 가이드 |
| meta | [freshness-auditor](../../.claude/agents/meta/freshness-auditor.md) | 에이전트·스킬 최신화 필요 항목 감사 |

---

## 스킬

| 카테고리 | 종류 | 링크 |
|----------|------|------|
| humanities (12종) | 아리스토텔레스·덕윤리·도덕철학 (꿈 관련 7종 제외) | [→ humanities 스킬 목록](../skills/humanities/README.md) |
| research (4종) | 학술 DB·체계적 문헌 검토·사례연구·연구윤리 | [→ research 스킬 목록](../skills/research/README.md) |
| writing (16종) | 학술 글쓰기 + SEO 콘텐츠 품질 | [→ writing 스킬 목록](../skills/writing/README.md) |
| education (5종) | 도덕과 교육과정·수업 적용 | [→ education 스킬 목록](../skills/education/README.md) |
| architecture (1종) | DDD만 포함 (dream-journal-data-modeling 제외) | [→ architecture 스킬 목록](../skills/architecture/README.md) |
| meta (2종) | ralph-loop·riper-workflow (dream 전용 meta 제외) | [→ meta 스킬 목록](../skills/meta/README.md) |

---

## 훅 (14종)

### 공통 (14종)

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [_lib.js](../../.claude/hooks/_lib.js) | — | 훅 공통 유틸리티 모듈 |
| [bash-guard.js](../../.claude/hooks/bash-guard.js) | PreToolUse Bash | 위험한 Bash 명령어 패턴 차단 (rm -rf 시스템 경로, force push 등) |
| [auto-approve.js](../../.claude/hooks/auto-approve.js) | PreToolUse | Bash를 제외한 도구 자동 승인 |
| [parry.js](../../.claude/hooks/parry.js) | PreToolUse Write | 시크릿·프롬프트 인젝션 패턴 스캔 — 감지 시 저장 차단 |
| [protect-secrets.js](../../.claude/hooks/protect-secrets.js) | PreToolUse Write/Edit | 민감 파일(.env, *.pem, *.key, credentials 등) 수정 차단 |
| [session-start.js](../../.claude/hooks/session-start.js) | SessionStart | 세션 시작 시 브랜치·미커밋 파일·최근 커밋 요약 출력 |
| [cc-notify.js](../../.claude/hooks/cc-notify.js) | Stop | 작업 완료 시 macOS 데스크탑 알림 |
| [instructions-loaded.js](../../.claude/hooks/instructions-loaded.js) | InstructionsLoaded | CLAUDE.md 로드 완료 시 규칙 요약 출력 |
| [deliverable-guard.js](../../.claude/hooks/deliverable-guard.js) | PostToolUse Write/Edit · PreToolUse Bash · Stop | 산출물 완결성 — 세션 수정 파일 추적 + README 동기화 검사 + PENDING_TEST 스킬 테스트 미수행 차단 |
| [skill-md-guard.js](../../.claude/hooks/skill-md-guard.js) | PostToolUse Write | SKILL.md 소스 URL·검증일·필수 섹션 검증 |
| [agent-md-guard.js](../../.claude/hooks/agent-md-guard.js) | PostToolUse Write | 에이전트 .md name·description·tools·model·example 형식 검증 |
| [verification-guard.js](../../.claude/hooks/verification-guard.js) | PostToolUse Write | verification.md 필수 섹션 확인, UNVERIFIED 상태 차단 |
| [staleness-check.js](../../.claude/hooks/staleness-check.js) | InstructionsLoaded | 스킬 검증일 경과 감지 — 30~59일 경고, 60일+ 재검증 강제 |
| [statusline.sh](../../.claude/hooks/statusline.sh) | statusLine | 상태 바 — 브랜치·미커밋 수·PENDING_TEST 스킬 수 표시 |

> 개발 전용(tdd-guard·test-fake-guard)·TypeScript(typescript-quality)·Memory 훅은 이 템플릿에 포함되지 않습니다.

---

## 규칙 (8종)

| 규칙 | 설명 |
|------|------|
| [git.md](../../.claude/rules/git.md) | Git 커밋 컨벤션 — [category] Type: Subject 형식, 관심사별 커밋 분리 |
| [info-verification.md](../../.claude/rules/info-verification.md) | 외부 정보 검증 원칙 — 공식 문서 1순위, 교차 검증 절차 |
| [agent-design.md](../../.claude/rules/agent-design.md) | 에이전트 설계 규칙 — 모델 선택, 도구 부여 기준, 파일 작성 포맷 |
| [commands.md](../../.claude/rules/commands.md) | 슬래시 커맨드 작성 규칙 — 파일 위치, 작성 원칙, 기존 목록 |
| [creation-workflow.md](../../.claude/rules/creation-workflow.md) | 스킬·에이전트 생성 5단계 — 조사→교차검증→작성→검증문서→2단계테스트 |
| [readme-update.md](../../.claude/rules/readme-update.md) | README 업데이트 규칙 — 추가/삭제/이름변경 시 반영 항목 |
| [verification-policy.md](../../.claude/rules/verification-policy.md) | 검증 정책 — PENDING_TEST→APPROVED 전환 절차, 수정 도구 제한 |
| [task-workflow.md](../../.claude/rules/task-workflow.md) | 작업 착수 전 확인 절차 — 이해 확인→작업 목록→승인 후 실행 |

> 언어별 규칙(java.md·rust.md·typescript.md)은 이 템플릿에 포함되지 않습니다.

---

## CLAUDE.md

설치 시 [`examples/CLAUDE.academic.md`](../../examples/CLAUDE.academic.md)가 대상 프로젝트 루트에 복사됩니다.

이미 CLAUDE.md가 있으면 덮어쓸지 확인 후 처리합니다.

**사전 구성 내용:**
- 학술 금지 사항 (원문 없이 인용 생성 금지, 추측으로 학술 정보 제공 금지, 번역 없이 외국어 1차 텍스트 직접 인용 금지)
- 공통 원칙 (커밋·푸시 사용자 요청 시에만, 계획 확인 절차)
- 규칙 참조 표 (task-workflow·git·info-verification·agent-design·commands)

---

## settings.json

`scripts/gen-settings.js` 플래그 없이 생성됩니다. (개발·TypeScript 훅 제외)

이미 settings.json이 있으면 덮어쓸지 확인 후 처리합니다.

| 설정 | 값 |
|------|-----|
| `defaultMode` | `"acceptEdits"` — 파일 수정 도구 자동 승인 |
| `permissions.allow` | node/npm/git 조회·변경 명령어, Write/Edit/Read/Glob/Grep/WebSearch/WebFetch/Agent |
| `permissions.deny` | `git push --force`, `rm -rf` 시스템 경로, `chmod 777`, curl\|bash 패턴 |
| `permissions.additionalDirectories` | `/tmp`, `/private/tmp`, `/var/folders` |
| `statusLine` | 브랜치·미커밋·PENDING_TEST 상태 표시 (`statusline.sh`) |
| 훅 연결 | 공통 14종만 연결 (dev·TypeScript 훅 없음) |
