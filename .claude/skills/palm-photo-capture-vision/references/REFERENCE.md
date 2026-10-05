## 3. 촬영 가이드 오버레이

### 3-1. 목적

가이드는 "예쁜 장식"이 아니라 **§5 리사이즈 후에도 손금선이 살아남을 화각을 강제**하는 장치다.
손이 프레임의 작은 일부만 차지하면, 축소 과정에서 선 정보가 먼저 사라진다.

| 규칙 | 값 |
|------|----|
| 손바닥이 차지해야 할 프레임 비율 | 짧은 변 기준 **70% 이상** |
| 가이드 형태 | 세로 방향 손바닥 실루엣(둥근 사다리꼴 중심) |
| 여백 | 손목·손가락 끝이 잘리지 않도록 가이드 바깥 8% 안전 여백 |
| 권장 거리 | 20~30cm (기기 최소 초점 거리 아래로 내려가면 오히려 흐려진다) |

### 3-2. 구현 — 오버레이는 장식, 안내는 라이브 리전

```tsx
<div className="relative">
  <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />

  {/* 시각 가이드: 스크린리더에는 노출하지 않는다 */}
  <svg
    viewBox="0 0 300 400"
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
  >
    {/* 바깥을 어둡게 + 가이드 내부만 투명하게 (evenodd) */}
    <path
      fillRule="evenodd"
      fill="rgba(0,0,0,0.45)"
      d="M0 0h300v400H0Z
         M150 30 c 45 0 70 30 70 80 v150 c0 60 -30 100 -70 100
         s -70 -40 -70 -100 V110 c0 -50 25 -80 70 -80 Z"
    />
    <path
      d="M150 30 c 45 0 70 30 70 80 v150 c0 60 -30 100 -70 100
         s -70 -40 -70 -100 V110 c0 -50 25 -80 70 -80 Z"
      fill="none"
      stroke={aligned ? '#22c55e' : '#ffffff'}
      strokeWidth={3}
      strokeDasharray={aligned ? undefined : '8 6'}
    />
  </svg>

  {/* 안내 문구: 실시간으로 바뀌므로 라이브 리전 */}
  <p role="status" aria-live="polite" className="absolute bottom-24 w-full text-center">
    {hint}
  </p>
</div>
```

> 위 `d` 속성은 **실루엣의 개형(schematic)**이다. 실제 제품에서는 디자이너가 그린 path로 교체한다.
> 손가락 5개를 정확히 그린 path는 프리뷰에서 오히려 정렬 스트레스를 높이므로, 손바닥 중심 영역만
> 감싸는 단순한 형태가 실무에서 더 잘 동작한다.

### 3-3. 안내 문구 — 상태에 따라 하나씩만

동시에 여러 경고를 띄우면 사용자는 아무것도 고치지 않는다. **우선순위 1개만** 노출한다.

```ts
// 우선순위: 어두움 > 흐림 > 과노출 > 정렬 > OK
function pickHint(q: QualityReport, aligned: boolean): string {
  if (q.tooDark)  return '조금 더 밝은 곳에서 찍어주세요';
  if (q.blurry)   return '손을 고정하고 다시 찍어주세요';
  if (q.blownOut) return '직사광선·조명을 피해 그늘에서 찍어주세요';
  if (!aligned)   return '손바닥을 가이드 안에 맞춰주세요';
  return '좋아요. 그대로 촬영해주세요';
}
```

- 조명 안내는 "밝게"가 아니라 **"직사광선을 피하고 그늘·간접광"**이 정확하다. 직사광선은 손금 골에
  강한 그림자를 만들어 오히려 선을 왜곡한다.
- 접근성: 저시력 사용자를 위해 정렬을 **필수 조건으로 만들지 않는다**. 정렬 미달이어도 촬영 버튼은
  활성 상태로 둔다(§4-1 원칙과 동일).

---

## 4. 촬영 품질 클라이언트 검증

### 4-1. 원칙 — 경고는 하되, 차단하지 않는다

| 원칙 | 이유 |
|------|------|
| 품질 미달은 **경고 + 재촬영 권유**, 촬영 버튼 비활성화는 금지 | 임계값은 기기·조명·피부톤에 따라 크게 달라진다. 오탐이 곧 "앱이 고장남" |
| 검증은 **다운샘플 이미지**에서 수행 | 원본 4K에서 픽셀 루프를 돌면 저사양 기기에서 프레임이 끊긴다 |
| "손인지 아닌지"는 클라이언트에서 판정하지 않는다 | 브라우저 휴리스틱(피부색 비율 등)은 조명·피부톤에 따라 편향된다. §6-3의 모델 게이트로 처리 |

### 4-2. 지표 3종

```ts
export interface QualityReport {
  meanLuma: number;         // 0~255
  laplacianVar: number;     // 클수록 선명
  clippedHighRatio: number; // 0~1, 날아간 하이라이트 비율
  tooDark: boolean;
  blownOut: boolean;
  blurry: boolean;
}

/** 프리뷰 프레임을 짧은 변 256px로 줄여 그레이스케일 배열로 만든다. */
async function toGray(source: ImageBitmapSource, targetShort = 256) {
  const bmp = await createImageBitmap(source, {
    imageOrientation: 'from-image',   // EXIF 회전 반영 (§5-4)
    resizeQuality: 'medium',
  });
  const scale = targetShort / Math.min(bmp.width, bmp.height);
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();

  const { data } = ctx.getImageData(0, 0, w, h);
  const gray = new Float32Array(w * h);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    // Rec.709 계수의 luma (감마 인코딩된 sRGB 값 기준 — 물리 휘도가 아니라 지각적 근사)
    gray[p] = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  return { gray, w, h };
}

/** variance of Laplacian — Pech-Pacheco et al. (ICPR 2000)의 초점 평가 지표. */
function laplacianVariance(gray: Float32Array, w: number, h: number): number {
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      // 4-이웃 라플라시안 커널 [[0,1,0],[1,-4,1],[0,1,0]]
      const v = gray[i - w] + gray[i + w] + gray[i - 1] + gray[i + 1] - 4 * gray[i];
      sum += v;
      sumSq += v * v;
      n++;
    }
  }
  if (n === 0) return 0;
  const mean = sum / n;
  return sumSq / n - mean * mean;   // E[X²] - (E[X])²
}

export async function assessQuality(source: ImageBitmapSource): Promise<QualityReport> {
  const { gray, w, h } = await toGray(source);

  let lumaSum = 0;
  let clippedHigh = 0;
  for (let i = 0; i < gray.length; i++) {
    lumaSum += gray[i];
    if (gray[i] >= 250) clippedHigh++;
  }
  const meanLuma = lumaSum / gray.length;
  const laplacianVar = laplacianVariance(gray, w, h);
  const clippedHighRatio = clippedHigh / gray.length;

  return {
    meanLuma,
    laplacianVar,
    clippedHighRatio,
    tooDark: meanLuma < 60,
    blownOut: clippedHighRatio > 0.08,
    blurry: laplacianVar < 100,
  };
}
```

### 4-3. 임계값은 "출발점"이지 정답이 아니다

> 주의: `blurry: laplacianVar < 100`의 100은 OpenCV 커뮤니티에서 널리 쓰이는 **관례적 출발값**이며,
> 원저 논문이 규정한 절대 기준이 아니다. 라플라시안 분산은 **이미지 크기·대비·피사체 텍스처에 따라
> 스케일이 달라진다.** 반드시 다음을 지킨다.
>
> 1. 위 코드처럼 **항상 같은 크기(짧은 변 256px)로 정규화**한 뒤 계산한다. 크기가 다르면 값 비교가 무의미하다.
> 2. 실제 기기·조명 샘플 30~50장으로 흐린 것/선명한 것의 분포를 찍어보고 임계값을 다시 잡는다.
> 3. 임계값은 **원격 설정(remote config)** 으로 뺀다. 앱 배포 없이 조정할 수 있어야 한다.

### 4-4. 성능

- 프리뷰 실시간 판정은 **200~400ms 스로틀**로 충분하다. 매 프레임 돌리면 발열·배터리 문제가 생긴다.
- `OffscreenCanvas`를 지원하지 않는 환경을 위해 `document.createElement('canvas')` 폴백을 둔다.
- 가능하면 Web Worker로 옮긴다(`createImageBitmap` + `OffscreenCanvas`는 워커에서 동작한다).

---

## 5. 캡처 파이프라인 (canvas → 리사이즈 → 압축)

### 5-1. Claude Vision 입력 스펙 (공식 문서 기준, 2026-09-10 확인)

| 항목 | 값 |
|------|----|
| 지원 포맷 | `image/jpeg`, `image/png`, `image/gif`, `image/webp` (애니메이션 미지원, 첫 프레임만 사용) |
| 이미지당 최대 크기 | **10 MB** (base64 기준, Claude API 직접 호출) / Amazon Bedrock·Google Cloud는 **5 MB** |
| 최대 픽셀 치수 | **8000×8000 px** |
| 요청당 이미지 수 | API 100장(200k 컨텍스트 모델) / 그 외 600장, claude.ai 20장. **21장 이상이면 이미지당 치수 제한이 강화**되어 각 변 2000px 이하 권장 |
| 요청 전체 크기 | Messages·Token Counting 엔드포인트 **32 MB** (초과 시 413 `request_too_large`) |
| 토큰 계산 | 28×28 픽셀 패치 1개 = 비주얼 토큰 1개 → `⌈width/28⌉ × ⌈height/28⌉` |
| 해상도 티어 | **표준**: 긴 변 1568px / 1568 토큰 · **고해상도**(Claude 4.7 이후 모델): 긴 변 2576px / 4784 토큰 |
| 이미지·텍스트 순서 | **이미지를 먼저, 텍스트를 나중에** 배치하는 것이 공식 권장 |
| 메타데이터 | Claude는 이미지 메타데이터를 **파싱하지도, 전달받지도 않는다**(EXIF로 방향을 알려줄 수 없다 → §5-4) |
| 보관 | 업로드 이미지는 **요청 처리 기간 동안만 존재하고 처리 후 자동 삭제**되며, 모델 학습에 사용되지 않는다(공식 FAQ) |

> 주의(과거 문서와의 불일치): 검색 상위에 남아 있는 구버전 문서·서드파티 글은 이미지당 한도를
> **5MB**로 적는다. 현재 공식 문서 기준으로 5MB는 **Bedrock·Google Cloud 한정**이며 Claude API
> 직접 호출은 10MB다. 어느 쪽이든 손 사진 1장은 압축 후 **1MB 미만**으로 만드는 것이 목표이므로
> 실무에서는 두 값 모두 여유롭게 만족한다.

### 5-2. 목표 크기 — "크게 보낼수록 좋다"가 아니다

한도(8000px·10MB) 안에 들어가더라도, 모델의 해상도 티어 한도를 넘으면 **서버에서 자동 축소**된다.
자동 축소는 지연만 늘리고 품질 이득은 없다. 따라서 **클라이언트에서 정확한 목표 크기로 미리 줄여 보낸다.**

공식 참조 구현(TypeScript, vision-coordinates 문서 원문):

```ts
/** 이미지가 소비하는 비주얼 토큰: 28×28 패치 1개당 1토큰. */
function countImageTokens(width: number, height: number): number {
  return Math.ceil(width / 28) * Math.ceil(height / 28);
}

/** Python round()와 동일한 banker's rounding. .5 동률에서 API와 결과를 맞추기 위해 필요. */
function roundTiesToEven(value: number): number {
  const floor = Math.floor(value);
  if (value - floor !== 0.5) return Math.round(value);
  return floor % 2 === 0 ? floor : floor + 1;
}

/**
 * Claude가 패딩 전에 이미지를 축소하는 크기.
 * 기본값은 표준 티어. 고해상도 티어 모델은 maxEdge = 2576, maxTokens = 4784.
 */
function resizedSize(
  width: number,
  height: number,
  maxEdge = 1568,
  maxTokens = 1568
): [number, number] {
  const fits = (w: number, h: number): boolean =>
    Math.ceil(w / 28) * 28 <= maxEdge &&
    Math.ceil(h / 28) * 28 <= maxEdge &&
    countImageTokens(w, h) <= maxTokens;

  if (fits(width, height)) return [width, height];
  if (height > width) {
    const [rh, rw] = resizedSize(height, width, maxEdge, maxTokens);
    return [rw, rh];
  }

  // 긴 변을 이진 탐색해 비율을 유지하면서 들어가는 최대 크기를 찾는다.
  const aspectRatio = width / height;
  let lo = 1;        // lo는 항상 fits
  let hi = width;    // hi는 절대 fits 안 함
  while (lo + 1 < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (fits(mid, Math.max(roundTiesToEven(mid / aspectRatio), 1))) lo = mid;
    else hi = mid;
  }
  return [lo, Math.max(roundTiesToEven(lo / aspectRatio), 1)];
}
```

세로 3:4 손바닥 사진 기준 목표 크기(위 구현으로 계산):

| 대상 모델 티어 | 목표 크기 (3:4 세로) | 비주얼 토큰 |
|---------------|--------------------|-----------|
| 표준 (예: Haiku 4.5) | 약 **952 × 1269** | 34 × 46 = 1564 |
| 고해상도 (Claude 4.7 이후 — 예: Sonnet 5, Opus 5) | 약 **1648 × 2197** | 59 × 79 = 4661 |

> 공식 문서의 대조 예시: 2000×1500 이미지는 표준 티어에서 **1269×952(1564토큰)**로 축소되고,
> 고해상도 티어에서는 축소되지 않는다(3888토큰). 위 표의 값은 참조 구현으로 계산한 것이므로,
> 제품에 박아 넣기 전에 **실제 캡처 종횡비로 `resizedSize()`를 한 번 돌려 확인**한다.

**파이프라인에 표준 티어 모델이 하나라도 섞여 있으면(예: §6-3의 저비용 게이트를 Haiku로 돌리면),
그 호출에는 표준 티어 크기로 보낸다.** 고해상도 크기를 표준 티어 모델에 보내면 서버가 다시 줄인다.
게이트와 해석에 다른 티어를 쓴다면 **두 크기를 각각 만들어 캐시**하는 것이 가장 단순하다.

> 손금선은 미세 디테일이므로, 비용이 허락하면 **해석 호출은 고해상도 티어 모델**을 쓴다.
> 다만 이는 "더 잘 보인다"는 뜻이지 "손금선을 정확히 판독한다"는 뜻이 아니다(§7-3).
> 고해상도 티어는 같은 이미지에 대해 최대 약 3배의 비주얼 토큰을 쓴다(공식 문서).

### 5-3. 캡처 → 리사이즈 → 압축

```ts
export async function captureForVision(
  video: HTMLVideoElement,
  opts: { maxEdge?: number; maxTokens?: number; quality?: number } = {}
): Promise<{ blob: Blob; width: number; height: number }> {
  const { maxEdge = 1568, maxTokens = 1568, quality = 0.9 } = opts;

  const sw = video.videoWidth;
  const sh = video.videoHeight;
  if (!sw || !sh) throw new Error('video frame not ready');

  const [tw, th] = resizedSize(sw, sh, maxEdge, maxTokens);

  const canvas = document.createElement('canvas');
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext('2d', { alpha: false })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';   // 큰 축소비에서 계단 현상을 줄인다
  ctx.drawImage(video, 0, 0, tw, th);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))),
      'image/jpeg',
      quality
    );
  });

  // toBlob은 지원하지 않는 type이면 조용히 PNG로 떨어진다(MDN). 무음 실패를 잡는다.
  if (blob.type !== 'image/jpeg') {
    console.warn('[capture] unexpected blob type:', blob.type, blob.size);
  }

  return { blob, width: tw, height: th };
}
```

**압축 품질 기준**

| 항목 | 권장 |
|------|------|
| 포맷 | `image/jpeg` (PNG 외에 인코딩이 가장 널리 지원됨). WebP는 인코딩 지원이 브라우저마다 달라 **결과 `blob.type`을 반드시 확인** |
| 품질 | **0.85 ~ 0.92**. 손금은 저대비 미세 선이라 강한 JPEG 압축의 블록 아티팩트가 선을 지운다 |
| 재압축 | **금지**. 압축된 이미지를 다시 디코딩→압축하면 아티팩트가 누적된다(공식 문서 경고: 다중 압축 패스는 모델 성능에 해롭다) |

> `toBlob`의 `quality`가 0~1 범위를 벗어나면 브라우저 기본값이 쓰인다(MDN). 0~100 스케일로 착각해
> `90`을 넘기는 실수가 잦다 — **0.9**가 맞다. 또한 MDN은 "지정하지 않았거나 지원하지 않는 type이면
> PNG가 쓰인다"고 명시하므로, `blob.type` 검증 없이 넘기면 수 MB PNG가 조용히 전송될 수 있다.

### 5-4. EXIF 회전 — 파일 업로드 경로의 1순위 버그

카메라 스트림 프레임은 회전 문제가 없지만, **갤러리에서 고른 사진은 EXIF Orientation이 붙어 있다.**
`<img>`나 `drawImage`로 그대로 그리면 90°/180° 돌아간 채 전송되고, Claude는 **메타데이터를 받지
않으므로**(공식 FAQ) 돌아간 이미지를 그대로 본다. 공식 문서도 회전된 이미지에서 오류·환각이
늘어난다고 경고한다.

```ts
export async function decodeUpright(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file, {
    imageOrientation: 'from-image',   // EXIF Orientation을 반영해 올바로 세운다 (기본값)
    // 'none'은 메타데이터를 무시한다 — 여기서는 절대 쓰지 않는다
  });
}
```

`imageOrientation` 허용값은 `'from-image'`(기본, EXIF 반영) / `'flipY'`(EXIF 반영 후 상하 반전) /
`'none'`(메타데이터 무시)이다(MDN).

### 5-5. Blob → base64

```ts
export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const CHUNK = 0x8000;   // 인자 스프레드 한도를 넘기면 RangeError가 난다
  for (let i = 0; i < buf.length; i += CHUNK) {
    binary += String.fromCharCode(...buf.subarray(i, i + CHUNK));
  }
  return btoa(binary);    // data: URL 접두사 없는 순수 base64
}
```

> Claude의 `source.data`에는 **`data:image/jpeg;base64,` 접두사를 넣지 않는다.** `FileReader.readAsDataURL`
> 결과를 그대로 넣는 실수가 가장 흔한 400 원인이다.
>
> base64는 원본 대비 약 **1.37배**로 부풀어 오른다(4/3 + 패딩). 10MB 한도는 **base64 인코딩 기준**이므로
> 원본 Blob 기준으로는 약 7.3MB가 상한이다. 목표는 1MB 미만이므로 실무에서는 문제되지 않는다.
> **한 대화에서 이미지를 여러 장 누적한다면** base64 대신 Files API(`file_id`)를 쓴다 — 멀티턴에서
> 매 요청마다 전체 이미지 바이트가 재전송되는 것을 막을 수 있다(공식 권장).

---

## 8. 파일 업로드 폴백

카메라를 못 쓰는 경로(권한 거부, 카메라 없음, 구형 WebView, 데스크톱)에서 **항상 동작해야 하는 경로**다.
폴백이 아니라 **동등한 1급 입력 수단**으로 취급한다.

```tsx
<label className="btn">
  사진 선택하기
  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    capture="environment"     /* 모바일에서 후면 카메라를 우선 요청 */
    className="sr-only"
    onChange={onPick}
  />
</label>
```

| 속성 | 값 | 설명 |
|------|----|------|
| `accept` | `image/jpeg,image/png,image/webp` | Claude 지원 포맷으로 좁힌다. HEIC 선택을 유도하지 않기 위해 `image/*` 대신 **명시 나열**을 권장 |
| `capture` | `"environment"`(후면) / `"user"`(전면) | `accept`가 image/video 타입을 지정할 때만 의미가 있다. 요청한 facing mode가 없으면 사용자 에이전트의 기본 모드로 폴백(MDN) |

**동작 특성**

- `capture`는 **모바일 전용에 가깝다.** 카메라가 전/후면으로 구분되지 않는 데스크톱 브라우저에서는
  일반 파일 선택기로 폴백된다. 이는 **정상 동작**이므로 별도 분기를 넣지 않는다.
- `capture`가 붙으면 **갤러리 선택 대신 카메라만 열리는** 브라우저가 있다. 갤러리 선택도 허용하려면
  `capture` 없는 두 번째 버튼("앨범에서 고르기")을 함께 둔다.
- iOS에서 촬영·선택한 사진이 **HEIC**로 전달될 수 있다. Claude는 HEIC를 지원하지 않으므로
  **반드시 canvas를 거쳐 JPEG로 재인코딩**한다(아래 코드가 그 역할을 겸한다).

```ts
async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  // 1) 과대 파일 조기 차단 (디코딩 전에 막아 메모리 폭주를 방지)
  if (file.size > 20 * 1024 * 1024) {
    setError('사진이 너무 커요. 다른 사진을 선택해주세요.');
    e.target.value = '';
    return;
  }

  let bmp: ImageBitmap;
  try {
    // 2) EXIF 회전 반영 + HEIC 등 미지원 포맷 조기 검출
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    setError('이 형식의 사진은 사용할 수 없어요. JPEG 또는 PNG로 다시 선택해주세요.');
    e.target.value = '';
    return;
  }

  try {
    // 3) 촬영 경로와 동일한 파이프라인으로 합류 (§5-3의 captureForVision과 같은 규칙)
    const [tw, th] = resizedSize(bmp.width, bmp.height /* , maxEdge, maxTokens */);
    const canvas = document.createElement('canvas');
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d', { alpha: false })!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, 0, 0, tw, th);

    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob null'))), 'image/jpeg', 0.9)
    );
    await submit(blob);
  } finally {
    bmp.close();
    e.target.value = '';   // 같은 파일 재선택 시 change 이벤트가 안 뜨는 문제 방지
  }
}
```

> `createImageBitmap`이 성공했다고 해서 안전한 이미지는 아니다. 서버에서도 **Content-Type·매직 넘버·
> 치수·용량을 재검증**한다. 클라이언트 검증은 UX용이지 보안 경계가 아니다.

---

## 9. 흔한 실수

| # | 실수 | 결과 | 해결 |
|---|------|------|------|
| 1 | `facingMode: { exact: 'environment' }` 사용 | 후면 카메라 없는 기기에서 `OverconstrainedError`로 기능 전멸 | `ideal` 사용 (§2-2) |
| 2 | `<video>`에 `playsinline` 누락 | iOS에서 프리뷰가 전체화면으로 튀며 오버레이가 사라짐 | `autoPlay muted playsInline` 3종 (§2-6) |
| 3 | 페이지 로드 즉시 `getUserMedia` 호출 | 맥락 없는 프롬프트 → 높은 거부율, 회복 불가 | 사용자 제스처 직후 호출 (§2-5) |
| 4 | 거부 후 "다시 시도" 버튼만 제공 | 프롬프트가 다시 안 떠서 아무 반응 없음 | 설정 안내 + 파일 폴백 병렬 노출 (§2-3) |
| 5 | `track.stop()` 누락 | 화면을 떠나도 카메라 표시등 유지 | 언마운트·백그라운드에서 정지 (§2-7) |
| 6 | 원본 4K를 그대로 전송 | 서버 축소로 지연만 증가, 품질 이득 없음 | `resizedSize()`로 사전 축소 (§5-2) |
| 7 | `toBlob(cb, 'image/jpeg', 90)` | quality 범위 밖 → 브라우저 기본값 사용 | `0.9` (§5-3) |
| 8 | `readAsDataURL` 결과를 `source.data`에 그대로 투입 | `data:` 접두사 때문에 400 | 순수 base64만 (§5-5) |
| 9 | EXIF 회전 미처리 업로드 | 90° 돌아간 손 → 오해석·환각 증가 | `imageOrientation: 'from-image'` (§5-4) |
| 10 | HEIC 파일을 그대로 전송 | 미지원 포맷 400 | canvas 경유 JPEG 재인코딩 (§8) |
| 11 | 품질 검증 실패 시 촬영 버튼 비활성화 | 오탐 1건이 기능 전체를 막음 | 경고만 하고 촬영은 허용 (§4-1) |
| 12 | 브라우저에서 피부색 휴리스틱으로 "손 여부" 판정 | 피부톤·조명에 따른 편향 | 모델 게이트로 처리 (§6-3) |
| 13 | 게이트와 해석을 한 호출로 합침 | 손 아닌 이미지에도 해석이 붙음 | 2단 분리 (§6-3) |
| 14 | 표준 티어 모델에 고해상도 크기 전송 | 서버 재축소로 지연·낭비 | 호출별 티어에 맞는 크기 (§5-2) |
| 15 | 브라우저에 API 키 노출 | 키 유출·과금 폭탄 | 서버 프록시 (§6-0) |
| 16 | 에러 리포터에 요청 body 첨부 | 손 사진이 제3자 서비스에 축적 | body 마스킹 (§7-2) |
| 17 | "AI가 손금선을 정밀 분석" 카피 | 과장 표현 + 모델 실제 능력과 불일치 | 한계 고지 (§7-3) |
| 18 | 결과에 건강·수명 언급 허용 | 의료 조언 오인 | 시스템 프롬프트 금지 + 출력 후 필터 (§6-2) |

---

## 10. 릴리즈 체크리스트

**기능**
- [ ] HTTPS(또는 localhost)에서만 촬영 UI 노출, 아니면 폴백 표시
- [ ] `getUserMedia` 7종 에러 전부 분기 처리 (§2-3)
- [ ] 거부 상태에서 파일 업로드 경로만으로 손금 보기 완주 가능
- [ ] 언마운트·백그라운드 진입 시 트랙 정지 확인 (카메라 표시등 소등)
- [ ] iOS Safari 실기기에서 프리뷰가 인라인 유지되는지 확인

**이미지**
- [ ] 전송 이미지가 목표 티어 크기와 정확히 일치 (`resizedSize` 결과와 대조)
- [ ] `blob.type === 'image/jpeg'` 검증 로그
- [ ] base64에 `data:` 접두사 없음
- [ ] EXIF 회전된 샘플 사진 4방향 모두 정상 방향으로 전송
- [ ] HEIC 원본 업로드가 JPEG로 재인코딩되어 성공

**모델**
- [ ] API 키가 클라이언트 번들에 없음 (빌드 산출물 grep으로 확인)
- [ ] 손 아닌 이미지(풍경·얼굴·손등·빈 화면) 5종에서 게이트가 거부하고 해석 호출이 발생하지 않음
- [ ] 게이트 JSON 파싱 실패 시 크래시 없이 재촬영 안내
- [ ] 흐린 이미지에서 모델이 "잘 보이지 않는다"고 답하는지 확인 (환각 여부 점검)

**개인정보·고지**
- [ ] 서버 어디에도 이미지가 기록되지 않음 (디스크·로그·APM·에러 리포터)
- [ ] 촬영 직전 화면에 전송·미보관 고지 노출
- [ ] Files API 사용 시 요청 완료 후 삭제 루틴 동작
- [ ] 결과 화면 한계 고지가 접기 없이 항상 노출
- [ ] 앱 스토어 설명·랜딩 카피에 §7-3 금지 표현 없음
- [ ] 개인정보처리방침에 제3자(모델 제공자) 전송 사실 기재
