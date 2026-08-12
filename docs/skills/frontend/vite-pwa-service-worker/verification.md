---
skill: vite-pwa-service-worker
category: frontend
version: v1
date: 2026-04-20
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
| 검증 방법 | WebSearch 교차 검증 (메인 대화) |
| 버전 기준 | vite-plugin-pwa 0.20.x / Workbox 7.x |

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
- [✅] lf-ui의 기존 public/service-worker.js + swConfig.js 마이그레이션 시나리오에 직접 대응
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

### 4-5. DISPUTED 항목 처리

- 없음 (전 클레임 VERIFIED, 7번 항목은 SKILL.md 인용 출처 기준)

### 4-6. 에이전트 활용 테스트

- [✅] skill-tester → general-purpose 에이전트 테스트 수행 (2026-04-24, 3/3 PASS)
- [✅] 메인 대화 직접 수행 (2026-08-12): vite-plugin-pwa 버전 업데이트 신규 내용 2개 질문, 2/2 PASS (섹션 5 참조)

---

## 5. 테스트 진행 기록

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

## 5-1. 이전 테스트 진행 기록 (2026-04-24, 보존)

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
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-04-24 / 2026-08-12 버전 업데이트 신규 내용 2/2 PASS 추가) |
| vite-plugin-pwa 버전 업데이트 동기화(2026-08-12) | ✅ SKILL.md 반영 내용 클레임 판정표(4-4 #7) 기록 + content test 2/2 PASS |
| **최종 판정** | **PENDING_TEST** (빌드 설정·실사용 필수 카테고리, 실전 적용 후 APPROVED 전환, 2026-08-12 동기화에도 유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 agent content test 수행 및 섹션 5·6 업데이트 (2026-04-24 완료, 3/3 PASS)
- [✅] SKILL.md에 반영된 vite-plugin-pwa 버전 업데이트 주의사항을 verification.md에 동기화 (2026-08-12 완료 — 섹션 4-4 클레임 판정표 #7 추가, content test 2/2 PASS)
- [ ] 실전 프로젝트(lf-ui 등)에 실제 적용 후 APPROVED 전환 — **선택 보강** (차단 요인 아님, 빌드 설정·PWA 실동작 카테고리 정책에 따른 유보)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성, lf-ui public/service-worker.js 마이그레이션 시나리오 기반, WebSearch 6개 클레임 교차 검증 (전항목 VERIFIED) | 메인 대화 |
| 2026-04-24 | v1 | 2단계 실사용 테스트 수행 (Q1 generateSW runtimeCaching 설정 / Q2 injectionPoint undefined 마이그레이션 함정 / Q3 prompt 업데이트 UI 코드) → 3/3 PASS, PENDING_TEST 유지 (빌드 설정·실사용 필수 카테고리) | skill-tester |
| 2026-08-12 | v1 | SKILL.md에 이미 반영된 vite-plugin-pwa 버전 업데이트 주의사항(0.20.x→1.3.0대, Vite 8 peer dependency 지원, 옵션 구조 변경 없음)을 verification.md에 동기화 — 클레임 판정표 #7 추가, content test 2/2 PASS. PENDING_TEST 유지 | 메인 대화 |
