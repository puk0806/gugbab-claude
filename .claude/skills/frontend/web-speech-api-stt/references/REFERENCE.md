## 12. React 통합 패턴 — `useSpeechRecognition`

```typescript
// useSpeechRecognition.ts
import { useCallback, useEffect, useRef, useState } from 'react'

type RecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onresult: ((e: any) => void) | null
  onerror: ((e: any) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

interface UseSpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
}

interface UseSpeechRecognitionReturn {
  supported: boolean
  listening: boolean
  transcript: string         // final 누적
  interimTranscript: string  // 현재 interim (확정 전)
  error: string | null
  start: () => void
  stop: () => void
  reset: () => void
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionReturn {
  const {
    lang = 'ko-KR',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
  } = options

  const recognitionRef = useRef<RecognitionLike | null>(null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const supported =
    typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  useEffect(() => {
    if (!supported) return

    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const r: RecognitionLike = new SR()
    r.lang = lang
    r.continuous = continuous
    r.interimResults = interimResults
    r.maxAlternatives = maxAlternatives

    r.onstart = () => {
      setListening(true)
      setError(null)
    }
    r.onresult = (event: any) => {
      let interim = ''
      let finalChunk = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) finalChunk += t + ' '
        else interim += t
      }
      if (finalChunk) setTranscript((prev) => prev + finalChunk)
      setInterimTranscript(interim)
    }
    r.onerror = (event: any) => {
      setError(event.error)
      setListening(false)
    }
    r.onend = () => {
      setListening(false)
      setInterimTranscript('')
    }

    recognitionRef.current = r
    return () => {
      r.abort()
      recognitionRef.current = null
    }
  }, [supported, lang, continuous, interimResults, maxAlternatives])

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) return
    try {
      recognitionRef.current.start()
    } catch (e: any) {
      // 이미 start 상태에서 재호출 시 InvalidStateError
      setError(e?.message ?? 'start failed')
    }
  }, [listening])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  return {
    supported,
    listening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  }
}
```

**사용 예시:**

```typescript
function VoiceInput() {
  const { supported, listening, transcript, interimTranscript, error, start, stop, reset } =
    useSpeechRecognition({ lang: 'ko-KR', interimResults: true })

  if (!supported) {
    return <p>음성 입력은 Chrome 또는 Safari에서만 지원됩니다.</p>
  }

  return (
    <div>
      <button onClick={listening ? stop : start}>
        {listening ? '중지' : '말하기'}
      </button>
      <button onClick={reset}>초기화</button>
      <p>
        {transcript}
        <span style={{ color: 'gray' }}>{interimTranscript}</span>
      </p>
      {error && <p style={{ color: 'red' }}>오류: {error}</p>}
    </div>
  )
}
```

---

## 13. 흔한 실수

| 실수 | 결과 |
|------|------|
| prefix 처리 없이 `new SpeechRecognition()` 직접 호출 | Chrome·Safari에서 ReferenceError |
| `lang` 누락 | 시스템 기본 언어로 추론 — 의도와 다른 언어 인식 |
| `event.resultIndex` 무시하고 results 전체 재순회 | continuous 모드에서 final transcript 중복 누적 |
| `interimResults` 결과를 final로 취급 | UI에 잘못된 텍스트 확정 |
| `confidence` 절대값 임계 비교 (`> 0.9`) | Safari가 0만 반환해 항상 fail. 상대 순위로 사용해야 함 |
| `onend` 미처리 | UI listening 상태 풀리지 않아 버튼 멈춤 |
| 이미 listening 중인데 `start()` 재호출 | InvalidStateError throw |
| unmount 시 `abort()` 누락 | 메모리 누수·콜백 호출 후 setState로 React warning |
| iOS Safari에서 `continuous = true` 가정 | 중간에 끊김·이중 transcript |
| Firefox/Edge에서 객체 존재만 체크하고 동작 가정 | API는 있으나 결과가 영원히 안 옴 — timeout 안전장치 필요 |
| HTTPS 아닌 환경에서 사용 | `start()` 호출 시 권한 거부 또는 silent fail |
| TTS 출력 중 동시에 STT 시작 | 오디오 세션 충돌. TTS 종료 후 100~300ms 지연 권장 |

---

## 15. TTS React 통합 패턴 — `useSpeech` (구 `web-speech-api-tts` 흡수)

```typescript
// useSpeech.ts
import { useState, useEffect, useCallback } from 'react'

export function useSpeech(lang = 'en-US') {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speaking, setSpeaking] = useState(false)
  const supported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window

  useEffect(() => {
    if (!supported) return
    const load = () => {
      const v = window.speechSynthesis.getVoices()
      if (v.length > 0) setVoices(v)
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [supported])

  const speak = useCallback(
    (text: string) => {
      if (!supported) return
      const synth = window.speechSynthesis
      synth.cancel() // 기존 큐 비우고 새로 시작
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang
      const voice = voices.find((v) => v.lang.startsWith(lang.split('-')[0]))
      if (voice) u.voice = voice
      u.onstart = () => setSpeaking(true)
      u.onend = () => setSpeaking(false)
      u.onerror = () => setSpeaking(false)
      synth.speak(u)
    },
    [supported, voices, lang]
  )

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { speak, stop, speaking, voices, supported }
}
```

**TTS 흔한 실수**

| 실수 | 결과 |
|------|------|
| `getVoices()` 즉시 호출 후 빈 배열 무시 | voice 미선택 → OS 기본 음성으로 재생 |
| `speak()` 연속 호출 시 큐 동작 망각 / `cancel()` 없이 새 utterance | 의도치 않은 직렬 재생, 이전 utterance 끝까지 대기 |
| iOS Safari에서 긴 문장 한 번에 재생 | 백그라운드 진입 시 잘림 |
| BCP 47 `lang` 누락 | 영어 텍스트가 한국어 발음으로 들림 |
| 미지원 브라우저에서 `new SpeechSynthesisUtterance()` 직접 호출 | ReferenceError → UI 깨짐 |

---

## 참고 링크

- MDN SpeechSynthesisUtterance (TTS): https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
- MDN voiceschanged (TTS): https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event
- WebKit bug 198277 (iOS TTS 백그라운드 중단): https://bugs.webkit.org/show_bug.cgi?id=198277

- MDN Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- MDN SpeechRecognition: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- MDN SpeechRecognition.error_event: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/error_event
- MDN SpeechRecognitionResult: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionResult
- MDN result_event (resultIndex 설명): https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/result_event
- W3C/WICG Web Speech API draft: https://webaudio.github.io/web-speech-api/
- caniuse Speech Recognition: https://caniuse.com/speech-recognition
- MDN BCD Edge no-op 이슈: https://github.com/mdn/browser-compat-data/issues/22126
- WebKit bug 225298 (iOS service availability): https://bugs.webkit.org/show_bug.cgi?id=225298
