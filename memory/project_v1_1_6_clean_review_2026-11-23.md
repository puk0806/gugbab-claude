---
name: project-v1-1-6-clean-review-2026-11-23
description: "v1.1.6 (feat/release-notes-2026-11-17) — 릴리스 노트 자동 생성, 확인 창 줄이기(python3 소스 쓰기 거부·프로젝트 셸 스크립트 자동 허용), 하네스 제작 묶음 기본 끔, 깨끗한 Claude 리뷰 묶음 추가"
metadata:
  node_type: memory
  type: project
  originSessionId: fcd01deb-5e2e-4ed8-8072-cbe66cb8d86f
  modified: 2026-11-24T00:18:26.794Z
---

v1.1.6 브랜치 `feat/release-notes-2026-11-17` 에 담은 것 (2026-11-17~23, 2026-11-23 커밋·푸시).

- **릴리스 노트**: 버전마다 `docs/release-notes/<버전> <요약>.md`, 없으면 PR 을 막음.
- **확인 창 줄이기**: 확인 창이 뜰 명령은 훅이 먼저 거부(꼭 필요하면 답변과 명령 설명에 "확인 창" 을 적어 알린 뒤). `python3`·`node` 코드로 프로젝트 소스를 쓰면 거부 → Edit 로 다시 하게 함(attendance 세션 보고). 프로젝트 안 셸 스크립트 실행(`sh scripts/x.sh`)은 자동 허용 — [[feedback-auto-allow-reads-only]] 의 사용자 승인 예외(mktemp 임시 폴더 삭제·자기 프로세스 pkill 과 함께).
- **기본 끔**: Codex 리뷰 묶음, 하네스 제작 묶음(`bundle:harness-authoring` 10개 — 이 레포만 `.gugbab.json` 으로 켬). `git stash` 차단, 보호 파일 Bash 이동·삭제 차단.
- **깨끗한 리뷰 묶음 `bundle:clean-review`(기본 켬)**: 훅 `clean-review-guard` + 룰 `clean-review.md` + 에이전트 `clean-reviewer`. Codex 리뷰가 돌지 않으면 코드를 바꾼 턴 끝에 대화 맥락 없는 리뷰어가 리뷰(구글 Elephant-Goldfish Model 참고). 최대 3라운드.

**Why:** Codex 가 기본 꺼짐(계정 400)이라 어디서도 적대적 리뷰가 돌지 않았다. 사용자가 "Codex 안 할 때 자동으로 깨끗한 Claude 리뷰어", "코드를 바꾼 턴마다", "기본으로 다 켬" 을 직접 정했다.

**How to apply:**
- 대화형 세션은 서브에이전트가 기본 백그라운드로 돈다(`-p` 는 앞에서 돎) → 훅이 서브에이전트 호출을 확인할 때는 `async_launched` + 완료 알림(`origin.kind: task-notification`)까지 봐야 한다. `-p` 실세션 시험만으로는 못 잡는다.
- 세션 중에 새로 만든 에이전트는 그 세션에서 바로 못 부를 수 있다("Agent type not found") — 훅은 이 경우 재시작 안내 후 통과.
- 이 세션 실측: 리뷰 라운드별 반영 6/8 → 3/5 → 1/4 → 0/5, 라운드당 6만~12만 토큰. 3라운드부터는 얻는 것이 거의 없음 → 상한 2·작은 변경 건너뛰기·반박한 지적 전달이 개선 후보(미결정).
- 리뷰 대상 확장자는 넓혔다(`.mts`·`.bash`·`.bat`·`.cmd`·`.ps1`·`.php` 등, 대소문자 무관 — 두 리뷰 훅이 같은 목록, 테스트로 강제).
- 2026-11-24 추가: 이번 턴에 커밋까지 한 코드도 리뷰 대상(커밋 시각 기준, 머지·턴 전 커밋 제외). `task-confirm-guard` 는 "…신경쓰지 말고 다 하고" 같은 전체 실행 지시를 승인으로 읽고, 메모리 공유 프로젝트의 `memory/*.md` 는 승인 전에도 쓸 수 있다. `bash-guard` 는 `d=>fs.existsSync('…/SKILL.md')` 같은 화살표 함수를 쓰기로 오판하지 않는다.
- 미결정: 리뷰어 성능 비교(과거 Fix 커밋으로 문제 세트) — 사용자가 "앞 작업 다 끝나고" 하기로 함.
- 다른 세션 보고 7건 중 이 레포에도 해당하는 4건(메모리 미러 Edit 차단, `node -e` 안 SKILL.md 오탐, stash 중복 알림 = stash 차단으로 해소, `~/gugbab` 읽기 = 이미 자동 허용)은 끝. 다른 프로젝트 전용 3건(옛 `.claude` 정리 명령 없음, acceptEdits 풀림, 래퍼 모드 룰 경로)은 사용자 지시("다른 프로젝트 신경쓰지 말고")로 다루지 않음.
- `wrapper-e2e` 가 사용량 한도 직전에 돌면 시험 세션이 답을 못 받아 3~4건 실패로 보인다 — 코드를 의심하기 전에 한도 풀린 뒤 다시 돌려 본다.
