---
name: kakao-share-optimization
description: >
  카카오톡 링크 공유 시 OG 미리보기를 최적화하는 방법.
  카카오 캐시 초기화, 이미지 사양, JavaScript SDK 공유 구현, SPA 환경 대응을 다룬다.
  <example>사용자: "카카오톡 공유했는데 미리보기 이미지가 옛날 거 나와요"</example>
  <example>사용자: "Next.js에서 카카오톡 공유 미리보기 구현하려면?"</example>
  <example>사용자: "Kakao.Share.sendDefault 사용법 알려줘"</example>
---

# 카카오톡 공유 최적화 (Kakao Share Optimization)

> 소스:
> - Kakao Developers — JavaScript SDK Download: https://developers.kakao.com/docs/latest/ko/javascript/download
> - Kakao Developers — 카카오톡 공유 JavaScript: https://developers.kakao.com/docs/latest/ko/kakaotalk-share/js-link
> - Kakao Developers — 메시지 템플릿 공통: https://developers.kakao.com/docs/latest/ko/message-template/common
> - Kakao Developers — OG 캐시 초기화 도구: https://developers.kakao.com/tool/clear/og
> - Kakao Developers — SDK Reference (Kakao.Share): https://developers.kakao.com/sdk/reference/js/release/Kakao.Share.html
>
> 검증일: 2026-06-04
> SDK 기준 버전: **2.8.1** (2026-04-09 출시)

---

## 1. 카카오톡 OG 미리보기 기본 구조

카카오톡은 링크 공유 시 **서버 사이드**에서 대상 URL을 크롤링해 OG 메타태그를 읽는다. 카카오 크롤러는 JavaScript를 실행하지 않으므로, SSR/SSG로 OG 태그를 응답 HTML에 직접 포함해야 한다.

### 필수 OG 태그

```html
<meta property="og:title" content="페이지 제목" />
<meta property="og:description" content="페이지 설명" />
<meta property="og:image" content="https://example.com/og.jpg" />
<meta property="og:url" content="https://example.com/post/123" />
<meta property="og:type" content="website" />
```

- `og:url`이 실제 공유 URL과 불일치하면 공유 동작이 혼란스러워진다 (canonical 일치 권장)
- `og:image`는 반드시 **절대 URL + HTTPS**

---

## 2. 이미지 요구사항

| 항목 | 값 | 근거 |
|------|-----|------|
| 권장 크기 | **800 × 400 px** (가로:세로 2:1) | 카카오 데브톡 공식 답변 — 스크랩 시 800×400으로 자동 스마트 크롭 |
| 최소 크기 | **200 × 200 px** | 메시지 템플릿 공식 사양 |
| 최대 파일 크기 | **5 MB** | 메시지 템플릿 공식 사양 |
| 프로토콜 | **HTTPS 절대 URL 필수** | HTTP 이미지는 무시될 수 있음 |
| 권장 형식 | **JPEG / PNG** | 카카오 메시지 API는 JPG/JPEG/PNG/PDF 업로드 허용 |

> 주의: 카카오 공식 문서에는 **SVG/WebP 지원 여부가 명문화돼 있지 않다**. 실무 보고와 메시지 템플릿 업로드 허용 형식을 종합하면 SVG는 미리보기가 안 뜨는 사례가 다수다. 안전하게 **JPEG 또는 PNG**를 쓴다.

> 주의: OG 이미지 크기 가이드는 페이스북·카카오를 모두 만족시키려고 **1200 × 630 (1.91:1)** 을 쓰는 경우도 많다. 카카오 단독 최적화는 **800 × 400 (2:1)**, 멀티플랫폼 호환은 **1200 × 630**.

### 카카오 스마트 크롭

카카오는 스크랩 시 내부 스마트 크롭 API로 이미지를 800×400으로 자동 변환한다. 인물 포함 이미지의 크롭 위치가 자동 조정될 수 있고, 이 동작은 옵션으로 제어할 수 없다. 텍스트·로고는 **이미지 중앙 80% 안전 영역**에 배치한다.

---

## 3. 카카오 캐시 문제와 초기화

카카오 서버는 한 번 크롤링한 OG를 캐싱한다. OG를 수정해도 공유 미리보기에 반영되지 않는다면 **수동 캐시 초기화**가 필요하다.

### 초기화 방법 (공식 도구)

1. https://developers.kakao.com/tool/clear/og 접속 (카카오 계정 로그인 필요)
2. 입력 칸에 대상 URL 입력 — **`http`/`https` 정확히 구분**, SSL 사이트는 반드시 `https`
3. 현재 캐시된 OG 정보 확인 후 **캐시 초기화** 버튼 클릭

> 주의: 초기화 후에도 반영까지 수 분~수십 분 지연이 발생할 수 있다. 급한 경우 `og:image` URL에 쿼리스트링(`?v=2`)을 추가해 우회한다. 다만 CDN 캐시도 함께 갱신해야 의미가 있다.

### 페이스북 디버거 병행

페이스북 OG 디버거(https://developers.facebook.com/tools/debug/)도 함께 돌려 메타태그 자체의 정합성을 점검한다.

---

## 4. Kakao JavaScript SDK 공유 구현

### SDK 로드 (2.8.1 기준)

```html
<script
  src="https://t1.kakaocdn.net/kakao_js_sdk/2.8.1/kakao.min.js"
  integrity="${INTEGRITY_VALUE}"
  crossorigin="anonymous"
></script>
<script>
  Kakao.init('YOUR_JAVASCRIPT_APP_KEY'); // REST API 키 아님 — JavaScript 키
  console.log(Kakao.isInitialized()); // true 확인
</script>
```

> 주의: `${INTEGRITY_VALUE}`(SHA-384 해시)는 카카오 공식 다운로드 페이지에서 버전별로 갱신된다. 공식 페이지에서 그 시점의 값을 복사해 넣는다. SDK 버전을 올릴 때 integrity도 함께 갱신해야 한다.

> 주의: `Kakao.init()`에는 카카오 개발자 콘솔의 **JavaScript 키**를 넣는다. REST API 키·Admin 키와 혼동하지 않는다.

### 피드(feed) 공유

```javascript
Kakao.Share.sendDefault({
  objectType: 'feed',
  content: {
    title: '제목',
    description: '설명',
    imageUrl: 'https://example.com/og.jpg', // HTTPS 절대 URL
    imageWidth: 800,
    imageHeight: 400,
    link: {
      mobileWebUrl: 'https://example.com/post/123',
      webUrl: 'https://example.com/post/123',
    },
  },
  buttons: [
    {
      title: '자세히 보기',
      link: {
        mobileWebUrl: 'https://example.com/post/123',
        webUrl: 'https://example.com/post/123',
      },
    },
  ],
  serverCallbackArgs: { // 공유 콜백 웹훅 수신 시 필요
    postId: '123',
  },
});
```

### sendDefault vs sendCustom vs sendScrap

| 메서드 | 용도 | 핵심 파라미터 |
|--------|------|----------------|
| `Kakao.Share.sendDefault` | 코드에서 직접 템플릿 정의 | `objectType` (feed/list/location/commerce/text) |
| `Kakao.Share.sendCustom` | 카카오 콘솔에서 만든 커스텀 템플릿 사용 | `templateId`, `templateArgs` |
| `Kakao.Share.sendScrap` | 대상 URL의 OG를 카카오가 스크랩해서 전송 | `requestUrl` (필수), `templateId`(선택) |

> 주의: SDK v1.43.0부터 모듈명이 `Kakao.Link`에서 `Kakao.Share`로 변경됐다. 옛 문서나 블로그의 `Kakao.Link.sendDefault`는 현행 SDK에서 deprecated 또는 동작 안 함. **`Kakao.Share.*`만 사용**한다.

### sendScrap — OG 기반 공유

`Kakao.Share.sendScrap`은 별도 콘텐츠 구성 없이 URL만 넘기면 카카오가 해당 페이지의 OG 태그를 읽어 미리보기를 만든다. OG 캐시 동작에 100% 의존하므로 캐시 초기화 + SSR 정합성이 필수다.

```javascript
Kakao.Share.sendScrap({
  requestUrl: 'https://example.com/post/123',
});
```

---

## 5. SPA (Next.js / React) 환경에서 OG 처리

**카카오 크롤러는 JavaScript를 실행하지 않는다.** CSR로 `document.querySelector('meta[property="og:title"]').setAttribute(...)`를 해도 카카오는 변경된 값을 읽지 못한다. 반드시 서버에서 렌더링된 HTML에 OG 태그가 포함돼 있어야 한다.

### Next.js (App Router) — generateMetadata

```typescript
// app/post/[id]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await fetchPost(params.id);
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://example.com/post/${params.id}`,
      images: [{ url: post.ogImageUrl, width: 800, height: 400 }],
      type: 'article',
    },
  };
}
```

### Next.js (Pages Router) — next/head

```tsx
import Head from 'next/head';

export default function Post({ post }) {
  return (
    <>
      <Head>
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:image" content={post.ogImageUrl} />
        <meta property="og:url" content={`https://example.com/post/${post.id}`} />
      </Head>
      {/* ... */}
    </>
  );
}

export async function getServerSideProps(ctx) {
  const post = await fetchPost(ctx.params.id);
  return { props: { post } };
}
```

### 순수 CSR React SPA

- **prerender.io / rendertron / react-snap** 등 사전 렌더링 도구 도입
- **Cloudflare Workers / Vercel Edge Function**으로 크롤러 User-Agent 분기 응답
- 가능하면 Next.js 같은 SSR/SSG 프레임워크로 마이그레이션

---

## 6. 카카오 메시지 vs 공유 vs 채널

| 기능 | API | 로그인 필요 | 대상 |
|------|-----|:----------:|------|
| 카카오톡 공유 | `Kakao.Share.sendDefault` / `sendScrap` | ❌ | 친구·채팅방 |
| 나에게 메시지 | `Kakao.API.request({ url: '/v2/api/talk/memo/default/send' })` | ✅ | 본인 |
| 친구에게 메시지 | `Kakao.API.request({ url: '/v1/api/talk/friends/message/default/send' })` | ✅ + 친구 동의 | 친구 |
| 채널 추가/메시지 | `Kakao.Channel.*` | 비즈 채널 필요 | 채널 구독자 |

대부분의 공개 페이지 공유에는 **`Kakao.Share.sendDefault`** (비로그인 가능)를 쓴다.

---

## 7. 디버깅 체크리스트

링크 공유 미리보기가 안 뜨거나 이상하면 순서대로 점검한다.

1. **HTTPS 절대 URL인가** — `og:image`와 `og:url`이 HTTP거나 상대경로면 무시될 수 있다
2. **SSR/SSG로 OG가 응답 HTML에 포함되는가** — `curl https://example.com/post/123 | grep og:` 결과 확인
3. **이미지 사양 — 5MB 이하, 200×200 이상, JPEG/PNG인가**
4. **카카오 OG 캐시가 옛날 값을 들고 있는가** — `developers.kakao.com/tool/clear/og`로 초기화
5. **`og:url`이 실제 공유 URL과 일치하는가** — 불일치 시 클릭 시 다른 페이지로 갈 수 있음
6. **리다이렉트 체인이 과한가** — 카카오 크롤러는 리다이렉트 다수에서 실패할 수 있음
7. **SDK 호출 시 콘솔 에러** — `Kakao.isInitialized()` 결과, `Kakao.init` 키 종류 확인

---

## 8. 흔한 실수 패턴 (Anti-patterns)

| 실수 | 결과 | 해결 |
|------|------|------|
| HTTP 이미지 URL | 미리보기 이미지 누락 | HTTPS 절대 URL 사용 |
| SVG 이미지 사용 | 미리보기 없음 | JPEG/PNG 변환 |
| 5MB 초과 이미지 | 미리보기 없음 | 압축·리사이징 |
| CSR로 OG meta 동적 변경 | 카카오 미인식 | SSR/SSG로 응답 HTML에 포함 |
| 캐시 초기화 없이 OG 수정 후 공유 | 옛 미리보기 노출 | OG 초기화 도구 사용 |
| `og:url` 미설정·불일치 | 공유 URL 혼란 | 실제 공유 URL과 정확히 일치시킴 |
| `Kakao.Link.sendDefault` 사용 | 동작 안 함 (v1.43.0+ 변경) | `Kakao.Share.sendDefault`로 변경 |
| REST API 키로 `Kakao.init` | 동작 안 함 | JavaScript 키 사용 |
| SDK 로드 안 하고 `Kakao` 호출 | `Kakao is not defined` | SDK `<script>` 로드 + `Kakao.init` 선행 |
| `imageWidth`/`imageHeight` 누락 | 이미지 일부 잘림·왜곡 | 권장 800×400으로 명시 |

---

## 9. 권장 워크플로우

1. **OG 메타태그 작성** (SSR/SSG로 응답 HTML에 포함)
2. **이미지 준비** — 800×400 JPEG/PNG, 5MB 이하, HTTPS URL
3. **로컬에서 페이스북 디버거로 OG 정합성 확인**
4. **배포 후 카카오 공유 디버거로 미리보기 확인**
5. **수정 시 카카오 OG 초기화 도구로 캐시 초기화**
6. **SDK 공유 버튼 — `Kakao.Share.sendDefault` 또는 `sendScrap`**
7. **버전 업그레이드 시 CDN URL과 integrity 동시 갱신**
