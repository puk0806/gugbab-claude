---
name: security-headers-seo
description: >
  HTTP 보안 헤더 설계 가이드 (SEO 영향 포함). HSTS·CSP·X-Frame-Options·
  Referrer-Policy·Permissions-Policy·COEP/COOP·security.txt(RFC 9116)·
  X-Robots-Tag를 공식 표준 기준으로 정리한다.
  <example>사용자: "Next.js에 보안 헤더 추가하는데 SEO 영향 어디까지 봐야 해?"</example>
  <example>사용자: "HSTS preload 등록 조건이 뭐야? max-age 1년이면 충분?"</example>
  <example>사용자: "CSP frame-ancestors로 X-Frame-Options 대체해도 돼?"</example>
---

# HTTP 보안 헤더 + SEO 영향 가이드

> 소스:
> - HSTS Preload List Submission (Google, hstspreload.org): https://hstspreload.org/
> - MDN — Strict-Transport-Security: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security
> - MDN — Content-Security-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy
> - MDN — Referrer-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy
> - Chrome blog (Referrer-Policy 기본값 변경): https://developer.chrome.com/blog/referrer-policy-new-chrome-default/
> - W3C Permissions Policy: https://www.w3.org/TR/permissions-policy/
> - MDN — Permissions-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy
> - MDN — Cross-Origin-Embedder-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy
> - MDN — Cross-Origin-Opener-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy
> - web.dev — Why you need cross-origin isolated: https://web.dev/articles/why-coop-coep
> - RFC 9116 (security.txt): https://www.rfc-editor.org/rfc/rfc9116.html
> - Google Search Central — Robots Meta Tag / X-Robots-Tag: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
> - MDN — X-Robots-Tag: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Robots-Tag
> - MDN — CSP frame-ancestors: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors
> - Next.js — headers(): https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
> - OWASP Secure Headers Project: https://owasp.org/www-project-secure-headers/
>
> 검증일: 2026-06-04

---

## 1. HSTS (HTTP Strict Transport Security)

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

| 디렉티브 | 의미 |
|---------|------|
| `max-age=<seconds>` | 브라우저가 HTTPS 강제로 기억할 기간 |
| `includeSubDomains` | 모든 서브도메인 포함 |
| `preload` | HSTS Preload List 등록 의사 표명 (헤더만으로는 등록되지 않음) |

**Preload List 등록 요건 (hstspreload.org 공식):**
- `max-age >= 31536000` (1년)
- `includeSubDomains` 명시 필수
- `preload` 명시 필수
- 유효한 인증서, HTTP→HTTPS 리다이렉트, 모든 서브도메인 HTTPS 지원 필수

**SEO 영향:**
- HTTPS 강제 → Google의 HTTPS 순위 신호에 긍정적
- 첫 방문 시 HTTP 요청이 발생할 수 있음 → Preload List 등록으로 첫 요청부터 HTTPS 강제

> 주의: Preload 등록은 사실상 비가역적이다. 등록 해제는 수개월~수년 걸리므로 운영 정책상 HTTPS 100% 확보 후 등록한다.

---

## 2. CSP (Content Security Policy)

### 2-1. 권장 베이스라인

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data:;
  font-src 'self' https: data:;
  connect-src 'self' https:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests
```

| 디렉티브 | 역할 |
|---------|------|
| `default-src 'self'` | 명시되지 않은 모든 리소스의 기본 출처 제한 |
| `script-src 'nonce-{random}'` | nonce 기반 인라인 스크립트 허용 (XSS 방어) |
| `frame-ancestors 'none'` | 페이지를 다른 사이트 iframe에 임베드 차단 (X-Frame-Options 대체, CSP Level 2) |
| `upgrade-insecure-requests` | 페이지 내부 HTTP 리소스를 자동 HTTPS로 업그레이드 |
| `base-uri 'self'` | `<base>` 태그 변조 차단 |
| `form-action 'self'` | 폼 전송 대상 제한 |

### 2-2. 단계적 도입 — Report-Only 모드

```http
Content-Security-Policy-Report-Only: default-src 'self'; report-to csp-endpoint
```

`Content-Security-Policy-Report-Only`는 정책을 적용하지 않고 위반 보고만 받는다. 새 사이트는 Report-Only로 1~2주 운영하며 위반 패턴을 수집한 뒤 본 헤더로 전환한다.

### 2-3. 보고 엔드포인트 — report-uri vs report-to

- `report-uri` — CSP Level 3에서 **deprecated**. 단 Firefox는 2026년 초 기준 `report-to`를 CSP에서 지원하지 않음
- `report-to` — Reporting API v1 기반, Chrome·Edge 지원
- **실무 권장**: 두 디렉티브를 모두 명시 (브라우저가 지원하는 쪽을 선택)

```http
Content-Security-Policy: default-src 'self'; report-uri /csp-report; report-to csp-endpoint
Reporting-Endpoints: csp-endpoint="/csp-report"
```

### 2-4. SEO 주의

> 주의: Googlebot은 페이지 렌더링 시 JavaScript를 실행한다. CSP가 필수 리소스(Google Tag Manager, Analytics, hCaptcha 등)를 차단하면 렌더링 실패로 인덱싱·랭킹에 부정적이다. 도입 전 Report-Only로 차단 리소스를 확인하고 `script-src`·`connect-src`에 공식 호스트를 화이트리스트한다.

---

## 3. X-Frame-Options (레거시)

```http
X-Frame-Options: DENY
```

| 값 | 의미 |
|----|------|
| `DENY` | 모든 frame 임베드 금지 |
| `SAMEORIGIN` | 동일 출처 페이지만 임베드 허용 |

- CSP `frame-ancestors`가 등장한 이후 X-Frame-Options는 **CSP Level 2에서 사실상 대체**되었다 (MDN: "obsoleted in favour of the frame-ancestors directive")
- 두 헤더 모두 설정된 경우 CSP `frame-ancestors`가 우선 (현대 브라우저 기준)
- 다만 구버전 클라이언트 호환을 위해 X-Frame-Options를 함께 두는 패턴은 여전히 안전
- `ALLOW-FROM`은 비표준이며 현대 브라우저에서 무시됨 → 사용 금지

---

## 4. Referrer-Policy

```http
Referrer-Policy: strict-origin-when-cross-origin
```

| 값 | 동작 |
|----|------|
| `no-referrer` | Referer 헤더 전송 없음 |
| `no-referrer-when-downgrade` | HTTPS→HTTP 다운그레이드 시 제거 (구 기본값) |
| `origin` | 항상 origin만 전송 |
| `strict-origin-when-cross-origin` | 동일 출처: 전체 URL / 크로스 출처: origin만 / 다운그레이드: 미전송 |
| `unsafe-url` | 항상 전체 URL (개인정보 노출 위험, 사용 비권장) |

**현대 브라우저 기본값:** `strict-origin-when-cross-origin` (Chrome 85부터, Firefox·Safari 동일)

**SEO·분석 영향:**
- `no-referrer` 또는 `origin`이면 GA4 등에서 referral 트래픽이 **direct로 집계**됨 → 채널 분석 왜곡
- `strict-origin-when-cross-origin`는 최소 origin은 보존되므로 referral 소스 추적 가능
- 결제 페이지 등 민감 URL은 페이지 단위 `<meta name="referrer">`로 추가 강화 가능

---

## 5. Permissions-Policy (이전 Feature-Policy)

```http
Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=()
```

| 표기 | 의미 |
|------|------|
| `feature=()` | 모든 출처에서 차단 |
| `feature=(self)` | 동일 출처만 허용 |
| `feature=("https://trusted.com")` | 명시 출처만 허용 |
| `feature=*` | 모든 출처 허용 |

**제어 가능 기능 예시:** `camera`, `microphone`, `geolocation`, `payment`, `usb`, `fullscreen`, `accelerometer`, `gyroscope`, `interest-cohort`(FLoC) 등.

- W3C Working Draft 사양. 이전 명칭은 Feature-Policy
- `Feature-Policy` 헤더는 **deprecated**, `Permissions-Policy`로 마이그레이션 (OWASP Secure Headers Project 기준)
- 단, iframe 단위 위임 문법 `<iframe allow="...">`은 유지됨
- SEO 직접 영향 없음. 단 GoogleBot이 사용하는 기능은 거의 차단 대상이 아니므로 인덱싱 영향은 없다

---

## 6. COEP / COOP — Cross-Origin Isolation

```http
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

두 헤더가 동시에 적용되면 페이지가 **cross-origin isolated** 상태가 되어 `self.crossOriginIsolated === true`. 이 상태에서만 사용 가능한 기능:

- `SharedArrayBuffer`
- 고해상도 타이머 (`performance.now()` precision)
- `performance.measureUserAgentSpecificMemory()`

| 헤더 | 값 | 의미 |
|------|----|------|
| COEP | `require-corp` | 외부 리소스는 `Cross-Origin-Resource-Policy` 헤더로 명시 허용해야 로드됨 |
| COEP | `credentialless` | 쿠키 없이 요청하여 cross-origin 리소스 허용 |
| COOP | `same-origin` | 다른 출처의 팝업·opener와 격리 |
| COOP | `same-origin-allow-popups` | 같은 출처 격리 + 직접 연 팝업은 예외 |

> 주의: COEP `require-corp` 도입 시 외부 광고·소셜 위젯·임베드 영상이 차단될 수 있다. 도입 전 `Cross-Origin-Embedder-Policy-Report-Only`로 차단 리소스를 측정한 뒤 적용한다. SharedArrayBuffer 같은 기능을 쓰지 않는 일반 콘텐츠 사이트라면 COEP는 적용 비용 대비 이득이 작을 수 있다.

---

## 7. security.txt (RFC 9116)

```
# /.well-known/security.txt
Contact: mailto:security@example.com
Contact: https://example.com/security-report
Expires: 2027-01-01T00:00:00.000Z
Preferred-Languages: ko, en
Canonical: https://example.com/.well-known/security.txt
Policy: https://example.com/security-policy
```

| 필드 | 필수 여부 | 설명 |
|------|----------|------|
| `Contact` | **필수** (1개 이상) | URI 형식 (`mailto:`, `https://`, `tel:`) |
| `Expires` | **필수** (정확히 1개) | ISO 8601 / RFC 3339 형식. 만료 후 무효 |
| `Acknowledgments` | 선택 | 제보자 감사 페이지 |
| `Preferred-Languages` | 선택 | 보고 언어 (BCP 47 코드) |
| `Canonical` | 선택 | 파일의 정식 URL |
| `Policy` | 선택 | 취약점 공개 정책 페이지 |
| `Hiring` | 선택 | 보안 채용 페이지 |
| `Encryption` | 선택 | PGP 공개키 URL |

**규칙:**
- 경로: `/.well-known/security.txt` (RFC 9116 표준)
- HTTPS로 서빙 필수
- `Expires`는 1년 이내 권장 (RFC 9116: "less than a year into the future")
- PGP 서명 권장 (`security.txt.sig`)

**SEO 영향:** 없음. 신뢰 신호 측면에서 보안 운영 성숙도를 외부에 표시하는 효과만 있다.

---

## 8. X-Robots-Tag (SEO 직접 영향)

```http
X-Robots-Tag: noindex, nofollow
X-Robots-Tag: googlebot: noindex, nofollow
X-Robots-Tag: bingbot: nosnippet
```

| 지시어 | 의미 |
|-------|------|
| `noindex` | 검색 결과에서 제외 |
| `nofollow` | 페이지의 링크를 따라가지 않음 |
| `noarchive` | 캐시 사본 제공 안 함 |
| `nosnippet` | 검색 결과 스니펫·미리보기 제공 안 함 |
| `noimageindex` | 페이지의 이미지를 인덱싱하지 않음 |
| `unavailable_after: <date>` | 지정 일시 이후 인덱싱 제외 |

**핵심 용도:**
- HTML이 아닌 리소스(PDF, 이미지, 비디오)에 robots 지시를 적용할 때 거의 유일한 수단
- 복수 봇 지정 시 `<bot-name>: <rules>` 형태로 콤마/세미콜론 구분 (Google Search Central)

**중요 함정:**
- `robots.txt`에서 차단된 페이지는 크롤러가 헤더 자체를 보지 못함 → `noindex` 무효
- `noindex`를 의도하지 않은 페이지에 X-Robots-Tag로 잘못 설정 시 트래픽 손실 → Search Console "X-Robots-Tag noindex 감지" 알림 모니터링

`<meta name="robots">`과 X-Robots-Tag가 동시에 있을 때 **더 제한적인 쪽이 적용**된다.

---

## 9. Next.js 15 (App Router) 설정 예시

```js
// next.config.js
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'nonce-{NONCE}'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

> 주의: 동적 nonce가 필요한 CSP는 `next.config.js` 정적 헤더로 처리할 수 없다. Middleware(`middleware.ts`)에서 요청별 nonce를 생성하여 헤더에 주입한다 (Next.js 공식 가이드 "Content Security Policy").

---

## 10. Nginx 설정 예시

```nginx
# /etc/nginx/conf.d/security-headers.conf
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()" always;
add_header Content-Security-Policy "default-src 'self'; img-src 'self' https: data:; frame-ancestors 'none'; upgrade-insecure-requests" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
# COEP는 외부 리소스 영향 큼 — 별도 검증 후 활성화
# add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

> 주의: `always` 키워드를 빠뜨리면 4xx/5xx 응답에는 헤더가 붙지 않는다. 보안 헤더는 항상 `always`로 설정한다.

---

## 11. 점검·검증 도구

| 도구 | 용도 |
|------|------|
| https://securityheaders.com | 보안 헤더 A+~F 등급 진단 |
| https://observatory.mozilla.org | Mozilla Observatory 종합 점수 |
| https://hstspreload.org | HSTS Preload 등록 자격 검사 |
| https://csp-evaluator.withgoogle.com | Google의 CSP 정책 평가기 |
| https://internet.nl | 보안·HTTPS·IPv6 종합 진단 |
| Google Search Console — Page Indexing | X-Robots-Tag로 인한 noindex 감지 알림 |

---

## 12. 흔한 실수

| 실수 | 영향 | 해결 |
|------|------|------|
| `X-Content-Type-Options: nosniff` 누락 | MIME 스니핑 기반 XSS | 무조건 `nosniff` 추가 |
| CSP에 `'unsafe-inline'` 광범위 허용 | XSS 방어력 무력화 | nonce/hash 기반으로 전환 |
| HSTS `max-age` 너무 짧음 (예: 300) | Preload 자격 미달, 다운그레이드 공격 노출 | 최소 1년 (`31536000`), 권장 2년 |
| Referrer-Policy 미설정 | 브라우저 기본값 의존 → GA4 direct 트래픽 과다 가능 | `strict-origin-when-cross-origin` 명시 |
| COEP `require-corp` 무검증 도입 | 광고·임베드 영상 차단 → 매출 손실 | Report-Only 1~2주 측정 후 적용 |
| X-Robots-Tag noindex가 의도치 않은 페이지에 적용 | 인덱싱 손실, 트래픽 급감 | Search Console 모니터링 + 배포 전 헤더 회귀 테스트 |
| Preload 등록 후 HTTPS 미준비 서브도메인 발견 | 서비스 접근 불가, 해제까지 수개월 | 등록 전 모든 서브도메인 HTTPS 검증 |
| robots.txt 차단 + X-Robots-Tag noindex 병행 | 크롤러가 헤더를 못 보고 noindex 무효 | 둘 중 하나만 사용 (인덱싱 차단이 목적이면 헤더만) |

---

## 13. 도입 체크리스트

- [ ] HTTPS 100% 적용 + HTTP→HTTPS 리다이렉트
- [ ] HSTS `max-age >= 31536000` (Preload 등록 전 1~2개월 운영 후 등록 권장)
- [ ] CSP Report-Only 모드 1~2주 운영 후 본 헤더 전환
- [ ] X-Content-Type-Options, X-Frame-Options(또는 CSP frame-ancestors), Referrer-Policy, Permissions-Policy 4종 기본 적용
- [ ] securityheaders.com / Mozilla Observatory A 등급 이상 확인
- [ ] `/.well-known/security.txt` 배치, Expires 1년 이내, PGP 서명 권장
- [ ] X-Robots-Tag 회귀 테스트 (배포 후 Search Console 모니터링)
- [ ] COEP/COOP는 SharedArrayBuffer 등 기능이 필요한 경우에만 단계적 도입
