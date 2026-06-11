---
name: python-web-scraping
description: >
  Python 웹 스크래핑 도구(requests + BeautifulSoup, httpx async, Playwright Python, Scrapy)의
  비교·선택·실전 패턴. 셀렉터·동적 콘텐츠·인증·rate limiting·법적 윤리·흔한 함정.
  <example>사용자: "정적 HTML에서 상품 목록 추출하려는데 어떤 도구 써야 해?"</example>
  <example>사용자: "Playwright Python에서 JS 렌더링 끝나길 기다리려면?"</example>
  <example>사용자: "Scrapy로 대규모 크롤링 짤 때 차단 안 당하려면?"</example>
---

# Python 웹 스크래핑 — BeautifulSoup · httpx · Playwright · Scrapy

> 소스:
> - Beautiful Soup 4.14.3 — https://www.crummy.com/software/BeautifulSoup/bs4/doc/
> - Playwright Python 1.59 — https://playwright.dev/python/docs/
> - Scrapy 2.15.2 — https://docs.scrapy.org/en/latest/
> - httpx — https://www.python-httpx.org/
> - urllib.robotparser — https://docs.python.org/3/library/urllib.robotparser.html
> - RFC 9309 (Robots Exclusion Protocol, 2022)
>
> 검증일: 2026-05-15
> 짝 스킬: `backend/python-async-asyncio` (httpx async/Playwright async 패턴)

---

## 1. 도구 선택 가이드 — 가장 먼저 보는 표

| 상황 | 1순위 선택 | 이유 |
|------|-----------|------|
| 정적 HTML, 소량 페이지, 일회성 | **requests + BeautifulSoup** | 학습 곡선 0, 의존성 최소 |
| 정적 HTML, 수백~수천 페이지, async 필요 | **httpx (async) + BeautifulSoup** | asyncio 친화, requests API 호환 |
| JavaScript 렌더링 필요 (SPA, React/Vue) | **Playwright Python** | 진짜 브라우저 렌더링, 최신 표준 |
| 대규모 정기 크롤링 (수만~수십만 페이지) | **Scrapy 2.x** | 동시성·재시도·미들웨어·파이프라인 내장 |
| 로그인·세션 + 정적 페이지 | **requests.Session** | 쿠키 자동 관리 |
| 로그인·세션 + JS 렌더링 | **Playwright (storage_state)** | 브라우저 세션 영속화 |

**결정 기준 3가지:**
1. **JS 렌더링 필요?** → 필요하면 Playwright. 불필요하면 requests/httpx/Scrapy.
2. **규모와 정기성?** → 일회성·소량은 스크립트, 대규모·정기는 Scrapy.
3. **동시성?** → 비동기 처리량 필요하면 httpx/Scrapy.

> 주의: "그냥 Playwright 쓰면 다 되잖아"는 안티패턴이다. 브라우저 기동 비용이 requests보다 10~100배 비싸다. 정적 HTML에는 절대 쓰지 않는다.

---

## 2. requests + BeautifulSoup 4.x — 정적 페이지

### 설치
```bash
pip install requests beautifulsoup4 lxml
```

### 기본 사용
```python
import requests
from bs4 import BeautifulSoup

resp = requests.get(
    "https://example.com/products",
    headers={"User-Agent": "MyBot/1.0 (+https://mysite.example/bot)"},
    timeout=10,
)
resp.raise_for_status()  # 4xx/5xx 면 예외

soup = BeautifulSoup(resp.text, "lxml")  # lxml 권장 (속도)

# find / find_all
titles = soup.find_all("h2", class_="product-title", limit=20)
for t in titles:
    print(t.get_text(strip=True))

# CSS selector (select / select_one) — Soup Sieve 기반, CSS4 대부분 지원
prices = soup.select("div.product > span.price")
first_price = soup.select_one("div.product span.price")
```

### Parser 선택

| Parser | 속도 | 강건성 | 비고 |
|--------|------|--------|------|
| `lxml` | ★★★ | ★★ | C 의존성. **기본 권장.** |
| `html.parser` | ★★ | ★★ | 표준 라이브러리. 추가 설치 없음. |
| `html5lib` | ★ | ★★★ | 브라우저처럼 관대. 매우 느림. 망가진 HTML 처리에만. |

### find vs select 사용 기준
- 태그·속성 단순 매칭 → `find_all("a", href="/x")`
- 복잡한 계층/속성 조합 → `select("article.post > h2 a[href^='/p/']")`
- 첫 번째 하나만 → `find()` / `select_one()`

---

## 3. httpx (async) — 비동기 스크래핑

### 설치
```bash
pip install httpx beautifulsoup4 lxml
```

### AsyncClient 패턴
```python
import asyncio
import httpx
from bs4 import BeautifulSoup

async def fetch(client: httpx.AsyncClient, url: str) -> str:
    r = await client.get(url, timeout=10.0)
    r.raise_for_status()
    return r.text

async def main(urls: list[str]) -> list[dict]:
    limits = httpx.Limits(max_connections=20, max_keepalive_connections=10)
    async with httpx.AsyncClient(
        headers={"User-Agent": "MyBot/1.0"},
        limits=limits,
        timeout=httpx.Timeout(10.0, connect=5.0),
        http2=True,
    ) as client:
        # 동시 요청 + 세마포어로 부하 제어
        sem = asyncio.Semaphore(5)
        async def bounded(u):
            async with sem:
                html = await fetch(client, u)
                soup = BeautifulSoup(html, "lxml")
                return {"url": u, "title": soup.title.string if soup.title else None}
        return await asyncio.gather(*(bounded(u) for u in urls))

asyncio.run(main(["https://example.com/", "https://example.org/"]))
```

**핵심 포인트:**
- `AsyncClient`는 `async with` 컨텍스트로 사용 (커넥션 풀 재사용)
- `Semaphore`로 동시 요청 수 제한 — 서버 보호 + 차단 회피
- `httpx.Limits`로 커넥션 풀 크기 명시
- `http2=True`로 HTTP/2 지원 (지원 서버에서 다중화 이점)

> 짝 스킬: 더 깊은 asyncio 패턴은 `backend/python-async-asyncio` 참조.

---

## 4. Playwright Python 1.59 — JS 렌더링 필요 시

### 설치
```bash
pip install playwright
playwright install chromium  # 브라우저 바이너리 다운로드
```

### 기본 패턴 (Locator API 권장)
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent="MyBot/1.0",
        viewport={"width": 1280, "height": 800},
    )
    page = context.new_page()
    page.goto("https://example.com/spa", wait_until="domcontentloaded")

    # 권장 — Locator API + 자동 대기
    page.locator("button.load-more").click()
    page.locator("div.item").first.wait_for()  # 첫 요소가 보일 때까지 자동 대기

    # 데이터 추출
    titles = page.locator("h2.title").all_text_contents()

    # JS 실행
    height = page.evaluate("() => document.body.scrollHeight")

    browser.close()
```

### wait 전략 — 무엇을 언제 쓰나

| 전략 | 사용 시점 |
|------|-----------|
| `page.goto(url, wait_until="networkidle")` | 초기 로딩 완료까지 기다림 (XHR 다발 SPA) |
| `locator(sel).wait_for(state="visible")` | 특정 요소 등장 대기 — **권장** |
| `page.wait_for_selector(sel)` | 레거시. 새 코드는 Locator 사용 |
| `page.wait_for_function("() => window.dataReady")` | JS 조건이 참이 될 때까지 |
| `expect(locator).to_have_text(...)` | 단언 + 자동 재시도 |

> 주의: `time.sleep()`로 대기하지 않는다. flaky 테스트의 주범이다. Locator 자동 대기를 쓴다.

> 주의: Playwright Python 공식 문서에서 `wait_for_selector`는 "discouraged"로 표기됐다. 새 코드는 Locator API를 쓴다.

### Async 버전
```python
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://example.com/")
        await page.locator("button").click()
        await browser.close()
```

### 무한 스크롤 처리
```python
prev_height = 0
while True:
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)  # 콘텐츠 로딩 대기
    new_height = page.evaluate("document.body.scrollHeight")
    if new_height == prev_height:
        break
    prev_height = new_height
```

---

## 5. Scrapy 2.15.x — 대규모 크롤링 프레임워크

### 프로젝트 생성
```bash
pip install scrapy
scrapy startproject myproject
cd myproject
scrapy genspider quotes quotes.toscrape.com
```

### Spider 작성
```python
# myproject/spiders/quotes.py
import scrapy

class QuotesSpider(scrapy.Spider):
    name = "quotes"
    start_urls = ["https://quotes.toscrape.com/page/1/"]

    def parse(self, response):
        for quote in response.css("div.quote"):
            yield {
                "text": quote.css("span.text::text").get(),
                "author": quote.css("small.author::text").get(),
                "tags": quote.css("div.tags a.tag::text").getall(),
            }
        next_page = response.css("li.next a::attr(href)").get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)
```

### settings.py — 예의 + 안전 기본값
```python
# robots.txt 준수 (startproject 기본값 True — 유지)
ROBOTSTXT_OBEY = True

# User-Agent — 신원 식별 가능하게
USER_AGENT = "MyBot/1.0 (+https://mysite.example/bot-info)"

# 동시성 제어
CONCURRENT_REQUESTS = 16              # 전역
CONCURRENT_REQUESTS_PER_DOMAIN = 8    # 도메인당

# 고정 딜레이 (예의)
DOWNLOAD_DELAY = 1.0                  # 도메인당 요청 간격(초). 소수점 허용
RANDOMIZE_DOWNLOAD_DELAY = True       # 0.5x ~ 1.5x 랜덤화

# AutoThrottle — 적응형 딜레이
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1.0
AUTOTHROTTLE_MAX_DELAY = 30.0
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0  # 평균 동시 요청 목표

# 재시도
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 522, 524, 408, 429]

# HTTP 캐시 (개발 중 권장)
HTTPCACHE_ENABLED = True
```

> 주의: AutoThrottle은 응답 시간만 보고 딜레이를 조정한다. **HTTP 429/503을 신호로 쓰지 않는다.** CDN 캐시로 응답이 빠른 사이트에서는 AutoThrottle이 딜레이를 0에 가깝게 줄여 원본 서버를 타격할 수 있다. 명시적 rate limit이 있는 API는 `DOWNLOAD_DELAY` 고정값을 쓴다.

### Item Pipeline — 데이터 후처리/저장
```python
# myproject/pipelines.py
import json

class JsonWriterPipeline:
    def open_spider(self, spider):
        self.file = open("items.jsonl", "w", encoding="utf-8")

    def close_spider(self, spider):
        self.file.close()

    def process_item(self, item, spider):
        self.file.write(json.dumps(dict(item), ensure_ascii=False) + "\n")
        return item

# settings.py
ITEM_PIPELINES = {"myproject.pipelines.JsonWriterPipeline": 300}
```

### 실행
```bash
scrapy crawl quotes -O quotes.json    # 덮어쓰기
scrapy crawl quotes -o quotes.jsonl   # 추가 모드 (JSON Lines)
```

### Scrapy + Playwright (JS 렌더링 통합)
```bash
pip install scrapy-playwright
playwright install chromium
```
대규모 + JS 렌더링이 동시에 필요할 때 `scrapy-playwright` 미들웨어를 쓴다.

---

## 6. 셀렉터 비교 — CSS · XPath · BS4 find

| 목적 | BS4 find/find_all | BS4 select (CSS) | Scrapy CSS | Scrapy XPath |
|------|------------------|------------------|------------|--------------|
| 태그명 | `find_all("a")` | `select("a")` | `css("a")` | `xpath("//a")` |
| 클래스 | `find_all(class_="x")` | `select(".x")` | `css(".x")` | `xpath("//*[@class='x']")` |
| ID | `find(id="x")` | `select_one("#x")` | `css("#x")` | `xpath("//*[@id='x']")` |
| 속성 | `find_all(href="/a")` | `select("[href='/a']")` | `css("[href='/a']")` | `xpath("//*[@href='/a']")` |
| 텍스트 추출 | `.get_text(strip=True)` | `.get_text()` | `::text` 후 `.get()` | `text()` 후 `.get()` |
| 속성 추출 | `.get("href")` | `["href"]` | `::attr(href)` | `@href` |
| 텍스트 포함 매칭 | `string="..."` | (불가) | (불가) | `xpath("//a[contains(., 'x')]")` |

**기본 권장:** CSS selector. **XPath 우위:** 텍스트 기반 매칭, 부모/형제 탐색.

---

## 7. 인증 — 세션·쿠키·로그인 자동화

### requests.Session — 폼 로그인
```python
import requests
from bs4 import BeautifulSoup

with requests.Session() as s:
    s.headers.update({"User-Agent": "MyBot/1.0"})

    # 1) CSRF 토큰 획득
    r = s.get("https://example.com/login")
    soup = BeautifulSoup(r.text, "lxml")
    csrf = soup.select_one("input[name='csrf_token']")["value"]

    # 2) 로그인 POST (세션이 쿠키 자동 보관)
    s.post("https://example.com/login", data={
        "username": "u", "password": "p", "csrf_token": csrf,
    }).raise_for_status()

    # 3) 인증 필요 페이지 접근
    r2 = s.get("https://example.com/me")
```

### Playwright — 브라우저 세션 영속화 (storage_state)
```python
# 로그인 1회 수행 후 상태 저장
with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)  # 1회는 수동도 가능
    ctx = browser.new_context()
    page = ctx.new_page()
    page.goto("https://example.com/login")
    page.fill("#id", "u"); page.fill("#pw", "p")
    page.click("button[type=submit]")
    page.wait_for_url("**/dashboard")
    ctx.storage_state(path="auth.json")  # 쿠키 + localStorage 저장

# 재사용
with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(storage_state="auth.json")
    page = ctx.new_page()
    page.goto("https://example.com/dashboard")  # 이미 로그인된 상태
```

> 주의: 저장된 `auth.json`은 **민감 정보**다. `.gitignore`에 추가하고 절대 커밋하지 않는다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
