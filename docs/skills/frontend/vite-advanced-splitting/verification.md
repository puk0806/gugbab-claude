---
skill: vite-advanced-splitting
category: frontend
version: v1
date: 2026-04-20
status: PENDING_TEST
---

# vite-advanced-splitting 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ WebSearch 교차 검증 ✅ (6개 클레임, VERIFIED 6, DISPUTED 0)
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증)
  ├─ frontend-developer 에이전트 테스트 수행
  └─ 테스트 PASS → APPROVED
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | vite-advanced-splitting |
| 스킬 경로 | .claude/skills/frontend/vite-advanced-splitting/SKILL.md |
| 최초 작성일 | 2026-04-20 |
| 검증 방법 | WebSearch 교차 검증 (메인 대화) |
| 버전 기준 | Vite 6.x / Rollup 4.x |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (vitejs.dev, vite.dev/guide/api-plugin)
- [✅] 핵심 패턴 정리 (manualChunks 함수형, 모드 분리, 플러그인 훅)
- [✅] 코드 예시 작성 (실제 lf-ui 구조 기반)
- [✅] 흔한 실수 패턴 정리 (3가지)
- [✅] WebSearch 교차 검증 (6개 클레임, VERIFIED 6, DISPUTED 0)
- [✅] SKILL.md 파일 작성
- [ ] 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 교차 검증 | WebSearch | 6개 클레임, 독립 소스 2개+ | VERIFIED 6 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Vite 공식 빌드 옵션 | https://vite.dev/config/build-options | ⭐⭐⭐ High | - | manualChunks, rollupOptions 레퍼런스 |
| Vite 공식 플러그인 API | https://vitejs.dev/guide/api-plugin | ⭐⭐⭐ High | - | buildStart, closeBundle 훅 |
| Vite 공식 빌드 가이드 | https://vitejs.dev/guide/build | ⭐⭐⭐ High | - | 멀티 빌드, mode 설정 |
| soledadpenades.com manualChunks | https://soledadpenades.com/posts/2025/use-manual-chunks-with-vite-to-facilitate-dependency-caching/ | ⭐⭐ Medium | 2025-02 | 패키지명 기반 분할 실전 가이드 |
| Vite GitHub Discussion #17730 | https://github.com/vitejs/vite/discussions/17730 | ⭐⭐ Medium | - | 대형 프로젝트 동적 import + splitting |
| Vite Plugin API Discussion | https://github.com/vitejs/vite/discussions/13175 | ⭐⭐ Medium | - | writeBundle/closeBundle 순차 실행 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Vite 6.x, Rollup 4.x)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 5개 핵심 섹션 포함 (manualChunks, 분리빌드, Gulp→플러그인, preloadError, 출력최적화)
- [✅] 코드 예시 포함
- [✅] 흔한 실수 패턴 포함 (3가지)

### 4-3. 실용성
- [✅] lf-ui의 27개 API 클라이언트 청크, Gulp 스크립트, 모바일/데스크톱 분리 빌드 상황에 직접 대응
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. WebSearch 교차 검증 결과

| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | `manualChunks` 함수에서 `id.split('/node_modules/').pop()?.split('/')[0]`으로 패키지명 추출 가능 | VERIFIED | soledadpenades.com 2025 실전 가이드 + Vite GitHub Discussion 확인 |
| 2 | `loadEnv(mode, process.cwd(), '')`로 `.env.{mode}` 파일 수동 로드 가능 | VERIFIED | vitejs.dev/config/ 공식 문서 확인 |
| 3 | Vite 플러그인 `buildStart` 훅은 빌드 시작 시, `closeBundle` 훅은 모든 번들 작업 완료 후 실행 | VERIFIED | vitejs.dev/guide/api-plugin 공식 문서 확인 |
| 4 | `writeBundle`과 `closeBundle`은 기본적으로 병렬 실행, `closeBundle`이 더 안전한 파일 처리 시점 | VERIFIED | Vite GitHub Discussion #13175 확인 |
| 5 | `manualChunks`에서 앱 내부 파일(src/)을 강제 분할하면 circular dependency 위험 있음 | VERIFIED | vitejs/vite issue #12209 + #17653 확인 |
| 6 | `vite:preloadError` 이벤트로 동적 import 실패를 감지하고 재시도 로직 구현 가능 | VERIFIED | vitejs.dev/guide/troubleshooting 공식 문서 확인 |

| 7 | Vite 8부터 Rolldown이 기본 번들러로 전환되며 `build.rollupOptions`는 `build.rolldownOptions`로 개명(`rollupOptions`는 deprecated alias로 하위호환 유지). `output.manualChunks` 객체 형식은 Vite 8+에서 미지원(함수 형식은 deprecated로 계속 동작) | VERIFIED (SKILL.md 인용 출처 기준) | SKILL.md 자체 인용 출처 https://vite.dev/guide/migration 기준으로 2026-08-11 SKILL.md에 반영됨. 이번 동기화 세션에서 별도 WebSearch 재검증은 미수행 — SKILL.md 인용 출처 대조 + 내용 일관성만 확인 |

### 4-5. DISPUTED 항목 처리

- 없음 (전 클레임 VERIFIED, 7번 항목은 SKILL.md 인용 출처 기준)

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-12
**수행자**: 메인 대화 직접 수행 (skill-tester 서브에이전트 미호출 — SKILL.md에 이미 반영된 Vite 8 대응 주의사항 동기화 목적의 단발 점검)
**수행 방법**: SKILL.md에 2026-08-11 추가된 "Vite 8+" 주의사항(rollupOptions→rolldownOptions 개명, manualChunks 객체 형식 미지원)이 verification.md에 미기록 상태였던 것을 확인 → 신규 내용 기반 실전 질문 2개를 직접 답변·근거 대조

### 신규 반영 내용 content test (2026-08-12)

**Q1. Vite 8에서 manualChunks 객체 형식(`manualChunks: { 'react-vendor': [...] }`)을 그대로 쓸 수 있는가?**
- PASS
- 근거: SKILL.md 최상단 "주의 (Vite 8+):" 블록 + "1. manualChunks 전략 > 기본 형식 비교" 섹션 내 "주의 (Vite 8+):" 문구
- 상세: 미지원. "패키지명 기반 자동 분할"에서 제시하는 함수 형식 `manualChunks(id)` 패턴으로 전환해야 한다고 SKILL.md가 명시적으로 안내.

**Q2. 함수형 manualChunks는 Vite 8+에서 계속 쓸 수 있는가?**
- PASS
- 근거: 최상단 "주의 (Vite 8+):" 블록 + "기본 형식 비교" 코드 블록 주석("Vite 8+에서도 동작, deprecated")
- 상세: 예, deprecated 상태로는 계속 동작한다고 명시. 단 향후 대체(`rolldownOptions.output.codeSplitting` 등) 검토가 필요하다는 점도 안내됨.

### 발견된 gap

- 없음 (2/2 PASS, SKILL.md의 Vite 8 대응 주의사항이 자기 완결적으로 근거 제공)

### 판정 (2026-08-12)

- agent content test (신규 내용): PASS (2/2, 메인 대화 직접 수행)
- verification-policy 분류: 빌드 설정 스킬 — 실사용 필수 카테고리 (변동 없음)
- 최종 상태: PENDING_TEST 유지 (Vite 8 대응 내용 동기화 완료, 실제 프로젝트 빌드 검증 후 APPROVED 전환 대상이라는 기존 판정 변동 없음)

---

## 5-1. 이전 테스트 진행 기록 (2026-04-24, 보존)

**수행일**: 2026-04-24
**수행자**: skill-tester → general-purpose (대체 사용: java-backend-developer 미해당, frontend-developer 미등록)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. scoped 패키지(@sentry/react)를 manualChunks 함수에서 vendors-sentry 청크에 배정하는 방법**
- PASS
- 근거: SKILL.md "1. manualChunks 전략 > 패키지명 기반 자동 분할" 섹션 (44~62행)
- 상세: `id.split('/node_modules/')` 후 마지막 요소 추출 → `rawPkg.startsWith('@')`이면 `slice(0,2).join('/')` 처리로 `@sentry/react` 추출 → `pkg.startsWith('@sentry')` 조건으로 `vendors-sentry` 반환. 코드가 스텝별로 명확히 기술되어 있으며 scoped 패키지 분기 처리까지 포함.

**Q2. .env.mobile 환경변수가 vite.config.ts에서 undefined로 읽히는 원인과 해결법**
- PASS
- 근거: SKILL.md "흔한 실수 패턴 > 2. loadEnv 미사용으로 .env.{mode} 파일 못 읽음" 섹션 (349~361행)
- 상세: `defineConfig({...})` 객체 형식 사용 시 `.env.{mode}` 파일 자동 로드 불가 → `defineConfig(({ mode }) => { const env = loadEnv(mode, process.cwd(), '') })` 함수형으로 전환해야 함. anti-pattern과 올바른 패턴 모두 명시.

**Q3. Gulp postbuild 태스크(빌드 완료 후 파일 생성)를 Vite 플러그인 전환 시 writeBundle vs closeBundle 선택**
- PASS
- 근거: SKILL.md "흔한 실수 패턴 > 3. closeBundle vs writeBundle 혼동" 및 "3. Gulp 빌드 스크립트 > Vite 플러그인 훅 실행 순서" 섹션 (363~374행, 241~251행)
- 상세: `writeBundle`은 각 청크 파일이 쓰인 직후 병렬 실행, `closeBundle`은 모든 번들 작업 완료 후 순차 실행. postbuild 태스크(파일 읽기/복사)는 build/ 디렉토리에 모든 파일이 존재해야 하므로 `closeBundle` 사용이 올바름.

### 발견된 gap

- 없음 (3/3 PASS, SKILL.md 내용이 모든 질문에 충분한 근거 제공)

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 빌드 설정 스킬 → 실사용 필수 카테고리
- 최종 상태: PENDING_TEST 유지 (content test PASS, 실제 프로젝트 적용 후 APPROVED 전환 예정)

---

(아래는 기존 템플릿 참고용 보존)

- 현재 없음 (PENDING_TEST 상태)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (3/3, 2026-04-24 / 2026-08-12 Vite 8 신규 내용 2/2 PASS 추가) |
| Vite 8 대응 주의사항 동기화(2026-08-12) | ✅ SKILL.md 반영 내용 클레임 판정표(4-4 #7) 기록 + content test 2/2 PASS |
| **최종 판정** | **PENDING_TEST** (빌드 설정 실사용 필수 카테고리, content test PASS, 2026-08-12 동기화에도 유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-04-24 완료, 3/3 PASS)
- [✅] SKILL.md에 반영된 Vite 8 대응 주의사항을 verification.md에 동기화 (2026-08-12 완료 — 섹션 4-4 클레임 판정표 #7 추가, content test 2/2 PASS)
- [ ] 실제 프로젝트(lf-ui) 적용 후 빌드 결과물 확인 → APPROVED 전환 (차단 요인 아님, 선택 보강: 빌드 설정 카테고리 정책상 실사용 후 전환)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성, lf-ui 프로젝트 분석 기반, WebSearch 6개 클레임 교차 검증 (전항목 VERIFIED) | 메인 대화 |
| 2026-04-24 | v1 | 2단계 실사용 테스트 수행 (Q1 scoped 패키지 manualChunks 분류 / Q2 loadEnv 미사용 undefined 원인 / Q3 closeBundle vs writeBundle 선택) → 3/3 PASS, PENDING_TEST 유지 (빌드 설정 실사용 필수 카테고리) | skill-tester |
| 2026-08-12 | v1 | SKILL.md에 이미 반영된 Vite 8 대응 주의사항(rollupOptions→rolldownOptions, manualChunks 객체 형식 미지원)을 verification.md에 동기화 — 클레임 판정표 #7 추가, content test 2/2 PASS. PENDING_TEST 유지 | 메인 대화 |
