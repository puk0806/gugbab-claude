---
name: project_in_session_auto_update_2026-10-23
description: "켜 둔 세션도 하루에 한 번 자동 업데이트 — wrapper-version-check UserPromptSubmit 이 24시간 지나면 self-update 를 뒤에서 띄움, update.lock 추가"
metadata:
  node_type: memory
  type: project
  originSessionId: e56d6dae-5bbb-4b87-9782-cf342f4a6e7a
  modified: 2026-10-23T00:54:54.712Z
---

2026-10-23 사용자 요청: "세션이 켜져 있는 동안 하루에 한 번 정도는 버전을 체크해서 업데이트"하고, 묻는 창이 아니라 **실행 때처럼 자동 업데이트**. 브랜치 `fix/harness-write-location-2026-10-22` 에 함께 넣어 PR(v1.1.2).

- 실행 때 확인은 그대로(1시간 간격, `cli/update.js` INTERVAL_MS).
- wrapper-version-check 에 UserPromptSubmit 를 추가했다. `state/update-check.json` 에서 24시간(SESSION_INTERVAL_MS)이 지났으면 `node <하네스>/cli/main.js self-update` 를 detached 로 띄운다. 이때 GUGBAB_LAUNCH 는 빼서 넘긴다.
- 업데이트 안내는 하네스 커밋마다 한 번이다. 설정 폴더 `.gugbab-update-notified` 에 남기고, SessionStart 가 이미 알렸으면 생략한다. 재시작 표시 `.gugbab-restart` 도 남긴다.
- `cli/update.js` 에 `state/update.lock` 을 추가했다. 10분 넘은·깨진·미래 잠금은 넘겨받고, 결과는 `locked`.
- manifest.json 은 생성 파일이다. settings.json 을 고친 뒤 `node scripts/build-manifest.js` → `node scripts/build-defaults-doc.js` 순서로 다시 만든다(손으로 고치면 build-manifest.test 가 실패).

**Why:** 래퍼는 실행할 때만 확인해서, 며칠 켜 둔 세션은 새 버전을 받지 못했다.

**How to apply:**
- 실세션 시험은 stream-json 입력으로 한 세션에 질문 두 개를 보낸다. 세션이 뜬 뒤 확인 시각을 25시간 전으로 돌려야 한다. 실행 때 확인(1시간)과 세션 중 확인(24시간)이 같은 시각 파일을 써서 동시에 만족시킬 수 없기 때문이다(E2E 5번).
- `-p` 세션이면 래퍼가 재시작 표시를 지우고 "다음 실행부터 반영"이라고 알린다.
- 같은 PR: [[project_harness_write_location_fix_2026-10-23]]
