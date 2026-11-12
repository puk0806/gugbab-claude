---
name: search-console-webmaster
description: 검색엔진 웹마스터 콘솔(Google·Bing·Naver·Yandex·Baidu) 운영에서 모델이 틀리기 쉬운 수치·한도·함정만 모은 스킬 — GSC 색인 요청 일일 한도, Indexing API 용도 제한·할당량, IndexNow 참여 엔진(Google 미참여)·키 규격·응답 코드·Naver 엔드포인트, Search Console API 한도·지연·siteUrl 형식, GitHub Actions cron 함정, "크롤됨-색인 안 됨" 해석, Baidu ICP·quota, 엔진별 첫 색인 소요 시간.
---

# 웹마스터 콘솔 — 실측 수치·한도·함정

> 소스:
> - Google Search Console Help: https://support.google.com/webmasters
> - Bing Webmaster Tools: https://www.bing.com/webmasters
> - Naver Search Advisor: https://searchadvisor.naver.com
> - Yandex Webmaster: https://webmaster.yandex.com
> - Baidu 搜索资源平台: https://ziyuan.baidu.com
> - IndexNow Documentation: https://www.indexnow.org/documentation
> - Google Indexing API: https://developers.google.com/search/apis/indexing-api/v3/quickstart
> - (3.4 네이버 엔드포인트·8.5 — 구 seo-monitoring-automation 에서 옮김) 네이버 서치어드바이저 IndexNow 가이드: https://searchadvisor.naver.com/guide/indexnow-request
> - Search Console API: https://developers.google.com/webmaster-tools/v1/api_reference_index · Search Analytics query: https://developers.google.com/webmaster-tools/v1/searchanalytics/query · URL Inspection: https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect · Usage Limits: https://developers.google.com/webmaster-tools/limits
> - IndexNow 참여 검색엔진 목록: https://www.indexnow.org/searchengines.json
> - GitHub Actions Workflow Syntax: https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions
> - sitemaps.org 표준: https://www.sitemaps.org/protocol.html
>
> 검증일: 2026-11-09 (11-09 재검증: Indexing API 200 publish/일·180 getMetadata/분·JobPosting/BroadcastEvent 전용·배치 100건 VERIFIED, IndexNow 키 8~128자·POST 10,000 URL VERIFIED. 바뀐 점: IndexNow 공식 참여자 목록에 Internet Archive·Amazonbot 추가, 응답 코드 `422` 추가, 키 허용 문자 표기 정정 / 이전 2026-09-28 · 최초 2026-06-02 · 08-26 1차 재검증 · 09-28 2차 재검증: Google Indexing API 할당량 200 publish/일·180 read/분(2026-07-16 공식 문서 갱신 재확인)·JobPosting/BroadcastEvent 전용 범위·IndexNow 참여 검색엔진(Bing·Naver·Seznam.cz·Yandex·Yep, Google 미참여)·키 파일 규격(8~128 hex+대시)·Naver Search Advisor IndexNow 메뉴(소개·API Key·갱신 요청·FAQ) 활성 상태 전부 공식 소스 원문 대조 VERIFIED, 변경 없음. 분리 모바일 호스트는 `m.`·`www.` 속성을 각각 등록해 보고서를 분리하는 편이 진단에 유리)

---

## 1. Google Search Console

- **Domain 속성은 DNS TXT 인증만 가능**(http/https/서브도메인 통합). URL prefix 속성은 HTML 파일·메타태그·GA·GTM 도 가능하지만 프로토콜·서브도메인마다 따로 등록. 인증 토큰을 지우면 소유권을 잃는다(주기적 재확인).

> 주의: 색인 요청은 **하루 약 10~12회**(속성 기준)로 제한된다. 공식 발표 수치는 없으며 계정 이력에 따라 변동. 같은 URL을 반복 요청해도 첫 번째만 큐에 들어가고 나머지는 무시된다. 대량 push가 필요하면 sitemap 갱신 또는 IndexNow(Google은 미지원)·Indexing API(JobPosting·BroadcastEvent만)로.

> 주의: "크롤됨 - 현재 색인되지 않음"은 기술적 차단이 아니므로 robots.txt·noindex를 아무리 고쳐도 풀리지 않는다. 콘텐츠 측면(품질·중복·E-E-A-T)을 점검할 시점이다. 색인 요청 버튼을 반복해도 해결되지 않는다.

- sitemap: 파일당 50,000 URL·50MB(비압축), 초과 시 sitemap index. noindex·robots 차단 URL 을 넣으면 모순 신호.
- Core Web Vitals 보고서는 CrUX 실측(Lighthouse 아님) — 트래픽이 적으면 비어 있다. INP 가 2024-03 FID 를 대체.
- 검색 성능 데이터 보존 16개월.

**Indexing API** — 공식 지원은 **JobPosting** 또는 **VideoObject 내 BroadcastEvent** 구조화 데이터 페이지뿐. 블로그·상품·뉴스에 호출해도 Google 은 무시한다(공식 입장). 기본 할당량 200 publish/일, 180 getMetadata(read)/분 per 프로젝트, 배치 100건. 일반 콘텐츠를 Google 에 즉시 push 하는 방법은 없다 — sitemap 갱신 + 내부 링크.

## 2. Search Console API·cron 자동화 함정

> 2026-11-11 구 `seo-monitoring-automation` 스킬에서 옮김(원 검증일 2026-11-09). 기준: Search Console API v1(구 v3 alias 유지), GitHub Actions 현행 스키마.

| 함정 | 결과 | 대응 |
|------|------|------|
| Service Account를 만들고 **GSC 속성에 사용자로 추가하지 않음** | 403 PERMISSION_DENIED | GSC → 설정 → 사용자 및 권한에 서비스 계정 이메일 추가. 사이트맵 제출·삭제는 `webmasters` scope(조회만이면 `webmasters.readonly`) |
| 도메인 속성에 `https://...` siteUrl | 404 / 잘못된 siteUrl | URL 접두어는 `https://example.com/`(끝 슬래시), 도메인 속성은 `sc-domain:example.com` |
| 오늘·어제 날짜로 Search Analytics 조회 | 빈 결과·부분 데이터(표준 지연 약 2일) | `today - 3일` 이전만, 보존 한도 16개월 |
| Search Analytics 50,000행 초과 기대 | 요청당 `rowLimit` 최대 25,000, 검색 유형당 하루 최대 50,000행(clicks 정렬) | `startRow` 0·25000 두 번, 그 이상은 `dimensionFilterGroups`로 나눠 조회 |
| URL Inspection API 대량 루프 | 429 | 사이트당 **2,000/일·600/분**(프로젝트당 10,000,000/일·15,000/분). Search Analytics는 사이트·사용자당 1,200/분 + page+query·긴 기간일수록 커지는 load 한도(10분·1일 창) 별도 |
| `schedule` cron을 KST로 작성 | 9시간 오차 | 기본 UTC — 환산하거나 같은 항목에 `timezone: "Asia/Seoul"`(IANA, 2026-03 추가). DST 지역은 건너뛰는 시각이 다음 유효 시각으로 밀림 |
| 정시(`0분`) cron | 부하 시 지연, 매우 크면 대기 작업 누락 | 분 값을 비켜 쓰고 시간 민감 작업은 시작 시 시각 재확인. 최소 간격 5분 |
| 퍼블릭 레포 60일 무활동 | schedule 자동 비활성화 | `workflow_dispatch`로 주기적 수동 실행 |
| `service_account.json` 커밋 | 키 노출 | Secrets에 두고 step에서 파일로 복원 |

## 3. IndexNow

- 채택 검색엔진: Bing, Yandex(공동 창시, 2021), **Naver(2023-07-25부터)**, Seznam.cz, Yep. 그 밖의 공식 참여자(2026-11-09 `indexnow.org/searchengines.json`): Internet Archive(보존용 크롤), Amazonbot — 검색 노출 엔진은 아니지만 push 가 함께 전파된다. **Google 은 채택하지 않음**(2022년 테스트만).
- 한 곳에 push 하면 참여 엔진 전체가 공유받는다.
- **키**: 8~128자, 영문 대소문자(a-z, A-Z)·숫자(0-9)·대시(`-`)만 (공식 문서는 "hexadecimal"이라고도 적어 표기가 모호 — 안전하게 소문자 hex + 대시로 만들면 양쪽 해석 모두 충족). 키 파일은 UTF-8 1줄, 기본 `/{key}.txt`. 서브디렉토리에 두면 `keyLocation` 디렉토리 이하 URL 만 push 가능.
- POST 1회 최대 **10,000 URL**. 응답: `200`(성공) / `202`(키 검증 대기) / `400`(형식 오류) / `403`(키 검증 실패) / `422`(URL 이 host 에 속하지 않거나 키가 규격과 불일치) / `429`(과다 요청 — 변경 없는 URL 반복 push 는 스팸 판정).

**Naver 엔드포인트**

| 메서드 | 엔드포인트 | 용도 |
|--------|------------|------|
| GET | `https://searchadvisor.naver.com/indexnow?url={url}&key={key}` | 단일 URL |
| POST | `https://api.searchadvisor.naver.com/indexnow` | 다중 URL (본문 `host`·`key`·`keyLocation`·`urlList`) |

> 주의: 일부 자료에 `https://searchadvisor.naver.com/api/search/request`로 표기된 경우가 있으나, 공식 IndexNow 엔드포인트는 위 두 개(`/indexnow`)다. 네이버 서치어드바이저 가이드(`https://searchadvisor.naver.com/guide/indexnow-request`) 기준.
> 주의: 미검증(2026-11-09) — 네이버 가이드 원문에 접근하지 못해 POST 호스트(`api.searchadvisor.naver.com`)는 재확인하지 못했다. 네이버가 `searchadvisor.naver.com` 호스트로 IndexNow 참여 엔진 목록에 있는 것은 indexnow.org에서 확인했다. 쓰기 전에 가이드에서 한 번 더 확인한다.

## 4. 엔진별 특이사항

- **Naver Search Advisor**: 소유권 확인은 HTML 파일·메타태그 2종 — HTML 을 직접 수정할 수 없는 임대형 빌더에서는 등록이 안 될 수 있다. sitemap 은 sitemaps.org 표준 그대로, RSS 는 별도 제출. 한국 사용자 대상이면 등록 누락 금지.
- **Bing**: GSC Import(2019~)로 검증·sitemap 을 그대로 가져온다 — 한 번에 최대 100개, 계정당 1,000개, 주기적으로 GSC 와 동기화해 재검증. URL 제출 도구 하루 최대 10,000 URL(사이트별 가변).
- **Yandex**: sitemap 처리 최대 2주.
- **Baidu**: 중국 본토 호스팅은 **ICP 备案**(상업·결제 사이트는 ICP 经营许可证) 없이는 색인이 사실상 제한 — 외국 법인 발급 통상 2~3개월. 해외(홍콩·싱가포르) 호스팅은 접근은 되지만 색인 우선순위가 낮다. 인터페이스 중국어 전용. 主动推送 API 는 16자 영숫자 token(`data.zz.baidu.com/urls?site=...&token=...`, 본문 줄당 URL plain text). **API 提交과 수동 제출은 quota 공유, sitemap 은 별도 quota, 모두 당일만 유효(누적 불가).**

## 5. 첫 색인 소요 시간 (참고)

| 검색엔진 | 신규 도메인 첫 색인 |
|----------|---------------------|
| Google | 2~4주 (일부 페이지) / 2~3개월 (전체) |
| Bing | 1~2주 |
| Naver | 2~4주 |
| Yandex | sitemap 처리 2주 이내 |
| Baidu | ICP 보유 시 2~4주, 미보유 시 사실상 색인 안 됨 |

> 주의: 모든 수치는 평균치다. 사이트 권위·콘텐츠 품질·내부 링크 구조에 따라 크게 변동. Google은 "색인 보장 없음"을 공식 입장으로 한다.
