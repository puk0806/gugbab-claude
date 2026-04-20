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

### 4-5. DISPUTED 항목 처리

- 없음 (전 클레임 VERIFIED)

---

## 5. 테스트 진행 기록

- 현재 없음 (PENDING_TEST 상태)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ⏳ 미실시 (PENDING_TEST) |
| **최종 판정** | **PENDING_TEST** |

---

## 7. 개선 필요 사항

- 현재 없음

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성, lf-ui public/service-worker.js 마이그레이션 시나리오 기반, WebSearch 6개 클레임 교차 검증 (전항목 VERIFIED) | 메인 대화 |
