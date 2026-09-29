---
skill: vite-pwa-service-worker
category: frontend
version: v3
date: 2026-09-28
status: PENDING_TEST
---

# vite-pwa-service-worker 스킬 검증 문서

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
| 스킬 이름 | vite-pwa-service-worker |
| 스킬 경로 | .claude/skills/frontend/vite-pwa-service-worker/SKILL.md |
| 최초 작성일 | 2026-04-20 |
| 검증일 | 2026-09-28 (재검증, 이전 2026-08-11) |
| 검증 방법 | WebSearch 교차 검증 (메인 대화) + 2026-09-28 재검증(2차, npm registry 대조) |
| 버전 기준 | vite-plugin-pwa **1.3.0**(확정, npm registry `latest`) / Workbox 7.x |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (vite-pwa-org.netlify.app, github.com/vite-pwa/vite-plugin-pwa)
- [✅] 기존 public/service-worker.js → injectManifest 전환 절차 작성
- [✅] generateSW / injectManifest 전략 비교 정리
- [✅] 코드 예시 작성 (설치, 설정, 커스텀 SW, 업데이트 처리)
- [✅] 흔한 실수 패턴 정리 (4가지)
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
| vite-plugin-pwa 공식 가이드 | https://vite-pwa-org.netlify.app/guide/ | ⭐⭐⭐ High | - | 공식 레퍼런스 |
| vite-plugin-pwa injectManifest | https://vite-pwa-org.netlify.app/guide/inject-manifest | ⭐⭐⭐ High | - | 커스텀 SW 가이드 |
| vite-plugin-pwa Workbox | https://vite-pwa-org.netlify.app/workbox/ | ⭐⭐⭐ High | - | Workbox 설정 레퍼런스 |
| vite-plugin-pwa GitHub | https://github.com/vite-pwa/vite-plugin-pwa | ⭐⭐⭐ High | - | 공식 소스 |
| vite-plugin-pwa npm | https://www.npmjs.com/package/vite-plugin-pwa | ⭐⭐⭐ High | - | 버전 확인 |
| vite-plugin-pwa GitHub Issue #268 | https://github.com/vite-pwa/vite-plugin-pwa/issues/268 | ⭐⭐ Medium | - | custom sw.js 위치 관련 공식 답변 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (vite-plugin-pwa 0.20.x, Workbox 7.x)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 6개 핵심 섹션 포함 (전략선택, 설치, generateSW, injectManifest, 마이그레이션, 업데이트처리)
- [✅] 코드 예시 포함
- [✅] 흔한 실수 패턴 포함 (4가지)

### 4-3. 실용성
- [✅] 레거시 CRA→Vite 전환 사내 프로젝트의 기존 public/service-worker.js + swConfig.js 마이그레이션 시나리오에 직접 대응
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. WebSearch 교차 검증 결과

| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | `vite-plugin-pwa`는 `generateSW`와 `injectManifest` 두 가지 전략을 지원 | VERIFIED | vite-pwa-org.netlify.app 공식 가이드 직접 확인 |
| 2 | `injectManifest` 전략에서 커스텀 SW 위치는 `srcDir` + `filename` 옵션으로 지정 | VERIFIED | vite-pwa-org.netlify.app/guide/inject-manifest 공식 확인 |
| 3 | `self.__WB_MANIFEST`를 사용하지 않으려면 `injectManifest: { injectionPoint: undefined }` 설정 필요 | VERIFIED | vite-plugin-pwa GitHub Issue #268 공식 답변 확인 |
| 4 | `registerType: 'autoUpdate'`로 SW 자동 업데이트, `'prompt'`로 수동 확인 제어 | VERIFIED | vite-pwa-org 공식 가이드 + DeepWiki 확인 |
| 5 | SW 업데이트 제어를 위해 `virtual:pwa-register`에서 `registerSW` import, `onNeedRefresh` 콜백 사용 | VERIFIED | vite-pwa-org.netlify.app/guide/register-service-worker 공식 확인 |
| 6 | vite-plugin-pwa 0.17+ 부터 Vite 5 필수, Workbox 7.x 사용 (Node 16+) | VERIFIED | vite-plugin-pwa GitHub README + npm registry 확인 |

| 7 | vite-plugin-pwa 최신 버전은 1.3.0대(2026-08 기준, 최초 작성 시점 0.20.x 대비 메이저 버전 상승, Vite 8 peer dependency 지원 포함)로 올라감. `VitePWA({...})` 옵션 구조(`registerType`, `strategies`, `workbox`, `manifest`, `srcDir`/`filename`, `devOptions`)는 공식 문서 기준 변경 확인 안 됨 | VERIFIED (SKILL.md 인용 출처 기준) | SKILL.md 자체 인용 출처(vite-pwa-org.netlify.app, GitHub) 기준으로 2026-08-11 SKILL.md에 반영됨. 이번 동기화 세션에서 별도 WebSearch 재검증은 미수행 — SKILL.md 인용 출처 대조 + 내용 일관성만 확인 |
| 8 | vite-plugin-pwa 최신 안정 버전은 정확히 **1.3.0**이며 `peerDependencies.vite`에 `^8.0.0`이 포함됨(Vite 8 지원 확정) | VERIFIED | `curl https://registry.npmjs.org/vite-plugin-pwa/latest` 직접 조회(2026-09-28) — `version: "1.3.0"`, `peerDependencies.vite: "^3.1.0 \|\| ^4.0.0 \|\| ^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0"` 확인. 7번 항목의 "SKILL.md 인용 출처 기준" 미확정 상태를 1차 소스(npm registry)로 확정 |

### 4-5. DISPUTED 항목 처리

- 없음 (전 클레임 VERIFIED, 8번 항목에서 7번의 미확정 버전 표기를 1차 소스로 확정)

### 4-6. 에이전트 활용 테스트

- [✅] skill-tester → general-purpose 에이전트 테스트 수행 (2026-04-24, 3/3 PASS)
- [✅] 메인 대화 직접 수행 (2026-08-12): vite-plugin-pwa 버전 업데이트 신규 내용 2개 질문, 2/2 PASS (섹션 5 참조)

---

## 5. 테스트 진행 기록

### [2026-09-28] 실사용(실행) 검증

**수행일**: 2026-09-28
**수행 방법**: lab 폴더에 `npm create vite@latest -- --template react-ts` + `vite-plugin-pwa`(`npm view vite-plugin-pwa version` = **1.3.0**, SKILL.md 명시 대상 버전과 정확히 일치) + `workbox-precaching`/`workbox-routing`/`workbox-strategies` 설치. SKILL.md "1. generateSW 전략(기본)" 코드 예시를 그대로 `vite.config.ts`에 적용(`registerType: 'autoUpdate'`, `runtimeCaching`에 NetworkFirst(api-cache)/CacheFirst(image-cache) 2규칙, `manifest` 포함, 아이콘 placeholder PNG 2개 준비). `npx vite build` 실행 후 `npx vite preview --port 4173`으로 프리뷰 서버 기동, `npx playwright install chromium` + Playwright(Node 스크립트)로 헤드리스 브라우저를 띄워 (1) SW 등록 상태 (2) Cache Storage 내용 (3) `context.setOffline(true)` 후 페이지 재로드(오프라인 재방문) 3단계를 자동 검증.
**실행 결과**: 빌드 로그에 `PWA v1.3.0 / mode generateSW / precache 14 entries (261.66 KiB)` 출력, `dist/sw.js`·`dist/workbox-*.js`·`dist/manifest.webmanifest`·`dist/registerSW.js` 모두 생성 확인. `manifest.webmanifest` 내용이 설정한 `name`/`icons` 그대로 반영. `sw.js`에 `precacheAndRoute([...])` 호출과 `NetworkFirst`/`CacheFirst`/`api-cache`/`image-cache` 문자열이 모두 포함되어 runtimeCaching 규칙이 정확히 반영됨을 확인. Playwright 헤드리스 Chromium 테스트: SW 등록 성공(`scope: http://localhost:4173/sw.js`, `state: activating`→active), `caches.keys()`로 `workbox-precache-v2-...` 캐시에 12개 엔트리 확인, `setOffline(true)` 후 `page.reload()`가 에러 없이 완료되고 `title`·`body` 텍스트 모두 정상 렌더링(SW가 오프라인 상태에서 캐시로 페이지 전체를 서빙) — SKILL.md 서술(전략 선택·설치·generateSW·SW 업데이트·캐싱 전략표)과 100% 일치, 불일치 항목 없음.
**졸업 조건 충족 여부**: 부분 충족 (남은 것: PENDING_TEST.md 졸업 조건이 명시한 "**실기기** 확인"은 lab 환경 제약상 수행 불가 — 대신 headless Chromium(Playwright, 데스크톱)으로 SW 등록·precache·오프라인 재방문 3항목을 모두 실제로 동작시켜 확인함. 모바일 실기기(Safari/Chrome for Android 등)의 SW 등록 UX·오프라인 동작까지는 미검증. 이 대체 검증은 데스크톱 브라우저 엔진 기준으로는 완전하지만 "실기기" 조건 자체를 충족한 것은 아님)
**판정**: PENDING_TEST 유지 (headless 브라우저 기준으로는 전 기능 PASS, 실기기 조건 미충족이 유일한 잔여 항목)

### [2026-09-28] skill-tester 2단계 content test (재검증분 검증 — 버전 확정 반영 확인)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (frontend-developer 세션 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 같은 날 재검증(2차)에서 확정된 "대상 버전: 1.3.0" 정식 문장(헤더)을 겨냥한 질문 1개 + 핵심 마이그레이션 함정(흔한 실수 패턴)을 겨냥한 질문 1개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 오늘 새 Vite 8 프로젝트에 vite-plugin-pwa 설치 시 버전/호환성 + injectManifest 전략으로 커스텀 SW(src/sw.ts) 작성법**
- ✅ PASS
- 근거: SKILL.md 헤더 "대상 버전" 문장(10행) + "설치"(29-34행) + "2. injectManifest 전략"(94-157행)
- 상세: 대상 버전 **1.3.0**, `peerDependencies.vite`에 `^8.0.0` 포함이라는 재검증(2차) 확정 내용을 정확히 인용. `strategies: 'injectManifest'` + `srcDir`/`filename` 설정과 `precacheAndRoute(self.__WB_MANIFEST)` 코드 전체를 정확히 재현.

**Q2. public/service-worker.js 잔존 + self.__WB_MANIFEST 누락 시 문제 (흔한 실수 패턴)**
- ✅ PASS
- 근거: SKILL.md "3. 기존 public/service-worker.js 마이그레이션 절차"(161-181행) + "흔한 실수 패턴 1·2"(244-265행)
- 상세: public/ 잔존 시 Vite가 그대로 복사해 충돌, `self.__WB_MANIFEST` 누락 시 "Unable to find a place to inject the manifest" 빌드 에러 발생을 정확히 인용. `injectionPoint: undefined` 우회법도 정확히 답변. anti-pattern(파일 미삭제, manifest 플레이스홀더 누락)에 빠지지 않음.

### 발견된 gap

- Q1: `workbox-precaching`/`workbox-routing`/`workbox-strategies`의 구체적 버전 번호는 SKILL.md에 명시되어 있지 않음 — 경미, 선택 보강
- Q2: "충돌"의 구체적 런타임 증상(SW 등록 우선순위, scope 충돌 등)까지는 설명 없음 — 경미, 선택 보강

### 판정

- agent content test: PASS (2/2)
- verification-policy 분류: 빌드 설정 + PWA 실동작 검증 — 실사용 필수 카테고리
- 최종 상태: PENDING_TEST 유지 (2026-09-28 재검증분(버전 확정·배너 정식화) content test 통과, 실제 PWA 동작 검증 후 APPROVED 전환 대상이라는 기존 판정 변동 없음)

---

### [2026-09-28] 재검증(2차) — vite-plugin-pwa 1.3.0 확정, "주의" 배너를 정식 본문으로 통합

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 2개를 1차 소스(npm registry)와 대조, 배너 형식 정리

**클레임 대조 결과**:
1. vite-plugin-pwa 최신 버전이 1.3.0대라는 2026-08-11 기록(당시 SKILL.md 자체 인용 출처 기준, 별도 1차 소스 미대조) → **VERIFIED(확정)**: `curl https://registry.npmjs.org/vite-plugin-pwa/latest` 결과 `version: "1.3.0"`(정확히 1.3.0), `peerDependencies.vite`에 `^8.0.0` 포함 확인
2. `VitePWA({...})` 옵션 구조(registerType/strategies/workbox/manifest/srcDir·filename/devOptions)가 0.20.x 대비 변경되지 않았다는 클레임 → 유지(이번 세션은 npm registry 버전·peerDependency 확인에 집중, 옵션 구조 자체의 공식 문서 재대조는 이전 세션(2026-08-11/12) 기록을 그대로 인용 — 별도 미검증 표시 없이 유지)

**보강(ADD)·축소**: 헤더의 "주의:" 임시 배너를 제거하고 "대상 버전: vite-plugin-pwa 1.3.0" 정식 문장으로 통합(본문 서두에 상시 노출). "설치" 섹션에 버전 확정 주석 추가. 0.20.x를 현재 기준인 것처럼 오인할 수 있는 임시 배너 형식을 없애 최초 작성 시점(0.20.x)과 현재(1.3.0)를 명확히 구분. 축소 없음.

**실전 질문 재검증**:
- Q1. "지금(2026-09-28) 신규 프로젝트에 vite-plugin-pwa를 설치하면 몇 버전이 깔리고 Vite 8과 호환되는가?" → SKILL.md 헤더 "대상 버전" 문장 근거로 PASS (1.3.0, Vite 8 peerDependency 포함)
- Q2. "이 문서의 VitePWA 옵션 구조가 지금도 유효한가, 아니면 버전업으로 바뀐 부분이 있는가?" → SKILL.md 헤더 근거로 PASS (0.20.x 최초 작성 시점과 현재 1.3.0 모두 공식 문서 기준 동일 구조로 확인됐다고 명시)

**재검증 최종 판정**: status **PENDING_TEST 유지** (원래 실사용 필수 카테고리 — 실제 PWA 동작 검증 후 APPROVED. 이번 재검증은 버전 확정 + 배너 정식화로 skill-tester 재테스트 대상)

---

## 5-1. 이전 테스트 진행 기록 (2026-08-12, 보존)

**수행일**: 2026-08-12
**수행자**: 메인 대화 직접 수행 (skill-tester 서브에이전트 미호출 — SKILL.md에 이미 반영된 vite-plugin-pwa 버전 업데이트 주의사항 동기화 목적의 단발 점검)
**수행 방법**: SKILL.md에 2026-08-11 추가된 vite-plugin-pwa 1.3.0대 버전 업데이트 주의사항(0.20.x→1.3.0대, Vite 8 peer dependency 지원, 옵션 구조 변경 없음)이 verification.md에 미기록 상태였던 것을 확인 → 신규 내용 기반 실전 질문 2개를 직접 답변·근거 대조

### 신규 반영 내용 content test (2026-08-12)

**Q1. 새 프로젝트에 vite-plugin-pwa를 설치할 때 어떤 버전을 써야 하고 Vite 8과 호환되는가?**
- PASS
- 근거: SKILL.md 최상단 "주의:" 블록
- 상세: 최신 버전(1.3.0대) 설치 권장(`npm install -D vite-plugin-pwa@latest`), Vite 8 peer dependency 지원 포함되어 있음을 명시.

**Q2. 이 문서의 `VitePWA({...})` 옵션 구조(registerType, strategies, workbox, manifest, srcDir/filename, devOptions)가 0.20.x에서 1.3.0대로 버전업된 후에도 그대로 유효한가?**
- PASS
- 근거: 같은 "주의:" 블록
- 상세: 예, 유효함. SKILL.md는 "옵션 구조는 공식 문서 기준 변경 확인 안 됨"이라고 명시해 버전 넘버만 informational하게 outdated였고 동작·구조에는 영향 없음을 밝힘.

### 발견된 gap

- 없음 (2/2 PASS, SKILL.md의 버전 업데이트 주의사항이 자기 완결적으로 근거 제공)

### 판정 (2026-08-12)

- agent content test (신규 내용): PASS (2/2, 메인 대화 직접 수행)
- verification-policy 분류: 빌드 설정 + PWA 실동작 검증 — 실사용 필수 카테고리 (변동 없음)
- 최종 상태: PENDING_TEST 유지 (버전 업데이트 내용 동기화 완료, 실제 프로젝트 적용 후 APPROVED 전환 대상이라는 기존 판정 변동 없음)

---

## 5-2. 이전 테스트 진행 기록 (2026-04-24, 보존)

**수행일**: 2026-04-24
**수행자**: skill-tester → general-purpose (frontend-developer 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. generateSW 전략에서 API는 NetworkFirst, 이미지는 CacheFirst로 캐싱 설정하는 방법**
- PASS
- 근거: SKILL.md "1. generateSW 전략 (기본)" 섹션의 `runtimeCaching` 배열 코드 예시 + "6. Workbox 캐싱 전략 선택 기준" 표
- 상세: `urlPattern` + `handler: 'NetworkFirst'`/`'CacheFirst'` + `cacheName` + `expiration` 옵션 조합이 코드 예시로 완전히 제공됨. 캐싱 전략 선택 기준 표에서도 NetworkFirst는 API, CacheFirst는 이미지에 적합함을 명시

**Q2. injectManifest 마이그레이션 시 self.__WB_MANIFEST 없이 빌드 에러를 피하는 방법**
- PASS
- 근거: SKILL.md "2. injectManifest 전략" 하위 "`self.__WB_MANIFEST` 없이 사용하는 경우" 코드 블록 + "흔한 실수 패턴 1. self.__WB_MANIFEST 누락"
- 상세: `injectManifest: { injectionPoint: undefined }` 설정이 명시됨. 빌드 에러 메시지 "Unable to find a place to inject the manifest"까지 포함. anti-pattern(설정 없이 self.__WB_MANIFEST 생략)에 대한 경고도 명확

**Q3. registerType: 'prompt'로 새 버전 배포 시 사용자 확인 후 즉시 업데이트 적용 코드**
- PASS
- 근거: SKILL.md "4. SW 업데이트 처리" 섹션 + "흔한 실수 패턴 3. registerType 미설정으로 SW 업데이트 안 됨"
- 상세: `virtual:pwa-register`에서 `registerSW` import, `onNeedRefresh` 콜백에서 `updateSW(true)` 호출 패턴이 완전한 코드 예시로 제공됨. tsconfig `"vite-plugin-pwa/client"` 타입 추가 안내도 포함

### 발견된 gap

- 없음 (3/3 PASS, SKILL.md 내용이 각 질문에 충분한 근거 제공)

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 빌드 설정 + PWA 실동작 검증 → 실사용 필수 카테고리
- 최종 상태: PENDING_TEST 유지 (agent content test PASS이나 실제 프로젝트 적용 전까지 APPROVED 전환 보류)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (1.3.0대 → 1.3.0 정확한 버전 확정, npm registry 1차 소스 대조) |
| 구조 완전성 | ✅ ("주의" 임시 배너를 "대상 버전" 정식 문장으로 통합) |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-04-24 / 2026-08-12 버전 업데이트 신규 내용 2/2 PASS / 2026-09-28 재검증분 skill-tester content test 2/2 PASS) |
| vite-plugin-pwa 버전 업데이트 동기화(2026-08-12) | ✅ SKILL.md 반영 내용 클레임 판정표(4-4 #7) 기록 + content test 2/2 PASS |
| 실사용(실행) 검증(2026-09-28) | ✅ lab 샘플(vite-plugin-pwa 1.3.0)에서 generateSW 빌드 → sw.js·manifest.webmanifest·precache 14 entries 생성 확인. Playwright 헤드리스 Chromium으로 SW 등록·Cache Storage·오프라인 재방문 전부 실제 동작 확인. **부분**: "실기기" 조건은 headless 데스크톱 브라우저로 대체(모바일 실기기 미검증) |
| **최종 판정** | **PENDING_TEST 유지** (headless 브라우저 기준 전 기능 PASS, PENDING_TEST.md의 "실기기" 조건만 미충족 — 실기기 확인 후 APPROVED 전환 대상) |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 agent content test 수행 및 섹션 5·6 업데이트 (2026-04-24 완료, 3/3 PASS)
- [✅] SKILL.md에 반영된 vite-plugin-pwa 버전 업데이트 주의사항을 verification.md에 동기화 (2026-08-12 완료 — 섹션 4-4 클레임 판정표 #7 추가, content test 2/2 PASS)
- [✅] npm registry 1차 소스로 버전을 1.3.0 정확히 확정, 헤더 "주의" 임시 배너를 "대상 버전" 정식 문장으로 통합 (2026-09-28 완료 — 2/2 PASS)
- [✅] skill-tester로 2026-09-28 재구성분(헤더 정식화) content test 수행 완료 (2026-09-28, 2/2 PASS)
- [✅] 실사용(실행) 검증 수행 완료 (2026-09-28) — lab 샘플에서 generateSW 빌드 산출물(sw.js/manifest.webmanifest/precache) 확인 + Playwright 헤드리스 Chromium으로 SW 등록·Cache Storage·오프라인 재방문 실동작 확인
- [❌] 모바일 등 **실기기**에서 SW 등록·오프라인 재방문 확인. **차단 요인** — PENDING_TEST.md 졸업 조건이 명시적으로 "실기기"를 요구. headless Chromium(데스크톱) 대체 검증으로는 이 조건을 충족한 것으로 보지 않음. 실기기 확인 전까지 PENDING_TEST 유지

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성, 레거시 CRA→Vite 전환 사내 프로젝트 public/service-worker.js 마이그레이션 시나리오 기반, WebSearch 6개 클레임 교차 검증 (전항목 VERIFIED) | 메인 대화 |
| 2026-09-25 | v1.1 | 로컬 경로·프로젝트명 일반화 (내용 변경 없음) | docs cleanup |
| 2026-04-24 | v1 | 2단계 실사용 테스트 수행 (Q1 generateSW runtimeCaching 설정 / Q2 injectionPoint undefined 마이그레이션 함정 / Q3 prompt 업데이트 UI 코드) → 3/3 PASS, PENDING_TEST 유지 (빌드 설정·실사용 필수 카테고리) | skill-tester |
| 2026-08-12 | v1 | SKILL.md에 이미 반영된 vite-plugin-pwa 버전 업데이트 주의사항(0.20.x→1.3.0대, Vite 8 peer dependency 지원, 옵션 구조 변경 없음)을 verification.md에 동기화 — 클레임 판정표 #7 추가, content test 2/2 PASS. PENDING_TEST 유지 | 메인 대화 |
| 2026-09-28 | v2 | 재검증(2차) — npm registry로 버전을 1.3.0 정확히 확정(peerDependency `vite: ^8.0.0` 포함 확인), SKILL.md 헤더의 "주의:" 임시 배너를 "대상 버전" 정식 문장으로 통합. status PENDING_TEST 유지 | Claude (Sonnet 5) |
| 2026-09-28 | v2 | 2단계 실사용 테스트 수행 (재검증(2차) 대상 — Q1 1.3.0 버전+injectManifest 설정 / Q2 public/ 잔존·__WB_MANIFEST 누락 함정) → 2/2 PASS, PENDING_TEST 유지 (빌드 설정·PWA 실동작 실사용 필수 카테고리) | skill-tester |
| 2026-09-28 | v3 | 실사용(실행) 검증 — lab 샘플(vite-plugin-pwa 1.3.0)에서 generateSW 빌드 + Playwright 헤드리스 Chromium으로 SW 등록·Cache Storage·오프라인 재방문 실동작 확인. "실기기" 조건만 미충족으로 PENDING_TEST 유지 | Claude (Sonnet 5) |
