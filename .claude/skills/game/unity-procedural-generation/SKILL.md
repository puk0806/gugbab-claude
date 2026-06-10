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
> 검증일: 2026-06-10

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

## 4. Perlin Noise 지형 생성

> 공식 문서: `Mathf.PerlinNoise(float x, float y)` → "Value between 0.0 and 1.0" (단, **0.0보다 약간 작거나 1.0보다 약간 클 수 있다 — 공식 명시**, 정확한 범위가 필요하면 클램프 필요).

```csharp
using UnityEngine;
using UnityEngine.Tilemaps;

public class PerlinTerrainGenerator : MonoBehaviour
{
    [SerializeField] private Tilemap tilemap;
    [SerializeField] private TileBase grassTile;
    [SerializeField] private TileBase sandTile;
    [SerializeField] private TileBase waterTile;

    [SerializeField] private int width = 100;
    [SerializeField] private int height = 100;
    [SerializeField] private float scale = 0.1f;     // 작을수록 부드러운 지형
    [SerializeField] private int octaves = 4;         // 디테일 레이어 수
    [SerializeField] private float persistence = 0.5f;
    [SerializeField] private float lacunarity = 2.0f;

    public void Generate(int seed)
    {
        Random.InitState(seed);
        // 시드별로 다른 영역을 샘플링 — 같은 좌표에서 같은 노이즈가 나오므로 오프셋이 필요
        Vector2 offset = new(Random.Range(-10000f, 10000f), Random.Range(-10000f, 10000f));

        // batch 배치를 위한 버퍼
        var positions = new Vector3Int[width * height];
        var tiles = new TileBase[width * height];

        for (int x = 0; x < width; x++)
        {
            for (int y = 0; y < height; y++)
            {
                float noise = FractalNoise(x, y, offset);
                int idx = x * height + y;
                positions[idx] = new Vector3Int(x, y, 0);
                tiles[idx] = PickTile(noise);
            }
        }

        // SetTile 루프 대신 SetTiles 한 번에 — 모바일 성능 차이 큼
        tilemap.SetTiles(positions, tiles);
    }

    private float FractalNoise(int x, int y, Vector2 offset)
    {
        float amplitude = 1f, frequency = 1f, value = 0f, max = 0f;
        for (int o = 0; o < octaves; o++)
        {
            float sx = (x + offset.x) * scale * frequency;
            float sy = (y + offset.y) * scale * frequency;
            // PerlinNoise는 [0,1]을 약간 벗어날 수 있으므로 노출 전에 클램프
            value += Mathf.Clamp01(Mathf.PerlinNoise(sx, sy)) * amplitude;
            max += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        return value / max;
    }

    private TileBase PickTile(float v) =>
        v < 0.3f ? waterTile :
        v < 0.4f ? sandTile  :
                   grassTile;
}
```

**핵심:**
- Perlin Noise는 **결정론적**이다 — 같은 좌표는 항상 같은 값. 다른 결과를 원하면 *좌표에 오프셋*을 더해야 한다.
- 단일 옥타브는 단조롭다 → fractal noise(옥타브 합성)로 디테일을 쌓는다.
- `scale`이 너무 크면 매 타일이 완전 랜덤처럼 보인다. 통상 0.05~0.2.

---

## 5. Cellular Automata 동굴 생성

> 공식 샘플(`UnityTechnologies/ProceduralPatterns2D`)의 `MapFunctions.cs` — Moore Neighbourhood 사용. "if 4보다 큰 이웃이 active면 active, 정확히 4면 유지, 아니면 inactive"가 표준.

```csharp
using UnityEngine;
using UnityEngine.Tilemaps;

public class CellularAutomataCave : MonoBehaviour
{
    [SerializeField] private Tilemap tilemap;
    [SerializeField] private TileBase wallTile;
    [SerializeField] private TileBase floorTile;

    [SerializeField] private int width = 80;
    [SerializeField] private int height = 80;
    [Range(0f, 1f)]
    [SerializeField] private float initialFillProbability = 0.45f;
    [SerializeField] private int smoothingIterations = 5;

    public void Generate(int seed)
    {
        Random.InitState(seed);
        int[,] map = InitializeMap();

        for (int i = 0; i < smoothingIterations; i++)
            map = SmoothMap(map);

        Paint(map);
    }

    private int[,] InitializeMap()
    {
        var map = new int[width, height];
        for (int x = 0; x < width; x++)
        for (int y = 0; y < height; y++)
            // 경계는 항상 벽으로 — 동굴이 화면 밖으로 새지 않게
            map[x, y] = (x == 0 || y == 0 || x == width - 1 || y == height - 1)
                ? 1
                : (Random.value < initialFillProbability ? 1 : 0);
        return map;
    }

    private int[,] SmoothMap(int[,] source)
    {
        // 주의: 새 배열에 써야 한다. 같은 배열에 in-place로 쓰면
        // 같은 iteration 안에서 이미 갱신된 셀이 이웃 카운트에 섞여 결과가 일그러진다.
        var next = new int[width, height];
        for (int x = 0; x < width; x++)
        for (int y = 0; y < height; y++)
        {
            int neighbours = CountMooreNeighbours(source, x, y);
            // Moore Neighbourhood 규칙 (UnityTechnologies/ProceduralPatterns2D 기준)
            if (neighbours > 4)      next[x, y] = 1; // 벽
            else if (neighbours == 4) next[x, y] = source[x, y]; // 유지
            else                      next[x, y] = 0; // 바닥
        }
        return next;
    }

    private int CountMooreNeighbours(int[,] map, int cx, int cy)
    {
        int count = 0;
        for (int dx = -1; dx <= 1; dx++)
        for (int dy = -1; dy <= 1; dy++)
        {
            if (dx == 0 && dy == 0) continue;
            int nx = cx + dx, ny = cy + dy;
            // 맵 밖은 벽으로 간주 — 경계 닫힘 보장
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) { count++; continue; }
            count += map[nx, ny];
        }
        return count;
    }

    private void Paint(int[,] map)
    {
        var positions = new Vector3Int[width * height];
        var tiles = new TileBase[width * height];
        for (int x = 0; x < width; x++)
        for (int y = 0; y < height; y++)
        {
            int idx = x * height + y;
            positions[idx] = new Vector3Int(x, y, 0);
            tiles[idx] = map[x, y] == 1 ? wallTile : floorTile;
        }
        tilemap.SetTiles(positions, tiles);
    }
}
```

**튜닝 가이드:**
- `initialFillProbability`: 0.4~0.5가 자연스러운 동굴. 0.55 이상은 통로가 너무 좁아진다.
- `smoothingIterations`: 4~6회. 너무 많이 돌리면 디테일이 사라진다.
- 생성 후 **연결성 검사(Flood Fill)** 로 고립된 방을 제거하거나 통로로 연결해야 플레이 가능한 맵이 된다.

---

## 6. BSP 던전 생성

```csharp
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Tilemaps;

public class BspDungeonGenerator : MonoBehaviour
{
    [SerializeField] private Tilemap tilemap;
    [SerializeField] private TileBase floorTile;
    [SerializeField] private TileBase wallTile;
    [SerializeField] private int width = 80;
    [SerializeField] private int height = 80;
    [SerializeField] private int minLeafSize = 12;
    [SerializeField] private int maxLeafSize = 24;

    private class Leaf
    {
        public RectInt rect;
        public Leaf left, right;
        public RectInt? room;
        public Leaf(RectInt r) { rect = r; }
        public bool IsLeaf => left == null && right == null;
    }

    public void Generate(int seed)
    {
        Random.InitState(seed);
        var root = new Leaf(new RectInt(0, 0, width, height));
        Split(root);

        var leaves = new List<Leaf>();
        CarveRooms(root, leaves);
        ConnectRooms(root);
        Paint();
    }

    private void Split(Leaf leaf)
    {
        if (!leaf.IsLeaf) return;
        // 분할 결정: 큰 쪽이 기준 — 비율이 1.25 넘으면 강제 분할
        bool splitH = Random.value > 0.5f;
        if (leaf.rect.width > leaf.rect.height * 1.25f) splitH = false;
        else if (leaf.rect.height > leaf.rect.width * 1.25f) splitH = true;

        int max = (splitH ? leaf.rect.height : leaf.rect.width) - minLeafSize;
        if (max <= minLeafSize) return; // 더 못 나눔

        int splitPos = Random.Range(minLeafSize, max);
        if (splitH)
        {
            leaf.left  = new Leaf(new RectInt(leaf.rect.x, leaf.rect.y, leaf.rect.width, splitPos));
            leaf.right = new Leaf(new RectInt(leaf.rect.x, leaf.rect.y + splitPos,
                                              leaf.rect.width, leaf.rect.height - splitPos));
        }
        else
        {
            leaf.left  = new Leaf(new RectInt(leaf.rect.x, leaf.rect.y, splitPos, leaf.rect.height));
            leaf.right = new Leaf(new RectInt(leaf.rect.x + splitPos, leaf.rect.y,
                                              leaf.rect.width - splitPos, leaf.rect.height));
        }

        // 크기가 maxLeafSize 넘으면 재귀 분할
        if (leaf.left.rect.width > maxLeafSize || leaf.left.rect.height > maxLeafSize)
            Split(leaf.left);
        if (leaf.right.rect.width > maxLeafSize || leaf.right.rect.height > maxLeafSize)
            Split(leaf.right);
    }

    private void CarveRooms(Leaf leaf, List<Leaf> leaves)
    {
        if (leaf.IsLeaf)
        {
            // 리프 내부에 패딩을 두고 방을 깎음 — 방끼리 인접하지 않게
            int w = Random.Range(leaf.rect.width / 2, leaf.rect.width - 2);
            int h = Random.Range(leaf.rect.height / 2, leaf.rect.height - 2);
            int x = leaf.rect.x + Random.Range(1, leaf.rect.width - w - 1);
            int y = leaf.rect.y + Random.Range(1, leaf.rect.height - h - 1);
            leaf.room = new RectInt(x, y, w, h);
            leaves.Add(leaf);
            return;
        }
        if (leaf.left != null)  CarveRooms(leaf.left, leaves);
        if (leaf.right != null) CarveRooms(leaf.right, leaves);
    }

    private List<Vector2Int> corridors = new();

    private void ConnectRooms(Leaf leaf)
    {
        if (leaf.IsLeaf) return;
        ConnectRooms(leaf.left);
        ConnectRooms(leaf.right);

        // 형제 노드의 방을 잇는다. 이 패턴이 dungeon이 항상 연결되도록 보장한다.
        var l = FindRoom(leaf.left);
        var r = FindRoom(leaf.right);
        if (l.HasValue && r.HasValue)
            CarveCorridor(l.Value.center, r.Value.center);
    }

    private RectInt? FindRoom(Leaf leaf)
    {
        if (leaf == null) return null;
        if (leaf.room.HasValue) return leaf.room;
        return FindRoom(leaf.left) ?? FindRoom(leaf.right);
    }

    private void CarveCorridor(Vector2 a, Vector2 b)
    {
        // L자 복도: 수평 먼저 → 수직 (또는 반대)
        int x1 = Mathf.RoundToInt(a.x), y1 = Mathf.RoundToInt(a.y);
        int x2 = Mathf.RoundToInt(b.x), y2 = Mathf.RoundToInt(b.y);
        if (Random.value < 0.5f)
        {
            for (int x = Mathf.Min(x1, x2); x <= Mathf.Max(x1, x2); x++) corridors.Add(new(x, y1));
            for (int y = Mathf.Min(y1, y2); y <= Mathf.Max(y1, y2); y++) corridors.Add(new(x2, y));
        }
        else
        {
            for (int y = Mathf.Min(y1, y2); y <= Mathf.Max(y1, y2); y++) corridors.Add(new(x1, y));
            for (int x = Mathf.Min(x1, x2); x <= Mathf.Max(x1, x2); x++) corridors.Add(new(x, y2));
        }
    }

    private void Paint()
    {
        // 1) 전체 벽으로 채움
        var bounds = new BoundsInt(0, 0, 0, width, height, 1);
        var fill = new TileBase[width * height];
        for (int i = 0; i < fill.Length; i++) fill[i] = wallTile;
        tilemap.SetTilesBlock(bounds, fill);

        // 2) 방·복도를 바닥 타일로 덮어쓰기
        // 작은 영역만 다시 그릴 때는 개별 SetTile이 더 직관적
        // 큰 일괄 영역은 SetTilesBlock 권장 (공식 문서: "more performant way as a batch")
    }
}
```

> 주의: 위 BSP 구현은 학습용 골격이다. 실제 프로덕션에서는 (a) 방 크기에 최소·최대를 함께 두고 (b) 통로 폭을 1보다 크게(2~3) 잡고 (c) **연결성을 BFS로 검증**해 끊긴 방이 없는지 사후 확인하는 단계를 추가한다.

---

## 7. Wave Function Collapse (WFC) — 개념 + Unity 연동 골격

> 원본(Maxim Gumin, 2016): https://github.com/mxgmn/WaveFunctionCollapse
> 원안(Paul Merrell, 2007 "Model Synthesis"): WFC는 Merrell 알고리즘에 *최저 엔트로피 휴리스틱*과 *이름*을 추가한 변형이다.

### 7-1. 핵심 단계 (공식 README 기준)

1. **Initialization** — 모든 셀에 모든 타일 가능성을 부여 (superposition)
2. **Observation** — *엔트로피가 가장 낮은(=가능성이 가장 적게 남은)* 셀을 골라 가중치 분포에 따라 한 타일로 붕괴(collapse)
3. **Propagation** — 그 셀의 결정이 인접 셀의 가능성에 미치는 제약을 전파 (AC-3 유사)
4. **Repeat** — 모든 셀이 결정될 때까지 2~3 반복. 모순 발생 시 재시작 또는 백트랙

### 7-2. Tilemap Mode vs Overlapping Mode

| 모드 | 입력 | 적합 사례 |
|------|------|----------|
| Tilemap | 타일 N개 + 인접성 규칙 명시 (E/N/W/S) | 디자이너가 직접 규칙을 정의하는 보드 퍼즐 |
| Overlapping | 예시 비트맵 1장 → NxN 패턴 추출 | "이 한 장 같은 느낌"으로 변주하는 자연 지형 |

### 7-3. Unity Tilemap에 끼우는 골격

```csharp
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Tilemaps;

[CreateAssetMenu(menuName = "PCG/WFC Tile Definition")]
public class WfcTileDefinition : ScriptableObject
{
    public TileBase tile;
    [Tooltip("North, East, South, West 방향으로 인접 가능한 타일 ID 마스크")]
    public string north, east, south, west;
    public float weight = 1f; // 가중치 — 자주 등장시키고 싶은 타일은 크게
}

public class WfcGenerator : MonoBehaviour
{
    [SerializeField] private Tilemap tilemap;
    [SerializeField] private WfcTileDefinition[] tileSet;
    [SerializeField] private int width = 30;
    [SerializeField] private int height = 30;
    [SerializeField] private int maxRetries = 10;

    // 각 셀 = 가능한 tileSet 인덱스의 집합
    private HashSet<int>[,] wave;

    public bool Generate(int seed)
    {
        for (int attempt = 0; attempt < maxRetries; attempt++)
        {
            Random.InitState(seed + attempt);
            if (TryCollapse()) { Paint(); return true; }
        }
        Debug.LogWarning("WFC failed after retries — 제약을 완화하거나 가중치를 조정하세요.");
        return false;
    }

    private bool TryCollapse()
    {
        InitializeWave();
        while (true)
        {
            var cell = FindLowestEntropy(); // 가능성 수가 가장 적은(>1) 셀
            if (cell == null) return true;   // 전부 결정 완료
            CollapseCell(cell.Value);
            if (!Propagate(cell.Value)) return false; // 모순 → 재시작
        }
    }

    // 실제 InitializeWave / FindLowestEntropy / CollapseCell / Propagate 구현은
    // mxgmn/WaveFunctionCollapse 또는 SunnyValleyStudio 튜토리얼 참고.
    private void InitializeWave() { /* ... */ }
    private Vector2Int? FindLowestEntropy() { return null; }
    private void CollapseCell(Vector2Int p) { /* 가중치 기반 랜덤 선택 */ }
    private bool Propagate(Vector2Int p) { return true; }

    private void Paint()
    {
        // 결정된 wave를 tilemap에 일괄 반영
    }
}
```

**Unity 연동 권장 레퍼런스:**
- 튜토리얼: https://github.com/SunnyValleyStudio/WaveFunctionCollapseUnityTilemapTutorial
- 데모: https://github.com/SardineFish/WFC-Demo

> 주의: WFC는 제약 조건이 모순될 때 **무한 재시도 루프**에 빠질 수 있다. 위 코드처럼 `maxRetries`를 반드시 둔다. 모순이 잦으면 (a) 인접성 규칙을 완화하거나 (b) 백트랙을 구현한다.

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

## 9. 성능 최적화 (모바일)

### 9-1. 메인 스레드 freeze 방지

> 공식 매뉴얼: 코루틴은 "operations to be split across frames"지만 *메인 스레드에서 실행*된다. yield 없이 무거운 루프를 돌리면 여전히 freeze된다.

```csharp
public IEnumerator GenerateAsync(int seed)
{
    Random.InitState(seed);
    const int budgetPerFrame = 500; // 프레임당 최대 처리 셀 수
    int processed = 0;

    for (int x = 0; x < width; x++)
    for (int y = 0; y < height; y++)
    {
        ComputeCell(x, y);
        processed++;
        if (processed >= budgetPerFrame)
        {
            processed = 0;
            yield return null; // 한 프레임 양보 — freeze 방지
        }
    }
    Paint();
}
```

**더 무거운 경우:** 코루틴으로도 부족하면 `Task.Run` 또는 `System.Threading.Thread`로 백그라운드 계산 → 결과만 메인 스레드에서 `SetTilesBlock`. **단, `Tilemap`·`Random` 등 UnityEngine API는 메인 스레드에서만 호출 가능**하다. 계산 결과 배열만 넘긴다.

### 9-2. 청크 기반 생성

무한 맵이나 큰 맵은 **카메라 주변 N×N 청크**만 생성·렌더링. 멀어진 청크는 데이터만 두고 Tilemap을 unload한다. (Tilemap을 청크별로 여러 개 분리하거나 `Tilemap.CompressBounds()` 활용)

### 9-3. 메모리

- `int[,]` 대신 `byte[]`나 `BitArray`로 셀 상태 표현 → 메모리 1/4~1/32
- `List<T>`를 매 프레임 new 하지 말고 pool로 재사용
- `Tilemap.RefreshAllTiles()`는 RuleTile이 많을 때 비싸다. 영역이 작으면 `RefreshTile(position)` 호출

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
