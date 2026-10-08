# legacy-spec-extractor

> 레거시 코드베이스(Java Spring·MyBatis/iBATIS, React, 넥사크로 17 등)에서 마이그레이션·재구축용 스펙을 모듈 단위로 추출해 화면·API·데이터 사용·비즈니스 규칙 명세로 합치는 오케스트레이터

| 항목 | 내용 |
|------|------|
| 파일 | `.claude/agents/domain/legacy-spec-extractor.md` |
| 모델 | Opus (maxTurns 40) |
| 도구 | Agent, Read, Glob, Grep, Bash, Write |
| 호출 | 사용자 직접 호출, `/spec-extract` 커맨드 |
| 템플릿 | spec-extraction(14) |

## 역할

- 인벤토리(화면·API·SQL·배치·연동 목록) → 모듈별 서브에이전트 병렬 추출 → 합치기(추적표·CRUD 매트릭스) → `spec-reviewer` 검토 → 요약
- 산출물은 대상 레포 `docs/spec/` 아래 문서만 만든다. 소스 수정·빌드 실행·비밀 값 기록을 하지 않는다

## 함께 쓰는 자산

| 자산 | 용도 |
|---|---|
| `spec-extraction-method` 스킬 | 방법론·명세 양식(공통 칸: 근거·확신도·사용 여부) |
| `spring-mybatis-spec-extraction` / `react-spec-extraction` / `nexacro-17-xfdl-anatomy` 스킬 | 스택별 추출법 |
| `spec-reviewer` 에이전트 | 근거 누락·불일치·CRUD 완전성 검토 |

## 설계 근거

- 대규모 코드 분석은 모듈 단위로 나누고, 모든 주장에 원문 근거를 달며, 사람 검토를 거친다 — Thoughtworks "Legacy Modernization meets GenAI"(martinfowler.com, 2024-09), Anthropic 환각 감소 가이드
- 서브에이전트는 독립 컨텍스트에서 탐색하고 요약만 돌려준다 — code.claude.com/docs/en/sub-agents
- 1:1 기능 복제를 경계해 "사용 여부"를 기록한다 — Fowler 사이트 Feature Parity 패턴(2021)
