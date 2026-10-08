# 템플릿: spec-extraction (14)

레거시 레포(Java Spring·MyBatis/iBATIS, React, 넥사크로 17)에서 **마이그레이션·재구축용 스펙을 뽑아 `docs/spec/` 에 문서화**하는 애드온 템플릿. 스택 템플릿과 병행 선택하는 것이 기본 용법이고 단독 설치도 된다.

```
./project-install.sh  →  번호 입력: 15,14   (넥사크로 + Spring 레거시 — 이전 작업과 함께)
                                      5,14    (Java 11 + SB 2.5 + MyBatis 레거시)
                                      2,14    (React SPA 레거시)
                                      14      (단독 — 스펙 문서만 뽑는 분석용 체크아웃)
```

> 2026-10-08 신설. seo-geo(11)와 같은 **애드온** — 입력 순서가 `14,5`여도 스택 템플릿 뒤로 정렬되어 스택의 CLAUDE.md 가 베이스가 된다.
> 자체로는 dev·TypeScript 템플릿이 아니다. 스택과 조합하면 dev 훅·TS 훅·언어 규칙은 **스택 쪽 판정**을 따른다.

---

## 에이전트 (9종 — 작성 도구 y 시 12종)

| 카테고리 | 에이전트 | 설명 |
|----------|---------|------|
| domain | [legacy-spec-extractor](../../.claude/agents/domain/legacy-spec-extractor.md) | 모듈 단위 스펙 추출 오케스트레이터 — 화면·API·데이터 사용·비즈니스 규칙·CRUD 매트릭스·추적표 |
| validation | [spec-reviewer](../../.claude/agents/validation/spec-reviewer.md) | 근거(파일:줄) 누락·불일치·빈 칸·CRUD 완전성·추적 끊김 검토 (PASS / NEEDS_REVISION) |
| domain | [codebase-domain-analyst](../../.claude/agents/domain/codebase-domain-analyst.md) | 코드베이스 역분석 → 도메인 구조 진단 (재사용) |
| domain | [api-spec-designer](../../.claude/agents/domain/api-spec-designer.md) | 추출한 API 명세 → OpenAPI 3.1 정리 (재사용) |
| validation | [qa-engineer](../../.claude/agents/validation/qa-engineer.md) | 현행 동작 기준 테스트 계획·적대적 E2E 시나리오 (재사용) |
| validation | [fact-checker](../../.claude/agents/validation/fact-checker.md) | 사실·수치·주장 교차 검증 |
| validation | [source-validator](../../.claude/agents/validation/source-validator.md) | URL·문서 신뢰도 판정 |
| research | [web-searcher](../../.claude/agents/research/web-searcher.md) | 검색 축별 소스 탐색 전담 |
| meta | [claude-code-guide](../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI 사용법·설정 가이드 |

> 화이트리스트 방식 — 스택 에이전트(java-backend-developer·frontend-developer 등)는 병행 선택한 스택 템플릿이 union 으로 보탠다.
> 스펙 추출 에이전트 2종은 이 템플릿·all 전용이다. nexacro(15) 단독에도 들어가지 않는다.

---

## 스킬 (5종)

| 분류 | 스킬 |
|------|------|
| 방법론·양식 | [spec-extraction-method](../../.claude/skills/spec-extraction-method/SKILL.md) — 명세 양식 4종 + 배치·연동, 공통 칸(근거·확신도·사용 여부) |
| Java·MyBatis/iBATIS | [spring-mybatis-spec-extraction](../../.claude/skills/spring-mybatis-spec-extraction/SKILL.md) — 매핑 합성·매퍼 XML 파싱·CRUD 매트릭스·배치/연동 목록 |
| React | [react-spec-extraction](../../.claude/skills/react-spec-extraction/SKILL.md) — 라우트·화면·API 호출 추출 |
| 현행 동작 고정 | [characterization-testing](../../.claude/skills/characterization-testing/SKILL.md) — 특성화·승인·스냅샷 테스트 작성 절차 |
| 넥사크로 화면 해석 | [nexacro-17-xfdl-anatomy](../../.claude/skills/nexacro-17-xfdl-anatomy/SKILL.md) — `.xfdl`·Dataset·transaction 구조 (nexacro(15)와 공유) |

> spec 카테고리 전부 + 넥사크로 화면 해석 1종. 나머지 넥사크로 이전 스킬·SB1→2·iBATIS 이관 스킬은 nexacro(15) 소유다.

---

## 훅 (공통 18종)

단독 설치 시 공통 훅만 들어간다(seo-geo·util 과 동일). dev 훅·TypeScript 훅은 **병행한 스택 템플릿**이 결정한다 — `5,14`면 java 가 dev 6종을, `15,14`면 nexacro 가 dev 5종(레거시 프로파일 — tdd-guard 제외)을 보탠다.

공통 18종 목록은 [java-spring-legacy 템플릿 문서](./java-spring-legacy.md#훅-24종--공통-18--개발-전용-6)의 공통 섹션과 같다.

---

## 규칙 (기본 3종 — 작성 도구 y 시 8종)

| 규칙 | 설명 |
|------|------|
| [git.md](../../.claude/rules/git.md) | Git 커밋 컨벤션 |
| [info-verification.md](../../.claude/rules/info-verification.md) | 외부 정보 검증 원칙 — 공식 문서 1순위, 교차 검증 |
| [task-workflow.md](../../.claude/rules/task-workflow.md) | 작업 착수 전 확인 절차 |

> 작성 규칙 5종은 "작성 도구" 옵션 y 일 때만. 언어 규칙(java.md 등)·adversarial-testing.md 는 병행 스택 템플릿이 보탠다.

---

## 슬래시 커맨드 (10종)

util 3종(commit·create-pr·context-prime) + dev 6종(create-plan·fix-pr·update-docs·tdd-implement·agent-status·sparc-refine) + **`/spec-extract`**(이 템플릿·all 전용). Codex 옵션 y 면 codex-review 추가.

`/spec-extract [범위]` — 범위·스택·산출 위치를 확인받은 뒤 `legacy-spec-extractor` 로 추출하고 `spec-reviewer` 로 검토, `docs/spec/README.md` 요약을 보여준다. 소스 수정·빌드 실행·커밋은 하지 않는다.

---

## CLAUDE.md

단독 설치면 [`examples/CLAUDE.spec-extraction.md`](../../examples/CLAUDE.spec-extraction.md)가 베이스로 복사된다.
병행 설치(`5,14`·`15,14`)면 스택 템플릿의 CLAUDE.md 가 베이스가 되고(입력 순서가 `14,5`여도 애드온은 뒤로 정렬), **"스펙 추출 작업 원칙" 도메인 섹션이 규칙 참조 앞에 append** 되며 **금지 사항 항목은 베이스 `## 금지 사항` 끝에 병합**된다(`<!-- spec-extraction 금지 사항 -->` 표식).

**사전 구성 내용:**
- 금지 사항 — 대상 레포 소스 수정, 근거(파일:줄) 없는 항목, 비밀 값(비밀번호·키·접속 정보) 기록, 추출 목적의 빌드·배포 스크립트 실행
- 작업 원칙 — 결과는 대상 레포 `docs/spec/`, 모든 항목에 근거·확신도·사용 여부, 개선안은 명세와 분리, 스택별 추출 스킬, `/spec-extract` 흐름

---

## settings.json

단독이면 `scripts/gen-settings.js` 플래그 없이(공통 훅만) 생성. 병행 시 스택 템플릿의 플래그(`--dev`·`--typescript`·`--legacy`)를 따른다.

---

## 재설치·전환 수렴

애드온을 빼는 재설치(`15,14→15`, `5,14→5`, `14→util`)에서는 spec 스킬·스펙 에이전트 2종·`/spec-extract` 가 조합 조건 없이 prune 목록에 기록되고, 매니페스트 해시가 일치하는(=손대지 않은) 파일과 짝 docs 만 삭제된다. 사용자가 수정한 사본은 보존된다. nexacro 가 함께 소유하는 `nexacro-17-xfdl-anatomy` 는 `15` 가 남아 있으면 유지된다.

---

## 설치 검증 (2026-10-08)

기본 옵션(전부 엔터) 실측: 스킬 5 · 에이전트 9 · 훅 18 · 규칙 3 · 커맨드 10 · 매니페스트 `templates: ["spec-extraction"]`.
`scripts/template-separation.test.js`(단독·`15,14` 순서 정규화·`5,14`·`15,14→15` 수렴) · `scripts/template-ownership.test.js`(소유 매트릭스) · `scripts/installed-refs.test.js`(설치본 참조 무결성).
