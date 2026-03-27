# fact-checker

> 특정 사실/수치/주장을 복수 소스로 교차 검증해 VERIFIED / UNVERIFIED / DISPUTED 판정을 반환하는 팩트체크 전담 에이전트

| 항목 | 내용 |
|------|------|
| 파일 | `.claude/agents/validation/fact-checker.md` |
| 모델 | Sonnet |
| 도구 | WebSearch, WebFetch |
| 호출 | 자동 또는 `@fact-checker` |

## 역할

단일 클레임을 빠르게 검증합니다. `deep-researcher`는 넓은 주제 조사용이고, `fact-checker`는 "이 수치가 맞나?", "이 기능이 지원되나?" 같은 구체적인 사실 하나를 빠르게 검증할 때 사용합니다.

## 클레임 유형별 전략

| 유형 | 검증 방법 |
|------|-----------|
| 수치/통계 | 공식 사이트 직접 조회 (npm, GitHub Stars 등) |
| 기술 사실 | 공식 문서 또는 GitHub README 직접 확인 |
| 순위/비교 | 공신력 있는 벤치마크 2개 이상 교차 |
| 사건/날짜 | 공식 릴리즈 노트, 공식 블로그, Wikipedia 순 |

## 판정 기준

| 판정 | 조건 |
|------|------|
| ✅ VERIFIED | High/Medium 소스 2개 이상에서 일치 |
| ❌ UNVERIFIED | 소스 1개 이하 또는 Low 소스만 존재 |
| ⚠️ DISPUTED | 소스 간 내용이 상충하거나 부분적으로만 맞음 |
| 📋 NOT_FACTUAL | 의견/예측/주관적 주장 — 팩트체크 대상 아님 |

## 호출 예시

```
Claude Sonnet이 GPT-4o보다 코딩 벤치마크에서 높다는게 맞아?
React가 Vue보다 npm 다운로드 수가 10배 많다는 주장 검증해줘
이 라이브러리가 TypeScript 5.0을 지원한다는 게 사실인지 확인해줘
```
