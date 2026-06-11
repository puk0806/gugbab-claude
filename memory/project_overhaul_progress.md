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

### 작업 3: Export 구조화 🔄 진행 중
- ✅ 훅 export 매트릭스 설계·구현 (`project-install.sh` + `scripts/gen-settings.js`)
  - 공통(11): bash-guard·auto-approve·parry·session-start·session-summary·cc-notify·instructions-loaded·pending-test-guard·skill-md-guard·verification-guard·staleness-check
  - 개발 전용: tdd-guard. TypeScript 전용: typescript-quality. Memory 선택: memory-pull·memory-sync·memory-stop-guard
- ✅ 룰 export 매트릭스 구현 (공통7·언어별3·memory선택1)
- ✅ memory 공유 기능 선택 질문 신설 (y/N)
- ✅ 강제화: parry·typescript-quality exit 2 차단. staleness-check 신규 훅
- ⬜ 각 템플릿용 CLAUDE.md 파일 작성 (examples/ 폴더)
- ⬜ project-install.sh 설치 테스트 (빈 디렉토리에 각 템플릿 실행)

### 작업 4: README 개편 ⬜ 대기
### 작업 5: 강제성 강화 ⬜ 대기

---

## 현재 스킬 수 (202종)
- frontend: 76종
- backend Rust: 17종 / Java: 22종 / Python: 10종
- devops: 9종
- game: 17종
- humanities: 19종 / education: 5종 / research: 4종 / writing: 16종
- architecture: 2종 / meta: 5종

