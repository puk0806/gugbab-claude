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

## 6. S3 Presigned URL (S3Presigner)

브라우저/모바일 클라이언트가 서버를 거치지 않고 직접 S3에 업로드·다운로드하게 하는 용도. 서버는 서명된 URL만 발급한다.

```java
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.*;

S3Presigner presigner = S3Presigner.builder()
    .region(Region.AP_NORTHEAST_2)
    .build();

// 6.1 업로드용 (PUT)
PutObjectRequest putObjectRequest = PutObjectRequest.builder()
    .bucket("my-bucket")
    .key("uploads/temp.jpg")
    .contentType("image/jpeg")
    .build();

PutObjectPresignRequest presignPut = PutObjectPresignRequest.builder()
    .signatureDuration(Duration.ofMinutes(10))
    .putObjectRequest(putObjectRequest)
    .build();

PresignedPutObjectRequest presignedPut = presigner.presignPutObject(presignPut);
URL uploadUrl = presignedPut.url();
// 클라이언트는 이 URL로 HTTP PUT 요청

// 6.2 다운로드용 (GET)
GetObjectRequest getObjectRequest = GetObjectRequest.builder()
    .bucket("my-bucket").key("uploads/temp.jpg").build();

GetObjectPresignRequest presignGet = GetObjectPresignRequest.builder()
    .signatureDuration(Duration.ofMinutes(5))
    .getObjectRequest(getObjectRequest)
    .build();

PresignedGetObjectRequest presignedGet = presigner.presignGetObject(presignGet);
URL downloadUrl = presignedGet.url();

// 6.3 브라우저 실행 가능 여부 체크 (일부 옵션은 브라우저 PUT 호환 불가)
if (!presignedPut.isBrowserExecutable()) {
    // Content-MD5 등의 헤더가 필요한 경우 브라우저로는 업로드 불가
}

// 앱 종료 시
presigner.close();
```

**핵심 포인트 (공식 문서):**
- `S3Presigner` 생성 비용이 크므로 **애플리케이션 시작 시 1회 생성**해 재사용한다.
- 종료 시 `close()` — 일부 자격 증명 provider가 자원(쓰레드)을 점유한다.
- 서명 유효기간(`signatureDuration`) 최대 7일 (SigV4 제한).

---

## 7. S3 Transfer Manager (v2 신규)

대용량 파일 멀티파트 병렬 업로드/다운로드, 디렉터리 전송, 진행률 리스너를 고수준 API로 제공한다.

```java
import software.amazon.awssdk.transfer.s3.S3TransferManager;
import software.amazon.awssdk.transfer.s3.model.*;
import software.amazon.awssdk.transfer.s3.progress.LoggingTransferListener;

// CRT 기반 비동기 클라이언트 권장
S3AsyncClient crt = S3AsyncClient.crtBuilder()
    .region(Region.AP_NORTHEAST_2)
    .targetThroughputInGbps(20.0)
    .minimumPartSizeInBytes(8L * 1024 * 1024)
    .build();

S3TransferManager tm = S3TransferManager.builder()
    .s3Client(crt)
    .build();

// 7.1 파일 업로드
UploadFileRequest uploadReq = UploadFileRequest.builder()
    .putObjectRequest(r -> r.bucket("my-bucket").key("big.zip"))
    .source(Paths.get("/tmp/big.zip"))
    .addTransferListener(LoggingTransferListener.create())
    .build();

FileUpload upload = tm.uploadFile(uploadReq);
CompletedFileUpload done = upload.completionFuture().join();
log.info("etag={}", done.response().eTag());

// 7.2 파일 다운로드
DownloadFileRequest downloadReq = DownloadFileRequest.builder()
    .getObjectRequest(r -> r.bucket("my-bucket").key("big.zip"))
    .destination(Paths.get("/tmp/big-download.zip"))
    .build();

tm.downloadFile(downloadReq).completionFuture().join();

// 7.3 디렉터리 업로드
UploadDirectoryRequest dirReq = UploadDirectoryRequest.builder()
    .source(Paths.get("/tmp/mydir"))
    .bucket("my-bucket")
    .s3Prefix("backup/")
    .build();

tm.uploadDirectory(dirReq).completionFuture().join();

tm.close();
crt.close();
```

> 주의: Transfer Manager 자체도 `AutoCloseable`이다. 싱글톤으로 쓰고 앱 종료 시에만 close.

---

## 8. Rekognition

### 8.1 클라이언트

```java
import software.amazon.awssdk.services.rekognition.RekognitionClient;

RekognitionClient rek = RekognitionClient.builder()
    .region(Region.AP_NORTHEAST_2)
    .build();
```

### 8.2 DetectFaces

```java
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.rekognition.model.*;

// 옵션 A: S3 객체 지정
Image s3Image = Image.builder()
    .s3Object(S3Object.builder().bucket("my-bucket").name("faces/a.jpg").build())
    .build();

// 옵션 B: 로컬 바이트 직접 전달 (5 MiB 이하)
byte[] bytes = Files.readAllBytes(Paths.get("/tmp/a.jpg"));
Image localImage = Image.builder()
    .bytes(SdkBytes.fromByteArray(bytes))
    .build();

DetectFacesRequest req = DetectFacesRequest.builder()
    .image(s3Image)
    .attributes(Attribute.ALL)     // AGE_RANGE, EMOTIONS, SMILE 등 전체 속성
    .build();

DetectFacesResponse resp = rek.detectFaces(req);

for (FaceDetail face : resp.faceDetails()) {
    AgeRange age = face.ageRange();
    System.out.printf("age=%d-%d smile=%s confidence=%.2f%n",
        age.low(), age.high(), face.smile().value(), face.confidence());
}
```

### 8.3 DetectLabels

```java
DetectLabelsRequest labelReq = DetectLabelsRequest.builder()
    .image(s3Image)
    .maxLabels(20)
    .minConfidence(80F)
    .build();

DetectLabelsResponse labelResp = rek.detectLabels(labelReq);
labelResp.labels().forEach(l ->
    System.out.println(l.name() + " " + l.confidence())
);
```

### 8.4 SearchFacesByImage (얼굴 검색)

먼저 Collection 생성 + 얼굴 인덱싱이 필요하다.

```java
// (1) Collection 생성 (최초 1회)
rek.createCollection(CreateCollectionRequest.builder()
    .collectionId("my-faces").build());

// (2) 얼굴 인덱싱
IndexFacesResponse idx = rek.indexFaces(IndexFacesRequest.builder()
    .collectionId("my-faces")
    .image(s3Image)
    .externalImageId("user-42")
    .detectionAttributes(Attribute.DEFAULT)
    .build());

// (3) 이미지로 검색
SearchFacesByImageRequest searchReq = SearchFacesByImageRequest.builder()
    .collectionId("my-faces")
    .image(localImage)
    .faceMatchThreshold(80F)
    .maxFaces(5)
    .build();

SearchFacesByImageResponse searchResp = rek.searchFacesByImage(searchReq);
for (FaceMatch match : searchResp.faceMatches()) {
    System.out.printf("faceId=%s similarity=%.2f externalId=%s%n",
        match.face().faceId(),
        match.similarity(),
        match.face().externalImageId());
}
```

> 주의: Rekognition은 지역별 엔드포인트가 다르다. Seoul(`ap-northeast-2`)에서 사용 가능한 기능과 Tokyo·N. Virginia 간 기능 차이가 있을 수 있으므로 공식 Region 지원표 확인이 필요하다.

---

## 9. 예외 처리

### 9.1 계층

```
SdkException (모든 예외의 base, unchecked RuntimeException)
 ├─ SdkClientException         // 클라이언트 측 오류 (네트워크, 자격 증명 등)
 └─ SdkServiceException        // 서비스 측 오류 (HTTP 4xx/5xx)
     └─ AwsServiceException
         └─ S3Exception        // S3 전용
         └─ RekognitionException
```

### 9.2 권장 패턴

```java
import software.amazon.awssdk.core.exception.*;
import software.amazon.awssdk.awscore.exception.AwsServiceException;
import software.amazon.awssdk.services.s3.model.*;

try {
    s3.getObject(GetObjectRequest.builder().bucket(b).key(k).build());
} catch (NoSuchKeyException e) {
    // 404 — 키 없음 (S3 서비스 전용 exception)
    throw new NotFoundException("key not found: " + k);
} catch (S3Exception e) {
    // S3 서비스 오류 (403, 500 등)
    log.error("S3 error: code={} status={} requestId={}",
        e.awsErrorDetails().errorCode(),
        e.statusCode(),
        e.requestId(), e);
    throw e;
} catch (SdkClientException e) {
    // 네트워크·자격 증명·타임아웃 등
    log.error("SDK client error", e);
    throw e;
}
```

### 9.3 재시도

v2는 기본적으로 **throttling·5xx·일부 네트워크 오류에 대해 재시도**(기본 3회, exponential backoff)를 수행한다. 커스터마이징:

```java
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.core.retry.RetryPolicy;

S3Client.builder()
    .overrideConfiguration(ClientOverrideConfiguration.builder()
        .retryPolicy(RetryPolicy.builder().numRetries(5).build())
        .apiCallTimeout(Duration.ofSeconds(30))
        .apiCallAttemptTimeout(Duration.ofSeconds(10))
        .build())
    .build();
```

---

## 10. Spring Boot 3.x 통합

### 10.1 직접 Bean 등록 (권장, 의존성 최소)

```java
@Configuration
public class AwsConfig {

    @Value("${aws.region:ap-northeast-2}")
    private String region;

    @Bean(destroyMethod = "close")
    public S3Client s3Client() {
        return S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(DefaultCredentialsProvider.create())
            .build();
    }

    @Bean(destroyMethod = "close")
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
            .region(Region.of(region))
            .build();
    }

    @Bean(destroyMethod = "close")
    public RekognitionClient rekognitionClient() {
        return RekognitionClient.builder()
            .region(Region.of(region))
            .build();
    }
}
```

`destroyMethod = "close"`가 핵심이다. 누락하면 앱 종료 시 HTTP 커넥션 풀·쓰레드가 해제되지 않는다.

### 10.2 Spring Cloud AWS starter 사용

| 대상 Spring Boot | Spring Cloud AWS 버전 |
|------------------|----------------------|
| 3.4.x            | 3.3.x                |
| 3.5.x            | 3.4.x (최신 지원)     |
| 4.0.x            | 4.0.x                |

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>io.awspring.cloud</groupId>
      <artifactId>spring-cloud-aws-dependencies</artifactId>
      <version>3.4.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

<dependency>
  <groupId>io.awspring.cloud</groupId>
  <artifactId>spring-cloud-aws-starter-s3</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    aws:
      region:
        static: ap-northeast-2
      credentials:
        profile:
          name: default
      s3:
        endpoint: http://localhost:4566  # LocalStack 로컬 개발 시
```

starter를 쓰면 `S3Client`·`S3Template`·`S3Presigner` 등이 자동 구성된다. Rekognition에는 공식 전용 starter가 없으므로 직접 Bean 등록이 필요하다.

> 주의: Spring Cloud AWS 버전 매트릭스는 업스트림에서 빠르게 변경된다. 실제 프로젝트 적용 전 공식 README 릴리스 노트 재확인 필요.

### 10.3 비교

| 기준 | 직접 Bean | Spring Cloud AWS |
|------|-----------|------------------|
| 의존성 크기 | 최소 | 중간 |
| 자동 구성 | 직접 작성 | `spring.cloud.aws.*` 프로퍼티로 주입 |
| `S3Template` 고수준 API | X | ✅ 제공 |
| 버전 lock-in | 없음 | Spring Cloud AWS 릴리스 주기 추종 필요 |
| 권장 상황 | 특정 서비스 몇 개만 쓸 때 | SQS/SNS/Secrets Manager 등 폭넓게 쓸 때 |

---

## 11. v1 → v2 마이그레이션

### 11.1 공식 마이그레이션 도구 (OpenRewrite 기반)

AWS에서 OpenRewrite 기반 **공식 마이그레이션 도구**를 제공한다. GA 상태이며 S3 Transfer Manager 포함 대부분의 서비스 클라이언트를 자동 변환한다.

**Maven 실행:**

```bash
mvn org.openrewrite.maven:rewrite-maven-plugin:run \
  -Drewrite.recipeArtifactCoordinates=software.amazon.awssdk:v2-migration:LATEST \
  -Drewrite.activeRecipes=software.amazon.awssdk.v2migration.AwsSdkJavaV1ToV2
```

**Gradle 실행:**

```bash
# build.gradle에 rewrite 플러그인 및 recipe 의존성 추가 후
gradle rewriteDryRun        # 변경 사항 미리보기
gradle rewriteRun           # 실제 적용
```

### 11.2 자동 변환 대상

- 패키지 import (`com.amazonaws.*` → `software.amazon.awssdk.*`)
- 클라이언트 빌더 (`AmazonS3ClientBuilder.standard().build()` → `S3Client.builder().build()`)
- 요청/응답 객체의 setter → builder 변환
- S3 Transfer Manager high-level API

### 11.3 수동 처리가 필요한 영역

- v1 `DynamoDBMapper` → v2 `Enhanced DynamoDB Client`: **자동 변환 미지원**
- 사용자 정의 Retry 정책, 인터셉터
- v1 전용 feature (예: 일부 Legacy S3 settings)

---

## 12. 흔한 실수

### 실수 1: `close()` 누락 → 리소스 누수

```java
// ❌ 요청마다 생성하고 닫지 않음 → 커넥션 풀 누수
public void upload(byte[] data) {
    S3Client s3 = S3Client.builder().region(Region.AP_NORTHEAST_2).build();
    s3.putObject(...);
    // s3.close() 누락
}

// ✅ 싱글톤 (Spring Bean, destroyMethod="close")
@Bean(destroyMethod = "close")
S3Client s3Client() { ... }
```

### 실수 2: 매 호출마다 try-with-resources

```java
// ❌ 매번 새 클라이언트 + close → 성능 재앙
public byte[] get(String key) {
    try (S3Client s3 = S3Client.builder().build()) {
        return s3.getObjectAsBytes(req).asByteArray();
    }
}

// ✅ 싱글톤 공유, close는 앱 종료 시만
```

### 실수 3: Region 미지정

```java
// ❌ region이 없으면 RegionProviderChain을 거치며, 찾지 못하면 SdkClientException
S3Client.builder().build();

// ✅ 명시적 지정 또는 환경변수 AWS_REGION / ~/.aws/config 설정
S3Client.builder().region(Region.AP_NORTHEAST_2).build();
```

### 실수 4: `RequestBody.fromString` vs `fromFile` 혼동

```java
// ❌ 파일 경로 문자열을 그대로 본문으로 업로드 — 텍스트로 저장됨
s3.putObject(req, RequestBody.fromString("/tmp/a.jpg"));

// ✅ 실제 파일 업로드
s3.putObject(req, RequestBody.fromFile(Paths.get("/tmp/a.jpg")));
```

### 실수 5: `fromInputStream` length 잘못 지정

```java
// ❌ length가 실제 바이트 수와 다름 → 잘리거나 실패
s3.putObject(req, RequestBody.fromInputStream(in, 1024));

// ✅ MultipartFile.getSize() 등 실제 값 사용
s3.putObject(req, RequestBody.fromInputStream(in, multipartFile.getSize()));
```

### 실수 6: v1 패키지 import 혼용

```java
// ❌ 같은 프로젝트에서 v1·v2 패키지를 섞어 쓰다가 타입 불일치
import com.amazonaws.services.s3.model.PutObjectRequest; // v1
import software.amazon.awssdk.services.s3.S3Client;      // v2

// ✅ 프로젝트 전체를 v2로 통일. 부득이한 경우 side-by-side 가이드 참조
```

### 실수 7: `S3Presigner`를 매 요청마다 생성

```java
// ❌ 생성 비용이 큼 (공식 문서 명시)
public URL sign(String key) {
    try (S3Presigner p = S3Presigner.create()) { ... }
}

// ✅ 싱글톤 Bean
```

### 실수 8: Rekognition 이미지 크기 제한

- `Image.bytes()`로 직접 전달: **5 MiB 이하**
- S3Object 지정: **최대 15 MiB** (JPEG/PNG)
- 초과 시 `ImageTooLargeException` 발생. 큰 이미지는 S3에 먼저 올린 뒤 `S3Object` 참조.

### 실수 9: Transfer Manager를 기본 `S3AsyncClient`와 사용

Transfer Manager는 CRT 기반 `S3AsyncClient.crtBuilder()`를 **강하게 권장**한다. Netty 기반으로도 동작하나 멀티파트 성능·메모리 특성이 다르다.

### 실수 10: 자격 증명 하드코딩

```java
// ❌ 보안 위반
StaticCredentialsProvider.create(AwsBasicCredentials.create("AKIA...", "secret..."));

// ✅ IAM Role / 환경 변수 / Secrets Manager
DefaultCredentialsProvider.create();
```

---

## 13. 체크리스트

- [ ] `software.amazon.awssdk:bom` 최신 버전(2.42.x+) 사용
- [ ] `region()` 명시
- [ ] 클라이언트는 싱글톤, `@Bean(destroyMethod = "close")`
- [ ] 프로덕션은 IAM Role, 액세스 키 하드코딩 없음
- [ ] `PutObjectRequest.contentType()` 지정
- [ ] InputStream 업로드 시 실제 `length` 전달
- [ ] `S3Presigner`도 Bean으로 재사용, 종료 시 close
- [ ] 대용량은 Transfer Manager + CRT 클라이언트 조합
- [ ] `NoSuchKeyException`·`S3Exception`·`SdkClientException` 계층으로 catch
- [ ] Rekognition 이미지 ≤ 5 MiB는 bytes, 초과는 S3Object
- [ ] v1 의존성 남아있지 않은지 `mvn dependency:tree`로 확인
