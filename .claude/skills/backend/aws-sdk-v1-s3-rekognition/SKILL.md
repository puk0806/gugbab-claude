---
name: aws-sdk-v1-s3-rekognition
description: AWS SDK for Java v1 (1.12.x) S3 + Rekognition 레거시 사용 가이드 - 의존성·BOM, 자격 증명 체인, S3 업로드/다운로드/presigned URL/TransferManager, Rekognition DetectFaces/Labels/Moderation/CompareFaces, 예외 처리, Spring Boot 2.5 통합, v2 마이그레이션 비교
---

# AWS SDK for Java v1 — S3 + Rekognition (Legacy)

> 소스: https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/welcome.html | https://github.com/aws/aws-sdk-java | https://aws.amazon.com/blogs/developer/announcing-end-of-support-for-aws-sdk-for-java-v1-x-on-december-31-2025/ | https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/migration-whats-different.html
> 검증일: 2026-04-23

> **주의 (EOL):** AWS SDK for Java v1.x는 **2024-07-31부터 maintenance mode**, **2025-12-31에 end-of-support**에 도달했습니다. 이후로는 보안 패치 포함 어떤 업데이트도 제공되지 않으며, 기존 아티팩트는 Maven Central에 그대로 남습니다. 신규 프로젝트는 **반드시 v2(`software.amazon.awssdk`)를 사용**하고, 이 스킬은 **기존 v1 코드베이스 유지·점진적 마이그레이션용**으로만 참조하세요. AWS는 OpenRewrite 기반의 v2 마이그레이션 도구를 제공합니다.

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

### 환경별 권장 전략

| 환경 | 권장 Provider | 비고 |
|------|---------------|------|
| 로컬 개발 | `ProfileCredentialsProvider("dev")` 또는 환경변수 | AWS access key를 코드에 하드코딩 금지 |
| EC2 | IAM Instance Profile (자동) | `DefaultAWSCredentialsProviderChain` 그대로 |
| ECS / Fargate | IAM Task Role (자동) | `DefaultAWSCredentialsProviderChain` 그대로 |
| EKS | IRSA (Web Identity) | `DefaultAWSCredentialsProviderChain` 그대로 |
| 온프레미스 | `STSAssumeRoleSessionCredentialsProvider` 또는 장기 access key | 가능하면 IAM Roles Anywhere 검토 |

### 명시적 provider 지정

```java
// 프로파일 명시
AWSCredentialsProvider provider = new ProfileCredentialsProvider("dev");

// 환경변수만
AWSCredentialsProvider provider = new EnvironmentVariableCredentialsProvider();

// 정적 키 (테스트/CI에서만, 프로덕션 금지)
AWSCredentialsProvider provider = new AWSStaticCredentialsProvider(
    new BasicAWSCredentials(accessKey, secretKey));
```

> 주의: `AWSStaticCredentialsProvider`로 장기 access key를 프로덕션에 쓰지 않는다. 반드시 IAM Role 기반으로 전환.

---

## S3 Client — 기본 사용

### Spring Bean 등록 (권장)

AmazonS3 클라이언트는 **생성 비용이 크고 thread-safe**이므로 애플리케이션 전역에 싱글턴으로 1개만 생성해 재사용한다.

```java
package com.example.config;

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.rekognition.AmazonRekognition;
import com.amazonaws.services.rekognition.AmazonRekognitionClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.transfer.TransferManager;
import com.amazonaws.services.s3.transfer.TransferManagerBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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

### 기본 객체 연산

```java
@Service
@RequiredArgsConstructor
public class S3Service {

    private final AmazonS3 amazonS3;

    // PUT (로컬 File)
    public void upload(String bucket, String key, File file) {
        amazonS3.putObject(bucket, key, file);
    }

    // PUT (InputStream + metadata)
    public void upload(String bucket, String key, InputStream in, long contentLength, String contentType) {
        ObjectMetadata md = new ObjectMetadata();
        md.setContentLength(contentLength);           // InputStream 업로드 시 필수
        md.setContentType(contentType);
        amazonS3.putObject(new PutObjectRequest(bucket, key, in, md));
    }

    // GET (바이트로)
    public byte[] download(String bucket, String key) throws IOException {
        try (S3Object obj = amazonS3.getObject(bucket, key);
             S3ObjectInputStream in = obj.getObjectContent()) {
            return in.readAllBytes();
        }
    }

    // DELETE
    public void delete(String bucket, String key) {
        amazonS3.deleteObject(bucket, key);
    }

    // 존재 확인
    public boolean exists(String bucket, String key) {
        return amazonS3.doesObjectExist(bucket, key);
    }
}
```

> 주의: `InputStream` 업로드 시 `ContentLength`를 지정하지 않으면 SDK가 전체 데이터를 메모리에 버퍼링한 뒤 업로드하여 대용량에서 OOM을 일으킬 수 있다. 길이가 확정된 스트림은 항상 metadata에 길이를 세팅한다.

> 주의: `S3Object`는 `Closeable`이다. `getObjectContent()`로 얻은 스트림을 소비한 뒤 반드시 닫지 않으면 **커넥션 풀 고갈**로 이어진다 (`Not all bytes were read from the S3ObjectInputStream` 경고 발생).

---

## S3 Presigned URL — GET / PUT

### PUT 업로드용 (클라이언트 직접 업로드)

```java
public URL presignPut(String bucket, String key, Duration ttl, String contentType) {
    Date expiration = new Date(System.currentTimeMillis() + ttl.toMillis());
    GeneratePresignedUrlRequest req =
        new GeneratePresignedUrlRequest(bucket, key)
            .withMethod(HttpMethod.PUT)
            .withExpiration(expiration);
    req.setContentType(contentType);   // Content-Type을 서명에 포함시키려면
    return amazonS3.generatePresignedUrl(req);
}
```

- 클라이언트는 이 URL에 **동일한 HTTP 메서드(PUT)와 동일한 헤더**(`Content-Type` 등)로 요청해야 서명이 유효
- 만료시간은 최대 7일 (SigV4 기준)

### GET 다운로드용 (일시 공유 링크)

```java
public URL presignGet(String bucket, String key, Duration ttl) {
    Date expiration = new Date(System.currentTimeMillis() + ttl.toMillis());
    GeneratePresignedUrlRequest req =
        new GeneratePresignedUrlRequest(bucket, key)
            .withMethod(HttpMethod.GET)
            .withExpiration(expiration);
    return amazonS3.generatePresignedUrl(req);
}
```

> 주의: presigned URL 발급 시점의 자격 증명이 만료되면 URL도 무효화된다. IAM Role로 받은 **임시 자격 증명**은 URL 만료 기간보다 먼저 만료될 수 있으니 장기 공유에는 적합하지 않다.

---

## 대용량 파일 — TransferManager로 Multipart Upload

`AmazonS3.putObject()`는 단일 PUT이므로 수백 MB~GB 급 파일에는 부적합하다. `TransferManager`는 자동으로 multipart upload로 분할하고 병렬 전송·재시도를 처리한다.

### 기본 사용

```java
@Service
@RequiredArgsConstructor
public class LargeFileUploadService {

    private final TransferManager transferManager;

    public void uploadLarge(String bucket, String key, File file) throws InterruptedException {
        Upload upload = transferManager.upload(bucket, key, file);
        upload.waitForCompletion();   // 블로킹 대기. 실패 시 AmazonClientException
    }

    public void uploadWithProgress(String bucket, String key, File file) throws InterruptedException {
        Upload upload = transferManager.upload(bucket, key, file);
        upload.addProgressListener((ProgressListener) event ->
            log.info("transferred: {} bytes", event.getBytesTransferred()));
        upload.waitForCompletion();
    }
}
```

### multipart 임계값/파트 크기 조정

```java
@Bean(destroyMethod = "shutdownNow")
public TransferManager transferManager(AmazonS3 amazonS3) {
    return TransferManagerBuilder.standard()
        .withS3Client(amazonS3)
        .withMultipartUploadThreshold(16L * 1024 * 1024)   // 16MB 이상은 multipart
        .withMinimumUploadPartSize(8L * 1024 * 1024)       // 파트 크기 8MB
        .build();
}
```

- 기본값은 16MB 임계값, 5MB 파트. 파트 크기를 너무 작게 잡으면 파트 수(최대 10,000)를 초과하거나 오히려 느려진다.
- `TransferManager`도 내부적으로 `AmazonS3` 하나를 공유하므로 위의 Bean 패턴을 재사용한다.

---

## S3 이벤트 알림 수신 (SQS / SNS)

S3 버킷에 이벤트 알림(`s3:ObjectCreated:*` 등)을 구성하면 SQS Queue 또는 SNS Topic으로 메시지가 전달된다. Java 쪽은 **SQS에서 polling**하거나 **SNS 구독 endpoint에서 수신**한다.

### SQS Polling 예 (SDK v1 기준)

```xml
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-sqs</artifactId>
</dependency>
```

```java
AmazonSQS sqs = AmazonSQSClientBuilder.standard()
    .withRegion(Regions.AP_NORTHEAST_2)
    .build();

String queueUrl = sqs.getQueueUrl("s3-events-queue").getQueueUrl();

ReceiveMessageRequest req = new ReceiveMessageRequest(queueUrl)
    .withMaxNumberOfMessages(10)
    .withWaitTimeSeconds(20);          // long polling

List<Message> messages = sqs.receiveMessage(req).getMessages();
for (Message m : messages) {
    // m.getBody()는 S3 이벤트 JSON (Records[].s3.bucket.name, s3.object.key 등)
    processS3Event(m.getBody());
    sqs.deleteMessage(queueUrl, m.getReceiptHandle());
}
```

S3 이벤트 메시지 포맷은 `{"Records":[{"s3":{"bucket":{"name":...},"object":{"key":...}}}]}`. 실제 파싱은 Jackson으로.

---

## Rekognition — 기본 사용

### Client 생성 (위의 Bean 재사용)

```java
@Service
@RequiredArgsConstructor
public class RekognitionService {
    private final AmazonRekognition amazonRekognition;
}
```

### 1) DetectFaces — 얼굴 검출 + 속성

```java
public DetectFacesResult detectFaces(String bucket, String key) {
    DetectFacesRequest req = new DetectFacesRequest()
        .withImage(new Image().withS3Object(
            new S3Object().withBucket(bucket).withName(key)))
        .withAttributes(Attribute.ALL);   // 나이/감정/선글라스 등 모든 속성

    return amazonRekognition.detectFaces(req);
    // result.getFaceDetails() → 얼굴 목록. 각 FaceDetail에 BoundingBox, Confidence, AgeRange, Emotions 등
}
```

### 2) DetectLabels — 이미지 내 객체/장면 라벨

```java
public List<Label> detectLabels(String bucket, String key) {
    DetectLabelsRequest req = new DetectLabelsRequest()
        .withImage(new Image().withS3Object(
            new S3Object().withBucket(bucket).withName(key)))
        .withMaxLabels(20)
        .withMinConfidence(75f);          // 신뢰도 75% 이상만

    return amazonRekognition.detectLabels(req).getLabels();
}
```

### 3) DetectModerationLabels — 부적절 콘텐츠 검출

```java
public List<ModerationLabel> detectModeration(String bucket, String key) {
    DetectModerationLabelsRequest req = new DetectModerationLabelsRequest()
        .withImage(new Image().withS3Object(
            new S3Object().withBucket(bucket).withName(key)))
        .withMinConfidence(70f);

    return amazonRekognition.detectModerationLabels(req).getModerationLabels();
    // 예: "Explicit Nudity", "Violence" 등 카테고리와 Confidence 반환
}
```

### 4) CompareFaces — 두 얼굴 비교

```java
public List<CompareFacesMatch> compareFaces(
        String srcBucket, String srcKey, String tgtBucket, String tgtKey) {

    CompareFacesRequest req = new CompareFacesRequest()
        .withSourceImage(new Image().withS3Object(
            new S3Object().withBucket(srcBucket).withName(srcKey)))
        .withTargetImage(new Image().withS3Object(
            new S3Object().withBucket(tgtBucket).withName(tgtKey)))
        .withSimilarityThreshold(80f);

    return amazonRekognition.compareFaces(req).getFaceMatches();
    // FaceMatch.getSimilarity() 와 FaceMatch.getFace() 의 BoundingBox
}
```

### 5) IndexFaces / SearchFacesByImage — Face Collection 기반 검색

```java
// 1회 수행: collection 생성
amazonRekognition.createCollection(
    new CreateCollectionRequest().withCollectionId("users-v1"));

// 얼굴 등록
IndexFacesResult idx = amazonRekognition.indexFaces(
    new IndexFacesRequest()
        .withCollectionId("users-v1")
        .withImage(new Image().withS3Object(
            new S3Object().withBucket(bucket).withName(key)))
        .withExternalImageId("user-123")
        .withDetectionAttributes("DEFAULT")
        .withMaxFaces(1)
        .withQualityFilter(QualityFilter.AUTO));

// 검색
SearchFacesByImageResult res = amazonRekognition.searchFacesByImage(
    new SearchFacesByImageRequest()
        .withCollectionId("users-v1")
        .withImage(new Image().withS3Object(
            new S3Object().withBucket(bucket).withName(key)))
        .withFaceMatchThreshold(85f)
        .withMaxFaces(5));
// res.getFaceMatches() → 각 FaceMatch의 Similarity, Face.ExternalImageId
```

### S3 이미지 vs 바이트 업로드

- **S3Object 방식** (권장): S3에 이미 올라간 파일을 참조. 네트워크 효율적이고 큰 파일에 유리
- **Bytes 방식**: `new Image().withBytes(ByteBuffer.wrap(bytes))` — 5MB 이하 권장, 간단한 경우에만

> 주의: Rekognition은 이미지 **최대 15MB (S3)** / **5MB (bytes)**, 형식은 JPEG/PNG만 지원.

---

## 에러 처리

### 예외 계층

```
RuntimeException
  └── AmazonClientException              (클라이언트 측: 네트워크, 파싱 등)
        └── AmazonServiceException        (서비스 측: 4xx/5xx 응답)
              ├── AmazonS3Exception
              └── AmazonRekognitionException (DetectFaces 등의 서비스별 예외)
```

### AmazonS3Exception 처리 패턴

```java
try {
    byte[] data = s3Service.download(bucket, key);
} catch (AmazonS3Exception e) {
    int status = e.getStatusCode();              // HTTP status (404, 403, 500...)
    String code = e.getErrorCode();              // "NoSuchKey", "AccessDenied", ...
    String requestId = e.getRequestId();         // AWS 지원 요청 시 필요
    String extId = e.getExtendedRequestId();     // S3 전용 요청 ID

    if ("NoSuchKey".equals(code) || status == 404) {
        throw new ResourceNotFoundException("파일 없음: " + key);
    }
    if ("AccessDenied".equals(code) || status == 403) {
        throw new ForbiddenException("권한 없음", e);
    }
    throw new S3OperationException("S3 error (" + code + ", req=" + requestId + ")", e);
} catch (AmazonServiceException e) {
    // 기타 S3 서비스 예외 (5xx 등)
    throw new S3OperationException("S3 service error", e);
} catch (AmazonClientException e) {
    // 네트워크/타임아웃/파싱 오류
    throw new S3OperationException("S3 client error", e);
}
```

### 재시도

- SDK 자체적으로 5xx/throttling에 대해 **기본 3회 재시도**(지수 백오프) 수행
- 별도 재시도 정책을 덮어쓰려면 `ClientConfiguration.withRetryPolicy(...)`를 `ClientBuilder.withClientConfiguration()`으로 주입
- 애플리케이션 레벨에서 재시도하기 전에 반드시 **멱등성 여부**를 확인 (PUT은 멱등, POST 성격 API는 주의)

### Rekognition 대표 에러 코드

| ErrorCode | 의미 | 대응 |
|-----------|------|------|
| `InvalidImageFormatException` | JPEG/PNG가 아님 | 포맷 검증 후 재요청 |
| `ImageTooLargeException` | 크기 초과 | 리사이즈 또는 S3 경유 |
| `InvalidS3ObjectException` | S3 객체 접근 불가 | 버킷 권한/키 확인 |
| `ProvisionedThroughputExceededException` | 쓰로틀 | 백오프 후 재시도 |
| `ThrottlingException` | 요청 과다 | 백오프 후 재시도 |

---

## v1 → v2 마이그레이션 주요 차이

| 항목 | v1 (`com.amazonaws`) | v2 (`software.amazon.awssdk`) |
|------|---------------------|-------------------------------|
| 패키지 루트 | `com.amazonaws.services.s3` | `software.amazon.awssdk.services.s3` |
| 클라이언트 빌더 | `AmazonS3ClientBuilder.standard().withRegion(...).build()` | `S3Client.builder().region(Region.AP_NORTHEAST_2).build()` |
| 요청 객체 | `new DetectFacesRequest().withImage(...)` | `DetectFacesRequest.builder().image(...).build()` (불변 builder) |
| 응답 객체 | `...Result` (예: `DetectFacesResult`) | `...Response` (예: `DetectFacesResponse`) |
| 비동기 지원 | 대부분 동기만 (`AmazonS3Async`는 일부) | 전 서비스 `S3AsyncClient` 제공 (CompletableFuture 기반) |
| HTTP 클라이언트 | Apache HTTP (번들) | 플러그러블: Apache, Netty(async), URL Connection |
| 자격증명 Provider | `DefaultAWSCredentialsProviderChain` | `DefaultCredentialsProvider` |
| Region 표현 | `Regions.AP_NORTHEAST_2` (enum) | `Region.AP_NORTHEAST_2` (value class) |
| 예외 | `AmazonS3Exception` | `S3Exception` (`AwsServiceException` 하위) |
| BOM | `com.amazonaws:aws-java-sdk-bom` | `software.amazon.awssdk:bom` |
| presigned URL | `amazonS3.generatePresignedUrl(...)` | `S3Presigner.create().presignGetObject(...)` |
| TransferManager | `com.amazonaws.services.s3.transfer.TransferManager` | `S3TransferManager` (AWS CRT 기반) |

### 마이그레이션 도구

AWS 공식 **AWS SDK for Java 마이그레이션 도구**(OpenRewrite 기반)가 대부분의 v1 → v2 코드 변환을 자동화한다.

```
# OpenRewrite / Rewrite Maven Plugin
recipe: software.amazon.awssdk.v2migration.AwsSdkJavaV1ToV2
```

자동 변환 범위:
- 패키지 import 재작성 (`com.amazonaws.*` → `software.amazon.awssdk.*`)
- setter → builder 패턴 변환
- `Result` → `Response` 클래스 치환
- 클라이언트 빌더 호출 재작성

> 주의: 자동 변환 후에도 **TransferManager, presigned URL, async 호출**은 수동 조정이 필요한 경우가 많다.

---

## 흔한 실수

| 실수 | 원인 / 결과 | 수정 |
|------|-------------|------|
| S3/Rekognition 클라이언트를 매 요청마다 `newBuilder().build()` | 생성 비용 큼 (TLS/credential chain 로딩), 커넥션 풀이 새로 만들어짐 | `@Bean`으로 싱글턴 등록 후 주입 |
| region을 지정하지 않고 builder 호출 | `SdkClientException: Unable to find a region via the region provider chain` | `withRegion(Regions.AP_NORTHEAST_2)` 또는 환경변수/프로파일 설정 |
| 여러 AWS SDK 모듈에 **서로 다른 1.12.x 버전** 지정 | `aws-java-sdk-core` 충돌로 `NoSuchMethodError`, 비결정적 동작 | **BOM으로 버전 통일** |
| `InputStream` 업로드 시 `ContentLength` 미지정 | 전체 스트림 버퍼링 → OOM, 경고 로그 | `ObjectMetadata.setContentLength(...)` 또는 TransferManager 사용 |
| `getObject()` 스트림 닫지 않음 | 커넥션 풀 고갈, `Not all bytes were read...` 경고 | try-with-resources로 닫기 |
| 대용량 파일을 `putObject(...)`로 직접 업로드 | 느리고 실패 시 처음부터 재업로드 | `TransferManager.upload(...)` 사용 |
| `AWSStaticCredentialsProvider`로 long-term access key 사용 | 키 유출 위험, 로테이션 불가 | IAM Role (EC2/ECS/EKS) 전환 |
| IAM 정책에 `s3:GetObject`만 부여하고 presigned PUT 발급 | 업로드 시 403 | 발급 서버의 IAM Role에 **해당 키 경로에 대한 `s3:PutObject`** 추가 |
| Rekognition에 PNG/JPEG 외 포맷 전송 | `InvalidImageFormatException` | 업로드 단계에서 MIME 검증 |
| 같은 자격증명으로 장기 presigned URL 재사용 | 자격증명 만료 시 URL도 무효 | 장기 공유에는 CloudFront signed URL 고려 |
| `TransferManager`를 `shutdown()` 하지 않음 | JVM 종료 시 쓰레드풀 잔존 | `@Bean(destroyMethod = "shutdownNow")` |
| Rekognition 결과의 `Confidence`를 검증 없이 사용 | 낮은 신뢰도로 오판정 | `withMinConfidence(...)` 지정, 결과에서도 다시 필터 |

---

## 빠른 참조 체크리스트

- [ ] `pom.xml`/`build.gradle`에 `aws-java-sdk-bom`으로 모든 AWS 모듈 버전 통일
- [ ] `AmazonS3`, `AmazonRekognition`은 `@Configuration + @Bean`으로 싱글턴 등록
- [ ] region 명시 (`Regions.AP_NORTHEAST_2`)
- [ ] credential은 `DefaultAWSCredentialsProviderChain` + 환경별 IAM Role 우선
- [ ] 큰 파일은 `TransferManager`, 짧은 공유는 presigned URL
- [ ] `InputStream` 업로드 시 `ContentLength` 세팅
- [ ] `S3Object` / `S3ObjectInputStream` 반드시 close
- [ ] `AmazonS3Exception`에서 `statusCode` + `errorCode`로 분기
- [ ] EOL 공지 인지 후 v2 마이그레이션 계획 수립 (OpenRewrite 도구 활용)
