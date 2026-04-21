# api-spec-designer

## 개요

- **역할**: PRD의 데이터 요구사항과 화면 흐름을 받아 OpenAPI 3.1 스펙, RESTful 엔드포인트, 요청/응답 스키마, 에러 코드 체계, 인증/인가 스펙을 설계하는 API 계약 설계 에이전트. 프론트엔드-백엔드 간 계약(Contract) 역할을 한다.
- **모델**: sonnet
- **도구**: Read, Write, Glob, Grep
- **카테고리**: domain

## 사용 시점

- PRD를 기반으로 API 엔드포인트를 설계할 때
- OpenAPI 3.1 YAML 스펙을 작성할 때
- 요청/응답 스키마(TypeScript interface + JSON Schema)를 정의할 때
- RFC 9457 기반 에러 코드 체계를 설계할 때
- JWT 인증/RBAC 인가 스펙을 정의할 때

## 사용 예시

- "이 PRD로 API 스펙 설계해줘"
- "회원 관리 REST API 엔드포인트 정의해줘"
- "에러 코드 체계 만들어줘"

## 입력/출력

- **입력**: PRD 문서 또는 기능 요구사항, 프로젝트 경로 (선택)
- **출력**: 엔드포인트 목록, 요청/응답 TypeScript 인터페이스, 에러 코드 체계(HTTP 상태 코드 + 앱 에러 코드), 인증/인가 스펙, OpenAPI 3.1 YAML. 요청 시 `docs/api/` 경로에 파일로 저장

## 설계 기반 표준

| 표준 | 용도 | 검증일 |
|------|------|--------|
| OpenAPI 3.1 (JSON Schema Draft 2020-12 호환) | API 스펙 형식 | 2026-04-20 |
| RFC 9457 (Problem Details for HTTP APIs) | 에러 응답 표준 | 2026-04-20 |
| RESTful 설계 원칙 (Microsoft, Swagger 가이드 기준) | 엔드포인트 설계 | 2026-04-20 |

> 소스:
> - [OpenAPI Best Practices](https://learn.openapis.org/best-practices.html)
> - [Microsoft REST API Design](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)
> - [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)
> - [Swagger Error Handling](https://swagger.io/blog/problem-details-rfc9457-doing-api-errors-well/)

## 관련 에이전트

- **product-planner**: PRD 작성 -> api-spec-designer로 API 계약 설계
- **frontend-developer**: API 스펙 기반으로 프론트엔드 구현
