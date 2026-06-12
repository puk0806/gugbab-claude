---
name: project_overhaul_progress
description: feature/overhaul 브랜치 개편 작업 진행 상황 — 작업 목록·결정사항·현재 상태 추적
metadata: 
  node_type: memory
  type: project
  originSessionId: 9152b891-1df7-4c78-8301-10defaed293c
---

레포 개편 작업은 `feature/overhaul` 브랜치에서 진행. OVERHAUL.html이 공식 트래커.

**Why:** 스킬이 224종으로 과도하게 많아졌고, Claude 내장 지식과 중복되는 스킬이 다수 존재. 훅·룰도 정비 필요.

**How to apply:** 작업 재개 시 OVERHAUL.html 체크박스 상태 확인 후 다음 미완 항목부터 진행.

---

## 작업 현황 (2026-06-11 기준)

### 작업 1: 스킬 정리 ✅ 완료
- 전체 스킬 audit (frontend·backend Rust/Java/Python·game·humanities·education·research·meta 전체)
- vercel-labs/agent-skills 조사 완료
- **삭제 21종** (224→202종):
  - frontend 12종: react-core·sass·component-design·api-integration·accessibility·design-patterns·intersection-observer·mutation-observer·page-visibility·resize-observer·css-variables·dayjs
  - backend Python 6종: python-basics·python-pytest·python-pandas-fundamentals·python-data-visualization·python-jupyter-notebook·python-web-scraping
  - backend Rust 2종: cargo-workspace·dotenvy
  - meta 1종: continuous-learning
- **유지 결정**: humanities·education·research·dream-interpretation 전체 (도메인 특화 가치)
- **project-install.sh 템플릿 2종 추가**: academic(#8)·dream-interpretation(#9) → 총 10개 템플릿
- README·OVERHAUL.html 동기화 완료

### 작업 2: 훅/룰 정리 ✅ 완료
- 훅 4종 삭제 (19→15종):
  - drift-monitor: spec.md 없어 항상 silent pass — 실효성 0
  - subagent-audit: /tmp 로그, 아무도 안 읽음
  - pre-compact: /tmp 스냅샷, 빌트인 압축으로 충분
  - user-prompt-submit: low signal 힌트, 컨텍스트 오염
- tdd-guard·typescript-quality·instructions-loaded 유지 결정
- java.md·rust.md 룰 export 필터링 → Task 3으로 이관
- settings.json에서 4개 이벤트 블록 제거 완료

### 작업 3: Export 구조화 ✅ 완료
- ✅ 훅 export 매트릭스 설계·구현 (`project-install.sh` + `scripts/gen-settings.js`)
  - 공통(12): bash-guard·auto-approve·parry·session-start·session-summary·cc-notify·instructions-loaded·pending-test-guard·skill-md-guard·verification-guard·staleness-check·task-plan-guard
  - 개발 전용: tdd-guard. TypeScript 전용: typescript-quality. Memory 선택: memory-pull·memory-sync·memory-stop-guard
- ✅ 룰 export 매트릭스 구현 (공통8[task-workflow.md 추가]·언어별3·memory선택1)
- ✅ memory 공유 기능 선택 질문 신설 (y/N)
- ✅ 강제화: parry·typescript-quality exit 2 차단. staleness-check·task-plan-guard 신규 훅
- ✅ 강제화 추가: test-fake-guard.js(개발 전용 신규) + session-summary Stop 지시 강화. 훅 17→18종
- ✅ 9종 CLAUDE.md 템플릿 작성 (`examples/` 폴더) — util·react-spa·nextjs·rust-axum·java-spring-legacy·java-spring-modern·unity-game·academic·dream-interpretation
- ✅ project-install.sh 설치 테스트 통과 (react-spa·java-spring-legacy·util 3개 검증)

### 작업 4: README 개편 ✅ 완료 (2026-06-12)
- ✅ README 루트 간소화: 에이전트·스킬·훅 상세 테이블 제거 → 트리 + 4줄 링크로 대체
- ✅ 프로젝트 구조 코드블럭 → 트리 시각화 유지 + 아래 클릭 가능 링크(agents/skills/hooks/rules)
- ✅ docs/agents/README.md 신설 (9카테고리 인덱스)
- ✅ docs/skills/README.md 신설 (10카테고리 인덱스)
- ✅ docs/agents/{category}/README.md 9종 신설 (각 카테고리별 에이전트 목록)
- ✅ docs/skills/{category}/README.md 10종 신설 (각 카테고리별 스킬 목록 + verification 링크)
- ✅ docs/hooks/README.md 신설 (20종 전체 목록)
- ✅ docs/rules/README.md 신설 (13종 전체 목록)
- ✅ docs/templates/{9종}.md 신설 — 에이전트·스킬·훅·규칙·CLAUDE.md·settings.json 6섹션 상세
- ✅ 템플릿 테이블에 상세 링크(→) 열 추가
- ✅ 불필요 링크 2줄 제거 ("템플릿별 CLAUDE.md 예시 → examples/", "에이전트·스킬 전체 목록 → docs/")

### 작업 5: 강제성 강화 ✅ 완료
- ✅ 5a: 도출 — verification UNVERIFIED 저장, agent-md 구조, README 미업데이트, memory Bash 수정, rules 약한 표현
- ✅ 5b: verification-guard.js — status UNVERIFIED 저장 차단(exit 2)
- ✅ 5c: agent-md-guard.js 신규 — .claude/agents/ .md 파일 name/description/tools/model/<example> 검증
- ✅ 5d: readme-guard.js 신규 — Stop 경고: SKILL.md·agent .md 수정 시 README 미업데이트 감지
- ✅ 5e: bash-guard.js — memory/ 파일 sed/awk/perl/echo/cat Bash 차단 5종 추가
- ✅ 5f: agent-design.md — maxTurns "권장" → "반드시 설정" 강제 표현 교체

---

## 현재 훅 수 (27종)
- 공통 19 + 개발 전용 4 + TypeScript 전용 1(typescript-quality) + memory 선택 3
- 공통 19: bash-guard·auto-approve·parry·protect-secrets·session-start·session-handoff-inject·session-summary·session-handoff·cc-notify·instructions-loaded·pending-test-guard·readme-guard·skill-md-guard·agent-md-guard·verification-guard·staleness-check·task-plan-guard·_lib·statusline
- 개발 전용 4: tdd-guard·test-fake-guard·verification-gate·careful-with-judge
- Task 5 신규: agent-md-guard.js (PostToolUse Write: agent .md 구조 검증), readme-guard.js (Stop 경고: README 미업데이트 감지)
- 2026-06-12 신규 7종: _lib.js(공통 유틸), protect-secrets.js(민감파일 차단), session-handoff.js(Stop: git 상태 저장), session-handoff-inject.js(SessionStart: 이전 세션 주입), verification-gate.js(dev: 테스트 없는 src 변경 경고), statusline.sh(브랜치·미커밋·PENDING_TEST 상태바), careful-with-judge.js(dev: rm -rf 판단)

## 현재 스킬 수 (202종)
- frontend: 76종
- backend Rust: 17종 / Java: 22종 / Python: 10종
- devops: 9종
- game: 17종
- humanities: 19종 / education: 5종 / research: 4종 / writing: 16종
- architecture: 2종 / meta: 5종

