---
name: ddd
description: DDD(Domain-Driven Design) 아키텍처 핵심 패턴 - 유비쿼터스 언어, 서브도메인, 바운디드 컨텍스트, Aggregate, Entity/VO, 도메인 서비스/이벤트, 레이어드 아키텍처
---

# DDD (Domain-Driven Design) 아키텍처

> 소스: Eric Evans, "Domain-Driven Design: Tackling Complexity in the Heart of Software" (Addison-Wesley, 2003)
> 소스: Vaughn Vernon, "Implementing Domain-Driven Design" (Addison-Wesley, 2013)
> 소스: https://www.domainlanguage.com/ddd/reference/ (Evans DDD Reference)
> 검증일: 2026-04-17

---

## 1. 유비쿼터스 언어 (Ubiquitous Language)

도메인 전문가와 개발자가 **동일한 용어**를 사용하여 소통하는 공유 언어.

**핵심 원칙:**
- 코드, 문서, 대화 모두에서 같은 용어를 사용한다
- 모델이 변경되면 언어도 함께 변경한다
- 바운디드 컨텍스트마다 별도의 유비쿼터스 언어를 가진다
- 용어의 모호함이 발견되면 즉시 해소한다

**실천 방법:**
- 용어 사전(Glossary)을 작성하고 지속적으로 갱신
- 클래스명, 메서드명, 변수명에 도메인 용어를 그대로 사용
- 도메인 전문가가 코드의 이름을 읽고 의미를 이해할 수 있어야 함

```
// 나쁜 예: 기술 용어 중심
class DataProcessor { fn handle_record(r: Record) }

// 좋은 예: 유비쿼터스 언어 반영
class OrderFulfillment { fn ship_order(order: Order) }
```

---

## 2. 서브도메인 (Subdomain)

비즈니스 도메인을 전략적으로 분류하는 단위.

> 주의: Core Domain과 Generic Subdomain은 Evans 원저(2003) Chapter 15(Distillation)에서 명시됨. 3종 분류(Core/Supporting/Generic)의 명시적 체계화는 Vernon IDDD(2013) Chapter 2·9에서 이루어짐.

| 유형 | 설명 | 투자 수준 | 예시 |
|------|------|-----------|------|
| **Core Domain** | 비즈니스 핵심 경쟁력. 차별화 요소 | 최고 투자, 최고 인재 | 추천 알고리즘, 가격 책정 엔진 |
| **Supporting Subdomain** | Core를 지원하지만 차별화 요소는 아님 | 중간 투자 | 재고 관리, 배송 추적 |
| **Generic Subdomain** | 범용적, 어디서나 비슷한 솔루션 | 최소 투자, 외부 솔루션 활용 | 인증, 결제, 이메일 발송 |

**판단 기준:**
- "이 기능이 우리 비즈니스를 경쟁사와 구분하는가?" -> Core
- "직접 만들어야 하지만 범용적인가?" -> Supporting
- "기성 솔루션을 구매/사용할 수 있는가?" -> Generic

---

## 3. 바운디드 컨텍스트 (Bounded Context)

유비쿼터스 언어가 **일관된 의미를 가지는 명시적 경계**. 같은 용어라도 컨텍스트가 다르면 의미가 다를 수 있다.

**핵심 원칙:**
- 하나의 바운디드 컨텍스트 안에서 모델은 일관적이다
- 컨텍스트 경계를 넘는 통신에는 명시적 번역이 필요하다
- 서브도메인과 1:1 대응이 이상적이지만 필수는 아니다 (레거시에서는 N:1 가능)

```
// 주문 컨텍스트: "Product"는 이름, 가격, 수량을 가진다
mod ordering {
    struct Product { name: String, price: Money, quantity: u32 }
}

// 카탈로그 컨텍스트: "Product"는 설명, 이미지, 카테고리를 가진다
mod catalog {
    struct Product { description: String, images: Vec<Url>, category: Category }
}
```

---

## 4. 컨텍스트 맵 (Context Map)

바운디드 컨텍스트 간의 **관계를 시각화**하는 전략적 도구.

> 주의: Evans DDD Reference(2015 개정판) 기준 9가지 패턴. Partnership과 Big Ball of Mud는 Evans 원저(2003) 초판에는 명시적 패턴으로 없었으며, Evans DDD Reference(2015)에서 정식 수록됨. (출처: ddd-crew/context-mapping)

| 패턴 | 설명 | 사용 시점 |
|------|------|-----------|
| **Shared Kernel** | 두 컨텍스트가 모델 일부를 공유 | 긴밀히 협력하는 팀, 공유 비용 < 중복 비용 |
| **Customer-Supplier** | 상류(Supplier)가 하류(Customer) 요구를 수용 | 상류가 하류 니즈를 반영할 의지가 있을 때 |
| **Conformist** | 하류가 상류 모델을 그대로 수용 | 상류가 변경에 비협조적일 때 |
| **Anticorruption Layer (ACL)** | 하류가 번역 계층으로 상류 모델을 격리 | 레거시 연동, 외부 시스템 통합 |
| **Open Host Service (OHS)** | 상류가 공개 프로토콜/API를 제공 | 다수 하류 컨텍스트가 접근할 때 |
| **Published Language (PL)** | 공유 언어(JSON Schema, Protobuf 등)로 교환 | OHS와 함께 사용, 표준 포맷 필요 시 |
| **Separate Ways** | 통합하지 않고 독립적으로 구현 | 통합 비용 > 중복 비용 |
| **Partnership** | 두 팀이 동시에 조율하며 통합. 한쪽이 변경하면 다른 쪽도 함께 변경 | 두 팀의 목표가 강하게 연결될 때 |
| **Big Ball of Mud** | 경계가 없는 혼재 상태. 피해야 할 반패턴 | 현실 레거시 시스템 현황 파악 시 |

---

## 5. Aggregate와 Aggregate Root

**Aggregate**: 일관성(consistency) 경계를 형성하는 관련 객체의 클러스터.

**Aggregate Root**: Aggregate의 진입점. 외부에서 Aggregate 내부 객체에 직접 접근하지 못하게 막는다.

**핵심 규칙:**
- 외부 객체는 Aggregate Root만 참조한다
- Aggregate 내부 객체 간의 불변식(invariant)은 Root가 보장한다
- 트랜잭션 하나에서 하나의 Aggregate만 수정한다 (Evans 원칙)
- Aggregate 간 참조는 ID로만 한다 (Vernon 강조)
- Aggregate는 가능한 작게 설계한다 (Vernon 강조)

```rust
// Order가 Aggregate Root
struct Order {
    id: OrderId,
    items: Vec<OrderItem>,   // 내부 Entity
    status: OrderStatus,
}

impl Order {
    // 불변식: 주문 총액이 0 이하이면 안 됨
    pub fn add_item(&mut self, product_id: ProductId, qty: u32, price: Money) -> Result<(), OrderError> {
        let item = OrderItem::new(product_id, qty, price);
        self.items.push(item);
        self.validate_total()?;
        Ok(())
    }

    // 외부에서 OrderItem을 직접 변경할 수 없음
    pub fn items(&self) -> &[OrderItem] {
        &self.items
    }
}
```

---

## 6. Entity와 Value Object

### Entity

- **식별자(Identity)**로 구분된다
- 시간에 따라 상태가 변할 수 있다
- 같은 속성이라도 ID가 다르면 다른 객체다

```rust
struct Customer {
    id: CustomerId,       // 식별자
    name: String,         // 변경 가능
    email: Email,         // 변경 가능
}
// 두 Customer는 id가 같으면 동일 Entity
```

### Value Object

- **속성값의 조합**으로 동등성을 판단한다 (식별자 없음)
- 불변(immutable)이다
- 교체(replace)로만 변경한다

```rust
#[derive(Clone, PartialEq, Eq)]
struct Money {
    amount: u64,
    currency: Currency,
}

#[derive(Clone, PartialEq, Eq)]
struct Address {
    street: String,
    city: String,
    zip: String,
}
// 모든 필드가 같으면 동일 Value Object
```

**판단 기준:**
- "이 객체를 추적해야 하는가?" -> Entity
- "속성이 전부 같으면 같은 것인가?" -> Value Object
- 의심스러우면 Value Object로 시작 (더 단순)

---

## 7. 도메인 서비스 (Domain Service)

특정 Entity나 Value Object에 자연스럽게 속하지 않는 **도메인 로직**을 담는 무상태(stateless) 서비스.

**사용 조건 (3가지 모두 충족 시):**
1. 연산이 도메인 개념에 해당한다
2. 특정 Entity/VO에 자연스럽게 속하지 않는다
3. 연산이 무상태(stateless)다

```rust
// 도메인 서비스: 두 계좌 간 이체 로직
// -> Account 하나에 속하지 않고, 도메인 개념이며, 무상태
trait TransferService {
    fn transfer(
        &self,
        from: &mut Account,
        to: &mut Account,
        amount: Money,
    ) -> Result<(), TransferError>;
}
```

> 주의: 도메인 서비스를 남용하면 빈약한 도메인 모델(Anemic Domain Model)이 된다. Entity/VO에 로직을 넣을 수 있다면 그쪽이 우선이다.

---

## 8. 도메인 이벤트 (Domain Events)

도메인에서 발생한 **의미 있는 사건**을 표현하는 객체. 과거형으로 명명한다.

**출처 구분:**
- Evans 원저(2003): 이벤트 개념을 언급했으나 전술적 패턴으로 공식화하지는 않음
- Udi Dahan(2008): 도메인 이벤트 패턴을 실질적으로 제안
- Vernon IDDD(2013): 도메인 이벤트를 DDD 전술적 패턴으로 체계화
- Evans DDD Reference(2015 개정): Domain Events를 공식 전술 패턴으로 추가

**핵심 원칙:**
- 이벤트는 불변이다 (발생한 사실은 변경되지 않는다)
- 과거형으로 명명: `OrderPlaced`, `PaymentCompleted`, `ItemShipped`
- 이벤트에는 발생 시점의 필요한 데이터를 포함한다
- Aggregate 간 결과적 일관성(eventual consistency)을 달성하는 수단

```rust
struct OrderPlaced {
    order_id: OrderId,
    customer_id: CustomerId,
    items: Vec<OrderItemSnapshot>,
    total: Money,
    occurred_at: DateTime<Utc>,
}

// Aggregate 내에서 이벤트 발행
impl Order {
    pub fn place(/* ... */) -> (Self, OrderPlaced) {
        let order = Order { /* ... */ };
        let event = OrderPlaced { /* ... */ };
        (order, event)
    }
}
```

---

## 9. 레이어드 아키텍처 (Layered Architecture)

Evans가 제시한 4계층 구조. 핵심 원칙: **의존성은 위에서 아래로만** 흐른다.

```
┌─────────────────────────────────┐
│  User Interface (Presentation)  │  ← API 핸들러, DTO, 직렬화
├─────────────────────────────────┤
│  Application                    │  ← 유스케이스 오케스트레이션, 트랜잭션
├─────────────────────────────────┤
│  Domain                         │  ← Entity, VO, Aggregate, Domain Service
├─────────────────────────────────┤
│  Infrastructure                 │  ← DB, 외부 API, 메시징, 프레임워크
└─────────────────────────────────┘
```

| 계층 | 책임 | 포함 요소 |
|------|------|-----------|
| **User Interface** | 사용자 요청 수신, 응답 반환 | Controller, Handler, DTO, Serializer |
| **Application** | 유스케이스 조합, 흐름 제어 | Application Service, Command/Query Handler |
| **Domain** | 비즈니스 규칙, 불변식 | Entity, VO, Aggregate, Domain Service, Domain Event |
| **Infrastructure** | 기술적 구현 | Repository 구현체, DB 클라이언트, 메시지 브로커 |

**의존성 규칙:**
- Domain 계층은 다른 어떤 계층에도 의존하지 않는다 (가장 안쪽)
- Application은 Domain에만 의존한다
- Infrastructure는 Domain의 인터페이스(trait/interface)를 구현한다 (의존성 역전)
- User Interface는 Application을 호출한다

```
// 폴더 구조 예시
src/
├── presentation/     # User Interface 계층
│   ├── handlers/
│   └── dto/
├── application/      # Application 계층
│   ├── commands/
│   └── queries/
├── domain/           # Domain 계층
│   ├── models/
│   ├── services/
│   └── events/
└── infrastructure/   # Infrastructure 계층
    ├── persistence/
    └── external/
```

---

## 언제 DDD를 적용하는가

**적합한 경우:**
- 복잡한 비즈니스 로직이 존재하는 시스템
- 도메인 전문가와의 긴밀한 협업이 가능한 환경
- 장기적으로 유지보수·확장이 필요한 시스템

**적합하지 않은 경우:**
- 단순 CRUD 애플리케이션
- 도메인 전문가에 접근할 수 없는 경우
- 프로토타입이나 단기 프로젝트
- 기술적 복잡성만 있고 비즈니스 복잡성이 낮은 경우

---

## 흔한 실수

| 실수 | 올바른 접근 |
|------|------------|
| 모든 프로젝트에 DDD 적용 | Core Domain에만 전술적 패턴 적용, Generic은 단순하게 |
| Aggregate를 크게 설계 | 작은 Aggregate + 도메인 이벤트로 결과적 일관성 |
| Entity에 로직 없이 getter/setter만 | 비즈니스 로직을 Entity/VO 안에 캡슐화 (Rich Domain Model) |
| 바운디드 컨텍스트 무시하고 공유 모델 사용 | 컨텍스트별 독립 모델, ACL로 번역 |
| 도메인 서비스 남용 | Entity/VO에 로직을 먼저 배치, 서비스는 최후 수단 |
| 기술적 관심사가 Domain 계층에 침투 | Domain 계층은 프레임워크/DB 무관하게 순수 비즈니스 로직만 |
