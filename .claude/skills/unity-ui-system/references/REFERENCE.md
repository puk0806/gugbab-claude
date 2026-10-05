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
