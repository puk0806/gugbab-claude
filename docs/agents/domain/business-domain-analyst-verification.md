# business-domain-analyst 검증 문서

**검증일:** 2026-04-16
**대상 파일:** `.claude/agents/domain/business-domain-analyst.md`
**최종 판정:** APPROVED

---

## 사용한 소스 및 신뢰도

| 소스 | URL | 신뢰도 |
|------|-----|--------|
| Eric Evans, DDD Reference (2015) | https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf | High |
| Martin Fowler — Bounded Context | https://martinfowler.com/bliki/BoundedContext.html | High |
| Martin Fowler — Domain Driven Design | https://martinfowler.com/bliki/DomainDrivenDesign.html | High |
| Vaughn Vernon, Effective Aggregate Design Part I | https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_1.pdf | High |
| Vaughn Vernon, Effective Aggregate Design Part II | https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_2.pdf | High |
| InformIT — Rule: Model True Invariants | https://www.informit.com/articles/article.aspx?p=2020371&seqNum=2 | High |
| InformIT — Rule: Reference Other Aggregates by Identity | https://www.informit.com/articles/article.aspx?p=2020371&seqNum=4 | High |
| ddd-crew/context-mapping (GitHub, Stars 500+) | https://github.com/ddd-crew/context-mapping | Medium |
| Context Mapper 공식 문서 | https://contextmapper.org/docs/context-map/ | Medium |
| The Open Group — DDD Strategic Patterns | https://pubs.opengroup.org/architecture/o-aa-standard/DDD-strategic-patterns.html | Medium |
| Microsoft Azure — Domain Analysis | https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis | Medium |
| Jonathan Oliver — Core/Supporting/Generic Subdomains | https://blog.jonathanoliver.com/ddd-strategic-design-core-supporting-and-generic-subdomains/ | Medium |

---

## 클레임별 fact-checker 판정 결과

| 클레임 | 판정 | 수정 여부 |
|--------|------|-----------|
| 집합체 = 트랜잭션 일관성 경계 | VERIFIED | 없음 |
| 집합체 간 참조는 ID만 사용 | VERIFIED | 없음 (Vernon 2011 이후 원칙임을 주석으로 명시) |
| 바운디드 컨텍스트 경계 기준 = 비즈니스 역량 | **DISPUTED** | ✅ 수정 완료 |
| 컨텍스트 맵 관계 유형 4개가 대표 패턴 | **DISPUTED** | ✅ 수정 완료 |
| 도메인 3분류 (Core/Supporting/Generic) | VERIFIED | 없음 (Subdomain 표현 명시) |

---

## DISPUTED 항목 수정 내역

### 1. 바운디드 컨텍스트 경계 기준

**수정 전:** "비즈니스 역량(capability) 기준으로 나눈다"

**수정 후:** 핵심 기준을 "유비쿼터스 언어의 일관성"으로 변경. 비즈니스 역량 기준은 마이크로서비스 맥락의 파생 지침임을 `> 주의:` 블록으로 명시.

**근거:** Evans 원저 및 Fowler bliki 모두 주요 기준을 언어/문화(언어가 달라지는 경계)로 정의. 비즈니스 역량은 Evans 원저에 등장하지 않음.

### 2. 컨텍스트 맵 관계 유형

**수정 전:** Partnership, Customer-Supplier, ACL, Shared Kernel 4개만 열거

**수정 후:** Evans 원저 7개(Shared Kernel, Customer-Supplier, Conformist, ACL, Open Host Service, Published Language, Separate Ways) + Vernon 추가 Partnership 전부 포함

**근거:** ddd-crew/context-mapping 및 Open Group 문서 기준 실제 패턴은 9개. 4개로의 축소는 부정확.

---

## 버전 기준

- Eric Evans, "Domain-Driven Design" (2003) 및 DDD Reference (2015-03)
- Vaughn Vernon, "Effective Aggregate Design" (2011), "Implementing Domain-Driven Design" (2013)
- 특정 언어/프레임워크 버전 무관 (방법론)
