---
name: search-console-webmaster
description: 전 세계·국가별 검색엔진(Google·Bing·Naver·Yandex·Baidu)의 사이트 등록·소유권 확인·sitemap 제출·인덱싱 진단 운영 워크플로우. 한국 운영자 기준 Google + Naver 핵심 + IndexNow 자동화까지 다룬다.
---

# 검색엔진 웹마스터 콘솔 운영 가이드 (Google·Bing·Naver·Yandex·Baidu)

> 소스:
> - Google Search Console Help: https://support.google.com/webmasters
> - Bing Webmaster Tools: https://www.bing.com/webmasters
> - Naver Search Advisor: https://searchadvisor.naver.com
> - Yandex Webmaster: https://webmaster.yandex.com
> - Baidu 搜索资源平台: https://ziyuan.baidu.com
> - IndexNow Documentation: https://www.indexnow.org/documentation
> - Google Indexing API: https://developers.google.com/search/apis/indexing-api/v3/quickstart
>
> 검증일: 2026-06-02

---

## 0. 핵심 의사결정 — 어떤 콘솔에 등록할 것인가

한국 운영자가 새 사이트를 출시할 때 기본 등록 순서는 다음과 같다.

| 우선순위 | 콘솔 | 등록 이유 |
|----------|------|-----------|
| **필수 1** | Google Search Console (GSC) | 글로벌·국내 모든 시장에서 1순위 트래픽 원천 |
| **필수 2** | Naver Search Advisor | 한국 내 통합검색 점유율, 국내 사용자 대상 사이트라면 누락 금지 |
| 선택 | Bing Webmaster Tools | 영문/글로벌 트래픽 비중이 있으면 등록 (GSC import 기능으로 손쉽게 추가) |
| 지역 | Yandex Webmaster | 러시아·CIS 시장 타깃 |
| 지역 | Baidu Ziyuan | 중국 본토 시장 타깃 (단, ICP 등록 필수) |

> 주의: GSC와 Google Analytics(GA)는 다른 도구다. GSC는 "검색결과에서 어떻게 보이고 클릭되는가"(노출·CTR·쿼리), GA는 "사이트 내부에서 사용자가 무엇을 하는가"(트래픽·행동)를 본다. 둘 다 등록·연결한다.

---

## 1. Google Search Console (GSC) — 글로벌 1순위

### 1.1 속성(Property) 종류: Domain vs URL prefix

GSC에서 사이트를 등록할 때 **두 가지 속성 타입** 중 하나를 선택해야 한다.

| 구분 | Domain 속성 | URL prefix 속성 |
|------|-------------|------------------|
| 커버 범위 | 모든 서브도메인 + 모든 프로토콜 (http, https, m., www., ftp 등) | 지정한 정확한 URL prefix만 (프로토콜·서브도메인 일치 필수) |
| 인증 방법 | **DNS TXT 레코드만 가능** | DNS / HTML 파일 / HTML 메타태그 / Google Analytics / Google Tag Manager |
| 권장 시점 | 대부분의 경우 권장 — 사이트 전체 데이터를 한 번에 봄 | DNS 접근 불가, 특정 디렉토리만 별도 추적 필요 시 |
| 단점 | DNS 접근 권한 필요 | http/https/www/non-www를 별도 속성으로 각각 등록해야 하는 번거로움 |

**결론:** DNS 관리 권한이 있으면 **Domain 속성**을 선택한다. 그래야 `www.example.com`, `example.com`, `m.example.com`, `http://` 모두 하나의 속성에서 통합으로 본다.

### 1.2 소유권 확인 방법 5종 (URL prefix 속성 기준)

| 방법 | 절차 | 권장도 |
|------|------|--------|
| **DNS TXT** | 도메인 등록업체(가비아·Cloudflare 등)에서 TXT 레코드에 GSC가 제공하는 값 추가 | ⭐ Domain 속성에는 유일한 방법 |
| **HTML 파일** | GSC가 제공하는 `googleXXXXXX.html` 파일을 사이트 루트(`/`)에 업로드 | ⭐ 정적 호스팅에 간편 |
| **HTML 태그** | `<head>` 안에 `<meta name="google-site-verification" content="...">` 추가 | ⭐ CMS·SPA에 간편 |
| Google Analytics | 사이트에 GA tracking code(gtag.js)가 설치되어 있고 같은 Google 계정에 GA "수정" 권한 | GA 이미 쓰면 클릭 1번 |
| Google Tag Manager | GTM 컨테이너 스니펫이 설치되어 있고 같은 계정에 GTM "게시" 권한 | GTM 이미 쓰면 클릭 1번 |

> 인증 토큰은 사이트에서 제거하지 말 것. Google이 주기적으로 재확인하며, 제거하면 소유권을 잃는다.

### 1.3 sitemap 제출

1. GSC 좌측 메뉴 → "Sitemaps"
2. 입력란에 `sitemap.xml`(루트 기준 상대경로) 입력 → "제출"
3. 상태 확인:
   - **Success** — 정상 처리
   - **Has errors** — sitemap 형식 오류 또는 일부 URL이 robots.txt 차단·noindex 상태
   - **Couldn't fetch** — sitemap URL 접근 불가 (404, 권한 차단)

**sitemap 규격(공식 protocol):**
- 단일 파일 최대 50,000 URL, 50 MB(비압축)
- 초과 시 sitemap index 파일로 분할
- canonical·indexable URL만 포함 (noindex·robots 차단 URL 넣지 말 것 — 모순 신호)

### 1.4 URL 검사 도구 + 색인 요청

특정 URL의 색인 상태를 진단하고 색인 요청을 보낼 때 사용.

1. GSC 상단 검색창에 URL 입력 → "URL 검사"
2. 결과 화면 항목:
   - **URL이 Google에 등록되어 있음** — 색인 됨
   - **URL이 Google에 등록되어 있지 않음** — 제외 사유 표시 (5종, 다음 절 참조)
3. "색인 생성 요청(Request Indexing)" 버튼 → Googlebot에 우선 크롤 힌트 전달

> 주의: 색인 요청은 **하루 약 10~12회**(속성 기준)로 제한된다. 공식 발표 수치는 없으며 계정 이력에 따라 변동. 같은 URL을 반복 요청해도 첫 번째만 큐에 들어가고 나머지는 무시된다. 대량 push가 필요하면 sitemap 갱신 또는 IndexNow(Google은 미지원)·Indexing API(JobPosting·BroadcastEvent만)로.

### 1.5 페이지 색인 보고서 — "색인 안 됨" 사유 우선 5종

GSC "페이지" 보고서에서 색인 안 된 URL들의 사유 분류 중 우선 진단할 5가지:

| 사유 | 의미 | 해결 |
|------|------|------|
| **`robots.txt`에 의해 차단됨** | robots.txt의 `Disallow` 라인이 해당 URL 차단 | robots.txt 검토. staging 차단 규칙이 prod에 섞이지 않았는지 |
| **noindex 태그에 의해 제외됨** | 페이지에 `<meta name="robots" content="noindex">` 또는 `X-Robots-Tag: noindex` 헤더 | 색인되어야 하는 페이지면 noindex 제거 |
| **Soft 404** | 본문은 200으로 응답하지만 내용이 사실상 "없음" — 빈 페이지/얇은 콘텐츠 | 콘텐츠 보강 또는 진짜 404 응답으로 변경 |
| **중복, 사용자가 표시한 정규 URL 없음** | Google이 다른 URL을 정규로 선택, 사용자 페이지 미색인 | `<link rel="canonical">` 명시. 또는 페이지를 충분히 차별화 |
| **크롤됨 - 현재 색인되지 않음** | 크롤은 했지만 Google이 색인할 가치 없다고 판단 | **콘텐츠 품질 문제 신호.** 기술 이슈 아님. thin content·중복·낮은 가치 의심 |

> 주의: "크롤됨 - 현재 색인되지 않음"은 기술적 차단이 아니므로 robots.txt·noindex를 아무리 고쳐도 풀리지 않는다. 콘텐츠 측면(품질·중복·E-E-A-T)을 점검할 시점이다.

### 1.6 Core Web Vitals 보고서

- **데이터 소스:** Chrome 사용자 실측(CrUX = Chrome User Experience Report). Lighthouse 시뮬레이션 아님
- **지표(2026 기준 3개):** LCP(Largest Contentful Paint), CLS(Cumulative Layout Shift), INP(Interaction to Next Paint — 2024년 3월에 FID를 대체)
- 트래픽이 충분치 않으면 RUM 데이터가 부족해 보고서 비어 있을 수 있음 → PageSpeed Insights·Lighthouse 같은 lab data로 보완

### 1.7 검색 성능 보고서

- 조회·클릭·CTR·평균 게재순위를 query, page, country, device, search appearance 기준으로 분해
- 최대 16개월 데이터 보존(공식)
- API로 raw 데이터 가져오기 가능: Search Console API + OAuth (`searchanalytics.query`)

### 1.8 Google Indexing API의 한계 — 일반 사이트에 쓰지 마라

자주 오해되는 부분. Google Indexing API는 **JobPosting** 또는 **VideoObject 내 BroadcastEvent** 구조화 데이터가 있는 페이지에만 공식 지원된다.

- 기본 할당량: 200 publish 요청/일, 180 read/분 per 프로젝트
- 블로그 글·일반 상품·뉴스 페이지에 호출해봐야 Google은 무시한다 (공식 입장)
- 그 외 사이트가 빠른 색인을 원하면: sitemap 갱신 + URL 검사 도구 색인 요청 + 내부 링크 구조 + 외부 백링크

---

## 2. Bing Webmaster Tools

### 2.1 등록 — GSC Import가 가장 빠르다

Bing은 GSC에서 검증된 사이트를 **그대로 import**하는 기능을 2019년부터 제공하며 한국 운영자도 그대로 활용 가능하다.

1. https://www.bing.com/webmasters 접속 → Microsoft 계정 로그인
2. "My Sites" → **Import** 버튼
3. Google 계정으로 인증 → GSC 검증된 사이트 목록이 표시됨
4. 가져올 사이트 선택 → Import
5. 자동 검증 완료 + 기존 sitemap도 함께 import

**제한:** 한 번에 최대 100개, 계정당 최대 1,000개. Bing이 주기적으로 GSC와 동기화하여 소유권 상태 재검증.

### 2.2 수동 인증 (GSC import 안 쓸 때)

| 방법 | 절차 |
|------|------|
| XML 파일 | `BingSiteAuth.xml` 다운로드 → 루트 업로드 |
| 메타태그 | `<meta name="msvalidate.01" content="...">` 추가 |
| DNS CNAME | CNAME 레코드 추가 |

### 2.3 URL 제출 & IndexNow

- 콘솔 → "URL 제출" 도구로 하루 최대 10,000 URL push 가능 (정확한 한도는 사이트별 가변)
- **IndexNow 프로토콜 발신 가능** → Bing이 IndexNow의 주체 검색엔진, 한 번 제출하면 다른 IndexNow 참여 엔진(Yandex, Naver, Seznam, Yep)에도 자동 전파

---

## 3. Naver Search Advisor (네이버 서치어드바이저) — 한국 시장 필수

### 3.1 등록 절차

1. https://searchadvisor.naver.com 접속 → 네이버 계정 로그인
2. "웹마스터 도구" → "사이트 등록"
3. 도메인 입력 → 소유권 확인 단계로 진행

### 3.2 소유권 확인 방법

Naver는 다음 2가지 방법을 제공한다.

| 방법 | 절차 |
|------|------|
| **HTML 파일 업로드** | Naver가 제공하는 HTML 파일(예: `naverXXXX.html`)을 사이트 루트에 업로드 → "확인" 버튼 |
| **HTML 메타태그** | `<head>` 안에 `<meta name="naver-site-verification" content="...">` 추가 → "확인" 버튼 |

> 참고: WordPress·Tistory처럼 HTML 파일을 직접 수정 가능한 환경이어야 등록 가능하다. 일부 임대형 빌더에서는 등록 불가할 수 있다.

### 3.3 sitemap·RSS 제출

1. 좌측 메뉴 → "요청 > 사이트맵 제출"
2. 입력란에 `sitemap.xml` 입력 → "확인"
3. RSS도 같은 방식으로 "RSS 제출" 메뉴에서 제출

**sitemap 규격:** Google sitemap 표준(sitemaps.org)을 그대로 사용한다. Google과 같은 sitemap 파일 그대로 제출 가능.

### 3.4 IndexNow 지원 (2023-07-25부터)

Naver는 2023년 7월 25일부터 IndexNow를 공식 지원한다. Search Advisor에서 IndexNow API 키를 생성·등록하면 IndexNow 표준 그대로 Naver에 push 가능.

### 3.5 robots.txt 검증 + 웹 표준 점검

- "검증 > robots.txt" — Naverbot 기준으로 robots.txt 규칙이 어떻게 적용되는지 시뮬레이션
- "검증 > 웹 페이지 최적화" — Naver 자체 진단 도구. 검색 노출에 영향 주는 요소(Open Graph, 모바일 친화성, HTTPS 등) 점검

### 3.6 첫 색인까지 소요 시간

Naver 봇이 사이트를 크롤링하고 통합검색에 반영되기까지 **최소 2~4주**. 즉시 노출은 기대하지 말 것.

---

## 4. Yandex Webmaster — 러시아·CIS

### 4.1 등록 + 소유권 확인

1. https://webmaster.yandex.com 접속 → Yandex 계정 로그인
2. "Add Site" 또는 "+" 버튼
3. 소유권 확인 — 3가지 방법:
   - **HTML 파일** — 제공된 코드를 담은 파일을 루트에 업로드
   - **메타태그** — `<head>`에 `yandex-verification` 메타태그
   - **DNS TXT** — 도메인 등록업체에서 TXT 레코드 추가

### 4.2 sitemap 제출

1. 좌측 "Indexing settings → Sitemap files"
2. sitemap URL 입력 → "Add"
3. Yandex 봇이 sitemap 처리하는 데 **최대 2주** 소요

### 4.3 Yandex.Metrica 연동

Yandex.Metrica는 GA에 해당하는 Yandex 분석 도구. Webmaster와 같은 계정으로 연동하면 검색 트래픽 + 사이트 행동 통합 분석.

### 4.4 IndexNow

Yandex는 IndexNow 공동 창시자(Microsoft Bing과 함께)다. Yandex.com/indexnow 엔드포인트 기본 제공.

---

## 5. Baidu Ziyuan (百度搜索资源平台) — 중국 시장

### 5.1 진입 장벽 — ICP 备案

> 주의: 중국 본토 호스팅 사이트는 **ICP 备案(공안부 등록증)** 없이는 색인이 사실상 제한된다. ICP는 中華人民共和國 工业和信息化部(MIIT)가 발급하는 필수 인증이다.
> - 비영리: ICP 备案
> - 상업·결제 사이트: ICP 经营许可证(Commercial License)
> - 발급 처리 기간: 외국 법인 기준 통상 2~3개월

해외 호스팅(홍콩·싱가포르 등)에 둘 경우 ICP 없이도 접근은 되지만 Baidu 색인 우선순위가 낮고 페이지 로딩이 느려 SEO상 불리하다.

### 5.2 인터페이스

- https://ziyuan.baidu.com (인터페이스 100% 중국어)
- Baidu 계정 필요 (자체 회원가입)
- 영어 모드 없음 — 운영자는 번역 도구(DeepL·Chrome 자동번역) 사용

### 5.3 URL 제출 방법 3종 (普通收录 = 일반 색인)

| 방법 | 중국어 명칭 | 설명 | 속도 |
|------|-------------|------|------|
| sitemap | sitemap 提交 | sitemap.xml 등록 → Baidu가 주기적으로 가져감 | 느림 |
| 主动推送 (Active Push) | 主动推送 (API) | API로 직접 push. 16자 영숫자 token 필요 | 빠름 |
| 自动推送 (Auto Push) | 自动推送 | 페이지에 JS 스니펫 삽입, 사용자가 방문할 때마다 자동 push | 페이지 방문 의존 |

**주의:** API 提交과 수동 제출은 quota 공유, sitemap은 별도 quota. 모두 당일 quota만 유효(누적 불가).

### 5.4 主动推送 API 예시

```bash
curl -H 'Content-Type:text/plain' \
  --data-binary @urls.txt \
  "http://data.zz.baidu.com/urls?site=https://www.example.com&token=YOUR_TOKEN"
```

`urls.txt`는 줄당 1개 URL의 plain text 파일. token은 Baidu 站长平台 → 普通收录 → 主动推送 도구에서 발급.

---

## 6. IndexNow 프로토콜 — 변경 즉시 push (Bing·Yandex·Naver·Seznam·Yep)

### 6.1 핵심 개념

IndexNow는 Microsoft Bing과 Yandex가 2021년에 공동 발표한 push 기반 색인 프로토콜이다. URL이 생성·수정·삭제될 때 사이트가 검색엔진에 능동적으로 알리는 표준.

**2026 기준 채택 검색엔진:** Bing, Yandex, Naver(2023-07-25부터), Seznam.cz, Yep
**Google:** 채택하지 않음. 2022년 테스트만 진행했고 공식 도입 안 함

**참여 엔진 간 자동 전파:** 한 곳에 push하면 모든 참여 엔진이 공유받는다. 즉 Bing에 push하면 Naver·Yandex도 자동 수신.

### 6.2 키 파일 인증

1. **키 생성** — 8~128자, hex(a-z, A-Z, 0-9) + 대시만, RFC-3986 URI 표준
2. **키 파일 호스팅** — UTF-8 텍스트 파일로 키와 동일한 내용 1줄을 담아 사이트 루트에 업로드
   - 기본 위치: `https://example.com/{your-key}.txt`
   - 서브디렉토리도 가능하나 `keyLocation`이 위치한 디렉토리 이하 URL만 push 가능

### 6.3 API 호출 (단일 URL — GET)

```
https://api.indexnow.org/indexnow?url=https://example.com/new-post&key=YOUR_KEY_HERE
```

### 6.4 API 호출 (다중 URL — POST)

```bash
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "host": "www.example.com",
    "key": "abc123def4567890",
    "keyLocation": "https://www.example.com/abc123def4567890.txt",
    "urlList": [
      "https://www.example.com/blog/post-1",
      "https://www.example.com/blog/post-2"
    ]
  }'
```

- 한 요청당 최대 10,000 URL
- 응답 코드: `200 OK`(성공) / `202 Accepted`(키 검증 대기) / `400`(형식 오류) / `403`(키 검증 실패) / `429`(과다 요청)

### 6.5 호출 빈도 가이드

- 변경 시점에만 push (게시·수정·삭제 직후)
- 같은 URL을 변경 없이 반복 push 하지 말 것 (스팸 판정 → `429`)
- 정적 사이트라면 배포 hook(GitHub Actions, Vercel, Netlify)에 통합

---

## 7. 신규 사이트 출시 D-Day 체크리스트

### 7.1 출시 전 (T-1일까지)

- [ ] `sitemap.xml` 생성 및 접근 가능 (`https://example.com/sitemap.xml` HTTP 200)
- [ ] `robots.txt` 작성, sitemap URL 명시 (`Sitemap: https://example.com/sitemap.xml`)
- [ ] noindex 페이지가 sitemap에서 제외되어 있는지 확인
- [ ] staging 환경 차단 규칙이 prod robots.txt에 섞이지 않았는지 확인
- [ ] 다국적 사이트면 `hreflang` 어노테이션이 페이지 또는 sitemap에 양방향으로 들어있는지
- [ ] canonical 태그가 모든 페이지에 일관되게 설정
- [ ] HTTPS 전체 적용, HTTP는 301 리다이렉트
- [ ] Open Graph, Twitter Card 메타 설정 (Naver는 OG를 검색 결과에 활용)

### 7.2 출시 당일 (D-Day)

1. **GSC 등록** (Domain 속성) → DNS TXT 인증 → sitemap 제출
2. **Naver Search Advisor 등록** → HTML 파일 또는 메타태그 인증 → sitemap·RSS 제출 → IndexNow 키 발급
3. **Bing Webmaster** → GSC import로 일괄 등록
4. **IndexNow 키 파일 호스팅** (`/{key}.txt` 업로드)
5. **첫 IndexNow push** — 주요 진입 URL 10~20개를 즉시 push
6. (해당되면) **Yandex Webmaster** 등록, (중국 타깃이면) **Baidu Ziyuan** + ICP 확인

### 7.3 출시 후 (D+1 ~ D+30)

| 시점 | 작업 |
|------|------|
| D+1 ~ D+3 | GSC URL 검사 도구로 핵심 페이지 5~10개 색인 요청 |
| D+7 | GSC "페이지" 보고서 첫 확인 — 색인 안 됨 사유 점검 |
| D+14 | Naver 노출 시작 여부 확인 (네이버 검색에서 `site:example.com`) |
| D+30 | GSC 검색 성능 보고서 첫 분석 — 노출되는 query 패턴 확인 |

### 7.4 첫 색인까지 소요 시간 (참고)

| 검색엔진 | 신규 도메인 첫 색인 |
|----------|---------------------|
| Google | 2~4주 (일부 페이지) / 2~3개월 (전체) |
| Bing | 1~2주 |
| Naver | 2~4주 |
| Yandex | sitemap 처리 2주 이내 |
| Baidu | ICP 보유 시 2~4주, 미보유 시 사실상 색인 안 됨 |

> 주의: 모든 수치는 평균치다. 사이트 권위·콘텐츠 품질·내부 링크 구조에 따라 크게 변동. Google은 "색인 보장 없음"을 공식 입장으로 한다.

---

## 8. 자동 sitemap 갱신·제출 패턴

### 8.1 GSC — Search Console API

- OAuth 2.0 인증 + Search Console API 활성화
- `sitemaps.submit` 메서드로 빌드 후 자동 sitemap 제출 가능
- GitHub Actions 워크플로우 예: 배포 성공 후 → API로 sitemap.xml 재제출

### 8.2 Bing / Yandex / Naver — IndexNow webhook

- 콘텐츠 발행/수정 시점에 IndexNow API 호출
- WordPress 플러그인, Next.js generateStaticParams 후 hook, Vercel Deploy hook 등에 통합

### 8.3 Baidu — 主动推送 hook

- 배포 hook에서 `urls.txt` 생성 → `data.zz.baidu.com/urls` API 호출

### 8.4 Google에 즉시 push가 필요할 때

- 일반 콘텐츠: **방법 없음.** sitemap 갱신 + 내부 링크 강화가 정공법
- JobPosting·BroadcastEvent: Indexing API로 push (200 req/일 기본 quota)

---

## 9. 흔한 실수 패턴

| 실수 | 원인 | 해결 |
|------|------|------|
| 소유권 확인도 안 했는데 sitemap 제출 시도 | 절차 누락 | 인증 → sitemap 순서 엄수 |
| URL prefix 속성만 등록 → http/https/www 따로 등록 필요 | Domain 속성 미사용 | DNS 접근 가능하면 Domain 속성으로 통합 |
| sitemap에 noindex URL 포함 | sitemap 자동 생성 도구가 모든 URL 포함 | sitemap 생성 시 noindex·canonical 필터링 |
| staging robots.txt가 prod에 배포됨 | 환경별 설정 분리 누락 | 환경변수·빌드 단계에서 robots.txt 동적 생성 |
| "크롤됨 - 현재 색인되지 않음"을 기술 이슈로 봄 | GSC 보고서 분류 오해 | 콘텐츠 품질 문제다. thin content·중복·E-E-A-T 점검 |
| GSC = GA로 혼동 | 둘 다 Google 도구라서 헷갈림 | GSC: 검색 노출 / GA: 사이트 행동. 둘 다 필요 |
| 한국 사이트인데 Naver Search Advisor 미등록 | "Google만 등록하면 되겠지" | Naver 등록은 한국 SEO 필수 |
| 중국 진출인데 ICP 없이 시작 | 절차 모름 | ICP 신청은 사이트 출시 2~3개월 전부터 |
| Google Indexing API를 블로그·상품 페이지에 사용 | 잘못된 API 용도 이해 | JobPosting·BroadcastEvent만. 일반 사이트는 sitemap·내부 링크 |
| IndexNow 키 파일을 잘못된 경로에 호스팅 | 키 파일 위치 규칙 위반 | 루트 또는 `keyLocation` 디렉토리 이하만 push 가능 |
| 같은 URL을 IndexNow로 반복 push | 변경 없음에도 push | 변경된 URL만 push (게시·수정·삭제 시점) |
| GSC 색인 요청을 매일 같은 URL에 반복 | 첫 요청만 큐에 들어감을 모름 | 한 번 요청 후 결과 대기. 반복 무의미 |

---

## 10. 인덱싱 진단 결정 트리

페이지가 색인되지 않을 때:

```
[GSC URL 검사 도구로 해당 URL 검사]
        |
        v
"URL이 Google에 등록되어 있음?"
   |                              |
  YES                            NO
   |                              |
   v                              v
색인 됨. 검색 결과         "색인 안 됨" 사유 확인 (페이지 보고서)
노출 안 되면 콘텐츠               |
품질·키워드 분석으로 이동          v
                          ┌─────────┴──────────┐
                          |                    |
            기술 차단(robots/noindex)    Soft 404 / 중복 / 크롤됨-색인 안 됨
                          |                    |
                          v                    v
              차단 규칙 수정 → 재검사     콘텐츠 품질 보강 (본문량·고유성·E-E-A-T)
                          |                    |
                          v                    v
              "색인 생성 요청" 클릭        sitemap에 마지막 수정일 갱신 → 재크롤 유도
                                              |
                                              v
                                      재크롤 후에도 안 되면 → 콘텐츠 재작성
```

> 핵심 원칙: 기술 차단(robots.txt·noindex)은 빠르게 해결되지만, "크롤됨 - 현재 색인되지 않음"은 콘텐츠 가치 문제이므로 시간이 더 걸린다. 색인 요청 버튼을 100번 눌러도 해결 안 된다.

---

## 11. 언제 이 스킬을 쓰는가 / 안 쓰는가

| 쓴다 | 안 쓴다 |
|------|---------|
| 신규 사이트 출시 SEO 준비 | 키워드 리서치 (별도 SEO 스킬 영역) |
| 기존 사이트 색인 문제 진단 | 백링크 분석 (Ahrefs·SEMrush 등 외부 도구) |
| 글로벌·다국적 사이트 검색엔진 확장 | 광고(SEM) 운영 |
| 자동 색인 push 인프라 설계 (IndexNow·Indexing API) | 콘텐츠 작성 자체 |

---

## 12. 참고 공식 문서

- Google Search Console Help: https://support.google.com/webmasters
- Google Indexing API: https://developers.google.com/search/apis/indexing-api/v3/quickstart
- Bing Webmaster Tools: https://www.bing.com/webmasters
- Naver Search Advisor: https://searchadvisor.naver.com
- Yandex Webmaster Help: https://yandex.com/support/webmaster
- Baidu 搜索资源平台: https://ziyuan.baidu.com
- IndexNow: https://www.indexnow.org/documentation
- sitemaps.org 표준: https://www.sitemaps.org/protocol.html
