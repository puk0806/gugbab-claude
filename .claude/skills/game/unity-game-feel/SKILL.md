---
name: unity-game-feel
description: >
  Unity 6 LTS + C# 2D 모바일 게임의 "게임 감각(Game Feel / Juice)" 구현 패턴.
  투사체 이동, 히트 이펙트, 카메라 셰이크, DOTween 펀치/셰이크,
  파티클·트레일, 시간 왜곡, URP 포스트 프로세싱, 흔한 실수까지 다룬다.
---

# Unity 게임 감각 (Game Feel / Juice) — 2D 모바일

> 소스:
> - Cinemachine 3.1 공식 문서 — https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/manual/CinemachineImpulseSource.html
> - Cinemachine 3.1 API — https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/api/Unity.Cinemachine.CinemachineImpulseSource.html
> - DOTween 공식 문서 — https://dotween.demigiant.com/documentation.php
> - UnityEngine.Pool.ObjectPool&lt;T&gt; — https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Pool.ObjectPool_1.html
> - ParticleSystem.Play / Stop — https://docs.unity3d.com/ScriptReference/ParticleSystem.Play.html
> - URP Bloom Volume Override — https://docs.unity3d.com/6000.0/Documentation/Manual/urp/post-processing-bloom.html
> - Rigidbody2D.AddForce — https://docs.unity3d.com/6000.3/Documentation/ScriptReference/Rigidbody2D.AddForce.html
> - Time.timeScale — https://docs.unity3d.com/ScriptReference/Time-timeScale.html
> 검증일: 2026-06-10
> 대상: Unity 6 LTS (6000.0.x ~ 6000.3.x), Cinemachine 3.1.x, DOTween 1.2.x, URP 17.x

---

## 0. 게임 감각(Juice)이란

플레이어가 입력 → 시각·청각·촉각적으로 "반응이 좋다"고 느끼게 만드는 *과장된 피드백 레이어*. 같은 게임 로직이라도 juice를 입히면 리텐션·체감 품질이 크게 올라간다.

핵심 원칙 4가지:
1. **즉시성** — 입력 후 16~50ms 이내에 시각/청각 반응 시작
2. **과장** — 현실적 수치가 아니라 *기분 좋게 느껴지는* 수치 (스케일 ±20~50%)
3. **다층 피드백** — 1개 액션 = 시각 + 청각 + 카메라 + 컨트롤러 진동의 동시 발생
4. **수렴** — 효과는 반드시 *원래 상태로 복귀*해야 한다 (DOPunch 계열이 기본 패턴인 이유)

---

## 1. 투사체 이동 패턴

### 1-1. 선형 직진 — Vector2.MoveTowards

**언제 쓰나**: 화살, 총알처럼 *일정 속도*로 직진하는 투사체.

> `Vector2.MoveTowards`는 한 프레임에 *고정 거리*만큼 이동시키며 target을 절대 overshoot하지 않는다. 반면 `Vector2.Lerp`는 *비율 기반*이라 매 프레임 호출 시 점점 느려진다(지수 감속). 일정 속도 투사체에는 MoveTowards가 정답이다.

```csharp
public class LinearProjectile : MonoBehaviour
{
    [SerializeField] private float speed = 12f;
    private Vector2 direction;

    public void Launch(Vector2 dir)
    {
        direction = dir.normalized;
        transform.right = direction; // 스프라이트가 진행 방향을 향하게
    }

    private void Update()
    {
        transform.position = Vector2.MoveTowards(
            transform.position,
            (Vector2)transform.position + direction,
            speed * Time.deltaTime);
    }
}
```

### 1-2. 호 포물선 — 높이 offset + DOTween

수류탄·아치 스킬처럼 *던지는 느낌*이 필요할 때. 시작점→끝점을 X축 직선 보간 + Y축에 sin 곡선 offset을 더해 호를 만든다.

```csharp
public class ArcProjectile : MonoBehaviour
{
    public void Launch(Vector3 start, Vector3 end, float height, float duration)
    {
        transform.position = start;
        float elapsed = 0f;

        DOTween.To(() => elapsed, x => elapsed = x, 1f, duration)
            .OnUpdate(() =>
            {
                Vector3 pos = Vector3.Lerp(start, end, elapsed);
                // y에 sin 곡선 offset 추가 (0→1 구간에서 sin(πt)는 0→1→0)
                pos.y += Mathf.Sin(elapsed * Mathf.PI) * height;
                transform.position = pos;
            })
            .SetEase(Ease.Linear)
            .OnComplete(() => OnLand());
    }

    private void OnLand() { /* 폭발 이펙트 트리거 */ }
}
```

### 1-3. 2차 베지어 — Quadratic Bezier

곡선 경로가 미리 결정되어 있을 때(보스 패턴, 미리 정의된 궤적). 제어점 1개로 부드러운 곡선을 만든다.

```csharp
private Vector3 QuadraticBezier(Vector3 p0, Vector3 p1, Vector3 p2, float t)
{
    float u = 1f - t;
    return u * u * p0 + 2f * u * t * p1 + t * t * p2;
}
```

### 1-4. 유도 미사일 — 방향 보간 + 회전 lerp

**핵심 트릭**: target 방향을 매 프레임 *완전히 따라가게 하지 않는다*. `Vector3.RotateTowards` 또는 angular velocity로 *회전 속도에 상한*을 둬야 "유도되는 느낌"이 산다(즉시 target을 향하면 그냥 화살이 된다).

```csharp
public class HomingMissile : MonoBehaviour
{
    [SerializeField] private float speed = 8f;
    [SerializeField] private float rotateSpeed = 200f; // deg/sec
    [SerializeField] private Transform target;

    private Rigidbody2D rb;
    private void Awake() => rb = GetComponent<Rigidbody2D>();

    private void FixedUpdate()
    {
        if (target == null) { rb.linearVelocity = transform.right * speed; return; }

        Vector2 dir = ((Vector2)target.position - rb.position).normalized;
        // 현재 진행 방향과 target 방향 사이의 cross로 회전 부호 결정
        float rotateAmount = Vector3.Cross(dir, transform.right).z;
        rb.angularVelocity = -rotateAmount * rotateSpeed;
        rb.linearVelocity = transform.right * speed;
    }
}
```

> 주의: Unity 6에서 `Rigidbody2D.velocity`는 `linearVelocity`로 이름이 바뀌었다. 구버전 코드를 가져올 때 컴파일 에러를 확인하라.

### 1-5. 투사체 풀링 — UnityEngine.Pool.ObjectPool&lt;T&gt;

Unity 2021.1부터 표준 제공되는 `UnityEngine.Pool.ObjectPool<T>`를 쓴다. 모바일에서는 `Instantiate`/`Destroy` 매 프레임 호출이 GC spike의 주범이다.

```csharp
using UnityEngine.Pool;

public class ProjectileSpawner : MonoBehaviour
{
    [SerializeField] private LinearProjectile prefab;
    private IObjectPool<LinearProjectile> pool;

    private void Awake()
    {
        pool = new ObjectPool<LinearProjectile>(
            createFunc: () =>
            {
                var p = Instantiate(prefab);
                p.SetPool(pool); // 자기 자신을 풀에 반환할 수 있도록
                return p;
            },
            actionOnGet:     p => p.gameObject.SetActive(true),
            actionOnRelease: p => p.gameObject.SetActive(false),
            actionOnDestroy: p => Destroy(p.gameObject),
            collectionCheck: false, // 프로덕션은 false (중복 release 검사 비용 절감)
            defaultCapacity: 20,
            maxSize: 100);
    }

    public void Fire(Vector2 dir)
    {
        var proj = pool.Get();
        proj.transform.position = transform.position;
        proj.Launch(dir);
    }
}
```

투사체 쪽에서는 수명이 끝나면 `pool.Release(this)`로 자기 자신을 반환한다.

> 주의: `ObjectPool<T>`는 백그라운드 스레드에서 호출 안전하지 않다 (공식 문서 명시). 메인 스레드에서만 Get/Release 한다.

---

## 2. 히트 이펙트 (Hit Feedback)

### 2-1. 히트스톱 (Hit Stop / Freeze Frame)

피격 순간 50~100ms 게임 시간을 멈춰 *충격감*을 만든다. 격투/액션 게임 juice의 핵심.

```csharp
public class HitStopController : MonoBehaviour
{
    public static HitStopController Instance;
    private void Awake() => Instance = this;

    public void Stop(float duration)
    {
        StartCoroutine(StopRoutine(duration));
    }

    private IEnumerator StopRoutine(float duration)
    {
        Time.timeScale = 0f;
        // WaitForSeconds는 timeScale=0이면 안 풀린다 → WaitForSecondsRealtime 필수
        yield return new WaitForSecondsRealtime(duration);
        Time.timeScale = 1f;
    }
}

// 호출: HitStopController.Instance.Stop(0.08f); // 80ms
```

> 주의: `WaitForSeconds`는 timeScale 영향을 받아 timeScale=0일 때 영원히 풀리지 않는다. **반드시 `WaitForSecondsRealtime`**.

> 주의: 일시정지 메뉴와 hit stop이 충돌할 수 있다. timeScale을 직접 건드리지 말고 *전용 매니저*가 reference count로 관리하게 만드는 패턴이 안전하다.

### 2-2. 피격 플래시 — SpriteRenderer 흰색 깜빡임

피격 1프레임 동안 스프라이트를 *흰색으로 덧칠*해서 hit 위치를 강조한다.

**권장 방법**: 셰이더 graph + `_FlashAmount` property + `material.SetFloat`. 단 인스턴스마다 머터리얼 인스턴싱이 발생하면 SRP Batcher가 깨지므로 `MaterialPropertyBlock`을 쓴다.

```csharp
public class HitFlash : MonoBehaviour
{
    [SerializeField] private SpriteRenderer sr;
    private MaterialPropertyBlock mpb;
    private static readonly int FlashID = Shader.PropertyToID("_FlashAmount");

    private void Awake() => mpb = new MaterialPropertyBlock();

    public void Flash(float duration = 0.08f)
    {
        StopAllCoroutines();
        StartCoroutine(FlashRoutine(duration));
    }

    private IEnumerator FlashRoutine(float duration)
    {
        sr.GetPropertyBlock(mpb);
        mpb.SetFloat(FlashID, 1f);
        sr.SetPropertyBlock(mpb);

        yield return new WaitForSecondsRealtime(duration);

        sr.GetPropertyBlock(mpb);
        mpb.SetFloat(FlashID, 0f);
        sr.SetPropertyBlock(mpb);
    }
}
```

> 주의: 간단히 `sr.color = Color.white`로 처리하면 *원래 색상이 흰색이 아닌 스프라이트는 효과가 안 보인다*. 셰이더 graph + `_FlashAmount` 방식이 안전.

### 2-3. 넉백 — Rigidbody2D.AddForce(Impulse)

```csharp
public class Knockback : MonoBehaviour
{
    [SerializeField] private Rigidbody2D rb;
    [SerializeField] private float knockbackForce = 8f;

    public void Apply(Vector2 hitFromDirection)
    {
        // 피격당한 방향의 *반대*로 밀려나야 한다
        Vector2 dir = -hitFromDirection.normalized;
        rb.linearVelocity = Vector2.zero; // 누적 방지
        rb.AddForce(dir * knockbackForce, ForceMode2D.Impulse);
    }
}
```

> `ForceMode2D.Impulse`는 *즉시 속도 변화*를 적용한다. `ForceMode2D.Force`는 시간에 걸쳐 누적되므로 넉백에는 부적합.

> 주의: 넉백 중 플레이어 이동 입력이 동시 적용되면 효과가 상쇄된다. *knockback 중 입력 차단* 플래그 + 짧은 타이머(0.2~0.3s)를 함께 둔다.

---

## 3. 카메라 흔들림 (Camera Shake)

### 3-1. Cinemachine 3 Impulse 시스템 (권장)

Unity 6 LTS와 짝이 되는 Cinemachine 3.1 기준이다. 두 컴포넌트로 구성된다:
- **CinemachineImpulseSource** — 이벤트 발생 위치에 부착해 *흔들림 신호*를 쏨
- **CinemachineImpulseListener** — Virtual Camera(CinemachineCamera)에 부착해 신호를 *수신*

```csharp
using Unity.Cinemachine; // Cinemachine 3.x 네임스페이스 변경

public class CameraShakeEmitter : MonoBehaviour
{
    [SerializeField] private CinemachineImpulseSource impulseSource;

    // 가장 간단한 호출 — 기본 velocity (DefaultVelocity 필드값) 사용
    public void ShakeDefault() => impulseSource.GenerateImpulse();

    // 강도만 조절 — 표준 방향 + 커스텀 강도
    public void ShakeWithForce(float force) => impulseSource.GenerateImpulseWithForce(force);

    // 방향과 강도 모두 조절 — velocity 벡터 통째로 지정
    public void ShakeWithVelocity(Vector3 velocity) =>
        impulseSource.GenerateImpulseWithVelocity(velocity);

    // 특정 위치에서 발생 (히트 위치 기반)
    public void ShakeAt(Vector3 hitPos, Vector3 velocity) =>
        impulseSource.GenerateImpulseAtPositionWithVelocity(hitPos, velocity);
}
```

**Inspector에서 설정할 핵심 파라미터**:
- `ImpulseDefinition.ImpulseDuration` — 흔들림 지속 시간 (0.2~0.5초)
- `ImpulseDefinition.ImpulseShape` (Recoil / Bump / Explosion / Rumble) — 신호 곡선
- `DefaultVelocity` — `GenerateImpulse()` 인자 없이 호출했을 때 사용되는 기본 방향·강도

**Listener 측**:
- `CinemachineCamera`에 `CinemachineImpulseListener` Extension 추가
- `Gain` — 수신 시 증폭 배율
- `Use2DDistance` — 2D 게임은 ✓ 체크 (z축 거리 무시)
- Channel mask로 *어떤 Source 신호를 받을지* 필터링 가능 (캐릭터마다 다른 채널)

> 주의: Cinemachine 2.x → 3.x로 올라오며 네임스페이스가 `Cinemachine` → `Unity.Cinemachine`으로 바뀌고 `CinemachineVirtualCamera` → `CinemachineCamera`로 통합되었다. Unity 6에서는 반드시 3.x 패키지를 쓴다.

### 3-2. DOTween 폴백 (Cinemachine 없을 때)

```csharp
public class SimpleCameraShake : MonoBehaviour
{
    [SerializeField] private Transform camTransform;

    public void Shake(float duration = 0.2f, float strength = 0.3f, int vibrato = 10)
    {
        camTransform.DOKill(); // 진행 중 셰이크가 있으면 제거 (중복 누적 방지)
        camTransform.DOShakePosition(duration, strength, vibrato, 90f, false, true);
    }
}
```

---

## 4. DOTween 게임 감각 패턴

DOTween은 게임 감각 연출의 *de facto* 표준 라이브러리다. 핵심은 "*펀치 → 원위치*" 패턴.

### 4-1. Punch 계열 — 한 번 튀고 돌아온다

```csharp
// 데미지 표시 UI가 살짝 커졌다 돌아옴 (크리티컬 표시 등)
damageText.transform.DOPunchScale(Vector3.one * 0.3f, 0.3f, vibrato: 10, elasticity: 1f);

// 카드를 손에 쥘 때 살짝 튀는 느낌
card.transform.DOPunchPosition(Vector3.up * 0.2f, 0.4f, vibrato: 10, elasticity: 0.5f);

// 버튼 클릭 시 회전 펀치
button.transform.DOPunchRotation(new Vector3(0, 0, 15), 0.3f, vibrato: 5, elasticity: 0.5f);
```

파라미터:
- `punch`: 펀치 강도·방향 벡터 (현재 값에 *추가*됨)
- `duration`: 전체 지속 시간
- `vibrato`: 진동 횟수 (높을수록 떨림)
- `elasticity`: 0~1. 1이면 반대 방향까지 오버슈트, 0이면 시작점과 펀치 방향 사이만 진동

### 4-2. Shake 계열 — 무작위 진동

```csharp
// 적이 피격 시 흔들림
enemySprite.DOShakePosition(0.2f, strength: 0.15f, vibrato: 20,
    randomness: 90f, snapping: false, fadeOut: true);

// 화면이 폭발에 흔들림
mainCam.DOShakePosition(0.5f, new Vector3(0.3f, 0.2f, 0), 15, 90f);
```

> 주의: `randomness`는 0~180. 공식 문서는 *"90 초과 값은 별로다(kind of suck)"*고 명시. 90을 기본값으로 두라.

### 4-3. Ease 활용 — 게임 감각의 핵심

```csharp
// 메뉴 등장 — 탄성 (튕기며 들어오는 느낌)
menu.transform.DOScale(Vector3.one, 0.5f).SetEase(Ease.OutElastic);

// 동전 획득 UI — 바운스 (떨어지며 튕김)
coinUI.transform.DOLocalMoveY(targetY, 0.7f).SetEase(Ease.OutBounce);

// 매끄러운 카드 슬라이드
card.transform.DOMoveX(targetX, 0.4f).SetEase(Ease.OutCubic);

// 커스텀 곡선 (AnimationCurve)
[SerializeField] private AnimationCurve customCurve;
target.DOMoveY(10, 1f).SetEase(customCurve);
```

자주 쓰는 Ease 표:

| Ease | 용도 |
|------|------|
| `OutElastic` | 메뉴 등장, 강조하고 싶은 UI |
| `OutBounce` | 떨어지는 코인·아이템, 바닥 닿는 느낌 |
| `OutBack` | 살짝 오버슈트 후 안정 (버튼 hover) |
| `OutCubic` / `OutQuad` | 일반적인 부드러운 감속 |
| `InOutQuad` | 카메라 패닝, A→B 이동 |
| `Linear` | 회전·트레일 등 등속이 자연스러운 것 |

### 4-4. SetUpdate(true) — 타임스케일 무시

게임이 일시정지(timeScale=0) 또는 hit stop 중이어도 *UI 애니메이션은 계속 돌아야* 한다.

```csharp
// pauseMenu 페이드인 — timeScale=0 중에도 작동
canvasGroup.DOFade(1f, 0.3f).SetUpdate(isIndependentUpdate: true);

// 또는 UpdateType 명시
transform.DOMoveX(5, 1).SetUpdate(UpdateType.Normal, isIndependentUpdate: true);
```

`SetUpdate(true)`된 트윈은 `Time.timeScale`과 `Time.maximumDeltaTime`을 무시한다(공식 문서).

### 4-5. Kill — 메모리·null reference 방어

오브젝트가 비활성/파괴될 때 *진행 중인 트윈*이 dangling 상태로 남으면 NullReferenceException이 터진다.

```csharp
private Tween moveTween;

private void Start()
{
    moveTween = transform.DOMoveX(10, 2f).SetEase(Ease.OutQuad);
}

private void OnDisable()
{
    moveTween?.Kill(); // 트윈 핸들을 보관해뒀다 명시적 Kill
    // 또는 transform.DOKill(); // 이 transform의 모든 트윈 일괄 종료
}
```

> 주의: 씬 전환 시 dangling 방지로 `DOTween.KillAll()`을 호출하는 패턴이 흔하지만, *모든 씬의 모든 트윈을 죽이므로* DontDestroyOnLoad 객체의 트윈까지 끊긴다. 가능하면 객체별 `DOKill()`이 안전하다.

> 주의: `Transform.DOKill()`은 대량 호출 시 비싸다(공식 이슈 트래커 #151에서 40~60% CPU 점유 사례 보고). 수천 개 풀링 객체마다 매 Release에서 DOKill은 피하고, *트윈 핸들 보관 + 직접 Kill* 방식을 쓴다.

---

## 5. 파티클 시스템 히트 이펙트

### 5-1. ParticleSystem.Play() / Stop()

```csharp
public class HitParticle : MonoBehaviour
{
    [SerializeField] private ParticleSystem ps;

    public void TriggerHit(Vector3 pos)
    {
        transform.position = pos;
        // withChildren=true (기본): 자식 ParticleSystem도 함께 재생
        ps.Play(true);
    }

    public void StopAll()
    {
        // StopEmittingAndClear: 즉시 모든 파티클 제거 + 방출 중단
        ps.Stop(true, ParticleSystemStopBehavior.StopEmittingAndClear);
    }
}
```

`ParticleSystemStopBehavior`:
- `StopEmitting`: 새 파티클 방출만 중단 (기존 파티클은 수명 다할 때까지 표시)
- `StopEmittingAndClear`: 방출 중단 + 모든 파티클 즉시 제거

### 5-2. 파티클 프리팹 풀링

매 히트마다 `Instantiate(particlePrefab)` 하면 모바일에서 GC spike가 난다. 풀링 + `Play()` 트리거 패턴으로 해결.

```csharp
public class HitEffectPool : MonoBehaviour
{
    [SerializeField] private ParticleSystem prefab;
    private IObjectPool<ParticleSystem> pool;

    private void Awake()
    {
        pool = new ObjectPool<ParticleSystem>(
            createFunc: () =>
            {
                var ps = Instantiate(prefab);
                // 자동으로 끝나면 풀에 반환 — Main module의 stopAction을 Callback으로
                var main = ps.main;
                main.stopAction = ParticleSystemStopAction.Callback;
                ps.gameObject.AddComponent<ParticleReturnHandler>().Setup(pool, ps);
                return ps;
            },
            actionOnGet: ps =>
            {
                ps.gameObject.SetActive(true);
                ps.Play(true);
            },
            actionOnRelease: ps =>
            {
                ps.Stop(true, ParticleSystemStopBehavior.StopEmittingAndClear);
                ps.gameObject.SetActive(false);
            },
            actionOnDestroy: ps => Destroy(ps.gameObject),
            defaultCapacity: 10,
            maxSize: 50);
    }

    public void Play(Vector3 pos)
    {
        var ps = pool.Get();
        ps.transform.position = pos;
    }
}

// 파티클이 자연 종료되면 OnParticleSystemStopped 콜백으로 풀 반환
public class ParticleReturnHandler : MonoBehaviour
{
    private IObjectPool<ParticleSystem> pool;
    private ParticleSystem ps;
    public void Setup(IObjectPool<ParticleSystem> p, ParticleSystem s) { pool = p; ps = s; }
    private void OnParticleSystemStopped() => pool.Release(ps);
}
```

### 5-3. 2D Sprite Trail (Trail Renderer)

검의 잔상·대시 잔상 같은 효과. 2D 게임에서는 별도 머터리얼 필요.

**필수 설정**:
- `Material`: URP 2D Sprite-Lit/Unlit 호환 트레일용 머터리얼 (Default-Line 머터리얼은 URP에서 분홍색)
- `Time`: 0.2~0.4초 (잔상 지속)
- `Min Vertex Distance`: 0.05 (너무 크면 끊김, 너무 작으면 정점 폭증)
- `Width Curve`: 시작 1 → 끝 0 (자연스러운 페이드)
- `Color Gradient`: alpha 1 → 0
- `Emitting`: false로 두고 *대시 시작 시만 true*로 토글

```csharp
public class DashTrail : MonoBehaviour
{
    [SerializeField] private TrailRenderer trail;

    public void StartDash() => trail.emitting = true;
    public void EndDash()
    {
        trail.emitting = false;
        // 잔상이 남아있는 동안 천천히 사라지도록 Clear는 호출하지 않는다
    }
}
```

> 주의: Trail Renderer는 *부모를 따라가는 잔상*을 만들지만 부모의 회전이 급격하게 바뀌면 trail이 끊겨 보인다. 캐릭터 자체보다 별도 *trail 전용 자식 오브젝트*에 붙이고, 회전은 부모만 변경하는 패턴이 깔끔하다.

---

## 6. 시간 왜곡 연출

### 6-1. 슬로우 모션

```csharp
public class SlowMotion : MonoBehaviour
{
    public void Enter(float scale = 0.3f, float duration = 0.5f)
    {
        DOTween.To(() => Time.timeScale, x => Time.timeScale = x, scale, 0.2f)
            .SetUpdate(true); // timeScale 자체가 변하므로 독립 업데이트 필수
        // 물리 안정성을 위해 fixedDeltaTime도 같이 줄여줘야 fixed update 빈도가 유지된다
        Time.fixedDeltaTime = 0.02f * scale;

        // duration 후 자동 복귀
        DOVirtual.DelayedCall(duration, Exit, ignoreTimeScale: true);
    }

    public void Exit()
    {
        DOTween.To(() => Time.timeScale, x => Time.timeScale = x, 1f, 0.3f)
            .SetUpdate(true)
            .OnComplete(() => Time.fixedDeltaTime = 0.02f);
    }
}
```

> 주의: `Time.timeScale`을 줄이면 `FixedUpdate` 호출 빈도가 줄어든다(기본 0.02s ÷ scale). 물리가 끊겨 보이면 *fixedDeltaTime도 비례 축소*한다. 단 너무 작게 두면 fixedupdate가 폭주하니 0.005 미만은 피한다.

### 6-2. 총알 타임 패턴

치명타 직전 0.2초 슬로우 + 임팩트 순간 hit stop + 정상 복귀.

```csharp
public IEnumerator BulletTimeCombo()
{
    SlowMotion.Instance.Enter(scale: 0.25f, duration: 0.4f);
    yield return new WaitForSecondsRealtime(0.4f);

    HitStopController.Instance.Stop(0.1f); // 임팩트 hit stop
    yield return new WaitForSecondsRealtime(0.1f);

    // SlowMotion.Enter의 자동 Exit가 이어서 동작
}
```

### 6-3. UI 면역 처리

```csharp
// UI 트윈은 timeScale 영향을 안 받아야 한다
uiPanel.DOFade(1, 0.3f).SetUpdate(isIndependentUpdate: true);

// Animator 컴포넌트 — Update Mode: "Unscaled Time"으로 변경
animator.updateMode = AnimatorUpdateMode.UnscaledTime;
```

---

## 7. 화면 효과 — URP Post Processing

### 7-1. Volume.weight 트위닝 — Vignette 펄스

피격 시 0.3초간 비네팅이 강해졌다 돌아오는 패턴.

```csharp
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

public class DamageVignette : MonoBehaviour
{
    [SerializeField] private Volume damageVolume; // weight=0으로 시작
    [SerializeField] private float peakWeight = 1f;
    [SerializeField] private float duration = 0.3f;

    public void Pulse()
    {
        damageVolume.DOKill();
        DOTween.Sequence()
            .Append(DOTween.To(() => damageVolume.weight, x => damageVolume.weight = x,
                peakWeight, duration * 0.3f))
            .Append(DOTween.To(() => damageVolume.weight, x => damageVolume.weight = x,
                0f, duration * 0.7f))
            .SetTarget(damageVolume);
    }
}
```

### 7-2. Bloom intensity 직접 조작

치명타·스킬 발동 시 화면 전체가 *번쩍*하는 효과.

```csharp
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

public class BloomPulse : MonoBehaviour
{
    [SerializeField] private Volume globalVolume;
    private Bloom bloom;
    private float baseIntensity;

    private void Start()
    {
        if (globalVolume.profile.TryGet<Bloom>(out bloom))
            baseIntensity = bloom.intensity.value;
    }

    public void Pulse(float peakIntensity = 2f, float duration = 0.3f)
    {
        if (bloom == null) return;
        DOTween.Sequence()
            .Append(DOTween.To(() => bloom.intensity.value,
                x => bloom.intensity.value = x, peakIntensity, duration * 0.2f))
            .Append(DOTween.To(() => bloom.intensity.value,
                x => bloom.intensity.value = x, baseIntensity, duration * 0.8f));
    }
}
```

> 주의: URP의 post effect 파라미터는 단순 `float`이 아니라 `ClampedFloatParameter` 같은 래퍼 타입이다. 값 접근은 `bloom.intensity.value`, 변경은 `bloom.intensity.value = x`. 직접 `bloom.intensity = 2f` 대입은 컴파일 에러다.

> 주의: 모바일에서 Bloom은 비싸다. *전역 Bloom intensity를 매번 트위닝*하지 말고, Vignette/Chromatic Aberration 같은 가벼운 효과를 우선 쓴다.

---

## 8. 흔한 실수 8종

### 실수 1. Update에서 매 프레임 ParticleSystem.Play() 호출

```csharp
// 잘못
private void Update()
{
    if (isHit) ps.Play(); // 매 프레임 재시작 → 파티클이 0에서 멈춰있는 것처럼 보임
}

// 옳음 — 이벤트 시점에 한 번만
public void OnHit() { ps.Play(); }
```

### 실수 2. Camera shake 중복 호출 누적

```csharp
// 잘못 — 매번 새 shake 트윈이 추가돼 점점 심해짐
public void Shake() => cam.DOShakePosition(0.2f, 0.3f);

// 옳음 — 이전 셰이크를 Kill 후 시작
public void Shake()
{
    cam.DOKill();
    cam.DOShakePosition(0.2f, 0.3f, vibrato: 10, randomness: 90, fadeOut: true);
}
```

### 실수 3. DOTween Kill 누락 → NullReferenceException

```csharp
// 잘못 — 오브젝트가 destroy돼도 트윈이 살아서 dangling reference
private void Start() => transform.DOMoveX(10, 5);

// 옳음
private Tween moveTween;
private void Start() => moveTween = transform.DOMoveX(10, 5);
private void OnDisable() => moveTween?.Kill();
```

### 실수 4. WaitForSeconds로 hit stop 구현

```csharp
// 잘못 — Time.timeScale=0이면 영원히 안 풀림
IEnumerator HitStop() { Time.timeScale = 0; yield return new WaitForSeconds(0.1f); Time.timeScale = 1; }

// 옳음
IEnumerator HitStop() { Time.timeScale = 0; yield return new WaitForSecondsRealtime(0.1f); Time.timeScale = 1; }
```

### 실수 5. Instantiate/Destroy 매 발사마다 호출

모바일 GC spike의 원흉. **반드시 `ObjectPool<T>`**로 대체한다 (1-5 참고).

### 실수 6. timeScale 줄였는데 fixedDeltaTime은 그대로

물리 frame rate가 끊겨 보인다. `Time.fixedDeltaTime`도 비례해서 줄인다 (6-1 참고).

### 실수 7. UI 트윈에 SetUpdate(true) 누락

pause 메뉴를 띄웠는데 페이드 인이 멈춤. UI는 일반적으로 `SetUpdate(isIndependentUpdate: true)`.

### 실수 8. Trail Renderer Default 머터리얼 사용 (URP에서 분홍색)

`Default-Line` 머터리얼은 Built-in Render Pipeline 용. URP에서는 `Universal Render Pipeline/Particles/Unlit` 또는 Sprite-Lit 호환 머터리얼을 새로 만들어 트레일에 할당한다.

---

## 9. 권장 호출 순서 — "한 방 강한 피격"

연출 효과를 최대로 끌어올리는 *조합* 타이밍 예시:

```csharp
public void OnCriticalHit(Vector3 hitPos)
{
    // 1. 즉시 (0ms): 피격 플래시 + 파티클
    enemy.GetComponent<HitFlash>().Flash(0.08f);
    hitParticlePool.Play(hitPos);

    // 2. 즉시 (0ms): 카메라 임펄스
    impulseSource.GenerateImpulseAtPositionWithVelocity(hitPos, Vector3.right * 0.5f);

    // 3. 즉시 (0ms): hit stop 시작 (80~120ms)
    HitStopController.Instance.Stop(0.1f);

    // 4. 즉시 (0ms): 데미지 텍스트 punch scale
    damageText.transform.DOPunchScale(Vector3.one * 0.4f, 0.3f, 10, 1f)
        .SetUpdate(isIndependentUpdate: true); // hit stop에 면역

    // 5. 즉시 (0ms): 적 넉백
    enemy.GetComponent<Knockback>().Apply((enemy.position - hitPos).normalized);

    // 6. 0ms: 비네팅 펄스
    damageVignette.Pulse();
}
```

이 6가지가 *동시에 발사*되어야 "찰진" 피드백이 된다. 하나라도 시간차로 밀리면 juice가 깨진다.

---

## 10. 체크리스트

게임 감각 구현 후 자가 점검:

- [ ] 입력 → 시각 반응까지 50ms 이내인가
- [ ] 모든 효과는 *원래 상태로 복귀*하는가 (timeScale, weight, color)
- [ ] 풀링 적용했는가 (투사체·파티클·데미지 텍스트)
- [ ] DOTween 핸들 보관·Kill 처리가 있는가
- [ ] timeScale 변경 시 fixedDeltaTime도 같이 처리하는가
- [ ] UI 트윈에 `SetUpdate(true)` 또는 `WaitForSecondsRealtime` 사용했는가
- [ ] Cinemachine Impulse 채널 분리(플레이어/적/보스)가 되어 있는가
- [ ] 모바일 30/60FPS 환경에서 GC alloc이 0인가 (Profiler 확인)
