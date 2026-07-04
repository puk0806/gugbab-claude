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

### 4.2 ScrollRect + Object Pool 무한 스크롤

긴 리스트(랭킹·상점 100+개 항목)에서 *모든 항목 GameObject*를 띄우면 setup·rebuild 비용이 폭발한다. 화면에 보이는 N개만 풀에서 재활용한다.

**핵심 아이디어:**
- ScrollRect content의 `RectTransform.sizeDelta`로 *전체 가상 높이*를 시뮬레이션
- Viewport에 보이는 인덱스만 계산해 GameObject N개를 재배치 + 데이터 바인딩
- 스크롤 위치 변경 시 화면 밖 항목을 풀로 반환, 새로 보일 항목을 풀에서 꺼냄

**최소 구현:**

```csharp
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class RecyclableListView : MonoBehaviour
{
    [SerializeField] private ScrollRect scrollRect;
    [SerializeField] private RectTransform content;
    [SerializeField] private RecyclableCell cellPrefab;
    [SerializeField] private float cellHeight = 120f;

    private readonly List<RecyclableCell> _pool = new();
    private readonly Dictionary<int, RecyclableCell> _visible = new();
    private IListDataSource _dataSource;
    private int _firstVisible = -1;
    private int _lastVisible = -1;

    public void Setup(IListDataSource source)
    {
        _dataSource = source;
        content.sizeDelta = new Vector2(content.sizeDelta.x, source.Count * cellHeight);
        scrollRect.onValueChanged.AddListener(_ => Refresh());
        Refresh();
    }

    private void Refresh()
    {
        var viewportHeight = scrollRect.viewport.rect.height;
        var contentY = content.anchoredPosition.y;          // 위로 스크롤할수록 양수
        var firstIdx = Mathf.Max(0, Mathf.FloorToInt(contentY / cellHeight));
        var lastIdx = Mathf.Min(_dataSource.Count - 1,
            Mathf.CeilToInt((contentY + viewportHeight) / cellHeight));

        if (firstIdx == _firstVisible && lastIdx == _lastVisible) return;

        // 화면 밖 셀 풀로 회수
        var toRemove = new List<int>();
        foreach (var (idx, cell) in _visible)
        {
            if (idx < firstIdx || idx > lastIdx)
            {
                cell.gameObject.SetActive(false);
                _pool.Add(cell);
                toRemove.Add(idx);
            }
        }
        foreach (var idx in toRemove) _visible.Remove(idx);

        // 새로 보일 셀 채우기
        for (int i = firstIdx; i <= lastIdx; i++)
        {
            if (_visible.ContainsKey(i)) continue;
            var cell = GetCell();
            var rect = cell.GetComponent<RectTransform>();
            rect.anchoredPosition = new Vector2(0, -i * cellHeight);
            cell.Bind(_dataSource.GetItem(i));
            _visible[i] = cell;
        }

        _firstVisible = firstIdx;
        _lastVisible = lastIdx;
    }

    private RecyclableCell GetCell()
    {
        if (_pool.Count > 0)
        {
            var cell = _pool[^1];
            _pool.RemoveAt(_pool.Count - 1);
            cell.gameObject.SetActive(true);
            return cell;
        }
        return Instantiate(cellPrefab, content);
    }
}

public interface IListDataSource
{
    int Count { get; }
    object GetItem(int index);
}

public abstract class RecyclableCell : MonoBehaviour
{
    public abstract void Bind(object data);
}
```

**더 견고한 구현이 필요하면** 오픈소스 라이브러리:
- `alfredo1995/recyclable-scroll-view`
- `disas69/Unity-PooledScrollList`

### 4.3 탭 시스템

```
Canvas_TabUI
  └ TabRoot
      ├ TabHeader (Horizontal Layout Group)
      │   ├ Tab1Button (Toggle, group=TabGroup)
      │   ├ Tab2Button
      │   └ Tab3Button
      └ TabContent (CardSwitcher)
          ├ Page1 (활성)
          ├ Page2 (비활성)
          └ Page3 (비활성)
```

- `Tab*Button`은 `Toggle` + `ToggleGroup`으로 묶음 → 단일 선택 보장
- `TabContent`는 페이지 GameObject를 SetActive(true/false)로 전환
- *모든 페이지를 메모리에 유지*하고 SetActive만 전환할지(빠른 전환, 메모리 多), 페이지 인스턴스화/Destroy(메모리 少, 전환 부드럽지 않음) 선택은 게임 규모에 따라

> 주의: `LayoutGroup`은 자식 변경 시마다 rebuild 비용이 든다. 탭 콘텐츠 내부는 *고정 레이아웃*(LayoutGroup 안 쓰기)을 권장.

### 4.4 광고 배너 컨테이너 — Safe Area 하단 배치

광고 배너(AdMob, AppLovin MAX 등)는 **네이티브 뷰**로 게임 화면 위에 오버레이된다. Unity Canvas와 동시 점유하지 않으므로, *광고가 차지할 영역만큼 게임 UI를 비워두는* 것이 핵심.

**구조:**

```
Canvas_Game (Safe Area Root)
  └ SafeAreaRoot
      ├ GameContent (stretch)
      └ AdBannerSpacer (하단, height = 광고 높이 + 50px 패딩)
```

**스페이서 높이 계산 (AdMob anchored adaptive 예시):**

```csharp
using GoogleMobileAds.Api;
using UnityEngine;

public class AdBannerSpacer : MonoBehaviour
{
    [SerializeField] private RectTransform spacer;
    [SerializeField] private float extraPadding = 50f; // AdMob 정책 권장

    public void ApplyBannerSize()
    {
        // 현재 방향 기준 anchored adaptive 사이즈
        var deviceWidthDp = MobileAds.Utils.GetDeviceScale() > 0
            ? Screen.width / MobileAds.Utils.GetDeviceScale()
            : Screen.width;
        var adSize = AdSize.GetCurrentOrientationAnchoredAdaptiveBannerAdSizeWithWidth(
            (int)deviceWidthDp);

        // dp → px 변환 (배너 높이를 게임 UI에 반영)
        var bannerHeightPx = adSize.Height * MobileAds.Utils.GetDeviceScale();
        spacer.sizeDelta = new Vector2(spacer.sizeDelta.x, bannerHeightPx + extraPadding);
    }
}
```

**원칙:**
- 광고와 게임 콘텐츠 사이 **최소 50px 패딩** (AdMob 정책 — 오클릭 방지)
- 배너는 *Safe Area 안쪽*에 배치 (노치/홈 인디케이터와 충돌 금지)
- 광고 로드 실패 시 스페이서를 0으로 줄여 UI가 안 비도록

### 4.5 IAP 구매 확인 다이얼로그

**원칙:**
1. **이중 확인** — 결제 직전 가격·상품명을 명시한 자체 확인 다이얼로그 표시 (스토어 네이티브 다이얼로그는 별도로 뜸)
2. **결제 중 차단** — IAP 호출 후 응답까지 입력 차단 Blocker 유지 + 스피너
3. **타임아웃** — 30~60초 응답 없으면 안내와 함께 차단 해제
4. **결과 피드백** — 성공/실패/취소 각각 다른 토스트 또는 다이얼로그

**상태 전이:**

```
Idle
  ↓ (구매 버튼 탭)
ConfirmDialog [상품·가격·확인/취소]
  ↓ 확인
Loading (Blocker + Spinner, 입력 차단)
  ↓ (IAP 콜백)
Success ─→ "구매 완료" 토스트 + 보상 지급
Failed  ─→ "구매에 실패했습니다" + 다시 시도 버튼
Cancel  ─→ Idle (조용히 닫음)
Pending ─→ "처리 중입니다. 잠시 후 확인됩니다" 안내
```

```csharp
public class IAPDialog : MonoBehaviour
{
    [SerializeField] private TMPro.TMP_Text titleText;
    [SerializeField] private TMPro.TMP_Text priceText;
    [SerializeField] private GameObject loadingBlocker;

    public void ShowConfirm(string productName, string localizedPrice,
                            System.Action onConfirmed)
    {
        titleText.text = productName;
        priceText.text = localizedPrice;
        // 확인 버튼 OnClick → ShowLoading() + onConfirmed()
    }

    public void ShowLoading() => loadingBlocker.SetActive(true);

    public void HandlePurchaseResult(PurchaseResult result)
    {
        loadingBlocker.SetActive(false);
        switch (result)
        {
            case PurchaseResult.Success: Toast.Show("구매 완료"); Close(); break;
            case PurchaseResult.Failed:  Toast.Show("구매 실패. 다시 시도해 주세요"); break;
            case PurchaseResult.Cancel:  Close(); break;
            case PurchaseResult.Pending: Toast.Show("처리 중입니다"); Close(); break;
        }
    }

    private void Close() { /* 팝업 닫기 */ }
}

public enum PurchaseResult { Success, Failed, Cancel, Pending }
```

> 주의: `localizedPrice`는 반드시 스토어에서 받아온 *로컬라이즈된* 가격(`₩4,400`, `$2.99`)을 표시한다. 하드코딩하면 환율·세금 변경 시 사용자 분쟁이 생긴다.

> 주의: IAP 결과 콜백은 *앱 재시작 후*에 들어올 수도 있다(영수증 검증 지연). UI 외에 **영수증 큐**가 별도 처리되어야 한다.

---

## 5. UI 성능 최적화

### 5.1 Draw Call Batching 조건

같은 Canvas 안의 UI 요소가 **하나의 draw call**로 묶이려면:

1. **같은 Material** — TMP는 Font Asset Material, Image는 sharedMaterial이 같아야 함
2. **같은 Texture / Atlas** — Image가 Sprite Atlas로 묶여 있으면 같은 텍스처로 인식
3. **Z-order(Hierarchy 순서) 사이에 다른 머티리얼이 끼지 않을 것** — A-B-A 순서로 다른 머티리얼이 끼면 batch 깨짐
4. **`Mask` 또는 `RectMask2D`로 잘리지 않을 것** — 별도 batch 발생

> `material` (instance) 대신 `sharedMaterial`을 쓴다. `renderer.material` 접근은 인스턴스를 복제해 batching을 깨뜨린다.

> Sprite Atlas (`Window → 2D → Sprite Atlas`)로 작은 UI 스프라이트를 1장의 텍스처로 묶으면 draw call이 극적으로 줄어든다.

### 5.2 Layout Rebuild 최소화

`LayoutGroup`(Vertical/Horizontal/Grid)과 `ContentSizeFitter`가 붙은 RectTransform은 자식 변경 시 `LayoutRebuilder.MarkLayoutForRebuild()`가 호출되고 *프레임 끝*에 재계산된다. 비용이 크다.

**금지 패턴:**

```csharp
// 매 프레임 SetText → 매 프레임 ContentSizeFitter rebuild
void Update() {
    scoreText.text = $"Score: {GameState.Score}";  // BAD if parent has ContentSizeFitter
}
```

**개선 패턴:**
- 점수 라벨은 *고정 너비* RectTransform 안에 두고 텍스트만 갱신
- `ContentSizeFitter`는 *내용이 자주 안 바뀌는* 곳에만 (다이얼로그 본문 등)
- 동적 리스트는 `LayoutGroup` 대신 *수동 anchoredPosition 계산* (4.2 예시처럼)

**`SetDirty` 남용 금지:**
- Graphic 컴포넌트의 색·이미지 변경은 자동으로 dirty 처리됨 → 수동 호출 불필요
- `LayoutRebuilder.ForceRebuildLayoutImmediate()`는 *동기 rebuild*로 프레임 중간에 비용 폭발 → 정말 필요할 때만

### 5.3 Overdraw 체크

`Scene 뷰 → Shading Mode → Overdraw`로 UI 겹침을 시각화한다. 빨갛게 보일수록 같은 픽셀을 여러 번 그린다.

**줄이는 방법:**
- 풀스크린 배경이 항상 가려진다면 `enabled = false`로 끔
- 알파 0인 Image는 `raycastTarget`만 살리고 *Source Image*를 비워 fill rate 절약 (Image 컴포넌트는 그대로 두되 sprite=null + Color.a=0)
- 큰 반투명 패널을 여러 겹 쌓지 않기

### 5.4 Raycast Target

`Graphic Raycaster`는 매 프레임 모든 raycast target=true Graphic에 대해 포인터 충돌 검사를 수행한다. 안 눌리는 UI(라벨, 배경, 아이콘)는 **반드시 Raycast Target 끔**.

**일괄 점검 스크립트(에디터 전용):**

```csharp
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

public static class RaycastTargetAuditor
{
    [MenuItem("Tools/UI/Disable RaycastTarget on non-interactive Graphics")]
    public static void Run()
    {
        var graphics = Object.FindObjectsByType<Graphic>(FindObjectsSortMode.None);
        int changed = 0;
        foreach (var g in graphics)
        {
            if (g.GetComponent<Selectable>() != null) continue;          // Button/Toggle 등은 유지
            if (g.GetComponent<EventTrigger>() != null) continue;
            if (g.raycastTarget)
            {
                Undo.RecordObject(g, "Disable RaycastTarget");
                g.raycastTarget = false;
                changed++;
            }
        }
        Debug.Log($"[RaycastTargetAuditor] {changed} graphics updated.");
    }
}
#endif
```

### 5.5 UI Profile 측정 방법

| 도구 | 메뉴 | 용도 |
|------|------|------|
| Profiler | Window → Analysis → Profiler | `Canvas.SendWillRenderCanvases`, `Canvas.BuildBatch` 비용 측정 |
| Frame Debugger | Window → Analysis → Frame Debugger | 실제 draw call 순서·머티리얼·batch break 원인 확인 |
| UI Profiler 모듈 | Profiler → UI/UI Details | Batch 수, Vertex 수, Canvas rebuild 횟수 |
| Memory Profiler 패키지 | Package Manager 설치 | 폰트 아틀라스·스프라이트 메모리 확인 |

**측정 순서:**
1. **Profiler CPU 모듈**에서 `Canvas.SendWillRenderCanvases`가 ms 단위로 튀는지 확인 → Canvas rebuild 과다
2. **UI 모듈**에서 Batch 수가 100+ 이면 batching 깨짐 의심 → Frame Debugger로 원인 추적
3. **Frame Debugger**에서 batch break 사유 확인 (다른 material / texture / mask 등)
4. **Scene Overdraw 뷰**로 GPU fill rate 점검

---

## 6. 흔한 실수 8종

1. **단일 거대 Canvas** — 게임 전체 UI를 Canvas 하나에 몰아넣어 작은 변화마다 전체 rebuild. → Static/Dynamic으로 분리.
2. **RebuildLayout 루프** — `LayoutGroup` 안에서 `ContentSizeFitter`가 부모 크기를 바꾸고 그게 다시 자식 layout을 trigger. → 부모-자식 양쪽에 LayoutGroup·SizeFitter 동시 사용 회피, 또는 한쪽만 두기.
3. **노치 미대응** — Anchor만 (1,1)로 설정하고 Safe Area 미적용. iPhone 14 Pro 이상에서 펀치홀에 메뉴 버튼이 잘림. → `SafeAreaFitter` 컴포넌트 강제 적용.
4. **`material` 인스턴스 사용** — `image.material.color = ...` 한 줄로 머티리얼 인스턴스가 생성되어 batching 파괴. → `sharedMaterial` 또는 `Graphic.color` 사용.
5. **Raycast Target 전체 활성화** — 라벨·배경까지 `raycastTarget=true` 상태로 두어 GraphicRaycaster 비용 누적. → 정기적 일괄 점검.
6. **World Space Canvas + Event Camera 미할당** — `Camera.main`을 매 프레임 7~10회 호출, 내부에 `FindObjectWithTag` 포함. → Event Camera 명시 할당.
7. **`Outline`/`Shadow` 컴포넌트로 텍스트 효과** — 메시를 4배 복제. → TMP Material Preset의 Outline/Underlay만 사용.
8. **Constant Pixel Size CanvasScaler** — 디바이스 DPI 차이로 폰트가 디바이스마다 달라보임. → Scale With Screen Size + Reference Resolution 사용.

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
