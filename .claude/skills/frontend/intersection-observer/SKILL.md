---
name: intersection-observer
description: Intersection Observer API 핵심 사용 패턴
---

# Intersection Observer API

> 소스: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
> 검증일: 2026-04-02

---

## 1. 기본 관찰 패턴

```js
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 요소가 뷰포트에 진입
      }
    });
  },
  { threshold: 0.1 } // 10% 이상 보일 때 콜백 실행
);

observer.observe(targetElement);
```

- `threshold`: 0 ~ 1 사이 값 또는 배열. 콜백 트리거 시점 결정.
- `rootMargin`: CSS margin 형식 문자열 (`"0px 0px -100px 0px"`). 루트 영역 확장/축소.
- `root`: 기본값 `null` (뷰포트). 특정 스크롤 컨테이너 지정 가능.

---

## 2. 한 번만 관찰 (Lazy Load)

```js
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      loadImage(entry.target);
      obs.unobserve(entry.target); // 한 번 감지 후 해제
    }
  });
});

document.querySelectorAll("img[data-src]").forEach((img) => {
  observer.observe(img);
});
```

핵심: `unobserve`로 불필요한 관찰을 즉시 해제하여 성능 유지.

---

## 3. React에서 커스텀 훅

```tsx
function useIntersection(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );
    observer.observe(el);

    return () => observer.disconnect(); // cleanup 필수
  }, [ref, options]);

  return isIntersecting;
}
```

> 주의: `options` 객체를 매 렌더마다 새로 생성하면 useEffect가 반복 실행된다. 컴포넌트 외부 상수 또는 useMemo로 안정화할 것.

---

## 정리

| 메서드 | 용도 |
|--------|------|
| `observe(el)` | 관찰 시작 |
| `unobserve(el)` | 특정 요소 관찰 해제 |
| `disconnect()` | 모든 관찰 해제 (cleanup용) |
