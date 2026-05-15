---
name: web-speech-api-stt
description: 브라우저 내장 Web Speech API의 SpeechRecognition(STT) 사용 패턴. window.SpeechRecognition || window.webkitSpeechRecognition prefix 처리, lang/continuous/interimResults/maxAlternatives 옵션, onresult event.resultIndex로 interim+final 분리 처리, transcript/confidence 추출, 마이크 권한(getUserMedia) 사전 확인, Chrome·Safari 지원/ Firefox·Edge 미지원 graceful degradation, iOS Safari 백그라운드 중단·연속 인식 timeout, abort() vs stop() 차이, 한국어(ko-KR) 인식 팁, React useSpeechRecognition 훅 패턴
---

# web-speech-api-stt — 브라우저 내장 STT 사용 패턴

> 소스: MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
> 검증일: 2026-05-14

> 표준: Web Speech API (W3C/WICG Community Group draft) — https://webaudio.github.io/web-speech-api/
> 호환성: caniuse 기준 *Limited availability* (Baseline 미달). Chrome·Safari·Samsung Internet만 부분 지원, Firefox·Edge 사실상 미지원.

---

## TTS 스킬과의 관계

이 스킬은 **Speech-to-Text(음성 → 텍스트)**다. **Text-to-Speech**는 `frontend/web-speech-api-tts` 별개 스킬을 참조한다.

| 스킬 | 인터페이스 | 용도 | 권한 |
|------|-----------|------|------|
| `web-speech-api-tts` | `SpeechSynthesis` + `SpeechSynthesisUtterance` | 텍스트 → 음성 출력 | 권한 불필요 |
| `web-speech-api-stt` (이 문서) | `SpeechRecognition` (+ webkit prefix) | 음성 → 텍스트 변환 | 마이크 권한 필요 |

같은 *Web Speech API* 표준 산하지만 두 API는 **완전히 독립**적이다. 한쪽 지원이 다른 쪽 지원을 보장하지 않는다 (예: Safari iOS는 둘 다 부분 지원, Firefox는 TTS만 동작·STT는 flag 뒤에 disabled).

**상호 보완 패턴**: 학습 앱에서 학습자 발화 → STT로 텍스트 변환 → 채점·피드백 → 정답을 TTS로 들려주기. 이 흐름이 가장 흔하다.

---

## 언제 사용하나

- 어학 학습 앱·발음 평가·받아쓰기에서 **별도 SaaS 없이** 브라우저 내장 STT 활용
- PWA에서 오프라인 동작이 핵심이 *아닌* 경우 (Chrome STT는 *Google 서버 호출*이므로 인터넷 필요)
- 비용 0 / 즉시 시작 / 프로토타입·MVP 적합
- Chrome·Safari·Samsung Internet 사용자가 80%+ 이상인 환경 (caniuse 기준 글로벌 87% 부분 지원)

## 언제 사용하지 않나

- Edge·Firefox 점유율이 무시할 수 없는 사용자 환경 — 두 브라우저는 **사실상 동작하지 않는다** (아래 호환성 섹션 참조)
- *전사 정확도가 결정적*인 상용 받아쓰기·자막 제작 → Google Cloud Speech, Azure Speech, AWS Transcribe 등 SaaS
- 오프라인 동작·음성 데이터 외부 유출 금지가 요구사항 → Chrome 구현은 Google 서버로 오디오 전송. 로컬 처리는 Whisper.cpp WebAssembly 등 별도 솔루션 필요
- iOS Safari에서 *연속·장시간* 받아쓰기가 핵심 — 백그라운드·연속 모드에서 잘리는 사례 다수

---

## 1. prefix 처리 + 인스턴스 생성

대부분의 브라우저(Chrome·Edge 노력만·Safari·Samsung Internet)는 API를 **`webkitSpeechRecognition`** 으로만 노출한다. prefix 없는 `SpeechRecognition`은 표준 명세에만 존재하고 실제 구현은 거의 없다.

```javascript
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

if (!SpeechRecognition) {
  // 미지원 — 아래 Graceful Degradation 섹션 참조
  return
}

const recognition = new SpeechRecognition()
```

> **주의**: `window.SpeechRecognitionEvent`, `window.SpeechGrammarList`도 동일하게 prefix 처리 필요. 단, 단순 사용에는 grammars를 거의 쓰지 않는다 (W3C draft에서도 grammars는 점진적 deprecated 방향).

---

## 2. 핵심 옵션

```javascript
recognition.lang = 'ko-KR'        // BCP 47 언어 태그. 미지정 시 HTML lang 또는 UA 기본
recognition.continuous = false    // default: false. true면 사용자가 말 멈춰도 stop() 호출까지 인식 지속
recognition.interimResults = false // default: false. true면 확정 전 중간 결과도 onresult로 전달
recognition.maxAlternatives = 1   // default: 1. 결과당 대안 후보 개수 (n-best)
```

**옵션 조합별 동작:**

| `continuous` | `interimResults` | 동작 | 적합한 용도 |
|--------------|------------------|------|------------|
| `false` | `false` | 한 번 말하고 끝나면 최종 결과 1번 전달 후 자동 종료 | 단일 명령·짧은 발화 평가 |
| `false` | `true` | 말하는 동안 interim 여러 번 + 최종 1번 후 자동 종료 | 발음 피드백 UI(타이핑처럼 표시) |
| `true` | `false` | 침묵해도 멈추지 않고 발화마다 최종 결과 누적 | 받아쓰기·회의록 |
| `true` | `true` | 침묵에도 지속 + interim·final 모두 전달 | 실시간 자막 |

> **주의 (iOS Safari)**: `continuous = true` 는 iOS Safari에서 *제대로 동작하지 않는다*는 보고가 다수다 (자동 종료·이중 transcript·timeout). iOS 대상이면 `continuous = false` + 사용자 버튼 재시작 패턴 권장.

---

## 3. 이벤트

10개 이벤트가 다음 순서로 발생한다:

```
start → audiostart → soundstart → speechstart
       → (사용자 발화)
       → speechend → soundend → audioend
       → result (또는 nomatch)
       → end
```

오류 시: `error` → `end`.

```javascript
recognition.onstart = () => console.log('서비스 시작')
recognition.onaudiostart = () => console.log('오디오 캡처 시작')
recognition.onsoundstart = () => console.log('어떤 소리 감지 (음성 여부 무관)')
recognition.onspeechstart = () => console.log('음성으로 분류된 소리 감지')
recognition.onspeechend = () => console.log('음성 멈춤')
recognition.onsoundend = () => console.log('소리 멈춤')
recognition.onaudioend = () => console.log('오디오 캡처 종료')
recognition.onresult = (event) => { /* 결과 처리 — 아래 섹션 4 */ }
recognition.onnomatch = () => console.log('인식 결과 없음')
recognition.onerror = (event) => console.error('error:', event.error, event.message)
recognition.onend = () => console.log('서비스 종료 — UI 상태 복귀 필수')
```

**실무 권장 최소 이벤트**: `onstart`, `onresult`, `onerror`, `onend` 4개. 나머지는 디버깅·UX 디테일 용도.

> **`onend`는 반드시 처리한다**: `stop()`·`abort()`·자동 종료·에러 모든 경로에서 fire되므로 UI의 *listening 상태 해제*는 onend에 두어야 일관된다.

---

## 4. 결과 처리 — resultIndex와 isFinal

`onresult`의 `event.results`는 `SpeechRecognitionResultList`(배열-like)이고, 각 항목은 `SpeechRecognitionResult`(배열-like), 각 항목은 `SpeechRecognitionAlternative`다.

```
event.results[i]         → i번째 SpeechRecognitionResult
event.results[i].isFinal → 최종(true) 또는 중간(false)
event.results[i].length  → 대안 개수 (maxAlternatives까지)
event.results[i][j]      → j번째 alternative
event.results[i][j].transcript  → 인식된 텍스트
event.results[i][j].confidence  → 신뢰도 0~1
event.resultIndex        → 이번 이벤트에서 변경된 가장 낮은 인덱스
```

**올바른 패턴 — interim + final 분리:**

```javascript
let finalTranscript = ''

recognition.onresult = (event) => {
  let interimTranscript = ''
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript
    if (event.results[i].isFinal) {
      finalTranscript += transcript + ' '
    } else {
      interimTranscript += transcript
    }
  }
  // UI에 final + interim 합쳐 표시 (interim은 회색·이탤릭 등으로 구분)
  setDisplayText(finalTranscript + interimTranscript)
}
```

**왜 `event.resultIndex`부터 순회하나**: `continuous + interimResults` 모드에서 이전 final 결과는 *바뀌지 않는다*. `resultIndex`는 이번 이벤트에서 *처음 변경된* 인덱스이므로, 그 이전은 이미 처리된 final이라 재처리 불필요.

**대안 후보 활용 (maxAlternatives > 1):**

```javascript
recognition.maxAlternatives = 3
recognition.onresult = (event) => {
  const last = event.results[event.results.length - 1]
  for (let j = 0; j < last.length; j++) {
    console.log(`후보 ${j}: "${last[j].transcript}" (신뢰도 ${last[j].confidence})`)
  }
}
```

> **주의**: `confidence` 값은 *브라우저·언어별로 의미가 다르다*. Chrome은 0~1 실수, Safari는 0만 반환하는 경우도 보고된다. 절대값 임계 비교(`> 0.9`)는 신뢰하지 않고, 상대 순위(첫 번째 대안 우선)로 사용한다.

---

## 5. 마이크 권한 — 사전 확인 패턴

`recognition.start()`를 호출하면 브라우저가 마이크 권한 프롬프트를 자동으로 띄운다. 단, 사용자 경험상 **시작 *전*에 권한 상태를 확인**하여 거부 상태면 UI 안내가 깔끔하다.

```javascript
async function checkMicrophonePermission() {
  // 1) Permissions API로 상태 조회 (Chrome·Edge·Firefox 지원, Safari 일부 제한)
  if (navigator.permissions) {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' })
      return status.state // 'granted' | 'denied' | 'prompt'
    } catch {
      // Safari 등에서 name: 'microphone' 미지원 → fallback
    }
  }

  // 2) Fallback: getUserMedia로 직접 시도
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop()) // 즉시 해제
    return 'granted'
  } catch (e) {
    if (e.name === 'NotAllowedError') return 'denied'
    return 'prompt'
  }
}
```

**HTTPS 필수**: Web Speech API는 *secure context* 에서만 동작한다. `localhost`는 예외적으로 허용되지만, 배포 환경은 반드시 HTTPS여야 한다.

**사용자 거부 후 재요청**: 한 번 거부된 사이트는 브라우저 설정에서 명시적으로 다시 허용해야 한다. UI에서 "브라우저 주소창의 자물쇠 아이콘 → 사이트 설정"으로 안내한다.

---

## 6. 에러 처리

`event.error`가 가질 수 있는 표준 값 8개 (MDN 기준):

| error | 의미 | 권장 대응 |
|-------|------|-----------|
| `no-speech` | 일정 시간 음성 미감지 | "다시 말씀해주세요" 안내 후 재시작 |
| `aborted` | `abort()` 호출 또는 사용자/브라우저 중단 | 정상 흐름. UI 상태만 복귀 |
| `audio-capture` | 마이크 하드웨어 없음·접근 실패 | 마이크 연결 안내 |
| `network` | 인식 서비스 네트워크 오류 (Chrome=Google 서버) | 재시도·인터넷 점검 안내 |
| `not-allowed` | 사용자가 마이크 권한 거부 | 브라우저 설정 안내 |
| `service-not-allowed` | 인식 서비스 자체가 차단됨 (정책·환경) | 권한·환경 안내 |
| `bad-grammar` | grammars 설정 오류 (드물게) | grammars 미사용 권장 |
| `language-not-supported` | `lang` 값이 지원 안 됨 | 대체 언어 또는 사용자 안내 |

> 참고: W3C draft 최신본은 `phrases-not-supported`를 추가했으나, 현재 구현 브라우저에는 거의 반영되지 않았다.

```javascript
recognition.onerror = (event) => {
  switch (event.error) {
    case 'not-allowed':
    case 'service-not-allowed':
      showToast('마이크 권한이 필요합니다.')
      break
    case 'no-speech':
      showToast('음성이 감지되지 않았습니다. 다시 시도해주세요.')
      break
    case 'network':
      showToast('네트워크 오류. 인터넷 연결을 확인해주세요.')
      break
    case 'aborted':
      break // 정상 — 사용자가 중단
    default:
      showToast(`인식 오류: ${event.error}`)
  }
}
```

---

## 7. `abort()` vs `stop()` 차이

| 메서드 | 동작 | 마지막 결과 반환 | onend |
|--------|------|:---:|:---:|
| `stop()` | 청취 중단 + **지금까지 캡처한 오디오로 최종 결과 시도** | ✅ (성공 시) | ✅ |
| `abort()` | 청취 중단 + **결과 시도 안 함** | ❌ | ✅ (error: 'aborted'로) |

**언제 어느 것:**
- 사용자가 "완료" 버튼 → `stop()` (지금까지 발화 결과 살림)
- 사용자가 "취소" 버튼 또는 페이지 이동 → `abort()` (결과 폐기)
- 컴포넌트 unmount → `abort()` (메모리·핸들러 누수 방지)

```javascript
// React unmount 시 cleanup
useEffect(() => {
  return () => {
    recognition.abort()
  }
}, [])
```

---

## 8. 미지원 브라우저 감지 + Graceful Degradation

```javascript
function isSTTSupported() {
  return (
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  )
}

function createRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return null
  return new SR()
}
```

**UI 측면 패턴:**
- 미지원 브라우저에서는 **음성 입력 버튼 자체를 숨기거나 비활성화** + 텍스트 입력으로 대체
- 미지원 안내 메시지: "음성 입력은 Chrome 또는 Safari에서만 지원됩니다"
- Firefox: `about:config`에서 `media.webspeech.recognition.enable`을 켜도 *실제 인식은 작동하지 않는다* (UI flag만 존재). Firefox 사용자에게 안내하지 말 것.
- Edge: API 객체는 존재하나 **결과를 절대 반환하지 않는** no-op 구현이 다수 보고됨. 따라서 객체 존재 체크만으로는 부족하고, 일정 시간 내 결과 없으면 미지원으로 간주하는 timeout 로직이 안전.

---

## 9. 호환성 — 정확한 현실 (DISPUTED 정리)

> **주의**: 사용자 요구의 *"Chrome/Edge 안정, Safari iOS 16+ 지원"* 표현은 부정확하다. caniuse·MDN BCD 이슈 기준 사실은 다음과 같다.

| 브라우저 | 지원 | 실제 동작 | 비고 |
|---------|------|-----------|------|
| **Chrome (Desktop)** | ✅ 25+ (webkit prefix) | 정상 동작. Google 서버로 오디오 전송 → 오프라인 불가 | 가장 안정. 한국어 ko-KR 잘 인식 |
| **Chrome (Android)** | ✅ (webkit prefix) | 정상 | 모바일 표준 |
| **Safari (macOS)** | ✅ 14.1+ | 정상 (Apple 자체 엔진) | confidence 0 반환 사례 보고 |
| **Safari (iOS / iPadOS)** | ⚠️ **14.5+** (16+ 아님) | 부분 동작. continuous·백그라운드 이슈 다수 | iOS 14.5가 최초 지원 버전 |
| **Samsung Internet** | ✅ 4+ (webkit prefix) | Chrome 기반 동작 | |
| **Firefox** | ❌ | flag 켜도 **실제 인식 작동 안 함** | Mozilla가 end user에 활성화한 적 없음 |
| **Edge** | ❌ | API 객체 존재하나 **결과 반환 안 함 (no-op)** | MDN BCD 이슈 #22126에서 보고. caniuse도 "No support" |
| **Opera** | ❌ | Chromium 기반이지만 미지원 표기 | |

**전역 부분 지원율**: caniuse 기준 **~87.8%** (대부분 Chrome 기반 + Safari).

---

## 10. iOS Safari 함정 모음

- **백그라운드/잠금 진입 시 즉시 중단**: 탭이 백그라운드로 가면 인식이 멈추고 onend가 발생. 사용자 재상호작용 없이 재시작 불가
- **`continuous = true` 무력화**: 명세상 지원이지만 *짧은 시간 후 자동 종료*되거나 transcript가 *이중 반복*되는 사례 다수
- **권한 후 2~3초 지연**: 첫 `start()` 호출 시 권한 부여~실제 청취 시작까지 지연. UX에서 "잠시 기다려주세요" 표시 권장
- **Siri 설정과 충돌**: 시스템 Siri 비활성화 환경에서 인식 실패 보고
- **TTS 동시 사용 시 충돌**: `speechSynthesis.speak()` 직후 `recognition.start()` 호출하면 오디오 세션 충돌. 100~300ms 지연 두기

**대응 권장**:
```javascript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

const recognition = createRecognition()
recognition.continuous = isIOS ? false : true  // iOS는 단발 모드
recognition.interimResults = !isIOS            // iOS는 final만 (interim 불안정)

document.addEventListener('visibilitychange', () => {
  if (document.hidden) recognition.abort() // 백그라운드 진입 시 깔끔히 중단
})
```

---

## 11. 한국어(ko-KR) 인식 정확도 팁

1. **`lang = 'ko-KR'` 명시**: 누락 시 시스템 기본 언어로 추론 — 영어 학습자가 영어 발화해도 한국어로 잘못 인식되는 사례 다수
2. **간섭 줄이기**: 마이크 게인 적절 / 주변 소음·에코 최소화 / TTS 출력 중에는 인식 중지
3. **짧은 문장 단위로 끊기**: 연속 모드라도 `interimResults`만 보고 자체 침묵 감지로 끊으면 정확도 향상
4. **대안 후보 활용**: `maxAlternatives = 3~5`로 받아 사용자 의도와 매칭 (예: 단어 평가 시 정답 단어가 후보 안에 있으면 PASS)
5. **숫자·영어 혼용 발화**: Chrome은 한국어 lang에서도 영어 단어를 비교적 잘 처리. Safari는 더 약함
6. **외래어 표기 불일치**: "프론트엔드" / "프론트앤드" / "프론트엔드" 등 다양하게 인식 — 후처리 normalize 필요

---

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

## 참고 링크

- MDN Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- MDN SpeechRecognition: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- MDN SpeechRecognition.error_event: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/error_event
- MDN SpeechRecognitionResult: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionResult
- MDN result_event (resultIndex 설명): https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/result_event
- W3C/WICG Web Speech API draft: https://webaudio.github.io/web-speech-api/
- caniuse Speech Recognition: https://caniuse.com/speech-recognition
- MDN BCD Edge no-op 이슈: https://github.com/mdn/browser-compat-data/issues/22126
- WebKit bug 225298 (iOS service availability): https://bugs.webkit.org/show_bug.cgi?id=225298
