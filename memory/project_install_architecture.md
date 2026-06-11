---
name: project-install-sh
description: "gugbab-claude → 다른 프로젝트 이식 구조. 10개 템플릿(0~9), JAVA_SKILLS 필터, settings.json 단일 source-of-truth (heredoc 제거)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9152b891-1df7-4c78-8301-10defaed293c
---

gugbab-claude는 Claude Code 컨벤션 소스 레포. `project-install.sh`로 다른 프로젝트에 이식.

**10개 템플릿 (2026-06-11 기준):**
- `0` 전체 — 모든 에이전트·스킬·규칙 복사
- `1` 유틸 — 비개발자용 (리서치·검증·플래너 등 범용 에이전트만)
- `2` react-spa — React SPA
- `3` nextjs — Next.js App Router
- `4` rust-axum — Rust + Axum 백엔드
- `5` java-spring-legacy — Java 11 + Spring Boot 2.5 + WAR + MyBatis
- `6` java-spring-modern — Java 21 + Spring Boot 3.x + Jar/Native + MyBatis
- `7` unity-game — Unity 6 LTS 2D 모바일 게임 (game/* 스킬 17종 + 게임 에이전트 6종)
- `8` academic — 학술·논문·인문학 특화 (humanities·education·research·writing + ACADEMIC_AGENTS 19종 화이트리스트)
- `9` dream-interpretation — 꿈 해몽 도메인 특화 (dream 스킬 전체 + DREAM_INTERPRETATION_AGENTS 25종 화이트리스트)

**필터 배열 (스크립트 내부):**
- `UTIL_AGENTS` — 유틸 템플릿에서 허용할 범용 에이전트 화이트리스트
- `EXCLUDE_AGENTS_FRONTEND` — react-spa/nextjs 시 제외 (Rust/Java 백엔드 에이전트)
- `EXCLUDE_AGENTS_BACKEND` — rust-axum 시 제외 (프론트엔드 + Java 에이전트)
- `EXCLUDE_AGENTS_JAVA` — java-spring-* 시 제외 (프론트엔드 + Rust 에이전트, build-error-resolver는 Rust/TS 전용)
- `JAVA_SKILLS_COMMON` — java-spring-legacy/modern 양쪽에 포함 (현재 13종)
- `JAVA_SKILLS_LEGACY_ONLY` — java-spring-legacy 전용 (현재 5종: spring-security-5, springfox-2, redisson-legacy, ehcache-2, aws-sdk-v1)
- `JAVA_SKILLS_MODERN_ONLY` — java-spring-modern 전용 (현재 4종: spring-security-6, springdoc-3, redisson-modern, aws-sdk-v2)
- `is_java_skill()` 함수 — backend/ 폴더 내에서 Java 스킬과 Rust 스킬 구분

**기타 동작:**
- `CLAUDE.md` / `settings.json`: 존재 시 덮어쓸지 사용자에게 질문 (기본 N)
- hooks/agents/rules/skills: 같은 이름이면 덮어쓰기, 없는 것만 추가
- settings.json 템플릿 두 종류 (단일 source-of-truth — heredoc 제거됨, 2026-04-28):
  - **dev 템플릿 = `.claude/settings.json` 자체** (cp -f) → 메인 변경이 자동 반영, 누락 위험 0
  - **util 템플릿 = `examples/settings/util.json`** (별도 파일, 비개발자용 hook 구성: verification-guard/skill-md-guard/pending-test-guard 제외)

**Why:** 팀원은 프로젝트만 git clone하면 동일한 Claude Code 환경 사용 가능. gugbab-claude 자체를 공유하지 않음. 단일 source-of-truth로 변경한 이유는 이전에 settings.json 변경(예: additionalDirectories /tmp 추가)이 install heredoc 템플릿에 반영 안 되어서 export 후에도 옛 권한이 박혀나오는 누락 사고가 발생했기 때문.

**How to apply:**
- 새 에이전트 추가 시 → 카테고리에 따라 EXCLUDE_AGENTS_* 배열에 명시 필요한지 검토
- 새 Java 스킬 추가 시 → COMMON / LEGACY_ONLY / MODERN_ONLY 중 어디에 분류할지 결정 후 배열에 추가
- **새 훅 추가 시** → HOOKS 배열 + `.claude/settings.json` 의 hooks 섹션만 수정 (dev 자동 반영). util 한정 hook 변경은 `examples/settings/util.json` 별도 수정.
- **새 권한/디렉토리 추가 시** → `.claude/settings.json` 만 수정하면 dev 템플릿 자동 반영. util 한정이면 util.json도.
- 변경 후 `bash -n project-install.sh`로 구문 검증 + 두 JSON 파일 유효성 검증
