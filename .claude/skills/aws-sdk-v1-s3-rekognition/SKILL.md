---
name: aws-sdk-v1-s3-rekognition
description: AWS SDK for Java v1 (1.12.x) S3 + Rekognition 레거시 유지 가이드 - 2025-12-31 end-of-support·마지막 1.12.797, 모듈 버전 혼재 시 BOM 통일, v1 자격 증명 체인, Spring Boot 2.5 Bean 통합, S3 스트림·presigned·TransferManager 함정, Rekognition 이미지 한도, v2 마이그레이션 비교·OpenRewrite, 흔한 실수
---

# AWS SDK for Java v1 — S3 + Rekognition (Legacy)

> 소스: https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/welcome.html | https://github.com/aws/aws-sdk-java | https://aws.amazon.com/blogs/developer/announcing-end-of-support-for-aws-sdk-for-java-v1-x-on-december-31-2025/ | https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/migration-whats-different.html
> 검증일: 2026-11-06

> **주의 (EOL):** AWS SDK for Java v1.x는 **2024-07-31부터 maintenance mode**, **2025-12-31에 end-of-support**에 도달했습니다. 이후로는 보안 패치 포함 어떤 업데이트도 제공되지 않으며, 기존 아티팩트는 Maven Central에 그대로 남습니다. 신규 프로젝트는 **반드시 v2(`software.amazon.awssdk`)를 사용**하고, 이 스킬은 **기존 v1 코드베이스 유지·점진적 마이그레이션용**으로만 참조하세요. AWS는 OpenRewrite 기반의 v2 마이그레이션 도구를 제공합니다. (2026-09-26 재검증: end-of-support 상태 그대로 유지 확인 — v1 신규 릴리스 없음, 기존 아티팩트는 계속 Maven Central에서 사용 가능)

> 대상 스택: AWS SDK for Java v1 (S3 1.12.201 + Rekognition 1.12.372 혼재), Spring Boot 2.5, Java 11.

---

## 의존성 설정 — BOM으로 버전 동기화

### 핵심 원칙

**개별 모듈마다 서로 다른 버전을 지정하면 내부 의존성(`aws-java-sdk-core`)이 충돌**해 런타임에서 `NoSuchMethodError`나 시그니처 불일치가 발생할 수 있다. 반드시 BOM(Bill of Materials)으로 모든 `com.amazonaws:aws-java-sdk-*` 모듈을 동일한 버전으로 맞춘다.

현재 사용자 스택처럼 `aws-java-sdk-s3:1.12.201`과 `aws-java-sdk-rekognition:1.12.372`가 혼재하면:
- 두 모듈이 서로 다른 `aws-java-sdk-core` 버전을 transitively 끌어오고, Maven/Gradle의 충돌 해결 정책(가장 높은 버전 또는 선언 순서)에 따라 비결정적으로 결정된다
- 어떤 쪽의 core가 선택돼도 다른 모듈이 기대하는 API와 어긋날 수 있다
- 권장: BOM으로 단일 버전(예: `1.12.797` 또는 기존 운영 중인 최소 안정 버전)으로 고정

### Maven — BOM 사용 (권장)

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.amazonaws</groupId>
            <artifactId>aws-java-sdk-bom</artifactId>
            <version>1.12.797</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>com.amazonaws</groupId>
        <artifactId>aws-java-sdk-s3</artifactId>
        <!-- version 생략: BOM이 결정 -->
    </dependency>
    <dependency>
        <groupId>com.amazonaws</groupId>
        <artifactId>aws-java-sdk-rekognition</artifactId>
        <!-- version 생략: BOM이 결정 -->
    </dependency>
</dependencies>
```

- BOM 버전은 **현재 유지보수 모드의 마지막 배포 버전 1.12.797**까지 선택 가능 (2025-12 EOL 이후 신규 배포 없음)
- 기존 운영 환경이 `1.12.201`/`1.12.372`로 고정돼 있다면, BOM도 해당 버전 중 하나로 맞춰 **점진적으로 동일 버전으로 통일**한 뒤 상향 조정한다

### Gradle

```groovy
dependencies {
    implementation platform('com.amazonaws:aws-java-sdk-bom:1.12.797')
    implementation 'com.amazonaws:aws-java-sdk-s3'
    implementation 'com.amazonaws:aws-java-sdk-rekognition'
}
```

### Spring Boot 2.5 + Java 11 호환성

- AWS SDK v1 1.12.x는 **Java 8 이상**에서 동작, Java 11/17도 지원
- Spring Boot 2.5와는 특별한 버전 제약 없음 (Spring 5.3.x가 요구하는 JDK만 맞추면 됨)
- Spring Cloud AWS를 쓰지 않고 AWS SDK를 직접 사용하는 경우 Boot 버전과 독립적으로 갱신 가능

---

## 자격 증명 제공자 체인

### DefaultAWSCredentialsProviderChain 순서

`DefaultAWSCredentialsProviderChain.getInstance()`는 다음 순서로 credential을 찾는다 (v1 기준):

| 순서 | Provider | 소스 |
|:---:|----------|------|
| 1 | `EnvironmentVariableCredentialsProvider` | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (옵션: `AWS_SESSION_TOKEN`) |
| 2 | `SystemPropertiesCredentialsProvider` | `aws.accessKeyId`, `aws.secretKey` |
| 3 | `WebIdentityTokenCredentialsProvider` | `AWS_WEB_IDENTITY_TOKEN_FILE` (EKS IRSA 등) |
| 4 | `ProfileCredentialsProvider` | `~/.aws/credentials`의 default 프로파일 |
| 5 | `EC2ContainerCredentialsProviderWrapper` | ECS task role, EC2 instance profile |

> 주의: v1의 5번은 **ECS/EC2 통합 provider**다. v2에서는 `ContainerCredentialsProvider`와 `InstanceProfileCredentialsProvider`로 분리되어 있다.

---

## Spring Boot 2.5 Bean 등록

AmazonS3 클라이언트는 **생성 비용이 크고 thread-safe**이므로 애플리케이션 전역에 싱글턴으로 1개만 생성해 재사용한다.

```java
@Configuration
public class AwsConfig {

    @Bean(destroyMethod = "shutdown")
    public AmazonS3 amazonS3() {
        return AmazonS3ClientBuilder.standard()
            .withRegion(Regions.AP_NORTHEAST_2)
            .withCredentials(DefaultAWSCredentialsProviderChain.getInstance())
            .build();
    }

    @Bean(destroyMethod = "shutdown")
    public AmazonRekognition amazonRekognition() {
        return AmazonRekognitionClientBuilder.standard()
            .withRegion(Regions.AP_NORTHEAST_2)
            .withCredentials(DefaultAWSCredentialsProviderChain.getInstance())
            .build();
    }

    @Bean(destroyMethod = "shutdownNow")
    public TransferManager transferManager(AmazonS3 amazonS3) {
        return TransferManagerBuilder.standard()
            .withS3Client(amazonS3)
            .build();
    }
}
```

- `destroyMethod = "shutdown"`: 컨테이너 종료 시 내부 HTTP client와 커넥션 풀을 닫아 리소스 누수 방지
- `TransferManager`는 내부 스레드풀을 갖기 때문에 종료 시 `shutdownNow()` 호출 필요

---

## S3 함정

> 주의: `InputStream` 업로드 시 `ContentLength`를 지정하지 않으면 SDK가 전체 데이터를 메모리에 버퍼링한 뒤 업로드하여 대용량에서 OOM을 일으킬 수 있다. 길이가 확정된 스트림은 항상 metadata에 길이를 세팅한다.

> 주의: `S3Object`는 `Closeable`이다. `getObjectContent()`로 얻은 스트림을 소비한 뒤 반드시 닫지 않으면 **커넥션 풀 고갈**로 이어진다 (`Not all bytes were read from the S3ObjectInputStream` 경고 발생).

> 주의: presigned URL 발급 시점의 자격 증명이 만료되면 URL도 무효화된다. IAM Role로 받은 **임시 자격 증명**은 URL 만료 기간보다 먼저 만료될 수 있으니 장기 공유에는 적합하지 않다.

- presigned URL 클라이언트는 **동일한 HTTP 메서드(PUT)와 동일한 헤더**(`Content-Type` 등)로 요청해야 서명이 유효, 만료시간은 최대 7일 (SigV4 기준)
- `TransferManager` 기본값은 16MB 임계값, 5MB 파트. 파트 크기를 너무 작게 잡으면 파트 수(최대 10,000)를 초과하거나 오히려 느려진다.

---

## Rekognition — 이미지 입력

- **S3Object 방식** (권장): S3에 이미 올라간 파일을 참조. 네트워크 효율적이고 큰 파일에 유리
- **Bytes 방식**: `new Image().withBytes(ByteBuffer.wrap(bytes))` — 5MB 이하 권장, 간단한 경우에만

> 주의: Rekognition은 이미지 **최대 15MB (S3)** / **5MB (bytes)**, 형식은 JPEG/PNG만 지원.

---

> 상세 레퍼런스 (v1→v2 마이그레이션 비교·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
