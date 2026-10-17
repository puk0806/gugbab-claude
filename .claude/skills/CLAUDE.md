@.claude/rules/creation-workflow.md
@.claude/rules/info-verification.md

## 파일·폴더 규칙

스킬 파일: `.claude/skills/{name}/SKILL.md`
검증 문서: `docs/skills/{category}/{name}/verification.md`

- 스킬 폴더는 **1단**(`.claude/skills/{name}/`)이어야 한다 — Claude Code는 `.claude/skills/<name>/SKILL.md`만 스킬로 등록한다. 카테고리 폴더로 한 단계 더 중첩하면 스킬 목록에 뜨지 않는다(2026-10-05 평탄화).
- 카테고리는 검증 문서 위치(`docs/skills/{category}/`)로만 정한다. 래퍼에서 켜고 끄는 묶음(블록)은 `relations.json` 의 `blocks` 로 정한다 — 새 스킬은 블록 하나에 넣는다(relation-guard 가 확인).
- `{name}`은 전체 카테고리에서 유일해야 하고, 카테고리 이름(`frontend`·`backend` 등)과 같으면 안 된다.

SKILL.md frontmatter 필수:
```yaml
---
name: {스킬-이름}
description: {한 줄 설명}
---
```

## README 업데이트

스킬 추가·수정·삭제·이름변경 시 `docs/skills/{category}/README.md` 목록, README "무엇이 들어 있나" 스킬 수, `docs/CHANGELOG.md` 업데이트 로그를 반드시 동기화한다 (@.claude/rules/readme-update.md).
