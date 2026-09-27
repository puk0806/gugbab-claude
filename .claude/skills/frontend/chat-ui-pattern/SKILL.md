---
name: chat-ui-pattern
description: LLM 챗봇용 React 채팅 UI 패턴 — 메시지 버블·가상 스크롤·스트리밍 토큰 누적·자동 스크롤·Markdown 렌더링(react-markdown v10 + remark-gfm + rehype-highlight)·타이핑 인디케이터·자동 높이 입력·메시지 액션·에러 재시도·접근성(aria-live/role=log)
---

# LLM 챗봇용 React 채팅 UI 패턴

> 소스: https://github.com/remarkjs/react-markdown
> 소스: https://github.com/remarkjs/remark-gfm
> 소스: https://github.com/rehypejs/rehype-highlight
> 소스: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
> 소스: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live
> 소스: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
> 소스: https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA23
> 검증일: 2026-05-14
> 버전 기준: react-markdown 10.1.0 · remark-gfm 4.0.1 · rehype-highlight 7.0.2 · react-virtuoso 4.x

> 소스: https://virtuoso.dev/react-virtuoso/ (react-virtuoso 4.18.5 기준 — 2026-09-26 구 `frontend/react-virtuoso` 스킬 흡수)
> 소스: https://virtuoso.dev/virtuoso-api/interfaces/VirtuosoProps/ (`firstItemIndex`/`startReached` 공식 정의, 2026-09-26 확인)
> 소스: https://github.com/petyosi/react-virtuoso/discussions/1032 (firstItemIndex 큰 오프셋 값 안전성, 메인테이너 확인)
> 소스: https://virtuoso.dev/message-list/ (`VirtuosoMessageList` 상용 라이선스 확인)
>
> **가상 스크롤:** react-virtuoso 채팅 패턴은 3절, 범용 API 요약(컴포넌트 선택·높이 측정 props·성능 옵션·라이브러리 비교·흔한 실수)은 references/REFERENCE.md 16절에 있다.

---

## 1. 채팅 UI 도메인 모델

### 1-1. 메시지 타입과 role

OpenAI/Anthropic Messages API 호환 형태로 설계한다.

```ts
// src/types/chat.ts
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;             // 클라이언트 생성 UUID (재생성 시 식별용)
  role: MessageRole;
  content: string;        // Markdown 원본 문자열
  createdAt: number;      // epoch ms
  status?: 'streaming' | 'done' | 'error' | 'aborted';
  error?: string;         // status === 'error'일 때 메시지
}
```

| role | 의미 | UI 표현 |
|------|------|---------|
| `user` | 사용자 입력 | 우측 정렬, 강조 배경 |
| `assistant` | LLM 응답 | 좌측 정렬, 중립 배경, Markdown 렌더 |
| `system` | 시스템 프롬프트/공지 | 중앙, 작은 글씨, 또는 숨김 |

---

## 2. 메시지 버블 컴포넌트

role 기반 분기는 컴포넌트 외부에서 처리하고, 버블 자체는 presentational로 유지한다.

```tsx
// src/components/chat/MessageBubble.tsx
import type { ChatMessage } from '@/types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import styles from './MessageBubble.module.scss';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { role, content, status } = message;

  if (role === 'system') {
    return (
      <div className={styles.system} role="note">
        {content}
      </div>
    );
  }

  const isUser = role === 'user';
  return (
    <article
      className={isUser ? styles.user : styles.assistant}
      aria-label={isUser ? '사용자 메시지' : 'AI 응답'}
    >
      {isUser ? (
        // user 메시지는 일반 텍스트만, Markdown 렌더 안 함 (불필요한 비용)
        <p className={styles.text}>{content}</p>
      ) : (
        <MarkdownRenderer content={content} streaming={status === 'streaming'} />
      )}
    </article>
  );
}
```

**핵심 결정:**
- `user` 메시지는 Markdown 파싱하지 않는다. 입력 문자열을 그대로 표시하여 의도치 않은 포맷 변환을 막는다.
- `assistant` 메시지만 Markdown으로 렌더링.

---

## 3. 메시지 리스트 가상 스크롤

긴 대화(100건 이상)에서는 react-virtuoso로 가상화한다. 범용 API는 references/REFERENCE.md 16절을 보고, 여기서는 채팅 특화 패턴만 정리한다.

**가상화가 무효가 되는 실수 3가지 (먼저 확인):**
- **높이 미지정** — `style={{ height }}` 또는 부모 CSS 높이가 없으면 모든 아이템이 렌더링된다 (`useWindowScroll`이면 불필요).
- **`components.List`에 ref 미전달** — 커스텀 List는 `React.forwardRef`로 감싸 ref를 넘겨야 스크롤이 동작한다.
- **`startReached`/`endReached` 중복 호출** — `if (!loading && hasMore)` 가드 없이 부르면 요청이 중복된다. **과거 메시지 추가 로드는 `endReached`가 아니라 `startReached`다** — 아래 참조.

> 주의 (2026-09-26 정정): 이전 버전은 "과거 메시지 추가 로드"를 `endReached`로 설명했으나 틀렸다. `initialTopMostItemIndex`로 하단(최신 메시지)에서 시작하는 채팅에서 위로 스크롤해 과거 메시지를 불러오는 것은 **상단 도달**이므로 `startReached` + `firstItemIndex` 감소 패턴이 react-virtuoso 공식 API 의도다(virtuoso.dev `VirtuosoProps` 레퍼런스: "firstItemIndex는 역방향 무한 스크롤 구현 시 데이터 prepend와 함께 감소시켜 사용"). `endReached`는 **하단 무한 스크롤**(예: 리드 온리 스레드에서 아래로 더 불러오기) 전용으로 남겨둔다.

```tsx
// src/components/chat/MessageList.tsx
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/types/chat';
import { MessageBubble } from './MessageBubble';

// firstItemIndex 초기 오프셋. 실제 배열 크기와 무관한 내부 인덱스 값일 뿐이라
// 큰 수를 잡아도 undefined 아이템 배열이 생기지 않는다 (petyosi/react-virtuoso 메인테이너 확인).
const START_INDEX = 1_000_000;

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  hasMoreOlder?: boolean;
  onLoadOlder?: () => Promise<ChatMessage[]>; // 과거 메시지를 반환 (호출부에서 messages 앞에 붙임)
}

export function MessageList({ messages, isStreaming, hasMoreOlder, onLoadOlder }: MessageListProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const atBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);

  // 스트리밍 중 새 토큰이 추가될 때 사용자가 바닥에 있으면 자동 추적
  useEffect(() => {
    if (atBottomRef.current && messages.length > 0) {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length - 1,
        align: 'end',
        behavior: 'auto', // 스트리밍 중 smooth는 토큰마다 호출돼 성능 부담
      });
    }
  }, [messages]);

  // 상단 도달 → 과거 메시지 prepend.
  // firstItemIndex를 prepend한 개수만큼 감소시켜야 Virtuoso가 점프 없이
  // 스크롤 위치를 유지한 채 위쪽에 새 아이템을 붙인다 (공식 firstItemIndex 의도).
  const handleStartReached = useCallback(async () => {
    if (loadingOlderRef.current || !hasMoreOlder || !onLoadOlder) return;
    loadingOlderRef.current = true;
    const older = await onLoadOlder();
    setFirstItemIndex((prev) => prev - older.length);
    loadingOlderRef.current = false;
  }, [hasMoreOlder, onLoadOlder]);

  return (
    <Virtuoso
      ref={virtuosoRef}
      data={messages}
      firstItemIndex={firstItemIndex}
      initialTopMostItemIndex={messages.length - 1}
      startReached={handleStartReached}
      itemContent={(_, message) => <MessageBubble message={message} />}
      followOutput={isStreaming ? 'smooth' : 'auto'}
      atBottomStateChange={(atBottom) => {
        atBottomRef.current = atBottom;
      }}
      role="log"
      aria-live="polite"
      aria-atomic="false"
    />
  );
}
```

**채팅 특화 props:**

| prop | 값 | 설명 |
|------|-----|------|
| `followOutput` | `'smooth'` 또는 `'auto'` 또는 함수 | 새 아이템 추가 시 자동으로 바닥 추적. 사용자가 위로 스크롤하면 자동으로 중단됨 |
| `atBottomStateChange` | `(atBottom) => void` | 바닥 여부 변경 감지 → "맨 아래로" 버튼 표시 트리거 |
| `initialTopMostItemIndex` | `messages.length - 1` | 첫 렌더 시 마지막 메시지부터 표시 (하단 시작) |
| `firstItemIndex` | 큰 초기값(예: `1_000_000`)에서 prepend 개수만큼 감소 | **과거 메시지를 위로 prepend할 때 필수.** 이 값 없이 `data`만 앞에 추가하면 스크롤 위치가 튄다 |
| `startReached` | `() => void \| Promise<void>` | **상단 도달 시 과거 메시지 로드.** 항상 `firstItemIndex` 갱신과 짝을 이뤄야 한다. 로딩 가드 필수 |
| `endReached` | `() => void \| Promise<void>` | 하단 도달 콜백. 이 채팅 패턴(최신 메시지가 맨 아래)에서는 보통 쓰이지 않음 — 아래로 더 불러오는 리드 온리 피드에만 사용 |

> 주의: react-virtuoso의 `role`/`aria-live` 적용 가능 여부는 버전에 따라 다르다. 적용이 안 되면 외부 `<div role="log" aria-live="polite">`로 래핑하고 그 안에 `<Virtuoso>`를 배치한다.

> 참고: react-virtuoso 팀은 채팅 전용 컴포넌트 `VirtuosoMessageList`(`@virtuoso.dev/message-list`)도 별도로 제공한다. 여기서 다루는 `Virtuoso`(오픈소스, MIT)와 달리 **상용 라이선스**(license key 필요)이며 무료가 아니다. 이 스킬은 무료 오픈소스 `Virtuoso` 컴포넌트 기준으로 작성됐다.

---

## 4. 스트리밍 토큰 누적 표시

LLM API가 SSE/스트리밍으로 토큰 단위로 응답할 때 다음 패턴을 사용한다.

```tsx
// src/hooks/useChatStream.ts
import { useCallback, useRef, useState } from 'react';
import type { ChatMessage } from '@/types/chat';

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const send = useCallback(async (userContent: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userContent,
      createdAt: Date.now(),
      status: 'done',
    };
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      status: 'streaming',
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userContent }),
        signal: controller.signal,
      });
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const token = decoder.decode(value, { stream: true });

        // 함수형 업데이트로 동시성 안전하게 누적
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + token } : m,
          ),
        );
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, status: 'done' } : m)),
      );
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                status: isAbort ? 'aborted' : 'error',
                error: isAbort ? undefined : (err as Error).message,
              }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
      controllerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  return { messages, isStreaming, send, stop };
}
```

**핵심 포인트:**
- `useState` 함수형 업데이트(`setMessages(prev => ...)`)로 토큰 누적. 클로저 stale state 회피.
- `AbortController`로 중단 → `controller.abort()`. 에러 이름 `AbortError`로 정상/비정상 구분.
- 스트리밍 중에는 `status: 'streaming'`, 종료 후 `'done'` → Markdown 재렌더링 트리거.
- `assistantMsg`를 먼저 빈 상태로 추가하고 토큰을 채워나가는 방식 → UI에 빈 버블이 즉시 보이며 진행감 표현.

> 주의: 스트리밍 중 매 토큰마다 Markdown 전체 파싱이 일어나면 비용이 크다. 아래 5-3 참조.

---

## 5. Markdown 렌더링 (react-markdown v10)

### 5-1. 설치 및 기본 사용

```bash
npm install react-markdown remark-gfm rehype-highlight
npm install --save-dev @types/react
```

```tsx
// src/components/chat/MarkdownRenderer.tsx
import { memo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // 코드 블록 테마

interface MarkdownRendererProps {
  content: string;
  streaming?: boolean;
}

function MarkdownRendererBase({ content, streaming }: MarkdownRendererProps) {
  // 스트리밍 중에는 플레인 텍스트로 렌더 → 토큰마다 AST 재계산 회피
  if (streaming) {
    return <pre className="streaming-text">{content}</pre>;
  }
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
    >
      {content}
    </Markdown>
  );
}

export const MarkdownRenderer = memo(MarkdownRendererBase);
```

### 5-2. 지원되는 Markdown 확장 (remark-gfm)

`remark-gfm` v4.0.1은 다음 GFM 확장을 추가한다:

| 기능 | 예시 |
|------|------|
| Tables | `\| Header \| ... \|` |
| Strikethrough | `~~text~~` |
| Task lists | `- [x] done` |
| Autolinks | `www.example.com` (URL 자동 링크) |
| Footnotes | `[^1]` |

### 5-3. 스트리밍 중 Markdown 렌더링 전략

| 전략 | 장점 | 단점 |
|------|------|------|
| **A. 매 토큰마다 Markdown 재파싱** | 실시간 포맷 미리보기 | 100 토큰/초에서 끊김, 코드 블록 미완성 표시 |
| **B. 스트리밍 중 plain text, 완료 후 Markdown** (위 예시) | 가벼움, 안정적 | 스트리밍 중에는 표·코드 블록 포맷 안 보임 |
| **C. debounce(예: 100ms)로 주기 재파싱** | 절충안 | 추가 코드 필요 |

**권장:** 일반 사용자 채팅은 **B**, 데모/콘솔처럼 즉시 포맷이 필요하면 C 또는 A.

### 5-4. XSS 안전성

> react-markdown은 **secure by default**다. 내부적으로 `dangerouslySetInnerHTML`을 사용하지 않고 AST를 React 엘리먼트로 변환한다. 기본 URL 변환기는 `javascript:`, `vbscript:`, `file:` 같은 위험 프로토콜을 차단한다.

**별도 sanitize가 필요한 경우:**
- `urlTransform` prop을 커스텀해서 외부 URL을 허용하는 경우
- HTML 통과 플러그인(`rehype-raw`)을 추가한 경우
- 신뢰할 수 없는 출처에서 받은 Markdown을 렌더링하는 경우

이런 경우에만 `rehype-sanitize`를 함께 사용한다.

```tsx
import rehypeSanitize from 'rehype-sanitize';
// rehypePlugins={[rehypeSanitize, rehypeHighlight]} 순서 중요: sanitize 먼저
```

> 주의: LLM 응답이 사용자 입력을 그대로 포함하는 경우(프롬프트 인젝션 결과 등) 일반적으로는 react-markdown 기본만으로 안전하지만, 보안이 중요한 도메인(금융·의료)에서는 `rehype-sanitize`를 추가하는 것을 권장한다.

---

## 6. 자동 스크롤 패턴

react-virtuoso의 `followOutput`을 쓰지 않고 직접 구현해야 할 때 (단순 채팅, 작은 리스트):

```tsx
// src/components/chat/SimpleMessageList.tsx
import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/types/chat';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages: ChatMessage[];
}

const SCROLL_THRESHOLD = 100; // px

export function SimpleMessageList({ messages }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // 사용자가 스크롤을 위로 올렸는지 감지
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShouldAutoScroll(distanceFromBottom < SCROLL_THRESHOLD);
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, shouldAutoScroll]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      style={{ overflowY: 'auto', height: '100%' }}
    >
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
```

**핵심:**
- `shouldAutoScroll` state로 사용자 의도 보존. 사용자가 위로 스크롤하면 새 메시지가 와도 자동으로 따라가지 않는다.
- "맨 아래로" 버튼은 `shouldAutoScroll === false`일 때만 표시하면 UX가 자연스럽다.
- `behavior: 'smooth'`는 MDN 기준 모든 모던 브라우저(2020년 이후) 지원.

> 주의: `block: 'end'`는 컨테이너 내부 스크롤에서 동작한다. 만약 컨테이너에 `overflow: hidden`이 잘못 걸려 있으면 부모로 스크롤이 전파되어 페이지 전체가 튄다. 컨테이너에 명시적 `overflow-y: auto`와 고정 높이를 부여해야 한다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
