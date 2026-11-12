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

### 10-3. BC 전용 keystore 타입

- `"BKS"`: BouncyCastle 독점 포맷 (안드로이드 레거시 등)
- `"UBER"`: 더 강한 암호화를 적용한 BC 포맷

BC 1.71+에서 기본 `PKCS12`도 BC provider를 통해 로드 가능. BC 1.69는 Java 17에서 "pad block corrupted" 에러가 발생하는 버그가 있었으므로 1.70+ 사용 권장.

> 주의 (2026-11-06 재검증): BC **1.85부터** 기본 `"BKS"` 타입으로 legacy version 0/1 스토어(16비트 HMAC 무결성 키, CVE-2026-59651 / CVE-2018-5382)를 열면 `IOException`이 납니다. 꼭 필요하면 `org.bouncycastle.bks.enable_v1` 속성으로 명시 허용하되, 가능하면 v2 또는 PKCS#12로 다시 저장하세요. 또 **1.86부터** PKCS#12(PBMAC1)·BCFKS·PBES2 로드 시 KDF 반복 횟수가 `org.bouncycastle.pbe.max_iteration_count`(기본 10,000,000)로 제한됩니다(CVE-2026-17508) — 비정상적으로 큰 반복 횟수로 만든 파일은 로드가 거부될 수 있습니다.

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
| BC 1.85.x 이하로 신규 배포 | 1.86+ (CVE-2026-0636·13506·59651·13586·17508 등, SKILL.md 상단 주의) |

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
