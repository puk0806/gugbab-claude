# 검증 정책

verification.md와 SKILL.md 수정 및 검증 상태 전환에 관한 규칙.

---

## 수정 도구 제한

**verification.md, SKILL.md 파일은 반드시 Write 또는 Edit 도구로만 수정한다.**

금지 방법:
- `Bash(sed)`, `Bash(awk)`, `Bash(perl -i)`, `Bash(echo >)`, `Bash(cat >)`
- 이유: Write/Edit 도구를 사용해야 verification-guard 훅이 내용을 검증할 수 있다

bash-guard.js가 이를 강제하지만, 규칙 수준에서도 명시한다.

---

## PENDING_TEST → APPROVED 전환 절차

PENDING_TEST 상태의 스킬을 APPROVED로 전환하려면 다음 절차를 **모두** 수행해야 한다.

### 1단계: SKILL.md 내용 확인 (Read — 필수)

해당 SKILL.md를 Read로 전체 내용을 읽는다. 읽지 않고 상태만 변경하는 것은 금지.

### 2단계: 핵심 내용 검증 (WebSearch — 필수)

SKILL.md의 핵심 클레임 최소 3개를 WebSearch로 현재 공식 문서와 대조한다:
- 버전 번호가 현재 최신과 일치하는가
- API 시그니처/사용법이 변경되지 않았는가
- deprecated된 내용이 없는가

### 3단계: 테스트 질문 수행 (최소 2개)

스킬 내용을 기반으로 실제 개발 상황의 질문을 만들고, SKILL.md 내용이 올바른 답을 도출하는지 확인한다.

예시:
```
질문: "dayjs에서 UTC 시간을 한국 시간으로 변환하려면?"
SKILL.md 답변 경로: dayjs.utc(date).tz('Asia/Seoul') — 맞는가?
WebSearch 확인: dayjs 공식 문서에서 확인
```

### 4단계: verification.md 업데이트 (Write/Edit — 필수)

Write 또는 Edit 도구로 다음을 수정한다:
- `status: PENDING_TEST` → `status: APPROVED`
- 섹션 5 (테스트 진행 기록)에 실제 테스트 내용 기록
- 섹션 6 (검증 결과 요약) 최종 판정 변경

**일괄 치환(sed 등)으로 여러 파일의 status를 한 번에 바꾸는 것은 금지.**
각 스킬별로 1~4단계를 개별 수행해야 한다.

---

## 실사용 필수 스킬 (PENDING_TEST 유지)

다음 유형의 스킬은 실제 프로젝트에서 사용해본 뒤에만 APPROVED로 전환한다:
- 마이그레이션 가이드 (빌드/설정 변환이 실제로 작동하는지 확인 필요)
- 빌드 설정 스킬 (출력 결과물 검증 필요)
- 워크플로우 스킬 (실제 실행 결과 확인 필요)

## 실사용 검증이 필요 없는 스킬 — content test PASS = APPROVED

위 *실사용 필수 카테고리*에 해당하지 않는 스킬은 Claude 자체 content test(skill-tester가 SKILL.md 기반 실전 질문 답변 검증)만으로 APPROVED 전환이 가능하다.

대표 예시:
- 라이브러리 사용법 스킬 (dayjs, react-virtuoso 등) — content test로 충분
- API 패턴 스킬 (REST 설계 등) — content test로 충분
- 개념·이론 정리 스킬 (DDD, 디자인 패턴 등) — content test로 충분

**판정 기준**: 스킬 사용 결과가 *실행 결과·빌드 산출물*로만 검증 가능한가 → 그렇다면 *실사용 필수*. 사용 시점의 *답변 정확성*만으로 검증 가능한가 → 그렇다면 *content test로 충분*.

---

## verification.md 작성 시 금지 사항

### 1. 로컬 프로젝트명·PR 번호·로컬 파일 경로 박지 않기

verification.md는 다른 사람·다른 PC에서도 이해 가능해야 한다. 다음은 박지 않는다:
- 로컬 프로젝트명 (예: `01_gugbab-claude-package`, `lfos-ui` 등)
- PR 번호 (예: `PR #1~#11`)
- 로컬 파일 절대경로 (예: `/Users/lf/Desktop/...`)
- 사용자 로컬 워크플로우 파일명 (예: `visual-regression.yml`)

대신 일반화된 표현을 사용한다:
- "공용 프론트엔드 패키지 모노레포 프로젝트에서 검증"
- "GitHub Actions 시각 회귀 워크플로우 11회 진화 PR로 검증"
- "실 프로덕션 모노레포에서 검증 완료"

### 2. 대량 일괄 업데이트는 사용자 명시 승인 후 수행

verification.md를 2개 이상 동시에 수정해야 할 때:
- 사용자에게 *어떤 파일을 어떻게 수정할 것인지* 사전 보고
- 사용자 명시 승인("OK", "전체 진행" 등) 후에만 수행
- 단일 파일 수정은 사용자가 작업 흐름상 승인한 것으로 간주 가능

### 3. 일부만 손대는 자의적 선택 금지

동일 기준이면 *전체* 적용 또는 *전체* 미적용. 일부만 자의적으로 선택해 손대는 것 금지:
- 잘못된 예: "frontend 21개 중 7개에만 실사용 기록 추가"
- 옳은 예: "frontend 21개 모두 추가" 또는 "전부 손대지 않음"

기준이 다르면 *기준별로 일관되게* 적용한다 (예: "VR 관련 2개에만 추가" 같은 *명확한 기준 그룹*은 허용).
