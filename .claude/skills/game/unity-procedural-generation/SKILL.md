---
name: unity-procedural-generation
description: >
  Unity 6 LTS + C# 2D 모바일 캐주얼/로그라이크 게임용 절차적 콘텐츠 생성(PCG) 스킬.
  WFC, BSP, Cellular Automata, Perlin Noise 알고리즘 선택과 Tilemap 연동 패턴 제공.
---

# Unity 6 LTS 2D 절차적 콘텐츠 생성 (PCG)

> 소스: Unity 6 LTS 공식 문서 (docs.unity3d.com), Unity Blog, mxgmn/WaveFunctionCollapse, UnityTechnologies/ProceduralPatterns2D — 상세 URL 아래.
>
> 주요 1순위 소스:
> - Unity Tilemap API: https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Tilemaps.Tilemap.html
> - Unity Tilemap.SetTile: https://docs.unity3d.com/ScriptReference/Tilemaps.Tilemap.SetTile.html
> - Unity Tilemap.SetTilesBlock: https://docs.unity3d.com/ScriptReference/Tilemaps.Tilemap.SetTilesBlock.html
> - Unity Mathf.PerlinNoise: https://docs.unity3d.com/ScriptReference/Mathf.PerlinNoise.html
> - Unity Random.InitState: https://docs.unity3d.com/ScriptReference/Random.InitState.html
> - Unity Random.state: https://docs.unity3d.com/ScriptReference/Random-state.html
> - Unity Blog "Procedural patterns you can use with Tilemaps (Part I & II)": https://unity.com/blog/engine-platform/procedural-patterns-you-can-use-with-tilemaps-part-1
> - Unity 공식 샘플 ProceduralPatterns2D: https://github.com/UnityTechnologies/ProceduralPatterns2D
> - Unity Rule Tile (2D Tilemap Extras 2.2): https://docs.unity3d.com/Packages/com.unity.2d.tilemap.extras@2.2/manual/RuleTile.html
> - WFC 원본(Maxim Gumin, 2016): https://github.com/mxgmn/WaveFunctionCollapse
> - WFC 학술(Karth & Smith, FDG 2017): https://dl.acm.org/doi/10.1145/3102071.3110566
> - Random number primer: https://blog.unity.com/technology/a-primer-on-repeatable-random-numbers
>
> 대상 버전: Unity 6 LTS (6000.0 ~ 6000.3) / C# 9 호환 / 2D Tilemap + 2D Tilemap Extras 2.2
> **주의(2026-09-26 재검증)**: 2D Tilemap Extras 패키지는 2.2 이후 3.0/4.0/8.0/9.0까지 올라갔다(2026-09 기준 최신 9.0.x). 본 스킬이 다루는 RuleTile 사용법(9슬롯 인접 패턴 에디터 자산, 벽/바닥 2종 배치)은 에디터 자산 워크플로로 버전 간 변경 없이 유효하나, 스크립트로 `GetMatchingNeighboringTiles()` 등 RuleTile 내부 API를 직접 호출한다면 최신 패키지 문서를 별도 확인할 것(해당 API는 이후 버전에서 삭제된 사례가 있음). 본 스킬은 해당 API를 사용하지 않으므로 본문 수정은 하지 않는다.
> 검증일: 2026-09-26

---

## 1. 언제 / 언제 쓰지 않을지

**적합:**
- 로그라이크/로그라이트(매 런 새 던전), 무한 러너, 끝없는 동굴 탐험, 퍼즐 변형
- 콘텐츠 제작 인력이 부족하지만 다양성이 필요한 모바일 캐주얼 게임
- 저장 용량을 줄여야 하는 모바일 게임 (시드 1개로 맵 재생성)

**부적합:**
- 내러티브 중심 핸드크래프트 레벨 (PCG는 스토리·핀포인트 연출에 약함)
- 모바일에서 매 프레임 수천 타일을 즉시 생성해야 하는 게임 (메인 스레드 freeze 위험)
- 디자이너가 픽셀 단위로 통제해야 하는 퍼즐 (제약 조건 정의 비용이 더 큼)

---

## 2. 알고리즘 선택 결정 트리

```
"내 게임은 어떤 맵을 원하는가?"
│
├─ 격자형 방·복도 던전 (로그라이크 RPG, Slay the Spire식 미니 던전)
│   → BSP (Binary Space Partitioning)
│
├─ 유기적·자연 동굴, 둥근 경계 (Terraria식 동굴, 광산)
│   → Cellular Automata
│
├─ 입력 예시 한 장으로 "그 스타일" 변주 (퍼즐 보드, 정형 패턴)
│   → Wave Function Collapse (WFC)
│
├─ 광활한 자연 지형, 높이맵 기반 (오픈월드 농장 게임, 사이드뷰 산악)
│   → Perlin Noise (옥타브 합성)
│
└─ 단일 통로형 (간단한 무한 러너, 기본 미로)
    → Random Walk / Drunkard's Walk
```

**조합 권장 패턴:**
- BSP로 큰 방 잡고 → Cellular Automata로 방 내부 디테일링
- Perlin Noise로 바이옴 결정 → WFC로 각 바이옴 타일 배치
- 어떤 알고리즘이든 마지막은 RuleTile/Auto-Tiling으로 보더 처리

---

## 3. 공통 시드(Seed) 시스템 — 재현 가능한 PCG

> 공식 문서: Unity Random은 **Marsaglia Xorshift 128** 알고리즘 (Unity Blog "A primer on repeatable random numbers").

```csharp
using UnityEngine;

public class SeededGenerator : MonoBehaviour
{
    [SerializeField] private int seed = 0;
    [SerializeField] private bool useRandomSeed = true;

    private Random.State savedState; // 시드 복원용 스냅샷

    public int Initialize()
    {
        if (useRandomSeed)
        {
            // 시드는 System DateTime 기반으로 1회만 뽑고, 그 후부터는 결정론적
            seed = System.DateTime.Now.GetHashCode();
        }

        Random.InitState(seed);
        savedState = Random.state; // 처음 상태 보존 (재생성용)
        return seed;
    }

    /// <summary>같은 시드로 처음부터 다시 생성</summary>
    public void Restart()
    {
        Random.state = savedState;
    }

    /// <summary>현재 상태를 저장(중간 저장 지원)</summary>
    public Random.State Snapshot() => Random.state;

    /// <summary>저장된 상태로 복귀</summary>
    public void Restore(Random.State state) => Random.state = state;
}
```

> 주의: `Random.InitState(seed)`로 설정한 seed 정수는 **이후 조회할 수 없다**. 시드 자체는 별도 변수에 보관해 두고, 중간 저장이 필요하면 `Random.state`를 직렬화해야 한다.

> 주의: `UnityEngine.Random`은 정적 전역 상태이므로 여러 시스템이 호출하면 시퀀스가 어긋난다. 결정론이 중요하면 PCG 전용으로 `System.Random rng = new(seed);`를 별도 인스턴스화해 사용하는 것이 더 안전하다.

---

> → references/REFERENCE.md §4 Perlin Noise 지형 생성

---

> → references/REFERENCE.md §5 Cellular Automata 동굴 생성

---

> → references/REFERENCE.md §6 BSP 던전 생성

---

> → references/REFERENCE.md §7 Wave Function Collapse (WFC) — 개념 + Unity 연동 골격

---

## 8. Unity Tilemap 연동 — 배치 vs 단건

> 공식 문서: `SetTilesBlock`은 "more performant way to set Tiles as a batch compared to calling SetTile for every single Tile". 모바일에서 수천 타일을 깔 때는 *반드시* batch API 사용.

| API | 시그니처 | 사용 시점 |
|-----|---------|----------|
| `SetTile(Vector3Int, TileBase)` | 단일 셀 1개 | 게임 중 1~10개 타일 변경 |
| `SetTiles(Vector3Int[], TileBase[])` | 비연속 위치 다수 | 흩어진 타일 일괄 변경 (예: 잡초 스폰) |
| `SetTilesBlock(BoundsInt, TileBase[])` | 직사각형 영역 | PCG 초기 맵 페인팅 — *bounds 크기 × array 길이 일치 필수* |

```csharp
// 권장 — batch
var bounds = new BoundsInt(0, 0, 0, width, height, 1);
var arr = new TileBase[width * height];
// arr 채운 뒤
tilemap.SetTilesBlock(bounds, arr);
```

> 주의: `SetTilesBlock`은 `bounds.size.x * bounds.size.y * bounds.size.z`와 `array.Length`가 일치해야 한다(공식 문서). 다르면 예외 또는 잘못된 위치에 그려진다.

### RuleTile로 보더·벽 자동 처리

PCG 알고리즘은 보통 "벽/바닥" 같은 이진 데이터만 만든다. 벽의 모서리·코너 스프라이트는 **2D Tilemap Extras**의 `RuleTile`이 인접 상태를 보고 자동으로 그려준다.

- RuleTile asset: 인접 패턴 9슬롯에 스프라이트를 매핑 (`X`=벽, `●`=바닥, ` `=무관)
- 알고리즘 결과를 wall/floor 두 종의 RuleTile로만 깔면 → 코너·외곽 처리 끝
- 공식 문서: https://docs.unity3d.com/Packages/com.unity.2d.tilemap.extras@2.2/manual/RuleTile.html

---

> → references/REFERENCE.md §9 성능 최적화 (모바일)

---

## 10. 흔한 실수 8종

| # | 안티 패턴 | 영향 | 해결 |
|---|----------|------|------|
| 1 | 큰 맵에 `SetTile`을 루프로 호출 | 모바일에서 1~3초 freeze | `SetTilesBlock` 또는 `SetTiles` 사용 (공식 권장) |
| 2 | 코루틴 안에서 `yield` 없이 전체 루프 | freeze 그대로 | 프레임당 budget 두고 `yield return null` |
| 3 | `Mathf.PerlinNoise(0, 0)` 등 정수 좌표만 사용 | 항상 같은 값(보간 노드) | float 스케일 적용 → `(x * scale, y * scale)` |
| 4 | 시드 없이 `Random.value` → 디버깅 불가 | 버그 재현 불가 | `Random.InitState(seed)` + 시드 표시 |
| 5 | Cellular Automata 스무딩 시 같은 배열에 in-place 수정 | 결과 일그러짐 | 새 배열에 쓰고 swap |
| 6 | WFC에서 모순 시 무한 루프 | 앱 행 | `maxRetries` + 백트랙 |
| 7 | 동굴 알고리즘 후 연결성 미검증 | 고립된 방, 클리어 불가 | Flood Fill로 가장 큰 영역만 유지 또는 통로 추가 |
| 8 | UnityEngine API(`Tilemap`, `Random`)를 백그라운드 스레드에서 호출 | 즉시 예외 또는 미정의 동작 | 계산만 백그라운드, 페인팅은 메인 스레드 |

---

## 11. 자체 체크리스트

PCG 시스템을 출하 전 점검:

- [ ] 시드 1개로 같은 맵이 100% 재현되는가?
- [ ] 80×80 맵 생성에 모바일에서 200ms 이내인가? (또는 코루틴/비동기로 분산되는가?)
- [ ] 생성된 모든 방·바닥이 플레이어 시작 위치에서 도달 가능한가? (Flood Fill 검증)
- [ ] WFC/CA가 모순/실패 시 graceful fallback이 있는가?
- [ ] Tilemap batch API(`SetTilesBlock`/`SetTiles`)를 사용하는가?
- [ ] RuleTile 보더 처리가 외곽까지 자연스러운가?
- [ ] 동일 시드를 공유하면 다른 기기에서도 같은 결과인가? (`UnityEngine.Random` 외 외부 RNG 의존성 점검)

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
