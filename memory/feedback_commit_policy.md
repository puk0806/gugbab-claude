---
name: ""
description: 커밋·푸시는 사용자 명시 요청 시에만 — 제안도 금지. settings.json deny로 강제
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 9152b891-1df7-4c78-8301-10defaed293c
---

커밋·푸시는 사용자가 명시적으로 요청할 때만 실행한다.

**Why:** 사용자가 커밋 타이밍을 직접 제어하고 싶어 함. 자동 커밋뿐 아니라 "커밋할까요?" 같은 제안도 금지. 반복 위반 후 settings.json deny 목록으로 강제 적용됨.

**How to apply:**
- 파일 수정 완료 후 커밋·푸시 관련 언급 일절 금지
- "커밋할까요?" "푸시 진행할까요?" 같은 제안도 하지 않는다
- 사용자가 "커밋해줘"라고 하면: git commit 명령어를 알려주고 사용자가 `! git commit -m "..."` 직접 실행
- Bash 도구로 git commit·git push 실행 자체가 deny 목록에 의해 차단됨
