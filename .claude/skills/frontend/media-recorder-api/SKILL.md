---
name: media-recorder-api
description: >
  MediaRecorder API로 마이크 오디오를 녹음·Blob 생성·Whisper 등 STT 서버에 전송하는 절차.
  생성자 옵션(mimeType, audioBitsPerSecond), isTypeSupported 분기, 이벤트(dataavailable/start/stop/error/pause/resume),
  청크 수집과 Blob 결합, start(timeslice) vs stop 일괄, pause/resume, stream.getTracks().stop() 리소스 정리,
  Whisper API multipart 전송, 인코딩 변환, iOS Safari 함정과 메모리 누수 패턴을 포함한다.
---

# MediaRecorder API (오디오 녹음 + Whisper 전송)

> 소스:
> - MDN MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
> - MDN MediaStream Recording API: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API
> - MDN MediaRecorder.isTypeSupported(): https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static
> - W3C MediaStream Recording: https://www.w3.org/TR/mediastream-recording/
> - OpenAI Speech to text 가이드: https://platform.openai.com/docs/guides/speech-to-text
>
> 검증일: 2026-05-14
>
> 짝 스킬:
> - `frontend/voice-input-ui` — 녹음 *중* 사용자에게 보여줄 시각 피드백·상태 머신. 본 스킬은 그 *내부*에서 실제로 오디오 비트를 모으는 부분을 담당한다.
> - `frontend/whisper-api-integration` — Whisper API 호출 전반(키 보호·서버 프록시·prompt 옵션·언어 힌트). 본 스킬은 그 *직전*까지(Blob 만들기 + multipart 본문 구성)만 다룬다.

---

## 언제 사용 / 사용하지 않을지

| 상황 | 적합 |
|------|:---:|
| 사용자가 버튼으로 한 발화씩 녹음 → Whisper/다른 STT 서버에 보내기 | ✅ |
| 오디오 메모를 파일로 저장·다운로드 | ✅ |
| 짧은 음성 명령 → 클라이언트에서 후처리 후 서버 전송 | ✅ |
| 실시간 스트리밍(WebRTC 통화) | ❌ — WebRTC가 적합 |
| 브라우저 내장 음성 인식(텍스트 직접 받기) | ❌ — `frontend/web-speech-api-stt` 사용 |
| Wake word·always-on 듣기 | ❌ — 별도 권한·UX 모델 필요 |

---

## 1. 기본 흐름 — 권한 → 녹음 → Blob → 정리

```ts
async function recordOnce(): Promise<Blob> {
  // 1) 마이크 권한 + MediaStream 획득
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // 2) 지원되는 MIME 타입 선택 (아래 §2 참조)
  const mimeType = pickSupportedMimeType();

  // 3) MediaRecorder 생성
  const recorder = new MediaRecorder(stream, {
    mimeType,
    audioBitsPerSecond: 128_000, // 음성용 128 kbps면 충분
  });

  const chunks: Blob[] = [];

  recorder.addEventListener('dataavailable', (e) => {
    // event.data 가 빈 Blob 인 경우도 있으니 size 체크 필수
    if (e.data && e.data.size > 0) chunks.push(e.data);
  });

  // 4) Promise 로 stop 완료를 기다림
  const stopped = new Promise<Blob>((resolve, reject) => {
    recorder.addEventListener('stop', () => {
      resolve(new Blob(chunks, { type: mimeType }));
    });
    recorder.addEventListener('error', (e) => reject(e));
  });

  recorder.start(); // timeslice 없이 — stop 시 한 번에 dataavailable
  // ... 사용자가 멈춤 누르면:
  // recorder.stop();

  try {
    return await stopped;
  } finally {
    // 5) **반드시** 트랙을 명시적으로 stop — 마이크 인디케이터 꺼짐 + 메모리 누수 방지
    stream.getTracks().forEach((t) => t.stop());
  }
}
```

핵심 5단계: **getUserMedia → isTypeSupported → MediaRecorder → chunks 수집 → tracks.stop()**.

---

## 2. MIME 타입 선택 — `isTypeSupported()` 폴백 사슬

브라우저마다 지원 컨테이너/코덱이 다르다. 특히 iOS Safari는 오랫동안 `audio/webm`을 지원하지 않았고, Safari 18.4부터 `audio/webm;codecs=opus`가 추가됐다. 신구 버전 모두 커버하려면 **우선순위 사슬**로 폴백한다.

```ts
function pickSupportedMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus', // Chromium·Firefox·Safari 18.4+ 기본
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2', // iOS Safari (AAC-LC)
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav',                 // 일부 데스크탑만
  ];
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  // 마지막 폴백: 빈 문자열 → 브라우저 기본
  return '';
}
```

> 주의: `isTypeSupported(t) === true`여도 *해당 시점에 실제로 녹음 가능*하다는 보장은 없다(리소스 부족 등). `error` 이벤트에서 다시 복구해야 한다.

| 브라우저 | 기본 컨테이너 |
|---------|--------------|
| Chrome / Edge / Firefox | `audio/webm;codecs=opus` |
| iOS Safari 17 이하 | `audio/mp4` (AAC-LC) |
| iOS Safari 18.4+ | `audio/webm;codecs=opus` 또는 `audio/mp4` |
| macOS Safari | `audio/mp4`, 일부 빌드에서 `audio/webm` |

Whisper API는 `webm`·`mp4`·`m4a`·`wav`·`ogg` 등 주요 포맷을 모두 받으므로, 위 사슬로 잡힌 무엇이든 그대로 보내면 된다(아래 §6).

---

## 3. 이벤트와 상태

| 이벤트 | 발생 시점 |
|--------|----------|
| `start` | `start()` 호출 직후 |
| `dataavailable` | `start(timeslice)`라면 주기적, 아니면 `stop()`/`requestData()` 시 1회 |
| `pause` / `resume` | `pause()` / `resume()` 호출 시 |
| `stop` | **마지막 `dataavailable`가 발생한 직후** (W3C 명세) |
| `error` | 코덱 실패·트랙 종료 등 치명적 오류 |

상태(`recorder.state`)는 **`inactive` / `recording` / `paused`** 세 가지. `inactive`에서 `pause()` 호출 같은 잘못된 전이는 `InvalidStateError`를 던진다.

> 핵심: `stop` 이벤트는 항상 마지막 `dataavailable` *뒤에* 온다. 따라서 Blob 완성 타이밍은 `onstop`에서 잡으면 안전하다.

---

## 4. `start()` vs `start(timeslice)` — 일괄 vs 주기적

```ts
recorder.start();       // stop 호출 시 한 번에 dataavailable
recorder.start(1000);   // 1초마다 dataavailable (스트리밍·실시간 업로드용)
```

| 패턴 | 적합한 경우 |
|------|------------|
| `start()` (인자 없음) | 짧은 녹음 후 한 번에 서버 전송 — **Whisper 보내기 일반 케이스** |
| `start(timeslice)` | 긴 녹음에서 청크 단위로 업로드·실시간 전송 — `dataavailable`에서 즉시 fetch |
| `requestData()` | 녹음 중 *시점 스냅샷*만 필요할 때 (인터림 미리보기 등) |

> 주의: `start(timeslice)`로 잘게 쪼개진 각 Blob은 *독립적으로 재생 가능한 컨테이너가 아닐 수 있다*. WebM 청크는 헤더가 첫 청크에만 있어 단독 재생 불가. 서버에서 합치거나, 클라이언트에서 `new Blob(chunks, { type })`으로 합쳐서 보낸다.

---

## 5. 일시정지·재개

```ts
recorder.pause();  // state: 'paused', 청크 수집 중단 (현재 Blob 유지)
recorder.resume(); // state: 'recording', 같은 Blob에 계속 누적
```

`pause()`/`resume()`은 청크를 *분할하지 않는다*. 따라서 사용자 UX상 "일시정지 후 이어 녹음"이 단일 파일이 된다.

---

## 6. Whisper API로 전송 — `FormData` + multipart

```ts
async function sendToWhisper(audio: Blob): Promise<string> {
  // 1) Blob에 파일명을 붙여 File 로 감싸기 — 일부 서버는 filename 헤더를 요구
  //    확장자는 MIME 에 맞춰서 (webm/mp4/m4a/wav/ogg)
  const ext = blobExt(audio.type); // 예: 'webm'
  const file = new File([audio], `voice.${ext}`, { type: audio.type });

  // 2) multipart/form-data — Content-Type 헤더 *수동으로 박지 않는다*
  //    fetch가 boundary 포함해서 자동 생성
  const form = new FormData();
  form.append('file', file);
  form.append('model', 'whisper-1');
  // form.append('language', 'ko');         // 선택
  // form.append('response_format', 'json'); // 선택

  const res = await fetch('/api/whisper-proxy', { // ← 서버 프록시 권장 (§9 참고)
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Whisper ${res.status}`);
  const json = (await res.json()) as { text: string };
  return json.text;
}

function blobExt(mime: string): string {
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('mp4')) return 'm4a';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('wav')) return 'wav';
  return 'bin';
}
```

| 항목 | 값 |
|------|-----|
| 지원 입력 포맷 | flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm |
| 파일 크기 한도 | 25 MB (실제로는 multipart 오버헤드 고려해 24 MB 이하 권장) |
| Content-Type | `multipart/form-data` — `fetch` 자동 설정. **직접 박지 말 것** |

> 주의: 직접 `Content-Type: multipart/form-data`를 헤더에 박으면 boundary가 비어 서버가 400을 낸다. `FormData`를 그대로 `body`에 넣고 헤더는 건드리지 않는다.

---

## 7. 인코딩 변환이 필요한가? — 대부분 불필요

Whisper는 위 §6의 모든 포맷을 그대로 받기 때문에 **WebM → MP3/WAV 같은 클라이언트 변환은 보통 필요 없다**. 다음 경우만 변환을 고려한다:

| 변환이 필요한 케이스 | 도구 |
|--------------------|------|
| Whisper 외의 STT가 WAV·MP3만 받음 | `ffmpeg.wasm` (~30MB) 또는 서버 변환 |
| 25MB 초과 → 비트레이트 낮춰 압축 | 녹음 옵션에서 `audioBitsPerSecond` 낮추기 우선 |
| 코덱 검수가 까다로운 레거시 시스템 | 서버 변환 권장 (클라 번들 비용 절감) |

> 주의: `ffmpeg.wasm`은 번들 크기·메모리·SharedArrayBuffer(COOP/COEP 헤더)까지 영향을 주므로 PWA에서는 도입 전에 비용을 잰다.

---

## 8. 리소스 정리 — 가장 흔한 버그

```ts
// ❌ 잘못된 패턴 — 마이크 인디케이터 안 꺼짐, 메모리 누수
recorder.stop();
// stream은 살아있음

// ✅ 올바른 패턴
recorder.stop();
stream.getTracks().forEach((t) => t.stop());
```

`MediaRecorder.stop()`은 *녹음만* 멈춘다. `MediaStreamTrack`은 여전히 활성이고, 트랙 인코더 버퍼에 데이터가 계속 들어와 메모리가 증가한다. 또한 OS·브라우저의 **마이크 사용 인디케이터**는 트랙이 살아있는 한 꺼지지 않는다.

언마운트·에러·중도 취소 등 *모든 종료 경로*에서 트랙을 stop 하도록 `try/finally`로 감싸거나 React라면 `useEffect` cleanup에 넣는다.

```tsx
useEffect(() => {
  let stream: MediaStream | null = null;
  let recorder: MediaRecorder | null = null;

  (async () => {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    // ...
  })();

  return () => {
    recorder?.state !== 'inactive' && recorder?.stop();
    stream?.getTracks().forEach((t) => t.stop());
  };
}, []);
```

---

## 9. 보안 — 클라이언트에서 Whisper 직접 호출 금지

OpenAI API 키는 *반드시* 서버에서 보관·호출한다. 클라이언트에서 직접 `Authorization: Bearer sk-...`를 박으면 키 유출이다.

권장 흐름:

```
[브라우저] MediaRecorder → Blob
        │
        ▼
[브라우저] fetch('/api/whisper-proxy', { body: FormData })
        │
        ▼
[자체 서버] FormData 그대로 OpenAI에 forward + 키 주입
        │
        ▼
[OpenAI] /v1/audio/transcriptions → text
```

자세한 프록시 구성과 보안 헤더·에러 처리는 짝 스킬 `frontend/whisper-api-integration` 참조.

---

## 10. iOS Safari 함정 모음

| 함정 | 증상 | 해결 |
|------|------|------|
| `audio/webm` 미지원 (Safari 18.3 이하) | `isTypeSupported` false, 생성자에서 `NotSupportedError` | §2 폴백 사슬, `audio/mp4`로 |
| 페이지 무음 자동재생 정책 | 첫 `start()` 호출이 사용자 제스처 안에 있어야 함 | 버튼 클릭 핸들러 *내부*에서 `getUserMedia` 호출 |
| 백그라운드 탭 진입 시 녹음 정지 | iOS는 백그라운드 마이크 캡처 제한 | `visibilitychange`에서 `pause()` 후 사용자 확인 시 `resume()` |
| AudioSession 변경(전화 수신 등) | `error` 이벤트 발생 | 재시도 UX 마련, 기존 stream 폐기 후 재획득 |
| 첫 청크 누락 | iOS에서 짧게 녹음 후 stop 하면 빈 Blob | `start(100)` 같은 짧은 timeslice로 강제 flush, 또는 최소 녹음 시간 부과 |

---

## 11. 흔한 실수

- **stream을 stop 하지 않음** → §8 참조. 가장 자주 발생.
- **Content-Type 직접 박기** → §6 주의 박스.
- **`dataavailable`에서 `e.data.size === 0`인 빈 Blob 추가** → Blob 결합 시 잘못된 헤더 섞임. 항상 `size > 0` 체크.
- **timeslice 청크를 개별 파일로 재생 시도** → WebM 청크는 헤더 없어서 단독 재생 불가. 합쳐서 사용.
- **`stop()` 호출 후 즉시 Blob 사용** → `stop` 이벤트(또는 마지막 `dataavailable`) 대기 필수. 비동기.
- **`Content-Type` 누락된 Blob을 `new File([blob], 'x.webm')`** → 일부 서버가 `application/octet-stream`로 인식해 거절. `new File([blob], 'x.webm', { type: blob.type })`로 명시.
- **권한 거부 후 무한 재시도** → `getUserMedia` 거부는 `NotAllowedError`. UX로 사용자에게 시스템 설정 안내 후 재시도 버튼 제공.
- **컴포넌트 언마운트 시 `recorder.stop()`만 호출** → tracks 정리 누락. cleanup에 둘 다 넣기.

---

## 12. 짝 스킬 간 책임 분담 (요약)

```
voice-input-ui  ─┐
                 ├─ UX 레이어 (버튼 상태머신·시각화·접근성)
                 │
media-recorder-api ──┐
                     ├─ 캡처 레이어 (이 스킬: 권한·녹음·Blob·정리)
                     │
whisper-api-integration ──┐
                          └─ 전송 레이어 (서버 프록시·키·prompt·언어 옵션)
```

본 스킬은 **Blob을 만들어 `FormData`로 넘기는 직전까지**가 책임 범위다. 그 이후(키 보호·재시도·언어 힌트)는 `whisper-api-integration`이 담당한다.
