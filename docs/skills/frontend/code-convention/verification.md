# code-convention 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `code-convention` |
| 스킬 경로 | `.claude/skills/frontend/code-convention/SKILL.md` |
| 검증일 | 2026-03-27 |
| 스킬 버전 | v1 |

---

## 1. 작업 목록

- [x] ESLint 9 flat config 공식 문서 확인
- [x] Biome 공식 문서 확인
- [x] Prettier 공식 문서 확인
- [x] Husky v9 + lint-staged 설정 확인
- [x] 모노레포 공유 eslint-config 패턴 정리
- [x] TypeScript 타입 체크 패턴 추가 (tsc --noEmit, ts-expect-error, strict 옵션)
- [x] pre-commit vs pre-push typecheck 기준 추가
- [x] SKILL.md 파일 작성

---

## 2. 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| ESLint Flat Config 공식 | https://eslint.org/docs/latest/use/configure/configuration-files | ⭐⭐⭐ High |
| Biome 공식 문서 | https://biomejs.dev/docs | ⭐⭐⭐ High |
| Prettier 공식 문서 | https://prettier.io/docs/en/configuration.html | ⭐⭐⭐ High |
| Husky 공식 | https://typicode.github.io/husky | ⭐⭐⭐ High |

---

## 3. 검증 체크리스트

- [x] ESLint 9 flat config 형식 (eslint.config.js) 반영
- [x] eslint-config-prettier 충돌 방지 패턴 포함
- [x] 모노레포 공유 설정 패턴 포함
- [x] Biome vs ESLint+Prettier 선택 기준표 포함
- [ ] 에이전트 활용 테스트 (미실시)

---

## 4. 테스트 케이스 (예정)

### 테스트 1: 도구 선택 질문
```
Next.js 모노레포에서 린터/포매터 조합 뭐가 좋아?
```
**기대:** ESLint + Prettier 권장 (next-eslint 호환), Biome 트레이드오프 언급

### 테스트 2: 설정 질문
```
ESLint 9 flat config에서 Next.js 규칙 적용하는 법은?
```
**기대:** @next/eslint-plugin-next 플러그인 + flat config 예시 제공

---

## 5. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 에이전트 활용 테스트 | ⏳ PENDING |
| **최종 판정** | **PENDING_TEST** |

---

## 7. 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-03-27 | v1 | 최초 작성 |
