## 7. 타이핑 인디케이터

```tsx
// src/components/chat/TypingIndicator.tsx
import styles from './TypingIndicator.module.scss';

export function TypingIndicator() {
  return (
    <div className={styles.indicator} aria-label="AI가 응답을 생성 중입니다">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </div>
  );
}
```

```scss
// TypingIndicator.module.scss
.indicator {
  display: inline-flex;
  gap: 4px;
  padding: 8px 12px;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.4;
  animation: bounce 1.4s infinite ease-in-out both;
}
.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .dot { animation: none; }
}
```

**표시 시점:**
- 메시지 전송 → 첫 토큰 수신 전까지 (assistant content가 빈 문자열일 때)
- 첫 토큰 수신 후에는 인디케이터를 숨기고 실제 메시지 버블로 전환

`prefers-reduced-motion` 미디어 쿼리로 모션 감소 설정 사용자에 대응한다.

---

## 8. 메시지 입력 (자동 높이 textarea)

```tsx
// src/components/chat/MessageInput.tsx
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  maxRows?: number;
}

export function MessageInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
  maxRows = 8,
}: MessageInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 자동 높이 조절
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const maxHeight = lineHeight * maxRows;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [value, maxRows]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // IME 조합 중에는 Enter를 전송으로 처리하지 않는다 (한국어/일본어 필수)
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요 (Shift+Enter 줄바꿈)"
        rows={1}
        disabled={disabled}
        aria-label="채팅 메시지 입력"
      />
      {isStreaming ? (
        <button type="button" onClick={onStop} aria-label="응답 중단">
          중단
        </button>
      ) : (
        <button type="submit" disabled={!value.trim() || disabled}>
          전송
        </button>
      )}
    </form>
  );
}
```

**핵심:**
- `e.nativeEvent.isComposing`: IME(한국어·일본어·중국어) 조합 중 Enter 처리 방지. **필수.** 빠뜨리면 한국어 입력 시 자모 완성 단계에서 메시지가 전송된다.
- Shift+Enter: 줄바꿈. `preventDefault` 안 하므로 기본 동작 유지.
- 자동 높이: `style.height = 'auto'` → `scrollHeight` 측정 → 최대 `maxRows` 제한.
- 스트리밍 중에는 "전송" → "중단" 버튼으로 전환.

---

## 9. 메시지 액션 (복사·재생성·삭제)

```tsx
// src/components/chat/MessageActions.tsx
import { useState } from 'react';
import type { ChatMessage } from '@/types/chat';

interface Props {
  message: ChatMessage;
  onRegenerate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function MessageActions({ message, onRegenerate, onDelete }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 비-HTTPS 환경 또는 권한 거부 시 폴백
      const ta = document.createElement('textarea');
      ta.value = message.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="message-actions" role="toolbar" aria-label="메시지 작업">
      <button type="button" onClick={handleCopy} aria-label="복사">
        {copied ? '복사됨' : '복사'}
      </button>
      {message.role === 'assistant' && onRegenerate && (
        <button type="button" onClick={() => onRegenerate(message.id)} aria-label="재생성">
          재생성
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={() => onDelete(message.id)} aria-label="삭제">
          삭제
        </button>
      )}
    </div>
  );
}
```

**호버 메뉴 패턴:** CSS `:hover` 또는 `:focus-within`으로 표시. 키보드 사용자도 접근 가능해야 하므로 `focus-within` 필수.

```scss
.message-bubble:hover .message-actions,
.message-bubble:focus-within .message-actions {
  opacity: 1;
}
.message-actions {
  opacity: 0;
  transition: opacity 0.15s;
}
```

> 주의: `navigator.clipboard.writeText`는 HTTPS 또는 localhost에서만 동작한다. HTTP 환경(사내망 IP 직접 접근 등)에서는 `document.execCommand('copy')` 폴백이 필요하다.

---

## 10. 에러 메시지 처리·재시도

```tsx
// src/components/chat/ErrorMessage.tsx
import type { ChatMessage } from '@/types/chat';

interface Props {
  message: ChatMessage;
  onRetry: (id: string) => void;
}

export function ErrorMessage({ message, onRetry }: Props) {
  if (message.status === 'aborted') {
    return (
      <div role="status" className="aborted-notice">
        응답이 중단되었습니다.
        <button type="button" onClick={() => onRetry(message.id)}>
          다시 시도
        </button>
      </div>
    );
  }
  if (message.status === 'error') {
    return (
      <div role="alert" className="error-notice">
        오류: {message.error ?? '응답을 받지 못했습니다'}
        <button type="button" onClick={() => onRetry(message.id)}>
          다시 시도
        </button>
      </div>
    );
  }
  return null;
}
```

**핵심:**
- `role="alert"`: 에러는 즉시 알림 (assertive). screen reader가 현재 작업을 중단하고 읽음.
- `role="status"`: 중단(aborted)은 polite — 사용자가 자발적으로 한 행위이므로 강한 알림 불필요.
- 사용자에게 보여줄 메시지는 일반화한다. API endpoint·스택 트레이스 노출 금지.

---

## 11. 접근성 (a11y)

| 항목 | 패턴 | 이유 |
|------|------|------|
| 채팅 컨테이너 | `role="log" aria-live="polite"` | 새 메시지 자동 알림, 사용자 작업 방해 안 함 |
| 에러 알림 | `role="alert"` (implicit `aria-live="assertive"`) | 즉시 알림 필요 |
| 중단 알림 | `role="status"` (implicit `aria-live="polite"`) | 사용자 자발적 행위 |
| 타이핑 인디케이터 | `aria-label="AI가 응답을 생성 중입니다"` | 시각 정보(점 애니메이션) 대체 |
| 입력창 | `aria-label="채팅 메시지 입력"` | 컨텍스트 명확화 |
| 액션 버튼 | `aria-label`로 아이콘 의미 보강 | 아이콘 only 버튼 대응 |
| 모션 감소 | `@media (prefers-reduced-motion: reduce)` | 사용자 OS 설정 존중 |
| 키보드 탐색 | `Tab` / `Shift+Tab`, Enter 전송, Shift+Enter 줄바꿈 | 마우스 없이 사용 가능 |

> `role="log"`는 implicit `aria-live="polite"` + `aria-atomic="false"`를 가진다. 별도로 명시할 필요는 없지만, 일부 screen reader 호환을 위해 명시하는 것이 안전하다.

---

## 12. 흔한 함정과 대응

### 12-1. Markdown XSS

> react-markdown은 기본적으로 안전하다. `dangerouslySetInnerHTML`을 사용하지 않으므로 별도 sanitize가 필요 없다. 단, `rehype-raw`로 raw HTML을 활성화하거나 `urlTransform`을 약화시키면 위험해진다.

### 12-2. 긴 코드 블록 가로 스크롤

코드 블록이 채팅 버블을 뚫고 나가는 문제:

```scss
.assistant pre {
  max-width: 100%;
  overflow-x: auto;
  white-space: pre;       // 코드 줄바꿈은 \n 기준으로만
}
.assistant code {
  word-break: break-word; // 인라인 코드는 한국어 줄바꿈 허용
}
```

### 12-3. 한국어 줄바꿈

CJK 문자는 어절 단위가 모호해 영어 기준 `word-break: break-word`가 어색하게 동작한다.

```scss
.message-bubble {
  word-break: keep-all;    // 어절 단위 줄바꿈
  overflow-wrap: anywhere; // 너무 긴 단어/URL은 강제 줄바꿈
  line-break: strict;      // 한국어 줄바꿈 규칙 엄격 적용
}
```

### 12-4. 이모지 폭/높이 일관성

이모지가 베이스라인을 흐트러뜨리거나 폰트마다 다른 폭으로 표시되는 문제:

```scss
.message-bubble {
  font-family: 'Noto Sans KR', system-ui, sans-serif,
               'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji';
}
```

이모지 폰트를 system 폰트 *뒤*에 두면 일반 텍스트는 system, 이모지만 컬러 이모지 폰트로 표시된다.

### 12-5. 스트리밍 토큰 함수 인자 stale 클로저

```tsx
// 잘못된 예 — content가 클로저에 갇혀 항상 빈 문자열
setMessages([...messages, { ...assistantMsg, content: assistantMsg.content + token }]);

// 올바른 예 — 함수형 업데이트
setMessages((prev) => prev.map((m) => /* ... */));
```

### 12-6. IME 조합 중 Enter 전송

`e.nativeEvent.isComposing` 체크 누락 시 한국어 입력 도중 메시지가 잘려서 전송된다. 8번 섹션 참조.

### 12-7. AbortController 재사용 금지

```tsx
// 잘못된 예 — 한 번 abort된 controller는 재사용 불가
const controller = useMemo(() => new AbortController(), []);

// 올바른 예 — 매 요청마다 새로 생성 (위 4번 섹션 예시)
const controller = new AbortController();
controllerRef.current = controller;
```

### 12-8. 스트리밍 중 Markdown 전체 재파싱 비용

매 토큰마다 `<Markdown>{content}</Markdown>`을 재호출하면 100토큰 이상에서 눈에 띄게 끊긴다. 5-3의 전략 B(스트리밍 중 plain text, 완료 후 Markdown 한 번) 권장.

---

## 13. 전체 조립 예시

```tsx
// src/components/chat/ChatContainer.tsx
import { useChatStream } from '@/hooks/useChatStream';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

export function ChatContainer() {
  const { messages, isStreaming, send, stop } = useChatStream();
  const lastAssistant = messages[messages.length - 1];
  const showTyping =
    isStreaming &&
    lastAssistant?.role === 'assistant' &&
    lastAssistant.content === '';

  return (
    <div className="chat-container">
      <MessageList messages={messages} isStreaming={isStreaming} />
      {showTyping && <TypingIndicator />}
      <MessageInput
        onSend={send}
        onStop={stop}
        isStreaming={isStreaming}
      />
    </div>
  );
}
```

---

## 14. 언제 사용 / 사용하지 않을지

**사용하기 좋은 경우:**
- LLM 챗봇 UI (스트리밍 응답, Markdown 출력, 대화 히스토리)
- 실시간 채팅 (단, 메시지 형식이 Markdown이거나 일반 텍스트)
- 코드 블록·표·리스트가 풍부한 응답을 보여줘야 할 때

**사용하지 않는 게 좋은 경우:**
- 단순 알림 토스트 — 채팅 UI 오버킬
- 1:1 텍스트 채팅 (Markdown 불필요, 이모지·이미지 위주) — `MessageBubble` 자체 구현이 더 가볍다
- 음성 통화 UI — 채팅과는 다른 도메인
- 대규모 협업 문서 — Quill·Lexical·TipTap 등 에디터 라이브러리 사용

---

## 15. 라이브러리 버전 호환성

| 패키지 | 검증 버전 | React 요구사항 | Node 요구사항 |
|--------|----------|----------------|---------------|
| react-markdown | 10.1.0 | React 18+ | Node 16+ |
| remark-gfm | 4.0.1 | — | Node 16+ |
| rehype-highlight | 7.0.2 | — | Node 16+ |
| react-virtuoso | 4.x | React 16.8+ | — |

> 주의: react-markdown v9 → v10 마이그레이션 시 ESM 전용 패키지인 점, `transformImageUri`/`transformLinkUri` → `urlTransform` 통합 등 breaking change가 있다. 신규 프로젝트는 v10 사용 권장.

---

## 16. react-virtuoso 범용 API 요약 (구 `frontend/react-virtuoso` 스킬 흡수)

> 소스: https://virtuoso.dev/react-virtuoso/ · https://github.com/petyosi/react-virtuoso
> 버전 기준: react-virtuoso 4.18.5 (검증일 2026-04-20, 2026-09-26 이 스킬로 병합)

### 16-1. 컴포넌트 선택

| 컴포넌트 | 사용 시점 |
|----------|----------|
| `Virtuoso` | 단일 열 리스트, 가변 높이 아이템 (채팅 메시지 리스트) |
| `VirtuosoGrid` | CSS Grid/Flexbox 그리드 — **동일 크기 아이템만**. 가변 높이(Masonry)는 `@virtuoso.dev/masonry` |
| `TableVirtuoso` | 실제 `<table>/<thead>/<tbody>` 유지, `fixedHeaderContent`로 헤더 고정 |
| `GroupedVirtuoso` | `groupCounts` + `groupContent`로 sticky 그룹 헤더 (날짜 구분선 등) |
| `GroupedTableVirtuoso` | 그룹 헤더 + 테이블 |

`data` prop을 넘기면 `itemContent(index, item)`의 `item` 타입이 제네릭으로 추론된다. 핸들 타입은 `VirtuosoHandle`·`TableVirtuosoHandle`·`GroupedVirtuosoHandle`·`VirtuosoGridHandle`.

### 16-2. 높이 측정·성능 props

| prop | 버전 | 용도 |
|------|------|------|
| (기본) | — | ResizeObserver로 아이템 실측 — 이미지 로딩·텍스트 확장에도 자동 대응 |
| `fixedItemHeight` | — | 모든 아이템 높이가 같으면 측정 생략 (v4.15.0+ GroupedVirtuoso도 지원) |
| `defaultItemHeight` | — | 첫 아이템 probe 렌더링 생략 |
| `heightEstimates` | v4.16.0+ | 아이템별 높이 추정 배열 → 초기 스크롤바 정확도 향상, 실측값으로 점차 대체 |
| `minOverscanItemCount` | v4.17.0+ | 뷰포트 밖 최소 N개 유지 (`{ top, bottom }` 개별 지정 가능) — 아주 큰 아이템에서 픽셀 overscan 부족 시 |
| `overscan` / `increaseViewportBy` | — | 뷰포트 밖 추가 렌더 픽셀 (후자는 `{ top, bottom }` 양방향) |
| `scrollSeekConfiguration` + `components.ScrollSeekPlaceholder` | — | 빠른 스크롤(`velocity` 기준 enter/exit) 중 가벼운 플레이스홀더 렌더 |
| `useWindowScroll` | — | 컨테이너 대신 window 스크롤 사용 (높이 지정 불필요) |
| `initialItemCount` | — | SSR 시 초기 렌더 아이템 수 |

React Compiler 사용 중이면 `itemContent` 안의 수동 `React.memo`는 불필요하다.

### 16-3. 프로그래매틱 스크롤

- `ref.current?.scrollToIndex({ index, align: 'start' | 'center' | 'end', behavior: 'smooth' | 'auto' })`
- `initialTopMostItemIndex` — 초기 위치 (채팅은 마지막 인덱스)
- `followOutput` — `true`·`'smooth'`·`'auto'` 또는 함수. 데이터 추가 시 바닥 추적, 사용자가 위로 스크롤하면 중단
- `endReached` — **하단** 도달 콜백. 최신 아이템이 아래에 있는 목록에서 "더 아래로" 불러올 때만 사용 (TanStack Query `useInfiniteQuery`면 `if (hasNextPage) fetchNextPage()` + `components.Footer`에 `isFetchingNextPage` 표시)
- `startReached` + `firstItemIndex` — **상단** 도달 시 과거 데이터 prepend. `initialTopMostItemIndex`로 하단부터 시작하는 채팅에서 위로 스크롤해 과거 메시지를 불러오는 패턴이 이것이다. `firstItemIndex`를 prepend 개수만큼 감소시켜야 스크롤 점프 없이 유지된다 — 전체 코드는 SKILL.md 3절 참조

> 정정 (2026-09-26): 과거 이 절은 "과거 메시지 로드"를 `endReached`로 뭉뚱그렸으나, 채팅처럼 최신 메시지가 아래에 있는 목록에서 과거를 불러오는 것은 상단 도달이므로 `startReached`가 맞는 API다.

### 16-4. 라이브러리 선택: react-virtuoso vs 대안

| 기준 | react-virtuoso | @tanstack/react-virtual | react-window |
|------|---------------|------------------------|--------------|
| 동적 높이 | 자동 측정 (설정 불필요) | 수동 측정 (`measureElement`) | 제한적 (VariableSizeList 수동) |
| 테이블 / 그룹 헤더 | 내장 | 직접 구현 | 미지원 |
| 무한 스크롤 | `endReached` 내장 | 직접 구현 | react-window-infinite-loader |
| API | 선언적, 간단 | Headless (유연, 코드 많음) | 간단하지만 기능 제한 |

- **react-virtuoso**: 채팅처럼 가변 높이·자동 바닥 추적·그룹 헤더가 필요할 때
- **@tanstack/react-virtual**: 번들 크기가 중요하거나 완전한 커스텀 레이아웃이 필요할 때
- **react-window**: 1.8.11에서 React 19 지원 추가, v2 개발 중 — 단순 고정 높이 리스트·레거시 유지보수

### 16-5. 흔한 실수 (SKILL.md 3절 3가지 외)

| 실수 | 결과 / 대응 |
|------|------------|
| VirtuosoGrid에서 가변 높이 기대 | 레이아웃 깨짐 → 동일 크기로 맞추거나 `@virtuoso.dev/masonry` |
| `LogLevel[0]` 같은 enum 리버스 매핑 | **v4.18.2 Breaking Change** — `undefined` 반환. `LogLevel.DEBUG` named 접근만 사용 |
| `role`/`aria-live`를 Virtuoso에 직접 전달했는데 반영 안 됨 | 외부 `<div role="log" aria-live="polite">`로 래핑 (SKILL.md 3절) |
| 채팅 과거 메시지 로드를 `endReached`로 구현 | 최신 메시지가 하단인 채팅에서 과거 로드는 **상단 도달** — `startReached` + `firstItemIndex` 감소가 맞는 패턴 (SKILL.md 3절) |
| 무료 `Virtuoso`와 유료 `VirtuosoMessageList`(`@virtuoso.dev/message-list`) 혼동 | 후자는 license key가 필요한 상용 패키지. 이 스킬 예시는 전부 오픈소스 `Virtuoso` 기준 |
