# codebase-domain-analyst 검증 문서

**검증일:** 2026-04-16
**대상 파일:** `.claude/agents/domain/codebase-domain-analyst.md`
**최종 판정:** APPROVED

---

## 사용한 소스 및 신뢰도

| 소스 | URL | 신뢰도 |
|------|-----|--------|
| Martin Fowler — EvansClassification | https://martinfowler.com/bliki/EvansClassification.html | High |
| Martin Fowler — ValueObject | https://martinfowler.com/bliki/ValueObject.html | High |
| Martin Fowler — UbiquitousLanguage | https://martinfowler.com/bliki/UbiquitousLanguage.html | High |
| Martin Fowler — Domain Driven Design | https://martinfowler.com/bliki/DomainDrivenDesign.html | High |
| Microsoft .NET Architecture — Value Objects | https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/implement-value-objects | Medium |
| Microsoft Azure — Tactical DDD | https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-domain-driven-design | Medium |
| Microsoft .NET Architecture — Domain Events | https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation | Medium |
| DDD Practitioners — Domain Event | https://ddd-practitioners.com/home/glossary/domain-event/ | Medium |
| DDD Practitioners — Ubiquitous Language | https://ddd-practitioners.com/home/glossary/ubiquitous-language/ | Medium |
| Enterprise Craftsmanship — Entity vs VO | https://enterprisecraftsmanship.com/posts/entity-vs-value-object-the-ultimate-list-of-differences/ | Medium |
| Wikipedia — Domain-Driven Design | https://en.wikipedia.org/wiki/Domain-driven_design | Medium |

---

## 클레임별 fact-checker 판정 결과

| 클레임 | 판정 | 수정 여부 |
|--------|------|-----------|
| 엔티티 = ID + 생명주기, 값 객체 = 속성 + 불변 | VERIFIED | 없음 |
| 값 객체 equality = 속성 기반, 엔티티 = ID 기반 | VERIFIED | 없음 |
| 도메인 이벤트 과거형 명명 (OrderPlaced 등) | VERIFIED | 없음 |
| 도메인 서비스 = 단일 엔티티에 귀속 불가한 로직 | VERIFIED | 없음 |
| 유비쿼터스 언어 = 코드 클래스명·메서드명 반영 | VERIFIED | 없음 |

모든 클레임 VERIFIED. 수정 불필요.

---

## 주의사항 (VERIFIED이나 뉘앙스 차이)

### 도메인 서비스 정의
- 에이전트에 "여러 엔티티에 걸친 비즈니스 로직"으로 표현
- Evans 원저의 정확한 정의는 "단일 엔티티/VO 어디에도 자연스럽게 귀속되지 않는 로직" (복수 엔티티가 필수 조건이 아님)
- 현재 표현이 가장 대표적 사례라 실용적으로 문제없으나, 엄밀히는 단일 개념도 서비스가 될 수 있음

### 도메인 이벤트 과거형 명명
- Evans 원저(2003)에는 Domain Event 개념 자체가 없었음 (이후 appendix 및 커뮤니티에서 공식화)
- 과거형 명명은 Vernon 등 이후 DDD 커뮤니티에서 정립된 컨벤션
- Microsoft 공식 .NET 가이드에서 코드 예시와 함께 명시하므로 실용적으로 신뢰 가능

---

## 버전 기준

- Eric Evans, "Domain-Driven Design" (2003) 및 DDD Reference (2015-03)
- Vaughn Vernon, "Implementing Domain-Driven Design" (2013)
- 특정 언어/프레임워크 버전 무관 (방법론)
