---
name: unity-mobile-optimization
description: >
  Unity 2D 모바일 게임의 렌더링·메모리·CPU·빌드·2D 특화 최적화 가이드.
  Sprite Atlas, SRP Batcher, Addressables, Object Pooling, IL2CPP+ARM64, ASTC 등
  공식 문서 기반 모바일 최적화 패턴 모음.
  <example>사용자: "Draw Call이 300개가 넘는데 어떻게 줄이나요?"</example>
  <example>사용자: "Unity 모바일 빌드 크기를 100MB 이하로 맞추고 싶어요"</example>
  <example>사용자: "Tilemap에서 Collider 개수가 너무 많아 물리가 무거워요"</example>
---

# Unity 2D 모바일 게임 최적화

> 소스:
> - Unity URP 최적화 공식 문서: https://docs.unity3d.com/6000.0/Documentation/Manual/urp/optimize-for-better-performance.html
> - SRP Batcher: https://docs.unity3d.com/6000.3/Documentation/Manual/urp/shaders-in-universalrp-srp-batcher.html
> - Sprite Atlas 최적화: https://docs.unity3d.com/6000.0/Documentation/Manual/sprite/atlas/workflow/optimize-sprite-atlas-usage-size-improved-performance.html
> - Pixel Perfect Camera (URP): https://docs.unity3d.com/6000.1/Documentation/Manual/urp/2d-pixelperfect-ref.html
> - Tilemap Collider 2D: https://docs.unity3d.com/6000.3/Documentation/Manual/tilemaps/work-with-tilemaps/tilemap-collider-2d-reference.html
> - Object Pool (UnityEngine.Pool): https://docs.unity3d.com/ScriptReference/Pool.ObjectPool_1.html
> - Addressables Memory: https://docs.unity3d.com/Packages/com.unity.addressables@2.0/manual/memory-assetbundles.html
> - Frame Debugger: https://docs.unity3d.com/Manual/FrameDebugger.html
> - Audio file compression: https://docs.unity3d.com/6000.3/Documentation/Manual/AudioFiles-compression.html
> - Fixed updates: https://docs.unity3d.com/6000.3/Documentation/Manual/fixed-updates.html
> - IL2CPP build size: https://support.unity.com/hc/en-us/articles/208412186-IL2CPP-build-size-optimizations
> 검증일: 2026-06-08
> 기준 버전: Unity 6 (6000.x LTS), URP 17, Addressables 2.0+

---

## 적용 대상

| 항목 | 권장 |
|------|------|
| Unity 버전 | 6000.x LTS (Unity 6) |
| 렌더 파이프라인 | URP 17 (2D Renderer) |
| 타깃 플랫폼 | Android (API 26+) / iOS 14+ |
| 스크립팅 백엔드 | IL2CPP 필수 (Mono 금지) |
| 아키텍처 | ARM64 (Android는 ARMv7 + ARM64 동시 활성화) |

---

## 1. 렌더링 최적화

### 1-1. Draw Call 최소화

- **Sprite Atlas V2** — 여러 스프라이트를 한 텍스처에 패킹해 동일 머티리얼·셰이더 기준 하나의 드로우 콜로 묶이게 한다.
- **SRP Batcher** — URP 2D Renderer에서 기본 활성화. 동일 셰이더 변형(variant)을 쓰는 머티리얼들의 드로우 콜 준비 비용을 CPU 측에서 묶어 처리한다.
  - 핵심 조건: 셰이더가 `UnityPerMaterial`·`UnityPerDraw` CBUFFER를 선언해야 함 (URP/2D 내장 셰이더는 호환).
  - 동일 셰이더 변형이면 머티리얼이 달라도 묶을 수 있다. 셰이더 변형 수를 최소화하라.
  - 2D 한정 제약: `_TexelSize`·`_ST` 텍스처 프로퍼티 사용 머티리얼은 2D SRP Batcher 비호환.
- **GPU Instancing** — 동일 메시·머티리얼을 대량 그릴 때만 사용. **SRP Batcher와 동시 적용 불가** — SRP Batcher가 우선 적용되며, GPU Instancing을 쓰려면 `MaterialPropertyBlock`이나 셰이더 수정으로 SRP Batcher 호환성을 명시적으로 제거해야 한다.

```csharp
// MaterialPropertyBlock으로 SRP Batcher 호환성 제거 + GPU Instancing 사용
var block = new MaterialPropertyBlock();
block.SetColor("_Color", color);
spriteRenderer.SetPropertyBlock(block);
```

> 주의: 일반 2D 게임에서는 SRP Batcher가 거의 항상 더 유리하다. GPU Instancing은 동일 스프라이트 1000개 이상 그리는 풀스크린 파티클·탄막 같은 특수 케이스에만 고려한다.

### 1-2. Camera.main 캐싱

`Camera.main`은 내부적으로 `MainCamera` 태그 GameObject 검색을 수행한다. Unity 2019.4.9 이후 내부 캐시가 추가되어 빨라졌지만, **여전히 Update/FixedUpdate 호출 빈도에서는 수동 캐싱이 권장**된다.

```csharp
public class CameraFollow : MonoBehaviour
{
    private Camera _mainCam; // 캐시

    private void Awake()
    {
        _mainCam = Camera.main;
    }

    private void LateUpdate()
    {
        // 금지: Camera.main을 매 프레임 호출
        // var pos = Camera.main.transform.position;

        // 권장: 캐시된 참조 사용
        var pos = _mainCam.transform.position;
    }
}
```

### 1-3. Pixel Perfect Camera (URP 2D)

- 패키지: `com.unity.2d.pixel-perfect` (URP 2D 기본 포함)
- 핵심 속성:
  - **Asset Pixels Per Unit (PPU)** — 씬의 모든 스프라이트 PPU와 일치시킨다 (예: 16, 32, 64, 100).
  - **Reference Resolution** — 원본 디자인 해상도 (예: 320×180).
  - **Pixel Snapping** — 활성화하면 SpriteRenderer가 월드 그리드에 스냅된다. 그리드 크기는 `1 / Asset PPU`.
- 에디터에서 Move X/Y/Z 그리드 스냅 값: `1 / Asset PPU` (예: PPU 100이면 0.01).

---

## 2. 메모리 최적화

### 2-1. Texture 압축

| 플랫폼 | 권장 포맷 | 비고 |
|--------|-----------|------|
| Android (Adreno 4xx+ / Mali T624+ / Tegra K1+) | **ASTC 6×6** | Unity 6 기본값 |
| iOS (A8 이상, 2014~) | **ASTC 6×6** | Apple 권장 |
| 캐릭터·UI 등 품질 민감 | ASTC 4×4 | 비트레이트 증가 |
| 단순 배경·이펙트 | ASTC 8×8 ~ 12×12 | 용량 절감 |

- ASTC 비트레이트: 4×4 = 8 bpp, 6×6 = 3.56 bpp, 8×8 = 2 bpp, 12×12 = 0.89 bpp.
- 미지원 기기에서는 런타임 압축 해제 → 메모리·렌더 속도 둘 다 손해. ASTC 미지원 구형 기기는 별도 ETC2 변형 빌드 고려.

### 2-2. Mip Maps

- **2D 스프라이트·UI는 Mip Maps 비활성화 필수.**
- 이유: Mip Maps는 텍스처 메모리·디스크 용량을 33% 증가시키며, 항상 풀 해상도로 그리는 UI/스프라이트에는 이득 없음.
- 위치: Texture Import Settings → Advanced → `Generate Mip Maps` 체크 해제.

### 2-3. Audio 설정

| 용도 | Compression Format | Load Type | Sample Rate | Channels |
|------|---------------------|-----------|-------------|----------|
| 짧은 SFX (1초 이하) | PCM 또는 ADPCM | Decompress on Load | 22050 Hz | Mono |
| 일반 SFX | Vorbis (Quality 70) | Compressed in Memory | 22050 Hz | Mono |
| BGM | Vorbis (Quality 50~70) | Streaming | 44100 Hz | Stereo |
| 보이스 | Vorbis (Quality 40~60) | Streaming | 22050 Hz | Mono |

> 주의: 모바일 SFX는 22050 Hz Mono로 충분하다. 44100 Hz Stereo로 임포트하면 두 배 메모리.
> ADPCM은 Vorbis보다 메모리·CPU 모두 가벼울 수 있다 (반복적인 짧은 SFX에 적합).

### 2-4. Addressables로 씬 단위 언로딩

- Unity 6에서는 `com.unity.addressables` 2.0+ 권장.
- 참조 카운팅 기반: `Addressables.LoadAssetAsync<T>` / `Addressables.Release` 쌍을 맞춰야 0으로 떨어지며 언로드 가능.
- 번들 분할 원칙:
  - **작은 번들 다수** → 피크 메모리 ↓ (씬 전환 시 부분 해제)
  - **큰 번들 소수** → 총 메모리 ↓ (메타데이터 오버헤드 ↓)
  - 모바일은 보통 **씬별/스테이지별 그룹 분할**이 적절.
- 의존성: 같은 번들 내 다른 에셋이 참조되면 번들 전체가 메모리 상주.

```csharp
// 로드
var handle = await Addressables.LoadAssetAsync<GameObject>("Enemy_Boss").Task;
Instantiate(handle);

// 사용 종료 시 명시적 해제
Addressables.Release(handle);
```

---

## 3. CPU 최적화

### 3-1. Update() 남용 방지

- 모든 MonoBehaviour에 빈 `Update()`만 있어도 엔진이 Native ↔ Managed 호출 오버헤드를 매 프레임 지불한다.
- **Event-driven 패턴**으로 대체:
  - C# `event` / `Action` / `UnityEvent`
  - 메시지 버스 (예: ScriptableObject 기반 이벤트 채널)
  - 풀링된 매니저가 단일 Update에서 일괄 처리

```csharp
// 금지: 100개 적이 각자 Update에서 거리 계산
public class Enemy : MonoBehaviour
{
    private void Update()
    {
        var dist = Vector2.Distance(transform.position, _player.position);
        // ...
    }
}

// 권장: 매니저가 단일 Update에서 일괄 처리
public class EnemyManager : MonoBehaviour
{
    private readonly List<Enemy> _enemies = new();
    private Transform _playerTf;

    private void Update()
    {
        var playerPos = _playerTf.position;
        foreach (var e in _enemies)
        {
            e.UpdateDistance(playerPos);
        }
    }
}
```

### 3-2. Object Pooling (UnityEngine.Pool.ObjectPool<T>)

Unity 2021 LTS 이상 내장 `UnityEngine.Pool.ObjectPool<T>` 사용 (스택 기반, `IObjectPool<T>` 구현).

```csharp
using UnityEngine.Pool;

public class BulletSpawner : MonoBehaviour
{
    [SerializeField] private Bullet _bulletPrefab;
    private IObjectPool<Bullet> _pool;

    private void Awake()
    {
        _pool = new ObjectPool<Bullet>(
            createFunc: () =>
            {
                var b = Instantiate(_bulletPrefab);
                b.SetPool(_pool);
                return b;
            },
            actionOnGet: b => b.gameObject.SetActive(true),
            actionOnRelease: b => b.gameObject.SetActive(false),
            actionOnDestroy: b => Destroy(b.gameObject),
            collectionCheck: true,   // 이중 Release 감지 (개발 빌드에서만)
            defaultCapacity: 50,
            maxSize: 200
        );
    }

    public Bullet Spawn() => _pool.Get();
}

public class Bullet : MonoBehaviour
{
    private IObjectPool<Bullet> _pool;
    public void SetPool(IObjectPool<Bullet> pool) => _pool = pool;

    private void OnTriggerEnter2D(Collider2D other)
    {
        _pool.Release(this);
    }
}
```

권장 대상: 총알, 파티클·이펙트, 적, 데미지 텍스트, UI 알림 토스트.

### 3-3. 물리 (FixedUpdate 주기)

- **기본 `Time.fixedDeltaTime = 0.02` (50Hz, 초당 50회).**
- 모바일에서는 일반적으로 그대로 두거나 약간 낮추는 방향(예: 0.03 ≈ 33Hz)이 부하 절감에 유리.
- 빠른 발사체·정밀 충돌이 필요하면 높이는 대신 (예: 0.0166 = 60Hz) Continuous Collision Detection을 활용하는 것이 권장.
- `Physics2D.Simulate`로 수동 제어도 가능 (메뉴 화면에서 물리 정지 등).

```csharp
// 초기화 시 게임별 조정
private void Awake()
{
    Time.fixedDeltaTime = 1f / 50f; // 50Hz 명시
}
```

### 3-4. String 연산

- 매 프레임 문자열 연결은 GC 압박 → 모바일에서 프레임 드랍·발열 유발.
- `+`/`string.Format` 대신 `StringBuilder` 또는 `$"{x}"` 보간 + 캐싱.

```csharp
// 금지: 매 프레임 새 string 생성
private void Update()
{
    _scoreText.text = "Score: " + _score;
}

// 권장 1: 값 변경 시에만 갱신
public void SetScore(int score)
{
    if (_lastScore == score) return;
    _lastScore = score;
    _scoreText.text = $"Score: {score}";
}

// 권장 2: 자주 갱신되는 텍스트는 StringBuilder + ClearAndAppend
private readonly StringBuilder _sb = new(32);
private void UpdateHud(int hp, int mp)
{
    _sb.Clear();
    _sb.Append("HP ").Append(hp).Append(" / MP ").Append(mp);
    _hudText.SetText(_sb); // TMP_Text.SetText(StringBuilder) — alloc 없음
}
```

---

## 4. 프로파일링 도구

| 도구 | 용도 | 위치 |
|------|------|------|
| **Unity Profiler** | CPU/GPU/Memory/Rendering/Audio 통합 | Window → Analysis → Profiler |
| **Frame Debugger** | Draw Call 한 건씩 스텝, 셰이더·머티리얼 확인 | Window → Analysis → Frame Debugger |
| **Memory Profiler** | 스냅샷·릭 추적 | `com.unity.memoryprofiler` 패키지 |
| **Xcode Instruments** | iOS GPU/Energy/Allocations | Xcode → Open Developer Tool |
| **Android GPU Inspector (AGI)** | Android GPU 프레임 분석 | https://gpuinspector.dev |
| **Arm Performance Studio** | Mali GPU 카운터 (Streamline 등) | Arm 공식 |

### 사용 순서

1. **Development Build + Autoconnect Profiler**로 실기기 빌드.
2. Unity Profiler로 CPU/GPU 어느 쪽이 병목인지 먼저 식별.
3. CPU 병목 → Profiler CPU 탭 + Deep Profile (개발 빌드 전용).
4. GPU 병목 → Frame Debugger로 Draw Call 분석 → Xcode/AGI로 셰이더 단위 분석.
5. 메모리 누수 → Memory Profiler 스냅샷 2개 비교.

> 주의: Frame Debugger 원격 사용은 멀티스레드 렌더링 지원 플랫폼 필요. **iOS는 원격 Frame Debugger 미지원**. WebGL도 미지원.

---

## 5. 빌드 최적화

### 5-1. Player Settings 권장값

| 항목 | 값 |
|------|---|
| Scripting Backend | **IL2CPP** (필수) |
| Api Compatibility Level | .NET Standard 2.1 |
| Target Architectures (Android) | ARMv7 + **ARM64** 동시 활성화 |
| Target Architectures (iOS) | ARM64 (단일) |
| **Strip Engine Code** | 활성화 |
| **Managed Stripping Level** | **High** (`link.xml` 또는 `[Preserve]` 필요시 추가) |
| Android Compression Method | LZ4HC (스토리지 ↓, 압축 풀이 비용 ↑) |
| Splash Screen | 라이선스 허용 시 제거 |

> 주의: High 스트리핑 단계에서는 리플렉션 기반 코드가 잘려나갈 위험이 있다. JSON 역직렬화 라이브러리·DI 컨테이너 사용 시 `link.xml`로 보존 클래스를 명시한다.

### 5-2. Android R8 / iOS Bitcode

- **R8** — `Player Settings → Publishing Settings → Minify (Release)` 활성화. ProGuard는 deprecated이므로 R8 사용.
- 사용자 정의 ProGuard rules가 필요하면 `Custom Proguard File` 체크 후 `Assets/Plugins/Android/proguard-user.txt` 사용.
- iOS는 Bitcode 폐기됨 (Xcode 14+). 별도 설정 불필요.

### 5-3. 초기 다운로드 크기 목표

- 모바일 스토어 권장: **초기 APK/IPA 100MB 이하**, 추가 콘텐츠는 Addressables 원격 그룹으로 분리.
- iOS App Thinning + Android App Bundle (AAB) 활용 → 디바이스별 ASTC 텍스처·아키텍처만 다운로드되도록.

---

## 6. 2D 특화 최적화

### 6-1. Sprite Atlas V2

- Unity 2022+ 기본. URP 2D 권장.
- Inspector 권장 설정:
  - **Type**: Master
  - **Allow Rotation**: 활성화 (UI 외 일반 스프라이트는 회전 패킹 허용 → 더 빽빽)
  - **Tight Packing**: 활성화 (메시 외곽선 기반 패킹 — 빈 공간 최소화)
  - **Padding**: **2~4 px** (필터링 블리딩 방지)
  - **Read/Write Enabled**: 비활성화 (메모리 절반 절감)
  - **Generate Mip Maps**: 비활성화
- Atlas Variants: 플랫폼별 해상도 다운스케일 (예: Master 2048 → Mobile Variant 1024).

### 6-2. Tilemap

- 큰 맵은 여러 Tilemap으로 분할 (스트리밍 영역 단위).
- Tilemap → Inspector → **Chunk Culling Bounds** 활용 (보이지 않는 청크는 컬링).
- Sprite Atlas에 타일 스프라이트도 함께 패킹 → 타일맵 Draw Call도 배칭.

### 6-3. Tilemap Collider 2D + Composite Collider 2D

- TilemapCollider2D 단독 사용 시 타일마다 개별 콜라이더 → 물리 비용 폭증.
- **TilemapCollider2D + Rigidbody2D(Static) + CompositeCollider2D** 조합 권장.
- 인접 타일 콜라이더를 하나의 도형으로 병합 → 충돌 계산량·메모리 모두 절감.
- `TilemapCollider2D.Used By Composite` 체크 필수.
- 타일 변경 시 `LateUpdate`에 배치 갱신되므로 다량 변경도 한 번에 처리.

### 6-4. 2D Physics — Layer Collision Matrix

- Project Settings → Physics 2D → **Layer Collision Matrix** 에서 불필요한 충돌 비활성화.
  - 예: `Bullet ↔ Bullet` 충돌 끔, `Pickup ↔ Wall` 충돌 끔.
- 레이어 자체를 의미별로 분리: `Player`, `Enemy`, `EnemyBullet`, `PlayerBullet`, `Pickup`, `Ground`, `OneWay` 등.
- `Physics2D.queriesHitTriggers`, `Physics2D.queriesStartInColliders`도 게임에 맞게 조정.

---

## 7. 모바일 기기별 타겟 지표

| 등급 | 목표 FPS | 메모리 | 권장 설정 |
|------|---------|--------|-----------|
| 하이엔드 (Snapdragon 8 Gen 2+, A15+) | **60 fps** | 600~800 MB | 풀 해상도, ASTC 6×6, 풀 이펙트 |
| 미드레인지 (Snapdragon 7 Gen 1, A12~A14) | **30~60 fps** | 400~500 MB | Render Scale 0.85, 이펙트 절반 |
| 로우엔드 (Adreno 5xx, Mali G52) | **30 fps** | **<400 MB** | Render Scale 0.7, ASTC 8×8, 파티클 제한 |

### 발열·배터리 가이드 (실측 권장 임계)

- 표면 온도 **45°C** 이상에서 thermal throttling 시작 가능 (기종마다 다름).
- 60fps 게임이 30fps로 떨어진다면 발열 throttling 의심 → 30fps 캡 옵션 제공.
- `Application.targetFrameRate = 30` + `QualitySettings.vSyncCount = 0`로 배터리 절약 옵션 제공.

> 주의: "60°C 이하" 같은 절대 온도 임계치는 기기·외기 온도에 따라 차이가 크다. 절대값보다 **30분 연속 플레이 시 프레임 안정성**을 KPI로 잡는 편이 실용적이다.

---

## 8. 흔한 실수 패턴

| 실수 | 결과 | 대응 |
|------|------|------|
| 모든 스프라이트 Mip Maps 활성화 | 메모리 33% 낭비 | 2D는 전부 비활성화 |
| Camera.main을 Update에서 호출 | 프레임당 수십 µs 손실 | Awake에서 캐시 |
| 빈 `Update()` 방치 | 매 프레임 Native↔Managed 호출 | 빈 Update 삭제 |
| `Instantiate`/`Destroy` 남발 | GC spike, 발열 | ObjectPool 사용 |
| TilemapCollider2D 단독 | 타일마다 콜라이더 → 물리 무거움 | CompositeCollider2D 결합 |
| SRP Batcher + GPU Instancing 동시 기대 | GPU Instancing 무시됨 | 둘 중 하나 선택 |
| 44100 Hz Stereo SFX | 메모리 2배 | 22050 Hz Mono |
| Managed Stripping `Disabled` 출시 | 빌드 크기 30~50% 증가 | High + link.xml |
| 모든 에셋 Resources 폴더 | 빌드 크기 폭증·언로드 불가 | Addressables 이전 |
| `string` 연결 매 프레임 | GC 압박 | StringBuilder/TMP.SetText |

---

## 9. 체크리스트 — 모바일 출시 전

- [ ] IL2CPP + ARM64 활성화
- [ ] Managed Stripping Level: High
- [ ] Strip Engine Code 활성화
- [ ] Sprite Atlas 모든 스프라이트 포함 (런타임 Draw Call ≤ 100 권장)
- [ ] 모든 2D 텍스처 Mip Maps OFF
- [ ] ASTC 6×6 기본, UI/캐릭터만 4×4
- [ ] Audio: SFX는 22050 Mono / BGM은 Streaming
- [ ] Addressables 그룹이 씬·스테이지 단위로 분리됨
- [ ] Object Pool 적용 (총알·이펙트·적)
- [ ] Layer Collision Matrix 정리
- [ ] Tilemap에 CompositeCollider2D 결합
- [ ] Camera.main 캐싱
- [ ] 30분 실기기 플레이 시 FPS 안정 & 발열 throttling 없음
- [ ] 초기 다운로드 100MB 이하 (또는 OBB/Addressables 원격 분리)
