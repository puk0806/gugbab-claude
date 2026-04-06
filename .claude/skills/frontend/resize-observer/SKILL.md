---
name: resize-observer
description: ResizeObserver API 핵심 패턴 2가지 (바닐라 JS, React Hook)
---

# ResizeObserver API 핵심 패턴

> 소스: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
> 검증일: 2026-04-06

---

## 패턴 1: 기본 관찰 (바닐라 JS)

```js
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    // contentBoxSize는 배열 (다중 fragment 대응)
    const { inlineSize: width, blockSize: height } = entry.contentBoxSize[0];
    console.log(`${width} x ${height}`);
  }
});

observer.observe(targetElement);

// 정리
observer.unobserve(targetElement); // 특정 요소 해제
observer.disconnect();             // 전체 해제
```

**핵심 규칙:**
- `contentBoxSize[0]`을 사용한다. `contentRect`는 레거시 호환용이며 새 코드에서는 `contentBoxSize` 또는 `borderBoxSize`를 쓴다.
- 콜백은 레이아웃 이후, 시각 프레임 표시 이전에 실행된다. 콜백 내에서 레이아웃을 변경하면 무한 루프 위험이 있으므로 `requestAnimationFrame`으로 감싸거나 조건부로 실행한다.
- `observe()`의 두 번째 인자로 `{ box: 'border-box' }` 지정 가능하다. 기본값은 `content-box`이다.

---

## 패턴 2: React Hook

```tsx
import { useRef, useState, useEffect } from 'react';

function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const { inlineSize: width, blockSize: height } = entries[0].contentBoxSize[0];
      setSize({ width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
}
```

**핵심 규칙:**
- cleanup에서 반드시 `disconnect()`를 호출한다. 메모리 누수 방지.
- 하나의 Observer 인스턴스로 단일 요소만 관찰하는 경우 `entries[0]`은 안전하다. 여러 요소를 관찰하면 동시에 크기가 변경된 요소 수만큼 entries가 전달된다.
- 초기 렌더링 직후에도 콜백이 한 번 실행된다. 별도의 초기 측정 로직이 필요 없다.

> 주의: `contentBoxSize`는 Safari 15.4+(2022-03) 이상에서 지원된다. 그 이전 버전을 지원해야 하면 `entry.contentRect` 폴백이 필요하다.
