---
name: voice-input-ui
description: >
  음성 입력(마이크 버튼 → 녹음/인식 → 확인 후 전송) 구현 시 모델이 놓치기 쉬운 최신 변경점과 실측 함정 모음.
  OpenAI 구 전사 모델(whisper-1 등) 2026-08-26 deprecated·2027-02-26 제거와 gpt-transcribe 대체(languages[]·keywords),
  Web Speech API 브라우저 지원 현실(Chrome 139 무프리픽스·온디바이스, Edge no-op, Firefox 플래그, iOS continuous 오동작, confidence 차이),
  Permissions `microphone` 지원 버전, MediaRecorder isTypeSupported·청크·트랙 정리 함정, AnalyserNode 하울링, vibrate 지원 현황.
---

# 음성 입력 UI — 최신 변경점·실측 함정

> 소스:
> - getUserMedia: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
> - AnalyserNode: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
> - WAI-ARIA Button Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/button/
> - Navigator.vibrate: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
> - Permissions API: https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API
> - 브라우저 호환 데이터: https://github.com/mdn/browser-compat-data (8.1.8) · https://caniuse.com
> - SpeechRecognition: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition · https://webaudio.github.io/web-speech-api/ · https://github.com/mdn/browser-compat-data/issues/22126 · https://bugs.webkit.org/show_bug.cgi?id=198277 (구 web-speech-api-stt, 검증일 2026-11-09)
> - MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder · https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static · https://www.w3.org/TR/mediastream-recording/ (구 media-recorder-api, 검증일 2026-11-09)
> - OpenAI 전사: https://developers.openai.com/api/docs/guides/speech-to-text · https://developers.openai.com/cookbook/examples/migrating_from_whisper_to_gpt_transcribe · https://developers.openai.com/api/reference/resources/audio/subresources/transcriptions/methods/create · https://developers.openai.com/api/docs/deprecations · https://openai.com/api/pricing/ · https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirements (구 whisper-api-integration, 검증일 2026-11-09)
>
> 검증일: 2026-11-09 (재검증 — MDN BCD 8.1.8·caniuse 대조: Permissions `microphone` Firefox 132+/Safari 16+ 지원, Firefox `vibrate` 129 에서 제거, SpeechRecognition 브라우저 지원 정정)

---

## 1. 흐름과 상태 — 놓치기 쉬운 두 원칙

상태는 `idle → requesting-permission → listening → processing → confirming → (send | retry | cancel)` + `error`. boolean 하나(`isRecording`)로는 권한 대기·처리 지연을 표현할 수 없다.

- **`processing`을 `listening`과 분리**해 시각 피드백을 바꾼다. 서버 STT 는 발화 중 중간 결과가 없으므로 "녹음 중 → 업로드 중 → 인식 중" 단계를 `aria-live="polite"`로 알린다.
- **자동 전송 금지** — 오인식·동음이의어가 흔하므로 `confirming`(수정 가능한 textarea + 전송/재녹음/취소)을 반드시 거친다.
- `getUserMedia`는 클릭·탭 핸들러 **안에서만** 호출한다(Safari 가 가장 엄격). 한 번 거부된 권한은 코드에서 다시 요청해도 프롬프트가 뜨지 않는다 → 주소창 사이트 설정 안내.

| `getUserMedia` error.name | 원인 |
|--------------|------|
| `NotAllowedError` | 사용자 거부, Permissions Policy, 비-secure 컨텍스트 |
| `NotFoundError` | 마이크 없음 |
| `NotReadableError` | OS·다른 앱이 마이크 점유 |
| `OverconstrainedError` | constraints 불일치 (sampleRate 등) |
| `TypeError` | Secure Context 아님 (HTTP) — `navigator.mediaDevices` 자체가 `undefined`일 수 있음 |

## 2. 권한 사전 조회 — `microphone` 지원 버전

```ts
try {
  const s = await navigator.permissions.query({ name: 'microphone' as PermissionName });
  return s.state; // 'granted' | 'denied' | 'prompt'
} catch { /* 구버전 → getUserMedia 로 폴백 */ }
```

> **주의:** `name: 'microphone'` 조회는 Chrome 64+·Safari/iOS Safari 16+·**Firefox 132+** 에서 지원된다(MDN BCD 8.1.8). 그보다 오래된 버전은 `TypeError`로 거부하므로 `try/catch` 후 `getUserMedia`로 폴백한다. (Permissions API 자체 Baseline 은 2022-09 — `microphone` 이름 지원 시점과 다르다.)

## 3. 브라우저 내장 STT (Web Speech API) — 지원 현실

```ts
const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition; // 두 이름 모두 폴백
```

> **주의:** Safari/iOS Safari 는 `webkitSpeechRecognition`(프리픽스)만 노출하고, Chrome 은 139 부터 프리픽스 없는 `SpeechRecognition`도 노출한다(MDN BCD 8.1.8). 두 이름을 모두 폴백한다. Firefox 는 현행 릴리스(159)까지 기본 비활성(플래그 뒤)이므로 폴백 UI가 필요하다.
>
> **주의: 미검증** — MDN BCD 는 Firefox 160(2026-11-10 출시 예정)부터 기본 지원으로 표기하지만 caniuse 는 161·162 까지 "기본 비활성"으로 표기해 출처가 엇갈린다. Firefox 지원을 전제로 설계하지 말고 feature detection 으로 판단한다.

| 브라우저 | 실제 동작 |
|---------|-----------|
| Chrome (Desktop·Android) | 정상. 기본은 **Google 서버로 오디오 전송** → 오프라인 불가 (139+ 데스크톱은 `processLocally`로 온디바이스 가능, 아래) |
| Safari macOS 14.1+ | 정상 (Apple 엔진). confidence 0 반환 사례 |
| Safari iOS/iPadOS | **14.5+** (16+ 아님). continuous·백그라운드 이슈 다수 |
| Samsung Internet | Chrome 기반 동작 |
| Firefox | 플래그(`media.webspeech.recognition.enable`)를 켜도 실제 인식이 작동하지 않는다 — 안내하지 말 것 |
| Edge 안정판 | API 객체는 있으나 **결과를 반환하지 않는 no-op** (BCD 이슈 #22126). 객체 존재 체크만으론 부족 → 일정 시간 결과 없으면 미지원 처리하는 timeout |
| Edge Canary/Dev 150.0.4076+ | `edge://flags` "Speech Recognition with on-device model" 로 온디바이스 동작(ko-KR 포함). 안정판 전 — 사용자 기능으로 기대 금지 |
| Opera | 미지원 표기 |

caniuse 기준 부분 지원 ~88.8%(2026-11), 완전 지원 0% — Baseline 아님.

**온디바이스 인식 (Chrome 139+, 2025-08)** — Mac·Windows·Linux 한정(Android·ChromeOS 제외).
- `recognition.processLocally = true` 면 반드시 로컬 처리.
- 정적 메서드 `SR.available({ langs, processLocally: true })` → `'available'|'downloadable'|'downloading'|'unavailable'`, `SR.install({...})` → boolean. 빈 `langs`는 항상 `'unavailable'`, 잘못된 BCP 47 태그는 `SyntaxError`. 첫 사용 시 모델 다운로드 → "모델 준비 중" UI.
- > 주의: 미검증 — `quality` 옵션(`'command'`·`'dictation'`·`'conversation'`) 지원 버전, Chrome 의 ko-KR 온디바이스 지원(Edge 문서에만 명시). 반드시 `available()` 결과로 분기.

**속성·결과 함정**
- `grammars`는 MDN 기준 **Deprecated — 명세에서 grammar 개념이 제거돼 효과가 없다**. 문맥 편향은 `phrases`(`SpeechRecognitionPhrase` 배열)가 대신하나 구현 범위는 > 주의: 미검증. W3C 최신 draft 의 `phrases-not-supported` 에러도 구현에 거의 반영되지 않았다.
- `onresult`는 `event.resultIndex`부터 순회한다 — 전체 재순회하면 continuous 모드에서 final 이 중복 누적.
- **`confidence`는 브라우저·언어별로 의미가 다르다.** Chrome 은 0~1 실수, Safari 는 0만 반환하는 경우도 보고된다. 절대 임계(`> 0.9`) 비교 금지, 대안 간 상대 순위로만 쓴다.
- `onend`는 `stop()`·`abort()`·자동 종료·에러 모든 경로에서 온다 → listening 해제는 `onend`에. `stop()`은 지금까지 오디오로 결과 시도, `abort()`는 결과 없음(unmount·취소용). listening 중 `start()` 재호출은 `InvalidStateError`.
- 무음이 길면 `onspeechend → onend`로 스스로 끝난다(Android Chrome 약 3~7초) — MediaRecorder 경로엔 이 자동 종료가 없다(§5).

**iOS Safari 실측 함정**
- `continuous = true`가 제대로 동작하지 않는다(짧은 시간 후 자동 종료·transcript 이중 반복·timeout) → `continuous = false` + 버튼 재시작. interim 도 불안정 → final 만.
- 백그라운드/잠금 진입 시 즉시 중단, 사용자 재상호작용 없이 재시작 불가 → `visibilitychange`에서 `abort()`.
- 권한 후 첫 `start()`까지 2~3초 지연, 시스템 Siri 비활성 환경에서 인식 실패 보고.
- `speechSynthesis.speak()` 직후 `recognition.start()`는 오디오 세션 충돌 → 100~300ms 지연. TTS 도 백그라운드에서 중단되므로 짧은 utterance(~100자)로 나눈다(WebKit 198277).
- SPA 라우팅 후 같은 도메인인데 권한을 다시 묻는 경우가 있다(권한 지속성이 가장 짧음).

**한국어:** `lang = 'ko-KR'` 누락 시 시스템 기본 언어로 추론. 외래어 표기("프론트엔드"/"프론트앤드")가 흔들리므로 후처리 normalize. `maxAlternatives = 3~5`로 받아 정답 후보 매칭.

## 4. 녹음 (MediaRecorder) — 함정

```ts
const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/wav'];
const mimeType = candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
```

- iOS Safari 는 18.3 이하에서 `audio/webm` 미지원(생성자 `NotSupportedError`), **18.4 부터 `audio/webm;codecs=opus`** 추가. iOS 17 이하 기본은 `audio/mp4`(AAC-LC).
- **`isTypeSupported(t) === true`여도 그 시점에 실제로 녹음 가능하다는 보장은 없다**(리소스 부족 등) → `error` 이벤트에서 복구.
- `dataavailable`의 `e.data.size === 0` 빈 Blob 은 버린다. Blob 완성은 `stop` 이벤트에서 — `stop`은 **마지막 `dataavailable` 뒤에** 온다(W3C). `stop()` 직후 Blob 을 쓰면 비어 있다.
- `start(timeslice)` 청크는 단독 재생 불가(WebM 헤더는 첫 청크에만) → `new Blob(chunks, { type })`로 합친다. `pause()/resume()`은 청크를 나누지 않는다.
- iOS 에서 짧게 녹음 후 stop 하면 빈 Blob → `start(100)` 같은 짧은 timeslice 로 강제 flush 또는 최소 녹음 시간. 전화 수신 등 AudioSession 변경 시 `error` → stream 재획득.
- **`recorder.stop()`만으론 트랙이 살아 있다** — 마이크 인디케이터가 안 꺼지고 메모리가 는다. 모든 종료 경로(unmount·에러·취소)에서 `stream.getTracks().forEach(t => t.stop())`.
- `new File([blob], 'voice.webm', { type: blob.type })`처럼 type 을 명시(없으면 `application/octet-stream`로 거절되는 서버 있음). `FormData` 전송 시 **`Content-Type` 헤더를 직접 넣지 않는다** — boundary 가 빠져 400.

## 5. 시각 피드백·자동 중지 함정

> **주의:** mic stream을 `audioCtx.destination`에 연결하면 *스피커로 되돌아가* 하울링이 발생한다. 시각화 목적이면 destination 연결을 하지 않는다.

- 사용자 제스처 전에 만든 `AudioContext`는 `suspended` → 클릭 핸들러에서 `resume()`. 종료 시 `cancelAnimationFrame` + `audioCtx.close()`.
- MediaRecorder 경로는 무음 자동 종료가 없다 → AnalyserNode 평균 음량이 임계 아래로 일정 시간(예: 1.8초) 지속되면 직접 stop. 비용 폭주 방지용 최대 녹음 시간(예: 30초)도 둔다.

## 6. 접근성·햅틱

- APG 기준 토글 버튼은 **레이블 고정 + `aria-pressed`**. 레이블을 "녹음 중지"로 바꾸는 디자인이면 `aria-pressed`를 쓰지 않는다(둘 중 하나만). `<div role="button">` 대신 `<button>`.

> **주의 (iOS Safari · Firefox):** 2026-11-09 재검증 — caniuse(Fyrd/caniuse)·MDN BCD 8.1.8 모두 Safari(데스크톱 27.3·TP) · iOS Safari(27.2)까지 Vibration API **미지원**으로 표기한다. 또 **Firefox 는 129 에서 `navigator.vibrate`를 제거**했다(BCD `version_removed: 129`, caniuse 도 현행 버전 `n`). 실질적으로 Chrome/Android Chromium 계열에서만 동작하므로 *햅틱은 보조적인 피드백*으로만 쓰고 시각·청각 피드백에 햅틱만으로 의존하지 않는다. Chrome 60+ 은 사용자 제스처 없이 호출하면 `false`를 돌려주고 진동하지 않는다. (자동 중지 타이머 경로에서의 진동은 무효.)

## 7. 서버 전사 (OpenAI) — 2026-08-26 deprecation

> **⚠️ 주의 (2026-08-26 deprecation 공지 — 2027-02-26 제거):** `whisper-1`·`gpt-4o-transcribe`·`gpt-4o-mini-transcribe`·`gpt-4o-transcribe-diarize` 4개 모델과 **`/v1/audio/translations` 엔드포인트**가 deprecated 되어 **2027-02-26 API 에서 제거**된다. 공식 대체는 모델 4종 → `gpt-transcribe`(파일) 또는 `gpt-live-transcribe`(실시간), 번역 → `/v1/realtime/translations`(`gpt-realtime-translate`). SRT/VTT·word/segment 타임스탬프·화자 분리를 `whisper-1`/`-diarize` 에 의존하는 통합은 제거일 전에 대안을 마련해야 한다 — `gpt-transcribe` 는 이 기능들을 제공하지 않는다.

| 모델 | 용도 | 단가(2026-08-11 확인) | 핵심 제약 |
|------|------|:----:|------|
| **`gpt-transcribe`** | 파일 전사 권장(2026-07-28 출시) | $0.0045/min | `prompt`·`keywords`·`languages`·`stream` 지원. **srt·vtt·verbose_json·타임스탬프 미지원** |
| `gpt-live-transcribe` | 실시간 스트림 | $0.017/min | `/v1/realtime/transcription_sessions` **만** — 파일 업로드 엔드포인트 불가. 파일 전사의 3.8배 |
| `whisper-1` (제거 예정) | 자막·타임스탬프 | $0.006/min | `srt`·`vtt`·`verbose_json`·`timestamp_granularities` 유일 경로. `prompt`는 마지막 224토큰만, `stream` 미지원 |
| `gpt-4o-transcribe`/`-mini` (제거 예정) | 레거시 | $0.006 상당 / $0.003 | `response_format`은 `json`만 |
| `gpt-4o-transcribe-diarize` (제거 예정) | 화자 분리 | 상위 | `diarized_json` 필수, `prompt` 미지원, 화자 레퍼런스 최대 4명 |

> 가격은 2026-11-09 재검증 때 가격 페이지 접근 차단으로 재확인 못 함 — `> 주의: 미검증`. WER 개선 수치(40.37%→19.27%)는 공식 발표 페이지 403 으로 원문 미확인 — 의사결정 근거에서 배제.

- **`languages` 는 단수 `language`를 대체한다 — 둘 다 보내지 말 것**(공식 가이드). 한국어는 `languages: ["ko"]`, 한·영 혼용은 `["ko","en"]`. 레거시 모델만 `language: "ko"`. 미지정 시 짧은 클립을 영어/일본어로 오감지.
- `keywords`: 고유명사·제품코드 힌트. *"Keywords are hints, not required output"* — 등장하지 않을 단어를 넣으면 없는 말이 나올 수 있다. 값에 `<`, `>`, CR, LF 불가. `prompt`는 지시문이 아니라 상황·문체 힌트.
- 모델만 바꾸면 기존 `response_format`(verbose_json·srt)이 400 — *"do not assume the same `response_format` remains valid"*. `segments[]`·`words[]` 소비 코드부터 grep. `gpt-transcribe`의 `response_format` 지원 범위는 > 주의: 미검증(API 레퍼런스에서 확인).
- SDK: openai-python 3.46.0·openai-node 7.53.0(2026-11) 은 `keywords`·`languages`를 `create()` 최상위 인자로 받는다. 공식 예제의 `extra_body`는 구버전 호환 관행 — 타입 에러 시에만 우회.
- **translations 엔드포인트는 출력이 영어로 고정**된다 — 한국어 → 한국어는 transcriptions.
- 입력 포맷은 현행 가이드 기준 `mp3·mp4·mpeg·mpga·m4a·wav·webm` 7종 — 과거 목록·에러 메시지의 `flac`·`ogg`·`oga`는 빠졌다. **`audio/ogg;codecs=opus` 녹음을 그대로 보내는 경로는 안전하지 않다**(서버 변환). 한도는 **파일 바이트 25MB**(길이 아님) — 비트레이트를 낮추는 쪽이 분할보다 우선.
- 1초 미만·무음 클립은 빈 문자열이나 환각 텍스트("시청해 주셔서 감사합니다") — 필터링.
- OpenAI 는 브라우저 CORS preflight 를 허용하지 않고 키가 번들에 노출된다 → 백엔드 프록시 + 사용자별 quota·rate limit.
- Azure OpenAI(Foundry) 채널은 퇴역 일정이 따로다(보고된 날짜 변동) — Azure 배포는 Azure 퇴역 스케줄에서 재확인.
