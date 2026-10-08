# spec-reviewer

> 레거시 스펙 문서(docs/spec/)의 근거(파일:줄) 누락·근거와 내용 불일치·빈 칸·CRUD 완전성·추적 끊김을 검토해 PASS / NEEDS_REVISION 판정을 내는 검토 에이전트

| 항목 | 내용 |
|------|------|
| 파일 | `.claude/agents/validation/spec-reviewer.md` |
| 모델 | Sonnet |
| 도구 | Read, Glob, Grep (읽기 전용) |
| 호출 | `legacy-spec-extractor`가 마지막 단계에 호출, 또는 사용자 직접 |
| 템플릿 | spec-extraction(14) |

## 검토 항목

근거 존재 · 근거 일치(표본을 실제로 열어 대조) · 필수 칸 · CRUD 완전성(테이블마다 C·R·U·D, 다중 Create 표시) · 화면→API→SQL→테이블 추적 · 인벤토리 대비 누락 · 비밀 정보 유출 · 사용 여부 기재

근거 불일치나 비밀 정보가 1건이라도 있으면 NEEDS_REVISION.

## 설계 근거

- CRUD 매트릭스 완전성 규칙(엔티티마다 C·R·U·D 최소 1개, Create 다중이면 중복 의심) — DePaul IS315 강의자료
- LLM 산출물의 주장마다 인용을 확인하고 못 찾으면 철회 — Anthropic 환각 감소 가이드
