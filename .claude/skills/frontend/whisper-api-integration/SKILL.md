---
name: whisper-api-integration
description: OpenAI Whisper / GPT-4o Transcribe API 통합 패턴. POST /v1/audio/transcriptions multipart/form-data, model(whisper-1 · gpt-4o-transcribe · gpt-4o-mini-transcribe · gpt-4o-transcribe-diarize) 선택, language="ko" 한국어 지정, prompt 어휘 힌트, response_format(json/text/srt/verbose_json/vtt), timestamp_granularities, 25MB 파일 크기 제한, 지원 포맷(flac/m4a/mp3/mp4/mpeg/mpga/oga/ogg/wav/webm), 브라우저 직접 호출 시 API 키 노출 위험 → 백엔드 프록시 권장(Rust Axum · Spring Boot · Node Express), 청크 분할(Web Audio · ffmpeg.wasm), Web Speech API 폴백 패턴, 흔한 함정(CORS·25MB 초과·언어 자동 감지 부정확).
---

# whisper-api-integration — OpenAI 음성 전사 API 통합

> 소스:
> - OpenAI API Reference / Create transcription — https://platform.openai.com/docs/api-reference/audio/createTranscription
> - OpenAI Speech-to-text Guide — https://platform.openai.com/docs/guides/speech-to-text
> - OpenAI Models / Whisper · GPT-4o Transcribe — https://developers.openai.com/api/docs/models/whisper-1, https://developers.openai.com/api/docs/models/gpt-4o-transcribe
> - OpenAI Pricing — https://openai.com/api/pricing/
>
> 검증일: 2026-05-14

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

## 2. 사용 가능한 모델

> 모델 라인업은 자주 갱신된다. 2026-05-14 기준 transcriptions 엔드포인트에서 선택 가능한 모델은 다음과 같다.

| 모델 ID | 특징 | 단가(분당) | 비고 |
|---------|------|:----------:|------|
| `whisper-1` | 레거시. Whisper V2 오픈소스 기반. 안정성·호환성 최고 | $0.006 | 모든 `response_format` 지원, `timestamp_granularities` 지원 |
| `gpt-4o-transcribe` | GPT-4o 기반 최신. WER 개선·언어 인식 향상 | $0.006 | `logprobs` 지원, **`response_format`은 `json`/`text`만**, Realtime API 스트리밍 가능 |
| `gpt-4o-mini-transcribe` | 경량·저비용 | $0.003 | `logprobs` 지원, `response_format` 제약 동일 |
| `gpt-4o-transcribe-diarize` | 화자 분리(speaker labels) 추가 | gpt-4o-transcribe의 약 2.5배 | "누가 말했는가" 라벨링 가능 |

> **주의 (response_format 제약):** `gpt-4o-transcribe` 계열은 `srt`·`verbose_json`·`vtt` 출력을 지원하지 않는다. **세그먼트·타임스탬프·자막 파일이 필요하면 `whisper-1`을 선택**하라. 출처: OpenAI Audio API Reference (createTranscription).

선택 기준 요약:
- 자막(srt/vtt)·구간별 타임스탬프 필요 → `whisper-1`
- 정확도 최우선·JSON 결과만 → `gpt-4o-transcribe`
- 비용 최우선 → `gpt-4o-mini-transcribe`
- 화자 분리 → `gpt-4o-transcribe-diarize`

---

## 3. 요청 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:---:|------|
| `file` | binary | ✅ | 오디오 파일(또는 Blob). **최대 25MB** |
| `model` | string | ✅ | 위 모델 ID 중 하나 |
| `language` | string | — | ISO-639-1 코드. 한국어는 `"ko"`. 미지정 시 모델이 자동 감지하지만 **부정확** |
| `prompt` | string | — | 어휘 힌트·고유명사. whisper-1은 **마지막 224토큰**만 사용 |
| `response_format` | string | — | `json`(기본) / `text` / `srt` / `verbose_json` / `vtt` (whisper-1 한정 전체 지원) |
| `temperature` | number | — | 0~1, 기본 0. 0이면 thresholds까지 자동 증가 |
| `timestamp_granularities[]` | string[] | — | `word` / `segment`. **`response_format=verbose_json`** 필수, whisper-1 한정 |
| `chunking_strategy` | string | — | `"auto"` 등. 서버 측 자동 청크. 모델별 지원 여부 별도 확인 |
| `logprobs` | bool | — | gpt-4o-transcribe 계열 + `response_format=json` 한정. 토큰 confidence 반환 |

> **주의:** 모델·파라미터 조합 제약(특히 response_format ↔ timestamp_granularities ↔ logprobs)이 자주 바뀐다. 신규 도입 시 https://platform.openai.com/docs/api-reference/audio/createTranscription 에서 현재 매트릭스 재확인.

---

## 4. 지원 포맷과 크기

**확장자**: `flac`, `m4a`, `mp3`, `mp4`, `mpeg`, `mpga`, `oga`, `ogg`, `wav`, `webm`

**최대 크기**: **25 MB** (요청 전체 multipart 기준)

> **주의:** 25MB는 *오디오 길이*가 아닌 *파일 바이트 크기* 제한이다. 16kHz mono WAV로는 약 13분, 128kbps MP3로는 약 26분, Opus(WebM Opus 32kbps)로는 1시간 이상 가능. **저비트레이트 압축 포맷으로 변환하면 길이 제한이 사실상 늘어난다.**

---

## 5. fetch 호출 패턴 — 브라우저(권장 X) · 백엔드(권장)

### 5.1 브라우저에서 직접 호출 (보안 위험·데모 한정)

```ts
// ⚠️ 프로덕션에서 사용 금지. API 키가 클라이언트 번들에 노출된다.
async function transcribeFromBrowser(audioBlob: Blob): Promise<string> {
  const form = new FormData();
  // Blob에서 File 명시 — 일부 클라이언트는 확장자가 없으면 reject
  form.append('file', new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));
  form.append('model', 'whisper-1');
  form.append('language', 'ko');
  form.append('response_format', 'json');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      // Content-Type은 명시 금지 — FormData가 boundary 포함해 자동 설정
    },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Whisper ${res.status}: ${err?.error?.message ?? res.statusText}`);
  }

  const data = await res.json() as { text: string };
  return data.text;
}
```

> **흔한 함정**:
> - `Content-Type` 헤더를 수동으로 박으면 multipart boundary가 사라져 400 반환. **헤더에 Content-Type 절대 명시 금지** (FormData가 자동 설정).
> - `Blob`을 그대로 append 하면 확장자 추론이 불가능해 "Unsupported file format" 발생 가능. **`new File([blob], 'name.ext', { type })` 로 감싸라.**
> - 브라우저 직접 호출은 **API 키 노출 + CORS**. 위 코드는 동작은 하지만 *데모/내부 도구* 한정. 외부 사용자 노출 시 백엔드 프록시 필수.

### 5.2 백엔드 프록시 경유 — 클라이언트 측

```ts
async function transcribeViaProxy(audioBlob: Blob): Promise<string> {
  const form = new FormData();
  form.append('file', new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));
  form.append('language', 'ko');

  const res = await fetch('/api/transcribe', { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Transcribe failed: ${res.status}`);
  return (await res.json()).text;
}
```

---

## 6. 백엔드 프록시 변형 — Rust(Axum) · Spring Boot · Node(Express)

> API 키를 서버에 보관하고, 클라이언트는 자사 도메인으로만 호출. CORS와 키 노출 동시 해결.

### 6.1 Rust + Axum (reqwest multipart)

```rust
// Cargo.toml: reqwest = { version = "0.12", features = ["json", "multipart"] }
use axum::{extract::Multipart, response::IntoResponse, Json};
use serde::Deserialize;
use reqwest::multipart::{Form, Part};

#[derive(Deserialize)]
struct WhisperResp { text: String }

pub async fn transcribe_handler(mut multipart: Multipart) -> Result<impl IntoResponse, AppError> {
    let mut audio_bytes: Vec<u8> = Vec::new();
    let mut filename = String::from("recording.webm");
    let mut language = String::from("ko");

    while let Some(field) = multipart.next_field().await.map_err(|_| AppError::BadRequest)? {
        match field.name() {
            Some("file") => {
                if let Some(fname) = field.file_name() { filename = fname.to_string(); }
                audio_bytes = field.bytes().await.map_err(|_| AppError::BadRequest)?.to_vec();
            }
            Some("language") => {
                language = field.text().await.map_err(|_| AppError::BadRequest)?;
            }
            _ => {}
        }
    }

    if audio_bytes.len() > 25 * 1024 * 1024 {
        return Err(AppError::PayloadTooLarge);
    }

    let api_key = std::env::var("OPENAI_API_KEY")
        .map_err(|_| AppError::Internal("OPENAI_API_KEY missing"))?;

    let form = Form::new()
        .part("file", Part::bytes(audio_bytes).file_name(filename).mime_str("audio/webm")?)
        .text("model", "whisper-1")
        .text("language", language)
        .text("response_format", "json");

    let resp = reqwest::Client::new()
        .post("https://api.openai.com/v1/audio/transcriptions")
        .bearer_auth(api_key)
        .multipart(form)
        .send().await.map_err(|e| AppError::Upstream(e.to_string()))?
        .error_for_status().map_err(|e| AppError::Upstream(e.to_string()))?
        .json::<WhisperResp>().await.map_err(|e| AppError::Upstream(e.to_string()))?;

    Ok(Json(resp))
}
```

> Rust 규칙 준수: `unwrap()` 금지, `?` 전파, 도메인 `AppError`로 변환. 실제 프로젝트에서는 `AppError`에 `thiserror` 적용.

### 6.2 Spring Boot (Java 21 + WebClient 또는 RestTemplate)

```java
@RestController
@RequiredArgsConstructor
@Slf4j
public class TranscribeController {

    private final WebClient openAiClient; // baseUrl=https://api.openai.com, Bearer 헤더 사전 주입

    @PostMapping(value = "/api/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<TranscribeResponse> transcribe(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "language", required = false) String language) {

        if (file.getSize() > 25L * 1024 * 1024) {
            throw new PayloadTooLargeException("25MB 초과");
        }

        MultiValueMap<String, HttpEntity<?>> form = new LinkedMultiValueMap<>();
        form.add("file", new HttpEntity<>(file.getResource(),
                multipartHeaders(file.getOriginalFilename(), file.getContentType())));
        form.add("model", new HttpEntity<>("whisper-1"));
        form.add("language", new HttpEntity<>(language == null ? "ko" : language));
        form.add("response_format", new HttpEntity<>("json"));

        return openAiClient.post()
                .uri("/v1/audio/transcriptions")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .bodyValue(form)
                .retrieve()
                .bodyToMono(TranscribeResponse.class);
    }

    private HttpHeaders multipartHeaders(String filename, String contentType) {
        HttpHeaders h = new HttpHeaders();
        h.setContentDisposition(ContentDisposition.builder("form-data")
                .name("file").filename(filename).build());
        if (contentType != null) h.setContentType(MediaType.parseMediaType(contentType));
        return h;
    }

    public record TranscribeResponse(String text) {}
}
```

> Java 규칙: `record` 사용, `Optional` 매개변수 금지(여기선 `required=false`로 대체), `@Slf4j`, 도메인 예외 `PayloadTooLargeException` 정의.

### 6.3 Node + Express (formidable + undici)

```js
// package.json: "openai": "^4" 사용 시 더 간단하지만, 의존성 없이 raw fetch 패턴.
import express from 'express';
import { File, FormData } from 'undici';
import multer from 'multer';

const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });
const app = express();

app.post('/api/transcribe', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file required' });

    const form = new FormData();
    form.append('file', new File([req.file.buffer], req.file.originalname, { type: req.file.mimetype }));
    form.append('model', 'whisper-1');
    form.append('language', req.body.language ?? 'ko');
    form.append('response_format', 'json');

    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
    });
    if (!r.ok) return res.status(r.status).json(await r.json().catch(() => ({})));
    res.json(await r.json());
  } catch (e) { next(e); }
});
```

> 공식 `openai` Node SDK(v4+) 사용 시: `await client.audio.transcriptions.create({ file, model: 'whisper-1', language: 'ko' })` — `file`은 `fs.createReadStream` 또는 `File` 객체.

---

## 7. 한국어 정확도 향상 팁

1. **`language="ko"` 명시 필수.** 미지정 시 무음·짧은 클립을 영어/일본어로 오감지하는 사례 다수 보고됨.
2. **`prompt` 활용.** 도메인 어휘를 콤마 구분으로 나열. *whisper-1은 마지막 224토큰만 사용*하므로 너무 길게 쓰지 말 것.
   ```
   prompt: "꿈, 해몽, 자각몽, 반복몽, 악몽, 예지몽"
   ```
3. **녹음 품질**: 16kHz mono 이상, 노이즈 게이트 적용. WebM Opus 기본 설정이면 충분.
4. **너무 짧은 클립 회피**: 1초 미만은 빈 문자열 또는 환각 텍스트("시청해 주셔서 감사합니다") 반환 사례 있음.
5. **whisper-1 vs gpt-4o-transcribe**: 한국어를 포함한 다국어 정확도는 gpt-4o-transcribe가 평균 우수. 단, 자막·세그먼트가 필요하면 whisper-1.
6. **`temperature=0`** 유지 — 환각 줄임. 0 기본값 그대로면 충분.

> **주의:** prompt는 LLM처럼 지시문이 아니다. *어휘·문체 힌트* 용도로만 사용. "다음 오디오를 요약해주세요" 같은 문장은 무의미하거나 출력에 그대로 섞일 수 있다.

---

## 8. verbose_json 응답 활용

```json
{
  "task": "transcribe",
  "language": "korean",
  "duration": 13.2,
  "text": "오늘 꾼 꿈 이야기를 해드릴게요...",
  "segments": [
    {
      "id": 0,
      "seek": 0,
      "start": 0.0,
      "end": 3.5,
      "text": "오늘 꾼 꿈 이야기를 해드릴게요",
      "tokens": [50364, ...],
      "temperature": 0.0,
      "avg_logprob": -0.21,
      "compression_ratio": 1.4,
      "no_speech_prob": 0.02
    }
  ]
}
```

활용:
- `segments[].no_speech_prob > 0.6` → 무음 구간으로 간주하고 필터링
- `segments[].avg_logprob < -1.0` → 저신뢰 구간으로 분기 처리(재녹음 유도 등)
- `timestamp_granularities=["word"]` 추가 시 `words[]` 배열도 포함(word-level timestamps)

> **주의:** `verbose_json`·`timestamp_granularities`는 **whisper-1 전용**. gpt-4o-transcribe 계열에서는 400 반환.

---

## 9. 25MB 초과 대응 — 청크 분할

### 전략 비교

| 전략 | 위치 | 장점 | 단점 |
|------|------|------|------|
| Web Audio AudioContext | 브라우저 | 의존성 0, PWA 친화 | PCM 분할 → 인코딩(WAV) 필요, 압축률 낮음 |
| ffmpeg.wasm | 브라우저 | 정확한 시간 분할·임의 포맷 변환 | 번들 크기 25MB+, 초기 로드 느림 |
| 서버 측 ffmpeg | 백엔드 | 클라이언트 부담 0 | 서버 CPU·디스크 사용, 업로드 1회는 여전히 필요 |
| 저비트레이트 재인코딩 | 브라우저/서버 | 길이 제한이 사실상 사라짐(MP3 64kbps면 25MB ≈ 50분) | 압축 손실로 정확도 미세 저하 가능 |

### 권장 흐름

1. **먼저 비트레이트 낮추기**를 시도한다. 분할보다 단순하고 컨텍스트 보존에 유리.
2. 그래도 초과 시 *문장·문단 경계*에서 분할. 단순 시간 분할은 단어가 잘려 정확도 하락.
3. 분할 호출 시 **이전 청크의 `text` 끝 부분을 다음 청크의 `prompt`에 넣어** 문맥 연결. (whisper-1 권장 패턴)

```ts
// 의사 코드
let runningPrompt = '';
for (const chunk of chunks) {
  const { text } = await transcribe(chunk, { prompt: runningPrompt, language: 'ko' });
  results.push(text);
  runningPrompt = text.slice(-200); // 다음 청크 컨텍스트
}
```

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

2026-05-14 기준:

| 모델 | 분당 단가 | 1시간당 | 비고 |
|------|:---------:|:-------:|------|
| `whisper-1` | $0.006 | $0.36 | 기본 |
| `gpt-4o-transcribe` | $0.006 | $0.36 | 정확도 ↑ |
| `gpt-4o-mini-transcribe` | $0.003 | $0.18 | 절반 |
| `gpt-4o-transcribe-diarize` | 약 2.5배 | — | 화자 분리 |

월 1만 분(약 167시간) 사용 시 whisper-1 기준 약 $60. **클라이언트 호출량을 그대로 노출하면 비용 폭발 가능**하므로 백엔드에서 *사용자별 quota·rate limit*을 강제하라.

---

## 12. 흔한 함정 체크리스트

- [ ] **API 키를 프론트 번들에 박지 않았는가** (가장 흔한 사고)
- [ ] **Content-Type 헤더를 수동으로 박지 않았는가** (FormData 자동 설정)
- [ ] **Blob을 File로 감싸 확장자를 명시했는가**
- [ ] **`language="ko"` 명시했는가** (한국어는 자동 감지 부정확)
- [ ] **25MB 초과 시 분할·재인코딩 로직이 있는가**
- [ ] **모델 ↔ response_format 조합이 유효한가** (gpt-4o-transcribe + srt/verbose_json 조합 불가)
- [ ] **CORS**: 브라우저 직접 호출 시 OpenAI는 CORS preflight를 허용하지 않으므로 백엔드 프록시 필수
- [ ] **prompt를 LLM 지시문처럼 쓰지 않았는가** (어휘 힌트만)
- [ ] **무음·1초 미만 클립 필터링 했는가** (환각 텍스트 방지)
- [ ] **백엔드 quota·rate limit이 있는가** (비용 폭주 방지)

---

## 13. 사용 안 해야 할 때

- 오프라인 동작 필수 → Whisper.cpp WebAssembly 등 로컬 추론 솔루션
- 음성 데이터 외부 전송 금지 → 자체 호스팅 Whisper (OpenAI 정책상 API 입력은 학습에 사용 안 함이라 명시되어 있으나, *전송 자체*가 금지인 환경)
- 실시간 자막(<500ms 지연) → Realtime API(WebSocket) 또는 클라우드 스트리밍 STT(Google/Azure)
- 1초 미만 짧은 단어 인식만 필요 → 브라우저 Web Speech API가 더 적합
