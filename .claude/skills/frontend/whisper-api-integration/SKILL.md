---
name: whisper-api-integration
description: OpenAI 음성 전사(STT) API 통합 패턴. POST /v1/audio/transcriptions multipart/form-data, 현재 권장 모델 gpt-transcribe($0.0045/min) · 실시간 gpt-live-transcribe · 레거시 whisper-1/gpt-4o-transcribe · 화자분리 gpt-4o-transcribe-diarize 선택 기준, languages=["ko"] 한국어 힌트(단수 language 대체), keywords 고유명사 힌트, prompt 컨텍스트, response_format(json/text/srt/verbose_json/vtt/diarized_json) 모델별 제약, SRT·VTT·타임스탬프는 whisper-1 전용, 25MB 파일 크기 제한, 브라우저 직접 호출 시 API 키 노출 위험 → 백엔드 프록시 권장(Rust Axum · Spring Boot · Node Express), 청크 분할(Web Audio · ffmpeg.wasm), stream=true 부분 전사, Web Speech API 폴백, whisper-1 → gpt-transcribe 마이그레이션, 흔한 함정(CORS·25MB 초과·언어 자동 감지 부정확).
---

# whisper-api-integration — OpenAI 음성 전사 API 통합

> 소스:
> - OpenAI File transcription Guide (STT) — https://developers.openai.com/api/docs/guides/speech-to-text
> - OpenAI Cookbook / Migrating from Whisper to GPT-Transcribe — https://developers.openai.com/cookbook/examples/migrating_from_whisper_to_gpt_transcribe
> - OpenAI API Reference / Create transcription — https://developers.openai.com/api/reference/resources/audio/subresources/transcriptions/methods/create
> - OpenAI Models — https://developers.openai.com/api/docs/models/gpt-transcribe, https://developers.openai.com/api/docs/models/gpt-live-transcribe, https://developers.openai.com/api/docs/models/gpt-4o-transcribe, https://developers.openai.com/api/docs/models/whisper-1
> - OpenAI Pricing — https://openai.com/api/pricing/
>
> 검증일: 2026-08-11
>
> **2026-08-11 갱신 요지**: OpenAI가 **`gpt-transcribe`**(2026-07-28 출시)를 파일 전사의 **권장 모델**로 지정.
> 공식 가이드 원문 — *"Start with `gpt-transcribe`. This is the recommended model for transcribing recorded speech in its original language."*
> 단가는 $0.0045/min으로 whisper-1·gpt-4o-transcribe($0.006/min)보다 25% 저렴. 신규 개발은 `gpt-transcribe` 기본,
> **SRT/VTT 자막·워드/세그먼트 타임스탬프·번역이 필요할 때만 `whisper-1` 유지**가 공식 마이그레이션 지침이다.

---

## 짝 스킬과의 관계

이 스킬은 *서버 측(또는 백엔드 프록시 경유) 클라우드 STT* 통합 패턴이다. 음성 입력·브라우저 내장 STT는 별도 스킬을 참조한다.

| 스킬 | 역할 | 위치 |
|------|------|------|
| `frontend/media-recorder-api` | 마이크 → `Blob`(audio/webm 등) 녹음 | 별개 스킬 (앞단계) |
| `frontend/web-speech-api-stt` | 브라우저 내장 STT (무료·오프라인 불가) | 별개 스킬 (폴백 경로) |
| `frontend/whisper-api-integration` (이 문서) | 녹음된 오디오 Blob → 클라우드 STT API 호출 | 본 스킬 |

**전형적 흐름**: MediaRecorder로 녹음 → Blob 확보 → 이 스킬의 호출 패턴으로 백엔드 프록시에 전송 → 백엔드가 OpenAI에 multipart 요청 → 텍스트 반환.

**폴백 흐름**: Web Speech API STT 우선 시도 → 미지원 브라우저(Firefox·Edge)나 정확도 부족 시 Whisper API로 fallback.

---

## 1. 엔드포인트와 인증

```
POST https://api.openai.com/v1/audio/transcriptions
Authorization: Bearer $OPENAI_API_KEY
Content-Type: multipart/form-data
```

번역(다른 언어 → 영어 텍스트)은 별도 엔드포인트:

```
POST https://api.openai.com/v1/audio/translations
```

> **주의:** 한국어 → 한국어 텍스트라면 **transcriptions**를 사용해야 한다. translations 엔드포인트는 출력이 영어로 고정된다.

---

## 2. 사용 가능한 모델 (2026-08-11 기준)

> 모델 라인업은 자주 갱신된다. 아래는 2026-08-11 기준 공식 모델 페이지·STT 가이드로 확인한 라인업이다.

| 모델 ID | 위치 | 단가 | 지원 엔드포인트 | 비고 |
|---------|------|:----:|-----------------|------|
| **`gpt-transcribe`** | ⭐ **파일 전사 권장 기본값** | **$0.0045/min** | `/v1/audio/transcriptions`, `/v1/realtime/transcription_sessions` | `prompt`·`keywords`·`languages`·`stream` 지원. **SRT/VTT·타임스탬프 미지원** |
| `gpt-live-transcribe` | 실시간 스트리밍 전용 | $0.017/min | `/v1/realtime/transcription_sessions` **만** | 저지연 델타 전사(라이브 자막·받아쓰기). 파일 업로드 엔드포인트 사용 불가 |
| `whisper-1` | 레거시 — **자막·타임스탬프·번역 전용으로 존치** | $0.006/min | `/v1/audio/transcriptions`, `/v1/audio/translations` | `srt`·`vtt`·`verbose_json`·`timestamp_granularities` 지원 **유일 경로** |
| `gpt-4o-transcribe` | 레거시(기존 통합 유지용) | $0.006/min 상당 (오디오 토큰 $2.50/1M in · $10/1M out) | `/v1/audio/transcriptions`, `/v1/realtime` | `response_format`은 `json`만. `include=["logprobs"]` 지원 |
| `gpt-4o-mini-transcribe` | 레거시 경량 | $0.003/min | `/v1/audio/transcriptions` | `response_format`은 `json`만. `logprobs` 지원 |
| `gpt-4o-transcribe-diarize` | 화자 분리(speaker labels) 전용 | gpt-4o-transcribe 대비 상위 | `/v1/audio/transcriptions` | `response_format=diarized_json` 필수, `known_speaker_names/references`(최대 4명), `prompt` 미지원 |

### 선택 기준 (결정 트리)

1. **일반 파일 전사 → `gpt-transcribe`** (기본값. 가장 저렴하고 정확도 최상)
2. **SRT/VTT 자막 파일 또는 word/segment 타임스탬프 필요 → `whisper-1`** (다른 모델은 대안 없음)
3. **오디오 → 영어 번역(`/v1/audio/translations`) 필요 → `whisper-1`**
4. **"누가 말했는가" 화자 라벨 필요 → `gpt-4o-transcribe-diarize`**
5. **라이브 스트림 저지연 자막 → `gpt-live-transcribe`**
6. **기존 gpt-4o-transcribe 통합 유지 중 → 신규 코드는 `gpt-transcribe`로 전환** (아래 14장)

> **주의 (response_format 제약 — 모델별로 다름):**
> - `gpt-transcribe` — `srt`·`vtt`·`verbose_json`을 지원하지 않는다. 공식 마이그레이션 문서 원문: *"do not assume the same `response_format` remains valid"*, *"retain `whisper-1` if the integration depends on native SRT or VTT output"*.
> - `gpt-4o-transcribe` / `gpt-4o-mini-transcribe` — `json`만.
> - `gpt-4o-transcribe-diarize` — `json`·`text`·`diarized_json` (화자 라벨은 `diarized_json` 필수).
> - `whisper-1` — `json`·`text`·`srt`·`verbose_json`·`vtt` 전체.

> **주의 (정확도 수치):** 커뮤니티 다수 보도는 Common Voice 22개 언어 벤치에서 WER이 `whisper-1` 40.37% → `gpt-transcribe` 19.27%로 개선됐다고 전한다(출시일 2026-07-28). **OpenAI 공식 발표 페이지(openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/)는 접근 차단(403)으로 원문 직접 확인 실패** — 수치 자체는 미검증으로 간주하고, "권장 모델 지정"과 "$0.0045/min"만 공식 확인 사실로 취급하라.

> **주의 (gpt-4o-transcribe 퇴역 진행):** OpenAI 자체 모델 페이지에는 아직 deprecation 표기가 없다. 다만 **Azure OpenAI(Microsoft Foundry) 채널에서는 `gpt-4o-transcribe` 퇴역이 공지**되어 다수 사용자 문의가 올라와 있다(보고된 날짜는 2026-01-14 → 2026-02-28로 변동). Azure 배포를 쓴다면 반드시 [Azure 모델 퇴역 스케줄](https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirements)에서 현재 날짜·대체 모델을 재확인하라. **어느 채널이든 신규 개발에 `gpt-4o-transcribe`를 선택할 이유는 없다.**

---

## 3. 요청 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:---:|------|
| `file` | binary | ✅ | 오디오 파일(또는 Blob). **최대 25MB** |
| `model` | string | ✅ | 위 모델 ID 중 하나 |
| `languages[]` | string[] | — | **`gpt-transcribe` 전용 신규 파라미터.** 예상 입력 언어 힌트 배열. 한국어는 `["ko"]`. ISO-639-1(`ko`,`en`), 일부 ISO-639-3(`eng`,`yue`,`cmn`), 중국어 지역 코드(`zh-cn`,`zh-tw`,`zh-hk`) 허용 |
| `language` | string | — | **레거시 단수 필드.** whisper-1·gpt-4o-transcribe 계열용. ISO-639-1 코드(`"ko"`). 미지정 시 자동 감지하지만 **부정확** |
| `keywords[]` | string[] | — | **`gpt-transcribe` 전용 신규 파라미터.** 오디오에 등장할 고유명사·제품코드 등 리터럴 용어 배열 |
| `prompt` | string | — | 자유 형식 컨텍스트. whisper-1은 **마지막 224토큰**만 사용. `gpt-4o-transcribe-diarize`는 **미지원** |
| `response_format` | string | — | `json`(기본) / `text` / `srt` / `verbose_json` / `vtt` / `diarized_json`. **모델별 허용값이 다름 — 2장 주의 참조** |
| `stream` | bool | — | `true`면 부분 전사 델타 이벤트 스트리밍. `gpt-transcribe`·`gpt-4o-transcribe` 계열 지원, **whisper-1 미지원** |
| `temperature` | number | — | 0~1, 기본 0. 0이면 thresholds까지 자동 증가 |
| `timestamp_granularities[]` | string[] | — | `word` / `segment`. **`whisper-1` + `response_format=verbose_json`** 조합 전용 |
| `chunking_strategy` | string | — | `"auto"` 등. 30초 초과 오디오의 서버 측 자동 청크. 주로 `gpt-4o-transcribe-diarize`용 |
| `include[]` | string[] | — | `["logprobs"]`. `gpt-4o-transcribe`·`gpt-4o-mini-transcribe` + `response_format=json` 한정 |
| `known_speaker_names[]` / `known_speaker_references[]` | string[] | — | diarize 전용. 최대 4명. 레퍼런스 샘플은 data URL, 각 2~10초 |

> **주의 (`language` vs `languages` 동시 전송 금지):** 공식 가이드는 *"The `languages` parameter replaces the singular `language` field—don't send both"* 라고 명시한다. `gpt-transcribe`로 마이그레이션할 때 기존 `language: 'ko'` 라인을 **지우고** `languages: ['ko']`로 교체하라. 둘 다 붙이면 안 된다.

> **주의 (`keywords` 오남용):** 공식 문구 — *"Keywords are hints, not required output. Include only relevant terms."* 실제 등장하지 않을 단어를 넣으면 모델이 없는 말을 만들어낼 수 있다. 또한 keywords 값에 `<`, `>`, CR, LF 문자를 넣을 수 없다.

> **주의 (SDK 타입 지연):** OpenAI 공식 Cookbook 예제는 `keywords`·`languages`를 Python SDK에서 `extra_body={...}`로 전달한다. SDK 버전에 따라 최상위 인자로 아직 노출되지 않을 수 있으므로, 타입 에러가 나면 `extra_body`(Python) / raw multipart 필드(fetch)로 우회하라.

> **주의:** 모델·파라미터 조합 제약(특히 response_format ↔ timestamp_granularities ↔ logprobs)이 자주 바뀐다. 신규 도입 시 https://developers.openai.com/api/reference/resources/audio/subresources/transcriptions/methods/create 에서 현재 매트릭스 재확인.

---

## 4. 지원 포맷과 크기

**확장자 (2026-08-11 현재 STT 가이드 명시)**: `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `wav`, `webm`

**최대 크기**: **25 MB** (요청 전체 multipart 기준)

> **주의 (flac·ogg·oga):** 과거 가이드와 엔드포인트 에러 메시지는 `flac`·`ogg`·`oga`를 포함한 10종을 나열했으나, **현재 `gpt-transcribe` 기준 공식 가이드는 위 7종만 명시**한다. 두 목록이 어긋나므로 `flac`/`ogg`/`oga`를 쓰려면 사용할 모델로 직접 1회 호출해 확인하라. 브라우저 MediaRecorder 기본 산출물인 `audio/webm`은 양쪽 목록 모두에 있어 안전하다.

> **주의:** 25MB는 *오디오 길이*가 아닌 *파일 바이트 크기* 제한이다. 16kHz mono WAV로는 약 13분, 128kbps MP3로는 약 26분, Opus(WebM Opus 32kbps)로는 1시간 이상 가능. **저비트레이트 압축 포맷으로 변환하면 길이 제한이 사실상 늘어난다.**

---

## 5. fetch 호출 패턴 — 브라우저(권장 X) · 백엔드(권장)

> 브라우저에서 직접 호출하는 예시(보안 위험·데모 한정, 흔한 함정 포함) → [`references/REFERENCE.md`](references/REFERENCE.md) §5.1

### 5.2 백엔드 프록시 경유 — 클라이언트 측

```ts
async function transcribeViaProxy(audioBlob: Blob): Promise<string> {
  const form = new FormData();
  form.append('file', new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));
  form.append('lang', 'ko'); // 자사 프록시 계약. 모델·API 키는 서버가 결정

  const res = await fetch('/api/transcribe', { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Transcribe failed: ${res.status}`);
  return (await res.json()).text;
}
```

---

## 6. 백엔드 프록시 변형 — Rust(Axum) · Spring Boot · Node(Express)

> API 키를 서버에 보관하고, 클라이언트는 자사 도메인으로만 호출. CORS와 키 노출 동시 해결. 3개 언어(Rust/Axum · Spring Boot · Node/Express) 전체 구현 → [`references/REFERENCE.md`](references/REFERENCE.md) §6

---

## 7. 한국어 정확도 향상 팁

1. **언어 힌트 명시 필수.** 미지정 시 무음·짧은 클립을 영어/일본어로 오감지하는 사례 다수 보고됨.
   - `gpt-transcribe` → **`languages: ["ko"]`** (단수 `language`와 병용 금지)
   - `whisper-1`·`gpt-4o-transcribe` 계열 → `language: "ko"`
   - 한·영 혼용 회의라면 `languages: ["ko", "en"]`처럼 복수 지정이 가능하다 (구 단수 필드로는 불가능했던 개선점)
2. **고유명사는 `prompt`가 아니라 `keywords`로.** (`gpt-transcribe` 한정)
   ```
   keywords: ["자각몽", "반복몽", "예지몽", "가위눌림"]
   prompt: "꿈 해몽 상담 통화 녹음"     ← 상황 설명은 prompt
   ```
   whisper-1만 쓰던 시절의 "콤마 나열 prompt" 패턴은 `gpt-transcribe`에서는 `keywords`로 옮기는 것이 정석이다.
   단, **실제 등장하지 않을 단어는 넣지 말 것** — 없는 말이 출력될 수 있다.
3. **`prompt` 길이 제약**: whisper-1은 *마지막 224토큰만* 사용. `gpt-transcribe`도 모델 길이 한도 내로 유지.
4. **녹음 품질**: 16kHz mono 이상, 노이즈 게이트 적용. WebM Opus 기본 설정이면 충분.
5. **너무 짧은 클립 회피**: 1초 미만은 빈 문자열 또는 환각 텍스트("시청해 주셔서 감사합니다") 반환 사례 있음.
6. **모델 선택**: 한국어 포함 다국어 정확도는 `gpt-transcribe`가 현행 최상(공식 권장). 자막·세그먼트 타임스탬프가 필요할 때만 whisper-1로 내려간다.
7. **`temperature=0`** 유지 — 환각 줄임. 0 기본값 그대로면 충분.

> **주의:** prompt는 LLM처럼 지시문이 아니다. *컨텍스트·문체 힌트* 용도로만 사용. "다음 오디오를 요약해주세요" 같은 문장은 무의미하거나 출력에 그대로 섞일 수 있다.

> **주의:** `gpt-4o-transcribe-diarize`는 `prompt`를 지원하지 않는다. 화자 분리 경로에서는 어휘 힌트를 줄 수 없다.

---

> verbose_json 응답 예시(whisper-1 전용)와 세그먼트 신뢰도(`no_speech_prob`·`avg_logprob`) 활용법 → [`references/REFERENCE.md`](references/REFERENCE.md) §8
>
> 25MB 초과 대응 — 청크 분할 전략 비교·권장 흐름·코드 → [`references/REFERENCE.md`](references/REFERENCE.md) §9

---

## 10. Web Speech API 폴백 패턴

```ts
async function transcribeWithFallback(blob: Blob): Promise<string> {
  // 1) Web Speech API STT 시도 — 실시간 받아쓰기로 이미 결과를 얻은 경우 그것을 우선 사용
  //    (web-speech-api-stt 스킬 참조)
  if (hasReliableWebSpeechResult()) return getWebSpeechTranscript();

  // 2) 미지원 브라우저(Firefox·Edge) 또는 정확도 부족 시 Whisper로 fallback
  return await transcribeViaProxy(blob);
}
```

선택 기준:
- 짧은 명령어·실시간 피드백 → Web Speech 우선(지연 ~0)
- 긴 받아쓰기·정확도 우선 → Whisper 우선
- 양쪽 모두 → Web Speech를 1차로 보여주고, Whisper 결과로 *백그라운드 보정*

---

## 11. 비용 추산

> 가격은 변동된다. 도입 시점에 https://openai.com/api/pricing/ 재확인 필수.

2026-08-11 기준:

| 모델 | 분당 단가 | 1시간당 | 월 1만 분 | 비고 |
|------|:---------:|:-------:|:---------:|------|
| **`gpt-transcribe`** | **$0.0045** | $0.27 | **$45** | 권장 기본값. whisper-1 대비 25% 저렴 |
| `whisper-1` | $0.006 | $0.36 | $60 | 자막·타임스탬프·번역 전용으로만 존치 |
| `gpt-4o-transcribe` | $0.006 상당 | $0.36 | $60 | 레거시. 신규 채택 비권장 |
| `gpt-4o-mini-transcribe` | $0.003 | $0.18 | $30 | 레거시 최저가 |
| `gpt-live-transcribe` | $0.017 | $1.02 | $170 | 실시간 스트리밍 전용 — **파일 전사보다 3.8배 비싸다** |
| `gpt-4o-transcribe-diarize` | gpt-4o-transcribe 상위 | — | — | 화자 분리 |

**비용 관점 판단:**
- whisper-1 → `gpt-transcribe` 전환만으로 **동일 사용량에서 25% 절감**된다(정확도는 오히려 개선). 전환을 미룰 재무적 이유가 없다.
- 실시간 자막을 "있으면 좋으니까" 켜두면 `gpt-live-transcribe`가 파일 전사의 3.8배를 태운다. **라이브가 정말 필요한 화면에서만** 활성화하라.

**클라이언트 호출량을 그대로 노출하면 비용 폭발 가능**하므로 백엔드에서 *사용자별 quota·rate limit*을 강제하라.

---

> 흔한 함정 체크리스트(13항목) → [`references/REFERENCE.md`](references/REFERENCE.md) §12

---

## 13. 사용 안 해야 할 때

- 오프라인 동작 필수 → Whisper.cpp WebAssembly 등 로컬 추론 솔루션
- 음성 데이터 외부 전송 금지 → 자체 호스팅 Whisper (OpenAI 정책상 API 입력은 학습에 사용 안 함이라 명시되어 있으나, *전송 자체*가 금지인 환경)
- 실시간 자막(<500ms 지연) → **`gpt-live-transcribe`**(realtime transcription 세션) 또는 클라우드 스트리밍 STT(Google/Azure). 이 스킬의 파일 업로드 패턴으로는 불가
- 1초 미만 짧은 단어 인식만 필요 → 브라우저 Web Speech API가 더 적합

---

## 14. whisper-1 / gpt-4o-transcribe → gpt-transcribe 마이그레이션

전환 체크리스트·안전한 전환 순서 전체 → [`references/REFERENCE.md`](references/REFERENCE.md) §14

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
