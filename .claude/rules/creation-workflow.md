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

## 4단계 워크플로우

### 단계 1: 조사 (Research)

`deep-researcher` 또는 `web-searcher` 서브에이전트로 공식 문서 기반 조사.

```
조사 범위:
- 공식 문서 URL (1순위)
- 공식 GitHub (2순위)
- 최신 릴리즈 노트 (버전 명시 필수)
```

**병렬 처리:** 여러 주제를 동시에 조사할 때는 서브에이전트를 병렬로 실행한다.

### 단계 2: 검증 (Verify) — 생략 불가

`fact-checker` 서브에이전트로 핵심 클레임을 교차 검증한다. 조사 결과가 명확해 보여도 반드시 실행한다.

```
검증 대상:
- API 이름·시그니처 변경 여부
- 버전별 Breaking Change
- deprecated / removed 항목
- 성능 수치·비교 데이터
- 공식 권장/비권장 여부
```

공식 문서가 아닌 소스 포함 시 `source-validator`도 실행한다.

fact-checker 결과 처리 규칙:
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
- fact-checker에 전달한 클레임 목록과 판정 결과
- 버전 기준
- 검증일
- 최종 판정 (PENDING_TEST / APPROVED / NEEDS_REVISION)
```

**이 단계를 생략하면 스킬 생성이 미완료 상태다.**

---

## 산출물 체크리스트

스킬 생성 완료 기준:

- [ ] `.claude/skills/{category}/{name}/SKILL.md` 생성
- [ ] `docs/skills/{category}/{name}/verification.md` 생성
- [ ] `README.md` 스킬 목록 업데이트
- [ ] `README.md` 업데이트 로그 추가
- [ ] 소스 URL이 공식 문서인가
- [ ] 버전 번호가 명시되어 있는가
- [ ] fact-checker 검증 결과가 verification.md에 기록되어 있는가
- [ ] DISPUTED 항목이 수정 반영되었는가

---

## 검증 상태 정의

| 상태 | 의미 | 사용 가능 여부 |
|------|------|:---:|
| `PENDING_TEST` | 에이전트 파이프라인 검증 완료, 실사용 테스트 미실시 | ✅ |
| `APPROVED` | 실사용 테스트까지 완료 | ✅ |
| `NEEDS_REVISION` | 오류 발견, 수정 필요 | ⚠️ |
| `UNVERIFIED` | 에이전트 파이프라인 미사용, 검증 미완료 | ❌ |
