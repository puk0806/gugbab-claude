# nexacro-screen-converter

> 넥사크로 17 화면과 분석·명세 결과를 받아 정해진 대응 규칙대로 Next.js(App Router) 화면 초안을 만드는 변환 에이전트 (사람 검토 전제)

| 항목 | 내용 |
|------|------|
| 파일 | `.claude/agents/frontend/nexacro-screen-converter.md` |
| 모델 | Sonnet (maxTurns 30) |
| 도구 | Read, Write, Edit, Glob, Grep, Bash |
| 호출 | 사용자 직접 호출 (웨이브 단위 화면 변환) |
| 템플릿 | nexacro(15) |

## 역할

원본 해석(Dataset·transaction·버튼·Grid·팝업·검증) → 대응 결정(매핑 스킬 표) → 페이지·컴포넌트·API 훅·zod 스키마·AG Grid 설정 작성 → 변환표(`docs/migration/converted/<화면ID>.md`: 원본→새 코드 위치, TODO, 필요한 API 계약) 작성.
원본 파일은 수정하지 않고, 대응 규칙에 없는 것은 `TODO(migration)`으로 남긴다. AG Grid 에디션은 프로젝트 결정을 따른다.

## 함께 쓰는 자산

`nexacro-17-xfdl-anatomy`, `nexacro-to-react-mapping`, `nextjs`, `ag-grid`, `tanstack-query`, `form-handling` 스킬(서버 측 Zod 검증 상세는 `zod-schema-validation` — 설치된 경우). 동등성 검증은 `migration-parity-tester`.

## 설계 근거

- 공개된 넥사크로→React 자동 변환 도구·전환 사례·변환률 근거가 없어 "규칙 기반 재작성 + 사람 검토"로 설계했다 (2026-10-08 조사)
