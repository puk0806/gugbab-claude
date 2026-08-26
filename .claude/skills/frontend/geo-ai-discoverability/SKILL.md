---
name: geo-ai-discoverability
description: 생성형 AI 답변(ChatGPT, Claude, Perplexity, Google AI Overviews 등)에 사이트 콘텐츠가 인용·참조되도록 하는 GEO(Generative Engine Optimization) 영역의 현재 합의된 권장사항. AI 크롤러 robots.txt 정책, llms.txt 표준, 인용 친화 콘텐츠 구조를 다룬다.
---

# GEO — AI 검색·답변 엔진 발견 가능성 최적화

> 소스: 각 AI 회사 공식 크롤러 문서(OpenAI, Anthropic, Google, Perplexity, Apple, Meta) + Princeton GEO 논문(arXiv:2311.09735, KDD 2024) + llmstxt.org 명세 **v2 (2026-08-10)** + Google 생성형 AI 최적화 공식 가이드 https://developers.google.com/search/docs/fundamentals/ai-optimization-guide + Google AI 기능 문서 https://developers.google.com/search/docs/appearance/ai-features + Cloudflare 블로그·Radar
> 검증일: 2026-08-26 (갱신 사유: ① Bytespider 추가 ② llms.txt v2 명세 반영 및 "어느 플랫폼도 공식 확인 안 함" 단정 정정 ③ Google AI 기능 2026 변경(공식 최적화 가이드·Search Console 생성형 AI 제어·성능 보고서) 반영 ④ 네이버 AI 브리핑 포인터 추가 / 최초 작성·검증 2026-06-01)
> **이 영역은 표준화 진행 중**입니다. 본 문서는 "현재 시점의 합의된 권장사항"으로 한정해 작성됐으며, 6~12개월 단위로 재검증이 필요합니다.

---

## 0. 이 스킬이 다루는 것

전통 SEO는 "구글 검색 결과 페이지(SERP)에 노출"을 목표로 하지만, **GEO(Generative Engine Optimization)** 는 별개의 목표를 다룬다:

- ChatGPT가 답변 본문에 사이트를 인용할 것
- Perplexity의 "Sources" 패널에 노출될 것
- Google AI Overviews / Gemini의 답변에 참조될 것
- Claude의 웹 검색 결과에 포함될 것

용어는 GEO, AEO(Answer Engine Optimization), AI-SEO 등으로 혼용되지만 본 문서에서는 **GEO**로 통일한다.

> 주의: GEO는 학계에서도 2024년부터 본격 논의된 신생 영역이다. Princeton·Georgia Tech·Allen AI 공동 연구(Aggarwal et al., KDD 2024)가 첫 peer-reviewed 논문으로 알려져 있다. "AI 검색에서 가시성 최대 40% 향상" 같은 수치는 *해당 실험 환경*에서의 결과이며 일반화 가능성에 대해서는 의견이 갈린다.

---

## 1. AI 크롤러 robots.txt 정책 (가장 확실한 영역)

각 AI 회사는 자사 크롤러의 User-agent와 robots.txt 정책을 *공식 문서*로 명시하고 있다. 이것이 현재 GEO에서 가장 표준화된 영역이다.

### 1-1. 주요 AI 크롤러 한눈에 보기

| 회사 | User-agent | 용도 | 공식 문서 |
|------|------------|------|-----------|
| OpenAI | `GPTBot` | AI 모델 학습 | developers.openai.com/api/docs/bots |
| OpenAI | `OAI-SearchBot` | ChatGPT search 인덱싱·인용 | 동일 |
| OpenAI | `ChatGPT-User` | 사용자 요청 시 실시간 페이지 fetch | 동일 |
| OpenAI | `OAI-AdsBot` | 광고 관련 크롤 (2026 현재 공식 문서에 등재) | 동일 |
| Anthropic | `ClaudeBot` | AI 모델 학습 | support.claude.com (8896518) |
| Anthropic | `Claude-User` | 사용자 요청 시 실시간 fetch | 동일 |
| Anthropic | `Claude-SearchBot` | 검색 품질 개선 | 동일 |
| Google | `Google-Extended` | Gemini·Vertex AI 학습·grounding | developers.google.com/search/docs/crawling-indexing/google-extended |
| Perplexity | `PerplexityBot` | 검색 인덱스 구축 | docs.perplexity.ai/docs/resources/perplexity-crawlers |
| Perplexity | `Perplexity-User` | 사용자 요청 시 실시간 fetch | 동일 |
| Apple | `Applebot-Extended` | Apple Intelligence 학습 | support.apple.com/en-us/119829 |
| Meta | `Meta-ExternalAgent` | Llama 학습·AI 인덱싱 | developers.facebook.com/docs/sharing/webmasters/crawler |
| Meta | `Meta-ExternalFetcher` | 사용자 요청 시 link preview·AI fetch | 동일 |
| Common Crawl | `CCBot` | 공개 웹 크롤 데이터셋(다수 LLM 학습에 사용) | commoncrawl.org |
| ByteDance | `Bytespider` | 검색·추천 인덱스 + Doubao 등 자사 LLM 학습 데이터 수집 | **접근 가능한 공식 문서 없음** (아래 주의) |

**Bytespider User-Agent** (서버 로그 기준):
```
Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)
```

> 주의: **Bytespider는 이 표에서 유일하게 1차 공식 문서가 없는 크롤러다.** ByteDance는 접근 가능한 영문 크롤러 정책 페이지·IP 목록·robots.txt 준수 선언을 제공하지 않는다(웹마스터 안내는 `zhanzhang.toutiao.com`에 있으나 중국 외부에서 접근이 막혀 있다). 위 UA 문자열은 다수의 서버 로그·봇 디렉터리에서 일치가 확인되지만 **1차 소스로는 미검증**이다. 운영자(ByteDance)·용도(학습 및 인덱싱 수집)·대량 크롤 사실은 Cloudflare 관측 자료로 확인된다.
>
> Cloudflare 1차 관측(2025-05·2025-07 발표): Bytespider는 2024-05 AI 크롤러 트래픽의 **42%로 1위**였으나 2025-05에는 **7.2%(5위)**, 2025-07에는 AI 크롤러 기준 **2.4%**까지 하락했다(요청 수 기준 -85%). 또한 Cloudflare의 *Verified Bots* 목록(로그인 없이 열람 가능한 공식 문서)에 ByteDance 크롤러는 등재돼 있지 않다 — Cloudflare는 verified bot 조건으로 "robots.txt 준수"를 요구한다.

> 주의: Anthropic의 `anthropic-ai`, `claude-web`은 로그에 남아있을 수 있는 *legacy* 식별자다. 2026년 현재 공식 문서는 `ClaudeBot` / `Claude-User` / `Claude-SearchBot` 3종을 정식 식별자로 명시한다. 신규 robots.txt는 새 이름을 사용하되, 기존 정책 호환을 위해 legacy 식별자도 함께 남겨두는 사이트가 많다.

### 1-2. 학습용 vs 인용용의 차이 (중요)

크롤러는 크게 세 부류로 나뉘며, 각각 *독립적으로* 제어해야 한다:

| 분류 | 예시 | 차단 시 영향 |
|------|------|--------------|
| **학습용** | `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `Meta-ExternalAgent`, `CCBot`, `Bytespider` | 모델 학습에 미사용 — 다만 **AI 답변 인용에는 영향이 없거나 적음** |
| **인덱싱·검색용** | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot` | **차단하면 AI 검색 결과·인용에서 사라짐** |
| **사용자 요청 시 fetch** | `ChatGPT-User`, `Claude-User`, `Perplexity-User`, `Meta-ExternalFetcher` | 사용자가 명시적으로 URL 요청 시 동작 — robots.txt를 *무시할 수 있다*고 명시하는 회사도 있음(Perplexity 등) |

> 주의: `Bytespider`는 위 3분류에 깔끔히 들어가지 않는다. ByteDance는 이 UA 하나로 *검색·추천 인덱싱과 학습 데이터 수집을 함께* 수행하는 것으로 관측되며, 학습용/인용용을 분리하는 별도 UA를 공개하지 않았다. 따라서 "학습만 차단" 전략을 쓸 수 없고, 차단 여부는 *Doubao·Toutiao 등 ByteDance 서비스 노출을 포기할 것인가*라는 사업 판단으로 결정해야 한다.

> **GEO의 핵심 통찰:** "AI에 다 막아!"로 학습용·인용용을 한꺼번에 `Disallow: /` 하면, *학습은 막히지만 동시에 검색 결과·답변 인용 기회도 사라진다.* 학습은 차단하되 인용은 허용하는 게 GEO의 표준 전략이다.

> 주의: Google-Extended는 *크롤러가 아니라 robots.txt 토큰*이다. 실제 크롤링은 Googlebot이 하고, Google-Extended는 *수집된 데이터가 Gemini·Vertex AI 학습·grounding에 쓰일지 여부*만 제어한다. Googlebot 자체를 차단하면 일반 구글 검색에서도 사라지므로 주의한다.

### 1-3. 권장 robots.txt 템플릿

**전략 A: "학습은 차단, 인용은 허용" (GEO 권장 기본값)**

```
# 학습용 크롤러는 차단
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

User-agent: CCBot
Disallow: /

# ByteDance — 학습/인덱싱 분리 UA가 없어 전량 차단 or 전량 허용만 가능
# (준수 여부가 1차 소스로 확인되지 않음 → 실효 차단은 WAF/IP 레벨 병행 필요)
User-agent: Bytespider
Disallow: /

# 검색·인용용은 허용 (명시적으로 Allow)
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

# 사용자 요청 fetch는 허용 (사실상 무시될 수 있음)
User-agent: ChatGPT-User
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Perplexity-User
Allow: /

# 일반 검색 엔진은 그대로
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

**전략 B: "AI 전면 차단"**

```
# 모든 AI 관련 크롤러 차단 — 인용 기회도 함께 잃음을 인지할 것
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-User
User-agent: Claude-SearchBot
User-agent: anthropic-ai
User-agent: Google-Extended
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Applebot-Extended
User-agent: Meta-ExternalAgent
User-agent: Meta-ExternalFetcher
User-agent: CCBot
User-agent: Bytespider
Disallow: /
```

> 주의: robots.txt 명세상 여러 User-agent를 한 블록에 묶어도 동작은 하지만, 일부 크롤러는 한 블록당 User-agent 하나만 정확히 인식한다. 호환성을 위해 *블록 분리*를 권장한다.

### 1-4. robots.txt 무시 사례 (윤리·법적 이슈)

**회사가 스스로 "적용 안 될 수 있다"고 명시한 경우 (공식 1차 소스):**

- **OpenAI `ChatGPT-User`**: OpenAI 공식 크롤러 문서가 직접 명시한다 — *"Because these actions are initiated by a user, robots.txt rules may not apply."* 같은 문서에서 `GPTBot`·`OAI-SearchBot`·`OAI-AdsBot`은 robots.txt를 준수한다고 밝힌 것과 대비된다.
- **Perplexity `Perplexity-User`**: 공식 문서가 *"generally ignores robots.txt rules"*라고 명시한다.

→ 즉 **사용자 요청 fetch 계열은 robots.txt로 막히지 않는 것이 회사의 공식 입장**이다. 이 계열을 실제로 막으려면 WAF·IP·인증 레벨 통제가 필요하다.

**제3자 측정으로 보고된 미준수 (1차 측정 주체 기준):**

- **Bytespider (ByteDance)**: TollBit *State of the Bots* 2026 상반기 리포트(2026-08 공개, TollBit 자체 네트워크 측정)는 *robots.txt에서 명시적으로 disallow한 유럽 사이트의 절반 가까이에서 Bytespider가 disallow된 URL에 도달*했다고 보고했다. 같은 리포트는 `ChatGPT-User`·`Youbot`도 유사 수준으로 집계했고, 식별된 AI page fetcher 전체의 약 15%가 disallow URL에 도달했다고 밝혔다. TollBit는 "운영사 문서가 뭐라 주장하든 disallow URL 요청은 전부 bypass로 집계"하는 방식이라고 방법론을 명시한다.
  > 주의: 이는 *TollBit 네트워크 표본*의 관측치이며 ByteDance의 공식 반박·해명은 확인되지 않았다. Cloudflare가 Perplexity 건에서 낸 것과 같은 *독립 인프라 사업자의 Bytespider 전용 미준수 보고서*는 2026-08-26 현재 확인되지 않았다.

- **Perplexity (2024-06)**: Wired, Forbes, 독립 연구자(Robb Knight)가 *Perplexity가 robots.txt를 무시하고 미등록 IP로 사이트를 크롤한다*고 보고. Forbes는 자사 기사를 거의 그대로 복제했다며 공개적으로 비판.
- **Cloudflare (2025-08)**: "Perplexity가 *stealth* 크롤러로 WAF·robots.txt를 우회한다"는 연구 발표. 수만 도메인 대상 매일 수백만 요청 관측.
- **법적 분쟁**: Perplexity는 News Corp, BBC, Forbes, Wired, 일본 Nikkei 등으로부터 robots.txt 우회·무단 복제 관련 법적 조치·항의를 받았다(2024~2025). 2025-08 TechCrunch, Fortune 보도 기준.

> 주의: 위 사례는 *보고된 사실*이며, 법적 판단이 확정된 것은 아니다. 사이트 운영자는 robots.txt만으로 완전한 차단을 기대해서는 안 되며, *WAF·IP 차단·법적 대응* 같은 다층 방어가 필요할 수 있음을 인지해야 한다.

### 1-5. Google — robots.txt 밖의 별도 제어 축 (2026-06 신설)

Google은 2026-06-03부로 **Search Console에 `Search generative AI` 설정**을 도입했다. AI Overviews·AI Mode 등 *생성형 AI 기능 노출만* 켜고 끄는 토글이며, robots.txt·`Google-Extended`와는 **별개의 축**이다.

| 제어 수단 | 통제 대상 | 일반 검색 순위 영향 |
|-----------|-----------|:---:|
| `robots.txt` (Googlebot) | 크롤링 자체 | 있음 (색인에서 사라짐) |
| `Google-Extended` | 수집된 데이터의 **Gemini·Vertex AI 학습·grounding** 사용 | 없음 |
| **Search Console `Search generative AI` 설정** | **AI Overviews·AI Mode 노출 여부** | **없음** |
| `nosnippet` / `max-snippet` / `data-nosnippet` | 스니펫·AI 미리보기에 쓰이는 본문 범위 | 스니펫 축소 |

설정값은 `Include`(기본) / `Exclude` / `Inherit from parent` 3종이다. `Exclude`를 고르면 생성형 AI 기능에서의 **노출과 트래픽·노출수 집계가 모두 사라지며**, 반영에 1~2일이 걸리고 캐시된 콘텐츠는 더 오래 남을 수 있다. 이 설정은 학습을 막지 않으므로, 학습 통제는 `Google-Extended`로 별도 처리해야 한다.

> 주의: 2026-06 발표 시점 기준 **영국 사이트 대상 제한 테스트로 시작해 순차 확대** 중이다. 본인 속성에 토글이 안 보일 수 있다.

> 참고: 같은 발표에서 Google은 AI Overviews 월간 사용자 25억 명 이상, AI Mode 10억 명 이상이라고 밝혔다 (Google 공식 블로그, 2026-06-03).

---

## 2. llms.txt 표준 — 비공식 제안 (2026-08 v2 개정)

### 2-1. 정의와 상태

- **제안자**: Jeremy Howard (Answer.AI), 2024-09-03 발표
- **공식 사이트**: llmstxt.org
- **명세 버전**: **v2 (2026-08-10 개정)** — "2년간의 채택 경험을 반영해 갱신"이라고 명세가 밝힌다
- **위치**: 사이트 루트 `/llms.txt` (하위 경로에도 둘 수 있음 — v2에서 명문화)
- **형식**: Markdown

> 주의: **llms.txt는 IETF RFC, W3C 권고, ISO 표준 어느 것도 아니다.** 커뮤니티 제안 단계의 *de facto* 시도다.

**"어느 곳도 공식 확인한 바 없다"는 서술은 2026-08-26 재검증에서 정정한다.** 사실관계는 *발행(publish)* 과 *소비(consume)* 를 나눠야 정확하다:

| 구분 | 확인된 사실 (1차 소스) |
|------|------------------------|
| **발행** | llmstxt.org v2 명세는 OpenAI·Anthropic·Gemini 세 곳 모두 자사 개발자 문서에 llms.txt를 발행 중이라고 밝힌다. 실제로 `code.claude.com/docs/llms.txt`·`platform.claude.com/llms.txt`(Anthropic), `docs.perplexity.ai/llms.txt`(Perplexity)가 규격에 맞는 파일을 반환하는 것을 2026-08-26 직접 확인했다. |
| **권장** | Anthropic 공식 엔지니어링 글(2025-09-11, *Writing effective tools for AI agents*)이 *"LLM-friendly documentation can commonly be found in flat `llms.txt` files on official documentation sites"* 라며 자사 API llms.txt를 예시로 제시. 즉 **에이전트에 문서를 물릴 때의 표준 포맷으로 공식 권장**한다. |
| **소비(랭킹·인용 반영)** | **여전히 공식 확인 없음.** OpenAI·Anthropic·Perplexity 모두 자사 *크롤러 문서*에서 llms.txt를 언급하지 않는다(각 사 크롤러 페이지 2026-08-26 확인). |
| **명시적 부정** | **Google은 공식 문서로 "쓰지 않는다"고 명문화했다.** 생성형 AI 최적화 가이드(2026-07-10 갱신): *"You don't need to create new machine readable files, AI text files, markup, or Markdown to appear in Google Search (including its generative AI capabilities), as Google Search itself doesn't use them."* 즉 **랭킹에 도움이 되지도, 해가 되지도 않는다**는 입장이다. |

> 정리: **llms.txt는 "AI 검색 랭킹 신호"가 아니라 "에이전트가 필요할 때 참조하는 문서 인덱스"다.** v2 명세도 *"our expectation was that llms.txt would mainly be useful for inference rather than training"* 이라고 못박는다.

> 주의: 채택률 수치는 반드시 출처·시점을 병기한다. OtterlyAI 측정(2025년, 90일간 AI 봇 요청 62,100건 중 `/llms.txt` 요청 84건 = 0.1%)은 **2025년 시점 크롤러 요청 기준**이며, 대화형 에이전트가 사용자 요청으로 fetch하는 경우는 잡히지 않는다. 이 값을 "2026년에도 아무도 안 쓴다"의 근거로 쓰지 말 것 — 2026-08-26 기준 재측정 자료는 확인되지 않았다.

> 주의: 미검증 — "Claude Desktop / claude.ai가 retrieval 과정에서 llms.txt를 준수한다", "Perplexity가 llms.txt로 페이지 선택 우선순위를 정한다"는 주장이 3rd-party 블로그에 돌지만, **양사 공식 문서에서 확인되지 않는다.** 인용하지 말 것.

> 주의: 그럼에도 Anthropic, OpenAI, Stripe, Cloudflare, Vercel, Mintlify, Supabase 등 다수의 개발자 도구 회사가 자사 사이트에 llms.txt를 배포 중이다. *에이전트·개발자가 문서를 통째로 물릴 때의 진입점* 용도라고 보는 게 정확하다.

### 2-2. 형식 (llmstxt.org 명세 v2)

```markdown
# 프로젝트명

> 한 줄 요약 (인용구 형식)

이 프로젝트에 대한 상세 설명. 제목 없는 자유 문단.
LLM이 컨텍스트 첫머리에서 파악해야 할 내용을 적는다.

## Docs

- [Quickstart](https://example.com/docs/quickstart.md): 5분 안에 시작
- [API Reference](https://example.com/docs/api.md): 전체 API 정의
- [Authentication](https://example.com/docs/auth.md): 인증 방식

## Examples

- [Example 1](https://example.com/examples/1.md): 가장 단순한 사용 예
- [Example 2](https://example.com/examples/2.md): 고급 사용 패턴

## Optional

- [Changelog](https://example.com/changelog.md): 버전 이력
- [Contributors](https://example.com/contributors.md): 기여자 목록
```

규칙 (v2 기준, 순서 고정):
- `H1` 1개 — **유일한 필수 요소**. 프로젝트·사이트명
- 인용구 (선택): 나머지를 이해하는 데 필요한 핵심 정보를 담은 한 줄 요약
- 제목 없는 문단 (선택): 헤딩을 제외한 임의의 마크다운 블록. 상세 설명
- `H2` 섹션들 (선택): 각각 마크다운 리스트. 항목마다 **링크 `[name](url)` 필수**, 뒤에 `:` + 설명은 선택
- **`## Optional` 섹션**: 짧은 컨텍스트가 필요할 때 에이전트가 *건너뛸 수 있는* 보조 정보. v2에서 **기계적 의미(mechanical semantics)는 제거**되고 관례로만 남았다

**v2 신설 — 발견 가능성(discoverability) 링크 관계.** HTML `<link>` 또는 HTTP 헤더로 선언한다:

```html
<!-- 이 HTML 페이지의 마크다운 대체본 -->
<link rel="alternate" type="text/markdown" href="/docs/quickstart.md">
<!-- 이 페이지에 적용되는 llms.txt -->
<link rel="describedby" href="/llms.txt">
```

### 2-3. llms.txt vs llms-full.txt (v2에서 정리됨)

| 파일 | 명세 지위 (v2) | 용도 |
|------|----------------|------|
| `/llms.txt` | **명세가 정의하는 유일한 파일** | 에이전트가 훑거나 검색해 필요한 링크를 찾고, 그 링크를 따라간다 |
| 각 페이지의 `.md` 동반 파일 | 명세가 권장 (별도 규격 파일은 아님) | 원본 URL의 마크다운 버전. v2는 `page.html.md`(확장자 덧붙이기)와 `page.md`(확장자 교체) **둘 다 허용** |
| `/llms-full.txt` | **명세 밖의 커뮤니티 관례** | 전체 본문을 한 파일에 인라인. 한 번의 fetch로 전체 컨텍스트를 주고 싶을 때 |

> 주의: **v1의 `llms-ctx.txt` / `llms-ctx-full.txt`(컨텍스트 확장 도구 산출물) 개념은 v2 명세에서 빠졌다.** v2는 "에이전트가 llms.txt를 보거나 검색해서 필요한 것을 찾은 뒤 해당 링크를 따라간다"는 소비 모델로 바뀌었다. 기존 문서에서 `llms-ctx*.txt`를 "공식 명세"라고 인용하고 있다면 갱신 대상이다.

### 2-4. v1 → v2 변경 요약 (2026-08-10)

| 항목 | v1 | v2 |
|------|----|----|
| 발견 방법 | 루트 `/llms.txt` 관례에 의존 | `rel="alternate" type="text/markdown"`·`rel="describedby"` 링크 관계 신설 |
| 마크다운 URL | `page.html.md` (확장자 덧붙이기)만 | 덧붙이기 / 교체(`page.md`) 둘 다 허용 |
| 하위 경로 파일 | 규정 없음 | 하위 경로의 llms.txt는 그 경로 이하를 커버하고, **가장 구체적인 파일이 우선**. 사이트 일부만 참여 가능(예: 프로젝트 페이지) |
| 소비 모델 | 컨텍스트 확장 도구(`llms_txt2ctx`) 전제 | 도구 전제 없이 "에이전트가 보고 링크를 따라간다" |
| `## Optional` | 기계적 생략 규칙 | 관례로만 유지 (기계적 의미 제거) |

### 2-5. robots.txt와의 차이 (혼동 주의)

| | robots.txt | llms.txt |
|---|---|---|
| 목적 | 크롤러 *접근 제어* | LLM에 *콘텐츠 안내* |
| 형식 | 텍스트 (User-agent / Disallow) | Markdown |
| 표준 상태 | RFC 9309 공식 표준 | 비공식 제안 (v2, 2026-08-10) |
| 위치 | `/robots.txt` (루트 고정) | `/llms.txt` + 하위 경로 허용 (v2) |
| 적용 시점 | 크롤 *시도* 시 | 에이전트가 정보를 *필요로 할 때 온디맨드* |

llms.txt는 robots.txt를 *대체하지 않는다*. 두 파일을 같이 둬도 충돌이 없다.

---

## 3. 인용 친화 콘텐츠 구조

Princeton GEO 논문(Aggarwal et al., KDD 2024)과 업계 관찰 결과를 종합하면, 다음 패턴이 *AI 답변 인용 가능성을 높이는 경향*이 있다고 보고된다.

> 주의: 아래는 *경험적 권장사항*이지 보장된 인과관계가 아니다. AI 모델·검색 시스템의 인용 알고리즘은 공개되지 않았다.

### 3-1. 답변 우선 문단 (Answer-First Paragraph)

LLM이 인용할 단위는 *완결된 한 문단*이다. 다음 패턴이 권장된다:

```markdown
## akrasia(아크라시아)란 무엇인가?

akrasia는 *의지의 약함*을 의미하는 그리스어 개념이다. 옳은 줄 알면서도
욕망에 굴복해 그릇된 행동을 하는 상태를 가리킨다. 아리스토텔레스는
『니코마코스 윤리학』 7권에서 이를 *akolasia*(무절제)와 구분한다.

akolasia는 잘못된 판단 자체가 *원칙으로 자리잡은* 상태다.
즉 akrasia는 "알면서 진다", akolasia는 "잘못된 줄도 모른다"의 차이다.
```

체크리스트:
- 헤더 자체가 *질문 형태* (예: "X란 무엇인가?", "X를 하려면?")
- 첫 문장이 *완결된 정의·답*
- 단락 단위로 독립적인 의미 (앞 단락 참조 없이 이해 가능)
- 길이는 100~300 토큰 (대략 한국어 200~500자) — *AI가 그대로 인용·요약하기 쉬운 단위*

### 3-2. FAQ 청크 + JSON-LD FAQPage

자주 묻는 질문 섹션은 *명시적 FAQ 청크*로 구조화한다.

**HTML 예시:**

```html
<section class="faq">
  <h2>자주 묻는 질문</h2>

  <article itemscope itemtype="https://schema.org/Question">
    <h3 itemprop="name">GPTBot을 차단하면 ChatGPT 검색에서 사라지나요?</h3>
    <div itemscope itemtype="https://schema.org/Answer" itemprop="acceptedAnswer">
      <p itemprop="text">
        아니요. GPTBot은 모델 학습용이고, ChatGPT 검색은
        OAI-SearchBot이 담당합니다. ChatGPT 답변 인용에 노출되려면
        OAI-SearchBot은 별도로 허용해야 합니다.
      </p>
    </div>
  </article>
</section>
```

**JSON-LD 예시 (`<head>`에 삽입):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "GPTBot을 차단하면 ChatGPT 검색에서 사라지나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "아니요. GPTBot은 모델 학습용이고, ChatGPT 검색은 OAI-SearchBot이 담당합니다. ChatGPT 답변 인용에 노출되려면 OAI-SearchBot은 별도로 허용해야 합니다."
      }
    },
    {
      "@type": "Question",
      "name": "llms.txt를 두면 ChatGPT가 자동으로 읽나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "자동으로 읽지는 않습니다. OpenAI·Anthropic·Perplexity 모두 자사 크롤러 문서에서 llms.txt를 언급하지 않고, Google은 공식 문서로 '검색이 llms.txt를 사용하지 않는다'고 명시했습니다(2026-08 기준). 다만 Anthropic은 에이전트에 문서를 물릴 때의 표준 포맷으로 llms.txt를 권장하며 자사 문서에 발행하고 있습니다."
      }
    }
  ]
}
</script>
```

> 주의: Google은 2026-05-07 이후 FAQ **rich results**(검색 결과 페이지에 Q&A 펼침 노출) 노출을 사실상 중단·축소하기로 했다고 발표했다. 다만 *JSON-LD FAQPage 마크업 자체가 무용지물*은 아니다. LLM은 구조화 데이터를 *콘텐츠 추출 비용 절감* 목적으로 여전히 활용한다고 알려져 있다(공식 확인은 없음).

### 3-3. 인용 가능한 정보 단위

다음은 AI가 *그대로 따다 쓰기 쉬운* 형식이다. 사실 문장은 이런 단위로 가공해 둔다:

- **정의 한 문장**: "X는 Y다." 형태로 완결
- **수치 인용**: "Princeton 연구(2024)에 따르면 GEO 기법 적용 시 AI 답변 가시성이 최대 40% 향상되었다." — *출처·연도·수치* 3박자
- **비교 표**: 옵션 A vs B의 차이를 표로 정리
- **번호 매긴 리스트**: 단계·체크리스트
- **인용 가능한 명명 리스트**: "주요 AI 크롤러 7종: GPTBot, ClaudeBot, ..."

### 3-4. E-E-A-T 신호

Google의 E-E-A-T(Experience, Expertise, Authoritativeness, Trustworthiness) 기준은 *전통 SEO 용어*이지만, GEO에서도 동일한 신호가 유효하다고 관찰된다:

- **저자명·날짜 명시** (`itemprop="author"`, `itemprop="datePublished"`)
- **출처·근거 링크** (각 사실 주장에 1차 소스 링크)
- **익명 게시·"AI-generated" 표시 없는 콘텐츠 피하기**
- **About / Contact 페이지** 명확하게

```html
<article itemscope itemtype="https://schema.org/Article">
  <h1 itemprop="headline">제목</h1>
  <p>By <span itemprop="author">홍길동</span>,
     <time itemprop="datePublished" datetime="2026-06-01">2026-06-01</time></p>
  ...
</article>
```

### 3-5. Google 공식 입장 (2026-07 가이드) — "GEO 해킹보다 SEO 기본"

Google은 2026년에 **생성형 AI 최적화 공식 가이드**(`/search/docs/fundamentals/ai-optimization-guide`, 2026-07-10 갱신)를 신설했다. AI Overviews·AI Mode용 별도 최적화 트랙을 인정하지 않는다는 것이 요지다.

| Google 공식 입장 | 내용 |
|------------------|------|
| 별도 요건 | **없음.** *"There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary."* 표준 기술 요건 충족 + 색인 + 스니펫 허용이면 대상이 된다 |
| 전용 파일·마크업 | **불필요.** llms.txt·AI 텍스트 파일·별도 마크다운 모두 "Google Search가 사용하지 않는다" |
| 청킹(chunking) | **불필요.** 내용을 잘게 쪼갤 필요 없다 — 다주제·복합 페이지도 이해한다고 명시 |
| 구조화 데이터 | 생성형 AI 노출의 **요건은 아님**. 리치 결과·전반적 SEO 목적으로 계속 쓰라는 입장 |
| 권장 | 고유하고 전문성 있는(non-commodity) 콘텐츠, 명확한 구조와 크롤 가능성, 로컬·이커머스 상세 정보 |
| 경고 | *AEO/GEO 해킹*(인위적 청킹, 불필요한 AI 파일, 조작된 멘션)보다 표준 SEO에 투자하라 |
| 작동 방식 | RAG + **query fan-out**(하나의 질문을 여러 연관 검색으로 확장) — 그래서 기존 SERP보다 다양한 사이트가 등장할 여지가 있다 |

> 이 스킬 §3-1~3-4의 권장(답변 우선 문단, 완결된 정의, 출처·저자 명시)은 Google 입장과 충돌하지 않는다. **"AI 전용으로 별도 문서를 만든다"가 아니라 "사람이 읽기에도 좋은 구조를 지킨다"는 방향**이면 양쪽 모두를 만족한다. 반대로 "AI만 겨냥해 본문을 조각내는" 패턴은 Google이 명시적으로 불필요하다고 밝힌 안티패턴이다.

### 3-6. 국내 — 네이버 AI 브리핑 (요약 + 포인터)

한국 시장을 노린다면 Google·ChatGPT 계열과 별개로 **네이버 AI 브리핑**(2025-03 출시, 통합검색 결과 최상단 생성형 요약 + 출처 표기)이 사실상 또 하나의 GEO 표면이다. 핵심만 요약하면:

- 네이버 공식 발표 기준 **월 3,000만 명 사용**, **통합검색 쿼리의 약 20%**에 적용(2026년 말 약 40% 목표).
- 네이버는 **인용 횟수를 직접 집계해 창작자 보상에 사용**한다 — 인용은 실재하는 측정 지표다.
- **출처 선정 기준을 공식 웹마스터 문서로 공개하지 않았고, AI 브리핑만 선택적으로 빼는 옵트아웃 수단도 없다.** Google의 Search Console 토글(§1-5)과 대조된다.
- 외부 도메인이 출처가 되려면 먼저 네이버 *웹문서* 색인이 전제 — Yeti 크롤러 허용·sitemap·**RSS**가 선행 조건이다.

> 상세(공식 확인 수치의 출처, 인용 조건, 자체 도메인 대응법, 비공식 분석 구분)는 `naver-seo-specifics` 스킬 §2-2를 참조한다. 여기서 중복 서술하지 않는다.

---

## 4. GEO 측정 — 관찰 가능성의 한계

> 주의: 2026-08-26 기준, *AI 답변 인용을 플랫폼 전반에 걸쳐 표준 방식으로 측정할 수 있는 도구는 여전히 없다.* 단, **Google만은 예외적으로 공식 계측이 생겼다**(§4-0). 나머지는 아래 우회책에 의존한다.

### 4-0. Google Search Console 생성형 AI 성능 보고서 (2026-06 신설, 공식)

Google은 2026-06-03 **Search Generative AI performance report**를 Search Console에 도입했다. Search용·Discover용 두 종류다.

| 제공 항목 | 내용 |
|-----------|------|
| 노출수(Impressions) | 내 사이트 URL이 AI Overviews·AI Mode 등 생성형 AI 기능에 등장한 횟수 |
| 페이지 | AI 기능 안에 등장한 URL 목록 |
| 국가 / 기기 | 국가별 가시성, 기기별(검색 결과 한정) |
| 기간 | 시간·일·주·월 단위 |

> 주의: **일부 사이트에 순차 롤아웃 중**이라 내 속성에 아직 안 보일 수 있다. 또한 이 보고서는 *Google 생성형 AI 기능*만 커버하며 ChatGPT·Perplexity·Claude 인용은 잡지 못한다 — §4-1 이하의 우회책은 여전히 필요하다.

### 4-1. 측정 가능한 것

| 신호 | 측정 방법 | 한계 |
|------|-----------|------|
| AI 크롤러 방문 빈도 | 서버 액세스 로그 User-agent 필터 (`GPTBot`, `ClaudeBot`, `PerplexityBot` 등) | 방문 = 인용 보장 아님 |
| AI 답변 페이지 → 내 사이트 클릭 | Referrer에서 `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `claude.ai` 식별 | SparkToro 2026-01 측정 기준 약 70%의 AI referral이 GA에서 "Direct"로 분류되어 누락 |
| 특정 쿼리에 내 사이트가 인용되는지 | 수동으로 ChatGPT·Perplexity에 질의해 확인 | 결과가 매번 다름, 자동화 어려움 |
| 서드파티 추적 도구 | Otterly.AI, Profound, Topify 등 유료 모니터링 | 비공식 측정, 도구마다 결과 상이 |

### 4-2. 서버 로그 필터 예시 (nginx)

```bash
# AI 크롤러 방문 추출
grep -E "GPTBot|OAI-SearchBot|OAI-AdsBot|ChatGPT-User|ClaudeBot|Claude-User|Claude-SearchBot|PerplexityBot|Perplexity-User|Applebot-Extended|Meta-ExternalAgent|Meta-ExternalFetcher|CCBot|Bytespider" /var/log/nginx/access.log
```

### 4-3. GA4 커스텀 채널 그룹

GA4에서 *AI Search* 채널을 만들고 다음 referrer를 포함:

- chat.openai.com, chatgpt.com
- perplexity.ai, www.perplexity.ai
- gemini.google.com, bard.google.com
- claude.ai
- copilot.microsoft.com

> 주의: 위 referrer 매칭은 *클릭 트래픽*만 잡힌다. *AI 답변 본문에 인용된 후 사용자가 클릭 없이 답을 읽고 끝낸 경우*는 어떤 분석 도구로도 추적 불가하다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
