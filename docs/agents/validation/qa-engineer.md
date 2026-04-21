# qa-engineer

> PRD의 수용 기준(Given-When-Then)을 받아 테스트 계획서, E2E 테스트 시나리오, Playwright 테스트 코드, 회귀 테스트 체크리스트를 생성하는 QA 전담 에이전트

| 항목 | 내용 |
|------|------|
| 파일 | `.claude/agents/validation/qa-engineer.md` |
| 모델 | Sonnet |
| 도구 | Read, Write, Edit, Glob, Grep, Bash |
| 호출 | `@qa-engineer` |

## 역할

PRD의 수용 기준(Given-When-Then)을 입력받아 4종의 QA 산출물을 생성합니다:

1. **테스트 계획서** — 테스트 범위, 전략, 시나리오 요약, 우선순위(P0-P3), 진입/종료 기준
2. **E2E 테스트 시나리오** — 정상(Happy Path), 예외(Negative), 경계값(Boundary) 3유형
3. **Playwright 테스트 코드** — Page Object Model 기반, 실행 가능한 E2E 코드
4. **회귀 테스트 체크리스트** — 변경 영향 범위 분석, 스모크/기능/성능/호환성 검증 목록

## 주요 방법론

### 테스트 계획

- IEEE 829 기반 테스트 계획 구조 (범위, 전략, 환경, 진입/종료 기준)
- SMART 목표 설정 (Specific, Measurable, Achievable, Relevant, Time-bound)
- 리스크 기반 우선순위 분류 (P0 Critical ~ P3 Low)

### E2E 테스트

- BDD(Behavior-Driven Development)의 Given-When-Then 프레임워크 기반 시나리오 작성
- 정상/예외/경계값 3유형 분류로 커버리지 확보
- Three Amigos (PO-Dev-QA) 협업 원칙 반영

### Playwright 코드 패턴

- Page Object Model (POM) — UI 요소와 액션을 페이지 클래스로 캡슐화
- 로케이터 우선순위: `getByRole()` > `getByTestId()` > `getByText()` > CSS/XPath
- 내장 auto-waiting 활용, 고정 대기(`waitForTimeout`) 금지
- 테스트 격리: 각 테스트 독립 실행, 상태 공유 금지

### 회귀 테스트

- 변경 영향 범위 분석 기반 회귀 범위 결정
- 계층화 전략: 스모크(매 빌드) → 기능 회귀 → 성능 회귀 → 호환성
- 성능 기준치(baseline) 포함한 성능 회귀 검증

## 사용 예시

```
# PRD 수용 기준 기반 전체 산출물 생성
@qa-engineer 이 PRD의 수용 기준으로 테스트 계획 짜줘

# 특정 기능 E2E 테스트 코드 생성
@qa-engineer 로그인 기능 E2E 테스트 코드 만들어줘

# 회귀 체크리스트만 생성
@qa-engineer 결제 모듈 변경에 대한 회귀 테스트 체크리스트 작성해줘
```

## 검증 기반 소스

이 에이전트의 QA 방법론은 다음 소스를 교차 검증하여 작성되었습니다:

| 영역 | 소스 | 신뢰도 |
|------|------|--------|
| 테스트 계획 | [Katalon - How to Create a Test Plan](https://katalon.com/resources-center/blog/test-plan-template), [TestRail - Create a Test Plan](https://www.testrail.com/blog/create-a-test-plan/) | High |
| E2E / BDD | [Parallel - Given-When-Then Acceptance Criteria](https://www.parallelhq.com/blog/given-when-then-acceptance-criteria), [AltexSoft - Acceptance Criteria](https://www.altexsoft.com/blog/acceptance-criteria-purposes-formats-and-best-practices/) | High |
| Playwright | [Playwright 공식 Best Practices](https://playwright.dev/docs/best-practices), [BrowserStack - Playwright Best Practices 2026](https://www.browserstack.com/guide/playwright-best-practices) | High |
| 회귀 테스트 | [Katalon - Regression Testing Starter Kit](https://katalon.com/resources-center/blog/regression-testing-starter-kit), [Aqua - Regression Testing Checklist](https://aqua-cloud.io/regression-testing-checklist/) | High |

> 검증일: 2026-04-20
