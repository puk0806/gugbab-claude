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
