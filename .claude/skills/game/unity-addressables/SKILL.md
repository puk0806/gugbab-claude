---
name: unity-addressables
description: >
  Unity 6 LTS 모바일 게임에서 Addressables System으로 에셋을 런타임에 비동기
  로드·해제·관리하는 패턴. AssetReference, AsyncOperationHandle, Release,
  Labels, Groups, Profiles, UniTask 연동까지.
  <example>사용자: "모바일 게임에서 캐릭터 프리팹을 런타임에 로드하고 싶어. Addressables 어떻게 써?"</example>
  <example>사용자: "InstantiateAsync로 생성한 오브젝트는 어떻게 해제해야 메모리 누수가 안 나?"</example>
  <example>사용자: "label 기반으로 여러 에셋을 한 번에 로드하는 패턴 알려줘"</example>
---

# Unity Addressables — 모바일 게임용 런타임 에셋 관리

> 소스:
> - 공식 문서: https://docs.unity3d.com/Packages/com.unity.addressables@latest/
> - 공식 GitHub 미러: https://github.com/needle-mirror/com.unity.addressables
> - UniTask Addressables 연동: https://github.com/Cysharp/UniTask
> 검증일: 2026-06-08
> 대상 버전: Unity 6 LTS (6000.0 / 6000.3) + `com.unity.addressables` **2.11.1** (Unity 6용 권장 2.x 최신)
> 참고: 3.1.0이 절대 최신이지만 Unity 6 LTS에서는 2.x 계열이 공식 권장 (Unity Discussions 확인)

---

## 1. Addressables 기초

### 1.1 패키지 설치

Package Manager → Window → Package Manager → "Addressables" 검색 → Install.

```
com.unity.addressables : 2.11.1   // Unity 6 LTS 권장
```

설치 직후 `Window > Asset Management > Addressables > Groups`에서 `Create Addressables Settings` 클릭하면 `Assets/AddressableAssetsData/` 폴더와 기본 그룹이 생성된다.

### 1.2 에셋을 Addressable로 만들기

두 가지 방법:

1. **인스펙터 체크박스** — 에셋 선택 → Inspector 상단 `Addressable` 체크 → 주소(string) 자동 부여
2. **드래그** — Addressables Groups 창에 에셋을 드래그

주소(address)는 기본적으로 에셋 경로지만 사용자 친화적인 이름으로 변경 권장: `character/hero_idle`.

### 1.3 AssetReference vs string address

| 방식 | 장점 | 단점 |
|------|------|------|
| `string` address | 동적으로 주소 조합 가능 (`"enemy_" + level`) | 오타 시 런타임 에러 |
| `AssetReference` | Inspector에서 드래그 연결, 컴파일 타임 안전 | 동적 주소 불가 |

> **권장**: 가능하면 `AssetReference` 사용. 동적 키가 필요한 경우(레벨별 에셋 등)에만 string address.

---

## 2. 비동기 로드 패턴

### 2.1 단일 에셋 로드 — `LoadAssetAsync<T>()`

```csharp
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public class PrefabLoader : MonoBehaviour
{
    private AsyncOperationHandle<GameObject> _handle;

    // 콜백 방식
    public void LoadByCallback()
    {
        _handle = Addressables.LoadAssetAsync<GameObject>("character/hero_idle");
        _handle.Completed += op =>
        {
            if (op.Status == AsyncOperationStatus.Succeeded)
            {
                Instantiate(op.Result);
            }
        };
    }

    // Coroutine 방식
    public IEnumerator LoadByCoroutine()
    {
        _handle = Addressables.LoadAssetAsync<GameObject>("character/hero_idle");
        yield return _handle;

        if (_handle.Status == AsyncOperationStatus.Succeeded)
        {
            Instantiate(_handle.Result);
        }
    }

    private void OnDestroy()
    {
        if (_handle.IsValid())
            Addressables.Release(_handle);
    }
}
```

### 2.2 프리팹 인스턴스화 — `InstantiateAsync()`

```csharp
private AsyncOperationHandle<GameObject> _spawnHandle;

public async void SpawnEnemy()
{
    _spawnHandle = Addressables.InstantiateAsync(
        "enemy/slime",
        position: Vector3.zero,
        rotation: Quaternion.identity,
        parent: transform);

    GameObject instance = await _spawnHandle.Task;
    instance.GetComponent<Enemy>().Init();
}

// 해제는 ReleaseInstance로 — GameObject를 넘기면 자동으로 처리됨
public void DespawnEnemy(GameObject instance)
{
    Addressables.ReleaseInstance(instance);
}
```

> `InstantiateAsync`로 생성한 인스턴스는 반드시 `ReleaseInstance(gameObject)`로 해제한다.
> `Destroy(gameObject)`만 호출하면 ref-count가 감소하지 않아 누수 발생.

### 2.3 씬 로드 — `LoadSceneAsync()`

```csharp
using UnityEngine.SceneManagement;
using UnityEngine.ResourceManagement.ResourceProviders;

private AsyncOperationHandle<SceneInstance> _sceneHandle;

public async UniTask LoadBattleScene()
{
    _sceneHandle = Addressables.LoadSceneAsync(
        "Scenes/Battle",
        LoadSceneMode.Single);

    SceneInstance scene = await _sceneHandle.Task;
    // 씬 활성화 완료
}

public async UniTask UnloadBattleScene()
{
    // Addressables.UnloadSceneAsync 사용 권장
    await Addressables.UnloadSceneAsync(_sceneHandle).Task;
}
```

> 씬은 `Addressables.UnloadSceneAsync(handle)`로 해제. `SceneManager.UnloadSceneAsync`는 금지.

### 2.4 UniTask 연동 — `.ToUniTask()` / `await handle`

UniTask는 `AsyncOperationHandle`과 `AsyncOperationHandle<T>`를 기본 awaitable로 지원한다.

```csharp
using Cysharp.Threading.Tasks;

public async UniTask LoadWithProgress(IProgress<float> progress, CancellationToken ct)
{
    var handle = Addressables.LoadAssetAsync<Sprite>("ui/hero_portrait");

    // 패턴 1: 직접 await
    Sprite sprite = await handle;

    // 패턴 2: ToUniTask로 progress·cancellation 결합
    Sprite spriteWithProgress = await handle.ToUniTask(
        progress: progress,
        cancellationToken: ct);

    // 패턴 3: WithCancellation만 (ToUniTask의 간소화)
    Sprite spriteCancellable = await handle.WithCancellation(ct);
}
```

> 직접 `await handle`은 native PlayerLoop 타이밍, `ToUniTask`는 명시 `PlayerLoopTiming`을 따른다.

---

## 3. 메모리 관리 — Reference Counting

### 3.1 핵심 원칙

> **모든 로드 호출은 반드시 1:1 release 호출로 짝지어야 한다.**

`LoadAssetAsync`를 같은 주소로 N번 호출하면 ref-count가 N이 된다.
`Release`를 N번 호출해야 ref-count가 0이 되고 그제서야 언로드 가능 상태가 된다.

```csharp
// 같은 에셋을 3번 로드 → ref-count = 3
var h1 = Addressables.LoadAssetAsync<GameObject>("prefab/coin");
var h2 = Addressables.LoadAssetAsync<GameObject>("prefab/coin");
var h3 = Addressables.LoadAssetAsync<GameObject>("prefab/coin");

// 3번 모두 release → ref-count = 0
Addressables.Release(h1);
Addressables.Release(h2);
Addressables.Release(h3);
```

### 3.2 세 가지 Release API 구분

| API | 대상 | 사용 시점 |
|-----|------|-----------|
| `Addressables.Release(handle)` | `AsyncOperationHandle` | `LoadAssetAsync`, `LoadAssetsAsync`로 받은 handle 해제 |
| `Addressables.Release(asset)` | 로드된 에셋 객체 자체 | handle 보관 안 했을 때 (가능하면 handle 권장) |
| `Addressables.ReleaseInstance(gameObject)` | `InstantiateAsync`로 생성한 GameObject | 프리팹 인스턴스 해제 |

```csharp
// 패턴 A — LoadAssetAsync
var handle = Addressables.LoadAssetAsync<Sprite>("ui/icon");
Sprite sprite = await handle.Task;
// 사용 후
Addressables.Release(handle);   // OK
// 또는
Addressables.Release(sprite);   // OK (handle 분실 시)

// 패턴 B — InstantiateAsync
var instanceHandle = Addressables.InstantiateAsync("prefab/enemy");
GameObject enemy = await instanceHandle.Task;
// 사용 후
Addressables.ReleaseInstance(enemy);   // OK
// Destroy(enemy)는 ref-count 감소 안 됨 → 누수
```

### 3.3 Release가 즉시 메모리 해제하지 않는다

> **주의**: `Release` 호출이 즉시 에셋 메모리를 해제하지 않는다.
> 에셋이 속한 AssetBundle 전체가 언로드되어야 실제 메모리가 반환된다.

해결책:
- 같은 번들의 다른 에셋도 더 이상 참조하지 않으면 자동 언로드
- 모바일에서 메모리 압박 시 `Resources.UnloadUnusedAssets()` 호출 (단, 로딩 화면 같은 hitch 허용 시점에서만)

### 3.4 흔한 메모리 누수 안티패턴

```csharp
// 안티패턴 1 — handle 분실
public void LoadAndForget()
{
    Addressables.LoadAssetAsync<GameObject>("prefab/coin");
    // handle을 변수에 저장하지 않음 → 절대 release 못 함 → 누수 확정
}

// 안티패턴 2 — Destroy로 끝내기
var h = Addressables.InstantiateAsync("prefab/enemy");
GameObject enemy = await h.Task;
Destroy(enemy);  // ref-count 감소 안 됨, 다음 InstantiateAsync 시 동일 에셋 누수 누적

// 올바른 패턴
Addressables.ReleaseInstance(enemy);
```

---

## 4. AssetReference 패턴

### 4.1 기본 사용

```csharp
using UnityEngine;
using UnityEngine.AddressableAssets;

public class HeroSpawner : MonoBehaviour
{
    [SerializeField] private AssetReferenceGameObject heroPrefabRef;
    [SerializeField] private AssetReferenceSprite portraitRef;
    [SerializeField] private AssetReferenceTexture2D backgroundRef;

    private AsyncOperationHandle<GameObject> _heroHandle;

    private async void Start()
    {
        _heroHandle = heroPrefabRef.InstantiateAsync(transform.position, Quaternion.identity);
        GameObject hero = await _heroHandle.Task;
        hero.GetComponent<Hero>().Init();
    }

    private void OnDestroy()
    {
        // AssetReference로 InstantiateAsync한 경우도 ReleaseInstance 사용
        if (_heroHandle.IsValid())
            Addressables.ReleaseInstance(_heroHandle);
    }
}
```

### 4.2 자주 쓰는 AssetReference 변형 타입

| 타입 | 용도 |
|------|------|
| `AssetReferenceGameObject` | 프리팹 |
| `AssetReferenceSprite` | UI 스프라이트 |
| `AssetReferenceTexture2D` | 텍스처 |
| `AssetReferenceAtlasedSprite` | 스프라이트 아틀라스 안의 스프라이트 |
| `AssetReferenceT<T>` | 제네릭 (예: `AssetReferenceT<AudioClip>`) |

### 4.3 AssetReference 전용 release

```csharp
// 로드한 에셋만 해제 (인스턴스 X)
assetRef.ReleaseAsset();

// 인스턴스화한 GameObject 해제
heroPrefabRef.ReleaseInstance(heroInstance);
```

---

## 5. Labels 기반 다중 로드

### 5.1 Label 부여

Addressables Groups 창에서 에셋 선택 → Labels 컬럼 → 라벨 추가 (예: `enemy`, `boss`, `chapter1`).

### 5.2 단일 라벨로 다중 에셋 로드

```csharp
private List<AsyncOperationHandle<GameObject>> _enemyHandles = new();

public async UniTask LoadAllEnemies()
{
    AsyncOperationHandle<IList<GameObject>> handle =
        Addressables.LoadAssetsAsync<GameObject>(
            "enemy",                           // label
            asset => _enemyHandles.Add(default), // 각 에셋 로드 시 콜백 (옵션)
            Addressables.MergeMode.Union);     // 다중 키 조합 시 적용

    IList<GameObject> enemies = await handle.Task;
    // enemies = "enemy" 라벨이 붙은 모든 GameObject
}
```

### 5.3 다중 라벨 (AND / OR / Intersection)

```csharp
var keys = new List<object> { "enemy", "chapter1" };

// Union → "enemy" 또는 "chapter1" 라벨 (합집합)
var orHandle = Addressables.LoadAssetsAsync<GameObject>(
    keys, null, Addressables.MergeMode.Union);

// Intersection → "enemy"이면서 "chapter1" 라벨 (교집합)
var andHandle = Addressables.LoadAssetsAsync<GameObject>(
    keys, null, Addressables.MergeMode.Intersection);
```

> **주의**: 다중 키 `LoadAssetsAsync`의 결과 release는 반환 handle을 release한다. 개별 에셋 release 금지.

---

## 6. Groups 설정 전략

### 6.1 Bundle Mode 3종

| 모드 | 동작 | 적합한 경우 |
|------|------|------------|
| **Pack Together** (기본) | 그룹 전체를 하나의 AssetBundle로 | 묶음 단위로만 사용되는 에셋 (예: 한 챕터 리소스) |
| **Pack Separately** | 각 에셋을 개별 AssetBundle로 | 일부만 선택적으로 로드하는 에셋 (예: 캐릭터 스킨) |
| **Pack Together by Label** | 라벨 조합별로 묶기 | 라벨 기반으로 동시 로드되는 에셋군 |

### 6.2 Build & Load Paths

Group Inspector → Content Packing & Loading → `Build & Load Paths`:

| 옵션 | 빌드 위치 | 로드 위치 |
|------|----------|----------|
| **Local** | `Library/com.unity.addressables/aa/[BuildTarget]` | StreamingAssets (앱 빌드 내부 포함) |
| **Remote** | `ServerData/[BuildTarget]` | `RemoteLoadPath` 프로파일 변수 |
| **Custom** | 사용자 정의 | 사용자 정의 |

### 6.3 그룹 분리 전략 (모바일 게임 기준)

```
[Local Groups]
├── essentials       — 타이틀, 메인 메뉴, 공통 UI (앱에 포함)
└── tutorial         — 첫 플레이 필수

[Remote Groups]
├── characters       — Pack Separately (개별 다운로드)
├── chapter_1        — Pack Together (챕터 단위 묶음)
├── chapter_2        — Pack Together
└── seasonal_events  — Pack Together by Label (이벤트별)
```

---

## 7. Profiles & Remote Catalog

### 7.1 Profile 변수

Window → Asset Management → Addressables → Profiles:

| 변수 | 예시 값 |
|------|---------|
| `BuildTarget` | `Android`, `iOS`, `StandaloneWindows64` (자동) |
| `Local.BuildPath` | `Library/com.unity.addressables/aa/[BuildTarget]` |
| `Local.LoadPath` | `{UnityEngine.AddressableAssets.Addressables.RuntimePath}/[BuildTarget]` |
| `Remote.BuildPath` | `ServerData/[BuildTarget]` |
| `Remote.LoadPath` | `https://cdn.example.com/[BuildTarget]` |

빌드 타겟별로 동일 프로파일이 `[BuildTarget]` 치환을 통해 Android/iOS 양쪽 모두 작동한다.

### 7.2 Remote Catalog 활성화

Inspector → AddressableAssetSettings → `Build Remote Catalog` 체크.

이후 게임 업데이트 없이 에셋만 교체하려면:
1. 변경된 에셋만 다시 빌드 (`Build > Update a Previous Build`)
2. 생성된 `catalog_<timestamp>.json` + `catalog_<timestamp>.hash` + 변경된 `.bundle` 파일을 CDN에 업로드
3. 클라이언트가 다음 실행 시 자동으로 새 catalog 다운로드

```csharp
// 앱 시작 시 catalog 업데이트 확인
public async UniTask CheckForCatalogUpdate()
{
    var checkHandle = Addressables.CheckForCatalogUpdates(false);
    List<string> catalogs = await checkHandle.Task;
    Addressables.Release(checkHandle);

    if (catalogs.Count > 0)
    {
        var updateHandle = Addressables.UpdateCatalogs(catalogs, false);
        await updateHandle.Task;
        Addressables.Release(updateHandle);
    }
}
```

---

## 8. 빌드 워크플로우

### 8.1 Editor 빌드 (개발 중)

Window → Asset Management → Addressables → Groups → `Play Mode Script`:

| 모드 | 설명 | 권장 시점 |
|------|------|----------|
| **Use Asset Database** | Addressables 시스템을 우회, 에디터 에셋 직접 사용 | 빠른 개발 반복 |
| **Simulate Groups** | 가상의 번들 분석, 빌드 없이 의존성 확인 | 그룹 구성 검토 |
| **Use Existing Build** | 실제 빌드된 번들 사용 | 배포 전 최종 확인 |

### 8.2 콘텐츠 빌드

`Build > New Build > Default Build Script` → 모든 그룹을 빌드 path에 출력.

플레이어 빌드 전에 반드시 한 번 실행해야 한다. 안 하면 Local 번들이 StreamingAssets에 들어가지 않음.

### 8.3 Update a Previous Build (콘텐츠 핫픽스)

`Build > Update a Previous Build` → 이전 빌드 대비 변경분만 다시 빌드.

`addressables_content_state.bin` 파일을 이전 빌드 시점으로 보관해야 의미가 있다 (보통 git에 커밋).

---

## 9. 흔한 실수 모음

| 실수 | 결과 | 올바른 패턴 |
|------|------|------------|
| `LoadAssetAsync` handle을 변수에 저장 안 함 | 절대 release 못 함, 영구 누수 | handle을 필드/리스트에 보관 |
| `InstantiateAsync` 결과를 `Destroy`로 끝냄 | ref-count 감소 안 됨, 누수 | `Addressables.ReleaseInstance(go)` |
| 같은 handle을 `Release` 2번 호출 | `InvalidOperationException` 또는 경고 로그 | `if (handle.IsValid()) Release` 가드 |
| `Resources.Load`와 Addressables 혼용 | 메모리 회계 깨짐, AssetBundle 중복 로드 | 한 프로젝트는 한 시스템으로 통일 |
| 로드 완료 전에 `handle.Result` 사용 | `null` 또는 예외 | `await handle.Task` 또는 `yield return handle` 후 사용 |
| `Addressables.LoadSceneAsync`한 씬을 `SceneManager.UnloadSceneAsync`로 언로드 | 메모리 누수 | `Addressables.UnloadSceneAsync(handle)` 사용 |
| 모든 그룹을 `Pack Together`로 설정 | 작은 변경에도 전체 번들 재다운로드 | 변경 빈도 기준으로 그룹 분리 |
| Remote 그룹인데 `Build Remote Catalog` 미체크 | 콘텐츠 업데이트 시 앱 재빌드 강제 | Remote 사용 시 반드시 체크 |

---

## 10. 모바일 게임 체크리스트

배포 전 확인:

- [ ] Addressables 버전 2.x (Unity 6 LTS 호환)
- [ ] 모든 `LoadAssetAsync` 호출에 대응하는 `Release` 호출 있음
- [ ] 모든 `InstantiateAsync` 호출에 대응하는 `ReleaseInstance` 호출 있음
- [ ] `Build > New Build > Default Build Script` 실행 후 플레이어 빌드
- [ ] Android와 iOS 양쪽 Profile에 `BuildTarget` 치환 정상 작동
- [ ] Remote 그룹 사용 시 `Build Remote Catalog` 체크 + CDN URL 유효
- [ ] `addressables_content_state.bin` 버전 관리에 포함
- [ ] `Resources.Load` 호출 없음 (`grep -r "Resources.Load"` 확인)
- [ ] Memory Profiler로 씬 전환 후 ref-count 0 도달 확인

---

## 참고 자료

- [Addressables 공식 매뉴얼](https://docs.unity3d.com/Packages/com.unity.addressables@latest/)
- [Addressables GitHub 미러](https://github.com/needle-mirror/com.unity.addressables)
- [Addressables Sample 프로젝트](https://github.com/Unity-Technologies/Addressables-Sample)
- [UniTask Addressables 연동](https://github.com/Cysharp/UniTask)
- [Addler — 자동 ref-count 관리 OSS](https://github.com/Haruma-K/Addler)
