---
skill: code-convention
category: frontend
version: v3.1
date: 2026-11-09
status: APPROVED
---

# code-convention 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증)
  ├─ frontend-architect 에이전트 테스트 수행
  └─ 테스트 PASS → APPROVED
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | code-convention |
| 스킬 경로 | `.claude/skills/code-convention/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 검증일 | 2026-11-09 (재검증, 이전 2026-09-28) / 2026-08-26 (v3) / 2026-04-14 (v1) |
| 검증 방법 | frontend-architect 활용 테스트 (v1) → freshness 재검증(v3) → 재검증(2차) |
| 버전 기준 | ESLint 10.11.0, Biome 2.5.14, Prettier 3.9.9, Husky 9.1.7, lint-staged 17.6.0 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성
- [✅] Claude Code 에이전트에서 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | 도구 선택 기준, ESLint flat config, Prettier 연동, Husky 설정, 모노레포 공유 설정, Biome 전환 6개 | 4/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| ESLint Flat Config 공식 | https://eslint.org/docs/latest/use/configure/configuration-files | ⭐⭐⭐ High |
| eslint-config-prettier | https://github.com/prettier/eslint-config-prettier | ⭐⭐⭐ High |
| ESLint v10.0.0 릴리즈 공지 (2026-08-26 추가) | https://eslint.org/blog/2026/02/eslint-v10.0.0-released/ | ⭐⭐⭐ High |
| ESLint 버전 지원 정책 (v9 EOL 2026-08-06) | https://eslint.org/version-support/ | ⭐⭐⭐ High |
| Biome v2 업그레이드 가이드 (`organizeImports`→`assist`) | https://biomejs.dev/guides/upgrade-to-biome-v2/ | ⭐⭐⭐ High |
| Biome v2 발표 (type-aware, tsc 불필요) | https://biomejs.dev/blog/biome-v2/ | ⭐⭐⭐ High |
| @biomejs/biome dist-tags (latest 2.5.10) | https://registry.npmjs.org/-/package/@biomejs/biome/dist-tags | ⭐⭐⭐ High |
| Biome configuration 레퍼런스 (`files.includes`, `!!` force-ignore) (2026-11-09 추가) | https://biomejs.dev/reference/configuration/ | ⭐⭐⭐ High |
| typescript-eslint 패키지 문서 (`config()` deprecated → `defineConfig`) (2026-11-09 추가) | https://typescript-eslint.io/packages/typescript-eslint/ | ⭐⭐⭐ High |
| npm registry latest (eslint 10.14.0·biome 2.6.6·prettier 3.9.10·commitlint 21.2.4) (2026-11-09) | https://registry.npmjs.org/eslint | ⭐⭐⭐ High |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (ESLint 9 flat config 반영)
- [✅] 버전 명시 (ESLint 9, Husky v9)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 5. 테스트 진행 기록

### [2026-11-09] 3차 재검증 후 skill-tester 재시험 (정정 부분 겨냥)

**수행일**: 2026-11-09
**수행자**: skill-tester → general-purpose (도메인 에이전트 대신 대체 사용, 답변 에이전트 1개에 질문 3개 일괄)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

**Q1. ESLint 10 flat config 최상위 export 헬퍼 (정정: `tseslint.config()` → `defineConfig`)**
- ✅ PASS
- 근거: SKILL.md "ESLint 10+ Flat Config > 기본 구조" 섹션 + "흔한 실수 패턴"
- 상세: `eslint/config`의 `defineConfig`로 감싸는 코드를 제시, `tseslint.config()`가 deprecated임을 정확히 인용. anti-pattern(`tseslint.config()` 권장) 회피.

**Q2. Biome 2.x에서 dist·.next·node_modules 완전 제외 (정정: `files.ignore` → `files.includes`)**
- ✅ PASS
- 근거: SKILL.md "Biome > 설정" 예시 + `> 주의:` 블록
- 상세: `"includes": ["**", "!!**/dist", ...]` 제시, `ignore`/`include` 삭제·`!`(일반 제외) vs `!!`(강제 제외, 인덱싱 안 함) 구분 정확, `biome migrate --write` 안내. anti-pattern(`files.ignore` 사용) 회피.

**Q3. eslint-config-prettier flat 연동 + pre-commit typecheck 판단**
- ✅ PASS
- 근거: SKILL.md "Prettier > ESLint와 충돌 방지", "pre-commit에 typecheck 포함 여부 판단 기준"
- 상세: `eslint-config-prettier/flat` 서브패스·배열 마지막 배치·pre-commit은 lint+format, typecheck는 pre-push/CI 권장을 정확히 답변.

### 발견된 gap (선택 보강, 차단 요인 아님)

- v2에서 `files.ignore` 사용 시 오류인지 무시인지 서술 없음
- `eslint-config-prettier`를 마지막에 두는 이유 명시 없음
- 모노레포 `apps/web/eslint.config.js` 예시는 `defineConfig` 없이 일반 배열 export (동작상 문제 없으나 설명 없음)
- typecheck "느리다/빠르다"의 수치 기준 없음

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법·설정 패턴 스킬, content test 충분)
- 최종 상태: APPROVED 유지

---

### 테스트 케이스 1: frontend-architect 에이전트 활용 테스트

**테스트 방법:** frontend-architect 에이전트에게 code-convention 관련 설계 질문 및 코드 리뷰 요청

**발견 및 수정 사항:**
- eslint-config-prettier import 경로 오류: `'eslint-config-prettier'` → `'eslint-config-prettier/flat'` (flat config용 서브패스) 수정 완료

**판정:** ✅ PASS

---

### [2026-09-28] 재검증(2차) — ESLint 10.11.0·Biome 2.5.14 현행화, breaking change 없음 확인

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 3개를 1차 소스(GitHub Releases, npm registry, changeset CHANGELOG.md)와 대조

**클레임 대조 결과**:
1. ESLint 최신 버전과, 10.0(2026-02-06) 이후 flat-config-only 등 breaking change가 추가로 있었는가 → VERIFIED (`npm eslint@latest`=10.11.0. `api.github.com/repos/eslint/eslint/releases`의 v10.0.1~v10.11.0 릴리즈 노트 전수 스캔 결과 "breaking" 언급 없음 — 10.0 이후 신규 breaking change 없음)
2. Biome 최신 버전과, 2.5.10(직전 검증 시점) 이후 `assist.actions.source.organizeImports` 등 설정 스키마가 또 바뀌었는가 → VERIFIED (`npm @biomejs/biome@latest`=2.5.14. `raw.githubusercontent.com/biomejs/biome/main/packages/@biomejs/biome/CHANGELOG.md`의 2.5.11~2.5.14 항목은 전부 신규 nursery 규칙 추가·버그 fix이며 기존 설정 스키마(`assist`/`linter`/`formatter`) breaking change 없음)
3. Prettier·Husky·lint-staged 메이저가 그대로인가 → VERIFIED (npm registry latest: Prettier 3.9.9, Husky 9.1.7, lint-staged 17.6.0 — 모두 SKILL.md 표기 메이저와 일치)

**보강(ADD)·축소**: 없음 (버전 번호만 갱신)

**실전 질문 재검증**:
- Q1. "지금 ESLint 10에서 `.eslintrc.json`을 쓸 수 있나?" → SKILL.md 상단 배너·"흔한 실수" 섹션 근거로 "완전 제거, flat config만" — PASS
- Q2. "Biome 2.5 최신 patch에서 organizeImports 설정 위치가 또 바뀌었나?" → SKILL.md `biome.json` 예시(`assist.actions.source.organizeImports`) + 재검증 기록 근거로 "2.5.10 이후 변경 없음" — PASS

**재검증 최종 판정**: status **APPROVED 유지** (내용 변경 없음, 버전 번호만 갱신)

### [2026-11-09] 재검증(3차) — Biome 예시 버그·typescript-eslint deprecation 정정

**수행 방법**: SKILL.md 전체 Read → npm registry(latest 버전·게시일), Biome 공식 v2 업그레이드 가이드·configuration 레퍼런스, typescript-eslint 공식 패키지 문서 대조

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | 버전: ESLint 10.11.0·Biome 2.5.14·Prettier 3.9.9 | npm registry: ESLint 10.14.0(10-30)·Biome 2.6.6(11-06, 2.6.0=10-21)·Prettier 3.9.10·Husky 9.1.7·lint-staged 17.6.0·commitlint 21.2.4 | GitHub Releases(Biome 2.6.3~2.6.6 = nursery 룰 추가 위주 patch) | **DISPUTED → 숫자 갱신** (메이저 동일, 설정 영향 없음) |
| 2 | `biome.json` 의 `"files": { "ignore": [...] }` | Biome v2 업그레이드 가이드 "The options ignore and include are removed, and replaced by includes" | Biome configuration 레퍼런스 `files.includes` + force-ignore `!!` 예시 | **DISPUTED → 수정** (예시를 `"includes": ["**", "!!**/dist", ...]` 로) |
| 3 | `tseslint.config(...)` 로 flat config 작성 | typescript-eslint 공식 문서 "config(...) (deprecated) … deprecated in favor of ESLint core's defineConfig(...)" | ESLint 공식 configuration-files 문서 `import { defineConfig } from "eslint/config"` | **DISPUTED → 수정** (예시 2곳 4군데를 `defineConfig` 로) |
| 4 | ESLint 10 eslintrc 완전 제거·Node 요구 버전 | ESLint v10.0.0 릴리스 공지 | ESLint version-support | VERIFIED (변경 없음) |

**재검증 최종 판정**: 코드 예시 수정 → skill-tester 재시험 완료 (2026-11-09, 3/3 PASS, 위 섹션 5 최상단 기록 참조) → APPROVED 유지

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (frontend-architect, v1) / ✅ 3/3 PASS (skill-tester 재시험, 2026-11-09) |
| **최종 판정** | **APPROVED** (2026-11-09 3차 재검증 + 재시험 후에도 유지) |

---

## 7. 개선 필요 사항

- ✅ 3차 재검증 정정 후 skill-tester 재시험 (2026-11-09 완료, 3/3 PASS)
- ❌ (선택 보강, 차단 요인 아님) v2에서 `files.ignore` 사용 시 동작 설명, `eslint-config-prettier` 마지막 배치 이유, typecheck 속도 수치 기준 추가

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-03-27 | v1 | 최초 작성 및 frontend-architect 활용 테스트 완료 | frontend-architect 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-08-26 | v3 | freshness 재검증(152일 경과) — OUTDATED 4건 정정: ① ESLint 9+→**10+** 기준(2026-02-06 출시, eslintrc·`.eslintignore`·`ESLINT_USE_FLAT_CONFIG`·`--no-eslintrc` 등 완전 제거, Node `^20.19||^22.13||>=24`, config 탐색이 파일 디렉토리 기준으로 변경), v9 EOL 2026-08-06·v8 EOL 2024-10-05 명시 ② "흔한 실수"의 "v9에서는 flat config"를 "v9 병행·v10 완전 제거"로 정정 ③ `biome.json` `organizeImports`→`assist.actions.source.organizeImports: "on"`(Biome 2.5.10), `biome migrate --write` 안내 ④ 비교표 "비교적 신생" 삭제, type-aware(tsc 불필요) 행 추가. ESLint 8 레거시 프로젝트는 `architecture/module-boundaries` v8 분기로 연결. Prettier 3.x·husky 9·lint-staged VERIFIED | freshness-auditor + orchestrator (skill-creator 위임분은 API 한도로 중단돼 직접 수행, 공식 소스 4건 WebFetch 재확인) |
| 2026-09-28 | v3.1 | 재검증(2차) — ESLint 10.11.0·Biome 2.5.14·Prettier 3.9.9·Husky 9.1.7·lint-staged 17.6.0 확인. GitHub Releases/CHANGELOG 전수 대조 결과 10.0/2.5.10 이후 breaking change 없음. 버전 번호만 갱신, status APPROVED 유지 | 재검증(2차) |
| 2026-11-09 | v3.2 | 재검증(3차) — Biome 예시의 v2 에서 삭제된 `files.ignore` → `files.includes`(`!!` 강제 제외) 정정 + 주의문, `tseslint.config()` deprecated → ESLint 코어 `defineConfig`(`eslint/config`)로 예시 교체, 버전 갱신(ESLint 10.14.0·Biome 2.6.6·Prettier 3.9.10·commitlint 21.2.4). 코드 예시 수정 → skill-tester 재시험 | 재검증 b01 |
| 2026-11-09 | v3.2 | 재검증 후 2단계 실사용 테스트 수행 (Q1 `defineConfig` vs deprecated `tseslint.config()` / Q2 Biome `files.includes`·`!!` 강제 제외 / Q3 eslint-config-prettier/flat·pre-commit typecheck 판단) → 3/3 PASS, APPROVED 유지 | skill-tester |
| 2026-11-11 | v3.2 | 2026-11-11 정리 — 모델이 아는 일반 지식 절 제거(남긴 절: 버전 기준·ESLint 10 제거 항목·레거시 안내, ESLint 10+ Flat Config 기본 구조(`defineConfig`), Biome 설정·`files.includes` 주의·Biome vs ESLint+Prettier 비교, 흔한 실수 중 eslintrc 제거·Biome v1 이동 항목 / 덜어낸 절: 도구 선택 기준, 모노레포·공유 패키지 설정 패턴, Prettier, Husky + lint-staged·commitlint, TypeScript 타입 체크, CI 통합 패턴, 흔한 실수 나머지 3항목, 사실 재검증 아님) | Claude (Opus 5.5) |
