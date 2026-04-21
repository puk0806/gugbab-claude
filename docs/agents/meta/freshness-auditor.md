# freshness-auditor

## 개요

- **역할**: 에이전트/스킬 전체를 감사해 최신화 필요 항목을 리포트하는 에이전트. 모델 ID deprecated 여부, 스킬 버전 outdated, 검증일 만료, verification.md 누락 등을 점검한다.
- **모델**: sonnet
- **도구**: Read, Glob, Grep, WebSearch, WebFetch
- **카테고리**: meta

## 사용 시점

- 프로젝트의 에이전트/스킬 전체 최신화 상태를 점검할 때
- 모델 ID가 deprecated 되었는지 확인할 때
- 스킬의 검증일이 만료되었거나 버전이 outdated인지 확인할 때
- verification.md 누락 여부를 일괄 점검할 때
- 정기적인 프로젝트 유지보수 감사를 실행할 때

## 사용 예시

- "에이전트랑 스킬들 최신화 됐는지 전체 검증해줘"
- "스킬 버전 오래된 거 있어?"
- "freshness audit 돌려줘"

## 입력/출력

- **입력**: 감사 실행 요청 (별도 파라미터 없음, 프로젝트 전체를 자동 스캔)
- **출력**: 구조화된 Freshness Audit 리포트 -- 에이전트별 모델/도구 유효성, 스킬별 검증일/버전 상태, verification.md 존재 여부, 액션 아이템 목록

## 관련 에이전트

- **agent-creator** (meta) -- 감사 결과 에이전트 수정이 필요할 때
- **skill-creator** (meta) -- 감사 결과 스킬 재검증/재작성이 필요할 때
- **claude-code-guide** (meta) -- Claude Code 도구 목록의 최신 정보 확인 시
