---
name: unity-ui-system
description: >
  Unity 6 LTS 2D 모바일 게임용 uGUI 시스템 전문 스킬. Canvas/RectTransform/TextMeshPro,
  모바일 UI 패턴(팝업·무한 스크롤·광고·IAP), 성능 최적화, UI Toolkit과의 선택 기준 포함.
---

# Unity 6 LTS — 2D 모바일 게임 UI System (uGUI)

> 소스:
> - Unity Manual — UI Systems Comparison (Unity 6): https://docs.unity3d.com/6000.3/Documentation/Manual/UI-system-compare.html
> - Unity Scripting API — Screen.safeArea: https://docs.unity3d.com/ScriptReference/Screen-safeArea.html
> - Unity Manual — Canvas Scaler (uGUI 2.0): https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/script-CanvasScaler.html
> - Unity Support — Split canvas for dynamic objects: https://support.unity.com/hc/en-us/articles/115000355466
> - Unity How-to — UI optimization tips: https://unity.com/how-to/unity-ui-optimization-tips
> - Unity Learn — Optimizing Unity UI: https://learn.unity.com/course/doozyui-related-tutorials/tutorial/optimizing-unity-ui
> - TextMeshPro Fallback font assets: https://docs.unity3d.com/Packages/com.unity.ugui@2.5/manual/TextMeshPro/FontAssetsFallback.html
> - Google AdMob — Anchored adaptive banners (Unity): https://developers.google.com/admob/unity/banner/anchored-adaptive
> - Unity Releases — Unity 6 LTS Support: https://unity.com/releases/unity-6/support
>
> 검증일: 2026-06-10
> 적용 버전: **Unity 6.0 LTS / 6.3 LTS** (uGUI 패키지 2.0+ / TextMeshPro 통합)

---

## 0. 버전·시스템 선택 기준

### Unity 6 LTS 라인업

| 라인 | 지원 종료 | 비고 |
|------|-----------|------|
| Unity 6.0 LTS | 2026-10 (기본 LTS) | 2026 상반기 안정 라인 |
| Unity 6.3 LTS | 2027-12 (기본 LTS) | 2026 신규 프로젝트 권장 |

> 주의: Unity 6에서는 `com.unity.ugui` 패키지 안에 TextMeshPro가 통합되었다. 별도 `com.unity.textmeshpro` 패키지는 더 이상 신규 설치 대상이 아니다 (기존 프로젝트만 호환 유지).

### uGUI vs UI Toolkit — Unity 6 공식 권장

Unity 6 공식 문서(UI systems comparison)는 **런타임 UI에 uGUI를 권장**한다. UI Toolkit은 *런타임 지원 중*이지만 다음 기능이 미흡하다:

| 기능 | uGUI | UI Toolkit (Runtime) |
|------|:----:|:--------------------:|
| Animation Clip / Timeline | ✅ | ❌ |
| Particle System UI | ✅ | ❌ |
| World-space UI (3D 공간 부착) | ✅ | ⚠️ 제한적 |
| MonoBehaviour 직접 참조 | ✅ | ⚠️ Visual Element 우회 필요 |
| Mask / RectMask2D | ✅ | ⚠️ 다른 메커니즘 |
| 다해상도 메뉴·HUD 스타일 일관성 | ⚠️ | ✅ |
| 데이터 바인딩 | ❌ | ✅ |

**선택 기준 (2D 모바일 게임):**
- 광고·IAP·인앱 보상 UI, HUD, 게임 내 팝업 → **uGUI**
- 옵션·설정 메뉴만 별도 UI Toolkit으로 분리하는 하이브리드도 허용

이 스킬은 **uGUI 기준**으로 작성한다.

---

## 1. Canvas 설정

### 1.1 Render Mode 3종

| Mode | 동작 | 모바일 2D 게임 권장 용도 |
|------|------|--------------------------|
| **Screen Space - Overlay** | 화면 위에 항상 그려짐. Camera 무관 | HUD, 풀스크린 팝업, 광고 배너 컨테이너 |
| **Screen Space - Camera** | 지정 Camera의 평면에 그려짐. 카메라 효과(블러·포스트프로세싱) 적용 가능 | 카메라 셰이크 영향 받는 UI, 캐릭터 위 데미지 텍스트 |
| **World Space** | 3D 공간에 평면으로 배치. RectTransform이 월드 좌표 | 머리 위 닉네임, AR/VR UI, 게임 공간 내 버튼 |

> 주의: World Space Canvas에서 Event Camera 미할당 시 `Camera.main`을 매 프레임 7~10회 호출하며 내부적으로 `FindObjectWithTag`까지 트리거된다 — 반드시 Event Camera를 명시적으로 할당한다.

### 1.2 CanvasScaler — 모바일 2D 권장 설정 (1080×1920 기준)

```
UI Scale Mode      : Scale With Screen Size
Reference Resolution: 1080 x 1920  (세로 모드 기준)
Screen Match Mode  : Match Width Or Height
Match              : 0.5  (가로/세로 50:50 보간 — 세로 게임 표준)
Reference Pixels Per Unit: 100
```

**Match 값 가이드:**
- `0` → 가로 기준 스케일 (가로가 짧으면 UI 축소). 가로 게임 권장
- `1` → 세로 기준 스케일 (세로가 짧으면 UI 축소). 세로 게임이지만 와이드 비율(폴드) 대응
- `0.5` → 양축 평균. 비율 편차 흡수에 유리 (세로 게임 표준)

> 주의: Constant Pixel Size는 모바일에서 절대 사용 금지. 디바이스별 DPI 편차로 UI가 작아 보이거나 잘린다.

### 1.3 멀티 Canvas 전략 — Static + Dynamic 분리

**원칙:** Canvas는 모든 자식 UI 요소의 메시·머티리얼·인덱스 버퍼를 한 묶음(batch)으로 빌드한다. 그 안의 *하나라도* 변경되면 Canvas 전체가 rebuild된다. 따라서:

- **Static Canvas** — HUD 배경, 고정 라벨, 안내 텍스트 등 변하지 않는 요소
- **Dynamic Canvas** — HP 바, 스코어, 타이머 등 매 프레임 갱신 요소
- **Popup Canvas** — 팝업·다이얼로그 등 가시성이 토글되는 요소 (Sort Order로 위에 배치)

```
Hierarchy 예시
  Canvas_StaticHUD          (Sort Order 0)
    ├ BG_Frame
    ├ ScoreLabel (텍스트 변하지 않는 라벨)
    └ MenuButton
  Canvas_DynamicHUD         (Sort Order 1)
    ├ ScoreValue (매 프레임 갱신)
    ├ HpBar
    └ ComboCounter
  Canvas_Popup              (Sort Order 100)
    └ (런타임에 동적 추가)
  Canvas_AdBanner           (Sort Order 200)
    └ AdContainer (Safe Area 하단 고정)
```

> 주의: Canvas를 분리하면 Canvas당 1 draw call 이상이 추가된다. 정적/동적 분리 효과(rebuild 감소)와 draw call 증가의 trade-off를 Profiler로 확인한다. 일반적으로 동적 요소가 매 프레임 변할 때만 분리 가치가 있다.

---

## 2. RectTransform 앵커 패턴

### 2.1 9방향 앵커

RectTransform의 Anchor는 부모 RectTransform 안에서의 *정렬 기준점*이다. 화면 비율이 바뀌어도 의도한 위치를 유지하려면 다음 규칙을 따른다.

| UI 종류 | 권장 Anchor (min/max) | 이유 |
|---------|------------------------|------|
| 상단 좌측 HP/MP | (0, 1) / (0, 1) | 상단·왼쪽 고정, 화면 확장 시 안 흩어짐 |
| 상단 중앙 스코어 | (0.5, 1) / (0.5, 1) | 가로 중앙·상단 고정 |
| 우상단 메뉴 버튼 | (1, 1) / (1, 1) | 노치/펀치홀 충돌 위험 → Safe Area 필수 |
| 하단 가상 패드 | (0, 0) / (0, 0) | 좌하단 고정 |
| 하단 광고 배너 컨테이너 | (0, 0) / (1, 0) | 가로 stretch + 하단 고정 |
| 풀스크린 팝업 배경 | (0, 0) / (1, 1) | 양축 stretch |
| 다이얼로그 본문 | (0.5, 0.5) / (0.5, 0.5) | 화면 중앙 고정 |

> Pivot은 *RectTransform 자신*의 회전·크기 기준점이고, Anchor는 *부모* 기준 정렬점이다. 둘을 혼동하면 회전 팝업이 의도와 다르게 튄다.

### 2.2 Safe Area — 노치·다이나믹 아일랜드·홀펀치 대응

`Screen.safeArea`는 **픽셀 단위 Rect**로 반환되며 좌하단이 (0,0)이다. 이를 RectTransform의 정규화 앵커 값으로 변환해야 한다.

```csharp
using UnityEngine;

[RequireComponent(typeof(RectTransform))]
public class SafeAreaFitter : MonoBehaviour
{
    private RectTransform _rect;
    private Rect _lastSafeArea;
    private Vector2Int _lastScreenSize;
    private ScreenOrientation _lastOrientation;

    private void Awake()
    {
        _rect = GetComponent<RectTransform>();
        Apply();
    }

    private void Update()
    {
        // 회전·해상도 변경·split screen 등에 대응
        if (Screen.safeArea != _lastSafeArea
            || Screen.width != _lastScreenSize.x
            || Screen.height != _lastScreenSize.y
            || Screen.orientation != _lastOrientation)
        {
            Apply();
        }
    }

    private void Apply()
    {
        var safe = Screen.safeArea;
        var anchorMin = safe.position;                // 좌하단 (픽셀)
        var anchorMax = safe.position + safe.size;    // 우상단 (픽셀)

        anchorMin.x /= Screen.width;
        anchorMin.y /= Screen.height;
        anchorMax.x /= Screen.width;
        anchorMax.y /= Screen.height;

        _rect.anchorMin = anchorMin;
        _rect.anchorMax = anchorMax;

        _lastSafeArea = safe;
        _lastScreenSize = new Vector2Int(Screen.width, Screen.height);
        _lastOrientation = Screen.orientation;
    }
}
```

**Canvas 구조:**

```
Canvas (Screen Space - Overlay, 풀스크린)
  ├ Background           ← 노치 뒤까지 그릴 배경 (Safe Area 밖)
  └ SafeAreaRoot (SafeAreaFitter)   ← anchor stretch 풀스크린 시작
      ├ TopBar  (스코어·메뉴)
      ├ Content (게임 콘텐츠)
      └ BottomBar (가상 패드·광고)
```

> 주의: `Update()`에서 매 프레임 비교하지만 변화가 없으면 RectTransform을 건드리지 않는다. RectTransform을 *매 프레임 갱신*하면 Canvas rebuild가 발생한다.

> Player Settings → "Render outside safe area" 옵션과 짝을 맞춘다. 배경을 노치 뒤까지 그리려면 켜고, 게임 콘텐츠가 자르려면 끈다.

---

## 3. TextMeshPro

Unity 6에서 TMP는 `com.unity.ugui` 패키지에 통합되어 별도 설치가 필요 없다.

### 3.1 Font Asset 생성

`Window → TextMeshPro → Font Asset Creator`

| 설정 | 모바일 권장 값 | 비고 |
|------|----------------|------|
| Sampling Point Size | Auto Sizing | SDF는 한 번 굽고 런타임에 스케일 |
| Padding | 5 (얇은 외곽선) / 10 (두꺼운 글로우·아웃라인) | Padding이 작으면 외곽선 효과 시 잘림 |
| Packing Method | Optimum | 빌드 시간 길지만 아틀라스 최소화 |
| Atlas Resolution | 1024×1024 (영문) / 2048×2048 (CJK) | 모바일 텍스처 최대치 고려 |
| Render Mode | SDFAA | 일반 권장. SDFAA_HINTED는 작은 폰트 가독성 우선 |
| Atlas Population Mode | Dynamic (CJK) / Static (영문) | CJK는 동적 추가로 아틀라스 폭발 방지 |

### 3.2 다국어(CJK) — Fallback Font 체인

한국어/중국어/일본어는 글리프 수가 수만 개라 단일 아틀라스(2048² 한도)에 다 못 담는다. 공식 권장은 **Fallback Font Asset 체인**.

```
PrimaryFont (영문·숫자·기호, Static Atlas)
  ↓ fallback
KoreanFont (한글, Dynamic Atlas 2048²)
  ↓ fallback
CJKCommonFont (한자 공통, Dynamic Atlas 2048²)
  ↓ fallback
EmojiFont (이모지, Sprite Asset)
```

설정 방법:
1. Primary Font Asset의 Inspector → `Fallback Font Assets` 리스트에 우선순위대로 추가
2. 또는 전역 폴백: `Project Settings → TextMesh Pro → Settings → Fallback Font Assets`

**Dynamic Atlas Population Mode 권장:**
- 글리프를 *런타임에 필요할 때* 동적으로 아틀라스에 굽는다
- 모든 한글(11,172자)을 미리 안 구워도 됨 → 빌드 사이즈 절감
- 단점: 첫 등장 시 1프레임 hitch 가능 → 게임 시작 시 자주 쓰는 단어 더미 렌더로 워밍업

### 3.3 외곽선·그림자 성능

| 효과 | 구현 | 성능 |
|------|------|------|
| Outline (Material → Outline) | SDF 기반, 단일 머티리얼 | ✅ 거의 무료 |
| Underlay (Material → Underlay) | SDF 그림자 | ✅ 거의 무료 |
| `UnityEngine.UI.Shadow` 컴포넌트 | Vertex 복제 | ⚠️ 버텍스 2배 |
| `UnityEngine.UI.Outline` 컴포넌트 | Vertex 4배 복제 | ❌ 모바일 회피 |

> 모바일에서는 TMP 자체의 Material Preset(Outline/Underlay)만 사용한다. legacy `Shadow`/`Outline` 컴포넌트는 같은 효과를 위해 메시를 복제하므로 성능이 나쁘다.

> 주의: Material Preset을 컴포넌트당 다르게 쓰면 batching이 깨진다. 같은 폰트의 다른 효과는 *공유 Material Preset*으로 묶고 색상은 *Vertex Color*로 제어한다.

---

## 4. 모바일 UI 패턴

### 4.1 팝업 (Modal Dialog) — 입력 차단 Overlay

**구조:**

```
Canvas_Popup (Sort Order 100, Render Mode Overlay)
  └ PopupRoot
      ├ Blocker (풀스크린 stretch, 반투명 검정 Image, raycastTarget=true)
      └ PopupPanel (중앙 정렬, 의도된 디자인)
          ├ Title (TMP)
          ├ Body  (TMP)
          └ ButtonRow
              ├ CancelButton
              └ ConfirmButton
```

**원칙:**
- `Blocker`는 풀스크린을 덮어 *뒤쪽 UI 입력을 흡수*한다 (raycastTarget=true)
- `Blocker`의 Image 색은 `(0,0,0,180/255)` 권장 — 너무 진하면 답답
- 팝업 열림 중 게임 일시정지(`Time.timeScale = 0`)할지는 게임 디자인 판단

**Tween 애니메이션 (DOTween 예시):**

```csharp
using DG.Tweening;
using UnityEngine;
using UnityEngine.UI;

public class PopupAnimator : MonoBehaviour
{
    [SerializeField] private CanvasGroup canvasGroup;
    [SerializeField] private RectTransform panel;
    [SerializeField] private Image blocker;

    public void Show()
    {
        gameObject.SetActive(true);
        canvasGroup.interactable = false;
        canvasGroup.blocksRaycasts = true;

        // 블로커 페이드 인
        blocker.color = new Color(0, 0, 0, 0);
        blocker.DOFade(180f / 255f, 0.2f).SetUpdate(true);   // Time.timeScale=0 대비

        // 팝업 스케일 인 (살짝 오버슈트)
        panel.localScale = Vector3.one * 0.7f;
        panel.DOScale(1f, 0.25f)
            .SetEase(Ease.OutBack)
            .SetUpdate(true)
            .OnComplete(() => canvasGroup.interactable = true);
    }

    public void Hide(System.Action onClosed = null)
    {
        canvasGroup.interactable = false;
        blocker.DOFade(0f, 0.15f).SetUpdate(true);
        panel.DOScale(0.7f, 0.15f).SetEase(Ease.InQuad).SetUpdate(true)
            .OnComplete(() =>
            {
                gameObject.SetActive(false);
                onClosed?.Invoke();
            });
    }
}
```

> `SetUpdate(true)` = unscaled time. `Time.timeScale = 0`으로 일시정지된 상태에서도 트윈이 진행되도록 한다.

> 모바일 게임 UI 애니메이션은 **DOTween / LeanTween**이 사실상 표준. Unity Animation Clip은 매 프레임 Animator를 돌려 idle 상태에서도 비용이 발생한다.

> 4.2~4.5 (무한 스크롤·탭 시스템·광고 배너·IAP 다이얼로그), 5(성능 최적화), 6(흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md) 참고

---

## 7. 언제 사용 / 언제 다른 시스템

| 상황 | 권장 |
|------|------|
| 게임 HUD, 팝업, 광고/IAP UI | **uGUI** (이 스킬) |
| 머리 위 닉네임/데미지 텍스트 | uGUI World Space Canvas |
| 옵션·설정 같은 정적 폼 UI | uGUI 또는 UI Toolkit (선택) |
| 에디터 툴 UI | **UI Toolkit** (런타임이 아니므로) |
| 데이터 바인딩 중심의 복잡한 메뉴 | UI Toolkit (단, 위 제약 검토 후) |

---

## 참고 자료

- [Unity Manual — UI Systems Comparison (Unity 6)](https://docs.unity3d.com/6000.3/Documentation/Manual/UI-system-compare.html)
- [Unity Scripting API — Screen.safeArea](https://docs.unity3d.com/ScriptReference/Screen-safeArea.html)
- [Unity How-to — UI optimization tips](https://unity.com/how-to/unity-ui-optimization-tips)
- [Unity Support — Split canvas for dynamic objects](https://support.unity.com/hc/en-us/articles/115000355466)
- [TextMeshPro — Fallback font assets](https://docs.unity3d.com/Packages/com.unity.ugui@2.5/manual/TextMeshPro/FontAssetsFallback.html)
- [Google AdMob — Anchored adaptive banners (Unity)](https://developers.google.com/admob/unity/banner/anchored-adaptive)
- [Unity Releases — Unity 6 LTS Support](https://unity.com/releases/unity-6/support)
- [GameDev.net — Unity UI Profiling: How dare you break my Batches?](https://www.gamedev.net/tutorials/programming/general-and-gameplay-programming/unity-ui-profiling-how-dare-you-break-my-batches-r5229/)

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
