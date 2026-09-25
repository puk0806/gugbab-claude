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
