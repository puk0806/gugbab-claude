---
name: voice-input-ui
description: >
  음성 입력 UI/UX 패턴 (마이크 버튼·녹음 시각화·인식 결과 confirm).
  마이크 버튼 상태 머신, getUserMedia 권한 요청 UX, Web Audio AnalyserNode 시각 피드백,
  중간 결과 표시, 인식 결과 confirm 패턴, 모바일 첫 사용자 경험, ARIA 접근성,
  햅틱 피드백, 자동 중지, 흔한 함정을 포함한다.
---

# 음성 입력 UI/UX 패턴 (Voice Input UI)

> 소스:
> - getUserMedia: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
> - AnalyserNode: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
> - WAI-ARIA Button Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/button/
> - Navigator.vibrate: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
> - Permissions API: https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API
>
> 검증일: 2026-05-14
>
> 짝 스킬:
> - `frontend/web-speech-api-stt` — Web Speech API 기반 음성 → 텍스트 변환 (interimResults, continuous 등 인식 엔진 사용법). 본 스킬은 그 결과를 *어떻게 사용자에게 보여줄지*를 다룬다.
> - `frontend/media-recorder-api` — MediaRecorder로 오디오 녹음·인코딩 (Whisper 같은 외부 STT 전송용 청크 생성). 본 스킬은 그 청크 수집 *중*에 사용자에게 보여줄 *시각 피드백*과 *상태 전이*를 다룬다.

---

## 언제 사용 / 사용하지 않을지

| 상황 | 적합 |
|------|:---:|
| 사용자가 마이크 버튼을 눌러 한 번에 한 발화씩 보내는 채팅·검색·명령 입력 | ✅ |
| Always-on 듣기(웨이크워드) 인터페이스 | ❌ (별도 권한·UX 모델 필요) |
| 통화·회의 같은 양방향 실시간 스트림 | ❌ (WebRTC 통화 UX 별도 패턴) |
| 음성 메모 녹음 후 첨부 (인식 없이 파일만 업로드) | △ (시각 피드백 부분만 활용) |

---

## 1. 마이크 버튼 상태 머신

음성 입력은 단일 boolean(`isRecording`)으로 다룰 수 없다. 권한 요청·처리 지연·취소 등 여러 중간 상태가 발생하므로 명시적 상태 머신을 둔다.

```
              ┌─────────────────────────────────────────┐
              │                                         │
              ▼                                         │
        ┌─────────┐  click  ┌──────────────────────┐    │
        │  idle   │────────▶│ requesting-permission │   │
        └─────────┘         └──────────────────────┘    │
              ▲                    │           │        │
              │                    │ granted   │ denied │
              │                    ▼           ▼        │
              │              ┌──────────┐  ┌───────┐    │
              │              │ listening │  │ error │───┘
              │              └──────────┘  └───────┘
              │   cancel/        │   stop/auto-stop
              │   abort          ▼
              │            ┌────────────┐
              ├────────────│ processing │
              │            └────────────┘
              │                  │
              │                  ▼ success
              │            ┌───────────┐
              │            │ confirming │── send ─┐
              │            └───────────┘── retry ─┤
              │                  │                │
              └──── cancelled ◀──┘                ▼
                                              (idle / next turn)
```

| 상태 | 의미 | UI 표시 |
|------|------|---------|
| `idle` | 대기 | 마이크 아이콘 정적 |
| `requesting-permission` | `getUserMedia` 호출 직후, 브라우저 권한 다이얼로그 표시 중 | 마이크 아이콘 + 펄스, "권한을 허용해 주세요" 안내 |
| `listening` | 권한 허용·녹음 진행 중 | 파형/볼륨 시각화 + 중지 아이콘 |
| `processing` | 인식·전송 중 (Whisper 등 외부 API 호출 또는 SpeechRecognition `end` 이벤트 후) | 스피너 + "인식 중..." |
| `confirming` | 결과 미리보기, 사용자가 전송/재녹음/취소 선택 대기 | 텍스트 박스 + 3버튼 |
| `error` | 권한 거부·하드웨어 오류 | 안내 메시지 + 재시도 버튼 |
| `cancelled` | 사용자가 중간에 포기 | 즉시 idle로 복귀 |

**구현 패턴 (React + useReducer):**

```tsx
type VoiceState =
  | { kind: 'idle' }
  | { kind: 'requesting-permission' }
  | { kind: 'listening'; startedAt: number }
  | { kind: 'processing' }
  | { kind: 'confirming'; text: string }
  | { kind: 'error'; code: 'NotAllowedError' | 'NotFoundError' | 'NotReadableError' | 'OverconstrainedError' | 'TypeError' | 'unknown'; message: string }
  | { kind: 'cancelled' };

type VoiceEvent =
  | { type: 'CLICK_MIC' }
  | { type: 'PERMISSION_GRANTED' }
  | { type: 'PERMISSION_DENIED'; error: DOMException }
  | { type: 'STOP_REQUESTED' }
  | { type: 'AUTO_STOP' }
  | { type: 'RESULT'; text: string }
  | { type: 'CONFIRM_SEND' }
  | { type: 'CONFIRM_RETRY' }
  | { type: 'CONFIRM_CANCEL' }
  | { type: 'RESET' };

function reducer(state: VoiceState, ev: VoiceEvent): VoiceState {
  switch (state.kind) {
    case 'idle':
      if (ev.type === 'CLICK_MIC') return { kind: 'requesting-permission' };
      return state;
    case 'requesting-permission':
      if (ev.type === 'PERMISSION_GRANTED') return { kind: 'listening', startedAt: Date.now() };
      if (ev.type === 'PERMISSION_DENIED')
        return { kind: 'error', code: (ev.error.name as never) ?? 'unknown', message: ev.error.message };
      return state;
    case 'listening':
      if (ev.type === 'STOP_REQUESTED' || ev.type === 'AUTO_STOP') return { kind: 'processing' };
      if (ev.type === 'CONFIRM_CANCEL') return { kind: 'cancelled' };
      return state;
    case 'processing':
      if (ev.type === 'RESULT') return { kind: 'confirming', text: ev.text };
      return state;
    case 'confirming':
      if (ev.type === 'CONFIRM_SEND') return { kind: 'idle' };
      if (ev.type === 'CONFIRM_RETRY') return { kind: 'requesting-permission' };
      if (ev.type === 'CONFIRM_CANCEL') return { kind: 'cancelled' };
      return state;
    case 'cancelled':
    case 'error':
      if (ev.type === 'RESET' || ev.type === 'CLICK_MIC') return { kind: 'idle' };
      return state;
  }
}
```

> **원칙:** `listening` 상태가 길어질수록 사용자가 "이 앱이 멈춘 건가?"라고 의심한다. `processing`은 반드시 별도 상태로 분리해 *시각 피드백을 교체*해야 한다.

---

## 2. 권한 요청 UX

### 2-1. 사전 권한 상태 조회 (Permissions API)

Permissions API로 *이미 거부됐는지* 미리 확인하면, 첫 클릭에서 헛된 `getUserMedia` 호출 없이 바로 안내를 띄울 수 있다. (Permissions API는 2022-09 이후 Baseline)

```ts
async function checkMicPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  if (!navigator.permissions) return 'unsupported';
  try {
    const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return status.state;
  } catch {
    return 'unsupported';
  }
}
```

> **주의:** Safari/Firefox 일부 버전은 `name: 'microphone'`을 지원하지 않을 수 있다. `try/catch` 후 `getUserMedia`로 폴백한다.

### 2-2. 권한 요청은 반드시 사용자 제스처 이벤트 내에서

`getUserMedia`는 페이지 로드 시 자동 호출하면 안 된다. 클릭·탭 핸들러 내에서 호출해야 권한 프롬프트가 정상 표시된다. (Safari는 user gesture 정책이 가장 엄격하다.)

```tsx
function MicButton() {
  const [state, dispatch] = useReducer(reducer, { kind: 'idle' });

  async function handleClick() {
    if (state.kind !== 'idle') return; // 중복 클릭 방지
    dispatch({ type: 'CLICK_MIC' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      dispatch({ type: 'PERMISSION_GRANTED' });
      startListening(stream);
    } catch (e) {
      dispatch({ type: 'PERMISSION_DENIED', error: e as DOMException });
    }
  }
  // ...
}
```

### 2-3. 권한 거부 후 안내

브라우저는 한 번 명시적으로 거부된 권한을 *코드에서 다시 요청해도 프롬프트를 띄우지 않는다*. 사용자가 직접 브라우저 설정·주소창 권한 아이콘에서 변경해야 한다. 이 사실을 사용자에게 명확히 알려야 한다.

```tsx
{state.kind === 'error' && state.code === 'NotAllowedError' && (
  <div role="alert">
    <strong>마이크 권한이 필요합니다</strong>
    <p>주소창 왼쪽 자물쇠 아이콘 → 사이트 설정 → 마이크를 "허용"으로 변경해 주세요.</p>
    <button onClick={() => dispatch({ type: 'RESET' })}>다시 시도</button>
  </div>
)}
```

### 2-4. 에러 코드별 메시지 매핑 (getUserMedia)

| `error.name` | 원인 | 사용자 안내 |
|--------------|------|-------------|
| `NotAllowedError` | 사용자 거부, Permissions Policy, 비-secure 컨텍스트 | "마이크 권한을 허용해 주세요. 주소창에서 변경할 수 있어요." |
| `NotFoundError` | 마이크 미연결 | "연결된 마이크를 찾지 못했습니다." |
| `NotReadableError` | OS·다른 앱이 마이크 점유 | "다른 앱이 마이크를 사용 중일 수 있어요. 확인 후 다시 시도해 주세요." |
| `OverconstrainedError` | constraints 불일치 (sampleRate 등) | (개발자가 constraints 완화 후 재시도) |
| `TypeError` | Secure Context 아님 (HTTP) | "HTTPS 환경에서만 사용할 수 있어요." |

---

## 3. 시각 피드백 — waveform / 볼륨 dot 펄스

`AnalyserNode`로 마이크 입력 신호를 분석해 *녹음 중임을 시각적으로 증명*한다. "정말로 듣고 있는지" 사용자가 확신할 수 있어야 한다.

### 3-1. 셋업

```ts
function setupAnalyser(stream: MediaStream) {
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;            // 권장값
  analyser.smoothingTimeConstant = 0.8; // 기본값, 부드러운 전환
  source.connect(analyser);
  // analyser.connect(audioCtx.destination); // 입력을 스피커로 되돌리면 하울링 — 연결하지 않음
  return { audioCtx, analyser };
}
```

> **주의:** mic stream을 `audioCtx.destination`에 연결하면 *스피커로 되돌아가* 하울링이 발생한다. 시각화 목적이면 destination 연결을 하지 않는다.

### 3-2. 파형 (waveform) — getByteTimeDomainData

`getByteTimeDomainData`는 *시간 영역* 진폭(0-255, 128이 무음). 오실로스코프 같은 파형을 그릴 때 사용한다.

```ts
const bufferLength = analyser.frequencyBinCount; // fftSize / 2 = 1024
const dataArray = new Uint8Array(bufferLength);
const canvasCtx = canvas.getContext('2d')!;
let rafId = 0;

function draw() {
  rafId = requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  canvasCtx.beginPath();
  const sliceWidth = canvas.width / bufferLength;
  let x = 0;
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;        // 0~2 범위 (1.0이 무음)
    const y = (v * canvas.height) / 2;
    if (i === 0) canvasCtx.moveTo(x, y); else canvasCtx.lineTo(x, y);
    x += sliceWidth;
  }
  canvasCtx.stroke();
}
draw();

// 정리
function stop() {
  cancelAnimationFrame(rafId);
  audioCtx.close();
}
```

### 3-3. 볼륨 dot 펄스 — getByteFrequencyData

전체 음량 한 개 값만 필요할 때는 *주파수 영역* 평균을 사용한다. CSS scale 트랜지션과 결합해 호흡하는 dot으로 표현한다.

```ts
const freqArray = new Uint8Array(analyser.frequencyBinCount);

function tickVolume() {
  analyser.getByteFrequencyData(freqArray);
  // 평균 음량 (0~255)
  let sum = 0;
  for (let i = 0; i < freqArray.length; i++) sum += freqArray[i];
  const avg = sum / freqArray.length;
  const scale = 1 + (avg / 255) * 0.8;  // 1.0 ~ 1.8
  dotEl.style.transform = `scale(${scale})`;
  requestAnimationFrame(tickVolume);
}
```

| 선택 | 적합 |
|------|------|
| 파형 (canvas) | 데스크톱·태블릿, "녹음 중임"을 강하게 어필 |
| 볼륨 dot 펄스 (CSS scale) | 모바일 작은 버튼, 저전력 |

---

## 4. 중간 결과 (interim) 표시

### 4-1. Web Speech API — `interimResults`

`SpeechRecognition.interimResults = true`로 설정하면 `result` 이벤트가 *isFinal=false*인 중간 가설을 함께 전달한다. 텍스트가 *흐릿한 톤*으로 점점 굳어지는 것이 자연스럽다.

```ts
const rec = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
rec.lang = 'ko-KR';
rec.interimResults = true;
rec.continuous = false;

let interim = '';
let final = '';

rec.onresult = (e: SpeechRecognitionEvent) => {
  interim = '';
  for (let i = e.resultIndex; i < e.results.length; i++) {
    const r = e.results[i];
    if (r.isFinal) final += r[0].transcript;
    else interim += r[0].transcript;
  }
  renderText({ final, interim });
};
```

```tsx
function TranscriptPreview({ final, interim }: { final: string; interim: string }) {
  return (
    <p aria-live="polite">
      <span>{final}</span>
      <span style={{ opacity: 0.5 }}>{interim}</span>
    </p>
  );
}
```

> **주의:** `webkitSpeechRecognition` 벤더 프리픽스는 Chromium·Safari에서 여전히 표준 명세보다 먼저 노출되는 경우가 많다. 두 이름을 모두 폴백한다. Firefox는 기본적으로 비활성화(플래그 뒤)이므로 폴백 UI가 필요하다.

### 4-2. 외부 STT (Whisper 등) — 진행 단계 표시

서버 STT는 발화 *중* 중간 결과를 받지 못한다. 대신 *단계*로 표현한다.

```
[ ●●○○○ ] 녹음 중 (12s)
[ ○○●●○ ] 업로드 중...
[ ○○○○● ] 인식 중...
```

각 단계에 `aria-live="polite"`로 진행 상태를 알린다.

---

## 5. 인식 결과 confirm 패턴

자동 전송은 *반드시 피한다*. 음성 인식은 오타·동음이의어가 흔하므로, 사용자가 검토·수정 후 전송을 결정해야 한다.

```tsx
{state.kind === 'confirming' && (
  <div role="dialog" aria-label="음성 인식 결과 확인">
    <label htmlFor="voice-result">인식된 텍스트 (수정할 수 있어요)</label>
    <textarea
      id="voice-result"
      value={text}
      onChange={(e) => setText(e.target.value)}
      autoFocus
    />
    <div role="group" aria-label="동작 선택">
      <button type="button" onClick={() => dispatch({ type: 'CONFIRM_SEND' })}>
        전송
      </button>
      <button type="button" onClick={() => dispatch({ type: 'CONFIRM_RETRY' })}>
        재녹음
      </button>
      <button type="button" onClick={() => dispatch({ type: 'CONFIRM_CANCEL' })}>
        취소
      </button>
    </div>
  </div>
)}
```

**버튼 순서·강조:**
- 1순위 (Primary): **전송** — 가장 흔한 경로
- 2순위: **재녹음** — 오인식 시 빠른 재시도
- 3순위 (Subtle): **취소** — 발화 자체 취소

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
