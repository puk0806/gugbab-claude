---
skill: webpack-vite-config-mapping
category: frontend
version: v1
date: 2026-04-20
status: PENDING_TEST
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
| 스킬 경로 | .claude/skills/frontend/webpack-vite-config-mapping/SKILL.md |
| 최초 작성일 | 2026-04-20 |
| 검증 방법 | WebSearch 교차 검증 (메인 대화) |
| 버전 기준 | Vite 6.x / Rollup 4.x / @craco/craco 7.x |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (vitejs.dev, craco.js.org)
- [✅] lf-ui 프로젝트 craco.config.js 실제 분석 기반 작성
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
- [✅] lf-ui 프로젝트 실제 craco.config.js 분석 기반으로 작성
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

### 4-5. DISPUTED 항목 처리

- 없음 (전 클레임 VERIFIED)

### 4-6. 에이전트 활용 테스트

- [✅] skill-tester 수행 (2026-04-24): 3개 실전 질문, 3/3 PASS

---

## 5. 테스트 진행 기록

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
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 수행 완료 (2026-04-24, 3/3 PASS) |
| **최종 판정** | **PENDING_TEST** (빌드 설정 카테고리 — 실 빌드 결과 검증 후 APPROVED 전환) |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 agent content test 수행하고 섹션 5·6 업데이트 (2026-04-24 완료, 3/3 PASS)
- [❌] 실제 프로젝트(lf-ui 또는 신규 Vite 프로젝트)에서 마이그레이션 적용 후 빌드 산출물 검증 → 차단 요인: APPROVED 전환 필수 조건 (빌드 설정 카테고리). 실전 도입 전까지 PENDING_TEST 유지.
- [❌] esbuild `pure` vs `drop` 옵션 동작 차이를 실제 빌드로 확인 → 선택 보강 항목 (현재 SKILL.md 주의 문구로 충분히 안내됨)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성, lf-ui craco.config.js 분석 기반, WebSearch 6개 클레임 교차 검증 (전항목 VERIFIED) | 메인 대화 |
| 2026-04-24 | v1 | 2단계 실사용 테스트 수행 (Q1 cacheGroups→manualChunks / Q2 babel→esbuild console 제거 / Q3 vite:preloadError 청크 재시도) → 3/3 PASS, PENDING_TEST 유지 (빌드 설정 카테고리) | skill-tester |
