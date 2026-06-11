---
name: aws-sdk-v2-s3-rekognition
description: AWS SDK for Java v2 (software.amazon.awssdk) S3·Rekognition 모던 사용 패턴 - BOM, 빌더 API, 자격 증명 체인, S3 동기/비동기/Presigner/Transfer Manager, Rekognition DetectFaces/Labels/SearchFacesByImage, 예외 계층, Spring Boot 3 통합, v1→v2 마이그레이션
---

# AWS SDK for Java v2 — S3 & Rekognition 모던 가이드

> 소스:
> - AWS SDK for Java 2.x Developer Guide: https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/
> - GitHub: https://github.com/aws/aws-sdk-java-v2
> - S3 Examples: https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/java_s3_code_examples.html
> - S3 Presigned URL: https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/examples-s3-presign.html
> - S3 Transfer Manager: https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/transfer-manager.html
> - Rekognition Examples: https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/java_rekognition_code_examples.html
> - Credentials Chain: https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html
> - Exceptions: https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/handling-exceptions.html
> - Best Practices: https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/best-practices.html
> - Migration Tool: https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/migration-tool.html
> - OpenRewrite Recipe: https://docs.openrewrite.org/recipes/software/amazon/awssdk/v2migration/awssdkjavav1tov2
> - Spring Cloud AWS: https://github.com/awspring/spring-cloud-aws
>
> 검증일: 2026-04-23

> 주의: 본 문서는 AWS SDK for Java `2.42.x`(2026-04 기준 최신, 2.42.39) 기준입니다. AWS SDK for Java v1(`com.amazonaws:aws-java-sdk-*`)은 **2025-12-31 end-of-support**를 맞이했습니다. 신규 프로젝트는 반드시 v2를 사용하고, 기존 v1 코드는 마이그레이션 대상입니다.

> 관련 스킬: v1 전용 패턴은 `aws-sdk-v1-s3-rekognition` 스킬 참조.

---

## 1. 의존성 설정 (Maven BOM)

BOM을 import하면 개별 모듈마다 버전을 쓰지 않아도 된다. 여러 서비스 모듈 간 버전 불일치로 인한 런타임 에러를 방지할 수 있다.

### pom.xml

```xml
<project>
  <properties>
    <java.version>17</java.version>
    <aws.sdk.version>2.42.39</aws.sdk.version>
  </properties>

  <dependencyManagement>
    <dependencies>
      <!-- AWS SDK v2 BOM: 모든 서비스 모듈 버전 일원화 -->
      <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>bom</artifactId>
        <version>${aws.sdk.version}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>

  <dependencies>
    <!-- S3 동기 클라이언트 (기본 HTTP: Apache HTTP Client, 런타임 자동 감지) -->
    <dependency>
      <groupId>software.amazon.awssdk</groupId>
      <artifactId>s3</artifactId>
    </dependency>

    <!-- Rekognition -->
    <dependency>
      <groupId>software.amazon.awssdk</groupId>
      <artifactId>rekognition</artifactId>
    </dependency>

    <!-- (선택) S3 Transfer Manager: 대용량 멀티파트 업로드·디렉터리 전송 -->
    <dependency>
      <groupId>software.amazon.awssdk</groupId>
      <artifactId>s3-transfer-manager</artifactId>
    </dependency>

    <!-- (선택) CRT 기반 S3 비동기 클라이언트: Transfer Manager에 권장 -->
    <dependency>
      <groupId>software.amazon.awssdk.crt</groupId>
      <artifactId>aws-crt</artifactId>
      <version>0.38.4</version>
    </dependency>

    <!-- (선택) Netty 기반 비동기 HTTP 클라이언트: S3AsyncClient용 -->
    <dependency>
      <groupId>software.amazon.awssdk</groupId>
      <artifactId>netty-nio-client</artifactId>
    </dependency>
  </dependencies>
</project>
```

### Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation(platform("software.amazon.awssdk:bom:2.42.39"))
    implementation("software.amazon.awssdk:s3")
    implementation("software.amazon.awssdk:rekognition")
    implementation("software.amazon.awssdk:s3-transfer-manager")
}
```

### Java 요구사항

- AWS SDK for Java v2는 **Java 8+** 지원. 신규 Spring Boot 3.x 프로젝트는 **Java 17+** 권장.
- Spring Boot 3.x + Java 17, Spring Boot 4.x + Java 21 조합에서 동작 확인됨.

---

## 2. v1 vs v2 주요 차이 (요약)

| 항목 | v1 (`com.amazonaws:aws-java-sdk-*`) | v2 (`software.amazon.awssdk:*`) |
|------|-------------------------------------|----------------------------------|
| 패키지 | `com.amazonaws.services.s3.*` | `software.amazon.awssdk.services.s3.*` |
| 클라이언트 생성 | `AmazonS3ClientBuilder.standard().build()` | `S3Client.builder().region(...).build()` |
| setter 네이밍 | `withEndpoint(...)`, `setBucketName(...)` | `endpoint(...)`, `bucket(...)` (prefix 없음) |
| 응답 클래스 suffix | `*Result` (예: `PutObjectResult`) | `*Response` (예: `PutObjectResponse`) |
| 요청/응답 객체 | 가변 (mutable setter) | **Immutable** builder 패턴 강제 |
| 비동기 지원 | 일부 서비스만, `Future` 기반 | **모든 서비스 Async 기본**, `CompletableFuture` 반환 |
| HTTP 클라이언트 | Apache 고정 | 교체 가능 (Apache / URL Conn / Netty / CRT) |
| 자원 해제 | 보통 불필요 (일부 close) | 모든 클라이언트가 `AutoCloseable`, **반드시 `close()`** |
| 예외 | `AmazonServiceException` 계열 | `SdkException` → `AwsServiceException` → `S3Exception` |
| 자격 증명 | `DefaultAWSCredentialsProviderChain` | `DefaultCredentialsProvider` (chain 순서 일부 변경) |
| 생명 주기 | 2025-12-31 end-of-support | 공식 지원 중 |

### 코드 비교

```java
// v1
AmazonS3 s3v1 = AmazonS3ClientBuilder.standard()
    .withRegion(Regions.AP_NORTHEAST_2)
    .build();
PutObjectResult r1 = s3v1.putObject("bucket", "key", new File("a.txt"));

// v2
S3Client s3v2 = S3Client.builder()
    .region(Region.AP_NORTHEAST_2)
    .build();
PutObjectResponse r2 = s3v2.putObject(
    PutObjectRequest.builder().bucket("bucket").key("key").build(),
    RequestBody.fromFile(Paths.get("a.txt"))
);
s3v2.close();   // v2는 반드시 close
```

---

## 3. 자격 증명 (Credentials)

### 3.1 기본: `DefaultCredentialsProvider`

빌더에서 `credentialsProvider(...)`를 지정하지 않으면 자동으로 사용된다. 아래 순서로 조회한다 (v2 기준).

```
1. SystemPropertyCredentialsProvider
   aws.accessKeyId, aws.secretAccessKey, (aws.sessionToken)
2. EnvironmentVariableCredentialsProvider
   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, (AWS_SESSION_TOKEN)
3. WebIdentityTokenFileCredentialsProvider
   AWS_WEB_IDENTITY_TOKEN_FILE (EKS IRSA)
4. ProfileCredentialsProvider
   ~/.aws/credentials (default 프로필)
5. ContainerCredentialsProvider
   ECS 작업 역할 (AWS_CONTAINER_CREDENTIALS_RELATIVE_URI)
6. InstanceProfileCredentialsProvider
   EC2 IMDS (인스턴스 역할)
```

가장 먼저 "모든 필수 설정을 찾은" provider가 체인을 종료한다.

### 3.2 provider 명시적 지정

```java
import software.amazon.awssdk.auth.credentials.*;

// 기본 체인 (명시)
S3Client.builder()
    .region(Region.AP_NORTHEAST_2)
    .credentialsProvider(DefaultCredentialsProvider.create())
    .build();

// 환경 변수만
S3Client.builder()
    .credentialsProvider(EnvironmentVariableCredentialsProvider.create())
    .build();

// 특정 프로필
S3Client.builder()
    .credentialsProvider(ProfileCredentialsProvider.create("myprofile"))
    .build();

// Static (테스트·로컬 전용, 하드코딩 절대 금지)
AwsBasicCredentials creds = AwsBasicCredentials.create(accessKey, secretKey);
S3Client.builder()
    .credentialsProvider(StaticCredentialsProvider.create(creds))
    .build();

// EC2/ECS 역할 강제 (체인 우회)
S3Client.builder()
    .credentialsProvider(InstanceProfileCredentialsProvider.create())
    .build();
```

### 3.3 베스트 프랙티스

- 프로덕션에서는 **IAM Role(EC2 Instance Profile, ECS Task Role, EKS IRSA)** 사용. 액세스 키는 피한다.
- 액세스 키를 파일·코드에 직접 쓰지 않는다. 환경 변수·Secrets Manager·Parameter Store 경유.
- `StaticCredentialsProvider`는 단위 테스트(Localstack 등)에서만 사용.

---

## 4. S3Client (동기)

### 4.1 클라이언트 생성·관리

```java
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

S3Client s3 = S3Client.builder()
    .region(Region.AP_NORTHEAST_2)
    .build();
```

**핵심 원칙 (공식 Best Practices 기반):**
- S3Client는 **thread-safe**이며 **애플리케이션 수명 동안 싱글톤**으로 재사용한다.
- 각 클라이언트가 HTTP 커넥션 풀을 소유하므로 남발하면 자원 낭비다.
- Spring에서는 `@Bean(destroyMethod = "close")`로 앱 종료 시 close.
- **메서드마다 try-with-resources로 만들고 close하는 패턴은 금지** — 풀이 매번 새로 생성된다.

### 4.2 업로드 (PutObject)

```java
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

PutObjectRequest req = PutObjectRequest.builder()
    .bucket("my-bucket")
    .key("images/photo.jpg")
    .contentType("image/jpeg")
    .metadata(Map.of("uploaded-by", "user-123"))
    .build();

// 파일
PutObjectResponse resp = s3.putObject(req, RequestBody.fromFile(Paths.get("/tmp/photo.jpg")));

// byte[]
byte[] bytes = Files.readAllBytes(Paths.get("/tmp/photo.jpg"));
s3.putObject(req, RequestBody.fromBytes(bytes));

// InputStream (길이 필수)
try (InputStream in = multipartFile.getInputStream()) {
    s3.putObject(req, RequestBody.fromInputStream(in, multipartFile.getSize()));
}

// String
s3.putObject(
    PutObjectRequest.builder().bucket("b").key("hello.txt").contentType("text/plain").build(),
    RequestBody.fromString("hello world")
);
```

> 주의: `RequestBody.fromInputStream(in, length)`의 `length`는 **실제 바이트 수**이다. 잘못 주면 업로드가 실패하거나 잘린다. 길이를 모른다면 임시 파일에 내려받거나 Transfer Manager(멀티파트)를 사용한다.

### 4.3 다운로드 (GetObject)

```java
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

GetObjectRequest getReq = GetObjectRequest.builder()
    .bucket("my-bucket")
    .key("images/photo.jpg")
    .build();

// 1) InputStream 스트리밍
try (ResponseInputStream<GetObjectResponse> in = s3.getObject(getReq)) {
    GetObjectResponse meta = in.response();
    String contentType = meta.contentType();
    in.transferTo(outputStream);
}

// 2) byte[]로 한 번에
byte[] data = s3.getObjectAsBytes(getReq).asByteArray();

// 3) 파일로 저장
s3.getObject(getReq, Paths.get("/tmp/photo.jpg"));
```

### 4.4 삭제·헤드·목록

```java
import software.amazon.awssdk.services.s3.model.*;

// 삭제
s3.deleteObject(DeleteObjectRequest.builder()
    .bucket("my-bucket").key("images/photo.jpg").build());

// 존재/메타 확인
try {
    HeadObjectResponse head = s3.headObject(HeadObjectRequest.builder()
        .bucket("my-bucket").key("images/photo.jpg").build());
    long size = head.contentLength();
} catch (NoSuchKeyException e) {
    // 키 없음
}

// 리스트 (v2는 ListObjectsV2 권장, 자동 페이징 지원)
ListObjectsV2Request listReq = ListObjectsV2Request.builder()
    .bucket("my-bucket").prefix("images/").maxKeys(1000).build();

s3.listObjectsV2Paginator(listReq).contents().forEach(obj ->
    System.out.println(obj.key() + " " + obj.size())
);
```

---

## 5. S3AsyncClient (비동기)

### 5.1 기본 비동기 클라이언트 (Netty)

```xml
<!-- 비동기 클라이언트 사용 시 netty-nio-client를 의존성에 추가 -->
<dependency>
  <groupId>software.amazon.awssdk</groupId>
  <artifactId>netty-nio-client</artifactId>
</dependency>
```

```java
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.core.async.AsyncResponseTransformer;

S3AsyncClient s3Async = S3AsyncClient.builder()
    .region(Region.AP_NORTHEAST_2)
    .build();

CompletableFuture<PutObjectResponse> putF = s3Async.putObject(
    PutObjectRequest.builder().bucket("b").key("k").build(),
    AsyncRequestBody.fromFile(Paths.get("/tmp/a.txt"))
);

putF.whenComplete((resp, err) -> {
    if (err != null) log.error("upload failed", err);
    else log.info("etag={}", resp.eTag());
});

// byte[]로 다운로드
CompletableFuture<byte[]> getF = s3Async.getObject(
    GetObjectRequest.builder().bucket("b").key("k").build(),
    AsyncResponseTransformer.toBytes()
).thenApply(r -> r.asByteArray());
```

### 5.2 CRT 기반 비동기 클라이언트 (고처리량)

CRT(Common Runtime) 기반은 멀티파트 병렬화·target throughput 튜닝을 기본 제공한다. 대용량/고처리량 워크로드에 권장된다.

```java
S3AsyncClient crtAsync = S3AsyncClient.crtBuilder()
    .region(Region.AP_NORTHEAST_2)
    .targetThroughputInGbps(20.0)
    .minimumPartSizeInBytes(8L * 1024 * 1024)
    .build();
```

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
