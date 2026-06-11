---
name: verification.md는 섹션 5·6·7·8 전부 동기화 확인
description: skill-tester 호출 후 섹션 5·6만 업데이트되고 섹션 7(follow-up)·8(변경이력)이 누락되는 문제가 있으니 메인 호출자가 반드시 마지막에 전체 섹션을 직접 확인·정리
type: feedback
originSessionId: 7cec2b46-a7ad-414e-83fd-29deb3565e5c
---
skill-tester 에이전트를 호출한 뒤에도 verification.md 전체 섹션을 메인(호출자)이 직접 Read로 확인하고 섹션 7·8까지 정리를 끝내야 한다.

**Why:** rsbuild 스킬에서 skill-tester가 APPROVED 전환을 보고했지만 실제 파일을 열어보니 섹션 7(개선 필요 사항) 첫 번째 항목이 여전히 ❌ 상태였고 섹션 8(변경 이력)에도 skill-tester 수행 기록이 추가되지 않은 채 남아 있었다. 사용자가 "## 7. 개선 필요 사항"의 ❌를 보고 "테스트 하나도 진행 안한거야?"라고 강하게 지적. 섹션 5·6만 업데이트되면 status는 APPROVED지만 문서는 이중 상태가 되어 신뢰가 떨어진다.

**How to apply:**
- skill-tester 호출 결과 수신 → verification.md 전체 Read → 섹션 5·6·7·8 모두 일관되는지 확인
- 섹션 7의 "skill-tester가 content test 수행" 항목은 수행 완료 시 ✅로 전환 (수행일 함께 기재)
- 섹션 8 변경 이력에 skill-tester 수행 행을 반드시 추가 (날짜·버전·내용·변경자)
- 섹션 7에 "실제 프로젝트 적용 후 보강" 같은 후속 과제가 있으면 차단 요인인지 선택 보강인지 명시
- 필요하다면 skill-tester 에이전트 MD에 섹션 7·8 업데이트 의무를 추가하는 개선 PR을 별도로 진행 (근본 해결)
