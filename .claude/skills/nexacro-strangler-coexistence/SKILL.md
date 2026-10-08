---
name: nexacro-strangler-coexistence
description: 넥사크로 17 관리자 화면을 Next.js로 한 번에 바꾸지 않고 메뉴·업무 단위로 점진 전환(Strangler Fig)하는 동안 두 시스템을 공존시키는 방법. Next.js rewrites fallback·Multi-Zones·proxy 경로 분기, 넥사크로 메뉴에서 새 화면 열기(새 창 vs WebBrowser 컴포넌트, getProperty/setProperty/callMethod·onusernotify), 같은 도메인 묶기·SameSite 쿠키·세션 공유 vs 토큰 교환, 메뉴 전환 플래그, 웨이브 운영 체크리스트와 흔한 실수.
---

# 넥사크로 → Next.js 점진 전환 공존 설계 (Strangler Fig)

> 소스: https://martinfowler.com/bliki/StranglerFigApplication.html (Martin Fowler, Strangler Fig, 2024-08-22 개정)
> 소스: https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig (Azure Architecture Center, 2026-09-18 갱신본)
> 소스: https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites (Next.js 16.4.0 문서)
> 소스: https://nextjs.org/docs/app/guides/multi-zones (Next.js 16.4.0 문서)
> 소스: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie (SameSite·Domain·__Host-)
> 소스: https://developer.mozilla.org/en-US/docs/Glossary/Site (site vs origin)
> 소스: https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies
> 소스: https://docs.tobesoft.com/developer_guide_nexacro_17_ko/c727f951d3abbe36 (넥사크로플랫폼 17 개발자 가이드 — WebBrowser)
> 소스: https://docs.tobesoft.com/developer_guide_nexacro_n_en/de1da5195a28d553 (Nexacro N 개발자 가이드 — WebBrowser, 같은 API)
> 소스: https://docs.tobesoft.com/product_information_nexacro_17_ko/product_restrictions (넥사크로 17 제품 제약사항)
> 소스: https://docs.spring.io/spring-session/reference/guides/java-custom-cookie.html (Spring Session 4.1.1 — 쿠키 도메인)
> 검증일: 2026-10-08

> 주의: **넥사크로 → React/Next.js를 메뉴 단위로 전환한 공개 사례는 찾지 못했다.** 이 스킬은 Strangler Fig 일반 원칙 + Next.js·MDN·투비소프트 공식 문서의 개별 기능을 조합한 **설계 가이드**다. 실제 적용 전 PoC(메뉴 1개)로 인증·통신·롤백을 반드시 확인한다.

**다루지 않는 것 (다른 스킬 참조)**
- 프론트 코드베이스 *내부* 폴더·모듈 재구조화(shim·codemod·PR 분할) → `incremental-refactoring`
- Next.js 자체 사용법(App Router·캐싱·proxy.ts 상세) → `nextjs`
- 넥사크로 서버(X-API·PlatformData·DataSet) 분석 → `nexacro-xapi-server`
- 화면 인벤토리·난이도·웨이브 순서 산정 → `nexacro-screen-analyzer` 에이전트

---

## 1. Strangler Fig 원칙 — 무엇을 지키는가

Fowler(2024-08-22 개정)는 Strangler Fig를 "레거시 동작을 조각 단위로 새 코드베이스로 옮기는 것"으로 정의하고 4가지 활동을 든다.

| Fowler 4활동 | 넥사크로 관리자 전환에서의 의미 |
|---|---|
| 원하는 결과(outcomes) 이해 | "넥사크로 걷어내기" 자체가 목표가 아니다. 예: 신규 기능 개발 속도, 브라우저 플러그인/런타임 의존 제거, 채용·유지보수 비용 |
| 문제를 작은 조각으로 나누기 | 조각 = **메뉴(화면) 또는 업무 묶음**. 자주 같이 쓰는 화면끼리 묶는다(§2-2) |
| 조각을 성공적으로 배포 | 조각마다 운영 반영 → 사용자가 실제로 신규 화면 사용 |
| 조직이 계속 그렇게 일하도록 바꾸기 | 웨이브 운영 규칙(§6)을 팀 절차로 고정 |

원문 핵심 문장:
- **전이 아키텍처(transitional architecture)** — "신·구 시스템이 공존하도록 하는, 현대화가 끝나면 사라질 코드"를 만드는 걸 사람들은 꺼리지만 필요하다. 이 스킬의 §2~§5 전부가 전이 아키텍처다.
- **가치 조기 회수** — "동작하기 시작하면 비즈니스가 새 컴포넌트의 가치를 거두어 더 이른 투자 회수가 가능하다." → 첫 웨이브는 *사용 빈도 높고 넥사크로 의존이 얕은* 화면으로 고른다.
- **점진·가시성** — 투자와 회수가 "점진적이고 눈에 보이게" 일어난다.

Azure 판(4단계)은 서버 관점 구조를 준다: ① 클라이언트와 신·구 사이에 **파사드(프록시)** 를 두고 처음엔 대부분 레거시로 ② 점진적으로 신규로 이동 ③ 레거시 의존 0이면 폐기 ④ 파사드 제거.
Azure 고려사항 중 이 상황에 직결되는 것:
- 신·구가 **동시에 쓰는 데이터 저장소**를 어떻게 다룰지 먼저 정한다 (§6 데이터 정합성)
- 파사드가 **단일 장애점·성능 병목**이 되지 않게 한다
- 신·구 상호 호출은 **Anti-corruption Layer**로 번역한다 (넥사크로 Dataset 관례가 신규 API로 새지 않게)
- 부적합: 요청을 가로챌 수 없을 때, 레거시 소스를 수정할 수 없을 때(메뉴에 "신규로 보내기" 분기를 넣어야 하므로)

---

## 2. Next.js 쪽 장치 — 파사드를 어디에 두나

### 2-1. `rewrites` 의 `fallback` — "Next.js에 없으면 넥사크로로" (공식: Incremental adoption)

`rewrites()`가 `{ beforeFiles, afterFiles, fallback }` 객체를 반환하면, `fallback`은 **pages/public 파일과 동적 라우트를 모두 확인한 뒤, 404 렌더 직전**에 적용된다. 공식 문서는 이를 "Incremental adoption of Next.js"로 소개하며 **페이지를 더 옮길 때 rewrites 설정을 바꿀 필요가 없다**고 명시한다.

```js
// next.config.js — 신규 화면은 Next.js가, 나머지 전부는 기존 넥사크로 서버가 응답
module.exports = {
  async rewrites() {
    return {
      fallback: [
        {
          source: '/:path*',
          destination: `${process.env.LEGACY_ORIGIN}/:path*`, // 예: https://legacy-admin.internal
        },
      ],
    }
  },
}
```

라우트 확인 순서(공식): headers → redirects → **proxy** → `beforeFiles` → public·`_next/static`·비동적 페이지 → `afterFiles` → 동적 라우트 → **`fallback`**.

함정:
- **catch-all 동적 라우트**(`app/[...slug]/page.tsx`)를 만들면 그게 먼저 매칭돼 fallback까지 내려가지 않는다. 신규 영역은 `/admin/v2/...` 처럼 명확한 접두사 아래 둔다.
- 넥사크로 HTML5 앱의 정적 리소스·트랜잭션 요청(X-API 엔드포인트)도 같은 fallback으로 프록시된다 → **전체 레거시 트래픽이 Next.js 서버를 통과**한다. Azure가 경고한 병목·단일 장애점이 Next.js가 된다. 트래픽이 크면 §2-4의 앞단 L7 프록시가 낫다.
- `trailingSlash: true`면 source·destination 모두 슬래시를 맞춰야 한다(공식).

> 주의: 외부 URL rewrite 시 쿠키·`Host`·`X-Forwarded-*` 헤더가 레거시 서버에 어떻게 전달되는지는 공식 rewrites 문서에 명시돼 있지 않다(미검증). 레거시가 `Host`나 원 IP로 분기·로깅한다면 PoC에서 실제 헤더를 찍어 확인한다.

### 2-2. Multi-Zones — Next.js 앱을 여러 개로 나눌 때

Multi-Zones는 한 도메인을 경로별로 여러 Next.js 앱(zone)이 나눠 서비스하는 방식이다(공식).
- **같은 zone 안 이동 = soft navigation**, **다른 zone으로 이동 = hard navigation**(현재 페이지 리소스 언로드 후 새로 로드).
- 공식 권고: **"자주 같이 방문하는 페이지는 같은 zone에 두라."** → 업무 단위(주문 조회 ↔ 주문 상세 ↔ 환불)로 zone을 자른다.
- 다른 zone으로 가는 링크는 `<Link>`가 아니라 **`<a>`** 를 쓴다(`<Link>`는 prefetch·soft navigation을 시도해 zone 간에는 동작하지 않음).
- 각 zone은 `assetPrefix`로 정적 자산 경로 충돌을 피한다(기본 zone은 불필요). Next.js 15 미만은 자산용 rewrite가 추가로 필요했다.
- URL 경로는 zone 간 **유일**해야 한다(두 zone이 `/orders`를 같이 서비스하면 충돌).
- Server Actions를 쓰면 `experimental.serverActions.allowedOrigins`에 사용자 대면 도메인을 넣는다.

넥사크로 공존 관점에서 넥사크로 앱도 사실상 "또 하나의 zone"이다. 넥사크로 ↔ Next.js 이동은 **항상 hard navigation**(또는 새 창/iframe)이므로, 한 업무 흐름 안에서 신·구를 왔다 갔다 하게 자르면 체감이 나빠진다.

### 2-3. proxy(구 middleware)·기능 플래그로 동적 분기

공식 Multi-Zones 문서: 지연을 줄이려면 rewrites를 권장하되, **마이그레이션 중 기능 플래그로 경로를 결정**하는 등 동적 판단이 필요하면 proxy를 쓴다.

```ts
// proxy.ts (Next.js 16 — 이전 이름 middleware.ts). 공식 예시를 넥사크로 공존용으로 일반화
import { NextResponse, type NextRequest } from 'next/server'
import { isMenuOnNext } from './lib/menu-flags' // §5의 메뉴 전환 플래그 조회(캐시 필수)

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (pathname.startsWith('/admin/v2/') && !(await isMenuOnNext(pathname))) {
    // 플래그가 꺼진 메뉴 → 레거시로 되돌림 (롤백 경로)
    return NextResponse.rewrite(`${process.env.LEGACY_ORIGIN}${pathname}${search}`)
  }
}
```

- 플래그 조회는 **요청마다 DB를 치지 않게** 캐시한다(proxy는 모든 매칭 요청에서 실행).
- 사용자·부서 단위 점진 공개(카나리)도 이 지점에서 한다.

### 2-4. 파사드 위치 선택

| 방식 | 장점 | 단점 | 언제 |
|---|---|---|---|
| Next.js `fallback` rewrite | 설정 1회, 메뉴 추가 시 변경 불필요 | 레거시 전 트래픽이 Node 서버 경유 | 사용자 수 적은 사내 관리자, 초기 PoC |
| Next.js proxy + 플래그 | 메뉴·사용자별 즉시 전환/롤백 | 요청마다 로직 실행, 플래그 캐시 필요 | 웨이브 중 롤백 가능성이 클 때 |
| 앞단 L7 프록시(nginx·ALB 등) 경로 라우팅 | 레거시 트래픽이 Next.js를 거치지 않음, 장애 격리 | 인프라 설정 변경이 배포마다 필요 | 트래픽 큼, 레거시 안정성이 최우선 |

어느 방식이든 **사용자 브라우저 기준 같은 origin(또는 최소 같은 site)** 으로 묶는 것이 §3·§4 문제를 대부분 없앤다.

---

## 3. 넥사크로 쪽 — 메뉴에서 새 화면 열기

### 3-1. 두 가지 방식 비교

| | 새 창/탭(링크) | WebBrowser 컴포넌트(넥사크로 화면 안에 웹 페이지) |
|---|---|---|
| 사용자 체감 | 창이 분리됨. 넥사크로 MDI 탭 안에 안 들어감 | 기존 MDI 탭·프레임 안에서 열려 이질감 적음 |
| 구현 | 브라우저 새 창 열기 | `WebBrowser.set_url()` + 이벤트 연동 |
| 신·구 통신 | 사실상 없음(서버·URL 파라미터로만) | `getProperty`/`setProperty`/`callMethod`, `onusernotify` |
| 인증 | 같은 site면 쿠키 공유로 해결 | iframe 안이라 **cross-site면 쿠키가 안 실림**(§4) |
| 제약 | 팝업 차단 | 아래 3-3 제품 제약 |
| 권장 | 독립 업무(통계·리포트 등) | 기존 MDI 흐름 안에서 쓰는 업무 화면 |

> 주의: 넥사크로 17 스크립트에서 "새 브라우저 창 열기"를 하는 공식 API(예: `system.execBrowser` 등)는 이번 조사에서 공식 원문으로 확인하지 못했다(미검증). HTML5(웹 브라우저) 환경에서는 공식 예제가 폼 스크립트에서 `document.location.href`를 직접 쓰는 것으로 보아 브라우저 전역 객체 접근이 가능해 보이나, NRE(런타임) 환경 동작은 별도 확인이 필요하다.

### 3-2. WebBrowser 연동 API (넥사크로 17 개발자 가이드 원문 확인)

공식 문서 확인 내용:
- `url` 속성(또는 `set_url()`)으로 웹 페이지 로드
- `onloadcompleted` — 페이지 로드 완료 후 `getProperty('window')`로 window 객체를 얻어 이후 호출에 사용
- `getProperty("document"|"window")` → 반환 객체에 다시 `callMethod`/`getProperty`/`setProperty`
- `callMethod("함수명", 인자...)` — 웹 페이지에 선언된 함수 호출
- `onusernotify` — 웹 페이지 → 넥사크로 방향 통지. 웹 페이지는 `window.NEXACROWEBBROWSER.on_fire_onusernotify(window.NEXACROWEBBROWSER, userdata)` 를 호출하고, 넥사크로는 `e.userdata`로 받는다
- 사용이 끝난 Plugin 객체는 `destroy()` — "해제하지 않을 시 메모리 누수가 발생할 수 있습니다"

```javascript
// [넥사크로 폼 스크립트] 메뉴 클릭 → 신규 Next.js 화면을 WebBrowser로 연다
this.fn_openNextScreen = function(nextPath, param)
{
  // 같은 origin(§2 파사드) 아래 경로를 쓰면 쿠키·DOM 접근 문제가 사라진다
  this.wbNext.set_url("/admin/v2" + nextPath + "?embed=1&" + param);
};

this.wbNext_onloadcompleted = function(obj:nexacro.WebBrowser, e:nexacro.WebLoadCompEventInfo)
{
  this._win = this.wbNext.getProperty("window");
};

// 넥사크로 → Next.js: 예) 상단 조회조건이 바뀌면 신규 화면에 알림
this.fn_pushFilter = function(code)
{
  if (this._win) this._win.callMethod("onLegacyFilterChange", code);
};

// Next.js → 넥사크로: 예) 저장 완료 후 넥사크로 목록 재조회, 탭 닫기 요청
this.wbNext_onusernotify = function(obj:nexacro.WebBrowser, e:nexacro.WebUserNotifyEventInfo)
{
  var msg = JSON.parse(e.userdata);           // 작은 JSON만 주고받는다(3-3 길이 제한)
  if (msg.type == "saved")  this.fn_reloadList(msg.id);
  if (msg.type == "close")  this.fn_closeTab();
};

this.form_onclose = function(obj, e)
{
  if (this._win) { this._win.destroy(); this._win = null; } // 메모리 누수 방지(공식)
};
```

```ts
// [Next.js 클라이언트 컴포넌트] 넥사크로 WebBrowser 안에서 열렸을 때만 동작하는 브리지
'use client'
declare global {
  interface Window {
    NEXACROWEBBROWSER?: { on_fire_onusernotify: (self: unknown, data: string) => void }
    onLegacyFilterChange?: (code: string) => void
  }
}

export function notifyNexacro(type: 'saved' | 'close', payload: Record<string, unknown> = {}) {
  const wb = window.NEXACROWEBBROWSER
  if (!wb) return false                         // 단독 탭으로 열린 경우: 아무 것도 안 함
  wb.on_fire_onusernotify(wb, JSON.stringify({ type, ...payload }))
  return true
}
```

- `callMethod`로 불릴 함수는 **window 전역**에 있어야 한다(공식 예제는 페이지 전역 함수 `colorFunction`). React 컴포넌트에서는 `useEffect`로 `window.onLegacyFilterChange = ...`를 등록하고 언마운트 시 제거한다.
- `on_fire_onusernotify`·`NEXACROWEBBROWSER` 객체가 **HTML5 환경과 NRE 환경 모두에서 같은 이름으로 주입되는지**는 공식 가이드가 환경 구분 없이 예제만 제시한다. 두 환경을 다 쓰면 둘 다 PoC 한다.

> 주의: 최신 넥사크로(N 계열 WebView 컴포넌트)의 `nexacro.fireUserNotify(...)` 통합 코드는 **WebView 컴포넌트용**으로 검색 결과에 나타났으며, 넥사크로 17 WebBrowser에서 쓸 수 있는지는 확인하지 못했다(미검증). 17에서는 위 `on_fire_onusernotify` 방식을 쓴다.

> 주의: `window.postMessage`로 대체하는 방법은 웹 표준이지만, 넥사크로 17 폼 스크립트에서 iframe 메시지를 받는 공식 방법은 문서에서 확인하지 못했다(미검증).

### 3-3. 공식 제약 (넥사크로 17 제품 제약사항·개발자 가이드)

- **교차 도메인**: "호스트 명, 프로토콜, 포트 등이 다른 도메인 간에는 … CORS를 적용하거나 JSONP 등의 방식으로 회피해야" 하며 가장 간단한 해법은 "두 파일의 도메인이 같도록 해주는 것"(17 가이드). → §2 파사드로 **같은 origin**에 두는 것이 정답이다. (브라우저 동일 출처 정책상 cross-origin iframe의 DOM·전역 함수는 부모가 접근할 수 없으므로 `getProperty('window')`·`callMethod`도 같은 origin이 전제다.)
- **onusernotify 길이**: "NRE의 경우 처리할 수 있는 값의 길이는 최대 512문자(한글, 일본어 256자)". → ID·이벤트 타입만 보내고 데이터는 서버에서 다시 조회한다.
- HTML5에서 WebBrowser는 **IFRAME**으로 그려진다(제약사항: "IFRAME 태그 영역 내 로딩된 콘텐츠의 속성 정보를 넥사크로 앱에서 알 수 없으며 핀치줌 동작을 제어할 수 없습니다").
- 다른 도메인 콘텐츠를 넣으면 **휠 스크롤이 동작하지 않거나**(컴포넌트 스크롤바 활성 시), **창 크기 변경 중 mousemove가 멈추는** 현상(제약사항). → 이것도 같은 origin으로 피한다.
- 모바일: WebBrowser 콘텐츠 포커스 시 키패드가 편집 영역을 가리는 현상, iOS WKWebView의 `file://` 제한(제약사항).

---

## 4. 인증·세션 공유

### 4-1. 쿠키 규칙 (MDN)

- **site ≠ origin**: site는 *등록 가능 도메인(eTLD+1)* 기준이라 `a.example.com`과 `b.example.com`은 **같은 site**, 포트도 무시. origin은 scheme+전체 도메인+포트. SameSite 판단에서는 scheme도 고려(schemeful same-site → `http`/`https` 섞이면 다른 site).
- **SameSite**
  - `Strict`: 같은 site 요청에만 전송
  - `Lax`: 같은 site + cross-site **최상위 탐색(주소창이 바뀌는 이동)의 안전한 메서드**에만. **`fetch()`, `<img>`/`<script>` 하위 리소스, `<iframe>` 안의 탐색은 제외**
  - `None`: cross-site에도 전송. **`Secure` 필수**
  - 미지정 시 일부 브라우저는 `Lax`를 기본값으로 적용(MDN). Chrome은 80부터 기본 Lax.
- **Domain**: 지정하면 하위 도메인 포함, 생략하면 보낸 호스트에만(host-only).
- **`__Host-` 접두사**: `Secure` + `Domain` 없음 + `Path=/` 강제 → 하위 도메인 공유가 **불가능**해진다. 서브도메인 공유가 필요한 세션 쿠키에 `__Host-`를 쓰면 안 된다.
- **서드파티 쿠키**: cross-site iframe 안의 쿠키는 서드파티 컨텍스트다. Firefox(Total Cookie Protection)·Safari(ITP)는 기본으로 제한하고, Chrome은 기본 차단하지 않는다(MDN). `SameSite=None; Secure`를 붙여도 **브라우저 정책에 따라 막힐 수 있다.**

### 4-2. 배치별 결론

| 배치 | 예 | iframe(WebBrowser) 안 신규 화면에 기존 세션 쿠키가 실리나 | 권장 |
|---|---|---|---|
| **같은 origin** (파사드로 경로 분기) | `admin.example.com/` 넥사크로, `admin.example.com/admin/v2/` Next.js | 실림(host-only 쿠키 그대로) | **1순위** |
| 같은 site, 다른 서브도메인 | `admin.example.com` ↔ `admin-next.example.com` | 쿠키 `Domain=example.com`이면 실림(같은 site → Lax로 충분) | 2순위. 쿠키 Domain 변경 필요 |
| 다른 site | `admin.example.com` ↔ `newadmin.example.net` | `Lax`면 안 실림. `SameSite=None; Secure` + 서드파티 쿠키 정책 통과 필요 | **피한다.** 불가피하면 토큰 교환 |

Spring Session을 쓰는 레거시라면 `DefaultCookieSerializer.setDomainNamePattern(...)`으로 `child.example.com` 요청에 `Domain=example.com`을 붙여 서브도메인 간 세션을 공유할 수 있다(공식 가이드; Spring Session의 `sameSite` 기본값 `Lax`). 정규식은 **유효한 도메인 문자만 매칭**하게 써야 한다(응답에 반영되므로 HTTP Response Splitting 주의 — 공식).

### 4-3. 세션 공유 vs 토큰 교환

| 방식 | 동작 | 장점 | 단점 |
|---|---|---|---|
| **A. 레거시 세션 위임** | Next.js 서버가 요청 쿠키를 그대로 레거시 "세션 확인 API"로 전달해 사용자·권한을 받는다 | 세션 원본이 하나, 로그아웃·만료가 자동 일치 | 요청마다 레거시 호출(짧은 캐시로 완화), 레거시 장애 시 신규도 영향 |
| **B. 세션 저장소 직접 공유** | Next.js가 Redis 등에서 레거시 세션을 직접 읽음 | 레거시 호출 없음 | 레거시 **세션 직렬화 형식(Java 직렬화 등)·키 규칙에 결합**. 쿠키 값 인코딩(예: Spring Session `useBase64Encoding` 설정)까지 맞춰야 함. 레거시 업그레이드 시 깨짐 |
| **C. 토큰 교환** | 넥사크로가 서버에서 1회용·단기 코드를 발급받아 URL로 넘기고, Next.js 서버가 교환해 자체 세션 발급 | 도메인이 달라도 동작, 신규 쪽 인증 체계 독립 | 구현량 많음. 로그아웃·만료 동기화를 따로 설계. 코드 재사용·URL 로그 노출 방어 필요 |

권장 순서: **같은 origin + A** → (서브도메인이면) 쿠키 Domain + A → 불가피할 때만 C. B는 레거시 세션 형식을 신규 코드에 끌어들이므로 Azure가 말한 Anti-corruption Layer 원칙과 충돌한다.

C를 쓴다면 최소 조건: 코드 1회 사용·수십 초 만료·서버 간 교환(브라우저 JS에 장기 토큰 노출 금지)·교환 후 URL에서 코드 제거·교환 엔드포인트 rate limit.

---

## 5. 메뉴·권한을 한 곳에서 관리하고 플래그로 전환

원칙: **메뉴 트리·권한은 한 저장소(기존 메뉴 테이블)에 그대로 두고, 메뉴마다 "어디서 구현됐는지" 열만 추가**한다. 두 시스템이 각자 메뉴를 들고 있으면 권한이 갈라진다.

| 컬럼(예) | 의미 |
|---|---|
| `menu_id`, `parent_id`, `sort`, 권한 매핑 | 기존 그대로 |
| `impl` | `NEXACRO` / `NEXT` |
| `legacy_form_url` | 넥사크로 폼 경로(롤백용으로 **전환 후에도 삭제 금지**) |
| `next_path` | Next.js 경로 (`/admin/v2/orders`) |
| `open_mode` | `EMBED`(WebBrowser) / `WINDOW`(새 창) |
| `rollout` | 전체 / 특정 부서·사용자만 (카나리) |

- 넥사크로 메뉴 클릭 핸들러: `impl == NEXT`면 §3 방식으로 열고, 아니면 기존 폼을 연다. **분기 코드는 공통 메뉴 함수 한 곳**에만 둔다.
- Next.js: 같은 메뉴 API를 읽어 자기 내비게이션을 그린다. `impl == NEXACRO` 메뉴로 가는 링크는 넥사크로 진입 URL(+메뉴 ID 파라미터)로 hard navigation.
- 권한 검사는 **양쪽 서버에서 같은 권한 원천으로** 한다. 메뉴를 숨기는 것은 권한이 아니다 — Next.js 경로를 직접 입력해 들어오는 경우를 서버에서 막는다.
- 플래그를 `NEXT → NEXACRO`로 되돌리는 것이 **롤백 1차 수단**이다. 그래서 `legacy_form_url`과 넥사크로 폼·서버 서비스는 웨이브 종료 후 안정화 기간까지 지우지 않는다.

---

## 6. 전환 웨이브 운영 체크리스트

**웨이브 시작 전**
- [ ] 이번 웨이브 메뉴 목록과 **같이 쓰는 화면 묶음** 확정(hard navigation 왕복이 생기지 않게)
- [ ] 각 메뉴의 레거시 동작 명세(조회 조건·저장 규칙·오류 처리) 확보 — 동등성 테스트 기준
- [ ] 신·구가 **같은 테이블에 쓰는지** 확인. 같은 테이블이면 저장 로직(검증·기본값·이력·트리거 의존)을 동일하게 맞췄는지
- [ ] 롤백 경로 리허설: 플래그 되돌림 → 넥사크로 화면이 정상 동작하는지 운영과 같은 환경에서 확인

**웨이브 기간**
- [ ] **양쪽 동시 수정 금지 기간(코드 프리즈)**: 이전 대상 메뉴의 넥사크로 화면·서버 서비스에 기능 변경을 넣지 않는다. 불가피한 수정은 신·구 양쪽에 같은 PR 묶음으로 반영하고 목록에 기록
- [ ] 카나리(부서·사용자 일부) → 전체 순으로 `rollout` 확대
- [ ] 같은 레코드를 신·구 화면이 동시에 편집할 수 있으면 낙관적 잠금(버전 컬럼 등)이 양쪽에 있는지
- [ ] 오류·사용 로그를 메뉴 ID 기준으로 신·구 비교(신규 화면 오류율, 넥사크로로 되돌아간 사용자 수)

**웨이브 종료**
- [ ] 동등성 테스트 통과(조회 결과·저장 결과·오류 메시지) — `migration-parity-tester` 에이전트 활용 가능
- [ ] 안정화 기간 후 넥사크로 폼·전용 서버 서비스 제거, 메뉴의 `legacy_form_url` 정리
- [ ] 파사드 규칙 정리(더 이상 안 쓰는 분기 제거). 전부 끝나면 fallback rewrite·WebBrowser 브리지 코드 자체를 제거(전이 아키텍처 철거)

---

## 7. 흔한 실수

| 실수 | 결과 | 대응 |
|---|---|---|
| 신규 Next.js를 **다른 site 도메인**에 두고 WebBrowser로 띄움 | 로그인 쿠키가 안 실림(Lax), `callMethod` 불가(교차 출처), 휠·mousemove 이상 | 파사드로 같은 origin에 둔다 |
| 해결책으로 세션 쿠키를 무작정 `SameSite=None` | 서드파티 쿠키 차단 브라우저에서 여전히 실패 + CSRF 노출면 증가 | 배치를 고친다. 불가피하면 토큰 교환 |
| 서브도메인 공유 쿠키에 `__Host-` 접두사 | Domain 지정 불가라 공유 안 됨 | 공유 쿠키엔 `__Host-` 쓰지 않음 |
| 신규 영역에 루트 catch-all 동적 라우트 | fallback까지 안 내려가 레거시 화면이 404/엉뚱한 페이지 | 신규는 접두사 경로 아래, catch-all 금지 |
| 업무 흐름을 신·구로 쪼갬(목록은 넥사크로, 상세는 Next.js) | 클릭마다 hard navigation·상태 유실 | 같이 쓰는 화면은 같은 쪽으로 함께 옮김 |
| 메뉴·권한을 Next.js에 별도 복제 | 권한 불일치, 숨김 메뉴 직접 접근 | 한 원천 + 서버 측 권한 검사 |
| `onusernotify`로 행 데이터 통째 전송 | NRE 512자 제한 초과 | ID·이벤트만 보내고 서버에서 재조회 |
| WebBrowser `getProperty` 객체 `destroy()` 누락 | 메모리 누수(공식 경고) | 폼 종료 시 해제 |
| 전환 직후 넥사크로 폼·서비스 삭제 | 롤백 불가 | 안정화 기간 후 삭제 |
| 웨이브 중 넥사크로 쪽 기능 수정 계속 | 신규가 출시 시점에 이미 구버전 | 동시 수정 금지 기간 운영 |
| 레거시 Redis 세션을 Next.js가 직접 역직렬화 | 레거시 업그레이드 때 인증 전체 장애 | 세션 확인 API 위임 |
| 전이 아키텍처(브리지·fallback) 철거 계획 없음 | 영구 이중 구조 | 웨이브 종료 체크리스트에 철거 항목 포함 |

---

## 8. 언제 이 접근을 쓰지 않나

- 화면 수가 적고 한 번에 교체해도 리스크가 작을 때(Azure: 작은 시스템은 부적합)
- 넥사크로 소스(메뉴 공통 함수)를 수정할 수 없을 때 — 메뉴 분기를 넣을 수 없으면 새 창 링크 외에는 공존 장치를 못 단다
- 레거시를 빠르게 완전 폐기해야 할 때(Azure)
