## 4. AES 암호화 — 전체 구현

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

---

## 5. Unity Cloud Save (UGS) — 초기화·저장/로드 전체 구현

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

---

## 7. IAP 오프라인 일시 허용 패턴 — 전체 구현

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
