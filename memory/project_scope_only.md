---
name: gugbab-claude는 프로젝트 scope 전용 — 글로벌 설정 금지
description: 모든 에이전트/스킬/훅/규칙/CLAUDE.md는 gugbab-claude/.claude/에만 두고 project-install.sh로 이식. ~/.claude에 심볼릭/절대경로/전역 CLAUDE.md 등 어떤 것도 추가 금지
type: project
originSessionId: 0d50be35-5012-479d-82c9-84f0edba18f5
---
gugbab-claude는 "다른 프로젝트에 export해서 팀원 누구든 동일한 환경에서 작업하게 하는 것"이 목적이다. 따라서 이 프로젝트에서 만들어지는 모든 산출물은 프로젝트 scope에만 존재해야 한다.

**Why:** 사용자가 전역 설정을 전부 정리하며 "앞으로도 여기서 작업된 건 다 이렇게 동작해야 한다"고 명시적 피드백. 글로벌(~/.claude)에 심볼릭 링크, 절대경로 훅, 전역 CLAUDE.md 등을 두면:
- 이 머신에서만 동작하고 팀원/다른 머신에서 재현 불가
- export 대상 프로젝트의 자급자족성(self-contained) 훼손
- Claude Code가 gugbab-claude와 무관한 폴더에서도 이 규칙을 적용 → 오염

**How to apply:**
- 새 에이전트·스킬·훅·규칙 추가 시 반드시 `gugbab-claude/.claude/{agents,skills,hooks,rules}/` 아래에만 생성
- `~/.claude/agents/`, `~/.claude/rules/`, `~/.claude/skills/` 에 심볼릭 링크/파일 추가 금지
- `~/.claude/settings.json`에 절대경로 훅 선언 금지 (프로젝트 scope settings.json에 상대경로로만 선언)
- `~/.claude/CLAUDE.md`에 프로젝트 관련 내용 쓰지 말 것. 범용 규칙은 `gugbab-claude/CLAUDE.md`, export용은 `examples/CLAUDE.template.md`에 반영
- `~/.claude/settings.json`에는 오직 플러그인 설치(`extraKnownMarketplaces` + `enabledPlugins`)처럼 **사용자 개인 머신 전용으로 필요한 항목만** 허용
- 새 훅/에이전트를 만들었다면 `project-install.sh`의 복사 로직에 포함되는지 확인. 포함 안 되면 이식 시 누락됨
- README.md의 에이전트·스킬 목록과 `project-install.sh`의 필터 목록이 어긋나지 않게 유지

**체크리스트 (변경 후):**
1. 해당 파일이 `gugbab-claude/` 안에 있는가
2. `project-install.sh`가 이 파일을 타겟 프로젝트로 복사하는가
3. `~/.claude/` 아래에 이 파일의 그림자(심볼릭·복사본)가 생기지 않았는가
4. README.md 목록·구조도가 업데이트됐는가
