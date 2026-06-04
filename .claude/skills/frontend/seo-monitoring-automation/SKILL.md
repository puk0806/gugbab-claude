---
name: seo-monitoring-automation
description: GSC API · Naver Search Advisor · IndexNow · GitHub Actions cron 기반 SEO 모니터링 자동화 (사이트맵 자동 제출·색인 추적·순위 모니터링·Slack 알림)
---

# SEO 모니터링 자동화 스킬

> 소스:
> - Google Search Console API v3 — https://developers.google.com/webmaster-tools/v1/api_reference_index
> - Search Analytics: query — https://developers.google.com/webmaster-tools/v1/searchanalytics/query
> - URL Inspection API — https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
> - IndexNow Documentation — https://www.indexnow.org/documentation
> - 네이버 서치어드바이저 IndexNow 가이드 — https://searchadvisor.naver.com/guide/indexnow-request
> - GitHub Actions Workflow Syntax — https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions
> 검증일: 2026-06-04
> 기준 버전: Search Console API v1 (구 v3 alias 유지), IndexNow v1, GitHub Actions 현행 스키마

---

## 1. 언제 사용하나

- 매주/매일 GSC 데이터를 자동 수집해 순위·CTR·노출·클릭 변화를 추적할 때
- 새 페이지 배포 직후 사이트맵을 자동 제출하고 색인 상태를 모니터링할 때
- 색인 오류(Coverage error)·순위 급락·CWV 저하를 Slack 등으로 알람 받고 싶을 때
- 다중 검색엔진(Google + Naver + Bing)에 신규/갱신 URL을 IndexNow 한 번으로 푸시할 때

**사용하지 않는 경우:** 단발성 색인 요청은 GSC UI의 "URL 검사 → 색인 요청" 버튼이 더 빠르고, API 쿼터(2,000/일)를 아끼는 게 낫다.

---

## 2. Google Search Console API 기본

### 2-1. 인증 — OAuth2 Service Account

서버 사이드 자동화는 Service Account 방식이 표준이다.

```python
from googleapiclient.discovery import build
from google.oauth2 import service_account

SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
# 쓰기(사이트맵 제출 등)가 필요하면:
# SCOPES = ['https://www.googleapis.com/auth/webmasters']

creds = service_account.Credentials.from_service_account_file(
    'service_account.json',
    scopes=SCOPES,
)
service = build('searchconsole', 'v1', credentials=creds)
```

**필수 scope:**
| Scope | 용도 |
|-------|------|
| `https://www.googleapis.com/auth/webmasters.readonly` | searchanalytics 조회, sitemaps 목록 조회, urlInspection |
| `https://www.googleapis.com/auth/webmasters` | sitemaps 제출/삭제 등 쓰기 작업 포함 |

> 주의: Service Account를 만들었어도 **GSC 속성에 사용자로 추가**해야 동작한다. GSC → 설정 → 사용자 및 권한 → 사용자 추가 → 서비스 계정 이메일(예: `xxx@xxx.iam.gserviceaccount.com`) 추가. 누락 시 403 PERMISSION_DENIED.

### 2-2. 데이터 지연 (Freshness)

- **표준 지연: 약 2일** — 오늘·어제 데이터는 비어 있거나 부분적이다.
- 안전한 조회 범위: `today - 3일` 이전 ~ `today - 16개월` (GSC 보존 한도).
- 페이지 색인 리포트는 종종 2~4일 지연된다.

### 2-3. 사이트 URL 표기

| 속성 유형 | siteUrl 표기 |
|-----------|--------------|
| URL 접두어 | `https://example.com/` (끝 슬래시 포함) |
| 도메인 속성 | `sc-domain:example.com` (프로토콜 없음) |

---

## 3. Search Analytics — 검색 성능 데이터

### 3-1. 기본 조회

```python
response = service.searchanalytics().query(
    siteUrl='https://example.com/',
    body={
        'startDate': '2026-05-01',
        'endDate': '2026-05-31',
        'dimensions': ['query', 'page'],
        'rowLimit': 25000,        # 요청당 최대값
        'startRow': 0,
    },
).execute()

for row in response.get('rows', []):
    keys = row['keys']            # ['검색어', 'URL']
    print(keys[0], row['clicks'], row['impressions'], row['ctr'], row['position'])
```

### 3-2. 한도와 페이지네이션

| 항목 | 값 |
|------|----|
| 요청당 `rowLimit` 최대 | **25,000** |
| 검색 유형(web/image/video 등)당 하루 노출 최대 | **50,000행** (clicks 정렬 기준) |
| 페이지네이션 | `startRow`를 25000씩 증가시켜 50,000행까지 |

```python
# 50,000행 전체 수집 패턴
rows = []
for start in (0, 25000):
    resp = service.searchanalytics().query(
        siteUrl=site,
        body={**base_body, 'rowLimit': 25000, 'startRow': start},
    ).execute()
    rows.extend(resp.get('rows', []))
```

### 3-3. 주요 dimensions

| dimension | 의미 |
|-----------|------|
| `query` | 검색어 |
| `page` | 랜딩 URL |
| `country` | 국가 (ISO 3166-1 alpha-3) |
| `device` | DESKTOP / MOBILE / TABLET |
| `date` | 일자 (시계열 분석용) |
| `searchAppearance` | 리치 결과/AMP 등 표출 유형 (단독 사용 권장) |

---

## 4. URL Inspection API — 색인 상태 확인

```python
result = service.urlInspection().index().inspect(
    body={
        'inspectionUrl': 'https://example.com/page',
        'siteUrl': 'https://example.com/',
        # 'languageCode': 'ko-KR',  # 선택
    },
).execute()

idx = result['inspectionResult']['indexStatusResult']
print(idx['verdict'])         # PASS / PARTIAL / FAIL / NEUTRAL
print(idx['coverageState'])   # 색인 상태 텍스트
print(idx.get('lastCrawlTime'))
```

**쿼터 (공식):**
- 일일 한도: **2,000 쿼리/일**
- 분당 한도: **600 쿼리/분**

**verdict 값:**
| 값 | 의미 |
|----|------|
| `PASS` | 색인됨 |
| `PARTIAL` | 일부 이슈 (예: 모바일 사용성 문제) |
| `FAIL` | 색인 불가 |
| `NEUTRAL` | 정보 부족 |

---

## 5. Sitemaps API — 사이트맵 자동 제출

### 5-1. 제출 / 조회 / 삭제

```python
# 제출 (PUT)
service.sitemaps().submit(
    siteUrl='https://example.com/',
    feedpath='https://example.com/sitemap.xml',
).execute()

# 목록 조회
sitemaps = service.sitemaps().list(siteUrl='https://example.com/').execute()
for s in sitemaps.get('sitemap', []):
    print(s['path'], s.get('lastSubmitted'), s.get('errors', 0), s.get('warnings', 0))

# 단일 사이트맵 상세
detail = service.sitemaps().get(
    siteUrl='https://example.com/',
    feedpath='https://example.com/sitemap.xml',
).execute()

# 삭제
service.sitemaps().delete(
    siteUrl='https://example.com/',
    feedpath='https://example.com/old-sitemap.xml',
).execute()
```

쓰기 작업(`submit`, `delete`)은 `webmasters` scope가 필요하다.

---

## 6. IndexNow — 다중 검색엔진 즉시 색인

### 6-1. 개념

IndexNow는 Bing·Yandex·Naver·Seznam 등 참여 검색엔진에 **단일 요청으로 URL 갱신을 알리는** 오픈 프로토콜이다. 한 엔드포인트에 보내면 다른 참여 엔진들에 자동 전파된다.

> 주의: Google은 IndexNow 미참여. Google에는 GSC API 사이트맵 제출 또는 URL Inspection으로 처리한다.

### 6-2. 키 파일 규격 (공식)

- 위치: **사이트 루트** (`https://example.com/{key}.txt`) 권장
- 파일명: `{key}.txt` (키 값과 동일)
- 내용: **키 값만**. 공백·줄바꿈·설명 텍스트 금지
- 키 규칙: **8~128자, hex 호환 문자 + 대시(`-`)** 만 허용 (`a-z`, `A-Z`, `0-9`, `-`)
- 인코딩: UTF-8
- 대체 위치: 루트가 어려우면 다른 경로 가능. 단, `keyLocation` 필드로 명시해야 함

### 6-3. 단일 URL 제출 (GET)

```
GET https://api.indexnow.org/indexnow?url=https://example.com/page&key={key}
```

### 6-4. 다중 URL 제출 (POST, 권장)

```python
import requests

payload = {
    "host": "example.com",
    "key": "a1b2c3d4e5f6g7h8",
    "keyLocation": "https://example.com/a1b2c3d4e5f6g7h8.txt",
    "urlList": [
        "https://example.com/new-page",
        "https://example.com/updated-page",
    ],
}

# Bing/공용 엔드포인트 (다른 참여 엔진으로 전파)
requests.post(
    "https://api.indexnow.org/indexnow",
    json=payload,
    headers={"Content-Type": "application/json; charset=utf-8"},
)

# Bing 직접 엔드포인트
requests.post("https://www.bing.com/indexnow", json=payload, ...)
```

### 6-5. 네이버 서치어드바이저 IndexNow

네이버는 IndexNow를 공식 지원한다. 엔드포인트가 두 개 있다.

| 메서드 | 엔드포인트 | 용도 |
|--------|------------|------|
| GET | `https://searchadvisor.naver.com/indexnow?url={url}&key={key}` | 단일 URL |
| POST | `https://api.searchadvisor.naver.com/indexnow` | 다중 URL |

```python
# 네이버 POST 예시
requests.post(
    "https://api.searchadvisor.naver.com/indexnow",
    json={
        "host": "example.com",
        "key": "naver-issued-key",
        "keyLocation": "https://example.com/naver-issued-key.txt",
        "urlList": ["https://example.com/new-page"],
    },
    headers={"Content-Type": "application/json; charset=utf-8"},
)
```

> 주의: 사용자 자료에 `https://searchadvisor.naver.com/api/search/request`로 표기된 경우가 있으나, 공식 IndexNow 엔드포인트는 위 두 개(`/indexnow`)다. 네이버 서치어드바이저 가이드(`https://searchadvisor.naver.com/guide/indexnow-request`) 기준.

### 6-6. 제출 한도

- **요청당 최대 10,000 URL**
- 호스트당 일일 한도: 검색엔진별로 별도 정책 (공식 통일 수치 없음). 안전선은 **요청당 100~500 URL 배치 + 분산 전송**.

---

## 7. GitHub Actions cron 자동화

### 7-1. 기본 워크플로우

```yaml
# .github/workflows/seo-monitor.yml
name: SEO Monitor

on:
  schedule:
    # POSIX cron, UTC 기준. 매주 월요일 00:00 UTC = KST 월요일 09:00
    - cron: '0 0 * * 1'
  workflow_dispatch:        # 수동 실행 허용

permissions:
  contents: read

jobs:
  seo-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: pip install google-api-python-client google-auth requests

      - name: Restore service account credentials
        env:
          GSC_SERVICE_ACCOUNT: ${{ secrets.GSC_SERVICE_ACCOUNT }}
        run: echo "$GSC_SERVICE_ACCOUNT" > service_account.json

      - name: Run SEO monitor
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          INDEXNOW_KEY: ${{ secrets.INDEXNOW_KEY }}
        run: python scripts/seo_monitor.py
```

### 7-2. cron 문법 요점

```
┌───────── minute (0-59)
│ ┌─────── hour (0-23, UTC)
│ │ ┌───── day of month (1-31)
│ │ │ ┌─── month (1-12)
│ │ │ │ ┌─ day of week (0-6, 0=Sun)
* * * * *
```

| 패턴 | 의미 (UTC) |
|------|------------|
| `*/30 * * * *` | 30분마다 |
| `0 0 * * *` | 매일 00:00 UTC (KST 09:00) |
| `0 0 * * 1` | 매주 월요일 00:00 UTC |
| `0 0 1 * *` | 매월 1일 00:00 UTC |

**제약:**
- 최소 실행 간격: **5분**
- 모든 cron은 **UTC** 기준. KST는 +9시간 환산 필요
- GitHub 부하 시 **지연 가능** (정시 트리거 보장 X). 시간 민감 작업은 워크플로우 시작 시 시간 재확인
- 60일간 레포 활동이 없으면 schedule이 자동 비활성화됨 → `workflow_dispatch`로 주기적 수동 트리거 권장

---

## 8. 모니터링 알림 (Slack Incoming Webhook)

```python
import os
import requests

def send_slack_alert(message: str, webhook_url: str = None) -> None:
    url = webhook_url or os.environ['SLACK_WEBHOOK']
    requests.post(url, json={"text": message}, timeout=10)

# 예: 순위 급락 감지
if (prev_rank - curr_rank) <= -10:        # 순위가 10 이상 떨어짐
    send_slack_alert(
        f":warning: SEO 순위 급락\n키워드: {keyword}\n{prev_rank:.1f} → {curr_rank:.1f}"
    )

# 예: 색인 오류 신규 발생
if new_coverage_errors:
    lines = "\n".join(f"- {u}" for u in new_coverage_errors[:20])
    send_slack_alert(f":x: 색인 오류 {len(new_coverage_errors)}건 신규 발생\n{lines}")
```

---

## 9. 자동화 모니터링 체크리스트

| 항목 | 주기 | 출처 |
|------|------|------|
| 노출/클릭/CTR/평균 순위 변화 | 주 1회 | GSC Search Analytics |
| 상위 검색어 Top 20 변화 | 주 1회 | GSC Search Analytics |
| 색인 오류(Coverage) 신규 발생 | 일 1회 | URL Inspection API |
| 사이트맵 제출 상태·errors/warnings | 일 1회 | GSC Sitemaps API |
| 신규/갱신 URL 즉시 색인 푸시 | 배포 트리거 | IndexNow (Bing + Naver) |
| Core Web Vitals 임계 위반 URL | 일 1회 | CrUX API / PSI API (별도 스킬) |
| 404·리다이렉트 체인 | 주 1회 | 자체 크롤러 또는 lighthouse-ci |

---

## 10. 통합 예시 — 배포 후 IndexNow + GSC 사이트맵 자동 재제출

```yaml
# .github/workflows/seo-on-deploy.yml
name: SEO on Deploy

on:
  workflow_run:
    workflows: ["Deploy Production"]
    types: [completed]

jobs:
  notify-search-engines:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Submit sitemap to GSC + IndexNow
        env:
          GSC_SERVICE_ACCOUNT: ${{ secrets.GSC_SERVICE_ACCOUNT }}
          INDEXNOW_KEY: ${{ secrets.INDEXNOW_KEY }}
        run: |
          echo "$GSC_SERVICE_ACCOUNT" > service_account.json
          python scripts/notify_search_engines.py
```

```python
# scripts/notify_search_engines.py
import os, requests
from googleapiclient.discovery import build
from google.oauth2 import service_account

SITE = "https://example.com/"
SITEMAP = "https://example.com/sitemap.xml"

# 1) GSC 사이트맵 재제출
creds = service_account.Credentials.from_service_account_file(
    "service_account.json",
    scopes=["https://www.googleapis.com/auth/webmasters"],
)
gsc = build("searchconsole", "v1", credentials=creds)
gsc.sitemaps().submit(siteUrl=SITE, feedpath=SITEMAP).execute()

# 2) IndexNow (Bing + Naver 자동 전파)
key = os.environ["INDEXNOW_KEY"]
urls_to_push = [
    "https://example.com/new-feature",
    "https://example.com/updated-blog-post",
]
payload = {
    "host": "example.com",
    "key": key,
    "keyLocation": f"https://example.com/{key}.txt",
    "urlList": urls_to_push,
}
for endpoint in (
    "https://api.indexnow.org/indexnow",
    "https://api.searchadvisor.naver.com/indexnow",
):
    requests.post(endpoint, json=payload, timeout=10,
                  headers={"Content-Type": "application/json; charset=utf-8"})
```

---

## 11. 흔한 실수

| 실수 | 결과 | 해결 |
|------|------|------|
| 오늘 날짜로 searchanalytics 조회 | 빈 결과 / 부분 데이터 | `today - 3일` 이전 데이터만 사용 |
| Service Account를 GSC 속성에 사용자 추가 안 함 | 403 PERMISSION_DENIED | GSC → 설정 → 사용자 및 권한에서 Service Account 이메일 추가 |
| IndexNow 키 파일 미배포 상태로 호출 | 키 검증 실패 (HTTP 4xx) | 사이트 루트에 `{key}.txt` 먼저 배포 → 호출 |
| IndexNow 키 파일에 BOM/공백/줄바꿈 포함 | 키 검증 실패 | 키 값만 단독으로, UTF-8 인코딩, 끝 줄바꿈 제거 |
| 도메인 속성에 `https://...` 형식 사용 | 404 / 잘못된 siteUrl | 도메인 속성은 `sc-domain:example.com` |
| GitHub Actions cron을 KST 기준으로 작성 | 9시간 오차 | 모든 cron은 UTC 환산해 작성 |
| `service_account.json`을 레포에 커밋 | 키 노출 → 무력화 필요 | Secrets에 저장 후 step에서 파일로 복원 |
| URL Inspection을 대량 루프로 호출 | 600/분 한도 초과 → 429 | 배치 사이 `sleep(0.1s)`, 일일 2,000 한도 분배 |
| Google에 IndexNow 호출 | 무시됨 | Google은 IndexNow 미참여 — GSC API 사이트맵/URL 검사 사용 |
| Search Analytics 50,000행 초과 기대 | 25,000 × 2 페이지로 잘림 | 필터(`dimensionFilterGroups`)로 분할 조회 |
| 60일간 레포 활동 없음 | schedule cron 자동 비활성화 | `workflow_dispatch`로 주기적 ping |
