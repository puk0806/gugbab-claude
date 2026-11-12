---
name: geo-ai-discoverability
description: GEO(생성형 AI 답변 인용) 영역에서 빠르게 바뀌어 모델이 모를 법한 사실만 모은 스킬 — 회사별 AI 크롤러 User-agent·용도 표(OAI-AdsBot·Claude-Agent·Google-Agent·Meta-WebIndexer 등 신규 포함)와 robots.txt 준수 공식 입장, Anthropic aipref 학습 거부 신호, Google 크롤러 문서 이전, Search Console 생성형 AI 토글·성능 보고서, llms.txt v2(2026-08-10) 현황(발행 vs 소비, Google 미사용 명시), Google AI 최적화 가이드 입장, GEO 연구 수치 주의, 네이버 AI 브리핑 포인터.
---

# GEO — AI 크롤러·llms.txt 현황과 연구 주의

> 소스: 각 AI 회사 공식 크롤러 문서(OpenAI, Anthropic, Google, Perplexity, Apple, Meta) + Princeton GEO 논문(arXiv:2311.09735, KDD 2024) + llmstxt.org 명세 **v2 (2026-08-10)** + Google 생성형 AI 최적화 공식 가이드 https://developers.google.com/search/docs/fundamentals/ai-optimization-guide + Google AI 기능 문서 https://developers.google.com/search/docs/appearance/ai-features + Cloudflare 블로그·Radar
> 검증일: 2026-11-09 (재검증 3차, 이전 2026-09-28) — 갱신 사유: ⓐ OpenAI `OAI-AdsBot` 1.0 용도 정정(광고 랜딩 페이지 검사, 학습 미사용)·robots.txt 준수 서술 정정 ⓑ Anthropic `Claude-Agent`(호스팅 브라우저) 추가 ⓒ Anthropic 2026-10-30~ IETF aipref 기반 학습 거부 신호 인식 추가 ⓓ Meta `Meta-WebIndexer`(Meta AI 검색 인용) 추가 ⓔ Google-Extended·Google-Agent·Perplexity·Applebot-Extended·llms.txt v2 는 재확인 결과 동일.
> 이전 검증: 2026-09-28 (재검증 2차, 이전 2026-08-26 / 최초 작성·검증 2026-06-01) — 갱신 사유: ① Google이 크롤러 문서를 `developers.google.com/search/docs/crawling-indexing/*` → `developers.google.com/crawling/docs/*`로 이전(2025-11)하며 `google-extended` 단독 페이지가 폐지되고 `google-common-crawlers` 페이지의 앵커로 통합됨 — 구 URL 404 확인, 링크 정정 ② **Google-Agent** 신규 추가(2026-03-20 공식 발표, 문서 최종 갱신 2026-08-19) — Project Mariner 등 Google 인프라 위 에이전트가 사용자 요청으로 웹을 탐색·행동하는 user-triggered fetcher, robots.txt를 일반적으로 무시한다고 공식 명시 ③ OpenAI GPTBot·OAI-SearchBot 버전 1.3→1.4 확인(동작·정책 변경 없음) ④ 그 외 크롤러 UA·llms.txt v2·Google AI 기능 정책은 재확인 결과 8월 26일 기재 내용과 동일(VERIFIED 유지)
> **이 영역은 표준화 진행 중**입니다. 본 문서는 "현재 시점의 합의된 권장사항"으로 한정해 작성됐으며, 6~12개월 단위로 재검증이 필요합니다.
>
> 공식 문서 URL: OpenAI https://developers.openai.com/api/docs/bots · Anthropic https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler · Anthropic 봇 IP https://claude.com/crawling/bots.json · Google-Extended https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended · Google-Agent https://developers.google.com/crawling/docs/crawlers-fetchers/google-agent · Perplexity https://docs.perplexity.ai/docs/resources/perplexity-crawlers · Applebot https://support.apple.com/en-us/119829 · Meta https://developers.facebook.com/docs/sharing/webmasters/crawler · Common Crawl https://commoncrawl.org/ccbot · llms.txt https://llmstxt.org/ · https://llmstxt.org/changes.html · Search Console 생성형 AI 제어 https://support.google.com/webmasters/answer/16908024 · 성능 보고서 https://support.google.com/webmasters/answer/16984139

---

## 1. GEO 연구 수치 주의

> 주의: GEO는 학계에서도 2024년부터 본격 논의된 신생 영역이다. Princeton·Georgia Tech·Allen AI 공동 연구(Aggarwal et al., KDD 2024)가 첫 peer-reviewed 논문으로 알려져 있다. "AI 검색에서 가시성 최대 40% 향상" 같은 수치는 *해당 실험 환경*에서의 결과이며 일반화 가능성에 대해서는 의견이 갈린다.

> 주의: 답변 우선 문단·FAQ 청크 같은 인용 친화 구조는 *경험적 권장사항*이지 보장된 인과관계가 아니다. AI 모델·검색 시스템의 인용 알고리즘은 공개되지 않았다.

## 2. AI 크롤러 — 회사별 User-agent (2026-11-09 기준)

| 회사 | User-agent | 용도 |
|------|------------|------|
| OpenAI | `GPTBot` | AI 모델 학습 |
| OpenAI | `OAI-SearchBot` | ChatGPT search 인덱싱·인용 |
| OpenAI | `ChatGPT-User` | 사용자 요청 시 실시간 페이지 fetch |
| OpenAI | `OAI-AdsBot` (1.0) | ChatGPT 광고로 제출된 랜딩 페이지의 정책 준수·안전성 검사 + 광고 노출 관련성 판단. 제출된 광고 페이지만 방문, 수집 데이터는 학습에 미사용 |
| Anthropic | `ClaudeBot` | AI 모델 학습 |
| Anthropic | `Claude-User` | 사용자 요청 시 실시간 fetch |
| Anthropic | `Claude-SearchBot` | 검색 품질 개선 |
| Anthropic | `Claude-Agent` | Anthropic 호스팅 브라우저가 사용자 지시로 사이트에서 작업 수행(agentic browser). UA 예 `compatible; Claude-Agent/1.0` (support.claude.com 18234133) |
| Google | `Google-Extended` | Gemini·Vertex AI 학습·grounding (크롤러가 아니라 robots.txt 토큰) |
| Google | `Google-Agent` | 사용자 요청 시 Google 인프라상 에이전트(예: Project Mariner)의 웹 탐색·행동 수행 |
| Perplexity | `PerplexityBot` | 검색 인덱스 구축 |
| Perplexity | `Perplexity-User` | 사용자 요청 시 실시간 fetch |
| Apple | `Applebot-Extended` | Apple Intelligence 학습 |
| Meta | `Meta-ExternalAgent` | Llama 학습·AI 인덱싱 |
| Meta | `Meta-WebIndexer` | Meta AI 검색 결과 품질 개선 — 허용 시 Meta AI 답변에서 인용·링크 |
| Meta | `Meta-ExternalFetcher` | 사용자 요청 시 link preview·AI fetch |
| Common Crawl | `CCBot` | 공개 웹 크롤 데이터셋(다수 LLM 학습에 사용) |
| ByteDance | `Bytespider` | 검색·추천 인덱스 + Doubao 등 자사 LLM 학습 데이터 수집 — **접근 가능한 공식 문서 없음** |

분류: **학습용**(GPTBot·ClaudeBot·Google-Extended·Applebot-Extended·Meta-ExternalAgent·CCBot·Bytespider) / **인덱싱·검색용**(OAI-SearchBot·Claude-SearchBot·PerplexityBot·Meta-WebIndexer — 차단하면 AI 검색 인용에서 사라짐) / **사용자 요청 fetch·에이전트**(ChatGPT-User·Claude-User·Claude-Agent·Perplexity-User·Meta-ExternalFetcher·Google-Agent). 학습만 막고 인용은 허용하려면 이 구분대로 블록을 나눈다(일부 크롤러는 한 블록에 User-agent 하나만 정확히 인식 — 블록 분리 권장).

> 주의 (2026-09-28 확인): Google은 크롤러 문서 체계를 2025-11부로 `developers.google.com/search/docs/crawling-indexing/*` 에서 `developers.google.com/crawling/docs/*` 로 이전했다. "Google의 크롤링 인프라가 검색 외 여러 제품에 공유되기 때문"이라는 것이 공식 사유다. 이 과정에서 `google-extended` 전용 페이지는 폐지되고 `google-common-crawlers` 페이지의 앵커(`#google-extended`)로 통합됐다 — 구 URL은 2026-09-28 기준 404.

- `Google-Extended`를 막아도 **일반 구글 검색 노출에는 영향이 없다**(실제 크롤링은 Googlebot). Googlebot 자체를 막으면 검색에서 사라진다.
- `Google-Agent` UA 에는 `(compatible; Google-Agent; +https://developers.google.com/crawling/docs/crawlers-fetchers/google-agent)`가 포함된다.

> 주의: **Bytespider는 이 표에서 유일하게 1차 공식 문서가 없는 크롤러다.** ByteDance는 접근 가능한 영문 크롤러 정책 페이지·IP 목록·robots.txt 준수 선언을 제공하지 않는다(웹마스터 안내는 `zhanzhang.toutiao.com`에 있으나 중국 외부에서 접근이 막혀 있다). 서버 로그상 UA `Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)`는 다수 로그·봇 디렉터리에서 일치하지만 **1차 소스로는 미검증**이다. 학습/인덱싱 분리 UA 가 없어 "학습만 차단"이 불가 — 차단은 ByteDance 서비스 노출 포기 여부의 사업 판단이다.
>
> Cloudflare 1차 관측(2025-05·2025-07 발표): Bytespider는 2024-05 AI 크롤러 트래픽의 **42%로 1위**였으나 2025-05에는 **7.2%(5위)**, 2025-07에는 AI 크롤러 기준 **2.4%**까지 하락했다(요청 수 기준 -85%). Cloudflare *Verified Bots* 목록(조건: robots.txt 준수)에 ByteDance 크롤러는 없다.

> 주의: Anthropic의 `anthropic-ai`, `claude-web`은 로그에 남아있을 수 있는 *legacy* 식별자다. 2026년 현재 공식 문서는 `ClaudeBot` / `Claude-User` / `Claude-SearchBot` 3종을 정식 식별자로 명시한다. 신규 robots.txt는 새 이름을 사용하되, 기존 정책 호환을 위해 legacy 식별자도 함께 남겨두는 사이트가 많다.

> 주의 (2026-11-09 확인): Anthropic 은 `Claude-Agent`(호스팅 브라우저)를 크롤러·fetcher 3종과 **별도 트래픽**으로 분류한다. 문서는 robots.txt 준수 여부를 밝히지 않고, 식별은 UA 의 `Claude-Agent` 토큰 + `claude.com/.well-known/sail` 의 IP 목록 대조를 권한다(UA 는 위조 가능). 막으면 사용자가 Claude 에게 그 사이트 작업을 맡길 수 없다.
>
> 주의: Anthropic 은 **2026-10-30부터 IETF aipref 작업반 초안 기반의 기계 판독 "AI 학습 거부" 신호를 인식**한다고 공식 문서에 밝혔다. robots.txt 에 `ClaudeBot` 지정 규칙이 있으면 그 규칙이 일반 설정보다 우선한다. 신호의 이름·문법은 문서에 없고 "표준이 진화 중이라 해석 방식이 바뀔 수 있다"고 명시 — > 주의: 미검증(문법). 당분간 학습 차단은 `ClaudeBot` robots.txt 규칙으로 하는 것이 확실하다.

## 3. robots.txt 준수 — 공식 입장과 보고된 미준수

**회사 스스로 "적용 안 될 수 있다"고 명시 (1차 소스):**
- OpenAI `ChatGPT-User`: *"Because these actions are initiated by a user, robots.txt rules may not apply."* 같은 문서는 robots.txt 로 관리하는 태그를 `OAI-SearchBot`·`GPTBot` 두 개로 명시한다(`OAI-AdsBot`은 robots.txt 동작을 따로 밝히지 않음 — 2026-11-09 확인).
- Perplexity `Perplexity-User`: *"generally ignores robots.txt rules"*.
- Google `Google-Agent`(2026-08-19 갱신): *"Because the fetch was requested by a user, these fetchers generally ignore robots.txt rules."*

→ 사용자 요청 fetch 계열은 robots.txt 로 막히지 않는 것이 공식 입장이다. 실제로 막으려면 WAF·IP(OpenAI·Anthropic·Perplexity 는 IP 대역 JSON 공개)·인증 레벨 통제.

**제3자 측정으로 보고된 미준수:**
- TollBit *State of the Bots* 2026 상반기(2026-08 공개, 자체 네트워크 측정): robots.txt 로 명시 disallow 한 유럽 사이트의 절반 가까이에서 Bytespider 가 disallow URL 에 도달. `ChatGPT-User`·`Youbot`도 유사 수준, 식별된 AI page fetcher 전체 약 15%. 방법론은 "운영사 문서가 뭐라 주장하든 disallow URL 요청은 전부 bypass 로 집계".
  > 주의: 이는 *TollBit 네트워크 표본*의 관측치이며 ByteDance의 공식 반박·해명은 확인되지 않았다. 독립 인프라 사업자의 Bytespider 전용 미준수 보고서는 2026-08-26 현재 확인되지 않았다.
- Perplexity(2024-06): Wired·Forbes·독립 연구자(Robb Knight)가 robots.txt 무시·미등록 IP 크롤 보고. Cloudflare(2025-08): Perplexity *stealth* 크롤러가 WAF·robots.txt 를 우회한다는 연구(수만 도메인, 매일 수백만 요청). News Corp·BBC·Forbes·Wired·Nikkei 등의 법적 조치·항의(2024~2025).

> 주의: 위 사례는 *보고된 사실*이며, 법적 판단이 확정된 것은 아니다.

## 4. Google — robots.txt 밖의 제어·계측 (2026-06 신설)

Search Console **`Search generative AI` 설정**(2026-06-03): AI Overviews·AI Mode 노출만 켜고 끄는 토글. robots.txt·`Google-Extended`와 **별개 축**이며 일반 검색 순위 영향 없음. 값은 `Include`(기본) / `Exclude` / `Inherit from parent`. `Exclude` 시 노출과 트래픽·노출수 집계가 모두 사라지고, 반영 1~2일·캐시 콘텐츠는 더 오래 남을 수 있다. 학습은 막지 않으므로 학습 통제는 `Google-Extended`로 별도.

> 주의: 2026-06 발표 시점 기준 **영국 사이트 대상 제한 테스트로 시작해 순차 확대** 중이다. 본인 속성에 토글이 안 보일 수 있다.

**Search Generative AI performance report**(2026-06-03, Search·Discover 두 종류): AI 기능에 등장한 노출수·URL·국가·기기·기간. 일부 사이트 순차 롤아웃 중이고, ChatGPT·Perplexity·Claude 인용은 잡지 못한다 — 그 외 플랫폼 인용을 표준 방식으로 측정하는 도구는 2026-08-26 기준 없다. 크롤러 방문 ≠ 인용이고, referrer(`chatgpt.com`·`perplexity.ai`·`gemini.google.com`·`claude.ai`·`copilot.microsoft.com`)는 클릭 트래픽만 잡힌다 — SparkToro 2026-01 측정 기준 약 70%의 AI referral 이 GA 에서 "Direct"로 분류돼 누락된다.

> 참고: 같은 발표에서 Google은 AI Overviews 월간 사용자 25억 명 이상, AI Mode 10억 명 이상이라고 밝혔다 (Google 공식 블로그, 2026-06-03).

**Google 생성형 AI 최적화 가이드**(2026-07-10 갱신) 요지:
- *"There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary."*
- 전용 파일·마크업 불필요: *"You don't need to create new machine readable files, AI text files, markup, or Markdown to appear in Google Search (including its generative AI capabilities), as Google Search itself doesn't use them."*
- 청킹 불필요(다주제 페이지도 이해), 구조화 데이터는 생성형 AI 노출의 요건이 아님. AEO/GEO 해킹(인위적 청킹·불필요한 AI 파일·조작된 멘션)보다 표준 SEO. 작동은 RAG + **query fan-out**.

> 주의: Google은 2026-05-07 이후 FAQ **rich results** 노출을 사실상 중단·축소하기로 했다고 발표했다. JSON-LD FAQPage 마크업 자체가 LLM 추출에 여전히 쓰인다는 말은 공식 확인이 없다.

## 5. llms.txt — v2 (2026-08-10) 현황

- 제안자 Jeremy Howard(Answer.AI), 2024-09-03. **IETF RFC·W3C 권고·ISO 표준 어느 것도 아닌** 커뮤니티 제안. 형식 Markdown, H1 1개가 유일한 필수 요소.

| 구분 | 확인된 사실 (1차 소스) |
|------|------------------------|
| **발행** | llmstxt.org v2 명세는 OpenAI·Anthropic·Gemini 세 곳 모두 자사 개발자 문서에 llms.txt를 발행 중이라고 밝힌다. `code.claude.com/docs/llms.txt`·`platform.claude.com/llms.txt`·`docs.perplexity.ai/llms.txt`가 규격 파일을 반환함을 2026-08-26 직접 확인 |
| **권장** | Anthropic 엔지니어링 글(2025-09-11, *Writing effective tools for AI agents*): *"LLM-friendly documentation can commonly be found in flat `llms.txt` files on official documentation sites"* — 에이전트에 문서를 물릴 때의 표준 포맷으로 권장 |
| **소비(랭킹·인용 반영)** | **공식 확인 없음.** OpenAI·Anthropic·Perplexity 모두 크롤러 문서에서 llms.txt 를 언급하지 않는다(2026-08-26 확인) |
| **명시적 부정** | **Google 은 "Google Search 는 쓰지 않는다"고 공식 문서화** — 랭킹에 도움도 해도 되지 않는다 |

> 정리: **llms.txt는 "AI 검색 랭킹 신호"가 아니라 "에이전트가 필요할 때 참조하는 문서 인덱스"다.** v2 명세도 *"our expectation was that llms.txt would mainly be useful for inference rather than training"* 이라고 못박는다.

> 주의: 채택률 수치는 반드시 출처·시점을 병기한다. OtterlyAI 측정(2025년, 90일간 AI 봇 요청 62,100건 중 `/llms.txt` 요청 84건 = 0.1%)은 **2025년 시점 크롤러 요청 기준**이며, 대화형 에이전트가 사용자 요청으로 fetch하는 경우는 잡히지 않는다. 이 값을 "2026년에도 아무도 안 쓴다"의 근거로 쓰지 말 것 — 2026-08-26 기준 재측정 자료는 확인되지 않았다.

> 주의: 미검증 — "Claude Desktop / claude.ai가 retrieval 과정에서 llms.txt를 준수한다", "Perplexity가 llms.txt로 페이지 선택 우선순위를 정한다"는 주장이 3rd-party 블로그에 돌지만, **양사 공식 문서에서 확인되지 않는다.** 인용하지 말 것.

**v1 → v2 변경 (2026-08-10)**

| 항목 | v1 | v2 |
|------|----|----|
| 발견 방법 | 루트 `/llms.txt` 관례 | `<link rel="alternate" type="text/markdown">`·`rel="describedby"` 링크 관계(HTML 또는 HTTP 헤더) 신설 |
| 마크다운 URL | `page.html.md`(덧붙이기)만 | 덧붙이기 / 교체(`page.md`) 둘 다 허용 |
| 하위 경로 파일 | 규정 없음 | 그 경로 이하를 커버, **가장 구체적인 파일이 우선** — 사이트 일부만 참여 가능 |
| 소비 모델 | 컨텍스트 확장 도구(`llms_txt2ctx`) 전제 | "에이전트가 보고 링크를 따라간다" |
| `## Optional` | 기계적 생략 규칙 | 관례로만 유지 |

> 주의: **v1의 `llms-ctx.txt` / `llms-ctx-full.txt` 개념은 v2 명세에서 빠졌다.** `/llms-full.txt`는 명세 밖의 커뮤니티 관례다. 기존 문서에서 `llms-ctx*.txt`를 "공식 명세"라고 인용하고 있다면 갱신 대상이다.

## 6. 국내 — 네이버 AI 브리핑 (포인터)

네이버 AI 브리핑(2025-03 출시)은 공식 발표 기준 월 3,000만 명·통합검색 쿼리 약 20%(2026년 말 약 40% 목표)에 적용되고, **인용 횟수를 직접 집계해 창작자 보상에 사용**한다. 출처 선정 기준은 공식 문서로 공개되지 않았고 **AI 브리핑만 빼는 옵트아웃 수단도 없다**(Google 토글과 대조). 외부 도메인은 네이버 웹문서 색인(Yeti 허용·sitemap·RSS)이 전제. 상세 → `naver-seo-specifics` §2-2.
