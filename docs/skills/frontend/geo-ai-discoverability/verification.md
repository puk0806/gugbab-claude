---
skill: geo-ai-discoverability
category: frontend
version: v1.1
date: 2026-08-26
status: APPROVED
---

# geo-ai-discoverability 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `geo-ai-discoverability` |
| 스킬 경로 | `.claude/skills/frontend/geo-ai-discoverability/SKILL.md` |
| 검증일 | 2026-06-01 (최초) / **2026-08-26 (freshness 갱신)** |
| 검증자 | skill-creator |
| 스킬 버전 | v1.1 |

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

### 3-1. 2026-08-26 갱신 시 추가 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| llms.txt 명세 **v2** | https://llmstxt.org/ | ⭐⭐ Medium (제안 명세 1차) | 2026-08-10 개정 | 필수 요소·링크 관계·소비 모델 재정의. "OpenAI·Anthropic·Gemini가 문서용 llms.txt를 발행 중" 명시 |
| llms.txt v1→v2 변경점 | https://llmstxt.org/changes.html | ⭐⭐ Medium | 2026-08 | `llms-ctx*.txt` 제거, `## Optional` 기계적 의미 제거, 하위 경로 규정 |
| Google 생성형 AI 최적화 가이드 (신설) | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide | ⭐⭐⭐ High | 2026-07-10 갱신 | **"Google Search가 llms.txt·AI 텍스트 파일을 사용하지 않는다"** 원문 확인. 청킹·AEO/GEO 해킹 비권장 |
| Google AI 기능과 웹사이트 | https://developers.google.com/search/docs/appearance/ai-features | ⭐⭐⭐ High | 2025-12-10 갱신 | AI Overviews·AI Mode 별도 요건 없음, 스니펫 제어(nosnippet·max-snippet·data-nosnippet) |
| Search Console 생성형 AI 제어 | https://support.google.com/webmasters/answer/16908024 | ⭐⭐⭐ High | 2026 | Include/Exclude/Inherit 3값, 반영 1~2일, 학습은 별도(Google-Extended) |
| Search Console 생성형 AI 성능 보고서 (발표) | https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports | ⭐⭐⭐ High | 2026-06 | Search·Discover 2종, 노출수·페이지·국가·기기·기간 |
| Google 공식 블로그 — 사이트 소유자용 신규 제어·인사이트 | https://blog.google/products-and-platforms/products/search/new-controls-website-owners/ | ⭐⭐⭐ High | 2026-06-03 | AI Overviews 월 25억+·AI Mode 10억+ 사용자, 영국 제한 테스트 시작 |
| OpenAI 크롤러 문서 (재확인) | https://developers.openai.com/api/docs/bots | ⭐⭐⭐ High | 2026-08-26 조회 | `OAI-AdsBot` 등재 확인, ChatGPT-User "robots.txt rules may not apply" 원문 확인 |
| Anthropic 크롤러 문서 (재확인) | https://support.claude.com/en/articles/8896518 | ⭐⭐⭐ High | 2026-04-07 문서일 | ClaudeBot/Claude-User/Claude-SearchBot 3종 유지, IP 목록 `claude.com/crawling/bots.json` 신규 확인, llms.txt 언급 없음 |
| Perplexity 크롤러 문서 (재확인) | https://docs.perplexity.ai/docs/resources/perplexity-crawlers | ⭐⭐⭐ High | 2026-08-26 조회 | Perplexity-User "generally ignores robots.txt" 원문 확인, llms.txt 언급 없음 |
| Anthropic 엔지니어링 — Writing effective tools for AI agents | https://www.anthropic.com/engineering/writing-tools-for-agents | ⭐⭐⭐ High | 2025-09-11 | llms.txt를 LLM 친화 문서 포맷으로 **공식 권장**하는 유일한 1차 문장 확인 |
| Anthropic 문서 llms.txt 실물 | https://code.claude.com/docs/llms.txt · https://platform.claude.com/llms.txt | ⭐⭐⭐ High | 2026-08-26 조회 | 규격에 맞는 파일 반환 확인(발행 사실 1차 검증) |
| Cloudflare — From Googlebot to GPTBot | https://blog.cloudflare.com/from-googlebot-to-gptbot-whos-crawling-your-site-in-2025/ | ⭐⭐ Medium (1차 인프라 관측) | 2025-05 | Bytespider 42%(2024-05) → 7.2%(2025-05), 요청 -85% |
| Cloudflare — The crawl-to-click gap | https://blog.cloudflare.com/crawlers-click-ai-bots-training/ | ⭐⭐ Medium (1차 인프라 관측) | 2025-07 | Bytespider 14.1% → 2.4% |
| Cloudflare Verified Bots 정책 | https://developers.cloudflare.com/bots/concepts/bot/verified-bots/ | ⭐⭐⭐ High | 2026-08-26 조회 | verified 조건에 robots.txt 준수 포함, ByteDance 크롤러 미등재 확인 |
| TollBit — State of the Bots (2026 H1) | https://tollbit.com/bots/25q2/ | ⭐⭐ Medium (측정 주체 1차) | 2026-08 공개 | "Robots.txt and the Bypassing Problem" 섹션 존재 확인. 수치는 매체 요약 경유 |

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

### 4-5. 2026-08-26 갱신분 클레임 교차 검증 결과

**Bytespider**

| 클레임 | 판정 | 근거 |
|--------|------|------|
| Bytespider는 ByteDance가 운영하며 검색·추천 인덱싱과 LLM 학습 데이터 수집을 겸한다 | VERIFIED | Cloudflare 블로그(2025-05) "ByteDance's AI data collector" + 복수 봇 디렉터리 일치 |
| Bytespider UA 문자열 (`...(compatible; Bytespider; spider-feedback@bytedance.com)`) | **DISPUTED → `> 주의: 1차 소스 미검증` 표기 후 게재** | 다수 서버 로그·봇 디렉터리에서 동일 문자열 확인되나, **ByteDance 공식 문서로 확인 불가**(UA 참조 링크 `zhanzhang.toutiao.com`이 중국 외부에서 접근 불가). 접근 가능한 1차 공식 크롤러 페이지 부재를 본문에 명시 |
| ByteDance는 접근 가능한 공식 크롤러 문서·IP 목록·robots.txt 준수 선언을 제공하지 않는다 | VERIFIED (부재 확인) | 공식 도메인 대상 검색 + UA 참조 링크 접근 실패로 확인 (2026-08-26) |
| Cloudflare 관측: Bytespider 트래픽 42%(2024-05) → 7.2%(2025-05) → 2.4%(2025-07), 요청 -85% | VERIFIED | Cloudflare 블로그 2건(2025-05, 2025-07) 원문 직접 확인, 수치 상호 정합 |
| Cloudflare Verified Bots 목록에 ByteDance 크롤러 미등재 / verified 조건에 robots.txt 준수 포함 | VERIFIED | Cloudflare 공식 문서 직접 확인 |
| Bytespider가 robots.txt disallow URL에 접근한다 (§1-4 게재 여부) | **DISPUTED → 게재하되 측정 주체·방법론·한계 명시** | 1차 측정 주체(TollBit) 자체 네트워크 리포트 *State of the Bots 2026 H1*. 리포트 페이지에 해당 섹션 존재는 직접 확인, 세부 수치는 매체 요약 경유 → 본문에 "TollBit 표본 관측치", "ByteDance 공식 반박 미확인", "Cloudflare급 독립 인프라 사업자의 Bytespider 전용 보고서는 미확인"을 함께 기재. **1차 소스 조건은 '측정 주체가 자기 네트워크 데이터를 직접 발표'로 충족 판단** |
| Bytespider는 학습/인용용을 분리하는 별도 UA가 없다 | VERIFIED (부재 확인) | 공식 문서 부재 + 봇 디렉터리에서 단일 UA만 확인 → 본문에 "학습만 차단 전략 불가" 명시 |

**llms.txt 재검증 (기존 단정 정정)**

| 클레임 | 판정 | 근거 |
|--------|------|------|
| (기존) "OpenAI·Anthropic·Google·Microsoft·Perplexity 어느 곳도 llms.txt를 읽는다고 공식 확인한 바 없다" | **DISPUTED → 정정 게재** | *발행/권장/소비*를 구분하지 않아 부정확. 아래 4행으로 분해해 재작성 |
| Anthropic은 자사 문서에 llms.txt를 **발행**한다 | VERIFIED | `code.claude.com/docs/llms.txt`, `platform.claude.com/llms.txt` 직접 fetch — H1 + blockquote + H2 링크 리스트 규격 확인 |
| Anthropic은 llms.txt를 **공식 권장**한다 | VERIFIED | Anthropic 엔지니어링 공식 글(2025-09-11) 원문: *"LLM-friendly documentation can commonly be found in flat `llms.txt` files on official documentation sites (here's our API's)"* |
| Anthropic·OpenAI·Perplexity의 **크롤러가** llms.txt를 읽는다 | **UNVERIFIED → 본문에 "여전히 공식 확인 없음"으로 명시** | 3사 공식 크롤러 문서 전수 확인 결과 llms.txt 언급 없음 (2026-08-26) |
| "Claude Desktop·claude.ai가 retrieval에서 llms.txt를 준수한다" / "Perplexity가 llms.txt로 페이지 선택 우선순위를 정한다" | **UNVERIFIED → 본문에 '인용 금지'로 명시 기재** | 3rd-party 블로그 및 검색 AI 요약에만 등장. 양사 공식 문서에서 확인 불가. 원문 검증 실패로 채택하지 않음 |
| **Google Search는 llms.txt를 사용하지 않는다** | VERIFIED | Google 공식 가이드(2026-07-10) 원문 인용 확보 — 기존 John Mueller 발언(비공식)보다 상위 근거로 교체 |
| OtterlyAI 채택률 0.1%(62,100건 중 84건) | VERIFIED(값) / 시점 한정 | 값 자체는 기존 검증분 유지. **2025년 크롤러 요청 기준**임을 본문에 병기하고, 2026년 재측정 자료 부재를 명시 |
| llms.txt 명세는 **v2로 개정**(2026-08-10), 필수 요소는 H1 1개뿐, 링크 관계(`rel="alternate" type="text/markdown"`·`rel="describedby"`) 신설 | VERIFIED | llmstxt.org 본문 + changes.html 2건 직접 확인 |
| (기존) "명세 원문은 `llms-ctx.txt`/`llms-ctx-full.txt`를 언급한다" | **DISPUTED → 정정** | v2 명세에서 해당 파일 개념 제거됨. 본문을 "v1 개념이며 v2에서 빠짐"으로 수정 |

**Google AI 기능 2026 변경**

| 클레임 | 판정 | 근거 |
|--------|------|------|
| Google이 생성형 AI 최적화 공식 가이드를 신설(2026-07-10 갱신) | VERIFIED | `/search/docs/fundamentals/ai-optimization-guide` 직접 확인 |
| AI Overviews·AI Mode 노출에 별도 요건·특수 최적화가 없다 | VERIFIED | AI features 문서(2025-12-10) + 최적화 가이드(2026-07-10) 2개 공식 문서 일치 |
| 청킹·전용 AI 파일·전용 마크업 불필요, AEO/GEO 해킹 비권장 | VERIFIED | 최적화 가이드 원문 |
| Search Console `Search generative AI` 설정(Include/Exclude/Inherit)이 2026-06-03 도입 | VERIFIED | Search Console 도움말 + Google 공식 블로그(2026-06-03) 2개 소스 일치 |
| 해당 설정은 일반 검색 순위에 영향 없음, 반영 1~2일, 학습 통제는 Google-Extended로 별도 | VERIFIED | Search Console 도움말 원문 |
| 영국 사이트 대상 제한 테스트로 시작 | VERIFIED | Google 공식 블로그(2026-06-03) |
| 생성형 AI 성능 보고서(Search/Discover) 2026-06 도입, 노출수·페이지·국가·기기·기간 제공 | VERIFIED | Search Central 블로그 + Search Console 도움말 |
| AI Overviews 월 25억+ 사용자 / AI Mode 10억+ | VERIFIED | Google 공식 블로그(2026-06-03) |
| 성능 보고서에 **클릭 지표 포함 여부** | **UNVERIFIED → 본문에 클릭 언급하지 않음** | 공식 발표에서 노출수·페이지·국가·기기·기간만 확인. 클릭 포함 여부 미확인이라 서술에서 제외 |

**기타**

| 클레임 | 판정 | 근거 |
|--------|------|------|
| OpenAI 공식 문서가 ChatGPT-User에 대해 "robots.txt rules may not apply"라고 명시 | VERIFIED | OpenAI 크롤러 문서 원문 |
| Perplexity 공식 문서가 Perplexity-User에 대해 "generally ignores robots.txt rules"라고 명시 | VERIFIED | Perplexity 크롤러 문서 원문 |
| OpenAI에 `OAI-AdsBot`이 추가됨 | VERIFIED | OpenAI 크롤러 문서 원문 |
| Anthropic 크롤러 3종 구성 변경 없음 + IP 목록 `claude.com/crawling/bots.json` 제공 | VERIFIED | Anthropic 공식 문서(문서일 2026-04-07) |
| §4-2 로그 grep 예시에서 `Google-Extended` 제거 | 정정 반영 | Google-Extended는 **robots.txt 토큰이며 UA가 아니다**(스킬 §1-2 주의와 일치). 로그 UA 매칭 대상에서 제외하는 것이 정확 |

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
| freshness 재검증 | ✅ 2026-08-26 — Bytespider 추가, llms.txt v2·플랫폼 입장 정정, Google AI 기능 2026 변경 반영. VERIFIED 22건 / DISPUTED 4건(정정 또는 한계 명시 후 게재) / UNVERIFIED 3건(본문 미기재) |
| **최종 판정** | **APPROVED** (2026-08-26 재검증 후에도 유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester를 통한 실사용 테스트 (2026-06-01 완료, 3/3 PASS)
- [✅] 정기 재검증 1회차 수행 (2026-08-26) — 크롤러 표·llms.txt·Google AI 기능 전면 재확인
- [✅] llms.txt 채택률·플랫폼 입장 변화 추적 → v2 명세(2026-08-10) 및 Google 공식 부정 문구 반영 완료
- [❌] **다음 정기 재검증 권장일 2027-02-26** (분기 단위 정책 변동. 차단 요인 아님)
- [❌] ByteDance 공식 크롤러 문서·IP 목록 공개 여부 추적 — 공개 시 `1차 소스 미검증` 표기 해소 (차단 요인 아님)
- [❌] Bytespider robots.txt 준수에 대한 **독립 인프라 사업자(Cloudflare 등) 전용 보고서** 확보 시 §1-4 근거 승급 (차단 요인 아님)
- [❌] Search Console 생성형 AI 성능 보고서의 **클릭 지표 포함 여부** 확인 후 §4-0 보강 (현재 미검증이라 서술 제외)
- [❌] Search Console `Search generative AI` 제어의 **글로벌 일반 공개 시점** 확인 후 "영국 제한 테스트" 문구 갱신 (차단 요인 아님)
- [❌] FAQ rich results 2026-06 이후 완전 종료 상태 재확인 (차단 요인 아님, 선택 보강)
- [❌] Perplexity 법적 분쟁 결과 확정 시 본문 "보고된 사실" 표현 갱신 (차단 요인 아님, 선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-01 | v1 | 최초 작성 — 7개 회사 14종 AI 크롤러 정책, llms.txt 표준 비공식 상태, 인용 친화 콘텐츠 구조, GEO 측정 한계, 윤리·법적 이슈, 흔한 실수 7종 포함 | skill-creator |
| 2026-06-01 | v1 | 2단계 실사용 테스트 수행 (Q1 robots.txt 크롤러 독립 제어 / Q2 llms.txt vs robots.txt 차이 / Q3 SaaS 인용 전략 + llms.txt 환상 검증) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-08-26 | v1.1 | **freshness 갱신** — ① §1-1에 `Bytespider`(+`OAI-AdsBot`) 추가, UA·용도·**공식 문서 부재** 주의 명시 / §1-2·§1-3 템플릿 2종·§4-2 로그 grep에 반영 ② §1-4에 "회사가 공식 명시한 미준수"(ChatGPT-User·Perplexity-User)와 "제3자 측정 보고"(Bytespider/TollBit) 분리 신설 ③ **§1-5 신설** — Search Console `Search generative AI` 제어(2026-06) ④ §2 llms.txt 전면 재검증: *발행/권장/소비/명시적 부정* 4분할로 기존 단정 정정, **v2 명세(2026-08-10)** 반영, `llms-ctx*.txt` 서술 정정, §2-4 v1→v2 변경표 신설(기존 2-4 → 2-5) ⑤ **§3-5 신설** — Google 생성형 AI 최적화 공식 가이드(2026-07-10) ⑥ **§3-6 신설** — 네이버 AI 브리핑 요약 + `naver-seo-specifics` §2-2 포인터(중복 서술 없음) ⑦ **§4-0 신설** — Search Console 생성형 AI 성능 보고서 ⑧ `references/REFERENCE.md` §7-7 llms.txt 단정 정정 + 부록 공식 URL 8건 추가. UNVERIFIED 3건(Claude/Perplexity의 llms.txt 소비 주장, 성능 보고서 클릭 지표)은 본문 미기재. status APPROVED 유지 | skill-creator |
