---
skill: jasypt-encrypted-config
category: backend
version: v1
date: 2026-11-09
status: APPROVED
---

# jasypt-encrypted-config 검증 문서

> Jasypt 기반 Spring Boot application.yml 암호화 스킬의 검증 기록

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `jasypt-encrypted-config` |
| 스킬 경로 | `.claude/skills/jasypt-encrypted-config/SKILL.md` |
| 검증일 | 2026-11-09 (재검증, 이전 2026-09-26 · 최초 2026-04-22) |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | jasypt-spring-boot-starter 3.0.x / 4.0.x, Jasypt core 1.9.3 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 확인 (github.com/ulisesbocchio/jasypt-spring-boot, jasypt.org)
- [✅] Spring Boot 2.x / 3.x 호환성 매트릭스 확인
- [✅] 암호화 알고리즘(`PBEWITHHMACSHA512ANDAES_256`) 권장 근거 확인
- [✅] CLI 사용법 확인
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | jasypt-spring-boot-starter 버전, 알고리즘 권장, ENC() 구문, key injection, CLI encrypt.sh | 공식 GitHub README·Release 노트·Jasypt 공식 사이트 수집 |
| 조사 | WebFetch | jasypt-spring-boot GitHub README | 버전 호환성·기본 알고리즘·설정 키 확인 |
| 교차 검증 | WebSearch | 3.0.x vs 4.0.x breaking change, Jasypt 1.9.3 release date, PBEWITHMD5ANDDES deprecated | 공식 문서와 다수 블로그 교차 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| jasypt-spring-boot GitHub | https://github.com/ulisesbocchio/jasypt-spring-boot | ⭐⭐⭐ High | 2026-04-22 | 공식 래퍼 저장소 |
| jasypt-spring-boot Releases | https://github.com/ulisesbocchio/jasypt-spring-boot/releases | ⭐⭐⭐ High | 2026-04-22 | 3.0.5, 4.0.0 릴리즈 확인 |
| Jasypt 공식 CLI | http://www.jasypt.org/cli.html | ⭐⭐⭐ High | 2026-04-22 | encrypt.sh/decrypt.sh 사용법 |
| Jasypt Core Javadoc | http://www.jasypt.org/api/jasypt/ | ⭐⭐⭐ High | 2026-04-22 | StandardPBEStringEncryptor API |
| Maven Central maven-metadata (starter) | https://repo1.maven.org/maven2/com/github/ulisesbocchio/jasypt-spring-boot-starter/maven-metadata.xml | ⭐⭐⭐ High | 2026-11-09 | latest/release 4.0.4, 4.0.0~4.0.2 없음, 4.0.3 POM 2025-12-15·4.0.4 POM 2026-01-25 |
| jasypt-spring-boot Releases (재확인) | https://github.com/ulisesbocchio/jasypt-spring-boot/releases | ⭐⭐⭐ High | 2026-11-09 | 4.0.3 Breaking: Java 17·Spring Boot 3.5.0 최소, 3.0.5 Spring Boot 3 지원 추가 |
| jasypt-spring-boot README (master) | https://github.com/ulisesbocchio/jasypt-spring-boot/blob/master/README.md | ⭐⭐⭐ High | 2026-11-09 | 기본 알고리즘·iterations 1000·RandomIvGenerator·`jasyptStringEncryptor` 빈 이름 |
| Maven Central maven-metadata (jasypt core) | https://repo1.maven.org/maven2/org/jasypt/jasypt/maven-metadata.xml | ⭐⭐⭐ High | 2026-11-09 | 코어 최신 1.9.3 유지 |

### 2026-11-09 재검증 클레임 판정

| 클레임 | 판정 | 근거 |
|--------|------|------|
| 최신 starter 4.0.4 | VERIFIED | Maven Central latest/release + GitHub Releases |
| 4.0.3 릴리스일 2024-12-15 / 4.0.4 "2025" | DISPUTED → 수정 | 4.0.3 = 2025-12-15, 4.0.4 = 2026-01-25 (Central POM 날짜·GitHub 릴리스) |
| SB 3.0~3.4 에 4.0.3 권장 | DISPUTED → 수정 | 4.0.3 이 SB 3.5.0·Java 17 최소를 Breaking 으로 명시, 4.0.0~4.0.2 는 Central 에 없음 → 3.0.5 로 바꿈 |
| 기본 알고리즘 PBEWITHHMACSHA512ANDAES_256·iterations 1000·RandomIvGenerator | VERIFIED | README 기본값 표 |
| 커스텀 빈 이름 `jasyptStringEncryptor` | VERIFIED | README |
| Jasypt 코어 1.9.3 최신 | VERIFIED | Maven Central metadata |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (3.0.x / 4.0.x, Jasypt core 1.9.3)
- [✅] deprecated된 패턴을 권장하지 않음 (`PBEWITHMD5ANDDES`는 deprecated 표기)
- [✅] 코드 예시가 실행 가능한 형태임 (application.yml, Java Config)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (상단 블록)
- [✅] 핵심 개념 설명 포함 (starter vs core 분리, ENC(...) 구문, 키 주입 전략)
- [✅] 코드 예시 포함 (application.yml, custom StringEncryptor Bean, CLI)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (환경변수 vs 파일 vs jvmarg 비교)
- [✅] 흔한 실수 패턴 포함 (키 git 커밋, deprecated 알고리즘 사용 등)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (SB 2.x/3.x 양쪽 커버)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-23, general-purpose로 대체 실행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — 의존성·CLI·ENC() 구문·환경변수 키 주입·커스텀 Bean 이름 `jasyptStringEncryptor` 모두 정확 제시
- [✅] 잘못된 응답 없음

---

## 5. 테스트 진행 기록

### 2026-11-09 — 재검증 후 재시험 (4.0.3/4.0.4 릴리스일·SB 3.0~3.4 권장 버전 수정 반영)

**수행일**: 2026-11-09
**수행자**: skill-tester → general-purpose (java-backend-developer 미사용, general-purpose 로 대체)
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트 (2026-11-09)

**Q1. Spring Boot 3.2 + Java 17 에서 어떤 starter 버전·Gradle 의존성을 쓰나? 최신 4.0.4 를 써도 되나?**
- ✅ PASS
- 근거: SKILL.md "버전 호환 매트릭스", "선택 기준"(SB 3.0~3.4 행), "의존성 설정", "흔한 실수"
- 상세: 수정된 내용대로 `3.0.5` 를 권장하고 4.0.x 는 SB 3.5.0+ 필수라 쓸 수 없다고 정확히 답함. anti-pattern(SB 3.0~3.4 에 4.0.3/4.0.4 권장)을 회피. Gradle 구문 `jasypt-spring-boot-starter:3.0.5` 제시. 3.2+ 이슈 시 SB 3.5+ 로 올리고 4.0.4 라는 경로도 인용.

**Q2. SB 3.5 + Java 21, CLI 암호문 복호화 실패(`EncryptionOperationNotPossibleException`) 원인·올바른 CLI 명령·운영 키 주입**
- ✅ PASS
- 근거: SKILL.md "암호문 생성 방법 > Jasypt CLI", "흔한 실수", "암호화 키 주입 방법", "트러블슈팅 체크리스트", "의존성 설정 > Spring Boot 3.5+"
- 상세: `ivGeneratorClassName=org.jasypt.iv.RandomIvGenerator` 누락을 1순위 원인으로 지목, 올바른 encrypt.sh 명령, `JASYPT_ENCRYPTOR_PASSWORD` 환경변수(Docker/K8s Secret) 주입, 의존성 4.0.4(2026-01-25, SB 3.5.0+/Java 17+) 모두 정확. 3.0.5 비권장도 올바름.

### 발견된 gap (선택 보강, 차단 아님)

- Gradle 의존성 예시는 3.0.5 만 있고 4.0.4 는 Maven 만 있음 (Gradle 구문 추론 필요)
- 3.0.5 가 SB 3.2~3.4 에서 보고된 이슈의 구체 증상·우회책 부재 (Issue 번호만 명시)
- `jasypt-maven-plugin` 의 4.0.x 대응 버전 불명확 (예시는 3.0.5)
- 상단 주의 블록의 "사용자 요청에서 3.0.2/3.0.5 로 언급" 문구는 작성 당시 맥락 메모라 독자에게 불필요
- CLI `password=` 인자가 shell history 에 남는 점 경고 없음

### 판정 (2026-11-09)

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 (content test 로 충분, 실사용 필수 카테고리 아님)
- 최종 상태: APPROVED 유지

---

### 2026-09-26 — 재검증 (60일 초과 정기 재검증)

**수행일**: 2026-09-26
**수행 방법**: SKILL.md 전체 Read, WebSearch로 jasypt-spring-boot-starter 최신 버전 재확인.

**Q1. 2026-09 기준 jasypt-spring-boot-starter 4.0.4가 여전히 Spring Boot 3.5+ 권장 버전인가?**
- PASS(재검증). WebSearch 결과 4.0.4가 여전히 최신 안정 버전으로 확인(신규 4.0.5/4.1 릴리스 없음). SKILL.md 버전 매트릭스 변경 불필요.

**Q2. `ENC(...)` 구문·`PBEWITHHMACSHA512ANDAES_256` 기본 알고리즘 권장이 여전히 유효한가?**
- PASS(재검증). Jasypt 코어(1.9.3)와 알고리즘 권장 사항에 변경 없음. CVE 신규 보고 없음.

**재검증 결론**: 클레임 전부 VERIFIED 유지, 내용 변경 없음. status 변경 없음(APPROVED 유지).

---

### 2026-04-23 — 원 수행 기록

**수행일**: 2026-04-23
**수행 방법**: general-purpose 에이전트에게 SKILL.md만 Read한 뒤 2개 실전 질문 답변.

### 실제 수행 테스트

**Q1. Spring Boot 3.x에서 DB 비밀번호 ENC() 암호화 + 운영 환경 키 주입**
- ✅ PASS. "의존성 설정 > Spring Boot 3.5+" + "암호문 생성 방법 > Jasypt CLI" + "암호화 키 주입 방법 > 환경변수 (권장)" 근거로 jasypt-spring-boot-starter 4.0.4 의존성, `encrypt.sh` with `ivGeneratorClassName=RandomIvGenerator`, `ENC(...)` 구문, `JASYPT_ENCRYPTOR_PASSWORD` 환경변수 + Docker/K8s/AWS Secrets Manager 통합 흐름까지 정확 제시.

**Q2. 커스텀 StringEncryptor Bean (iteration 1만 회)**
- ✅ PASS. "커스텀 StringEncryptor Bean > 반드시 빈 이름을 `jasyptStringEncryptor`로" 근거로 `PooledPBEStringEncryptor` + `SimpleStringPBEConfig` + `setKeyObtentionIterations("10000")` 코드 구성. 빈 이름 규칙과 "흔한 실수" 섹션의 `myEncryptor` 혼동 사례까지 정확 인용.

---

### (참고) 초기 작성 시 제시한 권장 테스트 케이스

### (예정) 테스트 케이스 1: application.yml DB 비밀번호 암호화

**입력:** `DB 비밀번호를 ENC(...)로 암호화해서 application.yml에 넣으려면?`

**기대 결과:** jasypt-spring-boot-starter 의존성 추가, CLI로 암호화, ENC() 구문, 환경변수로 키 주입

### (예정) 테스트 케이스 2: 커스텀 StringEncryptor Bean

**입력:** `알고리즘을 PBEWITHHMACSHA512ANDAES_256으로 바꾸고 iteration을 조정하려면?`

**기대 결과:** `jasyptStringEncryptor` 빈 이름, `SimpleStringPBEConfig` 설정, Spring Boot 자동 인식

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-23 2/2 PASS, 재검증 수정 후 2026-11-09 재시험 2/2 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] 2026-11-09 재검증 수정(4.0.3/4.0.4 릴리스일, SB 3.0~3.4 권장 3.0.5) 반영 후 content test 재시험 (2026-11-09 완료, 2/2 PASS)
- [⏸️] Gradle 4.0.4 의존성 예시·3.0.5 의 SB 3.2~3.4 이슈 증상·maven-plugin 4.0.x 버전·상단 "사용자 요청 3.0.2" 맥락 문구 정리·CLI shell history 경고 — 선택 보강, 차단 요인 아님
- [⏸️] `java-backend-developer` 전용 에이전트로 레거시+모던 프로젝트 재검증 — 현재 general-purpose 2문항 PASS(2026-04-23)로 대체 완료, 전용 에이전트 재검증은 선택 보강
- [⏸️] Vault/KMS 등 외부 시크릿 매니저와의 조합 섹션 — 선택 보강, 차단 요인 아님
- [⏸️] 키 로테이션 상세 절차 섹션 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성 — Jasypt + Spring Boot 2.x/3.x 통합, ENC() 구문, 키 주입 전략, CLI | skill-creator |
| 2026-09-26 | v1 | 재검증 — jasypt-spring-boot-starter 4.0.4 최신 유지 확인, 변경 사항 없음 | 메인 세션 |
| 2026-11-09 | v1 | 재검증 — 4.0.4 최신·코어 1.9.3·기본 알고리즘·빈 이름 VERIFIED. 바뀐 점: 4.0.3/4.0.4 릴리스일(2025-12-15/2026-01-25)로 정정, 4.0.x 는 SB 3.5.0+ 필수라 SB 3.0~3.4 권장을 3.0.5 로 수정, 4.0.0~4.0.2 미배포 명시, 흔한 실수 표 조건 보정 | 메인 세션 |
| 2026-11-09 | v1 | 재검증 수정본 2단계 실사용 재시험 (Q1 SB 3.2+Java 17 버전 선택·4.0.4 사용 가능 여부 / Q2 SB 3.5 CLI 복호화 실패 원인·키 주입) → 2/2 PASS, APPROVED 유지 | skill-tester |
| 2026-11-12 | v1.1 | 정리(사실 재검증 아님) — 일반 지식 덜어내기: 남긴 것 버전 매트릭스·4.0.0~4.0.2 미배포·선택 기준(레거시에 4.x 금지), Maven 플러그인 DEC() 치환, 기본값·IV 필수·CLI ivGeneratorClassName 함정·구 암호문 NoIvGenerator, CLI 출력 ENC() 없음, relaxed binding·빈 이름 jasyptStringEncryptor/jasypt.encryptor.bean, 키 이중 지원 없음·재시작, 복호화 실패 체크리스트 / 덜어낸 것 Jasypt vs starter 설명 표, 의존성 블록, ENC() 기본 사용·혼재 전체 yml 예제, 키 주입 방법별 예제(환경변수·JVM·파일·K8s), CLI·프로그래매틱·커스텀 빈 전체 코드, prefix/suffix 예시 표, 프로파일 키 분리 설명, 흔한 실수 표(본문 흡수). references 폴더 없음 | 정리 |
