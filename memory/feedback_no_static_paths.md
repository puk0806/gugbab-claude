---
name: 문서 작성 시 정적(절대) 경로 사용 금지
description: README·가이드·보고서 등 모든 문서에서 `/Users/lf/...` 같은 정적 절대 경로 작성 금지. 상대경로 또는 placeholder로 다른 사람도 이해 가능하게 작성
type: feedback
originSessionId: f24cdbb9-b53f-4700-bb64-2aa4cf700adb
---
문서(README, 가이드, 보고서, 작업 지도 등)를 작성할 때 **본인 PC 절대 경로(`/Users/lf/Desktop/...`, `~/Library/...` 등)를 직접 박지 않는다.** 상대경로 또는 placeholder 표현을 사용해 *다른 사람·다른 환경·다른 PC*에서도 이해 가능하게 작성한다.

**Why:** 2026-05-06 사용자 명시적 지적 — "정적주소를 README 저딴데 남기는거야 다른사람들 햊갈리잖아". 본인 PC 경로는 본인에게만 의미 있고, 협업자·미래의 본인(다른 PC)·repo 공개 시 모두에게 노출 시 가독성·이식성을 해친다. 또한 사용자명·디스크 위치 등 *불필요한 개인 정보*가 노출된다.

**How to apply:**

| 상황 | 금지 | 권장 |
|------|------|------|
| 프로젝트 내부 파일 참조 | `/Users/lf/Desktop/gugbab-workspace/00_gugbab-claude/akrasia-thesis-draft.md` | `./akrasia-thesis-draft.md` 또는 `akrasia-thesis-draft.md` (프로젝트 루트 기준) |
| 프로젝트 루트 표현 | `/Users/lf/Desktop/gugbab-workspace/00_gugbab-claude/` | `<프로젝트 루트>/` 또는 `./` |
| 홈 디렉토리 표현 | `/Users/lf/.claude/...` | `~/.claude/...` |
| 사용자별로 다른 해시 경로 | `/Users/lf/.claude/projects/-Users-lf-Desktop-...` | `~/.claude/projects/<프로젝트-해시>/` |
| 외부 워크스페이스 예시 | `/Users/lf/Desktop/my-project` | `~/path/to/your/project` 또는 `<대상 프로젝트 경로>` |

**문서 상단에 경로 규약 명시 권장**:
> 본 문서의 모든 경로는 **프로젝트 루트 기준 상대 경로**다. `<프로젝트 루트>` = 본 repo가 클론된 경로.

**예외 (절대 경로 허용)**:
- 코드·스크립트 내부 절대경로가 *본질적 동작*에 필요한 경우 (단, 변수·환경변수로 추상화 우선)
- 외부 공식 사이트 URL (`https://...`) — 이건 정적 경로 아님
- 메모리 파일 자체 (`.claude/memory/...`)는 본 시스템 내부 구조라 OK
- Bash 도구 호출 시 *실행에 필요한* 절대경로 (도구의 요구 사항)

**적용 범위**: 본 repo의 README, docs/, .claude/agents/ description, .claude/skills/ SKILL.md, research-notes 등 *모든 문서*. 새 문서 작성 시 1차 점검, 기존 문서 수정 시 동시 정리.

**자가 점검 명령**: `grep -rn "/Users/" <문서 경로>` — 0건 확인 후 저장.
