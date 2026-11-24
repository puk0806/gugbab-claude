---
name: feedback-check-ci-before-done
description: "푸시한 뒤에는 GitHub CI(특히 윈도우) 결과까지 확인하고 나서 \"끝났다\"고 보고한다 — 맥 로컬 시험만으로 완료 선언 금지"
metadata:
  node_type: memory
  type: feedback
  originSessionId: fcd01deb-5e2e-4ed8-8072-cbe66cb8d86f
  modified: 2026-11-24T01:24:06.771Z
---

푸시했으면 `gh run list`·`gh pr view --json statusCheckRollup` 으로 CI 결과를 확인한 뒤에 완료를 보고한다. 맥 로컬 시험이 전부 통과해도 윈도우 전용 시험은 맥에서 건너뛰어지므로 CI 가 유일한 확인 수단이다.

**Why:** 2026-11-24 v1.1.6 브랜치(`feat/release-notes-2026-11-17`)의 윈도우 CI 가 11-23 첫 푸시부터 계속 실패했는데 로컬 시험만 보고 "잔존 이슈 없음"이라고 보고했다. 사용자가 PR 머지 버튼을 보다가 발견했고 크게 화를 냈다. 원인은 11-18 에 넣은 폴더 훑기가 `rm -rf C:/` 에서 훅 제한 시간을 넘긴 것 — 윈도우에서만 드러난다.

**How to apply:**
- 푸시 뒤 보고에는 CI 결과(맥·윈도우·version)를 함께 적는다. 아직 도는 중이면 끝날 때까지 기다린다.
- 계획서에 "CI 를 필수 검사로" 같은 GitHub 설정 항목이 있으면 워크플로 파일 추가와 별개로 실제 설정 여부를 `gh api repos/<owner>/<repo>/branches/main/protection` 으로 확인한다 — 2026-10-22 에 워크플로만 넣고 필수 지정을 빠뜨려 한 달간 보호 규칙이 없었다(2026-11-24 에 필수 검사 3개 적용).
- 관련: [[feedback-report-after-full-tests]], [[feedback-finish-then-report-once]].
