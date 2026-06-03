---
name: google-indexing-api
description: Google Indexing API의 사용 자격·호출법·할당량·검증법을 정확히 정리. JobPosting과 BroadcastEvent(livestream)에만 공식 지원되며 일반 사이트에는 사용 불가하다는 점을 초반에 명확히 한다.
---

# Google Indexing API

> 소스:
> - https://developers.google.com/search/apis/indexing-api/v3/quickstart
> - https://developers.google.com/search/apis/indexing-api/v3/prereqs
> - https://developers.google.com/search/apis/indexing-api/v3/using-api
> - https://developers.google.com/search/apis/indexing-api/v3/quota-pricing
> - https://developers.google.com/search/apis/indexing-api/v3/reference/indexing/rest/v3/urlNotifications/publish
>
> 검증일: 2026-06-02

---

## 0. 가장 먼저 — 이 API는 일반 사이트에 쓸 수 없다

Google Indexing API는 **schema.org 두 가지 타입만 공식 지원**한다.

| 콘텐츠 타입 | 지원 여부 |
|------------|:---------:|
| `JobPosting` (채용공고) | ✅ 공식 지원 |
| `BroadcastEvent` (라이브스트리밍 VideoObject 내부) | ✅ 공식 지원 |
| 일반 블로그 글 | ❌ 무시됨 |
| 이커머스 상품 페이지 | ❌ 무시됨 |
| 뉴스·매체 기사 | ❌ 무시됨 |
| 회사 소개·랜딩 페이지 | ❌ 무시됨 |
| 카테고리·태그 페이지 | ❌ 무시됨 |

> **주의:** 일반 콘텐츠에 호출해도 API 응답은 200 OK가 올 수 있지만 **Google은 해당 신호를 무시한다**. "API가 작동하는 것처럼 보인다"가 "인덱싱된다"를 의미하지 않는다.

**일반 콘텐츠를 빠르게 인덱싱하려는 경우 정공법:**
- 정확한 sitemap.xml 유지 + Search Console에 제출
- 내부 링크 구조 개선 + 크롤 예산 최적화
- Search Console "URL 검사" 도구에서 수동 색인 요청
- Bing/Yandex/Naver/Seznam 대상은 IndexNow (Google 미지원) — 11번 섹션 참고

이 스킬의 나머지는 **JobPosting 또는 BroadcastEvent를 운영하는 경우**에만 적용된다.

---

## 1. 사용 자격 (Prerequisites)

5단계를 모두 충족해야 한다.

### 1-1. Google Cloud 프로젝트 + API 활성화

1. https://console.cloud.google.com 에서 새 프로젝트 생성
2. API 라이브러리에서 "Indexing API" 검색 후 **Enable**

### 1-2. Service Account 생성 + JSON 키 다운로드

1. Cloud Console → IAM & Admin → Service Accounts → **Create Service Account**
2. 이름 입력 (예: `indexing-api-publisher`) — Cloud 역할(role)은 비워둬도 무방
3. 생성된 Service Account → "Keys" 탭 → **Add Key → Create new key → JSON**
4. 다운로드된 JSON 파일을 안전하게 보관 (커밋 금지)
5. JSON의 `client_email` 필드 값을 기록 — 다음 단계에서 사용
   - 형식: `indexing-api-publisher@<project-id>.iam.gserviceaccount.com`

### 1-3. Search Console에서 사이트 소유권 확인

이미 Search Console에 도메인 또는 URL-prefix 속성이 등록되어 있어야 한다. 미등록이면 먼저 등록한다.

### 1-4. Service Account를 사이트 **Owner**로 추가 (가장 흔한 실수 지점)

1. Search Console → 해당 속성 선택
2. **Settings → Users and permissions → Add user**
3. 위 1-2에서 기록한 `client_email` 입력
4. **Permission: Owner 선택 (Full 아님!)**

> **주의:** Permission을 **Full**로 두면 모든 API 호출이 **403 Permission Denied**로 실패한다. **Owner로 명시적으로 설정**해야 한다. 이게 가장 흔한 setup 실수다.

### 1-5. OAuth 스코프

라이브러리 클라이언트(googleapis 등)에서 다음 스코프로 인증한다:

```
https://www.googleapis.com/auth/indexing
```

---

## 2. API 호출 — Node.js (googleapis) 예시

### 2-1. 단일 URL publish

```javascript
// publish-url.mjs
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: './service-account.json', // 1-2에서 받은 JSON 키
  scopes: ['https://www.googleapis.com/auth/indexing'],
});

const indexing = google.indexing({ version: 'v3', auth });

async function publishUrl(url, type = 'URL_UPDATED') {
  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: { url, type },
    });
    console.log('Submitted:', response.data);
    return response.data;
  } catch (err) {
    // 403: Search Console Owner 권한 누락
    // 429: 일일 할당량(200) 초과
    // 400: URL 형식 오류 또는 미지원 콘텐츠 타입에 대한 거부
    console.error('Indexing API error:', err.message, err.code);
    throw err;
  }
}

// 새 채용공고 게시 시
await publishUrl('https://example.com/jobs/123', 'URL_UPDATED');

// 채용공고 마감 (페이지가 410/404를 반환해야 함)
await publishUrl('https://example.com/jobs/123', 'URL_DELETED');
```

**핵심 포인트:**
- `type: 'URL_UPDATED'` — 새 페이지 게시 또는 콘텐츠 변경
- `type: 'URL_DELETED'` — 페이지 제거 (페이지가 실제로 410 또는 404를 반환해야 한다)
- 응답 200 OK는 **접수 확인일 뿐**, 실제 인덱싱 완료를 의미하지 않는다.

### 2-2. 메타데이터 조회 (마지막 publish 시각)

```javascript
const meta = await indexing.urlNotifications.getMetadata({
  url: 'https://example.com/jobs/123',
});
console.log(meta.data);
// {
//   url: 'https://example.com/jobs/123',
//   latestUpdate: { url, type: 'URL_UPDATED', notifyTime: '...' },
//   latestRemove: { url, type: 'URL_DELETED', notifyTime: '...' }
// }
```

### 2-3. 배치 publish (최대 100 URL/요청)

`googleapis` 라이브러리는 HTTP batch endpoint를 통해 한 HTTP 요청에 최대 100건을 묶을 수 있다.

```javascript
// 배치 헬퍼 (예시)
async function batchPublish(urls) {
  const requests = urls.map((url) =>
    indexing.urlNotifications.publish({
      requestBody: { url, type: 'URL_UPDATED' },
    })
  );
  // Promise.all은 개별 HTTP 요청을 100개 발생시킨다 (할당량 100 소비).
  // 실제 1 HTTP 요청 배치를 원하면 google-api-batch 또는 직접 multipart/mixed 요청을 구성한다.
  return Promise.allSettled(requests);
}
```

> **주의:** `Promise.all`로 100건 호출 = **publish 할당량 100건 소비**한다. "1 HTTP 요청에 100건"이 곧 "할당량 1 소비"가 아니다. 할당량은 **publish 단위로 계산**된다.

---

## 3. 할당량 (Quota)

| 항목 | 기본값 |
|------|--------|
| publish 일일 한도 | **200 / day / project** |
| getMetadata (읽기) | 180 / minute / project |
| 모든 endpoint 합산 | 380 / minute / project |
| batch HTTP 요청당 최대 | 100 호출 |
| 가격 | 무료 |

**할당량 리셋:** 매일 태평양 표준시(PT) 자정 (최대 24시간 소요).

**증액 신청:** Google이 제공하는 공식 양식을 통해 신청한다. Cloud Console "Quotas" 페이지에서 안내된 링크로 진입. 승인 기준은 콘텐츠 품질·도메인 신뢰도 기반이며, 거꾸로 할당량이 줄어들 수도 있다.

**할당량 초과 시 응답:** `429 Too Many Requests`.

---

## 4. URL_UPDATED vs URL_DELETED

| type | 사용 시점 | 페이지 상태 요구 |
|------|----------|-----------------|
| `URL_UPDATED` | 새 페이지 게시, 콘텐츠 변경 | 200 OK + 올바른 schema.org 마크업 |
| `URL_DELETED` | 페이지 제거 | **410 Gone** 또는 **404 Not Found** 반환해야 함 |

> **주의:** `URL_DELETED`를 `noindex` 메타 태그 대안으로 사용하면 안 된다. 페이지가 실제로 410/404를 반환하지 않는 상태에서 호출하면 Google은 무시한다.

**JobPosting 특수 사항:** `validThrough`(만료일) 이후에는 자동으로 만료 처리된다. 별도 `URL_DELETED` 호출이 필수가 아니지만, 신속한 인덱스 제거가 필요하면 호출한다.

---

## 5. JobPosting 마크업 필수 요건 (간단)

API 호출 전에 페이지에 정확한 JSON-LD가 있어야 한다. 필수 필드:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  "title": "Senior Backend Engineer",
  "description": "...",
  "datePosted": "2026-06-02",
  "validThrough": "2026-07-02T23:59:00+09:00",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Acme Corp",
    "sameAs": "https://acme.example.com"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "...",
      "addressLocality": "Seoul",
      "addressCountry": "KR"
    }
  }
}
</script>
```

상세 schema는 별도 스킬 `[[schema-org-patterns]]`에 위임한다.

**검증 도구:**
- Schema Markup Validator: https://validator.schema.org/
- Google Rich Results Test: https://search.google.com/test/rich-results

> **주의:** 필수 필드 누락 또는 잘못된 JSON-LD는 API 호출 자체는 성공하지만 Google이 무시한다.

---

## 6. 호출 결과 검증 — 정말 인덱싱됐는지 확인

API 응답 200 OK = **접수 완료**일 뿐. 다음 단계로 실제 결과를 확인한다.

| 확인 방법 | 위치 | 의미 |
|----------|------|------|
| getMetadata 응답의 `notifyTime` | 라이브러리 호출 | Google이 알림을 받은 시각 |
| Search Console "URL 검사" → "마지막 크롤" | GSC UI | Googlebot 재방문 시각 |
| Search Console "범위(Coverage)" 보고서 | GSC UI | 인덱스 등재 여부 |

**일반적인 타임라인 (live 환경 기준):**
1. `publish` 호출 → 즉시 200 OK
2. Googlebot 재방문 → 1~24시간 내
3. 인덱스 등재 (또는 거부) → 별도. 콘텐츠 품질·중복 여부 등 일반 인덱싱 기준 적용

> **주의:** API를 호출했다고 인덱싱이 보장되지 않는다. 인덱싱 단계는 일반 SEO 평가를 따른다.

---

## 7. CI 통합 패턴 — GitHub Actions

콘텐츠 publish 또는 CMS webhook 후 자동으로 Indexing API를 호출하는 워크플로.

### 7-1. Secret 등록

GitHub 리포지토리 → Settings → Secrets and variables → Actions:

| Secret 이름 | 값 |
|------------|-----|
| `GOOGLE_INDEXING_SA_JSON` | Service Account JSON 키 전체 내용 |

### 7-2. 워크플로 파일

```yaml
# .github/workflows/indexing-api-publish.yml
name: Notify Google Indexing API

on:
  workflow_dispatch:
    inputs:
      url:
        description: 'URL to notify'
        required: true
      type:
        description: 'URL_UPDATED or URL_DELETED'
        required: true
        default: 'URL_UPDATED'
  # CMS webhook의 경우 repository_dispatch 이벤트 활용
  repository_dispatch:
    types: [content-published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Write service account key
        run: echo '${{ secrets.GOOGLE_INDEXING_SA_JSON }}' > ./service-account.json

      - name: Install googleapis
        run: npm install googleapis

      - name: Publish to Indexing API
        run: node ./scripts/publish-url.mjs
        env:
          TARGET_URL: ${{ github.event.inputs.url || github.event.client_payload.url }}
          TARGET_TYPE: ${{ github.event.inputs.type || 'URL_UPDATED' }}

      - name: Cleanup
        if: always()
        run: rm -f ./service-account.json
```

```javascript
// scripts/publish-url.mjs
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: './service-account.json',
  scopes: ['https://www.googleapis.com/auth/indexing'],
});
const indexing = google.indexing({ version: 'v3', auth });

const url = process.env.TARGET_URL;
const type = process.env.TARGET_TYPE || 'URL_UPDATED';

const res = await indexing.urlNotifications.publish({
  requestBody: { url, type },
});
console.log(JSON.stringify(res.data, null, 2));
```

**보안 주의:**
- Service Account JSON은 **절대 커밋하지 않는다**. `.gitignore`에 `service-account.json` 추가.
- 워크플로 종료 시 `rm -f`로 제거한다.

---

## 8. 사용 안 되는 케이스 — "왜 안 되는지" 명확히

| 케이스 | 결과 | 원인 |
|--------|------|------|
| 일반 블로그 글에 호출 | 200 OK 받지만 인덱싱 신호 무시 | API 정책상 JobPosting/BroadcastEvent 외 미지원 |
| 이커머스 상품 페이지에 호출 | 무시 | 동상 |
| JobPosting 마크업 없이 호출 | 무시 | 페이지가 schema.org 요구 미충족 |
| JobPosting 필수 필드 누락 | 무시 | `title`, `datePosted`, `hiringOrganization` 등 누락 |
| Search Console 미등록 사이트 | 403 | 소유권 확인 안 됨 |
| Service Account를 Full 권한으로 추가 | **403** | **Owner 권한 필요** (Full로는 부족) |
| 잘못된 도메인 속성에 등록 | 403 | `https://www.example.com`과 `https://example.com`은 별개 |
| 일일 200 호출 초과 | 429 | 할당량 초과, 다음 PT 자정까지 대기 또는 증액 신청 |
| `URL_DELETED` 호출했지만 페이지가 200 반환 | 무시 | 페이지가 실제로 410/404 반환해야 함 |
| API 응답 OK = 인덱싱 완료 가정 | 오해 | 응답은 접수 확인일 뿐 |

---

## 9. IndexNow와의 차이

| 항목 | Google Indexing API | IndexNow |
|------|--------------------|----------|
| 지원 검색엔진 | Google만 | Bing, Yandex, Naver, Seznam.cz, Yep |
| Google 지원? | ✅ | ❌ (2026년 현재도 미채택) |
| 지원 콘텐츠 타입 | JobPosting, BroadcastEvent만 | 모든 콘텐츠 타입 |
| 인증 | OAuth Service Account + Search Console Owner | API 키(텍스트 파일) — 매우 간단 |
| 일일 한도 | 200/일 (기본) | 요청당 최대 10,000 URL |
| 비용 | 무료 | 무료 |

**실무 권장 조합:**
- **Google**: Search Console + 정확한 sitemap.xml + 내부 링크 (Indexing API는 JobPosting/livestream에만)
- **Bing/Yandex/Naver**: IndexNow로 즉시 알림 — 상세는 `[[search-console-webmaster]]` 또는 별도 IndexNow 스킬 참고

---

## 10. 흔한 실수 패턴

1. **일반 블로그 글에 Indexing API 호출**
   - 결과: 무시됨. 정공법은 sitemap + Search Console.

2. **JobPosting 마크업 없이 호출**
   - 결과: 무시됨. 먼저 JSON-LD를 페이지에 정확히 박는다.

3. **Service Account 권한을 Full로 설정**
   - 결과: 403 Permission Denied. **반드시 Owner**로 설정.

4. **잘못된 Search Console 속성에 권한 부여**
   - 결과: 403. `https://www.example.com`과 `https://example.com`은 별개 속성이다. 호출하는 URL과 정확히 일치하는 속성에 권한이 있어야 한다.

5. **API 호출 직후 Search Console에서 즉시 결과 확인**
   - Googlebot 재방문은 보통 1~24시간 후. 1분 후 확인은 무의미.

6. **`URL_DELETED`를 noindex 대체로 사용**
   - 페이지가 실제로 200을 반환하면 Google은 신호를 무시한다. **410 또는 404를 반환해야** 한다.

7. **일일 200건 초과 호출**
   - 429 에러. 증액 신청 또는 우선순위 URL만 선별.

8. **API 응답 200 OK = 인덱싱 완료로 오해**
   - 응답은 접수 확인이지 인덱싱 보장이 아니다. 인덱싱 자체는 콘텐츠 품질 평가를 거친다.

9. **Service Account JSON을 리포지토리에 커밋**
   - 보안 사고. 즉시 키 폐기 + 재발급. `.gitignore` 등록 필수.

10. **`validThrough` 이후에도 페이지 유지**
    - JobPosting의 `validThrough`가 지나면 페이지를 410/404로 만들거나 별도 만료 처리 — 죽은 채용공고가 인덱스에 남아 사용자 신호 악화.

---

## 11. 빠른 결정 가이드

```
내 사이트가 JobPosting 또는 BroadcastEvent를 운영하는가?
├─ 아니오 → Indexing API 쓰지 않는다.
│           sitemap + Search Console + (Bing/Yandex/Naver는 IndexNow)
└─ 예 → 1번 섹션 prereqs 5단계 모두 수행
        → 2번 섹션 코드로 publish
        → 6번 섹션으로 결과 검증
        → 일일 200 초과 시 quota 증액 신청
```

---

## 12. 관련 스킬

- `[[schema-org-patterns]]` — JobPosting, BroadcastEvent JSON-LD 상세
- `[[search-console-webmaster]]` — Search Console 설정·sitemap 제출·IndexNow
