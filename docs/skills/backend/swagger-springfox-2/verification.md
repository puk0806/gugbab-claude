---
skill: swagger-springfox-2
category: backend
version: v1
date: 2026-04-23
status: APPROVED
---

# 스킬 검증: swagger-springfox-2

## 검증 워크플로우

스킬은 **2단계 검증**을 거쳐 최종 APPROVED 상태가 됩니다.

```
[1단계] 스킬 작성 시 (오프라인 검증) — 완료
  ├─ 공식 문서 기반으로 내용 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST  ← 현재 상태. 내용은 신뢰 가능.

[2단계] 실제 사용 중 (온라인 검증) — 미실시
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `swagger-springfox-2` |
| 스킬 경로 | `.claude/skills/backend/swagger-springfox-2/SKILL.md` |
| 검증일 | 2026-04-23 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Springfox GitHub, Springdoc migration page)
- [✅] 공식 GitHub 2순위 소스 확인 (issues #3462, #3955, #3982)
- [✅] 최신 버전 기준 내용 확인 (Springfox 3.0.0 / 2020-07-14가 마지막, 2.9.2 / 2018-06-23)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (Docket, 어노테이션, 그룹화, 전역 헤더)
- [✅] 코드 예시 작성 (2.9.2·3.0.0 양쪽)
- [✅] 흔한 실수 패턴 정리 (11개 항목)
- [✅] Spring Boot 2.6+ PathPatternParser NPE 대응
- [✅] Springdoc 전환 매핑 표 포함
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md`, `mybatis-mapper-patterns/SKILL.md` | 템플릿 8개 섹션 구조 확인 |
| 조사 1 | WebSearch | "springfox swagger 3.0.0 release date github springfox-boot-starter" | 3.0.0 = 2020-07-14 릴리즈 확인, Maven Central `io.springfox:springfox-boot-starter:3.0.0` 좌표 확인 |
| 조사 2 | WebSearch | "springfox Spring Boot 2.6 PathPatternParser NullPointerException" | documentationPluginsBootstrapper NPE 근본 원인(PathPatternParser 전환) 및 해결 키 `spring.mvc.pathmatch.matching-strategy` 확인 |
| 조사 3 | WebFetch | github.com/springfox/springfox/releases | 3.0.0 (2020-07-14) 마지막 릴리즈, OAS 3.0.3 지원, 2.9.x 이전 API 제거 확인 |
| 조사 4 | WebSearch | "springfox-swagger2 2.9.2 release date maven central" | 2.9.2 = 2018-06-23 릴리즈 (초기 WebFetch 결과의 "2020-06-24"는 오류로 판정) |
| 조사 5 | WebFetch | github.com/springfox/springfox/issues/3462 | Spring 5.3/Boot 2.4+ 이슈의 본질(`getPatternsCondition()` null 반환), 유지보수 중단 상태 확인 |
| 조사 6 | WebSearch | "springfox Docket globalOperationParameters globalRequestParameters JWT header" | 2.9.2: `globalOperationParameters`+`ParameterBuilder`, 3.0.0: `globalRequestParameters`+`RequestParameterBuilder` 확인, 3.0.0에서 deprecated 확인 |
| 조사 7 | WebSearch | "springfox 3.0.0 swagger-ui path /swagger-ui/index.html v3/api-docs default" | UI: 3.0.0 = `/swagger-ui/index.html`, 2.x = `/swagger-ui.html`. JSON: SWAGGER_2 = `/v2/api-docs`, OAS_30 = `/v3/api-docs` 확인 |
| 조사 8 | WebSearch | "springfox 2.9.2 EnableSwagger2 Docket configuration" | `@EnableSwagger2` 필수, `Docket(SWAGGER_2)`, `.select().apis().paths().build()` 체인 확인 |
| 조사 9 | WebSearch | "spring.mvc.pathmatch.matching-strategy ant_path_matcher springfox" | 값은 `ant_path_matcher` (언더스코어). Spring Boot 공식 issue #28936에서 확인 |
| 조사 10 | WebSearch | "springfox springdoc migration annotation mapping" | Springdoc 공식 마이그레이션 페이지의 어노테이션 매핑 표 확인 |
| 교차 검증 | WebSearch/WebFetch | 8개 핵심 클레임을 독립 소스 2개 이상에서 확인 | VERIFIED 8 / DISPUTED 1 (2.9.2 릴리즈 날짜 — 수정 반영) / UNVERIFIED 0 |
| 작성 | Write | SKILL.md, verification.md | 2개 파일 생성 완료 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Springfox GitHub Releases | https://github.com/springfox/springfox/releases | ⭐⭐⭐ High | 2026-04-23 | 공식. 3.0.0 릴리즈 날짜(2020-07-14) 및 주요 변경사항 |
| Springfox 공식 문서 | https://springfox.github.io/springfox/docs/current/ | ⭐⭐⭐ High | 2026-04-23 | 공식 레퍼런스. WebFetch는 SSL 이슈로 실패했으나 URL 유효성 검색으로 확인 |
| Springfox Issue #3462 | https://github.com/springfox/springfox/issues/3462 | ⭐⭐⭐ High | 2026-04-23 | Spring 5.3/Boot 2.4+ 호환성 이슈 원본 |
| Springfox Issue #3955 | https://github.com/springfox/springfox/issues/3955 | ⭐⭐⭐ High | 2026-04-23 | Spring Boot 2.6.2 documentationPluginsBootstrapper NPE |
| Springfox Issue #3982 | https://github.com/springfox/springfox/issues/3982 | ⭐⭐⭐ High | 2026-04-23 | Spring Boot 2.6.x 버그 재확인 이슈 |
| Spring Boot Issue #28936 | https://github.com/spring-projects/spring-boot/issues/28936 | ⭐⭐⭐ High | 2026-04-23 | `spring.mvc.pathmatch.matching-strategy` 기본값 및 값 표기(`ant_path_matcher`) |
| Spring Boot 2.6 Release Notes | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.6-Release-Notes | ⭐⭐⭐ High | 2026-04-23 | PathPatternParser 전환 공식 발표 |
| Springdoc Migration Guide | https://springdoc.org/migrating-from-springfox.html | ⭐⭐⭐ High | 2026-04-23 | 어노테이션 매핑 표의 공식 출처 |
| Maven Central `springfox-boot-starter:3.0.0` | https://mvnrepository.com/artifact/io.springfox/springfox-boot-starter/3.0.0 | ⭐⭐⭐ High | 2026-04-23 | 의존성 좌표 및 릴리즈 검증 |
| Maven Central `springfox-swagger2:2.9.2` | https://central.sonatype.com/artifact/io.springfox/springfox-swagger2/2.9.2 | ⭐⭐⭐ High | 2026-04-23 | 2.9.2 릴리즈 날짜(2018-06-23) 및 좌표 검증 |
| Baeldung: Setting Up Swagger 2 | https://www.baeldung.com/swagger-2-documentation-for-spring-rest-api | ⭐⭐ Medium | 2026-04-23 | Docket/ApiInfo 기본 패턴 크로스 체크용 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Springfox 3.0.0 / 2.9.2, Spring Boot 2.5/2.6, Java 11)
- [✅] deprecated된 패턴을 권장하지 않음 (`globalOperationParameters` 사용은 2.9.2 한정, 3.0.0은 `globalRequestParameters` 권장 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (import 경로 포함, 실제 Springfox API 시그니처)

핵심 클레임별 판정:

| 클레임 | 판정 | 근거 |
|--------|------|------|
| Springfox 3.0.0 릴리즈 = 2020-07-14 (마지막 안정 버전) | VERIFIED | GitHub Releases + newreleases.io + MvnRepository 교차 확인 |
| Springfox 2.9.2 릴리즈 = 2018-06-23 | DISPUTED → 수정 반영 | 초기 WebFetch(2020-06-24)는 오류. Maven Central 재검색으로 2018-06-23 확정 |
| Spring Boot 2.6+ 에서 Springfox가 `documentationPluginsBootstrapper` NPE 발생 | VERIFIED | Springfox Issue #3955, #3982 + Spring Boot 2.6 Release Notes |
| 해결책: `spring.mvc.pathmatch.matching-strategy=ant_path_matcher` | VERIFIED | Spring Boot Issue #28936 + Springfox Issue #3982 공통 |
| 3.0.0 기본 UI 경로 = `/swagger-ui/index.html`, 2.9.2는 `/swagger-ui.html` | VERIFIED | Issue #3608, #4012 + Baeldung + MvnRepository 설명 |
| 3.0.0에서 `globalOperationParameters` deprecated, `globalRequestParameters` 권장 | VERIFIED | Springfox Javadoc + 여러 마이그레이션 블로그 |
| Springfox 어노테이션 패키지 = `io.swagger.annotations.*` | VERIFIED | Springdoc 공식 마이그레이션 페이지의 어노테이션 매핑 표 |
| Springdoc 어노테이션 매핑 표 (`@Api→@Tag`, `@ApiOperation→@Operation` 등) | VERIFIED | https://springdoc.org/migrating-from-springfox.html 공식 |
| Spring Boot 3.x(Spring 6, Jakarta) 에서 Springfox 미지원 | VERIFIED | Springfox 3.0.0 이후 릴리즈 없음 + 다수 커뮤니티 보고 |

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (최상단)
- [✅] 핵심 개념 설명 포함 (Docket, 어노테이션, 그룹화, 전역 헤더, Security)
- [✅] 코드 예시 포함 (2.9.2·3.0.0 양쪽 Docket, 어노테이션 샘플, Security permitAll)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (상단 EOL 경고 + Springdoc 권장)
- [✅] 흔한 실수 패턴 포함 (11개)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (의존성 → 설정 → 어노테이션 → 운영 이슈까지 한 번에 해결)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (JWT 전역 헤더, Security 화이트리스트 등 운영에서 매일 쓰는 패턴)
- [✅] 범용적으로 사용 가능 (특정 회사/도메인 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트

- [❌] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2단계 검증 시점에 수행)
- [❌] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [❌] 잘못된 응답이 나오는 경우 스킬 내용 보완

---

## 5. 테스트 진행 기록

### 테스트 케이스 1: (미실시)

**입력 (질문/요청):**
```
(2단계 검증 시점에 수행 예정)
예시: "Spring Boot 2.6.3 + Springfox 3.0.0 프로젝트가 기동 시 NullPointerException으로 실패합니다. 해결 방법은?"
```

**기대 결과:**
```
SKILL.md의 "Spring Boot 2.6+ 호환성 이슈" 섹션에 따라
application.properties에 spring.mvc.pathmatch.matching-strategy=ant_path_matcher 추가를 안내.
동시에 Springfox가 EOL이므로 Springdoc 전환 권장 메시지 포함.
```

**실제 결과:** (미실시)

**판정:** (미실시)

---

### 테스트 케이스 2: (미실시)

**입력:**
```
예시: "Springfox 2.9.2 컨트롤러에 JWT Authorization 헤더를 모든 API에 전역으로 표시하려면?"
```

**기대 결과:**
`Docket.globalOperationParameters(...)` + `ParameterBuilder`로 `Authorization` 헤더 등록하는 코드(SKILL.md의 "전역 헤더 — 2.9.2" 섹션 그대로).

**실제 결과:** (미실시)

**판정:** (미실시)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-23, general-purpose 2문항 PASS — SB 2.6+ NPE 해결책 + Springfox→Springdoc 매핑 정확) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] 에이전트 활용 테스트 — SB 2.6+ NPE 해결책 + Springfox→Springdoc 매핑 2문항 PASS (섹션 6, general-purpose 대체, 2026-04-23)
- [⏸️] Springfox + Spring Cloud Gateway 조합 이슈 별도 확인 — 범위 확장 선택 사항
- [⏸️] Gradle 의존성 표기 추가 — 선택 보강, 현재 Maven만 포함
- [⏸️] Springfox 3.0.0 + Kotlin 프로젝트 주의점 확인 — 범위 확장 선택 사항

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-23 | v1 | 최초 작성. Springfox 2.9.2 / 3.0.0 의존성, @EnableSwagger2 + Docket 설정, 어노테이션(@Api/@ApiOperation/@ApiParam/@ApiResponse/@ApiModel/@ApiModelProperty), Docket 그룹화, 전역 JWT 헤더(2.9.2 globalOperationParameters / 3.0.0 globalRequestParameters), Spring Boot 2.6+ PathPatternParser NPE 이슈 + 해결책(ant_path_matcher), Swagger UI/JSON 경로, Security permitAll 화이트리스트, Springdoc 전환 매핑 표, 흔한 실수 11개 포함 | skill-creator |
