## 6. 해시

### 6-1. 데이터 해시 (SHA-2 / SHA-3)

```java
import java.security.MessageDigest;

public static byte[] sha256(byte[] data) throws Exception {
    MessageDigest md = MessageDigest.getInstance("SHA-256", "BC");
    return md.digest(data);
}

// BC 전용 SHA3 (JDK 내장도 가능하나 BC가 더 폭넓음)
public static byte[] sha3_256(byte[] data) throws Exception {
    MessageDigest md = MessageDigest.getInstance("SHA3-256", "BC");
    return md.digest(data);
}
```

제공 알고리즘: `SHA-256`, `SHA-384`, `SHA-512`, `SHA3-256`, `SHA3-512`, `Keccak-256`, `Blake2b-512`, `SM3` 등.

### 6-2. 비밀번호 해시는 별도

**`MessageDigest`로 비밀번호를 해시하지 마세요.** 비밀번호는 **느린 해시**(bcrypt / scrypt / Argon2 / PBKDF2)를 써야 합니다.

```java
// OpenBSDBCrypt (BouncyCastle 제공)
import org.bouncycastle.crypto.generators.OpenBSDBCrypt;

String hashed = OpenBSDBCrypt.generate(password.toCharArray(), salt16bytes, 12);
boolean ok = OpenBSDBCrypt.checkPassword(hashed, password.toCharArray());
```

> 주의: BouncyCastle 1.65~1.66의 `OpenBSDBCrypt.checkPassword`는 CVE-2020-28052(비교 오류) 영향 버전입니다. 1.67+ 필수. Argon2는 `org.bouncycastle.crypto.generators.Argon2BytesGenerator` 사용.

---

## 7. PEM 인코딩/디코딩

### 7-1. 개인키 읽기

```java
import org.bouncycastle.openssl.PEMKeyPair;
import org.bouncycastle.openssl.PEMParser;
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter;
import java.io.FileReader;
import java.security.KeyPair;

public static KeyPair readPrivateKey(String path) throws Exception {
    try (PEMParser parser = new PEMParser(new FileReader(path))) {
        Object obj = parser.readObject();
        JcaPEMKeyConverter conv = new JcaPEMKeyConverter().setProvider("BC");

        if (obj instanceof PEMKeyPair) {
            return conv.getKeyPair((PEMKeyPair) obj);
        } else if (obj instanceof org.bouncycastle.asn1.pkcs.PrivateKeyInfo) {
            // PKCS#8 형식
            return new KeyPair(null,
                    conv.getPrivateKey((org.bouncycastle.asn1.pkcs.PrivateKeyInfo) obj));
        }
        throw new IllegalStateException("Unknown PEM type: " + obj.getClass());
    }
}
```

### 7-2. 공개키 읽기

```java
import org.bouncycastle.asn1.x509.SubjectPublicKeyInfo;

public static PublicKey readPublicKey(String path) throws Exception {
    try (PEMParser parser = new PEMParser(new FileReader(path))) {
        SubjectPublicKeyInfo info = (SubjectPublicKeyInfo) parser.readObject();
        return new JcaPEMKeyConverter().setProvider("BC").getPublicKey(info);
    }
}
```

### 7-3. PEM 쓰기

```java
import org.bouncycastle.openssl.jcajce.JcaPEMWriter;
import java.io.FileWriter;

public static void writePem(Object keyOrCert, String path) throws Exception {
    try (JcaPEMWriter w = new JcaPEMWriter(new FileWriter(path))) {
        w.writeObject(keyOrCert);   // PrivateKey, PublicKey, X509Certificate 모두 지원
    }
}
```

---

## 8. X.509 인증서 처리

### 8-1. PEM 인증서 파싱

```java
import org.bouncycastle.cert.X509CertificateHolder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import java.security.cert.X509Certificate;

public static X509Certificate readCertificate(String path) throws Exception {
    try (PEMParser parser = new PEMParser(new FileReader(path))) {
        X509CertificateHolder holder = (X509CertificateHolder) parser.readObject();
        return new JcaX509CertificateConverter().setProvider("BC").getCertificate(holder);
    }
}
```

### 8-2. 인증서 체인 검증 (기본)

```java
import java.security.cert.*;
import java.util.*;

public static boolean verifyChain(List<X509Certificate> chain,
                                   Set<TrustAnchor> trustAnchors) throws Exception {
    CertPathValidator validator = CertPathValidator.getInstance("PKIX", "BC");
    CertificateFactory cf = CertificateFactory.getInstance("X.509", "BC");
    CertPath path = cf.generateCertPath(chain);

    PKIXParameters params = new PKIXParameters(trustAnchors);
    params.setRevocationEnabled(false);   // 실제 운영은 OCSP/CRL 활성화 권장

    try {
        validator.validate(path, params);
        return true;
    } catch (CertPathValidatorException e) {
        return false;
    }
}
```

---

## 9. KISA 표준 암호화 (SEED, ARIA)

한국 공공·금융 시스템에서 자주 요구되는 알고리즘. BouncyCastle이 네이티브 지원합니다.

> **ARIA 우선 권장 근거 (신규 구현):**
> - ARIA는 128/192/**256**비트 키 옵션 제공 → 장기 보안 마진 확보. SEED는 **128비트 고정** (RFC 4269 표준에 128만 정의되어 있어 키 확장 불가).
> - ARIA는 **GCM(AEAD)** 모드로 암호화 + 무결성을 한 번에 보장 가능. SEED를 CBC로만 쓰면 Encrypt-then-MAC(HMAC-SHA256)을 별도 구성해야 함.
> - 레거시 시스템 상호운용(기존 DB 컬럼, 외부 기관 규격)이 강제될 때만 SEED 선택.

### 9-1. SEED (RFC 4269)

```java
// SEED는 128비트 블록, 128비트 키 (고정)
KeyGenerator kg = KeyGenerator.getInstance("SEED", "BC");
kg.init(128);
SecretKey key = kg.generateKey();

Cipher cipher = Cipher.getInstance("SEED/CBC/PKCS7Padding", "BC");
cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(iv16));
byte[] ct = cipher.doFinal(plaintext);
```

지원 모드(BC 공식): ECB, CBC(+PKCS#7/ISO7816-4 패딩), CFB, OFB, CTR, GCM, CCM, EAX, OCB.

### 9-2. ARIA (RFC 5794)

```java
// ARIA는 128비트 블록, 키는 128/192/256비트
KeyGenerator kg = KeyGenerator.getInstance("ARIA", "BC");
kg.init(256);
SecretKey key = kg.generateKey();

Cipher cipher = Cipher.getInstance("ARIA/GCM/NoPadding", "BC");
cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv12));
byte[] ct = cipher.doFinal(plaintext);
```

> 주의: SEED/ARIA를 CBC 모드로만 쓰는 레거시 시스템이 많지만, BC는 GCM도 지원합니다. 신규 구현이면 GCM 권장.

### 9-3. LEA (경량 블록 암호)

KISA가 경량 IoT용으로 표준화한 블록 암호. BC 1.73+에서 지원:

```java
KeyGenerator kg = KeyGenerator.getInstance("LEA", "BC");
kg.init(128);
// Cipher.getInstance("LEA/CBC/PKCS7Padding", "BC") 등
```

---

## 10. 키 저장 (Keystore)

### 10-1. PKCS#12 (권장)

```java
import java.security.KeyStore;
import java.io.FileOutputStream;
import java.io.FileInputStream;

public static void savePkcs12(KeyPair kp, X509Certificate cert,
                               String path, char[] password) throws Exception {
    KeyStore ks = KeyStore.getInstance("PKCS12", "BC");
    ks.load(null, null);   // 신규 생성
    ks.setKeyEntry("alias", kp.getPrivate(), password,
                    new X509Certificate[]{cert});
    try (FileOutputStream fos = new FileOutputStream(path)) {
        ks.store(fos, password);
    }
}

public static KeyStore loadPkcs12(String path, char[] password) throws Exception {
    KeyStore ks = KeyStore.getInstance("PKCS12", "BC");
    try (FileInputStream fis = new FileInputStream(path)) {
        ks.load(fis, password);
    }
    return ks;
}
```

### 10-2. JKS는 사용하지 말 것

Oracle은 Java 9부터 **기본 keystore 타입을 PKCS#12로 전환**했고, JKS는 독점 포맷입니다. 신규 프로젝트는 PKCS#12 사용.

### 10-3. BC 전용 keystore 타입

- `"BKS"`: BouncyCastle 독점 포맷 (안드로이드 레거시 등)
- `"UBER"`: 더 강한 암호화를 적용한 BC 포맷

BC 1.71+에서 기본 `PKCS12`도 BC provider를 통해 로드 가능. BC 1.69는 Java 17에서 "pad block corrupted" 에러가 발생하는 버그가 있었으므로 1.70+ 사용 권장.

---

## 11. Spring Boot 통합 요약

### 11-1. 의존성 (Spring Boot 3.x)

```xml
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcprov-jdk18on</artifactId>
    <version>1.78.1</version>
</dependency>
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcpkix-jdk18on</artifactId>
    <version>1.78.1</version>
</dependency>
```

### 11-2. Provider 등록 + 암호화 서비스

```java
@Configuration
public class CryptoConfig {

    @PostConstruct
    public void init() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    @Bean
    public AesGcmService aesGcmService(
            @Value("${app.crypto.aes-key-base64}") String base64Key) {
        byte[] raw = Base64.getDecoder().decode(base64Key);
        SecretKey key = new SecretKeySpec(raw, "AES");
        return new AesGcmService(key);
    }
}

@Service
@RequiredArgsConstructor
public class AesGcmService {
    private final SecretKey key;

    public String encryptToBase64(String plaintext) throws Exception {
        byte[] out = AesGcmCrypto.encrypt(key, plaintext.getBytes(StandardCharsets.UTF_8), null);
        return Base64.getEncoder().encodeToString(out);
    }

    public String decryptFromBase64(String b64) throws Exception {
        byte[] in = Base64.getDecoder().decode(b64);
        return new String(AesGcmCrypto.decrypt(key, in, null), StandardCharsets.UTF_8);
    }
}
```

### 11-3. 설정값

```yaml
# application.yml
app:
  crypto:
    aes-key-base64: ${AES_KEY_BASE64}   # 환경변수에서 주입 (코드에 키 직접 작성 금지)
```

> 주의: 운영 환경에서 키는 **HashiCorp Vault, AWS KMS, Azure Key Vault** 등 시크릿 매니저를 거쳐 주입하는 것이 이상적입니다. `application.yml`에 평문 또는 환경변수로만 두지 마세요.

---

## 12. 자주 하는 실수

| 실수 | 수정 |
|------|------|
| AES-ECB 사용 | GCM(권장) 또는 CBC+HMAC로 전환 |
| AES-GCM IV 재사용 | IV는 매 암호화마다 `SecureRandom`으로 새로 생성 |
| GCM IV 길이 16바이트 설정 | **12바이트(96비트)** 로 설정 (스펙 최적값) |
| RSA PKCS#1 v1.5 신규 사용 | OAEP(`RSA/NONE/OAEPWithSHA-256AndMGF1Padding`)로 교체 |
| OAEP 해시와 MGF1 해시 불일치 | 양쪽 모두 SHA-256(또는 같은 해시)로 통일 |
| `jdk15on` 신규 의존성 | `jdk18on`(Java 8+) 또는 `jdk15to18`(Java 5~8 호환) 사용 |
| Provider 이름 `"BC"` vs `"BCFIPS"` 혼동 | FIPS 모드는 `bc-fips` 별도 아티팩트, provider 이름도 `"BCFIPS"` |
| JKS keystore 사용 | PKCS#12로 전환 |
| 비밀번호를 `MessageDigest`로 해시 | bcrypt / Argon2 / PBKDF2 사용 |
| 키 길이 1024비트 RSA | 2048비트 이상 |
| CBC 모드 MAC 없이 사용 (패딩 오라클) | Encrypt-then-MAC 또는 GCM으로 전환 |
| `application.yml`에 키 평문 저장 | 환경변수 + Vault/KMS |
| 같은 키로 2^32개 이상 메시지 AES-GCM 랜덤 IV | 키 로테이션 또는 AES-GCM-SIV |
| `javax.annotation.PostConstruct`(Spring Boot 3) | `jakarta.annotation.PostConstruct` |
| BC 1.65~1.66 OpenBSDBCrypt 사용 | 1.67+ 업그레이드 (CVE-2020-28052) |
| BC 1.70 이하 PEMParser로 외부 PEM 파싱 | 1.73+ (CVE-2023-33202 DoS) |
| BC 1.73 이하 LDAP CertStore 사용 | 1.74+ (CVE-2023-33201 LDAP injection) |

---

## 13. 알고리즘 선택 가이드 (요약)

| 용도 | 권장 | 대체 | 금지 |
|------|------|------|------|
| 대칭 암호화 (기밀성+무결성) | AES-256-GCM | ChaCha20-Poly1305 | AES-ECB, 순수 AES-CBC |
| 공개키 암호화 | RSA-OAEP-SHA256 / ECIES | — | RSA PKCS#1 v1.5 |
| 서명 | Ed25519, ECDSA (P-256/P-384), RSA-PSS | SHA256withRSA | SHA1withRSA, MD5 |
| 키 교환 | ECDH (X25519, P-256) | DH 2048+ | 작은 DH 그룹 |
| 해시 | SHA-256, SHA-384, SHA-3 | Blake2b | MD5, SHA-1 |
| 비밀번호 해시 | Argon2id, bcrypt | scrypt, PBKDF2 | MD5/SHA-* 단일 라운드 |
| 한국 표준 요구 | ARIA-256-GCM, SEED-CBC+HMAC | LEA | SEED-ECB |
| Keystore | PKCS#12 | BKS(레거시) | JKS |
