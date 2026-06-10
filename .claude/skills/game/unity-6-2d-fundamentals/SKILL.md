---
name: unity-6-2d-fundamentals
description: >
  Unity 6 LTS 기반 2D 게임 개발 핵심 스킬. URP 2D, Tilemap, Rigidbody2D.linearVelocity·Slide(),
  Input System, Cinemachine 3, IL2CPP 빌드 설정, MonoBehaviour 생명주기 등 모바일 2D 게임
  실전 패턴을 다룬다.
  <example>사용자: "Unity 6에서 2D 캐릭터 컨트롤러 어떻게 만들지?"</example>
  <example>사용자: "Rigidbody2D.velocity가 사라졌는데 뭘 써야 해?"</example>
  <example>사용자: "Unity 6 모바일 빌드 설정 알려줘"</example>
---

# Unity 6 LTS 2D 게임 개발 핵심

> 소스:
> - Unity 6 What's New: https://docs.unity3d.com/6000.2/Documentation/Manual/WhatsNewUnity6.html
> - Rigidbody2D.linearVelocity: https://docs.unity3d.com/6000.3/Documentation/ScriptReference/Rigidbody2D-linearVelocity.html
> - Rigidbody2D.Slide: https://docs.unity3d.com/6000.2/Documentation/ScriptReference/Rigidbody2D.Slide.html
> - Input System: https://docs.unity3d.com/Packages/com.unity.inputsystem@latest
> - Cinemachine 3: https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/manual/
> - Android 요구사항: https://docs.unity3d.com/6000.2/Documentation/Manual/android-requirements-and-compatibility.html
>
> 검증일: 2026-06-08

---

## 1. Unity 6 LTS 핵심 정보

| 항목 | 값 |
|------|------|
| Unity 6.0 LTS 출시일 | 2024-10-17 |
| Unity 6.0 표준 LTS 지원 | 2년 (2026년 10월까지) |
| Unity 6.3 LTS 출시일 | 2025-12-04 |
| Unity 6.3 LTS 지원 종료 | 2027-12-04 |
| Enterprise/Industry 연장 | 표준 + 1년 |

**LTS 정책:** Unity 6의 각 마이너 버전(6.0 / 6.1 / 6.2 / 6.3 ...)은 모두 LTS로 출시되며 2년간 패치를 받는다. 신규 프로젝트는 가능한 최신 6.x LTS를 사용한다.

---

## 2. 렌더 파이프라인 — URP 2D 권장

| 파이프라인 | 모바일 2D 적합성 |
|-----------|-----------------|
| **URP 2D Renderer** | 권장. 모바일에 맞춰진 라이팅·셰이더·성능 최적화 옵션 제공 |
| Built-in RP | 신규 2D 프로젝트에는 비권장. URP 2D 기능(2D Lights, Shader Graph 2D) 사용 불가 |
| HDRP | 2D 부적합 (Android·iOS 미지원) |

**모바일용 URP Asset 설정 권장:**
- Forward 렌더링 경로 + Depth Priming Mode: **Disabled** (모바일)
- Store Actions: **Auto** 또는 **Discard** (대역폭 절약)
- MSAA: **2x** (타일 기반 모바일 GPU에서 효율적)

---

## 3. Unity 6 Physics 2D — Breaking Change

### 3-1. `Rigidbody2D.velocity` → `linearVelocity` 변경

**Unity 6에서 `Rigidbody2D.velocity`는 obsolete** 처리되었다. 신규 코드는 `linearVelocity`를 사용한다. `linearVelocityX` / `linearVelocityY` 속성으로 축별 접근도 가능하다.

```csharp
// 금지 — Unity 6에서 obsolete
rb.velocity = new Vector2(5f, 0f);

// 권장 — Unity 6
rb.linearVelocity = new Vector2(5f, 0f);

// 축별 접근
rb.linearVelocityX = 5f;
```

> 주의: 레거시 Unity 자료(블로그·튜토리얼)에는 `velocity`가 많이 남아 있다. Unity 6 프로젝트로 마이그레이션할 때 일괄 치환이 필요하다.

### 3-2. `Rigidbody2D.Slide()` — Unity 6 신규 API

지정한 속도로 이동하면서 **슬라이딩·중력·표면 앵커링·경사 미끄러짐**을 자동 처리하는 통합 API. 2D 캐릭터 컨트롤러 구현이 크게 간소화된다.

```csharp
using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class PlayerController : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private Rigidbody2D.SlideMovement slideMovement;

    private Rigidbody2D rb;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
    }

    private void FixedUpdate()
    {
        float input = Input.GetAxisRaw("Horizontal");
        Vector2 velocity = new Vector2(input * moveSpeed, rb.linearVelocityY);

        // 슬라이딩 + 중력 + 표면 앵커링 자동 처리
        rb.Slide(velocity, Time.fixedDeltaTime, slideMovement);
    }
}
```

`SlideMovement` 구조체로 경사각 임계값·표면 스내핑·중력 적용 여부를 설정한다. `useSimulationMove = true`이면 `MovePosition` 경유, false이면 위치를 즉시 설정한다.

### 3-3. 핵심 컴포넌트 조합

| 용도 | 컴포넌트 |
|------|---------|
| 동적 물리 객체 | `Rigidbody2D (Dynamic)` + `Collider2D` |
| 정적 지형 | `TilemapCollider2D` + `CompositeCollider2D` (병합용) |
| 트리거 영역 | `Collider2D` + `isTrigger = true` |
| 운동학 제어 | `Rigidbody2D (Kinematic)` + `Slide()` |

**CompositeCollider2D 확장 (Unity 6):** 합치기(OR) / 교집합(AND) / 차집합(NOT) / 뒤집기(XOR) 4가지 합성 연산 선택 가능. 복잡한 지형 콜라이더 최적화에 활용.

---

## 4. 필수 패키지

| 패키지 ID | 용도 |
|-----------|------|
| `com.unity.2d.sprite` | Sprite Editor (필수) |
| `com.unity.2d.tilemap` | Tilemap + Tile Palette |
| `com.unity.2d.tilemap.extras` | 룰 타일·애니메이션 타일 |
| `com.unity.2d.animation` | 스켈레탈 2D 애니메이션 (본 리깅) |
| `com.unity.2d.psdimporter` | Photoshop PSD 임포터 |
| `com.unity.inputsystem` | 신규 Input System |
| `com.unity.addressables` | 동적 에셋 로딩·메모리 관리 (Unity 6 권장 2.x) |
| `com.unity.cinemachine` | 카메라 시스템 (3.x 권장) |
| `com.unity.render-pipelines.universal` | URP (2D Renderer 포함) |

> 주의: `com.unity.2d.spriteshape`, `com.unity.2d.pixel-perfect`는 픽셀 아트·벡터 셰이프 사용 시에만 추가한다.

---

## 5. Sprite Atlas V2

**Unity 6에서 Sprite Atlas V1은 deprecated.** 신규 프로젝트는 V2가 기본이다.

활성화 경로: `Edit > Project Settings > Editor > Sprite Atlas > Mode > Sprite Atlas V2 - Enabled`

V2 장점:
- 더 타이트한 패킹 알고리즘 (낭비 공간 감소)
- Late binding 네이티브 지원
- 플랫폼별 Atlas Variant
- AssetDatabase V2 Cache Server 지원

> 주의: V1 → V2 마이그레이션은 자동으로 진행되며 **되돌릴 수 없다.** 활성화 전 백업 권장.

---

## 6. Input System (com.unity.inputsystem)

레거시 `Input.GetKey()` 방식은 신규 프로젝트에서 비권장. Unity 6는 신규 Input System을 표준으로 권장한다.

### 6-1. PlayerInput 컴포넌트 사용

1. Input Action Asset 생성 (`Create > Input Actions`)
2. Player GameObject에 `PlayerInput` 컴포넌트 추가
3. Actions 필드에 생성한 Asset 연결
4. Behavior: `Send Messages` / `Invoke Unity Events` / `Invoke C Sharp Events` 중 선택

### 6-2. 코드 예시 — Invoke C Sharp Events

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(PlayerInput))]
public class InputHandler : MonoBehaviour
{
    private PlayerInput playerInput;
    private InputAction moveAction;
    private InputAction jumpAction;

    private void Awake()
    {
        playerInput = GetComponent<PlayerInput>();
        moveAction = playerInput.actions["Move"];
        jumpAction = playerInput.actions["Jump"];
    }

    private void OnEnable()
    {
        jumpAction.performed += OnJump;
    }

    private void OnDisable()
    {
        jumpAction.performed -= OnJump;
    }

    private void Update()
    {
        Vector2 move = moveAction.ReadValue<Vector2>();
        // move 활용
    }

    private void OnJump(InputAction.CallbackContext ctx)
    {
        // 점프 처리
    }
}
```

### 6-3. 터치 입력 패턴 (모바일)

Input Action에서 `<Touchscreen>/primaryTouch/position` 바인딩으로 터치 좌표를 받는다. 가상 조이스틱은 `On-Screen Stick` 컴포넌트(UI 이미지에 부착)로 액션과 연결한다.

> 주의: 신규 Input System 활성화 후에도 `Player Settings > Active Input Handling`에서 `Both` 또는 `Input System Package (New)` 선택이 필요하다.

---

## 7. Cinemachine 3 — 2D 카메라

Unity 6 권장 Cinemachine은 **3.x 메이저**. 2.x에서 클래스명이 변경되었다.

| 2.x (legacy) | 3.x (Unity 6 권장) |
|--------------|---------------------|
| `CinemachineVirtualCamera` | `CinemachineCamera` |
| `Follow` | `Tracking Target` |

### 2D 카메라 셋업 절차

1. `Hierarchy 우클릭 > Cinemachine > 2D Camera` 생성
2. Main Camera에 `CinemachineBrain` 자동 추가됨
3. CinemachineCamera의 **Tracking Target**에 플레이어 GameObject 드래그
4. Main Camera Projection을 **Orthographic**으로 설정
5. Dead Zone / Soft Zone / Damping 튜닝

---

## 8. 모바일 빌드 설정 체크리스트

### 8-1. Player Settings — 공통

- **Company Name** / **Product Name** / **Version** 명확히 설정
- **Bundle Identifier**: `com.{company}.{product}` 역도메인 표기

### 8-2. Android

| 항목 | 권장값 |
|------|--------|
| Scripting Backend | **IL2CPP** |
| Target Architectures | **ARMv7 ❌ + ARM64 ✅** (ARM64 단독이 빌드 사이즈 ↓) |
| Minimum API Level | **API Level 23 (Android 6.0)** 이상 (Unity 6 공식 최소) |
| Target API Level | 최신 (35/36 지원) |
| Graphics API | Vulkan + OpenGL ES 3.0 (자동 선택) |

> 주의: 사용자 입력에 'API Level 26'이 명시되었으나 **Unity 6 공식 최소 지원은 API 23**이다. Google Play 정책상 신규 앱은 최신 Target API가 필수이므로 Target은 최신으로 설정한다.

### 8-3. iOS

| 항목 | 권장값 |
|------|--------|
| Scripting Backend | **IL2CPP** (iOS는 IL2CPP 강제) |
| Target minimum iOS Version | **iOS 13** 이상 (Unity 6 공식 최소) |
| Architecture | ARM64 (자동) |

### 8-4. IL2CPP vs Mono 요약

| 항목 | IL2CPP | Mono |
|------|--------|------|
| 컴파일 방식 | AOT (C++ 경유 네이티브) | JIT |
| 런타임 성능 | 빠름 | 보통 |
| 빌드 시간 | 느림 | 빠름 |
| iOS·WebGL·콘솔 | 강제 사용 | 사용 불가 |
| 모바일 권장 | ✅ | ❌ |

### 8-5. Build Profiles Window (Unity 6 신규)

`File > Build Profiles`로 진입. 플랫폼별 독립 빌드 설정을 명명·저장한다. 기존 Build Settings의 상위 호환.

---

## 9. C# 코드 패턴

### 9-1. MonoBehaviour 생명주기 (실행 순서)

```
Awake → OnEnable → Start → (매 프레임) FixedUpdate → Update → LateUpdate → ...
                          → OnDisable → OnDestroy
```

| 함수 | 호출 시점 | 용도 |
|------|----------|------|
| `Awake` | 인스턴스 생성 직후 (활성 여부 무관, 비활성 시 활성될 때) | 자기 참조 초기화 (GetComponent 등) |
| `OnEnable` | 활성화될 때마다 | 이벤트 구독 |
| `Start` | 첫 Update 직전 (Awake/OnEnable 모두 끝난 뒤) | 다른 오브젝트 의존 초기화 |
| `FixedUpdate` | 고정 간격 (Physics) | 물리 연산 (`Rigidbody2D` 조작) |
| `Update` | 매 프레임 | 입력·게임 로직 |
| `LateUpdate` | Update 후 | 카메라 추적·후처리 |
| `OnDisable` | 비활성화될 때 | 이벤트 구독 해제 |

> 주의: 오브젝트 간 Awake 순서는 비결정적이다. 다른 오브젝트에 의존하는 초기화는 반드시 `Start`에서 수행한다.

### 9-2. GetComponent 캐싱 패턴

매 프레임 `GetComponent` 호출 금지. Awake에서 1회 캐싱한다.

```csharp
public class EnemyAI : MonoBehaviour
{
    private Rigidbody2D rb;
    private Animator animator;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        animator = GetComponent<Animator>();
    }
}
```

### 9-3. SerializeField + private 패턴

Inspector 노출은 필요하지만 외부 클래스 접근은 차단하고 싶을 때 사용. 캡슐화 + 인스펙터 편의 동시 확보.

```csharp
public class Player : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private int maxHp = 100;

    // 외부 노출이 필요한 경우 public 프로퍼티
    public int CurrentHp { get; private set; }
}
```

### 9-4. ScriptableObject + `[CreateAssetMenu]`

게임 데이터(아이템·캐릭터 스탯·레벨 설정)는 ScriptableObject로 분리한다. 코드 재컴파일 없이 디자이너가 수정 가능.

```csharp
[CreateAssetMenu(fileName = "EnemyData", menuName = "Game/Enemy Data")]
public class EnemyData : ScriptableObject
{
    public string enemyName;
    public int maxHp;
    public float moveSpeed;
    public Sprite icon;
}
```

`Project 뷰 우클릭 > Create > Game > Enemy Data`로 인스턴스 생성.

### 9-5. Coroutine 기본 패턴

시간 흐름이 필요한 비동기 로직에 사용. `StartCoroutine`으로 시작, `StopCoroutine`으로 중단.

```csharp
private Coroutine flashRoutine;

private void OnHit()
{
    if (flashRoutine != null) StopCoroutine(flashRoutine);
    flashRoutine = StartCoroutine(FlashRed());
}

private IEnumerator FlashRed()
{
    var sr = GetComponent<SpriteRenderer>();
    sr.color = Color.red;
    yield return new WaitForSeconds(0.1f);
    sr.color = Color.white;
}
```

> 주의: `WaitForSeconds`는 GC 할당을 발생시킨다. 반복 호출 구간에서는 인스턴스 캐싱(`private static readonly WaitForSeconds wait = new(0.1f);`)을 권장.

---

## 10. 흔한 실수 패턴

| 실수 | 올바른 패턴 |
|------|------------|
| `Update`에서 `Rigidbody2D` 조작 | `FixedUpdate`에서 조작 (Physics 동기화) |
| `Update`마다 `GetComponent` 호출 | `Awake`에서 1회 캐싱 |
| `rb.velocity` 사용 (Unity 6) | `rb.linearVelocity` 사용 |
| `Input.GetKey` 신규 프로젝트 | Input System + `PlayerInput` |
| `CinemachineVirtualCamera` | `CinemachineCamera` (Cinemachine 3) |
| `transform.position` 직접 이동 (Rigidbody 있을 때) | `Rigidbody2D.MovePosition` 또는 `Slide` |
| 모바일 Mono 사용 | IL2CPP + ARM64 |
| 거대 단일 Tilemap Collider | `CompositeCollider2D`로 병합 |

---

## 11. 빠른 의사결정 표

| 상황 | 선택 |
|------|------|
| 신규 2D 모바일 프로젝트 | Unity 6.3 LTS + URP 2D + IL2CPP + ARM64 |
| 캐릭터 컨트롤러 | `Rigidbody2D.Slide()` (Unity 6 신규) |
| 카메라 추적 | Cinemachine 3 + `CinemachineCamera` |
| 입력 처리 | Input System + `PlayerInput` |
| 레벨 디자인 | Tilemap + Tile Palette + `CompositeCollider2D` |
| 게임 데이터 | ScriptableObject + `[CreateAssetMenu]` |
| 에셋 동적 로딩 | Addressables 2.x |
| 스프라이트 배치 | Sprite Atlas V2 |
