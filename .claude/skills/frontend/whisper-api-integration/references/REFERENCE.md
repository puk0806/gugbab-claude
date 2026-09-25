### 5.1 브라우저에서 직접 호출 (보안 위험·데모 한정)

```ts
// ⚠️ 프로덕션에서 사용 금지. API 키가 클라이언트 번들에 노출된다.
async function transcribeFromBrowser(audioBlob: Blob): Promise<string> {
  const form = new FormData();
  // Blob에서 File 명시 — 일부 클라이언트는 확장자가 없으면 reject
  form.append('file', new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));
  form.append('model', 'gpt-transcribe');           // 2026-08 기준 권장 모델
  form.append('languages[]', 'ko');                 // 단수 language와 동시 전송 금지
  form.append('response_format', 'json');
  // 선택: 도메인 고유명사 힌트
  // form.append('keywords[]', '자각몽'); form.append('keywords[]', '예지몽');

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

  const data = await res.json() as { text: string; languages?: string[] };
  return data.text; // gpt-transcribe 응답은 text와 함께 감지된 languages를 반환
}
```

> **흔한 함정**:
> - `Content-Type` 헤더를 수동으로 박으면 multipart boundary가 사라져 400 반환. **헤더에 Content-Type 절대 명시 금지** (FormData가 자동 설정).
> - `Blob`을 그대로 append 하면 확장자 추론이 불가능해 "Unsupported file format" 발생 가능. **`new File([blob], 'name.ext', { type })` 로 감싸라.**
> - 브라우저 직접 호출은 **API 키 노출 + CORS**. 위 코드는 동작은 하지만 *데모/내부 도구* 한정. 외부 사용자 노출 시 백엔드 프록시 필수.

---

## 6. 백엔드 프록시 변형 — Rust(Axum) · Spring Boot · Node(Express)

> API 키를 서버에 보관하고, 클라이언트는 자사 도메인으로만 호출. CORS와 키 노출 동시 해결.

### 6.1 Rust + Axum (reqwest multipart)

```rust
// Cargo.toml: reqwest = { version = "0.12", features = ["json", "multipart"] }
use axum::{extract::Multipart, response::IntoResponse, Json};
use serde::Deserialize;
use reqwest::multipart::{Form, Part};

#[derive(Deserialize, serde::Serialize)]
struct TranscribeResp {
    text: String,
    #[serde(default)]
    languages: Vec<String>, // gpt-transcribe가 감지한 언어 목록
}

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
            Some("lang") => {
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
        .text("model", "gpt-transcribe")
        // languages[]가 단수 language를 대체한다 — 둘을 함께 보내면 안 된다
        .text("languages[]", language)
        .text("response_format", "json");

    let resp = reqwest::Client::new()
        .post("https://api.openai.com/v1/audio/transcriptions")
        .bearer_auth(api_key)
        .multipart(form)
        .send().await.map_err(|e| AppError::Upstream(e.to_string()))?
        .error_for_status().map_err(|e| AppError::Upstream(e.to_string()))?
        .json::<TranscribeResp>().await.map_err(|e| AppError::Upstream(e.to_string()))?;

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
            @RequestPart(value = "lang", required = false) String lang) {

        if (file.getSize() > 25L * 1024 * 1024) {
            throw new PayloadTooLargeException("25MB 초과");
        }

        MultiValueMap<String, HttpEntity<?>> form = new LinkedMultiValueMap<>();
        form.add("file", new HttpEntity<>(file.getResource(),
                multipartHeaders(file.getOriginalFilename(), file.getContentType())));
        form.add("model", new HttpEntity<>("gpt-transcribe"));
        // languages[]가 단수 language를 대체 — 둘 다 보내지 않는다
        form.add("languages[]", new HttpEntity<>(lang == null ? "ko" : lang));
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

    public record TranscribeResponse(String text, List<String> languages) {}
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
    form.append('model', 'gpt-transcribe');
    form.append('languages[]', req.body.lang ?? 'ko'); // 단수 language와 병용 금지
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

> 공식 `openai` SDK 사용 시: `await client.audio.transcriptions.create({ file, model: 'gpt-transcribe', response_format: 'json' })` — `file`은 `fs.createReadStream` 또는 `File` 객체.
> `keywords`/`languages`가 SDK 타입에 아직 없으면 공식 Cookbook 방식대로 `extra_body`(Python) 또는 raw multipart 필드로 전달한다:
>
> ```python
> result = client.audio.transcriptions.create(
>     model="gpt-transcribe",
>     file=audio,
>     prompt="A customer support call about billing.",
>     extra_body={"keywords": ["AC-42", "Premium Plus"], "languages": ["en", "fr"]},
> )
> ```

---

## 8. verbose_json 응답 활용 (whisper-1 전용)

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

> **주의:** `verbose_json`·`timestamp_granularities`는 **whisper-1 전용**이다. `gpt-transcribe`·`gpt-4o-transcribe` 계열에 요청하면 거부된다(400). 공식 마이그레이션 문서도 *"retain models with explicit support for word or segment timestamps"* 라며 whisper-1 존치를 지시한다. **세그먼트 신뢰도(`avg_logprob`·`no_speech_prob`) 기반 후처리 로직이 있다면 그 경로만 whisper-1로 남기고, 일반 전사는 `gpt-transcribe`로 분리하는 하이브리드 구성이 현실적이다.**

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

## 12. 흔한 함정 체크리스트

- [ ] **API 키를 프론트 번들에 박지 않았는가** (가장 흔한 사고)
- [ ] **Content-Type 헤더를 수동으로 박지 않았는가** (FormData 자동 설정)
- [ ] **Blob을 File로 감싸 확장자를 명시했는가**
- [ ] **언어 힌트를 명시했는가** (`gpt-transcribe`는 `languages: ["ko"]`, 레거시는 `language: "ko"`)
- [ ] **`language`와 `languages`를 동시에 보내지 않았는가** (마이그레이션 중 가장 흔한 실수)
- [ ] **모델 ID가 현행인가** (신규 코드에 `whisper-1`·`gpt-4o-transcribe` 하드코딩 → `gpt-transcribe`로)
- [ ] **25MB 초과 시 분할·재인코딩 로직이 있는가**
- [ ] **모델 ↔ response_format 조합이 유효한가** (`gpt-transcribe`·gpt-4o-transcribe + srt/vtt/verbose_json 조합 불가)
- [ ] **`gpt-live-transcribe`를 파일 업로드 엔드포인트에 쓰지 않았는가** (realtime 전용)
- [ ] **CORS**: 브라우저 직접 호출 시 OpenAI는 CORS preflight를 허용하지 않으므로 백엔드 프록시 필수
- [ ] **prompt를 LLM 지시문처럼 쓰지 않았는가** (어휘 힌트만)
- [ ] **무음·1초 미만 클립 필터링 했는가** (환각 텍스트 방지)
- [ ] **백엔드 quota·rate limit이 있는가** (비용 폭주 방지)

---

## 14. whisper-1 / gpt-4o-transcribe → gpt-transcribe 마이그레이션

공식 Cookbook 지침 원문: *"Recorded meetings, calls, or uploaded audio: migrate `whisper-1` to `gpt-transcribe`."*

### 전환 체크리스트

| 항목 | 기존 | 전환 후 |
|------|------|---------|
| `model` | `whisper-1` / `gpt-4o-transcribe` | `gpt-transcribe` |
| 언어 지정 | `language: "ko"` | `languages: ["ko"]` (**기존 필드 삭제**) |
| 어휘 힌트 | `prompt: "자각몽, 예지몽, ..."` | `keywords: ["자각몽", "예지몽"]` + `prompt`는 상황 설명으로 |
| `response_format` | `verbose_json` / `srt` / `vtt` | **전환 불가** — 해당 경로는 whisper-1 유지 |
| 타임스탬프 | `timestamp_granularities` | **전환 불가** — whisper-1 유지 |
| 번역(→영어) | `/v1/audio/translations` | **전환 불가** — whisper-1 + translations 엔드포인트 유지 |
| 화자 분리 | — | `gpt-4o-transcribe-diarize` + `diarized_json` |
| 단가 | $0.006/min | $0.0045/min (−25%) |

### 안전한 전환 순서

1. **응답 파싱 코드부터 점검.** `response_format`을 그대로 두고 모델만 바꾸면 400이 난다. 공식 경고: *"do not assume the same `response_format` remains valid."*
2. `segments[]`·`words[]`를 소비하는 코드가 있는지 grep. 있으면 **그 경로는 whisper-1로 남긴다**(하이브리드).
3. `language` → `languages` 교체. **둘을 동시에 보내지 않도록** 기존 라인을 반드시 제거.
4. `prompt`의 콤마 나열 어휘를 `keywords` 배열로 이전.
5. 소량 트래픽으로 A/B 후 전체 전환. 한국어 샘플로 실제 WER을 직접 비교하라.

> **주의:** 이 마이그레이션 절차는 공식 Cookbook 문서 기준으로 작성했으나, **실 API 호출로 검증하지 않았다.** 전환 전 소량 샘플로 반드시 직접 확인하라.
