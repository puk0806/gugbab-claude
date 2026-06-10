---
name: unity-live-ops
description: >
  Unity 6 LTS + C# 모바일 게임 라이브 운영(Live Ops) 스킬.
  Addressables + CCD 에셋 패치, Firebase Remote Config 실시간 밸런싱,
  점검 모드, REST API 무중단 배포, 강제 업데이트, 이벤트/시즌 운영,
  분석·모니터링까지 출시 후 운영에 필요한 표준 패턴을 정리한다.
---

# Unity Live Ops — Unity 6 LTS 모바일 게임 운영 표준 패턴

> 소스: 아래 공식 문서 모음을 1차 출처로 사용한다.
>
> - Unity Cloud Content Delivery & Addressables — https://docs.unity.com/ugs/en-us/manual/ccd/manual/UnityCCDWalkthrough
> - Addressables 2.7 CCD Configure — https://docs.unity3d.com/Packages/com.unity.addressables@2.7/manual/ccd-configure.html
> - Addressables 2.8 CCD Publish — https://docs.unity3d.com/Packages/com.unity.addressables@2.8/manual/ccd-publish.html
> - Firebase Remote Config (Unity Get Started) — https://firebase.google.com/docs/remote-config/unity/get-started
> - Firebase Remote Config (개요·로딩 전략) — https://firebase.google.com/docs/remote-config / https://firebase.google.com/docs/remote-config/loading
> - Firebase Crashlytics Unity — https://firebase.google.com/docs/crashlytics/unity/get-started / customize-crash-reports
> - Firebase Cloud Messaging Unity — https://firebase.google.com/docs/cloud-messaging/unity/receive
> - Kubernetes Rolling Update — https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/
> - Railway Healthchecks — https://docs.railway.com/deployments/healthchecks
> - Fly.io Seamless Deployments — https://fly.io/docs/blueprints/seamless-deployments/ / https://fly.io/docs/reference/health-checks/
>
> 검증일: 2026-06-10
> 대상: Unity 6 LTS + Addressables 2.x + Firebase Unity SDK + REST API 백엔드(Firebase/UGS/자체 서버 혼용)

---

## 0. 라이브 운영 인프라 한눈에 보기

```
┌─────────────────────────────────────────────────────────────┐
│ 클라이언트(Unity 6 LTS, 모바일)                              │
│  ├ Addressables ── CCD(원격 번들 다운로드, 캐시)             │
│  ├ Firebase RC  ── Remote Config(밸런싱, 플래그, min_ver)     │
│  ├ Firebase FCM ── 푸시(점검 종료 알림, 이벤트)               │
│  ├ Crashlytics  ── 비정상 종료/예외 수집                      │
│  └ HTTP Client  ── 자체 REST API(지수 백오프 + 헬스체크 대응) │
└─────────────────────────────────────────────────────────────┘
                  │                              │
                  ▼                              ▼
   ┌──────────────────────┐         ┌─────────────────────────┐
   │ Unity Cloud (UGS)    │         │ 자체 REST API           │
   │  ├ CCD (콘텐츠 CDN)  │         │  ├ /health (LB 헬스체크)│
   │  └ Cloud Save / Auth │         │  └ Blue-Green / Rolling │
   └──────────────────────┘         └─────────────────────────┘
                                            │
                                            ▼
                                    Railway / Render / Fly.io / K8s
```

라이브 운영의 핵심 명제: **앱스토어 업데이트 없이 게임 행동을 바꿀 수 있어야 한다.** 에셋은 CCD로, 규칙·플래그는 Remote Config로, 서버는 무중단 배포로 갱신한다.

---

## 1. Addressables + Cloud Content Delivery (CCD)

### 1-1. 전체 흐름

1. Unity Dashboard에서 **CCD Bucket** 생성 (Environment: production/development)
2. Unity Editor에서 **Addressables Profile**의 Remote 변수를 `Cloud Content Delivery` Bundle Location으로 설정
3. Groups 창에서 **Build & Release** 실행 → 번들 생성 + 업로드 + Release 생성 + `latest` Badge 자동 부여
4. 런타임에서 `Addressables.LoadAssetAsync`가 `latest` Badge 기준으로 CCD에서 로드

> 출처: [CCD walkthrough](https://docs.unity.com/ugs/en-us/manual/ccd/manual/UnityCCDWalkthrough), [Addressables 2.8 ccd-publish](https://docs.unity3d.com/Packages/com.unity.addressables@2.8/manual/ccd-publish.html)

### 1-2. Bucket / Badge 모델

- **Bucket**: 콘텐츠 컨테이너. 일반적으로 환경별(`prod`, `staging`)로 분리.
- **Badge**: 특정 Release를 가리키는 라벨. `latest`는 자동 갱신되며, `live`, `v1.2.3-event-summer` 같은 수동 라벨로 운영 전략을 만든다.
- **Permission**: "Open to all" / "Promotion only". 운영 환경은 **Promotion only** 권장(직접 업로드 차단, dev → prod 승격으로만 변경).

### 1-3. Remote Profile 설정

`Window > Asset Management > Addressables > Profiles`에서 Remote LoadPath를 CCD URL 형식 중 하나로 지정:

```
# Badge 기반 (권장 — 라이브 운영용)
https://[ProjectID].client-api.unity3dusercontent.com/client_api/v1/environments/[EnvironmentName]/buckets/[BucketID]/release_by_badge/[BadgeName]/entry_by_path/content/?path=

# Release ID 고정 기반 (디버그·롤백 검증용)
https://[ProjectID].client-api.unity3dusercontent.com/client_api/v1/environments/[EnvironmentName]/buckets/[BucketID]/releases/[ReleaseID]/entry_by_path/content/?path=
```

> 출처: [Addressables 2.7 ccd-configure](https://docs.unity3d.com/Packages/com.unity.addressables@2.7/manual/ccd-configure.html)
> **주의**: Remote LoadPath를 변경했다면 **반드시 풀 리빌드**가 필요하다 (catalog/hash 재생성).

### 1-4. CcdManager로 런타임 환경 전환

A/B 테스트나 빌드/환경 분리를 위해 런타임에 Bucket·Badge를 결정해야 할 때, **Automatic (set using CcdManager)** 모드를 사용한다.

```csharp
using Unity.Services.CCD.Management; // CCD Management 패키지
using UnityEngine.AddressableAssets;

public static class CcdBootstrap
{
    // Addressables가 초기화되기 전에 반드시 호출
    public static void Configure(string env, string bucketId, string badge)
    {
        CcdManager.EnvironmentName = env;   // 예: "production"
        CcdManager.BucketId         = bucketId; // GUID
        CcdManager.Badge            = badge;    // 예: "latest" / "live"
    }
}
```

> 출처: [Addressables CCD 2.x — CcdManager 사용](https://docs.unity3d.com/Packages/com.unity.addressables@2.5/manual/AddressablesCCD.html)
> **중요**: 어떤 Addressables 호출이든 시스템을 초기화하므로, `CcdManager.*` 설정은 **첫 Addressables 호출 이전**에 끝내야 한다.

### 1-5. 캐시 / CRC 전략

| 항목 | 권장 설정 | 이유 |
|------|-----------|------|
| `UseAssetBundleCrcForCachedBundles` | **true** | 캐시 파일 손상/구버전 감지 시 자동 재다운로드 |
| 캐시 만료 (`Caching.expirationDelay`) | 환경에 맞춰 명시 (예: 30~90일) | 무한 캐시는 구 버전 에셋 노출 위험, 너무 짧으면 재다운로드 폭증 |
| Group의 `Use Existing Build` | dev에서만 사용 | 운영 빌드는 항상 풀 리빌드 |

> CRC 옵션 출처: [Addressables BundledAssetGroupSchema UseAssetBundleCrcForCachedBundles](https://docs.unity3d.com/Packages/com.unity.addressables@1.20/api/UnityEditor.AddressableAssets.Settings.GroupSchemas.BundledAssetGroupSchema.UseAssetBundleCrcForCachedBundles.html)

### 1-6. 클라이언트 로딩 코드(변경 없음)

CCD를 도입해도 기존 `Addressables.LoadAssetAsync` 호출 코드는 그대로 동작한다. 변경되는 것은 *Profile 설정*뿐이다.

```csharp
var handle = Addressables.LoadAssetAsync<Sprite>("hero_summer_skin");
var sprite = await handle.Task;
heroRenderer.sprite = sprite;
Addressables.Release(handle); // 메모리 해제 잊지 않기
```

---

## 2. Firebase Remote Config 실시간 밸런싱

### 2-1. 기본 골격

```csharp
using Firebase.RemoteConfig;
using Firebase.Extensions; // ContinueWithOnMainThread

public async Task InitRemoteConfigAsync()
{
    var rc = FirebaseRemoteConfig.DefaultInstance;

    // 1. 기본값 (서버 다운/네트워크 실패 시 안전망)
    var defaults = new Dictionary<string, object>
    {
        ["is_maintenance"]          = false,
        ["min_client_version"]      = "1.0.0",
        ["recommended_version"]     = "1.0.0",
        ["event_summer_enabled"]    = false,
        ["event_summer_start_utc"]  = "2026-07-01T00:00:00Z",
        ["event_summer_end_utc"]    = "2026-07-31T23:59:59Z",
        ["stage_balance_json"]      = "{}",
        ["ad_cooldown_seconds"]     = 60,
    };
    await rc.SetDefaultsAsync(defaults);

    // 2. fetch 간격(개발 중에는 짧게, 운영에서는 기본값 12시간 유지)
    await rc.SetConfigSettingsAsync(new ConfigSettings
    {
        FetchTimeoutInMilliseconds       = 10_000,
#if DEVELOPMENT_BUILD
        MinimumFetchIntervalInMilliseconds = 0,
#else
        MinimumFetchIntervalInMilliseconds = 43_200_000, // 12시간 = 운영 기본
#endif
    });

    // 3. fetch + activate (앱 시작 후 1회)
    await rc.FetchAndActivateAsync();
}
```

> 출처: [Firebase RC Unity Get Started](https://firebase.google.com/docs/remote-config/unity/get-started)
> **운영 기본값**: 12시간(43,200,000 ms). 이보다 더 자주 호출해도 캐시된 값을 반환한다. ([FirebaseRemoteConfig API reference](https://firebase.google.com/docs/reference/unity/class/firebase/remote-config/firebase-remote-config))

### 2-2. 호출 시점 가이드

| 시점 | 동작 | 이유 |
|------|------|------|
| 앱 콜드 스타트 | `FetchAndActivateAsync` 1회 | 점검·강제 업데이트 플래그 즉시 반영 |
| 백그라운드 → 포그라운드 복귀 | 마지막 fetch 후 N분 경과 시만 | 재시작 없이 이벤트 토글 반영 |
| 점검 모드 진입 후 | 30~60초 간격 폴링 | 점검 종료 자동 복귀 |
| 실시간 변경 필요 (이벤트 즉시 시작 등) | **OnConfigUpdateListener** 구독 | 서버 푸시로 자동 fetch (Realtime Remote Config) |

```csharp
// 실시간 업데이트 구독 (게임 메인 씬 진입 시 1회)
FirebaseRemoteConfig.DefaultInstance.OnConfigUpdateListener
    += (sender, args) =>
{
    // args.UpdatedKeys 에 변경된 키 목록
    FirebaseRemoteConfig.DefaultInstance.ActivateAsync()
        .ContinueWithOnMainThread(_ => ApplyRemoteValues());
};
```

> 출처: [Realtime Remote Config 블로그](https://firebase.blog/posts/2023/06/feature-flags-with-real-time-remote-config), [Unity Get Started — Listening](https://firebase.google.com/docs/remote-config/unity/get-started)

### 2-3. 조건부 타겟팅 (Conditional Targeting)

Firebase Console에서 Condition으로 세분화한 값을 동일 키에 대해 다르게 내려보낼 수 있다.

| Condition 종류 | 예시 사용 |
|----------------|-----------|
| Platform | iOS만 더 짧은 광고 쿨다운 적용 |
| App version | 1.5.0 이상에만 신규 이벤트 노출 |
| Country/Region | KR만 추석 이벤트 켜기 |
| Languages | ja-JP만 일본어 한정 텍스트 |
| User in random percentile | 10%에게만 신기능 노출 (점진 출시) |
| User in audience | Firebase Analytics 오디언스(예: "결제자") 대상 보상 |

> 출처: [Remote Config Parameters and Conditions](https://firebase.google.com/docs/remote-config/parameters)

### 2-4. A/B 테스트 파라미터 설계

- 한 실험에는 **1개의 키만** 변경 (인과 분석 가능)
- baseline / variant_a / variant_b는 같은 자료형이어야 함
- `Firebase A/B Testing`과 통합하여 Analytics 지표(retention, ARPU)에 영향 분석

```csharp
// 코드 측은 키만 읽으면 됨 — 분배는 Firebase가 처리
int cooldown = (int)FirebaseRemoteConfig.DefaultInstance
    .GetValue("ad_cooldown_seconds").LongValue;
```

---

## 3. 점검 모드 (Maintenance Mode)

### 3-1. 패턴

Remote Config에 다음 키를 둔다:

```
is_maintenance              : bool      (기본 false)
maintenance_message         : string    ("긴급 점검 중입니다 ...")
maintenance_end_utc         : string    ("2026-06-10T15:00:00Z" 또는 빈 문자열)
```

### 3-2. 부팅 흐름

```csharp
public async Task<BootResult> BootAsync()
{
    await InitRemoteConfigAsync();

    var rc = FirebaseRemoteConfig.DefaultInstance;

    if (rc.GetValue("is_maintenance").BooleanValue)
    {
        ShowMaintenanceScreen(
            rc.GetValue("maintenance_message").StringValue,
            rc.GetValue("maintenance_end_utc").StringValue);
        StartMaintenancePolling();
        return BootResult.Maintenance;
    }

    if (NeedsForceUpdate(rc)) return BootResult.ForceUpdate;
    return BootResult.Normal;
}
```

### 3-3. 점검 종료 자동 복귀

- **폴링**: 30~60초 간격으로 `FetchAndActivateAsync` 재호출
- **푸시**: FCM 토픽(`maintenance_topic`) 메시지를 받으면 즉시 재fetch
- **실시간**: `OnConfigUpdateListener` 등록 시 자동 재fetch (Realtime RC)

```csharp
async void StartMaintenancePolling()
{
    while (gameObject != null)
    {
        await Task.Delay(TimeSpan.FromSeconds(30));
        await FirebaseRemoteConfig.DefaultInstance.FetchAndActivateAsync();
        if (!FirebaseRemoteConfig.DefaultInstance.GetValue("is_maintenance").BooleanValue)
        {
            ReloadBootSequence();
            break;
        }
    }
}
```

### 3-4. 점검 중 서버 503을 graceful하게

서버 점검 중에는 자체 REST API가 503을 반환할 수 있다. 클라이언트는 이를 사용자에게 *기술 에러*가 아닌 *점검 안내*로 변환해야 한다.

```csharp
if (response.StatusCode == 503)
{
    // Remote Config 한 번 더 확인 (점검 플래그 같이 켜졌을 가능성)
    await rc.FetchAndActivateAsync();
    ShowMaintenanceScreen(...);
    return;
}
```

---

## 4. REST API 서버 무중단 배포 (Zero-Downtime)

### 4-1. 헬스체크 엔드포인트는 필수

```
GET /health
200 OK { "status": "ok", "version": "1.4.2", "db": "ok" }
503    { "status": "draining" } // 종료 직전(graceful shutdown 신호)
```

- LB / 플랫폼이 헬스체크로 트래픽 라우팅을 판단한다
- DB 연결, 외부 의존성까지 확인하는 *deep health check*는 별도(`/health/deep`)로 분리 — `/health`는 빠른 응답 유지

### 4-2. Blue-Green 배포 (Railway / Render류)

| 단계 | 동작 |
|------|------|
| 1 | Green(신 버전) 인스턴스 기동 |
| 2 | Green 헬스체크 통과 대기 |
| 3 | 라우터/LB가 Green으로 트래픽 스위치 |
| 4 | Blue(구 버전)는 N분 후 종료 (롤백 여지) |

**Railway**는 healthcheck 엔드포인트가 200을 반환할 때까지 새 배포를 활성화하지 않는다(자동 zero-downtime). 별도 Blue-Green 구성은 community에서 nginx + 두 환경으로 수동 구성 권장.
([Railway Healthchecks](https://docs.railway.com/deployments/healthchecks))

### 4-3. Rolling Update (Kubernetes / Fly.io)

Kubernetes Deployment 기본 전략. Pods를 한 번에 하나씩 교체한다.

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # 추가 생성 가능 Pod 수
    maxUnavailable: 0  # 동시에 내릴 수 있는 Pod 수 → 0이면 진짜 무중단
readinessProbe:
  httpGet: { path: /health, port: 8080 }
  initialDelaySeconds: 3
  periodSeconds: 5
terminationGracePeriodSeconds: 30
lifecycle:
  preStop:
    exec: { command: ["sh","-c","sleep 10"] }  # Endpoint 전파 지연 흡수
```

> 출처: [Kubernetes Rolling Update tutorial](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)
> 핵심 3가지: **readiness probe**, **graceful shutdown**, **preStop**.

**Fly.io**는 기본이 rolling이며 `max_unavailable`로 동시 교체 수를 제어한다. 헬스체크 통과 전에는 새 Machine으로 트래픽이 가지 않는다.
([Fly.io Seamless Deployments](https://fly.io/docs/blueprints/seamless-deployments/))

### 4-4. 게임 클라이언트 재시도 로직 — 지수 백오프

서버 롤링 배포 중 일시적 502/503은 자연스럽다. 클라이언트는 *조용히 재시도*해야 사용자가 알 수 없다.

```csharp
public async Task<string> GetWithRetryAsync(string url, int maxRetry = 5)
{
    var rand = new System.Random();
    for (int attempt = 0; attempt <= maxRetry; attempt++)
    {
        using var req = UnityWebRequest.Get(url);
        await req.SendWebRequest();

        bool transient = req.responseCode is 502 or 503 or 504
                         || req.result == UnityWebRequest.Result.ConnectionError;

        if (!transient)
        {
            if (req.result == UnityWebRequest.Result.Success) return req.downloadHandler.text;
            throw new ApiException(req.responseCode, req.error);
        }

        if (attempt == maxRetry) throw new ApiException(req.responseCode, "retry exhausted");

        // base = 2^attempt 초, 최대 30초, jitter ±20%
        double baseDelay = Math.Min(Math.Pow(2, attempt), 30);
        double jitter    = baseDelay * (0.8 + rand.NextDouble() * 0.4);
        await Task.Delay(TimeSpan.FromSeconds(jitter));
    }
    throw new InvalidOperationException("unreachable");
}
```

> 패턴 근거: 지수 백오프 + jitter는 retry storm 방지. ([AWS SDK Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html))
> **재시도 대상은 transient(502/503/504/네트워크)만**. 4xx(400/401/403/404)는 재시도 무의미.

### 4-5. 버전 호환성 — 서버가 클라이언트 버전을 거부할 수 있어야

서버는 `min_client_version`보다 낮은 클라이언트 요청을 426 Upgrade Required 또는 커스텀 코드로 거절한다. 클라이언트는 해당 응답을 강제 업데이트 화면으로 변환한다.

```csharp
if (response.StatusCode == 426 || response.ErrorCode == "CLIENT_TOO_OLD")
{
    ShowForceUpdateDialog(targetStoreUrl);
    return;
}
```

---

## 5. 강제 업데이트 (Force Update)

### 5-1. Remote Config 키

```
min_client_version          : string  ("1.4.0")   ← 미만은 강제
recommended_version         : string  ("1.5.2")   ← 미만은 권고
force_update_store_url_ios  : string  ("https://apps.apple.com/...")
force_update_store_url_android : string ("https://play.google.com/...")
```

### 5-2. 부팅 시 버전 비교

```csharp
bool NeedsForceUpdate(FirebaseRemoteConfig rc)
{
    var min = rc.GetValue("min_client_version").StringValue;
    return CompareSemver(Application.version, min) < 0;
}

bool NeedsSoftUpdate(FirebaseRemoteConfig rc)
{
    var rec = rc.GetValue("recommended_version").StringValue;
    return CompareSemver(Application.version, rec) < 0;
}

// "1.4.0" vs "1.4.1" → -1 / 0 / 1
int CompareSemver(string a, string b)
{
    var pa = a.Split('.').Select(int.Parse).ToArray();
    var pb = b.Split('.').Select(int.Parse).ToArray();
    for (int i = 0; i < Math.Max(pa.Length, pb.Length); i++)
    {
        int va = i < pa.Length ? pa[i] : 0;
        int vb = i < pb.Length ? pb[i] : 0;
        if (va != vb) return va < vb ? -1 : 1;
    }
    return 0;
}
```

### 5-3. Soft vs Hard

| 종류 | 동작 | UX |
|------|------|----|
| Soft (권고) | "업데이트하시겠어요?" — 나중에 버튼 허용 | retention 보호 |
| Hard (강제) | 스토어 이동만 가능, 게임 진입 불가 | 보안/호환성 이슈 시 |

> Hard는 API 브레이킹 체인지나 보안 패치에만 사용. 남용하면 retention 크게 떨어진다.

---

## 6. 이벤트 / 시즌 운영

### 6-1. UTC 기준 시간 관리

이벤트 시작/종료는 **반드시 UTC**로 Remote Config에 저장한다. 클라이언트가 사용자 타임존으로 변환해 표시한다.

```
event_summer_start_utc : "2026-07-01T00:00:00Z"
event_summer_end_utc   : "2026-07-31T23:59:59Z"
```

```csharp
var startUtc = DateTime.Parse(rc.GetValue("event_summer_start_utc").StringValue,
                              null, DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal);
bool isActive = DateTime.UtcNow >= startUtc && DateTime.UtcNow <= endUtc;
```

> **주의**: 클라이언트 로컬 시간(`DateTime.Now`)을 신뢰하면 사용자가 기기 시계 조작으로 이벤트를 우회한다. 정밀한 이벤트(랭킹/보상)는 *서버 시간* 기준으로 검증해야 한다.

### 6-2. 이벤트 에셋 사전 다운로드

이벤트 시작 N일 전에 에셋을 CCD에 업로드하고 별도 Addressables Label(`event_summer`)을 붙여 사전 다운로드.

```csharp
// 시작 24시간 전 — 백그라운드 다운로드
var size = await Addressables.GetDownloadSizeAsync("event_summer").Task;
if (size > 0) await Addressables.DownloadDependenciesAsync("event_summer").Task;
```

이벤트 시작 시각에는 Remote Config 플래그만 켜면 이미 캐시된 에셋이 즉시 노출된다 → "0초 스타트" 경험.

---

## 7. 분석 및 모니터링

### 7-1. Firebase Analytics 핵심 지표

| 지표 | 의미 | 자동 수집 여부 |
|------|------|:--------:|
| DAU / WAU / MAU | 일/주/월 활성 유저 | ✅ 자동 |
| Retention (D1/D7/D30) | 잔존율 | ✅ 자동 |
| ARPU / ARPDAU | 매출 분석 | ⚠️ 결제 이벤트 직접 송신 필요 |
| Session length | 세션 길이 | ✅ 자동 |
| Crash-free users | 비정상 종료가 없는 유저 비율 | ✅ Crashlytics |

### 7-2. Crashlytics — 비정상 종료 + non-fatal 예외

```csharp
using Firebase.Crashlytics;

void Awake()
{
    // 잡히지 않은 예외를 fatal로 보고 (공식 권장값)
    Crashlytics.ReportUncaughtExceptionsAsFatal = true;
}

try
{
    DoRiskyWork();
}
catch (Exception e)
{
    Crashlytics.LogException(e);   // non-fatal로 보고
    Crashlytics.Log("context: stage 12, attempt 3"); // 빵부스러기(breadcrumb)
}
```

> 출처: [Crashlytics Unity Customize](https://firebase.google.com/docs/crashlytics/unity/customize-crash-reports), [Get Started](https://firebase.google.com/docs/crashlytics/unity/get-started)
> non-fatal 이벤트는 *다음 fatal 이벤트* 또는 *앱 재시작 시* 함께 전송된다.

### 7-3. 서버 오류율 임계치 경고

자체 REST 서버 측에서 다음 알람을 운영한다:

| 알람 | 임계 예시 | 알림 채널 |
|------|-----------|-----------|
| 5xx 비율 | 5분간 1% 초과 | Slack/PagerDuty |
| p95 latency | 5분간 1초 초과 | Slack |
| 헬스체크 실패율 | 1분간 50% 초과 | PagerDuty |
| Crashlytics crash-free | 99.0% 미만 | Slack (Velocity Alert) |

---

## 8. 흔한 실수 8종

1. **CCD 캐시 만료 미설정** → 구 버전 에셋이 사용자 단말에 무한 잔류. `UseAssetBundleCrcForCachedBundles=true` + 만료 기간 명시.
2. **Remote Config 기본값 누락** → 첫 fetch 실패 또는 서버 다운 시 앱이 default 값 없이 크래시. `SetDefaultsAsync`는 *fetch보다 먼저* 호출.
3. **강제 업데이트 없이 API 브레이킹 체인지 배포** → 구 클라이언트가 새 서버에 깨진 요청 송신. 최소 1회 리뷰 주기 전에 `min_client_version` 인상 + soft update로 예고.
4. **클라이언트 재시도 부재** → 서버 롤링 배포 중 잠깐의 502/503에 사용자가 "게임이 망가졌다"고 인식. 지수 백오프 + jitter 필수.
5. **이벤트 시간 로컬 타임존 사용** → 시간대별 시작 시각 불일치, 시계 조작으로 우회 가능. UTC 기준 + 서버 검증.
6. **Remote Config fetch를 매 씬마다 호출** → 12시간 캐시에 막혀 의미 없음. 콜드 스타트 + 포그라운드 복귀 + 실시간 listener로 충분.
7. **헬스체크 엔드포인트에 DB ping 포함** → DB 일시 지연으로 모든 인스턴스가 unhealthy 판정 → 전체 다운. `/health`는 가볍게, `/health/deep`은 별도.
8. **점검 모드 진입 시 fetch만 호출하고 폴링 없음** → 사용자가 직접 앱 재시작해야 복귀. 30~60초 폴링 또는 FCM 푸시 또는 realtime listener로 자동 복귀.

---

## 9. 운영 체크리스트 (출시 D-7)

- [ ] CCD Bucket: prod / staging 분리, Permission `Promotion only`
- [ ] Addressables Remote Profile이 CCD URL로 설정되어 있고 풀 리빌드 완료
- [ ] `UseAssetBundleCrcForCachedBundles = true`
- [ ] Firebase Remote Config 모든 키에 기본값 설정
- [ ] `is_maintenance` / `min_client_version` 키 존재 + 부팅 시 체크 코드
- [ ] 강제 업데이트 다이얼로그 + 스토어 URL 분기 (iOS/Android)
- [ ] 자체 REST API `/health` 엔드포인트 작동, LB 헬스체크 연결
- [ ] 클라이언트 HTTP 호출에 지수 백오프 + jitter
- [ ] Crashlytics `ReportUncaughtExceptionsAsFatal = true`
- [ ] 이벤트 키 UTC 표기 + 서버 검증 경로 확보
- [ ] 5xx / latency / crash-free 알람 임계 등록

---

## 10. 참고 링크

- [Unity CCD walkthrough (UGS Manual)](https://docs.unity.com/ugs/en-us/manual/ccd/manual/UnityCCDWalkthrough)
- [Addressables 2.7 — Configure CCD](https://docs.unity3d.com/Packages/com.unity.addressables@2.7/manual/ccd-configure.html)
- [Addressables 2.8 — Publish content with CCD](https://docs.unity3d.com/Packages/com.unity.addressables@2.8/manual/ccd-publish.html)
- [Firebase Remote Config — Unity Get Started](https://firebase.google.com/docs/remote-config/unity/get-started)
- [Firebase Remote Config — Parameters & Conditions](https://firebase.google.com/docs/remote-config/parameters)
- [Firebase Crashlytics — Unity Get Started](https://firebase.google.com/docs/crashlytics/unity/get-started)
- [Firebase Crashlytics — Customize crash reports (Unity)](https://firebase.google.com/docs/crashlytics/unity/customize-crash-reports)
- [Firebase Cloud Messaging — Unity Receive](https://firebase.google.com/docs/cloud-messaging/unity/receive)
- [Kubernetes — Performing a Rolling Update](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)
- [Railway Healthchecks](https://docs.railway.com/deployments/healthchecks)
- [Fly.io Seamless Deployments](https://fly.io/docs/blueprints/seamless-deployments/)
- [Fly.io Health Checks](https://fly.io/docs/reference/health-checks/)
