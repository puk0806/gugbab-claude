---
name: unity-save-system
description: >
  Unity 2D 모바일 게임의 저장 시스템 구축 가이드. PlayerPrefs·JSON+File I/O·AES 암호화·Unity Cloud Save(UGS)를 데이터 유형별로 선택하고, 마이그레이션·백업·비동기 저장·구매 영수증 검증을 안전하게 처리한다.
  <example>사용자: "Unity에서 게임 진행도를 안전하게 저장하려면 어떻게 해야 해? 치팅 막고 싶어."</example>
  <example>사용자: "PlayerPrefs랑 JSON 파일 저장 중에 뭘 써야 해? 디바이스 교체할 때 데이터 복원도 필요해."</example>
  <example>사용자: "세이브 파일 버전이 바뀌었을 때 옛날 세이브를 어떻게 마이그레이션하지?"</example>
---

# Unity 2D 모바일 게임 저장 시스템

> 소스:
> - PlayerPrefs: https://docs.unity3d.com/ScriptReference/PlayerPrefs.html
> - Application.persistentDataPath: https://docs.unity3d.com/ScriptReference/Application-persistentDataPath.html
> - Newtonsoft.Json (com.unity.nuget.newtonsoft-json): https://docs.unity3d.com/Packages/com.unity.nuget.newtonsoft-json@2.0/manual/index.html
> - Cloud Save (UGS): https://docs.unity.com/ugs/manual/cloud-save/manual/get-started
> - Cloud Save SDK API: https://docs.unity.com/ugs/en-us/packages/com.unity.services.cloudsave/3.2/api/Unity.Services.CloudSave.Internal.IDataService
> - IAP Receipt Validation: https://docs.unity3d.com/Manual/UnityIAPValidatingReceipts.html
>
> 검증일: 2026-06-10
> 대상 버전: Unity 6 (6000.x) / Cloud Save SDK 3.2 / Newtonsoft Json 3.2 (com.unity.nuget.newtonsoft-json) / IAP 4.x

---

## 1. 저장 계층 선택 결정 트리

데이터 유형에 따라 저장 방식이 달라진다. 하나로 통일하지 말 것.

| 데이터 유형 | 권장 저장소 | 이유 |
|------------|-----------|------|
| 볼륨·언어·해상도 등 설정값 | PlayerPrefs | 치팅돼도 무해, 단순 key/value면 충분 |
| 첫 실행 여부·튜토리얼 완료 플래그 | PlayerPrefs | 1bit 정도 데이터 |
| 게임 진행도(스테이지·캐릭터 레벨) | JSON + File I/O + AES | 치팅 방어 필요, 구조가 복잡 |
| 디바이스 교체 시 복원 필요한 데이터 | Unity Cloud Save (+ 로컬 캐시) | 서버 권위(server-authoritative) 필요 |
| 인앱 구매 내역(IAP) | 서버 검증 + 로컬 캐시 | 절대 클라이언트 단독 신뢰 금지 |
| 랭킹·재화 등 부정 사용 위험 큰 데이터 | 서버(Cloud Save / Cloud Code) | 클라이언트는 표시용 캐시만 |

```
[저장할 데이터 발생]
        ↓
민감/치팅 위험? ─── No ──→ PlayerPrefs
        │
       Yes
        ↓
디바이스 교체 시 복원 필요? ─── No ──→ JSON + AES (로컬)
        │
       Yes
        ↓
실시간 동기화 필요? ─── No ──→ Cloud Save (수동 동기화 + 로컬 캐시)
        │
       Yes
        ↓
Cloud Save + Cloud Code(서버 권위) + 로컬 캐시
```

---

## 2. PlayerPrefs — 간단 설정 저장만

### 적용 범위
설정값(볼륨, 언어, 화질) · 최초 실행 플래그 등 **치팅되어도 무해한 데이터**에만 사용한다.

### 지원 타입
`int`, `float`, `string` 3가지만 지원. 그 외(bool, Vector3 등)는 변환해서 저장한다.

```csharp
public static class Settings
{
    private const string KEY_BGM_VOLUME = "settings.bgm_volume";
    private const string KEY_LANGUAGE   = "settings.language";
    private const string KEY_FIRST_RUN  = "app.first_run"; // bool 대용

    public static float BgmVolume
    {
        get => PlayerPrefs.GetFloat(KEY_BGM_VOLUME, 1f);
        set { PlayerPrefs.SetFloat(KEY_BGM_VOLUME, Mathf.Clamp01(value)); PlayerPrefs.Save(); }
    }

    public static string Language
    {
        get => PlayerPrefs.GetString(KEY_LANGUAGE, "ko");
        set { PlayerPrefs.SetString(KEY_LANGUAGE, value); PlayerPrefs.Save(); }
    }

    public static bool IsFirstRun
    {
        // PlayerPrefs는 bool 미지원 → int 0/1로 인코딩
        get => PlayerPrefs.GetInt(KEY_FIRST_RUN, 1) == 1;
        set { PlayerPrefs.SetInt(KEY_FIRST_RUN, value ? 1 : 0); PlayerPrefs.Save(); }
    }
}
```

### 플랫폼별 저장 위치 (공식 문서 기준)

| 플랫폼 | 저장 위치 |
|--------|----------|
| Android | `/data/data/<pkg>/shared_prefs/<pkg>.v2.playerprefs.xml` |
| iOS | NSUserDefaults |
| Windows | 레지스트리 `HKCU\Software\<company>\<product>` |
| macOS | `~/Library/Preferences/...plist` |
| WebGL | IndexedDB (~1MB 한도) |

### 보안 한계
- **암호화 없음** — 평문 저장이라 사용자가 쉽게 수정 가능.
- 진행도, 재화, 점수 등 게임 핵심 데이터는 PlayerPrefs에 절대 저장하지 말 것.
- `PlayerPrefs.Save()`는 일반적으로 OnApplicationQuit에서 자동 호출되지만, 모바일에서 강제 종료/크래시 시 누락될 수 있으므로 변경 직후 명시 호출 권장.

> 주의: PlayerPrefs는 키-값 개수·길이 한도가 플랫폼에 따라 다르므로 (특히 WebGL 1MB) 대량 데이터 저장에 사용하지 말 것.

---

## 3. JSON + File I/O — 게임 진행도 저장의 기본

### 직렬화 옵션 비교

| 라이브러리 | 패키지 | 장점 | 한계 |
|-----------|-------|------|------|
| `JsonUtility` | Unity 내장 | 빠르고 가벼움, 별도 의존성 없음 | public 필드만, Dictionary 미지원, polymorphism 미지원, 중첩 깊이 제한 |
| `Newtonsoft.Json` | `com.unity.nuget.newtonsoft-json` (v3.2 기준) | Dictionary·Property·polymorphism 지원, IL2CPP 호환 | 패키지 추가 필요, 첫 직렬화 시 reflection 비용 |

**권장:** 단순 구조(필드만 있고 List/배열 정도)는 `JsonUtility`, Dictionary·상속·런타임 타입이 필요하면 `com.unity.nuget.newtonsoft-json`.

### Application.persistentDataPath
모든 플랫폼에서 **앱 업데이트 후에도 보존되는** 유일한 쓰기 가능 위치. 세이브는 반드시 여기에 둔다.

> 주의: `Application.dataPath`, `Application.streamingAssetsPath`는 빌드에서 **읽기 전용**이므로 쓰기 시 플랫폼에 따라 무음 실패 또는 예외가 발생한다.

### SaveData 클래스 설계

```csharp
[System.Serializable]
public class SaveData
{
    public int saveVersion = CURRENT_VERSION; // 마이그레이션용
    public string savedAtIso;                 // ISO8601, UTC
    public int    stage;
    public int    coins;
    public List<string> unlockedCharacters = new();
    // 새 필드는 항상 sensible default를 줘서 구버전 세이브도 로드 가능하게

    public const int CURRENT_VERSION = 2;
}
```

### 비동기 저장 (메인 스레드 블로킹 방지)

```csharp
using System.IO;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;

public static class SaveIO
{
    private static string SaveDir => Application.persistentDataPath;
    private static string Path(string slot) => System.IO.Path.Combine(SaveDir, $"{slot}.save");
    private static string Tmp(string slot)  => Path(slot) + ".tmp";
    private static string Bak(string slot)  => Path(slot) + ".bak";

    /// <summary>
    /// 백업 → temp 쓰기 → atomic rename 패턴.
    /// 쓰기 도중 크래시 나도 원본 세이브는 보호된다.
    /// </summary>
    public static async Task WriteJsonAsync(string slot, string json)
    {
        var path = Path(slot);
        var tmp  = Tmp(slot);
        var bak  = Bak(slot);

        // 1) temp에 비동기 쓰기 — 메인 스레드 블로킹 방지
        var bytes = Encoding.UTF8.GetBytes(json);
        using (var fs = new FileStream(tmp, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true))
        {
            await fs.WriteAsync(bytes, 0, bytes.Length);
            await fs.FlushAsync();
        }

        // 2) 기존 세이브를 .bak으로 복사 (있는 경우만)
        if (File.Exists(path))
            File.Copy(path, bak, overwrite: true);

        // 3) atomic rename — 대부분 OS에서 원자적
        File.Move(tmp, path, overwrite: true);
    }

    public static async Task<string?> ReadJsonAsync(string slot)
    {
        var path = Path(slot);
        var bak  = Bak(slot);

        // 원본이 없거나 손상되었으면 백업 사용
        if (!File.Exists(path))
        {
            if (!File.Exists(bak)) return null;
            path = bak;
        }

        using var fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, useAsync: true);
        var buf = new byte[fs.Length];
        await fs.ReadAsync(buf, 0, buf.Length);
        return Encoding.UTF8.GetString(buf);
    }
}
```

### 사용 예 (JsonUtility 기준)

```csharp
public static class SaveService
{
    public static async Task SaveAsync(SaveData data)
    {
        data.savedAtIso = System.DateTime.UtcNow.ToString("o");
        var json = JsonUtility.ToJson(data, prettyPrint: false);
        await SaveIO.WriteJsonAsync("slot0", json);
    }

    public static async Task<SaveData> LoadAsync()
    {
        var json = await SaveIO.ReadJsonAsync("slot0");
        if (string.IsNullOrEmpty(json)) return new SaveData();

        var data = JsonUtility.FromJson<SaveData>(json) ?? new SaveData();
        return SaveMigrator.Migrate(data);
    }
}
```

> 주의: `JsonUtility`는 **public 필드만 직렬화**한다. 프로퍼티(`{ get; set; }`)나 private 필드는 무시되거나 `[SerializeField]` 표기가 필요하다.

---

## 4. AES 암호화 — 로컬 세이브 치팅 방어

### 핵심 패턴
- `System.Security.Cryptography.Aes` 사용 (IL2CPP에서도 동작 확인됨)
- IV(Initialization Vector)는 **저장할 때마다 새로 생성**해서 암호문 앞부분에 평문으로 prepend
- 키는 **앱에 하드코딩하지 말고** PBKDF2(`Rfc2898DeriveBytes`)로 유도하거나 OS 키체인 활용

```csharp
using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

public static class SaveCrypto
{
    // 실제 프로젝트에서는 빌드 시 주입, 또는 Cloud Code에서 받기
    private const string PASSPHRASE = "REPLACE_WITH_BUILD_INJECTED_VALUE";
    private static readonly byte[] Salt = Encoding.UTF8.GetBytes("game.save.salt.v1");

    private static byte[] DeriveKey()
    {
        // PBKDF2: 추측 공격 방어
        using var kdf = new Rfc2898DeriveBytes(PASSPHRASE, Salt, 100_000, HashAlgorithmName.SHA256);
        return kdf.GetBytes(32); // AES-256
    }

    public static async Task EncryptToFileAsync(string path, string plaintext)
    {
        using var aes = Aes.Create();
        aes.Key = DeriveKey();
        aes.GenerateIV(); // 매번 새 IV

        using var fs = new FileStream(path, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true);
        // IV(16바이트)를 평문으로 먼저 기록
        await fs.WriteAsync(aes.IV, 0, aes.IV.Length);

        using var crypto = new CryptoStream(fs, aes.CreateEncryptor(), CryptoStreamMode.Write, leaveOpen: true);
        var bytes = Encoding.UTF8.GetBytes(plaintext);
        await crypto.WriteAsync(bytes, 0, bytes.Length);
    }

    public static async Task<string> DecryptFromFileAsync(string path)
    {
        using var fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, useAsync: true);
        var iv = new byte[16];
        await fs.ReadAsync(iv, 0, 16);

        using var aes = Aes.Create();
        aes.Key = DeriveKey();
        aes.IV  = iv;

        using var crypto = new CryptoStream(fs, aes.CreateDecryptor(), CryptoStreamMode.Read);
        using var reader = new StreamReader(crypto, Encoding.UTF8);
        return await reader.ReadToEndAsync();
    }
}
```

### IL2CPP 호환성
- `System.Security.Cryptography.Aes`, `Rfc2898DeriveBytes`는 IL2CPP에서 정상 동작한다.
- 단, 일부 모듈(예: `RandomNumberGenerator`의 일부 OS-specific 구현)은 플랫폼별 차이가 있으므로 **실기기 빌드 테스트 필수**.
- IL2CPP는 Mono 대비 리버스 엔지니어링이 어려워 보안에 유리하다.

### 게임에 적용
3절의 `SaveIO.WriteJsonAsync` 대신 `SaveCrypto.EncryptToFileAsync` + temp/.bak 패턴을 결합한다.

> 주의: 일부 앱스토어(iOS 등)는 암호화 사용 시 **수출 규정(export compliance)** 신고가 필요할 수 있다. AES만 사용해도 표준 알고리즘이므로 면제 항목에 해당하는 경우가 많지만 출시 전 확인 필요.

---

## 5. Unity Cloud Save (UGS) — 디바이스 교체 복원

### 설치 패키지
- `com.unity.services.cloudsave` (3.2 기준)
- `com.unity.services.authentication` (자동 의존성)

### 초기화 (Awake에서 1회)

```csharp
using Unity.Services.Core;
using Unity.Services.Authentication;
using Unity.Services.CloudSave;

private async void Awake()
{
    await UnityServices.InitializeAsync();

    if (!AuthenticationService.Instance.IsSignedIn)
    {
        // 익명 로그인 → 동일 디바이스에서 동일 playerId 발급
        await AuthenticationService.Instance.SignInAnonymouslyAsync();
    }
}
```

### 데이터 저장/로드

```csharp
public static class CloudSync
{
    public static async Task PushAsync(SaveData data)
    {
        var payload = new Dictionary<string, object>
        {
            { "save", JsonUtility.ToJson(data) },
            { "saveVersion", data.saveVersion },
            { "savedAtIso", data.savedAtIso },
        };
        await CloudSaveService.Instance.Data.Player.SaveAsync(payload);
    }

    public static async Task<SaveData?> PullAsync()
    {
        var result = await CloudSaveService.Instance.Data.Player.LoadAsync(
            new HashSet<string> { "save", "saveVersion", "savedAtIso" });

        if (!result.TryGetValue("save", out var item)) return null;

        var json = item.Value.GetAs<string>();
        var data = JsonUtility.FromJson<SaveData>(json);
        return SaveMigrator.Migrate(data);
    }
}
```

### 디바이스 교체 시 복원 흐름

1. 새 디바이스에서 익명 로그인 → 새 playerId 발급(이전 디바이스와 다름)
2. 계정 연동(Google/Apple Sign-In 등)으로 **기존 playerId 회수**
3. `CloudSaveService.Instance.Data.Player.LoadAllAsync()` 로 클라우드 데이터 가져오기
4. 로컬 세이브와 비교(`savedAtIso` 기준)해서 최신 채택

### 충돌 처리 (write lock)
Cloud Save 3.x의 `Item`은 write lock·생성/수정 시각 메타데이터를 포함한다. 동시 저장 시 lock 기반 충돌 감지 가능.

### 로컬 + 클라우드 하이브리드 패턴
```
저장: 로컬(AES JSON) 즉시 → 백그라운드로 Cloud Save Push
로드: 앱 시작 시 로컬 먼저 표시 → 비동기로 Cloud Pull → 최신이면 교체
```
로컬 캐시를 두면 **오프라인에서도 플레이 가능**하고, 서버 의존도가 낮아진다.

> 주의: Cloud Save SDK의 정확한 시그니처는 메이저 버전 사이에 바뀐 적이 있다(2.x → 3.x: `Item` wrapper 도입). 패키지 업그레이드 시 changelog 확인 필수.

---

## 6. 저장 데이터 마이그레이션

세이브 스키마는 시간이 지나면 반드시 바뀐다. **버전 필드 + 순차 마이그레이션**이 표준 패턴.

```csharp
public static class SaveMigrator
{
    public static SaveData Migrate(SaveData data)
    {
        if (data == null) return new SaveData();

        // 각 단계는 "한 버전 → 다음 버전"만 책임
        if (data.saveVersion < 1) data = MigrateFrom0To1(data);
        if (data.saveVersion < 2) data = MigrateFrom1To2(data);
        // 미래 마이그레이션은 여기 추가

        return data;
    }

    private static SaveData MigrateFrom0To1(SaveData d)
    {
        // 예) coins 필드가 없던 v0 → v1
        if (d.coins < 0) d.coins = 0;
        d.saveVersion = 1;
        return d;
    }

    private static SaveData MigrateFrom1To2(SaveData d)
    {
        // 예) unlockedCharacters가 없던 v1 → v2
        d.unlockedCharacters ??= new List<string> { "default" };
        d.saveVersion = 2;
        return d;
    }
}
```

### 핵심 규칙
- 새 필드는 **항상 sensible default**를 클래스 선언에서 지정(`= new()`, `= 0` 등)
- 마이그레이션 함수는 **항상 한 단계씩**: v0 → v3 같은 점프 금지(중간 단계 누락 위험)
- 마이그레이션 후 **즉시 한 번 저장**해서 다음 실행은 빠르게
- 절대 **기존 필드 이름 변경/삭제** 하지 말 것 — 대신 새 필드 추가 + 마이그레이션
- `saveVersion`은 미래 호환 위해 `int` 권장 (string `"1.0"` 비교 어려움)

---

## 7. 인앱 구매(IAP) 연계 — 서버 검증 + 로컬 캐시

### 원칙
- **클라이언트 단독으로 영수증을 신뢰하지 말 것**: 서버 검증 결과만 권위 데이터.
- 서버 검증 실패 시(네트워크 단절·일시적 장애)는 **로컬 캐시로 일시 허용**, 백그라운드 재검증.

### 검증 흐름

```
[구매 완료]
  ↓
영수증 수신 (Apple/Google)
  ↓
서버에 전송 → 서버가 Apple/Google에 직접 검증
  ↓
검증 성공 → 서버 DB에 entitlement 기록 + 클라이언트에 결과 반환
                    ↓
                    클라이언트는 결과를 AES 암호화된 로컬 캐시에 저장
```

### 오프라인 일시 허용 패턴

```csharp
public static class EntitlementCache
{
    [System.Serializable]
    public class CachedEntitlement
    {
        public string productId;
        public string serverVerifiedAtIso; // 마지막 서버 검증 시각
        public int    graceSeconds = 60 * 60 * 24 * 7; // 7일 유예
    }

    public static bool IsValidOffline(CachedEntitlement c)
    {
        if (c == null) return false;
        var verifiedAt = System.DateTime.Parse(c.serverVerifiedAtIso, null,
            System.Globalization.DateTimeStyles.RoundtripKind);
        return (System.DateTime.UtcNow - verifiedAt).TotalSeconds < c.graceSeconds;
    }
}
```

- **소비성 아이템**(코인 충전 등)은 서버 검증 후 재화를 서버에 적립. 로컬은 표시용.
- **비소비성 아이템**(광고 제거, DLC 등)은 entitlement를 Cloud Save에 저장 → 디바이스 교체 시 자동 복원.
- 영수증과 entitlement는 **별도 키 네임스페이스**로 저장: `iap.receipt.<productId>`, `iap.entitlement.<productId>`.

> 주의: Unity IAP는 **서버 측 원격 검증을 자체 제공하지 않는다**. 자체 서버 또는 third-party 솔루션이 필요하다.

---

## 8. 흔한 실수 8종

| # | 안티패턴 | 올바른 패턴 |
|---|---------|-----------|
| 1 | PlayerPrefs에 게임 진행도·재화·점수를 평문 저장 | JSON+AES, 또는 Cloud Save 사용 |
| 2 | `JsonUtility`로 Dictionary 직렬화 시도 | Newtonsoft.Json(`com.unity.nuget.newtonsoft-json`)로 전환 |
| 3 | 세이브 파일을 `Application.dataPath` 또는 StreamingAssets에 쓰기 | 반드시 `Application.persistentDataPath` |
| 4 | `File.WriteAllText(path, json)` 직접 호출(원자성 없음) | temp → atomic rename + .bak 백업 패턴 |
| 5 | 메인 스레드에서 동기 IO/암호화 → 프레임 드랍 | `FileStream(useAsync: true)` + `await`, 큰 데이터는 `Task.Run` |
| 6 | AES 키를 코드에 평문 상수로 하드코딩 | 빌드 시 주입 + PBKDF2 키 유도, 가능하면 Cloud Code에서 발급 |
| 7 | `saveVersion` 필드 없이 스키마 변경 → 구버전 세이브 깨짐 | 항상 `saveVersion` 포함, 순차 마이그레이션 함수 작성 |
| 8 | IAP 영수증을 클라이언트에서만 검증하고 entitlement 부여 | 서버 검증 결과만 권위, 로컬은 캐시 + grace period |

### 추가 주의 (모바일 특화)
- Android는 사용자가 앱 설정에서 데이터를 **수동으로 지울 수 있다** → persistentDataPath도 사라짐. 중요 데이터는 Cloud Save로 백업.
- iOS persistentDataPath는 **iCloud 백업 대상**에 포함된다 (Library/Application Support 하위). 백업 제외 필요시 NSURLIsExcludedFromBackupKey 설정.
- 모바일은 **OS가 앱을 강제 종료**할 수 있으므로 중요 상태 변경 시점에 즉시 저장(자동 저장 주기 + 이벤트 기반 저장 병행).

---

## 9. 통합 체크리스트 — 새 프로젝트 시작 시

- [ ] 설정값은 PlayerPrefs로만 (그 외는 PlayerPrefs 금지)
- [ ] `SaveData` 클래스에 `saveVersion` 필드 포함
- [ ] 모든 디스크 IO는 `Application.persistentDataPath` 하위
- [ ] 저장은 temp → rename + .bak 백업 패턴 + `useAsync: true`
- [ ] 진행도/재화 등 민감 데이터는 AES 암호화
- [ ] 디바이스 교체 복원이 필요하면 Cloud Save 통합 (로컬 캐시 + 백그라운드 sync)
- [ ] 마이그레이션 함수는 한 버전씩 순차로 작성
- [ ] IAP는 서버 검증 결과만 권위, 로컬은 grace period 캐시
- [ ] 실기기 빌드(IL2CPP)에서 암호화·세이브 동작 검증
- [ ] Android 데이터 삭제·iOS 백업/복원 시나리오 실제 테스트
