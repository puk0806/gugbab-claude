# skill-creator

## 개요

- **역할**: 공식 문서 검증을 거쳐 스킬 SKILL.md 파일을 생성하는 에이전트. WebSearch로 직접 조사/교차 검증 후 파일 작성까지 자기 완결형으로 처리한다. 서브에이전트(Agent 도구)를 사용하지 않으므로 중첩 호출 제한이 없다.
- **모델**: opus
- **도구**: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch
- **카테고리**: meta

## 사용 시점

- 새로운 라이브러리/프레임워크 스킬 파일을 생성할 때
- 방법론(DDD, TDD 등)이나 표준/스펙 스킬을 작성할 때
- 기존 스킬의 버전이 outdated되어 재작성이 필요할 때
- 공식 문서 기반으로 검증된 패턴/모범 사례를 정리할 때

## 사용 예시

- "React Query 스킬 만들어줘"
- "PWA 스킬 파일 작성해줘"
- "WebSocket 패턴 스킬 만들어줘"

## 입력/출력

- **입력**: 스킬 주제, 대상 버전 (선택), 카테고리 (선택)
- **출력**: 3개 산출물 -- `.claude/skills/{category}/{name}/SKILL.md` (검증된 스킬 파일), `docs/skills/{category}/{name}/verification.md` (검증 증거 문서), README.md 업데이트 (gugbab-claude 프로젝트인 경우)

## 관련 에이전트

- **freshness-auditor** (meta) -- 감사 결과 재작성이 필요한 스킬을 식별할 때
- **agent-creator** (meta) -- 스킬과 함께 에이전트도 생성해야 할 때
- **deep-researcher** (research) -- 스킬 조사 시 더 깊은 리서치가 필요할 때
- **fact-checker** (validation) -- 스킬 내용의 개별 클레임을 추가 검증할 때
