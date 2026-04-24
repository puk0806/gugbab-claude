---
name: bouncycastle-crypto
description: BouncyCastle 암호화 - 의존성(jdk15on vs jdk18on), Provider 등록, AES-GCM/CBC, RSA-OAEP, 서명, 해시, PEM/X.509, KISA SEED/ARIA, PKCS#12, Spring Boot 통합, 흔한 실수
---

# BouncyCastle 암호화 스킬

> 소스: https://www.bouncycastle.org/ | https://github.com/bcgit/bc-java | https://downloads.bouncycastle.org/java/docs/bcprov-jdk18on-javadoc/ | https://mvnrepository.com/artifact/org.bouncycastle
> 검증일: 2026-04-23

> 주의: 이 문서는 두 가지 라인을 모두 다룹니다 — **레거시** `bcprov-jdk15on:1.64` (2019-11 릴리스, Java 8+ / Spring Boot 2.5 대응)와 **최신** `bcprov-jdk18on:1.78.x` 이상 (Java 8+, Spring Boot 3.x 권장). 2026년 4월 기준 BC의 최신 안정 버전은 1.84이며, 가능한 모든 프로젝트에서 **최신 jdk18on으로 업그레이드를 권장**합니다. 1.64는 이후 수정된 다수 CVE(예: CVE-2020-28052 OpenBSDBCrypt 비교 결함, CVE-2023-33201 LDAP 인젝션, CVE-2023-33202 PEMParser DoS)에 노출됩니다.

---

## 1. 의존성 설정

### 1-1. 아티팩트 네이밍 규칙

BouncyCastle은 JDK 타겟에 따라 아티팩트를 분리해 배포합니다.

| 아티팩트 | 대상 JDK | 상태 |
|---------|---------|------|
| `bcprov-jdk15on` | Java 5~15 (멀티릴리스 아님) | **유지보수 중단** (최종 1.70, 2021-12-01) |
| `bcprov-jdk18on` | Java 8+ (멀티릴리스 JAR, Java 9/11/15 기능 일부 포함) | **공식 권장** (1.71부터 jdk15on 대체) |
| `bcprov-jdk15to18` | Java 5~8 (멀티릴리스 JAR 미지원 환경) | jdk15on의 대체 LTS 라인 |

> 주의: "jdk15on"의 "15"는 Java 15가 아니라 **JDK 1.5 이상(on)** 이라는 의미입니다. 같은 이유로 "jdk18on"은 **JDK 1.8 이상(on)**.

### 1-2. Spring Boot 2.5 + Java 11 (레거시, BC 1.64)

```xml
<!-- pom.xml — 레거시 호환 -->
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcprov-jdk15on</artifactId>
    <version>1.64</version>
</dependency>
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcpkix-jdk15on</artifactId>
    <version>1.64</version>
</dependency>
```

- `bcprov`: JCA/JCE provider + 저수준 암호 API
- `bcpkix`: CMS, PKCS, EAC, TSP, CMP, CRMF, OCSP, 인증서 생성 등 PKI 관련

> 주의: 1.64는 CVE-2019-17359(ASN.1 파서 OOM)를 수정한 버전이지만, 그 이후 발견된 CVE는 방치됩니다. 가능하면 **`bcprov-jdk15to18:1.78.x`** 이상으로 이식을 권장(Java 5~8 호환 유지).

### 1-3. Spring Boot 3.x + Java 17+ (최신 권장)

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
<!-- 필요 시 -->
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcutil-jdk18on</artifactId>
    <version>1.78.1</version>
</dependency>
```

- `bcutil-jdk18on`: ASN.1 확장·유틸리티 API (bcpkix·bctls가 내부 사용)
- 1.78.1은 4개 CVE 패치(2024-04)를 포함. 1.84가 2026-04 기준 최신.

### 1-4. Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation("org.bouncycastle:bcprov-jdk18on:1.78.1")
    implementation("org.bouncycastle:bcpkix-jdk18on:1.78.1")
}
```

---

## 2. Provider 등록

BouncyCastle은 JCA(Java Cryptography Architecture) Provider로 등록해야 `Cipher.getInstance(algorithm, "BC")` 같은 호출이 가능해집니다.

### 2-1. 런타임 등록 (권장, Spring Boot)

```java
import java.security.Security;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

public class CryptoBootstrap {
    public static void register() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }
}
```

- `PROVIDER_NAME` 상수는 `"BC"`.
- 중복 등록 시 `addProvider`는 무시되지만, 명시적 null 체크가 안전.

### 2-2. 정적 등록 (`java.security` 파일)

`$JAVA_HOME/conf/security/java.security`(Java 9+) 또는 `$JAVA_HOME/jre/lib/security/java.security`(Java 8)에 아래 라인을 추가:

```
security.provider.10=org.bouncycastle.jce.provider.BouncyCastleProvider
```

- 숫자 n은 선호도 순서(1이 최우선).
- 배포 환경에 파일을 바꿀 수 없으면 런타임 등록 사용.

### 2-3. Spring Boot `@Configuration` + `@PostConstruct`

```java
import jakarta.annotation.PostConstruct;  // Spring Boot 3.x
// import javax.annotation.PostConstruct; // Spring Boot 2.x
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.context.annotation.Configuration;
import java.security.Security;

@Configuration
public class BouncyCastleConfig {

    @PostConstruct
    public void registerProvider() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }
}
```

> 주의: Spring Boot 2.x는 `javax.annotation.PostConstruct`, Spring Boot 3.x는 `jakarta.annotation.PostConstruct` 사용. Jakarta EE 전환으로 패키지가 바뀐 지점.

---

## 3. 대칭 암호화 (AES)

### 3-1. AES-GCM (AEAD, 권장)

GCM은 **암호화 + 인증(무결성 태그)** 을 한 번에 제공하는 AEAD 모드입니다. 현대 암호화의 기본값.

```java
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;

public class AesGcmCrypto {

    private static final int IV_LENGTH_BYTES = 12;   // 96-bit 권장
    private static final int TAG_LENGTH_BITS = 128;  // 인증 태그 길이

    /** 256-bit 키 생성 */
    public static SecretKey generateKey() throws Exception {
        KeyGenerator kg = KeyGenerator.getInstance("AES", "BC");
        kg.init(256);
        return kg.generateKey();
    }

    /** 암호화: iv || ciphertext||tag 형태로 반환 */
    public static byte[] encrypt(SecretKey key, byte[] plaintext, byte[] aad) throws Exception {
        byte[] iv = new byte[IV_LENGTH_BYTES];
        new SecureRandom().nextBytes(iv);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding", "BC");
        cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
        if (aad != null) cipher.updateAAD(aad);   // 부가 인증 데이터 (선택)
        byte[] ct = cipher.doFinal(plaintext);

        byte[] out = new byte[iv.length + ct.length];
        System.arraycopy(iv, 0, out, 0, iv.length);
        System.arraycopy(ct, 0, out, iv.length, ct.length);
        return out;
    }

    /** 복호화 */
    public static byte[] decrypt(SecretKey key, byte[] input, byte[] aad) throws Exception {
        byte[] iv = new byte[IV_LENGTH_BYTES];
        byte[] ct = new byte[input.length - IV_LENGTH_BYTES];
        System.arraycopy(input, 0, iv, 0, IV_LENGTH_BYTES);
        System.arraycopy(input, IV_LENGTH_BYTES, ct, 0, ct.length);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding", "BC");
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
        if (aad != null) cipher.updateAAD(aad);
        return cipher.doFinal(ct);  // 태그 검증 실패 시 AEADBadTagException
    }
}
```

**IV 규칙:**
- 길이는 **96비트(12바이트) 권장** — GCM 스펙 최적화 지점
- **같은 키로 IV를 절대 재사용하지 말 것.** 재사용 시 인증 서브키가 노출되어 메시지 복원·위조 가능 (치명적)
- `SecureRandom`으로 매번 새로 생성
- 같은 키로 약 2^32(약 43억) 메시지 이상 랜덤 IV 사용 시 충돌 확률 2^-32 초과 — NIST 권고 한계. 그 이상이면 AES-GCM-SIV 또는 키 로테이션 고려

**태그 길이:**
- GCM 스펙은 {128, 120, 112, 104, 96} 비트 허용(특정 용도 한정 {64, 32})
- **128비트 기본 사용**

### 3-2. AES-CBC (PKCS5Padding, 레거시)

AEAD가 아니라 **별도 MAC(HMAC)** 이 필요합니다. 레거시 프로토콜 호환 목적에만 사용.

```java
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;

public static byte[] encryptCbc(SecretKey key, byte[] plaintext) throws Exception {
    byte[] iv = new byte[16];   // AES CBC IV = 16바이트 (블록 크기)
    new SecureRandom().nextBytes(iv);

    Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding", "BC");
    cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(iv));
    byte[] ct = cipher.doFinal(plaintext);

    // 별도 HMAC-SHA256으로 (iv || ct)에 대한 인증 태그 계산 필요
    // 그렇지 않으면 Padding Oracle Attack에 노출
    return /* iv || ct || hmac */;
}
```

> 주의: CBC는 패딩 오라클 공격(Padding Oracle) 위험이 있습니다. 반드시 **Encrypt-then-MAC** 패턴을 쓰거나, 아예 GCM으로 전환하세요.

### 3-3. AES-ECB (사용 금지)

```java
// 금지 — 같은 평문 블록은 같은 암호문 블록이 됩니다 (패턴 노출)
Cipher.getInstance("AES/ECB/PKCS5Padding", "BC");
```

---

## 4. 비대칭 암호화 (RSA)

### 4-1. 키쌍 생성

```java
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.spec.RSAKeyGenParameterSpec;

public static KeyPair generateRsaKeyPair(int keySize) throws Exception {
    KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA", "BC");
    kpg.initialize(new RSAKeyGenParameterSpec(keySize, RSAKeyGenParameterSpec.F4));
    return kpg.generateKeyPair();
}
```

- **키 크기:** 2048(최소 권장), 3072, 4096
- 1024비트 이하는 **사용 금지** (NIST SP 800-131A에서 2014년 이후 금지)
- 공개 지수(public exponent): 보통 F4(65537)

### 4-2. RSA-OAEP (권장)

```java
import javax.crypto.Cipher;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.security.spec.MGF1ParameterSpec;

public static byte[] encryptOaep(PublicKey pub, byte[] plaintext) throws Exception {
    Cipher cipher = Cipher.getInstance("RSA/NONE/OAEPWithSHA-256AndMGF1Padding", "BC");
    OAEPParameterSpec spec = new OAEPParameterSpec(
            "SHA-256",
            "MGF1",
            MGF1ParameterSpec.SHA256,
            PSource.PSpecified.DEFAULT);
    cipher.init(Cipher.ENCRYPT_MODE, pub, spec);
    return cipher.doFinal(plaintext);
}

public static byte[] decryptOaep(PrivateKey priv, byte[] ciphertext) throws Exception {
    Cipher cipher = Cipher.getInstance("RSA/NONE/OAEPWithSHA-256AndMGF1Padding", "BC");
    OAEPParameterSpec spec = new OAEPParameterSpec(
            "SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT);
    cipher.init(Cipher.DECRYPT_MODE, priv, spec);
    return cipher.doFinal(ciphertext);
}
```

> 주의: OAEP의 **해시와 MGF1 해시가 일치하지 않으면** 상대방 라이브러리(특히 JCE 기본 구현)와 상호운용 문제가 발생합니다. 양쪽 SHA-256로 명시하세요.

### 4-3. RSA PKCS#1 v1.5 (deprecated)

```java
// 레거시 — 가능하면 OAEP로 교체
Cipher.getInstance("RSA/NONE/PKCS1Padding", "BC");
```

PKCS#1 v1.5는 Bleichenbacher 공격 계열에 취약해 **신규 시스템에서 금지**. 레거시 상호운용이 강제될 때만 사용.

### 4-4. RSA 암호화 한계

RSA 블록 크기보다 큰 데이터는 한 번에 못 암호화함. **하이브리드 암호화(AES 세션 키 + RSA로 세션 키 암호화)** 가 표준 패턴.

---

## 5. 디지털 서명

### 5-1. SHA-256 with RSA

```java
import java.security.Signature;

public static byte[] sign(PrivateKey priv, byte[] data) throws Exception {
    Signature sig = Signature.getInstance("SHA256withRSA", "BC");
    sig.initSign(priv);
    sig.update(data);
    return sig.sign();
}

public static boolean verify(PublicKey pub, byte[] data, byte[] signature) throws Exception {
    Signature sig = Signature.getInstance("SHA256withRSA", "BC");
    sig.initVerify(pub);
    sig.update(data);
    return sig.verify(signature);
}
```

### 5-2. 알고리즘 옵션

| 알고리즘 | 용도 |
|----------|------|
| `SHA256withRSA` | 일반적인 RSA 서명 |
| `SHA256withRSAandMGF1` (RSA-PSS) | PSS 패딩, 더 강력한 변형. 신규 권장 |
| `SHA384withECDSA` / `SHA256withECDSA` | ECDSA (곡선은 secp256r1, secp384r1 등) |
| `Ed25519` | EdDSA, 고성능·안전. 상호운용 환경이 지원해야 함 |

```java
// RSA-PSS
Signature.getInstance("SHA256withRSAandMGF1", "BC");

// ECDSA
Signature.getInstance("SHA256withECDSA", "BC");
KeyPairGenerator ecKpg = KeyPairGenerator.getInstance("EC", "BC");
ecKpg.initialize(new java.security.spec.ECGenParameterSpec("secp256r1"));
```

---

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
