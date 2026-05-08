---
name: web-speech-api-tts
description: 브라우저 내장 Web Speech API의 SpeechSynthesis(TTS) 사용 패턴. window.speechSynthesis + SpeechSynthesisUtterance 기본 사용, getVoices() 비동기 로딩(voiceschanged), 영어 voice 필터링, rate·pitch·volume 조절, 일시정지/재개/취소, iOS Safari 백그라운드 자동중단 이슈, 미지원 브라우저 graceful degradation
---

# web-speech-api-tts — 브라우저 내장 TTS 사용 패턴

> 소스: MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
> 검증일: 2026-05-07

> 표준: Web Speech API (W3C Community Group draft)
> 호환성: caniuse 기준 Baseline 2018-09 — 모든 주요 브라우저 지원, 단 iOS Safari·Edge에 일부 제약

## 언제 사용하나

- 영어 학습 앱·발음 듣기·접근성(스크린 리더 보조)에서 *별도 SaaS 없이* 브라우저 내장 TTS 활용
- PWA에서 오프라인 음성 출력 필요 (네트워크 의존 SaaS는 오프라인에서 실패)
- 비용 0 / 서버 호출 0 / 즉시 시작 — *프로토타입·MVP*에 적합

## 언제 사용하지 않나

- 음성 *품질·자연스러움*이 결정적 (예: 상용 어학 콘텐츠) → Google Cloud TTS·Amazon Polly·ElevenLabs 등 SaaS
- 동일 음성 일관성이 필요 → 브라우저 voice는 OS·기기마다 달라짐
- iOS Safari 단독 환경에서 *백그라운드/잠금 상태*에도 음성 재생이 핵심 기능 → Web Speech API는 백그라운드에서 멈춤(아래 호환성 이슈 참조)

## 기본 사용법

### 1. 즉시 사용 (가장 단순)

```javascript
const utterance = new SpeechSynthesisUtterance('Hello, world')
window.speechSynthesis.speak(utterance)
```

### 2. 속성 조절

```javascript
const u = new SpeechSynthesisUtterance('Hello')
u.lang = 'en-US'   // BCP 47 언어 태그
u.rate = 1.0       // 0.1 ~ 10 (default 1)
u.pitch = 1.0      // 0 ~ 2 (default 1)
u.volume = 1.0     // 0 ~ 1 (default 1)
window.speechSynthesis.speak(u)
```

> **주의**: PRD에서 `rate(0.5~2)·pitch(0~2)·volume(0~1)`처럼 좁은 범위를 권장하더라도 *내부적으로 clamp*하여 사용자 입력을 표준 범위 안에 맞춘다. rate 0.1 미만이나 10 초과 입력은 브라우저가 거부한다.

### 3. 이벤트 처리

```javascript
const u = new SpeechSynthesisUtterance('Hello')
u.onstart = () => console.log('started')
u.onend = () => console.log('ended')
u.onpause = () => console.log('paused')
u.onresume = () => console.log('resumed')
u.onerror = (e) => console.error('error:', e.error)
u.onboundary = (e) => console.log('boundary at', e.charIndex, e.name) // word/sentence
u.onmark = (e) => console.log('SSML mark:', e.name)
window.speechSynthesis.speak(u)
```

이벤트 7종: `start` · `end` · `pause` · `resume` · `error` · `mark`(SSML) · `boundary`(단어/문장).

## getVoices() 비동기 로딩

`SpeechSynthesis.getVoices()`는 *즉시 호출 시 빈 배열*을 반환할 수 있다. 브라우저가 voice 목록을 비동기 로드하기 때문이다.

```javascript
function loadVoices() {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      resolve(voices)
      return
    }
    // 빈 배열 → voiceschanged 이벤트 대기
    window.speechSynthesis.addEventListener(
      'voiceschanged',
      () => resolve(window.speechSynthesis.getVoices()),
      { once: true }
    )
  })
}

const voices = await loadVoices()
```

**왜 필요한가**: getVoices()는 server-side 합성 voice가 비동기로 등록되거나 client-side voice가 OS에 늦게 인식될 때 *최초 호출 시 빈 배열*을 반환한다. `voiceschanged` 이벤트가 fire될 때 다시 호출해야 정확한 목록을 얻는다.

## 영어 voice 필터링 + 기본값 결정

```javascript
function pickEnglishVoice(voices) {
  const enVoices = voices.filter((v) => v.lang.startsWith('en-'))
  if (enVoices.length === 0) return null

  // 우선순위:
  // 1) en-US localService(OS 내장)
  // 2) en-US 아무거나
  // 3) en-* localService
  // 4) 첫 en-*

  return (
    enVoices.find((v) => v.lang === 'en-US' && v.localService) ||
    enVoices.find((v) => v.lang === 'en-US') ||
    enVoices.find((v) => v.localService) ||
    enVoices[0]
  )
}

const voices = await loadVoices()
const englishVoice = pickEnglishVoice(voices)
```

`localService: true`인 voice는 *OS 내장*(오프라인 동작), `false`는 *원격 서버 voice*(네트워크 필요).

## 일시정지·재개·취소·큐 관리

```javascript
const synth = window.speechSynthesis

synth.speak(u1) // 큐에 추가 + 재생 시작 (idle 상태였다면)
synth.speak(u2) // 큐에 추가 — u1 끝나고 자동 재생

synth.pause()   // 현재 utterance 일시정지
synth.resume()  // 일시정지 해제
synth.cancel()  // 모든 utterance 큐 비우고 즉시 종료

// 상태 확인
synth.speaking  // 현재 말하는 중 boolean
synth.pending   // 큐에 대기 중 utterance 있는지 boolean
synth.paused    // 일시정지 상태 boolean
```

**큐 동작**: `speak()`를 여러 번 호출하면 각 utterance가 큐에 쌓여 *직렬*로 재생된다. 새로 시작하려면 `cancel()` 후 `speak()`해야 한다.

## 미지원 브라우저 감지 + Graceful Degradation

```javascript
function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window
}

function speakWithFallback(text, lang = 'en-US') {
  if (!isSpeechSynthesisSupported()) {
    // Fallback: 브라우저 미지원 — 사용자에게 알림
    console.warn('Web Speech API not supported in this browser')
    return false
  }
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  window.speechSynthesis.speak(u)
  return true
}
```

UI 측면에서는 *지원 여부 감지 후 발음 듣기 버튼을 비활성화*하거나 *툴팁으로 안내*하는 패턴 권장.

## iOS Safari 백그라운드 자동중단 이슈 (호환성 유의)

iOS Safari는 *탭이 백그라운드로 가거나 디바이스가 잠기면* 진행 중인 utterance를 자동 중단한다. 새로고침 또는 사용자 재상호작용 없이는 다시 시작되지 않는다.

**대응 패턴**:

```javascript
// 1) visibilitychange 감지 후 사용자에게 안내
document.addEventListener('visibilitychange', () => {
  if (document.hidden && window.speechSynthesis.speaking) {
    // 사용자가 탭을 떠남 — 멈출 가능성 사전 안내
    window.speechSynthesis.cancel() // 깔끔히 종료, 이후 재시작 시 복구 가능
  }
})

// 2) iOS Safari 환경에서는 *짧은 utterance*로 분할
//    긴 문장은 백그라운드 진입 시 잘리는 위치를 예측 어려움
function splitForIOS(text, maxLen = 100) {
  // 문장 단위 분할 우선, 길이 초과 시 단어 단위
  return text.match(new RegExp(`.{1,${maxLen}}(\\s|$)`, 'g')) || [text]
}

// 3) 핵심 학습 흐름은 *foreground 전용*으로 안내
```

> 백그라운드/잠금 시 무중단 음성 재생이 *기능 요구사항*이라면 Web Speech API로는 충족 불가. Web Audio API + 사전 녹음 오디오 또는 native 앱이 필요.

## React 통합 패턴

```typescript
// useSpeech.ts
import { useState, useEffect, useCallback } from 'react'

interface UseSpeechReturn {
  speak: (text: string) => void
  stop: () => void
  speaking: boolean
  voices: SpeechSynthesisVoice[]
  supported: boolean
}

export function useSpeech(lang = 'en-US'): UseSpeechReturn {
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
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
    }
  }, [supported])

  const speak = useCallback(
    (text: string) => {
      if (!supported) return
      const synth = window.speechSynthesis
      synth.cancel() // 기존 큐 비우고 새로 시작
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang
      const enVoice = voices.find((v) => v.lang.startsWith(lang.split('-')[0]))
      if (enVoice) u.voice = enVoice
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

## 흔한 실수

| 실수 | 결과 |
|------|------|
| `getVoices()`를 즉시 호출하고 빈 배열 무시 | voice 선택 안 되어 OS 기본 음성으로 강제 재생 |
| `speak()` 연속 호출 시 큐 동작 망각 | 의도와 달리 직렬 재생, 사용자 혼란 |
| `cancel()` 없이 새 utterance 시작 | 이전 utterance 끝까지 기다림 |
| iOS Safari에서 긴 문장 한 번에 재생 | 백그라운드 진입 시 잘림 |
| BCP 47 lang 지정 누락 | 시스템 기본 언어로 발음 — 영어 텍스트가 한국어 발음으로 들림 |
| `rate`·`pitch`·`volume` 범위 초과 입력 | 브라우저가 무시 또는 에러 |
| 미지원 브라우저에서 `new SpeechSynthesisUtterance()` 직접 호출 | ReferenceError → UI 깨짐. supported 체크 후 분기 |

## 브라우저 호환성 요약

| 브라우저 | 지원 | 비고 |
|---------|------|------|
| Chrome (Desktop·Android) | ✅ | OS voice + Google Cloud voice 둘 다 |
| Firefox | ✅ | OS voice 사용. Linux는 speech-dispatcher 필요 |
| Safari (macOS) | ✅ | OS voice. getVoices() 일부 환경에서 즉시 빈 배열 |
| Safari (iOS) | ⚠️ | 백그라운드/잠금 시 자동 중단. getVoices() empty 사례 보고 있음 |
| Edge | ✅ | Chromium 기반 — Chrome과 동일 |
| Opera | ✅ | Chromium 기반 |

## 참고

- MDN Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- MDN SpeechSynthesisUtterance: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
- MDN voiceschanged: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event
- W3C Web Speech API draft: https://webaudio.github.io/web-speech-api/
- iOS Safari 백그라운드 이슈 보고: https://bugs.webkit.org/show_bug.cgi?id=198277
