---
skill: jasypt-encrypted-config
category: backend
version: v1
date: 2026-04-22
status: APPROVED
---

# jasypt-encrypted-config 검증 문서

> Jasypt 기반 Spring Boot application.yml 암호화 스킬의 검증 기록

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `jasypt-encrypted-config` |
| 스킬 경로 | `.claude/skills/backend/jasypt-encrypted-config/SKILL.md` |
| 검증일 | 2026-04-22 |
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
| 에이전트 활용 테스트 | ✅ (2026-04-23, 2개 질문 모두 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [⏸️] `java-backend-developer` 전용 에이전트로 레거시+모던 프로젝트 재검증 — 현재 general-purpose 2문항 PASS(2026-04-23)로 대체 완료, 전용 에이전트 재검증은 선택 보강
- [⏸️] Vault/KMS 등 외부 시크릿 매니저와의 조합 섹션 — 선택 보강, 차단 요인 아님
- [⏸️] 키 로테이션 상세 절차 섹션 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성 — Jasypt + Spring Boot 2.x/3.x 통합, ENC() 구문, 키 주입 전략, CLI | skill-creator |
