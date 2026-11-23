# validation 에이전트

사실 교차 검증, 앱 프롬프트 평가, 스펙 문서 검토, 마이그레이션 동등성 시험 등 독립 검증 에이전트 모음.

| 에이전트 | 설명 |
|---------|------|
| [clean-reviewer](../../../.claude/agents/validation/clean-reviewer.md) | 대화 맥락 없이 커밋 안 된 코드 변경만 보고 적대적 리뷰 (이해 확인→적대적 검토→준비 확인) → approve / needs-attention. 파일 수정 없음 (clean-review 묶음, 기본 켬 — Codex 리뷰가 돌지 않을 때 clean-review-guard 훅이 부름) |
| [fact-checker](../../../.claude/agents/validation/fact-checker.md) | 단일 클레임을 복수 독립 소스로 교차 검증 → VERIFIED / UNVERIFIED / DISPUTED |
| [dream-interpretation-prompt-tester](../../../.claude/agents/validation/dream-interpretation-prompt-tester.md) | 꿈 해몽 Claude 프롬프트 5축 품질 평가 → PASS/NEEDS_REVISION/FAIL |
| [fortune-interpretation-prompt-tester](../../../.claude/agents/validation/fortune-interpretation-prompt-tester.md) | 운세 해석 프롬프트 3축 평가 (톤·단정 회피·출력 포맷) → PASS/NEEDS_REVISION/FAIL |
| [spec-reviewer](../../../.claude/agents/validation/spec-reviewer.md) | 추출된 스펙 문서 검토 — 근거 누락·불일치·빈 칸·CRUD 완전성·추적 끊김 → PASS/NEEDS_REVISION (spec-extraction 템플릿) |
| [migration-parity-tester](../../../.claude/agents/validation/migration-parity-tester.md) | 마이그레이션 전후 동등성 테스트(조회·일괄 저장·오류) + 권한 우회·잘못된 입력 적대적 테스트 생성 (nexacro 템플릿) |
