---
name: geo-ai-discoverability
description: 생성형 AI 답변(ChatGPT, Claude, Perplexity, Google AI Overviews 등)에 사이트 콘텐츠가 인용·참조되도록 하는 GEO(Generative Engine Optimization) 영역의 현재 합의된 권장사항. AI 크롤러 robots.txt 정책, llms.txt 표준, 인용 친화 콘텐츠 구조를 다룬다.
---

# GEO — AI 검색·답변 엔진 발견 가능성 최적화

> 소스: 각 AI 회사 공식 크롤러 문서(OpenAI, Anthropic, Google, Perplexity, Apple, Meta) + Princeton GEO 논문(arXiv:2311.09735, KDD 2024) + llmstxt.org 명세
> 검증일: 2026-06-01
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

> 주의: Anthropic의 `anthropic-ai`, `claude-web`은 로그에 남아있을 수 있는 *legacy* 식별자다. 2026년 현재 공식 문서는 `ClaudeBot` / `Claude-User` / `Claude-SearchBot` 3종을 정식 식별자로 명시한다. 신규 robots.txt는 새 이름을 사용하되, 기존 정책 호환을 위해 legacy 식별자도 함께 남겨두는 사이트가 많다.

### 1-2. 학습용 vs 인용용의 차이 (중요)

크롤러는 크게 세 부류로 나뉘며, 각각 *독립적으로* 제어해야 한다:

| 분류 | 예시 | 차단 시 영향 |
|------|------|--------------|
| **학습용** | `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `Meta-ExternalAgent`, `CCBot` | 모델 학습에 미사용 — 다만 **AI 답변 인용에는 영향이 없거나 적음** |
| **인덱싱·검색용** | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot` | **차단하면 AI 검색 결과·인용에서 사라짐** |
| **사용자 요청 시 fetch** | `ChatGPT-User`, `Claude-User`, `Perplexity-User`, `Meta-ExternalFetcher` | 사용자가 명시적으로 URL 요청 시 동작 — robots.txt를 *무시할 수 있다*고 명시하는 회사도 있음(Perplexity 등) |

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
Disallow: /
```

> 주의: robots.txt 명세상 여러 User-agent를 한 블록에 묶어도 동작은 하지만, 일부 크롤러는 한 블록당 User-agent 하나만 정확히 인식한다. 호환성을 위해 *블록 분리*를 권장한다.

### 1-4. robots.txt 무시 사례 (윤리·법적 이슈)

- **Perplexity (2024-06)**: Wired, Forbes, 독립 연구자(Robb Knight)가 *Perplexity가 robots.txt를 무시하고 미등록 IP로 사이트를 크롤한다*고 보고. Forbes는 자사 기사를 거의 그대로 복제했다며 공개적으로 비판.
- **Cloudflare (2025-08)**: "Perplexity가 *stealth* 크롤러로 WAF·robots.txt를 우회한다"는 연구 발표. 수만 도메인 대상 매일 수백만 요청 관측.
- **법적 분쟁**: Perplexity는 News Corp, BBC, Forbes, Wired, 일본 Nikkei 등으로부터 robots.txt 우회·무단 복제 관련 법적 조치·항의를 받았다(2024~2025). 2025-08 TechCrunch, Fortune 보도 기준.

> 주의: 위 사례는 *보고된 사실*이며, 법적 판단이 확정된 것은 아니다. 사이트 운영자는 robots.txt만으로 완전한 차단을 기대해서는 안 되며, *WAF·IP 차단·법적 대응* 같은 다층 방어가 필요할 수 있음을 인지해야 한다.

---

## 2. llms.txt 표준 — 비공식 제안

### 2-1. 정의와 상태

- **제안자**: Jeremy Howard (Answer.AI), 2024-09-03 발표
- **공식 사이트**: llmstxt.org
- **위치**: 사이트 루트 `/llms.txt` (robots.txt와 같은 위치)
- **형식**: Markdown

> 주의: **llms.txt는 IETF RFC, W3C 권고, ISO 표준 어느 것도 아니다.** 커뮤니티 제안 단계의 *de facto* 시도다. **OpenAI, Anthropic, Google, Microsoft, Perplexity 어느 곳도 "우리는 llms.txt를 읽는다"고 공식 확인한 바 없다** (2026-06 기준). Google의 John Mueller는 "현재 어떤 AI 시스템도 llms.txt를 사용하지 않는다"고 공개 발언했다. OtterlyAI의 2025년 측정에서는 62,100개 AI 봇 요청 중 단 84건(0.1%)만이 /llms.txt를 요청했다.

> 주의: 그럼에도 Anthropic, Stripe, Cloudflare, Vercel, Mintlify, Supabase 등 다수의 개발자 도구 회사가 자사 사이트에 llms.txt를 배포 중이다. *"미래 표준 후보"로서의 보험 + 자사 도구가 LLM에 입력될 때 컨텍스트 최적화* 용도라고 보는 게 정확하다.

### 2-2. 형식 (llmstxt.org 명세)

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

규칙:
- `H1` 1개 (필수): 프로젝트명
- 인용구 (선택): 한 줄 요약
- 제목 없는 문단 (선택): 자유 설명
- `H2` 섹션들: 마크다운 링크 리스트 (`[제목](URL): 설명` 형식)
- **`## Optional` 섹션**: 컨텍스트 윈도우 압박 시 *생략 가능한* 보조 정보로 명시

### 2-3. llms.txt vs llms-full.txt

llmstxt.org는 도구(`llms_txt2ctx`)로 **두 가지 파생 파일**을 생성하는 방식을 제시한다:

| 파일 | 내용 | 용도 |
|------|------|------|
| `/llms.txt` | 사이트 인덱스(링크 목록) | LLM이 "어디를 가져올지" 선택하도록 안내 |
| `/llms-full.txt` (또는 `/llms-ctx-full.txt`) | 모든 링크의 실제 본문을 인라인으로 펼친 단일 파일 | LLM이 *한 번의 fetch로* 전체 컨텍스트를 받을 수 있도록 |

> 주의: `llms-full.txt` 명명은 *관례*이며 공식 명세에 포함되지 않는다. 명세 원문은 `llms-ctx.txt` / `llms-ctx-full.txt`를 언급한다. 커뮤니티에서는 `llms-full.txt`가 더 널리 쓰인다.

### 2-4. robots.txt와의 차이 (혼동 주의)

| | robots.txt | llms.txt |
|---|---|---|
| 목적 | 크롤러 *접근 제어* | LLM에 *콘텐츠 안내* |
| 형식 | 텍스트 (User-agent / Disallow) | Markdown |
| 표준 상태 | RFC 9309 공식 표준 | 비공식 제안 |
| 위치 | `/robots.txt` | `/llms.txt` |

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
        "text": "현재는 그렇지 않습니다. OpenAI, Anthropic, Google 어느 곳도 llms.txt 사용을 공식 확인한 바 없습니다(2026-06 기준)."
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

---

## 4. GEO 측정 — 관찰 가능성의 한계

> 주의: 2026-06 기준 *AI 답변 인용을 표준 방식으로 측정할 수 있는 공식 도구는 없다.* 다음은 현실적 우회책이다.

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
grep -E "GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-User|Claude-SearchBot|PerplexityBot|Perplexity-User|Google-Extended|Applebot-Extended|Meta-ExternalAgent|CCBot" /var/log/nginx/access.log
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
