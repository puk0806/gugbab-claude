---
name: project-hook-false-positives-2026-11-16
description: 다른 프로젝트 실사용 보고로 고친 훅 6건(2026-11-13~16, fix/hook-false-positives-2026-11-13) — 요청 없는 커밋·머지 사고 대응 A·B, git config 읽기·인자 글자 오탐, tdd-guard 범위, 빈 레포 첫 main push 예외
metadata:
  type: project
---

2026-11-13~16, 브랜치 `fix/hook-false-positives-2026-11-13` (v1.1.5 로 PR). 개인 출석 앱 세션이 보낸 보고로 시작.

- **사고**: 그 세션이 작업 목록에 "PR → 머지"를 넣고 "진행해"를 허락으로 해석 → commit·push·gh pr create·gh pr merge(셀프 머지, Vercel 운영 배포). 확인 창은 10건 모두 떴지만(user_temporary) 사유가 첫 동작 "git commit" 하나만 보여 머지까지 승인됨.
- **A (bash-guard)**: 확인 사유 전부 나열(머지·배포 경고 맨 앞, 1,400자 상한), gh pr merge·머지 API 별도 경고.
- **B (task-confirm-guard + lib/vcs-request.js)**: 커밋·푸시·PR·머지는 가장 최근 사용자 메시지가 요청했을 때만. 머지 ⊃ PR ⊃ 푸시. 부정·명사 쓰임("나머지"·"푸시 알림")·붙여넣기·다른 세션 메시지는 요청 아님. 룰 task-workflow.md 절 추가.
- **오탐**: `git config <키>` 읽기 차단(pre-approval-write) / 스크립트 파일 인자 속 "git push" 글자 차단(branch-protection — 스크립트에 명령 띄우는 코드 없을 때만 통과).
- **tdd-guard**: *.d.ts·타입 전용·*.setup.*·Next.js app/ 표시·메타 파일 제외, page·route·proxy·middleware·schema 는 유지. 경로는 프로젝트 루트 기준.
- **빈 레포 첫 main push**: 원격 ref 0개 + push 하나 + -u·-q·-v 만 + url 하나·pushurl/uploadpack/insteadOf 없음 + https/ssh/절대경로 + ls-remote 8초. 사용자 질문 "버그 없나?" → 우회 표 정리 후 구현.
- 재생 검증: 그 세션 Bash 185건 중 요청 없던 커밋·머지 9건 차단·요청한 커밋 회귀 0, 쓴 파일 129개 중 7개 막힘→통과.
- auto-approve 는 정상이었음(체감 마찰은 차단 훅). 같은 내용을 lfmall-ai-toolkit 세션에도 공유(사용자 요청).

**How to apply:** 하네스 훅 판정을 바꿀 때는 실제 세션 트랜스크립트 `permissionDecision` 대조 + 고치기 전(설치본)·후(작업 트리) 재생으로 효과를 수치로 보고한다([[feedback-auto-allow-reads-only]]). 관련: [[feedback-commit-policy]].
