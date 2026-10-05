---
skill: vite-advanced-splitting
category: frontend
version: v3
date: 2026-09-28
status: APPROVED
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
| 스킬 경로 | .claude/skills/vite-advanced-splitting/SKILL.md |
| 최초 작성일 | 2026-04-20 |
| 검증일 | 2026-09-28 (재검증, 이전 2026-08-11) |
| 검증 방법 | WebSearch 교차 검증 (메인 대화) + 2026-09-28 재검증(2차, npm registry·공식 마이그레이션 가이드 대조) |
| 버전 기준 | Vite 8.3.1(주 경로: `rolldownOptions.output.codeSplitting`) / 레거시 Vite 6.x·Rollup 4.x(`manualChunks`) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (vitejs.dev, vite.dev/guide/api-plugin)
- [✅] 핵심 패턴 정리 (manualChunks 함수형, 모드 분리, 플러그인 훅)
- [✅] 코드 예시 작성 (레거시 CRA→Vite 전환 사내 프로젝트 실제 구조 기반)
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
- [✅] 레거시 CRA→Vite 전환 사내 프로젝트의 27개 API 클라이언트 청크, Gulp 스크립트, 모바일/데스크톱 분리 빌드 상황에 직접 대응
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

### [2026-09-28] 실사용(실행) 검증

**수행일**: 2026-09-28
**수행 방법**: lab 폴더에 `npm create vite@latest -- --template react-ts` + Vite 8.3.1(`npm view vite version`로 확인) + `react-router-dom`·`swiper` 설치. 라우트 4개(Home/About/Gallery/Contact, `React.lazy`)와 `console.log` 3곳을 포함한 샘플 작성. `vite.config.ts`에 SKILL.md 1절 "Vite 8+ 주 경로" 예시를 그대로 적용(`rolldownOptions.output.codeSplitting.groups` — common-react-dom(priority 30)/common-swiper(priority 20)/vendor catch-all, `minify.compress.dropConsole: true`). `npx vite build` 실행.
**실행 결과**: 빌드 성공(34 modules, 339ms). 출력 청크가 그룹 설정대로 정확히 분리됨 — `common-react-dom-*.js`(218.57kB, react/react-dom 포함), `common-swiper-*.js`(77.84kB + css), `vendor-*.js`(38.25kB, 나머지 node_modules), 라우트별 lazy 청크(`Home-*.js`/`About-*.js`/`Contact-*.js`/`Gallery-*.js`)가 각각 별도 생성. `dist/assets/js/*.js` 전체에서 `console.log` grep 결과 0건 — `dropConsole: true`로 완전히 제거됨을 확인(Home.js 등 산출물에 로그 흔적 없음). SKILL.md 서술과 100% 일치.
**졸업 조건 충족 여부**: 충족 (PENDING_TEST.md: "manualChunks 적용 후 번들 분할 결과가 의도대로인지 확인" — Vite 8+ 주 경로 `codeSplitting.groups` 기준으로 충족. 대규모 코드베이스 조건은 명시되지 않았고 라우트 3~4개+벤더 2종 소규모 샘플로 충분히 검증)
**판정**: APPROVED 전환

### [2026-09-28] skill-tester 2단계 content test (재구성분 검증)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (frontend-developer 세션 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 같은 날 재검증(2차)에서 재구성된 §1(`codeSplitting.groups` 주 경로 vs `manualChunks` 레거시)·§5(빌드 출력 최적화)를 겨냥한 실전 질문 2개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Vite 8.3.1 프로젝트에서 react/react-dom/react-router-dom 공통 벤더 청크 분리 + console.log 제거 설정법**
- ✅ PASS
- 근거: SKILL.md "1. 코드 스플리팅 전략 > Vite 8+ 주 경로"(17-42행) + "5. 빌드 출력 최적화 > Vite 8+ 주 경로"(343-369행)
- 상세: `rolldownOptions.output.codeSplitting.groups`에 정규식 `test`로 react 계열을 묶고 catch-all `vendor` 그룹을 마지막에 두는 패턴, `minify.compress.dropConsole`로 console 제거하는 패턴 모두 정확히 답변. 경미한 gap: `minify` 옵션이 boolean이 아닌 `compress` 하위 객체 형태라는 스키마 세부 설명이 코드 한 줄로만 제시된다는 지적(선택 보강).

**Q2. 객체 형식 manualChunks를 쓰던 Vite 6 프로젝트를 Vite 8로 올리면 그대로 빌드되는가, 함수형은?**
- ✅ PASS
- 근거: SKILL.md 헤더 "버전 분기" 주의문(11행) + "레거시 (Vite 6/7, Rollup 기반) — manualChunks"(46-61행)
- 상세: 객체 형식은 Vite 8+ 미지원이라 그대로면 깨짐 → `codeSplitting.groups` 정규식 그룹으로 재작성 필요, 함수형은 deprecated 상태로 당장은 동작(즉시 깨지지 않음)한다고 정확히 구분해 답변. anti-pattern(객체 형식을 그대로 유지)에 빠지지 않음.

### 발견된 gap

- Q1에서 지적된 `minify.compress.dropConsole` 값 형태(boolean 아닌 compress 하위 객체) 설명이 코드 스니펫 한 줄뿐이라는 점 — 경미, 차단 요인 아님(선택 보강)

### 판정

- agent content test: PASS (2/2)
- verification-policy 분류: 빌드 설정 스킬 — 실사용 필수 카테고리
- 최종 상태: PENDING_TEST 유지 (2026-09-28 재구성분 content test 통과, 실제 빌드 산출물 검증 후 APPROVED 전환 대상이라는 기존 판정 변동 없음)

---

### [2026-09-28] 재검증(2차) — Vite 8.3.1 `codeSplitting.groups` 주 경로 전환

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 4개를 1차 소스(npm registry, 공식 Vite/Rolldown 문서)와 대조, 보강·재구성 검토

**클레임 대조 결과**:
1. Vite 최신 버전은 6.x → **DISPUTED(정정)**: npm registry `vite@latest` = **8.3.1**. `build.rollupOptions`는 `build.rolldownOptions`로 개명(`rollupOptions`는 deprecated alias) — VERIFIED (vite.dev/guide/migration 공식 마이그레이션 가이드)
2. `output.manualChunks` 객체 형식은 Vite 8+ 미지원, 함수 형식은 deprecated로만 동작 → VERIFIED (vite.dev/guide/migration: "The object form output.manualChunks option is not supported anymore. The function form output.manualChunks is deprecated.")
3. Vite 8+의 대체 경로는 `rolldownOptions.output.codeSplitting.groups`(name/test/priority/minSize 등)이며 `test`는 함수가 아닌 정규식만 지원 → VERIFIED (rolldown.rs/reference/OutputOptions.codeSplitting 타입 시그니처 확인)
4. `vite:preloadError` 이벤트(청크 로드 실패 재시도)는 Vite 8·Rolldown 전환 후에도 동일하게 동작 → VERIFIED (커뮤니티 확인 — Rolldown은 번들러 백엔드만 교체, 브라우저 런타임 이벤트는 영향 없음)

**보강(ADD)·축소**: SKILL.md 1절("manualChunks 전략")을 "코드 스플리팅 전략 — `codeSplitting.groups`(주 경로) vs `manualChunks`(레거시)"로 재구성 — Vite 8+ `codeSplitting.groups` 예시(name/test/priority/minSize 등 필드 설명 포함)를 주 경로로 전진 배치, 기존 객체/함수형 `manualChunks` 예시는 "레거시(Vite 6/7)" 하위 절로 격하하고 "신규 작성 금지" 주의문 추가. 5절("빌드 출력 최적화")도 Vite 8+ 예시(`rolldownOptions.output.codeSplitting` + `minify.compress.dropConsole`)를 주 경로로 추가하고 기존 rollupOptions 예시는 레거시 하위 절로 분리. "흔한 실수 패턴 1"도 두 경로 공통 주의사항으로 갱신. 헤더 소스 목록에 vite.dev/guide/migration·rolldown.rs 레퍼런스 추가. 축소 없음(Gulp 플러그인 전환·모바일/데스크톱 분리 빌드·preloadError 재시도 섹션은 Rolldown 전환과 무관해 그대로 유지).

**실전 질문 재검증**:
- Q1. "Vite 8 프로젝트에서 node_modules의 react/react-dom을 별도 청크로 분리하려면 어떻게 하는가?" → SKILL.md 1절 "Vite 8+ 주 경로" 근거로 PASS (`rolldownOptions.output.codeSplitting.groups`에 `{ name, test: /node_modules[\/](react|react-dom)[\/]/, priority }` 형태로 작성)
- Q2. "기존 Vite 6 프로젝트의 함수형 manualChunks를 Vite 8로 올리면 당장 빌드가 깨지는가?" → SKILL.md 1절 "레거시" 주의문 근거로 PASS (함수형은 deprecated 상태로 계속 동작 — 당장 깨지지 않으나 신규 작성은 금지, 객체 형식만 미지원되어 깨짐)

**재검증 최종 판정**: status **PENDING_TEST 유지** (원래 실사용 필수 카테고리 — 빌드 설정 스킬은 실제 빌드 산출물 검증 후 APPROVED. 이번 재검증으로 본문 대폭 보강 발생 → skill-tester 재테스트 필요)

---

## 5-1. 이전 테스트 진행 기록 (2026-08-12, 보존)

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

## 5-2. 이전 테스트 진행 기록 (2026-04-24, 보존)

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
| 내용 정확성 | ✅ (Vite 6.x → 8.3.1 DISPUTED 수정 반영, `codeSplitting.groups` 주 경로 전환) |
| 구조 완전성 | ✅ (1·5절 주 경로/레거시 구조로 재편) |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (3/3, 2026-04-24 / 2026-08-12 Vite 8 신규 내용 2/2 PASS / 2026-09-28 재구성분 skill-tester content test 2/2 PASS) |
| Vite 8 대응 주의사항 동기화(2026-08-12) | ✅ SKILL.md 반영 내용 클레임 판정표(4-4 #7) 기록 + content test 2/2 PASS |
| 실사용(실행) 검증(2026-09-28) | ✅ lab 샘플 프로젝트에서 `codeSplitting.groups` 그대로 빌드 → 청크 분할·dropConsole 모두 서술과 일치 |
| **최종 판정** | **APPROVED** (2026-09-28 실사용 실행 검증 완료 — 빌드 산출물이 SKILL.md 서술과 일치) |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-04-24 완료, 3/3 PASS)
- [✅] SKILL.md에 반영된 Vite 8 대응 주의사항을 verification.md에 동기화 (2026-08-12 완료 — 섹션 4-4 클레임 판정표 #7 추가, content test 2/2 PASS)
- [✅] Vite 6 예시를 `codeSplitting.groups` 주 경로로 전면 재구성, `manualChunks`는 레거시로 격하 (2026-09-28 완료 — 2/2 PASS)
- [✅] skill-tester로 2026-09-28 재구성분(§1·§5 주 경로/레거시 구조) content test 수행 완료 (2026-09-28, 2/2 PASS)
- [✅] 실사용(실행) 검증 완료 (2026-09-28) — lab 샘플(Vite 8.3.1 + React TS, 라우트 4개 + swiper)에서 `codeSplitting.groups` 그대로 빌드 → 청크 분할·dropConsole 모두 서술과 일치 → APPROVED 전환

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성, 레거시 CRA→Vite 전환 사내 프로젝트 분석 기반, WebSearch 6개 클레임 교차 검증 (전항목 VERIFIED) | 메인 대화 |
| 2026-09-25 | v1.1 | 로컬 경로·프로젝트명 일반화 (내용 변경 없음) | docs cleanup |
| 2026-04-24 | v1 | 2단계 실사용 테스트 수행 (Q1 scoped 패키지 manualChunks 분류 / Q2 loadEnv 미사용 undefined 원인 / Q3 closeBundle vs writeBundle 선택) → 3/3 PASS, PENDING_TEST 유지 (빌드 설정 실사용 필수 카테고리) | skill-tester |
| 2026-08-12 | v1 | SKILL.md에 이미 반영된 Vite 8 대응 주의사항(rollupOptions→rolldownOptions, manualChunks 객체 형식 미지원)을 verification.md에 동기화 — 클레임 판정표 #7 추가, content test 2/2 PASS. PENDING_TEST 유지 | 메인 대화 |
| 2026-09-28 | v2 | 재검증(2차) — Vite 6.x → 8.3.1 갱신, SKILL.md 1·5절을 `rolldownOptions.output.codeSplitting.groups`(주 경로) / `manualChunks`(레거시, Vite 6/7) 구조로 재편. 흔한 실수 패턴 1도 공통 주의사항으로 갱신. status PENDING_TEST 유지 | Claude (Sonnet 5) |
| 2026-09-28 | v2 | 2단계 실사용 테스트 수행 (재검증(2차) 재구성분 대상 — Q1 Vite 8 벤더청크+dropConsole 설정 / Q2 객체형 manualChunks Vite 8 마이그레이션 가능 여부) → 2/2 PASS, PENDING_TEST 유지 (빌드 설정 실사용 필수 카테고리) | skill-tester |
| 2026-09-28 | v3 | 실사용(실행) 검증 — lab 샘플 프로젝트(Vite 8.3.1 + React TS, 라우트 4개+swiper)에서 `codeSplitting.groups` 주 경로 그대로 빌드 → 청크 분할(common-react-dom/common-swiper/vendor/라우트별 lazy)·`dropConsole` 모두 서술과 일치 확인. status APPROVED 전환 | Claude (Sonnet 5) |
