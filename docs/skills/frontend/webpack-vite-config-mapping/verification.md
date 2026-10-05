---
skill: webpack-vite-config-mapping
category: frontend
version: v3
date: 2026-09-28
status: APPROVED
---

# webpack-vite-config-mapping 스킬 검증 문서

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
| 스킬 이름 | webpack-vite-config-mapping |
| 스킬 경로 | .claude/skills/webpack-vite-config-mapping/SKILL.md |
| 최초 작성일 | 2026-04-20 |
| 검증일 | 2026-09-28 (재검증, 이전 2026-08-11) |
| 검증 방법 | WebSearch 교차 검증 (메인 대화) + 2026-09-28 재검증(2차, npm registry·공식 마이그레이션 가이드 대조) |
| 버전 기준 | Vite 8.3.1(주 경로: `codeSplitting.groups`) / 레거시 Vite 6.x·Rollup 4.x(`manualChunks`) / @craco/craco 7.x |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (vitejs.dev, craco.js.org)
- [✅] 레거시 CRA→Vite 전환 사내 프로젝트 craco.config.js 실제 분석 기반 작성
- [✅] 핵심 매핑 패턴 정리 (cacheGroups → manualChunks, babel → esbuild, plugins)
- [✅] 코드 예시 작성 (Before craco / After Vite 비교)
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
| Vite 공식 빌드 옵션 | https://vitejs.dev/config/build-options | ⭐⭐⭐ High | - | manualChunks, rollupOptions 레퍼런스 |
| Vite 공식 플러그인 API | https://vitejs.dev/guide/api-plugin | ⭐⭐⭐ High | - | 플러그인 훅 레퍼런스 |
| Craco 공식 문서 | https://craco.js.org/docs/configuration/webpack/ | ⭐⭐⭐ High | - | webpack.configure API |
| Vite GitHub Discussion | https://github.com/vitejs/vite/discussions/17730 | ⭐⭐ Medium | - | manualChunks 고급 패턴 |
| marabesi.com craco→vite | https://marabesi.com/2026/02/23/migrating-from-craco-to-vite.html | ⭐⭐ Medium | 2026-02 | 실제 craco→vite 사례 |
| vite:preloadError GitHub | https://github.com/vitejs/vite/issues/14044 | ⭐⭐⭐ High | - | retry chunk 공식 이슈 |

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
- [✅] 7개 매핑 섹션 포함 (cacheGroups, babel, plugins, topLevelAwait, devServer, define, alias)
- [✅] Before/After 비교 코드 포함
- [✅] 흔한 실수 패턴 포함 (3가지)

### 4-3. 실용성
- [✅] 레거시 CRA→Vite 전환 사내 프로젝트 실제 craco.config.js 분석 기반으로 작성
- [✅] 27개 API 클라이언트 청크 패턴을 manualChunks 함수형으로 재현
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. WebSearch 교차 검증 결과

| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | Webpack `cacheGroups`는 Vite `rollupOptions.output.manualChunks`로 대체 | VERIFIED | vitejs.dev 빌드 옵션 + 다수 마이그레이션 가이드 확인 |
| 2 | Vite에서 `topLevelAwait`는 별도 설정 없이 기본 지원 (ESM 기반) | VERIFIED | Vite 공식 문서 ESM 기반 아키텍처 확인 |
| 3 | `babel-plugin-transform-remove-console`은 Vite esbuild `drop: ['console']` 또는 `pure` 옵션으로 대체 | VERIFIED | Vite esbuild 옵션 문서 + 마이그레이션 가이드 확인 |
| 4 | Vite에서 청크 로드 실패는 `vite:preloadError` 이벤트로 처리 (webpack-retry-chunk-load-plugin 대체) | VERIFIED | vitejs.dev/guide/troubleshooting + GitHub issue #14044 확인 |
| 5 | `vite-tsconfig-paths` 플러그인으로 tsconfig `baseUrl: "src"` 절대경로 자동 해석 | VERIFIED | vite.dev 공식 가이드 + vite-tsconfig-paths npm 확인 |
| 6 | Craco는 2025년 10월 공식 maintenance-only 전환, 신규 기능 업데이트 없음 | VERIFIED | craco GitHub + 마이그레이션 가이드 다수 확인 |

| 7 | Vite 8부터 Rolldown이 기본 번들러로 전환되며 `build.rollupOptions`는 `build.rolldownOptions`로 개명(`rollupOptions`는 deprecated alias로 하위호환 유지). `output.manualChunks` 객체 형식은 Vite 8+에서 미지원(함수 형식은 deprecated로 계속 동작). esbuild `drop` 옵션은 Rolldown 전환 후 `build.rolldownOptions.output.minify.compress.drop*`로 위치 이동 | VERIFIED (SKILL.md 인용 출처 기준) | SKILL.md 자체 인용 출처 https://vite.dev/guide/migration 기준으로 2026-08-11 SKILL.md에 반영됨. 이번 동기화 세션에서 별도 WebSearch 재검증은 미수행 — SKILL.md 인용 출처 대조 + 내용 일관성만 확인 |

### 4-5. DISPUTED 항목 처리

- 없음 (전 클레임 VERIFIED, 7번 항목은 SKILL.md 인용 출처 기준)

### 4-6. 에이전트 활용 테스트

- [✅] skill-tester 수행 (2026-04-24): 3개 실전 질문, 3/3 PASS
- [✅] 메인 대화 직접 수행 (2026-08-12): Vite 8 대응 신규 내용 2개 질문, 2/2 PASS (섹션 5 참조)

---

## 5. 테스트 진행 기록

### [2026-09-28] 실사용(실행) 검증

**수행일**: 2026-09-28
**수행 방법**: lab 폴더에 `npm create vite@latest -- --template react-ts` + Vite 8.3.1 확인 + `react-hook-form`·`swiper`·`@sentry/react` 설치, `vite-tsconfig-paths` 설치. craco.config.js "Before" 샘플(cacheGroups 3그룹 + babel console 제거 + devServer.port/proxy + DefinePlugin)을 문서화하고, SKILL.md 매핑표(1·2·5·6·7절) 그대로 옮긴 `vite.config.ts` 작성(`codeSplitting.groups`, `minify.compress.dropConsole`, `server.port/proxy`, `define`, tsconfig `baseUrl:"src"` alias). `tsconfig.app.json`에 `baseUrl: "src"` 추가, `src/components/Widget.tsx`에서 `import { Widget } from 'components/Widget'` 절대경로 import + console.log 2곳 + `__BUILD_TIME__`/`import.meta.env.VITE_API_BASE` 참조 + SVG import + top-level await 모듈까지 포함해 `npx vite build --mode production` 실행. 추가로 `npx vite`(dev 서버)를 4초간 기동해 `server.port`(3000)·`server.proxy` 설정이 에러 없이 로드되는지 확인.
**실행 결과**: 빌드 성공(302~303 modules). 1절 cacheGroups→`codeSplitting.groups` 매핑대로 `common-react`(react-hook-form)·`common-swiper`(swiper)·`vendors-sentry`(@sentry/react) 청크가 정확히 분리됨. 2절 `dropConsole: true`로 `console.log` 2곳 완전 제거 확인(grep 0건). 5절 `server.port: 3000`으로 dev 서버 기동(HTTP 200), `server.proxy` 설정도 에러 없이 로드. 6절 `define.__BUILD_TIME__`이 실제 타임스탬프 문자열로 치환됨(빌드 산출물에서 `T00:34:14` 형태 확인). 7절 `baseUrl:"src"` alias import(`components/Widget`)가 `vite-tsconfig-paths` 플러그인으로 정상 해석되어 빌드 성공 — 단, 빌드 로그에 "Vite now supports tsconfig paths resolution natively via the resolve.tsconfigPaths option"라는 안내 메시지 확인 → WebSearch로 공식 https://vite.dev/blog/announcing-vite8 대조해 Vite 8.0에 네이티브 `resolve.tsconfigPaths` 옵션이 신설됐음을 확인, 플러그인 제거 후 `resolve.tsconfigPaths: true`만으로도 동일하게 빌드 성공 재확인. 4절 topLevelAwait는 별도 설정 없이 정상 동작(빌드 산출물에 top-level await 결과값 확인). SVG import는 SKILL.md 범위 밖(craco 매핑표에 없음)이지만 Vite 기본 동작으로 base64 data URI 인라인 확인(경고나 실패 없음).
**서술과 불일치 발견 및 정정**: 7절이 `vite-tsconfig-paths` 플러그인만 안내하고 있었으나 Vite 8.0+에는 네이티브 `resolve.tsconfigPaths` 옵션이 있어 플러그인이 더 이상 필요 없음(플러그인 자체는 여전히 동작하므로 "틀린" 서술은 아니고 "최신 권장 경로 누락"). SKILL.md 7절에 "Vite 8+ 주 경로"(네이티브 옵션)를 추가하고 기존 플러그인 안내는 "레거시(Vite 6/7)"로 재분류 + 주의문 추가(Edit 완료, 근거: WebSearch로 vite.dev 공식 블로그 대조 + lab 실행으로 두 방식 모두 빌드 성공 재확인).
**졸업 조건 충족 여부**: 충족 (PENDING_TEST.md: "위 전환 중 설정 매핑표대로 옮겨 빌드 성공 확인" — 매핑표 1·2·4·5·6·7절 전 항목을 craco 샘플 → Vite 설정으로 옮겨 빌드/dev 서버 기동 성공)
**판정**: APPROVED 전환 (SKILL.md 7절 최소 정정 포함)

### [2026-09-28] skill-tester 2단계 content test (재구성분 검증 — 참조 링크 유효성 포함)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (frontend-developer 세션 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 같은 날 재검증(2차)에서 재구성된 §1·§2(주 경로/레거시 구조)와 §3(중복 제거 후 참조 링크화)를 겨냥한 실전 질문 2개 답변, 근거 섹션 및 anti-pattern 회피 확인. Q2는 축소(중복 제거)로 참조 링크만 남은 항목이 실제로 답을 낼 수 있는지 검증하기 위해 에이전트에게 참조 파일(`vite-advanced-splitting/SKILL.md`)까지 따라가도록 지시.

### 실제 수행 테스트

**Q1. craco cacheGroups(react 공통 청크) + babel-plugin-transform-remove-console(exclude: ['error'])를 Vite 8로 마이그레이션**
- ✅ PASS
- 근거: SKILL.md "1. cacheGroups → codeSplitting.groups(Vite 8+ 주 경로)"(66-90행) + "2. Babel 플러그인 → Vite 대응 > Vite 8+ 주 경로"(136-155행)
- 상세: `rolldownOptions.output.codeSplitting.groups`와 `minify.compress.dropConsole` 조합으로 정확히 답변. `console.error`도 함께 제거되며, `console.error`만 예외 처리하는 Oxc 세부 옵션은 SKILL.md 155행이 스스로 "미검증"으로 정직하게 표시하고 있음을 에이전트가 그대로 인용 — DISPUTED 아님, 의도된 정직한 미검증 표기.

**Q2. webpack-retry-chunk-load-plugin 대체 — 청크 로드 실패 재시도 전체 코드 (축소·참조 링크 검증)**
- ✅ PASS
- 근거: SKILL.md 3절 "청크 로드 실패 재시도"(196-199행)의 참조 안내 → `vite-advanced-splitting/SKILL.md` 4절(289-337행)로 실제 이동해 전체 코드 확인
- 상세: 주 파일 자체에는 코드가 없다는 것은 **의도된 축소(중복 제거) 설계**이며, 에이전트가 참조 링크를 실제로 따라가 두 가지 완전한 패턴(플러그인 인라인 주입 / 앱 코드 직접 처리)을 모두 찾아냄 → "참조 링크를 따라가면 답이 나오는지" 검증 통과. 남은 본문(대응표 190행)과 참조처 내용 사이 모순 없음.

### 발견된 gap

- Q1: Oxc `compress`의 `console.error` 예외 유지 옵션 존재 여부 — SKILL.md 자체가 이미 "미검증"으로 표기해 정직성 문제는 없음(선택 보강)
- Q2: `retryChunkPlugin`을 `vite.config.ts`의 `plugins` 배열에 등록하는 최종 조합 예시가 참조처에도 명시적으로 붙어있지 않아 유추가 필요 — 경미(선택 보강)

### 판정

- agent content test: PASS (2/2) — Q2는 축소 후 참조 링크 유효성까지 확인
- verification-policy 분류: 빌드 설정 스킬 — 실사용 필수 카테고리
- 최종 상태: PENDING_TEST 유지 (2026-09-28 재구성분 content test 통과, 중복 제거가 답변 가능성을 해치지 않음을 확인, 실제 빌드 산출물 검증 후 APPROVED 전환 대상이라는 기존 판정 변동 없음)

---

### [2026-09-28] 재검증(2차) — Vite 8.3.1 주 경로 재정리 + 중복 제거

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 3개를 1차 소스(npm registry, 공식 Vite/Rolldown 문서)와 대조, 보강·중복 정리 검토

**클레임 대조 결과**:
1. Vite 최신 버전은 6.x → **DISPUTED(정정)**: npm registry `vite@latest` = **8.3.1**. `rollupOptions`→`rolldownOptions` 개명, `manualChunks` 객체 형식 미지원 — VERIFIED (vite.dev/guide/migration, `vite-advanced-splitting` 재검증과 동일 소스로 교차 확인)
2. console 제거 위치가 Vite 8+에서 `build.rolldownOptions.output.minify.compress.drop*`로 이동 → **VERIFIED(구체화)**: 정확한 필드명은 `compress.dropConsole`(vite.dev/guide/migration + 커뮤니티 확인 "terser drop_console → oxc compress.dropConsole"). 기존 SKILL.md의 `drop*` 와일드카드 표기를 `dropConsole`로 구체화
3. `webpack-retry-chunk-load-plugin` → `vite:preloadError` 대응이 `vite-advanced-splitting` 스킬 4절과 내용 중복 → 레포 규칙(창작 워크플로우 아님, 중복 정리 지시) 확인 후 이 스킬에서는 참조 링크로 대체하는 것이 타당 — 실사용 판단(VERIFIED 대상 아님, 편집 판단)

**보강(ADD)·축소**: 1절("cacheGroups → manualChunks")을 "cacheGroups → codeSplitting.groups(Vite 8+ 주 경로) / manualChunks(레거시)"로 재구성 — `codeSplitting.groups` 매핑 예시를 주 경로로 추가, 기존 객체형 `manualChunks` 매핑은 레거시로 유지. 2절 console 제거를 Vite 8+ `compress.dropConsole` 주 경로 + 레거시 esbuild/terser로 재구성. **축소(중복 제거)**: 3절 "청크 로드 실패 재시도" 전체 코드와 1절의 "함수형 manualChunks(패키지 자동 분할)" 전체 코드를 제거하고 `vite-advanced-splitting` 스킬로 참조 링크만 남김(두 스킬 모두 같은 작업자 담당이라 일관 적용). 흔한 실수 패턴 1·2도 주 경로/레거시 구분에 맞게 갱신.

**실전 질문 재검증**:
- Q1. "craco cacheGroups를 Vite 8 프로젝트로 옮기려면 어떤 옵션을 써야 하는가?" → SKILL.md 1절 "Vite 8+ 주 경로" 근거로 PASS (`rolldownOptions.output.codeSplitting.groups`, `test` 정규식은 cacheGroups와 거의 동일하게 이식 가능하다는 점까지 정확히 답변)
- Q2. "console.log를 프로덕션 빌드에서 제거하려면 Vite 8에서 어디에 설정하는가?" → SKILL.md 2절 "Vite 8+ 주 경로" 근거로 PASS (`build.rolldownOptions.output.minify.compress.dropConsole`, `console.error`도 함께 제거된다는 주의사항까지 정확히 답변)

**재검증 최종 판정**: status **PENDING_TEST 유지** (원래 실사용 필수 카테고리 — 실제 빌드 산출물 검증 후 APPROVED. 이번 재검증으로 본문 재구성·중복 제거 발생 → skill-tester 재테스트 필요)

---

## 5-1. 이전 테스트 진행 기록 (2026-08-12, 보존)

**수행일**: 2026-08-12
**수행자**: 메인 대화 직접 수행 (skill-tester 서브에이전트 미호출 — SKILL.md에 이미 반영된 Vite 8 대응 주의사항 동기화 목적의 단발 점검)
**수행 방법**: SKILL.md에 2026-08-11 추가된 "Vite 8+" 주의사항(rollupOptions→rolldownOptions 개명, manualChunks 객체 형식 미지원, esbuild drop 위치 이동)이 verification.md에 미기록 상태였던 것을 확인 → 신규 내용 기반 실전 질문 2개를 직접 답변·근거 대조

### 신규 반영 내용 content test (2026-08-12)

**Q1. Vite 8 환경에서 craco cacheGroups를 매핑한 manualChunks 객체 형식을 그대로 쓰면 어떤 문제가 생기고 어떻게 고쳐야 하나?**
- PASS
- 근거: SKILL.md 최상단 "주의 (Vite 8+):" 블록 + "1. cacheGroups → manualChunks" 섹션 내 "주의 (Vite 8+):" 문구
- 상세: 객체 형식 `manualChunks`는 Vite 8+에서 미지원 → 함수형 `manualChunks(id)` 패턴으로 전환 필요. `rollupOptions`는 deprecated alias로 당장 깨지지 않으나 `rolldownOptions`로의 이전이 공식 권장 방향임을 SKILL.md가 명시.

**Q2. babel-plugin-transform-remove-console 대체용 esbuild drop 옵션이 Vite 8+ Rolldown 전환 후에도 같은 위치(`build.esbuildOptions.drop`)에 있는가?**
- PASS
- 근거: SKILL.md "2. Babel 플러그인 → Vite 대응" 섹션의 "주의 (Vite 8+):" 문구
- 상세: 아니다 — Rolldown 전환 후에는 `build.rolldownOptions.output.minify.compress.drop*`로 위치가 이동한다고 SKILL.md가 명시적으로 경고. 기존 `esbuildOptions.drop`은 Vite 6/7 기준이라는 버전 스코프도 명확.

### 발견된 gap

- 없음 (2/2 PASS, SKILL.md의 Vite 8 대응 주의사항이 자기 완결적으로 근거 제공)

### 판정 (2026-08-12)

- agent content test (신규 내용): PASS (2/2, 메인 대화 직접 수행)
- verification-policy 분류: 빌드 설정 스킬 — 실사용 필수 카테고리 (변동 없음)
- 최종 상태: PENDING_TEST 유지 (Vite 8 대응 내용 동기화 완료, 실제 프로젝트 빌드 검증 후 APPROVED 전환 대상이라는 기존 판정 변동 없음)

---

## 5-2. 이전 테스트 진행 기록 (2026-04-24, 보존)

**수행일**: 2026-04-24
**수행자**: skill-tester → general-purpose (frontend-developer 에이전트 세션 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. craco cacheGroups → Vite manualChunks 변환 (객체형 + 함수형)**
- PASS
- 근거: SKILL.md "1. cacheGroups → manualChunks" 섹션 (L29-L123)
- 상세: 객체 형식(L75-L81)과 함수형(L95-L120) 두 패턴 모두 제시. anti-pattern인 `webpackConfig.optimization.splitChunks` 직접 사용은 "흔한 실수 패턴 2번"(L339-L343)에서 명시적으로 경고. `manualChunks` 객체 형식에 존재하지 않는 패키지명을 넣으면 빌드 에러 주의도 L123에 포함.

**Q2. babel-plugin-transform-remove-console → esbuild 대체, console.error 유지 조건**
- PASS
- 근거: SKILL.md "2. Babel 플러그인 → Vite 대응" 섹션 (L127-L164)
- 상세: `esbuildOptions.drop: ['console']`이 기본 대체 경로이나 `console.error`도 제거된다는 함정을 L163 "주의:" 블록에 명확히 경고. 특정 메서드만 유지하려면 `pure: ['console.log', 'console.warn', 'console.debug']` 옵션을 사용하라는 안내(L150)가 있어 질문 조건에 충분히 답변 가능.

**Q3. webpack-retry-chunk-load-plugin → vite:preloadError 이벤트 처리**
- PASS
- 근거: SKILL.md "3. Webpack 플러그인 → Vite 대응표" 및 "청크 로드 실패 재시도" 섹션 (L167-L207)
- 상세: 대응표(L170)에서 `webpack-retry-chunk-load-plugin` → `vite:preloadError` 이벤트 리스너로 명시. `retryChunkPlugin()` 커스텀 인라인 플러그인 전체 코드와 `transformIndexHtml` 훅 패턴(L181-L207) 완비. npm 패키지 추가 없이 처리 가능함을 명확히 함.

### 발견된 gap

- 없음 (3/3 PASS, SKILL.md에 충분한 근거 존재)

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 빌드 설정 스킬 (출력 결과물 검증 필요) — 실사용 필수 카테고리
- 최종 상태: PENDING_TEST 유지 (실제 프로젝트 빌드 결과 검증 후 APPROVED 전환)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (Vite 6.x → 8.3.1 DISPUTED 수정 반영, `dropConsole` 필드명 구체화) |
| 구조 완전성 | ✅ (1·2절 주 경로/레거시 재편, 중복 코드 제거·참조 링크화) |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 수행 완료 (2026-04-24, 3/3 PASS / 2026-08-12 Vite 8 신규 내용 2/2 PASS / 2026-09-28 재구성분 skill-tester content test 2/2 PASS, 참조 링크 유효성 확인) |
| Vite 8 대응 주의사항 동기화(2026-08-12) | ✅ SKILL.md 반영 내용 클레임 판정표(4-4 #7) 기록 + content test 2/2 PASS |
| 실사용(실행) 검증(2026-09-28) | ✅ lab 샘플에서 craco→Vite 매핑표(1·2·4·5·6·7절) 그대로 적용해 빌드·dev 서버 기동 성공. 7절 SKILL.md 최소 정정(네이티브 `resolve.tsconfigPaths` 보강) |
| **최종 판정** | **APPROVED** (2026-09-28 실사용 실행 검증 완료 — 빌드 산출물이 SKILL.md 서술과 일치, 7절 보강 반영) |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 agent content test 수행하고 섹션 5·6 업데이트 (2026-04-24 완료, 3/3 PASS)
- [✅] SKILL.md에 반영된 Vite 8 대응 주의사항을 verification.md에 동기화 (2026-08-12 완료 — 섹션 4-4 클레임 판정표 #7 추가, content test 2/2 PASS)
- [✅] Vite 8.3.1 확인 후 `codeSplitting.groups` 주 경로·`dropConsole` 필드명 구체화, 3절 청크 재시도·1절 함수형 manualChunks 중복 코드를 `vite-advanced-splitting` 참조로 정리 (2026-09-28 완료 — 2/2 PASS)
- [✅] skill-tester로 2026-09-28 재구성분(§1·§2 주 경로/레거시 구조, 참조 링크) content test 수행 완료 (2026-09-28, 2/2 PASS — 참조 링크를 따라가도 실제 답이 나옴을 확인)
- [✅] 실사용(실행) 검증 완료 (2026-09-28) — lab 샘플(craco.config.js "Before" + Vite 8.3.1 "After")에서 매핑표 1·2·4·5·6·7절 전체를 실제 빌드·dev 서버 기동으로 확인 → APPROVED 전환
- [✅] 7절 SKILL.md 정정: Vite 8.0 네이티브 `resolve.tsconfigPaths` 옵션을 주 경로로 추가, 기존 `vite-tsconfig-paths` 플러그인은 레거시로 재분류 (WebSearch로 vite.dev 공식 블로그 대조 + lab 실행 재확인)
- [❌] Oxc `compress`에 `console.error`만 유지하는 세부 옵션이 있는지 확인 → 미검증. **차단 요인 아님** — 선택 보강(SKILL.md가 이미 정직하게 "미검증"으로 표기 중)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성, 레거시 CRA→Vite 전환 사내 프로젝트 craco.config.js 분석 기반, WebSearch 6개 클레임 교차 검증 (전항목 VERIFIED) | 메인 대화 |
| 2026-09-25 | v1.1 | 로컬 경로·프로젝트명 일반화 (내용 변경 없음) | docs cleanup |
| 2026-04-24 | v1 | 2단계 실사용 테스트 수행 (Q1 cacheGroups→manualChunks / Q2 babel→esbuild console 제거 / Q3 vite:preloadError 청크 재시도) → 3/3 PASS, PENDING_TEST 유지 (빌드 설정 카테고리) | skill-tester |
| 2026-08-12 | v1 | SKILL.md에 이미 반영된 Vite 8 대응 주의사항(rollupOptions→rolldownOptions, manualChunks 객체 형식 미지원, esbuild drop 위치 이동)을 verification.md에 동기화 — 클레임 판정표 #7 추가, content test 2/2 PASS. PENDING_TEST 유지 | 메인 대화 |
| 2026-09-28 | v2 | 재검증(2차) — Vite 6.x → 8.3.1 갱신, 1·2절을 `codeSplitting.groups`/`dropConsole`(주 경로) vs `manualChunks`/esbuild-terser(레거시) 구조로 재편. 1절 함수형 manualChunks·3절 청크 재시도 전체 코드를 `vite-advanced-splitting` 스킬 참조로 정리(중복 제거). status PENDING_TEST 유지 | Claude (Sonnet 5) |
| 2026-09-28 | v2 | 2단계 실사용 테스트 수행 (재검증(2차) 재구성분 대상 — Q1 cacheGroups+console 제거 Vite 8 마이그레이션 / Q2 축소된 청크 재시도 참조 링크 유효성) → 2/2 PASS, PENDING_TEST 유지 (빌드 설정 실사용 필수 카테고리) | skill-tester |
| 2026-09-28 | v3 | 실사용(실행) 검증 — lab 샘플(craco.config.js Before → Vite 8.3.1 vite.config.ts After)에서 매핑표 1·2·4·5·6·7절 전체 빌드·dev 서버 기동 성공 확인. 7절에 Vite 8.0 네이티브 `resolve.tsconfigPaths` 옵션 보강(기존 플러그인 안내는 레거시로 재분류). status APPROVED 전환 | Claude (Sonnet 5) |
