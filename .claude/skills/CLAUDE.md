@.claude/rules/creation-workflow.md
@.claude/rules/info-verification.md

## 파일·폴더 규칙

스킬 파일: `.claude/skills/{category}/{name}/SKILL.md`
검증 문서: `docs/skills/{category}/{name}/verification.md`

SKILL.md frontmatter 필수:
```yaml
---
name: {스킬-이름}
description: {한 줄 설명}
---
```

## README 업데이트

스킬 추가·수정·삭제·이름변경 시 README.md 스킬 목록·스킬 수·업데이트 로그를 반드시 동기화한다.
