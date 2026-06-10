---
name: unity-levelplay-ads
description: >
  Unity LevelPlay(구 ironSource) 광고 SDK를 Unity 2D 모바일 게임에 통합하는 방법.
  보상형(Rewarded)/인터스티셜(Interstitial)/배너(Banner) 3종 + AdMob 미디에이션.
  Unity 6 LTS 호환 LevelPlay 9.4.x 신 API(LevelPlay.Init / LevelPlayRewardedAd 등) 기준.
  <example>사용자: "Unity 모바일 게임에 보상형 광고 붙이고 싶어"</example>
  <example>사용자: "ironSource 광고 콜백 onAdClosed에서 보상 주면 되나?"</example>
  <example>사용자: "LevelPlay에 AdMob 미디에이션 추가하려면?"</example>
---

# Unity LevelPlay 광고 통합 (Unity 2D 모바일 게임)

> 소스:
> - [LevelPlay SDK for Unity (공식 문서)](https://docs.unity.com/en-us/grow/levelplay/sdk/unity)
> - [Package integration](https://docs.unity.com/en-us/grow/levelplay/sdk/unity/package-integration)
> - [Migrate to LevelPlay Init API](https://docs.unity.com/en-us/grow/levelplay/sdk/unity/migrate-to-init-api)
> - [Rewarded ad integration](https://docs.unity.com/en-us/grow/levelplay/sdk/unity/rewarded-ad-integration-package)
> - [Interstitial integration](https://docs.unity.com/en-us/grow/levelplay/sdk/unity/interstitial-integration)
> - [Banner integration](https://docs.unity.com/en-us/grow/levelplay/sdk/unity/banner-integration)
> - [Changelog](https://docs.unity.com/en-us/grow/levelplay/sdk/unity/changelog)
> - [Google AdMob integration](https://docs.unity.com/en-us/grow/levelplay/sdk/android/networks/guides/google-admob)
> - GitHub: [ironsource-mobile/Unity-sdk](https://github.com/ironsource-mobile/Unity-sdk)
> 검증일: 2026-06-09
> 대상 버전: LevelPlay Unity Package **9.4.3** (2026-05-25 릴리스), Unity 6 LTS / Unity 2022.3 LTS 호환

---

## 1. Unity LevelPlay 개요

Unity LevelPlay는 2023년 리브랜딩을 통해 구 **ironSource Mediation SDK**와 **Unity Ads**가 통합된 모바일 광고 미디에이션 플랫폼이다.

| 항목 | 내용 |
|------|------|
| 공식 명칭 | Unity LevelPlay (구 ironSource Mediation) |
| 패키지명 | `com.unity.services.levelplay` |
| 최신 안정 버전 | **9.4.3** (2026-05-25) |
| 지원 Unity Editor | LTS 및 Editor Supported 버전 (Unity 6 / 2022.3 LTS 포함) |
| 지원 Android | API Level 19 (Android 4.4)+ |
| 지원 iOS | iOS 13+ (XCode 16+) |
| App Key 발급 | Unity Dashboard → LevelPlay → 앱 등록 |
| 지원 미디에이션 | AdMob, Meta Audience Network, AppLovin, Mintegral, Vungle, Unity Ads 등 |

### 두 가지 API 세대 — 신 API 우선 사용

LevelPlay 9.0.0부터 새로운 **Ad Unit 기반 API**(`LevelPlay.Init`, `LevelPlayRewardedAd` 등)가 도입되었다. 기존 `IronSource.Agent.*` 기반 레거시 API는 여전히 동작하지만 신규 프로젝트는 신 API를 사용해야 한다.

| 구분 | 레거시 API (8.4 이하 호환) | 신 API (9.0+ 권장) |
|------|---------|---------|
| 클래스 | `IronSource` | `LevelPlay` + `LevelPlayRewardedAd` / `LevelPlayInterstitialAd` / `LevelPlayBannerAd` |
| 네임스페이스 | (글로벌) | `Unity.Services.LevelPlay` |
| 초기화 | `IronSource.Agent.init(APP_KEY)` | `LevelPlay.Init("APP_KEY")` |
| 초기화 콜백 | `IronSourceEvents.onSdkInitializationCompletedEvent` | `LevelPlay.OnInitSuccess` / `LevelPlay.OnInitFailed` |
| 보상형 로드 | `IronSource.Agent.loadRewardedVideo` (자동) | `rewardedAd.LoadAd()` (수동, 인스턴스별) |
| 보상형 표시 | `IronSource.Agent.showRewardedVideo(placement)` | `rewardedAd.ShowAd(placementName)` |
| 다중 광고 단위 | 단일 단위 | **광고 단위(Ad Unit) 인스턴스별 제어 가능** |

> 주의: 사용자/예제 코드가 `IronSource.Agent.*`를 사용 중이라면 [Migrate to Init API](https://docs.unity.com/en-us/grow/levelplay/sdk/unity/migrate-to-init-api) 가이드를 따라 신 API로 이전하는 것이 권장된다. 본 스킬의 모든 예제는 신 API 기준이다.

---

## 2. SDK 설치

### Unity Package Manager로 설치 (권장)

1. Unity Editor → `Window > Package Manager`
2. 좌측 상단 `+` → `Add package by name…`에 `com.unity.services.levelplay` 입력
   - 또는 `Window > Package Manager`에서 **Ads Mediation** 검색 → Install
3. 설치 후 상단 메뉴에 `Ads Mediation` 메뉴가 생성된다.

### 대안: .unitypackage 수동 임포트

[GitHub Release](https://github.com/ironsource-mobile/Unity-sdk)에서 `UnityLevelPlay_v9.4.x.unitypackage` 다운로드 후 `Assets > Import Package > Custom Package…`로 임포트.

### Android 빌드 사전 설정

1. `Edit > Project Settings > Player > Android > Publishing Settings` → **Custom Main Gradle Template** / **Custom Main Manifest** 활성화
2. Android API 33+ 타겟 시 `AndroidManifest.xml`에 다음 추가:
   ```xml
   <uses-permission android:name="com.google.android.gms.permission.AD_ID"/>
   ```
3. `Assets > External Dependency Manager > Android Resolver > Resolve` 실행하여 네이티브 의존성 다운로드.

### iOS 빌드 사전 설정

`Info.plist`에 다음을 추가한다 (Xcode 빌드 후 자동 추가되지 않는 항목은 수동 추가).

```xml
<!-- AdMob 미디에이션 사용 시 필수 — 미설정 시 앱 시작 시 크래시 -->
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>

<!-- LevelPlay 광고 네트워크 통신 허용 -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

> 참고: SKAdNetwork ID는 LevelPlay 패키지 9.1.0+에서 자동 관리된다. iOS Privacy Manifest는 패키지 빌드 시 자동 포함된다.

---

## 3. SDK 초기화

### 신 API 초기화 (권장)

```csharp
using UnityEngine;
using Unity.Services.LevelPlay;

public class AdsBootstrap : MonoBehaviour
{
    [SerializeField] private string androidAppKey = "YOUR_ANDROID_APP_KEY";
    [SerializeField] private string iosAppKey = "YOUR_IOS_APP_KEY";

    void Awake()
    {
        DontDestroyOnLoad(gameObject);
    }

    void Start()
    {
        LevelPlay.OnInitSuccess += OnInitSuccess;
        LevelPlay.OnInitFailed  += OnInitFailed;

#if UNITY_ANDROID
        LevelPlay.Init(androidAppKey);
#elif UNITY_IOS
        LevelPlay.Init(iosAppKey);
#endif
    }

    void OnInitSuccess(LevelPlayConfiguration config)
    {
        Debug.Log("[LevelPlay] SDK 초기화 성공");
        // 광고 객체 생성·로드는 반드시 이 콜백 이후에 시작
        AdsManager.Instance.CreateAndLoadAll();
    }

    void OnInitFailed(LevelPlayInitError error)
    {
        Debug.LogError($"[LevelPlay] 초기화 실패: {error.ErrorMessage}");
        // 인터넷 연결 확인 후 재시도 권장
    }

    // OnApplicationPause는 반드시 IronSource.Agent 사용 (신 API에도 동일)
    void OnApplicationPause(bool isPaused)
    {
        IronSource.Agent.onApplicationPause(isPaused);
    }
}
```

### 초기화 타이밍 가이드

| 시점 | 권장 여부 |
|------|----------|
| `Awake()` | ❌ Unity 내부 초기화와 경합 가능 |
| `Start()` | ✅ 권장 — 첫 씬에서 한 번만 호출 |
| 광고 호출 직전 | ❌ 초기화는 비동기 — 즉시 호출 시 실패 |

> 광고 인스턴스(`LevelPlayRewardedAd` 등)는 반드시 **`OnInitSuccess` 콜백 이후**에 생성한다.

---

## 4. Rewarded Ad (보상형 광고) — 가장 중요

```csharp
using Unity.Services.LevelPlay;

public class RewardedAdController : MonoBehaviour
{
    private LevelPlayRewardedAd _rewardedAd;
    private const string AdUnitId = "YOUR_REWARDED_AD_UNIT_ID";

    public void CreateAndLoad()
    {
        _rewardedAd = new LevelPlayRewardedAd(AdUnitId);

        _rewardedAd.OnAdLoaded        += OnAdLoaded;
        _rewardedAd.OnAdLoadFailed     += OnAdLoadFailed;
        _rewardedAd.OnAdDisplayed      += OnAdDisplayed;
        _rewardedAd.OnAdDisplayFailed  += OnAdDisplayFailed;
        _rewardedAd.OnAdRewarded       += OnAdRewarded;   // 보상은 여기서 지급
        _rewardedAd.OnAdClosed         += OnAdClosed;
        _rewardedAd.OnAdClicked        += OnAdClicked;
        _rewardedAd.OnAdInfoChanged    += OnAdInfoChanged;

        _rewardedAd.LoadAd();
    }

    public void Show(string placementName = "DefaultRewardedVideo")
    {
        if (_rewardedAd != null
            && _rewardedAd.IsAdReady()
            && !LevelPlayRewardedAd.IsPlacementCapped(placementName))
        {
            _rewardedAd.ShowAd(placementName);
        }
        else
        {
            Debug.LogWarning("[Ads] 보상형 광고 준비 안 됨 또는 placement capped");
        }
    }

    // === 이벤트 핸들러 ===

    void OnAdLoaded(LevelPlayAdInfo adInfo)
    {
        Debug.Log($"[Ads] 보상형 로드 완료: {adInfo.AdNetwork}");
    }

    void OnAdLoadFailed(LevelPlayAdError error)
    {
        Debug.LogError($"[Ads] 보상형 로드 실패: {error.ErrorMessage}");
        // 짧은 지연 후 재시도 권장 (예: 30초~1분)
        Invoke(nameof(Retry), 30f);
    }

    void Retry() => _rewardedAd?.LoadAd();

    void OnAdDisplayed(LevelPlayAdInfo adInfo) { }
    void OnAdDisplayFailed(LevelPlayAdInfo adInfo, LevelPlayAdError error) { }
    void OnAdClicked(LevelPlayAdInfo adInfo) { }
    void OnAdInfoChanged(LevelPlayAdInfo adInfo) { }

    // ⭐ 보상 지급 — 반드시 OnAdRewarded에서 처리한다
    void OnAdRewarded(LevelPlayAdInfo adInfo, LevelPlayReward reward)
    {
        Debug.Log($"[Ads] 보상 지급: {reward.Name} x {reward.Amount}");
        GameProgress.AddCurrency(reward.Name, reward.Amount);
    }

    void OnAdClosed(LevelPlayAdInfo adInfo)
    {
        // 다음 표시를 위해 즉시 다음 광고 로드
        _rewardedAd.LoadAd();
    }
}
```

### 보상 지급 안티패턴 — 절대 금지

```csharp
// ❌ 잘못된 패턴: OnAdClosed에서 보상 지급
void OnAdClosed(LevelPlayAdInfo adInfo)
{
    GameProgress.AddCurrency("coin", 10); // ❌ 사용자가 끝까지 시청 안 해도 지급됨
}
```

**올바른 패턴**: 보상은 반드시 `OnAdRewarded` 콜백에서만 지급한다. `OnAdRewarded`는 사용자가 보상 조건(보통 끝까지 시청)을 충족했을 때만 호출된다.

> 주의: `OnAdRewarded`와 `OnAdClosed`는 비동기이고, 광고 네트워크에 따라 발생 순서가 다를 수 있다(`OnAdClosed`가 먼저 올 수도 있음). 따라서 두 콜백은 독립적으로 처리하며, 보상 지급 로직만 `OnAdRewarded`에 둔다.

---

## 5. Interstitial Ad (전면 광고)

```csharp
using Unity.Services.LevelPlay;

public class InterstitialAdController : MonoBehaviour
{
    private LevelPlayInterstitialAd _interstitialAd;
    private const string AdUnitId = "YOUR_INTERSTITIAL_AD_UNIT_ID";

    public void CreateAndLoad()
    {
        _interstitialAd = new LevelPlayInterstitialAd(AdUnitId);

        _interstitialAd.OnAdLoaded        += info => Debug.Log($"[Ads] 인터스티셜 로드: {info.AdNetwork}");
        _interstitialAd.OnAdLoadFailed    += err  => Debug.LogError($"[Ads] 인터스티셜 로드 실패: {err.ErrorMessage}");
        _interstitialAd.OnAdDisplayed     += info => { };
        _interstitialAd.OnAdDisplayFailed += (info, err) => Debug.LogError($"[Ads] 표시 실패: {err.ErrorMessage}");
        _interstitialAd.OnAdClicked       += info => { };
        _interstitialAd.OnAdClosed        += info =>
        {
            // 다음 노출을 위해 즉시 재로드
            _interstitialAd.LoadAd();
        };
        _interstitialAd.OnAdInfoChanged   += info => { };

        _interstitialAd.LoadAd();
    }

    public void Show(string placementName = "LevelComplete")
    {
        if (_interstitialAd != null
            && _interstitialAd.IsAdReady()
            && !LevelPlayInterstitialAd.IsPlacementCapped(placementName))
        {
            _interstitialAd.ShowAd(placementName);
        }
    }
}
```

### 표시 타이밍 가이드

| 시점 | 적합도 |
|------|-------|
| 레벨 완료 후 결과 화면 진입 시 | ✅ 자연스러운 전환점 |
| 게임 오버 시 | ✅ |
| 메뉴 화면 전환 시 | ⚠️ 너무 자주면 거부감 |
| 게임 플레이 도중 | ❌ 사용자 경험 파괴 |

---

## 6. Banner Ad

```csharp
using Unity.Services.LevelPlay;

public class BannerAdController : MonoBehaviour
{
    private LevelPlayBannerAd _bannerAd;
    private const string AdUnitId = "YOUR_BANNER_AD_UNIT_ID";

    public void CreateAndLoad()
    {
        // 신 API 배너 사이즈: BANNER (320x50), LARGE (320x90), MEDIUM_RECTANGLE (300x250)
        _bannerAd = new LevelPlayBannerAd(
            adUnitId: AdUnitId,
            size: LevelPlayAdSize.BANNER,
            position: LevelPlayBannerPosition.BottomCenter,
            placementName: null,
            displayOnLoad: true
        );

        _bannerAd.OnAdLoaded     += info => Debug.Log($"[Ads] 배너 로드: {info.AdNetwork}");
        _bannerAd.OnAdLoadFailed += err  => Debug.LogError($"[Ads] 배너 로드 실패: {err.ErrorMessage}");
        _bannerAd.OnAdDisplayed  += info => { };
        _bannerAd.OnAdClicked    += info => { };

        _bannerAd.LoadAd();
    }

    public void HideBanner() => _bannerAd?.HideAd();
    public void ShowBanner() => _bannerAd?.ShowAd();
    public void DestroyBanner()
    {
        _bannerAd?.DestroyAd();
        _bannerAd = null;
    }
}
```

### 배너 크기

| 상수 | 픽셀 크기(dp) | 용도 |
|------|--------------|------|
| `LevelPlayAdSize.BANNER` | 320 × 50 | 표준 배너 (모바일) |
| `LevelPlayAdSize.LARGE` | 320 × 90 | 큰 배너 |
| `LevelPlayAdSize.MEDIUM_RECTANGLE` | 300 × 250 | 중간 사각형 (MREC) |

> 주의: 레거시 API의 `SMART` 사이즈는 신 API(`LevelPlayAdSize`)에서 제공되지 않는다. 적응형 배너가 필요하면 커스텀 크기 또는 `BANNER` 기본값을 사용한다.

### 배너 위치 (신 API)

`LevelPlayBannerPosition` enum: `TopLeft`, `TopCenter`, `TopRight`, `CenterLeft`, `Center`, `CenterRight`, `BottomLeft`, `BottomCenter`(기본), `BottomRight`. 또는 `(x, y)` 좌표(dp 단위)로 커스텀 위치 지정 가능.

---

## 7. AdMob 미디에이션 설정

LevelPlay는 미디에이션 플랫폼이므로 AdMob 인벤토리를 받으려면 AdMob 어댑터와 계정 연결이 필요하다.

### A. Unity Dashboard 측 설정

1. [Unity Dashboard](https://dashboard.unity3d.com/) → **LevelPlay** → **Setup → SDK Networks**로 이동
2. **Google AdMob** 활성화
3. AdMob에서 발급한 **App ID**(`ca-app-pub-XXX~YYY`)와 각 광고 유닛 ID 입력
4. AdMob 계정 타임존을 **UTC**로 변경 (LevelPlay와 리포팅 정합)

### B. AdMob 측 설정

1. [AdMob 대시보드](https://apps.admob.com/) → 앱 등록 (iOS와 Android는 **별도 앱**으로 등록)
2. 각 앱에서 Ad Unit 생성: Interstitial / Rewarded / Banner
3. App ID와 Ad Unit ID를 LevelPlay 대시보드에 입력

### C. Unity Editor에서 AdMob 어댑터 설치

1. Unity 상단 메뉴: `Ads Mediation > LevelPlay Network Manager`
2. 목록에서 **AdMob** 어댑터의 Install 버튼 클릭
3. 자동으로 Google Mobile Ads SDK + 어댑터 의존성이 추가된다.
4. `Assets > External Dependency Manager > Android Resolver > Resolve` 실행 (Android)

### D. iOS Info.plist 필수 추가

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
```

> 주의: 이 항목이 누락되면 앱이 **시작 직후 크래시**한다. 이는 Google Mobile Ads SDK의 의무 요구사항이다.

### E. Android — App ID는 자동 주입

LevelPlay 어댑터 설치 시 `AndroidManifest.xml`에 자동으로 다음과 유사한 항목이 추가된다. 수동으로 박을 필요 없다.

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
```

---

## 8. 생명주기 관리 (모바일 필수)

```csharp
void OnApplicationPause(bool isPaused)
{
    IronSource.Agent.onApplicationPause(isPaused);
}
```

- 신 API(`LevelPlay.*`)를 사용하더라도 **OnApplicationPause만은 여전히 `IronSource.Agent.onApplicationPause()`를 호출**해야 한다.
- 앱이 백그라운드/포그라운드 전환 시 일부 광고 네트워크 SDK가 상태 추적을 위해 이 콜백을 필요로 한다.
- 광고를 사용하는 모든 씬의 컨트롤러(또는 `DontDestroyOnLoad`된 글로벌 매니저)에 작성한다.

---

## 9. 통합 테스트 (Integration Test Suite)

배포 전 실제 광고가 정상 노출되는지 확인하는 도구.

```csharp
// SDK 초기화 전 호출
LevelPlay.SetMetaData("is_test_suite", "enable");

LevelPlay.OnInitSuccess += _ =>
{
    // 초기화 후 호출 — 디버그 메뉴에서 트리거하는 게 안전
    LevelPlay.LaunchTestSuite();
};
LevelPlay.Init("YOUR_APP_KEY");
```

테스트 스위트에서 각 광고 네트워크별 설정/어댑터 정상 여부를 시각적으로 확인할 수 있다.

---

## 10. 흔한 실수 (Anti-patterns)

| 안티패턴 | 결과 | 올바른 방법 |
|---------|------|------------|
| `OnAdClosed`에서 보상 지급 | 사용자가 중도 종료해도 보상 지급됨 | `OnAdRewarded`에서만 지급 |
| `OnApplicationPause` 미구현 | 일부 네트워크 광고 표시 실패·통계 오류 | `IronSource.Agent.onApplicationPause(isPaused)` 호출 |
| 초기화 완료 전 광고 객체 생성 | 광고 로드 실패 | `LevelPlay.OnInitSuccess` 콜백 이후에 생성 |
| iOS `GADApplicationIdentifier` 미설정 | 앱 시작 시 크래시 | Info.plist에 `ca-app-pub-XXX~YYY` 추가 |
| Android API 33+에서 `AD_ID` 권한 누락 | 광고 ID 수집 안 됨 → 매출 손실 | `<uses-permission android:name="com.google.android.gms.permission.AD_ID"/>` 추가 |
| 광고 표시 직전 `LoadAd()` 호출 | 첫 광고가 항상 실패 | 앱 시작 시 한 번 로드 → `OnAdClosed`에서 다음 광고 로드 |
| 레거시·신 API 혼용 | 콜백 누락·중복 발생 | 신 API(`LevelPlayRewardedAd` 등)로 통일 |
| `IsAdReady()` 체크 없이 `ShowAd()` 호출 | 표시 실패 + UX 깨짐 | 표시 전 `IsAdReady() && !IsPlacementCapped(name)` 체크 |
| 인터스티셜을 게임 플레이 중 표시 | 사용자 이탈 급증 | 레벨 완료/게임 오버 등 자연스러운 전환점에만 |
| AdMob 타임존을 UTC로 안 맞춤 | LevelPlay 리포트와 수치 불일치 | AdMob 계정 타임존을 UTC로 설정 |

---

## 11. 언제 사용하지 않을지

- **유료 앱**: 광고 SDK 자체가 적합하지 않다.
- **저연령 대상(13세 미만)**: COPPA·GDPR-K 컴플라이언스 추가 작업 필요. LevelPlay 9.4.0의 `LevelPlayPrivacySettings`로 처리 가능하나 법적 검토 권장.
- **단일 광고 네트워크만 필요**: 미디에이션 오버헤드가 부담된다면 AdMob SDK나 Unity Ads SDK 단독 사용도 선택지다. LevelPlay는 **2개 이상 네트워크를 폭포수(waterfall)/입찰(bidding)로 운영**할 때 가치가 가장 크다.

---

## 12. 빠른 체크리스트

배포 전 반드시 확인할 항목:

- [ ] `com.unity.services.levelplay` 9.4.x 이상 설치
- [ ] Unity Dashboard에서 App Key 발급 + 광고 단위(Ad Unit) 생성
- [ ] `LevelPlay.Init` 호출 + `OnInitSuccess`/`OnInitFailed` 구독
- [ ] 광고 객체 생성은 `OnInitSuccess` 콜백 이후
- [ ] 보상 지급은 `OnAdRewarded`에서만
- [ ] `OnApplicationPause`에서 `IronSource.Agent.onApplicationPause(isPaused)` 호출
- [ ] iOS Info.plist: `GADApplicationIdentifier`(AdMob 사용 시) + `NSAppTransportSecurity`
- [ ] Android API 33+: `AD_ID` 권한
- [ ] `LevelPlay.LaunchTestSuite()`로 통합 검증
- [ ] AdMob 미디에이션: AdMob 계정 타임존 UTC + 네트워크 어댑터 설치
