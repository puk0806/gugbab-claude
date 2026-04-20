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
| 2026-04-20 | v1 | 최초 작성, lf-ui 프로젝트 분석 기반, WebSearch 6개 클레임 교차 검증 (전항목 VERIFIED) | 메인 대화 |
