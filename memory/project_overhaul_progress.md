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

### 작업 2: 훅/룰 정리 ⬜ 대기
- 훅 21종 역할·실제 동작 여부 정리표 작성
- tdd-guard·typescript-quality·drift-monitor·instructions-loaded 실효성 검토
- 룰 11종 — java.md·rust.md 해당 템플릿 export 시만 포함 여부 검토
- 제거 실행 + settings.json 정리

### 작업 3: Export 구조화 ⬜ 대기
- 템플릿별 훅·룰·CLAUDE.md 매트릭스 설계
- 각 템플릿용 CLAUDE.md 파일 작성

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

