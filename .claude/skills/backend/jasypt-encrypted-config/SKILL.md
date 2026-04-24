---
name: jasypt-encrypted-config
description: Jasypt로 Spring Boot application.yml 설정값 암호화 - ENC() 구문, 환경변수 키 주입, PBEWITHHMACSHA512ANDAES_256 알고리즘, CLI 암호문 생성, 커스텀 prefix/suffix, Spring Boot 2.x/3.x 양쪽 호환 매트릭스, 커스텀 StringEncryptor Bean
---

# Jasypt 암호화 설정값 관리

> 소스: https://github.com/ulisesbocchio/jasypt-spring-boot | https://github.com/ulisesbocchio/jasypt-spring-boot/releases | http://www.jasypt.org/cli.html
> 검증일: 2026-04-22

> 주의: 이 문서는 `com.github.ulisesbocchio:jasypt-spring-boot-starter` 3.0.x / 4.0.x 기준이며, Jasypt 코어는 1.9.3입니다. 버전 호환성은 아래 매트릭스를 따르세요.

---

## Jasypt vs jasypt-spring-boot-starter

| 구분 | 역할 | 제공자 |
|------|------|--------|
| **Jasypt** (`org.jasypt:jasypt:1.9.3`) | 암복호화 라이브러리 코어. `StandardPBEStringEncryptor`, `PooledPBEStringEncryptor` 등 암호화 엔진과 CLI(`encrypt.sh`/`decrypt.sh`) 제공 | jasypt.org |
| **jasypt-spring-boot-starter** (`com.github.ulisesbocchio`) | Spring Boot 통합 래퍼. `ENC(...)` 구문 자동 복호화, `PropertySource` 후킹, `@EnableEncryptableProperties` 등 제공 | ulisesbocchio/jasypt-spring-boot |

Spring Boot 프로젝트에서는 **starter만 의존성에 추가하면 된다.** starter가 Jasypt 코어를 transitively 가져온다. CLI는 별도로 Jasypt 배포본(`jasypt-1.9.3-dist.zip`)을 다운로드해서 사용한다.

---

## 버전 호환 매트릭스

| jasypt-spring-boot-starter | Spring Boot | Java | 릴리스일 | 비고 |
|---:|---:|---:|---|---|
| 2.1.2 | 2.0 ~ 2.4 | 8+ | 2020 | 구형 Spring Boot 2.x |
| 3.0.3 | 2.x | 8+ | 2020 | 기본 알고리즘 PBEWITHHMACSHA512ANDAES_256으로 변경 |
| 3.0.4 | 2.x | 8+ | 2021-08-29 | — |
| 3.0.5 | 2.x (주로), 일부 3.x 환경에서 동작 보고 있음 | 8+ | 2022-12-15 | 3.0.x 계열 마지막 |
| 4.0.3 | 3.5+ | 17+ | 2024-12-15 | Spring Boot 3.5로 공식 업그레이드 |
| 4.0.4 | 3.5+ | 17+ | 2025 (최신) | YAML 멀티라인·AEP 이벤트 재사용 픽스 |

> 주의: 사용자 요청에서 "레거시 3.0.2 / 최신 3.0.5"로 언급되었으나, 실제 레거시(Spring Boot 2.x)는 **3.0.5**가 3.0.x 계열 마지막 안정 버전이고, 모던(Spring Boot 3.x)은 **4.0.4**가 최신입니다. 3.0.5는 Spring Boot 3.2+에서 `UnsatisfiedDependencyException` 등 호환성 이슈가 보고되어 있어 Spring Boot 3 프로젝트에서는 4.0.x 사용을 권장합니다. (Issue #386 참조)

### 선택 기준

| 프로젝트 상황 | 권장 버전 |
|--------------|-----------|
| Spring Boot 2.5 ~ 2.7, Java 8/11 | `3.0.5` |
| Spring Boot 3.0 ~ 3.4, Java 17 | `4.0.3` (3.5 요구 완화됨을 확인 필요 — 안 되면 3.0.5 시도) |
| Spring Boot 3.5+, Java 17+ | `4.0.4` |

---

## 의존성 설정

### Spring Boot 2.5 ~ 2.7 (Java 8/11)

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.5</version>
</dependency>
```

```gradle
// build.gradle
implementation 'com.github.ulisesbocchio:jasypt-spring-boot-starter:3.0.5'
```

### Spring Boot 3.5+ (Java 17+)

```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>4.0.4</version>
</dependency>
```

### `@SpringBootApplication`을 쓰지 않는 경우

`@SpringBootApplication` 없이 `@Configuration`만 쓰는 모듈이라면 `@EnableEncryptableProperties`를 명시한다.

```java
@Configuration
@EnableEncryptableProperties
public class AppConfig {
}
```

> starter만 classpath에 있고 `@SpringBootApplication`을 쓰면 자동으로 암호화된 프로퍼티가 Spring Environment 전체에 활성화된다. `@EnableEncryptableProperties`는 중복 선언해도 문제 없다.

---

## 기본 사용법: `ENC(...)` 구문

`application.yml`에 평문과 암호문을 섞어서 쓸 수 있다. 암호문은 `ENC(...)` prefix/suffix로 감싼다.

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/app
    username: app
    password: ENC(rGXlOJz8p9dUkM0wV2Y4Tx6vQnBcHe...)   # 암호문

app:
  jwt:
    secret: ENC(7m5K2pLx9NqR3bYc8tW1Ve6FHgUaMd...)    # 암호문
  api:
    public-host: https://api.example.com              # 평문은 그대로
    external-key: ENC(Qp8rLz3aXk1nB4CdE6fGh9jKm2...)  # 암호문
```

실행 시 starter가 `ENC(...)` 패턴을 감지해 복호화한 뒤 `@Value`, `@ConfigurationProperties`, `Environment.getProperty()` 등 모든 경로에 평문을 주입한다. 애플리케이션 코드에서는 복호화를 의식할 필요가 없다.

---

## 암호화 키(마스터 패스워드) 주입 방법

`jasypt.encryptor.password` 값이 마스터 키다. **이 키가 유출되면 모든 암호문이 복호화되므로 절대 git에 커밋하지 말 것.**

### 1. 환경변수 (권장) — 서버/컨테이너 환경

```bash
# 실행 시
JASYPT_ENCRYPTOR_PASSWORD=my-master-key java -jar app.jar

# Docker
docker run -e JASYPT_ENCRYPTOR_PASSWORD=my-master-key myapp:latest

# Kubernetes (Secret 마운트)
env:
  - name: JASYPT_ENCRYPTOR_PASSWORD
    valueFrom:
      secretKeyRef:
        name: jasypt-secret
        key: password
```

`application.yml`에서 환경변수를 참조하려면:

```yaml
jasypt:
  encryptor:
    password: ${JASYPT_ENCRYPTOR_PASSWORD:}   # 기본값 없이 환경변수로만
```

> `JASYPT_ENCRYPTOR_PASSWORD`라는 이름은 Spring의 relaxed binding으로 `jasypt.encryptor.password` 프로퍼티에 매핑된다. 따라서 위 yaml 블록 없이 환경변수만 있어도 동작한다.

### 2. JVM 인자 (CI/배포 스크립트)

```bash
java -Djasypt.encryptor.password=my-master-key -jar app.jar
```

### 3. 파일 기반 (비추천, 로컬 dev 전용)

```yaml
jasypt:
  encryptor:
    password-filename: file:./jasypt-password.txt      # 파일 경로 지정
    # password-sys-property-name: my.sys.prop         # 다른 시스템 프로퍼티 이름 매핑
```

> 주의: 파일 기반은 파일 자체가 노출되면 키가 유출된다. 로컬 개발에서만 쓰고 `.gitignore`에 반드시 추가.

### 4. AWS Secrets Manager / HashiCorp Vault

prod에서는 환경변수 주입 단계에서 Secrets Manager/Vault에서 조회한 값을 `JASYPT_ENCRYPTOR_PASSWORD`로 넣는다. starter 자체가 이들을 직접 통합하지는 않으므로 init-container나 entrypoint 스크립트에서 처리한다.

---

## 암호화 알고리즘 설정

### 기본값 (3.0.0 이후)

| 프로퍼티 | 기본값 |
|----------|--------|
| `jasypt.encryptor.algorithm` | `PBEWITHHMACSHA512ANDAES_256` |
| `jasypt.encryptor.key-obtention-iterations` | `1000` |
| `jasypt.encryptor.pool-size` | `1` |
| `jasypt.encryptor.provider-name` | `SunJCE` |
| `jasypt.encryptor.salt-generator-classname` | `org.jasypt.salt.RandomSaltGenerator` |
| `jasypt.encryptor.iv-generator-classname` | `org.jasypt.iv.RandomIvGenerator` |
| `jasypt.encryptor.string-output-type` | `base64` |
| `jasypt.encryptor.property.prefix` | `ENC(` |
| `jasypt.encryptor.property.suffix` | `)` |

> 변경 필요 없으면 그대로 둔다. 기본값이 현재(2026년) 보안 요구사항을 충족한다.

### 왜 `PBEWITHMD5ANDDES`는 쓰지 말아야 하나

| 알고리즘 | 상태 |
|----------|:---:|
| `PBEWITHMD5ANDDES` | ⛔ Deprecated — DES는 56-bit 키로 brute force에 취약, MD5도 충돌 취약 |
| `PBEWithMD5AndTripleDES` | ⚠️ 구형 호환용 — 새 프로젝트에서 사용 금지 |
| `PBEWITHHMACSHA256ANDAES_128` | ✅ 최소 허용 수준 |
| `PBEWITHHMACSHA512ANDAES_256` | ✅ **현재 권장** (starter 3.0.0+ 기본값) |

### 3.0.0 이전 방식 유지 (레거시 암호문과 호환)

`PBEWITHHMACSHA512ANDAES_256`은 IV Generator가 **필수**다. 구버전 암호문(`PBEWithMD5AndDES`)을 그대로 유지하려면 IV Generator를 `NoIvGenerator`로 명시해야 한다.

```yaml
# 구형 암호문 호환 (권장하지 않음 — 점진적 재암호화 권장)
jasypt:
  encryptor:
    algorithm: PBEWithMD5AndDES
    iv-generator-classname: org.jasypt.iv.NoIvGenerator
```

---

## 암호문 생성 방법

### 방법 1: Jasypt CLI (가장 간편)

Jasypt 코어 배포본을 다운로드하고 `bin/encrypt.sh`(또는 `.bat`)를 실행한다.

```bash
# http://www.jasypt.org/download.html에서 jasypt-1.9.3-dist.zip 다운로드
unzip jasypt-1.9.3-dist.zip
cd jasypt-1.9.3/bin

# 암호화
./encrypt.sh \
  input="my-secret-db-password" \
  password="my-master-key" \
  algorithm=PBEWITHHMACSHA512ANDAES_256 \
  ivGeneratorClassName=org.jasypt.iv.RandomIvGenerator

# 출력:
# ----OUTPUT-----------------
# rGXlOJz8p9dUkM0wV2Y4Tx6vQnBcHe...
# ---------------------------
```

> 주의: `PBEWITHHMACSHA512ANDAES_256` 같은 AES 기반 알고리즘은 `ivGeneratorClassName=org.jasypt.iv.RandomIvGenerator` 인자를 **반드시 줘야 한다.** 빠뜨리면 기본값인 `NoIvGenerator`로 동작해 starter가 복호화 시 실패한다.

복호화 검증:

```bash
./decrypt.sh \
  input="rGXlOJz8p9dUkM0wV2Y4Tx6vQnBcHe..." \
  password="my-master-key" \
  algorithm=PBEWITHHMACSHA512ANDAES_256 \
  ivGeneratorClassName=org.jasypt.iv.RandomIvGenerator
```

### 방법 2: Maven 플러그인

```bash
# 단발성 암호화
mvn jasypt:encrypt-value \
  -Djasypt.encryptor.password=my-master-key \
  -Djasypt.plugin.value=my-secret-db-password

# application.yml의 DEC(...) 패턴을 일괄 암호화
# (yml에 password: DEC(plaintext)로 적어두면 ENC(cipher)로 치환됨)
mvn jasypt:encrypt -Djasypt.encryptor.password=my-master-key
```

플러그인을 `pom.xml`에 등록:

```xml
<plugin>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-maven-plugin</artifactId>
    <version>3.0.5</version>
</plugin>
```

### 방법 3: 프로그래매틱 (`StringEncryptor` 빈 주입)

애플리케이션 내부에서 값을 암호화해야 할 때.

```java
@Component
@RequiredArgsConstructor
public class SecretEncoder {

    private final StringEncryptor jasyptStringEncryptor;   // starter가 등록한 기본 빈

    public String encrypt(String plaintext) {
        return "ENC(" + jasyptStringEncryptor.encrypt(plaintext) + ")";
    }

    public String decrypt(String cipher) {
        return jasyptStringEncryptor.decrypt(cipher);
    }
}
```

---

## 커스텀 `StringEncryptor` Bean

기본 설정이 맞지 않거나(예: 알고리즘 변경, 풀 사이즈 조정), 여러 StringEncryptor를 분리 운용하려면 빈을 직접 등록한다.

### 반드시 빈 이름을 `jasyptStringEncryptor`로

```java
@Configuration
public class JasyptConfig {

    @Bean("jasyptStringEncryptor")
    public StringEncryptor jasyptStringEncryptor(
            @Value("${jasypt.encryptor.password}") String password) {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        config.setPassword(password);
        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        config.setStringOutputType("base64");
        encryptor.setConfig(config);
        return encryptor;
    }
}
```

- 빈 이름이 **`jasyptStringEncryptor`여야** starter가 자동 탐지한다. 이름이 다르면 `jasypt.encryptor.bean=myEncryptor`로 지정.
- 이 빈이 있으면 `jasypt.encryptor.*` 프로퍼티는 대부분 무시되고 빈이 우선한다.

### 멀티 StringEncryptor

```yaml
jasypt:
  encryptor:
    bean: primaryEncryptor           # 사용할 빈 이름 지정
```

```java
@Bean("primaryEncryptor")
public StringEncryptor primary() { ... }

@Bean("auditEncryptor")
public StringEncryptor audit() { ... }
```

---

## 커스텀 prefix / suffix

`ENC(...)`가 기존 값과 충돌하거나 가독성을 높이고 싶을 때 변경한다.

```yaml
jasypt:
  encryptor:
    property:
      prefix: "ENCRYPTED("
      suffix: ")"
```

```yaml
spring:
  datasource:
    password: ENCRYPTED(rGXlOJz8p9dUkM0wV2Y4Tx6...)
```

다른 예시:

| prefix | suffix | 용례 |
|--------|--------|-----|
| `ENC(` | `)` | **기본값** |
| `ENCRYPTED(` | `)` | 명시적 표기 |
| `ENC@[` | `]` | 괄호 충돌 회피 |
| `{cipher}` | `` (빈 문자열) | Spring Cloud Config 스타일 |

### 더 세밀한 제어

prefix/suffix만으로 부족하면 `EncryptablePropertyDetector` 빈을 직접 등록한다.

```java
@Bean("encryptablePropertyDetector")
public EncryptablePropertyDetector detector() {
    return new DefaultPropertyDetector("ENC(", ")");
}
```

---

## 평문·암호문 혼재 예시 (전체)

```yaml
# application.yml

spring:
  application:
    name: order-service
  datasource:
    url: jdbc:mysql://prod-db.internal:3306/orders?serverTimezone=Asia/Seoul
    username: order_app
    password: ENC(rGXlOJz8p9dUkM0wV2Y4Tx6vQnBcHe0iLpRmSfWdXgUvKjNbMeCa)
    driver-class-name: com.mysql.cj.jdbc.Driver

  redis:
    host: cache.internal
    port: 6379
    password: ENC(Qp8rLz3aXk1nB4CdE6fGh9jKm2NoPqStUvWxYz)

app:
  jwt:
    issuer: https://auth.example.com
    secret: ENC(7m5K2pLx9NqR3bYc8tW1Ve6FHgUaMdPoJiLkBvCx)
    access-token-ttl-seconds: 3600
  external-api:
    payment:
      base-url: https://api.payment.com/v2
      client-id: pub_live_abc123                                # 공개 ID는 평문
      client-secret: ENC(ZxYv8uTsR5qPoNmLkJhGfEdCbA1928374656)   # 시크릿만 암호화

jasypt:
  encryptor:
    password: ${JASYPT_ENCRYPTOR_PASSWORD:}     # 환경변수에서만 주입
    # algorithm, iv-generator 등은 기본값 사용

logging:
  level:
    root: INFO
```

---

## 프로파일별 키 분리

환경별로 다른 마스터 키를 쓰면 dev 암호문이 prod에서 무용지물이 되어 보안이 강화된다.

```yaml
# application.yml (공통)
jasypt:
  encryptor:
    password: ${JASYPT_ENCRYPTOR_PASSWORD:}
```

```
# 실행 시
JASYPT_ENCRYPTOR_PASSWORD=dev-key-xxxx  java -jar app.jar --spring.profiles.active=dev
JASYPT_ENCRYPTOR_PASSWORD=prod-key-yyyy java -jar app.jar --spring.profiles.active=prod
```

`application-dev.yml`과 `application-prod.yml`의 암호문은 각각 해당 환경의 키로 생성한다.

---

## 키 갱신(Key Rotation) 전략

Jasypt starter는 **런타임에 복호화만** 수행하며, in-memory로 복호화된 값이 캐시된다. 키 변경을 즉시 반영하는 메커니즘은 없다.

### 표준 절차

1. 새 마스터 키 `K2` 생성
2. 기존 암호문을 `K1`으로 복호화 → `K2`로 재암호화 (CLI 일괄 스크립트)
3. `application.yml`의 모든 `ENC(...)` 값을 새 암호문으로 교체
4. 환경변수 `JASYPT_ENCRYPTOR_PASSWORD`를 `K2`로 변경
5. **애플리케이션 재시작** — 롤링 재시작으로 무중단 배포 가능

### 재시작 없이 갱신하려면

- Spring Cloud Config + `@RefreshScope`를 써서 `application.yml`을 외부에서 재로드. 단, starter의 복호화는 `PropertySource` 추가 시점에 적용되므로 실제로는 Context refresh가 필요하다.
- 장기 실행 배치/스케줄러는 다음 잡 실행 전에 반드시 재기동.

> 주의: Jasypt 자체에는 "이중 키(old+new) 지원" 같은 기능이 없다. 재암호화와 재배포가 유일한 정석 경로다.

---

## 흔한 실수

| 실수 | 결과 / 수정 |
|------|-------------|
| `application.yml`에 `jasypt.encryptor.password: my-key` 하드코딩 후 git 커밋 | **마스터 키 유출** → 환경변수 `JASYPT_ENCRYPTOR_PASSWORD`로 주입 |
| `.gitignore`에 `application-local.yml` 없음 | 로컬 키 파일이 원격 저장소로 푸시됨 → 반드시 `.gitignore` 추가 |
| CLI로 암호화할 때 `ivGeneratorClassName` 누락 | AES 기반 알고리즘은 IV 필수 → 복호화 실패 (`EncryptionOperationNotPossibleException`) |
| Spring Boot 3.x에 `3.0.5` 의존성 사용 | `UnsatisfiedDependencyException` 발생 → 4.0.3/4.0.4로 업그레이드 |
| Spring Boot 2.x에 `4.0.x` 의존성 사용 | Java 17/Spring Boot 3.5 요구로 기동 실패 → 3.0.5로 다운그레이드 |
| 커스텀 `StringEncryptor` 빈 이름을 `myEncryptor`로 등록 | starter가 기본 이름(`jasyptStringEncryptor`)만 탐지 → 빈 이름을 `jasyptStringEncryptor`로 바꾸거나 `jasypt.encryptor.bean=myEncryptor` 지정 |
| `PBEWithMD5AndDES` 알고리즘을 계속 사용 | DES는 취약 → `PBEWITHHMACSHA512ANDAES_256`으로 재암호화 |
| 프로파일별 다른 키를 쓰면서 같은 암호문을 복붙 | prod에서 복호화 실패 → 프로파일별 암호문을 각 키로 개별 생성 |
| CI/CD 파이프라인 로그에 `-Djasypt.encryptor.password=...` 출력 | 로그에서 키 유출 → 마스킹된 환경변수 주입으로 대체 |
| 암호문에 특수문자(`)`, `$`) 포함 시 escape 누락 | yml 파싱 에러 → prefix/suffix 변경 또는 `string-output-type: hexadecimal`로 변경 |
| `@ConfigurationProperties` relaxed binding 신뢰 실패 | 환경변수명은 `JASYPT_ENCRYPTOR_PASSWORD`가 정상 — 언더스코어/대소문자 주의 |

---

## 트러블슈팅 체크리스트

복호화가 실패할 때 순서대로 확인:

1. `JASYPT_ENCRYPTOR_PASSWORD` 환경변수가 애플리케이션 프로세스에 실제로 전달되었는가 (`System.getenv()` 로 확인)
2. 암호문 생성 시 알고리즘 / IV Generator가 애플리케이션 설정과 동일한가
3. starter 버전이 Spring Boot 버전과 호환되는가 (위 매트릭스)
4. 커스텀 StringEncryptor 빈 이름이 `jasyptStringEncryptor`인가
5. prefix/suffix가 일치하는가 (CLI 암호문은 prefix/suffix 없이 순수 암호문만 출력 — yml에 적을 때 수동으로 `ENC(...)`를 감싸야 함)
6. 로그에서 starter의 `EnableEncryptablePropertySourcesPostProcessor` 등록 여부 확인 (DEBUG 레벨)
