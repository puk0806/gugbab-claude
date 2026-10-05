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

---

### 3-3-A. 점검 종료 폴링 구현 코드

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

---

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

---

### 7-2-A. Crashlytics 구현 코드

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
