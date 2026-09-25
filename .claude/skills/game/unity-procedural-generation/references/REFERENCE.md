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
