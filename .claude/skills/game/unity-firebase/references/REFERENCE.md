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

## 6. Firebase Cloud Messaging (FCM) 상세

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
