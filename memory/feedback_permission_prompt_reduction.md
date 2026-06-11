---
name: permission 프롬프트 줄이기 작업 맥락
description: defaultMode acceptEdits / permission 키 단순화 / hook 경로 $CLAUDE_PROJECT_DIR 절대화는 모두 allow 팝업 감소 목적의 의도된 변경
type: feedback
originSessionId: 17bf93f9-5626-4899-85c1-759c68ca0539
---
`.claude/settings.json` 및 `examples/settings/util.json`에 들어간 다음 변경들은 사용자가 "allow 팝업이 자꾸 뜨니 해결해달라"고 요청한 결과로 수행한 의도된 변경이다.

- `defaultMode`: `auto` → `acceptEdits` (Write/Edit 자동 수락)
- permissions.allow의 `Write(**)`, `Edit(**)`, `Read(**)` → `Write`, `Edit`, `Read` (정확한 권한 키), `Glob`, `Grep` 추가
- 모든 hook command 경로를 `node .claude/hooks/...` → `node $CLAUDE_PROJECT_DIR/.claude/hooks/...`로 절대화 (작업 디렉토리 의존 제거)

**Why:** 사용자가 같은 권한 프롬프트에 반복적으로 응답하는 것을 비효율로 인식. 작업 흐름 유지를 위해 안전한 범위에서 자동 수락 정책으로 전환을 명시 요청.

**How to apply:** 위와 같은 변경이 working tree에 남아 있으면 "왜 바뀌었는지" 묻기 전에 이 맥락을 먼저 떠올린다. 사용자가 권한 프롬프트 관련 불편을 호소하면 fewer-permission-prompts 스킬 또는 위 세 가지 패턴(defaultMode/permission 단순화/hook 경로 절대화)을 후보로 제안한다.
