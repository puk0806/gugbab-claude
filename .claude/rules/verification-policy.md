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
