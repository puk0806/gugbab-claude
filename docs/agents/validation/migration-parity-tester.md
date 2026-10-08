# migration-parity-tester

> 마이그레이션 전후 조회·저장(행 추가·수정·삭제)·오류 처리가 같은지 비교하는 동등성 테스트와 적대적 테스트를 만드는 QA 에이전트

| 항목 | 내용 |
|------|------|
| 파일 | `.claude/agents/validation/migration-parity-tester.md` |
| 모델 | Sonnet (maxTurns 30) |
| 도구 | Read, Write, Edit, Glob, Grep, Bash |
| 호출 | 화면·API 변환 후 사용자 직접 호출 |
| 템플릿 | nexacro(15) |

## 역할

기준선(기존 API 응답 스냅샷) 확보 → 동등성 테스트(같은 입력 → 결과·DB 상태·오류 비교) → 적대적 테스트(권한 우회·ID 조작·위조 행 상태·과다 행·동시 수정) → 경계 테스트 → 차이 보고(`docs/migration/parity/<화면ID>.md`).
기대값을 구현에 맞춰 바꾸지 않고, 운영 데이터를 변경하지 않는다.

## 설계 근거

- 현행 동작을 고정하는 특성화·승인 테스트 — Michael Feathers, *Working Effectively with Legacy Code*(2004), approvaltests.com
- 테스트 3계층(정상·악성 유저·경계) — 레포 `adversarial-testing` 규칙
