---
name: unity-firebase
description: >
  Unity 2D 모바일 게임에 Firebase Unity SDK 13.x를 통합하는 패턴 모음.
  Analytics(LogEvent·SetUserProperty·수익화 이벤트), Crashlytics(LogException·SetUserId·SetCustomKey),
  Remote Config(FetchAndActivateAsync·SetDefaultsAsync·A/B 테스트),
  FCM(MessageReceived·TokenReceived·SubscribeAsync) 사용법과 흔한 실수 패턴 정리.
---

# Unity Firebase SDK 통합 스킬 (2D 모바일 게임)

> 소스:
> - Firebase Unity SDK 공식 문서: https://firebase.google.com/docs/unity/setup
> - Firebase Unity SDK Release Notes: https://firebase.google.com/support/release-notes/unity
> - Firebase Unity SDK GitHub: https://github.com/firebase/firebase-unity-sdk
> - Analytics Events: https://firebase.google.com/docs/analytics/unity/events
> - Crashlytics Customize: https://firebase.google.com/docs/crashlytics/unity/customize-crash-reports
> - Remote Config: https://firebase.google.com/docs/remote-config/unity/get-started
> - FCM: https://firebase.google.com/docs/cloud-messaging/unity/get-started
> - Troubleshooting: https://firebase.google.com/docs/unity/troubleshooting-faq
>
> 검증일: 2026-06-10
> 대상 버전: Firebase Unity SDK 13.12.0 (2026-06-04 릴리즈, C++ SDK 13.8.0 / Android BoM 34.14.0 / iOS Cocoapods 12.14.0)

---

## 0. 버전·환경 요구사항

| 항목 | 요구 |
|------|------|
| Firebase Unity SDK | 13.12.0 (최신 안정 / 2026-06 기준) |
| Unity Editor | 2021 LTS 이상 (공식 최소 지원) |
| Unity 6 LTS | 공식 문서에 "Unity 6 명시 지원" 표기는 없지만 2021 LTS 이상 정책상 호환. 실 빌드 시 EDM4U 최신 버전 유지 권장 |
| iOS | 15+, Xcode 26.2+, CocoaPods 1.12.0+ |
| Android | API 23+ (minSdk 24 권장 — 후술), Google Play services 필요 |

> 주의: 공식 문서는 "Unity 2021 LTS 이상"만 명시한다. Unity 6 LTS 사용 시 빌드 실패가 발생하면 EDM4U와 Firebase SDK 모두 13.x 최신으로 맞추고 .unitypackage / UPM 혼용 여부를 먼저 확인한다.

---

## 1. 설치 (EDM4U + 패키지)

### 1-1. 설치 경로 둘 중 하나만 선택 (혼용 금지)

| 방식 | 장점 | 단점 |
|------|------|------|
| **UPM (권장)** | 업데이트 쉬움, EDM4U 자동 dependency | 스코프 레지스트리 설정 필요 |
| **.unitypackage** | 즉시 import | 업데이트 수동, EDM4U 충돌 가능 |

> 주의: 같은 프로젝트에 UPM과 .unitypackage를 동시에 설치하면 EDM4U가 충돌 해결을 못 한다. **반드시 한 방식으로만** 통일한다.

### 1-2. UPM 방식 (권장)

`Packages/manifest.json`에 Google Game Package Registry 추가:

```json
{
  "scopedRegistries": [
    {
      "name": "Game Package Registry by Google",
      "url": "https://unityregistry-pa.googleapis.com",
      "scopes": [
        "com.google"
      ]
    }
  ],
  "dependencies": {
    "com.google.external-dependency-manager": "1.2.183",
    "com.google.firebase.app": "13.12.0",
    "com.google.firebase.analytics": "13.12.0",
    "com.google.firebase.crashlytics": "13.12.0",
    "com.google.firebase.remote-config": "13.12.0",
    "com.google.firebase.messaging": "13.12.0"
  }
}
```

`Window > Package Manager`에서 추가 후 패키지가 자동 import된다.

### 1-3. 플랫폼 설정 파일

- **Android**: Firebase Console → 프로젝트 설정 → Android 앱에서 `google-services.json` 다운로드 → **`Assets/` 루트**에 배치
- **iOS**: Firebase Console → 프로젝트 설정 → iOS 앱에서 `GoogleService-Info.plist` 다운로드 → **`Assets/` 루트**에 배치

> 주의: 파일명 뒤에 `(1)`, `(2)` 같은 문자가 붙으면 SDK가 인식 못 한다. 다시 다운로드해서 덮어쓴다.

---

## 2. 초기화 패턴 (모든 Firebase 사용 전 필수)

```csharp
using System.Threading.Tasks;
using Firebase;
using Firebase.Extensions;
using UnityEngine;

public class FirebaseBootstrap : MonoBehaviour
{
    public static bool IsReady { get; private set; }
    private static FirebaseApp _app;

    private void Awake()
    {
        DontDestroyOnLoad(gameObject);
        InitializeAsync();
    }

    private void InitializeAsync()
    {
        FirebaseApp.CheckAndFixDependenciesAsync().ContinueWithOnMainThread(task =>
        {
            var status = task.Result;
            if (status == DependencyStatus.Available)
            {
                _app = FirebaseApp.DefaultInstance;
                IsReady = true;
                Debug.Log("[Firebase] Initialized");
            }
            else
            {
                Debug.LogError($"[Firebase] Dependency error: {status}");
                // 게임은 계속 진행하되 Firebase 호출은 막아야 한다
            }
        });
    }
}
```

> 주의: `ContinueWithOnMainThread`는 `Firebase.Extensions` 네임스페이스다. Unity API(UI 갱신, GameObject 접근)를 콜백에서 호출하려면 반드시 이걸 써야 한다. 일반 `ContinueWith`를 쓰면 백그라운드 스레드에서 실행되어 NullReferenceException이 자주 발생한다.

---

## 3. Firebase Analytics

### 3-1. 권장 이벤트 상수 (수익화 핵심)

| 게임 시나리오 | 권장 이벤트 상수 | 주요 파라미터 |
|---------------|------------------|---------------|
| 광고 노출 | `EventAdImpression` | `ParameterAdPlatform`, `ParameterAdSource`, `ParameterAdFormat`, `ParameterAdUnitName`, `ParameterValue`, `ParameterCurrency` |
| IAP 구매 | `EventPurchase` | `ParameterValue`, `ParameterCurrency`, `ParameterTransactionId`, `ParameterItems` |
| 레벨 완료 | `EventLevelEnd` | `ParameterLevelName`, `ParameterSuccess` |
| 레벨 업 | `EventLevelUp` | `ParameterLevel`, `ParameterCharacter` |
| 튜토리얼 시작/완료 | `EventTutorialBegin` / `EventTutorialComplete` | (파라미터 없음) |
| 점수 게시 | `EventPostScore` | `ParameterScore`, `ParameterLevel` |

### 3-2. 사용 예시

```csharp
using Firebase.Analytics;

public static class GameAnalytics
{
    // 광고 노출 (수익화 핵심)
    public static void LogAdImpression(string adUnitName, string adFormat, double revenue)
    {
        if (!FirebaseBootstrap.IsReady) return;

        FirebaseAnalytics.LogEvent(FirebaseAnalytics.EventAdImpression, new[]
        {
            new Parameter(FirebaseAnalytics.ParameterAdPlatform, "AdMob"),
            new Parameter(FirebaseAnalytics.ParameterAdSource, "AdMob Network"),
            new Parameter(FirebaseAnalytics.ParameterAdFormat, adFormat), // "Rewarded", "Interstitial"
            new Parameter(FirebaseAnalytics.ParameterAdUnitName, adUnitName),
            new Parameter(FirebaseAnalytics.ParameterValue, revenue),
            new Parameter(FirebaseAnalytics.ParameterCurrency, "USD")
        });
    }

    // IAP 구매 완료
    public static void LogPurchase(string productId, double price, string currency, string transactionId)
    {
        if (!FirebaseBootstrap.IsReady) return;

        FirebaseAnalytics.LogEvent(FirebaseAnalytics.EventPurchase, new[]
        {
            new Parameter(FirebaseAnalytics.ParameterValue, price),
            new Parameter(FirebaseAnalytics.ParameterCurrency, currency),
            new Parameter(FirebaseAnalytics.ParameterTransactionId, transactionId),
            new Parameter("product_id", productId)
        });
    }

    // 레벨 완료
    public static void LogLevelComplete(string levelName, bool success)
    {
        if (!FirebaseBootstrap.IsReady) return;

        FirebaseAnalytics.LogEvent(FirebaseAnalytics.EventLevelEnd, new[]
        {
            new Parameter(FirebaseAnalytics.ParameterLevelName, levelName),
            new Parameter(FirebaseAnalytics.ParameterSuccess, success ? 1L : 0L)
        });
    }

    // 튜토리얼 완료
    public static void LogTutorialComplete()
    {
        if (!FirebaseBootstrap.IsReady) return;
        FirebaseAnalytics.LogEvent(FirebaseAnalytics.EventTutorialComplete);
    }
}
```

### 3-3. SetUserProperty (사용자 세그멘트)

```csharp
// 결제 이력 여부, VIP 등급, 가입 후 일수 등 변하지 않는 속성
FirebaseAnalytics.SetUserProperty("payer_type", "whale");
FirebaseAnalytics.SetUserProperty("highest_level", "42");
```

> 주의: `SetUserProperty`는 최대 25개까지 등록 가능. 이름은 영문/숫자/언더스코어만 허용되며 24자 이내. 값은 36자 이내.

### 3-4. iOS StoreKit 2 트랜잭션 (13.8.0+)

```csharp
// Apple App Store 트랜잭션 문자열을 직접 로깅
await FirebaseAnalytics.LogAppleTransactionAsync(transactionString);
```

> Firebase Unity SDK 13.8.0(2026-02 릴리즈)부터 추가된 API다.

---

## 4. Firebase Crashlytics

### 4-1. 자동 수집 (캐치되지 않은 예외)

SDK가 임포트되고 초기화되면 캐치되지 않은 예외는 자동 수집된다. 추가 코드 불필요.

### 4-2. 수동 로깅 (비치명적 오류)

```csharp
using Firebase.Crashlytics;

public static class CrashReporter
{
    // 예상되는 예외를 비치명적으로 기록
    public static void RecordHandledException(System.Exception ex)
    {
        if (!FirebaseBootstrap.IsReady) return;
        Crashlytics.LogException(ex);
    }

    // 컨텍스트 로그 (크래시 직전 64KB까지 누적)
    public static void Breadcrumb(string message)
    {
        if (!FirebaseBootstrap.IsReady) return;
        Crashlytics.Log(message);
    }

    // 유저 식별 (PII 직접 넣지 말 것, 해시된 ID 권장)
    public static void SetUser(string hashedUserId)
    {
        if (!FirebaseBootstrap.IsReady) return;
        Crashlytics.SetUserId(hashedUserId);
    }

    // 크래시 필터링용 키-값 (최대 64개, 각 1KB)
    public static void SetContext(string key, string value)
    {
        if (!FirebaseBootstrap.IsReady) return;
        Crashlytics.SetCustomKey(key, value);
    }
}
```

### 4-3. 예외를 치명적으로 처리 (SDK 10.4.0+)

```csharp
// 모든 캐치되지 않은 예외를 fatal로 보고 (게임 메인 진입 시 1회)
Crashlytics.ReportUncaughtExceptionsAsFatal = true;
```

> SetUserId 호출 타이밍 관련 흔한 실수 → references/REFERENCE.md §4-4 참고

---

## 5. Firebase Remote Config

### 5-1. 기본 패턴: 기본값 → Fetch → Activate → Get

```csharp
using System.Collections.Generic;
using System.Threading.Tasks;
using Firebase.RemoteConfig;
using Firebase.Extensions;

public class RemoteConfigService : MonoBehaviour
{
    // 키 정의 (오타 방지)
    public const string KEY_INTERSTITIAL_FREQUENCY = "interstitial_frequency_seconds";
    public const string KEY_IAP_DISCOUNT_RATE = "iap_discount_rate";
    public const string KEY_REWARDED_AD_ENABLED = "rewarded_ad_enabled";

    public async Task InitializeAsync()
    {
        if (!FirebaseBootstrap.IsReady) return;

        // 1) 기본값 설정 (Fetch 실패해도 이 값 반환됨)
        var defaults = new Dictionary<string, object>
        {
            { KEY_INTERSTITIAL_FREQUENCY, 60 },
            { KEY_IAP_DISCOUNT_RATE, 0.0 },
            { KEY_REWARDED_AD_ENABLED, true }
        };
        await FirebaseRemoteConfig.DefaultInstance.SetDefaultsAsync(defaults);

        // 2) Fetch 간격 설정 (배포 시 1시간 권장, 개발 시 0)
        var settings = new ConfigSettings
        {
            FetchTimeoutInMilliseconds = 10_000,
            MinimumFetchInternalInMilliseconds = 3_600_000 // 1시간
        };
        await FirebaseRemoteConfig.DefaultInstance.SetConfigSettingsAsync(settings);

        // 3) Fetch + Activate
        await FirebaseRemoteConfig.DefaultInstance.FetchAndActivateAsync();
    }

    public int GetInterstitialFrequency() =>
        (int)FirebaseRemoteConfig.DefaultInstance.GetValue(KEY_INTERSTITIAL_FREQUENCY).LongValue;

    public double GetIapDiscountRate() =>
        FirebaseRemoteConfig.DefaultInstance.GetValue(KEY_IAP_DISCOUNT_RATE).DoubleValue;

    public bool IsRewardedAdEnabled() =>
        FirebaseRemoteConfig.DefaultInstance.GetValue(KEY_REWARDED_AD_ENABLED).BooleanValue;
}
```

### 5-2. A/B 테스트 (광고 빈도)

Firebase Console에서:
1. Remote Config → 파라미터 `interstitial_frequency_seconds` 생성 (기본값 60)
2. A/B Testing → 실험 생성 → Remote Config 선택
3. Variant A: 60초, Variant B: 90초로 분기
4. 주요 지표(ARPU, 리텐션)로 검증 → 승자 100% 롤아웃

코드 변경 없이 콘솔 조작만으로 동작한다.

> 실시간 업데이트 리스너·흔한 실수 → references/REFERENCE.md §5-3, §5-4 참고

---

## 6. Firebase Cloud Messaging (FCM)

> 기본 설정 코드·토픽 구독·iOS 추가 설정 → references/REFERENCE.md §6 참고

### 6-3. 포그라운드 vs 백그라운드 동작 (중요)

| 앱 상태 | 메시지 타입 | 동작 |
|---------|-------------|------|
| **포그라운드** | notification + data | `MessageReceived` 호출됨, `Notification`/`Data` 모두 접근 가능 |
| **백그라운드** | notification | 시스템 트레이에 자동 표시. `MessageReceived` 호출 안 됨 |
| **백그라운드** | data only | `MessageReceived` 호출됨 |
| **앱 종료 상태** | notification 탭 | 인텐트로 앱 시작 → `MessageReceived` 거치지 않음, 인텐트 extras로 데이터 전달 |

> 주의: 게임 내 인앱 알림(예: "에너지 충전 완료")을 포그라운드에서 직접 표시하려면 `data only` 메시지를 보내고 `MessageReceived`에서 Unity UI로 표시한다. `notification` 필드를 쓰면 백그라운드에서만 시스템 트레이에 뜨고 포그라운드에서는 별도 처리가 필요하다.

---

## 8. 언제 사용 / 사용하지 말지

### 사용하기 좋은 경우
- 출시 후 광고 빈도·IAP 가격을 코드 수정 없이 조정해야 하는 모바일 게임
- 유저 행동 분석으로 튜토리얼 이탈 구간 파악이 필요한 경우
- 크래시 발생 시 어떤 레벨/씬에서 터졌는지 컨텍스트가 필요한 경우
- 이벤트 알림(시즌 이벤트, 푸시 리텐션 캠페인)이 필요한 경우

### 다른 옵션을 고려할 경우
- 오프라인 단일 디바이스 게임 (Analytics·FCM 무의미)
- WebGL 빌드 (Firebase Unity SDK는 모바일/데스크톱 위주, WebGL 미지원)
- 매우 가벼운 프로토타입 (SDK 크기로 APK 크기가 수 MB 증가)
- 자체 분석 백엔드를 이미 운영 중 (Mixpanel, Amplitude 등과 중복)

---

> 흔한 실수 패턴 전체 목록·출시 전 체크리스트 → references/REFERENCE.md §7, §9 참고

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
