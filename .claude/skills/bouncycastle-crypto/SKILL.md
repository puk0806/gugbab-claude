---
name: bouncycastle-crypto
description: BouncyCastle 암호화 - 1.86 최소 버전·2026 CVE, 의존성(jdk15on→jdk18on/jdk15to18, 레거시 1.64 + SB 2.5), KISA SEED/ARIA/LEA, BKS·PKCS#12 1.85/1.86 로드 변경, 흔한 실수(CVE별 패치 버전), 알고리즘 선택표
---

# BouncyCastle 암호화 스킬

> 소스: https://www.bouncycastle.org/ | https://github.com/bcgit/bc-java | https://downloads.bouncycastle.org/java/docs/bcprov-jdk18on-javadoc/ | https://mvnrepository.com/artifact/org.bouncycastle
> 검증일: 2026-11-06

> 주의: 이 문서는 두 가지 라인을 모두 다룹니다 — **레거시** `bcprov-jdk15on:1.64` (2019-11 릴리스, Java 8+ / Spring Boot 2.5 대응)와 **최신** `bcprov-jdk18on:1.78.x` 이상 (Java 8+, Spring Boot 3.x 권장). 2026년 4월 기준 BC의 최신 안정 버전은 1.84이며, 가능한 모든 프로젝트에서 **최신 jdk18on으로 업그레이드를 권장**합니다. 1.64는 이후 수정된 다수 CVE(예: CVE-2020-28052 OpenBSDBCrypt 비교 결함, CVE-2023-33201 LDAP 인젝션, CVE-2023-33202 PEMParser DoS)에 노출됩니다.
>
> **주의 (2026-11-06 재검증 — 최소 버전 1.86):** BC Java 최신 안정 버전은 **1.86**(2026-09-11 릴리스. `bctls`만 1.86.1/1.86.2 재배포 — JDK 9+ `NoSuchMethodError`·OSGi 수정)입니다. 공식 release notes 기준으로 **1.85 이하는 모두 1.86에서 고친 보안 결함에 노출**되므로 신규 배포는 **1.86 이상**으로 맞추세요(1.85 도 안전하지 않음). 1.87 은 개발 중(release notes "Date: 2026, TBD")이며 나오면 다시 올리세요.
> - **1.84 에서 패치**(1.83 이하 영향): **CVE-2026-0636** (LDAP 인젝션, `LDAPStoreHelper.java`, 1.74~1.83 — 예전 예시 `1.78.1` 포함), **CVE-2026-5598** (FrodoKEM 비상수 시간 비교 — PQC 사용 시에만).
> - **1.85 에서 패치**(1.84 이하 영향): **CVE-2026-13506** (지연 평가 ASN.1 시퀀스가 중첩 깊이 가드를 초기화), **CVE-2026-59651** (BKS 키스토어가 16비트 무결성 MAC 키의 legacy 버전을 허용 — 1.85부터 기본 `"BKS"`로 v0/v1 스토어를 열면 `IOException`), **CVE-2026-13586** (PKCS#12 MAC·bag 복호화 KDF 반복 횟수 상한 없음 → DoS), CVE-2026-12860 (RSA PKCS#1 검증이 NULL 생략 경로에서 해시 마지막 2바이트를 건너뜀) 외.
> - **1.86 에서 패치**(1.85.x 이하 영향, 14건): **CVE-2026-17508** (PBKDF2·bcrypt 등 비밀번호 기반 KDF 비용 값을 신뢰할 수 없는 입력에서 상한 없이 사용 — PKCS#12/PBMAC1·BCFKS·OpenSSH 키·JCA PBKDF2 경로, `org.bouncycastle.pbe.max_iteration_count` 기본 10,000,000), **CVE-2026-71889** (`PKIXCertPathReviewer`가 최종 인증서에 이름 제약을 적용 안 함), **CVE-2026-71888** (CMS AuthenticatedData authAttrs 위조), CVE-2026-71892 (CMS key-transport 키 길이 검증 미동작), OpenPGP·MLS·NTRU·HQC·BLS12-381 관련 다수.
> - 1.86 은 deprecated 였던 `org.bouncycastle.pqc.crypto.{mldsa,mlkem,slhdsa,frodo,cmce}` 를 **삭제**했습니다 — PQC 를 쓰면 `org.bouncycastle.crypto` 아래 표준화 구현으로 옮겨야 합니다(이 문서의 AES/RSA/서명/PEM 예시와는 무관).
>
> **결론: Provider 등록·AES-GCM/CBC·RSA-OAEP·서명·PEM API 는 변경되지 않았으므로 버전 번호만 `1.86`(또는 그 시점 최신)으로 쓰면 됩니다.**

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

> 주의: 1.64는 CVE-2019-17359(ASN.1 파서 OOM)를 수정한 버전이지만, 그 이후 발견된 CVE(CVE-2020-28052, CVE-2023-33201/33202, CVE-2026-0636 등)는 방치됩니다. 가능하면 **`bcprov-jdk15to18:1.86`** 이상으로 이식을 권장(Java 5~8 호환 유지).

### 1-3. Spring Boot 3.x + Java 17+ (최신 권장)

```xml
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcprov-jdk18on</artifactId>
    <version>1.86</version>
</dependency>
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcpkix-jdk18on</artifactId>
    <version>1.86</version>
</dependency>
<!-- 필요 시 -->
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcutil-jdk18on</artifactId>
    <version>1.86</version>
</dependency>
```

- `bcutil-jdk18on`: ASN.1 확장·유틸리티 API (bcpkix·bctls가 내부 사용)
- 2026-11-06 재검증: **1.86**이 최신(2026-09-11 릴리스, Maven Central `bcprov-jdk18on`·`bcpkix-jdk18on`·`bcutil-jdk18on`·`bcprov-jdk15to18` 모두 1.86). 과거 권장했던 `1.78.1`은 CVE-2026-0636 등에, `1.84`는 CVE-2026-13506/59651/13586 등에, `1.85.x`는 CVE-2026-17508 등 1.86 수정분에 노출되므로 **1.86 미만 버전은 사용하지 마세요.**

### 1-4. Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation("org.bouncycastle:bcprov-jdk18on:1.86")
    implementation("org.bouncycastle:bcpkix-jdk18on:1.86")
}
```

---

> 상세 레퍼런스 (KISA SEED/ARIA/LEA·Keystore 변경·흔한 실수·알고리즘 선택표) → [`references/REFERENCE.md`](references/REFERENCE.md)
