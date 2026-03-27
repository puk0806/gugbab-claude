# source-validator

> URL/GitHub 레포/문서의 신뢰도를 TRUST / CAUTION / REJECT로 판정하는 소스 검증 전담 에이전트

| 항목 | 내용 |
|------|------|
| 파일 | `.claude/agents/validation/source-validator.md` |
| 모델 | Sonnet |
| 도구 | WebSearch, WebFetch |
| 호출 | 자동 또는 `@source-validator` |

## 역할

새로운 레퍼런스를 사용하기 전 신뢰도를 빠르게 평가합니다. CLAUDE.md 정보 검증 원칙의 실행 담당입니다. GitHub 레포, 블로그, 공식 문서, 논문 등 소스 유형별로 다른 체크 항목을 적용합니다.

## 소스 유형별 주요 체크 항목

**GitHub 레포**: Stars 수, 최근 커밋(6개월), 이슈 응답, 라이센스, 공식 org 여부

**기술 블로그**: 작성자/소속 명확, 작성일 1년 이내, 출처 링크 포함

**공식 문서**: 공식 도메인 여부, 버전 명시, 최근 업데이트

**논문**: arXiv/IEEE/ACM 플랫폼, 인용 수, 피어리뷰 여부

## 판정 기준

| 판정 | 조건 |
|------|------|
| ✅ TRUST | 주요 체크 항목 대부분 통과, 경고 신호 없음 |
| ⚠️ CAUTION | 일부 항목 미달. 사용 가능하나 교차 검증 필요 |
| ❌ REJECT | 주요 항목 다수 실패 또는 명확한 신뢰도 문제 |

**자동 REJECT 조건**: 작성자 불명 / 공식 문서와 명백히 상충 / 2년 이상 미업데이트 (빠르게 변하는 기술) / Stars 50 미만 + 6개월 업데이트 없음

## 호출 예시

```
이 GitHub 레포 믿을만해? https://github.com/xxx/yyy
이 블로그 글 출처 검증해줘 https://...
이 npm 패키지 써도 될지 확인해줘
```
