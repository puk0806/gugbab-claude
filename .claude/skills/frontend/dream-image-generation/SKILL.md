---
name: dream-image-generation
description: >
  꿈 텍스트를 이미지로 생성하는 프론트엔드 패턴. OpenAI DALL-E 3/2 · Stability AI ·
  Google Imagen 4 API를 비교하고 한국어 프롬프트 처리, 안전 가드, 비용·지연,
  IndexedDB Blob 저장, 백엔드 프록시까지 다룬다.
  <example>사용자: "꿈 일기 텍스트를 DALL-E 3로 이미지화하고 싶다"</example>
  <example>사용자: "한국어 꿈 묘사를 어떻게 영어 시각화 프롬프트로 바꿔야 하나"</example>
  <example>사용자: "이미지 생성 결과를 IndexedDB에 어떻게 저장하나"</example>
---

# Dream Image Generation — 꿈 텍스트의 시각화

> 소스:
> - OpenAI Images API: https://developers.openai.com/api/docs/guides/image-generation
> - DALL-E 3 모델 문서: https://developers.openai.com/api/docs/models/dall-e-3
> - Stability AI API: https://platform.stability.ai/docs/api-reference
> - Google Imagen API: https://ai.google.dev/gemini-api/docs/imagen
> - OpenAI Usage Policies: https://openai.com/policies/usage-policies/
> 검증일: 2026-05-15
> 짝 스킬: `meta/dream-interpretation-prompt-engineering` (시각화 프롬프트 설계)
> 짝 에이전트: `validation/dream-image-safety-classifier` (안전 분류, 미생성 시 본 스킬 §6 가드라인으로 대체)

---

## 1. 언제 이 스킬을 쓰는가

| 상황 | 적합도 |
|------|:---:|
| 꿈 일기·꿈 해몽 앱의 시각화 기능 | ✅ |
| 사용자가 입력한 자유 텍스트를 이미지화 | ✅ |
| 의료·진단 목적의 정확한 시각화 | ❌ (모델이 보장 못 함) |
| 클라이언트에서 직접 OpenAI API 호출 | ❌ (§9 백엔드 프록시 필수) |

본 스킬은 **꿈 텍스트 → 이미지** 한정이다. 이미지 → 텍스트(Claude 비전 입력 등)는 다루지 않는다.

---

## 2. 제공자 비교 (2026-05 기준)

| 제공자 | 모델 | 1024×1024 가격 | 응답 시간 | 한국어 직접 입력 | 비고 |
|--------|------|----------------|----------|----------------|------|
| OpenAI | `dall-e-3` standard | $0.040 | 5~15초 | 약함 (영어 변환 권장) | 내부 자동 prompt revision |
| OpenAI | `dall-e-3` hd | $0.080 | 10~25초 | 동일 | 디테일·텍스처 우수 |
| OpenAI | GPT Image (`gpt-image-2`) | 별도 책정 | 가변 | 더 나음 | 모더레이션 `low/auto` |
| Stability AI | Stable Image Ultra | 8 credits ≈ $0.08 | 5~10초 | 영어 권장 | 신용 기반 |
| Stability AI | Stable Diffusion 3.5 Large | 6.5 credits ≈ $0.065 | 3~7초 | 영어 권장 | |
| Stability AI | SD 3.5 Medium | 3.5 credits ≈ $0.035 | 2~5초 | 영어 권장 | 저예산 |
| Google | `imagen-4.0-generate-001` | $0.04 | 3~8초 | 다국어 비교적 양호 | SynthID 워터마크 |
| Google | `imagen-4.0-fast-generate-001` | $0.02 | 2~5초 | 동일 | Batch 50% 할인 가능 |
| Replicate | stability-ai/stable-diffusion 등 | 모델별 | 2~10초 + 콜드스타트 | 모델별 | 폴링 또는 webhook |

> 주의: Stability AI 신용 환산은 1 credit = $0.01 기준이며, 모델·해상도에 따라 정확한 소비량은 공식 가격표를 다시 확인할 것.

---

## 3. OpenAI Images API — DALL-E 3 / DALL-E 2 / GPT Image

### 3.1 DALL-E 3 파라미터

```ts
// 백엔드(예: Next.js Route Handler)에서 호출 — 클라이언트 직접 호출 금지
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const result = await openai.images.generate({
  model: 'dall-e-3',
  prompt: '<영어로 변환된 시각화 프롬프트>',
  n: 1,                       // DALL-E 3는 1만 허용
  size: '1024x1024',          // '1024x1024' | '1792x1024' | '1024x1792'
  quality: 'standard',        // 'standard' | 'hd'
  style: 'vivid',             // 'vivid' | 'natural'
  response_format: 'url',     // 'url' | 'b64_json'
});

const imageUrl = result.data[0].url;
const revisedPrompt = result.data[0].revised_prompt; // OpenAI가 다시 쓴 프롬프트
```

**핵심 제약**
- `n`: DALL-E 3는 **1만 허용**. 여러 장 필요 시 요청을 반복.
- `size`: 위 3종만 허용 (정사각·풍경·인물). 임의 크기 금지.
- `response_format='url'` 응답 URL은 **1시간 후 만료** → 곧바로 다운로드/저장 권장.
- DALL-E 3는 입력 프롬프트를 자체적으로 풍부하게 다시 쓰며 그 결과를 `revised_prompt`로 반환한다. 그대로 두지 않고 그대로 쓰게 하려면 프롬프트 앞에 `"I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS:"` 같은 명시 지시를 넣는다 (OpenAI Cookbook 권장).

### 3.2 DALL-E 2 차이

| 항목 | DALL-E 2 |
|------|----------|
| `n` | 최대 10 |
| `size` | `256x256`, `512x512`, `1024x1024` |
| `quality` / `style` | 미지원 |
| 가격 | $0.020 (1024×1024), $0.018 (512×512), $0.016 (256×256) |
| 용도 | 저비용 변형(variation)·인페인팅(`images.edit`) |

### 3.3 GPT Image (신모델)

- 모델: `gpt-image-2`, `gpt-image-1.5`, `gpt-image-1`, `gpt-image-1-mini`
- 응답은 PNG/JPEG/WebP base64 (`output_format` + `output_compression`)
- 품질: `low | medium | high | auto`
- `moderation`: `auto` (기본) 또는 `low` (덜 제한적이지만 정책 위반 여전히 거부)

> 주의: GPT Image는 빠르게 진화 중이며 본 스킬 검증일(2026-05-15) 이후 파라미터가 추가될 수 있음. 신규 도입 시 공식 문서 재확인 필수.

---

## 4. Stability AI — Stable Image API

### 4.1 엔드포인트

| 엔드포인트 | 용도 |
|-----------|------|
| `POST https://api.stability.ai/v2beta/stable-image/generate/ultra` | 최고 품질 |
| `POST https://api.stability.ai/v2beta/stable-image/generate/core` | 비용 효율 |
| `POST https://api.stability.ai/v2beta/stable-image/generate/sd3` | SD 3.5 직접 |

### 4.2 요청 예시

```ts
// 백엔드에서 호출
const form = new FormData();
form.append('prompt', '<영어 시각화 프롬프트>');
form.append('aspect_ratio', '16:9'); // '1:1' | '16:9' | '9:16' | '3:4' | '4:3' 등
form.append('output_format', 'png'); // 'png' | 'jpeg' | 'webp'
form.append('negative_prompt', 'gore, weapons, violence');

const res = await fetch(
  'https://api.stability.ai/v2beta/stable-image/generate/core',
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: 'image/*',
    },
    body: form,
  },
);
const blob = await res.blob(); // PNG 바이너리 (Accept가 image/*인 경우)
```

`Accept: application/json`을 보내면 `{ image: '<b64>', finish_reason, seed }` 형태로 받는다.

### 4.3 안전·필터
- `negative_prompt`로 회피 키워드 지정 가능.
- `finish_reason: 'CONTENT_FILTERED'` 응답 시 결과 이미지가 검정으로 마스킹된다 — UI에서 빈 이미지 처리할 것.

---

## 5. Google Imagen 4

```ts
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const response = await ai.models.generateImages({
  model: 'imagen-4.0-generate-001',
  prompt: '<프롬프트>',
  config: {
    numberOfImages: 1,         // 1~4
    aspectRatio: '1:1',        // '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
    imageSize: '1K',           // '1K' | '2K'
    personGeneration: 'allow_adult', // 'dont_allow' | 'allow_adult' | 'allow_all'
  },
});
// response.generatedImages[i].image.imageBytes (base64)
```

**특이사항**
- 모든 생성 이미지에 **SynthID 워터마크**가 자동 삽입됨 — 꿈 일기 시각화 같은 개인용 콘텐츠에도 포함.
- `personGeneration: 'allow_all'`은 EU/UK/CH/MENA 지역에서 거부됨.
- Imagen 3는 deprecated. 신규 코드에서는 Imagen 4 변종을 사용한다.

---

## 6. 안전 가드 — 꿈 이미지 특유의 함정

꿈 텍스트는 **자해·폭력·성적 묘사**가 무의식적으로 섞이기 쉽다. 정책 위반 시 OpenAI는 요청 거부 또는 계정 제재까지 가능.

### 6.1 OpenAI Usage Policies 위반 카테고리 (요약)
- 폭력·고어·테러
- 자해·자살 권장 또는 그래픽 묘사
- 미성년자 관련 성적/폭력적 콘텐츠
- 실존 인물 명시 (특히 정치인·연예인)
- 저작권 캐릭터 직접 복제

### 6.2 2단계 사전 검사 (권장 패턴)

```
사용자 꿈 텍스트
    ↓
[1] Anthropic Claude(또는 OpenAI moderation API)로 의도 분류
    → "자해 묘사 포함" / "폭력적 장면" / "안전"
    ↓
[2] 위반 카테고리면 → 사용자에게 톤 변경 안내 + 이미지 생성 차단
   안전이면 → 시각화 프롬프트로 변환 후 이미지 API 호출
```

`validation/dream-image-safety-classifier` 에이전트 (생성 예정)가 이 1단계를 담당한다. 미생성 상태라면 `omni-moderation-latest` 또는 Claude `claude-haiku-4-5`로 직접 호출하는 폴백 코드를 둔다.

### 6.3 폴백 처리
- API가 `content_policy_violation`(OpenAI) / `CONTENT_FILTERED`(Stability) 반환 시:
  - 원본 꿈 텍스트는 그대로 보존하되, 시각화 프롬프트만 톤다운 한 버전을 1회 자동 재시도
  - 재시도도 실패하면 "이 꿈은 이미지로 표현하지 않는 게 좋겠습니다" UI 메시지

---

## 7. 한국어 프롬프트 처리

### 7.1 원칙
한국어 직접 입력은 가능하나 **영어 변환 후 호출이 정확도가 더 높다.** 검증된 패턴:

| 방식 | 정확도 | 비용 |
|------|:---:|:---:|
| 한국어 그대로 DALL-E 3 입력 | △ (사람·배경 누락 잦음) | 이미지 1회 |
| Claude(haiku/sonnet)로 한 → 영 시각화 프롬프트 변환 | ◎ | 텍스트 1회 + 이미지 1회 |
| `gpt-image-2`에 한국어 직접 입력 | ○ | 이미지 1회 |
| Imagen 4에 한국어 직접 입력 | ○ | 이미지 1회 |

> 주의: DALL-E 3는 비라틴 문자(한·중·일·아랍)를 이미지에 그려 넣으면 거의 깨진 글자(invented-glyph)가 나온다. 이미지 내 텍스트가 필요하면 영어로 적게 하거나 텍스트를 따로 SVG로 합성한다.

### 7.2 변환 프롬프트(짝 스킬 사용)

자세한 변환 규칙은 `meta/dream-interpretation-prompt-engineering` 스킬을 참조한다. 이 스킬에서는 호출 인터페이스만 고정한다:

```ts
async function koreanDreamToVisualPrompt(koreanDream: string): Promise<{
  englishPrompt: string;
  mood: string;          // e.g. 'surreal' | 'serene' | 'eerie'
  safety: 'safe' | 'sensitive' | 'blocked';
}> { /* Claude API 호출 */ }
```

---

## 8. 꿈 텍스트 → 시각화 프롬프트 변환 패턴

### 8.1 장면 추출 체크리스트
1. **주체** — 누가/무엇이 등장하는가 (사람·동물·사물)
2. **배경** — 공간 (방·바다·하늘·도시 등)
3. **시점** — 1인칭·3인칭·조감
4. **분위기** — surreal, dreamlike, eerie, serene, nostalgic
5. **색조** — 파스텔·모노톤·네온 등
6. **렌더링 스타일** — oil painting, watercolor, cinematic, anime, photorealistic

### 8.2 시각화 프롬프트 템플릿

```
A {style} {composition} of {subject} in {setting},
{mood} atmosphere, {color palette},
{lighting}, {camera/angle},
highly detailed, dreamlike quality.
```

예시 입력: "내가 끝없는 도서관에서 책을 찾는 꿈"
변환: `A surreal oil painting of a lone figure searching for a book in an infinite spiral library, dreamlike atmosphere, warm sepia palette, soft window light, low-angle wide shot, highly detailed, dreamlike quality.`

### 8.3 절대 넣지 말아야 할 키워드
- 실명·실존 인물 (예: "내 친구 김철수")  → "a young Asian man with short hair" 등 익명화
- 브랜드명·로고 (저작권 위반 위험)
- 폭력적 동사 ("죽이다", "찌르다") → 추상화하거나 제거

---

## 9. 백엔드 프록시 (필수)

**API 키를 절대 프론트엔드 번들에 포함하지 않는다.** `NEXT_PUBLIC_*`, `VITE_*` 변수도 빌드 시 클라이언트에 노출되므로 금지.

### 9.1 최소 구성 (Next.js App Router 예시)

```ts
// app/api/dream/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  // 1. 인증 — 세션/쿠키로 사용자 식별
  const userId = await requireUser(req);

  // 2. 입력 검증
  const { prompt } = await req.json();
  if (typeof prompt !== 'string' || prompt.length > 4000) {
    return NextResponse.json({ error: 'invalid prompt' }, { status: 400 });
  }

  // 3. 사용량 제한 (예: 사용자당 1일 20장)
  await assertQuota(userId, 'image_generation', 20);

  // 4. 안전 분류 (§6)
  const safety = await classifyDreamSafety(prompt);
  if (safety === 'blocked') {
    return NextResponse.json({ error: 'content_policy' }, { status: 422 });
  }

  // 5. 호출
  const result = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json',
  });

  return NextResponse.json({
    image: result.data[0].b64_json,
    revisedPrompt: result.data[0].revised_prompt,
  });
}
```

### 9.2 필수 방어선
| 항목 | 이유 |
|------|------|
| 인증 미들웨어 | 익명 사용자가 무한 호출하면 비용 폭주 |
| Rate limit (예: 사용자당 분당 5건) | 동일 |
| 입력 길이 제한 (DALL-E 3 권장 ≤ 4000자) | 모델 한계·악용 방지 |
| 응답 캐싱 헤더 금지 | API 응답 URL은 1시간 후 만료, 캐싱 무의미 |
| 로그에서 API 키 마스킹 | 운영 사고 시 유출 차단 |

---

## 10. 이미지 저장·캐싱

### 10.1 IndexedDB Blob 저장 (권장)

DALL-E URL은 1시간 후 만료되므로 **즉시 다운로드 후 IndexedDB에 Blob으로 저장**한다.

```ts
// b64_json → Blob
function b64ToBlob(b64: string, mime = 'image/png'): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// Dexie 예시 (짝 스킬 indexeddb-dexie 참조)
await db.dreamImages.add({
  id: dreamId,
  createdAt: Date.now(),
  blob: b64ToBlob(response.image),       // Blob 그대로 저장
  prompt: response.revisedPrompt,
  // ❌ 이 필드는 인덱스에 넣지 말 것 — 대용량 바이너리 인덱싱은 성능 저하
});

// 표시
const record = await db.dreamImages.get(dreamId);
const objectUrl = URL.createObjectURL(record.blob);
imgEl.src = objectUrl;
// 컴포넌트 unmount 시
URL.revokeObjectURL(objectUrl);
```

### 10.2 Blob vs base64 (dataURL)

| 항목 | Blob | base64 dataURL |
|------|------|----------------|
| 저장 크기 | 원본 그대로 | **+33% 증가** |
| CPU 비용 | 없음 | 인코딩/디코딩 매번 |
| 메모리 | 효율적 | 문자열 + 디코딩 시 추가 할당 |
| 표시 방법 | `URL.createObjectURL(blob)` | `<img src="data:image/png;base64,...">` |
| 권장 용도 | IndexedDB 저장, 표시 | 인라인 SVG, 작은 아이콘 |

**원칙**: IndexedDB에는 **Blob으로** 저장, 표시는 **objectURL**로. base64는 **인덱스 키나 검색 대상에 절대 넣지 않는다**.

### 10.3 메모리 누수 방지
- `URL.createObjectURL`로 만든 URL은 컴포넌트 cleanup에서 `URL.revokeObjectURL` 호출 필수.
- 한 화면에 동시에 표시하는 이미지가 많다면 가상화(react-virtuoso 등)로 DOM에서 제거된 항목의 objectURL도 같이 revoke.

---

## 11. 비용·지연 요약 (꿈 일기 앱 1일 1000사용자 가정)

| 시나리오 | 호출 수 | 모델 | 일일 비용 추정 |
|---------|--------|------|----------------|
| 모든 일기에 이미지 1장 | 1000 | DALL-E 3 standard | $40 |
| 모든 일기에 이미지 1장 | 1000 | Imagen 4 Fast | $20 (배치 시 $10) |
| 모든 일기에 이미지 1장 | 1000 | SD 3.5 Medium | ~$35 |
| 사용자가 명시 요청 시만 (20%) | 200 | DALL-E 3 hd | $16 |

지연(평균):
- DALL-E 3 standard: 5~15초, hd: 10~25초
- Imagen 4 Fast: 2~5초
- SD 3.5 Medium: 2~5초 (Stability 공식 인프라 기준, Replicate 콜드스타트는 +5~30초)

UI는 **항상 비동기 + 로딩 상태 + 재시도 가능**으로 설계한다.

---

## 12. 흔한 함정

1. **API 키를 `NEXT_PUBLIC_OPENAI_KEY`로 두는 실수** — 빌드 후 클라이언트에 그대로 박힘. §9 백엔드 프록시 강제.
2. **한국어 그대로 DALL-E 3에 입력** — 사람·세부묘사 누락 잦음. 영어 변환 거쳐라.
3. **응답 URL을 그대로 DB에 저장** — 1시간 후 깨진 이미지. 즉시 다운로드해 Blob 저장.
4. **base64 dataURL을 IndexedDB의 인덱스 필드로** — 인덱싱 비용 폭주. Blob을 비-인덱스 필드로.
5. **DALL-E 3에 `n: 4` 전달** — 400 에러. DALL-E 3은 `n=1` 고정.
6. **content policy 위반을 사용자 탓으로** — 꿈 텍스트는 자해/폭력이 자연스럽게 섞임. §6 자동 톤다운 + 친화적 안내 UI 필요.
7. **`URL.createObjectURL` revoke 누락** — 장시간 사용 시 메모리 누수.
8. **DALL-E 3가 다시 쓴 프롬프트(revised_prompt) 미저장** — 사용자가 "왜 다른 이미지가 나왔지?" 디버깅 불가. 항상 함께 저장.
9. **모든 사용자에 hd 강제** — 비용 2배. 사용자 요청 시에만 hd, 기본은 standard.
10. **Imagen 4 결과의 SynthID 워터마크 무인지** — 워터마크가 픽셀에 박혀 있음을 사용자에게 고지하는 게 안전.

---

## 13. 빠른 체크리스트 (구현 직전)

- [ ] API 키는 서버에만, `process.env.*`만 사용 (`NEXT_PUBLIC_*` 금지)
- [ ] 백엔드 라우트에 인증·rate limit·입력 길이 검증 적용
- [ ] 한국어 입력 → Claude로 영어 시각화 프롬프트 변환 단계 존재
- [ ] 시각화 프롬프트에 실명·브랜드명·폭력 동사 제거 로직
- [ ] OpenAI/Stability moderation 또는 `dream-image-safety-classifier` 호출
- [ ] 응답 b64_json → Blob 변환 후 IndexedDB 저장
- [ ] `revised_prompt` / `seed` / `model` / `cost` 메타데이터 함께 저장
- [ ] `URL.createObjectURL` revoke 패턴 적용
- [ ] 비용 모니터링 대시보드 (사용자별·일별)
- [ ] content_policy 거부 시 톤다운 1회 재시도 후 UX 안내
