---
name: mutation-observer
description: MutationObserver API 핵심 패턴 2가지 (DOM 변경 감지)
---

# MutationObserver API - 핵심 패턴

> 소스: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
> 소스: https://dom.spec.whatwg.org/#interface-mutationobserver
> 검증일: 2026-04-02

---

## 패턴 1: 자식 노드 추가/제거 감지

동적으로 삽입되거나 제거되는 DOM 노드를 감지할 때 사용한다.

```typescript
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          // 추가된 요소 처리
        }
      });
      mutation.removedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          // 제거된 요소 처리
        }
      });
    }
  }
});

observer.observe(targetElement, {
  childList: true,   // 자식 노드 추가/제거 감지
  subtree: true,     // 하위 트리 전체 감지
});

// 정리: 더 이상 필요 없을 때 반드시 호출
observer.disconnect();
```

**주요 옵션:**
- `childList: true` -- 직접 자식의 추가/제거 감지 (필수 옵션 중 하나)
- `subtree: true` -- 대상 노드의 모든 하위 노드까지 범위 확장

---

## 패턴 2: 속성(attribute) 변경 감지

특정 요소의 속성 값 변화를 추적할 때 사용한다.

```typescript
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "attributes") {
      const target = mutation.target as HTMLElement;
      const name = mutation.attributeName!;
      const oldValue = mutation.oldValue;
      const newValue = target.getAttribute(name);
      // 속성 변경 처리
    }
  }
});

observer.observe(targetElement, {
  attributes: true,              // 속성 변경 감지
  attributeOldValue: true,       // 변경 전 값 기록
  attributeFilter: ["class", "data-state"],  // 특정 속성만 필터링
});
```

**주요 옵션:**
- `attributes: true` -- 속성 변경 감지 (필수 옵션 중 하나)
- `attributeOldValue: true` -- `mutation.oldValue`로 이전 값 접근 가능
- `attributeFilter` -- 배열에 지정한 속성명만 감지 (성능 최적화)

---

## React useEffect 연동 패턴

```typescript
import { useEffect, useRef } from 'react'

function useMutationObserver(
  ref: React.RefObject<HTMLElement | null>,
  callback: MutationCallback,
  options: MutationObserverInit
) {
  useEffect(() => {
    if (!ref.current) return
    const observer = new MutationObserver(callback)
    observer.observe(ref.current, options)
    return () => observer.disconnect()
  }, [ref, callback, options])
}

// 사용 예시
function MyComponent() {
  const targetRef = useRef<HTMLDivElement>(null)
  useMutationObserver(
    targetRef,
    (mutations) => {
      mutations.forEach(m => console.log(m.type, m.addedNodes))
    },
    { childList: true, subtree: true }
  )
  return <div ref={targetRef}>...</div>
}
```

---

## 필수 규칙

- `observe()` 호출 시 `childList`, `attributes`, `characterData` 중 최소 하나는 `true`여야 한다. 그렇지 않으면 `TypeError`가 발생한다.
- `disconnect()` 호출 전에 `takeRecords()`로 미처리 큐를 회수할 수 있다.
- 콜백은 마이크로태스크로 실행되며, 여러 변경이 배치(batch)로 전달된다.
- SPA에서 컴포넌트 언마운트 시 반드시 `disconnect()`를 호출하여 메모리 누수를 방지한다.
