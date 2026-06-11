---
name: verification.md 작성 3원칙 + content test 기준
description: verification.md 수정·status 전환 시 반드시 지켜야 할 원칙 — 로컬 컨텍스트 노출 금지, 일괄 업데이트 사전 승인, 자의적 선택 금지, content test PASS만으로 APPROVED 가능 카테고리 식별
type: feedback
originSessionId: 49647d76-c9a0-4fc6-8454-580fbf669fcf
---
verification.md 수정과 status 전환 시 반드시 지킬 4개 원칙.

**Why**: 2026-05-07 세션에서 01_gugbab-claude-package 프로젝트명·PR 번호를 verification.md에 박았다가 사용자가 *다른 사람·다른 PC에서 이해 불가하다*고 거절. 동시에 frontend 21종 APPROVED는 그대로 두고 devops/education 7종만 자의적으로 보강해 *일부만 손대는 선택* 비판 받음. 모든 변경 revert 후 규칙으로 정리.

**How to apply**:

### 1. 실사용 검증 필요 vs 불필요 구분

| 구분 | 카테고리 | APPROVED 전환 조건 |
|------|---------|-------------------|
| 실사용 필수 | 마이그레이션·빌드 설정·워크플로우 | 실 프로젝트 적용 후만 APPROVED |
| 실사용 불필요 | 라이브러리 사용법·API 패턴·개념·이론 | Claude content test PASS만으로 APPROVED 가능 |

**판정 기준**: 스킬 검증이 *실행 결과·빌드 산출물*로만 가능한가 → 실사용 필수. *답변 정확성*만으로 충분한가 → content test 충분.

### 2. 로컬 프로젝트명·PR 번호 박지 않기

verification.md는 다른 사람·다른 PC에서 이해 가능해야 한다. 다음 박지 말 것:
- 로컬 프로젝트명 (`01_gugbab-claude-package`, `lfos-ui` 등)
- PR 번호 (`PR #1~#11`)
- 로컬 파일 절대경로 (`/Users/lf/Desktop/...`)
- 사용자 로컬 워크플로우 파일명

→ 일반화된 표현 사용 ("공용 프론트엔드 패키지 모노레포에서 검증" 등)

### 3. 대량 일괄 업데이트는 사용자 명시 승인 후

verification.md 2개 이상 동시 수정 시 *사전 보고 + 사용자 승인* 필수.

### 4. 일부만 손대는 자의적 선택 금지

동일 기준이면 *전체* 적용 또는 *전체* 미적용. 자의적 부분 적용은 일관성 훼손.

기준이 다르면 *기준별로 일관되게* 적용한다.

상세 규칙은 `.claude/rules/verification-policy.md` 참조.
