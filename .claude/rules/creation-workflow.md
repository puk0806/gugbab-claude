# 스킬·에이전트 생성 워크플로우

스킬(`SKILL.md`)·에이전트(`.md`) 생성 또는 외부 기술 정보가 포함된 파일을 수정할 때 참조한다.
`agent-creator`, `skill-creator` 모두 이 파일을 기준으로 삼는다.

---

## 적용 대상

| 작업 | 검증 필요 여부 |
|------|:---:|
| 외부 기술 정보 포함된 스킬 작성 | ✅ 필수 |
| 외부 기술 정보 포함된 에이전트 작성 | ✅ 필수 |
| CLAUDE.md / rules 파일 수정 | ✅ 필수 (외부 정보 포함 시) |
| 역할 정의·도구 목록만 있는 에이전트 | 생략 가능 |

---

## 5단계 워크플로우

### 단계 1: 조사 (Research)

WebSearch + WebFetch로 공식 문서 기반 조사를 수행한다.

```
조사 범위:
- 공식 문서 URL (1순위)
- 공식 GitHub (2순위)
- 최신 릴리즈 노트 (버전 명시 필수)
```

소스 유형별 조사 방법:

| 소스 유형 | 조사 대상 |
|-----------|-----------|
| 라이브러리/프레임워크 | 공식 문서 사이트, 공식 GitHub, 최신 안정 버전 changelog |
| 방법론(DDD, TDD 등) | 원저 서적 정보, 공인 커뮤니티, 저자 공식 자료 |
| 표준/스펙 | MDN, WHATWG, TC39, IETF RFC 등 공인 표준 문서 |

### 단계 2: 교차 검증 (Verify) — 생략 불가

WebSearch로 핵심 클레임을 2개 이상 독립 소스에서 교차 검증한다. 조사 결과가 명확해 보여도 반드시 실행한다.

```
검증 대상:
- API 이름·시그니처 변경 여부
- 버전별 Breaking Change
- deprecated / removed 항목
- 성능 수치·비교 데이터
- 공식 권장/비권장 여부
```

클레임별 판정:
- **VERIFIED** → 그대로 작성
- **DISPUTED** → 올바른 내용으로 수정 후 `> 주의:` 표기
- **UNVERIFIED** → 파일에서 제거하거나 `> 주의: 미검증` 표기

### 단계 3: 작성 (Write)

검증된 내용만 파일에 작성.

SKILL.md 필수 포함:
```
- 소스 URL (> 소스: https://...)
- 검증일 (> 검증일: YYYY-MM-DD)
- 부정확 가능성 있는 항목에 > 주의: 표기
```

### 단계 4: 검증 문서 저장 (Document) — 생략 불가

검증 증거를 `docs/skills/{category}/{name}/verification.md`에 저장한다.

포함 필수 항목:
```
- 사용한 소스 URL과 신뢰도
- 교차 검증한 클레임 목록과 판정 결과 (VERIFIED / DISPUTED / UNVERIFIED)
- 버전 기준
- 검증일
- 최종 판정 (PENDING_TEST / APPROVED / NEEDS_REVISION)
```

**이 단계를 생략하면 스킬 생성이 미완료 상태다.**

### 단계 5: 2단계 실사용 테스트 (skill-tester 호출) — 생략 불가

스킬 작성 직후(같은 세션 내) 반드시 `skill-tester` 에이전트를 호출하여 **verification-policy.md의 3·4단계**(테스트 질문 수행 + verification.md 업데이트)를 수행한다.

```
Agent(subagent_type="skill-tester", prompt="<skill-category/skill-name>")
```

skill-tester가 자동 수행하는 것:
- SKILL.md Read 후 2~3개 실전 질문 생성
- domain-specific 에이전트(또는 general-purpose)로 답변 실행
- 근거 섹션 존재 여부·anti-pattern 회피 확인
- verification.md의 섹션 5(테스트 진행 기록) + 섹션 6(검증 결과 요약) 업데이트
- status 전환: PASS → `APPROVED` (또는 "실사용 필수 스킬" 카테고리면 PENDING_TEST 유지)

**이 단계를 생략하고 세션을 종료하려 하면 `pending-test-guard` 훅이 차단한다.**

"실사용 필수 스킬" 카테고리(`verification-policy.md` 참조)인 경우도 **agent content test는 반드시 수행·기록**해야 훅을 통과한다.

---

## 산출물 체크리스트

스킬 생성 완료 기준:

- [ ] `.claude/skills/{category}/{name}/SKILL.md` 생성
- [ ] `docs/skills/{category}/{name}/verification.md` 생성
- [ ] `README.md` 스킬 목록 업데이트
- [ ] `README.md` 업데이트 로그 추가
- [ ] 소스 URL이 공식 문서인가
- [ ] 버전 번호가 명시되어 있는가
- [ ] 교차 검증 결과가 verification.md에 기록되어 있는가
- [ ] DISPUTED 항목이 수정 반영되었는가
- [ ] **skill-tester로 2단계 테스트 수행** (agent content test PASS)
- [ ] **verification.md 섹션 5에 오늘 날짜 "수행일" 기록** (pending-test-guard 통과)

---

## 검증 상태 정의

| 상태 | 의미 | 사용 가능 여부 |
|------|------|:---:|
| `PENDING_TEST` | 내용 검증 완료, 실사용 테스트 미실시 | ✅ |
| `APPROVED` | 실사용 테스트까지 완료 | ✅ |
| `NEEDS_REVISION` | 오류 발견, 수정 필요 | ⚠️ |
| `UNVERIFIED` | 검증 미완료 | ❌ |
