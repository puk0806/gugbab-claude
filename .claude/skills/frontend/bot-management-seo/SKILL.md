---
name: bot-management-seo
description: >
  Cloudflare·AWS WAF 봇 관리 설정이 Google/Naver 검색 크롤러를 차단하는 함정과 안전한 화이트리스트 설정법.
  WAF 적용 후 SEO 트래픽이 갑자기 떨어졌을 때 진단·복구 절차 포함.
---

# 봇 관리(Bot Management)와 SEO 안전성

> 소스: Google Search Central(developers.google.com/search), Cloudflare Bots Docs(developers.cloudflare.com/bots), AWS WAF Developer Guide(docs.aws.amazon.com/waf)
> 검증일: 2026-06-04

봇 관리 솔루션(Cloudflare Bot Fight Mode, AWS WAF Bot Control 등)은 악성 봇 차단에는 효과적이지만, 잘못 설정하면 Googlebot·Yeti·Bingbot 같은 정당한 검색 크롤러까지 차단해 색인 손실로 이어진다. 이 스킬은 (1) 주요 검색 엔진 크롤러를 식별하고 (2) Cloudflare·AWS WAF에서 안전하게 허용하며 (3) 차단 사고를 진단·복구하는 절차를 정리한다.

---

## 1. 주요 검색 엔진 크롤러 식별

### 1.1 Google

| 크롤러 | User-Agent (대표 패턴) | 비고 |
|--------|---------------------|------|
| Googlebot (Desktop) | `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` | 일반 색인 |
| Googlebot (Smartphone) | `Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 ... (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` | 모바일 우선 색인 |
| Googlebot-Image | `Googlebot-Image/1.0` | 이미지 검색 |
| AdsBot-Google | `AdsBot-Google (+http://www.google.com/adsbot.html)` | 광고 품질 점수, robots.txt 전역 룰 무시 |

**IP 범위 JSON (Google Search Central 공식):**
- 공통 크롤러(Googlebot 등): `https://developers.google.com/static/search/apis/ipranges/googlebot.json`
  - 또는 신규 경로: `https://developers.google.com/static/crawling/ipranges/common-crawlers.json`
- 특수 크롤러(AdsBot 등): `https://developers.google.com/static/crawling/ipranges/special-crawlers.json`
- 사용자 트리거 페처: `https://developers.google.com/static/crawling/ipranges/user-triggered-fetchers.json`

> 주의: Google은 JSON을 매일(UTC 자정 부근) 갱신하므로, 화이트리스트는 정적 IP가 아니라 자동 동기화로 관리한다.

### 1.2 Naver Yeti

- User-Agent: `Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)`
- 최신 변형: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Yeti/1.1; +https://naver.me/spd) Chrome/{버전} Safari/537.36`
- IP 범위: **공식 발표 없음** → User-Agent 기반 허용 + robots.txt 허용으로 간접 관리
- Yeti는 JavaScript 렌더링을 보장하지 않으므로 **SSR 또는 SSG 권장**

> 주의: Naver는 Googlebot처럼 공식 IP 목록을 공개하지 않는다. 따라서 User-Agent + 네이버 서치어드바이저 사이트 등록을 함께 활용한다.

### 1.3 Bing

- User-Agent (Desktop): `Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)`
- IP 검증 도구: `https://www.bing.com/toolbox/verify-bingbot` (Bing Webmaster Tools 내부 + 공개 도구)
- Microsoft도 Bingbot IP 목록을 JSON으로 제공한다.

---

## 2. Cloudflare 봇 관리 안전 설정

### 2.1 봇 분류 (Super Bot Fight Mode 기준)

Cloudflare는 트래픽을 3개 카테고리로 분류한다:

| 카테고리 | 의미 | 권장 액션 |
|---------|------|-----------|
| **Verified Bots** | Cloudflare가 검증한 목록(Googlebot, Bingbot, Yandex 등) | **Allow** (기본값 유지) |
| **Likely Automated** | 자동화 의심 | Challenge (Block 권장 안 함) |
| **Definitely Automated** | 명확한 자동화 | Block 가능 (그러나 API/모바일 앱 트래픽 주의) |

> 주의: 무료 플랜의 **Bot Fight Mode**는 세밀한 제어가 불가능하며, 일부 정당한 크롤러를 잘못 차단하는 사례가 보고된다. 검색 트래픽이 중요한 사이트는 **Pro 이상의 Super Bot Fight Mode** 사용을 권장한다.

### 2.2 안전한 화이트리스트 패턴

WAF Custom Rules에서 `cf.verified_bot` 또는 `cf.verified_bot_category` 필드를 사용한다. (User-Agent 문자열 매칭은 스푸핑 가능 → 최후 수단)

```
# WAF Custom Rule 예시 (Cloudflare 표현식 언어)
(cf.verified_bot) → Action: Skip → All remaining custom rules
```

또는 카테고리별 세분화:

```
(cf.verified_bot_category eq "Search Engine Crawler") → Skip
```

### 2.3 진단 — Firewall Events / Security Events

- Cloudflare 대시보드 → Security → Events → 필터 `User Agent contains "Googlebot"`
- 차단된 이벤트 발견 시: 룰 ID 확인 후 해당 룰에 화이트리스트 예외 추가
- Bot Analytics(Pro 이상)로 Verified Bots 요청 추이 확인

### 2.4 Rate Limiting 함정

- Cloudflare Rate Limiting Rule이 IP 기준일 경우, Googlebot 단일 IP가 한도를 초과해 차단될 수 있다.
- Rate Limit 룰에 `cf.verified_bot` 예외 조건 필수.

---

## 3. AWS WAF 봇 관리 안전 설정

### 3.1 AWS Managed Rules — Bot Control

관리형 룰 그룹: `AWSManagedRulesBotControlRuleSet` (VendorName: `AWS`, WCU: 50)

**보호 수준 2가지:**
- **Common**: 자기 식별 봇(검색 엔진, 스크래핑 프레임워크 등) 탐지. 검증된 봇은 통과시키고 미검증 봇만 차단.
- **Targeted**: Common + CAPTCHA/Challenge/머신러닝 기반 정교한 봇 탐지.

### 3.2 검색 엔진 처리 (CategorySearchEngine 룰)

`CategorySearchEngine` 룰은 검색 엔진 봇을 검사한다. 동작은 다음과 같다:

- **Verified bot으로 인식되면**: 룰이 매치되지 않으며 차단되지 않는다. 대신 다음 레이블이 부여된다:
  - `awswaf:managed:aws:bot-control:bot:category:search_engine`
  - `awswaf:managed:aws:bot-control:bot:verified`
  - `awswaf:managed:aws:bot-control:bot:name:googlebot` 등
- **Unverified bot이면**: Block 처리.

### 3.3 검증된 봇 식별 메커니즘

> 주의: Bot Control은 **웹 요청 origin의 IP 주소**를 기준으로 검증한다. 프록시/로드밸런서를 거치는 경우 forwarded IP가 자동 적용되지 않으므로, Bot Control 앞 단계에 별도 룰을 추가해 forwarded IP 기반으로 명시적 Allow를 처리해야 한다.

### 3.4 안전한 배포 패턴

1. **Count 모드 먼저**: 룰 액션을 Count로 설정 → CloudWatch 로그·메트릭 수집
2. **로그 분석**: `terminatingRuleId`, `labels` 필드에서 search_engine·verified 레이블 확인
3. **예외 룰 추가**: 검색 엔진 봇 트래픽 확인 후 명시적 Allow 룰 정의
4. **Block 전환**: 정상 트래픽이 검증된 후에만 Block 활성화

### 3.5 명시적 화이트리스트 룰 예시

검증된 봇을 명시적으로 통과시키는 라벨 매칭 룰:

```json
{
  "Name": "AllowVerifiedSearchEngineBots",
  "Priority": 0,
  "Action": { "Allow": {} },
  "Statement": {
    "LabelMatchStatement": {
      "Scope": "LABEL",
      "Key": "awswaf:managed:aws:bot-control:bot:category:search_engine"
    }
  }
}
```

> 주의: User-Agent 문자열 기반 매칭(아래 예시)은 스푸핑 가능하므로 라벨 매칭 또는 IP 범위 기반 검증과 병행해야 한다.

```json
{
  "Name": "AllowGooglebotUA",
  "Priority": 1,
  "Action": { "Allow": {} },
  "Statement": {
    "ByteMatchStatement": {
      "SearchString": "Googlebot",
      "FieldToMatch": { "SingleHeader": { "Name": "user-agent" } },
      "TextTransformations": [{ "Priority": 0, "Type": "LOWERCASE" }],
      "PositionalConstraint": "CONTAINS"
    }
  }
}
```

---

## 4. robots.txt vs WAF — 처리 순서

요청은 다음 순서로 평가된다:

```
1. CDN / Edge (Cloudflare, CloudFront) → WAF 룰 평가
2. Origin Server (Nginx, Apache, ALB)
3. Application → robots.txt 조회
```

**핵심:** WAF에서 차단되면 robots.txt는 절대 읽히지 않는다. 즉 "robots.txt에 `Allow: /` 적었으니 괜찮다"는 잘못된 가정.

진단 시 확인 순서: **WAF → CDN 봇 룰 → Rate Limiting → 서버 레벨(IP 차단) → robots.txt 문법 오류** 순으로 위에서 아래로 점검한다.

---

## 5. Google Search Console로 차단 사고 감지

| GSC 메뉴 | 차단 신호 |
|---------|----------|
| Settings → Crawl stats | 갑작스러운 요청 수 감소 (전월 대비 50%+) |
| Index → Coverage | "Crawled - currently not indexed" 또는 "Crawl anomaly" 증가 |
| URL Inspection → Live Test | "Fetch failed", "Blocked due to access forbidden (403)" |

WAF 적용 직후 3-7일은 GSC Crawl stats를 매일 모니터링한다. 갑작스러운 감소는 즉시 WAF 로그를 확인할 신호다.

---

## 6. Googlebot 진위 확인 (역DNS + 정방향 DNS)

Google 공식 권장 검증 절차 (4단계):

```bash
# 1. 역DNS 조회
host 66.249.66.1
# 출력 예: 1.66.249.66.in-addr.arpa domain name pointer crawl-66-249-66-1.googlebot.com.

# 2. 도메인 확인
# googlebot.com / google.com / googleusercontent.com 중 하나여야 함

# 3. 정방향 DNS 조회
host crawl-66-249-66-1.googlebot.com
# 출력 예: crawl-66-249-66-1.googlebot.com has address 66.249.66.1

# 4. IP 일치 확인
# 원본 IP(66.249.66.1)와 정방향 결과가 일치해야 진짜 Googlebot
```

**역DNS 마스크 패턴 (공식):**
- 공통 크롤러: `crawl-*-*-*-*.googlebot.com`
- 특수 크롤러: `rate-limited-proxy-*-*-*-*.google.com`
- 사용자 트리거 페처: `*-*-*-*.gae.googleusercontent.com`

> 주의: 단순 역DNS만으로는 충분하지 않다. 공격자가 역DNS를 `*.googlebot.com`으로 위조할 수 있으므로 반드시 **정방향 재조회**까지 수행한다.

---

## 7. JavaScript 렌더링과 봇 탐지

- Google은 Web Rendering Service(WRS)로 JS를 렌더링한다. WRS는 Headless Chromium 기반이며, 일부 봇 방어 솔루션이 Headless 시그널을 탐지해 오탐할 수 있다.
- Cloudflare의 일부 챌린지(JS Challenge, Managed Challenge)는 Headless 환경에서 통과 못 할 수 있다.
- **권장**: 핵심 콘텐츠는 SSR/SSG로 서빙해 JS 실행 없이도 색인 가능하도록 한다.

Naver Yeti는 Google보다 JS 렌더링 지원이 약하므로 SSR/SSG가 사실상 필수.

---

## 8. Staging 환경 주의

WAF 룰을 프로덕션과 동일하게 staging에 적용하면 Googlebot이 staging URL을 크롤링해 색인할 수 있다(중복 콘텐츠 페널티). 다음을 함께 적용한다:

- staging은 HTTP Basic Auth 또는 IP 제한으로 비공개
- `X-Robots-Tag: noindex, nofollow` 응답 헤더
- staging robots.txt: `User-agent: *` / `Disallow: /`

---

## 9. 흔한 실수

| 실수 | 결과 | 해결 |
|------|------|------|
| Cloudflare Bot Fight Mode를 무료 플랜에서 켜고 방치 | Googlebot/Yeti 일부 차단 가능 | Pro 이상 + Super Bot Fight Mode + Verified Bots Allow |
| User-Agent 문자열만으로 화이트리스트 | UA 스푸핑 우회 가능 | 라벨/IP 범위 기반 검증 병행 |
| WAF 적용 후 GSC Crawl stats 미확인 | 차단 발견 지연 → 색인 손실 | 적용 직후 3-7일 일일 모니터링 |
| Rate Limit 룰에 Verified Bot 예외 없음 | 단일 Googlebot IP 한도 초과로 차단 | `cf.verified_bot` 예외 조건 추가 |
| robots.txt 수정으로 해결 시도 | WAF가 robots.txt 이전에 차단하므로 무효 | WAF 로그·룰 직접 점검 |
| AWS WAF Bot Control을 Count 없이 바로 Block | 정당한 트래픽 즉시 차단 | Count → 로그 분석 → Block 단계적 전환 |
| Staging에 프로덕션 WAF 그대로 적용 | Googlebot이 staging 색인 | noindex + IP 제한 + robots.txt Disallow |
| 역DNS만으로 Googlebot 검증 | 스푸핑 가능 | 정방향 재조회까지 수행 |

---

## 참조 URL

- Google — Verify Google Crawlers: https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot
- Google — Common Crawlers: https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
- Google — Googlebot IP JSON: https://developers.google.com/static/search/apis/ipranges/googlebot.json
- Cloudflare — Verified Bots: https://developers.cloudflare.com/bots/concepts/bot/verified-bots/
- Cloudflare — Super Bot Fight Mode: https://developers.cloudflare.com/bots/get-started/super-bot-fight-mode/
- AWS WAF — Bot Control Rule Group: https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-bot.html
- AWS WAF — Bot Control Components: https://docs.aws.amazon.com/waf/latest/developerguide/waf-bot-control-components.html
- Bing — Verify Bingbot: https://www.bing.com/toolbox/verify-bingbot
