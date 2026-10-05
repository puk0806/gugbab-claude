## 4-A. v4 (레거시) 초기화 패턴 전체 코드

### v4 (레거시) — IStoreListener 패턴

```csharp
using UnityEngine;
using UnityEngine.Purchasing;

public class IapManagerV4 : MonoBehaviour, IStoreListener
{
    private IStoreController controller;
    private IExtensionProvider extensions;

    // 상품 ID 상수 (스토어 등록 ID와 일치해야 함)
    private const string CoinPackSmall = "coin_pack_small";       // Consumable
    private const string RemoveAds     = "remove_ads";            // NonConsumable
    private const string MonthlyPass   = "monthly_battle_pass";   // Subscription

    private void Start()
    {
        InitializePurchasing();
    }

    public void InitializePurchasing()
    {
        if (IsInitialized()) return;

        var builder = ConfigurationBuilder.Instance(StandardPurchasingModule.Instance());

        builder.AddProduct(CoinPackSmall, ProductType.Consumable);
        builder.AddProduct(RemoveAds,     ProductType.NonConsumable);
        builder.AddProduct(MonthlyPass,   ProductType.Subscription);

        UnityPurchasing.Initialize(this, builder);
    }

    private bool IsInitialized() => controller != null && extensions != null;

    // --- IStoreListener 구현 ---

    public void OnInitialized(IStoreController controller, IExtensionProvider extensions)
    {
        this.controller = controller;
        this.extensions = extensions;
        Debug.Log("Unity IAP 초기화 성공");
    }

    public void OnInitializeFailed(InitializationFailureReason error) { /* 호환용, 사용 안 함 */ }

    public void OnInitializeFailed(InitializationFailureReason error, string message)
    {
        // InitializationFailureReason 주요 값:
        //   PurchasingUnavailable    — 기기 설정에서 결제 비활성화
        //   NoProductsAvailable      — 스토어 등록·상품 메타데이터 누락
        //   AppNotKnown              — 스토어에 앱이 등록되지 않음
        Debug.LogError($"Unity IAP 초기화 실패: {error} / {message}");
    }

    public PurchaseProcessingResult ProcessPurchase(PurchaseEventArgs args) { /* 5절 참고 */ return PurchaseProcessingResult.Complete; }

    public void OnPurchaseFailed(Product product, PurchaseFailureReason reason)
    {
        Debug.LogWarning($"구매 실패: {product.definition.id} ({reason})");
    }
}
```

---

## 5-A. v4 ProcessPurchase 전체 코드

**v4: `ProcessPurchase` 반환값 의미**

```csharp
public PurchaseProcessingResult ProcessPurchase(PurchaseEventArgs args)
{
    string id = args.purchasedProduct.definition.id;

    switch (id)
    {
        case CoinPackSmall:
            // (1) 영수증 검증
            if (!IsValidReceipt(args.purchasedProduct.receipt)) {
                Debug.LogError("영수증 검증 실패");
                return PurchaseProcessingResult.Complete; // 또는 Pending 후 별도 처리
            }

            // (2) 아이템 지급 — 서버 동기화가 필요하면 Pending 사용
            //     로컬에서만 처리하면 Complete
            GrantCoins(100);
            return PurchaseProcessingResult.Complete;

        case RemoveAds:
            UnlockAdRemoval();
            return PurchaseProcessingResult.Complete;

        case MonthlyPass:
            ActivateBattlePass();
            return PurchaseProcessingResult.Complete;
    }
    return PurchaseProcessingResult.Complete;
}
```

---

### 6.1 클라이언트 검증 (CrossPlatformValidator) — v4 패턴

Unity IAP에 내장된 검증 도구. **로컬에서만 쓰이는 콘텐츠(예: 해금)**에 한해 권장.

#### 6.1.1 Tangle 파일 생성

1. `Window > Unity IAP > Receipt Obfuscator` 메뉴 열기
2. Google Play Public Key 입력 (Google Play Console → Monetize → License keys)
3. `Obfuscate Apple/Google Play` 클릭
4. `Assets/Plugins/UnityPurchasing/generated/` 아래에 다음 파일 생성:
   - `GooglePlayTangle.cs`
   - `AppleTangle.cs`
   - `AppleStoreKitTestTangle.cs` (선택)

#### 6.1.2 검증 코드

```csharp
using UnityEngine.Purchasing.Security;

private bool IsValidReceipt(string receipt)
{
#if UNITY_ANDROID || UNITY_IOS || UNITY_STANDALONE_OSX
    var validator = new CrossPlatformValidator(
        GooglePlayTangle.Data(),
        AppleTangle.Data(),
        Application.identifier
    );

    try {
        IPurchaseReceipt[] results = validator.Validate(receipt);
        foreach (var r in results) {
            Debug.Log($"유효 영수증: {r.productID} (구매일 {r.purchaseDate})");
        }
        return true;
    } catch (IAPSecurityException e) {
        Debug.LogError($"영수증 위조 의심: {e.Message}");
        return false;
    }
#else
    return true; // 에디터·미지원 플랫폼은 통과
#endif
}
```

> 주의: `CrossPlatformValidator`는 **Google Play / Apple App Store / Mac App Store**만 지원한다. Amazon·UDP 등은 자체 검증을 따로 구현해야 한다.

---

## 7-A. 구매 복원 v4 패턴

### v4 패턴

```csharp
public void RestorePurchases()
{
#if UNITY_IOS || UNITY_STANDALONE_OSX
    var apple = extensions.GetExtension<IAppleExtensions>();
    apple.RestoreTransactions((success, error) => {
        if (success) Debug.Log("복원 요청 성공 (ProcessPurchase로 개별 항목 전달됨)");
        else Debug.LogWarning($"복원 실패: {error}");
    });
#elif UNITY_ANDROID
    // Google Play는 구매 이력이 자동 동기화되지만, 명시적 호출 가능
    var google = extensions.GetExtension<IGooglePlayStoreExtensions>();
    google.RestoreTransactions((success, error) => {
        Debug.Log($"Google Play 복원: success={success}, error={error}");
    });
#endif
}
```

복원이 성공하면 비소모품·구독에 대해 `ProcessPurchase`가 다시 호출된다. **소모품은 복원되지 않는다.**

---

### v4 — SubscriptionManager / SubscriptionInfo

```csharp
using UnityEngine.Purchasing;

public bool IsBattlePassActive()
{
    var product = controller.products.WithID(MonthlyPass);
    if (product == null || string.IsNullOrEmpty(product.receipt)) return false;

    try {
        var sm = new SubscriptionManager(product, null);
        SubscriptionInfo info = sm.getSubscriptionInfo();

        if (info.isSubscribed() == Result.True && info.isExpired() == Result.False) {
            return true;
        }
    } catch (System.Exception e) {
        Debug.LogWarning($"구독 정보 파싱 실패: {e.Message}");
    }
    return false;
}
```

`SubscriptionInfo` 주요 메서드 (호출 시점의 현재 시각을 기준으로 계산되므로 캐싱해도 동적으로 값이 변한다):

| 메서드 | 반환 | 의미 |
|--------|------|------|
| `isSubscribed()` | `Result` (True/False/Unsupported) | 현재 구독 활성 여부 |
| `isExpired()` | `Result` | 만료됐는지 |
| `isCancelled()` | `Result` | 취소 예약 상태 (다음 갱신일에 종료) |
| `isAutoRenewing()` | `Result` | 자동 갱신 활성 여부 |
| `getRemainingTime()` | `TimeSpan` | 다음 갱신/만료까지 남은 시간 |
| `getFreeTrialPeriod()` | `TimeSpan` | 무료 체험 기간 (Apple은 `TimeSpan.Zero` 반환 — `isFreeTrial()` 사용 권장) |
| `isFreeTrial()` | `Result` | 무료 체험 중 여부 |

> 주의: Apple **비소모품** 상품에 `SubscriptionManager`를 사용하면 `Result.Unsupported`가 반환된다. 구독 상품(`ProductType.Subscription`)에만 사용한다.

## 10. 흔한 실수 (Anti-Pattern)

| 실수 | 결과 | 해결 |
|------|------|------|
| `ProcessPurchase`에서 `Complete`/`Pending` 누락 또는 잘못된 반환 | 앱 재시작마다 `ProcessPurchase` 무한 재호출 → 아이템 중복 지급 | 서버 동기화 필요하면 `Pending` + 완료 시 `ConfirmPendingPurchase`. 로컬 처리만이면 `Complete` |
| 영수증 검증 없이 아이템 지급 | 위조 영수증으로 무료 아이템 획득됨 | 가상 화폐는 서버 검증 필수, 단순 해금은 `CrossPlatformValidator`로 최소 방어 |
| iOS "구매 복원" 버튼 미구현 | App Store Review 거절 (Guideline 3.1.1) | 비소모품·구독 상품이 있으면 반드시 UI에 "구매 복원" 노출 |
| 초기화 완료 전 구매 시도 | `controller` null → `NullReferenceException` | `IsInitialized()` 가드 또는 v5의 `await Connect()` 후에만 구매 버튼 활성화 |
| Consumable 아이템에 `NonConsumable` 타입 지정 | 한 번 구매 후 영원히 재구매 불가 (이미 보유로 인식) | 코인·에너지 등 반복 구매 상품은 반드시 `ProductType.Consumable` |
| Consumable을 서버 인벤토리에 저장하면서 `Complete` 반환 | 네트워크 끊김 시 결제는 되고 아이템은 안 들어감 | 반드시 `Pending` → 서버 응답 받은 뒤 `ConfirmPendingPurchase` |
| `UserCancelled` 실패를 에러 토스트로 표시 | 사용자가 직접 취소했는데 에러 메시지가 떠서 혼란 | `OnPurchaseFailed`에서 `UserCancelled`는 무시 |
| v5 `OnPurchasePending`에서 `ConfirmPurchase` 호출 안 함 | 모든 구매가 영원히 Pending 상태 → 다음 실행에 재처리 → 중복 지급 | 처리 완료 후 반드시 `storeController.ConfirmPurchase(order)` |
| Tangle 파일을 GitHub에 커밋 | Google Play 라이선스 키 노출(obfuscated여도 추출 가능) | `.gitignore`에 `Assets/Plugins/UnityPurchasing/generated/*Tangle.cs` 추가 권장 |
| 같은 상품을 IAP Catalog + 코드 양쪽에서 중복 등록 | 초기화 시 `DuplicateProduct` 오류 | 하나만 사용 |
