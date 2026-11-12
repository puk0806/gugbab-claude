---
name: jasypt-encrypted-config
description: jasypt-spring-boot-starter 버전 선택과 함정 — SB 2.x=3.0.5 / SB 3.0~3.4=3.0.5(4.0.x 불가) / SB 3.5+=4.0.4, Maven Central 에 4.0.0~4.0.2 없음, 3.0.0+ 기본 PBEWITHHMACSHA512ANDAES_256 과 IV 필수(CLI ivGeneratorClassName 누락 시 복호화 실패·구 암호문은 NoIvGenerator), 빈 이름 jasyptStringEncryptor·jasypt.encryptor.bean, JASYPT_ENCRYPTOR_PASSWORD relaxed binding, CLI 출력엔 ENC() 없음, 키 이중 지원 없음(재암호화+재시작), 복호화 실패 체크리스트
---

# Jasypt 암호화 설정값 관리

> 소스: https://github.com/ulisesbocchio/jasypt-spring-boot | https://github.com/ulisesbocchio/jasypt-spring-boot/releases | http://www.jasypt.org/cli.html
> 검증일: 2026-11-09 (최초 2026-04-22, 재검증 2026-09-26 — 4.0.4가 여전히 최신, 4.0.3/4.0.4 릴리스일·SB 3.0~3.4 권장 버전 바로잡음)

> 주의: 이 문서는 `com.github.ulisesbocchio:jasypt-spring-boot-starter` 3.0.x / 4.0.x 기준이며, Jasypt 코어는 1.9.3입니다. 버전 호환성은 아래 매트릭스를 따르세요.

## 이 스킬의 범위

`ENC(...)` 구문, 마스터 키를 환경변수·JVM 인자로 주입하는 법, prefix/suffix 변경, 프로파일별 키 분리 같은 기본 사용법은 공식 문서 수준이라 싣지 않는다. 여기엔 **버전 선택 실수와 복호화 실패를 부르는 함정**만 둔다. starter가 코어(`org.jasypt:jasypt:1.9.3`)를 끌어오며, CLI는 별도 배포본(`jasypt-1.9.3-dist.zip`)이다.

---

## 1. 버전 호환 매트릭스 — 최신 4.x를 레거시에 넣지 말 것

| jasypt-spring-boot-starter | Spring Boot | Java | 릴리스일 | 비고 |
|---:|---:|---:|---|---|
| 2.1.2 | 2.0 ~ 2.4 | 8+ | 2020 | 구형 Spring Boot 2.x |
| 3.0.3 | 2.x | 8+ | 2020 | 기본 알고리즘 PBEWITHHMACSHA512ANDAES_256으로 변경 |
| 3.0.4 | 2.x | 8+ | 2021-08-29 | — |
| 3.0.5 | 2.x, 3.x(릴리스 노트상 Spring Boot 3 지원 추가 — 3.2+ 이슈 보고 있음) | 8+ | 2022-12-15 | 3.0.x 계열 마지막 |
| 4.0.3 | 3.5.0+ | 17+ | 2025-12-15 | Spring Boot 3.5.0·Java 17 최소 요구(Breaking) |
| 4.0.4 | 3.5.0+ | 17+ | 2026-01-25 (최신, 2026-11-09 기준) | YAML 멀티라인·AEP 이벤트 재사용 픽스 |

> Maven Central 에는 4.0.0~4.0.2 가 없다 — 3.0.5 다음이 바로 4.0.3 이다.

> 주의: 사용자 요청에서 "레거시 3.0.2 / 최신 3.0.5"로 언급되었으나, 실제 레거시(Spring Boot 2.x)는 **3.0.5**가 3.0.x 계열 마지막 안정 버전이고, 모던(Spring Boot 3.5+)은 **4.0.4**가 최신입니다. 3.0.5는 Spring Boot 3.2+에서 `UnsatisfiedDependencyException` 등 호환성 이슈가 보고되어 있어 Spring Boot 3.5+ 프로젝트에서는 4.0.x 사용을 권장합니다. (Issue #386 참조)

| 프로젝트 상황 | 권장 버전 |
|--------------|-----------|
| Spring Boot 2.5 ~ 2.7, Java 8/11 | `3.0.5` — **4.0.x를 넣으면 Java 17/SB 3.5 요구로 기동 실패** |
| Spring Boot 3.0 ~ 3.4, Java 17 | `3.0.5` (4.0.x 는 SB 3.5.0+ 필수라 쓸 수 없음 — 3.2+ 에서 문제가 나면 SB 3.5+ 로 올리고 4.0.4) |
| Spring Boot 3.5+, Java 17+ | `4.0.4` |

- `jasypt-maven-plugin`(`com.github.ulisesbocchio`, 예: 3.0.5): `mvn jasypt:encrypt-value -Djasypt.encryptor.password=... -Djasypt.plugin.value=...`, yml의 `DEC(평문)`을 `mvn jasypt:encrypt`로 `ENC(암호문)`으로 일괄 치환.
- `@SpringBootApplication` 없이 `@Configuration`만 쓰는 모듈은 `@EnableEncryptableProperties` 명시(중복 선언 무해).

---

## 2. 알고리즘·IV — 복호화 실패 1순위

3.0.0 이후 기본값: `algorithm` = `PBEWITHHMACSHA512ANDAES_256`, `key-obtention-iterations` = `1000`, `pool-size` = `1`, `provider-name` = `SunJCE`, `salt-generator-classname` = `org.jasypt.salt.RandomSaltGenerator`, `iv-generator-classname` = `org.jasypt.iv.RandomIvGenerator`, `string-output-type` = `base64`, prefix/suffix = `ENC(` / `)`.

> 주의: `PBEWITHHMACSHA512ANDAES_256` 같은 AES 기반 알고리즘은 `ivGeneratorClassName=org.jasypt.iv.RandomIvGenerator` 인자를 **반드시 줘야 한다.** 빠뜨리면 기본값인 `NoIvGenerator`로 동작해 starter가 복호화 시 실패한다.

```bash
./encrypt.sh input="..." password="$KEY" \
  algorithm=PBEWITHHMACSHA512ANDAES_256 ivGeneratorClassName=org.jasypt.iv.RandomIvGenerator
```

- 실패 증상: `EncryptionOperationNotPossibleException`.
- **구버전(starter 3.0.0 이전) 암호문** `PBEWithMD5AndDES`를 그대로 쓰려면 `algorithm: PBEWithMD5AndDES` + `iv-generator-classname: org.jasypt.iv.NoIvGenerator`를 명시해야 한다(권장하지 않음 — 점진 재암호화). `PBEWITHMD5ANDDES`는 DES 56-bit·MD5 취약으로 신규 사용 금지, `PBEWITHHMACSHA256ANDAES_128`이 최소 허용 수준.
- CLI는 prefix/suffix 없이 **순수 암호문만** 출력 — yml에 적을 때 `ENC(...)`를 수동으로 감싼다.
- 암호문에 `)`·`$` 같은 문자가 섞여 yml 파싱 에러가 나면 prefix/suffix 변경 또는 `string-output-type: hexadecimal`.

---

## 3. 키 주입·빈 함정

- 환경변수 `JASYPT_ENCRYPTOR_PASSWORD`는 relaxed binding으로 `jasypt.encryptor.password`에 매핑된다 — yml에 `password: ${JASYPT_ENCRYPTOR_PASSWORD:}` 없이도 동작. 마스터 키를 yml에 하드코딩·커밋 금지, CI 로그에 `-Djasypt.encryptor.password=...`가 찍히지 않게 마스킹. starter는 AWS Secrets Manager/Vault를 직접 통합하지 않는다(entrypoint·init-container에서 환경변수로 주입).
- 커스텀 `StringEncryptor`(`PooledPBEStringEncryptor` + `SimpleStringPBEConfig`)는 빈 이름이 **`jasyptStringEncryptor`여야** starter가 자동 탐지한다. 이름이 다르면 `jasypt.encryptor.bean=myEncryptor`. 이 빈이 있으면 `jasypt.encryptor.*` 프로퍼티는 대부분 무시되고 빈이 우선한다.
- 프로파일별로 키가 다르면 암호문도 각 키로 따로 생성해야 한다(복붙하면 prod 복호화 실패).
- 더 세밀한 감지는 `encryptablePropertyDetector` 빈(`DefaultPropertyDetector`).

### 키 갱신

Jasypt starter는 **런타임에 복호화만** 수행하며 복호화 값은 in-memory 캐시된다. 새 키로 전체 재암호화 → `ENC(...)` 교체 → 환경변수 변경 → **재시작**(롤링). `@RefreshScope`도 복호화가 `PropertySource` 추가 시점에 적용되므로 실제로는 Context refresh가 필요하다.

> 주의: Jasypt 자체에는 "이중 키(old+new) 지원" 같은 기능이 없다. 재암호화와 재배포가 유일한 정석 경로다.

---

## 4. 복호화 실패 체크리스트

1. `JASYPT_ENCRYPTOR_PASSWORD`가 프로세스에 실제로 전달됐는가 (`System.getenv()`)
2. 암호문 생성 시 알고리즘 / IV Generator가 애플리케이션 설정과 같은가
3. starter 버전이 Spring Boot 버전과 맞는가 (1절)
4. 커스텀 빈 이름이 `jasyptStringEncryptor`인가
5. prefix/suffix가 일치하는가 (CLI 출력엔 `ENC(` `)` 없음)
6. DEBUG 로그에서 `EnableEncryptablePropertySourcesPostProcessor` 등록 여부
