# DDD(Domain-Driven Design) 핵심 개념 — 리서치 보고서

**작성일**: 2026-04-17 | **주제**: DDD 핵심 개념 공식 자료 기반 조사 (SKILL.md 작성용) | **검색 소스**: WebSearch, dddcommunity.org, domainlanguage.com, informit.com

---

## 요약 (Executive Summary)

- Eric Evans의 2003년 원저("Blue Book")는 DDD의 전략적/전술적 패턴의 근간이며, 2015년 DDD Reference에서 3개 패턴(Partnership, Big Ball of Mud, Domain Events)이 추가되었다.
- Vaughn Vernon의 IDDD("Red Book", 2013)와 "Effective Aggregate Design" 3부작(2011)은 Aggregate 설계의 실무 규칙을 체계화했으며, 특히 "다른 Aggregate는 ID로만 참조" 규칙은 Vernon이 명시적으로 정립한 것이다.
- Context Map 패턴은 Evans 원저에 7개(Shared Kernel, Customer/Supplier, Conformist, Anticorruption Layer, Open Host Service, Published Language, Separate Ways), 2015 Reference에서 Partnership과 Big Ball of Mud가 추가되어 총 9개이다.
- Domain Events는 Evans 2003 초판에 포함되지 않았으며, 2015 Reference에서 Evans가 공식 추가하고 Vernon IDDD Chapter 8에서 구현 수준으로 체계화했다.

---

## 1. Ubiquitous Language (유비쿼터스 언어)

### 정의 및 출처
- **출처**: Evans 원저 Chapter 2 "Communication and the Use of Language"
- **Evans DDD Reference (2015)**: "A language structured around the domain model and used by all team members within a bounded context to connect all the activities of the team with the software."
- **핵심 원칙**: 도메인 전문가와 개발자가 동일한 언어를 사용하며, 이 언어가 코드에 직접 반영되어야 한다. 모델이 곧 언어이고 언어가 곧 모델이다.

### 실무 적용 기준
- **사용**: 모든 DDD 프로젝트에서 필수. Bounded Context 내에서 팀 전체가 공유하는 단일 언어.
- **미사용**: Bounded Context 경계를 넘어서 동일 용어를 강제하려 할 때 (각 Context는 자체 언어를 가짐)

### 흔한 실수
- 코드에서는 기술 용어, 문서에서는 비즈니스 용어를 별도로 사용하는 "번역 계층" 유지
- 하나의 용어가 서로 다른 Context에서 다른 의미로 사용되는데 이를 통합하려는 시도
- 용어집만 만들고 코드에 반영하지 않는 형식적 적용

---

## 2. Subdomain 분류 (Core / Supporting / Generic)

### 정의 및 출처
- **출처**: Evans 원저 Chapter 15 "Distillation" (Core Domain 개념), Vernon IDDD에서 3분류 체계를 명확화
- **Evans**: "Core Domain"이라는 용어를 사용하며 Part IV에서 전략적 증류(Distillation)의 핵심으로 다룸

### 각 분류의 정의

| 분류 | 정의 | 특성 | 예시 |
|------|------|------|------|
| **Core Domain** | 비즈니스의 핵심 경쟁력, 차별화 요소 | 전체 가치의 ~20%, 코드의 ~5%, 노력의 ~80% | 보험사의 리스크 평가 엔진 |
| **Supporting Subdomain** | Core를 지원하는 보조 기능, 맞춤 개발 필요 | 비즈니스 특화이나 차별화 요소는 아님 | 보험사의 고객 온보딩 프로세스 |
| **Generic Subdomain** | 범용 기능, 기성 솔루션으로 대체 가능 | 경쟁 우위 없음, 구매/오픈소스 활용 | 인증, 이메일 발송, 결제 게이트웨이 |

### 실무 적용 기준
- **사용**: 시스템 분해 시 투자 우선순위 결정, 팀 배치 전략
- **미사용**: 기술적 레이어 분리 (이것은 Subdomain이 아니라 아키텍처 관심사)

### 흔한 실수
- 모든 것을 Core Domain으로 취급하여 리소스를 분산
- Generic Subdomain에 맞춤 개발을 투입
- 기술적 복잡성과 도메인 복잡성을 혼동

---

## 3. Bounded Context (바운디드 컨텍스트)

### 정의 및 출처
- **출처**: Evans 원저 Chapter 14 "Maintaining Model Integrity" (Part IV: Strategic Design)
- **Evans DDD Reference (2015)**: "A description of a boundary (typically a subsystem, or the work of a particular team) within which a particular model is defined and applicable."

### 경계 설정 기준
- **언어적 경계**: 동일 용어가 다른 의미를 가질 때 경계가 필요 (예: "Account"가 은행과 CRM에서 다른 의미)
- **팀 경계**: 하나의 Bounded Context는 하나의 팀이 소유
- **기술적 경계**: 별도 배포 가능 단위, 별도 데이터 저장소

### 실무 적용 기준
- **사용**: 대규모 시스템을 독립적으로 발전 가능한 단위로 분해할 때
- **미사용**: 소규모 모놀리스에서 인위적으로 Context를 나누는 것은 과잉 설계

### 흔한 실수
- Bounded Context를 기술 레이어(API, DB)로 나누는 것 (기능/도메인 단위로 나눠야 함)
- 하나의 통합 모델을 전체 시스템에 강제하려는 시도
- Bounded Context와 마이크로서비스를 1:1로 동일시 (Context가 반드시 서비스 경계는 아님)

---

## 4. Context Map

### 정의 및 출처
- **출처**: Evans 원저 Chapter 14, Part IV "Strategic Design"
- **정의**: Bounded Context 간의 관계를 시각화한 전체 시스템의 지도

### 패턴 목록 -- Evans 원저 vs 2015 Reference 구분

**Evans 2003 원저 패턴 (7개):**

| # | 패턴 | 관계 유형 | 설명 |
|---|------|-----------|------|
| 1 | **Shared Kernel** | 대칭 | 두 팀이 합의한 모델의 일부분을 공유 |
| 2 | **Customer/Supplier** | 비대칭 (U/D) | 상류 팀이 하류 팀의 요구사항을 반영 |
| 3 | **Conformist** | 비대칭 (U/D) | 하류 팀이 상류 모델을 그대로 수용 |
| 4 | **Anticorruption Layer** | 비대칭 (U/D) | 하류 팀이 번역 계층을 구축하여 자체 모델 보호 |
| 5 | **Open Host Service** | 비대칭 (U) | 상류가 프로토콜/API를 공개하여 다수 하류를 지원 |
| 6 | **Published Language** | 비대칭 | 잘 문서화된 공유 언어로 통신 (OHS와 함께 사용이 일반적) |
| 7 | **Separate Ways** | 무관계 | 통합하지 않고 각자 독립적으로 진행 |

**2015 DDD Reference에서 추가된 패턴 (2개, Context Map 관련):**

| # | 패턴 | 관계 유형 | 설명 |
|---|------|-----------|------|
| 8 | **Partnership** | 대칭 | 두 팀이 함께 성공하거나 함께 실패, 공동 계획/통합 관리 |
| 9 | **Big Ball of Mud** | 안티패턴 | 모델 경계가 불분명한 기존 시스템, 경계를 그어 격리 |

> **확인 결과**: Evans 원저에는 7개 패턴이 있으며, Partnership과 Big Ball of Mud는 2015 DDD Reference에서 Evans가 추가한 패턴이다. DDD Reference 서문에 "three patterns have been added describing concepts whose usefulness and importance has emerged in the intervening years"라고 명시되어 있으며, 세 번째 추가 패턴은 Domain Events(전술적 패턴)이다.

### 흔한 실수
- Context Map을 한 번 그리고 업데이트하지 않음
- 모든 관계를 Shared Kernel로 설정 (과도한 결합)
- Anticorruption Layer 없이 레거시 시스템과 직접 통합

---

## 5. Aggregate (집합체)

### 정의 및 출처
- **출처**: Evans 원저 Chapter 6 "The Life Cycle of a Domain Object"
- **Evans 정의**: "A cluster of associated objects that we treat as a unit for the purpose of data changes. Each Aggregate has a root and a boundary."
- **Vernon "Effective Aggregate Design" 3부작** (2011, dddcommunity.org): Aggregate 설계의 실무 규칙을 체계화

### Vernon의 4가지 Aggregate 설계 규칙

| 규칙 | 출처 | 설명 |
|------|------|------|
| **1. 진정한 불변식을 일관성 경계 내에서 모델링** | Vernon Part I | Aggregate 내의 비즈니스 규칙만 트랜잭션 일관성 보장 |
| **2. 작은 Aggregate를 설계** | Vernon Part I | 하나의 Root Entity + 최소한의 속성/VO |
| **3. 다른 Aggregate는 ID로만 참조** | Vernon Part II | 직접 객체 참조 대신 ID 참조로 결합도 최소화 |
| **4. 경계 밖에서는 최종 일관성 사용** | Vernon Part II | Aggregate 간 업데이트는 Domain Events + 최종 일관성 |

### Evans 원저 vs Vernon의 "ID로만 참조" 규칙

- **Evans 원저**: "One Aggregate may hold references to the Root of other Aggregates." -- 직접 객체 참조를 허용하되, 참조가 일관성 경계를 확장하지 않는다고 명시.
- **Vernon**: 이를 더 엄격하게 "Reference Other Aggregates by Identity"로 정립. Evans는 허용했으나 Vernon은 ID 참조만을 권장.
- **결론**: "다른 Aggregate는 ID로만 참조" 규칙은 **Vernon이 명시적으로 정립**한 것이며, Evans 원저에는 없다. Evans는 Root 참조를 허용했다.

### 실무 적용 기준
- **사용**: 트랜잭션 일관성이 필요한 도메인 객체 클러스터
- **미사용**: 단순 CRUD 애플리케이션, 조회 전용 모델

### 흔한 실수
- Aggregate를 너무 크게 설계 (데이터베이스 테이블 구조를 그대로 반영)
- 여러 Aggregate를 하나의 트랜잭션에서 수정
- Aggregate Root를 거치지 않고 내부 Entity를 직접 수정

---

## 6. Entity vs Value Object

### 정의 및 출처
- **출처**: Evans 원저 Chapter 5 "A Model Expressed in Software"

### Entity (엔티티)
- **정의**: "Objects that have a distinct identity that runs through time and different representations." (Evans)
- **핵심**: 연속성(continuity)과 식별성(identity). "Is this the same object?"라는 질문에 답할 수 있어야 함.
- **특성**: 가변(mutable), 생명주기(lifecycle)가 있음, 동등성은 ID로 판단

### Value Object (값 객체)
- **정의**: "Objects that matter only as the combination of their attributes." (Evans)
- **핵심**: 속성의 조합으로만 정의되며, 동일 속성값을 가진 두 VO는 동일한 것으로 간주
- **특성**: 불변(immutable), 생명주기 없음, 동등성은 구조적 동등성(structural equality)으로 판단

### 구분 기준

| 기준 | Entity | Value Object |
|------|--------|--------------|
| 식별성 | ID로 식별 | 속성값 조합으로 식별 |
| 가변성 | 가변 (상태 변경 가능) | 불변 (변경 시 새 인스턴스 생성) |
| 생명주기 | 있음 (생성-변경-소멸) | 없음 (교체만 존재) |
| 동등성 | ID 동등성 | 구조적 동등성 |
| 예시 | 고객(Customer), 주문(Order) | 금액(Money), 주소(Address) |

### 실무 적용 기준
- **VO 우선 원칙**: 가능하면 Value Object로 모델링 (더 단순하고 안전)
- **Entity 선택**: 시간에 따른 추적이 필요하거나 고유 식별이 비즈니스 요구인 경우

### 흔한 실수
- 모든 것을 Entity로 모델링 (ID가 필요 없는데 부여)
- Value Object를 가변으로 구현
- 같은 개념이 다른 Context에서는 Entity/VO가 달라질 수 있음을 간과

---

## 7. Domain Service (도메인 서비스)

### 정의 및 출처
- **출처**: Evans 원저 Chapter 5 "A Model Expressed in Software"
- **Evans 정의**: "A standalone operation within the context of your domain." 도메인 개념이지만 Entity나 Value Object에 자연스럽게 속하지 않는 연산.

### 사용 기준 (Evans의 3가지 특성)
1. **연산이 도메인 개념을 표현하지만 Entity/VO에 자연스럽게 속하지 않음** ("not a natural part of an Entity or Value Object")
2. **인터페이스가 도메인 모델의 다른 요소로 정의됨**
3. **연산이 상태를 갖지 않음 (Stateless)**

### 실무 적용 기준
- **사용**: 여러 Aggregate를 조율하는 비즈니스 로직, 외부 시스템 통합 로직
- **미사용**: Entity/VO 내부에 자연스럽게 배치할 수 있는 로직

### 흔한 실수
- Entity의 비즈니스 로직을 모두 Service로 추출 -> Anemic Domain Model 안티패턴
- Application Service와 Domain Service를 혼동 (Application Service는 use case 조율, Domain Service는 비즈니스 규칙)
- "Juggling" 안티패턴: 객체를 여러 서비스 사이에서 전달하며 각 서비스가 상태를 변경

---

## 8. Domain Events (도메인 이벤트)

### 정의 및 출처 -- 핵심 확인 사항

- **Evans 2003 초판**: Domain Events는 **포함되어 있지 않다**. 원저의 목차와 색인에 Domain Events 패턴은 없음.
- **Evans 2015 DDD Reference**: Domain Events가 **새로 추가된 3개 패턴 중 하나**로 공식 포함. Reference 서문에 "three patterns have been added"라고 명시.
- **Vernon IDDD (2013)**: Chapter 8 "Domain Events"에서 구현 수준으로 체계화. 이벤트 발행/구독, 이벤트 저장소, 최종 일관성과의 연결을 상세히 다룸.

### 정의
- **Evans DDD Reference (2015)**: 도메인에서 발생한 중요한 사건을 나타내는 객체. 다른 부분의 시스템이 이 사건에 반응할 수 있게 함.
- **Vernon**: Aggregate 내에서 비즈니스 규칙 실행의 결과로 발행되며, 다른 Aggregate나 Bounded Context에 전파.

### 실무 적용 기준
- **사용**: Aggregate 간 최종 일관성 구현, Bounded Context 간 통합, 감사 로그
- **미사용**: 단일 Aggregate 내부의 동기적 처리

### 흔한 실수
- 이벤트에 너무 많은 데이터를 포함 (ID + 최소 필요 데이터만)
- 이벤트 발행과 상태 변경의 원자성 미보장
- 기술적 이벤트(예: DB 변경 감지)와 도메인 이벤트를 혼동

---

## 9. Layered Architecture (계층 아키텍처)

### 정의 및 출처
- **출처**: Evans 원저 Chapter 4 "Isolating the Domain"
- **핵심 원칙**: 도메인 로직을 다른 관심사로부터 격리하기 위한 아키텍처 패턴

### 4계층 구조

| 계층 (위->아래) | 역할 | 의존 방향 |
|----------------|------|-----------|
| **User Interface (Presentation)** | 사용자와의 상호작용, 요청/응답 처리 | Application 호출 |
| **Application** | Use case 조율, 트랜잭션 관리. 비즈니스 규칙 포함 안 됨 | Domain 호출 |
| **Domain** | 비즈니스 로직, 도메인 모델 (Entity, VO, Service, Event) | 자기 자신만 의존 |
| **Infrastructure** | 기술적 기반 (DB, 메시징, 외부 API 통신) | 모든 계층 지원 |

### 핵심 의존성 규칙
- 상위 계층은 하위 계층에 의존 가능, 역방향 불가
- **Domain 계층은 어떤 계층에도 의존하지 않음** (핵심 원칙)
- Infrastructure가 Domain의 인터페이스를 구현 (의존성 역전)

### 실무 적용 기준
- **사용**: 도메인 로직이 복잡한 시스템에서 관심사 분리
- **미사용**: 단순 CRUD 앱에서는 과잉 설계가 될 수 있음

### 흔한 실수
- Application 계층에 비즈니스 로직 배치 (Domain으로 이동해야 함)
- Domain 계층에서 Infrastructure 직접 참조 (인터페이스로 추상화 필요)
- 계층 간 DTO 변환 없이 Domain 객체를 UI까지 노출

---

## 종합 인사이트

### 출처별 기여 정리

| 개념 | Evans 2003 | Evans 2015 Ref | Vernon IDDD 2013 | Vernon 에세이 2011 |
|------|:---:|:---:|:---:|:---:|
| Ubiquitous Language | 정의 | 정리 | 실무 사례 | - |
| Subdomain 분류 | Core Domain | - | 3분류 체계화 | - |
| Bounded Context | 정의 | 정리 | 실무 구현 | - |
| Context Map 7개 패턴 | 정의 | 정리 | 실무 구현 | - |
| Partnership + Big Ball of Mud + Domain Events | **없음** | **추가** | 구현 | - |
| Aggregate 기본 | 정의 | 정리 | 4규칙 체계화 | 3부작 에세이 |
| "ID로만 참조" 규칙 | **없음** (Root 참조 허용) | - | **정립** | **정립** |
| Entity / Value Object | 정의 | 정리 | 실무 구현 | - |
| Domain Service | 정의 | 정리 | 실무 구현 | - |
| Domain Events | **없음** | **추가** | Ch.8 체계화 | - |
| Layered Architecture | 정의 | 정리 | 실무 구현 | - |

### 특히 확인 요청된 사항 답변

1. **Context Map 패턴 수**: Evans 원저 **7개**, 2015 Reference에서 **+2개** (Partnership, Big Ball of Mud) + Domain Events(전술적 패턴) = Context Map 관련 **9개**, 전체 추가 패턴 **3개**.
2. **Partnership 패턴**: Evans 2003 원저에는 **없음**. **2015 DDD Reference에서 Evans가 추가**한 패턴.
3. **Domain Events**: Evans 2003 초판에 **없음**. 2015 DDD Reference에서 추가된 3개 패턴 중 하나.
4. **"다른 Aggregate는 ID로만 참조"**: Evans 원저에는 **없음**. Evans는 Root에 대한 직접 참조를 허용. **Vernon이 "Effective Aggregate Design" (2011)과 IDDD (2013)에서 정립**.

### 신뢰도 주의 사항

> **주의**: Evans 원저의 Context Map 패턴 수(7개)는 O'Reilly의 Chapter 14 목차 및 다수의 2차 자료에서 교차 확인한 것이나, 일부 자료에서는 Published Language를 독립 패턴이 아닌 Open Host Service의 부속으로 보아 6개로 세는 경우도 있다. 본 보고서에서는 Evans 원저와 DDD Reference 모두에서 독립 항목으로 기술된 점을 근거로 7개로 산정했다.

> **주의**: "세 번째 추가 패턴"이 Domain Events인지는 DDD Reference 서문의 "three patterns have been added" 문구와 원저 대조를 통해 추론한 것이다. Reference PDF(domainlanguage.com)를 직접 확인하여 최종 검증할 것을 권장한다.

---

## 참고 자료

### 1차 자료 (공식) - High 신뢰도
- Evans, Eric. *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley, 2003. ISBN 0-321-12521-5
- Evans, Eric. [*DDD Reference* (2015)](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) - domainlanguage.com 무료 PDF
- Vernon, Vaughn. [*Effective Aggregate Design Part I*](https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_1.pdf) - dddcommunity.org
- Vernon, Vaughn. [*Effective Aggregate Design Part II*](https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_2.pdf) - dddcommunity.org
- Vernon, Vaughn. [*Effective Aggregate Design Part III*](https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_3.pdf) - dddcommunity.org
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013. ISBN 978-0-321-83457-7
- [dddcommunity.org](https://www.dddcommunity.org/) - Evans 공인 커뮤니티
- [O'Reilly: Evans DDD Chapter 14](https://www.oreilly.com/library/view/domain-driven-design-tackling/0321125215/ch14.html) - 원저 목차 확인

### 2차 자료 (해석/분석)
- Fowler, Martin. [*Anemic Domain Model*](https://martinfowler.com/bliki/AnemicDomainModel.html) - High 신뢰도
- Fowler, Martin. [*Evans Classification*](https://martinfowler.com/bliki/EvansClassification.html) - High 신뢰도
- [InformIT: Aggregate Design Rules](https://www.informit.com/articles/article.aspx?p=2020371&seqNum=4) - High 신뢰도 (Pearson 공식)
- [ArchiLab: Aggregate Design Rules](https://www.archi-lab.io/infopages/ddd/aggregate-design-rules-vernon.html) - Medium 신뢰도
- [Wikipedia: Domain-driven design](https://en.wikipedia.org/wiki/Domain-driven_design) - Medium 신뢰도
- [DevIQ: Context Mapping](https://deviq.com/domain-driven-design/context-mapping/) - Medium 신뢰도
- [ddd-crew/context-mapping (GitHub)](https://github.com/ddd-crew/context-mapping) - Medium 신뢰도
- [*DDD - A Summary*](https://softengbook.org/articles/ddd) - softengbook.org - Medium 신뢰도
- [herbertograca: DDD.14 - Maintaining Model Integrity](https://herbertograca.com/2016/02/05/ddd-14-maintaining-model-integrity/) - Medium 신뢰도

---

*독립 리뷰: 자기평가 폴백 수행. 5개 기준 중 4개 통과, 1개(Context Map 패턴 수 신뢰도) 주의 사항으로 명시. 보완 1회 수행.*
