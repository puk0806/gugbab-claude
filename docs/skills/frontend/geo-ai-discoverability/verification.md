---
skill: geo-ai-discoverability
category: frontend
version: v1
date: 2026-06-01
status: APPROVED
---

# geo-ai-discoverability 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `geo-ai-discoverability` |
| 스킬 경로 | `.claude/skills/frontend/geo-ai-discoverability/SKILL.md` |
| 검증일 | 2026-06-01 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (OpenAI, Anthropic, Perplexity, Google, Apple, Meta, llmstxt.org)
- [✅] 공식 GitHub / 2차 소스 확인 (Cloudflare 블로그, Wired·Forbes 보도, SearchEngineLand)
- [✅] 최신 정책 기준 내용 확인 (2026-06 기준, 6~12개월 재검증 권장 명시)
- [✅] AI 크롤러 User-agent 7개 회사·14종 정리
- [✅] llms.txt 표준 상태(비공식)와 형식 정리
- [✅] 인용 친화 콘텐츠 구조 패턴 (답변 우선 문단, FAQPage JSON-LD)
- [✅] GEO 측정 한계와 우회책 정리
- [✅] 윤리·법적 이슈(Perplexity robots.txt 무시 사례) 정리
- [✅] 흔한 실수 7개 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | llms.txt 표준 Jeremy Howard 명세 | llmstxt.org + Answer.AI 원문 + 회의론 자료 확보 |
| 조사 2 | WebSearch | OpenAI GPTBot/OAI-SearchBot/ChatGPT-User 공식 문서 | 공식 developers.openai.com/api/docs/bots 확인 |
| 조사 3 | WebSearch | Anthropic ClaudeBot/Claude-User/Claude-SearchBot 정책 | support.claude.com 공식 문서 + legacy 식별자(anthropic-ai, claude-web) 확인 |
| 조사 4 | WebSearch | Google-Extended Vertex AI Gemini 학습 토큰 | developers.google.com Google-Extended 문서 확인, Googlebot과 독립 평가 사실 확인 |
| 조사 5 | WebSearch | PerplexityBot / Perplexity-User 공식 문서 | docs.perplexity.ai 확인 + robots.txt 무시 보도 자료 |
| 조사 6 | WebSearch | Applebot-Extended / Meta-ExternalAgent / Meta-ExternalFetcher / CCBot | support.apple.com + developers.facebook.com 확인 |
| 조사 7 | WebSearch | Princeton GEO 논문 KDD 2024 | arXiv:2311.09735 (Aggarwal et al.) 학술 출처 확보 |
| 조사 8 | WebSearch | FAQPage JSON-LD schema.org 2026 | Google FAQ rich results 2026-05 축소 발표 확인 |
| 조사 9 | WebSearch | AI citation tracking GA4 server log 측정 | SparkToro 70% 누락, OtterlyAI llms.txt 0.1% 측정 |
| 조사 10 | WebSearch | Perplexity stealth crawler Cloudflare lawsuit | Wired·Forbes 2024 + Cloudflare 2025-08 + Nikkei/News Corp 분쟁 |
| 조사 11 | WebSearch | llms.txt 회의론 — Google John Mueller 발언 | "No AI system currently uses llms.txt" 공개 발언 확인 |
| 교차 검증 | WebFetch | llmstxt.org / OpenAI bots / Anthropic 8896518 / Perplexity docs / Applebot 119829 / Answer.AI 2024-09-03 | 6개 공식 1차 소스 직접 확인 |
| 작성 | Write + Edit | SKILL.md 약 360행 | 정확한 User-agent 문자열·정책·체크리스트 포함 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| OpenAI Crawlers (공식) | https://developers.openai.com/api/docs/bots | ⭐⭐⭐ High | 2026-06-01 | GPTBot/1.3, OAI-SearchBot/1.3, ChatGPT-User/1.0 정확한 UA 확인 |
| Anthropic Crawler Policy (공식) | https://support.claude.com/en/articles/8896518 | ⭐⭐⭐ High | 2026-06-01 | ClaudeBot/Claude-User/Claude-SearchBot 3종 공식 명시 |
| Perplexity Crawlers (공식) | https://docs.perplexity.ai/docs/resources/perplexity-crawlers | ⭐⭐⭐ High | 2026-06-01 | PerplexityBot/1.0, Perplexity-User/1.0 UA 문자열 확인 |
| Google-Extended (공식) | https://developers.google.com/search/docs/crawling-indexing/google-extended | ⭐⭐⭐ High | 2026-06-01 | Googlebot과 독립 평가, 토큰 성격 |
| About Applebot (공식) | https://support.apple.com/en-us/119829 | ⭐⭐⭐ High | 2026-06-01 | Applebot vs Applebot-Extended 구분 |
| Meta Web Crawlers (공식) | https://developers.facebook.com/docs/sharing/webmasters/crawler | ⭐⭐⭐ High | 2026-06-01 | Meta-ExternalAgent / Meta-ExternalFetcher 정의 |
| llms.txt 명세 | https://llmstxt.org/ | ⭐⭐ Medium | 2026-06-01 | 비공식 표준, 제안자 Jeremy Howard |
| llms.txt 원 제안 글 | https://www.answer.ai/posts/2024-09-03-llmstxt.html | ⭐⭐ Medium | 2024-09-03 | 표준 동기와 형식 예시 |
| Princeton GEO 논문 | https://arxiv.org/abs/2311.09735 | ⭐⭐⭐ High | 2024 | KDD 2024 peer-reviewed (Aggarwal et al.) |
| Google FAQPage 가이드 | https://developers.google.com/search/docs/appearance/structured-data/faqpage | ⭐⭐⭐ High | 2026-05 | 2026-05-07 이후 rich results 축소 발표 |
| Cloudflare Perplexity stealth crawler | https://blog.cloudflare.com/perplexity-is-using-stealth-undeclared-crawlers-to-evade-website-no-crawl-directives/ | ⭐⭐ Medium | 2025-08 | 1차 인프라 제공자 관찰 |
| OtterlyAI llms.txt 측정 | (90일간 62,100 봇 요청 중 84건 0.1%) | ⭐ Medium-Low | 2025 | 회의론 근거 |
| SparkToro AI referral 측정 | 70.6% AI 트래픽 GA4 누락 | ⭐⭐ Medium | 2026-01 | 측정 한계 근거 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (각 회사 공식 페이지 직접 확인)
- [✅] 버전·날짜 정보 명시 (검증일 2026-06-01, "6~12개월 재검증 필요" 명시)
- [✅] deprecated 패턴(claude-web, anthropic-ai legacy)에 "legacy" 주의 표기
- [✅] 코드 예시 실행 가능 (robots.txt 문법, JSON-LD 스키마 유효)
- [✅] 표준 미확정 영역(llms.txt, FAQ rich results)에 "> 주의:" 명시적 표기

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (skill-md-guard 훅 통과)
- [✅] 핵심 개념 설명 포함 (GEO 정의, 학습 vs 인용 구분)
- [✅] 코드 예시 포함 (robots.txt 2종, JSON-LD, HTML microdata, nginx log grep)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (전략 A/B 비교)
- [✅] 흔한 실수 패턴 포함 (7개 패턴)
- [✅] 부록에 모든 공식 URL 정리

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 robots.txt 작성에 바로 활용 가능
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 없음)
- [✅] 정책 결정자(사이트 운영자)와 개발자 양쪽 관점 균형

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-01 skill-tester → general-purpose 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-01
**수행자**: skill-tester → general-purpose (도메인 에이전트 미등록, general-purpose로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. GPTBot 차단 + ClaudeBot 허용 + OAI-SearchBot·Claude-SearchBot 허용 robots.txt 작성법**
- PASS
- 근거: SKILL.md "1-1. 주요 AI 크롤러 한눈에 보기" 표 (GPTBot=학습, OAI-SearchBot=인덱싱·인용, ClaudeBot=학습, Claude-SearchBot=인덱싱·인용 각각 독립 분류), "1-2. 학습용 vs 인용용의 차이" 표 및 "1-3. 권장 robots.txt 템플릿" 전략 A
- 상세: 4개 크롤러의 역할 구분이 명확히 표로 제시되어 있으며, 전략 A 템플릿에서 학습용(GPTBot)=Disallow, 인용용(OAI-SearchBot, Claude-SearchBot)=Allow 패턴을 직접 확인함. ClaudeBot 허용은 전략 A에서 Disallow 블록에서 해당 항목만 제거하거나 Allow로 설정하면 됨.

**Q2. llms.txt와 robots.txt의 차이, 두 파일을 같이 두면 충돌하는가**
- PASS
- 근거: SKILL.md "2-4. robots.txt와의 차이 (혼동 주의)" 비교 표 (목적·형식·표준 상태·위치 4항목), "llms.txt는 robots.txt를 대체하지 않는다. 두 파일을 같이 둬도 충돌이 없다." 명시
- 상세: robots.txt=RFC 9309 공식 표준 / llms.txt=비공식 제안 구분, 두 파일 공존 가능 여부까지 명시. 섹션 7-1의 혼동 anti-pattern(robots.txt에 markdown 문법 넣는 실수)도 명확히 차단됨.

**Q3. SaaS 문서 사이트가 ChatGPT·Perplexity에 인용되려면, llms.txt 만들면 자동 인용되는가**
- PASS
- 근거: SKILL.md "1-3 전략 A" (OAI-SearchBot, PerplexityBot Allow 설정), "3-1 답변 우선 문단", "3-2 FAQ 청크 + JSON-LD FAQPage", "5. 관련 표준과의 관계" (sitemap.xml, schema.org 기반), "7-7. llms.txt 만들면 AI에 인용된다는 환상"
- 상세: 인용 전략(검색 크롤러 허용 + 구조화 콘텐츠)이 섹션 1·3·5에 구체적으로 제시됨. llms.txt 과대 기대 anti-pattern을 섹션 7-7이 명확히 차단함("현재 어떤 메이저 AI 플랫폼도 llms.txt 사용을 공식 확인하지 않았다").

### 발견된 gap

없음. 3개 질문 모두 SKILL.md 내용만으로 정확하고 완결된 답변 도출 가능.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (표준·정책 정리형 — content test PASS = APPROVED 전환 가능)
- 최종 상태: APPROVED

---

### (참고) 이전 기록 — 테스트 보류 상태 (2026-06-01 최초 작성 시)

본 스킬 최초 작성 세션에서는 skill-tester 호출 금지 지시에 따라 단계 5가 미실시 상태로 보류됨.
status는 PENDING_TEST로 유지하며, 별도 세션에서 skill-tester로 검증 예정이었음.
(위 "실제 수행 테스트" 섹션이 해당 보류를 해소한 기록이다.)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (6개 공식 1차 소스 직접 fetch 확인) |
| 구조 완전성 | ✅ (skill-md-guard 훅 통과) |
| 실용성 | ✅ (robots.txt·JSON-LD·서버 로그 grep 즉시 사용 가능) |
| 에이전트 활용 테스트 | ✅ (2026-06-01 skill-tester 수행, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester를 통한 실사용 테스트 (2026-06-01 완료, 3/3 PASS)
- [❌] 6개월 후 재검증 — AI 크롤러 정책은 분기 단위로 변동, 다음 재검증 권장일 2026-12-01 (차단 요인 아님, 정기 유지보수 항목)
- [❌] llms.txt 채택률 변화 추적 — 주요 AI 플랫폼 중 한 곳이라도 공식 사용을 확인하면 본문 "비공식" 표기 갱신 (차단 요인 아님, 선택 보강)
- [❌] FAQ rich results 2026-06 이후 완전 종료 상태 재확인 (차단 요인 아님, 선택 보강)
- [❌] Perplexity 법적 분쟁 결과 확정 시 본문 "보고된 사실" 표현 갱신 (차단 요인 아님, 선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-01 | v1 | 최초 작성 — 7개 회사 14종 AI 크롤러 정책, llms.txt 표준 비공식 상태, 인용 친화 콘텐츠 구조, GEO 측정 한계, 윤리·법적 이슈, 흔한 실수 7종 포함 | skill-creator |
| 2026-06-01 | v1 | 2단계 실사용 테스트 수행 (Q1 robots.txt 크롤러 독립 제어 / Q2 llms.txt vs robots.txt 차이 / Q3 SaaS 인용 전략 + llms.txt 환상 검증) → 3/3 PASS, APPROVED 전환 | skill-tester |
