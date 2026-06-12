# validation 에이전트

사실 검증, 보안 감사, 성능 측정, 학술 심사, SEO·접근성 점검 등 다양한 검증·평가 작업 전담 에이전트 모음.

| 에이전트 | 설명 |
|---------|------|
| [fact-checker](../../../.claude/agents/validation/fact-checker.md) | 단일 클레임을 복수 독립 소스로 교차 검증 → VERIFIED / UNVERIFIED / DISPUTED |
| [source-validator](../../../.claude/agents/validation/source-validator.md) | URL·레포·문서·블로그 신뢰도 평가 → TRUST / CAUTION / REJECT |
| [qa-engineer](../../../.claude/agents/validation/qa-engineer.md) | PRD 수용 기준 → 테스트 계획서·Playwright E2E 코드·회귀 체크리스트 |
| [pr-reviewer](../../../.claude/agents/validation/pr-reviewer.md) | PR diff 코드 리뷰 → Critical/Major/Minor/Nit 등급별 코멘트 |
| [security-auditor](../../../.claude/agents/validation/security-auditor.md) | OWASP Top 10 + PIPA/GDPR 등 17개 영역 보안·개인정보 종합 진단 |
| [seo-auditor](../../../.claude/agents/validation/seo-auditor.md) | SEO·GEO·웹표준 통합 감사 (HTML·메타·구조화 데이터·CWV·robots 등 10영역) |
| [a11y-auditor](../../../.claude/agents/validation/a11y-auditor.md) | WCAG 2.2 A/AA 기준 접근성 자동 점검 + 수동 점검 9개 시나리오 |
| [content-quality-reviewer](../../../.claude/agents/validation/content-quality-reviewer.md) | E-E-A-T·Helpful Content 기준 콘텐츠 품질 진단 |
| [seo-content-writer-coach](../../../.claude/agents/validation/seo-content-writer-coach.md) | SEO·E-E-A-T·검색 의도·네이버 특화 기준으로 콘텐츠 초안 코칭 |
| [build-perf-benchmarker](../../../.claude/agents/validation/build-perf-benchmarker.md) | hyperfine·번들 분석기·lhci로 빌드·번들·dev 서버·Lighthouse 성능 측정 |
| [perf-report-writer](../../../.claude/agents/validation/perf-report-writer.md) | 벤치마크 결과 → Executive Summary·통계 해석·권고 포함 이해관계자용 보고서 |
| [abstract-reviewer](../../../.claude/agents/validation/abstract-reviewer.md) | 학술 초록·키워드 평가 (KCI/APA/Springer/Elsevier 기준 PASS/NEEDS_REVISION) |
| [argument-reviewer](../../../.claude/agents/validation/argument-reviewer.md) | 철학·인문학 논문 전제-결론 연결·순환 논증·논리 오류 탐지 |
| [citation-checker](../../../.claude/agents/validation/citation-checker.md) | 학술 논문 본문 인용 ↔ 참고문헌 누락·불일치·표기 오류 대조 |
| [peer-review-simulator](../../../.claude/agents/validation/peer-review-simulator.md) | KCI·JME 등 학술지 익명 동료 심사 시뮬레이션 (Accept~Reject + point-by-point) |
| [dream-safety-classifier](../../../.claude/agents/validation/dream-safety-classifier.md) | 꿈 텍스트 위기 신호 5카테고리 분류 (자해·트라우마·폭력 등) → JSON 반환 |
| [dream-interpretation-prompt-tester](../../../.claude/agents/validation/dream-interpretation-prompt-tester.md) | 꿈 해몽 Claude 프롬프트 5축 품질 평가 → PASS/NEEDS_REVISION/FAIL |
| [dream-image-safety-classifier](../../../.claude/agents/validation/dream-image-safety-classifier.md) | 꿈 시각화 이미지·프롬프트 이중 안전 분류 (DALL-E/Imagen 정책 위반 포함) |
