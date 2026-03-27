# monorepo-turborepo 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `monorepo-turborepo` |
| 스킬 경로 | `.claude/skills/frontend/monorepo-turborepo/SKILL.md` |
| 검증일 | 2026-03-27 |
| 스킬 버전 | v1 |

---

## 1. 작업 목록

- [x] 공식 문서 확인 (turbo.build/repo/docs)
- [x] 모노레포 vs 멀티레포 선택 기준 정리
- [x] 표준 폴더 구조 정리
- [x] turbo.json 파이프라인 설정 정리
- [x] workspace:* 프로토콜 정리
- [x] 내부 패키지 유형 (UI, Config, Types) 정리
- [x] Changesets 워크플로우 정리
- [x] 캐싱 전략 정리
- [x] SKILL.md 파일 작성

---

## 2. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Turborepo 공식 문서 | https://turbo.build/repo/docs | ⭐⭐⭐ High | - | 공식 |
| Turborepo GitHub | https://github.com/vercel/turborepo | ⭐⭐⭐ High | - | 공식 |
| Vercel 모노레포 가이드 | https://vercel.com/docs/monorepos | ⭐⭐⭐ High | - | 공식 |

---

## 3. 검증 체크리스트

### 3-1. 내용 정확성
- [x] turbo.json `tasks` 필드 (v2.x) 사용 (구: `pipeline`)
- [x] `^` (caret) 의미 정확히 설명
- [x] `workspace:*` 프로토콜 pnpm/Yarn v2+ 한정임을 명시
- [x] Changesets 워크플로우 정확히 기술

### 3-2. 구조 완전성
- [x] 모노레포 선택 기준표 포함
- [x] 표준 폴더 구조 포함
- [x] turbo.json 전체 예시 포함
- [x] 내부 패키지 유형별 설정 포함
- [x] 자주 쓰는 turbo 명령어 포함
- [x] 흔한 실수 패턴 포함

### 3-3. 실용성
- [x] 범용적 패턴 (특정 패키지 이름 제외)
- [x] 실제 프로젝트에서 바로 적용 가능한 설정
- [ ] 에이전트 활용 테스트 (미실시)

---

## 4. 테스트 진행 기록

### 테스트 케이스 1: 새 패키지 추가 방법 질문

**테스트 질문 (예정):**
```
모노레포에 공유 유틸리티 패키지를 추가하려면?
```

**기대 결과:**
- `packages/utils` 폴더 구조 제안
- package.json exports 설정
- tsup 빌드 스크립트
- 앱에서 `workspace:*`로 참조하는 방법

**판정:** ⏳ PENDING_TEST

---

### 테스트 케이스 2: 빌드 순서 문제 질문

**테스트 질문 (예정):**
```
apps/web에서 packages/ui를 import하는데 ui가 먼저 빌드되게 하려면?
```

**기대 결과:**
- turbo.json build task에 `dependsOn: ["^build"]` 설정
- ^ 의미 설명

**판정:** ⏳ PENDING_TEST

---

## 5. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ⏳ PENDING |
| **최종 판정** | **PENDING_TEST** |

---

## 6. 개선 필요 사항

- [ ] 에이전트 테스트 수행
- [ ] npm workspaces 설정도 추가 고려 (pnpm 외)
- [ ] Nx와 Turborepo 비교 내용 추가 고려

---

## 7. 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-03-27 | v1 | 최초 작성 |
