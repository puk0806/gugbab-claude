---
name: palm-photo-capture-vision
user-invocable: false
description: >
  손금 앱의 손바닥 사진 촬영 → 전송 파이프라인 전체 패턴. getUserMedia 후면 카메라 지정,
  맥락적 권한 요청 UX, iOS Safari 제약, 촬영 가이드 오버레이, 클라이언트 품질 검증(흐림·밝기),
  canvas 캡처 → Claude Vision 티어별 최적 리사이즈·압축 → base64/Blob, 이미지+프롬프트 구조,
  손이 아닌 이미지 거부 게이트, 손금 판독 한계 정직 고지, 손 사진 개인정보 취급(원본 미보관),
  input[type=file] capture 폴백을 다룬다.
  <example>사용자: "손금 앱에서 후면 카메라로 손바닥을 찍는 화면을 만들어줘"</example>
  <example>사용자: "찍은 손 사진을 Claude Vision에 보내기 전에 얼마로 리사이즈해야 해?"</example>
  <example>사용자: "손이 아닌 사진을 올렸을 때 거부하는 흐름은 어떻게 짜?"</example>
---

# 손바닥 사진 촬영 · Vision 전달 (Palm Photo Capture & Vision)

> 소스:
> - Claude Vision(공식): https://platform.claude.com/docs/en/build-with-claude/vision
> - Claude 이미지 리사이즈 규칙·참조 구현(공식): https://platform.claude.com/docs/en/build-with-claude/vision-coordinates
> - Claude API 요청 크기 제한(공식): https://platform.claude.com/docs/en/api/overview#request-size-limits
> - MDN `MediaDevices.getUserMedia()`: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
> - MDN `MediaStreamTrack.applyConstraints()`: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/applyConstraints
> - MDN `HTMLCanvasElement.toBlob()`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
> - MDN `createImageBitmap()`: https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap
> - MDN `<input type="file">` / `capture`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file
> - 개인정보 보호법 제23조·시행령 제18조 (법제처 찾기쉬운 생활법령정보): https://www.easylaw.go.kr/CSP/CnpClsMain.laf?csmSeq=1257&ccfNo=2&cciNo=3&cnpClsNo=1
> - Britannica "Palmistry": https://www.britannica.com/topic/palmistry
> - Pech-Pacheco et al., *Diatom autofocusing in brightfield microscopy: a comparative study* (ICPR 2000) — variance-of-Laplacian 원저
>
> 검증일: 2026-09-10
>
> 짝 스킬 (상호 참조):
> - `frontend/dream-app-onboarding` — **맥락적 권한 요청 시점** 패턴의 원본. 본 스킬은 "카메라 권한을
>   *언제* 요청하는가"를 그 패턴에 그대로 맞추고, 카메라 고유의 구현(트랙 제약·에러 매핑)만 다룬다.
> - `humanities/palmistry-limitations` — 손금의 학술적 지위·예측력 한계 서술과 "재미로 보는" 한 줄 고지.
>   본 스킬은 *UI에서 어떻게 고지하는가*만 다루고, 고지 문구의 내용적 근거는 짝 스킬을 인용한다.
>
> 위 humanities 스킬이 아직 없는 저장소라면, 본 스킬 §7의 고지 원칙만으로도 동작한다.

---

## 0. 언제 사용 / 사용하지 않을지

| 상황 | 적합 |
|------|:---:|
| 손금·손 사진을 웹(모바일 브라우저·WebView)에서 촬영해 멀티모달 모델에 보내는 화면 | ✅ |
| 손 외 신체 부위·사물을 찍어 Vision에 보내는 일반 촬영 화면 (§1~§5·§9 재사용) | ✅ |
| 촬영 없이 갤러리 업로드만 지원 | △ (§2~§4 생략, §5·§6·§8만 사용) |
| 네이티브 앱(iOS/Android SDK)의 카메라 화면 | ❌ (웹 API 전제. 파이프라인 §5·§6 개념만 참고) |
| 손금으로 **건강·질병을 판정**하는 기능 | ❌ (§7 금지 사항. 설계 자체를 중단) |
| 손바닥으로 **본인 인증·식별**을 하는 기능 | ❌ (§7. 민감정보 처리로 성격이 바뀌며 본 스킬 범위 밖) |

---

## 1. 전체 파이프라인

```
[권한 요청 시점 판단]  ← 맥락적 요청 (dream-app-onboarding 패턴)
        ↓
[getUserMedia({video:{facingMode:{ideal:'environment'}}})]
        ↓ 실패(NotAllowedError / NotFoundError / 미지원)
        ├──────────────────────────────→ [input[type=file] capture 폴백]  §8
        ↓
[<video autoplay muted playsinline> 프리뷰 + 가이드 오버레이]  §3
        ↓
[셔터] → canvas drawImage → 원본 프레임
        ↓
[클라이언트 품질 검증: 밝기 / 흐림 / 클리핑]  §4   ── 실패 → 재촬영 안내(차단 아님)
        ↓
[티어별 목표 크기로 리사이즈 → JPEG 압축 → Blob]  §5
        ↓
[서버 프록시로 POST (API 키는 절대 브라우저에 두지 않음)]
        ↓
[① 손 여부 게이트 (저비용 모델, JSON)]  §6-3 ── 손 아님 → 거부 UI
        ↓
[② 해석 요청 (이미지 → 텍스트 순서)]  §6-1
        ↓
[결과 + 한계 고지]  §7
```

---

## 2. 카메라 접근 (getUserMedia)

### 2-1. 전제 조건 — 이걸 놓치면 원인 없이 실패한다

| 조건 | 내용 |
|------|------|
| **보안 컨텍스트** | HTTPS / `localhost` / `file://`에서만 동작. 아니면 `navigator.mediaDevices` 자체가 `undefined` (MDN) |
| **Permissions Policy** | 적용 디렉티브는 `camera`. 예: `Permissions-Policy: camera=(self)` |
| **iframe 내부** | `<iframe src="..." allow="camera">` 없으면 `NotAllowedError` |

```ts
// 기능 탐지는 optional chaining으로. mediaDevices가 아예 없는 경우가 실제로 존재한다.
const cameraSupported =
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia;
```

### 2-2. 후면 카메라 지정 — `ideal`을 쓰고 `exact`는 쓰지 않는다

```ts
const constraints: MediaStreamConstraints = {
  audio: false,                       // 손금 촬영에 마이크는 불필요 → 권한 프롬프트를 줄인다
  video: {
    facingMode: { ideal: 'environment' },  // 후면 "선호". 없으면 전면으로라도 진행
    width:  { ideal: 1920 },
    height: { ideal: 1440 },
  },
};

const stream = await navigator.mediaDevices.getUserMedia(constraints);
```

- `{ exact: 'environment' }`는 **요구 사항**이라 후면 카메라가 없는 기기(데스크톱 웹캠, 일부 태블릿)에서
  `OverconstrainedError`로 즉시 거부된다 (MDN). 손금 촬영은 전면 카메라로도 가능하므로 `ideal`이 맞다.
- `exact`를 쓸 거라면 반드시 `OverconstrainedError` → `ideal` 재시도 → 폴백의 3단 흐름을 갖춘다.
- `audio: true`를 같이 넣으면 마이크 권한까지 묶여 거부율이 오른다. **필요한 장치만 요청한다.**

> 주의: 촬영 해상도(`width`/`height`)를 무한정 높여도 §5에서 어차피 축소된다. `ideal` 1920 정도면
> 표준 티어 목표(952×1269)의 약 1.5배 이상이라 리샘플링 여유가 충분하다.

### 2-3. 에러 매핑 — 사용자에게 다른 문구를 보여야 한다

MDN이 정의한 예외를 그대로 분기한다. `err.name`으로 판정한다.

| `err.name` | 원인 | 사용자 문구 / 다음 행동 |
|-----------|------|------------------------|
| `NotAllowedError` | 사용자가 거부 / 비보안 컨텍스트 / Permissions Policy 차단 | "카메라 권한이 꺼져 있어요" + **OS·브라우저 설정 경로 안내** + 파일 업로드 폴백 |
| `NotFoundError` | 조건을 만족하는 트랙 없음(카메라 없음) | 폴백으로 즉시 전환 (재시도 버튼 노출 안 함) |
| `NotReadableError` | OS/브라우저/다른 앱이 장치를 점유 | "다른 앱이 카메라를 쓰고 있어요. 종료 후 다시 시도" + 재시도 |
| `OverconstrainedError` | 제약 조합 불가 (`err.constraint`에 원인 제약명) | 제약을 완화해 **1회 자동 재시도** 후 실패 시 폴백 |
| `SecurityError` | 해당 Document에서 미디어 지원이 비활성화됨 | 폴백 |
| `TypeError` | 제약이 비었거나 전부 `false`, 또는 비보안 컨텍스트 호출 | **개발 버그**. 사용자 문구 대신 에러 리포팅 |
| `AbortError` | 접근은 허용됐으나 다른 문제로 장치 사용 불가 | 재시도 + 폴백 |

```ts
type CameraFailure =
  | { kind: 'denied' }      // 설정 안내가 필요
  | { kind: 'unavailable' } // 폴백으로 직행
  | { kind: 'busy' }        // 재시도가 의미 있음
  | { kind: 'bug'; error: unknown };

function classifyCameraError(err: unknown): CameraFailure {
  const name = (err as DOMException | undefined)?.name;
  switch (name) {
    case 'NotAllowedError':      return { kind: 'denied' };
    case 'NotFoundError':
    case 'SecurityError':
    case 'OverconstrainedError': return { kind: 'unavailable' };
    case 'NotReadableError':
    case 'AbortError':           return { kind: 'busy' };
    default:                     return { kind: 'bug', error: err };
  }
}
```

> **거부(`NotAllowedError`) 이후에는 재요청해도 프롬프트가 다시 뜨지 않는다.** 브라우저가 결정을
> 기억하기 때문이다. "다시 시도" 버튼만 두면 아무 일도 일어나지 않는 것처럼 보인다. 반드시
> *설정에서 켜는 방법*을 안내하고, 동시에 파일 업로드 폴백(§8)을 같은 화면에 노출한다.

### 2-4. 권한 상태 사전 조회 — 하되, 의존하지 않는다

```ts
async function peekCameraPermission(): Promise<PermissionState | 'unknown'> {
  try {
    // 'camera'는 브라우저마다 지원 여부가 다르다. 미지원이면 query가 TypeError로 reject된다(MDN).
    const status = await navigator.permissions?.query({ name: 'camera' as PermissionName });
    return status?.state ?? 'unknown';
  } catch {
    return 'unknown';   // 조회 불가 = 권한 없음이 아니다. 그대로 진행한다.
  }
}
```

> 주의: Permissions API의 `camera` 이름은 **모든 브라우저가 지원하지 않는다**(MDN: 미지원 이름은
> `TypeError`로 reject). `'unknown'`을 "거부"로 해석해 촬영 버튼을 비활성화하면, 실제로는 정상
> 동작하는 기기에서 기능이 통째로 막힌다. 조회 결과는 **UI 힌트로만** 쓰고 판정은 `getUserMedia`
> 호출 결과로 한다.

### 2-5. 맥락적 권한 요청 UX

`dream-app-onboarding`의 원칙을 카메라에 그대로 적용한다: **온보딩에서 미리 요청하지 않고,
사용자가 "손금 보기"를 누른 직후에 요청한다.**

```
[홈] "손금 보기" 탭
   ↓
[사전 설명 화면]  ← 브라우저 프롬프트 전에 우리가 먼저 띄우는 화면
   · 왜 카메라가 필요한지 한 줄
   · 사진이 어떻게 처리되는지 한 줄 (§7-2의 원본 미보관 원칙)
   · [카메라 켜기]  [사진 선택하기]   ← 폴백을 동등한 선택지로 병렬 배치
   ↓ (사용자가 [카메라 켜기]를 누른 그 순간에만)
[브라우저 권한 프롬프트]
```

- **핵심**: 브라우저 프롬프트는 **사용자 제스처 직후**에만 띄운다. 페이지 진입 시 자동 호출은
  거부율을 크게 올리고, 한번 거부되면 되돌릴 방법이 설정 안내밖에 없다.
- 사전 설명 화면에서 사용자가 "사진 선택하기"를 고르면 **프롬프트를 아예 띄우지 않는다.**
- 거부는 정상적인 선택지다. 거부 후에도 앱의 핵심 기능(업로드 경로)이 그대로 동작해야 한다.

### 2-6. iOS Safari / WKWebView 제약

| 제약 | 대응 |
|------|------|
| `<video>`에 `playsinline`이 없으면 전체화면 전환 | `<video autoplay muted playsinline>` **세 속성 모두** 필수 |
| `muted` 없이는 자동재생이 차단될 수 있음 | 손금 촬영에 소리는 불필요 → 항상 `muted` |
| WKWebView는 iOS 14.3 이상에서만 `getUserMedia`가 노출된다. 호스트 앱이 카메라 사용 설명(`NSCameraUsageDescription`)과 인라인 재생 설정을 갖춰야 한다 | 앱 내 웹뷰 배포 시 네이티브 측 설정을 체크리스트에 포함. 미충족 시 §8 폴백 |
| iOS의 Chrome·Firefox는 WebKit 기반이라 Safari와 동일한 제약을 상속한다 | "Safari로 열어주세요" 안내는 대개 무의미. 폴백으로 처리 |
| 후면 멀티 렌즈 기기에서 렌즈가 임의 전환돼 초점·화각이 흔들리는 사례가 보고됨 | 촬영 직전 `track.getSettings()`로 실제 해상도를 확인하고, 화면 안내로 "손을 20~30cm 거리에" 고정 유도 |

```tsx
<video
  ref={videoRef}
  autoPlay
  muted
  playsInline           // ← React에서는 camelCase. 빠지면 iOS에서 전체화면으로 튄다
  className="h-full w-full object-cover"
/>
```

### 2-7. 정리는 반드시 한다

```ts
useEffect(() => {
  return () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
}, []);
```

`track.stop()`을 빼먹으면 화면을 벗어나도 카메라 표시등이 켜져 있다. 신뢰를 가장 빠르게 잃는 버그다.
`visibilitychange`로 백그라운드 진입 시에도 정지하고, 복귀 시 재요청하는 것을 권장한다.

### 2-8. 토치·초점 제약은 "있으면 쓴다"

```ts
const track = stream.getVideoTracks()[0];
const caps = track.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined;

if (caps?.torch) {
  try {
    // 표준 MediaTrackConstraints에 없는 확장 제약이라 타입 단언이 필요하다
    await track.applyConstraints({ advanced: [{ torch: true }] } as MediaTrackConstraints);
  } catch {
    // OverconstrainedError 등 — 조명 없이도 촬영 흐름은 계속되어야 한다
  }
}
```

> 주의: `torch`·`focusMode`·`zoom`은 **표준 `MediaTrackConstraints`의 필수 항목이 아니며 모든
> 브라우저가 지원하지 않는다**(특히 iOS Safari). `getCapabilities()`로 존재를 확인하고
> `applyConstraints()`는 `OverconstrainedError`로 reject될 수 있으므로 반드시 `try/catch`로 감싼다.

---

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

## 6. Claude Vision 전달 패턴

### 6-0. API 키는 브라우저에 두지 않는다

```
[브라우저] --multipart/form-data--> [자사 서버(BFF)] --Authorization--> [Claude API]
```

`ANTHROPIC_API_KEY`를 `NEXT_PUBLIC_*`·`VITE_*` 등으로 노출하면 번들에 그대로 박힌다. 촬영 화면은
서버 엔드포인트(예: `POST /api/palm/read`)에만 이미지를 보내고, 모델 호출·프롬프트·모델명은
전부 서버에 둔다. 서버에서 **요청당 이미지 1장·크기 상한·rate limit**을 강제한다.

### 6-1. 요청 구조 — 이미지 먼저, 텍스트 나중

```ts
const message = await anthropic.messages.create({
  model: 'claude-sonnet-5',      // 고해상도 티어 (Claude 4.7 이후)
  max_tokens: 1500,
  system: PALM_SYSTEM_PROMPT,    // 역할·금지사항·출력 형식은 system에
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64,          // data: 접두사 없음
          },
        },
        {
          type: 'text',
          text: '위 손바닥 사진을 보고 아래 형식으로 작성해줘.\n' + READING_INSTRUCTION,
        },
      ],
    },
  ],
});
```

- **이미지 → 텍스트 순서**가 공식 권장이다. 텍스트를 먼저 두어도 동작하지만 이미지 우선이 더 낫다.
- 이미지를 여러 장(예: 좌·우손) 보낼 때는 각 이미지 앞에 `"Image 1:"`, `"Image 2:"` 같은 **텍스트
  라벨 블록**을 넣어 프롬프트에서 지칭할 수 있게 한다(공식 권장).
- 멀티턴에서 이전 이미지를 다시 첨부할 필요는 없다. 모델은 이전 턴의 이미지에 계속 접근한다.

### 6-2. 시스템 프롬프트 — 과장 금지를 프롬프트 수준에서 박는다

```ts
const PALM_SYSTEM_PROMPT = `
당신은 손금(수상학) 전통을 소개하는 안내자입니다.

[사실 관계]
- 손금은 과학적으로 검증된 예측 체계가 아니라 문화적·민속학적 전통입니다.
- 당신은 사진에서 손의 전반적인 형태와 뚜렷한 주름의 대략적인 방향 정도만 알아볼 수 있습니다.
  선의 정확한 개수·길이·교차점·미세한 갈래를 정밀하게 측정할 수는 없습니다.

[금지]
- 선의 길이나 위치로 수명·질병·사망 시기를 말하지 마세요.
- 건강 상태를 진단하거나 의료적 조언을 하지 마세요.
- 사진 속 인물이 누구인지 추정하거나 신원·나이·인종을 단정하지 마세요.
- 실제로 보이지 않는 선을 보이는 것처럼 서술하지 마세요.
  확신이 없으면 "이 사진에서는 잘 보이지 않는다"고 그대로 쓰세요.

[출력]
- 각 서술 앞에 근거가 된 관찰을 먼저 쓰고, 그 다음 전통적 해석을 붙이세요.
- 전통적 해석에는 "수상학 전통에서는 ~라고 봅니다" 형태를 사용하세요.
`.trim();
```

**왜 이렇게까지 하는가** — 공식 문서가 명시한 Vision 한계:

| 공식 한계 | 손금 앱에서의 의미 |
|-----------|------------------|
| 낮은 품질·회전된 이미지·200px 미만의 매우 작은 이미지에서 **환각·오류 가능** | 흐린 손 사진에 대해 그럴듯한 선 묘사를 지어낼 수 있다 |
| 좌표·위치 추정 출력은 **근사값** | "생명선이 손목에서 3cm" 같은 정량 서술은 신뢰할 수 없다 |
| 개수 세기는 **근사값**, 특히 작은 객체가 많을 때 부정확 | 잔주름 개수·갈래 수 서술은 부정확하다 |
| **인물 식별 불가·거부**(AUP) | 손 사진은 얼굴이 아니지만, 신원 추정을 요구하는 프롬프트는 넣지 않는다 |
| 의료 영상 해석용으로 설계되지 않았고 **전문 의료 조언·진단을 대체할 수 없음** | 건강 관련 서술은 전면 금지 |
| **고위험 용도는 사람 검토 없이 사용 금지** | 해석 결과를 사용자의 의사결정 근거로 제시하지 않는다 |

### 6-3. 손이 아닌 이미지 거부 — 2단 게이트

한 번의 호출에 "손인지 판별"과 "해석"을 같이 시키면, 모델이 손이 아닌 이미지에도 해석을 붙이려는
경향이 생긴다. **분리한다.**

```ts
const GATE_INSTRUCTION = `
이 이미지에 사람의 손바닥(손금 면)이 찍혀 있는지 판정해줘. 아래 JSON만 출력해.
{
  "isPalm": boolean,        // 손바닥 면이 명확히 보이면 true
  "side": "left" | "right" | "unknown",
  "coverage": "full" | "partial" | "none",   // 손바닥이 프레임에 온전히 담겼는지
  "issues": string[],       // "blurry" | "too_dark" | "back_of_hand" | "not_a_hand" | "obscured"
  "reason": string          // 한국어 한 문장
}
판정이 애매하면 isPalm은 false로 하고 reason에 이유를 써.
`.trim();

// 1단계: 저비용 모델로 게이트. 이미지는 표준 티어 크기(952×1269)로 보낸다.
const gate = await anthropic.messages.create({
  model: 'claude-haiku-4-5',   // 표준 티어 → 이미지도 표준 티어 크기로
  max_tokens: 300,
  messages: [{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Standard } },
      { type: 'text', text: GATE_INSTRUCTION },
    ],
  }],
});
```

- JSON 형태를 확실히 고정해야 한다면 **structured outputs 또는 tool use**로 스키마를 강제한다.
  프롬프트로만 JSON을 요구하면 앞뒤에 설명 문장이 붙는 경우가 있으므로, 파싱은 반드시
  `try/catch` + 스키마 검증(zod 등)으로 감싸고 실패 시 "다시 촬영" 경로로 보낸다.
- **`isPalm === false`이면 해석 호출을 아예 하지 않는다.** 비용도 아끼고, 손이 아닌 이미지에 대한
  해석이 생성될 여지 자체를 없앤다.

거부 UI 문구 매핑:

| 게이트 결과 | 사용자 문구 |
|------------|------------|
| `not_a_hand` | "손바닥 사진이 아닌 것 같아요. 손바닥이 보이도록 다시 찍어주세요" |
| `back_of_hand` | "손등이 찍혔어요. 손바닥이 보이도록 뒤집어 주세요" |
| `coverage: "partial"` / `obscured` | "손바닥 전체가 화면에 들어오도록 조금 더 멀리서 찍어주세요" |
| `blurry` / `too_dark` | §3-3의 안내 문구 재사용 |

> 거부 화면에서 **원인을 반드시 말해준다.** "인식할 수 없습니다"만 띄우면 사용자는 같은 사진을
> 반복해서 올린다.

### 6-4. 실패·거절 처리

- 모델이 정책상 응답을 거절하면 `stop_reason`을 확인해 **재시도 대신 안내**로 분기한다.
  같은 이미지로 재시도하면 같은 결과가 나온다.
- 413 `request_too_large`가 나면 이미지 1장이 아니라 **요청 전체(32MB)** 를 의심한다. 대화 이력에
  base64 이미지가 누적된 경우가 대부분이다 → Files API로 전환하거나 이력에서 이미지를 잘라낸다.
- 이미지 치수 초과로 인한 `invalid_request_error`는 §5-2의 사전 리사이즈로 원천 차단된다.
  치수가 조용히 축소되는 것을 에러로 바꾸고 싶다면 이미지 블록에
  `"transformations": { "oversized_image": "error" }`를 설정할 수 있다(공식).

---

## 7. 개인정보 · 정직 고지

### 7-1. 손 사진의 법적 성격 — "지금은 아니지만, 쉽게 된다"

| 근거 | 내용 |
|------|------|
| 개인정보 보호법 시행령 제18조 | 민감정보에 해당하는 것은 "개인의 신체적, 생리적, 행동적 특징에 관한 정보로서 **특정 개인을 알아볼 목적으로** 일정한 기술적 수단을 통해 생성한 정보" |
| 개인정보보호위원회 「생체정보 보호 가이드라인」(2021.09) | 생체정보 중 인증·식별 목적으로 처리되는 것이 '생체인식정보'이며, 그중 원본에서 기술적으로 생성한 **'생체인식 특징정보'가 민감정보**에 해당 |
| GDPR Art. 4(14) | 생체 데이터의 예시로 **palm print(손바닥 무늬)** 가 거론된다. 단 "고유 식별을 허용·확인하는 특정 기술적 처리의 결과"라는 조건이 붙는다 |

**결론**: 손금 해석 목적의 손 사진은 *식별 목적 처리가 아니므로* 통상 민감정보(생체인식 특징정보)로
보기 어렵지만, **명백한 개인정보이며, 목적이 "식별"로 바뀌는 순간 민감정보가 된다.** 따라서:

- 설계 문서와 개인정보처리방침에 **"본인 식별·인증 목적으로 처리하지 않는다"**를 명문화한다.
- 손 사진에서 특징점을 추출해 저장하는 기능은 **만들지 않는다**(만드는 순간 민감정보 별도 동의 대상).
- 판단이 필요한 서비스라면 법무 검토를 받는다. **이 스킬은 법률 자문이 아니다.**

### 7-2. 처리 원칙 — 기본은 "안 남긴다"

| 원칙 | 구현 |
|------|------|
| **원본 미보관** | 서버는 이미지를 디스크·객체스토리지에 쓰지 않고 **메모리에서 처리 후 폐기**. 로그·APM·에러 리포터(Sentry 등)에 body가 첨부되지 않도록 마스킹 |
| **로컬 처리 우선** | 리사이즈·압축·품질 검증(§4·§5)은 전부 클라이언트에서. 서버로 나가는 것은 **최소 크기의 1장**뿐 |
| **전송 시 명시적 고지** | 촬영 직전 화면에 "사진은 해석을 위해 서버로 전송되며 저장되지 않습니다"를 문장으로 노출. 약관 깊은 곳이 아니라 **그 화면에** |
| **결과만 보관** | 다시보기가 필요하면 이미지가 아니라 **텍스트 해석 결과만** 저장. 썸네일도 기본 미저장 |
| **저장 옵트인** | 사용자가 사진 보관을 원하면 **명시적 옵트인** + 삭제 수단 제공 + 저장 시 암호화 |
| **제3자 전송 고지** | 처리를 위해 모델 제공자 API로 전송된다는 사실과 처리 지역을 개인정보처리방침에 기재 |

Anthropic 측 사실(공식 FAQ — 고지 문구 작성 근거로 인용 가능):

- 업로드된 이미지는 **요청 처리 기간을 넘겨 저장되지 않으며, 처리 후 자동 삭제**된다.
- 업로드된 이미지는 **모델 학습에 사용되지 않는다**.
- 단, **Files API로 업로드한 파일은 별개**다. 명시적으로 삭제하기 전까지 남는다. 손 사진에 Files
  API를 쓴다면 요청 완료 직후 삭제하는 루틴을 반드시 함께 만든다.

> 주의: 위 서술은 Claude API 직접 호출 기준이다. Bedrock·Google Cloud 등 파트너 플랫폼을 경유하면
> 해당 플랫폼의 데이터 처리 정책이 함께 적용된다. 고지 문구는 **실제 사용하는 경로 기준**으로 쓴다.

### 7-3. 손금 해석의 한계 고지

Britannica는 손금에 대해 **"관찰되는 신체적 특징이 예지적·초자연적 예측 의미를 가진다는 주장에는
과학적 근거가 없다"**고 서술한다. 여기에 §6-2의 모델 한계가 겹친다. 두 층을 **모두** 고지한다.

```
[결과 화면 하단 — 항상 노출, 접기 금지]

이 해석은 손금(수상학) 전통을 바탕으로 한 문화 콘텐츠이며,
과학적으로 검증된 예측이 아닙니다.

AI는 사진에서 손의 전반적인 형태와 뚜렷한 주름의 방향을 대략적으로 참고할 뿐,
손금선을 정밀하게 판독하지 못합니다.

건강·질병·수명에 대한 판단으로 사용하지 마세요.
건강이 걱정된다면 의료 전문가와 상담하세요.
```

**금지되는 마케팅·UI 표현** (과장 금지):

| 금지 | 대체 |
|------|------|
| "AI가 손금선을 정밀 분석합니다" | "AI가 사진을 참고해 손금 전통의 해석을 소개합니다" |
| "정확도 95%" / "적중률" | 정확도 수치는 검증 불가능 → **쓰지 않는다** |
| "생명선으로 수명을 알아보세요" | 수명·질병·사망 관련 표현 **전면 금지** |
| "당신의 건강 상태를 진단" | "재미로 보는 오늘의 손금" 등 오락 프레이밍 |
| 로딩 중 "손금선 12개를 검출했습니다" 같은 **가짜 진행 표시** | 실제로 수행하지 않는 처리를 연출하지 않는다 |

- 결과 화면의 톤·한 줄 고지 문구와 손금 전통의 내용·한계 서술은 `humanities/palmistry-limitations`를 인용한다.

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
