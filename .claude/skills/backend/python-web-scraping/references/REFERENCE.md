## 8. Rate Limiting · 예의 (Politeness)

### 절대 원칙
1. **robots.txt를 먼저 확인한다.** (다음 섹션)
2. **요청 간 딜레이를 둔다.** 도메인당 최소 1초 권장 (사이트 약관·문서가 별도 명시하면 그에 따름).
3. **동시 요청 수를 제한한다.** 도메인당 5~10 이하.
4. **HTTP 429 / 503은 즉시 백오프한다.** `Retry-After` 헤더가 있으면 따른다.
5. **자기 신원을 User-Agent에 박는다.** 연락처 URL/이메일 포함.

### requests + 지수 백오프
```python
import time, requests
from urllib.parse import urlparse

def polite_get(url, max_retries=3):
    for attempt in range(max_retries):
        r = requests.get(url, timeout=10,
                         headers={"User-Agent": "MyBot/1.0 (+https://me.example/bot)"})
        if r.status_code == 429:
            wait = int(r.headers.get("Retry-After", 2 ** attempt))
            time.sleep(wait)
            continue
        r.raise_for_status()
        return r
    raise RuntimeError(f"Failed after {max_retries} retries")
```

### Scrapy 설정 요약 (앞 섹션의 핵심만)
```python
DOWNLOAD_DELAY = 1.0
RANDOMIZE_DOWNLOAD_DELAY = True
CONCURRENT_REQUESTS_PER_DOMAIN = 8
AUTOTHROTTLE_ENABLED = True
RETRY_HTTP_CODES = [500, 502, 503, 504, 522, 524, 408, 429]
```

---

## 9. robots.txt 준수 — RFC 9309

### urllib.robotparser (표준 라이브러리)
```python
from urllib.robotparser import RobotFileParser

rp = RobotFileParser()
rp.set_url("https://example.com/robots.txt")
rp.read()

if rp.can_fetch("MyBot/1.0", "https://example.com/private/secret"):
    # 크롤링 진행
    ...
else:
    # 차단된 경로 — 절대 우회하지 않는다
    pass

# crawl-delay 확인 (옵션)
delay = rp.crawl_delay("MyBot/1.0")  # None or int
```

> 주의: 표준 라이브러리 `urllib.robotparser`는 원조 spec만 지원하며 RFC 9309의 와일드카드(`*`, `$`)를 완전히 지원하지 않을 수 있다. 엄격한 준수가 필요하면 `robotspy` 같은 RFC 9309 호환 라이브러리를 검토한다.

### Scrapy는 자동
`ROBOTSTXT_OBEY = True` 설정 시 Scrapy가 자동으로 확인 후 차단된 URL을 스킵한다.

---

## 10. 데이터 저장

### CSV
```python
import csv
with open("out.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["title", "url", "price"])
    w.writeheader()
    w.writerows(items)
```

### JSON Lines (스크래핑에 가장 적합)
```python
import json
with open("out.jsonl", "w", encoding="utf-8") as f:
    for item in items:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")
```
- 한 줄 = 한 레코드. 스트리밍 저장 가능, 중간 중단되어도 손실 최소.

### SQLite
```python
import sqlite3
con = sqlite3.connect("data.db")
con.execute("CREATE TABLE IF NOT EXISTS items (url TEXT PRIMARY KEY, title TEXT, price REAL)")
con.executemany(
    "INSERT OR REPLACE INTO items (url, title, price) VALUES (?,?,?)",
    [(i["url"], i["title"], i["price"]) for i in items],
)
con.commit(); con.close()
```
- 중복 URL 방지(`PRIMARY KEY` + `INSERT OR REPLACE`)에 유리.

### pandas DataFrame (분석/변환)
```python
import pandas as pd
df = pd.DataFrame(items)
df.to_parquet("out.parquet")     # 분석용 컬럼나르 포맷
df.to_csv("out.csv", index=False)
```

**저장 포맷 선택 기준:**
- 한 번 보고 버릴 데이터 → CSV
- 정기적으로 추가되는 스트림 → JSON Lines
- 쿼리·중복 제거 필요 → SQLite
- 분석·변환이 본 목적 → Parquet (pandas/polars)

---

## 11. 봇 차단 회피 — 합법적 범위 내에서

### 기본 위장 (대부분의 사이트에 충분)
- **현실적인 User-Agent**: `Mozilla/5.0 ...` 대신 자기 봇 이름을 박는 것이 윤리적으로 옳다. 정말 필요하면 최신 Chrome UA 사용.
- **Accept / Accept-Language 헤더**: 브라우저처럼 보이도록.
- **Referer**: 자연스러운 흐름 시 설정.
- **Cookies**: requests.Session / Playwright context로 유지.

```python
headers = {
    "User-Agent": "MyBot/1.0 (+https://me.example/bot)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
}
```

### Proxy 회전
```python
proxies = {"http": "http://user:pw@proxy.example:8080",
           "https": "http://user:pw@proxy.example:8080"}
requests.get(url, proxies=proxies, timeout=10)
```
- Scrapy: `scrapy-rotating-proxies` 또는 미들웨어 직접 작성.

### CAPTCHA — 한계
- CAPTCHA가 등장한다는 것은 **사이트가 명시적으로 자동화를 거부한다**는 신호다.
- 회피 시도는 법적·윤리적 리스크가 크다. 합법적 대안:
  1. 공식 API 존재 확인
  2. 사이트 운영자에게 데이터 제공 협의
  3. 더 정중한 크롤링 속도로 트리거 자체 회피

> 주의: Cloudflare/Akamai 등 WAF 회피용 스텔스 라이브러리(`undetected-chromedriver` 등)는 사이트 약관 위반 가능성이 높다. 사용 전 법적 검토 필요.

---

## 12. 법적 · 윤리

### 4가지 체크 항목 (스크래핑 시작 전 반드시 확인)

1. **robots.txt** — 허용 여부, crawl-delay 명시 여부
2. **Terms of Service (이용약관)** — 자동화 크롤링 명시 금지 조항 여부
3. **저작권** — 데이터 재배포·공개 시 저작권자 권리. 사실 데이터(가격, 통계)는 저작권 보호 약하나, 텍스트·이미지는 강함
4. **개인정보** — 이름·이메일·전화 등 개인정보는 GDPR / 한국 개인정보보호법 적용. 동의 없는 수집·보관 위험

### 일반 가이드라인
- 공식 API가 있으면 **무조건 API**를 쓴다. 스크래핑은 차선책.
- 로그인 필요 페이지는 **계정 약관 동의 = 자동화 금지 동의**인 경우가 많다.
- 수집 데이터를 **재배포·재판매**할 거면 별도 법적 검토 필요.
- 의심스러우면 **사이트 운영자에게 문의**한다 (의외로 협조적인 경우 많음).

> 주의: 법적 판단은 관할권(jurisdiction)·용도·데이터 종류에 따라 다르다. 상업적 스크래핑은 변호사 검토를 권장한다. 이 스킬은 법률 자문이 아니다.

---

## 13. 흔한 함정 (Anti-patterns)

### 1. 동적 콘텐츠 누락
**증상:** `requests`로 가져온 HTML에 데이터가 없음. 브라우저에서는 보임.
**원인:** JS로 렌더링된 콘텐츠. requests는 초기 HTML만 가져온다.
**해결:** Playwright 사용 OR 페이지의 XHR/fetch 요청을 직접 호출.

```python
# 안티패턴
soup = BeautifulSoup(requests.get(spa_url).text, "lxml")
data = soup.select(".product")  # [] — 비어 있음

# 패턴 A: Playwright
page.goto(spa_url); page.locator(".product").first.wait_for()

# 패턴 B: 백엔드 API 직접 호출 (더 빠르고 안정)
api_resp = requests.get("https://example.com/api/products?page=1").json()
```

### 2. Rate limit 차단 후에야 발견
**증상:** 수십 페이지 후 갑자기 403/429/captcha 등장.
**원인:** 너무 빠른 요청, 동일 IP·UA, robots.txt 무시.
**해결:** 처음부터 `DOWNLOAD_DELAY`, `Semaphore`, `User-Agent` 설정. 작게 시작해서 늘려간다.

### 3. HTML 구조 변경에 취약한 셀렉터
**증상:** 어제 됐는데 오늘 안 됨.
**원인:** `div > div > div:nth-child(3) > span` 같은 구조 의존 셀렉터.
**해결:** 의미 있는 속성(`data-testid`, `aria-label`, 클래스명) 우선. 폴백 셀렉터 준비.

```python
# 안티패턴
price = soup.select_one("div > div:nth-child(2) > span:nth-child(3)").text

# 패턴
price = (soup.select_one("[data-test='price']")
         or soup.select_one(".price")
         or soup.find("span", string=lambda s: s and "원" in s))
```

### 4. 인코딩 깨짐 (한국어)
**증상:** 한글이 `\xc3\xab...` 또는 ???로 보임.
**원인:** `response.text`가 잘못된 인코딩 추정.
**해결:** `response.encoding = "utf-8"` 명시 또는 `response.content` + 직접 decode.

```python
r = requests.get(url)
r.encoding = r.apparent_encoding  # chardet 기반 자동 감지
html = r.text
```

### 5. time.sleep으로 Playwright 대기
**증상:** 가끔 빈 결과. 느림.
**원인:** 고정 sleep은 너무 짧거나 너무 김.
**해결:** Locator 자동 대기 또는 명시적 `wait_for`.

### 6. 빈 결과를 빈 결과로 인식 못 함
**증상:** 코드는 멀쩡한데 데이터가 매번 0건.
**원인:** 셀렉터가 페이지 구조와 안 맞음. 에러 없이 빈 리스트만 반환.
**해결:** 첫 페이지에서 결과 0이면 **즉시 에러로 처리** + 디버그 HTML 저장.

```python
items = soup.select(".item")
if not items:
    with open("debug.html", "w") as f: f.write(soup.prettify())
    raise RuntimeError("No items found — selector might be broken")
```

### 7. 무한 스크롤에서 종료 조건 누락
**증상:** 스크립트가 영원히 안 끝남.
**해결:** scrollHeight 변화 감지 + 최대 페이지 수 cap.

### 8. 절대 URL / 상대 URL 혼동
```python
from urllib.parse import urljoin
abs_url = urljoin(response.url, "/page/2")  # 항상 urljoin 사용
```

### 9. 메모리 누수 (Playwright)
**증상:** 장시간 크롤링 후 RAM 폭증.
**원인:** 페이지/컨텍스트를 닫지 않음.
**해결:** `async with`, `with`로 컨텍스트 매니저 사용. 페이지 단위로 `close()`.

### 10. 한 번에 전부 가져오려는 시도
**증상:** 9시간째 돌고 있는데 90%에서 죽음.
**해결:** **체크포인트 저장** (JSON Lines / SQLite에 진행 상태 저장 후 재개 가능하게).

---

## 14. 도구별 선택 요약 카드

```
[정적 HTML] + [소량/일회성] → requests + BeautifulSoup
[정적 HTML] + [대량/동시성]  → httpx async + BeautifulSoup
[정적 HTML] + [대규모/정기]  → Scrapy
[JS 렌더링]                 → Playwright (또는 Scrapy + scrapy-playwright)
[로그인 + 정적]             → requests.Session
[로그인 + JS]               → Playwright storage_state
[공식 API 존재]             → 무조건 API. 스크래핑 금지.
```

---

## 참고 링크

- Beautiful Soup 4 — https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- Playwright Python — https://playwright.dev/python/
- Scrapy — https://docs.scrapy.org/en/latest/
- httpx — https://www.python-httpx.org/
- RFC 9309 (robots.txt) — https://datatracker.ietf.org/doc/rfc9309/
- urllib.robotparser — https://docs.python.org/3/library/urllib.robotparser.html
- 짝 스킬: `backend/python-async-asyncio`
