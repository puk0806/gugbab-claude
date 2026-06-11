---
name: project-skill-agent-frontmatter-upgrade-2026-06
description: anthropics/skills 레포 갭 분석 기반 스킬/에이전트 frontmatter 업그레이드 작업 진행 상태 (2026-06-06)
metadata: 
  node_type: memory
  type: project
  originSessionId: f4a3baef-a45f-4a59-835d-b4d6d8577d73
---

2026-06-06 시작. anthropics/skills 레포 분석 결과를 기반으로 gugbab-claude 프로젝트의 SKILL.md frontmatter, 에이전트 frontmatter, 훅을 순차 업그레이드 중.

**Why:** 공식 스펙 대비 미사용 필드들이 실용적 효과가 있음 (자동 호출 방지, plan 모드 강제, worktree 격리 등)

**How to apply:** 작업 재개 시 이 메모리 + 태스크 목록 확인

## 작업 목록

| 항목 | 대상 | 상태 |
|------|------|------|
| A1 | disable-model-invocation: true → devops 9개 + bundling-compiler | ✅ 완료 (2026-06-06) |
| A2 | user-invocable: false → humanities(19)+education(5)+architecture(2)+research(4)+meta(4) = 34개 | ✅ 완료 (2026-06-06) |
| A3 | context: fork + agent: general-purpose → research/(4) | ✅ 완료 (2026-06-06) |
| B1 | permissionMode: plan → devops-engineer, project-scaffolder, build-error-resolver | ✅ 완료 (2026-06-06) |
| B2 | isolation: worktree → skill-creator, agent-creator, project-scaffolder | ✅ 완료 (2026-06-06) |
| B3 | background: true → web-searcher, fact-checker, source-validator | ✅ 완료 (2026-06-06) |
| C1 | InstructionsLoaded 훅 → .claude/hooks/instructions-loaded.js + settings.json | ✅ 완료 (2026-06-06) |
| C2 | UserPromptSubmit 훅 → .claude/hooks/user-prompt-submit.js + settings.json | ✅ 완료 (2026-06-06) |

## A1 대상 스킬 경로 (disable-model-invocation: true)

```
.claude/skills/devops/docker-deployment/SKILL.md
.claude/skills/devops/github-actions/SKILL.md
.claude/skills/devops/github-actions-visual-regression/SKILL.md
.claude/skills/devops/n8n-workflow-design/SKILL.md
.claude/skills/devops/n8n-self-hosting/SKILL.md
.claude/skills/devops/n8n-webhook-patterns/SKILL.md
.claude/skills/devops/n8n-llm-integration/SKILL.md
.claude/skills/devops/n8n-error-handling/SKILL.md
.claude/skills/devops/site-migration-seo/SKILL.md
.claude/skills/frontend/bundling-compiler/SKILL.md
```

## A2 대상 스킬 경로 (user-invocable: false)

- humanities/ 전체 19개
- education/ 전체 5개
- architecture/ 전체 2개
- research/ 전체 4개
- meta/continuous-learning, meta/ralph-loop, meta/dream-*, meta/dream-safety-classifier-prompts, meta/dream-app-ab-testing-prompts

## A3 대상 스킬 경로 (context: fork)

- research/ 전체 4개 (systematic-literature-review, case-study-methodology, research-ethics-and-integrity, academic-databases-korean-humanities)

## B1 대상 에이전트 (permissionMode: plan)

```
.claude/agents/devops/devops-engineer.md
.claude/agents/meta/project-scaffolder.md
.claude/agents/backend/build-error-resolver.md
```

## B2 대상 에이전트 (isolation: worktree)

```
.claude/agents/meta/skill-creator.md
.claude/agents/meta/agent-creator.md
.claude/agents/meta/project-scaffolder.md
```

## B3 대상 에이전트 (background: true)

```
.claude/agents/research/web-searcher.md
.claude/agents/validation/fact-checker.md
.claude/agents/validation/source-validator.md
```
