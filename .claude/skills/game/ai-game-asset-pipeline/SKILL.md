---
name: ai-game-asset-pipeline
skill: ai-game-asset-pipeline
version: 1.0.0
description: Unity 2D 게임 에셋 AI 생성 3단계 파이프라인 — Midjourney 컨셉→Leonardo.ai/Scenario.gg 양산→Krita/Aseprite 후처리, 에셋 유형별 프롬프트 패턴, Unity 임포트 규격(PPU/ASTC/Sprite Atlas), 스타일 일관성 전략, 상업 라이선스 가이드
sources:
  - https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference
  - https://docs.midjourney.com/hc/en-us/articles/27870375276557-Using-Images-Videos-Commercially
  - https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans
  - https://leonardo.ai/pricing
  - https://leonardo.ai/learn/core-feature/how-to-create-consistent-characters-with-character-reference
  - https://www.scenario.com/pricing
  - https://docs.scenario.com/get-started/training/training-models
  - https://github.com/lllyasviel/ControlNet
  - https://huggingface.co/spaces/CompVis/stable-diffusion-license/raw/main/license.txt
  - https://docs.unity3d.com/Manual/sprite/atlas/v2/sprite-atlas-v2.html
  - https://docs.unity3d.com/ScriptReference/FilterMode.html
  - https://unity.com/blog/engine-platform/choosing-the-resolution-of-your-2d-art-assets
verified: 2026-06-07
status: APPROVED
---

# Unity 2D 게임 에셋 AI 생성 파이프라인

> 소스: 위 frontmatter `sources` 참조 (Midjourney 공식 docs, Leonardo.ai 공식, Scenario.gg 공식 docs, Unity 공식 매뉴얼, ControlNet 공식 GitHub)
> 검증일: 2026-06-07
> 적용 범위: Unity 6 / 2022 LTS 이상의 2D 프로젝트, 모바일·PC 타깃

---

## 1. 3단계 파이프라인 개요

| 단계 | 목적 | 도구 후보 | 산출물 |
|------|------|-----------|--------|
| **1. 컨셉/무드보드** | 게임 전체 스타일 방향 결정 | Midjourney V7 (`--sref` 시드 고정) | 스타일 레퍼런스 이미지 1~5장, 무드보드 PDF |
| **2. 에셋 대량 생성** | 동일 스타일로 캐릭터·UI·배경·이펙트 양산 | Leonardo.ai(Character Reference / Phoenix·Lucid 모델) 또는 Scenario.gg(커스텀 Style/Character LoRA) 또는 로컬 SD + ControlNet | 원본 PNG 수십~수백 장 |
| **3. 후처리·시트 정리** | 배경 제거, 스프라이트 시트 정렬, 픽셀 정합 | Krita(라이트 페인팅·배경 제거), Aseprite(픽셀아트·시트), GIMP(범용) | Unity 임포트용 PNG / Aseprite 파일 |

**핵심 원칙**
- 1단계 스타일이 확정될 때까지 2단계로 넘어가지 않는다. 스타일 변경은 후행 단계 전체 재작업을 유발한다.
- 1단계에서 결정된 시드(Midjourney `--sref` 번호 또는 업로드 이미지)와 prefix 프롬프트는 **프로젝트 단위로 고정 라이브러리**에 보관한다.
- 2단계 도구는 *하나만* 고른다. Leonardo.ai와 Scenario.gg를 섞으면 스타일 통일성이 깨진다.

---

## 2. 1단계 — Midjourney 컨셉/무드보드

### 2.1 스타일 레퍼런스 (`--sref`)

`--sref` 는 V6·V7에서 동작하는 스타일 참조 파라미터다.

```
/imagine prompt: <컨셉 설명> --sref <숫자 코드 또는 이미지 URL> --sw 100 --ar 16:9 --v 7
```

- **이미지 기반**: `--sref https://...png` — 자체 무드보드 1장을 업로드해 스타일 시드로 사용
- **코드 기반**: `--sref 1234567890` — Midjourney 내부 스타일 라이브러리의 숫자 코드. V7에서는 `--sv 4` 로 V6 코드 호환 가능
- **랜덤 탐색**: `--sref random` — 컨셉 단계에서 후보 탐색 시 유용

### 2.2 스타일 가중치 (`--sw`)

- 범위: **0 ~ 1000**, 기본값 **100**
- 0 → `--sref` 무효화
- 65~175 구간이 균형점 (공식 가이드 및 커뮤니티 권장)
- 게임 에셋은 스타일 일관성이 핵심이므로 보통 **150~250** 권장

### 2.3 `--style raw` 사용 시점

- Midjourney의 자동 "보정" 효과를 끄고 프롬프트에 더 충실한 결과를 원할 때.
- 게임 에셋(특히 UI 아이콘·픽셀 스프라이트)은 `--style raw` 가 도움이 되는 경우가 많다.

### 2.4 무드보드 산출 프롬프트 예시

```
moodboard sheet for a 2D platformer game, side-scrolling fantasy forest,
flat illustration style, warm sunset palette --ar 16:9 --style raw --v 7
```

스타일 확정 후, 가장 마음에 드는 1장을 Discord에서 우클릭 → "Use Image" 또는 `--sref <해당 이미지 URL>` 형태로 고정한다.

> 주의: V7에서 `--sref` 동작이 V6과 달라졌다. V6 코드는 `--sv 4` 를 함께 줘야 동일 결과가 나온다.

---

## 3. 2단계 — 에셋 대량 생성

### 3.1 Leonardo.ai 경로

**핵심 기능**
- **Phoenix** 모델: 프롬프트 충실도가 높음. 플랫 일러스트·벡터 스타일·UI 아이콘 등 *레이아웃 정합*이 중요한 에셋에 권장.
- **Lucid Origin / Lucid**: 미적 일반화 모델. 캐릭터 일러스트·배경 그림에 권장.
- **Character Reference**: 얼굴/캐릭터 이미지 1장을 업로드해 동일 인물을 다양한 포즈·배경에 재생성. SDXL 기반 모델 전용. 강도(Low/Mid/High) 선택.
- **Style Reference / Multi-Style Reference**: 스타일 일관성 강화. Character Reference와 병용 가능.
- **LoRA 학습**: Apprentice 1회/월, Artisan 5회/월 (자체 게임 IP 학습 시 필수).

**전형적 워크플로우**
1. Midjourney 무드보드에서 고른 1~3장을 Style Reference로 업로드.
2. 캐릭터 정면 컷 1장을 Character Reference로 등록.
3. Phoenix(아이콘) / Lucid(캐릭터·배경) 분기.
4. 프롬프트 prefix·suffix를 프로젝트 라이브러리에서 재사용 (4절 참조).

### 3.2 Scenario.gg 경로

게임 스튜디오용 커스텀 모델 학습이 강점이다.

**모델 유형 3종**
- **Style Model**: 게임 비주얼 아이덴티티(컬러팔레트·터치) 학습 → 모든 신규 생성이 동일 스타일
- **Character Model**: 특정 캐릭터(영웅·NPC) 학습 → 포즈·표정·환경 바뀌어도 동일 인물
- **Texture Model**: 특정 표면(돌·풀·금속) 학습 → 무한 타일 변형

**학습 권장 데이터**
- 10~20장의 고해상도 이미지로 충분
- 학습 시간: 보통 30분 ~ 1시간
- 결과 부족 시 "Retrain" 메뉴에서 캡션·파라미터만 조정 후 재학습 (원본 설정 유지)

**Unity 통합**
- API-first 구조로 Unity 에디터에서 직접 호출 가능 (공식 발표).

### 3.3 로컬 Stable Diffusion + ControlNet 경로 (무료)

월 구독 없이 무한 생성이 필요할 때.

**ControlNet 주요 프리프로세서**

| 프리프로세서 | 입력 | 게임 에셋 활용 |
|--------------|------|----------------|
| **Canny** | 윤곽선 맵 | UI 아이콘·캐릭터 실루엣 고정 |
| **Scribble** | 손그림 스케치 | 빠른 컨셉 → 완성도 변환 |
| **Lineart** | 라인아트 | 만화풍·셀셰이딩 캐릭터 |
| **Depth** | 깊이 맵 | 배경·아이소메트릭 구도 보존 |
| **OpenPose** | 인체 키포인트 | 캐릭터 액션 프레임(공격·점프) 동일 포즈 |
| **Normal** | 노멀 맵 | 표면 디테일·릴리프 유지 |
| **Seg** | 시멘틱 세그멘테이션 | 배경 영역별 오브젝트 배치 제어 |

**실루엣 제어 워크플로우 예시**
1. Krita/Aseprite에서 흑백 실루엣 그림 작성
2. ControlNet Canny 또는 Scribble로 입력
3. 프롬프트로 디테일 채우기 → 동일 실루엣으로 N개 변형 생성

---

## 4. 에셋 유형별 프롬프트 패턴

프롬프트는 `[prefix 고정] + [에셋 설명] + [suffix 고정] + [파라미터]` 구조로 라이브러리화한다.

### 4.1 2D 캐릭터 스프라이트

```
[prefix] flat 2D side-scroller character sprite, clean vector lines, no background,
[에셋] young knight with blue cape, sword raised, attack pose frame 3 of 6,
[suffix] full body, centered, white background, game asset sheet style
[파라미터] --sref <프로젝트 시드> --sw 200 --ar 1:1 --style raw --v 7
```

- 프레임별 생성: "frame 1 of 6 idle", "frame 2 of 6 idle" 식으로 카운트 명시
- 배경 분리를 위해 항상 `white background` 또는 `transparent background` 키워드 + 후처리에서 제거
- 정면/측면/액션은 각각 별도 프롬프트, Character Reference 강도 High

### 4.2 UI 버튼·아이콘

```
flat vector UI icon for [기능명], glowing edge, isometric perspective,
transparent background, game asset, clean lines, no text, square composition
--sref <프로젝트 시드> --sw 250 --ar 1:1 --style raw --v 7
```

- 투명 배경은 Midjourney가 PNG-알파를 지원하지 않으므로 *후처리에서 제거* 가정
- `square composition`, `centered` 키워드로 정렬 안정화
- Leonardo Phoenix 모델이 특히 강함

### 4.3 배경·타일셋

```
seamless tileable forest background tile, parallax layer 2 of 4 (mid),
hand-painted style, repeating horizontally, 2048x512
--sref <프로젝트 시드> --ar 4:1 --v 7
```

- 타일링은 `seamless`, `tileable`, `repeating horizontally/vertically` 명시
- ControlNet Seamless Tiling 옵션(로컬 SD A1111/ComfyUI) 사용 시 정합성 ↑
- 비율은 게임 카메라 가시 영역에 맞춰 16:9 / 4:1 등 명시

### 4.4 이펙트 (파티클·폭발·빛)

```
2D game effect, fire explosion, frame 4 of 8, radial burst, glowing core,
transparent black background, no character, isolated effect, top-down view
--sref <프로젝트 시드> --ar 1:1 --v 7
```

- 검은 배경 + Unity에서 Additive 블렌딩 (Particle/Additive 셰이더)
- 시퀀스 프레임 수는 8/16/32 등 2의 배수 권장 (Sprite Atlas 패킹 효율)

---

## 5. 3단계 — 후처리·시트 정리

### 5.1 도구별 역할

| 도구 | 라이선스 | 강점 | 약점 |
|------|----------|------|------|
| **Krita** | GPL (무료) | 디지털 페인팅, 배경 제거, 색 보정 | 픽셀아트 전용 기능 약함 |
| **Aseprite** | 유료(약 $19.99, Steam·itch.io) | 픽셀아트·스프라이트 시트·애니메이션 표준 | 고해상도 일러스트 부적합 |
| **GIMP** | GPL (무료) | 범용 래스터·플러그인 풍부 | UI 학습 곡선 |

### 5.2 표준 후처리 순서

1. **배경 제거**: Krita "Color to Alpha" 또는 GIMP "Fuzzy Select" → Alpha 채널 변환
2. **크기 정규화**: 모든 동일 유형 에셋을 같은 캔버스 크기로 (예: 캐릭터 256×256, 아이콘 128×128)
3. **픽셀 스냅** (픽셀아트 한정): Aseprite에서 정수 픽셀 그리드로 재정렬
4. **스프라이트 시트 패킹**: Aseprite `File → Export Sprite Sheet` 또는 Unity Sprite Atlas (5.3)
5. **메타데이터 첨부**: 시트 옆에 `frames.json` (Aseprite 자동 생성) → Unity 임포터가 활용

### 5.3 Aseprite → Unity 자동 임포터

`.aseprite` 파일을 Unity 프로젝트에 직접 저장하면 Unity 6의 공식 Aseprite Importer 패키지(또는 `com.unity.2d.aseprite`) 또는 커뮤니티 패키지(`Aseprite2Unity`, `unity-aseprite-importer`)가 자동으로:
- 스프라이트 시트 생성
- 애니메이션 클립 생성
- 애니메이터 컨트롤러 생성

> 주의: 커뮤니티 패키지는 Unity 버전 호환 표를 반드시 확인. Aseprite2Unity는 Unity 2018.3 이상 필요.

---

## 6. Unity 임포트 규격

### 6.1 Pixels Per Unit (PPU)

PPU는 "1 Unity 월드 유닛 = 몇 픽셀" 비율이다. 게임 카메라·콜라이더·물리 스케일이 모두 이 값에 묶인다.

| 에셋 유형 | 권장 PPU | 근거 |
|-----------|----------|------|
| 16×16 픽셀아트 타일 | **16** | "1 게임 타일 = 1 유닛" 컨벤션 |
| 32×32 픽셀아트 캐릭터 | **32** | 동일 컨벤션 |
| HD 일러스트 스프라이트 | **100** | Unity 기본값. 1픽셀 ≈ 1cm 가시화 |
| UI 캔버스 (Screen Space) | PPU 무관 | Canvas Scaler가 관리 |

**핵심 규칙**
- *프로젝트 단위로 PPU를 통일*한다. 캐릭터·타일·배경이 다른 PPU를 쓰면 충돌 처리·카메라 줌이 깨진다.
- 스프라이트 시트는 단일 프레임 크기를 PPU 값과 일치시킨다 (16×16 타일이면 PPU 16).

### 6.2 Filter Mode

| 모드 | 동작 | 사용 케이스 |
|------|------|-------------|
| **Point (no filter)** | 가장 가까운 픽셀 선택, 블록 유지 | 픽셀아트 — 필수 |
| **Bilinear** | 인접 픽셀 보간 → 부드러움 | HD 스프라이트 일반 |
| **Trilinear** | Bilinear + 밉맵 레벨 보간 | 카메라 거리 변화 큰 3D/2.5D |

> 주의: 픽셀아트에 Bilinear를 쓰면 흐려진다. 반대로 HD 스프라이트에 Point를 쓰면 계단 현상이 생긴다.

### 6.3 Sprite Atlas (V2 기준)

**생성**: `Assets > Create > 2D > Sprite Atlas`

**주요 설정**

| 옵션 | 권장값 | 설명 |
|------|--------|------|
| Allow Rotation | 픽셀아트: ❌ / HD: ✅ | 패킹 효율 vs 시각 일관성 |
| Tight Packing | HD: ✅ / 픽셀아트: ❌ | 비사각형 메시 패킹 (메모리 절약) |
| Padding | **2~4 px** | 블리딩 방지. 픽셀아트는 2, HD는 4 권장 |
| Max Texture Size | 2048 (모바일) / 4096 (PC) | 디바이스 GPU 한계 고려 |
| Include in Build | ✅ | 런타임 자동 로드 |
| Read/Write Enabled | ❌ | 메모리 2배 절약 (런타임 픽셀 접근 불필요 시) |

**V2 전환**: `Edit > Project Settings > Editor > Sprite Atlas Mode = Sprite Atlas V2 - Enabled`. V1→V2 변환은 단방향이므로 백업 필수.

### 6.4 텍스처 압축 (ASTC, 모바일)

| 포맷 | 비트레이트 | 품질 | 권장 케이스 |
|------|-----------|------|-------------|
| ASTC 4×4 | 8.00 bpp | 최고 | UI 아이콘·핵심 캐릭터 |
| **ASTC 6×6** | **3.56 bpp** | 균형점 | **일반 캐릭터·배경 (모바일 기본)** |
| ASTC 8×8 | 2.00 bpp | 보통 | 보조 배경·이펙트 |
| ASTC 12×12 | 0.89 bpp | 낮음 | 멀리 보이는 백그라운드 |

**설정 위치**: `Texture Inspector → Platform Override (Android/iOS) → Format: ASTC 6x6 block`

> 주의: ASTC는 OpenGL ES 3.1 또는 Vulkan을 지원하는 Android GPU 필요. 저사양 단말 폴백은 ETC2 RGBA8.

### 6.5 픽셀아트 추가 설정

픽셀아트 텍스처 임포트 권장:
- Filter Mode: **Point (no filter)**
- Compression: **None** (또는 압축 시 ASTC 4×4)
- Generate Mip Maps: **OFF**
- Pixel Snap: 카메라에 `Pixel Perfect Camera` 컴포넌트(`com.unity.2d.pixel-perfect`) 추가

---

## 7. 스타일 일관성 유지 전략

### 7.1 프롬프트 라이브러리 관리

프로젝트 루트에 `prompts/library.md` 같은 파일을 두고 prefix·suffix를 한 번 정의해 재사용한다.

```
# 프로젝트 X 프롬프트 라이브러리

PREFIX: flat 2D side-scroller game asset, hand-painted style, warm sunset palette
SUFFIX: clean composition, no text, no watermark, white background
PARAMS: --sref 2891234567 --sw 200 --style raw --v 7

# 사용 예
[PREFIX] young knight idle frame 1 of 4 [SUFFIX] [PARAMS]
```

### 7.2 시드 고정 전략

| 도구 | 고정 방법 |
|------|-----------|
| Midjourney | `--seed <숫자>` (V6/V7) + `--sref <코드>` 병용 |
| Leonardo.ai | Character Reference + Style Reference + 동일 모델(Phoenix/Lucid) 고정 |
| Scenario.gg | Style/Character LoRA 학습 후 동일 모델 ID로 모든 에셋 생성 |
| 로컬 SD | Seed 값 고정 + ControlNet으로 구도 제어 |

### 7.3 일관성 검증 체크리스트

- [ ] 모든 캐릭터가 동일 조명 방향인가 (예: 좌상단 광원)
- [ ] 컬러팔레트가 무드보드 5색에서 벗어나지 않는가
- [ ] 라인 두께·필치가 통일되었는가
- [ ] 캐릭터 비율(머신/몸 길이비)이 동일한가

> 주의: AI 모델은 미세한 컬러 시프트를 자주 일으킨다. 후처리(Krita/GIMP)에서 LUT 또는 컬러 그레이딩으로 통일하는 것이 현실적이다.

---

## 8. 상업 라이선스 가이드 (2026-06 기준)

### 8.1 Midjourney

- **Basic ($10/월)** 이상: 상업 사용 허용 (프린트·머천다이즈·NFT·클라이언트 작업)
- **단, 회사 직전 회계연도 매출 $1M USD 이상**이면 Pro($60/월) 또는 Mega($120/월) 필수 — 개인이 Basic 구독해도 회사 매출이 임계를 넘으면 적용
- 무료(체험): CC BY-NC 4.0 → **상업 사용 불가**
- 연 결제 시 약 20% 할인 (Basic 약 $8/월)

### 8.2 Leonardo.ai

- **모든 유료 플랜**(Apprentice $12/월 ~ Maestro $60/월): 전체 소유권 보유, 상업 사용 허용
- **무료 플랜**: Leonardo가 이미지 권리 보유하나, 사용자에게 비독점·무로열티 상업 라이선스 부여 (단, 권리는 Leonardo가 가짐)
- 연 결제 시 약 17~30% 할인

### 8.3 Scenario.gg

- **모든 유료 플랜**(Starter $15/월, Pro $45/월, Max $75/월): 풀 커머셜 라이선스. 게임 출시·판매·클라이언트 납품 자유
- **무료 체험(50 credits/일)**: 개인·평가 용도만, 상업 사용 불가
- 커스텀 모델 학습은 **Pro 이상** 필요 (Starter 미포함)

### 8.4 Stable Diffusion (로컬·무료)

- 라이선스: **CreativeML Open RAIL-M / OpenRAIL++-M**
- 상업 사용 허용, 매출 한도 없음
- 제한 사항: 불법 콘텐츠 생성·차별·괴롭힘·허위정보·동의 없는 개인 표현·법 위반 등 use-based restrictions
- 모델별 라이선스 차이 확인 필수 (SD 1.5, SDXL은 RAIL 계열, SD3·FLUX 등은 별도 라이선스)

### 8.5 결정 가이드

| 상황 | 권장 |
|------|------|
| 회사 매출 $1M 미만, 빠르게 시작 | Midjourney Basic + Leonardo.ai Apprentice |
| 게임 스튜디오, 자체 IP 커스텀 모델 필요 | Scenario.gg Pro 이상 |
| 예산 0, 시간 여유 있음, 로컬 GPU 있음 | Stable Diffusion + ControlNet |
| 회사 매출 $1M 이상 | Midjourney Pro 또는 Mega + Leonardo Artisan 이상 |

> 주의: 라이선스 정책은 공급사 정책 변경에 따라 수시 변경된다. **상업 배포 직전 반드시 최신 약관 재확인**.

---

## 9. 흔한 실수와 회피법

| 실수 | 결과 | 회피 |
|------|------|------|
| 1단계 스타일 미확정 상태에서 2단계 진행 | 후행 단계 전체 재작업 | 무드보드 확정 → 시드/Reference 저장 → 진행 |
| 캐릭터 PPU와 타일 PPU 불일치 | 콜라이더·점프 거리 깨짐 | 프로젝트 단위 PPU 단일 결정 |
| 픽셀아트에 Bilinear 필터 적용 | 흐려짐, 픽셀 손상 | Filter Mode = Point + Mipmap OFF |
| Sprite Atlas Padding 0 | 인접 스프라이트 픽셀 블리딩 | Padding 2~4 px 유지 |
| Midjourney 무료로 생성한 에셋 상업 배포 | CC BY-NC 4.0 위반 | 최소 Basic 이상 유료 플랜 |
| 회사 매출 $1M↑ 인데 Midjourney Basic 사용 | 라이선스 위반 | Pro 또는 Mega 업그레이드 |
| Scenario/Leonardo/Midjourney 혼용 | 스타일 통일성 깨짐 | 2단계 도구는 하나만 |
| Aseprite 파일을 PNG로 수동 export | 애니메이션 메타 손실 | `.aseprite` 직접 Unity 저장 + Aseprite Importer |

---

## 10. 참고 자료

- Midjourney 공식: https://docs.midjourney.com/
  - Style Reference: https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference
  - Plans: https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans
  - Commercial: https://docs.midjourney.com/hc/en-us/articles/27870375276557-Using-Images-Videos-Commercially
- Leonardo.ai 공식: https://leonardo.ai/pricing
  - Character Reference: https://leonardo.ai/learn/core-feature/how-to-create-consistent-characters-with-character-reference
- Scenario.gg 공식: https://www.scenario.com/pricing
  - 모델 학습 가이드: https://docs.scenario.com/get-started/training/training-models
- ControlNet (lllyasviel): https://github.com/lllyasviel/ControlNet
- CreativeML Open RAIL-M 라이선스: https://huggingface.co/spaces/CompVis/stable-diffusion-license/raw/main/license.txt
- Unity 공식
  - Sprite Atlas V2: https://docs.unity3d.com/Manual/sprite/atlas/v2/sprite-atlas-v2.html
  - FilterMode: https://docs.unity3d.com/ScriptReference/FilterMode.html
  - 2D 에셋 해상도 가이드: https://unity.com/blog/engine-platform/choosing-the-resolution-of-your-2d-art-assets
  - 텍스처 압축 (플랫폼별): https://docs.unity3d.com/Manual/class-TextureImporterOverride.html
