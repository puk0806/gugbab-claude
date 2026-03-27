# web-searcher

> 검색 축(논문/오픈소스/기업사례)과 쿼리를 받아 구조화된 결과를 반환하는 검색 전담 에이전트

| 항목 | 내용 |
|------|------|
| 파일 | `.claude/agents/research/web-searcher.md` |
| 모델 | Sonnet |
| 도구 | WebSearch, WebFetch |
| 호출 | `deep-researcher`가 자동 호출 (서브에이전트) |

## 역할

`deep-researcher`의 서브에이전트로 자동 호출됩니다. 검색 축별로 특화된 전략을 사용해 관련 소스를 찾고 신뢰도가 태깅된 구조화된 마크다운 결과를 반환합니다.

## 축별 검색 전략

| 축 | 주요 도구 | 목표 소스 수 |
|----|-----------|-------------|
| 논문/학술 | Exa 시맨틱 검색 → WebSearch 폴백 | 3개 이상 |
| 오픈소스 | GitHub 검색 → DeepWiki 심층 분석 | 3개 이상 |
| 기업사례 | WebSearch → WebFetch 상세 | 3개 이상 |

## 신뢰도 태깅 기준

| 신뢰도 | 소스 유형 |
|--------|-----------|
| High | 피어리뷰 논문, 공식 문서, 공식 블로그 |
| Medium | 기술 블로그, 컨퍼런스 발표, Stars 100+ 레포 |
| Low | 개인 블로그, 포럼, Stars < 100 레포 |

## 직접 호출 예시

특정 축만 빠르게 검색할 때 직접 호출 가능합니다.

```
축: 오픈소스
쿼리: ["react server components", "RSC architecture", "next.js app router"]
```
