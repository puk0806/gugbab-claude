---
skill: cra-to-vite-migration
category: frontend
version: v1
date: 2026-04-20
status: PENDING_TEST
---

# cra-to-vite-migration 스킬 검증 문서

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
| 스킬 이름 | cra-to-vite-migration |
| 스킬 경로 | .claude/skills/frontend/cra-to-vite-migration/SKILL.md |
| 최초 작성일 | 2026-04-20 |
| 검증 방법 | WebSearch 교차 검증 (메인 대화) |
| 버전 기준 | Vite 6.x / vite-plugin-svgr v4 / Vitest 3.x |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (vitejs.dev, react.dev, vitest.dev)
- [✅] CRA 공식 deprecated 여부 확인 (react.dev 블로그 2025-02-14)
- [✅] 핵심 마이그레이션 패턴 정리 (8단계)
- [✅] 코드 예시 작성 (Before/After 비교 형식)
- [✅] 흔한 실수 패턴 정리 (7가지)
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
| React 공식 블로그 (CRA deprecated) | https://react.dev/blog/2025/02/14/sunsetting-create-react-app | ⭐⭐⭐ High | 2025-02-14 | CRA 공식 종료 선언 |
| Vite 공식 문서 | https://vitejs.dev/guide/ | ⭐⭐⭐ High | - | Vite 기본 설정 |
| Vite Performance 가이드 | https://vite.dev/guide/performance | ⭐⭐⭐ High | - | moduleResolution bundler 권장 |
| Vitest 공식 설정 문서 | https://vitest.dev/config/ | ⭐⭐⭐ High | - | test 블록 설정 기준 |
| vite-plugin-svgr GitHub | https://github.com/pd4d10/vite-plugin-svgr | ⭐⭐⭐ High | - | ?react 쿼리 공식 확인 |
| Robin Wieruch - Vite + CRA | https://www.robinwieruch.de/vite-create-react-app/ | ⭐⭐ Medium | - | 실전 마이그레이션 가이드 |
| Cathal Mac Donnacha - CRA→Vite | https://cathalmacdonnacha.com/migrating-from-create-react-app-cra-to-vite | ⭐⭐ Medium | - | Jest→Vitest 포함 종합 가이드 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Vite 6.x, vite-plugin-svgr v4, Vitest 3.x)
- [✅] deprecated된 패턴을 권장하지 않음 (react-scripts, @types/jest 제거 안내)
- [✅] 코드 예시가 실행 가능한 형태임 (Before/After 비교)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 8단계 마이그레이션 절차 포함
- [✅] 코드 예시 포함 (패키지, config, env, SVG, tsconfig, vitest 설정)
- [✅] 흔한 실수 패턴 포함 (7가지)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 마이그레이션 코드 작성에 도움이 되는 수준
- [✅] Before/After 형식으로 변경 내용이 명확함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. WebSearch 교차 검증 결과

| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | CRA(Create React App)는 2025년 2월 공식 deprecated | VERIFIED | react.dev/blog/2025/02/14/sunsetting-create-react-app 직접 확인 |
| 2 | Vite는 `VITE_` 접두사 변수만 클라이언트에 노출, 코드에서 `import.meta.env.VITE_*`로 접근 | VERIFIED | vitejs.dev 공식 문서 + 다수 마이그레이션 가이드 교차 확인 |
| 3 | index.html은 Vite에서 프로젝트 루트에 위치해야 하며 `<script type="module">` 명시 필요 | VERIFIED | Vite 공식 문서 + Robin Wieruch 가이드 확인 |
| 4 | vite-plugin-svgr v4에서 SVG 컴포넌트 import 시 `?react` 쿼리 필수 | VERIFIED | GitHub pd4d10/vite-plugin-svgr 공식 README + Release v4.0.0 확인 |
| 5 | Vitest는 Jest 100% 호환 API 제공 (`vi` = `jest`, describe/it/expect 동일) | VERIFIED | vitest.dev 공식 문서 + cathalmacdonnacha.com 마이그레이션 가이드 확인 |
| 6 | tsconfig `"moduleResolution": "bundler"`는 Vite 공식 권장 설정 | VERIFIED | vite.dev/guide/performance 공식 문서 명시 확인 |

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
| 2026-04-20 | v1 | 최초 작성, WebSearch 6개 클레임 교차 검증 (전항목 VERIFIED) | 메인 대화 |
