---
name: unity-iap
description: >
  Unity In-App Purchasing(IAP) SDK를 Unity 2D 모바일 게임에 통합하는 방법.
  소모품(Consumable)/비소모품(Non-Consumable)/구독(Subscription) 3종 + 영수증 검증 + iOS 복원.
  Unity 6 LTS 호환 IAP 5.3.x 신 API(StoreController / OnPurchasePending)와 4.15.x 레거시 API(IStoreListener / ProcessPurchase) 모두 다룸.
  <example>사용자: "Unity 모바일 게임에 인앱결제 붙이려면?"</example>
  <example>사용자: "IAP에서 ProcessPurchase에서 Complete를 반환해야 하나 Pending을 반환해야 하나?"</example>
  <example>사용자: "iOS 인앱결제 심사 거절됐는데 구매 복원 버튼이 필요하다는데?"</example>
---

# Unity In-App Purchasing 통합 (Unity 2D 모바일 게임)

> 소스:
> - [Unity In-App Purchasing 공식 문서 (Unity Docs)](https://docs.unity.com/en-us/iap)
> - [Get started with Unity IAP](https://docs.unity.com/en-us/iap/get-started)
> - [Upgrade from IAP v4 to v5](https://docs.unity.com/ugs/en-us/manual/iap/manual/upgrade-to-iap-v5)
> - [Receipt validation](https://docs.unity.com/ugs/en-us/manual/iap/manual/receipt-validation)
> - [SubscriptionInfo class reference](https://docs.unity.com/ugs/en-us/manual/iap/manual/subscriptioninfo-class-reference)
> - [IAP Catalog window reference](https://docs.unity.com/ugs/en-us/manual/iap/manual/iap-catalog-window-reference)
> - [Define your products](https://docs.unity.com/ugs/en-us/manual/iap/manual/define-your-products)
> - [Interface IStoreListener (5.0)](https://docs.unity3d.com/Packages/com.unity.purchasing@5.0/api/UnityEngine.Purchasing.IStoreListener.html)
> - [Class UnityIAPServices (5.1)](https://docs.unity3d.com/Packages/com.unity.purchasing@5.1/api/UnityEngine.Purchasing.UnityIAPServices.html)
> - [Changelog (5.0.4)](https://docs.unity3d.com/Packages/com.unity.purchasing@5.0/changelog/CHANGELOG.html)
> - [Why upgrade to IAP v5.x (Unity Support)](https://support.unity.com/hc/en-us/articles/47757890052372-Why-you-should-upgrade-to-Unity-In-App-Purchasing-IAP-v5-x)
> - GitHub Releases: [needle-mirror/com.unity.purchasing](https://github.com/needle-mirror/com.unity.purchasing/releases)
> 검증일: 2026-06-09
> 대상 버전: Unity IAP **5.3.1** (2026-05-27 릴리스) 권장, 레거시 호환은 **4.15.1** (2026-04-21). Unity 6 LTS / Unity 2022.3 LTS 호환

---

## 1. Unity IAP 개요

Unity IAP는 Google Play / App Store / Amazon / Mac App Store 등 다중 스토어에 대해 통합 API를 제공하는 결제 SDK다.

| 항목 | 내용 |
|------|------|
| 공식 패키지명 | `com.unity.purchasing` |
| 최신 안정 버전 | **5.3.1** (2026-05-27) — v5 신 API 권장 |
| 레거시 안정 버전 | **4.15.1** (2026-04-21) — v4 레거시 API 호환 유지 |
| 지원 Unity Editor | Unity 6 LTS (6000.x), Unity 2022.3 LTS |
| 지원 스토어 | Google Play, App Store, Amazon Appstore, Mac App Store, UDP, Windows Store |
| Unity Gaming Services | 선택(IAP Catalog 클라우드 동기화·Analytics 통합 시 활성화) |
| Google Play Billing Library | v5.x → BL 8 자동 지원, v4.14+ → BL 7 지원 |
| Apple StoreKit | v5.x → StoreKit 2 자동, v4.x → StoreKit 1 |

### 두 가지 API 세대 — 신규 프로젝트는 v5 사용

| 구분 | v4 (4.15.1, 레거시) | v5 (5.3.1, 권장) |
|------|---------------------|-------------------|
| 진입점 | `UnityPurchasing.Initialize(listener, builder)` | `UnityIAPServices.StoreController()` |
| 콜백 모델 | `IStoreListener` 인터페이스 구현 | 이벤트 핸들러(`OnPurchasePending` 등) |
| 초기화 | 동기 단일 호출 | 비동기 3단계(Connect → FetchProducts → FetchPurchases) |
| 상품 정의 | `ConfigurationBuilder.AddProduct` | `ProductDefinition` 리스트 + `FetchProducts()` |
| 구매 시작 | `controller.InitiatePurchase(productId)` | `storeController.PurchaseProduct(productId)` |
| 구매 완료 처리 | `ProcessPurchase` → `Complete` / `Pending` | `OnPurchasePending` → `ConfirmPurchase(order)` |
| 영수증 (Apple) | `product.receipt` (StoreKit 1 payload) | `IAppleOrderInfo.jwsRepresentation` (StoreKit 2 JWS) |
| iOS 복원 | `IAppleExtensions.RestoreTransactions(cb)` | `IAppleStoreExtendedService.RestoreTransactions(cb)` 또는 `FetchPurchases()` |
| 구독 정보 | `SubscriptionManager`/`SubscriptionInfo` (deprecated 예정) | `Orders` + `CheckEntitlement` |

> 주의: v4 `IStoreListener`/`ConfigurationBuilder`/`SubscriptionManager`는 v5에서 **deprecated**이지만 호환을 위해 5.x 패키지 안에서도 여전히 동작한다. **신규 프로젝트는 v5 신 API 사용을 권장**한다. 본 스킬은 두 패턴 모두 다루되, 각 절에서 v4·v5를 라벨로 구분한다.

---

## 2. SDK 설치 및 초기 설정

### Unity Package Manager로 설치

1. Unity Editor → `Window > Package Manager`
2. `Unity Registry` 탭에서 **In-App Purchasing** 검색 → `Install`
3. 또는 `+` → `Add package by name…` → `com.unity.purchasing` 입력

### (선택) Unity Gaming Services 연동

`Project Settings > Services > In-App Purchasing`에서 토글 활성화하면 IAP Catalog 클라우드 동기화, Analytics 통합, 영수증 검증 서비스(UGS)를 사용할 수 있다. 클라이언트 IAP만 쓸 거면 활성화하지 않아도 동작한다.

### Android 빌드 사전 설정

1. `Edit > Project Settings > Player > Android > Other Settings`
   - Target API Level: 34 이상 (Google Play 2026 요구사항)
   - Scripting Backend: IL2CPP, Target Architectures: ARMv7 + ARM64
2. `Publishing Settings`에서 **Custom Main Gradle Template** / **Custom Main Manifest** 활성화(필요 시)
3. Google Play Console에서 앱 등록 후 **App signing key** SHA-1 등록 → 상품 등록(`Monetize > In-app products`)

### iOS 빌드 사전 설정

- StoreKit 프레임워크는 Unity가 빌드 후 자동 포함한다.
- App Store Connect에서 앱 등록 후 **In-App Purchases** 섹션에서 상품 등록.
- Sandbox 테스트 계정 발급(`Users and Access > Sandbox Testers`).
- iOS 디바이스 `Settings > App Store > Sandbox Account`로 로그인한 뒤 테스트 빌드 실행.

---

## 3. IAP Catalog 설정 — Codeless 또는 코드 두 방식

상품 정의 방법은 두 가지다. 둘 다 동일하게 잘 동작하지만 게임 프로젝트에선 **코드 방식**이 일반적이다.

### 방식 A. IAP Catalog GUI (Codeless)

- `Services > In-App Purchasing > IAP Catalog` (또는 `Window > Unity IAP > IAP Catalog`) 열기
- `Add Product`로 상품 추가
  - `Product ID`: 스토어와 통신할 식별자 (예: `coin_pack_small`)
  - `Type`: `Consumable` / `Non-Consumable` / `Subscription`
  - `Store ID Overrides`: 스토어별 ID가 다를 때 매핑
- 저장하면 `Assets/Resources/IAPProductCatalog.json`이 생성된다. 코드에서 `ProductCatalog.LoadDefaultCatalog()`로 로드 가능.

### 방식 B. 코드로 직접 정의 (권장)

다음 절의 초기화 예제를 참고. 상품 ID·타입을 코드에서 명시한다.

> 주의: 같은 상품을 Codeless와 Coded 양쪽에서 중복 등록하면 초기화 시 `DuplicateProduct` 오류가 발생한다. 둘 중 하나만 사용한다.

---

## 4. 초기화 패턴

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

### v5 (권장) — StoreController + 이벤트 핸들러

```csharp
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Purchasing;

public class IapManagerV5 : MonoBehaviour
{
    private StoreController storeController;

    private const string CoinPackSmall = "coin_pack_small";
    private const string RemoveAds     = "remove_ads";
    private const string MonthlyPass   = "monthly_battle_pass";

    private async void Start()
    {
        await InitializeIap();
    }

    private async System.Threading.Tasks.Task InitializeIap()
    {
        storeController = UnityIAPServices.StoreController();

        // 이벤트 구독은 Connect() 호출 전에
        storeController.OnPurchasePending  += OnPurchasePending;
        storeController.OnPurchaseFailed   += OnPurchaseFailed;
        storeController.OnProductsFetched  += OnProductsFetched;
        storeController.OnPurchasesFetched += OnPurchasesFetched;

        // 1단계: 스토어 연결
        await storeController.Connect();

        // 2단계: 상품 가져오기
        var products = new List<ProductDefinition>
        {
            new(CoinPackSmall, ProductType.Consumable),
            new(RemoveAds,     ProductType.NonConsumable),
            new(MonthlyPass,   ProductType.Subscription),
        };
        storeController.FetchProducts(products);
    }

    private void OnProductsFetched(List<Product> products)
    {
        Debug.Log($"상품 {products.Count}개 로드 완료");
        // 3단계: 이전 구매 이력 가져오기 (비소모품·구독 복원 포함)
        storeController.FetchPurchases();
    }

    private void OnPurchasesFetched(Orders orders) { /* 6절 참고 */ }
    private void OnPurchasePending(PendingOrder order) { /* 5절 참고 */ }
    private void OnPurchaseFailed(FailedOrder order)
    {
        Debug.LogWarning($"구매 실패: {order.Info.ProductId} ({order.FailureReason})");
    }
}
```

> 주의: v5의 `Connect()`는 비동기이므로 반드시 `await`한다. `FetchProducts`·`FetchPurchases`는 콜백 기반이므로 이벤트 구독을 먼저 해야 누락이 없다.

---

## 5. 구매 흐름

### 5.1 구매 시작

```csharp
// v4
public void BuyCoinPack() => controller.InitiatePurchase(CoinPackSmall);

// v5
public void BuyCoinPack() => storeController.PurchaseProduct(CoinPackSmall);
```

### 5.2 구매 완료 처리 — Complete vs Pending (가장 중요)

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

| 반환값 | 의미 | 사용 시점 |
|--------|------|----------|
| `PurchaseProcessingResult.Complete` | 처리 완료. 트랜잭션 닫힘 | 로컬 처리만 / 이미 영구 기록 완료 |
| `PurchaseProcessingResult.Pending` | 처리 보류. 다음 앱 실행 시 `ProcessPurchase` 재호출 | 서버 검증·동기화 대기 중. 완료 후 `controller.ConfirmPendingPurchase(product)` 호출 필수 |

> 주의: **소모품을 서버 인벤토리에 저장한다면 반드시 `Pending` 반환 + 서버 응답 받은 뒤 `ConfirmPendingPurchase` 호출**. `Complete`를 그냥 반환하면 서버 저장 실패 시 결제는 받고 아이템은 못 주는 사고가 발생한다.

**v5: `OnPurchasePending` 패턴**

```csharp
private async void OnPurchasePending(PendingOrder order)
{
    string id = order.Info.ProductId;

    // (1) 서버 측 검증 (권장)
    bool ok = await ValidateOnServer(order);
    if (!ok) {
        Debug.LogError($"서버 검증 실패: {id}");
        return; // ConfirmPurchase 호출 안 함 → 다음 실행에서 재시도
    }

    // (2) 아이템 지급
    switch (id) {
        case CoinPackSmall: GrantCoins(100); break;
        case RemoveAds:     UnlockAdRemoval(); break;
        case MonthlyPass:   ActivateBattlePass(); break;
    }

    // (3) 처리 완료 확정 — 호출 안 하면 다음 실행 때 다시 OnPurchasePending이 발생
    storeController.ConfirmPurchase(order);
}
```

> 주의: v5에서는 v4의 `Complete`/`Pending` 이분법이 없어졌다. `ConfirmPurchase(order)`를 호출하면 v4의 `Complete`와 동일한 효과다. 호출하지 않으면 자동으로 Pending 상태로 유지된다.

### 5.3 구매 실패 처리

```csharp
// v4
public void OnPurchaseFailed(Product product, PurchaseFailureReason reason)
{
    // PurchaseFailureReason: UserCancelled, PaymentDeclined, ProductUnavailable,
    //                        SignatureInvalid, DuplicateTransaction, ExistingPurchasePending,
    //                        Unknown 등
    if (reason == PurchaseFailureReason.UserCancelled) return; // 사용자가 취소한 건 로그만
    ShowErrorToast($"구매에 실패했습니다: {reason}");
}

// v5
private void OnPurchaseFailed(FailedOrder order)
{
    if (order.FailureReason == PurchaseFailureReason.UserCancelled) return;
    ShowErrorToast($"구매에 실패했습니다: {order.FailureReason} / {order.Details}");
}
```

---

## 6. 영수증 검증

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

### 6.2 서버 검증 (권장)

**가상 화폐·서버 인벤토리·구독 상태처럼 백엔드가 진실 소스가 되는 경우 서버 검증이 필수**다.

전송 형식 요약:

| 플랫폼 | 클라이언트가 서버로 보낼 페이로드 | 서버가 검증할 엔드포인트 |
|--------|-----------------------------------|---------------------------|
| Google Play | `product.receipt` JSON의 `payload.json` 부분 → `purchaseToken` + `productId` | Google Play Developer API `purchases.products.get` / `purchases.subscriptionsv2.get` |
| Apple App Store (v4·StoreKit 1) | `product.receipt` JSON의 `payload`(base64 영수증) | App Store Server API `verifyReceipt`(deprecated) / `Get Transaction History` |
| Apple App Store (v5·StoreKit 2) | `IAppleOrderInfo.jwsRepresentation` (JWS 토큰) | App Store Server API JWS 검증 |

```csharp
// v5에서 Apple JWS 추출 예시
private void OnPurchasePending(PendingOrder order)
{
    string token;
    if (order.Info is IAppleOrderInfo appleInfo) {
        token = appleInfo.jwsRepresentation; // StoreKit 2 JWS
    } else {
        token = order.Info.Receipt; // Google Play 등
    }
    SendToServer(order.Info.ProductId, token);
}
```

> 주의: 클라이언트 검증만으로는 **루팅·탈옥 기기에서 위조 영수증을 막을 수 없다**. 가상 화폐를 서버 인벤토리에 적립한다면 반드시 서버 검증을 구현한다.

---

## 7. 비소모품·구독 복원 (iOS 필수)

Apple App Store Review Guideline 3.1.1 — **비소모품/구독 상품을 판매하는 앱은 "구매 복원" UI를 명시적으로 제공해야 하며, Unity IAP는 자동으로 호출하지 않는다.** 미구현 시 심사 거절된다.

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

### v5 패턴

```csharp
public void RestorePurchases()
{
#if UNITY_IOS || UNITY_STANDALONE_OSX
    var apple = UnityIAPServices.StoreExtendedService<IAppleStoreExtendedService>();
    apple?.RestoreTransactions((success, error) => {
        Debug.Log($"Apple 복원 결과: {success} / {error}");
    });
#endif
    // 또는 단순히 다시 fetch
    storeController.FetchPurchases();
}
```

### UI 체크리스트

- 설정 화면 또는 상점 화면 어딘가에 **"구매 복원" 버튼** 노출
- 비소모품 또는 구독 상품이 하나라도 있으면 iOS·macOS 빌드에 필수
- Android 전용 빌드라면 생략 가능(Google Play는 자동 동기화)

---

## 8. 구독 관리

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

### v5 — Orders + CheckEntitlement

```csharp
public bool IsBattlePassActive(Orders orders)
{
    foreach (var order in orders.ConfirmedOrders) {
        if (order.Info.ProductId == MonthlyPass) {
            return order.IsStockValid; // 만료된 구독은 false
        }
    }
    return false;
}

// 단일 상품 권한 즉시 확인
public void CheckBattlePass()
{
    storeController.OnCheckEntitlement += result => {
        Debug.Log($"BattlePass 권한: {result.IsEntitled}");
    };
    storeController.CheckEntitlement(MonthlyPass);
}
```

> 주의: v5에서 `SubscriptionManager`는 deprecated이지만 5.x 패키지에서도 호환을 위해 동작한다. **신규 코드는 v5 `Orders`/`CheckEntitlement` 패턴을 권장**한다.

---

## 9. 스토어별 추가 설정

### Google Play

- `build.gradle` 자동 생성: IAP 패키지가 Billing Library를 의존성에 자동 추가 (v5.x → BL 8, v4.15+ → BL 7)
- App Bundle(`.aab`)로 빌드, **업로드 키 + 앱 서명 키** 정확히 설정
- 라이선스 키: `Play Console > Monetize > License keys` → `CrossPlatformValidator`용 obfuscator에 입력
- 테스트: **내부 테스트 트랙** 업로드 후 **License Testers** 등록한 Google 계정으로 디바이스 로그인

### App Store

- `Bundle ID`가 App Store Connect 등록 ID와 정확히 일치해야 함
- 상품 ID에 점(`.`)·하이픈(`-`)·언더스코어(`_`)만 사용. 대문자 가능
- **Sandbox 테스터 계정**으로 디바이스 로그인 후 테스트 (실 Apple ID는 절대 사용 금지)
- StoreKit Configuration 파일(`.storekit`)을 사용하면 Xcode에서 결제 시뮬레이션 가능 (Apple Developer 등록 전 테스트용)

### 두 스토어 공통 — 상품 ID 명명 규칙

- 짧고 명확하게: `coin_pack_small`, `remove_ads`, `monthly_battle_pass`
- 한 번 등록한 상품 ID는 **변경 불가**. 신중히 정한다.
- 스토어별 ID가 달라야 한다면 `builder.AddProduct(commonId, type, new IDs { { "id_google", GooglePlay.Name } })` 또는 IAP Catalog의 Store ID Overrides 사용

---

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

---

## 11. 빠른 의사결정 표

| 상황 | 권장 패턴 |
|------|-----------|
| 신규 프로젝트, Unity 6 LTS | **IAP v5 (5.3.x)** + v5 신 API |
| 기존 v4 코드 유지보수만 | **IAP 4.15.1** + `IStoreListener` (BL 7 자동 지원) |
| 코인·에너지 등 반복 구매 | `ProductType.Consumable` + 서버 검증 + Pending 패턴 |
| 광고 제거·캐릭터 해금 | `ProductType.NonConsumable` + `CrossPlatformValidator` |
| 월정액·시즌패스 | `ProductType.Subscription` + 서버 검증 + v5 `CheckEntitlement` |
| iOS 빌드 (비소모품/구독 포함) | "구매 복원" 버튼 **필수** |
| Android 전용 빌드 | "구매 복원" 버튼 생략 가능 (Google Play 자동 복원) |
| 가상 화폐·서버 인벤토리 | 클라 검증만 X → **서버 검증 필수** |
