---
name: page-visibility-api
description: Page Visibility API 핵심 패턴 2가지 - 탭 가시성 감지와 리소스 절약
---

# Page Visibility API

> 소스: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
> 소스: https://www.w3.org/TR/page-visibility-2/
> 검증일: 2026-04-06

---

## 핵심 API

| API | 타입 | 설명 |
|-----|------|------|
| `document.visibilityState` | `"visible"` \| `"hidden"` | 현재 탭 가시성 상태 |
| `document.hidden` | `boolean` | `visibilityState === "hidden"`과 동일 |
| `visibilitychange` 이벤트 | `Event` | `document`에서 발생, 탭 전환/최소화 시 트리거 |

> 주의: W3C Level 2 사양에서 `"prerender"` 상태는 제거되었다. `"visible"` 또는 `"hidden"` 두 값만 존재한다.

---

## 패턴 1: 탭 비활성 시 작업 일시정지

폴링, 애니메이션, 비디오 재생 등을 탭이 보이지 않을 때 중단한다.

```typescript
let intervalId: number | null = null;

function startPolling() {
  if (intervalId) return;
  intervalId = window.setInterval(() => {
    fetch("/api/data");
  }, 5000);
}

function stopPolling() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    stopPolling();
  } else {
    startPolling();
  }
});

startPolling();
```

**적용 대상:** `setInterval` 폴링, `requestAnimationFrame` 루프, `<video>` / `<audio>` 재생

---

## 패턴 2: 탭 복귀 시 데이터 갱신

사용자가 탭으로 돌아왔을 때 stale 데이터를 새로고침한다.

```typescript
let lastFetchTime = Date.now();
const STALE_THRESHOLD = 60_000; // 1분

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    const elapsed = Date.now() - lastFetchTime;
    if (elapsed >= STALE_THRESHOLD) {
      refreshData();
    }
  }
});

async function refreshData() {
  lastFetchTime = Date.now();
  const res = await fetch("/api/data");
  // UI 업데이트
}
```

**핵심:** 무조건 fetch하지 않고 경과 시간을 체크하여 불필요한 요청을 방지한다.

---

## 주의사항

- `visibilitychange`는 반드시 `document`에 등록한다. `window`에 등록하면 동작하지 않는다.
- 모바일 브라우저에서 탭 전환 외에 홈 화면 이동, 앱 전환 시에도 `hidden`으로 전환된다.
- 탭 종료 시점의 신뢰할 수 있는 마지막 이벤트는 `visibilitychange("hidden")`이다. MDN은 `beforeunload` 대신 이 이벤트를 세션 종료 신호로 권장한다. 단, 모바일 강제 종료 등 극단적 케이스에서는 발생이 보장되지 않는다.
