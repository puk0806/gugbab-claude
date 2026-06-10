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

### 4-4. 흔한 실수: SetUserId 타이밍

> 주의: `DependencyStatus.Available` 반환 직후 즉시 `SetUserId`를 호출하면 네이티브 레이어가 준비 안 되어 유저 ID가 [not set]으로 표시되는 버그가 보고됨 (firebase-unity-sdk Issue #1381, 12.10.1에서 발견). 워크어라운드: 초기화 완료 후 **3~5초 지연** 또는 첫 씬 로드 후 호출.

```csharp
private IEnumerator SetUserIdAfterDelay(string userId)
{
    yield return new WaitForSeconds(3f);
    Crashlytics.SetUserId(userId);
}
```

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

### 5-3. 실시간 업데이트 (SDK 11.0.0+)

```csharp
FirebaseRemoteConfig.DefaultInstance.OnConfigUpdateListener += (sender, args) =>
{
    if (args.Error == RemoteConfigError.None)
    {
        FirebaseRemoteConfig.DefaultInstance.ActivateAsync();
        // UI 갱신 등
    }
};
```

### 5-4. 흔한 실수

> 주의: `SetDefaultsAsync`를 호출하지 않으면 Fetch 실패 시 `GetValue`가 빈 값(`""`, `0`, `false`)을 반환한다. **반드시 `FetchAndActivateAsync` 전에 기본값을 설정**한다.

> 주의: `MinimumFetchInternalInMilliseconds`는 *intentional* 오타가 아니라 SDK 실제 필드명이다 (`Interval`이 아닌 `Internal`). 그대로 사용한다.

> 주의: 개발 중 `MinimumFetchInternalInMilliseconds = 0`으로 두고 즉시 반영 테스트 후, 릴리즈 빌드에서는 반드시 3,600,000(1시간) 이상으로 변경한다. 너무 자주 Fetch하면 Firebase가 throttle한다.

---

## 6. Firebase Cloud Messaging (FCM)

### 6-1. 기본 설정

```csharp
using Firebase.Messaging;

public class FcmService : MonoBehaviour
{
    private void Start()
    {
        // 핸들러는 Firebase 초기화 이전에 등록해도 됨 (자동 초기화 트리거)
        FirebaseMessaging.MessageReceived += OnMessageReceived;
        FirebaseMessaging.TokenReceived += OnTokenReceived;
    }

    private void OnTokenReceived(object sender, TokenReceivedEventArgs e)
    {
        Debug.Log($"[FCM] Token: {e.Token}");
        // 서버에 token 전송하여 개별 디바이스에 푸시 가능
    }

    private void OnMessageReceived(object sender, MessageReceivedEventArgs e)
    {
        var msg = e.Message;
        Debug.Log($"[FCM] From: {msg.From}");

        if (msg.Notification != null)
        {
            Debug.Log($"[FCM] Title: {msg.Notification.Title}");
            Debug.Log($"[FCM] Body: {msg.Notification.Body}");
        }

        // data 페이로드 처리
        foreach (var kv in msg.Data)
        {
            Debug.Log($"[FCM] Data: {kv.Key}={kv.Value}");
        }
    }

    private void OnDestroy()
    {
        FirebaseMessaging.MessageReceived -= OnMessageReceived;
        FirebaseMessaging.TokenReceived -= OnTokenReceived;
    }
}
```

### 6-2. 토픽 구독

```csharp
// 전체 유저 대상 공지용 토픽
await FirebaseMessaging.SubscribeAsync("all_users");

// 한국어 유저 대상
await FirebaseMessaging.SubscribeAsync("ko_users");

// 구독 해제
await FirebaseMessaging.UnsubscribeAsync("ko_users");
```

> 한 앱 인스턴스당 최대 **2,000개 토픽** 구독 가능 (공식 제한).

### 6-3. 포그라운드 vs 백그라운드 동작 (중요)

| 앱 상태 | 메시지 타입 | 동작 |
|---------|-------------|------|
| **포그라운드** | notification + data | `MessageReceived` 호출됨, `Notification`/`Data` 모두 접근 가능 |
| **백그라운드** | notification | 시스템 트레이에 자동 표시. `MessageReceived` 호출 안 됨 |
| **백그라운드** | data only | `MessageReceived` 호출됨 |
| **앱 종료 상태** | notification 탭 | 인텐트로 앱 시작 → `MessageReceived` 거치지 않음, 인텐트 extras로 데이터 전달 |

> 주의: 게임 내 인앱 알림(예: "에너지 충전 완료")을 포그라운드에서 직접 표시하려면 `data only` 메시지를 보내고 `MessageReceived`에서 Unity UI로 표시한다. `notification` 필드를 쓰면 백그라운드에서만 시스템 트레이에 뜨고 포그라운드에서는 별도 처리가 필요하다.

### 6-4. iOS 추가 설정

- Xcode → Capabilities → **Push Notifications** ON
- Capabilities → **Background Modes** → Remote notifications ON
- Apple Developer에서 APNs 인증 키(.p8) 발급 → Firebase Console → Cloud Messaging 설정에 업로드

---

## 7. 흔한 실수 패턴

### 7-1. Android 빌드 실패: "Cannot fit requested classes in a single dex file"

원인: Firebase 패키지 다수 추가 시 메서드 65,536개 초과.

해결:
1. Player Settings → Android → Publishing Settings → **Minify (Release)** 체크
2. 또는 `mainTemplate.gradle`에 multidex 설정:
   ```gradle
   android {
       defaultConfig {
           multiDexEnabled true
       }
   }
   dependencies {
       implementation 'androidx.multidex:multidex:2.0.1'
   }
   ```

### 7-2. Android minSdk 23 빌드 실패 (dexing 단계)

원인: 기본 dex 도구 버그.

해결:
- `minSdkVersion`을 **24**로 올린다 (가장 간단)
- 또는 minification 활성화
- 또는 `settingsTemplate.gradle`에 r8 8.3.37 명시

### 7-3. iOS Pod install 실패: locale/UTF-8 에러

해결:
```bash
# 셸 프로파일(.zshrc / .bash_profile)에 추가
export LANG=en_US.UTF-8
```
또는 터미널에서 `pod install`을 수동 실행 후 `.xcworkspace` 열기.

### 7-4. "Failed to read Firebase options from the app's resources"

원인: `google-services.json` / `GoogleService-Info.plist` 누락 또는 파일명에 `(1)` 같은 suffix.

해결:
- `Assets/` 루트(또는 `Assets/StreamingAssets/`)에 정확한 이름으로 배치
- 다시 다운로드해서 덮어쓰기 (파일 비교 금지 — 내용에 빌드별 클라이언트 ID가 포함됨)

### 7-5. Remote Config GetValue가 항상 기본값/빈 값 반환

원인 후보:
1. `SetDefaultsAsync` 호출 전에 `GetValue` 호출
2. `FetchAndActivateAsync` 호출 안 함
3. `MinimumFetchInternalInMilliseconds`가 너무 길어 캐시된 빈 값 반환
4. Firebase Console에 파라미터 자체가 없음 → 기본값 그대로 반환 (정상 동작)

해결 순서: 키 이름 typo 확인 → SetDefaultsAsync 호출 확인 → 개발 중에는 `MinimumFetchInternalInMilliseconds = 0` 설정 → Console에서 파라미터 게시("Publish changes") 클릭 확인.

### 7-6. EDM4U 충돌: "Multiple precompiled assemblies"

원인: UPM과 .unitypackage 동시 설치, 또는 다른 SDK(AdMob, Google Sign-In)가 가져온 EDM4U와 버전 불일치.

해결:
- `Assets/ExternalDependencyManager/` 폴더 통째로 삭제 후 UPM 버전만 유지
- 모든 Google 패키지를 UPM으로 통일

### 7-7. Crashlytics에 dSYM 업로드 누락 (iOS)

원인: Xcode 빌드 시 dSYM이 Firebase로 자동 업로드 안 됨 → 크래시 리포트가 심볼화되지 않음.

해결: Build Phase에 `Run Script` 추가:
```bash
"${PODS_ROOT}/FirebaseCrashlytics/run"
```
Input Files:
```
${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}/Contents/Resources/DWARF/${TARGET_NAME}
$(SRCROOT)/$(BUILT_PRODUCTS_DIR)/$(INFOPLIST_PATH)
```

### 7-8. Analytics 이벤트가 콘솔에 안 보임

원인: Firebase Console의 Events 대시보드는 **수 시간 후 집계**된다.

해결: 실시간 확인은 DebugView 사용.
```bash
# Android
adb shell setprop debug.firebase.analytics.app <패키지명>

# iOS Xcode 빌드 argument에 추가
-FIRDebugEnabled
```

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

## 9. 체크리스트 (출시 전)

- [ ] `FirebaseApp.CheckAndFixDependenciesAsync` 초기화 완료 후에만 SDK 호출하는지
- [ ] `Crashlytics.ReportUncaughtExceptionsAsFatal = true` 설정 (의도적인 경우)
- [ ] `Crashlytics.SetUserId`를 초기화 직후가 아닌 지연 호출로 변경했는지
- [ ] Remote Config 기본값(`SetDefaultsAsync`)을 모든 키에 대해 설정했는지
- [ ] Remote Config `MinimumFetchInternalInMilliseconds`를 릴리즈에서 ≥ 3,600,000으로 설정했는지
- [ ] iOS Run Script에 Crashlytics dSYM 업로드 추가했는지
- [ ] Android minify 또는 multidex 활성화했는지
- [ ] APNs 인증 키(.p8) Firebase Console 업로드 완료 (FCM 사용 시)
- [ ] `google-services.json` / `GoogleService-Info.plist`가 빌드에 포함되는지 (`Assets/` 루트 확인)
- [ ] 광고 SDK(AdMob 등)와 EDM4U 버전 충돌 없는지
