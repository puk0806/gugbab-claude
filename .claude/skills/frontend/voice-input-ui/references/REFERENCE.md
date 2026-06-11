## 6. 모바일 첫 사용자 경험

### 6-1. iOS Safari

| 항목 | 동작 |
|------|------|
| HTTPS 필수 | HTTP에서는 `navigator.mediaDevices`가 `undefined` |
| 사용자 제스처 필수 | `click`/`touchend` 핸들러 내에서만 권한 프롬프트 |
| 권한 지속성 | 가장 짧음 — SPA 라우팅 후 권한이 재요청될 수 있음 |
| AudioContext 자동재생 정책 | 사용자 제스처 전에 `new AudioContext()`를 만들면 `suspended` 상태. 클릭 핸들러 내에서 `audioCtx.resume()` 호출 |

```ts
async function ensureAudioCtxRunning(ctx: AudioContext) {
  if (ctx.state === 'suspended') await ctx.resume();
}
```

### 6-2. Android Chrome

| 항목 | 동작 |
|------|------|
| 무음 구간 | Web Speech API는 약 3~7초 무음 시 자동 종료(`onspeechend`/`onend`) |
| 백그라운드 탭 | 탭 전환 시 mic stream과 SpeechRecognition이 *일시 중단·종료*될 수 있음 — `visibilitychange` 감지 |

```ts
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.kind === 'listening') {
    dispatch({ type: 'STOP_REQUESTED' });
  }
});
```

### 6-3. 첫 사용자 온보딩

처음 사용자는 권한 다이얼로그를 보고 *왜 마이크가 필요한지* 모르면 거부할 가능성이 높다. 권한 요청 *직전*에 1줄 사전 설명을 표시한다.

```tsx
<button onClick={handleMicClick} aria-describedby="mic-hint">
  <MicIcon />
</button>
<p id="mic-hint">음성 입력을 위해 마이크 접근 권한을 요청합니다.</p>
```

---

## 7. 접근성 (ARIA)

### 7-1. 토글 버튼 ≠ 레이블 변경

WAI-ARIA APG 기준, *토글 버튼은 상태가 바뀌어도 레이블이 바뀌면 안 된다*. 상태 변화는 `aria-pressed`로 표현하고, 시각·텍스트 레이블은 일관성을 유지한다.

```tsx
// ❌ 잘못된 패턴: 레이블이 토글에 따라 변함
<button aria-label={isListening ? '녹음 중지' : '녹음 시작'}>

// ✅ 권장 (APG 기준): 레이블 고정 + aria-pressed로 상태 표현
<button aria-label="음성 입력" aria-pressed={state.kind === 'listening'}>
```

> 만약 디자인상 *레이블 자체를 "녹음 중지"로 바꿔야 한다면* `aria-pressed`를 사용하지 않는다. 둘 중 하나만 일관되게 선택한다.

### 7-2. 상태 변화 안내

`aria-live`로 인식 결과·에러를 스크린리더에 전달한다.

```tsx
<div aria-live="polite" aria-atomic="true">
  {state.kind === 'listening' && '녹음 중입니다'}
  {state.kind === 'processing' && '인식 중입니다'}
  {state.kind === 'confirming' && '인식 결과를 검토해 주세요'}
</div>
<div aria-live="assertive">
  {state.kind === 'error' && state.message}
</div>
```

### 7-3. 키보드 지원

WAI-ARIA APG의 button pattern: **Space**·**Enter**로 활성화. `<button>` 요소를 쓰면 자동 지원되므로 `<div role="button">`을 피한다.

### 7-4. focus ring

마이크 버튼은 키보드 포커스 시 명확한 `:focus-visible` 링이 필수다.

```css
.mic-button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

---

## 8. 햅틱 피드백 — Navigator.vibrate

녹음 시작·종료·에러를 짧은 진동으로 피드백한다.

```ts
function haptic(pattern: number | number[]) {
  if (typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
  }
}

// 사용
haptic(20);                  // 시작: 짧은 탭
haptic([10, 30, 10]);        // 종료: 더블 탭
haptic([0, 60, 30, 60]);     // 에러: 두 번 강조
```

> **주의 (iOS Safari):** 본 스킬 검증일(2026-05-14) 기준 Vibration API의 iOS Safari 지원은 *불확실* 상태다. MDN은 미지원으로 표기하나 일부 보고는 최근 버전에서 동작한다고 한다. 따라서 *햅틱은 보조적인 피드백*으로만 쓰고, 시각·청각 피드백이 없는 상태로 햅틱에만 의존하지 않는다.
>
> 호환성 페이지: https://caniuse.com/vibration

**제약:**
- 반드시 사용자 제스처 이벤트 내에서 호출 (`click` 핸들러 등)
- 기기 무음/방해금지 모드에서는 동작하지 않을 수 있음

---

## 9. 자동 중지

### 9-1. Web Speech API 분기

`SpeechRecognition`은 무음 구간이 길어지면 자체적으로 `onspeechend` → `onend`를 발화한다. *별도의 타이머가 필요 없다*.

```ts
rec.onspeechend = () => {
  // 음성 입력이 끝났다고 판단됨
};
rec.onend = () => {
  // 인식이 완전히 종료됨 (수동 stop 또는 자동)
  dispatch({ type: 'AUTO_STOP' });
};
```

### 9-2. MediaRecorder 분기 — 직접 무음 감지

서버 STT용으로 MediaRecorder를 쓸 때는 무음 자동 종료가 *없다*. AnalyserNode로 직접 감지한다.

```ts
function watchSilence(analyser: AnalyserNode, opts: { silenceMs: number; threshold: number; onSilent: () => void }) {
  const data = new Uint8Array(analyser.frequencyBinCount);
  let silenceStart: number | null = null;

  function tick() {
    analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const avg = sum / data.length;

    if (avg < opts.threshold) {
      if (silenceStart === null) silenceStart = performance.now();
      else if (performance.now() - silenceStart > opts.silenceMs) {
        opts.onSilent();
        return; // 루프 중단
      }
    } else {
      silenceStart = null;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// 사용: 평균 음량 < 5 가 1.8초 지속되면 자동 종료
watchSilence(analyser, { silenceMs: 1800, threshold: 5, onSilent: () => dispatch({ type: 'AUTO_STOP' }) });
```

### 9-3. 최대 녹음 시간 한도

서버 비용·UX 폭주 방지를 위해 절대 한도(예: 30초)를 둔다.

```ts
const maxRecordMs = 30_000;
const timer = setTimeout(() => dispatch({ type: 'AUTO_STOP' }), maxRecordMs);
// 정지 시 clearTimeout(timer);
```

---

## 10. 흔한 함정

| 함정 | 증상 | 대응 |
|------|------|------|
| HTTP에서 동작 안 함 | `navigator.mediaDevices === undefined` | HTTPS·localhost·file:// 만 지원. 개발 시 `https://localhost` 또는 `127.0.0.1` 사용 |
| AudioContext가 suspended 상태 | 시각화가 멈춤 | 클릭 핸들러 내에서 `audioCtx.resume()` |
| 백그라운드 탭에서 끊김 | 탭 전환 시 인식 중단 | `visibilitychange`로 감지·중단 안내 |
| 이어폰 마이크 인식 불량 | OS가 다른 입력 장치 선택 | `getUserMedia` constraints에 `deviceId` 명시 / 사용자에게 입력 장치 안내 |
| iOS 무음 모드에서 진동 없음 | `vibrate` 호출했는데 무진동 | 기기 설정 한계. 시각 피드백을 주된 채널로 |
| SPA 라우팅 후 권한 재요청 | iOS Safari에서 같은 도메인인데 또 묻는다 | 알려진 동작. 사용자에게 "다시 허용해 주세요" 안내 |
| destination 연결로 하울링 | 스피커로 자기 목소리 재생 | `analyser`만 연결, `audioCtx.destination`은 연결 X |
| `getUserMedia` stream을 안 정리 | 마이크 표시등이 계속 켜짐 | 종료 시 `stream.getTracks().forEach(t => t.stop())` |
| `SpeechRecognition` 미지원 브라우저 | Firefox 기본·구형 브라우저 | feature detection 후 텍스트 입력 폴백 |
| 첫 클릭에서 권한 프롬프트 안 뜸 | 페이지 로드 시 자동 호출 | 반드시 사용자 제스처 핸들러 내 호출 |
| 결과를 자동 전송 | 오인식이 그대로 전송됨 | `confirming` 상태 필수, 사용자 검수 후 전송 |

---

## 11. 리소스 정리 체크리스트

음성 입력 종료 시 *반드시* 다음을 모두 정리한다.

```ts
function cleanup({
  stream,
  audioCtx,
  rafId,
  recognition,
  timers,
}: {
  stream?: MediaStream;
  audioCtx?: AudioContext;
  rafId?: number;
  recognition?: SpeechRecognition;
  timers?: number[];
}) {
  stream?.getTracks().forEach((t) => t.stop()); // ← 누락 시 마이크 표시등 계속 켜짐
  if (rafId !== undefined) cancelAnimationFrame(rafId);
  audioCtx?.close();
  recognition?.abort();
  timers?.forEach((id) => clearTimeout(id));
}
```

`useEffect` cleanup, 컴포넌트 unmount, `pagehide`/`beforeunload`, 모든 경로에서 호출되어야 한다.
