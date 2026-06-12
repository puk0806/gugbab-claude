## 5. 관련 표준과의 관계

GEO는 *전통 SEO를 대체하지 않고 그 위에 얹힌다*. 기본 SEO가 부실하면 GEO 노력도 효과가 적다.

| 기반 영역 | GEO에 미치는 영향 |
|-----------|-------------------|
| `<title>`, `<meta description>` | LLM이 페이지 요약 시 우선 참조 |
| `sitemap.xml` | 인덱싱·검색 크롤러(OAI-SearchBot, PerplexityBot)의 발견 경로 |
| `schema.org` structured data (Article, FAQPage, HowTo, Product 등) | LLM이 *구조화 사실*을 추출하기 쉽도록 |
| canonical URL, hreflang | 중복 콘텐츠 방지 — 인용 시 원본 URL 선택 신호 |
| Core Web Vitals, 페이지 속도 | 인용·인덱싱 우선순위에 간접 영향(공식 확인 없음) |

관련 스킬 포인터:
- `[[schema-org-patterns]]` — Article, FAQPage, HowTo, Product 등 structured data 패턴
- `[[seo-static-html]]` — meta, OpenGraph, canonical 기본
- `[[seo-nextjs]]` — Next.js의 `<Head>` / Metadata API 사용법

---

## 6. 윤리·법적 고려

### 6-1. 사이트 운영자가 결정해야 할 것

| 정책 | 결정 사항 |
|------|-----------|
| **학습 허용 여부** | `GPTBot`, `ClaudeBot`, `Google-Extended` 등 학습 크롤러 허용/차단 |
| **인용 허용 여부** | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot` 허용/차단 |
| **사용자 fetch 허용 여부** | `ChatGPT-User`, `Claude-User`, `Perplexity-User` 허용/차단 (robots.txt 무시될 수 있음) |
| **Privacy / Terms 명시** | 자사 사이트의 AI 학습·인용 정책을 사용자에게 공개 |

### 6-2. 공개 정책 문구 예시

Privacy Policy 또는 별도 페이지에 명시:

> "본 사이트는 다음 AI 학습 크롤러를 robots.txt에서 차단합니다: GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, Meta-ExternalAgent, CCBot. AI 검색 인용용 크롤러(OAI-SearchBot, Claude-SearchBot, PerplexityBot)는 허용합니다. 본 정책은 YYYY-MM-DD 기준이며 분기별로 재검토됩니다."

### 6-3. 한계 인지

- robots.txt는 *권고*다. 법적 강제력이 없다.
- 일부 크롤러는 robots.txt를 무시한 사례가 보고됐다(Perplexity, 2024~2025).
- 완전한 차단을 원한다면 *WAF에서 User-agent + IP 대역 기반 차단*이 필요하다(OpenAI·Anthropic·Perplexity는 IP 대역 JSON을 공개).

---

## 7. 흔한 실수 패턴

### 7-1. llms.txt를 robots.txt와 혼동

```
# 잘못된 예 — robots.txt에 markdown 문법 넣음
User-agent: GPTBot
# 자세한 안내는 llms.txt 참조  ← robots.txt는 # 주석만 인식, 링크 못 박음
```

llms.txt와 robots.txt는 *별개 파일·별개 형식*이다. 각각 사이트 루트에 따로 둔다.

### 7-2. 모든 AI 크롤러를 한꺼번에 차단

```
# 잘못된 GEO 전략 — 학습용·인용용 구분 없이 전부 차단
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: PerplexityBot
Disallow: /
```

→ 학습은 차단되지만 *AI 검색 답변 인용 기회도 사라진다.* GEO 목적이라면 학습용만 차단하고 검색용은 허용한다.

### 7-3. JSON-LD 없이 정보 나열만

```html
<!-- 잘못된 예 -->
<div>
  <p>akrasia란 의지의 약함이다.</p>
  <p>출처: 아리스토텔레스, 니코마코스 윤리학</p>
</div>
```

→ LLM이 "이게 정의문인지, 인용 가능한 단위인지" 판단하기 어렵다. `schema.org/DefinedTerm`, `Article`, `FAQPage` 등 *명시적 타입*을 부여한다.

### 7-4. Google-Extended를 차단하면 검색에서 사라진다는 오해

Google-Extended는 *Gemini·Vertex AI 학습용 토큰*이지 *Googlebot이 아니다*. Google-Extended를 차단해도 **일반 구글 검색 노출에는 영향이 없다**. 두 토큰은 독립 평가된다.

### 7-5. ChatGPT-User / Claude-User / Perplexity-User를 차단해 사용자 fetch까지 막기

이 세 크롤러는 "*사용자가 자기 질문에서 명시적으로 이 사이트를 보고 싶다고 요청한 경우*"의 fetch다. 차단하면 *사용자가 해당 사이트 URL을 ChatGPT에 직접 붙여넣어도 LLM이 못 읽는다*. 보통 학습용 차단과는 별개로 허용을 권장한다.

### 7-6. 1년 이상 된 GEO 가이드를 그대로 적용

이 영역은 *분기 단위*로 회사 정책·크롤러 이름이 바뀐다. 예를 들어 Anthropic은 2025년에 `anthropic-ai` → `ClaudeBot` 명칭 정리, Claude-SearchBot을 신설했다. 6~12개월 이상 된 가이드는 *반드시* 현재 공식 문서로 재검증한다.

### 7-7. "llms.txt 만들면 AI에 인용된다"는 환상

> 주의: 현재 어떤 메이저 AI 플랫폼도 llms.txt 사용을 공식 확인하지 않았다. *llms.txt는 미래 보험 + 사이트 자체 LLM 컨텍스트 정리 용도*로 보는 게 합리적이다. "이걸 만들면 ChatGPT에 인용된다"는 기대는 근거가 약하다.

---

## 8. 작업 체크리스트

새 프로젝트에 GEO를 적용할 때:

- [ ] robots.txt 작성 — 학습용 차단 / 인용용 허용 / 사용자 fetch 허용 결정
- [ ] sitemap.xml 노출 (`Sitemap:` 라인 robots.txt에 추가)
- [ ] 페이지별 `<title>`, `<meta description>`, canonical
- [ ] Article / FAQPage / HowTo 등 schema.org JSON-LD 삽입
- [ ] 답변 우선 문단 구조로 본문 작성 (헤더가 질문, 첫 문장이 정의)
- [ ] 저자·일자·출처 명시
- [ ] llms.txt 작성 (선택, 표준 미확정 인지)
- [ ] 서버 로그에서 AI 크롤러 방문 모니터링 시작
- [ ] GA4에 AI Search 커스텀 채널 추가
- [ ] Privacy/Terms에 AI 정책 한 줄 명시
- [ ] 분기별로 robots.txt·llms.txt 재검토 (크롤러 이름 변화 추적)

---

## 부록: 주요 공식 문서 URL

- OpenAI 크롤러: https://developers.openai.com/api/docs/bots
- Anthropic 크롤러: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Google-Extended: https://developers.google.com/search/docs/crawling-indexing/google-extended
- Google 일반 크롤러: https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers
- Perplexity 크롤러: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- Applebot: https://support.apple.com/en-us/119829
- Meta 크롤러: https://developers.facebook.com/docs/sharing/webmasters/crawler
- Common Crawl: https://commoncrawl.org/ccbot
- llms.txt 명세: https://llmstxt.org/
- llms.txt 제안 글: https://www.answer.ai/posts/2024-09-03-llmstxt.html
- Princeton GEO 논문: https://arxiv.org/abs/2311.09735
- schema.org FAQPage: https://schema.org/FAQPage
- Google FAQPage 가이드: https://developers.google.com/search/docs/appearance/structured-data/faqpage
